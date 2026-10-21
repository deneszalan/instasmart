// Explainer for space-mars-retrograde-loop: Mars loops backwards against the stars when Earth overtakes it.
// Look: deep space. Near-black blue with a fine, seeded star field; Mars rust-red, Earth blue, a warm
// Sun; thin luminous orbit lines with a soft glow; Outfit, a geometric sans, for everything.
//
// The model, computed below: circular orbits around the Sun with the real periods (Earth 365.25 days,
// Mars 687 days); Mars's orbit radius follows from Kepler's third law, (687 / 365.25)^(2/3) = 1.524 AU;
// Mars's orbit is tilted 1.85 degrees to Earth's (Wikipedia "Mars", infobox), which gives the sky track its
// height (the apparent latitude); the sky panel uses the same degrees-to-pixels scale in both directions.
// From the model: the synodic period 1 / (1/365.25 - 1/687) = 779.9 days; the backward stretch, found
// from where the apparent longitude stops and turns, lasts 72.8 days (the counter shows whole days).
//
// Facts (Wikipedia, "Apparent retrograde motion", "Mars", "Deferent and epicycle"): Mars's orbital period
// 687 days; synodic period 780 days (25.6 months); about 72 days in retrogradation, centred on opposition;
// planets normally drift east against the stars and in retrograde move west; Earth, on the shorter orbit,
// overtakes the outer planet "like a faster car"; Ptolemy's Earth-centred model explained retrograde
// motion with a planet on an epicycle moving along a deferent; for the outer planets the epicycle arm
// stays parallel to the Earth-Sun line; Copernicus's Sun-centred model explained retrograde motion.
//
// Scene plan (cue times come from the caption list; each caption lasts 0.3 s per word + 1 s at least):
//  A  hook      a large sky panel: Mars traces its loop against the stars, a day counter runs
//  B  above     the panel slides down; the top-down diagram (Sun, Earth, Mars, orbits) appears
//  C  why       time runs: the sight line from Earth through Mars to the stars, a fan of past sight
//               lines, the sky track drawn as it happens; Earth catches up, the line swings back
//               (retrograde), opposition, then forward again; a counter of retrograde days
//  D  again     fast-forward to the next opposition, 780 days later, marked on Mars's orbit; the sky
//               panel crossfades to that part of the sky
//  E  payoff    the frame slides to Earth: an Earth-centred view where Mars rides an epicycle along a
//               deferent (the same vectors: deferent = Sun-to-Mars, epicycle arm = Earth-to-Sun) while
//               the second loop forms in the sky; then back to the Sun-centred view
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  ink: '#EEF2FF', soft: 'rgba(214,224,255,0.70)', faint: 'rgba(190,205,255,0.28)',
  mars: '#E0582C', marsLight: '#FF8A5C', marsOrbit: 'rgba(240,120,74,0.60)',
  earth: '#3F8CFF', earthLight: '#8DBBFF', earthOrbit: 'rgba(96,160,255,0.62)',
  sun: '#FFD27A',
};
const F = 'Outfit';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const rrect = (...a) => k.rrect(...a);

// ---------- the model ----------
const PE = 365.25, PM = 687;                      // days
const AM = Math.pow(PM / PE, 2 / 3);              // Mars's orbit radius, AU (Kepler's third law)
const INC = 1.85 * DEG;                           // tilt of Mars's orbit to Earth's
const U0 = 80 * DEG;                              // where Mars is along its tilted orbit at the first opposition
const SYN = 1 / (1 / PE - 1 / PM);                // 779.9 days between oppositions
// Day 0 of the simulation (d = 0) is an opposition, with both planets straight "up" from the Sun.
function earthAt(d) { const a = Math.PI / 2 + TAU * d / PE; return [Math.cos(a), Math.sin(a), 0]; }
function marsAt(d) {
  const u = U0 + TAU * d / PM, node = Math.PI / 2 - U0;
  const xo = AM * Math.cos(u), yo = AM * Math.sin(u) * Math.cos(INC), z = AM * Math.sin(u) * Math.sin(INC);
  return [xo * Math.cos(node) - yo * Math.sin(node), xo * Math.sin(node) + yo * Math.cos(node), z];
}
// Apparent position from Earth: longitude (unwrapped) and latitude, degrees, tabulated every 0.25 days.
const TAB = { d0: -200, step: 0.25, lam: [], beta: [] };
{
  let prev = null, off = 0;
  for (let d = TAB.d0; d <= 1800; d += TAB.step) {
    const E = earthAt(d), M = marsAt(d);
    const dx = M[0] - E[0], dy = M[1] - E[1];
    const lam = Math.atan2(dy, dx) / DEG;
    if (prev !== null) { while (lam + off - prev > 180) off -= 360; while (lam + off - prev < -180) off += 360; }
    prev = lam + off;
    TAB.lam.push(prev); TAB.beta.push(Math.atan2(M[2], Math.hypot(dx, dy)) / DEG);
  }
}
function sky(d) {
  const x = (d - TAB.d0) / TAB.step, i = clamp(Math.floor(x), 0, TAB.lam.length - 2), f = x - i;
  return [lerp(TAB.lam[i], TAB.lam[i + 1], f), lerp(TAB.beta[i], TAB.beta[i + 1], f)];
}
// The stationary points around the first opposition: where the longitude stops and turns back.
const STAT = (() => {
  const out = [];
  for (let d = -120; d < 120; d += 0.05) {
    const a = sky(d)[0], b = sky(d + 0.05)[0], c = sky(d + 0.1)[0];
    if ((b - a) * (c - b) < 0) out.push(d + 0.05);
  }
  return out;                                    // about [-36.4, +36.4]
})();
const RETRO_DAYS = STAT[1] - STAT[0];             // 72.8
const DAY0 = 110;                                 // the counter starts 110 days before the opposition
// The two loops shown on the sky panel, each centred on its opposition.
const LOOPS = [0, SYN].map((d0) => {
  let lo = 99, hi = -99;
  for (let d = d0 - 110; d <= d0 + 110; d += 1) { const b = sky(d)[1]; lo = Math.min(lo, b); hi = Math.max(hi, b); }
  return { d0, lamC: sky(d0)[0], betaMid: (lo + hi) / 2 };
});

// ---------- captions ----------
const LINES = [
  ['Every 26 months or so, Mars seems to go *backwards* across the sky.', 0.1],
  ['It slows, loops back, then carries on. ~Why?~', 0.3],
  ['From above: Earth circles the Sun in ~1 year~, Mars in *687 days*.', 0.1],
  ['Follow the line from Earth through Mars out to the *distant stars*.', 0.1],
  ['Mars drifts *east* against the stars, month after month.', 0.1],
  ['As Earth catches up, the sight line swings ~back~: *retrograde*.', 0.1],
  ['At *opposition*, opposite the Sun, Earth ~overtakes~ Mars.', 0.2],
  ['After about *72 days*, Mars heads east again.', 0.2],
  [`Earth laps Mars about every ~${Math.round(SYN)} days~, so the loop comes back.`, 0.1],
  ['Ptolemy kept Earth still: Mars rode a circle on a circle, an *epicycle*.', 0.2],
  ['Copernicus put the ~Sun~ in the middle: the loop is Earth *overtaking* Mars.', 0.1],
  ['Mars never really turns back. ~We~ pass it.', 0.4],
];
const CUES = (() => {
  const out = [];
  let t = 0.4;
  for (const [s, extra] of LINES) {
    const d = 0.3 * s.split(' ').length + 1 + extra;
    out.push([+t.toFixed(2), +(t + d).toFixed(2), s]);
    t += d + 0.1;
  }
  return out;
})();
const at = (i) => CUES[i][0], end = (i) => CUES[i][1];
const DURATION = +(end(CUES.length - 1) + 0.6).toFixed(2);

// ---------- time: which simulated day is shown at time t ----------
/** Piecewise cubic Hermite through keyframes [t, day, slope] (slopes chosen so it never runs backwards). */
function hermite(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, d0, m0] = keys[i], [t1, d1, m1] = keys[i + 1];
    if (t > t1) continue;
    const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * d0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * d1 + (u3 - u2) * h * m1;
  }
  return keys.at(-1)[1];
}
const RATE = 10.3;                                // days per second while the first loop is explained
const KEYS = (() => {
  const tA = at(4), tB = at(8) + 0.2;
  const dB = -85 + RATE * (tB - tA);
  return [[at(3), -110, 0], [tA, -85, RATE], [tB, dB, RATE], [at(8) + 4.0, 660, 30], [at(10), 822, 14], [DURATION, 880, 4]];
})();
const dayAt = (t) => hermite(KEYS, t);
const hookDay = (t) => -110 + 220 * eio(seg(t, 0.6, end(1) - 0.4));

// ---------- star fields, made once ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
function makeBackdrop() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W / 2, 380, 40, W / 2, 460, 900);
  base.addColorStop(0, '#0E1A3E'); base.addColorStop(0.5, '#070E26'); base.addColorStop(1, '#02040C');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = rng(9);
  for (let i = 0; i < 40; i++) {
    const x = rnd() * W, y = rnd() * H, r = 80 + rnd() * 240;
    const tint = rnd() < 0.5 ? '70,100,200' : '150,70,90';
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${tint},${0.015 + rnd() * 0.03})`); gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W, y = rnd() * H, b = Math.pow(rnd(), 3);
    const r = 0.35 + b * 1.3;
    const warm = rnd();
    const col = warm < 0.2 ? '255,220,190' : warm < 0.45 ? '190,210,255' : '235,240,255';
    g.fillStyle = `rgba(${col},${0.25 + 0.7 * b})`;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    if (b > 0.55) {
      const gl = g.createRadialGradient(x, y, 0, x, y, r * 5);
      gl.addColorStop(0, `rgba(${col},0.18)`); gl.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 5, 0, TAU); g.fill();
    }
  }
  return cv;
}
// Stars for the sky panel, at fixed sky positions all round the sky (longitude, latitude).
const SKYSTARS = (() => {
  const rnd = rng(31), out = [];
  for (let i = 0; i < 2600; i++) out.push({ lam: rnd() * 360, beta: -14 + rnd() * 30, b: Math.pow(rnd(), 2.6), tw: rnd() * TAU });
  return out;
})();
let BACKDROP = null;

// ---------- the sky panel ----------
const SKY_PX = 18;                                 // pixels per degree, both directions
const PANEL_HOOK = { y: 236, h: 340 }, PANEL_END = { y: 612, h: 160 };
function panelRect(t) {
  const m = eio(seg(t, at(2) - 0.3, at(2) + 0.9));
  return { x: 40, y: lerp(PANEL_HOOK.y, PANEL_END.y, m), w: 784, h: lerp(PANEL_HOOK.h, PANEL_END.h, m) };
}

function planet(x, y, r, col, glow) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
  g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, TAU); ctx.fill();
  const b = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
  b.addColorStop(0, 'rgba(255,255,255,0.85)'); b.addColorStop(0.25, col); b.addColorStop(1, col);
  ctx.fillStyle = b; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

/** The sky panel: a window onto the stars around one loop; returns its coordinate mapping. */
function drawSky(t, P, { loop, from, to, dot, content = 1, trail = 1 }) {
  const cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  const X = (lam) => cx - (lam - loop.lamC) * SKY_PX, Y = (beta) => cy - (beta - loop.betaMid) * SKY_PX;
  rrect(P.x, P.y, P.w, P.h, 16);
  const bg = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
  bg.addColorStop(0, 'rgba(4,8,22,0.94)'); bg.addColorStop(1, 'rgba(8,14,36,0.94)');
  ctx.fillStyle = bg; ctx.fill();
  ctx.save();
  ctx.shadowColor = 'rgba(120,160,255,0.35)'; ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(150,180,255,0.42)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  ctx.save();
  rrect(P.x, P.y, P.w, P.h, 16); ctx.clip();
  withAlpha(content, () => {
    for (const s of SKYSTARS) {
      const lam = s.lam + 360 * Math.round((loop.lamC - s.lam) / 360);
      const x = X(lam), y = Y(s.beta);
      if (x < P.x - 4 || x > P.x + P.w + 4 || y < P.y - 4 || y > P.y + P.h + 4) continue;
      const tw = 0.85 + 0.15 * Math.sin(t * 1.3 + s.tw);
      ctx.fillStyle = `rgba(230,236,255,${(0.25 + 0.7 * s.b) * tw})`;
      ctx.beginPath(); ctx.arc(x, y, 0.5 + 1.6 * s.b, 0, TAU); ctx.fill();
    }
    if (to > from) {
      withAlpha(trail, () => {
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let d = from; d < to; d += 0.5) { const [l, b] = sky(d); d === from ? ctx.moveTo(X(l), Y(b)) : ctx.lineTo(X(l), Y(b)); }
        const [l1, b1] = sky(to); ctx.lineTo(X(l1), Y(b1));
        ctx.strokeStyle = 'rgba(224,88,44,0.35)'; ctx.lineWidth = 7; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,170,130,0.95)'; ctx.lineWidth = 2.2; ctx.stroke();
        // a dot every 10 days: they bunch up where Mars slows and turns
        for (let d = loop.d0 - 100; d <= to; d += 10) {
          if (d < from) continue;
          const [l, b] = sky(d);
          ctx.fillStyle = 'rgba(255,200,170,0.9)'; ctx.beginPath(); ctx.arc(X(l), Y(b), 2.6, 0, TAU); ctx.fill();
        }
      });
    }
    if (dot > 0) { const [l, b] = sky(to); withAlpha(dot, () => planet(X(l), Y(b), 8, C.mars, 'rgba(240,110,60,0.55)')); }
  });
  ctx.restore();
  return { X, Y };
}

function sunGlyph(x, y, r, a = 1) {
  withAlpha(a, () => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, 'rgba(255,220,140,0.55)'); g.addColorStop(0.4, 'rgba(255,170,80,0.15)'); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
    const c = ctx.createRadialGradient(x, y, 0, x, y, r);
    c.addColorStop(0, '#FFFBEA'); c.addColorStop(0.6, C.sun); c.addColorStop(1, '#FFAE45');
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  });
}

/** A thin glowing circle. */
function orbit(x, y, r, col, a = 1, dash = null) {
  if (a <= 0) return;
  withAlpha(a, () => {
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.strokeStyle = col; ctx.lineWidth = 1.8;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.restore();
  });
}

function chip(s, x, y, { size = 22, weight = 600, color = C.ink, bg = 'rgba(6,11,28,0.86)', border = null, align = 'center' } = {}) {
  font(weight, size);
  const w = ctx.measureText(s).width + 24, h = size + 14;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  rrect(x0, y - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke(); }
  text(s, x0 + w / 2, y + 1, { color, align: 'center', base: 'middle' });
}

// ---------- the top-down diagram ----------
// The frame slides from the Sun (s = 0) to Earth (s = 1); the Earth-centred view sits lower right, so the
// epicycle, which reaches 2.5 AU from Earth towards the second opposition, stays in view.
const FRAME = { sun: [432, 380], earth: [566, 470], sc: [120, 104] };
function toScreen(P, d, s) {
  const E = earthAt(d), o = [lerp(FRAME.sun[0], FRAME.earth[0], s), lerp(FRAME.sun[1], FRAME.earth[1], s)];
  const sc = lerp(FRAME.sc[0], FRAME.sc[1], s);
  return [o[0] + (P[0] - s * E[0]) * sc, o[1] - (P[1] - s * E[1]) * sc];
}

/** A line from a through b, extended to length len from a, fading out at the far end. */
function sightLine(a, b, len, alpha, width = 2) {
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
  const ex = a[0] + (dx / n) * len, ey = a[1] + (dy / n) * len;
  const g = ctx.createLinearGradient(a[0], a[1], ex, ey);
  g.addColorStop(0, `rgba(255,236,206,${0.95 * alpha})`); g.addColorStop(0.55, `rgba(255,236,206,${0.75 * alpha})`); g.addColorStop(1, 'rgba(255,236,206,0)');
  ctx.strokeStyle = g; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, ey); ctx.stroke();
}

const geoMix = (t) => eio(seg(t, at(9) - 0.2, at(9) + 1.3)) * (1 - eio(seg(t, at(10) - 0.1, at(10) + 1.6)));

function diagram(t, a) {
  const d = dayAt(t), s = geoMix(t);
  const sc = lerp(FRAME.sc[0], FRAME.sc[1], s);
  const E = earthAt(d), M = marsAt(d);
  const sunP = toScreen([0, 0], d, s), eP = toScreen(E, d, s), mP = toScreen(M, d, s);
  withAlpha(a, () => {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 120, W, 476); ctx.clip();   // long lines never reach the sky panel
    // Sun-centred orbits, fading as the frame moves to Earth
    orbit(sunP[0], sunP[1], 1 * sc, C.earthOrbit, (1 - s) * eout(seg(t, at(2) + 0.2, at(2) + 1.0)));
    orbit(sunP[0], sunP[1], AM * sc, C.marsOrbit, (1 - s) * eout(seg(t, at(2) + 0.4, at(2) + 1.2)));
    // Earth-centred construction: the Sun's path round Earth, the deferent, the epicycle and its arm
    if (s > 0.01) {
      withAlpha(s, () => {
        orbit(eP[0], eP[1], 1 * sc, 'rgba(255,210,122,0.40)', 1, [4, 7]);
        orbit(eP[0], eP[1], AM * sc, C.marsOrbit, 1, [10, 8]);
        const cE = [eP[0] + M[0] * sc, eP[1] - M[1] * sc];          // epicycle centre: Earth + (Mars - Sun)
        orbit(cE[0], cE[1], 1 * sc, 'rgba(255,170,130,0.85)', 1);
        ctx.strokeStyle = 'rgba(255,170,130,0.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(eP[0], eP[1]); ctx.lineTo(cE[0], cE[1]); ctx.lineTo(mP[0], mP[1]); ctx.stroke();
        ctx.fillStyle = 'rgba(255,170,130,0.95)'; ctx.beginPath(); ctx.arc(cE[0], cE[1], 4, 0, TAU); ctx.fill();
        withAlpha(seg(t, at(9) + 0.9, at(9) + 1.5), () => {
          chip('deferent', eP[0] + AM * sc * 0.80, eP[1] - AM * sc * 0.60, { size: 22, color: C.marsLight });
          const ux = (cE[0] - eP[0]) / (AM * sc), uy = (cE[1] - eP[1]) / (AM * sc);
          chip('epicycle', cE[0] + ux * (sc + 8) - uy * 70, cE[1] + uy * (sc + 8) + ux * 70, { size: 22, color: C.marsLight });
        });
      });
    }
    // oppositions on Mars's orbit (scene D): the first, and the next one SYN days later
    const oppA = span(t, at(8) - 0.1, at(9) + 0.3, 0.5, 0.5) * (1 - s);
    if (oppA > 0) {
      withAlpha(oppA, () => {
        [0, SYN].forEach((dd, i) => {
          const P = marsAt(dd), q = toScreen(P, d, 0), ang = Math.atan2(P[1], P[0]);
          const ux = Math.cos(ang), uy = -Math.sin(ang);
          ctx.strokeStyle = C.marsLight; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(q[0] - ux * 8, q[1] - uy * 8); ctx.lineTo(q[0] + ux * 20, q[1] + uy * 20); ctx.stroke();
          withAlpha(seg(t, at(8) + 0.4 + i * 1.8, at(8) + 0.9 + i * 1.8), () => {
            chip(`opposition · day ${fmt(DAY0 + dd)}`, q[0] + ux * 40 + (i ? -70 : 96), q[1] + uy * 40 + (i ? 0 : 18), { size: 22, color: C.marsLight, border: 'rgba(255,138,92,0.5)' });
          });
        });
      });
    }
    // sight lines: a fan of earlier ones, every 10 days, then the current one
    const fan = span(t, at(3) + 0.8, at(8) + 0.6, 0.6, 0.6) * (1 - s);
    if (fan > 0) {
      for (let dd = -100; dd <= Math.min(d, 110); dd += 10) {
        withAlpha(fan * 0.22, () => sightLine(toScreen(earthAt(dd), d, 0), toScreen(marsAt(dd), d, 0), 460, 1, 1.4));
      }
    }
    withAlpha(span(t, at(3) + 0.3, DURATION, 0.6, 0.01), () => sightLine(eP, mP, lerp(460, 420, s), 1, 2.6));
    // Mars's path relative to Earth in the Earth-centred view
    const trailA = s * seg(t, at(9), at(9) + 0.8);
    if (trailA > 0 && d > 662) {
      ctx.beginPath();
      for (let dd = 660; dd < d; dd += 1.5) { const q = toScreen(marsAt(dd), dd, s); dd === 660 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); }
      ctx.lineTo(mP[0], mP[1]);
      withAlpha(trailA, () => { ctx.strokeStyle = 'rgba(255,170,130,0.8)'; ctx.lineWidth = 2; ctx.stroke(); });
    }
    // the Sun, Earth and Mars, with names
    sunGlyph(sunP[0], sunP[1], 15, eout(seg(t, at(2) - 0.1, at(2) + 0.6)));
    withAlpha(eout(seg(t, at(2) + 0.1, at(2) + 0.8)), () => {
      planet(eP[0], eP[1], 8, C.earth, 'rgba(90,150,255,0.6)');
      planet(mP[0], mP[1], 7, C.mars, 'rgba(240,110,60,0.6)');
      font(600, 22);
      const away = (p, from, r) => { const dx = p[0] - from[0], dy = p[1] - from[1], n = Math.hypot(dx, dy) || 1; return [dx / n * r, dy / n * r]; };
      text('Sun', sunP[0], sunP[1] + 38, { color: C.sun, align: 'center', base: 'middle' });
      // names sit away from the Sun; in the Earth-centred view, beside the sight line instead of on it
      const helioE = away(eP, sunP, 26), helioM = away(mP, sunP, 26);
      const v = away(mP, eP, 1), cE = [eP[0] + M[0] * sc, eP[1] - M[1] * sc];
      let n = [-v[1], v[0]];
      if (n[0] * (cE[0] - mP[0]) + n[1] * (cE[1] - mP[1]) > 0) n = [-n[0], -n[1]];
      const oe = s > 0.5 ? [16, 24] : helioE, om = s > 0.5 ? [n[0] * 24, n[1] * 24] : helioM;
      text('Earth', eP[0] + oe[0], eP[1] + oe[1], { color: C.earthLight, base: 'middle', align: oe[0] < 0 ? 'right' : 'left' });
      text('Mars', mP[0] + om[0], mP[1] + om[1], { color: C.marsLight, base: 'middle', align: om[0] < 0 ? 'right' : 'left' });
    });
    // orbit periods (scene B)
    withAlpha(span(t, at(2) + 0.8, at(3) + 1.0, 0.5, 0.6), () => {
      chip('Earth: 1 year', FRAME.sun[0] + 148 * Math.cos(40 * DEG), FRAME.sun[1] + 148 * Math.sin(40 * DEG), { size: 22, color: C.earthLight });
      chip('Mars: 687 days', FRAME.sun[0] - AM * 120 * 0.62, FRAME.sun[1] + AM * 120 * 0.80, { size: 22, color: C.marsLight });
    });
    // opposition: Sun, Earth and Mars in line
    const opp = span(t, at(6) - 0.2, end(6) + 0.2, 0.4, 0.5) * (1 - s);
    if (opp > 0) {
      withAlpha(opp, () => {
        ctx.setLineDash([5, 7]); ctx.strokeStyle = 'rgba(255,210,122,0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sunP[0], sunP[1]); ctx.lineTo(mP[0], mP[1]); ctx.stroke(); ctx.setLineDash([]);
        chip('opposition: Sun, Earth, Mars in line', eP[0] + 18, eP[1] + 34, { size: 22, color: C.sun, border: 'rgba(255,210,122,0.6)', align: 'left' });
      });
    }
    ctx.restore();
    // what kind of view this is
    withAlpha(eout(seg(t, at(2) + 0.6, at(2) + 1.2)), () => {
      font(600, 22);
      withAlpha(1 - seg(s, 0, 0.45), () => text('TOP VIEW · DIAGRAM, NOT TO SCALE', 56, 590, { color: C.soft, spacing: '2px' }));
      withAlpha(seg(s, 0.55, 1), () => text('EARTH-CENTRED VIEW · SIMPLIFIED', 56, 590, { color: C.soft, spacing: '2px' }));
    });
    // who drew it this way
    withAlpha(span(t, at(9), at(10) + 0.2, 0.5, 0.4), () => chip('PTOLEMY: EARTH AT THE CENTRE', W - 56, 172, { size: 22, color: C.marsLight, border: 'rgba(255,138,92,0.55)', align: 'right' }));
    withAlpha(span(t, at(10) + 0.3, DURATION, 0.5, 0.01), () => chip('COPERNICUS: SUN AT THE CENTRE', W - 56, 172, { size: 22, color: C.sun, border: 'rgba(255,210,122,0.6)', align: 'right' }));
  });
}

// ---------- counters ----------
function counter(d, a) {
  withAlpha(a, () => {
    const day = Math.max(0, Math.floor(d + DAY0 + 1e-6));
    font(700, 36); text(`DAY ${fmt(day)}`, 56, 172, { color: C.ink, spacing: '2px' });
    const back = sky(d + 0.25)[0] - sky(d - 0.25)[0] < 0;
    font(600, 22);
    text(back ? 'Mars moving backwards (west)' : 'Mars moving east', 56, 204, { color: back ? C.marsLight : C.soft });
  });
}
function retroCounter(d, a) {
  if (a <= 0 || d < STAT[0]) return;
  const days = Math.min(Math.floor(d - STAT[0]), Math.floor(RETRO_DAYS));
  withAlpha(a, () => chip(`backwards for ${days} days`, W - 56, 172, { size: 24, color: C.marsLight, border: 'rgba(255,138,92,0.55)', align: 'right' }));
}

// ---------- layers ----------
function background(t) {
  if (!BACKDROP) BACKDROP = makeBackdrop();
  ctx.drawImage(BACKDROP, 0, 0);
  withAlpha(eout(seg(t, 0, 0.8)), () => {
    font(800, 22); text('RECKON', 56, 82, { spacing: '5px' });
    const w = ctx.measureText('RECKON').width + 5 * 6;
    font(500, 22); text('SPACE · MARS', 56 + w + 18, 82, { color: C.soft, spacing: '3px' });
  });
}

function skyLayer(t) {
  const P = panelRect(t);
  const inHook = t < at(2) + 0.2;
  const dSim = dayAt(t);
  // the first loop: in the hook, then again as it is explained; then a crossfade to the second loop
  const sw = at(8) + 1.9;
  const c1 = 1 - seg(t, at(8) + 0.9, at(8) + 1.5), c2 = seg(t, at(8) + 2.4, at(8) + 3.2);
  const loop = t < sw ? LOOPS[0] : LOOPS[1];
  let map;
  if (inHook) {
    const dHook = hookDay(t), fade = 1 - seg(t, at(2) - 0.5, at(2) + 0.1);
    map = drawSky(t, P, { loop, from: -110, to: dHook, dot: eout(seg(t, 0.3, 0.9)) * fade, trail: fade });
    withAlpha(span(t, 0.3, at(2) + 0.1, 0.4, 0.4), () => counter(dHook, 1));
    if (dHook > STAT[0] - 2 && dHook < STAT[1] + 6) {
      const [l, b] = sky(dHook);
      withAlpha(span(dHook, STAT[0] - 2, STAT[1] + 6, 4, 6), () => chip('backwards!', map.X(l), map.Y(b) - 40, { size: 24, color: C.marsLight, border: 'rgba(255,138,92,0.55)' }));
    }
  } else if (t < sw) {
    const runA = seg(t, at(3) - 0.1, at(3) + 0.4), leave = 1 - seg(dSim, 100, 112);
    map = drawSky(t, P, { loop, from: -110, to: Math.min(dSim, 110), dot: runA * leave, trail: runA, content: c1 });
    // the stationary points, labelled as they happen, outside the loop
    for (const [i, label] of [[0, 'turns back'], [1, 'forward again']]) {
      const ds = STAT[i];
      if (dSim < ds) continue;
      const [l, b] = sky(ds), x = map.X(l), y = map.Y(b);
      withAlpha(seg(dSim, ds, ds + 6) * c1, () => {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
        chip(label, x + (i ? 14 : -14), y - 6, { size: 22, color: C.ink, align: i ? 'left' : 'right', border: 'rgba(214,224,255,0.35)' });
      });
    }
  } else {
    const from = SYN - 110;
    map = drawSky(t, P, { loop, from, to: clamp(dSim, from, SYN + 110), dot: c2 * (dSim > from ? 1 : 0), trail: 1, content: c2 });
  }
  // between the two loops
  withAlpha(span(t, at(8) + 1.2, at(8) + 2.9, 0.3, 0.3), () => chip('fast-forward  ▸▸', P.x + P.w / 2, P.y + P.h / 2, { size: 24, color: C.soft }));
  font(600, 22);
  text('THE SKY FROM EARTH  ·  ← east', P.x + 20, P.y + 30, { color: C.soft, spacing: '1px' });
  withAlpha(seg(t, at(2) + 0.4, at(2) + 1.0), () => {
    text('circular orbits · Mars’s tilted 1.85°', P.x + P.w - 20, P.y + P.h - 16, { color: C.soft, align: 'right' });
  });
}

const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(700, 44);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(770);
  let lo = 770 / n - 1, hi = 770;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12;
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 852, maxW: balanced(cue[2]), size: 44, lh: 54, weight: 700, family: F, ink: C.ink, marks: { '*': C.marsLight, '~': C.earthLight } });
  }
  ctx.restore();
}

Kit.scene({
  width: W, height: H, duration: DURATION,
  fonts: [{ family: F, file: 'Outfit.woff2', weight: '100 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    if (t > at(2) - 0.4) diagram(t, eout(seg(t, at(2) - 0.3, at(2) + 0.6)));
    skyLayer(t);
    if (t >= at(3) - 0.2) {
      const d = dayAt(t);
      counter(d, seg(t, at(3) - 0.2, at(3) + 0.4));
      retroCounter(d, span(t, at(5), at(8) + 0.3, 0.3, 0.5));
    }
    withAlpha(seg(t, at(11) + 0.3, at(11) + 0.9), () => {
      font(500, 22); text('Source: Wikipedia, “Apparent retrograde motion”', W - 56, 218, { color: C.soft, align: 'right' });
    });
    captions(t);
  },
});
