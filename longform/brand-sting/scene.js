// Reckon logo sting, 3.5 s: the app icon pops in, the wordmark writes itself, then everything fades out.
// The icon and wordmark are the app's own (public/favicon.svg, the .logo style in src/styles.css).
const { seg, ease, lerp } = Kit;
const W = 1920, H = 1080, DURATION = 3.5;
const AMBER = '#f59e0b', ROSE = '#e11d48', VIOLET = '#7c3aed', BG = '#0b0a10';
// public/favicon.svg, in its 64-unit box
const BUBBLE = new Path2D('M18 16h28a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H30l-9 8v-8h-3a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z');
const QUESTION = new Path2D('M32 21.5c-3.9 0-6.6 2.4-6.8 5.9h3.9c.1-1.5 1.2-2.5 2.9-2.5 1.6 0 2.6.9 2.6 2.1 0 1.1-.5 1.7-2 2.6-1.8 1.1-2.6 2.2-2.5 4v.9h3.8v-.6c0-1.2.5-1.8 2.1-2.8 1.7-1 2.7-2.3 2.7-4.3 0-3.1-2.7-5.3-6.7-5.3z');
const back = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : ease.back(x));

function icon(ctx, cx, cy, size, { pop, bubble, q, qDrop }) {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(size / 64 * pop, size / 64 * pop); ctx.rotate((1 - pop) * -0.14); ctx.translate(-32, -32);
  const g = ctx.createLinearGradient(4, 60, 60, 4); g.addColorStop(0, AMBER); g.addColorStop(0.5, ROSE); g.addColorStop(1, VIOLET);
  ctx.shadowColor = 'rgba(225,29,72,0.45)'; ctx.shadowBlur = 40 / (size / 64);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(4, 4, 56, 56, 16); ctx.fill();
  ctx.shadowBlur = 0;
  if (bubble > 0) { ctx.save(); ctx.translate(32, 32); ctx.scale(bubble, bubble); ctx.translate(-32, -32); ctx.fillStyle = '#fff'; ctx.fill(BUBBLE); ctx.restore(); }
  if (q > 0) {
    ctx.save(); ctx.globalAlpha *= q; ctx.translate(0, -qDrop * 9); ctx.fillStyle = ROSE; ctx.fill(QUESTION);
    ctx.beginPath(); ctx.arc(32.1, 38.6, 2.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [{ family: 'Grand Hotel', file: '../brand/GrandHotel-Regular.ttf', weight: '400' }, 'Jost'],
  draw(t, k) {
    const { ctx } = k;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    const out = seg(t, 2.95, 3.5), all = 1 - ease.inOut(out);
    // soft glow of the brand gradient behind everything
    k.alpha(ease.out(seg(t, 0, 0.8)) * all, () => {
      const r = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 760);
      r.addColorStop(0, 'rgba(225,29,72,0.20)'); r.addColorStop(0.45, 'rgba(124,58,237,0.10)'); r.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    });
    k.font(400, 250, '"Grand Hotel"');
    const word = 'Reckon', ww = ctx.measureText(word).width, size = 210, gap = 46;
    const total = size + gap + ww, x0 = (W - total) / 2;
    const slide = ease.inOut(seg(t, 0.85, 1.45));
    const cx = lerp(W / 2, x0 + size / 2, slide), cy = 520;
    k.alpha(all, () => {
      ctx.save(); const z = 1 + 0.03 * ease.inOut(out); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      icon(ctx, cx, cy, size, { pop: back(seg(t, 0.0, 0.55)), bubble: back(seg(t, 0.3, 0.7)), q: seg(t, 0.55, 0.75), qDrop: 1 - back(seg(t, 0.55, 0.95)) });
      // the wordmark, revealed left to right
      const reveal = ease.inOut(seg(t, 1.0, 1.8)), wx = x0 + size + gap;
      if (reveal > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(wx - 20, cy - 220, (ww + 60) * reveal, 420); ctx.clip();
        const g = ctx.createLinearGradient(wx, cy + 60, wx + ww, cy - 120); g.addColorStop(0, AMBER); g.addColorStop(0.45, ROSE); g.addColorStop(1, '#a855f7');
        ctx.fillStyle = g; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(word, wx, cy + 10); ctx.restore();
      }
      // gradient rule sweeping under it
      const rule = ease.out(seg(t, 1.45, 2.05));
      if (rule > 0) {
        const g = ctx.createLinearGradient(x0, 0, x0 + total, 0); g.addColorStop(0, AMBER); g.addColorStop(0.5, ROSE); g.addColorStop(1, VIOLET);
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x0, cy + 165, total * rule, 6, 3); ctx.fill();
      }
      k.alpha(ease.out(seg(t, 1.9, 2.4)), () => { k.font(500, 34, 'Jost'); k.text('RECKON YOU KNOW?', W / 2, cy + 250, { color: 'rgba(255,255,255,0.72)', align: 'center', spacing: '10px' }); });
      ctx.restore();
    });
  },
});
