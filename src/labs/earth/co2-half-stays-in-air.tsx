import { useState } from 'react';
import { C, label, lerp, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** WMO Greenhouse Gas Bulletin No. 22 (27 October 2026): CO₂ rose 2.8 ppm from 2024 to 2025, to 426.8 ppm. */
export const RISE_2025 = 2.8, PPM_2025 = 426.8;
/** About half of the CO₂ emitted each year stays in the air; land and ocean take up the rest. */
export const STAYS = 0.5;
/** In this simple picture, what went in during 2025 and what the land and ocean took out, in ppm a year. */
export const IN_2025 = RISE_2025 / STAYS, OUT_2025 = IN_2025 - RISE_2025;

/** The yearly change in ppm with emissions at `percent` of 2025's, the drains held at what they took in 2025. */
export const yearlyChange = (percent: number) => (percent / 100) * IN_2025 - OUT_2025;
/** The emissions, as a percentage of 2025's, at which the level stops rising. */
export const STEADY_AT = (OUT_2025 / IN_2025) * 100;

const RUST = '#e0733f', LAND = '#6cc283', SEA = '#6aaee6';
const one = (v: number) => formatNumber(Math.round(v * 10) / 10);

export default function Co2Bathtub({ onDone, active }: LabProps) {
  const [percent, setPercent] = useState(100);
  const [clock, setClock] = useState(0);
  useFrame((dt) => setClock((c) => (c + dt) % 1000), active);
  const d = yearlyChange(percent), flat = Math.abs(d) < 0.05;
  useGoal(flat, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = w * 0.14, x1 = w * 0.86, top = h * 0.28, bot = h * 0.64, level = lerp(bot, top, 0.8);
    // the tub, its water and its level
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(x0, top, x1 - x0, bot - top, 16);
    ctx.fill();
    ctx.fillStyle = 'rgba(224,115,63,0.30)';
    ctx.fillRect(x0 + 2, level, x1 - x0 - 4, bot - level - 2);
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x0, top, x1 - x0, bot - top, 16);
    ctx.stroke();
    label(ctx, t('CO₂ in the air'), x0 + 12, (level + bot) / 2 + 4, { size: 12, color: C.ink, align: 'left' });
    // the tap: its stream gets thinner as emissions fall
    const tapX = x0 + (x1 - x0) * 0.22;
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(6, h * 0.07);
    ctx.lineTo(tapX, h * 0.07);
    ctx.lineTo(tapX, h * 0.11);
    ctx.stroke();
    const n = 12;
    for (let i = 0; i < n; i++) {
      if ((i * 0.6180339) % 1 >= percent / 120) continue;
      const u = (clock * 0.8 + i / n) % 1, y = lerp(h * 0.13, level, u);
      ctx.fillStyle = RUST;
      ctx.beginPath();
      ctx.arc(tapX, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    label(ctx, t('in: {v} ppm a year', { v: one((percent / 100) * IN_2025) }), tapX + 10, h * 0.11, { size: 11, color: RUST, align: 'left' });
    // the two drains, held at 2025's uptake
    const drains: [number, string, string][] = [[x0 + (x1 - x0) * 0.25, LAND, t('land drain')], [x0 + (x1 - x0) * 0.75, SEA, t('ocean drain')]];
    drains.forEach(([x, color, name], i) => {
      const end = h * 0.84;
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x, bot);
      ctx.lineTo(x, end);
      ctx.stroke();
      for (let j = 0; j < 3; j++) {
        const u = (clock * 0.6 + j / 3) % 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, lerp(bot + 4, end - 2, u), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      label(ctx, name, i ? x + 9 : x - 9, (bot + end) / 2 + 2, { size: 11, color, align: i ? 'left' : 'right' });
    });
    label(ctx, t('out: {v} ppm a year', { v: one(OUT_2025) }), (x0 + x1) / 2, h * 0.93, { size: 11, color: C.soft });
    // the level's arrow: up while the tap beats the drains
    const ax = x1 - 16, len = Math.min(1, Math.abs(d) / 3) * (h * 0.14);
    if (flat) {
      label(ctx, t('level steady'), ax, level + 12, { size: 12, color: C.good, align: 'right' });
    } else {
      const dir = d > 0 ? -1 : 1;
      ctx.strokeStyle = d > 0 ? RUST : C.good;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax, level);
      ctx.lineTo(ax, level + dir * len);
      ctx.moveTo(ax - 6, level + dir * (len - 7));
      ctx.lineTo(ax, level + dir * len);
      ctx.lineTo(ax + 6, level + dir * (len - 7));
      ctx.stroke();
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Emissions at {p}% of 2025: the CO₂ level changes by {d} ppm a year', { p: percent, d: one(d) })} />
      <Range label={t('Emissions, share of 2025')} value={percent} min={0} max={120} step={5} onChange={setPercent} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('Taken up by land and ocean'), value: `${one(OUT_2025)} ppm` },
          { label: t('Change in the air each year'), value: `${d > 0.05 ? '+' : ''}${one(d)} ppm`, tone: flat ? 'good' : d > 0 ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: land and ocean take up what they did in 2025, about half of that year’s CO₂. Really, their uptake changes with the CO₂, the weather and warming.')}</p>
    </div>
  );
}
