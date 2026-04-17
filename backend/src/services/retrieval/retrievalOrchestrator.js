import * as openAlexService from './openAlexService.js';
import * as pubmedService from './pubmedService.js';
import { searchClinicalTrials } from './clinicalTrialsService.js';
import { fetchFDADrugInfo } from './fdaDrugService.js';
import { logger } from '../../utils/logger.js';

export async function fetchAll(expandedQueries, context = {}) {
  const { disease, location, drug } = context;
  const primaryQuery = expandedQueries[0] || '';

  logger.info(`Retrieval: Fetching from 3 sources for: ${primaryQuery}`);
  const t = Date.now();

  const [openAlexRes, pubmedRes, trialsRes, fdaRes] = await Promise.allSettled([
    openAlexService.searchMultiple(expandedQueries, { perPage: 30 }),
    pubmedService.searchMultiple(expandedQueries.slice(0, 2), { retmax: 30 }),
    searchClinicalTrials(disease, primaryQuery, { pageSize: 20, location }),
    drug ? fetchFDADrugInfo(drug) : Promise.resolve([]),
  ]);

  const openAlex = openAlexRes.status === 'fulfilled' ? openAlexRes.value : [];
  const pubmed = pubmedRes.status === 'fulfilled' ? pubmedRes.value : [];
  const trials = trialsRes.status === 'fulfilled' ? trialsRes.value : [];

  const fda = fdaRes.status === 'fulfilled' ? fdaRes.value : [];

  const stats = {
    openAlex: { count: openAlex.length, timeMs: Date.now() - t },
    pubmed: { count: pubmed.length, timeMs: Date.now() - t },
    clinicalTrials: { count: trials.length, timeMs: Date.now() - t },
    fda: { count: fda.length, timeMs: Date.now() - t },
  };

  const totalCount = openAlex.length + pubmed.length + trials.length;
  logger.info(`Retrieval: ${totalCount} total (OA:${openAlex.length}, PM:${pubmed.length}, CT:${trials.length})`);

  return {
    publications: [...openAlex, ...pubmed],
    trials,
    fdaDrugData: fda,
    stats,
    totalCount,
  };
}
