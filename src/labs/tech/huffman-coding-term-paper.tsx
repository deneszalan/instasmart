import { useMemo, useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export interface Node {
  count: number;
  symbol?: string;
  left?: Node;
  right?: Node;
  /** Order of creation, so ties break the same way every time. */
  id: number;
}

/** The starting forest: one card per symbol, rarest first. */
export function forest(text: string): Node[] {
  const counts = new Map<string, number>();
  for (const ch of text) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return [...counts].map(([symbol, count], id) => ({ count, symbol, id })).sort((a, b) => a.count - b.count || a.id - b.id);
}

/** Huffman's step: tie the two rarest trees under a new branch. */
export function tieRarest(trees: Node[], id: number): Node[] {
  const [a, b, ...rest] = trees;
  const merged: Node = { count: a.count + b.count, left: a, right: b, id };
  return [...rest, merged].sort((x, y) => x.count - y.count || x.id - y.id);
}

export function codes(node: Node, prefix = '', out = new Map<string, string>()): Map<string, string> {
  if (node.symbol !== undefined) out.set(node.symbol, prefix || '0');
  if (node.left) codes(node.left, `${prefix}0`, out);
  if (node.right) codes(node.right, `${prefix}1`, out);
  return out;
}

const show = (s: string) => (s === ' ' ? '␣' : s);

export default function Huffman({ onDone }: LabProps) {
  const [text, setText] = useState('ABRACADABRA');
  const [trees, setTrees] = useState(() => forest('ABRACADABRA'));
  const [next, setNext] = useState(100);
  const done = trees.length === 1;
  const [own, setOwn] = useState(false);
  useGoal(done && own, onDone);

  const type = (s: string) => {
    const clean = s.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 24);
    setText(clean);
    setTrees(forest(clean));
    setOwn(true);
  };
  const table = useMemo(() => (done && trees[0] ? codes(trees[0]) : null), [done, trees]);
  const distinct = forest(text).length;
  const fixed = text.length * Math.max(1, Math.ceil(Math.log2(Math.max(2, distinct))));
  const huff = table ? [...text].reduce((n, ch) => n + table.get(ch)!.length, 0) : null;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // Every tree of the forest side by side: leaves left to right along the bottom, each branch above its two children.
    const pos = new Map<Node, [number, number]>();
    let leafX = 0;
    const leaves = trees.reduce((n, tr) => n + countLeaves(tr), 0);
    const depth = Math.max(0, ...trees.map(height));
    const step = (w - 24) / Math.max(1, leaves), levelH = Math.min(44, (h - 44) / Math.max(1, depth));
    const place = (n: Node): [number, number] => {
      let p: [number, number];
      if (n.symbol !== undefined) p = [12 + step * (leafX++ + 0.5), h - 22];
      else {
        const l = place(n.left!), r = place(n.right!);
        p = [(l[0] + r[0]) / 2, Math.min(l[1], r[1]) - levelH];
      }
      pos.set(n, p);
      return p;
    };
    trees.forEach(place);
    for (const [n, [x, y]] of pos) {
      if (!n.left || !n.right) continue;
      for (const [child, bit, side] of [[n.left, '0', -1], [n.right, '1', 1]] as const) {
        const [cx, cy] = pos.get(child)!;
        line(ctx, x, y, cx, cy, C.bad, 2);
        label(ctx, bit, (x + cx) / 2 + side * 7, (y + cy) / 2, { size: 10, color: C.soft });
      }
    }
    for (const [n, [x, y]] of pos) {
      const leaf = n.symbol !== undefined, bw = leaf ? Math.min(32, step - 3) : 24;
      ctx.fillStyle = leaf ? '#fef3c7' : '#fca5a5';
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, y - 11, bw, 22, 6);
      ctx.fill();
      label(ctx, leaf ? `${show(n.symbol!)}${n.count}` : String(n.count), x, y, { size: 11, color: '#111', weight: 800 });
    }
  };

  return (
    <div className="lab">
      <div className="lab__row">
        <input className="lab__text" value={text} onChange={(e) => type(e.target.value)} aria-label={t('Text to encode')} spellCheck={false} />
        <Btn onClick={() => { setTrees((tr) => tieRarest(tr, next)); setNext((n) => n + 1); }} disabled={done || trees.length < 2}>
          {t('Tie the two rarest')}
        </Btn>
      </div>
      <Stage draw={draw} label={t('The Huffman tree, built from the letter counts')} />
      {table ? (
        <p className="huffman__codes">
          {[...table].sort((a, b) => a[1].length - b[1].length).map(([s, c]) => (
            <span key={s}>
              <b>{show(s)}</b> {c}
            </span>
          ))}
        </p>
      ) : (
        <p className="lab__note">{t('{n} trees left. Tie the two with the smallest counts.', { n: trees.length })}</p>
      )}
      <Readouts
        items={[
          { label: t('8 bits a letter'), value: text.length * 8 },
          { label: t('Fixed {k}-bit code', { k: Math.max(1, Math.ceil(Math.log2(Math.max(2, distinct)))) }), value: fixed },
          { label: t('Huffman'), value: huff ?? '?', tone: 'accent' },
        ]}
      />
    </div>
  );
}

function countLeaves(n: Node): number {
  return n.symbol !== undefined ? 1 : countLeaves(n.left!) + countLeaves(n.right!);
}

function height(n: Node): number {
  return n.symbol !== undefined ? 0 : 1 + Math.max(height(n.left!), height(n.right!));
}
