// Explainer for engineering-23-october-statue-and-radio (Hungary 1956, "The freedom fight"): 23 October 1956 in
// Budapest, hour by hour. The students' march from the Petőfi statue (and from the Technical University in Buda) to
// the Bem statue, the crowd at Parliament, Ernő Gerő's radio speech, Imre Nagy on the balcony, the Stalin statue
// pulled down on Dózsa György út, and the Radio in Bródy Sándor utca, where the first shots in Budapest were fired.
// What is documented (firing began about 9 p.m.) is kept apart from what is disputed (who fired the very first shot).
// Look: a schematic map of central Budapest at dusk, the Danube in deep blue, places as labelled dots, the march as
// arrows, the flag with the hole; no weapons drawn, shots shown only as a red ring and a time. Libre Franklin for
// headings, Fira Sans for captions and labels.
//
// Facts:
// - UN Special Committee report (1957; mek.oszk.hu/01200/01274), paras 52–60 and 456–479: 22 October, students of
//   the Building Industry Technological University adopt sixteen demands (Soviet troops out, Nagy, free elections);
//   a silent demonstration of sympathy with Poland planned at the Bem statue; the interior minister's ban "lifted
//   during the early afternoon"; one group at the Petőfi statue in Pest marched to the statue of General Bem in Buda;
//   at first some 10,000; flags with the Communist crest cut out; Péter Veres read the Writers' Union's points at the
//   Bem statue; the crowd at Parliament about 6 p.m. "at least 200,000, perhaps 300,000 strong"; the red star's light
//   switched off; Nagy spoke briefly from a balcony, without microphones, and asked the crowd to go home; Gerő's radio
//   speech at 8 p.m. condemned "nationalist demonstrations"; the Stalin statue "fell from its pedestal" at 9.30 p.m.;
//   at the Radio Building, guarded by the ÁVH, a delegation inside; "Shortly after 9 p.m. tear gas bombs were thrown
//   from the upper floors. One or two minutes later, ÁVH men rushed from the entrance and began shooting"; "it is
//   alleged, several demonstrators attempted to force their way into the building. Some witnesses have denied this";
//   at least three killed, some say eight; soldiers sent as reinforcements joined the crowd; workers from Csepel and
//   Újpest brought arms; from about 11 p.m. the building under attack; in the early hours the demonstrators seized
//   it, or part of it; the first Soviet tank patrol seen at 2 a.m. on 24 October.
// - 1956 Institute (Szakolczai Attila), lesson 2 (mek.oszk.hu/01900/01937/html/ora2/ora2.htm): the march starting at
//   3 p.m. from Pest and Buda, meeting at the Bem statue, where the flag with the hole was born; Nagy on the balcony
//   about 9 p.m., beginning "elvtársak"; "Mindmáig nem kellően tisztázott körülmények között dördült el este kilenc
//   óra körül az első lövés az épületből"; the Stalin statue on Dózsa György út fell as the fighting began and was
//   dragged to Blaha Lujza tér; earlier that afternoon in Debrecen the ÁVH killed three, the revolution's first dead.
// The map is schematic: places from rounded coordinates, the river simplified.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Budapest, 23 October; the 16 demands.
//  B  9.6–23.2  3 p.m.: the marches; the Bem statue and the flag with the hole; Parliament.
//  C 23.4–37.0  Gerő at 8 p.m.; Nagy about 9; the Stalin statue at 9.30.
//  D 37.2–64.6  The Radio: about 9 p.m.; documented and disputed; soldiers and workers; the night; Soviet tanks.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#161c20', bg2: '#0d1114', ink: '#f4f1ea', soft: 'rgba(244,241,234,0.74)', faint: 'rgba(244,241,234,0.22)',
  red: '#ce2939', white: '#f4f1ea', green: '#4f9e5f', river: '#26425f', riverEdge: '#3b6288', gold: '#e8c25a',
  avh: '#c0503f', panel: 'rgba(8,11,13,0.88)', street: 'rgba(244,241,234,0.06)',
};
const HEAD = 'Libre Franklin', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the map of central Budapest (schematic) ----------
const KY = 13333, KX = KY * Math.cos((47.5 * Math.PI) / 180), LON0 = 19.022, LAT0 = 47.522;
const P = (lon, lat) => [100 + (lon - LON0) * KX, 160 + (LAT0 - lat) * KY];
const DANUBE = [[19.0405, 47.520], [19.043, 47.512], [19.043, 47.503], [19.044, 47.497], [19.049, 47.490], [19.057, 47.484], [19.0645, 47.4775]];
const PLACES = {
  petofi: [19.050, 47.4935], tech: [19.0565, 47.4813], bem: [19.0395, 47.5110], parl: [19.0457, 47.5071],
  radio: [19.0630, 47.4925], stalin: [19.0810, 47.5065], blaha: [19.0705, 47.4965],
};
const XY = Object.fromEntries(Object.entries(PLACES).map(([key, [lo, la]]) => [key, P(lo, la)]));
const ROUTE_PEST = [PLACES.petofi, [19.0515, 47.5000], [19.0505, 47.5085], [19.0490, 47.5140], [19.0400, 47.5140], PLACES.bem].map((p) => P(...p));
const ROUTE_BUDA = [PLACES.tech, [19.0455, 47.4865], [19.0375, 47.4960], [19.0350, 47.5050], PLACES.bem].map((p) => P(...p));
const ROUTE_PARL = [PLACES.bem, [19.0410, 47.5137], [19.0468, 47.5135], PLACES.parl].map((p) => P(...p));
const ROUTE_STALIN = [PLACES.parl, [19.0560, 47.5050], [19.0700, 47.5040], PLACES.stalin].map((p) => P(...p));
const ROUTE_RADIO = [PLACES.parl, [19.0540, 47.5000], [19.0600, 47.4950], PLACES.radio].map((p) => P(...p));

function map(a) {
  A(a, () => {
    // a faint street grid on the Pest side, for texture only
    ctx.strokeStyle = C.street; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const [x1, y1] = P(19.048 + i * 0.005, 47.522), [x2, y2] = P(19.048 + i * 0.005, 47.474); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    for (let i = 0; i < 9; i++) { const [x1, y1] = P(19.046, 47.520 - i * 0.005), [x2, y2] = P(19.092, 47.520 - i * 0.005); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    // the Danube
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [col, wd] of [[C.riverEdge, 26], [C.river, 22]]) {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath();
      DANUBE.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    font(600, 22); text('Danube', ...P(19.0335, 47.4985), { align: 'center', color: 'rgba(143,180,220,0.8)' });
    font(700, 26); text('BUDA', ...P(19.030, 47.484), { align: 'center', color: C.faint });
    text('PEST', ...P(19.083, 47.482), { align: 'center', color: C.faint });
    font(500, 20); text('Schematic map', 100, 760, { color: C.soft });
  });
}

/** A place: a dot and its name. */
function place(key, name, { dx = 16, dy = 0, align = 'left', a = 1, col = C.ink, size = 23, r = 8 } = {}) {
  A(a, () => {
    const [x, y] = XY[key];
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg2; ctx.lineWidth = 3; ctx.stroke();
    font(700, size); text(name, x + dx, y + dy, { align, color: col });
  });
}

/** An arrow along a polyline, drawn to fraction `g` of its length. */
function arrow(pts, g, col, { w = 8, dash = null } = {}) {
  if (g <= 0) return;
  const seglen = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seglen.push(l); total += l; }
  let left = total * clamp(g), end = pts[0], dir = [1, 0];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < seglen.length && left > 0; i++) {
    const f = Math.min(1, left / seglen[i]);
    end = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    dir = [(pts[i + 1][0] - pts[i][0]) / seglen[i], (pts[i + 1][1] - pts[i][1]) / seglen[i]];
    ctx.lineTo(...end); left -= seglen[i];
  }
  ctx.stroke(); ctx.setLineDash([]);
  const s = w * 2.2;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s);
  ctx.lineTo(end[0] - dir[1] * s * 0.8, end[1] + dir[0] * s * 0.8);
  ctx.lineTo(end[0] + dir[1] * s * 0.8, end[1] - dir[0] * s * 0.8);
  ctx.closePath(); ctx.fill();
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

/** A clock tag: the time on a dark pill. */
function clock(s, x, y, col = C.gold, size = 26) {
  font(700, size, HEAD);
  const tw = ctx.measureText(s).width;
  ctx.fillStyle = C.panel; k.rrect(x - tw / 2 - 14, y - size * 0.85, tw + 28, size * 1.7, 10); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align: 'center', color: col });
}

/** The tricolour with the crest cut out: the flag of 1956. */
function flag(x, y, w, h, hole) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h);
  if (hole > 0) ctx.ellipse(x + w / 2, y + h / 2, h * 0.22 * hole, h * 0.3 * hole, 0, 0, TAU);
  ctx.clip('evenodd');
  ctx.fillStyle = C.red; ctx.fillRect(x, y, w, h / 3);
  ctx.fillStyle = C.white; ctx.fillRect(x, y + h / 3, w, h / 3);
  ctx.fillStyle = C.green; ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  ctx.restore();
  ctx.fillStyle = C.soft; ctx.fillRect(x - 6, y - 4, 6, h * 1.5);
}

function heading(s, sub, a) {
  A(a, () => {
    font(800, 40, HEAD); text(s, 70, 96, { color: C.ink });
    if (sub) { font(500, 25); text(sub, 70, 138, { color: C.gold }); }
  });
}

// ---------- A: the day, and the demands ----------
function sceneA(t) {
  A(span(t, 0, 9.8, 0.5, 0.4), () => {
    heading('BUDAPEST, 23 OCTOBER 1956', 'Tuesday', 1);
    A(span(t, 0.6, 5.2, 0.6, 0.4), () => {
      flag(CX - 170, 300, 340, 220, 0);
      font(600, 26); text('in sympathy with Poland’s reforms', CX, 620, { align: 'center', color: C.soft });
    });
    // the sixteen demands (cue 2)
    A(seg(t, 5.0, 5.4), () => {
      ctx.save(); ctx.translate(CX, 470); ctx.rotate(-0.03);
      ctx.fillStyle = '#efe9da'; k.rrect(-230, -260, 460, 520, 6); ctx.fill();
      font(800, 30, HEAD); text('16 POINTS', 0, -212, { align: 'center', color: '#222' });
      font(500, 19); text('Building Industry Technological University, 22 October', 0, -176, { align: 'center', color: '#444' });
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 16; i++) { const y = -140 + i * 24, l = 300 + 80 * Math.sin(i * 2.3); ctx.beginPath(); ctx.moveTo(-190, y); ctx.lineTo(-190 + l * clamp(seg(t, 5.4 + i * 0.08, 5.8 + i * 0.08)), y); ctx.stroke(); }
      font(700, 22);
      [['1. Soviet troops out', -140], ['3. free elections', -92], ['Imre Nagy in government', -44]].forEach(([s, y], i) => A(seg(t, 6.4 + i * 0.5, 6.8 + i * 0.5), () => {
        ctx.fillStyle = '#efe9da'; ctx.fillRect(-196, y - 14, 392, 28);
        text(s, -186, y, { color: C.red });
      }));
      ctx.restore();
    });
  });
}

// ---------- B: the marches and Parliament ----------
function sceneB(t) {
  const a = span(t, 9.6, 37.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    map(1);
    // the ban, lifted; 3 p.m. (cue 3)
    A(span(t, 9.6, 14.2, 0.3, 0.3), () => clock('3 p.m.', 640, 210));
    place('petofi', 'Petőfi statue', { a: seg(t, 10.0, 10.4), dx: 16, dy: 14, col: C.gold });
    place('tech', 'Technical University', { a: seg(t, 10.2, 10.6), dx: -16, dy: 18, align: 'right', col: C.gold });
    arrow(ROUTE_PEST, eio(seg(t, 11.0, 13.6)), C.white, { w: 7 });
    arrow(ROUTE_BUDA, eio(seg(t, 11.2, 13.8)), C.white, { w: 7 });
    // the Bem statue, the flag with the hole (cue 4)
    place('bem', 'Bem statue', { a: seg(t, 13.4, 13.8), dx: -16, dy: 0, align: 'right', col: C.gold });
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      flag(560, 220, 190, 124, eout(seg(t, 15.0, 16.0)));
      font(600, 22); text('the crest cut out:', 572, 384, { color: C.soft });
      text('the flag with the hole', 572, 412, { color: C.ink });
    });
    // to Parliament (cue 5)
    place('parl', 'Parliament', { a: seg(t, 18.8, 19.2), dx: 16, dy: -16, col: C.gold });
    arrow(ROUTE_PARL, eio(seg(t, 19.0, 20.4)), C.white, { w: 7 });
    A(span(t, 18.8, 23.4, 0.3, 0.3), () => {
      const [px, py] = XY.parl, n = Math.round(160 * eout(seg(t, 20.2, 22.0)));
      for (let i = 0; i < n; i++) {
        const ang = i * 2.39996, r = 10 + 3.2 * Math.sqrt(i);
        ctx.fillStyle = 'rgba(244,241,234,0.75)'; ctx.fillRect(px + 46 + r * Math.cos(ang), py + 34 + r * Math.sin(ang) * 0.7, 3, 3);
      }
      clock('6 p.m.', 640, 210);
      A(seg(t, 21.0, 21.6), () => {
        ctx.fillStyle = C.panel; k.rrect(470, 270, 300, 100, 12); ctx.fill();
        font(800, 32, HEAD); text('200,000–300,000', 620, 305, { align: 'center', color: C.ink });
        font(500, 20); text('the UN committee’s estimate', 620, 343, { align: 'center', color: C.soft });
      });
    });
    // Gerő on the radio at 8 p.m. (cue 6)
    A(span(t, 23.4, 28.0, 0.3, 0.3), () => {
      clock('8 p.m.', 640, 210);
      ctx.fillStyle = C.panel; k.rrect(450, 590, 340, 150, 14); ctx.fill(); ctx.strokeStyle = C.avh; ctx.lineWidth = 2; ctx.stroke();
      font(700, 26); text('Ernő Gerő, party leader', 620, 626, { align: 'center', color: C.ink });
      font(600, 23); text('condemns', 620, 664, { align: 'center', color: C.soft });
      text('“nationalist demonstrations”', 620, 700, { align: 'center', color: C.avh });
      // radio waves
      for (let i = 0; i < 3; i++) {
        const r = 20 + ((t * 40 + i * 22) % 66);
        ctx.strokeStyle = `rgba(192,80,63,${0.6 * (1 - r / 90)})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(480, 570, r, -0.9, 0.9 - Math.PI); ctx.stroke();
      }
    });
    // Nagy on the balcony, about 9 p.m. (cue 7)
    A(span(t, 28.0, 32.6, 0.3, 0.3), () => {
      clock('about 9 p.m.', 640, 210);
      ctx.fillStyle = C.panel; k.rrect(450, 600, 340, 120, 14); ctx.fill();
      font(700, 26); text('Imre Nagy, on a balcony', 620, 636, { align: 'center', color: C.ink });
      font(500, 22); text('no microphone: go home calmly', 620, 676, { align: 'center', color: C.soft });
    });
    // the Stalin statue (cue 8)
    A(seg(t, 32.6, 33.0), () => {
      place('stalin', 'Stalin statue', { dx: 0, dy: -30, align: 'center', col: C.gold });
      arrow(ROUTE_STALIN, eio(seg(t, 32.8, 34.2)), C.white, { w: 6, dash: [12, 9] });
    });
    A(span(t, 32.6, 37.2, 0.3, 0.3), () => {
      clock('about 9.30 p.m.', 640, 210);
      // the statue on its plinth, tipping over
      const fall = eio(seg(t, 34.4, 35.8)), bx = 640, by = 480;
      ctx.fillStyle = '#3a3f45'; ctx.fillRect(bx - 50, by, 100, 60);
      ctx.save(); ctx.translate(bx + 30, by); ctx.rotate(fall * 1.45);
      ctx.fillStyle = '#5c6168'; k.rrect(-58, -150, 56, 150, 10); ctx.fill();
      ctx.beginPath(); ctx.arc(-30, -168, 20, 0, TAU); ctx.fill();
      ctx.restore();
      font(600, 22); text('Dózsa György út', bx, by + 90, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: the Radio ----------
function radioBuilding(x, y, lit) {
  ctx.fillStyle = '#2c3238'; ctx.fillRect(x, y, 300, 260);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    ctx.fillStyle = lit ? 'rgba(232,194,90,0.55)' : 'rgba(10,12,14,0.9)';
    ctx.fillRect(x + 20 + c * 46, y + 20 + r * 52, 26, 32);
  }
  ctx.fillStyle = '#111'; ctx.fillRect(x + 125, y + 210, 50, 50);
  font(800, 24, HEAD); text('MAGYAR RÁDIÓ', x + 150, y - 24, { align: 'center', color: C.ink });
}
function sceneD(t) {
  A(span(t, 37.2, 65.2, 0.4, 0), () => {
    // on the map: the Radio (cue 9)
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      map(1);
      place('stalin', 'Stalin statue', { dx: 0, dy: -30, align: 'center', col: C.soft, a: 0.6 });
      place('parl', 'Parliament', { dx: 16, dy: -4, col: C.soft, a: 0.6 });
      arrow(ROUTE_RADIO, eio(seg(t, 37.6, 39.2)), C.white, { w: 7 });
      place('radio', 'the Radio, Bródy Sándor utca', { dx: 16, dy: 22, col: C.gold, a: seg(t, 37.6, 38.0) });
      A(seg(t, 39.4, 40.0), () => { font(600, 22); text('guarded by the ÁVH', XY.radio[0] + 16, XY.radio[1] + 52, { color: C.avh }); });
    });
    // about 9 p.m. at the Radio (cues 10 and 11)
    A(span(t, 41.8, 51.0, 0.4, 0.4), () => {
      heading('THE RADIO, BRÓDY SÁNDOR UTCA', 'Evening of 23 October', 1);
      radioBuilding(90, 260, true);
      // the crowd in the street
      for (let i = 0; i < 30; i++) {
        const x = 110 + (i % 15) * 19 + (i > 14 ? 9 : 0), y = 560 + (i > 14 ? 26 : 0);
        ctx.fillStyle = 'rgba(244,241,234,0.7)'; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
      }
      // a red ring: shots, about 9 p.m. (no weapons drawn)
      A(seg(t, 42.6, 43.0) * (1 - seg(t, 46.0, 46.6)), () => {
        for (let i = 0; i < 2; i++) {
          const r = 20 + ((t * 70 + i * 40) % 80);
          ctx.strokeStyle = `rgba(206,41,57,${0.9 * (1 - r / 100)})`; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(240, 470, r, 0, TAU); ctx.stroke();
        }
        clock('shortly after 9 p.m.', 640, 300, C.red);
        font(600, 22); text('tear gas, then shots', 640, 350, { align: 'center', color: C.ink });
        text('the first dead in Budapest', 640, 384, { align: 'center', color: C.soft });
      });
      // documented and disputed (cue 11)
      A(seg(t, 46.4, 47.0), () => {
        ctx.fillStyle = C.panel; k.rrect(430, 250, 344, 400, 16); ctx.fill();
        font(800, 24, HEAD); text('DOCUMENTED', 456, 290, { color: C.green });
        font(500, 21);
        ['about 9 p.m.: tear gas,', 'then firing from the building', 'by the ÁVH; people killed', 'in the street'].forEach((s, i) => text(s, 456, 326 + i * 30, { color: C.ink }));
        font(800, 24, HEAD); text('DISPUTED', 456, 480, { color: C.gold });
        font(500, 21);
        ['who fired the very first shot,', 'and on whose order; how many', 'died: at least 3, some say 8'].forEach((s, i) => text(s, 456, 516 + i * 30, { color: C.ink }));
      });
    });
    // the siege through the night (cue 13)
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      heading('THE NIGHT OF 23–24 OCTOBER', 'The Radio besieged', 1);
      radioBuilding(90, 260, false);
      // a few windows lit again on one side: part of the building taken in the early hours
      const taken = seg(t, 57.0, 58.4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) A(taken, () => { ctx.fillStyle = 'rgba(232,194,90,0.7)'; ctx.fillRect(90 + 20 + c * 46, 260 + 20 + r * 52, 26, 32); });
      for (let i = 0; i < 40; i++) {
        const x = 100 + (i % 20) * 15 + (i > 19 ? 7 : 0), y = 560 + (i > 19 ? 24 : 0);
        ctx.fillStyle = 'rgba(244,241,234,0.7)'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
      }
      clock('from about 11 p.m.', 610, 300);
      font(600, 22); text('under attack', 610, 350, { align: 'center', color: C.ink });
      A(taken, () => { text('early hours: part of', 610, 420, { align: 'center', color: C.gold }); text('the building taken', 610, 452, { align: 'center', color: C.gold }); });
    });
    // soldiers and workers (cue 12)
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      heading('THE NIGHT OF 23–24 OCTOBER', '', 1);
      map(0.9);
      place('radio', 'the Radio', { dx: 16, dy: 22, col: C.gold });
      const g = eio(seg(t, 51.4, 53.0));
      arrow([[650, 760], [610, 640], [XY.radio[0] + 10, XY.radio[1] + 20]], g, C.white, { w: 6, dash: [12, 9] });
      arrow([[560, 170], [620, 300], [XY.radio[0] + 10, XY.radio[1] - 20]], g, C.white, { w: 6, dash: [12, 9] });
      font(600, 22); text('workers from Csepel', 650, 740, { align: 'center', color: C.soft });
      text('workers from Újpest', 560, 190, { align: 'center', color: C.soft });
      A(seg(t, 52.4, 53.0), () => {
        ctx.fillStyle = C.panel; k.rrect(110, 640, 330, 90, 12); ctx.fill();
        font(600, 22); text('soldiers sent to help the ÁVH', 130, 670, { color: C.ink });
        text('side with the crowd', 130, 702, { color: C.green });
      });
    });
    // tanks at 2 a.m. (cue 14)
    A(seg(t, 60.2, 60.6), () => {
      heading('24 OCTOBER, ABOUT 2 A.M.', 'Soviet tanks in Budapest', 1);
      map(0.8);
      const g = eio(seg(t, 60.8, 62.6));
      for (const [sx, sy, ex, ey] of [[800, 640, 640, 520], [800, 300, 650, 380]]) {
        const x = lerp(sx, ex, g), y = lerp(sy, ey, g);
        ctx.fillStyle = '#7d8a73'; k.rrect(x - 30, y - 14, 60, 28, 6); ctx.fill();
        ctx.fillStyle = '#5f6b57'; ctx.beginPath(); ctx.arc(x, y - 14, 12, Math.PI, 0); ctx.fill();
      }
      A(seg(t, 62.4, 63.0), () => clock('from a demonstration to an uprising', CX, 690, C.gold, 24));
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
  [0.4, 4.8, 'Budapest, Tuesday 23 October 1956: students plan a march in sympathy with *Poland’s reforms*.'],
  [5.0, 9.4, 'The night before, students had drawn up *16 demands*: Soviet troops out, free elections.'],
  [9.6, 14.0, 'The march is banned, then allowed. At 3 p.m. columns set off from the *Petőfi statue* and from Buda.'],
  [14.2, 18.6, 'They meet at the *Bem statue*. Flags appear with the Communist crest cut out of them.'],
  [18.8, 23.2, 'The crowds cross to *Parliament*: by 6 p.m. 200,000 to 300,000 people, the UN later estimated.'],
  [23.4, 27.8, '8 p.m.: party leader ~Ernő Gerő~ speaks on the radio and condemns “nationalist demonstrations”.'],
  [28.0, 32.4, 'About 9 p.m. *Imre Nagy* speaks briefly from a balcony and asks them to go home. Few can hear.'],
  [32.6, 37.0, 'On Dózsa György út people pull at the giant *Stalin statue*; at about 9.30 p.m. it falls.'],
  [37.2, 41.6, 'At the Radio in Bródy Sándor utca, students want their demands read on air. The ~ÁVH~ guards it.'],
  [41.8, 46.2, 'Shortly after 9 p.m. tear gas, then *shots*, come from the building: the first dead in Budapest.'],
  [46.4, 50.8, 'Documented: the firing began about 9 p.m. Still *disputed*: who fired the very first shot, and why.'],
  [51.0, 55.4, 'Soldiers sent to help the ÁVH side with the crowd; workers from Csepel and Újpest bring *arms*.'],
  [55.6, 60.0, 'All night the Radio is besieged; in the early hours the crowd takes part of the building.'],
  [60.2, 64.6, 'At about 2 a.m. *Soviet tanks* enter Budapest. A demonstration has become an uprising.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.avh } });
  },
});
