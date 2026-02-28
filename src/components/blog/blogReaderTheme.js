export const getReaderTheme = (theme) => {
  if (theme === 'night') {
    return {
      panelBg: '#111827',
      panelBorder: '#374151',
      contentBg: '#111827',
      heading: '#f3f4f6',
      text: '#e5e7eb',
      subtle: '#9ca3af',
      divider: '#374151',
      codeBg: '#1f2937',
      codeBorder: '#374151',
      quoteBg: '#1f2937',
      quoteBorder: '#93c5fd',
      quoteText: '#dbeafe',
      link: '#93c5fd',
    };
  }

  if (theme === 'sepia') {
    return {
      panelBg: '#fefaf0',
      panelBorder: '#eadfcb',
      contentBg: '#fefaf0',
      heading: '#3b2f22',
      text: '#4a3c2a',
      subtle: '#7c6850',
      divider: '#eadfcb',
      codeBg: '#f8efdc',
      codeBorder: '#e2cfaa',
      quoteBg: '#fff5df',
      quoteBorder: '#d97706',
      quoteText: '#6b4f2b',
      link: '#92400e',
    };
  }

  return {
    panelBg: '#ffffff',
    panelBorder: '#e5e7eb',
    contentBg: '#ffffff',
    heading: '#374151',
    text: '#374151',
    subtle: '#6b7280',
    divider: '#f3f4f6',
    codeBg: '#f9fafb',
    codeBorder: '#e5e7eb',
    quoteBg: '#fffbeb',
    quoteBorder: '#f59e0b',
    quoteText: '#374151',
    link: '#2563eb',
  };
};
