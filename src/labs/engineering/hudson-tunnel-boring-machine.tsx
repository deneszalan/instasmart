import { useState } from 'react';
import { Btn, C, label, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Segments in one ring of lining, for illustration. */
export const SEGMENTS = 6;
/** Rings to build to reach the goal. */
export const GOAL_RINGS = 3;

/** The machine's cycle: how many rings are finished, whether the thrust jacks are out, segments of the next ring. */
export interface Tbm {
  rings: number;
  extended: boolean;
  placed: number;
}
export type Refusal = 'jacks-out' | 'ring-unfinished' | 'no-gap';
export const START: Tbm = { rings: 0, extended: false, placed: 0 };

/** Mine one stroke: the jacks push off the newest finished ring and the machine moves one ring width forward. */
export function mine(s: Tbm): { next: Tbm; refused?: Refusal } {
  if (s.placed > 0) return { next: s, refused: 'ring-unfinished' };
  if (s.extended) return { next: s, refused: 'jacks-out' };
  return { next: { ...s, extended: true } };
}

/** Place one segment in the gap the last push left; the last one completes the ring and the jacks close on it. */
export function place(s: Tbm): { next: Tbm; refused?: Refusal } {
  if (!s.extended) return { next: s, refused: 'no-gap' };
  const placed = s.placed + 1;
  if (placed < SEGMENTS) return { next: { ...s, placed } };
  return { next: { rings: s.rings + 1, extended: false, placed: 0 } };
}

const YELLOW = '#f2b62b', YELLOW_DK = '#b9861a', TEAL = '#3fc1b0', CONCRETE = '#cfc9bf', CONCRETE2 = '#a9a297', RED = '#ef5a3c', CHIP = '#c99a5b';

export default function TunnelBoringMachine({ onDone, active }: LabProps) {
  const [s, setS] = useState<Tbm>(START);
  const [refused, setRefused] = useState<Refusal | null>(null);
  const [stroke, setStroke] = useState(0); // 0–1: how far the current push has gone
  const [clock, setClock] = useState(0);
  const pushing = s.extended && s.placed === 0 && stroke < 1;
  useFrame((dt) => {
    setClock((c) => c + dt);
    if (pushing) setStroke((p) => Math.min(1, p + dt / 0.9));
  }, active);
  useGoal(s.rings >= GOAL_RINGS, onDone);

  const act = (r: { next: Tbm; refused?: Refusal }) => {
    setRefused(r.refused ?? null);
    if (r.refused) return;
    if (r.next.extended && !s.extended) setStroke(0);
    setS(r.next);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cy = h * 0.55, br = h * 0.27, lin = Math.max(6, br * 0.16), rw = w * 0.1;
    const face = w * 0.9, shieldL = face - w * 0.34, bulk = shieldL + w * 0.16, jackBase = w * 0.08;
    const e = s.extended ? (s.placed > 0 ? 1 : stroke) : 0; // jack extension, in ring widths
    const front = bulk - jackBase - e * rw; // front edge of the newest finished ring
    // rock and bore
    ctx.fillStyle = 'rgba(255,240,220,0.06)';
    ctx.fillRect(0, cy - br - 18, w, br * 2 + 36);
    ctx.fillStyle = '#141110';
    ctx.fillRect(0, cy - br, face, br * 2);
    // finished rings, newest at the front
    for (let k = 0; k < 14; k++) {
      const x1 = front - k * rw;
      if (x1 < 0) break;
      ctx.fillStyle = (s.rings - k) % 2 ? CONCRETE2 : CONCRETE;
      ctx.fillRect(x1 - rw + 1, cy - br, rw - 2, lin);
      ctx.fillRect(x1 - rw + 1, cy + br - lin, rw - 2, lin);
    }
    // the ring being built in the gap
    if (s.placed > 0) {
      ctx.fillStyle = CONCRETE;
      ctx.fillRect(front + 1, cy + br - lin, rw - 2, lin);
      if (s.placed >= 4) ctx.fillRect(front + 1, cy - br, rw - 2, lin);
    }
    // shield and cutterhead
    ctx.fillStyle = 'rgba(242,182,43,0.18)';
    ctx.fillRect(shieldL, cy - br - 8, face - shieldL, br * 2 + 16);
    ctx.fillStyle = YELLOW;
    ctx.fillRect(shieldL, cy - br - 8, face - shieldL, 8);
    ctx.fillRect(shieldL, cy + br, face - shieldL, 8);
    ctx.fillStyle = YELLOW_DK;
    ctx.fillRect(face - 12, cy - br - 6, 14, br * 2 + 12);
    ctx.fillRect(bulk, cy - br, 6, br * 2);
    const spin = pushing ? clock * 40 : 0;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#3b3a38';
      ctx.fillRect(face + 2, cy - br + 4 + ((i * br * 0.34 + spin) % (br * 2 - 12)), 5, 8);
    }
    // thrust jacks from the bulkhead to the newest ring (or the ring being built)
    const shoe = s.placed > 0 ? front + rw : front;
    for (const y of [cy - br + lin / 2, cy + br - lin / 2]) {
      ctx.fillStyle = TEAL;
      ctx.fillRect(bulk - jackBase * 0.6, y - 4, jackBase * 0.6, 8);
      ctx.fillStyle = '#9fe3d9';
      ctx.fillRect(shoe, y - 2, bulk - jackBase * 0.6 - shoe, 4);
      ctx.fillStyle = TEAL;
      ctx.fillRect(shoe, y - 6, 4, 12);
    }
    // conveyor with chips while mining
    ctx.strokeStyle = '#58636a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(face - 16, cy + br * 0.25);
    ctx.lineTo(0, cy + br * 0.25);
    ctx.stroke();
    if (pushing) {
      for (let i = 0; i < 16; i++) {
        const x = face - 20 - ((clock * 160 + i * 41) % (face - 20));
        ctx.fillStyle = CHIP;
        ctx.fillRect(x, cy + br * 0.25 - 6, 5, 4);
      }
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(front + 30, cy - br * 0.55);
      ctx.lineTo(front + 6, cy - br * 0.55);
      ctx.moveTo(front + 14, cy - br * 0.55 - 6);
      ctx.lineTo(front + 6, cy - br * 0.55);
      ctx.lineTo(front + 14, cy - br * 0.55 + 6);
      ctx.stroke();
    }
    // a small cross-section of the ring being built
    const ix = 30, iy = h * 0.14, ro = Math.min(22, h * 0.1), ri = ro * 0.72;
    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = Math.PI / 2 + (i * Math.PI * 2) / SEGMENTS + 0.05, a1 = a0 + (Math.PI * 2) / SEGMENTS - 0.1;
      ctx.fillStyle = i < s.placed ? CONCRETE : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(ix, iy, ro, a0, a1);
      ctx.arc(ix, iy, ri, a1, a0, true);
      ctx.closePath();
      ctx.fill();
    }
    label(ctx, t('next ring: {n} of {total} segments', { n: s.placed, total: SEGMENTS }), ix + ro + 8, iy, { size: 11, color: C.soft, align: 'left' });
    label(ctx, t('thrust jacks'), (shoe + bulk) / 2, cy + br + 12, { size: 10, color: TEAL });
    label(ctx, t('tunnel lining'), Math.max(36, front - rw * 3.2), cy + br + 12, { size: 10, color: CONCRETE });
  };

  const message = refused === 'jacks-out'
    ? t('The jacks are fully out. Build a ring in the gap so they have something to push on.')
    : refused === 'ring-unfinished'
      ? t('The ring isn’t finished: the jacks need a complete ring to push against.')
      : refused === 'no-gap'
        ? t('No gap yet: mine first to make room for the next ring.')
        : !s.extended
          ? t('The jacks rest on the newest ring: ready to mine.')
          : s.placed === 0
            ? t('Pushed forward one ring’s width. Now build a ring in the gap.')
            : t('Building the ring: keep placing segments.');

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A tunnel boring machine with {r} rings of lining built behind it', { r: s.rings })} />
      <div className="lab__row">
        <Btn onClick={() => act(mine(s))} disabled={pushing}>{t('Mine one stroke')}</Btn>
        <Btn onClick={() => act(place(s))} disabled={pushing} ghost>{t('Place a segment')}</Btn>
      </div>
      <p className="lab__note" aria-live="polite" style={refused ? { color: RED } : undefined}>{message}</p>
      <Readouts
        items={[
          { label: t('Rings of lining built'), value: `${s.rings} / ${GOAL_RINGS}`, tone: s.rings >= GOAL_RINGS ? 'good' : undefined },
          { label: t('Thrust jacks'), value: s.extended ? t('fully out') : t('against the ring') },
        ]}
      />
      <p className="lab__note">{t('Simplified: the ring width and six segments per ring are for illustration, not the Hudson Tunnel’s design.')}</p>
    </div>
  );
}
