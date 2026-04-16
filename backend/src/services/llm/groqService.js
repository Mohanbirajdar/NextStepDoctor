import Groq from 'groq-sdk';
import { logger } from '../../utils/logger.js';

let _client = null;
function getClient() {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _client;
}

export async function generateWithGroq(systemPrompt, userPrompt, options = {}) {
  const client = getClient();
  const model = options.model || process.env.LLM_MODEL || 'llama-3.1-8b-instant';
  const maxTokens = options.maxTokens || 2048;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: options.temperature || 0.3,
  });

  return response.choices[0]?.message?.content || '';
}
