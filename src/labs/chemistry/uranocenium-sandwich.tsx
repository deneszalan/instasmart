import { useState } from 'react';
import { C, Choice, dot, label, line, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export type Remover = 'trityl' | 'ferrocenium' | 'silver';
export type Salt = 'borate' | 'pf6' | 'sbf6';
export type Solvent = 'difluorobenzene' | 'bromobenzene' | 'thf';
export type Outcome = 'stable' | 'rings' | 'fluoride' | 'sbf6' | 'solvent';

/**
 * What happens when uranocene loses an electron, after the experiments of Deakin, Goodwin et al. (Nature
 * Communications, 2026): trityl or ferrocenium borate in difluorobenzene or bromobenzene gave stable
 * uranocenium; a silver oxidant left only free carbon rings; with hexafluorophosphate the cation tore fluoride
 * off the salt and fell apart; with hexafluoroantimonate it fell apart too; in THF it turned the solvent into a
 * polymer and went back to uranocene. The first failure in that order decides mixes the paper didn't try.
 */
export function outcome(remover: Remover, salt: Salt, solvent: Solvent): Outcome {
  if (remover === 'silver') return 'rings';
  if (salt === 'pf6') return 'fluoride';
  if (salt === 'sbf6') return 'sbf6';
  if (solvent === 'thf') return 'solvent';
  return 'stable';
}

const U = '#9be15d', CARBON = '#c9cbd6', F = '#e9f27a', GOLD = '#ffcf5a';

function ring(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.strokeStyle = CARBON;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    dot(ctx, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 3.2, CARBON);
  }
}

export default function Uranocenium({ onDone }: LabProps) {
  const [remover, setRemover] = useState<Remover>('silver');
  const [salt, setSalt] = useState<Salt>('pf6');
  const [solvent, setSolvent] = useState<Solvent>('thf');
  const result = outcome(remover, salt, solvent);
  useGoal(result === 'stable', onDone);

  const message =
    result === 'stable'
      ? t('Uranocenium forms and lasts, even at room temperature.')
      : result === 'rings'
        ? t('Silver pulls the sandwich apart: only free carbon rings are left.')
        : result === 'fluoride'
          ? t('It forms, then tears fluoride off the salt and falls apart.')
          : result === 'sbf6'
            ? t('It forms, then falls apart with this salt too.')
            : t('It forms, then turns the solvent into a polymer and drops back to uranocene.');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2, rx = Math.min(w * 0.16, 52), ry = rx * 0.28, gap = Math.min(h * 0.25, 40);
    if (result === 'stable') {
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, gap * 2.6);
      g.addColorStop(0, 'rgba(155,225,93,0.35)');
      g.addColorStop(1, 'rgba(155,225,93,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ring(ctx, cx, cy - gap, rx, ry);
      dot(ctx, cx, cy, 11, U);
      ring(ctx, cx, cy + gap, rx, ry);
      label(ctx, '+', cx + rx + 18, cy, { size: 22, color: GOLD });
    } else if (result === 'rings') {
      ring(ctx, cx - rx * 1.6, cy - gap * 0.6, rx, ry);
      ring(ctx, cx + rx * 1.6, cy + gap * 0.6, rx, ry);
      dot(ctx, cx, cy + gap * 1.2, 8, C.faint);
    } else if (result === 'solvent') {
      ring(ctx, cx - rx * 0.9, cy - gap, rx, ry);
      dot(ctx, cx - rx * 0.9, cy, 11, U);
      ring(ctx, cx - rx * 0.9, cy + gap, rx, ry);
      // a growing chain of solvent molecules
      ctx.strokeStyle = C.cool;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const x = cx + rx * 0.6 + i * Math.min(10, (w - cx - rx) / 14), y = cy + (i % 2 ? -8 : 8);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else {
      ring(ctx, cx - rx * 0.7, cy - gap * 1.25, rx, ry);
      ring(ctx, cx + rx * 0.6, cy + gap * 1.15, rx, ry);
      dot(ctx, cx, cy, 11, U);
      for (const [dx, dy] of [[-16, -4], [16, 6]]) {
        line(ctx, cx, cy, cx + dx, cy + dy, F, 2);
        dot(ctx, cx + dx, cy + dy, 6, F);
      }
    }
  };
  const tag = { fontSize: 12.5, fontWeight: 750, minWidth: 54 } as const;

  return (
    <div className="lab">
      <Stage draw={draw} label={message} className="lab__stage--short" />
      <div className="lab__row">
        <span style={tag}>{t('Oxidant')}</span>
        <Choice
          label={t('Oxidant')}
          options={[
            { value: 'trityl' as Remover, label: t('Trityl') },
            { value: 'silver' as Remover, label: t('Silver ion') },
          ]}
          value={remover}
          onChange={setRemover}
        />
      </div>
      <div className="lab__row">
        <span style={tag}>{t('Salt')}</span>
        <Choice
          label={t('Salt')}
          options={[
            { value: 'borate' as Salt, label: t('Borate') },
            { value: 'pf6' as Salt, label: 'PF₆' },
          ]}
          value={salt}
          onChange={setSalt}
        />
      </div>
      <div className="lab__row">
        <span style={tag}>{t('Solvent')}</span>
        <Choice
          label={t('Solvent')}
          options={[
            { value: 'difluorobenzene' as Solvent, label: t('Difluorobenzene') },
            { value: 'thf' as Solvent, label: 'THF' },
          ]}
          value={solvent}
          onChange={setSolvent}
        />
      </div>
      <p className="lab__note" style={{ color: result === 'stable' ? C.good : C.bad, fontWeight: 750 }} aria-live="polite">
        {message}
      </p>
      <p className="lab__note">{t('From the 2026 paper; mixes it did not try are inferred.')}</p>
    </div>
  );
}
