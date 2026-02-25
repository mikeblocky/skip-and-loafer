/* Chapters data - each chapter has EN (weebdex) and JP (comic-days) links */
/* JP links are arrays to support multi-part chapters */

/** Generate page paths: mangaPages('56.5', 6) → ['/manga/ch-56.5/0.jpg', …, '/manga/ch-56.5/5.jpg'] */
export const mangaPages = (ch, count) =>
    Array.from({ length: count }, (_, i) => `/manga/ch-${ch}/${i}.jpg`);

export const VOLUMES = [
    { number: 1, title: 'Volume 1', cover: '/volumes/1.jpg', chapters: [1, 2, 3, 4, 5], anime: 'Season 1' },
    { number: 2, title: 'Volume 2', cover: '/volumes/2.jpg', chapters: [6, 7, 8, 9, 10, 11, 11.5], anime: 'Season 1' },
    { number: 3, title: 'Volume 3', cover: '/volumes/3.jpg', chapters: [12, 13, 14, 15, 16, 17], anime: 'Season 1' },
    { number: 4, title: 'Volume 4', cover: '/volumes/4.jpg', chapters: [18, 19, 20, 21, 22, 23, 23.5], anime: 'Season 1' },
    { number: 5, title: 'Volume 5', cover: '/volumes/5.jpg', chapters: [24, 25, 26, 27, 28, 29] },
    { number: 6, title: 'Volume 6', cover: '/volumes/6.jpg', chapters: [30, 31, 32, 33, 34, 35, 35.5] },
    { number: 7, title: 'Volume 7', cover: '/volumes/7.jpg', chapters: [36, 37, 38, 39, 40, 41, 41.5] },
    { number: 8, title: 'Volume 8', cover: '/volumes/8.jpg', chapters: [42, 43, 44, 45, 46, 47, 47.5] },
    { number: 9, title: 'Volume 9', cover: '/volumes/9.jpg', chapters: [48, 49, 50, 51, 52, 53, 53.1, 53.2, 53.5] },
    { number: 10, title: 'Volume 10', cover: '/volumes/10.jpg', chapters: [54, 55, 56, 56.5, 57, 58, 59] },
    { number: 11, title: 'Volume 11', cover: '/volumes/11.jpg', chapters: [60, 61, 62, 63, 64, 65] },
    { number: 12, title: 'Volume 12', cover: '/volumes/12.jpg', chapters: [66, 67, 68, 69, 70, 71, 72] },
    { number: 13, title: 'Volume 13', cover: null, chapters: [73, 74, 75, 76, 77, 78], inProgress: true },
];

export const CHAPTERS = [
    // ── Volume 1 ──
    {
        number: 1, title: 'Sparkling High School Student', thumbnail: null,
        pages: mangaPages('1', 60),
        links: {
            en: 'https://weebdex.org/chapter/dxw1pamv3d',
            jp: ['https://comic-days.com/episode/10834108156642600786']
        }
    },
    {
        number: 2, title: 'Fidget Fidget Karaoke Box', thumbnail: null, 
        pages: mangaPages('2', 50),
        links: {
            en: 'https://weebdex.org/chapter/anu39mu1t0',
            jp: ['https://comic-days.com/episode/10834108156642601520']
        }
    },
    {
        number: 3, title: 'Restless Club Activities', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/45oog1u7jw',
            jp: ['https://comic-days.com/episode/10834108156642602112']
        }
    },
    {
        number: 4, title: 'Fluffy Student Council', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/c8c8ks9sfg',
            jp: ['https://comic-days.com/episode/10834108156642602366']
        }
    },
    {
        number: 5, title: '"Cracklin\'" Movie Theatre', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/gmp3g7hguk',
            jp: ['https://comic-days.com/episode/10834108156642602694']
        }
    },

    // ── Volume 2 ──
    {
        number: 6, title: 'Tingling Friendship', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/qrk1d81qao',
            jp: ['https://comic-days.com/episode/10834108156668590062']
        }
    },
    {
        number: 7, title: 'Clickclopping Schedule', thumbnail: null, links: {
            en: 'https://weebdex.org/group/qiz143gv1a',
            jp: ['https://comic-days.com/episode/10834108156668590208']
        }
    },
    {
        number: 8, title: 'Prickling Private Training', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/bd5r56jwam',
            jp: ['https://comic-days.com/episode/10834108156668590479']
        }
    },
    {
        number: 9, title: 'Cheerful Class Match', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/8jc9kqbto5',
            jp: ['https://comic-days.com/episode/10834108156668590742']
        }
    },
    {
        number: 10, title: 'Start of the Damp Rainy Season', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/py43ru5icu',
            jp: ['https://comic-days.com/episode/10834108156668591026']
        }
    },
    {
        number: 11, title: 'Flick Flickering End of the Rainy Season', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/mua4nbeo5z',
            jp: ['https://comic-days.com/episode/10834108156668591282']
        }
    },
    {
        number: 11.5, title: 'Volume 2 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/y6skrfriw4', jp: []
        }
    },

    // ── Volume 3 ──
    {
        number: 12, title: 'Flip Flapping Student Council Election', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/3v2k961y6w',
            jp: ['https://comic-days.com/episode/10834108156674222779']
        }
    },
    {
        number: 13, title: 'Mad Dash for Popularity Before Summer Break', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/wyktih7a17',
            jp: ['https://comic-days.com/episode/10834108156681817600']
        }
    },
    {
        number: 14, title: 'Blistering Hot Zoo', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/uepu2xctha',
            jp: ['https://comic-days.com/episode/10834108156689695263']
        }
    },
    {
        number: 15, title: 'Our Varied Summer Break Experience', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/crkllf3idv',
            jp: ['https://comic-days.com/episode/10834108156702932647', 'https://comic-days.com/episode/10834108156702932652']
        }
    },
    {
        number: 16, title: 'Drowsy Homecoming', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/rmlc8o0adr',
            jp: ['https://comic-days.com/episode/10834108156714563671', 'https://comic-days.com/episode/10834108156714563676']
        }
    },
    {
        number: 17, title: 'Euphoric End to the Summer Break', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/xmevmfd26x',
            jp: ['https://comic-days.com/episode/10834108156728426240', 'https://comic-days.com/episode/10834108156728426249']
        }
    },

    // ── Volume 4 ──
    {
        number: 18, title: 'Bustling Culture Festival Preparations', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/obgwywr3nr',
            jp: ['https://comic-days.com/episode/10834108156763050102', 'https://comic-days.com/episode/10834108156763050107']
        }
    },
    {
        number: 19, title: 'Tearful Dance', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/qp9qs5hb9k',
            jp: ['https://comic-days.com/episode/13933686331610221120', 'https://comic-days.com/episode/13933686331610221127']
        }
    },
    {
        number: 20, title: 'Boisterous Culture Festival, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/lycm47wlg9',
            jp: ['https://comic-days.com/episode/13933686331628939870', 'https://comic-days.com/episode/13933686331628939875']
        }
    },
    {
        number: 21, title: 'Boisterous Culture Festival, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/3oboxz0u7m',
            jp: ['https://comic-days.com/episode/13933686331653168562', 'https://comic-days.com/episode/13933686331653168567']
        }
    },
    {
        number: 22, title: 'Boisterous Culture Festival, Part 3', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/31in93gf7f',
            jp: ['https://comic-days.com/episode/13933686331668847505', 'https://comic-days.com/episode/13933686331668847512']
        }
    },
    {
        number: 23, title: 'Boisterous Culture Festival, Part 4', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/liycw08f6f',
            jp: ['https://comic-days.com/episode/13933686331682350450', 'https://comic-days.com/episode/13933686331682350455']
        }
    },
    {
        number: 23.5, title: 'Volume 4 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/exj2949wwn', jp: []
        }
    },

    // ── Volume 5 ──
    {
        number: 24, title: 'Anxious Adolescence', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/v3bjlasz1u',
            jp: ['https://comic-days.com/episode/13933686331697683930', 'https://comic-days.com/episode/13933686331697683935']
        }
    },
    {
        number: 25, title: 'A Whirlwind First Love?', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/x8eywtcfye',
            jp: ['https://comic-days.com/episode/13933686331711040301', 'https://comic-days.com/episode/13933686331711040306']
        }
    },
    {
        number: 26, title: 'Heartache Girls, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/msc5ihd40e',
            jp: ['https://comic-days.com/episode/13933686331724591150', 'https://comic-days.com/episode/13933686331724591155']
        }
    },
    {
        number: 27, title: 'Heartache Girls, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/g7pe68r2p6',
            jp: ['https://comic-days.com/episode/13933686331768729177', 'https://comic-days.com/episode/13933686331768729192']
        }
    },
    {
        number: 28, title: 'A Jingling Christmas', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/hz41tg4yc6',
            jp: ['https://comic-days.com/episode/13933686331799849305', 'https://comic-days.com/episode/13933686331799849308']
        }
    },
    {
        number: 29, title: 'A Snowy New Year\'s Holiday', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/n6u9ehxb7m',
            jp: ['https://comic-days.com/episode/3269632237261316422', 'https://comic-days.com/episode/3269632237261316428']
        }
    },

    // ── Volume 6 ──
    {
        number: 30, title: 'A Heart-Pounding Valentine\'s, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/pmw724f10z',
            jp: ['https://comic-days.com/episode/3269632237294758127', 'https://comic-days.com/episode/3269632237294757482']
        }
    },
    {
        number: 31, title: 'A Heart-Pounding Valentine\'s, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/hnxfjxv8cn',
            jp: ['https://comic-days.com/episode/3269632237330828584', 'https://comic-days.com/episode/3269632237330828587']
        }
    },
    {
        number: 32, title: 'Snipping Sixteen', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/10dp1zxtqj',
            jp: ['https://comic-days.com/episode/3269754496323930381', 'https://comic-days.com/episode/3269754496323930386']
        }
    },
    {
        number: 33, title: 'Happy Hotcakes', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/gp1ny9s0xv',
            jp: ['https://comic-days.com/episode/3269754496368929302', 'https://comic-days.com/episode/3269754496368929307']
        }
    },
    {
        number: 34, title: 'Lovey-Dovey Ambitions', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/8m8cgeucw4',
            jp: ['https://comic-days.com/episode/3269754496406934387', 'https://comic-days.com/episode/3269754496406934394']
        }
    },
    {
        number: 35, title: 'Fluttering Grade Change', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/2sj8f74nz5',
            jp: ['https://comic-days.com/episode/3269754496455961015', 'https://comic-days.com/episode/3269754496455961024']
        }
    },
    {
        number: 35.5, title: 'Side Stories', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/kyytrrzvtg',
            jp: ['https://comic-days.com/episode/3269754496509982293']
        }
    },

    // ── Volume 7 ──
    {
        number: 36, title: 'Shining Second Year', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/7t39nvy29l',
            jp: ['https://comic-days.com/episode/3269754496608520550', 'https://comic-days.com/episode/3269754496608520264']
        }
    },
    {
        number: 37, title: 'Rowdy Kouhai', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/op5vut95n6',
            jp: ['https://comic-days.com/episode/3269754496662918439', 'https://comic-days.com/episode/3269754496662918445']
        }
    },
    {
        number: 38, title: 'Cloudy New Class', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/4awg3u6qbs',
            jp: ['https://comic-days.com/episode/3269754496711763364', 'https://comic-days.com/episode/3269754496711763369']
        }
    },
    {
        number: 39, title: 'Chatty Stroll Home', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/iyscowc04o',
            jp: ['https://comic-days.com/episode/3269754496770608140', 'https://comic-days.com/episode/3269754496770608145']
        }
    },
    {
        number: 40, title: 'Bumpy Mountain Climbing', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/fbqnfk6grm',
            jp: ['https://comic-days.com/episode/3269754496818823944', 'https://comic-days.com/episode/3269754496818823954']
        }
    },
    {
        number: 41, title: 'Fluffy Spring', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/wrtvvxxqm4',
            jp: ['https://comic-days.com/episode/3269754496883832703', 'https://comic-days.com/episode/3269754496883832708']
        }
    },
    {
        number: 41.5, title: 'Volume 7 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/sepatcxtoe', jp: []
        }
    },

    // ── Volume 8 ──
    {
        number: 42, title: 'Flustered Dating?', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/cx7901fb1x',
            jp: ['https://comic-days.com/episode/3270296674425333928', 'https://comic-days.com/episode/3270296674425333933']
        }
    },
    {
        number: 43, title: 'Mixed Feelings', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/268zhgy8yw',
            jp: ['https://comic-days.com/episode/3270375685361073151', 'https://comic-days.com/episode/3270375685361073164']
        }
    },
    {
        number: 44, title: 'Crumpled Heart', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/v6l257iwyd',
            jp: ['https://comic-days.com/episode/3270375685439722475', 'https://comic-days.com/episode/3270375685439722483']
        }
    },
    {
        number: 45, title: 'Noisy New Student Council President', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/e6m8uk68ox',
            jp: ['https://comic-days.com/episode/316112896863019858', 'https://comic-days.com/episode/316112896863019865']
        }
    },
    {
        number: 46, title: 'Warm Picnic', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/awl6rnbc5h',
            jp: ['https://comic-days.com/episode/316112896952050654', 'https://comic-days.com/episode/316112896952050662']
        }
    },
    {
        number: 47, title: 'Sprinkling Rain', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/dwsls8qps2',
            jp: ['https://comic-days.com/episode/316190246979986224', 'https://comic-days.com/episode/316190246979986231']
        }
    },
    {
        number: 47.5, title: 'Volume 8 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/herjfm4ccu', jp: []
        }
    },

    // ── Volume 9 ──
    {
        number: 48, title: 'Roly-Poly Unrequited Love', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/4hpxhk05gh',
            jp: ['https://comic-days.com/episode/316190247042279870', 'https://comic-days.com/episode/316190247042279880']
        }
    },
    {
        number: 49, title: 'Exciting Travel Plans', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/zr37o6w4k1',
            jp: ['https://comic-days.com/episode/316190247118283881', 'https://comic-days.com/episode/316190247118283893']
        }
    },
    {
        number: 50, title: 'Awkward School Day', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/f9e0j4kqh4',
            jp: ['https://comic-days.com/episode/4856001361071324274', 'https://comic-days.com/episode/4856001361071324279']
        }
    },
    {
        number: 51, title: 'Heart-Thumping Ocean, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/e0y262erv8',
            jp: ['https://comic-days.com/episode/4856001361160184122', 'https://comic-days.com/episode/4856001361160184140']
        }
    },
    {
        number: 52, title: 'Heart-Thumping Ocean, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/d9ww8z4fgz',
            jp: ['https://comic-days.com/episode/4856001361259614168', 'https://comic-days.com/episode/4856001361259614177']
        }
    },
    {
        number: 53, title: 'Heart-Thumping Ocean, Part 3', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/tgqas9jtou',
            jp: ['https://comic-days.com/episode/4856001361358252154', 'https://comic-days.com/episode/4856001361358252159']
        }
    },
    {
        number: 53.1, title: 'Blu-ray 1 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/ienw1ff0ut', jp: []
        }
    },
    {
        number: 53.2, title: 'Blu-ray 2 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/jh81af2mtt', jp: []
        }
    },
    {
        number: 53.5, title: 'Volume 9 Extras', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/9fcgccjhgd', jp: []
        }
    },

    // ── Volume 10 ──
    {
        number: 54, title: 'Heart-Thumping Ocean, Part 4', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/atn97crl1e',
            jp: ['https://comic-days.com/episode/14079602755121009418', 'https://comic-days.com/episode/14079602755121009426']
        }
    },
    {
        number: 55, title: 'Heart-Thumping Ocean, Part 5', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/7539fu5jde',
            jp: ['https://comic-days.com/episode/14079602755228055583', 'https://comic-days.com/episode/14079602755228055588']
        }
    },
    {
        number: 56, title: 'Weary Road Home', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/sevvt0a7wm',
            jp: ['https://comic-days.com/episode/14079602755350262708', 'https://comic-days.com/episode/14079602755350262715']
        }
    },
    {
        number: 56.5, title: 'Extra Scenes', thumbnail: null,
        pages: mangaPages('56.5', 6),
        links: {
            en: 'https://weebdex.org/chapter/xakpxgq6km',
            jp: ['https://comic-days.com/episode/14079602755480613581']
        }
    },
    {
        number: 57, title: 'Fluffy School Day', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/gdiswhkekn',
            jp: ['https://comic-days.com/episode/14079602755589254213', 'https://comic-days.com/episode/14079602755589254218']
        }
    },
    {
        number: 58, title: 'Blazing Future, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/ukoxxp5582',
            jp: ['https://comic-days.com/episode/10044607041231571992', 'https://comic-days.com/episode/10044607041231572001']
        }
    },
    {
        number: 59, title: 'Blazing Future, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/0dj6mxjjso',
            jp: ['https://comic-days.com/episode/2550668105999738799', 'https://comic-days.com/episode/2550668105999738804']
        }
    },

    // ── Volume 11 ──
    {
        number: 60, title: 'Mumbled Words', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/lmb6hlpasq',
            jp: ['https://comic-days.com/episode/2550689798326775721', 'https://comic-days.com/episode/2550689798326775726']
        }
    },
    {
        number: 61, title: 'Maddening District Competition', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/vis68c66jk',
            jp: ['https://comic-days.com/episode/2550689798731966132', 'https://comic-days.com/episode/2550689798731966135']
        }
    },
    {
        number: 62, title: 'Cuddly Shopping Trip', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/ssld3mzzj6',
            jp: ['https://comic-days.com/episode/2550689798870505287', 'https://comic-days.com/episode/2550689798870505292']
        }
    },
    {
        number: 63, title: 'Steady School Trip, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/pg78zdv6xe',
            jp: ['https://comic-days.com/episode/2550912964508240630', 'https://comic-days.com/episode/2550912964508240635']
        }
    },
    {
        number: 64, title: 'Steady School Trip, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/3mbzcsu4x0',
            jp: ['https://comic-days.com/episode/2550912964646763116', 'https://comic-days.com/episode/2550912964646763123']
        }
    },
    {
        number: 65, title: 'Steady School Trip, Part 3', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/qba2cs4tqc',
            jp: ['https://comic-days.com/episode/2550912964789944228', 'https://comic-days.com/episode/2550912964789944234']
        }
    },

    // ── Volume 12 ──
    {
        number: 66, title: 'Steady School Trip, Part 4', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/l0mth9dgor',
            jp: ['https://comic-days.com/episode/2550912965035136193', 'https://comic-days.com/episode/2550912965035136200']
        }
    },
    {
        number: 67, title: 'Gritty Memories', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/t5zog8olc6',
            jp: ['https://comic-days.com/episode/2550912965173786337', 'https://comic-days.com/episode/2550912965173786345']
        }
    },
    {
        number: 68, title: 'Flickering Stage', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/8x44tij7m7',
            jp: ['https://comic-days.com/episode/2550912965311933687', 'https://comic-days.com/episode/2550912965311933692']
        }
    },
    {
        number: 69, title: 'Hectic Family Trip', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/9g6tvscl6r',
            jp: ['https://comic-days.com/episode/2550912965441924780', 'https://comic-days.com/episode/2550912965441924791']
        }
    },
    {
        number: 70, title: 'Flustered Culture Festival, Part 1', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/y1v8sejvtg',
            jp: ['https://comic-days.com/episode/2550912965593342631', 'https://comic-days.com/episode/2550912965593342637']
        }
    },
    {
        number: 71, title: 'Flustered Culture Festival, Part 2', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/5p0s6f7m34',
            jp: ['https://comic-days.com/episode/2550912965726057446', 'https://comic-days.com/episode/2550912965726057454']
        }
    },
    {
        number: 72, title: 'Flustered Culture Festival, Part 3', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/fufbcwmecm',
            jp: ['https://comic-days.com/episode/2550912965862280006', 'https://comic-days.com/episode/2550912965862280016']
        }
    },

    // ── Volume 13 (in-progress) ──
    {
        number: 73, title: 'Flustered Culture Festival, Part 4', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/gv0u4y4tqj',
            jp: ['https://comic-days.com/episode/2551460909479801204', 'https://comic-days.com/episode/2551460909479801213']
        }
    },
    {
        number: 74, title: 'Chatty Wrap Parties', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/2e0d19bstr',
            jp: ['https://comic-days.com/episode/2551460909604985710', 'https://comic-days.com/episode/2551460909604985719']
        }
    },
    {
        number: 75, title: 'Snipping Hair Salon', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/wcr3kok7ok',
            jp: ['https://comic-days.com/episode/2551460909729059490', 'https://comic-days.com/episode/2551460909729059495']
        }
    },
    {
        number: 76, title: 'Unsteady Detour', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/kr6ngz4jgr',
            jp: ['https://comic-days.com/episode/2551460909956871151', 'https://comic-days.com/episode/2551460909956871160']
        }
    },
    {
        number: 77, title: 'A Distressed Christmas Eve', thumbnail: null, links: {
            en: 'https://weebdex.org/chapter/bg0v5e8r4h',
            jp: ['https://comic-days.com/episode/2551460910063177187', 'https://comic-days.com/episode/2551460910063177193']
        }
    },
    {
        number: 78, title: 'A Steamy First Shrine Visit', thumbnail: null, latest: true,
        links: {
            en: null,
            jp: ['https://comic-days.com/episode/12207421983406221656', 'https://comic-days.com/episode/12207421983406221664']
        }
    },
    {
        number: 79, title: 'On Break — Returns in April', thumbnail: null,
        links: { en: null, jp: [] }
    },
];
