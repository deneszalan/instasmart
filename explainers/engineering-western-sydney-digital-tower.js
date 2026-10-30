// Explainer for engineering-western-sydney-digital-tower: on 25 October 2026 Western Sydney International (Nancy-Bird
// Walton) Airport opened to passengers, the first major airport in Australia without a traditional control tower:
// controllers about 17 km away at Eastern Creek watch feeds from cameras on a mast. How a digital tower works, why a
// distant plane shrinks to a speck, and what the reported 15-nautical-mile spacing does to landings per hour. Look: a
// night airfield in ink blue, runway lights in amber, camera views in cyan, planes in white, the warning in magenta.
// Azeret Mono for numbers and labels, Jost for captions.
//
// Facts: The Guardian, "Western Sydney airport is open from today" (24 October 2026): opens to passengers on Sunday
// 25 October; runs 24 hours a day, unlike Kingsford Smith's 11pm-6am curfew; the government spent $5.3bn on it.
// Airservices Australia (4 March 2024): first Australian airport without a traditional control tower; more than 20
// high-resolution cameras monitor the airport and immediate airspace and beam real-time vision to a control room at
// Eastern Creek; object tracking, night vision and image enhancement; infrared cameras for night and low visibility;
// digital aerodromes already operate in the United Kingdom, Sweden and Germany. ABC News (7 March 2024): each aircraft
// labelled on the screens with its call sign, altitude and speed. The Sydney Morning Herald, "Camera bungle forces
// curb on flights to Sydney's new airport" (12 August 2026): images from 25 cameras fed to controllers 17 km away;
// sources said distant planes "look like mosquitoes" on the screens; controllers must keep landing planes at least 15
// nautical miles (27.8 km) apart, about seven-minute intervals, against typically four to five nautical miles at
// airports with a traditional tower, where controllers use binoculars; visual separation banned; CASA: controls stay
// until it is satisfied; Airservices: no changes to the cameras planned, services designed to safely accommodate
// forecast flights; the first passenger flight a Jetstar A320 to the Gold Coast. Wikipedia, Airbus A320 family: wingspan
// 35.8 m with sharklets. Wikipedia, Remote and virtual tower: camera images are reconstructed as a video panorama.
// Computed here: the approach speed implied by 15 nm in about 7 minutes (≈ 129 knots); minutes and landings per hour
// at 4–5 and 15 nautical miles; the A320's angular width at 27.8 km and the button it matches (1 cm at ≈ 8 m). The
// airfield, mast and screens are schematic; the camera pictures are not real footage.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  Hook: opened on 25 October 2026 without a tower; controllers 17 km away.
//  B  9.6–28.0  A tower's windows and binoculars vs cameras on a mast; the panorama; tracking and infrared.
//  C 28.0–41.8  Angular size: half as wide at twice the distance; the A320 at 28 km; reported "mosquitoes".
//  D 41.8–55.4  The reported 15 nm spacing vs 4–5; minutes between landings; landings per hour.
//  E 55.4–65.0  Airservices' answer; digital towers elsewhere; Australia's first.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#0a0f1a', bg1: '#141c2e', ink: '#eef2f8', soft: 'rgba(238,242,248,0.72)', faint: 'rgba(238,242,248,0.26)',
  line: 'rgba(238,242,248,0.14)', amber: '#ffb84d', cyan: '#58c4dd', cyanSoft: 'rgba(88,196,221,0.18)', mag: '#ff5fa2',
  grass: '#18301f', tarmac: '#2a3142', panel: 'rgba(20,28,46,0.94)', white: '#ffffff', glass: 'rgba(88,196,221,0.30)',
};
const NUM = 'Azeret Mono', CAP = 'Jost';

let k, ctx;
const font = (w, s, f = CAP) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts and the arithmetic ----------
const AWAY_KM = 17, WIDE_NM = 15, NORMAL_NM = [4, 5], GAP_MIN = 7, SPAN_M = 35.8, NM_KM = 1.852;
const SPEED_KT = WIDE_NM / (GAP_MIN / 60); // ≈ 129 knots, implied by 15 nm in about 7 minutes
const minutes = (nm) => (nm / SPEED_KT) * 60;
const perHour = (nm) => 60 / minutes(nm);
const WIDE_KM = WIDE_NM * NM_KM; // ≈ 27.8 km
const RATIO = (WIDE_KM * 1000) / SPAN_M; // ≈ 777: a 1 cm button at ≈ 7.8 m
const BUTTON_M = Math.round(RATIO / 100); // ≈ 8
const f0 = (v) => String(Math.round(v)), f1 = (v) => v.toFixed(1);

const CUES = [
  [0.4, 4.8, 'On 25 October 2026, a new Sydney airport opened to passengers without a tower.'],
  [5.0, 9.4, `At Western Sydney International, controllers sit about *${AWAY_KM} km* away, watching camera feeds.`],
  [9.6, 14.0, 'In a normal tower, controllers look out of the windows, with binoculars for planes far out.'],
  [14.2, 18.6, 'Here, more than 20 cameras on a mast film the airfield and the sky around it.'],
  [18.8, 23.2, 'Their pictures are stitched into one ~panorama~ on screens, with each plane labelled.'],
  [23.4, 27.8, 'Software can track objects and sharpen the image, and infrared cameras help at night.'],
  [28.0, 32.4, 'But a plane looks smaller the farther away it is: half as wide at twice the distance.'],
  [32.6, 37.0, `An A320 is *${SPAN_M} m* across. ${f0(WIDE_KM)} km out, it looks as wide as a 1 cm button ${BUTTON_M} m away.`],
  [37.2, 41.6, 'Sources told The Sydney Morning Herald that far-off planes ^look like mosquitoes^ on screen.'],
  [41.8, 46.2, `So, it reported, landing planes are kept *${WIDE_NM} nautical miles* apart instead of 4 or 5.`],
  [46.4, 50.8, `At landing speed that is about *${GAP_MIN} minutes* between planes, instead of about 2.`],
  [51.0, 55.4, `So at most about ${f0(perHour(WIDE_NM))} planes an hour could land, against ${f0(perHour(NORMAL_NM[1]))} to ${f0(perHour(NORMAL_NM[0]))} at the usual spacing.`],
  [55.6, 60.0, 'Airservices Australia said it had no camera changes planned and could safely cope.'],
  [60.2, 64.6, 'Digital towers already run airports in the UK, Sweden and Germany. This is Australia’s first.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(238,242,248,${0.08 + r() * 0.2})`; g.fillRect(r() * W, r() * 300, 1.5, 1.5); }
}

// ---------- drawing helpers ----------
function panel(x, y, w, h, r = 16) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); }
function plane(x, y, s, a = 0, color = C.white) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-6, -24); ctx.lineTo(-12, -24); ctx.lineTo(-6, 0); ctx.lineTo(-12, 24); ctx.lineTo(-6, 24); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-30, -10); ctx.lineTo(-33, -10); ctx.lineTo(-29, 0); ctx.lineTo(-33, 10); ctx.lineTo(-30, 10); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function runway(x0, y0, x1, y1, t, w = 26) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(a);
  ctx.fillStyle = C.tarmac; ctx.fillRect(0, -w / 2, L, w);
  ctx.fillStyle = 'rgba(238,242,248,0.5)'; for (let x = 20; x < L - 20; x += 34) ctx.fillRect(x, -1.5, 16, 3);
  for (let x = 0; x <= L; x += 22) {
    const tw = 0.6 + 0.4 * Math.sin(t * 3 + x * 0.1);
    ctx.fillStyle = `rgba(255,184,77,${tw})`; ctx.beginPath(); ctx.arc(x, -w / 2 - 3, 2.5, 0, Math.PI * 2); ctx.arc(x, w / 2 + 3, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function mast(x, y, h, t, { cams = true } = {}) {
  ctx.strokeStyle = '#9aa6b8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
  ctx.lineWidth = 2; for (let i = 0; i < h; i += 18) { ctx.beginPath(); ctx.moveTo(x - 8, y - i); ctx.lineTo(x + 8, y - i - 18); ctx.stroke(); }
  if (cams) {
    ctx.fillStyle = '#c9d3e2'; k.rrect(x - 30, y - h - 18, 60, 22, 6); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x - 22 + i * 11, y - h - 7, 3.5, 0, Math.PI * 2); ctx.fill(); }
  }
}
function tower(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#566178'; ctx.fillRect(-16, -180, 32, 180);
  ctx.fillStyle = '#6b7792'; ctx.beginPath(); ctx.moveTo(-54, -180); ctx.lineTo(54, -180); ctx.lineTo(44, -240); ctx.lineTo(-44, -240); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.glass; ctx.beginPath(); ctx.moveTo(-48, -186); ctx.lineTo(48, -186); ctx.lineTo(40, -234); ctx.lineTo(-40, -234); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#566178'; ctx.fillRect(-58, -252, 116, 14);
  ctx.restore();
}
function note(s, y = 770) { font(400, 19); text(s, W / 2, y, { color: C.faint, align: 'center' }); }

// ---------- A: the hook ----------
function hook(t) {
  const a = span(t, 0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the airfield from above, a plane taking off
    ctx.fillStyle = C.grass; k.rrect(60, 200, 744, 300, 20); ctx.fill();
    runway(120, 420, 740, 290, t);
    const go = eio(seg(t, 1.0, 4.2));
    const px = lerp(160, 760, go), py = lerp(412, 285, go);
    plane(px, py, 0.9 + 0.3 * go, Math.atan2(290 - 420, 740 - 120));
    // the missing tower, crossed out
    A(seg(t, 2.6, 3.1), () => {
      tower(200, 330, 0.45);
      ctx.strokeStyle = C.mag; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(170, 210); ctx.lineTo(232, 336); ctx.moveTo(232, 210); ctx.lineTo(170, 336); ctx.stroke();
      font(600, 24); text('no tower', 202, 360, { color: C.mag, align: 'center' });
    });
    mast(430, 470, 90, t);
    // 17 km to Eastern Creek
    A(seg(t, 5.4, 6.0), () => {
      const g = eout(seg(t, 5.4, 6.8));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.setLineDash([3, 10]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(430, 390); ctx.lineTo(lerp(430, 700, g), lerp(390, 620, g)); ctx.stroke(); ctx.setLineDash([]);
      panel(560, 600, 250, 120, 14);
      font(700, 30, NUM); text(`${AWAY_KM} km`, 685, 640, { color: C.cyan, align: 'center' });
      font(400, 20); text('control room, Eastern Creek', 685, 680, { color: C.soft, align: 'center' });
    });
    font(500, 22); text('WESTERN SYDNEY INTERNATIONAL', 80, 170, { color: C.faint, spacing: '3px' });
    A(seg(t, 1.0, 1.5), () => { font(600, 22, NUM); text('25 OCT 2026', 80, 540, { color: C.amber }); });
    note('schematic', 770);
  });
}

// ---------- B: tower vs mast, the panorama ----------
function towerVsMast(t) {
  const a = span(t, 9.6, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.grass; ctx.fillRect(40, 560, 784, 40);
    tower(230, 560, 1.1);
    // binoculars and a sight line
    A(seg(t, 10.6, 11.1), () => {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(270, 340); ctx.lineTo(400, 220); ctx.stroke(); ctx.setLineDash([]);
      plane(410, 210, 0.5, 0);
      font(500, 22); text('eyes and binoculars', 230, 620, { color: C.amber, align: 'center' });
    });
    A(seg(t, 14.4, 14.9), () => {
      mast(640, 560, 260, t);
      // camera fans
      for (let i = 0; i < 6; i++) {
        const a0 = -Math.PI * 0.95 + i * 0.34;
        ctx.fillStyle = 'rgba(88,196,221,0.10)'; ctx.beginPath(); ctx.moveTo(640, 290); ctx.arc(640, 290, 200, a0, a0 + 0.3); ctx.closePath(); ctx.fill();
      }
      font(500, 22); text('more than 20 cameras', 640, 620, { color: C.cyan, align: 'center' });
    });
    note('schematic', 770);
  });
}
function panorama(t) {
  const a = span(t, 18.8, 28.0, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // camera slices sliding together into one wide strip
    const join = eio(seg(t, 19.2, 21.0));
    const n = 8, sw = 92, gap = lerp(18, 0, join), x0 = W / 2 - (n * sw + (n - 1) * gap) / 2, y0 = 230, sh = 220;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (sw + gap);
      const sky = ctx.createLinearGradient(0, y0, 0, y0 + sh);
      sky.addColorStop(0, '#1d2b48'); sky.addColorStop(0.62, '#2c3f63'); sky.addColorStop(0.63, '#1c3324'); sky.addColorStop(1, '#13241a');
      ctx.fillStyle = sky; ctx.fillRect(x, y0, sw, sh);
      ctx.strokeStyle = 'rgba(88,196,221,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(x, y0, sw, sh);
    }
    // the runway across the panorama
    ctx.fillStyle = C.tarmac; ctx.fillRect(x0, y0 + sh * 0.72, n * sw + (n - 1) * gap, 16);
    // planes with labels
    const ps = [[x0 + 150, y0 + 70, 'FLIGHT 1', '1,800 ft · 140 kt'], [x0 + 520, y0 + sh * 0.72 - 6, 'FLIGHT 2', 'on runway']];
    ps.forEach(([x, y, cs, inf], i) => {
      plane(x, y, i ? 0.6 : 0.35, 0);
      A(seg(t, 21.4 + i * 0.5, 21.9 + i * 0.5), () => {
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(x - 26, y - 18, 52, 36);
        font(600, 18, NUM); text(cs, x + 32, y - 22, { color: C.cyan });
        font(400, 16, NUM); text(inf, x + 32, y, { color: C.soft });
      });
    });
    font(500, 22); text('one stitched panorama', W / 2, 190, { color: C.soft, align: 'center' });
    // tracking and infrared
    A(seg(t, 23.6, 24.1), () => {
      panel(110, 510, 300, 130, 14); panel(454, 510, 300, 130, 14);
      font(600, 22); text('object tracking', 260, 548, { color: C.cyan, align: 'center' });
      text('infrared at night', 604, 548, { color: C.amber, align: 'center' });
      font(400, 18); text('follows each moving thing', 260, 584, { color: C.soft, align: 'center' });
      text('sees warm engines in the dark', 604, 584, { color: C.soft, align: 'center' });
      // infrared blob
      const g = ctx.createRadialGradient(604, 616, 2, 604, 616, 18); g.addColorStop(0, '#fff4c2'); g.addColorStop(1, 'rgba(255,184,77,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(604, 616, 18, 0, Math.PI * 2); ctx.fill();
    });
    note('illustration, not real camera pictures; labels made up', 770);
  });
}

// ---------- C: angular size ----------
function shrink(t) {
  const a = span(t, 28.0, 41.8, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const ex = 90, ey = 400;
    // the eye / camera
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(ex, ey, 14, 0, Math.PI * 2); ctx.fill();
    font(500, 20); text('camera', ex, ey + 38, { color: C.cyan, align: 'center' });
    const half = 60; // half the plane's height on screen at the near distance
    const near = 300, far = 600;
    // sight lines to a plane at d and at 2d
    const showFar = seg(t, 29.4, 30.2);
    ctx.strokeStyle = 'rgba(238,242,248,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + near, ey - half); ctx.moveTo(ex, ey); ctx.lineTo(ex + near, ey + half); ctx.stroke();
    ctx.save(); ctx.translate(ex + near, ey); ctx.rotate(Math.PI / 2); plane(0, 0, 2.4, 0); ctx.restore();
    font(500, 22, NUM); text('d', ex + near, ey + 100, { color: C.soft, align: 'center' });
    A(showFar, () => {
      ctx.strokeStyle = 'rgba(255,184,77,0.6)';
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + far, ey - half); ctx.moveTo(ex, ey); ctx.lineTo(ex + far, ey + half); ctx.stroke();
      ctx.save(); ctx.translate(ex + far, ey); ctx.rotate(Math.PI / 2); plane(0, 0, 2.4, 0, C.amber); ctx.restore();
      font(500, 22, NUM); text('2d', ex + far, ey + 100, { color: C.amber, align: 'center' });
      // the angles
      ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, 70, -Math.atan(half / near), Math.atan(half / near)); ctx.stroke();
      ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.arc(ex, ey, 110, -Math.atan(half / far), Math.atan(half / far)); ctx.stroke();
      font(600, 24); text('half the angle', ex + 170, ey - 120, { color: C.amber });
    });
    // the A320 at 27.8 km and the button
    A(span(t, 32.8, 37.2, 0.3, 0.3), () => {
      panel(150, 560, 564, 150, 16);
      font(700, 30, NUM); text(`${SPAN_M} m wide at ${f1(WIDE_KM)} km`, W / 2, 600, { color: C.ink, align: 'center' });
      font(500, 24); text(`= a 1 cm button seen from about ${BUTTON_M} m`, W / 2, 646, { color: C.amber, align: 'center' });
      font(400, 18); text(`both 1 part in ${Math.round(RATIO)}`, W / 2, 682, { color: C.faint, align: 'center' });
    });
    // mosquitoes on the screen
    A(seg(t, 37.4, 37.9), () => {
      panel(150, 560, 564, 150, 16);
      ctx.fillStyle = '#1d2b48'; ctx.fillRect(176, 580, 512, 110);
      ctx.fillStyle = C.white; ctx.fillRect(560, 616, 3, 2);
      ctx.strokeStyle = C.mag; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(561, 617, 16, 0, Math.PI * 2); ctx.stroke();
      font(600, 22); text('“They look like mosquitoes”', 300, 635, { color: C.mag, align: 'center' });
      font(400, 17); text('source quoted by the SMH, Aug 2026', 300, 666, { color: C.soft, align: 'center' });
    });
    note('not to scale', 770);
  });
}

// ---------- D: spacing and capacity ----------
function spacing(t) {
  const a = span(t, 41.8, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // two approach lines, planes moving toward the runway on the left
    const L = 120, R = 790, perNm = (R - L) / 16;
    const rows = [[260, NORMAL_NM[1], 'usual: 4–5 nautical miles', C.cyan], [440, WIDE_NM, `reported: ${WIDE_NM} nautical miles`, C.mag]];
    rows.forEach(([y, nm, lab, col]) => {
      ctx.fillStyle = C.tarmac; ctx.fillRect(L - 80, y - 8, 70, 16);
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      font(500, 22); text(lab, L, y - 44, { color: col });
      // planes move at the same speed; spacing nm apart
      const v = 0.9; // nautical miles of picture per scene second
      for (let i = 0; i < 8; i++) {
        const pos = ((((t - 41.8) * v) % nm) + i * nm); // distance from the threshold, in nm
        if (pos > 16) continue;
        plane(L + pos * perNm, y, 0.55, Math.PI, col === C.mag ? C.white : C.white);
      }
    });
    for (let nm = 0; nm <= 15; nm += 5) { font(400, 18, NUM); text(`${nm}`, L + nm * perNm, 500, { color: C.faint, align: 'center' }); }
    font(400, 18); text('nautical miles from the runway', (L + R) / 2, 528, { color: C.faint, align: 'center' });
    // minutes between landings
    A(seg(t, 46.6, 47.1), () => {
      panel(120, 570, 300, 120, 14); panel(444, 570, 300, 120, 14);
      font(700, 40, NUM); text(`≈ ${f0(minutes(4.5))} min`, 270, 612, { color: C.cyan, align: 'center' });
      text(`≈ ${f0(minutes(WIDE_NM))} min`, 594, 612, { color: C.mag, align: 'center' });
      font(400, 18); text('between landings', 270, 656, { color: C.soft, align: 'center' }); text('between landings', 594, 656, { color: C.soft, align: 'center' });
    });
    // per hour
    A(seg(t, 51.2, 51.7), () => {
      panel(120, 570, 624, 120, 14);
      const g = eout(seg(t, 51.2, 52.6)), bw = 400 / perHour(NORMAL_NM[0]);
      ctx.fillStyle = C.cyan; ctx.fillRect(320, 590, bw * perHour(NORMAL_NM[0]) * g, 30);
      ctx.fillStyle = C.mag; ctx.fillRect(320, 638, bw * perHour(WIDE_NM) * g, 30);
      font(600, 20, NUM); text(`${f0(perHour(NORMAL_NM[1]))}–${f0(perHour(NORMAL_NM[0]))} / hour`, 140, 605, { color: C.cyan });
      text(`≈ ${f0(perHour(WIDE_NM))} / hour`, 140, 653, { color: C.mag });
    });
    note(`speed implied by the SMH figures: ${WIDE_NM} nautical miles in about ${GAP_MIN} min ≈ ${f0(SPEED_KT)} knots`, 770);
  });
}

// ---------- E: the response and the rest of the world ----------
function response(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    panel(110, 200, 644, 300, 18);
    font(700, 26); text('Airservices Australia', W / 2, 250, { color: C.cyan, align: 'center' });
    font(400, 24); text('“no changes to the cameras” planned', W / 2, 320, { color: C.ink, align: 'center' });
    text('services designed to safely handle', W / 2, 380, { color: C.ink, align: 'center' });
    text('the forecast flights', W / 2, 414, { color: C.ink, align: 'center' });
    font(400, 18); text('as reported by the SMH, August 2026', W / 2, 470, { color: C.faint, align: 'center' });
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    const places = [['United Kingdom', 220], ['Sweden', 340], ['Germany', 460], ['Australia: first', 600]];
    places.forEach(([p, y], i) => {
      A(seg(t, 60.6 + i * 0.6, 61.1 + i * 0.6), () => {
        mast(170, y + 30, 70, t);
        font(600, 30); text(p, 230, y, { color: i === 3 ? C.amber : C.ink });
      });
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
    towerVsMast(t);
    panorama(t);
    shrink(t);
    spacing(t);
    response(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.amber, '~': C.cyan, '^': C.mag } });
  },
});
