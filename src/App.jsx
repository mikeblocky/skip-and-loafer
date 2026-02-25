import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

// Data
import { CHARACTER_DATA } from './data/characters';
import { COVER_IMAGES } from './data/coverImages';
import { CHAPTERS } from './data/chapters';

// Components
import CharacterSticker from './components/CharacterSticker';
import InteractiveShape from './components/InteractiveShape';
import MemoCard from './components/MemoCard';
import FloatingSparkle from './components/FloatingSparkle';
import ReleaseNote from './components/ReleaseNote';
import PlannerPage from './components/PlannerPage';
import NavTabs from './components/NavTabs';
import ChaptersPage from './components/ChaptersPage';
import MangaReader from './components/MangaReader';

function App() {
  const [showUI, setShowUI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stickerPositions, setStickerPositions] = useState({});
  const [activePage, setActivePage] = useState(() => localStorage.getItem('skip_activePage') || 'home');
  const [readerChapter, setReaderChapter] = useState(() => {
    const saved = localStorage.getItem('skip_readerChapter');
    try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
  });

  useEffect(() => { localStorage.setItem('skip_activePage', activePage); }, [activePage]);
  useEffect(() => {
    if (readerChapter) localStorage.setItem('skip_readerChapter', JSON.stringify(readerChapter));
    else localStorage.removeItem('skip_readerChapter');
  }, [readerChapter]);

  // Read Chapter Handlers
  const activeChapterIndex = readerChapter ? CHAPTERS.findIndex(c => c.number === readerChapter.number) : -1;
  const hasNextChapter = activeChapterIndex !== -1 && activeChapterIndex < CHAPTERS.length - 1;
  const hasPrevChapter = activeChapterIndex > 0;

  const handleNextChapter = useCallback(() => {
    if (hasNextChapter) setReaderChapter(CHAPTERS[activeChapterIndex + 1]);
  }, [hasNextChapter, activeChapterIndex]);

  const handlePrevChapter = useCallback(() => {
    if (hasPrevChapter) setReaderChapter(CHAPTERS[activeChapterIndex - 1]);
  }, [hasPrevChapter, activeChapterIndex]);

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

      {/* Character Stickers - Random positions */}
      {CHARACTER_DATA.map((char, index) => (
        <CharacterSticker
          key={char.id}
          character={char}
          index={index}
          isMobile={isMobile}
          activePage={activePage}
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
              paddingTop: isMobile ? '50px' : '60px',
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
                minHeight: isMobile ? '88vh' : '600px',
                position: 'relative',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                zIndex: 10,
                pointerEvents: 'auto',
                marginTop: isMobile ? '10px' : '20px'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Bookmark Nav Tabs */}
              <NavTabs
                activePage={activePage}
                onPageChange={setActivePage}
                isMobile={isMobile}
              />

              {/* Page Content */}
              <AnimatePresence mode="wait">
                {activePage === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'contents' }}
                  >
                    <PlannerPage isMobile={isMobile} />
                  </motion.div>
                )}

                {activePage === 'chapters' && (
                  <motion.div
                    key="chapters"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--paper-white)',
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                      backgroundSize: '100% 32px',
                      borderRadius: '4px',
                      flex: 1, display: 'flex', flexDirection: 'column'
                    }}
                  >
                    <ChaptersPage isMobile={isMobile} onReadChapter={(ch) => setReaderChapter(ch)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Release Notes - only on home */}
              {activePage === 'home' && (
                <ReleaseNote isMobile={isMobile} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copyright */}
      <div style={{ position: 'fixed', bottom: '8px', right: '14px', zIndex: 1000, fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.7rem', opacity: 0.6 }}>
        © Takamatsu Misaki / KODANSHA
      </div>

      {/* Manga Reader Overlay */}
      <AnimatePresence>
        {readerChapter && readerChapter.pages && (
          <MangaReader
            key={`reader-${readerChapter.number}`}
            chapter={readerChapter}
            pages={readerChapter.pages}
            onClose={() => setReaderChapter(null)}
            onNextChapter={hasNextChapter ? handleNextChapter : undefined}
            onPrevChapter={hasPrevChapter ? handlePrevChapter : undefined}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
