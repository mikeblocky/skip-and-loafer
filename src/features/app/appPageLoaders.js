import { lazy } from 'react';

export const loadPlannerPage = () => import('../../pages/PlannerPage');
export const loadChaptersPage = () => import('../../pages/ChaptersPage');
export const loadGalleryPage = () => import('../../pages/GalleryPage');
export const loadBlogPage = () => import('../../pages/BlogPage');
export const loadSyncPage = () => import('../../pages/SyncPage');
export const loadBirthdayPage = () => import('../../pages/BirthdayPage');
export const loadQuizPage = () => import('../../pages/QuizPage');
export const loadMysteryPage = () => import('../../pages/MysteryPage');
export const loadChatPage = () => import('../../pages/ChatPage');

export const PlannerPage = lazy(loadPlannerPage);
export const ChaptersPage = lazy(loadChaptersPage);
export const GalleryPage = lazy(loadGalleryPage);
export const BlogPage = lazy(loadBlogPage);
export const SyncPage = lazy(loadSyncPage);
export const BirthdayPage = lazy(loadBirthdayPage);
export const QuizPage = lazy(loadQuizPage);
export const MysteryPage = lazy(loadMysteryPage);
export const ChatPage = lazy(loadChatPage);

const APP_TAB_PRELOADERS = {
  home: [loadChaptersPage, loadGalleryPage, loadBlogPage, loadSyncPage],
  chapters: [loadGalleryPage, loadSyncPage, loadBlogPage],
  gallery: [loadBlogPage, loadSyncPage],
  blog: [loadSyncPage, loadQuizPage],
  sync: [loadQuizPage, loadBirthdayPage],
  quiz: [loadMysteryPage, loadBirthdayPage],
  birthdays: [loadMysteryPage, loadHomePageSafe],
  mystery: [loadChatPage, loadBlogPage],
  chat: [loadMysteryPage, loadSyncPage],
};

function loadHomePageSafe() {
  return loadPlannerPage();
}

export const getAppTabPreloaders = (activePage) => APP_TAB_PRELOADERS[activePage] || [];
