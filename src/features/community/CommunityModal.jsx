import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COMMUNITY_FONT_FAMILY, COMMUNITY_PANEL_STYLE } from './communityTheme';

const modalRoot = () => (typeof document !== 'undefined' ? document.body : null);

export const CommunityModal = ({
  open,
  onClose,
  icon: Icon,
  title,
  accentColor = '#2563eb',
  accentBottom = accentColor,
  children,
  maxWidth = '560px',
}) => {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!modalRoot()) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2200,
            background: 'rgba(15, 23, 42, 0.46)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hide-scrollbar sketchbook-border"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              ...COMMUNITY_PANEL_STYLE,
              position: 'relative',
              width: '100%',
              maxWidth,
              maxHeight: 'min(86vh, 880px)',
              overflow: 'auto',
              padding: '24px 20px 20px',
              borderColor: accentColor,
              borderBottomColor: accentBottom,
              background: 'var(--surface-elevated, #fffefc)',
              display: 'grid',
              gap: '16px',
            }}
          >
            {/* Elegant washi tape seal on the modal header */}
            <div
              className={`washi-tape washi-tape--${accentColor === '#f97316' ? 'yellow' : 'blue'}`}
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%) rotate(-1.5deg)',
                width: '90px',
                height: '24px',
                zIndex: 100,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '14px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  className="sketchbook-border"
                  style={{
                    width: '46px',
                    height: '46px',
                    border: `3px solid ${accentColor}`,
                    borderBottom: `8px solid ${accentBottom}`,
                    background: 'var(--surface-card, #ffffff)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor,
                    flexShrink: 0,
                  }}
                >
                  {Icon ? <Icon size={22} strokeWidth={2.4} /> : null}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: COMMUNITY_FONT_FAMILY,
                    fontSize: '1.45rem',
                    lineHeight: 1.05,
                    color: 'var(--text-primary, #1e293b)',
                    fontWeight: '400',
                  }}
                >
                  {title}
                </h2>
              </div>

              <button
                className="sketchbook-border app-tactile"
                type="button"
                onClick={() => onClose?.()}
                aria-label="Close dialog"
                style={{
                  width: '42px',
                  height: '42px',
                  border: '2.5px solid var(--surface-border, #cbd5e1)',
                  borderBottom: '6px solid var(--surface-border-strong, #94a3b8)',
                  background: 'var(--surface-card, #ffffff)',
                  color: 'var(--text-secondary, #475569)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={20} strokeWidth={2.6} />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    modalRoot(),
  );
};

export default CommunityModal;
