export function calculateConfidence(rankedResults) {
  const pubs = rankedResults.publications || [];
  const trials = rankedResults.trials || [];

  const factors = {
    paperCount: Math.min(1, pubs.length / 8),
    avgScore: pubs.length > 0
      ? pubs.reduce((s, p) => s + (p.score || 0), 0) / pubs.length
      : 0,
    trialCount: Math.min(1, trials.length / 5),
    recencyAvg: pubs.length > 0
      ? pubs.reduce((s, p) => s + (p.scoreBreakdown?.recency || 0), 0) / pubs.length
      : 0,
    sourceVariety: new Set(pubs.map((p) => p.source)).size / 2,
  };

  const score = Math.round(
    factors.paperCount * 25
    + factors.avgScore * 30
    + factors.trialCount * 15
    + factors.recencyAvg * 20
    + factors.sourceVariety * 10,
  );

  const capped = Math.min(100, Math.max(0, score));

  const label = capped > 80 ? 'High' : capped > 60 ? 'Medium' : 'Low';

  return {
    score: capped,
    label,
    factors,
    explanation: `Based on ${pubs.length} ranked papers and ${trials.length} clinical trials`,
  };
}
