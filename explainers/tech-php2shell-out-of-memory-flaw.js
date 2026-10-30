// Explainer for tech-php2shell-out-of-memory-flaw: on 21 October 2026 the PHP project released emergency fixes for
// two critical flaws nicknamed PHP2Shell (CVE-2026-109618 and CVE-2026-109619). How a web request that runs out of
// memory at exactly the wrong moment could leave half-built data and stale pointers behind for the next request, so
// an attacker could corrupt memory and run code. Look: a dark server room in charcoal and teal, memory as a row of
// numbered cells, requests as cards (amber for an ordinary one, magenta for the attacker's), red for corruption.
// JetBrains Mono for code, cells and numbers, Archivo for captions.
//
// Facts: PHP Foundation, "Today's PHP Security Release, and How We're Strengthening PHP Security" (21 October 2026):
// PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35 fix two critical vulnerabilities that, under the right conditions, let an
// unauthenticated attacker execute code; CVE-2026-109618: if a request reached PHP's memory_limit at exactly the
// wrong moment, PHP could leave partially initialized internal data behind and later treat it as valid, corrupting
// memory; on Apache with mod_php an unauthenticated request can trigger this before any application code runs, and
// full remote code execution was demonstrated with default settings; CVE-2026-109619: a fatal error at the wrong
// point could leave internal state pointing to memory that belonged to a previous request, and a later request
// handled by the same worker could then use that freed memory (use-after-free); both sit in memory management and
// error handling, parts nearly every request touches; the first signs of the out-of-memory problem were found in
// 2024; Calif reported an unconditional remote code execution on 11 August 2026; on 20 October around 15:00 UTC the
// CVE IDs began circulating online, so the release was moved from 22 October to 21 October, 14:00 UTC; the actual
// CVSS score is 9.2. Calif, "PHP2Shell": in the hash-table insert routine the bucket count is incremented before
// the key is allocated, so a fatal error during that allocation leaves a half-initialized bucket that teardown still
// treats as live; attackers force the out-of-memory error with many empty-filename upload parts with deeply nested
// field names; a later multipart request reads the stale state. Wiz, "PHP2Shell": the bugs stem from how PHP handles
// fatal errors, particularly out-of-memory errors; nearly every PHP version is affected by at least one issue.
// The Guardian (22 October 2026): an estimated 70% of websites use PHP; government websites in several countries were
// taken down as a precaution while the fix was added.
// Simplified here: the memory is a short row of cells, the table has a handful of entries and names like "a[b][c]" are
// illustrations; no real exploit is shown.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  Hook: fixes on 21 October 2026; 7 in 10 websites; sites offline to patch.
//  B  9.6–23.4  Workers reuse memory; the memory limit; the bug is in the clean-up after a crash.
//  C 23.4–37.0  Flaw one: count first, then memory; a crash between leaves a half-built entry; the clean-up trusts it.
//  D 37.0–55.4  Flaw two: a pointer to freed memory; the next request moves in; the attack in two requests.
//  E 55.4–65.0  The leak and the release a day early; two steps in the wrong order.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#0d1316', bg1: '#14211f', ink: '#e8f1ee', soft: 'rgba(232,241,238,0.72)', faint: 'rgba(232,241,238,0.26)',
  line: 'rgba(232,241,238,0.14)', cell: '#1d2f2c', cellEdge: 'rgba(120,220,200,0.35)', teal: '#5fd4bd',
  req: '#f4b860', reqSoft: 'rgba(244,184,96,0.25)', evil: '#f062b5', evilSoft: 'rgba(240,98,181,0.28)',
  bad: '#ff5c5c', badSoft: 'rgba(255,92,92,0.25)', panel: 'rgba(20,33,31,0.94)', good: '#7ee08a',
};
const MONO = 'JetBrains Mono', CAP = 'Archivo';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts ----------
const SHARE = 70; // % of websites using PHP (estimate)
const VERSIONS = ['8.5.12', '8.4.27', '8.3.36', '8.2.35'];
const CVES = ['CVE-2026-109618', 'CVE-2026-109619'];

const CUES = [
  [0.4, 4.8, 'On 21 October 2026, PHP’s makers rushed out fixes for two critical flaws: *PHP2Shell*.'],
  [5.0, 9.4, `An estimated *${SHARE / 10} in 10* websites run on PHP, so many went offline until they were patched.`],
  [9.6, 14.0, 'A PHP server runs *workers*: each handles a request, then the next, in the same memory.'],
  [14.2, 18.6, 'Each request gets a *memory limit*. Go over it and PHP stops that request with an error.'],
  [18.8, 23.2, 'The flaws hid in how PHP tidies up after that, in code nearly every request runs through.'],
  [23.4, 27.8, 'Adding an entry to a table took two steps: first *count it*, then get memory for its name.'],
  [28.0, 32.4, 'If memory ran out *between* the steps, a ~half-built entry~ was left, pointing at junk.'],
  [32.6, 37.0, 'The tidy-up trusted the count and handled the junk as real: memory got ~corrupted~.'],
  [37.2, 41.6, 'Flaw two: a crash could leave a pointer aimed at memory that was already *freed*.'],
  [41.8, 46.2, 'The next request on that worker moves in there, and PHP reads its bytes as trusted.'],
  [46.4, 50.8, 'One request crashes at the worst moment; the next one brings ^chosen bytes^.'],
  [51.0, 55.4, 'On some Apache servers it worked before any website code ran: researchers took control.'],
  [55.6, 60.0, 'Reported in August, the fixes were due on 22 October; after a leak, they came a day early.'],
  [60.2, 64.6, 'Two steps in the wrong order and one badly timed crash: enough to put websites at risk.'],
];

// ---------- background: faint rack lights ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const x = 20 + Math.floor(r() * 41) * 20, y = 30 + Math.floor(r() * 38) * 20;
    g.fillStyle = r() < 0.5 ? 'rgba(95,212,189,0.05)' : 'rgba(232,241,238,0.035)';
    g.fillRect(x, y, 10, 4);
  }
}

// ---------- drawing helpers ----------
function panel(x, y, w, h, r = 16, fill = C.panel) { ctx.fillStyle = fill; k.rrect(x, y, w, h, r); ctx.fill(); }
function arrow(x0, y0, x1, y1, color, w = 4, head = 16) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head);
  ctx.closePath(); ctx.fill();
}
/** A curved pointer arrow from (x0, y0) to (x1, y1), bulging up by `bend`. */
function pointer(x0, y0, x1, y1, color, bend = -60, w = 4) {
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) + bend;
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1 - 10); ctx.stroke();
  const a = Math.atan2(y1 - 10 - my, x1 - mx);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1 - 4);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * 16, y1 - 4 - Math.sin(a - 0.45) * 16);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * 16, y1 - 4 - Math.sin(a + 0.45) * 16);
  ctx.closePath(); ctx.fill();
}
/** A row of memory cells; fills[i] = { color, label } or null. */
const CELL = 74, GAP = 8;
function memRow(x, y, n, fills = [], { addr = true, w = CELL } = {}) {
  for (let i = 0; i < n; i++) {
    const cx = x + i * (w + GAP);
    ctx.fillStyle = C.cell; k.rrect(cx, y, w, w, 10); ctx.fill();
    ctx.strokeStyle = C.cellEdge; ctx.lineWidth = 2; k.rrect(cx, y, w, w, 10); ctx.stroke();
    const f = fills[i];
    if (f) {
      A(f.a ?? 1, () => {
        ctx.fillStyle = f.color; k.rrect(cx + 6, y + 6, w - 12, w - 12, 7); ctx.fill();
        if (f.label) { font(700, f.size ?? 18); text(f.label, cx + w / 2, y + w / 2, { color: f.ink ?? C.bg0, align: 'center' }); }
      });
    }
    if (addr) { font(400, 15); text(`0x${(0x40 + i * 8).toString(16)}`, cx + w / 2, y + w + 16, { color: C.faint, align: 'center' }); }
  }
}
const cellX = (x, i, w = CELL) => x + i * (w + GAP) + w / 2;
function card(x, y, w, h, title, color, sub = '') {
  ctx.fillStyle = color; k.rrect(x, y, w, h, 12); ctx.fill();
  font(700, 20); text(title, x + w / 2, y + (sub ? h / 2 - 12 : h / 2), { color: C.bg0, align: 'center' });
  if (sub) { font(400, 15); text(sub, x + w / 2, y + h / 2 + 14, { color: C.bg0, align: 'center' }); }
}
function note(s, y = 770) { font(400, 18, CAP); text(s, W / 2, y, { color: C.faint, align: 'center' }); }

// ---------- A: the hook ----------
function hook(t) {
  const a = span(t, 0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const g = eout(seg(t, 0.5, 1.4));
    panel(W / 2 - 300, 150, 600, 180, 18);
    font(800, 66); text('PHP2Shell', W / 2, 212, { color: C.teal, align: 'center' });
    font(500, 22); CVES.forEach((c, i) => text(c, W / 2 + (i ? 150 : -150), 280, { color: C.soft, align: 'center' }));
    A(seg(t, 1.8, 2.3), () => {
      font(600, 22); text('fixes released 21 Oct 2026 · 14:00 UTC', W / 2, 370, { color: C.req, align: 'center' });
    });
    // 10 websites, 7 on PHP
    const on = seg(t, 5.2, 6.4);
    for (let i = 0; i < 10; i++) {
      const x = 92 + i * 70, y = 450;
      const php = i < SHARE / 10;
      const lit = php && on * 10 > i;
      ctx.fillStyle = lit ? 'rgba(95,212,189,0.85)' : 'rgba(232,241,238,0.12)';
      k.rrect(x, y, 56, 44, 6); ctx.fill();
      ctx.fillStyle = C.bg0; ctx.fillRect(x + 6, y + 8, 44, 4);
      if (lit) { font(700, 14); text('PHP', x + 28, y + 28, { color: C.bg0, align: 'center' }); }
    }
    A(seg(t, 6.4, 6.9), () => { font(500, 22, CAP); text('an estimated 7 in 10 websites', W / 2, 530, { color: C.teal, align: 'center' }); });
    // many sites switched off while they patched
    A(seg(t, 7.2, 7.8), () => {
      panel(W / 2 - 220, 590, 440, 110, 14, 'rgba(255,92,92,0.14)');
      font(700, 26); text('OFFLINE FOR MAINTENANCE', W / 2, 630, { color: C.bad, align: 'center' });
      font(400, 18, CAP); text('government sites in several countries, as a precaution', W / 2, 668, { color: C.soft, align: 'center' });
    });
    void g;
  });
}

// ---------- B: workers, memory, the limit ----------
const MX = 64; // memory row start
function worker(t) {
  const a = span(t, 9.6, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the worker box with its memory
    panel(40, 170, 784, 300, 20);
    font(600, 22); text('worker · its memory', 64, 200, { color: C.soft });
    // requests arrive one after another and use cells, then free them
    const reqs = [[9.9, 11.6, 'GET /', 3], [11.8, 13.6, 'GET /news', 4], [14.4, 16.2, 'POST /form', 5], [16.4, 18.6, 'POST /upload', 9]];
    let fills = [];
    for (const [t0, t1, name, n] of reqs) {
      if (t < t0 || t > t1) continue;
      const u = seg(t, t0 + 0.3, t1 - 0.5);
      const used = Math.min(n, Math.floor(u * (n + 1)));
      const over = name === 'POST /upload' && used > 6;
      fills = Array.from({ length: Math.min(used, 9) }, (_, i) => ({ color: over && i >= 6 ? C.bad : C.req, label: i >= 6 && over ? '!' : '' }));
      card(W / 2 - 110, 390, 220, 56, name, over ? C.bad : C.req);
    }
    memRow(MX, 250, 9, fills);
    // the limit
    A(seg(t, 14.2, 14.7), () => {
      const lx = MX + 6 * (CELL + GAP) - GAP / 2;
      ctx.strokeStyle = C.bad; ctx.lineWidth = 4; ctx.setLineDash([10, 6]);
      ctx.beginPath(); ctx.moveTo(lx, 228); ctx.lineTo(lx, 360); ctx.stroke(); ctx.setLineDash([]);
      font(600, 18); text('memory_limit', lx + 8, 224, { color: C.bad });
    });
    A(span(t, 17.6, 18.8, 0.2, 0.3), () => { font(800, 40); text('Fatal error: out of memory', W / 2, 540, { color: C.bad, align: 'center' }); });
    // the tidy-up
    A(seg(t, 19.0, 19.5), () => {
      font(700, 30); text('then PHP tidies up', W / 2, 560, { color: C.teal, align: 'center' });
      font(400, 20, CAP); text('memory management and error handling: code nearly every request runs', W / 2, 600, { color: C.soft, align: 'center' });
      const sweep = seg(t, 19.6, 21.6);
      ctx.fillStyle = 'rgba(95,212,189,0.25)'; ctx.fillRect(MX - 6, 244, (9 * (CELL + GAP)) * sweep, CELL + 12);
    });
    note('simplified: a real worker has far more memory', 770);
  });
}

// ---------- C: flaw one, count first ----------
const TX = 140, TY = 240;
function table(t, t0, { built, half, junk }) {
  // a small table: a count box and entry slots
  panel(TX - 90, TY - 70, 680, 330, 18);
  font(600, 22); text('a table of form fields', TX - 66, TY - 40, { color: C.soft });
  ctx.fillStyle = C.cell; k.rrect(TX - 66, TY, 130, 100, 12); ctx.fill();
  font(500, 18); text('count', TX - 1, TY + 24, { color: C.soft, align: 'center' });
  font(800, 46); text(String(built + (half ? 1 : 0)), TX - 1, TY + 66, { color: C.teal, align: 'center' });
  const names = ['user', 'file', 'a[b][c]', 'a[b][c][d]'];
  for (let i = 0; i < 4; i++) {
    const x = TX + 100 + i * 112, y = TY;
    ctx.fillStyle = C.cell; k.rrect(x, y, 100, 100, 12); ctx.fill();
    ctx.strokeStyle = C.cellEdge; ctx.lineWidth = 2; k.rrect(x, y, 100, 100, 12); ctx.stroke();
    if (i < built) {
      ctx.fillStyle = C.req; k.rrect(x + 8, y + 8, 84, 84, 8); ctx.fill();
      font(700, names[i].length > 6 ? 14 : 18); text(names[i], x + 50, y + 50, { color: C.bg0, align: 'center' });
    } else if (i === built && half) {
      ctx.strokeStyle = C.bad; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); k.rrect(x + 8, y + 8, 84, 84, 8); ctx.stroke(); ctx.setLineDash([]);
      font(800, 34); text('?', x + 50, y + 48, { color: C.bad, align: 'center' });
      if (junk > 0) A(junk, () => {
        pointer(x + 50, y + 100, x + 50 + 60, y + 230, C.bad, 40);
        ctx.fillStyle = C.badSoft; k.rrect(x + 10, y + 230, 150, 50, 10); ctx.fill();
        font(700, 18); text('junk: ÿ#9@…', x + 85, y + 255, { color: C.bad, align: 'center' });
      });
    }
  }
}
function flawOne(t) {
  const a = span(t, 23.4, 37.0, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // steps shown as a two-line recipe
    const step1 = seg(t, 24.6, 25.2), step2 = seg(t, 25.8, 26.4);
    panel(110, 580, 644, 160, 14);
    A(step1, () => { font(600, 24); text('1. count++', 140, 616, { color: '#b9a6ff' }); font(400, 20, CAP); text('add one to the count', 360, 616, { color: C.soft }); });
    A(step2, () => { font(600, 24); text('2. name = alloc(…)', 140, 704, { color: C.ink }); font(400, 20, CAP); text('get memory for the name', 440, 704, { color: C.soft }); });
    // build entries 0 and 1, then 2 starts: count goes up, memory runs out
    let built = 2, half = false;
    if (t < 25.0) built = 1;
    if (t > 28.6) half = true;
    if (t > 28.6 && t < 32.4) {
      A(span(t, 28.8, 32.4, 0.2, 0.3), () => {
        ctx.strokeStyle = C.bad; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(130, 660); ctx.lineTo(450, 660); ctx.stroke();
        font(800, 24); text('✕ out of memory here', 466, 660, { color: C.bad });
      });
    }
    table(t, 23.4, { built, half, junk: seg(t, 30.0, 30.6) });
    // the tidy-up walks the count and trips on the junk
    if (t > 32.6) {
      const u = seg(t, 33.0, 35.0);
      const slot = Math.min(3, Math.floor(u * 3.2));
      const x = TX + 100 + slot * 112 + 50;
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.moveTo(x, TY - 18); ctx.lineTo(x - 12, TY - 36); ctx.lineTo(x + 12, TY - 36); ctx.closePath(); ctx.fill();
      font(600, 18); text('tidy-up', x, TY - 52, { color: C.teal, align: 'center' });
      A(seg(t, 35.0, 35.4), () => {
        ctx.fillStyle = 'rgba(255,92,92,0.18)'; k.rrect(TX - 90, TY - 70, 680, 330, 18); ctx.fill();
        font(800, 34); text('memory corrupted', W / 2 - 60, TY + 178, { color: C.bad, align: 'center' });
      });
    }
    note('simplified, after the Calif write-up: the real code is PHP’s hash table', 770);
  });
}

// ---------- D: flaw two, use after free, the attack ----------
const RX = 64, RY = 330;
function flawTwo(t) {
  const a = span(t, 37.0, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    panel(40, 170, 784, 400, 20);
    font(600, 22); text('one worker’s memory', 64, 200, { color: C.soft });
    // request A uses cells 2-4, crashes; the cells are freed; but a saved pointer still aims at cell 3
    const freed = t > 39.0;
    const bMoves = seg(t, 42.2, 43.4);
    const fills = [];
    for (let i = 2; i <= 4; i++) {
      if (!freed) fills[i] = { color: C.req, label: 'A' };
      else if (bMoves > 0) fills[i] = { color: C.evil, label: 'B', a: clamp(bMoves * 3 - (i - 2)) };
      else fills[i] = { color: 'rgba(232,241,238,0.08)', label: 'free', ink: C.faint, size: 15 };
    }
    memRow(RX, RY, 9, fills);
    // the saved pointer
    ctx.fillStyle = C.cell; k.rrect(RX, 230, 220, 60, 10); ctx.fill();
    font(600, 18); text('saved pointer', RX + 14, 260, { color: freed ? C.bad : C.teal });
    pointer(RX + 200, 262, cellX(RX, 3), RY, freed ? C.bad : C.teal, -30);
    A(seg(t, 38.0, 38.5), () => {
      card(560, 220, 220, 60, 'request A', C.req, freed ? 'stopped: out of memory' : 'running');
    });
    A(seg(t, 39.4, 39.9), () => { font(700, 24); text('freed, but still pointed at', cellX(RX, 3), RY + 128, { color: C.bad, align: 'center' }); });
    A(seg(t, 41.9, 42.4), () => { card(560, 470, 220, 60, 'request B', C.evil, 'same worker, next'); });
    A(seg(t, 43.6, 44.1), () => {
      font(700, 24); text('PHP reads B’s bytes as its own data', W / 2, 640, { color: C.evil, align: 'center' });
      font(400, 20, CAP); text('a “use-after-free”', W / 2, 676, { color: C.soft, align: 'center' });
    });
    note('simplified', 770);
  });
}
function attack(t) {
  const a = span(t, 46.4, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // request 1: many empty upload parts with nested names
    const g1 = eout(seg(t, 46.6, 47.6));
    ctx.save(); ctx.translate(lerp(-300, 0, g1), 0);
    panel(60, 160, 360, 300, 16, 'rgba(240,98,181,0.12)');
    font(700, 22); text('request 1', 84, 192, { color: C.evil });
    font(500, 18);
    const lines = ['POST /any-page', 'filename=""  a[a][a][a]…', 'filename=""  a[a][a][a]…', 'filename=""  a[a][a][a]…', '… thousands more parts'];
    lines.forEach((l, i) => text(l, 84, 232 + i * 34, { color: C.soft }));
    font(400, 18, CAP); text('built to hit the memory limit', 84, 420, { color: C.evil });
    text('at the wrong moment', 84, 444, { color: C.evil });
    ctx.restore();
    // request 2: chosen bytes land in the freed memory
    A(seg(t, 47.8, 48.3), () => {
      panel(444, 160, 360, 300, 16, 'rgba(240,98,181,0.12)');
      font(700, 22); text('request 2', 468, 192, { color: C.evil });
      font(500, 18); ['POST /any-page', 'bytes chosen to fill', 'the freed memory'].forEach((l, i) => text(l, 468, 232 + i * 34, { color: C.soft }));
      const fills = [null, { color: C.evil, label: '◆' }, { color: C.evil, label: '◆' }, null];
      memRow(468, 350, 4, fills, { addr: false, w: 66 });
    });
    // the result
    A(seg(t, 51.2, 51.8), () => {
      panel(110, 500, 644, 190, 18);
      font(700, 26); text('Apache with PHP’s built-in module', W / 2, 540, { color: C.ink, align: 'center' });
      font(400, 20, CAP); text('triggered before any website code ran', W / 2, 580, { color: C.soft, align: 'center' });
      font(800, 34); text('→ attacker runs their own code', W / 2, 640, { color: C.bad, align: 'center' });
    });
    note('described by Calif and the PHP Foundation; no working exploit shown', 770);
  });
}

// ---------- E: the release and the lesson ----------
function timeline(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const L = 90, R = 774, y = 400;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    const pts = [
      [0.06, '11 Aug', 'first report', C.teal, 55.9],
      [0.55, '20 Oct', 'news leaks', C.bad, 56.7],
      [0.78, '21 Oct', 'fixes out', C.good, 57.5],
      [0.98, '22 Oct', 'planned date', C.faint, 58.3],
    ];
    pts.forEach(([u, d, s, col, at], i) => {
      A(seg(t, at, at + 0.4), () => {
        const x = lerp(L, R, u);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        const up = i % 2 === 0;
        font(700, 24); text(d, x, up ? y - 60 : y + 50, { color: col, align: i === 3 ? 'right' : i === 0 ? 'left' : 'center' });
        font(400, 19, CAP); text(s, x, up ? y - 30 : y + 80, { color: C.soft, align: i === 3 ? 'right' : i === 0 ? 'left' : 'center' });
      });
    });
    A(seg(t, 58.8, 59.3), () => {
      font(600, 22); text('fixed: PHP ' + VERSIONS.join(' · '), W / 2, 560, { color: C.good, align: 'center' });
    });
    font(400, 18, CAP); text('2026', L, y + 140, { color: C.faint });
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    panel(110, 200, 644, 400, 20);
    font(700, 28); text('the order mattered', W / 2, 250, { color: C.soft, align: 'center' });
    const swap = eio(seg(t, 61.2, 62.6));
    const y1 = lerp(340, 440, swap), y2 = lerp(440, 340, swap);
    font(600, 30); text('count++', W / 2, y1, { color: '#b9a6ff', align: 'center' });
    text('name = alloc(…)', W / 2, y2, { color: C.ink, align: 'center' });
    A(seg(t, 62.8, 63.3), () => {
      font(600, 22, CAP); text('memory first: a crash leaves nothing half-built', W / 2, 540, { color: C.good, align: 'center' });
      font(400, 18, CAP); text('illustration of the idea, not PHP’s actual patch', W / 2, 572, { color: C.faint, align: 'center' });
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
    worker(t);
    flawOne(t);
    flawTwo(t);
    attack(t);
    timeline(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 600, family: CAP, ink: C.ink, marks: { '*': C.teal, '~': C.bad, '^': C.evil } });
  },
});
