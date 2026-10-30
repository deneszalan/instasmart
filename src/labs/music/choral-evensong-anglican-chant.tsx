import { useRef, useState } from 'react';
import { Btn, C, Choice, label, pluck, Readouts, Stage, useAudio, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/**
 * A single Anglican chant: 7 bars, the first and fourth a reciting note. Notes as steps on a treble staff
 * (0 = the bottom line, E4; 0.5 per line or space). An invented example tune in D major.
 */
export const BARS: { notes: number[]; reciting?: boolean }[] = [
  { notes: [4], reciting: true },
  { notes: [4.5, 4] },
  { notes: [3.5] },
  { notes: [4], reciting: true },
  { notes: [3.5, 3] },
  { notes: [3, 2.5] },
  { notes: [3] },
];
export const SLOTS = BARS.flatMap((b, bar) => b.notes.map((step) => ({ bar, step, reciting: !!b.reciting })));
/** The pitch of a staff step in D major, in hertz (an octave below the written note). */
const PITCH: Record<number, number> = { 2.5: 277.18, 3: 293.66, 3.5: 329.63, 4: 369.99, 4.5: 392.0 };

/**
 * The first four verses of the Magnificat, pointed as in the Parish Psalter example on Wikipedia: one entry per note,
 * as syllables ('-' joins a syllable to the one before it; a trailing '-' runs the word on to the next note).
 */
export const VERSES: string[][][] = [
  [['My', 'soul', 'doth'], ['mag', '-ni', '-fy'], ['the'], ['Lord'], ['And', 'my', 'spi', '-rit', 'hath', 're-'], ['-joiced'], ['in'], ['God'], ['my'], ['Sa', '-viour']],
  [['For'], ['he', 'hath'], ['re-'], ['-gar', '-ded'], ['the'], ['low', '-li-'], ['-ness'], ['of'], ['his'], ['hand', '-mai', '-den']],
  [['For', 'be-'], ['-hold'], ['from'], ['hence', '-forth'], ['all', 'ge', '-ne-'], ['-ra', '-tions'], ['shall'], ['call'], ['me'], ['blessed']],
  [['For', 'he', 'that', 'is', 'migh', '-ty', 'hath'], ['mag', '-ni-'], ['-fied'], ['me'], ['and'], ['ho-'], ['-ly'], ['is'], ['his'], ['Name']],
];
/** Syllables sung on the two reciting notes of a verse. */
export const recitingSyllables = (v: number) => SLOTS.map((s, i) => (s.reciting ? VERSES[v][i].length : -1)).filter((n) => n >= 0);
/** The words under one note. */
export const show = (syl: string[]) => syl.join(' ').replace(/ -/g, '');

/** When each note starts and how long it lasts, in seconds: a syllable takes about 0.24 s; half-verse ends are held. */
export function timing(v: number) {
  let at = 0;
  return SLOTS.map((s, i) => {
    const n = VERSES[v][i].length, end = s.bar === 2 || s.bar === 6;
    const d = s.reciting ? 0.24 * n + 0.15 : Math.max(0.42, 0.24 * n) + (end ? 0.5 : 0);
    const out = { at, d };
    at += d + (end && s.bar === 2 ? 0.25 : 0);
    return out;
  });
}

const GOLD = '#f2c46d', MINT = '#8fd0ae';
const MOST = Math.max(...VERSES.flatMap((_, v) => recitingSyllables(v)));

export default function AnglicanChant({ onDone, active }: LabProps) {
  const [v, setV] = useState(0);
  const [sung, setSung] = useState<boolean[]>(VERSES.map(() => false));
  const [clock, setClock] = useState<number | null>(null);
  const audio = useAudio(active);
  const plan = useRef(timing(0));
  const r = recitingSyllables(v);
  useGoal(sung[v] && Math.max(...r) === MOST, onDone);

  useFrame((dt) => {
    if (clock === null) return;
    const last = plan.current[plan.current.length - 1];
    const next = clock + dt;
    if (next > last.at + last.d + 0.2) {
      setClock(null);
      setSung((s) => s.map((x, i) => x || i === v));
    } else setClock(next);
  }, clock !== null && active);

  const sing = () => {
    plan.current = timing(v);
    const ac = audio();
    if (ac) {
      const t0 = ac.currentTime + 0.05;
      plan.current.forEach(({ at, d }, i) => pluck(ac, PITCH[SLOTS[i].step], t0 + at, { length: d + 0.3, type: 'sine', gain: 0.1 }));
    }
    setClock(0);
  };
  const now = clock === null ? -1 : plan.current.findIndex(({ at, d }) => clock >= at && clock < at + d);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 6, x1 = w - 6, gap = Math.min(9, h / 16), yb = Math.min(h - 40, 4.5 * gap + 34 + 4 * gap);
    // widths: reciting notes stretch with their syllables
    const base = SLOTS.map((s, i) => (s.reciting ? 0.6 + VERSES[v][i].length * 0.95 : 1));
    const sum = base.reduce((a, b) => a + b, 0);
    let x = x0;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    for (let l = 0; l < 5; l++) {
      ctx.beginPath();
      ctx.moveTo(x0, yb - l * gap);
      ctx.lineTo(x1, yb - l * gap);
      ctx.stroke();
    }
    SLOTS.forEach((s, i) => {
      const sw = ((x1 - x0) * base[i]) / sum, cx = x + sw / 2, ny = yb - s.step * gap, lit = i === now;
      if (s.reciting) {
        ctx.fillStyle = 'rgba(143,208,174,0.16)';
        ctx.fillRect(x + 2, yb - 4 * gap - 6, sw - 4, 4 * gap + 12);
      }
      ctx.strokeStyle = lit ? GOLD : s.reciting ? MINT : C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, ny, 6, 4.2, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      if (lit) {
        ctx.fillStyle = GOLD;
        ctx.fill();
      }
      if (BARS[s.bar].notes.length === 2) {
        ctx.beginPath();
        ctx.moveTo(cx + 5.6, ny - 1);
        ctx.lineTo(cx + 5.6, ny - 28);
        ctx.stroke();
      }
      const y = yb + 18 + (s.reciting ? 0 : (i % 2) * 15);
      label(ctx, show(VERSES[v][i]), cx, y, { size: s.reciting ? 10.5 : 10, weight: lit ? 800 : 600, color: lit ? GOLD : s.reciting ? MINT : C.soft });
      x += sw;
      if (!SLOTS[i + 1] || SLOTS[i + 1].bar !== s.bar) {
        ctx.strokeStyle = C.faint;
        ctx.lineWidth = s.bar === 2 || s.bar === 6 ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, yb);
        ctx.lineTo(x, yb - 4 * gap);
        ctx.stroke();
      }
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Verse {n} of the Magnificat set to a 7-bar chant; {a} and {b} syllables on its two reciting notes', { n: v + 1, a: r[0], b: r[1] })} />
      <div className="lab__row">
        <Choice
          label={t('Verse of the Magnificat')}
          options={VERSES.map((_, i) => ({ value: i, label: t('Magnificat verse {n}', { n: i + 1 }) }))}
          value={v}
          onChange={(x) => {
            setV(x);
            setClock(null);
          }}
        />
        <Btn onClick={sing} disabled={clock !== null}>
          {t('Sing the verse')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Syllables on reciting note 1'), value: r[0], tone: r[0] === MOST ? 'good' : undefined },
          { label: t('Syllables on reciting note 2'), value: r[1], tone: r[1] === MOST ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('An invented example chant, sung by simple tones. The words and their pointing follow the Parish Psalter example on Wikipedia; real choirs sing at speech pace, more freely.')}</p>
    </div>
  );
}
