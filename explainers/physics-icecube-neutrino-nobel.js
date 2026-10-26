// Explainer for physics-icecube-neutrino-nobel: the 2026 Nobel Prize in Physics went to Francis Halzen for
// IceCube, a cubic kilometre of Antarctic ice watched by light sensors. Look: polar night, the ice as a dark
// blue column, strings of pale sensors; Cherenkov light in cyan and hits coloured by arrival time from red
// (early) to purple (late), as in IceCube's own event displays. Saira for labels and numbers, Inter for
// captions.
//
// Computed here: the sensor count (86 strings × 60); the speed of light in ice, c/n with n ≈ 1.31; the
// Cherenkov angle, cos θ = 1/n (about 40°); and the arrival time at every sensor of the slice for a straight
// muon track: t = (l − d/tan θ)/c + n·d/(c·sin θ), for a sensor at distance l along the track and d from it.
// The track and the slice are illustrations; the geometry and timing rule are real.
// Facts: Nobel press release, 6 October 2026: Halzen, "for decisive contributions to the IceCube Neutrino
// Observatory and the discovery of high-energy neutrinos of astrophysical origin"; a cubic kilometre of ice
// with light sensors; finished in 2011. Popular background (nobelprize.org): hot-water drilling; 5,160
// sensors on 86 cables, between 1,450 and 2,450 m deep; bedrock at 2,820 m; ice very clear below 1,400 m;
// a neutrino that hits a nucleus makes a charged particle that emits blue light, and its path gives the
// direction; 2013 first evidence for cosmic neutrinos; neutrinos are not bent by magnetic fields nor stopped
// by dust, so they point back to their source; high-energy neutrinos from the Milky Way in recent years.
// Scientific background (nobelprize.org): 60 sensors per string every 17 m, strings 125 m apart; ice
// refractive index about 1.31; relative photon arrival times give the direction; 0.3° angular resolution
// for tracks at 100 TeV; on 22 September 2017 a muon neutrino from within 0.06° of the flaring blazar
// TXS 0506+056; Milky Way neutrinos first published in 2023; up-going tracks (through the Earth) suppress
// the background of muons from the atmosphere.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the South Pole, a cubic kilometre of ice under the snow.
//  B  9.0–23.0  Strings and sensors go in; zoom into the array; neutrinos pass through untouched.
//  C 23.0–46.0  One event: a neutrino hits a nucleus, the muon outruns light, the Cherenkov cone lights the
//               sensors red to purple, and the timing points back along the track.
//  D 46.0–59.8  Discoveries on a sky map: 2013 from all over the sky, 2017 a blazar, 2023 the Milky Way.
//  E 59.8–64.6  Cosmic rays bend, neutrinos fly straight.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#03070f', ice1: '#071a2c', ice2: '#0b2740', ink: '#e9f4ff', soft: 'rgba(233,244,255,0.70)', faint: 'rgba(233,244,255,0.28)',
  cyan: '#62d8ff', blue: '#2f7dff', amber: '#ffb547', snow: '#dbe7f2', string: 'rgba(160,200,235,0.30)', dom: 'rgba(214,232,255,0.55)',
  red: '#ff4d4d', purple: '#b56cff', panel: 'rgba(3,10,20,0.72)',
};
const LAB = 'Saira', CAP = 'Inter';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the detector, in metres ----------
const STRINGS = 86, PER_STRING = 60, TOP = 1450, SPACING = 17, STRING_GAP = 125, BEDROCK = 2820;
const SENSORS = STRINGS * PER_STRING; // 5,160
const N_ICE = 1.31;
const LIGHT_IN_ICE = 1 / N_ICE; // ≈ 0.763 c
const THETA = Math.acos(1 / N_ICE); // Cherenkov angle, ≈ 40.2°
const FRONT = Math.asin(1 / N_ICE); // the bow wave's angle to the track, ≈ 49.8°
const SLICE = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => i * STRING_GAP); // a slice of 9 strings through the array

// the illustrative event: a muon from a neutrino that came up through the Earth
const VERTEX = { x: -440, d: 2500 }, ANGLE = (36 * Math.PI) / 180, U = { x: Math.cos(ANGLE), z: Math.sin(ANGLE) };
const HITS = [];
for (const sx of SLICE) for (let i = 0; i < PER_STRING; i++) {
  const depth = TOP + i * SPACING, dx = sx - VERTEX.x, dz = VERTEX.d - depth;
  const l = dx * U.x + dz * U.z, dist = Math.abs(dx * U.z - dz * U.x);
  if (dist > 105 || l - dist / Math.tan(THETA) < 0) continue;
  HITS.push({ x: sx, depth, dist, tau: l - dist / Math.tan(THETA) + (N_ICE * dist) / Math.sin(THETA) });
}
const TAU0 = Math.min(...HITS.map((h) => h.tau)), TAU1 = Math.max(...HITS.map((h) => h.tau));
const MU = { start: 24.6, end: 40.4, length: 1750 }; // scene seconds for the flight; metres travelled
const muAt = (t) => ((t - MU.start) / (MU.end - MU.start)) * MU.length;
const hue = (tau) => 0 + ((tau - TAU0) / (TAU1 - TAU0)) * 275;

// ---------- camera: the whole ice sheet, then the instrumented kilometre ----------
const FULL = { d0: 0, y0: 300, s: 0.16 }, ZOOM = { d0: 1360, y0: 120, s: 0.53 };
let cam = FULL;
const camAt = (t) => { const z = eio(seg(t, 13.8, 15.8)); return { d0: lerp(FULL.d0, ZOOM.d0, z), y0: lerp(FULL.y0, ZOOM.y0, z), s: lerp(FULL.s, ZOOM.s, z) }; };
const Yd = (d) => cam.y0 + (d - cam.d0) * cam.s;
const Xm = (m) => W / 2 + m * cam.s;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 6 October 2026, Francis Halzen won the Nobel Prize in Physics for *IceCube*.'],
  [4.8, 9.0, 'It is a *cubic kilometre* of ice at the South Pole, watched by light sensors.'],
  [9.2, 13.6, `Hot water melted *${STRINGS} holes*, and each took a string of *${PER_STRING} sensors*: ${SENSORS.toLocaleString('en-US')} in all.`],
  [13.8, 18.2, `They hang *${TOP.toLocaleString('en-US')}* to *${(TOP + 1000).toLocaleString('en-US')} metres* down, where the ice is dark and very clear.`],
  [18.4, 22.8, 'Neutrinos fly through it, and through the whole Earth, almost always untouched.'],
  [23.0, 27.4, 'Very rarely, one hits an atomic nucleus and makes a charged particle, a *muon*.'],
  [27.6, 32.0, `Light in ice moves at only *${Math.round(LIGHT_IN_ICE * 100)}%* of its speed in a vacuum. The muon goes faster.`],
  [32.2, 36.6, 'So it trails a cone of blue *Cherenkov light*, like the bow wave of a boat.'],
  [36.8, 41.2, 'The sensors catch the flash in turn: ~red first~, ^purple last^.'],
  [41.4, 45.8, 'The timing gives the track’s direction, as finely as *0.3°* for the best tracks.'],
  [46.0, 50.4, 'In 2013 came the first evidence of neutrinos from far beyond the solar system.'],
  [50.6, 55.0, 'In 2017 one came from the direction of a flaring *blazar*, a galaxy aiming a jet at us.'],
  [55.2, 59.6, 'In 2023 IceCube saw high-energy neutrinos from our own galaxy, the *Milky Way*.'],
  [59.8, 64.2, 'Magnetic fields bend charged particles from space. Neutrinos point straight back.'],
];

// ---------- background ----------
let bg = null, sky = null;
function paintBg() {
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.ice1); lg.addColorStop(0.7, C.ice2); lg.addColorStop(1, '#06121f');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { // faint layers in the ice
    const y = r() * H; g.fillStyle = `rgba(120,170,220,${0.012 + r() * 0.02})`; g.fillRect(0, y, W, 1 + r() * 4);
  }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(200,225,255,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1.2, 1.2); }
  sky = document.createElement('canvas'); sky.width = W; sky.height = H;
  const h = sky.getContext('2d');
  const sg = h.createLinearGradient(0, 0, 0, H);
  sg.addColorStop(0, '#02040b'); sg.addColorStop(1, '#070d1f');
  h.fillStyle = sg; h.fillRect(0, 0, W, H);
  for (let i = 0; i < 520; i++) { const a = r(); h.fillStyle = `rgba(230,240,255,${0.15 + a * 0.6})`; h.beginPath(); h.arc(r() * W, r() * H, 0.4 + a * 1.2, 0, Math.PI * 2); h.fill(); }
}

function surface(a) {
  const ys = Yd(0);
  if (ys < -10) return;
  A(a, () => {
    ctx.drawImage(sky, 0, 0, W, Math.max(1, ys), 0, 0, W, Math.max(1, ys));
    const sg = ctx.createLinearGradient(0, ys - 6, 0, ys + 14);
    sg.addColorStop(0, C.snow); sg.addColorStop(1, 'rgba(219,231,242,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, ys - 6, W, 20);
    // the IceCube Lab on the surface, with its two towers
    ctx.fillStyle = '#9fb3c8'; ctx.fillRect(W / 2 - 34, ys - 30, 68, 24); ctx.fillRect(W / 2 - 30, ys - 46, 12, 16); ctx.fillRect(W / 2 + 18, ys - 46, 12, 16);
    font(600, 22); text('IceCube Lab', W / 2 + 50, ys - 22, { color: C.soft, base: 'middle' });
  });
}

function strings(t, grow) {
  const s = cam.s, r = Math.max(1.6, 4.4 * s);
  SLICE.forEach((sx, j) => {
    const g = eout(clamp(grow * 2.2 - j * 0.14));
    if (g <= 0) return;
    const x = Xm(sx), yTop = Yd(0), yEnd = lerp(yTop, Yd(TOP + (PER_STRING - 1) * SPACING), g);
    ctx.strokeStyle = C.string; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, Math.max(-5, yTop)); ctx.lineTo(x, yEnd); ctx.stroke();
    for (let i = 0; i < PER_STRING; i++) {
      const y = Yd(TOP + i * SPACING);
      if (y > yEnd + 0.5) break;
      ctx.fillStyle = C.dom; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  });
}

// ---------- scenes ----------
function sceneIce(t) {
  const a = 1 - seg(t, 45.8, 46.6);
  if (a <= 0) return;
  cam = camAt(t);
  A(a, () => {
    surface(1);
    A(span(t, 0.3, 9.4, 0.6, 0.5), () => {
      font(700, 28); text('NOBEL PRIZE IN PHYSICS 2026', 60, 104, { color: C.amber, base: 'middle', spacing: '2px' });
      font(800, 60); text('Francis Halzen', 60, 162, { color: C.ink, base: 'middle' });
      font(500, 24); text('University of Wisconsin–Madison', 60, 210, { color: C.soft, base: 'middle' });
    });
    // the cubic kilometre
    A(span(t, 4.8, 14.2, 0.6, 0.6), () => {
      const x0 = Xm(-500), x1 = Xm(500), y0 = Yd(TOP), y1 = Yd(TOP + 1000), ox = 46, oy = -34;
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]);
      ctx.strokeRect(x0 + ox, y0 + oy, x1 - x0, y1 - y0);
      for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + ox, py + oy); ctx.stroke(); }
      ctx.setLineDash([]); ctx.lineWidth = 3; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.fillStyle = 'rgba(98,216,255,0.08)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      font(700, 30); text('1 km³ of ice', x1 + ox + 16, (y0 + y1) / 2, { color: C.cyan, base: 'middle' });
    });
    // depth scale on the left
    A(eout(seg(t, 5.4, 6.4)) * (1 - seg(t, 22.6, 23.2)), () => {
      font(600, 22);
      const marks = t < 15 ? [[0, 'surface'], [TOP, `${TOP.toLocaleString('en-US')} m`], [TOP + 1000, `${(TOP + 1000).toLocaleString('en-US')} m`], [BEDROCK, `bedrock ${BEDROCK.toLocaleString('en-US')} m`]]
        : [[TOP, `${TOP.toLocaleString('en-US')} m`], [TOP + 1000, `${(TOP + 1000).toLocaleString('en-US')} m`]];
      for (const [d, lab] of marks) {
        const y = Yd(d); if (y < 60 || y > 780) continue;
        ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(70, y); ctx.stroke();
        text(lab, 40, y - 16, { color: C.soft, base: 'middle' });
      }
      if (t < 15) { const y = Yd(BEDROCK); ctx.fillStyle = 'rgba(70,58,50,0.85)'; ctx.fillRect(0, y, W, 14); }
    });
    strings(t, seg(t, 9.2, 13.0));
    // the count
    A(span(t, 9.6, 15.2, 0.4, 0.5), () => {
      ctx.fillStyle = C.panel; k.rrect(40, 70, 560, 62, 12); ctx.fill();
      const n = Math.round(eout(seg(t, 9.6, 12.8)) * STRINGS);
      font(700, 34); text(`${n} strings × ${PER_STRING} = ${(n * PER_STRING).toLocaleString('en-US')} sensors`, 60, 101, { color: C.ink, base: 'middle' });
    });
    A(span(t, 15.6, 22.8, 0.5, 0.5), () => {
      font(600, 22);
      const x = Xm(SLICE[6]), y = Yd(TOP + 20 * SPACING);
      text(`${SPACING} m between sensors`, x + 14, y, { color: C.soft, base: 'middle' });
      const ya = Yd(TOP - 40), xa = Xm(SLICE[2]), xb = Xm(SLICE[3]);
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, ya); ctx.stroke();
      text(`${STRING_GAP} m`, (xa + xb) / 2, ya - 18, { color: C.soft, align: 'center', base: 'middle' });
    });
    // neutrinos passing straight through
    A(span(t, 18.4, 23.0, 0.3, 0.4), () => {
      for (let i = 0; i < 7; i++) {
        const t0 = 18.6 + i * 0.55, p = seg(t, t0, t0 + 1.6);
        if (p <= 0 || p >= 1) continue;
        const ang = (-60 + i * 23) * (Math.PI / 180), cx = W / 2 + (i - 3) * 70, cy = 430;
        const L = 900, x0 = cx - Math.cos(ang) * L / 2, y0 = cy + Math.sin(ang) * L / 2;
        const hx = x0 + Math.cos(ang) * L * p, hy = y0 - Math.sin(ang) * L * p;
        ctx.strokeStyle = 'rgba(233,244,255,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([12, 9]);
        ctx.beginPath(); ctx.moveTo(lerp(x0, hx, 0.6), lerp(y0, hy, 0.6)); ctx.lineTo(hx, hy); ctx.stroke(); ctx.setLineDash([]);
        font(600, 26, CAP); text('ν', hx + 8, hy - 8, { color: C.ink, base: 'middle' });
      }
    });
    if (t > 22.8) event(t);
  });
}

function event(t) {
  const vx = Xm(VERTEX.x), vy = Yd(VERTEX.d);
  const dirx = U.x, diry = -U.z; // screen direction of the muon
  // the incoming neutrino, from below the horizon
  A(span(t, 23.2, 45.8, 0.3, 0.4), () => {
    const p = eout(seg(t, 23.2, 24.6)), L = 420;
    const sx = vx - dirx * L, sy = vy - diry * L;
    ctx.strokeStyle = 'rgba(233,244,255,0.6)'; ctx.lineWidth = 2.5; ctx.setLineDash([10, 9]);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, vx, p), lerp(sy, vy, p)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 30, CAP); text('ν', lerp(sx, vx, p) - 30, lerp(sy, vy, p) + 6, { color: C.ink, base: 'middle' });
    // the hit nucleus
    const b = seg(t, 24.5, 25.4);
    if (b > 0) A(1 - b * 0.6, () => { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(vx, vy, 6 + 22 * eout(b), 0, Math.PI * 2); ctx.globalAlpha *= 0.5; ctx.fill(); });
    A(span(t, 24.6, 27.4), () => { font(600, 24); text('hits a nucleus', vx + 18, vy + 28, { color: C.amber, base: 'middle' }); });
  });
  const tau = clamp(muAt(t), 0, MU.length);
  if (t < MU.start) return;
  const mx = vx + dirx * tau * cam.s, my = vy + diry * tau * cam.s;
  // the Cherenkov bow wave behind the muon
  A(span(t, MU.start, MU.end + 0.6, 0.3, 0.8) * (t < 32.2 ? 0.45 : 1), () => {
    const len = 250 * cam.s;
    const back = Math.atan2(-diry, -dirx);
    ctx.fillStyle = 'rgba(98,216,255,0.22)'; ctx.strokeStyle = 'rgba(98,216,255,0.95)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx, my);
    ctx.lineTo(mx + Math.cos(back + FRONT) * len, my + Math.sin(back + FRONT) * len);
    ctx.lineTo(mx + Math.cos(back - FRONT) * len, my + Math.sin(back - FRONT) * len);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx + Math.cos(back + FRONT) * len, my + Math.sin(back + FRONT) * len); ctx.lineTo(mx, my);
    ctx.lineTo(mx + Math.cos(back - FRONT) * len, my + Math.sin(back - FRONT) * len); ctx.stroke();
  });
  // the hits, coloured by arrival time
  for (const h of HITS) {
    if (tau < h.tau) continue;
    const x = Xm(h.x), y = Yd(h.depth), age = seg(tau - h.tau, 0, 60), size = (2.6 + 5.4 * Math.exp(-h.dist / 30)) * (0.7 + 0.3 * eout(age));
    ctx.fillStyle = `hsla(${hue(h.tau)}, 95%, 60%, 0.9)`;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
  }
  // the muon itself and its track
  A(span(t, MU.start, MU.end + 0.6, 0.2, 0.6), () => {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(mx, my); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
    A(span(t, 25.2, 31.6), () => { font(700, 26); text('muon', mx + 14, my + 26, { color: C.ink, base: 'middle' }); });
  });
  // speeds
  A(span(t, 27.8, 32.0, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; k.rrect(40, 62, 640, 112, 12); ctx.fill();
    const L0 = 230, Lw = 420;
    font(600, 24); text('light in ice', 60, 96, { color: C.soft, base: 'middle' }); text('muon', 60, 142, { color: C.soft, base: 'middle' });
    ctx.fillStyle = C.cyan; ctx.fillRect(L0, 86, Lw * LIGHT_IN_ICE * eout(seg(t, 28.0, 29.0)), 20);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(L0, 132, Lw * 0.9999 * eout(seg(t, 29.2, 30.2)), 20);
    font(700, 24); text(`${LIGHT_IN_ICE.toFixed(2)} c`, L0 + Lw * LIGHT_IN_ICE + 10, 96, { color: C.cyan, base: 'middle' });
    A(seg(t, 29.6, 30.2), () => text('≈ 1.00 c', L0 + Lw - 96, 142, { color: C.ink, base: 'middle' }));
  });
  // the time legend
  A(span(t, 36.8, 41.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; k.rrect(40, 62, 520, 70, 12); ctx.fill();
    const L0 = 160, Lw = 260;
    for (let i = 0; i < Lw; i++) { ctx.fillStyle = `hsl(${(i / Lw) * 275}, 95%, 60%)`; ctx.fillRect(L0 + i, 86, 1.5, 22); }
    font(600, 22); text('early', L0 - 14, 97, { color: C.red, align: 'right', base: 'middle' }); text('late', L0 + Lw + 14, 97, { color: C.purple, base: 'middle' });
  });
  // the reconstruction: back along the track
  A(span(t, 41.4, 45.8, 0.5, 0.4), () => {
    const p = eout(seg(t, 41.6, 43.0)), L = 700;
    const ex = vx + dirx * 1700 * cam.s, ey = vy + diry * 1700 * cam.s;
    ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.setLineDash([16, 10]);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lerp(ex, vx - dirx * L, p), lerp(ey, vy - diry * L, p)); ctx.stroke(); ctx.setLineDash([]);
    A(seg(t, 42.6, 43.2), () => {
      ctx.fillStyle = C.panel; k.rrect(40, 62, 610, 70, 12); ctx.fill();
      font(700, 28); text('it came up through the Earth, from here', 60, 97, { color: C.amber, base: 'middle' });
    });
  });
}

// ---------- the sky: an all-sky map in galactic coordinates (Hammer–Aitoff projection) ----------
const MAP = { cx: W / 2, cy: 410, rx: 370, ry: 185 };
function aitoff(l, b) { // degrees; l = 0 in the middle, increasing to the left
  let L = ((l + 180) % 360 + 360) % 360 - 180; const lr = (-L * Math.PI) / 180, br = (b * Math.PI) / 180;
  const z = Math.sqrt(1 + Math.cos(br) * Math.cos(lr / 2));
  return [MAP.cx + MAP.rx * (Math.cos(br) * Math.sin(lr / 2)) / z, MAP.cy - MAP.ry * Math.sin(br) / z];
}
const DIFFUSE = (() => { let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 40 }, () => [r() * 360 - 180, (Math.asin(2 * r() - 1) * 180) / Math.PI, r()]); })();
const TXS = [195.4, -19.6]; // galactic coordinates of TXS 0506+056, roughly

function sceneSky(t) {
  const a = span(t, 46.0, 64.6, 0.6, 0.01);
  if (a <= 0) return;
  A(a, () => {
    ctx.drawImage(sky, 0, 0);
    const m = 1 - seg(t, 59.6, 60.2);
    A(m, () => {
      // the map outline and grid
      ctx.strokeStyle = 'rgba(233,244,255,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(MAP.cx, MAP.cy, MAP.rx, MAP.ry, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(233,244,255,0.10)'; ctx.lineWidth = 1;
      for (const b of [-60, -30, 30, 60]) { ctx.beginPath(); for (let l = -180; l <= 180; l += 5) { const [x, y] = aitoff(l, b); l === -180 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      for (const l of [-120, -60, 60, 120]) { ctx.beginPath(); for (let b = -90; b <= 90; b += 5) { const [x, y] = aitoff(l, b); b === -90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      // the Milky Way along the middle
      const mw = 0.35 + 0.65 * eout(seg(t, 55.4, 56.6));
      const g = ctx.createLinearGradient(0, MAP.cy - 40, 0, MAP.cy + 40);
      g.addColorStop(0, 'rgba(180,200,255,0)'); g.addColorStop(0.5, `rgba(180,200,255,${0.10 + 0.25 * seg(t, 55.4, 56.6)})`); g.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.save(); ctx.beginPath(); ctx.ellipse(MAP.cx, MAP.cy, MAP.rx, MAP.ry, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = g; ctx.fillRect(MAP.cx - MAP.rx, MAP.cy - 40, MAP.rx * 2, 80);
      ctx.restore();
      font(600, 22); A(mw, () => text('Milky Way', MAP.cx - MAP.rx + 30, MAP.cy - 52, { color: C.soft, base: 'middle' }));
      font(600, 22); text('the whole sky, as seen from Earth', MAP.cx, MAP.cy + MAP.ry + 34, { color: C.soft, align: 'center', base: 'middle' });
      // 2013: neutrinos from all over the sky
      DIFFUSE.forEach(([l, b, r], i) => {
        const g2 = eout(seg(t, 46.6 + i * 0.07, 47.0 + i * 0.07));
        if (g2 <= 0) return;
        const [x, y] = aitoff(l, b);
        ctx.fillStyle = `rgba(255,181,71,${0.55 * g2})`; ctx.beginPath(); ctx.arc(x, y, 3 + r * 4, 0, Math.PI * 2); ctx.fill();
      });
      // 2017: the blazar
      A(eout(seg(t, 50.8, 51.6)), () => {
        const [x, y] = aitoff(TXS[0], TXS[1]);
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 18 + 6 * Math.sin(t * 5), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        font(700, 24); text('TXS 0506+056', x - 30, y + 46, { color: C.cyan, align: 'right', base: 'middle' });
      });
      // 2023: the Milky Way glows in neutrinos
      A(eout(seg(t, 55.4, 56.6)), () => {
        for (let i = 0; i < 60; i++) {
          const l = -170 + i * 5.8, b = Math.sin(i * 2.3) * 4;
          const [x, y] = aitoff(l, b);
          ctx.fillStyle = `rgba(181,108,255,${0.35 + 0.3 * Math.abs(Math.sin(i * 1.7))})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        }
      });
      // the year
      const yr = t < 50.6 ? '2013' : t < 55.2 ? '2017' : '2023';
      ctx.fillStyle = C.panel; k.rrect(40, 62, 230, 82, 12); ctx.fill();
      font(800, 60); text(yr, 60, 104, { color: C.amber, base: 'middle' });
    });
    // charged particles bend, neutrinos fly straight
    A(span(t, 60.0, 64.8, 0.5, 0.01), () => {
      const sx = 120, sy = 420, ex = 720, ey = 420;
      ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fill();
      font(600, 22); text('source', sx, sy + 46, { color: C.soft, align: 'center', base: 'middle' });
      ctx.fillStyle = '#4b8fd6'; ctx.beginPath(); ctx.arc(ex, ey, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5bbf72'; ctx.beginPath(); ctx.arc(ex - 6, ey - 6, 10, 0, Math.PI * 2); ctx.fill();
      text('Earth', ex, ey + 50, { color: C.soft, align: 'center', base: 'middle' });
      const p = eout(seg(t, 60.4, 62.6));
      // a cosmic ray: curled by magnetic fields
      ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.beginPath();
      for (let i = 0; i <= 100 * p; i++) {
        const u = i / 100, x = lerp(sx, ex - 30, u) + Math.sin(u * 9) * 60 * Math.sin(u * Math.PI), y = sy - 150 * Math.sin(u * Math.PI) + Math.cos(u * 9) * 50 * Math.sin(u * Math.PI);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      font(700, 24); A(seg(t, 61.0, 61.6), () => text('charged cosmic ray: bent', W / 2, 220, { color: C.red, align: 'center', base: 'middle' }));
      ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.setLineDash([14, 9]);
      ctx.beginPath(); ctx.moveTo(sx + 24, sy); ctx.lineTo(lerp(sx + 24, ex - 30, p), sy); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 61.0, 61.6), () => { font(600, 26, CAP); text('ν', W / 2 - 150, sy + 34, { color: C.amber, base: 'middle' }); font(700, 24); text('neutrino: straight', W / 2 - 120, sy + 34, { color: C.amber, base: 'middle' }); });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneIce(t);
    sceneSky(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.cyan, '~': C.red, '^': C.purple } });
  },
});
