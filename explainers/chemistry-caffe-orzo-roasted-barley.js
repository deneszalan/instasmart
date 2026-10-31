// Explainer for chemistry-caffe-orzo-roasted-barley: caffè d'orzo, the Italian "coffee" made from roasted barley.
// Roasting does to the grain what it does to coffee beans: once its water is gone, sugars react with amino acids
// (the Maillard reaction) and caramelise, making brown melanoidins and coffee-like aroma molecules. It cannot make
// caffeine, which barley never had. The drink spread in Italy when Fascist autarky rationed imports after the League
// of Nations sanctions of 1935. Look: a deep bar-green terrazzo counter, barley in straw gold browning through a roast
// ramp to near-black, aroma in copper, caffeine in mint. Playfair Display for headings and numbers, Outfit for
// captions and labels.
//
// Facts:
// - Merriam-Webster, "orzo" (https://www.merriam-webster.com/dictionary/orzo): rice-shaped pasta; Italian, literally
//   barley, from Latin hordeum. Treccani, Enciclopedia Italiana (1935), "Orzo" (https://www.treccani.it/enciclopedia/orzo_(Enciclopedia-Italiana)/):
//   "dal lat. hordeum"; Vocabolario Treccani, "orzo" (https://www.treccani.it/vocabolario/orzo/): naked barley "viene
//   tostato come succedaneo del caffè". GBIF species match: Hordeum vulgare L., accepted, family Poaceae.
// - MIT OpenCourseWare, "Speak Italian with Your Mouth Full", lesson 9 (2012): "caffè d'orzo, espresso made from
//   barley ... It can be ordered in all the variations, just like a normal caffè". Italy Segreta (Clementine Lussiana,
//   https://italysegreta.com/caffe-dorzo/): served alongside espressos and cappuccinos al banco in Italy's bars.
// - Feedipedia (INRAE, CIRAD, AFZ, FAO), barley grain (https://feedipedia.org/node/11705), averages: dry matter
//   87.1% as fed (so about 13% water), starch 59.7%, crude protein 11.8%, total sugars 2.8% of dry matter.
// - EFSA, "Acrylamide" topic page (https://www.efsa.europa.eu/en/topics/topic/acrylamide): acrylamide forms in starchy
//   foods during frying, baking and roasting "at +120°C and low moisture", from sugars and amino acids (mainly
//   asparagine), mainly through the Maillard reaction, "the same reaction that 'browns' food"; bread and coffee among
//   the foods; cereal-based coffee substitutes average 0.5 mg/kg, chicory-based ones six times more (3 mg/kg).
// - Obando & Figueroa, Molecules 29:4723 (2024, https://pmc.ncbi.nlm.nih.gov/articles/PMC11477549/): coffee roasting
//   "involves multiple chemical reactions such as the Maillard reaction, caramelization, and Strecker degradation";
//   2-furfurylthiol is among coffee brew's key odorants. Wang et al., Foods 11:2921 (2022, PMC9498828): roasting
//   barley browns it through the Maillard reaction and caramelisation; pyrazines rise most.
// - Papetti et al., J Agric Food Chem 55:278 (2007, PMID 17227054): barley coffee holds a brown melanoidin of over
//   1,000 kDa that was "not detected in unroasted barley, indicating that it forms during the roasting process".
//   Bianchi et al., J Sep Sci 30:527 (2007, PMID 17444221): 64 volatile compounds identified in roasted barley for
//   barley coffee, "the most common coffee substitute" (hence "dozens").
// - Majcher et al., J Agric Food Chem 61:2648 (2013, https://pubmed.ncbi.nlm.nih.gov/23414530/): a typical Polish
//   cereal coffee (roasted barley and rye 60–70%, chicory 15–20%, sugar beet 6–10%), "caffeine free"; its aroma "is
//   mainly influenced by roasted barley"; 30 aroma-active volatiles; the most potent odorant was 2-furfurylthiol.
//   Sun et al., Food Chem 322:126754 (2020, PMID 32283367): 2-furfurylthiol is "the key aroma" of coffee lost in
//   storage. Tahmouzi et al., Compr Rev Food Sci Food Saf (2024, PMID 39385342): coffee substitutes such as barley
//   have no caffeine.
// - US Food and Drug Administration, "Spilling the Beans" (content current as of 28 August 2024): decaf typically
//   has 2 to 15 mg of caffeine in an 8-fluid-ounce cup.
// - AGI (Marco Patricelli, 18 November 2025, https://www.agi.it/cultura/news/2025-11-18/sanzioni-italia-guerra-34235530/):
//   the League of Nations decided on sanctions on 11 October 1935, a week after Italy attacked Ethiopia, in force
//   from 18 November; "autarchia" answered them with national production and substitutes ("surrogati").
//   Treccani, Dizionario di Storia, "autarchia": the Fascist autarky policy was spurred by the League's sanctions
//   after the invasion of Abyssinia (1935).
// - Tito Menzani (University of Bologna), "Un caffè sotto le due torri", E-Review 12 (2025,
//   https://e-review.it/sites/default/images/articles/media/325/menzani_caffe.pdf): in the late 1930s the regime's
//   gradual rationing of imports pushed up the price of coffee; substitutes such as caffè d'orzo and chicory coffee
//   took hold in Italian food culture; chicory coffee was quickly dropped after the Liberation (1945).
// - Commission Regulation (EU) 2017/2158, Annex IV: acrylamide benchmark levels (performance indicators for producers)
//   of 400 µg/kg for roast coffee and 500 µg/kg for coffee substitutes made exclusively from cereals.
// - Associazione Italiana Celiachia, press release of December 2024: barley ("orzo") is among the grains coeliacs must
//   avoid; coffee is fine "purché non sia d'orzo".
// Grains, molecules and drum are not to scale; dots and puffs only illustrate.
//
// Scene plan (65.0 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0–5.0   Hook: a cup labelled "un orzo"; a barley ear, and a coffee bean struck out.
//  B  4.8–9.6   hordeum → orzo = barley, beside a growing barley ear: Hordeum vulgare.
//  C  9.4–14.2  A raw grain and a bar of its dry weight: starch 60%, protein 12%, sugars 3%.
//  D 14.0–18.8  The roaster drum: the grain's water bar drains from 13% to dry, then the grains start to tint.
//  E 18.6–23.4  Maillard: sugars + amino acids → brown pigment and aroma. A roast strip at the top tracks colour.
//  F 23.2–28.0  Caramelisation: sugars alone darken and break up.
//  G 27.8–32.6  Melanoidins (a brown chain) colour a cup; aroma rings rise.
//  H 32.4–37.2  2-furfurylthiol drawn, shared by roasted barley and roasted coffee.
//  I 37.0–41.8  A coffee bean holds caffeine; a barley grain holds none.
//  J 41.6–46.4  Two cups: decaf 2–15 mg, orzo 0 mg.
//  K 46.2–51.0  1935: League of Nations sanctions, in force 18 November.
//  L 50.8–55.6  Autarchia: imports rationed, coffee dearer; barley grown at home.
//  M 55.4–60.2  Two tins, orzo and cicoria, 1935–1945.
//  N 60.0–65.0  Caveats: acrylamide benchmarks (400 and 500 µg/kg) and gluten.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#16413a', bg1: '#0a201c', ink: '#f6efe2', soft: 'rgba(246,239,226,0.76)', faint: 'rgba(246,239,226,0.32)',
  line: 'rgba(246,239,226,0.14)', gold: '#f2c14e', straw: '#e9d6a0', copper: '#f39a6b', mint: '#8fe0c8',
  rust: '#c8643c', brass: '#c9a25a', cream: '#fbf3e0', card: 'rgba(5,18,15,0.55)', steam: 'rgba(255,255,255,0.5)',
  brew: '#2a160b', crema: '#b07a43', china: '#f4efe6', chinaLo: '#cfc6b6',
};
const SERIF = 'Playfair Display', SANS = 'Outfit';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', align: 'center', ...o });
const A = (a, fn) => k.alpha(a, fn);
const rnd = (i, j = 0) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------- the numbers ----------
const COMP = [['starch', 59.7, C.cream], ['protein', 11.8, C.mint], ['sugars', 2.8, C.gold]]; // % of dry matter (Feedipedia)
const DRY = 87.1, WATER = 100 - DRY; // % as fed: about 13% water
const DECAF = [2, 15]; // mg in an 8-fl-oz cup (FDA)
const BENCH = [['roast coffee', 400], ['cereal coffee substitutes', 500]]; // µg/kg (EU 2017/2158, Annex IV)
const r0 = (v) => Math.round(v).toString();

const CUES = [
  [0.4, 4.8, 'In an Italian bar, *un orzo* looks like an espresso, but it is roasted, ground and brewed barley.'],
  [5.0, 9.4, '*Orzo* is Italian for barley, from the Latin *hordeum*: the grain of the plant *Hordeum vulgare*.'],
  [9.6, 14.0, `Raw barley is pale: about ${r0(COMP[0][1])}% starch and ${r0(COMP[1][1])}% protein, but only about ${r0(COMP[2][1])}% sugars, by dry weight.`],
  [14.2, 18.6, `In the roaster, its water, about ${r0(WATER)}%, steams off first; then the dry grain heats up and browns.`],
  [18.8, 23.2, '*Sugars* react with ^amino acids^: the *Maillard reaction*, which also browns bread and coffee.'],
  [23.4, 27.8, 'Heated on their own, *sugars* break down and darken too: that is *caramelisation*.'],
  [28.0, 32.4, 'Out come brown *melanoidins*, which colour the brew, and dozens of ~aroma~ molecules.'],
  [32.6, 37.0, 'A barley-based cereal coffee’s strongest odorant, ~2-furfurylthiol~, is also a key coffee aroma.'],
  [37.2, 41.6, 'No roast can make ^caffeine^: coffee plants make it, but barley has none to start with.'],
  [41.8, 46.2, `Decaf still keeps ${DECAF[0]} to ${DECAF[1]} mg a cup, says the US Food and Drug Administration. An orzo: ^0 mg^.`],
  [46.4, 50.8, 'In November *1935* the League of Nations put sanctions on Italy for invading Ethiopia.'],
  [51.0, 55.4, 'Fascist Italy pushed *autarchia*, self-sufficiency, and rationed imports: coffee grew dear.'],
  [55.6, 60.0, '*Caffè d’orzo* and chicory coffee spread as substitutes, and lasted through the Second World War.'],
  [60.2, 64.6, 'Two caveats: roasting barley makes ~acrylamide~, as roasting coffee does, and barley has gluten.'],
];

// ---------- colours of a roast ----------
const RAMP = [[233, 214, 160], [222, 178, 98], [176, 112, 52], [112, 62, 30], [58, 32, 17], [30, 18, 11]];
/** The grain's colour at roast degree u, 0 (raw) to 1 (near black). */
function roastRGB(u, lift = 0) {
  const x = clamp(u) * (RAMP.length - 1), i = Math.min(RAMP.length - 2, Math.floor(x)), f = x - i;
  const c = RAMP[i].map((v, j) => Math.round(lerp(v, RAMP[i + 1][j], f) + lift));
  return `rgb(${c.map((v) => clamp(v, 0, 255)).join(',')})`;
}
/** How roasted the grain is at time t during the chemistry segments (drying, then browning). */
const roastAt = (t) => 0.06 * seg(t, 17.2, 18.8) + 0.84 * eio(seg(t, 18.8, 32.4));

// ---------- background: a bar's green terrazzo ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W / 2, 400, 60, W / 2, 520, 820);
  lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const chips = ['246,239,226', '200,100,60', '143,224,200', '242,193,78', '10,20,18'];
  for (let i = 0; i < 1500; i++) {
    const x = r() * W, y = r() * H, sz = 1.5 + r() * r() * 9, c = chips[Math.floor(r() * chips.length)];
    g.fillStyle = `rgba(${c},${0.03 + r() * 0.07})`;
    g.beginPath();
    const n = 4 + Math.floor(r() * 3), rot = r() * 6;
    for (let j = 0; j < n; j++) { const an = rot + (j / n) * Math.PI * 2, rr = sz * (0.6 + r() * 0.5); j ? g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : g.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    g.closePath(); g.fill();
  }
  const v = g.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,0.22)'); v.addColorStop(0.3, 'rgba(0,0,0,0)'); v.addColorStop(0.68, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- small drawings ----------
/** A barley grain: a spindle pointed at both ends with a crease, long axis along `rot`, half-length r. */
function grain(x, y, r, { rot = 0, roast = 0, a = 1, shine = true } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = r * 0.42;
    ctx.beginPath(); ctx.moveTo(0, -r);
    ctx.bezierCurveTo(w * 1.25, -r * 0.55, w * 1.25, r * 0.55, 0, r);
    ctx.bezierCurveTo(-w * 1.25, r * 0.55, -w * 1.25, -r * 0.55, 0, -r);
    ctx.closePath();
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, roastRGB(roast, -18)); g.addColorStop(0.45, roastRGB(roast, shine ? 22 : 0)); g.addColorStop(1, roastRGB(roast, -30));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = Math.max(1.2, r * 0.03); ctx.stroke();
    ctx.strokeStyle = `rgba(60,35,15,${0.35 + roast * 0.3})`; ctx.lineWidth = Math.max(1.2, r * 0.045); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * 0.1, -r * 0.8); ctx.quadraticCurveTo(w * 0.32, 0, w * 0.1, r * 0.8); ctx.stroke();
    ctx.restore();
  });
}
/** A roasted coffee bean, long axis along `rot`, half-length r. */
function bean(x, y, r, { rot = 0, a = 1 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const rx = r * 0.72, ry = r;
    const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, r * 0.08, 0, 0, r * 1.1);
    g.addColorStop(0, '#9a5a32'); g.addColorStop(0.55, '#6a3a1e'); g.addColorStop(1, '#3a1d0d');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#24110a'; ctx.lineWidth = Math.max(2, r * 0.08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rx * 0.05, -ry * 0.82); ctx.bezierCurveTo(rx * 0.42, -ry * 0.3, -rx * 0.42, ry * 0.3, -rx * 0.05, ry * 0.82); ctx.stroke();
    ctx.restore();
  });
}
/** An espresso cup on its saucer; the cup's rim is centred at (x, y), s = scale (1 = rim 190 px wide). */
function cup(x, y, s = 1, { brew = C.brew, crema = C.crema, level = 1 } = {}) {
  const rw = 95 * s, bw = 64 * s, h = 112 * s;
  // saucer
  ctx.fillStyle = C.chinaLo; ctx.beginPath(); ctx.ellipse(x, y + h + 6 * s, 150 * s, 30 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.china; ctx.beginPath(); ctx.ellipse(x, y + h, 140 * s, 24 * s, 0, 0, Math.PI * 2); ctx.fill();
  // handle
  ctx.strokeStyle = C.china; ctx.lineWidth = 16 * s; ctx.beginPath(); ctx.ellipse(x + rw * 0.98, y + h * 0.36, 30 * s, 34 * s, 0, -Math.PI * 0.5, Math.PI * 0.55); ctx.stroke();
  // body
  const g = ctx.createLinearGradient(x - rw, 0, x + rw, 0);
  g.addColorStop(0, C.chinaLo); g.addColorStop(0.35, '#ffffff'); g.addColorStop(1, '#bdb3a2');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - rw, y); ctx.bezierCurveTo(x - rw, y + h * 0.7, x - bw, y + h, x, y + h); ctx.bezierCurveTo(x + bw, y + h, x + rw, y + h * 0.7, x + rw, y); ctx.closePath(); ctx.fill();
  // rim and brew
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x, y, rw, 20 * s, 0, 0, Math.PI * 2); ctx.fill();
  if (level > 0) {
    ctx.fillStyle = crema; ctx.beginPath(); ctx.ellipse(x, y + 3 * s, rw * 0.9, 16 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = brew; ctx.beginPath(); ctx.ellipse(x, y + 4 * s, rw * 0.78, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = C.chinaLo; ctx.beginPath(); ctx.ellipse(x, y + 3 * s, rw * 0.9, 16 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
}
/** Steam: wavy wisps rising from y0, `n` of them across [x0, x1]. */
function steam(t, x0, x1, y0, rise, n = 3, a = 1, w = 4) {
  A(a, () => {
    ctx.strokeStyle = C.steam; ctx.lineWidth = w; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + 0.5) / n), ph = (t * 0.42 + rnd(i, 31)) % 1;
      A(Math.sin(ph * Math.PI) * 0.85, () => {
        ctx.beginPath();
        for (let j = 0; j <= 12; j++) { const u = j / 12, yy = y0 - ph * rise * 0.5 - u * rise * 0.5; const xx = x + Math.sin(u * 5 + t * 2 + i) * 9; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
      });
    }
  });
}
function arrow(x0, y0, x1, y1, color, w = 5, head = 15) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const an = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(an) * head * 0.6, y1 - Math.sin(an) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(an - 0.45) * head, y1 - Math.sin(an - 0.45) * head); ctx.lineTo(x1 - Math.cos(an + 0.45) * head, y1 - Math.sin(an + 0.45) * head); ctx.closePath(); ctx.fill();
}
/** A regular polygon outline or fill. */
function poly(x, y, r, n, { rot = -Math.PI / 2, fill, stroke, lw = 3 } = {}) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const an = rot + (i * Math.PI * 2) / n; i ? ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r) : ctx.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
/** A sugar: a gold hexagon (a ring of glucose, roughly). */
const sugar = (x, y, r = 14, color = C.gold) => poly(x, y, r, 6, { rot: 0, fill: color, stroke: 'rgba(0,0,0,0.35)', lw: 2 });
/** An amino acid: a mint zigzag with a dot (its nitrogen). */
function amino(x, y, s = 1, color = C.mint) {
  ctx.strokeStyle = color; ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 16 * s, y + 6 * s); ctx.lineTo(x - 6 * s, y - 6 * s); ctx.lineTo(x + 4 * s, y + 6 * s); ctx.lineTo(x + 14 * s, y - 6 * s); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x - 16 * s, y + 6 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
}
/** Caffeine, sketched: a hexagon fused to a pentagon, in mint. */
function caffeine(x, y, s = 1, a = 1) {
  A(a, () => {
    const r = 13 * s;
    poly(x, y, r, 6, { rot: Math.PI / 6, fill: 'rgba(143,224,200,0.22)', stroke: C.mint, lw: 2.6 * s });
    const cx = x + r * Math.cos(Math.PI / 6) + r * 0.69 * Math.cos(0), cy = y;
    poly(cx + 1 * s, cy, r * 0.86, 5, { rot: Math.PI, fill: 'rgba(143,224,200,0.22)', stroke: C.mint, lw: 2.6 * s });
  });
}
/** A puff of aroma: a little ring molecule floating up. */
function aromaRing(x, y, r, i, a = 1) {
  A(a, () => {
    const n = [5, 6, 5, 6, 6][i % 5];
    poly(x, y, r, n, { rot: rnd(i, 4) * 6, stroke: C.copper, lw: 2.6 });
    if (i % 3 === 0) { ctx.fillStyle = C.copper; ctx.beginPath(); ctx.arc(x + r * 1.5, y - r * 0.4, 3, 0, Math.PI * 2); ctx.fill(); }
  });
}
/** A barley ear: a stalk with two rows of grains and long awns, grown to fraction g. Base at (x, y), height h. */
function ear(x, y, h, g, { roast = 0, sway = 0, awn = 120 } = {}) {
  const top = y - h;
  ctx.strokeStyle = '#b79a52'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  const sx = (u) => x + Math.sin(u * 1.6 + sway) * 10 * u;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let j = 1; j <= 20; j++) { const u = (j / 20) * g; ctx.lineTo(sx(u), y - u * h); }
  ctx.stroke();
  // a leaf
  A(seg(g, 0.2, 0.5), () => {
    ctx.fillStyle = '#7f9a4e';
    ctx.beginPath(); ctx.moveTo(sx(0.18), y - 0.18 * h); ctx.quadraticCurveTo(x - 90, y - 0.42 * h, x - 120, y - 0.3 * h); ctx.quadraticCurveTo(x - 60, y - 0.3 * h, sx(0.22), y - 0.2 * h); ctx.fill();
  });
  const n = 9, from = 0.5;
  for (let i = 0; i < n * 2; i++) {
    const row = i % 2, j = Math.floor(i / 2), u = from + (j / n) * 0.48;
    const gi = seg(g, u - 0.02, u + 0.08);
    if (gi <= 0) continue;
    const gx = sx(u), gy = y - u * h, side = row ? 1 : -1;
    const ax = gx + side * 14, ay = gy;
    // the awn: a long bristle pointing up and out
    ctx.strokeStyle = 'rgba(233,214,160,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax + side * 4, ay - 18); ctx.lineTo(ax + side * (22 + j * 1.5) * gi * (awn / 120), ay - 18 - awn * gi); ctx.stroke();
    grain(ax, ay, 20 * gi, { rot: side * 0.42, roast });
  }
  return [sx(0.99), top];
}
function card(x, y, w, h, a = 1) { A(a, () => { ctx.fillStyle = C.card; k.rrect(x, y, w, h, 22); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; k.rrect(x, y, w, h, 22); ctx.stroke(); }); }

// ---------- A: hook ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(seg(t, 0.1, 0.7), () => { font(700, 74, SERIF); ctx.font = `italic 700 74px "${SERIF}"`; text('un orzo', W / 2, 170, { color: C.gold }); });
    const s = back(seg(t, 0.2, 1.0));
    if (s > 0) {
      ctx.save(); ctx.translate(W / 2, 420); ctx.scale(s, s); ctx.translate(-W / 2, -420);
      cup(W / 2, 360, 1.15);
      ctx.restore();
      steam(t, W / 2 - 60, W / 2 + 60, 320, 120, 3, seg(t, 0.9, 1.4), 5);
    }
    // what's in it, and what isn't
    const g1 = eout(seg(t, 1.6, 2.4)), g2 = eout(seg(t, 2.4, 3.2));
    A(g1, () => {
      for (let i = 0; i < 15; i++) {
        const row = i < 6 ? 0 : i < 10 ? 1 : i < 13 ? 2 : 3, inRow = [0, 6, 10, 13][row], n = [6, 4, 3, 2][row];
        const x = 150 + ((i - inRow) - (n - 1) / 2) * 34 + (rnd(i, 3) - 0.5) * 8, y = 600 - row * 30 - (1 - g1) * 40;
        grain(x, y, 26, { rot: 1.2 + rnd(i, 4) * 0.9, roast: 0.82 });
      }
      font(600, 26); text('roasted barley', 150, 664, { color: C.gold });
    });
    A(g2, () => {
      bean(712, 540, 64 * g2, { rot: 0.35 });
      ctx.strokeStyle = C.copper; ctx.lineWidth = 9; ctx.lineCap = 'round';
      const u = seg(t, 3.0, 3.5);
      ctx.beginPath(); ctx.moveTo(656, 474); ctx.lineTo(lerp(656, 768, u), lerp(474, 606, u)); ctx.stroke();
      font(600, 26); text('no coffee', 712, 664, { color: C.soft });
    });
  });
}

// ---------- B: the word and the plant ----------
function words(t) {
  const a = span(t, 4.8, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const g = eout(seg(t, 4.9, 6.6));
    ear(230, 690, 500, g, { sway: Math.sin(t * 0.8) * 0.2 });
    A(seg(t, 7.6, 8.1), () => { ctx.font = `italic 600 34px "${SERIF}"`; text('Hordeum vulgare', 240, 730, { color: C.straw }); });
    const rows = [
      [5.3, 'hordeum', 'Latin', 270, `italic 600 62px "${SERIF}"`, C.soft],
      [6.1, 'orzo', 'Italian', 420, `italic 800 112px "${SERIF}"`, C.gold],
      [6.9, 'barley', 'English', 570, `600 62px "${SERIF}"`, C.ink],
    ];
    const cx = 590;
    rows.forEach(([at, w, lang, y, f, col], i) => {
      const u = seg(t, at, at + 0.5);
      if (u <= 0) return;
      A(u, () => {
        ctx.font = f; text(w, cx, y + (1 - eout(u)) * 20, { color: col });
        font(500, 22); text(lang.toUpperCase(), cx, y - (i === 1 ? 74 : 50), { color: C.faint, spacing: '4px' });
      });
      if (i < 2) A(seg(t, at + 0.4, at + 0.8), () => arrow(cx, y + (i === 1 ? 66 : 38), cx, y + (i === 1 ? 92 : 64) + 14, C.faint, 4, 13));
    });
  });
}

// ---------- C: what a raw grain is made of ----------
function rawGrain(t) {
  const a = span(t, 9.4, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('raw barley grain', 250, 196, { color: C.soft });
    grain(250, 470, 230 * back(seg(t, 9.5, 10.3)), { rot: 0.18 });
    // a bar of the dry weight, in parts
    const x0 = 500, bw = 64, y0 = 230, bh = 470;
    font(600, 22); text('per 100 g of dry grain', x0 + 150, 196, { color: C.faint });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, bw, bh);
    let y = y0 + bh;
    const parts = [...COMP, ['fibre, fat and the rest', 100 - COMP.reduce((s, p) => s + p[1], 0), 'rgba(246,239,226,0.14)']];
    const labelY = [];
    parts.forEach(([name, pct, col], i) => {
      const u = eout(seg(t, 10.2 + i * 0.55, 10.8 + i * 0.55));
      const hh = (bh * pct) / 100;
      if (u > 0) { ctx.fillStyle = col; ctx.fillRect(x0 + 1, y - hh * u, bw - 2, hh * u); }
      labelY.push([y - hh / 2, name, pct, col, u]);
      y -= hh;
    });
    // labels, spread so the thin slices don't collide
    const ys = labelY.map((l) => l[0]);
    for (let i = 1; i < ys.length; i++) if (ys[i - 1] - ys[i] < 58) ys[i] = ys[i - 1] - 58;
    labelY.forEach(([cy, name, pct, col, u], i) => {
      A(seg(u, 0.5, 1), () => {
        const ly = ys[i], isRest = i === 3;
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + bw + 6, cy); ctx.lineTo(x0 + bw + 22, ly); ctx.stroke();
        if (isRest) { font(500, 22); text(name, x0 + bw + 30, ly, { color: C.soft, align: 'left' }); return; }
        font(800, 38); text(`${r0(pct)}%`, x0 + bw + 30, ly, { color: col === C.cream ? C.ink : col, align: 'left' });
        font(500, 26); text(name, x0 + bw + 112, ly + 2, { color: C.soft, align: 'left' });
      });
    });
    // the grain's insides: starch, protein, sugar, as symbols
    A(seg(t, 12.2, 12.7), () => {
      font(500, 22); text('averages, Feedipedia (INRAE, CIRAD, AFZ, FAO)', W / 2, 744, { color: C.faint });
    });
  });
}

// ---------- the roast strip: how brown the grain is, D–G ----------
function strip(t) {
  const a = span(t, 15.0, 32.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x0 = 140, x1 = 724, y = 150, h = 26;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, roastRGB(i / 10));
    ctx.fillStyle = g; k.rrect(x0, y, x1 - x0, h, 13); ctx.fill();
    font(500, 22); text('raw', x0 - 14, y + h / 2, { color: C.soft, align: 'right' }); text('dark', x1 + 14, y + h / 2, { color: C.soft, align: 'left' });
    const u = roastAt(t), mx = lerp(x0, x1, u);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(mx, y - 4); ctx.lineTo(mx - 10, y - 20); ctx.lineTo(mx + 10, y - 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, y - 2); ctx.lineTo(mx, y + h + 2); ctx.stroke();
  });
}

// ---------- D: the roaster ----------
function roaster(t) {
  const a = span(t, 14.0, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = 320, cy = 470, R = 200;
    // the drum
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    const glow = seg(t, 14.4, 16.0);
    ctx.strokeStyle = `rgba(243,154,107,${0.25 + glow * 0.55})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R - 12, 0, Math.PI * 2); ctx.stroke();
    const spin = t * 1.1;
    for (let i = 0; i < 4; i++) { const an = spin + (i * Math.PI) / 2; ctx.strokeStyle = 'rgba(201,162,90,0.45)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * 40, cy + Math.sin(an) * 40); ctx.lineTo(cx + Math.cos(an) * (R - 16), cy + Math.sin(an) * (R - 16)); ctx.stroke(); }
    // the grains tumble in the lower part
    const u = roastAt(t);
    for (let i = 0; i < 26; i++) {
      const an = Math.PI * (0.18 + 0.64 * rnd(i, 7)) + Math.sin(t * 1.6 + i) * 0.12, rr = (R - 48) * (0.45 + 0.5 * rnd(i, 8));
      grain(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 24, { rot: rnd(i, 9) * 6 + t * (rnd(i, 10) - 0.5) * 2, roast: u });
    }
    // steam out of the vent while the water leaves
    const wet = 1 - seg(t, 14.6, 17.4);
    ctx.fillStyle = C.brass; ctx.fillRect(cx - 24, cy - R - 34, 48, 30);
    steam(t, cx - 50, cx + 50, cy - R - 40, 110, 3, wet * 0.95, 5);
    // the water in the grain
    const bx = 600, by0 = 300, bh = 360, bw = 56;
    font(600, 24); text('water in', bx + bw / 2, by0 - 62, { color: C.soft }); text('the grain', bx + bw / 2, by0 - 34, { color: C.soft });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(bx, by0, bw, bh);
    const top = (WATER / 15) * bh * wet;
    ctx.fillStyle = 'rgba(134,205,240,0.75)'; ctx.fillRect(bx + 1, by0 + bh - top, bw - 2, top);
    const v = WATER * wet;
    font(800, 38); text(wet > 0.02 ? `${r0(v)}%` : 'dry', bx + bw + 20, by0 + bh - Math.max(top, 20), { color: wet > 0.02 ? '#9fd8f2' : C.gold, align: 'left' });
  });
}

// ---------- E: the Maillard reaction ----------
function maillard(t) {
  const a = span(t, 18.6, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.font = `italic 700 50px "${SERIF}"`; text('Maillard reaction', W / 2, 262, { color: C.gold });
    // the reaction, written out
    A(seg(t, 18.9, 19.4), () => {
      font(600, 27);
      const parts = [['sugar', C.gold], [' + ', C.soft], ['amino acid', C.mint], ['  →  ', C.soft], ['brown pigments', '#d9a472'], [' + ', C.soft], ['aroma', C.copper]];
      const widths = parts.map(([w]) => ctx.measureText(w).width), total = widths.reduce((x, y) => x + y, 0);
      let x = W / 2 - total / 2;
      parts.forEach(([w, col], i) => { text(w, x, 326, { color: col, align: 'left' }); x += widths[i]; });
    });
    // three pairs meet one after another; the brown products pile up on the right
    const lanes = [430, 530, 630];
    lanes.forEach((y, i) => {
      const at = 19.3 + i * 0.8, u = eio(seg(t, at, at + 1.0)), done = seg(t, at + 1.0, at + 1.4);
      const sx = lerp(130, 330, u), ax = lerp(540, 372, u);
      if (done < 1) A(1 - done, () => { sugar(sx, y, 30); amino(ax, y, 1.5); });
      if (done > 0) {
        const bx = lerp(352, 650, eout(seg(t, at + 1.0, at + 1.8)));
        A(done, () => {
          ctx.fillStyle = '#7a4524'; ctx.beginPath();
          for (let j = 0; j < 9; j++) { const an = (j / 9) * Math.PI * 2, rr = 30 + rnd(i, j) * 10; j ? ctx.lineTo(bx + Math.cos(an) * rr, y + Math.sin(an) * rr) : ctx.moveTo(bx + Math.cos(an) * rr, y + Math.sin(an) * rr); }
          ctx.closePath(); ctx.fill();
          for (let j = 0; j < 3; j++) { const ph = seg(t, at + 1.1 + j * 0.35, at + 2.6 + j * 0.35); if (ph > 0 && ph < 1) aromaRing(bx + 30 + j * 26, y - 26 - ph * 80, 11, i * 3 + j, Math.min(1, ph * 5) * (1 - ph)); }
        });
      }
    });
  });
}

// ---------- F: caramelisation ----------
function caramel(t) {
  const a = span(t, 23.2, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.font = `italic 700 50px "${SERIF}"`; text('caramelisation', W / 2, 262, { color: C.gold });
    font(600, 26); text('sugars on their own, hot and dry', W / 2, 318, { color: C.soft });
    const heat = seg(t, 23.6, 27.0);
    for (let i = 0; i < 7; i++) {
      const x = 162 + i * 90, y = 500 + Math.sin(i * 1.3) * 40;
      const me = seg(heat, 0.1 + i * 0.07, 0.55 + i * 0.07);
      const sh = Math.sin(t * 30 + i) * 3 * me * (1 - me);
      const col = roastRGB(0.25 + me * 0.55);
      if (me < 0.8) A(1 - seg(me, 0.6, 0.8), () => sugar(x + sh, y, 28, me < 0.05 ? C.gold : col));
      if (me > 0.55) {
        const f = seg(me, 0.55, 1);
        for (let j = 0; j < 3; j++) {
          const an = j * 2.1 + i, d = 22 * f;
          A(f, () => poly(x + Math.cos(an) * d, y + Math.sin(an) * d - f * 8, 11, 4 + (j % 2), { rot: an, fill: roastRGB(0.55 + f * 0.25) }));
        }
      }
    }
    // the heat underneath
    ctx.fillStyle = `rgba(243,154,107,${0.18 + 0.12 * Math.sin(t * 4)})`;
    k.rrect(120, 640, 624, 16, 8); ctx.fill();
  });
}

// ---------- G: melanoidins and aroma ----------
function products(t) {
  const a = span(t, 27.8, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a brown chain grows: melanoidins
    const n = 13, grow = seg(t, 28.0, 30.0);
    ctx.font = `italic 700 44px "${SERIF}"`; text('melanoidins', 250, 262, { color: '#d9a472' });
    const pts = Array.from({ length: n }, (_, i) => [110 + i * 23, 380 + Math.sin(i * 0.9) * 40 + (i % 2) * 14]);
    for (let i = 0; i < n; i++) {
      if (grow * n < i) break;
      const [x, y] = pts[i];
      if (i) { ctx.strokeStyle = '#7a4524'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(x, y); ctx.stroke(); }
      ctx.fillStyle = roastRGB(0.62 + rnd(i, 3) * 0.2); ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    }
    font(500, 24); A(seg(t, 29.0, 29.4), () => { text('big brown molecules', 250, 486, { color: C.soft }); text('that colour the brew', 250, 516, { color: C.soft }); });
    // the brew darkens
    const dark = seg(t, 29.2, 31.6);
    A(seg(t, 28.8, 29.3), () => cup(250, 600, 0.62, { brew: roastRGB(0.55 + dark * 0.45), crema: roastRGB(0.4 + dark * 0.25) }));
    // aroma molecules float up on the right
    ctx.font = `italic 700 44px "${SERIF}"`; text('aroma', 620, 262, { color: C.copper });
    for (let i = 0; i < 16; i++) {
      const at = 28.4 + i * 0.2, ph = seg(t, at, at + 2.6);
      if (ph <= 0) continue;
      const x = 500 + rnd(i, 1) * 240 + Math.sin(t * 1.3 + i) * 10, y = 700 - ph * 380;
      aromaRing(x, y, 12 + rnd(i, 2) * 6, i, Math.min(1, ph * 4) * (1 - seg(ph, 0.8, 1)));
    }
    font(500, 24); A(seg(t, 29.6, 30.0), () => { text('dozens of', 620, 720, { color: C.soft }); text('volatile molecules', 620, 750, { color: C.soft }); });
  });
}

// ---------- H: one shared smell ----------
function ffl(x, y, s, a = 1) {
  // 2-furfurylthiol: a furan ring (four carbons and an oxygen) with a CH2–SH arm
  A(a, () => {
    const r = 48 * s, pts = Array.from({ length: 5 }, (_, i) => { const an = Math.PI / 2 + (i * Math.PI * 2) / 5; return [x + Math.cos(an) * r, y + Math.sin(an) * r]; });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.stroke();
    // two double bonds, drawn inside the ring
    const inner = (i, j) => { const m = (p) => [lerp(p[0], x, 0.2), lerp(p[1], y, 0.2)]; const [a1, b1] = m(pts[i]), [a2, b2] = m(pts[j]); ctx.beginPath(); ctx.moveTo(lerp(a1, a2, 0.12), lerp(b1, b2, 0.12)); ctx.lineTo(lerp(a1, a2, 0.88), lerp(b1, b2, 0.88)); ctx.stroke(); };
    inner(1, 2); inner(3, 4);
    // the oxygen at the bottom
    ctx.fillStyle = '#123a33'; ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], 20 * s, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 ${34 * s}px "${SANS}"`; text('O', pts[0][0], pts[0][1] + 1, { color: C.copper });
    // the arm: CH2 then SH
    const [qx, qy] = pts[4], ex = qx + 70 * s, ey = qy + 34 * s, fx = ex + 70 * s, fy = ey - 34 * s;
    ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(ex, ey); ctx.lineTo(fx - 18 * s, fy + 9 * s); ctx.stroke();
    ctx.font = `700 ${34 * s}px "${SANS}"`; text('SH', fx + 12 * s, fy, { color: C.gold });
  });
}
function shared(t) {
  const a = span(t, 32.4, 37.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.font = `italic 700 50px "${SERIF}"`; text('2-furfurylthiol', W / 2, 262, { color: C.copper });
    ffl(W / 2 - 50, 420, 1.15, seg(t, 32.6, 33.2));
    const g = eout(seg(t, 33.4, 34.2));
    grain(170, 600, 64 * g, { rot: 0.5, roast: 0.85 });
    bean(694, 600, 58 * g, { rot: -0.3 });
    A(seg(t, 34.0, 34.4), () => {
      font(600, 26); text('roasted barley', 170, 700, { color: C.gold }); text('roasted coffee', 694, 700, { color: '#d9a472' });
    });
    A(seg(t, 34.4, 34.9), () => {
      ctx.setLineDash([8, 10]); ctx.strokeStyle = C.copper; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(220, 560); ctx.lineTo(340, 470); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(644, 560); ctx.lineTo(560, 470); ctx.stroke();
      ctx.setLineDash([]);
    });
    A(seg(t, 35.4, 35.9), () => { font(500, 22); text('a 2013 study of a cereal coffee whose aroma came mainly from roasted barley', W / 2, 752, { color: C.faint }); });
  });
}

// ---------- I: no caffeine to keep ----------
function noCaffeine(t) {
  const a = span(t, 37.0, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.font = `italic 700 50px "${SERIF}"`; text('caffeine', W / 2, 262, { color: C.mint });
    const g = back(seg(t, 37.2, 38.0));
    bean(250, 470, 150 * g, { rot: -0.25 });
    grain(614, 470, 160 * g, { rot: 0.3, roast: 0.85 });
    const spots = [[-36, -70], [30, -40], [-24, 0], [34, 34], [-30, 74], [8, 104]];
    spots.forEach(([dx, dy], i) => caffeine(250 + dx - 10, 470 + dy, 1, seg(t, 38.2 + i * 0.12, 38.5 + i * 0.12)));
    A(seg(t, 38.6, 39.0), () => {
      font(600, 28); text('coffee plants make it', 250, 664, { color: C.mint });
      text('barley makes none', 614, 664, { color: C.soft });
    });
    A(seg(t, 39.4, 39.9), () => { font(800, 120); text('0', 614, 474, { color: C.mint }); });
  });
}

// ---------- J: decaf against orzo ----------
function cups(t) {
  const a = span(t, 41.6, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('caffeine in a cup of about 240 mL (8 US fluid ounces)', W / 2, 220, { color: C.soft });
    const g1 = back(seg(t, 41.8, 42.5)), g2 = back(seg(t, 42.6, 43.3));
    const one = (x, g, name, val, n, col) => {
      if (g <= 0) return;
      ctx.save(); ctx.translate(x, 470); ctx.scale(g, g); ctx.translate(-x, -470);
      cup(x, 430, 0.95, { brew: '#2b170c' });
      ctx.restore();
      for (let i = 0; i < n; i++) caffeine(x - 30 + (i % 3) * 30 - 8, 330 - Math.floor(i / 3) * 34 + Math.sin(t * 2 + i) * 3, 0.9, seg(t, 43.4 + i * 0.1, 43.7 + i * 0.1));
      A(seg(t, 43.3, 43.8), () => {
        font(600, 30); text(name, x, 620, { color: C.soft });
        font(800, 60); text(val, x, 690, { color: col });
      });
    };
    one(240, g1, 'decaf', `${DECAF[0]}–${DECAF[1]} mg`, 3, C.ink);
    one(624, g2, 'orzo', '0 mg', 0, C.mint);
    A(seg(t, 44.2, 44.7), () => { font(500, 22); text('decaf: US Food and Drug Administration', W / 2, 752, { color: C.faint }); });
  });
}

// ---------- K: 1935 ----------
function sanctions(t) {
  const a = span(t, 46.2, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    card(132, 196, 600, 540, seg(t, 46.3, 46.8));
    A(seg(t, 46.4, 47.0), () => { font(600, 26); text('ITALY', W / 2, 262, { color: C.soft, spacing: '10px' }); });
    const u = eout(seg(t, 46.6, 47.6));
    ctx.font = `800 ${150}px "${SERIF}"`; A(u, () => text('1935', W / 2, 400 + (1 - u) * 24, { color: C.gold }));
    A(seg(t, 47.6, 48.1), () => {
      font(600, 34); text('League of Nations sanctions', W / 2, 530, { color: C.ink });
      font(500, 28); text('over the invasion of Ethiopia', W / 2, 578, { color: C.soft });
    });
    A(seg(t, 48.6, 49.1), () => {
      ctx.strokeStyle = C.rust; ctx.lineWidth = 4; k.rrect(W / 2 - 190, 624, 380, 66, 10); ctx.stroke();
      font(700, 28); text('in force: 18 November', W / 2, 658, { color: C.copper });
    });
  });
}

// ---------- L: autarchia ----------
function sack(x, y, s) {
  ctx.fillStyle = '#a98656';
  ctx.beginPath(); ctx.moveTo(x - 90 * s, y - 100 * s); ctx.quadraticCurveTo(x, y - 128 * s, x + 90 * s, y - 100 * s); ctx.quadraticCurveTo(x + 124 * s, y + 30 * s, x + 92 * s, y + 120 * s);
  ctx.quadraticCurveTo(x, y + 140 * s, x - 92 * s, y + 120 * s); ctx.quadraticCurveTo(x - 124 * s, y + 30 * s, x - 90 * s, y - 100 * s); ctx.fill();
  ctx.strokeStyle = 'rgba(60,35,15,0.35)'; ctx.lineWidth = 2;
  for (let yy = y - 96 * s; yy < y + 120 * s; yy += 9) { ctx.beginPath(); ctx.moveTo(x - 104 * s, yy); ctx.lineTo(x + 104 * s, yy); ctx.stroke(); }
  for (let i = 0; i < 7; i++) bean(x - 48 * s + i * 16 * s, y - 108 * s + Math.sin(i * 1.7) * 5, 13 * s, { rot: rnd(i, 160) * 3 });
}
function autarchia(t) {
  const a = span(t, 50.8, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(seg(t, 51.0, 51.6), () => { ctx.font = `800 64px "${SERIF}"`; text('AUTARCHIA', W / 2, 250, { color: C.gold, spacing: '8px' }); font(500, 28); text('self-sufficiency', W / 2, 306, { color: C.soft }); });
    // coffee from abroad: imports rationed, the price climbs
    const g = back(seg(t, 51.6, 52.3));
    if (g > 0) { ctx.save(); ctx.translate(220, 520); ctx.scale(g, g); ctx.translate(-220, -520); sack(220, 520, 1.05); ctx.restore(); }
    A(seg(t, 52.2, 52.6), () => { font(600, 26); text('imported coffee', 220, 690, { color: '#d9a472' }); });
    const st = back(seg(t, 52.6, 53.1));
    if (st > 0) {
      ctx.save(); ctx.translate(220, 560); ctx.rotate(-0.16); ctx.scale(st, st);
      ctx.strokeStyle = C.rust; ctx.lineWidth = 5; k.rrect(-118, -30, 236, 60, 8); ctx.stroke();
      ctx.fillStyle = 'rgba(16,10,6,0.55)'; k.rrect(-115, -27, 230, 54, 6); ctx.fill();
      font(800, 28); text('RATIONED', 0, 2, { color: '#f0875a', spacing: '4px' });
      ctx.restore();
    }
    A(seg(t, 53.0, 53.4), () => {
      const up = eout(seg(t, 53.0, 54.4)), x = 410;
      ctx.strokeStyle = C.copper; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 600 - 150 * up); ctx.stroke();
      ctx.fillStyle = C.copper; ctx.beginPath(); ctx.moveTo(x, 566 - 150 * up); ctx.lineTo(x - 22, 598 - 150 * up); ctx.lineTo(x + 22, 598 - 150 * up); ctx.closePath(); ctx.fill();
      font(600, 26); text('price', x, 690, { color: C.copper });
    });
    // grown at home: barley
    A(seg(t, 53.6, 54.1), () => {
      for (let i = 0; i < 3; i++) ear(570 + i * 66, 650, 230, eout(seg(t, 53.6 + i * 0.2, 54.6 + i * 0.2)), { sway: i * 0.5, awn: 80 });
      font(600, 26); text('barley grown at home', 636, 690, { color: C.gold });
    });
  });
}

// ---------- M: the two substitutes ----------
function tin(x, y, w, h, label, sub, band) {
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#2a3b36'); g.addColorStop(0.4, '#4e625b'); g.addColorStop(1, '#1e2a27');
  ctx.fillStyle = g; k.rrect(x - w / 2, y - h, w, h, 10); ctx.fill();
  ctx.fillStyle = '#5c7069'; ctx.beginPath(); ctx.ellipse(x, y - h, w / 2, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = band; ctx.fillRect(x - w / 2, y - h * 0.68, w, h * 0.42);
  ctx.font = `800 40px "${SERIF}"`; text(label, x, y - h * 0.47, { color: '#1b120b', spacing: '3px' });
  font(600, 22); text(sub, x, y + 36, { color: C.soft });
}
function substitutes(t) {
  const a = span(t, 55.4, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(seg(t, 55.6, 56.1), () => { ctx.font = `800 64px "${SERIF}"`; text('1935 – 1945', W / 2, 240, { color: C.ink }); });
    ctx.fillStyle = C.brass; ctx.fillRect(110, 662, 644, 10);
    const g1 = back(seg(t, 56.0, 56.7)), g2 = back(seg(t, 56.6, 57.3));
    if (g1 > 0) { ctx.save(); ctx.translate(290, 660); ctx.scale(g1, g1); ctx.translate(-290, -660); tin(290, 660, 220, 300, 'ORZO', 'roasted barley', C.gold); ctx.restore(); }
    if (g2 > 0) { ctx.save(); ctx.translate(574, 660); ctx.scale(g2, g2); ctx.translate(-574, -660); tin(574, 660, 220, 300, 'CICORIA', 'roasted chicory root', '#e08a5a'); ctx.restore(); }
  });
}

// ---------- N: two caveats ----------
function caveats(t) {
  const a = span(t, 60.0, 65.0, 0.4, 0);
  if (a <= 0) return;
  A(a, () => {
    card(56, 196, 368, 560, seg(t, 60.1, 60.5));
    card(440, 196, 368, 560, seg(t, 60.6, 61.0));
    A(seg(t, 60.2, 60.7), () => {
      ctx.font = `italic 700 44px "${SERIF}"`; text('acrylamide', 240, 262, { color: C.copper });
      font(500, 22); text('forms in roasting above about 120 °C', 240, 306, { color: C.soft });
      // the EU benchmark levels as bars
      const max = 520, bx = 104, bw = 272;
      BENCH.forEach(([name, v], i) => {
        const y = 380 + i * 140, u = eout(seg(t, 60.8 + i * 0.5, 61.6 + i * 0.5));
        font(600, 24); text(name, bx, y, { color: C.ink, align: 'left' });
        ctx.fillStyle = i ? C.gold : '#d9a472'; k.rrect(bx, y + 22, (bw * v * u) / max, 30, 8); ctx.fill();
        font(800, 38); text(`${Math.round(v * u)}`, bx, y + 92, { color: i ? C.gold : '#d9a472', align: 'left' });
        font(500, 22); text('µg per kg', bx + 80, y + 94, { color: C.soft, align: 'left' });
      });
      font(500, 20); text('EU benchmark levels for producers', 240, 716, { color: C.faint });
    });
    A(seg(t, 62.4, 62.9), () => {
      ctx.font = `italic 700 44px "${SERIF}"`; text('gluten', 624, 262, { color: C.gold });
      ear(624, 576, 210, eout(seg(t, 62.4, 63.4)), { awn: 60 });
      font(600, 26); text('barley contains it,', 624, 620, { color: C.ink }); text('so orzo is not for', 624, 656, { color: C.ink }); text('people with coeliac disease', 624, 692, { color: C.ink });
      font(500, 20); text('Associazione Italiana Celiachia', 624, 730, { color: C.faint });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    words(t);
    rawGrain(t);
    strip(t);
    roaster(t);
    maillard(t);
    caramel(t);
    products(t);
    shared(t);
    noCaffeine(t);
    cups(t);
    sanctions(t);
    autarchia(t);
    substitutes(t);
    caveats(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.copper, '^': C.mint } });
  },
});
