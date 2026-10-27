// Explainer for engineering-onkalo-nuclear-waste-licence: on 22 October 2026 the Finnish Government granted
// Posiva the world's first operating licence for a deep repository for spent nuclear fuel, Onkalo at
// Olkiluoto. Look: a granite cross-section in charcoal greys, the canister's copper and cast iron, sandy
// bentonite clay, a pale green for radioactivity. IBM Plex Sans for captions, labels and numbers, Cormorant
// Garamond for the name and the checklist (the long view of deep time).
//
// Drawn to scale: the canister's cross-section (1.05 m across, a 5 cm copper shell, 12 fuel channels for the
// Olkiluoto 1 and 2 canister) inside its 1.75 m deposition hole; the side view of a 4.75 m canister in an
// 8 m hole. Computed here: bar heights on a log scale for 1, 1/100 and 1/1000 of the fresh fuel's activity;
// 3,300 canisters at 60 a year.
// Facts: Posiva press release (22 October 2026): the Government granted the operating licence for the
// encapsulation and final disposal facility at Olkiluoto, the first in the world; disposal begins only after
// commissioning tests that STUK (the Radiation and Nuclear Safety Authority) must verify; safety rests on the
// multi-barrier principle. NucNet (22 October 2026): repository about 430 m into the bedrock in Eurajoki,
// western Finland; up to 6,500 tonnes of uranium, about 3,300 canisters, at most 60 a year; STUK's favourable
// safety assessment on 4 August 2026. Posiva, "Spent fuel": activity falls to a hundredth within a year and a
// thousandth after 40 years; to the level of a rich uranium ore deposit in 250,000 years. Posiva, "Release
// barriers": fuel, canister, bentonite buffer, tunnel backfill, bedrock; the cast-iron insert carries the load,
// the 5 cm copper shell resists corrosion and is welded shut; canisters 1.05 m across, 3.6–5.2 m long (4.75 m
// and 24.5 t for Olkiluoto 1 and 2, 12 assemblies); bentonite swells when wet and fills the space; tunnels are
// backfilled with bentonite and closed by a concrete plug about 6 m long. Posiva, "Deposition holes": one
// canister per vertical hole, about 8 m deep and 1.75 m across. Posiva, "Long-term safety": bedrock about
// 1,800 million years old.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The licence; the plant and the tunnels about 430 m down.
//  B  9.2–23.0  Why so deep and so long: activity falls to 1/100, then 1/1000, then 250,000 years.
//  C 23.0–50.4  The barriers, one by one: fuel in cast iron, copper, the hole, bentonite, backfill and plug.
//  D 50.4–64.6  The old bedrock; 3,300 canisters, 60 a year; the last checks before the first one.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#121417', bg2: '#1f2226', ink: '#f1efe9', soft: 'rgba(241,239,233,0.72)', faint: 'rgba(241,239,233,0.22)',
  rock: '#3a3d42', rock2: '#2c2f33', vein: 'rgba(200,190,170,0.10)', copper: '#d07a3f', copperHi: '#f0a46a', iron: '#5d646c',
  iron2: '#4a5057', clay: '#cdb58a', clay2: '#b39a6c', concrete: '#9aa0a6', glow: '#c6f26b', water: '#4aa3df', panel: 'rgba(10,11,13,0.78)',
  sky: '#2a3a4c', grass: '#4d6b45',
};
const SANS = 'IBM Plex Sans', SERIF = 'Cormorant Garamond';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const DEPTH = 430, CANISTERS = 3300, PER_YEAR = 60, URANIUM_T = 6500;
const CAN_D = 1.05, CAN_L = 4.75, COPPER = 0.05, HOLE_D = 1.75, HOLE_L = 8, ASSEMBLIES = 12;
const ACTIVITY = [[0, 1, 'fresh'], [1, 1 / 100, 'after 1 year'], [40, 1 / 1000, 'after 40 years']];

const CUES = [
  [0.4, 4.6, 'On 22 October 2026, Finland licensed *Onkalo*, the world’s first final store for spent fuel.'],
  [4.8, 9.0, `The company *Posiva* dug it at Olkiluoto, in western Finland, about *${DEPTH} metres* down.`],
  [9.2, 13.6, 'Fresh from a reactor, fuel is fiercely radioactive. Within a year, ~1/100~ of that is left.'],
  [13.8, 18.2, 'After about 40 years of cooling, ~1/1,000~ remains, and the fuel can go underground.'],
  [18.4, 22.8, 'But some atoms last far longer: it takes about *250,000 years* to fade to a rich uranium ore.'],
  [23.0, 27.4, 'So Onkalo relies on *several barriers*, each one backing up the others.'],
  [27.6, 32.0, 'The fuel rods go into a *cast-iron* insert, which carries the weight.'],
  [32.2, 36.6, 'Around it, a ^copper^ shell 5 cm thick, welded shut so groundwater can’t reach the iron.'],
  [36.8, 41.2, `Each canister, ${CAN_D} m wide and up to 5.2 m long, gets its own hole, about ${HOLE_L} m deep.`],
  [41.4, 45.8, 'Blocks of *bentonite* clay fill the gap. When wet, the clay swells and seals it.'],
  [46.0, 50.4, 'The tunnels are backfilled with clay and closed with concrete plugs.'],
  [50.6, 55.0, 'Around it all lies bedrock about *1,800 million years* old, mapped to avoid weak zones.'],
  [55.2, 59.6, `The licence covers up to *${URANIUM_T.toLocaleString('en-US')} tonnes* of uranium: about ${CANISTERS.toLocaleString('en-US')} canisters, ${PER_YEAR} a year.`],
  [59.8, 64.2, 'Before the first goes down, Finland’s radiation safety authority must approve final tests.'],
];

// ---------- background: granite ----------
let bg = null, granite = null;
function paintBg() {
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  granite = document.createElement('canvas'); granite.width = W; granite.height = H;
  const q = granite.getContext('2d');
  q.fillStyle = C.rock; q.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) {
    const v = r();
    q.fillStyle = v < 0.5 ? 'rgba(20,22,25,0.35)' : v < 0.85 ? 'rgba(120,122,128,0.25)' : 'rgba(210,190,170,0.22)';
    q.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2);
  }
  q.strokeStyle = C.vein; q.lineWidth = 2;
  for (let i = 0; i < 9; i++) { q.beginPath(); let x = r() * W, y = r() * H; q.moveTo(x, y); for (let j = 0; j < 8; j++) { x += (r() - 0.5) * 160; y += r() * 90; q.lineTo(x, y); } q.stroke(); }
}

function panel(x, y, w, h, rr = 14) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, rr); ctx.fill(); }

// ---------- A: the licence and the cross-section to 430 m ----------
function sceneSite(t) {
  const a = 1 - seg(t, 8.9, 9.5);
  if (a <= 0) return;
  A(a, () => {
    const top = 300, bottom = 720, Y = (d) => lerp(top, bottom, d / 500);
    // sky and ground
    ctx.fillStyle = C.sky; ctx.fillRect(0, 0, W, top);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top); ctx.clip(); ctx.drawImage(granite, 0, 0); ctx.restore();
    ctx.fillStyle = C.grass; ctx.fillRect(0, top - 6, W, 10);
    // the encapsulation plant on the surface
    ctx.fillStyle = '#c9ccd1'; ctx.fillRect(150, top - 60, 150, 56); ctx.fillRect(310, top - 34, 70, 30);
    font(600, 22); text('encapsulation plant', 150, top - 84, { color: C.soft });
    // the access tunnel winding down, and the repository level
    const p = eio(seg(t, 4.8, 7.6));
    ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 6; ctx.beginPath();
    const N = 120;
    for (let i = 0; i <= N * p; i++) {
      const u = i / N, d = u * DEPTH, x = 520 + Math.sin(u * Math.PI * 7) * 120;
      i ? ctx.lineTo(x, Y(d)) : ctx.moveTo(x, Y(d));
    }
    ctx.stroke();
    A(seg(t, 7.2, 7.8), () => {
      ctx.strokeStyle = C.copperHi; ctx.lineWidth = 7;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(150 + i * 10, Y(DEPTH)); ctx.lineTo(780, Y(DEPTH) + (i % 2) * 2); ctx.stroke(); }
      ctx.fillStyle = C.copperHi; for (let x = 170; x < 780; x += 46) ctx.fillRect(x, Y(DEPTH) + 4, 8, 22);
      font(700, 24); text('deposition tunnels', 150, Y(DEPTH) + 50, { color: C.copperHi });
    });
    // depth ruler
    A(seg(t, 4.8, 5.4), () => {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, Y(0)); ctx.lineTo(80, Y(DEPTH)); ctx.stroke();
      for (const d of [0, 100, 200, 300, 400]) { ctx.beginPath(); ctx.moveTo(72, Y(d)); ctx.lineTo(88, Y(d)); ctx.stroke(); font(500, 20); text(`${d} m`, 96, Y(d) + 2, { color: C.soft }); }
      font(700, 28); text(`≈ ${DEPTH} m`, 96, Y(DEPTH) - 24, { color: C.ink });
    });
    // the title card
    A(span(t, 0.3, 9.0, 0.5, 0.4), () => {
      font(700, 24); text('OLKILUOTO · FINLAND', 60, 84, { color: C.soft, spacing: '3px' });
      k.font(700, 64, SERIF); text('Onkalo', 60, 140, { color: C.ink });
      A(seg(t, 1.0, 1.5), () => {
        ctx.fillStyle = C.copper; k.rrect(300, 116, 380, 50, 8); ctx.fill();
        font(700, 24); text('licensed 22 October 2026', 490, 142, { color: '#1b120b', align: 'center' });
      });
    });
  });
}

// ---------- B: radioactivity falls, but slowly at the end ----------
function sceneDecay(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    panel(60, 110, 744, 600, 18);
    font(600, 24); text('radioactivity, compared with fresh fuel', 96, 156, { color: C.soft });
    font(500, 20); text('bars on a log scale: each step down is ten times less', 96, 188, { color: C.soft });
    const base = 640, top = 230, L = (v) => lerp(base, top, (Math.log10(v) + 4) / 4); // 1e-4 … 1
    for (const v of [1, 0.1, 0.01, 0.001]) { ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(200, L(v)); ctx.lineTo(560, L(v)); ctx.stroke(); }
    font(500, 20);
    [[1, '1'], [0.1, '1/10'], [0.01, '1/100'], [0.001, '1/1,000']].forEach(([v, lab]) => text(lab, 186, L(v), { color: C.soft, align: 'right' }));
    ACTIVITY.forEach(([yr, v, lab], i) => {
      const at = [9.4, 11.0, 14.0][i], g = eout(seg(t, at, at + 0.8));
      if (g <= 0) return;
      const x = 220 + i * 140, y = lerp(base, L(v), g);
      ctx.fillStyle = C.glow; ctx.globalAlpha *= 0.85; ctx.fillRect(x, y, 80, base - y); ctx.globalAlpha /= 0.85;
      font(600, 19); text(lab, x + 40, base + 26, { color: C.ink, align: 'center' });
    });
    // the long tail: 250,000 years
    A(seg(t, 18.4, 19.0), () => {
      // a time arrow, not a value: how long the last of it lasts
      const x0 = 590, x1 = 770, y = base - 40, p = eio(seg(t, 18.6, 20.2));
      ctx.strokeStyle = C.glow; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, p), y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.glow; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, p) + 14, y); ctx.lineTo(lerp(x0, x1, p) - 4, y - 10); ctx.lineTo(lerp(x0, x1, p) - 4, y + 10); ctx.fill();
      A(seg(t, 20.0, 20.5), () => {
        font(700, 40); text('250,000', 680, 330, { color: C.ink, align: 'center' });
        k.font(700, 30, SERIF); text('years', 680, 370, { color: C.soft, align: 'center' });
        font(500, 20); text('to fade to the level', 680, 420, { color: C.soft, align: 'center' });
        text('of a rich uranium ore', 680, 446, { color: C.soft, align: 'center' });
      });
    });
  });
}

// ---------- C: the barriers ----------
// top view of one canister in its hole, to scale
const TOP = { cx: W / 2, cy: 400, s: 300 / HOLE_D }; // px per metre: the hole is 300 px across
function topView(t, show) {
  const R = (m) => (m / 2) * TOP.s, { cx, cy } = TOP;
  // rock and the hole
  ctx.save(); ctx.beginPath(); ctx.rect(60, 110, 744, 600); ctx.clip(); ctx.drawImage(granite, 0, 0); ctx.restore();
  ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(cx, cy, R(HOLE_D), 0, Math.PI * 2); ctx.fill();
  // bentonite
  if (show.clay > 0) A(show.clay, () => {
    ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(cx, cy, R(HOLE_D) * lerp(0.86, 1, show.swell), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.clay2; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const ang = (i / 16) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * R(CAN_D), cy + Math.sin(ang) * R(CAN_D)); ctx.lineTo(cx + Math.cos(ang) * R(HOLE_D) * lerp(0.86, 1, show.swell), cy + Math.sin(ang) * R(HOLE_D) * lerp(0.86, 1, show.swell)); ctx.stroke(); }
  });
  // copper shell
  if (show.copper > 0) A(show.copper, () => { ctx.fillStyle = C.copper; ctx.beginPath(); ctx.arc(cx, cy, R(CAN_D), 0, Math.PI * 2); ctx.fill(); });
  // cast-iron insert with 12 channels
  A(show.iron, () => {
    ctx.fillStyle = C.iron; ctx.beginPath(); ctx.arc(cx, cy, R(CAN_D - 2 * COPPER), 0, Math.PI * 2); ctx.fill();
    const cs = 30, pos = [];
    for (let r = -1.5; r <= 1.5; r++) for (let c = -1.5; c <= 1.5; c++) if (!(Math.abs(r) === 1.5 && Math.abs(c) === 1.5)) pos.push([c, r]);
    pos.forEach(([c, r], i) => {
      const x = cx + c * (cs + 8) - cs / 2, y = cy + r * (cs + 8) - cs / 2;
      ctx.fillStyle = C.iron2; ctx.fillRect(x, y, cs, cs);
      if (show.fuel > i / ASSEMBLIES) { ctx.fillStyle = C.glow; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(x + 6 + a * 9, y + 6 + b * 9, 3, 0, Math.PI * 2); ctx.fill(); } }
    });
  });
}

function sideView(t, show) {
  // a tunnel along the top, a hole in its floor, the canister inside; 50 px per metre
  const s = 45, floor = 310, cx = W / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(60, 110, 744, 600); ctx.clip();
  ctx.drawImage(granite, 0, 0);
  // the tunnel
  ctx.fillStyle = '#0d0e10'; ctx.fillRect(60, floor - 5 * s * 0.7, 744, 5 * s * 0.7);
  ctx.strokeStyle = 'rgba(241,239,233,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(58, floor - 5 * s * 0.7, 748, 5 * s * 0.7);
  if (show.backfill > 0) A(show.backfill, () => { ctx.fillStyle = C.clay2; ctx.fillRect(60, floor - 5 * s * 0.7, 744 * show.backfill, 5 * s * 0.7); });
  if (show.plug > 0) A(show.plug, () => { ctx.fillStyle = C.concrete; ctx.fillRect(724, floor - 5 * s * 0.7, 60, 5 * s * 0.7); });
  // the hole
  const hw = HOLE_D * s, hh = Math.min(HOLE_L * s, 440);
  ctx.fillStyle = C.bg1; ctx.fillRect(cx - hw / 2, floor, hw, hh);
  if (show.clay > 0) A(show.clay, () => {
    const filled = hh * show.clayFill;
    ctx.fillStyle = C.clay; ctx.fillRect(cx - hw / 2, floor + hh - filled, hw, filled);
    ctx.strokeStyle = C.clay2; ctx.lineWidth = 2; for (let y = floor + hh; y > floor + hh - filled; y -= 40) { ctx.beginPath(); ctx.moveTo(cx - hw / 2, y); ctx.lineTo(cx + hw / 2, y); ctx.stroke(); }
  });
  // the canister
  const cw = CAN_D * s, ch = CAN_L * s, cy0 = floor + (hh - ch) / 2 + lerp(-200, 0, show.lower);
  ctx.fillStyle = C.copper; k.rrect(cx - cw / 2, cy0, cw, ch, 6); ctx.fill();
  ctx.fillStyle = C.copperHi; ctx.fillRect(cx - cw / 2 + 6, cy0 + 6, 5, ch - 12);
  ctx.restore();
  return { floor, hw, hh, cx, cy0, cw, ch, s };
}

function sceneBarriers(t) {
  const a = span(t, 23.0, 50.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    if (t < 36.9) {
      // top view: barriers appear in turn
      const show = { iron: eout(seg(t, 23.6, 24.4)), fuel: seg(t, 27.8, 30.4), copper: eout(seg(t, 32.4, 33.2)), clay: eout(seg(t, 23.0, 23.6)) * 0.35 + 0.65 * eout(seg(t, 25.0, 25.8)), swell: 1 };
      A(1 - seg(t, 36.4, 36.9), () => {
        topView(t, show);
        // labels for each layer, with leader lines
        const { cx, cy } = TOP, R = (m) => (m / 2) * TOP.s;
        const tags = [
          [24.6, 'bedrock', C.ink, cx + R(HOLE_D) + 40, cy - 190, cx + R(HOLE_D) * 0.95 + 30, cy - 160],
          [25.6, 'bentonite clay', C.clay, cx + R(HOLE_D) + 40, cy + 160, cx + R(HOLE_D) * 0.8, cy + 100],
          [28.0, 'cast iron + fuel', C.ink, 96, cy + 200, cx - R(CAN_D) * 0.5, cy + R(CAN_D) * 0.55],
          [32.6, 'copper, 5 cm', C.copperHi, 96, cy - 200, cx - R(CAN_D) * 0.72, cy - R(CAN_D) * 0.72],
        ];
        for (const [at, lab, col, lx, ly, px, py] of tags) A(eout(seg(t, at, at + 0.5)), () => {
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx + (lx < cx ? 150 : -10), ly); ctx.stroke();
          ctx.fillStyle = C.panel; k.rrect(lx - 12, ly - 22, 190, 44, 8); ctx.fill();
          font(600, 22); text(lab, lx, ly, { color: col });
        });
        font(500, 20); text(`seen from above, to scale: ${CAN_D} m canister in a ${HOLE_D} m hole`, 96, 136, { color: C.soft });
        // the weld: a bright arc running round the shell
        A(span(t, 33.2, 36.4, 0.2, 0.3), () => {
          const ang = ((t - 33.2) / 2.4) * Math.PI * 2;
          ctx.strokeStyle = '#fff4d6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R(CAN_D) - 2, -Math.PI / 2, -Math.PI / 2 + Math.min(Math.PI * 2, ang)); ctx.stroke();
          ctx.fillStyle = '#fff4d6'; ctx.beginPath(); ctx.arc(cx + Math.cos(-Math.PI / 2 + ang) * (R(CAN_D) - 2), cy + Math.sin(-Math.PI / 2 + ang) * (R(CAN_D) - 2), 9, 0, Math.PI * 2); ctx.fill();
        });
      });
    }
    if (t >= 36.4) {
      // side view: lowering, clay, backfill, plug
      const show = { lower: eio(seg(t, 37.0, 39.0)), clay: seg(t, 41.4, 41.8), clayFill: eio(seg(t, 41.6, 44.0)), backfill: eio(seg(t, 46.2, 48.6)), plug: eout(seg(t, 48.6, 49.2)) };
      A(seg(t, 36.4, 36.9), () => {
        // the clay fills around the canister, so draw it after lowering: drawn inside sideView before the canister for simplicity
        const g = sideView(t, show);
        font(500, 20); text('side view, to scale', 96, 136, { color: C.soft });
        // dimensions
        A(span(t, 37.4, 41.4, 0.4, 0.4), () => {
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
          const xr = g.cx + g.hw / 2 + 30; ctx.beginPath(); ctx.moveTo(xr, g.floor); ctx.lineTo(xr, g.floor + g.hh); ctx.stroke();
          font(600, 22); text(`hole ≈ ${HOLE_L} m deep`, xr + 12, g.floor + g.hh / 2, { color: C.ink });
          const xl = g.cx - g.hw / 2 - 30; ctx.beginPath(); ctx.moveTo(xl, g.cy0); ctx.lineTo(xl, g.cy0 + g.ch); ctx.stroke();
          text(`canister ${CAN_L} m`, xl - 12, g.cy0 + g.ch / 2, { color: C.copperHi, align: 'right' });
          font(500, 20); text('24.5 tonnes, 12 fuel assemblies', xl - 12, g.cy0 + g.ch / 2 + 30, { color: C.soft, align: 'right' });
        });
        // water seeping in and the clay swelling
        A(span(t, 43.6, 46.0, 0.3, 0.4), () => {
          for (let i = 0; i < 8; i++) {
            const p = ((t * 0.9 + i * 0.37) % 1), side = i % 2 ? 1 : -1;
            const x = g.cx + side * (g.hw / 2 + 60 - p * 56), y = g.floor + 60 + (i * 47) % (g.hh - 80);
            ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
          }
          font(600, 22); text('groundwater', g.cx + g.hw / 2 + 50, g.floor + g.hh - 30, { color: C.water });
          text('clay swells, seals the gap', g.cx + g.hw / 2 + 50, g.floor + g.hh, { color: C.clay });
        });
        A(1 - seg(t, 46.0, 46.4), () => { font(600, 22); text('deposition tunnel', 96, g.floor - 40, { color: C.soft }); });
        A(span(t, 46.2, 50.6, 0.4, 0.4), () => {
          font(700, 22); text('tunnel backfilled with bentonite', 96, g.floor - 78, { color: '#2a2218' });
          A(seg(t, 48.8, 49.3), () => text('concrete plug', 712, g.floor - 78, { color: '#2a2218', align: 'right' }));
        });
      });
    }
  });
}

// ---------- D: the bedrock, the numbers, the checks ----------
function sceneEnd(t) {
  const a = span(t, 50.6, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // the old bedrock with a whole panel of tunnels, avoiding fracture zones
    A(1 - seg(t, 55.0, 55.5), () => {
      ctx.save(); ctx.beginPath(); ctx.rect(60, 110, 744, 600); ctx.clip(); ctx.drawImage(granite, 0, 0);
      ctx.strokeStyle = 'rgba(255,120,90,0.55)'; ctx.lineWidth = 6;
      for (const [x0, y0, x1, y1] of [[260, 110, 330, 710], [610, 110, 560, 710]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
      const g = eio(seg(t, 51.0, 53.4));
      ctx.strokeStyle = C.copperHi; ctx.lineWidth = 7;
      for (let i = 0; i < 9; i++) {
        const y = 170 + i * 58, segs = [[90, 250], [345, 545], [625, 790]];
        for (const [x0, x1] of segs) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, g), y); ctx.stroke(); }
      }
      ctx.restore();
      A(seg(t, 51.4, 51.9), () => {
        panel(250, 610, 364, 80, 12);
        font(600, 22); text('weak zones in red: left alone', W / 2, 650, { color: C.ink, align: 'center' });
      });
    });
    // 3,300 canisters, 60 a year
    A(span(t, 55.2, 59.9, 0.4, 0.4), () => {
      panel(60, 110, 744, 600, 18);
      const cols = 66, cell = 9, x0 = 135, y0 = 200;
      const lit = Math.floor(eio(seg(t, 55.8, 59.0)) * CANISTERS);
      for (let i = 0; i < CANISTERS; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        ctx.fillStyle = i < lit ? C.copper : 'rgba(241,239,233,0.12)';
        ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - 2.5, cell - 2.5);
      }
      font(600, 24); text(`${CANISTERS.toLocaleString('en-US')} canisters, one square each`, 135, 160, { color: C.soft });
      font(700, 26); text(`at most ${PER_YEAR} canisters a year`, 135, 690, { color: C.copperHi });
    });
    // the last checks
    A(span(t, 59.8, 64.8, 0.4, 0.01), () => {
      panel(60, 110, 744, 600, 18);
      const steps = [['licence granted', '22 October 2026', true], ['commissioning tests', 'under way', false], ['regulator’s approval', 'still needed', false], ['first canister down', 'no date yet', false]];
      steps.forEach(([what, when, done], i) => {
        const g = eout(seg(t, 60.0 + i * 0.6, 60.5 + i * 0.6)), y = 200 + i * 120;
        A(g, () => {
          ctx.strokeStyle = done ? C.glow : C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(130, y, 22, 0, Math.PI * 2); ctx.stroke();
          if (done) { ctx.beginPath(); ctx.moveTo(119, y); ctx.lineTo(128, y + 9); ctx.lineTo(143, y - 10); ctx.stroke(); }
          k.font(700, 40, SERIF); text(what, 180, y - 12, { color: C.ink });
          font(500, 24); text(when, 180, y + 24, { color: done ? C.glow : C.soft });
        });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneSite(t);
    sceneDecay(t);
    sceneBarriers(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.copperHi, '~': C.glow, '^': C.copper } });
  },
});
