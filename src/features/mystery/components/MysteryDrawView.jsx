import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { CHARACTER_COLORS } from '../../../data/characters';
import { FALLBACK_COLORS } from '../../chat/chatPalette';
import { getCharacterPrediction } from '../mysteryData';
import { toMysteryLabelCase } from '../quizGame/ui';

const getMysteryPalette = (pulledCharacter) => {
  if (!pulledCharacter) {
    return { bg: '#fff', border: '#ccc', text: '#333' };
  }

  const mappedKey = Object.keys(CHARACTER_COLORS).find(
    (key) => key.includes(pulledCharacter.name) || pulledCharacter.name.includes(key.split(' ')[0]),
  );

  if (mappedKey && CHARACTER_COLORS[mappedKey]) {
    return CHARACTER_COLORS[mappedKey];
  }

  return FALLBACK_COLORS[pulledCharacter.name.length % FALLBACK_COLORS.length];
};

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];
    setParticles(Array.from({ length: 45 }).map((_, index) => ({
      id: index,
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500 - 150,
      rotation: Math.random() * 720,
      scale: Math.random() * 1 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.15,
    })));
  }, []);

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: particle.x, y: particle.y, opacity: 0, scale: particle.scale, rotate: particle.rotation }}
          transition={{ duration: 1.2 + Math.random(), delay: particle.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '3px',
          }}
        />
      ))}
    </div>
  );
};

const MysteryDrawView = ({ isMobile, t, pulledCharacter, isOpening, onDraw, onDrawAgain }) => {
  const colors = getMysteryPalette(pulledCharacter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {!pulledCharacter && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            zIndex: 10,
            marginTop: isMobile ? '12px' : '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontSize: isMobile ? '2rem' : '2.6rem',
                color: '#db2777',
                margin: 0,
                transform: 'rotate(-1.5deg)',
              }}
            >
              {toMysteryLabelCase(t.mystery.mysteryPick)}
            </h2>
            <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#6b7280', marginTop: '8px' }}>
              {t.mystery.drawADay}
            </p>
          </div>

          <motion.button
            className="sketchbook-border paper-interact"
            onClick={onDraw}
            whileHover={isOpening ? {} : {
              scale: [1, 1.05, 1.02, 1.06, 1],
              rotate: [-2, 3, -1, 2, -2],
              transition: { duration: 0.5, ease: 'steps(4, end)', repeat: Infinity },
            }}
            whileTap={isOpening ? {} : { scale: 0.9, rotate: -5 }}
            animate={isOpening ? {
              scale: [1, 0.9, 0.8, 1.2, 0.7, 1.4, 0.6, 2.0, 0],
              rotate: [0, -10, 15, -25, 35, -50, 70, -180, 540],
              x: [0, -15, 20, -30, 25, -40, 50, 0, 0],
              y: [0, 10, -10, 15, -15, 20, 10, -50, 0],
              opacity: [1, 1, 1, 1, 1, 1, 1, 1, 0],
            } : {}}
            transition={{ duration: isOpening ? 2.2 : 0.2, ease: 'steps(8, end)' }}
            style={{
              background: '#fefce8',
              border: '2px solid #eab30880',
              borderBottom: '4.5px solid #eab308',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              color: '#ca8a04',
              width: isMobile ? '160px' : '200px',
              height: isMobile ? '160px' : '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(234, 179, 8, 0.25)',
              position: 'relative',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <Gift size={isMobile ? 60 : 80} strokeWidth={2.5} />
            <span style={{ fontSize: '1.25rem' }}>{toMysteryLabelCase(t.mystery.drawBtn)}</span>
          </motion.button>
        </motion.div>
      )}

      {isOpening && <Confetti />}

      <AnimatePresence>
        {pulledCharacter && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            style={{
              width: '100%',
              maxWidth: '850px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: isMobile ? '14px' : '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '24px' : '40px',
                alignItems: isMobile ? 'center' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: isMobile ? '100%' : '260px',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1.5, y: -4 }}
                  style={{
                    background: colors.bg,
                    border: `3.5px solid ${colors.border}`,
                    borderRadius: '24px',
                    borderBottomWidth: '11.5px',
                    padding: '16px',
                    boxShadow: `0 12px 32px ${colors.border}35`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    position: 'relative',
                    transform: 'rotate(-1.5deg)',
                    width: isMobile ? '200px' : '100%',
                  }}
                  className="paper-interact"
                >
                  <img
                    src={pulledCharacter.src}
                    alt={pulledCharacter.name}
                    style={{
                      width: '100%',
                      height: isMobile ? '180px' : '260px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.2))',
                    }}
                    draggable="false"
                  />
                  <div
                    style={{
                      fontSize: isMobile ? '1.4rem' : '1.75rem',
                      color: colors.text,
                      background: 'white',
                      padding: '4px 20px',
                      borderRadius: '99px',
                      border: `3.5px solid ${colors.border}`,
                      boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
                      transform: 'rotate(1deg)',
                    }}
                  >
                    {pulledCharacter.name}
                  </div>
                </motion.div>
              </div>

              <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: colors.text, textAlign: isMobile ? 'center' : 'left', width: '100%' }}>
                  {toMysteryLabelCase(t.mystery.dailyCheck)}
                </h3>
                <div
                  className="sketchbook-border"
                  style={{
                    background: colors.bg,
                    padding: isMobile ? '24px' : '28px',
                    borderRadius: '24px',
                    border: `3.5px solid ${colors.border}`,
                    borderBottom: `9.5px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: isMobile ? '1.15rem' : '1.35rem',
                    textAlign: isMobile ? 'center' : 'left',
                    lineHeight: 1.6,
                    boxShadow: `0 8px 24px ${colors.border}25`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <p style={{ margin: 0 }}>{getCharacterPrediction(pulledCharacter.name, t)}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap: '12px' }}>
                  <motion.button
                    onClick={onDrawAgain}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="sketchbook-border paper-interact"
                    style={{
                      background: 'white',
                      color: '#4b5563',
                      border: '2.5px solid #e5e7eb',
                      borderBottom: '5px solid #d1d5db',
                      padding: '12px 28px',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      borderRadius: '16px',
                    }}
                  >
                    {toMysteryLabelCase(t.mystery.drawAgain)}
                  </motion.button>
                </div>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: '30px', textAlign: 'center', width: '100%' }}
            >
              {t.mystery.disclaimer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MysteryDrawView;
