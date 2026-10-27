import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, wavelengthColour, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A simplified model, not the 2012 measurements: bare marble reflects about the same share of every colour, while a
 * yellow earth pigment such as yellow ochre absorbs blue and violet light and reflects yellow and red.
 */
export const marbleReflects = (_nm: number) => 0.85;
export const ochreReflects = (nm: number) => 0.12 + 0.56 / (1 + Math.exp(-(nm - 530) / 18));

/** Traces: only part of a spot is still covered with pigment. */
export const TRACE_SHARE = 0.3;
/** What a spot with traces reflects: a mix of bare marble and ochre. */
export const spotReflects = (nm: number, share = TRACE_SHARE) => (1 - share) * marbleReflects(nm) + share * ochreReflects(nm);
/** How much brighter bare marble looks than the spot with traces, in light of one colour. */
export const contrast = (nm: number, share = TRACE_SHARE) => marbleReflects(nm) / spotReflects(nm, share);
/** In this model the traces stand out when bare marble looks at least 30% brighter than the spot. */
export const STANDS_OUT = 1.3;

export default function MenorahLight({ onDone }: LabProps) {
  const [nm, setNm] = useState(620);
  const c = contrast(nm);
  const visible = c >= STANDS_OUT;
  useGoal(visible, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 30, R = w - 10, T = 10, B = h * 0.62;
    const X = (n: number) => L + ((n - 400) / 300) * (R - L), Y = (r: number) => B - r * (B - T);
    // the spectrum under the graph
    for (let x = L; x < R; x++) { ctx.fillStyle = wavelengthColour(400 + ((x - L) / (R - L)) * 300, 55, 0.9); ctx.fillRect(x, B + 4, 1.5, 7); }
    for (const r of [0, 0.5, 1]) { line(ctx, L, Y(r), R, Y(r), C.line, 1); label(ctx, `${formatNumber(r * 100)}%`, L - 4, Y(r), { size: 9, align: 'right', color: C.faint }); }
    const curve = (f: (n: number) => number, col: string) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      for (let n = 400; n <= 700; n += 5) { const x = X(n), y = Y(f(n)); if (n === 400) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    };
    curve(marbleReflects, C.ink);
    curve((n) => spotReflects(n), '#dca437');
    line(ctx, X(nm), T, X(nm), B + 12, wavelengthColour(nm, 65), 2);
    label(ctx, t('Bare marble'), R, Y(0.85) - 8, { size: 9, align: 'right', color: C.ink });
    label(ctx, t('Spot with ochre traces'), R, Y(spotReflects(690)) + 10, { size: 9, align: 'right', color: '#dca437' });
    // two swatches lit by the chosen light
    const sy = B + 22, sh = h - sy - 6, sw = (w - 30) / 2;
    const lit = (r: number) => { const col = wavelengthColour(nm, 8 + 52 * r); return col; };
    ctx.fillStyle = lit(marbleReflects(nm)); ctx.fillRect(10, sy, sw, sh);
    ctx.fillStyle = lit(spotReflects(nm)); ctx.fillRect(20 + sw, sy, sw, sh);
    label(ctx, t('Bare marble'), 10 + sw / 2, sy + sh / 2, { size: 10, color: '#111' });
    label(ctx, t('Spot with ochre traces'), 20 + sw * 1.5, sy + sh / 2, { size: 10, color: '#111' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Light reflected by bare marble and by a spot with ochre traces, lit at {n} nanometres', { n: formatNumber(nm) })} />
      <Range label={t('Colour of the light (wavelength)')} value={nm} min={400} max={700} step={5} onChange={setNm} format={(v) => `${formatNumber(v)} nm`} />
      <Readouts
        items={[
          { label: t('Bare marble reflects'), value: `${formatNumber(Math.round(marbleReflects(nm) * 100))}%` },
          { label: t('Spot with ochre traces reflects'), value: `${formatNumber(Math.round(spotReflects(nm) * 100))}%` },
          { label: t('Marble looks brighter by'), value: `${formatNumber(Math.round((c - 1) * 100))}%`, tone: visible ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified model: illustrative curves, not the 2012 measurements. A spectrometer reads every colour at once.')}</p>
    </div>
  );
}
