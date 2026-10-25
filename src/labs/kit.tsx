import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

/** What every lab gets from its explore slide. */
export interface LabProps {
  /** Call once the reader has reached the lab's goal; the slide then shows its takeaway. */
  onDone: () => void;
  /** False while the slide is off screen: labs pause their animations. */
  active: boolean;
}

/** Colours for drawing on the lab's dark stage, which sits on the post's gradient. */
export const C = {
  ink: '#ffffff',
  soft: 'rgba(255,255,255,0.72)',
  faint: 'rgba(255,255,255,0.28)',
  line: 'rgba(255,255,255,0.14)',
  accent: '#fde047',
  good: '#86efac',
  bad: '#fca5a5',
  cool: '#7dd3fc',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export interface Size {
  w: number;
  h: number;
}

/** A point on the stage, in CSS pixels from its top-left corner. */
export interface StagePointer {
  x: number;
  y: number;
  kind: 'down' | 'move' | 'up';
}

/**
 * A canvas that fills its box at the screen's pixel density and redraws whenever `draw` changes or the box
 * resizes. Pass a fresh `draw` each render (it closes over the lab's state). Drags on it don't scroll the post.
 */
export function Stage({
  draw,
  label,
  onPointer,
  className = '',
  children,
}: {
  draw: (ctx: CanvasRenderingContext2D, size: Size) => void;
  label: string;
  onPointer?: (p: StagePointer) => void;
  className?: string;
  children?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  const dragging = useRef(false);

  useLayoutEffect(() => {
    const el = box.current!;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !size.w || !size.h) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(size.w * dpr) || cv.height !== Math.round(size.h * dpr)) {
      cv.width = Math.round(size.w * dpr);
      cv.height = Math.round(size.h * dpr);
    }
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    draw(ctx, size);
  });

  const point = (e: ReactPointerEvent, kind: StagePointer['kind']) => {
    const r = box.current!.getBoundingClientRect();
    onPointer?.({ x: e.clientX - r.left, y: e.clientY - r.top, kind });
  };

  return (
    <div
      ref={box}
      className={`lab__stage${onPointer ? ' lab__stage--drag' : ''} ${className}`}
      onPointerDown={
        onPointer &&
        ((e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          point(e, 'down');
        })
      }
      onPointerMove={onPointer && ((e) => dragging.current && point(e, 'move'))}
      onPointerUp={
        onPointer &&
        ((e) => {
          dragging.current = false;
          point(e, 'up');
        })
      }
      onPointerCancel={() => (dragging.current = false)}
    >
      <canvas ref={canvas} role="img" aria-label={label} />
      {children}
    </div>
  );
}

/** Calls `tick(dt, elapsed)` every frame while `running`, with dt in seconds (capped, so a hidden tab doesn't jump). */
export function useFrame(tick: (dt: number, elapsed: number) => void, running: boolean) {
  const ref = useRef(tick);
  ref.current = tick;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const start = last;
    let frame = requestAnimationFrame(function loop(now) {
      ref.current(Math.min(0.05, (now - last) / 1000), (now - start) / 1000);
      last = now;
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [running]);
}

/** A labelled slider with its value shown beside it. */
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = String,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="lab__range">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
      />
      <output>{format(value)}</output>
    </label>
  );
}

/** A row of buttons, one of them chosen. */
export function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="lab__choice" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Btn({ children, onClick, ghost, disabled, label }: { children: ReactNode; onClick: () => void; ghost?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button className={`lab__btn${ghost ? ' lab__btn--ghost' : ''}`} onClick={onClick} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

/** Numbers to read off: a label above each value. */
export function Readouts({ items }: { items: { label: string; value: ReactNode; tone?: 'good' | 'bad' | 'accent' }[] }) {
  return (
    <div className="lab__readouts" aria-live="polite">
      {items.map((item) => (
        <div key={item.label} className={`lab__readout${item.tone ? ` lab__readout--${item.tone}` : ''}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

/** Calls `onDone` the first time `reached` is true. */
export function useGoal(reached: boolean, onDone: () => void) {
  const fired = useRef(false);
  useEffect(() => {
    if (reached && !fired.current) {
      fired.current = true;
      onDone();
    }
  }, [reached, onDone]);
}

// Canvas helpers

export function font(ctx: CanvasRenderingContext2D, size: number, weight = 700) {
  ctx.font = `${weight} ${size}px ${FONT}`;
}

export function label(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  { size = 12, weight = 700, color = C.soft, align = 'center', base = 'middle' }: { size?: number; weight?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline } = {},
) {
  font(ctx, size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(s, x, y);
}

export function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = C.faint, width = 1.5, dash: number[] = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color = C.ink) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A seeded random number generator (mulberry32), so a lab can replay the same random run. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The colour of light of wavelength `nm`, roughly as the eye sees it; red beyond 700 nm. */
export function wavelengthColour(nm: number, light = 60, alpha = 1): string {
  const hue = nm < 440 ? 270 - ((nm - 400) / 40) * 30 : nm < 490 ? 240 - ((nm - 440) / 50) * 60 : nm < 580 ? 180 - ((nm - 490) / 90) * 120 : 60 - ((nm - 580) / 120) * 60;
  return `hsla(${Math.max(0, hue)}, 95%, ${light}%, ${alpha})`;
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Sound for a lab. Returns a getter for a Web Audio context, made on first use (browsers allow sound only after
 * a tap) and closed when the lab goes away; null where the device has none. The context is suspended while the
 * slide is off screen.
 */
export function useAudio(active: boolean) {
  const ref = useRef<AudioContext | null>(null);
  useEffect(() => () => void ref.current?.close(), []);
  useEffect(() => {
    if (!active) void ref.current?.suspend();
  }, [active]);
  return () => {
    try {
      ref.current ??= new AudioContext();
      void ref.current.resume();
      return ref.current;
    } catch {
      return null;
    }
  };
}

/** A short plucked or struck note at `when` (audio time), fading out over `length` seconds. */
export function pluck(ac: AudioContext, freq: number, when: number, { length = 0.6, type = 'triangle', gain = 0.12 }: { length?: number; type?: OscillatorType; gain?: number } = {}) {
  const osc = ac.createOscillator(), env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(gain, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + length);
  osc.connect(env).connect(ac.destination);
  osc.start(when);
  osc.stop(when + length + 0.05);
}
