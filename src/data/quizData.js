export const CHAR_PROFILES = {
  Mitsumi: {
    social: 8, planning: 8, focus: 7, drive: 9,
    reason: "Like Mitsumi, you're a total trailblazer! You try incredibly hard to plan out your days perfectly and genuinely want to do good in the world. Even when your plans completely fall apart—which definitely makes you panic sometimes!—your pure sincerity and natural resilience always save the day. You naturally draw people to you just by being your earnest, optimistic self."
  },
  Shima: {
    social: 7, planning: -2, focus: 8, drive: -3,
    reason: "Like Shima, you're an incredibly adaptable social chameleon. You're super empathetic, naturally tuning into the vibe of whatever room you're in. You often put everyone else's feelings before your own just to keep the peace. While everyone loves having you around, remember it's completely okay to set boundaries and figure out what actually makes you happy instead of burning out!"
  },
  Mika: {
    social: 4, planning: 5, focus: 3, drive: 6,
    reason: "Like Mika, you work incredibly hard but might put up a slightly prickly front to protect yourself because you secretly care a lot about how people see you. You use perfectionism as a shield, but underneath that tough exterior? You're an absolutely fiercely devoted, loyal friend who pays amazing attention to detail."
  },
  Makoto: {
    social: -5, planning: 6, focus: 4, drive: 3,
    reason: "Like Makoto, you might get easily overwhelmed by loud crowds and tend to overthink social interactions entirely too much. But that's just because you are so incredibly sincere and observant! You thrive on deep, quiet authenticity and naturally make the loud world feel wonderfully grounded."
  },
  Yuzuki: {
    social: 6, planning: 0, focus: 5, drive: 2,
    reason: "Like Yuzuki, you project an effortless, easygoing energy that totally masks your fierce independence. You absolutely hate fake social drama and only care about building genuine bonds. While you might keep your walls up to protect your peace from superficial people, your fiercely protective nature makes you an invaluable friend."
  },
  Yamada: {
    social: 9, planning: -4, focus: 1, drive: 4,
    reason: "Like Yamada, you are all about good vibes! You're totally extroverted, super cheerful, and always looking for the next fun thing to do. Sure, you might be a little impulsive or forget to plan properly for tomorrow, but your amazing ability to break the ice and bring people together is a rare and vital talent."
  },
  Nao: {
    social: 5, planning: 3, focus: 8, drive: 5,
    reason: "Like Nao-chan, you pair emotional precision with grounded strength. You notice subtle shifts in mood, then respond with the right balance of honesty, warmth, and practical guidance. People trust you in messy moments because you protect your peace, set clear boundaries, and still show up with compassion."
  },
  Kanechika: {
    social: 7, planning: 4, focus: -5, drive: 10,
    reason: "Like Kanechika, you are entirely fueled by blazing passion! When you care about something, you go all in, totally ignoring social norms or awkwardness to relentlessly chase your dreams. While your uncompromising enthusiasm means you occasionally steamroll over practical plans, you effortlessly sweep everyone up into your creative orbit."
  },
  Fumino: {
    social: 2, planning: 2, focus: 10, drive: 4,
    reason: "Like Fumi, you are the ultimate stabilizing anchor for your friends. You possess an almost psychic level of emotional intelligence and stay perfectly grounded no matter how chaotic things get. Just don't forget to advocate for your own exciting life adventures instead of just quietly supporting everyone else's!"
  },
  Hiroto: {
    social: 8, planning: -5, focus: 3, drive: -2,
    reason: "Like Kazakami, you are effortlessly cool and wildly unbothered. You take life exactly as it comes, entirely rejecting stress, drama, and strict schedules. While some people might mistakenly view your ultra-relaxed aura as pure apathy, people naturally flock to you because you provide an absolute oasis of calm."
  },
  Tokiko: {
    social: -3, planning: 10, focus: 2, drive: 8,
    reason: "Like Takamine, you are a hyper-efficient perfectionist who beautifully runs on structure and rigorous organization. You use extreme competence to comfortably protect yourself. But your greatest growth comes when you realize that asking your friends for help isn't a failure! When you allow yourself to lean on others, you find profound peace."
  },
  Mukai: {
    social: 1, planning: 0, focus: 1, drive: 1,
    reason: "Like Mukai, you are the very definition of steady, rational reliability. You heavily favor straightforward logic over messy dramatic entanglements, and romance might honestly totally baffle you at times. But your complete lack of pretension makes you refreshingly easy to be around, and your level-headed advice makes you the ultimate best friend."
  },
  Ririka: {
    social: 3, planning: -3, focus: -5, drive: 5,
    reason: "Like Ririka, you often put up a glamorous, intimidating front to meticulously protect yourself from getting hurt. You project an aura of fierce independence to push people away before they can reject you. But under all those defensive thorns is a devastatingly caring heart terrified of losing the few genuine bonds you have."
  },
  Chris: {
    social: 4, planning: 2, focus: 9, drive: 2,
    reason: "Like Chris, you are a natural empath and the ultimate, quintessential peacemaker. You have a flawless read on the emotional vibe of your friend group. Instead of wanting the spotlight, you find joy in quietly smoothing over conflicts and offering gentle support—just remember your own feelings are entirely valid, too!"
  },
  Ujiie: {
    social: -8, planning: 5, focus: -6, drive: 8,
    reason: "Like Ujiie, your baseline is fiercely analytical and highly cynical. You tend to radically over-analyze situations and might critique others' enthusiasm just to protect yourself from looking foolish. But this whole intellectual fortress is just masking your deepest desire: you secretly, profoundly want to truly belong and be accepted by your peers."
  }
};

export const QUESTION_BANK = [
  { id: 1, type: 'slider', axis: 'planning', invert: true, text: "How do you normally handle sudden changes to your perfect plans?", leftLabel: "Total panic & restructuring", rightLabel: "Whatever! I'll just adapt" },
  { id: 2, type: 'slider', axis: 'social', invert: false, text: "After going to a massive, incredibly loud party, your social battery is:", leftLabel: "Completely dead, I need to hibernate", rightLabel: "Overcharged! Let's literally keep going!" },
  { id: 3, type: 'slider', axis: 'focus', invert: false, text: "When a friend comes to you actively crying, your very first instinct is to:", leftLabel: "Fix their problem with cold logic", rightLabel: "Give them a huge hug and just listen" },
  { id: 4, type: 'slider', axis: 'drive', invert: false, text: "When working on your biggest life goals, you are currently:", leftLabel: "Coasting softly on a low battery", rightLabel: "Hyper-fixated and totally obsessed" },
  { id: 5, type: 'slider', axis: 'planning', invert: true, text: "Before packing for a weekend trip, your preparation style is:", leftLabel: "Detailed spreadsheet itineraries", rightLabel: "Throw random stuff in a bag at the last minute" },
  { id: 6, type: 'slider', axis: 'social', invert: false, text: "If someone suddenly cancels your weekend hangout plans, you are secretly:", leftLabel: "Relieved to just stay in bed", rightLabel: "Genuinely devastated and lonely" },
  { id: 7, type: 'slider', axis: 'focus', invert: false, text: "In a mandatory group project, you honestly truly care most about:", leftLabel: "Getting the perfect grade at all costs", rightLabel: "Making sure absolutely everyone had fun" },
  { id: 8, type: 'slider', axis: 'drive', invert: false, text: "When you excitedly find a shiny new hobby...", leftLabel: "I try it literally once and instantly forget it", rightLabel: "It becomes my entire personality for six months" },
  { id: 9, type: 'choice', text: "Which of these beautifully sounds like the perfect vibe for you?", options: [
      { text: "A perfectly organized day where everything goes exactly right.", modifiers: { planning: 10, drive: 5, focus: -4 } },
      { text: "Hanging out and feeling totally emotionally in sync with everyone.", modifiers: { social: 8, focus: 10, planning: -2 } },
      { text: "Grinding intensely away at something I'm super passionate about.", modifiers: { drive: 12, social: -4, focus: -6 } },
      { text: "Chilling absolutely alone, peacefully analyzing the world from a cozy spot.", modifiers: { focus: 6, social: -10, planning: 4 } }
  ]},
  { id: 10, type: 'choice', text: "You brutally trip and fall heavily in front of the whole class. What goes through your head?", options: [
      { text: "\"Oh no, everyone thinks I'm a total massive idiot now!\"", modifiers: { social: -8, focus: 6, planning: 4 } },
      { text: "Laugh out loud: \"I totally, 100% meant to do that!\"", modifiers: { social: 10, focus: 5, drive: -2 } },
      { text: "\"Why did I wear these functionally terrible shoes? Never again.\"", modifiers: { planning: 12, focus: -8, social: -2 } },
      { text: "\"Meh, honestly who cares? Happens to the best of us.\"", modifiers: { planning: -8, drive: -4, focus: 2 } }
  ]},
  { id: 11, type: 'choice', text: "If you absolutely had to give up one of these concepts forever, which is it going to be?", options: [
      { text: "My perfectly predictable, deeply safe future plans.", modifiers: { planning: -12, drive: -2 } },
      { text: "My vast popularity and how everyone positively sees me.", modifiers: { social: -12, focus: 4 } },
      { text: "My biggest personal hobbies, passions, and wild dreams.", modifiers: { drive: -12, planning: -2 } },
      { text: "My pristine, quiet alone time and absolute personal comfort.", modifiers: { focus: 10, social: 10, planning: -4 } } 
  ]},
  { id: 12, type: 'choice', text: "At the end of a long day, how do you natively fit into your core friend group?", options: [
      { text: "The fiery leader, fiercely ready to take charge and heavily make things happen.", modifiers: { drive: 10, planning: 8, social: 4 } },
      { text: "The warm heart, always quietly making sure everyone feels deeply loved.", modifiers: { focus: 12, social: 8, drive: -2 } },
      { text: "The quiet observer, vigilantly watching and understanding entirely from the edge.", modifiers: { social: -10, focus: 6, planning: 6 } },
      { text: "The vastly easygoing one, just peacefully floating along for the fun ride.", modifiers: { drive: -10, planning: -6, focus: 4 } }
  ]},
  { id: 13, type: 'choice', text: "Someone forcefully gives you harsh feedback. Your first instinct is:", options: [
      { text: "Aggressively defend myself instantly and vocally.", modifiers: { drive: 8, focus: -6, social: 2 } },
      { text: "Silently agree with them utterly, and feel completely terrible.", modifiers: { social: -8, focus: 8, planning: -2 } },
      { text: "Take intricate notes to drastically and perfectly improve next time.", modifiers: { planning: 10, drive: 6, focus: -4 } },
      { text: "Ignore them utterly and completely; they honestly don't know me.", modifiers: { drive: -6, social: -6, focus: 2 } }
  ]},
  { id: 14, type: 'choice', text: "You acquire $1000 of completely disposable income. You enthusiastically:", options: [
      { text: "Put it entirely into massive savings or highly responsible investments.", modifiers: { planning: 12, drive: 5, focus: -2 } },
      { text: "Throw a massive, extremely loud and expensive dinner for all my friends.", modifiers: { social: 12, focus: 6, planning: -6 } },
      { text: "Buy that one incredibly beautifully nerdy hobby item.", modifiers: { drive: 10, social: -4, planning: 2 } },
      { text: "Slowly and peacefully spend it on small comforts quietly over a long year.", modifiers: { drive: -6, focus: 4, planning: 2 } }
  ]},
  { id: 15, type: 'choice', text: "Your absolute ideal weekend morning involves:", options: [
      { text: "Waking up at actively 6 AM to forcefully conquer my entire to-do list.", modifiers: { planning: 12, drive: 10, social: -2 } },
      { text: "Waking up whenever and immediately rapidly texting the massive group chat.", modifiers: { social: 12, focus: 4, drive: 2 } },
      { text: "Staring beautifully at the ceiling in complete magical silence for two whole hours.", modifiers: { social: -10, focus: 8, planning: -6 } },
      { text: "Scrolling on my phone, utterly ignoring all my pressing responsibilities.", modifiers: { planning: -10, drive: -10, focus: 2 } }
  ]},
  { id: 16, type: 'choice', text: "When someone is clearly lying to you to simply save face, you quietly:", options: [
      { text: "Call them out on it immediately because the objective truth matters.", modifiers: { focus: -10, social: 5, drive: 6 } },
      { text: "Let them lie because pointing it out would be extremely awkward.", modifiers: { focus: 10, social: -2, planning: -4 } },
      { text: "Analyze exactly *why* they are actively lying so I can use it for future reference.", modifiers: { planning: 8, focus: -4, social: -6 } },
      { text: "I honestly probably didn't even notice they were lying in the first place.", modifiers: { drive: -8, planning: -6, focus: 4 } }
  ]},
  { id: 17, type: 'yesno', text: "I routinely hide my true insecurities so people think I'm stronger than I actually am.", yesModifiers: { social: -4, drive: 6, focus: -6, planning: 4 }, noModifiers: { social: 6, focus: 6, drive: -2, planning: -2 } },
  { id: 18, type: 'yesno', text: "I usually only do things if I'm incredibly passionate about them, heavily ignoring what others want me to do.", yesModifiers: { drive: 12, social: -6, focus: -4 }, noModifiers: { drive: -6, social: 8, focus: 6 } },
  { id: 19, type: 'yesno', text: "I aggressively rehearse imaginary conversations endlessly before they actually happen.", yesModifiers: { planning: 8, social: -6, focus: 4 }, noModifiers: { planning: -8, social: 6, focus: -2 } },
  { id: 20, type: 'yesno', text: "I feel incredibly guilty when I actively take a day completely for myself and do absolutely nothing productive.", yesModifiers: { drive: 8, focus: 6, planning: 6 }, noModifiers: { drive: -8, focus: -4, planning: -6 } },
  { id: 21, type: 'yesno', text: "I would drastically much rather work completely alone than forcefully in a large, collaborative team.", yesModifiers: { social: -10, focus: -4, planning: 4 }, noModifiers: { social: 10, focus: 6, planning: -4 } },
  { id: 22, type: 'yesno', text: "I am extremely often told that my total resting face looks intensely angry or fundamentally unapproachable.", yesModifiers: { social: -8, focus: -6, planning: 4 }, noModifiers: { social: 8, focus: 6, planning: -2 } },
  { id: 23, type: 'yesno', text: "I am notoriously bad at actually replying to all text messages in any sort of functional amount of time.", yesModifiers: { planning: -10, social: -6, drive: -4 }, noModifiers: { planning: 10, social: 6, drive: 4 } },
  { id: 24, type: 'yesno', text: "I actively avoid watching movies or simply reading books that I know for a fact will have a horribly depressing ending.", yesModifiers: { focus: 8, drive: -4, planning: -2 }, noModifiers: { focus: -8, drive: 6, planning: 4 } },
  {
    id: 25,
    type: 'duel',
    text: 'Pick the response you are most likely to make when a plan suddenly collapses:',
    left: {
      text: '"Give me five minutes, I will rebuild the plan from scratch right now."',
      modifiers: { planning: 10, drive: 6, social: -2 },
    },
    right: {
      text: '"Let us improvise and follow whatever feels right in the moment."',
      modifiers: { planning: -8, social: 6, drive: 2 },
    },
  },
  {
    id: 26,
    type: 'duel',
    text: 'In group tension, which role sounds more like you?',
    left: {
      text: 'I mediate quietly and help everyone feel emotionally safe.',
      modifiers: { focus: 10, social: 6, drive: -2 },
    },
    right: {
      text: 'I push for a direct decision so we can move forward quickly.',
      modifiers: { drive: 10, planning: 4, focus: -4 },
    },
  },
  {
    id: 27,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two patterns that are genuinely true for you lately:',
    options: [
      { text: 'I over-prepare before social situations.', modifiers: { planning: 7, social: -4, focus: 4 } },
      { text: 'I absorb other people\'s moods very quickly.', modifiers: { focus: 8, social: 4, drive: -2 } },
      { text: 'I start many projects but lose momentum fast.', modifiers: { drive: -8, planning: -4, focus: -2 } },
      { text: 'I can stay locked-in for long periods when motivated.', modifiers: { drive: 8, focus: 6, social: -2 } },
    ],
  },
  {
    id: 28,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two weekend behaviors that match your natural reset mode:',
    options: [
      { text: 'I recharge by spending time with close friends.', modifiers: { social: 8, focus: 4, planning: -2 } },
      { text: 'I recharge by disappearing into solo hobbies.', modifiers: { social: -8, focus: 6, drive: 2 } },
      { text: 'I recharge by cleaning, organizing, and planning ahead.', modifiers: { planning: 9, drive: 4, social: -2 } },
      { text: 'I recharge by doing absolutely nothing scheduled.', modifiers: { planning: -8, drive: -4, focus: 2 } },
    ],
  },
  {
    id: 29,
    type: 'duel',
    text: 'When you are stressed, which internal monologue appears first?',
    left: {
      text: '"I need structure immediately or everything will spiral."',
      modifiers: { planning: 9, focus: 5, drive: 2 },
    },
    right: {
      text: '"I need emotional breathing room before I can function."',
      modifiers: { focus: 9, social: -3, drive: -4 },
    },
  },
  {
    id: 30,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two strengths friends usually rely on you for:',
    options: [
      { text: 'Keeping people calm and connected.', modifiers: { social: 6, focus: 8, drive: -2 } },
      { text: 'Taking initiative when nobody acts.', modifiers: { drive: 10, planning: 4, social: 2 } },
      { text: 'Spotting details and hidden problems early.', modifiers: { planning: 6, focus: 7, social: -2 } },
      { text: 'Maintaining a relaxed atmosphere in chaotic moments.', modifiers: { social: 5, drive: -4, planning: -5 } },
    ],
  },
  {
    id: 31,
    type: 'rank2',
    text: 'Rank your top 2 priorities when entering a new team or class:',
    options: [
      { text: 'Understand group dynamics and people quickly.', modifiers: { social: 8, focus: 4 } },
      { text: 'Build a clear execution system and timeline.', modifiers: { planning: 10, drive: 4 } },
      { text: 'Find meaningful work I can deeply care about.', modifiers: { drive: 9, focus: 4 } },
      { text: 'Protect my energy and avoid social overload.', modifiers: { social: -7, focus: 6 } },
    ],
  },
  {
    id: 32,
    type: 'rank2',
    text: 'Rank the top 2 friction points that drain you the most:',
    options: [
      { text: 'Unclear plans and moving deadlines.', modifiers: { planning: 10, drive: 2, social: -2 } },
      { text: 'Emotionally tense or conflict-heavy environments.', modifiers: { focus: 10, social: -2 } },
      { text: 'Slow decision-making and lack of momentum.', modifiers: { drive: 9, planning: 4 } },
      { text: 'Constant social demands with no quiet reset time.', modifiers: { social: -9, focus: 5 } },
    ],
  },
  {
    id: 33,
    type: 'duel',
    text: 'Which statement is more accurate for your best work mode?',
    left: {
      text: 'I produce better outcomes when the process is mapped before I begin.',
      modifiers: { planning: 11, drive: 3, focus: 2 },
    },
    right: {
      text: 'I produce better outcomes when I can adapt live while building.',
      modifiers: { planning: -8, drive: 5, social: 3 },
    },
  },
  {
    id: 34,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two clues that people often notice about you first:',
    options: [
      { text: 'I read mood shifts in a room almost instantly.', modifiers: { focus: 9, social: 5 } },
      { text: 'I naturally take ownership when outcomes matter.', modifiers: { drive: 10, planning: 4 } },
      { text: 'I stay structured even when things are messy.', modifiers: { planning: 10, focus: 3 } },
      { text: 'I stay calm and detached in high-drama moments.', modifiers: { social: -5, focus: 6, drive: -2 } },
    ],
  },
  {
    id: 35,
    type: 'ipsative',
    text: 'Pick one statement that is MOST like you and one that is LEAST like you:',
    options: [
      { text: 'I naturally become the emotional temperature-check person in groups.', modifiers: { social: 6, focus: 9 } },
      { text: 'I am at my best when I can design systems and timelines up front.', modifiers: { planning: 11, drive: 3 } },
      { text: 'I care most about momentum, even if plans are unfinished.', modifiers: { drive: 10, planning: -4, social: 2 } },
      { text: 'I keep distance until I feel fully safe with people.', modifiers: { social: -8, focus: 5, planning: 2 } },
    ],
  },
  {
    id: 36,
    type: 'ipsative',
    text: 'In conflict, choose one response that is MOST natural and one that is LEAST natural for you:',
    options: [
      { text: 'I pause and map the facts before reacting.', modifiers: { planning: 9, focus: 4, social: -2 } },
      { text: 'I try to restore emotional harmony first.', modifiers: { focus: 10, social: 6, drive: -2 } },
      { text: 'I push for a hard decision and immediate next step.', modifiers: { drive: 11, planning: 5, focus: -4 } },
      { text: 'I disengage to protect my energy, then revisit later.', modifiers: { social: -7, drive: -3, focus: 4 } },
    ],
  },
  {
    id: 37,
    type: 'duel',
    text: 'Which win condition matters more to you in a hard project?',
    left: {
      text: 'A clean process where everyone understands the system.',
      modifiers: { planning: 10, focus: 4, social: 2 },
    },
    right: {
      text: 'A bold outcome, even if the process is messy.',
      modifiers: { drive: 10, planning: -5, social: 4 },
    },
  },
  {
    id: 38,
    type: 'rank2',
    text: 'Rank the top 2 qualities you want others to feel from you:',
    options: [
      { text: 'Reliable and prepared.', modifiers: { planning: 10, focus: 3 } },
      { text: 'Warm and emotionally safe.', modifiers: { focus: 9, social: 7 } },
      { text: 'Driven and inspiring.', modifiers: { drive: 11, social: 2 } },
      { text: 'Calm and low-pressure.', modifiers: { drive: -6, social: -2, focus: 4 } },
    ],
  },
  {
    id: 39,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two hidden defaults you fall into when under pressure:',
    options: [
      { text: 'I over-structure and over-schedule.', modifiers: { planning: 11, drive: 2, social: -2 } },
      { text: 'I become hyper-aware of other people\'s emotions.', modifiers: { focus: 10, social: 5, drive: -2 } },
      { text: 'I tunnel into execution and stop checking in.', modifiers: { drive: 10, focus: -4, social: -4 } },
      { text: 'I withdraw and conserve energy until things settle.', modifiers: { social: -8, drive: -4, focus: 4 } },
    ],
  },
  {
    id: 40,
    type: 'choice',
    text: 'Your ideal team role in a chaotic deadline week is:',
    options: [
      { text: 'Architect: define structure, scope, and sequencing.', modifiers: { planning: 12, focus: 2, drive: 3 } },
      { text: 'Glue: keep communication smooth and morale steady.', modifiers: { social: 8, focus: 8, drive: -2 } },
      { text: 'Sprinter: push execution and unblock bottlenecks fast.', modifiers: { drive: 12, planning: 2, social: 2 } },
      { text: 'Spotter: monitor quality and catch subtle issues early.', modifiers: { focus: 10, planning: 6, social: -2 } },
    ],
  },
  {
    id: 41,
    type: 'yesno',
    text: 'I feel most useful when I can make the process clearer for everyone else.',
    yesModifiers: { planning: 9, social: 3, drive: 2 },
    noModifiers: { planning: -7, social: -1, drive: 2 },
  },
  {
    id: 42,
    type: 'duel',
    text: 'When feedback is ambiguous, what do you do first?',
    left: {
      text: 'Ask follow-up questions until the criteria are concrete.',
      modifiers: { planning: 10, focus: 5, social: 1 },
    },
    right: {
      text: 'Prototype fast and adjust based on reactions.',
      modifiers: { drive: 9, social: 3, planning: -4 },
    },
  },
  {
    id: 43,
    type: 'rank2',
    text: 'Rank your top 2 priorities when your energy is low:',
    options: [
      { text: 'Protecting peace and reducing noise.', modifiers: { social: -8, focus: 5, drive: -3 } },
      { text: 'Maintaining standards and avoiding mistakes.', modifiers: { planning: 9, focus: 5 } },
      { text: 'Preserving momentum on core goals.', modifiers: { drive: 10, planning: 3 } },
      { text: 'Staying connected so nobody feels isolated.', modifiers: { social: 8, focus: 6, drive: -1 } },
    ],
  },
  {
    id: 44,
    type: 'ipsative',
    text: 'Pick one MOST like you and one LEAST like you in uncertain situations:',
    options: [
      { text: 'I gather context quietly before I move.', modifiers: { focus: 9, planning: 4, social: -2 } },
      { text: 'I align people first, then decide.', modifiers: { social: 8, focus: 7, drive: -2 } },
      { text: 'I commit to a direction and iterate aggressively.', modifiers: { drive: 11, planning: -3, social: 2 } },
      { text: 'I simplify the scope to regain control.', modifiers: { planning: 10, drive: 3 } },
    ],
  },
  {
    id: 45,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two signs of your healthiest version lately:',
    options: [
      { text: 'I balance planning with flexibility.', modifiers: { planning: 6, social: 2, drive: 2 } },
      { text: 'I set boundaries without feeling guilty.', modifiers: { social: -2, focus: 8, drive: 2 } },
      { text: 'I finish what I start more consistently.', modifiers: { drive: 9, planning: 3 } },
      { text: 'I listen well without absorbing everything.', modifiers: { focus: 8, social: 4, drive: 1 } },
    ],
  },
  {
    id: 46,
    type: 'choice',
    text: 'Which compliment feels most accurate when you are doing your best?',
    options: [
      { text: 'You make complexity feel organized.', modifiers: { planning: 11, focus: 4, social: 1 } },
      { text: 'You make people feel seen and safe.', modifiers: { social: 8, focus: 10 } },
      { text: 'You create momentum when everyone stalls.', modifiers: { drive: 12, planning: 2, social: 2 } },
      { text: 'You stay calm and practical when pressure spikes.', modifiers: { focus: 7, planning: 5, drive: -1 } },
    ],
  },
  {
    id: 47,
    type: 'spectrum',
    text: 'Move the slider toward the style that feels more natural in your daily life:',
    leftLabel: 'Stability and preparation',
    rightLabel: 'Adaptation and spontaneity',
    left: { modifiers: { planning: 11, focus: 3, drive: 1 } },
    right: { modifiers: { planning: -8, social: 5, drive: 4 } },
  },
  {
    id: 48,
    type: 'spectrum',
    text: 'Where do you naturally lean when team pressure rises?',
    leftLabel: 'Protect emotional safety',
    rightLabel: 'Push momentum and output',
    left: { modifiers: { focus: 10, social: 6, drive: -3 } },
    right: { modifiers: { drive: 11, planning: 4, focus: -4 } },
  },
  {
    id: 49,
    type: 'allocation',
    budget: 10,
    text: 'Distribute 10 points across what drives your best performance (more points = more true):',
    options: [
      { text: 'Clear structure and expectations', modifiers: { planning: 10, focus: 3 } },
      { text: 'Strong emotional connection with people', modifiers: { social: 8, focus: 6 } },
      { text: 'Autonomy and speed of execution', modifiers: { drive: 10, planning: -3, social: 2 } },
      { text: 'Quiet concentration and minimal noise', modifiers: { social: -6, focus: 9, planning: 2 } },
    ],
  },
  {
    id: 50,
    type: 'allocation',
    budget: 10,
    text: 'Distribute 10 points across what depletes you the most:',
    options: [
      { text: 'Ambiguous direction and shifting plans', modifiers: { planning: 10, drive: 2 } },
      { text: 'Social overload with no reset time', modifiers: { social: -9, focus: 5, drive: -2 } },
      { text: 'Low urgency and stalled progress', modifiers: { drive: 10, planning: 3 } },
      { text: 'Emotionally tense environments', modifiers: { focus: 10, social: -2 } },
    ],
  },
  {
    id: 51,
    type: 'yesno',
    isValidityItem: true,
    pairKey: 'social-energy',
    pairSlot: 'a',
    pairReverse: false,
    text: 'I usually gain energy from frequent group interaction.',
    yesModifiers: { social: 8, focus: 2, drive: 1 },
    noModifiers: { social: -8, focus: -1, drive: -1 },
  },
  {
    id: 52,
    type: 'yesno',
    isValidityItem: true,
    pairKey: 'social-energy',
    pairSlot: 'b',
    pairReverse: true,
    text: 'After long social activity, I usually need quiet time to recover.',
    yesModifiers: { social: -8, focus: 2, planning: 1 },
    noModifiers: { social: 8, focus: -1, planning: -1 },
  },
  {
    id: 53,
    type: 'yesno',
    isValidityItem: true,
    pairKey: 'planning-rigidity',
    pairSlot: 'a',
    pairReverse: false,
    text: 'I feel better when I decide plans early and follow them closely.',
    yesModifiers: { planning: 8, drive: 2, focus: 1 },
    noModifiers: { planning: -8, drive: -2, focus: -1 },
  },
  {
    id: 54,
    type: 'yesno',
    isValidityItem: true,
    pairKey: 'planning-rigidity',
    pairSlot: 'b',
    pairReverse: true,
    text: 'I generally prefer keeping plans loose so I can adapt as things change.',
    yesModifiers: { planning: -8, social: 2, drive: 1 },
    noModifiers: { planning: 8, social: -2, drive: -1 },
  },
  {
    id: 55,
    type: 'confidenceChoice',
    text: 'Which response feels most like your default mode when responsibilities pile up?',
    options: [
      { text: 'I break everything into a clear action sequence.', modifiers: { planning: 10, drive: 4, focus: 2 } },
      { text: 'I check in with people and synchronize energy first.', modifiers: { social: 8, focus: 7, drive: -1 } },
      { text: 'I start executing quickly and refine as I go.', modifiers: { drive: 10, planning: -3, social: 2 } },
      { text: 'I reduce noise and protect deep focus blocks.', modifiers: { focus: 9, social: -3, planning: 3 } },
    ],
  },
  {
    id: 56,
    type: 'confidenceChoice',
    text: 'Which outcome do you naturally optimize for in collaborative work?',
    options: [
      { text: 'Predictability and low-risk delivery.', modifiers: { planning: 9, focus: 3 } },
      { text: 'Psychological safety and communication quality.', modifiers: { social: 9, focus: 6, drive: -1 } },
      { text: 'Velocity and visible progress.', modifiers: { drive: 11, planning: 1, social: 2 } },
      { text: 'Quality of thinking and precision.', modifiers: { focus: 10, planning: 5, social: -2 } },
    ],
  },
  {
    id: 57,
    type: 'duel',
    text: 'When a friendship issue appears, what do you do first?',
    left: {
      text: 'I open the conversation directly so we can clear the air quickly.',
      modifiers: { drive: 8, social: 4, focus: -2 },
    },
    right: {
      text: 'I read the mood quietly first, then choose the safest timing.',
      modifiers: { focus: 9, planning: 3, social: -1 },
    },
  },
  {
    id: 58,
    type: 'multi',
    maxSelect: 2,
    text: 'Choose up to two habits that usually keep your week stable:',
    options: [
      { text: 'I write down priorities before the day starts.', modifiers: { planning: 9, drive: 3 } },
      { text: 'I check in with people before pressure builds up.', modifiers: { social: 7, focus: 6 } },
      { text: 'I protect uninterrupted focus blocks.', modifiers: { focus: 8, social: -3, planning: 2 } },
      { text: 'I move quickly and fix details during execution.', modifiers: { drive: 9, planning: -2, social: 2 } },
    ],
  },
  {
    id: 59,
    type: 'rank2',
    text: 'Rank your top 2 needs when starting something unfamiliar:',
    options: [
      { text: 'A clear map of expectations and steps.', modifiers: { planning: 10, focus: 3 } },
      { text: 'Emotional safety with the people involved.', modifiers: { focus: 9, social: 7 } },
      { text: 'Freedom to experiment and move fast.', modifiers: { drive: 10, planning: -3, social: 2 } },
      { text: 'Quiet room to think before speaking.', modifiers: { social: -7, focus: 6, planning: 2 } },
    ],
  },
  {
    id: 60,
    type: 'confidenceChoice',
    text: 'Which response sounds most like you when plans break at the last minute?',
    options: [
      { text: 'I re-scope quickly and lock a clean fallback plan.', modifiers: { planning: 10, drive: 4 } },
      { text: 'I align people first so nobody spirals.', modifiers: { social: 8, focus: 8, drive: -1 } },
      { text: 'I improvise and push momentum so we do not stall.', modifiers: { drive: 10, planning: -3, social: 3 } },
      { text: 'I reduce noise and concentrate on one solvable piece.', modifiers: { focus: 9, planning: 4, social: -2 } },
    ],
  },
  {
    id: 61,
    type: 'spectrum',
    text: 'Where do you naturally sit in most collaborative decisions?',
    leftLabel: 'Careful consensus',
    rightLabel: 'Fast commitment',
    left: { modifiers: { focus: 8, planning: 5, drive: -2 } },
    right: { modifiers: { drive: 10, planning: -3, social: 3 } },
  },
  {
    id: 62,
    type: 'allocation',
    budget: 10,
    text: 'Distribute 10 points across what helps you stay emotionally regulated:',
    options: [
      { text: 'Predictable structure', modifiers: { planning: 9, focus: 3 } },
      { text: 'Trusted social support', modifiers: { social: 9, focus: 5 } },
      { text: 'Visible progress on tasks', modifiers: { drive: 9, planning: 2 } },
      { text: 'Protected alone time', modifiers: { social: -8, focus: 8, planning: 1 } },
    ],
  },
  {
    id: 63,
    type: 'stance',
    text: 'I usually feel better once there is a clear system in place.',
    labels: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
    modifiers: { planning: 10, drive: 2, focus: 2 },
  },
  {
    id: 64,
    type: 'stance',
    text: 'When things are tense, I naturally absorb the mood in the room.',
    labels: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
    modifiers: { focus: 10, social: 5, drive: -1 },
  },
  {
    id: 65,
    type: 'stance',
    text: 'I would rather act with imperfect information than wait too long.',
    labels: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
    modifiers: { drive: 10, planning: -4, social: 2 },
  },
  {
    id: 66,
    type: 'stance',
    text: 'Too much social activity leaves me needing quiet recovery time.',
    labels: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
    modifiers: { social: -10, focus: 3, planning: 1 },
  },
  {
    id: 67,
    type: 'choice',
    text: 'Which personal win feels most meaningful to you right now?',
    options: [
      { text: 'Building a routine I can rely on consistently.', modifiers: { planning: 10, drive: 4 } },
      { text: 'Keeping my relationships honest and emotionally clean.', modifiers: { social: 8, focus: 8 } },
      { text: 'Shipping work that clearly moves things forward.', modifiers: { drive: 11, planning: 2, social: 1 } },
      { text: 'Staying calm and clear while everything is noisy.', modifiers: { focus: 9, social: -4, planning: 2 } },
    ],
  },
  {
    id: 68,
    type: 'yesno',
    text: 'Even when I am tired, I still try to show up reliably for the people I care about.',
    yesModifiers: { drive: 6, focus: 4, social: 3 },
    noModifiers: { drive: -6, focus: -3, social: -2 },
  }
];
