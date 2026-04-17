import axios from 'axios';
import { logger } from '../../utils/logger.js';

const FDA_BASE = 'https://api.fda.gov/drug/label.json';

function normalizeDrugLabel(result = {}) {
  const openfda = result.openfda || {};
  return {
    brandName: (openfda.brand_name || [])[0] || '',
    genericName: (openfda.generic_name || [])[0] || '',
    manufacturer: (openfda.manufacturer_name || [])[0] || '',
    indications: (result.indications_and_usage || [])[0] || '',
    warnings: (result.warnings || result.boxed_warning || [])[0] || '',
    contraindications: (result.contraindications || [])[0] || '',
    adverseReactions: (result.adverse_reactions || [])[0] || '',
    drugInteractions: (result.drug_interactions || [])[0] || '',
    source: 'FDA Label',
  };
}

export async function fetchFDADrugInfo(drugName = '') {
  if (!drugName || !drugName.trim()) return [];
  try {
    const q = drugName.trim().toLowerCase();
    const search = `openfda.brand_name:"${q}"+OR+openfda.generic_name:"${q}"`;

    const res = await axios.get(FDA_BASE, {
      params: { search, limit: 3 },
      timeout: 10000,
    });

    const results = res.data?.results || [];
    return results.map(normalizeDrugLabel).filter((d) => d.brandName || d.genericName);
  } catch (err) {
    logger.warn(`FDA drug lookup failed: ${err.message}`);
    return [];
  }
}