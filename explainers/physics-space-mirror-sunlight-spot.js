// Explainer for physics-space-mirror-sunlight-spot: on 26 October 2026 the Guardian reported a night-lighting
// demonstration in California by Reflect Orbital, a US startup that plans mirror satellites to send sunlight to the
// ground at night. The physics that sets what one mirror can do: the Sun is a disc about 0.53° wide, so the lit
// patch is an image of the Sun, about 6 km wide from 645 km whatever the mirror's size, and its brightness is the
// share of the Sun's disc the mirror covers in the sky. Look: a desert night in indigo, sunlight in warm gold, the
// mirror in silver-blue, a pale Moon. Oswald (condensed gothic) for titles and big numbers, Space Grotesk for
// captions and labels.
//
// Facts: The Guardian, "Sunlight at night: US startup's demonstration of lighting Earth from space draws criticism"
// (Oliver Milman, 26 October 2026): a night-time light demonstration near the town of Lone Pine, in the Sierra
// Nevada region of California, earlier this month, by the startup Reflect Orbital, which aims to launch 50,000
// satellites in the next decade to light parts of the world at night; large mobile lights were set up near Mount
// Whitney to simulate it; in July the Federal Communications Commission approved an initial demonstration satellite
// for next year, with a 59 ft (18 m) diameter mirror; the satellites would orbit at about 400 miles (645 km);
// in August four groups represented by Earthjustice asked the FCC to reconsider; concerns about the night sky,
// wildlife, light pollution and people's circadian rhythms; the company says it has discussed its plans with
// scientists so that astronomical sites, national parks and wildlife-rich areas are avoided.
// NASA NSSDC Sun fact sheet: apparent diameter at 1 AU 1,919 seconds of arc (0.533°); visual magnitude -26.74.
// NASA NSSDC Moon fact sheet: apparent visual magnitude of the full Moon -12.74.
//
// Computed here: spot width = 2 × 645 km × tan(0.533° / 2) = 6.0 km, for the satellite straight overhead (farther
// away at a slant, the patch is bigger and dimmer); mirror area π × 9 m² ≈ 254 m²; patch area ≈ 28 km²; the patch
// gets 254 m² / 28.3 km² ≈ 1/111,000 of full sunlight, at best (no losses); the full Moon is 10^(0.4 × 14) ≈
// 400,000 times fainter than the Sun, so the patch is about 3.6 times as bright as full moonlight; matching noon sun
// would take about 111,000 such mirrors aimed at one patch. The same limit holds for curved mirrors: seen from the
// ground a mirror can at best shine with the Sun's own surface brightness, so the light it sends is the share of the
// Sun's disc it covers. Angles in the ray diagrams are exaggerated; the desert scene is illustrative.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  The news; the plan; the first satellite's 18 m mirror at 645 km.
//  B  9.6–28.0  A point Sun vs a disc; the beam spreads 0.53°; a 6 km patch; sun-flecks under a tree.
//  C 28.0–41.6  Sharing the light: 254 m² over 28 km²; 1/111,000 of sunlight; about 3.6 full Moons.
//  D 41.6–51.0  Why a curved mirror can't beat it: the share of the Sun's disc.
//  E 51.0–64.8  111,000 mirrors for noon; 50,000 planned; the debate.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#06081a', bg1: '#141a3a', ink: '#f3f1ea', soft: 'rgba(243,241,234,0.76)', faint: 'rgba(243,241,234,0.3)',
  sun: '#ffd37a', sunHot: '#fff1c4', mirror: '#cfe3ff', ground: '#2e2230', ridge: '#1c1830', moon: '#dfe6f0',
  teal: '#59d3c7', coral: '#ff7a6b', panel: 'rgba(8,10,28,0.9)',
};
const BIG = 'Oswald', SANS = 'Space Grotesk';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2, R = Math.PI / 180;

// ---------- the numbers ----------
const SUN_DEG = 1919 / 3600; // 0.533°
const HEIGHT_KM = 645, MIRROR_M = 59 * 0.3048; // 18 m
const SPOT_KM = 2 * HEIGHT_KM * Math.tan((SUN_DEG / 2) * R); // 6.0 km
const MIRROR_M2 = Math.PI * (MIRROR_M / 2) ** 2; // 254 m²
const SPOT_KM2 = Math.PI * (SPOT_KM / 2) ** 2; // 28 km²
const SHARE = MIRROR_M2 / (SPOT_KM2 * 1e6); // 9e-6
const ONE_IN = Math.round(1 / SHARE / 1000) * 1000; // 111,000
const MOON = 10 ** (0.4 * (26.74 - 12.74)); // 400,000
const MOONS = SHARE * MOON; // 3.6
const fmt = (n) => n.toLocaleString('en-US');

const CUES = [
  [0.4, 4.8, 'On *26 October 2026* the Guardian reported a test in California by *Reflect Orbital*, a US startup.'],
  [5.0, 9.4, `Its plan: mirrors in orbit sending sunlight down at night. The first approved one has an *${Math.round(MIRROR_M)} m* mirror.`],
  [9.6, 14.0, `From about *${HEIGHT_KM} km* up, how small a patch of ground can one such mirror light up?`],
  [14.2, 18.6, `If the Sun were a point, the beam could stay ${Math.round(MIRROR_M)} m wide. But the Sun is a ~disc~ about *${SUN_DEG.toFixed(2)}°* across.`],
  [18.8, 23.2, `Light from opposite edges of the Sun strikes at slightly different angles, so the beam spreads by ${SUN_DEG.toFixed(2)}°.`],
  [23.4, 27.8, `So the lit patch is an image of the Sun: from ${HEIGHT_KM} km overhead, about *${Math.round(SPOT_KM)} km* wide, whatever the mirror.`],
  [28.0, 32.4, 'It’s like the sunny spots under a leafy tree: each is a round image of the Sun, made by a gap in the leaves.'],
  [32.6, 37.0, `Now share out the light: *${Math.round(MIRROR_M2)} m²* of sunlight on the mirror spreads over about *${Math.round(SPOT_KM2)} km²* of ground.`],
  [37.2, 41.6, `That leaves about *1/${fmt(ONE_IN)}* of full sunlight. A full Moon is about ${fmt(Math.round(MOON / 1e5) * 1e5)} times dimmer than the Sun.`],
  [41.8, 46.2, `So one mirror lights its patch like about ^${MOONS.toFixed(1)} full Moons^, at best, and less when it is not overhead.`],
  [46.4, 50.8, 'A curved mirror can’t beat it. From the ground, any mirror at best looks like a bit of the Sun’s surface.'],
  [51.0, 55.4, 'Your light is set by how much of the Sun’s disc the mirror covers in your sky: from 645 km, very little.'],
  [55.6, 60.0, `Noon sunlight on one patch would take about *${fmt(ONE_IN)}* such mirrors at once. The firm aims for 50,000.`],
  [60.2, 64.6, 'Critics fear for dark skies, wildlife and sleep; the company says it will steer clear of sensitive places.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(0.7, C.bg0); lg.addColorStop(1, '#03040c');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 220; i++) {
    const x = r() * W, y = r() * 760, a = 0.15 + r() * 0.6;
    g.fillStyle = `rgba(240,240,255,${a})`; g.beginPath(); g.arc(x, y, r() < 0.08 ? 1.6 : 0.9, 0, TAU); g.fill();
  }
}

// ---------- pieces ----------
function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }
function sunDisc(x, y, r, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.4);
    g.addColorStop(0, 'rgba(255,241,196,0.9)'); g.addColorStop(0.45, 'rgba(255,211,122,0.3)'); g.addColorStop(1, 'rgba(255,211,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill();
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  });
}
function satellite(x, y, s = 1, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  ctx.fillStyle = '#8a93a8'; ctx.fillRect(-8, -8, 16, 16);
  ctx.fillStyle = C.mirror; ctx.beginPath(); ctx.ellipse(0, 18, 36, 7, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 18, 36, 7, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
function desert(ground = 640) {
  ctx.fillStyle = C.ridge; ctx.beginPath(); ctx.moveTo(0, ground);
  for (let x = 0; x <= W; x += 16) ctx.lineTo(x, ground - 120 - 70 * Math.max(0, Math.sin(x / 90)) * Math.abs(Math.cos(x / 37)) - 40 * Math.sin(x / 210));
  ctx.lineTo(W, ground); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.ground; ctx.fillRect(0, ground, W, 130);
}

// ---------- A: the news ----------
function sceneA(t) {
  const a = span(t, 0, 9.6, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    desert(660);
    font(700, 64, BIG); text('Sunlight at night?', 52, 104, { color: C.sun });
    font(500, 21); text('REFLECT ORBITAL · LONE PINE, CALIFORNIA · OCTOBER 2026', 54, 152, { color: C.teal, spacing: '1px' });
    const p = seg(t, 0.4, 9.4), sx = lerp(120, 740, p), sy = 260 - 40 * Math.sin(p * Math.PI);
    // an illustrative beam to the ground
    A(seg(t, 1.0, 1.6), () => {
      const g = ctx.createLinearGradient(sx, sy, sx, 680);
      g.addColorStop(0, 'rgba(255,241,196,0.65)'); g.addColorStop(1, 'rgba(255,211,122,0.12)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 4, sy + 20); ctx.lineTo(sx + 4, sy + 20); ctx.lineTo(sx + 70, 690); ctx.lineTo(sx - 70, 690); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,233,168,0.45)'; ctx.beginPath(); ctx.ellipse(sx, 692, 74, 12, 0, 0, TAU); ctx.fill();
    });
    satellite(sx, sy, 1.3);
    font(400, 22); text('illustrative', W - 52, 740, { color: C.faint, align: 'right' });
    A(seg(t, 5.2, 5.8), () => {
      chip(52, 200, 330, 110, () => {
        font(400, 22); text('first satellite, approved', 72, 228, { color: C.soft });
        font(700, 40, BIG); text(`${Math.round(MIRROR_M)} m mirror`, 72, 274, { color: C.mirror });
      });
      chip(52, 324, 330, 74, () => { font(600, 26); text(`~${HEIGHT_KM} km up`, 72, 362, { color: C.ink }); });
    });
  });
}

// ---------- B: point Sun vs disc ----------
const MX = 432, MY = 250, GY = 640; // the mirror and the ground in the side view
function sceneB(t) {
  const a = span(t, 9.6, 28.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.ground; ctx.fillRect(0, GY, W, 110);
    font(400, 22); text('side view · not to scale · angles exaggerated', W / 2, GY + 70, { color: C.faint, align: 'center' });
    // the mirror
    ctx.strokeStyle = C.mirror; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(MX - 34, MY - 12); ctx.lineTo(MX + 34, MY + 12); ctx.stroke();
    ctx.fillStyle = '#8a93a8'; ctx.fillRect(MX - 7, MY - 30, 14, 14);
    // height
    ctx.strokeStyle = C.faint; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, MY); ctx.lineTo(120, GY); ctx.stroke(); ctx.setLineDash([]);
    font(700, 30, BIG); text(`${HEIGHT_KM} km`, 136, (MY + GY) / 2, { color: C.ink });
    const disc = t >= 14.6 ? eio(seg(t, 14.6, 16.0)) : 0; // 0 = a point Sun, 1 = a disc
    const spread = t >= 18.8 ? eio(seg(t, 19.2, 21.2)) : 0;
    const half = lerp(0, 20, spread) * R; // the beam's half-angle, hugely exaggerated (really 0.27°)
    // incoming light from the upper left
    const sunX = 70, sunY = 120;
    sunDisc(sunX, sunY, lerp(8, 44, disc));
    const inRays = disc > 0 ? [-1, 0, 1] : [0];
    for (const e of inRays) {
      const ox = sunX + e * 30 * disc, oy = sunY - e * 30 * disc;
      ctx.strokeStyle = e === 0 ? 'rgba(255,211,122,0.8)' : e < 0 ? 'rgba(255,241,196,0.8)' : 'rgba(255,170,90,0.8)';
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(MX, MY); ctx.stroke();
    }
    // the reflected beam down to the ground
    const wBeam = lerp(18, 18, 0), dx = Math.tan(half) * (GY - MY);
    const g = ctx.createLinearGradient(MX, MY, MX, GY);
    g.addColorStop(0, 'rgba(255,241,196,0.7)'); g.addColorStop(1, 'rgba(255,211,122,0.25)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(MX - 6, MY); ctx.lineTo(MX + 6, MY); ctx.lineTo(MX + 6 + dx, GY); ctx.lineTo(MX - 6 - dx, GY); ctx.closePath(); ctx.fill();
    if (spread > 0) {
      ctx.strokeStyle = 'rgba(255,241,196,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(MX, MY); ctx.lineTo(MX - 6 - dx, GY); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,170,90,0.9)';
      ctx.beginPath(); ctx.moveTo(MX, MY); ctx.lineTo(MX + 6 + dx, GY); ctx.stroke();
      font(600, 24); text(`${SUN_DEG.toFixed(2)}°`, MX + 22, MY + 70, { color: C.sun });
    }
    ctx.fillStyle = 'rgba(255,233,168,0.7)'; ctx.beginPath(); ctx.ellipse(MX, GY, 8 + dx, 7, 0, 0, TAU); ctx.fill();
    // labels
    A(span(t, 9.6, 14.2, 0.4, 0.3), () => { font(700, 32, BIG); text('how wide is the patch?', MX + 160, GY - 40, { color: C.sunHot, align: 'center' }); });
    A(span(t, 14.2, 18.8, 0.3, 0.3), () => {
      font(600, 24); text(disc < 0.5 ? `a point Sun: a ${Math.round(MIRROR_M)} m beam` : 'but the Sun is a disc', MX + 150, GY - 40, { color: C.sunHot, align: 'center' });
    });
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      chip(580, 300, 250, 150, () => {
        font(700, 64, BIG); text(`${Math.round(SPOT_KM)} km`, 705, 354, { color: C.sun, align: 'center' });
        font(400, 22); text('wide, from overhead', 705, 410, { color: C.soft, align: 'center' });
      });
      // the same patch for a small and a big mirror
      font(400, 22); text('any mirror size: about the same patch', MX, GY - 30, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- B2: sun-flecks under a tree ----------
function sceneB2(t) {
  const a = span(t, 28.0, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const gy = 640;
    ctx.fillStyle = '#1d2a1e'; ctx.fillRect(0, gy, W, 110);
    // a canopy with gaps
    ctx.fillStyle = '#1f3d26';
    for (let i = 0; i < 26; i++) { const x = 90 + (i % 13) * 56, y = 210 + Math.floor(i / 13) * 60 + 18 * Math.sin(i); ctx.beginPath(); ctx.arc(x, y, 52, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(410, 280, 44, gy - 280);
    // sunbeams through gaps and round spots on the ground
    const gaps = [180, 330, 560, 700];
    gaps.forEach((x, i) => {
      ctx.fillStyle = 'rgba(255,233,168,0.10)';
      ctx.beginPath(); ctx.moveTo(x - 3, 260); ctx.lineTo(x + 3, 260); ctx.lineTo(x + 30 + 26, gy); ctx.lineTo(x + 30 - 26, gy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,233,168,0.85)'; ctx.beginPath(); ctx.ellipse(x + 30, gy + 24, 30, 10, 0, 0, TAU); ctx.fill();
    });
    sunDisc(90, 150, 26);
    font(600, 24); text('round spots: images of the Sun', W / 2, gy + 70, { color: C.sunHot, align: 'center' });
  });
}

// ---------- C: sharing out the light ----------
function sceneC(t) {
  const a = span(t, 32.6, 46.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 32.6, 37.2, 0.01, 0.4), () => {
      // the patch to scale with the mirror
      const r = 230, cx = 432, cy = 430, mr = r * (MIRROR_M / (SPOT_KM * 1000));
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
      g.addColorStop(0, 'rgba(255,233,168,0.35)'); g.addColorStop(1, 'rgba(255,233,168,0.12)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.sun; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = C.mirror; ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.5, mr), 0, TAU); ctx.fill();
      ctx.strokeStyle = C.mirror; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, TAU); ctx.stroke();
      font(600, 24); text(`mirror: ${Math.round(MIRROR_M2)} m² (the dot)`, cx + 24, cy - 30, { color: C.mirror });
      font(600, 24); text(`patch: ${Math.round(SPOT_KM2)} km²`, cx, cy + r + 34, { color: C.sun, align: 'center' });
      font(400, 22); text('to scale, seen from above', 52, 160, { color: C.soft });
    });
    A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
      // a brightness ladder, on a log scale: full Moon, the patch, noon Sun
      const x0 = 120, x1 = 760, y = 470, L = (v) => lerp(x0, x1, Math.log10(v) / Math.log10(MOON * 1.2));
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let d = 0; d <= 5; d++) { const x = L(10 ** d); ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke(); font(400, 22); text(fmt(10 ** d), x, y + 34, { color: C.faint, align: 'center' }); }
      font(400, 22); text('brightness in full Moons (each step ×10)', W / 2, y + 80, { color: C.soft, align: 'center' });
      const mark = (v, label, col, lift = 50, align = 'center') => {
        const x = L(v);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
        if (lift > 60) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y - lift + 16); ctx.stroke(); }
        font(700, 26, BIG); text(label, x, y - lift, { color: col, align });
      };
      mark(1, 'full Moon', C.moon, 50, 'left');
      mark(MOON, 'noon Sun', C.sun);
      A(seg(t, 41.8, 42.4), () => mark(MOONS, `the patch, about ${MOONS.toFixed(1)}`, C.teal, 110, 'left'));
      A(seg(t, 37.4, 38.0), () => {
        chip(232, 220, 400, 96, () => {
          font(700, 44, BIG); text(`1/${fmt(ONE_IN)}`, W / 2, 256, { color: C.teal, align: 'center' });
          font(400, 22); text('of full sunlight, at best', W / 2, 294, { color: C.soft, align: 'center' });
        });
      });
    });
  });
}

// ---------- D: a curved mirror can't beat it ----------
function sceneD(t) {
  const a = span(t, 46.2, 55.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the Sun's disc as seen in the sky, and the mirror's share of it
    const cx = 300, cy = 420, r = 200;
    sunDisc(cx, cy, r);
    font(600, 24); text(`the Sun’s disc, ${SUN_DEG.toFixed(2)}° wide`, cx, cy + r + 40, { color: C.sun, align: 'center' });
    const share = (MIRROR_M / 1000 / HEIGHT_KM) / (SUN_DEG * R); // the mirror's width as a share of the Sun's
    // a zoom box
    const zx = 640, zy = 420, zr = 120;
    ctx.strokeStyle = C.mirror; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + 10, cy - 4); ctx.lineTo(zx - zr, zy - 30); ctx.moveTo(cx + 10, cy + 4); ctx.lineTo(zx - zr, zy + 30); ctx.stroke();
    ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(zx, zy, zr, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.mirror; ctx.beginPath(); ctx.arc(zx, zy, zr, 0, TAU); ctx.stroke();
    // inside the zoom: the mirror is a speck that shines like the Sun's surface
    ctx.fillStyle = C.sunHot; ctx.beginPath(); ctx.arc(zx, zy, 10, 0, TAU); ctx.fill();
    font(400, 22); text('zoomed in', zx, zy - zr - 22, { color: C.soft, align: 'center' });
    A(seg(t, 51.0, 51.6), () => {
      chip(500, 580, 320, 110, () => {
        font(700, 34, BIG); text(`1/${fmt(Math.round(1 / share))} as wide`, 660, 618, { color: C.mirror, align: 'center' });
        font(400, 22); text('the mirror, from 645 km', 660, 660, { color: C.soft, align: 'center' });
      });
    });
    ctx.fillStyle = C.mirror; ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, TAU); ctx.fill();
  });
}

// ---------- E: how many, and the debate ----------
function sceneE(t) {
  const a = span(t, 55.4, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 55.4, 60.2, 0.01, 0.4), () => {
      // one dot per 100 mirrors: 1,110 dots for noon sunlight, 500 for the plan
      const per = 100, n = Math.round(ONE_IN / per), plan = 50000 / per, cols = 45, s = 15, x0 = W / 2 - (cols * s) / 2, y0 = 210;
      const p = seg(t, 55.8, 58.4);
      for (let i = 0; i < n; i++) {
        if (i / n > p) break;
        ctx.fillStyle = i < plan ? C.teal : 'rgba(255,211,122,0.55)';
        ctx.beginPath(); ctx.arc(x0 + (i % cols) * s + s / 2, y0 + Math.floor(i / cols) * s, 5, 0, TAU); ctx.fill();
      }
      font(400, 22); text(`one dot = ${per} mirrors`, 52, 170, { color: C.soft });
      font(600, 26); text('50,000 planned', 52, 640, { color: C.teal });
      text(`${fmt(ONE_IN)} for noon sun on one patch`, 52, 680, { color: C.sun });
    });
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      desert(660);
      chip(52, 200, 360, 200, () => {
        font(700, 30, BIG); text('critics', 72, 236, { color: C.coral });
        font(400, 24); ['dark skies', 'wildlife', 'sleep'].forEach((s, i) => text(s, 72, 280 + i * 38, { color: C.ink }));
      });
      chip(452, 200, 360, 200, () => {
        font(700, 30, BIG); text('the company', 472, 236, { color: C.teal });
        font(400, 24); ['avoid astronomy sites,', 'national parks and', 'wildlife-rich areas'].forEach((s, i) => text(s, 472, 280 + i * 38, { color: C.ink }));
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [BIG, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneB2(t); sceneC(t); sceneD(t); sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.sun, '~': C.sunHot, '^': C.teal } });
  },
});
