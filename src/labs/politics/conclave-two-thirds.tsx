import { useState } from 'react';
import { Btn, C, Choice, dot, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Electing a pope (Universi Dominici Gregis, art. 62): at least two thirds of the cardinals present and voting.
 * From 1996 to 2007, after 33 or 34 ballots, a majority could switch to election by an absolute majority; Benedict
 * XVI restored two thirds for every ballot in 2007. 133 electors voted in May 2025. The four groups are an imagined
 * split, as in the post's animation: real cardinals vote in secret and not in fixed blocs.
 */
export const ELECTORS = 133;
export const BLOCS = [48, 36, 27, 22] as const;
export type Rule = 'two-thirds' | 'late-1996';

/** Votes needed with `n` electors: two thirds, rounded up, or (1996 rule, late ballots) more than half. */
export const need = (n: number, rule: Rule) => (rule === 'two-thirds' ? Math.ceil((2 * n) / 3) : Math.floor(n / 2) + 1);
/** The fewest electors who, voting for others, keep anyone from winning. */
export const blockers = (n: number, rule: Rule) => n - need(n, rule) + 1;
/** Votes for one candidate backed by the chosen groups. */
export const votes = (chosen: readonly boolean[]) => BLOCS.reduce((s, b, i) => s + (chosen[i] ? b : 0), 0);
export const wins = (chosen: readonly boolean[], rule: Rule) => votes(chosen) >= need(ELECTORS, rule);

const COLS = ['#e8b85a', '#6d8fb4', '#b98ad6', '#7cc29a'];
const NONE = [false, false, false, false];

export default function ConclaveTwoThirds({ onDone }: LabProps) {
  const [chosen, setChosen] = useState<boolean[]>(NONE);
  const [rule, setRule] = useState<Rule>('two-thirds');
  const [found, setFound] = useState({ third: false, two: false });
  const v = votes(chosen), needed = need(ELECTORS, rule), won = v >= needed;
  useGoal(found.third && found.two, onDone);

  const update = (next: boolean[], r: Rule) => {
    setChosen(next);
    setRule(r);
    const ok = votes(next) >= need(ELECTORS, r), n = next.filter(Boolean).length;
    if (ok && (r === 'two-thirds' ? !found.third : n === 2 && !found.two)) setFound((f) => (r === 'two-thirds' ? { ...f, third: true } : { ...f, two: true }));
  };
  const toggle = (i: number) => update(chosen.map((c, j) => (j === i ? !c : c)), rule);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // 133 seats in rows of 27, coloured by group; the chosen groups bright
    const cols = 27, rows = 5, top = 20, gap = Math.min((w - 16) / cols, (h - top - 40) / rows), x0 = (w - gap * (cols - 1)) / 2;
    let g = 0, upto = BLOCS[0];
    for (let i = 0; i < ELECTORS; i++) {
      while (i >= upto) upto += BLOCS[++g];
      const x = x0 + (i % cols) * gap, y = top + gap / 2 + Math.floor(i / cols) * gap;
      ctx.globalAlpha = chosen[g] ? 1 : 0.25;
      dot(ctx, x, y, gap * 0.38, COLS[g]);
    }
    ctx.globalAlpha = 1;
    label(ctx, t('133 electors, as in May 2025'), 8, 10, { size: 10, align: 'left', color: C.soft });
    label(ctx, won ? t('Elected: white smoke') : t('Not elected: black smoke'), w - 8, 10, { size: 10, align: 'right', color: won ? C.good : C.soft });
    // the bar: votes for one candidate against the line it must reach
    const by = top + rows * gap + 4, bx0 = 10, bx1 = w - 10, X = (n: number) => bx0 + ((bx1 - bx0) * n) / ELECTORS;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(bx0, by, bx1 - bx0, 14);
    let x = bx0;
    BLOCS.forEach((b, i) => {
      if (!chosen[i]) return;
      ctx.fillStyle = COLS[i];
      ctx.fillRect(x, by, X(b) - bx0, 14);
      x += X(b) - bx0;
    });
    const lx = X(needed);
    ctx.strokeStyle = won ? C.good : C.ink;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(lx, by - 5);
    ctx.lineTo(lx, by + 19);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, rule === 'two-thirds' ? t('two thirds: {n}', { n: formatNumber(needed) }) : t('majority: {n}', { n: formatNumber(needed) }), lx, by + 26, { size: 11, color: won ? C.good : C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('133 cardinals in four imagined groups; the chosen groups give their candidate {v} votes of the {n} needed', { v: formatNumber(v), n: formatNumber(needed) })} />
      <div className="lab__row">
        {BLOCS.map((b, i) => (
          <Btn key={i} ghost={!chosen[i]} onClick={() => toggle(i)} label={t('Group of {n}', { n: formatNumber(b) })}>
            {chosen[i] ? '✓ ' : ''}
            {formatNumber(b)}
          </Btn>
        ))}
      </div>
      <Choice
        label={t('Rule for electing the pope')}
        options={[
          { value: 'two-thirds', label: t('Two thirds (since 2007)') },
          { value: 'late-1996', label: t('1996 rule, after ballot 34') },
        ]}
        value={rule}
        onChange={(r) => update(chosen, r)}
      />
      <Readouts
        items={[
          { label: t('Votes for the candidate'), value: formatNumber(v), tone: won ? 'good' : undefined },
          { label: t('Votes needed to elect'), value: formatNumber(needed), tone: 'accent' },
          { label: t('Fewest who can block'), value: formatNumber(blockers(ELECTORS, rule)) },
        ]}
      />
      <p className="lab__note">{t('Imagined groups: real cardinals vote in secret, one by one, not in blocs.')}</p>
    </div>
  );
}
