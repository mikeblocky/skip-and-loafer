import { Suspense, lazy, useMemo, useState } from 'react';
import { triggerHaptic } from '../../utils/haptics';
import usePageTitle from '../../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../../config/appUiText';
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
const QuizGame = lazy(loadQuizGame);
const AnimalQuizGame = lazy(loadAnimalQuizGame);

const MysteryExperience = ({ isMobile, uiLanguage }) => {
  const { text: t, isReady } = useMysteryText(uiLanguage);
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  const loadingMysteryLabel = uiLanguage === 'ja' ? 'ミステリーを読み込み中...' : 'Loading mystery...';
  const loadingAnimalQuizLabel = uiLanguage === 'ja' ? '動物クイズを読み込み中...' : 'Loading animal quiz...';

  usePageTitle(tGlobal.tabs?.mystery?.label || 'Mystery');

  const animalQuizCopy = getAnimalQuizCopy(uiLanguage, t);
  const [view, setView] = useState('menu');
  const mysteryPreloaders = useMemo(() => [loadQuizGame, loadAnimalQuizGame], []);
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
      <MysteryHeader
        isMobile={isMobile}
        showBackButton={view !== 'menu'}
        title={t.mystery?.title || 'Mystery cabin'}
        onBack={leaveSubView}
        backLabel={t.mystery?.returnToMenu || 'Step Back Outside'}
      />

      {view === 'menu' && (
      <MysteryMenu
        isMobile={isMobile}
        t={t}
        animalQuizCopy={animalQuizCopy}
        onSelectView={setView}
        uiLanguage={uiLanguage}
      />
      )}

      {view === 'gacha' && (
        <MysteryDrawView
          isMobile={isMobile}
          t={t}
          pulledCharacter={pulledCharacter}
          isOpening={isOpening}
          onDraw={handlePull}
          onDrawAgain={handleDrawAgain}
          uiLanguage={uiLanguage}
        />
      )}

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
        <Suspense fallback={<MysterySubviewFallback isMobile={isMobile} label={uiLanguage === 'ja' ? loadingAnimalQuizLabel : (animalQuizCopy.calculating || loadingAnimalQuizLabel)} />}>
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

export default MysteryExperience;
