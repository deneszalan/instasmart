import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t, LANG } from '../../i18n';

const DAY = 86_400_000;
/** ICANN: KSK-2024 was first published in the root zone on 11 January 2025. */
export const PUBLISHED = Date.UTC(2025, 0, 11);
/** ICANN: on 11 October 2026 at 14:00 UTC, KSK-2024 began signing the root zone. */
export const SWITCH = Date.UTC(2026, 9, 11, 14);
/** RFC 5011: a resolver trusts a new key only after seeing it for 30 days. */
export const HOLD_DAYS = 30;
/** The slider's days count from 1 January 2025. */
export const DAY0 = Date.UTC(2025, 0, 1);
export const dayToTime = (day: number) => DAY0 + day * DAY;

export type Updates = 'auto' | 'off';

/**
 * A resolver that starts with only the old root key is switched on at the start of `day`. With automatic updates
 * it trusts the new key 30 days after it first sees it, but only if that happens before the switch: after it, the
 * root's keys are signed by the new key alone, which it cannot yet check. Returns when it trusts the new key, or null.
 */
export function trustsNewKeyAt(day: number, updates: Updates): number | null {
  const on = dayToTime(day);
  if (updates === 'off') return null;
  const ready = Math.max(on, PUBLISHED) + HOLD_DAYS * DAY;
  return ready <= SWITCH ? ready : null;
}
/** Does the resolver's lookups still work after the switch? */
export const works = (day: number, updates: Updates) => trustsNewKeyAt(day, updates) !== null;
/** The last day a resolver with automatic updates can be switched on and still be ready: 11 September 2026. */
export const LAST_SAFE_DAY = Math.floor((SWITCH - HOLD_DAYS * DAY - DAY0) / DAY);

const NEW = '#58d6a8', BAD = '#ff6b6b';
const LOCALE = LANG === 'de' ? 'de-DE' : 'en-GB';
const date = (ms: number) => new Date(ms).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function RootKeyRollover({ onDone }: LabProps) {
  const [day, setDay] = useState(400);
  const [updates, setUpdates] = useState<Updates>('auto');
  const ok = works(day, updates), ready = trustsNewKeyAt(day, updates);
  useGoal(updates === 'auto' && day === LAST_SAFE_DAY, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, end = Date.UTC(2027, 1, 1), y = h * 0.42;
    const X = (ms: number) => L + ((R - L) * (ms - DAY0)) / (end - DAY0);
    // the timeline, with the years
    line(ctx, L, y, R, y, C.faint, 3);
    for (const yr of [2025, 2026, 2027]) {
      const x = X(Date.UTC(yr, 0, 1));
      line(ctx, x, y - 6, x, y + 6, C.faint, 2);
      label(ctx, String(yr), x, y + 18, { size: 10, color: C.faint, align: yr === 2025 ? 'left' : 'center' });
    }
    // the root's milestones
    const pub = X(PUBLISHED), sw = X(SWITCH);
    ctx.fillStyle = NEW;
    ctx.fillRect(pub - 1, y - 22, 2, 22);
    label(ctx, t('new key published'), pub + 5, y - 18, { size: 10, color: NEW, align: 'left' });
    ctx.fillStyle = C.ink;
    ctx.fillRect(sw - 1, y - 22, 2, 22);
    label(ctx, t('switch, 11 Oct 2026'), sw - 5, y - 18, { size: 10, color: C.ink, align: 'right' });
    // this resolver: switched on, then waiting 30 days, then trusting the new key (or not)
    const on = dayToTime(day), xo = X(on);
    if (updates === 'auto') {
      const from = Math.max(on, PUBLISHED), to = from + HOLD_DAYS * DAY;
      ctx.fillStyle = ok ? 'rgba(88,214,168,0.35)' : 'rgba(255,107,107,0.35)';
      ctx.fillRect(X(from), y - 9, Math.max(2, X(to) - X(from)), 18);
    }
    ctx.fillStyle = ok ? NEW : BAD;
    ctx.beginPath();
    ctx.arc(xo, y, 7, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('switched on here'), xo, y + 34, { size: 11, color: ok ? NEW : BAD, align: xo > w * 0.75 ? 'right' : xo < w * 0.25 ? 'left' : 'center' });
    // the result after the switch
    label(ctx, ok ? t('after the switch: lookups work') : t('after the switch: every lookup fails'), w / 2, h - 14, { size: 14, color: ok ? NEW : BAD });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A resolver switched on on {d}: {r}', { d: date(dayToTime(day)), r: ok ? t('after the switch: lookups work') : t('after the switch: every lookup fails') })} />
      <Range label={t('Switched on, old key only')} value={day} min={10} max={729} step={1} onChange={setDay} format={(v) => date(dayToTime(v))} />
      <Choice
        label={t('Trust anchor updates')}
        value={updates}
        onChange={setUpdates}
        options={[
          { value: 'auto', label: t('automatic updates') },
          { value: 'off', label: t('updates off') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Trusts the new key from'), value: ready === null ? t('never') : date(ready), tone: ready === null ? 'bad' : 'good' },
          { label: t('Lookups after the switch'), value: ok ? t('they work') : t('they fail'), tone: ok ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: it checks the root’s keys daily, and the 30 days count from midnight UTC.')}</p>
    </div>
  );
}
