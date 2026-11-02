import { useState } from 'react';
import { C, dot, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The Mareth battle by day, March 1943, from the British official history (Playfair and Molony, The Mediterranean
 * and Middle East, vol. IV, 1966, pp. 325-354). The New Zealand Corps' "left hook": by 17 March about 50 miles from
 * Foum Tatahouine; on the night of 19/20 March a move of 20 to 30 miles; on the night of 20/21 March 40 miles, to
 * ten miles short of the Tebaga Gap; on 21 March the entrance seized. The frontal attack across the Wadi Zigzaou
 * began on the night of 20/21 March; about 2 a.m. on 23 March Montgomery made the hook the main stroke.
 */
export const FIRST_DAY = 6;
export const LAST_DAY = 29;
export const SWITCH_DAY = 23;
export const KM_PER_MILE = 1.609344;

/** Miles the New Zealand Corps had come from Foum Tatahouine by the end of a day in March 1943 (25 for the "20 to 30"). */
export function hookMiles(day: number): number {
  if (day < 17) return 0;
  if (day < 20) return 50;
  if (day < 21) return 75;
  return 125;
}
export const hookKm = (day: number) => Math.round((hookMiles(day) * KM_PER_MILE) / 5) * 5;

/** Which attack carried Montgomery's main effort on a day. */
export function mainAttack(day: number): 'none' | 'frontal' | 'hook' {
  if (day < 20) return 'none';
  if (day < SWITCH_DAY) return 'frontal';
  return 'hook';
}

// The map: [latitude, longitude], drawn with equal kilometres both ways.
type LL = [number, number];
const BOX = { lon0: 9.3, lon1: 10.75, lat0: 32.85, lat1: 34.2 };
const KM_LON = 92.8, KM_LAT = 111;
const COAST: LL[] = [[34.3, 10.03], [34.12, 10.05], [33.95, 10.08], [33.86, 10.13], [33.78, 10.25], [33.7, 10.39], [33.62, 10.5], [33.55, 10.6], [33.48, 10.72], [33.52, 10.9]];
const HILLS: LL[] = [[33.66, 9.72], [33.55, 9.92], [33.42, 10.08], [33.25, 10.2], [33.05, 10.3], [32.85, 10.36]];
const TEBAGA: LL[] = [[33.77, 9.24], [33.73, 9.33], [33.69, 9.42]];
const LINE: LL[] = [[33.7, 10.37], [33.62, 10.29], [33.5, 10.15], [33.47, 10.11]];
const TATA: LL = [32.93, 10.45], GAP: LL = [33.62, 9.45], HAMMA: LL = [33.89, 9.8], GABES: LL = [33.88, 10.1], MEDENINE: LL = [33.35, 10.5], AKARIT: LL = [34.13, 10.02], MARETH: LL = [33.62, 10.3];
const HOOK: LL[] = [TATA, [32.86, 10.2], [32.9, 9.9], [32.99, 9.63], [33.22, 9.52], [33.45, 9.42], GAP];
const ONWARD: LL[] = [GAP, [33.74, 9.62], HAMMA, GABES];

/** A point a given share of the way along a path of map points. */
function along(pts: [number, number][], f: number): [number, number] {
  const d: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { d.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); total += d[i - 1]; }
  let left = Math.min(1, Math.max(0, f)) * total;
  for (let i = 0; i < d.length; i++) {
    if (left <= d[i]) { const u = d[i] ? left / d[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; }
    left -= d[i];
  }
  return pts[pts.length - 1];
}

const BLUE = '#7fb6e6', AXIS = '#d8c7a2', RED = '#e05a3a';

function note(day: number): string {
  if (day === 6) return t('6 March: at Medenine, Rommel’s attack is stopped by anti-tank guns.');
  if (day <= 10) return t('The Eighth Army prepares; the Axis holds the Mareth Line.');
  if (day <= 16) return t('The New Zealand Corps gathers south-east of Foum Tatahouine.');
  if (day <= 19) return t('The New Zealand Corps waits in the desert, about 80 km out.');
  if (day === 20) return t('Night of 20–21 March: the frontal attack crosses the Wadi Zigzaou; the hook drives north.');
  if (day === 21) return t('21 March: the hook reaches the Tebaga Gap; few tanks are across the wadi.');
  if (day === 22) return t('22 March: rain and a counter-attack push the frontal attack back to the wadi.');
  if (day === 23) return t('23 March, about 2 a.m.: Montgomery makes the left hook his main attack.');
  if (day <= 25) return t('An armoured division drives round to join the hook.');
  if (day === 26) return t('26 March, 4 p.m.: the attack at the Tebaga Gap, the sun behind it.');
  if (day === 27) return t('27 March: British tanks stop a few kilometres short of El Hamma.');
  if (day === 28) return t('28 March: the Axis pulls back from the Mareth Line to the Wadi Akarit.');
  return t('29 March: the New Zealand Division passes through Gabès.');
}

export default function MarethLeftHook({ onDone }: LabProps) {
  const [day, setDay] = useState(FIRST_DAY);
  useGoal(day === SWITCH_DAY, onDone);
  const attack = mainAttack(day);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const wk = (BOX.lon1 - BOX.lon0) * KM_LON, hk = (BOX.lat1 - BOX.lat0) * KM_LAT;
    const s = Math.min((w - 8) / wk, (h - 8) / hk), ox = (w - wk * s) / 2, oy = (h - hk * s) / 2;
    const P = ([lat, lon]: LL): [number, number] => [ox + (lon - BOX.lon0) * KM_LON * s, oy + (BOX.lat1 - lat) * KM_LAT * s];
    const path = (pts: [number, number][]) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    // land and sea
    ctx.fillStyle = 'rgba(214,190,140,0.12)'; ctx.fillRect(ox, oy, wk * s, hk * s);
    const coast = COAST.map(P);
    ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, wk * s, hk * s); ctx.clip();
    ctx.fillStyle = 'rgba(80,150,190,0.35)'; ctx.beginPath(); ctx.moveTo(coast[0][0], oy - 10);
    coast.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(w + 10, coast[coast.length - 1][1]); ctx.lineTo(w + 10, oy - 10); ctx.closePath(); ctx.fill();
    // hills
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(214,190,140,0.35)'; ctx.lineWidth = Math.max(8, 14 * s * 3); path(HILLS.map(P)); ctx.stroke();
    ctx.lineWidth = Math.max(6, 9 * s * 3); path(TEBAGA.map(P)); ctx.stroke();
    ctx.restore();
    const fs = Math.max(9, Math.min(12, w / 30));
    label(ctx, t('Matmata hills'), P([33.1, 10.12])[0], P([33.1, 10.12])[1], { size: fs - 1, color: C.faint, align: 'right' });
    // the Mareth Line
    const held = day < 28;
    ctx.save(); ctx.strokeStyle = RED; ctx.globalAlpha = held ? 1 : 0.35; ctx.lineWidth = 4; ctx.setLineDash(held ? [] : [5, 5]); path(LINE.map(P)); ctx.stroke(); ctx.restore();
    // Axis behind the line, and their withdrawal
    const axisAt: LL[] = [[33.75, 10.2], [33.68, 10.12], [33.6, 10.02]];
    for (const a of axisAt) {
      const p = P(a), q = P(AKARIT);
      const [x, y] = day >= 28 ? q : day === 27 ? [p[0] + (q[0] - p[0]) * 0.4, p[1] + (q[1] - p[1]) * 0.4] : p;
      ctx.fillStyle = AXIS; ctx.fillRect(x - 5, y - 4, 10, 8);
    }
    // Medenine, 6 March: the attack stopped
    if (day === 6) {
      const m = P(MEDENINE);
      ctx.strokeStyle = AXIS; ctx.lineWidth = 2.5;
      for (const dy of [-10, 6]) { ctx.beginPath(); ctx.moveTo(m[0] - 46, m[1] + dy - 12); ctx.lineTo(m[0] - 16, m[1] + dy); ctx.stroke(); }
      for (let i = 0; i < 4; i++) dot(ctx, m[0] - 10, m[1] - 14 + i * 9, 2.5, BLUE);
    }
    // the frontal attack, 20-22 March
    if (attack === 'frontal') {
      const a = P([33.6, 10.48]), b = P([33.68, 10.33]);
      ctx.strokeStyle = BLUE; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      dot(ctx, b[0], b[1], 4, BLUE);
    }
    // the hook: dashed route, the corps' position
    const hookPts = HOOK.map(P);
    ctx.save(); ctx.strokeStyle = 'rgba(127,182,230,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); path(hookPts); ctx.stroke(); ctx.restore();
    if (day >= 11) {
      let pos: [number, number];
      if (day <= 25) pos = along(hookPts, hookMiles(day) / 125);
      else pos = along(ONWARD.map(P), day === 26 ? 0.12 : day === 27 ? 0.45 : day === 28 ? 0.62 : 1);
      dot(ctx, pos[0], pos[1], attack === 'hook' ? 7 : 5, BLUE);
      if (attack === 'hook') { ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pos[0], pos[1], 11, 0, Math.PI * 2); ctx.stroke(); }
    }
    // places
    const town = (ll: LL, name: string, dx = 6, align: CanvasTextAlign = 'left') => { const [x, y] = P(ll); dot(ctx, x, y, 2.5, C.soft); label(ctx, name, x + dx, y, { size: fs, color: C.soft, align }); };
    town(GABES, 'Gabès'); town(HAMMA, 'El Hamma', -6, 'right'); town(MEDENINE, 'Medenine'); town(TATA, 'Foum Tatahouine', -6, 'right');
    town(MARETH, 'Mareth', 6);
    town(AKARIT, t('Wadi Akarit'), -6, 'right');
    const g = P(GAP); label(ctx, t('Tebaga Gap'), g[0] - 6, g[1] + 12, { size: fs, color: '#f2c062', align: 'right' });
    label(ctx, t('Schematic · British official history'), w - 4, h - 6, { size: fs - 3, color: C.faint, align: 'right' });
  };

  const km = hookKm(day);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Schematic map of southern Tunisia on {d} March 1943', { d: formatNumber(day) })} />
      <Range label={t('Day in March 1943')} value={day} min={FIRST_DAY} max={LAST_DAY} step={1} onChange={(v) => setDay(Math.round(v))} format={(v) => t('{d} March 1943', { d: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Montgomery’s main attack'), value: attack === 'none' ? t('none so far') : attack === 'frontal' ? t('frontal') : t('left hook'), tone: attack === 'hook' ? 'good' : 'accent' },
          { label: t('Left hook so far'), value: day >= 26 ? t('past the gap') : t('{km} km out', { km: formatNumber(km) }) },
        ]}
      />
      <p className="lab__note">{note(day)}</p>
    </div>
  );
}
