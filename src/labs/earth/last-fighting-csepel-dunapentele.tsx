import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The last strongholds of the armed resistance after the Soviet attack of 4 November 1956, and the last day each
 * held (1956 Institute, rev.hu: lesson 4 and chronology): the reader moves through November and watches them fall.
 * Simplified: sporadic fighting went on after some of these days, and the workers' councils struck on for weeks.
 */
export type GroupId = 'szena' | 'corvin' | 'dunapentele' | 'eles' | 'csepel' | 'mecsek';
export const GROUPS: { id: GroupId; last: number; where: 'budapest' | 'country'; x: number; y: number }[] = [
  { id: 'szena', last: 6, where: 'budapest', x: 0.36, y: 0.32 },
  { id: 'corvin', last: 6, where: 'budapest', x: 0.6, y: 0.5 },
  { id: 'dunapentele', last: 7, where: 'country', x: 0.42, y: 0.62 },
  { id: 'eles', last: 8, where: 'budapest', x: 0.8, y: 0.62 },
  { id: 'csepel', last: 9, where: 'budapest', x: 0.56, y: 0.82 },
  { id: 'mecsek', last: 19, where: 'country', x: 0.3, y: 0.86 },
];
export const FIRST_DAY = 4;
export const LAST_DAY = 22;
/** The groups still holding out on a day of November 1956. */
export const holding = (day: number) => GROUPS.filter((g) => day <= g.last).map((g) => g.id);
/** The goal: a day on which only the group in the Mecsek hills still held out. */
export const onlyMecsek = (day: number) => { const h = holding(day); return h.length === 1 && h[0] === 'mecsek'; };

const AMBER = '#e7b24f', GREY = '#6c737c';
const NAMES: Record<GroupId, string> = { szena: 'Széna tér', corvin: 'Corvin köz', dunapentele: 'Dunapentele', eles: 'Éles sarok', csepel: 'Csepel', mecsek: 'Mecsek' };

export default function LastStrongholds({ onDone }: LabProps) {
  const [day, setDay] = useState(FIRST_DAY);
  const h = holding(day);
  useGoal(onlyMecsek(day), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h: H }: { w: number; h: number }) => {
    // the country on the left, Budapest enlarged on the right
    const cw = w * 0.5, bx = w * 0.52, bw = w * 0.46;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cw * 0.52, H * 0.5, cw * 0.46, H * 0.36, -0.08, 0, Math.PI * 2); ctx.stroke();
    label(ctx, t('Rest of Hungary'), cw * 0.52, H * 0.1, { size: 11, color: C.soft });
    ctx.beginPath(); ctx.arc(bx + bw / 2, H * 0.52, Math.min(bw, H) * 0.42, 0, Math.PI * 2); ctx.stroke();
    label(ctx, 'Budapest', bx + bw / 2, H * 0.06, { size: 11, color: C.soft });
    // the Danube through both
    ctx.strokeStyle = 'rgba(80,130,170,0.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cw * 0.5, H * 0.18); ctx.lineTo(cw * 0.47, H * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw * 0.5, H * 0.14); ctx.quadraticCurveTo(bx + bw * 0.42, H * 0.55, bx + bw * 0.5, H * 0.92); ctx.stroke();
    const pos = (g: (typeof GROUPS)[number]) => (g.where === 'budapest' ? [bx + bw * g.x, H * (0.1 + 0.85 * g.y)] : [cw * g.x + cw * 0.1, H * g.y]);
    for (const g of GROUPS) {
      const [x, y] = pos(g), on = day <= g.last;
      ctx.fillStyle = on ? AMBER : GREY; ctx.beginPath(); ctx.arc(x, y, on ? 6 : 4.5, 0, Math.PI * 2); ctx.fill();
      if (on) { ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke(); }
      label(ctx, NAMES[g.id], x, g.id === 'eles' || g.id === 'csepel' ? y + 16 : y - 15, { size: 9, color: on ? C.ink : C.faint });
    }
    label(ctx, t('Schematic; sporadic fighting went on after these days'), 8, H - 8, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{d} November 1956: {n} strongholds still holding out', { d: formatNumber(day), n: formatNumber(h.length) })} />
      <Range label={t('Day of November 1956')} value={day} min={FIRST_DAY} max={LAST_DAY} step={1} onChange={setDay} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Strongholds still holding'), value: formatNumber(h.length), tone: h.length === 1 ? 'good' : 'accent' },
          { label: t('Strongholds fallen'), value: formatNumber(GROUPS.length - h.length) },
        ]}
      />
    </div>
  );
}
