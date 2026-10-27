import { useEffect, useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export type Mode = 'build' | 'clear';
export type Level = 'ruins' | 'roman' | 'church4' | 'church12';

/**
 * San Clemente's history, step by step: the buildings burned in AD 64; in the late 1st century their ruins were filled
 * with earth and two Roman buildings put on top (a Mithraeum was set up in one around AD 200); in the 4th century
 * those lower floors were filled and a church built above (it existed by AD 392); around 1100 that church was filled
 * with rubble to the tops of its columns and today's church built on it.
 */
export const STEPS: { year: number; adds: Level | null; mithraeum?: boolean }[] = [
  { year: 64, adds: 'ruins' },
  { year: 90, adds: 'roman' },
  { year: 200, adds: null, mithraeum: true },
  { year: 392, adds: 'church4' },
  { year: 1100, adds: 'church12' },
];

/**
 * What stands at the site after `step`, bottom first. Building on top keeps every older level, buried under the
 * newer ones; clearing the ruins away (a what-if) leaves only the newest building, on the old ground.
 */
export function site(step: number, mode: Mode): Level[] {
  const levels: Level[] = [];
  for (let i = 0; i <= step && i < STEPS.length; i++) {
    const add = STEPS[i].adds;
    if (!add) continue;
    if (mode === 'clear') levels.length = 0;
    levels.push(add);
  }
  return levels;
}

/** The levels buried under the floor of the newest building. */
export const buried = (step: number, mode: Mode) => Math.max(0, site(step, mode).length - 1);

const COLOUR: Record<Level, string> = { ruins: '#a4553a', roman: '#c9a86a', church4: '#bfae8d', church12: '#e9dcc0' };
const HEIGHT: Record<Level, number> = { ruins: 0.17, roman: 0.31, church4: 0.24, church12: 0.28 };

function levelName(l: Level) {
  if (l === 'ruins') return t('buildings burned in AD 64');
  if (l === 'roman') return t('Roman buildings, late 1st century');
  if (l === 'church4') return t('church of the 4th century');
  return t('today’s church, c. 1100–1120');
}
function stepName(i: number) {
  if (i === 0) return t('AD 64: the great fire');
  if (i === 1) return t('Late 1st century: two Roman buildings');
  if (i === 2) return t('About AD 200: a Mithraeum');
  if (i === 3) return t('4th century: a church');
  return t('About 1100: today’s church');
}

export default function SanClementeLevels({ onDone }: LabProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>('build');
  const [seen, setSeen] = useState<Record<Mode, boolean>>({ build: false, clear: false });
  const last = STEPS.length - 1;
  useEffect(() => {
    if (step === last) setSeen((s) => (s[mode] ? s : { ...s, [mode]: true }));
  }, [step, mode, last]);
  useGoal(seen.build && seen.clear, onDone);

  const levels = site(step, mode);
  const mith = step >= 2 && levels.includes('roman');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 16, R = w - 16, ground = h - 18, unit = ground - 8;
    // the original ground, and the earth below it
    ctx.fillStyle = 'rgba(120,90,60,0.35)';
    ctx.fillRect(0, ground, w, h - ground);
    line(ctx, 0, ground, w, ground, C.soft, 1.5);
    label(ctx, t('ground before AD 64'), R, ground + 10, { size: 9.5, align: 'right', color: C.faint });
    let y = ground;
    levels.forEach((l, i) => {
      const hh = HEIGHT[l] * unit, top = y - hh, isTop = i === levels.length - 1;
      // a buried level: its building, filled with earth or rubble up to its top
      ctx.fillStyle = COLOUR[l];
      ctx.globalAlpha = isTop ? 1 : 0.55;
      ctx.fillRect(L + 10, top, R - L - 20, hh);
      ctx.globalAlpha = 1;
      if (!isTop) {
        ctx.fillStyle = 'rgba(90,78,64,0.75)';
        ctx.fillRect(L + 10, top, R - L - 20, hh);
        for (let k = 0; k < 40; k++) {
          ctx.fillStyle = 'rgba(200,180,150,0.35)';
          ctx.fillRect(L + 14 + ((k * 53) % (R - L - 30)), top + 4 + ((k * 31) % Math.max(4, hh - 8)), 4, 3);
        }
      }
      const two = l === 'roman' && mith;
      label(ctx, levelName(l), L + 18, top + hh / 2 - (two ? 6 : 0), { size: 10.5, align: 'left', color: isTop ? '#1b1511' : C.ink });
      if (two) label(ctx, t('with the Mithraeum'), L + 18, top + hh / 2 + 7, { size: 10, weight: 600, align: 'left', color: isTop ? '#1b1511' : C.ink });
      y = top;
    });
    // today's floor height marker
    line(ctx, L, y, R, y, C.accent, 1.5, [4, 3]);
  };

  const deepest = levels[0];
  return (
    <div className="lab">
      <Choice
        label={t('When they rebuilt, the builders')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'build', label: t('built on the ruins') },
          { value: 'clear', label: t('cleared the ruins away') },
        ]}
      />
      <Stage draw={draw} label={t('A section through the site of San Clemente, {n} levels buried', { n: buried(step, mode) })} />
      <Range label={t('Step through San Clemente’s history')} value={step} min={0} max={last} step={1} onChange={(v) => setStep(Math.round(v))} format={(v) => `${Math.round(v) + 1} / ${STEPS.length}`} />
      <Readouts
        items={[
          { label: t('San Clemente at this step'), value: stepName(step) },
          { label: t('Levels buried under the floor'), value: String(buried(step, mode)), tone: buried(step, mode) ? 'good' : 'accent' },
          { label: t('Deepest level to dig down to'), value: deepest ? levelName(deepest) : '–' },
        ]}
      />
      <p className="lab__note">{t('Heights are schematic. “Cleared the ruins away” is a what-if: at San Clemente, the builders filled each old building and built on top.')}</p>
    </div>
  );
}
