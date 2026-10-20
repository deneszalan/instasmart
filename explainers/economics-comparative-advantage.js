// Explainer for economics-comparative-advantage: trade pays off even when one country is better at everything.
// Look: a friendly flat illustration. Two small islands in a turquoise sea with drawn waves, sand, palms,
// coral and leaf-green accents and soft shadows; cream cards and a ribbon title; Nunito (rounded) throughout.
// Cloth is always coral, wine always grape purple, gains always leaf green.
//
// Numbers: Ricardo's example as the source gives it (Wikipedia, "Comparative advantage"): hours of work to make
// one unit. England: cloth 100, wine 120. Portugal: cloth 90, wine 80. Everything else below is computed from
// those four numbers (one of each, opportunity costs, who should specialise, the output after specialising,
// and what each holds after swapping one cloth for one wine).
//
// Scene plan (54.3 s, 864×1080; captions one at a time, at least 0.3 s per word + 1 s)
// A  0–10.9   Hook. The islands rise; a ribbon and two cards give the hours per unit, and Portugal's two
//             smaller numbers get green ticks. A dashed sea route with a "?" asks the question.
//     "Two countries each make two goods: cloth and wine."
//     "Portugal needs fewer hours of work for both."
//     "So why should Portugal trade at all?"
// B  10.9–17.7  No trade. Each card turns into a bar of the country's hours (100 + 120, 90 + 80) that fills;
//             as it fills, one cloth and one wine appear on each island. A "world total" tray stacks them.
//     "Without trade, each makes one cloth and one wine."
//     "World total: 2 cloth and 2 wine."
// C  17.7–34.3  The reason: opportunity cost. The cards ask what one cloth costs, then fill bottles with the wine
//             those hours could have made (100 ÷ 120 = 0.83 against 90 ÷ 80 = 1.125). England is cheaper.
//             Then the same for wine (1.2 against 0.89 cloth): Portugal is cheaper.
//     "But what does a unit of cloth really cost?"
//     "The wine those same hours could have made."
//     "England gives up less wine: it should make the cloth."
//     "Portugal gives up less cloth: it should make the wine."
// D  34.3–41.8  Specialise. The bars slide until England spends all 220 hours on cloth and Portugal all 170 on
//             wine; the goods on the islands and the world total change with them, to 2.2 and 2.125.
//     "Now each spends all its hours on one good."
//     "2.2 cloth and 2.125 wine: more of both!"
// E  41.8–49.7  Trade. A little boat carries one cloth to Portugal and one wine back; the cards show what
//             each now has (1.2 + 1 and 1 + 1.125), with ticks.
//     "A boat swaps one cloth for one wine."
//     "Both end up with one of each, plus extra."
// F  49.7–54.3  Payoff card: "Comparative advantage", David Ricardo, 1817, and the source.
//     "Make what you give up least to make, then trade."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const FONT = 'Nunito';

const C = {
  seaA: '#79DED7', seaB: '#3AC0C7', seaC: '#1C9AB2',
  shallow: 'rgba(176,246,232,0.78)', foam: 'rgba(255,255,255,0.75)',
  sand: '#F8E2B2', sandDark: '#E8C285', sandShade: 'rgba(190,135,65,0.22)',
  leaf: '#4DBA62', leafDark: '#2F9A4F', leafLight: '#8CDB8D', leafDeep: '#23864A',
  trunk: '#C38D58', trunkDark: '#9A6A3C', nut: '#7A4E2A',
  coral: '#FF7B6B', coralDark: '#DB4A3A', coralSoft: '#FFAE9F',
  grape: '#8E4DAD', grapeDark: '#6A2F8A',
  ink: '#0F3D4C', soft: 'rgba(15,61,76,0.66)', faint: 'rgba(15,61,76,0.13)',
  cream: '#FFF8EC', hull: '#B8743F', hullDark: '#8F5A30', sail: '#FFFDF7',
};

// ---------- the economics, computed ----------
const LAND = {
  E: { name: 'England', cx: 228, hours: { cloth: 100, wine: 120 } },
  P: { name: 'Portugal', cx: 636, hours: { cloth: 90, wine: 80 } },
};
const IDS = ['E', 'P'];
const GOODS = ['cloth', 'wine'];
const other = (id) => (id === 'E' ? 'P' : 'E');
const otherGood = (g) => (g === 'cloth' ? 'wine' : 'cloth');
for (const id of IDS) LAND[id].budget = LAND[id].hours.cloth + LAND[id].hours.wine; // one unit of each
const MAXB = Math.max(LAND.E.budget, LAND.P.budget);
/** Opportunity cost: units of the other good the same hours could have made. */
const cost = (id, g) => LAND[id].hours[g] / LAND[id].hours[otherGood(g)];
const clothMaker = cost('E', 'cloth') < cost('P', 'cloth') ? 'E' : 'P';
const wineMaker = other(clothMaker);
const ALONE = { cloth: 2, wine: 2 };
/** What a country makes with hc of its hours on cloth and the rest on wine. */
const make = (id, hc) => ({ cloth: hc / LAND[id].hours.cloth, wine: (LAND[id].budget - hc) / LAND[id].hours.wine });
const SPEC_HOLD = { [clothMaker]: make(clothMaker, LAND[clothMaker].budget), [wineMaker]: make(wineMaker, 0) };
const SPEC = { cloth: SPEC_HOLD.E.cloth + SPEC_HOLD.P.cloth, wine: SPEC_HOLD.E.wine + SPEC_HOLD.P.wine };
const SWAP = 1; // one cloth for one wine, inside the source's range of 5/6 to 9/8 wine per cloth
const FINAL = {
  [clothMaker]: { cloth: SPEC_HOLD[clothMaker].cloth - SWAP, wine: SPEC_HOLD[clothMaker].wine + SWAP },
  [wineMaker]: { cloth: SPEC_HOLD[wineMaker].cloth + SWAP, wine: SPEC_HOLD[wineMaker].wine - SWAP },
};
/** 2.2, 2.125, 0.83: exact to three places when it is exact, otherwise two. */
const nice = (v) => { const r3 = Math.round(v * 1000) / 1000; return String(Math.abs(r3 - v) < 1e-9 ? r3 : Math.round(v * 100) / 100); };

// ---------- timeline ----------
const A0 = 0, B0 = 10.9, C0 = 17.7, D0 = 34.3, E0 = 41.8, F0 = 49.7, END = 54.3;
const CUES = [
  [0.4, 4.2, 'Two countries each make two goods: *cloth* and ^wine^.'],
  [4.3, 7.7, `${LAND.P.name} needs ~fewer hours~ of work for both.`],
  [7.8, 10.8, `So why should ${LAND.P.name} ~trade~ at all?`],
  [B0 + 0.1, B0 + 3.8, 'Without trade, each makes one *cloth* and one ^wine^.'],
  [B0 + 3.9, B0 + 6.7, `World total: *${nice(ALONE.cloth)} cloth* and ^${nice(ALONE.wine)} wine^.`],
  [C0 + 0.1, C0 + 3.9, 'But what does a unit of *cloth* really cost?'],
  [C0 + 4.0, C0 + 7.5, 'The ^wine^ those same hours could have made.'],
  [C0 + 7.6, C0 + 11.8, `${LAND[clothMaker].name} gives up ~less wine~: it should make the *cloth*.`],
  [C0 + 11.9, C0 + 16.4, `${LAND[wineMaker].name} gives up ~less cloth~: it should make the ^wine^.`],
  [D0 + 0.1, D0 + 3.9, 'Now each spends ~all~ its hours on one good.'],
  [D0 + 4.0, D0 + 7.4, `*${nice(SPEC.cloth)} cloth* and ^${nice(SPEC.wine)} wine^: more of ~both~!`],
  [E0 + 0.1, E0 + 4.0, 'A boat swaps one *cloth* for one ^wine^.'],
  [E0 + 4.1, E0 + 7.8, 'Both end up with one of each, plus ~extra~.'],
  [F0 + 0.2, END + 1, 'Make what you give up ~least~ to make, then trade.'],
];

// Drawing tools from the kit, bound on the first frame.
let k, ctx;
const font = (weight, size) => k.font(weight, size, FONT);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const rrect = (...a) => k.rrect(...a);
const A = (a, fn) => k.alpha(a, fn);
const ell = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); };
const shadowed = (blur, dy, fn) => { ctx.save(); ctx.shadowColor = 'rgba(5,70,90,0.26)'; ctx.shadowBlur = blur; ctx.shadowOffsetY = dy; fn(); ctx.restore(); };
const widthOf = (s, weight, size) => { font(weight, size); return ctx.measureText(s).width; };

// ---------- sea ----------
function sea(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.seaA); g.addColorStop(0.5, C.seaB); g.addColorStop(1, C.seaC);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(180, 90, 10, 180, 90, 760);
  r.addColorStop(0, 'rgba(255,255,255,0.26)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  // drawn waves: rows of little "~" strokes drifting sideways
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
  for (let row = 0; row < 20; row++) {
    const y = 30 + row * 56;
    const off = (t * 13 + (row % 2) * 64) % 128;
    ctx.strokeStyle = `rgba(255,255,255,${0.17 + 0.07 * (row % 3)})`;
    for (let x = -128 + off; x < W + 64; x += 128) {
      const yy = y + Math.sin(t * 1.1 + x * 0.021 + row) * 2.5;
      ctx.beginPath(); ctx.moveTo(x, yy);
      ctx.quadraticCurveTo(x + 11, yy - 9, x + 22, yy); ctx.quadraticCurveTo(x + 33, yy + 9, x + 44, yy);
      ctx.stroke();
    }
  }
  // sparkles
  for (let i = 0; i < 9; i++) {
    const x = (i * 197 + 61) % (W - 80) + 40, y = (i * 311 + 140) % (H - 200) + 60;
    const tw = Math.max(0, Math.sin(t * 1.7 + i * 2.1));
    if (tw < 0.05) continue;
    A(tw * 0.7, () => {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath();
      const s = 7 * tw;
      ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
      ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
    });
  }
}

function header() {
  font(800, 22); text('RECKON', 56, 58, { spacing: '4px' });
  const x = 56 + widthOf('RECKON', 800, 22) + 30;
  font(700, 22); text('ECONOMICS', x, 58, { color: C.soft, spacing: '3px' });
}

// ---------- islands ----------
function frond(x, y, a, L, col) {
  const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L + L * 0.36 * Math.abs(Math.cos(a));
  const mx = x + Math.cos(a) * L * 0.5, my = y + Math.sin(a) * L * 0.5 - L * 0.07;
  const nx = -Math.sin(a), ny = Math.cos(a), wv = L * 0.17;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx + nx * wv, my + ny * wv, ex, ey);
  ctx.quadraticCurveTo(mx - nx * wv, my - ny * wv, x, y);
  ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = 'rgba(18,90,48,0.45)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
}

function palm(x, y, h, lean, t, ph) {
  const sw = Math.sin(t * 1.3 + ph) * 0.06;
  const cx1 = x + lean * h * 0.04, cy1 = y - h * 0.6;
  const tx = x + lean * h * 0.32 + sw * h * 0.22, ty = y - h;
  ell(x + 10, y + 4, h * 0.22, h * 0.06); ctx.fillStyle = C.sandShade; ctx.fill();
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cx1, cy1, tx, ty);
  ctx.strokeStyle = C.trunkDark; ctx.lineWidth = h * 0.1 + 3; ctx.stroke();
  ctx.strokeStyle = C.trunk; ctx.lineWidth = h * 0.1; ctx.stroke();
  ctx.strokeStyle = C.trunkDark; ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const u = i / 6.3;
    const px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx1 + u * u * tx;
    const py = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy1 + u * u * ty;
    ctx.beginPath(); ctx.moveTo(px - h * 0.04, py - 1); ctx.lineTo(px + h * 0.04, py + 2); ctx.stroke();
  }
  const angs = [-2.8, -2.2, -1.57, -0.94, -0.34];
  angs.forEach((a0, i) => {
    const a = a0 + sw * 1.4 + Math.sin(t * 1.8 + ph + i) * 0.03;
    frond(tx, ty, a, h * 0.6 * (i === 2 ? 0.8 : 1), i % 2 ? C.leafDark : C.leaf);
  });
  ctx.fillStyle = C.nut;
  ell(tx - 6, ty + 7, 6.5, 6.5); ctx.fill(); ell(tx + 6, ty + 8, 6.5, 6.5); ctx.fill();
}

function coralBit(x, y, s, col) {
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y - 17 * s);
  ctx.moveTo(x, y - 8 * s); ctx.quadraticCurveTo(x - 9 * s, y - 10 * s, x - 10 * s, y - 20 * s);
  ctx.moveTo(x, y - 6 * s); ctx.quadraticCurveTo(x + 9 * s, y - 8 * s, x + 11 * s, y - 16 * s);
  ctx.stroke();
}

function starfish(x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8);
  }
  ctx.closePath(); ctx.fillStyle = C.coral; ctx.fill();
}

const ISLE_Y = 432;
function island(id, t, s, a) {
  const m = id === 'E' ? 1 : -1, ph = id === 'E' ? 0 : 2.4;
  A(a, () => {
    ctx.save(); ctx.translate(LAND[id].cx, ISLE_Y); ctx.scale(s, s);
    ell(12, 40, 184, 68); ctx.fillStyle = 'rgba(6,80,104,0.18)'; ctx.fill();
    ell(0, 24, 182, 74); ctx.fillStyle = C.shallow; ctx.fill();
    ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 12;
    ell(0, 18, 166 + 2.5 * Math.sin(t * 1.7 + ph), 64 + 2 * Math.sin(t * 1.7 + ph));
    ctx.strokeStyle = C.foam; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    coralBit(-150 * m, 72, 1, C.coral); coralBit(140 * m, 76, 0.85, C.coralSoft);
    coralBit(-100 * m, 92, 0.7, C.coralSoft); coralBit(104 * m, 93, 0.72, C.coral);
    ell(0, 12, 150, 54); ctx.fillStyle = C.sandDark; ctx.fill();
    ell(0, 0, 150, 54); ctx.fillStyle = C.sand; ctx.fill();
    ell(-8 * m, -17, 104, 29); ctx.fillStyle = C.leaf; ctx.fill();
    ell(-30 * m, -24, 52, 10); ctx.fillStyle = C.leafLight; ctx.fill();
    starfish(122 * m, 24, 11, 0.3 * m);
    palm(-98 * m, -10, 80, -0.32 * m, t, ph + 1);
    palm(84 * m, -18, 104, 0.26 * m, t, ph);
    ctx.restore();
  });
}

// ---------- icons (fill: 0..1 of one unit) ----------
/** A folded length of cloth, centred on x, standing on by. A part-unit is cut short, with a dashed outline. */
function clothPiece(x, by, w, frac = 1) {
  const h = w * 0.3, x0 = x - w / 2, y0 = by - h, r = h * 0.38;
  if (frac <= 0.001) return;
  if (frac < 0.999) {
    A(Math.min(1, frac * 8), () => {
      rrect(x0, y0, w, h, r); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(15,61,76,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    });
  }
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 2, y0 - 2, w * frac + 2, h + 4); ctx.clip();
  rrect(x0, y0, w, h, r); ctx.fillStyle = C.coral; ctx.fill();
  rrect(x0 + w - h * 0.95, y0, h * 0.95, h, r); ctx.fillStyle = C.coralDark; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(x0 + w * 0.1, y0 + h * 0.28, w * 0.6, Math.max(1.5, h * 0.12));
  ctx.fillRect(x0 + w * 0.1, y0 + h * 0.6, w * 0.6, Math.max(1.5, h * 0.12));
  ctx.restore();
}

function bottlePath(x, by, h) {
  const bw = h * 0.38, bh = h * 0.56, nw = h * 0.15, sh = h * 0.14, top = by - h * 0.93, r = bw * 0.28;
  ctx.beginPath();
  ctx.moveTo(x - bw / 2, by - r);
  ctx.lineTo(x - bw / 2, by - bh);
  ctx.quadraticCurveTo(x - bw / 2, by - bh - sh, x - nw / 2, by - bh - sh * 1.15);
  ctx.lineTo(x - nw / 2, top); ctx.lineTo(x + nw / 2, top);
  ctx.lineTo(x + nw / 2, by - bh - sh * 1.15);
  ctx.quadraticCurveTo(x + bw / 2, by - bh - sh, x + bw / 2, by - bh);
  ctx.lineTo(x + bw / 2, by - r);
  ctx.quadraticCurveTo(x + bw / 2, by, x + bw / 2 - r, by);
  ctx.lineTo(x - bw / 2 + r, by);
  ctx.quadraticCurveTo(x - bw / 2, by, x - bw / 2, by - r);
  ctx.closePath();
}
/** A wine bottle standing on by; a part-unit is a bottle filled only that far. */
function bottle(x, by, h, frac = 1) {
  if (frac <= 0.001) return;
  const top = by - h * 0.93;
  A(Math.min(1, frac * 8), () => {
    bottlePath(x, by, h); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
    ctx.save(); bottlePath(x, by, h); ctx.clip();
    const level = by - (by - top) * frac;
    ctx.fillStyle = C.grape; ctx.fillRect(x - h, level, h * 2, by - level + 2);
    ctx.restore();
    bottlePath(x, by, h); ctx.strokeStyle = C.grapeDark; ctx.lineWidth = Math.max(1.6, h * 0.04); ctx.stroke();
    rrect(x - h * 0.15, by - h * 0.42, h * 0.3, h * 0.2, 2); ctx.fillStyle = 'rgba(255,248,236,0.92)'; ctx.fill();
    ctx.fillStyle = '#D9A86A'; rrect(x - h * 0.065, top - h * 0.07, h * 0.13, h * 0.09, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = Math.max(1.5, h * 0.035); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - h * 0.12, by - h * 0.12); ctx.lineTo(x - h * 0.12, by - h * 0.32); ctx.stroke();
  });
}

/** Units of cloth as a stack, bottom piece on by. */
function clothStack(x, by, amount, w) {
  const h = w * 0.3, n = Math.ceil(amount - 1e-6);
  for (let i = 0; i < n; i++) clothPiece(x, by - i * (h + 4), w, clamp(amount - i));
}
/** Units of wine as a row of bottles, the first one's left edge at x. */
function wineRow(x, by, amount, h) {
  const bw = h * 0.38, gap = h * 0.14, n = Math.ceil(amount - 1e-6);
  for (let i = 0; i < n; i++) bottle(x + bw / 2 + i * (bw + gap), by, h, clamp(amount - i));
}
function icon(g, x, cy, size) {
  if (g === 'cloth') clothPiece(x, cy + size * 0.15, size);
  else bottle(x, cy + size * 0.48, size);
}
function tick(x, y, a, r = 15) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); const s = 0.6 + 0.4 * back(clamp(a)); ctx.scale(s, s);
    ell(0, 0, r, r); ctx.fillStyle = C.leafDeep; ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.32); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
    ctx.restore();
  });
}

// ---------- the state of the world at time t ----------
const GOOD_POS = { by: 472, clothDx: -58, clothW: 68, wineDx: 10, bottleH: 60 };
function world(t) {
  const fillC = eio(seg(t, B0 + 0.5, B0 + 1.5)), fillW = eio(seg(t, B0 + 1.5, B0 + 2.5));
  const p = eio(seg(t, D0 + 0.7, D0 + 3.3));
  const hc = {}, hold = {};
  for (const id of IDS) {
    const c = LAND[id];
    hc[id] = id === clothMaker ? lerp(c.hours.cloth, c.budget, p) : lerp(c.hours.cloth, 0, p);
    const made = make(id, hc[id]);
    hold[id] = { cloth: made.cloth * fillC, wine: made.wine * fillW };
  }
  const q = [seg(t, E0 + 0.5, E0 + 1.0), seg(t, E0 + 2.2, E0 + 2.6), seg(t, E0 + 2.6, E0 + 3.0), seg(t, E0 + 4.2, E0 + 4.6)].map(eio);
  hold[clothMaker].cloth -= SWAP * q[0]; hold[wineMaker].cloth += SWAP * q[1];
  hold[wineMaker].wine -= SWAP * q[2]; hold[clothMaker].wine += SWAP * q[3];
  const total = {
    cloth: hold.E.cloth + hold.P.cloth + SWAP * (q[0] - q[1]),
    wine: hold.E.wine + hold.P.wine + SWAP * (q[2] - q[3]),
  };
  return { fillC, fillW, p, hc, hold, q, total };
}

function islandGoods(m) {
  for (const id of IDS) {
    const cx = LAND[id].cx, h = m.hold[id];
    clothStack(cx + GOOD_POS.clothDx, GOOD_POS.by, Math.max(0, h.cloth), GOOD_POS.clothW);
    wineRow(cx + GOOD_POS.wineDx, GOOD_POS.by, Math.max(0, h.wine), GOOD_POS.bottleH);
  }
}

// ---------- the boat ----------
const DOCK = { E: 330, P: 534, y: 552 };
function boatState(t) {
  const go = eio(seg(t, E0 + 1.0, E0 + 2.2)), ret = eio(seg(t, E0 + 3.0, E0 + 4.2));
  const u = go - ret + 0.5 * eio(seg(t, F0 + 0.4, F0 + 3.6));
  const x = lerp(DOCK[clothMaker], DOCK[wineMaker], u);
  const y = DOCK.y + 12 * Math.sin(Math.PI * u) + Math.sin(t * 2.6) * 3;
  const dir = (clothMaker === 'E' ? 1 : -1) * (1 - 2 * eio(seg(t, E0 + 2.3, E0 + 2.9)) + 2 * eio(seg(t, E0 + 4.3, E0 + 4.9)));
  const moving = Math.max(seg(t, E0 + 1.0, E0 + 2.2) * (1 - seg(t, E0 + 2.0, E0 + 2.2)), seg(t, E0 + 3.0, E0 + 4.2) * (1 - seg(t, E0 + 4.0, E0 + 4.2)), seg(t, F0 + 0.4, F0 + 1) * (1 - seg(t, F0 + 3.0, F0 + 3.6)));
  return { x, y, dir, tilt: Math.sin(t * 2.1) * 0.035, moving };
}
const deckOf = (b) => ({ x: b.x - 17 * b.dir, y: b.y - 12 });

function boat(b, a, cargo) {
  A(a, () => {
    // wake
    A(0.7 * b.moving, () => {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const s = Math.sign(b.dir) || 1;
      for (let i = 0; i < 3; i++) {
        const wx = b.x - s * (54 + i * 18), wy = b.y + 14;
        ctx.beginPath(); ctx.moveTo(wx - 8, wy - i * 2); ctx.quadraticCurveTo(wx, wy - 6 - i * 2, wx + 8, wy - i * 2); ctx.stroke();
      }
    });
    ell(b.x + 4, b.y + 18, 54, 8); ctx.fillStyle = 'rgba(6,80,104,0.2)'; ctx.fill();
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.tilt); ctx.scale(b.dir, 1);
    // mast and sail
    ctx.fillStyle = C.hullDark; ctx.fillRect(-2, -84, 4, 76);
    ctx.beginPath(); ctx.moveTo(4, -80); ctx.quadraticCurveTo(40, -46, 44, -14); ctx.lineTo(4, -14); ctx.closePath();
    ctx.fillStyle = C.sail; ctx.fill(); ctx.strokeStyle = 'rgba(15,61,76,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(2, -84); ctx.lineTo(20, -78); ctx.lineTo(2, -72); ctx.closePath(); ctx.fill();
    // cargo on deck
    if (cargo) cargo();
    // hull
    ctx.beginPath(); ctx.moveTo(-50, -8); ctx.lineTo(52, -8); ctx.quadraticCurveTo(44, 14, 28, 16); ctx.lineTo(-28, 16); ctx.quadraticCurveTo(-44, 14, -50, -8); ctx.closePath();
    ctx.fillStyle = C.hull; ctx.fill();
    ctx.fillStyle = C.cream; ctx.fillRect(-44, -2, 92, 4);
    ctx.restore();
  });
}

// ---------- cards ----------
const CARD = { y: 130, w: 336, h: 152 };
const cardX = (id) => LAND[id].cx - CARD.w / 2;

function cardFrame(id, a, glow, pop) {
  const x = cardX(id), y = CARD.y, cx = LAND[id].cx;
  A(a, () => {
    ctx.save(); ctx.translate(cx, y + CARD.h); ctx.scale(pop, pop); ctx.translate(-cx, -(y + CARD.h));
    shadowed(20, 8, () => {
      ctx.beginPath(); ctx.roundRect(x, y, CARD.w, CARD.h, 24);
      ctx.moveTo(cx + 16, y + CARD.h - 2); ctx.lineTo(cx, y + CARD.h + 16); ctx.lineTo(cx - 16, y + CARD.h - 2); ctx.closePath();
      ctx.fillStyle = C.cream; ctx.fill();
    });
    A(glow, () => { rrect(x + 1.5, y + 1.5, CARD.w - 3, CARD.h - 3, 23); ctx.lineWidth = 4; ctx.strokeStyle = C.leafDeep; ctx.stroke(); });
    font(800, 24); text(LAND[id].name.toUpperCase(), x + 22, y + 36, { spacing: '3px' });
    ctx.restore();
  });
}

function sticker(id, a) {
  A(a, () => {
    const x = cardX(id) + CARD.w - 18, y = CARD.y + 28;
    font(800, 22); const w = ctx.measureText('cheaper').width + 28;
    ctx.save(); ctx.translate(x - w / 2, y); const s = 0.7 + 0.3 * back(clamp(a)); ctx.scale(s, s);
    rrect(-w / 2, -17, w, 34, 17); ctx.fillStyle = C.leafDeep; ctx.fill();
    text('cheaper', 0, 1, { color: '#FFFFFF', align: 'center', base: 'middle' });
    ctx.restore();
  });
}

/** A number that changes from one value to the next by sliding and crossfading. */
function swapText(oldS, newS, q, x, y, opts) {
  if (q < 1) A(1 - q, () => text(oldS, x, y - 12 * q, opts));
  if (q > 0) A(q, () => text(newS, x, y + 12 * (1 - q), opts));
}

function rowsCard(id, t, values, appear, ticks) {
  const x = cardX(id);
  GOODS.forEach((g, i) => {
    const ry = CARD.y + 76 + i * 44;
    A(appear[i], () => {
      icon(g, x + 44, ry, g === 'cloth' ? 46 : 42);
      font(700, 28); text(g === 'cloth' ? 'Cloth' : 'Wine', x + 80, ry, { base: 'middle' });
      font(800, 34);
      const [oldS, newS, q] = values[i];
      swapText(oldS, newS, q, x + CARD.w - 24, ry, { align: 'right', base: 'middle' });
      if (ticks[i] > 0) tick(x + CARD.w - 24 - widthOf(newS, 800, 34) - 24, ry, ticks[i]);
    });
  });
}

function cardHours(id, t) {
  const c = LAND[id], o = LAND[other(id)];
  const d = id === 'P' ? 0.25 : 0;
  rowsCard(id, t,
    GOODS.map((g) => [`${c.hours[g]} h`, `${c.hours[g]} h`, 1]),
    GOODS.map((g, i) => eout(seg(t, A0 + 1.5 + d + i * 0.3, A0 + 2.0 + d + i * 0.3))),
    GOODS.map((g, i) => (c.hours[g] < o.hours[g] ? seg(t, A0 + 4.9 + i * 0.35, A0 + 5.3 + i * 0.35) : 0)));
}

function cardBar(id, t, m, mode) {
  const c = LAND[id], x = cardX(id);
  const kx = (CARD.w - 44) / MAXB, bx = x + 22, by = CARD.y + 52, bh = 40, total = c.budget * kx;
  const hc = mode === 'alone' ? c.hours.cloth : m.hc[id], hw = c.budget - hc;
  const u = mode === 'alone' ? m.fillC * c.hours.cloth + m.fillW * c.hours.wine : c.budget;
  rrect(bx, by, total, bh, 14); ctx.fillStyle = C.faint; ctx.fill();
  ctx.save(); rrect(bx, by, total, bh, 14); ctx.clip();
  ctx.fillStyle = C.coral; ctx.fillRect(bx, by, Math.min(u, hc) * kx, bh);
  ctx.fillStyle = C.grape; ctx.fillRect(bx + hc * kx, by, Math.max(0, u - hc) * kx, bh);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(bx, by, total, bh * 0.4);
  ctx.restore();
  rrect(bx, by, total, bh, 14); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(15,61,76,0.35)'; ctx.stroke();
  font(800, 22);
  const segLabel = (h, x0, a) => A(a * clamp((h * kx - 58) / 20), () => text(`${Math.round(h)} h`, x0 + (h * kx) / 2, by + bh / 2 + 1, { color: '#FFFFFF', align: 'center', base: 'middle' }));
  segLabel(hc, bx, mode === 'alone' ? seg(m.fillC, 0.7, 1) : 1);
  segLabel(hw, bx + hc * kx, mode === 'alone' ? seg(m.fillW, 0.7, 1) : 1);
  const style = { maxW: CARD.w - 30, size: 28, weight: 800, family: FONT, ink: C.ink, marks: { '*': C.coralDark, '^': C.grapeDark } };
  if (mode === 'alone') {
    const made = make(id, c.hours.cloth);
    A(seg(t, B0 + 2.5, B0 + 2.9), () => k.rich(`= ${nice(made.cloth)} *cloth* + ${nice(made.wine)} ^wine^`, LAND[id].cx, CARD.y + 122, style));
  } else {
    const made = SPEC_HOLD[id], g = id === clothMaker ? 'cloth' : 'wine';
    A(seg(t, D0 + 3.4, D0 + 3.8), () => k.rich(`= ${nice(made[g])} ${g === 'cloth' ? '*cloth*' : '^wine^'}`, LAND[id].cx, CARD.y + 122, style));
  }
}

function cardCost(id, t, g) {
  const c = LAND[id], x = cardX(id), og = otherGood(g), v = cost(id, g);
  const t0 = g === 'cloth' ? C0 + 4.2 : C0 + 12.0, fd = g === 'cloth' ? 1.3 : 0.9;
  const f = eio(seg(t, t0, t0 + fd));
  if (og === 'wine') wineRow(x + 26, CARD.y + 140, v * f, 62);
  else clothStack(x + 62, CARD.y + 138, v * f, 72);
  A(1 - seg(t, t0 - 0.2, t0 + 0.2), () => { font(800, 60); text('?', x + 214, CARD.y + 96, { color: C.soft, align: 'center', base: 'middle' }); });
  A(seg(t, t0 + fd - 0.3, t0 + fd + 0.1), () => {
    const vx = x + 120, s = nice(v);
    let size = 44; while (widthOf(s, 800, size) + 10 + widthOf(og, 800, 26) > CARD.w - 140 && size > 30) size -= 2;
    const sw = widthOf(s, 800, size);
    font(800, size); text(s, vx, CARD.y + 84, { base: 'middle' });
    font(800, 26); text(og, vx + sw + 10, CARD.y + 88, { color: og === 'wine' ? C.grapeDark : C.coralDark, base: 'middle' });
    font(700, 22); text(`${c.hours[g]} h ÷ ${c.hours[og]} h`, vx, CARD.y + 124, { color: C.soft, base: 'middle' });
  });
}

function cardAfter(id, t, m) {
  const before = SPEC_HOLD[id], after = FINAL[id];
  const qi = id === clothMaker ? { cloth: 0, wine: 3 } : { cloth: 1, wine: 2 };
  rowsCard(id, t,
    GOODS.map((g) => [nice(before[g]), nice(after[g]), m.q[qi[g]]]),
    [1, 1],
    GOODS.map((g, i) => (after[g] >= 1 ? seg(t, E0 + 4.8 + i * 0.3, E0 + 5.2 + i * 0.3) : 0)));
}

// ---------- ribbon and tray ----------
const RIBBON = [
  [A0 + 1.0, B0, 'HOURS OF WORK PER UNIT'],
  [B0, C0, 'WITHOUT TRADE'],
  [C0, C0 + 11.9, 'COST OF 1 UNIT OF CLOTH'],
  [C0 + 11.9, D0, 'COST OF 1 UNIT OF WINE'],
  [D0, E0, 'ALL HOURS ON ONE GOOD'],
  [E0, F0, 'SWAP 1 CLOTH FOR 1 WINE'],
  [F0, END + 1, 'THE IDEA'],
];
function ribbon(t, a) {
  const y = 100, w = 520, h = 40, x = W / 2 - w / 2;
  A(a, () => {
    ctx.fillStyle = C.coralDark;
    for (const s of [-1, 1]) {
      const ex = W / 2 + s * (w / 2 + 34), ix = W / 2 + s * (w / 2 - 16);
      ctx.beginPath(); ctx.moveTo(ix, y - h / 2 + 8); ctx.lineTo(ex, y - h / 2 + 8); ctx.lineTo(ex - s * 14, y + 4); ctx.lineTo(ex, y + h / 2 + 8); ctx.lineTo(ix, y + h / 2 + 8); ctx.closePath(); ctx.fill();
    }
    shadowed(10, 4, () => { rrect(x, y - h / 2, w, h, 10); ctx.fillStyle = C.coral; ctx.fill(); });
    font(800, 23);
    for (const [a0, b0, s] of RIBBON) {
      const al = span(t, a0, b0, 0.3, 0.3);
      if (al > 0) A(al, () => text(s, W / 2, y + 1, { color: C.ink, align: 'center', base: 'middle', spacing: '2px' }));
    }
  });
}

const TRAY = { x: 112, y: 580, w: 640, h: 146 };
function tray(t, m, a) {
  const { x, y, w, h } = TRAY;
  A(a, () => {
    shadowed(20, 8, () => { rrect(x, y, w, h, 26); ctx.fillStyle = C.cream; ctx.fill(); });
    font(800, 22); text('WORLD TOTAL', W / 2, y + 30, { color: C.soft, align: 'center', spacing: '3px' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(W / 2, y + 46); ctx.lineTo(W / 2, y + h - 16); ctx.stroke(); ctx.setLineDash([]);
    const pop = eout(seg(t, B0 + 4.0, B0 + 4.8));
    const q = seg(m.p, 0.35, 0.8), gain = seg(t, D0 + 4.1, D0 + 4.5);
    GOODS.forEach((g, i) => {
      A(pop, () => {
        if (g === 'cloth') clothStack(196, y + 132, m.total.cloth, 80);
        else wineRow(456, y + 134, m.total.wine, 74);
        const nx = g === 'cloth' ? 268 : 598;
        font(800, 46); swapText(nice(ALONE[g]), nice(SPEC[g]), q, nx, y + 80, { base: 'middle' });
        font(800, 24); text(g, nx, y + 118, { color: g === 'cloth' ? C.coralDark : C.grapeDark, base: 'middle' });
        A(gain, () => {
          font(800, 24); const gx = nx + widthOf(g, 800, 24) + 12;
          text(`+${nice(SPEC[g] - ALONE[g])}`, gx, y + 118 + (1 - eout(gain)) * 8, { color: C.leafDeep, base: 'middle' });
        });
      });
    });
  });
}

// ---------- scenes ----------
function hookRoute(t) {
  const a = span(t, A0 + 8.0, B0 + 0.1, 0.4, 0.4);
  A(a, () => {
    const x0 = DOCK.E, x1 = DOCK.P, y = DOCK.y;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.setLineDash([2, 12]); ctx.lineDashOffset = -t * 20;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(W / 2, y + 30, x1, y); ctx.stroke(); ctx.setLineDash([]);
    const s = 0.7 + 0.3 * back(seg(t, A0 + 8.1, A0 + 8.6));
    ctx.save(); ctx.translate(W / 2, y + 4 + Math.sin(t * 2.4) * 3); ctx.scale(s, s);
    shadowed(12, 4, () => { ell(0, 0, 32, 32); ctx.fillStyle = C.cream; ctx.fill(); });
    font(800, 42); text('?', 0, 2, { color: C.coralDark, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

function cards(t, m) {
  const frameA = span(t, A0 + 1.0, F0 + 0.5, 0.4, 0.5);
  const pop = 0.9 + 0.1 * back(seg(t, A0 + 1.0, A0 + 1.5));
  for (const id of IDS) {
    const glow = id === clothMaker ? span(t, C0 + 8.0, C0 + 12.0, 0.4, 0.3) : span(t, C0 + 13.1, D0 + 0.1, 0.4, 0.3);
    cardFrame(id, frameA, glow, pop);
    A(frameA, () => {
      const modes = [
        [A0 + 1.0, B0, () => cardHours(id, t)],
        [B0, C0, () => cardBar(id, t, m, 'alone')],
        [C0, C0 + 12.0, () => cardCost(id, t, 'cloth')],
        [C0 + 11.9, D0, () => cardCost(id, t, 'wine')],
        [D0, E0, () => cardBar(id, t, m, 'special')],
        [E0, F0 + 0.5, () => cardAfter(id, t, m)],
      ];
      for (const [a0, b0, fn] of modes) { const al = span(t, a0, b0, 0.3, 0.3); if (al > 0) A(al, fn); }
    });
    sticker(id, (id === clothMaker ? span(t, C0 + 8.0, C0 + 12.0, 0.4, 0.3) : span(t, C0 + 13.1, D0 + 0.1, 0.4, 0.3)) * frameA);
  }
}

function goodsInTransit(t, m, b) {
  const deck = deckOf(b);
  const fly = (q, from, to, draw) => {
    if (q <= 0 || q >= 1) return;
    const x = lerp(from.x, to.x, q), y = lerp(from.y, to.y, q) - Math.sin(Math.PI * q) * 70;
    draw(x, y);
  };
  const cm = LAND[clothMaker].cx, wm = LAND[wineMaker].cx;
  const clothFrom = { x: cm + GOOD_POS.clothDx, y: GOOD_POS.by - 30 }, clothTo = { x: wm + GOOD_POS.clothDx, y: GOOD_POS.by - 4 };
  const wineFrom = { x: wm + GOOD_POS.wineDx + 10, y: GOOD_POS.by - 40 }, wineTo = { x: cm + GOOD_POS.wineDx + 10, y: GOOD_POS.by };
  fly(m.q[0], clothFrom, deck, (x, y) => clothPiece(x, y + 6, 52));
  fly(m.q[1], deck, clothTo, (x, y) => clothPiece(x, y + 6, 52));
  fly(m.q[2], wineFrom, deck, (x, y) => bottle(x, y + 22, 46));
  fly(m.q[3], deck, wineTo, (x, y) => bottle(x, y + 22, 46));
}

function finale(t) {
  const a = span(t, F0 + 0.3, END + 1, 0.6, 0);
  A(a, () => {
    const x = 112, y = 130, w = 640, h = 180;
    const p = eout(seg(t, F0 + 0.3, F0 + 0.9));
    ctx.save(); ctx.translate(0, (1 - p) * 16);
    shadowed(22, 8, () => { rrect(x, y, w, h, 28); ctx.fillStyle = C.cream; ctx.fill(); });
    const title = 'Comparative advantage';
    let size = 58; while (widthOf(title, 800, size) > w - 60) size -= 2;
    font(800, size); text(title, W / 2, y + 66, { align: 'center', base: 'middle' });
    // a wavy underline
    ctx.strokeStyle = C.coral; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const ul = eio(seg(t, F0 + 0.8, F0 + 1.6)), ux0 = W / 2 - 170;
    ctx.beginPath();
    for (let i = 0; i <= 60 * ul; i++) { const ux = ux0 + (340 * i) / 60, uy = y + 106 + Math.sin(i / 3) * 4; i ? ctx.lineTo(ux, uy) : ctx.moveTo(ux, uy); }
    if (ul > 0) ctx.stroke();
    font(700, 26); text('David Ricardo, 1817', W / 2, y + 144, { color: C.soft, align: 'center', base: 'middle' });
    ctx.restore();
  });
  A(span(t, F0 + 1.0, END + 1, 0.5, 0), () => {
    font(700, 22); const s = 'Source: Wikipedia, “Comparative advantage”'; const w = ctx.measureText(s).width + 40;
    shadowed(10, 4, () => { rrect(W / 2 - w / 2, 640, w, 44, 22); ctx.fillStyle = 'rgba(255,248,236,0.94)'; ctx.fill(); });
    text(s, W / 2, 663, { color: C.ink, align: 'center', base: 'middle' });
  });
}

function captionPanel(t) {
  A(seg(t, 0.1, 0.5), () => {
    shadowed(22, 8, () => { rrect(56, 748, W - 112, 166, 30); ctx.fillStyle = C.cream; ctx.fill(); });
    ctx.fillStyle = C.coral; rrect(W / 2 - 40, 748, 80, 8, 4); ctx.fill();
  });
  k.captions(t, CUES, { x: W / 2, y: 830, maxW: 680, size: 42, lh: 54, weight: 800, family: FONT, ink: C.ink,
    marks: { '*': C.coralDark, '^': C.grapeDark, '~': C.leafDeep } });
}

Kit.scene({
  width: W, height: H, duration: END,
  fonts: [{ family: FONT, file: 'Nunito.woff2', weight: '400 800' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    sea(t);
    header();
    const m = world(t);
    for (const [i, id] of IDS.entries()) {
      const r = seg(t, 0.2 + i * 0.15, 1.3 + i * 0.15);
      ctx.save(); ctx.translate(0, (1 - eout(r)) * 30);
      island(id, t, 0.75 + 0.25 * back(r), seg(r, 0, 0.4));
      ctx.restore();
    }
    islandGoods(m);
    hookRoute(t);
    const b = boatState(t);
    boat(b, seg(t, E0 + 0.1, E0 + 0.5), () => {
      // cargo, drawn in the boat's frame (deck at x = -17)
      if (m.q[0] >= 1 && m.q[1] <= 0) clothPiece(-17, -6, 52);
      if (m.q[2] >= 1 && m.q[3] <= 0) bottle(-17, -6, 46);
    });
    goodsInTransit(t, m, b);
    tray(t, m, span(t, B0 + 3.9, F0 + 0.5, 0.4, 0.5) * (1 - 0.55 * span(t, C0 + 0.3, D0 + 0.3, 0.5, 0.5)));
    cards(t, m);
    ribbon(t, span(t, A0 + 1.0, END + 1, 0.4, 0));
    finale(t);
    captionPanel(t);
  },
});
