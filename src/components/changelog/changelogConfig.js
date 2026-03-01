import { Zap, Bug, Cake, BookOpen } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-03-01-v11.1';
export const STORAGE_KEY = 'skip_changelogSeen';
export const RELEASE_DATE = CHANGELOG_VERSION.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || 'Unknown';

export const formatReleaseDate = (dateString) => {
  if (!dateString || dateString === 'Unknown') return 'Unknown';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const getUtcOffsetLabel = () => {
  const totalMinutes = -new Date().getTimezoneOffset();
  const sign = totalMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(totalMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
  const minutes = String(absMinutes % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
};

export const CHANGELOG_SERIES = [
  {
    title: 'Quiz (new feature)',
    icon: BookOpen,
    lines: [
      { type: 'added', text: 'Added a full Quiz tab with Questions, Leaderboard, and History sub-tabs.' },
      { type: 'added', text: 'Added quiz history tracking (name, score, set, mode, date) with local persistence.' },
      { type: 'added', text: 'Added new set sizes: 10, 25, 50, 100, 125, 150, 175, and 200.' },
      { type: 'added', text: 'Added Random mode and All-in-level gameplay flow with side-by-side setup chips.' },
    ],
  },
  {
    title: 'Navigation and gestures',
    icon: Cake,
    lines: [
      { type: 'changed', text: 'Added swipe gesture navigation for main tab switching on touch devices.' },
      { type: 'changed', text: 'Updated shortcut behavior so main tab and sub-tab navigation are clearer and more consistent.' },
      { type: 'fixed', text: 'Improved interaction safety for in-progress quiz sessions with a return-to-menu confirmation step.' },
    ],
  },
  {
    title: 'Language behavior updates',
    icon: Bug,
    lines: [
      { type: 'changed', text: 'Language selection is now handled in a separated custom language menu flow.' },
      { type: 'changed', text: 'Initial UI language now auto-selects using locale/location-aware detection with English fallback.' },
      { type: 'fixed', text: 'Language fallback behavior is more reliable when region/language mapping is unavailable.' },
    ],
  },
  {
    title: 'Accessibility upgrades',
    icon: Cake,
    lines: [
      { type: 'added', text: 'Added color vision mode options by group: Off, Protanopia, Deuteranopia, Tritanopia, and Black & White.' },
      { type: 'added', text: 'Added a dim non-essential colors toggle to reduce visual intensity while keeping content readable.' },
      { type: 'added', text: 'Added dedicated shortcut-help localization keys so panel guidance can be translated per language.' },
      { type: 'changed', text: 'Accessibility panel now includes grouped color-vision controls for faster profile switching.' },
      { type: 'changed', text: 'Color-vision labels are now localized across supported languages in the UI text dictionary.' },
      { type: 'fixed', text: 'Black & White mode now enforces stronger button contrast tiers (default/selected/disabled) for clearer state recognition.' },
      { type: 'fixed', text: 'Focus outlines and form controls were tuned for stronger readability under Black & White mode.' },
      { type: 'fixed', text: 'New accessibility preferences persist in storage and re-apply correctly on reload.' },
    ],
  },
  {
    title: 'Decorative layer',
    icon: Zap,
    lines: [
      { type: 'changed', text: 'Character stickers now stay on side lanes on desktop for cleaner center-content focus.' },
      { type: 'fixed', text: 'Character stickers are now hidden on mobile for a less cluttered small-screen layout.' },
      { type: 'removed', text: 'Removed random in-page sticker placement behavior in the current decorative layout.' },
    ],
  },
];

export const TYPE_COLORS = {
  added: { bg: '#dbeafe', text: '#1e40af', label: 'Added' },
  changed: { bg: '#d1fae5', text: '#065f46', label: 'Changed' },
  removed: { bg: '#fee2e2', text: '#991b1b', label: 'Removed' },
  fixed: { bg: '#fef3c7', text: '#92400e', label: 'Fixed' },
};

export const UI_TEXT = {
  en: { whatsNew: "What's new", releaseDate: 'Release date', local: 'local', gotIt: 'Got it!', type: { added: 'Added', changed: 'Changed', removed: 'Removed', fixed: 'Fixed' } },
  es: { whatsNew: 'Novedades', releaseDate: 'Fecha de lanzamiento', local: 'local', gotIt: '¡Entendido!', type: { added: 'Añadido', changed: 'Cambiado', removed: 'Eliminado', fixed: 'Corregido' } },
  pt: { whatsNew: 'Novidades', releaseDate: 'Data de lançamento', local: 'local', gotIt: 'Entendi!', type: { added: 'Adicionado', changed: 'Alterado', removed: 'Removido', fixed: 'Corrigido' } },
  fr: { whatsNew: 'Nouveautés', releaseDate: 'Date de sortie', local: 'locale', gotIt: 'Compris !', type: { added: 'Ajouté', changed: 'Modifié', removed: 'Supprimé', fixed: 'Corrigé' } },
  de: { whatsNew: 'Neuigkeiten', releaseDate: 'Veröffentlichungsdatum', local: 'lokal', gotIt: 'Verstanden!', type: { added: 'Hinzugefügt', changed: 'Geändert', removed: 'Entfernt', fixed: 'Behoben' } },
  it: { whatsNew: 'Novità', releaseDate: 'Data di rilascio', local: 'locale', gotIt: 'Capito!', type: { added: 'Aggiunto', changed: 'Modificato', removed: 'Rimosso', fixed: 'Corretto' } },
};
