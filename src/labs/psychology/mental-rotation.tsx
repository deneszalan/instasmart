import { useEffect, useRef, useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Flat figures of cubes with no mirror symmetry: no turn makes a figure match its mirror image. */
export const SHAPES: [number, number][][] = [
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2], [1, 3]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [2, 3]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2], [1, 3]],
];
export const ANGLES = [0, 60, 120, 180];
const PER_ANGLE = 3;

interface Trial {
  shape: number;
  angle: number;
  turn: number; // the signed turn, degrees
  mirror: boolean;
}
interface Answer extends Trial {
  ms: number;
  right: boolean;
}

/** Twelve trials: every angle three times, half of them mirror images, in random order. */
export function makeTrials(rand = Math.random): Trial[] {
  const list: Trial[] = [];
  ANGLES.forEach((angle, i) => {
    for (let k = 0; k < PER_ANGLE; k++) list.push({ shape: Math.floor(rand() * SHAPES.length), angle, turn: angle * (rand() < 0.5 ? -1 : 1), mirror: (k + i) % 2 === 0 });
  });
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** The average time of the right answers at each angle, in ms (NaN where there are none). */
export const meanTimes = (answers: Answer[]) =>
  ANGLES.map((a) => {
    const ok = answers.filter((x) => x.angle === a && x.right);
    return ok.length ? ok.reduce((s, x) => s + x.ms, 0) / ok.length : NaN;
  });

export default function MentalRotation({ onDone }: LabProps) {
  const [trials, setTrials] = useState<Trial[]>(() => makeTrials());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [stage, setStage] = useState<'ready' | 'trial' | 'feedback' | 'done'>('ready');
  const shownAt = useRef(0);
  const n = answers.length, current = trials[n];
  useGoal(stage === 'done', onDone);

  useEffect(() => {
    if (stage === 'trial') requestAnimationFrame(() => (shownAt.current = performance.now()));
    if (stage === 'feedback') {
      const id = setTimeout(() => setStage(answers.length >= trials.length ? 'done' : 'trial'), 550);
      return () => clearTimeout(id);
    }
  }, [stage, n]);

  const answer = (mirror: boolean) => {
    if (stage !== 'trial') return;
    setAnswers((a) => [...a, { ...current, ms: performance.now() - shownAt.current, right: mirror === current.mirror }]);
    setStage('feedback');
  };
  const again = () => {
    setTrials(makeTrials());
    setAnswers([]);
    setStage('trial');
  };

  const figure = (ctx: CanvasRenderingContext2D, cells: [number, number][], x: number, y: number, size: number, turn: number, mirror: boolean, color: string) => {
    const cx = cells.reduce((s, c) => s + c[0] + 0.5, 0) / cells.length, cy = cells.reduce((s, c) => s + c[1] + 0.5, 0) / cells.length;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((turn * Math.PI) / 180);
    if (mirror) ctx.scale(-1, 1);
    for (const [i, j] of cells) {
      const px = (i - cx) * size, py = (j - cy) * size;
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(px + 1, py + 1, size - 2, size * 0.18);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(px + 1, py + size * 0.82, size - 2, size * 0.18 - 1);
    }
    ctx.restore();
  };

  const times = meanTimes(answers);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (stage === 'done') {
      // the reader's own result: average time to answer at each angle
      const L = 44, R = w - 14, top = 20, bot = h - 26, max = Math.max(1500, ...times.filter(Number.isFinite)) * 1.1;
      for (let ms = 0; ms <= max; ms += 1000) {
        const y = bot - (ms / max) * (bot - top);
        line(ctx, L, y, R, y, C.line, 1);
        label(ctx, t('{s} s', { s: ms / 1000 }), L - 6, y, { size: 10, align: 'right', color: C.faint });
      }
      const bw = (R - L) / ANGLES.length;
      ANGLES.forEach((a, i) => {
        const v = times[i], x = L + i * bw;
        if (Number.isFinite(v)) {
          const y = bot - (v / max) * (bot - top);
          ctx.fillStyle = C.accent;
          ctx.fillRect(x + bw * 0.22, y, bw * 0.56, bot - y);
          label(ctx, formatNumber(Math.round(v / 10) / 100), x + bw / 2, y - 9, { size: 11, color: C.ink });
        } else label(ctx, t('none right'), x + bw / 2, bot - 9, { size: 10, color: C.faint });
        label(ctx, `${a}°`, x + bw / 2, bot + 12, { size: 11, color: C.ink });
      });
      label(ctx, t('your average time to answer, by how far the figure was turned'), w / 2, 8, { size: 10.5 });
      return;
    }
    const size = Math.min(w / 11, h / 6.2);
    if (stage === 'ready' || !current) {
      label(ctx, t('Same figure turned, or its mirror image?'), w / 2, h / 2 - 10, { size: 13, color: C.ink });
      label(ctx, t('Answer as fast as you can without mistakes.'), w / 2, h / 2 + 12, { size: 11.5 });
      return;
    }
    const shape = SHAPES[current.shape];
    figure(ctx, shape, w * 0.27, h / 2, size, 0, false, '#fb7185');
    figure(ctx, shape, w * 0.73, h / 2, size, current.turn, current.mirror, '#2dd4bf');
    if (stage === 'feedback') {
      const last = answers[answers.length - 1];
      label(ctx, last.right ? '✓' : '✗', w / 2, h / 2, { size: 30, color: last.right ? C.good : C.bad });
    }
    label(ctx, `${Math.min(n + 1, trials.length)} / ${trials.length}`, w / 2, 12, { size: 11, color: C.faint });
  };

  const right = answers.filter((a) => a.right).length;
  return (
    <div className="lab">
      <Stage draw={draw} label={stage === 'done' ? t('Your times to answer at 0, 60, 120 and 180 degrees') : t('Two figures of cubes: the second is the first turned, or its mirror image')} />
      <div className="lab__row">
        {stage === 'ready' && <Btn onClick={() => setStage('trial')}>{t('Start the test')}</Btn>}
        {(stage === 'trial' || stage === 'feedback') && (
          <>
            <Btn onClick={() => answer(false)}>{t('Same, turned')}</Btn>
            <Btn onClick={() => answer(true)}>{t('Mirror image')}</Btn>
          </>
        )}
        {stage === 'done' && (
          <Btn ghost onClick={again}>
            {t('Test again')}
          </Btn>
        )}
      </div>
      <Readouts
        items={[
          { label: t('Right'), value: `${right} / ${n}`, tone: 'good' },
          { label: t('At 0°'), value: Number.isFinite(times[0]) ? t('{s} s', { s: formatNumber(Math.round(times[0] / 10) / 100) }) : '–' },
          { label: t('At 180°'), value: Number.isFinite(times[3]) ? t('{s} s', { s: formatNumber(Math.round(times[3] / 10) / 100) }) : '–', tone: 'accent' },
        ]}
      />
    </div>
  );
}
