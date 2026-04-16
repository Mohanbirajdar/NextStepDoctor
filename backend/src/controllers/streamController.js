import { expandQuery } from '../services/processing/queryExpander.js';
import { fetchAll } from '../services/retrieval/retrievalOrchestrator.js';
import { rankAll } from '../services/processing/rankingService.js';
import { generateResponse } from '../services/llm/llmRouter.js';
import { MAIN_RESEARCH_PROMPT } from '../services/llm/prompts.js';
import { parseStructured, buildLLMUserPrompt } from '../services/processing/responseFormatter.js';
import { calculateConfidence } from '../services/processing/confidenceCalculator.js';
import { aggregateAnalytics } from '../services/processing/analyticsAggregator.js';
import { generateFollowUps } from '../services/processing/followUpGenerator.js';
import * as contextManager from '../services/contextManager.js';
import { logger } from '../utils/logger.js';

/**
 * Extract the medical condition/disease from a natural language message.
 * Uses keyword heuristics first, then falls back to a quick LLM call.
 * This prevents stale context.disease from a previous query polluting new ones.
 */
function extractDiseaseFromMessage(message) {
  const text = message.toLowerCase();

  // Common patterns: "for X", "about X", "treatment of X", "X treatment/trial/research"
  const patterns = [
    /(?:treatment|therapy|cure|studies?|research|trials?|diagnosis)\s+(?:for|of|on|about)\s+([a-z][a-z\s\-']{2,40}?)(?:\s*[,\.\?]|$)/i,
    /(?:for|about|on)\s+([a-z][a-z\s\-']{2,40}?)(?:\s+(?:treatment|therapy|trial|research|study|disease|condition|cancer|disorder|syndrome))/i,
    /([a-z][a-z\s\-']{2,35}?)\s+(?:treatment|therapy|trials?|research|studies?|symptoms?|diagnosis|cure)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/^(the|a|an)\s+/i, '');
      if (candidate.length > 2 && candidate.length < 50) {
        return candidate;
      }
    }
  }
  return null;
}

/**
 * Resolve the working context for this request:
 * 1. If context.disease is explicitly provided (structured form), use it.
 * 2. Otherwise extract disease from the message text.
 * 3. Falls back to using the message itself as the disease query.
 */
function resolveContext(message, context) {
  const resolved = { ...context };

  if (!resolved.disease || resolved.disease.trim() === '') {
    const extracted = extractDiseaseFromMessage(message);
    if (extracted) {
      logger.info(`Auto-extracted disease: "${extracted}" from message`);
      resolved.disease = extracted;
    } else {
      // Use the full message as the disease context so retrieval is anchored to it
      resolved.disease = message;
    }
  }

  return resolved;
}

export async function streamChat(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const emit = (event) => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (e) {
      logger.warn('SSE write failed', e.message);
    }
  };

  const startTime = Date.now();

  try {
    const { conversationId, message, context: rawContext = {}, mode = 'research' } = req.body;

    if (!message || !message.trim()) {
      emit({ stage: 'error', message: 'Message is required' });
      return res.end();
    }

    // ── Resolve the working context (extract disease from message when not provided) ──
    const context = resolveContext(message.trim(), rawContext);
    logger.info(`Pipeline context → disease: "${context.disease}", query: "${message}"`);

    // ── Get or create conversation ──
    const conversation = await contextManager.getOrCreateConversation(
      conversationId,
      context,
      message,
    );
    const convId = conversation._id.toString();

    await contextManager.saveMessage(convId, { role: 'user', content: message });
    const history = await contextManager.getConversationHistory(convId);

    // ── Stage 1: Query Expansion ──
    emit({ stage: 'query_expansion', status: 'running', message: '⚡ Expanding query for broader coverage...' });
    const t1 = Date.now();
    const expandedQueries = await expandQuery({
      disease: context.disease,
      query: message,
    });
    logger.info(`Expanded queries: ${expandedQueries.join(' | ')}`);
    emit({
      stage: 'query_expansion',
      status: 'complete',
      data: { expandedQueries },
      timeMs: Date.now() - t1,
    });

    // ── Stage 2: Parallel Retrieval ──
    emit({ stage: 'retrieval_started', status: 'running', message: '🔍 Fetching from 3 research sources...' });
    const t2 = Date.now();
    const results = await fetchAll(expandedQueries, context);
    emit({
      stage: 'retrieval_complete',
      status: 'complete',
      data: {
        openAlex: results.stats.openAlex.count,
        pubmed: results.stats.pubmed.count,
        clinicalTrials: results.stats.clinicalTrials.count,
        total: results.totalCount,
      },
      timeMs: Date.now() - t2,
    });

    // ── Stage 3: Ranking ──
    emit({ stage: 'ranking', status: 'running', message: '🎯 Ranking and scoring results...' });
    const t3 = Date.now();
    const ranked = rankAll(results, expandedQueries, message);
    emit({
      stage: 'ranking',
      status: 'complete',
      data: {
        topPublications: ranked.publications.length,
        topTrials: ranked.trials.length,
        topScore: ranked.publications[0]?.score,
      },
      timeMs: Date.now() - t3,
    });

    // ── Stage 4: LLM Reasoning ──
    emit({ stage: 'llm_reasoning', status: 'running', message: '🧠 Generating structured insights...' });
    const t4 = Date.now();
    const userPrompt = buildLLMUserPrompt({ context, message, ranked, conversationHistory: history });
    const llmResponse = await generateResponse(MAIN_RESEARCH_PROMPT, userPrompt, { maxTokens: 2048 });
    const structured = parseStructured(llmResponse);
    emit({ stage: 'llm_reasoning', status: 'complete', timeMs: Date.now() - t4 });

    // ── Stage 5: Analytics + Confidence + Follow-ups ──
    emit({ stage: 'analytics_building', status: 'running', message: '📊 Building analytics...' });
    const analytics = aggregateAnalytics(results);
    const confidence = calculateConfidence(ranked);
    const followUps = await generateFollowUps({ context, message, llmResponse });
    emit({ stage: 'analytics_building', status: 'complete' });

    // ── Save assistant message ──
    const assistantMsg = {
      role: 'assistant',
      content: llmResponse,
      structured,
      publications: ranked.publications,
      clinicalTrials: ranked.trials,
      confidence,
      analytics,
      followUps,
      transparency: {
        queryExpansions: expandedQueries,
        retrievalStats: results.stats,
        totalRetrieved: results.totalCount,
        afterFiltering: ranked.publications.length + ranked.trials.length,
        topScore: ranked.publications[0]?.score || 0,
        model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
        totalTimeMs: Date.now() - startTime,
      },
    };

    await contextManager.saveMessage(convId, assistantMsg);

    emit({
      stage: 'complete',
      data: {
        conversationId: convId,
        message: assistantMsg,
      },
    });

    res.end();
  } catch (error) {
    logger.error('Stream error', error);
    emit({ stage: 'error', message: error.message || 'Pipeline failed' });
    res.end();
  }
}
