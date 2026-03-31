export const UI_TEXT = {
  en: { header: 'Blog', listHint: 'Latest posts and transcripts', readPost: 'Read blog', backToList: 'Back to blogs', noBlogs: 'No blogs yet.', empty: 'No content available.', minutesRead: 'min read', minuteUnit: 'min', postsLabel: 'Posts', totalLabel: 'Total time', readerControls: 'Reader modes', openingReader: 'Opening article...', largeTextMode: 'Larger text', widerSpacingMode: 'Wider spacing', focusWidthMode: 'Comfort width', themePaper: 'Paper', themeSepia: 'Sepia', themeNight: 'Night', sortOldToNew: 'Oldest → newest', sortNewToOld: 'Newest → oldest', returnToTop: 'Top' },
  es: { header: 'Blog', listHint: 'Últimas publicaciones y transcripciones', readPost: 'Leer blog', backToList: 'Volver a blogs', noBlogs: 'Aún no hay blogs.', empty: 'No hay contenido disponible.', minutesRead: 'min de lectura', minuteUnit: 'min', postsLabel: 'Publicaciones', totalLabel: 'Tiempo total', readerControls: 'Modos de lectura', openingReader: 'Abriendo artículo...', largeTextMode: 'Texto más grande', widerSpacingMode: 'Más espacio', focusWidthMode: 'Ancho cómodo', themePaper: 'Papel', themeSepia: 'Sepia', themeNight: 'Noche', sortOldToNew: 'Más antiguos → más nuevos', sortNewToOld: 'Más nuevos → más antiguos', returnToTop: 'Arriba' },
  pt: { header: 'Blog', listHint: 'Últimas postagens e transcrições', readPost: 'Ler blog', backToList: 'Voltar aos blogs', noBlogs: 'Ainda não há blogs.', empty: 'Nenhum conteúdo disponível.', minutesRead: 'min de leitura', minuteUnit: 'min', postsLabel: 'Postagens', totalLabel: 'Tempo total', readerControls: 'Modos de leitura', openingReader: 'Abrindo artigo...', largeTextMode: 'Texto maior', widerSpacingMode: 'Mais espaçamento', focusWidthMode: 'Largura confortável', themePaper: 'Papel', themeSepia: 'Sépia', themeNight: 'Noite', sortOldToNew: 'Mais antigos → mais novos', sortNewToOld: 'Mais novos → mais antigos', returnToTop: 'Topo' },
  fr: { header: 'Blog', listHint: 'Derniers billets et transcriptions', readPost: 'Lire le blog', backToList: 'Retour aux blogs', noBlogs: 'Aucun blog pour le moment.', empty: 'Aucun contenu disponible.', minutesRead: 'min de lecture', minuteUnit: 'min', postsLabel: 'Billets', totalLabel: 'Temps total', readerControls: 'Modes de lecture', openingReader: 'Ouverture de l’article...', largeTextMode: 'Texte plus grand', widerSpacingMode: 'Plus d’espacement', focusWidthMode: 'Largeur confortable', themePaper: 'Papier', themeSepia: 'Sépia', themeNight: 'Nuit', sortOldToNew: 'Plus anciens → plus récents', sortNewToOld: 'Plus récents → plus anciens', returnToTop: 'Haut' },
  de: { header: 'Blog', listHint: 'Neueste Beiträge und Transkripte', readPost: 'Blog lesen', backToList: 'Zurück zu Blogs', noBlogs: 'Noch keine Blogs.', empty: 'Kein Inhalt verfügbar.', minutesRead: 'Min. Lesezeit', minuteUnit: 'Min.', postsLabel: 'Beiträge', totalLabel: 'Gesamtzeit', readerControls: 'Lesemodi', openingReader: 'Artikel wird geöffnet...', largeTextMode: 'Größerer Text', widerSpacingMode: 'Mehr Abstand', focusWidthMode: 'Komfortbreite', themePaper: 'Papier', themeSepia: 'Sepia', themeNight: 'Nacht', sortOldToNew: 'Älteste → neueste', sortNewToOld: 'Neueste → älteste', returnToTop: 'Nach oben' },
  it: { header: 'Blog', listHint: 'Ultimi post e trascrizioni', readPost: 'Leggi il blog', backToList: 'Torna ai blog', noBlogs: 'Nessun blog al momento.', empty: 'Nessun contenuto disponibile.', minutesRead: 'min di lettura', minuteUnit: 'min', postsLabel: 'Post', totalLabel: 'Tempo totale', readerControls: 'Modalità lettura', openingReader: 'Apertura articolo...', largeTextMode: 'Testo più grande', widerSpacingMode: 'Più spazio', focusWidthMode: 'Larghezza comoda', themePaper: 'Carta', themeSepia: 'Seppia', themeNight: 'Notte', sortOldToNew: 'Più vecchi → più recenti', sortNewToOld: 'Più recenti → più vecchi', returnToTop: 'Su' },
};

export const NOTE_PALETTES = [
  { bg: '#fff0f3', border: '#ff9ec6', accent: '#ff6b9d' },
  { bg: '#eef6ff', border: '#8fd3ff', accent: '#4da6e8' },
  { bg: '#fefce8', border: '#ffe57f', accent: '#d4a017' },
  { bg: '#f0fdf4', border: '#97eba9', accent: '#4ead6b' },
  { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6' },
  { bg: '#fff7ed', border: '#fdba74', accent: '#ea7e30' },
  { bg: '#ecfeff', border: '#67e8f9', accent: '#0891b2' },
];

export const formatDate = (raw, locale) => {
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(raw));
  } catch {
    return raw;
  }
};

export const formatReadMinutes = (minutes, t) => `${minutes} ${t.minuteUnit || 'min'}`;

export const getReadMinutes = (text = '') => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 160));
};

export const getPreview = (content = '') => {
  const cleaned = content
    .replace(/\*\*/g, '')
    .replace(/---/g, ' ')
    .replace(/`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 180)}...`;
};

export const ensureMetaDescriptionTag = () => {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'description');
    document.head.appendChild(tag);
  }
  return tag;
};

const BLOG_READER_STATE_KEY = 'skip_blog_reader_state_v1';

export const readBlogReaderState = () => {
  try {
    const raw = localStorage.getItem(BLOG_READER_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      blogId: typeof parsed.blogId === 'string' ? parsed.blogId : null,
      scrollTop: Number.isFinite(parsed.scrollTop) ? Math.max(0, parsed.scrollTop) : 0,
      progress: Number.isFinite(parsed.progress) ? Math.max(0, Math.min(1, parsed.progress)) : 0,
    };
  } catch {
    return null;
  }
};

export const writeBlogReaderState = (state) => {
  try {
    localStorage.setItem(BLOG_READER_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
};

export const chunkMarkdownContent = (content = '', targetChars = 2800) => {
  if (!content) return [];
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  if (blocks.length <= 1) return [content];

  const chunks = [];
  let bucket = '';

  blocks.forEach((block) => {
    const next = bucket ? `${bucket}\n\n${block}` : block;
    if (next.length > targetChars && bucket) {
      chunks.push(bucket);
      bucket = block;
    } else {
      bucket = next;
    }
  });

  if (bucket) chunks.push(bucket);
  return chunks;
};
