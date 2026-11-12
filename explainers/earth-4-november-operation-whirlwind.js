// Explainer for earth-4-november-operation-whirlwind (Hungary 1956, "The end"): the Soviet attack at dawn on 4 November
// 1956 ("Operation Whirlwind"), the two radio broadcasts of that morning, János Kádár's "Revolutionary Worker-Peasant
// Government" and Imre Nagy's address at 5.20, the last fighting, and the world's reaction: the UN General Assembly,
// the Suez crisis in the same days, and what the United States and Radio Free Europe had and hadn't promised.
// Look: pre-dawn slate and a cold grey light, two old radio sets, a schematic map of Hungary with arrows (no tanks
// firing, no explosions), UN vote bars. Lora for headings, Inter for captions and labels.
//
// Facts:
// - 1956 Institute (Szakolczai Attila), lesson 4 (mek.oszk.hu/01900/01937/html/ora4/ora4.htm): on 4 November "4 óra
//   15 perckor" the attack began on Budapest and many large towns, before Kádár's government was announced; about an
//   hour later the Revolutionary Worker-Peasant Government's appeal from the Uzhhorod radio; Nagy's address a quarter
//   of an hour after Kádár's; Nagy took asylum at the Yugoslav embassy; István Bibó, minister of state, stayed in
//   Parliament and issued a proclamation; the Corvin köz group held out until the morning of 6 November; Csepel and
//   Újpest held out longest.
// - UN Special Committee report (1957; mek.oszk.hu/01200/01274): para. 77: at 5.05 another station announced Kádár's
//   government; para. 291: Nagy at 5.20 on Free Radio Kossuth: "Today at daybreak Soviet troops attacked our capital
//   ... Our troops are in combat. The Government is at its post."; paras 293–294: 7.57 the Writers' Union's appeal
//   "Help Hungary!"; 8.07 off the air; para. 296: Kádár's government "requested the Command of the Soviet Army to help
//   our nation in smashing the sinister forces of reaction"; para. 76: "It has been estimated that some 2,500 Soviet
//   tanks and 1,000 Soviet supporting vehicles were in Hungary by 3 November"; para. 90: the Committee was twice
//   refused permission to enter Hungary; paras 130–131: Radio Free Europe "was very encouraging", listeners felt it
//   promised help, "although witnesses said clearly that it gave no reason for expecting military help".
// - Balló István, Hadtudomány, citing military historian Horváth Miklós: "17 szovjet hadosztály ... részei, mintegy
//   60 ezer szovjet katonával vett részt".
// - Békés Csaba and Kecskés D. Gusztáv (eds.), A forradalom és a magyar kérdés az ENSZ-ben (2006; mek.oszk.hu/12900/
//   12960): on 4 November the General Assembly adopted the US resolution 50 to 8 with 15 abstentions, condemning the
//   intervention and calling on the Soviet Union to withdraw; Suez: Israel attacked Egypt on 29 October, Anglo-French
//   air raids from 31 October, paratroops at Port Said on 5 November, landings on 6 November; on 27 October John Foster
//   Dulles said his government did not see the Eastern European nations as potential military allies; a survey of
//   1,000 refugees in Austria (International Research Associates, February 1957): 96% had trusted in some US help.
// The map is schematic.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  4.15 a.m.: the attack; its size.
//  B  9.6–27.8  Two radios: Kádár at 5.05; Nagy at 5.20; silence at 8.07.
//  C 28.0–37.0  Nagy at the Yugoslav embassy, Bibó in Parliament; resistance.
//  D 37.2–64.6  The UN; Suez; Dulles; Radio Free Europe; what the refugees had hoped.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#111826', bg2: '#0a0e15', ink: '#eef0f2', soft: 'rgba(238,240,242,0.74)', faint: 'rgba(238,240,242,0.22)',
  nagy: '#e3b24a', kadar: '#c0485a', un: '#6c9be0', soviet: '#9aa4b2', wave: '#8fc7d8', panel: 'rgba(7,10,15,0.88)',
};
const HEAD = 'Lora', TXT = 'Inter';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const DIVISIONS = 17, SOLDIERS = 60000; // Horváth Miklós, via Hadtudomány: parts of 17 divisions, about 60,000 soldiers
const UN_VOTE = { yes: 50, no: 8, abstain: 15 }; // General Assembly, 4 November 1956 (Békés and Kecskés)
const REFUGEES_ASKED = 1000, HOPED_PCT = 96; // International Research Associates, February 1957

function heading(s, sub, a, subCol = C.nagy) {
  A(a, () => {
    font(700, 48, HEAD); text(s, 70, 98, { color: C.ink });
    if (sub) { font(500, 25); text(sub, 70, 144, { color: subCol }); }
  });
}

// ---------- the map of Hungary (schematic) ----------
const KX = 102, KY = 150, LON0 = 16.05, LAT0 = 48.62;
const P = (lon, lat) => [80 + (lon - LON0) * KX, 230 + (LAT0 - lat) * KY];
const BORDER = [[16.11, 46.86], [16.45, 47.0], [16.52, 47.35], [16.45, 47.45], [16.65, 47.62], [16.9, 47.75], [17.1, 48.0],
  [17.7, 47.76], [18.0, 47.75], [18.7, 47.8], [18.9, 47.95], [19.4, 48.1], [19.9, 48.15], [20.4, 48.55], [21.15, 48.55],
  [21.6, 48.45], [22.1, 48.4], [22.9, 47.95], [22.3, 47.75], [21.95, 47.35], [21.7, 47.0], [21.25, 46.4], [20.75, 46.2],
  [20.25, 46.12], [19.7, 46.17], [19.1, 45.95], [18.8, 45.88], [18.2, 45.8], [17.6, 45.95], [17.2, 46.15], [16.85, 46.35],
  [16.6, 46.48], [16.4, 46.65]];
const TOWNS = [['Budapest', 19.05, 47.5], ['Győr', 17.63, 47.68], ['Miskolc', 20.78, 48.1], ['Debrecen', 21.63, 47.53], ['Szeged', 20.15, 46.25], ['Pécs', 18.23, 46.07], ['Székesfehérvár', 18.41, 47.19], ['Szolnok', 20.2, 47.17]];
function hungary(a) {
  A(a, () => {
    ctx.beginPath(); BORDER.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.closePath();
    ctx.fillStyle = 'rgba(154,164,178,0.08)'; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.stroke();
    font(500, 20); text('Schematic map', 80, 200, { color: C.soft });
  });
}

/** An arrow along a polyline, drawn to fraction `g` of its length. */
function arrow(pts, g, col, { w = 7, dash = null } = {}) {
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

/** An old radio set: a box with a speaker grille and a dial; waves when `on`. */
function radio(x, y, col, on, t) {
  ctx.fillStyle = '#2a2f38'; k.rrect(x - 130, y - 80, 260, 160, 22); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1a1e25'; k.rrect(x - 110, y - 60, 130, 120, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(238,240,242,0.18)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(x - 100, y - 48 + i * 16); ctx.lineTo(x + 10, y - 48 + i * 16); ctx.stroke(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 70, y, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a1e25'; ctx.beginPath(); ctx.arc(x + 70, y, 22, 0, TAU); ctx.fill();
  if (on > 0) A(on, () => {
    for (let i = 0; i < 3; i++) {
      const r = 40 + ((t * 50 + i * 30) % 90);
      ctx.strokeStyle = `rgba(143,199,216,${0.8 * (1 - r / 130)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y - 90, r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
  });
}

/** A clock tag. */
function clock(s, x, y, col, size = 30) {
  font(700, size, HEAD);
  const tw = ctx.measureText(s).width;
  ctx.fillStyle = C.panel; k.rrect(x - tw / 2 - 16, y - size * 0.8, tw + 32, size * 1.6, 10); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align: 'center', color: col });
}

// ---------- A: the attack ----------
function sceneA(t) {
  A(span(t, 0, 9.8, 0.5, 0.4), () => {
    heading('4 NOVEMBER 1956', 'Before dawn', 1, C.soviet);
    hungary(seg(t, 0.4, 1.2));
    const [bx, by] = P(19.05, 47.5);
    TOWNS.forEach(([name, lon, lat], i) => A(seg(t, 0.8 + i * 0.1, 1.2 + i * 0.1), () => {
      const [x, y] = P(lon, lat);
      ctx.fillStyle = i === 0 ? C.ink : C.soft; ctx.beginPath(); ctx.arc(x, y, i === 0 ? 8 : 5, 0, TAU); ctx.fill();
      if (i === 0 || name === 'Szolnok' || name === 'Debrecen') { font(i === 0 ? 700 : 500, i === 0 ? 24 : 20); text(name, x + 12, y - 16, { color: i === 0 ? C.ink : C.soft }); }
    }));
    // arrows from the borders to the towns: a schematic of the attack, not exact routes
    const g = eio(seg(t, 1.6, 4.0));
    for (const [sx, sy, tlon, tlat] of [[820, 330, 19.25, 47.55], [820, 470, 20.3, 47.2], [760, 260, 20.85, 48.05], [820, 520, 21.55, 47.5], [600, 700, 20.2, 46.35], [420, 720, 18.35, 46.15], [80, 360, 17.7, 47.65]]) {
      const [tx, ty] = P(tlon, tlat);
      arrow([[sx, sy], [tx, ty]], g, C.soviet, { w: 5 });
    }
    A(seg(t, 1.4, 1.8), () => clock('4.15 a.m.', 640, 230, C.soviet));
    // the size of the force (cue 2)
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(120, 560, 624, 180, 16); ctx.fill();
      font(700, 40, HEAD); text(`${fmt(DIVISIONS)} divisions · about ${fmt(SOLDIERS)} soldiers`, CX, 610, { align: 'center', color: C.ink });
      font(500, 21); text('parts of them, by military historian Miklós Horváth’s count', CX, 660, { align: 'center', color: C.soft });
      text('the UN committee estimated some 2,500 Soviet tanks in Hungary by 3 November', CX, 700, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: two radios ----------
function sceneB(t) {
  A(span(t, 9.6, 28.0, 0.4, 0.4), () => {
    heading('ON THE RADIO', 'Two governments in one morning', 1, C.wave);
    const kOn = seg(t, 10.0, 10.4), nOn = seg(t, 18.8, 19.2) * (1 - seg(t, 26.0, 26.6));
    radio(230, 330, C.kadar, kOn, t);
    radio(634, 330, C.nagy, nOn, t);
    font(700, 22); text('another station', 230, 448, { align: 'center', color: C.kadar });
    text('Free Radio Kossuth, Budapest', 634, 448, { align: 'center', color: C.nagy });
    A(seg(t, 10.2, 10.8), () => clock('5.05 a.m.', 230, 506, C.kadar, 26));
    A(seg(t, 19.0, 19.6), () => clock('5.20 a.m.', 634, 506, C.nagy, 26));
    // Kádár's government (cues 3 and 4)
    A(span(t, 10.6, 18.8, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 560, 704, 170, 14); ctx.fill();
      font(700, 27); text('János Kádár’s “Revolutionary', CX, 600, { align: 'center', color: C.kadar });
      text('Worker-Peasant Government”', CX, 636, { align: 'center', color: C.kadar });
      A(seg(t, 14.6, 15.2), () => { font(500, 22); text('it asked the Soviet army to help smash “reaction”', CX, 690, { align: 'center', color: C.ink }); });
    });
    // Nagy (cue 5)
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 560, 704, 170, 14); ctx.fill();
      font(600, 30, HEAD); text('“Our troops are in combat.', CX, 606, { align: 'center', color: C.nagy });
      text('The Government is at its post.”', CX, 646, { align: 'center', color: C.nagy });
      font(500, 21); text('Prime Minister Imre Nagy', CX, 696, { align: 'center', color: C.soft });
    });
    // 7.57 and 8.07 (cue 6)
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 560, 704, 170, 14); ctx.fill();
      font(700, 26); text('7.57 a.m. · the Writers’ Union: “Help Hungary!”', CX, 604, { align: 'center', color: C.ink });
      A(seg(t, 25.6, 26.2), () => { font(700, 30, HEAD); text('8.07 a.m. · silence', CX, 668, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- C: refuge and resistance ----------
function sceneC(t) {
  A(span(t, 28.0, 37.2, 0.4, 0.4), () => {
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      heading('BUDAPEST, 4 NOVEMBER', 'Where the government went', 1);
      // two buildings: the embassy and Parliament
      for (const [x, label1, label2, col] of [[230, 'Yugoslav embassy', 'Imre Nagy takes refuge', C.nagy], [634, 'Parliament', 'István Bibó stays at his post', C.ink]]) {
        ctx.fillStyle = '#262c37'; ctx.fillRect(x - 120, 300, 240, 190);
        ctx.fillStyle = 'rgba(227,178,74,0.35)';
        for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) ctx.fillRect(x - 96 + j * 52, 324 + i * 52, 26, 30);
        font(700, 25); text(label1, x, 530, { align: 'center', color: col });
        font(500, 21); text(label2, x, 566, { align: 'center', color: C.soft });
      }
      ctx.fillStyle = '#262c37'; ctx.beginPath(); ctx.arc(634, 300, 70, Math.PI, 0); ctx.fill();
      A(seg(t, 30.0, 30.6), () => { font(500, 21); text('Bibó’s appeal: do not recognise the occupiers’ government', CX, 650, { align: 'center', color: C.ink }); });
    });
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      heading('RESISTANCE', 'Young fighters and workers', 1);
      // a schematic ring of Budapest with three places of resistance
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CX, 450, 260, 210, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(108,155,224,0.5)'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(CX - 40, 230); ctx.bezierCurveTo(CX - 60, 380, CX - 10, 520, CX + 10, 680); ctx.stroke();
      [['Újpest', CX + 60, 280], ['Corvin köz', CX + 80, 450], ['Csepel', CX + 30, 610]].forEach(([s, x, y], i) => A(seg(t, 33.2 + i * 0.5, 33.6 + i * 0.5), () => {
        ctx.fillStyle = C.nagy; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
        font(700, 25); text(s, x + 20, y, { color: C.ink });
      }));
      A(seg(t, 35.0, 35.6), () => { font(500, 21); text('held out for days', CX + 110, 500, { color: C.soft }); });
      font(500, 20); text('Schematic', 140, 700, { color: C.soft });
    });
  });
}

// ---------- D: the world ----------
function sceneD(t) {
  A(span(t, 37.2, 65.2, 0.4, 0), () => {
    // the General Assembly (cues 9 and 10)
    A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
      heading('NEW YORK, 4 NOVEMBER', 'UN General Assembly', 1, C.un);
      const g = eout(seg(t, 38.0, 40.0)), x0 = 300, bw = 420;
      [['for', UN_VOTE.yes, C.un], ['against', UN_VOTE.no, C.kadar], ['abstained', UN_VOTE.abstain, C.soviet]].forEach(([s, v, col], i) => {
        const y = 300 + i * 90;
        font(700, 28); text(s, x0 - 20, y, { align: 'right', color: col });
        ctx.fillStyle = 'rgba(238,240,242,0.08)'; ctx.fillRect(x0, y - 24, bw, 48);
        ctx.fillStyle = col; ctx.fillRect(x0, y - 24, (bw * v * g) / 55, 48);
        if (g > 0.95) { font(700, 30); text(fmt(v), x0 + (bw * v) / 55 + 14, y, { color: C.ink }); }
      });
      A(seg(t, 39.4, 40.0), () => { font(500, 22); text('Soviet forces should withdraw from Hungary', CX, 590, { align: 'center', color: C.ink }); });
      A(seg(t, 42.0, 42.6), () => {
        ctx.fillStyle = C.panel; k.rrect(120, 630, 624, 100, 12); ctx.fill();
        font(600, 23); text('Ignored. Kádár’s government twice refused', CX, 664, { align: 'center', color: C.kadar });
        text('to let the UN’s committee into Hungary', CX, 698, { align: 'center', color: C.kadar });
      });
    });
    // Suez (cue 11)
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      heading('THE SAME DAYS: SUEZ', 'Egypt, October–November 1956', 1, C.un);
      // a schematic coast and canal
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(100, 330); ctx.bezierCurveTo(300, 360, 520, 300, 780, 340); ctx.stroke();
      ctx.strokeStyle = C.un; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(470, 318); ctx.lineTo(486, 530); ctx.stroke();
      font(600, 22); text('Port Said', 500, 290, { color: C.ink }); text('Suez Canal', 506, 470, { color: C.un });
      font(700, 24); text('EGYPT', 300, 450, { align: 'center', color: C.faint });
      [['29 Oct', 'Israel attacks Egypt', 380], ['31 Oct', 'British and French air raids', 430], ['5–6 Nov', 'landings at Port Said', 480]].forEach(([d, s, y], i) => A(seg(t, 46.8 + i * 0.6, 47.2 + i * 0.6), () => {
        font(700, 22); text(d, 110, y + 190, { color: C.nagy }); font(500, 21); text(s, 220, y + 190, { color: C.ink });
      }));
      font(500, 20); text('Schematic', 600, 720, { color: C.soft });
    });
    // Dulles (cue 12)
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      heading('WASHINGTON, 27 OCTOBER', 'Secretary of State John Foster Dulles', 1, C.un);
      ctx.fillStyle = C.panel; k.rrect(100, 280, 664, 220, 16); ctx.fill(); ctx.strokeStyle = C.un; ctx.lineWidth = 2; ctx.stroke();
      font(600, 30, HEAD); text('The United States does not see', CX, 340, { align: 'center', color: C.ink });
      text('the nations of Eastern Europe', CX, 384, { align: 'center', color: C.ink });
      text('as potential military allies', CX, 428, { align: 'center', color: C.ink });
      font(500, 20); text('the sense of his statement, as reported', CX, 470, { align: 'center', color: C.soft });
    });
    // Radio Free Europe (cue 13)
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      heading('RADIO FREE EUROPE', 'Broadcasting from Munich', 1, C.wave);
      radio(CX, 360, C.wave, 1, t);
      ctx.fillStyle = C.panel; k.rrect(90, 500, 684, 200, 16); ctx.fill();
      font(600, 24); text('“very encouraging”: listeners felt it promised help', CX, 548, { align: 'center', color: C.ink });
      A(seg(t, 57.4, 58.0), () => {
        text('but witnesses told the UN it gave', CX, 610, { align: 'center', color: C.soft });
        text('no reason to expect military help', CX, 646, { align: 'center', color: C.soft });
      });
    });
    // the refugees' hope (cue 14)
    A(seg(t, 60.2, 60.6), () => {
      heading('WHAT THEY HAD HOPED', `${fmt(REFUGEES_ASKED)} refugees asked in Austria, 1957`, 1, C.nagy);
      const cols = 20, s = 26, x0 = CX - (cols * s) / 2, y0 = 240, lit = Math.round(100 * eout(seg(t, 60.8, 62.4)));
      for (let i = 0; i < 100; i++) {
        const x = x0 + (i % cols) * s + s / 2, y = y0 + Math.floor(i / cols) * s + s / 2;
        ctx.fillStyle = i < Math.min(lit, HOPED_PCT) ? C.nagy : 'rgba(238,240,242,0.15)';
        ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
      }
      A(seg(t, 62.2, 62.8), () => {
        font(700, 56, HEAD); text(`${fmt(HOPED_PCT)}%`, CX, 440, { align: 'center', color: C.nagy });
        font(500, 23); text('had trusted in some help from the United States', CX, 492, { align: 'center', color: C.ink });
        font(700, 26); text('No troops came.', CX, 560, { align: 'center', color: C.soft });
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
}

const CUES = [
  [0.4, 4.8, 'Hungary, 4 November 1956, 4.15 a.m.: Soviet forces attack Budapest and other cities.'],
  [5.0, 9.4, 'By military historian Miklós Horváth’s count, parts of *17 Soviet divisions*, about 60,000 soldiers.'],
  [9.6, 14.0, 'At 5.05 another radio station announces *János Kádár’s* “Revolutionary Worker-Peasant Government”.'],
  [14.2, 18.6, 'It says it has asked the Soviet army to help smash ~“reaction”~.'],
  [18.8, 23.2, '5.20, Free Radio Kossuth: Prime Minister *Imre Nagy*: “Our troops are in combat.”'],
  [23.4, 27.8, 'At 7.57 the Writers’ Union cries “Help Hungary!” At 8.07 the station falls *silent*.'],
  [28.0, 32.4, 'Nagy takes refuge in the Yugoslav embassy; minister *István Bibó* stays in Parliament.'],
  [32.6, 37.0, 'Young fighters and workers resist for days, in the Corvin köz, at *Csepel* and Újpest.'],
  [37.2, 41.6, 'In New York the UN General Assembly calls on Soviet forces to leave: *50 votes to 8*.'],
  [41.8, 46.2, 'Moscow ignores it, and Kádár’s government twice refuses the UN’s committee entry.'],
  [46.4, 50.8, 'In the same days Israel, Britain and France attack Egypt over the *Suez Canal*.'],
  [51.0, 55.4, 'On 27 October the US had said it did not see Eastern Europe as *potential military allies*.'],
  [55.6, 60.0, 'Radio Free Europe raised hopes, but gave *no reason* to expect military help, the UN found.'],
  [60.2, 64.6, 'Of 1,000 refugees asked in 1957, *96%* had trusted in some US help. No troops came.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    sceneC(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.nagy, '~': C.kadar } });
  },
});
