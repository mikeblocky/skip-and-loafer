import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import {
  IMAGE_DIMENSION_CACHE,
  IMAGE_LOADED_CACHE,
  THUMBNAIL_CACHE,
  createThumbnail,
} from './thumbnailCache';

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
        marginBottom: '26px'
      }}
      onClick={onClick}
    >

      <div 
        style={{ 
          background: '#fff', 
          padding: '8px 8px 26px 8px', 
          boxShadow: '0 6px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)', 
          borderRadius: '2px',
          border: selectedBorderColor ? `3px solid ${selectedBorderColor}` : '3px solid transparent',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '100%',
            background: '#f3f4f6', // subtle placeholder background
            borderRadius: '2px',
            overflow: 'hidden',
            aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
            minHeight: dimensions ? 'auto' : '200px',
            position: 'relative'
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center rounded-[2px] m-2 mb-[26px]">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={32} />
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryThumb;
