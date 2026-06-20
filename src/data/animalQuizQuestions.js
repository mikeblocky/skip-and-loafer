// Animal quiz question bank. English only, plain wording, no em-dashes.
const option = (text, modifiers) => ({ text, modifiers });

const INSTRUCTIONS = {
  grid: 'Pick the square closest to your real default.',
  sort4: 'Tap all 4 cards from most like you to least like you.',
  pairMatch: 'Pick the 2 cards that feel like they naturally belong together for you.',
  hold: 'Press and hold until the amount feels right.',
  rhythm: 'Tap 4 times in the rhythm that feels most like you.',
  constellation: 'Build a 3-step pattern from first instinct to last instinct.',
  reaction: 'Start the reflex check, wait for the signal, then tap as fast as you can.',
  timing: 'Start the meter and stop it inside the target zone.',
};



const LABELS = {
  warmth: { leftLabel: 'Need space first', rightLabel: 'Soften fast' },
  vigilance: { leftLabel: 'Settle fast', rightLabel: 'Stay on watch' },
  independence: { leftLabel: 'Still want company', rightLabel: 'Need my own corner' },
  play: { leftLabel: 'Rarely', rightLabel: 'Very easily' },
  guardExplore: { leftLabel: 'Guard first', rightLabel: 'Explore first' },
  orderMischief: { leftLabel: 'Order', rightLabel: 'Mischief' },
  closeSpace: { leftLabel: 'Close', rightLabel: 'Space' },
  calmChaos: { leftLabel: 'Calm', rightLabel: 'Chaos' },
  comfortAdventure: { leftLabel: 'Comfort', rightLabel: 'Adventure' },
  routineFlex: { leftLabel: 'Routine', rightLabel: 'Flex' },
  guardPlay: { leftLabel: 'Guard', rightLabel: 'Play' },
};









const OPTION_SETS = {
  roomFirst: [
    option('Find a safe face', { warmth: 10, comfort: 6 }),
    option('Scan the room', { vigilance: 12, curiosity: 5 }),
    option('Claim a cozy corner', { comfort: 12, independence: 2 }),
    option('Keep range', { independence: 10, vigilance: 8 }),
  ],
  disruption: [
    option('Inspect the change', { curiosity: 10, vigilance: 6 }),
    option('Return to routine', { comfort: 12, vigilance: 4 }),
    option('Check my people', { warmth: 12, vigilance: 4 }),
    option('Shift the mood with humor', { play: 12, warmth: 6 }),
  ],
  compliment: [
    option('You make people feel safe', { warmth: 12, comfort: 4 }),
    option('You notice what others miss', { vigilance: 12, curiosity: 5 }),
    option('You have chaotic charm', { play: 12, warmth: 4 }),
    option('You keep your center', { independence: 12, vigilance: 4 }),
  ],
  trustOpen: [
    option('Gentle consistency', { comfort: 12, warmth: 6 }),
    option('Room for my pace', { independence: 12, comfort: 2 }),
    option('Easy playful moments', { play: 10, warmth: 8 }),
    option('Clear signals', { vigilance: 12, comfort: 4 }),
  ],
  resetModes: [
    option('Blanket and familiar corner', { comfort: 12, warmth: 2 }),
    option('Roam alone', { independence: 12, curiosity: 6 }),
    option('Play with trusted people', { warmth: 10, play: 10 }),
    option('Watch first, join later', { vigilance: 12, independence: 4 }),
  ],
  throwoffs: [
    option('Clingy people', { independence: 12, warmth: -4 }),
    option('Loud tension', { vigilance: 12, comfort: 8 }),
    option('Nothing interesting', { curiosity: 12, play: 6 }),
    option('Far from safe people', { warmth: 12, comfort: 4 }),
  ],
  comfortSignals: [
    option('Warm drink', { comfort: 10, warmth: 2 }),
    option('Private corner', { independence: 10, comfort: 4 }),
    option('Soft person nearby', { warmth: 12, comfort: 2 }),
    option('Tiny thing to inspect', { curiosity: 10, vigilance: 4 }),
  ],
  energyLeaks: [
    option('Too much caretaking', { warmth: 8, vigilance: 4 }),
    option('Constant noise', { vigilance: 10, comfort: 8 }),
    option('No room to wander', { independence: 10, curiosity: 8 }),
    option('Forced cheer too long', { comfort: 6, independence: 6 }),
  ],
};


const OPTION_SETS_2 = {
  priorities: [
    option('Find a safe signal', { warmth: 10, comfort: 6 }),
    option('Map exits and patterns', { vigilance: 12, curiosity: 6 }),
    option('Test the vibe with play', { play: 12, warmth: 4 }),
    option('Keep enough distance to leave', { independence: 12, vigilance: 4 }),
  ],
  firstTraits: [
    option('Soft and warm', { warmth: 12, comfort: 4 }),
    option('Quiet and precise', { vigilance: 12, independence: 4 }),
    option('Restless and curious', { curiosity: 12, independence: 6 }),
    option('Goofy and alive', { play: 12, warmth: 4 }),
  ],
  safeAgain: [
    option('Trusted closeness', { warmth: 12, comfort: 4 }),
    option('Time to scan what changed', { vigilance: 12, curiosity: 4 }),
    option('Familiar comfort', { comfort: 14, vigilance: 2 }),
    option('Private range', { independence: 14, comfort: 2 }),
  ],
  trustMarkers: [
    option('I can relax', { comfort: 12, warmth: 4 }),
    option('They notice subtle shifts', { vigilance: 10, warmth: 4 }),
    option('They respect my pace', { independence: 12, comfort: 4 }),
    option('We can be silly easily', { play: 12, warmth: 6 }),
  ],
  stressModes: [
    option('Cling to safe people', { warmth: 12, comfort: 8, independence: -4 }),
    option('Go quiet and observant', { vigilance: 12, independence: 8 }),
    option('Create movement', { play: 12, warmth: 6 }),
    option('Protect routines', { comfort: 12, vigilance: 6 }),
  ],
  uncertaintyModes: [
    option('Stay close to familiar things', { comfort: 12, warmth: 4 }),
    option('Slip away and observe', { independence: 10, vigilance: 8 }),
    option('Turn it into a game', { play: 12, warmth: 6 }),
    option('Investigate until it makes sense', { curiosity: 10, vigilance: 10 }),
  ],
  homeModes: [
    option('Soft homebody', { comfort: 14, warmth: 4 }),
    option('Quiet scout', { vigilance: 10, curiosity: 10 }),
    option('Warm little chaos', { play: 12, warmth: 10 }),
    option('Independent wanderer', { independence: 14, curiosity: 8 }),
  ],
  careModes: [
    option('Stay close and soften the air', { warmth: 12, comfort: 6 }),
    option('Track the cause quietly', { vigilance: 12, curiosity: 4 }),
    option('Lift them with a joke', { play: 12, warmth: 8 }),
    option('Give space then return', { independence: 10, warmth: 6 }),
  ],
  allocIdeal: [
    option('Trusted closeness', { warmth: 14 }),
    option('Interesting things to inspect', { curiosity: 14 }),
    option('Safe nest', { comfort: 14, vigilance: 4 }),
    option('Freedom to roam', { independence: 14 }),
  ],
  allocTrust: [
    option('Consistency', { comfort: 12, vigilance: 8 }),
    option('Gentleness', { warmth: 14 }),
    option('Respect for my space', { independence: 14 }),
    option('Easy fun', { play: 12, warmth: 6 }),
  ],
  allocRestore: [
    option('Silence', { comfort: 12, vigilance: 4 }),
    option('Movement', { play: 12, curiosity: 6 }),
    option('Warm company', { warmth: 12, comfort: 4 }),
    option('Private range', { independence: 14 }),
  ],
  allocCore: [
    option('Feeling safe', { comfort: 12, vigilance: 4 }),
    option('Feeling close', { warmth: 14 }),
    option('Feeling free', { independence: 14 }),
    option('Feeling alive', { play: 12, curiosity: 6 }),
  ],
  pairRoomFlow: [
    option('Stay near one safe signal', { warmth: 10, comfort: 8 }),
    option('Circle and observe the edges', { vigilance: 12, independence: 4 }),
    option('Follow whatever looks alive', { curiosity: 12, play: 6 }),
    option('Make a small private base', { comfort: 10, independence: 8 }),
    option('Test the air with a joke', { play: 10, warmth: 8 }),
    option('Track the calmest route out', { vigilance: 10, comfort: 6 }),
  ],
  pairCareLoop: [
    option('Sit quietly nearby', { warmth: 12, comfort: 6 }),
    option('Notice the smallest shifts', { vigilance: 12, curiosity: 4 }),
    option('Bring a tiny comfort item', { comfort: 12, warmth: 4 }),
    option('Break the heaviness with play', { play: 12, warmth: 6 }),
    option('Give space and return later', { independence: 12, warmth: 4 }),
    option('Fix the surrounding setup', { comfort: 10, vigilance: 6 }),
  ],
  pairResetArc: [
    option('Warm drink or blanket', { comfort: 12, warmth: 4 }),
    option('Long quiet roam', { independence: 12, curiosity: 6 }),
    option('Trusted person who gets it', { warmth: 14, comfort: 4 }),
    option('Something small to investigate', { curiosity: 12, vigilance: 4 }),
    option('A silly little ritual', { play: 10, comfort: 6 }),
    option('Total control of the room', { independence: 10, vigilance: 8 }),
  ],
};
Object.assign(OPTION_SETS, OPTION_SETS_2);

const DUELS = {
  quietVsMove: { left: option('Curl up in a safe spot', { comfort: 14, independence: 6 }), right: option('Move and shake it off', { curiosity: 10, play: 10 }) },
  peopleVsPattern: { left: option('Read people first', { warmth: 10, vigilance: 6 }), right: option('Read the pattern first', { vigilance: 12, curiosity: 6 }) },
  nestVsAdventure: { left: option('Return to something known', { comfort: 14, warmth: 2 }), right: option('Follow what looks alive', { curiosity: 12, play: 8 }) },
  softenVsDistance: { left: option('Lean in gently', { warmth: 12, comfort: 4 }), right: option('Give myself range', { independence: 12, vigilance: 4 }) },
};

const TRADEOFFS = {
  closeVsSpace: { left: option('Stay available to my people', { warmth: 14, comfort: 6, independence: -4 }), right: option('Protect room to reset alone', { independence: 14, vigilance: 6, warmth: -4 }) },
  comfortVsAdventure: { left: option('Known softness', { comfort: 14, warmth: 6, curiosity: -4 }), right: option('Fresh signals', { curiosity: 14, independence: 8, comfort: -4 }) },
  routineVsFlex: { left: option('Known rhythm', { comfort: 12, vigilance: 8 }), right: option('Live adaptation', { play: 8, curiosity: 10, comfort: -4 }) },
  guardVsPlay: { left: option('Stay watchful', { vigilance: 14, comfort: 4 }), right: option('Lighten it with play', { play: 14, warmth: 6 }) },
};

const GRIDS = {
  socialNest: { xLeftLabel: 'Cozy', xRightLabel: 'Open', yTopLabel: 'Close', yBottomLabel: 'Solo', options: [option('Close and nested', { warmth: 12, comfort: 10 }), option('Close and bright', { warmth: 12, play: 8 }), option('Solo and sheltered', { independence: 12, comfort: 10 }), option('Solo and roaming', { independence: 12, curiosity: 10 })] },
  watchWarm: { xLeftLabel: 'Watchful', xRightLabel: 'Soft', yTopLabel: 'Still', yBottomLabel: 'Animated', options: [option('Still and watchful', { vigilance: 14, comfort: 4 }), option('Still and soft', { warmth: 12, comfort: 6 }), option('Animated and watchful', { vigilance: 10, play: 6 }), option('Animated and soft', { warmth: 12, play: 10 })] },
};

const QUESTIONS = [
    // --- New guessing game type ---
    { id: 2100, type: 'guess', pairKey: 'guess-intuition', pairSlot: 'a', text: 'Guess which hand the treat is in. Trust your first instinct.', leftLabel: 'Left', rightLabel: 'Right', leftModifiers: { curiosity: 8, play: 6 }, rightModifiers: { vigilance: 8, independence: 6 } },

    // --- Portrait memory game ---
    { id: 2101, type: 'flip', pairKey: 'flip-memory', pairSlot: 'a', text: 'Match all 10 character pairs from memory to prove your focus.', previewLabel: 'Take a few seconds to study the cards before they flip.', playLabel: 'Match all 10 pairs from memory.', timerLabel: 'Time', completedLabel: 'Completed in', retryLabel: 'Retry round', fastResultLabel: 'Sharp memory', steadyResultLabel: 'Steady matcher', slowResultLabel: 'Careful matcher', previewMs: 7200, pairCount: 10, fastThresholdMs: 34000, steadyThresholdMs: 56000, fastModifiers: { curiosity: 16, vigilance: 10, play: 8 }, steadyModifiers: { comfort: 6, vigilance: 4, independence: 2 }, slowModifiers: { curiosity: -4, comfort: 2, vigilance: 1, play: -6 } },
  { id: 2001, type: 'slider', axis: 'warmth', text: 'Warm-up speed with trusted people?', labelKey: 'warmth' },
  { id: 2002, type: 'slider', axis: 'vigilance', text: 'Alertness in new spaces?', labelKey: 'vigilance' },
  { id: 2003, type: 'slider', axis: 'independence', text: 'Need for solo reset time?', labelKey: 'independence' },
  { id: 2004, type: 'slider', axis: 'play', text: 'Playfulness once safe?', labelKey: 'play' },
  { id: 2005, type: 'choice', text: 'New room, first move?', optionKey: 'roomFirst' },
  { id: 2006, type: 'choice', text: 'Unexpected disruption, first instinct?', optionKey: 'disruption' },
  { id: 2007, type: 'choice', text: 'Best compliment for you?', optionKey: 'compliment' },
  { id: 2008, type: 'choice', text: 'A bond opens when...', optionKey: 'trustOpen' },
  { id: 2009, type: 'yesno', pairKey: 'warm', pairSlot: 'a', text: 'I like greeting trusted people first.', yesModifiers: { warmth: 12, play: 6 }, noModifiers: { independence: 8, vigilance: 4, warmth: -6 } },
  { id: 2010, type: 'yesno', pairKey: 'warm', pairSlot: 'b', pairReverse: true, text: 'Even with safe people, I warm up slowly.', yesModifiers: { comfort: 8, independence: 6, warmth: -4 }, noModifiers: { warmth: 10, play: 4, comfort: -2 } },
  { id: 2011, type: 'yesno', pairKey: 'watch', pairSlot: 'a', text: 'I notice tiny tone shifts early.', yesModifiers: { vigilance: 12, warmth: 4 }, noModifiers: { play: 4, comfort: 4, vigilance: -8 } },
  { id: 2012, type: 'yesno', pairKey: 'watch', pairSlot: 'b', pairReverse: true, text: 'Once a place feels safe, I stop monitoring fast.', yesModifiers: { comfort: 8, warmth: 4, vigilance: -8 }, noModifiers: { vigilance: 12, independence: 4 } },
  { id: 2013, type: 'duel', text: 'Default recovery mode?', duelKey: 'quietVsMove' },
  { id: 2014, type: 'duel', text: 'Read what first in uncertainty?', duelKey: 'peopleVsPattern' },
  { id: 2015, type: 'duel', text: 'Worn down: what pulls harder?', duelKey: 'nestVsAdventure' },
  { id: 2016, type: 'duel', text: 'When someone matters, what comes first?', duelKey: 'softenVsDistance' },
  { id: 2017, type: 'multi', maxSelect: 2, text: 'Choose up to two reset modes.', optionKey: 'resetModes' },
  { id: 2018, type: 'multi', maxSelect: 2, text: 'Choose up to two rhythm killers.', optionKey: 'throwoffs' },
  { id: 2019, type: 'multi', maxSelect: 2, text: 'Choose up to two comfort signals.', optionKey: 'comfortSignals' },
  { id: 2020, type: 'multi', maxSelect: 2, text: 'Choose up to two energy leaks.', optionKey: 'energyLeaks' },
  { id: 2021, type: 'rank2', text: 'Rank top 2 priorities in unknown space.', optionKey: 'priorities' },
  { id: 2022, type: 'rank2', text: 'Rank the first traits people notice.', optionKey: 'firstTraits' },
  { id: 2023, type: 'rank2', text: 'Rank the top 2 safe-again needs.', optionKey: 'safeAgain' },
  { id: 2024, type: 'rank2', text: 'Rank the top 2 trust markers.', optionKey: 'trustMarkers' },
  { id: 2025, type: 'ipsative', text: 'Under stress: pick MOST and LEAST like you.', optionKey: 'stressModes' },
  { id: 2026, type: 'ipsative', text: 'In uncertainty: pick MOST and LEAST natural.', optionKey: 'uncertaintyModes' },
  { id: 2027, type: 'ipsative', text: 'Home pattern: pick MOST and LEAST like you.', optionKey: 'homeModes' },
  { id: 2028, type: 'ipsative', text: 'Care style: pick MOST and LEAST like you.', optionKey: 'careModes' },
  { id: 2029, type: 'spectrum', pairKey: 'guard-explore', pairSlot: 'a', text: 'Unknown space: where do you lean first?', labelKey: 'guardExplore', left: { modifiers: { vigilance: 16, comfort: 4 } }, right: { modifiers: { curiosity: 16, independence: 6, play: 2 } } },
  { id: 2030, type: 'spectrum', pairKey: 'guard-explore', pairSlot: 'b', pairReverse: true, text: 'Fully yourself: where does energy lean?', labelKey: 'orderMischief', left: { modifiers: { comfort: 12, vigilance: 6, play: -4 } }, right: { modifiers: { play: 14, curiosity: 8, comfort: -4 } } },
  { id: 2031, type: 'spectrum', pairKey: 'close-space', pairSlot: 'a', text: 'Low energy day: what does your system want?', labelKey: 'closeSpace', left: { modifiers: { warmth: 14, comfort: 6 } }, right: { modifiers: { independence: 14, vigilance: 6 } } },
  { id: 2032, type: 'spectrum', pairKey: 'mood-shape', pairSlot: 'a', text: 'Your room imprint feels more...', labelKey: 'calmChaos', left: { modifiers: { comfort: 10, vigilance: 4 } }, right: { modifiers: { play: 12, warmth: 4 } } },
  { id: 2033, type: 'allocation', budget: 10, text: 'Distribute 10 points across your ideal day.', optionKey: 'allocIdeal' },
  { id: 2034, type: 'allocation', budget: 10, text: 'Distribute 10 points across what earns trust.', optionKey: 'allocTrust' },
  { id: 2035, type: 'allocation', budget: 10, text: 'Distribute 10 points across what restores you.', optionKey: 'allocRestore' },
  { id: 2036, type: 'allocation', budget: 10, text: 'Distribute 10 points across what feels core.', optionKey: 'allocCore' },
  { id: 2037, type: 'confidenceChoice', text: 'New object in your space: baseline response?', optionKey: 'roomFirst' },
  { id: 2038, type: 'confidenceChoice', text: 'Someone you care about is off: baseline response?', optionKey: 'careModes' },
  { id: 2039, type: 'confidenceChoice', text: 'Shared room role that comes easiest?', optionKey: 'firstTraits' },
  { id: 2040, type: 'confidenceChoice', text: 'If a room needs something, what do you create first?', optionKey: 'compliment' },
  { id: 2041, type: 'stance', pairKey: 'restless', pairSlot: 'a', text: 'Too much routine makes me restless.', modifiers: { curiosity: 10, play: 8, comfort: -8 } },
  { id: 2042, type: 'stance', pairKey: 'watchful', pairSlot: 'a', text: 'If a vibe feels off, I keep monitoring it.', modifiers: { vigilance: 12, comfort: 4, independence: 4, play: -4 } },
  { id: 2043, type: 'stance', pairKey: 'comfort', pairSlot: 'a', text: 'Comfort changes my whole system.', modifiers: { comfort: 14, warmth: 4, curiosity: -4 } },
  { id: 2044, type: 'stance', pairKey: 'range', pairSlot: 'a', text: 'I need private range to come back honestly.', modifiers: { independence: 14, comfort: 4, warmth: -4 } },
  { id: 2045, type: 'drift', pickCount: 3, pairKey: 'shift', pairSlot: 'a', text: 'Order for intense-day response?', optionKey: 'resetModes' },
  { id: 2046, type: 'drift', pickCount: 3, pairKey: 'shift', pairSlot: 'b', text: 'Order for safe-again sequence?', optionKey: 'safeAgain' },
  { id: 2047, type: 'tradeoff', budget: 4, pairKey: 'close-space', pairSlot: 'b', text: 'With limited energy, what gets more first?', labelKey: 'closeSpace', tradeoffKey: 'closeVsSpace' },
  { id: 2048, type: 'tradeoff', budget: 4, pairKey: 'routine-flex', pairSlot: 'a', text: 'If both cannot win, what wins first?', labelKey: 'comfortAdventure', tradeoffKey: 'comfortVsAdventure' },
  { id: 2049, type: 'grid', text: 'Which home-base mood feels most like you?', gridKey: 'socialNest' },
  { id: 2050, type: 'grid', text: 'Which social shape feels most like you?', gridKey: 'watchWarm' },
  { id: 2051, type: 'sort4', text: 'Order these from most restoring to least restoring.', optionKey: 'comfortSignals' },
  { id: 2052, type: 'sort4', text: 'Order these from strongest trust signal to weakest.', optionKey: 'trustMarkers' },
  { id: 2053, type: 'pairMatch', pairKey: 'pair-room', pairSlot: 'a', text: 'Make a room-instinct duo.', evidenceLabel: 'your room-instinct duo', optionKey: 'pairRoomFlow', pairBonuses: { '0-5': { comfort: 6, vigilance: 4 }, '1-5': { vigilance: 6, independence: 4 }, '2-4': { play: 6, warmth: 4 }, '0-4': { warmth: 6, play: 4 }, '2-3': { curiosity: 6, independence: 4 }, '0-3': { comfort: 5, independence: 5 } } },
  { id: 2054, type: 'pairMatch', pairKey: 'pair-care', pairSlot: 'a', text: 'Make a care-response duo.', evidenceLabel: 'your care-response duo', optionKey: 'pairCareLoop', pairBonuses: { '0-2': { warmth: 7, comfort: 5 }, '1-5': { vigilance: 7, comfort: 3 }, '3-4': { play: 6, independence: 4 }, '2-5': { comfort: 7, vigilance: 3 }, '0-4': { warmth: 5, independence: 5 }, '1-3': { vigilance: 5, play: 5 } } },
  { id: 2055, type: 'pairMatch', pairKey: 'pair-reset', pairSlot: 'a', text: 'Make your reset combo.', evidenceLabel: 'your reset combo', optionKey: 'pairResetArc', pairBonuses: { '0-2': { warmth: 6, comfort: 6 }, '1-3': { curiosity: 7, independence: 5 }, '0-4': { comfort: 6, play: 4 }, '2-4': { warmth: 6, play: 4 }, '1-5': { independence: 7, vigilance: 5 }, '3-4': { curiosity: 5, play: 5 } } },
  { id: 2056, type: 'hold', pairKey: 'hold-home', pairSlot: 'a', text: 'Hold until the amount of personal space you still want, even when you feel safe, feels honest.', lowLabel: 'Stay close to warmth', highLabel: 'Still want my own space', lowModifiers: { warmth: 12, comfort: 6 }, highModifiers: { independence: 14, curiosity: 4 } },
  { id: 2057, type: 'rhythm', pairKey: 'rhythm-room', pairSlot: 'a', text: 'Tap 4 times in the rhythm that matches how quickly you warm up to a new room.', slowLabel: 'Warm up slowly', fastLabel: 'Settle in fast', steadyLabel: 'Pretty consistent', wildLabel: 'Changes room to room', slowModifiers: { vigilance: 10, comfort: 4, independence: 2 }, fastModifiers: { play: 10, warmth: 8, curiosity: 4 }, steadyModifiers: { comfort: 8, warmth: 4, vigilance: 4 }, wildModifiers: { play: 8, curiosity: 8, comfort: -4 } },
  { id: 2058, type: 'constellation', pickCount: 3, pairKey: 'const-room', pairSlot: 'a', text: 'Build your 3-step room instinct.', evidenceLabel: 'your 3-step room instinct', optionKey: 'pairRoomFlow', trioBonuses: { '0-2-4': { warmth: 7, play: 5 }, '1-3-5': { vigilance: 7, independence: 5 }, '0-3-4': { comfort: 6, independence: 4 }, '2-4-5': { play: 6, curiosity: 5 } } },
  { id: 2059, type: 'constellation', pickCount: 3, pairKey: 'const-care', pairSlot: 'a', text: 'Build your 3-step care pattern.', evidenceLabel: 'your 3-step care pattern', optionKey: 'pairCareLoop', trioBonuses: { '0-2-5': { warmth: 8, comfort: 5 }, '1-3-4': { vigilance: 7, play: 5 }, '0-4-5': { warmth: 6, independence: 5 }, '1-2-3': { curiosity: 6, play: 4 } } },
  { id: 2060, type: 'hold', pairKey: 'hold-recovery', pairSlot: 'a', text: 'Hold until the amount of quiet you need after a heavy day feels honest.', lowLabel: 'I reset near people', highLabel: 'I need real quiet', lowModifiers: { warmth: 10, comfort: 6 }, highModifiers: { independence: 12, vigilance: 6, comfort: 2 } },
  { id: 2061, type: 'rhythm', pairKey: 'rhythm-reset', pairSlot: 'a', text: 'Tap 4 times in the rhythm that matches how you usually come back to yourself after stress.', slowLabel: 'Take a while', fastLabel: 'Back quickly', steadyLabel: 'Mostly even', wildLabel: 'In waves', slowModifiers: { comfort: 10, vigilance: 4, independence: 2 }, fastModifiers: { play: 8, warmth: 6, curiosity: 6 }, steadyModifiers: { comfort: 8, warmth: 4, vigilance: 4 }, wildModifiers: { curiosity: 8, play: 6, comfort: -4 } },
  { id: 2062, type: 'reaction', pairKey: 'reaction-instinct', pairSlot: 'a', text: 'Test your reflex. Once the signal is real, how quickly do you move?', quickLabel: 'Instant', steadyLabel: 'Measured', slowLabel: 'Late', fastCutoffMs: 280, steadyCutoffMs: 520, quickModifiers: { play: 15, curiosity: 12, warmth: 6, vigilance: -2 }, slowModifiers: { vigilance: 3, comfort: 2, independence: 1, play: -8 }, falseStartModifiers: { play: -2, curiosity: 2, vigilance: -10, comfort: -8 } },
  { id: 2063, type: 'timing', pairKey: 'timing-control', pairSlot: 'a', text: 'Stop the meter inside the target zone and see how clean your timing feels.', bullseyeLabel: 'Bullseye', nearLabel: 'Close', wideLabel: 'Missed wide', targetProgress: 0.68, targetTolerance: 0.24, bullseyeThreshold: 0.82, nearThreshold: 0.55, bullseyeModifiers: { vigilance: 14, comfort: 8, independence: 6 }, nearModifiers: { curiosity: 6, vigilance: 4, play: 1 }, wideModifiers: { play: -2, warmth: -2, vigilance: -6, comfort: -4 } },
];

const RECOVERY = [
  { id: 2901, type: 'yesno', isRecoveryItem: true, pairKey: 'recovery-social', pairSlot: 'a', text: 'Even when I feel good, I still prefer a few trusted bonds over a wide circle.', yesModifiers: { independence: 10, comfort: 6, warmth: 2 }, noModifiers: { warmth: 10, play: 4, independence: -4 } },
  { id: 2902, type: 'yesno', isRecoveryItem: true, pairKey: 'recovery-social', pairSlot: 'b', pairReverse: true, text: 'When a room feels safe, I get noticeably more playful.', yesModifiers: { warmth: 10, play: 10 }, noModifiers: { vigilance: 8, independence: 6, warmth: -4 } },
  { id: 2903, type: 'spectrum', isRecoveryItem: true, pairKey: 'recovery-rhythm', pairSlot: 'a', text: 'If free time suddenly opens up, what pulls at you first?', labelKey: 'comfortAdventure', left: { modifiers: { comfort: 14, vigilance: 4 } }, right: { modifiers: { curiosity: 14, independence: 6, play: 2 } } },
  { id: 2904, type: 'choice', isRecoveryItem: true, text: 'Which statement feels closest to your steady baseline?', optionKey: 'homeModes' },
  { id: 2905, type: 'allocation', isRecoveryItem: true, budget: 10, text: 'Distribute 10 points across what feels most fundamentally true for you.', optionKey: 'allocCore' },
  { id: 2906, type: 'grid', isRecoveryItem: true, text: 'On your calmest day, which square still feels true?', gridKey: 'socialNest' },
];

// Resolve a question's shared text references (labels, option sets, duels,
// tradeoffs, grids) into a flat, English-only question object.
const resolveQuestion = (question) => {
  const resolved = { ...question };

  if (question.labelKey && LABELS[question.labelKey]) {
    resolved.leftLabel = LABELS[question.labelKey].leftLabel;
    resolved.rightLabel = LABELS[question.labelKey].rightLabel;
  }
  if (question.optionKey && OPTION_SETS[question.optionKey]) {
    resolved.options = OPTION_SETS[question.optionKey].map((entry) => ({ ...entry }));
  }
  if (question.duelKey && DUELS[question.duelKey]) {
    resolved.left = { ...DUELS[question.duelKey].left };
    resolved.right = { ...DUELS[question.duelKey].right };
  }
  if (question.tradeoffKey && TRADEOFFS[question.tradeoffKey]) {
    resolved.left = { ...TRADEOFFS[question.tradeoffKey].left };
    resolved.right = { ...TRADEOFFS[question.tradeoffKey].right };
  }
  if (question.gridKey && GRIDS[question.gridKey]) {
    const grid = GRIDS[question.gridKey];
    resolved.xLeftLabel = grid.xLeftLabel;
    resolved.xRightLabel = grid.xRightLabel;
    resolved.yTopLabel = grid.yTopLabel;
    resolved.yBottomLabel = grid.yBottomLabel;
    resolved.options = grid.options.map((entry) => ({ ...entry }));
  }

  return resolved;
};

export const buildAnimalQuestionBank = () => QUESTIONS.map((question) => resolveQuestion(question));
export const buildAnimalRecoveryBank = () => RECOVERY.map((question) => resolveQuestion(question));
export const ANIMAL_INSTRUCTION_COPY = INSTRUCTIONS;
