import { useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export const LIFT = 26; // m from the sea to Gatun Lake, in three steps
export const STEP = LIFT / 3;
export const CHAMBER_LITRES = 101e6; // to fill one of the original chambers

/** Water running down through a culvert: fast while the levels are far apart, slowing as they meet (flow ∝ √height). */
export const fillStep = (level: number, target: number, dt: number) => Math.min(target, level + 1.6 * Math.sqrt(Math.max(0, target - level)) * dt);

export default function PanamaLocks({ onDone, active }: LabProps) {
  const [levels, setLevels] = useState([0, STEP, 2 * STEP]);
  const [ship, setShip] = useState(-1); // −1 at sea, 0–2 in a chamber, 3 on the lake
  const [filling, setFilling] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  useGoal(ship === 3, onDone);

  const here = ship < 0 ? 0 : ship > 2 ? LIFT : levels[ship];
  const above = ship < 2 ? levels[ship + 1] : LIFT;
  const level = Math.abs(here - above) < 0.05;
  useFrame((dt) => {
    if (filling === null) return;
    const target = filling < 2 ? STEP * (filling + 1) : LIFT;
    const next = fillStep(levels[filling], target, dt * 2);
    setLevels((ls) => ls.map((l, i) => (i === filling ? next : l)));
    if (target - next < 0.02) {
      setLevels((ls) => ls.map((l, i) => (i === filling ? target : l)));
      setFilling(null);
    }
  }, active && filling !== null);

  const sail = () => {
    setShip((s) => s + 1);
    // the chamber left behind drains back down, ready for the next ship
    if (ship >= 0) setLevels((ls) => ls.map((l, i) => (i === ship ? STEP * i : l)));
  };
  const valve = () => {
    setFilling(ship);
    setUsed((u) => u + CHAMBER_LITRES);
  };
  const again = () => {
    setLevels([0, STEP, 2 * STEP]);
    setShip(-1);
    setUsed(0);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const top = 34, bot = h - 6, Y = (m: number) => bot - (m / (LIFT + 8)) * (bot - top);
    const seaW = w * 0.14, lakeW = w * 0.2, cw = (w - seaW - lakeW) / 3, X = (i: number) => seaW + i * cw;
    // the sea, the three chambers, the lake
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, Y(0), seaW, bot - Y(0));
    ctx.fillRect(w - lakeW, Y(LIFT), lakeW, bot - Y(LIFT));
    levels.forEach((l, i) => {
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(X(i), Y(l), cw, bot - Y(l));
      // the chamber floor steps up, as the ground does
      ctx.fillStyle = '#57534e';
      ctx.fillRect(X(i), Y(STEP * i - 3), cw, bot - Y(STEP * i - 3));
    });
    ctx.fillStyle = '#57534e';
    ctx.fillRect(w - lakeW, Y(LIFT - 12), lakeW, bot - Y(LIFT - 12));
    // gates between the levels, open only when the water is level on both sides
    const waterAt = (k: number) => (k < 0 ? 0 : k > 2 ? LIFT : levels[k]);
    for (let g = 0; g <= 3; g++) {
      const x = X(g), lv = Math.abs(waterAt(g - 1) - waterAt(g)) < 0.05;
      const gateOpen = lv && (ship === g - 1 || ship === g);
      line(ctx, x, Y(Math.max(waterAt(g - 1), waterAt(g)) + 2), x, gateOpen ? Y(Math.max(waterAt(g - 1), waterAt(g)) + 2) : bot, gateOpen ? C.good : '#e5e7eb', 4);
    }
    if (filling !== null) {
      label(ctx, '⬆', X(filling) + cw / 2, Y(levels[filling]) + 14, { size: 14, color: '#bfdbfe' });
      line(ctx, X(filling) + cw / 2, bot - 2, w - lakeW + 6, bot - 2, '#93c5fd', 2, [4, 3]);
    }
    // the ship
    const sx = ship < 0 ? seaW / 2 : ship > 2 ? w - lakeW / 2 : X(ship) + cw / 2;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(sx - 18, Y(here) - 2);
    ctx.lineTo(sx + 18, Y(here) - 2);
    ctx.lineTo(sx + 13, Y(here) + 6);
    ctx.lineTo(sx - 13, Y(here) + 6);
    ctx.fill();
    ctx.fillRect(sx - 6, Y(here) - 10, 10, 8);
    label(ctx, t('sea'), seaW / 2, Y(0) - 10, { size: 10, color: '#bfdbfe' });
    label(ctx, t('Gatun Lake, 26 m'), w - 6, Y(LIFT) - 22, { size: 10, align: 'right', color: C.ink });
  };

  const where = ship < 0 ? t('at sea') : ship > 2 ? t('on Gatun Lake') : t('in chamber {n}', { n: ship + 1 });
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Three lock chambers between the sea and Gatun Lake; the ship is {w}', { w: where })} />
      <div className="lab__row">
        <Btn onClick={valve} disabled={ship < 0 || ship > 2 || level || filling !== null}>
          {t('Open the valve')}
        </Btn>
        <Btn onClick={sail} disabled={ship > 2 || !level || filling !== null}>
          {ship === 2 ? t('Sail onto the lake') : t('Open the gates, sail on')}
        </Btn>
        <Btn ghost onClick={again}>
          {t('New ship')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Ship'), value: where },
          { label: t('Height'), value: `${formatNumber(Math.round(here * 10) / 10)} m`, tone: 'accent' },
          { label: t('Lake water used'), value: t('{n} million L', { n: formatNumber(used / 1e6) }) },
        ]}
      />
    </div>
  );
}
