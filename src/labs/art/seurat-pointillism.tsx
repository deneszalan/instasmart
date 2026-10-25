import { useMemo, useState } from 'react';
import { Choice, label, Range, Readouts, Stage, useGoal, rng, type LabProps } from '../kit';
import { t } from '../../i18n';

type RGB = [number, number, number];
const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const toSrgb = (v: number) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));

/** What the eye gets from dots too small to tell apart: the average of their light (not of the paint), share of colour a. */
export const mixLight = (a: RGB, b: RGB, share = 0.5): RGB => a.map((c, i) => toSrgb(share * toLinear(c) + (1 - share) * toLinear(b[i]))) as RGB;

/** Relative brightness (luminance) of a colour, 0 to 1. */
export const brightness = ([r, g, b]: RGB) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

const PAIRS: Record<string, [RGB, RGB]> = {
  ry: [[230, 30, 40], [255, 214, 0]],
  rg: [[230, 30, 40], [30, 170, 70]],
  by: [[35, 80, 220], [255, 214, 0]],
};

export default function Pointillism({ onDone }: LabProps) {
  const [pair, setPair] = useState('ry');
  const [back, setBack] = useState(0);
  const [share, setShare] = useState(50);
  const [merged, setMerged] = useState(new Set<string>());
  const [a, b] = PAIRS[pair], mix = mixLight(a, b, share / 100);
  const blend = Math.min(1, Math.max(0, (back - 50) / 45));
  useGoal(merged.size >= 2, onDone);
  const step = (v: number) => {
    setBack(v);
    if (v >= 90) setMerged((m) => new Set(m).add(pair));
  };
  const pick = (p: string) => {
    setPair(p);
    if (back >= 90) setMerged((m) => new Set(m).add(p));
  };

  // which dots are which colour stays fixed as you step back, so only their size changes
  const coins = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 4000 }, () => r());
  }, []);
  const css = (c: RGB) => `rgb(${c.join(',')})`;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pw = w * 0.62, size = 15 - 13.6 * Math.min(1, back / 85);
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(0, 0, pw, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, pw, h);
    ctx.clip();
    let k = 0;
    for (let y = 0, row = 0; y < h + size; y += size * 0.87, row++)
      for (let x = row % 2 ? size / 2 : 0; x < pw + size; x += size) {
        ctx.fillStyle = css(coins[k++ % coins.length] * 100 < share ? a : b);
        ctx.beginPath();
        ctx.arc(x, y, size * 0.56, 0, Math.PI * 2);
        ctx.fill();
        if (size > 4) {
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    // from far enough away the eye can no longer separate the dots
    if (blend > 0) {
      ctx.globalAlpha = blend;
      ctx.fillStyle = css(mix);
      ctx.fillRect(0, 0, pw, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // the two paints and the light they average to
    const sx = pw + 12, sw = w - sx - 10, sh = (h - 40) / 3;
    [a, b, mix].forEach((c, i) => {
      ctx.fillStyle = css(c);
      ctx.fillRect(sx, 10 + i * (sh + 10), sw, sh);
    });
    label(ctx, t('dot'), sx + sw / 2, 10 + sh / 2, { size: 10.5, color: '#111' });
    label(ctx, t('dot'), sx + sw / 2, 20 + sh * 1.5, { size: 10.5, color: '#111' });
    label(ctx, t('average'), sx + sw / 2, 30 + sh * 2.5, { size: 10.5, color: '#111' });
  };

  const pct = (c: RGB) => `${Math.round(brightness(c) * 100)}%`;
  return (
    <div className="lab">
      <Choice
        label={t('Two colours of dots')}
        value={pair}
        onChange={pick}
        options={[
          { value: 'ry', label: t('Red + yellow') },
          { value: 'rg', label: t('Red + green') },
          { value: 'by', label: t('Blue + yellow') },
        ]}
      />
      <Stage draw={draw} label={t('A patch of coloured dots, and the colour they average to')} />
      <Range label={t('Step back')} value={back} min={0} max={100} onChange={step} format={(v) => (v >= 90 ? t('far') : v >= 50 ? t('farther') : t('close'))} />
      <Range label={t('Share of the first')} value={share} min={10} max={90} onChange={setShare} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('Brightness of the dots'), value: `${pct(a)} · ${pct(b)}` },
          { label: t('Of the mix'), value: pct(mix), tone: 'accent' },
        ]}
      />
    </div>
  );
}
