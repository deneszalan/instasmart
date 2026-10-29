import { useEffect, useRef, useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, pluck, useAudio, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The rhythm of Steve Reich's Clapping Music (1972): 12 beats, 1 = clap, 0 = rest (three, two, one, two claps). */
export const PATTERN = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0] as const;
export const BEATS = PATTERN.length;

/** The second clapper after `shift` moves: each move takes the first beat of the pattern to the end. */
export const shifted = (shift: number) => PATTERN.map((_, i) => PATTERN[(i + shift) % BEATS]);

/** Beats where both clap, where one claps, and where nobody does. */
export function overlap(shift: number) {
  const q = shifted(shift);
  let both = 0, silent = 0;
  PATTERN.forEach((p, i) => {
    if (p && q[i]) both++;
    if (!p && !q[i]) silent++;
  });
  return { both, one: BEATS - both - silent, silent };
}

/** Positions where every one of the 12 beats has a clap in it. */
export const NO_SILENCE = Array.from({ length: BEATS }, (_, s) => s).filter((s) => overlap(s).silent === 0);

const PINK = '#ff6fae', BLUE = '#5ec8ff', YELLOW = '#fff07a';
const BEAT = 0.2; // seconds a beat lasts when played

export default function ClappingMusic({ onDone, active }: LabProps) {
  const [shift, setShift] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(-1);
  const audio = useAudio(active);
  const clock = useRef<{ ac: AudioContext | null; start: number; until: number }>({ ac: null, start: 0, until: 0 });
  const o = overlap(shift % BEATS);
  const [found, setFound] = useState<number[]>([]);
  useEffect(() => {
    if (o.silent === 0 && !found.includes(shift % BEATS)) setFound([...found, shift % BEATS]);
  }, [shift]);
  useGoal(found.length === NO_SILENCE.length, onDone);
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  const now = () => (clock.current.ac ? clock.current.ac.currentTime : performance.now() / 1000);
  const play = () => {
    if (playing) {
      setPlaying(false);
      setBeat(-1);
      return;
    }
    const ac = audio();
    const start = (ac ? ac.currentTime : performance.now() / 1000) + 0.15;
    clock.current = { ac, start, until: start };
    setPlaying(true);
  };

  // schedule the claps a little ahead from the audio clock; clapper 1 high, clapper 2 low
  useFrame(() => {
    const c = clock.current, tNow = now();
    setBeat(Math.max(0, Math.floor((tNow - c.start) / BEAT)) % BEATS);
    if (!c.ac) return;
    const q = shifted(shift % BEATS);
    for (let k = Math.ceil((c.until - c.start) / BEAT - 1e-9); c.start + k * BEAT < tNow + 0.15; k++) {
      const when = c.start + k * BEAT, i = k % BEATS;
      if (when >= tNow) {
        if (PATTERN[i]) pluck(c.ac, 1320, when, { length: 0.06, type: 'square', gain: 0.05 });
        if (q[i]) pluck(c.ac, 740, when, { length: 0.07, type: 'square', gain: 0.05 });
      }
      c.until = when + BEAT / 2;
    }
  }, active && playing);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 8, cw = (w - 2 * L) / BEATS, rh = (h - 24) / 3, q = shifted(shift % BEATS);
    const rows: [string, readonly number[] | number[], string][] = [
      [t('clapper 1'), PATTERN, PINK],
      [t('clapper 2'), q, BLUE],
    ];
    if (playing && beat >= 0) {
      ctx.fillStyle = 'rgba(255,240,122,0.14)';
      ctx.fillRect(L + beat * cw, 0, cw, h);
    }
    rows.forEach(([name, pat, col], r) => {
      const y = 12 + r * rh + rh / 2;
      label(ctx, name, L, y - rh * 0.42, { size: 10, align: 'left', color: col });
      pat.forEach((on, i) => {
        const x = L + i * cw + cw / 2;
        ctx.fillStyle = on ? col : 'rgba(255,255,255,0.12)';
        ctx.beginPath();
        ctx.arc(x, y + 4, on ? Math.min(cw, rh) * 0.3 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    // what you hear: both together (big yellow), one alone (white), nobody (empty box)
    const y = 12 + 2 * rh + rh / 2;
    label(ctx, t('what you hear'), L, y - rh * 0.42, { size: 10, align: 'left', color: YELLOW });
    PATTERN.forEach((p, i) => {
      const x = L + i * cw + cw / 2, n = p + q[i];
      if (n === 0) {
        ctx.strokeStyle = PINK;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x - cw * 0.32, y + 4 - cw * 0.32, cw * 0.64, cw * 0.64);
        ctx.setLineDash([]);
        return;
      }
      ctx.fillStyle = n === 2 ? YELLOW : C.ink;
      ctx.beginPath();
      ctx.arc(x, y + 4, Math.min(cw, rh) * (n === 2 ? 0.34 : 0.2), 0, Math.PI * 2);
      ctx.fill();
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Clapping Music with the second clapper {n} beats ahead: {b} claps together, {s} silent beats', { n: shift, b: o.both, s: o.silent })} />
      <Range label={t('Beats ahead')} value={shift} min={0} max={12} onChange={setShift} />
      <div className="lab__row">
        <Btn onClick={play}>{playing ? t('Stop') : t('Play the claps')}</Btn>
        <Readouts
          items={[
            { label: t('Claps together'), value: `${o.both}` },
            { label: t('Silent beats'), value: `${o.silent}`, tone: o.silent === 0 ? 'good' : undefined },
            { label: t('No-silence positions found'), value: `${found.length} / ${NO_SILENCE.length}` },
          ]}
        />
      </div>
      <p className="lab__note">{t('Clapper 1 sounds high, clapper 2 low. At 12 beats ahead the two are back in unison, as at 0.')}</p>
    </div>
  );
}
