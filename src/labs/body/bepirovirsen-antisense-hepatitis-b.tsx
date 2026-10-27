import { useState } from 'react';
import { C, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Bepirovirsen, 5'→3', from its US label. */
export const DRUG = 'GCAGAGGTGAAGCGAAGTGC';
/**
 * 70 letters of hepatitis B virus RNA: the drug's 20-letter target (from the label) with 25 letters either side,
 * from the reference genome NC_003977.2 (strain ayw), written as RNA (U for T).
 */
const LEFT = 'GTCTGTGCCTTCTCATCTGCCGGACCGTGT'.slice(-25), TARGET = 'GCACTTCGCTTCACCTCTGC', RIGHT = 'ACGTCGCATGGAGACCACCGTGAACGCCCA'.slice(0, 25);
export const RNA = (LEFT + TARGET + RIGHT).replace(/T/g, 'U');
/** Where the target starts in RNA. */
export const TARGET_AT = LEFT.length;
/** The drug read 3'→5', so that each letter sits under the RNA letter it should pair with. */
export const UNDER = [...DRUG].reverse().join('');

/** Whether an RNA letter pairs with a DNA letter of the drug: A–T, U–A, G–C, C–G. */
export const pairs = (rna: string, dna: string) =>
  (rna === 'A' && dna === 'T') || (rna === 'U' && dna === 'A') || (rna === 'G' && dna === 'C') || (rna === 'C' && dna === 'G');

/** How many of the drug's 20 letters pair when it sits under RNA letters at..at+19. */
export const paired = (at: number) => [...UNDER].filter((d, i) => pairs(RNA[at + i], d)).length;

const RNA_C = '#ff8fa3', DRUG_C = '#7ee0c3', BAD = 'rgba(255,255,255,0.22)';

export default function AntisensePairing({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const n = paired(at);
  useGoal(n === DRUG.length, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the drug's 20 letters in two rows of 10, each under its stretch of RNA (with one more RNA letter either side)
    const cols = 12, cell = (w - 16) / cols, x0 = 8 + cell / 2, size = Math.max(10, Math.min(cell * 0.84, 30, (h - 104) / 4));
    const box = (ch: string, x: number, y: number, color: string, strong: boolean) => {
      ctx.fillStyle = strong ? color : 'rgba(255,255,255,0.06)';
      ctx.globalAlpha = strong ? 0.22 : 1;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      label(ctx, ch, x, y + 0.5, { size: size * 0.55, color: C.ink });
    };
    for (let r = 0; r < 2; r++) {
      const yR = 26 + r * (2 * size + 36) + size / 2, yD = yR + size + 12;
      for (let c = 0; c < cols; c++) {
        const i = at + r * 10 - 1 + c;
        if (i < 0 || i >= RNA.length) continue;
        box(RNA[i], x0 + c * cell, yR, RNA_C, i >= TARGET_AT && i < TARGET_AT + 20 && n === 20);
      }
      for (let c = 1; c <= 10; c++) {
        const j = r * 10 + c - 1, x = x0 + c * cell, ok = pairs(RNA[at + j], UNDER[j]);
        ctx.strokeStyle = ok ? DRUG_C : BAD;
        ctx.lineWidth = ok ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, yR + size / 2 + 2);
        ctx.lineTo(x, yD - size / 2 - 2);
        ctx.stroke();
        box(UNDER[j], x, yD, DRUG_C, ok);
      }
    }
    label(ctx, t('viral RNA'), 8, 12, { size: 10.5, color: RNA_C, align: 'left' });
    label(ctx, t('bepirovirsen'), w - 8, 12, { size: 10.5, color: DRUG_C, align: 'right' });
    // where the drug sits along the whole stretch
    const y = h - 12, L = 14, R = w - 14, X = (i: number) => lerp(L, R, i / RNA.length);
    ctx.strokeStyle = RNA_C;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(L, y);
    ctx.lineTo(R, y);
    ctx.stroke();
    ctx.fillStyle = DRUG_C;
    ctx.fillRect(X(at), y - 5, X(at + 20) - X(at), 10);
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The drug’s 20 letters under viral RNA letters {a} to {b}: {n} of 20 pair', { a: at + 1, b: at + 20, n })} />
      <Range label={t('Slide along the RNA')} value={at} min={0} max={RNA.length - 20} step={1} onChange={setAt} format={(v) => t('letter {n}', { n: v + 1 })} />
      <Readouts
        items={[
          { label: t('Letters paired'), value: `${n} / 20`, tone: n === 20 ? 'good' : undefined },
          { label: t('Full match'), value: n === 20 ? t('yes: the target') : t('not here'), tone: n === 20 ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('70 letters of hepatitis B virus RNA from a reference genome. Pairs: A with T, U with A, G with C.')}</p>
    </div>
  );
}
