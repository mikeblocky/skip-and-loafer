import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { ENTER_SPRING_BOUNCY, JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from './animationPresets';
import { PAPER_MODAL_STYLE, PAPER_FONT_FAMILY } from './paper/paperTheme';

const STORAGE_KEY = 'skip_retirement_popup_seen';

const UI_TEXT = {
  en: {
    title: 'Website Update',
    subtitle: 'I am moving to a new home!',
    message: 'This Skip and Loafer fan website is currently in the process of moving to a new hosting provider and domain.',
    thankYou: 'The exact timeline for the move is still being finalized. I truly appreciate your patience and all the love you\'ve shown for this project!',
    closing: 'Stay tuned for updates, and thank you for being part of this journey.',
    button: 'Got it!',
  },
  ja: {
    title: 'ウェブサイト移転のお知らせ',
    subtitle: '新しいホームへ移動します！',
    message: 'この「スキップとローファー」ファンサイトは、現在新しいホスティングプロバイダーとドメインへの移転作業を行っています。',
    thankYou: '移転の完了時期は未定ですが、皆さまの忍耐とこれまでの応援に心から感謝いたします。',
    closing: '今後のアップデートをお楽しみに。引き続きよろしくお願いいたします！',
    button: '閉じる',
  },
  fr: {
    title: 'Mise à jour du site',
    subtitle: 'Je déménage vers une nouvelle maison !',
    message: 'Ce site de fan de Skip and Loafer est en cours de déménagement vers un nouvel hébergeur et un nouveau domaine.',
    thankYou: 'Le calendrier exact du déménagement est encore en cours de finalisation. J\'apprécie vraiment votre patience et tout l\'amour que vous avez montré pour ce projet !',
    closing: 'Restez à l\'écoute pour les mises à jour, et merci de faire partie de ce voyage.',
    button: 'Compris !',
  },
  de: {
    title: 'Website-Update',
    subtitle: 'Ich ziehe in ein neues Zuhause um!',
    message: 'Diese Skip and Loafer Fan-Website zieht derzeit zu einem neuen Hosting-Anbieter und einer neuen Domain um.',
    thankYou: 'Der genaue Zeitplan für den Umzug wird noch festgelegt. Ich schätze Ihre Geduld und die Liebe, die Sie diesem Projekt entgegengebracht haben, sehr!',
    closing: 'Bleiben Sie dran für Updates und danke, dass Sie Teil dieser Reise sind.',
    button: 'Verstanden!',
  },
  es: {
    title: 'Actualización del sitio web',
    subtitle: '¡Me mudo a un nuevo hogar!',
    message: 'Este sitio web de fans de Skip and Loafer está en proceso de mudarse a un nuevo proveedor de hosting y dominio.',
    thankYou: 'El cronograma exacto para la mudanza aún se está finalizando. ¡Agradezco sinceramente su paciencia y todo el amor que han mostrado por este proyecto!',
    closing: 'Estén atentos a las actualizaciones y gracias por ser parte de este viaje.',
    button: '¡Entendido!',
  },
  pt: {
    title: 'Atualização do site',
    subtitle: 'Estou me mudando para uma nova casa!',
    message: 'Este site de fãs de Skip and Loafer está em processo de mudança para um novo provedor de hospedagem e domínio.',
    thankYou: 'O cronograma exato para a mudança ainda está sendo finalizado. Agradeço de coração a sua paciência e todo o amor que você demonstrou por este projeto!',
    closing: 'Fique atento às atualizações e obrigado por fazer parte desta jornada.',
    button: 'Entendi!',
  },
  it: {
    title: 'Aggiornamento del sito web',
    subtitle: 'Mi sto trasferendo in una nuova casa!',
    message: 'Questo sito fan di Skip and Loafer è in fase di trasferimento verso un nuovo fornitore di hosting e dominio.',
    thankYou: 'La tempistica esatta per il trasferimento è ancora in fase di definizione. Apprezzo davvero la vostra pazienza e tutto l\'amore che avete dimostrato per questo progetto!',
    closing: 'Rimanete sintonizzati per aggiornamenti e grazie per aver fatto parte di questo viaggio.',
    button: 'Capito!',
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
