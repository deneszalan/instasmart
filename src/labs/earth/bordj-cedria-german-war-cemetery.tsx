import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
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
    // left: the six makeshift cemeteries; right: the hillside with six courtyards
    const names = ['Nassen', 'Bizerte', 'La Mornaghia', 'El M’Dou', 'Mateur', 'Sfax'];
    const top = h * 0.12, step = (h * 0.8) / 6;
    names.forEach((n, i) => {
      const y = top + i * step + step / 2;
      ctx.globalAlpha = 1 - 0.75 * move;
      ctx.strokeStyle = STONE; ctx.lineWidth = 1.5; ctx.strokeRect(w * 0.04, y - step * 0.32, step * 0.6, step * 0.64);
      label(ctx, n, w * 0.04 + step * 0.7, y, { size: fs, color: C.soft, align: 'left' });
      ctx.globalAlpha = 1;
    });
    // field graves: small marks scattered, fading as the dead are moved
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(217,210,195,${0.5 * (1 - move)})`; ctx.fillRect(w * (0.06 + ((i * 37) % 30) / 100), h * (0.15 + ((i * 53) % 70) / 100), 3, 6); }
    // the hillside
    ctx.fillStyle = 'rgba(62,66,52,0.8)'; ctx.beginPath(); ctx.moveTo(w * 0.5, h); ctx.lineTo(w * 0.5, h * 0.55); ctx.quadraticCurveTo(w * 0.7, h * 0.2, w, h * 0.12); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    const built = s === 'building' || s === 'open' ? 1 : 0;
    for (let i = 0; i < 6; i++) {
      const x = w * (0.56 + i * 0.07), y = h * (0.86 - i * 0.12), cw = w * 0.12, ch = h * 0.06;
      ctx.fillStyle = built ? STONE : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y - ch, cw, ch);
      if (built) { ctx.fillStyle = `rgba(110,104,92,${0.2 + 0.7 * Math.min(1, Math.max(0, move * 6 - i))})`; ctx.fillRect(x + cw * 0.15, y - ch * 0.8, cw * 0.7, ch * 0.55); }
    }
    if (s === 'agreement') label(ctx, t('agreement, 28 March 1966'), w * 0.75, h * 0.62, { size: fs, color: ACCENT });
    if (s === 'open') label(ctx, t('opened 28 September 1977'), w * 0.75, h * 0.08, { size: fs, color: ACCENT });
    label(ctx, formatNumber(year, 'year'), w * 0.75, h * 0.94, { size: fs + 6, color: C.ink });
    label(ctx, t('Dates: Volksbund'), w * 0.04, h - fs * 0.5, { size: fs - 3, color: C.faint, align: 'left' });
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
