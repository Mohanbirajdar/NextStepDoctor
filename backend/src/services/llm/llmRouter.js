import { generateWithGroq } from './groqService.js';
import { generateWithHuggingFace } from './huggingfaceService.js';
import { logger } from '../../utils/logger.js';

export async function generateResponse(systemPrompt, userPrompt, options = {}) {
  // Try Groq first
  try {
    logger.info('LLM: Attempting Groq...');
    const result = await generateWithGroq(systemPrompt, userPrompt, options);
    logger.info('LLM: Groq succeeded');
    return result;
  } catch (err) {
    logger.warn('LLM: Groq failed, trying HuggingFace fallback', err.message);
  }

  // Fallback to HuggingFace
  try {
    const result = await generateWithHuggingFace(systemPrompt, userPrompt);
    logger.info('LLM: HuggingFace succeeded');
    return result;
  } catch (err) {
    logger.error('LLM: All providers failed', err.message);
    throw new Error('All LLM providers failed');
  }
}
