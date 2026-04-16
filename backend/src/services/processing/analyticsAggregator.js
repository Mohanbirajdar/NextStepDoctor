export function aggregateAnalytics(results) {
  const pubs = results.publications || [];
  const trials = results.trials || [];

  // Publications by year
  const yearMap = {};
  pubs.forEach((p) => {
    if (p.year) yearMap[p.year] = (yearMap[p.year] || 0) + 1;
  });
  const publicationsByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: parseInt(year, 10), count }))
    .sort((a, b) => a.year - b.year)
    .slice(-10);

  // Trial status distribution
  const statusMap = {};
  trials.forEach((t) => {
    const s = t.status || 'Unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const trialStatusDistribution = Object.entries(statusMap)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Top authors
  const authorMap = {};
  pubs.forEach((p) => {
    (p.authors || []).slice(0, 3).forEach((a) => {
      if (a) authorMap[a] = (authorMap[a] || 0) + 1;
    });
  });
  const topAuthors = Object.entries(authorMap)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top institutions
  const instMap = {};
  pubs.forEach((p) => {
    if (p.institution) instMap[p.institution] = (instMap[p.institution] || 0) + 1;
  });
  const topInstitutions = Object.entries(instMap)
    .map(([institution, count]) => ({ institution, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Source distribution
  const sourceMap = {};
  pubs.forEach((p) => {
    sourceMap[p.source] = (sourceMap[p.source] || 0) + 1;
  });

  const avgCitations = pubs.length > 0
    ? Math.round(pubs.reduce((s, p) => s + (p.citations || 0), 0) / pubs.length)
    : 0;

  return {
    publicationsByYear,
    trialStatusDistribution,
    topAuthors,
    topInstitutions,
    sourceDistribution: sourceMap,
    avgCitations,
    totalPublications: pubs.length,
    totalTrials: trials.length,
  };
}
