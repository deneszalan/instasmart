// Explainer for tech-enigma-never-itself: the reflector means no letter can encrypt to itself.
// Look: a dark walnut box seen from above, a black crinkle-paint panel with brass rotor wheels, a
// glowing lamp board and black round keys. Oswald for the machine's letters, Source Sans 3 for
// captions.
//
// Scene plan (60.8 s). Captions centred at y = 836, on the wood below the panel.
//  A  0.0– 9.7  Hook. Press A: the right rotor steps, lamp B lights. "Fatal flaw: never itself."
//  B  9.7–18.4  Stepping. Press A four more times: D, Z, G, O. The right rotor steps on every press.
//  C 18.4–37.4  Path (simplified diagram). For that first press, the current runs from A through the
//               right, middle and left rotors to the reflector and back by another route to B. The
//               reflector pairs the 26 letters into 13 pairs, none with itself, so the way back can
//               never end at the start.
//  D 37.4–45.6  Reciprocal. At the same setting, B runs the same route backwards and lights A.
//  E 45.6–60.8  Cribs. A guessed word, WETTER, slides along a ciphertext; any position where a letter
//               lines up with itself is struck out. The survivors glow.
//
// The machine is simulated below: a simplified 3-rotor Enigma (no plugboard, ring settings at A),
// using the wirings of rotors I, II, III and reflector B, with the right rotor stepping before each
// press and the middle rotor's double step. It gives the standard check: AAAAA → BDZGO from AAA.
// Facts (Wikipedia, "Enigma machine"): the rightmost rotor steps with every key press, before the
// connection is made; current runs from the keyboard through the plugboard and entry wheel, the
// rotors and the reflector, and back through the rotors to light a lamp; the reflector made the
// machine self-reciprocal and meant no letter ever encrypted to itself, a flaw codebreakers exploited.
// Wikipedia, "Cryptanalysis of the Enigma": a crib position could be ruled out if any letter
// matched; the crib WETTER ("weather"); cribs were fundamental to the British approach at Bletchley
// Park, and the bombe was built for crib-based work. The ciphertext in scene E is simulated.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  wood0: '#5A3420', wood1: '#3A2013', wood2: '#22120A', plate: '#151311', plateHi: '#24211E',
  brass: '#C9A24C', brassHi: '#F3D98C', brassDark: '#7A5A1E', ivory: '#EFE6D0', ivorySoft: 'rgba(239,230,208,0.7)',
  lamp: '#FFD36A', lampHot: '#FFF4C8', glassOff: '#2B2823', red: '#E0533F', green: '#7FCB7A', wire: 'rgba(239,230,208,0.13)',
  fwd: '#FFC94D', bwd: '#FF7B54',
};
const SANS = 'SourceSans', DISPLAY = 'Oswald';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ivory, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- a simplified Enigma ----------
const AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ROTORS = [
  { name: 'I', wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },  // left
  { name: 'II', wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // middle
  { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // right
];
const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
const idx = (ch) => AB.indexOf(ch);
const fwdMap = (r, p, c) => (idx(ROTORS[r].wiring[(c + p) % 26]) - p + 26) % 26;
const bwdMap = (r, p, c) => (ROTORS[r].wiring.indexOf(AB[(c + p) % 26]) - p + 26) % 26;
function machine(start) {
  const pos = [...start].map(idx);
  const step = () => {
    const atNotch = (r) => AB[pos[r]] === ROTORS[r].notch;
    if (atNotch(1)) { pos[1] = (pos[1] + 1) % 26; pos[0] = (pos[0] + 1) % 26; } else if (atNotch(2)) pos[1] = (pos[1] + 1) % 26;
    pos[2] = (pos[2] + 1) % 26;
  };
  /** Press a key: step, then follow the current. Returns the lamp and the contacts it passed. */
  const press = (ch) => {
    step();
    const path = [idx(ch)];
    let c = idx(ch);
    for (let r = 2; r >= 0; r--) { c = fwdMap(r, pos[r], c); path.push(c); }
    c = idx(REFLECTOR[c]); path.push(c);
    for (let r = 0; r <= 2; r++) { c = bwdMap(r, pos[r], c); path.push(c); }
    return { out: AB[c], path, pos: [...pos] };
  };
  return { press };
}
const START = 'AAA';
const PRESSES = (() => { const m = machine(START); return [...'AAAAA'].map((ch) => m.press(ch)); })();
const OUT = PRESSES.map((p) => p.out).join('');
if (OUT !== 'BDZGO') throw new Error('simulator check failed: ' + OUT);
const FIRST = PRESSES[0];
// No letter can come out as itself, at any setting: checked over every key at many settings.
{ const m = machine('QDV'); for (let i = 0; i < 2000; i++) { const ch = AB[i % 26]; if (m.press(ch).out === ch) throw new Error('self-encryption'); } }
// Reciprocal: at the first press's setting, the lamp's letter leads back to the key.
const backOf = (pos, ch) => { let c = idx(ch); for (let r = 2; r >= 0; r--) c = fwdMap(r, pos[r], c); c = idx(REFLECTOR[c]); for (let r = 0; r <= 2; r++) c = bwdMap(r, pos[r], c); return AB[c]; };
if (backOf(FIRST.pos, FIRST.out) !== 'A') throw new Error('not reciprocal');

// The crib demo: a made-up message enciphered from another setting.
const PLAIN = 'MORGENWETTERKLAR', CRIB = 'WETTER', CRIB_AT = PLAIN.indexOf(CRIB);
const CIPHER = (() => { const m = machine('CAR'); return [...PLAIN].map((ch) => m.press(ch).out).join(''); })();
const SLOTS = Array.from({ length: CIPHER.length - CRIB.length + 1 }, (_, p) => {
  const hits = [...CRIB].map((ch, i) => CIPHER[p + i] === ch);
  return { p, hits, ok: !hits.some(Boolean) };
});
const N_OK = SLOTS.filter((s) => s.ok).length;

// ---------- timeline ----------
const CUES = [
  [0.4, 5.3, 'Press a key on an *Enigma* machine and a lamp lights another letter.'],
  [5.4, 9.7, 'Its fatal flaw: a letter could ~never~ light up as itself.'],
  [9.8, 14.8, `Keep pressing A: *${OUT.split('').join(', ')}*. The right rotor steps.`],
  [14.9, 18.4, 'So the wiring shifts with every key press.'],
  [18.6, 23.2, 'Inside, the current runs through three rotors to a *reflector*…'],
  [23.3, 27.4, '…which sends it back through the rotors by another route.'],
  [27.5, 32.2, 'The reflector pairs letters up, and no letter is paired with itself.'],
  [32.3, 37.4, 'So the way back never ends where it began: no letter lights itself.'],
  [37.5, 42.0, `It works backwards too: at the same setting, ${FIRST.out} lights *A*.`],
  [42.1, 45.6, 'So one machine both encrypts and decrypts.'],
  [45.9, 50.4, 'Codebreakers guessed likely words, called *cribs*, like ~WETTER~.'],
  [50.7, 55.6, 'Slide it along: where a letter meets itself, that spot is impossible.'],
  [55.7, 60.5, 'Fewer spots to try: cribs were key to Bletchley Park’s *bombes*.'],
];
const DUR = 60.8;
const c = (i) => CUES[i][0];
const PRESS_T = [2.2, c(2) + 0.6, c(2) + 1.5, c(2) + 2.4, c(2) + 3.3];
const T = { machine: [0, c(4) - 0.1], diagram: [c(4) - 0.3, c(10) - 0.1], crib: [c(10) - 0.3, DUR] };

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- walnut box and panel, painted once ----------
const PLATE = { x: 40, y: 118, w: W - 80, h: 660 };
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.wood0); lg.addColorStop(0.55, C.wood1); lg.addColorStop(1, C.wood2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // walnut grain: long wavy streaks
  const rnd = mulberry32(17);
  for (let i = 0; i < 170; i++) {
    const y0 = rnd() * H, amp = 6 + rnd() * 18, fr = 0.004 + rnd() * 0.006, ph = rnd() * 6;
    g.strokeStyle = rnd() < 0.6 ? `rgba(20,8,2,${0.10 + rnd() * 0.16})` : `rgba(160,100,60,${0.05 + rnd() * 0.07})`;
    g.lineWidth = 0.8 + rnd() * 2.4;
    g.beginPath();
    for (let x = -10; x <= W + 10; x += 12) { const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.1 + ph) * amp * 0.25; if (x < 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
  }
  // the black crinkle-paint panel
  g.save(); g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = C.plate; g.beginPath(); g.roundRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16); g.fill(); g.restore();
  const pg = g.createRadialGradient(W / 2, 330, 40, W / 2, 420, 600);
  pg.addColorStop(0, 'rgba(255,240,210,0.06)'); pg.addColorStop(1, 'rgba(0,0,0,0.2)');
  g.fillStyle = pg; g.beginPath(); g.roundRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16); g.fill();
  for (let i = 0; i < 2400; i++) {
    const x = PLATE.x + rnd() * PLATE.w, y = PLATE.y + rnd() * PLATE.h;
    g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.25)';
    g.fillRect(x, y, 2, 2);
  }
  g.strokeStyle = 'rgba(201,162,76,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(PLATE.x + 8, PLATE.y + 8, PLATE.w - 16, PLATE.h - 16, 12); g.stroke();
  for (const [x, y] of [[PLATE.x + 24, PLATE.y + 24], [PLATE.x + PLATE.w - 24, PLATE.y + 24], [PLATE.x + 24, PLATE.y + PLATE.h - 24], [PLATE.x + PLATE.w - 24, PLATE.y + PLATE.h - 24]]) screw(g, x, y);
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function screw(g, x, y) {
  const sg = g.createRadialGradient(x - 2, y - 2, 1, x, y, 8);
  sg.addColorStop(0, C.brassHi); sg.addColorStop(1, C.brassDark);
  g.fillStyle = sg; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
  g.strokeStyle = 'rgba(40,25,5,0.8)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 5, y + 2); g.lineTo(x + 5, y - 2); g.stroke();
}

// ---------- rotors ----------
const ROTOR_X = [300, 432, 564], ROTOR_Y = 214;
/** Rotor letter at time t, as a continuous value so steps glide. */
function rotorValue(r, t) {
  let v = idx(START[r]);
  PRESSES.forEach((p, i) => {
    const prev = i ? PRESSES[i - 1].pos[r] : idx(START[r]);
    const d = (p.pos[r] - prev + 26) % 26;
    v += d * eio(seg(t, PRESS_T[i] + 0.02, PRESS_T[i] + 0.32));
  });
  // the diagram uses the first press's setting: the rotor winds back to it while the panel changes
  const rew = eio(seg(t, T.machine[1] - 0.6, T.machine[1] + 0.6));
  return lerp(v, FIRST.pos[r], rew);
}
function rotors(t) {
  ROTOR_X.forEach((x, r) => {
    const v = rotorValue(r, t);
    // the brass thumb wheel, to the right of the window
    const wx = x + 44, wy = ROTOR_Y - 62, ww = 24, wh = 124;
    const bg = ctx.createLinearGradient(wx, 0, wx + ww, 0);
    bg.addColorStop(0, C.brassDark); bg.addColorStop(0.45, C.brassHi); bg.addColorStop(1, C.brassDark);
    ctx.fillStyle = bg; rrect(wx, wy, ww, wh, 8); ctx.fill();
    ctx.save(); rrect(wx, wy, ww, wh, 8); ctx.clip();
    ctx.strokeStyle = 'rgba(60,40,8,0.55)'; ctx.lineWidth = 2;
    const off = (v * 9) % 9;
    for (let y = wy - 9; y < wy + wh + 9; y += 9) { ctx.beginPath(); ctx.moveTo(wx, y + off); ctx.lineTo(wx + ww, y + off); ctx.stroke(); }
    ctx.restore();
    // the window with the letter ring
    const bx = x - 36, by = ROTOR_Y - 50, bw = 72, bh = 100;
    ctx.fillStyle = '#0A0908'; rrect(bx - 6, by - 6, bw + 12, bh + 12, 10); ctx.fill();
    ctx.save(); rrect(bx, by, bw, bh, 6); ctx.clip();
    const rg = ctx.createLinearGradient(0, by, 0, by + bh);
    rg.addColorStop(0, '#6E6658'); rg.addColorStop(0.5, '#F0E8D2'); rg.addColorStop(1, '#6E6658');
    ctx.fillStyle = rg; ctx.fillRect(bx, by, bw, bh);
    const lh = 58;
    const base = Math.floor(v);
    for (let d = -2; d <= 2; d++) {
      const li = base + d, y = ROTOR_Y + (li - v) * lh;
      font(600, 46, DISPLAY);
      text(AB[((li % 26) + 26) % 26], x, y + 2, { color: '#1A1612', align: 'center', base: 'middle' });
    }
    ctx.restore();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 3; rrect(bx - 6, by - 6, bw + 12, bh + 12, 10); ctx.stroke();
    font(600, 24, DISPLAY); text(ROTORS[r].name, x, ROTOR_Y - 84, { color: C.brass, align: 'center', base: 'middle', spacing: '2px' });
  });
  font(600, 22); text('ROTORS', ROTOR_X[0] - 150, ROTOR_Y - 10, { color: C.ivorySoft, align: 'center', base: 'middle', spacing: '3px' });
  font(600, 22); text('right one', ROTOR_X[2] + 150, ROTOR_Y - 10, { color: C.ivorySoft, align: 'center', base: 'middle' });
  font(600, 22); text('steps', ROTOR_X[2] + 150, ROTOR_Y + 16, { color: C.ivorySoft, align: 'center', base: 'middle' });
}

// ---------- lamps and keys ----------
const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
const LAMP_Y = [404, 472, 540], KEY_Y = [624, 682, 740], PITCH = 76;
const rowX = (ri, i) => W / 2 + (i - (ROWS[ri].length - 1) / 2) * PITCH;
const where = (ch, ys) => { for (let ri = 0; ri < 3; ri++) { const i = ROWS[ri].indexOf(ch); if (i >= 0) return { x: rowX(ri, i), y: ys[ri] }; } };
function lampLevel(ch, t) {
  let a = 0;
  PRESSES.forEach((p, i) => { if (p.out === ch) a = Math.max(a, span(t, PRESS_T[i] + 0.25, (PRESS_T[i + 1] ?? PRESS_T[i] + 2.4) - 0.05, 0.12, 0.25)); });
  return a;
}
function keyDown(ch, t) {
  let d = 0;
  PRESSES.forEach((p, i) => { if (ch === 'A') d = Math.max(d, span(t, PRESS_T[i] - 0.05, PRESS_T[i] + 0.45, 0.1, 0.2)); });
  return d;
}
function lampsAndKeys(t) {
  for (let ri = 0; ri < 3; ri++) for (let i = 0; i < ROWS[ri].length; i++) {
    const ch = ROWS[ri][i], x = rowX(ri, i);
    // lamp
    const y = LAMP_Y[ri], lit = lampLevel(ch, t);
    ctx.fillStyle = C.glassOff; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(201,162,76,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    if (lit > 0) withAlpha(lit, () => {
      const gl = ctx.createRadialGradient(x, y, 2, x, y, 62);
      gl.addColorStop(0, 'rgba(255,230,150,0.55)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 62, 0, 7); ctx.fill();
      const lg2 = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, 26);
      lg2.addColorStop(0, C.lampHot); lg2.addColorStop(1, C.lamp);
      ctx.fillStyle = lg2; ctx.beginPath(); ctx.arc(x, y, 25, 0, 7); ctx.fill();
    });
    font(500, 30, DISPLAY);
    text(ch, x, y + 1, { color: lit > 0.5 ? '#3A2608' : 'rgba(239,230,208,0.5)', align: 'center', base: 'middle' });
    // key
    const ky = KEY_Y[ri], down = keyDown(ch, t);
    const kr = 23 - down * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(x + 2, ky + 4 - down * 3, kr + 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#C9C2B2'; ctx.beginPath(); ctx.arc(x, ky + down * 3, kr + 3, 0, 7); ctx.fill();
    ctx.fillStyle = down > 0.3 ? '#0B0A09' : '#161412'; ctx.beginPath(); ctx.arc(x, ky + down * 3, kr, 0, 7); ctx.fill();
    font(600, 24, DISPLAY); text(ch, x, ky + 1 + down * 3, { color: C.ivory, align: 'center', base: 'middle' });
  }
  font(600, 22); text('LAMPS', 76, LAMP_Y[0] - 46, { color: C.ivorySoft, spacing: '3px' });
  font(600, 22); text('KEYS', 76, KEY_Y[0] - 42, { color: C.ivorySoft, spacing: '3px' });
  // the self-lamp marked during the hook's second caption
  const sa = span(t, c(1) + 0.6, c(2), 0.4, 0.4);
  if (sa > 0) withAlpha(sa, () => {
    const p = where('A', LAMP_Y);
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.arc(p.x, p.y, 33, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(p.x - 22, p.y - 22); ctx.lineTo(p.x + 22, p.y + 22); ctx.stroke();
    const kp = where('A', KEY_Y);
    ctx.beginPath(); ctx.arc(kp.x, kp.y, 30, 0, 7); ctx.stroke();
  });
  // the record of presses
  const ra = span(t, 2.6, T.machine[1], 0.4, 0.3);
  if (ra > 0) withAlpha(ra, () => {
    const n = PRESSES.filter((_, i) => t >= PRESS_T[i] + 0.25).length;
    font(500, 30, DISPLAY);
    const s1 = 'A'.repeat(n).split('').join(' '), s2 = OUT.slice(0, n).split('').join(' ');
    text('KEY', 230, 330, { color: C.ivorySoft, align: 'right', base: 'middle' });
    text(s1, 250, 330, { color: C.ivory, base: 'middle', spacing: '2px' });
    text('LAMP', 538, 330, { color: C.ivorySoft, align: 'right', base: 'middle' });
    text(s2, 558, 330, { color: C.lamp, base: 'middle', spacing: '2px' });
  });
}

// ---------- the wiring diagram ----------
const DY0 = 352, DSP = 15.4; // 26 contact rows
const rowY = (i) => DY0 + i * DSP;
const COLX = { entry: 132, r: [236, 330], m: [396, 490], l: [556, 650], refl: 706 };
const BLOCKS = [COLX.l, COLX.m, COLX.r]; // index by rotor number 0 = left
function routePoints(path, pos) {
  // path: [key, after R, after M, after L, after reflector, after L, after M, after R]
  const pts = [[COLX.entry, rowY(path[0])], [COLX.r[0], rowY(path[0])], [COLX.r[1], rowY(path[1])], [COLX.m[0], rowY(path[1])], [COLX.m[1], rowY(path[2])], [COLX.l[0], rowY(path[2])], [COLX.l[1], rowY(path[3])], [COLX.refl, rowY(path[3])]];
  const back = [[COLX.refl, rowY(path[4])], [COLX.l[1], rowY(path[4])], [COLX.l[0], rowY(path[5])], [COLX.m[1], rowY(path[5])], [COLX.m[0], rowY(path[6])], [COLX.r[1], rowY(path[6])], [COLX.r[0], rowY(path[7])], [COLX.entry, rowY(path[7])]];
  return { fwd: pts, back };
}
function polyline(pts, f, color, width, glow = 0) {
  if (f <= 0) return;
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let left = total * f;
  const draw = (w, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    let rem = left;
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const u = Math.min(1, rem / lens[i - 1]);
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u));
      rem -= lens[i - 1];
    }
    ctx.stroke();
  };
  if (glow) draw(width + 8, color.replace('rgb(', 'rgba(').replace(')', `,${0.25 * glow})`));
  draw(width, color);
  // the head of the current
  if (f < 1) {
    let rem = left, hx = pts[0][0], hy = pts[0][1];
    for (let i = 1; i < pts.length; i++) { if (rem <= lens[i - 1]) { const u = rem / lens[i - 1]; hx = lerp(pts[i - 1][0], pts[i][0], u); hy = lerp(pts[i - 1][1], pts[i][1], u); break; } rem -= lens[i - 1]; }
    const hg = ctx.createRadialGradient(hx, hy, 1, hx, hy, 18);
    hg.addColorStop(0, 'rgba(255,250,220,0.95)'); hg.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 18, 0, 7); ctx.fill();
  }
}
const rgbStr = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',')})`;
function reflectorArc(i, j, a, color, width) {
  const y1 = rowY(i), y2 = rowY(j), bulge = 10 + Math.abs(j - i) * 2.4;
  withAlpha(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(COLX.refl, y1); ctx.bezierCurveTo(COLX.refl + bulge, y1, COLX.refl + bulge, y2, COLX.refl, y2); ctx.stroke();
  });
}
function tag(s, x, y, color, a = 1, align = 'right') {
  if (a <= 0) return;
  withAlpha(a, () => {
    font(600, 26, DISPLAY);
    const w = ctx.measureText(s).width + 20;
    const x0 = align === 'right' ? x - w : x;
    ctx.fillStyle = 'rgba(10,9,8,0.9)'; rrect(x0, y - 18, w, 36, 8); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    text(s, x0 + w / 2, y + 1, { color, align: 'center', base: 'middle' });
  });
}
/** A tag left of the entry column for contact row i, nudged above (dir -1) or below (dir 1). */
function tagAt(s, i, dir, color, a) {
  if (a <= 0) return;
  const y = rowY(i), ty = y + dir * 26;
  withAlpha(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(COLX.entry - 4, y); ctx.lineTo(COLX.entry - 20, ty); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(COLX.entry, y, 4.5, 0, 7); ctx.fill();
  });
  tag(s, COLX.entry - 20, ty, color, a);
}
function diagram(t) {
  const pos = FIRST.pos;
  const reverse = span(t, c(8) + 0.2, T.diagram[1], 0.3, 0.3);
  // rotor blocks with all their wires, faint
  [2, 1, 0].forEach((r) => {
    const [x0, x1] = BLOCKS[r];
    ctx.fillStyle = 'rgba(201,162,76,0.10)'; rrect(x0 - 6, DY0 - 16, x1 - x0 + 12, DSP * 25 + 32, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(201,162,76,0.45)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = C.wire; ctx.lineWidth = 1.3;
    for (let cIn = 0; cIn < 26; cIn++) { ctx.beginPath(); ctx.moveTo(x0, rowY(cIn)); ctx.lineTo(x1, rowY(fwdMap(r, pos[r], cIn))); ctx.stroke(); }
    font(600, 24, DISPLAY); text(ROTORS[r].name, (x0 + x1) / 2, DY0 - 56, { color: C.brass, align: 'center', base: 'middle' });
  });
  // contacts
  ctx.fillStyle = 'rgba(239,230,208,0.45)';
  for (let i = 0; i < 26; i++) for (const x of [COLX.entry, COLX.r[0], COLX.r[1], COLX.m[0], COLX.m[1], COLX.l[0], COLX.l[1], COLX.refl]) { ctx.beginPath(); ctx.arc(x, rowY(i), 2.4, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(239,230,208,0.12)'; ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.moveTo(COLX.entry, rowY(i)); ctx.lineTo(COLX.r[0], rowY(i)); ctx.stroke(); }
  font(600, 22); text('KEYS & LAMPS', COLX.entry, DY0 - 56, { color: C.ivorySoft, align: 'center', base: 'middle', spacing: '1px' });
  font(600, 22); text('REFLECTOR', COLX.refl + 20, DY0 - 56, { color: C.ivorySoft, align: 'center', base: 'middle', spacing: '1px' });
  // the reflector's 13 pairs: faint until their caption, then lit
  const pairsA = 0.22 + 0.6 * span(t, c(6) + 0.3, c(8), 0.8, 0.6);
  const seen = new Set();
  for (let i = 0; i < 26; i++) {
    const j = idx(REFLECTOR[i]);
    if (seen.has(i)) continue; seen.add(i); seen.add(j);
    const on = (i === FIRST.path[3] || j === FIRST.path[3]);
    const grow = eout(seg(t, c(6) + 0.3 + (i % 13) * 0.08, c(6) + 0.8 + (i % 13) * 0.08));
    reflectorArc(i, j, on ? 0 : pairsA * (0.5 + 0.5 * grow), 'rgba(239,230,208,0.85)', 1.6);
  }
  // the route of the first press: forward, then back
  const { fwd, back: bk } = routePoints(FIRST.path, pos);
  const f1 = eio(seg(t, c(4) + 0.8, c(4) + 3.8)), f2 = eio(seg(t, c(5) + 0.3, c(5) + 3.0));
  withAlpha(1 - 0.55 * reverse, () => {
    polyline(fwd, f1, rgbStr(C.fwd), 4, 1);
    if (f1 >= 1) {
      const [i, j] = [FIRST.path[3], FIRST.path[4]];
      reflectorArc(i, j, 1, C.fwd, 4);
    }
    polyline(bk, f2, rgbStr(C.bwd), 4, 1);
  });
  // the key's row sits just above the lamp's, so the two tags go above and below, with leader lines
  tagAt(`key ${AB[FIRST.path[0]]}`, FIRST.path[0], -1, C.fwd, eout(seg(t, c(4) + 0.4, c(4) + 0.9)) * (1 - reverse));
  tagAt(`lamp ${FIRST.out}`, FIRST.path[7], 1, C.bwd, eout(seg(t, c(5) + 2.8, c(5) + 3.3)) * (1 - reverse));
  // why not itself: a loop at the reflector, crossed out
  const why = span(t, c(7) + 0.4, c(8) + 0.2, 0.4, 0.4);
  if (why > 0) withAlpha(why, () => {
    const y = rowY(FIRST.path[3]), x = COLX.refl;
    ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 70, y - 46, x + 70, y + 46, x, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 32, y - 18); ctx.lineTo(x + 64, y + 18); ctx.moveTo(x + 64, y - 18); ctx.lineTo(x + 32, y + 18); ctx.stroke();
    // the way back would have to retrace the way in
    polyline(fwd, eio(seg(t, c(7) + 0.6, c(7) + 2.4)), 'rgb(224,83,63)', 2);
    tag('A → A: impossible', COLX.refl - 16, rowY(FIRST.path[3]) + 46, C.red, eout(seg(t, c(7) + 2.2, c(7) + 2.7)), 'right');
  });
  // reciprocal: a pulse from the lamp letter running the same route backwards
  if (reverse > 0) withAlpha(reverse, () => {
    const all = [...fwd, ...bk];
    const rev = [...all].reverse();
    polyline(rev, eio(seg(t, c(8) + 0.5, c(8) + 3.2)), 'rgb(127,203,122)', 4, 1);
    tagAt(`key ${FIRST.out}`, FIRST.path[7], 1, C.green, eout(seg(t, c(8) + 0.4, c(8) + 0.9)));
    tagAt('lamp A', FIRST.path[0], -1, C.green, eout(seg(t, c(8) + 3.1, c(8) + 3.6)));
  });
  font(600, 22); text('Simplified diagram: 3 rotors, no plugboard', W / 2, 762, { color: C.ivorySoft, align: 'center', base: 'middle' });
}

// ---------- cribs ----------
const CELL = 46, CX0 = W / 2 - (CIPHER.length * CELL) / 2, CY = 446;
function cribScene(t) {
  font(600, 24); text('INTERCEPTED MESSAGE (SIMULATED)', W / 2, CY - 112, { color: C.ivorySoft, align: 'center', base: 'middle', spacing: '2px' });
  // the ciphertext tape
  const ta = eout(seg(t, c(10) + 0.2, c(10) + 0.9));
  withAlpha(ta, () => {
    ctx.fillStyle = C.ivory; rrect(CX0 - 10, CY - 32, CIPHER.length * CELL + 20, 64, 6); ctx.fill();
    for (let i = 0; i < CIPHER.length; i++) {
      font(600, 36, DISPLAY);
      text(CIPHER[i], CX0 + i * CELL + CELL / 2, CY + 2, { color: '#1A1612', align: 'center', base: 'middle' });
    }
  });
  // the crib slides along, one position after another
  const s0 = c(11) + 0.3, per = 0.4;
  const slide = clamp((t - s0) / per, 0, SLOTS.length - 1);
  const settle = eio(seg(t, c(12) + 0.2, c(12) + 1.2));
  const pNow = lerp(slide, CRIB_AT, settle);
  const ca = eout(seg(t, c(10) + 1.6, c(10) + 2.3));
  const cy = CY + 76;
  withAlpha(ca, () => {
    const pi = Math.round(pNow), near = 1 - Math.min(1, Math.abs(pNow - pi) * 3);
    const slot = SLOTS[pi];
    for (let i = 0; i < CRIB.length; i++) {
      const x = CX0 + (pNow + i) * CELL + CELL / 2;
      const hit = t > s0 - 0.2 && settle < 0.5 && slot && slot.hits[i] ? near : 0;
      ctx.fillStyle = hit > 0.5 ? C.red : '#3A2E14'; rrect(x - CELL / 2 + 3, cy - 28, CELL - 6, 56, 6); ctx.fill();
      ctx.strokeStyle = C.lamp; ctx.lineWidth = 2; ctx.stroke();
      font(600, 34, DISPLAY); text(CRIB[i], x, cy + 2, { color: C.lampHot, align: 'center', base: 'middle' });
      if (hit > 0.5) { ctx.strokeStyle = C.red; ctx.lineWidth = 4; rrect(x - CELL / 2 + 1, CY - 30, CELL - 2, 60, 6); ctx.stroke(); }
    }
    font(600, 24); text('CRIB · WETTER = WEATHER', CX0 + (pNow + CRIB.length / 2) * CELL, cy + 52, { color: C.lamp, align: 'center', base: 'middle', spacing: '3px' });
  });
  // marks under each starting position: crossed out if any letter met itself
  SLOTS.forEach((s, i) => {
    const at = s0 + i * per + 0.2;
    const a = eout(seg(t, at, at + 0.25));
    if (a <= 0) return;
    const x = CX0 + i * CELL + CELL / 2, y = CY - 62;
    const glow = s.ok ? span(t, c(12) + 0.2, DUR, 0.5, 0) : 0;
    withAlpha(a, () => {
      if (s.ok) {
        if (glow > 0) withAlpha(glow, () => { ctx.fillStyle = 'rgba(127,203,122,0.25)'; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill(); });
        ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x - 2, y + 9); ctx.lineTo(x + 12, y - 10); ctx.stroke();
      } else {
        ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke();
      }
    });
  });
  const la = eout(seg(t, c(12) + 0.6, c(12) + 1.2));
  withAlpha(la, () => {
    font(700, 30);
    text(`${SLOTS.length - N_OK} of ${SLOTS.length} positions ruled out`, W / 2, cy + 130, { color: C.ivory, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ivory, marks: { '*': C.lamp, '~': C.bwd } });
  }
}

Kit.scene({
  width: W, height: H, duration: DUR,
  fonts: [
    { family: DISPLAY, file: 'Oswald.woff2' },
    { family: SANS, file: 'SourceSans3.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(700, 22); text('RECKON', 64, 84, { color: C.brass, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 6 * 3;
    font(600, 22); text('TECH · CODEBREAKING', 64 + rw + 20, 84, { color: C.ivorySoft, spacing: '3px' });
    rotors(t);
    withAlpha(span(t, ...T.machine, 0.6, 0.4), () => lampsAndKeys(t));
    withAlpha(span(t, ...T.diagram, 0.5, 0.4), () => diagram(t));
    withAlpha(span(t, ...T.crib, 0.5, 0), () => cribScene(t));
    captions(t);
  },
});
