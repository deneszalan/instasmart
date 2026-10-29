// Explainer for biology-shearwater-jet-lag-sun-compass: on 29 October 2026 a study in Science reported that
// Manx shearwaters get jet lag: fast flights east or west put their body clocks out of step with local sun
// time, so their sun compass points them off course. Look: a night-teal sea seen from above like a chart,
// a brass-gold Sun on a compass ring, a lilac body clock and coral for the error. Cormorant Garamond (an
// elegant chart-maker's serif) for titles and compass letters, Fira Sans for captions and numbers.
//
// Facts: Science News, "Seabirds get jet lag, too — and it can throw them a bit off course" (29 October 2026),
// on P. Lewin et al., "Rapid longitudinal flights cause time shifts and sun compass error", Science 2026
// (doi 10.1126/science.adz2542): over 20 years Tim Guilford, a biologist at the University of Oxford, and
// colleagues equipped 1,045 breeding Manx shearwaters with miniature GPS trackers, giving 1,837 continuous
// homeward flights from UK colonies and feeding grounds up to 1,000 km away; the birds need an internal clock
// synchronised with local sun time; the clock was assumed to be set to local time at sunrise; fast east-west
// flights change local time faster than the clock adjusts; the researchers predicted the compass errors and
// the birds veered as expected, by as much as 15 degrees; the errors add only a few kilometres; even near
// familiar coastlines the birds drifted in line with the predicted errors, suggesting they combine sun and
// coastal cues. Padget et al., Current Biology 28 (2018), "In situ clock shift reveals that the sun compass
// contributes to orientation in a pelagic seabird" (authors include T. Guilford): clock shifts at the nests of
// incubating shearwaters; the sun compass contributes to homing after displacement; the effect is partial.
//
// Computed here: the Sun's compass direction (azimuth) at latitude 52° N on midsummer's day (declination
// 23.44°), from the standard formula; sunrise there at about 3:45 sun time, azimuth about 50° (northeast),
// sunset at about 8:15 pm, azimuth about 310°. The Earth turns 360° in 24 hours, 15° an hour, so 15° of
// longitude is one hour of sun time; at 52° N one degree of longitude is 111.32 × cos 52° = 68.5 km, so
// 1,000 km is 14.6° and 58 minutes. A body clock at 2:00 pm where the sun time is 2:50 misreads the Sun's
// direction by 14.8°. The GPS tracks in the opening and the coast are illustrative, not the study's data.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The news; GPS tracks home to a colony.
//  B  9.4–23.2  The sun compass: the Sun's direction moves through the day; a body clock compensates.
//  C 23.2–37.0  Longitude is time: 15° an hour; 1,000 km = 14.6° = 58 min; flying faster than the clock resets.
//  D 37.0–46.2  The error: expected Sun vs real Sun; the heading turns 15° clockwise.
//  E 46.2–64.8  The result (up to 15°), a few km, coastal cues, the 2018 clock shift, clock = compass.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sea0: '#051a23', sea1: '#0a2d3a', grid: 'rgba(159,227,214,0.10)', foam: '#9fe3d6', ink: '#f2f6f3',
  soft: 'rgba(242,246,243,0.74)', faint: 'rgba(242,246,243,0.30)', sun: '#ffc45c', sunHot: '#ffe6a8',
  clock: '#c3b1ff', err: '#ff7a5c', panel: 'rgba(4,20,27,0.86)', land: '#2c4a3e', land2: '#3c5e4f',
};
const SERIF = 'Cormorant Garamond', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const R = Math.PI / 180;

// ---------- the Sun's direction ----------
const LAT = 52, DEC = 23.44;
/** The Sun's azimuth in degrees from north, clockwise, at sun time `hrs` (hours). */
function azimuth(hrs, lat = LAT, dec = DEC) {
  const h = (hrs - 12) * 15 * R, p = lat * R, d = dec * R;
  const a = Math.atan2(-Math.sin(h), Math.tan(d) * Math.cos(p) - Math.sin(p) * Math.cos(h)) / R;
  return (a + 360) % 360;
}
const SUNRISE = 12 - Math.acos(-Math.tan(LAT * R) * Math.tan(DEC * R)) / R / 15; // about 3.75 h
const SUNSET = 24 - SUNRISE;
const KM_PER_DEG = 111.32 * Math.cos(LAT * R);
const LON_1000 = 1000 / KM_PER_DEG; // 14.6°
const MIN_1000 = LON_1000 * 4; // 58 minutes
const BODY = 14, AHEAD = 50 / 60; // the example: body clock 2:00 pm, sun time 2:50 pm
const ERR = azimuth(BODY + AHEAD) - azimuth(BODY); // 14.8°
const clockStr = (hrs) => {
  const m = Math.round(hrs * 60), hh = Math.floor(m / 60) % 24, mm = m % 60;
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`;
};

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 29 October 2026, Oxford biologist *Tim Guilford* and colleagues showed seabirds get *jet lag*.'],
  [5.0, 9.4, 'Over 20 years they GPS-tracked *1,045 Manx shearwaters* nesting in the UK: *1,837 flights* home.'],
  [9.6, 14.0, 'Shearwaters steer by the *Sun*. But the Sun’s direction swings round the sky all day.'],
  [14.2, 18.6, 'In a British midsummer it rises *northeast*, is due *south* at noon and sets *northwest*.'],
  [18.8, 23.2, 'So a bird needs a ~body clock~: it says where the Sun should be now, and so which way is home.'],
  [23.4, 27.8, 'The Earth turns *15° an hour*, so sun time changes as you go: noon comes *earlier* further east.'],
  [28.0, 32.4, `At Britain’s latitude, *1,000 km* is ${LON_1000.toFixed(1)}° of longitude, or *${Math.round(MIN_1000)} minutes* of sun time.`],
  [32.6, 37.0, 'Shearwaters fly so fast that sun time shifts quicker than their ~body clocks~ reset: jet lag.'],
  [37.2, 41.6, `Say its ~body clock~ reads *${clockStr(BODY)}*, but here sun time is *${clockStr(BODY + AHEAD)}*: the Sun is further round.`],
  [41.8, 46.2, `Keeping its angle to the Sun, it turns ^${Math.round(ERR)}°^ clockwise. Flying west, it would err anticlockwise.`],
  [46.4, 50.8, 'The team predicted each flight’s error, and the birds veered just as predicted, by up to ^15°^.'],
  [51.0, 55.4, 'It cost only a few kilometres. Errors showed even near familiar coast: they mix sun and land cues.'],
  [55.6, 60.0, 'In a 2018 test, shearwaters whose clocks were shifted at the nest also partly veered going home.'],
  [60.2, 64.6, 'Jet lag is not just tiredness: it’s a clock on the wrong time, and for a navigator, a compass error.'],
];

// ---------- background: a chart of the sea ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sea1); lg.addColorStop(0.75, C.sea0); lg.addColorStop(1, '#03121a');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 36; x < W; x += 72) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 36; y < H; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.strokeStyle = 'rgba(159,227,214,0.07)'; g.lineWidth = 2;
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * 780, w = 14 + r() * 26;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 5, x + w, y); g.stroke();
  }
}

// ---------- pieces ----------
/** A shearwater seen from above, flying towards `heading` (degrees from north, clockwise). */
function bird(x, y, heading, s = 1, flap = 0, col = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(heading * R); ctx.scale(s, s);
  const f = 1 + 0.06 * Math.sin(flap);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -27); ctx.quadraticCurveTo(6, -22, 5, -6);
  ctx.quadraticCurveTo(28 * f, -9, 50 * f, 8); ctx.quadraticCurveTo(28 * f, 3, 5, 9);
  ctx.lineTo(4, 22); ctx.lineTo(0, 28); ctx.lineTo(-4, 22); ctx.lineTo(-5, 9);
  ctx.quadraticCurveTo(-28 * f, 3, -50 * f, 8); ctx.quadraticCurveTo(-28 * f, -9, -5, -6);
  ctx.quadraticCurveTo(-6, -22, 0, -27); ctx.fill();
  ctx.restore();
}

function sunDisc(x, y, r = 22, a = 1, ghost = false) {
  A(a, () => {
    if (ghost) {
      ctx.strokeStyle = C.clock; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      return;
    }
    const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.6);
    g.addColorStop(0, 'rgba(255,230,168,0.9)'); g.addColorStop(0.4, 'rgba(255,196,92,0.35)'); g.addColorStop(1, 'rgba(255,196,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
}

/** Point on a compass ring: azimuth in degrees from north, clockwise. */
const onRing = (cx, cy, r, az) => [cx + r * Math.sin(az * R), cy - r * Math.cos(az * R)];

function compass(cx, cy, r, a = 1) {
  A(a, () => {
    ctx.strokeStyle = 'rgba(242,246,243,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let d = 0; d < 360; d += 15) {
      const big = d % 90 === 0, [x0, y0] = onRing(cx, cy, r - (big ? 16 : 9), d), [x1, y1] = onRing(cx, cy, r, d);
      ctx.strokeStyle = big ? C.soft : C.faint; ctx.lineWidth = big ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    font(700, 34, SERIF);
    for (const [d, l] of [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]) {
      const [x, y] = onRing(cx, cy, r + 30, d);
      text(l, x, y, { color: C.soft, align: 'center' });
    }
  });
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

/** A round clock face showing `hrs`. */
function clockFace(x, y, r, hrs, col, label) {
  ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + Math.sin(a) * (r - 9), y - Math.cos(a) * (r - 9), 2, 0, Math.PI * 2); ctx.fill();
  }
  const ha = ((hrs % 12) / 12) * Math.PI * 2, ma = ((hrs % 1)) * Math.PI * 2;
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * r * 0.78, y - Math.cos(ma) * r * 0.78); ctx.stroke();
  ctx.lineCap = 'butt';
  if (label) { font(600, 22); text(label, x, y + r + 24, { color: col, align: 'center' }); }
}

// ---------- A: the news and the tracks ----------
const COLONY = [250, 520];
const TRACKS = (() => {
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 26 }, (_, i) => {
    const ang = -70 + r() * 150, dist = 260 + r() * 300;
    const x0 = COLONY[0] + Math.cos(ang * R) * dist * 1.25, y0 = COLONY[1] + Math.sin(ang * R) * dist * 0.75;
    const bend = (r() - 0.5) * 120;
    return { x0, y0, bend, t0: 1.0 + i * 0.22 };
  });
})();
function sceneA(t) {
  const a = span(t, 0, 9.6, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(700, 60, SERIF); text('Seabirds with jet lag', 52, 104, { color: C.ink });
    font(400, 24); text('MANX SHEARWATERS · SCIENCE · 29 OCTOBER 2026', 54, 152, { color: C.foam, spacing: '1.5px' });
    // the colony
    ctx.fillStyle = C.land; k.rrect(COLONY[0] - 70, COLONY[1] - 34, 120, 70, 30); ctx.fill();
    ctx.fillStyle = C.land2; k.rrect(COLONY[0] - 50, COLONY[1] - 22, 70, 40, 20); ctx.fill();
    font(600, 22); text('colony', COLONY[0] - 10, COLONY[1] + 56, { color: C.soft, align: 'center' });
    // GPS tracks home, drawn as dotted lines
    for (const tr of TRACKS) {
      const p = eio(seg(t, tr.t0, tr.t0 + 2.4));
      if (p <= 0) continue;
      const mx = (tr.x0 + COLONY[0]) / 2 + tr.bend * 0.6, my = (tr.y0 + COLONY[1]) / 2 - tr.bend * 0.4;
      ctx.fillStyle = 'rgba(159,227,214,0.75)';
      const n = 40;
      for (let i = 0; i <= n * p; i++) {
        const u = i / n, x = (1 - u) ** 2 * tr.x0 + 2 * (1 - u) * u * mx + u * u * COLONY[0], y = (1 - u) ** 2 * tr.y0 + 2 * (1 - u) * u * my + u * u * COLONY[1];
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    // one bird gliding home
    const p = seg(t, 0.4, 9.4), x = lerp(760, 380, p), y = lerp(330, 470, p) + Math.sin(t * 2) * 6;
    bird(x, y, 270 - 18 * (1 - p), 1.3, t * 9);
    A(seg(t, 5.2, 5.8), () => {
      chip(470, 600, 340, 150, () => {
        font(700, 42); text('1,045', 494, 646, { color: C.foam });
        font(400, 22); text('birds', 494, 684, { color: C.soft });
        font(700, 42); text('1,837', 650, 646, { color: C.sun });
        font(400, 22); text('flights home', 650, 684, { color: C.soft });
        font(400, 19); text('tracks drawn here: illustrative', 494, 724, { color: C.faint });
      });
    });
  });
}

// ---------- B: the sun compass ----------
const CB = [432, 450], RB = 236;
function sceneB(t) {
  const a = span(t, 9.6, 23.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    compass(CB[0], CB[1], RB);
    // the Sun's path through a midsummer day: dawn to dusk
    const p = t < 18.6 ? eio(seg(t, 10.2, 18.0)) : 0.35 + 0.18 * eio(seg(t, 19.2, 22.6));
    const hrs = lerp(SUNRISE, SUNSET, p), az = azimuth(hrs);
    ctx.strokeStyle = 'rgba(255,196,92,0.55)'; ctx.lineWidth = 6; ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const hh = lerp(SUNRISE, t < 18.6 ? hrs : SUNSET, i / 120), [x, y] = onRing(CB[0], CB[1], RB - 34, azimuth(hh));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    const [sx, sy] = onRing(CB[0], CB[1], RB - 34, az);
    // ray from the centre to the Sun
    ctx.strokeStyle = 'rgba(255,230,168,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(CB[0], CB[1]); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
    sunDisc(sx, sy, 20);
    // sun time
    chip(52, 150, 250, 92, () => {
      font(400, 22); text('sun time', 74, 178, { color: C.soft });
      font(700, 40); text(clockStr(hrs), 74, 216, { color: C.sun });
    });
    // labels for dawn, noon and dusk
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      font(600, 22);
      const [x1, y1] = onRing(CB[0], CB[1], RB + 66, azimuth(SUNRISE));
      text(`sunrise ${clockStr(SUNRISE)}`, x1 + 8, y1 - 12, { color: C.sunHot, align: 'center' });
      const [x2, y2] = onRing(CB[0], CB[1], RB + 20, 180);
      text('noon', x2 + 64, y2 + 2, { color: C.sunHot });
      const [x3, y3] = onRing(CB[0], CB[1], RB + 66, azimuth(SUNSET));
      text(`sunset ${clockStr(SUNSET)}`, x3 - 8, y3 - 12, { color: C.sunHot, align: 'center' });
    });
    // the bird and its body clock: keep the right angle to the Sun to hold one heading
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      const HOME = 100;
      const [hx, hy] = onRing(CB[0], CB[1], RB - 40, HOME);
      ctx.strokeStyle = C.foam; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(CB[0], CB[1]); ctx.lineTo(hx, hy); ctx.stroke();
      font(600, 24); text('home', hx - 16, hy - 26, { color: C.foam, align: 'center' });
      // the angle between the Sun and home, which the clock tells it
      ctx.strokeStyle = C.clock; ctx.lineWidth = 4;
      const a0 = (HOME - 90) * R, a1 = (az - 90) * R;
      ctx.beginPath(); ctx.arc(CB[0], CB[1], 74, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
      font(600, 24); text(`${Math.round(az - HOME)}°`, CB[0] + Math.cos((a0 + a1) / 2) * 104, CB[1] + Math.sin((a0 + a1) / 2) * 104, { color: C.clock, align: 'center' });
      bird(CB[0], CB[1], HOME, 1.1, t * 8);
      clockFace(694, 196, 46, hrs, C.clock, 'body clock');
    });
    if (t < 18.8) bird(CB[0], CB[1], 100, 1.1, t * 8);
  });
}

// ---------- C: longitude is time ----------
const BAND = { x0: 70, x1: 800, y: 430 };
function sceneC(t) {
  const a = span(t, 23.4, 37.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const lonSpan = 32, X = (lon) => lerp(BAND.x0, BAND.x1, lon / lonSpan);
    font(400, 22); text(`a band of sea at ${LAT}° N, seen from above`, BAND.x0, 180, { color: C.soft });
    // meridians every 2°, labelled every 8°
    for (let lon = 0; lon <= lonSpan; lon += 2) {
      const x = X(lon), big = lon % 8 === 0;
      ctx.strokeStyle = big ? 'rgba(242,246,243,0.4)' : 'rgba(242,246,243,0.14)'; ctx.lineWidth = big ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 610); ctx.stroke();
    }
    // the Earth turns: 15° an hour, so clocks along the band
    A(span(t, 23.6, 28.2, 0.4, 0.4), () => {
      for (const [lon, hrs] of [[0, 12], [15, 13], [30, 14]]) {
        clockFace(X(lon), 318, 40, hrs, C.sun, null);
        font(700, 26); text(clockStr(hrs), X(lon), 384, { color: C.sun, align: 'center' });
        font(400, 22); text(lon === 0 ? 'here' : `${lon}° east`, X(lon), 586, { color: C.soft, align: 'center' });
      }
      font(600, 24); text('sun time at the same moment', X(15), 650, { color: C.sunHot, align: 'center' });
    });
    // 1,000 km = 14.6° = 58 min
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      const xa = X(4), xb = X(4 + LON_1000), y = 470;
      ctx.strokeStyle = C.foam; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa + (xb - xa) * eout(seg(t, 28.2, 29.6)), y); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, y - 16); ctx.lineTo(xa, y + 16); ctx.moveTo(xb, y - 16); ctx.lineTo(xb, y + 16); ctx.stroke();
      font(700, 34); text('1,000 km', (xa + xb) / 2, y - 40, { color: C.foam, align: 'center' });
      A(seg(t, 29.4, 30.0), () => {
        chip((xa + xb) / 2 - 220, y + 40, 440, 70, () => {
          font(700, 30); text(`${LON_1000.toFixed(1)}° of longitude = ${Math.round(MIN_1000)} min`, (xa + xb) / 2, y + 75, { color: C.sun, align: 'center' });
        });
      });
    });
    // the bird flies east: body clock vs sun time drift apart
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      const p = eio(seg(t, 32.8, 36.2)), lon = lerp(2, 2 + 50 / 4, p);
      ctx.strokeStyle = 'rgba(159,227,214,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(X(2), 470); ctx.lineTo(X(lon), 470); ctx.stroke(); ctx.setLineDash([]);
      bird(X(lon), 470, 90, 1.2, t * 9);
      const body = BODY - 50 / 60 + p * 50 / 60 * 0.98, sun = body + (lon - 2) / 15;
      clockFace(250, 300, 46, body, C.clock, 'body clock');
      clockFace(560, 300, 46, sun, C.sun, 'sun time here');
      chip(260, 560, 344, 64, () => {
        font(700, 30); text(`sun time ${Math.round((sun - body) * 60)} min ahead`, 432, 592, { color: C.sunHot, align: 'center' });
      });
    });
  });
}

// ---------- D: the error ----------
const CD = [432, 440], RD = 220;
function sceneD(t) {
  const a = span(t, 37.2, 46.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    compass(CD[0], CD[1], RD);
    const azBody = azimuth(BODY), azSun = azimuth(BODY + AHEAD);
    const [gx, gy] = onRing(CD[0], CD[1], RD - 32, azBody), [sx, sy] = onRing(CD[0], CD[1], RD - 32, azSun);
    // where the body clock expects the Sun
    sunDisc(gx, gy, 20, 1, true);
    font(600, 22); text(`expected at ${clockStr(BODY)}`, gx + 6, gy + 50, { color: C.clock, align: 'center' });
    // where it really is
    A(seg(t, 38.6, 39.4), () => {
      sunDisc(sx, sy, 20);
      font(600, 22); text(`really, at ${clockStr(BODY + AHEAD)}`, sx - 34, sy - 34, { color: C.sunHot, align: 'center' });
    });
    clockFace(110, 220, 44, BODY, C.clock, 'body clock');
    A(seg(t, 38.6, 39.4), () => clockFace(756, 300, 44, BODY + AHEAD, C.sun, 'sun time'));
    // headings: intended east, actual turned clockwise by the same angle
    const HOME = 90, turn = ERR * eio(seg(t, 42.0, 43.6));
    const [ix, iy] = onRing(CD[0], CD[1], RD - 50, HOME), [ax, ay] = onRing(CD[0], CD[1], RD - 50, HOME + turn);
    ctx.strokeStyle = C.foam; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(CD[0], CD[1]); ctx.lineTo(ix, iy); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('home', ix - 4, iy - 24, { color: C.foam, align: 'center' });
    A(seg(t, 41.8, 42.4), () => {
      ctx.strokeStyle = C.err; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(CD[0], CD[1]); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(CD[0], CD[1], 120, (HOME - 90) * R, (HOME + turn - 90) * R); ctx.stroke();
      font(700, 36); text(`${Math.round(turn)}°`, CD[0] + 136, CD[1] + 58, { color: C.err });
      // the angle error at the Sun is the same
      ctx.strokeStyle = 'rgba(255,122,92,0.7)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(CD[0], CD[1], RD - 32, (azBody - 90) * R, (azSun - 90) * R); ctx.stroke();
    });
    bird(CD[0], CD[1], HOME + turn, 1.1, t * 8);
    A(span(t, 44.2, 46.4, 0.4, 0.3), () => {
      chip(470, 128, 260, 58, () => { font(600, 22); text('flying west: anticlockwise', 600, 157, { color: C.clock, align: 'center' }); });
    });
  });
}

// ---------- E: the result ----------
function sceneE(t) {
  const a = span(t, 46.4, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // the result
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      const cx = 432, cy = 470;
      ctx.strokeStyle = C.foam; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(cx - 300, cy); ctx.lineTo(cx + 300, cy); ctx.stroke(); ctx.setLineDash([]);
      const p = eout(seg(t, 46.8, 48.4));
      ctx.strokeStyle = C.err; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx - 300, cy); ctx.lineTo(cx - 300 + 600 * p * Math.cos(15 * R), cy + 600 * p * Math.sin(15 * R)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 300, cy); ctx.lineTo(cx - 300 + 600 * p * Math.cos(15 * R), cy - 600 * p * Math.sin(15 * R)); ctx.stroke();
      font(700, 92, SERIF); text('up to 15°', cx, 250, { color: C.err, align: 'center' });
      font(400, 24); text('off course, as the body-clock error predicted', cx, 318, { color: C.soft, align: 'center' });
      font(600, 22); text('intended course', cx + 150, cy - 18, { color: C.foam });
    });
    // a few km; the coast
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.land; ctx.beginPath(); ctx.moveTo(W, 160);
      for (let y = 160; y <= 700; y += 20) ctx.lineTo(640 + 40 * Math.sin(y / 60) + 20 * Math.sin(y / 23), y);
      ctx.lineTo(W, 700); ctx.closePath(); ctx.fill();
      font(600, 24); text('familiar coast', 740, 140, { color: C.soft, align: 'center' });
      font(400, 19); text('illustrative', 740, 724, { color: C.faint, align: 'center' });
      // track drifting along the coast, then home
      const p = eio(seg(t, 51.2, 54.6));
      ctx.strokeStyle = C.err; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i <= 80 * p; i++) { const u = i / 80, x = lerp(90, 600, u), y = lerp(640, 300, u) + 50 * Math.sin(u * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.strokeStyle = C.foam; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(90, 640); ctx.lineTo(600, 300); ctx.stroke(); ctx.setLineDash([]);
      const u = p, bx = lerp(90, 600, u), by = lerp(640, 300, u) + 50 * Math.sin(u * Math.PI);
      bird(bx, by, 50, 1.0, t * 9);
      chip(80, 170, 250, 68, () => { font(700, 30); text('+ a few km', 205, 204, { color: C.err, align: 'center' }); });
    });
    // 2018: clock shifted at the nest
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      const cx = 432;
      font(700, 64, SERIF); text('2018', cx, 210, { color: C.clock, align: 'center' });
      // a burrow with a bird and a clock turned
      ctx.fillStyle = C.land; k.rrect(cx - 260, 300, 520, 230, 40); ctx.fill();
      ctx.fillStyle = '#0d2621'; ctx.beginPath(); ctx.ellipse(cx - 60, 450, 130, 56, 0, 0, Math.PI * 2); ctx.fill();
      bird(cx - 70, 450, 90, 0.9, 0, '#e7efe9');
      const turned = BODY + 3 * eio(seg(t, 56.4, 58.0));
      clockFace(cx + 160, 410, 52, turned, C.clock, null);
      font(600, 22); text('clock shifted at the nest', cx + 160, 494, { color: C.clock, align: 'center' });
      font(400, 24); text('then homing turned, in part', cx, 590, { color: C.soft, align: 'center' });
    });
    // clock = compass
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      const cx = 432, cy = 430, r = 200;
      compass(cx, cy, r);
      const hrs = BODY + 0.4 * Math.sin((t - 60.2) * 0.9);
      const ha = ((hrs % 12) / 12) * Math.PI * 2;
      ctx.strokeStyle = C.clock; ctx.lineCap = 'round'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ha) * r * 0.55, cy - Math.cos(ha) * r * 0.55); ctx.stroke();
      ctx.strokeStyle = C.err; ctx.lineWidth = 5;
      const ma = (hrs % 1) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ma) * r * 0.82, cy - Math.cos(ma) * r * 0.82); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
      font(700, 44, SERIF); text('the clock is the compass', cx, 140, { color: C.ink, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC(t); sceneD(t); sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.sun, '~': C.clock, '^': C.err } });
  },
});
