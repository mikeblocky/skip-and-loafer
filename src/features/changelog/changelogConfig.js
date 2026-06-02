import { BookMarked, Map, Layout, Zap } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-06-02-v18.1';
export const STORAGE_KEY = 'skip_changelogSeenVersion';
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
    title: 'Cozy dark mode refinements',
    icon: BookMarked,
    lines: [
      { type: 'fixed', text: 'Fixed dark mode readability of Settings page & Quick Controls section header icons.' },
      { type: 'fixed', text: 'Fixed contrast and text color in Quiz answer choices after choosing an answer.' },
      { type: 'fixed', text: 'Fixed dark mode styling of Relationship Map property sidebars, control buttons, and sub-circle elements.' },
      { type: 'fixed', text: 'Hid colorful background morphing shape gradients in Cozy Dark Mode.' },
      { type: 'fixed', text: 'Resolved dark mode color visibility on scroll-to-top buttons, changelog inner cards, and detailed planner modal.' },
      { type: 'fixed', text: 'Fixed volume popup scroll layout, sticky footer switcher, and un-bolded blog reader bottom buttons.' },
      { type: 'added', text: 'Added "Go to top" and "Return to list" buttons to the blog article detail view.' },
      { type: 'fixed', text: 'Fixed pushNow destructuring reference error on the Sync progress page.' }
    ],
  },
  {
    title: 'Cozy dark mode & notes overhaul',
    icon: BookMarked,
    lines: [
      { type: 'added', text: 'Adapted Relationship Map toolbar, options menu, and sidebars to Cozy Dark Mode.' },
      { type: 'added', text: 'Implemented a dedicated chapter notes manager tab to view, edit, and search all your reading notes in one cozy screen.' },
      { type: 'added', text: 'Added small scrapbook note indicators directly next to chapter titles in the list.' },
      { type: 'changed', text: 'Simplified and unbolded chapter notes headers to render clean numbers (e.g. Chapter 1).' },
      { type: 'changed', text: 'Adapted the fan-made website disclaimer dialog for a comfortable dark theme.' },
      { type: 'fixed', text: 'Fixed a typing bug in notes which prevented input or updates to note content.' },
      { type: 'changed', text: 'Globally hid native web browsers scrollbars to preserve the premium, distraction-free scrapbooking aesthetic.' },
      { type: 'removed', text: 'Removed Side Works subtab from the chapter selection pages.' },
    ],
  },
  {
    title: 'Mobile navigation & layout optimization',
    icon: Layout,
    lines: [
      { type: 'fixed', text: 'Fixed volume selection modal height and pop-up scrollability.' },
      { type: 'added', text: 'Added editable and syncable log name features on the progress dashboard.' },
      { type: 'added', text: 'Added Pride tab inside the Fan Messages community board.' },
      { type: 'fixed', text: 'Fixed Relationship Map rendering error and disabled mobile edge-swiping navigation.' },
      { type: 'changed', text: 'Updated tab headers to use the Sniglet font for a cleaner aesthetic.' },
      { type: 'fixed', text: 'Adjusted layout padding, page spacing, and reading overlay modal sizing.' },
      { type: 'removed', text: 'Removed Pride game submodule to optimize bundle size and fit Hobby plan serverless limits.' }
    ],
  },
  {
    title: 'Custom story map',
    icon: Map,
    lines: [
      { type: 'added', text: 'Implemented manual node resizing with pulsing interactive handles for all characters.' },
      { type: 'added', text: 'Added custom curvature control and smart label offsets for complex relationship bonds.' },
      { type: 'added', text: 'New "Name position" toggle allows shifting character labels between Top and Bottom.' },
      { type: 'changed', text: 'Optimized export engine for crystal-clear 3x resolution PNG downloads.' },
      { type: 'changed', text: 'Standardized all UI labels and buttons to sentence case for a cleaner look.' },
    ],
  },
  {
    title: 'Lite mobile experience',
    icon: Layout,
    lines: [
      { type: 'added', text: 'Enforced full-screen design mode on mobile by default for maximum workspace.' },
      { type: 'changed', text: 'Redesigned mobile toolbar and pop-ups to be more compact and thumb-friendly.' },
      { type: 'added', text: 'Implemented a sliding "Bottom sheet" property drawer for easier editing on small screens.' },
    ],
  },
  {
    title: 'Custom tier maker',
    icon: Zap,
    lines: [
      { type: 'changed', text: 'Rebranded Rating Board to "Tier maker" to support fully customized ranking categories.' },
      { type: 'fixed', text: 'Fixed a rendering bug where shadows appeared as grey blocks in exported images.' },
      { type: 'changed', text: 'Increased character grid density in selection menus to reduce scrolling.' },
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
