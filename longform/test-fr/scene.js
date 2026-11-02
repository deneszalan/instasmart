// "Two languages, one scene": the test video for the French version (16:9, 1920x1080), kept as an example.
// The same scene plays both versions: window.TL is timeline.js or timeline-fr.js, and in French kit.js swaps every whole
// string drawn for its labels-fr.json entry (measured as drawn, so chips grow with the text) and Kit.fmt writes 1 250 000.
// Strings put together in code have no whole-string label, so words and numbers are drawn as separate strings.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const KEYS = Object.keys(T);

const C = {
  bg0: '#0D1828', bg1: '#1D3552', ink: '#F4EBD9', soft: 'rgba(244,235,217,0.72)', faint: 'rgba(244,235,217,0.16)',
  gold: '#E2A43B', red: '#D9603F', blue: '#78ADE0', card: 'rgba(8,14,24,0.93)', chip: 'rgba(13,24,40,0.9)',
};
const DISPLAY = 'Fraunces', TEXT = 'Source Sans 3';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 40, weight = 600, family = TEXT, color = C.ink, align = 'left', spacing = '0px' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base: 'middle', spacing });
}
function textW(str, { size = 40, weight = 600, family = TEXT } = {}) { k.font(weight, size, family); return ctx.measureText(str).width; }
/** A decimal the reader's way (47.3, in French 47,3): Kit.fmt does whole numbers only. */
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
/** A label on a rounded chip as wide as its text (in French, as wide as the French). */
function chip(str, cx, cy, color, a = 1, size = 44) {
  const w = textW(str, { size, weight: 700 });
  A(a, () => {
    k.rrect(cx - w / 2 - 28, cy - size * 0.85, w + 56, size * 1.7, size * 0.85);
    ctx.fillStyle = C.chip; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();
    txt(str, cx, cy + 2, { size, weight: 700, color, align: 'center' });
  });
}

// ---------- the background, painted once ----------
let BG = null;
function background() {
  if (!BG) {
    BG = document.createElement('canvas'); BG.width = W; BG.height = H;
    const g = BG.getContext('2d');
    const gr = g.createRadialGradient(W * 0.38, H * 0.42, 80, W / 2, H / 2, 1250);
    gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(244,235,217,0.045)'; g.lineWidth = 1;
    for (let x = 96; x <= 1824; x += 96) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 72; y <= 1008; y += 96) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  }
  ctx.drawImage(BG, 0, 0);
}

/** A voice as a little waveform drawn left to right. */
function wave(x0, y, w, color, p, seed) {
  ctx.beginPath();
  for (let i = 0; i <= 120 * p; i++) {
    const x = x0 + (i / 120) * w, f = i / 120;
    const amp = 46 * Math.sin(Math.PI * f) * (0.45 + 0.55 * Math.abs(Math.sin(f * 23 + seed * 1.7) * Math.cos(f * 9 + seed)));
    ctx.moveTo(x, y - amp); ctx.lineTo(x, y + amp);
  }
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
}

// ---------- cold open ----------
function partOpen(t) {
  const out = 1 - seg(t, e('o2', 0.1), e('o2', 0.8));
  A(out, () => {
    chip('ENGLISH', 620, 400, C.blue, eout(seg(t, s('o1', 0.4), s('o1', 1.1))));
    chip('FRENCH', 1300, 400, C.red, eout(seg(t, s('o1', 1.2), s('o1', 1.9))));
    const w = eio(seg(t, s('o2', 0.2), e('o2', -0.2)));
    if (w > 0) { wave(320, 600, 600, C.blue, w, 1); wave(1000, 600, 600, C.red, w, 2); }
    A(eout(seg(t, s('o2', 0.4), s('o2', 1.2))), () => txt('every line, twice', W / 2, 760, { size: 44, weight: 600, color: C.soft, align: 'center' }));
  });
  // the title, until the first chapter card
  const ti = eout(seg(t, e('o2', 0.5), e('o2', 1.5)));
  A(ti, () => {
    txt('TWO LANGUAGES, ONE SCENE', W / 2, 500 + (1 - ti) * 16, { size: 100, family: DISPLAY, weight: 700, align: 'center', spacing: '2px' });
    txt('A studio test', W / 2, 620, { size: 46, weight: 600, color: C.gold, align: 'center' });
  });
}

// ---------- 1: two timelines ----------
function partTimeline(t) {
  const X0 = 160, X1 = 1760, Y = 500, x = (u) => lerp(X0, X1, u / DURATION);
  const bar = eio(seg(t, s('a1', 0.2), s('a1', 1.4)));
  A(eout(seg(t, s('a1', 0.2), s('a1', 0.9))), () => {
    txt('this video’s timeline', X0, 330, { size: 48, weight: 700, color: C.gold });
    txt(dec(DURATION), X1 - 44, 330, { size: 48, weight: 700, align: 'right' });
    txt('s', X1, 330, { size: 48, weight: 700, color: C.soft, align: 'right' });
  });
  ctx.fillStyle = C.faint; ctx.fillRect(X0, Y - 4, (X1 - X0) * bar, 8);
  // every line as a block, in place: the French blocks are longer, the scene the same
  KEYS.forEach((key, i) => {
    const a = eout(seg(t, s('a1', 0.6 + i * 0.25), s('a1', 1.2 + i * 0.25)));
    if (a <= 0) return;
    A(a, () => {
      const [x0, x1] = [x(T[key][0]), x(T[key][1])];
      ctx.fillStyle = key[0] === 'o' ? C.blue : key[0] === 'a' ? C.gold : C.red;
      k.rrect(x0, Y - 30, Math.max(6, x1 - x0), 60, 10); ctx.fill();
      txt(key, (x0 + x1) / 2, Y + 70, { size: 34, weight: 700, color: C.soft, align: 'center' });
    });
  });
  // a2: the playhead follows the line keys
  const ph = seg(t, s('a2'), e('a2', 0.8));
  A(span(t, s('a2', 0.1), e('a2', 1.0), 0.4, 0.4), () => {
    const px = x(lerp(s('a2'), e('a2'), ph));
    ctx.fillStyle = C.ink; ctx.fillRect(px - 2, Y - 70, 4, 140);
    chip('keyed to lines', W / 2, 760, C.ink, 1, 40);
  });
}

// ---------- 2: numbers and labels ----------
function partNumbers(t) {
  const n = eout(seg(t, s('b1', 0.3), s('b1', 1.2)));
  A(n, () => {
    txt(fmt(1250000), W / 2, 400 + (1 - n) * 20, { size: 160, family: DISPLAY, weight: 700, align: 'center' });
    txt('in figures', W / 2, 520, { size: 46, weight: 600, color: C.gold, align: 'center' });
  });
  const l = eout(seg(t, s('b2', 0.3), s('b2', 1.1)));
  chip('every label is swapped', W / 2, 720, C.red, l, 48);
}

// ---------- title cards and credits ----------
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) continue;
    A(a, () => {
      ctx.fillStyle = C.card; ctx.fillRect(0, 0, W, H);
      txt(`PART ${ch.n}`, W / 2, 430, { size: 40, weight: 700, color: C.gold, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      let size = 112;
      while (textW(title, { size, family: DISPLAY, weight: 700 }) > 1500) size -= 4;
      txt(title, W / 2, 540, { size, family: DISPLAY, weight: 700, align: 'center' });
      ctx.fillStyle = C.gold; ctx.fillRect(W / 2 - 60, 630, 120, 4);
    });
  }
}
const MUSIC = ['“Teller of the Tales” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
function credits() {
  ctx.fillStyle = '#080E18'; ctx.fillRect(0, 0, W, H);
  txt('TWO LANGUAGES, ONE SCENE', W / 2, 330, { size: 72, family: DISPLAY, weight: 700, align: 'center' });
  txt('Reckon · original animation', W / 2, 430, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 540, { size: 32, weight: 700, color: C.gold, align: 'center', spacing: '3px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 590 + j * 40, { size: 32, weight: 400, align: 'center' }));
  txt('A test of the long-form studio', W / 2, 720, { size: 32, weight: 400, color: C.soft, align: 'center' });
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const parts = [partOpen, partTimeline, partNumbers];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCard(t);
    A(seg(t, e('b2', 1.2), e('b2', 2.2)), () => credits());
  },
});
