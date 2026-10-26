import { useEffect, useState } from 'react';
import { C, Choice, clamp, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Polar stratospheric clouds form below about −78 °C (NOAA, Twenty Questions, 2022). */
export const CLOUD_TEMP = -78;
/** Springtime ozone over Antarctica in the early 1970s, the hole's 220 line, and deep holes (NOAA). */
export const DU_1970 = 350, DU_LINE = 220, DU_DEEP = 120;
/** Chlorine above its 1980 level, as a share of the way to its peak around 2000; 2024 from NOAA's index (72). */
export const CHLORINE = { 1980: 0, 2000: 1, 2024: 0.72 } as const;
export type ChlorineYear = keyof typeof CHLORINE;

/** Toy model: the share of the vortex cold enough for clouds, from none at −78 °C to all of it 10 °C colder. */
export const clouds = (temp: number) => clamp((CLOUD_TEMP - temp) / 10, 0, 1);
/**
 * Toy model of the lowest spring ozone: chlorine freed on the clouds destroys ozone only in sunlight; at peak
 * chlorine, with clouds throughout and sunshine, it falls from 350 to about 120 Dobson units.
 */
export const lowestOzone = (temp: number, chlorine: number, sunlit: boolean) => DU_1970 - (DU_1970 - DU_DEEP) * chlorine * clouds(temp) * (sunlit ? 1 : 0);

const VIOLET = '#c79bff', OZONE = '#8fb8ff', CL = '#c8f04a', SUN = '#ffd27a', PINK = '#ff9ad5';

export default function OzoneHole({ onDone }: LabProps) {
  const [temp, setTemp] = useState(-90);
  const [year, setYear] = useState<ChlorineYear>(2024);
  const [sun, setSun] = useState<'dark' | 'sun'>('dark');
  const [seen, setSeen] = useState<string[]>([]);
  const sunlit = sun === 'sun', chlorine = CHLORINE[year];
  const du = lowestOzone(temp, chlorine, sunlit), hole = du < DU_LINE;

  // what the reader has found: the hole, and each way of stopping it on its own
  useEffect(() => {
    const found: string[] = [];
    if (hole) found.push('hole');
    if (!hole && !seen.includes('hole')) return; // ways of stopping it count once a hole has opened
    if (!hole && sunlit && chlorine > 0 && lowestOzone(-95, chlorine, true) < DU_LINE) found.push('warm');
    if (!hole && sunlit && chlorine === 0 && clouds(temp) >= 1) found.push('chlorine');
    if (!hole && !sunlit && chlorine > 0 && clouds(temp) >= 1) found.push('dark');
    if (found.some((f) => !seen.includes(f))) setSeen((s) => [...new Set([...s, ...found])]);
  }, [hole, sunlit, chlorine, temp, seen]);
  const ways = seen.filter((f) => f !== 'hole').length;
  useGoal(seen.includes('hole') && ways >= 2, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.34, cy = h * 0.5, R = Math.min(w * 0.28, h * 0.4);
    // the ozone over the pole: the deeper the loss, the darker the disc
    const loss = (DU_1970 - du) / (DU_1970 - DU_DEEP);
    const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.25);
    g.addColorStop(0, `rgba(${Math.round(143 - 50 * loss)},${Math.round(184 - 120 * loss)},${Math.round(255 - 60 * loss)},0.9)`);
    g.addColorStop(0.75, 'rgba(143,184,255,0.55)');
    g.addColorStop(1, 'rgba(143,184,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
    ctx.fill();
    // Antarctica, roughly
    ctx.fillStyle = 'rgba(223,233,245,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.42, R * 0.36, 0.3, 0, Math.PI * 2);
    ctx.fill();
    if (hole) {
      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, R * (0.45 + 0.5 * clamp((DU_LINE - du) / (DU_LINE - DU_DEEP), 0, 1)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, t('ozone hole'), cx, cy - R * 0.62, { size: 11, color: VIOLET });
    }
    // clouds over the pole when it is cold enough
    const c = clouds(temp);
    if (c > 0) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4, x = cx + Math.cos(a) * R * 0.5, y = cy + Math.sin(a) * R * 0.55;
        ctx.globalAlpha = 0.25 + 0.6 * c;
        const cg = ctx.createLinearGradient(x - R * 0.28, y, x + R * 0.28, y);
        cg.addColorStop(0, 'rgba(255,154,213,0)');
        cg.addColorStop(0.4, 'rgba(255,154,213,0.9)');
        cg.addColorStop(0.7, 'rgba(157,255,207,0.9)');
        cg.addColorStop(1, 'rgba(157,255,207,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(x, y, R * 0.28, R * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    // the ozone gauge
    const gx = w * 0.68, top = 16, bot = h - 18, Y = (v: number) => bot - ((bot - top) * v) / 400;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(gx - 7, top, 14, bot - top);
    ctx.fillStyle = hole ? VIOLET : OZONE;
    ctx.fillRect(gx - 7, Y(du), 14, bot - Y(du));
    ctx.fillStyle = PINK;
    ctx.fillRect(gx - 14, Y(DU_LINE) - 1, 28, 2);
    label(ctx, '220', gx - 18, Y(DU_LINE), { size: 9.5, align: 'right', color: PINK });
    label(ctx, '350', gx - 18, Y(DU_1970), { size: 9.5, align: 'right', color: C.faint });
    label(ctx, `${Math.round(du)}`, gx + 12, Y(du), { size: 10, align: 'left', color: C.ink });
    // the three ingredients
    const lit = [
      [c > 0, t('clouds'), PINK],
      [sunlit, t('sunlight'), SUN],
      [chlorine > 0, t('chlorine'), CL],
    ] as const;
    lit.forEach(([on, name, col], i) => {
      const y = h * 0.25 + i * h * 0.25, x = w * 0.88;
      ctx.fillStyle = on ? col : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, name, x, y + 14, { size: 9.5, color: on ? col : C.faint });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Lowest spring ozone over Antarctica in a toy model: {n} Dobson units', { n: Math.round(du) })} />
      <Range label={t('Coldest stratosphere')} value={temp} min={-95} max={-65} step={1} onChange={setTemp} format={(v) => `${v} °C`.replace('-', '−')} />
      <Choice
        label={t('Chlorine')}
        value={year}
        onChange={setYear}
        options={[
          { value: 1980 as ChlorineYear, label: t('1980 level') },
          { value: 2000 as ChlorineYear, label: t('Peak, about 2000') },
          { value: 2024 as ChlorineYear, label: '2024' },
        ]}
      />
      <Choice
        label={t('Season')}
        value={sun}
        onChange={setSun}
        options={[
          { value: 'dark', label: t('Winter night') },
          { value: 'sun', label: t('Spring sun') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Lowest ozone'), value: `${Math.round(du)} DU`, tone: hole ? 'bad' : 'good' },
          { label: t('Ozone hole'), value: hole ? t('yes') : t('no'), tone: hole ? 'bad' : 'good' },
          { label: t('Ways to stop it found'), value: `${ways}` },
        ]}
      />
      <p className="lab__note">{t('Toy model. Measured: about 350 DU in early-1970s springs, the hole’s 220 DU line, about 120 DU in deep holes, clouds below −78 °C. The rest is simplified.')}</p>
    </div>
  );
}
