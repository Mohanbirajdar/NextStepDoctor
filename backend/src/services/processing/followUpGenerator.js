import { generateResponse } from '../llm/llmRouter.js';
import { FOLLOW_UP_PROMPT } from '../llm/prompts.js';
import { logger } from '../../utils/logger.js';

const DEFAULT_FOLLOWUPS = [
  { icon: '🧪', label: 'Show latest trials', action: 'Show me the latest clinical trials for this condition' },
  { icon: '⚠️', label: 'Side effects?', action: 'What are the common side effects of these treatments?' },
  { icon: '🏥', label: 'Best hospitals', action: 'What are the best hospitals for treating this condition?' },
  { icon: '📊', label: 'Compare alternatives', action: 'Compare alternative treatments for this condition' },
];

export async function generateFollowUps({ context, message, llmResponse }) {
  try {
    const userPrompt = `Disease: ${context?.disease || 'general condition'}
Query: ${message}
Response summary: ${llmResponse?.substring(0, 400)}`;

    const raw = await generateResponse(FOLLOW_UP_PROMPT, userPrompt, { maxTokens: 300 });
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 4);
      }
    }
  } catch (err) {
    logger.warn('Follow-up generation failed, using defaults', err.message);
  }
  return DEFAULT_FOLLOWUPS;
}
