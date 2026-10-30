// Explainer for politics-china-party-pyramid: from 96 million members to one General Secretary. Look: rice
// paper with soft ink-wash clouds, black ink, one vermilion seal colour; each layer of the pyramid is drawn as a
// field of dots, one per person where they fit. Jost for numbers and labels, Lora for captions.
//
// Facts: Wikipedia, "20th Central Committee of the Chinese Communist Party": 205 full members and 171 alternates,
// elected at the 20th National Congress on 22 October 2022; a 24-member Politburo and a 7-member Standing
// Committee; plenums: 1st 23 October 2022 (elected the leadership), 2nd February 2023 (state posts), 3rd July
// 2024 (deepening reform), 4th October 2025 (15th five-year plan); its term runs until the 21st Congress, planned
// for 2027. China Daily (26 September 2022): 2,296 delegates elected to the 20th Congress, from more than 96
// million members. Reuters/Xinhua (21 September 2026): the fifth plenum meets 26–29 October 2026 on "full and
// rigorous party self-governance". Wikipedia, "Central Committee of the Chinese Communist Party": it usually meets
// at least once a year in a plenum; selection is done privately, usually through consultation of the Politburo.
// Xi Jinping has been General Secretary since 2012.
// The pyramid is drawn as elected in 2022, and labelled so. Since then: People's Daily (30 June 2026, from the
// Organization Department): nearly 101.29 million members at the end of 2025. Communiqué of the fifth plenum
// (29 October 2026, Chinese foreign ministry site): 162 members and 117 alternates attended; it confirmed the
// expulsion of 33 people from the party, including Ma Xingrui and Zhang Youxia (former Politburo members, NBC News
// from Reuters, 29 October 2026); ten alternates filled empty seats; Zhang Shengmin was elected to the Politburo.
// It names no change to the Standing Committee, and none of its seven is among those expelled.
//
// Scene plan (58 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 8.6  Hook: the fifth plenum in Beijing, 26–29 October 2026.
//  B  8.6–31.0  The pyramid as elected in 2022, layer by layer: members, Congress, Central Committee, Politburo,
//               Standing Committee.
//  C 31.0–40.0  On paper, elections; in practice, private consultation. Plenums at least once a year.
//  D 40.0–58.0  The five plenums of this Central Committee, and the next Congress in 2027.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#f3eee3', paper2: '#e9e2d2', ink: '#1c1a17', soft: 'rgba(28,26,23,0.66)', faint: 'rgba(28,26,23,0.28)',
  seal: '#c23b22', sealSoft: 'rgba(194,59,34,0.16)', wash: 'rgba(60,60,60,0.06)',
};
const NUM = 'Jost', SERIF = 'Lora';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the layers ----------
const LAYERS = [
  { name: 'Party members', n: 96e6, label: 'more than 96 million', note: 'in 2022' },
  { name: 'National Congress', n: 2296, label: '2,296 delegates', note: 'every five years' },
  { name: 'Central Committee', n: 205, label: '205 members + 171 alternates', note: 'elected 2022' },
  { name: 'Politburo', n: 24, label: '24 members', note: 'elected 2022' },
  { name: 'Standing Committee', n: 7, label: '7 members', note: '' },
  { name: 'General Secretary', n: 1, label: 'Xi Jinping, since 2012', note: '' },
];
// pyramid geometry: layer i is a band, narrowing upwards
const PY = { base: 640, band: 72, gap: 10, w0: 520, w1: 80, cx: 300 };
const bandY = (i) => PY.base - i * (PY.band + PY.gap);
const bandW = (i) => lerp(PY.w0, PY.w1, i / (LAYERS.length - 1));

// ---------- timeline ----------
const T = { A: [0, 8.6], B: [8.6, 31.0], C: [31.0, 40.0], D: [40.0, 58] };
const LAYER_T = [9.0, 13.4, 17.8, 22.2, 22.2, 26.6];
const CUES = [
  [0.4, 4.4, 'From 26 to 29 October 2026, China’s Communist Party held its *fifth plenum*.'],
  [4.6, 8.6, 'It’s one layer of a pyramid that decides who runs the country.'],
  [8.8, 13.2, 'At the base, in 2022: more than *96 million* party members.'],
  [13.4, 17.6, 'Every five years they send about 2,300 delegates to a *National Congress*.'],
  [17.8, 22.0, 'In 2022 the Congress elected a *Central Committee*: 205 members and 171 alternates.'],
  [22.2, 26.4, 'That committee picked the *Politburo*, 24 members, and its *Standing Committee*, 7.'],
  [26.6, 30.8, 'And the *General Secretary*: since 2012, Xi Jinping.'],
  [31.0, 35.4, 'On paper, each layer elects the next. In practice, the choices are made *privately*.'],
  [35.6, 40.0, 'Between congresses the Central Committee meets about once a year, in *plenums*.'],
  [40.2, 44.6, 'This committee’s plenums have chosen leaders, reformed ministries and set a five-year plan.'],
  [44.8, 49.2, 'The fifth was about *party discipline*: “full and rigorous party self-governance”.'],
  [49.4, 53.6, 'Its term ends at the next National Congress, due in *2027*.'],
  [53.8, 57.8, 'There, a new Central Committee is chosen, and the pyramid starts again.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 41; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // ink-wash clouds and paper fibres
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, rad = 80 + r() * 200;
    const rg = g.createRadialGradient(x, y, 0, x, y, rad);
    rg.addColorStop(0, `rgba(70,70,70,${0.025 + r() * 0.035})`); rg.addColorStop(1, 'rgba(70,70,70,0)');
    g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.strokeStyle = 'rgba(120,100,70,0.08)'; g.lineWidth = 1;
  for (let i = 0; i < 400; i++) { const x = r() * W, y = r() * H, l = 10 + r() * 40, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}

/** A seal-style stamp: a red square with characters drawn as strokes would need a CJK font, so it carries a numeral. */
function seal(cx, cy, size, label, a) {
  A(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.06);
    ctx.fillStyle = C.seal; k.rrect(-size / 2, -size / 2, size, size, size * 0.12); ctx.fill();
    ctx.strokeStyle = C.paper; ctx.lineWidth = 4; k.rrect(-size / 2 + 8, -size / 2 + 8, size - 16, size - 16, size * 0.08); ctx.stroke();
    font(700, size * 0.5); text(label, 0, 2, { color: C.paper, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = 1 - seg(t, 8.4, 9.0);
  if (a <= 0) return;
  A(a, () => {
    seal(W / 2, 360, 220, '5', eout(seg(t, 0.2, 1.0)) * back(clamp(seg(t, 0.2, 0.9))));
    A(eout(seg(t, 1.0, 1.8)), () => {
      font(500, 34); text('Fifth plenum · Beijing', W / 2, 530, { align: 'center', base: 'middle' });
      font(400, 28); text('26–29 October 2026', W / 2, 578, { color: C.soft, align: 'center', base: 'middle' });
    });
    A(eout(seg(t, 4.6, 5.4)), () => {
      for (let i = 0; i < LAYERS.length; i++) {
        const y = 716 - i * 18, w = bandW(i) * 0.5;
        ctx.fillStyle = i === 2 ? C.seal : C.faint; ctx.fillRect(W / 2 - w / 2, y, w, 12);
      }
    });
  });
}

function layerDots(i, y, w, h, p) {
  // dots: one per person for the small layers, a dense texture for the big ones
  const L = LAYERS[i], x0 = PY.cx - w / 2;
  if (L.n <= 24) {
    const n = L.n, r = Math.min(13, (w - 20) / (n * 2.6));
    for (let j = 0; j < n; j++) {
      const g = eout(clamp(p * 2 - j / n));
      ctx.fillStyle = i === 5 ? C.seal : C.ink;
      ctx.beginPath(); ctx.arc(PY.cx + (j - (n - 1) / 2) * r * 2.6, y + h / 2, r * g, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  // the Central Committee gets exactly its 205 full members (41 × 5); the bigger layers are a texture
  const cols = i === 2 ? 41 : Math.floor(w / (i === 0 ? 6 : 7)), rows = i === 2 ? 5 : Math.floor(h / (i === 0 ? 6 : 7));
  const shown = cols * rows;
  const total = Math.floor(shown * p);
  ctx.fillStyle = C.ink;
  for (let j = 0; j < total; j++) {
    const c = j % cols, rr = Math.floor(j / cols);
    const x = x0 + (c + 0.5) * (w / cols), yy = y + (rr + 0.5) * (h / rows);
    ctx.beginPath(); ctx.arc(x, yy, i === 0 ? 1.6 : i === 1 ? 2 : 2.6, 0, Math.PI * 2); ctx.fill();
  }
}

function scenePyramid(t) {
  const a = 1 - seg(t, 39.8, 40.6);
  if (a <= 0 || t < 8.6) return;
  A(a, () => {
    LAYERS.forEach((L, i) => {
      const at = LAYER_T[i] + (i === 4 ? 1.4 : 0);
      const p = eout(seg(t, at, at + 1.4));
      if (p <= 0) return;
      const y = bandY(i), w = bandW(i), h = PY.band;
      const focus = t >= at && t < (LAYER_T[i + 1] ?? 31) + (i === 3 ? 0 : 0) ? 1 : 0;
      A(p, () => {
        ctx.fillStyle = i === 5 ? C.sealSoft : 'rgba(255,255,255,0.45)';
        k.rrect(PY.cx - w / 2, y, w, h, 8); ctx.fill();
        ctx.strokeStyle = i === 5 ? C.seal : C.faint; ctx.lineWidth = 2; ctx.stroke();
        layerDots(i, y + 8, w - 16, h - 16, p);
      });
      // labels to the right of each band; they make way for the arrows in part C
      A(p * (1 - seg(t, 31.0, 31.6)), () => {
        const right = true, x = PY.cx + w / 2 + 18;
        const big = L.n >= 1e6 ? '96 million+' : L.n.toLocaleString('en-US');
        font(700, i >= 3 ? 30 : 34); text(i === 5 ? '1' : big, x, y + h / 2 - 14, { color: i === 5 ? C.seal : C.ink, align: right ? 'left' : 'right', base: 'middle' });
        font(500, 21); text(L.name, x, y + h / 2 + 16, { color: C.soft, align: right ? 'left' : 'right', base: 'middle' });
      });
    });
    // the year these numbers are from
    A(eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 31.0, 31.6)), () => {
      font(600, 28); text('The pyramid as elected in 2022', W / 2, 140, { color: C.soft, align: 'center', base: 'middle' });
    });
    // Xi Jinping's name on the top layer
    A(span(t, 27.0, 31.0), () => {
      font(600, 24); text('Xi Jinping, General Secretary since 2012', PY.cx, bandY(5) - 30, { color: C.seal, align: 'center', base: 'middle' });
    });
    // on paper / in practice
    A(span(t, 31.0, 40.0), () => {
      const arrows = (dir, color, label, x) => {
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
        const y0 = dir > 0 ? 710 : 230, y1 = dir > 0 ? 240 : 700;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 12, y1 + 22 * dir); ctx.lineTo(x + 12, y1 + 22 * dir); ctx.closePath(); ctx.fill();
        font(700, 22); ctx.save(); ctx.translate(x + (dir > 0 ? -20 : 20), (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); text(label, 0, 0, { color, align: 'center', base: 'middle' }); ctx.restore();
      };
      arrows(1, C.ink, 'on paper: elected upwards', 640);
      A(eout(seg(t, 33.2, 34.0)), () => arrows(-1, C.seal, 'in practice: chosen at the top', 780));
    });
  });
}

const PLENUMS = [
  ['1st', 'Oct 2022', 'elected the leaders'],
  ['2nd', 'Feb 2023', 'state posts, ministries'],
  ['3rd', 'Jul 2024', 'deepening reform'],
  ['4th', 'Oct 2025', '15th five-year plan'],
  ['5th', 'Oct 2026', 'party discipline'],
];
function scenePlenums(t) {
  const a = eout(seg(t, 40.2, 41.0));
  if (a <= 0) return;
  A(a, () => {
    font(700, 30); text('20th Central Committee, 2022–2027', W / 2, 170, { align: 'center', base: 'middle' });
    const x = 150, y0 = 250, dy = 92;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + dy * 5.2); ctx.stroke();
    PLENUMS.forEach(([n, when, what], i) => {
      const at = 40.6 + i * 0.5, g = eout(seg(t, at, at + 0.4));
      const y = y0 + i * dy, last = i === 4;
      A(g, () => {
        if (last) seal(x, y, 64, '5', 1);
        else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); }
        font(700, 28); text(`${n} plenum`, x + 54, y - 14, { color: last ? C.seal : C.ink, base: 'middle' });
        font(500, 24); text(`${when} · ${what}`, x + 54, y + 18, { color: C.soft, base: 'middle' });
      });
    });
    A(eout(seg(t, 49.4, 50.2)), () => {
      const y = y0 + 5 * dy + 20;
      ctx.strokeStyle = C.seal; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.strokeRect(x - 18, y - 22, 44, 44); ctx.setLineDash([]);
      font(700, 28); text('21st National Congress', x + 54, y - 12, { color: C.seal, base: 'middle' });
      font(500, 24); text('due in 2027: a new Central Committee', x + 54, y + 20, { color: C.soft, base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 58, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    scenePyramid(t);
    scenePlenums(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.seal } });
  },
});
