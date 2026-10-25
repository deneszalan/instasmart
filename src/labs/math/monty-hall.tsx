import { useState } from 'react';
import { Btn, Choice, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

type Phase = 'pick' | 'decide' | 'over' | 'void';
interface Tally {
  stay: [number, number];
  switch: [number, number];
}
const NONE: Tally = { stay: [0, 0], switch: [0, 0] };

/** One game's host move: a door that isn't the pick, chosen knowingly (never the car) or at random. */
function hostOpens(pick: number, car: number, knows: boolean, rand: () => number): number {
  const others = [0, 1, 2].filter((d) => d !== pick);
  const allowed = knows ? others.filter((d) => d !== car) : others;
  return allowed[Math.floor(rand() * allowed.length)];
}

/** Plays `n` games with each strategy; games where a guessing host shows the car don't count. */
export function simulate(n: number, knows: boolean, rand: () => number = Math.random): Tally {
  const out: Tally = { stay: [0, 0], switch: [0, 0] };
  for (const strategy of ['stay', 'switch'] as const) {
    let played = 0;
    while (played < n) {
      const car = Math.floor(rand() * 3), pick = Math.floor(rand() * 3);
      const open = hostOpens(pick, car, knows, rand);
      if (open === car) continue;
      const final = strategy === 'stay' ? pick : [0, 1, 2].find((d) => d !== pick && d !== open)!;
      played++;
      out[strategy][1]++;
      if (final === car) out[strategy][0]++;
    }
  }
  return out;
}

export default function MontyHall({ onDone }: LabProps) {
  const [knows, setKnows] = useState(true);
  const [car, setCar] = useState(() => Math.floor(Math.random() * 3));
  const [pick, setPick] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [final, setFinal] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [mine, setMine] = useState<Tally>(NONE);
  const [sim, setSim] = useState<Tally | null>(null);
  useGoal(!!sim || mine.stay[1] + mine.switch[1] >= 8, onDone);

  const choose = (door: number) => {
    if (phase !== 'pick') return;
    const o = hostOpens(door, car, knows, Math.random);
    setPick(door);
    setOpen(o);
    setPhase(o === car ? 'void' : 'decide');
  };
  const decide = (strategy: 'stay' | 'switch') => {
    const f = strategy === 'stay' ? pick! : [0, 1, 2].find((d) => d !== pick && d !== open)!;
    setFinal(f);
    setPhase('over');
    setMine((m) => ({ ...m, [strategy]: [m[strategy][0] + (f === car ? 1 : 0), m[strategy][1] + 1] }));
  };
  const again = () => {
    setCar(Math.floor(Math.random() * 3));
    setPick(null);
    setOpen(null);
    setFinal(null);
    setPhase('pick');
  };
  const changeHost = (k: boolean) => {
    setKnows(k);
    setMine(NONE);
    setSim(null);
    again();
  };

  const shown = (d: number) => phase === 'over' || phase === 'void' ? true : d === open;
  const other = pick !== null && open !== null ? [0, 1, 2].find((d) => d !== pick && d !== open)! : null;
  const rate = ([w, n]: [number, number]) => (n ? `${Math.round((w / n) * 100)}%` : '–');

  return (
    <div className="lab">
      <Choice
        label={t('The host')}
        value={knows ? 'knows' : 'guesses'}
        onChange={(v) => changeHost(v === 'knows')}
        options={[
          { value: 'knows', label: t('Host knows') },
          { value: 'guesses', label: t('Host guesses') },
        ]}
      />
      <div className="lab__stage lab__stage--doors">
        <div className="monty__doors">
          {[0, 1, 2].map((d) => (
            <button
              key={d}
              className={`monty__door${shown(d) ? ' monty__door--open' : ''}${d === pick ? ' monty__door--picked' : ''}${d === final ? ' monty__door--final' : ''}`}
              onClick={() => choose(d)}
              disabled={phase !== 'pick'}
              aria-label={shown(d) ? (d === car ? t('Door {n}: the car', { n: d + 1 }) : t('Door {n}: a goat', { n: d + 1 })) : t('Door {n}', { n: d + 1 })}
            >
              <span className="monty__face" aria-hidden="true">
                {shown(d) ? (d === car ? '🚗' : '🐐') : d + 1}
              </span>
              {d === pick && <span className="monty__tag">{t('Your pick')}</span>}
            </button>
          ))}
        </div>
        <p className="monty__say" aria-live="polite">
          {phase === 'pick' && t('Pick a door.')}
          {phase === 'decide' && t('The host opens door {n}: a goat. Stay or switch?', { n: open! + 1 })}
          {phase === 'void' && t('The host guessed and showed the car! That game doesn’t count.')}
          {phase === 'over' && (final === car ? t('You win the car!') : t('A goat. The car was behind door {n}.', { n: car + 1 }))}
        </p>
      </div>
      <div className="lab__row">
        {phase === 'decide' && (
          <>
            <Btn onClick={() => decide('stay')}>{t('Stay with {n}', { n: pick! + 1 })}</Btn>
            <Btn onClick={() => decide('switch')}>{t('Switch to {n}', { n: other! + 1 })}</Btn>
          </>
        )}
        {(phase === 'over' || phase === 'void') && <Btn onClick={again}>{t('Play again')}</Btn>}
        <Btn ghost onClick={() => setSim(simulate(1000, knows))}>
          {t('Play 1,000 games each way')}
        </Btn>
      </div>
      <table className="monty__table">
        <thead>
          <tr>
            <th />
            <th>{t('Stayed')}</th>
            <th>{t('Switched')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{t('Your games')}</th>
            <td>{t('{w} of {n} won', { w: mine.stay[0], n: mine.stay[1] })}</td>
            <td>{t('{w} of {n} won', { w: mine.switch[0], n: mine.switch[1] })}</td>
          </tr>
          {sim && (
            <tr>
              <th>{t('1,000 games')}</th>
              <td>
                <span className="monty__bar" style={{ width: rate(sim.stay) }} /> {rate(sim.stay)}
              </td>
              <td>
                <span className="monty__bar monty__bar--good" style={{ width: rate(sim.switch) }} /> {rate(sim.switch)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {sim && !knows && <p className="lab__note">{t('Only games where the host happened to show a goat count.')}</p>}
    </div>
  );
}
