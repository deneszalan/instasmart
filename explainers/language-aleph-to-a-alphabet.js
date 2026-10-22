// Explainer for language-aleph-to-a-alphabet: the letter A may have begun as a picture of an ox's head.
// Look: three writing surfaces in turn. Carved sandstone (Proto-Sinaitic, Phoenician), then ink on
// papyrus (Greek), then a printed page (Latin A). One glyph, drawn as strokes, morphs and turns through
// every stage; a small chain of the stages builds up at the top. Cinzel for labels, Cardo for captions.
//
// Scene plan (60 s). Captions centred at y = 840; everything important above y = 930.
//  A  0.0–9.0   Hook. A carved capital A. "What is the letter A a picture of?" It turns over, grows horns
//               and eyes: an ox's head. "Turn it over: it may have begun as an ox's head."
//  B  9.0–20.0  Proto-Sinaitic. A painted Egyptian ox-head hieroglyph appears beside it with an arrow;
//               "Workers who spoke a Semitic language seem to have borrowed it from Egyptian hieroglyphs."
//               "The oldest such signs, scratched on rocks, date from about 1850 BC."
//  C 20.0–30.4  Phoenician. The head turns a quarter turn onto its side and simplifies into aleph.
//               "In the Phoenician alphabet, it lies on its side: aleph." / name 'ox', sound a glottal stop.
//  D 30.4–41.4  Greek, on papyrus in ink. "Greek had no such sound, so the Greeks made it the vowel a: alpha."
//               "Early Greek writing laid it on its side. Later, it stood upright." (it turns upright)
//  E 41.4–47.0  Print. The strokes become a printed Roman capital. "Through the Etruscans it reached the
//               Romans, and then English: A."
//  F 47.0–60.0  B. A moves left; on the right a house sign morphs into Phoenician bet, then B.
//               "B took the same road, from a sketch of a house: bet." / "And alpha plus beta gave us the
//               word alphabet: 'ox, house'."
//
// Facts (Wikipedia: "A", "Aleph", "Phoenician alphabet", "History of the alphabet", "Alphabet"):
// the earliest known ancestor of A is aleph, first letter of the Phoenician alphabet, a glottal stop, as
// Phoenician used only consonant letters; aleph's ancestor "may have been a pictogram of an ox head in
// proto-Sinaitic script influenced by Egyptian hieroglyphs, styled as a triangular head with two horns";
// aleph's name is from the West Semitic word for 'ox'. Proto-Sinaitic: West Semitic laborers in the Sinai,
// exposed to Egyptian hieroglyphs; "it has been conjectured" they picked hieroglyphs for sounds; oldest
// examples are graffiti in the Wadi el-Hol, c. 1850 BC. Phoenician: c. 1050 BC (conventional), 22 consonant
// letters, Alp 'ox, head of cattle' [ʔ], Bet 'house' [b]. Greek: no glottal stop, so the sign became the
// vowel a, named alpha; in the earliest Greek inscriptions (8th century BC) it rests upon its side, later
// it resembles the modern capital. The Etruscans kept its form; the Romans adopted the Etruscan alphabet
// (Latins adopted writing in about the 7th century BC). B: the hieroglyph per, a sketch of walls and a
// doorway meaning 'house', Semitic bayt, became the progenitor of B. 'Alphabet' comes from alpha and beta,
// whose names came from aleph, 'ox', and bet, 'house'.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const SERIF = 'Cardo', CAPS = 'Cinzel';

const C = {
  stoneInk: '#4E301B', stoneDeep: '#2E1A0C', stoneLight: 'rgba(255,238,206,0.62)',
  ink: '#22150C', print: '#151311', text: '#28170B', textSoft: 'rgba(40,23,11,0.72)',
  ochre: '#8A2B10', blue: '#1D4B73', egyptRed: '#9C3B1E', egyptBlue: '#2F5F7A',
};

const CUES = [
  [0.4, 3.8, 'What is the letter *A* a picture of?'],
  [4.0, 8.8, 'Turn it over: it may have begun as an *ox’s head*.'],
  [9.0, 14.4, 'Workers who spoke a Semitic language seem to have borrowed it from Egyptian hieroglyphs.'],
  [14.6, 19.8, 'The oldest such signs, scratched on rocks, date from about *1850 BC*.'],
  [20.2, 25.0, 'In the Phoenician alphabet, it lies on its side: *aleph*.'],
  [25.2, 30.2, 'Its name meant *‘ox’*, but its sound was a catch in the throat.'],
  [30.6, 35.8, 'Greek had no such sound, so the Greeks made it the vowel *a*: ~alpha~.'],
  [36.0, 41.2, 'Early Greek writing laid it on its side. Later, it stood upright.'],
  [41.6, 46.8, 'Through the Etruscans it reached the Romans, and then English: *A*.'],
  [47.2, 52.6, '*B* took the same road, from a sketch of a house: *bet*.'],
  [52.8, 59.4, 'And ~alpha~ plus *beta* gave us the word alphabet: ‘ox, house’.'],
];

let k, ctx;
const font = (weight, size, family = SERIF) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.text, ...opts });

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- surfaces, painted once ----------
function canvas2d() { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; }
function grain(g, rnd, amount) {
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let p = 0; p < d.length; p += 4) { const n = (rnd() - 0.5) * amount; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
  g.putImageData(img, 0, 0);
}
function paintStone() {
  const [c, g] = canvas2d(); const rnd = mulberry32(11);
  const base = g.createLinearGradient(0, 0, W * 0.4, H);
  base.addColorStop(0, '#D2B084'); base.addColorStop(0.55, '#C09A6C'); base.addColorStop(1, '#A98457');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { // wavy strata
    const y0 = rnd() * H, amp = 5 + rnd() * 12, th = 6 + rnd() * 26, ph = rnd() * 6;
    g.fillStyle = rnd() < 0.5 ? `rgba(110,70,40,${0.04 + rnd() * 0.06})` : `rgba(245,222,185,${0.05 + rnd() * 0.07})`;
    g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= W; x += 24) g.lineTo(x, y0 + Math.sin(x * 0.005 + ph) * amp);
    for (let x = W; x >= 0; x -= 24) g.lineTo(x, y0 + th + Math.sin(x * 0.005 + ph + 0.5) * amp);
    g.closePath(); g.fill();
  }
  grain(g, rnd, 22);
  for (let i = 0; i < 1100; i++) { // pits
    const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 2.4;
    g.fillStyle = `rgba(80,50,28,${0.12 + rnd() * 0.25})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,242,220,0.16)'; g.beginPath(); g.arc(x + 0.9, y + 0.9, r * 0.7, 0, 7); g.fill();
  }
  g.strokeStyle = 'rgba(70,42,22,0.22)'; g.lineWidth = 1.4; // hairline cracks
  for (let i = 0; i < 5; i++) {
    let x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 14; j++) { x += (rnd() - 0.3) * 34; y += (rnd() - 0.5) * 26; g.lineTo(x, y); }
    g.stroke();
  }
  const vg = g.createRadialGradient(W * 0.36, H * 0.28, 60, W * 0.5, H * 0.5, 840);
  vg.addColorStop(0, 'rgba(255,240,210,0.20)'); vg.addColorStop(1, 'rgba(45,22,6,0.42)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function paintPapyrus() {
  const [c, g] = canvas2d(); const rnd = mulberry32(23);
  g.fillStyle = '#E4CF9B'; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W;) { // under-layer: vertical strips
    const w = 30 + rnd() * 40; g.fillStyle = `rgba(${rnd() < 0.5 ? '150,110,50' : '250,235,190'},${0.05 + rnd() * 0.06})`; g.fillRect(x, 0, w, H); x += w;
  }
  for (let y = 0; y < H;) { // top layer: horizontal strips
    const h = 18 + rnd() * 30; g.fillStyle = `rgba(${rnd() < 0.5 ? '160,118,55' : '252,238,196'},${0.07 + rnd() * 0.08})`; g.fillRect(0, y, W, h);
    g.fillStyle = 'rgba(120,85,35,0.10)'; g.fillRect(0, y, W, 1.2); y += h;
  }
  for (let i = 0; i < 520; i++) { // fibres
    const y = rnd() * H, x = rnd() * W, len = 40 + rnd() * 220;
    g.strokeStyle = `rgba(${rnd() < 0.6 ? '125,88,38' : '255,244,210'},${0.10 + rnd() * 0.16})`; g.lineWidth = 0.6 + rnd() * 1.2;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + (rnd() - 0.5) * 4, x + len, y + (rnd() - 0.5) * 3); g.stroke();
  }
  grain(g, rnd, 14);
  const vg = g.createRadialGradient(W / 2, H * 0.42, 200, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(255,248,225,0.10)'); vg.addColorStop(1, 'rgba(95,60,20,0.40)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function paintPaper() {
  const [c, g] = canvas2d(); const rnd = mulberry32(37);
  g.fillStyle = '#F3EEE2'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const y = rnd() * H, x = rnd() * W, len = 10 + rnd() * 40;
    g.strokeStyle = `rgba(150,130,100,${0.05 + rnd() * 0.06})`; g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * Math.cos(i), y + len * Math.sin(i) * 0.3); g.stroke();
  }
  grain(g, rnd, 9);
  const vg = g.createRadialGradient(W / 2, H * 0.4, 260, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(255,255,250,0.0)'); vg.addColorStop(1, 'rgba(120,100,70,0.22)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
let SURF = null;
// Which surface shows: stone until 30.4, papyrus until 41.4, then paper.
const papyrusMix = (t) => eio(seg(t, 30.2, 31.6));
const paperMix = (t) => eio(seg(t, 41.2, 42.6));
function background(t) {
  if (!SURF) SURF = { stone: paintStone(), papyrus: paintPapyrus(), paper: paintPaper() };
  const p = papyrusMix(t), q = paperMix(t);
  ctx.drawImage(SURF.stone, 0, 0);
  if (p > 0) k.alpha(p, () => ctx.drawImage(SURF.papyrus, 0, 0));
  if (q > 0) k.alpha(q, () => ctx.drawImage(SURF.paper, 0, 0));
  font(700, 22, CAPS); text('RECKON · LANGUAGE', 60, 78, { color: C.textSoft, spacing: '2px' });
}

// ---------- the glyph: legs, crossbar, horns and eyes, morphing between keyframes ----------
// Canonical frame: the apex points down (+y), the open end up. rot turns it clockwise on screen.
const OX = { a: 0.95, w: 0.95, h: 0.55, lL: 1, lR: 1, f: 1, oL: 0, oR: 0, tilt: 0, horns: 1, eye: 1, rot: 0 };
const ALEPH = { a: 0.85, w: 0.78, h: 0.7, lL: 1.22, lR: 0.78, f: 0.52, oL: 0.55, oR: 0.6, tilt: -0.22, horns: 0, eye: 0, rot: 90 };
const ALPHA_SIDE = { a: 0.9, w: 0.74, h: 0.8, lL: 1.08, lR: 0.95, f: 0.56, oL: 0.12, oR: 0.12, tilt: 0.12, horns: 0, eye: 0, rot: 90 };
const A_UP = { a: 1.05, w: 0.72, h: 1.0, lL: 1, lR: 1, f: 0.6, oL: 0, oR: 0, tilt: 0, horns: 0, eye: 0, rot: 180 };
const mix = (g1, g2, x) => { const o = {}; for (const key in g1) o[key] = lerp(g1[key], g2[key], x); return o; };

// Keyframes of the big glyph: [time it starts moving, time it arrives, target]
const MORPHS = [[3.9, 6.6, OX], [20.4, 23.0, ALEPH], [31.4, 33.0, ALPHA_SIDE], [38.0, 40.2, A_UP]];
function glyphAt(t) {
  let g = A_UP;
  for (const [a, b, target] of MORPHS) g = mix(g, target, eio(seg(t, a, b)));
  return g;
}

function quad(p0, p1, p2, n = 14) {
  const out = [];
  for (let i = 0; i <= n; i++) { const u = i / n; out.push([(1 - u) * (1 - u) * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]]); }
  return out;
}
/** Strokes of glyph g in canonical units: { legs, bar, horns, eyes }. */
function glyphStrokes(g) {
  const P0 = [0, g.a], L0 = [-g.w, -g.h], R0 = [g.w, -g.h];
  const L = [P0[0] + g.lL * (L0[0] - P0[0]), P0[1] + g.lL * (L0[1] - P0[1])];
  const R = [P0[0] + g.lR * (R0[0] - P0[0]), P0[1] + g.lR * (R0[1] - P0[1])];
  const fl = clamp(g.f + g.tilt / 2, 0, 1.2), fr = clamp(g.f - g.tilt / 2, 0, 1.2);
  const CL = [P0[0] + fl * (L0[0] - P0[0]), P0[1] + fl * (L0[1] - P0[1])];
  const CR = [P0[0] + fr * (R0[0] - P0[0]), P0[1] + fr * (R0[1] - P0[1])];
  const C1 = [CL[0] + (CL[0] - CR[0]) * g.oL, CL[1] + (CL[1] - CR[1]) * g.oL];
  const C2 = [CR[0] + (CR[0] - CL[0]) * g.oR, CR[1] + (CR[1] - CL[1]) * g.oR];
  const hornL = quad(L, [L[0] - 0.55, L[1] + 0.02], [L[0] - 0.36, L[1] - 0.62]);
  const hornR = quad(R, [R[0] + 0.55, R[1] + 0.02], [R[0] + 0.36, R[1] - 0.62]);
  return { legs: [[L, P0], [P0, R]], bar: [C1, C2], horns: [hornL, hornR], eyes: [[-0.27, -g.h + 0.33], [0.27, -g.h + 0.33]] };
}
function place(pts, cx, cy, s, rot) {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return pts.map(([x, y]) => [cx + s * (x * c - y * sn), cy + s * (x * sn + y * c)]);
}
/** Polyline cut to the first fraction p of its length. */
function cut(pts, p) {
  if (p >= 1) return pts;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = lens.at(-1) * Math.max(0, p), out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= goal) { out.push(pts[i]); continue; }
    const u = (goal - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]);
    break;
  }
  return out;
}
function pathOf(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); }

/** Stroke one polyline in the three looks, weighted: carved, inked and printed. */
function strokeLook(pts, w, look) {
  if (pts.length < 2) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (look.stone > 0) k.alpha(look.stone, () => {
    pathOf(pts.map(([x, y]) => [x + 2.6, y + 3])); ctx.strokeStyle = C.stoneLight; ctx.lineWidth = w + 5; ctx.stroke();
    pathOf(pts); ctx.strokeStyle = C.stoneInk; ctx.lineWidth = w; ctx.stroke();
    pathOf(pts.map(([x, y]) => [x - 1.6, y - 1.8])); ctx.strokeStyle = 'rgba(36,18,6,0.55)'; ctx.lineWidth = w * 0.46; ctx.stroke();
  });
  if (look.ink > 0) k.alpha(look.ink, () => {
    pathOf(pts); ctx.strokeStyle = 'rgba(34,21,12,0.30)'; ctx.lineWidth = w + 4; ctx.stroke();
    pathOf(pts); ctx.strokeStyle = C.ink; ctx.lineWidth = w - 2; ctx.stroke();
    const [x0, y0] = pts[0]; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x0, y0, w * 0.5, 0, 7); ctx.fill();
  });
  if (look.print > 0) k.alpha(look.print, () => {
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    pathOf(pts); ctx.strokeStyle = C.print; ctx.lineWidth = w + 2; ctx.stroke();
  });
}
function dotLook(x, y, r, look) {
  if (look.stone > 0) k.alpha(look.stone, () => {
    ctx.fillStyle = C.stoneLight; ctx.beginPath(); ctx.arc(x + 2.4, y + 2.8, r + 2, 0, 7); ctx.fill();
    ctx.fillStyle = C.stoneInk; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  });
  const ink = look.ink + look.print;
  if (ink > 0) k.alpha(ink, () => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
}
const lookAt = (t) => { const p = papyrusMix(t), q = paperMix(t); return { stone: (1 - p) * (1 - q), ink: p * (1 - q), print: q }; };

/** Draw glyph g centred (by its bounding box) at cx, cy with s px per unit; draw-on fraction per part. */
function drawGlyph(g, cx, cy, s, w, look, reveal = { legs: 1, bar: 1, horns: 1, eyes: 1 }) {
  const st = glyphStrokes(g);
  const all = [...st.legs.flat(), ...st.bar, ...(g.horns > 0.02 ? st.horns.flat() : [])];
  const pl = place(all, 0, 0, 1, g.rot);
  const xs = pl.map((p) => p[0]), ys = pl.map((p) => p[1]);
  const ox = (Math.min(...xs) + Math.max(...xs)) / 2, oy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const P = (pts) => place(pts.map(([x, y]) => [x, y]), cx - ox * s, cy - oy * s, s, g.rot);
  // horns are drawn as far as g.horns says, so they grow from the brow corners
  for (const h of st.horns) if (g.horns * reveal.horns > 0.01) strokeLook(cut(P(h), g.horns * reveal.horns), w * 0.9, look);
  strokeLook(cut(P(st.legs[0]), seg(reveal.legs, 0, 0.5)), w, look);
  strokeLook(cut(P(st.legs[1]), seg(reveal.legs, 0.5, 1)), w, look);
  strokeLook(cut(P(st.bar), reveal.bar), w, look);
  const ea = g.eye * reveal.eyes;
  if (ea > 0.01) k.alpha(ea, () => { for (const e of P(st.eyes)) dotLook(e[0], e[1], s * 0.075, look); });
}

// ---------- the Egyptian ox-head hieroglyph (painted), a small drawing of the idea ----------
function hieroglyph(x, y, s, a) {
  k.alpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // horns
    ctx.strokeStyle = C.egyptBlue; ctx.lineWidth = 0.16;
    ctx.beginPath(); ctx.moveTo(-0.32, -0.35); ctx.bezierCurveTo(-0.95, -0.4, -1.0, -0.95, -0.55, -1.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.32, -0.35); ctx.bezierCurveTo(0.95, -0.4, 1.0, -0.95, 0.55, -1.15); ctx.stroke();
    // ears
    ctx.fillStyle = C.egyptRed;
    ctx.beginPath(); ctx.ellipse(-0.6, -0.15, 0.26, 0.11, -0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.6, -0.15, 0.26, 0.11, 0.4, 0, 7); ctx.fill();
    // face
    ctx.beginPath(); ctx.moveTo(-0.42, -0.42); ctx.quadraticCurveTo(0, -0.55, 0.42, -0.42);
    ctx.quadraticCurveTo(0.42, 0.35, 0.22, 0.78); ctx.quadraticCurveTo(0, 0.9, -0.22, 0.78);
    ctx.quadraticCurveTo(-0.42, 0.35, -0.42, -0.42); ctx.fill();
    ctx.strokeStyle = 'rgba(40,18,8,0.9)'; ctx.lineWidth = 0.05; ctx.stroke();
    ctx.fillStyle = '#F2E4C4';
    ctx.beginPath(); ctx.ellipse(-0.17, -0.08, 0.09, 0.06, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.17, -0.08, 0.09, 0.06, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1A0E07';
    ctx.beginPath(); ctx.arc(-0.17, -0.08, 0.04, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(0.17, -0.08, 0.04, 0, 7); ctx.fill();
    ctx.restore();
  });
}
function arrow(x0, y0, x1, y1, a, color = C.textSoft, p = 1) {
  if (a <= 0 || p <= 0) return;
  k.alpha(a, () => {
    const xe = lerp(x0, x1, p), ye = lerp(y0, y1, p), ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, ye); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(xe + 4 * Math.cos(ang), ye + 4 * Math.sin(ang));
    ctx.lineTo(xe - 14 * Math.cos(ang - 0.45), ye - 14 * Math.sin(ang - 0.45));
    ctx.lineTo(xe - 14 * Math.cos(ang + 0.45), ye - 14 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
  });
}

// ---------- labels and the chain at the top ----------
const LABELS = [
  [6.8, 20.1, 'PROTO-SINAITIC', 'oldest examples c. 1850 BC'],
  [22.8, 30.4, 'PHOENICIAN ALEPH', 'c. 1050 BC · 22 letters, all consonants'],
  [33.0, 41.4, 'GREEK ALPHA', 'from the 8th century BC'],
  [43.4, 47.2, 'LATIN A', 'through the Etruscans, c. 7th century BC'],
];
function labels(t) {
  for (const [a, b, name, sub] of LABELS) {
    const al = span(t, a, b, 0.5, 0.4);
    if (al <= 0) continue;
    k.alpha(al, () => {
      font(700, 34, CAPS); text(name, W / 2, 694, { align: 'center', color: C.text, spacing: '3px' });
      font(400, 27, 'CardoItalic'); text(sub, W / 2, 732, { align: 'center', color: C.textSoft });
    });
  }
}
const CHAIN = [
  { g: OX, x: 140, at: 15.0, date: 'c. 1850 BC' },
  { g: ALEPH, x: 300, at: 23.2, date: 'c. 1050 BC' },
  { g: ALPHA_SIDE, x: 460, at: 33.4, date: '8th c. BC' },
  { g: A_UP, x: 620, at: 43.6, date: '7th c. BC', roman: true },
];
function chain(t) {
  const out = 1 - seg(t, 46.8, 47.6);
  if (out <= 0) return;
  const look = lookAt(t);
  CHAIN.forEach((c, i) => {
    const a = eout(seg(t, c.at, c.at + 0.8)) * out;
    if (a <= 0) return;
    k.alpha(a, () => {
      drawGlyph(c.g, c.x, 150 - (1 - a) * 10, 27, 5.5, c.roman ? { stone: 0, ink: 0, print: 1 } : look);
      font(400, 23); text(c.date, c.x, 214, { align: 'center', color: C.textSoft });
    });
    if (i > 0) arrow(CHAIN[i - 1].x + 52, 150, c.x - 54, 150, a * 0.9, C.textSoft);
  });
}

// ---------- B: house sign, Phoenician bet, B (single polylines, resampled and morphed) ----------
function resample(pts, n = 120) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const out = []; let j = 1;
  for (let i = 0; i < n; i++) {
    const goal = (lens.at(-1) * i) / (n - 1);
    while (j < pts.length - 1 && lens[j] < goal) j++;
    const u = (goal - lens[j - 1]) / (lens[j] - lens[j - 1] || 1);
    out.push([lerp(pts[j - 1][0], pts[j][0], u), lerp(pts[j - 1][1], pts[j][1], u)]);
  }
  return out;
}
const HOUSE = resample([[0.25, 0.55], [0.8, 0.55], [0.8, -0.55], [-0.8, -0.55], [-0.8, 0.55], [-0.15, 0.55]]);
const BET = resample([[-0.42, 1.0], [0.24, 0.0], [0.3, -0.66], [-0.42, -0.36], [0.24, 0.0]]);
const bowl = (x0, y0, y1, bulge) => quad([x0, y0], [x0 + bulge * 2, (y0 + y1) / 2], [x0, y1], 18);
const BEE = resample([[-0.5, 0.9], [-0.5, -0.9], [0.05, -0.9], ...bowl(0.05, -0.9, -0.04, 0.5), [-0.5, -0.04], [0.12, -0.04], ...bowl(0.12, -0.04, 0.9, 0.56), [-0.5, 0.9]]);
function bShape(t) {
  const x1 = eio(seg(t, 49.4, 50.6)), x2 = eio(seg(t, 51.0, 52.2));
  const a = HOUSE.map((p, i) => [lerp(p[0], BET[i][0], x1), lerp(p[1], BET[i][1], x1)]);
  return a.map((p, i) => [lerp(p[0], BEE[i][0], x2), lerp(p[1], BEE[i][1], x2)]);
}

// ---------- the printed Roman capitals at the end ----------
function roman(ch, cx, cy, capH, a) {
  if (a <= 0) return;
  k.alpha(a, () => {
    font(700, capH / 0.7, CAPS);
    const m = ctx.measureText(ch);
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const size = (capH / h) * (capH / 0.7);
    font(700, size, CAPS);
    const m2 = ctx.measureText(ch);
    const y = cy + (m2.actualBoundingBoxAscent - m2.actualBoundingBoxDescent) / 2;
    text(ch, cx, y, { align: 'center', color: C.print });
  });
}

// ---------- the main stage ----------
function stage(t) {
  const look = lookAt(t);
  // Where the big glyph sits: centre stage, then left (scaled) for the B part.
  const side = eio(seg(t, 47.0, 48.4));
  const cx = lerp(W / 2, 252, side), cy = lerp(452, 470, side), s = lerp(150, 108, side), w = lerp(26, 20, side);
  const g = glyphAt(t);
  // The hook: the A carved at the start, then the turn reveals the head; the ox's horns and eyes grow in.
  const appear = eout(seg(t, 0.2, 1.6));
  const romanA = eio(seg(t, 43.2, 44.4));
  k.alpha(appear * (1 - romanA), () => drawGlyph(g, cx, cy + (1 - appear) * 16, s, w, look));
  roman('A', cx, cy, lerp(2 * 150, 2 * 108, side) * 0.98, romanA);

  // Egyptian hieroglyph beside the ox
  const hg = span(t, 9.4, 20.0, 0.6, 0.5);
  if (hg > 0) {
    hieroglyph(112, 420, 62, hg);
    font(400, 23); text('Egyptian', 112, 520, { align: 'center', color: C.textSoft });
    text('hieroglyph', 112, 548, { align: 'center', color: C.textSoft });
    arrow(176, 440, 222, 440, hg, C.textSoft, eout(seg(t, 10.0, 11.0)));
  }

  // B on the right
  const bIn = eout(seg(t, 47.8, 49.2));
  if (bIn > 0) {
    const pts = place(bShape(t), 612, 470, 108, 0);
    const romanB = eio(seg(t, 52.4, 53.4));
    k.alpha(1 - romanB, () => strokeLook(cut(pts, bIn), 20, look));
    roman('B', 612, 470, 2 * 108 * 0.98, romanB);
    const tags = [[48.2, 50.0, 'house sign'], [50.0, 51.6, 'Phoenician bet'], [51.6, 60, 'Latin B']];
    for (const [a, b, s2] of tags) {
      const al = span(t, a, b, 0.35, 0.3) * (1 - seg(t, 52.8, 53.4));
      if (al > 0) k.alpha(al, () => { font(400, 26, 'CardoItalic'); text(s2, 612, 650, { align: 'center', color: C.textSoft }); });
    }
  }
  // the meanings, under each letter, for the payoff
  const mean = eout(seg(t, 53.4, 54.4));
  if (mean > 0) k.alpha(mean, () => {
    font(700, 34, CAPS); text('ALPHA', 252, 652, { align: 'center', color: C.blue, spacing: '3px' }); text('BETA', 612, 652, { align: 'center', color: C.ochre, spacing: '3px' });
    font(400, 30, 'CardoItalic'); text('from aleph, ‘ox’', 252, 694, { align: 'center', color: C.textSoft }); text('from bet, ‘house’', 612, 694, { align: 'center', color: C.textSoft });
    font(700, 40, SERIF); text('+', 432, 480, { align: 'center', color: C.textSoft });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((x) => ctx.measureText(x.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const x of words) { if (lw + x > maxW && any) { n++; lw = 0; } lw += x + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  // a soft, smoother patch of surface behind the captions
  const pg = ctx.createRadialGradient(W / 2, 845, 30, W / 2, 845, 470);
  pg.addColorStop(0, 'rgba(255,246,228,0.34)'); pg.addColorStop(1, 'rgba(255,246,228,0)');
  ctx.fillStyle = pg; ctx.fillRect(0, 640, W, 420);
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.text, marks: { '*': C.ochre, '~': C.blue } });
  }
}

Kit.scene({
  width: W, height: H, duration: 60,
  fonts: [
    { family: SERIF, file: 'Cardo-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'Cardo-Bold.woff2', weight: '700' },
    { family: 'CardoItalic', file: 'Cardo-Italic.woff2', weight: '400' },
    { family: CAPS, file: 'Cinzel.woff2', weight: '400 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    chain(t);
    labels(t);
    stage(t);
    captions(t);
  },
});
