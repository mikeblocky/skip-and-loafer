let cachedPromise = null;

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

const getDifficultyById = (id) => {
  if (id <= 20) return 'easy';
  if (id <= 40) return 'medium';
  if (id <= 70) return 'hard';
  return 'really-hard';
};

const isValidQuestion = (question) => {
  if (!question) return false;
  if (!Number.isInteger(question.id) || question.id <= 0) return false;
  if (!question.prompt || typeof question.prompt !== 'string') return false;
  if (!Array.isArray(question.choices) || question.choices.length !== 4) return false;
  if (question.choices.some((choice) => typeof choice !== 'string' || choice.trim().length === 0)) return false;
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) return false;
  return true;
};

const parseQuizTextToQuestionMap = (rawText) => {
  const lines = (rawText || '').split(/\r?\n/);
  const questionsById = new Map();
  let current = null;

  const pushCurrent = () => {
    if (!current) return;

    const choices = ANSWER_LETTERS.map((letter) => (current.choiceMap?.[letter] || '').trim());
    const candidate = {
      ...current,
      choices,
    };
    delete candidate.choiceMap;

    if (!isValidQuestion(candidate)) return;
    questionsById.set(candidate.id, {
      ...candidate,
      difficulty: getDifficultyById(current.id),
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/^\*\*(.*)\*\*$/, '$1').trim();

    const questionMatch = line.match(/^Q(\d+)\.\s*(.+)$/i);
    if (questionMatch) {
      pushCurrent();
      current = {
        id: Number(questionMatch[1]),
        prompt: (questionMatch[2] || '').trim(),
        choiceMap: {
          A: '',
          B: '',
          C: '',
          D: '',
        },
        answer: null,
      };
      continue;
    }

    if (!current) continue;

    const choiceMatch = line.match(/^([A-D])\)\s*(.*)$/);
    if (choiceMatch) {
      const choiceLetter = choiceMatch[1].toUpperCase();
      current.choiceMap[choiceLetter] = (choiceMatch[2] || '').trim();
      continue;
    }

    const answerMatch = line.match(/^(?:\*\*\s*)?Answer:\s*(?:\*\*\s*)?([A-D])$/i);
    if (answerMatch) {
      current.answer = ANSWER_LETTERS.indexOf(answerMatch[1].toUpperCase());
    }
  }

  pushCurrent();

  return questionsById;
};

const buildMergedQuestionBank = (quizTextRaw, quiz2TextRaw) => {
  const primaryMap = parseQuizTextToQuestionMap(quizTextRaw);
  const overrideMap = parseQuizTextToQuestionMap(quiz2TextRaw);
  const merged = new Map(primaryMap);

  for (const [id, question] of overrideMap.entries()) {
    if (id >= 41 && id <= 100) {
      merged.set(id, {
        ...question,
        difficulty: getDifficultyById(id),
      });
    }
  }

  const questions = [];
  for (let id = 1; id <= 100; id += 1) {
    const question = merged.get(id);
    if (!isValidQuestion(question)) continue;
    questions.push({
      ...question,
      id,
      difficulty: getDifficultyById(id),
    });
  }

  return questions;
};

export const loadQuizQuestions = async () => {
  if (!cachedPromise) {
    cachedPromise = Promise.allSettled([
      import('../../quiz.txt?raw'),
      import('../../quiz2.txt?raw'),
    ])
      .then((results) => {
        const quizTextRaw = results[0]?.status === 'fulfilled' ? (results[0].value?.default || '') : '';
        const quiz2TextRaw = results[1]?.status === 'fulfilled' ? (results[1].value?.default || '') : '';
        return buildMergedQuestionBank(quizTextRaw, quiz2TextRaw);
      })
      .catch(() => []);
  }

  return cachedPromise;
};

export const clearQuizQuestionBankCache = () => {
  cachedPromise = null;
};

export default loadQuizQuestions;
