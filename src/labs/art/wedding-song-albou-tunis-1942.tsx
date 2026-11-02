import { useState } from 'react';
import { C, Choice, label, line, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Match the scenes of Karin Albou's film Le Chant des mariées (2008) to the history they draw on, or mark them as
 * invented. History: German troops in Tunis from November 1942 (USHMM); on 6 December 1942 a demand for Jewish
 * workers, about 4,000 sent to forced labour; on 22 December a levy of 20 million francs on the Jewish community,
 * said to pay for Allied bombing (FRUS 1943, vol. II, doc. 258); Nazi radio propaganda in Arabic (USHMM). The scenes
 * are described from reviews (The Christian Science Monitor, Hommes & migrations).
 */
export type Echo = 'labour' | 'levy' | 'radio' | 'invented';
const D = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
/** Where each real event sits on the lab's time axis (start, end). */
export const WHEN: Record<Exclude<Echo, 'invented'>, [number, number]> = {
  labour: [D(1942, 12, 6), D(1942, 12, 9)],
  levy: [D(1942, 12, 22), D(1942, 12, 22)],
  radio: [D(1942, 11, 9), D(1943, 5, 10)],
};
export const START = D(1942, 11, 1);
export const END = D(1943, 5, 31);
export type SceneId = 'friends' | 'marriage' | 'raoul' | 'leaflets' | 'khaled';
/** Each scene of the film and the real event it echoes, or 'invented' for the story itself. */
export const SCENES: { id: SceneId; echo: Echo }[] = [
  { id: 'friends', echo: 'invented' },
  { id: 'marriage', echo: 'levy' },
  { id: 'raoul', echo: 'labour' },
  { id: 'leaflets', echo: 'radio' },
  { id: 'khaled', echo: 'invented' },
];
export const isRight = (scene: SceneId, echo: Echo) => SCENES.find((s) => s.id === scene)!.echo === echo;
/** The x position of a date on an axis from x0 to x1. */
export const axisX = (ms: number, x0: number, x1: number) => x0 + ((ms - START) / (END - START)) * (x1 - x0);

const AMBER = '#e7a84a', RED = '#e0705a';

export default function WeddingSong({ onDone }: LabProps) {
  const [done, setDone] = useState<SceneId[]>([]);
  const [wrong, setWrong] = useState(false);
  const current = SCENES.find((s) => !done.includes(s.id));
  const lastId = done.at(-1);
  const last = lastId ? SCENES.find((s) => s.id === lastId)!.echo : null;
  useGoal(done.length === SCENES.length, onDone);

  const scene = (id: SceneId) =>
    id === 'friends'
      ? t('Nour, a Muslim girl, and Myriam, a Jewish girl, are best friends in a Tunis courtyard.')
      : id === 'marriage'
        ? t('Myriam’s mother marries her to a rich doctor, because money is needed to pay a fine on the Jews.')
        : id === 'raoul'
          ? t('Raoul, the doctor, ends up in a forced labour camp.')
          : id === 'leaflets'
            ? t('German leaflets court the Muslims and blame the Jews.')
              : t('Khaled, Nour’s fiancé, works for the Germans and forbids her to see Myriam.');
  const echoName = (e: Echo) =>
    e === 'labour' ? t('forced labour, Dec 1942') : e === 'levy' ? t('a levy, 22 Dec 1942') : e === 'radio' ? t('Nazi propaganda in Arabic') : t('invented for the film');
  const echoShort = (e: Echo) => (e === 'labour' ? t('labour, Dec 1942') : e === 'levy' ? t('the 1942 levy') : e === 'radio' ? t('Nazi radio, Arabic') : t('invented by Albou'));
  const pickEcho = (e: Echo) => {
    if (!current) return;
    if (isRight(current.id, e)) {
      setDone([...done, current.id]);
      setWrong(false);
    } else setWrong(true);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 12, x1 = w - 12, y = h * 0.5;
    // the occupation, November 1942 to May 1943
    ctx.fillStyle = 'rgba(224,112,90,0.16)'; ctx.fillRect(axisX(D(1942, 11, 9), x0, x1), y - 8, axisX(D(1943, 5, 10), x0, x1) - axisX(D(1942, 11, 9), x0, x1), 16);
    line(ctx, x0, y, x1, y, C.soft, 2);
    ['N', 'D', 'J', 'F', 'M', 'A', 'M'].forEach((m, i) => label(ctx, m, axisX(D(1942, 11 + i, 15), x0, x1), y + 15, { size: 10, color: C.faint }));
    label(ctx, t('History, Nov 1942 – May 1943'), x0, h - 8, { size: 10, color: RED, align: 'left' });
    // matched scenes: a mark above the axis at the date of the real event; invented ones on a shelf at the bottom right
    let shelf = 0, lane = 0;
    for (const s of SCENES.filter((sc) => done.includes(sc.id))) {
      if (s.echo === 'invented') {
        ctx.fillStyle = AMBER; ctx.fillRect(x1 - 14 - shelf * 20, h - 15, 14, 12);
        shelf++;
        continue;
      }
      const [a, b] = WHEN[s.echo];
      const xa = axisX(a, x0, x1), xb = axisX(b, x0, x1), mid = (xa + xb) / 2, cy = y - 16 - (lane % 2) * 17;
      ctx.fillStyle = RED; if (xb - xa > 4) ctx.fillRect(xa, y - 3, xb - xa, 6); else { ctx.beginPath(); ctx.arc(xa, y, 5, 0, Math.PI * 2); ctx.fill(); }
      const lx = s.echo === 'radio' ? x0 + (w - 2 * x0) * 0.45 : mid;
      line(ctx, lx, y - 4, lx, cy + 5, AMBER, 1.5, [3, 3]);
      ctx.fillStyle = AMBER; ctx.fillRect(lx - 5, cy - 5, 10, 10);
      lane++;
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} of {total} scenes of the film matched to history or marked as invented', { n: formatNumber(done.length), total: formatNumber(SCENES.length) })} />
      <p className="lab__note">
        {t('{n} of {total} placed', { n: formatNumber(done.length), total: formatNumber(SCENES.length) })}
        {' · '}
        {wrong ? `${t('not that one, try another')} · ` : last ? `${echoName(last)} · ` : ''}
        {current ? t('Film scene: {s}', { s: scene(current.id) }) : t('All five film scenes placed.')}
      </p>
      <Choice
        label={t('What does this scene draw on?')}
        options={(['levy', 'labour', 'radio', 'invented'] as Echo[]).map((e) => ({ value: e, label: echoShort(e) }))}
        value={'' as Echo}
        onChange={pickEcho}
      />
    </div>
  );
}
