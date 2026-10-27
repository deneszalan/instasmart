import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** How a computer's clock handles a positive leap second, inserted after 23:59:59. */
export type ClockMode = 'repeat' | 'smear' | 'none';

/** The window shown: four atomic seconds from 23:59:58, with the leap second 23:59:60 as the third. */
export const WINDOW = 4;
const LEAP_START = 2; // atomic seconds into the window
const DAY = 86400;

/**
 * The clock's count of seconds since the previous midnight, `tau` atomic seconds after 23:59:58.
 * repeat: the count steps back during the leap second, as Linux repeats 23:59:59.
 * smear: the extra second is spread over 24 hours centred on the leap, as big firms such as Google did, so each second runs slow.
 * none: no leap second at all, as UTC will run from 20 May 2027.
 */
export function clockCount(mode: ClockMode, tau: number): number {
  if (mode === 'none') return DAY - 2 + tau;
  if (mode === 'repeat') return DAY - 2 + tau - (tau >= LEAP_START ? 1 : 0);
  // a 24-hour smear centred on the middle of the leap second: 86,401 atomic seconds read as 86,400
  const sinceSmearStart = tau - (LEAP_START + 0.5 - DAY / 2);
  return DAY - 2 + tau - sinceSmearStart / (DAY + 1) + (LEAP_START + 0.5 - DAY / 2) / (DAY + 1);
}

/** What a timer based on the clock reads, started at `start` and stopped `length` atomic seconds later. */
export const measured = (mode: ClockMode, start: number, length: number) => clockCount(mode, start + length) - clockCount(mode, start);

/** The clock face for a count of seconds since midnight, with a tenth; the leap second shows as 23:59:60 only in UTC itself. */
function face(count: number): string {
  const s = ((count % DAY) + DAY) % DAY, h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec.toFixed(1).padStart(4, '0')}`;
}

/** UTC's own label for an atomic moment in the window: 23:59:58, 23:59:59, 23:59:60, 00:00:00. */
function utcFace(tau: number): string {
  const whole = Math.floor(tau), tenth = (tau - whole).toFixed(1).slice(1);
  return ['23:59:58', '23:59:59', '23:59:60', '00:00:00'][Math.min(3, whole)] + tenth;
}

export default function LeapSeconds({ onDone }: LabProps) {
  const [mode, setMode] = useState<ClockMode>('repeat');
  const [start, setStart] = useState(0.6);
  const [length, setLength] = useState(1);
  const stop = Math.min(WINDOW, start + length);
  const reading = measured(mode, start, stop - start);
  const negative = reading < -1e-9;
  useGoal(negative, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 16, x1 = w - 16, X = (tau: number) => x0 + ((x1 - x0) * tau) / WINDOW;
    const yUtc = Math.max(32, h * 0.26), yClock = yUtc + Math.max(46, h * 0.36);
    label(ctx, t('What UTC calls each second'), x0, yUtc - 20, { size: 11, align: 'left', color: C.soft });
    label(ctx, t('What this computer’s clock shows'), x0, yClock - 20, { size: 11, align: 'left', color: C.soft });
    for (let i = 0; i < WINDOW; i++) {
      const leap = i === LEAP_START;
      ctx.fillStyle = leap ? 'rgba(252,165,165,0.28)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(X(i) + 1, yUtc - 10, X(i + 1) - X(i) - 2, 20);
      label(ctx, ['23:59:58', '23:59:59', '23:59:60', '00:00:00'][i], (X(i) + X(i + 1)) / 2, yUtc, { size: 11, color: leap ? C.bad : C.ink });
      // what this clock shows during the same atomic second
      const shown = mode === 'none' ? ['23:59:58', '23:59:59', '00:00:00', '00:00:01'][i] : mode === 'repeat' ? ['23:59:58', '23:59:59', '23:59:59', '00:00:00'][i] : ['23:59:58', '23:59:59', '23:59:59.9…', '00:00:00'][i];
      const odd = (mode === 'repeat' && leap) || (mode === 'none' && i >= LEAP_START);
      ctx.fillStyle = odd ? 'rgba(253,224,71,0.18)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(X(i) + 1, yClock - 10, X(i + 1) - X(i) - 2, 20);
      label(ctx, shown, (X(i) + X(i + 1)) / 2, yClock, { size: 11, color: odd ? C.accent : C.ink });
    }
    // the timer's start and stop
    line(ctx, X(start), yUtc - 12, X(start), yClock + 14, C.cool, 2);
    label(ctx, t('timer start'), X(start), yClock + 24, { size: 11, color: C.cool, align: 'right' });
    const stopColour = negative ? C.bad : C.good;
    line(ctx, X(stop), yUtc - 12, X(stop), yClock + 14, stopColour, 2);
    label(ctx, t('timer stop'), X(stop) + 4, yClock + 24, { size: 11, color: stopColour, align: 'left' });
  };

  const sign = (x: number) => `${x < -1e-9 ? '−' : ''}${formatNumber(Math.abs(x))}`;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Four seconds around a leap second, as UTC labels them and as the chosen computer clock shows them, with the timer’s start and stop')} />
      <Choice
        label={t('How the computer handles the leap second')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'repeat', label: t('Repeat :59') },
          { value: 'smear', label: t('Smear') },
          { value: 'none', label: t('No leap') },
        ]}
      />
      <Range label={t('Timer starts')} value={start} min={0} max={3} step={0.1} onChange={setStart} format={() => utcFace(start)} />
      <Range label={t('Timer runs for')} value={length} min={0.1} max={1.5} step={0.1} onChange={setLength} format={(v) => `${formatNumber(v)} s`} />
      <Readouts
        items={[
          { label: t('Clock at start'), value: face(clockCount(mode, start)) },
          { label: t('Clock at stop'), value: face(clockCount(mode, stop)) },
          { label: t('Timer says'), value: `${sign(reading)} s`, tone: negative ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: systems differ. Linux repeats 23:59:59; Google smeared the second over hours.')}</p>
    </div>
  );
}
