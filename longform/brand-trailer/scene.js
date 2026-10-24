// Reckon channel trailer, 33 s, brand direction E (Margin note).
//   0.25–22.75  ten moments from the long videos, pasted onto the page one after another; a pencil loop circles
//               the key number and a handwritten question appears under each
//   22.75–27    the ten gather into a contact sheet: "Ten questions, worked out."
//   27–30.5     the logo sting: "Reckon" is written, the loop goes round its R, "look closer"
//   30.5–33     end card with the music credit, then the page clears
const { seg, ease, lerp, clamp } = Kit;
const W = 1920, H = 1080, DURATION = 33;
const E = { paper: '#FAFAF7', graphite: '#2E2E33', yellow: '#F4C430', grey: '#8D8D93', soft: '#5B5B63' };

// Each card: a frame from one of the videos (1920×1080 coordinates), the loop round its key number
// [cx, cy, rx, ry], and the question written under it.
const CARDS = [
  { id: '01', loop: [1410, 595, 190, 95], q: 'Only 23 people?' },
  { id: '02', loop: [1318, 600, 105, 62], q: 'Why is the sky blue?' },
  { id: '03', loop: [1258, 446, 192, 86], q: 'Measure the Earth with a shadow?' },
  { id: '04', loop: [1394, 586, 122, 50], q: 'Why does squeezing save fuel?' },
  { id: '05', loop: [1670, 556, 152, 56], q: 'Why faster near the Sun?' },
  { id: '06', loop: [1148, 334, 142, 66], q: 'Wave or particle?' },
  { id: '07', loop: [960, 528, 650, 100], q: 'Forty quadrillion years to crack?' },
  { id: '08', loop: [474, 255, 140, 62], q: 'Why never itself?' },
  { id: '09', loop: [1655, 636, 148, 54], q: 'Why three to one?' },
  { id: '10', loop: [548, 702, 170, 50], q: 'Can Achilles catch the tortoise?' },
];
const START = 0.25, STEP = 2.25, GATHER = START + CARDS.length * STEP;   // 22.75
const TILT = [-1.8, 1.4, -0.9, 2.1, -1.5, 1.0, -2.2, 1.7, -1.1, 0.8].map((d) => (d * Math.PI) / 180);
const PILE = { x: 960, y: 455, s: 0.74 };
const GRID = { s: 0.172, gap: 26 };
const gridPos = (j) => {
  const w = 1920 * GRID.s, h = 1080 * GRID.s, x0 = (W - (5 * w + 4 * GRID.gap)) / 2 + w / 2;
  return { x: x0 + (j % 5) * (w + GRID.gap), y: 330 + Math.floor(j / 5) * (h + GRID.gap + 6) };
};

const images = {};
const imagesReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand-trailer/frames.js';
  s.onload = () => Promise.all(CARDS.map(({ id }) => new Promise((done, bad) => {
    const im = new Image(); im.onload = () => done(); im.onerror = () => bad(new Error(id)); im.src = window.FRAMES[id]; images[id] = im;
  }))).then(ok, fail);
  s.onerror = () => fail(new Error('brand-trailer/frames.js')); document.body.appendChild(s);
});

// paper with a faint grain, painted once
let paperBg = null;
function paintPaper() {
  paperBg = document.createElement('canvas'); paperBg.width = W; paperBg.height = H;
  const g = paperBg.getContext('2d'); g.fillStyle = E.paper; g.fillRect(0, 0, W, H);
  let r = 7; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14000; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,55,45,0.035)' : 'rgba(255,255,255,0.5)'; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1); }
}

// A pencil loop, traced in p (0–1) of its length.
function pencilLoop(ctx, cx, cy, rx, ry, width, p, rot = -0.05, a0 = 0.5, color = E.yellow) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.translate(cx, cy); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, a0, a0 + 5.9 * p); ctx.stroke(); ctx.restore();
}
// Two passes, as a hand going round twice.
function doubleLoop(ctx, [cx, cy, rx, ry], width, p) {
  pencilLoop(ctx, cx, cy, rx, ry, width, clamp(p / 0.62), -0.05, 0.5);
  pencilLoop(ctx, cx + rx * 0.03, cy - ry * 0.04, rx * 1.05, ry * 1.06, width * 0.85, clamp((p - 0.5) / 0.5), -0.01, 0.2);
}

// One card in place: photo with a white border and a soft shadow, and its loop drawn on top.
function card(ctx, c, x, y, s, rot, alpha, loopP) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-960, -540);
  const b = 14 / s;
  ctx.save(); ctx.shadowColor = 'rgba(30,25,15,0.20)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-b, -b, 1920 + 2 * b, 1080 + 2 * b); ctx.restore();
  ctx.drawImage(images[c.id], 0, 0, 1920, 1080);
  doubleLoop(ctx, c.loop, 15 / Math.max(s, 0.4), loopP);
  ctx.restore();
}

// Handwritten text, written on from left to right.
function writeOn(k, s, x, y, size, p, { color = E.graphite, family = '"Patrick Hand"', weight = 400, align = 'left' } = {}) {
  if (p <= 0) return;
  const { ctx } = k; k.font(weight, size, family);
  const w = ctx.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (w + 20) * p, size * 2); ctx.clip();
  k.text(s, x0, y, { color }); ctx.restore();
}

// The logo lockup (as in the brand board), revealed by the sting's progress values.
function lockup(k, cx, cy, size, { write = 1, loop1 = 1, loop2 = 1, tag = 1 } = {}) {
  const { ctx } = k; k.font(600, size, 'Lora');
  const w = ctx.measureText('Reckon').width, rw = ctx.measureText('R').width, x = cx - w / 2, base = cy + size * 0.28;
  if (write > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - size * 0.1, cy - size * 1.2, (w + size * 0.2) * write, size * 2); ctx.clip(); k.text('Reckon', x, base, { color: E.graphite }); ctx.restore(); }
  const lx = x + rw / 2, ly = base - 0.34 * size;
  pencilLoop(ctx, lx, ly, rw * 0.5 + size * 0.04, size * 0.46, size * 0.064, loop1, -0.06, 0.5);
  pencilLoop(ctx, lx + size * 0.02, ly - size * 0.014, rw * 0.5 + size * 0.06, size * 0.48, size * 0.055, loop2, -0.02, 0.2);
  if (tag > 0) k.alpha(tag, () => { k.font(400, size * 0.27, '"Patrick Hand"'); k.text('look closer', x + w - size * 1.5, base + size * 0.55 + (1 - tag) * 12, { color: E.grey }); });
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: ['Lora', 'Patrick Hand'],
  draw(t, k) {
    const { ctx } = k;
    if (!paperBg) paintPaper();
    ctx.drawImage(paperBg, 0, 0);
    const out = 1 - ease.inOut(seg(t, 32.4, 33));
    k.alpha(out, () => {
      // 1. the pile, one card at a time (only the top three are drawn: the rest are hidden underneath)
      if (t < GATHER) {
        const i = Math.min(CARDS.length - 1, Math.floor((t - START) / STEP));
        for (let j = Math.max(0, i - 2); j <= i; j++) {
          const cs = START + j * STEP, land = ease.out(seg(t, cs, cs + 0.28));
          card(ctx, CARDS[j], PILE.x, PILE.y, PILE.s * lerp(1.07, 1, land), TILT[j] + (1 - land) * 0.05, land, ease.inOut(seg(t, cs + 0.4, cs + 1.05)));
        }
        if (t >= START) {
          const cs = START + i * STEP, fade = 1 - seg(t, cs + STEP - 0.25, cs + STEP);
          k.alpha(fade, () => writeOn(k, CARDS[i].q, 270, 965, 68, ease.inOut(seg(t, cs + 0.55, cs + 1.2))));
        }
      } else if (t < 27) {
        // 2. the contact sheet
        const sheet = 1 - ease.inOut(seg(t, 26.3, 27));
        k.alpha(sheet, () => {
          CARDS.forEach((c, j) => {
            const p = ease.inOut(seg(t, GATHER + j * 0.045, GATHER + 1.1 + j * 0.045)), g = gridPos(j);
            card(ctx, c, lerp(PILE.x, g.x, p), lerp(PILE.y, g.y, p), lerp(PILE.s, GRID.s, p), lerp(TILT[j], TILT[j] * 0.6, p), 1, 1);
          });
          writeOn(k, 'Ten questions, worked out.', W / 2, 820, 78, ease.inOut(seg(t, 23.6, 24.7)), { family: 'Lora', weight: 600, align: 'center' });
          k.alpha(ease.out(seg(t, 24.5, 25.1)), () => { k.font(400, 48, '"Patrick Hand"'); k.text('science · history · maths · engineering', W / 2, 905, { color: E.grey, align: 'center' }); });
        });
      } else {
        // 3. the sting, then 4. the end card
        const st = t - 27;
        lockup(k, W / 2, 470, 230, {
          write: ease.inOut(seg(st, 0.15, 1.2)), loop1: ease.inOut(seg(st, 1.1, 1.75)), loop2: ease.inOut(seg(st, 1.6, 2.2)), tag: ease.out(seg(st, 2.35, 2.85)),
        });
        k.alpha(ease.out(seg(t, 30.6, 31.2)), () => {
          k.font(400, 30, '"Patrick Hand"');
          k.text('Music: “Dreamy Flashback” Kevin MacLeod (incompetech.com) · CC BY 4.0', W / 2, 985, { color: E.grey, align: 'center' });
        });
      }
    });
  },
});
const fontsReady = window.ready;
window.ready = Promise.all([fontsReady, imagesReady]).then(() => { window.render(0); return true; });
