import { memo } from 'react';
import { Star, Heart } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters';
import { COVER_IMAGES } from '../../data/coverImages';
import CharacterSticker from '../../components/shared/CharacterSticker';
import InteractiveShape from '../../components/shared/InteractiveShape';
import MemoCard from '../../components/shared/MemoCard';
import FloatingSparkle from '../../components/shared/FloatingSparkle';

const AppDecorativeLayer = ({
  accessibilityPrefs,
  isMobile,
  activePage,
  handlePositionUpdate,
  stickerPositions,
  stickerLayoutById,
  cardPositions,
}) => {
  const showAmbientDecor = !accessibilityPrefs.simplifyVisuals;
  const showFullDecor = activePage === 'home' || activePage === 'birthdays';
  const showHomeCards = !isMobile && activePage === 'home' && !accessibilityPrefs.simplifyVisuals;
  const visibleCovers = showHomeCards ? COVER_IMAGES.slice(0, 8) : [];
  const visibleCharacters = showAmbientDecor
    ? (isMobile ? CHARACTER_DATA.slice(0, Math.min(4, CHARACTER_DATA.length)) : CHARACTER_DATA)
    : [];
  const ambientShapeCount = showAmbientDecor
    ? (showFullDecor ? (isMobile ? 2 : 6) : (isMobile ? 1 : 3))
    : 0;
  const shapeConfigs = isMobile
    ? [
      { color: 'var(--pop-pink)', size: '180px', initialTop: '30%', initialLeft: '4%' },
      { color: 'var(--pop-blue)', size: '170px', initialTop: '66%', initialLeft: '2%' },
      { color: 'var(--pop-yellow)', size: '190px', initialTop: '18%', initialLeft: '78%' },
      { color: 'var(--pop-green)', size: '180px', initialTop: '72%', initialLeft: '80%' },
    ]
    : [
      { color: 'var(--pop-pink)', size: '200px', initialTop: '3%', initialLeft: '5%' },
      { color: 'var(--pop-blue)', size: '180px', initialTop: '55%', initialLeft: '3%' },
      { color: 'var(--pop-yellow)', size: '220px', initialTop: '5%', initialLeft: '78%' },
      { color: 'var(--pop-green)', size: '190px', initialTop: '60%', initialLeft: '82%' },
      { color: 'var(--pop-pink)', size: '140px', initialTop: '35%', initialLeft: '1%' },
      { color: 'var(--pop-blue)', size: '160px', initialTop: '25%', initialLeft: '90%' },
    ];

  return (
    <>
      {showAmbientDecor && shapeConfigs.slice(0, ambientShapeCount).map((shape, index) => (
        <InteractiveShape
          key={`shape-${index}`}
          color={shape.color}
          size={shape.size}
          initialTop={shape.initialTop}
          initialLeft={shape.initialLeft}
          index={index}
          subtle={!showFullDecor}
        />
      ))}

      {visibleCharacters.map((char, index) => (
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
          interactive
        />
      ))}

      {showHomeCards && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, pointerEvents: 'none' }}>
          {visibleCovers.map((src, index) => (
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

      {!isMobile && showAmbientDecor && (
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

export default memo(AppDecorativeLayer);
