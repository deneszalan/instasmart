// Explainer for politics-nobel-peace-prize-norway: why the Nobel Peace Prize is chosen in Oslo by five people
// the Norwegian parliament elects, while the other Nobel prizes are Swedish. Look: deep oxblood and gold, like
// a medal case; six medals sorted between Stockholm (pale blue) and Oslo (gold); the will as a cream card; a
// funnel of nominations; Navi Pillay's career as a timeline. Cinzel (Roman capitals) for titles and numbers,
// Libre Caslon Text for captions.
//
// Facts: Wikipedia, "Nobel Prize": Nobel signed his last will at the Swedish–Norwegian Club in Paris on
// 27 November 1895 and died on 10 December 1896; the prizes were first awarded in 1901; the Royal Swedish Academy
// of Sciences chooses physics, chemistry and (since the Riksbank's prize was set up in 1968, first awarded in
// 1969) economic sciences, the Nobel Assembly at Karolinska physiology or medicine, the Swedish Academy literature;
// all but the Peace Prize are presented in Stockholm. Nobel Peace Center: the will gives the Peace Prize to a
// committee "of five persons, to be elected by the Norwegian Storting". Wikipedia, "Norwegian Nobel Committee":
// it is not known why Nobel wanted the prize administered in Norway; Sweden and Norway were in a union until
// 1905. Wikipedia, "Nobel Peace Prize": the committee has suggested Norway lacked Sweden's militaristic
// traditions and its parliament was closely involved in efforts to settle conflicts by mediation and
// arbitration; nominations stay secret for at least 50 years; the prize is presented in Oslo City Hall on
// 10 December. Reuters via Arab News (30 April 2026): 287 nominations for 2026, 208 individuals and 79
// organisations, deadline 31 January. Norwegian Nobel Committee press release (9 October 2026): the prize to
// Navanethem "Navi" Pillay "for her efforts to promote peace and international law". Wikipedia, "Navi Pillay":
// born 1941 in Durban; in 1967 the first non-white woman to open a law practice in Natal; judge at the
// International Criminal Tribunal for Rwanda 1995–2003, where the Akayesu judgment (2 September 1998) found that
// rape could be an act of genocide; judge at the International Criminal Court 2003–2008; UN High Commissioner
// for Human Rights 1 September 2008 – 31 August 2014.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the 2026 prize; six medals, five in Stockholm and one in Oslo.
//  B  9.0–33.0  The will of 1895: who chooses what; the union until 1905; Nobel never said why.
//  C 33.0–42.2  287 nominations, a shortlist, one laureate; secret for 50 years.
//  D 42.2–60.0  Navi Pillay: the citation and her career.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#2a0d12', bg2: '#4a1620', gold: '#d9b25f', gold2: '#f0d48e', ink: '#f6ead8', soft: 'rgba(246,234,216,0.74)', faint: 'rgba(246,234,216,0.3)',
  swe: '#9db9d8', rose: '#f0a39a', card: '#f4ead6', cardInk: '#3a1218',
};
const CAPS = 'Cinzel', SERIF = 'Libre Caslon Text';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- facts ----------
const PRIZES = [
  { name: 'Physics', by: 'Royal Swedish Academy of Sciences', oslo: false },
  { name: 'Chemistry', by: 'Royal Swedish Academy of Sciences', oslo: false },
  { name: 'Medicine', by: 'Karolinska Institutet', oslo: false },
  { name: 'Literature', by: 'Swedish Academy', oslo: false },
  { name: 'Economics', by: 'Royal Swedish Academy of Sciences', oslo: false },
  { name: 'Peace', by: 'Norwegian Nobel Committee', oslo: true },
];
const IN_STOCKHOLM = PRIZES.filter((p) => !p.oslo).length; // 5
const NOMINATIONS = { people: 208, groups: 79 };
const TOTAL = NOMINATIONS.people + NOMINATIONS.groups; // 287

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 9 October 2026 the Nobel Peace Prize went to *Navi Pillay*, announced in *Oslo*.'],
  [4.8, 9.0, `The other ${IN_STOCKHOLM} Nobel prizes are chosen in ~Stockholm~. Why is this one Norwegian?`],
  [9.2, 13.6, 'Alfred Nobel signed his will on *27 November 1895*, at the Swedish–Norwegian Club in Paris.'],
  [13.8, 18.2, 'It gave the science and literature prizes to institutions in ~Stockholm~.'],
  [18.4, 23.6, 'Peace went to *a committee of five*, elected by Norway’s parliament, the Storting.'],
  [23.8, 28.2, 'Sweden and Norway were then in a *union*. It lasted until 1905.'],
  [28.4, 33.0, 'Nobel never said why. One idea: Norway’s parliament backed settling disputes by arbitration.'],
  [33.2, 37.6, `For 2026 the committee received *${TOTAL} nominations*: ${NOMINATIONS.people} people and ${NOMINATIONS.groups} organisations.`],
  [37.8, 42.2, 'The five draw up a shortlist, ask advisers for reports, and keep it all secret for 50 years.'],
  [42.4, 46.8, 'They chose Navi Pillay “for her efforts to promote *peace and international law*”.'],
  [47.0, 51.4, 'Born under apartheid in Durban, she became a lawyer and defended its opponents.'],
  [51.6, 55.8, 'As a judge for Rwanda, she helped rule in 1998 that *rape* can be an act of genocide.'],
  [56.0, 60.0, 'From 2008 to 2014 she was the UN’s *High Commissioner for Human Rights*.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 380, 40, W / 2, 420, 820);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // a fine damask of laurel-like arcs
  g.strokeStyle = 'rgba(217,178,95,0.05)'; g.lineWidth = 2;
  for (let y = 60; y < H; y += 120) for (let x = (y / 120) % 2 ? 60 : 0; x < W + 60; x += 120) {
    g.beginPath(); g.arc(x, y, 26, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    g.beginPath(); g.arc(x, y + 22, 26, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }
}

// ---------- a medal ----------
function medal(x, y, r, label, col = C.gold, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, col === C.gold ? C.gold2 : '#d5e3f1'); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(42,13,18,0.35)'; ctx.lineWidth = Math.max(2, r * 0.06); ctx.beginPath(); ctx.arc(x, y, r * 0.82, 0, Math.PI * 2); ctx.stroke();
    if (label) { k.font(700, Math.round(r * 0.36), CAPS); text(label, x, y + 2, { align: 'center', base: 'middle', color: C.cardInk }); }
  });
}

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    const split = eio(seg(t, 4.8, 6.2));
    A(1 - split, () => {
      const s = back(seg(t, 0.3, 1.3));
      medal(CX, 380, 150 * Math.max(0.01, s), '', C.gold, eout(seg(t, 0.3, 0.9)));
      A(eout(seg(t, 1.0, 1.6)), () => {
        k.font(700, 54, CAPS); text('2026', CX, 384, { align: 'center', base: 'middle', color: C.cardInk });
      });
      A(eout(seg(t, 1.6, 2.4)), () => {
        k.font(700, 30, CAPS); text('The Nobel Peace Prize', CX, 600, { align: 'center', base: 'middle', color: C.gold });
        font(400, 26); text('Navanethem “Navi” Pillay · South Africa', CX, 650, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    // six medals sorted between the two cities
    A(split, () => {
      k.font(700, 32, CAPS); text('Stockholm', 280, 190, { align: 'center', base: 'middle', color: C.swe });
      text('Oslo', 690, 190, { align: 'center', base: 'middle', color: C.gold });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(560, 160); ctx.lineTo(560, 690); ctx.stroke(); ctx.setLineDash([]);
      PRIZES.forEach((p, i) => {
        const g = eio(seg(t, 5.2 + i * 0.25, 6.4 + i * 0.25));
        const sx = 132 + i * 120, sy = 420, tx = p.oslo ? 690 : 190 + (i % 2) * 180, ty = p.oslo ? 420 : 290 + Math.floor(i / 2) * 140;
        const x = lerp(sx, tx, g), y = lerp(sy, ty, g);
        medal(x, y, p.oslo ? 74 : 52, '', p.oslo ? C.gold : C.swe);
        font(700, 22); text(p.name, x, y + (p.oslo ? 104 : 76), { align: 'center', base: 'middle', color: p.oslo ? C.gold : C.ink });
      });
    });
  });
}

function sceneWill(t) {
  const a = span(t, 9.2, 33.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the will, as a card
    const cardA = span(t, 9.3, 23.8, 0.4, 0.4);
    A(cardA, () => {
      ctx.fillStyle = C.card; k.rrect(92, 150, 680, 560, 16); ctx.fill();
      k.font(700, 30, CAPS); text('Last will · Paris · 27 November 1895', CX, 200, { align: 'center', base: 'middle', color: C.cardInk });
      ctx.fillStyle = 'rgba(58,18,24,0.25)'; ctx.fillRect(140, 228, 584, 2);
      A(span(t, 9.8, 13.9, 0.5, 0.4), () => {
        font(400, 28); text('signed at the Swedish–Norwegian Club', CX, 380, { align: 'center', base: 'middle', color: 'rgba(58,18,24,0.75)' });
        k.font(700, 30, CAPS); text('Alfred Nobel', CX, 470, { align: 'center', base: 'middle', color: C.cardInk });
        ctx.fillStyle = 'rgba(58,18,24,0.4)'; ctx.fillRect(282, 500, 300, 2);
      });
      const rows = [
        ['Physics, Chemistry', 'Royal Swedish Academy of Sciences', 13.9, false],
        ['Medicine', 'Karolinska Institutet', 14.6, false],
        ['Literature', 'Swedish Academy', 15.3, false],
        ['Peace', 'five persons elected by the Storting', 18.5, true],
      ];
      rows.forEach(([prize, who, at, oslo], i) => {
        const y = 290 + i * 104, g = eout(seg(t, at, at + 0.7));
        A(g, () => {
          font(700, 28); text(prize, 140, y, { base: 'middle', color: C.cardInk });
          font(400, 24); text(who, 140, y + 36, { base: 'middle', color: oslo ? '#8a2a1a' : 'rgba(58,18,24,0.75)' });
          k.font(700, 22, CAPS); text(oslo ? 'Oslo' : 'Stockholm', 724, y, { align: 'right', base: 'middle', color: oslo ? '#9a6b12' : '#3d5f86' });
        });
      });
      // the committee of five
      A(seg(t, 19.2, 19.8), () => {
        for (let i = 0; i < 5; i++) {
          const x = 540 + i * 40, y = 670, g = back(seg(t, 19.4 + i * 0.12, 19.9 + i * 0.12));
          if (g <= 0) continue;
          ctx.fillStyle = '#9a6b12'; ctx.beginPath(); ctx.arc(x, y - 12, 10 * g, 0, Math.PI * 2); ctx.fill(); k.rrect(x - 13 * g, y, 26 * g, 24 * g, 8); ctx.fill();
        }
      });
    });
    // the union, on a timeline
    A(span(t, 23.8, 33.2, 0.4, 0.4), () => {
      const L = 110, R = 754, y = 420, y0 = 1890, y1 = 1910, X = (yr) => L + ((yr - y0) / (y1 - y0)) * (R - L);
      const g = eio(seg(t, 24.0, 25.4));
      ctx.fillStyle = C.swe; k.rrect(L, y - 70, (X(1905) - L) * g, 36, 8); ctx.fill();
      ctx.fillStyle = C.gold; k.rrect(L, y - 30, (X(1905) - L) * g, 36, 8); ctx.fill();
      A(seg(t, 25.0, 25.6), () => {
        font(700, 24); text('Sweden', L + 14, y - 52, { base: 'middle', color: C.cardInk }); text('Norway', L + 14, y - 12, { base: 'middle', color: C.cardInk });
        font(700, 28); text('one union until 1905', L, y - 106, { base: 'middle', color: C.ink });
      });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, y + 40); ctx.lineTo(R, y + 40); ctx.stroke();
      const marks = [[1895, 'will'], [1896, 'Nobel dies'], [1901, 'first prizes'], [1905, 'union ends']];
      marks.forEach(([yr, l], i) => {
        const gg = eout(seg(t, 24.6 + i * 0.3, 25.2 + i * 0.3)), x = X(yr);
        A(gg, () => {
          ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y + 40, 8, 0, Math.PI * 2); ctx.fill();
          k.font(700, 24, CAPS); text(`${yr}`, x, y + 80 + (i % 2) * 70, { align: 'center', base: 'middle', color: C.gold });
          font(400, 22); text(l, x, y + 110 + (i % 2) * 70, { align: 'center', base: 'middle', color: C.soft });
        });
      });
      A(span(t, 28.4, 33.2), () => {
        k.font(700, 72, CAPS); text('?', CX, 230, { align: 'center', base: 'middle', color: C.rose });
      });
    });
  });
}

function sceneFunnel(t) {
  const a = span(t, 33.2, 42.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 287 nominations as dots (people round, organisations square) that funnel to one
    const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const f = eio(seg(t, 38.0, 40.6));
    for (let i = 0; i < TOTAL; i++) {
      const col = i % 23, row = Math.floor(i / 23);
      const x0 = 140 + col * 26 + (row % 2) * 13, y0 = 200 + row * 26;
      const keep = i === 140, short = rnd(i) < 0.05;
      const tx = keep ? CX : short ? CX + (rnd(i + 7) - 0.5) * 140 : x0, ty = keep ? 640 : short ? 560 + rnd(i + 3) * 40 : y0;
      const fade = keep || short ? 1 : 1 - 0.8 * f;
      const x = lerp(x0, tx, f * (keep || short ? 1 : 0)), y = lerp(y0, ty, f * (keep || short ? 1 : 0));
      const g = eout(seg(t, 33.4 + (i / TOTAL) * 1.6, 33.8 + (i / TOTAL) * 1.6));
      A(g * fade, () => {
        ctx.fillStyle = keep && f > 0.9 ? C.gold : i < NOMINATIONS.people ? C.ink : C.rose;
        if (i < NOMINATIONS.people) { ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(x - 7, y - 7, 14, 14);
      });
    }
    A(span(t, 34.6, 38.0), () => {
      font(700, 26); text(`${NOMINATIONS.people} people`, 140, 560, { base: 'middle', color: C.ink });
      text(`${NOMINATIONS.groups} organisations`, 724, 560, { align: 'right', base: 'middle', color: C.rose });
      k.font(700, 30, CAPS); text(`${TOTAL} nominations · deadline 31 January`, CX, 150, { align: 'center', base: 'middle', color: C.gold });
    });
    A(seg(t, 39.0, 39.6), () => {
      font(700, 24); text('shortlist', CX + 120, 580, { base: 'middle', color: C.soft });
      k.font(700, 28, CAPS); text('secret for 50 years', CX, 150, { align: 'center', base: 'middle', color: C.gold });
    });
  });
}

function scenePillay(t) {
  const a = eout(seg(t, 42.4, 43.2));
  if (a <= 0) return;
  A(a, () => {
    // the citation as a card
    const q = span(t, 42.4, 47.2, 0.4, 0.4);
    A(q, () => {
      ctx.fillStyle = C.card; k.rrect(112, 220, 640, 360, 16); ctx.fill();
      k.font(700, 22, CAPS); text('Norwegian Nobel Committee · 9 Oct 2026', CX, 268, { align: 'center', base: 'middle', color: '#8a2a1a' });
      font(400, 38); text('“for her efforts to promote', CX, 370, { align: 'center', base: 'middle', color: C.cardInk });
      text('peace and international law”', CX, 424, { align: 'center', base: 'middle', color: C.cardInk });
      k.font(700, 30, CAPS); text('Navi Pillay', CX, 512, { align: 'center', base: 'middle', color: '#9a6b12' });
    });
    // the career, as a list
    const rows = [
      [47.0, '1941', 'born in Durban, under apartheid'],
      [47.4, '1967', 'opens her own law practice in Natal'],
      [51.6, '1995–2003', 'judge at the Rwanda tribunal', '1998: rape can be an act of genocide'],
      [53.4, '2003–2008', 'judge at the International Criminal Court'],
      [56.0, '2008–2014', 'UN High Commissioner for Human Rights'],
      [57.4, '2026', 'Nobel Peace Prize'],
    ];
    rows.forEach(([at2, when, what, sub], i) => {
      const g = eout(seg(t, at2, at2 + 0.6)), y = 200 + i * 86 + (i > 2 ? 30 : 0);
      A(g, () => {
        k.font(700, 26, CAPS); text(when, 80, y, { base: 'middle', color: i === 5 ? C.gold2 : C.gold });
        font(700, 25); text(what, 266, y, { base: 'middle', color: C.ink });
        if (sub) { font(400, 24); text(sub, 266, y + 36, { base: 'middle', color: C.rose }); }
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [CAPS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneWill(t);
    sceneFunnel(t);
    scenePillay(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.gold2, '~': C.swe } });
  },
});
