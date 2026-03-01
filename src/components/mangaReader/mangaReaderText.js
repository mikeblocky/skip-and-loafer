const UI_TEXT = {
  en: {
    backToTop: 'Back to Top',
    firstPage: 'First Page',
    returnToTop: 'Return to Top',
    returnToFirstPage: 'Return to first page',
  },
  es: {
    backToTop: 'Volver arriba',
    firstPage: 'Primera página',
    returnToTop: 'Volver arriba',
    returnToFirstPage: 'Volver a la primera página',
  },
  pt: {
    backToTop: 'Voltar ao topo',
    firstPage: 'Primeira página',
    returnToTop: 'Voltar ao topo',
    returnToFirstPage: 'Voltar à primeira página',
  },
  fr: {
    backToTop: 'Retour en haut',
    firstPage: 'Première page',
    returnToTop: 'Retour en haut',
    returnToFirstPage: 'Retour à la première page',
  },
  de: {
    backToTop: 'Nach oben',
    firstPage: 'Erste Seite',
    returnToTop: 'Zurück nach oben',
    returnToFirstPage: 'Zur ersten Seite',
  },
  it: {
    backToTop: 'Torna su',
    firstPage: 'Prima pagina',
    returnToTop: 'Torna su',
    returnToFirstPage: 'Torna alla prima pagina',
  },
};

export const getMangaReaderText = (uiLanguage) => UI_TEXT[uiLanguage] || UI_TEXT.en;
