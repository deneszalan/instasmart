import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/** Half-life of rubidium-87, in billions of years (Wikipedia, "Rubidium–strontium dating"). */
export const HALF_LIFE = 49.23;
export const LAMBDA = Math.LN2 / HALF_LIFE;
/** Teghaza 001 was altered by water about 4.1 billion years ago and formed earlier (NASA, 29 October 2026). */
export const TARGET_AGE = 4.1;
/** Five made-up grains: their starting rubidium-87 ÷ strontium-86. */
export const GRAINS = [0.12, 0.45, 0.85, 1.35, 1.95];
export const START_MIX = 0.7;

/** The share of rubidium-87 that has turned into strontium-87 after `age` billion years. */
export const decayedShare = (age: number) => 1 - Math.exp(-LAMBDA * age);
/** The slope of the isochron after `age` billion years: e^(λt) − 1. */
export const slope = (age: number) => Math.exp(LAMBDA * age) - 1;
/** The age, in billions of years, that an isochron's slope gives. */
export const ageFromSlope = (s: number) => Math.log(1 + s) / LAMBDA;
/** Where a grain that started at rubidium ratio `x0` and strontium ratio `mix` sits after `age` billion years. */
export function grainAt(x0: number, age: number, mix = START_MIX) {
  const left = Math.exp(-LAMBDA * age);
  return { x: x0 * left, y: mix + x0 * (1 - left) };
}

const RB = '#a88bff', SR = '#4fd1c5', GOLD = '#f2c14e', ROSE = '#e8a3a0';

export default function RubidiumClock({ onDone }: LabProps) {
  const [age, setAge] = useState(0);
  const [mix, setMix] = useState(START_MIX);
  const s = slope(age);
  useGoal(Math.abs(age - TARGET_AGE) < 0.05 && Math.abs(mix - START_MIX) > 0.001, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 12, T = 12, B = h - 30, y0 = 0.69, y1 = 0.91;
    const X = (v: number) => L + ((R - L) * v) / 2.2, Y = (v: number) => B - ((B - T) * (v - y0)) / (y1 - y0);
    line(ctx, L, T, L, B, C.faint, 1.5);
    line(ctx, L, B, R, B, C.faint, 1.5);
    for (const v of [0, 1, 2]) label(ctx, formatNumber(v), X(v), B + 10, { size: 9.5, color: C.faint });
    for (const v of [0.7, 0.8, 0.9]) label(ctx, formatFixed(v, 1), L - 4, Y(v), { size: 9.5, align: 'right', color: C.faint });
    label(ctx, t('rubidium-87 ÷ strontium-86'), R, B + 22, { size: 9.5, align: 'right', color: RB });
    label(ctx, t('strontium-87 ÷ strontium-86'), L + 6, T + 4, { size: 9.5, align: 'left', color: SR });
    // the flat line the grains started on, and the line through them now
    line(ctx, X(0), Y(mix), X(2.1), Y(mix), C.line, 1.5, [4, 4]);
    line(ctx, X(0), Y(mix), X(2.1), Y(mix + 2.1 * s), GOLD, 2.5);
    dot(ctx, X(0), Y(mix), 4.5, SR);
    label(ctx, t('starting mix'), X(0) + 8, Y(mix) + 11, { size: 9.5, align: 'left', color: SR });
    for (const x0 of GRAINS) {
      const g = grainAt(x0, age, mix);
      dot(ctx, X(g.x), Y(g.y), 6, ROSE);
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('After {a} billion years the grains lie on a line of slope {s}', { a: formatNumber(age), s: formatFixed(s, 3) })} />
      <Range label={t('Age of the rock')} value={age} min={0} max={5} step={0.1} onChange={(v) => setAge(Math.round(v * 10) / 10)} format={(v) => t('{n} billion years old', { n: formatFixed(v, 1) })} />
      <Range label={t('Strontium mix it started with')} value={mix} min={0.7} max={0.75} step={0.005} onChange={setMix} format={(v) => formatFixed(v, 3)} />
      <Readouts
        items={[
          { label: t('Rubidium-87 turned into strontium-87'), value: `${formatFixed(decayedShare(age) * 100, 1)}%` },
          { label: t('Slope of the line'), value: formatFixed(s, 3), tone: 'accent' },
          { label: t('Age read from the slope'), value: t('{n} billion years old', { n: formatFixed(ageFromSlope(s), 1) }), tone: Math.abs(age - TARGET_AGE) < 0.05 ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: five made-up grains that started with the same strontium mix and kept all their atoms since. Half-life of rubidium-87: 49.23 billion years.')}</p>
    </div>
  );
}
