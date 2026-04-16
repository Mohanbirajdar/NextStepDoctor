import axios from 'axios';
import { logger } from '../../utils/logger.js';

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
const HF_BASE = 'https://api-inference.huggingface.co/models';

export async function generateWithHuggingFace(systemPrompt, userPrompt) {
  if (!process.env.HUGGINGFACE_API_KEY) throw new Error('No HuggingFace API key');

  const prompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;

  const response = await axios.post(
    `${HF_BASE}/${HF_MODEL}`,
    { inputs: prompt, parameters: { max_new_tokens: 1024, temperature: 0.3 } },
    { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }, timeout: 60000 }
  );

  if (Array.isArray(response.data)) {
    return response.data[0]?.generated_text?.replace(prompt, '').trim() || '';
  }
  return response.data?.generated_text || '';
}
