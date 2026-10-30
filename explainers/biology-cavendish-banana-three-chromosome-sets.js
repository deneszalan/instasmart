// Explainer for biology-cavendish-banana-three-chromosome-sets: in October 2026 Yelloway, a venture of the banana
// company Chiquita and the breeding firm KeyGene, announced a fertile line of Cavendish banana; the Guardian
// reported it on 22 October 2026. Why that is news: a Cavendish has three sets of chromosomes, so its sex cells
// almost never come out balanced and it makes next to no seeds; it is grown from offshoots, so every plant is a
// near-identical clone, open to the same diseases. Look: a night plantation in deep leaf green, banana yellow,
// chromosomes in coral, sky blue and lilac. Fredoka (rounded, friendly) for titles and numbers, Rubik for captions.
//
// Facts: The Guardian, "Have scientists finally found a way to save the banana from disaster?" (Nicola Davis,
// 22 October 2026): this month Yelloway, a research collaboration between Chiquita and KeyGene, announced a fully
// fertile Cavendish banana, so new varieties may be bred by crossing; the Cavendish took over from the Gros Michel,
// which fell victim to Panama disease from the 1950s; the Cavendish is under threat from a strain of Panama
// disease, Tropical Race 4 (TR4); Jose De Vega (Earlham Institute): Cavendish bananas have three sets of
// chromosomes, so they are typically sterile, and with the ability to set fruit without pollination this gives the
// seedless banana; new plants are grown from offshoots, so they are virtually genetically identical and vulnerable
// to the same diseases; James Dale and De Vega: how Yellowdish was produced, and with how many chromosomes, has not
// been revealed. FreshPlaza (13 October 2026), on Yelloway's announcement: "entirely natural Cavendish plants that
// retain 100% Cavendish genetics and are also fertile"; crossed with disease-resistant Yelloway varieties, offspring
// growing; before, "thousands of manual crosses" to get "just one or two seeds" (Fernando Garcia-Bastidas); aim of
// at least one commercial variety for selected partners by 2030. Wikipedia, "Musa acuminata": wild plants are
// diploid, 2n = 2x = 22; cultivars mostly triploid, 2n = 3x = 33, and parthenocarpic. Wikipedia, "Cavendish
// banana": AAA triploid, propagated as identical clones, very low genetic diversity. Wikipedia, "Banana": Panama
// disease is caused by a Fusarium fungus; wild bananas have numerous large, hard seeds.
//
// Computed here, in a simple model of meiosis: each of the 11 chromosome trios sends two copies to one side and one
// to the other, each way equally likely and independently; a sex cell is balanced only if it gets one copy of all
// 11 or two of all 11: 2 × (1/2)^11 = 2 / 2,048 = 1 in 1,024. Real triploid meiosis is messier, so this is a
// picture of why, not an exact rate. The plantation, the fungus and the chromosome shapes are illustrative.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  The news; Cavendish everywhere, no seeds.
//  B  9.6–23.2  Clones from offshoots; Gros Michel in the 1950s; TR4 now; breeding needs seeds.
//  C 23.2–41.6  Two sets vs three; pairs split evenly, trios split 2:1; balanced only if all go the same way.
//  D 41.6–50.8  1 in 1,024; fruit without pollination: seedless.
//  E 50.8–64.8  Thousands of crosses for a seed or two; Yelloway's fertile line; not yet published; 2030 aim.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#07130b', bg1: '#10261a', ink: '#f6f3e6', soft: 'rgba(246,243,230,0.76)', faint: 'rgba(246,243,230,0.3)',
  yellow: '#ffd23f', yellowLo: '#c99a12', leaf: '#5fae4e', leafLo: '#2f6b33', brown: '#8a5a2b', sick: '#9b7a3a',
  a: '#ff7b6b', b: '#6cc4ff', c: '#c6a3ff', bad: '#ff6b6b', good: '#8ee28a', panel: 'rgba(6,16,10,0.9)',
};
const ROUND = 'Fredoka', SANS = 'Rubik';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const X = 11, WILD = 2 * X, CAV = 3 * X;
const BALANCED = 2 * 0.5 ** X; // 2 / 2,048
const ONE_IN = Math.round(1 / BALANCED); // 1,024
const fmt = (n) => n.toLocaleString('en-US');

const CUES = [
  [0.4, 4.8, 'In October 2026, *Yelloway*, a venture of Chiquita and the breeders KeyGene, announced a *fertile Cavendish*.'],
  [5.0, 9.4, 'Most bananas sold worldwide are *Cavendish*, and a Cavendish has no seeds. So how do you grow more?'],
  [9.6, 14.0, 'From offshoots: each new plant sprouts from an old one, so every Cavendish is a near-identical ~clone~.'],
  [14.2, 18.6, 'Clones share weaknesses. From the 1950s, Panama disease, a fungus, felled the earlier favourite, *Gros Michel*.'],
  [18.8, 23.2, 'Now a strain called ^TR4^ threatens the Cavendish. To breed a banana that resists it, you need *seeds*.'],
  [23.4, 27.8, `Why are there none? A wild banana has *2 sets* of ${X} chromosomes. A Cavendish has *3 sets*: ${CAV} in all.`],
  [28.0, 32.4, 'To make sex cells, a plant splits its chromosomes in half. A pair splits neatly: one copy each way.'],
  [32.6, 37.0, 'But a ~trio~ can only split two and one, and which side gets two is roughly a coin toss.'],
  [37.2, 41.6, `A sex cell works only if all ${X} go the same way: one copy of every one, or two of every one.`],
  [41.8, 46.2, `In this simple picture that’s 2 chances in ${fmt(2 ** X)}: about *1 in ${fmt(ONE_IN)}*. Nearly all come out unbalanced.`],
  [46.4, 50.8, 'The fruit grows anyway, because a Cavendish sets fruit without pollination. That is the seedless banana.'],
  [51.0, 55.4, 'Yelloway’s breeders say it took *thousands* of hand crosses to get one or two Cavendish seeds.'],
  [55.6, 60.0, 'They say their new line keeps all-Cavendish genes, is fertile, and has been crossed with resistant bananas.'],
  [60.2, 64.6, 'How it was made, and with how many chromosomes, isn’t published yet. They aim for a new variety by 2030.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(0.75, C.bg0); lg.addColorStop(1, '#040b06');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint leaf shapes
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = 'rgba(95,174,78,0.05)';
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = r() * 760, a = r() * TAU, l = 120 + r() * 160;
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 0, l, l * 0.22, 0, 0, TAU); g.fill(); g.restore();
  }
}

// ---------- pieces ----------
function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 16); ctx.fill(); fn(); }

/** A banana: a thick curved stroke from its stalk end at (x, y), length l, pointing along `rot`. */
function banana(x, y, l, rot = 0, col = C.yellow) {
  if (l <= 1) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.lineCap = 'round';
  ctx.strokeStyle = C.yellowLo; ctx.lineWidth = l * 0.2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * 0.55, l * 0.28, l, -l * 0.08); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = l * 0.15;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * 0.55, l * 0.26, l, -l * 0.08); ctx.stroke();
  ctx.fillStyle = '#4a3a1a'; ctx.beginPath(); ctx.arc(l, -l * 0.08, l * 0.04, 0, TAU); ctx.fill();
  ctx.restore();
}
/** A hand of bananas hanging from a stalk at (x, y). */
function hand(x, y, l, n = 5) {
  ctx.strokeStyle = '#6b5a2a'; ctx.lineWidth = l * 0.08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - l * 0.1, y - l * 0.35); ctx.lineTo(x, y); ctx.stroke();
  for (let i = 0; i < n; i++) banana(x, y + i * l * 0.06, l, -0.9 + (i / (n - 1)) * 0.9);
}

/** A banana plant: pseudostem and leaves; `sick` 0–1 browns it. */
function plant(x, base, h, sick = 0, sway = 0) {
  const leaf = sick > 0 ? `rgb(${Math.round(lerp(95, 150, sick))},${Math.round(lerp(174, 115, sick))},${Math.round(lerp(78, 50, sick))})` : C.leaf;
  ctx.fillStyle = sick > 0.5 ? C.brown : C.leafLo; ctx.fillRect(x - h * 0.05, base - h * 0.55, h * 0.1, h * 0.55);
  for (const [a, l] of [[-2.3, 0.55], [-0.85, 0.55], [-1.9, 0.45], [-1.25, 0.5], [-1.57, 0.42]]) {
    const aa = a + sway * 0.05 + sick * (a < -1.57 ? -0.5 : 0.5);
    ctx.save(); ctx.translate(x, base - h * 0.55); ctx.rotate(aa);
    ctx.fillStyle = leaf; ctx.beginPath(); ctx.ellipse(h * l * 0.5, 0, h * l * 0.5, h * 0.07, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** A chromosome: a rounded bar with a waist. */
function chromo(x, y, len, col, w = 14, a = 1) {
  A(a, () => {
    ctx.fillStyle = col; k.rrect(x - w / 2, y - len / 2, w, len, w / 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - w / 2, y - len * 0.12, w, 3);
  });
}
const LENS = Array.from({ length: X }, (_, i) => 70 - i * 4);
const COPY = [C.a, C.b, C.c];

// ---------- A ----------
function sceneA(t) {
  const a = span(t, 0, 9.6, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(700, 60, ROUND); text('A fertile Cavendish?', 52, 104, { color: C.yellow });
    font(500, 22); text('YELLOWAY · CHIQUITA + KEYGENE · OCTOBER 2026', 54, 152, { color: C.leaf, spacing: '1px' });
    // a bunch, which gives way to two slices
    A(1 - seg(t, 4.8, 5.4), () => hand(340, 470, 230, 6));
  });
}
/** A banana cut across: seeds as big hard dots, or only faint specks. */
function slice(cx, cy, r, wild, label, sub) {
  ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = wild ? '#8fa55a' : C.yellowLo; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  if (wild) {
    let s = 4; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 11; i++) { const ang = rr() * TAU, d = r * (0.18 + rr() * 0.5); ctx.fillStyle = '#1d140c'; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, r * 0.12, 0, TAU); ctx.fill(); }
  } else {
    for (let i = 0; i < 3; i++) {
      const ang = -Math.PI / 2 + (i * TAU) / 3;
      ctx.fillStyle = 'rgba(90,70,40,0.55)'; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * r * 0.3, cy + Math.sin(ang) * r * 0.3, 4, 0, TAU); ctx.fill();
    }
  }
  font(700, 30, ROUND); text(label, cx, cy + r + 40, { color: C.ink, align: 'center' });
  font(400, 22); text(sub, cx, cy + r + 74, { color: C.soft, align: 'center' });
}
function sceneA2(t) {
  const a = span(t, 5.2, 9.6, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    slice(250, 400, 110, false, 'Cavendish', 'no working seeds');
    slice(614, 400, 110, true, 'wild banana', 'full of hard seeds');
  });
}

// ---------- B ----------
function sceneB(t) {
  const a = span(t, 9.6, 23.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const base = 560;
    if (t < 14.2) {
      // offshoots: the mother plant and a row of clones
      const p = seg(t, 9.8, 13.6);
      plant(140, base, 300, 0, Math.sin(t));
      const n = Math.floor(p * 6);
      for (let i = 0; i < 6; i++) {
        const g = clamp(p * 6 - i, 0, 1);
        if (g <= 0) continue;
        plant(250 + i * 100, base, 300 * eout(g) * 0.85, 0, Math.sin(t + i));
      }
      ctx.fillStyle = '#2a1d10'; ctx.fillRect(40, base, W - 80, 14);
      font(600, 24); text('offshoot after offshoot', W / 2, base + 56, { color: C.soft, align: 'center' });
      // identical DNA barcodes
      for (let i = 0; i <= Math.min(5, n); i++) {
        const x = 140 + i * 110;
        for (let j = 0; j < 6; j++) { ctx.fillStyle = COPY[(j * 7) % 3]; ctx.fillRect(x - 30 + j * 10, 652, 6, 30); }
      }
      font(400, 22); text('the same genes in every plant', W / 2, 716, { color: C.soft, align: 'center' });
    } else {
      // one disease, every plant: Gros Michel then, TR4 now
      const sick = (i) => clamp((t - (t < 18.8 ? 14.8 : 19.4) - i * 0.35) / 1.2, 0, 1);
      for (let i = 0; i < 7; i++) plant(110 + i * 108, base, 270, sick(i), Math.sin(t + i));
      ctx.fillStyle = '#2a1d10'; ctx.fillRect(40, base, W - 80, 14);
      // the fungus spreading in the soil
      const f = t < 18.8 ? seg(t, 14.6, 18.0) : seg(t, 19.2, 22.6);
      ctx.strokeStyle = 'rgba(214,180,110,0.75)'; ctx.lineWidth = 3;
      for (let i = 0; i < 18; i++) {
        const x0 = 80 + i * 40;
        if (x0 > 80 + f * 720) break;
        ctx.beginPath(); ctx.moveTo(x0, base + 4); ctx.quadraticCurveTo(x0 + 12, base + 30, x0 + 30, base + 10); ctx.stroke();
      }
      if (t < 18.8) {
        font(700, 40, ROUND); text('Gros Michel', W / 2, 200, { color: C.yellow, align: 'center' });
        font(400, 22); text('Panama disease, from the 1950s', W / 2, 244, { color: C.soft, align: 'center' });
      } else {
        font(700, 40, ROUND); text('Cavendish', W / 2, 200, { color: C.yellow, align: 'center' });
        font(400, 22); text('Tropical Race 4 (TR4), a strain of Panama disease', W / 2, 244, { color: C.bad, align: 'center' });
        A(seg(t, 21.0, 21.6), () => chip(232, 620, 400, 80, () => {
          font(700, 30, ROUND); text('breeding needs seeds', W / 2, 660, { color: C.ink, align: 'center' });
        }));
      }
      font(400, 22); text('illustrative', W - 60, base + 50, { color: C.faint, align: 'right' });
    }
  });
}

// ---------- C: chromosome sets ----------
/** Where copy c of chromosome i sits in a cell centred at (cx, cy). */
function setOf(cx, cy, copies, spread = 1, show = X) {
  for (let i = 0; i < show; i++) for (let c = 0; c < copies; c++) {
    const x = cx - 330 + i * 60 + c * 16 * spread, y = cy;
    chromo(x, y, LENS[i], COPY[c], 12);
  }
}
/** A seeded coin for chromosome i: which side gets two copies of the trio. */
const coin = (i, seed) => (Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453) % 1;
function sceneC(t) {
  const a = span(t, 23.2, 41.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 1: the two sets and three sets
    A(span(t, 23.2, 28.0, 0.01, 0.4), () => {
      font(700, 30, ROUND); text(`wild banana: 2 sets, ${WILD} chromosomes`, 52, 200, { color: C.ink });
      setOf(400, 310, 2);
      font(700, 30, ROUND); text(`Cavendish: 3 sets, ${CAV} chromosomes`, 52, 450, { color: C.yellow });
      setOf(400, 560, 3, 0.8);
      font(400, 22); text(`${X} kinds, numbered by size`, 52, 670, { color: C.soft });
    });
    // 2: a pair splits evenly
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      const p = eio(seg(t, 28.6, 31.0));
      font(700, 30, ROUND); text('two sets: pairs split evenly', W / 2, 190, { color: C.ink, align: 'center' });
      for (let i = 0; i < X; i++) {
        const x = 132 + i * 60;
        chromo(x - 8, lerp(420, 300, p), LENS[i] * 0.8, COPY[0], 12);
        chromo(x + 8, lerp(420, 560, p), LENS[i] * 0.8, COPY[1], 12);
      }
      A(seg(t, 30.6, 31.2), () => {
        font(600, 24); text(`sex cell: ${X} chromosomes, one of each`, W / 2, 236, { color: C.good, align: 'center' });
        font(600, 24); text(`sex cell: ${X} chromosomes, one of each`, W / 2, 636, { color: C.good, align: 'center' });
      });
      ctx.strokeStyle = C.faint; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(90, 430); ctx.lineTo(W - 90, 430); ctx.stroke(); ctx.setLineDash([]);
    });
    // 3 and 4: trios split two and one, by chance
    A(span(t, 32.6, 41.8, 0.4, 0.4), () => {
      const p = eio(seg(t, 33.2, 35.6)), seed = t < 37.2 ? 1 : 1 + Math.floor((t - 37.2) / 1.1);
      font(700, 30, ROUND); text('three sets: trios split two and one', W / 2, 190, { color: C.yellow, align: 'center' });
      let up = 0;
      for (let i = 0; i < X; i++) {
        const x = 132 + i * 60, twoUp = coin(i, seed) > 0.5 || coin(i, seed) < -0.5;
        if (twoUp) up++;
        // copies 0 and 1 go together; copy 2 goes the other way
        const yTwo = lerp(420, twoUp ? 300 : 560, p), yOne = lerp(420, twoUp ? 560 : 300, p);
        chromo(x - 12, yTwo, LENS[i] * 0.8, COPY[0], 10);
        chromo(x, yTwo, LENS[i] * 0.8, COPY[1], 10);
        chromo(x + 12, yOne, LENS[i] * 0.8, COPY[2], 10);
      }
      ctx.strokeStyle = C.faint; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(90, 430); ctx.lineTo(W - 90, 430); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 35.4, 36.0), () => {
        const top = X + up, bottom = 2 * X - up;
        font(600, 24);
        text(`${top} chromosomes: unbalanced`, W / 2, 236, { color: top === X || top === 2 * X ? C.good : C.bad, align: 'center' });
        text(`${bottom} chromosomes: unbalanced`, W / 2, 636, { color: bottom === X || bottom === 2 * X ? C.good : C.bad, align: 'center' });
      });
      A(span(t, 37.2, 41.8, 0.3, 0.3), () => {
        chip(232, 680, 400, 60, () => { font(600, 24); text('balanced: all 1s or all 2s', W / 2, 710, { color: C.good, align: 'center' }); });
      });
    });
  });
}

// ---------- D: 1 in 1,024, and the seedless fruit ----------
function sceneD(t) {
  const a = span(t, 41.6, 51.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 41.6, 46.4, 0.01, 0.4), () => {
      const n = 32, s = 15, x0 = W / 2 - (n * s) / 2, y0 = 190;
      const p = seg(t, 42.0, 44.4);
      for (let i = 0; i < n * n; i++) {
        if (i / (n * n) > p) break;
        const x = x0 + (i % n) * s, y = y0 + Math.floor(i / n) * s;
        ctx.fillStyle = i === 611 ? C.good : 'rgba(255,107,107,0.55)';
        ctx.fillRect(x, y, s - 3, s - 3);
      }
      A(seg(t, 44.0, 44.6), () => {
        font(700, 44, ROUND); text(`1 in ${fmt(ONE_IN)}`, W / 2, 712, { color: C.good, align: 'center' });
        font(400, 22); text('balanced, in the simple picture', W / 2, 752, { color: C.soft, align: 'center' });
      });
    });
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      plant(250, 600, 360, 0, Math.sin(t));
      // a bunch hangs from the plant without any pollination
      hand(262, 420, 150 * eout(seg(t, 46.8, 48.4)), 5);
      chip(470, 300, 340, 160, () => {
        font(700, 30, ROUND); text('fruit without', 640, 344, { color: C.yellow, align: 'center' });
        text('pollination', 640, 384, { color: C.yellow, align: 'center' });
        font(400, 22); text('= the seedless banana', 640, 426, { color: C.soft, align: 'center' });
      });
    });
  });
}

// ---------- E: breeding ----------
function flower(x, y, s, col = '#c2588a') {
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 12 * s, 22 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(x, y + 20 * s, 5 * s, 0, TAU); ctx.fill();
}
function sceneE(t) {
  const a = span(t, 50.8, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 50.8, 55.6, 0.01, 0.4), () => {
      // rows of hand-pollinated flowers, and one or two seeds
      const p = seg(t, 51.2, 53.8);
      for (let i = 0; i < 120; i++) {
        if (i / 120 > p) break;
        flower(96 + (i % 15) * 48, 210 + Math.floor(i / 15) * 52, 0.7, 'rgba(194,88,138,0.7)');
      }
      A(seg(t, 53.8, 54.4), () => {
        chip(232, 640, 400, 100, () => {
          ctx.fillStyle = '#1d140c'; ctx.beginPath(); ctx.arc(290, 690, 13, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(326, 690, 13, 0, TAU); ctx.fill();
          font(700, 28, ROUND); text('one or two seeds', 360, 690, { color: C.ink });
        });
      });
      font(400, 22); text('thousands of hand crosses (not drawn to number)', W / 2, 176, { color: C.soft, align: 'center' });
    });
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      plant(200, 560, 300, 0, Math.sin(t));
      plant(660, 560, 300, 0, Math.sin(t + 1));
      font(700, 26, ROUND); text('fertile Cavendish line', 200, 610, { color: C.yellow, align: 'center' });
      text('resistant banana', 660, 610, { color: C.good, align: 'center' });
      const p = eio(seg(t, 56.2, 58.2));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(250, 330); ctx.quadraticCurveTo(430, 200, lerp(250, 610, p), lerp(330, 330, p)); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 58.0, 58.6), () => { plant(430, 700, 150, 0, Math.sin(t)); font(600, 22); text('offspring growing', 430, 730, { color: C.soft, align: 'center' }); });
      font(400, 22); text('as Yelloway describes it', W / 2, 176, { color: C.soft, align: 'center' });
    });
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      chip(132, 240, 600, 170, () => {
        font(700, 32, ROUND); text('Not yet published:', W / 2, 286, { color: C.yellow, align: 'center' });
        font(400, 26); text('how the line was made', W / 2, 330, { color: C.ink, align: 'center' });
        text('and how many chromosomes it has', W / 2, 368, { color: C.ink, align: 'center' });
      });
      chip(232, 460, 400, 130, () => {
        font(700, 56, ROUND); text('2030', W / 2, 510, { color: C.good, align: 'center' });
        font(400, 22); text('Yelloway’s aim for a first variety', W / 2, 558, { color: C.soft, align: 'center' });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [ROUND, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneA2(t); sceneB(t); sceneC(t); sceneD(t); sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.yellow, '~': C.c, '^': C.bad } });
  },
});
