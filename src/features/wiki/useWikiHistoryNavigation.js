import { useEffect, useMemo, useRef } from 'react';

export const useWikiHistoryNavigation = ({
  selectedCategoryId,
  selectedEntryId,
  setSelectedCategoryId,
  setSelectedEntryId,
  categories,
}) => {
  const historyPopRef = useRef(false);

  const categoryIds = useMemo(
    () => new Set((categories || []).map((category) => category.id)),
    [categories],
  );
  const entryIdsByCategory = useMemo(
    () => new Map(
      (categories || []).map((category) => [category.id, new Set((category.entries || []).map((entry) => entry.id))]),
    ),
    [categories],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPopState = (event) => {
      const statePage = event.state?.skipApp ? event.state.page : null;
      const nextPage = statePage || window.location.hash.replace('#', '');
      if (nextPage !== 'wiki') return;

      const nextCategoryId = event.state?.skipApp ? event.state.wikiCategoryId : null;
      const nextEntryId = event.state?.skipApp ? event.state.wikiEntryId : null;

      if (!nextCategoryId || !categoryIds.has(nextCategoryId)) {
        if (selectedCategoryId || selectedEntryId) {
          historyPopRef.current = true;
          setSelectedEntryId(null);
          setSelectedCategoryId(null);
        }
        return;
      }

      const validEntries = entryIdsByCategory.get(nextCategoryId) || new Set();
      const normalizedEntryId = nextEntryId && validEntries.has(nextEntryId) ? nextEntryId : null;

      if (nextCategoryId !== selectedCategoryId || normalizedEntryId !== selectedEntryId) {
        historyPopRef.current = true;
        setSelectedCategoryId(nextCategoryId);
        setSelectedEntryId(normalizedEntryId);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [categoryIds, entryIdsByCategory, selectedCategoryId, selectedEntryId, setSelectedCategoryId, setSelectedEntryId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = '#wiki';

    if (historyPopRef.current) {
      historyPopRef.current = false;
      return;
    }

    const currentState = window.history.state;

    if (!selectedCategoryId || !categoryIds.has(selectedCategoryId)) {
      if (currentState?.skipApp && currentState.page === 'wiki' && (currentState.wikiCategoryId || currentState.wikiEntryId)) {
        window.history.replaceState({ skipApp: true, page: 'wiki' }, '', hash);
      }
      return;
    }

    const validEntries = entryIdsByCategory.get(selectedCategoryId) || new Set();
    const normalizedEntryId = selectedEntryId && validEntries.has(selectedEntryId) ? selectedEntryId : null;

    if (!normalizedEntryId) {
      if (currentState?.skipApp && currentState.page === 'wiki' && currentState.wikiCategoryId === selectedCategoryId && !currentState.wikiEntryId) {
        return;
      }

      if (currentState?.skipApp && currentState.page === 'wiki' && currentState.wikiEntryId) {
        window.history.replaceState({ skipApp: true, page: 'wiki', wikiCategoryId: selectedCategoryId }, '', hash);
        return;
      }

      window.history.pushState({ skipApp: true, page: 'wiki', wikiCategoryId: selectedCategoryId }, '', hash);
      return;
    }

    if (
      currentState?.skipApp
      && currentState.page === 'wiki'
      && currentState.wikiCategoryId === selectedCategoryId
      && currentState.wikiEntryId === normalizedEntryId
    ) {
      return;
    }

    window.history.pushState(
      { skipApp: true, page: 'wiki', wikiCategoryId: selectedCategoryId, wikiEntryId: normalizedEntryId },
      '',
      hash,
    );
  }, [categoryIds, entryIdsByCategory, selectedCategoryId, selectedEntryId]);
};

export default useWikiHistoryNavigation;
