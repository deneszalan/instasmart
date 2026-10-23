// Four more brand directions for Reckon. Logo lockups at t = 0..3 (Footnote, Margin note, One fact at a time, Seal)
// and the same birthday-problem thumbnail in each at t = 4..7 (drawn at 1920×1080, scaled to YouTube's 1280×720).
const W = 1920, H = 1080;
const D = { black: '#111111', green: '#C6F432', white: '#F2F2EE', grey: '#8B8B85' };
const E = { paper: '#FAFAF7', graphite: '#2E2E33', yellow: '#F4C430', grey: '#8D8D93' };
const F = { cobalt: '#1D3FD6', coral: '#FF6B57', cream: '#F6F1E7', sky: '#AFC0FF' };
const G = { ox: '#5E1A26', cream: '#F3E9D7', gold: '#C9A227', rose: '#C9A0A6' };

// D: a bold footnote asterisk, six rounded arms
function asterisk(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color; ctx.lineWidth = r * 0.34; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
  }
}
// E: a quick pencil loop, drawn as two slightly different ellipses (a hand goes round twice)
function pencilLoop(ctx, cx, cy, rx, ry, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  for (const [dx, dy, s, rot, a0, a1] of [[0, 0, 1, -0.08, 0.5, 6.5], [6, -4, 1.04, -0.02, 0.2, 5.2]]) {
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, rx * s, ry * s, 0, a0, a1); ctx.restore(); ctx.stroke();
  }
}
// F: three rising bars, the answer as a dot on the tallest
function bars(ctx, x, y, h, color, dot) {
  const w = h * 0.2, gap = h * 0.11;
  [0.42, 0.68, 1].forEach((f, i) => { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x + i * (w + gap), y + h * (1 - f), w, h * f, w / 2); ctx.fill(); });
  ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(x + 2 * (w + gap) + w / 2, y - w * 0.95, w * 0.5, 0, Math.PI * 2); ctx.fill();
  return 3 * w + 2 * gap;
}
// G: a round seal: ring text, a gold rule, an R monogram
function seal(ctx, k, cx, cy, r, c) {
  ctx.fillStyle = c.ox; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = c.gold; ctx.lineWidth = r * 0.025;
  for (const f of [0.96, 0.7]) { ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, Math.PI * 2); ctx.stroke(); }
  k.font(600, r * 0.13, '"Playfair Display"');
  const ring = '· RECKON · WORK IT OUT · RECKON · WORK IT OUT ', n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.save(); ctx.translate(cx + Math.cos(a) * r * 0.83, cy + Math.sin(a) * r * 0.83); ctx.rotate(a + Math.PI / 2);
    k.text(ring[i], 0, 0, { color: c.cream, align: 'center', base: 'middle' }); ctx.restore();
  }
  k.font(700, r * 0.82, '"Playfair Display"'); k.text('R', cx, cy + r * 0.06, { color: c.cream, align: 'center', base: 'middle' });
}

function label(k, s, color) { k.font(600, 34, '"Space Grotesk"'); k.text(s, 96, 72, { color, align: 'left', base: 'top', spacing: '3px' }); }

// The birthday frame (its ring of 23 guests), as a data URL: a file:// image would block exporting the canvas.
const photo = new Image();
const photoReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand/thumb-bg.js';
  s.onload = () => { photo.onload = ok; photo.onerror = () => fail(new Error('thumb image')); photo.src = window.THUMB_BG; };
  s.onerror = () => fail(new Error('brand/thumb-bg.js')); document.body.appendChild(s);
});

function lockup(k, v) {
  const { ctx } = k;
  if (v === 0) {
    ctx.fillStyle = D.black; ctx.fillRect(0, 0, W, H);
    k.font(800, 230, 'Inter'); const w = ctx.measureText('reckon').width, x = (W - w - 140) / 2;
    k.text('reckon', x, 640, { color: D.white, spacing: '-8px' }); asterisk(ctx, x + w - 48 + 52, 478, 56, D.green);   // measureText ignores the -8px spacing
    k.font(500, 38, 'Inter'); k.text('THERE’S MORE TO IT', x + 8, 735, { color: D.grey, spacing: '11px' });
    label(k, 'D · FOOTNOTE: the asterisk, as in "there’s more to it"; every claim has a source', D.grey);
  } else if (v === 1) {
    ctx.fillStyle = E.paper; ctx.fillRect(0, 0, W, H);
    k.font(600, 220, 'Lora'); const w = ctx.measureText('Reckon').width, x = (W - w) / 2;
    k.text('Reckon', x, 620, { color: E.graphite }); const rw = ctx.measureText('R').width;
    pencilLoop(ctx, x + rw / 2, 545, rw * 0.66, 118, E.yellow, 14);
    k.font(400, 60, '"Patrick Hand"'); k.text('look closer', x + w - 330, 742, { color: E.grey });
    label(k, 'E · MARGIN NOTE: a pencil circle round what matters', E.grey);
  } else if (v === 2) {
    ctx.fillStyle = F.cobalt; ctx.fillRect(0, 0, W, H);
    k.font(600, 220, 'Jost'); const w = ctx.measureText('reckon').width, bw = 0.2 * 200 * 3 + 0.11 * 200 * 2, x = (W - bw - 60 - w) / 2;
    bars(ctx, x, 455, 200, F.coral, F.cream); k.text('reckon', x + bw + 60, 640, { color: F.cream });
    k.font(500, 38, 'Jost'); k.text('ONE FACT AT A TIME', x + bw + 70, 735, { color: F.sky, spacing: '11px' });
    label(k, 'F · ONE FACT AT A TIME: rising bars, the answer as a dot', F.sky);
  } else {
    ctx.fillStyle = G.cream; ctx.fillRect(0, 0, W, H);
    seal(ctx, k, 640, 540, 230, G);
    k.font(700, 200, '"Playfair Display"'); k.text('Reckon', 920, 600, { color: G.ox });
    k.font(500, 36, 'Jost'); k.text('CURIOSITY, EXAMINED', 928, 690, { color: G.gold, spacing: '11px' });
    label(k, 'G · SEAL: a learned society’s stamp, for a documentary feel', G.rose);
  }
}

function thumb(k, v) {
  const { ctx } = k, X = 1150;
  ctx.fillStyle = [D.black, E.paper, F.cobalt, G.cream][v]; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(photo, 0, 0, 1080, 1080);
  const sub = (font, color) => { k.font(...font); k.text('people to share', X, 800, { color }); k.text('a birthday', X, 860, { color }); };
  if (v === 0) {
    k.font(800, 130, 'Inter'); k.text('only', X, 330, { color: D.white, spacing: '-4px' });
    k.font(800, 330, 'Inter'); k.text('23', X - 10, 640, { color: D.white, spacing: '-14px' }); asterisk(ctx, X + 440, 400, 52, D.green);
    sub([500, 50, 'Inter'], D.grey);
    k.font(800, 64, 'Inter'); k.text('reckon', 1580, 1012, { color: D.white, spacing: '-2px' }); asterisk(ctx, 1810, 960, 17, D.green);
  } else if (v === 1) {
    ctx.fillStyle = E.graphite; ctx.fillRect(1074, 0, 6, H);
    k.font(600, 130, 'Lora'); k.text('Only', X, 330, { color: E.graphite });
    k.font(700, 330, 'Lora'); k.text('23?', X - 6, 640, { color: E.graphite }); const w23 = ctx.measureText('23').width;
    pencilLoop(ctx, X - 6 + w23 / 2, 525, w23 * 0.6, 150, E.yellow, 16);
    sub([400, 58, '"Patrick Hand"'], E.grey);
    k.font(600, 66, 'Lora'); k.text('Reckon', 1610, 1012, { color: E.graphite }); const rw2 = ctx.measureText('R').width;
    pencilLoop(ctx, 1610 + rw2 / 2, 990, rw2 * 0.68, 36, E.yellow, 6);
  } else if (v === 2) {
    k.font(600, 130, 'Jost'); k.text('only', X, 330, { color: F.cream });
    k.font(700, 330, 'Jost'); k.text('23?', X - 10, 640, { color: F.coral });
    sub([500, 50, 'Jost'], F.sky);
    bars(ctx, 1560, 962, 56, F.coral, F.cream); k.font(600, 66, 'Jost'); k.text('reckon', 1640, 1014, { color: F.cream });
  } else {
    k.font(700, 130, '"Playfair Display"'); k.text('Only', X, 330, { color: G.ox });
    k.font(900, 330, '"Playfair Display"'); k.text('23?', X - 10, 640, { color: G.ox });
    ctx.fillStyle = G.gold; ctx.fillRect(X, 690, 520, 8);
    sub([500, 50, 'Jost'], G.gold);
    seal(ctx, k, 1600, 985, 58, G); k.font(700, 60, '"Playfair Display"'); k.text('Reckon', 1676, 1006, { color: G.ox });
  }
}

Kit.scene({
  width: W, height: H, duration: 8, pace: 1, fonts: ['Inter', 'Lora', 'Patrick Hand', 'Jost', 'Playfair Display', 'Space Grotesk'],
  draw(t, k) { const d = Math.min(7, Math.floor(t + 0.001)); if (d < 4) lockup(k, d); else thumb(k, d - 4); },
});
const fontsReady = window.ready;
window.ready = Promise.all([fontsReady, photoReady]).then(() => { window.render(0); return true; });
