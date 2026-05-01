import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { ENTER_SPRING_BOUNCY, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from './animationPresets';
import { PAPER_MODAL_STYLE, PAPER_FONT_FAMILY } from './paper/paperTheme';

const STORAGE_KEY = 'skip_retirement_popup_seen';

const UI_TEXT = {
  en: {
    title: 'Thank you & farewell',
    subtitle: 'This website will be retiring soon.',
    message: 'After May 25th, 2026, this fan-made Skip and Loafer website will be shutting down permanently.',
    thankYou: 'Thank you so much for all of your support, visits, and love for Skip and Loafer. It has been an incredible journey sharing this wonderful website with all of you!',
    closing: 'Please continue to support the official release by Takamatsu Misaki and KODANSHA via official channels.',
    button: 'Close',
  },
  ja: {
    title: 'ありがとう＆さよなら',
    subtitle: 'このウェブサイトは閉鎖されます',
    message: '2026年5月25日をもって、このファンメイドの「スキップとローファー」ウェブサイトは閉鎖されます。',
    thankYou: '皆さまのご支援、ご訪問、そして「スキップとローファー」への愛に心から感謝いたします。皆さまとこの素晴らしい作品を共有できたことは、かけがえのない体験でした！',
    closing: '引き続き高松美咲先生と講談社の公式リリースを応援してください。',
    button: '閉じる',
  },
  fr: {
    title: 'Merci & Au Revoir',
    subtitle: 'Ce site web prendra sa retraite',
    message: 'Après le 25 mai 2026, ce site fan de Skip and Loafer fermera définitivement.',
    thankYou: 'Merci infiniment pour tout votre soutien, vos visites et votre amour pour Skip and Loafer. Ce fut un voyage incroyable de partager cette merveilleuse série avec vous tous !',
    closing: 'Veuillez continuer à soutenir la publication officielle de Takamatsu Misaki et KODANSHA.',
    button: 'Fermer',
  },
  de: {
    title: 'Danke & Auf Wiedersehen',
    subtitle: 'Diese Website wird eingestellt',
    message: 'Nach dem 25. Mai 2026 wird diese Fan-Website zu Skip and Loafer dauerhaft geschlossen.',
    thankYou: 'Vielen Dank für eure Unterstützung, eure Besuche und eure Liebe zu Skip and Loafer. Es war eine unglaubliche Reise, diese wunderbare Serie mit euch allen zu teilen!',
    closing: 'Bitte unterstützt weiterhin die offizielle Veröffentlichung von Takamatsu Misaki und KODANSHA.',
    button: 'Schließen',
  },
  es: {
    title: 'Gracias y Adiós',
    subtitle: 'Este sitio web se retirará',
    message: 'Después del 25 de mayo de 2026, este sitio web de fans de Skip and Loafer cerrará permanentemente.',
    thankYou: '¡Muchas gracias por todo su apoyo, visitas y amor por Skip and Loafer. Ha sido un viaje increíble compartir esta maravillosa serie con todos ustedes!',
    closing: 'Por favor, sigan apoyando la publicación oficial de Takamatsu Misaki y KODANSHA.',
    button: 'Cerrar',
  },
  pt: {
    title: 'Obrigado & Adeus',
    subtitle: 'Este site será encerrado',
    message: 'Após 25 de maio de 2026, este site de fãs de Skip and Loafer será encerrado permanentemente.',
    thankYou: 'Muito obrigado por todo o apoio, visitas e amor por Skip and Loafer. Foi uma jornada incrível compartilhar esta maravilhosa série com todos vocês!',
    closing: 'Por favor, continuem apoiando o lançamento oficial de Takamatsu Misaki e KODANSHA.',
    button: 'Fechar',
  },
  it: {
    title: 'Grazie e Addio',
    subtitle: 'Questo sito web verrà chiuso',
    message: 'Dopo il 25 maggio 2026, questo sito fan di Skip and Loafer chiuderà definitivamente.',
    thankYou: 'Grazie di cuore per tutto il vostro supporto, le vostre visite e il vostro amore per Skip and Loafer. È stato un viaggio incredibile condividere questa meravigliosa serie con tutti voi!',
    closing: 'Per favore, continuate a supportare la pubblicazione ufficiale di Takamatsu Misaki e KODANSHA.',
    button: 'Chiudi',
  },
};

const RetirementPopup = ({ isMobile, uiLanguage = 'en' }) => {
  const [show, setShow] = useState(false);
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Small delay so it doesn't clash with other popups
        const timer = setTimeout(() => {
          setShow(true);
          sessionStorage.setItem(STORAGE_KEY, '1');
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const handleClose = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 10001,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, rotate: -1 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={ENTER_SPRING_BOUNCY}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...PAPER_MODAL_STYLE,
              padding: isMobile ? '24px 18px' : '32px 32px',
              borderRadius: '20px',
              borderColor: '#f9a8d4',
              borderBottomColor: '#f472b6',
              maxWidth: '480px', width: '100%',
              position: 'relative',
              maxHeight: '85vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
            className="hide-scrollbar"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close announcement"
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '4px', borderRadius: '50%',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7280'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
            >
              <X size={20} />
            </button>

            {/* Decorative heart */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart size={28} style={{ color: '#f472b6', fill: '#f472b6' }} />
              </motion.div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: PAPER_FONT_FAMILY,
              color: '#be185d',
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              margin: '0 0 4px 0',
              fontWeight: 'normal',
              textAlign: 'center',
            }}>
              {t.title}
            </h2>

            <p style={{
              fontFamily: 'var(--font-hand)',
              color: '#9ca3af',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              textAlign: 'center',
              margin: '0 0 16px 0',
            }}>
              {t.subtitle}
            </p>

            {/* Message body */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '12px',
              marginBottom: '20px',
              padding: isMobile ? '12px' : '16px',
              background: '#fafafa',
              borderRadius: '12px',
              border: '1px solid #f3e8ff',
            }}>
              <p style={{
                fontFamily: 'var(--font-hand)',
                color: '#374151',
                fontSize: isMobile ? '0.88rem' : '0.95rem',
                lineHeight: 1.55,
                margin: 0,
              }}>
                {t.message}
              </p>

              <p style={{
                fontFamily: 'var(--font-hand)',
                color: '#6b7280',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                lineHeight: 1.55,
                margin: 0,
                fontStyle: 'italic',
              }}>
                {t.thankYou}
              </p>

              <p style={{
                fontFamily: 'var(--font-hand)',
                color: '#6b7280',
                fontSize: isMobile ? '0.78rem' : '0.82rem',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {t.closing}
              </p>
            </div>

            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.button
                className="app-tactile"
                whileHover={{ ...JELLY_HOVER, transition: { type: 'spring', stiffness: 400, damping: 12 } }}
                whileTap={{ ...JELLY_TAP, transition: SQUASH_TRANSITION }}
                onClick={handleClose}
                style={{
                  background: 'var(--pop-blue)',
                  border: '2px solid #60a5fa',
                  color: '#fff',
                  padding: isMobile ? '10px 24px' : '10px 32px',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-hand)',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {t.button}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RetirementPopup;
