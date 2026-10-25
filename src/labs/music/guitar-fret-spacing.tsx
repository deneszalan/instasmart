import { useEffect, useRef, useState } from 'react';
import { Btn, C, Choice, dot, label, line, Readouts, Stage, useAudio, useFrame, useGoal, pluck, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const SCALE = 650; // mm from the nut to the bridge
const OPEN = 110; // Hz: the open A string
const FRETS = 19;
const SEMITONE = Math.pow(2, 1 / 12);

/** How far fret `n` sits from the nut on a string `scale` mm long: each fret leaves 1/1.0595 of the string before it. */
export const fretPosition = (n: number, scale = SCALE) => scale * (1 - Math.pow(SEMITONE, -n));

/** The width of the gap between fret n − 1 and fret n. */
export const fretGap = (n: number, scale = SCALE) => fretPosition(n, scale) - fretPosition(n - 1, scale);

/** The fret you press when your finger is `mm` from the nut: the next one towards the bridge (0 for the open string). */
export const fretUnder = (mm: number) => (mm <= 0 ? 0 : Math.min(FRETS, Math.ceil(-12 * Math.log2(1 - mm / SCALE) - 1e-9)));

export default function FretSpacing({ onDone, active }: LabProps) {
  const [finger, setFinger] = useState(0); // mm from the nut
  const [fretted, setFretted] = useState<'frets' | 'free'>('frets');
  const [plucked, setPlucked] = useState(-10); // time of the last pluck
  const [time, setTime] = useState(0);
  const [heard, setHeard] = useState(0);
  const audio = useAudio(active);
  useFrame((dt) => setTime((s) => s + dt), active);

  const fret = fretUnder(finger);
  const stop = fretted === 'frets' ? fretPosition(fret) : finger; // where the vibrating part begins
  const length = SCALE - stop, freq = (OPEN * SCALE) / length, ratio = freq / OPEN;
  useGoal(Math.abs(heard - 2) < 0.012, onDone);

  const sound = () => {
    setPlucked(time);
    setHeard(ratio);
    const ac = audio();
    if (ac) pluck(ac, freq, ac.currentTime + 0.01, { length: 1.4, gain: 0.16 });
  };
  useEffect(() => setPlucked(-10), [fretted]);

  const geom = useRef({ L: 0, R: 1 });
  const onPointer = (p: StagePointer) => {
    const { L, R } = geom.current;
    setFinger(Math.min(SCALE * 0.72, Math.max(0, ((p.x - L) / (R - L)) * SCALE - 4)));
    if (p.kind === 'up') sound();
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 16, R = w - 16, X = (mm: number) => L + (mm / SCALE) * (R - L);
    geom.current = { L, R };
    const top = 36, bot = Math.max(top + 24, h - 32), sy = (top + bot) / 2;
    // the vibrating length, as a bracket over the neck
    const by = 15;
    line(ctx, X(stop), by, X(SCALE), by, C.accent, 1.5);
    line(ctx, X(stop), by - 4, X(stop), by + 4, C.accent, 1.5);
    line(ctx, X(SCALE), by - 4, X(SCALE), by + 4, C.accent, 1.5);
    const tag = t('{mm} mm vibrating · ×{r}', { mm: formatNumber(Math.round(length)), r: formatNumber(Math.round(ratio * 100) / 100) });
    label(ctx, tag, Math.min(R - 70, Math.max(L + 70, (X(stop) + X(SCALE)) / 2)), by - 8, { size: 10.5, color: C.accent });
    // the neck and its frets
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(L, top, X(fretPosition(FRETS + 1)) - L, bot - top);
    ctx.fillStyle = '#e7dcc6';
    ctx.fillRect(L - 4, top - 2, 5, bot - top + 4);
    if (fretted === 'frets')
      for (let n = 1; n <= FRETS; n++) {
        const x = X(fretPosition(n));
        line(ctx, x, top, x, bot, n === fret ? C.accent : '#cbd5e1', n === fret ? 3 : 2);
        if ([3, 5, 7, 9, 12, 15, 17, 19].includes(n)) {
          const mx = (x + X(fretPosition(n - 1))) / 2;
          if (n === 12) {
            dot(ctx, mx, top + (bot - top) * 0.25, 3, '#e7dcc6');
            dot(ctx, mx, top + (bot - top) * 0.75, 3, '#e7dcc6');
          } else dot(ctx, mx, sy, 3, '#e7dcc6');
          label(ctx, String(n), mx, top - 7, { size: 9.5, color: n === 12 ? C.ink : C.soft });
        }
      }
    // the bridge
    ctx.fillStyle = '#e7dcc6';
    ctx.fillRect(R - 2, top + 4, 5, bot - top - 8);
    // the string: still behind the finger, vibrating from the stopping point to the bridge
    line(ctx, L, sy, X(stop), sy, C.faint, 2);
    const since = time - plucked, amp = since >= 0 ? Math.min(9, (bot - top) / 3) * Math.exp(-2.2 * since) * Math.cos(since * freq * 0.25) : 0;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const f = i / 60, x = X(stop) + f * (X(SCALE) - X(stop));
      ctx[i ? 'lineTo' : 'moveTo'](x, sy + amp * Math.sin(Math.PI * f));
    }
    ctx.stroke();
    if (finger > 0) dot(ctx, X(finger), sy, 8, 'rgba(253,224,71,0.9)');
    // a ruler underneath, in mm from the nut
    const ry = h - 18;
    line(ctx, L, ry, R, ry, C.faint, 1);
    for (let mm = 0; mm <= SCALE; mm += 50) line(ctx, X(mm), ry - (mm % 100 ? 3 : 5), X(mm), ry, C.faint, 1);
    line(ctx, X(SCALE / 2), ry - 7, X(SCALE / 2), ry, C.soft, 1.5);
    label(ctx, t('nut'), L, ry + 10, { size: 9.5, align: 'left', color: C.faint });
    label(ctx, `${SCALE / 2} mm`, X(SCALE / 2), ry + 10, { size: 9.5, color: C.soft });
    label(ctx, t('bridge · {mm} mm', { mm: SCALE }), R, ry + 10, { size: 9.5, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Neck')}
        value={fretted}
        onChange={setFretted}
        options={[
          { value: 'frets', label: t('With frets') },
          { value: 'free', label: t('No frets, like a violin') },
        ]}
      />
      <Stage draw={draw} onPointer={onPointer} label={t('A guitar string {mm} mm long, pressed {at} mm from the nut', { mm: SCALE, at: Math.round(finger) })} />
      <div className="lab__row">
        <Btn onClick={sound}>{t('Pluck')}</Btn>
        <Btn ghost onClick={() => setFinger(0)}>
          {t('Open string')}
        </Btn>
        <span className="lab__note">{t('Drag along the string, then let go to pluck.')}</span>
      </div>
      <Readouts
        items={[
          fretted === 'frets' ? { label: t('Fret'), value: String(fret) } : { label: t('Finger'), value: `${formatNumber(Math.round(finger))} mm` },
          fretted === 'frets' ? { label: t('Gap to this fret'), value: fret > 0 ? `${formatNumber(Math.round(fretGap(fret) * 10) / 10)} mm` : '–' } : { label: t('Vibrating'), value: `${formatNumber(Math.round(length))} mm` },
          { label: t('Pitch'), value: `${formatNumber(Math.round(freq))} Hz`, tone: Math.abs(ratio - 2) < 0.012 ? 'good' : 'accent' },
        ]}
      />
    </div>
  );
}
