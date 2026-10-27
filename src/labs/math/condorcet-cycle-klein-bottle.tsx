import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Three groups of voters, as in Condorcet's paradox (Quanta Magazine, 26 October 2026): `a` rank
 * Alice > Bob > Carol, `b` rank Bob > Carol > Alice, `c` rank Carol > Alice > Bob. Each head-to-head is
 * [votes for the first, votes for the second].
 */
export function duels(a: number, b: number, c: number) {
  return { aliceBob: [a + c, b], bobCarol: [a + b, c], carolAlice: [b + c, a] } as const;
}

/** Alice beats Bob, Bob beats Carol and Carol beats Alice exactly when no group outnumbers the other two together. */
export const isCycle = (a: number, b: number, c: number) => a + c > b && a + b > c && b + c > a;

/** The candidate who beats both others head to head, if there is one. */
export function winner(a: number, b: number, c: number): 'Alice' | 'Bob' | 'Carol' | null {
  if (a > b + c) return 'Alice';
  if (b > a + c) return 'Bob';
  if (c > a + b) return 'Carol';
  return null;
}

const COL = { Alice: '#ff8a6b', Bob: '#4fd1c5', Carol: '#ffd166' } as const;

export default function CondorcetCycle({ onDone }: LabProps) {
  const [a, setA] = useState(30);
  const [b, setB] = useState(10);
  const [c, setC] = useState(10);
  const d = duels(a, b, c), cycle = isCycle(a, b, c), win = winner(a, b, c);
  useGoal(cycle && a > 0 && b > 0 && c > 0, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const r = Math.min(w, h) * 0.36, cx = w / 2, cy = h / 2 + 6;
    const pos = { Alice: [cx, cy - r], Bob: [cx + r * 0.95, cy + r * 0.6], Carol: [cx - r * 0.95, cy + r * 0.6] } as const;
    const pairs: [keyof typeof pos, keyof typeof pos, readonly [number, number]][] = [['Alice', 'Bob', d.aliceBob], ['Bob', 'Carol', d.bobCarol], ['Carol', 'Alice', d.carolAlice]];
    for (const [x, y, [vx, vy]] of pairs) {
      const [from, to] = vx > vy ? [x, y] : vy > vx ? [y, x] : [null, null];
      const [x0, y0] = pos[x], [x1, y1] = pos[y];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (!from || !to) {
        line(ctx, x0, y0, x1, y1, C.faint, 2, [5, 4]);
      } else {
        const [p0, p1] = [pos[from], pos[to]], ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
        const s = [p0[0] + Math.cos(ang) * 26, p0[1] + Math.sin(ang) * 26], e = [p1[0] - Math.cos(ang) * 28, p1[1] - Math.sin(ang) * 28];
        const col = cycle ? C.good : C.soft;
        line(ctx, s[0], s[1], e[0], e[1], col, 2.5);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(e[0], e[1]);
        ctx.lineTo(e[0] - Math.cos(ang - 0.45) * 10, e[1] - Math.sin(ang - 0.45) * 10);
        ctx.lineTo(e[0] - Math.cos(ang + 0.45) * 10, e[1] - Math.sin(ang + 0.45) * 10);
        ctx.fill();
      }
      label(ctx, `${formatNumber(Math.max(vx, vy))}–${formatNumber(Math.min(vx, vy))}`, mx + (my > cy ? 0 : mx > cx ? 22 : -22), my + (my > cy ? 14 : 0), { size: 11, color: C.ink });
    }
    for (const [name, [x, y]] of Object.entries(pos)) {
      dot(ctx, x, y, 22, COL[name as keyof typeof COL]);
      label(ctx, name, x, y, { size: 11, color: '#111' });
    }
  };

  const verdict = cycle ? t('none: a circle') : win ?? t('a tie somewhere');
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Head-to-head results between Alice, Bob and Carol; majority winner: {w}', { w: verdict })} />
      <Range label="Alice > Bob > Carol" value={a} min={0} max={50} step={1} onChange={setA} />
      <Range label="Bob > Carol > Alice" value={b} min={0} max={50} step={1} onChange={setB} />
      <Range label="Carol > Alice > Bob" value={c} min={0} max={50} step={1} onChange={setC} />
      <Readouts items={[{ label: t('Majority winner'), value: verdict, tone: cycle ? 'good' : undefined }]} />
      <p className="lab__note">{t('Each slider: a group of voters with that ranking.')}</p>
    </div>
  );
}
