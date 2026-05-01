import { BookMarked } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-05-01-v16.0';
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
    title: 'Website status',
    icon: BookMarked,
    lines: [
      { type: 'added', text: 'The website is back online for a limited time!' },
    ],
  },
  {
    title: 'Previous highlights',
    icon: BookMarked,
    lines: [
      { type: 'added', text: 'Fan gallery is now the home for series art, fan creations, fanarts, images, and other community uploads.' },
      { type: 'added', text: 'Sign (Message) is a place to write messages about the series and share other notes.' },
      { type: 'changed', text: 'The UI got a broader visual refresh across tabs, cards, and navigation for a cleaner, more cohesive look.' },
      { type: 'added', text: 'Mystery now includes a daily character draw, a who-are-you character quiz, and a which animal are you quiz.' },
      { type: 'changed', text: 'More localized translations were added and expanded across the app, including blog and changelog copy.' },
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
