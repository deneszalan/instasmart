// Explainer for literature-under-der-linden: the first stanza of Walther von der Vogelweide's
// "Under der linden", turned from Middle High German into modern German, line by line.
// Look: a vellum page. Warm cream parchment with fibres, specks and a darker rim, faint drypoint ruling
// and a double margin rule in vermilion; brown-black ink; vermilion for the old forms that go, lapis blue
// for the modern words that come, verdigris for a marginal linden vine where a nightingale sits.
// UnifrakturCook (a textura blackletter) for the title, Cardo (a book face made for medieval texts) for
// the verse, the interlinear glosses and the captions.
//
// Text: Wikipedia, "Under der linden" (the post's source), which prints the stanza after Cormeau's
// edition (Lachmann 39,11): "Under der linden / an der heide, / dâ unser zweier bette was, / dâ muget
// ir vinden / schône beide / gebrochen bluomen unde gras. / Vor dem walde in einem tal, / tandaradei, /
// schône sanc diu nahtegal." The modern lines are our own word-for-word translation.
// Facts used: mugen means 'können' (Wikipedia's gloss; DWDS "mögen": mhd. mugen 'imstande sein');
// tandaradei is a sound-imitating word Walther made up for the nightingale's song (Wikipedia);
// mhd. h before t sounds like ch, as in naht (Wikipedia, "Mittelhochdeutsche Sprache"); uo became u
// (neuhochdeutsche Monophthongierung); nouns are written in lower case in the editions and the manuscript.
//
// Layout: captions centred at y = 850, nothing important below y = 930, the corner x > 740, y < 120 empty.
//
// Scene plan (58.4 s):
//   0.0– 5.4  Title page: "Under der linden" in blackletter with a vermilion U, a linden sprig.
//   4.4–11.8  The title moves up, the stanza is written line by line in italic sepia (Middle High
//             German); a linden vine grows down the right margin. Hook still at 8.4 s.
//  11.8–53.6  Eleven steps, one or two per line: a vermilion pilcrow marks the line; old words are struck
//             through and rise away, the modern words drop in (changed ones in lapis blue), and the old
//             form stays above as a small gloss. Line 8 wakes the nightingale, which sings.
//  53.7–58.4  The whole stanza in modern German; the nightingale sings; source line.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  parchHi: '#F5EBD2', parch: '#EBDCB8', parchLo: '#D7C094', rim: '#A47E4E',
  ink: '#2B1D14', sepia: '#6F5236', sepiaSoft: 'rgba(111,82,54,0.62)', rule: 'rgba(170,64,38,0.30)',
  red: '#B3361D', redSoft: 'rgba(179,54,29,0.75)', blue: '#2A4A8E', blueSoft: 'rgba(42,74,142,0.55)',
  leaf: '#557F55', leafDark: '#355C3A', vine: '#6E5A3A', bird: '#7B5B3D', birdBelly: '#C9AE84', birdTail: '#A0552E',
};
const GOTH = 'UnifrakturCook', SERIF = 'Cardo', ITAL = 'CardoItalic';

let k, ctx;
const font = (weight, size, family = SERIF) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the stanza: [Middle High German, modern German] word by word ----------
const LINES = [
  [['Under', 'Unter'], ['der', 'der'], ['linden', 'Linde']],
  [['an', 'an'], ['der', 'der'], ['heide,', 'Heide,']],
  [['dâ', 'wo'], ['unser', 'unser'], ['zweier', 'beider'], ['bette', 'Bett'], ['was,', 'war,']],
  [['dâ', 'da'], ['muget', 'könnt'], ['ir', 'ihr'], ['vinden', 'finden']],
  [['schône', 'schön,'], ['beide', 'beides:']],
  [['gebrochen', 'gebrochene'], ['bluomen', 'Blumen'], ['unde', 'und'], ['gras.', 'Gras.']],
  [['Vor', 'Vor'], ['dem', 'dem'], ['walde', 'Wald'], ['in', 'in'], ['einem', 'einem'], ['tal,', 'Tal,']],
  [['tandaradei,', 'tandaradei,']],
  [['schône', 'schön'], ['sanc', 'sang'], ['diu', 'die'], ['nahtegal.', 'Nachtigall.']],
];

// ---------- captions: each one is a step of the clip ----------
// *…* = an old form (italic, sepia), ~…~ = a modern word (lapis blue).
const CUES = [
  [0.5, 4.3, 'Ein Liebeslied, rund ~800 Jahre~ alt.'],
  [4.4, 8.6, 'Das ist *Mittelhochdeutsch.* | Wie viel verstehst du schon?'],
  [8.7, 11.7, 'Wir übersetzen die Strophe ~Zeile für Zeile.~'],
  [11.8, 15.6, '*under* wird ~unter.~ Nomen schreibt man heute groß: ~Linde.~'],
  [15.7, 18.9, 'Auch ~Heide~ bekommt einen großen Buchstaben.'],
  [19.0, 22.9, '*dâ* heißt hier ~wo,~ und *was* heißt ~war.~'],
  [23.0, 26.7, '*unser zweier* sagt man nicht mehr. Heute: ~unser beider.~'],
  [26.8, 30.8, '*muget* heißt ~könnt.~ Und *vinden* schreibt man mit ~f.~'],
  [30.9, 34.5, '*schône* verliert das *e* am Ende: ~schön.~'],
  [34.6, 38.4, 'Aus *uo* wird ~u:~ *bluomen* wird ~Blumen.~'],
  [38.5, 42.1, '*walde* wird ~Wald.~ Auch hier fällt das *e* weg.'],
  [42.2, 46.0, '*tandaradei* bleibt. Es klingt wie eine singende Nachtigall.'],
  [46.1, 49.9, '*h* klang hier wie ~ch:~ *nahtegal* wird ~Nachtigall.~'],
  [50.0, 53.6, 'Und *sanc* wird ~sang,~ *diu* wird ~die.~'],
  [53.7, 58.2, 'Fast jedes Wort ist noch da. | Es sieht nur ~anders~ aus.'],
];

// Which line each step works on, and which modern words it underlines.
const STEPS = [
  { line: 0, cue: 3, emph: [0, 2] },
  { line: 1, cue: 4, emph: [2] },
  { line: 2, cue: 5, emph: [0, 4] },
  { line: 2, cue: 6, emph: [2] },
  { line: 3, cue: 7, emph: [1, 3] },
  { line: 4, cue: 8, emph: [0] },
  { line: 5, cue: 9, emph: [1] },
  { line: 6, cue: 10, emph: [2] },
  { line: 7, cue: 11, emph: [] },
  { line: 8, cue: 12, emph: [3] },
  { line: 8, cue: 13, emph: [1, 2] },
].map((s) => ({ ...s, a: CUES[s.cue][0], b: CUES[s.cue][1] }));
/** When each line turns modern: the start of its first step. */
const TURN = LINES.map((_, i) => STEPS.find((s) => s.line === i).a);
const END = CUES[14][0];

// ---------- layout ----------
const L = { x: 182, y0: 280, lh: 58, size: 38, gloss: 22, num: 106, rule: 124, pil: 152 };
const lineY = (i) => L.y0 + i * L.lh;
let layout = null;
function measure() {
  layout = LINES.map((line) => {
    font(400, L.size, ITAL);
    const spO = ctx.measureText(' ').width;
    let x = L.x;
    const old = line.map(([o]) => { const w = ctx.measureText(o).width; const p = x; x += w + spO; return { x: p, w }; });
    font(400, L.size, SERIF);
    const spN = ctx.measureText(' ').width;
    x = L.x;
    const now = line.map(([, n]) => { const w = ctx.measureText(n).width; const p = x; x += w + spN; return { x: p, w }; });
    return { old, now, oldW: old.at(-1).x + old.at(-1).w - L.x };
  });
}

// ---------- the parchment, painted once ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const base = g.createRadialGradient(W * 0.48, H * 0.42, 60, W / 2, H / 2, 760);
  base.addColorStop(0, C.parchHi); base.addColorStop(0.55, C.parch); base.addColorStop(1, C.parchLo);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(39);
  // soft stains
  for (let i = 0; i < 14; i++) {
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 180;
    const st = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.025 + rnd() * 0.035;
    st.addColorStop(0, `rgba(150,110,60,${a})`); st.addColorStop(1, 'rgba(150,110,60,0)');
    g.fillStyle = st; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // fibres and specks
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W, y = rnd() * H, len = 4 + rnd() * 16, ang = (rnd() - 0.5) * 0.9;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? '120,90,55' : '255,250,235'},${0.05 + rnd() * 0.08})`;
    g.lineWidth = 0.6 + rnd() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() * 1.3 + 0.2;
    g.fillStyle = `rgba(95,70,40,${0.04 + rnd() * 0.12})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // darker, uneven rim
  const rim = g.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 720);
  rim.addColorStop(0, 'rgba(120,80,40,0)'); rim.addColorStop(0.75, 'rgba(120,80,40,0.10)'); rim.addColorStop(1, 'rgba(95,60,30,0.42)');
  g.fillStyle = rim; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const side = Math.floor(rnd() * 4), u = rnd();
    const x = side === 0 ? u * W : side === 1 ? W : side === 2 ? u * W : 0;
    const y = side === 0 ? 0 : side === 1 ? u * H : side === 2 ? H : u * H;
    const r = 30 + rnd() * 70;
    const st = g.createRadialGradient(x, y, 0, x, y, r);
    st.addColorStop(0, 'rgba(90,55,25,0.16)'); st.addColorStop(1, 'rgba(90,55,25,0)');
    g.fillStyle = st; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
}

function background(t) {
  if (!bg) paintBackground();
  ctx.drawImage(bg, 0, 0);
  // header
  withAlpha(eout(seg(t, 0.1, 0.8)), () => {
    font(700, 22); text('LESEFUTTER', 64, 84, { color: C.red, spacing: '3px' });
    const w = ctx.measureText('LESEFUTTER').width + 10 * 3;
    font(400, 22); text('·  LITERATUR', 64 + w + 12, 84, { color: C.sepia, spacing: '3px' });
  });
}

// ---------- ornaments ----------
/** A heart-shaped linden leaf with its tip at angle rot (radians, 0 = pointing right). */
function leaf(x, y, s, rot, grow = 1) {
  if (grow <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * grow, s * grow);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(0.05, -0.55, 0.65, -0.62, 0.95, -0.12);
  ctx.quadraticCurveTo(1.06, 0.0, 1.22, 0.04);
  ctx.quadraticCurveTo(1.04, 0.14, 0.92, 0.2);
  ctx.bezierCurveTo(0.62, 0.62, 0.05, 0.55, 0, 0);
  ctx.closePath();
  const lg = ctx.createLinearGradient(0, -0.5, 0, 0.5);
  lg.addColorStop(0, C.leaf); lg.addColorStop(1, C.leafDark);
  ctx.fillStyle = lg; ctx.fill();
  ctx.strokeStyle = 'rgba(30,50,30,0.6)'; ctx.lineWidth = 0.035; ctx.stroke();
  ctx.strokeStyle = 'rgba(235,240,210,0.55)'; ctx.lineWidth = 0.03;
  ctx.beginPath(); ctx.moveTo(0.02, 0.0); ctx.quadraticCurveTo(0.6, -0.02, 1.15, 0.04); ctx.stroke();
  for (const u of [0.3, 0.55, 0.8]) {
    ctx.beginPath(); ctx.moveTo(u, 0.0); ctx.lineTo(u + 0.16, -0.24 * (1.1 - u * 0.6)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(u, 0.01); ctx.lineTo(u + 0.16, 0.24 * (1.1 - u * 0.6)); ctx.stroke();
  }
  ctx.restore();
}

/** Small cream linden blossoms on a stalk. */
function blossoms(x, y, s, a) {
  withAlpha(a, () => {
    ctx.strokeStyle = C.vine; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 * s, y + 18 * s); ctx.stroke();
    for (const [dx, dy] of [[0, 22], [9, 26], [-7, 27], [3, 32]]) {
      ctx.fillStyle = '#F3E3A6'; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 4.2 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#C79A3A'; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 1.6 * s, 0, Math.PI * 2); ctx.fill();
    }
  });
}

// The marginal vine: a wavy stem down the right margin, leaves along it.
const VINE = { x: 800, y0: 250, y1: 770 };
const vineX = (y) => VINE.x + Math.sin((y - VINE.y0) / 62) * 16;
const VINE_LEAVES = [[300, -1], [372, 1], [446, -1], [520, 1], [598, -1], [690, 1], [748, -1]];
function vine(t) {
  const grow = eio(seg(t, 5.6, 9.8));
  if (grow <= 0) return;
  const yEnd = lerp(VINE.y0, VINE.y1, grow);
  ctx.strokeStyle = C.vine; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let y = VINE.y0; y <= yEnd; y += 4) { const x = vineX(y); y === VINE.y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  for (const [y, side] of VINE_LEAVES) {
    const g = eout(seg(yEnd, y - 10, y + 40));
    const sway = Math.sin(t * 1.1 + y) * 0.06;
    leaf(vineX(y), y, 34, (side > 0 ? -0.35 : Math.PI + 0.35) + sway, g);
  }
  blossoms(vineX(410) - 4, 410, 0.9, eout(seg(yEnd, 400, 460)));
  blossoms(vineX(640) + 2, 640, 0.9, eout(seg(yEnd, 630, 690)));
}

// The nightingale, perched on the vine beside line 8; it sings during line 8 and at the end.
const BIRD = { x: 764, y: 708 };
function singing(t) {
  return Math.max(span(t, 42.5, 45.8, 0.3, 0.4), span(t, 54.0, 58.0, 0.3, 0.5));
}
function nightingale(t) {
  const a = eout(seg(t, 42.2, 42.9));
  if (a <= 0) return;
  const sing = singing(t);
  const bob = Math.sin(t * 9) * 1.5 * sing;
  withAlpha(a, () => {
    ctx.save(); ctx.translate(BIRD.x, BIRD.y + bob + (1 - a) * -30); ctx.scale(1.15, 1.15);
    // tail
    ctx.fillStyle = C.birdTail;
    ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(52, 20); ctx.lineTo(49, 28); ctx.lineTo(14, 14); ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = C.bird;
    ctx.beginPath(); ctx.ellipse(0, 4, 26, 16, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.birdBelly;
    ctx.beginPath(); ctx.ellipse(-6, 11, 18, 8, -0.15, 0, Math.PI * 2); ctx.fill();
    // wing
    ctx.fillStyle = '#5E4329';
    ctx.beginPath(); ctx.ellipse(6, 1, 17, 8, -0.35, 0, Math.PI * 2); ctx.fill();
    // head, lifted while singing
    ctx.save(); ctx.translate(-20, -9); ctx.rotate(-0.25 * sing);
    ctx.fillStyle = C.bird; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F6EFD8'; ctx.beginPath(); ctx.arc(-4, -2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-4.4, -2.2, 1.9, 0, Math.PI * 2); ctx.fill();
    const open = sing * (0.5 + 0.5 * Math.sin(t * 22));
    ctx.fillStyle = '#4A3420';
    ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(-20, -2 - open * 3); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 1); ctx.lineTo(-19, 1 + open * 4); ctx.lineTo(-9, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
    // feet
    ctx.strokeStyle = '#4A3420'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-4, 18); ctx.lineTo(-6, 26); ctx.moveTo(4, 18); ctx.lineTo(4, 26); ctx.stroke();
    ctx.restore();
  });
  // notes drifting up from the beak
  if (sing > 0) {
    for (let i = 0; i < 6; i++) {
      const phase = ((t * 0.55 + i / 6) % 1);
      const x = BIRD.x - 22 + Math.sin(phase * 7 + i * 1.7) * 18;
      const y = BIRD.y - 30 - phase * 130;
      withAlpha(sing * Math.sin(Math.PI * phase) * 0.9, () => note(x, y, 0.8 + 0.3 * ((i * 7) % 3) / 2, i % 2 ? C.blue : C.red));
    }
  }
}
function note(x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.6, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(5.8, -1.5); ctx.lineTo(5.8, -22); ctx.quadraticCurveTo(12, -16, 13, -9); ctx.stroke();
  ctx.restore();
}

// ---------- the title ----------
function title(t) {
  const up = eio(seg(t, 4.4, 5.5));
  const a = eout(seg(t, 0.25, 1.0));
  if (a <= 0) return;
  const y = lerp(452, 176, up), size = lerp(104, 60, up);
  withAlpha(a, () => {
    font(700, size, GOTH);
    const rest = 'nder der linden';
    const wU = ctx.measureText('U').width, wR = ctx.measureText(rest).width;
    const x0 = W / 2 - (wU + wR) / 2;
    // quill-like reveal, left to right
    const rev = eio(seg(t, 0.25, 1.9));
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.2, x0 + (wU + wR + 20) * rev, size * 1.7); ctx.clip();
    text('U', x0, y, { color: C.red });
    text(rest, x0 + wU, y, { color: C.ink });
    ctx.restore();
    // subtitle
    withAlpha(eout(seg(t, 1.6, 2.3)), () => {
      font(400, lerp(34, 26, up), ITAL);
      const sub = up > 0.5 ? 'Walther von der Vogelweide · erste Strophe' : 'Walther von der Vogelweide';
      withAlpha(up > 0.5 ? seg(up, 0.5, 1) : 1 - seg(up, 0, 0.5), () => text(sub, W / 2, lerp(520, 216, up), { color: C.sepia, align: 'center' }));
    });
    // the sprig under the big title
    withAlpha(1 - seg(up, 0, 0.4), () => {
      const sx = W / 2, sy = 590;
      const g = eout(seg(t, 2.0, 3.0));
      if (g <= 0) return;
      ctx.strokeStyle = C.vine; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx - 150 * g, sy + 12); ctx.quadraticCurveTo(sx, sy - 10, sx + 150 * g, sy + 12); ctx.stroke();
      leaf(sx - 96, sy + 4, 44, Math.PI + 0.55, eout(seg(t, 2.3, 3.0)));
      leaf(sx - 30, sy - 2, 50, -Math.PI / 2 - 0.25, eout(seg(t, 2.5, 3.2)));
      leaf(sx + 46, sy, 46, 0.5, eout(seg(t, 2.7, 3.4)));
      leaf(sx + 110, sy + 8, 38, -0.45, eout(seg(t, 2.9, 3.6)));
      blossoms(sx + 8, sy - 2, 1.2, eout(seg(t, 3.2, 3.8)));
    });
  });
}

// ---------- the stanza ----------
function stepAt(t) {
  let cur = null;
  for (const s of STEPS) if (t >= s.a - 0.05) cur = s;
  return cur && t <= END ? cur : null;
}

function rule(t) {
  const a = eout(seg(t, 4.9, 6.2));
  withAlpha(a, () => {
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1.6;
    for (const x of [L.rule, L.rule + 6]) { ctx.beginPath(); ctx.moveTo(x, 238); ctx.lineTo(x, lineY(8) + 26); ctx.stroke(); }
    // drypoint ruling
    ctx.strokeStyle = 'rgba(120,90,55,0.10)'; ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(L.rule + 14, lineY(i) + 6); ctx.lineTo(720, lineY(i) + 6); ctx.stroke(); }
  });
}

function stanza(t) {
  const step = stepAt(t);
  for (let i = 0; i < LINES.length; i++) {
    const y = lineY(i);
    const lay = layout[i];
    const appear = seg(t, 5.2 + i * 0.32, 5.85 + i * 0.32);
    if (appear <= 0) continue;
    const q = eio(seg(t, TURN[i] + 0.15, TURN[i] + 1.25));
    const isCur = step && step.line === i;
    // line number
    withAlpha(eout(appear), () => { font(400, 24, SERIF); text(String(i + 1), L.num, y, { color: C.sepiaSoft, align: 'right' }); });
    // reveal the old line like fresh ink, left to right
    ctx.save();
    if (appear < 1) { ctx.beginPath(); ctx.rect(L.x - 10, y - 50, lay.oldW * eio(appear) + 14, 70); ctx.clip(); }
    LINES[i].forEach(([o, n], j) => {
      const po = lay.old[j], pn = lay.now[j];
      const changed = o !== n;
      if (!changed) {
        const x = lerp(po.x, pn.x, q);
        if (q < 1) withAlpha(1 - q, () => { font(400, L.size, ITAL); text(o, x, y, { color: C.sepia }); });
        if (q > 0) withAlpha(q, () => { font(400, L.size, SERIF); text(n, x, y, { color: C.ink }); });
        return;
      }
      // the old form: struck through in vermilion, then it rises away
      const out = seg(q, 0.18, 0.6);
      if (out < 1) {
        withAlpha(1 - out, () => {
          font(400, L.size, ITAL); text(o, po.x, y - out * 16, { color: C.sepia });
          const strike = eout(seg(q, 0.0, 0.25));
          if (strike > 0) {
            ctx.strokeStyle = C.red; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(po.x - 2, y - 12 - out * 16); ctx.lineTo(po.x - 2 + (po.w + 4) * strike, y - 14 - out * 16); ctx.stroke();
          }
        });
      }
      // the modern word drops in, in lapis blue
      const inn = eout(seg(q, 0.45, 0.9));
      if (inn > 0) withAlpha(inn, () => { font(400, L.size, SERIF); text(n, pn.x, y - (1 - inn) * 14, { color: C.blue }); });
      // the old form stays above as a small gloss
      const gl = seg(q, 0.75, 1);
      if (gl > 0) {
        const bare = o.replace(/[.,:]/g, '');
        const strong = isCur ? 1 : 0.62;
        withAlpha(gl * strong, () => { font(400, L.gloss, ITAL); text(bare, pn.x + pn.w / 2, y - 33, { color: C.sepia, align: 'center' }); });
      }
    });
    ctx.restore();
    // underline the words this step is about
    for (const s of STEPS) {
      if (s.line !== i || !s.emph.length) continue;
      const u = eout(seg(t, s.a + 1.0, s.a + 1.6)) * (1 - seg(t, s.b - 0.15, s.b + 0.25));
      if (u <= 0) continue;
      for (const j of s.emph) {
        const pn = lay.now[j];
        const w = pn.w;
        ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
        ctx.beginPath();
        const n = 16;
        for (let m = 0; m <= n * u; m++) {
          const xx = pn.x + (w * m) / n, yy = y + 9 + Math.sin(m * 0.9) * 1.6;
          m ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
    }
  }
  // the pilcrow that marks the line being worked on
  const first = STEPS[0];
  const pa = seg(t, first.a - 0.2, first.a + 0.2) * (1 - seg(t, END - 0.1, END + 0.4));
  if (pa > 0) {
    let yy = lineY(0);
    for (let s = 1; s < STEPS.length; s++) {
      const p = eio(seg(t, STEPS[s].a - 0.25, STEPS[s].a + 0.2));
      yy = lerp(yy, lineY(STEPS[s].line), p);
    }
    withAlpha(pa, () => { font(700, 38, SERIF); text('¶', L.pil, yy, { color: C.red, align: 'center' }); });
  }
}

// ---------- the end ----------
function finale(t) {
  const a = eout(seg(t, END + 0.4, END + 1.2));
  withAlpha(a, () => {
    font(400, 22, ITAL);
    text('Walther von der Vogelweide, „Under der linden“ (L 39,11) · Text nach Wikipedia', W / 2, 922, { color: C.sepia, align: 'center' });
  });
}

// ---------- captions, with italic old forms and blue modern words ----------
const CAP = { size: 42, lh: 54, maxW: 724, y: 858 };
function capTokens(s) {
  const out = [];
  let mode = null;
  for (const raw of s.split(' ')) {
    if (raw === '|') { out.push({ br: true, w: '', tail: '', style: null }); continue; }
    let w = raw, tail = '';
    if (!mode && (w[0] === '*' || w[0] === '~')) { mode = w[0]; w = w.slice(1); }
    const style = mode;
    if (mode) {
      const at = w.lastIndexOf(mode);
      if (at >= 0) { tail = w.slice(at + 1); w = w.slice(0, at); mode = null; }
    }
    out.push({ w, tail, style });
  }
  return out;
}
function setCapFont(style) {
  if (style === '*') font(400, CAP.size, ITAL);
  else font(700, CAP.size, SERIF);
}
function capWidth(tk) {
  setCapFont(tk.style); let w = ctx.measureText(tk.w).width;
  if (tk.tail) { setCapFont(null); w += ctx.measureText(tk.tail).width; }
  return w;
}
const capLayouts = new Map();
function capLayout(s) {
  if (capLayouts.has(s)) return capLayouts.get(s);
  const toks = capTokens(s).map((tk) => ({ ...tk, width: capWidth(tk) }));
  setCapFont(null);
  const space = ctx.measureText(' ').width;
  const wrap = (maxW) => {
    const lines = [[]]; let lw = 0;
    for (const tk of toks) {
      if (tk.br) { lines.push([]); lw = 0; continue; }
      if (lw + tk.width > maxW && lines.at(-1).length) { lines.push([]); lw = 0; }
      lines.at(-1).push(tk); lw += tk.width + space;
    }
    return lines;
  };
  // balanced: the narrowest width that keeps the same number of lines
  const n = wrap(CAP.maxW).length;
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (wrap(mid).length > n) lo = mid; else hi = mid; }
  const lay = { lines: wrap(hi + 1), space };
  capLayouts.set(s, lay);
  return lay;
}
function captions(t) {
  for (const [a, b, s] of CUES) {
    if (t < a || t > b) continue;
    const { lines, space } = capLayout(s);
    const rise = (1 - eout(seg(t, a, a + 0.35))) * 22;
    withAlpha(span(t, a, b, 0.25, 0.2), () => {
      const top = CAP.y - ((lines.length - 1) * CAP.lh) / 2 + rise;
      lines.forEach((line, i) => {
        const total = line.reduce((sum, tk) => sum + tk.width, 0) + space * (line.length - 1);
        let x = W / 2 - total / 2;
        for (const tk of line) {
          setCapFont(tk.style);
          const color = tk.style === '*' ? C.sepia : tk.style === '~' ? C.blue : C.ink;
          text(tk.w, x, top + i * CAP.lh, { color, base: 'middle' });
          x += ctx.measureText(tk.w).width;
          if (tk.tail) { setCapFont(null); text(tk.tail, x, top + i * CAP.lh, { color: C.ink, base: 'middle' }); x += ctx.measureText(tk.tail).width; }
          x += space;
        }
      });
    });
  }
}

Kit.scene({
  width: W, height: H, duration: 58.4,
  fonts: [
    { family: GOTH, file: 'UnifrakturCook-Bold.ttf', weight: '700' },
    { family: SERIF, file: 'Cardo-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'Cardo-Bold.woff2', weight: '700' },
    { family: ITAL, file: 'Cardo-Italic.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!layout) measure();
    background(t);
    title(t);
    rule(t);
    vine(t);
    stanza(t);
    nightingale(t);
    finale(t);
    captions(t);
  },
});
