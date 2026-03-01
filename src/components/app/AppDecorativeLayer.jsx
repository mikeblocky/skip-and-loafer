import { Star, Heart } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters';
import { COVER_IMAGES } from '../../data/coverImages';
import CharacterSticker from '../CharacterSticker';
import InteractiveShape from '../InteractiveShape';
import MemoCard from '../MemoCard';
import FloatingSparkle from '../FloatingSparkle';

const AppDecorativeLayer = ({
  accessibilityPrefs,
  isMobile,
  activePage,
  handlePositionUpdate,
  stickerPositions,
  stickerLayoutById,
  cardPositions,
}) => {
  return (
    <>
      {!accessibilityPrefs.simplifyVisuals && (
        <>
          <InteractiveShape color="var(--pop-pink)" size="200px" initialTop="3%" initialLeft="5%" index={0} />
          <InteractiveShape color="var(--pop-blue)" size="180px" initialTop="55%" initialLeft="3%" index={1} />
          {!isMobile && (
            <>
              <InteractiveShape color="var(--pop-yellow)" size="220px" initialTop="5%" initialLeft="78%" index={2} />
              <InteractiveShape color="var(--pop-green)" size="190px" initialTop="60%" initialLeft="82%" index={3} />
            </>
          )}
          {!isMobile && (
            <>
              <InteractiveShape color="var(--pop-pink)" size="140px" initialTop="35%" initialLeft="1%" index={4} />
              <InteractiveShape color="var(--pop-blue)" size="160px" initialTop="25%" initialLeft="90%" index={5} />
            </>
          )}
        </>
      )}

      {!accessibilityPrefs.simplifyVisuals && CHARACTER_DATA.map((char, index) => (
        <CharacterSticker
          key={char.id}
          character={char}
          index={index}
          isMobile={isMobile}
          activePage={activePage}
          allPositions={stickerPositions}
          onPositionUpdate={handlePositionUpdate}
          sidePreference={stickerLayoutById[char.id]?.side}
          sideRank={stickerLayoutById[char.id]?.rank}
          sideCount={stickerLayoutById[char.id]?.count}
        />
      ))}

      {!accessibilityPrefs.simplifyVisuals && !isMobile && activePage === 'home' && (
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
      )}

      {!isMobile && !accessibilityPrefs.simplifyVisuals && (
        <>
          <FloatingSparkle top="10%" left="5%" delay={0} color="var(--pop-yellow)">
            <Star size={36} fill="currentColor" />
          </FloatingSparkle>
          <FloatingSparkle top="15%" right="8%" delay={0.5} color="var(--pop-pink)">
            <Heart size={30} fill="currentColor" />
          </FloatingSparkle>
        </>
      )}
    </>
  );
};

export default AppDecorativeLayer;
