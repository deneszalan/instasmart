import { useRef, useState } from 'react';
import { Btn, C, label, line, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Who the refugees of 1956–57 were, per 100 who left Hungary: 66 men, 70 aged 15 to 39, 15 under 18 (Tadeusz Kopyś,
 * 2024, from the statistics of the time). The reader guesses each share, checks, and tries to get all three within
 * five of the real figure. The reader drags along each row to set a guess.
 */
export type TraitId = 'men' | 'young' | 'minors';
export const ACTUAL: Record<TraitId, number> = { men: 66, young: 70, minors: 15 };
export const TRAITS: TraitId[] = ['men', 'young', 'minors'];
export const CLOSE = 5;
/** How far a guess is from the real share, in points. */
export const off = (id: TraitId, guess: number) => Math.abs(guess - ACTUAL[id]);
/** The goal: every guess within CLOSE points. */
export const allClose = (guesses: Record<TraitId, number>) => TRAITS.every((id) => off(id, guesses[id]) <= CLOSE);

const WARM = '#f4ddb0', BLUE = '#7fb6e6';

export default function WhoLeft({ onDone }: LabProps) {
  const [g, setG] = useState<Record<TraitId, number>>({ men: 50, young: 50, minors: 50 });
  const [checked, setChecked] = useState(false);
  useGoal(checked && allClose(g), onDone);

  const name = (id: TraitId) => (id === 'men' ? t('Men, of every 100') : id === 'young' ? t('Aged 15 to 39, of every 100') : t('Under 18, of every 100'));
  const size = useRef({ w: 300, h: 200 });
  const row = useRef<TraitId | null>(null);
  const onPointer = (p: StagePointer) => {
    const { w, h } = size.current, rowH = h / 3, x0 = w * 0.42, x1 = w - 14;
    if (p.kind === 'down') row.current = TRAITS[Math.max(0, Math.min(2, Math.floor(p.y / rowH)))];
    if (p.kind === 'up' || !row.current) return;
    const v = Math.round(Math.max(0, Math.min(100, ((p.x - x0) / (x1 - x0)) * 100)));
    const r = row.current;
    setG((old) => ({ ...old, [r]: v }));
    setChecked(false);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    const x0 = w * 0.42, x1 = w - 14, X = (v: number) => x0 + ((x1 - x0) * v) / 100, rowH = h / 3;
    TRAITS.forEach((id, i) => {
      const y = i * rowH + rowH * 0.55;
      label(ctx, name(id), 8, y, { size: 10, color: C.soft, align: 'left' });
      line(ctx, x0, y, x1, y, C.line, 8);
      if (checked) {
        // the real share, and how close the guess came
        ctx.fillStyle = WARM; ctx.fillRect(x0, y - 4, X(ACTUAL[id]) - x0, 8);
        const ok = off(id, g[id]) <= CLOSE;
        label(ctx, formatNumber(ACTUAL[id]), X(ACTUAL[id]), y - 12, { size: 10, color: ok ? C.good : C.bad });
      }
      // the guess, with its number in the dot
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(X(g[id]), y, 9, 0, Math.PI * 2); ctx.fill();
      label(ctx, formatNumber(g[id]), X(g[id]), y, { size: 8, color: '#0a1018' });
    });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        onPointer={onPointer}
        label={t('Your guesses of who left Hungary in 1956–57: {a} men, {b} aged 15 to 39, {c} under 18, of every 100', {
          a: formatNumber(g.men),
          b: formatNumber(g.young),
          c: formatNumber(g.minors),
        })}
      />
      <Btn onClick={() => setChecked(true)}>{t('Check my guesses')}</Btn>
      {checked && (
        <p className="lab__note">
          {allClose(g) ? t('All three within five: a young exodus, mostly men.') : t('Not all within five yet. Drag the dots and check again.')}
        </p>
      )}
    </div>
  );
}
