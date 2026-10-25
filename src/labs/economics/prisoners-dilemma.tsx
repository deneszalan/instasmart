import { useState } from 'react';
import { Btn, C, Choice, label, Readouts, Stage, useGoal, rng, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Move = 'C' | 'D'; // stay silent (cooperate) or betray (defect)
/** Years in prison for [you, partner]. */
export const YEARS: Record<string, [number, number]> = { CC: [1, 1], CD: [3, 0], DC: [0, 3], DD: [2, 2] };

type Strategy = 'tft' | 'alld' | 'allc' | 'coin' | 'tf2t';
export const STRATEGIES: Strategy[] = ['tft', 'alld', 'allc', 'coin', 'tf2t'];
/** Each strategy's next move, given its own moves and the other player's so far. */
export function play(s: Strategy, theirs: Move[], rand: () => number): Move {
  const last = theirs[theirs.length - 1];
  if (s === 'tft') return last ?? 'C';
  if (s === 'alld') return 'D';
  if (s === 'allc') return 'C';
  if (s === 'coin') return rand() < 0.5 ? 'C' : 'D';
  return last === 'D' && theirs[theirs.length - 2] === 'D' ? 'D' : 'C';
}

/** Axelrod-style round robin: every strategy meets every other and its own twin, 200 rounds a match. Total years each. */
export function tournament(rounds = 200, seed = 7) {
  const rand = rng(seed), total: Record<Strategy, number> = { tft: 0, alld: 0, allc: 0, coin: 0, tf2t: 0 };
  STRATEGIES.forEach((a, i) =>
    STRATEGIES.slice(i).forEach((b) => {
      const ma: Move[] = [], mb: Move[] = [];
      for (let r = 0; r < rounds; r++) {
        const x = play(a, mb, rand), y = play(b, ma, rand);
        ma.push(x);
        mb.push(y);
        const [ya, yb] = YEARS[x + y];
        total[a] += ya;
        if (a !== b) total[b] += yb;
      }
    }),
  );
  return total;
}

export default function PrisonersDilemma({ onDone }: LabProps) {
  const [rival, setRival] = useState<Strategy>('tft');
  const [mine, setMine] = useState<Move[]>([]);
  const [theirs, setTheirs] = useState<Move[]>([]);
  const [rand] = useState(() => rng(Date.now() % 1e6));
  const [results, setResults] = useState<Record<Strategy, number> | null>(null);
  useGoal(mine.length >= 5 && results !== null, onDone);

  const names: Record<Strategy, string> = { tft: t('Tit for tat'), alld: t('Always betray'), allc: t('Always silent'), coin: t('Coin flip'), tf2t: t('Tit for two tats') };
  const move = (m: Move) => {
    const r = play(rival, mine, rand);
    setMine((a) => [...a, m]);
    setTheirs((a) => [...a, r]);
  };
  const pick = (s: Strategy) => {
    setRival(s);
    setMine([]);
    setTheirs([]);
  };
  const yours = mine.reduce((s, m, i) => s + YEARS[m + theirs[i]][0], 0), rivals = mine.reduce((s, m, i) => s + YEARS[m + theirs[i]][1], 0);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (results) {
      const max = Math.max(...Object.values(results)), best = Math.min(...Object.values(results)), L = 104, R = w - 44, rh = (h - 26) / 5;
      label(ctx, t('years in prison over the tournament: fewer is better'), w / 2, 9, { size: 10.5 });
      STRATEGIES.forEach((s, i) => {
        const y = 20 + i * rh + rh / 2, v = results[s];
        label(ctx, names[s], 8, y, { size: 10.5, align: 'left', color: C.ink });
        ctx.fillStyle = v === best ? C.good : 'rgba(255,255,255,0.45)';
        ctx.fillRect(L, y - rh * 0.3, ((R - L) * v) / max, rh * 0.6);
        label(ctx, formatNumber(v), L + ((R - L) * v) / max + 4, y, { size: 10.5, align: 'left', color: C.ink });
      });
      return;
    }
    // the last rounds: you on top, your partner below
    const n = 12, cw = (w - 70) / n, rows: [string, Move[]][] = [
      [t('You'), mine],
      [names[rival], theirs],
    ];
    rows.forEach(([who, moves], r) => {
      const y = h * (r ? 0.62 : 0.3);
      label(ctx, who, 8, y - 22, { size: 10.5, align: 'left' });
      const shown = moves.slice(-n);
      for (let i = 0; i < n; i++) {
        const m = shown[i], x = 8 + i * cw;
        ctx.fillStyle = !m ? 'rgba(255,255,255,0.06)' : m === 'C' ? 'rgba(134,239,172,0.8)' : 'rgba(252,165,165,0.85)';
        ctx.fillRect(x, y - 10, cw - 3, 20);
        if (m) label(ctx, m === 'C' ? '🤐' : '🗣️', x + (cw - 3) / 2, y, { size: Math.min(13, cw * 0.6) });
      }
    });
    if (!mine.length) label(ctx, t('Silent or betray? You can’t see their choice until you make yours.'), w / 2, h * 0.92, { size: 10.5 });
  };

  return (
    <div className="lab">
      <Choice label={t('Your partner plays')} value={rival} onChange={pick} options={STRATEGIES.map((s) => ({ value: s, label: names[s] }))} />
      <Stage draw={draw} label={results ? t('Tournament results') : t('Your moves and your partner’s, round by round')} />
      <div className="lab__row">
        <Btn onClick={() => (setResults(null), move('C'))}>{t('Stay silent')}</Btn>
        <Btn onClick={() => (setResults(null), move('D'))}>{t('Betray')}</Btn>
        <Btn ghost onClick={() => setResults(tournament())}>
          {t('Run the tournament')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Rounds'), value: String(mine.length) },
          { label: t('Your years'), value: formatNumber(yours), tone: 'accent' },
          { label: t('Partner’s years'), value: formatNumber(rivals) },
        ]}
      />
    </div>
  );
}
