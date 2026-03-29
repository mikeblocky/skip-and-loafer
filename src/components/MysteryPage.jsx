import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, Package, Sparkles, UserCheck, ArrowLeft, PawPrint } from 'lucide-react';
import { CHARACTER_COLORS } from '../data/characters';
import { triggerHaptic } from '../utils/haptics';
import { UI_TEXT } from '../config/uiText';
import useIdlePreload from '../hooks/app/useIdlePreload';
import getAnimalQuizCopy from './mystery/animalQuiz/copy';
import {
  FALLBACK_COLORS,
  getCharacterPrediction,
  PORTRAIT_DATA,
} from './mystery/mysteryData';
import { toMysteryLabelCase } from './mystery/quizGame/ui';

const loadQuizGame = () => import('./mystery/QuizGame');
const loadAnimalQuizGame = () => import('./mystery/AnimalQuizGame');
const QuizGame = lazy(loadQuizGame);
const AnimalQuizGame = lazy(loadAnimalQuizGame);

const MysterySubviewFallback = ({ isMobile, label }) => (
  <div
    style={{
      width: '100%',
      minHeight: isMobile ? '320px' : '420px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: isMobile ? '1rem' : '1.1rem',
      textAlign: 'center',
      padding: '24px',
    }}
  >
    {label}
  </div>
);

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];
    const nextParticles = Array.from({ length: 45 }).map((_, index) => ({
      id: index,
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500 - 150,
      rotation: Math.random() * 720,
      scale: Math.random() * 1 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.15,
    }));

    setParticles(nextParticles);
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

const MysteryPage = ({ isMobile, uiLanguage }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const animalQuizCopy = getAnimalQuizCopy(uiLanguage, t);
  const [view, setView] = useState('menu');
  const [pulledCharacter, setPulledCharacter] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const mysteryPreloaders = useMemo(() => [loadQuizGame, loadAnimalQuizGame], []);

  useIdlePreload(mysteryPreloaders, view === 'menu', {
    delayMs: 260,
    staggerMs: 180,
    maxPreloadCount: isMobile ? 1 : 2,
  });

  const handlePull = () => {
    if (isOpening || pulledCharacter) {
      return;
    }

    triggerHaptic('success');
    setIsOpening(true);

    setTimeout(() => {
      const randomCharacter = PORTRAIT_DATA[Math.floor(Math.random() * PORTRAIT_DATA.length)];
      setPulledCharacter(randomCharacter);
    }, 2200);
  };

  const handleReset = () => {
    setPulledCharacter(null);
    setIsOpening(false);
  };

  const leaveSubView = () => {
    triggerHaptic('selection');
    handleReset();
    setView('menu');
  };

  const renderMenu = () => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '32px' : '48px',
        justifyContent: 'center',
        padding: isMobile ? '20px 0' : '40px 0',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', color: '#6b7280', margin: 0 }}>{t.mystery.subtitle}</p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '24px' : '32px',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <motion.button
          onClick={() => {
            triggerHaptic('selection');
            setView('gacha');
          }}
          whileHover={{ scale: 1.06, rotate: -2, y: -6 }}
          whileTap={{ scale: 0.9, y: 12 }}
          className="sketchbook-border paper-interact"
          style={{
            background: '#fdf2f8',
            border: '3.5px solid #f472b6',
            borderBottom: '9.5px solid #db2777',
            padding: isMobile ? '24px 20px' : '32px 48px',
            borderRadius: '28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: isMobile ? 'min(100%, 320px)' : '280px',
            boxShadow: '0 12px 32px rgba(219, 39, 119, 0.15)',
          }}
        >
          <Package size={isMobile ? 42 : 54} color="#db2777" strokeWidth={3.5} />
          <span style={{ fontSize: isMobile ? '1.45rem' : '1.65rem', color: '#9d174d' }}>
            {toMysteryLabelCase(t.mystery.characterDraw)}
          </span>
          <span style={{ color: '#db2777', fontSize: isMobile ? '1rem' : '1.1rem' }}>{t.mystery.characterDrawDesc}</span>
        </motion.button>

        <motion.button
          onClick={() => {
            triggerHaptic('selection');
            setView('quiz');
          }}
          whileHover={{ scale: 1.06, rotate: 2, y: -6 }}
          whileTap={{ scale: 0.9, y: 12 }}
          className="sketchbook-border paper-interact"
          style={{
            background: '#eff6ff',
            border: '3.5px solid #60a5fa',
            borderBottom: '9.5px solid #2563eb',
            padding: isMobile ? '24px 20px' : '32px 48px',
            borderRadius: '28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: isMobile ? 'min(100%, 320px)' : '280px',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.15)',
          }}
        >
          <UserCheck size={isMobile ? 42 : 54} color="#2563eb" strokeWidth={3.5} />
          <span style={{ fontSize: isMobile ? '1.45rem' : '1.65rem', color: '#1e40af' }}>
            {toMysteryLabelCase(t.mystery.whoAreYou)}
          </span>
          <span style={{ color: '#2563eb', fontSize: isMobile ? '1rem' : '1.1rem' }}>{t.mystery.whoAreYouDesc}</span>
        </motion.button>

        <motion.button
          onClick={() => {
            triggerHaptic('selection');
            setView('animalQuiz');
          }}
          whileHover={{ scale: 1.06, rotate: -1, y: -6 }}
          whileTap={{ scale: 0.9, y: 12 }}
          className="sketchbook-border paper-interact"
          style={{
            background: '#ecfdf5',
            border: '3.5px solid #34d399',
            borderBottom: '9.5px solid #059669',
            padding: isMobile ? '24px 20px' : '32px 48px',
            borderRadius: '28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: isMobile ? 'min(100%, 320px)' : '280px',
            boxShadow: '0 12px 32px rgba(5, 150, 105, 0.15)',
          }}
        >
          <PawPrint size={isMobile ? 42 : 54} color="#059669" strokeWidth={3.5} />
          <span style={{ fontSize: isMobile ? '1.45rem' : '1.65rem', color: '#047857' }}>
            {toMysteryLabelCase(animalQuizCopy.menuTitle)}
          </span>
          <span style={{ color: '#059669', fontSize: isMobile ? '1rem' : '1.1rem' }}>{animalQuizCopy.menuDescription}</span>
        </motion.button>
      </div>
    </div>
  );

  const renderDrawView = () => (
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
            <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#6b7280', marginTop: '8px' }}>{t.mystery.drawADay}</p>
          </div>

          <motion.button
            className="sketchbook-border paper-interact"
            onClick={handlePull}
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
        {pulledCharacter && (() => {
          let colors = { bg: '#fff', border: '#ccc', text: '#333' };
          const mappedKey = Object.keys(CHARACTER_COLORS).find(
            (key) => key.includes(pulledCharacter.name) || pulledCharacter.name.includes(key.split(' ')[0]),
          );

          if (mappedKey && CHARACTER_COLORS[mappedKey]) {
            colors = CHARACTER_COLORS[mappedKey];
          } else {
            colors = FALLBACK_COLORS[pulledCharacter.name.length % FALLBACK_COLORS.length];
          }

          return (
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
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: isMobile ? '100%' : '260px' }}>
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
                      onClick={() => {
                        triggerHaptic('selection');
                        handleReset();
                        setTimeout(() => handlePull(), 50);
                      }}
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
          );
        })()}
      </AnimatePresence>
    </div>
  );

  return (
    <div
      className="planner-container planner-page mystery-ui"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: isMobile ? 'auto' : '650px',
        padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '20px' : '32px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '16px',
          position: 'relative',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 24px',
            borderRadius: '24px',
            background: '#ffffff',
            border: '3.5px solid #db2777',
            borderBottom: '9.5px solid #db2777',
            boxShadow: '0 8px 18px rgba(219, 39, 119, 0.1)',
            zIndex: 1,
          }}
        >
          <Sparkles size={isMobile ? 22 : 20} strokeWidth={2.5} style={{ color: '#db2777' }} />
          <span style={{ color: '#db2777', fontSize: isMobile ? '1.45rem' : '1.35rem', lineHeight: 1 }}>
            {toMysteryLabelCase(t.mystery.title)}
          </span>
        </motion.div>

        {view !== 'menu' && (
          <div style={{ position: isMobile ? 'static' : 'absolute', left: isMobile ? 'auto' : '0' }}>
            <motion.button
              onClick={leaveSubView}
              whileHover={{ x: -2, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#ffffff',
                color: '#4b5563',
                border: '2.5px solid #e5e7eb',
                borderBottom: '5px solid #d1d5db',
                borderRadius: '16px',
                fontSize: isMobile ? '1.05rem' : '1.2rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              {toMysteryLabelCase(t.mystery.returnToMenu)}
            </motion.button>
          </div>
        )}
      </div>

      {view === 'menu' && renderMenu()}
      {view === 'gacha' && renderDrawView()}
      {view === 'quiz' && (
        <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading quiz...'} />}>
          <QuizGame
            isMobile={isMobile}
            portraitData={PORTRAIT_DATA}
            fallbackColors={FALLBACK_COLORS}
            t={t}
          />
        </Suspense>
      )}
      {view === 'animalQuiz' && (
        <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={animalQuizCopy.calculating || 'Loading animal quiz...'} />}>
          <AnimalQuizGame
            isMobile={isMobile}
            portraitData={PORTRAIT_DATA}
            t={t}
            uiLanguage={uiLanguage}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MysteryPage;




