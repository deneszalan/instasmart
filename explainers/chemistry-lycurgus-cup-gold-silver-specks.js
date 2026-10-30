// Explainer for chemistry-lycurgus-cup-gold-silver-specks: on 25 October 2026 the Guardian reported that Lisa
// Hollands, a technician at the University of Sheffield, had remade the colour-changing glass of the Lycurgus Cup,
// a 4th-century Roman cage cup in the British Museum that looks jade green in normal light and ruby red when lit
// from behind. Why: specks of a silver-gold alloy far smaller than a light wave take blue and green out of light
// that passes through, and scatter green back from the front. Look: a museum-dark room, jade and ruby for the two
// faces of the glass, brass-gold and silver for the metal. Cinzel (Roman inscriptional capitals) for titles, Lora
// (a calligraphic text serif) for captions and labels.
//
// Facts: The Guardian, "'It's magic': scientists rediscover how to make ancient Roman colour-changing glass"
// (25 October 2026): the 1,600-year-old Lycurgus Cup in the British Museum changes from jade green under normal
// lighting to ruby red when lit from behind; scientists at the University of Sheffield replicated it; Dr Lisa
// Hollands, a technician in the school of chemical, materials and biological engineering; nanoparticles of gold
// and silver; as the molten glass cooled from well over 1,000 °C gold and silver nanocrystals grew; Hollands: the
// particles are much smaller than the wavelengths of light; shone through, they block blue and green and let reds
// and oranges pass; reflected, they scatter light, giving the opaque green; Ian Freestone, emeritus professor of
// archaeological materials at University College London: a similar-coloured glass was replicated in the 1960s,
// Sheffield's is much closer to the actual green and red; the colour depended on conditions and position in the
// furnace, so it would have been very difficult for the Romans to control: "with the Lycurgus glass, they hit
// the jackpot"; Elliot Walker's sculpture at the Millennium Gallery, 6-15 November. University of Sheffield news
// (October 2026): one of only 40 surviving glass cage cups of its period; tiny amounts of gold and silver formed
// layered nanoparticles smaller than the wavelengths of light that absorb strongly, their colour set by their size
// and shape; Hollands varied furnace types, starting materials and oxygen levels, and even added sugar.
// Wikipedia, "Lycurgus Cup" (after D. J. Barber and I. C. Freestone, 1990, analytical transmission electron
// microscopy): particles about 70 nm across; about 330 parts per million of silver and 40 of gold.
// Visible light: wavelengths of about 400 nm (violet) to 700 nm (red).
//
// Computed here: 40 parts per million is 1 g in 25,000 g = 25 kg; green light of 550 nm is 550 / 70 = about 8
// times a speck's width. The cup's outline, its figures and the absorption curve are drawn schematically; the
// sloshing electrons are a picture of the idea, not a simulation.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The news; the cup green in normal light, red lit from behind: dichroic.
//  B 14.0–23.2  The metal: 330 ppm silver, 40 ppm gold; 1 g in 25 kg; specks of 70 nm.
//  C 23.2–37.0  Light waves of 400–700 nm; electrons slosh; blue and green are taken out.
//  D 37.0–46.2  Through: red; from the front: scattered green.
//  E 46.2–64.8  Size and furnace set it; Hollands's trials; Freestone: "they hit the jackpot".
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#0a0d0c', bg1: '#151b19', ink: '#f4efe4', soft: 'rgba(244,239,228,0.74)', faint: 'rgba(244,239,228,0.28)',
  jade: '#3fbf8a', jadeHi: '#9ce8c3', jadeLo: '#155a40', ruby: '#e0304a', rubyHi: '#ff8a7a', rubyLo: '#6e0b1c',
  gold: '#e8c06a', silver: '#c9d1d6', electron: '#8fb8ff', panel: 'rgba(12,16,15,0.9)',
};
const CAPS = 'Cinzel', SERIF = 'Lora';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const SILVER_PPM = 330, GOLD_PPM = 40, SPECK_NM = 70;
const GLASS_KG_PER_G_GOLD = 1e6 / GOLD_PPM / 1000; // 25 kg
const GREEN_NM = 550, TIMES = Math.round(GREEN_NM / SPECK_NM); // 8

const CUES = [
  [0.4, 4.8, 'In news on *25 October 2026*: Sheffield technician *Lisa Hollands* has remade a Roman glass marvel.'],
  [5.0, 9.4, 'The *Lycurgus Cup*, made in the 300s AD and now in the British Museum, looks ~jade green~ in normal light.'],
  [9.6, 14.0, 'But lit from behind, the same glass glows ^ruby red^. Two-coloured glass like this is called *dichroic*.'],
  [14.2, 18.6, `Its secret is a pinch of metal: about *${SILVER_PPM} parts per million* of silver and *${GOLD_PPM}* of gold.`],
  [18.8, 23.2, `That is *1 gram* of gold in *${GLASS_KG_PER_G_GOLD} kilograms* of glass, grown into specks only about *${SPECK_NM} nm* across.`],
  [23.4, 27.8, 'Light is a wave, from about *400 nm* long for violet to *700 nm* for red. The specks are far smaller.'],
  [28.0, 32.4, 'A passing light wave makes the free ~electrons~ in each speck slosh to and fro, like a pushed swing.'],
  [32.6, 37.0, 'They respond most to light of one rhythm, here *blue and green*, and soak up or scatter that light.'],
  [37.2, 41.6, 'Shine light *through* the cup: the blue and green are taken out, and only ^red and orange^ get through.'],
  [41.8, 46.2, 'Light falling on the front is ~scattered~ back by the specks instead, and that light looks ~green~.'],
  [46.4, 50.8, 'The specks’ size and shape set the colour, so they had to grow just right as the glass cooled.'],
  [51.0, 55.4, 'Hollands varied furnaces, ingredients and oxygen, and even added sugar, until her glass did the same.'],
  [55.6, 60.0, '*Ian Freestone* of University College London says the colour changed with the glass’s place in the furnace.'],
  [60.2, 64.6, 'So the Romans could hardly control it. With this cup, he says, ^“they hit the jackpot”^.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 420, 60, W / 2, 420, 700);
  rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // a plinth line
  g.fillStyle = 'rgba(244,239,228,0.05)'; g.fillRect(0, 700, W, 2);
}

// ---------- the cup ----------
const mix = (c1, c2, u) => {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;
};
/** The cup at (cx, top) of height h. `behind` 0 = lit from the front (green), 1 = from behind (red). */
function cup(cx, top, h, behind) {
  const w = h * 0.82, rimY = top + h * 0.06, base = top + h * 0.78;
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, rimY);
    ctx.bezierCurveTo(cx - w / 2, top + h * 0.55, cx - w * 0.28, base, cx, base);
    ctx.bezierCurveTo(cx + w * 0.28, base, cx + w / 2, top + h * 0.55, cx + w / 2, rimY);
    ctx.closePath();
  };
  // glow when lit from behind
  if (behind > 0) A(behind, () => {
    const g = ctx.createRadialGradient(cx, top + h * 0.4, 20, cx, top + h * 0.4, h * 0.9);
    g.addColorStop(0, 'rgba(255,80,90,0.45)'); g.addColorStop(1, 'rgba(255,80,90,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - h, top - h * 0.4, h * 2, h * 1.8);
  });
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, mix(C.jadeLo, C.rubyLo, behind));
  g.addColorStop(0.35, mix(C.jade, C.ruby, behind));
  g.addColorStop(0.55, mix(C.jadeHi, C.rubyHi, behind));
  g.addColorStop(1, mix(C.jadeLo, C.rubyLo, behind));
  body(); ctx.fillStyle = g; ctx.fill();
  // the cage: vines and figures, carved in relief
  ctx.save(); body(); ctx.clip();
  ctx.strokeStyle = `rgba(255,255,255,${0.22 + 0.1 * behind})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const x = cx - w / 2 + (i + 0.5) * (w / 7);
    ctx.beginPath(); ctx.moveTo(x, rimY + 20);
    for (let y = rimY + 20; y < base; y += 12) ctx.lineTo(x + 14 * Math.sin((y - top) / 26 + i), y);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.12 * behind})`;
  for (const [fx, fy, s] of [[-0.22, 0.38, 1], [0.05, 0.42, 1.1], [0.27, 0.36, 0.95]]) {
    const x = cx + fx * w, y = top + fy * h;
    ctx.beginPath(); ctx.arc(x, y - 34 * s, 13 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y + 10 * s, 18 * s, 38 * s, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // gilt rim and foot (added much later)
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.ellipse(cx, rimY, w / 2 + 6, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mix(C.jadeLo, C.rubyLo, behind);
  ctx.beginPath(); ctx.ellipse(cx, rimY, w / 2 - 8, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.fillRect(cx - 10, base - 4, 20, h * 0.1);
  ctx.beginPath(); ctx.ellipse(cx, base + h * 0.12, w * 0.24, 12, 0, 0, TAU); ctx.fill();
}

function lamp(x, y, s = 1, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x, y, 4, x, y, 60 * s);
    g.addColorStop(0, 'rgba(255,250,235,0.95)'); g.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 60 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fffbe9'; ctx.beginPath(); ctx.arc(x, y, 16 * s, 0, TAU); ctx.fill();
  });
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

/** The colour of light of `nm`, roughly. */
function hue(nm, l = 60, a = 1) {
  const h = nm < 440 ? 270 - ((nm - 400) / 40) * 30 : nm < 490 ? 240 - ((nm - 440) / 50) * 60 : nm < 580 ? 180 - ((nm - 490) / 90) * 120 : 60 - ((nm - 580) / 120) * 60;
  return `hsla(${Math.max(0, h)}, 95%, ${l}%, ${a})`;
}
const RAYS = [410, 460, 500, 540, 580, 620, 670];
const taken = (nm) => nm >= 440 && nm <= 560; // blue and green: taken out (schematic)

// ---------- A: the cup, both ways ----------
function sceneA(t) {
  const a = span(t, 0, 14.2, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(700, 52, CAPS); text('The Lycurgus Cup', W / 2, 100, { align: 'center' });
    font(400, 22); text('ROMAN, 4TH CENTURY AD · BRITISH MUSEUM', W / 2, 148, { color: C.gold, align: 'center', spacing: '2px' });
    const behind = eio(seg(t, 9.8, 11.4));
    // the lamp moves from the front (left, low) to behind the cup
    const lx = lerp(150, 432, behind), ly = lerp(560, 360, behind), ls = lerp(1, 0.75, behind);
    if (behind > 0.5) lamp(lx, ly, ls * 1.4);
    cup(432, 220, 400, behind);
    if (behind <= 0.5) {
      lamp(lx, ly, ls);
      A(1 - behind * 2, () => {
        ctx.strokeStyle = 'rgba(255,250,235,0.35)'; ctx.lineWidth = 3;
        for (const dy of [-40, 0, 40]) { ctx.beginPath(); ctx.moveTo(lx + 24, ly + dy * 0.3); ctx.lineTo(300, ly - 120 + dy); ctx.stroke(); }
      });
    }
    A(span(t, 0.4, 5.0, 0.4, 0.4), () => {
      chip(132, 626, 600, 96, () => {
        font(700, 30); text('Lisa Hollands', W / 2, 658, { color: C.ink, align: 'center' });
        font(400, 24); text('technician, University of Sheffield', W / 2, 694, { color: C.soft, align: 'center' });
      });
    });
    A(span(t, 5.0, 9.6, 0.4, 0.3), () => {
      font(600, 28); text('lit from the front', 150, 660, { color: C.jadeHi, align: 'center' });
    });
    A(span(t, 10.6, 14.2, 0.4, 0.4), () => {
      font(600, 28); text('lit from behind', W / 2, 690, { color: C.rubyHi, align: 'center' });
      font(400, 22); text('dichroic: “two-coloured”', W / 2, 190, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- B: the metal ----------
let specks = null;
function makeSpecks() {
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  specks = Array.from({ length: 90 }, () => ({ a: r() * TAU, d: Math.sqrt(r()), s: 2 + r() * 3.5, gold: r() < 0.3 }));
}
function lens(cx, cy, r, zoom) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 10, cx, cy, r);
  g.addColorStop(0, '#2e6e55'); g.addColorStop(1, '#123827');
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (const p of specks) {
    const x = cx + Math.cos(p.a) * p.d * r * 0.95, y = cy + Math.sin(p.a) * p.d * r * 0.95;
    ctx.fillStyle = p.gold ? C.gold : C.silver;
    ctx.beginPath(); ctx.arc(x, y, p.s * zoom, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
}
function sceneB(t) {
  const a = span(t, 14.0, 23.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (!specks) makeSpecks();
    cup(180, 220, 250, 0);
    ctx.strokeStyle = 'rgba(232,192,106,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(240, 330); ctx.lineTo(420, 250); ctx.moveTo(240, 360); ctx.lineTo(420, 560); ctx.stroke();
    lens(590, 400, 190, 1 + 0.6 * eio(seg(t, 19.0, 20.4)));
    font(400, 22); text('the glass, magnified (schematic)', 590, 618, { color: C.soft, align: 'center' });
    A(span(t, 14.2, 18.8, 0.4, 0.3), () => {
      chip(52, 520, 270, 150, () => {
        ctx.fillStyle = C.silver; ctx.beginPath(); ctx.arc(80, 560, 10, 0, TAU); ctx.fill();
        font(700, 30); text(`${SILVER_PPM} ppm`, 102, 560, { color: C.silver });
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(80, 620, 10, 0, TAU); ctx.fill();
        font(700, 30); text(`${GOLD_PPM} ppm`, 102, 620, { color: C.gold });
        font(400, 24); text('silver', 236, 560, { color: C.soft }); text('gold', 236, 620, { color: C.soft });
      });
    });
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      chip(52, 520, 270, 150, () => {
        font(700, 34); text('1 g gold', 72, 558, { color: C.gold });
        font(400, 22); text(`in ${GLASS_KG_PER_G_GOLD} kg of glass`, 72, 600, { color: C.soft });
        font(700, 28); text(`specks ~${SPECK_NM} nm`, 72, 640, { color: C.ink });
      });
    });
  });
}

// ---------- C: waves and swinging electrons ----------
const NM = 0.85; // px per nanometre in the wave picture
function wave(x0, y, nm, amp, phase, a = 1, lw = 4) {
  ctx.strokeStyle = hue(nm, 62, a); ctx.lineWidth = lw; ctx.beginPath();
  const len = nm * NM;
  for (let i = 0; i <= 160; i++) { const x = x0 + (i / 160) * len, yy = y - amp * Math.sin((i / 160) * TAU + phase); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
  ctx.stroke();
}
function sceneC(t) {
  const a = span(t, 23.2, 37.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 1: waves to scale with a speck
    A(span(t, 23.2, 28.0, 0.01, 0.4), () => {
      font(400, 22); text('one wavelength each, to scale with a speck', 70, 170, { color: C.soft });
      const rows = [[400, 'violet 400 nm', 260], [550, 'green 550 nm', 390], [700, 'red 700 nm', 520]];
      for (const [nm, name, y] of rows) {
        wave(70, y, nm, 34, -t * 3);
        font(600, 22); text(name, 70 + nm * NM + 20, y, { color: hue(nm, 70) });
      }
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(70 + (SPECK_NM * NM) / 2, 640, (SPECK_NM * NM) / 2, 0, TAU); ctx.fill();
      font(600, 22); text(`speck ${SPECK_NM} nm`, 70 + SPECK_NM * NM + 18, 640, { color: C.gold });
      font(400, 22); text(`green’s wave is ~${TIMES}× longer`, 380, 640, { color: C.soft });
    });
    // 2: the electrons slosh in time with the wave
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      const cx = 432, cy = 430, r = 120, ph = (t - 28) * 6, shift = 34 * Math.sin(ph);
      wave(20, 260, 700, 40, ph - Math.PI / 2, 0.35, 3);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
      const g = ctx.createRadialGradient(cx + shift, cy, 10, cx + shift, cy, r);
      g.addColorStop(0, 'rgba(143,184,255,0.85)'); g.addColorStop(1, 'rgba(143,184,255,0.0)');
      ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      let s = 5; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 40; i++) {
        const x = cx + (rr() - 0.5) * r * 1.5 + shift, y = cy + (rr() - 0.5) * r * 1.5;
        ctx.fillStyle = C.electron; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
      }
      ctx.restore();
      font(600, 24); text('one speck, enlarged', cx, cy + r + 40, { color: C.gold, align: 'center' });
      font(600, 22); text('electrons', cx + r + 30, cy - 40, { color: C.electron });
      ctx.strokeStyle = C.electron; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 60, cy + r + 80); ctx.lineTo(cx + 60, cy + r + 80); ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + d * 60, cy + r + 80); ctx.lineTo(cx + d * 48, cy + r + 72); ctx.lineTo(cx + d * 48, cy + r + 88); ctx.closePath(); ctx.fillStyle = C.electron; ctx.fill(); }
    });
    // 3: which colours they take
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      const x0 = 90, x1 = 774, y0 = 600, top = 260, X = (nm) => lerp(x0, x1, (nm - 400) / 300);
      for (let nm = 400; nm < 700; nm += 2) { ctx.fillStyle = hue(nm, 55); ctx.fillRect(X(nm), y0 + 10, X(nm + 2) - X(nm) + 1, 30); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath();
      const p = eout(seg(t, 32.8, 34.6));
      for (let nm = 400; nm <= 400 + 300 * p; nm += 3) {
        const v = Math.exp(-(((nm - 510) / 70) ** 2));
        const y = y0 - 10 - v * (y0 - top - 40);
        nm === 400 ? ctx.moveTo(X(nm), y) : ctx.lineTo(X(nm), y);
      }
      ctx.stroke();
      font(600, 24); text('how strongly the specks take light out', W / 2, 200, { color: C.ink, align: 'center' });
      font(400, 22); text('schematic', W / 2, 232, { color: C.faint, align: 'center' });
      font(400, 22); text('400 nm', x0, y0 + 64, { color: C.soft, align: 'center' }); text('700 nm', x1, y0 + 64, { color: C.soft, align: 'center' });
      font(700, 28); text('blue and green', X(560) + 30, top + 60, { color: C.jadeHi });
    });
  });
}

// ---------- D: through, and from the front ----------
function slab(x, y, w, h) {
  ctx.fillStyle = 'rgba(63,191,138,0.28)'; k.rrect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(156,232,195,0.6)'; ctx.lineWidth = 2; k.rrect(x, y, w, h, 12); ctx.stroke();
  if (!specks) makeSpecks();
  for (const p of specks.slice(0, 60)) { ctx.fillStyle = p.gold ? C.gold : C.silver; ctx.beginPath(); ctx.arc(x + 10 + ((p.a / TAU) * (w - 20)), y + 10 + p.d * (h - 20), 2.4, 0, TAU); ctx.fill(); }
}
function eye(x, y, col) {
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x, y, 34, 20, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
}
function sceneD(t) {
  const a = span(t, 37.0, 46.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const sx = 360, sw = 120, top = 220, bot = 640;
    slab(sx, top, sw, bot - top);
    font(400, 22); text('the glass', sx + sw / 2, top - 24, { color: C.soft, align: 'center' });
    if (t < 41.8) {
      lamp(110, 430, 1);
      const p = seg(t, 37.4, 40.0);
      RAYS.forEach((nm, i) => {
        const y = 300 + i * 40, stop = taken(nm) ? sx + 30 + 20 * (i % 3) : 790;
        const x = lerp(140, stop, p);
        ctx.strokeStyle = hue(nm, 60); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(140, y); ctx.lineTo(Math.min(x, stop), y); ctx.stroke();
        if (taken(nm) && x >= stop) { ctx.fillStyle = hue(nm, 80, 0.8); ctx.beginPath(); ctx.arc(stop, y, 8, 0, TAU); ctx.fill(); }
      });
      A(seg(t, 39.6, 40.2), () => { eye(780, 210, C.ruby); font(700, 26); text('you see red', 780, 160, { color: C.rubyHi, align: 'center' }); });
      font(600, 24); text('lamp behind', 110, 520, { color: C.ink, align: 'center' });
    } else {
      // light from the front: green comes back, the rest goes in
      lamp(760, 610, 0.9);
      font(600, 24); text('lamp in front', 760, 690, { color: C.ink, align: 'center' });
      const p = seg(t, 42.0, 44.6);
      RAYS.forEach((nm, i) => {
        const y = 290 + i * 34, x = lerp(740, sx + sw, Math.min(1, p * 2));
        ctx.strokeStyle = hue(nm, 60, 0.85); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(740, 560 - i * 4); ctx.lineTo(x, y); ctx.stroke();
      });
      A(seg(t, 43.0, 43.6), () => {
        const q = seg(t, 43.2, 45.0);
        for (let i = 0; i < 3; i++) {
          const y = 330 + i * 40;
          ctx.strokeStyle = hue(530, 60); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx + sw, y); ctx.lineTo(lerp(sx + sw, 740, q), lerp(y, 220, q)); ctx.stroke();
        }
        eye(780, 210, C.jade); font(700, 26); text('you see green', 760, 160, { color: C.jadeHi, align: 'center' });
        font(600, 24); text('scattered back', 580, 246, { color: C.jadeHi, align: 'center' });
      });
    }
  });
}

// ---------- E: size, the furnace, the jackpot ----------
function furnace(cx, cy, heat) {
  ctx.fillStyle = '#3a2a22'; k.rrect(cx - 220, cy - 150, 440, 300, 40); ctx.fill();
  ctx.fillStyle = '#1b120e'; ctx.beginPath(); ctx.arc(cx, cy + 10, 120, Math.PI, 0); ctx.lineTo(cx + 120, cy + 110); ctx.lineTo(cx - 120, cy + 110); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(cx, cy + 60, 10, cx, cy + 40, 140);
  g.addColorStop(0, `rgba(255,190,90,${0.9 * heat})`); g.addColorStop(1, 'rgba(255,110,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy + 10, 118, Math.PI, 0); ctx.lineTo(cx + 118, cy + 108); ctx.lineTo(cx - 118, cy + 108); ctx.closePath(); ctx.fill();
}
function sceneE(t) {
  const a = span(t, 46.2, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // size sets the colour
    A(span(t, 46.2, 51.0, 0.01, 0.4), () => {
      font(600, 26); text('as the glass cools, the specks grow', W / 2, 200, { color: C.ink, align: 'center' });
      const g = eio(seg(t, 46.6, 49.6));
      for (let i = 0; i < 9; i++) {
        const x = 130 + i * 76, r = 4 + g * (8 + 10 * ((i * 0.618) % 1));
        ctx.fillStyle = i % 3 ? C.silver : C.gold; ctx.beginPath(); ctx.arc(x, 380, r, 0, TAU); ctx.fill();
      }
      font(400, 22); text('size and shape decide which colours they take', W / 2, 520, { color: C.soft, align: 'center' });
      font(400, 22); text('from well over 1,000 °C', W / 2, 560, { color: C.faint, align: 'center' });
    });
    // Hollands's trials
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      furnace(W / 2, 400, 0.6 + 0.4 * Math.sin(t * 3) ** 2);
      font(700, 30); text('trial and error', W / 2, 186, { color: C.gold, align: 'center' });
      const items = ['furnace types', 'ingredients', 'oxygen levels', 'a little sugar'];
      items.forEach((s, i) => A(seg(t, 51.4 + i * 0.6, 51.8 + i * 0.6), () => {
        chip(i % 2 ? 470 : 74, 590 + Math.floor(i / 2) * 64, 320, 52, () => { font(600, 24); text(s, (i % 2 ? 470 : 74) + 160, 616 + Math.floor(i / 2) * 64, { color: C.ink, align: 'center' }); });
      }));
    });
    // Freestone: the place in the furnace
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      furnace(W / 2, 400, 0.8);
      const cols = [C.jade, '#5f9f6f', '#8f8a5a'];
      [[-70, 440], [10, 470], [80, 430]].forEach(([dx, y], i) => {
        ctx.fillStyle = cols[i]; k.rrect(W / 2 + dx - 26, y - 20, 52, 40, 8); ctx.fill();
      });
      font(400, 22); text('the same glass, different spots: different colours', W / 2, 600, { color: C.soft, align: 'center' });
      font(400, 22); text('(schematic)', W / 2, 634, { color: C.faint, align: 'center' });
    });
    // the jackpot
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      cup(300, 230, 360, 0);
      cup(564, 230, 360, 1);
      font(700, 40, CAPS); text('“They hit the jackpot”', W / 2, 150, { color: C.gold, align: 'center' });
      font(400, 22); text('Ian Freestone, University College London', W / 2, 680, { color: C.soft, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [CAPS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC(t); sceneD(t); sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.jadeHi, '^': C.rubyHi } });
  },
});
