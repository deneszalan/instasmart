import { useRef, useState } from 'react';
import { Btn, C, dot, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * 6 May 1527 on a map of today (OpenStreetMap). The Pontifical Swiss Guard's history: its 189 men gathered by the
 * obelisk, which then stood beside St Peter's near the Campo Santo Teutonico (its exact spot approximate here);
 * 147 died; 42 escorted Pope Clement VII along the Passetto to Castel Sant'Angelo. The obelisk was moved to the
 * middle of St Peter's Square in 1586.
 */
export const GUARDS = 189;
export const DIED = 147;
export const SURVIVED = GUARDS - DIED;

type LatLon = [number, number];
export const PASSETTO: LatLon[] = [[41.9034, 12.45656], [41.90313, 12.45935], [41.9031, 12.46014], [41.90338, 12.46283], [41.90336, 12.46435], [41.90342, 12.46559]];
const BASILICA: LatLon[] = [[41.90217, 12.4524], [41.90167, 12.45272], [41.90146, 12.45334], [41.90169, 12.45378], [41.90182, 12.45434], [41.90164, 12.45502], [41.90268, 12.45501], [41.90251, 12.4548], [41.90262, 12.45377], [41.90286, 12.4533], [41.90265, 12.45267]];
const CASTLE: LatLon[] = [[41.9035, 12.46557], [41.90328, 12.4658], [41.90264, 12.46568], [41.90254, 12.46596], [41.90265, 12.46676], [41.90262, 12.46702], [41.90332, 12.46686], [41.90344, 12.46709], [41.90362, 12.46697], [41.90342, 12.46597], [41.90358, 12.46578]];
const TIBER: LatLon[] = [[41.9097, 12.4724], [41.905, 12.4743], [41.9027, 12.4713], [41.9019, 12.4665], [41.9011, 12.4643], [41.8998, 12.4635]];

export type PlaceId = 'obelisk1527' | 'obeliskNow' | 'basilica' | 'passetto' | 'castle';
export const PLACES: Record<Exclude<PlaceId, 'passetto'>, LatLon> = {
  obelisk1527: [41.90157, 12.45445],
  obeliskNow: [41.90224, 12.45726],
  basilica: [41.90218, 12.45333],
  castle: [41.90311, 12.46634],
};
/** The order of the day: where the Guard gathered, the way out, the refuge. */
export const ROUTE: PlaceId[] = ['obelisk1527', 'passetto', 'castle'];

const KM = 111.32, COS = Math.cos((41.902 * Math.PI) / 180);
/** Distance in km between two points, flat-earth (fine inside a city). */
export const km = (a: LatLon, b: LatLon) => Math.hypot((a[0] - b[0]) * KM, (a[1] - b[1]) * KM * COS);
/** Length of a polyline in km. */
export const lengthKm = (pts: LatLon[]) => pts.slice(1).reduce((s, p, i) => s + km(pts[i], p), 0);
/** Distance in km from a point to the Passetto. */
export function toPassetto(p: LatLon) {
  let best = Infinity;
  for (let i = 1; i < PASSETTO.length; i++) {
    const a = PASSETTO[i - 1], b = PASSETTO[i];
    const ax = a[1] * COS, ay = a[0], bx = b[1] * COS, by = b[0], px = p[1] * COS, py = p[0];
    const u = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    best = Math.min(best, Math.hypot(px - (ax + u * (bx - ax)), py - (ay + u * (by - ay))) * KM);
  }
  return best;
}
/** The place a tap at p hits, within r km, or null. The castle and the basilica count as hit anywhere near them. */
export function hit(p: LatLon, r = 0.05): PlaceId | null {
  const d: [PlaceId, number][] = [
    ['obelisk1527', km(p, PLACES.obelisk1527)],
    ['obeliskNow', km(p, PLACES.obeliskNow)],
    ['castle', km(p, PLACES.castle) - 0.05],
    ['basilica', km(p, PLACES.basilica) - 0.07],
    ['passetto', toPassetto(p)],
  ];
  d.sort((a, b) => a[1] - b[1]);
  return d[0][1] <= r ? d[0][0] : null;
}

const VIEW = { lat: 41.9024, lon: 12.4597, wKm: 1.5, hKm: 0.62 };
const GOLD = '#f0b429', STONE = '#c8b89a', RIVER = '#3d6f8f';

/** Places are named in Italian, as on the signs in Rome; the two obelisk spots are described. */
function placeName(id: PlaceId) {
  switch (id) {
    case 'obelisk1527': return t('the obelisk’s spot in 1527');
    case 'obeliskNow': return t('the obelisk since 1586');
    case 'basilica': return 'Basilica di San Pietro';
    case 'passetto': return 'Passetto di Borgo';
    case 'castle': return 'Castel Sant’Angelo';
  }
}
function question(step: number) {
  switch (step) {
    case 0: return t('Where did the 189 guards gather?');
    case 1: return t('Which way did the 42 take the pope?');
    case 2: return t('Where did they take him?');
    default: return t('You have followed the 42 to safety.');
  }
}

export default function SwissGuardRoute({ onDone }: LabProps) {
  const [step, setStep] = useState(0);
  const [tap, setTap] = useState<{ p: LatLon; id: PlaceId | null } | null>(null);
  const size = useRef({ w: 300, h: 150 });
  useGoal(step >= ROUTE.length, onDone);

  const frame = (w: number, h: number) => {
    const px = Math.min(w / VIEW.wKm, h / VIEW.hKm);
    return {
      px,
      to: ([la, lo]: LatLon): [number, number] => [w / 2 + (lo - VIEW.lon) * COS * KM * px, h / 2 - (la - VIEW.lat) * KM * px],
      from: (x: number, y: number): LatLon => [VIEW.lat - (y - h / 2) / (KM * px), VIEW.lon + (x - w / 2) / (COS * KM * px)],
    };
  };

  const onPointer = (e: StagePointer) => {
    if (e.kind !== 'down' || step >= ROUTE.length) return;
    const f = frame(size.current.w, size.current.h), p = f.from(e.x, e.y), id = hit(p, 14 / f.px);
    setTap({ p, id });
    if (id === ROUTE[step]) setStep(step + 1);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    const f = frame(w, h);
    const path = (pts: LatLon[], close: boolean) => {
      ctx.beginPath();
      pts.forEach((p, i) => { const [x, y] = f.to(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      if (close) ctx.closePath();
    };
    ctx.strokeStyle = RIVER;
    ctx.lineWidth = Math.max(4, 0.05 * f.px);
    ctx.lineJoin = 'round';
    path(TIBER, false);
    ctx.stroke();
    for (const shape of [BASILICA, CASTLE]) {
      path(shape, true);
      ctx.fillStyle = 'rgba(200,184,154,0.55)';
      ctx.fill();
    }
    // the Passetto: faint until found
    ctx.strokeStyle = step > 1 ? GOLD : 'rgba(200,184,154,0.45)';
    ctx.lineWidth = step > 1 ? 4 : 2.5;
    path(PASSETTO, false);
    ctx.stroke();
    const [nx, ny] = f.to(PLACES.obeliskNow);
    dot(ctx, nx, ny, 3, C.soft);
    const [ox, oy] = f.to(PLACES.obelisk1527);
    if (step > 0) {
      // the guards: 147 rings and 42 gold dots
      for (let i = 0; i < GUARDS; i++) {
        const r = 1.6 * Math.sqrt(i + 0.5), a = i * 2.39996, x = ox + r * Math.cos(a), y = oy + 8 + r * Math.sin(a);
        dot(ctx, x, y, 1.1, i % 9 < 2 ? GOLD : 'rgba(184,192,208,0.55)');
      }
    }
    label(ctx, 'San Pietro', f.to(PLACES.basilica)[0], f.to(PLACES.basilica)[1] - 16, { size: 10, color: STONE });
    label(ctx, 'Castel Sant’Angelo', f.to(PLACES.castle)[0] - 10, f.to(PLACES.castle)[1] - 18, { size: 10, color: STONE });
    label(ctx, 'Tevere', f.to([41.9005, 12.4636])[0] - 8, f.to([41.9005, 12.4636])[1], { size: 10, align: 'right', color: RIVER });
    if (tap) {
      const [x, y] = f.to(tap.p);
      ctx.strokeStyle = tap.id === ROUTE[step - 1] ? C.good : C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    label(ctx, question(step), 8, h - 10, { size: 11, align: 'left', color: step >= ROUTE.length ? C.good : GOLD });
    label(ctx, t('Map of today, not of 1527'), w - 8, 10, { size: 10, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A map of the Vatican and the Borgo today. {q}', { q: question(step) })} />
      <Readouts
        items={[
          { label: t('Spot you tapped'), value: tap ? (tap.id ? placeName(tap.id) : t('a street of the Borgo')) : '–', tone: tap && tap.id && ROUTE.indexOf(tap.id) === step - 1 ? 'good' : undefined },
          { label: t('Steps of 6 May 1527 found'), value: `${formatNumber(Math.min(step, 3))} / 3`, tone: step >= ROUTE.length ? 'good' : 'accent' },
        ]}
      />
      <Btn ghost onClick={() => { setStep(0); setTap(null); }}>{t('Start again')}</Btn>
      <p className="lab__note">{t('Simplified map of today, with places from OpenStreetMap (© OpenStreetMap contributors); the obelisk’s place in 1527 is approximate.')}</p>
    </div>
  );
}
