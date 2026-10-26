// Explainer for politics-israel-electoral-threshold: Israel elects its 120-seat Knesset as one nationwide
// constituency, and parties under 3.25% get nothing. Look: warm Jerusalem-stone paper, deep blue ink, a
// 120-seat hemicycle; two example blocs in blue and gold, wasted votes in grey with a red line. Rubik for
// numbers and labels, Crimson Pro for captions.
//
// Computed here: the example parties (fictional, clearly labelled) are shared with the post's lab; seats are
// shared out by D'Hondt (largest averages) among the lists over the threshold. With the line at 3.25% the
// blue bloc, with fewer votes, gets 63 seats; the hemicycle positions are computed row by row.
// Facts: Wikipedia, "Elections in Israel": 120 seats, nationwide closed-list proportional representation, a
// 3.25% threshold since 2014 (1% until 1988, then 1.5%, 2% from 2003), D'Hondt for leftover seats with
// surplus-vote agreements, no party has ever won a majority alone, a coalition needs 61, the president picks
// the member most likely to form a government, who has up to 42 days. Israel Democracy Institute, "The 2022
// Elections: Results Analysis" (7 November 2022): some 300,000 votes went to lists under the threshold, mainly
// Meretz and Balad; the Netanyahu bloc won 64 seats with about 30,000 more votes than the other bloc, less
// than the equivalent of one seat. Times of Israel (October 2026): 38 parties are running.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the Knesset's 120 seats, one constituency.
//  B  9.0–23.8  Example parties against the 3.25% line; wasted votes; seats to the rest.
//  C 23.8–37.6  2022: about 300,000 votes wasted; 64 seats from a 30,000-vote lead.
//  D 37.6–51.4  Coalitions: no party has won a majority; 61 seats; up to 42 days.
//  E 51.4–60.0  2026: 38 parties; the smallest may decide.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  stone: '#efe7d6', stone2: '#e4d9c3', ink: '#1d3557', soft: 'rgba(29,53,87,0.68)', faint: 'rgba(29,53,87,0.3)',
  blue: '#2c6fbb', gold: '#d39b22', grey: '#a8a397', red: '#c8453b', seat: 'rgba(29,53,87,0.16)',
};
const NUM = 'Rubik', SERIF = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- example parties (fictional) and D'Hondt ----------
const PARTIES = [
  ['B1', 'blue', 20.0], ['G1', 'gold', 20.0], ['B2', 'blue', 12.0], ['G2', 'gold', 12.0], ['B3', 'blue', 8.0], ['G3', 'gold', 7.0],
  ['B4', 'blue', 5.0], ['G4', 'gold', 4.4], ['B5', 'blue', 3.6], ['G5', 'gold', 3.0], ['G6', 'gold', 2.8], ['G7', 'gold', 2.2],
].map(([name, bloc, share]) => ({ name, bloc, share }));
function dhondt(threshold, seats = 120) {
  const in_ = PARTIES.filter((p) => p.share >= threshold);
  const got = new Map(in_.map((p) => [p.name, 0]));
  for (let s = 0; s < seats; s++) {
    let best = null, bestQ = -1;
    for (const p of in_) { const q = p.share / (got.get(p.name) + 1); if (q > bestQ) { bestQ = q; best = p; } }
    got.set(best.name, got.get(best.name) + 1);
  }
  const bloc = (b) => in_.filter((p) => p.bloc === b).reduce((s, p) => s + got.get(p.name), 0);
  return { got, blue: bloc('blue'), gold: bloc('gold'), wasted: PARTIES.filter((p) => p.share < threshold).reduce((s, p) => s + p.share, 0) };
}
const AT = dhondt(3.25); // blue 63, gold 57, 8.0% wasted
const VOTES = { blue: PARTIES.filter((p) => p.bloc === 'blue').reduce((s, p) => s + p.share, 0), gold: PARTIES.filter((p) => p.bloc === 'gold').reduce((s, p) => s + p.share, 0) };

// ---------- the hemicycle: 120 seats in rows, sorted left to right ----------
const HEMI = (() => {
  const rows = 7, r0 = 120, dr = 34, total = 120, seats = [];
  const radii = Array.from({ length: rows }, (_, i) => r0 + i * dr), sum = radii.reduce((a, b) => a + b, 0);
  let left = total;
  radii.forEach((r, i) => {
    const n = i === rows - 1 ? left : Math.round((total * r) / sum);
    left -= n;
    for (let j = 0; j < n; j++) { const a = Math.PI - (Math.PI * (j + 0.5)) / n; seats.push({ r, a }); }
  });
  return seats.sort((p, q) => q.a - p.a);
})();
function hemicycle(cx, cy, s, colorOf, a = 1, grow = 1) {
  A(a, () => HEMI.forEach((p, i) => {
    const g = eout(clamp(grow * 1.5 - i / 120));
    if (g <= 0) return;
    ctx.fillStyle = colorOf(i);
    ctx.beginPath(); ctx.arc(cx + Math.cos(p.a) * p.r * s, cy - Math.sin(p.a) * p.r * s, 11 * s * g, 0, Math.PI * 2); ctx.fill();
  }));
}

// ---------- timeline ----------
const T = { A: [0, 9.0], B: [9.0, 23.8], C: [23.8, 37.6], D: [37.6, 51.4], E: [51.4, 60] };
const CUES = [
  [0.4, 4.6, 'On 27 October 2026, Israel elects its 120-seat parliament, the *Knesset*.'],
  [4.8, 9.0, 'The whole country votes as *one constituency*, for party lists.'],
  [9.2, 13.6, 'Seats follow vote shares: roughly *0.83%* of the votes for each seat.'],
  [13.8, 18.2, 'But a list needs at least *3.25%* to win any seats at all.'],
  [18.4, 23.6, `Votes for lists below the line are *wasted*: here ${AT.wasted.toFixed(0)}%. The seats go to the rest.`],
  [23.8, 28.2, 'In 2022 two lists fell just short, and about *300,000 votes* won no seats.'],
  [28.4, 33.0, 'The bloc behind Benjamin Netanyahu won *64 seats*, with a lead of about 30,000 votes.'],
  [33.2, 37.6, 'That’s less than one seat’s worth of votes, turned into a clear majority.'],
  [37.8, 42.2, 'No party has ever won a majority alone, so every government is a *coalition*.'],
  [42.4, 46.8, 'It needs *61 seats*: half of the Knesset, plus one.'],
  [47.0, 51.4, 'The president asks the member most likely to build one; they get up to *42 days*.'],
  [51.6, 55.8, 'This year *38 parties* are running.'],
  [56.0, 60.0, 'Lists hovering near 3.25% could decide which side reaches 61.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.stone); lg.addColorStop(1, C.stone2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 31; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // limestone: soft blotches and specks
  for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, rad = 40 + r() * 140; const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, `rgba(190,170,130,${0.04 + r() * 0.05})`); rg.addColorStop(1, 'rgba(190,170,130,0)'); g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,70,40,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 1.5, 1 + r() * 1.5); }
}

// ---------- scenes ----------
const CX = W / 2, CY = 560;
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    hemicycle(CX, CY, 1.08, () => C.ink, 1, seg(t, 0.2, 2.6));
    A(eout(seg(t, 1.6, 2.4)), () => {
      font(800, 96); text('120', CX, CY - 40, { align: 'center', base: 'middle' });
      font(500, 28); text('seats', CX, CY + 16, { color: C.soft, align: 'center', base: 'middle' });
    });
    A(eout(seg(t, 4.8, 5.6)), () => {
      font(700, 30); text('One national list vote', CX, 160, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}

function sceneBars(t) {
  const a = span(t, 9.2, 23.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const L = 120, R = 790, base = 640, top = 200, max = 24;
    const Y = (v) => base - (v / max) * (base - top), bw = ((R - L) / PARTIES.length) * 0.7;
    font(700, 26); text('Example lists, share of the vote', L - 30, 150, { base: 'middle' });
    font(500, 20); for (const v of [0, 5, 10, 15, 20]) text(`${v}%`, L - 14, Y(v), { color: C.soft, align: 'right', base: 'middle' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5;
    for (const v of [5, 10, 15, 20]) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); }
    const thr = eout(seg(t, 13.8, 14.6));
    PARTIES.forEach((p, i) => {
      const x = L + ((R - L) / PARTIES.length) * (i + 0.5), g = eout(seg(t, 9.4 + i * 0.12, 10.0 + i * 0.12));
      const below = p.share < 3.25, grey = below ? seg(t, 18.4, 19.2) : 0;
      ctx.fillStyle = grey > 0 ? (grey > 0.5 ? C.grey : (p.bloc === 'blue' ? C.blue : C.gold)) : p.bloc === 'blue' ? C.blue : C.gold;
      k.rrect(x - bw / 2, Y(p.share * g), bw, base - Y(p.share * g), 4); ctx.fill();
      font(600, 18); text(p.name, x, base + 22, { color: C.soft, align: 'center', base: 'middle' });
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(L, base); ctx.lineTo(R, base); ctx.stroke();
    A(thr, () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(L, Y(3.25)); ctx.lineTo(lerp(L, R, thr), Y(3.25)); ctx.stroke(); ctx.setLineDash([]);
      font(800, 28); text('3.25%', R, Y(3.25) - 26, { color: C.red, align: 'right', base: 'middle' });
    });
    A(span(t, 9.4, 13.6), () => { font(600, 24); text('1 seat ≈ 0.83% of the votes', R, 200, { color: C.ink, align: 'right', base: 'middle' }); });
    A(span(t, 18.6, 23.6), () => {
      font(800, 30); text(`blue ${AT.blue} seats · gold ${AT.gold} seats`, CX, 720, { color: C.ink, align: 'center', base: 'middle' });
      font(500, 22); text(`from ${VOTES.blue.toFixed(1)}% and ${VOTES.gold.toFixed(1)}% of the votes`, CX, 756, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

function scene2022(t) {
  const a = span(t, 23.8, 37.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(800, 44); text('2022', CX, 150, { color: C.ink, align: 'center', base: 'middle' });
    // wasted votes as a heap of ballots
    A(span(t, 24.0, 28.4), () => {
      font(800, 84); text('≈300,000', CX, 330, { color: C.grey, align: 'center', base: 'middle' });
      font(600, 28); text('votes for lists under 3.25%', CX, 400, { color: C.soft, align: 'center', base: 'middle' });
      for (let i = 0; i < 30; i++) {
        const x = 200 + ((i * 97) % 470), y = 480 + ((i * 53) % 120), g = eout(seg(t, 24.4 + i * 0.04, 24.8 + i * 0.04));
        ctx.save(); ctx.translate(x, y); ctx.rotate(((i * 37) % 60 - 30) / 60); ctx.globalAlpha *= g;
        ctx.fillStyle = '#f9f6ee'; ctx.fillRect(-28, -18, 56, 36); ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.strokeRect(-28, -18, 56, 36);
        ctx.restore();
      }
    });
    // the seats: 64 to 56
    const v = span(t, 28.4, 37.8, 0.4, 0.3);
    if (v > 0) {
      hemicycle(CX, 560, 1.0, (i) => (i < 64 ? C.blue : C.ink), v, seg(t, 28.4, 30.4));
      A(v, () => {
        font(800, 64); text('64', CX - 120, 600, { color: C.blue, align: 'center', base: 'middle' });
        text('56', CX + 120, 600, { color: C.ink, align: 'center', base: 'middle' });
        font(500, 22); text('Netanyahu bloc', CX - 120, 646, { color: C.soft, align: 'center', base: 'middle' });
        text('the other lists', CX + 120, 646, { color: C.soft, align: 'center', base: 'middle' });
      });
      A(span(t, 33.2, 37.6), () => {
        font(700, 28); text('a lead of ≈30,000 votes: under one seat’s worth', CX, 718, { color: C.red, align: 'center', base: 'middle' });
      });
    }
  });
}

function sceneCoalition(t) {
  const a = span(t, 37.8, 51.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // three example partners joining until they pass 61
    const parts = [[30, C.blue, 'Party 1'], [18, '#5b8fd0', 'Party 2'], [9, '#8fb1dd', 'Party 3'], [6, '#b7cde9', 'Party 4']];
    let acc = 0;
    const join = [38.2, 39.4, 40.6, 43.0];
    hemicycle(CX, 560, 1.08, (i) => {
      let s = 0;
      for (let p = 0; p < parts.length; p++) { s += parts[p][0]; if (i < s) return t >= join[p] ? parts[p][1] : C.seat; }
      return C.seat;
    }, 1, 1);
    parts.forEach(([n, col], p) => { if (t >= join[p]) acc += n; });
    font(800, 92); text(`${acc}`, CX, 520, { color: acc >= 61 ? C.blue : C.ink, align: 'center', base: 'middle' });
    font(500, 26); text('seats in the coalition', CX, 578, { color: C.soft, align: 'center', base: 'middle' });
    A(eout(seg(t, 42.4, 43.2)), () => {
      // the 61st seat marker
      const p = HEMI[60], x = CX + Math.cos(p.a) * p.r * 1.08, y = 560 - Math.sin(p.a) * p.r * 1.08;
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.stroke();
      font(800, 26); text('61', x, y - 40, { color: C.red, align: 'center', base: 'middle' });
    });
    A(span(t, 47.0, 51.4), () => {
      font(800, 60); text('42 days', CX, 680, { color: C.ink, align: 'center', base: 'middle' });
      font(500, 22); text('at most, to form a government', CX, 726, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

function scene2026(t) {
  const a = eout(seg(t, 51.6, 52.4));
  if (a <= 0) return;
  A(a, () => {
    font(800, 120); text('38', CX, 250, { color: C.ink, align: 'center', base: 'middle' });
    font(600, 30); text('lists on the 2026 ballot', CX, 330, { color: C.soft, align: 'center', base: 'middle' });
    // ballot slips: in Israel voters drop a slip with a party's letters into an envelope
    for (let i = 0; i < 38; i++) {
      const col = i % 10, row = Math.floor(i / 10), x = 150 + col * 62, y = 420 + row * 78, g = eout(seg(t, 52.0 + i * 0.03, 52.4 + i * 0.03));
      A(g, () => {
        ctx.fillStyle = '#fbf8f0'; k.rrect(x - 24, y - 30, 48, 60, 5); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.soft; ctx.fillRect(x - 14, y - 6, 28, 5); ctx.fillRect(x - 10, y + 6, 20, 4);
      });
    }
    A(span(t, 56.0, 60.2), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(120, 735); ctx.lineTo(744, 735); ctx.stroke(); ctx.setLineDash([]);
      font(800, 26); text('3.25%', 744, 708, { color: C.red, align: 'right', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneBars(t);
    scene2022(t);
    sceneCoalition(t);
    scene2026(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.blue, '~': C.gold } });
  },
});
