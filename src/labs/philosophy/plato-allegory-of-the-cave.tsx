import { useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

type Thing = 'ball' | 'can' | 'cone' | 'cube';
type Shape = 'circle' | 'rect' | 'triangle' | 'square';
/** What a thing's shadow looks like, held one way or another: a ball, a can end-on and a cone point-on all give a circle. */
export const SHADOWS: { thing: Thing; view: string; shadow: Shape }[] = [
  { thing: 'ball', view: 'any', shadow: 'circle' },
  { thing: 'can', view: 'end', shadow: 'circle' },
  { thing: 'can', view: 'side', shadow: 'rect' },
  { thing: 'cone', view: 'point', shadow: 'circle' },
  { thing: 'cone', view: 'side', shadow: 'triangle' },
  { thing: 'cube', view: 'face', shadow: 'square' },
];

/** How much bigger the shadow is than the thing: the wall's distance from the fire over the thing's. */
export const shadowScale = (fireToThing: number, fireToWall: number) => fireToWall / fireToThing;

export default function Cave({ onDone }: LabProps) {
  const [round, setRound] = useState(() => Math.floor(Math.random() * SHADOWS.length));
  const [turned, setTurned] = useState(false);
  const [guess, setGuess] = useState<Thing | null>(null);
  const [played, setPlayed] = useState(0);
  const [right, setRight] = useState(0);
  const [near, setNear] = useState(40);
  useGoal(played >= 4, onDone);
  const card = SHADOWS[round];
  const names: Record<Thing, string> = { ball: t('a ball'), can: t('a can'), cone: t('a cone'), cube: t('a box') };

  const answer = (g: Thing) => {
    if (guess) return;
    setGuess(g);
    setTurned(true);
    setPlayed((n) => n + 1);
    if (g === card.thing) setRight((n) => n + 1);
  };
  const next = () => {
    setRound((r) => (r + 1 + Math.floor(Math.random() * (SHADOWS.length - 1))) % SHADOWS.length);
    setGuess(null);
    setTurned(false);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the cave wall the prisoners face, lit by a fire behind them
    ctx.fillStyle = '#44291a';
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, w * 0.6);
    glow.addColorStop(0, 'rgba(251,146,60,0.55)');
    glow.addColorStop(1, 'rgba(251,146,60,0.05)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    const scale = shadowScale(near / 10, 10), r = Math.min(h * 0.38, 12 * scale), cx = turned ? w * 0.3 : w * 0.5, cy = h * 0.46;
    ctx.fillStyle = 'rgba(10,6,4,0.85)';
    ctx.beginPath();
    if (card.shadow === 'circle') ctx.arc(cx, cy, r, 0, Math.PI * 2);
    else if (card.shadow === 'rect') ctx.rect(cx - r * 0.7, cy - r, r * 1.4, r * 2);
    else if (card.shadow === 'square') ctx.rect(cx - r, cy - r, r * 2, r * 2);
    else {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.9, cy + r);
      ctx.lineTo(cx - r * 0.9, cy + r);
      ctx.closePath();
    }
    ctx.fill();
    label(ctx, t('the shadow on the wall'), cx, h - 10, { size: 10, color: 'rgba(255,255,255,0.6)' });
    if (turned) {
      // turned round: the real thing, carried past the fire
      const ox = w * 0.74, oy = h * 0.46, s = Math.min(h * 0.22, 30);
      ctx.fillStyle = '#d6a76b';
      ctx.strokeStyle = '#7c4a1e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (card.thing === 'ball') ctx.arc(ox, oy, s, 0, Math.PI * 2);
      else if (card.thing === 'cube') ctx.rect(ox - s, oy - s, s * 2, s * 2);
      else if (card.thing === 'can') {
        if (card.view === 'end') ctx.ellipse(ox, oy, s, s, 0, 0, Math.PI * 2);
        else ctx.rect(ox - s * 0.7, oy - s, s * 1.4, s * 2);
      } else if (card.view === 'point') ctx.ellipse(ox, oy, s, s, 0, 0, Math.PI * 2);
      else {
        ctx.moveTo(ox, oy - s);
        ctx.lineTo(ox + s * 0.9, oy + s);
        ctx.lineTo(ox - s * 0.9, oy + s);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      const views: Record<string, string> = { any: '', end: t('seen end-on'), side: t('side-on'), point: t('point first'), face: '' };
      label(ctx, `${names[card.thing]} ${views[card.view]}`.trim(), ox, oy + s + 16, { size: 11, color: C.ink });
      label(ctx, guess === card.thing ? '✓' : '✗', ox, 16, { size: 16, color: guess === card.thing ? C.good : C.bad });
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={turned ? t('The shadow and the real thing') : t('A shadow on the cave wall')} />
      <Range label={t('Carried near the fire')} value={near} min={15} max={80} onChange={setNear} format={(v) => (v < 35 ? t('close') : v < 60 ? t('halfway') : t('near the wall'))} />
      <div className="lab__row">
        <span className="lab__note">{t('What casts it?')}</span>
        {(['ball', 'can', 'cone', 'cube'] as Thing[]).map((g) => (
          <Btn key={g} ghost={guess !== g} onClick={() => answer(g)} disabled={!!guess && guess !== g}>
            {names[g]}
          </Btn>
        ))}
        {guess && <Btn onClick={next}>{t('Next shadow')}</Btn>}
      </div>
      <Readouts
        items={[
          { label: t('Shadows named'), value: String(played) },
          { label: t('Right'), value: `${right} / ${played}`, tone: 'accent' },
        ]}
      />
    </div>
  );
}
