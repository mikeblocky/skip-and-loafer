const rangeLinkMap = (start, end, buildValue) => {
  const map = {};
  for (let i = start; i <= end; i++) map[i] = buildValue(i);
  return map;
};

const buildAmazonDpLinks = (domain, dpByVolume, volumeNumber) => {
  const dp = dpByVolume?.[volumeNumber];
  if (!dp) return null;
  return `https://${domain}/${dp}`;
};

const buildPenguinLink = ({ market, id, volume, isbn }) =>
  `https://www.penguinlibros.com/${market}/comic-juvenil/${id}-libro-skip-y-loafer-${volume}-seinen-${isbn}`;

const buildLirekaLink = ({ isbn, tome }) =>
  `https://www.lireka.com/en/pp/${isbn}-skip-loafer-tome-${String(tome).padStart(2, '0')}`;

const tupleMap = (tuples, buildValue) =>
  Object.fromEntries(tuples.map((tuple) => [tuple[0], buildValue(tuple)]));

const MX_PENGUIN_TUPLES = [
  [1, 'mx', '348377', '9786073845830'],
  [2, 'mx', '350955', '9786073848329'],
  [3, 'mx', '354706', '9786073852586'],
  [4, 'mx', '365078', '9786073853804'],
  [5, 'mx', '372084', '9786073857857'],
  [6, 'mx', '393113', '9786073862783'],
  [7, 'mx', '438206', '9786073866026'],
];

const FR_LIREKA_TUPLES = [
  [1, '9782383163503'],
  [2, '9782383164029'],
  [3, '9782383165446'],
  [4, '9782383166245'],
  [5, '9782383167631'],
  [6, '9782386700606'],
  [7, '9782386700613'],
  [8, '9782386705557'],
];

const BR_AMAZON_DP_TUPLES = [
  [1, 'dp/6555946873'],
  [2, 'dp/6555947381'],
  [3, 'dp/6555947799'],
];

const BR_JBC_LINKS = {
  1: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-01/',
  2: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-02/',
  3: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-03/',
  4: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-04/',
  5: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-05/',
  6: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-06/',
  7: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-07/',
  8: 'https://editorajbc.com.br/mangas/colecao/skip-to-loafer/vol/skip-loafer-08/',
};

const NATIVE_PREORDER_BY_LOCALE = {
  BR: [8],
};

const DE_AMAZON_DP_TUPLES = [
  [1, 'dp/3753914894'],
  [2, 'dp/3753914908'],
  [3, 'dp/3753915610'],
  [4, 'dp/3753915645'],
  [5, 'dp/3753920487'],
  [6, 'dp/3753922196'],
  [7, 'dp/3753922226'],
  [8, 'dp/3753925691'],
  [9, 'dp/3753925721'],
  [10, 'dp/375392735X'],
];

const IT_AMAZON_DP_TUPLES = [
  [1, 'dp/8834922611'],
  [2, 'dp/883492262X'],
  [3, 'dp/8834913205'],
  [4, 'dp/883492407X'],
  [5, 'dp/8834925033'],
  [6, 'dp/8834925718'],
  [7, 'dp/8834927192'],
  [8, 'dp/8834929489'],
  [9, 'dp/8834930754'],
  [10, 'dp/8834932048'],
];

export const AMAZON_STORE_BY_LOCALE = {
  ES: {
    kind: 'sequence',
    links: rangeLinkMap(1, 10, (volume) => `https://www.milkywayediciones.com/products/skip-and-loafer-vol-${volume}`),
  },
  MX: {
    kind: 'templateMap',
    links: tupleMap(MX_PENGUIN_TUPLES, ([volume, market, id, isbn]) =>
      buildPenguinLink({ market, id, volume, isbn })
    ),
  },
  PT: {
    kind: 'amazonDp',
    domain: 'www.amazon.com.br',
    links: tupleMap(BR_AMAZON_DP_TUPLES, ([volume, dp]) => dp),
  },
  BR: {
    kind: 'templateMap',
    links: BR_JBC_LINKS,
  },
  DE: {
    kind: 'amazonDp',
    domain: 'www.amazon.de',
    links: tupleMap(DE_AMAZON_DP_TUPLES, ([volume, dp]) => dp),
  },
  IT: {
    kind: 'amazonDp',
    domain: 'www.amazon.it',
    links: tupleMap(IT_AMAZON_DP_TUPLES, ([volume, dp]) => dp),
  },
  FR: {
    kind: 'templateMap',
    links: tupleMap(FR_LIREKA_TUPLES, ([volume, isbn]) =>
      buildLirekaLink({ isbn, tome: volume })
    ),
  },
  VN: {
    kind: 'sequence',
    links: rangeLinkMap(1, 10, (volume) => `https://ipm.vn/products/skip-and-loafer-${volume}`),
  },
};

export const buildNativeLink = (countryCode, volumeNumber) => {
  const store = AMAZON_STORE_BY_LOCALE[countryCode];
  if (!store) return null;

  if (store.kind === 'amazonDp') {
    return buildAmazonDpLinks(store.domain, store.links, volumeNumber);
  }

  return store.links?.[volumeNumber] || null;
};

export const isNativePreOrderVolume = (countryCode, volumeNumber) => {
  const preorderVolumes = NATIVE_PREORDER_BY_LOCALE[countryCode];
  if (!Array.isArray(preorderVolumes)) return false;
  return preorderVolumes.includes(volumeNumber);
};
