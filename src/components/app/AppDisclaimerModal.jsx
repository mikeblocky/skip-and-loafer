import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

const AppDisclaimerModal = ({ showDisclaimer, onClose }) => {
  return (
    <AnimatePresence>
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--paper-white)',
              padding: '24px', borderRadius: '16px',
              border: '3px solid var(--line-blue)',
              boxShadow: '8px 8px 0 rgba(0,0,0,0.1)',
              maxWidth: '450px', width: '100%',
              position: 'relative', textAlign: 'center'
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close disclaimer"
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <Heart size={32} style={{ color: 'var(--pop-pink)', margin: '0 auto 12px auto' }} />

            <h2 style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#374151', fontSize: '1.4rem', marginBottom: '12px', marginTop: 0, fontWeight: 'normal' }}>
              Fan-made website
            </h2>

            <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px' }}>
              This is a fan-made website and is not intended to promote any translation! Please support the official translation by purchasing volumes in your local country if available, or buy Japanese volumes and chapters on Comic DAYS.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              aria-label="Confirm disclaimer"
              style={{
                background: 'var(--pop-yellow)', border: '2px solid #eab308',
                color: '#854d0e', padding: '8px 24px', borderRadius: '9999px',
                fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              I understand
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppDisclaimerModal;
