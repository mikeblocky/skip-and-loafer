export const toUiLabelCase = (value = '') => {
  const text = String(value ?? '');

  if (!text) {
    return '';
  }

  const lowerCased = text.toLocaleLowerCase();

  return lowerCased.replace(
    /^([\s"'“”‘’¿¡([{<]*)(\p{L})/u,
    (_, prefix, firstLetter) => `${prefix}${firstLetter.toLocaleUpperCase()}`,
  );
};
