// Explainer for language-great-vowel-shift: the long vowels of English moved through the mouth while
// the spelling stayed put.
// Look: a pastel cross-section of the mouth, like a phonetics textbook plate. Soft lilac paper with a
// soft mottling, the palate, tongue, lips and throat in pastel, the vowel chart drawn inside the mouth, one
// pastel colour per word, plum ink. Fredoka for words and captions; Source Sans 3 (latin + latin-ext) for
// the phonetic symbols.
//
// Facts (Wikipedia, "Great Vowel Shift"): the shift "took place primarily between 1400 and 1700",
// beginning in southern England; all Middle English long vowels changed. The table of changes (1400,
// 1500, 1600, by 1900): bite /iː/ /ei/ /ɛi/ /aɪ/; out /uː/ /ou/ /ɔu/ /aʊ/; meet /eː/ then /iː/; boot /oː/
// then /uː/; meat /ɛː/ /ɛː/ /eː/ /iː/; boat /ɔː/ /ɔː/ /oː/ /oʊ/; mate /aː/ /æː/ /ɛː/ /eɪ/. First phase
// (completed by 1500): the close vowels /iː uː/ became diphthongs and /eː oː/ became /iː uː/. Second phase:
// around 1550 /aː/ was raised to /æː/, after 1600 /æː/ to /ɛː/ and /ɛː ɔː/ to /eː oː/. Whether a push
// chain or a drag chain is debated. "Middle English mite sounded similar to Modern English meet."
// Modern English merges meet and meat as /iː/. Spelling standardisation began in the 15th and 16th
// centuries and English spelling "did not adapt to the changes"; Middle English long vowels had
// "continental" values like Italian and Standard German; German had similar changes slightly earlier but
// respelled: Middle High German bīzen → beißen "to bite".
// The chart positions below are the usual IPA vowel-chart places of these symbols.
//
// Scene plan (62.2 s; captions at y = 836, key elements above y = 750):
//  A  0.0–9.4   Hook. Two cards: Middle English "mite" /iː/ ≈ today's "meet".
//  B  9.2–20.0  The mouth diagram; the tongue visits the chart's corners; seven words at their 1400 places.
//  C  19.8–35.8 1400 → 1500: bite and out break into diphthongs; meet and boot rise. Push or pull?
//  D  35.6–46.2 1500 → 1600: mate, meat, boat rise a step; 1600 → 1900: today's sounds, meat = meet.
//  E  46.0–62.2 The spelling stayed: b-i-t-e, /iː/ then, /aɪ/ now; German bīzen → beißen.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  bg: '#F4EEF8', bgEdge: '#E4D8EE', ink: '#3B2E4A', inkSoft: 'rgba(59,46,74,0.66)', inkFaint: 'rgba(59,46,74,0.22)',
  palate: '#D9C8EC', palateLine: '#A68BC4', tongue: '#F5B9C4', tongueLine: '#D9879A', lip: '#F2A7B3', teeth: '#FFFDF7',
  throat: '#E8DDF2', accent: '#8E5BB5',
};
const WORDS = {
  bite: { col: '#E06C8A', dx: -72, dy: 0, steps: ['iː', 'ei', 'ɛi', 'aɪ'] },
  out: { col: '#7B6BD6', dx: 72, dy: 0, steps: ['uː', 'ou', 'ɔu', 'aʊ'] },
  meet: { col: '#3E9BD0', dx: 72, dy: 0, steps: ['eː', 'iː', 'iː', 'iː'] },
  boot: { col: '#E39242', dx: -72, dy: 0, steps: ['oː', 'uː', 'uː', 'uː'] },
  meat: { col: '#3AA77C', dx: 72, dy: 0, steps: ['ɛː', 'ɛː', 'eː', 'iː'] },
  boat: { col: '#2F9AA0', dx: -72, dy: 0, steps: ['ɔː', 'ɔː', 'oː', 'oʊ'] },
  mate: { col: '#C99A1E', dx: 72, dy: 0, steps: ['aː', 'æː', 'ɛː', 'eɪ'] },
};
const YEARS = ['1400', '1500', '1600', 'by 1900'];
const TEXT = 'Fredoka, SSX', IPAF = 'SS, SSX';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the vowel chart: u = front (0) to back (1), v = close (0) to open (1) ----------
const Q = { x0: 222, x1: 642, xOpen: 362, y0: 300, y1: 624 };
const at = (u, v) => [lerp(lerp(Q.x0, Q.xOpen, v), Q.x1, u), lerp(Q.y0, Q.y1, v)];
const PLACE = {
  i: [0, 0], ɪ: [0.12, 0.14], e: [0, 0.33], ɛ: [0, 0.66], æ: [0, 0.86], a: [0, 1], ə: [0.5, 0.5],
  u: [1, 0], ʊ: [0.86, 0.14], o: [1, 0.33], ɔ: [1, 0.66],
};
/** A sound as [start, end] chart positions: a long vowel has start = end, a diphthong glides. */
function sound(s) {
  const letters = [...s.replace('ː', '')];
  const a = PLACE[letters[0]], b = PLACE[letters[1] ?? letters[0]];
  return [a, b];
}
// For a word at a fractional stage (0 = 1400 … 3 = by 1900), its start and end on the chart.
function wordAt(w, stage) {
  const st = WORDS[w].steps;
  const i = Math.min(2, Math.floor(stage)), f = eio(clamp(stage - i));
  const [a0, b0] = sound(st[i]), [a1, b1] = sound(st[Math.min(3, i + 1)]);
  return { start: at(lerp(a0[0], a1[0], f), lerp(a0[1], a1[1], f)), end: at(lerp(b0[0], b1[0], f), lerp(b0[1], b1[1], f)), ipa: f < 0.5 ? st[i] : st[Math.min(3, i + 1)] };
}

// ---------- timeline ----------
const T = { A: [0, 9.4], B: [9.2, 20.0], C: [19.8, 35.8], D: [35.6, 46.2], E: [46.0, 62.2] };
// The stage (0..3) the chart shows at time t.
const stageAt = (t) => seg(t, 20.6, 29.4) * 1 + seg(t, 36.2, 39.8) * 1 + seg(t, 41.0, 44.6) * 1;
const CUES = [
  [0.4, 4.6, 'Around 1400, English _mite_ sounded much like our ~meet~.'],
  [4.8, 9.2, 'Then, roughly from 1400 to 1700, the long vowels moved.'],
  [9.4, 14.2, 'Picture the mouth: vowels sit higher or lower, further front or back.'],
  [14.4, 19.8, 'In 1400, seven long vowels filled the chart, from _bite_ at the top to ~mate~ at the bottom.'],
  [20.0, 24.8, 'First, the two highest, in _bite_ and _out_, broke into two-part vowels.'],
  [25.0, 30.6, 'And _meet_ and _boot_ rose to the top: by 1500 they sounded as they do today.'],
  [30.8, 35.4, 'Which moved first is still debated: a push, or a pull?'],
  [35.8, 40.6, 'From around 1550, a second phase raised _mate_, then _meat_ and _boat_.'],
  [40.8, 46.0, 'By 1900 they had reached today’s sounds, and _meat_ sounded just like ~meet~.'],
  [46.2, 52.0, 'But spelling had begun to settle in the 1400s and 1500s, so the letters stayed put.'],
  [52.2, 57.6, 'That’s why English vowel letters no longer sound as they do in Italian or German.'],
  [57.8, 62.0, 'German had a similar shift but respelled: _bīzen_ became ~beißen~.'],
];

// ---------- background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, 800);
  rad.addColorStop(0, '#FBF7FD'); rad.addColorStop(0.65, C.bg); rad.addColorStop(1, C.bgEdge);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(1400);
  for (let i = 0; i < 14; i++) {
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 140;
    const fg = g.createRadialGradient(x, y, 0, x, y, r);
    fg.addColorStop(0, `rgba(200,170,225,${0.08 + rnd() * 0.08})`); fg.addColorStop(1, 'rgba(200,170,225,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // a soft plate frame
  g.strokeStyle = 'rgba(142,91,181,0.35)'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(30, 30, W - 60, H - 60, 28); g.stroke();
}
function header() {
  font(600, 22); text('RECKON', 62, 82, { color: C.accent, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(400, 22); text('Language · the Great Vowel Shift', 62 + w + 14, 82, { color: C.inkSoft });
}

// ---------- the mouth ----------
/** The cross-section; the tongue's highest point is at (hx, hy). */
function mouth(hx, hy, a = 1) {
  withAlpha(a, () => {
    // throat
    ctx.fillStyle = C.throat; ctx.beginPath(); ctx.moveTo(690, 262); ctx.quadraticCurveTo(770, 300, 772, 420); ctx.lineTo(772, 730); ctx.lineTo(690, 730); ctx.closePath(); ctx.fill();
    // palate: a thick band arching over the chart, from the teeth to the soft palate
    ctx.fillStyle = C.palate; ctx.strokeStyle = C.palateLine; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(126, 232); ctx.quadraticCurveTo(330, 150, 560, 186); ctx.quadraticCurveTo(700, 206, 742, 300);
    ctx.lineTo(718, 316); ctx.quadraticCurveTo(672, 238, 556, 230); ctx.quadraticCurveTo(340, 206, 160, 262); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // the uvula
    ctx.fillStyle = C.lip; ctx.beginPath(); ctx.ellipse(728, 330, 12, 22, -0.4, 0, TAU); ctx.fill();
    // lips and teeth
    ctx.fillStyle = C.teeth; ctx.strokeStyle = C.palateLine; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(138, 244, 30, 52, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(150, 640, 30, 50, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.lip;
    ctx.beginPath(); ctx.ellipse(104, 262, 34, 48, 0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(112, 680, 36, 46, -0.2, 0, TAU); ctx.fill();
    // jaw floor
    ctx.strokeStyle = C.palateLine; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(150, 716); ctx.quadraticCurveTo(420, 742, 690, 730); ctx.stroke();
    // tongue: from the tip behind the lower teeth, up to the hump, down to the root
    const tipX = 196, tipY = 640, rootX = 690, rootY = 700;
    const hyT = hy + 58;
    const tg = ctx.createLinearGradient(0, hyT, 0, 730);
    tg.addColorStop(0, 'rgba(245,185,196,0.48)'); tg.addColorStop(1, 'rgba(245,185,196,0.18)');
    ctx.fillStyle = tg; ctx.strokeStyle = 'rgba(217,135,154,0.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(tipX, tipY);
    ctx.bezierCurveTo(tipX + 10, tipY - 60, hx - 150, hyT, hx, hyT);
    ctx.bezierCurveTo(hx + 150, hyT, rootX - 20, rootY - 160, rootX, rootY);
    ctx.lineTo(rootX, 730); ctx.lineTo(tipX, 730); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
}
function chartFrame(a = 1, labels = 1) {
  withAlpha(a, () => {
    const [p0, p1, p2, p3] = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.lineTo(...p2); ctx.lineTo(...p3); ctx.closePath(); ctx.stroke();
    for (const v of [0.33, 0.66]) { const a1 = at(0, v), b1 = at(1, v); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); }
    ctx.setLineDash([]);
    withAlpha(labels, () => {
      font(500, 22); text('front', at(0, 0)[0], Q.y0 - 34, { color: C.inkSoft, align: 'center', base: 'middle' });
      text('back', at(1, 0)[0], Q.y0 - 34, { color: C.inkSoft, align: 'center', base: 'middle' });
      text('high', W / 2, Q.y0 - 34, { color: C.inkSoft, align: 'center', base: 'middle' });
      text('low', at(0.5, 1)[0], Q.y1 + 34, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
  });
}
/** A word chip: the word and its vowel. */
function chip(x, y, word, ipa, col, a = 1, scale = 1) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-54, -30, 108, 60, 18); ctx.fill(); ctx.stroke();
    font(600, 28); text(word, 0, -8, { color: col, align: 'center', base: 'middle' });
    font(600, 22, IPAF); text(`/${ipa}/`, 0, 17, { color: C.ink, align: 'center', base: 'middle' });
    ctx.restore();
  });
}
function arrow(x0, y0, x1, y1, col, p = 1) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  if (d < 6 || p <= 0) return;
  const ex = lerp(x0, x1, p), ey = lerp(y0, y1, p);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
  const ang = Math.atan2(ey - y0, ex - x0);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 14 * Math.cos(ang - 0.45), ey - 14 * Math.sin(ang - 0.45)); ctx.lineTo(ex - 14 * Math.cos(ang + 0.45), ey - 14 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
}
/** All seven words at a stage; focus picks which are bright. */
function words(stage, focus = null, alphaAll = 1, appear = () => 1) {
  const merged = stage >= 2.5;
  for (const w of Object.keys(WORDS)) {
    const o = WORDS[w];
    const p = wordAt(w, stage);
    const a = alphaAll * appear(w) * (focus && !focus.includes(w) ? 0.35 : 1);
    if (a <= 0) continue;
    withAlpha(a, () => {
      // dot at the sound, glide arrow for a diphthong
      arrow(p.start[0], p.start[1], p.end[0], p.end[1], o.col, 1);
      ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(p.start[0], p.start[1], 8, 0, TAU); ctx.fill();
      let dy = o.dy;
      if (merged && (w === 'meet' || w === 'meat')) dy = (w === 'meet' ? -31 : 31) * clamp((stage - 2.5) * 2);
      ctx.strokeStyle = o.col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.start[0], p.start[1]); ctx.lineTo(p.start[0] + o.dx * 0.5, p.start[1] + dy * 0.5); ctx.stroke();
      chip(p.start[0] + o.dx, p.start[1] + dy, w, p.ipa, o.col);
    });
  }
}
function yearTag(stage, a = 1) {
  withAlpha(a, () => {
    const i = Math.min(3, Math.round(stage));
    font(600, 52); text(YEARS[i], 92, 140, { color: C.accent, base: 'middle' });
  });
}
function tonguePoint(stage, w) {
  const p = wordAt(w, stage);
  return p.start;
}

// ---------- scenes ----------
function sceneA(t) {
  const a1 = eout(seg(t, 0.5, 1.2)), a2 = eout(seg(t, 1.8, 2.5)), eq = eout(seg(t, 2.6, 3.1));
  const card = (x, y, title, word, ipa, col, a) => withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y + (1 - a) * 20);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = col; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-150, -150, 300, 300, 36); ctx.fill(); ctx.stroke();
    font(500, 26); text(title, 0, -100, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(600, 88); text(word, 0, -6, { color: col, align: 'center', base: 'middle' });
    font(600, 38, IPAF); text(`/${ipa}/`, 0, 84, { color: C.ink, align: 'center', base: 'middle' });
    ctx.restore();
  });
  card(236, 400, 'Middle English, c. 1400', 'mite', 'iː', WORDS.bite.col, a1);
  card(628, 400, 'today', 'meet', 'iː', WORDS.meet.col, a2);
  withAlpha(eq, () => { font(600, 72); text('≈', W / 2, 400, { color: C.accent, align: 'center', base: 'middle' }); });
  withAlpha(eout(seg(t, 5.0, 5.6)), () => {
    font(500, 30); text('today’s mite:', 300, 640, { color: C.inkSoft, align: 'right', base: 'middle' });
    font(600, 40, IPAF); text('/aɪ/', 320, 640, { color: WORDS.bite.col, base: 'middle' });
    font(500, 30); text('the vowels moved', 600, 640, { color: C.accent, align: 'center', base: 'middle' });
  });
}
function sceneB(t) {
  // the tongue tours the corners of the chart: high front, high back, low back, low front, then rests
  const tour = [[0, 0], [1, 0], [1, 1], [0, 1], [0.45, 0.5]];
  const s = seg(t, 10.0, 14.0) * (tour.length - 1);
  const i = Math.min(tour.length - 2, Math.floor(s)), f = eio(clamp(s - i));
  const [u, v] = [lerp(tour[i][0], tour[i + 1][0], f), lerp(tour[i][1], tour[i + 1][1], f)];
  const [hx, hy] = at(u, v);
  mouth(hx, hy, eout(seg(t, 9.3, 10.0)));
  chartFrame(eout(seg(t, 9.8, 10.4)));
  withAlpha(eout(seg(t, 9.6, 10.2)) * (1 - seg(t, 14.2, 14.8)), () => {
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.fill();
    font(500, 22); text('diagram of the mouth, facing left', W / 2, 140, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  const order = ['bite', 'meet', 'meat', 'mate', 'out', 'boot', 'boat'];
  words(0, null, 1, (w) => eout(seg(t, 14.8 + order.indexOf(w) * 0.35, 15.3 + order.indexOf(w) * 0.35)));
  withAlpha(eout(seg(t, 14.6, 15.2)), () => yearTag(0));
}
function sceneC(t) {
  const st = stageAt(t);
  const [hx, hy] = t < 25 ? tonguePoint(st, 'bite') : tonguePoint(st, 'meet');
  mouth(hx, hy);
  chartFrame(1, 1);
  const focus = t < 30.8 ? (t < 25 ? ['bite', 'out'] : ['bite', 'out', 'meet', 'boot']) : null;
  words(st, focus);
  yearTag(st);
  // push or pull?
  withAlpha(span(t, 31.0, 35.6, 0.4, 0.3), () => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.roundRect(232, 660, 400, 64, 20); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke();
    font(500, 26); text('push chain   or   pull chain?', W / 2, 693, { color: C.accent, align: 'center', base: 'middle' });
  });
}
function sceneD(t) {
  const st = stageAt(t);
  const [hx, hy] = tonguePoint(st, t < 40.8 ? 'mate' : 'bite');
  mouth(hx, hy);
  chartFrame(1, 1);
  const focus = t < 40.8 ? ['mate', 'meat', 'boat'] : null;
  words(st, focus);
  yearTag(st);
}
function sceneE(t) {
  // the spelling stays: b-i-t-e
  const a = eout(seg(t, 46.4, 47.0));
  const out = eio(seg(t, 57.4, 58.0));
  withAlpha(a * (1 - out), () => {
    const letters = ['b', 'i', 't', 'e'];
    letters.forEach((l, i) => {
      const x = 252 + i * 120, y = 300;
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = i === 1 ? WORDS.bite.col : C.palateLine; ctx.lineWidth = i === 1 ? 4 : 2.5;
      ctx.beginPath(); ctx.roundRect(x - 50, y - 64, 100, 128, 20); ctx.fill(); ctx.stroke();
      font(600, 88); text(l, x, y + 4, { color: i === 1 ? WORDS.bite.col : C.ink, align: 'center', base: 'middle' });
    });
    // a pin: spelling fixed
    withAlpha(eout(seg(t, 47.6, 48.2)), () => {
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(W / 2, 214, 12, 0, TAU); ctx.fill();
      font(500, 24); text('spelling settles, 1400s–1500s', W / 2, 186, { color: C.accent, align: 'center', base: 'middle' });
    });
    const s = seg(t, 48.6, 51.4);
    const rows = [['1400', 'iː'], ['1500', 'ei'], ['1600', 'ɛi'], ['by 1900', 'aɪ']];
    rows.forEach(([yr, v], i) => {
      const p = eout(clamp(s * 4 - i));
      withAlpha(p, () => {
        const x = 192 + i * 160, y = 470;
        font(500, 24); text(yr, x, y, { color: C.inkSoft, align: 'center', base: 'middle' });
        font(600, 40, IPAF); text(`/${v}/`, x, y + 48, { color: WORDS.bite.col, align: 'center', base: 'middle' });
        if (i < 3) { ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 50, y + 48); ctx.lineTo(x + 110, y + 48); ctx.stroke(); }
      });
    });
    withAlpha(eout(seg(t, 52.6, 53.2)), () => {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.roundRect(152, 596, 560, 110, 24); ctx.fill();
      ctx.strokeStyle = C.palateLine; ctx.lineWidth = 2; ctx.stroke();
      font(500, 26); text('the letter i stayed; its sound moved', W / 2, 628, { color: C.inkSoft, align: 'center', base: 'middle' });
      font(600, 34, IPAF); text('/iː/ in 1400,  /aɪ/ in English today', W / 2, 674, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
  // German respelled
  withAlpha(eout(seg(t, 58.0, 58.6)), () => {
    const y = 420;
    font(500, 26); text('Middle High German', 230, y - 110, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(600, 26); text('modern German', 634, y - 110, { color: C.inkSoft, align: 'center', base: 'middle' });
    for (const [x, w, col] of [[230, 'bīzen', WORDS.bite.col], [634, 'beißen', WORDS.out.col]]) {
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = col; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(x - 150, y - 70, 300, 140, 30); ctx.fill(); ctx.stroke();
      font(600, 64, IPAF); text(w, x, y, { color: col, align: 'center', base: 'middle' });
    }
    arrow(394, y, 470, y, C.accent, eout(seg(t, 58.6, 59.2)));
    font(500, 26); text('‘to bite’: the spelling followed the sound', W / 2, y + 130, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, weight: 600, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words2 = s.split(' ').map((w) => ctx.measureText(w.replace(/[_~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words2) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { _: WORDS.bite.col, '~': WORDS.meet.col } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.2,
  fonts: [
    { family: 'Fredoka', file: 'Fredoka.woff2', weight: '300 700' },
    { family: 'SS', file: 'SourceSans3.woff2', weight: '200 900' },
    { family: 'SSX', file: 'SourceSans3.woff2', weight: '200 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
