import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ScanSearch, UserCheck, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { CHAR_PROFILES, QUESTION_BANK } from '../../data/quizData';
import { CHARACTER_COLORS } from '../../data/characters';

const AXES = ['social', 'planning', 'focus', 'drive'];
const QUESTION_TYPE_WEIGHT = {
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
};

const NAME_ALIAS_MAP = {
  Fumino: 'Fumi',
  Hiroto: 'Kazakami',
  Kento: 'Yamada',
  Narumi: 'Kanechika',
  Tokiko: 'Takemine',
};

const toMysteryName = (name = '') => NAME_ALIAS_MAP[name] || name;

const CHARACTER_REASON_STYLE = {
  Mitsumi: {
    openers: [
      'You carry the same bright momentum Mitsumi has when she decides to do something for real.',
      'Your result lands on Mitsumi energy: sincere, driven, and surprisingly steady under pressure.',
      'Like Mitsumi, you have a rare kind of earnestness that naturally pulls people toward you.',
    ],
    anchor: 'People trust you because your intentions are clear and your effort is visible.',
    growth: 'You do best when you keep your plan, but leave a little room for detours that turn out better than expected.',
  },
  Shima: {
    openers: [
      'This feels very Shima: socially aware, adaptable, and quick at reading tone.',
      'You landed on Shima for a reason: you can move through different groups without forcing it.',
      'Like Shima, you have an effortless social grace that masks a lot of deep consideration.',
    ],
    anchor: 'You notice what other people need before they say it out loud.',
    growth: 'Your sweet spot is staying kind without abandoning what you want for yourself.',
  },
  Mika: {
    openers: [
      'You match Mika energy: sharp standards, serious effort, and a guarded side that protects you.',
      'This result reads Mika: ambitious, detail-aware, and tougher than people assume at first glance.',
      'Like Mika, you use your high standards as both a shield and a way to show you care.',
    ],
    anchor: 'You care deeply about outcomes, so you hold yourself to a higher bar than most.',
    growth: 'Things flow better when you let trusted people see the softer side behind the armor.',
  },
  Makoto: {
    openers: [
      'You came out close to Makoto: thoughtful, observant, and most comfortable in honest spaces.',
      'This profile fits Makoto vibes: quiet depth, careful reading of people, and real sincerity.',
      'Like Makoto, you value authenticity above performance and find strength in quiet observation.',
    ],
    anchor: 'You pick up nuance quickly and usually notice what others overlook.',
    growth: 'You thrive when you protect your energy and choose depth over noise.',
  },
  Yuzuki: {
    openers: [
      'You match Yuzuki energy: calm on the surface, independent at the core.',
      'This result leans Yuzuki: low-drama, selective, and clear about what feels real.',
      'Like Yuzuki, you have a striking independence that keeps you from getting swept up in unnecessary noise.',
    ],
    anchor: 'You do not chase every room; you choose your people and show up fully for them.',
    growth: 'Your best rhythm is keeping your boundaries while still letting the right people in.',
  },
  Yamada: {
    openers: [
      'You landed on Yamada energy: warm, social, and naturally easy to approach.',
      'This reads Yamada: upbeat, open, and good at making awkward moments lighter.',
      'Like Yamada, you are the social glue that keeps the atmosphere from getting too heavy.',
    ],
    anchor: 'You bring movement and connection when people around you feel stuck.',
    growth: 'You get even stronger when you pair your spontaneity with just enough structure.',
  },
  Nao: {
    openers: [
      'You match Nao energy: composed, perceptive, and quietly strong when things get messy.',
      'This result is very Nao: grounded taste, emotional precision, and calm leadership.',
      'Like Nao-chan, you pair a sharp eye for detail with a very warm, maternal kind of strength.',
    ],
    anchor: 'You read people well and know when to listen, when to advise, and when to hold a boundary.',
    growth: 'Your edge is balancing softness with self-protection so you can keep showing up without burning out.',
  },
  Kanechika: {
    openers: [
      'You landed on Kanechika energy: high fire, high commitment, and all-in passion.',
      'This profile screams Kanechika: intense drive, bold expression, and zero half-effort.',
      'Like Kanechika, you have a single-minded intensity that is both intimidating and inspiring.',
    ],
    anchor: 'When you care, people can feel it immediately and often get pulled into your momentum.',
    growth: 'Your best results come when you pair that passion with a bit more pacing and sequencing.',
  },
  Fumino: {
    openers: [
      'You match Fumi energy: calm under noise, emotionally steady, and quietly dependable.',
      'This result leans Fumi: grounded, emotionally smart, and consistently supportive.',
      'Like Fumi, you are the rock your friends rely on even when you don\'t say much.',
    ],
    anchor: 'People settle faster around you because your presence feels safe and practical.',
    growth: 'You stay strongest when you protect your own needs as seriously as you protect others.',
  },
  Hiroto: {
    openers: [
      'You landed on Kazakami energy: relaxed, unfazed, and not interested in performative stress.',
      'This profile reads Kazakami: chill tempo, social ease, and low panic even in chaos.',
      'Like Kazakami, you have an unshakeable sense of peace that others find incredibly magnetic.',
    ],
    anchor: 'You are good at reducing pressure and helping people stop overcomplicating everything.',
    growth: 'You level up when you keep your calm style but commit earlier on high-impact tasks.',
  },
  Tokiko: {
    openers: [
      'You match Takemine energy: disciplined, organized, and serious about standards.',
      'This result fits Takemine: structure-first thinking with strong execution focus.',
      'Like Takemine, your competence is your greatest asset and your preferred comfort zone.',
    ],
    anchor: 'You can turn vague situations into systems that actually work.',
    growth: 'Your flow improves when you let support in instead of carrying everything alone.',
  },
  Mukai: {
    openers: [
      'You landed on Mukai energy: level-headed, direct, and refreshingly low-drama.',
      'This profile feels Mukai: practical logic, stable pace, and clear communication.',
      'Like Mukai, you provide a steady, rational baseline that keeps things from spiraling.',
    ],
    anchor: 'People come to you when they need clean thinking instead of emotional fog.',
    growth: 'Your impact gets bigger when you pair your logic with a little more visible warmth.',
  },
  Ririka: {
    openers: [
      'You match Ririka energy: strong front, big emotions underneath, and fierce self-protection.',
      'This result reads Ririka: magnetic presence, sharp instincts, and guarded vulnerability.',
      'Like Ririka, you have complex depths that you only reveal to those who have proven they can be trusted.',
    ],
    anchor: 'You are highly sensitive to trust and can read social risk faster than most people.',
    growth: 'Life gets lighter when you lower the shield with people who have already earned it.',
  },
  Chris: {
    openers: [
      'You landed on Chris energy: empathetic, peace-oriented, and good at emotional repair.',
      'This profile leans Chris: patient listening, social care, and subtle conflict smoothing.',
      'Like Chris, you have a natural talent for smoothing out the friction in your circles.',
    ],
    anchor: 'You help groups function by noticing tension early and softening it before it grows.',
    growth: 'Keep making room for your own needs, not only everyone else\'s.',
  },
  Ujiie: {
    openers: [
      'You match Ujiie energy: analytical, skeptical, and mentally always three steps ahead.',
      'This result fits Ujiie: sharp critique, high pattern-detection, and strong self-protection.',
      'Like Ujiie, you value intellectual honesty and aren\'t afraid to look at the difficult truths.',
    ],
    anchor: 'You spot weak logic quickly and usually call out what others avoid naming.',
    growth: 'Your insight lands better when you let people see the care behind your critique.',
  },
};

const AXIS_DYNAMIC_LINES = {
  social: {
    pos: [
      'you get energy from connection and tend to engage first instead of waiting around.',
      'your social style is outward and responsive; people usually read you as approachable.',
      'you find your best rhythm when you\'re actively part of the conversation and the group dynamic.',
      'hanging out with a crowd doesn\'t drain you; it actually helps you feel more alive and connected.',
    ],
    neg: [
      'you recharge in quieter spaces and prefer fewer, deeper interactions.',
      'your social style is selective: low noise, high trust, and meaningful conversations.',
      'you value your quiet time and prefer to observe a room before you decide to jump in.',
      'a few close bonds matter more to you than a broad, superficial network.',
    ],
  },
  planning: {
    pos: [
      'you think best with structure and usually perform better when the path is mapped.',
      'planning matters to you; clear sequence and preparation help you stay steady.',
      'you feel most confident when you know exactly what is coming next and how to handle it.',
      'preparation is your superpower, allowing you to stay calm when things get busy.',
    ],
    neg: [
      'you are more adaptive than rigid, and you often build momentum by moving first.',
      'you prefer flexible plans so you can adjust in real time when context shifts.',
      'a rigid schedule feels restrictive to you; you prefer to improvise and catch the organic flow.',
      'you have an elite ability to handle surprises because you don\'t get locked into one fixed path.',
    ],
  },
  focus: {
    pos: [
      'your focus style leans empathetic and context-aware, especially with people dynamics.',
      'you are tuned in to emotional nuance, which makes your responses feel human and timely.',
      'you naturally prioritize the "who" over the "what," making sure everyone is emotionally on board.',
      'people find you easy to talk to because you focus on the feeling behind the facts.',
    ],
    neg: [
      'your focus style leans analytical and detached enough to stay clear in tense moments.',
      'you default to clean reasoning first, then layer in emotion once the picture is clear.',
      'you value objective truth and logical consistency over keeping the peace at any cost.',
      'in a crisis, you are the one who stays cool because you focus on the mechanics of the fix.',
    ],
  },
  drive: {
    pos: [
      'your drive profile is high: once committed, you push hard and follow through.',
      'you carry strong execution energy and usually do better with action than delay.',
      'you get restless when things stall, preferring to keep the momentum moving at all times.',
      'when you see a goal, you don\'t just watch it—you start building a path toward it immediately.',
    ],
    neg: [
      'your drive profile is measured: you value sustainability over constant intensity.',
      'you pace yourself on purpose, which helps you avoid burnout and noise-driven decisions.',
      'you believe that going slow and steady is the only way to go far without breaking down.',
      'you don\'t feel pressured to constantly "do"; you value the quality of your activity over the quantity.',
    ],
  },
};

const SYNERGY_INJECTS = [
  {
    check: (s) => s.social > 40 && s.drive > 40,
    text: 'You possess a charismatic leadership energy that naturally mobilizes others toward a common goal.',
  },
  {
    check: (s) => s.social < -40 && s.focus > 40,
    text: 'Your quiet, high-empathy presence makes you a powerful observer and a safe harbor for those around you.',
  },
  {
    check: (s) => s.planning > 40 && s.drive > 40,
    text: 'You are a powerhouse of disciplined execution; when you commit to a path, you are virtually unstoppable.',
  },
  {
    check: (s) => s.planning < -40 && s.drive < -40,
    text: 'You value a sustainable, organic pace of life that prioritizes genuine moments over manufactured pressure.',
  },
  {
    check: (s) => s.focus < -40 && s.planning > 40,
    text: 'Your analytical rigor allows you to build systems and solutions that are both efficient and logically flawless.',
  },
  {
    check: (s) => s.social > 40 && s.focus > 40,
    text: 'You have a rare talent for "reading the room" and ensuring everyone feels heard and included.',
  },
];


const hashString = (text = '') => {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = ((h << 5) - h) + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const pickBySeed = (pool, seed) => {
  if (!pool || !pool.length) return '';
  return pool[Math.abs(seed) % pool.length];
};

const RELIABILITY_RECOVERY_BANK = [
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

const DOT_COLORS = ['#f87171', '#fb923c', '#fcd34d', '#4ade80', '#60a5fa'];
const CHOICE_COLORS = [
  { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', shadow: '#94a3b8' }, // Slate
  { bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6', shadow: '#8b5cf6' }, // Violet
  { bg: '#f0f9ff', border: '#7dd3fc', text: '#0c4a6e', shadow: '#0ea5e9' }, // Sky
  { bg: '#f0fdf4', border: '#86efac', text: '#14532d', shadow: '#22c55e' }  // Green
];

const DotSlider = ({ isMobile, value, onChange, leftLabel, rightLabel }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%', alignItems: 'center', padding: '0 10px', height: isMobile ? '24px' : '32px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '20px', right: '20px', height: '4px', background: isMobile ? '#bfdbfe' : '#e2e8f0', transform: 'translateY(-50%)', zIndex: 0, borderRadius: '4px' }} />
        {[1, 2, 3, 4, 5].map(v => {
          const color = DOT_COLORS[v - 1];
          return (
            <motion.button
              key={v}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => { triggerHaptic('selection'); onChange(v); }}
              style={{
                width: isMobile ? '20px' : '28px', height: isMobile ? '20px' : '28px', borderRadius: '50%',
                background: value === v ? color : 'white',
                border: `${isMobile ? '3px' : '4px'} solid ${value === v ? color : '#cbd5e1'}`,
                zIndex: 1, cursor: 'pointer', padding: 0,
                boxShadow: value === v ? `0 0 10px ${color}80` : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'background 0.2s, border 0.2s'
              }}
              aria-label={`Select point ${v}`}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: isMobile ? 'var(--font-hand)' : 'Sniglet', color: '#64748b', fontSize: isMobile ? '0.86rem' : '0.95rem', lineHeight: 1.2 }}>
        <span style={{ maxWidth: '45%', textAlign: 'left' }}>{leftLabel}</span>
        <span style={{ maxWidth: '45%', textAlign: 'right' }}>{rightLabel}</span>
      </div>
    </div>
  );
};

const QuizGame = ({ isMobile, portraitData, fallbackColors, onBack, t }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [questions, setQuestions] = useState([]);
  const [axes, setAxes] = useState({ social: 0, planning: 0, focus: 0, drive: 0 });
  const [sliderValue, setSliderValue] = useState(3);
  const [spectrumValue, setSpectrumValue] = useState(3);
  const [stanceSelection, setStanceSelection] = useState(null);
  const [multiSelection, setMultiSelection] = useState([]);
  const [rankSelection, setRankSelection] = useState([]);
  const [confidenceSelection, setConfidenceSelection] = useState({ optionIndex: null, level: 2 });
  const [ipsativeMost, setIpsativeMost] = useState(null);
  const [ipsativeLeast, setIpsativeLeast] = useState(null);
  const [allocationPoints, setAllocationPoints] = useState({});
  const [integrityCheckpoint, setIntegrityCheckpoint] = useState(null);
  const [matchedResult, setMatchedResult] = useState(null);
  const [showAllScores, setShowAllScores] = useState(false);
  const evidenceTrailRef = useRef([]);
  const axisSignalRef = useRef({ social: 0, planning: 0, focus: 0, drive: 0 });
  const axisPolarityRef = useRef({
    social: { pos: 0, neg: 0 },
    planning: { pos: 0, neg: 0 },
    focus: { pos: 0, neg: 0 },
    drive: { pos: 0, neg: 0 },
  });
  const typeCountRef = useRef({});
  const responseVectorsRef = useRef([]);
  const responseQualityRef = useRef({
    sliderCount: 0,
    sliderExtreme: 0,
    spectrumCount: 0,
    spectrumExtreme: 0,
    optionSelectTotal: 0,
    optionSelectCounts: [0, 0, 0, 0],
    allocationCount: 0,
    allocationConcentrationSum: 0,
  });
  const pairResponsesRef = useRef({});
  const pendingAxesRef = useRef(null);
  const integrityPromptCountRef = useRef(0);
  const lastIntegrityPromptStepRef = useRef(0);
  const recoveryRoundRef = useRef(0);

  const computeLiveQuality = () => {
    const sliderTotal = responseQualityRef.current.sliderCount + responseQualityRef.current.spectrumCount;
    const sliderExtremeRate = sliderTotal
      ? (responseQualityRef.current.sliderExtreme + responseQualityRef.current.spectrumExtreme) / sliderTotal
      : 0;
    const optionTotal = responseQualityRef.current.optionSelectTotal || 0;
    const dominantOptionRate = optionTotal
      ? Math.max(...responseQualityRef.current.optionSelectCounts.map((n) => n / optionTotal))
      : 0.25;
    const positionBiasPenalty = Math.max(0, Math.min(1, (dominantOptionRate - 0.55) / 0.45));
    const allocationConcentration = responseQualityRef.current.allocationCount
      ? responseQualityRef.current.allocationConcentrationSum / responseQualityRef.current.allocationCount
      : 0.55;

    const pairValues = Object.values(pairResponsesRef.current);
    const pairConsistency = pairValues.length
      ? pairValues.reduce((sum, pair) => {
          if (pair?.a == null || pair?.b == null) return sum + 0.5;
          return sum + Math.max(0, 1 - (Math.abs(pair.a - pair.b) / 2));
        }, 0) / pairValues.length
      : 0.7;

    const avgVector = responseVectorsRef.current.reduce(
      (acc, vec) => {
        AXES.forEach((axis) => {
          acc[axis] += vec?.[axis] || 0;
        });
        return acc;
      },
      { social: 0, planning: 0, focus: 0, drive: 0 }
    );
    const vectorCount = Math.max(1, responseVectorsRef.current.length);
    AXES.forEach((axis) => {
      avgVector[axis] /= vectorCount;
    });
    const avgNorm = Math.sqrt(AXES.reduce((sum, axis) => sum + avgVector[axis] * avgVector[axis], 0)) || 1;
    const coherence = responseVectorsRef.current.length
      ? responseVectorsRef.current.reduce((sum, vec) => {
          const dot = AXES.reduce((s, axis) => s + (vec?.[axis] || 0) * avgVector[axis], 0);
          const vecNorm = Math.sqrt(AXES.reduce((s, axis) => s + (vec?.[axis] || 0) * (vec?.[axis] || 0), 0)) || 1;
          return sum + Math.max(0, dot / (vecNorm * avgNorm));
        }, 0) / responseVectorsRef.current.length
      : 0.55;

    // Intense real-life states can produce legitimately extreme responses.
    // Reduce extreme-value penalty when coherence and pair consistency stay strong.
    const adaptiveExtremeBuffer = Math.max(
      0.08,
      Math.min(
        0.52,
        0.12 +
        (Math.max(0, coherence - 0.55) * 0.55) +
        (Math.max(0, pairConsistency - 0.55) * 0.45)
      )
    );
    const extremePenaltyRate = Math.max(0, sliderExtremeRate - adaptiveExtremeBuffer);

    const integrity = Math.round(
      Math.max(
        35,
        Math.min(
          99,
          (
            (coherence * 100 * 0.33) +
            (pairConsistency * 100 * 0.27) +
            ((1 - extremePenaltyRate) * 100 * 0.18) +
            ((1 - positionBiasPenalty) * 100 * 0.14) +
            ((1 - Math.max(0, allocationConcentration - 0.72) / 0.28) * 100 * 0.08)
          )
        )
      )
    );

    return { integrity, coherence, pairConsistency, sliderExtremeRate, positionBiasPenalty };
  };

  const summarizeQuestionSignal = (q) => {
    const signal = { social: 0, planning: 0, focus: 0, drive: 0 };
    const absorb = (mods = {}, factor = 1) => {
      AXES.forEach((axis) => {
        signal[axis] += Math.abs(mods?.[axis] || 0) * factor;
      });
    };

    if (q.type === 'slider' && q.axis) {
      signal[q.axis] += 10;
      return signal;
    }

    if (q.type === 'choice' || q.type === 'multi' || q.type === 'rank2' || q.type === 'ipsative' || q.type === 'allocation' || q.type === 'confidenceChoice') {
      (q.options || []).forEach((opt) => absorb(opt.modifiers || {}));
      return signal;
    }

    if (q.type === 'stance') {
      absorb(q.modifiers || {}, 2);
      return signal;
    }

    if (q.type === 'yesno') {
      absorb(q.yesModifiers || {});
      absorb(q.noModifiers || {});
      return signal;
    }

    if (q.type === 'duel') {
      absorb(q.left?.modifiers || {});
      absorb(q.right?.modifiers || {});
      return signal;
    }

    if (q.type === 'spectrum') {
      absorb(q.left?.modifiers || {});
      absorb(q.right?.modifiers || {});
      return signal;
    }

    return signal;
  };

  const pickMostInformativeQuestion = (remainingQuestions) => {
    if (!remainingQuestions.length) return null;
    const totalSignal = AXES.reduce((sum, axis) => sum + (axisSignalRef.current[axis] || 0), 0);
    const uncertainty = AXES.reduce((acc, axis) => {
      const ratio = totalSignal > 0 ? (axisSignalRef.current[axis] || 0) / totalSignal : 0;
      acc[axis] = Math.max(0.55, 1.3 - ratio * 1.25);
      return acc;
    }, {});

    const provisionalRank = Object.entries(CHAR_PROFILES)
      .map(([key, profile]) => {
        const dx = (axes.social || 0) - (profile.social || 0);
        const dy = (axes.planning || 0) - (profile.planning || 0);
        const dz = (axes.focus || 0) - (profile.focus || 0);
        const dw = (axes.drive || 0) - (profile.drive || 0);
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
        return { key, profile, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const topA = provisionalRank[0]?.profile;
    const topB = provisionalRank[1]?.profile;
    const discriminationAxisWeight = AXES.reduce((acc, axis) => {
      const diff = Math.abs((topA?.[axis] || 0) - (topB?.[axis] || 0));
      acc[axis] = 1 + (diff * 0.11);
      return acc;
    }, {});

    const scored = remainingQuestions.map((q, idx) => {
      const signal = summarizeQuestionSignal(q);
      const axisGain = AXES.reduce((sum, axis) => sum + signal[axis] * uncertainty[axis], 0);
      const discriminationGain = AXES.reduce((sum, axis) => sum + signal[axis] * (discriminationAxisWeight[axis] || 1), 0);
      const typeCount = typeCountRef.current[q.type] || 0;
      const diversityBonus = Math.max(0, 1.7 - typeCount * 0.42);
      const jitter = Math.random() * 0.45;
      return {
        idx,
        score: ((axisGain * 0.62) + (discriminationGain * 0.38)) * diversityBonus + jitter,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return remainingQuestions[scored[0].idx];
  };

  const buildQuestionSet = (count = 28) => {
    const validityItems = QUESTION_BANK.filter((q) => q.isValidityItem);
    const basePool = QUESTION_BANK.filter((q) => !q.isValidityItem);
    const byType = basePool.reduce((acc, q) => {
      if (!acc[q.type]) acc[q.type] = [];
      acc[q.type].push(q);
      return acc;
    }, {});

    const pickRandom = (items, n) => [...(items || [])].sort(() => Math.random() - 0.5).slice(0, Math.min(n, (items || []).length));

    const seed = [
      ...validityItems,
      ...pickRandom(byType.slider, 3),
      ...pickRandom(byType.choice, 3),
      ...pickRandom(byType.yesno, 2),
      ...pickRandom(byType.duel, 2),
      ...pickRandom(byType.multi, 2),
      ...pickRandom(byType.rank2, 2),
      ...pickRandom(byType.ipsative, 2),
      ...pickRandom(byType.spectrum, 2),
      ...pickRandom(byType.stance, 2),
      ...pickRandom(byType.allocation, 2),
      ...pickRandom(byType.confidenceChoice, 2),
    ];

    const usedIds = new Set(seed.map((q) => q.id));
    const remainder = QUESTION_BANK.filter((q) => !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
    const merged = [...seed, ...remainder].slice(0, Math.min(count, QUESTION_BANK.length));
    return merged.sort(() => Math.random() - 0.5);
  };

  const handleStart = () => {
    triggerHaptic('selection');
    
    // Use stratified sampling for broad type coverage, then adaptively reorder at runtime.
    const sampled = buildQuestionSet(28);
    setQuestions(sampled);
    
    setCurrentStep(1);
    setAxes({ social: 0, planning: 0, focus: 0, drive: 0 });
    setSliderValue(3);
    setSpectrumValue(3);
    setStanceSelection(null);
    setMultiSelection([]);
    setRankSelection([]);
    setConfidenceSelection({ optionIndex: null, level: 2 });
    setIpsativeMost(null);
    setIpsativeLeast(null);
    setAllocationPoints({});
    setIntegrityCheckpoint(null);
    setShowAllScores(false);
    evidenceTrailRef.current = [];
    axisSignalRef.current = { social: 0, planning: 0, focus: 0, drive: 0 };
    axisPolarityRef.current = {
      social: { pos: 0, neg: 0 },
      planning: { pos: 0, neg: 0 },
      focus: { pos: 0, neg: 0 },
      drive: { pos: 0, neg: 0 },
    };
    typeCountRef.current = {};
    responseVectorsRef.current = [];
    responseQualityRef.current = {
      sliderCount: 0,
      sliderExtreme: 0,
      spectrumCount: 0,
      spectrumExtreme: 0,
      optionSelectTotal: 0,
      optionSelectCounts: [0, 0, 0, 0],
      allocationCount: 0,
      allocationConcentrationSum: 0,
    };
    pairResponsesRef.current = {};
    pendingAxesRef.current = null;
    integrityPromptCountRef.current = 0;
    lastIntegrityPromptStepRef.current = 0;
    recoveryRoundRef.current = 0;
  };

  const accumulateEvidence = (label, modifiers) => {
    const dominantAxis = Object.entries(modifiers).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    if (!dominantAxis) return;
    const [axis, delta] = dominantAxis;
    const axisLabelMap = {
      social: 'social energy',
      planning: 'planning style',
      focus: 'focus mode',
      drive: 'drive level',
    };
    evidenceTrailRef.current = [
      ...evidenceTrailRef.current,
      {
        axis,
        delta,
        label,
        insight: `${label} indicates ${delta > 0 ? 'higher' : 'lower'} ${axisLabelMap[axis] || axis}.`,
      },
    ];
  };

  const applyModifiers = (modifiers, evidenceLabel = 'Response', questionType = 'choice', qualityMeta = {}) => {
    const liveQuality = computeLiveQuality();
    const typeWeight = QUESTION_TYPE_WEIGHT[questionType] || 1;
    const dynamicMultiplier = Math.max(0.72, Math.min(1.08, 0.82 + ((liveQuality.integrity / 100) * 0.26)));
    const finalWeight = typeWeight * dynamicMultiplier;
    typeCountRef.current[questionType] = (typeCountRef.current[questionType] || 0) + 1;
    const weightedModifiers = {};
    AXES.forEach((axis) => {
      const base = modifiers?.[axis] || 0;
      const weighted = Math.round(base * finalWeight);
      weightedModifiers[axis] = weighted;
      axisSignalRef.current[axis] += Math.abs(weighted);
      if (weighted > 0) axisPolarityRef.current[axis].pos += Math.abs(weighted);
      if (weighted < 0) axisPolarityRef.current[axis].neg += Math.abs(weighted);
    });

    responseVectorsRef.current = [...responseVectorsRef.current, weightedModifiers];
    if (qualityMeta.optionIndex != null) {
      const clamped = Math.max(0, Math.min(3, qualityMeta.optionIndex));
      responseQualityRef.current.optionSelectTotal += 1;
      responseQualityRef.current.optionSelectCounts[clamped] += 1;
    }
    if (qualityMeta.pairKey && qualityMeta.pairSlot) {
      if (!pairResponsesRef.current[qualityMeta.pairKey]) {
        pairResponsesRef.current[qualityMeta.pairKey] = { a: null, b: null };
      }
      const clampedValue = Math.max(-1, Math.min(1, qualityMeta.pairValue ?? 0));
      pairResponsesRef.current[qualityMeta.pairKey][qualityMeta.pairSlot] = clampedValue;
    }

    let newAxes = { ...axes };
    Object.keys(weightedModifiers).forEach(key => {
      newAxes[key] = (newAxes[key] || 0) + weightedModifiers[key];
    });
    setAxes(newAxes);
    accumulateEvidence(evidenceLabel, weightedModifiers);
    advanceStep(newAxes);
  };

  const handleNextSlider = (q) => {
    triggerHaptic('success');
    let newAxes = { ...axes };
    let val = 0;
    if (q.invert) { val = (3 - sliderValue) * 5; } 
    else { val = (sliderValue - 3) * 5; }
    
    const typeWeight = QUESTION_TYPE_WEIGHT.slider || 1;
    typeCountRef.current.slider = (typeCountRef.current.slider || 0) + 1;
    const weightedVal = Math.round(val * typeWeight);
    newAxes[q.axis] += weightedVal;
    axisSignalRef.current[q.axis] += Math.abs(weightedVal);
    if (weightedVal > 0) axisPolarityRef.current[q.axis].pos += Math.abs(weightedVal);
    if (weightedVal < 0) axisPolarityRef.current[q.axis].neg += Math.abs(weightedVal);
    responseVectorsRef.current = [...responseVectorsRef.current, { [q.axis]: weightedVal }];
    responseQualityRef.current.sliderCount += 1;
    if (sliderValue === 1 || sliderValue === 5) responseQualityRef.current.sliderExtreme += 1;
    setAxes(newAxes);
    accumulateEvidence(`${q.text} (${sliderValue}/5)`, { [q.axis]: weightedVal });
    setSliderValue(3);
    advanceStep(newAxes);
  };

  const handleSubmitMulti = (q) => {
    if (!multiSelection.length) return;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    const labels = [];
    q.options.forEach((opt, index) => {
      if (!multiSelection.includes(index)) return;
      labels.push(opt.text);
      Object.entries(opt.modifiers || {}).forEach(([axis, value]) => {
        merged[axis] += value;
      });
    });
    setMultiSelection([]);
    applyModifiers(merged, `${q.text} -> ${labels.join(' + ')}`, 'multi', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: multiSelection.length ? 0.65 : 0,
    });
  };

  const handleSubmitRank = (q) => {
    if (rankSelection.length < 2) return;
    const weightedMerge = { social: 0, planning: 0, focus: 0, drive: 0 };
    rankSelection.forEach((selectedIndex, rankIndex) => {
      const weight = rankIndex === 0 ? 1 : 0.55;
      const opt = q.options[selectedIndex];
      Object.entries(opt.modifiers || {}).forEach(([axis, value]) => {
        weightedMerge[axis] += Math.round(value * weight);
      });
    });
    const labels = rankSelection.map((idx, i) => `#${i + 1} ${q.options[idx].text}`);
    setRankSelection([]);
    applyModifiers(weightedMerge, `${q.text} -> ${labels.join(' | ')}`, 'rank2', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: rankSelection.length >= 2 ? 0.7 : 0,
    });
  };

  const handleSubmitConfidenceChoice = (q) => {
    if (confidenceSelection.optionIndex == null) return;
    const selected = q.options?.[confidenceSelection.optionIndex];
    const confidenceMultiplier = confidenceSelection.level === 1 ? 0.72 : confidenceSelection.level === 3 ? 1.18 : 1;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    AXES.forEach((axis) => {
      const base = selected?.modifiers?.[axis] || 0;
      merged[axis] = Math.round(base * confidenceMultiplier);
    });
    const confidenceLabel = confidenceSelection.level === 1 ? 'low confidence' : confidenceSelection.level === 3 ? 'high confidence' : 'medium confidence';
    const selectedIndex = confidenceSelection.optionIndex;
    setConfidenceSelection({ optionIndex: null, level: 2 });
    applyModifiers(merged, `${q.text} -> ${selected?.text || '-'} (${confidenceLabel})`, 'confidenceChoice', {
      optionIndex: selectedIndex,
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: confidenceSelection.level === 1 ? 0.35 : confidenceSelection.level === 3 ? 0.85 : 0.6,
    });
  };

  const handleSubmitStance = (q, selectionIndex) => {
    const stanceMap = [-1, -0.4, 0.4, 1];
    const factor = stanceMap[selectionIndex] ?? 0;
    const merged = { social: 0, planning: 0, focus: 0, drive: 0 };
    AXES.forEach((axis) => {
      merged[axis] = Math.round((q.modifiers?.[axis] || 0) * factor);
    });
    const labels = q.labels || ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'];
    setStanceSelection(selectionIndex);
    applyModifiers(merged, `${q.text} -> ${labels[selectionIndex] || 'stance'}`, 'stance', {
      optionIndex: selectionIndex,
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: factor,
    });
    setStanceSelection(null);
  };

  const getQuestionInstruction = (q) => {
    switch (q.type) {
      case 'slider':
        return 'Tap a dot from 1-5 based on your natural tendency.';
      case 'choice':
        return 'Pick one option that best matches your usual behavior.';
      case 'yesno':
        return 'Choose True or False based on your baseline, not ideal self.';
      case 'duel':
        return 'Choose the side that feels more naturally like you.';
      case 'multi':
        return `Select up to ${q.maxSelect || 2} options, then press Continue.`;
      case 'rank2':
        return 'Select exactly two items; first click becomes #1, second becomes #2.';
      case 'ipsative':
        return 'Mark one as Most like me and one as Least like me.';
      case 'spectrum':
        return 'Move the slider toward your default side; middle means balanced.';
      case 'allocation':
        return `Distribute all ${q.budget || 10} points before continuing.`;
      case 'confidenceChoice':
        return 'Pick one option, then set how confident you are in that choice.';
      case 'stance':
        return 'Choose how strongly you agree, based on your real default behavior.';
      default:
        return 'Answer based on your typical real behavior.';
    }
  };

  const handleSubmitIpsative = (q) => {
    if (ipsativeMost == null || ipsativeLeast == null || ipsativeMost === ipsativeLeast) return;
    const most = q.options?.[ipsativeMost];
    const least = q.options?.[ipsativeLeast];
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };

    AXES.forEach((axis) => {
      const plus = most?.modifiers?.[axis] || 0;
      const minus = least?.modifiers?.[axis] || 0;
      combined[axis] = plus - Math.round(minus * 0.8);
    });

    const label = `${q.text} -> most: ${most?.text || '-'} | least: ${least?.text || '-'}`;
    setIpsativeMost(null);
    setIpsativeLeast(null);
    applyModifiers(combined, label, 'ipsative', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: 0.75,
    });
  };

  const handleSubmitSpectrum = (q) => {
    const ratio = (spectrumValue - 3) / 2; // -1..1
    const leftWeight = (1 - ratio) / 2;
    const rightWeight = (1 + ratio) / 2;
    const intensity = 0.8 + (Math.abs(ratio) * 0.7);
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };

    AXES.forEach((axis) => {
      const leftVal = q.left?.modifiers?.[axis] || 0;
      const rightVal = q.right?.modifiers?.[axis] || 0;
      combined[axis] = Math.round(((leftVal * leftWeight) + (rightVal * rightWeight)) * intensity);
    });

    const leftText = q.leftLabel || 'left';
    const rightText = q.rightLabel || 'right';
    const selectedText = ratio < 0 ? leftText : ratio > 0 ? rightText : 'balanced middle';
    const strength = Math.round(Math.abs(ratio) * 100);
    responseQualityRef.current.spectrumCount += 1;
    if (spectrumValue === 1 || spectrumValue === 5) responseQualityRef.current.spectrumExtreme += 1;
    setSpectrumValue(3);
    applyModifiers(combined, `${q.text} -> ${selectedText} (${strength}%)`, 'spectrum', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: ratio,
    });
  };

  const handleAdjustAllocation = (q, index, delta) => {
    const budget = q.budget || 10;
    setAllocationPoints((prev) => {
      const next = { ...prev };
      const current = next[index] || 0;
      const total = (q.options || []).reduce((sum, _, idx) => sum + (next[idx] || 0), 0);
      if (delta > 0 && total >= budget) return prev;
      if (delta < 0 && current <= 0) return prev;
      next[index] = Math.max(0, current + delta);
      return next;
    });
  };

  const handleSubmitAllocation = (q) => {
    const budget = q.budget || 10;
    const total = (q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0);
    if (total !== budget) return;
    const combined = { social: 0, planning: 0, focus: 0, drive: 0 };
    const labels = [];

    (q.options || []).forEach((opt, idx) => {
      const points = allocationPoints[idx] || 0;
      if (!points) return;
      labels.push(`${opt.text} (${points})`);
      AXES.forEach((axis) => {
        const val = opt.modifiers?.[axis] || 0;
        combined[axis] += Math.round((val * points) / budget);
      });
    });

    const maxAllocated = Math.max(...(q.options || []).map((_, idx) => allocationPoints[idx] || 0), 0);
    responseQualityRef.current.allocationCount += 1;
    responseQualityRef.current.allocationConcentrationSum += (budget > 0 ? maxAllocated / budget : 0);

    setAllocationPoints({});
    applyModifiers(combined, `${q.text} -> ${labels.join(' | ')}`, 'allocation', {
      pairKey: q.pairKey,
      pairSlot: q.pairSlot,
      pairValue: 0.7,
    });
  };

  const buildDynamicReason = (characterKey, standardizedAxes, reliabilityIndex) => {
    const style = CHARACTER_REASON_STYLE[characterKey] || {
      openers: ['You matched this profile based on your overall response pattern.'],
      anchor: 'Your pattern was consistent enough to produce a clear direction.',
      growth: 'Keep tracking what works for you and adjust based on real situations.',
    };

    const baseSeed = `${characterKey}-${standardizedAxes.social}-${standardizedAxes.planning}-${standardizedAxes.focus}-${standardizedAxes.drive}-${reliabilityIndex}`;
    const seed = hashString(baseSeed);
    
    // 1. Core Opener
    const opener = style.openers[seed % style.openers.length];

    // 2. Magnitude-Aware Axis Lines
    const getIntensity = (val) => {
      const abs = Math.abs(val);
      if (abs >= 85) return 'profoundly';
      if (abs >= 65) return 'notably';
      if (abs >= 45) return 'distinctly';
      if (abs >= 25) return 'moderately';
      return 'subtly';
    };

    const rankedAxes = [...AXES]
      .map((axis) => ({ axis, value: standardizedAxes[axis] || 0, magnitude: Math.abs(standardizedAxes[axis] || 0) }))
      .sort((a, b) => b.magnitude - a.magnitude);

    const axisLine = (entry, indexShift) => {
      const polarity = entry.value >= 0 ? 'pos' : 'neg';
      const pool = AXIS_DYNAMIC_LINES[entry.axis]?.[polarity] || [];
      if (!pool.length) return '';
      const text = pool[(seed + indexShift) % pool.length];
      const intensity = getIntensity(entry.value);
      return `${intensity} ${text}`;
    };

    const primaryLine = rankedAxes[0] ? axisLine(rankedAxes[0], 3) : '';
    const secondaryLine = rankedAxes[1] && rankedAxes[1].magnitude >= 25 ? axisLine(rankedAxes[1], 7) : '';

    // 3. Synergy Injects
    const synergyMatch = SYNERGY_INJECTS.find(sin => sin.check(standardizedAxes));
    const synergyLine = synergyMatch ? synergyMatch.text : '';

    // 4. Reliability Context
    const reliabilityLine = reliabilityIndex < 58
      ? 'Treat this as a strong first read that may shift as your environment settles.'
      : reliabilityIndex < 72
        ? 'This profile is fairly stable and reflects your current underlying rhythm well.'
        : 'The pattern is remarkably consistent across all your responses.';

    // 5. Structural Blueprints
    const blueprints = [
      () => [opener, synergyLine, style.anchor, `More specifically, ${primaryLine}`, style.growth, reliabilityLine],
      () => [opener, style.anchor, `It is clear that ${primaryLine}`, secondaryLine ? `At the same time, ${secondaryLine}` : '', synergyLine, style.growth, reliabilityLine],
      () => [`${opener} ${style.anchor}`, synergyLine, `Your baseline shows that ${primaryLine}`, style.growth, reliabilityLine],
      () => [opener, `Day to day, ${primaryLine}`, synergyLine, style.anchor, style.growth, reliabilityLine]
    ];

    const selectedBlueprint = blueprints[seed % blueprints.length]();

    return selectedBlueprint
      .filter(Boolean)
      .join(' ');
  };

  const buildDynamicPrediction = (characterKey, standardizedAxes) => {
    const seed = hashString(`${characterKey}-${standardizedAxes.social}-${standardizedAxes.planning}-${standardizedAxes.focus}-${standardizedAxes.drive}`);
    const displayName = toMysteryName(characterKey);
    const rankedAxes = [...AXES]
      .map((axis) => ({ axis, value: standardizedAxes[axis] || 0, magnitude: Math.abs(standardizedAxes[axis] || 0) }))
      .sort((a, b) => b.magnitude - a.magnitude);
    const dominant = rankedAxes[0] || { axis: 'focus', value: 0 };

    const openings = [
      `Today feels very ${displayName} for you.`,
      `You are carrying clear ${displayName} energy today.`,
      `Your day is likely to unfold in a ${displayName}-like rhythm.`,
    ];

    const dominantAdvice = {
      social: dominant.value >= 0
        ? 'Expect more interaction than usual; one meaningful conversation can shift the whole day.'
        : 'Protect quiet space on purpose; depth will help you more than crowd energy right now.',
      planning: dominant.value >= 0
        ? 'A simple plan made early will save you time and emotional friction later.'
        : 'Leave room for improvisation; staying flexible will produce better timing than over-structuring.',
      focus: dominant.value >= 0
        ? 'Someone may need emotional steadiness from you, and your listening will matter more than quick fixes.'
        : 'Your clear analysis is a strength today; call the pattern early and avoid over-explaining it.',
      drive: dominant.value >= 0
        ? 'Momentum is on your side, so commit to one priority and finish it cleanly.'
        : 'Pace yourself and choose sustainable wins; consistency will beat intensity today.',
    };

    const closers = [
      'If something unexpected happens, trust your baseline; it is already stronger than you think.',
      'Keep the day simple and intentional, and your best traits will show up naturally.',
      'You do not need a perfect day, only a clear next move and honest pacing.',
    ];

    return [pickBySeed(openings, seed), dominantAdvice[dominant.axis], pickBySeed(closers, seed + 3)].join(' ');
  };

  const maybeInjectRecoveryRound = (nextAxes) => {
    const live = computeLiveQuality();
    const reliabilityNow = Math.round((live.integrity * 0.58) + ((live.pairConsistency || 0.5) * 100 * 0.24) + ((live.coherence || 0.5) * 100 * 0.18));
    const severe = reliabilityNow < 42 || live.integrity < 45;
    const moderate =
      reliabilityNow < 54 &&
      (live.integrity < 60 || (live.pairConsistency || 0.5) < 0.62 || (live.coherence || 0.5) < 0.55);

    if (!severe && !moderate) return false;

    // Reliability Recovery Logic:
    // When patterns are inconsistent, we inject high-weighted questions to force a clear alignment.
    const maxRecoveryRounds = severe ? 2 : 1;
    if (recoveryRoundRef.current >= maxRecoveryRounds) return false;

    const askedIds = new Set(questions.map((q) => q.id));
    const pool = RELIABILITY_RECOVERY_BANK.filter((q) => !askedIds.has(q.id));
    if (!pool.length) return false;

    const byId = (id) => pool.find((q) => q.id === id);
    const pickIds = (ids) => ids.map((id) => byId(id)).filter(Boolean);

    // Dynamic question injection based on severity
    let selected = severe
      ? [...pickIds([901, 902, 903, 904, 907, 908]), ...pickIds([905, 906])]
      : [...pickIds([901, 902]), ...pickIds([903, 904]).slice(0, 1), ...pickIds([905, 906, 907, 908]).sort(() => Math.random() - 0.5).slice(0, 2)];

    if (!selected.length || selected.length < (severe ? 6 : 3)) {
      const fallbackCount = severe ? 8 : 4;
      selected = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(fallbackCount, pool.length));
    }
    if (!selected.length) return false;

    recoveryRoundRef.current += 1;
    pendingAxesRef.current = nextAxes;
    setQuestions((prev) => [...prev, ...selected]);
    setIntegrityCheckpoint({
      integrity: live.integrity,
      reliability: reliabilityNow,
      isCalibration: true,
      message: severe
        ? 'Your response pattern shows high variance. A Deep Calibration phase has been activated to ensure an accurate character match.'
        : 'A Calibration phase has been added to improve your profile reliability.',
    });
    return true;
  };

  const continueStepTransition = (nextAxes) => {
    if (currentStep < questions.length) {
      const nextIndex = currentStep;
      const remaining = questions.slice(nextIndex);
      const nextQuestion = pickMostInformativeQuestion(remaining);
      if (nextQuestion) {
        const reordered = [
          ...questions.slice(0, nextIndex),
          nextQuestion,
          ...remaining.filter((q) => q.id !== nextQuestion.id),
        ];
        setQuestions(reordered);
      }
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(nextAxes || axes);
    }
  };

  const resumeAfterIntegrityCheckpoint = () => {
    const axesToUse = pendingAxesRef.current || axes;
    pendingAxesRef.current = null;
    setIntegrityCheckpoint(null);
    continueStepTransition(axesToUse);
  };

  const advanceStep = (nextAxes) => {
    if (currentStep > 5 && currentStep < questions.length) {
      const liveQuality = computeLiveQuality();
      const enoughSpacing = (currentStep - lastIntegrityPromptStepRef.current) >= 6;
      const canPrompt = integrityPromptCountRef.current < 2 && enoughSpacing && !integrityCheckpoint;
      if (canPrompt && liveQuality.integrity < 52) {
        pendingAxesRef.current = nextAxes;
        integrityPromptCountRef.current += 1;
        lastIntegrityPromptStepRef.current = currentStep;
        setIntegrityCheckpoint({
          integrity: liveQuality.integrity,
          message: 'Your recent pattern looks inconsistent. Please answer from your real baseline rather than idealized or random choices.',
        });
        return;
      }
    }
    if (currentStep >= questions.length) {
      const injected = maybeInjectRecoveryRound(nextAxes);
      if (injected) return;
    }
    continueStepTransition(nextAxes);
  };

  const calculateResult = (finalAxes) => {
    setCurrentStep(questions.length + 1);
    const totalSignal = AXES.reduce((sum, axis) => sum + (axisSignalRef.current[axis] || 0), 0);
    const axisWeight = AXES.reduce((acc, axis) => {
      const baseSignal = axisSignalRef.current[axis] || 0;
      const ratio = totalSignal > 0 ? baseSignal / totalSignal : 0.25;
      // Weight axes with stronger evidence slightly more, but keep bounds tight.
      acc[axis] = Math.max(0.75, Math.min(1.7, 0.95 + ratio * 2.1));
      return acc;
    }, {});

    const standardizedAxes = AXES.reduce((acc, axis) => {
      const raw = finalAxes[axis] || 0;
      const axisSignal = Math.max(8, axisSignalRef.current[axis] || 8);
      acc[axis] = Math.max(-100, Math.min(100, Math.round((raw / axisSignal) * 100)));
      return acc;
    }, {});

    const normalizedAxes = AXES.reduce((acc, axis) => {
      // Convert standardized axis signal into the same rough scale as character profiles (~-10..10).
      acc[axis] = Math.max(-10, Math.min(10, Math.round((standardizedAxes[axis] / 10) * 10) / 10));
      return acc;
    }, {});

    const tScores = AXES.reduce((acc, axis) => {
      const standardized = standardizedAxes[axis] || 0;
      acc[axis] = Math.max(30, Math.min(70, Math.round(50 + (standardized * 0.18))));
      return acc;
    }, {});

    const axisPercentiles = AXES.reduce((acc, axis) => {
      const standardized = (standardizedAxes[axis] || 0) / 100;
      const percentile = 100 / (1 + Math.exp(-(standardized * 3.2)));
      acc[axis] = Math.round(percentile);
      return acc;
    }, {});

    const consistency = AXES.reduce((sum, axis) => {
      const pos = axisPolarityRef.current[axis]?.pos || 0;
      const neg = axisPolarityRef.current[axis]?.neg || 0;
      const total = pos + neg;
      if (!total) return sum + 0.5;
      return sum + (Math.max(pos, neg) / total);
    }, 0) / AXES.length;

    const liveQuality = computeLiveQuality();
    const responseIntegrity = liveQuality.integrity;
    const coherence = liveQuality.coherence;
    const sliderExtremeRate = liveQuality.sliderExtremeRate;
    const pairConsistency = liveQuality.pairConsistency;
    const qualityMultiplier = 0.82 + ((responseIntegrity / 100) * 0.18);
    const coverageMultiplier = Math.max(0.84, Math.min(1.02, 0.84 + (Math.min(totalSignal, 300) / 300) * 0.18));

    const normalizedMag = Math.sqrt(AXES.reduce((sum, axis) => sum + (normalizedAxes[axis] || 0) * (normalizedAxes[axis] || 0), 0)) || 1;
    const maxDistance = Math.sqrt(AXES.reduce((sum, axis) => sum + ((axisWeight[axis] || 1) * 20 * 20), 0)) || 1;
    const rankedMatches = Object.entries(CHAR_PROFILES)
      .map(([key, profile]) => {
        const dx = (normalizedAxes.social || 0) - (profile.social || 0);
        const dy = (normalizedAxes.planning || 0) - (profile.planning || 0);
        const dz = (normalizedAxes.focus || 0) - (profile.focus || 0);
        const dw = (normalizedAxes.drive || 0) - (profile.drive || 0);
        const weightedDistance = Math.sqrt(
          axisWeight.social * dx * dx +
          axisWeight.planning * dy * dy +
          axisWeight.focus * dz * dz +
          axisWeight.drive * dw * dw
        );

        const distanceScore = Math.max(0, Math.min(100, 100 - ((weightedDistance / maxDistance) * 100)));
        const meanAbsDelta = (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) + Math.abs(dw)) / AXES.length;
        const axisAgreementScore = Math.max(0, Math.min(100, 100 - (meanAbsDelta * 8.2)));

        const profileMag = Math.sqrt(AXES.reduce((sum, axis) => sum + (profile[axis] || 0) * (profile[axis] || 0), 0)) || 1;
        const dot = AXES.reduce((sum, axis) => sum + (normalizedAxes[axis] || 0) * (profile[axis] || 0), 0);
        const cosineSimilarity = Math.max(-1, Math.min(1, dot / (normalizedMag * profileMag)));
        const alignmentScore = ((cosineSimilarity + 1) / 2) * 100;

        const baseSuitability =
          (distanceScore * 0.52) +
          (alignmentScore * 0.31) +
          (axisAgreementScore * 0.17);

        const suitabilityScore = Math.round(
          Math.max(10, Math.min(99, baseSuitability * qualityMultiplier * coverageMultiplier))
        );

        return {
          key,
          profile,
          weightedDistance,
          cosineSimilarity,
          distanceScore,
          alignmentScore,
          axisAgreementScore,
          suitabilityScore,
        };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    const bestMatch = rankedMatches[0] || { key: 'Mitsumi', weightedDistance: 0, suitabilityScore: 60, cosineSimilarity: 0 };
    const runnerUp = rankedMatches[1] || bestMatch;

    const temperature = 14;
    const scores = rankedMatches.map((m) => Math.exp((m.suitabilityScore || 0) / temperature));
    const scoreSum = scores.reduce((sum, s) => sum + s, 0) || 1;
    const bestProb = scores.length ? (scores[0] / scoreSum) : 0.5;
    const separation = Math.max(0, (bestMatch.suitabilityScore || 0) - (runnerUp.suitabilityScore || 0));

    const reliabilityIndex = Math.round(
      Math.max(
        28,
        Math.min(
          99,
          (
            (responseIntegrity * 0.54) +
            ((pairConsistency * 100) * 0.22) +
            ((consistency * 100) * 0.14) +
            ((Math.max(0, separation) * 2.1) * 0.10)
          )
        )
      )
    );
    const exploratoryOnly = reliabilityIndex < 58;

    const baseConfidence = Math.max(
      58,
      Math.min(
        98,
        Math.round(
          ((bestMatch.suitabilityScore || 60) * 0.52) +
          (bestProb * 100 * 0.28) +
          (separation * 1.8) +
          (Math.min(totalSignal, 320) * 0.055) +
          (consistency * 11)
        )
      )
    );
    const confidence = Math.round(baseConfidence * (0.68 + ((responseIntegrity / 100) * 0.32)) * (exploratoryOnly ? 0.88 : 1));

    const bestDisplayName = toMysteryName(bestMatch.key);
    const portraitLookupName = bestDisplayName;
    const matchObj = portraitData.find((p) => p.name === portraitLookupName || p.name.includes(portraitLookupName)) || portraitData[5];
    const matchReason = buildDynamicReason(bestMatch.key, standardizedAxes, reliabilityIndex);
    const dynamicPrediction = buildDynamicPrediction(bestMatch.key, standardizedAxes);

    const dedupedScores = new Map();
    rankedMatches.forEach((entry) => {
      const displayName = toMysteryName(entry.key);
      const previous = dedupedScores.get(displayName);
      if (!previous || entry.suitabilityScore > previous.score) {
        dedupedScores.set(displayName, {
          name: displayName,
          score: entry.suitabilityScore,
          distanceScore: Math.round(entry.distanceScore),
          alignmentScore: Math.round(entry.alignmentScore),
          axisAgreementScore: Math.round(entry.axisAgreementScore),
        });
      }
    });

    const characterScores = Array.from(dedupedScores.values())
      .sort((a, b) => b.score - a.score);

    const topCandidates = characterScores.slice(0, 5).map((entry) => ({
      name: entry.name,
      score: entry.score,
    }));
    const runnerUpDisplay = characterScores.find((entry) => entry.name !== bestDisplayName)?.name || toMysteryName(runnerUp.key);

    setTimeout(() => {
      triggerHaptic('success');
      setMatchedResult({ 
        character: matchObj, 
        reason: matchReason,
        prediction: dynamicPrediction,
        confidence,
        suitabilityScore: bestMatch.suitabilityScore,
        finalAxes,
        axisWeight,
        topMatch: bestDisplayName,
        runnerUp: runnerUpDisplay,
        consistency,
        cosineSimilarity: bestMatch.cosineSimilarity,
        tScores,
        axisPercentiles,
        topCandidates,
        characterScores,
        standardizedAxes,
        responseIntegrity,
        coherence,
        sliderExtremeRate,
        pairConsistency,
        reliabilityIndex,
        exploratoryOnly,
        recoveryRounds: recoveryRoundRef.current,
      });
      setCurrentStep(questions.length + 2);
    }, 2400);
  };

  const renderContent = () => {
    if (integrityCheckpoint) {
      const isCalib = integrityCheckpoint.isCalibration;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={{ width: '100%', maxWidth: isMobile ? '360px' : '520px', zIndex: 100 }}
        >
          <div 
            className="sketchbook-border" 
            style={{ 
              background: isCalib ? '#fefce8' : '#fff7ed', 
              border: `2px solid ${isCalib ? '#fde047' : '#fdba74'}`, 
              borderBottom: `6px solid ${isCalib ? '#eab308' : '#f97316'}`, 
              borderRadius: '16px', 
              padding: isMobile ? '20px 16px' : '24px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={24} color={isCalib ? '#a16207' : '#9a3412'} fill={isCalib ? '#fde047' : 'none'} />
              <h3 style={{ fontFamily: 'var(--font-hand)', color: isCalib ? '#854d0e' : '#9a3412', fontSize: isMobile ? '1.5rem' : '1.7rem', margin: 0 }}>
                {isCalib ? 'Deep Calibration Mode' : 'Integrity Check'}
              </h3>
            </div>
            
            <div style={{ fontFamily: 'Sniglet', color: isCalib ? '#713f12' : '#7c2d12', fontSize: '1rem', lineHeight: 1.5, background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '8px', border: `1px dashed ${isCalib ? '#facc15' : '#fdba74'}` }}>
              {integrityCheckpoint.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
              <div style={{ fontFamily: 'Sniglet', color: '#9a3412', fontSize: '0.85rem' }}>
                Signal Strength: <strong>{integrityCheckpoint.integrity}%</strong>
              </div>
              {integrityCheckpoint.reliability != null && (
                <div style={{ fontFamily: 'Sniglet', color: '#9a3412', fontSize: '0.85rem' }}>
                   Reliability: <strong>{integrityCheckpoint.reliability}%</strong>
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'Sniglet', color: '#9a3412', fontSize: '0.82rem', lineHeight: 1.4, opacity: 0.8, textAlign: 'center', fontStyle: 'italic' }}>
              "To get the most accurate result, please answer based on your natural instincts rather than over-thinking."
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={resumeAfterIntegrityCheckpoint}
                className="sketchbook-border paper-interact"
                style={{
                  background: isCalib ? '#eab308' : '#f97316',
                  color: 'white',
                  border: `2px solid ${isCalib ? '#ca8a04' : '#ea580c'}`,
                  borderBottom: `4px solid ${isCalib ? '#854d0e' : '#c2410c'}`,
                  padding: isMobile ? '12px 24px' : '14px 32px',
                  fontFamily: 'Sniglet',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '10px'
                }}
              >
                Proceed to Calibration
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (currentStep === 0) {
      return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ textAlign: 'center', width: '100%', maxWidth: isMobile ? '340px' : '420px' }}>
          <div className="sketchbook-border" style={{ background: '#f8fbff', border: '2px solid #bfdbfe', borderBottom: '5px solid #93c5fd', borderRadius: '12px', padding: isMobile ? '18px 14px' : '20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <UserCheck size={isMobile ? 42 : 56} color="#3b82f6" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '2.05rem' : '2rem', color: '#1e40af', margin: '0 0 14px 0', transform: 'rotate(-2deg)' }}>Who are you?</h2>
            <p style={{ fontFamily: isMobile ? 'var(--font-hand)' : 'Sniglet', fontSize: isMobile ? '1.05rem' : '1.1rem', color: '#334155', marginBottom: '22px', lineHeight: 1.45, background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '2px dashed #bfdbfe' }}>
            A fun personality quiz with varied question styles. Just answer based on your usual self.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="sketchbook-border paper-interact"
              style={{
                background: '#3b82f6', border: '2px solid #2563eb', borderBottom: '4px solid #1d4ed8',
                padding: isMobile ? '10px 26px' : '12px 32px', fontFamily: 'Sniglet', fontSize: isMobile ? '1.15rem' : '1.25rem', color: 'white', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              Let's start!
            </motion.button>
          </div>
        </motion.div>
      );
    }

    if (currentStep > 0 && currentStep <= questions.length) {
      const q = questions[currentStep - 1];
      return (
        <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', damping: 22, stiffness: 120 }} style={{ width: '100%', maxWidth: '580px', minHeight: isMobile ? '430px' : '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start', fontFamily: 'Sniglet', color: '#3b82f6', marginBottom: isMobile ? '8px' : '12px', fontSize: isMobile ? '0.85rem' : '1.05rem', background: '#eff6ff', padding: isMobile ? '3px 10px' : '4px 12px', borderRadius: '20px', border: '2px solid #bfdbfe' }}>Question {currentStep} of {questions.length}</div>
          <div className="sketchbook-border" style={{ width: '100%', background: '#f8fbff', border: '2px solid #bfdbfe', borderBottom: '4px solid #93c5fd', borderRadius: '12px', padding: isMobile ? '12px' : '16px', marginBottom: isMobile ? '16px' : '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.34rem' : '1.7rem', color: '#1e293b', textAlign: 'left', width: '100%', margin: 0, lineHeight: 1.3 }}>{q.text}</h3>
          </div>

          {q.type === 'slider' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <DotSlider isMobile={isMobile} value={sliderValue} onChange={setSliderValue} leftLabel={q.leftLabel} rightLabel={q.rightLabel} />
              <div style={{ marginTop: isMobile ? '-10px' : '-6px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleNextSlider(q)}
                className="sketchbook-border paper-interact"
                style={{ marginTop: isMobile ? '4px' : '12px', background: '#3b82f6', color: 'white', border: '2px solid #2563eb', borderBottom: isMobile ? '3px solid #1d4ed8' : '4px solid #1d4ed8', padding: isMobile ? '8px 24px' : '12px 40px', fontFamily: 'Sniglet', fontSize: isMobile ? '1rem' : '1.15rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}
              >
                Next
              </motion.button>
            </div>
          )}

          {q.type === 'choice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px', width: '100%' }}>
              {q.options.map((opt, idx) => {
                const c = CHOICE_COLORS[idx % CHOICE_COLORS.length];
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { triggerHaptic('success'); applyModifiers(opt.modifiers, opt.text, 'choice', { optionIndex: idx }); }}
                    className="sketchbook-border paper-interact"
                    style={{
                      background: c.bg, border: `2px solid ${c.border}`, borderBottom: `4px solid ${c.shadow}`, padding: isMobile ? '12px 14px' : '14px 20px',
                      fontFamily: 'Sniglet', color: c.text, fontSize: isMobile ? '1.02rem' : '1rem', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4
                    }}
                  >
                    {opt.text}
                  </motion.button>
                );
              })}
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
            </div>
          )}

          {q.type === 'yesno' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '16px', width: '100%', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { triggerHaptic('success'); applyModifiers(q.yesModifiers, `${q.text} -> yes`, 'yesno', { optionIndex: 0, pairKey: q.pairKey, pairSlot: q.pairSlot, pairValue: q.pairReverse ? -1 : 1 }); }}
                  className="sketchbook-border paper-interact"
                  style={{ background: '#dcfce7', border: '2px solid #4ade80', borderBottom: '4px solid #16a34a', color: '#14532d', padding: isMobile ? '12px 18px' : '14px 32px', fontFamily: 'Sniglet', fontSize: isMobile ? '1.08rem' : '1.2rem', cursor: 'pointer', flex: 1, maxWidth: isMobile ? '100%' : '180px' }}
                >
                  True
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { triggerHaptic('success'); applyModifiers(q.noModifiers, `${q.text} -> no`, 'yesno', { optionIndex: 1, pairKey: q.pairKey, pairSlot: q.pairSlot, pairValue: q.pairReverse ? 1 : -1 }); }}
                  className="sketchbook-border paper-interact"
                  style={{ background: '#fee2e2', border: '2px solid #f87171', borderBottom: '4px solid #dc2626', color: '#7f1d1d', padding: isMobile ? '12px 18px' : '14px 32px', fontFamily: 'Sniglet', fontSize: isMobile ? '1.08rem' : '1.2rem', cursor: 'pointer', flex: 1, maxWidth: isMobile ? '100%' : '180px' }}
                >
                  False
                </motion.button>
              </div>
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35, width: '100%' }}>
                {getQuestionInstruction(q)}
              </div>
            </div>
          )}

          {q.type === 'duel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '14px', width: '100%' }}>
                <motion.button
                  whileHover={{ scale: 1.03, x: isMobile ? 0 : -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { triggerHaptic('success'); applyModifiers(q.left.modifiers, q.left.text, 'duel', { optionIndex: 0 }); }}
                  className="sketchbook-border paper-interact"
                  style={{
                    flex: 1,
                    background: '#eff6ff',
                    border: '2px solid #93c5fd',
                    borderBottom: '4px solid #60a5fa',
                    padding: isMobile ? '12px 14px' : '14px 16px',
                    fontFamily: 'Sniglet',
                    color: '#1e40af',
                    fontSize: '1rem',
                    lineHeight: 1.35,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {q.left.text}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, x: isMobile ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { triggerHaptic('success'); applyModifiers(q.right.modifiers, q.right.text, 'duel', { optionIndex: 1 }); }}
                  className="sketchbook-border paper-interact"
                  style={{
                    flex: 1,
                    background: '#fef2f2',
                    border: '2px solid #fca5a5',
                    borderBottom: '4px solid #f87171',
                    padding: isMobile ? '12px 14px' : '14px 16px',
                    fontFamily: 'Sniglet',
                    color: '#991b1b',
                    fontSize: '1rem',
                    lineHeight: 1.35,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {q.right.text}
                </motion.button>
              </div>
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35, width: '100%' }}>
                {getQuestionInstruction(q)}
              </div>
            </div>
          )}

          {q.type === 'multi' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((opt, idx) => {
                const selected = multiSelection.includes(idx);
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setMultiSelection((prev) => {
                        const maxSelect = q.maxSelect || 2;
                        if (prev.includes(idx)) return prev.filter((v) => v !== idx);
                        if (prev.length >= maxSelect) return [...prev.slice(1), idx];
                        return [...prev, idx];
                      });
                    }}
                    className="sketchbook-border paper-interact"
                    style={{
                      background: selected ? '#dbeafe' : '#ffffff',
                      border: `2px solid ${selected ? '#60a5fa' : '#cbd5e1'}`,
                      borderBottom: `4px solid ${selected ? '#3b82f6' : '#94a3b8'}`,
                      padding: isMobile ? '11px 13px' : '12px 16px',
                      fontFamily: 'Sniglet',
                      color: '#334155',
                      fontSize: '0.98rem',
                      lineHeight: 1.35,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {selected ? '✓ ' : ''}{opt.text}
                  </motion.button>
                );
              })}
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitMulti(q)}
                  disabled={!multiSelection.length}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: multiSelection.length ? '#3b82f6' : '#93c5fd',
                    color: 'white',
                    border: '2px solid #2563eb',
                    borderBottom: '4px solid #1d4ed8',
                    opacity: multiSelection.length ? 1 : 0.75,
                    padding: isMobile ? '9px 22px' : '10px 26px',
                    fontFamily: 'Sniglet',
                    fontSize: '1rem',
                    cursor: multiSelection.length ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {q.type === 'rank2' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((opt, idx) => {
                const rankPos = rankSelection.indexOf(idx);
                const selected = rankPos !== -1;
                const rankPalette = rankPos === 0
                  ? { bg: '#ecfdf5', border: '#34d399', shadow: '#059669', badgeBg: '#d1fae5', badgeBorder: '#10b981', badgeText: '#065f46' }
                  : rankPos === 1
                    ? { bg: '#fff7ed', border: '#fb923c', shadow: '#ea580c', badgeBg: '#ffedd5', badgeBorder: '#f97316', badgeText: '#9a3412' }
                    : { bg: '#ffffff', border: '#cbd5e1', shadow: '#94a3b8', badgeBg: '#f8fafc', badgeBorder: '#cbd5e1', badgeText: '#94a3b8' };
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setRankSelection((prev) => {
                        if (prev.includes(idx)) return prev.filter((v) => v !== idx);
                        if (prev.length >= 2) return [...prev.slice(1), idx];
                        return [...prev, idx];
                      });
                    }}
                    className="sketchbook-border paper-interact"
                    style={{
                      background: rankPalette.bg,
                      border: `2px solid ${rankPalette.border}`,
                      borderBottom: `4px solid ${rankPalette.shadow}`,
                      padding: isMobile ? '11px 13px' : '12px 16px',
                      fontFamily: 'Sniglet',
                      color: '#334155',
                      fontSize: '0.98rem',
                      lineHeight: 1.35,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{
                      minWidth: '22px',
                      height: '22px',
                      borderRadius: '999px',
                      border: `2px solid ${rankPalette.badgeBorder}`,
                      background: rankPalette.badgeBg,
                      color: rankPalette.badgeText,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontFamily: 'Sniglet'
                    }}>
                      {selected ? rankPos + 1 : ''}
                    </span>
                    {opt.text}
                  </motion.button>
                );
              })}
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitRank(q)}
                  disabled={rankSelection.length < 2}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: rankSelection.length >= 2 ? '#7c3aed' : '#c4b5fd',
                    color: 'white',
                    border: '2px solid #6d28d9',
                    borderBottom: '4px solid #5b21b6',
                    opacity: rankSelection.length >= 2 ? 1 : 0.75,
                    padding: isMobile ? '9px 22px' : '10px 26px',
                    fontFamily: 'Sniglet',
                    fontSize: '1rem',
                    cursor: rankSelection.length >= 2 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {q.type === 'ipsative' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options || []).map((opt, idx) => {
                const isMost = ipsativeMost === idx;
                const isLeast = ipsativeLeast === idx;
                return (
                  <div key={idx} className="sketchbook-border" style={{
                    background: '#ffffff',
                    border: `2px solid ${isMost ? '#22c55e' : isLeast ? '#ef4444' : '#cbd5e1'}`,
                    borderBottom: `4px solid ${isMost ? '#16a34a' : isLeast ? '#dc2626' : '#94a3b8'}`,
                    borderRadius: '10px',
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontFamily: 'Sniglet', color: '#334155', fontSize: '0.98rem', lineHeight: 1.35 }}>{opt.text}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic('selection');
                          setIpsativeMost((prev) => (prev === idx ? null : idx));
                          if (ipsativeLeast === idx) setIpsativeLeast(null);
                        }}
                        className="sketchbook-border paper-interact"
                        style={{
                          flex: 1,
                          background: isMost ? '#dcfce7' : '#f8fafc',
                          border: `2px solid ${isMost ? '#4ade80' : '#cbd5e1'}`,
                          borderBottom: `3px solid ${isMost ? '#16a34a' : '#94a3b8'}`,
                          color: isMost ? '#166534' : '#475569',
                          fontFamily: 'Sniglet',
                          fontSize: '0.9rem',
                          padding: '7px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Most like me
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic('selection');
                          setIpsativeLeast((prev) => (prev === idx ? null : idx));
                          if (ipsativeMost === idx) setIpsativeMost(null);
                        }}
                        className="sketchbook-border paper-interact"
                        style={{
                          flex: 1,
                          background: isLeast ? '#fee2e2' : '#f8fafc',
                          border: `2px solid ${isLeast ? '#f87171' : '#cbd5e1'}`,
                          borderBottom: `3px solid ${isLeast ? '#dc2626' : '#94a3b8'}`,
                          color: isLeast ? '#991b1b' : '#475569',
                          fontFamily: 'Sniglet',
                          fontSize: '0.9rem',
                          padding: '7px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Least like me
                      </motion.button>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitIpsative(q)}
                  disabled={ipsativeMost == null || ipsativeLeast == null || ipsativeMost === ipsativeLeast}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? '#0ea5e9' : '#7dd3fc',
                    color: 'white',
                    border: '2px solid #0284c7',
                    borderBottom: '4px solid #0369a1',
                    opacity: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? 1 : 0.75,
                    padding: isMobile ? '9px 22px' : '10px 26px',
                    fontFamily: 'Sniglet',
                    fontSize: '1rem',
                    cursor: (ipsativeMost != null && ipsativeLeast != null && ipsativeMost !== ipsativeLeast) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {q.type === 'spectrum' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <DotSlider
                isMobile={isMobile}
                value={spectrumValue}
                onChange={setSpectrumValue}
                leftLabel={q.leftLabel}
                rightLabel={q.rightLabel}
              />
              <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem' }}>
                Position: {spectrumValue === 3 ? 'Balanced middle' : spectrumValue < 3 ? `${3 - spectrumValue} step(s) toward left` : `${spectrumValue - 3} step(s) toward right`}
              </div>
              <div style={{ marginTop: '-4px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubmitSpectrum(q)}
                className="sketchbook-border paper-interact"
                style={{
                  background: '#0ea5e9',
                  color: 'white',
                  border: '2px solid #0284c7',
                  borderBottom: '4px solid #0369a1',
                  padding: isMobile ? '9px 22px' : '10px 26px',
                  fontFamily: 'Sniglet',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Continue
              </motion.button>
            </div>
          )}

          {q.type === 'allocation' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options || []).map((opt, idx) => {
                const points = allocationPoints[idx] || 0;
                return (
                  <div key={idx} className="sketchbook-border" style={{
                    background: '#ffffff',
                    border: '2px solid #cbd5e1',
                    borderBottom: '4px solid #94a3b8',
                    borderRadius: '10px',
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontFamily: 'Sniglet', color: '#334155', fontSize: '0.97rem', lineHeight: 1.35 }}>{opt.text}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdjustAllocation(q, idx, -1)}
                        className="sketchbook-border paper-interact"
                        style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderBottom: '3px solid #94a3b8', width: '28px', height: '28px', fontFamily: 'Sniglet', cursor: 'pointer' }}
                      >
                        -
                      </motion.button>
                      <div style={{ minWidth: '26px', textAlign: 'center', fontFamily: 'Sniglet', color: '#1e293b' }}>{points}</div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdjustAllocation(q, idx, 1)}
                        className="sketchbook-border paper-interact"
                        style={{ background: '#eff6ff', border: '2px solid #93c5fd', borderBottom: '3px solid #60a5fa', width: '28px', height: '28px', fontFamily: 'Sniglet', cursor: 'pointer' }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                );
              })}
              <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem', textAlign: 'center' }}>
                Points used: {(q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0)} / {q.budget || 10}
              </div>
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitAllocation(q)}
                  disabled={(q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0) !== (q.budget || 10)}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: (q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0) === (q.budget || 10) ? '#3b82f6' : '#93c5fd',
                    color: 'white',
                    border: '2px solid #2563eb',
                    borderBottom: '4px solid #1d4ed8',
                    opacity: (q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0) === (q.budget || 10) ? 1 : 0.75,
                    padding: isMobile ? '9px 22px' : '10px 26px',
                    fontFamily: 'Sniglet',
                    fontSize: '1rem',
                    cursor: (q.options || []).reduce((sum, _, idx) => sum + (allocationPoints[idx] || 0), 0) === (q.budget || 10) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {q.type === 'confidenceChoice' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options || []).map((opt, idx) => {
                const selected = confidenceSelection.optionIndex === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setConfidenceSelection((prev) => ({ ...prev, optionIndex: idx }));
                    }}
                    className="sketchbook-border paper-interact"
                    style={{
                      background: selected ? '#e0f2fe' : '#ffffff',
                      border: `2px solid ${selected ? '#38bdf8' : '#cbd5e1'}`,
                      borderBottom: `4px solid ${selected ? '#0284c7' : '#94a3b8'}`,
                      padding: isMobile ? '11px 13px' : '12px 16px',
                      fontFamily: 'Sniglet',
                      color: '#334155',
                      fontSize: '0.98rem',
                      lineHeight: 1.35,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.text}
                  </motion.button>
                );
              })}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '2px' }}>
                {[1, 2, 3].map((lvl) => {
                  const active = confidenceSelection.level === lvl;
                  const label = lvl === 1 ? 'Low confidence' : lvl === 2 ? 'Medium confidence' : 'High confidence';
                  const levelPalette = lvl === 1
                    ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fef2f2', activeBorder: '#fca5a5', activeBottom: '#ef4444', activeText: '#7f1d1d' }
                    : lvl === 2
                      ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fffbeb', activeBorder: '#fcd34d', activeBottom: '#f59e0b', activeText: '#92400e' }
                      : { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#ecfeff', activeBorder: '#67e8f9', activeBottom: '#06b6d4', activeText: '#155e75' };
                  return (
                    <motion.button
                      key={lvl}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        triggerHaptic('selection');
                        setConfidenceSelection((prev) => ({ ...prev, level: lvl }));
                      }}
                      className="sketchbook-border paper-interact"
                      style={{
                        background: active ? levelPalette.activeBg : levelPalette.bg,
                        border: `2px solid ${active ? levelPalette.activeBorder : levelPalette.border}`,
                        borderBottom: `3px solid ${active ? levelPalette.activeBottom : levelPalette.bottom}`,
                        color: active ? levelPalette.activeText : levelPalette.text,
                        padding: '7px 8px',
                        fontFamily: 'Sniglet',
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitConfidenceChoice(q)}
                  disabled={confidenceSelection.optionIndex == null}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: confidenceSelection.optionIndex != null ? '#0ea5e9' : '#7dd3fc',
                    color: 'white',
                    border: '2px solid #0284c7',
                    borderBottom: '4px solid #0369a1',
                    opacity: confidenceSelection.optionIndex != null ? 1 : 0.75,
                    padding: isMobile ? '9px 22px' : '10px 26px',
                    fontFamily: 'Sniglet',
                    fontSize: '1rem',
                    cursor: confidenceSelection.optionIndex != null ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {q.type === 'stance' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
                {(q.labels || ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree']).map((label, idx) => {
                  const stancePalettes = [
                    { bg: '#fef2f2', border: '#fca5a5', bottom: '#ef4444', text: '#7f1d1d' },
                    { bg: '#fff7ed', border: '#fdba74', bottom: '#f97316', text: '#9a3412' },
                    { bg: '#eff6ff', border: '#93c5fd', bottom: '#3b82f6', text: '#1e40af' },
                    { bg: '#ecfdf5', border: '#6ee7b7', bottom: '#10b981', text: '#065f46' },
                  ];
                  const palette = stancePalettes[idx] || stancePalettes[0];
                  const active = stanceSelection === idx;
                  return (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        triggerHaptic('success');
                        handleSubmitStance(q, idx);
                      }}
                      className="sketchbook-border paper-interact"
                      style={{
                        background: active ? '#dbeafe' : palette.bg,
                        border: `2px solid ${active ? '#60a5fa' : palette.border}`,
                        borderBottom: `4px solid ${active ? '#3b82f6' : palette.bottom}`,
                        padding: isMobile ? '10px 8px' : '10px 10px',
                        fontFamily: 'Sniglet',
                        color: active ? '#1e40af' : palette.text,
                        fontSize: isMobile ? '0.9rem' : '0.88rem',
                        lineHeight: 1.2,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              <div style={{ marginTop: '2px', fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1rem', textAlign: 'center', lineHeight: 1.35 }}>
                {getQuestionInstruction(q)}
              </div>
            </div>
          )}

        </motion.div>
      );
    }

    if (currentStep === questions.length + 1) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}>
            <ScanSearch size={54} color="#3b82f6" strokeWidth={1.5} />
          </motion.div>
          <div className="sketchbook-border" style={{ textAlign: 'center', background: '#f8fbff', border: '2px solid #bfdbfe', borderBottom: '4px solid #93c5fd', borderRadius: '12px', padding: isMobile ? '14px 16px' : '18px 20px' }}>
             <h3 style={{ fontFamily: 'var(--font-hand)', fontSize: '1.8rem', color: '#1e293b', margin: '0 0 8px 0' }}>Thinking...</h3>
             <p style={{ fontFamily: 'Sniglet', color: '#64748b', margin: 0, fontSize: '1rem' }}>Calculating your vibe against the long list of characters...</p>
          </div>
        </motion.div>
      );
    }

    if (currentStep === questions.length + 2 && matchedResult) {
      const char = matchedResult.character;
      
      let colors = { bg: '#fff', border: '#ccc', text: '#333' };
      const mappedKey = Object.keys(CHARACTER_COLORS).find(k => k.includes(char.name) || char.name.includes(k.split(' ')[0]));
      if (mappedKey && CHARACTER_COLORS[mappedKey]) {
        colors = CHARACTER_COLORS[mappedKey];
      } else {
        colors = fallbackColors[char.name.length % fallbackColors.length] || { bg: '#eff6ff', border: '#bfdbfe', text: '#3b82f6' };
      }

      const resultAxes = matchedResult.standardizedAxes || matchedResult.finalAxes || axes;
      const clampScore = (v) => Math.max(0, Math.min(100, Math.round(v)));
      const traitBands = [
        { label: 'Social', value: resultAxes.social, color: '#38bdf8' },
        { label: 'Planning', value: resultAxes.planning, color: '#a78bfa' },
        { label: 'Focus', value: resultAxes.focus, color: '#34d399' },
        { label: 'Drive', value: resultAxes.drive, color: '#f59e0b' },
        { label: 'Adaptability', value: Math.round((-resultAxes.planning * 0.52) + (resultAxes.drive * 0.34) + (resultAxes.social * 0.24)), color: '#14b8a6' },
        { label: 'Emotional Stability', value: Math.round((resultAxes.focus * 0.55) - (resultAxes.drive * 0.18)), color: '#22c55e' },
        { label: 'Execution Discipline', value: Math.round((resultAxes.planning * 0.52) + (resultAxes.drive * 0.48)), color: '#6366f1' },
        { label: 'Reliability Signal', value: Math.round(((matchedResult.reliabilityIndex || 50) - 50) * 1.7), color: '#ef4444' },
      ].map((trait) => {
        const normalized = Math.max(8, Math.min(100, 50 + (trait.value * 0.45)));
        return { ...trait, normalized };
      });

      return (
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 22 }} style={{ width: '100%', maxWidth: '850px', marginTop: isMobile ? '88px' : '22px' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '24px' : '40px', alignItems: isMobile ? 'center' : 'flex-start', width: '100%' }}>
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: isMobile ? '100%' : '280px' }}>
              <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.9rem' : '2.4rem', color: '#1e40af', margin: '0 0 16px 0', transform: 'rotate(-2deg)' }}>
                You are {char.name}!
              </h2>
              <motion.div
                whileHover={{ scale: 1.03, rotate: 1.5, transition: { duration: 0.2, ease: 'steps(2, end)' } }}
                style={{
                  background: colors.bg,
                  border: `3px solid ${colors.border}`,
                  borderRadius: '12px',
                  borderBottomWidth: '6px',
                  padding: '12px',
                  boxShadow: `0 10px 25px ${colors.border}45`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  transform: 'rotate(-2deg)',
                  width: isMobile ? '200px' : '100%'
                }}
                className="paper-interact"
              >
                <img
                  src={char.src}
                  alt={char.name}
                  style={{
                    width: '100%',
                    height: isMobile ? '180px' : '240px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.15))'
                  }}
                  draggable="false"
                />
                <div style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: isMobile ? '1.3rem' : '1.7rem',
                  fontWeight: 'bold',
                  color: colors.text,
                  background: 'white',
                  padding: '2px 16px',
                  borderRadius: '99px',
                  border: `2px solid ${colors.border}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transform: 'rotate(1deg)'
                }}>
                  {char.name}
                </div>
              </motion.div>
            </div>

            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              <h3 style={{ fontFamily: 'Sniglet', margin: 0, fontSize: '1.2rem', color: colors.text }}>Your check</h3>
              <div className="sketchbook-border" style={{
                background: colors.bg,
                padding: isMobile ? '20px' : '24px',
                borderRadius: '12px',
                border: `2.5px solid ${colors.border}`,
                borderBottom: `5px solid ${colors.border}`,
                fontFamily: 'Sniglet',
                color: colors.text,
                fontSize: isMobile ? '0.98rem' : '1.05rem',
                textAlign: 'left',
                lineHeight: 1.55,
                boxShadow: `0 4px 12px ${colors.border}40`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <p style={{ margin: 0 }}>{matchedResult.reason}</p>
              </div>

              <div className="sketchbook-border" style={{
                background: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '8px',
                border: `2px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'Sniglet',
                color: '#475569',
                fontSize: isMobile ? '1rem' : '1.05rem',
                textAlign: 'left',
                lineHeight: 1.55
              }}>
                <div style={{ fontFamily: 'var(--font-hand)', color: colors.text, fontSize: isMobile ? '1.05rem' : '1.1rem' }}>
                  Daily prediction
                </div>
                <div>{matchedResult.prediction || char.prediction}</div>
              </div>

              <div className="sketchbook-border" style={{
                background: '#ffffff',
                padding: isMobile ? '12px 14px' : '14px 16px',
                borderRadius: '8px',
                border: `2px solid ${colors.border}`,
                borderBottom: `4px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontFamily: 'var(--font-hand)', color: colors.text, fontSize: isMobile ? '1.05rem' : '1.1rem' }}>
                  Personality traits (8)
                </div>
                {traitBands.map((trait) => (
                  <div key={trait.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 34px', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'Sniglet', fontSize: '0.9rem', color: '#64748b' }}>{trait.label}</span>
                    <div style={{ height: '9px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${trait.normalized}%`, background: trait.color, borderRadius: '999px', transition: 'width 300ms ease' }} />
                    </div>
                    <span style={{ fontFamily: 'Sniglet', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'right' }}>{trait.value > 0 ? `+${trait.value}` : trait.value}</span>
                  </div>
                ))}
              </div>

              <div className="sketchbook-border" style={{
                background: '#ffffff',
                padding: isMobile ? '12px 14px' : '14px 16px',
                borderRadius: '8px',
                border: `2px solid ${colors.border}`,
                borderBottom: `4px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontFamily: 'var(--font-hand)', color: colors.text, fontSize: isMobile ? '1.05rem' : '1.1rem' }}>
                  Response quality diagnostics
                </div>
                <div style={{ fontFamily: 'Sniglet', color: matchedResult.exploratoryOnly ? '#b45309' : '#166534', fontSize: '0.92rem', lineHeight: 1.35 }}>
                  Reliability Index: {matchedResult.reliabilityIndex || 50} {matchedResult.exploratoryOnly ? '(Exploratory only)' : '(Stable profile)'}
                </div>
                <div style={{ fontFamily: 'Sniglet', color: '#1e293b', fontSize: '0.9rem', lineHeight: 1.35 }}>
                  Suitability score: {matchedResult.suitabilityScore || 60}
                </div>
                {!!matchedResult.recoveryRounds && (
                  <div style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.86rem', lineHeight: 1.35 }}>
                    Reliability recovery rounds used: {matchedResult.recoveryRounds}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.9rem' }}>Integrity score</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#1e293b', fontSize: '0.9rem', textAlign: 'right' }}>{matchedResult.responseIntegrity || 50}</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.9rem' }}>Answer coherence</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#1e293b', fontSize: '0.9rem', textAlign: 'right' }}>{Math.round((matchedResult.coherence || 0.5) * 100)}%</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.9rem' }}>Pair consistency</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#1e293b', fontSize: '0.9rem', textAlign: 'right' }}>{Math.round((matchedResult.pairConsistency || 0.5) * 100)}%</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.9rem' }}>Extreme response rate</div>
                  <div style={{ fontFamily: 'Sniglet', color: '#1e293b', fontSize: '0.9rem', textAlign: 'right' }}>{Math.round((matchedResult.sliderExtremeRate || 0) * 100)}%</div>
                </div>
                <div style={{ fontFamily: 'Sniglet', color: (matchedResult.responseIntegrity || 50) < 55 ? '#b45309' : '#64748b', fontSize: '0.84rem', lineHeight: 1.35 }}>
                  {(matchedResult.responseIntegrity || 50) < 55
                    ? 'Low integrity pattern detected. Confidence has been reduced to limit strategic or random answer effects.'
                    : 'Stable response pattern detected. Confidence kept near full strength.'}
                </div>
              </div>

              {!!matchedResult.topCandidates?.length && (
                <div className="sketchbook-border" style={{
                  background: '#ffffff',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${colors.border}`,
                  borderBottom: `4px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontFamily: 'var(--font-hand)', color: colors.text, fontSize: isMobile ? '1.05rem' : '1.1rem' }}>
                    Top suitability ranking ({matchedResult.confidence}% confidence)
                  </div>
                  {matchedResult.topCandidates.map((candidate, idx) => (
                    <div key={candidate.name} style={{ display: 'grid', gridTemplateColumns: '95px 1fr 34px', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Sniglet', color: idx === 0 ? colors.text : '#64748b', fontSize: '0.9rem' }}>{candidate.name}</span>
                      <div style={{ height: '9px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${candidate.score}%`, background: idx === 0 ? '#16a34a' : idx === 1 ? '#3b82f6' : '#94a3b8' }} />
                      </div>
                      <span style={{ fontFamily: 'Sniglet', color: '#64748b', fontSize: '0.82rem', textAlign: 'right' }}>{candidate.score}</span>
                    </div>
                  ))}
                  {!!matchedResult.characterScores?.length && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          triggerHaptic('selection');
                          setShowAllScores((prev) => !prev);
                        }}
                        className="sketchbook-border paper-interact"
                        style={{
                          background: showAllScores ? '#e2e8f0' : '#eff6ff',
                          color: '#334155',
                          border: '2px solid #cbd5e1',
                          borderBottom: '3px solid #94a3b8',
                          padding: '6px 12px',
                          fontFamily: 'Sniglet',
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        {showAllScores ? 'Hide all characters' : 'Show all characters'}
                      </motion.button>
                    </div>
                  )}
                  {showAllScores && !!matchedResult.characterScores?.length && (
                    <div style={{ maxHeight: isMobile ? '220px' : '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
                      {matchedResult.characterScores.map((candidate, idx) => (
                        <div key={`full-${candidate.name}`} style={{ display: 'grid', gridTemplateColumns: '16px 1fr 34px', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Sniglet', color: '#94a3b8', fontSize: '0.78rem' }}>{idx + 1}</span>
                          <span style={{ fontFamily: 'Sniglet', color: '#475569', fontSize: '0.88rem' }}>{candidate.name}</span>
                          <span style={{ fontFamily: 'Sniglet', color: '#64748b', fontSize: '0.82rem', textAlign: 'right' }}>{candidate.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontFamily: 'Sniglet', color: '#94a3b8', fontSize: isMobile ? '0.82rem' : '0.86rem', lineHeight: 1.35 }}>
                    Scores are recalculated for all characters using weighted distance, directional alignment, and axis agreement.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', marginTop: '10px' }}>
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: 'white',
                    color: '#4b5563',
                    border: '2px solid #e5e7eb',
                    borderBottom: '4px solid #d1d5db',
                    padding: isMobile ? '10px 24px' : '12px 32px',
                    fontFamily: 'Sniglet',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    cursor: 'pointer'
                  }}
                >
                  Retake quiz
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="planner-container planner-page" style={{ minHeight: isMobile ? '620px' : '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '64px 12px 24px' : '36px', position: 'relative', overflow: 'visible', background: 'transparent' }}>
      {(currentStep === 0 || currentStep === questions.length + 2) && (
        <motion.button 
          onClick={onBack} whileHover={{ x: -2, scale: 1.02 }} whileTap={{ scale: 0.95 }}
          className="sketchbook-border paper-interact"
          style={{ position: 'absolute', top: isMobile ? '12px' : '24px', left: isMobile ? '12px' : '24px', background: 'white', border: '2px solid #e5e7eb', borderBottom: '3px solid #d1d5db', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Sniglet', fontSize: isMobile ? '0.85rem' : '1rem', color: '#4b5563', padding: isMobile ? '6px 12px' : '8px 16px', cursor: 'pointer', zIndex: 100 }}
        >
          <ArrowLeft size={isMobile ? 14 : 16} strokeWidth={2.5} /> {isMobile ? 'Menu' : 'Return to Menu'}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;
