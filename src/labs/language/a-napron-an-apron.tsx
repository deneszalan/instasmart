import { useRef, useState } from 'react';
import { C, font, label, Stage, useFrame, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/** Phrases whose n hopped across the word space: the older phrase, then the modern word it left behind. */
export const HOPS: { from: [string, string]; to: [string, string]; word: string }[] = [
  { from: ['a', 'napron'], to: ['an', 'apron'], word: 'apron' },
  { from: ['a', 'nadder'], to: ['an', 'adder'], word: 'adder' },
  { from: ['a', 'noumpere'], to: ['an', 'oumpere'], word: 'umpire' },
  { from: ['an', 'ekename'], to: ['a', 'nekename'], word: 'nickname' },
  { from: ['an', 'ewte'], to: ['a', 'newte'], word: 'newt' },
];

/** Moving the n across the space: from the start of the noun onto the article, or back the other way. */
export function hop([art, noun]: [string, string]): [string, string] {
  return art.endsWith('n') && art.length > 1 ? [art.slice(0, -1), 'n' + noun] : [art + 'n', noun.slice(1)];
}

export default function NHop({ onDone, active }: LabProps) {
  const [moved, setMoved] = useState<boolean[]>(HOPS.map(() => false));
  const [anim, setAnim] = useState<{ row: number; f: number } | null>(null);
  const rows = useRef<{ y: number; nx: number }[]>([]);
  useGoal(moved.every(Boolean), onDone);
  useFrame((dt) => {
    if (!anim) return;
    if (anim.f + dt * 2.5 >= 1) {
      setMoved((m) => m.map((v, i) => (i === anim.row ? !v : v)));
      setAnim(null);
    } else setAnim({ ...anim, f: anim.f + dt * 2.5 });
  }, active && anim !== null);

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down' || anim) return;
    const i = rows.current.findIndex((r) => Math.abs(r.y - p.y) < 16);
    if (i >= 0) setAnim({ row: i, f: 0 });
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const rh = (h - 10) / HOPS.length, size = Math.min(22, rh * 0.62);
    const width = (s: string) => {
      font(ctx, size, 800);
      return ctx.measureText(s).width;
    };
    const space = width('n') * 1.3;
    rows.current = [];
    HOPS.forEach((hp, i) => {
      const y = 5 + rh * (i + 0.5), [art, noun] = moved[i] ? hp.to : hp.from, hopping = anim?.row === i;
      const nOnArt = art.endsWith('n') && art.length > 1, x0 = 14;
      // the article and the noun, with the n that can hop drawn on its own
      const base = nOnArt ? art.slice(0, -1) : art, rest = nOnArt ? noun : noun.slice(1);
      const nounX = x0 + width(art) + space;
      label(ctx, base, x0, y, { size, weight: 800, color: C.ink, align: 'left' });
      label(ctx, rest, nOnArt ? nounX : nounX + width('n'), y, { size, weight: 800, color: C.ink, align: 'left' });
      // the n sits at the end of the article or the start of the noun, and hops to the other place
      const from = nOnArt ? x0 + width(base) : nounX, to = nOnArt ? x0 + width(base) + space : x0 + width(art);
      const nx = hopping ? from + (to - from) * anim!.f : from;
      label(ctx, 'n', nx, y - (hopping ? Math.sin(anim!.f * Math.PI) * size : 0), { size, weight: 800, color: C.accent, align: 'left' });
      rows.current.push({ y, nx });
      label(ctx, moved[i] ? `→ ${hp.word}` : t('tap'), w - 12, y, { size: moved[i] ? 13 : 10.5, align: 'right', color: moved[i] ? C.good : C.faint });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Five Middle English phrases; tap one to move its n across the word space')} />
      <p className="lab__note">{t('Tap a phrase to hop its yellow n over the space.')}</p>
    </div>
  );
}
