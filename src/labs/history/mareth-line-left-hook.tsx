import { useState } from 'react';
import { C, clamp, dot, labelPlacer, Range, Readouts, Stage, useGoal, type LabelSide, type LabelSpot, type LabProps } from '../kit';
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

type Pt = [number, number];

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
    // marks drawn in pixels shrink with the map on a short stage, so they keep their place among the towns
    const k = clamp(s / 1.25, 0.6, 1.5);
    const P = ([lat, lon]: LL): Pt => [ox + (lon - BOX.lon0) * KM_LON * s, oy + (BOX.lat1 - lat) * KM_LAT * s];
    const path = (pts: Pt[]) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    const place = labelPlacer(ctx, w, h);
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
    // the Mareth Line
    const held = day < 28, line = LINE.map(P);
    ctx.save(); ctx.strokeStyle = RED; ctx.globalAlpha = held ? 1 : 0.35; ctx.lineWidth = 4; ctx.setLineDash(held ? [] : [5, 5]); path(line); ctx.stroke(); ctx.restore();
    place.path(line, 2.5);
    // Axis behind the line, and their withdrawal
    const axisAt: LL[] = [[33.75, 10.2], [33.68, 10.12], [33.6, 10.02]];
    const bw = Math.max(6, 10 * k), bh = Math.max(5, 8 * k);
    for (const a of axisAt) {
      const p = P(a), q = P(AKARIT);
      const [x, y] = day >= 28 ? q : day === 27 ? [p[0] + (q[0] - p[0]) * 0.4, p[1] + (q[1] - p[1]) * 0.4] : p;
      ctx.fillStyle = AXIS; ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh);
      place.block(x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2);
    }
    // Medenine, 6 March: the attack stopped
    if (day === 6) {
      const m = P(MEDENINE);
      ctx.strokeStyle = AXIS; ctx.lineWidth = 2.5;
      for (const dy of [-10, 6]) {
        const from: Pt = [m[0] - 46 * k, m[1] + (dy - 12) * k], to: Pt = [m[0] - 16 * k, m[1] + dy * k];
        ctx.beginPath(); ctx.moveTo(...from); ctx.lineTo(...to); ctx.stroke();
        place.path([from, to], 1.5);
      }
      for (let i = 0; i < 4; i++) { const [x, y] = [m[0] - 10 * k, m[1] + (-14 + i * 9) * k]; dot(ctx, x, y, 2.5, BLUE); place.mark(x, y, 2.5); }
    }
    // the frontal attack, 20-22 March
    if (attack === 'frontal') {
      const a = P([33.6, 10.48]), b = P([33.68, 10.33]);
      ctx.strokeStyle = BLUE; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      dot(ctx, b[0], b[1], 4, BLUE);
      place.path([a, b], 2); place.mark(b[0], b[1], 4);
    }
    // the hook: dashed route, the corps' position
    const hookPts = HOOK.map(P);
    ctx.save(); ctx.strokeStyle = 'rgba(127,182,230,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); path(hookPts); ctx.stroke(); ctx.restore();
    place.path(hookPts, 1.5);
    if (day >= 11) {
      let pos: Pt;
      if (day <= 25) pos = along(hookPts, hookMiles(day) / 125);
      else pos = along(ONWARD.map(P), day === 26 ? 0.12 : day === 27 ? 0.45 : day === 28 ? 0.62 : 1);
      const ring = Math.max(8, 11 * k);
      dot(ctx, pos[0], pos[1], attack === 'hook' ? 7 * ring / 11 : 5, BLUE);
      if (attack === 'hook') { ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pos[0], pos[1], ring, 0, Math.PI * 2); ctx.stroke(); }
      place.mark(pos[0], pos[1], attack === 'hook' ? ring + 1 : 5);
    }
    // places: the dots first, so no name covers another town's dot, then the names, most important first
    const towns: [LL, string, LabelSide[]][] = [
      [MARETH, 'Mareth', ['E', 'SE', 'NE', 'S']],
      [GABES, 'Gabès', ['E', 'NE', 'SE', 'N']],
      [HAMMA, 'El Hamma', ['W', 'NW', 'SW', 'N']],
      [MEDENINE, 'Medenine', ['E', 'SE', 'NE', 'S']],
      [TATA, 'Foum Tatahouine', ['E', 'NE', 'W', 'NW']],
      [AKARIT, t('Wadi Akarit'), ['W', 'E', 'SW', 'NW']],
    ];
    for (const [ll] of towns) { const [x, y] = P(ll); dot(ctx, x, y, 2.5, C.soft); place.mark(x, y, 4); }
    for (const [ll, name, dirs] of towns) { const [x, y] = P(ll); place.put([[name]], fs, C.soft, place.around(x, y, 2.5, fs, dirs)); }
    // the gap, west of the corps' ring when it is there
    const g = P(GAP);
    place.put([[t('Tebaga Gap')]], fs, '#f2c062', place.around(g[0], g[1], Math.max(8, 11 * k), fs, ['W', 'SW', 'NW', 'N', 'S', 'E']));
    // the credit in a corner, on two lines if one won't fit, and not across the sea's edge at the map's side
    place.path([[ox + wk * s, oy], [ox + wk * s, coast[coast.length - 1][1]]], 2);
    const credit = t('Schematic · British official history'), cut = credit.indexOf(' · '), source = credit.slice(cut + 3);
    const mid = [...source.matchAll(/ /g)].map((m) => m.index).sort((a, b) => Math.abs(a - source.length / 2) - Math.abs(b - source.length / 2))[0] ?? -1;
    const creditLines = [[credit], [credit.slice(0, cut), source]];
    if (mid > 0) creditLines.push([credit.slice(0, cut), source.slice(0, mid), source.slice(mid + 1)]);
    place.put(creditLines, Math.max(7.5, fs - 3), C.faint, [
      { x: w - 3, y: h - 3, align: 'right', v: 'bottom' }, { x: w - 3, y: 3, align: 'right', v: 'top' },
      { x: 3, y: h - 3, align: 'left', v: 'bottom' }, { x: 3, y: 3, align: 'left', v: 'top' },
    ]);
    // the hills' name along their ridge, wherever it is clear, on two lines if it must
    const hills = HILLS.map(P), hillSpots: LabelSpot[] = [], hillName = t('Matmata hills'), sp = hillName.lastIndexOf(' ');
    for (const dy of [0, 6, -6, 12, -12])
      for (const f of [0.62, 0.5, 0.74, 0.4, 0.84, 0.3, 0.92, 0.2]) {
        const [x, y] = along(hills, f);
        hillSpots.push({ x, y: y + dy, align: 'center' }, { x: x + 6, y: y + dy, align: 'left' }, { x: x - 6, y: y + dy, align: 'right' });
      }
    place.put(sp > 0 ? [[hillName], [hillName.slice(0, sp), hillName.slice(sp + 1)]] : [[hillName]], fs - 1, C.faint, hillSpots);
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
