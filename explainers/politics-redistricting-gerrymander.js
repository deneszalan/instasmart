// Explainer for politics-redistricting-gerrymander: the same 50 voters can elect 5–0, 3–2 or 2–3 depending on
// where the district lines go. Look: a drafting table, pale mint paper with a fine grid, slate ink, voters as
// purple and orange counters (deliberately not party colours), thick ink district lines. Space Grotesk for
// labels and tallies, Source Sans 3 for captions.
//
// Everything is computed: the voters sit on a fixed 10 × 5 grid (30 purple, 20 orange, 4 orange in every row);
// each map gives every cell a district of 10 contiguous cells, and the winners are counted here. Rows: 6–4 for
// purple everywhere, 5–0. A fair-looking map: 3–2. Column pairs: orange packs three 6–4 wins, 3–2 to orange.
// Facts: Wikipedia, "Gerrymandering": the word appeared in the Boston Gazette on 26 March 1812, after Governor
// Elbridge Gerry signed a bill redrawing Massachusetts state senate districts; one district was likened to a
// salamander; packing concentrates a group's voters in few districts, cracking spreads them thin. US House
// districts are redrawn after each ten-yearly census. NBC News (Jane C. Timm, 3 June 2026): 10 states had adopted
// new congressional maps; up to 16 seats could shift to Republicans and 6 to Democrats; per state, up to: Texas 5,
// Florida 4, Ohio 2, North Carolina 1, Missouri 1, Tennessee 1, Louisiana 1, Alabama 1 (R); California 5, Utah 1
// (D). Missouri's map is blocked for 2026: SCOTUSblog (25 September 2026), for the third time the Supreme Court
// declined to allow Missouri to use its 2025 map; "the 2022 map—not the 2025 map—must be used in the 2026
// congressional election". AP (28 September 2026): new districts are used this year in Alabama, California,
// Florida, Louisiana, North Carolina, Ohio, Tennessee, Texas and Utah. Maryland's special session only sent a
// constitutional amendment to the November ballot; it approves no map and does not affect 2026 (Fox 5 DC and
// WTOP, 4 August 2026). So nine states vote with new mid-decade maps, and NBC's estimates for them add up to 15
// seats for Republicans (summed below) and 6 for Democrats.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: 50 voters, 5 seats; who wins depends on the lines.
//  B  9.0–32.0  Three maps: rows (5–0, cracking), a fair map (3–2), column pairs (packing, 2–3).
//  C 32.0–41.2  Elbridge Gerry and the 1812 salamander.
//  D 41.2–55.0  Maps are redrawn after each census; for 2026, nine states use maps redrawn mid-decade.
//  E 55.0–60.0  Same voters, different lines, different winners.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#e7f0ec', paper2: '#d9e6e1', grid: 'rgba(35,49,58,0.07)', ink: '#23313a', soft: 'rgba(35,49,58,0.66)',
  faint: 'rgba(35,49,58,0.3)', P: '#7b4fd1', O: '#ee8a1c', Psoft: 'rgba(123,79,209,0.18)', Osoft: 'rgba(238,138,28,0.2)',
  red: '#b8352e', blue: '#2f5fa7', gold: '#a97b12',
};
const LAB = 'Space Grotesk', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the voters and the maps ----------
const COLS = 10, ROWS = 5;
const ORANGE = new Set(['0,0', '4,0', '8,0', '9,0', '1,1', '3,1', '5,1', '8,1', '0,2', '1,2', '4,2', '9,2', '1,3', '4,3', '5,3', '8,3', '0,4', '5,4', '6,4', '9,4']);
const isO = (c, r) => ORANGE.has(`${c},${r}`);
const MAPS = {
  rows: (c, r) => r,
  fair: (c, r) => (c <= 1 ? 0 : c <= 3 ? 2 : c <= 5 ? 1 : (c >= 8 && r <= 1) || (c <= 7 && r <= 2) ? 3 : 4),
  pairs: (c, r) => Math.floor(c / 2),
};
function tally(map) {
  const n = Array.from({ length: 5 }, () => ({ P: 0, O: 0 }));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) n[map(c, r)][isO(c, r) ? 'O' : 'P']++;
  const win = n.map((d) => (d.P > d.O ? 'P' : 'O'));
  return { n, win, P: win.filter((w) => w === 'P').length, O: win.filter((w) => w === 'O').length };
}
const RES = { rows: tally(MAPS.rows), fair: tally(MAPS.fair), pairs: tally(MAPS.pairs) }; // 5–0, 3–2, 2–3

// ---------- grid geometry ----------
const G = { x: 112, y: 236, cell: 64 };

// ---------- the states with new maps for 2026, with NBC News's top estimate of seats each could shift ----------
// (Missouri drew one too, but must use its 2022 map in 2026.)
const STATES = [
  ['TX', 'Texas', 'R', 5], ['FL', 'Florida', 'R', 4], ['OH', 'Ohio', 'R', 2], ['NC', 'North Carolina', 'R', 1],
  ['TN', 'Tennessee', 'R', 1], ['LA', 'Louisiana', 'R', 1], ['AL', 'Alabama', 'R', 1], ['CA', 'California', 'D', 5], ['UT', 'Utah', 'D', 1],
];
const SEATS = { R: 0, D: 0 };
for (const [, , side, n] of STATES) SEATS[side] += n; // 15 and 6
const NUMBER = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

// ---------- timeline ----------
const T = { A: [0, 9.0], B: [9.0, 32.0], C: [32.0, 41.2], D: [41.2, 55.0], E: [55.0, 60] };
const CUES = [
  [0.4, 4.6, 'Fifty voters: *30 purple* and ~20 orange~. Five districts, ten voters each.'],
  [4.8, 9.0, 'Who wins depends on where you ^draw the lines^.'],
  [9.2, 13.6, `Map 1: every district is 6 purple to 4 orange. *Purple wins ${RES.rows.P} to ${RES.rows.O}*.`],
  [13.8, 18.2, 'That’s ~cracking~: orange voters are spread so thin they win nothing.'],
  [18.4, 22.8, `Map 2: purple ${RES.fair.P}, orange ${RES.fair.O}, close to each side’s share of the votes.`],
  [23.0, 27.4, 'Map 3: purple voters are *packed* into two districts they win easily.'],
  [27.6, 32.0, `Orange wins the other three narrowly, and takes ~${RES.pairs.O} of 5 seats~ with 40% of the votes.`],
  [32.2, 36.6, 'This is a ^gerrymander^, after the Massachusetts governor Elbridge Gerry.'],
  [36.8, 41.2, 'In 1812 a newspaper likened a state senate district drawn under him to a ^salamander^.'],
  [41.4, 45.8, 'US House maps are normally redrawn once a decade, after each ^census^.'],
  [46.0, 50.4, `But for the 2026 midterms, ^${NUMBER[STATES.length]} states^ will use new maps drawn mid-decade.`],
  [50.6, 55.0, `NBC News estimates: up to ^${SEATS.R} seats^ could shift to Republicans, ^${SEATS.D}^ to Democrats.`],
  [55.2, 59.8, 'Same voters. Different lines. ^Different winners^.'],
];

// ---------- paper, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x < W; x += 16) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y < H; y += 16) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  g.strokeStyle = 'rgba(35,49,58,0.12)'; g.lineWidth = 1.5;
  for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y < H; y += 80) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  let s = 21; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(40,60,55,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- drawing the grid ----------
function voters(x0, y0, cell, a = 1, pop = 1) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c, p = eout(clamp(pop * 1.6 - i / 50));
    if (p <= 0) continue;
    const x = x0 + c * cell + cell / 2, y = y0 + r * cell + cell / 2;
    A(a, () => {
      ctx.fillStyle = isO(c, r) ? C.O : C.P;
      ctx.beginPath(); ctx.arc(x, y, cell * 0.3 * p, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    });
  }
}
/** District tints and borders for a map, at opacity a. */
function districts(map, x0, y0, cell, a, { tint = true, width = 5 } = {}) {
  if (a <= 0) return;
  const res = tally(map);
  A(a, () => {
    if (tint) for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = res.win[map(c, r)] === 'P' ? C.Psoft : C.Osoft;
      ctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const d = map(c, r), x = x0 + c * cell, y = y0 + r * cell;
      if (c === COLS - 1 || map(c + 1, r) !== d) { ctx.moveTo(x + cell, y); ctx.lineTo(x + cell, y + cell); }
      if (r === ROWS - 1 || map(c, r + 1) !== d) { ctx.moveTo(x, y + cell); ctx.lineTo(x + cell, y + cell); }
      if (c === 0) { ctx.moveTo(x, y); ctx.lineTo(x, y + cell); }
      if (r === 0) { ctx.moveTo(x, y); ctx.lineTo(x + cell, y); }
    }
    ctx.stroke();
  });
}
/** Five seat blocks, coloured by winner, under the grid. */
function seats(res, cx, y, a, size = 46) {
  A(a, () => {
    const order = [...res.win].sort((p, q) => (p === q ? 0 : p === 'P' ? -1 : 1));
    order.forEach((w, i) => {
      const x = cx + (i - 2) * (size + 14) - size / 2;
      ctx.fillStyle = w === 'P' ? C.P : C.O; k.rrect(x, y - size / 2, size, size, 9); ctx.fill();
    });
    font(700, 30); text(`${res.P}`, cx - 3 * (size + 14) - 6, y, { color: C.P, align: 'right', base: 'middle' });
    text(`${res.O}`, cx + 3 * (size + 14) + 6, y, { color: C.O, base: 'middle' });
  });
}

// ---------- scenes ----------
function sceneMaps(t) {
  const a = 1 - seg(t, 31.8, 32.6);
  if (a <= 0) return;
  A(a, () => {
    font(700, 28);
    A(eout(seg(t, 0.2, 1.0)), () => text('50 voters · 5 seats', W / 2, 170, { align: 'center', base: 'middle' }));
    voters(G.x, G.y, G.cell, 1, seg(t, 0.4, 2.6));
    // which map is up: rows, then the fair map, then column pairs
    const show = [
      ['rows', 9.2, 18.2, 'Map 1'],
      ['fair', 18.4, 22.8, 'Map 2'],
      ['pairs', 23.0, 32.2, 'Map 3'],
    ];
    for (const [name, a0, a1, title] of show) {
      const v = span(t, a0, a1, 0.45, 0.3);
      if (v <= 0) continue;
      districts(MAPS[name], G.x, G.y, G.cell, v);
      A(v, () => { font(700, 30); text(title, G.x, 206, { color: C.gold, base: 'middle' }); });
      seats(RES[name], W / 2, 640, v * eout(seg(t, a0 + 0.6, a0 + 1.2)));
      // the per-district scores
      A(v * eout(seg(t, a0 + 1.4, a0 + 2.0)), () => {
        const res = RES[name];
        const centres = Array.from({ length: 5 }, () => ({ x: 0, y: 0, n: 0 }));
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const d = MAPS[name](c, r); centres[d].x += c; centres[d].y += r; centres[d].n++; }
        font(700, 22);
        res.n.forEach((d, i) => {
          const cx = G.x + (centres[i].x / centres[i].n + 0.5) * G.cell, cy = G.y + (centres[i].y / centres[i].n + 0.5) * G.cell;
          const s = `${d.P}–${d.O}`, w = ctx.measureText(s).width + 16;
          ctx.fillStyle = 'rgba(255,255,255,0.92)'; k.rrect(cx - w / 2, cy - 15, w, 30, 15); ctx.fill();
          text(s, cx, cy + 1, { color: res.win[i] === 'P' ? C.P : C.O, align: 'center', base: 'middle' });
        });
      });
    }
    // labels for cracking and packing
    A(span(t, 13.8, 18.2), () => { font(700, 34); text('cracked', W / 2, 726, { color: C.O, align: 'center', base: 'middle' }); });
    A(span(t, 23.0, 27.4), () => { font(700, 34); text('packed', W / 2, 726, { color: C.P, align: 'center', base: 'middle' }); });
    A(span(t, 27.6, 32.0), () => { font(700, 30); text('40% of votes → 60% of seats', W / 2, 726, { color: C.O, align: 'center', base: 'middle' }); });
  });
}

/** The 1812 cartoon's beast, drawn as a simple salamander. */
function salamander(cx, cy, s, a, draw) {
  A(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.08);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const path = new Path2D('M -230 10 C -200 -40 -140 -60 -80 -40 C -30 -25 20 -45 70 -40 C 120 -35 150 -10 175 -20 C 205 -32 235 -20 240 0 C 236 20 205 28 178 18 C 150 10 120 30 70 32 C 20 36 -30 20 -80 28 C -120 34 -150 60 -200 70 C -240 78 -290 60 -320 40');
    ctx.setLineDash([2400]); ctx.lineDashOffset = 2400 * (1 - draw);
    ctx.fillStyle = 'rgba(169,123,18,0.18)'; if (draw > 0.98) ctx.fill(path);
    ctx.stroke(path);
    ctx.setLineDash([]);
    if (draw > 0.6) A((draw - 0.6) / 0.4, () => {
      // legs and an eye
      for (const [x, y, dx, dy] of [[-60, -36, -20, -50], [60, -40, 20, -52], [-50, 28, -26, 56], [70, 32, 30, 56]]) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + dx * 1.4, y + dy * 1.1); ctx.stroke();
      }
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(210, -6, 6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  });
}
function sceneGerry(t) {
  const a = span(t, 32.2, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(800, 64, LAB); text('Gerry + salamander', W / 2, 220, { align: 'center', base: 'middle' });
    font(500, 26); text('= gerrymander', W / 2, 284, { color: C.soft, align: 'center', base: 'middle' });
    salamander(W / 2 + 40, 500, 1.2, 1, eio(seg(t, 36.8, 39.2)));
    A(eout(seg(t, 38.4, 39.2)), () => {
      font(600, 24); text('Boston Gazette, 26 March 1812', W / 2, 660, { color: C.gold, align: 'center', base: 'middle' });
    });
  });
}

function sceneCensus(t) {
  const a = span(t, 41.4, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a decade ruler: census years, with the usual redraws after them
    const y = 190, x0 = 130, x1 = 734;
    const X = (yr) => lerp(x0, x1, (yr - 2000) / 30);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    font(700, 24);
    for (const yr of [2000, 2010, 2020, 2030]) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(yr), y, 9, 0, Math.PI * 2); ctx.fill();
      text(String(yr), X(yr), y - 32, { align: 'center', base: 'middle' });
      if (yr < 2030) { font(500, 20); text('census', X(yr), y + 30, { color: C.soft, align: 'center', base: 'middle' }); font(700, 24); }
    }
    A(eout(seg(t, 46.0, 46.8)), () => {
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(X(2026), y, 12, 0, Math.PI * 2); ctx.fill();
      font(800, 26); text('2026', X(2026), y + 34, { color: C.red, align: 'center', base: 'middle' });
    });
    // the nine states with new maps, and a note on Missouri
    const groups = [['Could help Republicans', 'R', 300], ['Could help Democrats', 'D', 610]];
    for (const [title, side, gy] of groups) {
      const list = STATES.filter((s) => s[2] === side);
      A(eout(seg(t, 46.4 + (side === 'D' ? 0.8 : 0), 47.2 + (side === 'D' ? 0.8 : 0))), () => {
        font(700, 24); text(title, 130, gy, { color: side === 'R' ? C.red : C.blue, base: 'middle' });
      });
      list.forEach(([ab, name], i) => {
        const at = 46.6 + (side === 'D' ? 1.0 : 0) + i * 0.18;
        const p = back(clamp(seg(t, at, at + 0.4)));
        if (p <= 0) return;
        const col = i % 4, row = Math.floor(i / 4), bx = 130 + col * 152, by = gy + 34 + row * 96;
        A(clamp(p), () => {
          ctx.save(); ctx.translate(bx + 68, by + 38); ctx.scale(p, p);
          ctx.fillStyle = '#fbfdfc'; k.rrect(-68, -38, 136, 76, 12); ctx.fill();
          ctx.strokeStyle = side === 'R' ? C.red : C.blue; ctx.lineWidth = 3; ctx.stroke();
          font(800, 30); text(ab, 0, -8, { color: C.ink, align: 'center', base: 'middle' });
          font(500, 16); text(name, 0, 22, { color: C.soft, align: 'center', base: 'middle' });
          ctx.restore();
        });
      });
    }
    A(eout(seg(t, 48.0, 48.8)), () => {
      font(500, 22); text('Missouri redrew too, but must use its 2022 map', 130, 556, { color: C.soft, base: 'middle' });
    });
    A(eout(seg(t, 50.8, 51.6)), () => {
      font(800, 30); text(`up to ${SEATS.R} seats`, 738, 300, { color: C.red, align: 'right', base: 'middle' });
      text(`up to ${SEATS.D} seats`, 738, 610, { color: C.blue, align: 'right', base: 'middle' });
      font(500, 20); text('NBC News estimates', 738, 740, { color: C.soft, align: 'right', base: 'middle' });
    });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    const cell = 22, names = ['rows', 'fair', 'pairs'];
    names.forEach((name, i) => {
      const x0 = 70 + i * 250, y0 = 330;
      voters(x0, y0, cell, 1, 1);
      districts(MAPS[name], x0, y0, cell, 1, { width: 3 });
      font(800, 34); text(`${RES[name].P}–${RES[name].O}`, x0 + cell * 5, y0 + cell * 5 + 50, { color: RES[name].P > RES[name].O ? C.P : C.O, align: 'center', base: 'middle' });
    });
    font(700, 30); text('One set of voters, three maps', W / 2, 250, { align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [LAB, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMaps(t);
    sceneGerry(t);
    sceneCensus(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.P, '~': C.O, '^': C.gold } });
  },
});
