import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IMAGE_DIMENSION_CACHE,
  IMAGE_LOADED_CACHE,
  THUMBNAIL_CACHE,
  createThumbnail,
  rememberImageDimensions,
} from './thumbnailCache';
import { getGalleryMediaKind } from './galleryMedia';

const CARD_PALETTES = [
  { frame: '#fff8ef', border: '#f7b267', bottom: '#ea7c31', tape: '#fde68a', label: '#9a3412', shadow: 'rgba(234, 124, 49, 0.16)' },
  { frame: '#f6fbff', border: '#8dc8ff', bottom: '#4d9de0', tape: '#bfdbfe', label: '#1d4ed8', shadow: 'rgba(77, 157, 224, 0.16)' },
  { frame: '#fff5fb', border: '#f39acb', bottom: '#e0569f', tape: '#fbcfe8', label: '#9d174d', shadow: 'rgba(224, 86, 159, 0.16)' },
  { frame: '#f5fff8', border: '#77d59a', bottom: '#22a86f', tape: '#bbf7d0', label: '#166534', shadow: 'rgba(34, 168, 111, 0.16)' },
];

const ThumbPlaceholder = ({ palette, selectedBorderColor }) => (
  <div
    style={{
      width: '100%',
      minHeight: '200px',
      borderRadius: '12px',
      background: '#f8fafc',
      border: '2px solid rgba(255,255,255,0.92)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'plannerShimmer 1.2s linear infinite',
      }}
    />
  </div>
);

const GalleryThumb = ({
  src,
  index,
  onLoaded,
  onSelect,
  canSelect,
  isMobile,
  selectedBorderColor,
  artAltLabel,
}) => {
  const mediaKind = getGalleryMediaKind(src);
  const isVideo = mediaKind === 'video';
  const isGif = mediaKind === 'gif';
  const shouldUseThumbnail = isGif;
  const [isVisible, setIsVisible] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(() => THUMBNAIL_CACHE.get(src) || null);
  const [isLoaded, setIsLoaded] = useState(() => IMAGE_LOADED_CACHE.has(src) || THUMBNAIL_CACHE.has(src));
  const dimensions = IMAGE_DIMENSION_CACHE.get(src);
  const cardRef = useRef(null);
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];
  const shouldAnimateEntrance = index < (isMobile ? 8 : 18);

  // Stable random rotation between -5 and 5 degrees
  const [rotation] = useState(() => (Math.random() * 10) - 5);


  useEffect(() => {
    const node = cardRef.current;
    if (!node || isVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '180px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || thumbSrc || !shouldUseThumbnail) return;
    let alive = true;
    createThumbnail(src)
      .then((thumb) => {
        if (!alive) return;
        setThumbSrc(thumb);
      })
      .catch(() => {
        if (!alive) return;
        setThumbSrc(src);
      });
    return () => {
      alive = false;
    };
  }, [isVisible, src, thumbSrc, shouldUseThumbnail]);

  return (
    <motion.div
      ref={cardRef}
      key={src}
      initial={shouldAnimateEntrance ? { opacity: 0, y: 16, rotate: rotation - 4 } : false}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={shouldAnimateEntrance
        ? { duration: 0.22, ease: 'easeOut', delay: Math.min(index * 0.018, 0.2) }
        : { duration: 0 }}
      whileHover={isMobile ? undefined : {
        scale: 1.02,
        y: -3,
        zIndex: 20,
        transition: { duration: 0.16, ease: 'easeOut' }
      }}
      className="break-inside-avoid relative group cursor-pointer overflow-visible"
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: '280px 320px',
        overflowAnchor: 'none',
        marginBottom: '30px',
        cursor: canSelect ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (canSelect) {
          onSelect(src);
        }
      }}
    >
      <div 
        style={{ 
          background: palette.frame,
          padding: '14px',
          boxShadow: `0 16px 28px ${palette.shadow}, 0 4px 10px rgba(15,23,42,0.09)`,
          borderRadius: '18px',
          border: selectedBorderColor ? `4px solid ${selectedBorderColor}` : `3px solid ${palette.border}`,
          borderBottom: selectedBorderColor ? `10px solid ${selectedBorderColor}` : `10px solid ${palette.bottom}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: '16px',
            width: '60px',
            height: '20px',
            borderRadius: '999px',
            background: palette.tape,
            boxShadow: '0 3px 8px rgba(15,23,42,0.08)',
            transform: 'rotate(-8deg)',
            zIndex: 2,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '18px',
            width: '52px',
            height: '18px',
            borderRadius: '999px',
            background: '#ffffffcc',
            boxShadow: '0 3px 8px rgba(15,23,42,0.06)',
            transform: 'rotate(10deg)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            width: '100%',
            background: '#f8fafc',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
            minHeight: dimensions ? 'auto' : '200px',
            position: 'relative',
            border: '2px solid rgba(255,255,255,0.92)',
          }}
        >
        {!isVisible && <ThumbPlaceholder palette={palette} selectedBorderColor={selectedBorderColor} />}
        {isVisible && (
          isVideo ? (
            <>
              <video
                src={src}
                className="block w-full h-auto object-contain"
                preload="metadata"
                playsInline
                muted
                onLoadedData={(event) => {
                  rememberImageDimensions(
                    src,
                    event.currentTarget.videoWidth,
                    event.currentTarget.videoHeight,
                  );
                  if (!isLoaded) {
                    IMAGE_LOADED_CACHE.add(src);
                    setIsLoaded(true);
                    onLoaded(src);
                  }
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  zIndex: 2,
                  borderRadius: '999px',
                  padding: '5px 9px',
                  background: 'rgba(15, 23, 42, 0.72)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  lineHeight: 1,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Video
              </div>
            </>
          ) : (
            <>
              <img
                src={thumbSrc || src}
                alt={`${artAltLabel} ${index + 1}`}
                className="block w-full h-auto object-contain"
                loading="lazy"
                decoding="async"
                fetchPriority={index < 2 ? 'high' : 'low'}
                onLoad={(event) => {
                  rememberImageDimensions(
                    src,
                    event.currentTarget.naturalWidth,
                    event.currentTarget.naturalHeight,
                  );
                  if (!isLoaded) {
                    IMAGE_LOADED_CACHE.add(src);
                    setIsLoaded(true);
                    onLoaded(src);
                  }
                }}
                style={{
                  opacity: isLoaded ? 1 : 0.01,
                  transition: 'opacity 0.18s ease-out',
                }}
              />
              {isGif && (
                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    zIndex: 2,
                    borderRadius: '999px',
                    padding: '5px 9px',
                    background: 'rgba(15, 23, 42, 0.72)',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    lineHeight: 1,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  GIF
                </div>
              )}
            </>
          )
        )}
        {isVisible && !isLoaded && !isVideo && <ThumbPlaceholder palette={palette} selectedBorderColor={selectedBorderColor} />}
        </div>
      </div>
    </motion.div>
  );
};

const areEqual = (previous, next) =>
  previous.src === next.src &&
  previous.index === next.index &&
  previous.onLoaded === next.onLoaded &&
  previous.onSelect === next.onSelect &&
  previous.canSelect === next.canSelect &&
  previous.isMobile === next.isMobile &&
  previous.selectedBorderColor === next.selectedBorderColor &&
  previous.artAltLabel === next.artAltLabel;

export default memo(GalleryThumb, areEqual);
