import axios from 'axios';
import { OPENALEX_BASE, RETRIEVAL_LIMIT } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

function invertedIndexToText(idx) {
  if (!idx) return '';
  const words = [];
  Object.entries(idx).forEach(([word, positions]) => {
    positions.forEach((pos) => { words[pos] = word; });
  });
  return words.filter(Boolean).join(' ');
}

function normalizeWork(work) {
  return {
    id: work.id,
    title: work.title || 'Untitled',
    authors: (work.authorships || []).map((a) => a.author?.display_name).filter(Boolean),
    year: work.publication_year,
    abstract: invertedIndexToText(work.abstract_inverted_index),
    source: 'OpenAlex',
    url: work.doi ? `https://doi.org/${work.doi}` : work.id,
    citations: work.cited_by_count || 0,
    journal: work.primary_location?.source?.display_name || '',
    institution: (work.authorships || [])[0]?.institutions?.[0]?.display_name || '',
  };
}

export async function searchOpenAlex(query, options = {}) {
  const perPage = options.perPage || RETRIEVAL_LIMIT;
  try {
    const res = await axios.get(`${OPENALEX_BASE}/works`, {
      params: {
        search: query,
        per_page: perPage,
        select: 'id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,doi,primary_location',
        mailto: 'nextstep@medical.ai',
        sort: 'relevance_score:desc',
      },
      timeout: 10000,
    });
    return (res.data?.results || []).map(normalizeWork);
  } catch (err) {
    logger.warn(`OpenAlex search failed for "${query}": ${err.message}`);
    return [];
  }
}

export async function searchMultiple(queries, options = {}) {
  const results = await Promise.allSettled(queries.map((q) => searchOpenAlex(q, options)));
  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  // Deduplicate by id
  const seen = new Set();
  return all.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
