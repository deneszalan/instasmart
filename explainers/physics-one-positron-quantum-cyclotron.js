// Explainer for physics-one-positron-quantum-cyclotron: in October 2026 Gerald Gabrielse's group at
// Northwestern University reported a single positron held for months in a Penning trap, cold enough to sit
// in its lowest quantum state. How a Penning trap holds antimatter without touching it, and why the team
// wants to compare the positron's magnet with the electron's. Look: a cold lab in dark teal with a faint
// instrument grid, copper electrodes, pale ice-blue magnetic field lines, the positron in magenta and the
// electron in cyan, microwaves in lime. JetBrains Mono for labels and numbers, Rubik for captions.
//
// Facts: Myers, Soucy, Sukra, Sinha and Gabrielse, "One-Positron Quantum Cyclotron" (arXiv:2605.08147,
// accepted in Physical Review Letters; Physics World, 20 October 2026): a single positron suspended in the
// magnetic field of a Penning trap with its lowest cyclotron and spin levels resolved; B = 5.6 T from a 4.2 K
// superconducting solenoid; trap and sealed vacuum enclosure at 300 mK; positrons from a weak 18 µCi sodium-22
// source with kinetic energy up to 546 keV, slowed in a single-crystal tungsten moderator, cooled until the
// thermal cyclotron energy is 26 µeV; cyclotron and spin frequencies both about 156 GHz; an electrostatic
// quadrupole from the electrodes makes it oscillate along the axis at about 206 MHz; one-quantum cyclotron
// excitations driven by 156 GHz microwaves and detected without destroying the state; "a single positron has
// been trapped for months"; the electron magnetic moment is known to 1 part in 10¹³ from a one-electron
// quantum cyclotron; comparing positron and electron should give the most stringent test of CPT invariance
// for leptons. Physics World: if CPT holds, the positron's magnetic moment should exactly match the
// electron's. Interesting Engineering (October 2026): antimatter annihilates on contact with ordinary matter;
// the positron is held in a vacuum by magnetic and electric fields.
//
// Computed here: the energy ratio 546 keV / 26 µeV ≈ 2.1 × 10¹⁰. The drawn motions are slowed by many
// orders of magnitude and the cyclotron circle is enlarged; their frequencies are given as numbers instead.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–18.6  Hook: Northwestern, antimatter; the positron; annihilation; held by fields alone.
//  B 18.8–23.2  Sodium-22 and a tungsten crystal.
//  C 23.4–41.6  The Penning trap: circles in the magnet, escape along the field, end caps, the bounce.
//  D 41.8–55.4  Cold: the quantum ladder, the energy drop, microwave quantum jumps.
//  E 55.6–64.8  The magnets of positron and electron; CPT symmetry.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#021015', bg1: '#06262e', ink: '#eafcff', soft: 'rgba(234,252,255,0.72)', faint: 'rgba(234,252,255,0.26)',
  pos: '#ff4fa3', ele: '#46d9ff', copper: '#d08a4e', copperLo: 'rgba(208,138,78,0.18)', field: 'rgba(169,230,255,0.5)',
  lime: '#c8ff5a', gamma: '#fff3b0', panel: 'rgba(2,14,18,0.82)', grey: '#7d8f96',
};
const LAB = 'JetBrains Mono', CAP = 'Rubik';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers from the paper ----------
const B_T = 5.6, F_CYC = 156e9, F_AX = 206e6, T_MK = 300, E_START = 546e3, E_COLD = 26e-6; // tesla, Hz, mK, eV
const RATIO = E_START / E_COLD; // ≈ 2.1e10
const billions = (x) => `${Math.round(x / 1e9)} billion`;
const millions = (x) => `${Math.round(x / 1e6)} million`;

const CUES = [
  [0.4, 4.8, 'In October 2026, physicists at Northwestern University in the US reported a feat with *antimatter*.'],
  [5.0, 9.4, 'Gerald Gabrielse’s team held a single *positron*, the electron’s antimatter twin, for months.'],
  [9.6, 14.0, 'It has an electron’s mass but the opposite charge. If it touches matter, both vanish in a ~flash~.'],
  [14.2, 18.6, 'So nothing may ever touch it. It has to float in a vacuum, held by magnetism and electricity alone.'],
  [18.8, 23.2, 'It starts out fast, shot from radioactive *sodium-22*, and is slowed down in a crystal of tungsten.'],
  [23.4, 27.8, `In a *${B_T}-tesla* magnet, a moving charge is bent into circles: ${billions(F_CYC)} turns a second.`],
  [28.0, 32.4, 'That stops it wandering sideways, but it could still slide out along the field lines.'],
  [32.6, 37.0, `So electrodes at both ends push it back. It bounces to and fro *${millions(F_AX)}* times a second.`],
  [37.2, 41.6, 'Magnetism holds it in, electricity caps the ends: this is a *Penning trap*.'],
  [41.8, 46.2, `Chilled to *${T_MK / 1000} degrees* above absolute zero, its circling settles into the lowest quantum state.`],
  [46.4, 50.8, `Its energy falls from up to 546,000 electronvolts to 0.000026: some ${Math.round(RATIO / 1e10) * 10} billion times less.`],
  [51.0, 55.4, 'Now microwaves can lift it one ^quantum step^ at a time, and the team can see each jump.'],
  [55.6, 60.0, 'Next: measure its tiny inner *magnet* as finely as the electron’s, to 1 part in 10 trillion.'],
  [60.2, 64.6, 'Theory says the two must be exactly equal. Any difference would break a deep rule: *CPT symmetry*.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H * 0.45, H * 0.75);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(120,220,240,0.05)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

// a particle: a glowing ball with its charge sign drawn as lines (no special glyphs)
function particle(x, y, r, col, sign, a = 1) {
  A(a, () => {
    ctx.fillStyle = col; ctx.globalAlpha *= 0.35; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= 0.35;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (sign && r > 14) {
      ctx.strokeStyle = '#06141a'; ctx.lineWidth = Math.max(3, r * 0.16); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x + r * 0.45, y); ctx.stroke();
      if (sign > 0) { ctx.beginPath(); ctx.moveTo(x, y - r * 0.45); ctx.lineTo(x, y + r * 0.45); ctx.stroke(); }
    }
  });
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 18.4, 19.0);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.3, 9.4, 0.5, 0.5), () => {
      font(700, 24); text('NORTHWESTERN UNIVERSITY · OCT 2026', 52, 96, { color: C.pos, base: 'middle', spacing: '1px' });
      font(700, 54, CAP); text('One positron, kept for months', 52, 150, { color: C.ink, base: 'middle' });
    });
    // electron and positron side by side
    A(span(t, 1.0, 14.0, 0.6, 0.5), () => {
      const cxE = 270, cxP = 594, cy = 430, r = 54;
      particle(cxE, cy, r, C.ele, -1);
      if (t < 11.8) particle(cxP, cy, r, C.pos, 1);
      font(700, 30); text('electron', cxE, cy + 110, { color: C.ele, align: 'center', base: 'middle' });
      A(1 - seg(t, 11.6, 11.9), () => text('positron', cxP, cy + 110, { color: C.pos, align: 'center', base: 'middle' }));
      A(seg(t, 9.8, 10.4), () => {
        font(500, 26); text('same mass, opposite charge', W / 2, cy - 150, { color: C.ink, align: 'center', base: 'middle' });
      });
      A(seg(t, 5.4, 6.0) * (1 - seg(t, 9.4, 9.8)), () => {
        font(500, 24); text('matter', cxE, cy + 150, { color: C.soft, align: 'center', base: 'middle' });
        text('antimatter', cxP, cy + 150, { color: C.soft, align: 'center', base: 'middle' });
      });
    });
    // annihilation: a positron meets a wall of atoms
    A(span(t, 11.6, 14.2, 0.3, 0.4), () => {
      const wx = 760, p = seg(t, 11.8, 12.8);
      for (let i = 0; i < 6; i++) particle(wx + 30, 330 + i * 40, 12, C.grey, 0);
      const x = lerp(594, wx, eout(p)), y = 430;
      if (p < 1) particle(x, y, lerp(54, 20, p), C.pos, 1);
      const f = seg(t, 12.8, 13.8);
      if (f > 0) {
        A(1 - f, () => { ctx.fillStyle = C.gamma; ctx.beginPath(); ctx.arc(wx, y, 20 + 140 * eout(f), 0, Math.PI * 2); ctx.globalAlpha *= 0.5; ctx.fill(); });
        ctx.strokeStyle = C.gamma; ctx.lineWidth = 4;
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(wx, y); ctx.lineTo(wx - 260 * eout(f), y + s * 140 * eout(f)); ctx.stroke(); }
        font(700, 26); text('gamma rays', wx - 150, y - 110, { color: C.gamma, align: 'center', base: 'middle' });
      }
    });
    // held in a vacuum by fields
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(232, 250, 400, 360, 30); ctx.stroke();
      font(400, 22); text('vacuum', 432, 640, { color: C.soft, align: 'center', base: 'middle' });
      for (let i = -3; i <= 3; i++) { ctx.strokeStyle = C.field; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(432 + i * 50, 270); ctx.lineTo(432 + i * 50, 590); ctx.stroke(); }
      particle(432 + Math.sin(t * 2) * 6, 430 + Math.cos(t * 1.4) * 8, 16, C.pos, 1);
      font(700, 26); text('no walls touched', 432, 220, { color: C.pos, align: 'center', base: 'middle' });
    });
  });
}

// ---------- B: source and tungsten ----------
function sceneSource(t) {
  const a = span(t, 18.6, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // sodium-22 capsule
    ctx.fillStyle = '#3c4b52'; k.rrect(90, 380, 150, 100, 16); ctx.fill();
    font(700, 26); text('Na-22', 165, 430, { color: C.ink, align: 'center', base: 'middle' });
    font(400, 22); text('radioactive sodium', 165, 510, { color: C.soft, align: 'center', base: 'middle' });
    // tungsten crystal
    ctx.fillStyle = 'rgba(160,180,190,0.35)'; ctx.fillRect(440, 340, 60, 180);
    ctx.strokeStyle = 'rgba(200,220,230,0.6)'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(455 + j * 30, 355 + i * 30, 6, 0, Math.PI * 2); ctx.stroke(); }
    font(400, 22); text('tungsten crystal', 470, 550, { color: C.soft, align: 'center', base: 'middle' });
    // a fast positron in, a slow one out
    const p = seg(t, 19.4, 20.6), q = seg(t, 20.8, 23.0);
    if (p > 0 && p < 1) { const x = lerp(250, 440, p); particle(x, 430, 12, C.pos, 1); ctx.strokeStyle = 'rgba(255,79,163,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 90, 430); ctx.lineTo(x - 14, 430); ctx.stroke(); }
    if (q > 0) { const x = lerp(510, 640, q); particle(x, 430, 12, C.pos, 1); }
    A(seg(t, 19.4, 19.9), () => { font(700, 24); text('fast', 330, 390, { color: C.pos, align: 'center', base: 'middle' }); });
    A(seg(t, 21.0, 21.5), () => { font(700, 24); text('slow', 600, 390, { color: C.pos, align: 'center', base: 'middle' }); });
  });
}

// ---------- C: the Penning trap ----------
const TX = 432, TY = 440, RX = 170, RY = 38; // trap centre and electrode ellipses
const CAP_TOP = TY - 210, CAP_BOT = TY + 210; // end cap centres
function band(yc, h, lit) {
  // a cylindrical electrode seen slightly from above, drawn as a translucent copper band
  const y0 = yc - h / 2, y1 = yc + h / 2;
  ctx.fillStyle = lit ? 'rgba(208,138,78,0.36)' : C.copperLo;
  ctx.beginPath(); ctx.ellipse(TX, y0, RX, RY, 0, Math.PI, 0, false); ctx.lineTo(TX + RX, y1); ctx.ellipse(TX, y1, RX, RY, 0, 0, Math.PI, false); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.copper; ctx.lineWidth = lit ? 4 : 2.5;
  ctx.beginPath(); ctx.ellipse(TX, y0, RX, RY, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(TX, y1, RX, RY, 0, 0, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(TX - RX, y0); ctx.lineTo(TX - RX, y1); ctx.moveTo(TX + RX, y0); ctx.lineTo(TX + RX, y1); ctx.stroke();
}
function sceneTrap(t) {
  const a = span(t, 23.2, 41.8, 0.6, 0.6);
  if (a <= 0) return;
  A(a, () => {
    // magnetic field lines
    const fl = eout(seg(t, 23.4, 24.6));
    for (let i = -4; i <= 4; i++) {
      const x = TX + i * 62;
      ctx.strokeStyle = C.field; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 740 - 600 * fl); ctx.lineTo(x, 740); ctx.stroke();
      if (fl > 0.9) { ctx.fillStyle = C.field; ctx.beginPath(); ctx.moveTo(x, 170); ctx.lineTo(x - 8, 186); ctx.lineTo(x + 8, 186); ctx.fill(); }
    }
    A(span(t, 23.6, 41.8), () => {
      chip(52, 64, 470, 70, () => { font(700, 28); text(`magnet: ${B_T} tesla`, 76, 99, { color: '#a9e6ff', base: 'middle' }); });
    });
    // electrodes from the bounce onwards
    const caps = seg(t, 32.6, 33.4), lit = t > 32.6;
    A(caps, () => { band(CAP_TOP, 50, lit); band(CAP_BOT, 50, lit); });
    A(seg(t, 36.0, 36.6) * 0.9, () => band(TY, 90, false));
    // the positron's motion, slowed down enormously
    const w = 7.5; // visual turns per scene second (the real one: 156 billion a second)
    const zEsc = t < 28.4 ? 0 : t < 32.6 ? (t - 28.4) * 70 : 0;
    const zB = t < 32.8 ? 0 : 150 * Math.sin((t - 32.8) * 2.2) * eout(seg(t, 32.8, 33.6));
    const zOf = (tt) => (tt < 32.6 ? (tt < 28.4 ? 0 : (tt - 28.4) * 70) : 150 * Math.sin((tt - 32.8) * 2.2) * eout(seg(tt, 32.8, 33.6)));
    const pos = (tt) => ({ x: TX + 62 * Math.cos(tt * w), y: TY + 15 * Math.sin(tt * w) - zOf(tt) });
    // trail
    ctx.strokeStyle = 'rgba(255,79,163,0.55)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const tt = t - 1.4 + (i / 80) * 1.4; if (tt < 23.4) continue; const p = pos(tt); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
    ctx.stroke();
    const p = pos(t);
    if (!(t > 31.6 && t < 32.6)) particle(p.x, p.y, 13, C.pos, 1);
    A(span(t, 24.2, 28.0), () => { font(700, 26); text(`${billions(F_CYC)} turns a second`, TX, TY + 90, { color: C.pos, align: 'center', base: 'middle' }); });
    A(span(t, 29.0, 32.6, 0.4, 0.2), () => { font(700, 30); text('escapes along the field', TX, 210, { color: C.pos, align: 'center', base: 'middle' }); });
    // the push from the end caps
    A(span(t, 33.2, 41.8), () => {
      font(700, 34);
      for (const [y, d] of [[CAP_TOP, 1], [CAP_BOT, -1]]) {
        text('+', TX - RX - 34, y, { color: C.copper, align: 'center', base: 'middle' });
        text('+', TX + RX + 34, y, { color: C.copper, align: 'center', base: 'middle' });
        ctx.strokeStyle = C.copper; ctx.fillStyle = C.copper; ctx.lineWidth = 4;
        const y0 = y + d * 40, y1 = y + d * 100;
        ctx.beginPath(); ctx.moveTo(TX + 230, y0); ctx.lineTo(TX + 230, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(TX + 230, y1 + d * 14); ctx.lineTo(TX + 220, y1); ctx.lineTo(TX + 240, y1); ctx.fill();
      }
      font(600, 22); text('end cap', 40, CAP_TOP, { color: C.copper, base: 'middle' });
      text('end cap', 40, CAP_BOT, { color: C.copper, base: 'middle' });
    });
    A(span(t, 33.6, 37.2), () => {
      font(700, 26); text(millions(F_AX), 40, TY - 30, { color: C.copper, base: 'middle' });
      font(500, 22); text('bounces', 40, TY + 4, { color: C.copper, base: 'middle' }); text('a second', 40, TY + 34, { color: C.copper, base: 'middle' });
    });
    // the name
    A(span(t, 37.2, 41.8, 0.4, 0.5), () => {
      chip(24, 360, 214, 150, () => {
        font(700, 24); text('magnet:', 42, 398, { color: '#a9e6ff', base: 'middle' });
        font(400, 22); text('no drifting', 42, 436, { color: C.soft, base: 'middle' }); text('sideways', 42, 468, { color: C.soft, base: 'middle' });
      });
      chip(626, 360, 214, 150, () => {
        font(700, 24); text('end caps:', 644, 398, { color: C.copper, base: 'middle' });
        font(400, 22); text('no sliding', 644, 436, { color: C.soft, base: 'middle' }); text('out', 644, 468, { color: C.soft, base: 'middle' });
      });
      font(400, 20); text('motion slowed down and enlarged', TX, 152, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- D: cold, the quantum ladder ----------
const LADDER = { x0: 470, x1: 760, y0: 640, step: 74 };
function rung(n) { return LADDER.y0 - n * LADDER.step; }
function sceneCold(t) {
  const a = span(t, 41.6, 55.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // thermometer
    const tx = 150, top = 220, bot = 640;
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; k.rrect(tx - 22, top, 44, bot - top, 22); ctx.stroke();
    const level = lerp(0.7, 0.04, eio(seg(t, 42.0, 44.4)));
    ctx.fillStyle = C.ele; k.rrect(tx - 12, bot - 10 - (bot - top - 20) * level, 24, (bot - top - 20) * level, 12); ctx.fill();
    ctx.beginPath(); ctx.arc(tx, bot + 10, 34, 0, Math.PI * 2); ctx.fill();
    font(700, 30); A(seg(t, 44.0, 44.6), () => text('0.3 K', tx + 44, top + 20, { color: C.ele, base: 'middle' }));
    font(400, 20); A(seg(t, 44.0, 44.6), () => text('300 mK', tx + 44, top + 54, { color: C.soft, base: 'middle' }));
    // the ladder of cyclotron energy levels: equally spaced
    for (let n = 0; n <= 5; n++) {
      ctx.strokeStyle = n === 0 ? C.ink : C.faint; ctx.lineWidth = n === 0 ? 4 : 3;
      ctx.beginPath(); ctx.moveTo(LADDER.x0, rung(n)); ctx.lineTo(LADDER.x1, rung(n)); ctx.stroke();
      font(400, 20); text(`n = ${n}`, LADDER.x1 + 14, rung(n), { color: C.soft, base: 'middle' });
    }
    font(400, 22); text('energy levels of its circling', LADDER.x0, rung(5) - 44, { color: C.soft, base: 'middle' });
    // the positron steps down to the bottom, then microwaves lift it one step and it falls back
    let n = 5 - Math.min(5, Math.floor(seg(t, 42.2, 45.4) * 6));
    let up = 0;
    for (const [a0, a1] of [[51.4, 52.8], [53.4, 54.8]]) if (t > a0 && t < a1) up = 1;
    n = Math.max(0, n) + (t > 51.0 ? up : 0);
    particle((LADDER.x0 + LADDER.x1) / 2, rung(n) - 18, 15, C.pos, 1);
    // microwaves
    A(span(t, 51.0, 55.4, 0.3, 0.3), () => {
      ctx.strokeStyle = C.lime; ctx.lineWidth = 4; ctx.beginPath();
      for (let x = 250; x <= LADDER.x0 + 70; x += 3) { const y = rung(0) - 18 + Math.sin((x - t * 300) / 14) * 12; x === 250 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      font(700, 26); text('microwaves, 156 GHz', 250, rung(0) - 70, { color: C.lime, base: 'middle' });
      for (const [a0, a1] of [[51.4, 52.8], [53.4, 54.8]]) A(span(t, a0, a1, 0.15, 0.15), () => { font(700, 24); text('one quantum jump', LADDER.x0 + 30, rung(1) - 52, { color: C.lime, base: 'middle' }); });
    });
    // the energy drop
    A(span(t, 46.4, 50.8, 0.4, 0.4), () => {
      chip(52, 64, 760, 120, () => {
        font(400, 22); text('energy', 76, 96, { color: C.soft, base: 'middle' });
        font(700, 36); text('546,000 eV', 76, 142, { color: C.pos, base: 'middle' });
        font(700, 36); text('→', 336, 142, { color: C.soft, base: 'middle' });
        font(700, 36); text('0.000026 eV', 400, 142, { color: C.ele, base: 'middle' });
      });
    });
  });
}

// ---------- E: the two magnets ----------
function magnet(x, y, col, sign, label1, label2, spin) {
  particle(x, y, 60, col, sign);
  // spin: an arrow round the equator, and the magnet's axis
  ctx.strokeStyle = col; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(x, y, 92, 24, 0, 0.2 + spin, Math.PI * 1.7 + spin); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y + 110); ctx.lineTo(x, y - 110); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 128); ctx.lineTo(x - 14, y - 104); ctx.lineTo(x + 14, y - 104); ctx.fill();
  font(700, 28); text(label1, x, y + 160, { color: col, align: 'center', base: 'middle' });
  font(400, 22); text(label2, x, y + 196, { color: C.soft, align: 'center', base: 'middle' });
}
function sceneMagnets(t) {
  const a = span(t, 55.4, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    const tilt = t > 60.2 ? eio(seg(t, 60.4, 61.6)) : 0;
    const by = 400 - 0 * tilt;
    magnet(250, by, C.ele, -1, 'electron', 'known to 1 part in 10 trillion', t * 2.2);
    magnet(614, by, C.pos, 1, 'positron', 'next', t * 2.2);
    A(span(t, 55.8, 60.2), () => { font(700, 28); text('each is a tiny magnet', W / 2, 180, { color: C.ink, align: 'center', base: 'middle' }); });
    A(seg(t, 60.4, 61.2), () => {
      chip(222, 140, 420, 84, () => {
        font(800, 46, CAP); text('equal?', 432, 182, { color: C.ink, align: 'center', base: 'middle' });
      });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(330, by); ctx.lineTo(534, by); ctx.stroke(); ctx.setLineDash([]);
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneSource(t);
    sceneTrap(t);
    sceneCold(t);
    sceneMagnets(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.pos, '~': C.gamma, '^': C.lime } });
  },
});
