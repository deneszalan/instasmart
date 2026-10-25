import { useState } from 'react';
import { Btn, C, Choice, label, line, Readouts, Stage, useFrame, useGoal, wavelengthColour, type LabProps } from '../kit';
import { t } from '../../i18n';

type Metal = 'Na' | 'K' | 'Li' | 'Cu' | 'Sr' | 'Au';
/** Light a metal gives a flame: sharp lines from its atoms [nm, strength], or broad bands from molecules it forms [from, to, strength]. */
interface Light {
  lines: [number, number][];
  bands: [number, number, number][];
  colour: string; // as the eye sees it
  through: string; // through cobalt blue glass
}
export const FLAMES: Record<Metal, Light> = {
  Na: { lines: [[589.0, 1], [589.6, 0.6]], bands: [], colour: '255,196,40', through: '70,70,150' },
  K: { lines: [[766.5, 1], [769.9, 0.6], [404.4, 0.35]], bands: [], colour: '205,150,235', through: '190,60,200' },
  Li: { lines: [[670.8, 1], [610.4, 0.15]], bands: [], colour: '235,25,80', through: '170,20,70' },
  Cu: { lines: [], bands: [[510, 555, 0.85], [420, 455, 0.55]], colour: '40,210,170', through: '40,90,225' },
  Sr: { lines: [[460.7, 0.2]], bands: [[640, 690, 1], [600, 612, 0.7]], colour: '255,35,45', through: '165,20,45' },
  Au: { lines: [], bands: [], colour: '', through: '' },
};

/** Cobalt glass passes violet and blue and some deep red, and holds back the yellow of sodium. */
export const cobaltPasses = (nm: number) => nm < 500 || nm > 655;

export default function FlameTest({ onDone, active }: LabProps) {
  const [metal, setMetal] = useState<Metal>('Na');
  const [salt, setSalt] = useState(false);
  const [glass, setGlass] = useState(false);
  const [time, setTime] = useState(0);
  useGoal(metal === 'K' && salt && glass, onDone);
  useFrame((dt) => setTime((s) => s + dt), active);

  const own = FLAMES[metal], na = FLAMES.Na, withSalt = salt && metal !== 'Na';
  // sodium's yellow drowns out other colours, unless the glass holds it back
  const colour = glass ? own.through || (withSalt ? na.through : '') : withSalt ? na.colour : own.colour;

  const names: Record<Metal, string> = { Na: t('Sodium'), K: t('Potassium'), Li: t('Lithium'), Cu: t('Copper'), Sr: t('Strontium'), Au: t('Gold') };
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the burner and its flame
    const fx = w * 0.24, base = h * 0.66, fh = h * 0.56;
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(fx - 7, base, 14, h - base - 6);
    const flame = (hgt: number, wid: number, rgb: string, alpha: number) => {
      const wob = Math.sin(time * 9) * 2 + Math.sin(time * 23) * 1.2;
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(fx - wid, base);
      ctx.quadraticCurveTo(fx - wid * 1.1, base - hgt * 0.5, fx + wob, base - hgt);
      ctx.quadraticCurveTo(fx + wid * 1.1, base - hgt * 0.5, fx + wid, base);
      ctx.closePath();
      ctx.fill();
    };
    flame(fh * 0.45, 12, glass ? '60,60,200' : '96,165,250', 0.55);
    if (colour) flame(fh, 22, colour, 0.85);
    flame(fh * 0.25, 6, '191,219,254', 0.7);
    // the wire loop holding the sample
    line(ctx, fx + 40, base - fh * 0.3, fx + 6, base - fh * 0.36, '#d4d4d8', 2);
    if (glass) {
      ctx.fillStyle = 'rgba(30,64,175,0.35)';
      ctx.fillRect(fx - 38, Math.max(4, base - fh - 8), 76, fh + 14);
      label(ctx, t('cobalt glass'), fx, base + 16, { size: 10, color: '#93c5fd' });
    }
    // the light split into its wavelengths
    const L = w * 0.46, R = w - 12, top = 26, bot = h - 34, X = (nm: number) => L + ((nm - 400) / 380) * (R - L);
    for (let nm = 400; nm < 780; nm += 2) {
      ctx.fillStyle = wavelengthColour(nm, nm > 700 ? 22 : 40, 0.3);
      ctx.fillRect(X(nm), top, X(nm + 2) - X(nm) + 0.5, bot - top);
    }
    const shown = (nm: number) => !glass || cobaltPasses(nm);
    const lights: Light[] = withSalt ? [own, na] : [own];
    for (const l of lights) {
      for (const [a, b, s] of l.bands) {
        ctx.fillStyle = wavelengthColour((a + b) / 2, 62, shown((a + b) / 2) ? s : 0.06);
        ctx.fillRect(X(a), bot - s * (bot - top), X(b) - X(a), s * (bot - top));
      }
      for (const [nm, s] of l.lines) {
        ctx.fillStyle = shown(nm) ? wavelengthColour(nm, nm > 700 ? 55 : 66) : 'rgba(255,255,255,0.08)';
        ctx.fillRect(X(nm) - 1.5, bot - s * (bot - top), 3, s * (bot - top));
      }
    }
    if (glass) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(X(500), top, X(655) - X(500), bot - top);
    }
    line(ctx, L, bot, R, bot, C.faint, 1);
    for (const nm of [400, 500, 600, 700]) label(ctx, `${nm}`, X(nm), bot + 10, { size: 9.5, color: C.faint });
    label(ctx, 'nm', R, bot + 10, { size: 9.5, align: 'right', color: C.faint });
    label(ctx, t('its light, split into wavelengths'), L, 12, { size: 10.5, align: 'left' });
  };

  const main = [...own.lines].sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="lab">
      <Choice label={t('Metal on the wire')} value={metal} onChange={setMetal} options={(Object.keys(FLAMES) as Metal[]).map((m) => ({ value: m, label: m }))} />
      <Stage draw={draw} label={t('A Bunsen flame with {metal} on the wire, and its spectrum', { metal: names[metal] })} />
      <div className="lab__row">
        <Btn ghost={!salt} onClick={() => setSalt((s) => !s)}>
          {salt ? t('Clean the wire') : t('Add a speck of salt')}
        </Btn>
        <Btn ghost={!glass} onClick={() => setGlass((g) => !g)}>
          {glass ? t('Take the glass away') : t('Look through cobalt glass')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Metal'), value: names[metal] },
          { label: t('Strongest light'), value: main ? `${main[0]} nm` : own.bands.length ? t('bands') : t('none of its own'), tone: 'accent' },
        ]}
      />
    </div>
  );
}
