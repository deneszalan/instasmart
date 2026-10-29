// Explainer for art-statue-of-liberty-enlarged-by-four: on 28 October 2026 the Statue of Liberty marked 140
// years since it was unveiled in New York Harbor (28 October 1886); an exhibition on the Eiffel Tower, "Lady
// Liberty, derrière l'icône, le génie d'Eiffel", runs from 12 October to 12 November 2026 for the anniversary.
// How did the sculptor Auguste Bartholdi make a 46-metre statue? By enlarging models by measurement, four times
// at a time, and hammering thin copper sheets into wooden molds. Look: a harbour night in deep blue-green, the
// statue as a silhouette in fresh copper, plaster models in cream, measuring lines in gold. Cormorant Garamond
// for titles and numbers, Libre Franklin for captions and labels.
//
// Facts:
// - NPS Historical Handbook No. 11, "Statue of Liberty", chapter "Construction of the Statue"
//   (npshistory.com/handbooks/historical/11/hh11e.htm): study model 1.25 m, about 4 ft, cast and recast; from
//   it a 2.85 m statue; then a model four times larger, 11 m (36 ft), "corrected down to the most minute
//   detail"; divided into sections, each reproduced four times its size; "For each section of the enlarged
//   model it was necessary to take about 9,000 separate measurements"; carpenters made wooden molds; copper
//   sheets 3/32 inch thick pressed and hammered into shape; more than 300 separate sheets; Gustave Eiffel's
//   framework: four iron posts form a pylon, each sheet backed by an iron strap, each section supported
//   independently.
// - NPS, "Statue of Liberty Statistics": top of base to torch 46.05 m (151 ft 1 in); copper 176,000 lb; copper
//   sheeting 3/32 of an inch, "the thickness of two pennies placed together".
// - NPS, "Creating the Statue of Liberty": French sculptor Auguste Bartholdi began designing it in 1870;
//   construction in France began in 1876; completed and assembled in Paris between 1881 and 1884;
//   disassembled and shipped in crates; arrived in New York Harbor on 17 June 1885; "On October 28, 1886, the
//   statue of 'Liberty Enlightening the World' was officially unveiled."
// - Paris.fr, exhibition page: the 140th anniversary of the inauguration; Eiffel's metal structure.
// Computed here: 176,000 lb ≈ 80 tonnes; 3/32 inch ≈ 2.4 mm; four times the height gives 4² = 16 times the
// surface and 4³ = 64 times the volume; the statue is about 37 times the study model's height.
//
// Scene plan (60 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.2  140 years; the statue, 46 m to the torch.
//  B  9.2–27.4  The models: 1.25 m, 2.85 m, 11 m; sections made again four times larger; 9,000 measurements.
//  C 27.6–36.6  Distances times four; 16 times the surface, 64 times the volume.
//  D 36.8–50.4  Wooden molds; copper hammered in; 300 sheets, 80 tonnes.
//  E 50.6–60.0  Eiffel's frame; Paris to New York.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#11262b', bg2: '#081114', ink: '#f5efe6', soft: 'rgba(245,239,230,0.72)', faint: 'rgba(245,239,230,0.22)',
  copper: '#c97a45', copperHi: '#e5a06a', copperLo: '#8f4f27', patina: '#76c4a8', plaster: '#ece4d4', plasterLo: '#c9bfab',
  gold: '#f1c35c', wood: '#9a6a3f', woodLo: '#6f4826', iron: '#8b98a3', panel: 'rgba(0,0,0,0.30)',
};
const SERIF = 'Cormorant Garamond', SANS = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers (NPS) ----------
const M = { study: 1.25, second: 2.85, model: 11, statue: 46.05 }; // metres; the statue from the top of its base to the torch
const SHEETS = 300, MEASURES = 9000, COPPER_LB = 176000;
const TONNES = Math.round((COPPER_LB * 0.45359237) / 1000); // 80
const MM = (3 / 32) * 25.4; // 2.4 mm
const FACTOR = 4;

const CUES = [
  [0.4, 4.6, 'On 28 October 2026, the Statue of Liberty marked 140 years since it was unveiled in New York.'],
  [4.8, 9.0, `French sculptor Auguste Bartholdi made it ^${M.statue.toFixed(0)} metres^ tall from base to torch. How?`],
  [9.2, 13.6, `Not by carving. He began with a study model about ${M.study} metres high, about four feet.`],
  [13.8, 18.2, `From it came a ${M.second}-metre version, then one four times larger: *${M.model} metres*.`],
  [18.4, 22.8, 'That model was cut into sections, and each was made again four times its size.'],
  [23.0, 27.4, `For each enlarged section, workers took about ^${fmt(MEASURES)} measurements^.`],
  [27.6, 32.0, 'Each distance measured on the model was made four times longer at full size.'],
  [32.2, 36.6, `Four times taller means *${FACTOR * FACTOR} times* the surface, and ~${FACTOR ** 3} times~ the volume if solid.`],
  [36.8, 41.2, 'So the statue is a hollow skin. Carpenters built wooden molds of each full-size section.'],
  [41.4, 45.8, `Copper sheets 3/32 of an inch thick, about ${MM.toFixed(1)} mm, were hammered into them by hand.`],
  [46.0, 50.4, `More than ${SHEETS} sheets make up the skin: about ^${TONNES} tonnes^ of copper.`],
  [50.6, 55.0, 'Inside, Gustave Eiffel’s iron frame holds every sheet up on its own iron strap.'],
  [55.2, 60.0, 'Built in Paris, it was taken apart, shipped in crates and put back together in New York.'],
];

// ---------- background: harbour night ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(245,239,230,${0.15 + rnd() * 0.35})`; g.beginPath(); g.arc(rnd() * W, rnd() * 600, rnd() * 1.3, 0, 7); g.fill(); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(200,235,230,${rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- the silhouette: x, y in units of the height (base to torch = 1), y up ----------
const FIG = [
  [-0.135, 0], [0.135, 0], [0.13, 0.15], [0.12, 0.3], [0.115, 0.42], [0.165, 0.43], [0.15, 0.62], [0.1, 0.63], [0.085, 0.645],
  [0.035, 0.675], [0.042, 0.712], [0.072, 0.738], [0.046, 0.736], [0.052, 0.766], [0.026, 0.746], [0.014, 0.782], [0, 0.752],
  [-0.014, 0.782], [-0.026, 0.746], [-0.05, 0.764], [-0.044, 0.734], [-0.07, 0.738], [-0.042, 0.712], [-0.036, 0.678],
  [-0.06, 0.7], [-0.082, 0.8], [-0.092, 0.9], [-0.088, 0.918], [-0.104, 0.94], [-0.098, 0.965], [-0.122, 1.0], [-0.148, 0.966],
  [-0.142, 0.94], [-0.158, 0.918], [-0.128, 0.904], [-0.122, 0.8], [-0.108, 0.7], [-0.094, 0.645], [-0.104, 0.55], [-0.12, 0.35], [-0.13, 0.15],
];
/** Trace the figure with its base at (x, y) and the given height in pixels. */
function figPath(x, y, h) {
  ctx.beginPath();
  FIG.forEach(([fx, fy], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, x + fx * h, y - fy * h));
  ctx.closePath();
}
function figure(x, y, h, fill, o = {}) {
  figPath(x, y, h);
  if (o.grad) {
    const g = ctx.createLinearGradient(x - 0.15 * h, y - h, x + 0.15 * h, y);
    g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); ctx.fillStyle = g;
  } else ctx.fillStyle = fill;
  ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw ?? 2; ctx.stroke(); }
}
/** A person for scale, 1.7 m tall. */
function person(x, y, h, col = C.soft) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - h * 0.9, h * 0.1, 0, 7); ctx.fill();
  k.rrect(x - h * 0.11, y - h * 0.78, h * 0.22, h * 0.42, h * 0.05); ctx.fill();
  ctx.fillRect(x - h * 0.09, y - h * 0.38, h * 0.07, h * 0.38); ctx.fillRect(x + h * 0.02, y - h * 0.38, h * 0.07, h * 0.38);
}

// ---------- A: the statue ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(600, 24); text('NEW YORK HARBOR · UNVEILED 28 OCTOBER 1886', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      k.font(600, 44, SERIF); text('Liberty Enlightening the World', CX, 186, { align: 'center', color: C.ink });
    });
    const g = eout(seg(t, 0.6, 2.2));
    A(g, () => figure(CX, 740, 500 * (0.9 + 0.1 * g), null, { grad: [C.copperHi, C.copperLo] }));
    A(seg(t, 5.0, 5.6), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
      const x = 640;
      ctx.beginPath(); ctx.moveTo(x, 740); ctx.lineTo(x, 240); ctx.stroke();
      for (const y of [740, 240]) { ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.stroke(); }
      k.font(700, 56, SERIF); text(`${M.statue.toFixed(0)} m`, x + 26, 490, { color: C.gold });
      font(500, 22); text('base to torch', x + 26, 534, { color: C.soft });
    });
  });
}

// ---------- B: the models ----------
function sceneModels(t) {
  const a = span(t, 9.2, 27.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 18.4) {
      font(600, 24); text('BARTHOLDI’S MODELS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // a camera that zooms out as the models grow: metres shown in 520 px
      const view = lerp(lerp(2.2, 4.0, eio(seg(t, 13.8, 15.0))), 13.5, eio(seg(t, 15.6, 17.0)));
      const px = 520 / view, ground = 730;
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, ground); ctx.lineTo(804, ground); ctx.stroke();
      const items = [
        ['person', 1.7, 9.4, 1.0],
        [M.study, M.study, 9.6, 1.6],
        [M.second, M.second, 13.9, 3.6],
        [M.model, M.model, 15.7, 9.6],
      ];
      items.forEach(([lab, hM, t0, xM]) => {
        const g = eout(seg(t, t0, t0 + 0.6));
        if (g <= 0) return;
        const x = 90 + xM * px * 0.55 + (lab === 'person' ? 0 : 20), h = hM * px;
        A(g, () => {
          if (lab === 'person') person(x, ground, h);
          else figure(x, ground, h, C.plaster, { stroke: C.plasterLo });
          if (lab !== 'person' && h > 70) { k.font(700, 34, SERIF); text(`${lab} m`, x, ground - h - 28, { align: 'center', color: lab === M.model ? C.patina : C.ink }); }
        });
      });
      A(seg(t, 9.6, 10.2) * (1 - seg(t, 14.6, 15.0)), () => { font(500, 22); text('person, 1.7 m', 90 + 1.0 * px * 0.55, ground + 30, { align: 'center', color: C.soft }); });
      A(seg(t, 16.8, 17.3), () => { k.font(500, 32, SERIF); text('“corrected down to', 620, 380, { align: 'center', color: C.soft }); text('the most minute detail”', 620, 420, { align: 'center', color: C.soft }); font(500, 20); text('NPS Historical Handbook', 620, 462, { align: 'center', color: C.faint }); });
    } else {
      font(600, 24); text('SECTION BY SECTION, FOUR TIMES LARGER', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // the 11 m model, cut into bands; one band enlarged four times beside it
      const x0 = 210, base = 720, h = 500;
      figure(x0, base, h, C.plaster, { stroke: C.plasterLo });
      const cut = eio(seg(t, 18.6, 19.8));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      for (let i = 1; i < 10; i++) { const y = base - (i / 10) * h; ctx.beginPath(); ctx.moveTo(x0 - 90, y); ctx.lineTo(lerp(x0 - 90, x0 + 90, cut), y); ctx.stroke(); }
      ctx.setLineDash([]);
      font(600, 24); text(`${M.model} m model`, x0, base + 34, { align: 'center', color: C.soft });
      // the head band (0.7–0.8) at four times
      const g = eio(seg(t, 20.0, 21.6));
      if (g > 0) {
        const bx = 560, by = 470, big = h * FACTOR * lerp(0.25, 1, g);
        ctx.save(); ctx.beginPath(); ctx.rect(bx - 200, by - 200, 400, 340); ctx.clip();
        figure(bx, by + 0.75 * big, big, C.plaster, { stroke: C.plasterLo, lw: 3 });
        ctx.restore();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(bx - 200, by - 200, 400, 340);
        A(seg(t, 21.6, 22.0), () => { font(700, 26); text('one section × 4', bx, by + 170, { align: 'center', color: C.gold }); });
        // highlight the band on the model
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(x0 - 70, base - 0.8 * h, 140, 0.1 * h);
      }
      // 9,000 measurements: dots pricking the enlarged section
      if (t > 23.0) {
        let s = 3; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
        const n = Math.floor(lerp(0, 900, seg(t, 23.2, 26.4)));
        ctx.save(); ctx.beginPath(); ctx.rect(360, 270, 400, 340); ctx.clip();
        const big = h * FACTOR;
        figPath(560, 470 + 0.75 * big, big); ctx.clip();
        ctx.fillStyle = C.gold;
        for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(360 + rnd() * 400, 270 + rnd() * 340, 1.8, 0, 7); ctx.fill(); }
        ctx.restore();
        A(seg(t, 24.0, 24.5), () => { k.font(700, 44, SERIF); text(`≈ ${fmt(MEASURES)}`, 560, 680, { align: 'center', color: C.gold }); font(500, 22); text('measurements for each section (one dot = ten)', 560, 720, { align: 'center', color: C.soft }); });
      }
    }
  });
}

// ---------- C: times four ----------
function sceneScale(t) {
  const a = span(t, 27.6, 36.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 32.2) {
      font(600, 24); text('MEASURE, MULTIPLY BY FOUR, MARK', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // a profile of the head: small on the left, four times on the right, with the same three measurements
      const pts = [[0.03, 0.70], [0.05, 0.736], [0.014, 0.78]];
      const small = { x: 170, y: 620, h: 600 }, bigS = { x: 520, y: 620 + 0.0, h: 2400 };
      ctx.save(); ctx.beginPath(); ctx.rect(70, 200, 200, 440); ctx.clip(); figure(small.x, small.y + 0.68 * small.h, small.h, C.plaster, { stroke: C.plasterLo }); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(330, 200, 470, 440); ctx.clip(); figure(bigS.x, bigS.y + 0.68 * bigS.h, bigS.h, C.plaster, { stroke: C.plasterLo, lw: 3 }); ctx.restore();
      font(600, 22); text('model', 170, 670, { align: 'center', color: C.soft }); text('full size', 565, 670, { align: 'center', color: C.soft });
      pts.forEach(([fx, fy], i) => {
        const g = eio(seg(t, 28.0 + i * 0.9, 28.8 + i * 0.9));
        if (g <= 0) return;
        const sx = small.x + fx * small.h, sy = small.y + 0.68 * small.h - fy * small.h;
        const bx = bigS.x + fx * bigS.h, byy = bigS.y + 0.68 * bigS.h - fy * bigS.h;
        // from a fixed axis (the centre line) and a fixed level (y of the chin line)
        const ax = small.x, bax = bigS.x;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(ax, sy); ctx.lineTo(lerp(ax, sx, g), sy); ctx.stroke();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 7); ctx.fill();
        if (byy > 200 && byy < 640 && bx < 800) {
          ctx.beginPath(); ctx.moveTo(bax, byy); ctx.lineTo(lerp(bax, bx, g), byy); ctx.stroke();
          ctx.beginPath(); ctx.arc(bx, byy, 8, 0, 7); ctx.fill();
        }
      });
      A(seg(t, 30.4, 30.9), () => { k.font(700, 40, SERIF); text('× 4', 300, 420, { align: 'center', color: C.gold }); });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      for (const x of [small.x, bigS.x]) { ctx.beginPath(); ctx.moveTo(x, 210); ctx.lineTo(x, 640); ctx.stroke(); }
      ctx.setLineDash([]);
    } else {
      font(600, 24); text('FOUR TIMES TALLER', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // a square becomes 16 squares; a cube 64 cubes
      const s = 26, g = eout(seg(t, 32.4, 33.4));
      ctx.fillStyle = C.copper; ctx.fillRect(110, 400 - s, s, s);
      font(600, 22); text('1', 110 + s / 2, 400 + 26, { align: 'center', color: C.soft });
      for (let i = 0; i < 16; i++) A(seg(g, i / 16, i / 16 + 0.2), () => { ctx.fillStyle = C.copper; ctx.fillRect(200 + (i % 4) * (s + 4), 400 - 4 * (s + 4) + Math.floor(i / 4) * (s + 4), s, s); });
      A(seg(t, 33.4, 33.9), () => { k.font(700, 52, SERIF); text('16×', 260, 470, { align: 'center', color: C.copperHi }); font(500, 24); text('the surface', 260, 516, { align: 'center', color: C.soft }); });
      // cube: draw a 4×4×4 block in a simple oblique view
      const c0 = { x: 560, y: 410 }, u = 30, dx = 13, dy = -10;
      const cube = (x, y, col) => {
        ctx.fillStyle = col; ctx.fillRect(x, y - u, u, u);
        ctx.fillStyle = C.copperHi; ctx.beginPath(); ctx.moveTo(x, y - u); ctx.lineTo(x + dx, y - u + dy); ctx.lineTo(x + u + dx, y - u + dy); ctx.lineTo(x + u, y - u); ctx.fill();
        ctx.fillStyle = C.copperLo; ctx.beginPath(); ctx.moveTo(x + u, y - u); ctx.lineTo(x + u + dx, y - u + dy); ctx.lineTo(x + u + dx, y + dy); ctx.lineTo(x + u, y); ctx.fill();
      };
      const g2 = seg(t, 34.0, 35.4);
      let n = 0;
      for (let z = 3; z >= 0; z--) for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        n++;
        if (n / 64 > g2) continue;
        cube(c0.x + c * u + z * dx, c0.y - r * u + z * dy, C.copper);
      }
      A(seg(t, 35.2, 35.7), () => { k.font(700, 52, SERIF); text('64×', 640, 470, { align: 'center', color: C.patina }); font(500, 24); text('the volume, if solid', 640, 516, { align: 'center', color: C.soft }); });
    }
  });
}

// ---------- D: molds and copper ----------
function sceneCopper(t) {
  const a = span(t, 36.8, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 46.0) {
      font(600, 24); text('REPOUSSÉ: HAMMERED COPPER', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // a wooden mold: a curved trough of planks
      const mx = 160, my = 360, mw = 544;
      const curve = (u) => my + 140 * Math.sin(Math.PI * u);
      const g = eout(seg(t, 37.0, 38.2));
      A(g, () => {
        for (let i = 0; i < 9; i++) {
          const u0 = i / 9, u1 = (i + 1) / 9;
          ctx.fillStyle = i % 2 ? C.wood : C.woodLo;
          ctx.beginPath(); ctx.moveTo(mx + u0 * mw, curve(u0)); ctx.lineTo(mx + u1 * mw, curve(u1)); ctx.lineTo(mx + u1 * mw, my + 250); ctx.lineTo(mx + u0 * mw, my + 250); ctx.closePath(); ctx.fill();
        }
        font(600, 22); text('wooden mold of one section', CX, my + 284, { align: 'center', color: C.soft });
      });
      // the copper sheet: flat, then pressed into the mold
      const press = eio(seg(t, 41.6, 44.8));
      A(seg(t, 41.4, 41.8), () => {
        ctx.strokeStyle = C.copperHi; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const u = i / 40, y = lerp(my - 30, curve(u) - 6, press * (0.5 + 0.5 * Math.min(1, press * 1.2))); i ? ctx.lineTo(mx + u * mw, y) : ctx.moveTo(mx + u * mw, y); }
        ctx.stroke(); ctx.lineCap = 'butt';
        // the hammer
        const hu = 0.15 + 0.7 * ((t - 41.6) / 3.2 % 1), hy = curve(hu) - 6 - 40 - 50 * Math.abs(Math.sin((t - 41.6) * 9));
        if (t < 45.2) {
          const hx = mx + clamp(hu) * mw;
          ctx.fillStyle = C.iron; ctx.fillRect(hx - 30, hy - 26, 60, 26);
          ctx.fillStyle = '#7a5a3a'; ctx.fillRect(hx - 5, hy - 120, 10, 96);
        }
        font(700, 26); text(`${MM.toFixed(1)} mm`, 742, my - 30, { color: C.copperHi });
        font(500, 22); text('two pennies thick', 742, my + 2, { color: C.soft });
      });
    } else {
      font(600, 24); text(`MORE THAN ${SHEETS} SHEETS`, CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // the figure filled with sheet outlines
      const x = 300, base = 740, h = 560;
      ctx.save(); figPath(x, base, h); ctx.clip();
      const cols = 14, rows = 24, cw = (0.34 * h) / cols, rh = h / rows;
      let n = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const g = seg(t, 46.2 + (n++ / (rows * cols)) * 2.6, 46.5 + ((n - 1) / (rows * cols)) * 2.6);
        if (g <= 0) continue;
        const px = x - 0.17 * h + c * cw + (r % 2) * cw * 0.5, py = base - (r + 1) * rh;
        A(g, () => { ctx.fillStyle = (r + c) % 3 ? C.copper : C.copperHi; ctx.fillRect(px + 1, py + 1, cw - 2, rh - 2); });
      }
      ctx.restore();
      A(seg(t, 48.4, 48.9), () => {
        k.font(700, 60, SERIF); text(`≈ ${TONNES} t`, 620, 420, { align: 'center', color: C.copperHi });
        font(500, 24); text(`${fmt(COPPER_LB)} lb of copper`, 620, 470, { align: 'center', color: C.soft });
        text('hammered by hand', 620, 504, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- E: Eiffel's frame; Paris to New York ----------
function sceneFrame(t) {
  const a = eout(seg(t, 50.6, 51.2));
  if (a <= 0) return;
  A(a, () => {
    if (t < 55.2) {
      A(1 - seg(t, 54.9, 55.3), () => {
        font(600, 24); text('GUSTAVE EIFFEL’S FRAME', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
        const x = CX, base = 740, h = 560;
        // the skin, a little transparent
        A(0.35, () => figure(x, base, h, C.copper));
        figPath(x, base, h); ctx.strokeStyle = C.copperHi; ctx.lineWidth = 3; ctx.stroke();
        // four posts (a pylon), with cross-bracing
        const g = eio(seg(t, 50.8, 52.4));
        ctx.strokeStyle = C.iron; ctx.lineWidth = 5;
        for (const dx of [-0.05, -0.02, 0.02, 0.05]) { ctx.beginPath(); ctx.moveTo(x + dx * h, base); ctx.lineTo(x + dx * h * 0.7, base - 0.66 * h * g); ctx.stroke(); }
        ctx.lineWidth = 2;
        for (let i = 0; i < 9; i++) { const y0 = base - i * 0.07 * h, y1 = y0 - 0.07 * h; if (base - y1 > 0.66 * h * g) break; ctx.beginPath(); ctx.moveTo(x - 0.05 * h, y0); ctx.lineTo(x + 0.05 * h, y1); ctx.moveTo(x + 0.05 * h, y0); ctx.lineTo(x - 0.05 * h, y1); ctx.stroke(); }
        // straps out to the skin
        const g2 = seg(t, 52.4, 53.6);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
          if (i / 12 > g2) break;
          const fy = 0.05 + i * 0.05, y = base - fy * h, side = i % 2 ? 1 : -1;
          const edge = side > 0 ? 0.12 - fy * 0.03 : -0.125 + fy * 0.02;
          ctx.beginPath(); ctx.moveTo(x + side * 0.05 * h, y); ctx.lineTo(x + edge * h, y - 8); ctx.stroke();
        }
        A(seg(t, 53.4, 53.9), () => { font(600, 24); text('iron pylon', 160, 520, { align: 'center', color: C.iron }); text('straps hold each sheet', 704, 400, { align: 'center', color: C.gold }); });
      });
    } else {
      A(seg(t, 55.2, 55.7), () => {
        font(600, 24); text('FROM PARIS TO NEW YORK', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
        figure(160, 700, 440, null, { grad: [C.copperHi, C.copperLo] });
        const ev = [['1876', 'building begins in Paris'], ['1884', 'assembled in Paris'], ['1885', 'arrives in New York in crates'], ['1886', 'unveiled, 28 October']];
        ev.forEach(([y, s], i) => A(eout(seg(t, 55.6 + i * 0.6, 56.1 + i * 0.6)), () => {
          const yy = 300 + i * 100;
          ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(330, yy, 8, 0, 7); ctx.fill();
          if (i < 3) { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(330, yy + 10); ctx.lineTo(330, yy + 90); ctx.stroke(); }
          k.font(700, 40, SERIF); text(y, 360, yy, { color: C.gold });
          font(500, 26); text(s, 470, yy, { color: C.ink });
        }));
      });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneModels(t);
    sceneScale(t);
    sceneCopper(t);
    sceneFrame(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.patina, '~': C.copperHi, '^': C.gold } });
  },
});
