// Shared helpers for explainer videos. A scene file (explainers/<post-id>.js) calls Kit.scene({ ... });
// scripts/explainer.ts then calls window.render(t) for every frame. Frames depend only on t.
(() => {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  /** Progress from 0 to 1 as t goes from a to b. */
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, x) => a + (b - a) * x;
  const ease = {
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    out: (x) => 1 - Math.pow(1 - x, 3),
    back: (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
  };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  /** Opacity of something shown from a to b, fading in over fi seconds and out over fo. */
  const span = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(fi ? seg(t, a, a + fi) : 1, fo ? 1 - seg(t, b - fo, b) : 1);

  function tools(ctx) {
    const font = (weight, size, family) => { ctx.font = `${weight} ${size}px ${family}`; };
    const text = (s, x, y, { color, align = 'left', base = 'alphabetic', spacing = '0px' } = {}) => {
      if (color) ctx.fillStyle = color;
      ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = spacing;
      ctx.fillText(s, x, y);
      ctx.letterSpacing = '0px';
    };
    const rrect = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    const alpha = (a, fn) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); };

    /**
     * Wrapped, centred text. Words between marks take that mark's colour, e.g. with
     * marks { '*': red, '~': green }: "a *big* idea, ~twice as fast~".
     */
    const rich = (s, cx, cy, { maxW, size, lh = size * 1.3, weight = 700, family, ink, marks = {} }) => {
      font(weight, size, family);
      let mode = null;
      const toks = [];
      for (const raw of s.split(' ')) {
        let w = raw;
        if (!mode && marks[w[0]]) { mode = w[0]; w = w.slice(1); }
        const color = mode ? marks[mode] : ink;
        let tail = '';
        if (mode) {
          const at = w.lastIndexOf(mode);
          if (at >= 0) { tail = w.slice(at + 1); w = w.slice(0, at); toks.push({ w, color, tail }); mode = null; continue; }
        }
        toks.push({ w, color, tail });
      }
      const space = ctx.measureText(' ').width;
      const width = (tk) => ctx.measureText(tk.w + tk.tail).width;
      const lines = [[]];
      let lw = 0;
      for (const tk of toks) {
        if (lw + width(tk) > maxW && lines.at(-1).length) { lines.push([]); lw = 0; }
        lines.at(-1).push(tk);
        lw += width(tk) + space;
      }
      const top = cy - ((lines.length - 1) * lh) / 2;
      lines.forEach((line, i) => {
        const total = line.reduce((sum, tk) => sum + width(tk), 0) + space * (line.length - 1);
        let x = cx - total / 2;
        for (const tk of line) {
          text(tk.w, x, top + i * lh, { color: tk.color, base: 'middle' });
          x += ctx.measureText(tk.w).width;
          if (tk.tail) { text(tk.tail, x, top + i * lh, { color: ink, base: 'middle' }); x += ctx.measureText(tk.tail).width; }
          x += space;
        }
      });
    };

    /** Captions: cues are [start, end, text]; each rises into place and fades out. */
    const captions = (t, cues, { x, y, rise = 22, ...style }) => {
      // Remembered so `npm run explainer` can turn the captions into the clip's steps.
      (window.__cues ??= new Set()).add(cues);
      for (const [a, b, s] of cues) {
        if (t < a || t > b) continue;
        alpha(span(t, a, b, 0.25, 0.2), () => rich(s, x, y + (1 - ease.out(seg(t, a, a + 0.35))) * rise, style));
      }
    };

    return { ctx, font, text, rrect, alpha, rich, captions };
  }

  /**
   * Set up a scene: canvas size, length in seconds, fonts from explainers/fonts/, and
   * draw(t, k), where k holds the drawing tools above.
   */
  function scene({ width = 864, height = 1080, duration, fonts = [], draw }) {
    const cv = document.getElementById('c');
    cv.width = width;
    cv.height = height;
    const ctx = cv.getContext('2d');
    const k = tools(ctx);
    window.DURATION = duration;
    window.render = (t) => { ctx.save(); draw(t, k); ctx.restore(); };
    const loads = fonts.map(({ family, file, weight = '100 900' }) =>
      new FontFace(family, `url(fonts/${file})`, { weight }).load().then((f) => document.fonts.add(f)));
    window.ready = Promise.all(loads).then(() => { window.render(0); return true; });
  }

  window.Kit = { clamp, seg, lerp, ease, fmt, span, scene };
})();
