import { RANKING_WEIGHTS, MAX_PUBLICATIONS, MAX_TRIALS } from '../../config/constants.js';
import { assessTrialEligibility } from './trialEligibility.js';

const CURRENT_YEAR = new Date().getFullYear();

// Common stop words to exclude from query term extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'how', 'when',
  'show', 'tell', 'give', 'find', 'latest', 'recent', 'new', 'best',
  'more', 'most', 'some', 'any', 'all', 'me', 'my', 'can', 'i',
]);

/**
 * Extract meaningful query terms from expanded queries + original message.
 * Longer, disease-specific terms are weighted more than generic words.
 */
function extractQueryTerms(expandedQueries, originalMessage = '', context = {}) {
  const ctxText = [
    context?.intentQuery,
    context?.intentType,
    context?.location,
    context?.drug,
    context?.treatment,
  ].filter(Boolean).join(' ');

  const allText = [...expandedQueries, originalMessage, ctxText].join(' ');
  return allText
    .toLowerCase()
    .split(/[\s,\.;:\-\(\)]+/)
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t))
    .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe
}

export function scorePublication(pub, queryTerms, context = {}) {
  const text = `${pub.title || ''} ${pub.abstract || ''}`.toLowerCase();

  // Count term hits — longer terms get a bonus (more specific = more relevant)
  let termHitScore = 0;
  let maxScore = 0;
  for (const term of queryTerms) {
    const weight = Math.min(1, term.length / 8); // longer terms weighted higher
    maxScore += weight;
    if (text.includes(term)) termHitScore += weight;
  }

  const scores = {
    relevance: maxScore > 0 ? termHitScore / maxScore : 0.5,
    recency: pub.year ? Math.max(0, 1 - (CURRENT_YEAR - pub.year) / 10) : 0.3,
    citations: Math.min(1, (pub.citations || 0) / 500),
    sourceCredibility: pub.source === 'PubMed' ? 0.9 : 0.7,
  };

  let finalScore = Object.keys(scores).reduce(
    (sum, key) => sum + scores[key] * RANKING_WEIGHTS[key],
    0,
  );

  // Context boosts: intent terms, drug/treatment keywords, location, age
  const ctxBoostTerms = [
    context?.intentQuery,
    context?.drug,
    context?.treatment,
    context?.intentType,
  ].filter(Boolean).map((t) => t.toLowerCase());

  const location = (context?.location || '').toLowerCase();
  const age = context?.patientAge ? String(context.patientAge).toLowerCase() : '';

  let contextBoost = 0;
  ctxBoostTerms.forEach((t) => { if (t && text.includes(t)) contextBoost += 0.03; });
  if (location && text.includes(location)) contextBoost += 0.03;
  if (age && text.includes(age)) contextBoost += 0.01;

  finalScore = Math.min(1, finalScore + contextBoost);

  return {
    ...pub,
    score: Math.round(finalScore * 100) / 100,
    scoreBreakdown: scores,
    weights: RANKING_WEIGHTS,
  };
}

export function scoreTrial(trial, queryTerms, context = {}) {
  const text = `${trial.title || ''} ${trial.eligibility || ''}`.toLowerCase();

  let termHitScore = 0;
  let maxScore = 0;
  for (const term of queryTerms) {
    const weight = Math.min(1, term.length / 8);
    maxScore += weight;
    if (text.includes(term)) termHitScore += weight;
  }

  const relevance = maxScore > 0 ? termHitScore / maxScore : 0.5;
  const statusBonus =
    trial.status === 'RECRUITING' ? 0.25 :
    trial.status === 'ACTIVE_NOT_RECRUITING' ? 0.15 : 0.05;

  const location = (context?.location || '').toLowerCase();
  const locationHit = location
    ? (trial.locations || []).some((l) => l?.toLowerCase().includes(location))
    : false;

  const ctxBoost = locationHit ? 0.15 : 0;

  return {
    ...trial,
    score: Math.round((relevance * 0.75 + statusBonus + ctxBoost) * 100) / 100,
    eligibilityAssessment: assessTrialEligibility(trial, context),
  };
}

/**
 * @param {object} results - { publications: [], trials: [] }
 * @param {string[]} expandedQueries - LLM-expanded queries
 * @param {string} originalMessage - The user's original message (used to anchor term extraction)
 */
export function rankAll(results, expandedQueries, originalMessage = '', context = {}) {
  const queryTerms = extractQueryTerms(expandedQueries, originalMessage, context);
  const uniqueTerms = [...new Set(queryTerms)];

  const rankedPublications = results.publications
    .map((p) => scorePublication(p, uniqueTerms, context))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PUBLICATIONS);

  const rankedTrials = results.trials
    .map((t) => scoreTrial(t, uniqueTerms, context))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_TRIALS);

  return {
    publications: rankedPublications,
    trials: rankedTrials,
  };
}
