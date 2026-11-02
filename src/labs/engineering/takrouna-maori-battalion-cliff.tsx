import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/** Eye height of someone standing, in metres. */
export const EYE = 1.6;
/** The goal: still see the ground this many metres out from the foot of the cliff. */
export const SEE_OUT = 10;
export const STEP = 0.1;
/** The cliff in the lab, in metres (schematic). */
export const HEIGHT = 40;

/**
 * Ground hidden beyond the foot of a vertical cliff `height` m high, for someone standing `back` m behind its edge
 * on a flat top: the sight line over the edge meets the ground height × back / eye metres out. At the edge (back 0),
 * leaning over, nothing is hidden. Simplified: a flat top, a vertical face and flat ground below.
 */
export const hiddenWidth = (height: number, back: number, eye = EYE) => (back <= 0 ? 0 : (height * back) / eye);
/** Whether a climber on the vertical face is out of sight: from anywhere behind the edge, the face can't be seen. */
export const faceHidden = (back: number) => back > 0;
/** The farthest step back (to the nearest STEP) from which the ground SEE_OUT m out is still in view. */
export const farthestBack = (height: number) => Math.floor(((SEE_OUT * EYE) / height + 1e-9) / STEP) * STEP;

export default function TakrounaCliff({ onDone }: LabProps) {
  const [back, setBack] = useState(4);
  const height = HEIGHT;
  const hidden = hiddenWidth(height, back);
  const ok = hidden <= SEE_OUT + 1e-9;
  useGoal(ok && hiddenWidth(height, back + STEP) > SEE_OUT + 1e-9, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const top = 26, ground = h - 34, edgeX = w * 0.42;
    const ppm = (ground - top) / 50; // pixels per metre, the same both ways
    const cliffTop = ground - height * ppm;
    const eyeX = edgeX - back * ppm * 6, eyeY = cliffTop - EYE * ppm * 6; // the walker is drawn 6 × larger, so he shows
    // the rock: a flat top and a vertical face
    ctx.fillStyle = 'rgba(199,167,122,0.55)';
    ctx.fillRect(0, cliffTop, edgeX, ground - cliffTop);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, ground, w, h - ground);
    // what can't be seen: below the sight line, beyond the edge
    const reach = Math.min(w + 400, edgeX + hidden * ppm);
    ctx.fillStyle = 'rgba(226,114,91,0.35)';
    ctx.beginPath(); ctx.moveTo(edgeX, cliffTop); ctx.lineTo(edgeX, ground); ctx.lineTo(reach, ground); ctx.closePath(); ctx.fill();
    // the sight line, scaled to the drawn walker
    if (back > 0) line(ctx, eyeX, eyeY, reach, ground, C.accent, 2, [6, 5]);
    // the walker
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(eyeX - 3, eyeY + 4, 6, cliffTop - eyeY - 4);
    // a climber at the foot of the face
    ctx.fillStyle = faceHidden(back) ? 'rgba(255,255,255,0.35)' : C.good;
    ctx.beginPath(); ctx.arc(edgeX + 7, ground - 16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(edgeX + 4, ground - 12, 6, 12);
    // the mark SEE_OUT m out
    const markX = edgeX + SEE_OUT * ppm;
    line(ctx, markX, ground - 8, markX, ground + 8, ok ? C.good : C.bad, 3);
    label(ctx, t('{n} m from the foot', { n: formatNumber(SEE_OUT) }), markX, ground + 20, { size: 11, color: ok ? C.good : C.bad });
    label(ctx, t('{n} m high cliff', { n: formatNumber(height) }), edgeX - 8, (cliffTop + ground) / 2, { size: 12, color: C.ink, align: 'right' });
    label(ctx, t('Schematic: walker drawn larger; flat top, vertical face'), w / 2, 12, { size: 10, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('A cliff {h} m high; standing {d} m back from the edge hides the ground up to {x} m from its foot', {
          h: formatNumber(height),
          d: formatFixed(back, 1),
          x: formatNumber(Math.round(hidden)),
        })}
      />
      <Range label={t('Step back from the edge (m)')} value={back} min={0} max={6} step={STEP} onChange={(v) => setBack(Math.round(v * 10) / 10)} format={(v) => formatFixed(v, 1)} />
      <Readouts
        items={[
          { label: t('Ground hidden beyond the foot'), value: `${formatNumber(Math.round(hidden))} m`, tone: ok ? 'good' : 'bad' },
          { label: t('A climber at the foot'), value: faceHidden(back) ? t('out of view') : t('in full view'), tone: faceHidden(back) ? 'bad' : 'good' },
        ]}
      />
    </div>
  );
}
