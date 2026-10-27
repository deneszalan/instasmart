// Explainer for history-vestals-thirty-years (Roma): six Vestal Virgins kept the sacred fire in the round Temple of
// Vesta in the Forum; each served at least 30 years, ten learning, ten performing the rites and ten teaching, so a
// six-place college renewed itself slowly. Look: night, white marble, firelight; the temple's ring of columns; the
// thirty years as three coloured decades; a rota of six lanes. Outfit for captions, Gentium Book Plus for labels
// and Latin.
//
// Facts:
// - Wikipedia, "Temple of Vesta": a round temple (tholos) in the Roman Forum near the Regia and the House of the
//   Vestals; it housed Vesta's holy fire, a symbol of Rome's safety; Romans believed its extinction signified
//   imminent disaster; twenty Corinthian columns on a podium about 15 m across; the roof probably had a vent for the
//   smoke; two and a half bays reconstructed in 1930–31.
// - Wikipedia, "House of the Vestal Virgins": behind the temple, a three-storey building of some 50 rooms round a
//   long courtyard with pools.
// - Wikipedia, "Vestal Virgin": six Vestals (Plutarch, for the Imperial era); chosen before puberty, aged 6–10, by
//   the pontifex maximus by lot from twenty candidates; at least thirty years of service, divided into three decades
//   as students, servants and teachers; they took turns at the hearth so that one was always there; a Vestal who
//   let the fire go out was whipped; after thirty years free to marry, few did, and some renewed their vows; Occia
//   was a Vestal for 57 years (38 BC – AD 19); in AD 382 Gratian confiscated the cult's public revenues; the last
//   Vestal known from an inscription, Coelia Concordia, in AD 385; Zosimus's story of an aged Vestal in 394, when
//   Theodosius I supposedly visited Rome, is doubted by Alan Cameron.
// - Dionysius of Halicarnassus 2.67 and Plutarch, Numa 10 (LacusCurtius): six virgins; thirty years: the first ten
//   learning their duties, the second ten performing them, the third ten teaching others. Plutarch, Numa 9: a fire
//   that went out had to be lit fresh from the rays of the sun, gathered by concave metal mirrors.
// The rota is a model: it assumes every Vestal served exactly 30 years and that the six were chosen at even
// intervals. Then 6 places / 30 years = one new Vestal every 5 years, and two are in each decade at any time.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The round temple at night, the fire inside.
//  B  9.6–18.6  Six Vestals; the house behind; chosen by lot from twenty girls.
//  C 18.8–36.8  Thirty years in three decades; turns at the hearth.
//  D 37.2–46.2  The rota model: one new Vestal every five years, two in each decade.
//  E 46.4–55.4  Occia's 57 years; the fire relit from the Sun.
//  F 55.6–65.0  The end: Gratian in 382, Coelia Concordia in 385, a doubtful story of 394.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night1: '#120d12', night2: '#24161a', marble: '#eee5d3', marble2: '#cfc3ad', shade: '#8f8371',
  ink: '#f6efe2', soft: 'rgba(246,239,226,0.72)', faint: 'rgba(246,239,226,0.22)',
  fire1: '#ffd166', fire2: '#ff9b3d', fire3: '#e2552c', learn: '#7fb7e6', serve: '#ffc857', teach: '#ef6f5e', stay: '#b9a3d6',
  ribbon: '#c8382c',
};
const SANS = 'Outfit', SERIF = 'Gentium Book Plus';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const VESTALS = 6, TERM = 30, DECADE = 10, CANDIDATES = 20, COLUMNS = 20, OCCIA = 57;
const EVERY = TERM / VESTALS; // 5 years, in the model
const PER_DECADE = VESTALS * DECADE / TERM; // 2
if (EVERY !== 5 || PER_DECADE !== 2) throw new Error('numbers');

// ---------- drawing helpers ----------
function flame(x, y, s, t, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 90 * s);
    g.addColorStop(0, 'rgba(255,190,90,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 90 * s, 0, TAU); ctx.fill();
    const f = (h, w, col, ph) => {
      const wob = Math.sin(t * 9 + ph) * 3 * s;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w * s, y);
      ctx.quadraticCurveTo(x - w * s * 0.8, y - h * s * 0.5, x + wob, y - h * s);
      ctx.quadraticCurveTo(x + w * s * 0.8, y - h * s * 0.5, x + w * s, y); ctx.closePath(); ctx.fill();
    };
    f(46, 18, C.fire3, 0); f(36, 13, C.fire2, 1.3); f(24, 8, C.fire1, 2.1);
  });
}
/** A Vestal, schematic: a white robed figure with a red-and-white headband. */
function vestal(x, y, s = 1, col = C.marble, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-16, 46); ctx.quadraticCurveTo(-12, 6, 0, 2); ctx.quadraticCurveTo(12, 6, 16, 46); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -8, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ribbon; ctx.fillRect(-10, -12, 20, 4);
    ctx.restore();
  });
}
/** The round temple seen from the front: podium, steps, columns, a conical roof with a vent. */
function temple(cx, base, sc, t, { glow = 1 } = {}) {
  const r = 190 * sc, colH = 250 * sc, podH = 70 * sc;
  // podium
  ctx.fillStyle = C.marble2; ctx.fillRect(cx - r - 14 * sc, base - podH, 2 * r + 28 * sc, podH);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(cx - r - 14 * sc, base - podH + podH * 0.7, 2 * r + 28 * sc, podH * 0.3);
  for (let s = 0; s < 4; s++) { ctx.fillStyle = s % 2 ? C.marble : C.marble2; ctx.fillRect(cx - 70 * sc - s * 10 * sc, base - podH * (1 - s * 0.25), 140 * sc + s * 20 * sc, podH * 0.25); }
  ctx.fillStyle = C.marble; ctx.beginPath(); ctx.ellipse(cx, base - podH, r + 14 * sc, 16 * sc, 0, 0, TAU); ctx.fill();
  const top = base - podH - colH;
  // the cella wall behind, with the fire's glow in the door
  ctx.fillStyle = '#d9ceb8'; ctx.fillRect(cx - r * 0.78, top + 14 * sc, r * 1.56, colH - 14 * sc);
  ctx.fillStyle = '#2a1a14'; ctx.fillRect(cx - 44 * sc, top + 80 * sc, 88 * sc, colH - 80 * sc);
  flame(cx, base - podH - 8 * sc, 1.1 * sc, t, glow);
  // columns: the front half of a ring of 20
  for (let i = 0; i < COLUMNS / 2; i++) {
    const a = Math.PI * (i + 0.5) / (COLUMNS / 2), x = cx - r * Math.cos(a), depth = Math.sin(a);
    const w = 22 * sc * (0.75 + 0.25 * depth);
    ctx.fillStyle = depth > 0.5 ? C.marble : C.marble2;
    ctx.fillRect(x - w / 2, top, w, colH);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + w * 0.15, top, w * 0.25, colH);
    ctx.fillStyle = C.marble; ctx.fillRect(x - w * 0.75, top - 10 * sc, w * 1.5, 12 * sc);
  }
  // entablature (curved, as on a round building) and roof
  ctx.fillStyle = C.marble; ctx.fillRect(cx - r - 10 * sc, top - 34 * sc, 2 * r + 20 * sc, 26 * sc);
  ctx.beginPath(); ctx.ellipse(cx, top - 8 * sc, r + 10 * sc, 14 * sc, 0, 0, Math.PI); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, top - 22 * sc, r + 10 * sc, 12 * sc, 0, 0, Math.PI); ctx.stroke();
  ctx.fillStyle = C.marble2; ctx.beginPath(); ctx.moveTo(cx - r - 10 * sc, top - 34 * sc); ctx.quadraticCurveTo(cx, top - 170 * sc, cx + r + 10 * sc, top - 34 * sc); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1a14'; ctx.fillRect(cx - 16 * sc, top - 140 * sc, 32 * sc, 12 * sc);
  // smoke from the vent
  A(glow * 0.5, () => {
    for (let i = 0; i < 5; i++) {
      const u = ((t * 0.25 + i / 5) % 1);
      ctx.fillStyle = `rgba(200,190,180,${0.25 * (1 - u)})`;
      ctx.beginPath(); ctx.arc(cx + Math.sin(u * 6 + i) * 12 * sc, top - 150 * sc - u * 90 * sc, (8 + u * 20) * sc, 0, TAU); ctx.fill();
    }
  });
}

// ---------- A ----------
function sceneTemple(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(500, 26, SERIF); text('AEDES VESTAE · FORUM ROMANUM', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    temple(CX, 720, 1.22, t, { glow: seg(t, 0.4, 1.6) });
    A(seg(t, 5.2, 6.0), () => {
      font(600, 26); text('THE SACRED FIRE', CX, 760, { align: 'center', base: 'middle', color: C.fire1, spacing: '3px' });
    });
  });
}

// ---------- B: six Vestals, the house, the lot ----------
function scenePlan(t) {
  A(span(t, 9.4, 18.8, 0.5, 0.4), () => {
    // plan: the round temple and the house behind it
    const tx = 250, ty = 440, tr = 70;
    A(seg(t, 9.6, 10.4), () => {
      ctx.fillStyle = C.marble2; ctx.beginPath(); ctx.arc(tx, ty, tr, 0, TAU); ctx.fill();
      for (let i = 0; i < COLUMNS; i++) { const a = (i / COLUMNS) * TAU; ctx.fillStyle = C.marble; ctx.beginPath(); ctx.arc(tx + (tr - 9) * Math.cos(a), ty + (tr - 9) * Math.sin(a), 5, 0, TAU); ctx.fill(); }
      flame(tx, ty + 10, 0.55, t);
      font(500, 22, SERIF); text('temple', tx, ty + tr + 26, { align: 'center', base: 'middle', color: C.soft });
      // the house: a long courtyard with pools
      const hx = 360, hy = 300, hw = 420, hh = 280;
      ctx.fillStyle = 'rgba(238,229,211,0.16)'; ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = C.marble2; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);
      ctx.strokeStyle = 'rgba(238,229,211,0.4)'; ctx.lineWidth = 1.5;
      for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(hx + i * hw / 8, hy); ctx.lineTo(hx + i * hw / 8, hy + 50); ctx.moveTo(hx + i * hw / 8, hy + hh); ctx.lineTo(hx + i * hw / 8, hy + hh - 50); ctx.stroke(); }
      ctx.fillStyle = 'rgba(127,183,230,0.35)'; ctx.fillRect(hx + 70, hy + 105, 120, 70); ctx.fillRect(hx + 230, hy + 105, 120, 70);
      font(500, 22, SERIF); text('House of the Vestals', hx + hw / 2, hy + hh + 26, { align: 'center', base: 'middle', color: C.soft });
    });
    // six Vestals
    for (let i = 0; i < VESTALS; i++) vestal(132 + i * 120, 170, 1.45, C.marble, seg(t, 10.2 + i * 0.25, 10.8 + i * 0.25) * (1 - seg(t, 14.0, 14.4)));
    A(seg(t, 11.8, 12.4) * (1 - seg(t, 14.0, 14.4)), () => { font(700, 30); text('SIX VESTALS', CX, 108, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' }); });
    // the lot: twenty girls, one chosen
    A(seg(t, 14.4, 15.0), () => {
      ctx.fillStyle = C.night1; ctx.fillRect(0, 60, W, 224);
      font(600, 24); text(`${CANDIDATES} CANDIDATES, AGED 6 TO 10`, CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      const chosen = 13, pick = seg(t, 16.6, 17.2);
      for (let i = 0; i < CANDIDATES; i++) {
        const x = 92 + (i % 10) * 76, y = 140 + Math.floor(i / 10) * 64;
        const on = i === chosen;
        ctx.fillStyle = on && pick > 0 ? C.fire1 : `rgba(238,229,211,${1 - 0.6 * pick})`;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 11, y + 36); ctx.quadraticCurveTo(x, y + 4, x + 11, y + 36); ctx.closePath(); ctx.fill();
        if (on && pick > 0) { ctx.strokeStyle = C.fire1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 12, 32, 0, TAU); ctx.stroke(); }
      }
      A(pick, () => { font(700, 26); text('CHOSEN BY LOT', CX, 262, { align: 'center', base: 'middle', color: C.fire1, spacing: '2px' }); });
    });
  });
}

// ---------- C: thirty years ----------
const BAR = { x0: 92, x1: 772, y: 360, h: 80 };
const yr = (y) => BAR.x0 + (BAR.x1 - BAR.x0) * (y / TERM);
function decades(a, { labels = 1 } = {}) {
  A(a, () => {
    const parts = [[0, 'LEARNING', C.learn], [10, 'PERFORMING THE RITES', C.serve], [20, 'TEACHING', C.teach]];
    parts.forEach(([y0, name, col], i) => {
      const g = clamp(a * 3 - i);
      ctx.fillStyle = col; ctx.fillRect(yr(y0) + 2, BAR.y, (yr(y0 + 10) - yr(y0) - 4) * g, BAR.h);
      A(labels * g, () => {
        font(700, 22); text(name, (yr(y0) + yr(y0 + 10)) / 2, BAR.y - 24, { align: 'center', base: 'middle', color: col, spacing: '1px' });
        font(600, 26); text(`${y0}–${y0 + 10}`, (yr(y0) + yr(y0 + 10)) / 2, BAR.y + BAR.h / 2, { align: 'center', base: 'middle', color: '#1b1410' });
      });
    });
  });
}
function sceneYears(t) {
  A(span(t, 18.6, 37.2, 0.5, 0.4), () => {
    font(800, 60); text(`${TERM} YEARS`, CX, 168, { align: 'center', base: 'middle', color: C.ink, spacing: '4px' });
    font(500, 24, SERIF); text('at least, unmarried', CX, 220, { align: 'center', base: 'middle', color: C.soft });
    decades(seg(t, 23.4, 26.4));
    A(seg(t, 26.4, 27.2), () => { font(500, 22, SERIF); text('Dionysius of Halicarnassus; Plutarch, Life of Numa', CX, BAR.y + BAR.h + 34, { align: 'center', base: 'middle', color: C.soft }); });
    // turns at the hearth: six Vestals round a fire, one beside it at a time
    A(seg(t, 32.6, 33.4), () => {
      const cx = CX, cy = 640;
      flame(cx, cy + 18, 0.9, t);
      const turn = Math.floor((t - 32.6) / 0.7) % VESTALS;
      for (let i = 0; i < VESTALS; i++) {
        const a = -Math.PI / 2 + (i / VESTALS) * TAU, on = i === turn;
        const r = on ? 92 : 150;
        vestal(cx + r * Math.cos(a), cy + r * 0.5 * Math.sin(a) - 30, 1.05, on ? C.fire1 : C.marble);
      }
    });
  });
}

// ---------- D: the rota model ----------
function sceneRota(t) {
  A(span(t, 37.0, 46.4, 0.5, 0.4), () => {
    font(600, 24); text('A MODEL: SIX PLACES, 30 YEARS EACH', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const L = 70, R = 794, span0 = 0, span1 = 60, X = (y) => L + (R - L) * ((y - span0) / (span1 - span0));
    const top = 150, lane = 62;
    // each lane: a Vestal joins every 5 years, staggered; when one leaves after 30 years the next girl starts
    const grow = seg(t, 37.4, 39.8);
    for (let v = 0; v < VESTALS; v++) {
      const y = top + v * lane;
      for (let start = v * EVERY - TERM; start < span1; start += TERM) {
        for (const [d0, col] of [[0, C.learn], [10, C.serve], [20, C.teach]]) {
          const a0 = Math.max(span0, start + d0), a1 = Math.min(span1, start + d0 + DECADE, span0 + (span1 - span0) * grow);
          if (a1 <= a0) continue;
          ctx.fillStyle = col; ctx.fillRect(X(a0) + 1, y, X(a1) - X(a0) - 2, lane - 14);
        }
        if (start >= span0 && start < span1 * grow) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(start), y + (lane - 14) / 2, 6, 0, TAU); ctx.fill(); }
      }
    }
    font(500, 20, SERIF);
    for (let y = 0; y <= 60; y += 10) text(`${y}`, X(y), top + VESTALS * lane + 14, { align: 'center', base: 'middle', color: C.soft });
    text('years', R, top + VESTALS * lane + 40, { align: 'right', base: 'middle', color: C.soft });
    // a moving "now" line with the count in each decade
    A(seg(t, 41.8, 42.4), () => {
      const now = lerp(32, 52, seg(t, 42.0, 45.6));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(now), top - 10); ctx.lineTo(X(now), top + VESTALS * lane - 8); ctx.stroke();
      const counts = [0, 0, 0];
      for (let v = 0; v < VESTALS; v++) { const age = (((now - v * EVERY) % TERM) + TERM) % TERM; counts[Math.floor(age / DECADE)]++; }
      const names = [['learning', C.learn], ['serving', C.serve], ['teaching', C.teach]];
      names.forEach(([n, col], i) => { font(700, 28); text(`${counts[i]} ${n}`, 150 + i * 250, 600, { align: 'center', base: 'middle', color: col }); });
    });
    A(seg(t, 38.6, 39.4) * (1 - seg(t, 41.4, 41.8)), () => {
      font(700, 28); text(`A NEW GIRL EVERY ${EVERY} YEARS`, CX, 600, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    });
  });
}

// ---------- E: Occia; the fire relit ----------
function sceneOccia(t) {
  A(span(t, 46.2, 51.2, 0.4, 0.4), () => {
    const L = 92, R = 772, X = (y) => L + (R - L) * (y / 60);
    font(700, 26); text('THE USUAL TERM', L, 200, { base: 'middle', color: C.soft, spacing: '1px' });
    ctx.fillStyle = C.serve; ctx.fillRect(L, 222, (X(TERM) - L) * eio(seg(t, 46.6, 47.6)), 56);
    font(700, 26); text('OCCIA, 38 BC – AD 19', L, 340, { base: 'middle', color: C.stay, spacing: '1px' });
    ctx.fillStyle = C.stay; ctx.fillRect(L, 362, (X(OCCIA) - L) * eio(seg(t, 47.8, 49.4)), 56);
    font(800, 34);
    A(seg(t, 47.4, 47.8), () => text(`${TERM}`, X(TERM) + 12, 251, { base: 'middle' }));
    A(seg(t, 49.2, 49.6), () => text(`${OCCIA} YEARS`, X(OCCIA) - 12, 391, { align: 'right', base: 'middle', color: '#1b1410' }));
    A(seg(t, 49.0, 49.8), () => { font(500, 24, SERIF); text('free to marry after 30 years; few did', CX, 480, { align: 'center', base: 'middle', color: C.soft }); });
  });
  A(span(t, 51.0, 55.8, 0.4, 0.4), () => {
    // the fire out, then lit again from the Sun with a concave mirror (Plutarch)
    const cx = CX, cy = 520, lit = seg(t, 53.6, 54.2);
    ctx.fillStyle = 'rgba(60,40,30,0.9)'; ctx.fillRect(cx - 60, cy, 120, 22);
    flame(cx, cy, 0.9, t, lit);
    A(1 - lit, () => { for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(160,150,140,${0.35 - i * 0.1})`; ctx.beginPath(); ctx.arc(cx + i * 8, cy - 40 - i * 34, 14 + i * 6, 0, TAU); ctx.fill(); } });
    // sun and mirror
    A(seg(t, 52.2, 52.8), () => {
      ctx.fillStyle = C.fire1; ctx.beginPath(); ctx.arc(150, 170, 46, 0, TAU); ctx.fill();
      const mx = 640, my = 360;
      ctx.strokeStyle = '#d8b25a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(mx + 150, my - 60, 170, Math.PI * 0.86, Math.PI * 1.08); ctx.stroke();
      const rays = eio(seg(t, 52.6, 53.6));
      ctx.strokeStyle = 'rgba(255,209,102,0.8)'; ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        const hx = mx - 18 + i * 3, hy = my - 60 + i * 34;
        ctx.beginPath(); ctx.moveTo(lerp(190, hx, 0), lerp(190, hy, 0)); ctx.lineTo(lerp(190, hx, rays), lerp(190, hy, rays) + i * 4); ctx.stroke();
        A(clamp(rays * 2 - 1), () => { ctx.beginPath(); ctx.moveTo(hx, hy + i * 4); ctx.lineTo(cx, cy - 6); ctx.stroke(); });
      }
      font(500, 22, SERIF); text('a concave mirror, says Plutarch', 610, 560, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- F: the end ----------
function sceneEnd(t) {
  A(span(t, 55.6, 65.4, 0.4, 0.0), () => {
    temple(CX, 560, 0.62, t, { glow: 1 - 0.85 * seg(t, 60.4, 63.4) });
    const items = [[56.0, 'AD 382', 'Emperor Gratian takes away the cult’s funds', C.ink], [57.4, 'AD 385', 'Coelia Concordia, the last Vestal known by name', C.ink], [60.6, 'AD 394?', 'a later tale of the last Vestal, doubted', C.soft]];
    items.forEach(([t0, d, s, col], i) => A(seg(t, t0, t0 + 0.6), () => {
      const y = 620 + i * 48;
      font(700, 26); text(d, 70, y, { base: 'middle', color: i === 2 ? C.stay : C.fire1 });
      font(400, 24, SERIF); text(s, 200, y + 1, { base: 'middle', color: col });
    }));
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.night1); lg.addColorStop(1, C.night2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,240,220,${0.1 + r() * 0.3})`; g.fillRect(r() * W, r() * 300, 1.5, 1.5); }
}

const CUES = [
  [0.4, 4.8, 'In the Roman Forum stood the round *Temple of Vesta*, goddess of the hearth.'],
  [5.0, 9.4, 'Inside burned a sacred ~fire~. Romans believed Rome’s safety depended on it.'],
  [9.6, 14.0, 'Six priestesses kept it: the *Vestal Virgins*, who lived in the house behind the temple.'],
  [14.2, 18.6, 'The chief priest chose each one as a girl of 6 to 10, by lot from twenty candidates.'],
  [18.8, 23.2, 'She vowed to serve for at least *30 years*, and to stay unmarried all that time.'],
  [23.4, 27.8, 'Ten years *learning*, ten *performing the rites*, ten *teaching* the new girls.'],
  [28.0, 32.4, 'That is the rule as the ancient writers Dionysius of Halicarnassus and Plutarch give it.'],
  [32.6, 37.0, 'They took turns at the hearth, so that one of them was always with the ~fire~.'],
  [37.2, 41.6, 'If each served exactly 30 years, six places need a new girl only every *5 years*.'],
  [41.8, 46.2, 'In that model, there are always ~two~ learning, ~two~ serving and ~two~ teaching.'],
  [46.4, 50.8, 'After 30 years a Vestal could leave and marry. Few did: Occia served *57 years*.'],
  [51.0, 55.4, 'If the fire went out, the Vestal responsible was whipped. Plutarch says it was relit by sunlight.'],
  [55.6, 60.0, 'Emperor Gratian cut their funds in AD 382; the last named Vestal is from AD 385.'],
  [60.2, 64.6, 'A later tale puts the last Vestal in 394, under Emperor Theodosius I; historians doubt it.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneTemple(t);
    scenePlan(t);
    sceneYears(t);
    sceneRota(t);
    sceneOccia(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.serve, '~': C.fire2 } });
  },
});
