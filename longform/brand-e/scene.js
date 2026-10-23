// Reckon, direction E (Margin note). One scene, four parts by time:
//   0–3.5 s   the logo sting (the only part that is rendered as a video)
//   3.5–6.5   the end card (shown at 5.5 for a still)
//   6.5–8.5   the channel avatar (shown at 7.5)
//   8.5–10    the thumbnail (shown at 9.5)
const { seg, ease } = Kit;
const W = 1920, H = 1080;
const E = { paper: '#FAFAF7', graphite: '#2E2E33', yellow: '#F4C430', grey: '#8D8D93', soft: '#5B5B63' };

// A pencil loop, traced in p (0–1) of its length, so it can be drawn on screen.
function pencilLoop(ctx, cx, cy, rx, ry, width, p, rot, a0) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = E.yellow; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, a0, a0 + 5.9 * p); ctx.stroke();
  ctx.restore();
}

// The wordmark centred on (cx, cy), with a pencil loop round its R. write, loop1, loop2 and tag are 0–1 progress.
function lockup(k, cx, cy, size, { write = 1, loop1 = 1, loop2 = 1, tag = 1, tagDy = 0 } = {}) {
  const { ctx } = k;
  k.font(600, size, 'Lora');
  const w = ctx.measureText('Reckon').width, rw = ctx.measureText('R').width;
  const x = cx - w / 2, base = cy + size * 0.28;
  if (write > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x - size * 0.1, cy - size * 1.2, (w + size * 0.2) * write, size * 2); ctx.clip();
    k.text('Reckon', x, base, { color: E.graphite });
    ctx.restore();
  }
  const lx = x + rw / 2, ly = base - 0.34 * size;
  pencilLoop(ctx, lx, ly, rw * 0.5 + size * 0.04, size * 0.46, size * 0.064, loop1, -0.06, 0.5);
  pencilLoop(ctx, lx + size * 0.02, ly - size * 0.014, rw * 0.5 + size * 0.06, size * 0.48, size * 0.055, loop2, -0.02, 0.2);
  if (tag > 0) {
    k.alpha(tag, () => {
      k.font(400, size * 0.27, '"Patrick Hand"');
      k.text('look closer', x + w - size * 1.5, base + size * 0.55 + tagDy, { color: E.grey });
    });
  }
}

function sting(k, t) {
  const { ctx } = k;
  ctx.fillStyle = E.paper; ctx.fillRect(0, 0, W, H);
  const tagP = ease.out(seg(t, 2.35, 2.85));
  k.alpha(1 - ease.inOut(seg(t, 3.1, 3.5)), () => lockup(k, W / 2, 500, 230, {
    write: ease.inOut(seg(t, 0.15, 1.2)),
    loop1: ease.inOut(seg(t, 1.1, 1.75)),
    loop2: ease.inOut(seg(t, 1.6, 2.2)),
    tag: tagP,
    tagDy: (1 - tagP) * 12,
  }));
}

function endCard(k, t) {
  const { ctx } = k;
  ctx.fillStyle = E.paper; ctx.fillRect(0, 0, W, H);
  k.alpha(ease.out(seg(t, 3.5, 4.1)), () => {
    lockup(k, W / 2, 430, 220);
    k.font(400, 40, '"Patrick Hand"');
    k.text('Reckon · original animation', W / 2, 860, { color: E.soft, align: 'center' });
  });
}

// The channel picture: a big R with its loop, for a round crop.
function avatar(k) {
  const { ctx } = k, size = 520;
  ctx.fillStyle = E.paper; ctx.fillRect(0, 0, W, H);
  k.font(600, size, 'Lora');
  const rw = ctx.measureText('R').width, cx = W / 2, base = 540 + size * 0.28;
  k.text('R', cx - rw / 2, base, { color: E.graphite });
  pencilLoop(ctx, cx, base - 0.34 * size, rw * 0.7, size * 0.56, size * 0.06, 1, -0.06, 0.5);
}

// The birthday frame (its ring of 23 guests), as a data URL: a file:// image would block exporting the canvas.
const photo = new Image();
const photoReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand/thumb-bg.js';
  s.onload = () => { photo.onload = ok; photo.onerror = () => fail(new Error('thumb image')); photo.src = window.THUMB_BG; };
  s.onerror = () => fail(new Error('brand/thumb-bg.js')); document.body.appendChild(s);
});

// The thumbnail in this direction: the hook number circled in pencil, the wordmark at the foot.
function thumb(k) {
  const { ctx } = k, X = 1150;
  ctx.fillStyle = E.paper; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(photo, 0, 0, 1080, 1080);
  ctx.fillStyle = E.graphite; ctx.fillRect(1074, 0, 6, H);
  k.font(600, 130, 'Lora'); k.text('Only', X, 330, { color: E.graphite });
  k.font(700, 330, 'Lora'); k.text('23?', X - 6, 640, { color: E.graphite });
  const w23 = ctx.measureText('23').width;
  pencilLoop(ctx, X - 6 + w23 / 2, 525, w23 * 0.6, 150, 16, 1, 0, 0.5);
  k.font(400, 58, '"Patrick Hand"');
  k.text('people to share', X, 800, { color: E.grey }); k.text('a birthday', X, 860, { color: E.grey });
  k.font(600, 66, 'Lora'); k.text('Reckon', 1610, 1012, { color: E.graphite });
  const rw2 = ctx.measureText('R').width;
  pencilLoop(ctx, 1610 + rw2 / 2, 990, rw2 * 0.68, 36, 6, 1, 0, 0.5);
}

Kit.scene({
  width: W, height: H, duration: 10, pace: 1, fonts: ['Lora', 'Patrick Hand'],
  draw(t, k) {
    if (t < 3.5) sting(k, t);
    else if (t < 6.5) endCard(k, t);
    else if (t < 8.5) avatar(k);
    else thumb(k);
  },
});
const fontsReady = window.ready;
window.ready = Promise.all([fontsReady, photoReady]).then(() => { window.render(0); return true; });
