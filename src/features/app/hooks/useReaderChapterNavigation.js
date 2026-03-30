import { useMemo, useCallback } from 'react';

export const useReaderChapterNavigation = ({ chapters, readerChapter, setReaderChapter }) => {
  const activeChapterIndex = useMemo(() => {
    if (!readerChapter) return -1;
    return chapters.findIndex((chapter) => chapter.number === readerChapter.number);
  }, [chapters, readerChapter]);

  const nextChapter = activeChapterIndex !== -1 && activeChapterIndex < chapters.length - 1
    ? chapters[activeChapterIndex + 1]
    : null;

  const hasNextChapter = !!(nextChapter && nextChapter.pages && nextChapter.pages.length > 0);
  const hasPrevChapter = activeChapterIndex > 0;

  const handleNextChapter = useCallback(() => {
    if (hasNextChapter) setReaderChapter(chapters[activeChapterIndex + 1]);
  }, [activeChapterIndex, chapters, hasNextChapter, setReaderChapter]);

  const handlePrevChapter = useCallback(() => {
    if (hasPrevChapter) setReaderChapter(chapters[activeChapterIndex - 1]);
  }, [activeChapterIndex, chapters, hasPrevChapter, setReaderChapter]);

  return {
    hasNextChapter,
    hasPrevChapter,
    handleNextChapter,
    handlePrevChapter,
  };
};
