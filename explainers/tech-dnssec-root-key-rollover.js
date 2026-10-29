// Explainer for tech-dnssec-root-key-rollover: on 11 October 2026 at 14:00 UTC the root zone of the Domain Name
// System began signing with a new key signing key, KSK-2024 (key tag 38696), only the second change of the root's
// trust anchor. How a resolver checks a signed answer up a chain to one root key, and how you swap that key
// without breaking the chain. Look: a deep indigo night with a faint network of dots, brass-coloured keys (amber for
// the old key, mint for the new), lilac signature seals, coral for failures. IBM Plex Mono for keys, names and
// numbers, Space Grotesk for captions.
//
// Facts: IANA, "DNS Root Zone Begins Using New Key Signing Key" (11 October 2026): the root zone began using a new
// KSK, key tag 38696, replacing the previous root KSK; most users should see no disruption; validating resolvers
// not updated to trust it may fail validation. ICANN KSK rollover page: "On 11 October 2026 at 14:00 UTC, KSK-2024
// began signing the DNS root zone as scheduled." ICANN announcement (15 October 2026): completed as planned;
// aware of reports of issues affecting a limited number of systems; scheduled revocation of the previous KSK in
// January 2027; the first root KSK rollover took place in 2018. ICANN blog, Roy Arends (27 July 2026): KSK-2024
// first published in the root zone on 11 January 2025; RFC 5011 resolvers must see a new key for 30 days before
// trusting it automatically; more than 95 percent of reporting resolvers had recognized and adopted KSK-2024; a
// validating resolver without KSK-2024 will experience total DNS resolution failures. ICANN, "DNSSEC – What Is It
// and Why Is It Important?": DNS translates names into IP addresses; recursive resolvers do the lookups; DNSSEC
// adds digital signatures; a chain of signed zones from the root lets a resolver build a chain of trust; the key at
// the start is the trust anchor, and most resolvers have just one, the root zone's key; the root has been signed
// since 2010; first trust anchor change in 2018; new trust anchor generated in 2024. RFC 5011 §2.2 and §2.4.1:
// the add hold-down (30 days) guards against an attacker who has stolen a trust key adding a key of their own.
// ICANN operational plans page: the rollover planned for 11 October 2017 was postponed on 27 September 2017 and
// happened on 11 October 2018 (ICANN blog, 30 October 2018: at 16:00 UTC). Internet Society blog (September
// 2017), quoting ICANN: a significant number of resolvers used by ISPs and network operators were not yet ready.
// IANA trust anchor file root-anchors.xml: key tags 19036 (from 2010), 20326 (from 2017), 38696 (from 2024),
// algorithm 8 (RSA/SHA-256). Computed here from that file: both current keys are 2,048-bit RSA keys, and their
// tags (20326, 38696) come out of the RFC 4034 checksum over each key's bytes.
// The chain is simplified: each zone really signs with two keys, and the parent publishes a hash of the child's
// key. example.org and the addresses 192.0.2.44 and 198.51.100.66 are illustrations (documentation addresses).
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  Hook: the root key changed on 11 October 2026; what the Domain Name System does.
//  B  9.6–28.0  Signatures; the chain: example.org ← .org ← root; the trust anchor.
//  C 28.0–51.0  The swap: published January 2025 signed by the old key; 30-day wait; the switch; failures; 95%.
//  D 51.0–65.0  History: 2018 a year late; the old key revoked in January 2027.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#100e24', bg1: '#1b1740', ink: '#eef0ff', soft: 'rgba(238,240,255,0.72)', faint: 'rgba(238,240,255,0.26)',
  old: '#f0a843', new: '#58d6a8', seal: '#b9a6ff', bad: '#ff6b6b', box: 'rgba(30,26,70,0.92)', line: 'rgba(238,240,255,0.18)',
};
const MONO = 'IBM Plex Mono', CAP = 'Space Grotesk';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts ----------
const OLD = 20326, NEW = 38696, FIRST_KEY = 19036, HOLD_DAYS = 30, READY = 95, BITS = 2048;

const CUES = [
  [0.4, 4.8, 'On 11 October 2026 at 14:00 UTC, the internet’s Domain Name System switched to a new *root key*.'],
  [5.0, 9.4, 'That system turns names into the numbers computers use: a *resolver* asks down a chain of servers.'],
  [9.6, 14.0, 'A forged answer could send you to the wrong place, so answers can carry a digital ^signature^.'],
  [14.2, 18.6, 'example.org’s key signs its answer. But why trust that key? Because *.org* vouches for it.'],
  [18.8, 23.2, 'And the *root zone*, at the top of the whole system, vouches for .org’s key.'],
  [23.4, 27.8, 'Nothing vouches for the root. Resolvers just keep its key: the *trust anchor* it all rests on.'],
  [28.0, 32.4, 'So how do you swap that key? A message saying “trust this new key” could itself be a fake.'],
  [32.6, 37.0, 'So the new key, *KSK-2024*, went into the root zone on 11 January 2025, signed by the ~old key~.'],
  [37.2, 41.6, `A resolver that spots it waits *${HOLD_DAYS} days* to trust it: time to catch a fake signed with a stolen key.`],
  [41.8, 46.2, 'On 11 October 2026 the root began signing with the *new key* only. Updated resolvers carried on.'],
  [46.4, 50.8, `A resolver that knew only the old key, ~${OLD}~, could check nothing, and every lookup failed.`],
  [51.0, 55.4, `By July, more than *${READY}%* of resolvers that report their keys had picked up the new one.`],
  [55.6, 60.0, 'The first swap, in 2018, came a year late: too many resolvers weren’t ready for the new key.'],
  [60.2, 64.6, `The old key is due to be revoked in January 2027. Now key *${NEW}* anchors every check.`],
];

// ---------- background: a faint network ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = Array.from({ length: 60 }, () => [r() * W, r() * 780]);
  g.strokeStyle = 'rgba(238,240,255,0.05)'; g.lineWidth = 1;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 120) { g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[j]); g.stroke(); }
  }
  for (const [x, y] of pts) { g.fillStyle = 'rgba(238,240,255,0.12)'; g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill(); }
}

// ---------- drawings ----------
/** A key lying flat, bow on the left, with its tag inside the bow. */
function key(x, y, s, color, tag = '', { dim = 1 } = {}) {
  A(dim, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(34, -6, 110, 12);
    ctx.fillRect(112, 6, 12, 22); ctx.fillRect(132, 6, 12, 30);
    ctx.restore();
    if (tag) { font(700, Math.max(18, 22 * s)); text(tag, x + 72 * s, y + 34 * s + 16, { color, align: 'center' }); }
  });
}
/** A wax seal with a tick: a signature. */
function seal(x, y, r, color = C.seal) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.86 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
  tick(x, y, r * 0.5, C.bg0, r * 0.22);
}
function tick(x, y, s, color, w = 6) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x - s * 0.3, y + s * 0.7); ctx.lineTo(x + s, y - s * 0.7); ctx.stroke();
}
function cross(x, y, s, color, w = 7) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
}
function box(x, y, w, h, label, { color = C.ink, sub = '', r = 16, stroke = C.line } = {}) {
  ctx.fillStyle = C.box; k.rrect(x - w / 2, y - h / 2, w, h, r); ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 3; k.rrect(x - w / 2, y - h / 2, w, h, r); ctx.stroke();
  font(700, 28); text(label, x, sub ? y - 14 : y, { color, align: 'center' });
  if (sub) { font(400, 19, CAP); text(sub, x, y + 20, { color: C.soft, align: 'center' }); }
}
function arrow(x0, y0, x1, y1, color, w = 4, head = 14) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}
/** A moving dot along a line, for messages. */
function packet(x0, y0, x1, y1, u, color) {
  if (u <= 0 || u >= 1) return;
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(lerp(x0, x1, u), lerp(y0, y1, u), 8, 0, Math.PI * 2); ctx.fill();
}
function phone(x, y, screen = '', color = C.ink) {
  ctx.fillStyle = '#2a2560'; k.rrect(x - 44, y - 80, 88, 160, 16); ctx.fill();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(x - 44, y - 80, 88, 160, 16); ctx.stroke();
  ctx.fillStyle = '#0c0a1e'; k.rrect(x - 34, y - 64, 68, 120, 8); ctx.fill();
  if (screen) { font(600, 13); text(screen, x, y - 4, { color, align: 'center' }); }
}

// ---------- A: the hook and a lookup ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0, 0.4);
  if (a <= 0) return;
  A(a, () => {
    panel(W / 2 - 250, 150, 500, 100);
    font(700, 40); text('11 OCT 2026', W / 2, 186, { color: C.ink, align: 'center' });
    font(500, 24); text('14:00 UTC · root zone', W / 2, 226, { color: C.soft, align: 'center' });
    const g = eio(seg(t, 1.4, 3.0));
    // the old key slides away and dims, the new key slides in
    key(W / 2 - 80 - 240 * g, 450, 1.5, C.old, String(OLD), { dim: 1 - 0.7 * g });
    key(W / 2 - 80 + 300 * (1 - g), 450, 1.5, C.new, String(NEW), { dim: g });
    A(seg(t, 3.0, 3.5), () => { font(500, 24, CAP); text('the key at the top of the internet’s address system', W / 2, 600, { color: C.soft, align: 'center' }); });
  });
}
function panel(x, y, w, h, r = 16) { ctx.fillStyle = C.box; k.rrect(x, y, w, h, r); ctx.fill(); }
const SERVERS = [['.', 'root', 250], ['org', '.org', 430], ['example.org', 'example.org', 610]];
function lookup(t) {
  const a = span(t, 5.0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    phone(110, 430, t > 8.4 ? '192.0.2.44' : 'example.org?', t > 8.4 ? C.new : C.ink);
    box(360, 430, 190, 90, 'resolver');
    for (const [, name, y] of SERVERS) box(690, y, 240, 80, name, { sub: 'name server' });
    // the question goes phone → resolver → each server in turn, the answer comes back
    packet(160, 430, 265, 430, seg(t, 5.3, 5.8), C.ink);
    SERVERS.forEach(([, , y], i) => {
      const t0 = 6.0 + i * 0.7;
      ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(455, 430); ctx.lineTo(570, y); ctx.stroke();
      packet(455, 430, 570, y, seg(t, t0, t0 + 0.3), C.ink);
      packet(570, y, 455, 430, seg(t, t0 + 0.35, t0 + 0.65), C.seal);
    });
    packet(265, 430, 160, 430, seg(t, 8.2, 8.5), C.new);
    font(500, 21, CAP); text('“where is example.org?”', 210, 540, { color: C.soft, align: 'center' });
    A(seg(t, 8.4, 8.8), () => { font(600, 22); text('192.0.2.44', 360, 510, { color: C.new, align: 'center' }); });
    font(400, 18, CAP); text('illustration: example name and address', W / 2, 760, { color: C.faint, align: 'center' });
  });
}

// ---------- B: signatures and the chain ----------
function forged(t) {
  const a = span(t, 9.6, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // two answers: the real one sealed, a forged one without a valid seal
    const real = eout(seg(t, 9.9, 10.5)), fake = eout(seg(t, 10.6, 11.2));
    A(real, () => {
      panel(110, 240, 290, 200);
      font(500, 22, CAP); text('answer', 255, 280, { color: C.soft, align: 'center' });
      font(700, 30); text('192.0.2.44', 255, 330, { color: C.ink, align: 'center' });
      A(seg(t, 11.8, 12.3), () => seal(255, 395, 32));
    });
    A(fake, () => {
      panel(464, 240, 290, 200);
      font(500, 22, CAP); text('forged answer', 609, 280, { color: C.soft, align: 'center' });
      font(700, 30); text('198.51.100.66', 609, 330, { color: C.bad, align: 'center' });
      A(seg(t, 11.8, 12.3), () => { ctx.strokeStyle = C.bad; ctx.lineWidth = 4; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(609, 395, 32, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); font(600, 18); text('no valid', 609, 388, { color: C.bad, align: 'center' }); text('signature', 609, 406, { color: C.bad, align: 'center' }); });
    });
    A(seg(t, 12.6, 13.1), () => {
      box(432, 560, 230, 80, 'resolver');
      tick(300, 560, 18, C.new, 7); cross(570, 560, 16, C.bad, 7);
      arrow(255, 450, 330, 520, C.new); arrow(609, 450, 534, 520, C.bad);
      font(500, 21, CAP); text('accepts', 300, 610, { color: C.new, align: 'center' }); text('rejects', 570, 610, { color: C.bad, align: 'center' });
    });
  });
}
/** The chain of trust: three zones, each with a key; step 0–3 shows how far up it is drawn. */
function chain(t, { step, anchorKey = C.old, anchorTag = String(OLD), resolver = true }) {
  const xs = 520, ys = [210, 370, 530];
  const names = ['root zone', '.org', 'example.org'];
  const keyCols = [anchorKey, C.seal, C.seal];
  // the answer at the bottom
  panel(xs - 150, 620, 300, 100);
  font(500, 20, CAP); text('example.org’s answer', xs, 648, { color: C.soft, align: 'center' });
  font(700, 26); text('192.0.2.44', xs, 686, { color: C.ink, align: 'center' });
  for (let i = 2; i >= 0; i--) {
    const level = 3 - i; // example.org shows at step 1, .org at 2, root at 3
    const g = clamp(step - level + 1, 0, 1);
    if (g <= 0) continue;
    A(g, () => {
      box(xs, ys[i], 300, 84, names[i], { color: i === 0 ? anchorKey : C.ink });
      key(xs - 230, ys[i], 0.55, keyCols[i], '');
      // the arrow from this zone's key to what it signs below
      const target = i === 2 ? 620 : ys[i + 1] - 42;
      arrow(xs + 170, ys[i] + 20, xs + 170, target - 6, C.seal, 4, 12);
      seal(xs + 210, (ys[i] + 20 + target) / 2, 16);
      font(500, 19, CAP); text(i === 2 ? 'signs' : 'vouches', xs + 236, (ys[i] + 20 + target) / 2, { color: C.seal, align: 'left' });
    });
  }
  if (resolver) A(clamp(step - 3, 0, 1), () => {
    // the resolver keeps the root's key on its key ring
    box(150, 620, 220, 100, 'resolver');
    key(92, 500, 0.8, anchorKey, anchorTag);
    font(700, 22); text('TRUST ANCHOR', 140, 440, { color: anchorKey, align: 'center' });
    ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(220, 470); ctx.lineTo(xs - 280, ys[0] + 10); ctx.stroke(); ctx.setLineDash([]);
    font(500, 19, CAP); text('kept, not looked up', 150, 690, { color: C.soft, align: 'center' });
  });
}
function chainScene(t) {
  const a = span(t, 14.2, 28.0, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const step = 1 + eio(seg(t, 15.6, 16.4)) + eio(seg(t, 19.0, 19.8)) + eio(seg(t, 23.6, 24.4));
    chain(t, { step });
  });
}

// ---------- C: the swap ----------
function fakeNote(t) {
  const a = span(t, 28.0, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    box(150, 560, 220, 90, 'resolver');
    // a note claiming a new key, from nobody it can check
    const g = eout(seg(t, 28.6, 29.4));
    ctx.save(); ctx.translate(lerp(700, 520, g), 330); ctx.rotate(-0.06);
    ctx.fillStyle = '#efe7d0'; k.rrect(-170, -90, 340, 180, 8); ctx.fill();
    font(600, 24, CAP); text('“Trust this new', 0, -42, { color: '#2a2560', align: 'center' });
    text('root key from now on.”', 0, -8, { color: '#2a2560', align: 'center' });
    key(-60, 46, 0.5, '#2a2560');
    font(500, 18, CAP); text('signed: ???', 40, 50, { color: '#7a6f99', align: 'left' });
    ctx.restore();
    A(seg(t, 30.4, 30.9), () => { font(700, 30); text('?', 150, 470, { color: C.bad, align: 'center' }); arrow(330, 400, 270, 500, C.faint); });
  });
}
function published(t) {
  const a = span(t, 32.6, 37.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the root zone's key set now holds both keys, signed by the old one
    panel(W / 2 - 300, 180, 600, 330, 22);
    font(600, 24); text('root zone’s keys', W / 2, 216, { color: C.soft, align: 'center' });
    key(W / 2 - 170, 300, 0.9, C.old, String(OLD));
    A(eout(seg(t, 33.0, 33.8)), () => key(W / 2 + 60, 300, 0.9, C.new, String(NEW)));
    A(seg(t, 34.2, 34.8), () => {
      ctx.strokeStyle = C.old; ctx.lineWidth = 4; k.rrect(W / 2 - 270, 250, 540, 110, 14); ctx.stroke();
      seal(W / 2, 430, 30, C.old);
      font(600, 22, CAP); text('signed by the old key', W / 2, 482, { color: C.old, align: 'center' });
    });
    // a timeline strip
    const L = 90, R = 774, y = 640;
    const X = (yr) => lerp(L, R, (yr - 2024) / 3.2);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    for (const yr of [2025, 2026, 2027]) { font(500, 18); text(String(yr), X(yr), y + 30, { color: C.faint, align: 'center' }); }
    const pub = X(2025 + 10 / 365);
    ctx.fillStyle = C.new; ctx.beginPath(); ctx.arc(pub, y, 10, 0, Math.PI * 2); ctx.fill();
    font(600, 20); text('11 JAN 2025', pub, y - 30, { color: C.new, align: 'center' });
    const sw = X(2026 + 283 / 365);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sw, y, 10, 0, Math.PI * 2); ctx.stroke();
    font(500, 20); text('11 OCT 2026', sw, y - 30, { color: C.soft, align: 'center' });
    A(seg(t, 35.0, 35.5), () => { font(500, 20, CAP); text('21 months to spread', (pub + sw) / 2, y + 62, { color: C.soft, align: 'center' }); });
  });
}
function holdDown(t) {
  const a = span(t, 37.2, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    box(220, 520, 240, 100, 'resolver');
    key(140, 400, 0.7, C.old, String(OLD));
    // 30 days ticking off, then the new key joins the ring
    const days = Math.floor(HOLD_DAYS * clamp(seg(t, 37.8, 40.4), 0, 1));
    const cx = 590, cy = 400, R = 120;
    for (let d = 0; d < HOLD_DAYS; d++) {
      const a0 = -Math.PI / 2 + (d / HOLD_DAYS) * Math.PI * 2 + 0.03, a1 = a0 + (Math.PI * 2) / HOLD_DAYS - 0.06;
      ctx.strokeStyle = d < days ? C.new : 'rgba(238,240,255,0.12)'; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
    }
    font(700, 64); text(String(days), cx, cy - 10, { color: C.new, align: 'center' });
    font(500, 22, CAP); text(`of ${HOLD_DAYS} days`, cx, cy + 44, { color: C.soft, align: 'center' });
    const join = eio(seg(t, 40.6, 41.4));
    key(lerp(cx - 60, 280, join), lerp(cy + 200, 400, join), 0.7, C.new, String(NEW));
    font(500, 20, CAP); text(join > 0.95 ? 'now trusted' : 'waiting', lerp(cx - 10, 330, join), lerp(cy + 280, 480, join) - (join > 0.95 ? 0 : 0), { color: C.new, align: 'center' });
    font(400, 18, CAP); text('the 30-day wait is set by the standard RFC 5011', W / 2, 760, { color: C.faint, align: 'center' });
  });
}
function switchover(t) {
  const a = span(t, 41.8, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the root now signs with the new key only
    panel(W / 2 - 230, 150, 460, 120, 18);
    font(600, 22); text('root zone signs with', W / 2, 184, { color: C.soft, align: 'center' });
    key(W / 2 - 170, 226, 0.5, C.old, '', { dim: 0.35 });
    font(700, 24); text(String(OLD), W / 2 - 60, 226, { color: 'rgba(240,168,67,0.35)', align: 'center' });
    ctx.strokeStyle = 'rgba(240,168,67,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 200, 226); ctx.lineTo(W / 2 - 20, 226); ctx.stroke();
    key(W / 2 + 40, 226, 0.5, C.new, '');
    font(700, 24); text(String(NEW), W / 2 + 150, 226, { color: C.new, align: 'center' });
    // two resolvers: one updated, one not
    const rs = [[220, true], [644, false]];
    for (const [x, ok] of rs) {
      box(x, 470, 250, 100, ok ? 'updated' : 'never updated', { color: ok ? C.new : C.bad, sub: 'resolver' });
      font(600, 18); text(ok ? `keys: ${OLD} + ${NEW}` : `key: ${OLD} only`, x, 548, { color: C.soft, align: 'center' });
      ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(W / 2 + (x < W / 2 ? -60 : 60), 270); ctx.stroke();
      const u = ((t - 42.2) * 0.9) % 1;
      if (t > 42.2) packet(W / 2 + (x < W / 2 ? -60 : 60), 270, x, 420, u, C.seal);
      A(seg(t, 43.0, 43.5), () => {
        if (ok) tick(x, 640, 26, C.new, 9); else cross(x, 640, 22, C.bad, 9);
        font(600, 20); text(ok ? 'answers check out' : 'every lookup fails', x - (ok ? 0 : 20), 700, { color: ok ? C.new : C.bad, align: 'center' });
      });
    }
    A(span(t, 46.6, 51.0, 0.4, 0.4), () => {
      phone(806, 630, 'SERVFAIL', C.bad);
      font(500, 20, CAP); text('its users seem cut off', 846, 744, { color: C.soft, align: 'right' });
    });
  });
}
function readiness(t) {
  const a = span(t, 51.0, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('resolvers reporting their keys, July 2026', W / 2, 200, { color: C.soft, align: 'center' });
    const L = 110, R = 754, y = 380, h = 80, g = eio(seg(t, 51.4, 53.0));
    ctx.fillStyle = 'rgba(238,240,255,0.10)'; k.rrect(L, y, R - L, h, 14); ctx.fill();
    ctx.fillStyle = C.new; k.rrect(L, y, (R - L) * (READY / 100) * g, h, 14); ctx.fill();
    font(700, 44); text(`> ${Math.round(READY * g)}%`, L + 24, y + h / 2, { color: C.bg0, align: 'left' });
    font(500, 22, CAP); text('had the new key', L + 10, y + h + 36, { color: C.new, align: 'left' });
    font(500, 22, CAP); text('the rest: not yet,', R, y + h + 36, { color: C.soft, align: 'right' }); text('or not reporting', R, y + h + 64, { color: C.soft, align: 'right' });
  });
}

// ---------- D: history ----------
function history(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('the root’s keys', W / 2, 160, { color: C.soft, align: 'center' });
    const rows = [
      [2010, String(FIRST_KEY), 'root zone first signed', C.faint, 56.0],
      [2018, String(OLD), 'first swap, planned for 2017', C.old, 56.6],
      [2026, String(NEW), 'second swap, 11 October', C.new, 57.2],
    ];
    rows.forEach(([yr, tag, note, color, at], i) => {
      const y = 260 + i * 150, g = eout(seg(t, at, at + 0.6));
      A(g, () => {
        font(700, 40); text(String(yr), 130, y, { color, align: 'center' });
        key(270, y - 10, 0.6, color, tag);
        font(500, 24, CAP); text(note, 430, y, { color: C.ink, align: 'left' });
      });
    });
    A(seg(t, 58.0, 58.5), () => {
      ctx.strokeStyle = C.bad; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(430, 440); ctx.lineTo(800, 440); ctx.stroke();
      font(500, 21, CAP); text('postponed a year: resolvers not ready', 430, 446 - 30 + 50, { color: C.bad, align: 'left' });
    });
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    chain(t, { step: 4, anchorKey: C.new, anchorTag: String(NEW) });
    A(seg(t, 61.2, 61.8), () => {
      font(500, 19, CAP); text(`KSK-2024: an RSA key of ${BITS.toLocaleString('en-US')} bits`, 520, 120 + 36, { color: C.new, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [MONO, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    lookup(t);
    forged(t);
    chainScene(t);
    fakeNote(t);
    published(t);
    holdDown(t);
    switchover(t);
    readiness(t);
    history(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.new, '~': C.old, '^': C.seal } });
  },
});
