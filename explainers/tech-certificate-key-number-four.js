// Explainer for tech-certificate-key-number-four: in October 2026 browsers blocked eight eMudhra intermediate
// certificates whose P-384 private keys were numbers below 256; one was 4. Look: midnight ink with cream
// certificate cards and red wax seals for the chain of trust; a toy elliptic curve as a cloud of teal dots;
// secret keys in coral, found keys in gold. Azeret Mono for keys, numbers and labels, Fira Sans for captions.
//
// Computed here: a toy curve y² = x³ + x + 4 over the integers mod 233, which has 257 points counting the point
// at infinity (a prime, so every key 1–256 gives a different public point); the hops G, 2G, 3G… by real point
// addition; the brute-force search over keys 1–256. The P-384 group order (FIPS 186 / SEC 2) has 116 digits,
// about 3.94 × 10^115; at 10^12 tries a second, trying every key takes about 1.25 × 10^96 years, a number 97
// digits long, against the universe's 13.8 billion years (11 digits).
// Facts: Mozilla security blog and dev-security-policy (Dennis Jackson, 20 October 2026): on Saturday
// 17 October 2026 at 20:06 UTC Mozilla received a report that private keys of eight eMudhra intermediate
// certificates were compromised; they "could allow attackers to issue fraudulent HTTPS certificates for websites
// they do not control"; blocked in Firefox via OneCRL by 22:59 UTC. Mozilla bug 2083449: P-384 private keys
// are random integers between 1 and the group order; the 8 impacted keys all used integers less than 256 and
// can be recovered by "just generating the 'first' 256 P384 keys"; 6 are TLS intermediates, 2 code signing;
// they came from a batch of 24 generated on 30 April 2025; Chrome blocked the six TLS ones by CRLSet on 17
// October and found no certificates from them in Certificate Transparency logs. The Register (Scott Helme):
// one key "is the number 4", others 56 and 115; other researchers found 66, 155, 156, 230 and 237; "A P-384
// private key should be a random 384-bit number"; recovered on a laptop in less than a second. Help Net
// Security: Chrome and Firefox blocked them on the day of the report, Apple on 19 October, Microsoft on
// 20 October; eMudhra traced it to a faulty script in the April 2025 key ceremony that made a second set of
// weaker keys whose labels resembled the good ones, and staff picked the weak ones.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The news (eMudhra's keys blocked), then the chain of trust: root, intermediate, website.
//  B  9.2–23.0  A private key is a number k; the public key is k·G on a curve; forwards easy, backwards try.
//  C 23.0–32.2  A real P-384 key has up to 116 digits; trying them all would take a 97-digit number of years.
//  D 32.2–46.0  eMudhra's eight keys were all below 256; a 16 × 16 grid of every key up to 256 fills in.
//  E 46.0–64.6  A fake certificate becomes possible; browsers block the keys; the faulty script; randomness.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#0f1222', bg2: '#1b2142', ink: '#eef0fb', soft: 'rgba(238,240,251,0.70)', faint: 'rgba(238,240,251,0.22)',
  paper: '#f3ead7', paperInk: '#1d2238', paperSoft: 'rgba(29,34,56,0.62)', seal: '#c8423b', sealDark: '#8f2a25',
  gold: '#f2b84b', teal: '#43d1bd', coral: '#ff7a59', panel: 'rgba(8,10,22,0.78)', green: '#7ee0a1',
};
const MONO = 'Azeret Mono', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the toy curve: y² = x³ + x + 4 (mod 233) ----------
const P = 233, CA = 1, CB = 4;
const mod = (n) => ((n % P) + P) % P;
const inv = (n) => { let r = 1, b = mod(n), e = P - 2; while (e) { if (e & 1) r = (r * b) % P; b = (b * b) % P; e >>= 1; } return r; };
function add(p1, p2) {
  if (!p1) return p2; if (!p2) return p1;
  const [x1, y1] = p1, [x2, y2] = p2;
  if (x1 === x2 && mod(y1 + y2) === 0) return null;
  const l = x1 === x2 && y1 === y2 ? mod((3 * x1 * x1 + CA) * inv(2 * y1)) : mod((y2 - y1) * inv(x2 - x1));
  const x3 = mod(l * l - x1 - x2);
  return [x3, mod(l * (x1 - x3) - y1)];
}
const POINTS = [];
for (let x = 0; x < P; x++) for (let y = 0; y < P; y++) if (mod(y * y - (x * x * x + CA * x + CB)) === 0) POINTS.push([x, y]);
const ORDER = POINTS.length + 1; // 257, with the point at infinity
const G = [2, 108];
const MULT = [null]; // MULT[k] = k·G
for (let i = 1; i < ORDER; i++) MULT.push(add(MULT[i - 1], G));
const PLOT = { x: 112, y: 132, s: 640 / P };
const PX = (pt) => PLOT.x + pt[0] * PLOT.s, PY = (pt) => PLOT.y + (P - 1 - pt[1]) * PLOT.s;

// ---------- the real numbers ----------
const P384_DIGITS = 116; // the group order of P-384, about 3.94 × 10^115
const TRIES_PER_S = 1e12, YEAR_S = 365.25 * 86400;
const SEARCH_YEARS_LOG10 = 115 + Math.log10(3.94) - 12 - Math.log10(YEAR_S); // ≈ 96.1
const SEARCH_DIGITS = Math.floor(SEARCH_YEARS_LOG10) + 1; // 97
const UNIVERSE_DIGITS = String(13.8e9).length; // 11
const KEYS = [4, 56, 66, 115, 155, 156, 230, 237];

// a random-looking 116-digit key, for show only
const BIG = (() => { let s = 2026, out = '3'; while (out.length < P384_DIGITS) { s = (s * 16807) % 2147483647; out += String(s % 10); } return out; })();

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In October 2026, browsers blocked eight keys of ^eMudhra^, a certificate authority in India.'],
  [4.8, 9.0, 'A site’s *certificate* is signed by an *intermediate*, and that by a *root* your browser trusts.'],
  [9.2, 13.6, 'Each signer holds a ~private key~, one secret number, and a public key made from it.'],
  [13.8, 18.2, 'Take a point *G* on a curve and add it to itself ~k~ times: that point is the public key.'],
  [18.4, 22.8, 'Forwards is quick. Backwards, nobody knows a fast way: you try key after key.'],
  [23.0, 27.4, `So the secret must be huge: on the curve *P-384*, a key is a random number of up to *${P384_DIGITS} digits*.`],
  [27.6, 32.0, `At a trillion tries a second, trying them all takes a number of years *${SEARCH_DIGITS} digits long*.`],
  [32.2, 36.6, 'On 17 October 2026, a researcher reported that one of eMudhra’s keys was ~4~.'],
  [36.8, 41.2, `All eight were below *256*: ${KEYS.slice(0, -1).join(', ')} and ${KEYS.at(-1)}.`],
  [41.4, 45.8, 'Trying the first 256 keys takes a laptop *less than a second*. Nothing had to be stolen.'],
  [46.0, 50.4, 'With them, anyone could issue a ~fake certificate~ for a website they don’t control.'],
  [50.6, 55.0, 'Chrome and Firefox blocked them that day; Apple on 19 October, Microsoft on the 20th.'],
  [55.2, 59.6, 'eMudhra said a faulty script made weak keys with look-alike labels, and staff picked them.'],
  [59.8, 64.2, 'A secret key is only as strong as the *randomness* that chose it.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint guilloche, like the background of a security document
  g.strokeStyle = 'rgba(160,170,230,0.05)'; g.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    g.beginPath();
    for (let x = 0; x <= W; x += 6) { const y = 40 + i * 40 + Math.sin(x / 47 + i * 0.7) * 14 + Math.sin(x / 13 + i) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
}

// ---------- pieces ----------
function seal(x, y, r, a = 1, label = '') {
  A(a, () => {
    ctx.fillStyle = C.sealDark; ctx.beginPath();
    for (let i = 0; i < 24; i++) { const ang = (i / 24) * Math.PI * 2, rr = r * (i % 2 ? 0.9 : 1.04); i ? ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr) : ctx.moveTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.seal; ctx.beginPath(); ctx.arc(x, y, r * 0.76, 0, Math.PI * 2); ctx.fill();
    if (label) { font(700, Math.round(r * 0.5)); text(label, x, y + 1, { color: C.paper, align: 'center' }); }
  });
}

/** A certificate card: name, issuer line, optional key line. */
function card(x, y, w, h, title, sub, { a = 1, keyText = '', keyColor = C.coral, sealLabel = '' } = {}) {
  A(a, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(x + 6, y + 8, w, h, 14); ctx.fill();
    ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(29,34,56,0.25)'; ctx.lineWidth = 2; k.rrect(x + 8, y + 8, w - 16, h - 16, 9); ctx.stroke();
    font(700, 28); text(title, x + 28, y + 40, { color: C.paperInk });
    font(500, 22); text(sub, x + 28, y + 74, { color: C.paperSoft });
    if (keyText) { font(800, 30); text(keyText, x + 28, y + h - 34, { color: keyColor }); }
    seal(x + w - 52, y + h / 2, 30, 1, sealLabel);
  });
}

// ---------- A: the padlock and the chain ----------
function sceneChain(t) {
  const a = 1 - seg(t, 8.9, 9.5);
  if (a <= 0) return;
  A(a, () => {
    // the address bar
    A(eout(seg(t, 0.2, 0.9)), () => {
      ctx.fillStyle = 'rgba(238,240,251,0.08)'; k.rrect(60, 110, 640, 70, 35); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; k.rrect(60, 110, 640, 70, 35); ctx.stroke();
      // padlock
      const lx = 104, ly = 146;
      ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(lx, ly - 8, 10, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = C.green; k.rrect(lx - 15, ly - 8, 30, 24, 4); ctx.fill();
      font(500, 30); text('https://', 138, 146, { color: C.soft }); text('your-bank.example', 290, 146, { color: C.ink });
    });
    // the news: whose keys
    A(span(t, 0.6, 5.4, 0.5, 0.5), () => {
      k.font(800, 72, SANS); text('eMudhra', W / 2, 300, { color: C.teal, align: 'center' });
      k.font(500, 28, SANS); text('a certificate authority in India', W / 2, 356, { color: C.soft, align: 'center' });
      A(seg(t, 1.6, 2.1), () => { font(700, 28); text('8 keys blocked · October 2026', W / 2, 410, { color: C.coral, align: 'center' }); });
    });
    // the chain, built from the bottom up
    const cw = 600, cx = (W - cw) / 2;
    const rows = [
      { y: 610, title: 'your-bank.example', sub: 'website certificate', at: 1.2 },
      { y: 430, title: 'Intermediate authority', sub: 'signs website certificates', at: 5.0 },
      { y: 250, title: 'Root authority', sub: 'built into your browser', at: 6.2 },
    ];
    rows.forEach((r, i) => {
      const p = eout(seg(t, r.at, r.at + 0.6));
      if (p <= 0) return;
      card(cx, r.y + (1 - p) * 40, cw, 120, r.title, r.sub, { a: p, sealLabel: i === 2 ? 'OK' : '' });
    });
    // "signed by" arrows
    for (const [y0, y1, at] of [[610, 550, 5.4], [430, 370, 6.6]]) {
      A(eout(seg(t, at, at + 0.5)), () => {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([7, 6]);
        ctx.beginPath(); ctx.moveTo(W / 2 + 120, y1 + 4); ctx.lineTo(W / 2 + 120, y0 - 4); ctx.stroke(); ctx.setLineDash([]);
        font(600, 22); text('signed by', W / 2 + 136, (y0 + y1) / 2, { color: C.gold });
      });
    }
  });
}

// ---------- B: the toy curve ----------
function curveCloud(a, dim = 1) {
  A(a, () => {
    for (const pt of POINTS) { ctx.fillStyle = `rgba(67,209,189,${0.42 * dim})`; ctx.beginPath(); ctx.arc(PX(pt), PY(pt), 3.2, 0, Math.PI * 2); ctx.fill(); }
  });
}

function sceneCurve(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // the private key, as a number
    A(span(t, 9.4, 13.8, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(132, 300, 600, 220, 18); ctx.fill();
      font(600, 26); text('private key', W / 2, 352, { color: C.soft, align: 'center' });
      font(800, 92); text('k = ?', W / 2, 440, { color: C.coral, align: 'center' });
      font(500, 22); text('one whole number, kept secret', W / 2, 492, { color: C.soft, align: 'center' });
    });
    if (t < 13.6) return;
    const cl = eout(seg(t, 13.8, 14.6));
    // frame of the plot
    A(cl, () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.strokeRect(PLOT.x - 8, PLOT.y - 8, 640 + 16, 640 + 16);
      font(500, 20); text(`toy curve: y² = x³ + x + 4, counting mod ${P}`, PLOT.x - 8, PLOT.y - 26, { color: C.soft });
    });
    curveCloud(cl);
    // forwards: G, 2G, 3G … hop by hop
    const hops = t < 18.4 ? Math.floor(clamp((t - 14.6) / 0.42, 0, 9)) : 9;
    const fwdA = 1 - seg(t, 18.2, 18.8);
    A(fwdA, () => {
      for (let i = 1; i <= hops; i++) {
        const p0 = MULT[i], p1 = MULT[i + 1];
        if (i < hops) { ctx.strokeStyle = 'rgba(242,184,75,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(p0), PY(p0)); ctx.lineTo(PX(p1), PY(p1)); ctx.stroke(); }
        ctx.fillStyle = i === hops ? C.coral : C.gold; ctx.beginPath(); ctx.arc(PX(p0), PY(p0), i === hops ? 9 : 6, 0, Math.PI * 2); ctx.fill();
        font(700, 22); text(i === 1 ? 'G' : `${i}G`, PX(p0) + 12, PY(p0) - 14, { color: i === hops ? C.coral : C.gold });
      }
    });
    // backwards: a public key K, and a search that hops blindly until it lands on it
    if (t >= 18.4) {
      const SECRET = 77, KEYPT = MULT[SECRET];
      const tries = clamp(Math.floor((t - 19.0) / 0.045), 0, SECRET);
      A(seg(t, 18.4, 18.9), () => {
        ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(PX(KEYPT), PY(KEYPT), 15, 0, Math.PI * 2); ctx.stroke();
        font(700, 22); text('public key', PX(KEYPT) + 22, PY(KEYPT), { color: C.coral });
        if (tries > 0) {
          const pt = MULT[tries];
          ctx.fillStyle = tries === SECRET ? C.gold : C.ink; ctx.beginPath(); ctx.arc(PX(pt), PY(pt), 7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = C.panel; k.rrect(PLOT.x + 8, PLOT.y + 8, 300, 56, 10); ctx.fill();
        font(700, 28); text(tries === SECRET ? `k = ${SECRET}  found` : `try k = ${tries || 1}`, PLOT.x + 26, PLOT.y + 37, { color: tries === SECRET ? C.gold : C.ink });
      });
    }
  });
}

// ---------- C: how big a real key is ----------
function sceneBig(t) {
  const a = span(t, 23.0, 32.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('a P-384 private key, picked at random', 72, 150, { color: C.soft });
    // the digits appear row by row
    const shown = Math.floor(eio(seg(t, 23.4, 26.2)) * P384_DIGITS);
    font(600, 33);
    const per = 29;
    for (let r = 0; r * per < shown; r++) text(BIG.slice(r * per, Math.min(shown, (r + 1) * per)), 72, 210 + r * 50, { color: C.coral });
    A(seg(t, 26.2, 26.8), () => { font(600, 24); text(`up to ${P384_DIGITS} digits long`, 72, 420, { color: C.soft }); });
    // digits of the search time against digits of the universe's age
    A(seg(t, 27.8, 28.4), () => {
      const cell = 22, gap = 4, x0 = 72;
      font(600, 22); text('age of the universe in years', x0, 500, { color: C.soft });
      for (let i = 0; i < UNIVERSE_DIGITS; i++) { ctx.fillStyle = C.teal; ctx.fillRect(x0 + i * (cell + gap), 522, cell, cell); }
      font(700, 22); text('13,800,000,000', x0 + UNIVERSE_DIGITS * (cell + gap) + 16, 534, { color: C.teal });
      text('years to try every key, one digit per square', x0, 596, { color: C.soft });
      const n = Math.floor(eout(seg(t, 28.6, 30.6)) * SEARCH_DIGITS), perRow = 27;
      for (let i = 0; i < n; i++) { ctx.fillStyle = C.gold; ctx.fillRect(x0 + (i % perRow) * (cell + gap), 618 + Math.floor(i / perRow) * (cell + gap), cell, cell); }
      A(seg(t, 30.6, 31.0), () => { font(700, 24); text(`${SEARCH_DIGITS} digits`, x0 + 22 * (cell + gap) - 6, 618 + 3 * (cell + gap) + 11, { color: C.gold }); });
    });
  });
}

// ---------- D: eMudhra's keys ----------
function sceneKeys(t) {
  const a = span(t, 32.2, 46.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // the intermediate's card, with its key revealed
    const p = eout(seg(t, 32.4, 33.1));
    const reveal = seg(t, 34.6, 35.2);
    card(132, 110 + (1 - p) * 30, 600, 150, 'EM DV TLS CA - G3C', 'an eMudhra intermediate', {
      a: p, keyText: reveal > 0 ? 'private key = 4' : 'private key = ?', keyColor: reveal > 0 ? C.seal : C.paperSoft,
    });
    // every key from 1 to 256, tried in order
    const gx = 224, gy = 296, cs = 26;
    const tried = Math.floor(clamp((t - 37.0) / 3.6, 0, 1) * 256);
    A(seg(t, 36.6, 37.0), () => {
      for (let i = 1; i <= 256; i++) {
        const r = Math.floor((i - 1) / 16), c = (i - 1) % 16, x = gx + c * cs, y = gy + r * cs;
        const hit = KEYS.includes(i);
        ctx.fillStyle = i <= tried ? (hit ? C.gold : 'rgba(238,240,251,0.20)') : 'rgba(238,240,251,0.06)';
        ctx.fillRect(x, y, cs - 4, cs - 4);
        if (hit && i <= tried) { font(700, 11); text(String(i), x + (cs - 4) / 2, y + (cs - 4) / 2 + 1, { color: C.paperInk, align: 'center' }); }
      }
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 290, gy + 16 * cs + 10, 580, 50, 10); ctx.fill();
      font(700, 24); text(`tried ${Math.max(tried, 0)} of 256 · found ${KEYS.filter((x) => x <= tried).length} of 8`, W / 2, gy + 16 * cs + 36, { color: C.ink, align: 'center' });
    });
    A(span(t, 41.6, 46.0, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 200, gy + 140, 400, 132, 16); ctx.fill();
      font(800, 50); text('under 1 s', W / 2, gy + 190, { color: C.gold, align: 'center' });
      font(500, 22); text('on a laptop', W / 2, gy + 240, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- E: the fake, the block, the cause, the moral ----------
function sceneAfter(t) {
  const a = span(t, 46.0, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    const cw = 600, cx = (W - cw) / 2;
    // the chain again, now with a forged website certificate
    A(1 - seg(t, 54.9, 55.4), () => {
      card(cx, 140, cw, 120, 'Root authority', 'built into your browser', { sealLabel: 'OK' });
      card(cx, 320, cw, 120, 'EM DV TLS CA - G3C', 'eMudhra intermediate', { keyText: '', sealLabel: '' });
      const f = eout(seg(t, 46.6, 47.4));
      card(cx, 500 + (1 - f) * 40, cw, 120, 'any-site.example', 'signed with key 4', { a: f, sealLabel: '4' });
      A(f, () => {
        ctx.save(); ctx.translate(cx + cw - 170, 560); ctx.rotate(-0.12);
        ctx.strokeStyle = C.seal; ctx.lineWidth = 4; k.rrect(-78, -26, 156, 52, 6); ctx.stroke();
        font(800, 30); text('FAKE', 0, 2, { color: C.seal, align: 'center' }); ctx.restore();
      });
      for (const [y0, y1] of [[500, 440], [320, 260]]) {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([7, 6]);
        ctx.beginPath(); ctx.moveTo(W / 2 + 120, y1 + 2); ctx.lineTo(W / 2 + 120, y0 - 2); ctx.stroke(); ctx.setLineDash([]);
      }
      // blocked, browser by browser
      const blocks = [['Chrome', '17 Oct', 50.8], ['Firefox', '17 Oct', 51.6], ['Apple', '19 Oct', 52.4], ['Microsoft', '20 Oct', 53.2]];
      A(seg(t, 50.6, 51.0), () => {
        ctx.save(); ctx.translate(cx + cw / 2 - 40, 380); ctx.rotate(-0.08);
        ctx.fillStyle = 'rgba(200,66,59,0.92)'; k.rrect(-150, -34, 300, 68, 8); ctx.fill();
        font(800, 38); text('BLOCKED', 0, 2, { color: C.paper, align: 'center', spacing: '4px' }); ctx.restore();
        blocks.forEach(([who, when, at], i) => {
          A(eout(seg(t, at, at + 0.4)), () => {
            const x = 72 + i * 186;
            ctx.fillStyle = C.panel; k.rrect(x, 650, 170, 84, 12); ctx.fill();
            font(700, 24); text(who, x + 85, 680, { color: C.ink, align: 'center' });
            font(500, 22); text(when, x + 85, 712, { color: C.gold, align: 'center' });
          });
        });
      });
    });
    // the cause: two keys with look-alike labels
    A(span(t, 55.2, 59.9, 0.5, 0.4), () => {
      font(600, 24); text('the key ceremony, April 2025', 72, 150, { color: C.soft });
      const rows = [[230, 'random key', BIG.slice(0, 22) + '…', C.teal], [380, 'weak key', '4', C.coral]];
      rows.forEach(([y, kind, val, col], i) => {
        ctx.fillStyle = 'rgba(238,240,251,0.07)'; k.rrect(72, y, 720, 110, 14); ctx.fill();
        // the label: the same shape on both, drawn as bars rather than real names
        ctx.fillStyle = 'rgba(238,240,251,0.55)';
        for (const [bx, bw] of [[100, 70], [180, 46], [236, 90], [336, 38]]) { ctx.fillRect(bx, y + 26, bw, 14); }
        font(600, 20); text(kind, 100, y + 76, { color: C.soft });
        font(700, 28); text(val, 250, y + 76, { color: col });
      });
      // the pick
      const pick = eio(seg(t, 56.8, 58.0));
      A(seg(t, 56.6, 57.0), () => {
        const yy = lerp(285, 435, pick);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4; k.rrect(64, yy - 63, 736, 126, 18); ctx.stroke();
        font(700, 24); text('picked', 690, yy + 30, { color: C.gold });
      });
      A(seg(t, 58.0, 58.4), () => { font(600, 24); text('labels looked alike, according to eMudhra', 72, 560, { color: C.soft }); });
    });
    // the moral: randomness
    A(span(t, 59.8, 64.8, 0.5, 0.01), () => {
      font(600, 24); text('a key is a number picked at random from', W / 2, 210, { color: C.soft, align: 'center' });
      k.font(800, 56, SANS); text(`1 up to a ${P384_DIGITS}-digit number`, W / 2, 290, { color: C.ink, align: 'center' });
      // dice tumbling digits into a key
      font(600, 30);
      const n = Math.floor(eout(seg(t, 60.4, 63.4)) * 58);
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / 29), c = i % 29, d = BIG[(i * 7 + 3) % BIG.length];
        text(d, 92 + c * 24.5, 420 + r * 54, { color: i === n - 1 ? C.gold : C.teal });
      }
      A(seg(t, 62.4, 63.0), () => { font(700, 28); text('not 4', W / 2, 580, { color: C.coral, align: 'center' }); });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [MONO, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneChain(t);
    sceneCurve(t);
    sceneBig(t);
    sceneKeys(t);
    sceneAfter(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.coral, '^': C.teal } });
  },
});
