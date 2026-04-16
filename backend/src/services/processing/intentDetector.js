import { logger } from '../../utils/logger.js';

const INTENT_KEYWORDS = {
  treatment: ['treatment', 'therapy', 'drug', 'medication', 'procedure', 'surgery', 'dose', 'side effects', 'adverse', 'efficacy', 'compare'],
  diagnosis: ['diagnosis', 'diagnose', 'symptoms', 'signs', 'test', 'screening', 'biomarker', 'imaging'],
  trials: ['trial', 'clinical trial', 'recruiting', 'phase', 'study participation', 'eligibility'],
  researchers: ['researcher', 'author', 'scientist', 'lab', 'institute', 'top researchers', 'experts'],
  recent_studies: ['recent', 'latest', 'new', '2024', '2025', '2026', 'studies', 'papers', 'publications'],
};

function scoreIntent(text, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += kw.length > 6 ? 2 : 1;
  }
  return score;
}

export function detectIntentType({ message = '', intentQuery = '' } = {}) {
  const text = `${message} ${intentQuery}`.toLowerCase();
  if (!text.trim()) return { type: 'general', confidence: 0 };

  let best = { type: 'general', score: 0 };
  Object.entries(INTENT_KEYWORDS).forEach(([type, keywords]) => {
    const score = scoreIntent(text, keywords);
    if (score > best.score) best = { type, score };
  });

  const confidence = Math.min(1, best.score / 6);
  if (best.score === 0) return { type: 'general', confidence: 0.2 };

  logger.info(`Intent detected: ${best.type} (score=${best.score})`);
  return { type: best.type, confidence };
}
