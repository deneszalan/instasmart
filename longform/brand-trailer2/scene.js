// Reckon trailer, the fast cut: brand direction E (Margin note), cut to the beat of "Rynos Theme" (128 bpm, from 26.11 s).
//   0–3.75      the build: questions scrawled on the page, one a beat
//   3.75–11.25  the music lands: four frames, a bar each, punching in on the key number as the pencil slashes round it
//   11.25–13.1  "Big questions." / "Worked out." slammed on the page
//   13.1–18.75  six more frames, two beats each, whipping from one to the next
//   18.75–20.6  the camera pulls back: the last frame is one card on a heap that runs off every edge, the examples
//               scattered on top of it, more cards landing
//   20.6–       the music cuts out: "Reckon." … "look closer." in near silence, the credit, the page clears
const { seg, ease, lerp, clamp } = Kit;
const W = 1920, H = 1080;
const E = { paper: '#FAFAF7', graphite: '#2E2E33', yellow: '#F4C430', grey: '#8D8D93', soft: '#5B5B63' };
const B = 60 / 128, ENTRY = 8 * B, SLAM = ENTRY + 16 * B, FAST = SLAM + 4 * B, SHEET = FAST + 12 * B, CUT = SHEET + 4 * B;
// the voice (vo.wav, placed by mix.py): "Reckon." and "look closer.", start and length
const VO1 = CUT + 0.2, VO1_LEN = 0.74, VO2 = CUT + 2.25, VO2_LEN = 0.89;
const END = VO2 + VO2_LEN + 2.4, DURATION = END + 0.6;

// Each frame (1920×1080), the loop round its key number [cx, cy, rx, ry], and its question.
const CARDS = [
  { id: '01', loop: [1410, 595, 190, 95], q: 'Only 23 people?' },
  { id: '02', loop: [1318, 600, 105, 62], q: 'Why is the sky blue?' },
  { id: '03', loop: [1236, 452, 305, 96], q: 'Measure the Earth with a shadow?' },
  { id: '04', loop: [1394, 586, 122, 50], q: 'Why does squeezing save fuel?' },
  { id: '05', loop: [1670, 556, 152, 56], q: 'Why faster near the Sun?' },
  { id: '06', loop: [1148, 334, 142, 66], q: 'Wave or particle?' },
  { id: '07', loop: [960, 528, 650, 100], q: 'Forty quadrillion years to crack?' },
  { id: '08', loop: [474, 255, 140, 62], q: 'Why never itself?' },
  { id: '09', loop: [1655, 636, 148, 54], q: 'Why three to one?' },
  { id: '10', loop: [548, 702, 170, 50], q: 'Can Achilles catch the tortoise?' },
];
// the shots: four of a bar, then six of two beats
const SHOTS = CARDS.map((c, j) => (j < 4 ? { c, t0: ENTRY + j * 4 * B, len: 4 * B } : { c, t0: FAST + (j - 4) * 2 * B, len: 2 * B }));
const WHIP = 0.1;   // a whip pan between two frames that follow each other

// the build: questions scrawled one a beat [text, centre x, y, size, tilt]
const PROMPTS = [
  ['Why?', 330, 250, 140, -0.07], ['How far?', 1420, 220, 100, 0.05], ['How do we know?', 900, 430, 112, -0.025],
  ['Says who?', 1530, 620, 96, 0.06], ['Prove it.', 380, 640, 104, 0.035], ['What if?', 1000, 780, 96, -0.05],
  ['How many?', 420, 930, 90, -0.03], ['Show your working.', 1380, 960, 92, 0.03],
];

const images = {};
const imagesReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand-trailer2/frames.js';
  s.onload = () => Promise.all(CARDS.map(({ id }) => new Promise((done, bad) => {
    const im = new Image(); im.onload = () => done(); im.onerror = () => bad(new Error(id)); im.src = window.FRAMES[id]; images[id] = im;
  }))).then(ok, fail);
  s.onerror = () => fail(new Error('brand-trailer2/frames.js')); document.body.appendChild(s);
});

// paper with a faint grain, painted once
let paperBg = null;
function paintPaper() {
  paperBg = document.createElement('canvas'); paperBg.width = W; paperBg.height = H;
  const g = paperBg.getContext('2d'); g.fillStyle = E.paper; g.fillRect(0, 0, W, H);
  let r = 7; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14000; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,55,45,0.035)' : 'rgba(255,255,255,0.5)'; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1); }
}

// A pencil loop, traced in p (0–1) of its length; two passes, as a hand going round twice.
function pencilLoop(ctx, cx, cy, rx, ry, width, p, rot = -0.05, a0 = 0.5) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = E.yellow; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.translate(cx, cy); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, a0, a0 + 5.9 * p); ctx.stroke(); ctx.restore();
}
function doubleLoop(ctx, [cx, cy, rx, ry], width, p) {
  pencilLoop(ctx, cx, cy, rx, ry, width, clamp(p / 0.62), -0.05, 0.5);
  pencilLoop(ctx, cx + rx * 0.03, cy - ry * 0.04, rx * 1.05, ry * 1.06, width * 0.85, clamp((p - 0.5) / 0.5), -0.01, 0.2);
}

// A hit: a jolt of extra zoom and a shake that die away within about a tenth of a second.
const jolt = (u, amount = 0.08) => (u < 0 ? 0 : amount * Math.exp(-u / 0.07));
const shake = (u, px = 10) => (u < 0 ? [0, 0] : [Math.sin(u * 95) * px * Math.exp(-u / 0.08), Math.cos(u * 71) * px * 0.7 * Math.exp(-u / 0.08)]);

// Where the camera is u seconds into a shot: it pushes in, drifting towards the circled number.
function camera(s, u) {
  const p = clamp(u / s.len), [lx, ly] = s.c.loop;
  const z = lerp(s.len > 1 ? 1.06 : 1.14, s.len > 1 ? 1.3 : 1.34, ease.out(p)) * (1 + jolt(u - (s.whip ? WHIP : 0), 0.07));
  const a = lerp(0.2, 0.55, ease.out(p)), hw = W / (2 * z), hh = H / (2 * z);
  return { z, cx: clamp(lerp(W / 2, lx, a), hw, W - hw), cy: clamp(lerp(H / 2, ly, a), hh, H - hh) };
}
function drawFrame(ctx, s, u, dx = 0) {
  const { z, cx, cy } = camera(s, u), [sx, sy] = shake(u - (s.whip ? WHIP : 0), 9);
  ctx.save(); ctx.translate(W / 2 + dx + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-cx, -cy);
  ctx.drawImage(images[s.c.id], 0, 0, 1920, 1080);
  const a = s.len > 1 ? 0.14 : 0.1;
  doubleLoop(ctx, s.c.loop, 19 / z, ease.inOut(seg(u, a + (s.whip ? WHIP : 0), a + 0.32 + (s.whip ? WHIP : 0))));
  ctx.restore();
}
SHOTS.forEach((s, j) => { s.whip = j > 0 && j !== 4; s.dir = j % 2 ? -1 : 1; });

// The question, on a scrap of paper slapped onto the frame.
function tag(k, q, u) {
  const p = ease.out(seg(u, 0, 0.12));
  if (p <= 0) return;
  const { ctx } = k; k.font(400, 62, '"Patrick Hand"');
  const w = ctx.measureText(q).width + 64, x = 120, y = 868;
  ctx.save(); ctx.globalAlpha *= clamp(u / 0.04); ctx.translate(x + w / 2, y + 56); ctx.rotate(-0.022); ctx.scale(lerp(1.25, 1, p), lerp(1.25, 1, p));
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  ctx.fillStyle = E.paper; ctx.fillRect(-w / 2, -56, w, 112); ctx.shadowColor = 'transparent';
  k.text(q, -w / 2 + 32, 20, { color: E.graphite }); ctx.restore();
}

// Text written on from left to right.
function writeOn(k, s, x, y, size, p, { color = E.graphite, family = '"Patrick Hand"', weight = 400, align = 'left' } = {}) {
  if (p <= 0) return;
  const { ctx } = k; k.font(weight, size, family);
  const w = ctx.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (w + 20) * p, size * 2); ctx.clip();
  k.text(s, x0, y, { color }); ctx.restore();
}
// A word slammed onto the page at time a: it drops in from a little larger and lands with a jolt.
function slam(k, s, x, y, size, t, a, { family = 'Lora', weight = 600, color = E.graphite } = {}) {
  const u = t - a; if (u < 0) return;
  const p = ease.out(seg(u, 0, 0.13)), z = lerp(1.32, 1, p);
  const { ctx } = k; ctx.save(); ctx.globalAlpha *= clamp(u / 0.05); ctx.translate(x, y); ctx.scale(z, z);
  k.font(weight, size, family); k.text(s, 0, 0, { color, align: 'center', base: 'middle' }); ctx.restore();
}
// The whole page jolts on each hit in `hits` (times).
function pageShake(ctx, t, hits, px = 12, amount = 0.035) {
  let z = 1, sx = 0, sy = 0;
  for (const h of hits) { z += jolt(t - h, amount); const [a, b] = shake(t - h, px); sx += a; sy += b; }
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
}

const TILT = [-1.8, 1.4, -0.9, 2.1, -1.5, 1.0, -2.2, 1.7, -1.1, 0.8].map((d) => (d * Math.PI) / 180);
// The pile (brand/pile.js): where each example lies on it (world units, 0,0 is the last frame), and three more cards
// landing on top [x, y, tilt, seconds after SHEET].
const HERO_AT = { '01': [-780, -340], '02': [-270, -400], '03': [260, -330], '04': [790, -370], '05': [-590, 30],
  '06': [600, 10], '07': [-780, 380], '08': [-220, 400], '09': [380, 380], '10': [0, 0] };
const DROPS = [[-420, -170, 0.07, 0.95], [440, -180, -0.1, 1.15], [130, 230, 0.05, 1.35]];
let heap = null;
// The camera on the pile: it starts exactly where the last shot ended and pulls back until the heap fills the screen.
function pileView(t) {
  const last = SHOTS[SHOTS.length - 1], c0 = camera(last, last.len), e = ease.inOut(seg(t, SHEET, SHEET + 1.25));
  const Z = Math.exp(lerp(Math.log(c0.z / Pile.S), Math.log(0.86), e)) * lerp(1, 0.95, ease.inOut(seg(t, SHEET + 1.25, CUT)));
  return { Z, cx: lerp((c0.cx - 960) * Pile.S, 0, e), cy: lerp((c0.cy - 540) * Pile.S, 30, e), e };
}
function pile(k, t) {
  const { ctx } = k, v = pileView(t);
  if (!heap) heap = Pile.heap();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(v.Z, v.Z); ctx.translate(-v.cx, -v.cy);
  Pile.drawHeap(ctx, heap, v);
  const loopW = lerp(19, 9, v.e), drawLoop = (c, l, w) => doubleLoop(c, l, w, 1);
  CARDS.forEach((c, j) => { const [x, y] = HERO_AT[c.id]; Pile.card(ctx, images[c.id], x, y, c.id === '10' ? 0 : TILT[j], { zoom: v.Z, loop: c.loop, loopW, drawLoop }); });
  const ids = Object.keys(Pile.images);
  DROPS.forEach(([x, y, rot, at], i) => {
    const a = SHEET + at, p = ease.out(seg(t, a, a + 0.16)); if (t < a) return;
    Pile.card(ctx, Pile.images[ids[(i * 23 + 5) % ids.length]], x, y - (1 - p) * 30, rot * lerp(2, 1, p), { scale: lerp(1.5, 1, p), alpha: clamp((t - a) / 0.05), zoom: v.Z });
  });
  ctx.restore();
  note(k, 'science · history · maths · engineering', W / 2, 985, t - (SHEET + 1.2));
}
// A note on a scrap of paper, centred on (cx, y), slapped down u seconds ago.
function note(k, s, cx, y, u) {
  const p = ease.out(seg(u, 0, 0.12)); if (p <= 0) return;
  const { ctx } = k; k.font(400, 54, '"Patrick Hand"');
  const w = ctx.measureText(s).width + 60;
  ctx.save(); ctx.globalAlpha *= clamp(u / 0.04); ctx.translate(cx, y); ctx.rotate(0.012); ctx.scale(lerp(1.25, 1, p), lerp(1.25, 1, p));
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  ctx.fillStyle = E.paper; ctx.fillRect(-w / 2, -50, w, 100); ctx.shadowColor = 'transparent';
  k.text(s, 0, 18, { color: E.graphite, align: 'center' }); ctx.restore();
}

// The logo lockup, revealed by its progress values.
function lockup(k, cx, cy, size, { write = 1, loop1 = 1, loop2 = 1, tag = 1 } = {}) {
  const { ctx } = k; k.font(600, size, 'Lora');
  const w = ctx.measureText('Reckon').width, rw = ctx.measureText('R').width, x = cx - w / 2, base = cy + size * 0.28;
  if (write > 0) k.text('Reckon', x, base, { color: E.graphite });
  const lx = x + rw / 2, ly = base - 0.34 * size;
  pencilLoop(ctx, lx, ly, rw * 0.5 + size * 0.04, size * 0.46, size * 0.064, loop1, -0.06, 0.5);
  pencilLoop(ctx, lx + size * 0.02, ly - size * 0.014, rw * 0.5 + size * 0.06, size * 0.48, size * 0.055, loop2, -0.02, 0.2);
  writeOn(k, 'look closer', x + w - size * 1.5, base + size * 0.55, size * 0.27, tag, { color: E.soft });
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: ['Lora', 'Patrick Hand'],
  draw(t, k) {
    const { ctx } = k;
    if (!paperBg) paintPaper();
    ctx.drawImage(paperBg, 0, 0);
    if (t < ENTRY) {
      // 1. the build: a question a beat, the page creeping closer, then rushing in on the last beat
      const rush = ease.inOut(seg(t, ENTRY - 0.22, ENTRY));
      ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(1, 1.1, t / ENTRY) * (1 + 1.4 * rush); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      k.alpha(1 - rush, () => PROMPTS.forEach(([s, x, y, size, rot], i) => {
        const a = i * B; if (t < a) return;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        writeOn(k, s, 0, size * 0.3, size, ease.out(seg(t, a, a + 0.24)), { align: 'center' });
        if (i === PROMPTS.length - 1) { k.font(400, size, '"Patrick Hand"'); const w = ctx.measureText(s).width; ctx.strokeStyle = E.yellow; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2, size * 0.55); ctx.lineTo(-w / 2 + w * ease.out(seg(t, a + 0.18, a + 0.4)), size * 0.5); ctx.stroke(); }
        ctx.restore();
      }));
      ctx.restore();
    } else if (t < SLAM || (t >= FAST && t < SHEET)) {
      // 2 and 4. the frames
      const j = SHOTS.findIndex((s) => t >= s.t0 && t < s.t0 + s.len), s = SHOTS[j], u = t - s.t0;
      if (s.whip && u < WHIP) {
        // whip pan: the last frame leaves as the next arrives, smeared along the move
        const q = ease.inOut(u / WHIP), prev = SHOTS[j - 1], n = 6;
        for (let i = 0; i < n; i++) {
          const smear = s.dir * W * 0.1 * Math.sin(Math.PI * q) * (i / (n - 1) - 0.5);
          k.alpha(1 / (i + 1), () => { drawFrame(ctx, prev, prev.len, -s.dir * W * q + smear); drawFrame(ctx, s, u, s.dir * W * (1 - q) + smear); });
        }
      } else {
        drawFrame(ctx, s, u);
        tag(k, s.c.q, u - (s.whip ? WHIP : 0) - (s.len > 1 ? 0.34 : 0.2));
      }
    } else if (t < FAST) {
      // 3. the slams
      ctx.save(); pageShake(ctx, t, [SLAM, SLAM + 2 * B]);
      ctx.translate(W / 2, H / 2); ctx.scale(lerp(1, 1.05, (t - SLAM) / (4 * B)), lerp(1, 1.05, (t - SLAM) / (4 * B))); ctx.translate(-W / 2, -H / 2);
      slam(k, 'Big questions.', W / 2, 430, 190, t, SLAM);
      slam(k, 'Worked out.', W / 2, 660, 190, t, SLAM + 2 * B);
      k.font(600, 190, 'Lora'); const w = ctx.measureText('Worked out.').width, p = ease.out(seg(t, SLAM + 3 * B, SLAM + 3 * B + 0.22));
      if (p > 0) { ctx.strokeStyle = E.yellow; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - w / 2, 772); ctx.quadraticCurveTo(W / 2, 760, W / 2 - w / 2 + w * p, 766 - 6 * p); ctx.stroke(); }
      ctx.restore();
    } else if (t < CUT) {
      // 5. the pile; the last frame's question lifts off as the camera pulls back
      pile(k, t);
      const last = SHOTS[SHOTS.length - 1];
      k.alpha(1 - seg(t, SHEET, SHEET + 0.15), () => tag(k, last.c.q, 1));
    } else {
      // 6. the music stops: the wordmark lands, the pencil goes round its R, and a slow push in to the end
      const out = 1 - ease.inOut(seg(t, END, DURATION));
      k.alpha(out, () => {
        ctx.save(); pageShake(ctx, t, [CUT], 14, 0.05);
        const z = (1 + 0.06 * ease.inOut(seg(t, CUT + 0.3, END))) * lerp(1.22, 1, ease.out(seg(t, CUT, CUT + 0.14)));
        ctx.translate(W / 2, 500); ctx.scale(z, z); ctx.translate(-W / 2, -500);
        k.alpha(clamp((t - CUT) / 0.05), () => lockup(k, W / 2, 470, 250, {
          loop1: ease.inOut(seg(t, VO1 + VO1_LEN + 0.05, VO1 + VO1_LEN + 0.4)), loop2: ease.inOut(seg(t, VO1 + VO1_LEN + 0.3, VO1 + VO1_LEN + 0.62)),
          tag: ease.inOut(seg(t, VO2, VO2 + VO2_LEN)),
        }));
        ctx.restore();
        k.alpha(ease.out(seg(t, VO2 + VO2_LEN + 0.8, VO2 + VO2_LEN + 1.3)), () => {
          k.font(400, 30, '"Patrick Hand"');
          k.text('Music: “Rynos Theme” Kevin MacLeod (incompetech.com) · CC BY 4.0', W / 2, 1000, { color: E.grey, align: 'center' });
        });
      });
    }
  },
});
window.TIMES = { B, ENTRY, SLAM, FAST, SHEET, CUT, VO1, VO2, END, DURATION, SHOTS: SHOTS.map((s) => [s.t0, s.len, s.whip]) };
const fontsReady = window.ready;
const pileReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand/pile.js';
  s.onload = () => window.Pile.ready.then(ok, fail); s.onerror = () => fail(new Error('brand/pile.js')); document.body.appendChild(s);
});
window.ready = Promise.all([fontsReady, imagesReady, pileReady]).then(() => { window.render(0); return true; });
