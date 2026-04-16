import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PUBMED_BASE, RETRIEVAL_LIMIT } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) => ['PubmedArticle', 'Author', 'AbstractText'].includes(name),
});

async function fetchIds(query, retmax = RETRIEVAL_LIMIT) {
  const res = await axios.get(`${PUBMED_BASE}/esearch.fcgi`, {
    params: {
      db: 'pubmed',
      term: query,
      retmax,
      retmode: 'json',
      sort: 'relevance',
      ...(process.env.PUBMED_API_KEY ? { api_key: process.env.PUBMED_API_KEY } : {}),
    },
    timeout: 10000,
  });
  return res.data?.esearchresult?.idlist || [];
}

async function fetchDetails(ids) {
  if (!ids.length) return [];
  const res = await axios.get(`${PUBMED_BASE}/efetch.fcgi`, {
    params: {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
      ...(process.env.PUBMED_API_KEY ? { api_key: process.env.PUBMED_API_KEY } : {}),
    },
    timeout: 15000,
  });

  const parsed = parser.parse(res.data);
  const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];

  return articles.map((article) => {
    const citation = article?.MedlineCitation;
    const articleData = citation?.Article || {};
    const journal = articleData?.Journal || {};
    const abstract = articleData?.Abstract?.AbstractText;

    let abstractText = '';
    if (Array.isArray(abstract)) {
      abstractText = abstract.map((a) => (typeof a === 'string' ? a : a?.['#text'] || '')).join(' ');
    } else if (typeof abstract === 'string') {
      abstractText = abstract;
    }

    const authors = (articleData?.AuthorList?.Author || []).map((a) => {
      if (typeof a === 'string') return a;
      return `${a.LastName || ''} ${a.ForeName || a.Initials || ''}`.trim();
    }).filter(Boolean);

    const pmid = citation?.PMID?.['#text'] || citation?.PMID || '';
    const year = journal?.JournalIssue?.PubDate?.Year
      || journal?.JournalIssue?.PubDate?.MedlineDate?.substring(0, 4)
      || null;

    return {
      id: `pubmed-${pmid}`,
      title: articleData?.ArticleTitle || 'Untitled',
      authors,
      year: year ? parseInt(year, 10) : null,
      abstract: abstractText,
      source: 'PubMed',
      url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : '',
      citations: 0,
      journal: journal?.Title || '',
      institution: '',
    };
  });
}

export async function searchPubMed(query, options = {}) {
  try {
    const ids = await fetchIds(query, options.retmax || RETRIEVAL_LIMIT);
    if (!ids.length) return [];
    await new Promise((r) => setTimeout(r, 350)); // PubMed rate limit
    return await fetchDetails(ids.slice(0, 20));
  } catch (err) {
    logger.warn(`PubMed search failed for "${query}": ${err.message}`);
    return [];
  }
}

export async function searchMultiple(queries, options = {}) {
  const results = [];
  for (const q of queries) {
    const r = await searchPubMed(q, options);
    results.push(...r);
    await new Promise((res) => setTimeout(res, 350));
  }
  const seen = new Set();
  return results.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
