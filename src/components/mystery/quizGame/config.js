export const AXES = ['social', 'planning', 'focus', 'drive'];

export const QUESTION_TYPE_WEIGHT = {
  slider: 1.0,
  choice: 1.15,
  yesno: 0.9,
  duel: 1.2,
  multi: 1.25,
  rank2: 1.35,
  ipsative: 1.45,
  spectrum: 1.32,
  stance: 1.22,
  allocation: 1.4,
  confidenceChoice: 1.38,
  drift: 1.28,
  tradeoff: 1.36,
  grid: 1.3,
  sort4: 1.46,
  pairMatch: 1.42,
  hold: 1.4,
  rhythm: 1.43,
  constellation: 1.44,
};

const NAME_ALIAS_MAP = {
  Fumino: 'Fumi',
  Hiroto: 'Kazakami',
  Kento: 'Yamada',
  Narumi: 'Kanechika',
  Tokiko: 'Takemine',
};

export const toMysteryName = (name = '') => NAME_ALIAS_MAP[name] || name;

export const SYNERGY_CHECK_LOGIC = [
  (scores) => scores.social > 40 && scores.drive > 40,
  (scores) => scores.social < -40 && scores.focus > 40,
  (scores) => scores.planning > 40 && scores.drive > 40,
  (scores) => scores.planning < -40 && scores.drive < -40,
  (scores) => scores.focus < -40 && scores.planning > 40,
  (scores) => scores.social > 40 && scores.focus > 40,
];

export const RELIABILITY_RECOVERY_BANK = [
  {
    id: 901,
    type: 'yesno',
    isRecoveryItem: true,
    pairKey: 'recovery-social',
    pairSlot: 'a',
    pairReverse: false,
    text: 'In most weeks, I definitely prefer a few close, deep interactions over many casual ones.',
    yesModifiers: { social: -15, focus: 8, planning: 2 },
    noModifiers: { social: 15, focus: -5, planning: -2 },
  },
  {
    id: 902,
    type: 'yesno',
    isRecoveryItem: true,
    pairKey: 'recovery-social',
    pairSlot: 'b',
    pairReverse: true,
    text: 'I feel intensely energized when my day includes a high volume of social touchpoints.',
    yesModifiers: { social: 18, focus: -6, drive: 3 },
    noModifiers: { social: -18, focus: 6, drive: -3 },
  },
  {
    id: 903,
    type: 'spectrum',
    isRecoveryItem: true,
    pairKey: 'recovery-planning',
    pairSlot: 'a',
    text: 'Choose where your absolute default tendency is under high uncertainty:',
    leftLabel: 'Total structure and clarity first',
    rightLabel: 'Pure adaptation and movement first',
    left: { modifiers: { planning: 20, focus: 5, drive: 2 } },
    right: { modifiers: { planning: -18, drive: 12, social: 5 } },
  },
  {
    id: 904,
    type: 'spectrum',
    isRecoveryItem: true,
    pairKey: 'recovery-planning',
    pairSlot: 'b',
    text: 'When plans completely shift, where do you naturally go first?',
    leftLabel: 'Rebuild a rigid, clear plan',
    rightLabel: 'Lean entirely into raw momentum',
    left: { modifiers: { planning: 18, focus: 4, drive: 2 } },
    right: { modifiers: { planning: -15, drive: 15, social: 3 } },
  },
  {
    id: 905,
    type: 'allocation',
    isRecoveryItem: true,
    budget: 10,
    text: 'Distribute 10 points across what feels MOST fundamentally true for you:',
    options: [
      { text: 'I strictly require clear expectations.', modifiers: { planning: 15, focus: 5 } },
      { text: 'I thrive on social flow and collaboration.', modifiers: { social: 15, focus: 5 } },
      { text: 'I prioritize maximum speed and action.', modifiers: { drive: 15, planning: -5 } },
      { text: 'I require protected, silent focus time.', modifiers: { focus: 15, social: -8 } },
    ],
  },
  {
    id: 906,
    type: 'choice',
    isRecoveryItem: true,
    text: 'Pick the one statement that is truly your most consistent, underlying pattern:',
    options: [
      { text: 'I am predictably structured and organized, even when exhausted.', modifiers: { planning: 18, drive: 5 } },
      { text: 'I am predictably people-attuned and empathetic, even when busy.', modifiers: { social: 15, focus: 15 } },
      { text: 'I am predictably execution-focused and driven under pressure.', modifiers: { drive: 18, planning: 5 } },
      { text: 'I am predictably calm, detached, and observant in noise.', modifiers: { focus: 16, social: -5 } },
    ],
  },
  {
    id: 907,
    type: 'duel',
    isRecoveryItem: true,
    text: 'In a moment of crisis, what is your involuntary first response?',
    left: { text: 'I fix the logic and process immediately.', modifiers: { planning: 15, focus: -5, drive: 8 } },
    right: { text: 'I stabilize the emotional mood of the group.', modifiers: { focus: 18, social: 10, drive: -4 } },
  },
  {
    id: 908,
    type: 'yesno',
    isRecoveryItem: true,
    text: 'I find it profoundly easy to ignore my own feelings if it helps a goal succeed.',
    yesModifiers: { drive: 15, focus: -15, planning: 5 },
    noModifiers: { focus: 15, drive: -10, social: 5 },
  },
];

export const DOT_COLORS = ['#f87171', '#fb923c', '#fcd34d', '#4ade80', '#60a5fa'];

export const CHOICE_COLORS = [
  { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', shadow: '#94a3b8' },
  { bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6', shadow: '#8b5cf6' },
  { bg: '#f0f9ff', border: '#7dd3fc', text: '#0c4a6e', shadow: '#0ea5e9' },
  { bg: '#f0fdf4', border: '#86efac', text: '#14532d', shadow: '#22c55e' },
];

export const STANCE_PALETTES = [
  { bg: '#fff1f2', border: '#fda4af', bottom: '#e11d48', text: '#9f1239' },
  { bg: '#fff7ed', border: '#fdba74', bottom: '#ea580c', text: '#9a3412' },
  { bg: '#eff6ff', border: '#93c5fd', bottom: '#2563eb', text: '#1d4ed8' },
  { bg: '#ecfdf5', border: '#86efac', bottom: '#16a34a', text: '#166534' },
];

export const createEmptyAxes = () => ({
  social: 0,
  planning: 0,
  focus: 0,
  drive: 0,
});

export const createInitialAxisPolarity = () => ({
  social: { pos: 0, neg: 0 },
  planning: { pos: 0, neg: 0 },
  focus: { pos: 0, neg: 0 },
  drive: { pos: 0, neg: 0 },
});

export const createInitialResponseQuality = () => ({
  sliderCount: 0,
  sliderExtreme: 0,
  spectrumCount: 0,
  spectrumExtreme: 0,
  optionSelectTotal: 0,
  optionSelectCounts: [0, 0, 0, 0],
  allocationCount: 0,
  allocationConcentrationSum: 0,
});

export const hashString = (text = '') => {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};



