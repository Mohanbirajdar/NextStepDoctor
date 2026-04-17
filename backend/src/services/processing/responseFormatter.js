export function parseStructured(markdown) {
  const sections = {
    conditionOverview: '',
    researchInsights: '',
    drugInsights: '',
    clinicalTrials: '',
    recommendations: '',
    sources: '',
  };

  const sectionMap = {
    'Condition Overview': 'conditionOverview',
    'Key Research Insights': 'researchInsights',
    'Drug Insights (FDA)': 'drugInsights',
    'Clinical Trials': 'clinicalTrials',
    'Personalized Recommendations': 'recommendations',
    'Sources': 'sources',
  };

  let currentSection = null;
  const lines = markdown.split('\n');

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const key = Object.keys(sectionMap).find((k) => heading.includes(k));
      currentSection = key ? sectionMap[key] : null;
    } else if (currentSection) {
      sections[currentSection] += line + '\n';
    }
  }

  // Trim all sections
  Object.keys(sections).forEach((k) => {
    sections[k] = sections[k].trim();
  });

  return sections;
}

export function buildLLMUserPrompt({ context, message, ranked, conversationHistory = [], fdaDrugData = [] }) {
  const { disease, location, patientAge, intentQuery, intentType, sex, weight, allergies, conditions, currentMeds, labValues, drug } = context || {};

  // ── Critical: state the topic explicitly up front so the LLM stays on target ──
  const topicLine = disease && disease.toLowerCase() !== message.toLowerCase()
    ? `TOPIC: ${disease} — ${message}`
    : `TOPIC: ${message}`;

  const pubList = ranked.publications
    .slice(0, 8)
    .map((p, i) =>
      `${i + 1}. "${p.title}" — ${p.authors?.[0] || 'Unknown'} (${p.year || 'N/A'}) [${p.source}]${p.url ? ` URL: ${p.url}` : ''}`,
    )
    .join('\n');

  const trialList = ranked.trials
    .slice(0, 6)
    .map((t, i) =>
      `${i + 1}. "${t.title}" — Status: ${t.status} | Phase: ${t.phase} | Locations: ${t.locations?.slice(0, 2).join(', ') || 'Various'} | Eligibility: ${t.eligibility || 'Not specified'}`,
    )
    .join('\n');

  const fdaList = (fdaDrugData || [])
    .slice(0, 3)
    .map((d, i) =>
      `${i + 1}. ${d.brandName || d.genericName || 'Unknown'} — Indications: ${d.indications || 'Not listed'} | Contraindications: ${d.contraindications || 'Not listed'} | Warnings: ${d.warnings || 'Not listed'} | Interactions: ${d.drugInteractions || 'Not listed'}`,
    )
    .join('\n');

  const historyStr = conversationHistory
    .slice(-4)
    .map((m) => `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content?.substring(0, 300)}`)
    .join('\n');

  return `${topicLine}

Patient Context:
Age: ${patientAge || 'Not specified'}
Sex: ${sex || 'Not specified'}
Weight: ${weight || 'Not specified'}
Location: ${location || 'Not specified'}
Disease/Condition: ${disease || message}
Drug Mentioned: ${drug || 'Not specified'}
Conditions: ${conditions || 'Not specified'}
Allergies: ${allergies || 'Not specified'}
Current Meds: ${currentMeds || 'Not specified'}
Lab Values: ${labValues || 'Not specified'}
Intent Query: ${intentQuery || message}
Intent Type: ${intentType || 'general'}
Current Question: ${message}

${conversationHistory.length > 0 ? `Conversation History (for context):\n${historyStr}\n` : ''}
=== TOP PUBLICATIONS (${ranked.publications.length} retrieved) — USE ONLY THESE ===
${pubList || 'No publications found for this query.'}

=== CLINICAL TRIALS (${ranked.trials.length} found) — USE ONLY THESE ===
${trialList || 'No clinical trials found for this query.'}

=== FDA DRUG DATA (${(fdaDrugData || []).length} found) — USE ONLY THESE ===
${fdaList || 'No FDA label data found for the mentioned drug.'}

IMPORTANT: Generate your response ONLY about "${disease || message}". Do not discuss any other diseases.
Use ONLY the publications and trials listed above as your evidence base.`;
}
