// Explainer for earth-champi-eyewall-replacement: from 17 to 20 October 2026 Super Typhoon Champi passed Guam and
// crossed the Philippine Sea, its winds rising, dipping and rising again as it went through eyewall replacement
// cycles, the third of them on 19-20 October, before peaking at 160 knots on 20 October. How a typhoon grows a second
// ring of storms around its eye, why the old ring starves and the storm weakens, and why the new ring then shrinks
// and spins up. Look: the storm seen from above on a deep ocean blue, cloud rings in white and ice blue, the moat in
// ocean blue, wind speeds in amber, the warm sea in coral. Saira for numbers and labels, Fira Sans for captions.
//
// Facts: Joint Typhoon Warning Center (JTWC) prognostic reasoning for Typhoon 29W (Champi), archived copies at
// wiki.chlod.net/jtwc/prog/: warning 013 (17 Oct 12Z), 120 kt, 96 nm south-east of Andersen AFB (Guam): the pinhole
// eye filled in due to an ongoing eyewall replacement cycle (ERC); radar from Guam resolves a concentric eyewall
// morphology, a thickening inner eyewall, a distinct radar moat and a secondary outer eyewall about 30 nm from the
// centre; warning 016 (18 Oct 06Z), 130 kt: rapidly deteriorating, eye filled; microwave pass confirmed secondary
// eyewall formation about 40 km from the centre; warning 017 (18 Oct 12Z): 120 kt; warning 019 (19 Oct 00Z): 135 kt,
// microwave confirmed completion of an ERC, a large primary eyewall about 35 nm across and a 40 nm moat; the
// intensification followed as the primary eyewall shrank; warning 022 (19 Oct 18Z): 135 kt, "continuing its third
// ERC", a strengthening and contracting outer eyewall and a weakening inner eyewall; warning 024 (20 Oct 06Z): 135 kt,
// quickly recovered following completion of an ERC; sea surface 29-31 °C, ocean heat content 125-160 kJ/cm²; warning
// 026 (20 Oct 18Z): 160 kt; warning 030 (21 Oct 18Z): 135 kt, lower ocean heat content; maximum sustained winds are
// one-minute averages. Other warnings as issued: 16 Oct 18Z 75, 17 Oct 00Z 85, 06Z 115, 18Z 130, 18 Oct 00Z 130,
// 18Z 120, 19 Oct 06Z 140, 12Z 140, 20 Oct 00Z 130, 12Z 155, 21 Oct 00Z 155, 06Z 150, 12Z 145, 22 Oct 00Z 115.
// Associated Press (19 October 2026): Champi became a Category 5 super typhoon in the Philippine Sea after passing
// close to Guam. Wikipedia, "Eyewall replacement cycle": outer rainbands strengthen and organise into a ring of
// thunderstorms, a new outer eyewall, that slowly moves inward and robs the inner eyewall of moisture and angular
// momentum; the storm usually weakens while the inner wall is choked, and may re-intensify once the outer wall has
// replaced it. Typhoon Champi (2026) on Wikipedia: weakened by lower sea temperatures and wind shear; passed near
// Taiwan on 23 October.
// Computed here: knots to km/h (x 1.852); nautical miles to km. The storm picture is schematic, and labelled so; the
// spin-up step uses the angular-momentum idea (a ring that halves its radius doubles its speed, without friction).
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  Hook: Champi's path past Guam; the intensity curve rises, dips, rises.
//  B  9.6–18.8  The eye and the eyewall; tighter ring, faster spin.
//  C 18.8–37.0  The outer ring and the moat (Guam radar, 17 Oct); the inner ring starves; the dip 130 -> 120 kt.
//  D 37.0–55.4  The new ring shrinks and spins up; the third swap; the peak of 160 kt on 20 October.
//  E 55.4–65.0  Forecasters watch for the moat; cooler water and shear wear it down.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#06121f', bg1: '#0b2236', ink: '#eef6fb', soft: 'rgba(238,246,251,0.74)', faint: 'rgba(238,246,251,0.26)',
  line: 'rgba(238,246,251,0.14)', cloud: '#e9f2f8', ice: '#9fd8f5', moat: '#123a57', wind: '#ffc857', warm: '#ff7f66',
  land: '#3f6b4f', panel: 'rgba(11,34,54,0.92)', dip: '#ff6b6b',
};
const NUM = 'Saira', CAP = 'Fira Sans';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts (JTWC warnings: day-of-October + hour/24, knots) ----------
const TRACK = [
  [16.75, 75], [17.0, 85], [17.25, 115], [17.5, 120], [17.75, 130], [18.0, 130], [18.25, 130], [18.5, 120], [18.75, 120],
  [19.0, 135], [19.25, 140], [19.5, 140], [19.75, 135], [20.0, 130], [20.25, 135], [20.5, 155], [20.75, 160],
  [21.0, 155], [21.25, 150], [21.5, 145], [21.75, 135], [22.0, 115],
];
const ERCS = [[17.2, 17.6, 'swap 1'], [18.0, 18.8, 'swap 2'], [19.5, 20.25, 'swap 3']];
const KMH = 1.852;
const kmh = (kt) => Math.round(kt * KMH);
const PEAK = Math.max(...TRACK.map(([, v]) => v)); // 160
const OUTER_NM = 30, NM_KM = 1.852;
const OUTER_KM = Math.round(OUTER_NM * NM_KM / 5) * 5; // ≈ 55 km

const CUES = [
  [0.4, 4.8, 'From 17 October 2026, Super Typhoon Champi swept past Guam into the Philippine Sea.'],
  [5.0, 9.4, 'Its winds didn’t just climb: they rose, dipped and rose again, US forecasters found.'],
  [9.6, 14.0, 'The answer is the *eyewall*: a ring of towering thunderstorms around the calm eye.'],
  [14.2, 18.6, 'The strongest winds whirl in that ring. The tighter the ring, the faster they can spin.'],
  [18.8, 23.2, 'In a strong storm, a rainband farther out can close into a second ring: an ^outer eyewall^.'],
  [23.4, 27.8, `On 17 October, Guam’s radar showed a second ring about *${OUTER_KM} km* out, a ~moat~ between.`],
  [28.0, 32.4, 'The outer ring grabs the warm, moist air flowing in, so the inner ring starves.'],
  [32.6, 37.0, `As the old eyewall dies, the storm weakens: on 18 October, from *${kmh(130)}* to *${kmh(120)} km/h*.`],
  [37.2, 41.6, 'Then the new ring shrinks inward. Like a skater pulling in her arms, it spins faster.'],
  [41.8, 46.2, 'By 19 October it was stronger than before, and forecasters saw a *third* swap begin.'],
  [46.4, 50.8, 'Each swap cost it some strength for a while. A sea of 29 to 31 °C kept feeding it.'],
  [51.0, 55.4, `On 20 October Champi peaked at ${PEAK} knots: about *${kmh(PEAK)} km/h*, averaged over one minute.`],
  [55.6, 60.0, 'Forecasters watch for the ~moat~ in satellite images: it warns of a dip and a comeback.'],
  [60.2, 64.6, 'Cooler water and wind shear wore Champi down before it passed Taiwan on 23 October.'],
];

// ---------- background: ocean ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(159,216,245,0.04)'; g.lineWidth = 2;
  for (let y = 40; y < 780; y += 26) {
    g.beginPath();
    for (let x = 0; x <= W; x += 12) { const yy = y + Math.sin(x * 0.02 + y) * 4; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
}

// ---------- the storm from above ----------
/** A ring of cloud at radius r (px), thickness w, brightness a. */
function ring(cx, cy, r, w, a, color = C.cloud) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(cx, cy, Math.max(0, r - w), cx, cy, r + w);
  g.addColorStop(0, 'rgba(233,242,248,0)');
  g.addColorStop(0.5, color);
  g.addColorStop(1, 'rgba(233,242,248,0)');
  A(a, () => { ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + w, 0, Math.PI * 2); ctx.fill(); });
}
/** Spiral rainbands turning counter-clockwise (northern hemisphere). */
function bands(cx, cy, t, r0, r1, a = 1) {
  A(a * 0.55, () => {
    ctx.strokeStyle = C.cloud; ctx.lineCap = 'round';
    for (let b = 0; b < 4; b++) {
      ctx.lineWidth = 16 - b * 2;
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) {
        const u = i / 50, r = lerp(r0, r1, u), th = -t * 0.5 + b * (Math.PI / 2) + u * 2.6;
        const x = cx + Math.cos(th) * r, y = cy - Math.sin(th) * r * 0.98;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.globalAlpha *= 0.85; ctx.stroke();
    }
  });
}
/** Wind arrows going round at radius r, speed shown by length. */
function swirl(cx, cy, r, t, speed, color = C.wind, n = 8) {
  for (let i = 0; i < n; i++) {
    const th = -t * speed * 0.02 + (i / n) * Math.PI * 2, len = 0.18 + speed * 0.0022;
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -th, -th - len, true); ctx.stroke();
    const ex = cx + Math.cos(th + len) * r, ey = cy - Math.sin(th + len) * r;
    const dir = th + len + Math.PI / 2;
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(ex + Math.cos(dir) * 10, ey - Math.sin(dir) * 10);
    ctx.lineTo(ex + Math.cos(dir + 2.5) * 9, ey - Math.sin(dir + 2.5) * 9);
    ctx.lineTo(ex + Math.cos(dir - 2.5) * 9, ey - Math.sin(dir - 2.5) * 9);
    ctx.closePath(); ctx.fill();
  }
}
/**
 * The storm: `inner` and `outer` give each eyewall's radius (px) and strength (0-1); the eye is clear inside the
 * inner ring, the moat clear between the rings.
 */
function storm(cx, cy, t, { inner = [60, 1], outer = [0, 0], bandsA = 1 } = {}) {
  bands(cx, cy, t, 150, 330, bandsA);
  // a soft cloud shield
  const sh = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
  sh.addColorStop(0, 'rgba(233,242,248,0.30)'); sh.addColorStop(1, 'rgba(233,242,248,0)');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy, 300, 0, Math.PI * 2); ctx.fill();
  if (outer[1] > 0) {
    // the moat: clear air between the rings
    A(outer[1], () => {
      ctx.fillStyle = C.moat; ctx.beginPath(); ctx.arc(cx, cy, Math.max(inner[0] + 14, outer[0] - 22), 0, Math.PI * 2); ctx.fill();
    });
    ring(cx, cy, outer[0], 30, outer[1], C.ice);
  }
  ring(cx, cy, inner[0], 26, inner[1]);
  // the eye
  ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(cx, cy, Math.max(6, inner[0] - 22), 0, Math.PI * 2); ctx.fill();
}
function note(s, y = 770) { font(400, 19, CAP); text(s, W / 2, y, { color: C.faint, align: 'center' }); }

// ---------- A: the path and the curve ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // schematic: Guam to the Philippine Sea, then north toward Taiwan
    const pts = [[760, 470], [640, 430], [520, 390], [400, 340], [330, 260], [300, 190]];
    const g = eio(seg(t, 0.6, 4.4));
    ctx.strokeStyle = C.wind; ctx.lineWidth = 5; ctx.setLineDash([2, 12]); ctx.lineCap = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
    // the moving storm
    const seglen = pts.length - 1, u = g * seglen, i = Math.min(seglen - 1, Math.floor(u)), f = u - i;
    const sx = lerp(pts[i][0], pts[i + 1][0], f), sy = lerp(pts[i][1], pts[i + 1][1], f);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(0.25, 0.25); storm(0, 0, t * 4, { inner: [60, 1] }); ctx.restore();
    // places
    ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(770, 505, 12, 22, 0.4, 0, Math.PI * 2); ctx.fill();
    font(500, 26); text('Guam', 790, 540, { color: C.ink, align: 'right' });
    ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(250, 160, 22, 50, 0.3, 0, Math.PI * 2); ctx.fill();
    font(500, 26); text('Taiwan', 200, 230, { color: C.ink, align: 'center' });
    font(500, 24); text('PHILIPPINE SEA', 470, 500, { color: C.faint, align: 'center', spacing: '4px' });
    A(seg(t, 1.2, 1.7), () => { font(700, 30); text('17 Oct', 700, 400, { color: C.wind }); });
    A(seg(t, 2.6, 3.1), () => { font(700, 30); text('20 Oct', 420, 300, { color: C.wind }); });
    note('schematic map', 650);
  });
}
/** The intensity chart from the JTWC warnings. */
function chart(t, t0, { x = 90, y = 170, w = 690, h = 420, upto = 22.0, erc = 0, peak = 0 } = {}) {
  const X = (d) => x + ((d - 16.75) / (22.0 - 16.75)) * w;
  const Y = (kt) => y + h - ((kt - 60) / (170 - 60)) * h;
  ctx.fillStyle = C.panel; k.rrect(x - 50, y - 50, w + 90, h + 110, 18); ctx.fill();
  font(500, 22); text('max winds, knots (JTWC warnings)', x - 26, y - 22, { color: C.soft });
  // grid
  for (const kt of [80, 100, 120, 140, 160]) {
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, Y(kt)); ctx.lineTo(x + w, Y(kt)); ctx.stroke();
    font(500, 18); text(String(kt), x - 10, Y(kt), { color: C.faint, align: 'right' });
  }
  for (let d = 17; d <= 22; d++) { font(500, 19); text(`${d} Oct`, X(d), y + h + 28, { color: C.faint, align: 'center' }); }
  // eyewall swaps, shaded
  ERCS.forEach(([a0, a1, lab], i) => {
    const g = clamp(erc * 3 - i);
    if (g <= 0) return;
    A(g, () => {
      ctx.fillStyle = 'rgba(159,216,245,0.14)'; ctx.fillRect(X(a0), y, X(a1) - X(a0), h);
      font(600, 20); text(lab, (X(a0) + X(a1)) / 2, y + h - 18, { color: C.ice, align: 'center' });
    });
  });
  // the line
  ctx.strokeStyle = C.wind; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath();
  let last = null;
  for (const [d, v] of TRACK) {
    if (d > upto) {
      if (last) { const f = (upto - last[0]) / (d - last[0]); ctx.lineTo(X(upto), Y(lerp(last[1], v, f))); }
      break;
    }
    last ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v));
    last = [d, v];
  }
  ctx.stroke();
  for (const [d, v] of TRACK) if (d <= upto) { ctx.fillStyle = C.wind; ctx.beginPath(); ctx.arc(X(d), Y(v), 5, 0, Math.PI * 2); ctx.fill(); }
  if (peak > 0) A(peak, () => {
    const [d, v] = TRACK.find(([, vv]) => vv === PEAK);
    ctx.fillStyle = C.warm; ctx.beginPath(); ctx.arc(X(d), Y(v), 11, 0, Math.PI * 2); ctx.fill();
    font(700, 28); text(`${PEAK} kt ≈ ${kmh(PEAK)} km/h`, X(d) - 16, Y(v) - 30, { color: C.warm, align: 'right' });
  });
  return { X, Y };
}
function curve(t) {
  const a = span(t, 5.0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const upto = lerp(16.75, 21.0, eio(seg(t, 5.3, 8.6)));
    const { X, Y } = chart(t, 5.0, { upto });
    A(seg(t, 7.2, 7.6), () => { font(700, 24); text('dip', X(18.6), Y(120) + 34, { color: C.dip, align: 'center' }); });
    A(seg(t, 8.4, 8.8), () => { font(700, 24); text('dip', X(20.0), Y(130) + 34, { color: C.dip, align: 'center' }); });
  });
}

// ---------- B: the eye and the eyewall ----------
const SX = W / 2, SY = 420;
function eyewall(t) {
  const a = span(t, 9.6, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const tight = eio(seg(t, 15.0, 17.0));
    const r = lerp(95, 60, tight);
    storm(SX, SY, t, { inner: [r, 1] });
    const sp = lerp(70, 115, tight);
    swirl(SX, SY, r, t, sp);
    A(seg(t, 10.2, 10.7), () => {
      font(600, 26); text('eye', SX, SY, { color: C.soft, align: 'center' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SX + r + 10, SY - 30); ctx.lineTo(640, 230); ctx.stroke();
      font(600, 26); text('eyewall', 650, 222, { color: C.ink });
      font(400, 20, CAP); text('strongest winds', 650, 252, { color: C.wind });
    });
    A(seg(t, 15.0, 15.5), () => {
      font(600, 26); text(tight > 0.9 ? 'tighter ring, faster spin' : 'ring tightens…', SX, 700, { color: C.wind, align: 'center' });
    });
    note('storm seen from above, schematic', 770);
  });
}

// ---------- C: the outer ring, the moat, the dip ----------
function outerRing(t) {
  const a = span(t, 18.8, 37.0, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const form = eout(seg(t, 19.2, 21.6)); // the outer ring closes
    const starve = seg(t, 28.4, 32.0); // the inner ring fades
    const inner = [60 + 20 * starve, 1 - 0.85 * starve];
    const outer = [lerp(190, 165, form), form];
    storm(SX, SY, t, { inner, outer, bandsA: 1 - 0.5 * form });
    swirl(SX, SY, inner[0], t, lerp(110, 60, starve), C.wind);
    A(form, () => swirl(SX, SY, outer[0], t, 60, 'rgba(255,200,87,0.7)', 10));
    // labels
    A(seg(t, 21.0, 21.5), () => {
      font(600, 24); text('outer eyewall', SX + outer[0] + 34, SY - 120, { color: C.ice });
      ctx.strokeStyle = C.ice; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SX + outer[0] * 0.75, SY - outer[0] * 0.6); ctx.lineTo(SX + outer[0] + 30, SY - 126); ctx.stroke();
    });
    A(span(t, 23.6, 28.2, 0.3, 0.3), () => {
      // Guam radar, 17 October: second ring about 30 nautical miles out
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(SX - outer[0], SY); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text(`≈ ${OUTER_KM} km`, SX - outer[0] / 2, SY - 22, { color: C.ink, align: 'center' });
      font(600, 22); text('moat', SX + (inner[0] + outer[0]) / 2, SY + 6, { color: C.ice, align: 'center' });
      font(400, 20, CAP); text(`JTWC, from Guam radar: outer eyewall ~${OUTER_NM} nautical miles from the centre`, W / 2, 690, { color: C.soft, align: 'center' });
    });
    // warm moist air flowing in, caught by the outer ring
    A(span(t, 28.2, 32.6, 0.3, 0.3), () => {
      for (let i = 0; i < 6; i++) {
        const th = (i / 6) * Math.PI * 2 + 0.3, u = ((t - 28.2) * 0.5 + i * 0.17) % 1;
        const r = lerp(320, outer[0] + 10, eio(u));
        const x = SX + Math.cos(th) * r, y = SY + Math.sin(th) * r;
        ctx.fillStyle = C.warm; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      }
      font(500, 22); text('warm, moist air', 120, 230, { color: C.warm, align: 'center' });
      text('stops at the outer ring', 120, 258, { color: C.warm, align: 'center' });
    });
    // the dip
    A(seg(t, 32.8, 33.3), () => {
      ctx.fillStyle = C.panel; k.rrect(250, 620, 364, 110, 16); ctx.fill();
      const d = eio(seg(t, 33.4, 35.0));
      font(700, 48); text(`${Math.round(lerp(kmh(130), kmh(120), d))} km/h`, W / 2, 664, { color: d > 0.5 ? C.dip : C.wind, align: 'center' });
      font(400, 20, CAP); text('18 October: 130 → 120 knots (JTWC)', W / 2, 706, { color: C.soft, align: 'center' });
    });
    note('storm seen from above, schematic', 770);
  });
}

// ---------- D: spin-up, the third swap, the peak ----------
function spinUp(t) {
  const a = span(t, 37.0, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const shrink = eio(seg(t, 37.6, 40.8));
    const r = lerp(165, 75, shrink);
    storm(SX, SY, t, { inner: [r, 1], bandsA: 0.6 });
    // speed grows as the ring tightens (angular momentum: v·r stays about the same, ignoring friction)
    const v = 60 * (165 / r);
    swirl(SX, SY, r, t, v, C.wind, 10);
    // the skater
    A(seg(t, 38.2, 38.7), () => {
      const sx = 120, sy = 230, arm = lerp(70, 18, shrink);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(sx, sy - 40, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy - 26); ctx.lineTo(sx, sy + 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - arm, sy - 6); ctx.lineTo(sx + arm, sy - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy + 40); ctx.lineTo(sx - 16, sy + 80); ctx.moveTo(sx, sy + 40); ctx.lineTo(sx + 16, sy + 80); ctx.stroke();
      ctx.strokeStyle = C.wind; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx, sy + 84, 40, 10, 0, 0.2, Math.PI * 1.6); ctx.stroke();
      font(500, 20, CAP); text('arms in, spins faster', sx, sy + 120, { color: C.soft, align: 'center' });
    });
    A(seg(t, 39.4, 39.9), () => { font(700, 30); text(`ring ½ as wide → about 2 × the speed`, SX, 690, { color: C.wind, align: 'center' }); });
    // the third swap begins: a new outer ring on 19 October
    A(seg(t, 42.2, 42.8), () => {
      ring(SX, SY, 180, 30, seg(t, 42.2, 43.6), C.ice);
      font(700, 30); text('19 Oct: swap no. 3', 640, 210, { color: C.ice, align: 'center' });
    });
    note('simplified: real storms lose some spin to friction with the sea', 770);
  });
}
function peakScene(t) {
  const a = span(t, 46.4, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const upto = lerp(19.6, 22.0, eio(seg(t, 46.6, 52.0)));
    const { X, Y } = chart(t, 46.4, { upto, erc: seg(t, 46.6, 48.4), peak: seg(t, 51.6, 52.1) });
    A(seg(t, 47.8, 48.3), () => {
      font(600, 22); text('sea surface 29–31 °C', X(18.2), Y(80), { color: C.warm, align: 'center' });
    });
  });
}

// ---------- E: forecasters, the end ----------
function forecast(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a "microwave image" look: rings in false colour
    ctx.save(); ctx.beginPath(); ctx.arc(SX, SY, 260, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#102c47'; ctx.fillRect(SX - 260, SY - 260, 520, 520);
    ring(SX, SY, 70, 24, 1, '#ff9f5a');
    ring(SX, SY, 170, 30, 1, '#ffd36b');
    ctx.restore();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(SX, SY, 260, 0, Math.PI * 2); ctx.stroke();
    font(700, 28); text('moat', SX + 120, SY, { color: C.ice, align: 'center' });
    font(500, 22); text('two rings and a moat: a swap is coming', SX, 720, { color: C.soft, align: 'center' });
    note('illustration of a microwave image', 770);
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    const fade = seg(t, 61.0, 64.0);
    storm(SX, SY, t, { inner: [lerp(75, 110, fade), 1 - 0.6 * fade], bandsA: 1 - 0.5 * fade });
    swirl(SX, SY, lerp(75, 110, fade), t, lerp(120, 60, fade), C.wind, 8);
    A(seg(t, 60.8, 61.3), () => {
      font(600, 24); text('cooler water', 140, 640, { color: C.ice, align: 'center' });
      text('wind shear', 720, 220, { color: C.ice, align: 'center' });
      font(600, 24); text('23 Oct: past Taiwan', 700, 660, { color: C.soft, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    curve(t);
    eyewall(t);
    outerRing(t);
    spinUp(t);
    peakScene(t);
    forecast(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 36, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.wind, '~': C.ice, '^': C.ice } });
  },
});
