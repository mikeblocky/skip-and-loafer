import { useMemo, useCallback, useEffect, useState } from 'react';
import { getCachedChapterData, loadChapterData } from '../chapterDataLoader';

export const useReaderChapterNavigation = ({ readerChapter, setReaderChapter }) => {
  const [chapters, setChapters] = useState(() => getCachedChapterData() || []);

  useEffect(() => {
    if (!readerChapter) return undefined;
    if (chapters.length) return undefined;

    let active = true;

    loadChapterData().then((nextChapters) => {
      if (!active) return;
      setChapters(nextChapters);
    });

    return () => {
      active = false;
    };
  }, [chapters.length, readerChapter]);

  const activeChapterIndex = useMemo(() => {
    if (!readerChapter) return -1;
    return chapters.findIndex((chapter) => chapter.number === readerChapter.number);
  }, [chapters, readerChapter]);

  const nextChapter = activeChapterIndex !== -1 && activeChapterIndex < chapters.length - 1
    ? chapters[activeChapterIndex + 1]
    : null;

  const prevChapter = activeChapterIndex > 0
    ? chapters[activeChapterIndex - 1]
    : null;

  const hasNextChapter = !!(nextChapter && nextChapter.pages && nextChapter.pages.length > 0);
  const hasPrevChapter = !!prevChapter;

  const handleNextChapter = useCallback(() => {
    if (nextChapter) setReaderChapter(nextChapter);
  }, [nextChapter, setReaderChapter]);

  const handlePrevChapter = useCallback(() => {
    if (prevChapter) setReaderChapter(prevChapter);
  }, [prevChapter, setReaderChapter]);

  return {
    hasNextChapter,
    hasPrevChapter,
    handleNextChapter,
    handlePrevChapter,
  };
};
