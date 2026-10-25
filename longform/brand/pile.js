// A heap of frames from the videos lying on the page, for the trailers: the examples shown earlier sit on top of it,
// so they read as a few cards from a much bigger pile. Frames are in brand/pile-frames.js (data URLs, as file:// images
// would block exporting the canvas). World units: a card is 1920×1080 drawn at Pile.S, 330 px wide at zoom 1.
window.Pile = (() => {
  const S = 0.172, CW = 1920 * S, CH = 1080 * S;
  const images = {};
  const ready = new Promise((ok, fail) => {
    const s = document.createElement('script'); s.src = 'brand/pile-frames.js';
    s.onload = () => Promise.all(Object.entries(window.PILE_FRAMES).map(([id, src]) => new Promise((done, bad) => {
      const im = new Image(); im.onload = () => done(); im.onerror = () => bad(new Error(id)); im.src = src; images[id] = im;
    }))).then(ok, fail);
    s.onerror = () => fail(new Error('brand/pile-frames.js')); document.body.appendChild(s);
  });

  // Cards on a jittered grid well beyond the screen, in a random stacking order. Each frame is used a few times; frame
  // (x + 50y) mod n keeps every copy at least 2000 units from the next (with 109 frames).
  function heap(seed = 11, cols = 7, rows = 7) {
    let r = seed; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    const ids = Object.keys(images), out = [];
    for (let y = -rows; y <= rows; y++) for (let x = -cols; x <= cols; x++) {
      const img = images[ids[(((x + 50 * y) % ids.length) + ids.length) % ids.length]];
      out.push({ x: x * 250 + (rnd() - 0.5) * 130, y: y * 150 + (rnd() - 0.5) * 90, rot: (rnd() - 0.5) * 0.3, z: rnd(), img });
    }
    out.sort((a, b) => a.z - b.z);
    return out;
  }

  // One card: white border (world units), soft shadow, the frame, and its pencil loop if it has one (loopW in screen px).
  function card(ctx, img, x, y, rot, { scale = 1, alpha = 1, loop = null, loopW = 10, zoom = 1, drawLoop, border = 13 } = {}) {
    if (alpha <= 0) return;
    const s = S * scale;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-960, -540);
    const b = border / S;
    ctx.save(); ctx.shadowColor = 'rgba(30,25,15,0.24)'; ctx.shadowBlur = Math.min(40, 16 * zoom); ctx.shadowOffsetY = Math.min(12, 4 * zoom);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-b, -b, 1920 + 2 * b, 1080 + 2 * b); ctx.restore();
    ctx.drawImage(img, 0, 0, 1920, 1080);
    if (loop && drawLoop) drawLoop(ctx, loop, loopW / (s * zoom));
    ctx.restore();
  }

  // The heap seen through a camera at (cx, cy), zoom Z; cards off screen are skipped.
  function drawHeap(ctx, cards, { Z, cx, cy, W = 1920, H = 1080 }) {
    const rad = Math.hypot(CW, CH) / 2 + 20, hw = W / (2 * Z) + rad, hh = H / (2 * Z) + rad;
    for (const c of cards) {
      if (Math.abs(c.x - cx) > hw || Math.abs(c.y - cy) > hh) continue;
      card(ctx, c.img, c.x, c.y, c.rot, { zoom: Z });
    }
  }
  return { S, CW, CH, images, ready, heap, card, drawHeap };
})();
