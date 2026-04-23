import { lazy } from 'react';

export const loadPlannerPage = () => import('../../pages/PlannerPage');
export const loadChaptersPage = () => import('../../pages/ChaptersPage');
export const loadGalleryPage = () => import('../../pages/GalleryPage');
export const loadSignPage = () => import('../../pages/SignPage');
export const loadFanGalleryPage = () => import('../../pages/FanGalleryPage');
export const loadBlogPage = () => import('../../pages/BlogPage');
export const loadWikiPage = () => import('../../pages/WikiPage');
export const loadSyncPage = () => import('../../pages/SyncPage');
export const loadBirthdayPage = () => import('../../pages/BirthdayPage');
export const loadQuizPage = () => import('../../pages/QuizPage');
export const loadMysteryPage = () => import('../../pages/MysteryPage');
export const loadChatPage = () => import('../../pages/ChatPage');

export const PlannerPage = lazy(loadPlannerPage);
export const ChaptersPage = lazy(loadChaptersPage);
export const GalleryPage = lazy(loadGalleryPage);
export const SignPage = lazy(loadSignPage);
export const FanGalleryPage = lazy(loadFanGalleryPage);
export const BlogPage = lazy(loadBlogPage);
export const WikiPage = lazy(loadWikiPage);
export const SyncPage = lazy(loadSyncPage);
export const BirthdayPage = lazy(loadBirthdayPage);
export const QuizPage = lazy(loadQuizPage);
export const MysteryPage = lazy(loadMysteryPage);
export const ChatPage = lazy(loadChatPage);

const JAPANESE_HIDDEN_PRELOADERS = new Set([loadGalleryPage, loadBlogPage]);

const filterPreloadersByLanguage = (loaders, uiLanguage) => (
  uiLanguage === 'ja'
    ? loaders.filter((loader) => !JAPANESE_HIDDEN_PRELOADERS.has(loader))
    : loaders
);

const APP_TAB_PRELOADERS = {
  home: [loadChaptersPage, loadGalleryPage, loadSignPage, loadFanGalleryPage],
  chapters: [loadGalleryPage, loadSignPage, loadFanGalleryPage],
  gallery: [loadSignPage, loadFanGalleryPage, loadBlogPage],
  sign: [loadFanGalleryPage, loadBlogPage],
  fanGallery: [loadBlogPage, loadWikiPage],
  blog: [loadWikiPage, loadSyncPage],
  wiki: [loadChatPage, loadSyncPage],
  chat: [loadSyncPage, loadQuizPage],
  sync: [loadQuizPage, loadBirthdayPage],
  quiz: [loadMysteryPage, loadBirthdayPage],
  birthdays: [loadMysteryPage, loadHomePageSafe],
  mystery: [loadBlogPage, loadSyncPage],
};

function loadHomePageSafe() {
  return loadPlannerPage();
}

export const getAppTabPreloaders = (activePage, uiLanguage = 'en') => filterPreloadersByLanguage(APP_TAB_PRELOADERS[activePage] || [], uiLanguage);
