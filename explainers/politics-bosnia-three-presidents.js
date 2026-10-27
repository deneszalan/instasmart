// Explainer for politics-bosnia-three-presidents: Bosnia and Herzegovina has a three-member presidency, one
// seat per constituent people, each elected in one part of the country. Look: warm linen with a faint woven
// (ćilim) border, deep indigo ink, three chairs at one table; warm ochre for the Federation and cool blue for
// Republika Srpska; the three seats in terracotta, gold and blue. Fira Sans for numbers and labels, Alegreya
// for captions (both have ć, č, ž).
//
// Facts: Wikipedia, "Dayton Agreement": initialled at Dayton, Ohio, on 21 November 1995 and signed in Paris on
// 14 December 1995, ending the three-and-a-half-year Bosnian War; the constitution is its Annex 4 (Wikipedia,
// "Constitution of Bosnia and Herzegovina"). Wikipedia, "Presidency of Bosnia and Herzegovina": one Bosniak and
// one Croat member directly elected from the Federation, one Serb member from Republika Srpska; four-year terms,
// at most two in a row; the chair rotates among the three every eight months. Wikipedia, "2026 Bosnian general
// election" (citing the Central Election Commission): members elected by plurality; Federation voters may vote
// for the Bosniak or the Croat member but not both; Bosniak race Denis Bećirović (SDP BiH) 222,484 (38.10%),
// Bakir Izetbegović 34.14%, Semir Efendić 25.61%, Fahrudin Radončić 2.15%; Croat race Darijana Filipović
// (HDZ BiH) 120,701 (47.28%), Slaven Kovačević 30.03%, Zdenko Lučić 22.69%; Serb race Željka Cvijanović (SNSD)
// 319,705 (55.57%), Marinko Božović 26.38%, Nebojša Vukanović 18.05%; turnout 42.98% for the presidency, the
// lowest ever. N1 (24 October 2026): the commission set out the results on 24 October; they are not yet finally
// confirmed. European Court of Human Rights: Sejdić and Finci v. Bosnia and Herzegovina (Grand Chamber,
// 22 December 2009; the applicants are Roma and Jewish): barring people who do not declare themselves Bosniak,
// Croat or Serb from the presidency is discriminatory (16 votes to 1); Zornić (2014): the same for a citizen who
// declared no affiliation; Pilav (2016): a Bosniak living in Republika Srpska. Wikipedia: no reform had been
// implemented as of 2025.
// Computed here: 48 months / 8 = 6 turns as chair, so each member chairs twice; 3 of the 8 combinations of
// people (Bosniak, Croat, Serb, other) and places (Federation, Republika Srpska) may stand.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: three chairs; Dayton 1995.
//  B  9.0–23.6  Two entities, three seats, two ballots in the Federation, plurality.
//  C 23.6–37.6  2026: the three races, turnout 43%; the rotating chair.
//  D 37.6–51.4  Six turns in four years; who may stand: 3 of 8.
//  E 51.4–60.0  Strasbourg rulings; the 2026 vote used the old rules.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#f4efe4', bg2: '#ebe3d3', weave: 'rgba(160,80,50,0.10)', ink: '#1d2550', soft: 'rgba(29,37,80,0.7)', faint: 'rgba(29,37,80,0.28)',
  fed: '#e3b04b', fedSoft: 'rgba(227,176,75,0.22)', rs: '#5b8fd6', rsSoft: 'rgba(91,143,214,0.2)',
  bosniak: '#c8553d', croat: '#d39a2c', serb: '#3a5ba8', grey: '#b9b2a3', white: '#fffdf8', mark: '#b0402c',
};
const NUM = 'Fira Sans', SERIF = 'Alegreya';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the 2026 races (Central Election Commission, via Wikipedia) ----------
const RACES = [
  { seat: 'Bosniak member', where: 'Federation', col: C.bosniak, rows: [['Denis Bećirović', 'SDP BiH', 38.10], ['Bakir Izetbegović', 'SDA', 34.14], ['Semir Efendić', 'SBiH', 25.61], ['Fahrudin Radončić', 'SBB', 2.15]] },
  { seat: 'Croat member', where: 'Federation', col: C.croat, rows: [['Darijana Filipović', 'HDZ BiH', 47.28], ['Slaven Kovačević', 'DF', 30.03], ['Zdenko Lučić', 'independent', 22.69]] },
  { seat: 'Serb member', where: 'Republika Srpska', col: C.serb, rows: [['Željka Cvijanović', 'SNSD', 55.57], ['Marinko Božović', 'SDS', 26.38], ['Nebojša Vukanović', 'ZPR', 18.05]] },
];
const TURNOUT = 42.98;
const TERM_MONTHS = 48, CHAIR_MONTHS = 8, TURNS = TERM_MONTHS / CHAIR_MONTHS; // 6
const PEOPLE = ['Bosniak', 'Croat', 'Serb', 'other or none'], PLACES = ['Federation', 'Republika Srpska'];
const MAY_STAND = (p, w) => (w === 0 && (p === 0 || p === 1)) || (w === 1 && p === 2);
const ALLOWED = PEOPLE.reduce((n, _, p) => n + PLACES.filter((_, w) => MAY_STAND(p, w)).length, 0); // 3

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 4 October 2026, Bosnia and Herzegovina elected its head of state: *three people*.'],
  [4.8, 9.0, 'The design comes from the *Dayton Agreement*, which ended the war in 1995.'],
  [9.2, 13.6, 'The country has two parts: the ~Federation~ and ^Republika Srpska^.'],
  [13.8, 18.2, 'The ~Federation~ elects a *Bosniak* and a *Croat* member: each voter picks one ballot.'],
  [18.4, 23.6, '^Republika Srpska^ elects the *Serb* member. In each race, the most votes wins.'],
  [23.8, 28.2, 'Winners on 24 October, not yet final: Denis Bećirović, Darijana Filipović, Željka Cvijanović.'],
  [28.4, 33.0, `Turnout was *${Math.round(TURNOUT)}%*, the lowest ever for a Bosnian general election.`],
  [33.2, 37.6, 'The three share one presidency, and the chair *rotates every eight months*.'],
  [37.8, 42.2, `In a four-year term that’s *${TURNS} turns*: each member chairs ${TURNS / 3 === 2 ? 'twice' : TURNS / 3 + ' times'}.`],
  [42.4, 46.8, `Only a Bosniak or Croat in the Federation, or a Serb in Republika Srpska, may run.`],
  [47.0, 51.4, 'A Jewish or Roma citizen, or one who declares no group, cannot run at all.'],
  [51.6, 55.8, 'In 2009, Europe’s human rights court ruled that this is *discrimination*.'],
  [56.0, 60.0, 'It said so again in 2014 and 2016, but the 2026 vote still used the old rules.'],
];

// ---------- background: linen with a woven border ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(120,90,50,${r() * 0.05})`; g.lineWidth = 1; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + (r() - 0.5) * 4); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(120,90,50,${r() * 0.04})`; const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 4, H); g.stroke(); }
  // ćilim-like diamonds along the top and bottom edges
  g.fillStyle = C.weave;
  for (const y0 of [1000]) for (let x = 0; x < W + 40; x += 48) {
    g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 24, y0 - 18); g.lineTo(x + 48, y0); g.lineTo(x + 24, y0 + 18); g.closePath(); g.fill();
    g.fillRect(x + 20, y0 - 3, 8, 6);
  }
}

// ---------- chairs ----------
function chair(x, y, s, col, crown = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(29,37,80,0.12)'; ctx.beginPath(); ctx.ellipse(0, 112, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;
  k.rrect(-50, -90, 100, 110, 16); ctx.fill(); // back
  k.rrect(-62, 18, 124, 30, 10); ctx.fill(); // seat
  ctx.fillRect(-54, 44, 12, 66); ctx.fillRect(42, 44, 12, 66); // legs
  if (crown > 0) A(crown, () => {
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(-28, -112); ctx.lineTo(-28, -140); ctx.lineTo(-14, -124); ctx.lineTo(0, -146); ctx.lineTo(14, -124); ctx.lineTo(28, -140); ctx.lineTo(28, -112); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
}
const SEATS = [C.bosniak, C.croat, C.serb];

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 26); text('BOSNIA AND HERZEGOVINA · PRESIDENCY', CX, 140, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); });
    const up = eio(seg(t, 4.8, 5.8));
    SEATS.forEach((col, i) => {
      const g = back(seg(t, 0.6 + i * 0.35, 1.3 + i * 0.35));
      if (g <= 0) return;
      chair(lerp(CX + (i - 1) * 230, CX + (i - 1) * 150, up), lerp(430, 330, up), lerp(1.3, 0.85, up) * Math.max(0.01, g), col);
    });
    // the table
    A(eout(seg(t, 1.6, 2.4)), () => { ctx.fillStyle = C.ink; k.rrect(lerp(110, 230, up), lerp(560, 432, up), lerp(644, 404, up), 22, 8); ctx.fill(); });
    A(up, () => {
      ctx.fillStyle = C.white; k.rrect(212, 500, 440, 200, 14); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; k.rrect(212, 500, 440, 200, 14); ctx.stroke();
      k.font(700, 40, SERIF); text('Dayton Agreement', CX, 548, { align: 'center', base: 'middle' });
      font(500, 24); text('initialled 21 Nov 1995 · Dayton, Ohio', CX, 600, { align: 'center', base: 'middle', color: C.soft });
      text('signed 14 Dec 1995 · Paris', CX, 636, { align: 'center', base: 'middle', color: C.soft });
      font(600, 22); text('Annex 4: the constitution', CX, 676, { align: 'center', base: 'middle', color: C.mark });
    });
  });
}

// the two entities as panels (a diagram, not a map)
const FED = { x: 70, y: 190, w: 470, h: 470 }, RSP = { x: 560, y: 190, w: 234, h: 470 };
function panel(p, fill, edge, title, a) {
  A(a, () => {
    ctx.fillStyle = fill; k.rrect(p.x, p.y, p.w, p.h, 18); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 3; k.rrect(p.x, p.y, p.w, p.h, 18); ctx.stroke();
    font(700, 26); text(title, p.x + p.w / 2, p.y + 36, { align: 'center', base: 'middle', color: C.ink });
  });
}
function ballotPaper(x, y, w, h, title, col, a = 1, tick = 0) {
  A(a, () => {
    ctx.fillStyle = C.white; k.rrect(x - w / 2, y - h / 2, w, h, 8); ctx.fill();
    ctx.fillStyle = col; k.rrect(x - w / 2, y - h / 2, w, 40, [8, 8, 0, 0]); ctx.fill();
    font(700, 22); text(title, x, y - h / 2 + 21, { align: 'center', base: 'middle', color: C.white });
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2 + 18, y - h / 2 + 62 + i * 38, 22, 22);
      ctx.fillStyle = C.faint; ctx.fillRect(x - w / 2 + 52, y - h / 2 + 70 + i * 38, w - 90, 6);
    }
    if (tick > 0) A(tick, () => {
      ctx.strokeStyle = C.mark; ctx.lineWidth = 4; ctx.lineCap = 'round'; const bx = x - w / 2 + 29, by = y - h / 2 + 73;
      ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.lineTo(bx - 2, by + 7); ctx.lineTo(bx + 10, by - 9); ctx.stroke(); ctx.lineCap = 'butt';
    });
  });
}
function sceneEntities(t) {
  const a = span(t, 9.2, 23.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    panel(FED, C.fedSoft, C.fed, 'Federation', eout(seg(t, 9.3, 10.0)));
    panel(RSP, C.rsSoft, C.rs, 'Republika Srpska', eout(seg(t, 9.8, 10.5)));
    A(span(t, 9.4, 13.8), () => { font(500, 22); text('a diagram, not a map', CX, 700, { align: 'center', base: 'middle', color: C.faint }); });
    // the Federation's two ballots: a voter takes one
    const fa = eout(seg(t, 13.9, 14.6)), choice = eio(seg(t, 15.6, 16.6));
    ballotPaper(FED.x + 120, 360, 190, 190, 'Bosniak', C.bosniak, fa * (1 - 0.6 * choice * (t < 18.4 ? 1 : 0)), 0);
    ballotPaper(FED.x + 350, 360, 190, 190, 'Croat', C.croat, fa, t > 16.8 && t < 18.4 ? 1 : 0);
    A(span(t, 14.4, 18.6), () => {
      font(700, 26); text('one or the other', FED.x + FED.w / 2, 500, { align: 'center', base: 'middle', color: C.ink });
      font(500, 22); text('never both', FED.x + FED.w / 2, 534, { align: 'center', base: 'middle', color: C.soft });
    });
    ballotPaper(RSP.x + RSP.w / 2, 360, 190, 190, 'Serb', C.serb, eout(seg(t, 18.5, 19.2)), t > 19.6 ? 1 : 0);
    // plurality: a three-way race and the leader wins under half
    A(span(t, 19.8, 23.8), () => {
      const y = 600, L = FED.x + 30, Rr = FED.x + FED.w - 30, parts = RACES[0].rows;
      let x = L;
      parts.forEach(([, , v], i) => {
        const w = ((Rr - L) * v) / 100;
        ctx.fillStyle = i === 0 ? C.bosniak : C.grey; ctx.fillRect(x, y - 16, w - 3, 32); x += w;
      });
      font(600, 22); text('most votes wins, even under 50%', CX - 60, y + 44, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

function sceneResults(t) {
  const a = span(t, 23.8, 37.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const res = span(t, 23.8, 28.4, 0.4, 0.4);
    A(res, () => {
      font(700, 30); text('2026 results, set out on 24 October', CX, 150, { align: 'center', base: 'middle' });
      RACES.forEach((r, i) => {
        const y = 250 + i * 150, L = 90, R = 774, g = eout(seg(t, 24.0 + i * 0.4, 24.9 + i * 0.4));
        font(600, 22); text(`${r.seat} · ${r.where}`, L, y - 42, { base: 'middle', color: C.soft });
        let x = L;
        r.rows.forEach(([name, party, v], j) => {
          const w = ((R - L) * v * g) / 100;
          ctx.fillStyle = j === 0 ? r.col : C.grey; ctx.fillRect(x, y - 20, Math.max(0, w - 3), 40); x += w;
        });
        const [name, party, v] = r.rows[0];
        A(seg(t, 24.6 + i * 0.4, 25.2 + i * 0.4), () => {
          font(700, 26); text(`${name}`, L, y + 46, { base: 'middle', color: r.col });
          font(600, 24); text(`${party} · ${v.toFixed(1)}%`, R, y + 46, { align: 'right', base: 'middle', color: C.ink });
        });
      });
    });
    // turnout: 100 voters, 43 of them voting
    A(span(t, 28.4, 33.2, 0.4, 0.4), () => {
      const n = Math.round(TURNOUT);
      for (let i = 0; i < 100; i++) {
        const x = 147 + (i % 20) * 30, y = 214 + Math.floor(i / 20) * 46, on = i < n;
        const g = eout(seg(t, 28.6 + i * 0.012, 29.0 + i * 0.012));
        A(g, () => {
          ctx.fillStyle = on ? C.ink : 'rgba(29,37,80,0.14)';
          ctx.beginPath(); ctx.arc(x, y - 10, 7, 0, Math.PI * 2); ctx.fill(); k.rrect(x - 9, y, 18, 20, 6); ctx.fill();
        });
      }
      font(800, 84); text(`${TURNOUT.toFixed(2)}%`, CX, 520, { align: 'center', base: 'middle' });
      font(500, 24); text('of voters took part in the presidency vote', CX, 580, { align: 'center', base: 'middle', color: C.soft });
    });
    // the chair passes round the table
    A(span(t, 33.2, 37.8, 0.4, 0.4), () => {
      const who = Math.floor(((t - 33.4) / 1.4) % 3 + 3) % 3;
      SEATS.forEach((col, i) => chair(CX + (i - 1) * 210, 400, 1.0, col, i === who ? 1 : 0.0));
      ctx.fillStyle = C.ink; k.rrect(150, 520, 564, 20, 8); ctx.fill();
      font(700, 30); text('chair: 8 months each, in turn', CX, 620, { align: 'center', base: 'middle' });
    });
  });
}

function sceneRotation(t) {
  const a = span(t, 37.8, 51.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the term as a dial of 48 months in six 8-month turns
    A(span(t, 37.8, 42.6, 0.4, 0.4), () => {
      const cx = CX, cy = 420, r1 = 120, r2 = 210;
      for (let i = 0; i < TURNS; i++) {
        const g = seg(t, 38.0 + i * 0.4, 38.4 + i * 0.4);
        if (g <= 0) continue;
        const a0 = -Math.PI / 2 + (Math.PI * 2 * i) / TURNS, a1 = a0 + ((Math.PI * 2) / TURNS) * g;
        ctx.fillStyle = SEATS[i % 3];
        ctx.beginPath(); ctx.arc(cx, cy, r2, a0 + 0.015, a1 - 0.015); ctx.arc(cx, cy, r1, a1 - 0.015, a0 + 0.015, true); ctx.closePath(); ctx.fill();
        const am = (a0 + a1) / 2;
        if (g > 0.9) { font(700, 26); text(`${CHAIR_MONTHS} mo`, cx + Math.cos(am) * (r1 + r2) / 2, cy + Math.sin(am) * (r1 + r2) / 2, { align: 'center', base: 'middle', color: C.white }); }
      }
      font(800, 64); text(`${TERM_MONTHS}`, cx, cy - 10, { align: 'center', base: 'middle' });
      font(500, 24); text('months', cx, cy + 40, { align: 'center', base: 'middle', color: C.soft });
      font(600, 24); text('each colour: one member’s turn as chair', cx, 680, { align: 'center', base: 'middle', color: C.soft });
    });
    // who may stand: people × places
    A(span(t, 42.4, 51.6, 0.4, 0.4), () => {
      const L = 300, top = 250, cw = 230, rh = 92;
      PLACES.forEach((p, w) => { font(700, 24); text(p, L + cw * w + cw / 2, top - 46, { align: 'center', base: 'middle', color: w === 0 ? '#9a6f12' : C.serb }); });
      PEOPLE.forEach((p, i) => {
        const y = top + i * rh;
        font(600, 26); text(p, L - 24, y + 4, { align: 'right', base: 'middle', color: C.ink });
        PLACES.forEach((_, w) => {
          const x = L + cw * w + cw / 2, ok = MAY_STAND(i, w), g = eout(seg(t, 42.8 + (i * 2 + w) * 0.18, 43.3 + (i * 2 + w) * 0.18));
          const hi = i === 3 && t > 47.0;
          A(g, () => {
            ctx.fillStyle = ok ? (w === 0 ? C.fedSoft : C.rsSoft) : 'rgba(29,37,80,0.06)';
            k.rrect(x - cw / 2 + 8, y - 34, cw - 16, 76, 12); ctx.fill();
            if (hi) { ctx.strokeStyle = C.mark; ctx.lineWidth = 3; k.rrect(x - cw / 2 + 8, y - 34, cw - 16, 76, 12); ctx.stroke(); }
            ctx.strokeStyle = ok ? C.ink : C.mark; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
            if (ok) { ctx.moveTo(x - 18, y + 4); ctx.lineTo(x - 4, y + 18); ctx.lineTo(x + 22, y - 14); }
            else { ctx.moveTo(x - 14, y - 10); ctx.lineTo(x + 14, y + 18); ctx.moveTo(x + 14, y - 10); ctx.lineTo(x - 14, y + 18); }
            ctx.stroke(); ctx.lineCap = 'butt';
          });
        });
      });
      A(seg(t, 44.6, 45.2), () => { font(700, 26); text(`may run for the presidency: ${ALLOWED} of 8`, CX, 650, { align: 'center', base: 'middle', color: C.ink }); });
    });
  });
}

function sceneCourt(t) {
  const a = eout(seg(t, 51.6, 52.4));
  if (a <= 0) return;
  A(a, () => {
    k.font(700, 40, SERIF); text('European Court of Human Rights', CX, 160, { align: 'center', base: 'middle' });
    const cases = [
      [2009, 'Sejdić and Finci', 'a Roma and a Jewish citizen'],
      [2014, 'Zornić', 'a citizen who declared no group'],
      [2016, 'Pilav', 'a Bosniak living in Republika Srpska'],
    ];
    cases.forEach(([y, name, who], i) => {
      const at = i === 0 ? 51.8 : 56.0 + (i - 1) * 0.6, g = eout(seg(t, at, at + 0.6)), yy = 260 + i * 120;
      A(g, () => {
        ctx.fillStyle = C.white; k.rrect(110, yy - 44, 644, 96, 14); ctx.fill();
        ctx.fillStyle = C.mark; k.rrect(110, yy - 44, 12, 96, [14, 0, 0, 14]); ctx.fill();
        font(800, 36); text(`${y}`, 150, yy + 4, { base: 'middle', color: C.mark });
        font(700, 28); text(name, 270, yy - 14, { base: 'middle' });
        font(500, 22); text(who, 270, yy + 22, { base: 'middle', color: C.soft });
        if (i === 0) { font(700, 22); text('16 votes to 1', 734, yy - 14, { align: 'right', base: 'middle', color: C.ink }); }
      });
    });
    A(eout(seg(t, 57.4, 58.0)), () => {
      font(700, 28); text('2026: elected under the same rules', CX, 650, { align: 'center', base: 'middle', color: C.ink });
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
    sceneEntities(t);
    sceneResults(t);
    sceneRotation(t);
    sceneCourt(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.mark, '~': '#9a6f12', '^': C.serb } });
  },
});
