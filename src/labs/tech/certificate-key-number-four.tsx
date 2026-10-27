import { useState } from 'react';
import { Btn, C, dot, label, line, Range, Readouts, rng, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A toy elliptic curve, y² = x³ + x + 4, counting mod 233. It has 257 points with the point at infinity, a prime. */
export const P = 233;
const CA = 1, CB = 4;
export type Point = [number, number] | null; // null is the point at infinity

const mod = (n: number) => ((n % P) + P) % P;
function inverse(n: number): number {
  let r = 1, b = mod(n), e = P - 2;
  while (e) {
    if (e & 1) r = (r * b) % P;
    b = (b * b) % P;
    e >>= 1;
  }
  return r;
}

/** Adding two points of the curve: the chord (or tangent) rule, done mod P. */
export function addPoints(p1: Point, p2: Point): Point {
  if (!p1) return p2;
  if (!p2) return p1;
  const [x1, y1] = p1, [x2, y2] = p2;
  if (x1 === x2 && mod(y1 + y2) === 0) return null;
  const l = x1 === x2 && y1 === y2 ? mod((3 * x1 * x1 + CA) * inverse(2 * y1)) : mod((y2 - y1) * inverse(x2 - x1));
  const x3 = mod(l * l - x1 - x2);
  return [x3, mod(l * (x1 - x3) - y1)];
}

export const POINTS: [number, number][] = [];
for (let x = 0; x < P; x++) for (let y = 0; y < P; y++) if (mod(y * y - (x * x * x + CA * x + CB)) === 0) POINTS.push([x, y]);
export const ORDER = POINTS.length + 1;
export const G: Point = [2, 108];

/** k·G by double-and-add: about log₂ k steps, which is why making a public key is fast. */
export function multiply(k: number, pt: Point = G): Point {
  let result: Point = null, add: Point = pt, n = k;
  while (n > 0) {
    if (n & 1) result = addPoints(result, add);
    add = addPoints(add, add);
    n = Math.floor(n / 2);
  }
  return result;
}

export const samePoint = (a: Point, b: Point) => (a === null || b === null ? a === b : a[0] === b[0] && a[1] === b[1]);

/** Brute force: try k = 1, 2, 3 … until k·G is the public key. Returns the key, which is also the number of tries. */
export function bruteForce(publicKey: Point): number {
  let pt: Point = null;
  for (let k = 1; k < ORDER; k++) {
    pt = addPoints(pt, G);
    if (samePoint(pt, publicKey)) return k;
  }
  return -1;
}

/** Seconds to try every key of a given length, at `rate` tries a second (a trillion by default). */
export const searchSeconds = (bits: number, rate = 1e12) => 2 ** bits / rate;
export const UNIVERSE_SECONDS = 13.8e9 * 365.25 * 86400;
const YEAR = 365.25 * 86400;

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** A large number as "6.3 × 10²⁹". */
export function sci(x: number): string {
  if (x < 1e6) return formatNumber(Math.round(x));
  const e = Math.floor(Math.log10(x)), m = x / 10 ** e;
  return `${formatNumber(Math.round(m * 10) / 10)} × 10${[...String(e)].map((d) => SUP[Number(d)]).join('')}`;
}

function duration(s: number): string {
  if (s < 1) return t('under a second');
  if (s < 60) return t('under a minute');
  if (s < 2 * 3600) return t('{n} minutes', { n: formatNumber(Math.round(s / 60)) });
  if (s < 2 * 86400) return t('{n} hours', { n: formatNumber(Math.round(s / 3600)) });
  if (s < 2 * YEAR) return t('{n} days', { n: formatNumber(Math.round(s / 86400)) });
  const years = s / YEAR;
  return t('{n} years', { n: sci(years) });
}

export default function CertificateKey({ onDone, active }: LabProps) {
  const [seed, setSeed] = useState(4);
  const [bits, setBits] = useState(8);
  const [tried, setTried] = useState(0);
  const [running, setRunning] = useState(false);
  const secret = 1 + Math.floor(rng(seed)() * (ORDER - 1));
  const publicKey = multiply(secret);
  const found = tried === secret;
  const seconds = searchSeconds(bits);
  const outlasts = seconds > UNIVERSE_SECONDS;
  useGoal(outlasts, onDone);

  useFrame((dt) => {
    const next = Math.min(secret, tried + Math.max(1, Math.round(dt * 40)));
    setTried(next);
    if (next >= secret) setRunning(false);
  }, running && active);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 14, y0 = 26, sx = (w - 28) / P, sy = (h - 36) / P;
    const X = (pt: [number, number]) => x0 + pt[0] * sx, Y = (pt: [number, number]) => y0 + (P - 1 - pt[1]) * sy;
    for (const pt of POINTS) dot(ctx, X(pt), Y(pt), 1.6, 'rgba(125,211,252,0.45)');
    const key = publicKey as [number, number];
    ctx.strokeStyle = C.bad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(X(key), Y(key), 8, 0, Math.PI * 2);
    ctx.stroke();
    // the last few hops of the search
    for (let k = Math.max(1, tried - 6); k < tried; k++) {
      const a = multiply(k) as [number, number], b = multiply(k + 1) as [number, number];
      line(ctx, X(a), Y(a), X(b), Y(b), 'rgba(253,224,71,0.35)', 1.2);
    }
    if (tried > 0) {
      const pt = multiply(tried) as [number, number];
      dot(ctx, X(pt), Y(pt), 4.5, found ? C.good : C.accent);
    }
    label(ctx, found ? t('k = {k}: found', { k: secret }) : tried ? t('trying k = {k}', { k: tried }) : t('public key ringed in red'), 10, 12, {
      size: 12, align: 'left', color: found ? C.good : C.soft,
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A toy elliptic curve with {n} points; the public key is ringed, and the search hops from key to key', { n: ORDER })} />
      <div className="lab__row">
        <Btn onClick={() => { setTried(0); setRunning(true); }} disabled={running}>{t('Try every key from 1')}</Btn>
        <Btn ghost onClick={() => { setSeed(seed + 1); setTried(0); setRunning(false); }}>{t('New secret key')}</Btn>
      </div>
      <Range label={t('Length of the secret key')} value={bits} min={8} max={384} step={1} onChange={setBits} format={(v) => t('{n}-bit key', { n: v })} />
      <Readouts
        items={[
          { label: t('Keys to try'), value: sci(2 ** bits) },
          { label: t('Time to try all'), value: duration(seconds), tone: outlasts ? 'good' : undefined },
          { label: t('Universe’s age'), value: t('{n} years', { n: sci(UNIVERSE_SECONDS / YEAR) }) },
        ]}
      />
      <p className="lab__note">
        {t('Simplified: a toy curve, and a search of every key. Cleverer attacks take about the square root as long.')}
      </p>
    </div>
  );
}
