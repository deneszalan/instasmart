// Explainer for politics-curia-vote-by-walking (Roma): in the Curia, Rome's Senate house in the Forum, senators decided
// important questions by walking to one side of the hall (discessio), and Pliny the Younger's letter about a vote
// with three proposals shows why it mattered who stood with whom. Look: the brick Curia Julia, then its hall from
// above with the opus sectile floor in green and red porphyry and yellow marble; senators as white dots with a purple
// stripe. Cinzel for Latin and labels, Gentium Book Plus for captions.
//
// Facts:
// - Wikipedia, "Curia Julia": begun by Julius Caesar (44 BC), finished by Augustus in 29 BC; heavily damaged by fire in
//   AD 283 and rebuilt by Diocletian (284–305), whose building stands today; it survives because it became the church
//   of Sant'Adriano; the hall is 25.2 m by 17.61 m; floor of opus sectile, rosettes and cornucopias in green and red
//   porphyry on yellow and purple marble.
// - Grout, Encyclopaedia Romana, "Curia": converted to a church in AD 630; on either side three broad steps, which
//   could accommodate about three hundred senators, with two low steps at the far end as a dais for the presiding
//   magistrate.
// - Smith, Dictionary of Greek and Roman Antiquities (1875), "Senatus": 300 senators in the Republic; after Sulla
//   between five and six hundred (Cicero, Ad Atticum 1.14); Julius Caesar raised the number to 900 (Dio 43.47;
//   Suetonius, Caesar 80); the majority was found by counting (numeratio) or by discessio, the members voting the
//   same way joining together, which became the usual way. Wikipedia, "Senate of the Roman Empire": Augustus cut the
//   Senate from 900 to 600. Wikipedia, "Senate of the Roman Republic": minor matters by voice or show of hands,
//   important ones by a physical division of the house, senators taking a place on either side of the chamber.
// - Pliny the Younger, Letters 8.14 (Latin text, thelatinlibrary.com), about AD 105: the case of the freedmen of the
//   consul Afranius Dexter, found dead; one senator (Pliny) proposed acquittal, one banishment to an island, one
//   death; the death and banishment backers sat together; Pliny demanded that the three be counted separately; the
//   rule for a division reads "Qui haec censetis, in hanc partem, qui alia omnia, in illam partem ite qua sentitis"
//   ("you who think this, to this side; you who think anything else, go to the side you agree with"); "to this side"
//   means where the proposer sits; the proposer of death, fearing that acquittal would win if the proposals were
//   counted apart ("far more were for this one than for either of the other two"), dropped his own proposal and
//   joined the banisher, and his followers went with him; "so three proposals became two", and the third "chose by
//   which it would be beaten". Who won in the end is read differently by scholars, so it is not said here.
// The group sizes in the vote are an illustration: Pliny gives no numbers.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The Curia Julia's façade in the Forum; dates; a church from AD 630.
//  B 14.2–23.2  The hall from above: steps for about 300; the Senate's size over time.
//  C 23.4–37.0  A division: senators walk to the proposer's side.
//  D 37.2–65.0  Pliny's case: three proposals, three groups, the death party crosses over.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#2a1218', bg2: '#4a1f27', ink: '#f4ede0', soft: 'rgba(244,237,224,0.72)', faint: 'rgba(244,237,224,0.22)',
  brick: '#b4613f', brick2: '#8f4a30', stucco: '#d9c9ad', bronze: '#6b5a3a',
  marble: '#ece4d2', porphyry: '#8e2b2b', green: '#3f8f6a', yellow: '#d8b25a', purple: '#7a4a7e',
  acquit: '#5fc08f', banish: '#e3b84f', death: '#e2574c',
};
const CAPS = 'Cinzel', SERIF = 'Gentium Book Plus';

let k, ctx;
const font = (w, s, f = CAPS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const HALL_L = 25.2, HALL_W = 17.61, SEATS = 300;
const SIZES = [['REPUBLIC', 300], ['AFTER SULLA', 600], ['CAESAR', 900], ['AUGUSTUS', 600]];

// ---------- A: the façade ----------
function facade(t, a) {
  A(a, () => {
    const x0 = 232, x1 = 632, base = 690, top = 250, peak = 168;
    // ground
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(60, base, W - 120, 8);
    // buttresses
    ctx.fillStyle = C.brick2; ctx.fillRect(x0 - 26, top + 20, 30, base - top - 20); ctx.fillRect(x1 - 4, top + 20, 30, base - top - 20);
    // the brick wall with the gable
    ctx.fillStyle = C.brick; ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0, top); ctx.lineTo(CX, peak); ctx.lineTo(x1, top); ctx.lineTo(x1, base); ctx.closePath(); ctx.fill();
    // brick courses
    ctx.strokeStyle = 'rgba(80,30,15,0.18)'; ctx.lineWidth = 1;
    for (let y = top; y < base; y += 9) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    // cornice and gable moulding
    ctx.strokeStyle = C.stucco; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x0 - 14, top + 4); ctx.lineTo(CX, peak - 6); ctx.lineTo(x1 + 14, top + 4); ctx.stroke();
    ctx.fillStyle = C.stucco; ctx.fillRect(x0 - 14, top + 4, x1 - x0 + 28, 10);
    // three windows
    for (let i = 0; i < 3; i++) {
      const wx = CX - 112 + i * 112;
      ctx.beginPath(); ctx.moveTo(wx - 40, 448); ctx.lineTo(wx - 40, 352); ctx.arc(wx, 352, 40, Math.PI, 0); ctx.lineTo(wx + 40, 448); ctx.closePath();
      ctx.fillStyle = '#3d4a52'; ctx.fill(); ctx.strokeStyle = C.stucco; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = 'rgba(236,228,210,0.35)'; ctx.lineWidth = 1.5;
      for (let g = -30; g <= 30; g += 15) { ctx.beginPath(); ctx.moveTo(wx + g, 318); ctx.lineTo(wx + g, 448); ctx.stroke(); }
      for (let g = 360; g <= 440; g += 20) { ctx.beginPath(); ctx.moveTo(wx - 40, g); ctx.lineTo(wx + 40, g); ctx.stroke(); }
    }
    // the door at the top of the steps
    ctx.fillStyle = '#2f4a3c'; ctx.fillRect(CX - 44, 530, 88, 140);
    ctx.strokeStyle = C.stucco; ctx.lineWidth = 7; ctx.strokeRect(CX - 51, 523, 102, 147);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX, 530); ctx.lineTo(CX, 670); ctx.stroke();
    for (let s = 0; s < 4; s++) { ctx.fillStyle = s % 2 ? C.stucco : '#cbbb9d'; ctx.fillRect(CX - 70 - s * 16, 670 + s * 5, 140 + s * 32, 6); }
  });
}
function sceneFacade(t) {
  A(span(t, 0, 14.2, 0.4, 0.4), () => {
    font(700, 24); text('FORUM ROMANUM', CX, 92, { align: 'center', base: 'middle', color: C.soft, spacing: '4px' });
    facade(t, eout(seg(t, 0.2, 1.4)));
    A(seg(t, 1.4, 2.2), () => { font(800, 38); text('CVRIA IVLIA', CX, 140, { align: 'center', base: 'middle', color: C.ink, spacing: '6px' }); });
    // dates
    const dates = [[5.2, '44 BC', 'begun by Julius Caesar'], [6.2, '29 BC', 'finished by Augustus'], [7.4, 'AD 283', 'fire; Diocletian rebuilds'], [10.0, 'AD 630', 'becomes a church']];
    dates.forEach(([t0, d, s], i) => A(seg(t, t0, t0 + 0.6), () => {
      const y = 728 + (i % 2) * 42, x = i < 2 ? 64 : 456;
      font(700, 24); text(d, x, y, { base: 'middle', color: C.yellow });
      font(400, 24, SERIF); text(s, x + 104, y + 1, { base: 'middle', color: C.soft });
    }));
  });
}

// ---------- B: the hall from above ----------
const HALL = { x0: 222, y0: 120, s: 23.8 }; // px per metre: 25.2 m long (down the frame), 17.61 m wide
const HX = (m) => HALL.x0 + m * HALL.s, HY = (m) => HALL.y0 + m * HALL.s;
const HW = HALL_W * HALL.s, HL = HALL_L * HALL.s;
const STEP_W = 3.2; // metres of steps along each long side (schematic)
let floorCache = null;
function floor() {
  if (!floorCache) {
    floorCache = document.createElement('canvas'); floorCache.width = Math.ceil(HW); floorCache.height = Math.ceil(HL);
    const g = floorCache.getContext('2d');
    g.fillStyle = '#d6ccb8'; g.fillRect(0, 0, HW, HL);
    // the central floor between the steps: squares with rosettes and rectangles with cornucopias, simplified
    const fx = STEP_W * HALL.s, fw = HW - 2 * fx, cell = fw / 4;
    for (let r = 0; r * cell < HL - 3 * HALL.s; r++) for (let c = 0; c < 4; c++) {
      const x = fx + c * cell, y = 30 + r * cell;
      g.fillStyle = (r + c) % 2 ? '#b7a27c' : '#6f5a72'; g.fillRect(x + 3, y + 3, cell - 6, cell - 6);
      g.fillStyle = (r + c) % 2 ? '#5f7f6d' : '#7d4b4b';
      g.beginPath(); g.arc(x + cell / 2, y + cell / 2, cell * 0.26, 0, TAU); g.fill();
      g.fillStyle = '#d6ccb8'; g.beginPath(); g.arc(x + cell / 2, y + cell / 2, cell * 0.12, 0, TAU); g.fill();
    }
    // the steps on either side
    for (const side of [0, 1]) for (let s = 0; s < 3; s++) {
      const w = (STEP_W * HALL.s) / 3, x = side ? HW - (s + 1) * w : s * w;
      g.fillStyle = s % 2 ? '#5b4a44' : '#66544c'; g.fillRect(x, 0, w, HL - 3 * HALL.s);
      g.strokeStyle = 'rgba(60,40,30,0.25)'; g.lineWidth = 1; g.strokeRect(x, 0, w, HL - 3 * HALL.s);
    }
    // the dais at the far end (top)
    g.fillStyle = '#8a7865'; g.fillRect(fx, 0, fw, 1.6 * HALL.s);
  }
  return floorCache;
}
function hall(a, { dims = 0 } = {}) {
  A(a, () => {
    ctx.fillStyle = C.brick2; ctx.fillRect(HX(-0.6), HY(-0.6), HW + 1.2 * HALL.s, HL + 1.2 * HALL.s);
    ctx.drawImage(floor(), HX(0), HY(0));
    // the door at the bottom
    ctx.fillStyle = C.bronze; ctx.fillRect(CX - 40, HY(HALL_L) - 2, 80, 0.8 * HALL.s);
    A(dims, () => {
      font(700, 26, SERIF);
      text(`${HALL_W} m`, CX, HY(0) - 34, { align: 'center', base: 'middle', color: C.ink });
      ctx.save(); ctx.translate(HX(HALL_W) + 44, HY(HALL_L / 2)); ctx.rotate(Math.PI / 2);
      text(`${HALL_L} m`, 0, 0, { align: 'center', base: 'middle', color: C.ink }); ctx.restore();
    });
  });
}
// 300 seats: 5 rows of 30 on each side
const SEAT_POS = (() => {
  const out = [];
  for (const side of [0, 1]) for (let row = 0; row < 5; row++) for (let i = 0; i < 30; i++) {
    const x = side ? HALL_W - 0.35 - row * 0.62 : 0.35 + row * 0.62, y = 1.9 + i * ((HALL_L - 5.4) / 29);
    out.push([x, y, side]);
  }
  return out;
})();
function senator(x, y, col = C.ink, r = 5.6) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(30,12,16,0.75)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = C.purple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - r * 0.4, y - r * 0.9); ctx.lineTo(x - r * 0.4, y + r * 0.9); ctx.stroke();
}
function sceneHall(t) {
  A(span(t, 14.0, 23.4, 0.5, 0.4), () => {
    hall(1, { dims: seg(t, 14.4, 15.2) });
    const fill = seg(t, 15.6, 17.8);
    SEAT_POS.forEach(([x, y], i) => { if (i / SEAT_POS.length < fill) senator(HX(x), HY(y)); });
    A(seg(t, 16.6, 17.4) * (1 - seg(t, 18.4, 18.8)), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.88)'; k.rrect(CX - 150, HY(10) - 50, 300, 100, 14); ctx.fill();
      font(800, 46); text(`≈ ${SEATS}`, CX, HY(10) - 8, { align: 'center', base: 'middle', color: C.ink });
      font(400, 24, SERIF); text('places on the steps', CX, HY(10) + 30, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 15.2, 16.0) * (1 - seg(t, 18.4, 18.8)), () => { font(600, 22); text('DAIS', CX, HY(0.8), { align: 'center', base: 'middle', color: C.ink }); });
  });
  // the Senate's size against the seats
  A(span(t, 18.6, 23.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.bg1; ctx.fillRect(0, 0, W, 800);
    font(700, 24); text('MEMBERS OF THE SENATE', CX, 120, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const L = 250, R = 770, max = 900, y0 = 200;
    SIZES.forEach(([name, v], i) => {
      const g = eio(seg(t, 18.9 + i * 0.5, 19.7 + i * 0.5)), y = y0 + i * 110;
      font(700, 24); text(name, L - 20, y + 30, { align: 'right', base: 'middle', color: C.ink });
      ctx.fillStyle = name === 'CAESAR' ? C.death : C.yellow; ctx.fillRect(L, y, (R - L) * (v / max) * g, 60);
      A(g, () => { font(800, 30); text(name === 'AFTER SULLA' ? '500–600' : String(v), L + (R - L) * (v / max) * g + 12, y + 31, { base: 'middle', color: C.ink }); });
    });
    A(seg(t, 21.0, 21.6), () => {
      const x = L + (R - L) * (SEATS / max);
      ctx.strokeStyle = C.acquit; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(x, 176); ctx.lineTo(x, 640); ctx.stroke(); ctx.setLineDash([]);
      font(700, 22); text('PLACES IN THE CURIA ≈ 300', x - 10, 668, { base: 'middle', color: C.acquit });
    });
  });
}

// ---------- C: a division ----------
/** Where a senator ends up: on the left or right steps, packed from the top. */
function sidePos(side, n) {
  const row = n % 5, i = Math.floor(n / 5);
  const x = side ? HALL_W - 0.35 - row * 0.62 : 0.35 + row * 0.62, y = 1.9 + i * 0.55;
  return [x, y];
}
// Each senator's vote in the illustration of a simple division: 180 for, 120 against.
const VOTE = SEAT_POS.map((_, i) => ((i * 7919) % 300) < 180);
function sceneDivision(t) {
  A(span(t, 23.2, 37.2, 0.5, 0.4), () => {
    hall(1);
    // the presiding magistrate on the dais, the proposer on the left
    senator(CX, HY(0.8), C.yellow, 8);
    const walk = eio(seg(t, 32.8, 35.6));
    let nFor = 0, nAgainst = 0;
    SEAT_POS.forEach(([x, y], i) => {
      const side = VOTE[i] ? 0 : 1, n = side ? nAgainst++ : nFor++;
      const [tx, ty] = sidePos(side, n);
      // cross through the middle of the floor
      const mx = lerp(x, tx, walk), my = lerp(y, ty, walk) + Math.sin(walk * Math.PI) * 0.6;
      senator(HX(mx), HY(my), walk > 0.05 ? (side ? '#9fb6c9' : C.yellow) : C.ink);
    });
    A(seg(t, 23.6, 24.4) * (1 - seg(t, 27.6, 28.0)), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.9)'; k.rrect(CX - 210, HY(11) - 52, 420, 104, 14); ctx.fill();
      font(600, 24, SERIF); text('small matters: voice or hands', CX, HY(11) - 16, { align: 'center', base: 'middle', color: C.soft });
      font(700, 28); text('BIG ONES: WALK', CX, HY(11) + 24, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    });
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 32.4, 32.8)), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.92)'; k.rrect(60, HY(7.5) - 92, W - 120, 184, 16); ctx.fill();
      font(700, 26); text('QVI HAEC CENSETIS, IN HANC PARTEM,', CX, HY(7.5) - 52, { align: 'center', base: 'middle', color: C.yellow, spacing: '1px' });
      text('QVI ALIA OMNIA, IN ILLAM PARTEM', CX, HY(7.5) - 12, { align: 'center', base: 'middle', color: C.yellow, spacing: '1px' });
      text('ITE QVA SENTITIS', CX, HY(7.5) + 28, { align: 'center', base: 'middle', color: C.yellow, spacing: '1px' });
      font(400, 22, SERIF); text('the rule, as quoted by Pliny the Younger', CX, HY(7.5) + 66, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 33.0, 33.6), () => {
      font(700, 22); text('PROPOSER', HX(2.2), HY(HALL_L) + 34, { align: 'center', base: 'middle', color: C.ink });
      text('ANYTHING ELSE', HX(HALL_W - 2.2), HY(HALL_L) + 34, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 35.4, 36.0), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.9)'; k.rrect(CX - 150, HY(14) - 40, 300, 80, 14); ctx.fill();
      font(800, 34); text('DISCESSIO', CX, HY(14), { align: 'center', base: 'middle', color: C.ink, spacing: '4px' });
    });
  });
}

// ---------- D: Pliny's three proposals ----------
// Illustrative groups (Pliny gives no numbers): acquittal larger than either other group alone, smaller than both.
const GROUP = SEAT_POS.map((_, i) => { const r = (i * 7919) % 300; return r < 120 ? 'acquit' : r < 210 ? 'banish' : 'death'; });
const COUNT = { acquit: 120, banish: 90, death: 90 };
const COL = { acquit: C.acquit, banish: C.banish, death: C.death };
/** Positions in each phase: 0 seated, 1 two sides (death with banishment), 2 three groups, 3 death crosses to banishment. */
function groupPos(g, n, phase) {
  if (phase === 0) return null;
  if (g === 'acquit') return sidePos(0, n);
  if (phase === 2 && g === 'death') { // a third group, on the floor
    const row = n % 6, i = Math.floor(n / 6);
    return [5.6 + row * 1.15, 6.6 + i * 0.75];
  }
  const k2 = g === 'banish' ? n : COUNT.banish + n;
  return sidePos(1, k2);
}
function scenePliny(t) {
  A(span(t, 37.0, 65.4, 0.5, 0.0), () => {
    hall(1);
    senator(CX, HY(0.8), C.yellow, 8);
    // phases: 41.8 three colours; 46.6 two sides; 51.2 three groups; 56.0 death crosses over
    const p1 = eio(seg(t, 46.8, 48.8)), p2 = eio(seg(t, 51.4, 53.4)), p3 = eio(seg(t, 56.0, 58.4));
    const colourOn = seg(t, 42.0, 43.0);
    const n = { acquit: 0, banish: 0, death: 0 };
    SEAT_POS.forEach(([x, y], i) => {
      const g = GROUP[i], m = n[g]++;
      const a = groupPos(g, m, 1), b = groupPos(g, m, 2), c = groupPos(g, m, 3);
      let px = lerp(x, a[0], p1), py = lerp(y, a[1], p1);
      px = lerp(px, b[0], p2); py = lerp(py, b[1], p2);
      px = lerp(px, c[0], p3); py = lerp(py, c[1], p3);
      const col = colourOn > 0.5 ? COL[g] : C.ink;
      senator(HX(px), HY(py), col);
    });
    A(seg(t, 37.4, 38.2) * (1 - seg(t, 41.4, 41.8)), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.9)'; k.rrect(CX - 200, HY(11) - 50, 400, 100, 14); ctx.fill();
      font(800, 30); text('AD 105 (ABOUT)', CX, HY(11) - 14, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(400, 24, SERIF); text('Pliny the Younger, Letters 8.14', CX, HY(11) + 24, { align: 'center', base: 'middle', color: C.soft });
    });
    // legend
    A(seg(t, 42.0, 42.8), () => {
      const items = [['ACQUIT', C.acquit], ['BANISH', C.banish], ['DEATH', C.death]];
      items.forEach(([s, col], i) => { const x = 140 + i * 230; senator(x, 86, col, 8); font(700, 24); text(s, x + 18, 87, { base: 'middle', color: col, spacing: '1px' }); });
      font(400, 20, SERIF); text('group sizes: an illustration, Pliny gives no numbers', CX, HY(HALL_L) + 34, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 49.0, 49.6) * (1 - seg(t, 51.0, 51.4)), () => labelBox('TWO SIDES', 'acquit against the rest'));
    A(seg(t, 53.4, 54.0) * (1 - seg(t, 55.8, 56.2)), () => labelBox('THREE GROUPS', 'each counted on its own'));
    A(seg(t, 58.6, 59.2) * (1 - seg(t, 60.0, 60.4)), () => labelBox('TWO AGAIN', 'death joins banishment'));
    A(seg(t, 60.6, 61.4), () => {
      ctx.fillStyle = 'rgba(42,18,24,0.9)'; k.rrect(60, HY(9.6) - 70, W - 120, 140, 16); ctx.fill();
      font(400, 26, SERIF);
      text('“The third proposal, since it could not beat', CX, HY(9.6) - 26, { align: 'center', base: 'middle', color: C.ink });
      text('both, chose by which it would be beaten.”', CX, HY(9.6) + 10, { align: 'center', base: 'middle', color: C.ink });
      font(600, 20); text('PLINY THE YOUNGER, LETTERS 8.14', CX, HY(9.6) + 48, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
    });
  });
}
function labelBox(a, b) {
  ctx.fillStyle = 'rgba(42,18,24,0.96)'; k.rrect(CX - 170, HY(17) - 44, 340, 88, 14); ctx.fill();
  font(800, 30); text(a, CX, HY(17) - 12, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
  font(400, 22, SERIF); text(b, CX, HY(17) + 22, { align: 'center', base: 'middle', color: C.soft });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,220,200,${r() * 0.05})`; g.beginPath(); g.arc(r() * W, r() * H, 0.6 + r() * 1.6, 0, TAU); g.fill(); }
}

const CUES = [
  [0.4, 4.8, 'In the Roman Forum stands the *Curia Julia*, the Senate house begun by Julius Caesar.'],
  [5.0, 9.4, 'Augustus finished it in 29 BC. After a fire in AD 283, Emperor Diocletian rebuilt it.'],
  [9.6, 14.0, 'It survived because in AD 630 it became a church. Inside is one hall, about ~25 × 18 m~.'],
  [14.2, 18.6, 'Three broad steps run along each side, with room for about *300* senators.'],
  [18.8, 23.2, 'The Senate had grown far bigger: some 600 after Sulla, *900* under Julius Caesar.'],
  [23.4, 27.8, 'Small matters went by voice or show of hands. Big ones, by *walking*.'],
  [28.0, 32.4, 'The rule: “You who think this, to this side; you who think ~anything else~, to that side.”'],
  [32.6, 37.0, 'Senators crossed the floor to sit with the proposer, or away: a *discessio*, a separation.'],
  [37.2, 41.6, 'About AD 105, the senator Pliny the Younger wrote about a vote with *three* proposals.'],
  [41.8, 46.2, 'Freedmen of the dead consul Afranius Dexter were tried: ~acquit~, *banish* or execute?'],
  [46.4, 50.8, 'Pliny proposed acquittal. Backers of death and of banishment sat together, against it.'],
  [51.0, 55.4, 'Pliny wanted three groups counted: acquittal outnumbered each of the others.'],
  [55.6, 60.0, 'So the proposer of death crossed to *banishment*, and his followers went too.'],
  [60.2, 64.6, 'With only two sides to a room, who stands with whom can decide the vote.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [CAPS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneFacade(t);
    sceneHall(t);
    sceneDivision(t);
    scenePliny(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.banish, '~': C.acquit } });
  },
});
