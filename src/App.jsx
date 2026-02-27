/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, X } from 'lucide-react';

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
import SyncPage from './components/SyncPage';
import BirthdayNotification from './components/BirthdayNotification';
import BirthdayPage from './components/BirthdayPage';
import ChangelogPopup from './components/ChangelogPopup';
import GalleryPage from './components/GalleryPage';
import { useReadProgress } from './hooks/useReadProgress';
import { useSyncData } from './hooks/useSyncData';

function App() {
  const DISCLAIMER_SEEN_KEY = 'skip_disclaimerSeen_v1';
  const { finished, finishedCount, readCounts, markFinished: rawMarkFinished, unmarkFinished, isFinished, getReadCount, incrementReadCount: rawIncrementReadCount, trackExternalLink, cancelExternalLink, reloadFromStorage, getRemainingCooldown, pendingLinks } = useReadProgress();
  const syncData = useSyncData(reloadFromStorage);
  const { pushNow } = syncData;

  // Wrap markFinished and incrementReadCount to trigger an immediate sync push
  const markFinished = useCallback((ch) => { rawMarkFinished(ch); pushNow(); }, [rawMarkFinished, pushNow]);
  const incrementReadCount = useCallback((ch) => { rawIncrementReadCount(ch); pushNow(); }, [rawIncrementReadCount, pushNow]);

  const [showUI, setShowUI] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    try {
      return localStorage.getItem(DISCLAIMER_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const closeDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    try {
      localStorage.setItem(DISCLAIMER_SEEN_KEY, '1');
    } catch {
      // ignore storage failures
    }
  }, [DISCLAIMER_SEEN_KEY]);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  const isMobile = windowSize.width <= 768;
  const isNarrowMobile = windowSize.width <= 400;
  const [stickerPositions, setStickerPositions] = useState({});
  const [activePage, setActivePage] = useState(() => localStorage.getItem('skip_activePage') || 'home');
  const [readerChapter, setReaderChapter] = useState(() => {
    const saved = localStorage.getItem('skip_readerChapter');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  useEffect(() => { localStorage.setItem('skip_activePage', activePage); }, [activePage]);
  useEffect(() => {
    if (readerChapter) localStorage.setItem('skip_readerChapter', JSON.stringify(readerChapter));
    else localStorage.removeItem('skip_readerChapter');
  }, [readerChapter]);

  // Read Chapter Handlers
  const activeChapterIndex = readerChapter ? CHAPTERS.findIndex(c => c.number === readerChapter.number) : -1;
  const nextChapter = activeChapterIndex !== -1 && activeChapterIndex < CHAPTERS.length - 1 ? CHAPTERS[activeChapterIndex + 1] : null;
  const hasNextChapter = !!(nextChapter && nextChapter.pages && nextChapter.pages.length > 0);
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
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [cardPositions] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return COVER_IMAGES.map(() => ({
      x: Math.random() * (w - 220),
      y: Math.random() * (h - 180),
      rotation: Math.random() * 20 - 10
    }));
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), COVER_IMAGES.length * 70 + 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Disclaimer Popup */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDisclaimer}
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
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
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
                onClick={closeDisclaimer}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>

              <Heart size={32} style={{ color: 'var(--pop-pink)', margin: '0 auto 12px auto' }} />

              <h2 style={{ fontFamily: 'var(--font-main)', color: '#374151', fontSize: '1.4rem', marginBottom: '12px', marginTop: 0 }}>
                Fan-made website
              </h2>

              <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px' }}>
                This is a fan-made website and is not intended to promote any translation! Please support the official translation by purchasing volumes in your local country if available, or buy Japanese volumes and chapters on Comic DAYS.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeDisclaimer}
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
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, pointerEvents: 'none' }}>
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
            className="hide-scrollbar"
            style={{
              position: 'relative',
              zIndex: 500,
              height: '100vh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '56px 8px 40px 8px' : '40px',
              pointerEvents: 'auto'
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

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: 1, minHeight: isMobile ? '24px' : '20px' }} />

            {/* Container to handle stacking contexts for tabs and planner */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: isMobile ? '100%' : '1200px',
              minHeight: isMobile ? 0 : 'min-content',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              flex: '0 0 auto',
              flexShrink: 0
            }}>
              {/* Bookmark Nav Tabs */}
              <NavTabs
                activePage={activePage}
                onPageChange={setActivePage}
                isMobile={isMobile}
              />

              {/* Planner */}
              <motion.div
                className="planner-container"
                style={{
                  width: '100%',
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  minHeight: isMobile ? 0 : undefined,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
                      <ChaptersPage isMobile={isMobile} onReadChapter={(ch) => setReaderChapter(ch)} isFinished={isFinished} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} getReadCount={getReadCount} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} />
                    </motion.div>
                  )}

                  {activePage === 'gallery' && (
                    <motion.div
                      key="gallery"
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
                      <GalleryPage isMobile={isMobile} />
                    </motion.div>
                  )}

                  {activePage === 'sync' && (
                    <motion.div
                      key="sync"
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
                        flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row'
                      }}
                    >
                      <SyncPage isMobile={isMobile} finishedCount={finishedCount} finished={finished} readCounts={readCounts} reloadFromStorage={reloadFromStorage} onReadChapter={(ch) => setReaderChapter(ch)} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} syncData={syncData} />
                    </motion.div>
                  )}

                  {activePage === 'birthdays' && (
                    <motion.div
                      key="birthdays"
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
                      <BirthdayPage isMobile={isMobile} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Release Notes - only on home */}
                {activePage === 'home' && (
                  <ReleaseNote isMobile={isMobile} />
                )}
              </motion.div>
            </div>

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: 1, minHeight: isMobile ? '8px' : '20px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog Popup */}
      <ChangelogPopup isMobile={isMobile} />

      {/* Birthday Notification */}
      <BirthdayNotification isMobile={isMobile} />

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
            onChapterFinished={markFinished}
            getRemainingCooldown={getRemainingCooldown}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
