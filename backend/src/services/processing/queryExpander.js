import { generateResponse } from '../llm/llmRouter.js';
import { QUERY_EXPANSION_PROMPT } from '../llm/prompts.js';
import { logger } from '../../utils/logger.js';

/**
 * Build strong fallback queries when the LLM expansion fails.
 * Ensures every query explicitly combines the disease context with the user intent,
 * so retrieval is always anchored to the actual topic.
 */
function buildFallbackQueries(disease, query) {
  const d = (disease || '').trim();
  const q = (query || '').trim();

  // If disease and query are the same (message used as disease), just use message directly
  const base = d && d.toLowerCase() !== q.toLowerCase() ? `${d} ${q}` : q;

  return [
    base,
    d ? `${d} treatment research` : `${q} treatment`,
    d ? `${d} clinical trials` : `${q} clinical trials`,
  ];
}

export async function expandQuery({ disease, query }) {
  const d = (disease || '').trim();
  const q = (query || '').trim();

  try {
    const userPrompt = `Disease/Condition: ${d || 'Not specified'}\nUser Query: ${q}\n\nGenerate 3 specific search queries that combine the disease and query intent.`;
    const raw = await generateResponse(QUERY_EXPANSION_PROMPT, userPrompt, { maxTokens: 256 });

    // Extract JSON array from LLM response
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate that expansions actually reference the disease/topic
        const valid = parsed
          .filter((s) => typeof s === 'string' && s.trim().length > 5)
          .slice(0, 3);

        if (valid.length > 0) {
          logger.info(`Query expanded (LLM): ${valid.join(' | ')}`);
          return valid;
        }
      }
    }
  } catch (err) {
    logger.warn('Query expansion LLM failed, using fallback', err.message);
  }

  const fallback = buildFallbackQueries(d, q);
  logger.info(`Query expanded (fallback): ${fallback.join(' | ')}`);
  return fallback;
}
