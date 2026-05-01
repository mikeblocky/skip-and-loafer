import { useEffect, useState } from 'react';
import './index.css';

const UI_TEXT = {
  en: {
    note: 'This website is currently moving to a new home.',
    sub: 'Thank you for your patience and all the love for Skip and Loafer. ♡',
  },
  ja: {
    note: 'このウェブサイトは現在、新しい場所へ移転準備中です。',
    sub: 'しばらくお待ちください。「スキップとローファー」への愛をありがとうございました。♡',
  },
  fr: {
    note: 'Ce site web est actuellement en train de déménager vers un nouvel hébergeur.',
    sub: 'J\'espère vous revoir bientôt dans ma nouvelle maison. ♡',
  },
  de: {
    note: 'Diese Website zieht derzeit zu einem neuen Hosting-Anbieter um.',
    sub: 'Ich hoffe, Sie bald in meinem neuen Zuhause wiederzusehen. ♡',
  },
  es: {
    note: 'Este sitio web se está mudando actualmente a un nuevo proveedor de hosting.',
    sub: 'Espero volver a verte pronto en mi nuevo hogar. ♡',
  },
  pt: {
    note: 'Este site está atualmente mudando para um novo provedor de hospedagem.',
    sub: 'Espero ver você novamente em breve na minha nova casa. ♡',
  },
  it: {
    note: 'Questo sito web si sta attualmente trasferendo presso un nuovo fornitore di hosting.',
    sub: 'Spero di rivederti presto nella mia nuova casa. ♡',
  },
};

const getLanguage = () => {
  try {
    const stored = localStorage.getItem('skip_ui_language');
    if (stored && UI_TEXT[stored]) return stored;
  } catch { /* ignore */ }
  const browserLang = navigator.language?.slice(0, 2);
  return UI_TEXT[browserLang] ? browserLang : 'en';
};

const RetiredPage = () => {
  const [lang] = useState(getLanguage);
  const t = UI_TEXT[lang];

  useEffect(() => {
    document.title = 'skip-and-loafer';
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-hand)',
        color: '#9ca3af',
        fontSize: '1.05rem',
        textAlign: 'center',
        lineHeight: 1.7,
        margin: 0,
      }}>
        {t.note}
        <br />
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{t.sub}</span>
      </p>
    </div>
  );
};

export default RetiredPage;
