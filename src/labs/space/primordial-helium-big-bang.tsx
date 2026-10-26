import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Neutron lifetime in seconds (Particle Data Group, 2024). */
export const TAU = 879.4;
/** About one neutron per six protons when the weak reactions stop, about one second in (PDG). */
export const NP_FREEZE = 1 / 6;
/** Primordial helium measured with the Large Binocular Telescope (LBT Yp Project, 2026): 0.2458 ± 0.0013. */
export const MEASURED = 0.2458, MEASURED_ERR = 0.0013, PREDICTED = 0.2467;

/** Neutrons per proton at `sec` seconds, if only neutron decay changes the ratio after one second. */
export function neutronsPerProton(sec: number): number {
  const n0 = NP_FREEZE / (1 + NP_FREEZE), n = n0 * Math.exp(-(Math.max(1, sec) - 1) / TAU);
  return n / (1 - n);
}
/** Helium-4's share of the mass when almost every neutron ends up in helium: 2(n/p) / (1 + n/p). */
export const heliumShare = (np: number) => (2 * np) / (1 + np);
export const heliumAt = (sec: number) => heliumShare(neutronsPerProton(sec));

const NEUTRON = '#7fd3ff', PROTON = '#ff7f6e', HELIUM = '#ffd166';

export default function PrimordialHelium({ onDone }: LabProps) {
  const [minutes, setMinutes] = useState(0);
  const sec = Math.max(1, minutes * 60);
  const np = neutronsPerProton(sec), y = heliumShare(np);
  const hit = Math.abs(y - MEASURED) <= MEASURED_ERR;
  useGoal(hit, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // top: 112 nucleons, coloured by what they become
    const total = 112, inHe = Math.round(y * total);
    const cols = 8, rows = 14, cell = Math.min((w * 0.34) / cols, (h - 12) / rows);
    const ox = 6, oy = (h - rows * cell) / 2;
    for (let i = 0; i < total; i++) {
      const x = ox + (i % cols) * cell + cell / 2, yy = oy + Math.floor(i / cols) * cell + cell / 2;
      const inHelium = i < inHe;
      ctx.fillStyle = inHelium ? (i % 4 < 2 ? NEUTRON : PROTON) : PROTON;
      ctx.globalAlpha = inHelium ? 1 : 0.55;
      ctx.beginPath();
      ctx.arc(x, yy, cell * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (inHelium && i % 4 === 0) {
        ctx.strokeStyle = HELIUM;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - cell * 0.5, yy - cell * 0.5, cell * 4, cell);
        // a helium nucleus: 2 neutrons and 2 protons side by side
      }
    }
    // bottom: helium share against the start time, 0 to 20 minutes
    const L = ox + cols * cell + 34, R = w - 10, T = 14, B = h - 20, MAX = 0.3;
    const X = (m: number) => L + ((R - L) * m) / 20, Y = (v: number) => B - ((B - T) * v) / MAX;
    for (const v of [0.1, 0.2, 0.3]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${Math.round(v * 100)}%`, L - 4, Y(v), { size: 9.5, align: 'right', color: C.faint });
    }
    for (const m of [0, 5, 10, 15, 20]) label(ctx, t('{n} min', { n: m }), X(m), B + 10, { size: 9.5, color: C.faint, align: m === 20 ? 'right' : 'center' });
    // the measured band
    ctx.fillStyle = 'rgba(127,211,255,0.25)';
    ctx.fillRect(L, Y(MEASURED + MEASURED_ERR), R - L, Math.max(2, Y(MEASURED - MEASURED_ERR) - Y(MEASURED + MEASURED_ERR)));
    label(ctx, t('measured in 2026'), R, Y(MEASURED) - 9, { size: 9.5, align: 'right', color: NEUTRON });
    ctx.strokeStyle = HELIUM;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let m = 0; m <= 20; m += 0.1) ctx[m ? 'lineTo' : 'moveTo'](X(m), Y(heliumAt(Math.max(1, m * 60))));
    ctx.stroke();
    line(ctx, X(minutes), T, X(minutes), B, C.soft, 1.5, [4, 3]);
    ctx.fillStyle = hit ? C.good : HELIUM;
    ctx.beginPath();
    ctx.arc(X(minutes), Y(y), 5, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Helium made if nuclei start forming {m} minutes after the Big Bang: {p} of the mass', { m: formatNumber(minutes), p: `${formatNumber(Math.round(y * 1000) / 10)}%` })} />
      <Range label={t('Nuclei start forming after')} value={minutes} min={0} max={20} step={0.1} onChange={(v) => setMinutes(Math.round(v * 10) / 10)} format={(v) => t('{n} min', { n: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Neutrons : protons'), value: `1 : ${formatNumber(Math.round((1 / np) * 10) / 10)}` },
          { label: t('Helium share'), value: `${formatNumber(Math.round(y * 1000) / 10)}%`, tone: hit ? 'good' : 'accent' },
          { label: t('Measured'), value: `${formatNumber(Math.round(MEASURED * 1000) / 10)}%` },
        ]}
      />
      <p className="lab__note">{t('Simplest model: one neutron per six protons at one second, then only neutron decay; every neutron left ends up in helium.')}</p>
    </div>
  );
}
