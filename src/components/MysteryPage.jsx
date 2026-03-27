import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ArrowLeft, Package, UserCheck } from 'lucide-react';
import { CHARACTER_COLORS } from '../data/characters';
import { triggerHaptic } from '../utils/haptics';
import { UI_TEXT } from '../config/uiText';
import QuizGame from './mystery/QuizGame';

const PORTRAIT_DATA = [
  { name: 'Fumi', src: '/portrait/fumi.png', prediction: 'You\'ll find yourself being a remarkably great listener for someone today. They might come to you with a problem, and your steady, grounded presence will help them tremendously!' },
  { name: 'Kazakami', src: '/portrait/kazakami.png', prediction: 'A beautifully calm day perfect for discovering something incredibly silly but deeply fun. Don\'t stress the small details, just peacefully glide through your schedule!' },
  { name: 'Yamada', src: '/portrait/yamada.png', prediction: 'You might enthusiastically learn something surprisingly useful today. Your cheerful energy is high right now, making it the perfect time to break the ice with a stranger!' },
  { name: 'Makoto', src: '/portrait/makoto.png', prediction: 'A wonderfully quiet, gentle day where incredibly small details bring you massive joy. Take a comfortable step back and find profound peace in a nice, quiet corner.' },
  { name: 'Mika', src: '/portrait/mika.png', prediction: 'Your outfit will absolutely be totally on point today, massively boosting your inner confidence! Use that fierce energy to aggressively conquer your entire to-do list.' },
  { name: 'Mitsumi', src: '/portrait/mitsumi.png', prediction: 'An energetic day full of completely wild, unplanned detours that somehow magically lead to very good things! Embrace the absolute chaos with pure enthusiastic sincerity.' },
  { name: 'Nao', src: '/portrait/nao.png', prediction: 'You will likely become someone\'s calm center today. A friend may come to you overwhelmed, and your steady perspective will help them separate feelings from facts. Your mix of grace, honesty, and clear boundaries can turn a tense moment into real progress.' },
  { name: 'Kanechika', src: '/portrait/kanechika.png', prediction: 'A slightly chaotic, incredibly clumsy start, but one entirely redeemed by a wildly creative afternoon. Follow your blazing, uncompromising passion exactly where it logically leads you.' },
  { name: 'Omiso', src: '/portrait/omiso.webp', prediction: 'A remarkably pure day filled with endlessly cozy naps and exceptionally warm sunbeams. Focus absolutely completely on treating yourself very well and ignoring complex human dread.' },
  { name: 'Oshio', src: '/portrait/oshio.webp', prediction: 'Your vastly quiet, intense observation skills will come in tremendously handy today. Watch the unfolding drama peacefully from the sidelines and successfully solve a tricky mystery.' },
  { name: 'Satonosuke', src: '/portrait/satonosuke.png', prediction: 'You\'ll easily bring loud, completely unconditional joy to absolutely someone you meet today. Actively vibrate with pure chaotic positive energy and entirely ignore all rigid rules!' },
  { name: 'Shima', src: '/portrait/shima.png', prediction: 'A completely breezy, delightfully effortless day where complex things just naturally fall into perfect place. Read the room expertly, but make totally sure you boldly prioritize your own ultimate happiness too.' },
  { name: 'Takemine', src: '/portrait/tokiko.png', prediction: 'You\'ll brutally tackle your huge tasks with highly impressive, rigorous efficiency today. Maintain your flawless structure, but don\'t be afraid to comfortably lean on your friends for critical support!' },
  { name: 'Mukai', src: '/portrait/mukai.png', prediction: 'A surprisingly massively tiring but incredibly rewarding and very fulfilling day perfectly awaits you. Conserve your precious low battery efficiently so you can dramatically show up when you are genuinely needed.' },
  { name: 'Yuzuki', src: '/portrait/yuzuki.png', prediction: 'You\'ll remarkably naturally draw great people towards your brilliantly bright, easygoing energy today. Effortlessly ignore any fake superficial drama and only fiercely focus on your genuine, loyal bonds.' },
  { name: 'Chris', src: '/portrait/chris.png', prediction: 'Your incredibly attentive listening will greatly help a deeply troubled friend today. Quietly smooth over the group conflict, but please actively remember that your own feelings are completely valid too!' },
  { name: 'Ririka', src: '/portrait/rirka.webp', prediction: 'A spectacular day to finally let your exceptionally true, brutally unfiltered self beautifully shine without intense fear. Lower those intimidating, fierce protective walls and remarkably enjoy the genuine warmth.' },
  { name: 'Ujiie', src: '/portrait/ujie.png', prediction: 'Radical overthinking might annoyingly slow you down drastically, but your careful, highly cynical analysis will ultimately pay off. Drop the heavy intellectual fortress logically and sincerely accept being wonderfully included!' }
];

const FALLBACK_COLORS = [
  { bg: "#ffe4ec", border: "#f472b6", text: "#9d174d" },
  { bg: "#e0f2fe", border: "#38bdf8", text: "#075985" },
  { bg: "#fff1d6", border: "#fbbf24", text: "#92400e" },
  { bg: "#dcfce7", border: "#34d399", text: "#065f46" },
  { bg: "#f1edff", border: "#a78bfa", text: "#5b21b6" },
  { bg: "#ffedd5", border: "#f97316", text: "#9a3412" },
  { bg: "#fce7f3", border: "#db2777", text: "#831843" }
];

const Confetti = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500 - 150,
      rotation: Math.random() * 720,
      scale: Math.random() * 1 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.15
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotation }}
          transition={{ duration: 1.2 + Math.random() * 1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: 'absolute', width: '14px', height: '14px',
            backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '3px',
          }}
        />
      ))}
    </div>
  );
};

const MysteryPage = ({ isMobile, uiLanguage }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const [view, setView] = useState('menu'); // 'menu', 'gacha', 'quiz'
  const [pulledCharacter, setPulledCharacter] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  const handlePull = () => {
    if (isOpening || pulledCharacter) return;
    triggerHaptic('success');
    setIsOpening(true);
    
    // Very complex unboxing animation duration ~2.2s
    setTimeout(() => {
      const randomChar = PORTRAIT_DATA[Math.floor(Math.random() * PORTRAIT_DATA.length)];
      setPulledCharacter(randomChar);
    }, 2200);
  };

  const handleReset = () => {
    setPulledCharacter(null);
    setIsOpening(false);
  };

  if (view === 'quiz') {
    return <QuizGame isMobile={isMobile} portraitData={PORTRAIT_DATA} fallbackColors={FALLBACK_COLORS} onBack={() => setView('menu')} t={t} />;
  }

  if (view === 'menu') {
    return (
      <div className="planner-container planner-page" style={{ 
        minHeight: isMobile ? 'min-content' : '650px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: isMobile ? '30px 16px 20px' : '40px', 
        position: 'relative', 
        overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '2.4rem' : '3.2rem', color: '#db2777', margin: 0, transform: 'rotate(-2deg)' }}>{t.mysteryCabinTitle || 'Mystery Cabin'}</h2>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.1rem' : '1.4rem', color: '#6b7280', marginTop: isMobile ? '4px' : '12px' }}>{t.mysteryCabinSubtitle || 'Choose your daily activity!'}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '20px' : '30px', alignItems: 'center' }}>
          <motion.button
            onClick={() => { triggerHaptic('selection'); setView('gacha'); }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="sketchbook-border paper-interact"
            style={{
              background: '#fefce8',
              border: '2px solid #fde047',
              borderBottom: '5px solid #eab308',
              padding: isMobile ? '20px' : '30px 40px',
              borderRadius: '15px 255px 15px 255px/255px 15px 225px 15px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              width: isMobile ? '220px' : '240px'
            }}
          >
            <Package size={isMobile ? 36 : 48} color="#eab308" />
            <span style={{ fontFamily: 'Sniglet', fontSize: isMobile ? '1.2rem' : '1.4rem', color: '#854d0e' }}>{t.characterDraw || 'Character draw'}</span>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#a16207', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t.characterDrawDesc || 'Pull a random daily character prediction!'}</span>
          </motion.button>

          <motion.button
            onClick={() => { triggerHaptic('selection'); setView('quiz'); }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="sketchbook-border paper-interact"
            style={{
              background: '#eff6ff',
              border: '2px solid #bfdbfe',
              borderBottom: '5px solid #3b82f6',
              padding: isMobile ? '20px' : '30px 40px',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              width: isMobile ? '220px' : '240px'
            }}
          >
            <UserCheck size={isMobile ? 36 : 48} color="#3b82f6" />
            <span style={{ fontFamily: 'Sniglet', fontSize: isMobile ? '1.2rem' : '1.4rem', color: '#1e40af' }}>{t.whoAreYou || 'Who are you?'}</span>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#1d4ed8', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t.whoAreYouDesc || 'Take a quiz to find your soul character!'}</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="planner-container planner-page" style={{ 
      minHeight: isMobile ? '680px' : '650px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: isMobile ? '64px 12px 32px' : '60px 40px 120px', 
      position: 'relative', 
      overflow: 'visible'
    }}>
      
      {(pulledCharacter || (!isOpening && !pulledCharacter)) && (
        <motion.button 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => { triggerHaptic('selection'); handleReset(); setView('menu'); }}
          whileHover={{ x: -2, scale: 1.02 }} whileTap={{ scale: 0.95 }}
          className="sketchbook-border"
          style={{ 
            position: 'absolute', 
            top: isMobile ? '10px' : '24px', 
            left: isMobile ? '16px' : '24px', 
            background: 'white', 
            border: '2.5px solid #e5e7eb', 
            borderBottom: '4px solid #d1d5db', 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '4px' : '8px', 
            fontFamily: 'Sniglet', 
            fontSize: isMobile ? '0.9rem' : '1.1rem', 
            color: '#4b5563', 
            padding: isMobile ? '6px 12px' : '10px 20px', 
            cursor: 'pointer', 
            zIndex: 50 
          }}
        >
          <ArrowLeft size={isMobile ? 16 : 18} strokeWidth={2.5} /> Return to Menu
        </motion.button>
      )}

      {!pulledCharacter && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', zIndex: 10, marginTop: isMobile ? '24px' : '0' }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '2.2rem' : '2.8rem', color: '#db2777', margin: 0, transform: 'rotate(-2deg)' }}>Mystery pick</h2>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#6b7280', marginTop: '12px' }}>Draw a character of the day!</p>
          </div>
          
          <motion.button
            className="sketchbook-border paper-interact"
            onClick={handlePull}
            whileHover={isOpening ? {} : { 
              scale: [1, 1.05, 1.02, 1.06, 1], 
              rotate: [-2, 3, -1, 2, -2], 
              transition: { duration: 0.5, ease: "steps(4, end)", repeat: Infinity } 
            }}
            whileTap={isOpening ? {} : { scale: 0.9, rotate: -5 }}
            animate={isOpening ? { 
                scale:  [1, 0.9,  0.8,  1.2,  0.7, 1.4, 0.6, 2.0, 0], 
                rotate: [0, -10,  15,  -25,   35, -50,  70, -180, 540], 
                x:      [0, -15,  20,  -30,   25, -40,  50,   0,  0],
                y:      [0,  10, -10,   15,  -15,  20,  10, -50,  0],
                opacity:[1,   1,   1,    1,    1,   1,   1,   1,  0] 
            } : {}}
            transition={{ duration: isOpening ? 2.2 : 0.2, ease: "steps(8, end)" }}
            style={{
              background: '#fefce8',
              border: '2px solid #eab30880',
              borderBottom: '4px solid #eab308',
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              color: '#ca8a04',
              width: isMobile ? '140px' : '180px',
              height: isMobile ? '140px' : '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 15px rgba(234, 179, 8, 0.2)',
              position: 'relative',
              gap: '8px',
              zIndex: 10,
              overflow: 'visible'
            }}
          >
            <Gift size={isMobile ? 50 : 70} strokeWidth={2.5} />
            <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '1.2rem' }}>Draw</span>
          </motion.button>
        </motion.div>
      )}

      {isOpening && <Confetti />}

      <AnimatePresence>
        {pulledCharacter && (() => {
          let colors = { bg: '#fff', border: '#ccc', text: '#333' };
          const mappedKey = Object.keys(CHARACTER_COLORS).find(k => k.includes(pulledCharacter.name) || pulledCharacter.name.includes(k.split(' ')[0]));
          if (mappedKey && CHARACTER_COLORS[mappedKey]) {
            colors = CHARACTER_COLORS[mappedKey];
          } else {
            colors = FALLBACK_COLORS[pulledCharacter.name.length % FALLBACK_COLORS.length];
          }
          
           return (
            <>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22 }}
                style={{ 
                  width: '100%', 
                  maxWidth: '850px', 
                  zIndex: 10, 
                  margin: isMobile ? '136px auto 0' : '20px auto 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  gap: isMobile ? '24px' : '40px', 
                  alignItems: isMobile ? 'center' : 'flex-start', 
                  width: '100%' 
                }}>
                  
                  {/* Left Column: Portrait & Name */}
                  <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: isMobile ? '100%' : '260px' }}>
                    <motion.div
                      whileHover={{ scale: 1.03, rotate: 1.5, transition: { duration: 0.2, ease: "steps(2, end)" } }}
                      style={{
                        background: colors.bg,
                        border: `3.5px solid ${colors.border}`,
                        borderRadius: '12px',
                        borderBottomWidth: '6px',
                        padding: '12px',
                        boxShadow: `0 10px 25px ${colors.border}45`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        position: 'relative',
                        transform: 'rotate(-2deg)',
                        width: isMobile ? '200px' : '100%'
                      }}
                      className="paper-interact"
                    >
                      <img 
                        src={pulledCharacter.src} 
                        alt={pulledCharacter.name} 
                        style={{ 
                          width: '100%', 
                          height: isMobile ? '180px' : '240px', 
                          objectFit: 'contain', 
                          filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.15))' 
                        }}
                        draggable="false"
                      />
                      <div style={{
                        fontFamily: 'var(--font-hand)',
                        fontSize: isMobile ? '1.4rem' : '1.7rem',
                        fontWeight: 'bold',
                        color: colors.text,
                        background: 'white',
                        padding: '2px 16px',
                        borderRadius: '99px',
                        border: `2px solid ${colors.border}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transform: 'rotate(1deg)'
                      }}>
                        {pulledCharacter.name}
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column: Prediction Details */}
                  <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                     <h3 style={{ fontFamily: 'Sniglet', margin: 0, fontSize: '1.2rem', color: colors.text }}>Daily check</h3>
                     <div className="sketchbook-border" style={{ 
                       background: colors.bg, 
                       padding: isMobile ? '20px' : '24px', 
                       borderRadius: '12px', 
                       border: `2.5px solid ${colors.border}`, 
                       borderBottom: `5px solid ${colors.border}`, 
                       fontFamily: 'Sniglet', 
                       color: colors.text, 
                       fontSize: isMobile ? '1rem' : '1.1rem', 
                       textAlign: 'left', 
                       lineHeight: 1.6, 
                       boxShadow: `0 4px 12px ${colors.border}40`, 
                       display: 'flex', 
                       flexDirection: 'column', 
                       gap: '12px' 
                     }}>
                       <p style={{ margin: 0 }}>{pulledCharacter.prediction}</p>
                     </div>

                     <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', marginTop: '12px' }}>
                       <motion.button 
                         onClick={() => { handleReset(); setTimeout(() => handlePull(), 50); }} 
                         whileHover={{ scale: 1.05 }} 
                         whileTap={{ scale: 0.95 }} 
                         className="sketchbook-border paper-interact" 
                         style={{ background: 'white', color: '#4b5563', border: '2px solid #e5e7eb', borderBottom: '4px solid #d1d5db', padding: '12px 32px', fontFamily: 'Sniglet', fontSize: '1.1rem', cursor: 'pointer' }}
                       >
                         Draw again
                       </motion.button>
                     </div>
                  </div>

                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.85rem', marginTop: '30px', textAlign: 'center', width: '100%' }}
              >
                * Note: These predictions are just for fun and won\'t actually be correct!
              </motion.p>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default MysteryPage;
