import { useState } from 'react';
import { C, Choice, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Thread = 'both' | 'novel' | 'life';
export type EpisodeId = 'alley' | 'lycee' | 'name' | 'camp' | 'ship' | 'studies' | 'publish' | 'france';
/**
 * Episodes of Albert Memmi's La Statue de sel (1953) and of his life, and where each belongs (France Culture, 2020;
 * H. Saadoun, Revue d'histoire de la Shoah, 2016; French Wikipedia): `both` when the novel tells what Memmi lived.
 */
export const EPISODES: { id: EpisodeId; thread: Thread }[] = [
  { id: 'alley', thread: 'both' },
  { id: 'lycee', thread: 'both' },
  { id: 'name', thread: 'novel' },
  { id: 'camp', thread: 'both' },
  { id: 'ship', thread: 'novel' },
  { id: 'studies', thread: 'life' },
  { id: 'publish', thread: 'life' },
  { id: 'france', thread: 'life' },
];
/** How many of the reader's answers are right. */
export const score = (answers: Partial<Record<EpisodeId, Thread>>) => EPISODES.filter((e) => answers[e.id] === e.thread).length;

const BLUE = '#6fa8d6', TERRA = '#e08a6f';

export default function MemmiFork({ onDone }: LabProps) {
  const [answers, setAnswers] = useState<Partial<Record<EpisodeId, Thread>>>({});
  const [at, setAt] = useState(0);
  const ep = EPISODES[at];
  const n = score(answers);
  useGoal(n === EPISODES.length, onDone);

  const describe = (id: EpisodeId) =>
    id === 'alley' ? t('Grows up in an alley by the Hara, the Jewish quarter of Tunis')
    : id === 'lycee' ? t('Goes to the French lycée of Tunis on a scholarship')
    : id === 'name' ? t('Is called Alexandre Mordekhaï Benillouche')
    : id === 'camp' ? t('Is in a German forced labour camp in 1942–43')
    : id === 'ship' ? t('Sails for South America after the war')
    : id === 'studies' ? t('Studies philosophy in Algiers and Paris after the war')
    : id === 'publish' ? t('Publishes La Statue de sel in 1953, with a preface by Albert Camus')
    : t('Moves to France after Tunisia’s independence in 1956');
  const threadName = (th: Thread) => (th === 'both' ? t('In both') : th === 'novel' ? t('Novel only') : t('Life only'));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // two threads that run together, then fork; answered episodes sit as dots on their thread
    const yMid = h * 0.46, xFork = w * 0.5, xEnd = w - 14, x0 = 14;
    const yLife = h * 0.16, yNovel = h * 0.78;
    ctx.lineCap = 'round'; ctx.lineWidth = 5;
    ctx.strokeStyle = BLUE; ctx.beginPath(); ctx.moveTo(x0, yMid - 4); ctx.lineTo(xFork, yMid - 4); ctx.bezierCurveTo(xFork + 40, yMid - 4, xFork + 40, yLife, xFork + 90, yLife); ctx.lineTo(xEnd, yLife); ctx.stroke();
    ctx.strokeStyle = TERRA; ctx.beginPath(); ctx.moveTo(x0, yMid + 4); ctx.lineTo(xFork, yMid + 4); ctx.bezierCurveTo(xFork + 40, yMid + 4, xFork + 40, yNovel, xFork + 90, yNovel); ctx.lineTo(xEnd, yNovel); ctx.stroke();
    ctx.lineCap = 'butt';
    label(ctx, t('life and novel together'), (x0 + xFork) / 2, yMid - 18, { size: 10, color: C.soft });
    label(ctx, t('Memmi’s life'), xEnd - 30, yLife - 14, { size: 10, color: BLUE });
    label(ctx, t('the novel’s story'), xEnd - 30, yNovel + 14, { size: 10, color: TERRA });
    const placed = { both: 0, novel: 0, life: 0 };
    EPISODES.forEach((e, i) => {
      const a = answers[e.id];
      if (!a) return;
      const k = placed[a]++;
      const x = a === 'both' ? x0 + 24 + k * 40 : xFork + 110 + k * 40, y = a === 'both' ? yMid : a === 'life' ? yLife : yNovel;
      const right = a === e.thread;
      ctx.fillStyle = right ? (a === 'both' ? C.ink : a === 'life' ? BLUE : TERRA) : C.bad;
      ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
      label(ctx, formatNumber(i + 1), x, y, { size: 11, color: '#1f2440' });
    });
    label(ctx, t('{n} of {total} placed right', { n: formatNumber(n), total: formatNumber(EPISODES.length) }), 8, 12, { size: 12, color: n === EPISODES.length ? C.good : C.ink, align: 'left' });
    label(ctx, t('Numbers: the episodes. Red: wrong thread.'), w / 2, h - 8, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Two threads, Memmi’s life and his novel, run together and then part; {n} of {total} episodes placed right', { n: formatNumber(n), total: formatNumber(EPISODES.length) })} />
      <p className="lab__note">{t('Episode {i} of {total}:', { i: formatNumber(at + 1), total: formatNumber(EPISODES.length) })} <strong>{describe(ep.id)}</strong></p>
      <Choice
        label={t('Where does this episode belong?')}
        options={(['both', 'novel', 'life'] as Thread[]).map((v) => ({ value: v, label: threadName(v) }))}
        value={answers[ep.id] ?? ('' as Thread)}
        onChange={(v) => { setAnswers({ ...answers, [ep.id]: v }); setAt((at + 1) % EPISODES.length); }}
      />
    </div>
  );
}
