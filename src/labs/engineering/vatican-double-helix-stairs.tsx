import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

// A simplified model of a staircase shaft like Giuseppe Momo's at the Vatican Museums (1932): it climbs 22 m (the
// 1932 booklet). The ramps' distance from the centre, the floor thickness and the headroom needed are assumptions.
export const STAIR_RISE = 22;
export const STAIR_RADIUS = 6;
export const STAIR_SLAB = 0.5;
export const STAIR_HEADROOM = 2.2;

/** One or two ramps, each making `turns` turns up the shaft. With two, the other ramp runs half a turn above. */
export const stairDesign = (ramps: 1 | 2, turns: number) => {
  const pitch = STAIR_RISE / turns; // what each ramp climbs in one turn
  const gap = pitch / ramps; // from one floor to the next floor above it, at any point of the wall
  const run = 2 * Math.PI * STAIR_RADIUS; // the horizontal length of one turn
  return { pitch, headroom: gap - STAIR_SLAB, slope: pitch / run, length: turns * Math.hypot(run, pitch) };
};

/** The most turns, in half turns, that still leave the headroom: the gentlest ramp that works. */
export const gentlestTurns = (ramps: 1 | 2) => {
  let best = 0;
  for (let n = 0.5; n <= 20; n += 0.5) if (stairDesign(ramps, n).headroom >= STAIR_HEADROOM) best = n;
  return best;
};

export default function VaticanDoubleHelix({ onDone }: LabProps) {
  const [ramps, setRamps] = useState<1 | 2>(2);
  const [turns, setTurns] = useState(2);
  const d = stairDesign(ramps, turns);
  const fits = d.headroom >= STAIR_HEADROOM;
  const best = ramps === 2 && turns === gentlestTurns(2);
  useGoal(best, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // side view of the shaft on the left, a cut through its wall on the right
    const sideW = w * 0.56, cx = sideW * 0.4, top = 14, bot = h - 18, sz = (bot - top) / STAIR_RISE;
    const sx = Math.min(cx - 6, (sz * STAIR_RISE) / 3) / STAIR_RADIUS, sy = sx * 0.28;
    // the shaft's outline
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - STAIR_RADIUS * sx, top, 2 * STAIR_RADIUS * sx, bot - top);
    // the ramps as helices: back half first and faint, then the front half
    const cols = ['#f2b24a', '#7cc8ec'];
    for (const front of [false, true]) {
      for (let r = 0; r < ramps; r++) {
        const n = Math.ceil(turns * 72);
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * turns * Math.PI * 2 + r * Math.PI, a1 = ((i + 1) / n) * turns * Math.PI * 2 + r * Math.PI;
          if (Math.sin((a0 + a1) / 2) > 0 !== front) continue;
          const z0 = (i / n) * STAIR_RISE, z1 = ((i + 1) / n) * STAIR_RISE;
          line(
            ctx,
            cx + Math.cos(a0) * STAIR_RADIUS * sx,
            bot - z0 * sz + Math.sin(a0) * STAIR_RADIUS * sy,
            cx + Math.cos(a1) * STAIR_RADIUS * sx,
            bot - z1 * sz + Math.sin(a1) * STAIR_RADIUS * sy,
            front ? cols[r] : `${cols[r]}66`,
            front ? 4 : 3,
          );
        }
      }
    }
    // the cut through the wall: floors where the ramps pass one point of it
    const wx = sideW + 18, ww = w - wx - 10;
    ctx.fillStyle = 'rgba(63,110,93,0.6)';
    ctx.fillRect(wx + ww - 8, top, 8, bot - top);
    const floors: { z: number; r: number }[] = [];
    for (let k = 0; k * d.pitch <= STAIR_RISE + 1e-9; k++) for (let r = 0; r < ramps; r++) {
      const z = k * d.pitch + (r * d.pitch) / 2;
      if (z <= STAIR_RISE + 1e-9) floors.push({ z, r });
    }
    for (const f of floors) {
      const y = bot - f.z * sz;
      ctx.fillStyle = cols[f.r];
      ctx.fillRect(wx, y - Math.max(2, STAIR_SLAB * sz), ww - 8, Math.max(2, STAIR_SLAB * sz));
    }
    // the headroom over the lowest floor
    const y0 = bot - STAIR_SLAB * sz, y1 = bot - (d.pitch / ramps) * sz + STAIR_SLAB * sz;
    if (y1 > top) {
      line(ctx, wx + 8, y0, wx + 8, y1, fits ? C.good : C.bad, 2);
      label(ctx, t('headroom {n} m', { n: formatNumber(Math.round(d.headroom * 10) / 10) }), wx - 4, (y0 + y1) / 2, { size: 10, align: 'right', color: fits ? C.good : C.bad });
    }
    // a person, 1.8 m, on the lowest floor
    const ph = 1.8 * sz;
    ctx.fillStyle = C.ink;
    ctx.fillRect(wx + ww / 2, y0 - ph * 0.85, Math.max(2, ph * 0.18), ph * 0.85);
    ctx.beginPath();
    ctx.arc(wx + ww / 2 + Math.max(1, ph * 0.09), y0 - ph * 0.93, Math.max(1.5, ph * 0.09), 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('22 m from street to museum'), cx, bot + 10, { size: 10 });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Ramps in the shaft')}
        value={ramps}
        onChange={setRamps}
        options={[
          { value: 1, label: t('One ramp') },
          { value: 2, label: t('Two ramps, a double helix') },
        ]}
      />
      <Range label={t('Turns of each ramp')} value={turns} min={1} max={10} step={0.5} onChange={setTurns} format={(v) => formatNumber(v)} />
      <Stage draw={draw} label={t('Side view of a 22 m staircase shaft with its ramps, and a cut through its wall showing the floors and the headroom')} />
      <Readouts
        items={[
          { label: t('Headroom over a ramp'), value: `${formatNumber(Math.round(d.headroom * 10) / 10)} m`, tone: fits ? 'good' : 'bad' },
          { label: t('Ramp slope'), value: `${formatNumber(Math.round(d.slope * 100))}%`, tone: best ? 'good' : undefined },
          { label: t('Ramp length'), value: `${formatNumber(Math.round(d.length))} m` },
        ]}
      />
      <p className="lab__note">{t('Simplified: ramps 6 m from the centre, floors 0.5 m thick, 2.2 m of headroom needed. Each of Momo’s real ramps is 94 m long.')}</p>
    </div>
  );
}
