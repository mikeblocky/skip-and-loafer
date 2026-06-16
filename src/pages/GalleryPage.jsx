/* VITE_CACHE_BUST_3 */
import React, { Suspense, lazy, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '../components/shared/paper/PageLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UI_TEXT, TAB_LABELS, TABS } from '../features/gallery/galleryConfig';
import GalleryPageHeader from '../features/gallery/GalleryPageHeader';
import GalleryTabSelector from '../features/gallery/GalleryTabSelector';
import GallerySubtabPanel from '../features/gallery/tabs/GallerySubtabPanel';
import { IMAGE_LOADED_CACHE } from '../features/gallery/thumbnailCache';
import GalleryThumb from '../features/gallery/GalleryThumb';
import { useSubtabShortcutNavigation } from '../hooks/shared/useSubtabShortcutNavigation';
import usePageTitle from '../hooks/shared/usePageTitle';
import useIdlePreload from '../features/app/hooks/useIdlePreload';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import { loadGalleryTabImages, preloadGalleryTabImages } from '../features/gallery/galleryTabDataLoader';

const loadImageLightbox = () => import('../components/shared/ImageLightbox');
const ImageLightbox = lazy(loadImageLightbox);

const GalleryNavBtn = ({ onClick, disabled, activeColor, children, isMobile }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.08, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.92, y: 1 } : {}}
    style={{
      flexShrink: 0,
      width: isMobile ? '38px' : '46px',
      height: isMobile ? '38px' : '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--themed-card-bg, #ffffff)',
      color: disabled ? 'var(--themed-card-inactive-border, #cbd5e1)' : activeColor,
      border: `3px solid ${disabled ? 'var(--themed-card-inactive-border, #cbd5e1)' : activeColor}`,
      borderBottom: `6px solid ${disabled ? 'var(--themed-card-inactive-border, #cbd5e1)' : activeColor}`,
      borderRadius: '14px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : `0 4px 12px ${activeColor}15`,
      transition: 'border-color 0.2s, color 0.2s, border-bottom 0.2s, box-shadow 0.2s',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    {children}
  </motion.button>
);

function shuffleInSession(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');
const hasLoadedTab = (imagesByTab, tabId) => Object.prototype.hasOwnProperty.call(imagesByTab, tabId);
const GALLERY_TAB_PRELOADERS = Object.fromEntries(
  TABS.map((tab) => [tab.id, () => preloadGalleryTabImages(tab.id)]),
);

const GalleryPage = ({ isMobile, uiLanguage = 'en', subtabShortcut }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  const tabLabels = TAB_LABELS[uiLanguage] || TAB_LABELS.en;

  usePageTitle(tGlobal.tabs?.gallery?.label || 'Gallery');

  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(() => new Set([TABS[0].id]));
  const [loadingTabs, setLoadingTabs] = useState({});
  const [orderedImagesByTab, setOrderedImagesByTab] = useState({});
  const [, forceLoadedRefresh] = useState(0);
  const isMountedRef = useRef(true);

  const currentTab = TABS[activeTab];
  const images = useMemo(() => orderedImagesByTab[currentTab.id] || [], [orderedImagesByTab, currentTab.id]);
  const currentTabHasLoaded = hasLoadedTab(orderedImagesByTab, currentTab.id);
  const currentTabIsLoading = !currentTabHasLoaded && !!loadingTabs[currentTab.id];
  const handleClose = useCallback(() => setSelectedImage(null), []);
  const handleNavigate = useCallback((src) => setSelectedImage(src), []);
  const handleSetActiveTab = useCallback((nextTab) => {
    startTransition(() => {
      setActiveTab((previous) => (typeof nextTab === 'function' ? nextTab(previous) : nextTab));
    });
  }, []);

  const goPrev = useCallback(() => {
    setActiveTab((prev) => (prev - 1 + TABS.length) % TABS.length);
  }, []);

  const goNext = useCallback(() => {
    setActiveTab((prev) => (prev + 1) % TABS.length);
  }, []);

  const markLoaded = useCallback((src) => {
    if (!IMAGE_LOADED_CACHE.has(src)) {
      IMAGE_LOADED_CACHE.add(src);
      forceLoadedRefresh((value) => value + 1);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const tabId = currentTab.id;

    if (currentTabHasLoaded || currentTabIsLoading) {
      return undefined;
    }

    setLoadingTabs((previous) => ({ ...previous, [tabId]: true }));

    loadGalleryTabImages(tabId)
      .then((loadedImages) => {
        if (!isMountedRef.current) return;
        setOrderedImagesByTab((previous) => {
          if (hasLoadedTab(previous, tabId)) {
            return previous;
          }

          return {
            ...previous,
            [tabId]: shuffleInSession(loadedImages),
          };
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!isMountedRef.current) return;
        setLoadingTabs((previous) => ({ ...previous, [tabId]: false }));
      });
  }, [currentTab.id, currentTabHasLoaded, currentTabIsLoading]);

  const galleryPreloaders = useMemo(() => {
    const adjacentTabIds = [TABS[activeTab + 1]?.id, TABS[activeTab - 1]?.id]
      .filter(Boolean)
      .filter((tabId) => !hasLoadedTab(orderedImagesByTab, tabId));

    return [
      loadImageLightbox,
      ...adjacentTabIds.map((tabId) => GALLERY_TAB_PRELOADERS[tabId]),
    ];
  }, [activeTab, orderedImagesByTab]);

  useIdlePreload(galleryPreloaders, true, {
    delayMs: 180,
    staggerMs: 120,
    maxPreloadCount: isMobile ? 2 : 3,
  });

  useEffect(() => {
    if (!selectedImage) return;
    const selectedIndex = images.indexOf(selectedImage);
    const toPreload = [images[selectedIndex - 1], images[selectedIndex + 1]].filter(Boolean);

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

  useEffect(() => {
    setSelectedImage(null);
  }, [activeTab]);

  useEffect(() => {
    const tabId = TABS[activeTab].id;
    if (!visitedTabs.has(tabId)) {
      setVisitedTabs((previous) => {
        const next = new Set(previous);
        next.add(tabId);
        return next;
      });
    }
  }, [activeTab, visitedTabs]);

  useSubtabShortcutNavigation({
    subtabShortcut,
    tabCount: TABS.length,
    onNavigate: setActiveTab,
  });

  return (
    <PageLayout isMobile={isMobile} style={{ minHeight: isMobile ? 'auto' : '600px' }}>
      <GalleryPageHeader
        isMobile={isMobile}
        title={t.header}
      />

      {/* Centered Gallery Tab Selector flanked by reactive navigation chevrons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '6px' : '12px',
          marginBottom: isMobile ? '16px' : '24px',
          width: '100%',
          padding: isMobile ? '0' : '0',
          boxSizing: 'border-box',
        }}
      >
        <GalleryNavBtn
          onClick={goPrev}
          disabled={false}
          activeColor={currentTab.color}
          isMobile={isMobile}
        >
          <ChevronLeft size={isMobile ? 20 : 24} strokeWidth={3} />
        </GalleryNavBtn>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', overflow: 'hidden' }}>
          <GalleryTabSelector
            activeTab={activeTab}
            setActiveTab={handleSetActiveTab}
            isMobile={isMobile}
            tabLabels={tabLabels}
          />
        </div>

        <GalleryNavBtn
          onClick={goNext}
          disabled={false}
          activeColor={currentTab.color}
          isMobile={isMobile}
        >
          <ChevronRight size={isMobile ? 20 : 24} strokeWidth={3} />
        </GalleryNavBtn>
      </div>

      <AnimatePresence>
        {selectedImage ? (
          <Suspense fallback={null}>
            <ImageLightbox
              src={selectedImage}
              images={images}
              onClose={handleClose}
              onNavigate={handleNavigate}
              isMobile={isMobile}
              altText="Gallery artwork"
            />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <div style={{ position: 'relative', flex: 1, overflow: isMobile ? 'hidden' : 'visible', minWidth: 0 }}>
        {TABS.map((tab, tabIndex) => {
          if (!visitedTabs.has(tab.id) && tabIndex !== activeTab) {
            return null;
          }

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
              isLoading={!hasLoadedTab(orderedImagesByTab, tab.id) && !!loadingTabs[tab.id]}
              t={t}
              onSelectImage={setSelectedImage}
              markLoaded={markLoaded}
              GalleryThumbComponent={GalleryThumb}
            />
          );
        })}
      </div>
    </PageLayout>
  );
};

export default GalleryPage;
