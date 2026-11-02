import { useState } from 'react';
import { C, Choice, label, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/**
 * Yad Vashem's test of risk, as its Commission for the Designation of the Righteous applied it to Khaled Abdul-Wahab
 * (Irena Steinfeldt, "Abdelwahab: the full picture", Yad Vashem blog, 29 December 2011): "he broke no law and the
 * Jews stayed on his farm with the full knowledge of the Germans", so "in the absence of risk, he was not eligible".
 * Simplified here to its two parts: help that broke a law, or help kept hidden from the occupier, would carry risk.
 * The title also needs the three other tests (active help, the motive, testimony), which this lab doesn't weigh.
 */
export function riskFound(illegal: boolean, hidden: boolean): boolean {
  return illegal || hidden;
}

/** What the testimonies Yad Vashem cites say: no law was broken, and the Germans knew. */
export const RECORD = { illegal: false, hidden: false } as const;
export const matchesRecord = (illegal: boolean, hidden: boolean) => illegal === RECORD.illegal && hidden === RECORD.hidden;

type Witness = 'anny' | 'edmee' | 'eva' | 'commission';

function says(w: Witness): string {
  if (w === 'anny') return t('Anny Boukris: the men still did forced labour under German guard.');
  if (w === 'edmee') return t('Edmée Masliah: when Germans came to count them, they put on their yellow badges.');
  if (w === 'eva') return t('Eva Weisel: medicines came from the German medical post across the road.');
  return t('The Commission: no law forbade it, and the Germans knew they were on the farm.');
}

const LAMP = '#f4c56b', ROSE = '#ef9a80', GREY = '#9aa0a6', FAMILY = '#f0b48a';

export default function AbdulWahabRiskTest({ onDone }: LabProps) {
  const [illegal, setIllegal] = useState(true);
  const [hidden, setHidden] = useState(true);
  const [witness, setWitness] = useState<Witness>('anny');
  const [read, setRead] = useState<Set<Witness>>(() => new Set(['anny']));
  const [size, setSize] = useState({ w: 1, h: 1 });
  const risk = riskFound(illegal, hidden);
  useGoal(matchesRecord(illegal, hidden) && read.size >= 2, onDone);

  const pick = (w: Witness) => { setWitness(w); setRead((s) => new Set(s).add(w)); };
  /** The two facts are boxes on the stage: tap the left one for the law, the right one for what the Germans knew. */
  const BOX_TOP = 0.36, BOX_BOTTOM = 0.56;
  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'up' || p.y < size.h * BOX_TOP || p.y > size.h * BOX_BOTTOM) return;
    if (p.x < size.w / 2) setIllegal((v) => !v); else setHidden((v) => !v);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (w !== size.w || h !== size.h) queueMicrotask(() => setSize({ w, h }));
    const fs = Math.max(10, Math.min(13, w / 28));
    // the four tests as small lamps; only risk is weighed here
    const names = [t('Help given'), t('Risk taken'), t('Why: to help'), t('Witnesses')];
    names.forEach((n, i) => {
      const x = w * (0.14 + i * 0.24), y = h * 0.07, r = Math.min(8, h * 0.045);
      const isRisk = i === 1;
      ctx.fillStyle = isRisk ? (risk ? LAMP : 'rgba(239,154,128,0.25)') : 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = isRisk ? (risk ? LAMP : ROSE) : C.faint; ctx.lineWidth = 1.5; ctx.stroke();
      label(ctx, n, x, y + r + fs * 0.7, { size: fs - 1, color: isRisk ? (risk ? LAMP : ROSE) : C.faint });
    });
    label(ctx, risk ? t('Risk found: the other tests decide') : t('No risk found: not eligible'), w / 2, h * 0.28, { size: fs + 1, color: risk ? LAMP : ROSE });
    // the two facts, as boxes to tap
    const box = (x0: number, x1: number, text: string, on: boolean) => {
      ctx.fillStyle = on ? 'rgba(239,154,128,0.22)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = on ? ROSE : C.soft; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x0, h * BOX_TOP, x1 - x0, h * (BOX_BOTTOM - BOX_TOP), 8); ctx.fill(); ctx.stroke();
      label(ctx, text, (x0 + x1) / 2, h * (BOX_TOP + BOX_BOTTOM) / 2, { size: fs, color: C.ink });
    };
    box(w * 0.03, w * 0.48, illegal ? t('Law: forbids it') : t('Law: none against it'), illegal);
    box(w * 0.52, w * 0.97, hidden ? t('Germans: kept unaware') : t('Germans: knew'), hidden);
    // the farm at Tlelsa and the German medical post across the road
    const gy = h * 0.9;
    ctx.fillStyle = 'rgba(125,143,78,0.35)'; ctx.fillRect(0, gy, w, h - gy);
    const hx = w * 0.08, hw = w * 0.36, hh = h * 0.2;
    ctx.fillStyle = '#ece4d4'; ctx.fillRect(hx, gy - hh, hw, hh);
    label(ctx, t('the farm at Tlelsa'), hx + hw / 2, gy - hh - fs * 0.7, { size: fs - 1, color: C.soft });
    for (let i = 0; i < 6; i++) {
      const x = hidden ? hx + hw * (0.15 + i * 0.13) : hx + hw + w * 0.02 + (i % 3) * w * 0.035, y = hidden ? gy - hh * 0.3 : gy - (i < 3 ? 2 : hh * 0.4);
      ctx.fillStyle = hidden ? 'rgba(240,180,138,0.35)' : FAMILY; ctx.beginPath(); ctx.arc(x, y - 9, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 3.5, y - 5, 7, 8);
      if (!hidden) { ctx.fillStyle = LAMP; ctx.fillRect(x - 2, y - 3, 4, 2.5); }
    }
    const px = w * 0.68, pw = w * 0.26, ph = h * 0.14;
    ctx.fillStyle = '#c9c4ba'; ctx.fillRect(px, gy - ph, pw, ph);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(px + pw / 2 - 2, gy - ph * 0.8, 4, ph * 0.5); ctx.fillRect(px + pw / 2 - ph * 0.25, gy - ph * 0.57, ph * 0.5, 4);
    label(ctx, t('German medical post'), px + pw / 2, gy - ph - fs * 0.7, { size: fs - 1, color: C.soft });
    if (!hidden) { ctx.fillStyle = GREY; const x = hx + hw + w * 0.15; ctx.beginPath(); ctx.arc(x, gy - 18, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 4, gy - 14, 8, 14); }
    label(ctx, t('Tap a box to change it. Simplified: only the risk test'), w / 2, h - fs * 0.45, { size: fs - 2, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Yad Vashem’s four tests, with risk weighed, and the farm at Tlelsa')} />
      <Choice label={t('Testimony to read')} value={witness} onChange={pick} options={[{ value: 'anny', label: 'Anny' }, { value: 'edmee', label: 'Edmée' }, { value: 'eva', label: 'Eva' }, { value: 'commission', label: 'Yad Vashem' }]} />
      <p className="lab__note">{says(witness)}</p>
    </div>
  );
}
