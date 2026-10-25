import { useState } from 'react';
import { C, Choice, dot, label, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export type Test = 'dna' | 'divide' | 'lipid' | 'drug';
export const TESTS: Test[] = ['dna', 'divide', 'lipid', 'drug'];

/** Each test's result for a free-living bacterium, a mitochondrion and the cell's own nucleus and ribosomes. */
export const RESULTS: Record<Test, [boolean, boolean, boolean]> = {
  dna: [true, true, false], // a small circular chromosome; the nucleus has long straight ones
  divide: [true, true, false], // splitting in two; the cell itself divides by mitosis
  lipid: [true, true, false], // cardiolipin in the membrane; in a cell's own membranes it is all but absent
  drug: [true, true, false], // chloramphenicol jams their ribosomes, not the cell's own
};

const rad = Math.PI / 180;

export default function Mitochondria({ onDone, active }: LabProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [done, setDone] = useState(new Set<Test>());
  const [since, setSince] = useState(0);
  useGoal(done.size === TESTS.length, onDone);
  useFrame((dt) => setSince((s) => s + dt), active && test !== null);

  const run = (k: Test) => {
    setTest(k);
    setSince(0);
    setDone((d) => new Set(d).add(k));
  };
  const f = Math.min(1, since / 1.6); // how far the current test has gone

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const colW = w / 3, cy = h * 0.48, sz = Math.min(colW * 0.42, h * 0.3);
    const names = [t('Bacterium'), t('Mitochondrion'), t('The cell’s own')];
    const glow = (on: boolean) => (on ? C.accent : 'rgba(255,255,255,0.55)');
    for (let k = 0; k < 3; k++) {
      const cx = colW * (k + 0.5);
      label(ctx, names[k], cx, 10, { size: 11, color: C.ink });
      const hit = test !== null && RESULTS[test][k] && f > 0.2;
      // splitting in two: the bacterium and the mitochondrion pinch apart
      const split = test === 'divide' && k < 2 ? Math.min(1, f * 1.4) : 0;
      for (const side of split ? [-1, 1] : [0]) {
        const ox = side * split * sz * 0.55, s = split ? 0.62 : 1;
        ctx.save();
        ctx.translate(cx + ox, cy);
        ctx.scale(s, s);
        if (k === 0) {
          ctx.fillStyle = '#4d7c0f';
          ctx.strokeStyle = test === 'lipid' && f > 0.2 ? C.accent : '#a3e635';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-sz, -sz * 0.45, sz * 2, sz * 0.9, sz * 0.45);
          ctx.fill();
          ctx.stroke();
        } else if (k === 1) {
          ctx.fillStyle = '#9a3412';
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // the folded inner membrane, where cardiolipin sits
          ctx.strokeStyle = test === 'lipid' && f > 0.2 ? C.accent : '#fdba74';
          ctx.beginPath();
          for (let i = -3; i <= 3; i++) {
            ctx.moveTo(i * sz * 0.24, (i % 2 ? -1 : 1) * sz * 0.4);
            ctx.lineTo(i * sz * 0.24, (i % 2 ? -1 : 1) * sz * 0.05);
          }
          ctx.stroke();
        } else {
          // the nucleus with straight chromosomes, the cell membrane around it
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, sz * 0.95, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#312e81';
          ctx.beginPath();
          ctx.arc(0, 0, sz * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = test === 'dna' && f > 0.2 ? C.cool : '#a5b4fc';
          ctx.lineWidth = 2.5;
          for (const a of [20, 80, 140]) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(a * rad) * sz * 0.35, Math.sin(a * rad) * sz * 0.35);
            ctx.lineTo(-Math.cos(a * rad) * sz * 0.35, -Math.sin(a * rad) * sz * 0.35);
            ctx.stroke();
          }
        }
        // circular DNA in the bacterium and the mitochondrion
        if (k < 2) {
          ctx.strokeStyle = test === 'dna' && f > 0.2 ? C.accent : 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(-sz * 0.35, 0, sz * 0.17, 0, Math.PI * 2);
          ctx.stroke();
        }
        // ribosomes: dark once the antibiotic jams them
        const jammed = test === 'drug' && k < 2 && f > 0.3;
        const spots = k === 2 ? [[1.1, 0.75], [-0.75, 0.62], [0.68, -0.68], [-0.62, -0.72], [0.95, 0.05]] : [[0.3, 0.2], [0.55, -0.15], [0.1, -0.22], [0.72, 0.18]];
        for (const [x, y] of spots) dot(ctx, x * sz * (k === 2 ? 0.75 : 1), y * sz * (k === 2 ? 1.1 : 1), 3, jammed ? '#44403c' : glow(test === 'drug' && k === 2 && f > 0.3));
        ctx.restore();
      }
      if (test) label(ctx, hit ? t('like a bacterium') : test === 'divide' && k === 2 ? t('divides by mitosis') : t('different'), cx, cy + sz * 0.95 + 12, { size: 10.5, color: hit ? C.good : C.soft });
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A bacterium, a mitochondrion and the cell’s own nucleus and ribosomes, under test')} />
      <Choice
        label={t('Run a test')}
        value={test ?? ('' as Test)}
        onChange={run}
        options={[
          { value: 'dna', label: t('DNA') },
          { value: 'divide', label: t('Divide') },
          { value: 'lipid', label: t('Membranes') },
          { value: 'drug', label: t('Antibiotic') },
        ]}
      />
      <p className="lab__note">
        {test === 'dna'
          ? t('Stain the DNA: bacteria and mitochondria keep a small ring; the nucleus holds long straight chromosomes.')
          : test === 'divide'
            ? t('Mitochondria multiply by splitting in two, as bacteria do; they are never built from scratch.')
            : test === 'lipid'
              ? t('Cardiolipin, a fat typical of bacterial membranes, sits in the mitochondrion’s inner membrane.')
              : test === 'drug'
                ? t('Chloramphenicol jams bacterial ribosomes, and the mitochondrion’s too; the cell’s own keep working.')
                : t('Run all four tests on all three.')}
      </p>
      <Readouts
        items={[
          { label: t('Tests run'), value: `${done.size} / ${TESTS.length}` },
          { label: t('Mitochondrion like a bacterium'), value: `${[...done].filter((k) => RESULTS[k][1]).length} / ${done.size}`, tone: 'good' },
          { label: t('Cell like a bacterium'), value: `${[...done].filter((k) => RESULTS[k][2]).length} / ${done.size}`, tone: 'bad' },
        ]}
      />
    </div>
  );
}
