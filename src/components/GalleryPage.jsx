import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, Image as ImageIcon } from 'lucide-react';
import { GALLERY_CATEGORIES } from '../data/gallery';
import { UI_TEXT, TAB_LABELS, TABS } from './gallery/galleryConfig';
import GallerySubtabPanel from './gallery/tabs/GallerySubtabPanel';
import { FADE_UP_INITIAL, FADE_UP_ANIMATE, HOVER_LIFT_SM, TAP_SCALE_DEFAULT } from './shared/animationPresets';
import {
  IMAGE_LOADED_CACHE,
  THUMBNAIL_CACHE,
  THUMBNAIL_PROMISE_CACHE,
  IMAGE_DIMENSION_CACHE,
  createThumbnail,
} from './gallery/thumbnailCache';
import ImageLightbox from './shared/ImageLightbox';

function shuffleInSession(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
      { root: null, rootMargin: '12px 0px', threshold: 0.08 }
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
    return () => { alive = false; };
  }, [isVisible, src, thumbSrc]);

  return (
    <motion.div
      ref={cardRef}
      key={src}
      initial={FADE_UP_INITIAL}
      animate={FADE_UP_ANIMATE}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      style={{ border: selectedBorderColor ? `3px solid ${selectedBorderColor}` : '2px solid transparent', contentVisibility: 'auto', overflowAnchor: 'none' }}
      onClick={onClick}
    >
      <div style={{ 
        width: '100%', 
        background: 'transparent',
        aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
        minHeight: dimensions ? 'auto' : '200px'
      }}>
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

const TabSelector = ({ activeTab, setActiveTab, isMobile, tabLabels }) => (
  <div className="hide-scrollbar" style={{
    display: 'flex', gap: '6px', flexWrap: isMobile ? 'wrap' : 'nowrap',
    overflowX: isMobile ? 'visible' : 'auto',
    overflowY: 'visible',
    padding: '4px 0 6px 0',
    alignItems: 'center',
    justifyContent: isMobile ? 'center' : 'flex-start'
  }}>
    {TABS.map((tab, idx) => {
      const isActive = activeTab === idx;
      const Icon = tab.icon;
      const localized = tabLabels[tab.id] || { title: tab.id, short: tab.id };
      return (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(idx)}
          whileHover={HOVER_LIFT_SM}
          whileTap={TAP_SCALE_DEFAULT}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: isMobile ? '8px 10px' : '10px 14px',
            background: isActive ? tab.color : '#f3f4f6',
            color: isActive ? '#fff' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-hand)',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            lineHeight: 1.3,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none',
            transition: 'all 0.2s',
            flexShrink: 0,
            minHeight: isMobile ? '36px' : '42px',
            overflow: 'visible'
          }}
        >
          <Icon size={isMobile ? 14 : 16} />
          {isMobile ? localized.short : localized.title}
        </motion.button>
      );
    })}
  </div>
);

const GalleryPage = ({ isMobile, uiLanguage = 'en', subtabShortcut }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tabLabels = TAB_LABELS[uiLanguage] || TAB_LABELS.en;
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(() => new Set([TABS[0].id]));
  const [, forceLoadedRefresh] = useState(0);

  const [orderedImagesByTab] = useState(() => {
    const initial = {};
    TABS.forEach((tab) => {
      const source = GALLERY_CATEGORIES[tab.id] || [];
      initial[tab.id] = shuffleInSession(source);
    });
    return initial;
  });

  const currentTab = TABS[activeTab];
  const images = useMemo(() => orderedImagesByTab[currentTab.id] || [], [orderedImagesByTab, currentTab.id]);

  const handleClose = useCallback(() => setSelectedImage(null), []);
  const handleNavigate = useCallback((src) => setSelectedImage(src), []);

  const markLoaded = useCallback((src) => {
    if (!IMAGE_LOADED_CACHE.has(src)) {
      IMAGE_LOADED_CACHE.add(src);
      forceLoadedRefresh(v => v + 1);
    }
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const i = images.indexOf(selectedImage);
    const toPreload = [images[i - 1], images[i + 1]].filter(Boolean);
    toPreload.forEach((url) => {
      if (IMAGE_LOADED_CACHE.has(url)) return;
      const img = new Image();
      img.onload = () => IMAGE_LOADED_CACHE.add(url);
      img.src = url;
    });
  }, [selectedImage, images]);

  // Clear selection when switching tabs
  useEffect(() => { setSelectedImage(null); }, [activeTab]);

  useEffect(() => {
    const tabId = TABS[activeTab].id;
    setVisitedTabs((prev) => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }, [activeTab, orderedImagesByTab]);

  useEffect(() => {
    const key = subtabShortcut?.key;
    if (!key) return;
    if (key === 'q') {
      setActiveTab((prev) => (prev - 1 + TABS.length) % TABS.length);
    }
    if (key === 'e') {
      setActiveTab((prev) => (prev + 1) % TABS.length);
    }
  }, [subtabShortcut?.token]);

  return (
    <div style={{ width: '100%', padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', minHeight: isMobile ? 'auto' : '600px', display: 'flex', flexDirection: 'column', overflow: 'visible', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: isMobile ? '16px' : '26px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '16px' : '0', justifyContent: 'center' }}>
          <ImageIcon size={isMobile ? 24 : 22} style={{ color: '#8b5cf6' }} />
          <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#6b7280', fontSize: isMobile ? '1.5rem' : '1.3rem', fontWeight: 'normal' }}>{t.header}</span>
        </div>
        <div style={{ marginLeft: isMobile ? 0 : '6px' }}>
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} tabLabels={tabLabels} />
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <ImageLightbox
            src={selectedImage}
            images={images}
            onClose={handleClose}
            onNavigate={handleNavigate}
            isMobile={isMobile}
            altText="Gallery artwork"
          />
        )}
      </AnimatePresence>

      {/* Content area */}
      <div style={{ position: 'relative', flex: 1 }}>
        {TABS.map((tab, tabIndex) => {
          if (!visitedTabs.has(tab.id) && tabIndex !== activeTab) return null;
          const tabImages = orderedImagesByTab[tab.id] || [];

          return (
            <GallerySubtabPanel
              key={tab.id}
              tab={tab}
              tabIndex={tabIndex}
              activeTab={activeTab}
              isMobile={isMobile}
              selectedImage={selectedImage}
              images={tabImages}
              t={t}
              setSelectedImage={setSelectedImage}
              markLoaded={markLoaded}
              GalleryThumbComponent={GalleryThumb}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GalleryPage;
