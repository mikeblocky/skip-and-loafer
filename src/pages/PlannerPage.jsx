import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import Countdown from '../components/shared/Countdown';
import ReleaseNote from '../components/shared/ReleaseNote';
import { CHARACTER_COLORS } from '../data/characters';
import { QUOTES } from '../data/quotes';

const UI_TEXT = {
  en: { agenda: 'AGENDA', breakShort: 'Chapter 80 will be released in May issue!', breakLong: 'Chapter 80 will be released in May issue!' },
  es: { agenda: 'AGENDA', breakShort: 'El Capítulo 80 llegará en la edición de mayo!', breakLong: 'El Capítulo 80 llegará en la edición de mayo!' },
  pt: { agenda: 'AGENDA', breakShort: 'O Capítulo 80 sai na edição de maio!', breakLong: 'O Capítulo 80 sai na edição de maio!' },
  fr: { agenda: 'AGENDA', breakShort: 'Le chapitre 80 sortira dans l édition de mai !', breakLong: 'Le chapitre 80 sortira dans l édition de mai !' },
  de: { agenda: 'AGENDA', breakShort: 'Kapitel 80 erscheint in der Mai-Ausgabe!', breakLong: 'Kapitel 80 erscheint in der Mai-Ausgabe!' },
  it: { agenda: 'AGENDA', breakShort: 'Il capitolo 80 uscirà nel numero di maggio!', breakLong: 'Il capitolo 80 uscirà nel numero di maggio!' },
  ja: { agenda: '予定', breakShort: '第80話は5月号に掲載予定です。', breakLong: '第80話は5月号に掲載予定です。' },
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

const AgendaBadge = ({ isMobile, label, largeText = false }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '10px' : '12px' }}>
    <Star size={isMobile ? 20 : 24} fill="#ffc93c" color="#f4b400" strokeWidth={2.2} />
      <span
        style={{
          fontFamily: 'Sniglet, var(--font-main)',
          fontSize: isMobile ? '1.2rem' : (largeText ? '1.42rem' : '1.3rem'),
          lineHeight: 1,
          fontWeight: '400',
          color: '#425b86',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
      {label}
    </span>
    <Star size={isMobile ? 20 : 24} fill="#ffc93c" color="#f4b400" strokeWidth={2.2} />
  </div>
);

const YearSticker = ({ isMobile, largeText = false }) => (
  <div
    className="sketchbook-border"
    style={{
      justifySelf: 'end',
      background: '#fbfdff',
      border: '3px solid #bfdbfe',
      borderBottom: '7px solid #60a5fa',
      borderRadius: '18px',
      padding: isMobile ? '10px 18px' : (largeText ? '12px 20px' : '10px 18px'),
      color: '#a8bfdc',
      fontFamily: 'Sniglet, var(--font-main)',
      fontSize: isMobile ? '1.8rem' : (largeText ? '2.7rem' : '2.46rem'),
      lineHeight: 1,
      fontWeight: '400',
      transform: 'rotate(-4deg)',
      boxShadow: '0 12px 22px rgba(96, 165, 250, 0.14)',
      whiteSpace: 'nowrap',
    }}
  >
    2026
  </div>
);

const SeriesTitle = ({ seriesTitle, seriesTitleParts, isMobile, largeText = false, fontSize, textAlign = 'left' }) => {
  const useSingleLineMobile = isMobile && !largeText;

  return (
    <h1
      data-planner-title="1"
      style={{
        margin: 0,
        fontFamily: 'Sniglet, var(--font-main)',
        fontSize,
          lineHeight: useSingleLineMobile ? 0.94 : 0.94,
        fontWeight: '400',
        textAlign,
        width: '100%',
        maxWidth: '100%',
        letterSpacing: '0',
        whiteSpace: useSingleLineMobile ? 'nowrap' : 'normal',
      }}
    >
      {seriesTitleParts.length > 1 ? (
        useSingleLineMobile ? (
          <>
            <span style={{ color: '#4ea4ff' }}>{seriesTitleParts[0]}</span>
            <span style={{ color: '#8d9db8', margin: '0 0.08em', fontSize: '0.75em' }}>&amp;</span>
            <span style={{ color: '#ff5ca8' }}>{seriesTitleParts[1]}</span>
          </>
        ) : (
          <>
            <span style={{ color: '#4ea4ff' }}>{seriesTitleParts[0]}</span>
            <span style={{ color: '#8d9db8', marginLeft: '0.08em', fontSize: '0.75em' }}>&amp;</span>
            <br />
            <span style={{ color: '#ff5ca8' }}>{seriesTitleParts[1]}</span>
          </>
        )
      ) : (
        <span style={{ color: '#4ea4ff' }}>{seriesTitle}</span>
      )}
    </h1>
  );
};

const QuoteCard = ({ quote, isMobile, largeText = false, readableSpacing = false }) => {
  const paletteKey = QUOTE_CHARACTER_ALIASES[quote.author] || quote.author;
  const palette = CHARACTER_COLORS[paletteKey] || { bg: '#fff7cc', border: '#facc15', text: '#8a6b00' };
  const quoteTextColor = palette.text || '#596579';
  const quoteAuthorColor = palette.border || '#8b6b00';
  const quoteBackground = palette.bg || '#fff7cc';
  const quoteBorder = palette.border || '#facc15';
  const quoteShadow = `${quoteBorder}55`;

  return (
    <motion.div
      data-planner-quote="1"
      className="sketchbook-border"
      initial={{ opacity: 0, y: 18, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.18 }}
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : (largeText ? '400px' : '372px'),
        background: quoteBackground,
        border: `3px solid ${quoteBorder}`,
        borderBottom: `8px solid ${quoteBorder}`,
        borderRadius: '22px',
        padding: isMobile ? '16px 16px 13px' : (largeText ? '18px 22px 16px' : '16px 20px 15px'),
        boxShadow: `0 16px 28px ${quoteShadow}`,
        display: 'grid',
        gap: isMobile ? '8px' : (largeText ? '12px' : '11px'),
        justifySelf: isMobile ? 'center' : 'start',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-main)',
          color: quoteTextColor,
          fontSize: isMobile ? '0.96rem' : (largeText ? '1.1rem' : '1rem'),
          lineHeight: isMobile ? 1.55 : (readableSpacing ? 1.76 : 1.66),
          textAlign: isMobile ? 'left' : 'left',
        }}
      >
        "{quote.text}"
      </p>
      <p
        style={{
          margin: 0,
          textAlign: isMobile ? 'right' : 'right',
          fontFamily: 'Sniglet, var(--font-main)',
          color: quoteAuthorColor,
          fontSize: isMobile ? '0.92rem' : (largeText ? '1.04rem' : '0.98rem'),
          lineHeight: 1.2,
          fontWeight: '400',
        }}
      >
        - {quote.author}
      </p>
    </motion.div>
  );
};

const NoteRibbon = ({ text, isMobile, largeText = false }) => (
  <motion.div
    data-planner-break-note="1"
    className="sketchbook-border paper-interact"
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 18 }}
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : (largeText ? '760px' : '700px'),
        background: '#f9fcff',
        border: '3px solid #93c5fd',
        borderBottom: '7px solid #3b82f6',
        borderRadius: '16px',
        padding: isMobile ? '12px 12px' : (largeText ? '14px 20px' : '12px 18px'),
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: isMobile ? '10px' : (largeText ? '18px' : '16px'),
        boxShadow: '0 12px 20px rgba(59, 130, 246, 0.16)',
      }}
  >
    <span style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', borderRadius: '999px', background: '#ffc93c', border: '2px solid #f59e0b' }} />
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: '#53698c',
        fontSize: isMobile ? '0.93rem' : (largeText ? '1.12rem' : '1.03rem'),
        lineHeight: 1.4,
        textAlign: 'center',
        fontWeight: '400',
      }}
    >
      {text}
    </span>
    <span style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', borderRadius: '999px', background: '#fb7185', border: '2px solid #e11d48' }} />
  </motion.div>
);

const DateBadge = ({ dateLabel, timezoneLabel, isMobile, largeText = false }) => (
  <div
    data-planner-date-badge="1"
    className="sketchbook-border"
    style={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: isMobile ? '6px' : '8px',
      background: '#e1f4ff',
      border: '3px solid #67c3ff',
      borderBottom: '8px solid #22a9f1',
      borderRadius: '18px',
      padding: isMobile ? '13px 16px' : (largeText ? '15px 26px' : '14px 24px'),
      width: isMobile ? '100%' : (largeText ? 'min(100%, 620px)' : 'min(100%, 560px)'),
      boxShadow: '0 14px 20px rgba(34, 169, 241, 0.18)',
      textAlign: 'center',
    }}
  >
    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#465973', fontSize: isMobile ? '1.08rem' : (largeText ? '1.24rem' : '1.12rem'), lineHeight: 1.3, fontWeight: '400' }}>
      {dateLabel}
    </span>
    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#465973', fontSize: isMobile ? '1.08rem' : (largeText ? '1.24rem' : '1.12rem'), lineHeight: 1.3, fontWeight: '400' }}>
      ({timezoneLabel})
    </span>
  </div>
);

const PlannerPage = ({ isMobile, uiLanguage = 'en', largeText = false, readableSpacing = false }) => {
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';

  usePageTitle(tGlobal.tabs?.home?.label || 'Home');

  const targetDate = new Date('2026-05-25T00:00:00+09:00');
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
  const desktopTitleSize = largeText ? 'clamp(4.8rem, 6.2vw, 5.6rem)' : 'clamp(4.2rem, 5.6vw, 5.0rem)';
  const desktopTitlePaddingTop = largeText || readableSpacing ? '60px' : '52px';
  const desktopQuotePaddingTop = largeText || readableSpacing ? '24px' : '18px';
  const desktopCountdownPaddingTop = largeText || readableSpacing ? '30px' : '24px';
  const desktopDatePaddingTop = largeText || readableSpacing ? '20px' : '16px';
  const desktopReleasePaddingTop = largeText || readableSpacing ? '18px' : '14px';
  const agendaLabel = resolveLocalizedValue(t.agenda, uiLanguage, UI_TEXT.en.agenda);
  const breakShortLabel = resolveLocalizedValue(t.breakShort, uiLanguage, UI_TEXT.en.breakShort);
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

  const pageStyle = {
    padding: isMobile ? '18px 14px 22px' : (largeText ? '34px 28px 28px' : '28px 22px 26px'),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: 'transparent',
  };
  const leftPageStyle = isMobile
    ? pageStyle
    : {
      ...pageStyle,
      padding: largeText ? '36px 28px 30px' : '30px 24px 28px',
      flex: largeText ? '0.7 1 0' : '0.68 1 0',
      minWidth: 0,
    };
  const rightPageStyle = isMobile
    ? pageStyle
    : {
      ...pageStyle,
      padding: largeText ? '38px 30px 34px 24px' : '34px 28px 30px 22px',
      flex: largeText ? '1.3 1 0' : '1.32 1 0',
      minWidth: 0,
    };

  if (isMobile) {
    return (
      <div
        className="planner-page"
        style={{
          ...pageStyle,
          padding: largeText ? '18px 16px 20px 20px' : '16px 14px 18px 18px',
          gap: largeText ? '16px' : '14px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '10px' }}>
          <AgendaBadge isMobile={isMobile} label={agendaLabel} />
          <YearSticker isMobile={isMobile} />
        </div>

        <SeriesTitle
          isMobile={isMobile}
          largeText={largeText}
          seriesTitle={seriesTitle}
          seriesTitleParts={seriesTitleParts}
          fontSize={largeText ? 'clamp(3.2rem, 10vw, 3.8rem)' : 'clamp(2.4rem, 7.9vw, 3rem)'}
          textAlign={largeText ? 'left' : 'center'}
        />

        <div style={{ width: '100%', paddingTop: '2px' }}>
          <NoteRibbon text={breakShortLabel} isMobile={isMobile} largeText={largeText} />
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Countdown isMobile={isMobile} uiLanguage={uiLanguage} largeText={largeText} inlineMobile />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DateBadge dateLabel={localDateString} timezoneLabel={timezoneLabel} isMobile={isMobile} largeText={largeText} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            paddingTop: '10px',
            marginTop: '4px',
            borderTop: '2px solid rgba(191, 219, 254, 0.72)',
          }}
        >
          <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline largeText={largeText} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '2px', marginTop: 'auto' }}>
          <QuoteCard quote={resolvedQuote} isMobile={isMobile} largeText={largeText} readableSpacing={readableSpacing} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="planner-home-panel"
        style={{
          ...leftPageStyle,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '12px', marginBottom: 0 }}>
          <AgendaBadge isMobile={isMobile} label={agendaLabel} largeText={largeText} />
          <YearSticker isMobile={isMobile} largeText={largeText} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'flex-start' }}>
          <div style={{ display: 'grid', gap: '6px', justifyItems: 'start', width: '100%', paddingTop: desktopTitlePaddingTop }}>
            <SeriesTitle
              isMobile={isMobile}
              largeText={largeText}
              seriesTitle={seriesTitle}
              seriesTitleParts={seriesTitleParts}
              fontSize={desktopTitleSize}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 'auto', paddingTop: desktopQuotePaddingTop }}>
            <QuoteCard quote={resolvedQuote} isMobile={isMobile} largeText={largeText} readableSpacing={readableSpacing} />
          </div>
        </div>
      </div>

      <div className="spiral-binding-center" style={{ zIndex: 20 }} />

      <div
        className="planner-home-panel"
        style={{
          ...rightPageStyle,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: largeText ? '840px' : '780px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: largeText || readableSpacing ? '8px 10px 10px' : '6px 8px 8px',
          }}
        >
          <NoteRibbon text={breakLongLabel} isMobile={isMobile} largeText={largeText} />

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: desktopCountdownPaddingTop }}>
            <Countdown isMobile={isMobile} uiLanguage={uiLanguage} largeText={largeText} />
          </div>

          <div style={{ paddingTop: desktopDatePaddingTop }}>
            <DateBadge dateLabel={localDateString} timezoneLabel={timezoneLabel} isMobile={isMobile} largeText={largeText} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: desktopReleasePaddingTop }}>
            <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline largeText={largeText} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlannerPage;

