// "Public-key cryptography: how strangers share secrets in public", a long-form explainer (16:9, about 11 minutes).
// Look: a cipher room. A deep green-black field with a faint grid, scanlines and ghost columns of hex, painted once;
// phosphor green for the machine, amber for everything public (what Eve can see), coral for Alice, cyan for Bob, gold
// for a shared key, violet for Eve, magenta for Mallory. Padlocks, keys, envelopes and people as simple line icons;
// numbers tick and decode like a terminal. Space Grotesk for titles, Space Mono for numbers and labels.
// Widescreen: the two parties stand on the sides, the channel and the maths run across the middle.
// Every animation is keyed to a narration line in window.TL, so the dialogue version (same keys) shares this file.
// The numbers are computed below: the 23-hour clock, the key exchange, the toy RSA key (61, 53), its signature,
// the trial divisions, Jevons's factors, RSA-129's factors and RFC 3526's 2048-bit prime. Facts: see script.mjs.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const TITLE = 'Space Grotesk', MONO = 'Space Mono';

const C = {
  bg0: '#020806', bg1: '#0B231C', bg2: '#05120E',
  ink: '#E3F8EC', soft: 'rgba(227,248,236,0.76)', faint: 'rgba(227,248,236,0.48)', ghost: 'rgba(227,248,236,0.16)',
  green: '#52F0A0', greenSoft: 'rgba(82,240,160,0.6)', greenFaint: 'rgba(82,240,160,0.24)', greenGhost: 'rgba(82,240,160,0.08)',
  amber: '#FFB84A', amberSoft: 'rgba(255,184,74,0.62)', amberFaint: 'rgba(255,184,74,0.24)',
  alice: '#FF8A6A', bob: '#5ED4F6', eve: '#CB98FF', mallory: '#FF4F93', gold: '#FFE08A', red: '#FF6262',
  panel: 'rgba(5,20,15,0.9)', panelHead: 'rgba(82,240,160,0.09)',
};

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const ap = (t, t0, d = 0.5) => eout(seg(t, t0, t0 + d));
function glow(col, b) { ctx.shadowColor = col; ctx.shadowBlur = b; }
function noGlow() { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }
function txt(str, x, y, { size = 36, weight = 500, fam = TITLE, color = C.ink, align = 'left', base = 'middle', spacing = '0px', g = 0 } = {}) {
  k.font(weight, size, fam);
  if (g) glow(color, g);
  k.text(str, x, y, { color, align, base, spacing });
  if (g) noGlow();
}
function tw(str, size, weight = 500, fam = TITLE) { k.font(weight, size, fam); return ctx.measureText(str).width; }
const mono = (str, x, y, o = {}) => txt(str, x, y, { fam: MONO, weight: 400, ...o });

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}
const hsh = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

// ---------- the numbers ----------
function pmB(b, x, m) { let r = 1n; b %= m; while (x > 0n) { if (x & 1n) r = (r * b) % m; b = (b * b) % m; x >>= 1n; } return r; }
const pm = (b, x, m) => Number(pmB(BigInt(b), BigInt(x), BigInt(m)));
const P = 23, G = 5, SA = 3, SB = 7;
const PUB_A = pm(G, SA, P), PUB_B = pm(G, SB, P), KEY = pm(PUB_B, SA, P);
if (KEY !== pm(PUB_A, SB, P) || KEY !== pm(G, SA * SB, P)) throw new Error('key exchange failed');
const SEQ = [1]; for (let i = 0; i < 22; i++) SEQ.push((SEQ[SEQ.length - 1] * G) % P); // 1, 5, 2, 10, 4, 20, ...
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const RP = 61, RQ = 53, RN = RP * RQ, LAM = ((RP - 1) * (RQ - 1)) / gcd(RP - 1, RQ - 1), RE = 17;
let RD = 1; while ((RE * RD) % LAM !== 1) RD++;
const MSG = 65, CT = pm(MSG, RE, RN), EVE_TRY = pm(CT, RE, RN);
if (pm(CT, RD, RN) !== MSG) throw new Error('rsa failed');
const SIGM = 1977, SIG = pm(SIGM, RD, RN);
if (pm(SIG, RE, RN) !== SIGM) throw new Error('signature failed');
const POW65 = (65n ** 17n).toLocaleString('en-US');
const POW_DIGITS = (65n ** 17n).toString().length;
// square-and-multiply: the remainders Bob's computer passes through on the way to 65
const TRACE = (() => { let r = 1; const out = []; for (const bit of RD.toString(2)) { r = (r * r) % RN; out.push(r); if (bit === '1') { r = (r * CT) % RN; out.push(r); } } return out; })();
const JEV = 8616460799, JA = 89681, JB = 96079;
if (JA * JB !== JEV) throw new Error('Jevons');
const SIEVE = (() => { const n = 96080, c = new Uint8Array(n); const out = []; for (let i = 2; i < n; i++) { if (!c[i]) { out.push(i); for (let j = i * i; j < n; j += i) c[j] = 1; } } return out; })();
const TRY_N = SIEVE.indexOf(RQ) + 1, TRY_J = SIEVE.indexOf(JA) + 1; // 16, 8,687
const RSA129 = '114381625757888867669235779976146612010218296721242362562561842935706935245733897830597123563958705058989075147599290026879543541';
const R129P = '3490529510847650949147849619903898133417764638493387843990820577';
const R129Q = (BigInt(RSA129) / BigInt(R129P)).toString();
if (BigInt(R129P) * BigInt(R129Q) !== BigInt(RSA129)) throw new Error('RSA-129');
// RFC 3526, group 14: a 2048-bit prime used for Diffie–Hellman
const MODP = BigInt('0x' + 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF').toString();
if (MODP.length !== 617) throw new Error('MODP digits');

// ---------- text effects ----------
const GL = '0123456789ABCDEF#%&*+=<>/';
const prefixCache = new Map();
/** Draws str with each character resolving from random glyphs, left to right, in its final position. */
function decode(str, x, y, t, t0, dur, { size = 40, weight = 400, fam = MONO, color = C.ink, align = 'left', g = 0, scr = C.green } = {}) {
  if (t < t0 - 0.3) return;
  k.font(weight, size, fam);
  const ck = `${weight}|${size}|${fam}|${str}`;
  let xs = prefixCache.get(ck);
  if (!xs) { xs = []; for (let i = 0; i <= str.length; i++) xs.push(ctx.measureText(str.slice(0, i)).width); prefixCache.set(ck, xs); }
  const full = xs[str.length], x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
  const fr = Math.floor(t * 24), n = str.length;
  if (g) glow(color, g);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    const at = t0 + dur * (n > 1 ? i / (n - 1) : 0);
    if (t < at - 0.3) continue;
    const done = t >= at;
    ctx.fillStyle = done ? color : scr;
    ctx.fillText(done ? ch : GL[Math.floor(hsh(i, fr, n) * GL.length)], x0 + xs[i], y);
  }
  if (g) noGlow();
}
/** Digits spin until t0 + dur, then settle on the real value (commas and other characters stay). */
function ticking(str, t, t0, dur, seed = 1) {
  if (t >= t0 + dur) return str;
  const fr = Math.floor(t * 20);
  return [...str].map((ch, i) => (ch >= '0' && ch <= '9' ? String(Math.floor(hsh(i, fr, seed) * 10)) : ch)).join('');
}
const typed = (str, t, t0, cps = 38) => str.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
const countUp = (v, t, t0, t1) => fmt(Math.round(v * eio(seg(t, t0, t1))));

// ---------- background, painted once ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(960, 520, 80, 960, 540, 1250);
  rad.addColorStop(0, C.bg1); rad.addColorStop(0.55, C.bg2); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // ghost columns of hex, like a dump scrolled past long ago
  const rnd = mulberry32(1976);
  g.font = `400 22px "${MONO}"`; g.textBaseline = 'top';
  for (let col = 0; col < 34; col++) {
    const x = 28 + col * 57 + rnd() * 10, a = 0.02 + rnd() * 0.035, y0 = -rnd() * 400;
    g.fillStyle = `rgba(82,240,160,${a})`;
    for (let y = y0; y < H; y += 30) if (rnd() < 0.72) g.fillText('0123456789ABCDEF'[Math.floor(rnd() * 16)] + '0123456789ABCDEF'[Math.floor(rnd() * 16)], x, y);
  }
  // a faint grid
  g.strokeStyle = 'rgba(82,240,160,0.035)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 64) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y <= H; y += 64) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  // scanlines and grain
  g.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 7; d[i] += n * 0.7; d[i + 1] += n; d[i + 2] += n * 0.8; }
  g.putImageData(img, 0, 0);
  const vg = g.createRadialGradient(960, 540, 420, 960, 540, 1150);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.2) c = ch; return c; }
function background(t) {
  if (!bg) paintBackground();
  ctx.drawImage(bg, 0, 0);
  // a slow bright band rolling down the screen, like an old monitor
  const yb = ((t * 70) % (H + 400)) - 200;
  const lg = ctx.createLinearGradient(0, yb - 120, 0, yb + 120);
  lg.addColorStop(0, 'rgba(82,240,160,0)'); lg.addColorStop(0.5, 'rgba(82,240,160,0.022)'); lg.addColorStop(1, 'rgba(82,240,160,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, yb - 120, W, 240);
  const on = ap(t, 0.1, 1.2);
  A(on, () => {
    txt('RECKON', 96, 100, { size: 32, weight: 700, color: C.green, spacing: '5px', g: 10 });
    const rw = tw('RECKON', 32, 700) + 5 * 6;
    mono('TECH · CRYPTOGRAPHY', 96 + rw + 26, 101, { size: 32, color: C.faint, spacing: '2px' });
    const ch = chapterAt(t);
    if (ch) A(seg(t, ch.at + 2.2, ch.at + 3.2), () => mono(`${String(ch.n).padStart(2, '0')} · ${ch.title.toUpperCase()}`, 1824, 101, { size: 32, color: C.faint, align: 'right', spacing: '1px' }));
  });
}

// ---------- icons ----------
function person(x, y, sc, col, label, a = 1, mask = false) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.lineWidth = 4.5; ctx.strokeStyle = col; ctx.fillStyle = C.panel;
    ctx.beginPath(); ctx.moveTo(-64, 54); ctx.bezierCurveTo(-64, 0, -34, -10, 0, -10); ctx.bezierCurveTo(34, -10, 64, 0, 64, 54); ctx.closePath();
    ctx.fill(); glow(col, 16); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.arc(0, -50, 30, 0, Math.PI * 2); ctx.fill(); glow(col, 16); ctx.stroke(); noGlow();
    if (mask) { ctx.fillStyle = col; ctx.fillRect(-30, -60, 60, 14); ctx.fillStyle = C.bg0; ctx.fillRect(-20, -56, 12, 6); ctx.fillRect(8, -56, 12, 6); }
    ctx.restore();
    if (label) mono(label, x, y + 92 * sc, { size: 34, weight: 700, color: col, align: 'center', spacing: '4px', g: 8 });
  });
}
function eye(x, y, sc, t, look = 0, a = 1, label = 'EVE') {
  if (a <= 0) return;
  A(a, () => {
    const ph = (t + 1.3) % 5.7, open = 1 - (ph < 0.18 ? Math.sin((ph / 0.18) * Math.PI) : 0);
    const shape = () => { ctx.beginPath(); ctx.moveTo(x - 74 * sc, y); ctx.quadraticCurveTo(x, y - 56 * sc * open, x + 74 * sc, y); ctx.quadraticCurveTo(x, y + 56 * sc * open, x - 74 * sc, y); ctx.closePath(); };
    ctx.save(); shape(); ctx.fillStyle = C.panel; ctx.fill(); ctx.clip();
    const ix = x + clamp(look, -1, 1) * 22 * sc;
    ctx.fillStyle = 'rgba(203,152,255,0.85)'; ctx.beginPath(); ctx.arc(ix, y, 25 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(ix, y, 11 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(ix - 7 * sc, y - 7 * sc, 4.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    shape(); ctx.lineWidth = 4.5; ctx.strokeStyle = C.eve; glow(C.eve, 16); ctx.stroke(); noGlow();
    if (label) mono(label, x + 100 * sc, y + 2, { size: 34, weight: 700, color: C.eve, spacing: '4px', g: 8 });
  });
}
function padlock(x, y, sc, col, open = 0, a = 1, fill = C.panel) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.lineCap = 'round';
    const lift = 22 * eio(clamp(open));
    ctx.beginPath(); ctx.moveTo(-24, 2 - lift); ctx.lineTo(-24, -30 - lift); ctx.arc(0, -30 - lift, 24, Math.PI, 0); ctx.lineTo(24, lerp(2, -22, eio(clamp(open))) - lift);
    glow(col, 14); ctx.stroke(); noGlow();
    k.rrect(-40, 0, 80, 64, 11); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; glow(col, 14); ctx.stroke(); noGlow();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 25, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, 28); ctx.lineTo(5, 28); ctx.lineTo(0, 46); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}
function keyIcon(x, y, sc, col, rot = 0, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-34, 0);
    ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.lineCap = 'round'; glow(col, 14);
    ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(19, 0); ctx.lineTo(86, 0); ctx.moveTo(68, 0); ctx.lineTo(68, 16); ctx.moveTo(82, 0); ctx.lineTo(82, 20); ctx.stroke();
    noGlow(); ctx.restore();
  });
}
function envelope(x, y, w, h, col, a = 1, open = 0) {
  if (a <= 0) return;
  A(a, () => {
    k.rrect(x - w / 2, y - h / 2, w, h, 8); ctx.fillStyle = C.panel; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = col; glow(col, 10); ctx.stroke();
    const fy = lerp(y + 6, y - h / 2 - h * 0.45, eio(clamp(open)));
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 3, y - h / 2 + 3); ctx.lineTo(x, fy); ctx.lineTo(x + w / 2 - 3, y - h / 2 + 3); ctx.stroke(); noGlow();
    if (open > 0.5) A(seg(open, 0.5, 1), () => { ctx.fillStyle = col; for (let i = 0; i < 3; i++) ctx.fillRect(x - w * 0.3, y + 4 + i * 16 - 8, w * (i === 2 ? 0.35 : 0.6), 5); });
  });
}
/** A rounded chip with a label, e.g. a number travelling on the channel. */
function chip(x, y, label, col, { size = 40, a = 1, padX = 22, h = null, fill = C.panel, weight = 700, g = 12, fam = MONO, dash = false } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const w = tw(label, size, weight, fam) + padX * 2, hh = h ?? size * 1.55;
    k.rrect(x - w / 2, y - hh / 2, w, hh, 12); ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = col; if (dash) ctx.setLineDash([8, 7]); glow(col, g); ctx.stroke(); noGlow(); ctx.setLineDash([]);
    txt(label, x, y + 1, { size, weight, fam, color: col, align: 'center' });
  });
}
function panel(x, y, w, h, title, col = C.green, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    k.rrect(x, y, w, h, 14); ctx.fillStyle = C.panel; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = col === C.green ? C.greenFaint : col; ctx.globalAlpha *= col === C.green ? 1 : 0.55; ctx.stroke(); ctx.globalAlpha /= col === C.green ? 1 : 0.55;
    if (title) {
      ctx.save(); k.rrect(x, y, w, 58, [14, 14, 0, 0]); ctx.clip(); ctx.fillStyle = C.panelHead; ctx.fillRect(x, y, w, 58); ctx.restore();
      mono(title, x + 24, y + 30, { size: 32, weight: 700, color: col, spacing: '3px' });
    }
  });
}
function arrow(x0, y0, x1, y1, col, { lw = 4, head = 18, a = 1, dash = null, p = 1 } = {}) {
  if (a <= 0 || p <= 0) return;
  A(a, () => {
    const xe = lerp(x0, x1, p), ye = lerp(y0, y1, p), ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; glow(col, 8);
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe - Math.cos(ang) * head * 0.6, ye - Math.sin(ang) * head * 0.6); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(xe, ye); ctx.lineTo(xe - Math.cos(ang - 0.42) * head, ye - Math.sin(ang - 0.42) * head); ctx.lineTo(xe - Math.cos(ang + 0.42) * head, ye - Math.sin(ang + 0.42) * head); ctx.closePath(); ctx.fill();
    noGlow();
  });
}
/** The public channel: a dashed amber wire with traffic flowing along it. */
function channel(x0, x1, y, t, a = 1, label = 'PUBLIC CHANNEL') {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = C.amberFaint; ctx.lineWidth = 3; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.13 + i / 7) % 1), px = lerp(x0, x1, i % 2 ? 1 - u : u);
      ctx.fillStyle = `rgba(255,184,74,${0.35 * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.arc(px, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (label) mono(label, (x0 + x1) / 2, y + 44, { size: 32, color: C.amberSoft, align: 'center', spacing: '3px' });
  });
}
function check(x, y, sz, col, p = 1) {
  if (p <= 0) return;
  ctx.strokeStyle = col; ctx.lineWidth = sz * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; glow(col, 10);
  const pts = [[x - sz * 0.45, y], [x - sz * 0.1, y + sz * 0.35], [x + sz * 0.5, y - sz * 0.4]];
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  const q = clamp(p) * 2;
  if (q <= 1) ctx.lineTo(lerp(pts[0][0], pts[1][0], q), lerp(pts[0][1], pts[1][1], q));
  else { ctx.lineTo(...pts[1]); ctx.lineTo(lerp(pts[1][0], pts[2][0], q - 1), lerp(pts[1][1], pts[2][1], q - 1)); }
  ctx.stroke(); noGlow();
}
function cross(x, y, sz, col, p = 1) {
  if (p <= 0) return;
  ctx.strokeStyle = col; ctx.lineWidth = sz * 0.16; ctx.lineCap = 'round'; glow(col, 10);
  const q = clamp(p) * 2;
  ctx.beginPath(); ctx.moveTo(x - sz / 2, y - sz / 2); ctx.lineTo(lerp(x - sz / 2, x + sz / 2, Math.min(1, q)), lerp(y - sz / 2, y + sz / 2, Math.min(1, q)));
  if (q > 1) { ctx.moveTo(x + sz / 2, y - sz / 2); ctx.lineTo(lerp(x + sz / 2, x - sz / 2, q - 1), lerp(y - sz / 2, y + sz / 2, q - 1)); }
  ctx.stroke(); noGlow();
}
function stamp(str, x, y, col, a, rot = -0.08, size = 64) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(1.5, 1, back(clamp(a))); ctx.scale(sc, sc);
    const w = tw(str, size, 700, MONO) + str.length * 4 + 70;
    k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 10); ctx.fillStyle = 'rgba(2,8,6,0.82)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = col; glow(col, 14); ctx.stroke(); noGlow();
    txt(str, 0, 2, { size, weight: 700, fam: MONO, color: col, align: 'center', spacing: '4px' });
    ctx.restore();
  });
}
/** A run of mono text with raised exponents: segs = [{ s, sup, col }]. */
function mathRun(segs, x, y, { size = 44, align = 'left', a = 1, weight = 400 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const ws = segs.map((sg) => tw(sg.s, sg.sup ? size * 0.62 : size, sg.w ?? weight, MONO));
    let px = align === 'center' ? x - ws.reduce((p, q) => p + q, 0) / 2 : align === 'right' ? x - ws.reduce((p, q) => p + q, 0) : x;
    segs.forEach((sg, i) => {
      txt(sg.s, px, sg.sup ? y - size * 0.34 : y, { size: sg.sup ? size * 0.62 : size, weight: sg.w ?? weight, fam: MONO, color: sg.col ?? C.ink, g: sg.g ?? 0 });
      px += ws[i];
    });
  });
}
const mathW = (segs, size = 44, weight = 400) => segs.reduce((p, sg) => p + tw(sg.s, sg.sup ? size * 0.62 : size, sg.w ?? weight, MONO), 0);
function browser(x, y, w, h, a = 1, lockOn = 0) {
  if (a <= 0) return;
  A(a, () => {
    k.rrect(x, y, w, h, 16); ctx.fillStyle = C.panel; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.greenSoft; glow(C.green, 10); ctx.stroke(); noGlow();
    ctx.fillStyle = C.panelHead; ctx.save(); k.rrect(x, y, w, 70, [16, 16, 0, 0]); ctx.clip(); ctx.fillRect(x, y, w, 70); ctx.restore();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = C.greenFaint; ctx.beginPath(); ctx.arc(x + 32 + i * 28, y + 35, 8, 0, Math.PI * 2); ctx.fill(); }
    k.rrect(x + 130, y + 14, w - 160, 42, 21); ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.stroke();
    padlock(x + 158, y + 30, 0.28, C.green, 0, lockOn);
    mono('https://', x + 186, y + 36, { size: 32, color: C.soft });
    for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(227,248,236,0.12)'; ctx.fillRect(x + 40, y + 110 + i * 48, (w - 80) * (i % 3 === 2 ? 0.55 : 0.92), 18); }
  });
}
function server(x, y, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    for (let i = 0; i < 4; i++) {
      k.rrect(x - 130, y - 160 + i * 84, 260, 68, 10); ctx.fillStyle = C.panel; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.greenSoft; glow(C.green, 8); ctx.stroke(); noGlow();
      for (let j = 0; j < 3; j++) { ctx.fillStyle = j === 0 ? C.green : C.greenFaint; ctx.beginPath(); ctx.arc(x + 70 + j * 22, y - 126 + i * 84, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(227,248,236,0.14)'; ctx.fillRect(x - 104, y - 132 + i * 84, 120, 12);
    }
  });
}

// ---------- paint (geometric mean of reflectance, so the order of mixing doesn't matter) ----------
const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixRGB = (...cs) => [0, 1, 2].map((ch) => Math.round(Math.exp(cs.reduce((p, c) => p + Math.log(Math.max(6, c[ch])), 0) / cs.length)));
const lerpRGB = (a, b, x) => a.map((v, i) => Math.round(lerp(v, b[i], x)));
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const YEL = hexRGB('#F4C83A'), RED = hexRGB('#E8434C'), BLU = hexRGB('#2F8CF0');
const ORA = mixRGB(YEL, RED), GRN = mixRGB(YEL, BLU);
const lift = (c, f = 1.25) => c.map((v) => Math.min(255, Math.round(v * f)));
const BRN_A = lift(mixRGB(YEL, RED, BLU)), BRN_B = lift(mixRGB(YEL, BLU, RED));
function jar(x, y, rgb, level, a = 1, swirl = 0, swirlRGB = null) {
  if (a <= 0) return;
  A(a, () => {
    const w = 150, h = 190, l = x - w / 2, top = y - h / 2;
    ctx.save(); k.rrect(l, top + 16, w, h - 16, [10, 10, 24, 24]); ctx.clip();
    ctx.fillStyle = 'rgba(227,248,236,0.04)'; ctx.fillRect(l, top, w, h);
    if (rgb && level > 0) {
      const ly = y + h / 2 - level * (h - 26);
      glow(rgba(rgb), 30);
      ctx.fillStyle = rgba(rgb, 0.92); ctx.beginPath(); ctx.moveTo(l, ly);
      for (let i = 0; i <= 20; i++) ctx.lineTo(l + (w * i) / 20, ly + Math.sin(i * 0.9 + x * 0.01) * 2.4);
      ctx.lineTo(l + w, y + h / 2); ctx.lineTo(l, y + h / 2); ctx.closePath(); ctx.fill(); noGlow();
      if (swirl > 0 && swirlRGB) {
        ctx.strokeStyle = rgba(swirlRGB, 0.85 * swirl); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath();
        const cy0 = (ly + y + h / 2) / 2;
        for (let i = 0; i <= 40; i++) { const u = i / 40, ang = u * 9 + (1 - swirl) * 4, rr = (1 - u) * (w * 0.36) * swirl + 4; const px = x + Math.cos(ang) * rr, py = cy0 + Math.sin(ang) * rr * 0.45; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(l + 14, top + 30, 9, h - 60);
    ctx.restore();
    ctx.strokeStyle = 'rgba(227,248,236,0.62)'; ctx.lineWidth = 3.5; k.rrect(l, top + 16, w, h - 16, [10, 10, 24, 24]); ctx.stroke();
    k.rrect(l - 8, top, w + 16, 20, 6); ctx.fillStyle = 'rgba(227,248,236,0.1)'; ctx.fill(); ctx.stroke();
  });
}
function swatch(x, y, rgb, a = 1, r = 34, label = null) {
  if (a <= 0) return;
  A(a, () => {
    if (rgb) { ctx.fillStyle = rgba(rgb); glow(rgba(rgb), 16); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); noGlow(); }
    else { ctx.strokeStyle = C.eve; ctx.lineWidth = 3; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    if (label) txt(label, x, y + 2, { size: 40, weight: 700, fam: MONO, color: rgb ? C.bg0 : C.eve, align: 'center' });
  });
}
function drop(x0, y0, x1, y1, p, rgb, r = 13) {
  if (p <= 0 || p >= 1) return;
  const u = eio(p), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 90;
  ctx.fillStyle = rgba(rgb); glow(rgba(rgb), 14); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); noGlow();
}

// ---------- the 23-hour clock ----------
const angOf = (v, n = P) => -Math.PI / 2 + (v / n) * Math.PI * 2;
function dial(cx, cy, R, t, { a = 1, built = 1, hand = null, trail = [], trailA = 1, mark = null, markCol = C.gold, center = 'mod 23' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eio(clamp(built))); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R - 70, 0, Math.PI * 2); ctx.strokeStyle = C.greenGhost; ctx.stroke();
    for (let i = 0; i < P; i++) {
      const ta = clamp((built - i / P * 0.9) * 6);
      if (ta <= 0) continue;
      const an = angOf(i), c = Math.cos(an), sn = Math.sin(an);
      A(ta, () => {
        ctx.strokeStyle = C.greenSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + c * (R - 16), cy + sn * (R - 16)); ctx.lineTo(cx + c * R, cy + sn * R); ctx.stroke();
        mono(String(i), cx + c * (R + 40), cy + sn * (R + 40) + 1, { size: 32, color: i === mark ? markCol : C.soft, align: 'center', weight: i === mark ? 700 : 400 });
      });
    }
    // the trail of jumps: chords between successive positions
    if (trail.length > 1) A(trailA, () => {
      for (let i = 1; i < trail.length; i++) {
        const v0 = i === 1 ? trail[0] : trail[i - 1][0], [v1, p] = trail[i];
        if (p <= 0) continue;
        const a0 = angOf(v0), a1 = angOf(v1), r = R - 24;
        const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
        ctx.strokeStyle = `rgba(255,184,74,${0.35 + 0.4 * (i / trail.length)})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); ctx.stroke();
      }
    });
    if (center) mono(center, cx, cy + 96, { size: 34, color: C.faint, align: 'center' });
    if (hand != null) {
      const an = -Math.PI / 2 + (hand / P) * Math.PI * 2;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 7; ctx.lineCap = 'round'; glow(C.amber, 16);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * (R - 40), cy + Math.sin(an) * (R - 40)); ctx.stroke();
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx + Math.cos(an) * (R - 24), cy + Math.sin(an) * (R - 24), 11, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill(); noGlow();
    }
  });
}
/** The hand's position (as a float, moving forward round the dial) for jumps at the given times. */
function handAt(t, jumps) {
  let pos = jumps[0].v;
  for (let i = 1; i < jumps.length; i++) {
    const j = jumps[i], p = eio(seg(t, j.at, j.at + (j.d ?? 0.6)));
    if (p <= 0) break;
    const prev = jumps[i - 1].v, fwd = (((j.v - prev) % P) + P) % P;
    pos = prev + fwd * p;
  }
  return pos % P;
}

// ---------- title cards and credits ----------
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.45, 0.55);
    if (a <= 0) continue;
    A(a * 0.86, () => { ctx.fillStyle = C.bg0; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const y = 540, p = eout(seg(t, ch.at, ch.at + 0.8));
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(960 - 640 * p, y - 130); ctx.lineTo(960 + 640 * p, y - 130); ctx.moveTo(960 - 640 * p, y + 120); ctx.lineTo(960 + 640 * p, y + 120); ctx.stroke();
      decode(`PART ${String(ch.n).padStart(2, '0')}`, 960, y - 78, t, ch.at + 0.15, 0.5, { size: 36, weight: 700, color: C.amber, align: 'center', g: 10, scr: C.amberSoft });
      decode(ch.title, 960, y + 20, t, ch.at + 0.35, 1.0, { size: 104, weight: 600, fam: TITLE, color: C.ink, align: 'center', g: 14 });
      const cur = Math.floor(t * 2.2) % 2 === 0 && t < ch.at + 3.4;
      if (cur) { ctx.fillStyle = C.green; ctx.fillRect(960 + tw(ch.title, 104, 600) / 2 + 18, y - 22, 22, 74); }
    });
  }
}
function credits(t) {
  const a = seg(t, e('z5', 1.0), e('z5', 2.2));
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = 'rgba(2,8,6,0.985)'; ctx.fillRect(0, 0, W, H);
    txt('Public-key cryptography', 960, 196, { size: 84, weight: 600, color: C.green, align: 'center', g: 16 });
    txt('Reckon · original animation', 960, 276, { size: 38, weight: 500, color: C.ink, align: 'center' });
    const blocks = [
      ['MUSIC', ['“Unwritten Return” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Dream Catcher” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Sincerely” Kevin MacLeod (incompetech.com) · CC BY 4.0']],
      ['SOURCES', [
        'Wikipedia: Public-key cryptography · Diffie–Hellman key exchange · RSA cryptosystem',
        'RSA numbers · The Magic Words are Squeamish Ossifrage · Digital signature · William Stanley Jevons',
        'James H. Ellis · Clifford Cocks · Malcolm J. Williamson · Whitfield Diffie · Martin Hellman',
        'Transport Layer Security · Shor’s algorithm · NIST Post-Quantum Cryptography Standardization',
        'W. Diffie & M. E. Hellman, “New Directions in Cryptography”, IEEE Trans. Inf. Theory, 1976 · RFC 3526',
      ]],
    ];
    let y = 368;
    for (const [hd, lines] of blocks) {
      mono(hd, 960, y, { size: 32, weight: 700, color: C.amber, align: 'center', spacing: '4px' });
      lines.forEach((ln, j) => txt(ln, 960, y + 50 + j * 44, { size: 32, weight: 400, color: C.soft, align: 'center' }));
      y += 50 + lines.length * 44 + 40;
    }
    mono('All numbers on screen computed in the animation', 960, 960, { size: 32, color: C.faint, align: 'center' });
  });
}

// ---------- shared layout ----------
const AX = 300, BX = 1620, CY = 640;
function trio(t, a, { y = CY, eveY = 400, look = 0, keys = 0, keyCol = C.gold, chan = 1, label = 'PUBLIC CHANNEL', eveA = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    channel(AX + 120, BX - 120, y, t, chan, label);
    person(AX, y, 1, C.alice, 'ALICE');
    person(BX, y, 1, C.bob, 'BOB');
    eye(960, eveY, 1, t, look, eveA);
    keyIcon(AX, y - 150, 0.9, keyCol, 0, keys);
    keyIcon(BX, y - 150, 0.9, keyCol, 0, keys);
  });
}

// ================= parts =================
// ---- cold open: Jevons's number, easy and hard, then the title
function partOpen(t) {
  const aA = 1 - seg(t, s('o5', -0.2), s('o5', 0.5));
  A(aA, () => {
    // Jevons's book, as a card on the left
    const c = ap(t, s('o1', 0.2), 0.7);
    panel(150, 230, 640, 330, 'THE PRINCIPLES OF SCIENCE', C.green, c);
    A(c, () => {
      decode('1874', 190, 380, t, s('o1', 0.5), 0.5, { size: 110, weight: 700, color: C.amber, g: 14, scr: C.amberSoft });
      txt('W. S. Jevons', 190, 490, { size: 48, weight: 600, color: C.ink });
    });
    // the quote
    A(ap(t, s('o3', 0.1), 0.5), () => {
      txt('“', 150, 680, { size: 120, weight: 700, color: C.amber, g: 10 });
      const l1 = 'I think it unlikely that anyone', l2 = 'but myself will ever know.”';
      txt(typed(l1, t, s('o3', 0.3), 22), 220, 680, { size: 44, weight: 500, color: C.ink });
      txt(typed(l2, t, s('o3', 0.3 + l1.length / 22), 22), 220, 744, { size: 44, weight: 500, color: C.ink });
    });
    // the number
    decode('8,616,460,799', 1340, 380, t, s('o2', 0.3), 1.3, { size: 112, weight: 700, color: C.amber, align: 'center', g: 18, scr: C.amberSoft });
    A(ap(t, s('o2', 1.9), 0.6), () => {
      mono('=', 1060, 520, { size: 80, color: C.soft, align: 'center' });
      for (const [x, i] of [[1220, 0], [1500, 1]]) {
        ctx.strokeStyle = C.greenSoft; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); k.rrect(x - 100, 470, 200, 100, 14); ctx.stroke(); ctx.setLineDash([]);
        mono('?', x, 522, { size: 72, weight: 700, color: C.green, align: 'center', g: 10 });
        if (i === 0) mono('×', 1360, 520, { size: 72, color: C.soft, align: 'center' });
      }
    });
    // easy one way, hard the other
    const o4 = s('o4');
    A(ap(t, o4 + 0.1), () => {
      mono('a × b', 980, 680, { size: 44, color: C.ink, align: 'center' });
      arrow(1080, 680, 1560, 680, C.green, { p: eout(seg(t, o4 + 0.3, o4 + 0.7)), lw: 5 });
      mono('n', 1610, 680, { size: 44, color: C.ink, align: 'center' });
      mono('EASY', 1320, 636, { size: 34, weight: 700, color: C.green, align: 'center', spacing: '4px' });
    });
    A(ap(t, mid('o4', 0.5)), () => {
      mono('n', 980, 820, { size: 44, color: C.ink, align: 'center' });
      const p = 0.06 + 0.5 * seg(t, mid('o4', 0.55), s('o5', 0)) ** 0.5;
      arrow(1080, 820, 1560, 820, C.amber, { p, lw: 5, dash: [10, 10] });
      mono('a × b', 1610, 820, { size: 44, color: C.faint, align: 'left' });
      mono('HARD', 1320, 776, { size: 34, weight: 700, color: C.amber, align: 'center', spacing: '4px' });
    });
  });
  // a secure page, then the strangers and the listener
  const aB = span(t, s('o5', 0.1), s('o7', 0.4), 0.6, 0.6);
  A(aB, () => {
    const shrink = eio(seg(t, s('o6', -0.1), s('o6', 0.8)));
    A(1 - shrink, () => browser(560, 230, 800, 470, 1, ap(t, s('o5', 1.0))));
    A(shrink, () => {
      trio(t, 1, { look: Math.sin(t * 0.9) * 0.8, keys: ap(t, mid('o6', 0.55), 0.6) });
      A(ap(t, mid('o6', 0.6)), () => mono('one secret, agreed in public', 960, 860, { size: 34, color: C.gold, align: 'center' }));
    });
  });
  // the title
  const o7 = s('o7');
  A(ap(t, o7 + 0.2, 0.6), () => {
    decode('PUBLIC-KEY', 960, 400, t, o7 + 0.3, 0.8, { size: 132, weight: 700, fam: TITLE, color: C.ink, align: 'center', g: 10 });
    decode('CRYPTOGRAPHY', 960, 540, t, o7 + 0.6, 0.9, { size: 132, weight: 700, fam: TITLE, color: C.green, align: 'center', g: 22 });
    A(ap(t, o7 + 1.6), () => mono('how strangers share secrets in public', 960, 660, { size: 38, color: C.soft, align: 'center' }));
    A(ap(t, mid('o7', 0.75)), () => {
      chip(640, 800, 'GCHQ · IN SECRET', C.red, { size: 34 });
      chip(1220, 800, 'STANFORD & MIT · IN PUBLIC', C.green, { size: 34 });
    });
  });
}

// ---- 1 the key problem
const NETS = new Map();
function net(n) {
  if (NETS.has(n)) return NETS.get(n);
  const cv = document.createElement('canvas'); cv.width = 760; cv.height = 760;
  const g = cv.getContext('2d'), cx = 380, cy = 380, r = 330;
  const pts = Array.from({ length: n }, (_, i) => [cx + Math.cos(-Math.PI / 2 + (i / n) * Math.PI * 2) * r, cy + Math.sin(-Math.PI / 2 + (i / n) * Math.PI * 2) * r]);
  // up to 100 people, every pair's line; for 1,000, a random sample of the 499,500 (too many to tell apart)
  g.strokeStyle = `rgba(82,240,160,${n <= 10 ? 0.7 : n <= 100 ? 0.16 : 0.06})`; g.lineWidth = n <= 10 ? 2.5 : n <= 100 ? 1 : 0.6;
  if (n <= 100) for (let i = 0; i < n; i++) { g.beginPath(); for (let j = i + 1; j < n; j++) { g.moveTo(...pts[i]); g.lineTo(...pts[j]); } g.stroke(); }
  else { const rnd = mulberry32(499500); for (let b = 0; b < 40; b++) { g.beginPath(); for (let q = 0; q < 200; q++) { const i = Math.floor(rnd() * n), j = Math.floor(rnd() * n); g.moveTo(...pts[i]); g.lineTo(...pts[j]); } g.stroke(); } }
  g.fillStyle = '#FFB84A';
  for (const [x, y] of pts) { g.beginPath(); g.arc(x, y, n <= 10 ? 13 : n <= 100 ? 5 : 2.2, 0, Math.PI * 2); g.fill(); }
  NETS.set(n, cv);
  return cv;
}
function partKey(t) {
  const aT = 1 - seg(t, s('k4', -0.3), s('k4', 0.4));
  A(aT, () => {
    const msgX = lerp(AX + 160, BX - 160, eio(seg(t, s('k2', 0.9), s('k2', 3.0))));
    channel(AX + 120, BX - 120, CY, t, 1);
    person(AX, CY, 1, C.alice, 'ALICE');
    person(BX, CY, 1, C.bob, 'BOB');
    const kA = ap(t, s('k1', 0.8));
    keyIcon(AX, CY - 160, 0.9, C.green, 0, kA);
    keyIcon(BX, CY - 160, 0.9, C.green, 0, kA * (1 - seg(t, s('k3', 0), s('k3', 0.3))));
    A(kA * (1 - seg(t, s('k3', 0), s('k3', 0.4))), () => {
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(AX + 80, CY - 160); ctx.lineTo(BX - 80, CY - 160); ctx.stroke(); ctx.setLineDash([]);
      mono('THE SAME SECRET KEY', 960, CY - 200, { size: 34, weight: 700, color: C.green, align: 'center', spacing: '3px' });
    });
    // the message, locked, crossing over
    const ea = ap(t, s('k1', 1.4));
    const lockClose = 1 - eio(seg(t, s('k2', 0.2), s('k2', 0.8)));
    const unlock = eio(seg(t, s('k2', 3.1), s('k2', 3.7)));
    envelope(msgX, CY - 30, 120, 80, C.ink, ea, unlock);
    padlock(msgX, CY + 20, 0.45, C.green, Math.max(1 - ap(t, s('k2', 0.1), 0.2) * (1 - lockClose), unlock), ea * (1 - unlock * 0.6));
    // the key travels too: by courier, below
    const k3 = s('k3');
    A(span(t, k3 + 0.2, s('k4', 0), 0.5, 0.4), () => {
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 3; ctx.setLineDash([6, 10]);
      ctx.beginPath(); ctx.moveTo(AX + 60, 860); ctx.bezierCurveTo(800, 960, 1120, 960, BX - 60, 860); ctx.stroke(); ctx.setLineDash([]);
      const u = eio(seg(t, k3 + 0.6, e('k3', 0.4)));
      const bx = (1 - u) ** 3 * (AX + 60) + 3 * (1 - u) ** 2 * u * 800 + 3 * (1 - u) * u * u * 1120 + u ** 3 * (BX - 60);
      const by = (1 - u) ** 3 * 860 + 3 * (1 - u) ** 2 * u * 960 + 3 * (1 - u) * u * u * 960 + u ** 3 * 860;
      k.rrect(bx - 50, by - 34, 100, 68, 10); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 20, by - 34); ctx.lineTo(bx - 20, by - 48); ctx.lineTo(bx + 20, by - 48); ctx.lineTo(bx + 20, by - 34); ctx.stroke();
      keyIcon(bx, by + 2, 0.45, C.green);
      mono('BY COURIER · FACE TO FACE', 960, 1000 - 40, { size: 32, color: C.amberSoft, align: 'center', spacing: '2px' });
    });
  });
  // every pair needs a key
  const aN = span(t, s('k4', 0.1), s('k7', 0.1), 0.6, 0.5);
  A(aN, () => {
    const ns = [[4, s('k4', 0.2)], [10, s('k5', 0.1)], [100, mid('k5', 0.72)], [1000, s('k6', 0.2)]];
    ns.forEach(([n, at], i) => {
      const nx = ns[i + 1]?.[1] ?? 1e9;
      const a = span(t, at, nx + 0.5, 0.6, 0.5);
      if (a > 0) A(a, () => ctx.drawImage(net(n), 640 - 380, 600 - 380));
    });
    A(span(t, s('k4', 0.4), mid('k5', 0.1), 0.5, 0.4), () => {
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
        const a0 = -Math.PI / 2 + (i / 4) * Math.PI * 2, a1 = -Math.PI / 2 + (j / 4) * Math.PI * 2;
        const mx = 640 + (Math.cos(a0) + Math.cos(a1)) * 165, my = 600 + (Math.sin(a0) + Math.sin(a1)) * 165;
        keyIcon(mx + (i + j === 3 && (i === 0 || i === 1) ? (i === 0 ? 40 : -40) : 0), my + (i + j === 3 ? (i === 0 ? -40 : 40) : 0), 0.4, C.green);
      }
    });
    panel(1150, 300, 620, 470, 'PEOPLE        KEYS', C.green, 1);
    const rows = [[4, 6, s('k4', 0.6)], [10, 45, s('k5', 0.3)], [100, 4950, mid('k5', 0.76)], [1000, 499500, s('k6', 0.3)]];
    rows.forEach(([n, kk, at], i) => {
      const a = ap(t, at);
      if (a <= 0) return;
      A(a, () => {
        const y = 410 + i * 90, hi = t > at && (rows[i + 1] ? t < rows[i + 1][2] : true);
        mono(fmt(n), 1200, y, { size: 48, weight: 700, color: hi ? C.amber : C.soft });
        mono(ticking(fmt(kk), t, at, 0.8, i + 3), 1720, y, { size: 48, weight: 700, color: hi ? C.green : C.soft, align: 'right', g: hi ? 10 : 0 });
      });
    });
    A(ap(t, s('k5', 0.6)), () => mono('keys = n × (n − 1) ÷ 2', 1460, 836, { size: 36, color: C.faint, align: 'center' }));
  });
  // the name for it
  const k7 = s('k7');
  A(span(t, k7 + 0.2, s('k8', 0.1), 0.5, 0.5), () => {
    mono('>', 300, 520, { size: 56, weight: 700, color: C.green, g: 10 });
    decode('KEY DISTRIBUTION PROBLEM', 360, 520, t, k7 + 1.6, 1.2, { size: 64, weight: 700, color: C.ink, g: 8 });
    A(ap(t, k7 + 3.0), () => mono('Diffie & Hellman, 1976: “a major barrier”', 360, 620, { size: 36, color: C.amberSoft }));
  });
  // the impossible-sounding answer
  A(ap(t, s('k8', 0.2), 0.6), () => {
    trio(t, 1, { look: Math.sin(t * 0.8) * 0.9 });
    const pulse = 0.6 + 0.4 * Math.sin(t * 4);
    A(ap(t, mid('k8', 0.4)), () => {
      chip(960, CY - 120, '?', C.gold, { size: 64, g: 20 * pulse });
      mono('a key, agreed in full view', 960, 880, { size: 36, color: C.gold, align: 'center' });
    });
  });
}

// ---- 2 new directions
function partNew(t) {
  // two researchers, one long meeting
  A(1 - seg(t, s('n3', -0.2), s('n3', 0.4)), () => {
    A(ap(t, s('n1', 0.2)), () => decode('1974', 960, 250, t, s('n1', 0.3), 0.4, { size: 72, weight: 700, color: C.amber, align: 'center', g: 12 }));
    const cards = [[560, 'Whitfield Diffie', 'independent researcher', C.alice, s('n1', 0.6)], [1360, 'Martin Hellman', 'young professor, Stanford', C.bob, mid('n1', 0.6)]];
    for (const [x, name, role, col, at] of cards) {
      const a = ap(t, at, 0.6);
      panel(x - 330, 320, 660, 200, null, C.green, a);
      A(a, () => { txt(name, x, 392, { size: 56, weight: 600, color: col, align: 'center', g: 6 }); mono(role, x, 462, { size: 34, color: C.soft, align: 'center' }); });
    }
    const n2 = s('n2');
    A(ap(t, n2 + 0.1), () => {
      const cx = 960, cy = 760, R = 140;
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.amberFaint; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 8, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2; ctx.strokeStyle = C.greenSoft; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (R - 14), cy + Math.sin(an) * (R - 14)); ctx.lineTo(cx + Math.cos(an) * R, cy + Math.sin(an) * R); ctx.stroke(); }
      const turns = 4.5 * eio(seg(t, n2 + 0.3, e('n2', 1.2)));
      const an = -Math.PI / 2 + turns * Math.PI * 2;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 6; ctx.lineCap = 'round'; glow(C.amber, 12);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * (R - 26), cy + Math.sin(an) * (R - 26)); ctx.stroke(); noGlow();
      mono('planned: 0:30', 700, 720, { size: 36, color: C.amber, align: 'right' });
      mono(`actual: ${turns < 0.5 ? '0:' + String(Math.floor(turns * 60)).padStart(2, '0') : 'hours'}`, 1220, 800, { size: 36, color: turns < 0.5 ? C.soft : C.green, g: turns < 0.5 ? 0 : 8 });
    });
  });
  // the paper and its first line
  A(span(t, s('n3', 0.1), s('n5', 0.1), 0.6, 0.5), () => {
    panel(360, 230, 1200, 640, 'IEEE TRANS. INFORMATION THEORY · NOV 1976', C.green, 1);
    txt('New Directions in Cryptography', 960, 400, { size: 70, weight: 600, color: C.ink, align: 'center', g: 6 });
    mono('Whitfield Diffie and Martin E. Hellman', 960, 490, { size: 36, color: C.soft, align: 'center' });
    const n4 = s('n4', 1.0), l1 = '“We stand today on the brink', l2 = 'of a revolution in cryptography.”';
    txt(typed(l1, t, n4, 20), 460, 640, { size: 56, weight: 500, color: C.green, g: 8 });
    txt(typed(l2, t, n4 + l1.length / 20, 20), 460, 720, { size: 56, weight: 500, color: C.green, g: 8 });
    // the dialogue version adds a line about the award (Wikipedia, "Martin Hellman"): shown only when that line exists
    if (T.x6) A(ap(t, mid('x6', 0.45)), () => chip(960, 818, '2015 · TURING AWARD', C.gold, { size: 34 }));
    const done = t > n4 + (l1.length + l2.length) / 20;
    if (t > n4 && Math.floor(t * 2.4) % 2 === 0) { const w = tw(done ? l2 : t > n4 + l1.length / 20 ? typed(l2, t, n4 + l1.length / 20, 20) : typed(l1, t, n4, 20), 56, 500); ctx.fillStyle = C.green; ctx.fillRect(464 + w, t > n4 + l1.length / 20 ? 694 : 614, 16, 52); }
  });
  // one key becomes two
  const n5 = s('n5');
  const aK = span(t, n5 + 0.1, s('n7', 0.2), 0.5, 0.5);
  A(aK, () => {
    const sp = eio(seg(t, n5 + 0.8, n5 + 2.0));
    const kx = 960, ky = 360;
    keyIcon(lerp(kx, 560, sp), ky, 1.6, sp < 0.5 ? C.gold : C.amber, 0, 1);
    keyIcon(lerp(kx, 1360, sp), ky, 1.6, sp < 0.5 ? C.gold : C.green, 0, sp > 0.02 ? 1 : 0);
    A(ap(t, n5 + 1.8), () => {
      mono('PUBLIC · LOCKS', 560, 460, { size: 36, weight: 700, color: C.amber, align: 'center', spacing: '3px' });
      mono('PRIVATE · UNLOCKS', 1360, 460, { size: 36, weight: 700, color: C.green, align: 'center', spacing: '3px' });
    });
    // n6: lock with the public key; it can't open it; the private key can
    const n6 = s('n6');
    const shut = eio(seg(t, n6 + 0.4, n6 + 1.1));
    const ex = 960, ey = 720;
    A(ap(t, n6 + 0.1), () => {
      envelope(ex, ey, 220, 140, C.ink, 1, eio(seg(t, mid('n6', 0.86), mid('n6', 0.96))));
      padlock(ex, ey + 60, 0.75, C.amber, 1 - shut + eio(seg(t, mid('n6', 0.78), mid('n6', 0.86))), 1);
      // the public key tries and fails
      const tryA = span(t, mid('n6', 0.32), mid('n6', 0.6), 0.3, 0.3);
      keyIcon(ex - 190 + Math.sin(t * 40) * 6 * tryA, ey + 90, 0.8, C.amber, 0, tryA);
      A(tryA, () => cross(ex - 300, ey + 90, 48, C.red, seg(t, mid('n6', 0.4), mid('n6', 0.5))));
      const okA = span(t, mid('n6', 0.66), 1e9, 0.3, 0);
      keyIcon(ex + 200, ey + 90, 0.8, C.green, Math.PI, okA);
      A(okA, () => check(ex + 320, ey + 90, 52, C.green, seg(t, mid('n6', 0.82), mid('n6', 0.92))));
    });
  });
  // n7: a public directory; anyone can lock a message for Bob
  const n7 = s('n7');
  A(span(t, n7 + 0.1, s('n8', 0.1), 0.5, 0.5), () => {
    panel(140, 220, 760, 560, 'PUBLIC DIRECTORY', C.amber, 1);
    const names = ['ALICE', 'BOB', 'CAROL', 'DAVE', 'ERIN'], rnd = mulberry32(7);
    names.forEach((nm, i) => {
      const a = ap(t, n7 + 0.3 + i * 0.25);
      const hex = Array.from({ length: 4 }, () => Math.floor(rnd() * 65536).toString(16).toUpperCase().padStart(4, '0')).join(' ');
      A(a, () => {
        const y = 330 + i * 92, hi = nm === 'BOB';
        mono(nm, 190, y, { size: 38, weight: 700, color: hi ? C.bob : C.soft });
        padlock(450, y - 18, 0.36, C.amber, 1, 1);
        mono(hex, 500, y, { size: 32, color: hi ? C.amber : C.faint });
      });
    });
    person(1620, 520, 1, C.bob, 'BOB');
    keyIcon(1620, 340, 0.8, C.green);
    for (let i = 0; i < 3; i++) {
      const at = mid('n7', 0.35 + i * 0.16), u = eio(seg(t, at, at + 1.4));
      if (u <= 0) continue;
      const y0 = 420 + i * 170, x = lerp(1000, 1450, u), y = lerp(y0, 540, u);
      A(1 - seg(u, 0.85, 1), () => { envelope(x, y, 110, 74, C.ink, 1); padlock(x, y + 34, 0.32, C.amber, 0, 1); });
    }
  });
  // n8–n9: the trapdoor one-way function, and its missing piece
  const n8 = s('n8');
  A(span(t, n8 + 0.1, s('n10', 0.1), 0.5, 0.5), () => {
    decode('TRAPDOOR ONE-WAY FUNCTION', 960, 270, t, n8 + 2.0, 1.0, { size: 60, weight: 700, fam: TITLE, color: C.ink, align: 'center', g: 8 });
    chip(420, 520, 'input', C.ink, { size: 44, a: ap(t, n8 + 0.4) });
    chip(1500, 520, 'output', C.ink, { size: 44, a: ap(t, n8 + 0.4) });
    arrow(560, 470, 1350, 470, C.green, { p: eout(seg(t, n8 + 0.8, n8 + 1.5)), lw: 6, head: 24 });
    A(ap(t, n8 + 1.2), () => mono('EASY TO COMPUTE', 960, 428, { size: 36, weight: 700, color: C.green, align: 'center', spacing: '3px' }));
    const rev = ap(t, mid('n8', 0.45));
    A(rev, () => {
      arrow(1350, 590, 560, 590, C.amber, { lw: 6, head: 24, dash: [12, 12] });
      // the wall across the way back, with a door in it
      ctx.fillStyle = C.panel; ctx.fillRect(930, 552, 60, 80); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.strokeRect(930, 552, 60, 80);
      mono('HARD TO UNDO', 960, 680, { size: 36, weight: 700, color: C.amber, align: 'center', spacing: '3px' });
    });
    const trap = ap(t, mid('n8', 0.72)) * (1 - ap(t, s('n9', 1.2)));
    A(trap, () => {
      keyIcon(960, 790, 0.9, C.green);
      mono('unless you hold the secret', 960, 870, { size: 36, color: C.green, align: 'center' });
    });
    stamp('STILL LARGELY OPEN', 960, 800, C.red, ap(t, s('n9', 1.4), 0.4), -0.06, 56);
  });
  // n10–n11: what they did have, and Merkle
  const n10 = s('n10');
  A(span(t, n10 + 0.1, 1e9, 0.6, 0), () => {
    const fade = 1 - 0.7 * ap(t, mid('n10', 0.5));
    A(fade, () => {
      trio(t, 1, { look: Math.sin(t) * 0.8, keys: ap(t, mid('n10', 0.38), 0.4) });
      const u = eio(seg(t, s('n10', 0.1), mid('n10', 0.36)));
      if (u > 0 && u < 1) { chip(lerp(AX + 150, BX - 150, u), CY - 4, '→', C.amber, { size: 40 }); chip(lerp(BX - 150, AX + 150, u), CY + 60, '←', C.amber, { size: 40 }); }
    });
    A(ap(t, mid('n10', 0.55)), () => {
      panel(510, 220, 900, 230, null, C.green, 1);
      txt('Ralph Merkle', 960, 290, { size: 60, weight: 600, color: C.ink, align: 'center', g: 6 });
      mono('public key distribution · Berkeley, 1974', 960, 370, { size: 34, color: C.soft, align: 'center' });
    });
    A(ap(t, mid('n10', 0.8)), () => {
      txt('Diffie–Hellman–', 960 - tw('Merkle', 56, 700) / 2, 520, { size: 56, weight: 700, color: C.soft, align: 'center' });
      txt('Merkle', 960 + tw('Diffie–Hellman–', 56, 700) / 2, 520, { size: 56, weight: 700, color: C.green, align: 'center', g: 12 });
      mono('the name Hellman suggested in 2006', 960, 590, { size: 34, color: C.faint, align: 'center' });
    });
  });
}

// ---- 3 mixing in public: paint, the clock, the exchange
const JX_A = 440, JX_B = 1480, JY = 640, PAN_A = 220, PAN_B = 1700, PAN_Y = 800;
function partMix(t) {
  const aPaint = 1 - seg(t, s('m8', -0.3), s('m8', 0.4));
  A(aPaint, () => paintStage(t));
  A(span(t, s('m8', 0.0), s('m12', 0.2), 0.6, 0.6), () => clockStage(t));
  A(span(t, s('m12', 0.0), 1e9, 0.6, 0), () => exchangeStage(t));
}
function paintStage(t) {
  const dim = 1 - 0.94 * ap(t, s('m6', 0.1));
  const m1 = s('m1'), m2 = s('m2'), m3 = s('m3'), m4 = s('m4');
  A(dim, () => {
    mono('ALICE', JX_A, 470, { size: 36, weight: 700, color: C.alice, align: 'center', spacing: '4px', g: 8 });
    mono('BOB', JX_B, 470, { size: 36, weight: 700, color: C.bob, align: 'center', spacing: '4px', g: 8 });
    eye(960, 230, 0.9, t, Math.sin(t * 0.7) * 0.9, 1);
    // the public pot
    const pot = span(t, m1 + 0.3, m4, 0.5, 0.6);
    jar(960, JY, YEL, 0.75 - 0.4 * eio(seg(t, m1 + 1.6, m1 + 3.4)), pot);
    A(pot, () => mono('PUBLIC', 960, JY + 135, { size: 32, color: C.amberSoft, align: 'center', spacing: '3px' }));
    const jt = JY - 70;
    drop(960, jt, JX_A, jt, seg(t, m1 + 1.6, m1 + 2.8), YEL, 15);
    drop(960, jt, JX_B, jt, seg(t, m1 + 2.2, m1 + 3.4), YEL, 15);
    // the secret pans
    const pans = ap(t, m2 + 0.2);
    for (const [x, rgb] of [[PAN_A, RED], [PAN_B, BLU]]) A(pans * (1 - 0.4 * ap(t, m3 + 0.3)), () => {
      k.rrect(x - 50, PAN_Y - 34, 100, 68, 12); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(227,248,236,0.5)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = rgba(rgb); glow(rgba(rgb), 12); k.rrect(x - 36, PAN_Y - 22, 72, 44, 8); ctx.fill(); noGlow();
      mono('SECRET', x, PAN_Y + 70, { size: 32, color: C.soft, align: 'center', spacing: '2px' });
    });
    drop(PAN_A, PAN_Y - 30, JX_A, jt, seg(t, m2 + 1.0, m2 + 2.0), RED);
    drop(PAN_B, PAN_Y - 30, JX_B, jt, seg(t, m2 + 1.0, m2 + 2.0), BLU);
    drop(PAN_A, PAN_Y - 30, JX_A, jt, seg(t, m4 + 0.3, m4 + 1.3), RED);
    drop(PAN_B, PAN_Y - 30, JX_B, jt, seg(t, m4 + 0.3, m4 + 1.3), BLU);
    const fillA = eio(seg(t, m1 + 2.6, m1 + 3.4)) * 0.42, fillB = eio(seg(t, m1 + 3.2, m1 + 3.9)) * 0.42;
    const mix1 = eio(seg(t, m2 + 1.8, m2 + 3.2)), mix2 = eio(seg(t, m4 + 1.2, m4 + 2.6));
    let colA = lerpRGB(YEL, ORA, mix1), colB = lerpRGB(YEL, GRN, mix1), levA = fillA + 0.14 * mix1, levB = fillB + 0.14 * mix1;
    const sw = eio(seg(t, m3 + 0.4, m3 + 2.6));
    const jAx = lerp(JX_A, JX_B, sw), jAy = JY + Math.sin(sw * Math.PI) * 80;
    const jBx = lerp(JX_B, JX_A, sw), jBy = JY - Math.sin(sw * Math.PI) * 140;
    const second = t > m4;
    if (second) { colA = lerpRGB(ORA, BRN_B, mix2); colB = lerpRGB(GRN, BRN_A, mix2); levA = levB = 0.56 + 0.12 * mix2; }
    const swirl = second ? span(t, m4 + 1.2, m4 + 3.0, 0.2, 0.6) : span(t, m2 + 1.8, m2 + 3.4, 0.2, 0.6);
    jar(jAx, jAy, colA, levA, 1, swirl, second ? BLU : RED);
    jar(jBx, jBy, colB, levB, 1, swirl, second ? RED : BLU);
    A(span(t, m4 + 2.4, 1e9, 0.5, 0), () => {
      mono('=', 960, JY, { size: 96, weight: 700, color: C.ink, align: 'center', g: 10 });
      mono('SAME COLOUR', 960, JY + 135, { size: 32, weight: 700, color: C.gold, align: 'center', spacing: '3px' });
    });
    // Eve's notes: everything that crossed in public
    const notes = [[YEL, m1 + 3.0], [ORA, m3 + 1.8], [GRN, m3 + 2.2], [null, s('m5', 0.6)]];
    notes.forEach(([rgb, at], i) => swatch(780 + i * 120, 345, rgb, ap(t, at, 0.4), 32, rgb ? null : '?'));
  });
  // m6–m7: where the picture breaks
  const m6 = s('m6');
  A(ap(t, m6 + 0.3), () => {
    panel(150, 300, 760, 520, 'PAINT', C.amber, 1);
    panel(1010, 300, 760, 520, 'NUMBERS', C.green, 1);
    swatch(330, 520, BRN_A, 1, 52);
    arrow(410, 520, 560, 520, C.soft, { lw: 5 });
    [RED, BLU, YEL].forEach((c, i) => swatch(620 + i * 90, 520, c, 0.55, 32));
    cross(710, 520, 90, C.red, seg(t, m6 + 1.4, m6 + 2.0));
    mono("can't be unmixed", 530, 700, { size: 36, color: C.amber, align: 'center' });
    A(ap(t, mid('m6', 0.62)), () => {
      const tries = Math.floor(Math.max(0, t - mid('m6', 0.62)) * 6) + 1;
      const big = t > s('m7', 0.3);
      const shown = big ? ticking('8,214,903,557,120,441,…', t, 1e9, 1, 9) : `${Math.min(tries, 99)}`;
      mono('try secret:', 1070, 480, { size: 40, color: C.soft });
      mono(shown, 1070, 560, { size: 44, weight: 700, color: C.green, g: 10 });
      mono('can always be undone', 1390, 700, { size: 36, color: C.green, align: 'center' });
    });
    A(ap(t, s('m7', 0.4)), () => {
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.strokeRect(1070, 610, 640, 26);
      ctx.fillStyle = C.green; ctx.fillRect(1072, 612, 2 + 3 * seg(t, s('m7', 0.4), e('m7')), 22);
      mono('… if there are few enough', 1390, 770, { size: 34, color: C.faint, align: 'center' });
    });
  });
}
const DCX = 700, DCY = 600, DR = 290;
function clockStage(t) {
  const m8 = s('m8'), m9 = s('m9'), m10 = s('m10');
  const built = seg(t, m8 + 0.3, m8 + 2.0);
  // the jumps: 1 → 5 → 2 in m9, then on round the whole cycle in m10
  const jumps = [{ v: 1, at: 0 }, { v: SEQ[1], at: mid('m9', 0.3) }, { v: SEQ[2], at: mid('m9', 0.62) }];
  const rest = SEQ.slice(3);
  rest.forEach((v, i) => {
    const u = i < 3 ? 0.08 + i * 0.16 : 0.56 + ((i - 3) / (rest.length - 3)) * 0.6;
    jumps.push({ v, at: lerp(s('m10'), e('m10', 0.8), Math.min(u, 0.98)), d: i < 3 ? 0.55 : 0.28 });
  });
  const handOn = ap(t, s('m9', 0.2));
  const trail = jumps.slice(1).map((j) => [j.v, eio(seg(t, j.at, j.at + (j.d ?? 0.6)))]);
  const m11 = s('m11');
  const trailA = 1 - 0.75 * ap(t, m11 + 0.4);
  const showMark = ap(t, mid('m11', 0.35));
  const jumpsH = [...jumps, { v: SEQ[15], at: s('m11', 0.2), d: 0.9 }]; // the hand stops at 19 (5 to the 15th)
  dial(DCX, DCY, DR, t, { built, hand: handOn > 0 ? handAt(t, jumpsH) : null, trail: [1, ...trail], trailA, mark: showMark > 0.5 ? 19 : null });
  // the log on the right
  panel(1160, 230, 660, 600, 'STEP × 5, KEEP REMAINDER', C.green, ap(t, m9 + 0.2));
  const lines = [];
  for (let i = 1; i < jumps.length; i++) {
    const prev = jumps[i - 1].v, prod = prev * G;
    lines.push({ s: `${fmt(prev)} × 5 = ${fmt(prod)}${prod >= P ? ` → ${prod % P}` : ''}`, at: jumps[i].at, v: jumps[i].v });
  }
  const shown = lines.filter((l) => t >= l.at - 0.1);
  const first = Math.max(0, shown.length - 7);
  A(ap(t, m9 + 0.2) * (1 - ap(t, m11 + 0.2)), () => {
    shown.slice(first).forEach((l, i) => {
      const isLast = i === shown.length - first - 1;
      mono(l.s, 1200, 320 + i * 70, { size: 40, color: isLast ? C.amber : C.soft, g: isLast ? 8 : 0 });
    });
  });
  // forward easy, backward hard
  A(ap(t, m11 + 0.3), () => {
    mathRun([{ s: '5' }, { s: 'k', sup: true }, { s: ' → ' }, { s: '19', col: C.gold, w: 700 }], 1220, 380, { size: 48 });
    check(1660, 380, 50, C.green, seg(t, m11 + 0.6, m11 + 1.0));
    mono('forward: easy', 1220, 450, { size: 36, color: C.green });
    mathRun([{ s: '19', col: C.gold, w: 700 }, { s: ' → k = ?' }], 1220, 570, { size: 48, a: ap(t, mid('m11', 0.35)) });
    A(ap(t, mid('m11', 0.4)), () => mono('back: hard', 1220, 640, { size: 36, color: C.amber }));
    A(ap(t, mid('m11', 0.6)), () => decode('DISCRETE LOGARITHM', 1490, 760, t, mid('m11', 0.6), 0.8, { size: 44, weight: 700, color: C.amber, align: 'center', g: 10 }));
  });
}
const PLX = 120, PRX = 1260, PW = 540, PY = 300, PH = 560;
function exchangeStage(t) {
  const m12 = s('m12'), m13 = s('m13'), m14 = s('m14'), m15 = s('m15'), m16 = s('m16'), m17 = s('m17'), m18 = s('m18');
  const wall = ap(t, mid('m18', 0.42));
  A(1 - wall, () => {
    eye(960, 220, 0.85, t, Math.sin(t * 0.8) * 0.9, 1, null);
    // Eve's notebook: every number that crossed
    const heard = [[String(P), m12 + 0.9], [String(G), m12 + 1.3], [String(PUB_A), mid('m13', 0.85)], [String(PUB_B), mid('m14', 0.85)]];
    heard.forEach(([v, at], i) => chip(760 + i * 100, 340, v, C.amber, { size: 36, a: ap(t, at, 0.4) }));
    A(ap(t, m17 + 0.4), () => {
      chip(1172, 340, `${KEY}?`, C.eve, { size: 36, dash: true, g: 6 });
      mono(`needs ${SA} or ${SB}`, 960, 420, { size: 36, color: C.eve, align: 'center' });
    });
    channel(PLX + PW + 20, PRX - 20, 640, t, 1, null);
    // the public numbers
    A(ap(t, m12 + 0.3), () => { chip(870, 780, `p = ${P}`, C.amber, { size: 40 }); chip(1050, 780, `g = ${G}`, C.amber, { size: 40 }); });
    // the two terminals
    const sides = [
      { x: PLX, col: C.alice, name: 'ALICE', sec: SA, me: s('m13'), out: PUB_A, got: PUB_B, at2: m15 },
      { x: PRX, col: C.bob, name: 'BOB', sec: SB, me: s('m14'), out: PUB_B, got: PUB_A, at2: mid('m15', 0.5) },
    ];
    for (const sd of sides) {
      panel(sd.x, PY, PW, PH, sd.name, sd.col, ap(t, m12 + 0.2));
      const r1 = ap(t, sd.me + 0.4), r2 = ap(t, mid(sd === sides[0] ? 'm13' : 'm14', 0.42)), r3 = ap(t, mid(sd === sides[0] ? 'm13' : 'm14', 0.62));
      const x0 = sd.x + 34;
      A(r1, () => { mono('secret', x0, PY + 110, { size: 36, color: C.soft }); chip(x0 + 230, PY + 110, String(sd.sec), sd.col, { size: 44 }); padlock(x0 + 330, PY + 92, 0.32, sd.col); });
      const pw = G ** sd.sec;
      mathRun([{ s: '5' }, { s: String(sd.sec), sup: true, col: sd.col }, { s: ` = ${fmt(pw)}` }], x0, PY + 200, { size: 40, a: r2 });
      mathRun([{ s: `mod ${P} = ` }, { s: String(sd.out), col: C.amber, w: 700, g: 8 }], x0, PY + 265, { size: 40, a: r3 });
      // second round, with the number from the other side
      const q1 = ap(t, sd.at2 + 0.2), q2 = ap(t, sd.at2 + 1.0);
      const pw2 = BigInt(sd.got) ** BigInt(sd.sec);
      mathRun([{ s: String(sd.got), col: C.amber }, { s: String(sd.sec), sup: true, col: sd.col }, { s: ` = ${pw2.toLocaleString('en-US')}` }], x0, PY + 370, { size: 40, a: q1 });
      mathRun([{ s: `mod ${P} = ` }, { s: String(KEY), col: C.gold, w: 700, g: 14 }], x0, PY + 435, { size: 40, a: q2 });
      A(ap(t, m16 + 0.3), () => { keyIcon(sd.x + PW / 2, PY + 510, 0.8, C.gold); });
    }
    // the numbers sent, in the open
    const send = (at, from, to, v) => { const u = eio(seg(t, at, at + 1.4)); if (u > 0 && u < 1) chip(lerp(from, to, u), 640, String(v), C.amber, { size: 44 }); };
    send(mid('m13', 0.7), PLX + PW, PRX, PUB_A);
    send(mid('m14', 0.7), PRX, PLX + PW, PUB_B);
    // why: both took 3 × 7 = 21 steps
    A(ap(t, mid('m16', 0.4)), () => {
      mathRun([{ s: '5' }, { s: `${SA}×${SB}`, sup: true }, { s: ' = 5' }, { s: String(SA * SB), sup: true }, { s: ' → ' }, { s: String(KEY), col: C.gold, w: 700, g: 14 }], 960, 900, { size: 44, align: 'center' });
    });
    // m18: Eve just tries every step
    const bf = ap(t, m18 + 0.2);
    A(bf * (1 - ap(t, mid('m18', 0.38))), () => {
      const n = 1 + Math.min(SA - 1, Math.floor(Math.max(0, t - m18 - 0.5) * 2.2));
      const found = n >= SA && t > m18 + 0.5 + (SA - 1) / 2.2 + 0.3;
      k.rrect(700, 470, 520, 100, 12); ctx.fillStyle = 'rgba(5,20,15,0.95)'; ctx.fill(); ctx.strokeStyle = C.eve; ctx.lineWidth = 3; ctx.stroke();
      mathRun([{ s: '5' }, { s: String(n), sup: true, col: C.eve }, { s: ` mod 23 = ${pm(G, n, P)}` }], 740, 520, { size: 40 });
      if (found) check(1170, 520, 44, C.eve, 1);
    });
  });
  // the real size: a 2048-bit prime, all 617 digits
  A(wall, () => {
    const per = 77, rows = Math.ceil(MODP.length / per), y0 = 300;
    const shownN = Math.floor(MODP.length * eio(seg(t, mid('m18', 0.42), mid('m18', 0.42) + 2.4)));
    k.font(400, 30, MONO);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      const row = MODP.slice(r * per, Math.min((r + 1) * per, shownN));
      if (!row) continue;
      ctx.fillStyle = r % 2 ? C.greenSoft : C.green;
      ctx.fillText(row, 960 - (per * 18.0) / 2, y0 + r * 48);
    }
    A(ap(t, mid('m18', 0.7)), () => {
      mono('A 2,048-BIT PRIME · 617 DIGITS', 960, 760, { size: 44, weight: 700, color: C.amber, align: 'center', spacing: '2px', g: 10 });
      mono('one used for real key exchanges (RFC 3526)', 960, 830, { size: 34, color: C.faint, align: 'center' });
    });
  });
}

// ---- 4 a lock anyone can close: RSA
function partRSA(t) {
  const r1 = s('r1'), r2 = s('r2'), r3 = s('r3'), r4 = s('r4'), r6 = s('r6'), r7 = s('r7'), r11 = s('r11');
  // r1: the missing public lock
  A(span(t, r1 + 0.1, r2 + 0.2, 0.6, 0.5), () => {
    padlock(960, 470, 2.4, C.amber, 1);
    mono('?', 960, 560, { size: 84, weight: 700, color: C.amber, align: 'center', g: 14 });
    A(ap(t, r1 + 1.6), () => mono('a lock anyone can close', 960, 800, { size: 40, color: C.soft, align: 'center' }));
  });
  // r2–r3: three people, a year of attempts
  A(span(t, r2 + 0.1, r4 + 0.2, 0.6, 0.5), () => {
    A(ap(t, r2 + 0.3), () => mono('MIT', 960, 240, { size: 44, weight: 700, color: C.amber, align: 'center', spacing: '6px', g: 10 }));
    const names = [['Ron Rivest', 420], ['Adi Shamir', 960], ['Leonard Adleman', 1500]];
    names.forEach(([nm, x], i) => {
      const a = ap(t, r2 + 0.8 + i * 0.5);
      const role = ap(t, r3 + 0.3) * (i === 2 ? 0 : 1), roleA = ap(t, mid('r3', 0.5)) * (i === 2 ? 1 : 0);
      panel(x - 250, 290, 500, 170, null, C.green, a);
      A(a, () => {
        txt(nm, x, 352, { size: 50, weight: 600, color: C.ink, align: 'center' });
        A(Math.max(role, roleA), () => mono(i === 2 ? 'breaks them' : 'proposes', x, 416, { size: 34, color: i === 2 ? C.red : C.green, align: 'center' }));
      });
    });
    const bar = eio(seg(t, mid('r2', 0.5), e('r3')));
    A(ap(t, mid('r2', 0.45)), () => {
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(300, 580); ctx.lineTo(1620, 580); ctx.stroke();
      ctx.strokeStyle = C.green; ctx.beginPath(); ctx.moveTo(300, 580); ctx.lineTo(lerp(300, 1620, bar), 580); ctx.stroke();
      mono('about a year of attempts', 960, 540, { size: 34, color: C.soft, align: 'center' });
    });
    const tries = ['knapsack-based', 'permutation polynomials', '…'];
    tries.forEach((tr, i) => {
      const at = mid('r3', 0.15 + i * 0.25), a = ap(t, at);
      A(a, () => {
        const x = 480 + i * 480;
        chip(x, 690, tr, C.soft, { size: 34, g: 0 });
        cross(x, 770, 44, C.red, seg(t, at + 0.5, at + 0.9));
      });
    });
  });
  // r4–r5: a sleepless night, a paper by daybreak
  A(span(t, r4 + 0.1, r6 + 0.2, 0.6, 0.5), () => {
    const dawn = eio(seg(t, s('r5', 0.2), e('r5')));
    decode('APRIL 1977', 200, 360, t, r4 + 0.4, 0.6, { size: 76, weight: 700, color: C.amber, g: 12 });
    mono('Passover, then a sleepless night', 200, 450, { size: 38, color: C.soft });
    const wx = 1100, wy = 240, ww = 560, wh = 520;
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, rgba(lerpRGB([6, 14, 34], [40, 70, 120], dawn))); sky.addColorStop(1, rgba(lerpRGB([10, 20, 40], [255, 170, 90], dawn)));
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    const rnd = mulberry32(4);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - dawn) * rnd()})`; ctx.fillRect(wx + rnd() * ww, wy + rnd() * wh * 0.7, 2.5, 2.5); }
    A(1 - dawn, () => { ctx.fillStyle = '#F4EBC8'; ctx.beginPath(); ctx.arc(wx + 400, wy + 130, 46, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = rgba(lerpRGB([6, 14, 34], [40, 70, 120], dawn)); ctx.beginPath(); ctx.arc(wx + 420, wy + 116, 42, 0, Math.PI * 2); ctx.fill(); });
    A(dawn, () => { glow('#FFC070', 40); ctx.fillStyle = '#FFD08A'; ctx.beginPath(); ctx.arc(wx + 180, wy + wh + 10, 70, Math.PI, 0); ctx.fill(); noGlow(); });
    ctx.strokeStyle = C.greenSoft; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // the paper filling up
    A(ap(t, s('r5', 0.1)), () => {
      panel(200, 540, 640, 380, null, C.green, 1);
      const nl = Math.floor(9 * seg(t, s('r5', 0.3), e('r5', 0.6)));
      for (let i = 0; i < nl; i++) { ctx.fillStyle = 'rgba(227,248,236,0.28)'; ctx.fillRect(240, 580 + i * 36, 560 * (0.6 + 0.4 * hsh(i, 3)), 12); }
      mono(dawn > 0.5 ? 'by daybreak' : '', 520, 880, { size: 34, color: C.amber, align: 'center' });
    });
  });
  // r6: R, S, A
  A(span(t, r6 + 0.1, r7 + 0.2, 0.5, 0.5), () => {
    [['R', 'Rivest'], ['S', 'Shamir'], ['A', 'Adleman']].forEach(([L, nm], i) => {
      const x = 640 + i * 320, a = ap(t, r6 + 0.4 + i * 0.3);
      A(a, () => { txt(L, x, 430, { size: 200, weight: 700, color: C.green, align: 'center', g: 24 }); mono(nm, x, 570, { size: 36, color: C.soft, align: 'center' }); });
    });
    A(ap(t, mid('r6', 0.65)), () => { chip(800, 740, 'prime p', C.amber, { size: 40 }); chip(1120, 740, 'prime q', C.amber, { size: 40 }); });
  });
  // r7–r10: build a tiny key
  A(span(t, r7 + 0.1, r11 + 0.2, 0.6, 0.6), () => {
    panel(120, 220, 980, 700, 'KEY GENERATION', C.green, 1);
    const L = (str, y, at, col = C.ink, g = 0) => A(ap(t, at), () => mono(ticking(str, t, at, 0.5, y), 170, y, { size: 46, color: col, g }));
    L(`p = ${RP}`, 320, mid('r7', 0.55), C.amber);
    L(`q = ${RQ}`, 400, mid('r7', 0.66), C.amber);
    L(`n = p × q = ${fmt(RN)}`, 480, mid('r7', 0.82), C.ink, 6);
    const r8 = s('r8');
    L(`e = ${RE}`, 590, r8 + 0.6, C.amber);
    A(ap(t, r8 + 0.9), () => mono('locks', 520, 590, { size: 36, color: C.amberSoft }));
    L(`lcm(${RP - 1}, ${RQ - 1}) = ${LAM}`, 670, mid('r8', 0.62), C.faint);
    L(`d = ${RD}`, 750, mid('r8', 0.86), C.green, 10);
    A(ap(t, mid('r8', 0.9)), () => mono('unlocks', 520, 750, { size: 36, color: C.greenSoft }));
    A(ap(t, e('r8', 0.2)), () => mono(`${RE} × ${RD} = ${fmt(RE * RD)} = ${(RE * RD - 1) / LAM} × ${LAM} + 1`, 170, 850, { size: 34, color: C.faint }));
    // r10: what is public, what is private
    const r10 = s('r10');
    A(ap(t, r10 + 0.2), () => {
      padlock(1300, 380, 1.2, C.amber, 1);
      mono('PUBLIC KEY', 1420, 340, { size: 36, weight: 700, color: C.amber, spacing: '3px' });
      mono(`n = ${fmt(RN)} · e = ${RE}`, 1420, 400, { size: 38, color: C.ink });
      mono('anyone can have it', 1420, 452, { size: 32, color: C.faint });
    });
    A(ap(t, mid('r10', 0.5)), () => {
      keyIcon(1300, 690, 1.2, C.green);
      mono('PRIVATE KEY', 1420, 660, { size: 36, weight: 700, color: C.green, spacing: '3px' });
      mono(`d = ${RD}`, 1420, 720, { size: 38, color: C.ink });
      mono('Bob keeps it', 1420, 772, { size: 32, color: C.faint });
    });
  });
  // r11–r16: lock 65, send 2,790, unlock
  A(span(t, r11 + 0.1, 1e9, 0.6, 0), () => {
    const r12 = s('r12'), r13 = s('r13'), r15 = s('r15');
    const chainA = ap(t, r15 + 0.1);
    A(1 - chainA, () => {
      channel(330, 1590, 600, t, 1, null);
      person(190, 600, 0.85, C.alice, 'ALICE');
      person(1730, 600, 0.85, C.bob, 'BOB');
      eye(960, 600, 0.75, t, Math.sin(t) * 0.8, 1, null);
      // top terminal: Alice encrypts
      panel(380, 210, 1160, 250, 'ALICE LOCKS 65 WITH BOB’S PUBLIC KEY', C.alice, ap(t, r11 + 0.2));
      A(ap(t, r11 + 0.6), () => {
        mathRun([{ s: '65' }, { s: '17', sup: true, col: C.amber }, { s: ' mod 3,233' }], 420, 310, { size: 44 });
        A(ap(t, r12 + 0.2), () => mono(ticking(POW65, t, r12 + 0.2, 1.6, 5), 420, 390, { size: 34, color: C.soft }));
        A(ap(t, mid('r12', 0.6)), () => { mono('→', 1290, 310, { size: 44, color: C.soft }); mono(fmt(CT), 1350, 310, { size: 52, weight: 700, color: C.amber, g: 12 }); });
      });
      // the message
      A(ap(t, r11 + 0.4), () => chip(190, 470, String(MSG), C.ink, { size: 48, g: 0 }));
      const u = eio(seg(t, mid('r12', 0.75), e('r12', 0.9)));
      if (u > 0) {
        const x = lerp(330, 1590, u);
        A(1 - seg(t, mid('r13', 0.2), mid('r13', 0.3)), () => { chip(x, 600, fmt(CT), C.amber, { size: 44 }); padlock(x, 520, 0.4, C.amber); });
      }
      // bottom terminal: Bob decrypts, the remainders ticking through square-and-multiply
      panel(380, 720, 1160, 230, 'BOB UNLOCKS WITH HIS PRIVATE 413', C.bob, ap(t, r13 + 0.1));
      A(ap(t, r13 + 0.3), () => {
        mathRun([{ s: fmt(CT) }, { s: '413', sup: true, col: C.green }, { s: ' mod 3,233' }], 420, 820, { size: 44 });
        const p = seg(t, mid('r13', 0.35), mid('r13', 0.85));
        const idx = Math.min(TRACE.length - 1, Math.floor(p * TRACE.length));
        const done = p >= 1;
        mono(done ? '=' : '…', 1100, 820, { size: 44, color: C.soft });
        mono(done ? String(MSG) : fmt(TRACE[idx]), 1160, 820, { size: 52, weight: 700, color: done ? C.green : C.soft, g: done ? 14 : 0 });
        mono(`${TRACE.length} small steps, never a huge number`, 420, 896, { size: 32, color: C.faint });
      });
      A(ap(t, mid('r13', 0.9)), () => chip(1730, 470, String(MSG), C.green, { size: 48 }));
    });
    // r15: the only way to 413 runs through the primes
    A(chainA * (1 - 0.5 * ap(t, s('r16', 0.1))), () => {
      chip(300, 520, fmt(RN), C.amber, { size: 56 });
      mono('public', 300, 610, { size: 32, color: C.amberSoft, align: 'center' });
      arrow(420, 520, 620, 520, C.red, { dash: [10, 10] });
      mono('factor?', 520, 470, { size: 32, color: C.red, align: 'center' });
      chip(790, 520, `${RP} × ${RQ}`, C.ink, { size: 56, g: 0 });
      arrow(960, 520, 1120, 520, C.soft);
      chip(1230, 520, String(LAM), C.ink, { size: 56, g: 0 });
      arrow(1340, 520, 1480, 520, C.soft);
      chip(1600, 520, String(RD), C.green, { size: 56 });
      mono('private', 1600, 610, { size: 32, color: C.greenSoft, align: 'center' });
    });
    A(ap(t, s('r16', 0.2)), () => {
      envelope(760, 790, 200, 130, C.ink, 1);
      mono('65 + random padding', 900, 790, { size: 40, color: C.soft });
      stamp('DEMO ONLY', 1600, 790, C.amber, ap(t, mid('r16', 0.55), 0.4), -0.06, 48);
    });
  });
}

// ---- 5 easy one way
function partEasy(t) {
  const e1 = s('e1'), e2 = s('e2'), e3 = s('e3'), e5 = s('e5'), e10 = s('e10');
  A(span(t, e1 + 0.1, e2 + 0.2, 0.5, 0.5), () => {
    chip(470, 380, `${RP} × ${RQ}`, C.ink, { size: 52, g: 0 });
    arrow(640, 380, 1220, 380, C.green, { p: eout(seg(t, e1 + 0.8, e1 + 1.1)), lw: 6, head: 24 });
    A(ap(t, e1 + 1.1), () => { chip(1420, 380, fmt(RN), C.green, { size: 52 }); mono('multiply · instant', 930, 330, { size: 36, color: C.green, align: 'center' }); });
    A(ap(t, mid('e1', 0.55)), () => {
      chip(470, 640, fmt(RN), C.ink, { size: 52, g: 0 });
      arrow(640, 640, 1220, 640, C.amber, { p: 0.08 + 0.6 * seg(t, mid('e1', 0.6), e('e1', 0.3)), lw: 6, head: 24, dash: [12, 12] });
      chip(1420, 640, '? × ?', C.amber, { size: 52, dash: true });
      mono('factor · search', 930, 590, { size: 36, color: C.amber, align: 'center' });
    });
  });
  // e2–e4: trial division
  A(span(t, e2 + 0.1, e5 + 0.2, 0.6, 0.6), () => {
    panel(120, 220, 820, 720, 'TRIAL DIVISION', C.green, 1);
    const jev = t > e3;
    const target = jev ? JEV : RN, nTry = jev ? TRY_J : TRY_N;
    const t0 = jev ? e3 + 0.3 : e2 + 0.9, t1 = jev ? mid('e3', 0.62) : mid('e2', 0.8);
    const p = seg(t, t0, t1), n = Math.max(1, Math.round(lerp(1, nTry, jev ? p ** 2.2 : p)));
    const rows = 9, first = Math.max(0, n - rows);
    for (let i = first; i < n; i++) {
      const d = SIEVE[i], y = 310 + (i - first) * 66, ok = target % d === 0;
      mono(`${fmt(target)} ÷ ${fmt(d)}`, 170, y, { size: 40, color: ok ? C.green : C.soft, g: ok ? 10 : 0 });
      if (ok) check(880, y, 40, C.green, 1); else cross(880, y, 28, 'rgba(255,98,98,0.7)', 1);
    }
    // the counter and the answer
    mono('TRIES', 1400, 300, { size: 36, weight: 700, color: C.faint, align: 'center', spacing: '4px' });
    mono(fmt(n), 1400, 410, { size: 120, weight: 700, color: C.amber, align: 'center', g: 16 });
    const solved = p >= 1;
    A(solved ? ap(t, t1) : 0, () => {
      mono(jev ? `${fmt(JEV)} =` : `${fmt(RN)} =`, 1400, 560, { size: 48, color: C.soft, align: 'center' });
      mono(jev ? `${fmt(JA)} × ${fmt(JB)}` : `${RQ} × ${RP}`, 1400, 640, { size: 60, weight: 700, color: C.green, align: 'center', g: 14 });
    });
    A(ap(t, s('e4', 0.2)), () => {
      chip(1400, 780, '1889 · CHARLES BUSK', C.amber, { size: 34 });
      chip(1400, 870, 'LATER · A POCKET CALCULATOR', C.amber, { size: 34, a: ap(t, mid('e4', 0.5)) });
    });
  });
  // e5–e9: the 1977 challenge and the 1994 crack
  A(span(t, e5 + 0.1, e10 + 0.2, 0.6, 0.6), () => {
    const e7 = s('e7'), e8 = s('e8'), e9 = s('e9');
    const topA = 1 - ap(t, e8 + 0.1);
    A(topA, () => {
      panel(300, 220, 1320, 170, null, C.green, ap(t, e5 + 0.2));
      A(ap(t, e5 + 0.4), () => {
        decode('SCIENTIFIC AMERICAN · AUGUST 1977', 960, 270, t, e5 + 0.5, 0.8, { size: 40, weight: 700, color: C.ink, align: 'center' });
        mono('Martin Gardner, Mathematical Games: a challenge', 960, 340, { size: 34, color: C.soft, align: 'center' });
      });
      A(ap(t, mid('e5', 0.62)), () => {
        for (let r = 0; r < 3; r++) mono(ticking(RSA129.slice(r * 43, (r + 1) * 43), t, mid('e5', 0.62), 1.4, r + 11), 960, 480 + r * 56, { size: 36, color: C.amber, align: 'center' });
        chip(760, 690, '129 DIGITS', C.amber, { size: 36, a: ap(t, mid('e5', 0.85)) });
        chip(1160, 690, '$100 PRIZE', C.green, { size: 36, a: ap(t, e('e5', 0.2)) });
      });
      A(ap(t, e7 + 0.3), () => {
        mono('estimate for 125 digits:', 960, 800, { size: 36, color: C.soft, align: 'center' });
        mono(ticking('40,000,000,000,000,000 years', t, mid('e7', 0.55), 0.8, 21), 960, 880, { size: 56, weight: 700, color: C.red, align: 'center', g: 12 });
      });
    });
    // 1994: hundreds of volunteers, about 1,600 machines
    A(ap(t, e8 + 0.2), () => {
      const rnd = mulberry32(129), lit = seg(t, mid('e8', 0.3), e('e8', 0.4));
      decode('1994', 960, 250, t, mid('e8', 0.2), 0.4, { size: 72, weight: 700, color: C.amber, align: 'center', g: 12 });
      for (let i = 0; i < 1600; i++) {
        const x = 140 + rnd() * 1640, y = 330 + rnd() * 330, on = rnd() < lit;
        ctx.fillStyle = on ? C.green : 'rgba(82,240,160,0.14)'; ctx.fillRect(x, y, 5, 5);
      }
      mono(`≈ 600 volunteers · ≈ ${fmt(Math.round(1600 * eio(lit)))} machines`, 960, 710, { size: 40, color: C.ink, align: 'center' });
      A(ap(t, e('e8', -0.3)) * (1 - ap(t, e9 + 0.1)), () => {
        mono(`= ${R129P.slice(0, 32)}…`, 960, 800, { size: 34, color: C.green, align: 'center' });
        mono(`× ${R129Q.slice(0, 32)}…`, 960, 856, { size: 34, color: C.green, align: 'center' });
      });
    });
    A(ap(t, e9 + 0.2), () => {
      k.rrect(220, 760, 1480, 190, 16); ctx.fillStyle = 'rgba(2,8,6,0.94)'; ctx.fill(); ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.stroke();
      decode('THE MAGIC WORDS ARE', 960, 815, t, mid('e9', 0.3), 1.0, { size: 56, weight: 700, color: C.green, align: 'center', g: 14 });
      decode('SQUEAMISH OSSIFRAGE', 960, 893, t, mid('e9', 0.5), 1.0, { size: 56, weight: 700, color: C.green, align: 'center', g: 14 });
    });
  });
  // e10–e11: how long the numbers are
  A(ap(t, e10 + 0.2), () => {
    const x0 = 640, x1 = 1760, sc = (d) => ((x1 - x0) * d) / 617;
    const bars = [['our toy key', 4, false], ['Jevons’s number', 10, false], ['RSA-129, 1994', 129, false], ['public records', 300, true], ['2,048-bit key', 617, false]];
    mono('DIGITS', x0, 250, { size: 36, weight: 700, color: C.faint, spacing: '4px' });
    bars.forEach(([lab, d, under], i) => {
      const at = e10 + 0.4 + i * 0.35, p = eout(seg(t, at, at + 0.8)), y = 330 + i * 110;
      if (p <= 0) return;
      A(ap(t, at), () => {
        mono(lab, x0 - 30, y, { size: 36, color: i === 4 ? C.amber : C.soft, align: 'right' });
        const w = Math.max(6, sc(d) * p);
        if (under) { ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(x0, y - 22, w, 44); ctx.setLineDash([]); }
        else { ctx.fillStyle = i === 4 ? C.amber : C.green; glow(i === 4 ? C.amber : C.green, 12); ctx.fillRect(x0, y - 22, w, 44); noGlow(); }
        if (i === 4) mono(fmt(d), x0 + w - 16, y + 1, { size: 36, weight: 700, color: C.bg0, align: 'right' });
        else mono(under ? 'under 300' : fmt(d), x0 + w + 16, y, { size: 36, weight: 700, color: C.ink });
      });
    });
    stamp('NO PROOF IT’S HARD', 960, 900, C.red, ap(t, s('e11', 0.4), 0.4), -0.04, 48);
  });
}

// ---- 6 signed
function partSign(t) {
  const s1 = s('s1'), s2 = s('s2'), s3 = s('s3'), s6 = s('s6'), s7 = s('s7'), s11 = s('s11');
  A(span(t, s1 + 0.1, s3 + 0.2, 0.6, 0.5), () => {
    const flip = eio(seg(t, mid('s1', 0.45), mid('s1', 0.75)));
    mono(flip < 0.5 ? 'ENCRYPT' : 'SIGN', 960, 260, { size: 44, weight: 700, color: flip < 0.5 ? C.amber : C.green, align: 'center', spacing: '6px', g: 10 });
    const xL = lerp(560, 1360, flip), xR = lerp(1360, 560, flip);
    padlock(xL, 420, 1.3, C.amber, 1);
    mono('public 17', xL, 560, { size: 36, color: C.amber, align: 'center' });
    keyIcon(xR, 460, 1.3, C.green);
    mono('private 413', xR, 560, { size: 36, color: C.green, align: 'center' });
    arrow(760, 460, 1160, 460, C.soft, { lw: 5 });
    mono('locks', 660, 650, { size: 36, color: C.soft, align: 'center' });
    mono('opens', 1260, 650, { size: 36, color: C.soft, align: 'center' });
    A(ap(t, s2 + 0.3), () => { chip(700, 800, '1976 · THE IDEA', C.soft, { size: 34, g: 0 }); chip(1220, 800, '1977 · RSA MAKES IT WORK', C.green, { size: 34, a: ap(t, mid('s2', 0.55)) }); });
  });
  // s3–s5: Bob signs 1977; anyone checks it
  A(span(t, s3 + 0.1, s6 + 0.2, 0.6, 0.5), () => {
    person(220, 560, 0.9, C.bob, 'BOB');
    keyIcon(220, 400, 0.8, C.green);
    for (let i = 0; i < 3; i++) person(1520 + i * 130, 560 + (i % 2) * 30, 0.6, C.soft, i === 1 ? 'ANYONE' : null, ap(t, s3 + 0.8 + i * 0.2));
    panel(400, 300, 1040, 400, 'SIGNATURE', C.green, ap(t, s3 + 0.3));
    const s4 = s('s4');
    A(ap(t, s4 + 0.2), () => {
      mono('sign', 440, 420, { size: 36, color: C.green });
      mathRun([{ s: String(SIGM) }, { s: String(RD), sup: true, col: C.green }, { s: ' mod 3,233 = ' }, { s: String(SIG), col: C.gold, w: 700, g: 12 }], 580, 420, { size: 46 });
    });
    A(ap(t, mid('s4', 0.55)), () => {
      mono('check', 440, 540, { size: 36, color: C.amber });
      mathRun([{ s: String(SIG), col: C.gold }, { s: String(RE), sup: true, col: C.amber }, { s: ' mod 3,233 = ' }, { s: String(SIGM), w: 700 }], 580, 540, { size: 46 });
      check(1360, 540, 50, C.green, seg(t, mid('s4', 0.8), mid('s4', 0.95)));
    });
    // s5: only 413 could have made 788
    A(ap(t, s('s5', 0.2)), () => {
      const cx = 920, cy = 830;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 5; glow(C.gold, 16); ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke(); noGlow();
      for (let i = 0; i < 16; i++) { const an = (i / 16) * Math.PI * 2; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx + Math.cos(an) * 84, cy + Math.sin(an) * 84, 5, 0, Math.PI * 2); ctx.fill(); }
      txt('788', cx, cy + 2, { size: 44, weight: 700, fam: MONO, color: C.gold, align: 'center' });
      mono('only 413 could make it', cx + 140, cy, { size: 36, color: C.soft });
    });
  });
  // s6: a fingerprint of the message
  A(span(t, s6 + 0.1, s7 + 0.2, 0.6, 0.5), () => {
    panel(140, 280, 640, 520, 'MESSAGE', C.green, 1);
    for (let i = 0; i < 10; i++) { ctx.fillStyle = 'rgba(227,248,236,0.22)'; ctx.fillRect(180, 370 + i * 40, 560 * (0.5 + 0.5 * hsh(i, 9)), 14); }
    arrow(820, 540, 1060, 540, C.soft, { p: eout(seg(t, s6 + 0.6, s6 + 1.2)), lw: 5 });
    A(ap(t, s6 + 1.2), () => {
      decode('3F7A 09C2 E1B4 5D86', 1440, 540, t, s6 + 1.2, 0.8, { size: 48, weight: 700, color: C.amber, align: 'center', g: 10 });
      mono('HASH · A SHORT FINGERPRINT', 1440, 630, { size: 34, color: C.amberSoft, align: 'center', spacing: '2px' });
      mono('the hash is what gets signed', 1440, 720, { size: 34, color: C.faint, align: 'center' });
    });
  });
  // s7–s10: Mallory in the middle
  A(span(t, s7 + 0.1, s11 + 0.2, 0.6, 0.5), () => {
    const s8 = s('s8'), s9 = s('s9'), s10 = s('s10');
    const mIn = ap(t, s7 + 0.6);
    channel(AX + 120, 960 - 110, CY, t, 1, null);
    channel(960 + 110, BX - 120, CY, t, 1, null);
    person(AX, CY, 1, C.alice, 'ALICE');
    person(BX, CY, 1, C.bob, 'BOB');
    person(960, CY, 1, C.mallory, 'MALLORY', mIn, true);
    // two separate exchanges
    const u1 = eio(seg(t, mid('s8', 0.3), mid('s8', 0.6))), u2 = eio(seg(t, mid('s8', 0.5), mid('s8', 0.8)));
    if (u1 > 0 && u1 < 1) { chip(lerp(AX + 140, 840, u1), CY - 50, '→', C.amber, { size: 36 }); chip(lerp(840, AX + 140, u1), CY + 50, '←', C.amber, { size: 36 }); }
    if (u2 > 0 && u2 < 1) { chip(lerp(1080, BX - 140, u2), CY - 50, '→', C.amber, { size: 36 }); chip(lerp(BX - 140, 1080, u2), CY + 50, '←', C.amber, { size: 36 }); }
    const keys = ap(t, mid('s8', 0.82));
    keyIcon(AX + 10, CY - 170, 0.8, C.alice, 0, keys); keyIcon(960 - 70, CY - 170, 0.8, C.alice, 0, keys);
    keyIcon(960 + 70, CY - 170, 0.8, C.bob, 0, keys); keyIcon(BX - 10, CY - 170, 0.8, C.bob, 0, keys);
    A(keys, () => { mono('KEY 1', (AX + 960) / 2 - 30, CY - 170, { size: 32, color: C.alice, align: 'center' }); mono('KEY 2', (BX + 960) / 2 + 30, CY - 170, { size: 32, color: C.bob, align: 'center' }); });
    A(ap(t, s9 + 0.2), () => {
      mono('“shared with Bob”', AX, 300, { size: 34, color: C.alice, align: 'center' });
      mono('“shared with Alice”', BX, 300, { size: 34, color: C.bob, align: 'center' });
    });
    // a message passes through Mallory, opened and resealed
    const v = seg(t, mid('s9', 0.35), e('s9', 0.4));
    if (v > 0 && v < 1) {
      const x = v < 0.4 ? lerp(AX + 140, 960, eio(v / 0.4)) : v < 0.6 ? 960 : lerp(960, BX - 140, eio((v - 0.6) / 0.4));
      const open = v > 0.4 && v < 0.6 ? Math.sin(((v - 0.4) / 0.2) * Math.PI) : 0;
      envelope(x, CY + 200, 110, 74, C.ink, 1, open);
      if (open > 0.3) mono('READ', 960, CY + 290, { size: 34, weight: 700, color: C.mallory, align: 'center' });
    }
    A(ap(t, s10 + 0.2), () => { chip(AX, 380, '?', C.red, { size: 52 }); chip(BX, 380, '?', C.red, { size: 52 }); mono('who is really on the other end?', 960, 960 - 20, { size: 38, color: C.red, align: 'center' }); });
  });
  // s11: a certificate
  A(ap(t, s11 + 0.2), () => {
    panel(500, 230, 920, 520, 'CERTIFICATE', C.green, 1);
    const rows = [['site', 'example.org'], ['public key', '04 9A 3F 7C …'], ['signed by', 'a certificate authority']];
    rows.forEach(([kk, v], i) => A(ap(t, s11 + 0.6 + i * 0.4), () => { mono(kk, 560, 350 + i * 90, { size: 36, color: C.faint }); mono(v, 820, 350 + i * 90, { size: 38, color: i === 2 ? C.gold : C.ink }); }));
    A(ap(t, mid('s11', 0.6)), () => {
      const cx = 1300, cy = 650; ctx.strokeStyle = C.gold; ctx.lineWidth = 5; glow(C.gold, 14); ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.stroke(); noGlow();
      check(cx, cy, 52, C.gold, seg(t, mid('s11', 0.65), mid('s11', 0.75)));
    });
    A(ap(t, mid('s11', 0.75)), () => { browser(140, 800, 420, 170, 1, 1); mono('your browser trusts the authority', 620, 885, { size: 36, color: C.green }); });
  });
}

// ---- 7 found first, in secret: a timeline, 1969–1998
const TL0 = 1969, TL1 = 1998, TX0 = 200, TX1 = 1720, AXY = 610;
const yx = (y) => lerp(TX0, TX1, (y - TL0) / (TL1 - TL0));
function partSecret(t) {
  const g1 = s('g1');
  const axis = eio(seg(t, g1 + 0.2, g1 + 1.6));
  A(ap(t, g1 + 0.1), () => {
    ctx.strokeStyle = C.greenSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TX0, AXY); ctx.lineTo(lerp(TX0, TX1, axis), AXY); ctx.stroke();
    for (let y = 1970; y <= 1995; y += 5) A(seg(axis, (y - TL0) / (TL1 - TL0) - 0.05, (y - TL0) / (TL1 - TL0)), () => {
      ctx.fillStyle = C.greenSoft; ctx.fillRect(yx(y) - 1.5, AXY - 10, 3, 20); mono(String(y), yx(y), AXY + 40, { size: 32, color: C.faint, align: 'center' });
    });
    mono('GCHQ · CLASSIFIED', TX0, 220, { size: 34, weight: 700, color: C.red, spacing: '3px' });
    mono('PUBLISHED', TX0, 990 - 40, { size: 34, weight: 700, color: C.green, spacing: '3px' });
  });
  // published work below the line
  const pubs = [[1976, 'Diffie–Hellman', 760], [1977, 'RSA', 860]];
  pubs.forEach(([y, lab, py]) => A(ap(t, g1 + 1.4), () => {
    ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(yx(y), AXY); ctx.lineTo(yx(y), py - 26); ctx.stroke();
    chip(yx(y) + tw(`${y} · ${lab}`, 34, 700, MONO) / 2 + 22, py, `${y} · ${lab}`, C.green, { size: 34, g: 4 });
  }));
  // the secret cards above the line
  const hidden = ap(t, s('g9', 0.6)) * (1 - ap(t, s('g10', 0.4)));
  const cards = [
    [1970, 280, 'JAN 1970 · JAMES ELLIS', '“non-secret encryption”', s('g2', 0.4), s('g4', 0.3), 'possible, but how?'],
    [1973, 390, 'SEPT 1973 · CLIFFORD COCKS', 'prime factoring → RSA', s('g5', 0.4), s('g7', 0.3), 'not even written down'],
    [1974, 500, '1974 · MALCOLM WILLIAMSON', '→ Diffie–Hellman key exchange', s('g8', 0.4), null, null],
  ];
  cards.forEach(([y, cy, head, sub, at, at2, note]) => {
    const a = ap(t, at);
    if (a <= 0) return;
    A(a, () => {
      const x = yx(y);
      ctx.strokeStyle = 'rgba(255,98,98,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, AXY); ctx.lineTo(x, cy + 40); ctx.stroke();
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, AXY, 8, 0, Math.PI * 2); ctx.fill();
      const w = 640;
      k.rrect(x - 20, cy - 44, w, 88, 10); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(255,98,98,0.55)'; ctx.lineWidth = 2; ctx.stroke();
      mono(head, x, cy - 14, { size: 32, weight: 700, color: C.ink });
      mono(sub, x, cy + 24, { size: 32, color: y === 1973 ? C.amber : C.soft });
      if (note && at2) A(ap(t, at2) * (1 - hidden), () => mono(note, x + w + 10, cy, { size: 32, color: C.red }));
      // redaction bars while it is classified
      A(hidden, () => { ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x - 6, cy - 34, w * 0.92, 30); ctx.fillRect(x - 6, cy + 10, w * 0.92, 30); });
    });
  });
  // g3: the idea from Bell Labs: the receiver adds the noise
  const g3 = s('g3');
  A(span(t, g3 + 0.2, s('g5', 0.2), 0.5, 0.5), () => {
    const x0 = 1180, x1 = 1700, y = 790;
    k.rrect(x0 - 30, 680, x1 - x0 + 60, 240, 14); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.stroke();
    mono('sender', x0, 880, { size: 32, color: C.soft, align: 'center' });
    mono('receiver', x1, 880, { size: 32, color: C.soft, align: 'center' });
    const rnd = mulberry32(43);
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.green; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120, x = lerp(x0, x1, u); const v = Math.sin(u * 26 + t * 4) * 22; if (i) ctx.lineTo(x, y + v); else ctx.moveTo(x, y + v); }
    ctx.stroke();
    const noise = ap(t, g3 + 1.2);
    ctx.strokeStyle = `rgba(255,98,98,${0.8 * noise})`; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120, x = lerp(x0, x1, u); const v = Math.sin(u * 26 + t * 4) * 22 + (rnd() - 0.5) * 60 * noise; if (i) ctx.lineTo(x, y + v); else ctx.moveTo(x, y + v); }
    ctx.stroke();
    arrow(x1, 718, x1 - 120, 758, C.red, { a: noise, lw: 3, head: 14 });
    mono('noise added by the receiver', (x0 + x1) / 2, 716, { size: 32, color: C.red, align: 'center' });
  });
  A(hidden, () => stamp('CLASSIFIED', 1450, 770, C.red, 1, -0.06, 72));
  A(ap(t, s('g9', 0.8)) * (1 - ap(t, s('g10', 0.4))), () => mono('military focus · little computing power', 1450, 900, { size: 34, color: C.red, align: 'center' }));
  // g10–g11: 1997
  const g10 = s('g10');
  A(ap(t, g10 + 0.2), () => {
    const x = yx(1997);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; glow(C.gold, 14); ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, AXY + 10); ctx.stroke(); noGlow();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, AXY, 10, 0, Math.PI * 2); ctx.fill();
    mono('18 DEC 1997', x - 20, 300, { size: 34, weight: 700, color: C.gold, align: 'right' });
    mono('made public', x - 20, 350, { size: 32, color: C.gold, align: 'right' });
  });
  A(ap(t, s('g11', 0.3)), () => mono('James Ellis died 25 Nov 1997', yx(1997) - 20, 458, { size: 32, color: C.soft, align: 'right' }));
  A(ap(t, s('g12', 0.3)), () => {
    mono('found independently', yx(1976) + 260, 960 - 40, { size: 34, color: C.green });
    check(yx(1976) + 230, 960 - 40, 36, C.green, seg(t, s('g12', 0.6), s('g12', 1.0)));
  });
}

// ---- 8 every secure page
const BRX = 140, BRW = 520, SVX = 1580;
function partPage(t) {
  const p1 = s('p1'), p2 = s('p2'), p3 = s('p3'), p4 = s('p4'), p5 = s('p5'), p6 = s('p6');
  const bars = ap(t, p6 + 0.1);
  A(ap(t, p1 + 0.2) * (1 - bars), () => {
    browser(BRX, 280, BRW, 360, 1, ap(t, mid('p3', 0.8)));
    mono('YOUR BROWSER', BRX + BRW / 2, 690, { size: 34, weight: 700, color: C.green, align: 'center', spacing: '3px' });
    server(SVX, 460, 1);
    mono('SERVER', SVX, 690, { size: 34, weight: 700, color: C.green, align: 'center', spacing: '3px' });
    channel(BRX + BRW + 30, SVX - 160, 460, t, 1, null);
    // p2: key shares on an elliptic curve
    const u = eio(seg(t, mid('p2', 0.2), mid('p2', 0.55)));
    if (u > 0 && u < 1) { chip(lerp(720, 1380, u), 420, 'key share', C.amber, { size: 34 }); chip(lerp(1380, 720, u), 500, 'key share', C.amber, { size: 34 }); }
    A(ap(t, mid('p2', 0.4)) * (1 - ap(t, p3 + 0.2)), () => {
      const cx = 1050, cy = 760, sx = 120, sy = 60;
      ctx.strokeStyle = C.greenFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 260, cy); ctx.lineTo(cx + 260, cy); ctx.moveTo(cx - 140, cy - 150); ctx.lineTo(cx - 140, cy + 150); ctx.stroke();
      // y² = x³ − x + 1
      ctx.strokeStyle = C.green; ctx.lineWidth = 4; glow(C.green, 10);
      for (const sg of [1, -1]) { ctx.beginPath(); let st = false; for (let x = -1.33; x <= 1.9; x += 0.01) { const v = x * x * x - x + 1; if (v < 0) continue; const px = cx - 140 + x * sx, py = cy - sg * Math.sqrt(v) * sy; if (!st) { ctx.moveTo(px, py); st = true; } else ctx.lineTo(px, py); } ctx.stroke(); }
      noGlow();
      mono('elliptic curve', cx + 120, cy + 150, { size: 32, color: C.faint, align: 'center' });
    });
    A(ap(t, mid('p2', 0.6)), () => { keyIcon(BRX + BRW / 2, 230 - 20, 0.8, C.gold); keyIcon(SVX, 230, 0.8, C.gold, 0, 1 - ap(t, mid('p5', 0.5)) * 0); });
    // p3: the certificate and signature
    const v = eio(seg(t, mid('p3', 0.2), mid('p3', 0.6)));
    if (v > 0) A(1 - ap(t, p4 + 0.4), () => {
      const x = lerp(SVX - 200, BRX + BRW + 140, v);
      k.rrect(x - 150, 750, 300, 140, 12); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
      mono('CERTIFICATE', x - 130, 790, { size: 32, weight: 700, color: C.gold });
      mono('signed', x - 130, 846, { size: 32, color: C.soft });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 100, 846, 26, 0, Math.PI * 2); ctx.stroke();
      check(x + 100, 846, 28, C.gold, seg(t, mid('p3', 0.6), mid('p3', 0.75)));
    });
    // p4: a fast symmetric cipher carries the page
    const flow = ap(t, p4 + 0.3) * (1 - 0.6 * ap(t, p5 + 0.3));
    A(flow, () => {
      for (let i = 0; i < 18; i++) { const u2 = (t * 0.45 + i / 18) % 1, x = lerp(SVX - 170, BRX + BRW + 40, u2); ctx.fillStyle = C.green; glow(C.green, 8); ctx.fillRect(x - 14, 452, 28, 16); noGlow(); }
      mono('fast ordinary cipher (AES, ChaCha20)', 1050, 560, { size: 34, color: C.green, align: 'center' });
    });
    // p5: the exchange keys are discarded
    A(ap(t, p5 + 0.3), () => {
      const burn = seg(t, mid('p5', 0.3), mid('p5', 0.7));
      for (const [x, y] of [[BRX + BRW / 2, 210], [SVX, 230]]) {
        const rnd = mulberry32(x);
        A(1 - burn, () => keyIcon(x, y, 0.8, C.gold));
        for (let i = 0; i < 18; i++) { const an = rnd() * Math.PI * 2, d = burn * (40 + rnd() * 80); A(Math.sin(burn * Math.PI), () => { ctx.fillStyle = C.gold; ctx.fillRect(x + Math.cos(an) * d, y + Math.sin(an) * d, 4, 4); }); }
      }
      A(ap(t, mid('p5', 0.6)), () => mono('keys thrown away: forward secrecy', 1050, 880, { size: 36, color: C.gold, align: 'center' }));
    });
  });
  // p6: key sizes
  A(bars, () => {
    const x0 = 620, sc = 980 / 3072;
    mono('KEY SIZE, BITS', x0, 260, { size: 36, weight: 700, color: C.faint, spacing: '4px' });
    const rows = [['RSA', 2048, C.amber, mid('p6', 0.1)], ['RSA', 3072, C.amber, mid('p6', 0.5)], ['elliptic curve', 256, C.green, mid('p6', 0.62)]];
    rows.forEach(([lab, b, col, at], i) => {
      const p = eout(seg(t, at, at + 0.8)), y = 380 + i * 150;
      if (p <= 0) return;
      A(ap(t, at), () => {
        mono(lab, x0 - 30, y, { size: 40, color: C.soft, align: 'right' });
        ctx.fillStyle = col; glow(col, 12); ctx.fillRect(x0, y - 30, b * sc * p, 60); noGlow();
        mono(fmt(b), x0 + b * sc * p + 18, y, { size: 44, weight: 700, color: col });
      });
    });
    A(ap(t, mid('p6', 0.8)), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(236, 530); ctx.lineTo(216, 530); ctx.lineTo(216, 680); ctx.lineTo(236, 680); ctx.stroke();
      mono('≈', 190, 605, { size: 48, weight: 700, color: C.gold, align: 'center' });
      mono('about as strong', 960, 820, { size: 40, color: C.gold, align: 'center' });
    });
  });
}

// ---- 9 the quantum question
function qubit(x, y, r, t, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.greenSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.greenFaint; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
    const an = t * 0.8, px = x + Math.cos(an) * r * 0.7, py = y - r * 0.6 + Math.sin(an) * r * 0.15;
    arrow(x, y, px, py, C.green, { lw: 5, head: 16 });
  });
}
function partQuantum(t) {
  const q1 = s('q1'), q2 = s('q2'), q3 = s('q3'), q5 = s('q5'), q6 = s('q6'), q9 = s('q9');
  A(span(t, q1 + 0.1, q3 + 0.2, 0.6, 0.5), () => {
    qubit(480, 500, 170, t, 1);
    decode('1994 · PETER SHOR', 760, 400, t, q1 + 0.4, 0.8, { size: 56, weight: 700, color: C.amber, g: 10 });
    A(ap(t, mid('q1', 0.5)), () => mono('factoring, fast, on a quantum computer', 760, 480, { size: 38, color: C.soft }));
    A(ap(t, q2 + 0.2), () => {
      const icons = [[880, 'RSA'], [1220, 'DIFFIE–HELLMAN'], [1560, 'ELLIPTIC CURVES']];
      icons.forEach(([x, lab], i) => A(ap(t, q2 + 0.3 + i * 0.3), () => {
        padlock(x, 640, 0.9, i === 0 ? C.amber : C.green, 0);
        mono(lab, x, 790, { size: 32, color: C.soft, align: 'center' });
        const cr = seg(t, mid('q2', 0.6), mid('q2', 0.85));
        if (cr > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 4; glow(C.red, 10); ctx.beginPath(); ctx.moveTo(x - 30, 630); ctx.lineTo(lerp(x - 30, x - 4, cr), lerp(630, 660, cr)); if (cr > 0.5) ctx.lineTo(lerp(x - 4, x + 26, (cr - 0.5) * 2), lerp(660, 700, (cr - 0.5) * 2)); ctx.stroke(); noGlow(); }
      }));
    });
  });
  // q3–q4: what has actually been done
  A(span(t, q3 + 0.1, q5 + 0.2, 0.6, 0.5), () => {
    chip(420, 330, '15 = 3 × 5 · 2001', C.green, { size: 38 });
    chip(420, 430, '21 = 3 × 7 · 2012', C.green, { size: 38, a: ap(t, mid('q3', 0.35)) });
    A(ap(t, mid('q3', 0.6)), () => mono('helped by knowing the answer', 760, 380, { size: 36, color: C.amber }));
    // scale: the digits factored, against a 2,048-bit key
    A(ap(t, mid('q3', 0.45)), () => {
      const x0 = 300, w = 1320;
      ctx.strokeStyle = C.amberSoft; ctx.lineWidth = 2; ctx.strokeRect(x0, 520, w, 40);
      ctx.fillStyle = C.green; ctx.fillRect(x0, 520, Math.max(4, (w * 2) / 617), 40);
      mono('2 digits', x0, 600, { size: 32, color: C.green });
      mono('a 2,048-bit key: 617 digits', x0 + w, 600, { size: 32, color: C.amber, align: 'right' });
    });
    const q4 = s('q4');
    A(ap(t, q4 + 0.2), () => {
      const n = Math.floor(1200 * eio(seg(t, q4 + 0.3, e('q4', 0.6))));
      for (let i = 0; i < n; i++) { const c = i % 60, r = Math.floor(i / 60); ctx.fillStyle = C.greenSoft; ctx.fillRect(330 + c * 21, 690 + r * 13, 8, 8); }
      mono('millions of qubits?', 1660, 760, { size: 40, weight: 700, color: C.green, align: 'right', g: 8 });
    });
  });
  // q5: harvest now, decrypt later
  A(span(t, q5 + 0.1, q6 + 0.2, 0.6, 0.5), () => {
    channel(200, 1100, 520, t, 1, null);
    for (let i = 0; i < 10; i++) { const u = (t * 0.35 + i / 10) % 1, x = lerp(200, 1100, u); padlock(x, 500, 0.3, C.amber, 0, Math.sin(u * Math.PI)); }
    const cx = 1420, cy = 520;
    ctx.strokeStyle = C.amber; ctx.lineWidth = 4; glow(C.amber, 10);
    ctx.beginPath(); ctx.ellipse(cx, cy - 120, 170, 40, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 170, cy - 120); ctx.lineTo(cx - 170, cy + 120); ctx.ellipse(cx, cy + 120, 170, 40, 0, Math.PI, 0, true); ctx.lineTo(cx + 170, cy - 120); ctx.stroke(); noGlow();
    mono('RECORDED TODAY', cx, cy + 210, { size: 34, weight: 700, color: C.amber, align: 'center', spacing: '2px' });
    A(ap(t, mid('q5', 0.45)), () => decode('HARVEST NOW, DECRYPT LATER', 960, 800, t, mid('q5', 0.45), 0.9, { size: 56, weight: 700, fam: TITLE, color: C.red, align: 'center', g: 10 }));
  });
  // q6–q8: the standards
  A(span(t, q6 + 0.1, q9 + 0.2, 0.6, 0.5), () => {
    decode('AUGUST 2024 · NIST', 960, 250, t, q6 + 0.4, 0.8, { size: 56, weight: 700, color: C.amber, align: 'center', g: 10 });
    const std = [['FIPS 203', 'ML-KEM', 'agrees keys'], ['FIPS 204', 'ML-DSA', 'signatures'], ['FIPS 205', 'SLH-DSA', 'signatures']];
    const q7 = s('q7');
    std.forEach(([f, nm, use], i) => {
      const x = 420 + i * 540, a = ap(t, mid('q6', 0.55) + i * 0.3);
      const hi = i === 0 ? ap(t, q7) : ap(t, mid('q6', 0.8) + i * 0.3);
      const dim = 1 - 0.6 * ap(t, q7 + 0.2) * (i === 0 ? 0 : 1);
      A(a * dim, () => {
        panel(x - 230, 330, 460, 250, null, C.green, 1);
        mono(f, x, 385, { size: 34, color: C.faint, align: 'center' });
        txt(nm, x, 460, { size: 60, weight: 700, color: hi > 0.5 ? C.green : C.ink, align: 'center', g: hi > 0.5 ? 12 : 0 });
        mono(use, x, 530, { size: 34, color: C.soft, align: 'center' });
      });
    });
    // a lattice, with a noisy point
    A(ap(t, mid('q7', 0.4)), () => {
      const ox = 960, oy = 790, b1 = [64, 10], b2 = [22, 48];
      for (let i = -12; i <= 12; i++) for (let j = -4; j <= 4; j++) {
        const x = ox + i * b1[0] + j * b2[0], y = oy + i * b1[1] + j * b2[1];
        if (x < 160 || x > 1760 || y < 640 || y > 960) continue;
        ctx.fillStyle = C.greenSoft; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      const px = ox + 2 * b1[0] + b2[0] + 14, py = oy + 2 * b1[1] + b2[1] - 11;
      ctx.fillStyle = C.amber; glow(C.amber, 12); ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); noGlow();
      mono('LATTICE · LEARNING WITH ERRORS', ox, 990 - 50, { size: 32, weight: 700, color: C.amber, align: 'center', spacing: '2px' });
    });
  });
  // q9: hybrid key exchange in browsers today
  A(ap(t, q9 + 0.1), () => {
    const m = eio(seg(t, mid('q9', 0.3), mid('q9', 0.6)));
    chip(lerp(640, 960, m), 440, 'X25519', C.green, { size: 44, a: 1 - seg(m, 0.9, 1) });
    chip(lerp(1280, 960, m), 440, 'ML-KEM-768', C.amber, { size: 44, a: 1 - seg(m, 0.9, 1) });
    A(seg(m, 0.85, 1), () => chip(960, 440, 'X25519 + ML-KEM-768', C.gold, { size: 48 }));
    A(ap(t, mid('q9', 0.65)), () => { browser(700, 580, 520, 300, 1, 1); mono('Chrome · Firefox', 960, 930, { size: 36, color: C.soft, align: 'center' }); });
  });
}

// ---- recap
function partRecap(t) {
  const z1 = s('z1'), z4 = s('z4'), z5 = s('z5');
  const icons = 1 - ap(t, z5 + 0.2);
  A(icons, () => {
    const items = [[400, 'agree a key in public', z1 + 0.3], [960, 'a lock anyone can close', s('z2', 0.2)], [1520, 'run backwards, it signs', s('z3', 0.2)]];
    items.forEach(([x, lab, at], i) => A(ap(t, at, 0.6), () => {
      panel(x - 220, 260, 440, 400, null, C.green, 1);
      if (i === 0) { arrow(x - 140, 380, x + 140, 380, C.amber, { lw: 5 }); arrow(x + 140, 440, x - 140, 440, C.amber, { lw: 5 }); keyIcon(x, 540, 0.9, C.gold); }
      if (i === 1) { padlock(x - 70, 430, 1.1, C.amber, 1); keyIcon(x + 90, 470, 0.9, C.green); }
      if (i === 2) { ctx.strokeStyle = C.gold; ctx.lineWidth = 5; glow(C.gold, 14); ctx.beginPath(); ctx.arc(x, 450, 80, 0, Math.PI * 2); ctx.stroke(); noGlow(); check(x, 450, 70, C.gold, 1); }
      txt(lab, x, 720, { size: 36, weight: 500, color: C.soft, align: 'center' });
    }));
    A(ap(t, z4 + 0.3), () => {
      mono(`${fmt(JEV)} = ${fmt(JA)} × ${fmt(JB)}`, 960, 850, { size: 52, weight: 700, color: C.amber, align: 'center', g: 10 });
      mono('easier done than undone', 960, 925, { size: 36, color: C.soft, align: 'center' });
    });
  });
  A(ap(t, z5 + 0.2, 0.8), () => {
    trio(t, 1, { look: Math.sin(t * 0.7) * 0.9, keys: ap(t, mid('z5', 0.5), 0.8), label: null });
    A(ap(t, mid('z5', 0.55)), () => mono('a secret only they know', 960, 880, { size: 38, color: C.gold, align: 'center' }));
  });
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [TITLE, MONO],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const parts = [partOpen, partKey, partNew, partMix, partRSA, partEasy, partSign, partSecret, partPage, partQuantum, partRecap];
    const R0 = s('z1') - 1.2;
    const B = [0, ...CH.map((c) => c.at), R0, DURATION + 1];
    parts.forEach((fn, i) => {
      let a0, b, fi = 0.6, fo = 1.0;
      if (i === 0) { a0 = -1; b = B[1] + 1.0; }
      else if (i < 10) { a0 = B[i] + 3.0; b = i === 9 ? R0 + 0.7 : B[i + 1] + 1.0; if (i === 9) fo = 0.8; }
      else { a0 = R0 + 0.6; b = DURATION + 1; fi = 0.8; }
      if (t < a0 - fi || t > b) return;
      const a = i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a0 - fi, b, fi, fo);
      A(a, () => fn(t));
    });
    titleCard(t);
    credits(t);
  },
});
