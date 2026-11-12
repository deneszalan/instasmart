// Explainer for philosophy-soviet-troops-and-national-symbols (Hungary 1956): why a flag with a hole became the
// symbol of 1956. Soviet troops had stayed in Hungary since the war, under the 1947 peace treaty and then the Warsaw
// Pact; reparations, German property taken over by the Soviet Union and a Soviet concession on uranium tied the
// economy to Moscow; a Soviet-style emblem replaced the Kossuth arms in 1949, Russian was compulsory at school and
// 15 March was a working day. The students' 16 points of 22 October 1956 asked first for the troops to leave, and on
// 23 October the emblem was cut out of the flags. Look: dark green-black, the red-white-green flag, a schematic map
// of Hungary, two emblems drawn plainly. Cinzel for the headings, Fira Sans for labels and captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (1957), via mek.oszk.hu/01200/01274: para 306 (Treaty of
//   Peace of 10 February 1947, in force 15 September 1947: Allied forces to be withdrawn, subject to the Soviet right to
//   keep forces "for the maintenance of the lines of communication of the Soviet Army with the Soviet zone of
//   occupation in Austria", art. 22); para 312 (Austrian State Treaty 15 May 1955; Warsaw Treaty 14 May 1955);
//   para 315 (the Committee was informed that before October the 2nd and 17th Soviet mechanized divisions were in
//   Hungary, about 20,000 men and 600 tanks); para 327 ("the ending of the long military occupation"); para 391 (Soviet
//   troops "not personally unpopular" but identified with a foreign Power that supported the regime); paras 416 and
//   206 (uranium, believed exploited for the USSR; the uranium mines near Pécs); para 50 and 422 (19 October 1956: the
//   Minister of Education undertook to end compulsory Russian in schools); the sixteen points of 22 October, point 1
//   (withdrawal of all Soviet troops), point 8 (reparations "that can never be paid", uranium and "the Russian
//   concession"), point 14 (the Kossuth arms instead of the coat of arms "foreign to the Hungarian people"; 15 March
//   a national holiday and non-working day; 6 October a day of national mourning); para 458 (on 23 October the
//   demonstrators carried flags "from which the Communist crest was cut out"); para 410.
// - Honvári János, "Nekünk tartoztak, mégis mi fizettünk" (NKE, doi 10.36250/01181_47): under Potsdam the Soviet
//   Union took German property in Hungary, the German share in more than 500 Hungarian enterprises; the armistice of
//   20 January 1945 obliged Hungary to deliver goods worth 200 million US dollars to the Soviet Union as reparations;
//   Soviet–Hungarian joint companies, whose Soviet shares Hungary later bought back.
// - museum-digital, "Rákosi coat of arms": adopted by the constitution, Act XX of 1949, in use from 20 August 1949,
//   superseding the Kossuth emblem; repealed in 1957.
// The map is schematic: the border is simplified, towns from their coordinates.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  23 October 1956: the flag with its emblem cut out.
//  B  9.6–23.2  Soviet troops: 1944–45, the 1947 treaty and Austria, the Warsaw Pact of 1955, about 20,000 men.
//  C 23.4–37.0  The economy: reparations, German property, joint companies, uranium.
//  D 37.2–50.8  Symbols: the 1949 emblem for the Kossuth arms, compulsory Russian, 15 March a working day.
//  E 51.0–64.6  The 16 points; the flag with a hole.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#151b17', bg2: '#0a0d0b', ink: '#f3efe6', soft: 'rgba(243,239,230,0.74)', faint: 'rgba(243,239,230,0.22)', line: 'rgba(243,239,230,0.05)',
  red: '#cf3a43', white: '#f2eee4', green: '#3f7a52', gold: '#d9b45a', sov: '#b23a3a', sovSoft: 'rgba(178,58,58,0.35)', steel: '#93b4c8',
  land: 'rgba(243,239,230,0.07)', panel: 'rgba(8,10,9,0.84)',
};
const HEAD = 'Cinzel', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the map (schematic): longitude and latitude to the canvas ----------
const P = (lon, lat) => [60 + (lon - 16.0) * 105, 200 + (48.7 - lat) * 154];
const HUN = [[17.16, 48.01], [16.95, 47.86], [16.45, 47.68], [16.62, 47.45], [16.5, 47.38], [16.45, 47.0], [16.11, 46.87], [16.3, 46.6], [16.6, 46.48], [16.9, 46.38],
  [17.3, 46.1], [17.6, 45.95], [18.1, 45.78], [18.6, 45.78], [18.9, 45.93], [19.1, 45.97], [19.6, 46.17], [20.1, 46.15], [20.7, 46.13], [21.2, 46.4], [21.3, 46.65],
  [21.5, 46.95], [21.9, 47.4], [22.0, 47.6], [22.4, 47.75], [22.9, 47.97], [22.6, 48.1], [22.3, 48.3], [22.0, 48.4], [21.6, 48.5], [21.1, 48.5], [20.8, 48.57],
  [20.4, 48.45], [20.0, 48.2], [19.6, 48.22], [19.0, 48.07], [18.8, 47.85], [18.7, 47.78], [18.2, 47.75], [17.8, 47.75], [17.4, 47.9]];
const TOWNS = { bud: [19.04, 47.5], vie: [16.37, 48.21], pecs: [18.23, 46.07], zah: [22.17, 48.41] };
const XY = Object.fromEntries(Object.entries(TOWNS).map(([key, [lo, la]]) => [key, P(lo, la)]));

const TROOPS = 20000, TANKS = 600, DOLLARS = 200, FIRMS = 500;

/** The Hungarian flag at (x, y), size w × h; `emblem` 0–1 shows the 1949 emblem, `hole` 0–1 cuts it out. */
function flag(x, y, w, h, { emblem = 0, hole = 0, wave = 0 } = {}) {
  ctx.save();
  // a gentle wave: the flag is drawn in vertical strips shifted up and down
  const strips = 48, sw = w / strips;
  for (let i = 0; i < strips; i++) {
    const dy = Math.sin(i / strips * TAU * 1.2 + wave) * 6 * (i / strips);
    const sx = x + i * sw;
    [[C.red, 0], [C.white, 1], [C.green, 2]].forEach(([col, j]) => { ctx.fillStyle = col; ctx.fillRect(sx, y + dy + j * h / 3, sw + 0.8, h / 3 + 0.5); });
  }
  const cx = x + w / 2, cy = y + h / 2 + Math.sin(0.5 * TAU * 1.2 + wave) * 3, r = h * 0.3;
  if (emblem > 0 && hole < 1) A(emblem * (1 - hole), () => emblem1949(cx, cy, r));
  if (hole > 0) {
    // the hole: the background shows through
    const hr = r * 1.08 * eout(hole);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.clip(); ctx.drawImage(bg, 0, 0); ctx.restore();
    // the cut edge of the cloth, a little frayed
    ctx.strokeStyle = 'rgba(242,238,228,0.85)'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, rr = hr + (i % 2 ? 2.5 : -1.5); ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    ctx.stroke();
  }
  ctx.restore();
  // the flagpole
  ctx.fillStyle = '#8a7a5c'; ctx.fillRect(x - 10, y - 14, 8, h + 220);
}
/** The emblem of 1949, drawn plainly: a wreath of wheat, a hammer and ears of wheat, a red star above. */
function emblem1949(cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#7fb0d6'; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#d9b45a'; ctx.lineWidth = r * 0.12;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + s * (0.5 + i * 0.32);
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.16, r * 0.07, a + s * 1.2, 0, TAU); ctx.fillStyle = '#d9b45a'; ctx.fill();
    }
  }
  ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = r * 0.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.25, r * 0.3); ctx.lineTo(r * 0.2, -r * 0.2); ctx.stroke();
  ctx.fillStyle = '#4a4a4a'; ctx.save(); ctx.translate(r * 0.2, -r * 0.2); ctx.rotate(-0.8); ctx.fillRect(-r * 0.18, -r * 0.07, r * 0.36, r * 0.14); ctx.restore();
  ctx.strokeStyle = '#d9b45a'; ctx.lineWidth = r * 0.07;
  ctx.beginPath(); ctx.moveTo(r * 0.25, r * 0.32); ctx.lineTo(-r * 0.1, -r * 0.28); ctx.stroke();
  ctx.lineCap = 'butt';
  star(0, -r * 0.9, r * 0.28, C.red);
  ctx.restore();
}
function star(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
/** The Kossuth arms, drawn plainly: a shield, red and white stripes on the left, a double cross on three green hills on the right, no crown. */
function kossuth(cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const shield = () => { ctx.beginPath(); ctx.moveTo(-60, -70); ctx.lineTo(60, -70); ctx.lineTo(60, 10); ctx.quadraticCurveTo(60, 70, 0, 86); ctx.quadraticCurveTo(-60, 70, -60, 10); ctx.closePath(); };
  shield(); ctx.save(); ctx.clip();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fillRect(-60, -70 + i * 20, 60, 20); }
  ctx.fillStyle = C.red; ctx.fillRect(0, -70, 60, 160);
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(30, 60, 22, Math.PI, 0); ctx.arc(14, 70, 14, Math.PI, 0); ctx.arc(46, 70, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(0, 62, 60, 40);
  ctx.fillStyle = C.white; ctx.fillRect(27, -50, 6, 92); ctx.fillRect(15, -36, 30, 6); ctx.fillRect(18, -18, 24, 6);
  ctx.restore();
  shield(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
function tag(s, x, y, col, { size = 22, align = 'center' } = {}) {
  font(600, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
function arrow(pts, g, col, w = 8, dash = null) {
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
  const s = w * 2.2; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s); ctx.lineTo(end[0] - dir[1] * s * 0.8, end[1] + dir[0] * s * 0.8); ctx.lineTo(end[0] + dir[1] * s * 0.8, end[1] - dir[0] * s * 0.8); ctx.fill();
}

function map(a, named = true) {
  A(a, () => {
    ctx.fillStyle = C.land; ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
    ctx.beginPath(); HUN.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (named) { font(600, 22); text('HUNGARY', ...P(17.9, 46.55), { align: 'center', color: C.soft, spacing: '3px' }); }
    text('AUSTRIA', XY.vie[0] + 10, XY.vie[1] - 40, { align: 'center', color: C.faint, spacing: '2px' });
    const dot = (key, name, dx, dy, align) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(...XY[key], 7, 0, TAU); ctx.fill(); font(600, 22); text(name, XY[key][0] + dx, XY[key][1] + dy, { align, color: C.ink }); };
    dot('bud', 'Budapest', -14, -20, 'right');
    dot('vie', 'Vienna', 0, 26, 'center');
    font(500, 20); text('Schematic map', 60, 690, { color: C.faint });
  });
}

// ---------- A: the flag with a hole ----------
function sceneOpen(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    font(700, 40, HEAD); text('THE FLAG WITH A HOLE', 70, 96, { spacing: '2px' });
    font(500, 26); text('Budapest · 23 October 1956', 70, 140, { color: C.gold });
    flag(212, 240, 470, 300, { emblem: 1, hole: seg(t, 2.2, 3.4), wave: t * 1.6 });
    A(seg(t, 5.4, 6.0), () => tag('the symbol of 1956', 447, 700, C.gold));
  });
}

// ---------- B: the troops ----------
function sceneTroops(t) {
  A(span(t, 9.6, 23.4, 0.4, 0.4), () => {
    map(1);
    // 1944–45: the Red Army comes in from the east, fighting Germany
    const g = eio(seg(t, 10.2, 12.4));
    arrow([[830, 300], [XY.zah[0] - 30, XY.zah[1] + 50], [XY.bud[0] + 36, XY.bud[1] + 4]], g, C.sov, 10);
    arrow([[820, 620], P(20.4, 46.6), [XY.bud[0] + 30, XY.bud[1] + 34]], eio(seg(t, 10.6, 12.8)), C.sov, 10);
    A(seg(t, 11.4, 12.0) * (1 - seg(t, 14.0, 14.4)), () => tag('1944–45 · SOVIET ARMY', 560, 640, C.sov));
    // 1947: the lines of communication to the Soviet zone in Austria
    A(seg(t, 14.4, 15.0), () => {
      arrow([[XY.bud[0] - 10, XY.bud[1] - 6], P(17.6, 47.8), [XY.vie[0] + 26, XY.vie[1] + 6]], eio(seg(t, 14.6, 16.0)), C.steel, 6, [14, 10]);
      A(seg(t, 15.8, 16.4) * (1 - seg(t, 18.6, 19.0)), () => {
        tag('1947 PEACE TREATY, ARTICLE 22', CX, 150, C.steel, { size: 21 });
        font(500, 21); text('troops may stay to guard the lines', CX, 196, { align: 'center', color: C.soft });
        text('to the Soviet zone in Austria', CX, 224, { align: 'center', color: C.soft });
      });
    });
    // 1955: Austria freed; the Warsaw Pact
    A(seg(t, 19.0, 19.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 120, 704, 120, 14); ctx.fill();
      font(600, 22); text('15 May 1955: Austria freed, its occupation ends', CX, 156, { align: 'center', color: C.soft });
      font(700, 24); text('14 May 1955: Warsaw Pact', CX, 200, { align: 'center', color: C.sov });
      A(seg(t, 20.6, 21.2), () => {
        for (let i = 0; i < 2; i++) {
          const [x, y] = [XY.bud[0] - 90 + i * 70, XY.bud[1] + 80];
          ctx.fillStyle = C.sov; k.rrect(x - 26, y - 16, 52, 32, 4); ctx.fill();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 26, y - 16); ctx.lineTo(x + 26, y + 16); ctx.moveTo(x + 26, y - 16); ctx.lineTo(x - 26, y + 16); ctx.stroke();
        }
        tag(`2 divisions · about ${fmt(TROOPS)} men · ${fmt(TANKS)} tanks`, CX, 640, C.sov, { size: 21 });
      });
    });
  });
}

// ---------- C: the economy ----------
function sceneEconomy(t) {
  A(span(t, 23.4, 37.4, 0.4, 0.4), () => {
    map(0.35, t < 32.6);
    // reparations: goods going east, as crates on a line
    A(span(t, 23.4, 28.2, 0.3, 0.4), () => {
      tag('ARMISTICE, 20 JANUARY 1945', CX, 150, C.gold, { size: 21 });
      font(800, 54); text(`$${fmt(DOLLARS)} million`, CX, 226, { align: 'center', color: C.gold });
      font(500, 21); text('in goods, delivered to the Soviet Union as reparations', CX, 270, { align: 'center', color: C.soft });
      for (let i = 0; i < 9; i++) {
        const p = ((t - 23.8) * 0.18 + i / 9) % 1, x = lerp(XY.bud[0], 840, p), y = lerp(XY.bud[1], 380, p);
        A(seg(t, 23.8, 24.4) * Math.min(1, (1 - p) * 4), () => { ctx.fillStyle = '#a07f4a'; ctx.fillRect(x - 12, y - 10, 24, 20); ctx.strokeStyle = '#5a4526'; ctx.lineWidth = 2; ctx.strokeRect(x - 12, y - 10, 24, 20); });
      }
    });
    // German property: shares in more than 500 firms
    A(span(t, 28.0, 32.8, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 120, 704, 560, 18); ctx.fill();
      font(700, 26, HEAD); text('GERMAN PROPERTY IN HUNGARY', CX, 166, { align: 'center', color: C.gold });
      font(500, 21); text('handed to the Soviet Union after 1945', CX, 204, { align: 'center', color: C.soft });
      const cols = 25, rows = 20, cw = 22, x0 = CX - cols * cw / 2 + 2, y0 = 240;
      for (let i = 0; i < cols * rows; i++) {
        const g = seg(t, 28.6 + (i / (cols * rows)) * 2.0, 28.8 + (i / (cols * rows)) * 2.0);
        if (g <= 0) continue;
        const x = x0 + (i % cols) * cw, y = y0 + Math.floor(i / cols) * 18;
        ctx.fillStyle = `rgba(178,58,58,${0.35 + 0.55 * g})`; ctx.fillRect(x, y, 16, 12);
      }
      A(seg(t, 30.8, 31.4), () => { font(700, 24); text(`shares in more than ${fmt(FIRMS)} firms`, CX, 640, { align: 'center' }); });
    });
    // joint companies and uranium
    A(span(t, 32.6, 37.4, 0.4, 0.4), () => {
      const [px, py] = XY.pecs;
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(px, py, 9, 0, TAU); ctx.fill();
      font(600, 22); text('Pécs: uranium', px + 18, py + 2, { color: C.gold });
      // the trefoil of radiation, plain
      ctx.save(); ctx.translate(px - 70, py - 40);
      ctx.fillStyle = C.gold; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 30, -Math.PI / 2 + i * TAU / 3 - 0.5, -Math.PI / 2 + i * TAU / 3 + 0.5); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
      ctx.restore();
      arrow([[px + 10, py - 30], [520, 420], [800, 330]], eio(seg(t, 33.4, 35.0)), C.sov, 7, [14, 10]);
      A(seg(t, 35.0, 35.6), () => tag('under a Soviet concession', 640, 290, C.sov, { size: 21 }));
      tag('JOINT SOVIET–HUNGARIAN COMPANIES', CX, 150, C.steel, { size: 21 });
    });
  });
}

// ---------- D: symbols, language, the calendar ----------
function sceneSymbols(t) {
  // 1949: the Kossuth arms give way to the Soviet-style emblem
  A(span(t, 37.2, 42.0, 0.4, 0.4), () => {
    tag('20 AUGUST 1949 · NEW CONSTITUTION', CX, 150, C.gold, { size: 21 });
    const g = eio(seg(t, 38.4, 39.6));
    A(1 - 0.65 * g, () => kossuth(250, 400, 1.6));
    font(600, 22); text('Kossuth arms', 250, 560, { align: 'center', color: C.soft });
    A(seg(t, 38.6, 39.4), () => {
      emblem1949(614, 400, 110);
      font(600, 22); text('Soviet-style emblem', 614, 560, { align: 'center', color: C.ink });
      font(500, 20); text('no shield, a red star', 614, 590, { align: 'center', color: C.soft });
    });
    arrow([[352, 400], [470, 400]], seg(t, 38.4, 39.2), C.gold, 6);
  });
  // compulsory Russian
  A(span(t, 41.8, 46.6, 0.4, 0.4), () => {
    ctx.fillStyle = '#23322a'; k.rrect(150, 210, 564, 340, 14); ctx.fill();
    ctx.strokeStyle = '#8a7a5c'; ctx.lineWidth = 12; ctx.stroke();
    font(500, 30); text('Русский язык', CX, 300, { align: 'center', color: 'rgba(243,239,230,0.85)' });
    font(600, 24); text('Russian: compulsory at school', CX, 380, { align: 'center', color: C.ink });
    A(seg(t, 43.4, 44.0), () => {
      font(600, 22); text('19 October 1956: the minister', CX, 450, { align: 'center', color: C.gold });
      text('promises to end it', CX, 482, { align: 'center', color: C.gold });
    });
  });
  // 15 March, a working day
  A(span(t, 46.4, 51.2, 0.4, 0.4), () => {
    ctx.fillStyle = C.white; ctx.fillRect(282, 200, 300, 330);
    ctx.fillStyle = C.green; ctx.fillRect(282, 200, 300, 64);
    font(700, 28); text('MARCH', CX, 233, { align: 'center', color: C.white });
    font(800, 150); text('15', CX, 390, { align: 'center', color: '#1f2620' });
    font(600, 22); text('1848: the revolution', CX, 500, { align: 'center', color: '#3c463e' });
    A(seg(t, 47.4, 48.0), () => tag('an ordinary working day', CX, 600, C.red));
  });
}

// ---------- E: the demands and the flag ----------
const POINTS = [['1', 'All Soviet troops out'], ['8', 'The truth about reparations and uranium'], ['14', 'The Kossuth arms back'], ['14', '15 March a holiday, 6 October mourning']];
function sceneDemands(t) {
  A(span(t, 51.0, 60.4, 0.4, 0.4), () => {
    ctx.fillStyle = '#ece5d3'; ctx.fillRect(150, 150, 564, 520);
    font(700, 26, HEAD); text('THE 16 POINTS', CX, 196, { align: 'center', color: '#2b2a24' });
    font(500, 20); text('students of the Technical University · 22 October 1956', CX, 232, { align: 'center', color: '#5a5548' });
    POINTS.forEach(([n, s], i) => {
      const hi = i === 0 ? seg(t, 51.6, 52.2) : seg(t, 55.8 + (i - 1) * 0.6, 56.4 + (i - 1) * 0.6);
      const y = 300 + i * 90;
      A(0.35 + 0.65 * hi, () => {
        ctx.fillStyle = i === 0 ? C.red : C.green; k.rrect(184, y - 26, 52, 52, 10); ctx.fill();
        font(800, 24); text(n, 210, y + 1, { align: 'center', color: C.white });
        font(600, 23); text(s, 256, y, { color: '#2b2a24' });
      });
    });
  });
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    flag(212, 210, 470, 300, { emblem: 1, hole: seg(t, 61.0, 62.2), wave: t * 1.6 });
    A(seg(t, 62.4, 63.0), () => tag('red, white and green: nothing else', 447, 700, C.gold));
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
  [0.4, 4.8, 'Budapest, 23 October 1956: marchers cut the *Communist emblem* out of Hungary’s flags.'],
  [5.0, 9.4, 'The flag with a hole became the symbol of 1956. Why did a badge on a flag matter so much?'],
  [9.6, 14.0, 'Soviet troops entered Hungary in 1944–45, fighting Germany, and *stayed* after the war.'],
  [14.2, 18.6, 'The 1947 peace treaty let them stay to guard the Soviet Army’s lines to its zone in *Austria*.'],
  [18.8, 23.2, 'Austria was freed in 1955; under the new *Warsaw Pact*, about 20,000 Soviet soldiers stayed.'],
  [23.4, 27.8, 'The 1945 armistice made Hungary deliver goods worth *200 million dollars* to the Soviet Union.'],
  [28.0, 32.4, 'German property in Hungary, shares in *more than 500 firms*, passed to the Soviet Union.'],
  [32.6, 37.0, 'Joint Soviet–Hungarian firms followed; Pécs *uranium* was mined under a Soviet concession.'],
  [37.2, 41.6, 'In 1949 a Soviet-style emblem with a *red star* replaced the old *Kossuth coat of arms*.'],
  [41.8, 46.2, 'Russian was *compulsory* at school, until the minister promised to end it on 19 October 1956.'],
  [46.4, 50.8, 'And 15 March, the anniversary of the 1848 revolution, was an *ordinary working day*.'],
  [51.0, 55.4, 'On 22 October 1956 students drew up 16 demands. The first: *all Soviet troops out*.'],
  [55.6, 60.0, 'Point 14: the *Kossuth arms* back, 15 March a holiday and 6 October a day of mourning.'],
  [60.2, 64.6, 'Next day the emblem was cut from the flags, leaving Hungary’s own *red, white and green*.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneTroops(t);
    sceneEconomy(t);
    sceneSymbols(t);
    sceneDemands(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.gold } });
  },
});
