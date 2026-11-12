// Explainer for earth-last-fighting-csepel-dunapentele (Hungary 1956, The end): the armed resistance after the
// Soviet attack of 4 November 1956: the army disarmed, the Corvin köz, Csepel, Dunapentele (Sztálinváros), the
// Mecsek hills near Pécs; the end of organized fighting by 11 November; and the human cost of the whole uprising,
// with whose figures they are. Look: a cold November grey-blue, a schematic map of Hungary and of Csepel Island,
// places of resistance as amber lights that go grey when they fall, Soviet moves as dull red arrows; at the end the
// numbers with their sources, under the flag with the hole, and no figures falling. EB Garamond for headings and
// numbers, Libre Franklin for the captions.
//
// Facts:
// - National Security Archive, "The 1956 Hungarian Revolution" (EBB 76, ed. Malcolm Byrne, 2002): at 4:15 a.m. on
//   4 November 1956 Soviet forces launched a major attack; at 5:20 a.m. Imre Nagy announced it in a 35-second
//   broadcast: "Our troops are fighting. The Government is in its place."
// - 1956 Institute (rev.hu), lesson 4 "Occupation and Resistance" and chronology: the Soviets surrounded the
//   Hungarian barracks overnight and disarmed the army; only in Csepel and Dunapentele (Sztálinváros) did lasting,
//   well-organized cooperation develop between the army and the armed revolutionaries; the Corvin köz group held until
//   the morning of 6 November; Újpest and Csepel resisted longest in Budapest; in Csepel the national guard and the
//   local army unit fought together, blocked roads with girders from the steelworks, and were broken on 9 November;
//   Dunapentele's Rákóczi transmitter broadcast in Hungarian and German, leaflets in Russian went to the Soviets; on
//   7 November the steel town was bombarded from the air and by heavy artillery, and by the afternoon the defence had
//   collapsed; near Pécs a university battalion with national guards and miners blocked the roads into the Mecsek
//   hills for two days, several hundred men held out at Vágotpuszta and gave up on 19 November, reaching Yugoslavia
//   on the 22nd; "By November 11, the Soviets had broken the armed resistance."
// - UN Special Committee report (A/3592, 1957): workers in the steel factories of Dunapentele declared they would
//   defend the plant and the houses "which they had built with their own hands"; fierce resistance in the working
//   districts of Újpest and Csepel; the official Hungarian Statistical Review estimated the dead of the fighting at
//   1,800–2,000 in Budapest and 2,500–3,000 in the whole country.
// - Éva Tulipán and Gábor Molnár, Betekintő 2016/3: the Central Statistical Office (KSH) counted 2,502 known deaths
//   in early 1957, the real total being about 2,700; on 9 November Soviet artillery shelled the centre of Csepel and
//   54 people died there that day, whole families among them.
// - Mark Kramer, CWIHP Bulletin 8–9 (1996/97), note 177: Soviet losses 720 dead and 1,540 wounded (G. F. Krivosheev,
//   ed., Grif sekretnosti snyat, 1993); Hungarian wounded 19,226 (KSH, via Péter Gosztonyi).
// The maps are schematic: the border simplified, towns from their coordinates.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  4 November: the attack, Nagy's broadcast, the army disarmed.
//  B 14.2–27.8  Budapest: the Corvin köz; Csepel, 9 November.
//  C 28.0–41.6  Dunapentele, 7 November.
//  D 41.8–55.4  The Mecsek hills; 11 November.
//  E 55.6–64.6  The cost, and whose count it is.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1a2027', bg2: '#0b0e12', ink: '#eef0f2', soft: 'rgba(238,240,242,0.74)', faint: 'rgba(238,240,242,0.26)', line: 'rgba(238,240,242,0.05)',
  land: 'rgba(238,240,242,0.06)', river: '#2f4d66', soviet: '#b6584a', amber: '#e7b24f', fallen: '#6c737c', panel: 'rgba(10,13,17,0.86)', red: '#c8473c', green: '#4f8f5b',
};
const HEAD = 'EB Garamond', TXT = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- Hungary (schematic) ----------
const P = (lon, lat) => [46 + (lon - 16.0) * 112, 150 + (48.6 - lat) * 165];
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const TOWNS = { budapest: [19.04, 47.5], dunapentele: [18.935, 46.96], pecs: [18.23, 46.07], mecsek: [18.05, 46.17], veszprem: [17.91, 47.09], sopron: [16.59, 47.68] };
function hungary(a) {
  A(a, () => {
    ctx.beginPath(); OUTLINE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath();
    ctx.fillStyle = C.land; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = C.river; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); DANUBE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.stroke();
    font(500, 21); text('Schematic map', 60, 190, { color: C.faint });
  });
}
/** A place of resistance: amber while it holds, grey once it has fallen. */
function stronghold(xy, name, fallen, { dx = 14, dy = 0, align = 'left', size = 23 } = {}) {
  const col = fallen >= 1 ? C.fallen : C.amber;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xy[0], xy[1], 8, 0, TAU); ctx.fill();
  A(1 - fallen, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xy[0], xy[1], 16, 0, TAU); ctx.stroke(); });
  font(600, size); text(name, xy[0] + dx, xy[1] + dy, { align, color: fallen >= 1 ? C.soft : C.ink });
}
function arrow(from, to, g, col = C.soviet, w = 6) {
  if (g <= 0) return;
  const x = lerp(from[0], to[0], g), y = lerp(from[1], to[1], g), d = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1, ux = (to[0] - from[0]) / d, uy = (to[1] - from[1]) / d;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash([12, 9]);
  ctx.beginPath(); ctx.moveTo(...from); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const s = w * 2.3; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + ux * s, y + uy * s); ctx.lineTo(x - uy * s * 0.7, y + ux * s * 0.7); ctx.lineTo(x + uy * s * 0.7, y - ux * s * 0.7); ctx.closePath(); ctx.fill();
}
/** The date strip along the bottom: 4 to 22 November, with today's mark. */
function dateStrip(day, a) {
  A(a, () => {
    const x0 = 70, x1 = 794, y = 720, X = (d) => x0 + ((x1 - x0) * (d - 4)) / 18;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let d = 4; d <= 22; d++) { ctx.fillStyle = C.faint; ctx.fillRect(X(d) - 1, y - 6, 2, 12); }
    font(500, 21); text('4 Nov', x0, y + 26, { align: 'center', color: C.soft }); text('11 Nov', X(11), y + 26, { align: 'center', color: C.soft }); text('22 Nov', x1, y + 26, { align: 'center', color: C.soft });
    const dx = X(clamp(day, 4, 22));
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(dx, y, 9, 0, TAU); ctx.fill();
  });
}

// ---------- A: 4 November ----------
function sceneAttack(t) {
  A(span(t, 0.2, 14.2, 0.5, 0.5), () => {
    hungary(1);
    font(700, 36, HEAD); text('4 November 1956', 70, 112, { color: C.ink });
    // the attack from the east and north-east
    const g = (a) => eio(seg(t, a, a + 2.4));
    arrow(P(22.9, 48.2), P(19.4, 47.55), g(0.8)); arrow(P(22.0, 46.6), P(19.3, 47.3), g(1.2)); arrow(P(21.5, 48.5), P(19.2, 47.75), g(1.6));
    arrow(P(20.2, 46.2), P(18.3, 46.15), g(2.2)); arrow(P(19.1, 47.4), P(17.3, 47.5), g(2.6));
    A(seg(t, 1.0, 1.6), () => { font(500, 23); text('4:15 a.m. · the Soviet attack', 70, 150, { color: C.soviet }); });
    // the broadcast (cue 2): a radio panel
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 560, 690, 150, 14); ctx.fill();
      font(600, 22); text('5:20 a.m. · Prime Minister Imre Nagy on the radio, 35 seconds', 120, 596, { color: C.soft });
      font(500, 34, HEAD); text('“Our troops are fighting.', 120, 640, { color: C.ink }); text('The Government is in its place.”', 120, 680, { color: C.ink });
    });
    // barracks surrounded (cue 3)
    A(seg(t, 9.8, 10.6), () => {
      const bases = [[17.65, 47.68], [18.4, 47.19], [20.15, 46.25], [21.63, 47.53], [20.78, 48.1], [16.62, 47.23], [17.79, 46.36], [21.1, 46.67]];
      bases.forEach(([lo, la], i) => A(seg(t, 9.8 + i * 0.15, 10.2 + i * 0.15), () => {
        const [x, y] = P(lo, la);
        ctx.strokeStyle = C.soviet; ctx.lineWidth = 3; ctx.strokeRect(x - 9, y - 9, 18, 18);
        ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.stroke();
      }));
      ctx.fillStyle = C.panel; k.rrect(90, 600, 520, 90, 14); ctx.fill();
      font(600, 23); text('barracks surrounded at dawn,', 120, 632, { color: C.ink });
      text('the Hungarian army disarmed', 120, 662, { color: C.soft });
    });
  });
}

// ---------- B: Budapest and Csepel ----------
// a schematic Csepel Island south of the city, between two arms of the Danube
const CSEPEL = { x: 420, y: 470 };
function sceneCsepel(t) {
  A(span(t, 14.0, 28.0, 0.5, 0.5), () => {
    font(700, 36, HEAD); text('Budapest and Csepel', 70, 112, { color: C.ink });
    // the river arms and the island
    ctx.strokeStyle = C.river; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(400, 150); ctx.bezierCurveTo(390, 260, 330, 330, 300, 460); ctx.bezierCurveTo(280, 560, 290, 660, 300, 760); ctx.stroke();
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(352, 320); ctx.bezierCurveTo(500, 380, 560, 560, 560, 760); ctx.stroke(); ctx.lineCap = 'butt';
    font(600, 22); text('Danube', 250, 200, { color: C.soft });
    ctx.fillStyle = C.land; ctx.beginPath(); ctx.moveTo(360, 340); ctx.bezierCurveTo(470, 400, 520, 560, 530, 760); ctx.lineTo(330, 760); ctx.bezierCurveTo(320, 600, 330, 440, 360, 340); ctx.fill();
    font(700, 28, HEAD); text('Csepel Island', 440, 420, { align: 'center', color: C.soft });
    // Budapest's strongholds in the north (cue 4)
    const hold = (d) => seg(t, d, d + 0.6);
    stronghold([560, 220], 'Corvin köz', hold(16.2), {});
    stronghold([640, 160], 'Újpest', 0, {});
    font(500, 21); A(seg(t, 16.8, 17.4), () => text('held until 6 November', 560, 252, { color: C.soft }));
    // the steelworks and the roads blocked with girders (cue 5)
    A(seg(t, 18.8, 19.4), () => {
      ctx.fillStyle = '#4a515a'; ctx.fillRect(CSEPEL.x - 70, CSEPEL.y + 10, 140, 70);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#5e6670'; ctx.fillRect(CSEPEL.x - 60 + i * 28, CSEPEL.y - 14, 12, 26); }
      font(600, 22); text('steelworks', CSEPEL.x, CSEPEL.y + 106, { align: 'center', color: C.soft });
      // girders across the roads
      for (const [x, y] of [[360, 380], [400, 660], [470, 560]]) {
        ctx.strokeStyle = C.amber; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x - 22, y - 8); ctx.lineTo(x + 22, y + 8); ctx.moveTo(x - 22, y + 8); ctx.lineTo(x + 22, y - 8); ctx.stroke();
      }
      ctx.fillStyle = C.panel; k.rrect(600, 430, 230, 96, 12); ctx.fill();
      font(600, 22); text('workers and', 620, 462, { color: C.ink }); text('soldiers together', 620, 492, { color: C.amber });
    });
    // 9 November (cue 6)
    A(seg(t, 23.4, 24.0), () => {
      arrow([760, 300], [520, 440], eio(seg(t, 23.6, 25.0)), C.soviet, 6);
      arrow([760, 640], [520, 600], eio(seg(t, 23.8, 25.2)), C.soviet, 6);
      ctx.fillStyle = C.panel; k.rrect(560, 560, 270, 160, 12); ctx.fill();
      font(700, 28, HEAD); text('9 November', 580, 596, { color: C.ink });
      font(500, 21); text('artillery on the town centre:', 580, 632, { color: C.soft });
      text('54 people killed that day,', 580, 662, { color: C.ink }); text('whole families among them', 580, 690, { color: C.ink });
    });
  });
}

// ---------- C: Dunapentele ----------
function sceneDunapentele(t) {
  A(span(t, 27.8, 41.8, 0.5, 0.5), () => {
    hungary(1);
    font(700, 36, HEAD); text('Dunapentele · 7 November', 70, 112, { color: C.ink });
    const fall = seg(t, 38.2, 39.4);
    stronghold(P(...TOWNS.dunapentele), 'Dunapentele (Sztálinváros)', fall, { dx: 16 });
    stronghold(P(...TOWNS.budapest), 'Budapest', 0.6, { dx: 16 });
    // the radio's reach: rings
    A(span(t, 32.6, 38.0, 0.4, 0.4), () => {
      const [x, y] = P(...TOWNS.dunapentele);
      for (let i = 0; i < 3; i++) {
        const r = 30 + ((t * 40 + i * 50) % 150);
        A(1 - r / 180, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); });
      }
      ctx.fillStyle = C.panel; k.rrect(430, 560, 400, 130, 12); ctx.fill();
      font(700, 26, HEAD); text('Rákóczi transmitter', 450, 594, { color: C.amber });
      font(500, 21); text('appeals in Hungarian and German,', 450, 628, { color: C.ink }); text('leaflets in Russian for the Soviets', 450, 656, { color: C.soft });
    });
    A(span(t, 28.2, 32.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(430, 560, 400, 130, 12); ctx.fill();
      font(700, 26, HEAD); text('a new steel town', 450, 594, { color: C.amber });
      font(500, 21); text('its workers vow to defend', 450, 628, { color: C.ink }); text('what they built with their own hands', 450, 656, { color: C.soft });
    });
    // 7 November (cue 9)
    A(seg(t, 37.2, 37.8), () => {
      const [x, y] = P(...TOWNS.dunapentele);
      arrow([x + 260, y - 200], [x + 30, y - 20], eio(seg(t, 37.4, 38.6)));
      arrow([x + 280, y + 80], [x + 34, y + 10], eio(seg(t, 37.6, 38.8)));
      ctx.fillStyle = C.panel; k.rrect(430, 560, 400, 130, 12); ctx.fill();
      font(700, 26, HEAD); text('7 November', 450, 594, { color: C.ink });
      font(500, 21); text('bombed from the air, shelled;', 450, 628, { color: C.ink }); text('by the afternoon, taken', 450, 656, { color: C.soft });
    });
  });
}

// ---------- D: the Mecsek, and 11 November ----------
function sceneMecsek(t) {
  A(span(t, 41.6, 55.6, 0.5, 0.5), () => {
    hungary(1);
    font(700, 36, HEAD); text('The Mecsek hills', 70, 112, { color: C.ink });
    // the hills: a few soft ridges north of Pécs
    const [mx, my] = P(...TOWNS.mecsek);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(79,143,91,${0.25 + i * 0.1})`; ctx.beginPath(); ctx.ellipse(mx + i * 22 - 20, my - 4 + i * 6, 60 - i * 12, 18 - i * 3, -0.2, 0, TAU); ctx.fill(); }
    const day = lerp(4, 19, seg(t, 46.6, 50.4));
    stronghold(P(...TOWNS.pecs), 'Pécs', 1, { dx: 14, dy: 18 });
    stronghold([mx, my], 'Vágotpuszta', seg(t, 49.6, 50.4), { dx: -16, dy: -26, align: 'right' });
    stronghold(P(...TOWNS.dunapentele), 'Dunapentele', 1, { dx: 16 });
    stronghold(P(...TOWNS.budapest), 'Budapest', 1, { dx: 16 });
    A(seg(t, 46.6, 47.2), () => {
      // the walk to Yugoslavia
      arrow([mx, my + 10], [mx + 30, P(18.4, 45.75)[1] + 14], eio(seg(t, 49.8, 51.0)), C.amber, 4);
      font(600, 22); text('to Yugoslavia, 22 Nov', mx + 40, P(18.4, 45.75)[1] + 40, { color: C.amber });
    });
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(430, 560, 400, 130, 12); ctx.fill();
      font(700, 26, HEAD); text('Pécs', 450, 594, { color: C.amber });
      font(500, 21); text('students, national guards and miners', 450, 628, { color: C.ink }); text('hold the roads for two days', 450, 656, { color: C.soft });
    });
    dateStrip(day, seg(t, 46.4, 47.0));
    A(seg(t, 51.0, 51.6), () => {
      const x = 70 + ((794 - 70) * (11 - 4)) / 18;
      ctx.fillStyle = C.soviet; ctx.fillRect(x - 3, 700, 6, 40);
    });
    A(seg(t, 51.0, 51.6), () => {
      ctx.fillStyle = C.panel; k.rrect(430, 520, 400, 130, 12); ctx.fill();
      font(700, 26, HEAD); text('11 November', 450, 554, { color: C.ink });
      font(500, 21); text('organized armed resistance broken;', 450, 588, { color: C.ink }); text('the workers’ councils strike on', 450, 616, { color: C.soft });
    });
  });
}

// ---------- E: the cost ----------
function flag(x, y, w, h) {
  const s = h / 3;
  ctx.fillStyle = C.red; ctx.fillRect(x, y, w, s);
  ctx.fillStyle = '#e9e9e9'; ctx.fillRect(x, y + s, w, s);
  ctx.fillStyle = C.green; ctx.fillRect(x, y + 2 * s, w, s);
  ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, h * 0.21, 0, TAU); ctx.fill(); // the hole where the arms were cut out
}
function sceneCost(t) {
  A(span(t, 55.4, 65.2, 0.6, 0), () => {
    flag(CX - 90, 150, 180, 110);
    font(700, 34, HEAD); text('The cost of the uprising', CX, 310, { align: 'center', color: C.ink });
    A(seg(t, 56.0, 56.8), () => {
      font(700, 46, HEAD); text(`${fmt(2500)}–${fmt(3000)}`, CX, 390, { align: 'center', color: C.ink });
      font(600, 23); text('Hungarians dead, October–November 1956', CX, 432, { align: 'center', color: C.soft });
      font(500, 21); text('Hungarian Statistical Review, 1956', CX, 466, { align: 'center', color: C.soft }); text('the Statistical Office counted 2,502 known deaths', CX, 494, { align: 'center', color: C.soft });
    });
    A(seg(t, 60.4, 61.2), () => {
      font(700, 46, HEAD); text(fmt(720), CX, 560, { align: 'center', color: C.ink });
      font(600, 23); text('Soviet soldiers dead, 1,540 wounded', CX, 602, { align: 'center', color: C.soft });
      font(500, 21); text('the Soviet army’s own count, published in 1993', CX, 636, { align: 'center', color: C.soft });
    });
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
  [0.4, 4.8, 'Hungary, 4 November 1956, 4:15 a.m.: Soviet forces attack Budapest and towns across the country.'],
  [5.0, 9.4, '5:20 a.m., Prime Minister Imre Nagy on the radio: *“Our troops are fighting.”*'],
  [9.6, 14.0, 'Soviet units surround the barracks at dawn and disarm the Hungarian army almost everywhere.'],
  [14.2, 18.6, 'In Budapest the Corvin köz group holds until 6 November; Újpest and *Csepel* hold out longest.'],
  [18.8, 23.2, 'On Csepel Island workers and soldiers fight side by side, blocking roads with girders from the steelworks.'],
  [23.4, 27.8, '9 November: Soviet artillery shells Csepel’s centre. 54 people die that day, whole families among them.'],
  [28.0, 32.4, 'South of Budapest, in the new steel town of *Dunapentele*, then Sztálinváros, the workers take up arms.'],
  [32.6, 37.0, 'Its radio, the Rákóczi transmitter, calls for help in Hungarian and German; leaflets in Russian go to the Soviets.'],
  [37.2, 41.6, '7 November: Dunapentele is bombed from the air and shelled. By the afternoon its defence has collapsed.'],
  [41.8, 46.2, 'Near Pécs, students, national guards and miners hold the roads into the *Mecsek hills* for two days.'],
  [46.4, 50.8, 'Several hundred hold out in the hills until 19 November, then walk to Yugoslavia.'],
  [51.0, 55.4, 'By 11 November the organized armed resistance is broken. The workers’ councils go on with strikes.'],
  [55.6, 60.0, 'The whole uprising cost about 2,500–3,000 Hungarian lives, by Hungarian statistics, and some 19,000 wounded.'],
  [60.2, 64.6, 'The Soviet army counted 720 of its soldiers dead and 1,540 wounded, by its own figures.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneAttack(t);
    sceneCsepel(t);
    sceneDunapentele(t);
    sceneMecsek(t);
    sceneCost(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.soviet } });
  },
});
