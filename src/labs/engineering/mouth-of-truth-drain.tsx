import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Heights above sea level after Hopkins (2007): the Forum valley's floor was just under 6 m; the Tiber flooded yearly to almost 9 m. */
export const FLOOR = 6;
export const YEARLY_FLOOD = 9;

export type Forum = 'flooded' | 'marsh' | 'dry';

/**
 * The state of the Forum valley in the model: the Tiber floods it if the river stands above the floor; otherwise,
 * without a canal, the streams from the hills pool on the low floor as a marsh; with a canal they run off to the river.
 */
export function forum(fill: number, river: number, canal: boolean): Forum {
  if (river > FLOOR + fill) return 'flooded';
  return canal ? 'dry' : 'marsh';
}

export default function MouthDrain({ onDone }: LabProps) {
  const [fill, setFill] = useState(0);
  const [river, setRiver] = useState(YEARLY_FLOOD);
  const [canal, setCanal] = useState<'none' | 'canal'>('none');
  const state = forum(fill, river, canal === 'canal');
  useGoal(state === 'dry' && river >= YEARLY_FLOOD, onDone);
  const floor = FLOOR + fill;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const T = 8, B = h - 8, lo = 3, hi = 12, Y = (m: number) => B - ((m - lo) / (hi - lo)) * (B - T);
    const hillX = w * 0.14, riverX = w * 0.78;
    // hills, the valley floor with its fill, the river
    ctx.fillStyle = 'rgba(134,170,120,0.35)';
    ctx.beginPath(); ctx.moveTo(0, B); ctx.lineTo(0, Y(11.5)); ctx.quadraticCurveTo(hillX * 0.7, Y(11.5), hillX, Y(floor)); ctx.lineTo(hillX, B); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(150,120,90,0.55)'; ctx.fillRect(hillX, Y(FLOOR), riverX - hillX, B - Y(FLOOR));
    if (fill > 0) { ctx.fillStyle = 'rgba(200,160,110,0.6)'; ctx.fillRect(hillX, Y(floor), riverX - hillX, Y(FLOOR) - Y(floor)); }
    ctx.fillStyle = 'rgba(150,120,90,0.55)'; ctx.fillRect(riverX, Y(4), w - riverX, B - Y(4));
    ctx.fillStyle = 'rgba(125,211,252,0.55)'; ctx.fillRect(riverX, Y(river), w - riverX, Y(4) - Y(river));
    // water in the valley
    if (state === 'flooded') { ctx.fillStyle = 'rgba(125,211,252,0.45)'; ctx.fillRect(hillX, Y(river), riverX - hillX, Y(floor) - Y(river)); }
    if (state === 'marsh') { ctx.fillStyle = 'rgba(125,211,252,0.4)'; ctx.fillRect(hillX, Y(floor + 0.35), riverX - hillX, Y(floor) - Y(floor + 0.35)); }
    if (canal === 'canal') line(ctx, hillX, Y(floor) + 2, riverX, Y(Math.max(river, 4) + 0.2), state === 'dry' ? C.cool : C.faint, 3);
    // the yearly flood mark
    line(ctx, 0, Y(YEARLY_FLOOD), w, Y(YEARLY_FLOOD), C.soft, 1, [4, 4]);
    label(ctx, t('yearly flood ≈ {n} m', { n: YEARLY_FLOOD }), hillX + 6, Y(YEARLY_FLOOD) - 7, { size: 9, align: 'left', color: C.soft });
    label(ctx, t('Forum valley floor'), (hillX + riverX) / 2, Y(floor) + 12, { size: 10, color: C.ink });
    label(ctx, t('river Tiber'), (riverX + w) / 2, Math.min(B - 8, Y(river) + 12), { size: 10, color: C.ink });
  };

  const said = state === 'flooded' ? t('flooded by the Tiber') : state === 'marsh' ? t('a marsh of hill streams') : t('dry: the canal drains it');
  return (
    <div className="lab">
      <Choice
        label={t('Drain for the valley')}
        value={canal}
        onChange={setCanal}
        options={[
          { value: 'none', label: t('No canal') },
          { value: 'canal', label: t('Open canal to the Tiber') },
        ]}
      />
      <Stage draw={draw} label={t('The Forum valley in section: floor at {f} m, Tiber at {r} m', { f: formatNumber(floor), r: formatNumber(river) })} />
      <Range label={t('Earth fill on the floor')} value={fill} min={0} max={5} step={0.5} onChange={setFill} format={(v) => `${formatNumber(v)} m`} />
      <Range label={t('Height of the Tiber')} value={river} min={4} max={10} step={0.5} onChange={setRiver} format={(v) => `${formatNumber(v)} m`} />
      <Readouts
        items={[
          { label: t('Forum floor'), value: `${formatNumber(floor)} m` },
          { label: t('The Forum is'), value: said, tone: state === 'dry' ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Model: heights above sea level after Hopkins (2007); the streams and the river are simplified.')}</p>
    </div>
  );
}
