import { Music } from 'lucide-react';

export const CHANGELOG_VERSION = '2026-06-21-v20.0';
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
    title: 'Musical library added in Gallery',
    icon: Music,
    color: { border: '#c084fc', bottom: '#a855f7', bg: 'var(--surface-card, #faf5ff)', icon: '#c084fc' },
    lines: [
      { type: 'added', text: 'New Musical section in the Gallery collecting videos, GIFs, and photos from the stage musical.' },
      { type: 'added', text: 'Filter by All, Videos, GIFs, or Images to quickly find what you want to watch.' },
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
  en: { whatsNew: "What's new", releaseDate: 'Release date', local: 'local', gotIt: 'Dismiss', type: { added: 'New', changed: 'Updated', removed: 'Removed', fixed: 'Fixed' } },
  es: { whatsNew: 'Novedades', releaseDate: 'Fecha de lanzamiento', local: 'local', gotIt: '¡Entendido!', type: { added: 'Nuevo', changed: 'Actualizado', removed: 'Eliminado', fixed: 'Corregido' } },
  pt: { whatsNew: 'Novidades', releaseDate: 'Data de lançamento', local: 'local', gotIt: 'Entendi!', type: { added: 'Novo', changed: 'Atualizado', removed: 'Removido', fixed: 'Corrigido' } },
  fr: { whatsNew: 'Nouveautés', releaseDate: 'Date de sortie', local: 'locale', gotIt: 'Compris !', type: { added: 'Nouveau', changed: 'Mis à jour', removed: 'Supprimé', fixed: 'Corrigé' } },
  de: { whatsNew: 'Neuigkeiten', releaseDate: 'Veröffentlichungsdatum', local: 'lokal', gotIt: 'Verstanden!', type: { added: 'Neu', changed: 'Aktualisiert', removed: 'Entfernt', fixed: 'Behoben' } },
  it: { whatsNew: 'Novità', releaseDate: 'Data di rilascio', local: 'locale', gotIt: 'Capito!', type: { added: 'Nuovo', changed: 'Aggiornato', removed: 'Rimosso', fixed: 'Corretto' } },
};
