import { ANIMAL_AXES } from '../../../data/animalQuizData';
import { hashString } from '../quizGame/config';

export const TRAIT_PALETTE = ['#34d399', '#60a5fa', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316'];

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export const zeroAnimalAxes = () => Object.fromEntries(ANIMAL_AXES.map((axis) => [axis, 0]));

export const createAnimalPolarity = () =>
  Object.fromEntries(ANIMAL_AXES.map((axis) => [axis, { pos: 0, neg: 0 }]));

export const createAnimalQualityState = () => ({
  sliderCount: 0,
  sliderExtreme: 0,
  spectrumCount: 0,
  spectrumExtreme: 0,
  optionSelectTotal: 0,
  optionSelectCounts: [0, 0, 0, 0],
  allocationCount: 0,
  allocationConcentrationSum: 0,
});

const normalizeSigned = (value) => clamp(Math.round((value + 100) / 2), 0, 100);

export const pickInstruction = (value, uiLanguage = 'en') =>
  typeof value === 'string' ? value : (value?.[uiLanguage] || value?.en || '');

export const buildAnimalFactors = (standardizedAxes, metrics) => {
  const warmth = normalizeSigned(standardizedAxes.warmth || 0);
  const curiosity = normalizeSigned(standardizedAxes.curiosity || 0);
  const vigilance = normalizeSigned(standardizedAxes.vigilance || 0);
  const independence = normalizeSigned(standardizedAxes.independence || 0);
  const play = normalizeSigned(standardizedAxes.play || 0);
  const comfort = normalizeSigned(standardizedAxes.comfort || 0);
  const coherence = (metrics.coherence || 0.5) * 100;
  const pairConsistency = (metrics.pairConsistency || 0.5) * 100;
  const consistency = (metrics.consistency || 0.5) * 100;
  const extremeShield = (1 - (metrics.sliderExtremeRate || 0)) * 100;

  return {
    chaosCharm: clamp(Math.round((play * 0.38) + (warmth * 0.26) + (curiosity * 0.14) + ((100 - vigilance) * 0.12) + ((100 - comfort) * 0.10)), 0, 99),
    watchCircle: clamp(Math.round((vigilance * 0.40) + (curiosity * 0.10) + (independence * 0.14) + (pairConsistency * 0.18) + (coherence * 0.18)), 0, 99),
    denSoftness: clamp(Math.round((comfort * 0.46) + (warmth * 0.22) + (extremeShield * 0.12) + ((metrics.responseIntegrity || 50) * 0.20)), 0, 99),
    soloRoam: clamp(Math.round((independence * 0.42) + (curiosity * 0.18) + ((100 - warmth) * 0.12) + (vigilance * 0.14) + (consistency * 0.14)), 0, 99),
    ritualAnchor: clamp(Math.round((comfort * 0.28) + ((metrics.responseIntegrity || 50) * 0.22) + (pairConsistency * 0.22) + (vigilance * 0.14) + ((100 - play) * 0.14)), 0, 99),
    bounceEnergy: clamp(Math.round((play * 0.42) + (warmth * 0.22) + (curiosity * 0.10) + (coherence * 0.14) + ((100 - vigilance) * 0.12)), 0, 99),
  };
};

export const buildAnimalReason = (
  animalKey,
  animalFactors,
  reliabilityIndex,
  evidenceTrail = [],
  copy = {}
) => {
  const localizedProfile = copy.profiles?.[animalKey] || {};
  const detailSeed = evidenceTrail
    .slice(-6)
    .map((entry) => `${entry.axis}:${entry.delta}:${entry.label}`)
    .join('|');
  const seed = hashString(`${animalKey}-${Object.values(animalFactors).join('-')}-${reliabilityIndex}-${detailSeed}`);
  const openers = localizedProfile.openers || [copy.reasonFallbacks?.opener || 'Your animal pattern came through clearly.'];
  const opener = openers[seed % (openers.length || 1)];
  const anchor = localizedProfile.anchor || copy.reasonFallbacks?.anchor || '';
  const growth = localizedProfile.growth || copy.reasonFallbacks?.growth || '';
  const factorLine = Object.entries(animalFactors)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => copy.factorLines?.[key])
    .find(Boolean) || '';
  const clueLine = evidenceTrail
    .slice()
    .sort((a, b) => Math.abs(b.delta || 0) - Math.abs(a.delta || 0))
    .slice(0, 1)
    .map((entry) => (copy.clueLead || 'A clear clue came from {label}.').replace('{label}', String(entry.label || '')))
    .filter(Boolean);
  const reliabilityLine = reliabilityIndex < 58
    ? copy.reliabilityContext?.exploratory || 'Treat this as a strong live read that could sharpen further with steadier answers over time.'
    : reliabilityIndex < 74
      ? copy.reliabilityContext?.stable || 'The pattern is fairly stable and holds together well across different question styles.'
      : copy.reliabilityContext?.consistent || 'The pattern stays remarkably consistent even as the quiz changes format and pressure.';
  const blueprints = [
    [opener, anchor, factorLine, ...clueLine, growth, reliabilityLine],
    [opener, factorLine, anchor, ...clueLine, growth, reliabilityLine],
    [`${opener} ${anchor}`, factorLine, ...clueLine, growth, reliabilityLine],
  ];
  return blueprints[seed % blueprints.length].filter(Boolean).join(' ');
};

export const computeProfileBalanceAdjustment = (profileKey, profileEntries) => {
  const profile = profileEntries.find(([key]) => key === profileKey)?.[1];
  const others = profileEntries.filter(([key]) => key !== profileKey).map(([, entry]) => entry);
  if (!profile || !others.length) return 0;

  const axisCloseness = others.reduce((sum, other) => {
    const distance = Math.sqrt(ANIMAL_AXES.reduce((acc, axis) => {
      const delta = (((profile.axes || {})[axis] || 0) - ((other.axes || {})[axis] || 0));
      return acc + (delta * delta);
    }, 0));
    return sum + clamp(100 - ((distance / 40) * 100), 0, 100);
  }, 0) / others.length;

  const factorKeys = Object.keys(profile.factors || {});
  const factorCloseness = others.reduce((sum, other) => {
    const diff = factorKeys.reduce((acc, key) => acc + Math.abs((profile.factors?.[key] || 0) - (other.factors?.[key] || 0)), 0) / Math.max(1, factorKeys.length);
    return sum + clamp(100 - diff, 0, 100);
  }, 0) / others.length;

  const distinctiveness = 100 - ((axisCloseness * 0.65) + (factorCloseness * 0.35));
  return clamp(Math.round((distinctiveness - 50) * 0.18), -8, 8);
};
