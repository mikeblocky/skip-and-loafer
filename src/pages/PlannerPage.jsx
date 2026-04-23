import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import ReleaseNote from '../components/shared/ReleaseNote';
import { CHARACTER_COLORS } from '../data/characters';
import { QUOTES } from '../data/quotes';

const UI_TEXT = {
  en: { agenda: 'AGENDA', breakShort: 'Thank you for supporting, this website will be retired soon', breakLong: 'Thank you for supporting, this website will be retired soon' },
  es: { agenda: 'AGENDA', breakShort: 'Gracias por tu apoyo, este sitio se retirará pronto', breakLong: 'Gracias por tu apoyo, este sitio se retirará pronto' },
  pt: { agenda: 'AGENDA', breakShort: 'Obrigado pelo apoio, este site será encerrado em breve', breakLong: 'Obrigado pelo apoio, este site será encerrado em breve' },
  fr: { agenda: 'AGENDA', breakShort: 'Merci pour votre soutien, ce site prendra bientôt sa retraite', breakLong: 'Merci pour votre soutien, ce site prendra bientôt sa retraite' },
  de: { agenda: 'AGENDA', breakShort: 'Danke für die Unterstützung, diese Website wird bald eingestellt', breakLong: 'Danke für die Unterstützung, diese Website wird bald eingestellt' },
  it: { agenda: 'AGENDA', breakShort: 'Grazie per il supporto, questo sito andrà presto in pensione', breakLong: 'Grazie per il supporto, questo sito andrà presto in pensione' },
  ja: { agenda: '予定', breakShort: '応援ありがとうございました。このサイトは間もなく閉鎖されます。', breakLong: '応援ありがとうございました。このサイトは間もなく閉鎖されます。' },
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

const QuoteCard = ({ quote, isMobile, largeText = false, readableSpacing = false }) => {
  const palette = CHARACTER_COLORS[quote.author] || { border: '#facc15', text: '#8a6b00' };

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
        background: '#fff1a8',
        border: '3px solid #f4c20d',
        borderBottom: '8px solid #de9f00',
        borderRadius: '22px',
        padding: isMobile ? '16px 16px 13px' : (largeText ? '18px 22px 16px' : '16px 20px 15px'),
        boxShadow: '0 16px 28px rgba(234, 179, 8, 0.24)',
        display: 'grid',
        gap: isMobile ? '8px' : (largeText ? '12px' : '11px'),
        justifySelf: isMobile ? 'center' : 'start',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-main)',
          color: '#596579',
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
          color: '#8b6b00',
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



const PlannerPage = ({ isMobile, uiLanguage = 'en', largeText = false, readableSpacing = false }) => {
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';

  usePageTitle(tGlobal.tabs?.home?.label || 'Home');

  const desktopTitleSize = largeText ? 'clamp(3.9rem, 5vw, 4.56rem)' : 'clamp(3.55rem, 4.65vw, 4.22rem)';
  const desktopTitlePaddingTop = largeText || readableSpacing ? '60px' : '52px';
  const desktopQuotePaddingTop = largeText || readableSpacing ? '24px' : '18px';
  const desktopReleasePaddingTop = largeText || readableSpacing ? '18px' : '14px';
  const seriesTitle = tGlobal.seriesTitle || 'Skip & Loafer';
  const seriesTitleParts = seriesTitle.includes(' & ') ? seriesTitle.split(' & ') : [seriesTitle];

  const pageStyle = {
    padding: isMobile ? '18px 14px 22px' : (largeText ? '34px 28px 28px' : '28px 22px 26px'),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: 'var(--paper-white)',
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
          <AgendaBadge isMobile={isMobile} label={t.agenda} />
          <YearSticker isMobile={isMobile} />
        </div>

        <h1
          data-planner-title="1"
          style={{
            margin: 0,
            fontFamily: 'Sniglet, var(--font-main)',
            fontSize: largeText ? 'clamp(2.7rem, 8.7vw, 3.24rem)' : 'clamp(2.42rem, 8vw, 2.98rem)',
            lineHeight: 0.94,
            fontWeight: '400',
            textAlign: 'center',
            width: '100%',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.03em',
          }}
        >
          {seriesTitleParts.length > 1 ? (
            <>
              <span style={{ color: '#4ea4ff' }}>{seriesTitleParts[0]}</span>
              <span style={{ color: '#8d9db8' }}>&amp; </span>
              <span style={{ color: '#ff5ca8' }}>{seriesTitleParts[1]}</span>
            </>
          ) : (
            <span style={{ color: '#4ea4ff' }}>{seriesTitle}</span>
          )}
        </h1>

        <div style={{ width: '100%', paddingTop: '2px' }}>
          <NoteRibbon text={t.breakShort} isMobile={isMobile} largeText={largeText} />
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
          <QuoteCard quote={randomQuote} isMobile={isMobile} largeText={largeText} readableSpacing={readableSpacing} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="planner-page sketchbook-border"
        style={{
          ...leftPageStyle,
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '12px', marginBottom: 0 }}>
          <AgendaBadge isMobile={isMobile} label={t.agenda} largeText={largeText} />
          <YearSticker isMobile={isMobile} largeText={largeText} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: '6px', justifyItems: 'center', width: '100%', paddingTop: desktopTitlePaddingTop }}>
            <h1
              data-planner-title="1"
              style={{
                margin: 0,
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: desktopTitleSize,
                lineHeight: 0.9,
                fontWeight: '400',
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              {seriesTitleParts.length > 1 ? (
                <>
                  <span style={{ color: '#4ea4ff' }}>{seriesTitleParts[0]}</span>
                  <span style={{ color: '#8d9db8' }}>&amp;</span>
                  <br />
                  <span style={{ color: '#ff5ca8' }}>{seriesTitleParts[1]}</span>
                </>
              ) : (
                <span style={{ color: '#4ea4ff' }}>{seriesTitle}</span>
              )}
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 'auto', paddingTop: desktopQuotePaddingTop }}>
            <QuoteCard quote={randomQuote} isMobile={isMobile} largeText={largeText} readableSpacing={readableSpacing} />
          </div>
        </div>
      </div>

      <div className="spiral-binding-center" style={{ zIndex: 20 }} />

      <div
        className="planner-page sketchbook-border"
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
          <NoteRibbon text={t.breakLong} isMobile={isMobile} largeText={largeText} />

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: desktopReleasePaddingTop }}>
            <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline largeText={largeText} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlannerPage;

