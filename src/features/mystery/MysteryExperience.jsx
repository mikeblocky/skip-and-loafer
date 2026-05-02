import { Suspense, lazy, useMemo, useState } from 'react';
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

const MysteryExperience = ({ isMobile }) => {
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
      data-mystery-language={MYSTERY_LANGUAGE}
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
      {!(isMobile && view === 'map') && (
        <MysteryHeader
          isMobile={isMobile}
          showBackButton={view !== 'menu'}
          title={t.mystery?.title || 'Mystery cabin'}
          onBack={leaveSubView}
          backLabel={t.mystery?.returnToMenu || 'Step Back Outside'}
        />
      )}

      {view === 'menu' && (
      <MysteryMenu
        isMobile={isMobile}
        t={t}
        animalQuizCopy={animalQuizCopy}
        onSelectView={setView}
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
          />
        </Suspense>
      )}
    </div>
  );
};

export default MysteryExperience;
