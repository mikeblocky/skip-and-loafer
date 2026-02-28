import { Zap, Bug, Cake, BookOpen, ShoppingBag, Images } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-02-28-v10.7';
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
    title: 'New features: Blog and reader',
    icon: BookOpen,
    lines: [
      { type: 'added', text: 'Added Blog page with post listing and detail reading flow.' },
      { type: 'added', text: 'Added Blog Reader with markdown rendering, media support, and reader-focused layout.' },
      { type: 'added', text: 'Added in-reader progress tracking and a reader Top button for long posts.' },
      { type: 'added', text: 'Added image lightbox experience for blog media (tap/click to open enlarged view).' },
    ],
  },
  {
    title: 'Home layout and controls',
    icon: Cake,
    lines: [
      { type: 'changed', text: 'Release note is now placed directly under the local-time area on Home, instead of floating over content.' },
      { type: 'fixed', text: 'Release note no longer overlaps planner content and stays visually aligned with countdown/time sections.' },
      { type: 'changed', text: 'Accessibility quick control moves to the top while in read mode and returns to bottom when exiting read mode.' },
      { type: 'changed', text: 'Shortcuts quick button is hidden on mobile for a cleaner compact layout.' },
    ],
  },
  {
    title: 'Top button behavior',
    icon: Zap,
    lines: [
      { type: 'added', text: 'Added a global Top button for long-scroll pages in the main app shell.' },
      { type: 'fixed', text: 'Global Top button now uses Blog-style right-bottom placement and matching visual behavior.' },
      { type: 'fixed', text: 'Removed duplicate Top button on Blog by disabling the global one there (Blog keeps its own reader Top control).' },
    ],
  },
  {
    title: 'Blog page fixes and media update',
    icon: Images,
    lines: [
      { type: 'changed', text: 'Interview blog post image sources were moved from remote social URLs to local project assets.' },
      { type: 'fixed', text: 'Resolved React hydration error caused by invalid markdown block content nesting inside paragraph rendering.' },
      { type: 'fixed', text: 'Image pair layout for the target two-image section is now tightly joined with no visible gap.' },
      { type: 'changed', text: 'Removed the old “latest update” helper line and improved blog title emphasis in list/detail views.' },
    ],
  },
  {
    title: 'Typography and tabs',
    icon: Zap,
    lines: [
      { type: 'changed', text: 'Tab headers and all major page titles now use Sniglet with normal weight for consistent styling.' },
      { type: 'changed', text: 'Updated mobile tab labels to full localized names (Gallery and Birthdays) across all supported UI languages.' },
    ],
  },
  {
    title: 'Country-aware volume links',
    icon: ShoppingBag,
    lines: [
      { type: 'changed', text: 'Updated Spanish volume purchase links to Milky Way Ediciones product pages.' },
      { type: 'added', text: 'Added Mexico native purchase mapping (Penguin Libros MX links) and locale support for MX language fallback.' },
      { type: 'fixed', text: 'Native language labels for mapped countries are now shown with better locale-aware naming and fallback behavior.' },
    ],
  },
  {
    title: 'Shortcuts and language menu',
    icon: Bug,
    lines: [
      { type: 'changed', text: 'Main tab shortcuts use 1..6 directly and subtab navigation uses Q/E.' },
      { type: 'changed', text: 'Language selector uses a custom menu with outside-click and Esc close behavior.' },
      { type: 'fixed', text: 'Shortcut help content now reflects current key mappings more accurately.' },
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
  vi: { whatsNew: 'Có gì mới', releaseDate: 'Ngày phát hành', local: 'giờ địa phương', gotIt: 'Đã hiểu!', type: { added: 'Thêm', changed: 'Thay đổi', removed: 'Đã xóa', fixed: 'Đã sửa' } },
};
