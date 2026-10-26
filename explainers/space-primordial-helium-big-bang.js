// Explainer for space-primordial-helium-big-bang: a quarter of the universe's ordinary matter is helium made
// in its first minutes, and in 2026 astronomers measured that share to about 0.5%. Look: the young universe
// as a glowing soup that cools from amber to indigo; neutrons in sky blue, protons in coral, helium nuclei in
// gold. Fraunces (soft old-style display serif) for the big numbers, Jost (geometric sans) for captions.
//
// Facts: Particle Data Group, "Big-Bang Nucleosynthesis" (Fields, Molaro, Sarkar, rev. 2023): at T ~ 1 MeV,
// t ~ 1 s, weak interactions freeze out with n/p ≈ 1/6; free neutrons then β-decay, so n/p ≈ 1/7 by the time
// nuclear reactions begin; photons break up deuterium until T ≈ 0.1 MeV; nearly all neutrons end up in 4He;
// Yp = 2(n/p)/(1 + n/p) ≈ 0.25; the light elements were made by the end of the first three minutes; neutron
// lifetime 879.4 s (so a half-life of 879.4 × ln 2 ≈ 610 s, about 10 minutes); 4He/H ~ 0.08 by number.
// Wikipedia, "Big Bang nucleosynthesis": about 75% hydrogen and 25% helium-4 by mass; fusion stops around
// 20 minutes after the Big Bang. LBT Yp Project IV (Aver et al., arXiv:2601.22238): 54 metal-poor H II
// regions observed with the Large Binocular Telescope, a weighted average of the 15 best gives
// Yp = 0.2458 ± 0.0013 (about 0.5%), in agreement with the BBN prediction 0.2467 ± 0.0002 from Planck's
// baryon density. University of Minnesota release (9 September 2026): five papers in The Astrophysical
// Journal, 130 hours on the LBT, 15 small, distant, "pristine" galaxies, uncertainty three times smaller than
// before. Ohio State News (9 September 2026): roughly 90% of the universe's helium formed in the Big Bang,
// about 10% in stars since. Line wavelengths in the spectrum strip: standard hydrogen Balmer and He I lines.
//
// The particle count is computed: 112 nucleons with n:p = 16:96 (1:6); two neutrons decay, leaving 14:98
// (1:7); 7 helium nuclei take 28 nucleons, 25% of the mass. The "wait longer" curve is the simplest model,
// neutron decay alone from n/p = 1/6 at one second.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: a quarter of ordinary matter is helium, made in the first minutes.
//  B  9.0–32.0  The recipe: 1 neutron per 6 protons; decay; deuterium smashed; 1 per 7; helium-4.
//  C 32.0–41.2  Counting: 28 of 112 in helium, 25%; wait longer, less helium.
//  D 41.2–64.4  The 2026 measurement: pristine galaxies, the LBT, 24.58% against 24.67%; 90% from the Big Bang.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  deep: '#0f0b26', deep2: '#231646', hot: '#ffb04a', ink: '#f6f1ff', soft: 'rgba(246,241,255,0.74)', faint: 'rgba(246,241,255,0.36)',
  n: '#7fd3ff', p: '#ff7f6e', he: '#ffd166', photon: '#fff3b0', panel: 'rgba(12,8,32,0.82)', violet: '#b69cff',
};
const BIG = 'Fraunces', SANS = 'Jost';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const TOTAL = 112, N0 = 16, DECAY = 2, N1 = N0 - DECAY; // 1:6, then 1:7
const HE = N1 / 2, IN_HE = HE * 4, Y = IN_HE / TOTAL; // 7 helium nuclei, 28 nucleons, 25%
const yp = (np) => (2 * np) / (1 + np); // PDG eq. 24.1
const TAU = 879.4; // s, neutron lifetime
const HALF_MIN = Math.round((TAU * Math.LN2) / 60); // 10
/** Helium share if nuclei formed at `sec` seconds: neutron decay alone from n/p = 1/6 at 1 s. */
const helium = (sec) => 2 * (1 / 7) * Math.exp(-(sec - 1) / TAU);
const MEAS = 0.2458, MEAS_ERR = 0.0013, PRED = 0.2467, PRED_ERR = 0.0002;
const pct = (x, d = 2) => `${(x * 100).toFixed(d)}%`;
// visible emission lines (nm): hydrogen Hδ, Hγ, Hβ, Hα and neutral helium
const SPECTRUM = [[410.2, 'H'], [434.0, 'H'], [486.1, 'H'], [656.3, 'H'], [447.1, 'He'], [471.3, 'He'], [501.6, 'He'], [587.6, 'He'], [667.8, 'He'], [706.5, 'He']];

// ---------- the particles ----------
const BOX = { l: 90, r: 774, t: 210, b: 700 };
let seed = 23; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const P = Array.from({ length: TOTAL }, (_, i) => ({
  x: lerp(BOX.l, BOX.r, rnd()), y: lerp(BOX.t, BOX.b, rnd()), ph: rnd() * 6.28, sp: 0.5 + rnd() * 0.7, amp: 14 + rnd() * 18,
  neutron: i < N0, decays: i === 14 ? 14.6 : i === 15 ? 16.0 : null,
}));
// helium nuclei: neutrons 2k and 2k+1 with protons 16+2k and 17+2k, gathered at a cluster centre
const HE_AT = Array.from({ length: HE }, (_, k) => ({ x: 170 + (k % 4) * 175 + (k >= 4 ? 88 : 0), y: k < 4 ? 340 : 520 }));
const heOf = (i) => (i < N1 ? Math.floor(i / 2) : i >= N0 && i < N0 + N1 ? Math.floor((i - N0) / 2) : -1);
const slotIn = (i) => (i < N1 ? i % 2 : 2 + ((i - N0) % 2));
// deuterium attempts that photons break up: [neutron, proton, start]
const TRIES = [[3, 40, 18.6], [7, 61, 19.9], [10, 88, 21.2], [5, 70, 22.4]];
// a grid for counting: 8 rows of 14
const gridPos = (j) => ({ x: 150 + (j % 14) * 44, y: 300 + Math.floor(j / 14) * 44 });

const CUES = [
  [0.4, 4.6, 'About a quarter of all the ordinary matter in the universe is *helium*.'],
  [4.8, 9.0, 'Almost all of it was made in the *first few minutes* after the Big Bang.'],
  [9.2, 13.6, 'One second in, there was about *1 neutron* for every ~6 protons~.'],
  [13.8, 18.2, `Free neutrons decay into protons: half of them in about *${HALF_MIN} minutes*.`],
  [18.4, 22.8, 'But no nuclei yet: the light was hot enough to smash every *deuterium* nucleus.'],
  [23.0, 27.4, 'Within a few minutes it was cool enough. By then: *1 neutron* per ~7 protons~.'],
  [27.6, 32.0, 'Almost every neutron ended up in *helium-4*: two neutrons, two protons.'],
  [32.2, 36.6, `Of these ${TOTAL} particles, *${IN_HE}* end up in helium: ~${Math.round(Y * 100)}%~ of the mass.`],
  [36.8, 41.2, 'Had it waited longer, more neutrons would have decayed first: *less helium*.'],
  [41.4, 45.8, 'Stars make helium too, so astronomers study galaxies with *hardly any* heavier elements.'],
  [46.0, 50.4, 'In 2026, a team at the *Large Binocular Telescope* reported on 15 of the most pristine.'],
  [50.6, 55.0, `Their helium share: *${pct(MEAS)}* of the mass, pinned down to about ~0.5%~.`],
  [55.2, 59.6, `The Big Bang recipe predicts *${pct(PRED)}*. The first minutes still add up.`],
  [59.8, 64.2, 'Of all the helium around today, about *90%* is from the Big Bang, the rest from stars.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * 0.3, H);
  lg.addColorStop(0, C.deep); lg.addColorStop(1, C.deep2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(230,220,255,${0.06 + r() * 0.3})`; const d = r() < 0.9 ? 1.2 : 2.2; g.fillRect(r() * W, r() * H, d, d); }
}
/** The warmth of the young universe: 1 at the start, 0 once it has cooled. */
const heat = (t) => (t < 9 ? 0 : 1 - eio(seg(t, 18.0, 27.0)));
function glow(t) {
  const a = heat(t) * (1 - seg(t, 32.0, 33.0));
  if (a <= 0) return;
  A(a, () => {
    const rg = ctx.createRadialGradient(W / 2, 450, 40, W / 2, 450, 620);
    rg.addColorStop(0, 'rgba(255,190,90,0.55)'); rg.addColorStop(0.6, 'rgba(255,120,60,0.22)'); rg.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  });
}

function ball(x, y, r, color, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, color); g.addColorStop(1, color);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
}

// ---------- A: the hook ----------
function sceneA(t) {
  const a = 1 - seg(t, 8.6, 9.3);
  if (a <= 0) return;
  A(a, () => {
    const cx = W / 2, cy = 430, R = 200;
    const g = eio(seg(t, 0.6, 2.4));
    // ordinary matter by mass: 75% hydrogen, 25% helium
    ctx.lineWidth = 70;
    ctx.strokeStyle = 'rgba(255,127,110,0.85)'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 + Math.PI * 2 * 0.25 * g, -Math.PI / 2 + Math.PI * 2 * g); ctx.stroke();
    ctx.strokeStyle = C.he; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.25 * g); ctx.stroke();
    A(seg(t, 2.0, 2.8), () => {
      font(600, 96, BIG); text('25%', cx, cy - 18, { color: C.he, align: 'center', base: 'middle' });
      font(500, 28); text('helium, by mass', cx, cy + 52, { color: C.ink, align: 'center', base: 'middle' });
      font(500, 24); text('hydrogen ~75%', cx - R - 6, cy + R + 4, { color: C.p, align: 'center', base: 'middle' });
      text('helium ~25%', cx + R + 48, cy - R * 0.62, { color: C.he, align: 'left', base: 'middle' });
    });
    A(span(t, 4.8, 9.0), () => {
      font(600, 30); text('made in the first few minutes', cx, 170, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- B and C: the particles ----------
/** Where particle i sits at time t, and what it looks like. */
function particle(i, t) {
  const q = P[i];
  let x = q.x + Math.sin(t * q.sp + q.ph) * q.amp, y = q.y + Math.cos(t * q.sp * 0.8 + q.ph) * q.amp * 0.7;
  let neutron = q.neutron && !(q.decays && t >= q.decays);
  // deuterium attempts: the neutron and proton meet, then a photon splits them
  for (const [ni, pi, s0] of TRIES) {
    if ((i === ni || i === pi) && t > s0 && t < s0 + 1.2) {
      const other = particle0(i === ni ? pi : ni, s0 + 0.5), meet = { x: (other.x + particle0(i, s0 + 0.5).x) / 2, y: (other.y + particle0(i, s0 + 0.5).y) / 2 };
      const pull = Math.sin(Math.PI * seg(t, s0, s0 + 1.2));
      x = lerp(x, meet.x + (i === ni ? -11 : 11), pull); y = lerp(y, meet.y, pull);
    }
  }
  // helium formation
  const h = heOf(i);
  const gather = eio(seg(t, 28.0, 30.4));
  if (h >= 0 && gather > 0) {
    const c = HE_AT[h], s = slotIn(i), off = [[-11, -11], [11, 11], [11, -11], [-11, 11]][s];
    x = lerp(x, c.x + off[0], gather); y = lerp(y, c.y + off[1], gather);
  }
  // counting grid: helium nucleons first (gold), then hydrogen
  const lay = eio(seg(t, 32.4, 34.2));
  if (lay > 0) {
    const order = h >= 0 ? h * 4 + slotIn(i) : IN_HE + (i < N0 ? i - N1 : i - N0 - N1 + DECAY);
    const g = gridPos(order);
    x = lerp(x, g.x, lay); y = lerp(y, g.y, lay);
  }
  return { x, y, neutron, he: h >= 0 && t > 29.0 };
}
const particle0 = (i, t) => { const q = P[i]; return { x: q.x + Math.sin(t * q.sp + q.ph) * q.amp, y: q.y + Math.cos(t * q.sp * 0.8 + q.ph) * q.amp * 0.7 }; };

function timeline(t, a) {
  A(a, () => {
    // cosmic time, on a log scale from 1 s to 20 min
    const x0 = 110, x1 = 754, y = 140, lx = (s) => lerp(x0, x1, Math.log(s) / Math.log(1200));
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    font(500, 21);
    for (const [s, l] of [[1, '1 s'], [10, '10 s'], [60, '1 min'], [180, '3 min'], [1200, '20 min']]) {
      ctx.fillStyle = C.faint; ctx.fillRect(lx(s) - 1, y - 8, 2, 16);
      text(l, lx(s), y + 28, { color: C.soft, align: 'center', base: 'middle' });
    }
    // where we are
    const now = t < 13.8 ? 1 : t < 23 ? lerp(1, 100, eio(seg(t, 13.8, 22.8))) : t < 27.6 ? lerp(100, 180, eio(seg(t, 23, 26))) : lerp(180, 1200, eio(seg(t, 27.6, 31.6)));
    ctx.fillStyle = C.he; ctx.beginPath(); ctx.arc(lx(now), y, 9, 0, Math.PI * 2); ctx.fill();
    font(600, 22); text('time after the Big Bang', x0, y - 32, { color: C.soft, base: 'middle' });
  });
}
function ratio(t, a) {
  A(a, () => {
    const nN = P.filter((q, i) => particle(i, t).neutron).length;
    const nP = TOTAL - nN;
    ctx.fillStyle = C.panel; k.rrect(W / 2 - 230, 722, 460, 58, 29); ctx.fill();
    const parts = [[`${nN}`, C.n, BIG, 32], [' neutrons  :  ', C.soft, SANS, 24], [`${nP}`, C.p, BIG, 32], [' protons', C.soft, SANS, 24]];
    let wsum = 0;
    for (const [s, , f, z] of parts) { font(600, z, f); wsum += ctx.measureText(s).width; }
    let x = W / 2 - wsum / 2;
    for (const [s, c, f, z] of parts) { font(600, z, f); text(s, x, 752, { color: c, base: 'middle' }); x += ctx.measureText(s).width; }
  });
}
function soup(t) {
  const a = eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 36.4, 37.0));
  if (a <= 0) return;
  A(a, () => {
    timeline(t, 1 - seg(t, 31.8, 32.4));
    // photons zipping about while it is hot
    const ph = heat(t);
    if (ph > 0) A(ph, () => {
      ctx.strokeStyle = C.photon; ctx.lineWidth = 2;
      for (let j = 0; j < 26; j++) {
        const s = j * 97.3, x = BOX.l + ((s * 7.1 + t * 260) % (BOX.r - BOX.l)), y = BOX.t + ((s * 3.7) % (BOX.b - BOX.t));
        ctx.beginPath();
        for (let u = 0; u <= 26; u += 2) { const px = x - u, py = y + Math.sin((u + t * 40) / 3) * 4; u ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      }
    });
    // deuterium attempts flash and break
    for (const [ni, pi, s0] of TRIES) {
      const f = span(t, s0 + 0.45, s0 + 0.95, 0.1, 0.15);
      if (f > 0) {
        const pn = particle(ni, t), pp = particle(pi, t);
        A(f, () => {
          ctx.strokeStyle = C.photon; ctx.lineWidth = 3;
          const mx = (pn.x + pp.x) / 2, my = (pn.y + pp.y) / 2;
          for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.arc(mx, my, 22 + r * 10 + 18 * seg(t, s0 + 0.45, s0 + 0.95), 0, Math.PI * 2); ctx.stroke(); }
        });
      }
    }
    // the particles
    for (let i = 0; i < TOTAL; i++) {
      const p = particle(i, t);
      const flash = P[i].decays ? span(t, P[i].decays - 0.2, P[i].decays + 0.6, 0.1, 0.4) : 0;
      if (flash > 0) A(flash, () => { ctx.strokeStyle = C.n; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 16 + 20 * seg(t, P[i].decays - 0.2, P[i].decays + 0.6), 0, Math.PI * 2); ctx.stroke(); });
      if (P[i].decays && t > P[i].decays && t < P[i].decays + 1.4) {
        const u = seg(t, P[i].decays, P[i].decays + 1.4);
        A(1 - u, () => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p.x + 90 * u, p.y - 60 * u, 4, 0, Math.PI * 2); ctx.fill(); });
      }
      const color = p.neutron ? C.n : C.p;
      ball(p.x, p.y, 11, color);
      if (p.he) A(seg(t, 29.0, 30.0) * (1 - seg(t, 32.4, 33.2)), () => { ctx.strokeStyle = C.he; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, Math.PI * 2); ctx.stroke(); });
    }
    // helium-4 rings
    A(seg(t, 29.4, 30.2) * (1 - seg(t, 32.2, 32.8)), () => {
      for (const c of HE_AT) { ctx.strokeStyle = C.he; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c.x, c.y, 36, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 170, 406, 340, 48, 24); ctx.fill();
      font(600, 26); text('7 helium-4 nuclei', W / 2, 430, { color: C.he, align: 'center', base: 'middle' });
    });
    // labels
    A(span(t, 9.4, 18.2), () => {
      ball(BOX.l + 10, 196, 10, C.n); font(500, 22); text('neutron', BOX.l + 28, 196, { color: C.n, base: 'middle' });
      ball(BOX.l + 150, 196, 10, C.p); text('proton', BOX.l + 168, 196, { color: C.p, base: 'middle' });
    });
    A(span(t, 18.6, 22.8), () => { font(600, 24); text('deuterium = 1 neutron + 1 proton', W / 2, 196, { color: C.photon, align: 'center', base: 'middle' }); });
    ratio(t, eout(seg(t, 9.6, 10.2)) * (1 - seg(t, 32.0, 32.6)));
    // the count
    A(span(t, 33.6, 36.6, 0.5, 0.3), () => {
      ctx.fillStyle = C.he; ctx.globalAlpha *= 0.25; k.rrect(124, 274, 14 * 44 + 8, 2 * 44 + 8, 10); ctx.fill(); ctx.globalAlpha /= 0.25;
      font(600, 30); text(`${IN_HE} in helium`, 130, 250, { color: C.he, base: 'middle' });
      text(`${TOTAL - IN_HE} left as hydrogen`, 130, 680, { color: C.p, base: 'middle' });
      font(600, 64, BIG); text(`${IN_HE} / ${TOTAL} = ${Math.round(Y * 100)}%`, W / 2, 196, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}
function laterCurve(t) {
  const a = span(t, 36.8, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const L = 150, R = 770, T = 220, B = 640, MAX = 0.3;
    const X = (min) => lerp(L, R, min / 20), Yv = (y) => lerp(B, T, y / MAX);
    font(600, 26); text('If nuclei had formed later…', 60, 160, { color: C.he, base: 'middle' });
    ctx.strokeStyle = 'rgba(246,241,255,0.12)'; ctx.lineWidth = 1.5;
    for (const y of [0.1, 0.2, 0.3]) { ctx.beginPath(); ctx.moveTo(L, Yv(y)); ctx.lineTo(R, Yv(y)); ctx.stroke(); }
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(L, T - 10); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    font(500, 22);
    for (const y of [0, 0.1, 0.2, 0.3]) text(`${Math.round(y * 100)}%`, L - 14, Yv(y), { color: C.soft, align: 'right', base: 'middle' });
    for (const m of [0, 5, 10, 15, 20]) text(`${m} min`, X(m), B + 30, { color: C.soft, align: 'center', base: 'middle' });
    text('helium share', L - 10, T - 34, { color: C.soft, base: 'middle' });
    const draw = eio(seg(t, 37.2, 39.4));
    ctx.strokeStyle = C.he; ctx.lineWidth = 5; ctx.beginPath();
    for (let m = 0; m <= 20 * draw; m += 0.1) { const y = helium(Math.max(1, m * 60)); m ? ctx.lineTo(X(m), Yv(y)) : ctx.moveTo(X(m), Yv(y)); }
    ctx.stroke();
    font(500, 22); text('simplest model: only neutron decay counts', R, B + 66, { color: C.soft, align: 'right', base: 'middle' });
    A(seg(t, 39.4, 40.0), () => {
      const m10 = helium(600);
      ctx.fillStyle = C.he; ctx.beginPath(); ctx.arc(X(10), Yv(m10), 8, 0, Math.PI * 2); ctx.fill();
      font(600, 24); text(`after 10 min: about ${Math.round(m10 * 100)}%`, X(10) + 16, Yv(m10) - 26, { color: C.he, base: 'middle' });
    });
  });
}

// ---------- D: the measurement ----------
function galaxies(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a field of small blue dwarf galaxies, the pristine ones ringed
    let s = 41; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      const x = 80 + r() * 700, y = 170 + r() * 300, rr = 6 + r() * 12, rot = r() * 3;
      const pristine = i < 15;
      const g = ctx.createRadialGradient(x, y, 1, x, y, rr * 1.6);
      g.addColorStop(0, pristine ? 'rgba(190,220,255,0.95)' : 'rgba(255,220,180,0.8)'); g.addColorStop(1, 'rgba(120,140,255,0)');
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, 0.6); ctx.translate(-x, -y);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      if (pristine && t > 46.2) A(seg(t, 46.2 + i * 0.08, 46.6 + i * 0.08), () => { ctx.strokeStyle = C.he; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rr + 10, 0, Math.PI * 2); ctx.stroke(); });
    }
    // a spectrum strip with hydrogen and helium lines
    const sx = 110, sw = 644, sy = 520;
    const nm = (w) => sx + ((w - 400) / 320) * sw; // 400–720 nm
    const sg = ctx.createLinearGradient(sx, 0, sx + sw, 0);
    [[400, '#6a3cff'], [450, '#2f6bff'], [490, '#2fd0ff'], [530, '#4dff8a'], [575, '#ffe94d'], [610, '#ff9a3d'], [650, '#ff3d3d'], [720, '#8a1020']].forEach(([w, c]) => sg.addColorStop((w - 400) / 320, c));
    ctx.globalAlpha *= 0.35; ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, 60); ctx.globalAlpha /= 0.35;
    for (const [w, el] of SPECTRUM) {
      const h = el === 'H';
      ctx.fillStyle = h ? C.p : C.he; ctx.fillRect(nm(w) - 2, sy - 4, 4, 68);
      font(600, 20); text(el, nm(w), h ? sy + 84 : sy - 22, { color: h ? C.p : C.he, align: 'center', base: 'middle' });
    }
    font(500, 22); text('glowing gas: hydrogen and helium lines in its light', W / 2, sy + 124, { color: C.soft, align: 'center', base: 'middle' });
    A(span(t, 46.2, 50.4), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 676, 524, 64, 32); ctx.fill();
      font(600, 26); text('15 galaxies · 130 hours on the LBT', W / 2, 708, { color: C.he, align: 'center', base: 'middle' });
    });
  });
}
function result(t) {
  const a = eout(seg(t, 50.6, 51.4)) * (1 - seg(t, 59.4, 60.0));
  if (a <= 0) return;
  A(a, () => {
    const L = 120, R = 744, lo = 0.240, hi = 0.252, y1 = 470, y2 = 610;
    const X = (v) => lerp(L, R, (v - lo) / (hi - lo));
    font(600, 26); text('Primordial helium, share of the mass', W / 2, 160, { color: C.soft, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, 700); ctx.lineTo(R, 700); ctx.stroke();
    font(500, 22);
    for (let v = 0.240; v <= 0.2521; v += 0.004) { ctx.fillStyle = C.faint; ctx.fillRect(X(v) - 1, 692, 2, 16); text(pct(v, 1), X(v), 730, { color: C.soft, align: 'center', base: 'middle' }); }
    const bar = (v, e, y, color, label, g) => {
      ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(X(v - e * g), y); ctx.lineTo(X(v + e * g), y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(v - e * g), y - 16); ctx.lineTo(X(v - e * g), y + 16); ctx.moveTo(X(v + e * g), y - 16); ctx.lineTo(X(v + e * g), y + 16); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(v), y, 12, 0, Math.PI * 2); ctx.fill();
      font(600, 24); text(label, X(v), y - 44, { color, align: 'center', base: 'middle' });
    };
    font(600, 92, BIG);
    const big = t < 55.2 ? pct(MEAS) : pct(PRED);
    A(t < 55.2 ? 1 : seg(t, 55.2, 55.6), () => text(big, W / 2, 300, { color: t < 55.2 ? C.n : C.he, align: 'center', base: 'middle' }));
    bar(MEAS, MEAS_ERR, y1, C.n, `measured, 2026: ${pct(MEAS)} ± ${(MEAS_ERR * 100).toFixed(2)}`, eout(seg(t, 51.0, 52.0)));
    A(seg(t, 55.4, 56.2), () => bar(PRED, PRED_ERR, y2, C.he, `predicted: ${pct(PRED)} ± ${(PRED_ERR * 100).toFixed(2)}`, 1));
  });
}
function ending(t) {
  const a = eout(seg(t, 59.8, 60.6));
  if (a <= 0) return;
  A(a, () => {
    const cx = W / 2, cy = 430, R = 190, g = eio(seg(t, 60.2, 61.8));
    ctx.lineWidth = 64;
    ctx.strokeStyle = C.he; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.9 * g); ctx.stroke();
    ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 + Math.PI * 2 * 0.9 * g, -Math.PI / 2 + Math.PI * 2 * g); ctx.stroke();
    font(600, 84, BIG); text('~90%', cx, cy - 16, { color: C.he, align: 'center', base: 'middle' });
    font(500, 26); text('of today’s helium', cx, cy + 48, { color: C.ink, align: 'center', base: 'middle' });
    text('from the first minutes', cx, cy + 80, { color: C.soft, align: 'center', base: 'middle' });
    A(seg(t, 61.6, 62.2), () => { font(600, 24); text('~10% from stars', cx - R * 0.2 - 120, cy - R - 54, { color: C.violet, align: 'center', base: 'middle' }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [BIG, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    glow(t);
    sceneA(t);
    soup(t);
    laterCurve(t);
    galaxies(t);
    result(t);
    ending(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.he, '~': C.n } });
  },
});
