import { useMemo, useState } from 'react';
import { Btn, label, Range, Readouts, Stage, useFrame, useGoal, rng, type LabProps } from '../kit';
import { t } from '../../i18n';

const DROPS = 9; // specks of grease on the plate
export const PER_DROP = 10; // soap molecules it takes to coat one speck
export const SCUM = 30; // molecules that hard water's calcium and magnesium turn into scum first

/** How many specks a rinse can carry away with `soap` molecules in the water: each needs a full coat. */
export const coated = (soap: number, left: number, hard: boolean) => Math.min(left, Math.floor(Math.max(0, soap - (hard ? SCUM : 0)) / PER_DROP));

// where the specks sit on the plate, as offsets from the middle of the blob
const SPOTS: [number, number][] = [[0, 0], [-1.9, 0.1], [1.9, 0.05], [-0.95, -1.5], [0.95, -1.55], [-3.6, 0.15], [3.6, 0.1], [-2.8, -1.4], [2.8, -1.45]];

export default function Soap({ onDone, active }: LabProps) {
  const [soap, setSoap] = useState(0);
  const [hard, setHard] = useState(false);
  const [gone, setGone] = useState(0);
  const [rinse, setRinse] = useState<number | null>(null); // seconds into a rinse
  const [time, setTime] = useState(0);
  const left = DROPS - gone, coat = coated(soap, left, hard);
  useGoal(gone === DROPS, onDone);
  useFrame((dt) => {
    setTime((s) => s + dt);
    if (rinse !== null) {
      if (rinse + dt > 2.2) {
        setGone((g) => g + coat);
        setSoap(0);
        setRinse(null);
      } else setRinse(rinse + dt);
    }
  }, active);

  const free = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 100 }, () => [r(), r(), r() * Math.PI * 2]);
  }, []);

  const molecule = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, len: number) => {
    // the oil-loving tail, then the water-loving head
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const d = (k / 6) * len, zig = k % 2 ? 1.6 : -1.6;
      ctx.lineTo(x + Math.cos(a) * d - Math.sin(a) * zig, y + Math.sin(a) * d + Math.cos(a) * zig);
    }
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const plate = h - 16, r = Math.min(11, w / 34), cx = w * 0.5;
    ctx.fillStyle = 'rgba(147,197,253,0.16)';
    ctx.fillRect(0, 0, w, plate);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, plate, w, h - plate);
    const flow = rinse ?? 0;
    // flowing water while rinsing
    if (rinse !== null)
      for (let k = 0; k < 7; k++) {
        const x = ((k / 7) * w + flow * 220) % w, y = 20 + (k % 3) * (plate / 3.4);
        label(ctx, '→', x, y, { size: 14, color: 'rgba(255,255,255,0.5)' });
      }
    // scum: soap spoilt by hard water
    if (hard && soap > 0)
      for (let k = 0; k < Math.min(soap, SCUM) / 3; k++) {
        const [fx, fy] = free[k];
        ctx.fillStyle = 'rgba(241,245,249,0.85)';
        ctx.fillRect(8 + fx * (w - 16), 6 + fy * plate * 0.35, 6, 3);
      }
    // the grease specks still on the plate, the coated ones carried away while rinsing
    let n = 0;
    for (let i = 0; i < DROPS; i++) {
      if (i < gone) continue;
      const covered = n++ < coat;
      const [ox, oy] = SPOTS[i];
      let x = cx + ox * r, y = plate - r + oy * r;
      if (covered && rinse !== null) {
        x += flow * flow * w * 0.3;
        y -= flow * plate * 0.3;
      } else if (rinse !== null) x += Math.sin(time * 20 + i) * 1.2;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (covered)
        for (let k = 0; k < PER_DROP; k++) {
          const a = (k / PER_DROP) * Math.PI * 2;
          molecule(ctx, x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), a + Math.PI, 9);
        }
    }
    // soap molecules still free in the water
    const spare = Math.max(0, soap - (hard ? SCUM : 0) - coat * PER_DROP);
    for (let k = 0; k < spare; k++) {
      const [fx, fy, a] = free[k];
      molecule(ctx, 10 + fx * (w - 20), 12 + fy * (plate * 0.55), a + time * 0.3, 9);
    }
    label(ctx, left ? t('grease: {n} specks', { n: left }) : t('clean!'), 8, plate + 9, { size: 10, align: 'left', color: '#0f172a' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Grease on a plate under water, with {n} soap molecules', { n: soap })} />
      <Range label={t('Soap')} value={soap} min={0} max={100} onChange={setSoap} format={(v) => t('{n} molecules', { n: v })} />
      <div className="lab__row">
        <Btn onClick={() => setRinse(0)} disabled={rinse !== null || !left}>
          {t('Rinse')}
        </Btn>
        <Btn ghost={!hard} onClick={() => setHard((x) => !x)}>
          {hard ? t('Hard water') : t('Soft water')}
        </Btn>
        <Btn
          ghost
          onClick={() => {
            setGone(0);
            setSoap(0);
          }}
        >
          {t('Fresh grease')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Specks coated'), value: `${coat} / ${left}`, tone: coat === left && left ? 'good' : 'accent' },
          { label: t('Lost to scum'), value: hard ? String(Math.min(soap, SCUM)) : '0', tone: hard ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{t('Blue heads love water; orange tails love oil. It takes {n} to coat a speck.', { n: PER_DROP })}</p>
    </div>
  );
}
