// Explainer for space-mars-cloud-no-dust-seeds: on 7 October 2026 Nature Geoscience published a model of the
// Arsia Mons Elongated Cloud on Mars (Hernández-Bernal, Määttänen, Spiga and Forget, LMD/IPSL and LATMOS, Paris)
// in which the cloud's ice freezes straight out of water vapour, with no dust seeds, something never seen before in
// a planet's atmosphere. The scene explains why clouds usually need seeds and why this one doesn't. Look: a rust
// Martian dawn, a dark volcano, a pale ice-blue ribbon, orange for temperature. Exo 2 for headings and numbers,
// Nunito for the captions.
//
// Facts:
// - Nature Geoscience 19, 1213–1217 (7 October 2026), "Homogeneous ice nucleation from water vapour suggested by
//   elongated clouds on Mars": water-ice clouds are thought to need a pre-existing particle (heterogeneous
//   nucleation); homogeneous nucleation from vapour had never been observed in nature and is thought to need very
//   high supersaturation; adding it to a Martian meteorological model reproduced the cloud; ~200 ice particles per
//   cm³ of ~0.25 µm; dust 0.1 per cm³ in the model layer; "the first evidence of this process for water vapour in a
//   planetary atmosphere"; some features (timing, length) still don't match exactly.
// - Astronomy magazine, 27 October 2026 ("The weird science behind Mars' weirdest cloud"): the cloud forms just
//   after sunrise in spring and summer, a bright head over the volcano's western slope at about 45 km altitude, a
//   tail moving west at about 610 km/h, up to about 1,800 km long and under 200 km wide, lasting about three hours
//   before it detaches and evaporates before afternoon; Arsia Mons is about 20 km high and 435 km across; wind
//   pushes moist air up the slope, cooling it by about 30 °C in 10 minutes to below −143 °C in a compact pocket;
//   about 100,000 times the water the air can hold; Viking Orbiter 2 glimpsed the cloud in 1977 and Mars Express
//   identified it in 2018 with its Visual Monitoring Camera.
// - Science News, 29 October 2026: outside view (Samuel Atwood): homogeneous nucleation "is generally treated in
//   our field as this theoretical concept"; the model is one view and future measurements will add certainty.
// Computed here: the cooling rate (3 °C per minute), the hours the tail takes to reach 1,800 km at 610 km/h
// (about 3), the decay of a parcel's temperature, and the log scale of supersaturation.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  Dawn at Arsia Mons: the ribbon grows west.
//  B  9.2–18.2  Clouds need seeds; the dust models fail.
//  C 18.4–41.2  The parcel climbs, cools 30 °C in 10 minutes, 100,000× supersaturated, freezes on its own.
//  D 41.4–50.4  The tail at 610 km/h; three hours; the cloud lets go.
//  E 50.6–55.0  Earth's clouds, by comparison.
//  F 55.2–60.0  Caveat and claim.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#4a1f12', bg2: '#120806', ink: '#fbf1e6', soft: 'rgba(251,241,230,0.72)', faint: 'rgba(251,241,230,0.24)', line: 'rgba(251,241,230,0.14)',
  ground: '#3a1a10', volcano: '#6a3320', ice: '#cdeeff', iceSoft: 'rgba(205,238,255,0.55)', orange: '#ff9f4a', yellow: '#ffd56b', dust: '#b57a4a', panel: 'rgba(0,0,0,0.38)',
};
const HEAD = 'Exo 2', TXT = 'Nunito';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const LENGTH_KM = 1800, SPEED_KMH = 610, HOURS = LENGTH_KM / SPEED_KMH; // about 2.95 h
const ALT_KM = 45, COOL_C = 30, COOL_MIN = 10, RATE = COOL_C / COOL_MIN; // 3 °C per minute
const T_END = -143, SUPER = 100000, DUST_PER_CM3 = 0.1, CRYSTALS_PER_CM3 = 200;

const CUES = [
  [0.4, 4.6, `Each spring morning on Mars, a cloud grows from the volcano *Arsia Mons*: a ribbon up to ${fmt(LENGTH_KM)} km long.`],
  [4.8, 9.0, 'Viking glimpsed it in 1977 and Mars Express identified it in 2018. On 7 October 2026 came an explanation.'],
  [9.2, 13.6, 'Clouds need ^seeds^: on Earth, every droplet or ice crystal starts on a speck of dust, salt or soot.'],
  [13.8, 18.2, 'Models that grew this cloud on Martian dust could never make its long tail. Something was missing.'],
  [18.4, 22.8, 'A team in Paris added a process textbooks call theoretical: ice forming from vapour with ~no seed at all~.'],
  [23.0, 27.4, 'Wind climbs the volcano’s flank and lifts moist air several kilometres in minutes.'],
  [27.6, 32.0, `The rising air cools by about ^${COOL_C} °C in ${COOL_MIN} minutes^, to below ${T_END} °C, in a pocket over the western slope.`],
  [32.2, 36.6, `That air now holds ~${fmt(SUPER)} times~ more water than it can keep, and at ${ALT_KM} km up there is almost no dust.`],
  [36.8, 41.2, 'So the vapour freezes on its own: hundreds of tiny ice crystals in every cubic centimetre.'],
  [41.4, 45.8, `Winds sweep the crystals west at about ^${SPEED_KMH} km/h^. They neither grow nor melt much, so the cloud stretches.`],
  [46.0, 50.4, 'After about three hours the cold pocket fades, the cloud lets go of the volcano and evaporates.'],
  [50.6, 55.0, 'On Earth, seeds are everywhere, so our clouds form barely over saturation, never 100,000 times over.'],
  [55.2, 60.0, 'The model still misses the cloud’s exact timing and length, but it is the first sign of seedless ice in any planet’s air.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(0.45, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,200,160,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
}

// ---------- the volcano and the ribbon ----------
/** Arsia Mons in profile, west to the left; the cloud's head over the western slope at `headX`, its tail reaching `tail` (0..1) to the left. */
function landscape(y, h, tail, { head = 1, glow = 1 } = {}) {
  // sky band and the ground
  ctx.fillStyle = C.ground; ctx.fillRect(0, y + h, W, 6);
  const vg = ctx.createLinearGradient(0, y, 0, y + h); vg.addColorStop(0, '#8a4a2e'); vg.addColorStop(1, C.volcano);
  ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(0, y + h); ctx.lineTo(300, y + h); ctx.quadraticCurveTo(520, y + h * 0.35, 600, y + h * 0.2); ctx.lineTo(640, y + h * 0.2); ctx.quadraticCurveTo(700, y + h * 0.45, 864, y + h); ctx.closePath(); ctx.fill();
  // the cloud: a head over the western slope and a tail stretching west
  const hx = 520, hy = y + h * 0.26;
  if (tail > 0) {
    const tx = lerp(hx, 20, tail);
    const grd = ctx.createLinearGradient(tx, 0, hx, 0); grd.addColorStop(0, 'rgba(205,238,255,0)'); grd.addColorStop(1, C.iceSoft);
    ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(hx, hy - 16); ctx.lineTo(tx, hy - 6 - 10 * tail); ctx.lineTo(tx, hy + 6 + 10 * tail); ctx.lineTo(hx, hy + 16); ctx.closePath(); ctx.fill();
  }
  A(head, () => { ctx.fillStyle = C.ice; ctx.beginPath(); ctx.ellipse(hx + 8, hy, 34, 20, 0, 0, 7); ctx.fill(); });
  A(glow * 0.5, () => { ctx.fillStyle = C.ice; ctx.beginPath(); ctx.ellipse(hx + 8, hy, 52, 30, 0, 0, 7); ctx.fill(); });
}

// ---------- A: dawn ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('MARS · ARSIA MONS · DAWN', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    // the sun low in the east (right)
    ctx.fillStyle = 'rgba(255,213,107,0.9)'; ctx.beginPath(); ctx.arc(790, 330, 18, 0, 7); ctx.fill();
    landscape(240, 320, eio(seg(t, 1.2, 4.2)));
    A(seg(t, 1.0, 1.6), () => { font(600, 22); text('west', 60, 220, { color: C.faint }); text('east', 804, 220, { align: 'right', color: C.faint }); });
    A(seg(t, 3.8, 4.4), () => {
      font(700, 48); text(`up to ${fmt(LENGTH_KM)} km`, CX, 630, { align: 'center', color: C.ice });
      font(500, 24, TXT); text(`a ribbon of water ice about ${ALT_KM} km up · under 200 km wide`, CX, 676, { align: 'center', color: C.soft });
    });
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 704, 684, 56, 10); ctx.fill();
      font(500, 22, TXT); text('Viking Orbiter 2, 1977 · Mars Express, 2018 · Nature Geoscience, 7 October 2026', CX, 732, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: seeds ----------
function sceneSeeds(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('HOW A CLOUD USUALLY STARTS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // a box of air with vapour molecules; a dust speck; water gathers on it
    const bx = 132, by = 190, bw = 600, bh = 420;
    ctx.fillStyle = 'rgba(205,238,255,0.05)'; k.rrect(bx, by, bw, bh, 14); ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
    let s = 3; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const gather = eio(seg(t, 10.6, 12.6));
    for (let i = 0; i < 70; i++) {
      const x0 = bx + 20 + rnd() * (bw - 40), y0 = by + 20 + rnd() * (bh - 40);
      const dx = CX - x0, dy = by + bh / 2 - y0, d = Math.hypot(dx, dy);
      const pull = i < 30 ? gather * clamp(1 - d / 320) : 0;
      const x = lerp(x0, CX + (dx / d) * 26, pull), y = lerp(y0, by + bh / 2 + (dy / d) * 26, pull);
      ctx.fillStyle = 'rgba(205,238,255,0.8)'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
    }
    A(seg(t, 9.8, 10.4), () => { ctx.fillStyle = C.dust; ctx.beginPath(); ctx.arc(CX, by + bh / 2, 12, 0, 7); ctx.fill(); font(600, 22); text('a speck of dust: the seed', CX, by + bh / 2 + 48, { align: 'center', color: C.dust }); });
    A(seg(t, 12.4, 13.0), () => { font(500, 24, TXT); text('vapour settles on the speck: a droplet or an ice crystal', CX, by + bh - 24, { align: 'center', color: C.soft }); });
    A(seg(t, 14.0, 14.6), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 640, 684, 112, 12); ctx.fill();
      font(600, 26); text('the Martian puzzle', CX, 676, { align: 'center', color: C.orange });
      font(500, 24, TXT); text('seeded clouds in the models never grew the long tail', CX, 718, { align: 'center', color: C.soft });
    });
  });
}

// ---------- C: the parcel ----------
function sceneParcel(t) {
  const a = span(t, 18.4, 41.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE MODEL · A PARCEL OF AIR ON THE WESTERN SLOPE', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    landscape(190, 300, 0, { head: seg(t, 36.8, 37.6), glow: seg(t, 36.8, 37.6) });
    // the parcel climbs the flank from the left foot to the pocket
    const climb = eio(seg(t, 23.2, 26.8));
    const px = lerp(330, 530, climb), py = lerp(482, 268, climb);
    const temp = lerp(-113, T_END, eio(seg(t, 27.8, 31.4)));
    const frozen = seg(t, 37.0, 38.2);
    // the parcel
    const col = temp < -140 ? C.ice : lerp(0, 1, 0) ? C.ice : 'rgba(255,159,74,0.85)';
    ctx.fillStyle = frozen > 0 ? C.ice : `rgba(255,${Math.round(lerp(159, 220, seg(t, 27.8, 31.4)))},${Math.round(lerp(74, 255, seg(t, 27.8, 31.4)))},0.85)`;
    ctx.beginPath(); ctx.arc(px, py, 26, 0, 7); ctx.fill();
    if (frozen > 0) { for (let i = 0; i < 12; i++) { const ang = (i / 12) * Math.PI * 2; ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(px + 40 * frozen * Math.cos(ang), py + 40 * frozen * Math.sin(ang), 4, 0, 7); ctx.fill(); } }
    A(seg(t, 23.4, 24.0), () => { font(600, 22); text('moist air, lifted several km in minutes', 330, 520, { color: C.soft }); });
    // thermometer panel
    A(seg(t, 27.8, 28.4), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 540, 360, 212, 12); ctx.fill();
      font(600, 22); text('temperature', 80, 570, { color: C.soft });
      font(700, 54); text(`${Math.round(temp)} °C`, 80, 624, { color: temp < -140 ? C.ice : C.orange });
      font(500, 22, TXT); text(`cools ${COOL_C} °C in ${COOL_MIN} minutes: ${RATE} °C a minute`, 80, 680, { color: C.soft });
      font(500, 22, TXT); text('too fast for dust to catch up', 80, 714, { color: C.faint });
    });
    // supersaturation panel, log scale
    A(seg(t, 32.4, 33.0), () => {
      ctx.fillStyle = C.panel; k.rrect(444, 540, 360, 212, 12); ctx.fill();
      font(600, 22); text('water vapour vs what the air can hold', 464, 570, { color: C.soft });
      const g = eio(seg(t, 32.6, 35.0));
      const val = Math.pow(10, lerp(0, Math.log10(SUPER), g));
      font(700, 48); text(`${fmt(val)}×`, 464, 622, { color: C.orange });
      // log bar
      const bx = 464, bw = 320;
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; k.rrect(bx, 650, bw, 16, 8); ctx.fill();
      ctx.fillStyle = C.orange; k.rrect(bx, 650, bw * (Math.log10(val) / Math.log10(SUPER)), 16, 8); ctx.fill();
      font(500, 18, TXT); text('1×', bx, 686, { color: C.faint }); text('100,000× (log scale)', bx + bw, 686, { align: 'right', color: C.faint });
      font(500, 22, TXT); text(`dust at ${ALT_KM} km: ${DUST_PER_CM3} grain per cm³`, 464, 722, { color: C.dust });
    });
    A(seg(t, 37.2, 37.8), () => {
      ctx.fillStyle = 'rgba(17,8,6,0.9)'; k.rrect(230, 200, 404, 60, 10); ctx.fill();
      font(700, 28); text(`≈ ${CRYSTALS_PER_CM3} ice crystals per cm³`, CX, 230, { align: 'center', color: C.ice });
    });
  });
}

// ---------- D: the tail ----------
function sceneTail(t) {
  const a = span(t, 41.4, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE TAIL', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const grow = eio(seg(t, 41.6, 45.4)), release = eio(seg(t, 46.6, 49.0));
    ctx.save();
    if (release > 0) ctx.translate(-220 * release, 0);
    landscape(230, 320, grow, { head: 1 - release, glow: 1 - release });
    ctx.restore();
    if (release > 0) { ctx.fillStyle = C.ground; ctx.fillRect(0, 550, W, 6); }
    const km = Math.round(LENGTH_KM * grow);
    A(seg(t, 41.8, 42.4), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 600, 744, 150, 12); ctx.fill();
      font(700, 44); text(`${fmt(km)} km`, 80, 646, { color: C.ice });
      font(500, 24, TXT); text(`at ${SPEED_KMH} km/h westward: ${fmt(LENGTH_KM)} km takes about ${HOURS.toFixed(1)} hours`, 80, 694, { color: C.soft });
      font(500, 22, TXT); text(release > 0.3 ? 'the cold pocket fades · the cloud detaches and evaporates' : 'the crystals neither grow nor evaporate much', 80, 728, { color: release > 0.3 ? C.orange : C.faint });
    });
  });
}

// ---------- E + F: Earth and the caveat ----------
function sceneEarth(t) {
  const a = eout(seg(t, 50.6, 51.4));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('EARTH AND MARS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const rows = [['Earth’s clouds', 'seeds everywhere: dust, salt, soot', 'barely over saturation', C.dust, 50.8], ['Arsia Mons cloud', `${DUST_PER_CM3} dust grain per cm³ at ${ALT_KM} km`, `${fmt(SUPER)}× over, freezes on its own`, C.ice, 51.6]];
    rows.forEach(([name, seeds, need, col, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const y = 200 + i * 200;
      ctx.fillStyle = C.panel; k.rrect(60, y, 744, 170, 14); ctx.fill();
      font(700, 32); text(name, 86, y + 46, { color: col });
      font(500, 24, TXT); text(seeds, 86, y + 96, { color: C.ink });
      font(500, 24, TXT); text(need, 86, y + 138, { color: C.soft });
    }));
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 610, 744, 140, 12); ctx.fill();
      font(600, 24); text('a model, not yet a measurement', CX, 648, { align: 'center', color: C.orange });
      font(500, 22, TXT); text('its timing and length still differ from what the cameras see', CX, 690, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('Hernández-Bernal et al., Nature Geoscience, 7 October 2026', CX, 724, { align: 'center', color: C.faint });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneSeeds(t);
    sceneParcel(t);
    sceneTail(t);
    sceneEarth(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.orange, '~': C.ice, '^': C.yellow } });
  },
});
