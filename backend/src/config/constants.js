export const OPENALEX_BASE = 'https://api.openalex.org';
export const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
export const CLINICAL_TRIALS_BASE = 'https://clinicaltrials.gov/api/v2';

export const LLM_MODELS = {
  groq: 'llama-3.1-8b-instant',
  huggingface: 'mistralai/Mistral-7B-Instruct-v0.3',
};

export const RANKING_WEIGHTS = {
  relevance: 0.40,
  recency: 0.30,
  citations: 0.20,
  sourceCredibility: 0.10,
};

export const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);
export const MAX_PUBLICATIONS = 8;
export const MAX_TRIALS = 6;
export const RETRIEVAL_LIMIT = 50;
