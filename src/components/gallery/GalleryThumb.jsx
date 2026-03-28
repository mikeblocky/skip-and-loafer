import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import {
  IMAGE_DIMENSION_CACHE,
  IMAGE_LOADED_CACHE,
  THUMBNAIL_CACHE,
  createThumbnail,
} from './thumbnailCache';

const CARD_PALETTES = [
  { frame: '#fff8ef', border: '#f7b267', bottom: '#ea7c31', tape: '#fde68a', label: '#9a3412', shadow: 'rgba(234, 124, 49, 0.16)' },
  { frame: '#f6fbff', border: '#8dc8ff', bottom: '#4d9de0', tape: '#bfdbfe', label: '#1d4ed8', shadow: 'rgba(77, 157, 224, 0.16)' },
  { frame: '#fff5fb', border: '#f39acb', bottom: '#e0569f', tape: '#fbcfe8', label: '#9d174d', shadow: 'rgba(224, 86, 159, 0.16)' },
  { frame: '#f5fff8', border: '#77d59a', bottom: '#22a86f', tape: '#bbf7d0', label: '#166534', shadow: 'rgba(34, 168, 111, 0.16)' },
];

const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');
const isGifSrc = (value) => /\.gif($|\?)/i.test(value || '');

const GalleryThumb = ({ src, index, onClick, onLoaded, selectedBorderColor, artAltLabel }) => {
  const isVideo = isVideoSrc(src);
  const isGif = isGifSrc(src);
  const shouldBypassThumbnail = isVideo || isGif;
  const [isVisible, setIsVisible] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(() => THUMBNAIL_CACHE.get(src) || null);
  const [isLoaded, setIsLoaded] = useState(() => IMAGE_LOADED_CACHE.has(src));
  const dimensions = shouldBypassThumbnail ? null : IMAGE_DIMENSION_CACHE.get(src);
  const cardRef = useRef(null);
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];

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
      { root: null, rootMargin: '12px 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || thumbSrc || shouldBypassThumbnail) return;
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
  }, [isVisible, src, thumbSrc, shouldBypassThumbnail]);

  return (
    <motion.div
      ref={cardRef}
      key={src}
      initial={{ opacity: 0, y: 30, rotate: rotation - 10 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0, 
        zIndex: 20,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      }}
      className="break-inside-avoid relative group cursor-pointer overflow-visible"
      style={{ 
        contentVisibility: 'auto', 
        overflowAnchor: 'none',
        marginBottom: '30px'
      }}
      onClick={onClick}
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
        {isVisible && (
          isVideo ? (
            <video
              src={src}
              className="block w-full h-auto object-contain"
              preload="metadata"
              playsInline
              muted
              loop
              autoPlay
              onLoadedData={() => {
                if (!isLoaded) {
                  IMAGE_LOADED_CACHE.add(src);
                  setIsLoaded(true);
                  onLoaded(src);
                }
              }}
            />
          ) : (
            <img
              src={shouldBypassThumbnail ? src : (thumbSrc || src)}
              alt={`${artAltLabel} ${index + 1}`}
              className="block w-full h-auto object-contain"
              loading="lazy"
              decoding="async"
              fetchPriority={index < 2 ? 'high' : 'low'}
              onLoad={() => {
                if (!isLoaded) {
                  IMAGE_LOADED_CACHE.add(src);
                  setIsLoaded(true);
                  onLoaded(src);
                }
              }}
            />
          )
        )}
        </div>
        <div
          className="sketchbook-border"
          style={{
            position: 'absolute',
            right: '18px',
            bottom: '18px',
            width: '38px',
            height: '38px',
            background: '#ffffff',
            border: `2.5px solid ${selectedBorderColor || palette.border}`,
            borderBottom: `6px solid ${selectedBorderColor || palette.bottom}`,
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(15,23,42,0.08)',
          }}
          aria-hidden="true"
        >
          <ZoomIn color={selectedBorderColor || palette.label} size={16} strokeWidth={2.6} />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center rounded-[12px] m-[14px]">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={32} />
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryThumb;
