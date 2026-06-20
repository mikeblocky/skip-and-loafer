export const CHAPTER_RELEASE_INFO = {
  latestReleasedChapter: 81,
  latestReleaseDate: '2026-06-25T00:00:00+09:00',
  nextChapter: 82,
  nextReleaseLabel: 'to be announced',
};

export const getChapterReleaseDate = () => new Date(CHAPTER_RELEASE_INFO.latestReleaseDate);

export const formatChapterReleaseDate = (date = getChapterReleaseDate(), locale = 'en-US') =>
  date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  });

export const getReleasedChapterNotification = (locale = 'en-US') => {
  const releaseDate = formatChapterReleaseDate(getChapterReleaseDate(), locale);
  return {
    title: `Chapter ${CHAPTER_RELEASE_INFO.latestReleasedChapter} has been released`,
    body: `Chapter ${CHAPTER_RELEASE_INFO.latestReleasedChapter} was released on ${releaseDate}. Next chapter will be released on ${CHAPTER_RELEASE_INFO.nextReleaseLabel}.`,
    tag: `skip-chapter-${CHAPTER_RELEASE_INFO.latestReleasedChapter}-released`,
  };
};
