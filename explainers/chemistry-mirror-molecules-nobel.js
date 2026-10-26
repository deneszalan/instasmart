// Explainer for chemistry-mirror-molecules-nobel: the 2026 Nobel Prize in Chemistry went to Henri Kagan and
// Kenso Soai for non-linear effects and autocatalysis in asymmetric synthesis: how one mirror-image form of a
// molecule can take over. Look: warm ivory paper with a silver mirror line down the middle; left-handed forms
// in rose, right-handed in teal; ball-and-stick molecules and conical flasks of dots. Fraunces for titles and
// numbers, Alegreya Sans for captions and labels.
//
// Computed here: the 3D tetrahedral molecule and its mirror image, turned to show that no rotation makes them
// match; Kagan's example from the Nobel popular background: a catalyst 75% right and 25% left pairs at random
// into right-right 56%, mixed 38% and left-left 6%, and if mixed pairs barely work it acts like one that is
// 56/(56+6) = 90% right; the flask dots follow the stated shares.
// Facts: Nobel press release, 7 October 2026: Kagan and Soai, "for the discovery of non-linear effects and
// autocatalysis in asymmetric organic synthesis"; life is homochiral: the amino acids in proteins are
// left-handed and the sugars in DNA right-handed; reactions in flasks gave even mixtures; a chiral catalyst
// partly passes its handedness on (asymmetric catalysis); chemists assumed the product's excess followed the
// catalyst's in proportion; Kagan (1986) found non-linear effects; Soai found a molecule (a pyrimidyl
// alkanol) that catalyses its own formation; a lead of 0.00005% grew to 57%, 99% and over 99.5% excess in
// three runs (Nobel popular and scientific backgrounds); in 2003 he started from no added chirality and chance
// decided which form won; the Soai reaction is artificial, not life's chemistry; for drugs, often only one
// mirror form has the wanted effect.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the prize; two hands in a mirror.
//  B  9.0–23.0  Chiral molecules never match their mirror image; life uses one hand; flasks make 50:50.
//  C 23.0–41.2  A one-handed catalyst tips the balance; Kagan's pairs: 75% acts like 90%.
//  D 41.2–55.0  Soai: a molecule that makes itself; one in two million to over 99.5%; chance picks the hand.
//  E 55.0–64.6  Not life's chemistry, but one hand can take over; why drug makers care.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#f5efe2', paper2: '#e9dfca', ink: '#2b1d3a', soft: 'rgba(43,29,58,0.70)', faint: 'rgba(43,29,58,0.22)',
  rose: '#c2185b', teal: '#00897b', grey: '#aaa298', gold: '#c98a1a', mirror: '#8d90a6', carbon: '#3b3346',
  atoms: ['#e0a526', '#3b6fd8', '#3a9a5b', '#f4f1ea'],
};
const SERIF = 'Fraunces', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

// ---------- Kagan's example (Nobel popular background, figure 4) ----------
const CAT_R = 0.75;
const PAIRS = { rr: CAT_R * CAT_R, mixed: 2 * CAT_R * (1 - CAT_R), ll: (1 - CAT_R) ** 2 }; // 0.5625, 0.375, 0.0625
const ACTS_LIKE = PAIRS.rr / (PAIRS.rr + PAIRS.ll); // 0.9
const pct = (x) => `${Math.round(x * 100)}%`;
// ---------- Soai's three runs (excess of one hand, %) ----------
const RUNS = [['start', 0.00005, '0.00005%'], ['run 1', 57, '57%'], ['run 2', 99, '99%'], ['run 3', 99.5, '>99.5%']];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 7 October 2026, Henri Kagan and Kenso Soai won the Nobel Prize in Chemistry.'],
  [4.8, 9.0, 'Many molecules come in two mirror-image forms, like your ~left~ and *right* hands.'],
  [9.2, 13.6, 'However you turn them, they never match. Chemists call such molecules *chiral*.'],
  [13.8, 18.2, 'Life picks one hand: the amino acids in your proteins are all ~left-handed~.'],
  [18.4, 22.8, 'Yet ordinary reactions in a flask make both hands, half and half.'],
  [23.0, 27.4, 'A catalyst with a hand of its own tips the balance and passes its hand on.'],
  [27.6, 32.0, 'Chemists assumed the product could be no more one-sided than the catalyst.'],
  [32.2, 36.6, 'In 1986 Kagan showed why it can be: the catalyst’s parts pair up, and *mixed pairs* barely work.'],
  [36.8, 41.2, `So a catalyst ${pct(CAT_R)} right acts like one *${pct(ACTS_LIKE)}* right. The product beats it.`],
  [41.4, 45.8, 'Soai found a molecule that is the catalyst for *its own* making.'],
  [46.0, 50.4, 'A lead of one molecule in two million grew in three runs to a lead of over *99.5%*.'],
  [50.6, 55.0, 'In 2003 he started with no lead at all, and chance decided which hand won.'],
  [55.2, 59.6, 'His reaction isn’t life’s chemistry, but it shows how one hand can take over.'],
  [59.8, 64.2, 'And it matters for medicines, where often only one hand does the job.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(110,80,40,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
  for (let i = 0; i < 30; i++) { const x = r() * W, y = r() * H, rad = 60 + r() * 160; const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, `rgba(200,170,120,${0.03 + r() * 0.04})`); rg.addColorStop(1, 'rgba(200,170,120,0)'); g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
}

function mirrorLine(a, y0 = 230, y1 = 760) {
  A(a, () => {
    ctx.strokeStyle = C.mirror; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(W / 2, y0); ctx.lineTo(W / 2, y1); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('mirror', W / 2, y0 - 22, { color: C.mirror, align: 'center', base: 'middle' });
  });
}

function hand(cx, cy, s, flip, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(flip * s, s);
  ctx.fillStyle = color;
  k.rrect(-60, -40, 120, 140, 40); ctx.fill();
  [[-56, 30, 150], [-26, 32, 176], [6, 32, 168], [36, 28, 140]].forEach(([x, w, h]) => { k.rrect(x, -h + 10, w - 4, h, 15); ctx.fill(); });
  ctx.save(); ctx.translate(48, 56); ctx.rotate(0.95); k.rrect(-17, -104, 34, 108, 16); ctx.fill(); ctx.restore();
  ctx.restore();
}

// a tetrahedral molecule: carbon in the middle, four different atoms; mirror = -1 flips x
const TET = [[0, -1, 0], [0, 1 / 3, 0.943], [-0.816, 1 / 3, -0.471], [0.816, 1 / 3, -0.471]];
function molecule(cx, cy, size, mirror, turn, tint, a = 1) {
  const pts = TET.map(([x, y, z], i) => {
    let X = x * mirror, Z = z;
    const c = Math.cos(turn + 0.45), s = Math.sin(turn + 0.45);
    [X, Z] = [X * c + Z * s, -X * s + Z * c];
    const tilt = -0.32, Y = y * Math.cos(tilt) - Z * Math.sin(tilt); Z = y * Math.sin(tilt) + Z * Math.cos(tilt);
    return { i, x: cx + X * size, y: cy + Y * size, z: Z };
  });
  A(a, () => {
    const order = [...pts].sort((p, q) => p.z - q.z);
    const drawAtom = (p) => { const r = size * (0.27 + 0.05 * p.z); circle(p.x, p.y, r, C.atoms[p.i]); ctx.strokeStyle = 'rgba(43,29,58,0.55)'; ctx.lineWidth = 2; ctx.stroke(); };
    for (const p of order.filter((p) => p.z < 0)) { ctx.strokeStyle = C.carbon; ctx.lineWidth = size * 0.09; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke(); drawAtom(p); }
    circle(cx, cy, size * 0.3, tint); ctx.strokeStyle = 'rgba(43,29,58,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    for (const p of order.filter((p) => p.z >= 0)) { ctx.strokeStyle = C.carbon; ctx.lineWidth = size * 0.09; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke(); drawAtom(p); }
  });
}

// a conical flask holding dots, `share` of them right-handed (teal); `grey` of the rest shown greyed out
const DOTS = (() => { let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); const out = []; while (out.length < 120) { const u = r(), v = r(); if (Math.abs(u - 0.5) * 2 <= 0.25 + 0.75 * v) out.push({ u, v, key: r() }); } return out; })();
function flask(cx, cy, s, share, { greyMixed = 0, label = null } = {}) {
  const top = cy - 150 * s, bot = cy + 120 * s, neck = 34 * s, base = 130 * s;
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx - neck, top); ctx.lineTo(cx - neck, cy - 60 * s); ctx.lineTo(cx - base, bot); ctx.lineTo(cx + base, bot); ctx.lineTo(cx + neck, cy - 60 * s); ctx.lineTo(cx + neck, top); ctx.closePath(); ctx.fill(); ctx.stroke();
  const sorted = [...DOTS].sort((a, b) => a.key - b.key);
  sorted.forEach((d, i) => {
    const right = i < share * DOTS.length;
    const y = lerp(cy - 30 * s, bot - 14 * s, d.v), half = lerp(neck + 10 * s, base - 14 * s, d.v) * 0.92;
    const x = cx + (d.u - 0.5) * 2 * half * (0.25 + 0.75 * d.v) / (0.25 + 0.75 * d.v + 0.0001);
    const mixed = !right && i < (share + (1 - share) * greyMixed) * DOTS.length;
    circle(x, y, 6 * s, mixed ? C.grey : right ? C.teal : C.rose);
  });
  if (label) { font(700, 26); text(label, cx, bot + 34 * s, { color: C.ink, align: 'center', base: 'middle' }); }
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.2, 9.2, 0.6, 0.4), () => {
      font(700, 26, SANS); text('NOBEL PRIZE IN CHEMISTRY 2026', 60, 96, { color: C.gold, base: 'middle', spacing: '2px' });
      font(700, 50, SERIF); text('Henri Kagan', 60, 152, { base: 'middle' }); text('Kenso Soai', 60, 210, { base: 'middle' });
    });
    mirrorLine(eout(seg(t, 1.0, 2.0)), 270, 760);
    const g = eout(seg(t, 1.4, 2.6));
    A(g, () => { hand(W / 2 - 170, 560, 1.0, -1, C.rose); hand(W / 2 + 170, 560, 1.0, 1, C.teal); });
    A(span(t, 4.8, 9.2), () => { font(700, 30); text('left', W / 2 - 170, 730, { color: C.rose, align: 'center', base: 'middle' }); text('right', W / 2 + 170, 730, { color: C.teal, align: 'center', base: 'middle' }); });
  });
}

function sceneChiral(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the molecule and its mirror image; then the mirror image slides over and turns, never matching
    A(1 - seg(t, 13.6, 14.2), () => {
      mirrorLine(1, 230, 700);
      const turn = eio(seg(t, 10.2, 13.4)) * Math.PI * 2;
      molecule(W / 2 - 190, 480, 130, 1, 0, C.rose);
      molecule(W / 2 + 190, 480, 130, -1, turn, C.teal);
      A(seg(t, 10.2, 10.8), () => { font(700, 30, SERIF); text('turn it any way you like:', W / 2 + 190, 270, { color: C.ink, align: 'center', base: 'middle' }); });
      A(seg(t, 12.0, 12.6), () => { font(700, 30, SERIF); text('it never matches', W / 2 + 190, 690, { color: C.ink, align: 'center', base: 'middle' }); });
    });
    // life's single hand
    A(span(t, 13.8, 18.4, 0.4, 0.3), () => {
      font(700, 30, SERIF); text('in living things', 70, 210, { base: 'middle' });
      const rowY = [330, 520];
      font(700, 26); text('amino acids in proteins', 70, rowY[0] - 60, { color: C.soft, base: 'middle' }); text('sugars in DNA', 70, rowY[1] - 60, { color: C.soft, base: 'middle' });
      for (let i = 0; i < 8; i++) {
        const g = eout(seg(t, 14.0 + i * 0.1, 14.4 + i * 0.1));
        A(g, () => {
          circle(110 + i * 88, rowY[0], 32, C.rose); font(800, 30, SERIF); text('L', 110 + i * 88, rowY[0] + 2, { color: '#fff', align: 'center', base: 'middle' });
          if (i < 7) { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(142 + i * 88, rowY[0]); ctx.lineTo(166 + i * 88, rowY[0]); ctx.stroke(); }
          circle(110 + i * 88, rowY[1], 32, C.teal); text('D', 110 + i * 88, rowY[1] + 2, { color: '#fff', align: 'center', base: 'middle' });
          if (i < 7) { ctx.beginPath(); ctx.moveTo(142 + i * 88, rowY[1]); ctx.lineTo(166 + i * 88, rowY[1]); ctx.stroke(); }
        });
      }
      font(600, 24); text('left-handed (L)', 70, rowY[0] + 60, { color: C.rose, base: 'middle' }); text('right-handed (D)', 70, rowY[1] + 60, { color: C.teal, base: 'middle' });
    });
    // a flask makes both
    A(span(t, 18.4, 23.0, 0.4, 0.3), () => {
      flask(W / 2, 470, 1.35, 0.5, { label: null });
      font(800, 52, SERIF); text('50 : 50', W / 2, 200, { color: C.ink, align: 'center', base: 'middle' });
      font(700, 26); text('left', W / 2 - 120, 260, { color: C.rose, align: 'center', base: 'middle' }); text('right', W / 2 + 120, 260, { color: C.teal, align: 'center', base: 'middle' });
    });
  });
}

function pie(cx, cy, r, parts, a = 1) {
  let start = -Math.PI / 2;
  for (const [frac, color] of parts) {
    const end = start + frac * Math.PI * 2 * a;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, end); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.paper; ctx.lineWidth = 3; ctx.stroke();
    start = end;
  }
}

function sceneKagan(t) {
  const a = span(t, 23.0, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a catalyst with a hand: the product comes out lopsided
    A(1 - seg(t, 27.4, 28.0), () => {
      molecule(220, 420, 110, 1, 0.6, C.teal);
      font(700, 28); text('one-handed catalyst', 220, 610, { color: C.teal, align: 'center', base: 'middle' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(360, 420); ctx.lineTo(450, 420); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(450, 420); ctx.lineTo(432, 406); ctx.lineTo(432, 434); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
      flask(620, 440, 1.0, lerp(0.5, 0.7, eout(seg(t, 24.0, 26.0))), { label: 'more right than left' });
    });
    // the old assumption: a straight line
    A(span(t, 27.6, 32.2, 0.4, 0.3), () => {
      const L = 150, R = 720, T = 210, B = 640;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
      font(600, 24); text('how one-sided the catalyst is', (L + R) / 2, B + 40, { color: C.soft, align: 'center', base: 'middle' });
      ctx.save(); ctx.translate(L - 40, (T + B) / 2); ctx.rotate(-Math.PI / 2); text('how one-sided the product is', 0, 0, { color: C.soft, align: 'center', base: 'middle' }); ctx.restore();
      const p = eout(seg(t, 28.0, 29.4));
      ctx.strokeStyle = C.grey; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(lerp(L, R, p), lerp(B, T, p)); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 29.2, 29.8), () => { font(700, 28, SERIF); text('what chemists expected', R, T + 190, { color: C.grey, align: 'right', base: 'middle' }); });
      // Kagan's curve bowing above the line (shape only, as in his 1986 plot)
      const q = eout(seg(t, 30.4, 31.6));
      if (q > 0) {
        ctx.strokeStyle = C.teal; ctx.lineWidth = 6; ctx.beginPath();
        for (let i = 0; i <= 60 * q; i++) { const x = i / 60, y = Math.tanh(2.2 * x) / Math.tanh(2.2); i ? ctx.lineTo(lerp(L, R, x), lerp(B, T, y)) : ctx.moveTo(L, B); }
        ctx.stroke();
        A(seg(t, 31.0, 31.6), () => { font(700, 28, SERIF); text('what Kagan found', L + 70, T + 30, { color: C.teal, base: 'middle' }); });
      }
    });
    // pairs on the metal: right-right, mixed, left-left
    A(span(t, 32.2, 41.4, 0.4, 0.4), () => {
      font(800, 44, SERIF); text('1986', 60, 104, { color: C.gold, base: 'middle' });
      const cx = 250, cy = 420, r = 150, p = eout(seg(t, 32.6, 33.8));
      pie(cx, cy, r, [[CAT_R, C.teal], [1 - CAT_R, C.rose]], p);
      font(700, 26); text('the catalyst’s', cx, cy + r + 36, { color: C.ink, align: 'center', base: 'middle' }); text('chiral parts', cx, cy + r + 66, { color: C.ink, align: 'center', base: 'middle' });
      A(p, () => { font(800, 32, SERIF); text(pct(CAT_R), cx + 30, cy + 40, { color: '#fff', align: 'center', base: 'middle' }); text(pct(1 - CAT_R), cx - 60, cy - 70, { color: '#fff', align: 'center', base: 'middle' }); });
      const q = eout(seg(t, 34.0, 35.2)), dead = seg(t, 35.4, 36.2);
      A(q, () => {
        const rows = [['right + right', PAIRS.rr, C.teal, C.teal], ['mixed', PAIRS.mixed, C.teal, C.rose], ['left + left', PAIRS.ll, C.rose, C.rose]];
        rows.forEach(([lab, frac, c1, c2], i) => {
          const y = 300 + i * 110, x = 500, isMixed = i === 1;
          A(isMixed ? 1 - 0.65 * dead : 1, () => {
            circle(x, y, 22, c1); circle(x + 40, y, 22, c2); circle(x + 20, y - 26, 12, C.carbon);
            font(700, 28); text(lab, x + 80, y - 12, { color: C.ink, base: 'middle' });
            font(800, 30, SERIF); text(`${Math.round(frac * 100)}%`, x + 80, y + 22, { color: C.ink, base: 'middle' });
          });
          if (isMixed && dead > 0) A(dead, () => { font(700, 24); text('barely works', x + 80, y + 54, { color: C.rose, base: 'middle' }); });
        });
      });
      A(span(t, 36.8, 41.4), () => {
        ctx.fillStyle = 'rgba(0,137,123,0.12)'; k.rrect(470, 600, 340, 110, 16); ctx.fill();
        font(700, 26); text('so the reaction runs like', 490, 630, { color: C.ink, base: 'middle' });
        font(800, 44, SERIF); text(`${pct(ACTS_LIKE)} right`, 490, 682, { color: C.teal, base: 'middle' });
      });
    });
  });
}

function sceneSoai(t) {
  const a = span(t, 41.4, 55.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a molecule that makes itself
    A(1 - seg(t, 45.8, 46.4), () => {
      const gens = [[[150, 450]], [[420, 350], [420, 550]], [[690, 280], [690, 400], [690, 520], [690, 640]]];
      const arrow = (x0, y0, x1, y1) => {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const a = Math.atan2(y1 - y0, x1 - x0); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - Math.cos(a - 0.4) * 16, y1 - Math.sin(a - 0.4) * 16); ctx.lineTo(x1 - Math.cos(a + 0.4) * 16, y1 - Math.sin(a + 0.4) * 16); ctx.fill();
      };
      gens.forEach((row, gi) => A(eout(seg(t, 41.8 + gi * 1.2, 42.4 + gi * 1.2)), () => {
        row.forEach(([x, y], i) => {
          if (gi > 0) { const [px, py] = gens[gi - 1][Math.floor(i / 2)]; arrow(px + 62, py, x - 62, y); }
          molecule(x, y, gi === 2 ? 46 : 60, -1, 0.4 + i * 0.9 + gi, C.teal);
        });
      }));
      font(700, 30, SERIF); text('each copy helps make more copies', 70, 180, { color: C.teal, base: 'middle' });
    });
    // three runs
    A(span(t, 46.0, 50.6, 0.4, 0.3), () => {
      const L = 220, Wd = 520;
      font(700, 28, SERIF); text('lead of one hand over the other', 70, 180, { color: C.ink, base: 'middle' });
      RUNS.forEach(([lab, v, shown], i) => {
        const y = 260 + i * 110, g = eout(seg(t, 46.4 + i * 0.8, 47.2 + i * 0.8));
        font(700, 28); text(lab, 70, y, { color: C.soft, base: 'middle' });
        ctx.fillStyle = 'rgba(43,29,58,0.08)'; ctx.fillRect(L, y - 24, Wd, 48);
        ctx.fillStyle = C.teal; ctx.fillRect(L, y - 24, Math.max(3, (v / 100) * Wd * g), 48);
        A(g, () => { font(800, 30, SERIF); text(shown, L + Math.max(14, (v / 100) * Wd * g) + (v > 90 ? -150 : 14), y + 2, { color: v > 90 ? '#fff' : C.ink, base: 'middle' }); });
      });
      A(seg(t, 46.4, 47.0), () => { font(600, 24); text('one extra molecule in two million', L, 260 + 44, { color: C.soft, base: 'middle' }); });
    });
    // chance picks the hand
    A(span(t, 50.6, 55.0, 0.4, 0.3), () => {
      font(800, 44, SERIF); text('2003', 60, 104, { color: C.gold, base: 'middle' });
      const p = eio(seg(t, 51.4, 54.0));
      flask(250, 450, 1.05, lerp(0.5, 0.985, p), { label: 'one try' });
      flask(614, 450, 1.05, lerp(0.5, 0.015, p), { label: 'another try' });
    });
  });
}

function sceneEnd(t) {
  const a = span(t, 55.2, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    A(1 - seg(t, 59.6, 60.2), () => {
      mirrorLine(1, 270, 760);
      const take = eout(seg(t, 56.0, 58.0));
      hand(W / 2 - 170, 560, 1.0, -1, `rgba(170,162,152,${1})`);
      A(take, () => hand(W / 2 - 170, 560, 1.0, -1, C.rose));
      hand(W / 2 + 170, 560, 1.0, 1, C.grey);
      A(take, () => { font(700, 30, SERIF); text('one hand takes over', W / 2 - 170, 200, { color: C.rose, align: 'center', base: 'middle' }); });
    });
    A(span(t, 59.9, 64.8, 0.5, 0.01), () => {
      mirrorLine(1, 270, 700);
      const pill = (cx, color) => {
        ctx.save(); ctx.translate(cx, 470); ctx.rotate(-0.5);
        ctx.fillStyle = color; k.rrect(-120, -50, 120, 100, 50); ctx.fill(); ctx.fillStyle = '#fff'; k.rrect(0, -50, 120, 100, 50); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; k.rrect(-120, -50, 240, 100, 50); ctx.stroke();
        ctx.restore();
      };
      pill(W / 2 - 190, C.rose); pill(W / 2 + 190, C.teal);
      font(700, 28); text('same atoms, mirrored', W / 2, 640, { color: C.ink, align: 'center', base: 'middle' });
      font(600, 24); text('the body can tell them apart', W / 2, 680, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneChiral(t);
    sceneKagan(t);
    sceneSoai(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 42, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.teal, '~': C.rose } });
  },
});
