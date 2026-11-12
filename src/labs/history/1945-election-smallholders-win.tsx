import { useState } from 'react';
import { C, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Hungary's National Assembly after the free election of 4 November 1945 (final count: Nohlen & Stöver) and the
 * coalition cabinet of 15 November 1945, as the US representative in Budapest reported it (FRUS 1945 vol. IV,
 * doc. 856): 18 ministers, 9 Smallholders, 4 Communists, 4 Social Democrats and 1 National Peasant, with the
 * Interior Ministry, and so the police, conceded to the Communists. The lab shares the 18 posts out in proportion to
 * the seats (largest remainders), a simplification: cabinets are bargained, not computed.
 */
export type PartyId = 'fkgp' | 'szdp' | 'mkp' | 'npp' | 'pdp';
export const PARTY_IDS: PartyId[] = ['fkgp', 'szdp', 'mkp', 'npp', 'pdp'];
export const SEATS: Record<PartyId, number> = { fkgp: 245, szdp: 69, mkp: 70, npp: 23, pdp: 2 };
export const TOTAL_SEATS = PARTY_IDS.reduce((s, p) => s + SEATS[p], 0);
export const POSTS = 18;
export const ACTUAL: Record<PartyId, number> = { fkgp: 9, szdp: 4, mkp: 4, npp: 1, pdp: 0 };

/** The posts each party would hold in proportion to its seats, by largest remainders. */
export function fairShare(seats: Record<PartyId, number> = SEATS, posts = POSTS): Record<PartyId, number> {
  const total = PARTY_IDS.reduce((s, p) => s + seats[p], 0);
  const quota = PARTY_IDS.map((p) => ({ p, q: (seats[p] * posts) / total }));
  const out = Object.fromEntries(quota.map(({ p, q }) => [p, Math.floor(q)])) as Record<PartyId, number>;
  let left = posts - PARTY_IDS.reduce((s, p) => s + out[p], 0);
  for (const { p } of [...quota].sort((a, b) => (b.q % 1) - (a.q % 1))) {
    if (left-- <= 0) break;
    out[p]++;
  }
  return out;
}

/** A cabinet from the three smaller parties' posts: the Smallholders get the rest of the 18. */
export function cabinet(szdp: number, mkp: number, npp: number): Record<PartyId, number> {
  return { fkgp: Math.max(0, POSTS - szdp - mkp - npp), szdp, mkp, npp, pdp: 0 };
}

/** The goal: every party holds the posts its seats would give it. */
export const proportional = (c: Record<PartyId, number>) => {
  const f = fairShare();
  return PARTY_IDS.every((p) => c[p] === f[p]);
};

const COL: Record<PartyId, string> = { fkgp: '#e2b84a', szdp: '#e8978f', mkp: '#d4483b', npp: '#8fbf62', pdp: '#8fa7bf' };

export default function Election1945({ onDone }: LabProps) {
  const [szdp, setSzdp] = useState(4);
  const [mkp, setMkp] = useState(4);
  const [npp, setNpp] = useState(1);
  const c = cabinet(szdp, mkp, npp);
  const over = szdp + mkp + npp > POSTS;
  const done = !over && proportional(c);
  useGoal(done, onDone);
  const share = (n: number, of: number) => `${formatNumber(Math.round((100 * n) / of))}%`;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = Math.max(12, w * 0.04), bw = w - 2 * pad;
    const rows: { title: string; parts: Record<PartyId, number>; total: number; y: number }[] = [
      { title: t('Seats in the National Assembly, 1945'), parts: SEATS, total: TOTAL_SEATS, y: h * 0.18 },
      { title: t('Your cabinet of 18'), parts: c, total: POSTS, y: h * 0.45 },
    ];
    if (done) rows.push({ title: t('The real cabinet, 15 November 1945'), parts: ACTUAL, total: POSTS, y: h * 0.8 });
    const bh = Math.min(26, h * 0.1);
    for (const r of rows) {
      label(ctx, r.title, pad, r.y - bh / 2 - 10, { size: 11, color: C.soft, align: 'left' });
      let x = pad;
      const sum = PARTY_IDS.reduce((s, p) => s + r.parts[p], 0);
      for (const p of PARTY_IDS) {
        const pw = (bw * r.parts[p]) / Math.max(sum, r.total);
        if (pw <= 0) continue;
        if (r.total === POSTS) {
          // one block per minister
          const n = r.parts[p];
          for (let i = 0; i < n; i++) {
            const bx = x + (pw * i) / n;
            ctx.fillStyle = COL[p];
            ctx.fillRect(bx + 1, r.y - bh / 2, pw / n - 2, bh);
          }
        } else {
          ctx.fillStyle = COL[p];
          ctx.fillRect(x, r.y - bh / 2, pw - 1, bh);
        }
        if (pw > 22 && r.total !== POSTS) label(ctx, formatNumber(r.parts[p]), x + pw / 2, r.y, { size: 11, color: '#1b2420' });
        x += pw;
      }
      if (r.parts === ACTUAL) {
        // the Interior Ministry, and so the police, went to a Communist
        const mx = pad + (bw * (ACTUAL.fkgp + ACTUAL.szdp + 0.5)) / POSTS;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(mx, r.y, bh * 0.62, 0, Math.PI * 2); ctx.stroke();
        label(ctx, t('Interior: a Communist'), mx, r.y + bh / 2 + 10, { size: 10, color: C.ink });
      }
    }
    const summary = over
      ? t('More than 18 posts')
      : t('Smallholders: seats {a}, posts {b}', { a: share(SEATS.fkgp, TOTAL_SEATS), b: share(c.fkgp, POSTS) });
    label(ctx, summary, pad, h * 0.45 + bh / 2 + 14, { size: 12, color: over ? C.bad : done ? C.good : C.accent, align: 'left' });
    label(ctx, t('Simplified: posts shared in proportion to seats'), pad, h - 8, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Cabinet of 18: {a} Smallholders, {b} Social Democrats, {c} Communists, {d} National Peasants', {
          a: formatNumber(c.fkgp),
          b: formatNumber(szdp),
          c: formatNumber(mkp),
          d: formatNumber(npp),
        })}
      />
      <Range label={t('Social Democrat ministers')} value={szdp} min={0} max={6} step={1} onChange={setSzdp} format={(v) => t('{n} cabinet posts', { n: formatNumber(v) })} />
      <Range label={t('Communist ministers')} value={mkp} min={0} max={6} step={1} onChange={setMkp} format={(v) => t('{n} cabinet posts', { n: formatNumber(v) })} />
      <Range label={t('National Peasant ministers')} value={npp} min={0} max={3} step={1} onChange={setNpp} format={(v) => t('{n} cabinet posts', { n: formatNumber(v) })} />
    </div>
  );
}
