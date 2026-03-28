import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Countdown from './Countdown';
import ReleaseNote from './ReleaseNote';
import { CHARACTER_COLORS } from '../data/characters';
import { QUOTES } from '../data/quotes';

const UI_TEXT = {
  en: { agenda: 'AGENDA', breakShort: 'On break in March, Chapter 79 will be released in April issue!', breakLong: 'On break in March! Chapter 79 will be released in April issue!' },
  es: { agenda: 'AGENDA', breakShort: 'Descanso en marzo: el Capitulo 79 llegara en la edicion de abril!', breakLong: 'Descanso en marzo! El Capitulo 79 llegara en la edicion de abril!' },
  pt: { agenda: 'AGENDA', breakShort: 'Pausa em marco: o Capitulo 79 sai na edicao de abril!', breakLong: 'Pausa em marco! O Capitulo 79 sai na edicao de abril!' },
  fr: { agenda: 'AGENDA', breakShort: 'Pause en mars : le chapitre 79 sortira dans l edition d avril !', breakLong: 'Pause en mars ! Le chapitre 79 sortira dans l edition d avril !' },
  de: { agenda: 'AGENDA', breakShort: 'Pause im Marz: Kapitel 79 erscheint in der April-Ausgabe!', breakLong: 'Pause im Marz! Kapitel 79 erscheint in der April-Ausgabe!' },
  it: { agenda: 'AGENDA', breakShort: 'Pausa a marzo: il capitolo 79 uscira nel numero di aprile!', breakLong: 'Pausa a marzo! Il capitolo 79 uscira nel numero di aprile!' },
};

const LOCALE_BY_UI_LANGUAGE = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
};

const AgendaBadge = ({ isMobile, label }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
    <Star size={isMobile ? 20 : 24} fill="#ffd54f" color="#ffd54f" strokeWidth={2.2} />
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        fontSize: isMobile ? '1.2rem' : '1.4rem',
        lineHeight: 1,
        fontWeight: '400',
        color: '#8a94a6',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </span>
    <Star size={isMobile ? 20 : 24} fill="#ffd54f" color="#ffd54f" strokeWidth={2.2} />
  </div>
);

const YearSticker = ({ isMobile }) => (
  <div
    className="sketchbook-border"
    style={{
      justifySelf: 'end',
      background: '#ffffff',
      border: '3px solid #d8e5f4',
      borderBottom: '7px solid #9eb7d3',
      borderRadius: '18px',
      padding: isMobile ? '10px 18px' : '12px 22px',
      color: '#c5d3e1',
      fontFamily: 'Sniglet, var(--font-main)',
      fontSize: isMobile ? '1.8rem' : '2.6rem',
      lineHeight: 1,
      fontWeight: '400',
      transform: 'rotate(-4deg)',
      boxShadow: '0 10px 18px rgba(148, 163, 184, 0.12)',
    }}
  >
    2026
  </div>
);

const QuoteCard = ({ quote, isMobile }) => {
  const palette = CHARACTER_COLORS[quote.author] || { border: '#facc15', text: '#8a6b00' };

  return (
    <motion.div
      className="sketchbook-border"
      initial={{ opacity: 0, y: 18, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.18 }}
      style={{
        width: '100%',
        maxWidth: isMobile ? '280px' : '380px',
        background: '#fff29f',
        border: '3px solid #facc15',
        borderBottom: '8px solid #eab308',
        borderRadius: '22px',
        padding: isMobile ? '14px 14px 12px' : '22px 22px 18px',
        boxShadow: '0 14px 26px rgba(234, 179, 8, 0.18)',
        display: 'grid',
        gap: isMobile ? '8px' : '12px',
        justifySelf: isMobile ? 'center' : 'start',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-main)',
          color: '#6b7280',
          fontSize: isMobile ? '0.95rem' : '1.1rem',
          lineHeight: isMobile ? 1.45 : 1.55,
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        "{quote.text}"
      </p>
      <p
        style={{
          margin: 0,
          textAlign: isMobile ? 'center' : 'right',
          fontFamily: 'Sniglet, var(--font-main)',
          color: palette.text,
          fontSize: isMobile ? '0.92rem' : '1.08rem',
          lineHeight: 1.2,
          fontWeight: '400',
        }}
      >
        - {quote.author}
      </p>
    </motion.div>
  );
};

const NoteRibbon = ({ text, isMobile }) => (
  <motion.div
    className="sketchbook-border paper-interact"
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 18 }}
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '760px',
        background: '#ffffff',
        border: '3px solid #dbeafe',
        borderBottom: '7px solid #93c5fd',
        borderRadius: '16px',
        padding: isMobile ? '14px 14px' : '16px 20px',
        display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: isMobile ? '10px' : '14px',
      boxShadow: '0 10px 18px rgba(96, 165, 250, 0.12)',
    }}
  >
    <span style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', borderRadius: '999px', background: '#ffd54f', border: '2px solid #f59e0b' }} />
    <span
      style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: '#5f6f86',
        fontSize: isMobile ? '0.96rem' : '1.15rem',
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

const DateBadge = ({ dateLabel, timezoneLabel, isMobile }) => (
  <div
    className="sketchbook-border"
    style={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
      background: '#e0f2fe',
      border: '3px solid #7dd3fc',
      borderBottom: '8px solid #38bdf8',
      borderRadius: '18px',
      padding: isMobile ? '10px 14px' : '12px 18px',
      boxShadow: '0 12px 18px rgba(56, 189, 248, 0.16)',
      textAlign: 'center',
    }}
  >
    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#475569', fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.3, fontWeight: '400' }}>
      {dateLabel}
    </span>
    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#475569', fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.3, fontWeight: '400' }}>
      ({timezoneLabel})
    </span>
  </div>
);

const PlannerPage = ({ isMobile, uiLanguage = 'en' }) => {
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';

  const targetDate = new Date('2026-04-24T00:00:00+09:00');
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

  const pageStyle = {
    padding: isMobile ? '22px 18px 24px' : '50px 48px 42px',
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
        padding: '50px 36px 42px 38px',
      };
  const rightPageStyle = isMobile
    ? pageStyle
    : {
        ...pageStyle,
        padding: '50px 46px 42px 34px',
      };

  if (isMobile) {
    return (
      <div className="planner-page sketchbook-border" style={{ ...pageStyle, gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '10px' }}>
          <AgendaBadge isMobile={isMobile} label={t.agenda} />
          <YearSticker isMobile={isMobile} />
        </div>

        <div style={{ display: 'grid', gap: '14px', justifyItems: 'center', width: '100%' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '3.45rem',
              lineHeight: 0.96,
              fontWeight: '400',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <span style={{ color: '#64b5ff' }}>Skip </span>
            <span style={{ color: '#9ea9bb' }}>&amp;</span>
            <br />
            <span style={{ color: '#ff77b7' }}>Loafer</span>
          </h1>

          <QuoteCard quote={randomQuote} isMobile={isMobile} />
        </div>

        <NoteRibbon text={t.breakShort} isMobile={isMobile} />

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Countdown isMobile={isMobile} uiLanguage={uiLanguage} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DateBadge dateLabel={localDateString} timezoneLabel={timezoneLabel} isMobile={isMobile} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
          <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline />
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '14px', marginBottom: '28px' }}>
          <AgendaBadge isMobile={isMobile} label={t.agenda} />
          <YearSticker isMobile={isMobile} />
        </div>

        <div style={{ display: 'grid', gap: '30px', height: '100%', justifyItems: 'start' }}>
          <div style={{ display: 'grid', gap: '10px', justifyItems: 'start', width: '100%' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '5.6rem',
                lineHeight: 0.98,
                fontWeight: '400',
                textAlign: 'left',
              }}
            >
              <span style={{ color: '#64b5ff' }}>Skip </span>
              <span style={{ color: '#9ea9bb' }}>&amp;</span>
              <br />
              <span style={{ color: '#ff77b7' }}>Loafer</span>
            </h1>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <QuoteCard quote={randomQuote} isMobile={isMobile} />
          </div>
        </div>
      </div>

      <div className="spiral-binding-center" style={{ zIndex: 20 }} />

      <div
        className="planner-page sketchbook-border"
        style={{
          ...rightPageStyle,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: '100%', display: 'grid', gap: '30px', justifyItems: 'center' }}>
          <NoteRibbon
            text={t.breakLong}
            isMobile={isMobile}
          />

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Countdown isMobile={isMobile} uiLanguage={uiLanguage} />
          </div>

          <DateBadge dateLabel={localDateString} timezoneLabel={timezoneLabel} isMobile={isMobile} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '26px' }}>
          <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline />
        </div>
      </div>
    </>
  );
};

export default PlannerPage;

