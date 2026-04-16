import axios from 'axios';
import { CLINICAL_TRIALS_BASE } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

// Simple city-to-coordinates map for common cities
const CITY_COORDS = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
};

function geocodeCity(location) {
  if (!location) return null;
  const key = location.toLowerCase().split(',')[0].trim();
  return CITY_COORDS[key] || null;
}

function normalizeTrial(study) {
  const proto = study?.protocolSection || {};
  const id = proto?.identificationModule;
  const status = proto?.statusModule;
  const desc = proto?.descriptionModule;
  const eligibility = proto?.eligibilityModule;
  const contacts = proto?.contactsLocationsModule;
  const design = proto?.designModule;

  const locations = (contacts?.locations || [])
    .map((l) => [l.city, l.country].filter(Boolean).join(', '))
    .slice(0, 3);

  const contactList = (contacts?.centralContacts || [])
    .map((c) => `${c.name || ''} (${c.phone || c.email || ''})`)
    .filter(Boolean)
    .slice(0, 2);

  return {
    id: id?.nctId || '',
    nctId: id?.nctId || '',
    title: id?.briefTitle || 'Untitled Trial',
    status: status?.overallStatus || 'Unknown',
    eligibility: eligibility?.eligibilityCriteria?.substring(0, 300) || '',
    locations,
    contacts: contactList,
    url: id?.nctId ? `https://clinicaltrials.gov/study/${id.nctId}` : '',
    phase: (design?.phases || []).join(', ') || 'N/A',
    startDate: status?.startDateStruct?.date || '',
    source: 'ClinicalTrials',
    score: 0,
  };
}

export async function searchClinicalTrials(disease, query, options = {}) {
  try {
    const d = (disease || '').trim();
    const q = (query || '').trim();

    // Build condition query: if disease and query differ, search for both
    // This ensures "deep brain stimulation for Parkinson's" finds Parkinson's trials
    // and "diabetes clinical trials" finds diabetes trials, not lung cancer
    const condQuery = d && d.toLowerCase() !== q.toLowerCase() ? d : q;
    // Intervention/keyword query: use full message for best recall
    const intrQuery = d && d.toLowerCase() !== q.toLowerCase()
      ? q
      : q;

    const params = {
      'query.cond': condQuery,
      'query.term': intrQuery,    // broader term search catches more relevant trials
      pageSize: options.pageSize || 20,
      format: 'json',
      fields: 'protocolSection',
    };

    if (options.location) {
      const coords = geocodeCity(options.location);
      if (coords) {
        params['filter.geo'] = `distance(${coords.lat},${coords.lng},200mi)`;
      }
    }

    const res = await axios.get(`${CLINICAL_TRIALS_BASE}/studies`, {
      params,
      timeout: 10000,
    });

    return (res.data?.studies || []).map(normalizeTrial);
  } catch (err) {
    logger.warn(`ClinicalTrials search failed: ${err.message}`);
    return [];
  }
}
