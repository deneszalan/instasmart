import { useRef, useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/** E = encourage, D = discourage, N = no opinion expressed. */
export type Vote = 'E' | 'D' | 'N';

/**
 * Rebeca Grynspan's 15 ballots in the sixth straw poll, 16 October 2026 (PassBlue): the five permanent
 * members first (3 encourage, 2 discourage), then the ten elected members (6 encourage, 3 discourage, 1 no opinion).
 */
export const OCT_16: Vote[] = ['E', 'E', 'E', 'D', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'D', 'D', 'D', 'N'];
/** António Guterres in the sixth straw poll of 2016: 13 encourage, 2 no opinion (one of them a permanent member's). */
export const OCT_2016: Vote[] = ['E', 'E', 'E', 'E', 'N', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'N'];

/** Indexes 0–4 are the permanent members' (red) ballots. A candidate passes with 9 encourages and no red discourage. */
export function verdict(votes: Vote[]) {
  const encourage = votes.filter((v) => v === 'E').length;
  const redDiscourage = votes.slice(0, 5).filter((v) => v === 'D').length;
  return { encourage, redDiscourage, passes: encourage >= 9 && redDiscourage === 0 };
}

const NEXT: Record<Vote, Vote> = { E: 'D', D: 'N', N: 'E' };
const RED = '#e0574c', PAPER = '#f5f2ea', INK = '#18304a';

export default function StrawPolls({ onDone }: LabProps) {
  const [votes, setVotes] = useState<Vote[]>(OCT_16);
  const v = verdict(votes);
  const changed = votes.filter((x, i) => x !== OCT_16[i]).length;
  useGoal(v.passes, onDone);
  const size = useRef({ w: 0, h: 0 });

  const cells = (w: number, h: number) => {
    const cw = Math.min((w - 24) / 10.6, (h - 44) / 2.3), ch = cw * 1.12, gap = cw * 0.06;
    return Array.from({ length: 15 }, (_, i) => {
      const row = i < 5 ? 0 : 1, col = i < 5 ? i : i - 5, n = row === 0 ? 5 : 10;
      const x0 = (w - (n * cw + (n - 1) * gap)) / 2;
      return { x: x0 + col * (cw + gap), y: row === 0 ? 18 : 18 + ch + 22, w: cw, h: ch };
    });
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const i = cells(size.current.w, size.current.h).findIndex((c) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h);
    if (i >= 0) setVotes(votes.map((x, j) => (j === i ? NEXT[x] : x)));
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const all = cells(s.w, s.h);
    label(ctx, t('Permanent members'), s.w / 2, 8, { size: 10, color: C.soft });
    label(ctx, t('Elected members'), s.w / 2, all[5].y - 10, { size: 10, color: C.soft });
    all.forEach((c, i) => {
      const red = i < 5, vote = votes[i];
      ctx.fillStyle = red ? RED : PAPER;
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 4);
      ctx.fill();
      if (red && vote === 'D') {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2, m = c.w * 0.24;
      ctx.strokeStyle = red ? '#ffffff' : INK;
      ctx.lineWidth = Math.max(2, c.w * 0.09);
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (vote === 'E') { ctx.moveTo(cx - m, cy); ctx.lineTo(cx - m * 0.25, cy + m * 0.8); ctx.lineTo(cx + m * 1.1, cy - m * 0.9); }
      if (vote === 'D') { ctx.moveTo(cx - m, cy - m); ctx.lineTo(cx + m, cy + m); ctx.moveTo(cx + m, cy - m); ctx.lineTo(cx - m, cy + m); }
      if (vote === 'N') { ctx.moveTo(cx - m * 0.8, cy); ctx.lineTo(cx + m * 0.8, cy); }
      ctx.stroke();
      ctx.lineCap = 'butt';
    });
    const last = all[14];
    label(ctx, t('✓ encourage · ✕ discourage · – no opinion'), s.w / 2, Math.min(s.h - 7, last.y + last.h + 12), { size: 10, color: C.soft });
  };

  const status = v.passes ? t('Passes') : v.redDiscourage > 0 ? t('Red veto') : t('Under 9');
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Fifteen straw-poll ballots: {e} encourage, {d} red discourage', { e: v.encourage, d: v.redDiscourage })} />
      <div className="lab__row">
        <span className="lab__note">{t('Tap a ballot to change it. Simplified: a red discourage counts as a veto.')}</span>
        <Btn ghost onClick={() => setVotes(OCT_16)}>
          {t('Back to 16 October')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Encourage'), value: `${v.encourage}/15`, tone: v.encourage >= 9 ? 'good' : 'bad' },
          { label: t('Ballots changed'), value: `${changed}` },
          { label: t('Verdict'), value: status, tone: v.passes ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
