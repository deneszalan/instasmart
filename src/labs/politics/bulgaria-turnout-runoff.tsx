import { useState } from 'react';
import { Btn, C, label, line, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Bulgaria's constitution, art. 93: a candidate is elected in the first round with more than half of the valid
 * ballots, provided that more than half of all eligible voters have cast a ballot. Otherwise the top two meet in a
 * second round, which the one with more votes wins.
 */
export const locks = (share: number, turnout: number) => ({ majority: share > 50, turnout: turnout > 50 });
export const electedInRoundOne = (share: number, turnout: number) => {
  const l = locks(share, turnout);
  return l.majority && l.turnout;
};

/** The goal: a first-round majority that still ends in a runoff, as in 2006. */
export const reached = (share: number, turnout: number) => share > 50 && turnout <= 50;

/** Real first rounds: the leader's share of valid ballots and the turnout, in %. */
export const ROUNDS = {
  2026: { share: 34.76, turnout: 23 },
  2006: { share: 64, turnout: 44 },
} as const;

const OPEN = '#7fe0a8', SHUT = '#ff8a80', GOLD = '#f0c45a', IOT = '#e98b6d', VOTER = '#79b8f2';

function padlock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, open: boolean) {
  const col = open ? OPEN : SHUT, sw = s * 0.32, lift = open ? s * 0.3 : 0;
  ctx.strokeStyle = col;
  ctx.lineWidth = s * 0.15;
  ctx.beginPath();
  ctx.moveTo(x - sw, y);
  ctx.lineTo(x - sw, y - s * 0.4 - lift);
  ctx.arc(x, y - s * 0.4 - lift, sw, Math.PI, 0);
  ctx.lineTo(x + sw, y - s * 0.4 - lift + (open ? s * 0.1 : s * 0.4));
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.5, y - s * 0.05, s, s * 0.75, s * 0.1);
  ctx.fill();
}

export default function BulgariaTurnoutRunoff({ onDone }: LabProps) {
  const [share, setShare] = useState(40);
  const [turnout, setTurnout] = useState(60);
  const l = locks(share, turnout), won = l.majority && l.turnout;
  useGoal(reached(share, turnout), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // two bars against the 50% line: the leader's share of the ballots, and the turnout; a padlock for each
    const L = 10, R = w - 46, bh = Math.min(24, h * 0.14);
    const rows: [number, string, string, boolean][] = [
      [share, IOT, t('Leader’s share of valid ballots'), l.majority],
      [turnout, VOTER, t('Registered voters who voted'), l.turnout],
    ];
    rows.forEach(([v, col, name, ok], i) => {
      const y = h * (0.24 + i * 0.3);
      label(ctx, name, L, y - bh / 2 - 9, { size: 10.5, align: 'left', color: C.soft });
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(L, y - bh / 2, R - L, bh);
      ctx.fillStyle = col;
      ctx.fillRect(L, y - bh / 2, ((R - L) * v) / 100, bh);
      label(ctx, `${formatNumber(v)}%`, L + 6, y, { size: 11, align: 'left', color: '#0b1510' });
      line(ctx, (L + R) / 2, y - bh / 2 - 3, (L + R) / 2, y + bh / 2 + 3, GOLD, 2, [4, 3]);
      padlock(ctx, R + 24, y - 4, 20, ok);
    });
    label(ctx, t('50% line'), (L + R) / 2, h * 0.54 + bh / 2 + 12, { size: 9.5, color: GOLD });
    // the outcome
    label(ctx, won ? t('Elected in round one') : t('Runoff of the top two, within seven days'), w / 2, h * 0.86, { size: 12.5, color: won ? OPEN : GOLD });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Leader has {s}% of the ballots on a {p}% turnout: {r}', { s: formatNumber(share), p: formatNumber(turnout), r: won ? t('Elected in round one') : t('Runoff of the top two, within seven days') })} />
      <Range label={t('Leader’s share')} value={share} min={10} max={90} step={1} onChange={setShare} format={(v) => `${v}%`} />
      <Range label={t('Turnout of voters')} value={turnout} min={10} max={90} step={1} onChange={setTurnout} format={(v) => `${v}%`} />
      <div className="lab__row">
        <Btn ghost onClick={() => { setShare(Math.round(ROUNDS[2026].share)); setTurnout(ROUNDS[2026].turnout); }}>
          {t('First round of 2026')}
        </Btn>
        <Btn ghost onClick={() => { setShare(ROUNDS[2006].share); setTurnout(ROUNDS[2006].turnout); }}>
          {t('First round of 2006')}
        </Btn>
      </div>
      <p className="lab__note">{t('Simplified: only the leader’s share and the turnout are set; the 2026 button uses 35% and 23%.')}</p>
    </div>
  );
}
