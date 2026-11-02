import { useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Kind = 'christian' | 'jewish' | 'muslim' | 'unknown';
export type Place = 'graves' | 'ossuary' | 'muslim';

/**
 * Where a French soldier who died in the Tunisian campaign of 1942-43 was laid to rest (Wikipedia, fr, "Cimetière
 * militaire de Gammarth", citing the French consulate in Tunis): Gammarth took Christian, Jewish and other non-Muslim
 * soldiers in individual graves, and the remains of unknown soldiers in its ossuary (1,220 boxes); Muslim soldiers
 * were buried in Muslim cemeteries, such as those at Haffouz and Tarf ech-Chena, out of respect for their faith.
 */
export const KINDS: Kind[] = ['christian', 'jewish', 'muslim', 'unknown'];
export const placeOf = (k: Kind): Place => (k === 'muslim' ? 'muslim' : k === 'unknown' ? 'ossuary' : 'graves');
export const atGammarth = (k: Kind) => placeOf(k) !== 'muslim';
export const UNKNOWN_BOXES = 1220;
export const GRAVES = 1875;
/** The goal: every kind of soldier looked up. */
export const allSeen = (seen: Kind[]) => KINDS.every((k) => seen.includes(k));

export default function GammarthCemetery({ onDone }: LabProps) {
  const [kind, setKind] = useState<Kind>('christian');
  const [seen, setSeen] = useState<Kind[]>(['christian']);
  useGoal(allSeen(seen), onDone);
  const place = placeOf(kind);

  const choose = (k: Kind) => {
    setKind(k);
    setSeen((s) => (s.includes(k) ? s : [...s, k]));
  };
  const where: Record<Place, string> = {
    graves: t('Gammarth: an individual grave'),
    ossuary: t('Gammarth: the ossuary'),
    muslim: t('Not at Gammarth: a Muslim cemetery'),
  };
  const marker: Record<Kind, string> = {
    christian: t('A Latin cross'),
    jewish: t('A Jewish stele'),
    muslim: t('A Muslim grave, elsewhere'),
    unknown: t('One box among {n}', { n: formatNumber(UNKNOWN_BOXES) }),
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    /** Centred text wrapped to a width, at most `max` lines. */
    const wrap = (txt: string, cx: number, y: number, width: number, size: number, color: string, max = 2) => {
      ctx.font = `700 ${size}px system-ui, sans-serif`;
      const lines: string[] = [''];
      for (const word of txt.split(' ')) {
        const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
        if (ctx.measureText(next).width > width && lines[lines.length - 1]) lines.push(word); else lines[lines.length - 1] = next;
      }
      lines.slice(0, max).forEach((l, i) => label(ctx, l, cx, y + i * (size + 3), { size, color }));
    };
    const gw = w * 0.64, bottom = h - 22;
    // Gammarth: rows of graves and the ossuary
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.strokeRect(6, 6, gw - 12, bottom - 6);
    wrap(t('Gammarth cemetery'), gw / 2, 18, gw - 24, 11, C.soft, 1);
    const rows = 2, cols = 8, top = 38, rowGap = Math.max(18, (bottom * 0.58 - top) / (rows - 1));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 22 + c * ((gw - 44) / (cols - 1)), y = top + r * rowGap;
      ctx.fillStyle = place === 'graves' ? (kind === 'christian' ? C.accent : C.cool) : C.faint;
      if ((r + c) % 3 === 0) { ctx.beginPath(); ctx.arc(x, y - 3, 4, Math.PI, 0); ctx.lineTo(x + 4, y + 5); ctx.lineTo(x - 4, y + 5); ctx.closePath(); ctx.fill(); }
      else { ctx.fillRect(x - 1, y - 6, 2, 12); ctx.fillRect(x - 4, y - 3, 8, 2); }
    }
    // the ossuary, with its name on it
    const oh = Math.max(18, bottom * 0.16), oy = bottom - oh - 8, ow = Math.min(120, gw - 40);
    ctx.fillStyle = place === 'ossuary' ? C.accent : C.line; ctx.fillRect(gw / 2 - ow / 2, oy, ow, oh);
    label(ctx, t('the ossuary'), gw / 2, oy + oh / 2, { size: 10, color: place === 'ossuary' ? '#1a1a1a' : C.soft });
    // elsewhere: Muslim cemeteries
    const mx = gw + 6, mw = w - gw - 12;
    ctx.strokeStyle = place === 'muslim' ? C.good : C.faint; ctx.lineWidth = place === 'muslim' ? 2.5 : 1.5;
    ctx.setLineDash([4, 4]); ctx.strokeRect(mx, 6, mw, bottom - 6); ctx.setLineDash([]);
    wrap(t('Muslim cemeteries elsewhere'), mx + mw / 2, 18, mw - 10, 10, place === 'muslim' ? C.good : C.soft, 3);
    for (let i = 0; i < 3; i++) {
      const x = mx + mw * (0.22 + i * 0.28), y = bottom * 0.58;
      ctx.fillStyle = place === 'muslim' ? C.good : C.faint;
      ctx.beginPath(); ctx.arc(x, y - 6, 6, Math.PI, 0); ctx.lineTo(x + 6, y + 10); ctx.lineTo(x - 6, y + 10); ctx.closePath(); ctx.fill();
    }
    wrap(t('Haffouz, Tarf ech-Chena…'), mx + mw / 2, bottom * 0.58 + 26, mw - 10, 9, C.soft);
    label(ctx, t('Schematic plan · {g} individual graves at Gammarth', { g: formatNumber(GRAVES) }), w / 2, h - 9, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Which soldier of 1942–43')}
        value={kind}
        onChange={choose}
        options={[
          { value: 'christian', label: t('Christian soldier') },
          { value: 'jewish', label: t('Jewish soldier') },
          { value: 'muslim', label: t('Muslim soldier') },
          { value: 'unknown', label: t('Unidentified soldier') },
        ]}
      />
      <Stage draw={draw} label={t('{where}. {marker}.', { where: where[place], marker: marker[kind] })} />
      <Readouts items={[{ label: where[place], value: marker[kind], tone: atGammarth(kind) ? 'accent' : 'good' }]} />
    </div>
  );
}
