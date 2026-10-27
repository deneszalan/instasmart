// Explainer for engineering-vatican-obelisk-1586 (Roma): in 1586 the architect Domenico Fontana moved the Vatican
// obelisk for Pope Sixtus V. He weighed a cubic palm of its granite, measured the shaft and worked out the weight;
// one capstan lifted about 20,000 pounds, so 40 capstans and five levers could lift it, and the capstans shared the
// load by themselves, because an overloaded one stopped turning while the slacker ones caught up. Look: an engraving
// on warm paper, as in Fontana's book: brown ink, red granite, hemp ropes, red-chalk marks. EB Garamond for
// captions, Rubik for labels.
//
// Facts:
// - Domenico Fontana, Della trasportatione dell'obelisco vaticano et delle fabriche di nostro signore Papa Sisto V
//   (Rome, 1590), book 1, read in the Internet Archive's scan (gri_33125008662708): a cubic palm cut from a stone like
//   the obelisk weighed 86 libbre; the shaft 107½ palms high to the start of the point, which rises 6 palms more;
//   the whole "almost 11,204 cubic palms, less about a sixteenth", so 963,537 35/48 libbre; each capstan with good
//   ropes and tackle lifted about 20,000 libbre, so 40 capstans would lift 800,000, and for the rest five levers of
//   huge beams, 70 palms long; critics doubted the capstans could pull together, saying the one pulling most would
//   take the weight and break; Fontana knew four horses pulling one of his ropes could not break it, so an overloaded
//   capstan could no longer turn while the slacker ones turned until they had their share; the work stopped every
//   three or four turns to check the ropes. The timber "castello": eight columns, each of four beams, 123 palms high,
//   10 palms higher than the obelisk, braced by props. The iron harness weighed 40,000 libbre, planks, tackle and
//   ropes another 40,000: 1,043,537 in all. A proclamation: no one could enter the enclosure but the workmen, on pain
//   of death, nor talk, spit or make a noise, under heavy penalties. A trumpet meant turn; a bell on top of the
//   castello meant stop. Wednesday 30 April 1586: five levers, 40 capstans, 907 men and 75 horses; in 12 moves it rose
//   2¾ palms. Wednesday 7 May: lowered onto the sledge (the book's "1585" is a misprint; 7 May 1586 was a Wednesday).
//   It was taken 115 canne (1 canna = 10 palms) along an embankment, since the square was about 40 palms lower.
//   Wednesday 10 September 1586: 40 capstans, 140 horses and 800 men; upright in 52 moves; at sunset it stood on its
//   pedestal. The book does not tell the sailor's story.
// - Wikipedia, "Vatican obelisk": red granite, 25.3 m; brought to Rome under Caligula and set in the Circus of Nero;
//   moved about 260 m in 1586 for Sixtus V by Domenico Fontana; the sailor Benedetto Bresca's shout "Acqua alle funi"
//   is told without a source. Wikipedia, "List of obelisks in Rome": the only obelisk in Rome never toppled since
//   Roman times. Wikipedia, "Palm (unit)": the Roman architects' palm was about 22.3 cm.
// - Turismo Roma, "The Vatican Obelisk": 327 tons; 900 men and 75 horses; erected at sunset on 10 September 1586.
// - Engines of Our Ingenuity 370 (J. Lienhard, after B. Dibner, Moving the Obelisks, 1970): the sailor and the
//   gallows are legends added about 200 years later.
// Computed here: 11,204 − 1/16 cubic palms × 86; 40 × 20,000; 123 and 113½ palms and 115 canne in metres; the
// load-sharing run: ropes that start unevenly tight, a capstan that turns only while its rope is below what a team
// can turn (or, as the critics feared, a rope that snaps when overloaded). The run is a simplified model.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  St Peter's, 1586: the obelisk beside the basilica, the new site in the square; 25.3 m.
//  B  9.6–18.8  A cubic palm weighs 86 pounds; the shaft fills with 11,204 of them: 963,537 pounds.
//  C 18.8–28.0  A capstan: 20,000 pounds; 40 of them and five levers; the timber tower and its pulleys.
//  D 28.0–46.4  The critics' fear (a rope snaps); Fontana's answer (a capstan stops); trumpet and bell.
//  E 46.4–60.0  30 April: up 2¾ palms; 7 May: down onto a sledge; the causeway; 10 September: raised.
//  F 60.2–65.0  The sailor's legend.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#efe3c8', paper2: '#e2d1ae', ink: '#2c2017', soft: 'rgba(44,32,23,0.72)', faint: 'rgba(44,32,23,0.24)',
  granite: '#c07a64', granite2: '#93503f', rope: '#9a7440', timber: '#a07a4c', timber2: '#6e5032', iron: '#4a5560',
  chalk: '#a53d25', blue: '#36597a', ochre: '#9a6a12', sun: '#e9a25a', ok: '#3f7a4a',
};
const SERIF = 'EB Garamond', SANS = 'Rubik';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const fmtDown = (n) => Math.floor(n).toLocaleString('en-US');

// ---------- the numbers (Fontana, 1590) ----------
const PALM = 0.2232; // m, the Roman architects' palm
const CUBE_LB = 86, CUBIC_PALMS = 11204 - 1 / 16, FONTANA_LB = 963537 + 35 / 48;
const WEIGHT_LB = CUBIC_PALMS * CUBE_LB; // 963,539: Fontana rounded his parts a little differently
const TONNES = 327; // Turismo Roma
const CAPSTAN_LB = 20000, CAPSTANS = 40, LEVERS = 5, CAPSTANS_LB = CAPSTAN_LB * CAPSTANS;
const SHAFT = 107.5, POINT = 6, TALL = SHAFT + POINT, TOWER = 123, CANNE = 115;
const BASE_W = 12 + 5 / 12, TOP_W = 8 + 5 / 12;
const TALL_M = TALL * PALM, TOWER_M = TOWER * PALM, ROLL_M = CANNE * 10 * PALM;
if (Math.abs(WEIGHT_LB - FONTANA_LB) / FONTANA_LB > 1e-5 || CAPSTANS_LB !== 800000 || Math.abs(TALL_M - 25.3) > 0.1 || Math.round(ROLL_M / 10) * 10 !== 260) throw new Error('numbers');

// ---------- the load-sharing model (simplified, as in the lab) ----------
// 40 ropes; rope i starts slack by s_i palms; it is wound in by a capstan; its pull is K × stretch; the obelisk rises
// once the ropes together hold the capstans' share of the weight, set here to 80% of what all teams could turn.
const N = 40, K = 8, NEED = 0.8 * N, STEP = 0.01;
function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lift(e) {
  const pull = (h) => e.reduce((s, x) => (x === null ? s : s + K * Math.max(0, x - h)), 0);
  if (pull(0) <= NEED) return 0;
  let lo = 0, hi = 10; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (pull(m) > NEED) lo = m; else hi = m; }
  return lo;
}
/** A run of `turns` small turns. snap: teams can pull 1.6 but a rope breaks above 1 (the critics' fear). */
function run(snap, turns, seed = 7) {
  const r = rnd(seed), slack = Array.from({ length: N }, () => r() * 0.6), wound = new Array(N).fill(0), broken = new Array(N).fill(false);
  const frames = [];
  const state = () => {
    const e = wound.map((w, i) => (broken[i] ? null : w - slack[i])), h = lift(e);
    return { h, T: e.map((x) => (x === null ? 0 : K * Math.max(0, x - h))), broken: broken.slice() };
  };
  let s = state();
  frames.push(s);
  for (let n = 0; n < turns; n++) {
    const limit = snap ? 1.6 : 1;
    for (let i = 0; i < N; i++) {
      if (broken[i]) continue;
      const room = (limit - s.T[i]) / K;
      if (room > 0) wound[i] += Math.min(STEP, room);
    }
    s = state();
    if (snap) { let any = true; while (any) { any = false; s.T.forEach((v, i) => { if (!broken[i] && v > 1) { broken[i] = true; any = true; } }); if (any) s = state(); } }
    frames.push(s);
  }
  return frames;
}
const SNAP = run(true, 70), STALL = run(false, 140);
if (SNAP.at(-1).broken.filter(Boolean).length < 3 || STALL.at(-1).broken.some(Boolean) || STALL.at(-1).h <= 0) throw new Error('model');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'In 1586 Pope Sixtus V had the Vatican obelisk moved to the middle of *St Peter’s Square*.'],
  [5.0, 9.4, 'Brought from Egypt under Emperor Caligula, it had stood by the basilica since Roman times.'],
  [9.6, 14.0, `The architect Domenico Fontana first weighed a cubic palm of the same granite: *${CUBE_LB} pounds*.`],
  [14.2, 18.6, `The obelisk held about ${fmt(CUBIC_PALMS)} cubic palms: ~${fmtDown(FONTANA_LB)} pounds~ by his sums, some ${TONNES} tonnes.`],
  [18.8, 23.2, `One capstan lifted about *${fmt(CAPSTAN_LB)} pounds*: ${CAPSTANS} gave ${fmt(CAPSTANS_LB)}, and ${LEVERS === 5 ? 'five' : LEVERS} big levers the rest.`],
  [23.4, 27.8, `Their ropes ran up to pulleys on a timber tower ^${TOWER} palms^, about ${Math.round(TOWER_M)} m, high.`],
  [28.0, 32.4, 'Critics said 40 capstans could never pull together: one would take the weight and *snap*.'],
  [32.6, 37.0, 'Fontana knew four horses couldn’t break his ropes, so an overloaded capstan would just ~stop~…'],
  [37.2, 41.6, '…while the slacker ones kept turning, until all of them shared the weight.'],
  [41.8, 46.2, 'A trumpet meant *turn*, a bell on the tower meant ~stop~, and no one was allowed to talk.'],
  [46.4, 50.8, 'On 30 April 1586, 907 men and 75 horses lifted it ^2¾ palms^ in 12 moves.'],
  [51.0, 55.4, `Lowered onto a sledge on 7 May, it was rolled about ${Math.round(ROLL_M / 10) * 10} m along a raised causeway.`],
  [55.6, 60.0, 'On 10 September, 800 men and 140 horses raised it in 52 moves. By sunset it stood.'],
  [60.2, 64.6, 'A later legend has a sailor shout ‘Water on the ropes!’ Fontana’s own 1590 book doesn’t tell it.'],
];

// ---------- paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, H * 0.42, 120, W / 2, H / 2, 760);
  rg.addColorStop(0, C.paper); rg.addColorStop(1, C.paper2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(110,80,40,${0.03 + r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,110,60,${0.02 + r() * 0.03})`; g.beginPath(); g.arc(r() * W, r() * H, 20 + r() * 60, 0, TAU); g.fill(); }
}

function hatch(path, ang, gap, col, wdt = 1) {
  ctx.save(); path(); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.beginPath();
  const c = Math.cos(ang), s = Math.sin(ang);
  for (let d = -900; d < 900; d += gap) { ctx.moveTo(CX + c * -900 - s * d, 540 + s * -900 + c * d); ctx.lineTo(CX + c * 900 - s * d, 540 + s * 900 + c * d); }
  ctx.stroke(); ctx.restore();
}
function label(str, x, y, { size = 22, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }
function dimV(x, y0, y1, str, col = C.chalk) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
  for (const y of [y0, y1]) { ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke(); }
  ctx.save(); ctx.translate(x + 18, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); label(str, 0, 0, { size: 22, col, align: 'center', weight: 600 }); ctx.restore();
}

// ---------- the obelisk: local coordinates in palms, (0,0) = middle of the base, up = −y ----------
function obeliskPath(s) {
  ctx.beginPath();
  ctx.moveTo(-BASE_W / 2 * s, 0); ctx.lineTo(-TOP_W / 2 * s, -SHAFT * s); ctx.lineTo(0, -TALL * s); ctx.lineTo(TOP_W / 2 * s, -SHAFT * s); ctx.lineTo(BASE_W / 2 * s, 0); ctx.closePath();
}
function obelisk(x, y, s, ang = 0, { harness = 0, ball = 0, cross = 0, cubes = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  obeliskPath(s); ctx.fillStyle = C.granite; ctx.fill();
  hatch(() => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(BASE_W / 2 * s, 0); ctx.lineTo(TOP_W / 2 * s, -SHAFT * s); ctx.lineTo(0, -TALL * s); ctx.closePath(); }, -1.2, 5, 'rgba(110,50,35,0.45)', 1.1);
  for (let i = 0; i < 70; i++) { const u = ((i * 37) % 97) / 97, v = ((i * 61) % 89) / 89; ctx.fillStyle = 'rgba(80,30,25,0.35)'; ctx.fillRect((u - 0.5) * lerp(BASE_W, TOP_W, v) * s * 0.9, -v * SHAFT * s, 1.6, 1.6); }
  obeliskPath(s); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  if (cubes > 0) {
    // the shaft filling with cubic palms, from the base up
    const rows = Math.floor(SHAFT * cubes);
    ctx.save(); obeliskPath(s); ctx.clip();
    ctx.strokeStyle = 'rgba(44,32,23,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let r = 0; r <= rows; r++) { ctx.moveTo(-BASE_W * s, -r * s); ctx.lineTo(BASE_W * s, -r * s); }
    for (let c = -7; c <= 7; c++) { ctx.moveTo(c * s, 0); ctx.lineTo(c * s, -rows * s); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(165,61,37,0.25)'; ctx.fillRect(-BASE_W * s, -rows * s, BASE_W * 2 * s, rows * s);
    ctx.restore();
  }
  if (harness > 0) A(harness, () => {
    ctx.strokeStyle = C.iron; ctx.lineWidth = 2.2;
    for (const u of [-0.32, 0, 0.32]) { ctx.beginPath(); ctx.moveTo(u * BASE_W * s, 0); ctx.lineTo(u * TOP_W * s, -SHAFT * s); ctx.stroke(); }
    for (let i = 0; i < 9; i++) { const v = (i + 0.5) / 9, hw = lerp(BASE_W, TOP_W, v) / 2 * s + 2; ctx.beginPath(); ctx.moveTo(-hw, -v * SHAFT * s); ctx.lineTo(hw, -v * SHAFT * s); ctx.stroke(); }
  });
  if (ball > 0) A(ball, () => { ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.arc(0, -TALL * s - 3.2 * s, 3 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); });
  if (cross > 0) A(cross, () => { ctx.fillStyle = C.ink; ctx.fillRect(-0.5 * s, -TALL * s - 12 * s, 1 * s, 12 * s); ctx.fillRect(-3 * s, -TALL * s - 9 * s, 6 * s, 1 * s); });
  ctx.restore();
}

// ---------- the timber tower (castello), in palms ----------
const COLS = [-22.5, -13, 13, 22.5];
function tower(x, y, s, a = 1, { ropes = 0, bell = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y);
    const X = (p) => p * s, Y = (p) => -p * s;
    // raking props: nested triangles on both sides
    ctx.strokeStyle = C.timber2; ctx.lineWidth = 3;
    for (const sd of [-1, 1]) {
      const foot = sd * 24.75;
      [[7.5, TOWER / 3], [15, TOWER / 2], [22.5, TOWER * 2 / 3], [30, TOWER * 0.95]].forEach(([b, hh]) => {
        ctx.beginPath(); ctx.moveTo(X(foot + sd * b), 0); ctx.lineTo(X(foot), Y(hh)); ctx.stroke();
      });
      // cross braces
      ctx.lineWidth = 1.4; ctx.beginPath();
      for (const f of [0.2, 0.4, 0.6]) { ctx.moveTo(X(foot + sd * 30 * (1 - f)), Y(TOWER * 0.95 * f)); ctx.lineTo(X(foot + sd * 7.5 * (1 - f * 1.3)), Y(TOWER / 3 * f)); }
      ctx.stroke(); ctx.lineWidth = 3;
    }
    // the columns, each of four beams, with iron rings every 12 palms
    for (const c of COLS) {
      ctx.fillStyle = C.timber; ctx.fillRect(X(c - 2.25), Y(TOWER), 4.5 * s, TOWER * s);
      hatch(() => { ctx.beginPath(); ctx.rect(X(c - 2.25), Y(TOWER), 4.5 * s, TOWER * s); }, 1.57, 4, 'rgba(70,45,25,0.5)', 1);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(X(c - 2.25), Y(TOWER), 4.5 * s, TOWER * s);
      ctx.strokeStyle = C.iron; ctx.lineWidth = 2; for (let h = 12; h < TOWER; h += 12) { ctx.beginPath(); ctx.moveTo(X(c - 2.6), Y(h)); ctx.lineTo(X(c + 2.6), Y(h)); ctx.stroke(); }
    }
    // horizontal ties and the top trusses
    ctx.strokeStyle = C.timber2; ctx.lineWidth = 2.4;
    for (const h of [TOWER / 3, TOWER / 2, TOWER * 2 / 3]) { ctx.beginPath(); ctx.moveTo(X(-24.75), Y(h)); ctx.lineTo(X(-10.75), Y(h)); ctx.moveTo(X(10.75), Y(h)); ctx.lineTo(X(24.75), Y(h)); ctx.stroke(); }
    ctx.fillStyle = C.timber; ctx.fillRect(X(-26), Y(TOWER + 4), 52 * s, 4 * s); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(X(-26), Y(TOWER + 4), 52 * s, 4 * s);
    ctx.beginPath(); ctx.moveTo(X(-26), Y(TOWER + 4)); ctx.lineTo(X(0), Y(TOWER + 11)); ctx.lineTo(X(26), Y(TOWER + 4)); ctx.stroke();
    // pulleys and ropes
    if (ropes > 0) A(ropes, () => {
      for (let i = -4; i <= 4; i++) {
        const px = X(i * 1.1);
        ctx.fillStyle = C.iron; k.rrect(px - 4, Y(TOWER) - 2, 8, 14, 2); ctx.fill();
      }
    });
    if (bell > 0) A(bell, () => {
      const sw = Math.sin(bell * 20) * 0.35 * (bell < 1 ? 1 : 0.4);
      ctx.save(); ctx.translate(X(0), Y(TOWER + 11) - 2); ctx.rotate(sw);
      ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.moveTo(-9, 22); ctx.quadraticCurveTo(-9, 2, 0, 2); ctx.quadraticCurveTo(9, 2, 9, 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    });
    ctx.restore();
  });
}
// ropes from the tower top down to the obelisk's harness and out to the capstans on the ground
function towerRopes(x, y, s, a, liftPx = 0) {
  A(a, () => {
    ctx.strokeStyle = C.rope; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = -4; i <= 4; i++) { const px = x + i * 1.1 * s, top = y - TOWER * s + 10; ctx.moveTo(px, top); ctx.lineTo(px * 0.2 + x * 0.8 + i * 3, y - TALL * s * 0.55 - liftPx); }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { const top = y - TOWER * s + 8; ctx.moveTo(x + sd * (2 + i * 1.6) * s, top); ctx.lineTo(x + sd * (W * 0.52 + i * 20), y + 6 - i * 3); }
    ctx.stroke();
  });
}

// ---------- a capstan, side view: a drum turned by bars, a horse walking round ----------
function capstan(x, y, sc, t, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(44,32,23,0.12)'; ctx.beginPath(); ctx.ellipse(0, 6, 150, 26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.timber; ctx.fillRect(-90, -8, 180, 14); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(-90, -8, 180, 14);
    ctx.fillStyle = C.timber; ctx.fillRect(-22, -120, 44, 112); ctx.strokeRect(-22, -120, 44, 112);
    ctx.strokeStyle = C.rope; ctx.lineWidth = 3; for (let yy = -100; yy < -40; yy += 7) { ctx.beginPath(); ctx.moveTo(-22, yy); ctx.lineTo(22, yy + 3); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(22, -70); ctx.lineTo(240, -170); ctx.stroke();
    const ph = t * 1.4;
    for (const off of [0, Math.PI]) {
      const c = Math.cos(ph + off);
      ctx.strokeStyle = C.timber2; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(c * 130, -104 + Math.sin(ph + off) * 10); ctx.stroke();
    }
    // the horse at the end of one bar
    const c = Math.cos(ph), hx = c * 130, front = Math.sin(ph) > 0;
    A(front ? 1 : 0.55, () => {
      ctx.save(); ctx.translate(hx, -60); ctx.scale(Math.sin(ph) > 0 ? 1 : -1, 1);
      ctx.fillStyle = '#5a3f28';
      ctx.beginPath(); ctx.ellipse(0, -26, 34, 14, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(26, -34); ctx.lineTo(44, -58); ctx.lineTo(52, -52); ctx.lineTo(36, -26); ctx.fill();
      const lg = Math.sin(t * 9) * 6;
      ctx.fillRect(-26 + lg, -16, 5, 30); ctx.fillRect(18 - lg, -16, 5, 30); ctx.fillRect(-16 - lg, -16, 5, 30); ctx.fillRect(10 + lg, -16, 5, 30);
      ctx.restore();
    });
    ctx.restore();
  });
}

// ---------- A: the site ----------
function sceneSite(t) {
  const a = span(t, 0, 9.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(seg(t, 0.6, 1.4), () => {
      label('ST PETER’S, ROME · 1586', 56, 100, { size: 26, weight: 700 });
      label('schematic plan, north up', 56, 132, { size: 20, col: C.soft, fam: SERIF });
    });
    // plan: the basilica (rebuilding) and the square
    const p = seg(t, 0.8, 2.4);
    A(p, () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(44,32,23,0.08)';
      ctx.beginPath(); ctx.rect(70, 300, 270, 90); ctx.fill(); ctx.stroke(); // nave
      ctx.beginPath(); ctx.rect(110, 250, 70, 190); ctx.fill(); ctx.stroke(); // transept / new crossing
      hatch(() => { ctx.beginPath(); ctx.rect(70, 300, 270, 90); }, 0.8, 9, C.faint, 1);
      label('St Peter’s Basilica', 205, 345, { size: 21, align: 'center', weight: 600 });
      label('(being rebuilt)', 205, 370, { size: 19, align: 'center', col: C.soft, fam: SERIF });
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.strokeRect(370, 250, 130, 190); ctx.setLineDash([]);
      label('the square', 435, 228, { size: 20, align: 'center', col: C.soft, fam: SERIF });
    });
    const oldX = 150, oldY = 480, newX = 435, newY = 345;
    A(seg(t, 1.6, 2.4), () => {
      ctx.fillStyle = C.granite; ctx.beginPath(); ctx.arc(oldX, oldY, 9, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
      label('the obelisk', oldX + 18, oldY + 4, { size: 21, weight: 600 });
      label('since Roman times', oldX + 18, oldY + 30, { size: 19, col: C.soft, fam: SERIF });
    });
    const go = eio(seg(t, 2.4, 4.4));
    if (go > 0) {
      ctx.setLineDash([8, 7]); ctx.strokeStyle = C.chalk; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(oldX, oldY); const mx = lerp(oldX, newX, go), my = lerp(oldY, newY, go); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 4.0, 4.6), () => { ctx.fillStyle = C.chalk; ctx.beginPath(); ctx.arc(newX, newY, 9, 0, TAU); ctx.fill(); label(`≈ ${Math.round(ROLL_M / 10) * 10} m`, 330, 455, { size: 22, col: C.chalk, weight: 700 }); });
    }
    // the obelisk itself, with its bronze ball
    const s = 4.4, ox = 660, oy = 720;
    A(seg(t, 4.8, 5.8), () => {
      obelisk(ox, oy, s, 0, { ball: 1 });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox - 70, oy); ctx.lineTo(ox + 70, oy); ctx.stroke();
      dimV(ox + 64, oy - TALL * s, oy, `${TALL_M.toFixed(1)} m`);
      label('red granite', ox - 46, oy + 28, { size: 20, col: C.soft, fam: SERIF, align: 'center' });
      label('from Egypt', ox + 30, oy + 28, { size: 20, col: C.soft, fam: SERIF, align: 'left' });
    });
  });
}

// ---------- B: weighing ----------
function sceneWeigh(t) {
  const a = span(t, 9.6, 19.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const s = 4.4, ox = 660, oy = 720;
    obelisk(ox, oy, s, 0, { cubes: eio(seg(t, 14.4, 17.0)) });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox - 70, oy); ctx.lineTo(ox + 70, oy); ctx.stroke();
    // the cube on a steelyard
    const cx = 230, cy = 380, e = 70, d = 30;
    A(seg(t, 10.0, 10.8) * (1 - 0.5 * seg(t, 14.2, 14.8)), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 130, 230); ctx.lineTo(cx + 150, 214); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 40, 225); ctx.lineTo(cx - 40, 190); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + 120, 236, 12, 0, TAU); ctx.fill(); ctx.fillRect(cx + 119, 216, 2, 10);
      ctx.beginPath(); ctx.moveTo(cx - 110, 229); ctx.lineTo(cx - 110, cy - e / 2 - d); ctx.stroke();
      ctx.fillStyle = C.granite; ctx.fillRect(cx - 110 - e / 2, cy - e / 2, e, e);
      ctx.fillStyle = C.granite2; ctx.beginPath(); ctx.moveTo(cx - 110 - e / 2, cy - e / 2); ctx.lineTo(cx - 110 - e / 2 + d, cy - e / 2 - d); ctx.lineTo(cx - 110 + e / 2 + d, cy - e / 2 - d); ctx.lineTo(cx - 110 + e / 2, cy - e / 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 110 + e / 2, cy - e / 2); ctx.lineTo(cx - 110 + e / 2 + d, cy - e / 2 - d); ctx.lineTo(cx - 110 + e / 2 + d, cy + e / 2 - d); ctx.lineTo(cx - 110 + e / 2, cy + e / 2); ctx.fillStyle = '#a86452'; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 110 - e / 2, cy - e / 2, e, e);
      label('1 cubic palm', cx - 110, cy + 64, { size: 22, align: 'center', weight: 600 });
      label(`each side ≈ ${(PALM * 100).toFixed(1)} cm`, cx - 110, cy + 92, { size: 20, align: 'center', col: C.soft, fam: SERIF });
      A(seg(t, 11.6, 12.4), () => label(`= ${CUBE_LB} pounds`, cx + 30, cy - 10, { size: 34, col: C.chalk, weight: 700, fam: SERIF }));
    });
    A(seg(t, 15.0, 15.8), () => {
      const x = 60, y = 560;
      label(`${fmt(CUBIC_PALMS)} cubic palms`, x, y, { size: 26, weight: 600 });
      label(`× ${CUBE_LB} pounds`, x, y + 38, { size: 26, weight: 600 });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 62); ctx.lineTo(x + 300, y + 62); ctx.stroke();
      A(seg(t, 16.2, 17.0), () => {
        label(`${fmtDown(FONTANA_LB)} pounds`, x, y + 92, { size: 32, col: C.blue, weight: 700 });
        label(`≈ ${TONNES} tonnes`, x, y + 130, { size: 24, col: C.soft, fam: SERIF });
      });
    });
  });
}

// ---------- C: capstans and the tower ----------
function sceneCapstans(t) {
  const a = span(t, 18.8, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    capstan(290, 470, 1.0, t);
    label('a capstan', 120, 520, { size: 24, weight: 700 });
    label(`lifts about ${fmt(CAPSTAN_LB)} pounds`, 120, 552, { size: 21, col: C.soft, fam: SERIF });
    // the sum as bars: 40 capstans plus five levers against the weight
    const x0 = 80, y0 = 640, wBar = 700, full = 1.15e6, sc = wBar / full;
    A(seg(t, 20.4, 21.2), () => {
      const grow = eout(seg(t, 20.6, 22.2));
      for (let i = 0; i < CAPSTANS; i++) {
        const v = clamp(grow * CAPSTANS - i);
        if (v <= 0) continue;
        ctx.fillStyle = i % 2 ? C.rope : '#b48a52'; ctx.fillRect(x0 + i * CAPSTAN_LB * sc, y0, CAPSTAN_LB * sc * v, 26);
      }
      label(`${CAPSTANS} capstans: ${fmt(CAPSTAN_LB * CAPSTANS * grow)}`, x0, y0 - 18, { size: 21, weight: 600 });
      A(seg(t, 22.0, 22.6), () => {
        ctx.fillStyle = 'rgba(54,89,122,0.35)'; ctx.fillRect(x0 + CAPSTANS_LB * sc, y0, (FONTANA_LB - CAPSTANS_LB) * sc + 40, 26);
        label('+ 5 levers', x0 + CAPSTANS_LB * sc + 6, y0 + 50, { size: 20, col: C.blue, weight: 600 });
      });
      ctx.strokeStyle = C.chalk; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0 + FONTANA_LB * sc, y0 - 34); ctx.lineTo(x0 + FONTANA_LB * sc, y0 + 34); ctx.stroke();
      label('the stone', x0 + FONTANA_LB * sc - 6, y0 - 46, { size: 20, col: C.chalk, weight: 600, align: 'center' });
    });
  });
}
const TW = { x: CX, y: 740, s: 4.15 };
function sceneTower(t) {
  const a = t < 41.8 ? span(t, 23.4, 28.2, 0.4, 0.4) : span(t, 41.8, 53.0, 0.4, 0.5);
  if (a <= 0) return;
  const { x, y, s } = TW;
  const up = t < 46.4 ? 0 : eio(seg(t, 47.2, 50.0)) * 2.75 * s;
  const down = eio(seg(t, 51.6, 53.0));
  A(Math.min(1, a), () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
    tower(x, y, s, 1 - down, { ropes: 1, bell: t > 41.8 && t < 46.4 ? seg(t, 43.6, 45.4) + 0.001 : 0 });
    towerRopes(x, y, s, (t < 46.4 ? seg(t, 24.6, 25.6) : 1) * (1 - down), up);
    obelisk(lerp(x, x - 250, down), y - up * (1 - down) - down * BASE_W / 2 * s, s, down * Math.PI / 2, { harness: 1 });
    A(t < 28.2 ? seg(t, 24.2, 25.0) : 0, () => {
      dimV(x + 30 * s + 40, y - TOWER * s, y, `${TOWER} palms ≈ ${Math.round(TOWER_M)} m`);
      label('the timber tower', 60, 200, { size: 24, weight: 700 });
      label('8 columns, each of 4 beams', 60, 232, { size: 20, col: C.soft, fam: SERIF });
    });
    if (t > 41.8 && t < 46.4) {
      // trumpet left, bell on top
      A(seg(t, 42.2, 42.8), () => {
        const tx = 120, ty = 560, blast = Math.max(0, Math.sin((t - 42.2) * 5));
        ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.moveTo(tx - 40, ty - 4); ctx.lineTo(tx + 20, ty - 4); ctx.lineTo(tx + 42, ty - 18); ctx.lineTo(tx + 42, ty + 18); ctx.lineTo(tx + 20, ty + 4); ctx.lineTo(tx - 40, ty + 4); ctx.fill();
        ctx.strokeStyle = C.chalk; ctx.lineWidth = 2.5; for (let i = 1; i <= 3; i++) A(blast, () => { ctx.beginPath(); ctx.arc(tx + 46, ty, 12 * i, -0.7, 0.7); ctx.stroke(); });
        label('trumpet: TURN', tx - 40, ty + 44, { size: 22, weight: 700, col: C.chalk });
      });
      A(seg(t, 43.6, 44.2), () => { label('bell: STOP', x + 60, y - TOWER * s - 34, { size: 22, weight: 700, col: C.blue }); });
      A(seg(t, 44.8, 45.4), () => { label('silence, by order', 600, 560, { size: 22, weight: 600, col: C.ink }); label('“no one may talk, spit', 600, 590, { size: 19, col: C.soft, fam: SERIF }); label('or make a noise”', 600, 614, { size: 19, col: C.soft, fam: SERIF }); });
    }
    if (t >= 46.4 && t < 51.2) A(seg(t, 46.8, 47.4), () => {
      const moves = Math.min(12, Math.floor(seg(t, 47.2, 50.0) * 12 + 0.0001));
      label('30 APRIL 1586', 60, 200, { size: 26, weight: 700 });
      label(`move ${moves} of 12`, 60, 236, { size: 22, col: C.soft });
      label('907 men · 75 horses', 60, 268, { size: 22, col: C.soft });
      label('40 capstans · 5 levers', 60, 298, { size: 22, col: C.soft });
      label(`up ${(seg(t, 47.2, 50.0) * 2.75).toFixed(2)} palms`, 60, 336, { size: 24, col: C.ochre, weight: 700 });
    });
  });
}

// ---------- D: the critics' fear and Fontana's answer ----------
function sceneShare(t) {
  const a = span(t, 28.0, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  const snapPhase = t < 32.5;
  const frames = snapPhase ? SNAP : STALL;
  const f = frames[Math.min(frames.length - 1, Math.floor(snapPhase ? seg(t, 28.6, 31.6) * (SNAP.length - 1) : seg(t, 33.0, 41.0) * (STALL.length - 1)))];
  A(a * (snapPhase ? span(t, 28.0, 32.5, 0.4, 0.3) : span(t, 32.5, 41.8, 0.3, 0.4)), () => {
    // plan: the tower in the middle, 40 capstans in a ring, ropes coloured by pull
    const cx = CX, cy = 330, R = 200;
    label('seen from above', 60, 150, { size: 21, col: C.soft, fam: SERIF });
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * TAU - Math.PI / 2, x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R * 0.78;
      const T = f.T[i], br = f.broken[i];
      if (br) {
        ctx.strokeStyle = C.chalk; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(lerp(x, cx, 0.12), lerp(y, cy, 0.12)); ctx.lineTo(lerp(x, cx, 0.4), lerp(y, cy, 0.4)); ctx.stroke();
      } else {
        ctx.strokeStyle = T >= 0.995 ? C.blue : T > 0.02 ? C.rope : 'rgba(154,116,64,0.35)'; ctx.lineWidth = 1 + T * 3;
        ctx.beginPath(); ctx.moveTo(lerp(x, cx, 0.12), lerp(y, cy, 0.12)); ctx.lineTo(lerp(x, cx, 0.86), lerp(y, cy, 0.86)); ctx.stroke();
      }
      ctx.fillStyle = br ? C.chalk : T >= 0.995 ? C.blue : C.timber2; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = C.timber; ctx.fillRect(cx - 34, cy - 22, 68, 44); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 34, cy - 22, 68, 44);
    ctx.fillStyle = C.granite; ctx.fillRect(cx - 9, cy - 9, 18, 18);
    // bars: the pull on each rope against what one team can turn
    const bx = 112, by = 742, bw = 16, bh = 150;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx - 6, by); ctx.lineTo(bx + N * bw + 2, by); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const T = f.T[i];
      if (f.broken[i]) { label('×', bx + i * bw + bw / 2 - 1, by - 14, { size: 22, col: C.chalk, align: 'center', weight: 700 }); continue; }
      ctx.fillStyle = T >= 0.995 ? C.blue : C.rope; ctx.fillRect(bx + i * bw + 2, by - Math.min(1.25, T) * bh, bw - 4, Math.min(1.25, T) * bh);
    }
    ctx.setLineDash([7, 6]); ctx.strokeStyle = snapPhase ? C.chalk : C.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 6, by - bh); ctx.lineTo(bx + N * bw + 2, by - bh); ctx.stroke(); ctx.setLineDash([]);
    label(snapPhase ? 'a rope snaps here' : 'most a team can turn', bx, by - bh - 22, { size: 20, col: snapPhase ? C.chalk : C.blue, weight: 600 });
    label('pull on each of the 40 ropes', bx + N * bw, by - bh - 22, { size: 20, col: C.soft, align: 'right', fam: SERIF });
    const nb = f.broken.filter(Boolean).length;
    if (snapPhase) A(seg(t, 29.4, 30.0), () => label(`${nb} snapped: the critics’ fear`, 60, 520, { size: 24, col: C.chalk, weight: 700 }));
    else {
      const stopped = f.T.filter((v) => v >= 0.995).length;
      A(seg(t, 34.0, 34.6), () => label(`${stopped} stopped, none snapped`, 60, 520, { size: 24, col: C.blue, weight: 700 }));
      A(seg(t, 38.4, 39.0), () => label(f.h > 0 ? 'the obelisk rises' : '', W - 60, 520, { size: 24, col: C.ok, weight: 700, align: 'right' }));
    }
    A(snapPhase ? 0 : 1, () => label('simplified model', W - 60, 150, { size: 19, col: C.soft, fam: SERIF, align: 'right' }));
  });
}

// ---------- E: the causeway and the raising ----------
function sceneRoll(t) {
  const a = span(t, 52.7, 55.8, 0.3, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const y = 560, go = eio(seg(t, 53.0, 55.2));
    // the embankment
    ctx.fillStyle = 'rgba(122,92,58,0.35)'; ctx.beginPath(); ctx.moveTo(20, y + 10); ctx.lineTo(W - 20, y + 10); ctx.lineTo(W - 60, y + 110); ctx.lineTo(60, y + 110); ctx.closePath(); ctx.fill();
    hatch(() => { ctx.beginPath(); ctx.moveTo(20, y + 10); ctx.lineTo(W - 20, y + 10); ctx.lineTo(W - 60, y + 110); ctx.lineTo(60, y + 110); ctx.closePath(); }, 0.6, 8, 'rgba(70,50,30,0.35)', 1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, y + 10); ctx.lineTo(W - 20, y + 10); ctx.stroke();
    const s = 3.2, x = lerp(120, 300, go);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = C.timber2; ctx.beginPath(); ctx.arc(x + i * 66 + (go * 300) % 66 - 20, y + 4, 6, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.timber; ctx.fillRect(x - 20, y - 12, TALL * s + 30, 10);
    obelisk(x, y - 12 - BASE_W / 2 * s, s, Math.PI / 2, { harness: 1 });
    label('7 MAY 1586', 60, 200, { size: 26, weight: 700 });
    label('on a sledge, over rollers, along a raised causeway', 60, 236, { size: 21, col: C.soft, fam: SERIF });
    label(`${fmt(go * Math.round(ROLL_M / 10) * 10)} m`, W - 70, y - 60, { size: 30, col: C.chalk, weight: 700, align: 'right' });
  });
}
function sceneRaise(t) {
  const a = span(t, 55.6, 65.0, 0.4, 0.0);
  if (a <= 0) return;
  A(a, () => {
    const sunset = seg(t, 57.4, 59.6);
    // a warm sunset wash behind
    const g = ctx.createLinearGradient(0, 120, 0, 740);
    g.addColorStop(0, `rgba(233,162,90,${0.32 * sunset})`); g.addColorStop(1, 'rgba(233,162,90,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
    A(sunset, () => { ctx.fillStyle = 'rgba(214,110,60,0.55)'; ctx.beginPath(); ctx.arc(150, 610, 46, 0, TAU); ctx.fill(); });
    const { x, y, s } = TW;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
    ctx.fillStyle = C.paper2; ctx.fillRect(x - 40, y - 30, 80, 30); ctx.strokeStyle = C.ink; ctx.strokeRect(x - 40, y - 30, 80, 30); // pedestal
    const up = eio(seg(t, 56.4, 59.2)), done = t > 60.2;
    tower(x, y - 30, s, 1 - seg(t, 60.2, 61.0), { ropes: 1 });
    towerRopes(x, y - 30, s, 1 - seg(t, 60.2, 61.0));
    obelisk(x - (1 - up) * 40, y - 30, s, -(1 - up) * Math.PI / 2, { harness: 1 - seg(t, 60.2, 61.0), cross: seg(t, 60.6, 61.4) });
    A(t < 60.2 ? seg(t, 55.8, 56.4) : 1 - seg(t, 60.2, 60.8), () => {
      label('10 SEPTEMBER 1586', 60, 200, { size: 26, weight: 700 });
      label(`move ${Math.min(52, Math.floor(up * 52 + 0.0001))} of 52`, 60, 236, { size: 22, col: C.soft });
      label('800 men · 140 horses', 60, 268, { size: 22, col: C.soft });
      label('40 capstans', 60, 298, { size: 22, col: C.soft });
    });
    if (done) A(seg(t, 60.6, 61.2), () => {
      // the legend, stamped
      const bx = 560, by = 300;
      ctx.fillStyle = '#f6efdd'; k.rrect(bx - 170, by - 60, 340, 100, 18); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 60, by + 40); ctx.lineTo(bx - 100, by + 90); ctx.lineTo(bx - 20, by + 40); ctx.fillStyle = '#f6efdd'; ctx.fill(); ctx.stroke();
      label('“Acqua alle funi!”', bx, by - 22, { size: 30, align: 'center', weight: 600, fam: SERIF });
      label('Water on the ropes!', bx, by + 14, { size: 22, align: 'center', col: C.soft, fam: SERIF });
      A(seg(t, 61.8, 62.2), () => {
        ctx.save(); ctx.translate(bx + 110, by + 70); ctx.rotate(-0.2);
        ctx.strokeStyle = C.chalk; ctx.lineWidth = 4; k.rrect(-84, -26, 168, 52, 6); ctx.stroke();
        label('LEGEND', 0, 2, { size: 32, align: 'center', weight: 800, col: C.chalk }); ctx.restore();
      });
      A(seg(t, 62.6, 63.2), () => {
        const x0 = 60, y0 = 430, bw = 220, bh = 270;
        ctx.fillStyle = '#efe0bf'; ctx.fillRect(x0, y0, bw, bh); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, bw, bh); ctx.strokeRect(x0 + 10, y0 + 10, bw - 20, bh - 20);
        ['DELLA', 'TRASPORTATIONE', 'DELL’OBELISCO', 'VATICANO'].forEach((w, i) => label(w, x0 + bw / 2, y0 + 52 + i * 32, { size: i === 1 ? 20 : 22, align: 'center', weight: 600, fam: SERIF }));
        label('Rome, 1590', x0 + bw / 2, y0 + 226, { size: 22, align: 'center', fam: SERIF });
        label('no sailor in it', x0 + bw / 2, y0 + bh + 32, { size: 21, align: 'center', col: C.chalk, weight: 600 });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneSite(t);
    sceneWeigh(t);
    sceneCapstans(t);
    sceneTower(t);
    sceneShare(t);
    sceneRoll(t);
    sceneRaise(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.chalk, '~': C.blue, '^': C.ochre } });
  },
});
