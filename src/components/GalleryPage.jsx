import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { GALLERY_CATEGORIES } from '../data/gallery';
import { UI_TEXT, TAB_LABELS, TABS } from './gallery/galleryConfig';
import GallerySubtabPanel from './gallery/tabs/GallerySubtabPanel';
import { FADE_UP_INITIAL, FADE_UP_ANIMATE } from './shared/animationPresets';
import {
  IMAGE_LOADED_CACHE,
} from './gallery/thumbnailCache';
import ImageLightbox from './shared/ImageLightbox';
import GalleryTabSelector from './gallery/GalleryTabSelector';
import GalleryThumb from './gallery/GalleryThumb';
import { useSubtabShortcutNavigation } from '../hooks/useSubtabShortcutNavigation';

function shuffleInSession(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');


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

      if (isVideoSrc(url)) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadeddata = () => IMAGE_LOADED_CACHE.add(url);
        video.src = url;
        return;
      }

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

  useSubtabShortcutNavigation({
    subtabShortcut,
    tabCount: TABS.length,
    onNavigate: setActiveTab,
  });

  return (
    <div style={{ width: '100%', padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', minHeight: isMobile ? 'auto' : '600px', display: 'flex', flexDirection: 'column', overflow: 'visible', flex: 1 }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: isMobile ? '20px' : '32px', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: isMobile ? '16px' : '0',
        position: 'relative',
        width: '100%',
        padding: isMobile ? '0 10px' : '0'
      }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '10px 24px', 
            borderRadius: '24px', 
            background: '#ffffff', 
            border: '3.5px solid #8b5cf6',
            borderBottom: '9.5px solid #8b5cf6',
            boxShadow: '0 8px 18px rgba(139, 92, 246, 0.1)',
            zIndex: 1
          }}
        >
          <Camera size={isMobile ? 28 : 24} strokeWidth={2.5} style={{ color: '#8b5cf6' }} />
          <span style={{ 
            fontFamily: '"Sniglet", "Coming Soon", cursive', 
            color: '#8b5cf6', 
            fontSize: isMobile ? '1.45rem' : '1.35rem', 
            fontWeight: '400',
            letterSpacing: '0.2px',
            lineHeight: 1
          }}>
            {t.header}
          </span>
        </motion.div>
        
        <div style={{ position: isMobile ? 'static' : 'absolute', right: isMobile ? 'auto' : '0' }}>
          <GalleryTabSelector 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isMobile={isMobile} 
            tabLabels={tabLabels} 
          />
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

