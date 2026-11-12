import { useState } from 'react';
import { Btn, C, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Who was punished after 1956. The Kádár regime called the revolution a counter-revolution of "class enemies":
 * Horthy-era officers, landowners, capitalists. But, as the 1956 Institute writes (Szakolczai Attila, Az 1956-os
 * forradalom története, lesson 5), even by cosmetic and falsified statistics no more than five per cent of those
 * convicted could be shown to be "Horthyists" or "class aliens"; the great majority were workers, peasants, employees
 * and students. The reader guesses the share on a grid of 100 people, then reveals the regime's own upper bound.
 */
export const CLASS_ENEMIES_MAX_PCT = 5;
export const GRID = 100;

/** How far a guess (in per cent) is from the regime's own upper bound. */
export const missBy = (guess: number) => Math.abs(guess - CLASS_ENEMIES_MAX_PCT);

/** How many of the 100 people a share in per cent lights up. */
export const lit = (pct: number) => Math.round((Math.max(0, Math.min(100, pct)) * GRID) / 100);

const RED = '#b4474b', STONE = '#a7a39a', CANDLE = '#e9b44c';

export default function Reprisals({ onDone }: LabProps) {
  const [guess, setGuess] = useState(50);
  const [shown, setShown] = useState(false);
  useGoal(shown, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cols = 20, rows = GRID / cols, s = Math.min((w - 20) / cols, (h * 0.66) / rows), x0 = (w - s * cols) / 2, y0 = h * 0.16;
    const nGuess = lit(guess), nReal = lit(CLASS_ENEMIES_MAX_PCT);
    for (let i = 0; i < GRID; i++) {
      const x = x0 + (i % cols) * s + s / 2, y = y0 + Math.floor(i / cols) * s + s / 2;
      const isGuess = i < nGuess, isReal = shown && i < nReal;
      ctx.fillStyle = isReal ? RED : isGuess ? (shown ? 'rgba(233,180,76,0.35)' : CANDLE) : 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.17, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - s * 0.17, y + s * 0.08, s * 0.34, s * 0.3);
    }
    label(ctx, t('100 people sentenced after 1956'), w / 2, 12, { size: 11, color: C.soft });
    const yb = y0 + rows * s + 16;
    label(ctx, t('Your guess: {n} “class enemies” in 100', { n: formatNumber(nGuess) }), 10, yb, { size: 11, color: CANDLE, align: 'left' });
    if (shown) {
      label(ctx, t('The regime’s own figures: at most {n}', { n: formatNumber(nReal) }), 10, yb + 18, { size: 11, color: RED, align: 'left' });
      label(ctx, t('The rest: workers, peasants, clerks, students'), 10, yb + 36, { size: 11, color: STONE, align: 'left' });
    }
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('A grid of 100 people sentenced after 1956: your guess is {n} “class enemies”', { n: formatNumber(lit(guess)) })}
      />
      <Range label={t('“Class enemies” among them')} value={guess} min={0} max={100} step={1} onChange={(v) => { setGuess(v); }} format={(v) => `${formatNumber(v)}%`} />
      <Btn onClick={() => setShown(true)} disabled={shown}>
        {t('Show the regime’s own figures')}
      </Btn>
    </div>
  );
}
