import { useMemo, useState } from 'react';
import { C, Choice, label, line, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

const NM = Array.from({ length: 35 }, (_, i) => 380 + i * 10);

/** Sunlight above the air, as a 5,778 K black body (relative units). */
const sun = (nm: number) => 1 / (Math.pow(nm, 5) * (Math.exp(1.4388e7 / (nm * 5778)) - 1));
/** Rayleigh optical depth of the whole atmosphere, straight up: about 0.097 at 550 nm, growing as 1/λ⁴. */
const tau = (nm: number) => 0.097 * Math.pow(550 / nm, 4);
/** How much more air the sunlight crosses than straight down (Kasten and Young's formula). */
export const airMass = (elevation: number) => 1 / (Math.sin((elevation * Math.PI) / 180) + 0.50572 * Math.pow(elevation + 6.07995, -1.6364));

// The eye's colour matching functions (CIE 1931), as fitted by Wyman, Sloan and Shirley (2013).
const g = (x: number, mu: number, s1: number, s2: number) => Math.exp(-0.5 * Math.pow((x - mu) / (x < mu ? s1 : s2), 2));
const xBar = (l: number) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
const yBar = (l: number) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
const zBar = (l: number) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);

/** A spectrum (sampled at NM) as an sRGB colour, scaled so its brightest channel is `peak`. */
function toRgb(spectrum: number[], peak: number): [number, number, number] {
  let X = 0, Y = 0, Z = 0;
  spectrum.forEach((p, i) => {
    X += p * xBar(NM[i]);
    Y += p * yBar(NM[i]);
    Z += p * zBar(NM[i]);
  });
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z].map((v) => Math.max(0, v));
  const max = Math.max(...lin);
  if (!(max > 0)) return [0, 0, 0];
  return lin.map((v) => {
    const c = (v / max) * peak;
    return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
  }) as [number, number, number];
}

const css = ([r, g, b]: number[]) => `rgb(${r},${g},${b})`;

export default function SkyBlue({ onDone }: LabProps) {
  const [elev, setElev] = useState(60);
  const [view, setView] = useState<'eye' | 'light'>('eye');
  useGoal(elev <= 3, onDone);

  const { skyColour, sunColour, skySpec, glow } = useMemo(() => {
    const m = airMass(elev);
    // Overhead sky: sunlight dimmed along its slanting path, then scattered down to you (single scattering).
    const skySpec = NM.map((nm) => sun(nm) * Math.exp(-tau(nm) * m) * tau(nm));
    const direct = NM.map((nm) => sun(nm) * Math.exp(-tau(nm) * m));
    const noon = NM.reduce((s, nm) => s + sun(nm) * Math.exp(-tau(nm)) * tau(nm) * yBar(nm), 0);
    const bright = skySpec.reduce((s, p, i) => s + p * yBar(NM[i]), 0) / noon;
    return { skySpec, skyColour: toRgb(skySpec, 0.25 + 0.6 * Math.min(1, bright)), sunColour: toRgb(direct, 1), glow: Math.min(1, bright) };
  }, [elev]);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const ground = h * 0.62;
    const sky = ctx.createLinearGradient(0, 0, 0, ground);
    sky.addColorStop(0, css(skyColour.map((c) => c * 0.85)));
    sky.addColorStop(1, `rgba(${sunColour.join(',')},${0.35 + 0.4 * (1 - glow)})`);
    ctx.fillStyle = css(skyColour);
    ctx.fillRect(0, 0, w, ground);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, ground);
    // the Sun on its arc
    const a = (elev * Math.PI) / 180, sx = w * 0.5 + Math.cos(a) * w * 0.38, sy = ground - Math.sin(a) * (ground - 22);
    ctx.fillStyle = css(sunColour);
    ctx.shadowColor = css(sunColour);
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(sx, sy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, ground, w, h - ground);
    if (view === 'light') {
      // what arrives from the sky, colour by colour, against how strongly your eye responds to each
      const L = 14, R = w - 14, top = ground + 10, bot = h - 16, X = (nm: number) => L + ((nm - 380) / 340) * (R - L);
      const maxSky = Math.max(...skySpec);
      NM.forEach((nm, i) => {
        const bh = (skySpec[i] / maxSky) * (bot - top);
        ctx.fillStyle = `hsl(${Math.max(0, 270 - ((nm - 380) / 320) * 270)},90%,60%)`;
        ctx.fillRect(X(nm) - 3, bot - bh, 6, bh);
      });
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      NM.forEach((nm, i) => ctx[i ? 'lineTo' : 'moveTo'](X(nm), bot - (yBar(nm) / 1.06) * (bot - top)));
      ctx.stroke();
      label(ctx, t('light from the sky'), L, top + 4, { size: 10.5, align: 'left', color: C.ink });
      label(ctx, t('your eye’s response'), R, top + 4, { size: 10.5, align: 'right', color: C.ink });
      label(ctx, t('violet'), L, h - 6, { size: 10, align: 'left' });
      label(ctx, t('red'), R, h - 6, { size: 10, align: 'right' });
      line(ctx, L, bot, R, bot, C.faint, 1);
    } else {
      label(ctx, t('The Sun’s light crosses {m}× as much air as at noon overhead', { m: Math.round(airMass(elev) * 10) / 10 }), w / 2, ground + (h - ground) / 2, { size: 11.5, color: C.soft });
    }
  };

  return (
    <div className="lab">
      <Choice label={t('Show')} value={view} onChange={setView} options={[{ value: 'eye', label: t('The sky') }, { value: 'light', label: t('Its light, colour by colour') }]} />
      <Stage draw={draw} label={t('The sky and the Sun at {e}° above the horizon', { e: elev })} />
      <Range label={t('Sun height')} value={elev} min={0} max={90} onChange={setElev} format={(v) => `${v}°`} />
    </div>
  );
}
