export const getReaderTheme = (theme) => {
  if (theme === 'night') {
    return {
      panelBg: '#162235',
      panelBorder: '#334155',
      contentBg: '#162235',
      heading: '#f8fafc',
      text: '#e5eef9',
      subtle: '#a8bed8',
      divider: '#334155',
      codeBg: '#20324d',
      codeBorder: '#3b4c63',
      quoteBg: '#20324d',
      quoteBorder: '#93c5fd',
      quoteText: '#e0f2fe',
      link: '#93c5fd',
    };
  }

  if (theme === 'sepia') {
    return {
      panelBg: '#fdf7ec',
      panelBorder: '#e7d7bb',
      contentBg: '#fdf7ec',
      heading: '#4a3420',
      text: '#5a4530',
      subtle: '#7d664d',
      divider: '#eadfcb',
      codeBg: '#f7ead1',
      codeBorder: '#e6d0a5',
      quoteBg: '#fff4dc',
      quoteBorder: '#f59e0b',
      quoteText: '#6b4f2b',
      link: '#9a3412',
    };
  }

  return {
    panelBg: '#ffffff',
    panelBorder: '#bfdbfe',
    contentBg: '#ffffff',
    heading: '#1e3a8a',
    text: '#334155',
    subtle: '#64748b',
    divider: '#dbeafe',
    codeBg: '#f8fbff',
    codeBorder: '#dbeafe',
    quoteBg: '#eff6ff',
    quoteBorder: '#60a5fa',
    quoteText: '#1e3a8a',
    link: '#2563eb',
  };
};
