// Explainer for chemistry-paper-chromatography: a black ink dot on filter paper splits into its dyes as a
// solvent climbs the paper, because each dye travels at its own speed.
// Look: white filter paper under daylight. Soft cotton-fibre texture, a glass beaker of solvent, the wet
// front darkening the paper, dyes blooming in multiply-blended watercolour bands. Jost for captions and
// display, IBM Plex Mono for lab labels.
//
// Sources: Wikipedia, "Paper chromatography" (the post's source): the stationary phase is water held in the
// paper's cellulose fibres; the mobile phase (solvent) travels up by capillary action, carrying the sample;
// more soluble molecules migrate faster; several colours mean several kinds of molecule; Rf = distance
// travelled by the solute ÷ distance travelled by the solvent. Wikipedia, "Chromatography": Mikhail Tsvet
// developed it and coined the term in the first decade of the 20th century, from Greek chroma "colour"
// and graphein "to write"; Martin and Synge, partition chromatography, 1952 Nobel Prize in Chemistry.
// The three dyes are made-up examples (labelled so on screen); their speeds and Rf values come from the
// simulation below, so the strip and the close-up agree.
//
// Scene plan (58.6 s; captions centred at y = 835, nothing important below y = 930):
//  A  0.0–8.7   Hook. A strip of filter paper; a black dot on a pencil line; the strip lowers into a beaker.
//  B  8.4–23.2  The solvent front climbs (fast, then slower); passing the dot, the ink splits into yellow,
//               magenta and blue bands, each a fixed fraction of the solvent's distance.
//  C 22.9–42.6  Close-up diagram: solvent flows up between fibres; molecules hop between moving with the
//               solvent and sticking to the paper. Yellow (rarely sticks) races ahead; blue (often sticks)
//               lags. Their speeds are simulated.
//  D 42.3–48.6  Back on the strip: Rf = dye distance ÷ solvent distance, measured for each band.
//  E 48.3–58.6  Name and history: Tsvet's "colour writing"; Martin and Synge, 1952 Nobel Prize.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#FAF9F4', paperShade: '#ECEAE1', bench: '#DDE3E6', benchDeep: '#C7D0D5', ink: '#1E2638', inkSoft: 'rgba(30,38,56,0.72)', inkDim: 'rgba(30,38,56,0.5)',
  pencil: '#7B7F86', solvent: 'rgba(150,190,220,0.30)', glass: 'rgba(120,150,170,0.55)', wet: 'rgba(140,170,195,0.16)',
  yellow: '#F2C200', magenta: '#D0287A', blue: '#1F7FD0', blueText: '#1B5FA6', magText: '#A61F63',
};
const SANS = 'Jost', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const rrect = (...a) => k.rrect(...a);
const A_ = (a, fn) => k.alpha(a, fn);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the dyes: each molecule hops between moving with the solvent and sticking to the paper ----------
// unstick: chance per step of leaving the paper; stick: chance per step of being caught by it.
const DYES = [
  { name: 'yellow', color: C.yellow, label: '#8A6D00', stick: 0.05, unstick: 0.24 },
  { name: 'magenta', color: C.magenta, label: C.magText, stick: 0.15, unstick: 0.17 },
  { name: 'blue', color: C.blue, label: C.blueText, stick: 0.24, unstick: 0.09 },
];
// The long-run share of time spent moving, which is the dye's Rf: unstick / (stick + unstick).
for (const d of DYES) d.rf = d.unstick / (d.stick + d.unstick);
// Close-up simulation: 20 steps a second.
const SIM = { t0: 24.4, t1: 42.6, hz: 20, v: 32, y0: 668, n: 16 };
const SIM_STEPS = Math.ceil((SIM.t1 - SIM.t0) * SIM.hz) + 1;
const MOL = [];
{
  const r = mulberry32(17);
  for (const [di, d] of DYES.entries()) {
    if (di === 1) continue; // the close-up follows yellow and blue only
    for (let m = 0; m < SIM.n; m++) {
      const lane = (m + 0.5) / SIM.n;
      let y = SIM.y0 + r() * 30, moving = r() < d.rf, x = 0;
      const path = [];
      for (let s = 0; s < SIM_STEPS; s++) {
        path.push([x, y, moving ? 1 : 0]);
        if (moving) { y -= SIM.v / SIM.hz; x += (r() - 0.5) * 3; if (r() < d.stick) moving = false; }
        else if (r() < d.unstick) moving = true;
      }
      MOL.push({ dye: di, lane, path, jitter: r() * 6.28 });
    }
  }
}
// Measured speeds in the close-up, as shares of the solvent's speed.
const simShare = (di) => {
  const ms = MOL.filter((m) => m.dye === di);
  return ms.reduce((s, m) => s + (m.path[0][1] - m.path[SIM_STEPS - 1][1]), 0) / ms.length / (SIM.v * (SIM_STEPS - 1) / SIM.hz);
};
const SHARE = { yellow: simShare(0), blue: simShare(2) };

// ---------- timeline ----------
const T = { A: [0, 8.7], B: [8.4, 23.2], C: [22.9, 42.6], D: [42.3, 48.6], E: [48.3, 58.6] };
const CUES = [
  [0.5, 4.6, 'A dot of *black* ink on filter paper.'],
  [4.7, 8.6, 'Dip the bottom edge in a solvent, and watch.'],
  [8.7, 13.0, 'The solvent creeps up the paper by *capillary action*.'],
  [13.1, 17.6, 'As it passes the dot, the ink splits into ~several colours~.'],
  [17.7, 23.0, 'This black was a mix of dyes, each climbing at its *own speed*.'],
  [23.2, 28.2, 'Zoom in: the solvent flows past the paper’s fibres, carrying the dyes.'],
  [28.3, 33.2, 'A dye that *dissolves well* in the solvent keeps moving.'],
  [33.3, 38.0, 'A dye that ~clings to the paper~ keeps getting stuck and lags.'],
  [38.1, 42.4, 'Different grip, different speed: the mixture *separates*.'],
  [42.6, 48.2, 'Chemists compare dyes by their *Rf*: dye distance ÷ solvent distance.'],
  [48.4, 53.4, 'Botanist Mikhail Tsvet coined the name in the *early 1900s*.'],
  [53.5, 58.4, 'Martin and Synge won the *1952 Nobel Prize* for partition chromatography.'],
];

// ---------- background ----------
let bg = null, paperTex = null;
const STRIP = { x: 312, w: 240, top: 150, bottom: 742, base: 640, surface: 706 };
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#EEF1F2'); lg.addColorStop(1, C.benchDeep);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const r = mulberry32(2);
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(60,80,95,${r() * 0.04})`; g.fillRect(r() * W, r() * H, 2, 2); }
  // window light from the left
  const wl = g.createRadialGradient(80, 200, 40, 80, 260, 760);
  wl.addColorStop(0, 'rgba(255,255,255,0.65)'); wl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = wl; g.fillRect(0, 0, W, H);
  // filter-paper texture for the strip and the close-up
  paperTex = document.createElement('canvas'); paperTex.width = 400; paperTex.height = 900;
  const p = paperTex.getContext('2d');
  p.fillStyle = C.paper; p.fillRect(0, 0, 400, 900);
  for (let i = 0; i < 900; i++) {
    const x = r() * 400, y = r() * 900, a = r() * 6.28, l = 6 + r() * 22;
    p.strokeStyle = `rgba(150,145,130,${0.06 + r() * 0.08})`; p.lineWidth = 0.7;
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  for (let i = 0; i < 3000; i++) { p.fillStyle = `rgba(120,115,100,${r() * 0.05})`; p.fillRect(r() * 400, r() * 900, 1.2, 1.2); }
}

function header() {
  font(600, 24); text('RECKON', 64, 84, { color: C.ink, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(400, 22, MONO); text('CHEMISTRY', 64 + w + 16, 83, { color: C.inkSoft });
}

// ---------- the strip ----------
// The solvent front's height above the surface, rising fast and then slower (as capillary rise does).
const FRONT_T0 = 9.0, FRONT_T1 = 22.6, FRONT_TOP = 196;
function frontY(t) {
  const u = seg(t, FRONT_T0, FRONT_T1);
  return lerp(STRIP.surface, FRONT_TOP, Math.sqrt(u) * 0.35 + u * 0.65 - (u * (1 - u)) * 0.25);
}
const dipP = (t) => eio(seg(t, 4.9, 6.4));
/** The strip, lowered by dip (0 hanging above the beaker .. 1 dipped). */
function strip(t, { a = 1, measure = 0 } = {}) {
  A_(a, () => {
    const dy = (1 - dipP(t)) * -60;
    ctx.save(); ctx.translate(0, dy);
    const { x, w, top, bottom } = STRIP;
    // shadow
    ctx.fillStyle = 'rgba(40,60,70,0.12)'; ctx.fillRect(x + 8, top + 10, w, bottom - top);
    ctx.drawImage(paperTex, 0, 0, w, bottom - top, x, top, w, bottom - top);
    // clip for wet paper and dyes
    ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, bottom - top); ctx.clip();
    const fy = frontY(t) - dy;
    if (fy < bottom) {
      const wg = ctx.createLinearGradient(0, fy - 8, 0, fy + 24);
      wg.addColorStop(0, 'rgba(140,170,195,0)'); wg.addColorStop(0.35, 'rgba(140,170,195,0.30)'); wg.addColorStop(1, 'rgba(140,170,195,0.16)');
      ctx.fillStyle = wg;
      ctx.beginPath(); ctx.moveTo(x, bottom);
      for (let i = 0; i <= 24; i++) { const xx = x + (w * i) / 24; ctx.lineTo(xx, fy + Math.sin(i * 1.3 + t * 0.8) * 2.5 + Math.sin(i * 0.37) * 3); }
      ctx.lineTo(x + w, bottom); ctx.closePath(); ctx.fill();
    }
    // pencil baseline
    ctx.strokeStyle = C.pencil; ctx.lineWidth = 1.6; ctx.setLineDash([2, 0]);
    ctx.beginPath(); ctx.moveTo(x + 20, STRIP.base); ctx.lineTo(x + w - 20, STRIP.base); ctx.stroke();
    // dyes
    const dot = eout(seg(t, 1.0, 1.8));
    const travelled = Math.max(0, STRIP.base - fy);
    ctx.globalCompositeOperation = 'multiply';
    for (const d of DYES) {
      const dist = d.rf * travelled;
      const cy = STRIP.base - dist;
      const sx = 22 + dist * 0.06, sy = 15 + dist * 0.07;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, d.color); g.addColorStop(0.55, d.color); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.translate(x + w / 2, cy); ctx.scale(sx * dot, sy * dot);
      ctx.globalAlpha *= lerp(1, 0.85, seg(dist, 0, 120));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // pencil label
    font(400, 22, MONO); text('pencil line', x + w + 16, STRIP.base + 1, { color: C.inkSoft, base: 'middle' });
    // measurement for Rf
    if (measure > 0) A_(measure, () => {
      const tops = [fy, ...DYES.map((d) => STRIP.base - d.rf * travelled)];
      const xs = [x - 34, x - 34, x - 34, x - 34];
      // solvent distance on the left, dye distances as ticks
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 30, STRIP.base); ctx.lineTo(x - 30, fy); ctx.stroke();
      for (const yy of [STRIP.base, fy]) { ctx.beginPath(); ctx.moveTo(x - 40, yy); ctx.lineTo(x - 20, yy); ctx.stroke(); }
      font(500, 24); text('solvent', x - 48, (STRIP.base + fy) / 2 - 14, { color: C.ink, align: 'right', base: 'middle' });
      text('front', x - 48, (STRIP.base + fy) / 2 + 16, { color: C.ink, align: 'right', base: 'middle' });
      DYES.forEach((d, i) => {
        const yy = tops[i + 1];
        const q = seg(measure, 0.2 + i * 0.2, 0.5 + i * 0.2);
        A_(q, () => {
          ctx.strokeStyle = d.label; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x + w / 2 + 30, yy); ctx.lineTo(x + w + 14, yy); ctx.stroke(); ctx.setLineDash([]);
          font(600, 28); text(`Rf ${d.rf.toFixed(2)}`, x + w + 20, yy + 1, { color: d.label, base: 'middle' });
        });
      });
      ctx.setLineDash([]);
      font(500, 24); text('front', x + w + 20, fy, { color: C.inkSoft, base: 'middle' });
    });
    // clip holding the strip
    ctx.fillStyle = '#9AA3AA'; rrect(x + w / 2 - 34, top - 22, 68, 34, 6); ctx.fill();
    ctx.fillStyle = '#7C858C'; ctx.fillRect(x + w / 2 - 4, top - 90, 8, 70);
    ctx.restore();
  });
}

function beaker(t, a = 1) {
  A_(a, () => {
    const x0 = 230, x1 = 634, y0 = 640, y1 = 790, s = STRIP.surface;
    // solvent
    const lg = ctx.createLinearGradient(0, s, 0, y1);
    lg.addColorStop(0, 'rgba(150,190,220,0.40)'); lg.addColorStop(1, 'rgba(120,165,205,0.55)');
    ctx.fillStyle = lg; ctx.fillRect(x0 + 4, s, x1 - x0 - 8, y1 - s - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 6, s); ctx.lineTo(x1 - 6, s); ctx.stroke();
    // glass
    ctx.strokeStyle = C.glass; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x0 - 10, y0); ctx.lineTo(x0, y0 + 8); ctx.lineTo(x0, y1 - 10); ctx.quadraticCurveTo(x0, y1, x0 + 10, y1); ctx.lineTo(x1 - 10, y1); ctx.quadraticCurveTo(x1, y1, x1, y1 - 10); ctx.lineTo(x1, y0 + 8); ctx.lineTo(x1 + 10, y0); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 12, y0 + 20); ctx.lineTo(x0 + 12, y1 - 20); ctx.stroke();
    font(400, 22, MONO); text('solvent', x1 + 18, s + 30, { color: C.inkSoft, base: 'middle' });
  });
}

// ---------- the close-up ----------
const ZOOM = { x0: 120, x1: 744, y0: 170, y1: 716 };
let fibreCanvas = null;
function paintFibres() {
  fibreCanvas = document.createElement('canvas'); fibreCanvas.width = W; fibreCanvas.height = H;
  const g = fibreCanvas.getContext('2d');
  const r = mulberry32(31);
  for (let i = 0; i < 34; i++) {
    const y = ZOOM.y0 + r() * (ZOOM.y1 - ZOOM.y0), x = ZOOM.x0 - 40 + r() * (ZOOM.x1 - ZOOM.x0 + 80);
    const ang = (r() - 0.5) * 1.1, len = 140 + r() * 240, wd = 10 + r() * 12;
    g.save(); g.translate(x, y); g.rotate(ang);
    const fg = g.createLinearGradient(0, -wd / 2, 0, wd / 2);
    fg.addColorStop(0, 'rgba(225,220,205,0.95)'); fg.addColorStop(0.5, 'rgba(248,246,238,0.98)'); fg.addColorStop(1, 'rgba(205,200,185,0.95)');
    g.fillStyle = fg;
    g.beginPath(); g.moveTo(-len / 2, -wd / 2);
    g.bezierCurveTo(-len / 6, -wd / 2 - 6, len / 6, -wd / 2 + 6, len / 2, -wd / 2);
    g.lineTo(len / 2, wd / 2); g.bezierCurveTo(len / 6, wd / 2 + 6, -len / 6, wd / 2 - 6, -len / 2, wd / 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(160,150,130,0.5)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = 'rgba(170,160,140,0.35)';
    for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(-len / 2 + 10, -wd / 4 + j * wd / 4); g.lineTo(len / 2 - 10, -wd / 4 + j * wd / 4 + (r() - 0.5) * 4); g.stroke(); }
    g.restore();
  }
}
function closeUp(t) {
  if (!fibreCanvas) paintFibres();
  const { x0, x1, y0, y1 } = ZOOM;
  ctx.save();
  rrect(x0, y0, x1 - x0, y1 - y0, 24); ctx.clip();
  const lg = ctx.createLinearGradient(0, y0, 0, y1);
  lg.addColorStop(0, '#D9E8F2'); lg.addColorStop(1, '#C3DAEA');
  ctx.fillStyle = lg; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // flow streaks
  for (let i = 0; i < 18; i++) {
    const x = x0 + 20 + ((i * 37) % (x1 - x0 - 40));
    const y = y1 - (((t * 60 + i * 83) % (y1 - y0 + 80)));
    const sg = ctx.createLinearGradient(0, y, 0, y + 60);
    sg.addColorStop(0, 'rgba(255,255,255,0.7)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 60); ctx.stroke();
  }
  ctx.drawImage(fibreCanvas, 0, 0);
  // molecules
  const hiY = span(t, 28.3, 33.2, 0.4, 0.4), hiB = span(t, 33.3, 38.0, 0.4, 0.4);
  const s = clamp((t - SIM.t0) * SIM.hz, 0, SIM_STEPS - 1), i0 = Math.floor(s), f = s - i0;
  for (const m of MOL) {
    const pa = m.path[i0], pb = m.path[Math.min(i0 + 1, SIM_STEPS - 1)];
    const y = lerp(pa[1], pb[1], f), dx = lerp(pa[0], pb[0], f);
    const x = lerp(x0 + 60, x1 - 60, m.lane) + dx + (m.dye === 0 ? -12 : 12);
    const stuck = !pa[2];
    const d = DYES[m.dye];
    const dim = m.dye === 0 ? hiB * 0.6 : hiY * 0.6;
    A_(1 - dim, () => {
      if (stuck) { ctx.strokeStyle = 'rgba(30,38,56,0.65)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 13, 0, 6.29); ctx.stroke(); }
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.29); ctx.fill();
      ctx.strokeStyle = 'rgba(30,38,56,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();
    });
  }
  ctx.restore();
  // frame and labels
  ctx.strokeStyle = 'rgba(30,38,56,0.55)'; ctx.lineWidth = 2.5; rrect(x0, y0, x1 - x0, y1 - y0, 24); ctx.stroke();
  font(400, 22, MONO);
  text('DIAGRAM, NOT TO SCALE', x0, y0 - 18, { color: C.inkSoft, base: 'middle' });
  // flow arrow
  ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1 + 40, y1 - 40); ctx.lineTo(x1 + 40, y0 + 60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1 + 40, y0 + 44); ctx.lineTo(x1 + 30, y0 + 66); ctx.lineTo(x1 + 50, y0 + 66); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(x1 + 70, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
  text('solvent flow', 0, 0, { color: C.ink, align: 'center', base: 'middle' }); ctx.restore();
  // legend
  const lgA = seg(t, 24.6, 25.2);
  A_(lgA, () => {
    const ly = 748;
    ctx.fillStyle = 'rgba(250,249,244,0.92)'; rrect(x0, ly - 22, x1 - x0, 44, 12); ctx.fill();
    ctx.fillStyle = '#F1EEE3'; ctx.fillRect(x0 + 16, ly - 6, 34, 12);
    text('paper fibre', x0 + 60, ly + 1, { color: C.ink, base: 'middle' });
    ctx.strokeStyle = 'rgba(30,38,56,0.65)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x0 + 262, ly, 12, 0, 6.29); ctx.stroke();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x0 + 262, ly, 8, 0, 6.29); ctx.fill();
    text('stuck to paper', x0 + 284, ly + 1, { color: C.ink, base: 'middle' });
  });
  // speeds
  A_(seg(t, 38.4, 39.0), () => {
    const bx = W / 2 - 160, by = 392;
    ctx.fillStyle = 'rgba(250,249,244,0.94)'; rrect(bx - 10, by - 6, 336, 104, 12); ctx.fill();
    font(600, 26); text(`yellow: ${Math.round(SHARE.yellow * 100)}% of solvent speed`, bx, by + 26, { color: '#8A6D00', base: 'middle' });
    text(`blue: ${Math.round(SHARE.blue * 100)}% of solvent speed`, bx, by + 66, { color: C.blueText, base: 'middle' });
  });
}

// ---------- scenes ----------
function sceneAB(t) {
  beaker(t);
  strip(t);
  A_(span(t, 1.6, 8.6, 0.4, 0.4), () => {
    font(400, 22, MONO); text('black ink', STRIP.x - 18, STRIP.base - 60 * (1 - dipP(t)) + 1, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
}
function sceneD(t) {
  beaker(t);
  strip(t, { measure: seg(t, 43.0, 45.6) });
  A_(seg(t, 44.0, 44.6), () => {
    rrect(64, 166, 300, 128, 14); ctx.fillStyle = 'rgba(250,249,244,0.95)'; ctx.fill(); ctx.strokeStyle = 'rgba(30,38,56,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    font(600, 32); text('Rf =', 84, 230, { color: C.ink, base: 'middle' });
    font(500, 24); text('dye distance', 164, 212, { color: C.ink, base: 'middle' });
    ctx.fillStyle = C.ink; ctx.fillRect(164, 230, 176, 2);
    text('solvent distance', 164, 254, { color: C.ink, base: 'middle' });
  });
  A_(seg(t, 45.8, 46.4), () => { font(400, 22, MONO); text('example dyes', 64, 330, { color: C.inkSoft, base: 'middle' }); });
}
function sceneE(t) {
  const p = eout(seg(t, 48.5, 49.3));
  A_(p * (1 - seg(t, 53.2, 53.7)), () => {
    font(400, 22, MONO); text('GREEK', W / 2, 250, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '4px' });
    font(600, 64); text('chroma', 250, 340, { color: C.magText, align: 'center', base: 'middle' });
    text('graphein', 614, 340, { color: C.blueText, align: 'center', base: 'middle' });
    font(400, 30); text('“colour”', 250, 400, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('“to write”', 614, 400, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(300, 64); text('+', W / 2, 340, { color: C.inkSoft, align: 'center', base: 'middle' });
    const q = eout(seg(t, 49.6, 50.4));
    A_(q, () => {
      font(600, 72); text('chromatography', W / 2, 520 + (1 - q) * 14, { color: C.ink, align: 'center', base: 'middle' });
      font(400, 30); text('“colour writing”', W / 2, 584, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
    // a little bloom of the three dyes
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    DYES.forEach((d, i) => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, d.color); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.translate(W / 2 - 60 + i * 60, 676); const r = 30 * eout(seg(t, 50.0 + i * 0.25, 51.0 + i * 0.25)); ctx.scale(r, r * 0.8);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.29); ctx.fill(); ctx.restore();
    });
    ctx.restore();
  });
  const n = eout(seg(t, 53.6, 54.4));
  A_(n, () => {
    // a medal: a plain disc with a ribbon, no likeness
    const cx = W / 2, cy = 330 + (1 - n) * 14;
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(cx - 40, cy - 150); ctx.lineTo(cx - 10, cy - 60); ctx.lineTo(cx - 70, cy - 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.moveTo(cx + 40, cy - 150); ctx.lineTo(cx + 70, cy - 60); ctx.lineTo(cx + 10, cy - 60); ctx.closePath(); ctx.fill();
    const mg = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, 90);
    mg.addColorStop(0, '#F8E3A0'); mg.addColorStop(0.6, '#D9AE48'); mg.addColorStop(1, '#A57A22');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, 84, 0, 6.29); ctx.fill();
    ctx.strokeStyle = 'rgba(110,75,20,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 70, 0, 6.29); ctx.stroke();
    font(700, 44); text('1952', cx, cy + 2, { color: '#5A3E0E', align: 'center', base: 'middle' });
    font(600, 38); text('Nobel Prize in Chemistry', W / 2, 480, { color: C.ink, align: 'center', base: 'middle' });
    font(400, 32); text('Archer Martin & Richard Synge', W / 2, 530, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('for partition chromatography', W / 2, 572, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(400, 22, MONO);
    text('Dyes in this animation are examples.', W / 2, 670, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('Source: Wikipedia, “Paper chromatography”', W / 2, 702, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 500, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  // a pale band so captions stay crisp over the beaker
  const band = ctx.createLinearGradient(0, 790, 0, 900);
  band.addColorStop(0, 'rgba(238,241,242,0)'); band.addColorStop(0.25, 'rgba(238,241,242,0.88)'); band.addColorStop(1, 'rgba(238,241,242,0.88)');
  ctx.fillStyle = band; ctx.fillRect(0, 790, W, 110);
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.blueText, '~': C.magText } });
  }
}

Kit.scene({
  width: W, height: H, duration: 58.6,
  fonts: [
    { family: SANS, file: 'Jost.woff2', weight: '100 900' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    header();
    const scenes = [[sceneAB, [0, 23.2], 0.01], [closeUp, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      A_(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
