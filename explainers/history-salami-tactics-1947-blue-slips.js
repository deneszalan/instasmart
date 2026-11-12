// Explainer for history-salami-tactics-1947-blue-slips (Hungary 1956, Background): how the Communists took power
// in Hungary step by step, 1945–1947, by what Mátyás Rákosi himself later called "salami tactics": the
// "conspiracy" of 1946–47 against the Smallholders, Béla Kovács taken by Soviet soldiers, Ferenc Nagy forced out,
// and the "blue-slip" election of 31 August 1947. Look: a dark ink-blue night, a long green bar (the Smallholders'
// 57% of 1945) cut into slices, then a schematic district of polling stations visited again and again by one
// car of activists with blue slips, and the estimates side by side. No people harmed on screen. Oswald for
// headings and numbers, Source Sans 3 for the captions.
//
// Facts:
// - Hungarian Wikipedia, 1945 election (from Magyar Közlöny 1945 and vokscentrum.hu): 4 November 1945, FKgP
//   (Independent Smallholders) 57.03%, SZDP 17.41%, MKP (Communists) 16.96%, NPP 6.87%; 245 of 409 seats.
// - US Library of Congress, Country Study Hungary (1989), "Postwar Hungary": the Communists, with Soviet support,
//   took control of the security police; "Using methods Rakosi later called 'salami tactics'", rival leaders were
//   discredited and forced out, "In late 1946, leaders of the Smallholders' Party were arrested. In 1947 the
//   Soviet Union ordered the arrest of Bela Kovacs, the secretary general ...".
// - Károly Szerencsés, "Strike a blow", Rubicon (rubicon.hu/en): the ÁVO (political police) communiqué on a
//   "conspiracy against the republic" (late December 1946); Smallholder MPs arrested despite their immunity;
//   confessions forced by torture at Andrássy út 60; "The Smallholders backed down once again and expelled their
//   arrested representatives"; 25 February 1947, about 8 p.m., Soviet soldiers took Béla Kovács from his flat in
//   Váci utca; held in Soviet prisons and camps, home only in 1955 (released 1956); Ferenc Nagy "overthrown in a
//   coup on May 31, 1947".
// - FRUS 1947 vol. IV, doc. 220 (Bern, 1 June 1947): Prime Minister Nagy had arrived in Switzerland on 14 May for
//   a holiday; he resigned, releasing his letter only once his younger son had reached the Swiss border at Buchs.
// - Attila Csönge, "A hangsúly azon van, hogy ne tiszteljük a törvényeket nagyon", Múltunk 2009/2, 93–122
//   (epa.hu): blue slips (kék cédula, a voter-list extract) let people vote away from home; the Communist party
//   planned some 208,693 false votes nationally; the report of ÁVO chief Gábor Péter to interior minister László
//   Rajk counted 62,981 false blue-slip votes cast; Károly Szerencsés thinks the real number was near 200,000;
//   László Hubai says it is "customary" to put it at 100,000; the ÁVO's report of 14 August 1947: 5,064,987
//   entitled to vote, 466,853 refused (8.44%), against a Communist target of 700,000–800,000; national results:
//   MKP 1,111,001 (22.24%), DNP 824,259 (16.50%), FKgP 766,000 (15.34%), SZDP 742,171 (14.86%), MFP 670,751
//   (13.43%), NPP 413,409 (8.28%); later the Hungarian Independence Party's (MFP) 49 seats were annulled. Csönge's
//   conclusion: the exclusions from the vote weighed most; the blue-slip fraud did not decide who came first.
// The district with its polling stations is schematic; the slices of the bar are schematic, its two ends are the
// Smallholders' real shares of the vote in 1945 and 1947.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The 1945 election: one bar of 100%.
//  B  9.6–14.0  The Smallholders' 57% becomes the salami; Rákosi's phrase.
//  C 14.2–37.0  Slices: the "conspiracy", Béla Kovács, Ferenc Nagy.
//  D 37.2–55.4  The blue-slip election: refused voters, one car, many stations, the estimates.
//  E 55.6–64.6  The result: 15% left of 57%; the Independence Party's 49 seats annulled.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#151b2e', bg2: '#0b0f1b', ink: '#f2ede2', soft: 'rgba(242,237,226,0.74)', faint: 'rgba(242,237,226,0.26)', line: 'rgba(242,237,226,0.08)',
  green: '#86b86a', greenDark: '#4f7a3c', fleck: 'rgba(242,237,226,0.30)', red: '#e0675a', blue: '#79aef0', blueSlip: '#a9cdf7',
  gold: '#e8c46a', grey: '#8d93a3', panel: 'rgba(8,11,20,0.82)', knife: '#d9dde6',
};
const HEAD = 'Oswald', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const V1945 = [['Smallholders', 57.03, C.green], ['Social Democrats', 17.41, C.grey], ['Communists', 16.96, C.red], ['Peasant Party', 6.87, '#b59a6a']];
const R1947 = [ // Csönge, table 3: national valid votes
  ['Communists', 1111001, C.red], ['Democratic People’s Party', 824259, C.grey], ['Smallholders', 766000, C.green],
  ['Social Democrats', 742171, C.grey], ['Independence Party', 670751, C.gold], ['Peasant Party', 413409, '#b59a6a'],
];
const TOTAL1947 = 4994338; // all ten lists
const share = (v) => (100 * v) / TOTAL1947;
/** A share with one decimal, written the render language's way (22.2 or 22,2). */
const pct1 = (x) => { const s = (Math.round(x * 10) / 10).toFixed(1); return fmt(1000).includes(',') ? s : s.replace('.', ','); };
if (Math.abs(share(1111001) - 22.24) > 0.02 || Math.abs(share(766000) - 15.34) > 0.02) throw new Error('1947 shares');
const ESTIMATES = [['report of police chief Gábor Péter', 62981, C.blueSlip], ['the “customary” estimate', 100000, C.blue], ['historian Károly Szerencsés: about', 200000, C.blue]];
const REFUSED = 466853, ENTITLED = 5064987;
if (Math.abs((100 * REFUSED) / (ENTITLED + REFUSED) - 8.44) > 0.01) throw new Error('refused share'); // the ÁVO's 8.44%

// ---------- the salami: a bar whose length is a share of the vote ----------
const PX_PER_PCT = 11.6, BX = 92, BY = 430, BH = 64;
/** Length of the bar at time t: 57% in 1945, cut in schematic slices, 15.34% after the 1947 election. */
const CUTS = [[17.0, 47.0], [25.4, 38.0], [34.4, 28.0], [53.4, 15.34]];
function barPct(t) {
  let p = 57.03;
  for (const [at, to] of CUTS) p = lerp(p, to, eio(seg(t, at, at + 1.2)));
  return p;
}
function salami(x, y, len, a, { flecks = true } = {}) {
  A(a, () => {
    const r = BH / 2;
    ctx.fillStyle = C.green; k.rrect(x, y - r, len, BH, r); ctx.fill();
    // a cut face at the right end
    ctx.fillStyle = '#a8cf8d'; ctx.beginPath(); ctx.ellipse(x + len - r * 0.35, y, r * 0.35, r, 0, 0, TAU); ctx.fill();
    if (flecks) {
      ctx.save(); k.rrect(x, y - r, len, BH, r); ctx.clip();
      ctx.fillStyle = C.fleck;
      for (let i = 0; i < 140; i++) {
        const fx = x + ((i * 37.3) % 700), fy = y - r + 8 + ((i * 53.7) % (BH - 16));
        if (fx < x + len - 14) { ctx.beginPath(); ctx.arc(fx, fy, 2.2 + (i % 3), 0, TAU); ctx.fill(); }
      }
      ctx.restore();
    }
  });
}
/** A slice that falls away from the bar's right end to a shelf below, with its label. */
function slice(t, at, fromPct, i, label, sub) {
  const g = eio(seg(t, at + 0.5, at + 1.7));
  if (t < at) return;
  const x0 = BX + fromPct * PX_PER_PCT - 18, y0 = BY;
  const xs = 150 + i * 196, ys = 610;
  const x = lerp(x0, xs, g), y = lerp(y0, ys, g);
  ctx.fillStyle = '#a8cf8d'; ctx.beginPath(); ctx.ellipse(x, y, 13, BH / 2, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.greenDark; ctx.lineWidth = 2; ctx.stroke();
  A(seg(t, at + 1.4, at + 2.0), () => {
    font(700, 24, HEAD); text(label, xs, ys + 58, { align: 'center', color: C.gold });
    font(600, 22); text(sub, xs, ys + 88, { align: 'center', color: C.soft });
  });
}
/** The knife: a thin blade coming down at the bar's right end. */
function knife(t, at, pct) {
  const d = seg(t, at - 0.4, at + 0.2) * (1 - seg(t, at + 0.6, at + 1.0));
  if (d <= 0) return;
  const x = BX + pct * PX_PER_PCT - 20, y = BY - 120 + 90 * eout(seg(t, at - 0.4, at + 0.1));
  A(d, () => {
    ctx.fillStyle = C.knife; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x + 3, y + 110); ctx.lineTo(x - 6, y + 96); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5b4636'; k.rrect(x - 7, y - 54, 14, 54, 5); ctx.fill();
  });
}

// ---------- A: 1945 ----------
function scene1945(t) {
  A(span(t, 0, 9.7, 0.5, 0.4), () => {
    const x0 = BX, wTot = 100 * 6.8, y = 420;
    let x = x0;
    V1945.forEach(([name, pct, col], i) => {
      const w = pct * 6.8 * eio(seg(t, 1.0 + i * 0.35, 2.2 + i * 0.35));
      ctx.fillStyle = col; ctx.fillRect(x, y - 32, w, 64);
      if (i < 3) A(seg(t, 2.4 + i * 0.4, 3.0 + i * 0.4), () => {
        font(700, 34, HEAD); text(`${fmt(Math.round(pct))}%`, x + pct * 3.4, y + 2, { align: 'center', color: '#0b0f1b' });
        font(600, 23); text(name, x + (i === 0 ? 0 : pct * 3.4), y + (i === 1 ? -62 : 62), { align: i === 0 ? 'left' : 'center', color: col });
      });
      x += pct * 6.8;
    });
    void wTot;
    A(seg(t, 5.2, 6.0), () => {
      font(600, 23); text('Communists: the interior ministry and the political police', CX, 560, { align: 'center', color: C.red });
      font(500, 22); text('backed by the Soviet occupation forces', CX, 592, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B–C: the salami and its slices ----------
function sceneSalami(t) {
  A(span(t, 9.4, 37.4, 0.6, 0.5), () => {
    const p = barPct(t);
    salami(BX, BY, p * PX_PER_PCT, 1);
    A(seg(t, 10.0, 10.8), () => {
      font(700, 26, HEAD); text('THE SMALLHOLDERS’ MAJORITY', BX, BY - 76, { color: C.green, spacing: '1px' });
      font(600, 22); text('57% of the vote in November 1945', BX, BY - 46, { color: C.soft });
    });
    A(seg(t, 11.0, 11.8) * (1 - seg(t, 15.4, 15.8)), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 560, W - 340, 150, 16); ctx.fill();
      font(700, 30, HEAD); text('“SALAMI TACTICS”', CX, 604, { align: 'center', color: C.gold, spacing: '2px' });
      font(500, 23); text('Mátyás Rákosi’s own name for it, years later:', CX, 646, { align: 'center', color: C.soft });
      text('one slice at a time', CX, 678, { align: 'center', color: C.ink });
    });
    knife(t, 17.0, 57.03); knife(t, 25.4, 47.0); knife(t, 34.4, 38.0);
    slice(t, 17.0, 57.03, 0, 'late 1946', '“conspiracy” arrests');
    slice(t, 25.4, 47.0, 1, '25 Feb 1947', 'Béla Kovács taken');
    slice(t, 34.4, 38.0, 2, 'May 1947', 'Ferenc Nagy out');
    // the political police headquarters: Andrássy út 60 (cues 4–5)
    A(span(t, 14.4, 23.4, 0.5, 0.4), () => {
      const x = 620, y = 238;
      ctx.fillStyle = 'rgba(141,147,163,0.22)'; ctx.fillRect(x - 70, y - 50, 140, 100);
      ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.strokeRect(x - 70, y - 50, 140, 100);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = 'rgba(232,196,106,0.5)'; ctx.fillRect(x - 58 + c * 32, y - 38 + r * 30, 18, 18); }
      font(600, 22); text('Andrássy út 60', x, y + 74, { align: 'center', color: C.soft });
      font(700, 22, HEAD); text('POLITICAL POLICE (ÁVO)', x, y - 76, { align: 'center', color: C.grey, spacing: '1px' });
    });
    // Béla Kovács: an arrow to the east (cues 6–7)
    A(span(t, 23.6, 32.6, 0.5, 0.4), () => {
      const g = eio(seg(t, 28.2, 30.0));
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(520, 250); ctx.lineTo(520 + 230 * g, 250 - 40 * g); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
      font(700, 24, HEAD); text('Budapest', 520, 286, { align: 'center', color: C.ink });
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(520, 250, 8, 0, TAU); ctx.fill();
      A(seg(t, 29.4, 30.0), () => {
        font(700, 24, HEAD); text('Soviet camps', 744, 252, { align: 'center', color: C.red });
        font(600, 22); text('8 years, no proper trial', 744, 284, { align: 'center', color: C.soft });
      });
    });
    // Ferenc Nagy: Switzerland (cue 8)
    A(span(t, 32.6, 37.4, 0.4, 0.4), () => {
      const g = eio(seg(t, 33.0, 34.4));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(600, 250); ctx.lineTo(600 - 330 * g, 250 - 20 * g); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(600, 250, 8, 0, TAU); ctx.fill();
      font(700, 24, HEAD); text('Budapest', 600, 286, { align: 'center', color: C.ink });
      A(seg(t, 34.0, 34.6), () => {
        font(700, 24, HEAD); text('Switzerland', 230, 230, { align: 'center', color: C.gold });
        font(600, 22); text('on holiday, made to resign', 230, 262, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- D: the blue-slip election ----------
const STATIONS = [[150, 300], [330, 230], [520, 280], [700, 230], [690, 420], [480, 470], [270, 430]];
function ballotBox(x, y, lit) {
  ctx.fillStyle = lit ? 'rgba(121,174,240,0.35)' : 'rgba(242,237,226,0.10)';
  ctx.strokeStyle = lit ? C.blue : C.faint; ctx.lineWidth = 3;
  ctx.fillRect(x - 26, y - 20, 52, 40); ctx.strokeRect(x - 26, y - 20, 52, 40);
  ctx.fillStyle = C.bg2; ctx.fillRect(x - 12, y - 22, 24, 5);
}
function sceneElection(t) {
  A(span(t, 37.2, 55.6, 0.5, 0.5), () => {
    font(700, 30, HEAD); text('31 AUGUST 1947', 70, 112, { color: C.ink, spacing: '2px' });
    font(600, 23); text('the “blue-slip” election', 70, 148, { color: C.blueSlip });
    // refused the vote (cue 9): a bar of the voters' rolls
    A(span(t, 37.4, 41.8, 0.4, 0.4), () => {
      const x0 = 92, w = 680, y = 360;
      const g = eio(seg(t, 38.2, 39.6));
      ctx.fillStyle = 'rgba(242,237,226,0.16)'; ctx.fillRect(x0, y, w, 46);
      ctx.fillStyle = C.grey; ctx.fillRect(x0 + w * (1 - (REFUSED / (ENTITLED + REFUSED)) * g), y, w * (REFUSED / (ENTITLED + REFUSED)) * g, 46);
      font(600, 23); text('on the voters’ rolls', x0, y - 26, { color: C.soft });
      text(fmt(ENTITLED), x0, y + 80, { color: C.ink });
      A(seg(t, 39.4, 40.0), () => {
        font(700, 30, HEAD); text(fmt(REFUSED), x0 + w, y + 80, { align: 'right', color: C.ink });
        font(600, 22); text('refused the vote', x0 + w, y + 114, { align: 'right', color: C.soft });
        text('the political police’s own count', x0 + w, y + 142, { align: 'right', color: C.faint });
      });
    });
    // one car, many stations (cues 10–11)
    A(span(t, 41.8, 51.0, 0.4, 0.4), () => {
      font(600, 22); text('Schematic district', 70, 560, { color: C.faint });
      const loop = eio(seg(t, 46.6, 50.6));
      const n = STATIONS.length, pos = loop * (n - 1), i0 = Math.min(n - 2, Math.floor(pos)), f = pos - i0;
      STATIONS.forEach(([x, y], i) => ballotBox(x, y, t > 46.6 && i <= pos + 0.05));
      // the path so far
      ctx.strokeStyle = C.blueSlip; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(...STATIONS[0]);
      for (let i = 1; i <= i0; i++) ctx.lineTo(...STATIONS[i]);
      const cx = lerp(STATIONS[i0][0], STATIONS[i0 + 1][0], f), cy = lerp(STATIONS[i0][1], STATIONS[i0 + 1][1], f);
      if (t > 46.6) ctx.lineTo(cx, cy);
      ctx.stroke(); ctx.setLineDash([]);
      // the car with its passengers
      ctx.fillStyle = C.ink; k.rrect(cx - 26, cy - 52, 52, 22, 6); ctx.fill();
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(cx - 14, cy - 28, 6, 0, TAU); ctx.arc(cx + 14, cy - 28, 6, 0, TAU); ctx.fill();
      // a blue slip
      A(seg(t, 42.6, 43.4), () => {
        ctx.save(); ctx.translate(700, 560); ctx.rotate(-0.08);
        ctx.fillStyle = C.blueSlip; ctx.fillRect(-90, -50, 180, 100);
        ctx.fillStyle = 'rgba(11,15,27,0.5)'; for (let r = 0; r < 4; r++) ctx.fillRect(-74, -30 + r * 20, r === 0 ? 100 : 148, 6);
        ctx.restore();
        font(600, 22); text('a voter-list extract', 700, 636, { align: 'center', color: C.blueSlip });
        text('for voting away from home', 700, 664, { align: 'center', color: C.soft });
      });
      const votes = t < 46.6 ? 0 : Math.min(n, Math.floor(pos + 1.0001));
      A(seg(t, 46.8, 47.2), () => {
        font(700, 44, HEAD); text(fmt(votes), 140, 640, { align: 'center', color: C.blue });
        font(600, 22); text('votes by the same people', 140, 680, { align: 'center', color: C.soft });
      });
    });
    // the estimates (cue 12)
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      font(700, 26, HEAD); text('HOW MANY FALSE VOTES?', 92, 250, { color: C.blueSlip, spacing: '1px' });
      const x0 = 92, wMax = 600, max = 220000;
      ESTIMATES.forEach(([name, v, col], i) => {
        const y = 320 + i * 96, g = eio(seg(t, 51.4 + i * 0.4, 52.6 + i * 0.4));
        ctx.fillStyle = col; ctx.fillRect(x0, y, (wMax * v / max) * g, 34);
        A(seg(t, 52.0 + i * 0.4, 52.6 + i * 0.4), () => {
          font(700, 26, HEAD); text(fmt(v), x0 + (wMax * v) / max + 14, y + 18, { color: C.ink });
          font(600, 22); text(name, x0, y + 58, { color: C.soft });
        });
      });
      font(600, 22); text('Few records survive; estimates differ.', 92, 640, { color: C.faint });
    });
  });
}

// ---------- E: the result ----------
function sceneResult(t) {
  A(span(t, 55.4, 65.2, 0.5, 0), () => {
    font(700, 30, HEAD); text('THE 1947 RESULT', 70, 112, { color: C.ink, spacing: '2px' });
    // the salami again: 15% left of 57%
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      k.rrect(BX, BY - BH / 2, 57.03 * PX_PER_PCT, BH, BH / 2); ctx.stroke(); ctx.setLineDash([]);
      salami(BX, BY, barPct(t) * PX_PER_PCT, 1);
      font(700, 26, HEAD); text('Smallholders 1945: 57%', BX + 57.03 * PX_PER_PCT, BY - 70, { align: 'right', color: C.soft });
      A(seg(t, 54.6, 55.2), () => { font(700, 34, HEAD); text('1947: 15%', BX + 16 * PX_PER_PCT + 20, BY, { color: C.green }); });
      // the Communists
      const red = 22.24 * PX_PER_PCT * eio(seg(t, 56.4, 57.6));
      ctx.fillStyle = C.red; k.rrect(BX, 560, Math.max(red, 1), 52, 10); ctx.fill();
      A(seg(t, 57.2, 57.8), () => { font(700, 30, HEAD); text('Communists 22%: first place', BX + 22.24 * PX_PER_PCT + 16, 588, { color: C.red }); });
    });
    // the results table, and the annulled seats (cue 14)
    A(seg(t, 60.0, 60.6), () => {
      const x0 = 92, wPer = 22, y0 = 200;
      R1947.forEach(([name, v, col], i) => {
        const y = y0 + i * 82, w = share(v) * wPer;
        const gone = name === 'Independence Party' ? seg(t, 61.4, 62.2) : 0;
        A(1 - 0.75 * gone, () => { ctx.fillStyle = col; ctx.fillRect(x0, y, w, 40); });
        if (gone > 0) A(gone, () => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(x0, y, w, 40); ctx.setLineDash([]); });
        font(600, 23); text(name, x0 + w + 14, y + 20, { color: C.ink });
        font(700, 22, HEAD); text(`${pct1(share(v))}%`, x0 + 10, y + 20, { color: '#0b0f1b' });
        if (name === 'Independence Party') {
          A(seg(t, 61.4, 62.0), () => {
            font(700, 24, HEAD); text('49 SEATS ANNULLED', x0 + w + 14, y + 56, { color: C.gold, spacing: '1px' });
          });
        }
      });
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
  g.strokeStyle = C.line; g.lineWidth = 1;
  for (let y = 40; y <= 780; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, 4 November 1945: in a free election the *Smallholders’ Party* wins 57% of the vote.'],
  [5.0, 9.4, 'The ~Communists~ win 17%, but with Soviet backing they take over the political police.'],
  [9.6, 14.0, 'Communist leader Mátyás Rákosi later called his method *salami tactics*: one slice at a time.'],
  [14.2, 18.6, 'Late 1946: the political police announce a “conspiracy”. Smallholder MPs are arrested.'],
  [18.8, 23.2, 'Confessions are forced from them under torture. The Smallholders expel their arrested MPs.'],
  [23.4, 27.8, '25 February 1947: Soviet soldiers take ~Béla Kovács~, the party’s secretary general, from his flat.'],
  [28.0, 32.4, 'He is held in Soviet prisons and camps for eight years, with no proper trial.'],
  [32.6, 37.0, 'May 1947: Prime Minister *Ferenc Nagy*, on holiday in Switzerland, is made to resign.'],
  [37.2, 41.6, 'Before the election of 31 August 1947, 466,853 people are refused the vote.'],
  [41.8, 46.2, 'On the day, Communist activists carry *blue slips*: copies of the voter list, for voting away from home.'],
  [46.4, 50.8, 'With them, the same people vote again and again, at one polling station after another.'],
  [51.0, 55.4, 'The police chief counted 62,981 false votes; historians’ estimates run up to *200,000*.'],
  [55.6, 60.0, 'The Communists come first with 22%. The Smallholders, 57% two years before, get 15%.'],
  [60.2, 64.6, 'Then the Independence Party’s 49 seats are annulled. One more slice is gone.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    A(span(t, 0, 37.4, 0.4, 0.5), () => {
      font(700, 30, HEAD); text('HUNGARY 1945–1947', 70, 112, { color: C.ink, spacing: '2px' });
      font(600, 23); text('how one party took power', 70, 148, { color: C.gold });
    });
    scene1945(t);
    sceneSalami(t);
    sceneElection(t);
    sceneResult(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.green, '~': C.red, '^': C.blueSlip } });
  },
});
