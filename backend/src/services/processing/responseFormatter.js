export function parseStructured(markdown) {
  const sections = {
    conditionOverview: '',
    researchInsights: '',
    clinicalTrials: '',
    recommendations: '',
    sources: '',
  };

  const sectionMap = {
    'Condition Overview': 'conditionOverview',
    'Key Research Insights': 'researchInsights',
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

export function buildLLMUserPrompt({ context, message, ranked, conversationHistory = [] }) {
  const { disease, location, patientName, patientAge } = context || {};

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
      `${i + 1}. "${t.title}" — Status: ${t.status} | Phase: ${t.phase} | Locations: ${t.locations?.slice(0, 2).join(', ') || 'Various'}`,
    )
    .join('\n');

  const historyStr = conversationHistory
    .slice(-4)
    .map((m) => `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content?.substring(0, 300)}`)
    .join('\n');

  return `${topicLine}

Patient Context:
Name: ${patientName || 'Patient'}
Age: ${patientAge || 'Not specified'}
Location: ${location || 'Not specified'}
Disease/Condition: ${disease || message}
Current Question: ${message}

${conversationHistory.length > 0 ? `Conversation History (for context):\n${historyStr}\n` : ''}
=== TOP PUBLICATIONS (${ranked.publications.length} retrieved) — USE ONLY THESE ===
${pubList || 'No publications found for this query.'}

=== CLINICAL TRIALS (${ranked.trials.length} found) — USE ONLY THESE ===
${trialList || 'No clinical trials found for this query.'}

IMPORTANT: Generate your response ONLY about "${disease || message}". Do not discuss any other diseases.
Use ONLY the publications and trials listed above as your evidence base.`;
}
