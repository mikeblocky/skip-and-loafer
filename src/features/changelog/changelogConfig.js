import { Moon, Sparkles, Palette, BookOpen, LayoutGrid, Zap } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-06-17-v19.0';
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
    title: 'Dark mode: full overhaul',
    icon: Moon,
    color: { border: '#818cf8', bottom: '#6366f1', bg: 'var(--surface-card, #eef2ff)', icon: '#818cf8' },
    lines: [
      { type: 'fixed', text: 'Systemic fix: all sketchbook panel elements now properly darken. No more white card surprises.' },
      { type: 'fixed', text: 'Chapter reading cards, leaderboard rows, and tutorial guide sections fully adapted.' },
      { type: 'fixed', text: 'Mystery pick draw button and pulled-character prediction card now use dark surfaces.' },
      { type: 'fixed', text: 'Blog reader Paper & Sepia button, quiz choice grids, and rank question selections now respect dark mode.' },
      { type: 'fixed', text: 'Settings accessibility rows: checkboxes and labels now clearly visible in dark mode.' },
      { type: 'fixed', text: 'Added missing RGB color variants so browser-serialized inline styles are correctly overridden.' },
    ],
  },
  {
    title: 'High contrast improvements',
    icon: Sparkles,
    color: { border: '#f472b6', bottom: '#ec4899', bg: 'var(--surface-card, #fdf2f8)', icon: '#f472b6' },
    lines: [
      { type: 'fixed', text: 'Active/checked option rows in high contrast + dark mode no longer flash white.' },
      { type: 'fixed', text: 'All settings card panels stay dark when high contrast and dark mode are both on.' },
    ],
  },
  {
    title: 'Paper notebook aesthetic',
    icon: BookOpen,
    color: { border: '#fb923c', bottom: '#ea580c', bg: 'var(--surface-card, #fff7ed)', icon: '#fb923c' },
    lines: [
      { type: 'added', text: 'Introduced the full paper notebook visual identity: textured panels, scrapbook borders, and hand-drawn accents throughout.' },
      { type: 'added', text: 'Skip & Loafer character illustrations added as animated companions across key screens.' },
      { type: 'changed', text: 'Gallery images converted to WebP for faster loads and crisper quality.' },
    ],
  },
  {
    title: 'Gallery & layout polish',
    icon: LayoutGrid,
    color: { border: '#34d399', bottom: '#059669', bg: 'var(--surface-card, #ecfdf5)', icon: '#34d399' },
    lines: [
      { type: 'changed', text: 'Gallery cards are smaller and denser; layout is wider with bigger, bolder text.' },
      { type: 'changed', text: 'Sniglet font weight unified across all gallery headings for a cleaner look.' },
    ],
  },
  {
    title: 'Quiz experience',
    icon: Zap,
    color: { border: '#fbbf24', bottom: '#d97706', bg: 'var(--surface-card, #fffbeb)', icon: '#fbbf24' },
    lines: [
      { type: 'fixed', text: 'Quiz playing screen is now scrollable so long questions never get clipped.' },
      { type: 'changed', text: 'Inline feedback bar replaces the old pop-up modal. Stays in context as you play.' },
      { type: 'changed', text: 'Narrower max-width keeps questions readable on wide screens.' },
    ],
  },
  {
    title: 'Color scheme options',
    icon: Palette,
    color: { border: '#60a5fa', bottom: '#2563eb', bg: 'var(--surface-card, #eff6ff)', icon: '#60a5fa' },
    lines: [
      { type: 'added', text: 'Color vision modes (Protanopia, Deuteranopia, Tritanopia, Black & White) added to Settings.' },
      { type: 'added', text: 'Blog reader now lets you switch between Paper, Sepia, and Night color themes.' },
    ],
  },
];

export const TYPE_META = {
  added:   { label: 'New',     dot: '#22c55e' },
  changed: { label: 'Updated', dot: '#3b82f6' },
  removed: { label: 'Removed', dot: '#ef4444' },
  fixed:   { label: 'Fixed',   dot: '#f59e0b' },
};

export const UI_TEXT = {
  en: { whatsNew: "What's new", releaseDate: 'Release date', local: 'local', gotIt: 'Got it!', type: { added: 'New', changed: 'Updated', removed: 'Removed', fixed: 'Fixed' } },
  es: { whatsNew: 'Novedades', releaseDate: 'Fecha de lanzamiento', local: 'local', gotIt: '¡Entendido!', type: { added: 'Nuevo', changed: 'Actualizado', removed: 'Eliminado', fixed: 'Corregido' } },
  pt: { whatsNew: 'Novidades', releaseDate: 'Data de lançamento', local: 'local', gotIt: 'Entendi!', type: { added: 'Novo', changed: 'Atualizado', removed: 'Removido', fixed: 'Corrigido' } },
  fr: { whatsNew: 'Nouveautés', releaseDate: 'Date de sortie', local: 'locale', gotIt: 'Compris !', type: { added: 'Nouveau', changed: 'Mis à jour', removed: 'Supprimé', fixed: 'Corrigé' } },
  de: { whatsNew: 'Neuigkeiten', releaseDate: 'Veröffentlichungsdatum', local: 'lokal', gotIt: 'Verstanden!', type: { added: 'Neu', changed: 'Aktualisiert', removed: 'Entfernt', fixed: 'Behoben' } },
  it: { whatsNew: 'Novità', releaseDate: 'Data di rilascio', local: 'locale', gotIt: 'Capito!', type: { added: 'Nuovo', changed: 'Aggiornato', removed: 'Rimosso', fixed: 'Corretto' } },
};
