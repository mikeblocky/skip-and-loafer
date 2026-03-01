import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import {
  IMAGE_DIMENSION_CACHE,
  IMAGE_LOADED_CACHE,
  THUMBNAIL_CACHE,
  createThumbnail,
} from './thumbnailCache';

const GalleryThumb = ({ src, index, onClick, onLoaded, selectedBorderColor, artAltLabel }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(() => THUMBNAIL_CACHE.get(src) || null);
  const [isLoaded, setIsLoaded] = useState(() => IMAGE_LOADED_CACHE.has(src));
  const dimensions = IMAGE_DIMENSION_CACHE.get(src);
  const cardRef = useRef(null);

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
    if (!isVisible || thumbSrc) return;
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
  }, [isVisible, src, thumbSrc]);

  return (
    <motion.div
      ref={cardRef}
      key={src}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      style={{ border: selectedBorderColor ? `3px solid ${selectedBorderColor}` : '2px solid transparent', contentVisibility: 'auto', overflowAnchor: 'none' }}
      onClick={onClick}
    >
      <div
        style={{
          width: '100%',
          background: 'transparent',
          aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
          minHeight: dimensions ? 'auto' : '200px',
        }}
      >
        {isVisible && (
          <img
            src={thumbSrc || src}
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
        )}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={32} />
      </div>
    </motion.div>
  );
};

export default GalleryThumb;
