import { useState } from 'react';
import { Btn, C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Australia, October 2026: up to 9 in 10 people labelled allergic to penicillin are not. Here 1 patient in 10 is. */
export const ALLERGIC_EVERY = 10;
/** Is patient number `n` (from 0) truly allergic? In this lab, the fourth of every ten. */
export const trulyAllergic = (n: number) => n % ALLERGIC_EVERY === 3;

/** A toy body: bacteria behind an infection, helpful gut bacteria, and a few that resist many drugs. */
export const START = { infection: 10, gut: 60, resistant: 3 };
export type Drug = 'penicillin' | 'broad';
/** Made-up shares of helpful gut bacteria each drug kills: penicillin is narrow, the other broad. */
export const GUT_KILLED: Record<Drug, number> = { penicillin: 0.1, broad: 0.7 };
/** Resistant bacteria take over half of the room the killed gut bacteria leave. */
export const REFILL = 0.5;

/** A week's treatment: both drugs clear this infection; they differ in what else they kill. */
export function treat(drug: Drug) {
  const killed = Math.round(START.gut * GUT_KILLED[drug]);
  return { infection: 0, gut: START.gut - killed, resistant: START.resistant + Math.round(killed * REFILL) };
}

/** The goal: the infection cleared with at least 80% of the helpful gut bacteria left. */
export const goodOutcome = (r: ReturnType<typeof treat>) => r.infection === 0 && r.gut / START.gut >= 0.8;

const CORAL = '#ff8a5c', MINT = '#6fdc9a', VIOLET = '#9b6bff', RED = '#e5484d';

export default function PenicillinLabel({ onDone }: LabProps) {
  const [patient, setPatient] = useState(0);
  const [checked, setChecked] = useState(false);
  const [drug, setDrug] = useState<Drug | ''>('');
  const [blocked, setBlocked] = useState(false);
  const [won, setWon] = useState(false);
  useGoal(won, onDone);

  const allergic = trulyAllergic(patient), labelStands = !checked || allergic;
  const result = drug ? treat(drug) : null;

  // choosing a drug treats the patient for a week; penicillin is refused while the label stands
  const choose = (d: Drug | '') => {
    if (!d) return;
    if (d === 'penicillin' && labelStands) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setDrug(d);
    if (goodOutcome(treat(d))) setWon(true);
  };
  const next = () => {
    setPatient((p) => p + 1);
    setChecked(false);
    setDrug('');
    setBlocked(false);
  };

  const counts = result ?? START;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the record's label
    const tagText = blocked ? t('Penicillin blocked by the label') : !checked ? t('Allergy label: penicillin') : allergic ? t('Checked: truly allergic') : t('Checked: not allergic, label removed');
    label(ctx, t('Labelled patient {n}', { n: formatNumber(patient + 1) }), 10, 14, { size: 11, color: C.soft, align: 'left' });
    label(ctx, tagText, w - 10, 14, { size: 11, color: blocked || !checked || allergic ? RED : C.good, align: 'right' });
    // the bacteria, in a grid
    const all = [...Array(counts.infection).fill(CORAL), ...Array(counts.gut).fill(MINT), ...Array(counts.resistant).fill(VIOLET)];
    const cols = 16, rows = Math.ceil((START.infection + START.gut + START.resistant + 30) / cols), cw = (w - 20) / cols, ch = (h - 54) / rows;
    all.forEach((col, i) => {
      const x = 10 + (i % cols) * cw + cw / 2, y = 34 + Math.floor(i / cols) * ch + ch / 2;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(x - cw * 0.32, y - ch * 0.16, cw * 0.64, ch * 0.32, ch * 0.16);
      ctx.fill();
    });
    const key: [string, string][] = [[CORAL, t('infection bacteria')], [MINT, t('helpful gut bacteria')], [VIOLET, t('drug-resistant')]];
    key.forEach(([col, s], i) => {
      const x = 10 + [0, 0.32, 0.7][i] * (w - 20);
      ctx.fillStyle = col;
      ctx.fillRect(x, h - 14, 10, 5);
      label(ctx, s, x + 14, h - 11, { size: 9.5, color: C.soft, align: 'left' });
    });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Patient {n}: {i} infection, {g} helpful gut and {r} drug-resistant bacteria', {
          n: formatNumber(patient + 1),
          i: formatNumber(counts.infection),
          g: formatNumber(counts.gut),
          r: formatNumber(counts.resistant),
        })}
      />
      <Choice
        label={t('Treat for a week with')}
        value={drug}
        onChange={choose}
        options={[
          { value: 'penicillin', label: t('Penicillin (narrow)') },
          { value: 'broad', label: t('A broader antibiotic') },
        ]}
      />
      <div className="lab__row">
        <Btn onClick={() => setChecked(true)} disabled={checked} ghost>
          {t('Check label')}
        </Btn>
        <Btn onClick={next} ghost>
          {t('Next patient →')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Helpful gut bacteria left'), value: `${formatNumber(Math.round((counts.gut / START.gut) * 100))}%`, tone: result ? (goodOutcome(result) ? 'good' : 'bad') : undefined },
          { label: t('Drug-resistant bacteria'), value: formatNumber(counts.resistant) },
        ]}
      />
      <p className="lab__note">{t('A toy model with made-up numbers; 1 labelled patient in 10 is truly allergic.')}</p>
    </div>
  );
}
