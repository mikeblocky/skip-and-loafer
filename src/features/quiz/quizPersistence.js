import { sortLeaderboard } from './quizUtils';

const QUIZ_RECENT_KEY = 'skip_quiz_recent_ids_v1';
const QUIZ_GLOBAL_LEADERBOARD_ENDPOINT = '/api/quiz/leaderboard';
const QUIZ_GLOBAL_RESULTS_ENDPOINT = '/api/quiz/results';

export const getStoredLeaderboard = () => [];

export const saveLeaderboard = () => {};

export const getStoredHistory = () => [];

export const saveHistory = () => {};

export const getGlobalLeaderboard = async () => {
  const response = await fetch(QUIZ_GLOBAL_LEADERBOARD_ENDPOINT, { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`Global leaderboard fetch failed (${response.status})`);
  const payload = await response.json();
  const entries = Array.isArray(payload?.leaderboard) ? payload.leaderboard : [];
  return sortLeaderboard(entries);
};

export const submitGlobalLeaderboardScore = async ({ name, score }) => {
  const response = await fetch(QUIZ_GLOBAL_LEADERBOARD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  });
  if (!response.ok) throw new Error(`Global leaderboard submit failed (${response.status})`);
  const payload = await response.json();
  const entries = Array.isArray(payload?.leaderboard) ? payload.leaderboard : [];
  return sortLeaderboard(entries);
};

export const getGlobalResults = async () => {
  const response = await fetch(QUIZ_GLOBAL_RESULTS_ENDPOINT, { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`Global results fetch failed (${response.status})`);
  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return [...results].sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));
};

export const submitGlobalResult = async (result) => {
  const response = await fetch(QUIZ_GLOBAL_RESULTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!response.ok) throw new Error(`Global result submit failed (${response.status})`);
  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return [...results].sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));
};

const getStoredRecentQuestionIds = () => {
  try {
    const raw = localStorage.getItem(QUIZ_RECENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
};

const saveRecentQuestionIds = (value) => {
  try {
    localStorage.setItem(QUIZ_RECENT_KEY, JSON.stringify(value));
  } catch {
  }
};

export const updateRecentQuestionIds = (modeKey, selectedQuestions) => {
  const stored = getStoredRecentQuestionIds();
  const current = Array.isArray(stored[modeKey]) ? stored[modeKey] : [];
  const added = selectedQuestions.map((question) => question.id);
  stored[modeKey] = [...current, ...added].slice(-160);
  saveRecentQuestionIds(stored);
};

export const getRecentQuestionIdSet = (modeKey) => {
  const stored = getStoredRecentQuestionIds();
  return new Set(Array.isArray(stored[modeKey]) ? stored[modeKey] : []);
};
