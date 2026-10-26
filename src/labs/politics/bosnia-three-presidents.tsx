import { useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export type Place = 'federation' | 'srpska';
export type People = 'bosniak' | 'croat' | 'serb' | 'other';
export type Seat = 'bosniak' | 'croat' | 'serb';

/**
 * What a citizen may do in an election to Bosnia and Herzegovina's presidency (Constitution, Annex 4 of the
 * Dayton Agreement): voters in the Federation choose one ballot, for the Bosniak or the Croat member, whatever
 * their own group; voters in Republika Srpska elect the Serb member. Only a Bosniak or Croat from the Federation,
 * or a Serb from Republika Srpska, may stand. Brčko District is left out.
 */
export function rights(person: People, place: Place): { vote: Seat[]; run: Seat | null } {
  if (place === 'federation') return { vote: ['bosniak', 'croat'], run: person === 'bosniak' || person === 'croat' ? person : null };
  return { vote: ['serb'], run: person === 'serb' ? 'serb' : null };
}

const SEATS: Seat[] = ['bosniak', 'croat', 'serb'];
const COLOR: Record<Seat, string> = { bosniak: '#f08a6e', croat: '#f2c14e', serb: '#8fb0f0' };
const seatName = (s: Seat) => (s === 'bosniak' ? t('Bosniak seat') : s === 'croat' ? t('Croat seat') : t('Serb seat'));

export default function BosniaPresidency({ onDone }: LabProps) {
  const [place, setPlace] = useState<Place>('federation');
  const [person, setPerson] = useState<People>('bosniak');
  const [seen, setSeen] = useState<string[]>(['federation-bosniak']);
  const r = rights(person, place);
  useGoal(seen.length >= 8, onDone);
  const visit = (pl: Place, pe: People) => {
    const key = `${pl}-${pe}`;
    if (!seen.includes(key)) setSeen([...seen, key]);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the two entities (a diagram, not a map), the voter's one lit
    const pw = w * 0.36, ph = (h - 12) / 2;
    const panels: [Place, string][] = [['federation', t('Federation')], ['srpska', t('Republika Srpska')]];
    panels.forEach(([pl, name], i) => {
      const y = 4 + i * (ph + 4), on = pl === place;
      ctx.fillStyle = on ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(4, y, pw, ph, 8);
      ctx.fill();
      label(ctx, name, 4 + pw / 2 + (on ? 8 : 0), y + ph / 2, { size: 10.5, color: on ? C.ink : C.faint });
      if (on) {
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.arc(16, y + ph / 2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(12, y + ph / 2, 8, 8);
      }
    });
    // right: the three seats, lit if this citizen may vote for it, ringed if they may stand for it
    const x0 = pw + 14, slot = (w - x0) / 3, cw = Math.min(slot * 0.52, h * 0.36), cy = h * 0.42;
    SEATS.forEach((seat, i) => {
      const x = x0 + slot * (i + 0.5), canVote = r.vote.includes(seat), canRun = r.run === seat;
      ctx.globalAlpha = canVote ? 1 : 0.22;
      ctx.fillStyle = COLOR[seat];
      ctx.beginPath();
      ctx.roundRect(x - cw / 2, cy - cw * 0.75, cw, cw * 0.75, 5);
      ctx.fill();
      ctx.fillRect(x - cw * 0.6, cy + 2, cw * 1.2, cw * 0.2);
      ctx.fillRect(x - cw * 0.5, cy + 2 + cw * 0.2, cw * 0.12, cw * 0.3);
      ctx.fillRect(x + cw * 0.38, cy + 2 + cw * 0.2, cw * 0.12, cw * 0.3);
      ctx.globalAlpha = 1;
      if (canRun) {
        ctx.strokeStyle = C.good;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x - cw * 0.78, cy - cw * 0.95, cw * 1.56, cw * 1.55, 8);
        ctx.stroke();
      }
      label(ctx, seatName(seat), x, h - 9, { size: 9.5, color: canVote ? C.ink : C.faint });
    });
  };

  const voteText = place === 'federation' ? t('Bosniak or Croat seat') : t('Serb seat');
  const runText = r.run ? seatName(r.run) : t('No seat');
  return (
    <div className="lab">
      <Choice
        label={t('Where the voter lives')}
        value={place}
        onChange={(v) => { setPlace(v); visit(v, person); }}
        options={[
          { value: 'federation', label: t('Federation') },
          { value: 'srpska', label: t('Republika Srpska') },
        ]}
      />
      <Stage draw={draw} label={t('A citizen in one of the two entities, and the three presidency seats they may vote or stand for')} />
      <Choice
        label={t('Declared group')}
        value={person}
        onChange={(v) => { setPerson(v); visit(place, v); }}
        options={[
          { value: 'bosniak', label: t('Bosniak') },
          { value: 'croat', label: t('Croat') },
          { value: 'serb', label: t('Serb') },
          { value: 'other', label: t('Other or none') },
        ]}
      />
      <Readouts
        items={[
          { label: t('May vote for'), value: voteText },
          { label: t('May stand for'), value: runText, tone: r.run ? 'good' : 'bad' },
          { label: t('Tried'), value: t('{n} of {all}', { n: seen.length, all: 8 }), tone: 'accent' },
        ]}
      />
    </div>
  );
}
