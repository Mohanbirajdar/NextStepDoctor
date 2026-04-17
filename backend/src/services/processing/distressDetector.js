const HIGH_RISK_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end my life|take my life|ending it)\b/i,
  /\b(self[-\s]?harm|hurt myself|cut myself|overdose)\b/i,
  /\b(can't go on|no reason to live|want to die|don't want to live)\b/i,
  /\b(what'?s the point|what is the point|nothing to live for)\b/i,
];

const MEDIUM_RISK_PATTERNS = [
  /\b(hopeless|worthless|helpless|empty|numb)\b/i,
  /\b(severely depressed|deeply depressed|panic attack|anxious|anxiety)\b/i,
  /\b(i'm scared|i am scared|can't cope|overwhelmed|breaking down)\b/i,
  /\b(nothing is working|i can't deal|i can’t deal|can't handle|i’m done)\b/i,
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

export function buildSupportiveMessage({ severity = 'medium', disease = '', context = {} }) {
  const { patientAge, sex, conditions, currentMeds, allergies } = context || {};
  const profileBits = [
    patientAge ? `age ${patientAge}` : null,
    sex ? `sex ${sex}` : null,
  ].filter(Boolean).join(', ');

  const extraContext = [
    conditions ? `you’re also managing ${conditions}` : null,
    currentMeds ? `you’re taking ${currentMeds}` : null,
    allergies ? `you have allergies to ${allergies}` : null,
  ].filter(Boolean).join('; ');

  const conditionPhrase = disease
    ? ` Living with ${disease} can be incredibly tough, and it’s understandable to feel worn down.`
    : ' What you’re going through sounds really tough, and it’s understandable to feel overwhelmed.';

  const contextPhrase = profileBits || extraContext
    ? ` I’ll keep your details in mind (${[profileBits, extraContext].filter(Boolean).join(' — ')}).`
    : '';

  if (severity === 'high') {
    return `I’m really sorry you’re feeling this way. Thank you for sharing it — you matter, and you don’t have to carry this alone.${conditionPhrase}${contextPhrase} If you’re feeling unsafe or thinking about harming yourself, reaching out for immediate support can make a real difference. I’m here to help you through this and also to look at options for your care.`;
  }

  return `I hear you. What you’re feeling is valid, and it makes sense that this feels exhausting.${conditionPhrase}${contextPhrase} You’re not alone, and support is available if you want it. I can also keep helping you explore options for your condition.`;
}