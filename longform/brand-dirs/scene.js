// Three brand directions for Reckon. Logo lockups at t = 0, 1, 2 (Tally, Approximately, Dead reckoning) and the
// same birthday-problem thumbnail in each at t = 3, 4, 5 (drawn at 1920×1080, scaled to YouTube's 1280×720).
const W = 1920, H = 1080;
const A = { paper: '#F3EEE4', ink: '#17171B', red: '#E5482D', grey: '#8A857C' };
const B = { night: '#0E1630', yellow: '#FFD23F', white: '#F5F7FF', slate: '#8C96B8' };
const C = { teal: '#0F3B3D', sand: '#EFE4CC', orange: '#F2862E', mist: '#9FB7B3' };

// A: five tally strokes, the fifth (the reckoning) in red
function tally(ctx, x, y, h, { ink = A.ink, red = A.red, w = 0.12 } = {}) {
  ctx.lineCap = 'round'; ctx.lineWidth = h * w;
  const gap = h * 0.27, tilt = [0.02, -0.015, 0.025, -0.01];
  for (let i = 0; i < 4; i++) { ctx.strokeStyle = ink; ctx.beginPath(); ctx.moveTo(x + i * gap, y + h); ctx.lineTo(x + i * gap + h * tilt[i], y); ctx.stroke(); }
  ctx.strokeStyle = red; ctx.beginPath(); ctx.moveTo(x - h * 0.18, y + h * 0.78); ctx.lineTo(x + 3 * gap + h * 0.2, y + h * 0.2); ctx.stroke();
  return 3 * gap + h * 0.2;
}
// B: the approximately-equal sign on a yellow disc
function approx(ctx, cx, cy, r, { disc = B.yellow, ink = B.night } = {}) {
  ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
  for (const dy of [-0.2, 0.2]) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, x = cx + (u - 0.5) * r * 1.15, y = cy + dy * r - Math.sin(u * Math.PI * 2) * r * 0.1; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
}
// C: a navigator's plot: a dashed course ending in a position fix (circle and dot)
function fix(ctx, x, y, r, { line = C.orange, ring = C.sand } = {}) {
  ctx.strokeStyle = line; ctx.lineWidth = r * 0.13; ctx.lineCap = 'round'; ctx.setLineDash([r * 0.28, r * 0.24]);
  ctx.beginPath(); ctx.moveTo(x - r * 2.1, y + r * 1.35); ctx.lineTo(x - r * 0.72, y + r * 0.46); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = ring; ctx.lineWidth = r * 0.14; ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = line; ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ring; ctx.lineWidth = r * 0.1; // heading tick
  ctx.beginPath(); ctx.moveTo(x + r * 0.55, y - r * 0.55); ctx.lineTo(x + r * 0.95, y - r * 0.95); ctx.stroke();
}
window.BRAND = { A, B, C, tally, approx, fix };

function label(k, s, x, y, size, color) { k.font(600, size, '"Space Grotesk"'); k.text(s, x, y, { color, align: 'left', base: 'top', spacing: '3px' }); }

// The birthday frame (its ring of 23 guests), as a data URL: a file:// image would block exporting the canvas.
const photo = new Image();
const photoReady = new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'brand/thumb-bg.js';
  s.onload = () => { photo.onload = ok; photo.onerror = () => fail(new Error('thumb image')); photo.src = window.THUMB_BG; };
  s.onerror = () => fail(new Error('brand/thumb-bg.js')); document.body.appendChild(s);
});
function thumb(k, v) {
  const { ctx } = k;
  const bg = [A.paper, B.night, C.teal][v];
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(photo, 0, 0, 1080, 1080);   // the ring of 23 guests
  const X = 1150;
  if (v === 0) {
    ctx.fillStyle = A.ink; ctx.fillRect(1074, 0, 8, H);
    k.font(900, 130, 'Archivo'); k.text('ONLY', X, 330, { color: A.ink });
    k.font(900, 330, 'Archivo'); k.text('23?', X - 8, 640, { color: A.ink, spacing: '-8px' });
    ctx.strokeStyle = A.red; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X - 10, 700); ctx.lineTo(X + 560, 610); ctx.stroke();
    k.font(700, 50, 'Archivo'); k.text('people to share', X, 800, { color: A.grey }); k.text('a birthday', X, 860, { color: A.grey });
    const w = tally(ctx, 1560, 950, 70); k.font(800, 66, 'Archivo'); k.text('reckon', 1560 + w + 24, 1015, { color: A.ink, spacing: '-2px' });
  } else if (v === 1) {
    k.font(700, 120, '"Space Grotesk"'); k.text('ONLY', X, 320, { color: B.white, spacing: '6px' });
    ctx.fillStyle = B.yellow; ctx.beginPath(); ctx.roundRect(X - 20, 400, 600, 300, 18); ctx.fill();
    k.font(700, 300, '"Space Grotesk"'); k.text('23?', X + 10, 655, { color: B.night });
    k.font(500, 50, '"Space Grotesk"'); k.text('people to share', X, 800, { color: B.slate }); k.text('a birthday', X, 860, { color: B.slate });
    approx(ctx, 1600, 990, 42); k.font(700, 50, '"Space Grotesk"'); k.text('RECKON', 1662, 1008, { color: B.white, spacing: '8px' });
  } else {
    ctx.strokeStyle = C.orange; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.setLineDash([26, 22]);
    ctx.beginPath(); ctx.moveTo(880, 860); ctx.quadraticCurveTo(1080, 760, X - 30, 600); ctx.stroke(); ctx.setLineDash([]);
    k.font(600, 130, 'Fraunces'); k.text('Only', X, 330, { color: C.sand });
    k.font(700, 330, 'Fraunces'); k.text('23?', X - 10, 650, { color: C.orange });
    k.font(500, 50, 'Jost'); k.text('people to share', X, 800, { color: C.mist }); k.text('a birthday', X, 860, { color: C.mist });
    fix(ctx, 1500, 975, 40); k.font(600, 66, 'Fraunces'); k.text('Reckon', 1560, 1010, { color: C.sand });
  }
}

Kit.scene({
  width: W, height: H, duration: 6, pace: 1, fonts: ['Archivo', 'Space Grotesk', 'Fraunces', 'Jost'],
  draw(t, k) {
    const { ctx } = k, d = Math.min(5, Math.floor(t + 0.001));
    if (d === 0) {
      ctx.fillStyle = A.paper; ctx.fillRect(0, 0, W, H);
      const wm = tally(ctx, 520, 410, 240);
      k.font(800, 230, 'Archivo'); k.text('reckon', 520 + wm + 70, 640, { color: A.ink, spacing: '-6px' });
      k.font(500, 38, 'Archivo'); k.text('WORK IT OUT', 520 + wm + 80, 730, { color: A.grey, spacing: '12px' });
      label(k, 'A · TALLY: to reckon is to count', 96, 72, 34, A.grey);
    } else if (d === 1) {
      ctx.fillStyle = B.night; ctx.fillRect(0, 0, W, H);
      approx(ctx, 600, 540, 150);
      k.font(700, 170, '"Space Grotesk"'); k.text('RECKON', 810, 600, { color: B.white, spacing: '22px' });
      k.font(500, 36, '"Space Grotesk"'); k.text('ROUGHLY RIGHT, THEN EXACTLY', 816, 690, { color: B.slate, spacing: '9px' });
      label(k, 'B · APPROXIMATELY: "I reckon…" is an estimate', 96, 72, 34, B.slate);
    } else if (d >= 3) {
      thumb(k, d - 3);
    } else {
      ctx.fillStyle = C.teal; ctx.fillRect(0, 0, W, H);
      fix(ctx, 660, 500, 120);
      k.font(600, 210, 'Fraunces'); k.text('Reckon', 860, 600, { color: C.sand });
      k.font(500, 36, 'Jost'); k.text('FIND YOUR BEARINGS', 870, 690, { color: C.mist, spacing: '12px' });
      label(k, 'C · DEAD RECKONING: finding your way from what you know', 96, 72, 34, C.mist);
    }
  },
});
const fontsReady = window.ready;
window.ready = Promise.all([fontsReady, photoReady]).then(() => { window.render(0); return true; });
