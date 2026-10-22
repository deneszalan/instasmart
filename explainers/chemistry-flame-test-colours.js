// Explainer for chemistry-flame-test-colours: heated metals colour a flame because their electrons
// fall back by set energy steps, each giving light of one exact colour.
// Look: a dark school lab at night, a tiled wall lit only by a Bunsen flame, a steel burner on a slate
// bench; then a glowing energy-level diagram, a spectrum strip, and fireworks. Archivo for captions
// and titles, Space Mono for wavelengths and element symbols.
//
// Scene plan (61.5 s). Captions centred at y = 834; everything important above y = 930.
//  A  0.0–12.3  Hook. A pale blue gas flame; a wire loop dips in table salt and enters the flame,
//               which flares bright yellow. "Why that colour?"
//  B 12.0–27.4  Why. A sodium energy-level diagram (3s and 3p): heat kicks the electron up, it falls
//               back and a yellow photon flies off; then many atoms do it; the gap is labelled 589 nm.
//  C 27.1–37.6  Spectrum strips: white light spreads into a full rainbow (400–700 nm); sodium's light
//               is a single bright line at 589 nm, and a close-up shows the pair at 589.0 and 589.6 nm.
//  D 37.3–50.9  Other metals in the same flame, with swatches: lithium carmine red, strontium crimson
//               to scarlet, copper blue-green, potassium lilac. A note says shades vary.
//  E 50.6–61.5  Fireworks: strontium red, copper blue, sodium yellow, barium green; payoff.
//
// Facts (Wikipedia, "Flame test"): a sample is put in a hot, non-luminous flame; ions are excited by
// heat and relax with the emission of a photon whose energy is characteristic of the element; flame
// colours: sodium bright yellow, lithium carmine red, strontium crimson to scarlet red, copper
// blue-green (Cu(I) and Cu(II) halide), potassium lilac; colours depend on temperature and oxygen.
// ("Emission spectrum"): heat pushes electrons to higher energy orbitals; falling back, they emit a
// photon whose wavelength is set by the energy difference; each element's spectrum is unique.
// ("Sodium"): the photon from the 3p→3s fall is the D line at about 589.3 nm, split into 589.0 and
// 589.6 nm. ("Pyrotechnic colorant"): fireworks get red from strontium, blue from copper, yellow from
// sodium and green from barium compounds. Energy levels are drawn as a diagram, not to scale.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#050508', bg1: '#0E0F17', ink: '#F4F1EA', inkSoft: 'rgba(244,241,234,0.74)', inkDim: 'rgba(244,241,234,0.52)',
  steel: '#8B93A3', steelHi: '#D7DCE6', steelLo: '#3A404D', bench: '#14151C', benchHi: '#2B2D38',
  blue: '#5AA8FF', blueHi: '#BFE3FF', level: '#7CC4FF', heat: '#FF8A3D',
};
// Flame colours (draw) and lighter versions for text on the dark background.
const M = {
  Na: { name: 'Sodium', colour: 'bright yellow', flame: [255, 186, 28], text: '#FFCB45' },
  Li: { name: 'Lithium', colour: 'carmine red', flame: [228, 20, 80], text: '#FF5E8E' },
  Sr: { name: 'Strontium', colour: 'crimson to scarlet', flame: [255, 54, 30], text: '#FF7552' },
  Cu: { name: 'Copper', colour: 'blue-green', flame: [30, 212, 170], text: '#45E2BC' },
  K: { name: 'Potassium', colour: 'lilac', flame: [196, 152, 236], text: '#D6B5F4' },
};
const SANS = 'Archivo', MONO = 'Space Mono';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixc = (a, b, x) => a.map((v, i) => Math.round(lerp(v, b[i], x)));
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- timeline ----------
const T = { A: [0, 12.3], B: [12.0, 27.4], C: [27.1, 37.6], D: [37.3, 50.9], E: [50.6, 61.5] };
const CUES = [
  [0.4, 4.4, 'A gas burner gives a hot, almost invisible blue flame.'],
  [4.5, 8.2, 'Touch the flame with a wire dipped in table salt…'],
  [8.3, 12.0, '…and it flares ~bright yellow~. Why that colour?'],
  [12.3, 17.2, 'Heat kicks an electron up to a higher *energy level*.'],
  [17.3, 22.5, 'It soon falls back, and gives out the energy as light of one exact colour.'],
  [22.6, 27.2, 'For sodium, that drop makes yellow light at about ~589 nm~.'],
  [27.4, 32.0, 'Spread white light with a prism and you get a full rainbow.'],
  [32.1, 37.4, 'Sodium’s glow is almost all one bright line. Close up, it’s ~two~.'],
  [37.6, 41.6, 'Other elements have other energy levels, so other colours.'],
  [41.7, 46.1, '^Lithium^ turns it carmine red; +strontium+, crimson to scarlet.'],
  [46.2, 50.6, '=Copper= turns it blue-green, and %potassium% lilac.'],
  [50.9, 56.3, 'Fireworks: +strontium+ for red, =copper= blue, ~sodium~ yellow.'],
  [56.4, 61.2, 'Every colour is light from electrons falling back down.'],
];

// ---------- background ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(0.65, '#0A0B11'); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // wall tiles
  g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 2;
  for (let y = 0; y < 712; y += 54) for (let x = (y / 54) % 2 ? -27 : 0; x < W; x += 54) { g.beginPath(); g.roundRect(x + 2, y + 2, 50, 50, 5); g.stroke(); }
  // bench
  const bg = g.createLinearGradient(0, 712, 0, H);
  bg.addColorStop(0, C.benchHi); bg.addColorStop(0.04, C.bench); bg.addColorStop(1, '#08080C');
  g.fillStyle = bg; g.fillRect(0, 712, W, H - 712);
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 712, W, 2);
  // speckle on the slate
  const rnd = mulberry32(3);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + rnd() * 0.03})`; g.fillRect(rnd() * W, 716 + rnd() * 360, 2, 2); }
  const vg = g.createRadialGradient(W / 2, 520, 260, W / 2, 520, 820);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function header(dim = 1) {
  withAlpha(dim, () => {
    font(800, 22); text('RECKON', 64, 84, { color: '#FFCB45', spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 18;
    font(500, 22); text('CHEMISTRY · LIGHT', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '2px' });
  });
}

// ---------- the burner and its flame ----------
const BURN = { x: 432, top: 516, base: 712 };
function burner() {
  const { x, top, base } = BURN;
  // hose
  ctx.strokeStyle = '#3B2A22'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 60, base - 18); ctx.bezierCurveTo(x - 160, base - 10, x - 240, base + 30, -20, base + 60); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,150,0.12)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - 60, base - 22); ctx.bezierCurveTo(x - 160, base - 14, x - 240, base + 26, -20, base + 56); ctx.stroke();
  // base
  const sg = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
  sg.addColorStop(0, C.steelLo); sg.addColorStop(0.4, C.steelHi); sg.addColorStop(1, C.steelLo);
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(x - 76, base); ctx.lineTo(x - 52, base - 30); ctx.lineTo(x + 52, base - 30); ctx.lineTo(x + 76, base); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, base, 78, 10, 0, 0, TAU); ctx.fill();
  // barrel
  const bg = ctx.createLinearGradient(x - 15, 0, x + 15, 0);
  bg.addColorStop(0, C.steelLo); bg.addColorStop(0.35, C.steelHi); bg.addColorStop(1, '#4A5160');
  ctx.fillStyle = bg; ctx.fillRect(x - 15, top, 30, base - 30 - top);
  // collar with air hole
  ctx.fillStyle = sg; rrect(x - 22, base - 86, 44, 26, 4); ctx.fill();
  ctx.fillStyle = '#15161C'; rrect(x - 8, base - 80, 16, 14, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x - 9, top, 4, base - 30 - top);
}
function flameShape(cx, by, w, h, t, ph, flick = 1) {
  const n = 24, pts = [];
  const hh = h * (1 + 0.035 * Math.sin(t * 9 + ph) * flick + 0.02 * Math.sin(t * 15.3 + ph * 2) * flick);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const half = w * Math.pow(1 - u, 0.8) * (0.6 + 0.8 * u);
    const sway = (Math.sin(t * 6.3 + u * 4 + ph) * 5 + Math.sin(t * 11 + u * 7) * 2) * u * u * flick;
    pts.push([cx + sway, by - u * hh, half]);
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0] - pts[0][2], pts[0][1]);
  for (const [x, y, hw] of pts) ctx.lineTo(x - hw, y);
  for (let i = pts.length - 1; i >= 0; i--) { const [x, y, hw] = pts[i]; ctx.lineTo(x + hw, y); }
  ctx.closePath();
  return hh;
}
/** The flame: a pale blue Bunsen flame, coloured by metal `m` by amount `a` (0..1). */
function flame(t, m, a, scale = 1) {
  const { x, top } = BURN;
  const col = m ? M[m].flame : [90, 168, 255];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // room glow
  const gr = ctx.createRadialGradient(x, top - 120, 10, x, top - 120, 420);
  gr.addColorStop(0, rgba(mixc([70, 120, 255], col, a), 0.12 + 0.22 * a)); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, 930);
  // outer blue mantle
  const og = ctx.createLinearGradient(0, top, 0, top - 250 * scale);
  og.addColorStop(0, 'rgba(90,150,255,0.42)'); og.addColorStop(0.6, 'rgba(110,90,255,0.18)'); og.addColorStop(1, 'rgba(110,90,255,0)');
  ctx.fillStyle = og; flameShape(x, top, 30 * scale, 230 * scale, t, 0); ctx.fill();
  // metal colour
  if (a > 0) {
    const mg = ctx.createLinearGradient(0, top, 0, top - 250 * scale);
    mg.addColorStop(0, rgba(col, 0.55 * a)); mg.addColorStop(0.35, rgba(col, 0.95 * a)); mg.addColorStop(0.8, rgba(col, 0.55 * a)); mg.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = mg; flameShape(x, top, 38 * scale, 240 * scale, t, 1.3); ctx.fill();
    const core = ctx.createLinearGradient(0, top, 0, top - 200 * scale);
    core.addColorStop(0, rgba(mixc(col, [255, 255, 255], 0.5), 0.5 * a)); core.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = core; flameShape(x, top, 22 * scale, 200 * scale, t, 2.1); ctx.fill();
  }
  // inner cone
  const ig = ctx.createLinearGradient(0, top, 0, top - 90 * scale);
  ig.addColorStop(0, 'rgba(150,220,255,0.85)'); ig.addColorStop(1, 'rgba(90,150,255,0.15)');
  ctx.fillStyle = ig; flameShape(x, top, 16 * scale, 86 * scale, t, 0.6, 0.3); ctx.fill();
  ctx.restore();
}
/** Wire loop on a glass rod: loop at (lx, ly), holder going up and right. glow: red heat. */
function wire(lx, ly, salt, glow, bead) {
  const hx = lx + 250, hy = ly - 150;
  const rx = lx + 70, ry = ly - 42;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(200,225,240,0.32)'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(rx + 4, ry - 5); ctx.lineTo(hx + 4, hy - 5); ctx.stroke();
  ctx.strokeStyle = glow > 0 ? rgba(mixc([180, 180, 190], [255, 120, 40], glow)) : '#B4B4BE'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(lx + 9, ly - 4); ctx.stroke();
  ctx.beginPath(); ctx.arc(lx, ly, 9, 0, TAU); ctx.stroke();
  if (salt > 0) {
    ctx.fillStyle = bead ? rgba(mixc([245, 245, 245], bead, glow), salt) : `rgba(245,245,245,${salt})`;
    for (const [dx, dy] of [[-6, 4], [-2, 8], [4, 6], [7, 1], [-8, -2]]) { ctx.beginPath(); ctx.arc(lx + dx, ly + dy, 2.6, 0, TAU); ctx.fill(); }
  }
}
function dish(x, y, amount) {
  ctx.fillStyle = 'rgba(200,230,255,0.18)';
  ctx.beginPath(); ctx.ellipse(x, y, 56, 12, 0, 0, Math.PI); ctx.fill();
  ctx.strokeStyle = 'rgba(220,240,255,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y - 2, 56, 10, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(245,245,245,0.92)';
  ctx.beginPath(); ctx.ellipse(x, y - 4, 30 * amount, 9, 0, Math.PI, 0); ctx.fill();
  const rnd = mulberry32(8);
  for (let i = 0; i < 18; i++) { ctx.fillRect(x + (rnd() - 0.5) * 56 * amount, y - 4 - rnd() * 8, 2.5, 2.5); }
  font(500, 22); text('table salt', x, y + 40, { color: C.inkSoft, align: 'center', base: 'middle' });
  font(400, 22, MONO); text('NaCl', x, y + 68, { color: C.inkDim, align: 'center', base: 'middle' });
}

function sceneA(t) {
  const lit = eout(seg(t, 0.3, 1.6));
  burner();
  withAlpha(lit, () => flame(t, 'Na', eio(seg(t, 7.6, 8.4)) * (1 + 0.15 * Math.sin(t * 5) * seg(t, 8.4, 9))));
  // the loop: rest at the dish, dip, then into the flame
  const dishX = 676, dishY = 704;
  const dip = Math.sin(Math.PI * seg(t, 4.7, 5.6));
  const go = eio(seg(t, 5.8, 7.5));
  const lx = lerp(dishX - 8, BURN.x + 34, go), ly = lerp(dishY - 26 + dip * 14, BURN.top - 70, go) - Math.sin(Math.PI * go) * 60;
  withAlpha(eout(seg(t, 3.6, 4.4)), () => {
    dish(dishX, dishY, 1);
    wire(lx, ly, seg(t, 5.1, 5.4), seg(t, 7.4, 8.2), M.Na.flame);
  });
  // sparks of colour when the salt hits the flame
  if (t > 7.6 && t < 10) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rnd = mulberry32(21);
    for (let i = 0; i < 26; i++) {
      const t0 = 7.6 + rnd() * 1.6, life = 0.7 + rnd() * 0.5, p = (t - t0) / life;
      const ang = -Math.PI / 2 + (rnd() - 0.5) * 1.6, sp = 60 + rnd() * 120;
      if (p <= 0 || p >= 1) continue;
      const x = BURN.x + 30 + Math.cos(ang) * sp * p, y = BURN.top - 70 + Math.sin(ang) * sp * p;
      ctx.fillStyle = rgba(M.Na.flame, 1 - p); ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------- B: energy levels ----------
const LV = { x0: 120, x1: 470, g: 640, e: 420 }; // ground (3s) and excited (3p) levels
function wavePath(x0, x1, y, lambda, amp, phase) {
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 3) {
    const u = (x - x0) / (x1 - x0), env = Math.sin(Math.PI * u);
    const yy = y + Math.sin((x / lambda) * TAU - phase) * amp * env;
    x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  }
}
function photon(xc, y, a = 1) {
  withAlpha(a, () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(M.Na.flame, 0.35); ctx.lineWidth = 12; ctx.lineCap = 'round';
    wavePath(xc - 70, xc + 70, y, 34, 16, xc * 0.2); ctx.stroke();
    ctx.strokeStyle = rgba([255, 226, 140], 1); ctx.lineWidth = 4;
    wavePath(xc - 70, xc + 70, y, 34, 16, xc * 0.2); ctx.stroke();
    ctx.restore();
  });
}
function electron(x, y, glow = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 1, x, y, 30 + glow * 14);
  g.addColorStop(0, `rgba(190,230,255,${0.55 + glow * 0.3})`); g.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 44, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#E8F6FF'; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
  font(700, 18, MONO); text('−', x, y + 1, { color: '#1A2A44', align: 'center', base: 'middle' });
}
// three electrons (three atoms) take turns; times of: heat kick, jump, fall
const JUMPS = [
  { x: 210, kick: 13.4, up: 14.0, down: 18.0 },
  { x: 300, kick: 20.6, up: 21.0, down: 22.8 },
  { x: 390, kick: 21.6, up: 22.0, down: 23.8 },
  { x: 210, kick: 23.0, up: 23.4, down: 24.8 },
  { x: 300, kick: 24.2, up: 24.6, down: 25.8 },
  { x: 390, kick: 25.0, up: 25.4, down: 26.6 },
];
function sceneB(t) {
  const inA = eout(seg(t, 12.0, 12.8));
  ctx.fillStyle = 'rgba(5,5,9,0.82)'; ctx.fillRect(0, 0, W, H);
  // a small burner glow in the corner keeps the link to the flame
  font(700, 24); text('SODIUM ATOM', 64, 150, { color: M.Na.text, spacing: '2px' });
  const tw = ctx.measureText('SODIUM ATOM').width + 22;
  font(400, 22); text('·  energy-level diagram, not to scale', 64 + tw + 12, 150, { color: C.inkDim });
  // levels
  ctx.lineCap = 'round';
  withAlpha(inA, () => {
    ctx.strokeStyle = 'rgba(124,196,255,0.25)'; ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
    for (const y of [330, 300, 282]) { ctx.beginPath(); ctx.moveTo(LV.x0, y); ctx.lineTo(LV.x1, y); ctx.stroke(); }
    ctx.setLineDash([]);
    font(500, 22); text('higher levels', LV.x1 + 20, 302, { color: C.inkDim, base: 'middle' });
    ctx.strokeStyle = C.level; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(LV.x0, LV.e); ctx.lineTo(LV.x1, LV.e); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(LV.x0, LV.g); ctx.lineTo(LV.x1, LV.g); ctx.stroke();
    font(700, 28, MONO); text('3p', LV.x1 + 20, LV.e, { color: C.level, base: 'middle' });
    text('3s', LV.x1 + 20, LV.g, { color: C.level, base: 'middle' });
    font(500, 22); text('excited', LV.x1 + 74, LV.e, { color: C.inkSoft, base: 'middle' });
    text('ground', LV.x1 + 74, LV.g, { color: C.inkSoft, base: 'middle' });
    // energy axis
    ctx.strokeStyle = C.inkDim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, 690); ctx.lineTo(80, 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(72, 312); ctx.lineTo(80, 298); ctx.lineTo(88, 312); ctx.stroke();
    ctx.save(); ctx.translate(58, 500); ctx.rotate(-Math.PI / 2); font(500, 22); text('energy', 0, 0, { color: C.inkDim, align: 'center', base: 'middle' }); ctx.restore();
  });
  // heat from below
  for (const j of JUMPS) {
    withAlpha(span(t, j.kick - 0.5, j.up + 0.1, 0.3, 0.3), () => {
      ctx.strokeStyle = C.heat; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const p = seg(t, j.kick - 0.5, j.up);
      for (const dx of [-26, 0, 26]) {
        ctx.beginPath();
        for (let s = 0; s <= 1; s += 0.05) { const y = lerp(730, 680, s) - p * 30, x = j.x + dx + Math.sin(s * 12 + t * 8) * 5; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
    });
  }
  withAlpha(span(t, 13.0, 17.0, 0.4, 0.4), () => { font(600, 24); text('heat', 150, 706, { color: C.heat, align: 'center', base: 'middle' }); });
  // electrons
  for (const [i, x] of [[0, 210], [1, 300], [2, 390]]) {
    const mine = JUMPS.filter((j) => j.x === x);
    let y = LV.g, glow = 0;
    for (const j of mine) {
      const u = eio(seg(t, j.up, j.up + 0.55)), d = eio(seg(t, j.down, j.down + 0.4));
      if (t >= j.up && t < j.down + 0.4) { y = lerp(LV.g, LV.e, u) + (LV.g - LV.e) * d; glow = u * (1 - d); }
    }
    withAlpha(inA * (i === 0 ? 1 : seg(t, 20.0, 20.6)), () => electron(x, y, glow));
  }
  // jump arrows for the first one
  withAlpha(span(t, 14.0, 17.6, 0.3, 0.4), () => arrow(170, LV.g - 20, 170, LV.e + 20, C.heat));
  withAlpha(span(t, 18.0, 21.6, 0.2, 0.4), () => arrow(250, LV.e + 20, 250, LV.g - 20, M.Na.text));
  // photons fly out to the right after each fall
  for (const j of JUMPS) {
    const p = seg(t, j.down + 0.2, j.down + 2.2);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(j.x + 40, 900, eio(p) * 0.9 + p * 0.1), y = lerp((LV.e + LV.g) / 2, 470 + (j.x - 300) * 0.3, p);
    photon(x, y, Math.min(1, p * 6));
  }
  // the gap equals the colour
  withAlpha(seg(t, 22.7, 23.4), () => {
    const bx = 640;
    ctx.strokeStyle = M.Na.text; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx - 14, LV.e); ctx.lineTo(bx, LV.e); ctx.lineTo(bx, LV.g); ctx.lineTo(bx - 14, LV.g); ctx.stroke();
    ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(124,196,255,0.5)';
    ctx.beginPath(); ctx.moveTo(LV.x1 + 130, LV.e); ctx.lineTo(bx - 14, LV.e); ctx.moveTo(LV.x1 + 120, LV.g); ctx.lineTo(bx - 14, LV.g); ctx.stroke(); ctx.setLineDash([]);
    const my = (LV.e + LV.g) / 2;
    ctx.fillStyle = 'rgba(5,5,9,0.92)'; rrect(bx + 10, my - 54, 120, 104, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,203,69,0.45)'; ctx.lineWidth = 2; rrect(bx + 10, my - 54, 120, 104, 14); ctx.stroke();
    font(700, 40, MONO); text('589', bx + 70, my - 18, { color: M.Na.text, align: 'center', base: 'middle' });
    font(700, 28, MONO); text('nm', bx + 70, my + 24, { color: M.Na.text, align: 'center', base: 'middle' });
  });
}
function arrow(x0, y0, x1, y1, col) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * 6, y1 + Math.sin(a) * 6); ctx.lineTo(x1 + Math.cos(a + 2.5) * 18, y1 + Math.sin(a + 2.5) * 18); ctx.lineTo(x1 + Math.cos(a - 2.5) * 18, y1 + Math.sin(a - 2.5) * 18); ctx.closePath(); ctx.fill();
}

// ---------- C: spectrum strips ----------
/** Approximate colour of light at wavelength l (nm), 380–750. */
function waveRGB(l) {
  let r = 0, g = 0, b = 0;
  if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else { r = 1; }
  let f = 1;
  if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (750 - l) / 50;
  return [r, g, b].map((v) => Math.round(255 * Math.pow(v * f, 0.8)));
}
const SP = { x0: 92, x1: 772, l0: 400, l1: 700 };
const SX = (l) => lerp(SP.x0, SP.x1, (l - SP.l0) / (SP.l1 - SP.l0));
function strip(y, h, reveal, kind) {
  ctx.save();
  rrect(SP.x0, y, SP.x1 - SP.x0, h, 8); ctx.clip();
  ctx.fillStyle = '#050507'; ctx.fillRect(SP.x0, y, SP.x1 - SP.x0, h);
  if (kind === 'white') {
    const xr = lerp(SP.x0, SP.x1, reveal);
    for (let x = SP.x0; x < xr; x += 2) { const l = lerp(SP.l0, SP.l1, (x - SP.x0) / (SP.x1 - SP.x0)); ctx.fillStyle = rgba(waveRGB(l)); ctx.fillRect(x, y, 2.5, h); }
  } else {
    const x = SX(589.3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x - 24, 0, x + 24, 0);
    g.addColorStop(0, 'rgba(255,190,30,0)'); g.addColorStop(0.5, rgba([255, 200, 40], 0.7 * reveal)); g.addColorStop(1, 'rgba(255,190,30,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 24, y, 48, h);
    ctx.fillStyle = rgba([255, 236, 150], reveal); ctx.fillRect(x - 2.5, y, 5, h);
    ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; rrect(SP.x0, y, SP.x1 - SP.x0, h, 8); ctx.stroke();
}
function axis(y) {
  ctx.strokeStyle = C.inkDim; ctx.lineWidth = 2;
  font(400, 22, MONO);
  for (const l of [400, 500, 600, 700]) {
    const x = SX(l);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 10); ctx.stroke();
    text(String(l), x, y + 28, { color: C.inkSoft, align: l === 400 ? 'left' : l === 700 ? 'right' : 'center', base: 'middle' });
  }
  text('nm', SX(700) + 8, y + 28, { color: C.inkDim, base: 'middle' });
}
function sceneC(t) {
  ctx.fillStyle = 'rgba(5,5,9,0.82)'; ctx.fillRect(0, 0, W, H);
  const r1 = eio(seg(t, 27.6, 29.6));
  withAlpha(eout(seg(t, 27.2, 27.8)), () => {
    font(700, 24); text('WHITE LIGHT', SP.x0, 214, { color: C.ink, spacing: '2px' });
    const w1 = ctx.measureText('WHITE LIGHT').width + 24;
    font(400, 22); text('·  a glowing lamp, through a prism', SP.x0 + w1 + 12, 214, { color: C.inkDim });
    strip(234, 70, r1, 'white');
    axis(310);
  });
  const r2 = eio(seg(t, 32.2, 33.2));
  withAlpha(eout(seg(t, 31.9, 32.4)), () => {
    font(700, 24); text('SODIUM FLAME', SP.x0, 434, { color: M.Na.text, spacing: '2px' });
    const w2 = ctx.measureText('SODIUM FLAME').width + 24;
    font(400, 22); text('·  the same prism', SP.x0 + w2 + 12, 434, { color: C.inkDim });
    strip(454, 70, r2, 'line');
    axis(530);
  });
  // close-up of the pair
  const z = eio(seg(t, 34.0, 35.0));
  withAlpha(z, () => {
    const bx0 = 412, bx1 = 772, by = 626, bh = 96;
    const x = SX(589.3);
    ctx.strokeStyle = 'rgba(255,203,69,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 6, 526); ctx.lineTo(bx0, by); ctx.moveTo(x + 6, 526); ctx.lineTo(bx1, by); ctx.stroke();
    ctx.fillStyle = '#050507'; rrect(bx0, by, bx1 - bx0, bh, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,203,69,0.6)'; rrect(bx0, by, bx1 - bx0, bh, 10); ctx.stroke();
    // 588.6..590.0 nm across the box
    const ZX = (l) => lerp(bx0 + 20, bx1 - 20, (l - 588.6) / 1.4);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const l of [588.995, 589.592]) {
      const xx = ZX(l);
      const g = ctx.createLinearGradient(xx - 18, 0, xx + 18, 0);
      g.addColorStop(0, 'rgba(255,190,30,0)'); g.addColorStop(0.5, 'rgba(255,200,40,0.7)'); g.addColorStop(1, 'rgba(255,190,30,0)');
      ctx.fillStyle = g; ctx.fillRect(xx - 18, by + 8, 36, bh - 16);
      ctx.fillStyle = '#FFEC96'; ctx.fillRect(xx - 3, by + 8, 6, bh - 16);
    }
    ctx.restore();
    font(700, 24, MONO);
    text('589.0', ZX(588.995), by + bh + 26, { color: M.Na.text, align: 'center', base: 'middle' });
    text('589.6 nm', ZX(589.592) + 22, by + bh + 26, { color: M.Na.text, align: 'center', base: 'middle' });
    font(500, 22); text('close-up', bx0 - 18, by + bh / 2, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
}

// ---------- D: other metals ----------
const SEQ = [['Na', 37.0, 38.8], ['Li', 41.7, 44.0], ['Sr', 44.0, 46.2], ['Cu', 46.2, 48.4], ['K', 48.4, 51.0]];
const ORDER = ['Na', 'Li', 'Sr', 'Cu', 'K'];
function metalAt(t) {
  // returns [metal, amount] with smooth crossfades through the blue flame
  for (let i = SEQ.length - 1; i >= 0; i--) {
    const [m, a, b] = SEQ[i];
    if (t >= a) {
      const fadeIn = i === 0 ? 1 : eio(seg(t, a, a + 0.55));
      const fadeOut = i === 0 ? 1 - eio(seg(t, b, b + 0.8)) : 1;
      return [m, fadeIn * fadeOut];
    }
  }
  return ['Na', 1];
}
function sceneD(t) {
  const [m, a] = metalAt(t);
  burner();
  flame(t, m, a);
  // the loop held in the flame
  wire(BURN.x + 34, BURN.top - 70, 1, 1, M[m].flame);
  // swatches
  const y = 170, gap = 136, x0 = W / 2 - 2 * gap;
  ORDER.forEach((id, i) => {
    const [, ta] = SEQ[i];
    const shown = i === 0 ? 1 : seg(t, ta - 0.2, ta + 0.4);
    const active = id === m ? a : 0;
    withAlpha(0.35 + 0.65 * shown, () => {
      const x = x0 + i * gap, col = M[id].flame;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 4, x, y, 60);
      g.addColorStop(0, rgba(col, 0.5 * shown + 0.4 * active)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 60, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = shown > 0.5 ? rgba(col) : '#2A2B33'; ctx.beginPath(); ctx.arc(x, y, 32, 0, TAU); ctx.fill();
      ctx.strokeStyle = active > 0.5 ? C.ink : 'rgba(255,255,255,0.3)'; ctx.lineWidth = active > 0.5 ? 4 : 2; ctx.stroke();
      font(700, 26, MONO); text(id, x, y + 2, { color: id === 'Li' || id === 'Sr' ? '#FFFFFF' : '#14100C', align: 'center', base: 'middle' });
      font(600, 22); text(M[id].name, x, y + 56, { color: shown > 0.5 ? M[id].text : C.inkDim, align: 'center', base: 'middle' });
    });
  });
  // the current metal, named beside the flame
  withAlpha(a * seg(t, 41.5, 42.0), () => {
    font(800, 44); text(M[m].name, 372, 360, { color: M[m].text, align: 'right', base: 'middle' });
    font(500, 30); text(M[m].colour, 372, 408, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
  withAlpha(seg(t, 41.8, 42.6), () => {
    font(400, 22); text('Exact shades depend on the flame and the salt.', W / 2, 758, { color: C.inkDim, align: 'center', base: 'middle' });
  });
}

// ---------- E: fireworks ----------
const BURSTS = [];
{
  const plan = [['Sr', 250, 330, 51.0], ['Cu', 590, 300, 51.9], ['Na', 420, 470, 52.8], ['Ba', 660, 520, 53.7],
    ['Sr', 600, 300, 55.2], ['Na', 230, 480, 55.9], ['Cu', 300, 300, 56.8], ['Ba', 520, 420, 57.6],
    ['Na', 640, 470, 58.6], ['Sr', 330, 360, 59.4]];
  const rnd = mulberry32(77);
  for (const [m, x, y, t0] of plan) {
    const parts = Array.from({ length: 72 }, (_, i) => ({ a: (i / 72) * TAU + rnd() * 0.1, v: 0.45 + rnd() * 0.6 }));
    BURSTS.push({ m, x, y, t0, parts, r: 118 + rnd() * 20 });
  }
}
const FW = { Sr: [255, 60, 40], Cu: [70, 130, 255], Na: [255, 196, 40], Ba: [130, 230, 70] };
const FWNAME = { Sr: ['strontium', M.Sr.text], Cu: ['copper', '#86AEFF'], Na: ['sodium', M.Na.text], Ba: ['barium', '#A8EC7A'] };
function sceneE(t) {
  // night sky over the lab
  const sky = ctx.createLinearGradient(0, 0, 0, 930);
  sky.addColorStop(0, '#04061A'); sky.addColorStop(1, '#0B0F26');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const rnd = mulberry32(5);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.4})`; ctx.fillRect(rnd() * W, rnd() * 700, 2, 2); }
  // skyline
  ctx.fillStyle = '#03040C';
  ctx.beginPath(); ctx.moveTo(0, 930);
  for (const [x, h] of [[0, 760], [90, 760], [90, 720], [170, 720], [170, 745], [260, 745], [260, 690], [330, 690], [330, 740], [430, 740], [430, 705], [520, 705], [520, 750], [600, 750], [600, 715], [700, 715], [700, 740], [864, 740]]) ctx.lineTo(x, h);
  ctx.lineTo(W, 930); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#03040C'; ctx.fillRect(0, 740, W, 340);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of BURSTS) {
    const tau = t - b.t0;
    if (tau < -0.7 || tau > 2.6) continue;
    const col = FW[b.m];
    if (tau < 0) {
      // the rising shell
      const p = 1 + tau / 0.7;
      const y = lerp(760, b.y, eout(p));
      ctx.fillStyle = 'rgba(255,230,190,0.9)'; ctx.beginPath(); ctx.arc(b.x, y, 3, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,200,150,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x, y + 40); ctx.stroke();
      continue;
    }
    const fade = 1 - seg(tau, 1.2, 2.6);
    if (tau < 0.25) { // flash
      const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 140);
      g.addColorStop(0, rgba(col, 0.5 * (1 - tau / 0.25))); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, 140, 0, TAU); ctx.fill();
    }
    const pos = (s) => {
      const r = b.r * (1 - Math.exp(-3.2 * s));
      return [r, 26 * s * s];
    };
    ctx.lineCap = 'round';
    for (const q of b.parts) {
      const [r, fall] = pos(tau), [r0, fall0] = pos(Math.max(0, tau - 0.12));
      const x = b.x + Math.cos(q.a) * r * q.v, y = b.y + Math.sin(q.a) * r * q.v + fall;
      const x0 = b.x + Math.cos(q.a) * r0 * q.v, y0 = b.y + Math.sin(q.a) * r0 * q.v + fall0;
      ctx.strokeStyle = rgba(col, 0.85 * fade); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = rgba(mixc(col, [255, 255, 255], 0.5), fade); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  // labels for the first round
  for (const b of BURSTS.slice(0, 4)) {
    withAlpha(span(t, b.t0 + 0.3, b.t0 + 2.6, 0.3, 0.5), () => {
      font(700, 28); text(FWNAME[b.m][0], b.x, b.y + 4, { color: FWNAME[b.m][1], align: 'center', base: 'middle' });
    });
  }
  // payoff
  withAlpha(seg(t, 58.4, 59.2), () => {
    font(400, 22);
    text('Source: Wikipedia, “Flame test”, “Emission spectrum”, “Pyrotechnic colorant”', W / 2, 900, { color: C.inkDim, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 740 };
const MARKS = { '*': C.level, '~': M.Na.text, '^': M.Li.text, '+': M.Sr.text, '=': M.Cu.text, '%': M.K.text };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~^+=%]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  const any = CUES.some(([a, b]) => t >= a - 0.3 && t <= b + 0.3);
  if (any) {
    const g = ctx.createLinearGradient(0, 770, 0, 910);
    g.addColorStop(0, 'rgba(4,4,8,0)'); g.addColorStop(0.3, 'rgba(4,4,8,0.6)'); g.addColorStop(0.75, 'rgba(4,4,8,0.6)'); g.addColorStop(1, 'rgba(4,4,8,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 770, W, 140);
  }
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: MARKS });
  }
}

Kit.scene({
  width: W, height: H, duration: 61.5,
  fonts: [
    { family: SANS, file: 'Archivo.woff2', weight: '100 900' },
    { family: MONO, file: 'SpaceMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'SpaceMono-Bold.woff2', weight: '700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.5, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    header();
    captions(t);
  },
});
