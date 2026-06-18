export const ANIMAL_AXES = ['warmth', 'curiosity', 'vigilance', 'independence', 'play', 'comfort'];

export const ANIMAL_DISPLAY_TRAITS = [
  {
    key: 'chaosCharm',
    label: 'Chaos charm',
    high: 'bright, disarming energy that turns tension into play',
    low: 'more measured than chaotic, with energy released carefully',
  },
  {
    key: 'watchCircle',
    label: 'Watch circle',
    high: 'quietly reading the room and keeping track of everything',
    low: 'relaxing fast instead of staying in guard mode',
  },
  {
    key: 'denSoftness',
    label: 'Den softness',
    high: 'deeply soothed by comfort, familiarity, and gentle closeness',
    low: 'less tied to cozy predictability and more open to movement',
  },
  {
    key: 'soloRoam',
    label: 'Solo roam',
    high: 'needs space, range, and a little self-directed wandering',
    low: 'prefers staying closer to trusted people and known rhythms',
  },
  {
    key: 'ritualAnchor',
    label: 'Ritual anchor',
    high: 'stabilized by repeated habits, safe routes, and familiar timing',
    low: 'more willing to loosen routine and adapt in motion',
  },
  {
    key: 'bounceEnergy',
    label: 'Bounce energy',
    high: 'quick to pop back up and create movement around others',
    low: 'recharges more quietly and spends energy carefully',
  },
];

export const ANIMAL_CARD_COLORS = {
  Satonosuke: { bg: '#ecfdf5', border: '#34d399', text: '#047857' },
  Oshio: { bg: '#eff6ff', border: '#60a5fa', text: '#1d4ed8' },
  Omiso: { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
};

export const ANIMAL_PROFILES = {
  Satonosuke: {
    axes: { warmth: 12, curiosity: 5, vigilance: -4, independence: -6, play: 12, comfort: 6 },
    factors: { chaosCharm: 96, watchCircle: 26, denSoftness: 54, soloRoam: 18, ritualAnchor: 32, bounceEnergy: 94 },
    openers: [
      'Your pattern lands on Satonosuke energy: affectionate, goofy, and impossible to ignore once you feel safe.',
      'This reads Satonosuke: warm-hearted chaos with a genuine instinct to brighten the room around you.',
      'You matched Satonosuke because your responses kept pointing toward playful warmth over guarded distance.',
    ],
    anchor: 'You tend to reconnect through closeness, silliness, and immediate emotional lift.',
    growth: 'Your best rhythm comes from keeping that joy while respecting when your energy actually needs recovery.',
  },
  Oshio: {
    axes: { warmth: -2, curiosity: 10, vigilance: 14, independence: 12, play: 0, comfort: 2 },
    factors: { chaosCharm: 18, watchCircle: 98, denSoftness: 34, soloRoam: 92, ritualAnchor: 82, bounceEnergy: 32 },
    openers: [
      'Your result leans Oshio: quiet, exacting, and always a beat ahead of what the room is doing.',
      'This pattern is strongly Oshio: observant, self-directed, and far more alert than you first let on.',
      'You matched Oshio because your answers consistently favored watchfulness, pattern-reading, and guarded range.',
    ],
    anchor: 'You seem to trust your own read first, then move once the terrain actually makes sense.',
    growth: 'You stay strongest when you let curiosity lead without turning every unknown into a threat signal.',
  },
  Omiso: {
    axes: { warmth: 5, curiosity: -1, vigilance: 4, independence: 4, play: 2, comfort: 15 },
    factors: { chaosCharm: 32, watchCircle: 62, denSoftness: 98, soloRoam: 42, ritualAnchor: 94, bounceEnergy: 28 },
    openers: [
      'Your result settles on Omiso energy: comforting, soft, and quietly grounding for everyone nearby.',
      'This looks very Omiso: cozy, affectionate, and steady in a way that lowers the temperature of the room.',
      'You matched Omiso because your pattern keeps choosing softness, safety, and reliable warmth over noise.',
    ],
    anchor: 'You regulate best through comfort, familiar pacing, and a calm kind of closeness.',
    growth: 'Things stay healthiest when rest is a source of strength, not a reason to disappear from what matters.',
  },
};

