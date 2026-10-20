import { EDITION } from '../edition';
import { de } from './de';

const TABLES: Record<string, Record<string, string>> = { de };

/**
 * The app's text in this edition's language. The English text is the key, so the English edition
 * needs no table: t('Saved') is "Saved" in Reckon and "Gespeichert" in Lesefutter. {name} placeholders
 * are filled from `vars`; pick singular or plural before calling, e.g. t(n === 1 ? '{n} piece' : '{n} pieces', { n }).
 */
export function t(text: string, vars?: Record<string, string | number>): string {
  const out = TABLES[EDITION.lang]?.[text] ?? text;
  return vars ? out.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m)) : out;
}

