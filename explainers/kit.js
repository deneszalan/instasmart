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
  // ---------- other languages ----------
  // `npm run explainer -- <id> --lang fr` renders the scene in another language: it sets window.TR from
  // explainers/i18n/<lang>/<id>.json, { "captions": [...one per caption cue, in order...], "labels": { "English": "French" } }.
  // Captions are swapped as Kit's captions() first sees them; any other text a scene draws (fillText, rich())
  // is swapped when the whole string is in "labels", and measured as drawn, so layouts follow the longer text.
  const TR = window.TR ?? null;
  const untranslated = new Set();
  /** The text in the render's language: its "labels" entry, or itself (noted, if it has words, so the render can list it). */
  const tr = (s) => {
    if (!TR || typeof s !== 'string') return s;
    const out = TR.labels?.[s];
    if (out != null) return out;
    if (/\p{L}{2,}/u.test(s)) untranslated.add(s);
    return s;
  };
  window.__untranslated = () => [...untranslated];
  const captionLists = new WeakSet();
  let captionCount = 0;
  window.__captionCount = () => captionCount;
  /** Inside rich() the words are already in the render's language. */
  let asIs = 0;
  // French groups thousands with a narrow no-break space, which most of the library's fonts lack and draw with almost no
  // width (1250000); an ordinary no-break space reads right.
  const fmt = (n) => Math.round(n).toLocaleString(TR?.locale ?? 'en-US').replace(/\u202f/g, '\u00a0');
  /** Opacity of something shown from a to b, fading in over fi seconds and out over fo. */
  const span = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(fi ? seg(t, a, a + fi) : 1, fo ? 1 - seg(t, b - fo, b) : 1);

  // ---------- fonts ----------
  // Every scene also gets these behind its own fonts, so a character its fonts lack is still drawn in a designed face.
  const FALLBACK = [
    { family: 'Noto Sans', file: 'NotoSans.woff2', weight: '100 900' },
    { family: 'Noto Sans Math', file: 'NotoSansMath.woff2', weight: '400' },
    { family: 'Noto Sans Symbols 2', file: 'NotoSansSymbols2.woff2', weight: '400' },
  ];
  const FALLBACK_NAMES = FALLBACK.map((f) => f.family);
  const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|math|emoji|ui-[a-z-]+)$/i;
  /** A canvas font string's leading part (style, weight, size) and its list of families. */
  const splitFont = (font) => { const m = /^(.*?\d(?:\.\d+)?(?:px|pt|em|rem|%)(?:\s*\/\s*\S+)?\s+)(.+)$/.exec(font); return m ? [m[1], m[2]] : null; };
  const familyList = (list) => list.split(',').map((f) => f.trim().replace(/^["']|["']$/g, ''));
  const proto = CanvasRenderingContext2D.prototype;
  const fontProp = Object.getOwnPropertyDescriptor(proto, 'font');
  Object.defineProperty(proto, 'font', {
    configurable: true,
    get() { return fontProp.get.call(this); },
    set(value) {
      const parts = splitFont(String(value));
      if (parts) {
        const fams = familyList(parts[1]).filter((f) => !FALLBACK_NAMES.includes(f));
        const at = fams.findIndex((f) => GENERIC.test(f));
        const list = at < 0 ? [...fams, ...FALLBACK_NAMES] : [...fams.slice(0, at), ...FALLBACK_NAMES, ...fams.slice(at)];
        value = parts[0] + list.map((f) => (GENERIC.test(f) ? f : `"${f}"`)).join(', ');
      }
      fontProp.set.call(this, value);
    },
  });
  // Every character drawn, by the scene's own font list, so `npm run explainer` can list any its fonts lack.
  const drawn = new Map();
  for (const name of ['fillText', 'strokeText']) {
    const draw = proto[name];
    proto[name] = function (text, ...rest) {
      if (!asIs) text = tr(text);
      const parts = splitFont(this.font);
      const key = parts ? familyList(parts[1]).filter((f) => !FALLBACK_NAMES.includes(f)).join(', ') : this.font;
      let chars = drawn.get(key);
      if (!chars) drawn.set(key, (chars = new Set()));
      for (const ch of String(text)) chars.add(ch);
      return draw.call(this, text, ...rest);
    };
  }
  const measure = proto.measureText;
  proto.measureText = function (text) { return measure.call(this, asIs ? text : tr(text)); };
  window.__drawn = () => Object.fromEntries([...drawn].map(([key, chars]) => [key, [...chars].join('')]));

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
      // Remembered so `npm run explainer -- <id> --srt` can strip the marks from the captions.
      for (const m in marks) (window.__marks ??= new Set()).add(m);
      if (!asIs) s = tr(s);
      asIs++;
      try { richText(s, cx, cy, { maxW, size, lh, weight, family, ink, marks }); } finally { asIs--; }
    };
    const richText = (s, cx, cy, { maxW, size, lh, weight, family, ink, marks }) => {
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
      // In another language each cue's text is swapped, in order, the first time the list is seen.
      if (TR?.captions && !captionLists.has(cues)) {
        captionLists.add(cues);
        for (const cue of cues) { const s = TR.captions[captionCount++]; if (typeof s === 'string') cue[2] = s; }
      }
      (window.__cues ??= new Set()).add(cues);
      for (const [a, b, s] of cues) {
        if (t < a || t > b) continue;
        asIs++;
        try { alpha(span(t, a, b, 0.25, 0.2), () => rich(s, x, y + (1 - ease.out(seg(t, a, a + 0.35))) * rise, style)); } finally { asIs--; }
      }
    };

    return { ctx, font, text, rrect, alpha, rich, captions };
  }

  /**
   * Set up a scene: canvas size, length in seconds, fonts, and draw(t, k), where k holds the drawing tools
   * above. A font is a family name from the library (explainers/fonts/README.md), which loads all its weights
   * and styles, or { family, file, weight, style? } for one file in explainers/fonts/. Times (duration, t, caption cues) are
   * scene seconds; the clip plays them at `pace`, so at 0.75 each scene second lasts 1.33 s.
   */
  function scene({ width = 864, height = 1080, duration, pace = 0.75, fonts = [], draw }) {
    const cv = document.getElementById('c');
    cv.width = width;
    cv.height = height;
    const ctx = cv.getContext('2d');
    const k = tools(ctx);
    window.DURATION = duration;
    window.PACE = pace;
    window.render = (t) => { ctx.save(); draw(t, k); ctx.restore(); };
    const faces = [];
    for (const f of fonts) {
      if (typeof f !== 'string') { faces.push(f); continue; }
      const family = window.FONTS?.[f];
      if (!family) { window.ready = Promise.reject(new Error(`unknown font "${f}": choose one from explainers/fonts/README.md`)); return; }
      for (const x of family.files) faces.push({ family: f, file: x.file, weight: x.weight, style: x.style });
    }
    faces.push(...FALLBACK);
    window.__fontFiles = faces.map(({ family, file }) => ({ family, file }));
    const loads = faces.map(({ family, file, weight = '100 900', style = 'normal' }) =>
      new FontFace(family, `url(fonts/${file})`, { weight, style }).load().then((f) => document.fonts.add(f)));
    window.ready = Promise.all(loads).then(() => { window.render(0); return true; });
  }

  window.Kit = { clamp, seg, lerp, ease, fmt, span, scene, tr };
})();
