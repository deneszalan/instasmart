import { useState } from 'react';
import { C, clamp, font, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The German war cemetery at Bordj Cedria, from the Volksbund's page: the dead of the Tunisian campaign (surrender on
 * 13 May 1943) first lay in six provisional cemeteries and field graves; a German-Tunisian war graves agreement came
 * into force on 28 March 1966; the cemetery was built from 1973 to 1975, then the dead were moved there; it opened to
 * the public on 28 September 1977. Germany's day of mourning (Volkstrauertag) is held two Sundays before the first
 * Sunday of Advent (Volksbund); the German embassy holds it at Bordj Cedria each year (Webdo, 2015).
 */
export const SURRENDER = 1943, AGREEMENT = 1966, BUILT_FROM = 1973, BUILT_TO = 1975, OPENED = 1977, LAST = 2026;
export type Phase = 'scattered' | 'agreement' | 'building' | 'open';
export function stageOf(year: number): Phase {
  if (year < AGREEMENT) return 'scattered';
  if (year < BUILT_FROM) return 'agreement';
  if (year < OPENED) return 'building';
  return 'open';
}
/** The first Sunday of Advent: the fourth Sunday before Christmas, between 27 November and 3 December (UTC dates). */
export function firstAdvent(year: number): Date {
  const xmas = new Date(Date.UTC(year, 11, 25));
  const back = xmas.getUTCDay() === 0 ? 7 : xmas.getUTCDay();
  return new Date(Date.UTC(year, 11, 25 - back - 21));
}
/** Volkstrauertag: two Sundays before the first Sunday of Advent, so a Sunday between 13 and 19 November. */
export function dayOfMourning(year: number): Date {
  const a = firstAdvent(year);
  return new Date(Date.UTC(year, a.getUTCMonth(), a.getUTCDate() - 14));
}

function where(s: Phase): string {
  if (s === 'scattered') return t('six makeshift cemeteries and field graves');
  if (s === 'agreement') return t('still scattered; a war graves agreement since 1966');
  if (s === 'building') return t('a cemetery built at Bordj Cedria, 1973–75; the dead moved in');
  return t('at Bordj Cedria, open to visitors since 1977');
}

const STONE = '#d9d2c3', ACCENT = '#e9c27a';

export default function BordjCedriaYears({ onDone }: LabProps) {
  const [year, setYear] = useState(SURRENDER);
  const s = stageOf(year);
  useGoal(year === OPENED, onDone);
  const move = s === 'scattered' || s === 'agreement' ? 0 : s === 'building' ? Math.min(1, (year - BUILT_FROM + 1) / 4) : 1;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const fs = Math.max(10, Math.min(13, w / 28));
    // the credit along the bottom left, and the year along the bottom right, both inside the stage
    const cs = Math.max(8, fs - 3), ys = fs + 6;
    label(ctx, t('Dates: Volksbund'), 8, h - 4 - cs * 0.6, { size: cs, color: C.faint, align: 'left' });
    // the label of the agreement or the opening across the top right, smaller if the stage is narrow
    const note = s === 'agreement' ? t('agreement, 28 March 1966') : s === 'open' ? t('opened 28 September 1977') : '';
    font(ctx, fs);
    const ns = note ? Math.min(fs, (fs * w * 0.5) / ctx.measureText(note).width) : fs, noteBottom = 6 + fs * 1.2;
    // left: the six makeshift cemeteries, one row each above the credit, each box clear of its name
    const names = ['Nassen', 'Bizerte', 'La Mornaghia', 'El M’Dou', 'Mateur', 'Sfax'];
    const listTop = 4, listBottom = h - 8 - cs * 1.2, step = (listBottom - listTop) / 6;
    const ls = Math.min(fs, step * 0.8), box = clamp(step * 0.55, 6, 11), nameX = 8 + box + 6;
    font(ctx, ls);
    const namesRight = nameX + Math.max(...names.map((n) => ctx.measureText(n).width));
    ctx.globalAlpha = 1 - 0.75 * move;
    names.forEach((n, i) => {
      const y = listTop + (i + 0.5) * step;
      ctx.strokeStyle = STONE; ctx.lineWidth = 1.5; ctx.strokeRect(8, y - box / 2, box, box);
      label(ctx, n, nameX, y, { size: ls, color: C.soft, align: 'left' });
    });
    ctx.globalAlpha = 1;
    // field graves: small marks scattered between the names and the hillside, well clear of both, fading as the dead are moved
    const hill = w * 0.5, gx0 = namesRight + 12, gw = Math.max(12, hill - 8 - gx0), scatter = rng(7);
    ctx.fillStyle = `rgba(217,210,195,${0.5 * (1 - move)})`;
    for (let i = 0; i < 18; i++) ctx.fillRect(gx0 + scatter() * (gw - 3), listTop + 4 + scatter() * (listBottom - listTop - 14), 3, 6);
    // the hillside with six courtyards, rising from above the year to below the top label
    const cw = (w - 6 - (hill + w * 0.06)) / 3.9, dx = cw * 0.58, ch = clamp(h * 0.06, 5, 10);
    const yb = h - 6 - ys * 1.2, yt = noteBottom + 6 + ch, dy = (yb - yt) / 5;
    ctx.fillStyle = 'rgba(62,66,52,0.8)'; ctx.beginPath(); ctx.moveTo(hill, h); ctx.lineTo(hill, yb - ch - dy * 0.9); ctx.quadraticCurveTo(hill + (w - hill) * 0.4, yt - ch - 6 + (yb - yt) * 0.15, w, yt - ch - 6); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    const built = s === 'building' || s === 'open' ? 1 : 0;
    for (let i = 0; i < 6; i++) {
      const x = hill + w * 0.06 + i * dx, y = yb - i * dy;
      ctx.fillStyle = built ? STONE : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y - ch, cw, ch);
      if (built) { ctx.fillStyle = `rgba(110,104,92,${0.2 + 0.7 * Math.min(1, Math.max(0, move * 6 - i))})`; ctx.fillRect(x + cw * 0.15, y - ch * 0.8, cw * 0.7, ch * 0.55); }
    }
    if (note) label(ctx, note, w - 6, 6 + fs * 0.6, { size: ns, color: ACCENT, align: 'right' });
    label(ctx, formatNumber(year, 'year'), w * 0.75, h - 4 - ys * 0.6, { size: ys, color: C.ink });
  };

  const d = dayOfMourning(year);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The six makeshift German cemeteries of 1943 and the hillside at Bordj Cedria, in {y}', { y: formatNumber(year, 'year') })} />
      <Range label={t('Year, from 1943')} value={year} min={SURRENDER} max={LAST} step={1} onChange={(v) => setYear(Math.round(v))} format={(v) => formatNumber(v, 'year')} />
      <Readouts
        items={[
          { label: t('Years since 13 May 1943'), value: formatNumber(year - SURRENDER), tone: year === OPENED ? 'good' : 'accent' },
          { label: t('Day of mourning'), value: s === 'open' ? t('Sunday {d} Nov.', { d: formatNumber(d.getUTCDate()) }) : '–' },
        ]}
      />
      <p className="lab__note">{where(s)}</p>
    </div>
  );
}
