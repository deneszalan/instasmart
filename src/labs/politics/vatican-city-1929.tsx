import { useRef, useState } from 'react';
import { C, Choice, dot, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * What a spot in Rome is under the Lateran Treaty of 1929 (vatican.va): Vatican City; St Peter's Square, part of
 * Vatican City but open to all and policed by Italy (art. 3); Italian territory owned by the Holy See with the
 * immunities of an embassy (art. 13, 15); or plain Italy.
 */
export type Kind = 'vatican' | 'square' | 'embassy' | 'italy';
export const KINDS: Kind[] = ['vatican', 'square', 'embassy', 'italy'];

/** Vatican City's border (lat, lon), from OpenStreetMap relation 36989, simplified. */
export const BORDER: [number, number][] = [[41.90197, 12.44579], [41.90164, 12.44655], [41.9014, 12.44734], [41.901, 12.44797], [41.90069, 12.44795], [41.90082, 12.44877], [41.901, 12.44878], [41.90083, 12.45087], [41.90059, 12.45084], [41.90036, 12.45181], [41.90028, 12.45279], [41.90049, 12.45283], [41.9002, 12.45452], [41.90071, 12.45435], [41.9014, 12.45433], [41.9015, 12.45481], [41.90167, 12.45626], [41.90126, 12.4568], [41.90117, 12.45736], [41.90136, 12.45795], [41.90166, 12.45825], [41.90226, 12.45837], [41.90276, 12.45821], [41.90316, 12.45783], [41.90329, 12.45734], [41.90319, 12.45675], [41.90279, 12.4563], [41.90276, 12.45618], [41.90312, 12.45653], [41.90335, 12.45708], [41.90333, 12.45756], [41.90582, 12.45766], [41.9063, 12.45566], [41.90738, 12.4554], [41.90698, 12.45383], [41.90667, 12.45315], [41.90653, 12.45206], [41.90637, 12.45143], [41.90658, 12.45137], [41.90649, 12.45051], [41.90599, 12.45032], [41.90584, 12.45052], [41.90504, 12.44945], [41.90504, 12.44894], [41.90468, 12.4491], [41.90361, 12.44865], [41.90342, 12.44791], [41.90312, 12.44764], [41.90299, 12.44786], [41.90219, 12.44687], [41.90235, 12.44662]];
/** The square's oval lies east of this longitude, inside the border. */
export const SQUARE_WEST = 12.4561;
const TIBER: [number, number][] = [[41.9316, 12.4596], [41.9187, 12.4708], [41.9144, 12.4707], [41.9097, 12.4724], [41.905, 12.4743], [41.9027, 12.4713], [41.9019, 12.4665], [41.9011, 12.4643], [41.8998, 12.4635], [41.8961, 12.466], [41.8923, 12.4707], [41.8911, 12.4745], [41.8905, 12.4778], [41.8891, 12.4792], [41.8829, 12.4756], [41.8754, 12.4705], [41.8719, 12.4719], [41.8601, 12.4705], [41.85, 12.468]];

export type PlaceId = 'basilica' | 'sistine' | 'gardens' | 'square' | 'lateran' | 'maggiore' | 'stpaul' | 'cancelleria' | 'propaganda' | 'angelo' | 'colosseum' | 'pantheon' | 'trevi' | 'portapia' | 'conciliazione';
export const PLACES: { id: PlaceId; lat: number; lon: number; kind: Kind; view: 'rome' | 'vatican' | 'both' }[] = [
  { id: 'basilica', lat: 41.9022, lon: 12.4536, kind: 'vatican', view: 'vatican' },
  { id: 'sistine', lat: 41.9029, lon: 12.4545, kind: 'vatican', view: 'vatican' },
  { id: 'gardens', lat: 41.9040, lon: 12.4500, kind: 'vatican', view: 'vatican' },
  { id: 'square', lat: 41.90222, lon: 12.45727, kind: 'square', view: 'vatican' },
  { id: 'conciliazione', lat: 41.9020, lon: 12.4615, kind: 'italy', view: 'vatican' },
  { id: 'angelo', lat: 41.90312, lon: 12.46634, kind: 'italy', view: 'both' },
  { id: 'lateran', lat: 41.88585, lon: 12.50559, kind: 'embassy', view: 'rome' },
  { id: 'maggiore', lat: 41.89763, lon: 12.49847, kind: 'embassy', view: 'rome' },
  { id: 'stpaul', lat: 41.8587, lon: 12.47678, kind: 'embassy', view: 'rome' },
  { id: 'cancelleria', lat: 41.89663, lon: 12.47179, kind: 'embassy', view: 'rome' },
  { id: 'propaganda', lat: 41.9042, lon: 12.48338, kind: 'embassy', view: 'rome' },
  { id: 'colosseum', lat: 41.89094, lon: 12.4919, kind: 'italy', view: 'rome' },
  { id: 'pantheon', lat: 41.89862, lon: 12.47683, kind: 'italy', view: 'rome' },
  { id: 'trevi', lat: 41.90098, lon: 12.48328, kind: 'italy', view: 'rome' },
  { id: 'portapia', lat: 41.9092, lon: 12.50099, kind: 'italy', view: 'rome' },
];

export function insideBorder(lat: number, lon: number) {
  let inside = false;
  for (let i = 0, j = BORDER.length - 1; i < BORDER.length; j = i++) {
    const [ya, xa] = BORDER[i], [yb, xb] = BORDER[j];
    if (ya > lat !== yb > lat && lon < ((xb - xa) * (lat - ya)) / (yb - ya) + xa) inside = !inside;
  }
  return inside;
}
const KM = 111.32, COS = Math.cos((41.9 * Math.PI) / 180);
/** Distance in km between two points, flat-earth (fine inside a city). */
export const km = (la1: number, lo1: number, la2: number, lo2: number) => Math.hypot((la1 - la2) * KM, (lo1 - lo2) * KM * COS);

/** What a spot is: inside the border, the square or the rest; outside, a nearby named place within `r` km, or Italy. */
export function classify(lat: number, lon: number, r = 0.15): { kind: Kind; place: PlaceId | null } {
  const near = PLACES.map((p) => ({ p, d: km(lat, lon, p.lat, p.lon) })).sort((a, b) => a.d - b.d)[0];
  if (insideBorder(lat, lon)) {
    const named = near.d < r && near.p.kind !== 'italy' && near.p.kind !== 'embassy' ? near.p.id : null;
    return { kind: lon > SQUARE_WEST ? 'square' : 'vatican', place: lon > SQUARE_WEST ? 'square' : named };
  }
  if (near.d < r) return { kind: near.p.kind === 'vatican' || near.p.kind === 'square' ? 'italy' : near.p.kind, place: near.p.kind === 'vatican' || near.p.kind === 'square' ? null : near.p.id };
  return { kind: 'italy', place: null };
}

const VIEWS = {
  rome: { lat: 41.8855, lon: 12.4757, wKm: 5.6, hKm: 6.9 },
  vatican: { lat: 41.9038, lon: 12.456, wKm: 2.0, hKm: 0.95 },
};
const COLOUR: Record<Kind, string> = { vatican: '#f2c14e', square: '#fde68a', embassy: '#c4b5fd', italy: '#86efac' };

/** Places are labelled with their Italian names, as on the signs in Rome. */
export const NAME: Record<PlaceId, string> = {
  basilica: 'Basilica di San Pietro', sistine: 'Cappella Sistina', gardens: 'Giardini Vaticani', square: 'Piazza San Pietro',
  conciliazione: 'Via della Conciliazione', angelo: 'Castel Sant’Angelo', lateran: 'San Giovanni in Laterano',
  maggiore: 'Santa Maria Maggiore', stpaul: 'San Paolo fuori le Mura', cancelleria: 'Palazzo della Cancelleria',
  propaganda: 'Propaganda Fide', colosseum: 'Colosseo', pantheon: 'Pantheon', trevi: 'Fontana di Trevi', portapia: 'Porta Pia',
};
function kindName(k: Kind) {
  switch (k) {
    case 'vatican': return t('Vatican City territory');
    case 'square': return t('Vatican City, policed by Italy');
    case 'embassy': return t('Italy, but Holy See property with an embassy’s immunities');
    case 'italy': return t('Italian territory');
  }
}

export default function VaticanMap({ onDone }: LabProps) {
  const [view, setView] = useState<'rome' | 'vatican'>('rome');
  const [pick, setPick] = useState<{ lat: number; lon: number; kind: Kind; place: PlaceId | null } | null>(null);
  const [found, setFound] = useState<Kind[]>([]);
  useGoal(found.length === KINDS.length, onDone);

  const frame = (w: number, h: number) => {
    const v = VIEWS[view], px = Math.min(w / v.wKm, h / v.hKm);
    return {
      px,
      to: (la: number, lo: number): [number, number] => [w / 2 + (lo - v.lon) * COS * KM * px, h / 2 - (la - v.lat) * KM * px],
      from: (x: number, y: number): [number, number] => [v.lat - (y - h / 2) / (KM * px), v.lon + (x - w / 2) / (COS * KM * px)],
    };
  };
  const size = useRef({ w: 300, h: 300 });

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const f = frame(size.current.w, size.current.h), [lat, lon] = f.from(p.x, p.y);
    const c = classify(lat, lon, 16 / f.px);
    setPick({ lat, lon, ...c });
    if (!found.includes(c.kind)) setFound([...found, c.kind]);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    const f = frame(w, h);
    const path = (pts: [number, number][], close: boolean) => {
      ctx.beginPath();
      pts.forEach(([la, lo], i) => { const [x, y] = f.to(la, lo); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      if (close) ctx.closePath();
    };
    ctx.strokeStyle = '#3f74ad';
    ctx.lineWidth = Math.max(3, 0.09 * f.px);
    ctx.lineJoin = 'round';
    path(TIBER, false);
    ctx.stroke();
    path(BORDER, true);
    ctx.fillStyle = 'rgba(242,193,78,0.5)';
    ctx.fill();
    ctx.strokeStyle = COLOUR.vatican;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    for (const pl of PLACES) {
      if (pl.view !== view && pl.view !== 'both') continue;
      const [x, y] = f.to(pl.lat, pl.lon);
      dot(ctx, x, y, 4, C.ink);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (pick) {
      const [x, y] = f.to(pick.lat, pick.lon);
      ctx.strokeStyle = COLOUR[pick.kind];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
      const name = pick.place ? NAME[pick.place] : t('elsewhere in Rome');
      label(ctx, name, x < w * 0.6 ? x + 13 : x - 13, y, { size: 11, align: x < w * 0.6 ? 'left' : 'right', color: COLOUR[pick.kind] });
    }
    label(ctx, t('Tap anywhere on the map'), 8, h - 10, { size: 10, align: 'left', color: C.faint });
    label(ctx, t('Kinds of territory found: {n} of 4', { n: formatNumber(found.length) }), w - 8, 10, { size: 10, align: 'right', color: found.length === KINDS.length ? C.good : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A map of Rome with Vatican City; the chosen spot is: {k}', { k: pick ? kindName(pick.kind) : t('none yet') })} />
      <Choice
        label={t('Map to show')}
        options={[
          { value: 'rome', label: t('All of Rome') },
          { value: 'vatican', label: t('Close-up of the Vatican') },
        ]}
        value={view}
        onChange={(v) => { setView(v); setPick(null); }}
      />
      <Readouts
        items={[
          { label: t('Spot you tapped'), value: pick ? (pick.place ? NAME[pick.place] : t('elsewhere in Rome')) : '–' },
          { label: t('Under the 1929 treaty'), value: pick ? kindName(pick.kind) : '–', tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Schematic: Vatican City’s border from OpenStreetMap; only some Holy See properties are marked.')}</p>
    </div>
  );
}
