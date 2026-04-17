function parseAgeToYears(value = '') {
  if (!value) return null;
  if (typeof value === 'number') return value;
  const text = String(value).toLowerCase();
  const match = text.match(/(\d+)\s*(year|years|month|months|day|days)/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  if (unit.startsWith('month')) return num / 12;
  if (unit.startsWith('day')) return num / 365;
  return num;
}

function normalizeList(value = '') {
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/)
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v.length > 2);
}

export function assessTrialEligibility(trial = {}, context = {}) {
  const reasons = [];
  const sex = (context.sex || '').toLowerCase();
  const age = context.patientAge ? parseFloat(context.patientAge) : null;

  const minAge = parseAgeToYears(trial.minimumAge);
  const maxAge = parseAgeToYears(trial.maximumAge);
  const genderReq = (trial.gender || 'All').toLowerCase();

  let hasCheck = false;

  if (age != null && !Number.isNaN(age) && (minAge != null || maxAge != null)) {
    hasCheck = true;
    if (minAge != null && age < minAge) reasons.push(`Below minimum age (${minAge}y)`);
    if (maxAge != null && age > maxAge) reasons.push(`Above maximum age (${maxAge}y)`);
  }

  if (sex && genderReq && genderReq !== 'all') {
    hasCheck = true;
    if (!genderReq.includes(sex)) reasons.push(`Gender requirement: ${trial.gender}`);
  }

  const exclusionText = (trial.eligibilityFull || '').toLowerCase();
  if (exclusionText.includes('exclusion')) {
    const excludeList = [
      ...normalizeList(context.conditions),
      ...normalizeList(context.allergies),
      ...normalizeList(context.currentMeds),
    ];
    const hits = excludeList.filter((term) => term && exclusionText.includes(term));
    if (hits.length > 0) {
      hasCheck = true;
      reasons.push(`Possible exclusion match: ${hits.slice(0, 2).join(', ')}`);
    }
  }

  if (!hasCheck) {
    return { status: 'Insufficient info', reasons: [] };
  }

  if (reasons.length > 0) {
    return { status: 'Possibly ineligible', reasons };
  }

  return { status: 'Likely eligible', reasons: [] };
}