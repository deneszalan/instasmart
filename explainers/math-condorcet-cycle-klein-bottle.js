// Explainer for math-condorcet-cycle-klein-bottle: on 26 October 2026 Quanta Magazine reported a topological
// model by Ori Livson, Siddharth Pritam and Mikhail Prokopenko in which the Condorcet voting paradox becomes a
// Klein bottle. The paradox itself, Baryshnikov's band of six ranking triangles, and why gluing its rims needs
// a twist. Look: cream paper and navy ink, candidates in coral (Alice), teal (Bob) and mustard (Carol),
// surfaces as violet wireframes. Space Grotesk for labels, Gentium Book Plus for captions.
//
// Facts: Quanta Magazine, "How Voting Is Like a Klein Bottle" (Alex Stone, 26 October 2026): Livson (doctoral
// student, University of Sydney), Prokopenko (Sydney) and Pritam (Chennai Mathematical Institute); Condorcet's
// paradox (1785) with three equal groups ranking Alice > Bob > Carol, Bob > Carol > Alice and Carol > Alice >
// Bob, so that Alice beats Bob, Bob beats Carol and Carol beats Alice; Baryshnikov (1993) drew each of the six
// rankings as a triangle whose corners are the comparisons it implies, joined rankings that share two
// comparisons along an edge, and got a strip whose ends match, bent into a tube with two rims; the rims hold
// the cyclic orderings, one each way round; gluing them directly gives a torus but pairs incompatible edges;
// gluing with a twist is the only valid option and gives a Klein bottle, one-sided with no edge, which needs
// four dimensions to sit without crossing itself. arXiv:2601.07283 (Livson, Pritam, Prokopenko, "The
// Non-Orientable Topology of Condorcet's Paradox"): the contradiction corresponds to non-orientability.
//
// Computed here: the head-to-head counts from the three ballots; which comparisons each ranking implies; the
// band's adjacency (rankings that differ by one swap share an edge) and its two rims. Surfaces are drawn as
// wireframes: the Klein bottle from its standard "bottle" parametrization.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: Quanta, 26 October 2026; the researchers; a Klein bottle.
//  B  9.6–27.8  Condorcet's paradox: three ballots, three head-to-heads, a circle.
//  C 28.0–46.2  Baryshnikov's triangles; the strip; the tube; the rims are the cycles.
//  D 46.4–55.4  Straight gluing gives a torus that doesn't match; a twist gives a Klein bottle.
//  E 55.6–64.8  One side, no edge; the analogy.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#f4efe3', paper2: '#e9e1cf', ink: '#1d2440', soft: 'rgba(29,36,64,0.7)', faint: 'rgba(29,36,64,0.25)',
  alice: '#d9482b', bob: '#14808a', carol: '#c48a0c', violet: '#5b3fb0', violetLo: 'rgba(91,63,176,0.14)', bad: '#c62f45',
  card: '#fffaf0',
};
const LAB = 'Space Grotesk', CAP = 'Gentium Book Plus';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the ballots and the head-to-heads ----------
const NAMES = { A: 'Alice', B: 'Bob', C: 'Carol' }, COL = { A: C.alice, B: C.bob, C: C.carol };
const GROUPS = [['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B']];
const prefers = (rank, x, y) => rank.indexOf(x) < rank.indexOf(y);
const votes = (x, y) => GROUPS.filter((g) => prefers(g, x, y)).length;
const DUELS = [['A', 'B'], ['B', 'C'], ['C', 'A']].map(([x, y]) => ({ x, y, for: votes(x, y), against: votes(y, x) }));

// ---------- Baryshnikov's band: rankings as triangles of comparisons ----------
const comps = (r) => [`${r[0]}>${r[1]}`, `${r[1]}>${r[2]}`, `${r[0]}>${r[2]}`];
// around the band, each ranking differs from the next by one swap of neighbours
const BAND = [['A', 'B', 'C'], ['B', 'A', 'C'], ['B', 'C', 'A'], ['C', 'B', 'A'], ['C', 'A', 'B'], ['A', 'C', 'B']];
// vertices of the unfolded strip: top row at even positions, bottom row at odd ones
const STRIP_V = ['A>B', 'A>C', 'B>C', 'B>A', 'C>A', 'C>B', 'A>B', 'A>C'];
const STRIP_T = BAND.map((r, i) => ({ rank: r, v: [i, i + 1, i + 2] })); // triangle i uses strip vertices i, i+1, i+2
// check (in the console) that each triangle's corners are exactly its ranking's comparisons
for (const tr of STRIP_T) { const want = comps(tr.rank).sort().join(), got = tr.v.map((i) => STRIP_V[i]).sort().join(); if (want !== got) console.error('band mismatch', tr.rank.join(''), got); }

const CUES = [
  [0.4, 4.8, 'On 26 October 2026, Quanta Magazine reported a new picture of a 240-year-old voting puzzle.'],
  [5.0, 9.4, 'Mathematicians Ori Livson, Siddharth Pritam and Mikhail Prokopenko turned it into a *Klein bottle*.'],
  [9.6, 14.0, 'The puzzle: three equal groups of voters each rank three candidates, Alice, Bob and Carol.'],
  [14.2, 18.6, 'Every group is perfectly consistent. Now compare the candidates in pairs, by majority.'],
  [18.8, 23.2, `Alice beats Bob, ${DUELS[0].for} groups to ${DUELS[0].against}. Bob beats Carol, ${DUELS[1].for} to ${DUELS[1].against}. And Carol beats Alice, ${DUELS[2].for} to ${DUELS[2].against}.`],
  [23.4, 27.8, 'The group’s choice runs in a *circle*, like rock-paper-scissors: *Condorcet’s paradox*, from 1785.'],
  [28.0, 32.4, 'In 1993 mathematician Yuliy Baryshnikov drew each of the 6 possible rankings as a triangle.'],
  [32.6, 37.0, 'Its corners are the three head-to-heads that ranking implies, such as “Alice over Bob”.'],
  [37.2, 41.6, 'Rankings that agree on two of them share an edge, and the six triangles close into a *tube*.'],
  [41.8, 46.2, 'Its two rims are the impossible orders: the circles, one each way round.'],
  [46.4, 50.8, 'Glue the rims straight together and you get a doughnut, but the results don’t match up.'],
  [51.0, 55.4, 'Glue them with a *twist* and everything matches. The surface becomes a *Klein bottle*.'],
  [55.6, 60.0, 'A Klein bottle has one side and no edge. In 3D it can only be drawn crossing itself.'],
  [60.2, 64.6, 'Like a voting paradox: every small patch makes sense, but the whole can’t be laid out consistently.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  let s = 37; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(90,70,40,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1.3, 1.3); }
  g.strokeStyle = 'rgba(29,36,64,0.05)'; g.lineWidth = 1;
  for (let y = 60; y < 780; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

function chip(x, y, w, h, fn) { ctx.fillStyle = 'rgba(255,250,240,0.92)'; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke(); fn(); }
function arrow(x0, y0, x1, y1, col, w = 5, head = 18) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.7, y1 - Math.sin(a) * head * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}
// a comparison label such as A>B, the letters in their candidates' colours
function compLabel(s, x, y, size = 24, align = 'center') {
  const [a, b] = s.split('>');
  font(700, size);
  const wA = ctx.measureText(a).width, wG = ctx.measureText(' > ').width, wB = ctx.measureText(b).width, tot = wA + wG + wB;
  let x0 = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  text(a, x0, y, { color: COL[a], base: 'middle' }); x0 += wA;
  text(' > ', x0, y, { color: C.ink, base: 'middle' }); x0 += wG;
  text(b, x0, y, { color: COL[b], base: 'middle' });
}

// ---------- 3D wireframes ----------
function project(p, yaw, pitch, cx, cy, s) {
  const x1 = p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw), z1 = -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw);
  const y2 = p[1] * Math.cos(pitch) - z1 * Math.sin(pitch), z2 = p[1] * Math.sin(pitch) + z1 * Math.cos(pitch);
  return [cx + x1 * s, cy - y2 * s, z2];
}
function klein(u, v) {
  const cu = Math.cos(u), su = Math.sin(u), cv = Math.cos(v), sv = Math.sin(v);
  const x = -(2 / 15) * cu * (3 * cv - 30 * su + 90 * cu ** 4 * su - 60 * cu ** 6 * su + 5 * cu * cv * su);
  const y = -(1 / 15) * su * (3 * cv - 3 * cu ** 2 * cv - 48 * cu ** 4 * cv + 48 * cu ** 6 * cv - 60 * su + 5 * cu * cv * su - 5 * cu ** 3 * cv * su - 80 * cu ** 5 * cv * su + 80 * cu ** 7 * cv * su);
  const z = (2 / 15) * (3 + 5 * cu * su) * sv;
  return [x, y, z];
}
const torus = (u, v) => [(1 + 0.42 * Math.cos(v)) * Math.cos(u), 0.42 * Math.sin(v), (1 + 0.42 * Math.cos(v)) * Math.sin(u)];
function wire(f, uMax, { yaw, pitch, cx, cy, s, nu = 28, nv = 18, col = C.violet, a = 1, center = [0, 0, 0] }) {
  A(a, () => {
    ctx.lineWidth = 1.6;
    const P = (u, v) => { const q = f(u, v); return project([q[0] - center[0], q[1] - center[1], q[2] - center[2]], yaw, pitch, cx, cy, s); };
    for (let i = 0; i < nu; i++) {
      const u = (i / nu) * uMax; ctx.beginPath();
      for (let j = 0; j <= 48; j++) { const p = P(u, (j / 48) * Math.PI * 2); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = col; ctx.globalAlpha = a * 0.55; ctx.stroke();
    }
    for (let j = 0; j < nv; j++) {
      const v = (j / nv) * Math.PI * 2; ctx.beginPath();
      for (let i = 0; i <= 96; i++) { const p = P((i / 96) * uMax, v); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = col; ctx.globalAlpha = a * 0.35; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}
const KC = [0.15, 2.1, 0]; // the bottle's middle, in its own units (it spans x −1.5…1.8, y 0…4.2)

// ---------- A: hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.8);
  if (a <= 0) return;
  A(a, () => {
    font(700, 24); text('QUANTA MAGAZINE · 26 OCTOBER 2026', 52, 96, { color: C.violet, base: 'middle', spacing: '1px' });
    font(700, 52, CAP); text('A voting paradox, as a shape', 52, 150, { color: C.ink, base: 'middle' });
    wire(klein, Math.PI, { yaw: t * 0.35, pitch: 0.35, cx: W / 2, cy: 430, s: 95, center: KC, a: eout(seg(t, 0.4, 2.0)) });
    A(span(t, 5.0, 9.8, 0.4, 0.4), () => {
      chip(52, 640, 760, 100, () => {
        font(600, 24); text('Ori Livson · Mikhail Prokopenko (University of Sydney)', 76, 672, { color: C.ink, base: 'middle' });
        text('Siddharth Pritam (Chennai Mathematical Institute)', 76, 710, { color: C.ink, base: 'middle' });
      });
    });
  });
}

// ---------- B: the paradox ----------
function card(x, y, rank, i, a) {
  A(a, () => {
    ctx.fillStyle = C.card; k.rrect(x, y, 220, 230, 16); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();
    font(600, 22); text(`group ${i + 1}`, x + 110, y + 32, { color: C.soft, align: 'center', base: 'middle' });
    rank.forEach((c, j) => {
      font(700, 22); text(`${j + 1}.`, x + 34, y + 84 + j * 52, { color: C.soft, base: 'middle' });
      font(700, 32); text(NAMES[c], x + 70, y + 84 + j * 52, { color: COL[c], base: 'middle' });
    });
  });
}
const NODE = { A: [432, 300], B: [640, 640], C: [224, 640] };
function scenePuzzle(t) {
  const a = span(t, 9.6, 28.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const up = eio(seg(t, 22.8, 23.8)); // cards shrink away for the circle
    A(1 - up, () => {
      GROUPS.forEach((g, i) => card(52 + i * 260, 200, g, i, eout(seg(t, 9.8 + i * 0.6, 10.6 + i * 0.6))));
      // the head-to-heads
      DUELS.forEach((d, i) => {
        const at = 18.8 + i * 1.3, y = 500 + i * 70;
        A(seg(t, at, at + 0.5), () => {
          chip(132, y - 28, 600, 56, () => {
            font(700, 28); text(NAMES[d.x], 160, y, { color: COL[d.x], base: 'middle' });
            font(500, 26); text('beats', 300, y, { color: C.ink, base: 'middle' });
            font(700, 28); text(NAMES[d.y], 390, y, { color: COL[d.y], base: 'middle' });
            font(500, 24); text(`${d.for} groups to ${d.against}`, 540, y, { color: C.soft, base: 'middle' });
          });
        });
      });
      A(span(t, 14.2, 18.8), () => { font(600, 26); text('each ballot: a clear order, no loops', W / 2, 480, { color: C.soft, align: 'center', base: 'middle' }); });
    });
    // the circle
    A(up, () => {
      for (const [c, [x, y]] of Object.entries(NODE)) {
        ctx.fillStyle = COL[c]; ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.fill();
        font(700, 30); text(NAMES[c], x, y, { color: '#fffaf0', align: 'center', base: 'middle' });
      }
      const sp = (p, q, f) => [lerp(p[0], q[0], f), lerp(p[1], q[1], f)];
      for (const d of DUELS) {
        const p = NODE[d.x], q = NODE[d.y], s0 = sp(p, q, 0.24), s1 = sp(p, q, 0.76);
        arrow(s0[0], s0[1], s1[0], s1[1], C.ink, 6, 22);
      }
      font(600, 24); text('an arrow means: beats, by majority', W / 2, 200, { color: C.soft, align: 'center', base: 'middle' });
      A(seg(t, 24.4, 25.0), () => { font(700, 30, CAP); text('no winner', W / 2, 520, { color: C.bad, align: 'center', base: 'middle' }); });
    });
  });
}

// ---------- C: triangles, strip, tube ----------
const SX0 = 92, SD = 97, ST = 330, SB = 500; // the strip on screen
const stripPos = (i) => [SX0 + i * SD, i % 2 ? SB : ST];
function rankLabel(r, x, y, size = 22) {
  font(700, size);
  const parts = [r[0], ' > ', r[1], ' > ', r[2]], widths = parts.map((p) => ctx.measureText(p).width);
  let x0 = x - widths.reduce((s, w) => s + w, 0) / 2;
  parts.forEach((p, i) => { text(p, x0, y, { color: i % 2 ? C.ink : COL[p], base: 'middle' }); x0 += widths[i]; });
}
function sceneBand(t) {
  const a = span(t, 28.0, 46.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // the legend
    chip(52, 64, 560, 60, () => {
      font(700, 24); let x = 76;
      for (const c of ['A', 'B', 'C']) { text(`${c} = ${NAMES[c]}`, x, 95, { color: COL[c], base: 'middle' }); x += 170; }
    });
    // one triangle, then the strip
    const single = 1 - seg(t, 37.0, 37.6);
    A(single * span(t, 28.0, 37.6), () => {
      const r = BAND[0], [c0, c1, c2] = comps(r);
      const P = [[260, 560], [604, 560], [432, 260]];
      ctx.fillStyle = C.violetLo; ctx.strokeStyle = C.violet; ctx.lineWidth = 4;
      ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
      rankLabel(r, 432, 470, 30);
      font(500, 22); text('the ranking', 432, 510, { color: C.soft, align: 'center', base: 'middle' });
      A(seg(t, 32.8, 33.6), () => {
        compLabel(c0, 432, 220, 30);
        compLabel(c1, 640, 610, 30, 'left');
        compLabel(c2, 224, 610, 30, 'right');
      });
    });
    // the strip of six triangles, ends matching
    const strip = seg(t, 37.4, 38.2) * (1 - seg(t, 40.6, 41.4));
    A(strip, () => {
      STRIP_T.forEach((tr, i) => {
        const g = eout(seg(t, 37.6 + i * 0.25, 38.0 + i * 0.25));
        const pts = tr.v.map(stripPos);
        A(g, () => {
          ctx.fillStyle = C.violetLo; ctx.strokeStyle = C.violet; ctx.lineWidth = 3;
          ctx.beginPath(); pts.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
          const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
          font(700, 18); text(tr.rank.join(''), cx, cy, { color: C.ink, align: 'center', base: 'middle' });
        });
      });
      STRIP_V.forEach((v, i) => { const [x, y] = stripPos(i); compLabel(v, x, y + (i % 2 ? 30 : -30), 20); });
      font(500, 22); text('the two end edges match: bend the strip round', W / 2, 600, { color: C.soft, align: 'center', base: 'middle' });
    });
    // the tube: the band in 3D, with its rims
    const tube = seg(t, 40.8, 41.8);
    A(tube, () => {
      // the band wrapped round a cylinder: top vertices at 0°, 120°, 240°, bottom ones half-way between
      const yaw = -0.25 + 0.3 * Math.sin((t - 40.8) * 0.45), pitch = 0.42, cx = W / 2, cy = 375, s = 180, h = 0.7;
      const ang = (i) => (i % 2 ? ((i - 1) / 2 + 0.5) : i / 2) * (2 * Math.PI / 3); // strip vertex -> angle round the tube
      const V = (i) => [Math.cos(ang(i)), i % 2 ? -h : h, Math.sin(ang(i))];
      const pr = (p) => project(p, yaw, pitch, cx, cy, s);
      // a point on the cylinder part-way along the edge from strip vertex i to j (angles go the short way)
      const along = (i, j, f) => { let d = ang(j) - ang(i); d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI; const a2 = ang(i) + d * f, y = lerp(V(i)[1], V(j)[1], f); return [Math.cos(a2), y, Math.sin(a2)]; };
      const faces = STRIP_T.map((tr) => {
        const pts = [];
        for (const [i, j] of [[tr.v[0], tr.v[1]], [tr.v[1], tr.v[2]], [tr.v[2], tr.v[0]]]) for (let n = 0; n < 12; n++) pts.push(pr(along(i, j, n / 12)));
        return { pts, z: pts.reduce((s0, q) => s0 + q[2], 0) / pts.length };
      }).sort((f1, f2) => f1.z - f2.z);
      for (const f of faces) {
        const front = f.z > 0;
        ctx.fillStyle = front ? 'rgba(91,63,176,0.2)' : 'rgba(91,63,176,0.08)'; ctx.strokeStyle = front ? C.violet : 'rgba(91,63,176,0.35)'; ctx.lineWidth = front ? 3 : 2;
        ctx.beginPath(); f.pts.forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // rims
      const rim = seg(t, 42.0, 42.8);
      A(rim, () => {
        for (const [y, col] of [[h, C.alice], [-h, C.bob]]) {
          ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath();
          for (let n = 0; n <= 72; n++) { const a2 = (n / 72) * Math.PI * 2, q = pr([Math.cos(a2), y, Math.sin(a2)]); n ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
          ctx.stroke();
        }
      });
      for (let i = 0; i < 6; i++) { const q = pr(V(i)); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, Math.PI * 2); ctx.fill(); compLabel(STRIP_V[i], q[0], q[1] + (i % 2 ? 28 : -26), 20); }
      A(rim, () => {
        chip(52, 640, 760, 110, () => {
          font(600, 22); text('top rim:', 76, 672, { color: C.alice, base: 'middle' });
          text('A > B,  B > C,  C > A', 210, 672, { color: C.ink, base: 'middle' });
          text('bottom rim:', 76, 716, { color: C.bob, base: 'middle' });
          text('A > C,  C > B,  B > A', 210, 716, { color: C.ink, base: 'middle' });
          font(700, 22); text('both circles', 640, 694, { color: C.bad, base: 'middle' });
        });
      });
    });
  });
}

// ---------- D + E: torus, then Klein bottle ----------
function sceneGlue(t) {
  const a = span(t, 46.2, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    const tor = span(t, 46.2, 51.2, 0.5, 0.5);
    A(tor, () => {
      wire(torus, Math.PI * 2, { yaw: t * 0.3, pitch: 0.7, cx: W / 2, cy: 430, s: 210, nu: 36, nv: 14 });
      font(700, 30, CAP); text('glued straight: a torus', W / 2, 200, { color: C.ink, align: 'center', base: 'middle' });
      A(seg(t, 48.4, 49.0), () => {
        for (const [x, y] of [[300, 470], [560, 400]]) {
          ctx.strokeStyle = C.bad; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 24, y - 24); ctx.lineTo(x + 24, y + 24); ctx.moveTo(x + 24, y - 24); ctx.lineTo(x - 24, y + 24); ctx.stroke();
        }
        font(600, 24); text('rankings glued to the wrong ones', W / 2, 660, { color: C.bad, align: 'center', base: 'middle' });
      });
    });
    const kb = seg(t, 51.0, 52.0);
    A(kb, () => {
      wire(klein, Math.PI * eout(seg(t, 51.0, 53.0)), { yaw: 0.6 + t * 0.3, pitch: 0.3, cx: W / 2, cy: 440, s: 100, center: KC, nu: 30, nv: 18 });
      A(span(t, 51.0, 55.6), () => { font(700, 30, CAP); text('glued with a twist: a Klein bottle', W / 2, 160, { color: C.violet, align: 'center', base: 'middle' }); });
      A(span(t, 55.6, 64.8, 0.4, 0.01), () => {
        // a dot travelling along the surface, through the neck and back round
        const u = ((t - 55.6) / 4.6) * Math.PI % Math.PI, q = project(((p) => [p[0] - KC[0], p[1] - KC[1], p[2] - KC[2]])(klein(u, 0.3)), 0.6 + t * 0.3, 0.3, W / 2, 440, 100);
        ctx.fillStyle = C.alice; ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2); ctx.fill();
        chip(52, 64, 470, 106, () => {
          font(700, 26); text('one side, no edge', 76, 100, { color: C.violet, base: 'middle' });
          font(500, 22); text('in 3D it must pass through itself', 76, 138, { color: C.soft, base: 'middle' });
        });
      });
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
    scenePuzzle(t);
    sceneBand(t);
    sceneGlue(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 42, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.violet } });
  },
});
