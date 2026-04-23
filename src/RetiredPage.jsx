import { useEffect, useState } from 'react';
import './index.css';

const UI_TEXT = {
  en: {
    note: 'This website has been retired and is no longer active.',
    sub: 'Thank you for all the love for Skip and Loafer. ♡',
  },
  ja: {
    note: 'このウェブサイトは閉鎖され、現在アクティブではありません。',
    sub: '「スキップとローファー」への愛をありがとうございました。♡',
  },
  fr: {
    note: 'Ce site web a été retiré et n\'est plus actif.',
    sub: 'Merci pour tout l\'amour pour Skip and Loafer. ♡',
  },
  de: {
    note: 'Diese Website wurde eingestellt und ist nicht mehr aktiv.',
    sub: 'Danke für all die Liebe zu Skip and Loafer. ♡',
  },
  es: {
    note: 'Este sitio web ha sido retirado y ya no está activo.',
    sub: 'Gracias por todo el amor por Skip and Loafer. ♡',
  },
  pt: {
    note: 'Este site foi encerrado e não está mais ativo.',
    sub: 'Obrigado por todo o amor por Skip and Loafer. ♡',
  },
  it: {
    note: 'Questo sito web è stato ritirato e non è più attivo.',
    sub: 'Grazie per tutto l\'amore per Skip and Loafer. ♡',
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
