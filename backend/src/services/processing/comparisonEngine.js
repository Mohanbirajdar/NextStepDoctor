import { generateResponse } from '../llm/llmRouter.js';
import { COMPARISON_PROMPT } from '../llm/prompts.js';
import * as retrievalOrchestrator from '../retrieval/retrievalOrchestrator.js';
import { rankAll } from './rankingService.js';
import { expandQuery } from './queryExpander.js';
import { logger } from '../../utils/logger.js';

export async function compareTreatments({ disease, treatments, context }) {
  logger.info(`Comparing treatments: ${treatments.join(' vs ')}`);

  // Run retrieval for each treatment in parallel
  const results = await Promise.all(
    treatments.slice(0, 2).map(async (treatment) => {
      const expanded = await expandQuery({
        disease,
        query: treatment,
        intentType: 'treatment',
        intentQuery: treatment,
      });
      const raw = await retrievalOrchestrator.fetchAll(expanded, { ...context, query: treatment });
      const ranked = rankAll(raw, expanded, treatment, { ...context, treatment });
      return { treatment, ranked, expanded };
    }),
  );

  const formatResearch = (r) => r.ranked.publications
    .slice(0, 4)
    .map((p) => `- "${p.title}" (${p.year || 'N/A'}) - ${p.abstract?.substring(0, 150)}...`)
    .join('\n');

  const comparisonPrompt = COMPARISON_PROMPT
    .replace('TREATMENT_A', treatments[0])
    .replace('TREATMENT_B', treatments[1]);

  const userPrompt = `Treatment A: ${treatments[0]}
Research:
${formatResearch(results[0])}

Treatment B: ${treatments[1]}
Research:
${formatResearch(results[1])}

Generate the comparison.`;

  const comparison = await generateResponse(comparisonPrompt, userPrompt, { maxTokens: 1024 });

  return {
    treatments,
    comparison,
    individualResults: results.map((r) => ({
      treatment: r.treatment,
      publications: r.ranked.publications,
      trials: r.ranked.trials,
    })),
  };
}
