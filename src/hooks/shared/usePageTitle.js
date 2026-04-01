import { useEffect } from 'react';

/**
 * Custom hook to set the browser tab title in a consistent format:
 * "[Page Name] | skip-and-loafer"
 * 
 * @param {string} title - The name of the page (e.g., 'Gallery', 'Chapters')
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    if (!title) return undefined;

    const previousTitle = document.title;
    const formattedTitle = `${title} | skip-and-loafer`;

    if (document.title !== formattedTitle) {
      document.title = formattedTitle;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;
