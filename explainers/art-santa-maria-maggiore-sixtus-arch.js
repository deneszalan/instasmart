// Explainer for art-santa-maria-maggiore-sixtus-arch (Roma): a legend says that snow on 5 August marked out the plan
// of Santa Maria Maggiore under Pope Liberius (352–366), but no text tells it before the year 1000; the church's own
// mosaics carry better evidence: Old Testament panels along the nave and, on the triumphal arch, a line naming
// "Xystus", Pope Sixtus III (432–440), in a programme honouring Mary just after the Council of Ephesus (431).
// Look: a snowy night in slate violet; the basilica's plan, nave wall and triumphal arch drawn in mosaic colours
// (terracotta, lapis, sage, gold); a time ruler from AD 300 to 1100 on which the clues place brackets.
// Alegreya for captions and the Latin, Source Sans 3 for labels.
//
// Facts:
// - Wikipedia, "Santa Maria Maggiore": on the summit of the Esquiline Hill; one of the four churches with the title of
//   major basilica (with St John Lateran, St Peter's and St Paul outside the Walls); erected just after the Council of
//   Ephesus of 431, which proclaimed Mary Mother of God (Theotokos), and consecrated under Sixtus III; the triumphal
//   arch shows scenes of Christ and the Virgin and carries the inscription "Sixtus Episcopus plebi Dei"; the nave
//   mosaics show Old Testament events; the apse mosaic is Jacopo Torriti's Coronation of the Virgin of 1295; the
//   coffered ceiling by Giuliano da Sangallo is said to be gilded with gold first brought by Columbus, given by
//   Ferdinand and Isabella to Pope Alexander VI; Pope Francis was buried there on 26 April 2025.
// - Wikipedia, "Dedication of the Basilica of Saint Mary Major": the legend (snow on 5 August on the Esquiline, the
//   patrician John and his wife; Masolino shows Pope Liberius marking the outline with a hoe); "there is no reference
//   to the legend before the year 1000"; each 5 August "a shower of white rose petals is dropped from the ceiling".
// - Catholic Encyclopedia (New Advent), "Our Lady of the Snow": the miracle is not mentioned "even by Sixtus III in
//   his eight-lined dedicatory inscription"; the legend "has no historical basis".
// - Wikipedia, "Pope Sixtus III": bishop of Rome from 31 July 432 to 18 August 440; a mosaic in Santa Maria
//   Maggiore bears his name, "Xystus Episcopus Plebi Dei". Wikipedia, "Pope Liberius": 17 May 352 – 24 September 366.
// - Wikipedia, "Late Antique and medieval mosaics in Italy": the nave walls held 42 panels of Old Testament scenes, of
//   which 27 survive; probably from 432–440.
// - W. W. Bishop, "Roman Church Mosaics of the First Nine Centuries", AJA 10 (1906), on LacusCurtius: panels above the
//   architraves; 27 still have mosaics, 12 on the left and 15 on the right; six destroyed by the building of the
//   Borghese and Sixtine chapels; eight of the twelve left panels have two scenes, an upper and a lower; left side
//   Abraham, Isaac, Jacob; right side Moses, the Exodus, Joshua; "At the summit of this arch stands the inscription
//   Xystvs episcopvs plebi Dei"; the arch in four zones, from an enthroned cross with Peter and Paul to Jerusalem and
//   Bethlehem at the bottom.
// Computed here: 1000 − 366 = 634 years from the end of Liberius's papacy to the first record of the legend; 440 − 432
// = 8 years for Sixtus; 42 − 27 = 15 panels lost. Schematic: the plan, the wall, the panel's figures and the arch's
// bands are simplified drawings, not copies of the mosaics.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The basilica's plan at night; snow settles in its outline (the legend).
//  B  9.6–18.6  Liberius traces the plan; the time ruler: 352–366, and the first record after 1000.
//  C 18.8–37.0  The nave wall: panels above the columns; one panel with two scenes; 27 of 42 survive.
//  D 37.2–46.2  The triumphal arch in four bands, with Sixtus's line at its top.
//  E 46.4–60.0  The ruler again: Sixtus III 432–440, Ephesus 431; his dedication never mentions snow.
//  F 60.2–65.0  Petals fall from the coffered ceiling each 5 August.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night1: '#14142b', night2: '#29234a', snow: '#f4f6fb', ink: '#f6f1e7', soft: 'rgba(246,241,231,0.74)', faint: 'rgba(246,241,231,0.24)',
  ice: '#a9cdfa', gold: '#f2c46b', terra: '#c65a4a', rose: '#e9967f', lapis: '#3c5ea8', sky: '#86acd9', sage: '#7fa77a',
  stone: '#e6dccb', stone2: '#c7baa3', shade: '#8f816c', wine: '#7d2e3a', plum: '#5a3f72',
};
const SERIF = 'Alegreya', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const LIBERIUS = [352, 366], SIXTUS = [432, 440], EPHESUS = 431, FIRST_TOLD = 1000, PANELS = 42, SURVIVE = 27, DEDICATION_LINES = 8;
const GAP = FIRST_TOLD - LIBERIUS[1]; // 634 years
const YEARS = SIXTUS[1] - SIXTUS[0]; // 8
const LOST = PANELS - SURVIVE; // 15
if (GAP !== 634 || YEARS !== 8 || LOST !== 15) throw new Error('numbers');

// ---------- small helpers ----------
const rnd = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
function pill(str, x, y, col, { align = 'center', size = 22, bg = 'rgba(20,20,43,0.85)' } = {}) {
  font(700, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = bg; k.rrect(x0 - 10, y - size * 0.82, w + 20, size * 1.64, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}
/** Snowflakes falling across the frame, positions from t only. */
function snowfall(t, a, n = 90) {
  A(a, () => {
    const r = rnd(41);
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, sp = 30 + r() * 40, ph = r() * H, sz = 1.5 + r() * 2.5;
      const y = (ph + t * sp) % 780;
      const x = x0 + Math.sin(t * 0.8 + i) * 12;
      ctx.fillStyle = `rgba(244,246,251,${0.35 + 0.5 * (sz / 4)})`;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
    }
  });
}
/** A robed figure, schematic: body, head, optional halo. */
function figure(x, y, s, col, { halo = false, head = '#e7c9a6' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (halo) { ctx.fillStyle = 'rgba(242,196,107,0.9)'; ctx.beginPath(); ctx.arc(0, -30, 11, 0, TAU); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-11, 22); ctx.quadraticCurveTo(-10, -14, 0, -19); ctx.quadraticCurveTo(10, -14, 11, 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = head; ctx.beginPath(); ctx.arc(0, -27, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

// ---------- the plan of the basilica, from above (apse at the top) ----------
const PLAN = { x: 292, y: 236, w: 280, h: 340, apseR: 66 };
function planPath() {
  const { x, y, w, h, apseR } = PLAN;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w / 2 - apseR, y);
  ctx.arc(x + w / 2, y, apseR, Math.PI, 0);
  ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
}
function planSnow(fill, t) {
  if (fill <= 0) return;
  A(fill, () => {
    ctx.save(); planPath(); ctx.clip();
    ctx.fillStyle = 'rgba(244,246,251,0.92)'; ctx.fillRect(PLAN.x - 80, PLAN.y - 90, PLAN.w + 160, PLAN.h + 180);
    const r = rnd(7);
    for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(169,205,250,${0.25 + r() * 0.35})`; ctx.beginPath(); ctx.arc(PLAN.x - 70 + r() * (PLAN.w + 140), PLAN.y - 80 + r() * (PLAN.h + 160), 1 + r() * 3, 0, TAU); ctx.fill(); }
    ctx.restore();
  });
}
function planLines(a, trace = 1) {
  A(a, () => {
    const { x, y, w, h } = PLAN;
    ctx.strokeStyle = C.ice; ctx.lineWidth = 4; ctx.setLineDash([]);
    // trace the outline progressively
    const len = 2 * (w + h) + Math.PI * PLAN.apseR;
    ctx.setLineDash([len * trace, len]); planPath(); ctx.stroke(); ctx.setLineDash([]);
    // the two rows of columns, dividing the nave from the aisles
    A(clamp(trace * 2 - 1), () => {
      for (const cx of [x + w * 0.25, x + w * 0.75]) for (let i = 0; i < 12; i++) { ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(cx, y + 30 + i * ((h - 50) / 11), 4, 0, TAU); ctx.fill(); }
    });
  });
}

// ---------- the time ruler ----------
const RU = { x0: 70, x1: 794, y0: 300, y1: 1100 };
const RX = (yr) => RU.x0 + ((RU.x1 - RU.x0) * (yr - RU.y0)) / (RU.y1 - RU.y0);
function ruler(y, a) {
  A(a, () => {
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(RU.x0, y); ctx.lineTo(RU.x1, y); ctx.stroke();
    font(600, 22);
    for (let yr = 300; yr <= 1100; yr += 100) {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RX(yr), y - 8); ctx.lineTo(RX(yr), y + 8); ctx.stroke();
      text(yr === 300 ? 'AD 300' : `${yr}`, RX(yr), y + 30, { align: 'center', base: 'middle', color: C.soft });
    }
  });
}
function bracket(y, [a0, a1], col, label, a, { up = true, size = 24, lift = 0 } = {}) {
  A(a, () => {
    const x0 = RX(a0), x1 = Math.max(RX(a1), x0 + 6), d = up ? -1 : 1, mx = (x0 + x1) / 2;
    ctx.fillStyle = col; ctx.fillRect(x0, y - 9, x1 - x0, 18);
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(mx, y + d * 12); ctx.lineTo(mx, y + d * (46 + lift)); ctx.stroke();
    // a label near the left end of the ruler starts at the stem instead of centring on it
    const left = mx < RU.x0 + 90;
    font(700, size); text(label, left ? mx - 14 : mx, y + d * (64 + lift), { align: left ? 'left' : 'center', base: 'middle', color: col });
  });
}

// ---------- A: the plan in the snow ----------
function scenePlan(t) {
  A(span(t, 0, 18.8, 0.5, 0.5), () => {
    font(600, 24); text('SANTA MARIA MAGGIORE · ESQUILINE HILL · ROME', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    // the outline, faint, then filled by snow
    A(1 - seg(t, 9.6, 10.2), () => { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); planPath(); ctx.stroke(); ctx.setLineDash([]); });
    planSnow(seg(t, 3.0, 8.6) * (1 - 0.5 * seg(t, 14.2, 15)), t);
    planLines(seg(t, 9.8, 10.4), eio(seg(t, 10.0, 13.6)));
    A(seg(t, 0.8, 1.4) * (1 - seg(t, 5.0, 5.4)), () => pill('ITS PLAN, SEEN FROM ABOVE', CX, 640, C.soft, { size: 24 }));
    A(seg(t, 5.2, 5.8) * (1 - seg(t, 9.4, 9.8)), () => pill('5 AUGUST, A SUMMER NIGHT', CX, 640, C.ice, { size: 24 }));
    // Liberius with a hoe, tracing the outline
    A(seg(t, 9.8, 10.4) * (1 - seg(t, 14.0, 14.4)), () => {
      const p = eio(seg(t, 10.0, 13.6)), x = PLAN.x - 92, y = lerp(PLAN.y + PLAN.h - 40, PLAN.y + 60, p);
      figure(x, y, 2.6, C.plum, { head: '#e7c9a6' });
      ctx.strokeStyle = '#d8c3a0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 14, y - 30); ctx.lineTo(x + 78, y + 50); ctx.stroke();
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 70, y + 54); ctx.lineTo(x + 94, y + 44); ctx.stroke();
      pill('POPE LIBERIUS, 352–366', CX, 640, C.ice, { size: 24 });
    });
    // the ruler: Liberius's years, and the first written record
    const ry = 736;
    ruler(ry, seg(t, 14.2, 14.8));
    bracket(ry, LIBERIUS, C.ice, 'Liberius', seg(t, 14.6, 15.2), { up: true });
    A(seg(t, 15.6, 16.2), () => {
      const x0 = RX(LIBERIUS[1]), x1 = RX(FIRST_TOLD), y = ry - 96;
      ctx.strokeStyle = C.ice; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, eio(seg(t, 15.6, 17.0))), y); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 16.8, 17.2), () => {
        ctx.fillStyle = C.ice; ctx.beginPath(); ctx.moveTo(x1, ry - 12); ctx.lineTo(x1 - 9, ry - 30); ctx.lineTo(x1 + 9, ry - 30); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.ice; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, ry - 30); ctx.lineTo(x1, y); ctx.stroke();
        font(700, 24); text('first written down', x1, y - 22, { align: 'center', base: 'middle', color: C.ice });
        font(600, 22); text(`${GAP} years later`, (x0 + x1) / 2, y + 20, { align: 'center', base: 'middle', color: C.soft });
      });
    });
  });
}

// ---------- C: the nave wall ----------
const ROBES = [C.terra, C.lapis, C.sage, C.rose, C.plum, '#d9b46a', '#e8e1d2'];
function miniScene(x, y, w, h, seed, { hero = null, heroAt = -1, n = 5 } = {}) {
  // a ground and a sky, and a row of figures
  ctx.fillStyle = '#9cc0e6'; ctx.fillRect(x, y, w, h * 0.62);
  ctx.fillStyle = '#87a66d'; ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
  const r = rnd(seed), s = h / 64;
  for (let i = 0; i < n; i++) {
    const fx = x + w * (0.12 + (0.76 * i) / Math.max(1, n - 1)), fy = y + h * 0.62;
    const isHero = i === heroAt;
    figure(fx, fy, s, isHero ? hero : ROBES[Math.floor(r() * ROBES.length)], { halo: !isHero && r() > 0.7 });
  }
}
function panel(x, y, w, h, seed, { two = true, hero = null, heroUp = -1, heroDown = -1 } = {}) {
  ctx.fillStyle = '#d9a35a'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  if (two) {
    const hh = (h - 4) / 2;
    miniScene(x, y, w, hh, seed, { hero, heroAt: heroUp, n: 4 });
    ctx.fillStyle = '#d9a35a'; ctx.fillRect(x, y + hh, w, 4);
    miniScene(x, y + hh + 4, w, hh, seed + 13, { hero, heroAt: heroDown, n: 4 });
  } else miniScene(x, y, w, h, seed, { n: 5 });
}
function naveWall(t, a) {
  A(a, () => {
    const top = 160, ent = 520, base = 720, bays = 6, bw = (W - 120) / bays;
    // wall
    ctx.fillStyle = C.stone; ctx.fillRect(60, top, W - 120, base - top);
    // windows
    for (let i = 0; i < bays; i++) {
      const cx = 60 + bw * (i + 0.5);
      ctx.fillStyle = '#3a3a62'; ctx.beginPath(); ctx.moveTo(cx - 26, 300); ctx.lineTo(cx - 26, 210); ctx.arc(cx, 210, 26, Math.PI, 0); ctx.lineTo(cx + 26, 300); ctx.closePath(); ctx.fill();
    }
    // panels between pilasters, above the entablature
    for (let i = 0; i < bays; i++) {
      const px = 60 + bw * i + 16;
      panel(px, 330, bw - 32, 168, 100 + i * 7, { two: i % 3 !== 1 });
    }
    // entablature and columns
    ctx.fillStyle = C.stone2; ctx.fillRect(60, ent, W - 120, 22); ctx.fillStyle = C.shade; ctx.fillRect(60, ent + 22, W - 120, 6);
    for (let i = 0; i <= bays; i++) {
      const cx = 60 + bw * i;
      ctx.fillStyle = C.stone; ctx.fillRect(cx - 12, ent + 28, 24, base - ent - 40);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(cx + 3, ent + 28, 8, base - ent - 40);
      ctx.fillStyle = C.stone2; ctx.fillRect(cx - 20, ent + 28, 40, 10); ctx.fillRect(cx - 18, base - 14, 36, 14);
    }
    ctx.fillStyle = '#4d3f55'; ctx.fillRect(60, base, W - 120, 6);
  });
}
function sceneNave(t) {
  A(span(t, 18.6, 37.2, 0.5, 0.4), () => {
    // the wall
    A(1 - seg(t, 27.8, 28.4), () => {
      naveWall(t, seg(t, 18.8, 19.6));
      A(seg(t, 23.4, 24.0), () => {
        pill('PANELS: OLD TESTAMENT STORIES', CX, 112, C.gold, { size: 24 });
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(70, 320, W - 140, 188);
      });
      A(seg(t, 19.2, 19.8) * (1 - seg(t, 23.2, 23.6)), () => pill('THE NAVE WALL', CX, 112, C.soft, { size: 24 }));
    });
    // one panel, big: two scenes, the same hero in both
    A(seg(t, 28.0, 28.6) * (1 - seg(t, 32.4, 32.8)), () => {
      const x = 162, y = 160, w = 540, h = 440;
      panel(x, y, w, h, 77, { two: true, hero: C.wine, heroUp: 1, heroDown: 2 });
      font(700, 24);
      pill('UPPER SCENE', x + w / 2, y - 30, C.gold, { size: 22 });
      pill('LOWER SCENE', x + w / 2, y + h + 34, C.gold, { size: 22 });
      A(seg(t, 29.6, 30.2), () => {
        // rings round the hero, twice
        const hx1 = x + w * (0.12 + 0.76 / 3), hx2 = x + w * (0.12 + 1.52 / 3), hh = (h - 4) / 2;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(hx1, y + hh * 0.5, 62, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(hx2, y + hh + 4 + hh * 0.5, 62, 0, TAU); ctx.stroke();
        pill('the same hero, twice', CX, y + h + 84, C.ink, { size: 22 });
      });
      A(seg(t, 30.4, 31.0), () => { font(500, 22); text('schematic, not a copy of a panel', CX, y + h + 124, { align: 'center', base: 'middle', color: C.soft }); });
    });
    // 42 panels, 27 survive
    A(seg(t, 32.6, 33.2), () => {
      const cols = 7, rows = 6, cw = 92, ch = 74, x0 = CX - (cols * cw) / 2, y0 = 190;
      const r = rnd(5); const order = Array.from({ length: PANELS }, (_, i) => i).sort(() => r() - 0.5);
      const lost = new Set(order.slice(0, LOST));
      const fade = seg(t, 34.2, 35.0);
      for (let i = 0; i < PANELS; i++) {
        const cx = x0 + (i % cols) * cw, cy = y0 + Math.floor(i / cols) * ch;
        const gone = lost.has(i);
        if (gone) A(1 - fade * 0.85, () => panelTile(cx + 6, cy + 6, cw - 12, ch - 12, i));
        else panelTile(cx + 6, cy + 6, cw - 12, ch - 12, i);
        if (gone) A(fade, () => { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.strokeRect(cx + 6, cy + 6, cw - 12, ch - 12); ctx.setLineDash([]); });
      }
      font(800, 40); text(`${PANELS} PANELS`, CX - 140, 148, { align: 'center', base: 'middle', color: C.soft });
      A(fade, () => { font(800, 40); text(`${SURVIVE} SURVIVE`, CX + 150, 148, { align: 'center', base: 'middle', color: C.gold }); });
      A(seg(t, 35.0, 35.6), () => { font(500, 22); text(`${LOST} lost or cut through; which ones not shown`, CX, 662, { align: 'center', base: 'middle', color: C.soft }); });
    });
  });
}
function panelTile(x, y, w, h, i) {
  ctx.fillStyle = '#d9a35a'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = '#9cc0e6'; ctx.fillRect(x, y, w, h * 0.6);
  ctx.fillStyle = '#87a66d'; ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
  for (let j = 0; j < 3; j++) { ctx.fillStyle = ROBES[(i + j * 3) % ROBES.length]; ctx.fillRect(x + w * (0.2 + j * 0.25) - 5, y + h * 0.3, 10, h * 0.42); }
}

// ---------- D: the triumphal arch ----------
const ARCH = { x0: 70, x1: 794, top: 150, base: 700, cx: CX, r: 214 };
function bandFigures(x0, x1, y, h, seed, clipFn) {
  ctx.save(); clipFn(); ctx.clip();
  ctx.fillStyle = y < 260 ? '#2c4f96' : '#d9b46a'; ctx.fillRect(x0, y, x1 - x0, h);
  const r = rnd(seed), s = h / 66;
  for (let x = x0 + 26; x < x1 - 10; x += 34 + r() * 14) figure(x, y + h * 0.66, s, ROBES[Math.floor(r() * ROBES.length)], { halo: r() > 0.75 });
  ctx.restore();
}
function sceneArch(t) {
  A(span(t, 37.0, 46.4, 0.5, 0.4), () => {
    const { x0, x1, top, base, cx, r } = ARCH, crown = base - r - 150;
    const outside = () => { ctx.beginPath(); ctx.rect(x0, top, x1 - x0, base - top); ctx.moveTo(cx + r, base); ctx.arc(cx, base - 150, r, 0, Math.PI, true); ctx.lineTo(cx - r, base); ctx.closePath(); };
    // the wall of the arch
    ctx.save(); outside(); ctx.fillStyle = '#3a2f47'; ctx.fill('evenodd'); ctx.restore();
    // four bands
    const bands = [[top + 10, 92], [top + 112, 92], [top + 214, 92], [top + 316, 92]];
    bands.forEach(([y, h], i) => A(seg(t, 37.6 + i * 0.5, 38.2 + i * 0.5), () => {
      if (i === 0) {
        bandFigures(x0 + 10, x1 - 10, y, h, 300 + i, () => { ctx.beginPath(); ctx.rect(x0 + 10, y, x1 - x0 - 20, h); });
        // the throne medallion at the centre
        ctx.fillStyle = C.lapis; ctx.beginPath(); ctx.arc(cx, y + h / 2, 42, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = C.gold; ctx.fillRect(cx - 16, y + h / 2 - 8, 32, 26); ctx.fillRect(cx - 3, y + h / 2 - 30, 6, 24); ctx.fillRect(cx - 11, y + h / 2 - 24, 22, 5);
      } else {
        const clip = () => { ctx.beginPath(); ctx.rect(x0 + 10, y, x1 - x0 - 20, h); ctx.moveTo(cx + r + 16, base); ctx.arc(cx, base - 150, r + 16, 0, Math.PI, true); ctx.lineTo(cx - r - 16, base); ctx.closePath(); };
        ctx.save(); clip(); ctx.clip('evenodd');
        bandFigures(x0 + 10, x1 - 10, y, h, 300 + i, () => { ctx.beginPath(); ctx.rect(x0 + 10, y, x1 - x0 - 20, h); });
        ctx.restore();
      }
    }));
    // the cities at the bottom corners, with sheep
    A(seg(t, 39.6, 40.2), () => {
      for (const side of [-1, 1]) {
        const bx = side < 0 ? x0 + 70 : x1 - 70, by = top + 470;
        ctx.fillStyle = '#d9b46a'; ctx.fillRect(bx - 50, by - 46, 100, 56);
        ctx.fillStyle = '#e8d3a0'; for (let j = 0; j < 3; j++) ctx.fillRect(bx - 44 + j * 32, by - 66, 24, 22);
        ctx.fillStyle = C.terra; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(bx - 46 + j * 32, by - 66); ctx.lineTo(bx - 32 + j * 32, by - 80); ctx.lineTo(bx - 18 + j * 32, by - 66); ctx.fill(); }
        ctx.fillStyle = '#fff'; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(bx - 30 + j * 30 + side * 40, by + 34, 12, 8, 0, 0, TAU); ctx.fill(); }
      }
    });
    // the red rim of the arch
    ctx.strokeStyle = C.terra; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(cx, base - 150, r + 8, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, base - 150, r + 16, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#3a2f47'; ctx.fillRect(cx - r - 16, base - 150, 2 * r + 32, 150);
    ctx.fillStyle = C.terra; ctx.fillRect(cx - r - 15, base - 150, 14, 150); ctx.fillRect(cx + r + 1, base - 150, 14, 150);
    // the opening: the apse beyond, dim
    ctx.fillStyle = 'rgba(242,196,107,0.12)'; ctx.beginPath(); ctx.arc(cx, base - 150, r, Math.PI, 0); ctx.lineTo(cx + r, base); ctx.lineTo(cx - r, base); ctx.closePath(); ctx.fill();
    A(seg(t, 38.4, 39.0), () => { font(600, 22); text('apse mosaic of 1295 beyond', cx, base - 60, { align: 'center', base: 'middle', color: C.soft }); });
    A(seg(t, 38.8, 39.4) * (1 - seg(t, 41.6, 42.0)), () => pill('THE TRIUMPHAL ARCH · FOUR BANDS', CX, 112, C.gold, { size: 24 }));
    // the inscription at the summit of the arch
    A(seg(t, 41.8, 42.6), () => {
      const w = 470, h = 56, gy = base - 150 - r - 52;
      ctx.fillStyle = '#1e2a55'; ctx.fillRect(cx - w / 2, gy - h / 2, w, h);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(cx - w / 2, gy - h / 2, w, h);
      font(700, 30, SERIF); text('XYSTVS EPISCOPVS PLEBI DEI', cx, gy + 2, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
    });
  });
}

// ---------- E: the ruler with the evidence ----------
function sceneEvidence(t) {
  A(span(t, 46.2, 60.2, 0.5, 0.5), () => {
    const ry = 600;
    ruler(ry, 1);
    // the inscription, pointing down to Sixtus III's years
    A(1 - seg(t, 55.4, 55.9), () => {
      const w = 470, h = 56, gy = 178;
      ctx.fillStyle = '#1e2a55'; ctx.fillRect(CX - w / 2, gy - h / 2, w, h);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(CX - w / 2, gy - h / 2, w, h);
      font(700, 30, SERIF); text('XYSTVS EPISCOPVS PLEBI DEI', CX, gy + 2, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
      A(seg(t, 46.8, 47.6), () => {
        const x = RX((SIXTUS[0] + SIXTUS[1]) / 2), p = eio(seg(t, 46.8, 47.8));
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([7, 7]);
        ctx.beginPath(); ctx.moveTo(CX - 120, gy + h / 2); ctx.lineTo(lerp(CX - 120, x, p), lerp(gy + h / 2, ry - 150, p)); ctx.stroke(); ctx.setLineDash([]);
      });
    });
    bracket(ry, SIXTUS, C.gold, `Sixtus III, ${SIXTUS[0]}–${SIXTUS[1]}`, seg(t, 47.4, 48.0), { up: true, size: 26, lift: 60 });
    A(seg(t, 48.4, 49.0) * (1 - seg(t, 55.4, 55.9)), () => { font(800, 64); text(`${YEARS} YEARS`, RX(440) + 150, 330, { align: 'left', base: 'middle', color: C.gold }); font(500, 26, SERIF); text('when the arch was made', RX(440) + 152, 382, { align: 'left', base: 'middle', color: C.soft }); });
    // Ephesus, 431
    A(seg(t, 51.2, 51.8), () => {
      const x = RX(EPHESUS) - 4;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, ry + 12); ctx.lineTo(x, ry + 70); ctx.stroke();
      font(700, 24); text(`Council of Ephesus, ${EPHESUS}`, x - 8, ry + 92, { align: 'left', base: 'middle', color: C.rose });
      font(500, 24, SERIF); text('Mary, Theotokos: Mother of God', x - 8, ry + 124, { align: 'left', base: 'middle', color: C.soft });
    });
    // the legend, for comparison
    A(seg(t, 55.8, 56.4), () => {
      bracket(ry, LIBERIUS, C.ice, 'Liberius', 1, { up: true });
      const x1 = RX(FIRST_TOLD);
      ctx.fillStyle = C.ice; ctx.beginPath(); ctx.moveTo(x1, ry - 12); ctx.lineTo(x1 - 9, ry - 30); ctx.lineTo(x1 + 9, ry - 30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.ice; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, ry - 30); ctx.lineTo(x1, ry - 50); ctx.stroke();
      font(700, 22); text('legend first written', x1 - 30, ry - 66, { align: 'center', base: 'middle', color: C.ice });
    });
    // Sixtus's dedication: eight lines, no snow
    A(seg(t, 56.2, 56.8), () => {
      const x = 462, y = 120, w = 300, h = 196;
      ctx.fillStyle = 'rgba(230,220,203,0.92)'; ctx.fillRect(x, y, w, h);
      for (let i = 0; i < DEDICATION_LINES; i++) { ctx.fillStyle = 'rgba(90,63,114,0.55)'; ctx.fillRect(x + 24, y + 24 + i * 21, w - 48 - (i % 3) * 30, 8); }
      font(700, 22); text(`SIXTUS’S DEDICATION: ${DEDICATION_LINES} LINES`, x + w / 2, y + h + 26, { align: 'center', base: 'middle', color: C.ink });
      font(700, 22); text('NO SNOW', x + w / 2, y + h + 54, { align: 'center', base: 'middle', color: C.ice });
    });
  });
}

// ---------- F: petals from the ceiling ----------
function scenePetals(t) {
  A(span(t, 60.0, 65.4, 0.5, 0.0), () => {
    // the coffered ceiling, in perspective-free grid
    const x0 = 60, x1 = 804, y0 = 120, rows = 3, cols = 8, cw = (x1 - x0) / cols, ch = 70;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * cw, y = y0 + r * ch;
      ctx.fillStyle = '#b8893c'; ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = '#e8c070'; ctx.fillRect(x + 8, y + 8, cw - 16, ch - 16);
      ctx.fillStyle = '#f6e3a8'; ctx.beginPath(); ctx.arc(x + cw / 2, y + ch / 2, 12, 0, TAU); ctx.fill();
    }
    font(600, 22); text('coffered ceiling, said to be gilded with early gold from the Americas', CX, y0 + rows * ch + 26, { align: 'center', base: 'middle', color: C.soft });
    // petals
    const r = rnd(99);
    for (let i = 0; i < 70; i++) {
      const x0p = 80 + r() * 700, sp = 40 + r() * 50, delay = r() * 2.5, rot = r() * TAU;
      const u = t - 60.4 - delay; if (u < 0) continue;
      const y = y0 + rows * ch + 40 + u * sp; if (y > 760) continue;
      const x = x0p + Math.sin(u * 1.7 + i) * 20;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot + u * 1.3);
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.night1); lg.addColorStop(1, C.night2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'Santa Maria Maggiore, on Rome’s Esquiline Hill, is one of the city’s four major basilicas.'],
  [5.0, 9.4, 'A legend says ~snow~ fell here on a summer night, *5 August*, and marked out its plan.'],
  [9.6, 14.0, 'In the story, Pope Liberius, bishop of Rome from 352 to 366, traced the church in the snow.'],
  [14.2, 18.6, `But no text tells that story before the year ~${FIRST_TOLD}~, over 600 years later.`],
  [18.8, 23.2, 'The church itself holds older evidence: its *mosaics*, pictures made of tiny coloured cubes.'],
  [23.4, 27.8, 'High on the nave walls, panels tell Old Testament stories: Abraham, Jacob, Moses, Joshua.'],
  [28.0, 32.4, 'Many panels hold *two scenes*, one above the other, to be read like a picture strip.'],
  [32.6, 37.0, `Of the ${PANELS} panels, *${SURVIVE}* survive; chapels built later cut through some of the others.`],
  [37.2, 41.6, 'Over the altar, the *triumphal arch* shows the childhood of Christ in four bands.'],
  [41.8, 46.2, 'At its top, a line in Latin: *Xystus episcopus plebi Dei*, ‘Sixtus, bishop, to the people of God’.'],
  [46.4, 50.8, `That is Pope *Sixtus III*, bishop of Rome from ${SIXTUS[0]} to ${SIXTUS[1]}: the arch was made in those ${YEARS} years.`],
  [51.0, 55.4, `Its theme fits: in ${EPHESUS}, the Council of Ephesus had called Mary ^Theotokos^, Mother of God.`],
  [55.6, 60.0, 'And Sixtus’s own eight-line dedication of the church says nothing about ~snow~.'],
  [60.2, 64.6, 'Still, each 5 August, white ~petals~ fall from the ceiling to recall the legendary snow.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    snowfall(t, span(t, 0.0, 18.8, 1.0, 0.6));
    scenePlan(t);
    sceneNave(t);
    sceneArch(t);
    sceneEvidence(t);
    scenePetals(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.ice, '^': C.rose } });
  },
});
