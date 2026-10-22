// Explainer for philosophy-barber-paradox: the barber who shaves exactly those who don't shave
// themselves cannot exist, and the same trap sits inside Russell's paradox about sets.
// Look: a vintage barbershop. Cream subway tiles, a turning red-white-blue barber pole on each
// side of a lacquered red sign with brass trim, a red wainscot, simple flat figures. Oswald for
// the sign lettering and labels, Bitter (a slab serif) for captions.
//
// Scene plan (62.6 s). Captions centred at y = 830; everything important sits above y = 770.
//  A  0.0–11.9  Hook. The BARBER sign; the rule on a card; six villagers; then the barber and a
//               question mark: who shaves him?
//  B 11.6–34.0  Sorting. Two zones: SHAVES HIMSELF (a mirror) and DOESN'T (the barber's chair:
//               the barber shaves these). The villagers walk to their zones. The barber tries the
//               mirror: the rule forbids the barber to shave him, a red cross. He tries the chair:
//               the rule says the barber must shave him, so he shaves himself, a red cross. He
//               flips between the two, faster, then fades to a dashed outline: no such barber.
//  C 33.7–48.3  Russell's paradox, with jars for sets: the jar of squares is not a square, so it
//               is not inside itself; the jar R of all such jars: is R in R? A mini R flips in
//               and out of the big jar, the same flip-flop.
//  D 48.0–62.6  History: a letter, Russell to Frege, 1902; Russell's own verdict on the barber
//               ("suggested to me", "not valid", quoted from the source); payoff.
//
// Facts (Wikipedia, "Barber paradox"): the barber is "one who shaves all those, and those only,
// who do not shave themselves"; any answer leads to a contradiction; no such barber can exist;
// it was suggested to Russell as a form of his paradox, often wrongly attributed to him; Russell,
// The Philosophy of Logical Atomism (1919): "I once had a form suggested to me which was not
// valid, namely the question whether the barber shaves himself or not", and "In this form the
// contradiction is not very difficult to solve". (Wikipedia, "Russell's paradox"): R is the set
// of all sets that are not members of themselves; the set of all squares is not a square;
// Russell discovered it in May 1901 and wrote to Frege in 1902; it undermined Frege's attempt to
// reduce mathematics to logic; set theories with unrestricted comprehension are inconsistent, and
// type theory and Zermelo set theory (both 1908) avoid it.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  tile: '#F3EAD6', tileB: '#EDE2CB', grout: 'rgba(122,98,64,0.22)',
  ink: '#2B1D14', soft: 'rgba(43,29,20,0.70)', faint: 'rgba(43,29,20,0.30)',
  red: '#B3222E', redDeep: '#7E1520', redGlow: '#D9414B', navy: '#1F3F6B', navyDeep: '#152B4A',
  brass: '#C89B3C', brassLight: '#F0CF7A', cream: '#FFF8EA', paper: '#FFFBF0', skin: '#E8B98F',
  coat: ['#1F3F6B', '#5B6E3A', '#8A5A2B', '#4B4E6D', '#7A3B4E', '#3E6A6A'],
};
const SIGN = 'Oswald', TEXT = 'Bitter';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- timeline ----------
const T = { A: [0, 11.9], B: [11.6, 34.0], C: [33.7, 48.3], D: [48.0, 62.6] };
const CUES = [
  [0.4, 3.6, 'A village barber has one rule.'],
  [3.7, 8.4, 'He shaves *all* those, and *only* those, who don’t shave themselves.'],
  [8.5, 11.6, 'Then who shaves ~the barber~?'],
  [11.7, 16.2, 'Everyone else is easy: shave yourself, or go to the barber.'],
  [16.3, 19.4, 'Say the barber *shaves himself*.'],
  [19.5, 24.4, 'Then he’s a man who shaves himself, so the barber *mustn’t* shave him.'],
  [24.5, 29.2, 'Say he ~doesn’t~. Then the rule says the barber *must* shave him.'],
  [29.3, 33.8, 'Each answer flips to the other: no such barber *can exist*.'],
  [33.9, 37.8, 'It’s a homely version of *Russell’s paradox*, about sets.'],
  [37.9, 42.6, 'Most sets don’t contain themselves: the set of squares isn’t a square.'],
  [42.7, 48.0, 'Take ~R~, the set of all such sets. Is R in R? Same flip-flop.'],
  [48.1, 52.3, 'In 1902 Russell wrote to *Frege*: it undermined Frege’s logic.'],
  [52.4, 57.6, 'Russell said this barber form, suggested to him, was *not valid*.'],
  [57.7, 61.9, 'A barber can simply not exist. Sets needed ~new rules~.'],
];

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- background: cream subway tiles and a red wainscot ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.tile; g.fillRect(0, 0, W, H);
  const r = rng(7), tw = 72, th = 36;
  for (let row = 0; row * th < 944; row++) {
    const off = row % 2 ? -tw / 2 : 0;
    for (let x = off; x < W; x += tw) {
      const sh = r();
      g.fillStyle = sh < 0.5 ? C.tile : C.tileB;
      g.fillRect(x + 1.5, row * th + 1.5, tw - 3, th - 3);
      const lg = g.createLinearGradient(0, row * th, 0, row * th + th);
      lg.addColorStop(0, 'rgba(255,255,255,0.35)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(120,90,50,0.07)');
      g.fillStyle = lg; g.fillRect(x + 1.5, row * th + 1.5, tw - 3, th - 3);
    }
    g.fillStyle = C.grout; g.fillRect(0, row * th - 1.5, W, 3);
    for (let x = off; x < W; x += tw) g.fillRect(x - 1.5, row * th, 3, th);
  }
  // wainscot
  g.fillStyle = C.redDeep; g.fillRect(0, 944, W, H - 944);
  g.fillStyle = C.brass; g.fillRect(0, 940, W, 6);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 946, W, 8);
  // warm light from above and a soft vignette
  const lg = g.createRadialGradient(W / 2, 260, 80, W / 2, 420, 760);
  lg.addColorStop(0, 'rgba(255,240,205,0.30)'); lg.addColorStop(1, 'rgba(60,30,10,0.22)');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // header
  g.font = `600 22px ${SIGN}`; g.fillStyle = C.redDeep; g.letterSpacing = '3px'; g.textBaseline = 'alphabetic';
  g.fillText('RECKON', 64, 86);
  const w = g.measureText('RECKON').width;
  g.font = `500 22px ${SIGN}`; g.fillStyle = C.soft; g.letterSpacing = '2px';
  g.fillText('PHILOSOPHY · LOGIC', 64 + w + 24, 86);
  g.letterSpacing = '0px';
}
function background() { if (!bg) paintBackground(); ctx.drawImage(bg, 0, 0); }

/** A turning barber pole: red, white and blue stripes climbing a glass cylinder. */
function pole(x, y0, y1, t, alpha = 1) {
  withAlpha(alpha, () => {
    const w = 34;
    ctx.save();
    k.rrect(x - w / 2, y0, w, y1 - y0, 6); ctx.clip();
    ctx.fillStyle = C.cream; ctx.fillRect(x - w / 2, y0, w, y1 - y0);
    const period = 54, shift = (t * 46) % period;
    for (let yy = y1 + period * 2 - shift; yy > y0 - period * 2; yy -= period) {
      for (const [dy, col] of [[0, C.red], [27, C.navy]]) {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(x - w / 2, yy + dy); ctx.lineTo(x + w / 2, yy + dy - 26); ctx.lineTo(x + w / 2, yy + dy - 26 + 12); ctx.lineTo(x - w / 2, yy + dy + 12); ctx.closePath(); ctx.fill();
      }
    }
    const sh = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0.28)'); sh.addColorStop(0.35, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = sh; ctx.fillRect(x - w / 2, y0, w, y1 - y0);
    ctx.restore();
    for (const [yy, d] of [[y0, -1], [y1, 1]]) {
      ctx.fillStyle = C.brass; k.rrect(x - w / 2 - 6, yy - (d < 0 ? 14 : 0), w + 12, 14, 4); ctx.fill();
      ctx.beginPath(); ctx.arc(x, yy + d * 22, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = C.brassLight; ctx.fillRect(x - w / 2 - 4, yy - (d < 0 ? 12 : -2), w + 8, 3);
    }
  });
}

function sign(t, alpha) {
  withAlpha(alpha, () => {
    const x = 162, y = 148, w = 540, h = 132;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; k.rrect(x + 4, y + 8, w, h, 16); ctx.fill();
    ctx.fillStyle = C.red; k.rrect(x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 5; k.rrect(x + 10, y + 10, w - 20, h - 20, 10); ctx.stroke();
    const sh = ctx.createLinearGradient(0, y, 0, y + h);
    sh.addColorStop(0, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = sh; k.rrect(x, y, w, h, 16); ctx.fill();
    font(600, 76, SIGN); text('BARBER', W / 2, y + 94, { align: 'center', color: C.cream, spacing: '14px' });
    font(500, 20, SIGN); text('EST.', x + 44, y + 74, { align: 'center', color: C.brassLight, spacing: '2px' });
    text('VILLAGE', x + w - 50, y + 74, { align: 'center', color: C.brassLight, spacing: '2px' });
  });
  pole(92, 150, 300, t, alpha);
  pole(772, 150, 300, t, alpha);
}

// ---------- figures ----------
/** A flat figure: head, shoulders, a coloured coat. The barber gets a white apron and a red bow. */
function person(x, y, s, coat, { barber = false, razor = false, alpha = 1, dashed = false } = {}) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (dashed) {
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -64, 20, 0, TAU); ctx.stroke();
      k.rrect(-30, -40, 60, 58, 22); ctx.stroke();
      ctx.restore(); return;
    }
    ctx.fillStyle = coat; k.rrect(-30, -40, 60, 58, 22); ctx.fill();
    if (barber) {
      ctx.fillStyle = C.cream; k.rrect(-19, -32, 38, 50, 10); ctx.fill();
      ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(-11, -40); ctx.lineTo(-11, -28); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(11, -40); ctx.lineTo(11, -28); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -64, 20, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(-7, -66, 2.4, 0, TAU); ctx.arc(7, -66, 2.4, 0, TAU); ctx.fill();
    if (barber) { // handlebar moustache and parted hair
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-12, -54); ctx.quadraticCurveTo(-6, -60, 0, -56); ctx.quadraticCurveTo(6, -60, 12, -54); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -66, 20, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 7; ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(43,29,20,0.55)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, -58, 6, 0.2, Math.PI - 0.2); ctx.stroke();
    }
    if (razor) razorIcon(26, -58, 0.8);
    ctx.restore();
  });
}

function razorIcon(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.scale(s, s);
  ctx.fillStyle = C.ink; k.rrect(-3, 0, 7, 26, 3); ctx.fill();
  ctx.fillStyle = '#C9CED6'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-3, -22); ctx.quadraticCurveTo(10, -22, 10, -10); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function ruleCard(t, alpha, hi = 0) {
  withAlpha(alpha, () => {
    const x = 112, y = 326, w = 640, h = 128;
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; k.rrect(x + 3, y + 6, w, h, 8); ctx.fill();
    ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2; k.rrect(x + 8, y + 8, w - 16, h - 16, 5); ctx.stroke();
    font(600, 24, SIGN); text('THE RULE', W / 2, y + 40, { align: 'center', color: C.red, spacing: '4px' });
    k.rich('The barber shaves *all* those, and *only* those, who do not shave themselves.', W / 2, y + 86, {
      maxW: 560, size: 27, lh: 34, weight: 500, family: TEXT, ink: C.ink, marks: { '*': C.red },
    });
    if (hi > 0) withAlpha(hi, () => { ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(x - 4, y - 4, w + 8, h + 8, 10); ctx.stroke(); });
  });
}

// villagers: where they stand in the row, and which zone they go to (0 = mirror, 1 = chair)
const VILLAGERS = [0, 1, 1, 0, 1, 0].map((zone, i) => ({ zone, i }));
const ZONE_X = [196, 668], ZONE_Y = 744, ZW = 300;
function villagerPos(v, t) {
  const rowX = 162 + v.i * 108, rowY = 660;
  const slot = VILLAGERS.filter((u) => u.zone === v.zone).indexOf(v);
  const zx = ZONE_X[v.zone] - 90 + slot * 60, zy = ZONE_Y;
  const p = eio(seg(t, 12.0 + v.i * 0.45, 13.4 + v.i * 0.45));
  return [lerp(rowX, zx, p), lerp(rowY, zy, p) - Math.sin(p * Math.PI) * 30, lerp(1, 0.72, p)];
}

function zones(t, alpha, xs = [0, 0], subOff = [0, 0]) {
  withAlpha(alpha, () => {
    for (const z of [0, 1]) {
      const cx = ZONE_X[z], top = 492;
      ctx.fillStyle = 'rgba(255,251,240,0.82)'; k.rrect(cx - ZW / 2, top, ZW, 268, 18); ctx.fill();
      ctx.strokeStyle = z ? C.navy : C.red; ctx.lineWidth = 3; k.rrect(cx - ZW / 2, top, ZW, 268, 18); ctx.stroke();
      font(600, 25, SIGN); text(z ? 'DOESN’T SHAVE HIMSELF' : 'SHAVES HIMSELF', cx, top + 40, { align: 'center', color: z ? C.navy : C.red, spacing: '1px' });
      withAlpha(1 - subOff[z], () => { font(400, 22); text(z ? 'shaved by the barber' : 'not shaved by the barber', cx, top + 72, { align: 'center', color: C.soft }); });
      if (!z) mirror(cx - 20, top + 128); else chair(cx - 20, top + 128);
      if (xs[z] > 0) cross(cx, top + 160, xs[z]);
    }
  });
}
function mirror(x, y) {
  ctx.fillStyle = C.brass; ctx.beginPath(); ctx.ellipse(x, y, 40, 48, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(x - 30, y - 40, x + 30, y + 40);
  g.addColorStop(0, '#DDE7EE'); g.addColorStop(0.5, '#B7C6D2'); g.addColorStop(1, '#9FB1C0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 33, 41, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 14, y - 22); ctx.lineTo(x - 2, y - 32); ctx.stroke();
}
function chair(x, y) {
  ctx.fillStyle = C.redDeep; k.rrect(x - 34, y - 46, 68, 52, 12); ctx.fill();
  ctx.fillStyle = C.red; k.rrect(x - 40, y + 2, 80, 20, 8); ctx.fill();
  ctx.fillStyle = C.brass; ctx.fillRect(x - 5, y + 22, 10, 22); k.rrect(x - 30, y + 42, 60, 8, 4); ctx.fill();
  ctx.fillStyle = C.ink; ctx.fillRect(x - 46, y - 6, 12, 8); ctx.fillRect(x + 34, y - 6, 12, 8);
}
function cross(x, y, a) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1.5, 1, eout(clamp(a))), lerp(1.5, 1, eout(clamp(a))));
    ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-46, -46); ctx.lineTo(46, 46); ctx.moveTo(46, -46); ctx.lineTo(-46, 46); ctx.stroke();
    ctx.restore();
  });
}

// ---------- scene A ----------
function sceneA(t) {
  ruleCard(t, eout(seg(t, 3.7, 4.4)));
  for (const v of VILLAGERS) {
    const a = eout(seg(t, 0.8 + v.i * 0.2, 1.4 + v.i * 0.2));
    person(162 + v.i * 108, 660 + (1 - a) * 30, 1, C.coat[v.i], { alpha: a * (1 - 0.7 * seg(t, 8.5, 9.2)) });
  }
  const b = eout(seg(t, 8.6, 9.4));
  withAlpha(b, () => {
    person(W / 2, ZONE_Y - (1 - b) * 40, 1.1, C.navyDeep, { barber: true });
    font(700, 92, SIGN); text('?', W / 2 + 60, ZONE_Y - 92, { align: 'center', color: C.red });
  });
}

// ---------- scene B ----------
/** Where the barber stands: 0 = centre, 1 = mirror zone, 2 = chair zone, flipping at the end. */
function barberSpot(t) {
  const c = [W / 2, ZONE_Y], m = [ZONE_X[0] + 95, ZONE_Y], ch = [ZONE_X[1] + 95, ZONE_Y];
  let p = c, q = c, f = 0, hop = 50;
  if (t < 16.5) { p = c; q = c; f = 0; }
  else if (t < 24.6) { p = c; q = m; f = eio(seg(t, 16.5, 17.6)); }
  else if (t < 29.3) { p = m; q = ch; f = eio(seg(t, 24.6, 25.7)); }
  else {
    // flip-flop, faster each time, then he drifts back to the middle and fades
    let t0 = 29.3, d = 0.9, side = 1;
    while (t0 + d < t && d > 0.18) { t0 += d; d *= 0.78; side = 1 - side; }
    if (d > 0.18) { p = side ? ch : m; q = side ? m : ch; f = eio(seg(t, t0, t0 + d)); }
    else { p = side ? ch : m; q = c; f = eio(seg(t, t0, t0 + 0.6)); hop = 20; }
  }
  return [lerp(p[0], q[0], f), lerp(p[1], q[1], f) - Math.sin(f * Math.PI) * hop];
}

function sceneB(t) {
  ruleCard(t, 1, span(t, 19.8, 24.3, 0.3, 0.3) * 0.9 + span(t, 26.0, 29.0, 0.3, 0.3) * 0.9);
  const xs = [eout(seg(t, 21.6, 22.0)) * (t < 24.6 ? 1 : 0.35), eout(seg(t, 26.9, 27.3)) * (t < 29.3 ? 1 : 0.35)];
  zones(t, eout(seg(t, 11.7, 12.3)), xs, [span(t, 19.6, 24.3, 0.3, 0.3), span(t, 26.2, 29.1, 0.3, 0.3)]);
  for (const v of VILLAGERS) {
    const [x, y, s] = villagerPos(v, t);
    person(x, y, s, C.coat[v.i], { razor: v.zone === 0 && t > 13.0 + v.i * 0.45, alpha: lerp(0.3, 1, seg(t, 11.6, 12.0)) * (1 - 0.5 * seg(t, 16.3, 16.8)) });
  }
  const [bx, by] = barberSpot(t);
  const gone = seg(t, 32.7, 33.4);
  person(bx, by, 1.1, C.navyDeep, { barber: true, alpha: 1 - gone });
  person(bx, by, 1.1, C.navyDeep, { dashed: true, alpha: gone });
  withAlpha(gone, () => {
    ctx.fillStyle = C.red; k.rrect(W / 2 - 74, 552, 148, 82, 8); ctx.fill();
    font(600, 28, SIGN);
    text('NO SUCH', W / 2, 586, { align: 'center', color: C.cream, spacing: '2px' });
    text('BARBER', W / 2, 620, { align: 'center', color: C.cream, spacing: '2px' });
  });
  // what the rule says while he tries each zone (in place of the zone's sub-label)
  tag(t, 19.6, 24.3, ZONE_X[0], 564, 'barber mustn’t shave him', C.red);
  tag(t, 26.2, 29.1, ZONE_X[1], 564, 'barber must shave him', C.navy);
}
function tag(t, a, b, x, y, s, color) {
  withAlpha(span(t, a, b, 0.3, 0.3), () => {
    font(500, 22, TEXT); const w = ctx.measureText(s).width + 24;
    const xx = clamp(x, w / 2 + 20, W - w / 2 - 20);
    ctx.fillStyle = color; k.rrect(xx - w / 2, y - 22, w, 40, 20); ctx.fill();
    text(s, xx, y, { align: 'center', base: 'middle', color: C.cream });
  });
}

// ---------- scene C: sets as jars ----------
function jar(x, y, w, h, label, contents, alpha = 1, { color = C.navy, sub = null } = {}) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(220,234,240,0.55)'; k.rrect(-w / 2, -h, w, h, 22); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 4; k.rrect(-w / 2, -h, w, h, 22); ctx.stroke();
    ctx.fillStyle = color; k.rrect(-w / 2 - 8, -h - 22, w + 16, 24, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-w / 2 + 12, -h + 14, 8, h - 30);
    contents();
    ctx.fillStyle = C.paper; k.rrect(-w / 2 + 10, -50, w - 20, 40, 6); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2; k.rrect(-w / 2 + 10, -50, w - 20, 40, 6); ctx.stroke();
    font(600, 24, SIGN); text(label, 0, -22, { align: 'center', color, spacing: '1px' });
    if (sub) { font(500, 22); text(sub, 0, 34, { align: 'center', color: C.soft }); }
    ctx.restore();
  });
}
function shapes(kind, list) {
  for (const [x, y, s] of list) {
    ctx.fillStyle = kind === 'sq' ? C.red : C.navy;
    if (kind === 'sq') ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
}

function sceneC(t) {
  const a1 = eout(seg(t, 34.0, 34.8));
  // jar of squares, and a jar of jars that don't contain themselves (R)
  jar(222, 668, 280, 250, 'ALL SQUARES', () => {
    shapes('sq', [[-80, -190, 30], [-20, -160, 36], [50, -200, 26], [80, -130, 32], [-60, -110, 28], [10, -100, 24]]);
  }, a1 * (1 - 0.0 * seg(t, 42.7, 43.4)), { color: C.red, sub: 'is it a square? no' });
  withAlpha(eout(seg(t, 38.3, 39.0)), () => {
    font(600, 26, SIGN); text('NOT INSIDE ITSELF', 222, 746, { align: 'center', color: C.red, spacing: '1px' });
  });
  const aR = eout(seg(t, 42.8, 43.6));
  jar(628, 668, 300, 270, 'R', () => {
    // mini jars: sets that don't contain themselves (the squares jar among them)
    for (const [x, y, s, c] of [[-90, -150, 0.26, C.red], [-30, -190, 0.22, C.navy], [40, -140, 0.25, '#5B6E3A'], [95, -200, 0.2, C.red]]) miniJar(x, y, s, c);
  }, aR, { color: C.navy, sub: 'sets that don’t contain themselves' });
  // the flip-flop: a mini R hops in and out
  if (t > 44.6) {
    let t0 = 44.6, d = 0.8, inside = 0;
    while (t0 + d < t && d > 0.2) { t0 += d; d *= 0.85; inside = 1 - inside; }
    const f = eio(seg(t, t0, t0 + d));
    const from = inside ? [628 + 70, 548] : [628 + 175, 398], to = inside ? [628 + 175, 398] : [628 + 70, 548];
    const x = lerp(from[0], to[0], f), y = lerp(from[1], to[1], f) - Math.sin(f * Math.PI) * 40;
    withAlpha(seg(t, 44.6, 45.0), () => {
      miniJar(x - 628, y - 668, 0.42, C.navy, 'R', 628, 668);
      const yes = (inside ? 1 - f : f) > 0.5;
      font(600, 30, SIGN);
      text(yes ? 'INSIDE? THEN IT MUSTN’T BE' : 'OUTSIDE? THEN IT MUST BE IN', W / 2, 336, { align: 'center', color: yes ? C.red : C.navy, spacing: '1px' });
    });
  }
}
function miniJar(x, y, s, color, label = null, ox = 0, oy = 0) {
  ctx.save(); ctx.translate(ox + x, oy + y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; k.rrect(-60, -80, 120, 140, 18); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 8; k.rrect(-60, -80, 120, 140, 18); ctx.stroke();
  ctx.fillStyle = color; k.rrect(-68, -100, 136, 24, 8); ctx.fill();
  if (label) { font(700, 70, SIGN); text(label, 0, 26, { align: 'center', color }); }
  ctx.restore();
}

// ---------- scene D: the letter, Russell's verdict, payoff ----------
function sceneD(t) {
  // envelope
  const a = eout(seg(t, 48.3, 49.1)) * (1 - seg(t, 52.2, 52.7));
  withAlpha(a, () => {
    const x = W / 2, y = 520, w = 470, h = 290;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.03 + 0.02 * (1 - a));
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; k.rrect(-w / 2 + 5, -h / 2 + 8, w, h, 8); ctx.fill();
    ctx.fillStyle = C.paper; k.rrect(-w / 2, -h / 2, w, h, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(122,98,64,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, 10); ctx.lineTo(w / 2, -h / 2); ctx.stroke();
    // stripes along the edge, like old airmail
    for (let i = -w / 2; i < w / 2; i += 28) {
      ctx.fillStyle = (i / 28) % 2 ? C.navy : C.red;
      ctx.fillRect(i, h / 2 - 12, 14, 8);
    }
    font(500, 26); text('Bertrand Russell', -w / 2 + 30, 60, { color: C.soft });
    text('to Gottlob Frege', -w / 2 + 30, 96, { color: C.ink });
    // postmark
    ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w / 2 - 80, -h / 2 + 70, 46, 0, TAU); ctx.stroke();
    font(700, 32, SIGN); text('1902', w / 2 - 80, -h / 2 + 82, { align: 'center', color: C.red });
    ctx.restore();
  });
  // Russell's verdict, quoted from The Philosophy of Logical Atomism
  const q = eout(seg(t, 52.5, 53.3));
  withAlpha(q, () => {
    const x = 92, y = 356, w = 680, h = 330;
    ctx.fillStyle = C.navyDeep; k.rrect(x, y, w, h, 14); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 3; k.rrect(x + 10, y + 10, w - 20, h - 20, 8); ctx.stroke();
    font(700, 90, SIGN); text('“', x + 44, y + 92, { color: C.brass });
    k.rich('I once had a form suggested to me which was *not valid*, namely the question whether the barber shaves himself or not.', W / 2, y + 150, {
      maxW: 560, size: 31, lh: 42, weight: 500, family: TEXT, ink: C.cream, marks: { '*': C.brassLight },
    });
    font(500, 22, SIGN); text('BERTRAND RUSSELL, 1919', W / 2, y + h - 34, { align: 'center', color: C.brassLight, spacing: '2px' });
  });
  withAlpha(eout(seg(t, 57.9, 58.6)), () => {
    font(600, 26, SIGN); text('1908: NEW RULES FOR SETS AVOID THE PARADOX', W / 2, 738, { align: 'center', color: C.navy, spacing: '1px' });
  });
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, weight: 600, maxW: 730 };
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
    k.captions(t, [cue], { x: W / 2, y: 832, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.red, '~': C.navy } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.6,
  fonts: [
    { family: SIGN, file: 'Oswald.woff2', weight: '200 700' },
    { family: TEXT, file: 'Bitter.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    sign(t, 1);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
