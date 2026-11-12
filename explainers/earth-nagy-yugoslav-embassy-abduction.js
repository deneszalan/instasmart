// Explainer for earth-nagy-yugoslav-embassy-abduction (Hungary 1956): Imre Nagy's refuge in the Yugoslav embassy from
// 4 November 1956, the negotiations between Belgrade and János Kádár, the written promise of 21 November, the bus of
// 22 November taken over by Soviet soldiers, and the group's deportation to Snagov in Romania, where Nagy was arrested
// on 14 April 1957. Look: a Budapest night in deep navy and sodium amber, the embassy as a lit facade, letters
// passing between Belgrade and Kádár, a plain bus and Soviet armoured cars as shapes, a schematic map to Romania, the
// villa by the lake at Snagov. Playfair Display for headings, IBM Plex Sans for labels and captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (1957), via mek.oszk.hu/01200/01274: para 291 (5.20 a.m.,
//   4 November: Nagy on Free Radio Kossuth: "Today at daybreak Soviet troops attacked our capital ... Our troops are
//   in combat. The Government is at its post."); para 77 (Kádár's government announced at 5.05 a.m., asking for
//   Soviet help); para 80 (Nagy left the Parliament Building at about 6 a.m. and sought asylum at the Yugoslav
//   embassy); para 630 (he had told his cabinet he was going to the Soviet embassy to protest; with him or soon after:
//   Géza Losonczy, Ferenc Donáth, others, Júlia Rajk, "together with fifteen other women and seventeen children");
//   para 631 (the Yugoslav ambassador agreed in principle to asylum on 3 November); paras 632–633 (talks from 11 to 22
//   November: Yugoslavia asked for a written guarantee that the group could go home freely, or go to Yugoslavia;
//   Kádár suggested Romania, refused; then demanded resignation, self-criticism, support for his government, refused);
//   para 634 (Yugoslav letter of 18 November; Kádár's written reply of 21 November: no sanctions "for their past
//   activities", the group to "proceed freely to their homes"); para 635 (22 November, 6.30 p.m.: a bus from Münnich;
//   Soviet military personnel insisted on boarding; two Yugoslav officials went along; at the Soviet Military Command
//   they were ordered off; the bus left under an escort of Soviet armoured cars); paras 636–639 (Yugoslavia called it
//   "a flagrant breach of the agreement"; the communiqué of 23 November said the group had gone to Romania at its own
//   request; the Committee found they were forced, and "when they were forced to board a plane, they did not even
//   know where they were being taken").
// - Lipcsey Ildikó, "Sznagovi feljegyzések", Múltunk 2005/2 (on Ileana Ioanid's edition of Nagy's Snagov notes):
//   in a letter of 11 January 1957 Nagy counted 40 people held, 27 adults and 13 children, under the Securitate's
//   watch; on 14 April 1957 an officer of the Hungarian interior ministry arrested him at Snagov.
// - OSA Archivum programme "Kegyetlenség és kegyelet": investigation, trial and executions in the greatest secrecy;
//   Nagy executed on 16 June 1958.
// Computed here: 18 days in the embassy (4 to 22 November).
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  4 November: the broadcast; to the Yugoslav embassy.
//  B  9.6–37.0  Who came; Kádár outside; the talks and the written promise of 21 November.
//  C 37.2–50.8  22 November: the bus, the soldiers, the Soviet headquarters, the armoured cars.
//  D 51.0–64.6  To Romania; Snagov; 14 April 1957.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0e1424', bg2: '#070a13', ink: '#eef0f4', soft: 'rgba(238,240,244,0.74)', faint: 'rgba(238,240,244,0.22)',
  amber: '#f2b33d', amberSoft: 'rgba(242,179,61,0.22)', teal: '#73c6cf', sov: '#9aa1ad', red: '#e2675b', paper: '#eee6d3', pInk: '#2a2620',
  river: '#1f3554', panel: 'rgba(4,6,12,0.86)',
};
const HEAD = 'Playfair Display', TXT = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const IN_EMBASSY = Math.round((Date.UTC(1956, 10, 22) - Date.UTC(1956, 10, 4)) / 864e5);
if (IN_EMBASSY !== 18) throw new Error('days');
const ADULTS = 27, CHILDREN = 13, WOMEN = 15, KIDS_IN = 17;

function tag(s, x, y, col, { size = 21, align = 'center' } = {}) {
  font(600, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 12 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 14 * s); ctx.quadraticCurveTo(x - 22 * s, y - 14 * s, x, y - 14 * s);
  ctx.quadraticCurveTo(x + 22 * s, y - 14 * s, x + 22 * s, y + 14 * s); ctx.closePath(); ctx.fill();
}
function soldier(x, y, s) {
  person(x, y, s, C.sov);
  ctx.fillStyle = '#6b717c'; ctx.beginPath(); ctx.ellipse(x, y - 38 * s, 15 * s, 8 * s, 0, Math.PI, 0); ctx.fill();
}
function bus(x, y, s, col = '#c9a64a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; k.rrect(-110, -50, 220, 80, 14); ctx.fill();
  ctx.fillStyle = 'rgba(14,20,36,0.85)'; for (let i = 0; i < 5; i++) k.rrect(-96 + i * 40, -40, 32, 28, 4), ctx.fill();
  ctx.fillStyle = '#1b1b1b'; for (const wx of [-70, 70]) { ctx.beginPath(); ctx.arc(wx, 32, 16, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function armoured(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.sov;
  ctx.beginPath(); ctx.moveTo(-60, 20); ctx.lineTo(-50, -14); ctx.lineTo(40, -14); ctx.lineTo(60, 20); ctx.closePath(); ctx.fill();
  ctx.fillRect(-14, -30, 30, 18);
  ctx.fillStyle = '#1b1b1b'; for (const wx of [-40, 0, 40]) { ctx.beginPath(); ctx.arc(wx, 24, 11, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function letter(x, y, w, h, title, lines, g, rot = 0) {
  A(g, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h);
    font(700, 20); text(title, -w / 2 + 22, -h / 2 + 32, { color: C.pInk });
    lines.forEach((s, i) => { font(500, 18); text(s, -w / 2 + 22, -h / 2 + 70 + i * 28, { color: 'rgba(42,38,32,0.8)' }); });
    ctx.restore();
  });
}
function arrow(pts, g, col, w = 6, dash = null) {
  if (g <= 0) return;
  let total = 0; const lens = [];
  for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); lens.push(l); total += l; }
  let left = total * Math.min(1, g), end = pts[0], dir = [1, 0];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    end = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    dir = [(pts[i + 1][0] - pts[i][0]) / lens[i], (pts[i + 1][1] - pts[i][1]) / lens[i]];
    ctx.lineTo(...end); left -= lens[i];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const s = w * 2.3; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s); ctx.lineTo(end[0] - dir[1] * s * 0.8, end[1] + dir[0] * s * 0.8); ctx.lineTo(end[0] + dir[1] * s * 0.8, end[1] - dir[0] * s * 0.8); ctx.fill();
}
/** The embassy: a facade with lit windows. */
function embassy(x, y, s, lit) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1d2740'; ctx.fillRect(-150, -120, 300, 200);
  ctx.fillStyle = '#26314f'; ctx.beginPath(); ctx.moveTo(-170, -120); ctx.lineTo(0, -180); ctx.lineTo(170, -120); ctx.closePath(); ctx.fill();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const on = (r * 6 + c) / 18 < lit;
    ctx.fillStyle = on ? C.amber : 'rgba(238,240,244,0.08)';
    ctx.fillRect(-126 + c * 44, -96 + r * 54, 24, 34);
  }
  ctx.fillStyle = '#0b0f1a'; ctx.fillRect(-20, 30, 40, 50);
  ctx.restore();
}

// ---------- A: the broadcast and the refuge ----------
function sceneMorning(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    font(700, 36, HEAD); text('Refuge and abduction', 70, 92);
    font(500, 23); text('Budapest · 4 to 22 November 1956', 70, 134, { color: C.amber });
    // a schematic city: the Danube, Parliament on the Pest bank, the embassy to the north-east
    ctx.strokeStyle = C.river; ctx.lineWidth = 40; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(300, 200); ctx.bezierCurveTo(250, 380, 270, 560, 330, 760); ctx.stroke(); ctx.lineCap = 'butt';
    font(500, 18); text('Danube', 230, 470, { color: C.teal, align: 'right' });
    text('Schematic map', 600, 760, { color: C.faint });
    const parl = [380, 420], emb = [640, 330];
    // Parliament: a long building with a dome
    ctx.fillStyle = '#c9b88a'; ctx.fillRect(parl[0] - 10, parl[1] - 70, 40, 140); ctx.beginPath(); ctx.arc(parl[0] + 10, parl[1], 22, 0, TAU); ctx.fill();
    font(600, 20); text('Parliament', parl[0] + 44, parl[1] + 56, { color: C.soft });
    // 5.20 a.m.: the broadcast
    A(seg(t, 0.8, 1.2) * (1 - seg(t, 5.0, 5.4)), () => {
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.7) + i / 3) % 1;
        A(1 - ph, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(parl[0] + 10, parl[1], 40 + ph * 160, 0, TAU); ctx.stroke(); });
      }
      ctx.fillStyle = C.panel; k.rrect(430, 520, 380, 150, 14); ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke();
      font(700, 26); text('5.20 a.m.', 456, 558, { color: C.amber });
      font(500, 18); text('“Our troops are in combat.', 456, 600, { color: C.ink });
      text('The Government is at its post.”', 456, 628, { color: C.ink });
    });
    // about 6 a.m.: to the embassy
    A(seg(t, 5.2, 5.8), () => {
      embassy(emb[0], emb[1], 0.6, 0.3);
      font(600, 20); text('Yugoslav embassy', emb[0], emb[1] + 72, { align: 'center', color: C.teal });
      arrow([[parl[0] + 34, parl[1] - 20], [520, 380], [emb[0] - 70, emb[1] + 20]], eio(seg(t, 5.8, 7.4)), C.amber, 5, [10, 8]);
      A(seg(t, 7.2, 7.8), () => tag('about 6 a.m.', 670, 450, C.amber, { size: 20 }));
    });
  });
}

// ---------- B: inside, outside, the talks ----------
function sceneTalks(t) {
  // who came
  A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
    embassy(CX, 420, 1.1, seg(t, 9.8, 12.6));
    font(600, 20); text('Imre Nagy · ministers · writers · Júlia Rajk', CX, 560, { align: 'center', color: C.soft });
    A(seg(t, 11.4, 12.0), () => { font(700, 22); text(`and ${fmt(WOMEN)} women, ${fmt(KIDS_IN)} children`, CX, 596, { align: 'center', color: C.amber }); });
  });
  // outside: Kádár's government, backed by Soviet troops
  A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
    embassy(260, 420, 0.75, 1);
    for (let i = 0; i < 4; i++) soldier(560 + i * 60, 470, 1.0);
    ctx.fillStyle = C.panel; k.rrect(470, 270, 330, 110, 12); ctx.fill(); ctx.strokeStyle = C.sov; ctx.lineWidth = 2; ctx.stroke();
    font(700, 21); text('János Kádár’s government', 635, 306, { align: 'center', color: C.ink });
    font(500, 18); text('installed on 4 November,', 635, 336, { align: 'center', color: C.soft });
    text('backed by the Soviet army', 635, 360, { align: 'center', color: C.soft });
    A(seg(t, 15.4, 16.0), () => tag('wants them out', 635, 560, C.red));
  });
  // the talks: letters between Belgrade and Kádár
  A(span(t, 18.8, 37.4, 0.4, 0.4), () => {
    font(700, 22); text('BELGRADE', 160, 250, { align: 'center', color: C.teal, spacing: '2px' });
    font(700, 22); text('KÁDÁR', 704, 250, { align: 'center', color: C.sov, spacing: '2px' });
    font(500, 18); text('Yugoslav government', 160, 278, { align: 'center', color: C.soft }); text('in Budapest', 704, 278, { align: 'center', color: C.soft });
    // 1: Yugoslavia's terms
    A(span(t, 18.8, 23.4, 0.3, 0.4), () => {
      letter(CX, 470, 520, 210, 'Yugoslavia asks', ['a written guarantee:', 'they go home freely,', 'or they go to Yugoslavia'], seg(t, 19.0, 19.6), -0.02);
      arrow([[220, 300], [CX - 40, 350]], eio(seg(t, 19.2, 20.2)), C.teal, 4);
    });
    // 2: Romania? No.
    A(span(t, 23.4, 28.2, 0.3, 0.4), () => {
      letter(CX, 470, 520, 210, 'Kádár suggests', ['they go to Romania'], seg(t, 23.6, 24.2), 0.02);
      arrow([[650, 300], [CX + 40, 350]], eio(seg(t, 23.8, 24.8)), C.sov, 4);
      A(seg(t, 25.4, 26.0), () => tag('Nagy: no', CX, 640, C.red, { size: 24 }));
    });
    // 3: new conditions
    A(span(t, 28.0, 32.8, 0.3, 0.4), () => {
      letter(CX, 470, 520, 230, 'Kádár’s conditions', ['resign from the government,', 'criticise yourself,', 'support the new government'], seg(t, 28.2, 28.8), -0.01);
      A(seg(t, 30.0, 30.6), () => tag('Nagy and Belgrade: no', CX, 660, C.red, { size: 22 }));
    });
    // 4: the promise in writing
    A(span(t, 32.6, 37.4, 0.3, 0.4), () => {
      letter(CX, 470, 560, 230, '21 November · Kádár, in writing', ['no sanctions “for their past activities”;', 'they will “proceed freely', 'to their homes”'], seg(t, 32.8, 33.4), 0.01);
      arrow([[650, 300], [CX + 60, 345]], eio(seg(t, 33.0, 34.0)), C.sov, 4);
      A(seg(t, 34.6, 35.2), () => tag(`after ${fmt(IN_EMBASSY - 1)} days in the embassy`, CX, 680, C.amber, { size: 20 }));
    });
  });
}

// ---------- C: the bus ----------
function sceneBus(t) {
  A(span(t, 37.2, 51.2, 0.4, 0.4), () => {
    // night street
    ctx.fillStyle = 'rgba(238,240,244,0.05)'; ctx.fillRect(0, 560, W, 120);
    font(700, 24); text('22 NOVEMBER · 6.30 P.M.', 70, 250, { color: C.amber, spacing: '2px' });
    // the embassy behind, at first
    A(1 - seg(t, 46.2, 46.8), () => { embassy(150, 500, 0.55, 1); });
    // the bus arrives, then drives off
    const arrive = eout(seg(t, 37.6, 39.2)), leave = eio(seg(t, 46.6, 49.4));
    const bx = lerp(980, 470, arrive) + leave * 520;
    bus(bx, 600, 1.0);
    // Soviet soldiers insist on boarding
    A(seg(t, 39.6, 40.2) * (1 - seg(t, 46.2, 46.6)), () => {
      for (let i = 0; i < 3; i++) soldier(lerp(760, 560 + i * 34, eio(seg(t, 39.8, 41.0))), 610, 0.9);
      tag('Soviet soldiers insist on boarding', CX, 300, C.sov, { size: 20 });
    });
    // two Yugoslav diplomats go along, and are put off at the Soviet headquarters
    A(seg(t, 42.0, 42.6) * (1 - seg(t, 46.2, 46.6)), () => {
      person(380, 600, 0.9, C.teal); person(410, 600, 0.9, C.teal);
      font(600, 19); text('two Yugoslav diplomats', 394, 680, { align: 'center', color: C.teal });
      A(seg(t, 43.4, 44.0), () => tag('Soviet military command: diplomats ordered off', CX, 360, C.red, { size: 20 }));
    });
    // armoured cars escort the bus away
    A(seg(t, 46.4, 47.0), () => {
      armoured(bx - 210, 610, 0.9); armoured(bx + 200, 610, 0.9);
      A(seg(t, 48.4, 49.0), () => tag('the promise of safe conduct is broken', CX, 420, C.red, { size: 21 }));
    });
  });
}

// ---------- D: Romania, Snagov, April 1957 ----------
const Q = (lon, lat) => [100 + (lon - 16) * 64, 250 + (48.6 - lat) * 92];
const HUN = [[17.16, 48.01], [16.45, 47.68], [16.45, 47.0], [16.11, 46.87], [17.3, 46.1], [18.1, 45.78], [18.9, 45.93], [19.6, 46.17], [20.7, 46.13], [21.3, 46.65],
  [21.9, 47.4], [22.9, 47.97], [22.3, 48.3], [20.8, 48.57], [19.0, 48.07], [17.8, 47.75]];
const ROU = [[20.7, 46.13], [21.3, 46.65], [21.9, 47.4], [22.9, 47.97], [24.9, 47.73], [26.6, 48.25], [28.2, 46.6], [28.2, 45.4], [29.6, 45.2], [28.6, 44.0], [27.0, 44.1], [25.0, 43.7], [22.9, 43.8], [22.4, 44.6], [21.4, 44.8], [20.3, 45.8]];
function sceneRomania(t) {
  A(span(t, 51.0, 60.4, 0.4, 0.4), () => {
    const shape = (pts, col) => { ctx.fillStyle = col; ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(...Q(...q)) : ctx.moveTo(...Q(...q)))); ctx.closePath(); ctx.fill(); ctx.stroke(); };
    shape(HUN, 'rgba(238,240,244,0.06)'); shape(ROU, 'rgba(238,240,244,0.04)');
    font(700, 19); text('HUNGARY', ...Q(18.6, 46.8), { align: 'center', color: C.faint, spacing: '2px' }); text('ROMANIA', ...Q(24.6, 46.2), { align: 'center', color: C.faint, spacing: '2px' });
    font(500, 17); text('Schematic map', 560, 760, { color: C.faint });
    const bud = Q(19.04, 47.5), sna = Q(26.15, 44.7);
    for (const [p, name, dx, align] of [[bud, 'Budapest', -14, 'right'], [sna, 'Snagov', 14, 'left']]) {
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(...p, 7, 0, TAU); ctx.fill();
      font(700, 20); text(name, p[0] + dx, p[1] - 2, { align, color: C.amber });
    }
    // the flight, dashed
    const g = eio(seg(t, 51.6, 53.6));
    ctx.strokeStyle = C.sov; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(...bud);
    const mid = [(bud[0] + sna[0]) / 2, Math.min(bud[1], sna[1]) - 120];
    for (let i = 1; i <= 30; i++) { const u = (i / 30) * g; ctx.lineTo((1 - u) * (1 - u) * bud[0] + 2 * (1 - u) * u * mid[0] + u * u * sna[0], (1 - u) * (1 - u) * bud[1] + 2 * (1 - u) * u * mid[1] + u * u * sna[1]); }
    ctx.stroke(); ctx.setLineDash([]);
    A(seg(t, 52.6, 53.2) * (1 - seg(t, 55.4, 55.8)), () => tag('flown out, not told where', CX, 210, C.sov, { size: 20 }));
    // Snagov: held under guard
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = C.panel; k.rrect(70, 560, 380, 190, 14); ctx.fill(); ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.stroke();
      font(700, 21); text('Snagov, near Bucharest', 96, 594, { color: C.teal });
      ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(450, 640); ctx.lineTo(Q(26.15, 44.7)[0] - 10, Q(26.15, 44.7)[1] + 8); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < ADULTS + CHILDREN; i++) {
        const child = i >= ADULTS, x = 102 + (i % 14) * 24, y = 640 + Math.floor(i / 14) * 34;
        A(seg(t, 56.4 + i * 0.03, 56.7 + i * 0.03), () => person(x, y + (child ? 6 : 0), child ? 0.42 : 0.55, child ? C.amber : C.ink));
      }
      font(500, 17); text(`${fmt(ADULTS)} adults, ${fmt(CHILDREN)} children, under guard`, 96, 736, { color: C.soft });
    });
  });
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    ctx.fillStyle = C.paper; ctx.fillRect(312, 280, 240, 200);
    ctx.fillStyle = C.red; ctx.fillRect(312, 280, 240, 48);
    font(700, 22); text('APRIL 1957', CX, 305, { align: 'center', color: C.paper });
    font(700, 96, HEAD); text('14', CX, 410, { align: 'center', color: C.pInk });
    font(600, 22); text('Nagy arrested at Snagov', CX, 530, { align: 'center' });
    font(500, 20); text('then a secret trial in Budapest', CX, 562, { align: 'center', color: C.soft });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, '4 November 1956, 5.20 a.m.: Prime Minister Imre Nagy announces a *Soviet attack* on Budapest.'],
  [5.0, 9.4, 'About 6 a.m. the prime minister leaves Parliament and takes refuge in the *Yugoslav embassy*.'],
  [9.6, 14.0, 'Others follow: ministers, writers, Rajk’s widow Júlia, *15 women and 17 children*.'],
  [14.2, 18.6, 'Outside, the new government of ~János Kádár~, backed by the Soviet army, wants them out.'],
  [18.8, 23.2, 'Yugoslavia asks for a *written guarantee*: let them go home freely, or to Yugoslavia.'],
  [23.4, 27.8, 'Kádár suggests they go to *Romania* instead. Nagy refuses.'],
  [28.0, 32.4, 'Kádár then wants Nagy to resign, criticise himself and back the new government. Again, *no*.'],
  [32.6, 37.0, 'On 21 November Kádár promises *in writing*: no punishment, and they may go home freely.'],
  [37.2, 41.6, '22 November, 6.30 p.m.: a bus arrives at the embassy. ~Soviet soldiers~ insist on boarding.'],
  [41.8, 46.2, 'Two Yugoslav diplomats ride along. At the Soviet military command they are *ordered off*.'],
  [46.4, 50.8, 'The bus drives away under escort of Soviet armoured cars. The ~promise is broken~.'],
  [51.0, 55.4, 'The group is flown to Romania without being told where. Kádár’s government says they asked to go.'],
  [55.6, 60.0, 'At Snagov, near Bucharest, 40 people, 13 of them children, are held under guard for months.'],
  [60.2, 64.6, 'On *14 April 1957* Nagy is arrested there and taken back to Hungary, to a secret trial.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMorning(t);
    sceneTalks(t);
    sceneBus(t);
    sceneRomania(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.red } });
  },
});
