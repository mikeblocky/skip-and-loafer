import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Countdown from './components/Countdown';
import { Star, Heart, Sparkles } from 'lucide-react';

/* Quotes */
const QUOTES = [
  { text: "You can never tell what people are thinking. So I'll try to understand them, little by little.", author: "Iwakura Mitsumi" },
  { text: "It's probably the little things that matter. Like how food tastes better when you eat with that person.", author: "Shima Sousuke" },
  { text: "I think memories of places are memories of the people you went there with.", author: "Iwakura Mitsumi" },
  { text: "If you ever find a goal for yourself, then, succeed or fail, we'll go anywhere you want and eat some good food!", author: "Iwakura Mitsumi" },
  { text: "When you fall in love, sometimes it's because you find something in them that you don't have.", author: "Egashira Mika" },
  { text: "I think this is the first time I've ever been real friends with a girl.", author: "Shima Sousuke" },
  { text: "Hard work builds confidence, but… It's scary that all we can do is hope that it'll pay off someday.", author: "Iwakura Mitsumi" },
  { text: "I've always wanted friends I could speak from the heart with. So I'm happy I met you guys.", author: "Murashige Yuzuki" },
  { text: "And what's wrong with being cringe? Having a little bit of a cringe side will make you more endearing.", author: "Nao" },
  { text: "I'm the kind of person who falls flat on her face a lot. But that makes me a pro at dusting myself off!", author: "Iwakura Mitsumi" },
  { text: "When you're feeling overwhelmed, a little kindness, well… It really picks you back up!", author: "Iwakura Mitsumi" },
  { text: "I know this feeling. It's envy.", author: "Shima Sousuke" },
];

/* Cover images */
const COVER_IMAGES = [
  '/cover_01_01_v2.jpg', '/cover_01_02_v2.jpg', '/cover_01_03_v2.jpg',
  '/cover_01_04_v2.jpg', '/cover_02_01_v2.jpg', '/cover_02_02_v2.jpg',
  '/cover_02_03_v2.jpg', '/cover_02_04_v2.jpg', '/cover_03_01_v2.jpg',
  '/cover_03_02_v2.jpg', '/cover_03_03_v2.jpg', '/cover_03_04_v2.jpg',
  '/cover_01_05_v2.jpg', '/cover_02_05_v2.jpg', '/cover_03_05_v2.jpg',
  '/cover_02_06_v2.jpg', '/cover_03_06_v2.jpg', '/cover_01_01_v2.jpg',
  '/cover_01_02_v2.jpg', '/cover_02_02_v2.jpg', '/cover_03_02_v2.jpg',
];

/* Character stickers with positions */
const CHARACTER_DATA = [
  { id: '1c', src: '/1c.png', name: 'Mitsumi', x: 50, y: 100, rot: -8 },
  { id: '2c', src: '/2c.png', name: 'Sousuke', x: 800, y: 80, rot: 6 },
  { id: '3c', src: '/3c.png', name: 'Mika', x: 30, y: 500, rot: -12 },
  { id: '4c', src: '/4c.png', name: 'Makoto', x: 850, y: 450, rot: 8 },
  { id: '5c', src: '/5c.png', name: 'Yuzuki', x: 750, y: 520, rot: -5 },
];

/* Sticker with real position tracking */
const CharacterSticker = ({ character, isMobile, allPositions, onPositionUpdate }) => {
  const [showEffect, setShowEffect] = useState(null);
  const stickerRef = useRef(null);
  const size = isMobile ? 120 : 180; // EVEN BIGGER

  const checkProximity = useCallback(() => {
    if (!stickerRef.current) return;
    const rect = stickerRef.current.getBoundingClientRect();
    const myX = rect.left + rect.width / 2;
    const myY = rect.top + rect.height / 2;

    // Update my position
    onPositionUpdate(character.id, { x: myX, y: myY });

    // Check relationships
    let effect = null;

    // 1c + 2c = best friends (not love!)
    if (character.id === '1c' && allPositions['2c']) {
      const dist = Math.hypot(myX - allPositions['2c'].x, myY - allPositions['2c'].y);
      if (dist < 280) effect = 'bestfriend';
    }
    if (character.id === '2c' && allPositions['1c']) {
      const dist = Math.hypot(myX - allPositions['1c'].x, myY - allPositions['1c'].y);
      if (dist < 280) effect = 'bestfriend';
    }

    // 1c near 3c, 4c, or 5c = group friendship
    if (character.id === '1c') {
      ['3c', '4c', '5c'].forEach(otherId => {
        if (allPositions[otherId]) {
          const dist = Math.hypot(myX - allPositions[otherId].x, myY - allPositions[otherId].y);
          if (dist < 280) effect = 'group';
        }
      });
    }
    if (['3c', '4c', '5c'].includes(character.id) && allPositions['1c']) {
      const dist = Math.hypot(myX - allPositions['1c'].x, myY - allPositions['1c'].y);
      if (dist < 280) effect = 'group';
    }

    // 4c + 5c = friendship
    if (character.id === '4c' && allPositions['5c']) {
      const dist = Math.hypot(myX - allPositions['5c'].x, myY - allPositions['5c'].y);
      if (dist < 250) effect = 'friendship';
    }
    if (character.id === '5c' && allPositions['4c']) {
      const dist = Math.hypot(myX - allPositions['4c'].x, myY - allPositions['4c'].y);
      if (dist < 250) effect = 'friendship';
    }

    // 3c near 1c = mature
    if (character.id === '3c' && allPositions['1c']) {
      const dist = Math.hypot(myX - allPositions['1c'].x, myY - allPositions['1c'].y);
      if (dist < 250) effect = 'mature';
    }

    setShowEffect(effect);
  }, [character.id, allPositions, onPositionUpdate]);

  return (
    <motion.div
      ref={stickerRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDrag={checkProximity}
      onDragEnd={checkProximity}
      whileDrag={{ scale: 1.1, zIndex: 9999 }}
      whileHover={{ scale: 1.05 }}
      style={{
        position: 'absolute',
        left: character.x,
        top: character.y,
        width: size,
        zIndex: 600,
        cursor: 'grab',
        filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.25))'
      }}
      initial={{ scale: 0, rotate: character.rot * 2 }}
      animate={{ scale: 1, rotate: character.rot }}
      transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
    >
      <img
        src={character.src}
        alt={character.name}
        style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
        draggable="false"
      />

      {/* Relationship Effect */}
      <AnimatePresence>
        {/* Best Friends (1c + 2c) - Two Stars */}
        {showEffect === 'bestfriend' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}
          >
            <motion.div animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.9 }}>
              <Star size={28} fill="#ffe57f" color="#ffe57f" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }}>
              <Star size={28} fill="#97d5eb" color="#97d5eb" />
            </motion.div>
          </motion.div>
        )}

        {/* Group Friendship (1c with 3c/4c/5c) */}
        {showEffect === 'group' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
              <Sparkles size={36} color="#ff9ec6" fill="#ff9ec6" />
            </motion.div>
          </motion.div>
        )}

        {showEffect === 'friendship' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Sparkles size={32} color="#ffe57f" fill="#ffe57f" />
            </motion.div>
          </motion.div>
        )}

        {showEffect === 'mature' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Star size={28} fill="#97eba9" color="#97eba9" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* Interactive Morphing Shape */
const InteractiveShape = ({ color, size, initialTop, initialLeft, index }) => {
  const pathX = useMemo(() => [0, 30, -20, 15, 0], []);
  const pathY = useMemo(() => [0, -25, 10, -15, 0], []);

  return (
    <motion.div
      className="morphing-shape"
      style={{
        position: 'absolute',
        top: initialTop,
        left: initialLeft,
        width: size,
        height: size,
        background: color,
        opacity: 0.35,
        zIndex: 2,
        pointerEvents: 'none'
      }}
      animate={{
        x: pathX,
        y: pathY,
        scale: [1, 1.15, 0.9, 1.1, 1],
        rotate: [0, 10, -8, 5, 0]
      }}
      transition={{
        repeat: Infinity,
        duration: 12 + index * 2,
        ease: "easeInOut"
      }}
    />
  );
};

/* Memo Card - Free drag */
const MemoCard = ({ src, index, initialX, initialY, initialRotation }) => {
  const [zIndex, setZIndex] = useState(100 + index);

  return (
    <motion.div
      className="memo-card"
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.05, zIndex: 9999, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02 }}
      onDragStart={() => setZIndex(9999)}
      onDragEnd={() => setZIndex(100 + index)}
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: '200px',
        zIndex: zIndex,
        rotate: initialRotation,
        touchAction: 'none',
        cursor: 'grab'
      }}
      initial={{ y: -400, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 18,
        delay: index * 0.07
      }}
    >
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
        loading="lazy"
        draggable="false"
      />
    </motion.div>
  );
};

/* Floating Sparkle */
const FloatingSparkle = ({ children, top, left, right, delay, color }) => (
  <motion.div
    style={{ position: 'absolute', top, left, right, color, zIndex: 5, pointerEvents: 'none' }}
    animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
    transition={{ repeat: Infinity, duration: 4, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const [showUI, setShowUI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stickerPositions, setStickerPositions] = useState({});

  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const targetDate = new Date('2026-01-23T00:00:00+09:00');
  const localDateString = targetDate.toLocaleString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  const handlePositionUpdate = useCallback((id, pos) => {
    setStickerPositions(prev => ({ ...prev, [id]: pos }));
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardPositions = useMemo(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return COVER_IMAGES.map(() => ({
      x: Math.random() * (w - 220),
      y: Math.random() * (h - 180),
      rotation: Math.random() * 20 - 10
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), COVER_IMAGES.length * 70 + 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Interactive Morphing Shapes */}
      <InteractiveShape color="var(--pop-pink)" size="200px" initialTop="3%" initialLeft="5%" index={0} />
      <InteractiveShape color="var(--pop-blue)" size="180px" initialTop="55%" initialLeft="3%" index={1} />
      <InteractiveShape color="var(--pop-yellow)" size="220px" initialTop="5%" initialLeft="78%" index={2} />
      <InteractiveShape color="var(--pop-green)" size="190px" initialTop="60%" initialLeft="82%" index={3} />
      {!isMobile && (
        <>
          <InteractiveShape color="var(--pop-pink)" size="140px" initialTop="35%" initialLeft="1%" index={4} />
          <InteractiveShape color="var(--pop-blue)" size="160px" initialTop="25%" initialLeft="90%" index={5} />
        </>
      )}

      {/* Character Stickers - BIGGER */}
      {CHARACTER_DATA.map(char => (
        <CharacterSticker
          key={char.id}
          character={char}
          isMobile={isMobile}
          allPositions={stickerPositions}
          onPositionUpdate={handlePositionUpdate}
        />
      ))}

      {/* Memo Cards */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        {COVER_IMAGES.map((src, index) => (
          <MemoCard
            key={`${src}-${index}`}
            src={src}
            index={index}
            initialX={cardPositions[index].x}
            initialY={cardPositions[index].y}
            initialRotation={cardPositions[index].rotation}
          />
        ))}
      </div>

      {/* Main UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            style={{
              position: 'relative',
              zIndex: 500,
              minHeight: '100vh',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '12px' : '40px',
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Floating Sparkles - Desktop */}
            {!isMobile && (
              <>
                <FloatingSparkle top="10%" left="5%" delay={0} color="var(--pop-yellow)">
                  <Star size={36} fill="currentColor" />
                </FloatingSparkle>
                <FloatingSparkle top="15%" right="8%" delay={0.5} color="var(--pop-pink)">
                  <Heart size={30} fill="currentColor" />
                </FloatingSparkle>
              </>
            )}

            {/* Planner */}
            <motion.div
              className="planner-container"
              style={{
                width: '100%',
                maxWidth: isMobile ? '98vw' : '1200px',
                minHeight: isMobile ? 'auto' : '600px',
                position: 'relative',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                zIndex: 10,
                pointerEvents: 'auto'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Left Page */}
              <div className="planner-page" style={{
                borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
                borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
                padding: isMobile ? '20px' : '52px',
                borderRadius: isMobile ? '4px 4px 0 0' : '4px 0 0 4px'
              }}>
                {!isMobile && (
                  <div style={{ position: 'absolute', top: '28px', right: '28px', color: '#d1d5db', fontSize: '1.8rem', opacity: 0.5, transform: 'rotate(-5deg)', border: '2px solid #d1d5db', padding: '6px 14px', borderRadius: '8px', fontFamily: 'var(--font-main)' }}>
                    2026
                  </div>
                )}

                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isMobile ? 'center' : 'flex-start', paddingTop: isMobile ? '10px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Star size={22} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                    <span style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>AGENDA</span>
                    <Star size={22} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                  </div>

                  <h1 style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '2.8rem' : '4.5rem', fontWeight: 'normal', lineHeight: 1.1, marginBottom: '16px', textAlign: isMobile ? 'center' : 'left' }}>
                    <span style={{ color: 'var(--pop-blue)' }}>Skip </span>
                    <span style={{ color: '#b0b8c0', fontSize: isMobile ? '2.2rem' : '3.5rem' }}>&</span>
                    <span style={{ color: 'var(--pop-pink)' }}> Loafer</span>
                  </h1>

                  <div style={{ marginTop: '24px', background: '#fef9c3', padding: '16px', borderLeft: '4px solid var(--pop-yellow)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '340px', transform: 'rotate(1deg)' }}>
                    <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '10px' }}>
                      "{randomQuote.text}"
                    </p>
                    <p style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.9rem', textAlign: 'right' }}>
                      — {randomQuote.author}
                    </p>
                  </div>
                </div>
              </div>

              {/* Binding */}
              <div className="spiral-binding-center" style={{ zIndex: 20 }}></div>

              {/* Right Page */}
              <div className="planner-page" style={{ padding: isMobile ? '20px' : '52px', borderRadius: isMobile ? '0 0 4px 4px' : '0 4px 4px 0' }}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                  <motion.div
                    style={{ marginBottom: isMobile ? '20px' : '40px', background: 'white', padding: '8px 20px', borderRadius: '9999px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Sparkles size={18} style={{ color: 'var(--pop-yellow)' }} />
                    <span style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '1rem' }}>Chapter 77 is coming in...</span>
                    <Sparkles size={18} style={{ color: 'var(--pop-pink)' }} />
                  </motion.div>

                  <Countdown isMobile={isMobile} />

                  <div style={{ marginTop: isMobile ? '20px' : '45px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.1rem' : '1.5rem', color: '#4b5563', background: '#eff6ff', padding: '6px 18px', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold' }}>
                      {localDateString}
                    </p>
                  </div>
                </div>

                <motion.div
                  style={{ position: 'absolute', bottom: '28px', right: '28px', opacity: 0.3, pointerEvents: 'none' }}
                  animate={{ rotate: [10, 18, 10], scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Heart size={isMobile ? 32 : 48} style={{ color: 'var(--pop-pink)', fill: 'var(--pop-pink)' }} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copyright */}
      <div style={{ position: 'fixed', bottom: '8px', right: '14px', zIndex: 1000, fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.7rem', opacity: 0.6 }}>
        © Takamatsu Misaki / KODANSHA
      </div>
    </div>
  );
}

export default App;
