import { useEffect, useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, wavelengthColour, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** One analysis of the Lycurgus Cup's glass (Barber and Freestone, 1990): about 330 ppm of silver and 40 ppm of gold. */
export const SILVER_PPM = 330, GOLD_PPM = 40;
/** Wavelengths of visible light, in nm, in steps of 10. */
export const BANDS = Array.from({ length: 31 }, (_, i) => 400 + i * 10);

/**
 * An illustrative curve, not measured data: how strongly the metal specks take light of `nm` out of a beam,
 * strongest for blue and green.
 */
export const extinction = (nm: number) => Math.exp(-(((nm - 510) / 70) ** 2));
/** With the Romans' amount (`amount` 1) this much green-blue light at the peak gets through: e^-4, under 2%. */
const STRENGTH = 4;
/** The share of light of `nm` that passes through the glass with `amount` times the Romans' metal. */
export const transmitted = (nm: number, amount: number) => Math.exp(-STRENGTH * amount * extinction(nm));
/** Light of `nm` sent back towards a viewer in front: a little from the surface, and what the specks scatter (greens most). */
export const reflected = (nm: number, amount: number) => 0.03 + 0.5 * (1 - transmitted(nm, amount)) * 0.6 * Math.exp(-(((nm - 545) / 45) ** 2));

// CIE 1931 colour matching, by the multi-lobe Gaussian fit of Wyman, Sloan and Shirley (2013).
const g = (x: number, mu: number, s1: number, s2: number) => Math.exp(-0.5 * ((x - mu) / (x < mu ? s1 : s2)) ** 2);
const xBar = (l: number) => 1.056 * g(l, 599.8, 37.9, 31) + 0.362 * g(l, 442, 16, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
const yBar = (l: number) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
const zBar = (l: number) => 1.217 * g(l, 437, 11.8, 36) + 0.681 * g(l, 459, 26, 13.8);
const WHITE_Y = BANDS.reduce((s, l) => s + yBar(l), 0);

/** The colour a spectrum (a share of light for each of BANDS) looks, as sRGB from 0 to 255, scaled so its brightest part is full. */
export function colourOf(spectrum: number[]): [number, number, number] {
  let X = 0, Y = 0, Z = 0;
  BANDS.forEach((l, i) => {
    X += spectrum[i] * xBar(l);
    Y += spectrum[i] * yBar(l);
    Z += spectrum[i] * zBar(l);
  });
  [X, Y, Z] = [X / WHITE_Y, Y / WHITE_Y, Z / WHITE_Y];
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z].map((v) => Math.max(0, v));
  const top = Math.max(...lin, 1e-9);
  return lin.map((v) => {
    const u = v / top;
    return Math.round(255 * (u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055));
  }) as [number, number, number];
}

export type Hue = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
/** A plain name for a colour. */
export function hueName([r, gg, b]: [number, number, number]): Hue {
  const max = Math.max(r, gg, b), min = Math.min(r, gg, b);
  if (max - min < 40) return 'white';
  const d = max - min;
  let h = max === r ? ((gg - b) / d) % 6 : max === gg ? (b - r) / d + 2 : (r - gg) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 18 || h >= 330) return 'red';
  if (h < 42) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 170) return 'green';
  if (h < 260) return 'blue';
  return 'purple';
}

/** What reaches the eye: through the glass from a lamp behind, or sent back from a lamp in front. */
export const seen = (lamp: 'front' | 'behind', amount: number) => BANDS.map((l) => (lamp === 'behind' ? transmitted(l, amount) : reflected(l, amount)));

/** The share of blue and green light (450–570 nm) that a beam loses on its way through. */
export const blueGreenLost = (amount: number) => {
  const bs = BANDS.filter((l) => l >= 450 && l <= 570);
  return bs.reduce((s, l) => s + 1 - transmitted(l, amount), 0) / bs.length;
};

const nameOf = (h: Hue) =>
  ({ white: t('white, no colour'), red: t('red'), orange: t('reddish orange'), yellow: t('yellow'), green: t('green, like jade'), blue: t('blue'), purple: t('reddish purple') })[h];

export default function LycurgusCupLab({ onDone }: LabProps) {
  const [lamp, setLamp] = useState<'front' | 'behind'>('front');
  const [amount, setAmount] = useState(0);
  const [saw, setSaw] = useState({ red: false, green: false });
  const spec = seen(lamp, amount), rgb = colourOf(spec), name = hueName(rgb);
  // the reader has to see the cup's two faces, with about the Romans' amount of metal
  useEffect(() => {
    if (amount < 0.8) return;
    if (lamp === 'behind' && name === 'red') setSaw((s) => (s.red ? s : { ...s, red: true }));
    if (lamp === 'front' && name === 'green') setSaw((s) => (s.green ? s : { ...s, green: true }));
  }, [lamp, amount, name]);
  useGoal(saw.red && saw.green, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the cup, in the colour that reaches the eye
    const cx = w * 0.3, top = h * 0.1, ch = h * 0.62, cw = ch * 0.8;
    const bright = lamp === 'behind' ? 1 : 0.75;
    const col = `rgb(${rgb.map((v) => Math.round(v * bright)).join(',')})`;
    if (lamp === 'behind') {
      const glow = ctx.createRadialGradient(cx, top + ch * 0.45, 4, cx, top + ch * 0.45, ch * 0.75);
      glow.addColorStop(0, `rgba(${rgb.join(',')},0.45)`);
      glow.addColorStop(1, `rgba(${rgb.join(',')},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w * 0.6, h);
    }
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx - cw / 2, top);
    ctx.bezierCurveTo(cx - cw / 2, top + ch * 0.6, cx - cw * 0.3, top + ch, cx, top + ch);
    ctx.bezierCurveTo(cx + cw * 0.3, top + ch, cx + cw / 2, top + ch * 0.6, cx + cw / 2, top);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8c06a';
    ctx.fillRect(cx - 4, top + ch, 8, h * 0.08);
    ctx.fillRect(cx - cw * 0.25, top + ch + h * 0.08, cw * 0.5, 4);
    ctx.fillRect(cx - cw / 2 - 3, top - 3, cw + 6, 5);
    // the lamp
    const lx = lamp === 'behind' ? cx + cw * 0.15 : w * 0.06, ly = lamp === 'behind' ? top + ch * 0.35 : top + ch * 0.9;
    if (lamp === 'front') {
      ctx.fillStyle = '#fffbe9';
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    label(ctx, lamp === 'behind' ? t('lamp behind the cup') : t('lamp in front'), cx, h - 10, { size: 10, color: C.soft });
    // right: the spectrum of what reaches the eye
    const x0 = w * 0.6, x1 = w - 12, y0 = h * 0.78, y1 = h * 0.14, bw = (x1 - x0) / BANDS.length;
    BANDS.forEach((l, i) => {
      const v = Math.min(1, spec[i] / (lamp === 'behind' ? 1 : 0.35));
      ctx.fillStyle = wavelengthColour(l, 55, 0.25);
      ctx.fillRect(x0 + i * bw, y1, bw + 0.5, y0 - y1);
      ctx.fillStyle = wavelengthColour(l, 58);
      ctx.fillRect(x0 + i * bw, y0 - v * (y0 - y1), bw + 0.5, v * (y0 - y1));
    });
    label(ctx, t('colours reaching your eye'), (x0 + x1) / 2, y1 - 9, { size: 10, color: C.soft });
    label(ctx, '400', x0, y0 + 10, { size: 9, color: C.faint, align: 'left' });
    label(ctx, '700 nm', x1, y0 + 10, { size: 9, color: C.faint, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The cup lit {how}, with {p}% of the Romans’ gold and silver: it looks {c}', { how: lamp === 'behind' ? t('from behind') : t('from the front'), p: formatNumber(Math.round(amount * 100)), c: nameOf(name) })} />
      <Choice
        label={t('Where the lamp is')}
        value={lamp}
        onChange={setLamp}
        options={[
          { value: 'front', label: t('Lamp in front') },
          { value: 'behind', label: t('Lamp behind') },
        ]}
      />
      <Range label={t('Gold and silver specks')} value={amount} min={0} max={1.5} step={0.1} onChange={setAmount} format={(v) => t('{p}% of the Romans’', { p: formatNumber(Math.round(v * 100)) })} />
      <Readouts
        items={[
          { label: t('The cup looks'), value: nameOf(name), tone: name === 'red' || name === 'green' ? 'accent' : undefined },
          { label: t('Blue and green lost'), value: `${formatNumber(Math.round(blueGreenLost(amount) * 100))}%` },
          { label: t('The cup’s two colours seen'), value: t('{n} of 2', { n: formatNumber(Number(saw.red) + Number(saw.green)) }), tone: saw.red && saw.green ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: an illustrative curve, strongest for blue and green, not measured data.')}</p>
    </div>
  );
}
