export const MYSTERY_FONT_FAMILY = '"Sniglet", "Coming Soon", cursive';

export const toMysteryLabelCase = (value = '') => {
  const text = String(value ?? '');

  if (!text) {
    return '';
  }

  const lowerCased = text.toLocaleLowerCase();

  return lowerCased.replace(
    /^([\s"'([{<]*)(\p{L})/u,
    (_, prefix, firstLetter) => `${prefix}${firstLetter.toLocaleUpperCase()}`,
  );
};
