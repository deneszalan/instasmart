import { EDITION } from '../edition';
import type { Lang } from '../../shared/translate.ts';
import { de } from './de';

const TABLES: Partial<Record<Lang, Record<string, string>>> = { de };

/** The languages a reader can pick in this edition, its own first. */
export const LANGS: readonly Lang[] = [EDITION.lang, ...(Object.keys(EDITION.langs ?? {}) as Lang[])];

/** Each language's name in itself, as a language menu shows it. */
export const LANG_NAMES: Record<Lang, string> = { en: 'English', de: 'Deutsch' };

const LANG_KEY = `${EDITION.storageKey}:lang`;

/** The language to run in: a stored choice this edition offers, or the edition's own. */
export function pickLang(stored: string | null): Lang {
  return stored && (LANGS as readonly string[]).includes(stored) ? (stored as Lang) : EDITION.lang;
}

function storedLang(): string | null {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

/** The language this page runs in. It is fixed while the page is open; setLang reloads. */
export const LANG: Lang = pickLang(storedLang());

/** Switch the app to `lang`: the choice is remembered, and the page reloads so every text, date and number follows. */
export function setLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Not remembered, but the reload below still can't pick it up; nothing more to do.
    return;
  }
  location.reload();
}

/**
 * The app's text in the reader's language. The English text is the key, so English needs no table:
 * t('Saved') is "Saved" in Reckon and "Gespeichert" in Lesefutter. {name} placeholders are filled from
 * `vars`; pick singular or plural before calling, e.g. t(n === 1 ? '{n} piece' : '{n} pieces', { n }).
 */
export function t(text: string, vars?: Record<string, string | number>): string {
  const out = TABLES[LANG]?.[text] ?? text;
  return vars ? out.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m)) : out;
}
