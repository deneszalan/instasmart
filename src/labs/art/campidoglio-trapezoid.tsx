import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Piazza del Campidoglio as measured on OpenStreetMap: about 44 m wide at the Cordonata end and 54 m deep. */
export const NEAR_W = 44, DEPTH = 54, REAL_FAR_W = 58;
/** The viewer: 8 m down the Cordonata ramp from the square, eyes 1.6 m up. */
export const BACK = 8, EYE = 1.6;
const FACADE = 18; // m, drawn height of the façades (schematic)

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Width of the far end when each side palace is turned out by `splay` degrees from the square's axis. */
export const farWidth = (splay: number) => NEAR_W + 2 * DEPTH * Math.tan(rad(splay));

/** How many degrees of the viewer's view the far palace fills: its width over its distance. */
export const viewAngle = (width: number) => deg(2 * Math.atan(width / 2 / (DEPTH + BACK)));

/** How much wider the far palace looks than at the end of a rectangle with the same entrance: in perspective, width ÷ distance. */
export const widerThanRectangle = (splay: number) => farWidth(splay) / NEAR_W;

export default function CampidoglioTrapezoid({ onDone }: LabProps) {
  const [splay, setSplay] = useState(0);
  const far = farWidth(splay);
  useGoal(Math.abs(far - REAL_FAR_W) < 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the plan, entrance at the bottom; right: what you see from the ramp
    const half = w * 0.42;
    const s = Math.min((half - 20) / 80, (h - 30) / (DEPTH + BACK + 14));
    const pcx = half / 2 + 4, base = h - 12 - BACK * s;
    const X = (x: number) => pcx + x * s, Z = (z: number) => base - z * s;
    const a = NEAR_W / 2, b = far / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(X(-a), Z(0));
    ctx.lineTo(X(a), Z(0));
    ctx.lineTo(X(b), Z(DEPTH));
    ctx.lineTo(X(-b), Z(DEPTH));
    ctx.closePath();
    ctx.fill();
    for (const [x0, z0, x1, z1] of [[-a, 0, -b, DEPTH], [a, 0, b, DEPTH], [-b, DEPTH, b, DEPTH]]) line(ctx, X(x0), Z(z0), X(x1), Z(z1), '#e8dfcc', 3);
    // the viewer and the lines of sight to the far corners
    dot(ctx, X(0), Z(-BACK), 4, C.accent);
    line(ctx, X(0), Z(-BACK), X(-b), Z(DEPTH), 'rgba(253,224,71,0.5)', 1, [3, 3]);
    line(ctx, X(0), Z(-BACK), X(b), Z(DEPTH), 'rgba(253,224,71,0.5)', 1, [3, 3]);
    label(ctx, t('Palazzo Senatorio'), X(0), Z(DEPTH) - 9, { size: 9.5, color: C.soft });
    label(ctx, t('you, on the ramp'), X(0) + 6, Z(-BACK), { size: 8, align: 'left', color: C.accent });
    // the view: one-point perspective from the viewer's eye
    const vx0 = half + 10, vw = w - vx0 - 6, vcx = vx0 + vw / 2, hy = h * 0.58, f = vw * 0.55;
    const P = (x: number, y: number, z: number): [number, number] => [vcx + (f * x) / (z + BACK), hy - (f * (y - EYE)) / (z + BACK)];
    ctx.save();
    ctx.beginPath();
    ctx.rect(vx0, 4, vw, h - 8);
    ctx.clip();
    ctx.fillStyle = '#2b3f66';
    ctx.fillRect(vx0, 4, vw, hy - 4);
    ctx.fillStyle = '#5d5547';
    ctx.fillRect(vx0, hy, vw, h - hy);
    const quad = (pts: [number, number, number][], fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      pts.forEach(([x, y, z], i) => {
        const [u, v] = P(x, y, z);
        if (i) ctx.lineTo(u, v);
        else ctx.moveTo(u, v);
      });
      ctx.closePath();
      ctx.fill();
    };
    quad([[-a, 0, 0], [-b, 0, DEPTH], [-b, FACADE, DEPTH], [-a, FACADE, 0]], '#cfc3a8');
    quad([[a, 0, 0], [b, 0, DEPTH], [b, FACADE, DEPTH], [a, FACADE, 0]], '#cfc3a8');
    quad([[-b, 0, DEPTH], [b, 0, DEPTH], [b, FACADE, DEPTH], [-b, FACADE, DEPTH]], '#e8dfcc');
    ctx.restore();
    const [l] = P(-b, 0, DEPTH), [r] = P(b, 0, DEPTH);
    line(ctx, l, h - 8, r, h - 8, C.accent, 2);
    label(ctx, t('what you see'), vx0 + 6, 14, { size: 9.5, align: 'left', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Plan of the square and the view from the ramp, side palaces turned out by {s} degrees', { s: formatNumber(splay) })} />
      <Range label={t('Turn each side palace out by')} value={splay} min={-10} max={15} step={0.5} onChange={setSplay} format={(v) => `${formatNumber(v)}°`} />
      <Readouts
        items={[
          { label: t('Width at the far end'), value: `${formatNumber(Math.round(far))} m`, tone: Math.abs(far - REAL_FAR_W) < 1 ? 'good' : undefined },
          { label: t('The far palace fills'), value: `${formatNumber(Math.round(viewAngle(far)))}°` },
          { label: t('Compared with a rectangle'), value: `× ${formatNumber(Math.round(widerThanRectangle(splay) * 100) / 100)}`, tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Model: the square as measured on OpenStreetMap, 44 m wide at the entrance and 54 m deep; you stand 8 m down the Cordonata. Façade heights are schematic.')}</p>
    </div>
  );
}
