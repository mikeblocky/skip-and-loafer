/* VITE_CACHE_BUST_3 */
import React, { Suspense, lazy, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UI_TEXT, TAB_LABELS, TABS } from '../features/gallery/galleryConfig';
import GalleryPageHeader from '../features/gallery/GalleryPageHeader';
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
    <div
      style={{
        width: '100%',
        padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
        minHeight: isMobile ? 'auto' : '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        flex: 1,
      }}
    >
      <GalleryPageHeader
        isMobile={isMobile}
        title={t.header}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        tabLabels={tabLabels}
      />

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

      <div style={{ position: 'relative', flex: 1, overflow: 'visible' }}>
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
    </div>
  );
};

export default GalleryPage;
