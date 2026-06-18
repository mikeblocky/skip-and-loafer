export const normalizeForSearch = (value = '') => value.toLowerCase().trim();

export const getAnchorId = (value = '') =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getTableSearchTokens = (table = {}) => [
  table.title,
  ...(table.columns || []),
  ...((table.rows || []).flatMap((row) => row || [])),
];

const getSectionSearchTokens = (section = {}) => [
  section.title,
  ...(section.paragraphs || []),
  ...(section.tables || []).flatMap((table) => getTableSearchTokens(table)),
  ...(section.subsections || []).flatMap((subsection) => [
    subsection.title,
    ...(subsection.paragraphs || []),
    ...((subsection.tables || []).flatMap((table) => getTableSearchTokens(table))),
  ]),
];

export const getEntrySearchHaystack = (category, entry) =>
  [
    category.title,
    category.description,
    entry.title,
    entry.shortTitle,
    entry.description,
    entry.lead,
    ...(entry.searchAliases || []),
    ...(entry.tags || []),
    entry.infobox?.title,
    entry.infobox?.subtitle,
    entry.infobox?.caption,
    ...(entry.infobox?.facts || []).flatMap((fact) => [fact.label, fact.value]),
    ...(entry.sections || []).flatMap((section) => getSectionSearchTokens(section)),
  ]
    .filter(Boolean)
    .join(' ');

export const getEntryVersions = (entry, versionLabel) => {
  if (entry.galleryVersions?.length) return entry.galleryVersions;
  return [entry.image, ...(entry.galleryImages || [])]
    .filter(Boolean)
    .filter((src, index, array) => array.indexOf(src) === index)
    .map((src, index) => ({
      id: `version-${index + 1}`,
      label: `${versionLabel} ${index + 1}`,
      src,
    }));
};

export const getSectionContents = (sections = []) =>
  sections.flatMap((section, sectionIndex) => {
    const sectionId = getAnchorId(section.title);
    return [
      { id: sectionId, title: section.title, level: 0, number: `${sectionIndex + 1}` },
      ...(section.subsections || []).map((subsection, subsectionIndex) => ({
        id: getAnchorId(`${section.title}-${subsection.title}`),
        title: subsection.title,
        level: 1,
        number: `${sectionIndex + 1}.${subsectionIndex + 1}`,
      })),
    ];
  });

export const scrollToSection = (sectionId) => {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(sectionId);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
