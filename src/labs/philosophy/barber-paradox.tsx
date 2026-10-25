import { useState } from 'react';
import { Btn, C, Choice, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/**
 * The barber's rule: he shaves exactly those who don't shave themselves. Does the rule hold if he does (or
 * doesn't) shave himself? Neither: so no such barber can exist. Russell's set R, of all sets not members of
 * themselves, fails the same way.
 */
export const ruleHolds = (shavesHimself: boolean) => {
  const shavedByBarber = shavesHimself; // if he shaves himself, the barber shaves him
  return shavedByBarber === !shavesHimself; // the rule: shaved by the barber exactly when he doesn't shave himself
};

export default function Barber({ onDone }: LabProps) {
  const [version, setVersion] = useState<'barber' | 'set'>('barber');
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tried, setTried] = useState(new Set<string>());
  useGoal(tried.has(`${version}-true`) && tried.has(`${version}-false`), onDone);
  const place = (v: boolean) => {
    setChoice(v);
    setTried((s) => new Set(s).add(`${version}-${v}`));
  };

  const barber = version === 'barber';
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // two groups: on the left those who look after themselves, on the right those the barber shaves
    const bw = w / 2 - 14, top = 26, bh = h - top - 34;
    const titles = barber ? [t('Shave themselves'), t('Shaved by the barber')] : [t('Sets that contain themselves'), t('Sets that don’t')];
    const members = barber ? [['🧔', '👨', '🧑'], ['👴', '👦', '🧓', '👱']] : [[t('all non-squares')], [t('all squares'), t('all cats')]];
    [0, 1].forEach((g) => {
      const x = 8 + g * (bw + 12);
      ctx.strokeStyle = choice !== null && (choice ? 0 : 1) === g ? C.accent : C.line;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, top, bw, bh);
      label(ctx, titles[g], x + bw / 2, top - 11, { size: 11, color: C.ink });
      members[g].forEach((m, i) => label(ctx, m, x + bw / 2, top + 18 + i * 20, { size: barber ? 16 : 10.5, color: C.soft }));
    });
    if (choice !== null) {
      const x = 8 + (choice ? 0 : 1) * (bw + 12) + bw / 2;
      label(ctx, barber ? '💈' : 'R', x, top + bh - 22, { size: 20, color: C.accent });
      const why = barber
        ? choice
          ? t('He shaves himself, so he’s one of those the barber must not shave.')
          : t('He doesn’t shave himself, so the barber must shave him.')
        : choice
          ? t('If R contains itself, it breaks its own rule and mustn’t.')
          : t('If R doesn’t contain itself, it qualifies and must.');
      label(ctx, `✗ ${why}`, w / 2, h - 12, { size: 10.5, color: C.bad });
    }
  };

  return (
    <div className="lab">
      <Choice
        label={t('Version')}
        value={version}
        onChange={(v) => (setVersion(v), setChoice(null))}
        options={[
          { value: 'barber', label: t('The barber') },
          { value: 'set', label: t('Russell’s set') },
        ]}
      />
      <Stage draw={draw} label={barber ? t('Villagers who shave themselves and those the barber shaves') : t('Sets that contain themselves and sets that don’t')} />
      <p className="lab__note">{barber ? t('Rule: the barber shaves all those, and only those, who don’t shave themselves. Where does he go?') : t('R is the set of all sets that don’t contain themselves. Where does R go?')}</p>
      <div className="lab__row">
        <Btn onClick={() => place(true)}>{barber ? t('He shaves himself') : t('R contains itself')}</Btn>
        <Btn onClick={() => place(false)}>{barber ? t('He doesn’t') : t('R doesn’t')}</Btn>
      </div>
    </div>
  );
}
