import { LANG } from '../i18n';
export type NumberFormat = 'number' | 'year' | undefined;

/** 1,582 (or 1582 for a year), with at most two decimals. */
export const formatNumber = (n: number, format?: NumberFormat): string =>
  new Intl.NumberFormat(LANG === 'de' ? 'de-DE' : undefined, { maximumFractionDigits: 2, useGrouping: format !== 'year' }).format(n);

/** A number with exactly `digits` decimals, written the reader's way: 365.2500, or 365,2500 in German. */
export const formatFixed = (n: number, digits: number): string =>
  new Intl.NumberFormat(LANG === 'de' ? 'de-DE' : undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

/** A number with its unit: "34 km", "12%", "464 °C". */
export function withUnit(n: number, unit?: string, format?: NumberFormat): string {
  if (!unit) return formatNumber(n, format);
  return /^[%°×]/.test(unit) ? `${formatNumber(n, format)}${unit}` : `${formatNumber(n, format)} ${unit}`;
}

/** The format to use when a slide names none: unit-less whole numbers that all look like years are shown as years. */
export function guessFormat(unit: string | undefined, values: number[]): NumberFormat {
  if (unit) return 'number';
  return values.every((v) => Number.isInteger(v) && v >= 1000 && v <= 2100) ? 'year' : 'number';
}
