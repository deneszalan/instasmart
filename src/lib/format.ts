export type NumberFormat = 'number' | 'year' | undefined;

/** 1,582 (or 1582 for a year), with at most two decimals. */
export const formatNumber = (n: number, format?: NumberFormat): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, useGrouping: format !== 'year' }).format(n);

/** A number with its unit: "34 km", "12%", "464 °C". */
export function withUnit(n: number, unit?: string, format?: NumberFormat): string {
  if (!unit) return formatNumber(n, format);
  return /^[%°×]/.test(unit) ? `${formatNumber(n, format)}${unit}` : `${formatNumber(n, format)} ${unit}`;
}
