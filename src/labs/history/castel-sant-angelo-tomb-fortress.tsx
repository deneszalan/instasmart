import { useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type LayerId = 'tomb' | 'walls' | 'chapel' | 'door' | 'towers' | 'bastions';

/** The layers of Castel Sant'Angelo, with the year each was begun (Direzione Musei statali di Roma; Turismo Roma). */
export const LAYERS: { id: LayerId; year: number }[] = [
  { id: 'tomb', year: 135 }, // Hadrian's mausoleum, finished 139
  { id: 'walls', year: 401 }, // built into the city walls in the early 400s, under Honorius
  { id: 'chapel', year: 608 }, // the chapel of St Michael on top, probably under Boniface IV (608–615)
  { id: 'door', year: 1395 }, // the Roman entrance sealed; a raised door with a drawbridge
  { id: 'towers', year: 1447 }, // Nicholas V's corner towers (1447–1455)
  { id: 'bastions', year: 1494 }, // Alexander VI's four bastions and moat (1494–1495)
];

/** The layer added last among those still standing: the one to peel off next. */
export const newest = (standing: LayerId[]) => LAYERS.filter((l) => standing.includes(l.id)).sort((a, b) => b.year - a.year)[0]?.id;

const ORDER: LayerId[] = ['door', 'tomb', 'bastions', 'chapel', 'walls', 'towers']; // the buttons, in a fixed mixed order

export default function CastelLayers({ onDone }: LabProps) {
  const [standing, setStanding] = useState<LayerId[]>(LAYERS.map((l) => l.id));
  const [wrong, setWrong] = useState(0);
  const [miss, setMiss] = useState<LayerId | null>(null);
  const done = standing.length === 1 && standing[0] === 'tomb';
  useGoal(done, onDone);

  const name = (id: LayerId) =>
    ({
      tomb: t('Hadrian’s tomb, the core'),
      walls: t('City-wall fortress'),
      chapel: t('Chapel of St Michael'),
      door: t('Raised door and drawbridge'),
      towers: t('Corner towers'),
      bastions: t('Bastions and moat'),
    })[id];

  const peel = (id: LayerId) => {
    if (id === 'tomb' || !standing.includes(id)) return;
    if (newest(standing) === id) {
      setStanding(standing.filter((s) => s !== id));
      setMiss(null);
    } else {
      setWrong((n) => n + 1);
      setMiss(id);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min((w - 20) / 112, (h - 30) / 52), g = h - 14, cx = w / 2;
    const X = (m: number) => cx + m * s, Y = (m: number) => g - m * s;
    const has = (id: LayerId) => standing.includes(id);
    const box = (x0: number, y0: number, x1: number, y1: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s);
    };
    if (has('walls')) {
      for (const sd of [-1, 1]) box(sd < 0 ? -60 : 42.5, 0, sd < 0 ? -42.5 : 60, 10, '#9a9a92');
    }
    if (has('bastions')) {
      ctx.fillStyle = '#d6a14a';
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(X(sd * 47), Y(17));
        ctx.lineTo(X(sd * 58), Y(0));
        ctx.lineTo(X(sd * 36), Y(0));
        ctx.lineTo(X(sd * 36), Y(17));
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(79,138,140,0.9)';
      ctx.fillRect(X(-55), Y(0), 110 * s, 4);
    }
    // Hadrian's tomb: square base, two tiers of the drum
    box(-42.5, 0, 42.5, 12, '#d9cbb0');
    box(-32, 12, 32, 30, '#e3d7bf');
    box(-21, 30, 21, 41, '#d9cbb0');
    if (has('towers')) for (const sd of [-1, 1]) box(sd * 42.5 - 4, 0, sd * 42.5 + 4, 18, '#b9a07a');
    if (has('door')) {
      box(-2.2, 0.2, 2.2, 4.6, '#b2593c');
      box(-2.2, 15, 2.2, 19.5, '#13292a');
      ctx.strokeStyle = '#6b4a2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(X(-2.2), Y(15));
      ctx.lineTo(X(-9), Y(15));
      ctx.stroke();
    } else {
      box(-2, 0, 2, 4.5, '#13292a');
    }
    if (has('chapel')) {
      box(-6, 41, 6, 47, '#b2593c');
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.arc(X(0), Y(50), 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!done) label(ctx, t('Standing: {n} layers', { n: formatNumber(standing.length) }), 8, 10, { size: 10.5, align: 'left', color: C.soft });
    else label(ctx, t('Back to Hadrian’s tomb, AD 135–139'), cx, 10, { size: 11, color: C.good });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A section of Castel Sant’Angelo with {n} layers standing', { n: standing.length })} />
      <div className="lab__choice" role="group" aria-label={t('Layer to peel off')}>
        {ORDER.filter((id) => standing.includes(id) && id !== 'tomb').map((id) => (
          <button key={id} aria-pressed={miss === id} onClick={() => peel(id)}>
            {name(id)}
          </button>
        ))}
      </div>
      <Readouts
        items={[
          { label: t('Layers peeled'), value: `${LAYERS.length - standing.length} / ${LAYERS.length - 1}`, tone: done ? 'good' : 'accent' },
          { label: t('Peeled too early'), value: formatNumber(wrong), tone: wrong ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">
        {miss ? t('Not yet: something newer still stands on or around it.') : t('Tap the layer added last. Simplified section; dates are when each was begun.')}
      </p>
      {standing.length < LAYERS.length && !done && (
        <Btn ghost onClick={() => { setStanding(LAYERS.map((l) => l.id)); setMiss(null); }}>
          {t('Start again')}
        </Btn>
      )}
    </div>
  );
}
