import { lazy } from 'react';

export const loadMangaReader = () => import('../mangaReader/MangaReader');

export const MangaReader = lazy(loadMangaReader);
export const AppQuickControls = lazy(() => import('./AppQuickControls'));
export const AppDisclaimerModal = lazy(() => import('./AppDisclaimerModal'));
export const AppDecorativeLayer = lazy(() => import('./AppDecorativeLayer'));
export const ChangelogPopup = lazy(() => import('../../components/shared/ChangelogPopup'));
export const BirthdayNotification = lazy(() => import('../../components/shared/BirthdayNotification'));
export const RetirementPopup = lazy(() => import('../../components/shared/RetirementPopup'));
