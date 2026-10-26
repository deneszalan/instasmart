import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The example: 10 MW from a 10 kV generator, sent through one line with 5 ohms of resistance (simplified). */
export const P_MW = 10;
export const R_OHM = 5;
export const GEN_KV = 10;

/** Current, heat lost and its share of the power sent, for a line at `kV`: I = P/V, loss = I²R. */
export function lineLoss(kV: number) {
  const amps = (P_MW * 1e6) / (kV * 1e3), lossMW = (amps * amps * R_OHM) / 1e6;
  return { amps, lossMW, share: lossMW / P_MW };
}

const AMBER = '#ffb000', COPPER = '#d9824a', HEAT = '#ff5a4f';

export default function PowerGrid({ onDone }: LabProps) {
  const [kV, setKV] = useState(GEN_KV);
  const r = lineLoss(kV);
  useGoal(r.share < 0.01, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const y = h * 0.42, x0 = 40, x1 = w - 40;
    // generator, step-up transformer, the line, and the town
    ctx.fillStyle = C.faint;
    ctx.fillRect(x0 - 26, y - 16, 26, 32);
    label(ctx, `${GEN_KV} kV`, x0 - 13, y + 28, { size: 9.5, color: C.soft });
    const tx = x0 + 34;
    ctx.fillStyle = 'rgba(124,183,230,0.6)';
    ctx.fillRect(tx - 14, y - 18, 28, 36);
    label(ctx, `1 : ${formatNumber(Math.round((kV / GEN_KV) * 10) / 10)}`, tx, y - 28, { size: 10, color: C.ink });
    const glow = Math.min(1, Math.sqrt(r.share * 2));
    if (glow > 0.02) line(ctx, tx + 14, y, x1 - 20, y, `rgba(255,90,79,${0.55 * glow})`, 22);
    line(ctx, tx + 14, y, x1 - 20, y, COPPER, 2 + 12 * Math.min(1, r.amps / 1000));
    for (let i = 0; i < 6; i++) dot(ctx, tx + 40 + i * ((x1 - tx - 80) / 5), y, 2.5, C.ink);
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.moveTo(x1 - 20, y + 14);
    ctx.lineTo(x1, y - 6);
    ctx.lineTo(x1 + 20, y + 14);
    ctx.closePath();
    ctx.fill();
    label(ctx, `${formatNumber(kV)} kV · ${formatNumber(Math.round(r.amps))} A`, (tx + x1) / 2, y - 26, { size: 11, color: AMBER });
    // what arrives and what is lost
    const by = h - 30, bw = x1 - x0 + 20, lost = Math.min(1, r.share);
    ctx.fillStyle = AMBER;
    ctx.fillRect(x0 - 10, by, bw * (1 - lost), 14);
    ctx.fillStyle = HEAT;
    ctx.fillRect(x0 - 10 + bw * (1 - lost), by, bw * lost, 14);
    label(ctx, t('delivered'), x0 - 10, by - 9, { size: 9.5, align: 'left', color: AMBER });
    label(ctx, t('lost as heat'), x0 + bw - 10, by - 9, { size: 9.5, align: 'right', color: HEAT });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{p} MW sent at {v} kV: {a} amps, and {l}% lost as heat', { p: P_MW, v: kV, a: Math.round(r.amps), l: formatNumber(Math.round(r.share * 1000) / 10) })} />
      <Range label={t('Line voltage')} value={kV} min={10} max={400} step={5} onChange={setKV} format={(v) => `${formatNumber(v)} kV`} />
      <Readouts
        items={[
          { label: t('Current'), value: `${formatNumber(Math.round(r.amps))} A` },
          { label: t('Lost as heat'), value: `${formatNumber(Math.round(r.share * 1000) / 10)}%`, tone: r.share < 0.01 ? 'good' : 'bad' },
          { label: t('Delivered'), value: `${formatNumber(Math.round((P_MW - r.lossMW) * 100) / 100)} MW` },
        ]}
      />
      <p className="lab__note">{t('Simplified: 10 MW from a 10 kV generator, sent through one line with 5 ohms of resistance.')}</p>
    </div>
  );
}
