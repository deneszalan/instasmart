// Explainer for space-swift-solar-drag-reentry: on 23 October 2026 NASA ended the Swift observatory's mission,
// after air drag, made stronger by an active Sun, pulled it down from about 600 km to 275 km. Look: a side
// view of Earth's curved limb under a night sky, the upper air as glowing bands, the Sun as a hot orange glow
// on the left, and Swift as a small white telescope. Space Mono for numbers and labels, Space Grotesk for
// captions.
//
// Facts: NASA, "NASA's Swift Mission Ends, Leaves Behind Scientific Bonanza" (23 October 2026): science ended
// as Swift orbits less than 171 miles (275 km) up, where drag stops it gazing steadily; last observation on
// 20 October; re-entry expected in the next few weeks; launched 20 November 2004; designed for two years;
// more than 2,000 gamma-ray bursts, more than 1,400 supernovae, about 7,000 papers. NASA Swift blog (23
// October 2026): recent solar activity increased drag and Swift began to sink rapidly; on 20 October it reached
// 275 km, entered safe mode, and the Penn State team ended operations. NASA, "NASA Highlights Lessons Learned
// from Swift Boost Mission" (2026): without propulsion, drag lowers satellites; increased solar activity
// magnified it; Katalyst's LINK launched in July 2026 on a Pegasus XL, had orientation problems, and the boost
// was called off; point of no return about 300 km; from mid-February to late August 2026 Swift was pointed to
// minimise drag instead of doing pointed science. NASA fact sheet: a 600 km circular orbit. NOAA Space Weather
// Prediction Center, "Satellite Drag": when the Sun adds energy, low-density layers at LEO heights rise and are
// replaced by denser layers from below; satellites boost about four times a year when the Sun is quiet and
// every 2–3 weeks at the peak of the 11-year cycle. UCAR Center for Science Education, "The Thermosphere":
// heated by the Sun's X-rays and ultraviolet; roughly 500 °C hotter when the Sun is very active; it puffs up.
// NOAA SWPC (16 October 2024): NASA and NOAA announced on 15 October 2024 that the Sun was in solar maximum.
//
// Computed here: circular orbit speeds √(GM/r) with GM = 398,600 km³/s² and R = 6,371 km (NASA): 7.56 km/s
// at 600 km, 7.74 km/s at 275 km; one orbit 96.5 and 89.9 minutes. The air bands, the iso-density lines and
// the decay curve are schematic: no densities are shown as numbers.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: Swift shut down; 600 km in 2004, 275 km on 20 October 2026.
//  B  9.4–23.2  Drag: a trace of air at 7.6 km/s; each orbit a little lower; lower is faster.
//  C 23.2–46.2  The Sun: X-rays and UV heat the upper air by ~500 °C, it swells; denser layers rise; boosts
//               every 2–3 weeks; solar maximum in 2024.
//  D 46.2–55.4  The runaway; pointing to cut drag; the failed boost.
//  E 55.4–64.8  Over 2,000 gamma-ray bursts; re-entry within weeks.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#04060f', sky1: '#0a1226', ink: '#eef3ff', soft: 'rgba(238,243,255,0.72)', faint: 'rgba(238,243,255,0.28)',
  sun: '#ff9f43', sunHot: '#ffd29a', cyan: '#4fd1e8', rose: '#ff5d8f', air: '#4fd1e8', earth: '#0d2a4a', land: '#16466e',
  panel: 'rgba(4,8,20,0.78)', white: '#ffffff', grb: '#c9a7ff',
};
const NUM = 'Space Mono', CAP = 'Space Grotesk';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- numbers ----------
const MU = 398600, R_E = 6371;
const vAt = (h) => Math.sqrt(MU / (R_E + h)); // km/s
const periodAt = (h) => (2 * Math.PI * Math.sqrt((R_E + h) ** 3 / MU)) / 60; // minutes
const H0 = 600, H_END = 275, H_POINT = 300;
const fmt2 = (x) => x.toFixed(2);

// ---------- the side view: height to screen ----------
const GROUND = 740, PXKM = 0.86; // y of Earth's surface (km 0) under the satellite; px per km
const Y = (h) => GROUND - h * PXKM;
// Earth's limb: a big circle whose top is at GROUND
const LIMB = { x: W / 2, r: 2600 };

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 23 October 2026, the US space agency NASA shut down its *Swift* space telescope.'],
  [5.0, 9.4, `Swift was launched in 2004 to about *${H0} km* up. By 20 October it had sunk to *${H_END} km*.`],
  [9.6, 14.0, `Even up there a trace of air remains, and Swift was ploughing through it at *${vAt(H0).toFixed(1)} km/s*.`],
  [14.2, 18.6, 'That ~drag~ steals a little energy on every orbit, so the telescope sinks lower and lower.'],
  [18.8, 23.2, 'Oddly, sinking makes it *faster*: a lower orbit is quicker, and the fall turns height into speed.'],
  [23.4, 27.8, 'How fast it sinks depends on the *Sun*. Its X-rays and ultraviolet light heat the upper air.'],
  [28.0, 32.4, 'When the Sun is very active, that air gets about *500 °C hotter*, and it swells upwards.'],
  [32.6, 37.0, 'Denser air rises to the height where satellites fly, and the ~drag~ on them grows.'],
  [37.2, 41.6, 'A satellite boosted *4 times a year* when the Sun is quiet may need it every *2–3 weeks* at its peak.'],
  [41.8, 46.2, 'In 2024 the Sun entered the peak of its *11-year cycle*, and Swift began to sink fast.'],
  [46.4, 50.8, 'And it runs away: lower down the air is denser, so the drag grows and the fall speeds up.'],
  [51.0, 55.4, 'Its team aimed it to cut drag and paused its science for months, but a robot sent to boost it failed.'],
  [55.6, 60.0, 'In its 22 years Swift caught over *2,000 gamma-ray bursts*, the most powerful explosions known.'],
  [60.2, 64.6, 'Now it is expected to fall into the atmosphere within weeks, pulled down by the air it flew through.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  let s = 23; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky0); lg.addColorStop(0.7, C.sky1); lg.addColorStop(1, C.sky0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 380; i++) { const a = r(); g.fillStyle = `rgba(230,238,255,${0.1 + a * 0.5})`; g.beginPath(); g.arc(r() * W, r() * 640, 0.4 + a * 1.1, 0, Math.PI * 2); g.fill(); }
}

// the upper air: bands whose brightness falls with height; `lift` (0–1) swells them upwards
function air(lift, a = 1) {
  A(a, () => {
    const top = Y(700 + 180 * lift);
    const g = ctx.createLinearGradient(0, GROUND, 0, top);
    g.addColorStop(0, `rgba(79,209,232,${0.55})`);
    g.addColorStop(0.25, `rgba(79,209,232,${0.22 + 0.1 * lift})`);
    g.addColorStop(0.6, `rgba(120,140,255,${0.08 + 0.08 * lift})`);
    g.addColorStop(1, 'rgba(120,140,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(LIMB.x, GROUND + LIMB.r, LIMB.r + (GROUND - top), Math.PI, 0); ctx.closePath(); ctx.fill();
  });
}
function earth() {
  ctx.fillStyle = C.earth;
  ctx.beginPath(); ctx.arc(LIMB.x, GROUND + LIMB.r, LIMB.r, Math.PI, 0); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(0, GROUND - 10, 0, GROUND + 40);
  g.addColorStop(0, 'rgba(120,200,255,0.9)'); g.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(LIMB.x, GROUND + LIMB.r, LIMB.r + 4, Math.PI, 0); ctx.arc(LIMB.x, GROUND + LIMB.r, LIMB.r - 40, 0, Math.PI, true); ctx.fill();
}
// iso-density lines: the heights where the air has the same (illustrative) density, quiet vs active Sun
const ISO_QUIET = [260, 360, 460, 560], ISO_ACTIVE = [330, 450, 570, 690];
function isoLines(lift, a, labelIt) {
  A(a, () => {
    ISO_QUIET.forEach((h0, i) => {
      const h = lerp(h0, ISO_ACTIVE[i], lift), y = Y(h);
      ctx.strokeStyle = `rgba(79,209,232,${0.75 - i * 0.14})`; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(190, y); ctx.lineTo(W - 30, y); ctx.stroke(); ctx.setLineDash([]);
    });
    if (labelIt) { font(400, 22); text('lines of equal air density', W - 30, Y(lerp(ISO_QUIET[0], ISO_ACTIVE[0], lift)) + 22, { color: C.cyan, align: 'right', base: 'middle' }); }
  });
}

// the height scale on the left
function scale(a) {
  A(a, () => {
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(120, Y(0)); ctx.lineTo(120, Y(650)); ctx.stroke();
    font(400, 22);
    for (let h = 100; h <= 600; h += 100) {
      const y = Y(h);
      ctx.beginPath(); ctx.moveTo(112, y); ctx.lineTo(128, y); ctx.stroke();
      text(`${h}`, 102, y, { color: C.soft, align: 'right', base: 'middle' });
    }
    text('km', 102, Y(650), { color: C.soft, align: 'right', base: 'middle' });
  });
}

function swift(x, y, s = 1, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) {
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 60);
    g.addColorStop(0, `rgba(255,160,80,${0.8 * glow})`); g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#2d4f8a'; ctx.fillRect(-46, -8, 26, 16); ctx.fillRect(20, -8, 26, 16);
  ctx.strokeStyle = 'rgba(170,200,255,0.8)'; ctx.lineWidth = 1; ctx.strokeRect(-46, -8, 26, 16); ctx.strokeRect(20, -8, 26, 16);
  ctx.fillStyle = '#e8edf5'; ctx.fillRect(-18, -14, 36, 28);
  ctx.fillStyle = '#c9a35a'; ctx.fillRect(-18, -14, 36, 6);
  ctx.fillStyle = '#9aa7ba'; ctx.beginPath(); ctx.arc(0, -18, 7, Math.PI, 0); ctx.fill();
  ctx.restore();
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

// ---------- A + B ----------
// Swift's height through the opening: 600 km, then a drop to 275 km
const hA = (t) => lerp(H0, H_END, eio(seg(t, 5.6, 8.8)));
function sceneSide(t) {
  const a = 1 - seg(t, 54.8, 55.6);
  if (a <= 0) return;
  A(a, () => {
    const lift = t < 28 ? 0 : t < 32.6 ? eio(seg(t, 28.6, 31.6)) : 1;
    air(lift, 1);
    earth();
    scale(span(t, 0.6, 37.6, 0.6, 0.5));
    // A: title and the drop
    A(span(t, 0.3, 9.4, 0.5, 0.5), () => {
      font(700, 26); text('NASA · SWIFT · 2004–2026', 52, 94, { color: C.sun, base: 'middle', spacing: '2px' });
      font(700, 52, CAP); text('A telescope pulled down', 52, 148, { color: C.ink, base: 'middle' });
    });
    if (t < 9.6) {
      const h = hA(t), y = Y(h), x = 460 + Math.sin(t * 0.6) * 10;
      A(span(t, 0.2, 9.6, 0.4, 0.2), () => {
        swift(x, y, 1.2);
        A(seg(t, 5.0, 5.6), () => {
          ctx.strokeStyle = C.sun; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
          ctx.beginPath(); ctx.moveTo(128, Y(H0)); ctx.lineTo(x - 70, Y(H0)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(128, Y(H_END)); ctx.lineTo(x - 70, Y(H_END)); ctx.stroke(); ctx.setLineDash([]);
          font(700, 26); text('Nov 2004: ~600 km', x + 70, Y(H0), { color: C.soft, base: 'middle' });
          A(seg(t, 8.2, 8.8), () => text('20 Oct 2026: 275 km', x + 70, Y(H_END), { color: C.sun, base: 'middle' }));
        });
      });
    }
    // B: air molecules streaming past, Swift at 600 km going right
    A(span(t, 9.6, 23.2, 0.5, 0.5), () => {
      const hB = lerp(H0, 420, eio(seg(t, 14.6, 18.4))), yB = Y(hB);
      // the trace of air: dots, more of them lower down (illustrative)
      let s = 3; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 260; i++) {
        const hh = 150 + rr() * 520, keep = Math.exp(-(hh - 150) / 120);
        const x0 = rr() * (W + 200), sp = 260;
        if (rr() > keep * 1.6) continue;
        const x = ((x0 - t * sp) % (W + 200) + (W + 200)) % (W + 200) - 100;
        if (x < 140) continue;
        ctx.fillStyle = 'rgba(160,230,255,0.75)'; ctx.fillRect(x, Y(hh), 3, 3);
      }
      swift(400, yB, 1.2);
      // drag arrow
      A(span(t, 14.2, 23.2), () => {
        ctx.strokeStyle = C.rose; ctx.fillStyle = C.rose; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(350, yB); ctx.lineTo(260, yB); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(246, yB); ctx.lineTo(266, yB - 12); ctx.lineTo(266, yB + 12); ctx.fill();
        font(700, 24); text('drag', 300, yB - 26, { color: C.rose, align: 'center', base: 'middle' });
      });
      // speed
      chip(160, 64, 540, 118, () => {
        font(400, 24); text('height', 184, 98, { color: C.soft, base: 'middle' });
        text('speed', 420, 98, { color: C.soft, base: 'middle' });
        font(700, 40); text(`${Math.round(hB)} km`, 184, 146, { color: C.ink, base: 'middle' });
        text(`${fmt2(vAt(hB))} km/s`, 420, 146, { color: t > 18.8 ? C.sun : C.ink, base: 'middle' });
      });
    });
    // B inset: the shrinking orbit seen from above (heights exaggerated)
    A(span(t, 15.0, 23.2, 0.5, 0.5), () => {
      const cx = 668, cy = 470, R0 = 92, X = 0.12; // Earth radius on screen; px per km of height
      ctx.fillStyle = C.panel; k.rrect(cx - 172, cy - 210, 344, 420, 18); ctx.fill();
      ctx.fillStyle = '#1f5f9e'; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.sun; ctx.lineWidth = 2.5; ctx.beginPath();
      const turns = 5, p = seg(t, 15.4, 22.4);
      for (let i = 0; i <= 600 * p; i++) {
        const u = i / 600, h = lerp(H0, H_END, u), r = R0 + h * X, ang = -Math.PI / 2 + u * turns * Math.PI * 2;
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      font(400, 20); text('seen from above', cx, cy - 186, { color: C.soft, align: 'center', base: 'middle' });
      text('heights exaggerated', cx, cy + 186, { color: C.soft, align: 'center', base: 'middle' });
    });
    // C: the Sun heats the upper air
    A(span(t, 23.4, 46.2, 0.6, 0.6), () => {
      const sx = -60, sy = 300, glow = 0.6 + 0.4 * eio(seg(t, 27.6, 29.0));
      const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, 330);
      g.addColorStop(0, C.sunHot); g.addColorStop(0.35, `rgba(255,159,67,${0.75 * glow})`); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 330, 0, Math.PI * 2); ctx.fill();
      // rays to the upper air
      for (let i = 0; i < 7; i++) {
        const p = ((t * 0.55 + i / 7) % 1), y0 = 230 + i * 30;
        const x = lerp(140, 760, p), y = lerp(y0, Y(420 - i * 20), p);
        A(Math.sin(p * Math.PI) * 0.9, () => { ctx.strokeStyle = i % 2 ? '#c9a7ff' : C.sunHot; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 40, y - 8); ctx.lineTo(x, y); ctx.stroke(); });
      }
      A(span(t, 23.6, 28.0), () => { font(700, 28); text('X-rays + ultraviolet', 210, 210, { color: C.sunHot, base: 'middle' }); });
      A(span(t, 28.0, 32.6), () => {
        chip(200, 160, 300, 90, () => { font(700, 44); text('+500 °C', 224, 205, { color: C.sun, base: 'middle' }); });
      });
    });
    // C: lines of equal density rise; Swift at a fixed height now sits in denser air
    A(span(t, 28.2, 37.2, 0.5, 0.5), () => {
      isoLines(lift, 1, true);
      swift(520, Y(450), 1.1);
      A(seg(t, 33.2, 33.8), () => {
        chip(200, 160, 420, 64, () => { font(700, 26); text('same height, denser air', 222, 192, { color: C.rose, base: 'middle' }); });
      });
    });
    // C: boosts per year, quiet vs active Sun
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      ctx.fillStyle = 'rgba(4,6,15,0.95)'; ctx.fillRect(0, 150, W, 560);
      const x0 = 80, x1 = 800, row = (y, n, col, label) => {
        font(700, 26); text(label, x0, y - 40, { color: col, base: 'middle' });
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        const shown = Math.round(n * eout(seg(t, 37.6, 39.4)));
        for (let i = 0; i < shown; i++) {
          const x = x0 + ((i + 0.5) / n) * (x1 - x0);
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.fill();
        }
      };
      font(400, 22); text('one year of orbit boosts', x0, 220, { color: C.soft, base: 'middle' });
      row(360, 4, C.cyan, 'quiet Sun: about 4');
      row(540, Math.round(52 / 2.5), C.sun, 'active Sun: every 2–3 weeks');
      font(400, 20); text('Jan', x0, 380, { color: C.faint, base: 'top' }); text('Dec', x1, 380, { color: C.faint, align: 'right', base: 'top' });
      text('Jan', x0, 560, { color: C.faint, base: 'top' }); text('Dec', x1, 560, { color: C.faint, align: 'right', base: 'top' });
    });
    // C: the solar cycle, peak in 2024
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      ctx.fillStyle = 'rgba(4,6,15,0.95)'; ctx.fillRect(0, 150, W, 560);
      const x0 = 90, x1 = 790, yb = 580, yt = 310;
      const X = (yr) => x0 + ((yr - 2019) / 11) * (x1 - x0);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
      font(400, 22);
      for (const yr of [2019, 2022, 2025, 2028]) text(`${yr}`, X(yr), yb + 26, { color: C.soft, align: 'center', base: 'middle' });
      const p = eout(seg(t, 42.0, 44.0));
      ctx.strokeStyle = C.sun; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i <= 200 * p; i++) {
        const yr = 2019 + (i / 200) * 11; // schematic: one cycle from a minimum at the end of 2019, maximum period in 2024
        const ph = yr < 2024.8 ? 0.5 * clamp((yr - 2019.9) / 4.9) : 0.5 + 0.5 * clamp((yr - 2024.8) / 6.1);
        const v = Math.pow(Math.sin(Math.PI * ph), 2);
        const x = X(yr), y = yb - v * (yb - yt);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      A(seg(t, 43.4, 44.0), () => {
        const x = X(2024.8), y = yt - 10;
        ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x, y + 10, 9, 0, Math.PI * 2); ctx.fill();
        font(700, 26); text('solar maximum', x, y - 54, { color: C.sun, align: 'center', base: 'middle' });
        font(400, 22); text('announced Oct 2024', x, y - 24, { color: C.soft, align: 'center', base: 'middle' });
      });
      font(400, 20); text('Sun’s activity, schematic: one 11-year cycle', x0, 190, { color: C.soft, base: 'middle' });
    });
    // D: the runaway
    A(span(t, 46.4, 55.0, 0.4, 0.5), () => {
      ctx.fillStyle = 'rgba(4,6,15,0.95)'; ctx.fillRect(0, 150, W, 600);
      const x0 = 150, x1 = 800, X = (u) => x0 + u * (x1 - x0);
      // schematic decay: slow, then steeper and steeper
      const hOf = (u) => H0 - (H0 - 250) * (Math.exp(4 * u) - 1) / (Math.exp(4) - 1);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, Y(H_POINT)); ctx.lineTo(x1, Y(H_POINT)); ctx.stroke();
      font(400, 22); text('300 km: too low to rescue', x0 + 10, Y(H_POINT) + 22, { color: C.soft, base: 'middle' });
      const p = eio(seg(t, 46.6, 49.6));
      ctx.strokeStyle = C.rose; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i <= 200 * p; i++) { const u = i / 200; i ? ctx.lineTo(X(u), Y(hOf(u))) : ctx.moveTo(X(u), Y(hOf(u))); }
      ctx.stroke();
      font(400, 20); text('height over time (schematic)', x0, 190, { color: C.soft, base: 'middle' });
      scale(1);
      A(seg(t, 47.4, 48.0), () => {
        font(700, 24, CAP); text('lower → denser air → more drag', 170, Y(430), { color: C.rose, base: 'middle' });
      });
      // the team's moves
      A(span(t, 51.0, 55.0, 0.4, 0.4), () => {
        chip(160, 545, 640, 150, () => {
          font(700, 24, CAP);
          text('Feb–Aug 2026: aimed to cut drag, science paused', 184, 585, { color: C.cyan, base: 'middle' });
          text('July 2026: robot craft LINK sent to boost it', 184, 625, { color: C.ink, base: 'middle' });
          text('August 2026: the boost is called off', 184, 665, { color: C.rose, base: 'middle' });
        });
      });
    });
  });
}

// ---------- E: gamma-ray bursts, then re-entry ----------
function sceneEnd(t) {
  const a = span(t, 55.2, 64.8, 0.6, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // flashes of gamma-ray bursts across the sky, Swift turning to each
    let s = 41; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const bursts = Array.from({ length: 26 }, (_, i) => ({ x: 80 + rr() * 700, y: 170 + rr() * 380, t0: 55.8 + i * 0.16 }));
    for (const b of bursts) {
      const p = seg(t, b.t0, b.t0 + 0.9);
      if (p <= 0) continue;
      const r = 4 + 26 * eout(Math.min(1, p * 2)), al = (p < 1 ? 1 - p * 0.6 : 0.4) * (1 - seg(t, 59.8, 60.6));
      ctx.fillStyle = `rgba(201,167,255,${0.5 * al})`; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${al})`; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      chip(52, 590, 760, 150, () => {
        font(700, 40); text('2,000+', 80, 640, { color: C.grb, base: 'middle' });
        font(400, 22); text('gamma-ray bursts', 80, 690, { color: C.soft, base: 'middle' });
        font(700, 40); text('1,400+', 330, 640, { color: C.ink, base: 'middle' });
        font(400, 22); text('supernovae', 330, 690, { color: C.soft, base: 'middle' });
        font(700, 40); text('~7,000', 570, 640, { color: C.ink, base: 'middle' });
        font(400, 22); text('scientific papers', 570, 690, { color: C.soft, base: 'middle' });
      });
    });
    A(span(t, 60.0, 64.8, 0.5, 0.01), () => {
      air(1, 0.9); earth();
      const p = eio(seg(t, 60.4, 64.6));
      const x = lerp(250, 620, p), y = lerp(Y(275), Y(120), p);
      // a glowing trail into the air
      ctx.strokeStyle = 'rgba(255,159,67,0.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lerp(250, x, 0.2), lerp(Y(275), y, 0.2)); ctx.lineTo(x, y); ctx.stroke();
      swift(x, y, 1.0, seg(t, 62.0, 64.0));
      font(700, 26); text('re-entry expected within weeks', 52, 200, { color: C.sun, base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneSide(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.sun, '~': C.rose } });
  },
});
