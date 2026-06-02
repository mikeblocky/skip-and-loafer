import { Suspense, lazy, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Camera, Clipboard, PawPrint, Map as MapIcon, Star } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import usePageTitle from '../../hooks/shared/usePageTitle';
import useIdlePreload from '../app/hooks/useIdlePreload';
import { FALLBACK_COLORS } from '../chat/chatPalette';
import getAnimalQuizCopy from './animalQuiz/copy';
import MysteryDrawView from './components/MysteryDrawView';
import MysteryHeader from './components/MysteryHeader';
import MysteryMenu from './components/MysteryMenu';
import MysterySubviewFallback from './components/MysterySubviewFallback';
import { useMysteryDraw } from './hooks/useMysteryDraw';
import useMysteryText from './hooks/useMysteryText';
import { PORTRAIT_DATA } from './mysteryData';

const loadQuizGame = () => import('./QuizGame');
const loadAnimalQuizGame = () => import('./AnimalQuizGame');
const loadRatingGame = () => import('./RatingGame');
const loadRelationshipMap = () => import('./RelationshipMap');
const QuizGame = lazy(loadQuizGame);
const AnimalQuizGame = lazy(loadAnimalQuizGame);
const RatingGame = lazy(loadRatingGame);
const RelationshipMap = lazy(loadRelationshipMap);
const MYSTERY_LANGUAGE = 'en';

const tabsConfig = [
  { view: 'menu', label: 'Desk Corkboard', shortLabel: 'Dashboard', icon: Sparkles, bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  { view: 'gacha', label: 'Spirit Draw', shortLabel: 'Gacha', icon: Camera, bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' },
  { view: 'quiz', label: 'Soul Quiz', shortLabel: 'Quiz', icon: Clipboard, bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  { view: 'animalQuiz', label: 'Animal Buddy', shortLabel: 'Animal', icon: PawPrint, bg: '#d1fae5', color: '#047857', border: '#a7f3d0' },
  { view: 'map', label: 'Story Canvas', shortLabel: 'Map', icon: MapIcon, bg: '#f3e8ff', color: '#6d28d9', border: '#e9d5ff' },
  { view: 'rating', label: 'Tier Board', shortLabel: 'Tier', icon: Star, bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
];

const MysteryExperience = ({ isMobile, darkMode = false }) => {
  const { text: t, isReady } = useMysteryText();
  const loadingMysteryLabel = 'Loading mystery...';
  const loadingAnimalQuizLabel = 'Loading animal quiz...';
  const loadingRatingLabel = 'Loading rating board...';
  const loadingMapLabel = 'Loading relationship map...';

  usePageTitle('Mystery');

  const animalQuizCopy = getAnimalQuizCopy(MYSTERY_LANGUAGE, t);
  const [view, setView] = useState('menu');
  const mysteryPreloaders = useMemo(() => [loadQuizGame, loadAnimalQuizGame, loadRatingGame, loadRelationshipMap], []);
  
  const { pulledCharacter, isOpening, handlePull, handleReset, handleDrawAgain } = useMysteryDraw({
    portraitData: PORTRAIT_DATA,
  });

  useIdlePreload(mysteryPreloaders, view === 'menu', {
    delayMs: 260,
    staggerMs: 180,
    maxPreloadCount: isMobile ? 1 : 2,
  });

  const leaveSubView = () => {
    triggerHaptic('selection');
    handleReset();
    setView('menu');
  };

  const selectViewWithHaptic = (targetView) => {
    triggerHaptic('selection');
    setView(targetView);
  };

  if (!isReady && !t.mystery?.title) {
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
        <MysterySubviewFallback isMobile={isMobile} label={loadingMysteryLabel} />
      </div>
    );
  }

  // Active theme calculations for border highlights
  const activeTabConfig = tabsConfig.find(tab => tab.view === view) || tabsConfig[0];
  const activeBorderColor = activeTabConfig.color;

  return (
    <div
      className="planner-container planner-page mystery-ui"
      data-mystery-language={MYSTERY_LANGUAGE}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: isMobile ? 'auto' : '720px',
        padding: isMobile ? '12px 8px 10px 8px' : '28px 40px',
        overflow: 'visible',
        background: 'transparent',
        boxShadow: 'none',
      }}
    >
      {view === 'menu' ? (
        // Render simple desk corkboard
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <MysteryMenu
            isMobile={isMobile}
            t={t}
            animalQuizCopy={animalQuizCopy}
            onSelectView={setView}
            pulledCharacter={pulledCharacter}
            uiLanguage={MYSTERY_LANGUAGE}
          />
        </div>
      ) : (
        // Redesigned Scrapbook Case File Layout
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            flex: 1,
            gap: isMobile ? '14px' : '0px', // Tabs meet the scrapbook page on desktop
            position: 'relative',
          }}
        >
          {/* DESKTOP SIDEBAR FOLDER INDEX TABS */}
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '180px',
                flexShrink: 0,
                paddingTop: '64px',
                zIndex: 5,
              }}
            >
              {tabsConfig.map((tab) => {
                const isActive = view === tab.view;
                const Icon = tab.icon;

                return (
                  <motion.button
                    key={tab.view}
                    onClick={() => selectViewWithHaptic(tab.view)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 18px',
                      borderRadius: '16px 0 0 16px',
                      border: `2px solid ${isActive ? (darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : tab.color) : 'var(--themed-mystery-tab-border-' + tab.view + ', rgba(0,0,0,0.06))'}`,
                      borderRight: 'none',
                      background: isActive ? 'var(--surface-card, #ffffff)' : 'var(--themed-mystery-tab-bg-' + tab.view + ', ' + tab.bg + ')',
                      color: isActive ? (darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : tab.color) : 'var(--themed-mystery-tab-text-' + tab.view + ', #475569)',
                      fontWeight: isActive ? 'bold' : '500',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-paper)',
                      fontSize: '1rem',
                      boxShadow: isActive 
                        ? '-6px 4px 12px rgba(0,0,0,0.05)' 
                        : '-2px 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      width: '100%',
                      transform: isActive ? 'translateX(4px)' : 'none',
                      zIndex: isActive ? 10 : 1,
                      textShadow: isActive ? '0.5px 0 0 currentColor' : 'none',
                    }}
                    whileHover={isActive ? {} : { scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2.0} color={isActive ? (darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : tab.color) : 'var(--themed-mystery-tab-icon-' + tab.view + ', ' + tab.color + ')'} />
                    <span>{tab.shortLabel}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* MOBILE SCROLLABLE WASHI TAPE TAB BAR */}
          {isMobile && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '4px 6px 12px 6px',
                width: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                zIndex: 5,
              }}
              className="hide-scrollbar"
            >
              {tabsConfig.map((tab) => {
                const isActive = view === tab.view;
                const Icon = tab.icon;

                return (
                  <motion.button
                    key={tab.view}
                    onClick={() => selectViewWithHaptic(tab.view)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      background: isActive ? 'var(--surface-card, #ffffff)' : 'var(--themed-mystery-tab-bg-' + tab.view + ', ' + tab.bg + ')',
                      color: isActive ? (darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : 'var(--keycap-color, ' + tab.color + ')') : 'var(--themed-mystery-tab-text-' + tab.view + ', ' + tab.color + ')',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 'bold' : '500',
                      fontFamily: 'var(--font-hand)',
                      boxShadow: isActive 
                        ? `0 4px 10px ${tab.color}25, 0 1px 2px rgba(0,0,0,0.05)` 
                        : '0 2px 4px rgba(0,0,0,0.03)',
                      transform: isActive ? 'scale(1.03)' : 'none',
                      border: isActive ? `2px solid ${darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : tab.color}` : '1.5px dashed var(--themed-mystery-tab-border-' + tab.view + ', rgba(0,0,0,0.12))',
                      whiteSpace: 'nowrap',
                      zIndex: isActive ? 10 : 1,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2.5 : 2.0} color={isActive ? (darkMode ? 'var(--themed-mystery-tab-accent-' + tab.view + ', ' + tab.color + ')' : tab.color) : 'var(--themed-mystery-tab-icon-' + tab.view + ', ' + tab.color + ')'} />
                    <span>{tab.shortLabel}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* CENTRAL SCRAPBOOK ACTIVE SHEET */}
          <div
            style={{
              flex: 1,
              background: 'var(--surface-card, #ffffff)',
              border: isMobile ? '2px solid var(--surface-border, rgba(0,0,0,0.05))' : `3.5px solid ${activeBorderColor}`,
              borderRadius: isMobile ? '18px' : '24px',
              padding: isMobile ? '16px 12px' : '32px',
              boxShadow: '0 15px 45px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.02)',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '620px',
              transition: 'border-color 0.25s ease-out',
            }}
          >
            {/* Header Slot (hides on mobile map view to preserve space) */}
            {!(isMobile && view === 'map') && (
                <MysteryHeader
                  isMobile={isMobile}
                  showBackButton={true}
                title={t.mystery?.[view === 'animalQuiz' ? 'animalQuiz' : view]?.title || t.mystery?.[view]?.title || t.mystery?.title || 'Case File'}
                  onBack={leaveSubView}
                  backLabel={t.mystery?.returnToMenu || 'Desk Corkboard'}
                />
            )}

            {/* Active View Container with slide-fade transition */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  {view === 'gacha' && (
                    <MysteryDrawView
                      isMobile={isMobile}
                      t={t}
                      pulledCharacter={pulledCharacter}
                      isOpening={isOpening}
                      onDraw={handlePull}
                      onDrawAgain={handleDrawAgain}
                      uiLanguage={MYSTERY_LANGUAGE}
                    />
                  )}

                  {view === 'quiz' && (
                    <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={t.quiz?.thinking || 'Loading quiz...'} />}>
                      <QuizGame
                        isMobile={isMobile}
                        portraitData={PORTRAIT_DATA}
                        fallbackColors={FALLBACK_COLORS}
                        t={t}
                        uiLanguage={MYSTERY_LANGUAGE}
                      />
                    </Suspense>
                  )}

                  {view === 'animalQuiz' && (
                    <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={animalQuizCopy.calculating || loadingAnimalQuizLabel} />}>
                      <AnimalQuizGame
                        isMobile={isMobile}
                        portraitData={PORTRAIT_DATA}
                        t={t}
                        uiLanguage={MYSTERY_LANGUAGE}
                      />
                    </Suspense>
                  )}

                  {view === 'rating' && (
                    <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={loadingRatingLabel} />}>
                      <RatingGame
                        isMobile={isMobile}
                        portraitData={PORTRAIT_DATA}
                        t={t}
                      />
                    </Suspense>
                  )}

                  {view === 'map' && (
                    <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={loadingMapLabel} />}>
                      <RelationshipMap
                        isMobile={isMobile}
                        portraitData={PORTRAIT_DATA}
                        t={t}
                        onBack={leaveSubView}
                        darkMode={darkMode}
                      />
                    </Suspense>
                  )}


                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryExperience;
