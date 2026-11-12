// Explainer for engineering-nagy-government-and-neutrality (Hungary 1956): the revolution's second week, 28 October
// to 4 November 1956, in two lanes: what Budapest did in public and what Moscow decided in secret. Imre Nagy's
// ceasefire and his broadcast calling the uprising "a great national and democratic movement"; the ÁVH dissolved;
// one-party rule ended; councils across the country; the Soviet declaration of 30 October; Cardinal Mindszenty freed;
// the siege and lynchings at Köztársaság tér; the Soviet Presidium's reversal on 31 October; new Soviet troops; the
// declaration of neutrality on 1 November; the four-party government of 3 November; the attack of 4 November.
// Look: a deep teal night, a week strip of eight days along the top, a gold Budapest lane and a grey Moscow lane,
// simple shapes for the radio, the cabinet and the map; the lynching told in words, not drawn. Jost for headings and
// labels, Alegreya Sans for the captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (1957), via mek.oszk.hu/01200/01274: para 60 (a five-day
//   battle from the first shots at the Radio); para 66 (27 October: a government with Tildy, Kovács and Erdei);
//   para 67 (28 October: ceasefire); para 571 (28 October, 5.25 p.m.: "a great national and democratic movement");
//   para 68 (ÁVH to be abolished, done on 29 October; 30 October: the "one-party system" abolished, Smallholders and
//   National Peasants with as many inner-cabinet posts as the Communists, a post set aside for a Social Democrat;
//   free elections announced by Tildy); para 70 (30 October: Soviet withdrawal from Budapest begins); para 62 and 506
//   (revolutionary and workers' councils; the Transdanubian National Council set up in Győr on 30 October, about
//   400 delegates); paras 331–332 (the Soviet declaration of 30 October: equality, sovereignty, troops to leave
//   Budapest, talks on troops in Hungary); para 71 (Cardinal Mindszenty, "the most celebrated political prisoner", freed);
//   para 89 (ix) (lynchings by crowds, in almost all cases of members of the ÁVH or people believed to have worked
//   with them); para 770 (the Kádár government's charge of "the lynching of innocent men and women"); para 333
//   (31 October: Nagy to the crowd, "the first days of our sovereignty and independence"); paras 336–338 (1 November:
//   new Soviet units; Nagy to Ambassador Andropov; 4 p.m. the Council of Ministers adopts neutrality and withdrawal
//   from the Warsaw Treaty, Kádár present, no dissent; 7.50 p.m. broadcast; appeal to the UN); para 72 (3 November:
//   three ministries each to Communists, Social Democrats and Smallholders, two to the Petőfi Party; Pál Maléter
//   defence minister).
// - National Security Archive, EBB 76, doc. 6: CPSU Presidium, 31 October 1956, Khrushchev: "We should reexamine
//   our assessment and should not withdraw our troops from Hungary and Budapest. We should take the initiative in
//   restoring order in Hungary." Same briefing book: the attack began at 4.15 a.m. on 4 November.
// - Péter Bertalan, Acta Scientiarum Socialium 46 (2016): Mindszenty freed from his internment at Felsőpetény on
//   30 October 1956.
// - Hungarian Wikipedia, "A Köztársaság téri pártház ostroma" (a start, citing Eörsi László, Köztársaság tér 1956,
//   1956-os Intézet, 2006): 30 October; rumours of prisoners held there; defenders included ÁVH conscripts, party
//   staff and army officers; about two dozen defenders died, some lynched; attackers died too. Fortepan captions:
//   defenders executed during the siege.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  28 October: ceasefire; the broadcast.
//  B  9.6–23.2  29–30 October: the ÁVH dissolved, Soviet tanks leave Budapest, the inner cabinet, the councils.
//  C 23.4–41.6  30 October: Moscow's declaration; Mindszenty freed; Köztársaság tér; 31 October: the reversal.
//  D 41.8–64.6  1 November: new troops, neutrality, the UN; 3 November: four parties; 4 November: the attack.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f1f1d', bg2: '#081110', ink: '#f2efe6', soft: 'rgba(242,239,230,0.74)', faint: 'rgba(242,239,230,0.22)',
  gold: '#f0c060', goldSoft: 'rgba(240,192,96,0.2)', red: '#e05a50', green: '#5fae7a', peasant: '#d8b24a', sd: '#e98fa5', comm: '#c94a4a',
  moscow: '#8e9bb3', moscowBg: 'rgba(142,155,179,0.10)', panel: 'rgba(5,10,9,0.86)',
};
const HEAD = 'Jost', TXT = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the week strip ----------
const DAYS = [[28, 'OCT'], [29, 'OCT'], [30, 'OCT'], [31, 'OCT'], [1, 'NOV'], [2, 'NOV'], [3, 'NOV'], [4, 'NOV']];
const DAY_AT = [[0, 0], [9.6, 1], [14.2, 2], [37.2, 3], [46.4, 4], [55.6, 6], [60.2, 7]];
const dayAt = (t) => DAY_AT.reduce((d, [a, i]) => (t >= a ? i : d), 0);
// from the neutrality declaration (1 November) to the attack (4 November)
const NEUTRAL_DAYS = Math.round((Date.UTC(1956, 10, 4) - Date.UTC(1956, 10, 1)) / 864e5);
if (NEUTRAL_DAYS !== 3) throw new Error('days');

function strip(t) {
  const cw = 86, x0 = CX - (DAYS.length * cw) / 2, y = 176, now = dayAt(t);
  DAYS.forEach(([d, m], i) => {
    const x = x0 + i * cw, cur = i === now, last = i === 7;
    ctx.fillStyle = cur ? (last ? C.red : C.gold) : i < now ? C.goldSoft : 'rgba(242,239,230,0.05)';
    k.rrect(x + 3, y - 30, cw - 6, 60, 8); ctx.fill();
    const col = cur ? '#14100a' : i < now ? C.soft : C.faint;
    font(700, 26); text(String(d), x + cw / 2, y - 6, { align: 'center', color: col });
    font(600, 14); text(m, x + cw / 2, y + 17, { align: 'center', color: col, spacing: '2px' });
  });
}
function lanes(a) {
  A(a, () => {
    font(600, 18); text('BUDAPEST, IN PUBLIC', 70, 240, { color: C.gold, spacing: '2px' });
    ctx.fillStyle = C.moscowBg; ctx.fillRect(0, 590, W, 190);
    font(600, 18); text('MOSCOW, IN SECRET', 70, 612, { color: C.moscow, spacing: '2px' });
  });
}
function tag(s, x, y, col, { size = 21, align = 'center' } = {}) {
  font(600, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
function radio(x, y, s, on) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6b5638'; k.rrect(-70, -46, 140, 92, 12); ctx.fill();
  ctx.fillStyle = '#d8c39a'; ctx.beginPath(); ctx.arc(-28, 0, 28, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2418'; for (let i = 0; i < 4; i++) ctx.fillRect(12, -26 + i * 14, 42, 5);
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const ph = (on * 0.8 + i / 3) % 1;
    A(1 - ph, () => { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 76 * s, y - 20 * s, 20 + ph * 80, -0.9, 0.9); ctx.stroke(); });
  }
}
function tank(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  k.rrect(-34, -6, 68, 20, 8); ctx.fill(); ctx.fillRect(-20, -20, 34, 16); ctx.fillRect(14, -15, 30, 5);
  ctx.restore();
}
function seats(list, cx, cy, r) {
  // list of colours ('' = an empty seat), round a table
  ctx.fillStyle = 'rgba(242,239,230,0.08)'; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.75, r * 0.42, 0, 0, TAU); ctx.fill();
  list.forEach((col, i) => {
    const a = -Math.PI / 2 + (i / list.length) * TAU, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.62;
    if (col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 17, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = C.sd; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  });
}
function legend(items, x, y) {
  items.forEach(([col, s], i) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y + i * 30, 9, 0, TAU); ctx.fill();
    font(500, 19); text(s, x + 18, y + i * 30, { color: C.soft });
  });
}

// ---------- the map of Hungary, schematic ----------
const P = (lon, lat) => [150 + (lon - 16.0) * 82, 300 + (48.7 - lat) * 120];
const HUN = [[17.16, 48.01], [16.95, 47.86], [16.45, 47.68], [16.62, 47.45], [16.45, 47.0], [16.11, 46.87], [16.6, 46.48], [17.3, 46.1], [18.1, 45.78], [18.9, 45.93],
  [19.6, 46.17], [20.7, 46.13], [21.3, 46.65], [21.9, 47.4], [22.4, 47.75], [22.9, 47.97], [22.3, 48.3], [21.6, 48.5], [20.8, 48.57], [20.0, 48.2], [19.0, 48.07], [18.7, 47.78], [17.8, 47.75]];
const COUNCILS = [[17.63, 47.68], [18.23, 46.07], [21.63, 47.53], [20.78, 48.1], [20.15, 46.25], [17.91, 47.09], [18.41, 47.19], [19.69, 46.91], [16.62, 47.23], [20.37, 47.9], [21.72, 47.96], [19.04, 47.5]];
function map(a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(242,239,230,0.06)'; ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5;
    ctx.beginPath(); HUN.forEach((q, i) => (i ? ctx.lineTo(...P(...q)) : ctx.moveTo(...P(...q)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    const b = P(19.04, 47.5); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(b[0], b[1], 7, 0, TAU); ctx.fill();
    font(600, 19); text('Budapest', b[0] - 12, b[1] - 16, { align: 'right' });
    font(500, 17); text('Schematic map', 70, 568, { color: C.faint });
  });
}

// ---------- A: the ceasefire and the broadcast ----------
function sceneCeasefire(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    font(700, 34); text('THE WEEK OF HOPE', 70, 92, { spacing: '2px' });
    radio(250, 400, 1.3, t);
    A(seg(t, 1.2, 1.8), () => {
      font(700, 26); text('CEASEFIRE', 470, 330, { color: C.gold, spacing: '2px' });
      font(500, 21, TXT); text('ordered by Prime Minister', 470, 368, { color: C.soft }); text('Imre Nagy, 28 October', 470, 394, { color: C.soft });
    });
    A(seg(t, 5.4, 6.0), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 470, 684, 100, 14); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      font(600, 23, TXT); text('“a great national and democratic movement”', CX, 506, { align: 'center', color: C.gold });
      font(500, 18, TXT); text('not a “counter-revolution”: Nagy on the radio, 5.25 p.m.', CX, 542, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: dissolved, leaving, the cabinet, the councils ----------
function sceneChange(t) {
  A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
    // the ÁVH badge, struck through
    ctx.fillStyle = '#2b3b52'; ctx.beginPath(); ctx.arc(230, 400, 70, 0, TAU); ctx.fill();
    font(800, 34); text('ÁVH', 230, 402, { align: 'center', color: C.ink });
    A(seg(t, 10.4, 10.9), () => { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(160, 470); ctx.lineTo(300, 330); ctx.stroke(); ctx.lineCap = 'butt'; });
    font(600, 20, TXT); text('29 Oct: security police dissolved', 230, 500, { align: 'center', color: C.soft });
    // tanks leaving the city
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(560, 400, 100, 0, TAU); ctx.stroke();
    font(600, 18); text('Budapest', 560, 300 - 14, { align: 'center', color: C.soft });
    const g = eio(seg(t, 11.6, 13.8));
    for (let i = 0; i < 3; i++) tank(530 + g * 260 + i * 6, 360 + i * 40, 0.8, C.moscow);
    font(600, 20, TXT); text('30 Oct: Soviet tanks begin to leave', 560, 540, { align: 'center', color: C.soft });
  });
  // the inner cabinet of 30 October
  A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
    tag('30 OCTOBER: ONE-PARTY RULE ENDS', CX, 280, C.gold);
    seats([C.comm, C.comm, C.comm, C.green, C.green, C.peasant, ''], 300, 430, 120);
    legend([[C.comm, 'Communists'], [C.green, 'Smallholders'], [C.peasant, 'National Peasants'], [C.sd, 'kept for a Social Democrat']], 470, 380);
    A(seg(t, 15.6, 16.2), () => { font(600, 20, TXT); text('free elections promised', 470, 520, { color: C.gold }); });
    font(500, 18); text('the inner cabinet', 300, 540, { align: 'center', color: C.faint });
  });
  // councils across the country
  A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
    map(1);
    COUNCILS.forEach(([lo, la], i) => {
      const g = seg(t, 19.2 + i * 0.18, 19.6 + i * 0.18), [x, y] = P(lo, la);
      A(g, () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 9 * eout(g), 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(240,192,96,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke(); });
    });
    A(seg(t, 20.6, 21.2), () => tag('Győr, 30 Oct: about 400 delegates', 600, 280, C.gold, { size: 19 }));
    A(seg(t, 19.4, 20.0), () => { font(600, 20, TXT); text('revolutionary and workers’ councils', CX, 560, { align: 'center', color: C.soft }); });
  });
}

// ---------- C: Moscow's declaration, Mindszenty, Köztársaság tér, the reversal ----------
function sceneThirty(t) {
  // Moscow's declaration of 30 October, in the Moscow lane
  A(span(t, 23.4, 28.2, 0.4, 0.4), () => {
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(260, 300, 344, 230);
    font(700, 21); text('DECLARATION', CX, 334, { align: 'center', color: '#2a2a2a', spacing: '2px' });
    font(500, 17); text('Soviet government, 30 October 1956', CX, 362, { align: 'center', color: '#555' });
    ['equality between socialist states', 'respect for sovereignty', 'troops to leave Budapest', 'talks on troops in Hungary'].forEach((s, i) => {
      A(seg(t, 24.2 + i * 0.5, 24.8 + i * 0.5), () => { font(500, 19, TXT); text('· ' + s, 290, 404 + i * 30, { color: '#2a2a2a' }); });
    });
    A(seg(t, 25.6, 26.2), () => tag('in Budapest: hope', CX, 680, C.gold));
  });
  // Mindszenty freed
  A(span(t, 28.0, 32.8, 0.4, 0.4), () => {
    // a plain figure in a red cardinal's robe
    ctx.fillStyle = '#b4322e'; ctx.beginPath(); ctx.moveTo(CX - 60, 520); ctx.lineTo(CX - 34, 380); ctx.lineTo(CX + 34, 380); ctx.lineTo(CX + 60, 520); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8d9c4'; ctx.beginPath(); ctx.arc(CX, 352, 26, 0, TAU); ctx.fill();
    ctx.fillStyle = '#b4322e'; ctx.beginPath(); ctx.arc(CX, 338, 16, Math.PI, 0); ctx.fill();
    // the open door of a cell
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.strokeRect(200, 320, 110, 200);
    const g = eio(seg(t, 28.4, 29.4));
    ctx.fillStyle = 'rgba(242,239,230,0.12)'; ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(200 + 110 * (1 - g * 0.8), 320 + 20 * g); ctx.lineTo(200 + 110 * (1 - g * 0.8), 520 - 20 * g); ctx.lineTo(200, 520); ctx.closePath(); ctx.fill();
    font(700, 22); text('Cardinal József Mindszenty', CX, 566, { align: 'center' });
    font(500, 19, TXT); text('head of Hungary’s Catholic Church, freed on 30 October', CX, 596, { align: 'center', color: C.soft });
  });
  // Köztársaság tér: told in words
  A(span(t, 32.6, 37.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; k.rrect(80, 270, 704, 420, 18); ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke();
    font(700, 24); text('KÖZTÁRSASÁG TÉR, 30 OCTOBER', CX, 316, { align: 'center', color: C.red, spacing: '1px' });
    const lines = [
      ['Insurgents besiege the Budapest headquarters', C.ink], ['of the Communist Party.', C.ink],
      ['After it falls, defenders are shot and', C.ink], ['some lynched by the crowd.', C.ink],
      ['Among the dead: young conscript guards,', C.soft], ['party workers and army officers.', C.soft],
      ['Attackers die too.', C.soft],
    ];
    lines.forEach(([s, col], i) => A(seg(t, 33.0 + i * 0.35, 33.5 + i * 0.35), () => { font(500, 22, TXT); text(s, CX, 370 + i * 40 + (i > 3 ? 16 : 0), { align: 'center', color: col }); }));
  });
  // 31 October, Moscow, in secret
  A(span(t, 37.2, 46.6, 0.4, 0.4), () => {
    lanes(1);
    // Budapest lane: the crowd hears "the first days of our sovereignty"
    A(span(t, 37.2, 46.6, 0.3, 0.4), () => {
      radio(170, 360, 0.8, t);
      font(600, 21, TXT); text('Nagy to a crowd at Parliament:', 280, 332, { color: C.soft });
      font(600, 23, TXT); text('“the first days of our sovereignty”', 280, 366, { color: C.gold });
    });
    // Moscow lane: the reversal
    A(seg(t, 38.6, 39.2), () => {
      font(700, 23); text('31 Oct: Presidium of the Soviet party', 70, 652, { color: C.moscow });
      font(500, 21, TXT); text('Khrushchev: “should not withdraw our troops”;', 70, 690, { color: C.ink });
      text('take “the initiative in restoring order”', 70, 720, { color: C.ink });
    });
    A(seg(t, 42.4, 43.0), () => {
      tag('a decision Budapest does not know', 600, 470, C.moscow, { size: 20 });
      ctx.strokeStyle = C.moscow; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(600, 490); ctx.lineTo(600, 580); ctx.stroke(); ctx.setLineDash([]);
    });
  });
}

// ---------- D: troops, neutrality, four parties, the attack ----------
function sceneNeutral(t) {
  // 1 November: new troops; neutrality; the UN
  A(span(t, 46.4, 55.8, 0.4, 0.4), () => {
    map(1);
    const g = eio(seg(t, 46.8, 48.8));
    for (const [a, b] of [[[860, 250], P(22.17, 48.41)], [[860, 470], P(21.9, 47.4)], [[640, 230], P(20.4, 48.45)]]) {
      const end = [lerp(a[0], b[0], g), lerp(a[1], b[1], g)];
      ctx.strokeStyle = C.moscow; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...end); ctx.stroke(); ctx.lineCap = 'butt';
      tank(end[0], end[1], 0.7, C.moscow);
    }
    A(seg(t, 48.4, 49.0) * (1 - seg(t, 50.6, 51.0)), () => tag('1 Nov: new Soviet units cross the border', CX, 680, C.moscow, { size: 20 }));
    A(seg(t, 51.0, 51.4), () => {
      ctx.fillStyle = C.panel; k.rrect(140, 610, 584, 150, 16); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
      font(800, 40); text('NEUTRAL', CX, 656, { align: 'center', color: C.gold, spacing: '6px' });
      font(500, 20, TXT); text('out of the Warsaw Pact · 7.50 p.m. broadcast', CX, 700, { align: 'center', color: C.ink });
      A(seg(t, 52.2, 52.8), () => { font(500, 19, TXT); text('an appeal to the United Nations', CX, 732, { align: 'center', color: C.soft }); });
    });
  });
  // 3 November: four parties
  A(span(t, 55.6, 60.4, 0.4, 0.4), () => {
    tag('3 NOVEMBER: A GOVERNMENT OF FOUR PARTIES', CX, 280, C.gold, { size: 20 });
    seats([C.comm, C.comm, C.comm, C.sd, C.sd, C.sd, C.green, C.green, C.green, C.peasant, C.peasant], 300, 450, 140);
    legend([[C.comm, 'Communists: 3'], [C.sd, 'Social Democrats: 3'], [C.green, 'Smallholders: 3'], [C.peasant, 'Petőfi Party: 2']], 490, 400);
    font(600, 20, TXT); text('defence: Pál Maléter', 490, 540, { color: C.soft });
  });
  // 4 November
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    map(0.6);
    font(800, 44); text('4.15 a.m.', CX, 640, { align: 'center', color: C.red });
    font(600, 22, TXT); text('the Soviet attack begins', CX, 690, { align: 'center', color: C.ink });
    A(seg(t, 61.4, 62.0), () => tag(`neutral Hungary: ${fmt(NEUTRAL_DAYS)} days`, CX, 280, C.gold, { size: 21 }));
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
  [0.4, 4.8, 'Budapest, 28 October 1956: after five days’ fighting, Prime Minister *Imre Nagy* orders a ceasefire.'],
  [5.0, 9.4, 'On the radio he rejects “counter-revolution”: this is *“a great national and democratic movement”*.'],
  [9.6, 14.0, '29 October: the *ÁVH* security police is dissolved. Next day Soviet tanks start leaving Budapest.'],
  [14.2, 18.6, '30 October: *one-party rule ends*. Other parties join the cabinet; free elections are promised.'],
  [18.8, 23.2, 'Across the country, *revolutionary and workers’ councils* run towns and factories.'],
  [23.4, 27.8, 'The same day Moscow declares it will respect its allies’ *sovereignty* and talk about its troops.'],
  [28.0, 32.4, 'Cardinal *József Mindszenty*, a prisoner of the regime for years, is freed.'],
  [32.6, 37.0, 'At Köztársaság tér, insurgents take the Communist Party offices, and ~defenders are lynched~.'],
  [37.2, 41.6, '31 October: Nagy tells a crowd these are *“the first days of our sovereignty”*.'],
  [41.8, 46.2, 'In secret that day, Soviet leader ~Nikita Khrushchev~ reverses course: the troops will “restore order”.'],
  [46.4, 50.8, '1 November: new Soviet divisions cross the border. Nagy protests to the Soviet ambassador.'],
  [51.0, 55.4, 'That evening Hungary declares itself *neutral*, leaves the Warsaw Pact and appeals to the UN.'],
  [55.6, 60.0, 'On 3 November Nagy forms a government of *four parties*, with Pál Maléter as defence minister.'],
  [60.2, 64.6, 'Before dawn on 4 November the ~Soviet army attacks~. Neutral Hungary had lasted three days.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    A(seg(t, 0, 0.6), () => strip(t));
    sceneCeasefire(t);
    sceneChange(t);
    sceneThirty(t);
    sceneNeutral(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.red } });
  },
});
