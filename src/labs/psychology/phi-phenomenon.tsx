import { useState } from 'react';
import { Btn, C, Choice, dot, label, line, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Mode = 'pair' | 'ring';
type Seen = 'turns' | 'moving' | 'both' | 'blink' | 'phantom';
const RING = 8;

/** The timing slider: 0…100 on a log scale from 17 ms (one screen refresh) to a second. */
export const msAt = (v: number) => Math.round(17 * Math.pow(1000 / 17, v / 100));

/** Which of the two dots is lit `elapsed` ms in, when each stays lit for `ms` in turn. */
export const litDot = (elapsed: number, ms: number) => Math.floor(elapsed / ms) % 2;

/** Which disc of the ring is dark `elapsed` ms in, when each goes dark for `ms` in turn. */
export const darkDisc = (elapsed: number, ms: number) => Math.floor(elapsed / ms) % RING;

const COLOURS: Record<Seen, string> = { turns: C.cool, moving: C.accent, both: '#f0abfc', blink: C.cool, phantom: C.accent };

export default function Phi({ onDone, active }: LabProps) {
  const [mode, setMode] = useState<Mode>('pair');
  const [v, setV] = useState(76);
  const [elapsed, setElapsed] = useState(0);
  const [marks, setMarks] = useState<{ mode: Mode; seen: Seen; ms: number }[]>([]);
  const ms = msAt(v);
  useGoal(new Set(marks.map((m) => m.seen)).size >= 2, onDone);
  useFrame((dt) => setElapsed((e) => e + dt * 1000), active);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, 0, w, h);
    const cy = (h - 40) / 2 + 4;
    if (mode === 'pair') {
      const lit = litDot(elapsed, ms), gap = Math.min(w * 0.28, 110);
      for (const k of [0, 1]) {
        const x = w / 2 + (k ? gap : -gap) / 2 * 1.6;
        if (k === lit) {
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 22;
          dot(ctx, x, cy, 15, '#f9a8d4');
          ctx.shadowBlur = 0;
        } else dot(ctx, x, cy, 15, 'rgba(255,255,255,0.04)');
      }
      dot(ctx, w / 2, cy, 2, C.faint);
      label(ctx, t('look at the small dot between them'), w / 2, cy + 34, { size: 10.5, color: C.faint });
    } else {
      const dark = darkDisc(elapsed, ms), r = Math.min(w, h - 40) * 0.32;
      for (let k = 0; k < RING; k++) {
        const a = (k / RING) * 2 * Math.PI - Math.PI / 2;
        if (k !== dark) dot(ctx, w / 2 + Math.cos(a) * r, cy + Math.sin(a) * r, 11, '#a5f3fc');
      }
      dot(ctx, w / 2, cy, 2, C.faint);
    }
    // the timing scale, with what the reader reported at each timing
    const L = 22, R = w - 22, y = h - 22, X = (m: number) => L + (Math.log(m / 17) / Math.log(1000 / 17)) * (R - L);
    line(ctx, L, y, R, y, C.faint, 1);
    for (const m of [20, 50, 100, 200, 500, 1000]) {
      line(ctx, X(m), y - 3, X(m), y + 3, C.faint, 1);
      label(ctx, m === 1000 ? '1 s' : `${m}`, X(m), y + 12, { size: 9.5, color: C.faint });
    }
    for (const m of marks.filter((m) => m.mode === mode)) dot(ctx, X(m.ms), y - 9, 4, COLOURS[m.seen]);
    line(ctx, X(ms), y - 16, X(ms), y + 3, C.ink, 2);
  };

  const mark = (seen: Seen) => setMarks((m) => [...m, { mode, seen, ms }]);
  const options: [Seen, string][] =
    mode === 'pair'
      ? [
          ['turns', t('Two lights taking turns')],
          ['moving', t('One light moving')],
          ['both', t('Both on at once')],
        ]
      : [
          ['blink', t('Discs blinking')],
          ['phantom', t('Something moving round')],
        ];
  return (
    <div className="lab">
      <Choice
        label={t('What flashes')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'pair', label: t('Two dots') },
          { value: 'ring', label: t('A ring of discs') },
        ]}
      />
      <Stage draw={draw} label={mode === 'pair' ? t('Two dots lighting in turn, each for {ms} milliseconds', { ms }) : t('A ring of eight discs, each going dark for {ms} milliseconds in turn', { ms })} />
      <Range label={mode === 'pair' ? t('Each flash') : t('Each gap')} value={v} min={0} max={100} onChange={setV} format={() => `${formatNumber(ms)} ms`} />
      <div className="lab__row">
        <span className="lab__note">{t('I see:')}</span>
        {options.map(([seen, text]) => (
          <Btn key={seen} ghost onClick={() => mark(seen)}>
            <span className="lab__swatch" style={{ background: COLOURS[seen] }} />
            {text}
          </Btn>
        ))}
      </div>
    </div>
  );
}
