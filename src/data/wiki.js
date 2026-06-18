export const WIKI_SECTIONS = [
  {
    id: 'characters',
    title: 'Characters',
    description: 'Meet the central cast, their personal goals, and the relationships that push the story forward.',
    accent: '#2563eb',
    border: '#93c5fd',
    surface: '#eff6ff',
    image: '/portrait/mitsumi.png',
    entries: [
      {
        id: 'mitsumi-iwakura',
        title: 'Mitsumi Iwakura',
        shortTitle: 'Mitsumi',
        description: 'A bright first-year from rural Ishikawa whose sincerity steadily changes the people around her.',
        image: '/portrait/mitsumi.png',
        infobox: {
          title: 'Mitsumi Iwakura',
          subtitle: 'Main protagonist',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Main protagonist' },
            { label: 'Home', value: 'Suzu, Ishikawa Prefecture' },
            { label: 'Goal', value: 'Study in Tokyo, become a civil servant, and help her hometown thrive' },
            { label: 'Known for', value: 'Earnest honesty, meticulous planning, and complete subway chaos' },
            { label: 'Close ties', value: 'Sousuke Shima, Nao, Fumi, Makoto, Mika, Yuzuki' },
          ],
        },
        lead:
          'Mitsumi arrives in Tokyo with perfect grades, a strict life plan, and almost no urban survival instincts. What makes her memorable is not polish, but the fact that she keeps moving forward with unusual honesty.',
        sections: [
          {
            title: 'Overview',
            paragraphs: [
              'The series introduces Mitsumi as a top student from a tiny rural community in Ishikawa who enters a prestigious Tokyo high school. Her long-term dream is not vague success; she wants to gain real administrative experience and eventually support the kind of hometown she came from.',
              'That ambition gives her a grounded perspective. Even when she makes early mistakes, the story frames them as part of someone genuinely trying to grow into the future she pictured for herself.',
            ],
            subsections: [
              {
                title: 'Long-term goal',
                paragraphs: [
                  'Mitsumi is unusually concrete about what success means to her. She is not chasing prestige for its own sake; she wants skills she can eventually bring back home.',
                ],
              },
              {
                title: 'Tokyo adjustment',
                paragraphs: [
                  'Her first year works because the story lets practical daily friction matter. The city is not abstract pressure; it is trains, timing, distance, and unfamiliar social pace.',
                ],
              },
            ],
          },
          {
            title: 'Personality',
            paragraphs: [
              'Mitsumi is straightforward in a way that can feel slightly out of sync with her surroundings. She misses social cues, overprepares, says the obvious thing out loud, and still manages to come across as deeply trustworthy.',
              'The appeal of the character is that Takamatsu never treats her as a saint. Mitsumi is warm, but she is also sloppy, intense, and capable of getting overwhelmed. That mix keeps her human.',
            ],
          },
          {
            title: 'Relationships',
            paragraphs: [
              'Her bond with Shima starts with a chaotic first morning commute and becomes one of the emotional anchors of the series. At the same time, her friendships with Mika, Makoto, Yuzuki, and others show how her sincerity affects people in quieter ways.',
              'Nao and Fumi are also essential to understanding Mitsumi. Nao gives her a place to live and a sharper understanding of city life, while Fumi represents the emotional safety of home.',
            ],
            subsections: [
              {
                title: 'Friends and support',
                paragraphs: [
                  'The wider cast matters because Mitsumi changes in community, not in isolation. Her school friendships make the series feel like an ecosystem rather than a two-person plot.',
                ],
              },
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'series-overview', label: 'Series overview' },
          { categoryId: 'story', entryId: 'mitsumi-and-shima', label: 'Mitsumi and Shima' },
        ],
      },
      {
        id: 'sousuke-shima',
        title: 'Sousuke Shima',
        shortTitle: 'Shima',
        description: 'The popular boy who seems effortless on the surface and much more fragile underneath.',
        image: '/portrait/shima.png',
        infobox: {
          title: 'Sousuke Shima',
          subtitle: 'Main lead',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Classmate and central lead' },
            { label: 'Public image', value: 'Easygoing, handsome, socially fluent' },
            { label: 'Past', value: 'Former child actor with unresolved family and identity baggage' },
            { label: 'Drawn to', value: 'Mitsumi’s directness and sense of purpose' },
            { label: 'Close ties', value: 'Mitsumi, Mukai, Ririka, Chris, Kanechika' },
          ],
        },
        lead:
          'Shima begins as the polished “prince” figure of a school story, but the series gradually reveals someone who has spent years adapting himself to what other people want to see.',
        sections: [
          {
            title: 'Surface and reality',
            paragraphs: [
              'Shima is immediately treated as one of the most attractive and socially capable boys in school. He is good at smoothing over conversations, reading a room, and giving people the version of himself they expect.',
              'That social fluency is not presented as pure confidence. It comes from habit, performance, and the lingering effect of being shaped by adults and entertainment work at a young age.',
            ],
          },
          {
            title: 'Past and self-image',
            paragraphs: [
              'Character material in the repo describes a darker background: child acting, a difficult relationship with his mother, and the feeling that he was praised most when he behaved exactly as expected. That history leaves him oddly detached from his own desires.',
              'Because of that, Shima is both charismatic and emotionally stalled. He can be kind, observant, and funny, but he also struggles to imagine a clear future for himself.',
            ],
          },
          {
            title: 'Connection to Mitsumi',
            paragraphs: [
              'Mitsumi fascinates Shima because she moves in the opposite direction. She says what she means, pursues concrete goals, and keeps going even when she looks awkward doing it.',
              'Their relationship works because it is not just romance. Mitsumi offers Shima a different way to exist, while Shima offers Mitsumi understanding, gentleness, and space to grow.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'mitsumi-and-shima', label: 'Mitsumi and Shima' },
          { categoryId: 'influences', entryId: 'sekigahara-parallels', label: 'Sekigahara parallels' },
        ],
      },
      {
        id: 'nao',
        title: 'Nao',
        shortTitle: 'Nao',
        description: 'Mitsumi’s aunt, guardian in Tokyo, and one of the series’ clearest lenses on belonging.',
        image: '/portrait/nao.png',
        infobox: {
          title: 'Nao',
          subtitle: 'Guardian and stylist',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Mitsumi’s aunt and Tokyo guardian' },
            { label: 'Work', value: 'Stylist / fashion coordinator' },
            { label: 'Theme focus', value: 'Identity, safety, adulthood, and chosen belonging' },
            { label: 'Home dynamic', value: 'Feels settled in Tokyo but carries painful memories of her hometown' },
            { label: 'Importance', value: 'Gives the story one of its most mature emotional perspectives' },
          ],
        },
        lead:
          'Nao is not only the adult who helps Mitsumi live in Tokyo. She is also one of the characters who expands the series beyond school life and into questions of identity, home, and the cost of being misunderstood.',
        sections: [
          {
            title: 'Role in Mitsumi’s life',
            paragraphs: [
              'Nao gives Mitsumi practical support, a home base in the city, and a calm presence when Tokyo feels too large. She also helps Mitsumi navigate fashion and presentation in a way that never feels superficial.',
              'Because she knows both affection and hardship, her advice has weight. She is not there to flatten Mitsumi’s choices, but to help her move through them with more awareness.',
            ],
          },
          {
            title: 'Identity and history',
            paragraphs: [
              'Existing character notes identify Nao as a trans woman who found far more room to live honestly in Tokyo than she ever had in her conservative hometown. That contrast is central to her character.',
              'The story does not reduce her to a single issue, but it does let that history shape how she sees place, memory, and the meaning of safety.',
            ],
          },
          {
            title: 'Why she matters',
            paragraphs: [
              'Nao deepens one of the series’ core arguments: neither city life nor rural life is presented as inherently better. What matters is whether a place allows someone to breathe, connect, and be fully seen.',
              'That makes Nao essential to the emotional architecture of Skip and Loafer, especially in arcs dealing with family, home, and self-acceptance.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'home-and-belonging', label: 'Home and belonging' },
          { categoryId: 'influences', entryId: 'takamatsu-interview', label: 'Takamatsu interview' },
        ],
      },
      {
        id: 'mika-egashira',
        title: 'Mika Egashira',
        shortTitle: 'Mika',
        description: 'A classmate defined by insecurity, pride, and gradual emotional growth.',
        image: '/portrait/mika.png',
        infobox: {
          title: 'Mika Egashira',
          subtitle: 'Classmate',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Classmate and close friend' },
            { label: 'Core tension', value: 'Wants connection but is easily hurt and defensive' },
            { label: 'Arc', value: 'Moves from jealousy and comparison toward more honest self-awareness' },
            { label: 'Close ties', value: 'Mitsumi, Mukai, Shima' },
            { label: 'Strength', value: 'Her growth is messy in a believable way' },
          ],
        },
        lead:
          'Mika is one of the characters who most clearly shows how the series treats vulnerability. She is not cruel for cruelty’s sake; she is often reacting from insecurity, embarrassment, and fear of being left behind.',
        sections: [
          {
            title: 'Early impression',
            paragraphs: [
              'At first Mika can come across as prickly and competitive, especially when she compares herself to Mitsumi or reacts to Shima’s attention. The important detail is that the series keeps her interiority visible.',
              'Her awkwardness is emotional rather than performative. She wants to be liked, wants to be chosen, and often makes herself miserable while trying to protect that wish.',
            ],
          },
          {
            title: 'Growth',
            paragraphs: [
              'Character material in the repo points to major moments around her confession to Shima and her later interactions with Mukai. Those events do not magically fix her, but they do force her to be more honest about self-worth and projection.',
              'That honesty is what makes Mika compelling. She improves, backslides, learns, and keeps going.',
            ],
          },
          {
            title: 'Place in the ensemble',
            paragraphs: [
              'Mika gives the friend group friction without turning the story cynical. Her perspective introduces envy, romantic confusion, and the ordinary pain of adolescence in a way that broadens the cast.',
              'She is one of the clearest examples of the series refusing to sort people into “good girl” and “bad girl” categories.',
            ],
          },
        ],
      },
      {
        id: 'yuzuki-murashige',
        title: 'Yuzuki Murashige',
        shortTitle: 'Yuzuki',
        description: 'A glamorous classmate whose cool image hides a deliberate attempt to avoid old social wounds.',
        image: '/portrait/yuzuki.png',
        infobox: {
          title: 'Yuzuki Murashige',
          subtitle: 'Classmate',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Classmate and friend' },
            { label: 'Public image', value: 'Beautiful, composed, and slightly distant' },
            { label: 'Reality', value: 'Easygoing, thoughtful, and intentionally guarded' },
            { label: 'Background', value: 'Lived overseas when younger and transferred to reset difficult school dynamics' },
            { label: 'Theme focus', value: 'Image, popularity, and self-protection' },
          ],
        },
        lead:
          'Yuzuki looks like someone who should float through school untouched, but her wiki entry is really about the work of building a safer self-presentation after being hurt by social expectations.',
        sections: [
          {
            title: 'Appearance versus personality',
            paragraphs: [
              'The repo notes describe Yuzuki as one of the most visibly beautiful girls in school, but they also stress how much of her “cool” aura is constructed. She is more relaxed and open than that first impression suggests.',
              'That split between image and reality makes her fit neatly into one of the series’ recurring interests: how teenagers manage the version of themselves other people consume.',
            ],
          },
          {
            title: 'Backstory',
            paragraphs: [
              'Yuzuki changed schools partly to escape the kind of social trouble that came from unwanted attention and shifting group dynamics. Her guarded image is less vanity than strategy.',
              'The result is a character who understands how attraction and reputation can distort ordinary friendships, even when she wishes things were simpler.',
            ],
          },
          {
            title: 'Role in the group',
            paragraphs: [
              'Yuzuki adds poise and warmth to the cast at the same time. She notices people, reads social tone quickly, and still ends up showing plenty of uncertainty when she is isolated or misread.',
              'That balance makes her feel polished without ever feeling flat.',
            ],
          },
        ],
      },
      {
        id: 'makoto',
        title: 'Makoto',
        shortTitle: 'Makoto',
        description: 'A shy literary classmate whose anxious inner voice hides an understated reliability.',
        image: '/portrait/makoto.png',
        infobox: {
          title: 'Makoto',
          subtitle: 'Classmate',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Role', value: 'Classmate and friend' },
            { label: 'Personality', value: 'Timid, negative, observant, quietly kind' },
            { label: 'Function in the cast', value: 'Provides introspection and emotional steadiness' },
            { label: 'Close ties', value: 'Mitsumi, Mika, Yuzuki' },
            { label: 'Theme focus', value: 'Anxiety, friendship, and comfort found in small circles' },
          ],
        },
        lead:
          'Makoto is one of the quieter members of the cast, but that quietness is productive. She helps the series show how friendship grows for people who are not naturally bold, stylish, or socially fast.',
        sections: [
          {
            title: 'Temperament',
            paragraphs: [
              'Character notes in the repo describe Makoto as a classic timid, literary girl with an intensely negative thinking loop. Skip and Loafer treats that gently rather than mockingly.',
              'Her caution often makes her seem fragile, but she repeatedly proves dependable when the people around her need softness instead of force.',
            ],
          },
          {
            title: 'Friendship',
            paragraphs: [
              'Makoto becomes part of Mitsumi’s growing circle almost by accident, which fits the tone of the series. The friendship matters because it does not depend on dramatic declarations; it forms through repeated ordinary kindness.',
              'As the group changes year to year, Makoto remains one of the people who makes that social world feel livable.',
            ],
          },
          {
            title: 'Narrative role',
            paragraphs: [
              'Makoto broadens the emotional register of the cast. Without her, the story would lean more heavily toward extroverted energy and romantic tension.',
              'With her, the series keeps room for shyness, hesitation, and the kind of support that only becomes visible when someone is already falling apart.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'story',
    title: 'Overview',
    description: 'Reference pages for the series premise, themes, manga release history, anime production, and adaptation context.',
    accent: '#ea580c',
    border: '#fdba74',
    surface: '#fff7ed',
    image: '/opengraph-image.jpg',
    entries: [
      {
        id: 'series-overview',
        title: 'Series Overview',
        shortTitle: 'Overview',
        description: 'A reference entry for what the series is, how it began, and how it expanded across manga, anime, and stage adaptations.',
        image: '/opengraph-image.jpg',
        searchAliases: ['Skip and Loafer', 'スキップとローファー', 'series', 'overview'],
        infobox: {
          title: 'Skip and Loafer',
          subtitle: 'Manga and adaptation overview',
          caption: 'Existing promotional art used as a temporary wiki visual.',
          facts: [
            { label: 'Creator', value: 'Misaki Takamatsu' },
            { label: 'Serialization', value: 'Monthly Afternoon (Kodansha), since August 25, 2018' },
            { label: 'Circulation', value: 'Over 4.2 million copies in Japan across print and digital, as of March 2026' },
            { label: 'Major awards', value: 'Manga Taisho 2020 third place; 47th Kodansha Manga Award general category in May 2023' },
            { label: 'Adaptation status', value: 'TV anime season 1 aired from April 4, 2023 to June 20, 2023; season 2 announced on December 20, 2024' },
          ],
        },
        lead:
          'The overview source in this project frames Skip and Loafer as a manga that grew from a precise school-life story into a broader media series without losing its focus on ordinary emotion, gradual change, and social nuance.',
        sections: [
          {
            title: 'What the series is',
            paragraphs: [
              'Skip and Loafer starts from a clear premise: Mitsumi Iwakura leaves a small community in Ishikawa and enters a prestigious Tokyo high school, carrying both extreme competence and very limited city instincts. The series uses that move to open out into friendship, romance, identity, and belonging.',
              'What gives the work its staying power is scale. The source material tracks classroom life, changing friend groups, family context, and emotional misunderstandings with unusual patience instead of forcing everything into a simple romantic line.',
            ],
            subsections: [
              {
                title: 'Publication base',
                paragraphs: [
                  'The source overview identifies the manga as a Monthly Afternoon serialization published by Kodansha, with collected volumes continuing through volume 12 on August 22, 2025 and volume 13 announced in the surrounding magazine material.',
                ],
              },
            ],
          },
          {
            title: 'Recognition and reach',
            paragraphs: [
              'The overview source ties the series to both critical and commercial momentum. It notes more than 4.2 million copies in circulation in Japan across print and digital formats by March 2026, alongside major recognition such as a top-three Manga Taisho finish and a Kodansha Manga Award win.',
              'It also lists a broad overseas publishing footprint, which helps explain why the series reads as both specifically local and widely approachable. The school setting is Japanese, but the emotional architecture travels cleanly.',
            ],
            subsections: [
              {
                title: 'Why the premise scales up',
                paragraphs: [
                  'Because the cast is written as an ensemble instead of a two-person machine, the series can expand into anime, interviews, collaborations, and even stage adaptation without the core premise feeling thin.',
                ],
              },
            ],
          },
          {
            title: 'Adaptations',
            paragraphs: [
              'The same source file records a first television anime season that ran from April 4, 2023 to June 20, 2023, a second season announcement on December 20, 2024, and a stage musical that ran in Tokyo and Osaka from March 6 to March 22, 2026.',
              'That expansion matters because it shows how the series now functions as more than a single manga title. There is enough material around publication, staff, music, and spinout presentation to support a fuller reference section inside this wiki.',
            ],
            subsections: [
              {
                title: 'Useful follow-up pages',
                paragraphs: [
                  'For volume-by-volume ISBN data, anime broadcast information, production staff, location models, and the stage version, continue through the other pages in this Overview category.',
                ],
              },
            ],
          },
        ],
        related: [
          { categoryId: 'characters', entryId: 'mitsumi-iwakura', label: 'Mitsumi Iwakura' },
          { categoryId: 'story', entryId: 'manga', label: 'Manga' },
          { categoryId: 'story', entryId: 'anime', label: 'Anime' },
        ],
      },
      {
        id: 'manga',
        title: 'Manga',
        shortTitle: 'Manga',
        description: 'Publication history, collected volumes, awards, and the continuing print life of the original manga.',
        image: '/opengraph-image.jpg',
        searchAliases: ['manga', 'publication', 'serialization', '書誌情報', '月刊アフタヌーン'],
        infobox: {
          title: 'Skip and Loafer (Manga)',
          subtitle: 'Original serialized work',
          caption: 'Existing promotional art used as a temporary reference image.',
          facts: [
            { label: 'Creator', value: 'Misaki Takamatsu' },
            { label: 'Publisher', value: 'Kodansha' },
            { label: 'Magazine', value: 'Monthly Afternoon' },
            { label: 'Start date', value: 'August 25, 2018' },
            { label: 'Volumes listed in source', value: '12 volumes as of August 22, 2025' },
          ],
        },
        lead:
          'The original manga remains the center of the series. The source overview places it in Monthly Afternoon, traces the collected-volume line through twelve books, and presents it as the base from which every later adaptation grows.',
        sections: [
          {
            title: 'Serialization and format',
            paragraphs: [
              'Skip and Loafer is listed in the source file as a Kodansha manga by Misaki Takamatsu serialized in Monthly Afternoon. That placement matters because the work reads with a strong character-drama rhythm while still benefiting from a long-form magazine structure that can support a wide ensemble.',
              'The series began publication on August 25, 2018, and the file still treats it as ongoing. That long runway helps explain the gradual pacing of relationships, school years, and emotional shifts.',
            ],
          },
          {
            title: 'Recognition',
            paragraphs: [
              'The same source notes two major milestones: third place in Manga Taisho 2020 and the 47th Kodansha Manga Award general-category win in May 2023. Those markers position the series as both critically respected and increasingly mainstream.',
              'It also records circulation above 4.2 million copies in Japan across print and digital formats by March 2026, showing that the series kept growing well after the anime aired.',
            ],
          },
          {
            title: 'International footprint',
            paragraphs: [
              'The infobox in the compiled notes lists multiple international publishers, including Seven Seas in English-language territories and additional publishers across Latin America, Europe, Korea, Taiwan, Hong Kong, and Thailand.',
              'That breadth turns the manga page into more than a publication log. It shows how the title moved from a strong domestic serial to a work with stable international reach.',
            ],
            subsections: [
              {
                title: 'Where to see the full release table',
                paragraphs: [
                  'For the volume-by-volume dates and ISBN entries pulled from the bibliography block in the compiled notes, open the Manga Releases page in this same category.',
                ],
              },
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'manga-releases', label: 'Manga releases' },
          { categoryId: 'story', entryId: 'anime', label: 'Anime' },
        ],
      },
      {
        id: 'manga-releases',
        title: 'Manga Releases',
        shortTitle: 'Manga releases',
        description: 'Volume-by-volume release dates and ISBN data taken from the bibliography listing in the compiled notes.',
        image: '/opengraph-image.jpg',
        searchAliases: ['isbn', 'manga releases', 'volumes', 'book list', '書誌情報'],
        infobox: {
          title: 'Manga Releases',
          subtitle: 'Bibliography and ISBN guide',
          caption: 'Existing promotional art used as a temporary release-guide image.',
          facts: [
            { label: 'Coverage', value: 'Volume 1 through volume 12, plus the volume 10 support edition' },
            { label: 'Date range', value: 'January 23, 2019 to August 22, 2025' },
            { label: 'Primary source', value: 'compiled bibliography notes' },
            { label: 'Special note', value: 'Volume 10 has a Noto Peninsula Earthquake support edition with its own ISBN' },
          ],
        },
        lead:
          'This page turns the bibliography block in the compiled notes into a cleaner reference page. It is for checking which volume released when and which ISBN is attached to each listed edition.',
        sections: [
          {
            title: 'Collected volume list',
            paragraphs: [
              'The source file lists the collected volumes in order, with a publication date and ISBN for each release. That makes this page useful as a compact publication reference instead of a narrative summary.',
            ],
            tables: [
              {
                title: 'Volume dates and ISBN',
                columns: ['Volume', 'Release date', 'ISBN', 'Note'],
                rows: [
                  ['1', 'January 23, 2019', '978-4-06-514209-7', 'First collected volume'],
                  ['2', 'July 23, 2019', '978-4-06-516300-9', 'Standard edition'],
                  ['3', 'February 21, 2020', '978-4-06-518471-4', 'Standard edition'],
                  ['4', 'August 21, 2020', '978-4-06-520539-6', 'Standard edition'],
                  ['5', 'March 23, 2021', '978-4-06-522497-7', 'Standard edition'],
                  ['6', 'November 22, 2021', '978-4-06-525779-1', 'Standard edition'],
                  ['7', 'June 22, 2022', '978-4-06-528147-5', 'Standard edition'],
                  ['8', 'January 23, 2023', '978-4-06-530267-5', 'Standard edition'],
                  ['9', 'August 23, 2023', '978-4-06-532642-8', 'Standard edition'],
                  ['10', 'March 22, 2024', '978-4-06-534851-2', 'Standard edition'],
                  ['10 Support edition', 'March 22, 2024', '978-4-06-535630-2', 'Noto Peninsula Earthquake support edition'],
                  ['11', 'December 23, 2024', '978-4-06-537722-2', 'Standard edition'],
                  ['12', 'August 22, 2025', '978-4-06-539706-0', 'Standard edition'],
                ],
              },
            ],
          },
          {
            title: 'Release cadence',
            paragraphs: [
              'The dates show a steady long-form series rather than a fast mass-release schedule. That pacing matches the manga itself, which develops characters gradually over time instead of rushing through milestones.',
              'The publication line also shows the series staying active through and after the anime period, which helps explain why adaptation interest and readership could keep compounding.',
            ],
          },
          {
            title: 'Edition notes',
            paragraphs: [
              'The standout special case in the source is the volume 10 support edition connected to the Noto Peninsula Earthquake response. It appears on the same date as the standard volume 10 release but carries its own ISBN and support framing.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'manga', label: 'Manga' },
          { categoryId: 'story', entryId: 'series-overview', label: 'Series overview' },
        ],
      },
      {
        id: 'anime',
        title: 'Anime',
        shortTitle: 'Anime',
        description: 'The TV adaptation timeline, season structure, distribution, and reception.',
        image: '/opengraph-image.jpg',
        searchAliases: ['anime', 'television anime', 'TVアニメ', '放送局', 'BD'],
        infobox: {
          title: 'Skip and Loafer (Anime)',
          subtitle: 'Television adaptation',
          caption: 'Existing promotional art used as a temporary reference image.',
          facts: [
            { label: 'Studio', value: 'P.A.WORKS' },
            { label: 'Director', value: 'Kotomi Deai' },
            { label: 'Season 1 run', value: 'April 4, 2023 to June 20, 2023' },
            { label: 'Episodes', value: '12 episodes in season 1' },
            { label: 'Current status', value: 'Season 2 announced on December 20, 2024' },
          ],
        },
        lead:
          'The anime page turns the source document’s broadcast and release material into a single reference entry. It covers when the adaptation was announced, how the first season was distributed, and how the show was received after airing.',
        sections: [
          {
            title: 'Adaptation timeline',
            paragraphs: [
              'Overview.txt says the television anime was announced in November 2021. Season 1 then aired from April 4, 2023 through June 20, 2023, which gives the adaptation a compact single-cour structure rather than a stretched launch.',
              'The same source also notes that a second season was announced on December 20, 2024. That date matters because it confirms the anime side of the franchise is still active beyond the first broadcast run.',
            ],
            tables: [
              {
                title: 'Anime timeline',
                columns: ['Milestone', 'Date', 'Note'],
                rows: [
                  ['TV anime announced', 'November 22, 2021', 'Adaptation announcement'],
                  ['Season 1 broadcast start', 'April 4, 2023', 'TOKYO MX and other outlets'],
                  ['Season 1 broadcast end', 'June 20, 2023', '12-episode first season'],
                  ['Season 2 announced', 'December 20, 2024', 'Production announcement only'],
                ],
              },
            ],
          },
          {
            title: 'Broadcast and home release',
            paragraphs: [
              'The broadcast section lists TOKYO MX as the core television outlet alongside AT-X, Hokuriku Asahi Broadcasting, BS Asahi, and Kansai TV. Streaming rollout begins with DMM TV and then widens across services such as U-NEXT, ABEMA, Netflix, Amazon Prime Video, Hulu, FOD, and others.',
              'The same source includes a simple two-volume Blu-ray release pattern: an upper set on July 26, 2023 containing episodes 1 through 6, and a lower set on August 30, 2023 containing episodes 7 through 12.',
            ],
            tables: [
              {
                title: 'Home video release',
                columns: ['Release', 'Date', 'Contents', 'Catalog number'],
                rows: [
                  ['Blu-ray Upper', 'July 26, 2023', 'Episodes 1-6', 'DMPXA-326'],
                  ['Blu-ray Lower', 'August 30, 2023', 'Episodes 7-12', 'DMPXA-327'],
                ],
              },
            ],
          },
          {
            title: 'Reception',
            paragraphs: [
              'The source file lists several reception markers after the TV run. The anime won the overseas animation prize at the 20th China Animation and Comic Competition Golden Dragon Awards, received Crunchyroll Anime Awards 2024 nominations for romance and slice-of-life categories, and ranked first at the Filmarks Anime Awards 2023.',
              'Taken together, those entries show that the adaptation was not treated as a disposable seasonal tie-in. It landed strongly with audiences and critics in multiple contexts.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'anime-episodes', label: 'Anime episodes' },
          { categoryId: 'story', entryId: 'anime-production-team', label: 'Anime production team' },
          { categoryId: 'story', entryId: 'manga', label: 'Manga' },
        ],
      },
      {
        id: 'anime-episodes',
        title: 'Anime Episodes',
        shortTitle: 'Episodes',
        description: 'An episode-by-episode reference page for the first anime season, including script, storyboard, direction, animation, and air dates.',
        image: '/blog/takamatsu-interview-news/4.jpg',
        searchAliases: ['episodes', 'episode guide', '各話リスト', 'air dates', 'storyboard', 'direction'],
        infobox: {
          title: 'Anime Episodes',
          subtitle: 'Season 1 episode guide',
          caption: 'Existing blog asset reused as a temporary episode-reference visual.',
          facts: [
            { label: 'Season covered', value: 'Season 1' },
            { label: 'Episode count', value: '12 episodes' },
            { label: 'Broadcast span', value: 'April 4, 2023 to June 20, 2023' },
            { label: 'Reference focus', value: 'Titles, scripts, boards, direction, animation credits, and first-air dates' },
            { label: 'Source section', value: 'compiled episode-list notes' },
          ],
        },
        lead:
          'This page breaks the first season into a clean episode guide. It preserves the production-side credits from the source table so readers can track not only titles and dates, but who handled scripting, boards, direction, and animation supervision on each episode.',
        sections: [
          {
            title: 'Season 1 episode list',
            paragraphs: [
              'The source table is unusually useful because it records more than broadcast order. For each episode it lists the subtitle, scriptwriter, storyboard credit, episode direction, animation direction, chief animation direction, and the original air date.',
              'That makes this page useful both for casual browsing and for readers who want to trace recurring staff involvement across the season.',
            ],
            tables: [
              {
                title: 'Season 1 episodes',
                columns: ['Episode', 'Subtitle', 'Script', 'Storyboard', 'Direction', 'Animation director', 'Chief animation director', 'First air date'],
                rows: [
                  ['Episode 1', 'Pika Pika', 'Yoko Yonaiyama', 'Kotomi Deai', 'Kotomi Deai', 'Yusuke Inoue', 'Manami Umeshita', 'April 4, 2023'],
                  ['Episode 2', 'Restless, Wandering', 'Tomoko Shinozuka', 'Yuriko Abe', 'Yuriko Abe', 'Kazuko Amano, Lee Sang Jin, Konomi Sato, Hiroaki Kawaguchi', 'Reina Igawa', 'April 11, 2023'],
                  ['Episode 3', 'Fluffy, Crackling', 'Katsuro Hidaka', 'Xu Cong', 'Akira Takamura', 'Asuka Kojima, Miku Tanaka, Sara Osae, Yu Ogasawara', 'Reina Igawa', 'April 18, 2023'],
                  ['Episode 4', 'Edgy, Tight', 'Tomoko Shinozuka', 'Ken Sanuma', 'Ken Sanuma', 'Shingo Fujisaki, Yoidore, Mami Kotoku', 'Manami Umeshita', 'April 25, 2023'],
                  ['Episode 5', 'Prickly, Busy', 'Katsuro Hidaka', 'Norihiro Naganuma', 'Yohei Fukui', 'Joji Yanase, Yusuke Inoue, Lee Sang Jin, Lee Min-bae, Sim Min-hyeon', 'Reina Igawa', 'May 2, 2023'],
                  ['Episode 6', 'Drizzle, Flicker', 'Yoko Yonaiyama', 'Toshiya Shinohara', 'Tomoko Hiramuki', 'Kazuko Amano, Asuka Kojima, Miku Tanaka, Miyuki Nakayama, Kazuya Saito, Ryo Iwasaki', 'Manami Umeshita', 'May 9, 2023'],
                  ['Episode 7', 'Fluttering, Popular', 'Katsuro Hidaka', 'Yuriko Abe', 'Mitsuyo Yokono', 'Noboru Toradaka, Miyako Nishida', 'Reina Igawa', 'May 16, 2023'],
                  ['Episode 8', 'Humid, A Lot Going On', 'Yoko Yonaiyama', 'Tomoe Yamashiro', 'Tomoe Yamashiro', 'Joji Yanase, Lee Sang Jin, Miyuki Nakayama, Suki Sato, Miku Tanaka, Miyuki Hanawa', 'Manami Umeshita', 'May 23, 2023'],
                  ['Episode 9', 'Dreamy, Lighthearted', 'Katsuro Hidaka', 'Osamu Honma', 'Osamu Honma', 'Yusuke Inoue, Sara Osae, Yu Ogasawara, Saki Tanaka, Kazuya Saito, Aya Tanaka', 'Reina Igawa', 'May 30, 2023'],
                  ['Episode 10', 'Flustered, In Tears', 'Yoko Yonaiyama', 'Katsumi Jito', 'Takanori Yano', 'Miyako Morino, Natsuna Hayashi, Kazuko Nakayama, Choi So-jeong, Joo Ok-yoon, Jiang Yong, Chen Yufeng, Zhao Ling', 'Manami Umeshita', 'June 6, 2023'],
                  ['Episode 11', 'Noisy, Buzzing', 'Katsuro Hidaka', 'Yuriko Abe', 'Yuriko Abe', 'Kazuko Amano, Lee Sang Jin, Joji Yanase, Lee Min-bae, Joo Ok-yoon', 'Reina Igawa', 'June 13, 2023'],
                  ['Episode 12', 'Sparkling', 'Yoko Yonaiyama', 'Kotomi Deai', 'Kotomi Deai', 'Yusuke Inoue, Asuka Kojima, Miku Tanaka, Nana Miura, Miyuki Nakayama, Sara Osae, Joji Yanase, Yu Ogasawara, Masami Goda, Suki Sato, Kazuya Saito', 'Manami Umeshita, Reina Igawa', 'June 20, 2023'],
                ],
              },
            ],
          },
          {
            title: 'Patterns across the season',
            paragraphs: [
              'The table shows clear continuity across the season. Yoko Yonaiyama and Katsuro Hidaka alternate as the listed scriptwriters, while Kotomi Deai returns in key positions at both the start and finish of the cour.',
              'Animation supervision also alternates between Manami Umeshita and Reina Igawa across most episodes, which gives the page a practical way to connect individual episodes back to the wider production team entry.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'anime', label: 'Anime' },
          { categoryId: 'story', entryId: 'anime-production-team', label: 'Anime production team' },
        ],
      },
      {
        id: 'anime-production-team',
        title: 'Anime Production Team',
        shortTitle: 'Production team',
        description: 'A staff-table page for the anime covering key creative roles, producers, committee members, and theme-song credits.',
        image: '/blog/takamatsu-interview-news/1.jpg',
        searchAliases: ['production team', 'anime staff', 'committee', 'スタッフ', '主題歌'],
        infobox: {
          title: 'Anime Production Team',
          subtitle: 'Staff and committee reference',
          caption: 'Existing blog asset reused as a temporary production reference visual.',
          facts: [
            { label: 'Director / series composition', value: 'Kotomi Deai' },
            { label: 'Character design', value: 'Manami Umeshita' },
            { label: 'Music', value: 'Takatsugu Wakabayashi' },
            { label: 'Animation studio', value: 'P.A.WORKS' },
            { label: 'Committee label', value: 'Skip and Loafer Production Committee' },
          ],
        },
        lead:
          'This page turns the staff-heavy parts of the compiled notes into a more direct production reference. It is for checking who handled the main creative roles, who sat on the production side, and how the anime’s music credits were structured.',
        sections: [
          {
            title: 'Main staff',
            paragraphs: [
              'The anime staff list in the compiled notes is extensive enough to justify a dedicated page. The adaptation has clear named leads across direction, design, art, sound, editing, and music, which helps explain the consistency of its tone and presentation.',
            ],
            tables: [
              {
                title: 'Core staff table',
                columns: ['Role', 'Credit'],
                rows: [
                  ['Original creator', 'Misaki Takamatsu'],
                  ['Director / series composition', 'Kotomi Deai'],
                  ['Assistant director', 'Yuriko Abe'],
                  ['Character design / chief animation director', 'Manami Umeshita'],
                  ['Chief animation director', 'Reina Igawa'],
                  ['Prop design', 'Satomi Higuchi'],
                  ['Art director', 'E-Caesar'],
                  ['Art supervision', 'Junichi Azuma'],
                  ['Art setting', 'Yuta Fujii'],
                  ['Color design', 'Yuko Kobari'],
                  ['Director of photography', 'Kazuto Demizuta'],
                  ['3D director', 'Motonari Ichikawa'],
                  ['Editor', 'Ayumu Takahashi'],
                  ['Sound director', 'Yo Yamada'],
                  ['Music', 'Takatsugu Wakabayashi'],
                  ['Animation studio', 'P.A.WORKS'],
                ],
              },
            ],
          },
          {
            title: 'Producers and committee',
            paragraphs: [
              'Overview.txt also separates staff credits from the broader production side. That matters because Skip and Loafer’s anime is clearly not a single-company project; it is a coordinated committee production with streaming, publishing, broadcasting, and music stakeholders all visible in the source.',
            ],
            tables: [
              {
                title: 'Producer block',
                columns: ['Position', 'Credit'],
                rows: [
                  ['Producers', 'Ryoko Hiraki, Yohei Ito, Nobuhiko Kurosu, Cao Cong, Yuko Matsui, Hisashi Matsumura, Masashi Aisaka'],
                  ['Animation producers', 'Mitsuhito Tsuji, Hikaru Yamamoto'],
                ],
              },
              {
                title: 'Production committee companies',
                columns: ['Company'],
                rows: [
                  ['DMM.com'],
                  ['Kodansha'],
                  ['Crunchyroll'],
                  ['NetEase Games'],
                  ['Kansai TV'],
                  ['BS Asahi'],
                  ['A-Sketch'],
                ],
              },
            ],
          },
          {
            title: 'Theme-song credits',
            paragraphs: [
              'The music section in the source does more than name the songs. It also records the performer and credit chain, which is useful if the page is being used as a lightweight production reference rather than just a fan overview.',
            ],
            tables: [
              {
                title: 'Opening and ending credits',
                columns: ['Track', 'Placement', 'Performer', 'Credits'],
                rows: [
                  ['Mellow', 'Opening', 'Keina Suda', 'Lyrics and composition by Keina Suda; arrangement by Shingo Kubota'],
                  ['Hanauta to Mawarimichi', 'Ending', 'Riko Aida', 'Lyrics by Sumiyo Mutsumi; composition and arrangement by Hayato Tanaka'],
                ],
              },
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'anime', label: 'Anime' },
          { categoryId: 'story', entryId: 'anime-episodes', label: 'Anime episodes' },
          { categoryId: 'influences', entryId: 'takamatsu-interview', label: 'Takamatsu interview' },
        ],
      },
      {
        id: 'mitsumi-and-shima',
        title: 'Mitsumi and Shima',
        shortTitle: 'Mitsumi and Shima',
        description: 'The emotional center of the series and the relationship that defines its rhythm.',
        image: '/opengraph-image.jpg',
        infobox: {
          title: 'Mitsumi and Shima',
          subtitle: 'Central relationship',
          caption: 'Existing promotional art used as a temporary wiki visual.',
          facts: [
            { label: 'Dynamic', value: 'Direct ambition meets polished uncertainty' },
            { label: 'First meeting', value: 'A chaotic commute on the day of the entrance ceremony' },
            { label: 'What matters most', value: 'Mutual recognition, not simple wish fulfillment' },
            { label: 'Why it works', value: 'The relationship keeps changing as both characters become easier to read' },
            { label: 'Influence', value: 'Partly inspired by the Mitsunari / Sakon bond in Sekigahara' },
          ],
        },
        lead:
          'The relationship between Mitsumi and Shima is compelling because the series does not trap it inside a single label. It can feel romantic, friendly, aspirational, and destabilizing at the same time.',
        sections: [
          {
            title: 'Initial contrast',
            paragraphs: [
              'Mitsumi enters the story with plans, direction, and almost aggressive honesty. Shima enters it with grace, adaptability, and a habit of editing himself for other people.',
              'Their attraction is built on that contrast, but not in a superficial “opposites attract” way. Each one exposes what the other lacks.',
            ],
          },
          {
            title: 'Growth over certainty',
            paragraphs: [
              'One of the most distinctive things about their storyline is that the series does not rush to stabilize it. Important turning points often come from uncertainty, mismatched definitions, or the realization that affection can mean different things to different people.',
              'That makes the relationship feel lived in. It is not a reward at the end of a plotline; it is an evolving space both characters struggle to understand.',
            ],
          },
          {
            title: 'Emotional significance',
            paragraphs: [
              'Mitsumi gives Shima a model of living more honestly, while Shima offers Mitsumi care, perception, and companionship in an unfamiliar world. Neither “saves” the other in a simple sense.',
              'Instead, they become more possible to themselves because the other person is there.',
            ],
          },
        ],
        related: [
          { categoryId: 'characters', entryId: 'mitsumi-iwakura', label: 'Mitsumi Iwakura' },
          { categoryId: 'characters', entryId: 'sousuke-shima', label: 'Sousuke Shima' },
        ],
      },
      {
        id: 'home-and-belonging',
        title: 'Home and Belonging',
        shortTitle: 'Home and belonging',
        description: 'How the series treats the countryside, the city, and the idea of finding a place where you can live honestly.',
        image: '/portrait/nao.png',
        infobox: {
          title: 'Home and Belonging',
          subtitle: 'Major theme',
          caption: 'Temporary portrait image from the existing character set.',
          facts: [
            { label: 'Question', value: 'Where can a person become fully themselves?' },
            { label: 'Rural side', value: 'Warmth, roots, memory, and shared community' },
            { label: 'Urban side', value: 'Possibility, anonymity, reinvention, and freedom' },
            { label: 'Key characters', value: 'Mitsumi, Nao, Fumi' },
            { label: 'Series stance', value: 'Neither city nor countryside is automatically the answer for everyone' },
          ],
        },
        lead:
          'Skip and Loafer treats place as emotional infrastructure. Home is not just where someone is from; it is where they are allowed to be understood, supported, and safe.',
        sections: [
          {
            title: 'Mitsumi’s perspective',
            paragraphs: [
              'For Mitsumi, her hometown remains a source of affection, pride, and motivation. Rural life is not framed as backward in her eyes; it is where many of her values come from.',
              'That grounding helps the story avoid turning Tokyo into the only site of growth or legitimacy.',
            ],
          },
          {
            title: 'Nao’s perspective',
            paragraphs: [
              'Nao complicates the picture. For her, Tokyo represents the possibility of stability and honest self-expression in a way her hometown never did.',
              'That contrast gives the series one of its most mature themes: the “best” place depends on whether a person can safely exist there.',
            ],
          },
          {
            title: 'Why the theme matters',
            paragraphs: [
              'Because the series holds both truths at once, it can talk about nostalgia, ambition, and identity without flattening any of them. Mitsumi can love home while still needing to leave it for a while.',
              'That is a large part of why the story feels compassionate rather than ideological.',
            ],
          },
        ],
        related: [
          { categoryId: 'characters', entryId: 'nao', label: 'Nao' },
          { categoryId: 'influences', entryId: 'takamatsu-interview', label: 'Takamatsu interview' },
        ],
      },
      {
        id: 'locations-and-models',
        title: 'Locations and Models',
        shortTitle: 'Locations',
        description: 'Real-world references behind Suzu, school imagery, and regional support ties noted in the source.',
        image: '/portrait/mitsumi.png',
        searchAliases: ['locations', 'models', '舞台・モデル', 'Suzu', 'Ishikawa'],
        infobox: {
          title: 'Locations and Models',
          subtitle: 'Setting reference',
          caption: 'Existing character art reused as a temporary setting reference visual.',
          facts: [
            { label: 'Hometown model', value: 'Mitsumi’s fictional hometown draws on Suzu and Takojima in Ishikawa' },
            { label: 'School reference', value: 'The anime ending credits acknowledge Tokyo Metropolitan Nishi High School for research cooperation' },
            { label: 'Regional tie', value: 'The series remains publicly linked to Noto and Ishikawa in later support efforts' },
            { label: 'Source section', value: 'compiled setting notes' },
          ],
        },
        lead:
          'The setting page is useful because Skip and Loafer does not treat place as generic scenery. The source document directly connects Mitsumi’s background and parts of the anime’s school imagery to real locations and institutions.',
        sections: [
          {
            title: 'Mitsumi’s hometown model',
            paragraphs: [
              'The source says Mitsumi’s fictional hometown draws on Suzu and Takojima in Ishikawa, a detail that sharpens the manga’s emotional geography. Her background is not just “somewhere rural”; it is anchored to a specific region with its own memory, texture, and vulnerability.',
              'That matters because the series keeps returning to how home shapes ambition. Mitsumi’s future plans make more sense when the hometown side of the story feels concrete instead of symbolic.',
            ],
          },
          {
            title: 'School and city references',
            paragraphs: [
              'The same section notes that while Tsubame Nishi High School is fictional, Tokyo Metropolitan Nishi High School is credited for research cooperation in the anime ending. That points to a grounded visual reference process rather than a fully abstract campus design.',
            ],
          },
          {
            title: 'Noto support context',
            paragraphs: [
              'The source also records a direct post-earthquake support connection. After the January 1, 2024 Noto Peninsula Earthquake, the Monthly Afternoon editorial side and Takamatsu donated 10 million yen to an Ishikawa relief account and later issued a support edition of volume 10.',
              'That information belongs in the wiki because it links the fictional hometown model, the real region behind it, and the public life of the series after publication.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'home-and-belonging', label: 'Home and belonging' },
          { categoryId: 'story', entryId: 'manga', label: 'Manga' },
        ],
      },
      {
        id: 'stage-musical',
        title: 'Stage Musical',
        shortTitle: 'Musical',
        description: 'The 2026 stage adaptation, venues, principal cast, and credited creative staff.',
        image: '/opengraph-image.jpg',
        searchAliases: ['musical', 'stage adaptation', 'ミュージカル', 'theater'],
        infobox: {
          title: 'Musical "Skip and Loafer"',
          subtitle: 'Stage adaptation',
          caption: 'Existing promotional art reused as a temporary stage-adaptation reference image.',
          facts: [
            { label: 'Tokyo run', value: 'March 6 to March 15, 2026 at Theater H' },
            { label: 'Osaka run', value: 'March 20 to March 22, 2026 at Umeda Arts Theater Dramacity' },
            { label: 'Script / lyrics', value: 'Ako Takahashi' },
            { label: 'Direction / choreography', value: 'TETSUHARU' },
            { label: 'Music', value: 'Shu Kanematsu' },
          ],
        },
        lead:
          'The source file now extends the franchise beyond manga and television with a 2026 stage musical. This page collects the basic run information and the principal creative credits so the adaptation chain feels complete inside the wiki.',
        sections: [
          {
            title: 'Run and structure',
            paragraphs: [
              'Overview.txt records a Tokyo engagement from March 6 to March 15, 2026 at Theater H and an Osaka run from March 20 to March 22, 2026 at Umeda Arts Theater Dramacity. That makes the stage version a compact but formal extension of the franchise rather than a one-off promotional event.',
            ],
          },
          {
            title: 'Principal cast',
            paragraphs: [
              'The cast list includes Miisha Shimizu as Mitsumi Iwakura and Shion Yoshitaka as Sousuke Shima, with Mika, Yuzuki, Makoto, Tsukasa, Kento, Fumi, Chris, Ririka, Tokiko, Kanechika, Nao, and Shima Kei also represented in the stage lineup.',
              'For a wiki reader, the useful takeaway is scope: the musical is not centered only on the lead pair. It attempts to carry a meaningful portion of the supporting cast as well.',
            ],
          },
          {
            title: 'Creative staff',
            paragraphs: [
              'The staff block credits Ako Takahashi for script and lyrics, TETSUHARU for direction and choreography, and Shu Kanematsu for music, alongside a full production team for design, sound, costumes, publicity, and stage management.',
              'That fuller staff listing is worth preserving because it shows the series now has enough institutional and audience weight to support an adaptation outside the usual manga-to-anime lane.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'anime', label: 'Anime' },
          { categoryId: 'story', entryId: 'series-overview', label: 'Series overview' },
        ],
      },
    ],
  },
  {
    id: 'influences',
    title: 'Influences',
    description: 'Background notes drawn from existing interview material and the historical parallel Takamatsu cited directly.',
    accent: '#7c3aed',
    border: '#c4b5fd',
    surface: '#faf5ff',
    image: '/blog/takamatsu-interview-news/1.jpg',
    entries: [
      {
        id: 'takamatsu-interview',
        title: 'Takamatsu on Making Skip and Loafer',
        shortTitle: 'Takamatsu interview',
        description: 'Notes from the existing interview transcript about genre, character writing, and what the series is trying to do.',
        image: '/blog/takamatsu-interview-news/1.jpg',
        infobox: {
          title: 'Takamatsu on Making Skip and Loafer',
          subtitle: 'Interview summary',
          caption: 'Temporary image from the existing blog assets.',
          facts: [
            { label: 'Source base', value: 'Existing translated interview content in the repo' },
            { label: 'Major topic', value: 'How a seemingly simple school story became more layered and character-driven' },
            { label: 'Genre angle', value: 'A seinen serial strongly informed by shojo structure and feeling' },
            { label: 'Creative priority', value: 'Make characters vivid, approachable, and never too idealized' },
            { label: 'Emotional aim', value: 'Let the story stand beside readers like a friend' },
          ],
        },
        lead:
          'The interview material in the repo makes clear that Skip and Loafer was designed to encourage and comfort readers without abandoning complexity. Takamatsu wanted a longer story that could uplift without becoming false.',
        sections: [
          {
            title: 'Shojo structure inside a seinen magazine',
            paragraphs: [
              'Takamatsu explains that she borrowed classic shojo foundations because romance gives a story elasticity. It creates emotional investment without forcing every chapter to justify itself through a single technical premise.',
              'That helps explain why Skip and Loafer can feel airy and precise at the same time. It uses familiar emotional grammar while avoiding stock outcomes.',
            ],
          },
          {
            title: 'Humanizing the leads',
            paragraphs: [
              'One of the clearest points in the interview is that neither Mitsumi nor Shima was meant to remain idealized. Mitsumi could not become a saint, and Shima could not remain a convenient prince forever.',
              'That choice is foundational to the tone of the series. Characters are lovable because they stay imperfect enough to be believable.',
            ],
          },
          {
            title: 'What the story wants to offer',
            paragraphs: [
              'The interview also frames the series as a companion piece for readers going through regret, grief, or disorientation. Instead of denying loss, Takamatsu talks about remembering the fullness that existed before it.',
              'That philosophy fits the manga closely. Its tenderness comes from attention, not denial.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'series-overview', label: 'Series overview' },
          { categoryId: 'story', entryId: 'home-and-belonging', label: 'Home and belonging' },
        ],
      },
      {
        id: 'sekigahara-parallels',
        title: 'Sekigahara Parallels',
        shortTitle: 'Sekigahara parallels',
        description: 'The Mitsunari and Sakon influence that shaped the early idea behind Mitsumi and Shima.',
        image: '/blog/takamatsu-interview-news/4.jpg',
        infobox: {
          title: 'Sekigahara Parallels',
          subtitle: 'Historical influence',
          caption: 'Temporary image from the existing blog assets.',
          facts: [
            { label: 'Referenced figures', value: 'Ishida Mitsunari and Shima Sakon' },
            { label: 'Historical period', value: 'Japan’s Sengoku era and the Battle of Sekigahara' },
            { label: 'Appeal to Takamatsu', value: 'A bond built on recognizing someone’s flaws and still valuing them deeply' },
            { label: 'Modern echo', value: 'Mitsumi and Shima as a school-life reworking of a hard-to-label connection' },
            { label: 'Important caveat', value: 'Takamatsu says the original inspiration mostly disappeared as the manga grew' },
          ],
        },
        lead:
          'According to the interview material, one of the earliest inspirations for Mitsumi and Shima came from the relationship between Ishida Mitsunari and Shima Sakon in Ryotaro Shiba’s Sekigahara.',
        sections: [
          {
            title: 'Why the comparison matters',
            paragraphs: [
              'The point of the reference is not one-to-one historical analogy. It is the idea of a relationship where one person sees beyond the awkwardness or severity of another and values them more, not less, because of that complexity.',
              'That concept survives in Skip and Loafer even after the direct historical scaffolding mostly falls away.',
            ],
          },
          {
            title: 'Mitsunari and Sakon as a template',
            paragraphs: [
              'Mitsunari is often described as intelligent, rigid, and difficult to approach. Sakon is the charismatic counterpart who recognizes both his flaws and his worth.',
              'Transferred into a school setting, that becomes a relationship built on complement rather than similarity: blunt purpose meeting social intuition, each exposing what the other hides.',
            ],
            subsections: [
              {
                title: 'Recognition over polish',
                paragraphs: [
                  'The key appeal is not ideal compatibility. It is the idea that closeness can begin when someone sees the difficult parts clearly and stays anyway.',
                ],
              },
            ],
          },
          {
            title: 'What remains in the manga',
            paragraphs: [
              'By Takamatsu’s own account, the original historical inspiration has mostly dissolved into the broader character work. What remains is the emotional logic behind it.',
              'That logic is still visible whenever the series treats closeness as something richer than a tidy category.',
            ],
          },
        ],
        related: [
          { categoryId: 'story', entryId: 'mitsumi-and-shima', label: 'Mitsumi and Shima' },
          { categoryId: 'characters', entryId: 'sousuke-shima', label: 'Sousuke Shima' },
        ],
      },
    ],
  },
];

export const WIKI_SECTION_MAP = new Map(WIKI_SECTIONS.map((section) => [section.id, section]));

export const WIKI_ENTRY_MAP = new Map(
  WIKI_SECTIONS.flatMap((section) => section.entries.map((entry) => [`${section.id}:${entry.id}`, entry])),
);
