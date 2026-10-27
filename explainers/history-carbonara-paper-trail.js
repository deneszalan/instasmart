// Explainer for history-carbonara-paper-trail (Roma): carbonara, now a Roman classic, has a short paper trail. The
// name turns up first in 1939 (a Dutch-language paper in the Dutch East Indies, on a Trastevere trattoria), the
// first known recipe in 1952, and its ingredients kept changing (lard, pancetta, Gruyère, cream) until guanciale,
// pecorino and yolks became the strict norm in the 2000s and 2010s. The origin stories can't be settled by the record.
// Look: an espresso-dark table, cream paper cards pinned along a time strip, handwritten notes; egg yolk, cured-pork
// pink and pepper black. Fraunces for captions and card titles, Caveat for handwriting.
//
// Facts:
// - Wikipedia, "Carbonara": cured pork, hard cheese, eggs, salt and black pepper; guanciale traditional, pecorino
//   romano usually; La Stampa of 26 July 1950 reports American officers seeking "spaghetti alla carbonara" in
//   Trastevere for years; first attested recipe often cited as Patricia Bronté's Chicago guide of 1952; Italy's first
//   recipe, La Cucina Italiana 1954, with pancetta, garlic and Gruyère; theories: Allied soldiers' bacon and egg after
//   the liberation of Rome in 1944, charcoal workers (carbonari), and the family of pastas with cured pork, cheese and
//   pepper such as gricia; pasta cacio e uova (lard, eggs and cheese, no meat or pepper) documented as far back as 1839.
// - Il Post, 16 February 2026, "Forse la carbonara non la portarono gli americani", and L'Espresso, 24 February 2026:
//   De Koerier, a Dutch-language daily of the Dutch East Indies (today Indonesia), on 23 August 1939 described two
//   rival trattorias in Trastevere, one serving spaghetti alla carbonara; found by the journalists Edwin Winkels and
//   Janneke Vreugdenhil, confirmed by Alberto Grandi and Luca Cesari; it names the dish but gives no recipe; it makes
//   the 1944 "American" theory hard to hold as the starting point, though Grandi thinks the Americans still matter.
//   The first recipe known: April 1952, by the actor Aldo Fabrizi in La Croix du Nord (Lille): lard cooked with oil and
//   butter, pecorino, beaten eggs, parmesan; Patricia Bronté's Chicago recipe (December 1952) used parmesan.
// - Luca Cesari, "La storia della carbonara", ricettestoriche.it (2018): Bronté 1952: tagliarini, pancetta, 4 eggs,
//   parmesan; La Cucina Italiana, August 1954: pancetta, Gruyère, garlic; 1955 Dessì: smoked pancetta, pecorino as an
//   alternative; guanciale first in 1957 (Hammond and Martin, "Eating in Italy", "pig's cheek"); cream from 1960,
//   peaking in the 1980s and gone in the 1990s; the purism of guanciale, pecorino and egg (yolks) on recipe sites in
//   2009–2017, "a transformation begun a few decades ago, still in progress".
// The time strip is piecewise: 1830–1930 squeezed, 1930–1970 stretched, 1970–2030 in between.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  A plate of carbonara; how historians date a dish.
//  B  9.6–18.6  The time strip; the 1939 clipping from De Koerier.
//  C 18.8–27.8  No recipe; the 1944 soldiers' story comes after the name.
//  D 28.0–46.2  Recipe cards: Fabrizi 1952, Chicago 1952, Italy 1954, guanciale 1957, cream 1960s–80s.
//  E 46.4–55.4  Ingredient lanes: the strict version only in the 2000s–2010s; Luca Cesari's survey.
//  F 55.6–65.0  Older relatives (1839); the origin can't be settled.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#1d1712', bg2: '#2c2219', ink: '#f6efe0', soft: 'rgba(246,239,224,0.74)', faint: 'rgba(246,239,224,0.24)',
  paper: '#f4ead6', paper2: '#e3d3b2', pink: '#ef9a8a', pork: '#d9897a', yolk: '#f2c14e', pasta: '#f3d27a', pepper: '#141110',
  pecorino: '#efe6cf', gruyere: '#e3bb5c', cream: '#fff1cf', red: '#d6453d', blue: '#3b5b9a', dark: '#2a2018', green: '#7fae7a',
};
const SERIF = 'Fraunces', HAND = 'Caveat';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const NAME = 1939, SOLDIERS = 1944, RECIPE = 1952, ITALY = 1954, GUANCIALE = 1957, CREAM = 1960, EGG_CHEESE = 1839;
if (SOLDIERS - NAME !== 5 || RECIPE - NAME !== 13) throw new Error('numbers');

// ---------- the time strip ----------
const TS = { y: 640 };
const KNOTS = [[1830, 60], [1930, 170], [1970, 590], [2030, 804]];
function TX(yr) {
  for (let i = 1; i < KNOTS.length; i++) {
    const [y0, x0] = KNOTS[i - 1], [y1, x1] = KNOTS[i];
    if (yr <= y1) return x0 + ((x1 - x0) * (yr - y0)) / (y1 - y0);
  }
  return KNOTS.at(-1)[1];
}
function strip(a, y = TS.y) {
  A(a, () => {
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TX(1830), y); ctx.lineTo(TX(2030), y); ctx.stroke();
    // zigzags where the scale changes
    for (const yr of [1930, 1970]) { const x = TX(yr); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 10); ctx.lineTo(x + 6, y + 10); ctx.stroke(); }
    font(500, 22, SERIF);
    for (const yr of [1900, 1940, 1950, 1960, 2000, 2020]) {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TX(yr), y - 7); ctx.lineTo(TX(yr), y + 7); ctx.stroke();
      text(`${yr}`, TX(yr), y + 28, { align: 'center', base: 'middle', color: C.soft });
    }
  });
}
function pin(yr, col, a, { y = TS.y, r = 9 } = {}) {
  A(a, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(TX(yr), y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke(); });
}

// ---------- paper cards ----------
function card(x, y, w, h, rot, a, fn) {
  A(a, () => {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(6, 8, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(w / 2, 10, 8, 0, TAU); ctx.fill();
    fn(w, h);
    ctx.restore();
  });
}
function chip(label, x, y, col, { size = 36 } = {}) {
  font(600, size, HAND); const w = ctx.measureText(label).width;
  ctx.fillStyle = col; k.rrect(x, y - size * 0.62, w + 22, size * 1.24, size * 0.6); ctx.fill();
  ctx.strokeStyle = 'rgba(42,32,24,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  text(label, x + 11, y + 1, { base: 'middle', color: C.dark });
  return w + 32;
}
function chips(list, x, y, maxW) {
  let cx = x, cy = y;
  for (const [lab, col] of list) {
    font(600, 36, HAND); const w = ctx.measureText(lab).width + 32;
    if (cx + w > x + maxW) { cx = x; cy += 54; }
    chip(lab, cx, cy, col); cx += w;
  }
}

// ---------- A: the plate ----------
function plate(cx, cy, r, t) {
  ctx.fillStyle = '#f7f3ea'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#d8cfbd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, TAU); ctx.stroke();
  // a nest of spaghetti
  const rr = (() => { let s = 13; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const a0 = rr() * TAU, d = r * (0.15 + rr() * 0.5), a1 = a0 + 1.2 + rr() * 2;
    ctx.strokeStyle = i % 3 ? C.pasta : '#e9bf5a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a0) * r * 0.08, cy + Math.sin(a0) * r * 0.08, d, a0, a1); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // cubes of cured pork, cheese, pepper
  for (let i = 0; i < 14; i++) { const a = rr() * TAU, d = rr() * r * 0.55, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; ctx.fillStyle = C.pork; ctx.fillRect(x - 9, y - 7, 18, 14); ctx.fillStyle = '#f4d3c8'; ctx.fillRect(x - 9, y - 7, 18, 5); }
  for (let i = 0; i < 160; i++) { const a = rr() * TAU, d = rr() * r * 0.62; ctx.fillStyle = i % 4 ? C.pepper : C.pecorino; ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.5, 2.5); }
}
function scenePlate(t) {
  A(span(t, 0, 9.6, 0.5, 0.5), () => {
    font(600, 26); text('SPAGHETTI ALLA CARBONARA · ROME', CX, 100, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const s = lerp(1, 0.8, eio(seg(t, 5.0, 6.0))), y = lerp(410, 340, eio(seg(t, 5.0, 6.0)));
    plate(CX, y, 230 * s, t);
    // labels in handwriting
    A(seg(t, 1.4, 2.0) * (1 - seg(t, 4.8, 5.2)), () => {
      font(700, 42, HAND);
      text('egg', 150, 230, { align: 'center', base: 'middle', color: C.yolk });
      text('pecorino', 720, 240, { align: 'center', base: 'middle', color: C.pecorino });
      text('guanciale', 160, 600, { align: 'center', base: 'middle', color: C.pink });
      text('black pepper', 700, 600, { align: 'center', base: 'middle', color: C.ink });
    });
    // three kinds of record
    A(seg(t, 5.6, 6.2), () => {
      const items = [['newspaper', C.blue], ['menu', C.red], ['recipe', C.green]];
      items.forEach(([lab, col], i) => card(150 + i * 210, 600, 150, 110, (i - 1) * 0.05, seg(t, 5.8 + i * 0.35, 6.3 + i * 0.35), (w, h) => {
        ctx.fillStyle = col; for (let j = 0; j < 4; j++) ctx.fillRect(16, 32 + j * 16, w - 32 - (j % 2) * 30, 6);
        font(700, 30, HAND); text(lab, w / 2, h - 18, { align: 'center', base: 'middle', color: C.dark });
      }));
    });
  });
}

// ---------- B and C: the name in 1939; the soldiers' story ----------
function sceneName(t) {
  A(span(t, 9.4, 28.0, 0.5, 0.4), () => {
    strip(seg(t, 9.6, 10.4));
    A(seg(t, 9.8, 10.2) * (1 - seg(t, 10.4, 10.8)), () => { font(600, 30, HAND); text('the paper trail', TX(1830), TS.y - 40, { base: 'middle', color: C.soft }); });
    // a magnifying glass searching the strip
    A(seg(t, 10.4, 10.8) * (1 - seg(t, 13.4, 13.8)), () => {
      const x = lerp(TX(1830) + 20, TX(NAME), eio(seg(t, 10.6, 12.6))), y = TS.y - 150;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, 56, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(244,234,214,0.08)'; ctx.fill();
      ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 40, y + 40); ctx.lineTo(x + 92, y + 92); ctx.stroke(); ctx.lineCap = 'butt';
    });
    // nothing before 1939: a long empty stretch
    A(seg(t, 10.4, 11.4) * (1 - seg(t, 18.4, 18.8)), () => {
      ctx.strokeStyle = 'rgba(214,69,61,0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(TX(1830), TS.y - 16); ctx.lineTo(TX(NAME) - 6, TS.y - 16); ctx.stroke();
      font(600, 28, HAND); text('no “carbonara” found', (TX(1830) + TX(NAME)) / 2, TS.y - 40, { align: 'center', base: 'middle', color: C.red });
    });
    pin(NAME, C.yolk, seg(t, 12.6, 13.0));
    // the clipping
    card(150, 140, 560, 330, -0.03, seg(t, 14.2, 14.9), (w, h) => {
      font(800, 44, SERIF); text('DE KOERIER', w / 2, 62, { align: 'center', base: 'middle', color: C.dark, spacing: '2px' });
      ctx.fillStyle = C.dark; ctx.fillRect(30, 88, w - 60, 3);
      font(500, 24, SERIF); text('23 August 1939 · Dutch East Indies', w / 2, 116, { align: 'center', base: 'middle', color: C.dark });
      for (let j = 0; j < 5; j++) { ctx.fillStyle = 'rgba(42,32,24,0.35)'; ctx.fillRect(34, 150 + j * 26, w - 68 - (j % 3) * 50, 8); }
      A(seg(t, 15.6, 16.2), () => {
        ctx.fillStyle = 'rgba(242,193,78,0.6)'; ctx.fillRect(34, 216, 380, 34);
        font(700, 26, SERIF); text('spaghetti alla carbonara', 44, 234, { base: 'middle', color: C.dark });
      });
      A(seg(t, 16.4, 17.0), () => { font(700, 30, HAND); text('a trattoria in Trastevere, Rome', w / 2, h - 34, { align: 'center', base: 'middle', color: C.blue }); });
    });
    A(seg(t, 13.0, 13.6), () => { font(700, 30, SERIF); text(`${NAME}`, TX(NAME), TS.y + 66, { align: 'center', base: 'middle', color: C.yolk }); });
    // C: no recipe; the soldiers' story after it
    A(seg(t, 19.0, 19.6), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(300, 528, 150, 32, -0.05, 0, TAU); ctx.stroke();
      font(700, 34, HAND); text('name only, no recipe', 300, 528, { align: 'center', base: 'middle', color: C.red });
    });
    A(seg(t, 23.4, 24.0), () => {
      pin(SOLDIERS, C.green, 1);
      font(700, 26, SERIF); text(`${SOLDIERS}`, TX(SOLDIERS) + 4, TS.y + 98, { align: 'center', base: 'middle', color: C.green });
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TX(SOLDIERS), TS.y + 12); ctx.lineTo(TX(SOLDIERS) + 4, TS.y + 80); ctx.stroke();
    });
    // the ration box: bacon and powdered egg
    A(seg(t, 24.0, 24.6), () => {
      const x = 560, y = 496, w = 240, h = 70;
      ctx.fillStyle = '#7b8a4e'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#5e6b3a'; ctx.fillRect(x, y, w, 14);
      font(700, 30, HAND); text('bacon · powdered egg', x + w / 2, y + 44, { align: 'center', base: 'middle', color: C.paper });
    });
    A(seg(t, 25.6, 26.2), () => {
      const x0 = TX(NAME), x1 = TX(SOLDIERS);
      ctx.strokeStyle = C.yolk; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, TS.y - 22); ctx.quadraticCurveTo((x0 + x1) / 2, TS.y - 70, x1, TS.y - 22); ctx.stroke();
      font(700, 32, HAND); text('the name came first', x0 - 14, TS.y - 40, { align: 'right', base: 'middle', color: C.yolk });
    });
  });
}

// ---------- D: recipe cards ----------
const RECIPES = [
  { t: 28.0, yr: 1952, who: 'Aldo Fabrizi, actor', where: 'La Croix du Nord, Lille', list: [['lard', C.pork], ['butter', C.cream], ['eggs', C.yolk], ['pecorino', C.pecorino], ['parmesan', C.gruyere]] },
  { t: 32.6, yr: 1952, who: 'Patricia Bronté', where: 'a guide to eating in Chicago', list: [['pancetta', C.pork], ['eggs', C.yolk], ['parmesan', C.gruyere]] },
  { t: 37.2, yr: 1954, who: 'La Cucina Italiana', where: 'Italy’s first printed recipe', list: [['pancetta', C.pork], ['garlic', C.paper2], ['Gruyère', C.gruyere]] },
  { t: 41.8, yr: 1957, who: 'Eating in Italy', where: 'a guidebook', list: [['guanciale (pork cheek)', C.pink]] },
];
function sceneRecipes(t) {
  A(span(t, 27.8, 46.4, 0.5, 0.4), () => {
    strip(1);
    pin(NAME, C.yolk, 1);
    RECIPES.forEach((r, i) => {
      pin(r.yr, C.green, seg(t, r.t + 0.4, r.t + 0.8), { y: TS.y, r: 8 + (i === 1 ? 3 : 0) });
      const on = seg(t, r.t + 0.1, r.t + 0.7) * (i < RECIPES.length - 1 ? 1 - seg(t, RECIPES[i + 1].t - 0.2, RECIPES[i + 1].t + 0.2) : 1 - seg(t, 45.6, 46.0));
      card(120 + (i % 2) * 20, 170, 620, 340, (i % 2 ? 0.025 : -0.02), on, (w, h) => {
        font(500, 26, SERIF); text(`${r.yr}`, 34, 56, { base: 'middle', color: C.red });
        font(800, 40, SERIF); text('Carbonara', 120, 56, { base: 'middle', color: C.dark });
        font(600, 30, HAND); text(r.who, 34, 112, { base: 'middle', color: C.blue });
        font(500, 26, HAND); text(r.where, 34, 148, { base: 'middle', color: C.dark });
        ctx.fillStyle = C.paper2; ctx.fillRect(30, 176, w - 60, 2);
        chips(r.list, 34, 226, w - 60);
        if (i === 0) A(seg(t, 29.4, 30.0), () => { font(700, 32, HAND); text('the first recipe known', w - 34, h - 40, { align: 'right', base: 'middle', color: C.red }); });
        if (i === 3) A(seg(t, 43.4, 44.0), () => {
          ctx.fillStyle = C.cream; k.rrect(34, 260, w - 68, 56, 12); ctx.fill();
          font(600, 30, HAND); text('then cream, from about 1960, most of all in the 1980s', w / 2, 289, { align: 'center', base: 'middle', color: C.dark });
        });
      });
    });
    A(seg(t, 43.4, 44.0), () => {
      ctx.fillStyle = 'rgba(255,241,207,0.85)'; ctx.fillRect(TX(CREAM), TS.y - 34, TX(1995) - TX(CREAM), 12);
      font(600, 26, HAND); text('cream', TX(1985), TS.y - 52, { align: 'center', base: 'middle', color: C.cream });
    });
  });
}

// ---------- E: ingredient lanes ----------
const LANES = [
  ['cured pork', [[1952, 2000, 'lard, pancetta; guanciale from 1957', C.pork], [2000, 2030, 'guanciale', C.pink]]],
  ['cheese', [[1952, 2000, 'parmesan, Gruyère, some pecorino', C.gruyere], [2000, 2030, 'pecorino', C.pecorino]]],
  ['egg', [[1952, 2000, 'beaten whole eggs', C.yolk], [2000, 2030, 'often yolks only', C.yolk]]],
  ['cream', [[1960, 1995, 'in from 1960, gone in the 1990s', C.cream]]],
];
function sceneLanes(t) {
  A(span(t, 46.2, 55.8, 0.5, 0.4), () => {
    strip(1);
    const g = eio(seg(t, 46.6, 48.4));
    // the strict version: a band over the 2000s–2010s
    A(seg(t, 48.8, 49.4), () => {
      const x0 = TX(2000), x1 = TX(2020);
      ctx.fillStyle = 'rgba(242,193,78,0.18)'; ctx.fillRect(x0, 178, x1 - x0, TS.y - 188);
      font(700, 30, HAND); text('the strict version', (x0 + x1) / 2, 158, { align: 'center', base: 'middle', color: C.yolk });
    });
    LANES.forEach(([name, bars], i) => {
      const y = 214 + i * 105;
      font(700, 30, HAND); text(name, TX(1830), y, { base: 'middle', color: C.ink });
      bars.forEach(([a, b, lab, col], j) => {
        const x0 = TX(a), x1 = lerp(x0, TX(b), g);
        ctx.fillStyle = col; k.rrect(x0, y + 20, Math.max(4, x1 - x0 - 3), 30, 8); ctx.fill();
        A(clamp(g * 2 - 1), () => {
          font(500, 23, SERIF);
          if (j === 0) text(lab, x0, y + 74, { base: 'middle', color: C.soft });
          else text(lab, TX(2030), y, { align: 'right', base: 'middle', color: col });
        });
      });
    });
    A(seg(t, 51.2, 51.8), () => { font(500, 24, SERIF); text('from Luca Cesari’s survey of carbonara recipes, 1950s to 2017', CX, 110, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

// ---------- F: older relatives; open question ----------
function sceneEnd(t) {
  A(span(t, 55.6, 65.4, 0.5, 0), () => {
    strip(1);
    pin(EGG_CHEESE, C.yolk, seg(t, 56.0, 56.6));
    pin(NAME, C.yolk, 1); pin(RECIPE, C.green, 1);
    A(seg(t, 56.2, 56.8), () => {
      card(70, 220, 330, 220, -0.04, 1, (w, h) => {
        font(500, 26, SERIF); text(`${EGG_CHEESE}`, 26, 50, { base: 'middle', color: C.red });
        font(700, 30, HAND); text('pasta with cheese', 26, 104, { base: 'middle', color: C.dark });
        text('and beaten eggs', 26, 144, { base: 'middle', color: C.dark });
        font(500, 24, HAND); text('no meat, no pepper, no name', 26, 186, { base: 'middle', color: C.blue });
      });
      ctx.strokeStyle = C.yolk; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(TX(EGG_CHEESE), TS.y - 12); ctx.lineTo(200, 450); ctx.stroke(); ctx.setLineDash([]);
    });
    // three origin stories with question marks
    const stories = [['American soldiers, 1944', C.green], ['charcoal burners', C.paper2], ['a Roman cook', C.pink]];
    stories.forEach(([s, col], i) => A(seg(t, 60.4 + i * 0.4, 61.0 + i * 0.4), () => {
      const y = 250 + i * 80;
      ctx.fillStyle = 'rgba(244,234,214,0.12)'; k.rrect(440, y - 30, 360, 60, 30); ctx.fill();
      font(700, 30, HAND); text(`${s}?`, 620, y, { align: 'center', base: 'middle', color: col });
    }));
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint wood grain
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(255,235,200,${0.015 + (i % 3) * 0.008})`; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * 28); g.bezierCurveTo(W * 0.3, i * 28 + 10, W * 0.6, i * 28 - 10, W, i * 28 + 4); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Carbonara, pasta with egg, pecorino cheese, cured pork and black pepper, is a Roman classic.'],
  [5.0, 9.4, 'Food historians date a dish by its *earliest written record*: a newspaper, a menu, a recipe.'],
  [9.6, 14.0, `For carbonara, the name turns up in no known text before *${NAME}*…`],
  [14.2, 18.6, '…when De Koerier, a Dutch-language paper in today’s Indonesia, mentions it at a trattoria in Rome.'],
  [18.8, 23.2, 'It names the dish but gives no recipe. Reported in 2026, it upset a favourite story…'],
  [23.4, 27.8, `…that American soldiers, after Rome’s liberation in ${SOLDIERS}, inspired it with bacon and egg rations.`],
  [28.0, 32.4, `The first known *recipe* is from *${RECIPE}*: actor Aldo Fabrizi’s, printed in a French newspaper.`],
  [32.6, 37.0, 'He used ~lard~, eggs, pecorino and parmesan. A Chicago guide that year used pancetta.'],
  [37.2, 41.6, `Italy’s first printed recipe, in ${ITALY}, had pancetta, garlic and Swiss ^Gruyère^ cheese.`],
  [41.8, 46.2, `~Guanciale~, cured pork cheek, first shows up in ${GUANCIALE}; cream came in around ${CREAM}.`],
  [46.4, 50.8, 'Today’s strict version, only guanciale, pecorino and egg, took over in the 2000s and 2010s.'],
  [51.0, 55.4, 'Food historian Luca Cesari traced these changes by reading carbonara recipes decade by decade.'],
  [55.6, 60.0, `Its relatives are older: pasta tossed with cheese and beaten eggs is in print by *${EGG_CHEESE}*.`],
  [60.2, 64.6, 'So who invented carbonara? The paper trail can’t say. It only shows the dish is younger than it seems.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, HAND],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePlate(t);
    sceneName(t);
    sceneRecipes(t);
    sceneLanes(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.yolk, '~': C.pink, '^': C.gruyere } });
  },
});
