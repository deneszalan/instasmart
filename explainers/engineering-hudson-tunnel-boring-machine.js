// Explainer for engineering-hudson-tunnel-boring-machine: on 8 October 2026 the first tunnel boring machine of
// the Hudson Tunnel Project began mining in North Bergen, New Jersey. How such a machine digs and lines a tunnel
// at the same time, and pushes itself forward off the lining it has just built. Look: a cutaway through dark
// rock, the machine in safety yellow, concrete segments in pale grey, hydraulics in teal, forces in red.
// Oswald (condensed gothic) for numbers and labels, Barlow for captions.
//
// Facts: Gateway Development Commission (GDC) press release, 8 October 2026, "First Hudson Tunnel Project tunnel
// boring machine begins mining": the first machine, building the northern tube, began mining on schedule; a
// second will launch in the coming weeks (later this fall); the two will build the first 5,100 feet of the tunnel
// tubes, from the portal in North Bergen to the Hudson County Access Shaft on the border of Weehawken and
// Hoboken, then be replaced by a second pair designed for the mixed ground under the Hudson River; about 30 feet
// of tunnel a day including scheduled maintenance pauses; about one year for this section; single shield
// machines for hard, dry rock; 28-foot, 8-inch cutterhead; trailing gantries about 500 feet; more than 1,680
// tons; the spinning cutterhead is pressed against the rock face and disc cutters break the rock into chips;
// buckets collect it and direct it through the muck ring onto a conveyor belt that carries it out the back; an
// erector arm places precast concrete segments to form the permanent lining; hydraulic thrust jacks brace
// against the completed lining to push the machine forward. GDC press release, 28 September 2026: the first new
// rail tunnel under the river in more than 100 years; four machines in all, each pair building the two tubes at
// the same time; Tom Prendergast: the North River Tunnel went into service in 1910. International Tunnelling
// and Underground Space Association, "Shield TBM": the machine pushes with jacks against the precast segments;
// after the whole stroke it stops excavating and places the segments; once a ring is placed, the jacks push
// against it and a new stroke begins.
// Computed here: the bore's cross-section from the cutterhead diameter, π × (14.33 ft)² ≈ 645 sq ft, so a day's
// 30 feet removes about 19,400 cubic feet ≈ 550 m³ of rock. The ring width, the number of segments in a ring
// and the human figure are illustrations, not the project's design figures; the route map is schematic.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: the cutterhead starts turning on 8 October 2026; the route under the Palisades.
//  B  9.4–28.0  The machine: size; disc cutters; buckets and conveyor; the erector arm builds rings.
//  C 28.0–46.2  The trick: thrust jacks push off the newest ring; stop, build a ring, push again.
//  D 46.4–60.0  30 feet a day; about 550 m³ of rock a day; about a year to the shaft, two tubes.
//  E 60.2–65.0  Then a second pair for the mixed ground under the river.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  rock0: '#211d1b', rock1: '#2e2825', strata: 'rgba(255,240,220,0.05)', ink: '#f4efe6', soft: 'rgba(244,239,230,0.74)',
  faint: 'rgba(244,239,230,0.30)', yellow: '#f2b62b', yellowDk: '#b9861a', steel: '#6f7a80', concrete: '#cfc9bf',
  concrete2: '#a9a297', teal: '#3fc1b0', red: '#ef5a3c', chip: '#c99a5b', panel: 'rgba(24,21,19,0.86)', sky: '#3a4a55',
  water: '#2f6a8a',
};
const NUM = 'Oswald', CAP = 'Barlow';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers (GDC) ----------
const DIAM_FT = 28 + 8 / 12, PER_DAY_FT = 30, ROUTE_FT = 5100, GANTRY_FT = 500, TONS = 1680, OLD_TUNNEL = 1910;
const FT = 0.3048;
const AREA_FT2 = Math.PI * (DIAM_FT / 2) ** 2; // ≈ 645
const DAY_FT3 = AREA_FT2 * PER_DAY_FT; // ≈ 19,360
const DAY_M3 = DAY_FT3 * FT ** 3; // ≈ 548
const round = (v, to) => Math.round(v / to) * to;
const fmt = (v) => Math.round(v).toLocaleString('en-US');

const CUES = [
  [0.4, 4.8, 'On 8 October 2026, in North Bergen, New Jersey, a giant machine began boring a new rail tunnel.'],
  [5.0, 9.4, `It’s the first new rail tunnel under the Hudson River since *${OLD_TUNNEL}*, and it digs and builds at once.`],
  [9.6, 14.0, `Its cutting face is *28 feet 8 inches* across, with gear trailing about ${GANTRY_FT} feet behind it.`],
  [14.2, 18.6, 'The spinning cutterhead presses steel *disc cutters* into the rock, which breaks into chips.'],
  [18.8, 23.2, 'Buckets scoop up the chips onto a *conveyor belt* that carries them out the back.'],
  [23.4, 27.8, 'Behind the cutterhead, an *erector arm* sets curved concrete segments into a ring: the lining.'],
  [28.0, 32.4, 'To move forward, ~hydraulic jacks~ brace against the ring it has just built, and push.'],
  [32.6, 37.0, 'When the jacks are fully out, mining stops, and the arm builds a new ring in the gap.'],
  [37.2, 41.6, 'The jacks press on that new ring, and the machine pushes on again: dig, line, dig, line.'],
  [41.8, 46.2, 'So the tunnel it leaves behind is what the machine pushes against.'],
  [46.4, 50.8, `The plan: about *${PER_DAY_FT} feet a day*, stops for maintenance included. A bit more than its width.`],
  [51.0, 55.4, `That’s about *${fmt(round(DAY_M3, 10))} cubic metres* of rock a day, riding out on the belt.`],
  [55.6, 60.0, `About a year to reach a shaft *${fmt(ROUTE_FT)} feet* away. A second machine bores the twin tube.`],
  [60.2, 64.6, 'Then a new pair, built for the ^mixed ground^ under the river, takes over toward Manhattan.'],
];

// ---------- background: rock strata ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.rock1); lg.addColorStop(1, C.rock0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14; i++) {
    const y = 60 + i * 52 + r() * 20;
    g.strokeStyle = C.strata; g.lineWidth = 2 + r() * 6;
    g.beginPath();
    for (let x = 0; x <= W; x += 24) { const yy = y + Math.sin(x * 0.01 + i) * 8 + r() * 3; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,235,210,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2); }
}
const rnd = (i, j = 0) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };

function arrow(x0, y0, x1, y1, color, w = 6, head = 18) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}
function panel(x, y, w, h, r = 14) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); }

// ---------- the cutterhead, face on ----------
function cutterhead(cx, cy, R, angle, { labels = 0 } = {}) {
  ctx.fillStyle = C.yellowDk; ctx.beginPath(); ctx.arc(cx, cy, R + 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
  // bucket openings at the rim
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.rotate((i / 8) * Math.PI * 2);
    ctx.fillStyle = C.rock0; k.rrect(R * 0.78, -R * 0.07, R * 0.17, R * 0.14, 6); ctx.fill();
    ctx.restore();
  }
  // spokes
  ctx.strokeStyle = C.yellowDk; ctx.lineWidth = R * 0.05;
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate((i / 4) * Math.PI * 2 + Math.PI / 8); ctx.beginPath(); ctx.moveTo(R * 0.18, 0); ctx.lineTo(R * 0.95, 0); ctx.stroke(); ctx.restore(); }
  // disc cutters along a spiral
  for (let i = 0; i < 26; i++) {
    const rr = R * (0.16 + (i / 26) * 0.6), an = i * 2.4;
    ctx.save(); ctx.rotate(an); ctx.translate(rr, 0);
    ctx.fillStyle = '#3b3a38'; k.rrect(-R * 0.022, -R * 0.06, R * 0.044, R * 0.12, 3); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle = C.yellowDk; ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2); ctx.fill();
  if (labels > 0) A(labels, () => {
    const an = angle + 2.4 * 14, rr = R * (0.16 + (14 / 26) * 0.6);
    const px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.stroke();
  });
}

// ---------- A: the hook ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const spin = Math.max(0, t - 1.2) ** 1.6 * 0.12;
    cutterhead(W / 2, 450, 250, spin);
    A(seg(t, 0.4, 1.0), () => {
      panel(W / 2 - 230, 140, 460, 88, 16);
      font(600, 44); text('8 OCTOBER 2026', W / 2, 172, { color: C.yellow, align: 'center', spacing: '3px' });
      font(400, 22, CAP); text('Hudson Tunnel Project · North Bergen, New Jersey', W / 2, 208, { color: C.soft, align: 'center' });
    });
    // chips flying off the face
    for (let i = 0; i < 26; i++) {
      const u = ((t - 1.4) * 0.8 + rnd(i, 3)) % 1;
      if (t < 1.4) break;
      const an = rnd(i, 4) * Math.PI * 2, d = 250 + u * 160;
      A((1 - u) * 0.9, () => { ctx.fillStyle = C.chip; ctx.fillRect(W / 2 + Math.cos(an) * d, 450 + Math.sin(an) * d * 0.9, 6, 5); });
    }
  });
}
function route(t, { from, to, second = 0, river = 0, twin = 0, progress = 0 }) {
  const a = span(t, from, to, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const ground = (x) => (x < 140 ? 330 : x < 200 ? lerp(330, 220, (x - 140) / 60) : x < 470 ? 220 + Math.sin(x * 0.03) * 6 : x < 520 ? lerp(220, 380, (x - 470) / 50) : 380);
    // sky above the ground line
    ctx.fillStyle = C.sky; ctx.beginPath(); ctx.moveTo(0, 120); ctx.lineTo(W, 120);
    for (let x = W; x >= 0; x -= 6) ctx.lineTo(x, ground(x)); ctx.closePath(); ctx.fill();
    // the river
    ctx.fillStyle = C.water; ctx.fillRect(540, 380, 230, 46);
    font(500, 22, CAP); text('Hudson River', 655, 360, { color: C.ink, align: 'center' });
    font(600, 24); text('PALISADES', 335, 196, { color: C.soft, align: 'center', spacing: '3px' });
    font(500, 22, CAP); text('New Jersey', 70, 304, { color: C.soft, align: 'center' });
    text('Manhattan', 812, 356, { color: C.soft, align: 'center' });
    // the tunnel line: the first 5,100 ft under the Palisades, then under the river
    const x0 = 150, xs = 480, x1 = 820, y0 = 470, ys = 500, y1 = 520;
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.faint; ctx.lineWidth = 10; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xs, ys); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    const p = eio(progress);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, xs, p), lerp(y0, ys, p)); ctx.stroke();
    if (twin > 0) A(twin, () => { ctx.strokeStyle = C.yellowDk; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, y0 + 26); ctx.lineTo(lerp(x0, xs, p * 0.15), lerp(y0 + 26, ys + 26, p * 0.15)); ctx.stroke(); });
    // the portal and the shaft
    ctx.fillStyle = C.ink; ctx.fillRect(x0 - 8, ground(x0), 16, y0 - ground(x0));
    ctx.fillStyle = C.concrete; ctx.fillRect(xs - 9, ground(xs), 18, ys - ground(xs) + 30);
    font(500, 21, CAP);
    text('portal, North Bergen', x0 - 10, y0 + 70, { color: C.ink, align: 'left' });
    text('Hudson County Access Shaft', xs + 18, ys + 64, { color: C.ink, align: 'left' });
    text('Weehawken–Hoboken border', xs + 18, ys + 92, { color: C.soft, align: 'left' });
    if (second > 0) A(second, () => { font(600, 26); text(`${fmt(ROUTE_FT)} FT OF HARD ROCK`, (x0 + xs) / 2, 590, { color: C.yellow, align: 'center' }); });
    if (river > 0) A(river, () => {
      ctx.strokeStyle = C.water; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(xs, ys); ctx.lineTo(lerp(xs, x1, river), lerp(ys, y1, river)); ctx.stroke();
      panel(520, 600, 300, 84, 14);
      font(600, 24); text('SECOND PAIR OF MACHINES', 670, 626, { color: C.ink, align: 'center' });
      font(500, 21, CAP); text('built for mixed ground', 670, 660, { color: C.soft, align: 'center' });
    });
    font(400, 19, CAP); text('schematic, not to scale', W / 2, 760, { color: C.faint, align: 'center' });
  });
}

// ---------- B: the machine ----------
function size(t) {
  const a = span(t, 9.6, 14.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cy = 450, R = 170, faceX = 600;
    // the trailing gantries running off to the left
    const g = eio(seg(t, 10.2, 11.6));
    ctx.fillStyle = C.steel;
    for (let i = 0; i < 6; i++) { const x = faceX - 330 - i * 120; if (x < -120) break; ctx.globalAlpha = g; ctx.fillRect(x, cy - 60, 100, 120); ctx.fillStyle = '#58636a'; ctx.fillRect(x, cy + 50, 100, 10); ctx.fillStyle = C.steel; }
    ctx.globalAlpha = 1;
    // the shield and the cutterhead, side on
    ctx.fillStyle = C.yellow; ctx.fillRect(faceX - 300, cy - R, 300, R * 2);
    ctx.fillStyle = C.yellowDk; ctx.fillRect(faceX - 6, cy - R - 8, 40, R * 2 + 16);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = '#3b3a38'; ctx.fillRect(faceX + 34, cy - R + 12 + i * 38, 12, 20); }
    // a person for scale (illustration)
    const ph = (R * 2) / DIAM_FT * 5.6, px = faceX + 110;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, cy + R - ph + 9, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(px - 7, cy + R - ph + 20, 14, ph * 0.45); ctx.fillRect(px - 6, cy + R - ph * 0.45, 5, ph * 0.45); ctx.fillRect(px + 1, cy + R - ph * 0.45, 5, ph * 0.45);
    font(500, 18, CAP); text('a person', px, cy + R + 22, { color: C.soft, align: 'center' });
    // dimension
    A(seg(t, 10.6, 11.2), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      const dx = faceX + 64;
      ctx.beginPath(); ctx.moveTo(dx, cy - R - 8); ctx.lineTo(dx, cy + R + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx - 10, cy - R - 8); ctx.lineTo(dx + 10, cy - R - 8); ctx.moveTo(dx - 10, cy + R + 8); ctx.lineTo(dx + 10, cy + R + 8); ctx.stroke();
      panel(dx + 30, cy - 56, 170, 112, 14);
      font(600, 44); text('28 FT', dx + 115, cy - 22, { color: C.yellow, align: 'center' });
      font(600, 30); text('8 IN', dx + 115, cy + 24, { color: C.yellow, align: 'center' });
    });
    A(seg(t, 11.6, 12.2), () => {
      arrow(faceX - 320, cy - R - 16, 30, cy - R - 16, C.soft, 4, 14);
      font(600, 26); text(`ABOUT ${GANTRY_FT} FT OF GANTRIES BEHIND`, 30, cy - R - 48, { color: C.ink, align: 'left' });
      font(500, 22, CAP); text(`more than ${fmt(TONS)} tons in all`, 30, cy + 110, { color: C.soft, align: 'left' });
    });
  });
}
function discs(t) {
  const a = span(t, 14.2, 18.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a close-up: one disc cutter rolling on the rock face, chips breaking off
    const fx = 560;
    ctx.fillStyle = '#4a403a'; ctx.fillRect(fx, 160, W - fx, 600);
    font(600, 24); text('ROCK FACE', fx + 150, 190, { color: C.soft, align: 'center', spacing: '2px' });
    const y = 260 + ((t - 14.2) * 90) % 380;
    // the cutterhead body behind
    ctx.fillStyle = C.yellow; ctx.fillRect(140, 160, 300, 600);
    ctx.fillStyle = C.yellowDk; ctx.fillRect(420, 160, 40, 600);
    // the disc cutter: a steel wheel on an arm, its edge pressed into the rock
    ctx.fillStyle = C.steel; ctx.fillRect(440, y - 18, 80, 36);
    ctx.save(); ctx.translate(540, y); ctx.rotate((t - 14.2) * 6);
    ctx.fillStyle = '#9aa4aa'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 74, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3b3a38'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -74); ctx.lineTo(0, 74); ctx.stroke();
    ctx.restore();
    // pressure arrows and cracks
    arrow(300, y, 430, y, C.red, 8, 22);
    ctx.strokeStyle = 'rgba(255,230,200,0.45)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const yy = 200 + i * 110; ctx.beginPath(); ctx.moveTo(fx, yy); ctx.lineTo(fx + 30, yy + 14); ctx.lineTo(fx + 22, yy + 34); ctx.stroke(); }
    // chips falling
    for (let i = 0; i < 22; i++) {
      const u = ((t - 14.2) * 0.9 + rnd(i, 9)) % 1;
      const x = fx - 6 - rnd(i, 10) * 70 - u * 20, yy = 200 + rnd(i, 11) * 300 + u * 260;
      ctx.fillStyle = C.chip; ctx.save(); ctx.translate(x, yy); ctx.rotate(rnd(i, 12) * 3); ctx.fillRect(-5, -4, 10, 8); ctx.restore();
    }
    panel(150, 640, 280, 90, 14);
    font(600, 26); text('DISC CUTTER', 290, 668, { color: C.ink, align: 'center' });
    font(500, 20, CAP); text('rolls under huge pressure', 290, 702, { color: C.soft, align: 'center' });
  });
}

// ---------- the long cutaway: shield, jacks, rings, belt ----------
const CY = 440, BR = 150, LIN = 26, RING = 64, SHIELD = 300; // bore radius, lining thickness, ring width (illustration)
/** faceX: where the cutterhead is; rings: how many finished rings, the last one ending at ringEnd; jack: extension. */
function cutaway(t, { faceX, ringEnd, rings = 6, building = 0, jack = 0, spin = 0, belt = 1, forces = 0, labelA = 0 }) {
  // the bore
  ctx.fillStyle = '#141110'; ctx.fillRect(0, CY - BR, faceX, BR * 2);
  // finished rings, top and bottom strips, each with a joint
  for (let i = 0; i < rings; i++) {
    const x1 = ringEnd - i * RING, x0 = x1 - RING;
    if (x1 < 0) break;
    for (const yy of [CY - BR, CY + BR - LIN]) {
      ctx.fillStyle = i % 2 ? C.concrete2 : C.concrete; ctx.fillRect(x0, yy, RING - 3, LIN);
    }
  }
  // the ring being built in the gap: its top and bottom show once segments reach them
  const placed = building > 0 ? Math.floor(building * 6 + 1e-6) : 0;
  if (placed >= 1) { ctx.fillStyle = C.concrete; ctx.fillRect(ringEnd, CY + BR - LIN, RING - 3, LIN); }
  if (placed >= 4) { ctx.fillStyle = C.concrete; ctx.fillRect(ringEnd, CY - BR, RING - 3, LIN); }
  // the shield (steel skin, drawn as outline), the cutterhead
  const sx = faceX - SHIELD;
  ctx.fillStyle = 'rgba(242,182,43,0.18)'; ctx.fillRect(sx, CY - BR - 14, SHIELD, BR * 2 + 28);
  ctx.fillStyle = C.yellow; ctx.fillRect(sx, CY - BR - 14, SHIELD, 14); ctx.fillRect(sx, CY + BR, SHIELD, 14);
  ctx.fillStyle = C.yellowDk; ctx.fillRect(faceX - 30, CY - BR - 10, 34, BR * 2 + 20);
  for (let i = 0; i < 8; i++) { const yy = CY - BR + 8 + ((i * 40 + spin * 60) % (BR * 2 - 20)); ctx.fillStyle = '#3b3a38'; ctx.fillRect(faceX + 2, yy, 10, 18); }
  // bulkhead behind the cutterhead, where the jacks are fixed
  const bx = sx + 150;
  ctx.fillStyle = C.yellowDk; ctx.fillRect(bx, CY - BR, 16, BR * 2);
  // thrust jacks: cylinders on the bulkhead, rods reaching back to the last ring
  const shoe = ringEnd + 2 + (building > 0 ? RING * eio(Math.min(1, building * 5)) : 0);
  for (const yy of [CY - BR + LIN / 2, CY + BR - LIN / 2]) {
    ctx.fillStyle = C.teal; ctx.fillRect(bx - 70, yy - 9, 70, 18);
    ctx.fillStyle = '#9fe3d9'; ctx.fillRect(shoe, yy - 4, bx - 70 - shoe, 8);
    ctx.fillStyle = C.teal; ctx.fillRect(shoe - 2, yy - 13, 8, 26);
  }
  // the conveyor belt with chips riding out
  if (belt > 0) {
    ctx.strokeStyle = '#58636a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(faceX - 40, CY + 30); ctx.lineTo(0, CY + 30); ctx.stroke();
    for (let i = 0; i < 30; i++) {
      const x = faceX - 50 - (((t * 120 + i * 37) % (faceX - 50)));
      ctx.fillStyle = C.chip; ctx.fillRect(x, CY + 18, 9, 8);
    }
  }
  if (forces > 0) A(forces, () => {
    arrow(faceX - 150, CY - 40, faceX + 40, CY - 40, C.red, 9, 26);
    arrow(bx - 80, CY - 80, ringEnd - 50, CY - 80, C.red, 9, 26);
    panel(faceX - 190, 222, 200, 44, 10); font(600, 22); text('PUSH ON ROCK', faceX - 90, 244, { color: C.red, align: 'center' });
    panel(ringEnd - 150, 222, 210, 44, 10); font(600, 22); text('PUSH ON LINING', ringEnd - 45, 244, { color: C.red, align: 'center' });
  });
  if (labelA > 0) A(labelA, () => {
    font(600, 22);
    text('LINING RINGS', Math.max(90, ringEnd - 170), CY + BR + 46, { color: C.concrete, align: 'center' });
    text('THRUST JACKS', bx - 50, CY + BR + 46, { color: C.teal, align: 'center' });
    text('SHIELD', faceX - 70, CY + BR + 46, { color: C.yellow, align: 'center' });
    text('CONVEYOR', 120, CY + 60, { color: C.soft, align: 'center' });
  });
}
function belt(t) {
  const a = span(t, 18.8, 23.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    cutaway(t, { faceX: 700, ringEnd: 380, spin: t, labelA: 1 });
    // a bucket lifting chips at the face
    const u = ((t - 18.8) * 0.7) % 1;
    const by = lerp(CY + BR - 20, CY + 10, u);
    ctx.fillStyle = C.rock0; k.rrect(700 - 22, by - 14, 30, 28, 6); ctx.fill();
    ctx.fillStyle = C.chip; ctx.fillRect(700 - 18, by - 8, 20, 10);
    panel(560, 170, 280, 84, 14);
    font(600, 24); text('BUCKETS TO BELT', 700, 196, { color: C.ink, align: 'center' });
    font(500, 20, CAP); text('chips ride out the back', 700, 230, { color: C.soft, align: 'center' });
  });
}
function erector(t) {
  const a = span(t, 23.4, 28.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a cross-section of the tunnel: a ring of six segments placed one by one
    const cx = W / 2, cy = 450, Ro = 250, Ri = 200, n = 6;
    ctx.fillStyle = '#141110'; ctx.beginPath(); ctx.arc(cx, cy, Ro + 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, Ro + 9, 0, Math.PI * 2); ctx.stroke();
    const done = (t - 23.8) / 0.62;
    for (let i = 0; i < n; i++) {
      const g = clamp(done - i, 0, 1);
      if (g <= 0) continue;
      const a0 = Math.PI / 2 + (i * Math.PI * 2) / n + 0.02, a1 = a0 + (Math.PI * 2) / n - 0.04;
      const pull = (1 - eout(g)) * 120; // carried in from the centre
      const mid = (a0 + a1) / 2;
      ctx.save(); ctx.translate(-Math.cos(mid) * pull, -Math.sin(mid) * pull);
      ctx.fillStyle = i % 2 ? C.concrete2 : C.concrete;
      ctx.beginPath(); ctx.arc(cx, cy, Ro, a0, a1); ctx.arc(cx, cy, Ri, a1, a0, true); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // the erector arm swinging round to the next segment
    const i = clamp(Math.floor(done), 0, n - 1), g = clamp(done - i, 0, 1);
    const mid = Math.PI / 2 + ((i + 0.5) * Math.PI * 2) / n;
    const reach = lerp(80, Ri - 10, eout(g));
    ctx.strokeStyle = C.teal; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(mid) * reach, cy + Math.sin(mid) * reach); ctx.stroke();
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
    font(600, 24); text('ERECTOR ARM', cx, cy + 56, { color: C.teal, align: 'center' });
    font(400, 19, CAP); text('cross-section; segments per ring shown for illustration', cx, 760, { color: C.faint, align: 'center' });
  });
}

// ---------- C: the push-and-build cycle ----------
// Pushes and builds, in scene seconds. Each push moves the machine one ring width.
const PUSHES = [[29.0, 31.4], [37.6, 39.8], [44.6, 46.2]];
const BUILDS = [[32.8, 36.2], [40.2, 43.6]];
function cycle(t) {
  const a = span(t, 28.0, 46.4, 0.5, 0.3);
  if (a <= 0) return;
  A(a, () => {
    let pushed = 0, built = 0, building = 0, pushing = false;
    for (const [p0, p1] of PUSHES) { const g = eio(seg(t, p0, p1)); pushed += g; if (g > 0 && g < 1) pushing = true; }
    for (const [b0, b1] of BUILDS) { const g = seg(t, b0, b1); if (g >= 1) built += 1; else if (g > 0) building = g; }
    const faceX = 560 + pushed * RING, ringEnd = 240 + built * RING;
    cutaway(t, { faceX, ringEnd, rings: 7 + built, building, spin: pushing ? t * 3 : 0, belt: pushing ? 1 : 0.5, forces: pushing ? 1 : 0, labelA: span(t, 28.4, 32.4, 0.4, 0.4) });
    // status
    const status = pushing ? 'MINING: JACKS PUSH' : building > 0 ? `BUILDING A RING: ${Math.floor(building * 6 + 1e-6)} OF 6 SEGMENTS` : 'READY';
    panel(W / 2 - 290, 150, 480, 60, 14);
    font(600, 28); text(status, W / 2 - 50, 180, { color: pushing ? C.red : building > 0 ? C.concrete : C.teal, align: 'center', spacing: '1px' });
    A(span(t, 32.6, 37.0, 0.4, 0.4), () => {
      font(500, 22, CAP); text('new ring goes in the gap', ringEnd + RING / 2, CY + BR + 46, { color: C.concrete, align: 'center' });
      arrow(ringEnd + RING / 2, CY + BR + 28, ringEnd + RING / 2, CY + BR + 4, C.concrete, 3, 10);
    });
    // a small cross-section: the segments of the ring being built
    const ix = 770, iy = 212, ro = 52, ri = 40;
    ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(ix, iy, ro + 12, 0, Math.PI * 2); ctx.fill();
    const placed = building > 0 ? Math.floor(building * 6 + 1e-6) : 0;
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI / 2 + (i * Math.PI * 2) / 6 + 0.04, a1 = a0 + (Math.PI * 2) / 6 - 0.08;
      ctx.fillStyle = i < placed ? C.concrete : 'rgba(244,239,230,0.10)';
      ctx.beginPath(); ctx.arc(ix, iy, ro, a0, a1); ctx.arc(ix, iy, ri, a1, a0, true); ctx.closePath(); ctx.fill();
    }
    // ring counter
    font(500, 22, CAP); text(`rings built while you watch: ${built}`, W / 2, 740, { color: C.soft, align: 'center' });
  });
}

// ---------- D: the numbers ----------
function perDay(t) {
  const a = span(t, 46.4, 51.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a day's progress next to the bore's width, both to the same scale
    const px = 10.5, cy = 430, d = DIAM_FT * px, len = PER_DAY_FT * px * eio(seg(t, 46.8, 48.4));
    // the tunnel face on
    ctx.fillStyle = '#141110'; ctx.beginPath(); ctx.arc(200, cy, d / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.concrete; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(200, cy, d / 2 - 6, 0, Math.PI * 2); ctx.stroke();
    font(600, 30); text('28 FT 8 IN', 200, cy + d / 2 + 40, { color: C.ink, align: 'center' });
    font(500, 21, CAP); text('across', 200, cy + d / 2 + 72, { color: C.soft, align: 'center' });
    // one day's tunnel, side on, to the same scale
    const x0 = 420;
    ctx.fillStyle = '#141110'; ctx.fillRect(x0, cy - d / 2, len, d);
    ctx.fillStyle = C.concrete; ctx.fillRect(x0, cy - d / 2, len, 14); ctx.fillRect(x0, cy + d / 2 - 14, len, 14);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.strokeRect(x0, cy - d / 2, len, d);
    A(seg(t, 48.2, 48.6), () => {
      font(600, 30); text(`${PER_DAY_FT} FT`, x0 + len / 2, cy + d / 2 + 40, { color: C.yellow, align: 'center' });
      font(500, 21, CAP); text('dug and lined in a day', x0 + len / 2, cy + d / 2 + 72, { color: C.soft, align: 'center' });
    });
    font(400, 19, CAP); text('face on and side on, same scale', W / 2, 200, { color: C.faint, align: 'center' });
  });
}
function volume(t) {
  const a = span(t, 51.0, 55.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the day's slice of rock as a cylinder in perspective, filling with chips
    const cx = 300, cy = 440, rx = 70, ry = 158, len = 330 * eio(seg(t, 51.3, 52.6));
    ctx.fillStyle = '#5a4b40'; ctx.fillRect(cx, cy - ry, len, ry * 2);
    ctx.fillStyle = '#6b594b'; ctx.beginPath(); ctx.ellipse(cx + len, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3e35'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 40; i++) { const u = rnd(i, 21), v = rnd(i, 22) * 2 - 1; ctx.fillStyle = C.chip; ctx.fillRect(cx + u * len, cy + v * ry * 0.85, 7, 6); }
    A(seg(t, 52.6, 53.2), () => {
      panel(470, 190, 330, 128, 16);
      font(600, 50); text(`≈ ${fmt(round(DAY_M3, 10))} m³`, 635, 236, { color: C.yellow, align: 'center' });
      font(500, 22, CAP); text(`about ${fmt(round(DAY_FT3, 100))} cubic feet`, 635, 284, { color: C.soft, align: 'center' });
    });
    font(400, 19, CAP); text(`π × (${(DIAM_FT / 2).toFixed(2)} ft)² × ${PER_DAY_FT} ft, from the cutterhead’s size`, W / 2, 680, { color: C.faint, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    route(t, { from: 5.0, to: 9.6, second: seg(t, 6.6, 7.2), progress: 0.06 });
    size(t);
    discs(t);
    belt(t);
    erector(t);
    cycle(t);
    perDay(t);
    volume(t);
    route(t, { from: 55.6, to: 60.2, second: 1, progress: 0.06 + 0.94 * eio(seg(t, 56.0, 59.0)), twin: seg(t, 57.6, 58.2) });
    route(t, { from: 60.2, to: 66, second: 1, progress: 1, twin: 0, river: eio(seg(t, 60.8, 62.6)) });
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.yellow, '~': C.teal, '^': '#7fb8d8' } });
  },
});
