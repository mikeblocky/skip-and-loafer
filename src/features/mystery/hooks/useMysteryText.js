import { useState, useEffect } from 'react';
import { getMysteryText } from '../../../i18n/mystery';

let cache = {};

export function useMysteryText(lang = 'en') {
  const [text, setText] = useState(() => cache[lang] || {});

  useEffect(() => {
    if (cache[lang]) {
      setText(cache[lang]);
      return;
    }
    const resolved = getMysteryText(lang);
    cache[lang] = Object.freeze({ mystery: resolved.mystery || {}, quiz: resolved.quiz || {} });
    setText(cache[lang]);
  }, [lang]);

  return { text, isReady: !!text.mystery };
}

export default useMysteryText;
