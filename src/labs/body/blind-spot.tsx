import { useState } from 'react';
import { Btn, Choice, dot, label, line, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

type Eye = 'right' | 'left';
type Target = 'dot' | 'line' | 'grid';

export default function BlindSpot({ onDone }: LabProps) {
  const [eye, setEye] = useState<Eye>('right');
  const [target, setTarget] = useState<Target>('dot');
  const [found, setFound] = useState(false);
  useGoal(found, onDone);

  // Each eye's blind spot lies to its outer side: for the right eye, to the right of where it looks.
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    ctx.fillStyle = '#f5f1e8';
    ctx.fillRect(0, 0, w, h);
    const cy = h * 0.5, crossX = eye === 'right' ? w * 0.14 : w * 0.86, spotX = eye === 'right' ? w * 0.84 : w * 0.16, spotY = cy + 6;
    if (target === 'grid') {
      ctx.strokeStyle = '#c7bfae';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 14) line(ctx, gx, 0, gx, h, '#cfc7b6', 1);
      for (let gy = 0; gy < h; gy += 14) line(ctx, 0, gy, w, gy, '#cfc7b6', 1);
    }
    if (target === 'line') {
      // A thick line with a gap exactly where the dot would be: when the gap falls on the blind spot, the line looks whole.
      const gap = 16;
      line(ctx, Math.min(crossX, spotX) + 26, spotY, spotX - gap, spotY, '#1f2937', 6);
      line(ctx, spotX + gap, spotY, eye === 'right' ? w : 0, spotY, '#1f2937', 6);
    } else {
      dot(ctx, spotX, spotY, 9, '#dc2626');
    }
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(crossX - 9, cy);
    ctx.lineTo(crossX + 9, cy);
    ctx.moveTo(crossX, cy - 9);
    ctx.lineTo(crossX, cy + 9);
    ctx.stroke();
    label(ctx, eye === 'right' ? t('Close your left eye') : t('Close your right eye'), w / 2, 18, { size: 12, color: '#374151' });
    label(ctx, t('Stare at the cross, then move the phone slowly closer'), w / 2, h - 30, { size: 11.5, color: '#374151' });
    label(ctx, t('Start about 30 cm away; it usually vanishes at 15–25 cm'), w / 2, h - 14, { size: 11, weight: 600, color: '#6b7280' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A cross and a red dot for a blind spot test')} />
      <div className="lab__row">
        <Choice
          label={t('Which eye')}
          value={eye}
          onChange={setEye}
          options={[
            { value: 'right', label: t('Right eye') },
            { value: 'left', label: t('Left eye') },
          ]}
        />
        <Choice
          label={t('What to look at')}
          value={target}
          onChange={setTarget}
          options={[
            { value: 'dot', label: t('Dot') },
            { value: 'line', label: t('Broken line') },
            { value: 'grid', label: t('Dot on a grid') },
          ]}
        />
      </div>
      <div className="lab__row">
        <Btn onClick={() => setFound(true)}>{target === 'line' ? t('The line looks whole') : t('The dot vanished')}</Btn>
        {found && <span className="lab__note">{target === 'dot' ? t('Now try the broken line or the grid: what fills the hole?') : t('Your brain filled the gap with what surrounds it.')}</span>}
      </div>
    </div>
  );
}
