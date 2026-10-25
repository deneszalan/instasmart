import { useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export const PLANKS = 38;

type View = 'form' | 'matter' | 'both' | 'neither';

export default function Theseus({ onDone }: LabProps) {
  const [fresh, setFresh] = useState<boolean[]>(Array(PLANKS).fill(false));
  const [rebuilt, setRebuilt] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const replaced = fresh.filter(Boolean).length;
  useGoal(rebuilt && view !== null, onDone);
  const swap = (n: number) =>
    setFresh((f) => {
      const next = [...f];
      for (let k = 0, done = 0; k < PLANKS && done < n; k++) if (!next[k]) (next[k] = true), done++;
      return next;
    });

  const hull = (ctx: CanvasRenderingContext2D, x0: number, y0: number, wd: number, ht: number, colour: (k: number) => string) => {
    // 38 planks in two rows along a galley's hull
    const per = PLANKS / 2, pw = wd / per;
    for (let k = 0; k < PLANKS; k++) {
      const row = k < per ? 0 : 1, i = k % per, x = x0 + i * pw, curve = Math.sin((i / (per - 1)) * Math.PI) * ht * 0.25;
      ctx.fillStyle = colour(k);
      ctx.fillRect(x + 0.5, y0 + row * (ht / 2) + (ht * 0.25 - curve) * (row ? 0.4 : 1), pw - 1, ht / 2 - 2);
    }
  };
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const sea = h * (rebuilt ? 0.46 : 0.62);
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, sea, w, h - sea);
    const wd = w * 0.8, ht = Math.min(40, h * 0.22), x0 = (w - wd) / 2;
    hull(ctx, x0, sea - ht * 0.7, wd, ht, (k) => (fresh[k] ? '#e9c46a' : '#6b4f2a'));
    label(ctx, rebuilt ? t('the repaired ship: new planks, same form') : t('the ship in the harbour'), w / 2, sea - ht - 12, { size: 10.5, color: C.ink });
    if (rebuilt) {
      hull(ctx, x0, h - ht - 26, wd, ht, () => '#6b4f2a');
      label(ctx, t('rebuilt from the old planks: same matter'), w / 2, h - 10, { size: 10.5, color: C.ink });
    } else if (replaced) {
      // the old planks piling up on the quay
      for (let k = 0; k < replaced; k++) {
        ctx.fillStyle = '#6b4f2a';
        ctx.fillRect(10 + (k % 8) * 12, h - 10 - Math.floor(k / 8) * 6, 10, 4);
      }
      label(ctx, t('old planks'), 10, h - 46, { size: 10, align: 'left' });
    }
  };

  const notes: Record<View, string> = {
    form: t('Continuity of form: it was repaired bit by bit and never stopped being a ship in use.'),
    matter: t('Sameness of matter: Hobbes’s twist puts all the original planks back together.'),
    both: t('David Lewis’s answer: two ships that shared their early stages, like two roads sharing a stretch.'),
    neither: t('Maybe “the same ship” has no single answer once repair and rebuilding pull it apart.'),
  };
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A galley with {n} of its {total} planks replaced', { n: replaced, total: PLANKS })} />
      {!rebuilt ? (
        <div className="lab__row">
          <Btn onClick={() => swap(1)} disabled={replaced === PLANKS}>
            {t('Replace a plank')}
          </Btn>
          <Btn ghost onClick={() => swap(10)} disabled={replaced === PLANKS}>
            {t('Replace 10')}
          </Btn>
          <Btn onClick={() => setRebuilt(true)} disabled={replaced < PLANKS}>
            {t('Rebuild from the old planks')}
          </Btn>
        </div>
      ) : (
        <div className="lab__row">
          <span className="lab__note">{t('Which is the ship of Theseus?')}</span>
          {(['form', 'matter', 'both', 'neither'] as View[]).map((v) => (
            <Btn key={v} ghost={view !== v} onClick={() => setView(v)}>
              {v === 'form' ? t('The repaired one') : v === 'matter' ? t('The rebuilt one') : v === 'both' ? t('Both') : t('Neither')}
            </Btn>
          ))}
        </div>
      )}
      {view ? <p className="lab__note">{notes[view]}</p> : <Readouts items={[{ label: t('Planks replaced'), value: `${replaced} / ${PLANKS}`, tone: 'accent' }]} />}
    </div>
  );
}
