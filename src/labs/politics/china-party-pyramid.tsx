import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The layers of China's Communist Party, from its members (2022) to the General Secretary. */
export const LAYERS = [
  { name: 'Party members', people: 96_000_000 },
  { name: 'National Congress', people: 2296 },
  { name: 'Central Committee', people: 205 },
  { name: 'Politburo', people: 24 },
  { name: 'Standing Committee', people: 7 },
  { name: 'General Secretary', people: 1 },
] as const;

/** How many party members there are for each seat on a layer. */
export const membersPerSeat = (level: number) => LAYERS[0].people / LAYERS[level].people;

/** A big count in words: 13.7 million, 41,812, 7. */
function count(n: number): string {
  return n >= 1e6 ? t('{n} million', { n: formatNumber(Math.round(n / 1e5) / 10) }) : formatNumber(Math.round(n));
}

export default function PartyPyramid({ onDone }: LabProps) {
  const [level, setLevel] = useState(0);
  useGoal(level === LAYERS.length - 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const n = LAYERS.length, band = (h - 8) / n;
    LAYERS.forEach((layer, i) => {
      const bw = (w - 20) * (1 - (i / (n - 1)) * 0.82), y = h - 4 - (i + 1) * band, on = i === level, passed = i < level;
      ctx.fillStyle = on ? C.accent : passed ? 'rgba(253,224,71,0.25)' : 'rgba(255,255,255,0.12)';
      ctx.fillRect((w - bw) / 2, y + 3, bw, band - 6);
      label(ctx, t(layer.name), w / 2, y + band / 2 - 7, { size: 12, color: on ? '#1f1b0a' : C.ink });
      label(ctx, formatNumber(layer.people), w / 2, y + band / 2 + 9, { size: 11, weight: 600, color: on ? '#1f1b0a' : C.soft });
    });
  };

  const layer = LAYERS[level];
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The party pyramid, at the {name}', { name: t(layer.name) })} />
      <Range label={t('Step up')} value={level} min={0} max={LAYERS.length - 1} step={1} onChange={setLevel} format={(v) => t(LAYERS[v].name)} />
      <Readouts
        items={[
          { label: t('People'), value: formatNumber(layer.people) },
          { label: t('Members per seat'), value: count(membersPerSeat(level)), tone: 'accent' },
          { label: t('Out of the layer below'), value: level ? t('1 in {n}', { n: formatNumber(Math.round((LAYERS[level - 1].people / layer.people) * 10) / 10) }) : '–' },
        ]}
      />
    </div>
  );
}
