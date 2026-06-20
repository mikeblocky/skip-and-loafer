import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getUI } from '../i18n/ui';
import Countdown from '../components/shared/Countdown';
import ReleaseNote from '../components/shared/ReleaseNote';
import { CHARACTER_COLORS } from '../data/characters';
import { CHAPTER_RELEASE_INFO } from '../data/chapterReleaseInfo';
import { QUOTES } from '../data/quotes';

const chapterReleaseNote = `Chapter ${CHAPTER_RELEASE_INFO.latestReleasedChapter} will be released in June issue!`;

const UI_TEXT = {
  en: { agenda: 'AGENDA', breakShort: chapterReleaseNote, breakLong: chapterReleaseNote },
  es: { agenda: 'AGENDA', breakShort: 'El Capítulo 81 llegará en la edición de junio!', breakLong: 'El Capítulo 81 llegará en la edición de junio!' },
  pt: { agenda: 'AGENDA', breakShort: 'O Capítulo 81 sai na edição de junho!', breakLong: 'O Capítulo 81 sai na edição de junho!' },
  fr: { agenda: 'AGENDA', breakShort: 'Le chapitre 81 sortira dans l édition de juin !', breakLong: 'Le chapitre 81 sortira dans l édition de juin !' },
  de: { agenda: 'AGENDA', breakShort: 'Kapitel 81 erscheint in der Juni-Ausgabe!', breakLong: 'Kapitel 81 erscheint in der Juni-Ausgabe!' },
  it: { agenda: 'AGENDA', breakShort: 'Il capitolo 81 uscerà nel numero di giugno!', breakLong: 'Il capitolo 81 uscirà nel numero di giugno!' },
  ja: { agenda: '予定', breakShort: '第81話は6月号に掲載予定です。', breakLong: '第81話は6月号に掲載予定です。' },
};

const LOCALE_BY_UI_LANGUAGE = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
};

const resolveLocalizedValue = (value, uiLanguage = 'en', fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const localized = value[uiLanguage] ?? value.en;
    return typeof localized === 'string' ? localized : fallback;
  }

  return fallback;
};

const QUOTE_CHARACTER_ALIASES = {
  'Iwakura Mitsumi': 'Mitsumi',
  'Shima Sousuke': 'Sousuke',
  'Egashira Mika': 'Mika',
  'Murashige Yuzuki': 'Yuzuki',
  'Kurume Makoto': 'Makoto',
};

const AgendaBadge = ({ isMobile, label }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
    <Star size={isMobile ? 18 : 22} fill="#fbbf24" color="#d97706" strokeWidth={2.5} />
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        fontSize: isMobile ? '1rem' : '1.25rem',
        fontWeight: 'bold',
        color: '#334155',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  </div>
);

const YearSticker = ({ isMobile }) => (
  <motion.div
    className="sketchbook-border"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    style={{
      backgroundColor: '#ffffff',
      border: '3px solid #3b82f6',
      borderBottom: '7px solid #1d4ed8',
      borderRadius: '12px',
      padding: isMobile ? '4px 12px' : '6px 16px',
      color: '#2563eb',
      fontFamily: 'Sniglet, var(--font-main)',
      fontSize: isMobile ? '1rem' : '1.25rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    }}
  >
    2026
  </motion.div>
);

const SeriesTitle = ({ seriesTitle, seriesTitleParts, isMobile, fontSize }) => {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: 'Sniglet, var(--font-main)',
        fontSize,
        lineHeight: 1.1,
        fontWeight: 'normal',
        width: '100%',
        maxWidth: '100%',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#3b82f6' }}>{seriesTitleParts[0]}</span>
      {seriesTitleParts.length > 1 && (
        <>
          <span style={{ color: '#64748b', margin: '0 0.1em', fontSize: '0.85em' }}>&amp;</span>
          <span style={{ color: '#ec4899' }}>{seriesTitleParts[1]}</span>
        </>
      )}
    </h1>
  );
};

const QuoteCard = ({ quote, isMobile, readableSpacing = false }) => {
  const paletteKey = QUOTE_CHARACTER_ALIASES[quote.author] || quote.author;
  const palette = CHARACTER_COLORS[paletteKey] || { bg: '#fef9c3', border: '#facc15', text: '#854d0e' };
  const quoteTextColor = palette.text || '#475569';
  const quoteAuthorColor = palette.border || '#a16207';
  const quoteBackground = palette.bg || '#fef9c3';
  const quoteBorder = palette.border || '#facc15';

  return (
    <motion.div
      className="sketchbook-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      style={{
        width: '100%',
        backgroundColor: quoteBackground,
        border: `3px solid ${quoteBorder}`,
        borderBottom: `8px solid ${quoteBorder}`,
        borderRadius: '20px',
        padding: isMobile ? '20px' : '24px',
        display: 'grid',
        gap: '12px',
        cursor: 'default',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-hand)',
          color: quoteTextColor,
          fontSize: isMobile ? '0.98rem' : '1.05rem',
          lineHeight: readableSpacing ? 1.7 : 1.55,
          fontWeight: '400',
        }}
      >
        "{quote.text}"
      </p>
      <p
        style={{
          margin: 0,
          textAlign: 'right',
          fontFamily: 'var(--font-hand)',
          color: quoteAuthorColor,
          fontSize: isMobile ? '0.92rem' : '1rem',
          fontWeight: '400',
        }}
      >
        — {quote.author}
      </p>
    </motion.div>
  );
};

const NoteRibbon = ({ text, isMobile }) => (
  <div
    className="sketchbook-border"
    style={{
      width: '100%',
      backgroundColor: '#eff6ff',
      border: '3px solid #3b82f6',
      borderBottom: '8px solid #1d4ed8',
      borderRadius: '16px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}
  >
    <span style={{ display: 'inline-flex', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #b91c1c', flexShrink: 0 }} />
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: '#1e40af',
        fontSize: isMobile ? '0.92rem' : '1.1rem',
        lineHeight: 1.4,
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {text}
    </span>
  </div>
);

const DateBadge = ({ dateLabel, timezoneLabel, isMobile }) => (
  <div
    className="sketchbook-border"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      border: '3px solid #cbd5e1',
      borderBottom: '8px solid #94a3b8',
      borderRadius: '16px',
      padding: isMobile ? '14px 18px' : '18px 24px',
      width: '100%',
      textAlign: 'center',
    }}
  >
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: '#1e293b',
        fontSize: isMobile ? '1rem' : '1.2rem',
        lineHeight: 1.3,
        fontWeight: 'bold',
      }}
    >
      {dateLabel} <span style={{ color: '#475569', fontSize: '0.9em', fontWeight: 'normal' }}>({timezoneLabel})</span>
    </span>
  </div>
);

const PlannerPage = ({ isMobile, uiLanguage = 'en', largeText = false, readableSpacing = false }) => {
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = getUI(uiLanguage);
  const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';

  usePageTitle(tGlobal.tabs?.home?.label || 'Home');

  const targetDate = new Date('2026-06-25T00:00:00+09:00');
  const localDateString = targetDate.toLocaleString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const timezoneOffsetMinutes = -new Date().getTimezoneOffset();
  const timezoneSign = timezoneOffsetMinutes >= 0 ? '+' : '-';
  const timezoneAbsMinutes = Math.abs(timezoneOffsetMinutes);
  const timezoneHours = String(Math.floor(timezoneAbsMinutes / 60)).padStart(2, '0');
  const timezoneMinutes = String(timezoneAbsMinutes % 60).padStart(2, '0');
  const timezoneLabel = `UTC${timezoneSign}${timezoneHours}:${timezoneMinutes}`;

  const agendaLabel = resolveLocalizedValue(t.agenda, uiLanguage, UI_TEXT.en.agenda);
  const breakLongLabel = resolveLocalizedValue(t.breakLong, uiLanguage, UI_TEXT.en.breakLong);
  const seriesTitle = resolveLocalizedValue(tGlobal.seriesTitle, uiLanguage, 'Skip & Loafer');
  const quoteText = resolveLocalizedValue(randomQuote?.text, uiLanguage, '');
  const quoteAuthor = resolveLocalizedValue(randomQuote?.author, uiLanguage, '');
  const seriesTitleParts = seriesTitle.includes(' & ') ? seriesTitle.split(' & ') : [seriesTitle];
  const resolvedQuote = {
    ...randomQuote,
    text: quoteText,
    author: quoteAuthor,
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '20px' : '28px',
        padding: isMobile ? '20px 14px 60px' : '32px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Redesigned Pop-Art Sketchbook Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          paddingBottom: '16px',
          borderBottom: '3.5px solid #cbd5e1',
        }}
      >
        <AgendaBadge isMobile={isMobile} label={agendaLabel} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
          <SeriesTitle
            isMobile={isMobile}
            seriesTitle={seriesTitle}
            seriesTitleParts={seriesTitleParts}
            fontSize={isMobile ? '1.25rem' : '2rem'}
          />
        </div>
        <YearSticker isMobile={isMobile} />
      </div>

      {/* Main Content Layout - Centered Column with beautiful pop-art widgets */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '28px',
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          alignItems: 'center',
        }}
      >
        <NoteRibbon text={breakLongLabel} isMobile={isMobile} />

        {/* Center-aligned, non-full-width Countdown Timer */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', maxWidth: isMobile ? '320px' : '620px' }}>
          <Countdown isMobile={isMobile} uiLanguage={uiLanguage} largeText={largeText} />
        </div>

        <DateBadge dateLabel={localDateString} timezoneLabel={timezoneLabel} isMobile={isMobile} />

        {/* Quote and Latest Chapter vertically separated on separate rows */}
        <QuoteCard quote={resolvedQuote} isMobile={isMobile} readableSpacing={readableSpacing} />
        
        <div
          className="sketchbook-border"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#fffbeb',
            border: '3px solid #f59e0b',
            borderBottom: '8px solid #d97706',
            borderRadius: '20px',
            padding: isMobile ? '18px' : '24px',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline largeText={largeText} />
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
