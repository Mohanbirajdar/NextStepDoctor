const HIGH_RISK_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end my life|take my life)\b/i,
  /\b(self[-\s]?harm|hurt myself|cut myself|overdose)\b/i,
  /\b(can't go on|no reason to live|want to die)\b/i,
];

const MEDIUM_RISK_PATTERNS = [
  /\b(hopeless|worthless|helpless)\b/i,
  /\b(severely depressed|deeply depressed|panic attack)\b/i,
  /\b(i'm scared|i am scared|can't cope|overwhelmed)\b/i,
];

export function detectDistress(message = '') {
  const text = message.toLowerCase();
  const highHit = HIGH_RISK_PATTERNS.some((p) => p.test(text));
  const mediumHit = MEDIUM_RISK_PATTERNS.some((p) => p.test(text));

  if (highHit) {
    return { detected: true, severity: 'high' };
  }
  if (mediumHit) {
    return { detected: true, severity: 'medium' };
  }
  return { detected: false, severity: 'none' };
}

export function buildCrisisResources(location = '') {
  const loc = (location || '').toLowerCase();
  const resources = [
    {
      region: 'US / Canada',
      label: '988 Suicide & Crisis Lifeline',
      contact: 'Call or text 988',
      url: 'https://988lifeline.org/',
    },
    {
      region: 'UK & ROI',
      label: 'Samaritans',
      contact: 'Call 116 123',
      url: 'https://www.samaritans.org/',
    },
    {
      region: 'Australia',
      label: 'Lifeline Australia',
      contact: 'Call 13 11 14',
      url: 'https://www.lifeline.org.au/',
    },
  ];

  const localizedNote = loc
    ? `If you are in ${location}, please consider contacting local emergency services or a local crisis line.`
    : 'If you are outside these regions, please contact your local emergency number or a local crisis line.';

  return {
    heading: 'If you are in immediate danger or thinking about self-harm, please seek help right now.',
    note: localizedNote,
    resources,
  };
}

export function buildSupportiveMessage({ severity = 'medium', disease = '' }) {
  const conditionPhrase = disease ? ` Living with ${disease} can be incredibly tough.` : ' What you’re going through sounds really tough.';
  if (severity === 'high') {
    return `I hear you, and I’m really glad you shared this. What you’re feeling is valid, and you don’t have to carry it alone.${conditionPhrase} If things feel overwhelming or unsafe, reaching out for support can make a real difference.`;
  }
  return `I hear you. What you’re feeling is valid, and it’s understandable to feel overwhelmed.${conditionPhrase} You’re not alone, and support is available if you want it.`;
}