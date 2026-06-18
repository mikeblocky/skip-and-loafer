import { Suspense, lazy, startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getUI } from '../i18n/ui';
import { WIKI_SECTIONS } from '../data/wiki';
import { CONTENT_SLIDE_COMPACT, TRANSITION_FAST } from '../components/shared/animationPresets';
import { getPageRootStyle, getScrollablePaneStyle } from '../features/blog/blogStyles';
import { ensureMetaDescriptionTag } from '../features/blog/blogShared';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getWikiEntryExtras } from '../features/wiki/wikiEnhancements';
import { WIKI_UI_TEXT } from '../i18n/wiki';
import { useWikiHistoryNavigation } from '../features/wiki/useWikiHistoryNavigation';
import { IS_PRODUCTION_SERVER, PRODUCTION_WIKI_VISIBLE_ENTRY_IDS } from '../config/runtimeFlags';
import WikiRootView from '../features/wiki/WikiRootView';
import WikiCategoryView from '../features/wiki/WikiCategoryView';
import WikiDetailView from '../features/wiki/WikiDetailView';
import { normalizeForSearch, getEntrySearchHaystack } from '../features/wiki/wikiHelpers';

const ImageLightbox = lazy(() => import('../components/shared/ImageLightbox'));

const getVisibleWikiSections = () => {
  if (!IS_PRODUCTION_SERVER) return WIKI_SECTIONS;

  return WIKI_SECTIONS.map((category) => {
    const allowedEntryIds = PRODUCTION_WIKI_VISIBLE_ENTRY_IDS[category.id];
    if (!allowedEntryIds) return null;

    const entries = category.entries.filter((entry) => allowedEntryIds.includes(entry.id));
    if (!entries.length) return null;

    return { ...category, entries };
  }).filter(Boolean);
};

const WikiPage = ({ isMobile, uiLanguage = 'en' }) => {
  const t = { ...WIKI_UI_TEXT.en, ...(WIKI_UI_TEXT[uiLanguage] || {}) };
  const tGlobal = getUI(uiLanguage);
  usePageTitle(tGlobal.tabs?.wiki?.label || t.header || 'Wiki');

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxState, setLightboxState] = useState(null);

  const categories = useMemo(
    () => getVisibleWikiSections().map((category) => ({
      ...category,
      entries: category.entries.map((entry) => ({
        ...entry,
        ...(getWikiEntryExtras(category.id, entry.id) || {}),
      })),
    })),
    [],
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );
  const selectedEntry = useMemo(
    () => selectedCategory?.entries.find((entry) => entry.id === selectedEntryId) || null,
    [selectedCategory, selectedEntryId],
  );
  const totalEntries = useMemo(
    () => categories.reduce((sum, category) => sum + category.entries.length, 0),
    [categories],
  );
  const normalizedSearchTerm = useMemo(() => normalizeForSearch(searchTerm), [searchTerm]);

  const filteredCategories = useMemo(() => {
    if (!normalizedSearchTerm) return categories;
    return categories.map((category) => {
      const categoryMatch = normalizeForSearch(`${category.title} ${category.description}`).includes(normalizedSearchTerm);
      const nextEntries = category.entries.filter((entry) => normalizeForSearch(getEntrySearchHaystack(category, entry)).includes(normalizedSearchTerm));
      if (!categoryMatch && nextEntries.length === 0) return null;
      return { ...category, entries: categoryMatch && nextEntries.length === 0 ? category.entries : nextEntries };
    }).filter(Boolean);
  }, [categories, normalizedSearchTerm]);

  const globalSearchResults = useMemo(
    () => filteredCategories.flatMap((category) => category.entries.map((entry) => ({
      ...entry,
      categoryId: category.id,
      categoryTitle: category.title,
      categoryAccent: category.accent,
      categoryBorder: category.border,
      categorySurface: category.surface,
    }))),
    [filteredCategories],
  );

  const filteredSelectedCategory = useMemo(
    () => filteredCategories.find((category) => category.id === selectedCategoryId) || null,
    [filteredCategories, selectedCategoryId],
  );

  useWikiHistoryNavigation({ selectedCategoryId, selectedEntryId, setSelectedCategoryId, setSelectedEntryId, categories });

  useEffect(() => {
    if (selectedCategory && !selectedEntryId) return;
    if (!selectedCategoryId) return;
    if (!selectedCategory) {
      startTransition(() => { setSelectedCategoryId(null); setSelectedEntryId(null); });
    }
  }, [selectedCategory, selectedCategoryId, selectedEntryId]);

  useEffect(() => {
    if (!selectedCategory && selectedEntryId) {
      startTransition(() => { setSelectedEntryId(null); });
      return;
    }
    if (selectedCategory && selectedEntryId && !selectedEntry) {
      startTransition(() => { setSelectedEntryId(null); });
    }
  }, [selectedCategory, selectedEntry, selectedEntryId]);

  const handleSelectCategory = useCallback((categoryId) => {
    startTransition(() => { setSelectedCategoryId(categoryId); setSelectedEntryId(null); });
  }, []);
  const handleSelectEntry = useCallback((entryId) => {
    startTransition(() => { setSelectedEntryId(entryId); });
  }, []);
  const handleSelectGlobalEntry = useCallback((categoryId, entryId) => {
    startTransition(() => { setSelectedCategoryId(categoryId); setSelectedEntryId(entryId); });
  }, []);
  const handleSelectRelated = useCallback((categoryId, entryId) => {
    startTransition(() => { setSelectedCategoryId(categoryId); setSelectedEntryId(entryId); });
  }, []);
  const handleBackToWiki = useCallback(() => {
    startTransition(() => { setSelectedCategoryId(null); setSelectedEntryId(null); });
  }, []);
  const handleBackToCategory = useCallback(() => {
    startTransition(() => { setSelectedEntryId(null); });
  }, []);
  const handleOpenGallery = useCallback((images, src, altText) => {
    setLightboxState({ images, src, altText });
  }, []);
  const handleCloseGallery = useCallback(() => { setLightboxState(null); }, []);
  const handleNavigateGallery = useCallback((src) => {
    setLightboxState((current) => (current ? { ...current, src } : current));
  }, []);

  useEffect(() => {
    const descriptionTag = ensureMetaDescriptionTag();
    const previousDescription = descriptionTag.getAttribute('content') || '';
    const nextDescription = selectedEntry?.description || selectedCategory?.description || t.listHint || WIKI_UI_TEXT.en.listHint;
    descriptionTag.setAttribute('content', nextDescription);
    return () => { descriptionTag.setAttribute('content', previousDescription); };
  }, [selectedCategory, selectedEntry, t.listHint]);

  let content = null;
  if (!selectedCategory) {
    content = (
      <WikiRootView
        isMobile={isMobile}
        t={t}
        categories={filteredCategories}
        totalEntries={totalEntries}
        searchTerm={searchTerm}
        globalSearchResults={globalSearchResults}
        onSearchChange={setSearchTerm}
        onSelectCategory={handleSelectCategory}
        onSelectEntry={handleSelectGlobalEntry}
      />
    );
  } else if (!selectedEntry) {
    content = (
      <WikiCategoryView
        isMobile={isMobile}
        t={t}
        category={selectedCategory}
        entries={filteredSelectedCategory?.entries || []}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBackToWiki={handleBackToWiki}
        onSelectEntry={handleSelectEntry}
      />
    );
  } else {
    content = (
      <WikiDetailView
        isMobile={isMobile}
        t={t}
        category={selectedCategory}
        entry={selectedEntry}
        onBackToWiki={handleBackToWiki}
        onBackToCategory={handleBackToCategory}
        onSelectRelated={handleSelectRelated}
        onOpenGallery={handleOpenGallery}
      />
    );
  }

  return (
    <div style={getPageRootStyle(isMobile)}>
      <AnimatePresence>
        {lightboxState ? (
          <Suspense fallback={null}>
            <ImageLightbox
              src={lightboxState.src}
              images={lightboxState.images}
              onClose={handleCloseGallery}
              onNavigate={handleNavigateGallery}
              isMobile={isMobile}
              altText={lightboxState.altText}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedEntry ? `entry-${selectedCategoryId}-${selectedEntryId}` : (selectedCategory ? `category-${selectedCategoryId}` : 'wiki-root')}
          initial={CONTENT_SLIDE_COMPACT.initial}
          animate={CONTENT_SLIDE_COMPACT.animate}
          exit={CONTENT_SLIDE_COMPACT.exit}
          transition={TRANSITION_FAST}
          className="hide-scrollbar"
          data-no-tab-swipe={selectedEntry ? '1' : undefined}
          style={getScrollablePaneStyle(isMobile)}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WikiPage;
