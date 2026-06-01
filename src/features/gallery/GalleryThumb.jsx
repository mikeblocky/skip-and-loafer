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

const ThumbPlaceholder = ({ palette, selectedBorderColor, isMobile }) => (
  <div
    style={{
      width: '100%',
      minHeight: isMobile ? '120px' : '200px',
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
      initial={shouldAnimateEntrance ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldAnimateEntrance
        ? { duration: 0.22, ease: 'easeOut', delay: Math.min(index * 0.018, 0.2) }
        : { duration: 0 }}
      whileHover={isMobile ? undefined : {
        scale: 1.02,
        y: -6,
        zIndex: 20,
        transition: { duration: 0.16, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98, y: 1 }}
      className="break-inside-avoid relative group cursor-pointer overflow-visible"
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: '280px 320px',
        overflowAnchor: 'none',
        marginBottom: '0',
        cursor: canSelect ? 'pointer' : 'default',
        minWidth: 0,
        width: '100%',
      }}
      onClick={() => {
        if (canSelect) {
          onSelect(src);
        }
      }}
    >
      <div 
        style={{ 
          background: '#ffffff',
          padding: isMobile ? '6px' : '12px',
          boxShadow: isMobile ? `0 4px 0px rgba(0,0,0,0.04)` : `0 8px 0px rgba(0,0,0,0.04)`,
          borderRadius: isMobile ? '12px' : '18px',
          border: selectedBorderColor 
            ? `${isMobile ? '2.5px' : '3.5px'} solid ${selectedBorderColor}` 
            : `${isMobile ? '2px' : '3.5px'} solid ${palette.border}`,
          borderBottom: selectedBorderColor 
            ? `${isMobile ? '6px' : '8px'} solid ${selectedBorderColor}` 
            : `${isMobile ? '5px' : '8px'} solid ${palette.bottom}`,
          position: 'relative',
          overflow: 'hidden',
          minWidth: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            background: '#f8fafc',
            borderRadius: isMobile ? '8px' : '12px',
            overflow: 'hidden',
            aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
            minHeight: dimensions ? 'auto' : (isMobile ? '120px' : '200px'),
            position: 'relative',
            border: isMobile ? '1px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.92)',
          }}
        >
        {!isVisible && <ThumbPlaceholder palette={palette} selectedBorderColor={selectedBorderColor} isMobile={isMobile} />}
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
        {isVisible && !isLoaded && !isVideo && <ThumbPlaceholder palette={palette} selectedBorderColor={selectedBorderColor} isMobile={isMobile} />}
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
