import { useState } from 'react';
import { C, clamp, dot, font, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber, withUnit } from '../../lib/format';

/** Saint-Paul-de-Mausole, the asylum at Saint-Rémy-de-Provence, and the hour the 2026 paper compares: 3 a.m. local mean time. */
export const LAT = 43.789, LON = 4.832, HOUR = 3;
/** The narrow frame the paper recovered from Van Gogh's sketch of the hills: 14.8° by 10.9°, ±0.7° and ±0.5°. */
export const FRAME = { w: 14.8, h: 10.9, dw: 0.7, dh: 0.5 };
const R = Math.PI / 180;
const rev = (x: number) => ((x % 360) + 360) % 360;

interface Eq {
  ra: number;
  dec: number;
}
export interface Hor {
  az: number;
  alt: number;
}
export interface Sky {
  moon: Hor;
  venus: Hor;
  sun: Hor;
  /** Degrees between the Moon and Venus. */
  sep: number;
  /** The share of the Moon's disc that is lit, 0 to 1. */
  lit: number;
  hyades: Hor[];
}

/** Julian day number at 0 h UT of a date in the Gregorian calendar. */
export function julianDay(y: number, m: number, d: number) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + 2 - a + Math.floor(a / 4) - 1524.5;
}
function kepler(M: number, e: number) {
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let i = 0; i < 20; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
function orbit(N: number, i: number, w: number, a: number, e: number, M: number) {
  const E = kepler(rev(M) * R, e), xv = a * (Math.cos(E) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv), r = Math.hypot(xv, yv), n = N * R, inc = i * R, u = v + w * R;
  return [
    r * (Math.cos(n) * Math.cos(u) - Math.sin(n) * Math.sin(u) * Math.cos(inc)),
    r * (Math.sin(n) * Math.cos(u) + Math.cos(n) * Math.sin(u) * Math.cos(inc)),
    r * Math.sin(u) * Math.sin(inc),
  ];
}
function sun(d: number) {
  const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = 356.047 + 0.9856002585 * d;
  const E = kepler(rev(M) * R, e), x = Math.cos(E) - e, y = Math.sqrt(1 - e * e) * Math.sin(E);
  return { lon: rev(Math.atan2(y, x) / R + w), r: Math.hypot(x, y), L: M + w, M };
}
function moon(d: number) {
  const N = 125.1228 - 0.0529538083 * d, w = 318.0634 + 0.1643573223 * d, M = 115.3654 + 13.0649929509 * d;
  const [x, y, z] = orbit(N, 5.1454, w, 60.2666, 0.0549, M);
  let lon = Math.atan2(y, x) / R, lat = Math.atan2(z, Math.hypot(x, y)) / R, r = Math.hypot(x, y, z);
  const s = sun(d), Ms = s.M, Lm = M + w + N, D = Lm - s.L, F = Lm - N;
  const sn = (a: number) => Math.sin(a * R), cs = (a: number) => Math.cos(a * R);
  lon += -1.274 * sn(M - 2 * D) + 0.658 * sn(2 * D) - 0.186 * sn(Ms) - 0.059 * sn(2 * M - 2 * D) - 0.057 * sn(M - 2 * D + Ms) + 0.053 * sn(M + 2 * D);
  lon += 0.046 * sn(2 * D - Ms) + 0.041 * sn(M - Ms) - 0.035 * sn(D) - 0.031 * sn(M + Ms) - 0.015 * sn(2 * F - 2 * D) + 0.011 * sn(M - 4 * D);
  lat += -0.173 * sn(F - 2 * D) - 0.055 * sn(M - F - 2 * D) - 0.046 * sn(M + F - 2 * D) + 0.033 * sn(F + 2 * D) + 0.017 * sn(2 * M + F);
  r += -0.58 * cs(M - 2 * D) - 0.46 * cs(2 * D);
  return { lon: rev(lon), lat, r };
}
function venus(d: number) {
  const [x, y, z] = orbit(76.6799 + 2.4659e-5 * d, 3.3946 + 2.75e-8 * d, 54.891 + 1.38374e-5 * d, 0.72333, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d);
  const s = sun(d), X = x + s.r * Math.cos(s.lon * R), Y = y + s.r * Math.sin(s.lon * R);
  return { lon: rev(Math.atan2(Y, X) / R), lat: Math.atan2(z, Math.hypot(X, Y)) / R };
}
function toEq(lon: number, lat: number, d: number): Eq {
  const e = (23.4393 - 3.563e-7 * d) * R, x = Math.cos(lat * R) * Math.cos(lon * R), y = Math.cos(lat * R) * Math.sin(lon * R), z = Math.sin(lat * R);
  const ye = y * Math.cos(e) - z * Math.sin(e), ze = y * Math.sin(e) + z * Math.cos(e);
  return { ra: rev(Math.atan2(ye, x) / R), dec: Math.atan2(ze, Math.hypot(x, ye)) / R };
}
function toHor({ ra, dec }: Eq, lst: number): Hor {
  const h = (lst - ra) * R, dr = dec * R, p = LAT * R, x = Math.cos(h) * Math.cos(dr), y = Math.sin(h) * Math.cos(dr), z = Math.sin(dr);
  const xh = x * Math.sin(p) - z * Math.cos(p), zh = x * Math.cos(p) + z * Math.sin(p);
  return { az: rev(Math.atan2(y, xh) / R + 180), alt: Math.atan2(zh, Math.hypot(xh, y)) / R };
}
const sepDeg = (a: Eq, b: Eq) => Math.acos(Math.min(1, Math.sin(a.dec * R) * Math.sin(b.dec * R) + Math.cos(a.dec * R) * Math.cos(b.dec * R) * Math.cos((a.ra - b.ra) * R))) / R;

/** The five bright stars of the Hyades' V (γ, δ¹, ε, θ², α Tauri), catalogue positions for 2000 in degrees, drawn as ε–δ–γ–θ–α. */
export const HYADES: [number, number][] = [
  [(28 / 60 + 37 / 3600 + 4) * 15, 19 + 10 / 60 + 49.6 / 3600],
  [(22 / 60 + 56.09 / 3600 + 4) * 15, 17 + 32 / 60 + 33 / 3600],
  [(19 / 60 + 47.6 / 3600 + 4) * 15, 15 + 37 / 60 + 39.5 / 3600],
  [(28 / 60 + 39.74 / 3600 + 4) * 15, 15 + 52 / 60 + 15.1 / 3600],
  [(35 / 60 + 55.24 / 3600 + 4) * 15, 16 + 30 / 60 + 33.5 / 3600],
];
function starEq([ra, dec]: [number, number], d: number) {
  const e = 23.4393 * R, x = Math.cos(dec * R) * Math.cos(ra * R), y = Math.cos(dec * R) * Math.sin(ra * R), z = Math.sin(dec * R);
  // ecliptic coordinates, moved back by the precession of the equinoxes (about 1.397° a century) to the date
  const lon = Math.atan2(y * Math.cos(e) + z * Math.sin(e), x) / R + (1.396971 * d) / 36525, lat = Math.asin(-y * Math.sin(e) + z * Math.cos(e)) / R;
  return toEq(lon, lat, d);
}

/**
 * The sky over Saint-Rémy at `hrs` local mean time on a day of 1889, from a standard low-precision method (Paul
 * Schlyter's orbital elements, the Moon's main perturbations and its parallax). Good to a fraction of a degree.
 */
export function skyAt(month: number, day: number, hrs = HOUR, year = 1889): Sky {
  const ut = hrs - LON / 15, d = julianDay(year, month, day) - 2451543.5 + ut / 24, s = sun(d), lst = s.L + 180 + ut * 15 + LON;
  const me = moon(d), mEq = toEq(me.lon, me.lat, d), sEq = toEq(s.lon, 0, d), v = venus(d), vEq = toEq(v.lon, v.lat, d);
  const par = Math.asin(1 / me.r) / R, ha = rev(lst - mEq.ra), g = Math.atan(Math.tan(LAT * R) / Math.cos(ha * R)) / R;
  const topo = {
    ra: mEq.ra - (par * Math.cos(LAT * R) * Math.sin(ha * R)) / Math.cos(mEq.dec * R),
    dec: mEq.dec - (par * Math.sin(LAT * R) * Math.sin((g - mEq.dec) * R)) / Math.sin(g * R),
  };
  return {
    moon: toHor(topo, lst),
    venus: toHor(vEq, lst),
    sun: toHor(sEq, lst),
    sep: sepDeg(topo, vEq),
    lit: (1 - Math.cos(sepDeg(topo, sEq) * R)) / 2,
    hyades: HYADES.map((c) => toHor(starEq(c, d), lst)),
  };
}

/** As in the painting: the Moon above Venus, both risen, and both inside the narrow frame held level with the horizon. */
export function fits(s: Sky) {
  const wide = Math.abs(s.moon.az - s.venus.az) * Math.cos(((s.moon.alt + s.venus.alt) / 2) * R), high = s.moon.alt - s.venus.alt;
  return s.moon.alt > 3 && s.venus.alt > 3 && high > 0 && wide <= FRAME.w + FRAME.dw && high <= FRAME.h + FRAME.dh;
}

/** The 61 dawns of June and July 1889: index 0 is 1 June, 30 is 1 July. */
export const dawnDate = (i: number) => (i < 30 ? { month: 6, day: i + 1 } : { month: 7, day: i - 29 });
export const DAWNS = Array.from({ length: 61 }, (_, i) => skyAt(dawnDate(i).month, dawnDate(i).day));

const MOON = '#f6c945', VENUS = '#f3f6ff', GOLD = '#f4d35e', CORAL = '#ff9a76', MINT = '#8be3c6';
const AZ0 = 60, AZ1 = 112;

const dateLabel = (m: number, d: number) => (m === 6 ? t('{d} June 1889', { d }) : t('{d} July 1889', { d }));

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** The area two boxes share. */
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
/** Centres for a `tw` × `th` label around box `a`, with their distance from it: nearest first, on the sides in the order given, each also slid to either end of that side. */
const beside = (a: Box, sides: ('above' | 'below' | 'left' | 'right')[]) => (tw: number, th: number) =>
  [1, 5, 10, 16, 23, 31].flatMap((d) =>
    sides.flatMap((side) =>
      [0, -1, 1].map((m): [number, number, number] => {
        const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
        if (side === 'above' || side === 'below') return [cx + (m * (tw - a.w)) / 2, side === 'below' ? a.y + a.h + d + th / 2 : a.y - d - th / 2, d];
        return [side === 'right' ? a.x + a.w + d + tw / 2 : a.x - d - tw / 2, cy + (m * (th + a.h)) / 2, d];
      }),
    ),
  );

export default function StarryNightDawnSky({ onDone }: LabProps) {
  const [i, setI] = useState(18);
  const s = DAWNS[i], { month, day } = dawnDate(i), ok = fits(s);
  useGoal(ok, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // degrees to pixels: fit 52° of azimuth across and 28° of altitude up, whichever is tighter
    const x0 = 6, x1 = w - 6, yH = h - 22, k = Math.min((x1 - x0) / (AZ1 - AZ0), (yH - 8) / 28), mid = (AZ0 + AZ1) / 2;
    const X = (p: Hor) => (x0 + x1) / 2 + (p.az - mid) * Math.cos(p.alt * R) * k, Y = (p: Hor) => yH - p.alt * k;
    // everything drawn in the sky, and each label once placed: a new label keeps clear of all of it
    const taken: Box[] = [];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    font(ctx, 9);
    for (const alt of [10, 20, 30]) {
      line(ctx, x0, Y({ az: 0, alt }), x1, Y({ az: 0, alt }), C.line, 1);
      label(ctx, `${alt}°`, x0 + 2, Y({ az: 0, alt }) - 7, { size: 9, align: 'left', color: C.faint });
      taken.push({ x: x0, y: Y({ az: 0, alt }) - 13, w: ctx.measureText(`${alt}°`).width + 6, h: 12 });
    }
    ctx.fillStyle = '#0a1638';
    ctx.fillRect(0, yH, w, h - yH);
    line(ctx, 0, yH, w, yH, C.faint, 1.5);
    label(ctx, t('east'), X({ az: 90, alt: 0 }), yH + 11, { size: 10, color: C.soft });
    // the Hyades' V, once it has risen
    const up = s.hyades.filter((p) => p.alt > 0.5), hyades = up.length === s.hyades.length;
    if (hyades) {
      ctx.strokeStyle = 'rgba(139,227,198,0.5)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      s.hyades.forEach((p, j) => (j ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    s.hyades.forEach((p, j) => p.alt > 0.5 && dot(ctx, X(p), Y(p), j === 4 ? 2.6 : 1.8, j === 4 ? '#ffd1a8' : C.ink));
    const hx = up.map(X), hy = up.map(Y), stars = { x: Math.min(...hx) - 4, y: Math.min(...hy) - 4, w: Math.max(...hx) - Math.min(...hx) + 8, h: Math.max(...hy) - Math.min(...hy) + 8 };
    if (up.length) taken.push(stars);
    // the narrow frame, centred between the Moon and Venus; a label may sit inside it but not on its edges
    const fx = (X(s.moon) + X(s.venus)) / 2, fy = (Y(s.moon) + Y(s.venus)) / 2;
    if (s.moon.alt > -5 && s.sep < 40) {
      const fl = fx - (FRAME.w * k) / 2, ft = fy - (FRAME.h * k) / 2, fw = FRAME.w * k, fh = FRAME.h * k;
      ctx.strokeStyle = ok ? GOLD : CORAL;
      ctx.lineWidth = 2;
      ctx.strokeRect(fl, ft, fw, fh);
      taken.push({ x: fl - 2, y: ft - 2, w: fw + 4, h: 4 }, { x: fl - 2, y: ft + fh - 2, w: fw + 4, h: 4 }, { x: fl - 2, y: ft - 2, w: 4, h: fh + 4 }, { x: fl + fw - 2, y: ft - 2, w: 4, h: fh + 4 });
    }
    // Venus
    const vx = X(s.venus), vy = Y(s.venus), venus = { x: vx - 5, y: vy - 5, w: 10, h: 10 };
    dot(ctx, vx, vy, 4, VENUS);
    taken.push(venus);
    // the Moon, drawn three times its size, lit on the side towards the Sun
    const mx = X(s.moon), my = Y(s.moon), r = 7.5, moonBox = { x: mx - r - 1, y: my - r - 1, w: 2 * r + 2, h: 2 * r + 2 };
    if (s.moon.alt > 0) {
      const ang = Math.atan2(Y(s.sun) - my, X(s.sun) - mx), rx = r * (1 - 2 * s.lit);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(160,170,200,0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = MOON;
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
      if (rx >= 0) ctx.ellipse(0, 0, Math.max(0.01, rx), r, 0, Math.PI / 2, -Math.PI / 2, true);
      else ctx.ellipse(0, 0, -rx, r, 0, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.fill();
      ctx.restore();
      taken.push(moonBox);
    }
    // the labels, each at the first spot near its object that stays in the sky and clear of everything else: the
    // ones pinned to an edge of the stage first, then Venus's, the Moon's and the Hyades'
    const sky = { x: 2, y: 2, w: w - 4, h: yH - 4 };
    const put = (texts: string[], color: string, spots: (tw: number, th: number) => [number, number, number][]) => {
      // a spot right by the object for the full text, else for the short one, else any spot, else the least crowded
      let best = { text: texts[0], box: sky, hit: Infinity };
      for (const near of [true, false])
        for (const text of texts) {
          font(ctx, 10);
          const tw = ctx.measureText(text).width + 4, th = 12;
          for (const [cx, cy, d] of spots(tw, th)) {
            if (near && d > 10) continue;
            const box = { x: clamp(cx - tw / 2, sky.x, sky.x + sky.w - tw), y: clamp(cy - th / 2, sky.y, sky.y + sky.h - th), w: tw, h: th };
            const hit = taken.reduce((sum, o) => sum + overlap(box, o), 0);
            if (hit < best.hit) best = { text, box, hit };
            if (!hit) {
              taken.push(box);
              label(ctx, text, box.x + tw / 2, box.y + th / 2, { size: 10, color });
              return;
            }
          }
        }
      taken.push(best.box);
      label(ctx, best.text, best.box.x + best.box.w / 2, best.box.y + best.box.h / 2, { size: 10, color });
    };
    // spots along the top of the stage, nearest to (x, y) first
    const along = (x: number, y: number) => (tw: number, th: number) =>
      [0, 1, 2, 3]
        .flatMap((row) => [0, -0.5, 0.5, -1, 1].map((m) => ({ m, row, d: Math.hypot(m * tw, row * (th + 2)) })))
        .sort((a, b) => a.d - b.d)
        .map(({ m, row }): [number, number, number] => [x + m * tw, y + th / 2 + row * (th + 2), 0]);
    const shown = s.moon.alt > 0 && mx <= w - 4 && my >= 0;
    if (s.moon.alt <= 0) put([t('The Moon has not risen')], C.soft, along(w / 2, 4));
    else if (mx > w - 4) {
      const ym = clamp(my, 8, yH - 8);
      put([t('The Moon is further south →')], MOON, (tw, th) => [0, -1, 1, -2, 2, -3, 3].map((m) => [w - 4 - tw / 2, ym + m * (th + 2), 0]));
    } else if (!shown) put([t('The Moon is higher ↑')], MOON, along(mx, 4));
    // where the sky is crowded, Venus and the Moon go by their names alone (the planet's is the same in German)
    put([t('Venus, the morning star'), 'Venus'], VENUS, beside(venus, ['below', 'above', 'right', 'left']));
    if (shown) put([t('Moon, drawn larger'), t('Moon')], MOON, beside(moonBox, ['above', 'below', 'left', 'right']));
    if (hyades) put([t('the Hyades')], MINT, beside(stars, ['left', 'above', 'below', 'right']));
    ctx.restore();
  };

  const date = dateLabel(month, day);
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('The eastern sky over Saint-Rémy at 3 a.m. on {date}: the Moon {lit}% lit, {sep}° from Venus', {
          date,
          lit: formatNumber(Math.round(s.lit * 100)),
          sep: formatNumber(Math.round(s.sep)),
        })}
      />
      <Range label={t('Dawn in 1889')} value={i} min={0} max={60} step={1} onChange={setI} format={(v) => dateLabel(dawnDate(v).month, dawnDate(v).day)} />
      <Readouts
        items={[
          { label: t('Moon lit'), value: s.moon.alt > 0 ? withUnit(Math.round(s.lit * 100), '%') : '–' },
          { label: t('Moon to Venus'), value: withUnit(Math.round(s.sep), '°') },
          { label: t('As in the painting?'), value: ok ? t('Yes, it fits') : t('Not as painted'), tone: ok ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">
        {t('Simplified: positions from a standard low-precision method, at 3 a.m. local time; the frame is the 2026 paper’s 14.8° × 10.9°, kept level with the horizon; the Moon is drawn larger.')}
      </p>
    </div>
  );
}
