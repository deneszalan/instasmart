import { useState } from 'react';
import { C, Choice, label, line, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Grimm’s law as a chain: each row of sounds moved one step in early Germanic, while Latin (or Sanskrit) kept the older one. */
export const CHAIN: [string, string][][] = [
  [['p', 'f'], ['t', 'þ'], ['k', 'h']],
  [['b', 'p'], ['d', 't'], ['g', 'k']],
  [['bʰ', 'b'], ['dʰ', 'd'], ['gʰ', 'g']],
];

/** Cousins that show it: a word keeping the older sound, its English relative, and the sound that moved. */
export const PAIRS: { old: string; lang: string; english: string; from: string; to: string }[] = [
  { old: 'pēs', lang: 'Latin', english: 'foot', from: 'p', to: 'f' },
  { old: 'trēs', lang: 'Latin', english: 'three', from: 't', to: 'þ' },
  { old: 'canis', lang: 'Latin', english: 'hound', from: 'k', to: 'h' },
  { old: 'decem', lang: 'Latin', english: 'ten', from: 'd', to: 't' },
  { old: 'gelū', lang: 'Latin', english: 'cold', from: 'g', to: 'k' },
  { old: 'bhrā́tar', lang: 'Sanskrit', english: 'brother', from: 'bʰ', to: 'b' },
];

export default function Grimm({ onDone, active }: LabProps) {
  const [k, setK] = useState(0);
  const [f, setF] = useState(0);
  const [seen, setSeen] = useState(new Set([0]));
  useGoal(seen.size === PAIRS.length, onDone);
  useFrame((dt) => setF((x) => Math.min(1, x + dt * 0.8)), active && f < 1);
  const pick = (i: number) => {
    setK(i);
    setF(0);
    setSeen((s) => new Set(s).add(i));
  };

  const pair = PAIRS[k], lang = pair.lang === 'Latin' ? t('Latin') : t('Sanskrit');
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the chain of shifts
    const gx = 12, gw = w * 0.46, gh = h - 20, cw = gw / 3, rh = gh / 3;
    CHAIN.forEach((row, r) =>
      row.forEach(([a, b], c) => {
        const x = gx + c * cw, y = 10 + r * rh, on = a === pair.from;
        ctx.fillStyle = on ? 'rgba(253,224,71,0.18)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);
        label(ctx, `${a} → ${b}`, x + cw / 2, y + rh / 2, { size: Math.min(15, cw * 0.24), color: on ? C.accent : C.soft });
      }),
    );
    // the two cousins, with the sound that shifted
    const x0 = gx + gw + 16, mid = x0 + (w - x0) / 2, y1 = h * 0.3, y2 = h * 0.74;
    label(ctx, `${lang}: ${pair.old}`, mid, y1, { size: 17, color: C.ink });
    label(ctx, `${t('English')}: ${pair.english}`, mid, y2, { size: 17, color: f >= 1 ? C.good : 'rgba(255,255,255,0.35)' });
    line(ctx, mid, y1 + 14, mid, y1 + 14 + (y2 - y1 - 34) * f, C.accent, 2);
    label(ctx, `${pair.from} → ${pair.to}`, mid + 10, (y1 + y2) / 2, { size: 13, align: 'left', color: C.accent });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Grimm’s law: {a} {b} and English {c}', { a: lang, b: pair.old, c: pair.english })} />
      <Choice label={t('Cousins')} value={k} onChange={pick} options={PAIRS.map((p, i) => ({ value: i, label: p.english }))} />
      <p className="lab__note">{t('Each row moved one step in early Germanic, like links in a chain.')}</p>
    </div>
  );
}
