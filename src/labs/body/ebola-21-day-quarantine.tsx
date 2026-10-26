import { useState } from 'react';
import { C, Choice, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Generations drawn after the first case. */
export const GENERATIONS = 4;

export interface Node {
  gen: number;
  parent: number;
  /** A fixed random number: the node is on a contact list when it is below the share found. */
  u: number;
  kids: number[];
}

/**
 * Every infection that could happen, as a tree: a case who isn't isolated infects `spread` − 1, `spread` or
 * `spread` + 1 people (on average `spread`). The same random numbers are used for every setting.
 */
export function possibleTree(spread: number, seed = 4): Node[] {
  const r = rng(seed), nodes: Node[] = [{ gen: 0, parent: -1, u: 1, kids: [] }];
  for (let i = 0; i < nodes.length; i++) {
    const v = r(), u = r();
    if (i) nodes[i].u = u;
    if (nodes[i].gen >= GENERATIONS) continue;
    const n = spread - 1 + Math.floor(v * 3);
    for (let j = 0; j < n; j++) {
      nodes[i].kids.push(nodes.length);
      nodes.push({ gen: nodes[i].gen + 1, parent: i, u: 0, kids: [] });
    }
  }
  return nodes;
}

/**
 * Which infections happen when a share `found` of contacts is traced. A traced contact is watched for 21 days and
 * isolated at the first fever, before they are infectious, so they infect no one; the first case was not traced.
 */
export function outbreak(nodes: Node[], found: number) {
  const happens = nodes.map(() => false), traced = nodes.map(() => false);
  happens[0] = true;
  for (let i = 1; i < nodes.length; i++) {
    const p = nodes[i].parent;
    happens[i] = happens[p] && !traced[p];
    traced[i] = happens[i] && nodes[i].u < found;
  }
  const perGen = Array.from({ length: GENERATIONS + 1 }, (_, g) => nodes.filter((n, i) => happens[i] && n.gen === g).length);
  return { happens, traced, perGen };
}

/** New cases per case on average: only the untraced ones pass the virus on. */
export const perCase = (spread: number, found: number) => spread * (1 - found);

const CASE = '#e07a5f', WATCHED = '#f2cc8f';

export default function EbolaTracing({ onDone }: LabProps) {
  const [spread, setSpread] = useState(2);
  const [found, setFound] = useState(20);
  const nodes = possibleTree(spread);
  const f = found / 100;
  const { happens, traced, perGen } = outbreak(nodes, f);
  const r = perCase(spread, f);
  useGoal(r < 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 22, R = w - 14, T = 22, B = h - 10;
    const X = (g: number) => L + ((R - L) * g) / GENERATIONS;
    // lay the tree out: leaves in order, parents in the middle of their children
    const y = nodes.map(() => 0);
    const leaves: number[] = [];
    const visit = (i: number) => {
      const kids = nodes[i].kids.filter((c) => happens[c]);
      if (!kids.length) leaves.push(i);
      kids.forEach(visit);
    };
    visit(0);
    const gap = (B - T) / Math.max(1, leaves.length);
    leaves.forEach((i, j) => (y[i] = T + gap * (j + 0.5)));
    for (let i = nodes.length - 1; i >= 0; i--) {
      const kids = nodes[i].kids.filter((c) => happens[c]);
      if (happens[i] && kids.length) y[i] = kids.reduce((s, c) => s + y[c], 0) / kids.length;
    }
    for (let g = 0; g <= GENERATIONS; g++) label(ctx, g ? t('Gen. {n}', { n: g }) : t('First case'), X(g), 9, { size: 9.5, color: C.faint, align: g === 0 ? 'left' : g === GENERATIONS ? 'right' : 'center' });
    const rad = Math.max(1.8, Math.min(6, gap * 0.38));
    nodes.forEach((n, i) => {
      if (!happens[i] || n.parent < 0) return;
      ctx.strokeStyle = traced[i] ? 'rgba(242,204,143,0.35)' : 'rgba(224,122,95,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X(n.gen - 1), y[n.parent]);
      ctx.lineTo(X(n.gen), y[i]);
      ctx.stroke();
    });
    nodes.forEach((n, i) => {
      if (!happens[i]) return;
      ctx.beginPath();
      ctx.arc(X(n.gen), y[i], i === 0 ? 7 : rad, 0, Math.PI * 2);
      if (traced[i]) {
        ctx.strokeStyle = WATCHED;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = CASE;
        ctx.fill();
      }
    });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Each case not isolated infects')}
        value={spread}
        onChange={setSpread}
        options={[
          { value: 2, label: t('2 people') },
          { value: 3, label: t('3 people') },
        ]}
      />
      <Stage draw={draw} label={t('Chains of infection over four generations when {p} of contacts are traced', { p: `${found}%` })} />
      <Range label={t('Contacts found')} value={found} min={0} max={100} step={5} onChange={setFound} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('New cases per case'), value: formatNumber(Math.round(r * 100) / 100), tone: r < 1 ? 'good' : 'bad' },
          { label: t('Generation 4, this run'), value: formatNumber(perGen[GENERATIONS]) },
          { label: t('Outbreak'), value: r < 1 ? t('shrinks') : r > 1 ? t('grows') : t('holds steady'), tone: r < 1 ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified model. Filled: cases who spread the virus. Rings: traced contacts, isolated at their first fever, before they can infect anyone.')}</p>
    </div>
  );
}
