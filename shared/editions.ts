// One codebase, several apps. Each edition has its own posts, fields, language, name and saved
// progress, and is built on its own (`vite build --mode <id>`). Editions don't link to each other.
import { FIELD_BY_ID, FIELD_IDS, type Field, type FieldId } from './fields.ts';

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
}

export const EDITIONS = {
  reckon: {
    id: 'reckon',
    name: 'Reckon',
    lang: 'en',
    description: 'Reckon you know? An endless feed of bite-sized knowledge, quizzes and puzzles from science, history, art and more.',
    dir: '.',
    path: '',
    fields: FIELD_IDS.filter((f) => f !== 'literature'),
    storageKey: 'reckon:v1',
    wiki: true,
    authors: true,
    about:
      'Posts live as files in the Reckon GitHub repository. Ones marked AI were written by an AI, and every post links a source so you can check it. Live posts come from Wikipedia’s featured content, under CC BY-SA.',
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
    description: 'Roma: bite-sized stories, animations and puzzles about ancient Rome, how it worked and what it left us.',
    dir: 'editions/roma',
    path: 'roma',
    fields: ['history'],
    fieldText: {
      history: { name: 'History', handle: 'ab.urbe.condita', emoji: '🏛️', gradient: ['#7f1d1d', '#a16207'], scope: 'The city, its people, its calendar and its empire' },
    },
    storageKey: 'roma:v1',
    wiki: false,
    authors: true,
    about: 'Every post links a source so you can check it. Posts marked AI were written by an AI.',
  },
} as const satisfies Record<string, Edition>;

export type EditionId = keyof typeof EDITIONS;
export const EDITION_IDS = Object.keys(EDITIONS) as EditionId[];

/** The edition a Vite mode builds: `--mode lesefutter` builds Lesefutter, `--mode roma` Roma; any other mode builds Reckon. */
export function editionForMode(mode: string): Edition {
  return mode in EDITIONS ? EDITIONS[mode as EditionId] : EDITIONS.reckon;
}

/** An edition's fields, in its order and language. */
export function editionFields(edition: Edition): Field[] {
  return edition.fields.map((id) => ({ ...FIELD_BY_ID[id], ...edition.fieldText?.[id] }));
}
