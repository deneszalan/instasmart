import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Ricardo's example: men working for a year to make one unit (a set amount) of cloth or of wine. */
export const MEN = { england: { cloth: 100, wine: 120 }, portugal: { cloth: 90, wine: 80 } };

/** What a country makes when a share (0…1) of its men work on cloth and the rest on wine. */
export function output(country: keyof typeof MEN, share: number) {
  const m = MEN[country], total = m.cloth + m.wine;
  return { cloth: (share * total) / m.cloth, wine: ((1 - share) * total) / m.wine };
}

/** Wine given up for one unit of cloth: England about 0.83, Portugal 1.125. */
export const clothCost = (country: keyof typeof MEN) => MEN[country].cloth / MEN[country].wine;

export default function ComparativeAdvantage({ onDone }: LabProps) {
  const [eng, setEng] = useState(Math.round((100 / 220) * 100));
  const [por, setPor] = useState(Math.round((90 / 170) * 100));
  const e = output('england', eng / 100), p = output('portugal', por / 100);
  const cloth = e.cloth + p.cloth, wine = e.wine + p.wine, better = cloth > 2.05 && wine > 2.05;
  useGoal(better, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // each country's choices: all cloth at one end, all wine at the other
    const panel = (x0: number, pw: number, name: string, country: keyof typeof MEN, now: { cloth: number; wine: number }, colour: string) => {
      const top = 22, bot = h - 22, s = Math.min((pw - 26) / 2.6, (bot - top) / 2.6), X = (c: number) => x0 + 20 + c * s, Y = (v: number) => bot - v * s;
      const max = output(country, 1).cloth, maxW = output(country, 0).wine;
      line(ctx, X(0), Y(0), X(2.5), Y(0), C.faint, 1);
      line(ctx, X(0), Y(0), X(0), Y(2.5), C.faint, 1);
      line(ctx, X(0), Y(maxW), X(max), Y(0), colour, 2);
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(X(now.cloth), Y(now.wine), 6, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, name, x0 + pw / 2, 10, { size: 11, color: C.ink });
      label(ctx, t('cloth →'), X(2.5), bot + 11, { size: 9.5, align: 'right', color: C.faint });
      label(ctx, t('wine'), X(0) + 4, Y(2.5), { size: 9.5, align: 'left', color: C.faint });
    };
    const pw = w * 0.36;
    panel(0, pw, t('England'), 'england', e, '#93c5fd');
    panel(pw, pw, t('Portugal'), 'portugal', p, '#fca5a5');
    // the world's total against one of each in each country
    const bx = pw * 2 + 10, bw = (w - bx - 10) / 2 - 6, top = 24, bot = h - 22, Y = (v: number) => bot - (v / 2.5) * (bot - top);
    [
      [t('cloth'), cloth],
      [t('wine'), wine],
    ].forEach(([name, v], i) => {
      const x = bx + i * (bw + 12);
      ctx.fillStyle = (v as number) > 2.05 ? C.good : (v as number) < 1.95 ? C.bad : C.soft;
      ctx.fillRect(x, Y(v as number), bw, bot - Y(v as number));
      label(ctx, formatNumber(Math.round((v as number) * 100) / 100), x + bw / 2, Y(v as number) - 8, { size: 10.5, color: C.ink });
      label(ctx, name as string, x + bw / 2, bot + 11, { size: 9.5, color: C.faint });
    });
    line(ctx, bx - 4, Y(2), w - 6, Y(2), C.accent, 1.5, [4, 3]);
    label(ctx, t('world'), bx + bw + 6, 10, { size: 11, color: C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('England and Portugal choosing between cloth and wine, and the world’s total')} />
      <Range label={t('England on cloth')} value={eng} min={0} max={100} onChange={setEng} format={(v) => `${v}%`} />
      <Range label={t('Portugal on cloth')} value={por} min={0} max={100} onChange={setPor} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('Cloth costs England'), value: t('{n} wine', { n: formatNumber(Math.round(clothCost('england') * 100) / 100) }) },
          { label: t('Cloth costs Portugal'), value: t('{n} wine', { n: formatNumber(clothCost('portugal')) }) },
        ]}
      />
      <p className="lab__note">{t('Dashed line: the 2 cloth and 2 wine they make without trade.')}</p>
    </div>
  );
}
