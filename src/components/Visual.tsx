import { useId, type CSSProperties, type ReactNode } from 'react';
import type { Slide } from '../types';
import { inline } from '../lib/markdown';
import { withUnit } from '../lib/format';

type Of<T extends Slide['type']> = Extract<Slide, { type: T }>;

/** Renders whichever visual slide this is: a graphic drawn from the slide's numbers. */
export function VisualSlide({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'chart':
      return <ChartSlideView slide={slide} />;
    case 'pictogram':
      return <PictogramSlideView slide={slide} />;
    case 'scale':
      return <ScaleSlideView slide={slide} />;
    case 'spectrum':
      return <SpectrumSlideView slide={slide} />;
    case 'flow':
      return <FlowSlideView slide={slide} />;
    default:
      return null;
  }
}

function Frame({ kicker, heading, note, children }: { kicker: string; heading: string; note?: string; children: ReactNode }) {
  return (
    <div className="slide__center visual">
      <p className="slide__heading">{kicker}</p>
      <p className="visual__title">{inline(heading)}</p>
      {children}
      {note && <p className="visual__note">{inline(note)}</p>}
    </div>
  );
}

/** Horizontal bars, longest at 100%. */
export function ChartSlideView({ slide }: { slide: Of<'chart'> }) {
  const max = Math.max(...slide.items.map((d) => d.value));
  return (
    <Frame kicker="In numbers" heading={slide.heading} note={slide.note}>
      <ul className="chart" aria-label="Bar chart">
        {slide.items.map((d, i) => (
          <li key={i} className={`chart__row${d.emphasis ? ' chart__row--on' : ''}`}>
            <span className="chart__label">{d.label}</span>
            <span className="chart__value">{withUnit(d.value, slide.unit)}</span>
            <span className="chart__track" aria-hidden="true">
              <span className="chart__bar" style={{ width: `${(d.value / max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** Grid shape for a pictogram: columns that divide the total evenly where possible, and an icon size that fits. */
function pictogramGrid(total: number): { cols: number; size: 'xl' | 'lg' | 'md' | 'sm' } {
  const cols = total <= 5 ? total : total <= 25 ? ([5, 6, 4, 7, 8].find((c) => total % c === 0) ?? 5) : 10;
  const rows = Math.ceil(total / cols);
  const size = cols <= 5 && rows <= 2 ? 'xl' : rows <= 3 ? 'lg' : rows <= 5 ? 'md' : 'sm';
  return { cols, size };
}

/** "3 in 10": a grid of icons with the first `count` lit up. */
export function PictogramSlideView({ slide }: { slide: Of<'pictogram'> }) {
  const { cols, size } = pictogramGrid(slide.total);
  return (
    <Frame kicker="In proportion" heading={slide.heading} note={slide.note}>
      <div
        className={`pictogram pictogram--${size}`}
        style={{ '--cols': cols } as CSSProperties}
        role="img"
        aria-label={`${slide.count} of ${slide.total} highlighted`}
      >
        {Array.from({ length: slide.total }, (_, i) => (
          <span key={i} className={i < slide.count ? 'pictogram__on' : 'pictogram__off'} aria-hidden="true">
            {slide.icon}
          </span>
        ))}
      </div>
      <p className="pictogram__ratio">
        <strong>{slide.count}</strong> of {slide.total}
      </p>
    </Frame>
  );
}

/** Circles whose areas are proportional to the values, sitting on one baseline. */
export function ScaleSlideView({ slide }: { slide: Of<'scale'> }) {
  const W = 320;
  const R = 76;
  const max = Math.max(...slide.items.map((d) => d.value));
  const radii = slide.items.map((d) => Math.max(3, Math.sqrt(d.value / max) * R));
  // Each circle gets a slot at least wide enough for a short label; slots shrink together if they don't fit.
  let slots = radii.map((r) => Math.max(2 * r + 14, 84));
  const fit = Math.min(1, (W - 8) / slots.reduce((a, b) => a + b, 0));
  slots = slots.map((w) => w * fit);
  const spare = (W - 8 - slots.reduce((a, b) => a + b, 0)) / slots.length;
  slots = slots.map((w) => w + spare);
  const base = 10 + 2 * R * fit;
  let x = 4;
  const circles = slide.items.map((d, i) => {
    const cx = x + slots[i] / 2;
    x += slots[i];
    return { d, cx, r: radii[i] * fit };
  });
  const describe = slide.items.map((d) => `${d.label}: ${withUnit(d.value, slide.unit)}`).join(', ');
  return (
    <Frame kicker="To scale" heading={slide.heading} note={slide.note}>
      <svg className="scale" viewBox={`0 0 ${W} ${base + 4}`} role="img" aria-label={describe}>
        <line className="scale__base" x1="4" x2={W - 4} y1={base} y2={base} />
        {circles.map(({ d, cx, r }, i) => (
          <circle key={i} className={d.emphasis ? 'scale__item scale__item--on' : 'scale__item'} cx={cx} cy={base - r} r={r} />
        ))}
      </svg>
      <div className="scale__labels" aria-hidden="true">
        {slide.items.map((d, i) => (
          <span key={i} style={{ width: `${(slots[i] / (W - 8)) * 100}%` }}>
            {d.label}
            <strong>{withUnit(d.value, slide.unit)}</strong>
          </span>
        ))}
      </div>
    </Frame>
  );
}

/** A vertical gradient bar with labelled points along it. */
export function SpectrumSlideView({ slide }: { slide: Of<'spectrum'> }) {
  const gradient = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const W = 320;
  const barX = 22;
  const barW = 20;
  const top = 26;
  const bottom = 214;
  const span = slide.max - slide.min;
  const yOf = (v: number) => bottom - ((v - slide.min) / span) * (bottom - top);
  const marks = slide.marks.map((m) => ({ ...m, y: yOf(m.value) })).sort((a, b) => a.y - b.y);
  // Labels keep a minimum gap: nudged down from the top, then back up if they run off the bottom.
  const GAP = 32;
  const ys = marks.map((m) => m.y);
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + GAP);
  const over = ys[ys.length - 1] - (bottom + 4);
  if (over > 0) {
    ys[ys.length - 1] -= over;
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - GAP);
  }
  const [low, high] = slide.colors ?? ['#38bdf8', '#fbbf24'];
  const mid = barX + barW / 2;
  const describe = marks.map((m) => `${m.label}: ${withUnit(m.value, slide.unit)}`).join(', ');
  return (
    <Frame kicker="On the scale" heading={slide.heading} note={slide.note}>
      <svg className="spectrum" viewBox={`0 0 ${W} 240`} role="img" aria-label={describe}>
        <defs>
          <linearGradient id={gradient} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={low} />
            <stop offset="1" stopColor={high} />
          </linearGradient>
        </defs>
        <rect x={barX} y={top} width={barW} height={bottom - top} rx={barW / 2} fill={`url(#${gradient})`} />
        {slide.ends && (
          <>
            <text className="spectrum__end" x={mid} y={bottom + 18} textAnchor="middle">
              {slide.ends[0]}
            </text>
            <text className="spectrum__end" x={mid} y={top - 10} textAnchor="middle">
              {slide.ends[1]}
            </text>
          </>
        )}
        {marks.map((m, i) => (
          <g key={i} className={m.emphasis ? 'spectrum__mark spectrum__mark--on' : 'spectrum__mark'}>
            <circle cx={mid} cy={m.y} r={m.emphasis ? 6 : 4.5} />
            <polyline points={`${barX + barW + 2},${m.y} ${barX + barW + 10},${m.y} ${barX + barW + 18},${ys[i]} ${barX + barW + 24},${ys[i]}`} />
            <text className="spectrum__label" x={barX + barW + 30} y={ys[i] - 2}>
              {m.label}
            </text>
            <text className="spectrum__value" x={barX + barW + 30} y={ys[i] + 12}>
              {withUnit(m.value, slide.unit)}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/** Steps joined by arrows, optionally looping back to the start. */
export function FlowSlideView({ slide }: { slide: Of<'flow'> }) {
  return (
    <Frame kicker={slide.cycle ? 'The cycle' : 'Step by step'} heading={slide.heading}>
      <ol className="flow">
        {slide.steps.map((s, i) => (
          <li key={i} className="flow__step">
            <span className="flow__icon" aria-hidden="true">
              {s.icon ?? i + 1}
            </span>
            <span className="flow__label">{inline(s.label)}</span>
          </li>
        ))}
      </ol>
      {slide.cycle && <p className="flow__again">↻ and round it goes again</p>}
    </Frame>
  );
}
