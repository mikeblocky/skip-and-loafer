import { useEffect, useState } from 'react';
import { loadMysteryText } from '../mysteryLocaleLoader';

const EMPTY_MYSTERY_TEXT = {
  mystery: {},
  quiz: {},
};

export function useMysteryText(uiLanguage = 'en') {
  const [text, setText] = useState(EMPTY_MYSTERY_TEXT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);

    loadMysteryText(uiLanguage)
      .then((nextText) => {
        if (cancelled) return;
        setText(nextText);
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setText(EMPTY_MYSTERY_TEXT);
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [uiLanguage]);

  return { text, isReady };
}

export default useMysteryText;
