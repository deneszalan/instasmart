// One codebase, several apps. Each edition has its own posts, fields, language, name and saved
// progress, and is built on its own (`vite build --mode <id>`). Editions don't link to each other.
import { FIELD_BY_ID, FIELD_IDS, type Field, type FieldId } from './fields.ts';
import type { Lang } from './translate.ts';

/** A field's name and account in an edition's language. */
export type FieldText = Pick<Field, 'name' | 'handle' | 'scope'> & Partial<Pick<Field, 'emoji' | 'gradient'>>;

export interface Edition {
  id: string;
  /** The app's name, shown as its logo and title. */
  name: string;
  /** Language of the app's buttons and of its posts. */
  lang: 'en' | 'de';
  /** The page description for search engines and link previews. */
  description: string;
  /** Repo-relative folder holding this edition's content/ (posts and media). */
  dir: string;
  /** Where the build goes, under dist/: "" for the site root. */
  path: string;
  /** The fields this edition uses, in the order the app lists them. */
  fields: readonly FieldId[];
  /** Field names and accounts in this edition's language; fields.ts has the English ones. */
  fieldText?: Partial<Record<FieldId, FieldText>>;
  /** localStorage key for progress. Editions share the site's origin, so each needs its own. */
  storageKey: string;
  /** Mix live English Wikipedia articles into the feed. */
  wiki: boolean;
  /** Show who wrote each post (Claude, ChatGPT, …): a badge next to its account and a line in its details. */
  authors: boolean;
  /** Post ids every round of the home feed opens with, in this order, e.g. for a class to read through. The rest follow shuffled. */
  order?: readonly string[];
  /** The note at the bottom of the profile: where posts come from and how to check them. */
  about: string;
  /**
   * Other languages the reader can switch the app to, with this edition's own text (and name, if it differs) in each. A post shows in
   * one of them when it has a translation at content/i18n/<lang>/<field>/<id>.json, and in `lang` otherwise.
   */
  langs?: Partial<Record<Lang, { name?: string; description?: string; fieldText?: Partial<Record<FieldId, FieldText>>; films?: Partial<Record<FieldId, string>>; about: string }>>;
  /**
   * The language the app opens in, when it isn't `lang`: one of `langs`, e.g. Hungarian for an app whose posts are written
   * in English and translated. Its name and description (in `langs`) are then the page's title and description too.
   */
  defaultLang?: Lang;
  /**
   * A long film for a whole section, by field: its title here (and in `langs`), its files in
   * content/media/films/<field>.mp4 and .jpg (<field>-<lang>.mp4 for another language). Every post of the section
   * offers it ("Watch the full story"); a film is never saved for offline use.
   */
  films?: Partial<Record<FieldId, string>>;
  /**
   * The app can be used without internet: it installs an offline worker (src/offline-worker.js) that keeps the app;
   * Settings lets the reader save the newest posts (as many as they choose) and switch to offline mode, where only
   * those show. Also a Home Screen icon and manifest.
   */
  offline?: boolean;
}

export const EDITIONS = {
  reckon: {
    id: 'reckon',
    name: 'Reckon',
    lang: 'en',
    description: 'Reckon you know? Short animated explainers from science, history, art and the news, each with a quiz and a hands-on experiment.',
    dir: '.',
    path: '',
    fields: FIELD_IDS.filter((f) => f !== 'literature'),
    storageKey: 'reckon:v1',
    wiki: false,
    offline: true,
    authors: true,
    about:
      'Posts live as files in the Reckon GitHub repository. Ones marked AI were written by an AI, and every post links a source so you can check it.',
  },
  lesefutter: {
    id: 'lesefutter',
    name: 'Lesefutter',
    lang: 'de',
    description: 'Lesefutter: kurze Wissenshäppchen, Quiz und Animationen auf Deutsch, zuerst über den Minnesang und die Dichtung des Mittelalters.',
    dir: 'editions/lesefutter',
    path: 'lesefutter',
    fields: ['literature', 'language', 'history', 'music', 'art'],
    fieldText: {
      literature: { name: 'Literatur', handle: 'dichter.und.denker', scope: 'Gedichte, Epen, Lieder und die Menschen, die sie geschrieben haben' },
      language: { name: 'Sprache', handle: 'wort.wandel', scope: 'Wie sich die deutsche Sprache verändert hat: Wörter, Laute, Schrift' },
      history: { name: 'Geschichte', handle: 'zeit.reise', emoji: '🏰', scope: 'Burgen, Höfe, Herrscher und der Alltag im Mittelalter' },
      music: { name: 'Musik', handle: 'ton.kunst', scope: 'Lieder, Instrumente und Musiker vom Mittelalter bis heute' },
      art: { name: 'Kunst', handle: 'bild.kunst', scope: 'Handschriften, Bilder und Bauten' },
    },
    storageKey: 'lesefutter:v1',
    wiki: false,
    offline: true,
    authors: false,
    order: [
      'history-nibelungenlied-hintergrund',
      'literature-hohe-minne',
      'music-troubadoure-provence',
      'language-mittelhochdeutsch',
      'literature-under-der-linden',
      'literature-heinrich-von-morungen',
      'literature-walther-von-der-vogelweide',
      'history-saengerkrieg-wartburg',
      'literature-parzival',
      'art-codex-manesse',
    ],
    about: 'Jeder Beitrag nennt unter ⋯ eine Quelle, damit du ihn prüfen kannst.',
  },
  roma: {
    id: 'roma',
    name: 'Roma',
    lang: 'en',
    description: 'Roma: bite-sized stories, animations and puzzles about Rome, from the ancient city to its churches and art: how it worked and what it left us.',
    dir: 'editions/roma',
    path: 'roma',
    fields: ['history', 'engineering', 'art', 'politics', 'economics', 'math', 'earth'],
    fieldText: {
      history: { name: 'History', handle: 'ab.urbe.condita', emoji: '🏛️', gradient: ['#7f1d1d', '#a16207'], scope: 'The city and its people, from the founding to the popes' },
      engineering: { name: 'Engineering', handle: 'opus.caementicium', emoji: '🏗️', gradient: ['#44403c', '#b45309'], scope: 'Domes, aqueducts, drains and arenas: how Rome was built' },
      art: { name: 'Art', handle: 'ars.longa', emoji: '🎨', gradient: ['#831843', '#b45309'], scope: 'Frescoes, mosaics, sculpture, squares and the buildings that hold them' },
      politics: { name: 'Politics', handle: 'senatus.populusque', emoji: '📜', gradient: ['#1e3a8a', '#7f1d1d'], scope: 'The Senate, the assemblies and how Rome was governed' },
      economics: { name: 'Economics', handle: 'pecunia', emoji: '🏺', gradient: ['#713f12', '#065f46'], scope: 'Trade, coins, prices and the food that fed the city' },
      math: { name: 'Mathematics', handle: 'regula.et.circinus', emoji: '📐', gradient: ['#312e81', '#9a3412'], scope: 'Geometry and numbers in Rome’s buildings, games and art' },
      earth: { name: 'Earth', handle: 'septem.montes', emoji: '🗺️', gradient: ['#14532d', '#78350f'], scope: 'Hills, river, floods, maps and the ground the city stands on' },
    },
    storageKey: 'roma:v1',
    wiki: false,
    offline: true,
    authors: true,
    about: 'Every post links a source so you can check it. Posts marked AI were written by an AI.',
    langs: {
      de: {
        fieldText: {
          history: { name: 'Geschichte', handle: 'ab.urbe.condita', scope: 'Die Stadt und ihre Menschen, von der Gründung bis zu den Päpsten' },
          engineering: { name: 'Technik', handle: 'opus.caementicium', scope: 'Kuppeln, Aquädukte, Abwasserkanäle und Arenen: wie Rom gebaut wurde' },
          art: { name: 'Kunst', handle: 'ars.longa', scope: 'Fresken, Mosaiken, Skulpturen, Plätze und die Bauten, die sie tragen' },
          politics: { name: 'Politik', handle: 'senatus.populusque', scope: 'Der Senat, die Volksversammlungen und wie Rom regiert wurde' },
          economics: { name: 'Wirtschaft', handle: 'pecunia', scope: 'Handel, Münzen, Preise und die Lebensmittel, die die Stadt ernährten' },
          math: { name: 'Mathematik', handle: 'regula.et.circinus', scope: 'Geometrie und Zahlen in Roms Bauten, Spielen und Kunst' },
          earth: { name: 'Erde', handle: 'septem.montes', scope: 'Hügel, Fluss, Hochwasser, Karten und der Boden, auf dem die Stadt steht' },
        },
        about: 'Jeder Beitrag nennt eine Quelle, damit du ihn prüfen kannst. Mit KI gekennzeichnete Beiträge hat eine KI geschrieben.',
      },
    },
  },
  tunisia: {
    id: 'tunisia',
    name: 'Tunisia 1943',
    lang: 'en',
    description:
      'Tunisia 1943: the Second World War in Tunisia in short animations and stories: the campaign of 1942–43, life under occupation, the novels and films it inspired, and how it is remembered.',
    dir: 'editions/tunisia',
    path: 'tunisia',
    fields: ['history', 'politics', 'literature', 'art', 'earth', 'engineering'],
    fieldText: {
      history: { name: 'Campaign', handle: 'front.de.tunisie', emoji: '🪖', gradient: ['#3f3a24', '#8a6d2f'], scope: 'The fighting of November 1942 to May 1943: armies, battles, terrain and supplies' },
      politics: { name: 'Occupation', handle: 'tunis.1942', emoji: '📜', gradient: ['#1f2a44', '#7c2d12'], scope: 'Life under the war: the Bey, the French, the Axis occupation, and Tunisia’s Jews, Muslims and Europeans' },
      literature: { name: 'Literature', handle: 'pages.de.guerre', emoji: '📖', gradient: ['#3b2a20', '#9a3412'], scope: 'Novels, memoirs, diaries, poems and reporting from and about the war in Tunisia' },
      art: { name: 'Film', handle: 'cinema.tunisie', emoji: '🎬', gradient: ['#18181b', '#854d0e'], scope: 'Films and documentaries about the war in Tunisia, and how they tell it' },
      earth: { name: 'Remembrance', handle: 'lieux.de.memoire', emoji: '🕯️', gradient: ['#1c3a2e', '#57534e'], scope: 'Cemeteries, memorials, museums and the places where the war is remembered' },
      engineering: { name: 'Visit', handle: 'sur.les.traces', emoji: '🧭', gradient: ['#134e4a', '#a16207'], scope: 'Places in Tunisia you can visit today that tell the story of the war' },
    },
    films: {
      history: 'The Tunisian campaign, November 1942 to May 1943',
      politics: 'Six months under occupation',
      literature: 'The war in Tunisia in words',
      art: 'The war in Tunisia on screen',
      earth: 'Remembering 1943',
      engineering: 'On the trail of 1943',
    },
    storageKey: 'tunisia:v1',
    wiki: false,
    offline: true,
    authors: true,
    about: 'Every post links a source so you can check it. Posts marked AI were written by an AI.',
    langs: {
      fr: {
        name: 'Tunisie 1943',
        films: {
          history: 'La campagne de Tunisie, novembre 1942 – mai 1943',
          politics: 'Six mois sous l’occupation',
          literature: 'La guerre de Tunisie en mots',
          art: 'La guerre de Tunisie à l’écran',
          earth: 'Se souvenir de 1943',
          engineering: 'Sur les traces de 1943',
        },
        fieldText: {
          history: { name: 'Campagne', handle: 'front.de.tunisie', scope: 'Les combats de novembre 1942 à mai 1943 : armées, batailles, terrain et ravitaillement' },
          politics: { name: 'Occupation', handle: 'tunis.1942', scope: 'La vie pendant la guerre : le bey, les Français, l’occupation de l’Axe, et les Juifs, musulmans et Européens de Tunisie' },
          literature: { name: 'Littérature', handle: 'pages.de.guerre', scope: 'Romans, mémoires, journaux, poèmes et reportages sur la guerre en Tunisie' },
          art: { name: 'Cinéma', handle: 'cinema.tunisie', scope: 'Films et documentaires sur la guerre en Tunisie, et leur manière de la raconter' },
          earth: { name: 'Mémoire', handle: 'lieux.de.memoire', scope: 'Cimetières, monuments, musées et lieux où l’on se souvient de la guerre' },
          engineering: { name: 'À visiter', handle: 'sur.les.traces', scope: 'Des lieux de Tunisie à visiter aujourd’hui, qui racontent la guerre' },
        },
        about: 'Chaque publication cite une source pour que tu puisses la vérifier. Les publications marquées IA ont été écrites par une IA.',
      },
    },
  },
  hungary: {
    id: 'hungary',
    name: 'Hungary 1956',
    lang: 'en',
    defaultLang: 'hu',
    description:
      'Hungary 1956: the Hungarian revolution and freedom fight of 1956 in short animations: its background, why it broke out, the road to 23 October, the fighting, its crushing and its consequences.',
    dir: 'editions/hungary',
    path: 'hungary',
    fields: ['history', 'philosophy', 'politics', 'engineering', 'earth', 'economics'],
    fieldText: {
      history: { name: 'Background', handle: 'elozmenyek.45', emoji: '📜', gradient: ['#3f2d20', '#7c5a2e'], scope: 'Hungary from 1945 to 1953: the end of the war, Soviet occupation, the Communist takeover and Rákosi’s dictatorship' },
      philosophy: { name: 'Why', handle: 'miert.56', emoji: '❓', gradient: ['#1f2937', '#7f1d1d'], scope: 'Why the revolution broke out: terror and the ÁVH, poverty and compulsory deliveries, Soviet occupation and national grievances' },
      politics: { name: 'The road to October', handle: 'ut.oktoberig', emoji: '📢', gradient: ['#1e3a8a', '#92400e'], scope: 'From Stalin’s death to October 1956: Imre Nagy’s first government, the Petőfi Circle, the Polish October, Rajk’s reburial' },
      engineering: { name: 'The freedom fight', handle: 'pesti.srac', emoji: '🇭🇺', gradient: ['#14532d', '#991b1b'], scope: 'From 23 October to 4 November: the demonstration, the Radio, the fighting, the revolutionary councils, Nagy’s government and neutrality' },
      earth: { name: 'The end', handle: 'november.negy', emoji: '🌑', gradient: ['#111827', '#57534e'], scope: '4 November and after: the Soviet attack, the last fighting, the general strike, Imre Nagy’s abduction' },
      economics: { name: 'Consequences', handle: 'utoelet.56', emoji: '🕊️', gradient: ['#1e293b', '#3f6212'], scope: 'What followed: the reprisals, the refugees, the Kádár era and its silence, and the reburial of 1989' },
    },
    films: {
      history: 'Before October: Hungary 1945–1956',
      philosophy: 'Why Hungary rose',
      politics: 'The road to 23 October',
      engineering: 'The freedom fight, 23 October to 4 November',
      earth: 'The crushing, 4 November 1956',
      economics: 'What 1956 left behind',
    },
    storageKey: 'hungary:v1',
    wiki: false,
    offline: true,
    authors: true,
    about: 'Every post links a source so you can check it. Posts marked AI were written by an AI.',
    langs: {
      hu: {
        name: 'Ötvenhat',
        description:
          'Ötvenhat: az 1956-os forradalom és szabadságharc rövid animációkban: előzmények, okok, az út október 23-ig, a harcok, a leverés és a következmények.',
        films: {
          history: 'Október előtt: Magyarország 1945–1956',
          philosophy: 'Miért kelt fel az ország?',
          politics: 'Az út október 23-ig',
          engineering: 'A szabadságharc, október 23. – november 4.',
          earth: 'A leverés, 1956. november 4.',
          economics: 'Amit 1956 maga után hagyott',
        },
        fieldText: {
          history: { name: 'Előzmények', handle: 'elozmenyek.45', scope: 'Magyarország 1945 és 1953 között: a háború vége, a szovjet megszállás, a kommunista hatalomátvétel és Rákosi diktatúrája' },
          philosophy: { name: 'Miért?', handle: 'miert.56', scope: 'Miért tört ki a forradalom: terror és ÁVH, szegénység és beszolgáltatás, szovjet megszállás és nemzeti sérelmek' },
          politics: { name: 'Az út októberig', handle: 'ut.oktoberig', scope: 'Sztálin halálától 1956 októberéig: Nagy Imre első kormánya, a Petőfi Kör, a lengyel október, Rajk László újratemetése' },
          engineering: { name: 'A szabadságharc', handle: 'pesti.srac', scope: 'Október 23-tól november 4-ig: a tüntetés, a Rádió, a harcok, a forradalmi bizottságok, Nagy Imre kormánya és a semlegesség' },
          earth: { name: 'A leverés', handle: 'november.negy', scope: 'November 4. és utána: a szovjet támadás, az utolsó harcok, a nagy sztrájk, Nagy Imre elhurcolása' },
          economics: { name: 'Következmények', handle: 'utoelet.56', scope: 'Ami utána jött: a megtorlás, a menekültek, a Kádár-korszak és hallgatása, és az 1989-es újratemetés' },
        },
        about: 'Minden bejegyzés megad egy forrást, hogy ellenőrizhesd. Az MI jelölésű bejegyzéseket mesterséges intelligencia írta.',
      },
    },
  },
} as const satisfies Record<string, Edition>;

export type EditionId = keyof typeof EDITIONS;
export const EDITION_IDS = Object.keys(EDITIONS) as EditionId[];

/** The edition a Vite mode builds: `--mode lesefutter` builds Lesefutter, `--mode roma` Roma, `--mode tunisia` Tunisia 1943; any other mode builds Reckon. */
export function editionForMode(mode: string): Edition {
  return mode in EDITIONS ? EDITIONS[mode as EditionId] : EDITIONS.reckon;
}

/** The language an edition opens in, and its name and description in that language: the page's and the Home Screen's. */
export function editionFace(edition: Edition): { lang: Lang; name: string; description: string } {
  const lang = edition.defaultLang ?? edition.lang;
  const own = edition.langs?.[lang];
  return { lang, name: own?.name ?? edition.name, description: own?.description ?? edition.description };
}

/** The languages an edition's posts may be translated into, besides its own. */
export function editionLangs(edition: Edition): Lang[] {
  return Object.keys(edition.langs ?? {}) as Lang[];
}

/** An edition's fields, in its order and language. */
export function editionFields(edition: Edition): Field[] {
  return edition.fields.map((id) => ({ ...FIELD_BY_ID[id], ...edition.fieldText?.[id] }));
}
