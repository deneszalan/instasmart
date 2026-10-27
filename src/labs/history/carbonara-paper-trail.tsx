import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Ingredient = 'lard' | 'pancetta' | 'guanciale' | 'butter' | 'garlic' | 'eggs' | 'yolks' | 'cheese' | 'pecorino' | 'parmesan' | 'gruyere' | 'cream';
export type Kind = 'ancestor' | 'name' | 'recipe';
export interface Doc {
  id: string;
  year: number;
  kind: Kind;
  has: Ingredient[];
}

/**
 * Carbonara's paper trail as food historians report it: Wikipedia; Il Post and L'Espresso (2026) on De Koerier, 1939;
 * Luca Cesari's survey of recipes on ricettestoriche.it. Only the ingredients those sources name are listed.
 */
export const DOCS: Doc[] = [
  { id: 'eggs1839', year: 1839, kind: 'ancestor', has: ['lard', 'eggs', 'cheese'] },
  { id: 'koerier', year: 1939, kind: 'name', has: [] },
  { id: 'stampa', year: 1950, kind: 'name', has: [] },
  { id: 'fabrizi', year: 1952, kind: 'recipe', has: ['lard', 'butter', 'eggs', 'pecorino', 'parmesan'] },
  { id: 'bronte', year: 1952, kind: 'recipe', has: ['pancetta', 'eggs', 'parmesan'] },
  { id: 'cucina', year: 1954, kind: 'recipe', has: ['pancetta', 'garlic', 'gruyere'] },
  { id: 'dessi', year: 1955, kind: 'recipe', has: ['pancetta', 'eggs', 'parmesan', 'pecorino'] },
  { id: 'eating', year: 1957, kind: 'recipe', has: ['guanciale'] },
  { id: 'cream', year: 1960, kind: 'recipe', has: ['cream'] },
  { id: 'web2009', year: 2009, kind: 'recipe', has: ['guanciale', 'pecorino', 'eggs'] },
  { id: 'web2017', year: 2017, kind: 'recipe', has: ['guanciale', 'pecorino', 'yolks'] },
];
export const RANGE: [number, number] = [1830, 2026];

/** The documents dated up to `year`. */
export const known = (year: number) => DOCS.filter((d) => d.year <= year);
/** The earliest year the name appears in print, if it does by `year`. */
export const firstName = (year: number) => known(year).find((d) => d.kind !== 'ancestor')?.year ?? null;
/** The first year a carbonara in print uses an ingredient. */
export const firstWith = (ing: Ingredient) => DOCS.find((d) => d.kind === 'recipe' && d.has.includes(ing))?.year ?? null;

const COLOUR: Record<Kind, string> = { ancestor: '#f2c14e', name: '#7dd3fc', recipe: '#86efac' };

export default function CarbonaraTrail({ onDone }: LabProps) {
  const [year, setYear] = useState(1900);
  const found = year === firstWith('guanciale');
  useGoal(found, onDone);
  const docs = known(year), latest = docs.at(-1);
  const recipes = docs.filter((d) => d.kind === 'recipe').length;

  const ingName = (i: Ingredient) =>
    i === 'lard' ? t('lard') : i === 'pancetta' ? t('pancetta') : i === 'guanciale' ? t('guanciale') : i === 'butter' ? t('butter') : i === 'garlic' ? t('garlic') : i === 'eggs' ? t('eggs') : i === 'yolks' ? t('egg yolks') : i === 'cheese' ? t('cheese') : i === 'pecorino' ? t('pecorino') : i === 'parmesan' ? t('parmesan') : i === 'gruyere' ? t('Gruyère') : t('cream');
  const docName = (d: Doc) =>
    d.id === 'eggs1839' ? t('Pasta with cheese and beaten eggs, no name yet') :
    d.id === 'koerier' ? t('De Koerier: “spaghetti alla carbonara” in Trastevere') :
    d.id === 'stampa' ? t('La Stampa: American officers seek it in Trastevere') :
    d.id === 'fabrizi' ? t('First known recipe: actor Aldo Fabrizi') :
    d.id === 'bronte' ? t('Patricia Bronté’s guide to eating in Chicago') :
    d.id === 'cucina' ? t('La Cucina Italiana: Italy’s first printed recipe') :
    d.id === 'dessi' ? t('A cookbook offers pecorino instead of parmesan') :
    d.id === 'eating' ? t('Eating in Italy, a guidebook: pork cheek') :
    d.id === 'cream' ? t('Cream starts to appear in recipes') :
    d.id === 'web2009' ? t('Recipe websites: guanciale and pecorino') :
    t('Recipe websites: guanciale, pecorino, yolks only');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, Y = h - 30;
    const X = (y: number) => L + ((R - L) * (y - RANGE[0])) / (RANGE[1] - RANGE[0]);
    line(ctx, L, Y, R, Y, C.faint, 2);
    for (const y of [1850, 1900, 1950, 2000]) label(ctx, formatNumber(y, 'year'), X(y), Y + 14, { size: 9.5, color: C.faint });
    for (const d of DOCS) dot(ctx, X(d.year), Y, d.year <= year ? 5 : 3, d.year <= year ? COLOUR[d.kind] : C.line);
    line(ctx, X(year), Y - 14, X(year), Y + 6, C.ink, 2);
    // the latest document and the ingredients it names
    if (!latest) {
      label(ctx, t('No document yet'), w / 2, h * 0.32, { size: 13, color: C.soft });
      return;
    }
    label(ctx, `${formatNumber(latest.year, 'year')} · ${docName(latest)}`, w / 2, 20, { size: 12, color: COLOUR[latest.kind] });
    let x = 0;
    const items = latest.has.map((i) => ingName(i));
    ctx.font = `700 12px system-ui, sans-serif`;
    const widths = items.map((s) => ctx.measureText(s).width + 18);
    const total = widths.reduce((a, b) => a + b + 6, -6);
    x = w / 2 - total / 2;
    items.forEach((s, j) => {
      const isG = latest.has[j] === 'guanciale';
      ctx.fillStyle = isG ? 'rgba(239,154,138,0.9)' : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.roundRect(x, 38, widths[j], 22, 11);
      ctx.fill();
      label(ctx, s, x + widths[j] / 2, 49, { size: 12, color: isG ? '#2a2018' : C.ink });
      x += widths[j] + 6;
    });
    if (!items.length) label(ctx, t('the name only, no recipe'), w / 2, 49, { size: 11, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Carbonara’s paper trail up to {year}: {n} documents', { year: formatNumber(year, 'year'), n: formatNumber(docs.length) })} />
      <Range label={t('Year')} value={year} min={RANGE[0]} max={RANGE[1]} step={1} onChange={(v) => setYear(Math.round(v))} format={(v) => formatNumber(v, 'year')} />
      <Readouts
        items={[
          { label: t('Name “carbonara” in print'), value: firstName(year) ? formatNumber(firstName(year)!, 'year') : t('not yet'), tone: 'accent' },
          { label: t('Carbonara recipes in print'), value: formatNumber(recipes) },
          { label: t('Guanciale in a carbonara'), value: year >= firstWith('guanciale')! ? t('yes') : t('not yet'), tone: found ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Only the documents and ingredients that food historians report are shown; others may still turn up, as the 1939 article did in 2026.')}</p>
    </div>
  );
}
