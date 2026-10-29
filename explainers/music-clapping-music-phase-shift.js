// Explainer for music-clapping-music-phase-shift: the composer Steve Reich turned 90 on 3 October 2026, and
// birthday concerts in Toronto (6 October) and London (28 October) programmed his Clapping Music (1972). Two
// people clap one 12-beat rhythm; one of them keeps it, the other moves one beat ahead at a time, until after
// 12 moves they meet again. Look: a deep plum night, the rhythm as two rows of 12 cells with a playhead, pink
// for the first clapper, sky blue for the second, a pale yellow flash where both clap at once. Outfit for
// labels and numbers, Rubik for captions.
//
// Facts:
// - Boosey & Hawkes, "Steve Reich at 90: Worldwide Celebrations and Premiere" (2026): Reich "turns 90 on
//   October 3, 2026"; Soundstreams, Toronto, 6 October, with a special Clapping Music pairing a filmed
//   performance by Reich with Russell Hartenberger live; Barbican, London, 28 October; Carnegie Hall
//   birthday concert 22 October. Bachtrack listing: the Colin Currie Group's Barbican concert of 28 October
//   2026 opens with Clapping Music.
// - Joel K. Haack, "The Mathematics of Steve Reich's Clapping Music", Bridges 1998: two performers clap a
//   rhythm of "eight claps and four pauses": three claps, a pause, two claps, a pause, one clap, a pause, two
//   claps, a pause. The first performer keeps it throughout; the second moves "the content of the first beat
//   of the pattern to the end", cycling through all twelve variations; "the twelfth variation is identical
//   with the original pattern", and the piece ends in unison.
// - Wikipedia, "Clapping Music": 1972; the shift comes "after every eight or twelve bars"; a typical recording
//   runs just under five minutes; Reich's account (BBC Radio 4, Front Row, 2016): after a 1972 concert in
//   Brussels, his group clapped along with flamenco musicians, and he saw that clapping could be the basis
//   for a piece that "needed no instruments beyond the human body".
// Computed here: for each of the 12 positions, the beats where both clap, one claps, or neither (0, 1 or 2
// silent beats; none at positions 1, 6 and 11); every position gives a different combined rhythm.
//
// Scene plan (60 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.2  Reich at 90; the piece.
//  B  9.2–23.0  The rhythm: 12 beats, 8 claps, 4 rests; two people in unison.
//  C 23.0–41.4  One beat ahead: the first beat goes to the end; together, alone, silent; all 12 positions.
//  D 41.4–50.4  Twelve moves bring them back together; 8 or 12 repeats a step; about five minutes.
//  E 50.6–60.0  Brussels, 1972; one rhythm against itself.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#1d1128', bg2: '#0b0710', ink: '#fbf6fb', soft: 'rgba(251,246,251,0.72)', faint: 'rgba(251,246,251,0.20)', cell: 'rgba(251,246,251,0.07)',
  one: '#ff6fae', two: '#5ec8ff', both: '#fff07a', rest: 'rgba(251,246,251,0.18)', panel: 'rgba(0,0,0,0.30)',
};
const NUM = 'Outfit', CAP = 'Rubik';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the rhythm (Haack 1998): 1 = clap, 0 = rest ----------
const P = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];
const N = P.length; // 12
if (P.filter(Boolean).length !== 8) throw new Error('eight claps and four rests');
/** The second clapper after `s` moves: the first beat of the pattern goes to the end, s times. */
const shifted = (s) => P.map((_, i) => P[(i + s) % N]);
const tally = (s) => {
  const Q = shifted(s);
  let both = 0, silent = 0;
  for (let i = 0; i < N; i++) { both += P[i] & Q[i]; silent += (1 - P[i]) & (1 - Q[i]); }
  return { both, silent, one: N - both - silent };
};
const TALLY = Array.from({ length: N + 1 }, (_, s) => tally(s));
const NO_SILENCE = TALLY.slice(1, N).map((x, i) => (x.silent === 0 ? i + 1 : 0)).filter(Boolean); // 1, 6, 11
if (new Set(Array.from({ length: N }, (_, s) => shifted(s).join(''))).size !== N) throw new Error('all 12 positions differ');

const CUES = [
  [0.4, 4.6, 'On 3 October 2026, the American composer Steve Reich turned 90.'],
  [4.8, 9.0, 'Concerts for his birthday, in Toronto and London, programmed a piece for two pairs of hands.'],
  [9.2, 13.6, 'Clapping Music, from 1972, uses one rhythm of 12 beats: *8 claps* and ~4 rests~.'],
  [13.8, 18.2, 'Three claps, rest, two, rest, one, rest, two, rest. Then round again, and again.'],
  [18.4, 22.8, 'Two people start by clapping it together. One of them never changes.'],
  [23.0, 27.4, 'The other moves one beat ahead: the first beat of the pattern goes to the end.'],
  [27.6, 32.0, `Now only ^${TALLY[1].both} claps^ land together, and no beat is left silent.`],
  [32.2, 36.6, 'After a while the second clapper moves on one beat more, and a new rhythm appears.'],
  [36.8, 41.2, 'Each of the 11 shifted positions sounds different, with 0, 1 or 2 silent beats.'],
  [41.4, 45.8, 'Twelve moves of one beat add up to the whole pattern: the two meet again in unison.'],
  [46.0, 50.4, 'Each step is clapped 8 or 12 times. A recording lasts just under five minutes.'],
  [50.6, 55.0, 'Reich said the idea came in 1972 in Brussels, clapping along with flamenco musicians.'],
  [55.2, 60.0, 'No instruments, no melody: one rhythm, played against itself.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint concentric rings, like a record
  g.strokeStyle = 'rgba(251,246,251,0.03)'; g.lineWidth = 2;
  for (let r = 60; r < 900; r += 28) { g.beginPath(); g.arc(W / 2, 470, r, 0, Math.PI * 2); g.stroke(); }
}

// ---------- the rows of cells ----------
const ROW = { x0: 96, cw: 56, h: 64 };
const cx = (i) => ROW.x0 + i * ROW.cw + ROW.cw / 2;
/** The beat the playhead is on, playing a 12-beat bar every `bar` scene seconds from `t0`. */
const beatAt = (t, t0, bar = 2.4) => (t < t0 ? -1 : Math.floor(((t - t0) / bar) * N) % N);
const flash = (t, t0, bar = 2.4) => (t < t0 ? 0 : 1 - (((t - t0) / bar) * N) % 1);

function row(y, pat, col, o = {}) {
  const off = o.offset ?? 0; // fractional slide to the left, in cells
  const beat = o.beat ?? -1, fl = o.flash ?? 0;
  ctx.save(); ctx.beginPath(); ctx.rect(ROW.x0 - 4, y - ROW.h / 2 - 8, ROW.cw * N + 8, ROW.h + 16); ctx.clip();
  for (let j = -1; j <= N; j++) {
    const i = ((j % N) + N) % N;
    const x = ROW.x0 + (j - off) * ROW.cw;
    ctx.fillStyle = C.cell; k.rrect(x + 4, y - ROW.h / 2, ROW.cw - 8, ROW.h, 10); ctx.fill();
    const on = pat[i];
    const hit = on && i === beat && off === 0;
    if (on) {
      const r = (ROW.cw - 16) / 2 * (hit ? 1 + 0.25 * fl : 1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + ROW.cw / 2, y, r, 0, Math.PI * 2); ctx.fill();
      if (hit) A(fl, () => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + ROW.cw / 2, y, r + 10 * (1 - fl) + 6, 0, Math.PI * 2); ctx.stroke(); });
    } else {
      ctx.strokeStyle = C.rest; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + ROW.cw / 2, y, 7, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
  if (o.label) { font(600, 24); text(o.label, ROW.x0, y - ROW.h / 2 - 22, { color: col }); }
}
/** The combined rhythm: yellow where both clap, white where one does, empty where neither. */
function combined(y, s, a = 1, beat = -1, fl = 0) {
  const Q = shifted(s);
  A(a, () => {
    for (let i = 0; i < N; i++) {
      const n = P[i] + Q[i], x = cx(i);
      ctx.fillStyle = C.cell; k.rrect(x - ROW.cw / 2 + 4, y - 26, ROW.cw - 8, 52, 8); ctx.fill();
      if (n === 0) { ctx.strokeStyle = C.one; ctx.globalAlpha *= 0.9; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); k.rrect(x - ROW.cw / 2 + 6, y - 24, ROW.cw - 12, 48, 7); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha /= 0.9; continue; }
      const big = n === 2;
      const r = (big ? 18 : 11) * (i === beat ? 1 + 0.3 * fl : 1);
      ctx.fillStyle = big ? C.both : C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  });
}
function playhead(y0, y1, beat, a = 1) {
  if (beat < 0) return;
  A(a * 0.8, () => { ctx.fillStyle = 'rgba(255,240,122,0.10)'; ctx.fillRect(cx(beat) - ROW.cw / 2, y0, ROW.cw, y1 - y0); });
}
function counts(y, s, a = 1) {
  const x = TALLY[s];
  A(a, () => {
    const items = [[`${x.both}`, 'together', C.both], [`${x.one}`, 'one alone', C.ink], [`${x.silent}`, 'silent', C.one]];
    items.forEach(([n, lab, col], i) => {
      const px = 186 + i * 246;
      font(800, 54); text(n, px, y, { align: 'center', color: col });
      font(500, 24); text(lab, px, y + 44, { align: 'center', color: C.soft });
    });
  });
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.3, 1.2)), () => {
      font(600, 26); text('STEVE REICH · COMPOSER', CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
      font(800, 240); text('90', CX, 360, { align: 'center', color: C.ink });
      font(500, 30); text('3 October 2026', CX, 500, { align: 'center', color: C.soft });
    });
    A(seg(t, 4.9, 5.5), () => {
      ctx.fillStyle = C.panel; k.rrect(132, 570, 600, 170, 16); ctx.fill();
      font(800, 44); text('Clapping Music', CX, 624, { align: 'center', color: C.both });
      font(500, 26); text('for two performers, clapping · 1972', CX, 672, { align: 'center', color: C.soft });
      font(500, 24); text('Toronto, 6 October · London, 28 October', CX, 710, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: the rhythm ----------
function sceneRhythm(t) {
  const a = span(t, 9.2, 23.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('ONE BAR: 12 BEATS', CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
    const g = eout(seg(t, 9.4, 10.6));
    A(g, () => row(300, P, C.one, { label: 'clapper 1', beat: beatAt(t, 13.8), flash: flash(t, 13.8) }));
    // numbers of the beats
    A(seg(t, 10.0, 10.6), () => { font(500, 20); for (let i = 0; i < N; i++) text(`${i + 1}`, cx(i), 252 - 26, { align: 'center', color: C.faint }); });
    // the grouping 3 · 2 · 1 · 2
    A(span(t, 13.8, 18.4, 0.3, 0.3), () => {
      const groups = [[0, 2, '3'], [4, 5, '2'], [7, 7, '1'], [9, 10, '2']];
      groups.forEach(([i0, i1, n]) => {
        const x0 = cx(i0) - 20, x1 = cx(i1) + 20;
        ctx.strokeStyle = C.one; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, 350); ctx.lineTo(x0, 362); ctx.lineTo(x1, 362); ctx.lineTo(x1, 350); ctx.stroke();
        font(800, 32); text(n, (x0 + x1) / 2, 392, { align: 'center', color: C.one });
      });
    });
    // two people in unison
    A(seg(t, 18.4, 19.0), () => {
      row(450, P, C.two, { label: 'clapper 2', beat: beatAt(t, 18.6), flash: flash(t, 18.6) });
      combined(580, 0, 1, beatAt(t, 18.6), flash(t, 18.6));
      font(600, 24); text('together', ROW.x0, 532, { color: C.both });
      font(500, 24); text('all 8 claps land at once: unison', CX, 660, { align: 'center', color: C.soft });
      playhead(256, 610, beatAt(t, 18.6));
    });
    playhead(256, 340, t < 18.4 ? beatAt(t, 13.8) : -1);
  });
}

// ---------- C: one beat ahead ----------
function sceneShift(t) {
  const a = span(t, 23.0, 41.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // which position: 1 from 23–32, then 2…11 stepping through 32.2–41.2
    let s = 1, off = 0;
    if (t < 25.4) { s = 0; off = eio(seg(t, 23.8, 25.2)); }
    else if (t >= 32.6) { s = 1 + Math.min(10, Math.floor((t - 32.6) / 0.8)); }
    font(600, 26); text(s === 0 ? 'MOVING ONE BEAT AHEAD' : `SHIFTED BY ${s} BEAT${s > 1 ? 'S' : ''}`, CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
    row(300, P, C.one, { label: 'clapper 1 · never changes' });
    if (s === 0) {
      row(450, P, C.two, { label: 'clapper 2 · one beat ahead', offset: off });
      // the first beat travels to the end
      A(seg(t, 23.6, 24.0) * (1 - seg(t, 25.2, 25.4)), () => {
        ctx.strokeStyle = C.two; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(cx(0), 500); ctx.bezierCurveTo(cx(0), 560, cx(11), 560, cx(11), 500); ctx.stroke(); ctx.setLineDash([]);
        font(500, 22); text('first beat → end', CX, 566, { align: 'center', color: C.two });
      });
    } else {
      const beat = s === 1 ? beatAt(t, 27.6) : -1;
      row(450, shifted(s), C.two, { label: 'clapper 2 · one beat ahead', beat, flash: flash(t, 27.6) });
      combined(580, s, seg(t, 27.6, 28.0), beat, flash(t, 27.6));
      A(seg(t, 27.6, 28.0), () => { font(600, 24); text('together', ROW.x0, 532, { color: C.both }); });
      counts(668, s, seg(t, 28.2, 28.6));
      playhead(256, 610, beat);
    }
  });
}

// ---------- D: back to unison; a performance ----------
function sceneCycle(t) {
  const a = span(t, 41.4, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('ALL 12 POSITIONS', CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
    // silent beats at each position, as bars; position 12 is unison again
    const x0 = 112, bw = 50, base = 470, unit = 46;
    for (let s = 0; s <= N; s++) {
      const g = eout(seg(t, 41.6 + s * 0.18, 42.1 + s * 0.18));
      const x = x0 + s * bw, v = TALLY[s].silent, col = s === 0 || s === N ? C.both : v === 0 ? C.two : C.one;
      A(g, () => {
        ctx.fillStyle = col; k.rrect(x - 16, base - Math.max(6, v * unit * g), 32, Math.max(6, v * unit * g), 6); ctx.fill();
        font(600, 22); text(`${s}`, x, base + 28, { align: 'center', color: s === 0 || s === N ? C.both : C.soft });
      });
    }
    A(seg(t, 42.4, 42.9), () => {
      font(500, 24); text('silent beats at each position', 92, 250, { color: C.soft });
      font(600, 22); text('4', x0 - 52, base - 4 * unit, { align: 'center', color: C.faint }); text('0', x0 - 52, base - 4, { align: 'center', color: C.faint });
      font(600, 24); text('start', x0, base + 62, { align: 'center', color: C.both }); text('unison again', x0 + N * bw - 30, base + 62, { align: 'center', color: C.both });
    });
    // a performance: each step repeated 8 or 12 times
    A(seg(t, 46.0, 46.5), () => {
      ctx.fillStyle = C.panel; k.rrect(92, 590, 680, 150, 14); ctx.fill();
      font(700, 30); text('13 steps: unison, 11 shifted positions, unison', CX, 634, { align: 'center', color: C.ink });
      font(500, 26); text('each clapped 8 or 12 times · a recording: just under 5 minutes', CX, 684, { align: 'center', color: C.soft });
    });
  });
}

// ---------- E: Brussels; the end ----------
function sceneEnd(t) {
  const a = eout(seg(t, 50.6, 51.2));
  if (a <= 0) return;
  A(a, () => {
    if (t < 55.2) {
      A(1 - seg(t, 54.9, 55.3), () => {
        font(600, 26); text('BRUSSELS · 1972', CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
        // hands clapping: two simple palms meeting on a beat
        for (let i = 0; i < 3; i++) {
          const x = 252 + i * 180, ph = ((t - 50.6) * 2.5 + i * 0.33) % 1, gap = 34 * Math.abs(Math.sin(ph * Math.PI));
          ctx.fillStyle = [C.one, C.two, C.both][i];
          k.rrect(x - gap - 38, 300, 38, 120, 18); ctx.fill();
          k.rrect(x + gap, 300, 38, 120, 18); ctx.fill();
          if (gap < 6) A(1 - gap / 6, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 30, 280); ctx.lineTo(x + d * 52, 256); ctx.stroke(); } });
        }
        font(600, 30); text('flamenco clapping, after a concert', CX, 520, { align: 'center', color: C.ink });
        font(500, 26); text('a piece that needs no instruments, only hands', CX, 566, { align: 'center', color: C.soft });
      });
    } else {
      A(seg(t, 55.2, 55.7), () => {
        font(600, 26); text('CLAPPING MUSIC', CX, 150, { align: 'center', color: C.soft, spacing: '4px' });
        row(300, P, C.one, { label: 'clapper 1', beat: beatAt(t, 55.6), flash: flash(t, 55.6) });
        row(450, P, C.two, { label: 'clapper 2', beat: beatAt(t, 55.6), flash: flash(t, 55.6) });
        combined(580, 0, 1, beatAt(t, 55.6), flash(t, 55.6));
        playhead(256, 610, beatAt(t, 55.6));
      });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneRhythm(t);
    sceneShift(t);
    sceneCycle(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.one, '~': C.soft, '^': C.both } });
  },
});
