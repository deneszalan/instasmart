import { useState } from 'react';
import { Btn, Choice, label, Readouts, Stage, useGoal, rng, type LabProps } from '../kit';
import { t } from '../../i18n';

const FARMS = 4;
export const RULE = 3; // cows per farm under the herders' own rule

/**
 * One season on a shared pasture (a simple model): grass regrows fastest when half grown (logistic, 0…100) and
 * each cow eats in proportion to how much grass there is. Returns the new grass and the milk each cow gives.
 */
export function season(grass: number, cows: number) {
  const regrow = 0.5 * grass * (1 - grass / 100), eaten = cows * (grass / 100);
  return { grass: Math.max(0, Math.min(100, grass + regrow - eaten)), milk: grass / 100 };
}

export default function Commons({ onDone }: LabProps) {
  const [rules, setRules] = useState<'open' | 'rules'>('open');
  const [herds, setHerds] = useState([3, 3, 3, 3]); // yours first
  const [grass, setGrass] = useState(80);
  const [year, setYear] = useState(0);
  const [milk, setMilk] = useState([0, 0, 0, 0]);
  const [green, setGreen] = useState(0); // seasons in a row under rules with the grass above half
  useGoal(green >= 10, onDone);

  const next = () => {
    const cows = herds.reduce((a, b) => a + b, 0), s = season(grass, cows);
    setGrass(s.grass);
    setMilk((m) => m.map((x, i) => x + herds[i] * s.milk));
    // the other herders: with no rules, each adds a cow while a cow still pays; with rules, each keeps to three
    setHerds((hs) => hs.map((n, i) => (i === 0 ? n : rules === 'rules' ? RULE : s.milk > 0.1 ? n + 1 : Math.max(0, n - 1))));
    setYear((y) => y + 1);
    setGreen((g) => (rules === 'rules' && s.grass >= 50 && herds[0] <= RULE ? g + 1 : 0));
  };
  const restart = (r: 'open' | 'rules') => {
    setRules(r);
    setHerds([3, 3, 3, 3]);
    setGrass(80);
    setYear(0);
    setMilk([0, 0, 0, 0]);
    setGreen(0);
  };
  const mine = (d: number) => setHerds((hs) => hs.map((n, i) => (i === 0 ? Math.max(0, Math.min(rules === 'rules' ? RULE : 40, n + d)) : n)));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the pasture: green fades to bare earth
    const g = grass / 100;
    ctx.fillStyle = `rgb(${Math.round(150 - 90 * g)},${Math.round(110 + 70 * g)},${Math.round(60 + 10 * g)})`;
    ctx.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let k = 0; k < 160 * g; k++) {
      ctx.fillStyle = 'rgba(21,128,61,0.6)';
      ctx.fillRect(r() * w, r() * h, 2, 5);
    }
    // the farms at the corners, their cows in the field
    const spots = [
      [0.25, 0.3],
      [0.75, 0.3],
      [0.25, 0.75],
      [0.75, 0.75],
    ];
    herds.forEach((n, i) => {
      const [fx, fy] = spots[i];
      label(ctx, i ? t('farm {n}', { n: i + 1 }) : t('your farm'), fx * w, fy * h - 26, { size: 10.5, color: i ? '#1e293b' : '#7c2d12' });
      for (let k = 0; k < Math.min(n, 24); k++) label(ctx, '🐄', fx * w + ((k % 6) - 2.5) * 14, fy * h + Math.floor(k / 6) * 13 - 8, { size: 12 });
      if (n > 24) label(ctx, `+${n - 24}`, fx * w + 50, fy * h, { size: 10, color: '#1e293b' });
    });
    label(ctx, t('grass {g}%', { g: Math.round(grass) }), w / 2, h - 9, { size: 11, color: '#0f172a' });
  };

  const cows = herds.reduce((a, b) => a + b, 0);
  return (
    <div className="lab">
      <Choice
        label={t('The pasture')}
        value={rules}
        onChange={restart}
        options={[
          { value: 'open', label: t('Open to all') },
          { value: 'rules', label: t('Herders’ own rule: 3 cows each') },
        ]}
      />
      <Stage draw={draw} label={t('A shared pasture with {c} cows on it; grass at {g}%', { c: cows, g: Math.round(grass) })} />
      <div className="lab__row">
        <Btn onClick={next}>{t('Next season')}</Btn>
        <Btn ghost onClick={() => mine(1)} label={t('Add a cow')}>
          +🐄
        </Btn>
        <Btn ghost onClick={() => mine(-1)} label={t('Take a cow away')}>
          −🐄
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Season'), value: String(year) },
          { label: t('Cows'), value: String(cows), tone: cows > FARMS * RULE ? 'bad' : undefined },
          { label: t('Your milk'), value: String(Math.round(milk[0] * 10)), tone: 'accent' },
        ]}
      />
    </div>
  );
}
