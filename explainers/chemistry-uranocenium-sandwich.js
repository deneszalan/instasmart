// Explainer for chemistry-uranocenium-sandwich: in October 2026 chemists at the University of Manchester and
// Lancaster University reported uranocenium, uranocene with one electron taken away, which earlier attempts
// had failed to make. Sandwich molecules, why the old attempts fell apart, and why the new molecule barely
// shrinks. Look: dark plum, molecules as glowing ball-and-stick sandwiches seen at an angle, iron in copper
// orange, uranium in green (uranocene forms green crystals), shared electrons in blue, fluorine in pale
// yellow. Saira for labels and numbers, Bitter for captions.
//
// Facts: Deakin, Goodwin et al., "Isolation of uranocenium, the bis-[8]annulene uranium cation", Nature
// Communications (2026), doi:10.1038/s41467-026-77066-2, and the University of Manchester's release (via
// phys.org, 23 October 2026): uranocene, U(IV)(C8H8)2, is the actinide equivalent of ferrocene; ferrocene is
// iron(II) between two 6π aromatic five-carbon rings, uranocene uranium(IV) between two 10π aromatic
// eight-carbon rings; ferrocene is readily oxidised to ferrocenium but higher oxidation states of uranocene were
// unknown; earlier electrochemical oxidation was irreversible with poorly defined products (attempts in the
// late 1970s and early 1980s, per the release); with [PF6]– electrolyte the uranocenium cation strips fluoride
// from the salt and decomposes; the new route uses [Ph3C][B(C6F5)4] in ortho-difluorobenzene and gives
// crystals stable at room temperature; uranium goes from +4 to +5; six-coordinate ionic radii U(IV) 0.89 Å,
// U(V) 0.76 Å; mean U–C distances shrink by only 0.018 and 0.023 Å (release: about 0.02 Å, two trillionths of
// a metre); uranium 5f share of the δ-bonding orbitals rises from 28–34% to about 43% (release: from about 30%
// to over 40%); the team will test whether neptunium can do the same. Wikipedia (Ferrocene): first reported
// in 1951; the 1973 Nobel Prize in Chemistry for sandwich compounds. Wikipedia (Uranocene): first made in
// 1968 by Andrew Streitwieser's group; green crystals.
//
// Computed here: electrons per ring, carbons plus the ring's charge (5 + 1 = 6, 8 + 2 = 10); the expected
// shrink 0.89 − 0.76 = 0.13 Å. Molecules are drawn schematically (no hydrogens).
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: Manchester and Lancaster; what a sandwich molecule is.
//  B  9.6–18.6  Ferrocene: iron between five-carbon rings; 6 shared electrons.
//  C 18.8–27.8  Uranocene (1968): eight-carbon rings, 10 electrons, uranium's f orbitals.
//  D 28.0–41.6  Taking an electron: easy for ferrocene, a mess for uranocene; the fluorine salt to blame.
//  E 41.8–46.2  The fix: uranocenium, stable.
//  F 46.4–64.8  +4 to +5 should shrink it, but only 0.02 Å; more sharing, 30% to 40%; next, neptunium.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#0b0a14', bg1: '#1d1336', ink: '#f3f0ff', soft: 'rgba(243,240,255,0.72)', faint: 'rgba(243,240,255,0.28)',
  carbon: '#c9cbd6', bond: 'rgba(201,203,214,0.75)', iron: '#e07b39', uranium: '#9be15d', electron: '#5ab8ff',
  fluorine: '#e9f27a', phos: '#ff9f6b', bad: '#ff5a6e', gold: '#ffcf5a', panel: 'rgba(11,10,20,0.8)',
};
const LAB = 'Saira', CAP = 'Bitter';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- numbers from the paper ----------
const R_U4 = 0.89, R_U5 = 0.76, SHRINK_EXPECTED = R_U4 - R_U5, SHRINK_SEEN = 0.02; // ångström
const SHARE_U4 = 30, SHARE_U5 = 40; // % of the key bonding electrons on uranium (release: about 30%, over 40%)
const electronsPerRing = (carbons, charge) => carbons + charge; // one electron from each carbon, plus the ring's extra charge

const CUES = [
  [0.4, 4.8, 'In October 2026, chemists in Manchester and Lancaster, UK, made a molecule sought for decades.'],
  [5.0, 9.4, 'It is a *sandwich*: one metal atom held between two flat rings of carbon atoms.'],
  [9.6, 14.0, 'The first sandwich, ^ferrocene^, found in 1951, holds iron between two five-carbon rings.'],
  [14.2, 18.6, `Each ring shares *${electronsPerRing(5, 1)} electrons* all the way round it, which makes it unusually stable.`],
  [18.8, 23.2, 'In 1968 chemists made ~uranocene~: a uranium atom between two eight-carbon rings.'],
  [23.4, 27.8, `Those rings share *${electronsPerRing(8, 2)} electrons* each, and uranium’s big f orbitals reach out to them.`],
  [28.0, 32.4, 'Ferrocene easily gives up one electron. Uranocene seemed not to: tries since the 1970s made a mess.'],
  [32.6, 37.0, 'The new team found the culprit: a fluorine-rich salt used in those tests, *hexafluorophosphate*.'],
  [37.2, 41.6, 'Once uranocene lost an electron, it tore *fluorine* off that salt and fell apart.'],
  [41.8, 46.2, 'With a gentler partner and solvent, it worked: ~uranocenium~, stable at room temperature.'],
  [46.4, 50.8, 'Its uranium went from a charge of *+4* to *+5*. That usually shrinks the atom a lot.'],
  [51.0, 55.4, `Yet its bonds got only *${SHRINK_SEEN} ångström* shorter: two trillionths of a metre.`],
  [55.6, 60.0, `The reason: uranium shares more. Its part in the key bonds rose from about *${SHARE_U4}%* to over *${SHARE_U5}%*.`],
  [60.2, 64.6, 'Here sharing, not just attraction, sets a heavy atom’s shape. Next the team will try *neptunium*.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  let s = 31; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.45, H * 0.8);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { // faint hexagons, like a lab notebook
    const x = r() * W, y = r() * 760, rad = 10 + r() * 22;
    g.strokeStyle = `rgba(200,190,255,${0.03 + r() * 0.04})`; g.lineWidth = 1.5; g.beginPath();
    for (let j = 0; j <= 6; j++) { const a = (j / 6) * Math.PI * 2; j ? g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad) : g.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    g.stroke();
  }
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }
function ball(x, y, r, col, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
}

// a flat ring of n carbons seen at an angle: centre, radii, spin
function ringPts(cx, cy, n, rx, ry, spin) {
  return Array.from({ length: n }, (_, i) => { const a = spin + (i / n) * Math.PI * 2; return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, z: Math.sin(a) }; });
}
function ring(cx, cy, n, rx, ry, spin, { electrons = 0, t = 0, a = 1 } = {}) {
  A(a, () => {
    const p = ringPts(cx, cy, n, rx, ry, spin);
    ctx.strokeStyle = C.bond; ctx.lineWidth = 5;
    ctx.beginPath(); p.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke();
    // electrons shared round the ring
    if (electrons > 0) {
      for (let i = 0; i < electrons; i++) {
        const ang = t * 1.6 + (i / electrons) * Math.PI * 2;
        const x = cx + Math.cos(ang) * rx * 0.78, y = cy + Math.sin(ang) * ry * 0.78;
        ctx.fillStyle = 'rgba(90,184,255,0.25)'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.electron; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    [...p].sort((u, v) => u.z - v.z).forEach((q) => ball(q.x, q.y, 13 + 3 * q.z, C.carbon));
  });
}
// a sandwich: two rings of n carbons and a metal between
function sandwich(cx, cy, n, metal, { gap = 120, rx = 120, ry = 34, t = 0, electrons = 0, metalR = 34, a = 1, lobes = 0, tilt = 0, drift = 0 } = {}) {
  A(a, () => {
    const spin = t * 0.35;
    ring(cx - drift, cy + gap + drift * 0.6, n, rx, ry, spin, { electrons, t });
    if (lobes > 0) A(lobes, () => {
      for (const d of [-1, 1]) {
        const g = ctx.createRadialGradient(cx, cy + d * gap * 0.5, 4, cx, cy + d * gap * 0.5, gap * 0.6);
        g.addColorStop(0, 'rgba(155,225,93,0.55)'); g.addColorStop(1, 'rgba(155,225,93,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + d * gap * 0.5, rx * 0.7, gap * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      }
    });
    ball(cx, cy, metalR, metal);
    ctx.save(); ctx.translate(cx + drift, cy - gap - drift * 0.6); ctx.rotate(tilt);
    ring(0, 0, n, rx, ry, -spin, { electrons, t });
    ctx.restore();
  });
}

// ---------- A–C: what a sandwich is; ferrocene; uranocene ----------
function sceneSandwiches(t) {
  const a = 1 - seg(t, 27.6, 28.2);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.3, 9.4, 0.5, 0.5), () => {
      font(700, 24); text('MANCHESTER · LANCASTER · OCTOBER 2026', 52, 96, { color: C.uranium, base: 'middle', spacing: '1px' });
      font(700, 50, CAP); text('A uranium sandwich', 52, 150, { color: C.ink, base: 'middle' });
    });
    // A: the generic sandwich, rings sliding in
    A(span(t, 0.6, 9.6, 0.5, 0.4), () => {
      const g = eout(seg(t, 1.0, 3.2));
      sandwich(W / 2, 460, 8, C.uranium, { gap: lerp(330, 130, g), t });
      A(seg(t, 5.2, 5.8), () => {
        font(600, 26); text('ring of carbon atoms', W / 2 + 150, 330, { color: C.carbon, base: 'middle' });
        text('metal atom', W / 2 + 60, 460, { color: C.uranium, base: 'middle' });
        text('ring of carbon atoms', W / 2 + 150, 590, { color: C.carbon, base: 'middle' });
      });
    });
    // B: ferrocene
    A(span(t, 9.6, 18.8, 0.5, 0.4), () => {
      sandwich(W / 2, 450, 5, C.iron, { gap: 110, rx: 100, ry: 30, t, electrons: t > 14.2 ? electronsPerRing(5, 1) : 0, metalR: 30 });
      font(800, 44, CAP); text('ferrocene', 52, 190, { color: C.iron, base: 'middle' });
      font(500, 24); text('1951 · iron + two rings of 5 carbons', 52, 236, { color: C.soft, base: 'middle' });
      A(seg(t, 14.4, 15.0), () => { chip(500, 640, 320, 64, () => { font(700, 28); text('6 shared electrons', 520, 672, { color: C.electron, base: 'middle' }); }); });
    });
    // C: uranocene
    A(span(t, 18.8, 28.2, 0.5, 0.4), () => {
      sandwich(W / 2, 450, 8, C.uranium, { gap: 128, rx: 130, ry: 36, t, electrons: t > 23.4 ? electronsPerRing(8, 2) : 0, lobes: seg(t, 24.4, 25.6) });
      font(800, 44, CAP); text('uranocene', 52, 190, { color: C.uranium, base: 'middle' });
      font(500, 24); text('1968 · uranium + two rings of 8 carbons', 52, 236, { color: C.soft, base: 'middle' });
      A(seg(t, 23.6, 24.2), () => { chip(500, 650, 330, 64, () => { font(700, 28); text('10 shared electrons', 520, 682, { color: C.electron, base: 'middle' }); }); });
      A(seg(t, 25.2, 25.8), () => { font(600, 24); text('uranium’s f orbitals', 60, 450, { color: C.uranium, base: 'middle' }); });
    });
  });
}

// ---------- D: taking an electron away ----------
function sceneOxidise(t) {
  const a = span(t, 28.0, 41.8, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // 28.0–32.4: ferrocene gives one up easily; uranocene makes a mess
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      sandwich(230, 430, 5, C.iron, { gap: 80, rx: 70, ry: 22, t, metalR: 22 });
      sandwich(634, 430, 8, C.uranium, { gap: 90, rx: 90, ry: 26, t, metalR: 26 });
      const p = seg(t, 28.6, 30.0);
      ctx.fillStyle = C.electron; ctx.beginPath(); ctx.arc(230 + 150 * eout(p), 430 - 200 * eout(p), 7, 0, Math.PI * 2); ctx.fill();
      font(700, 28); text('ferrocene', 230, 600, { color: C.iron, align: 'center', base: 'middle' });
      text('uranocene', 634, 600, { color: C.uranium, align: 'center', base: 'middle' });
      A(seg(t, 29.6, 30.2), () => { font(600, 24); text('gives up 1 electron: fine', 230, 640, { color: C.soft, align: 'center', base: 'middle' }); });
      A(seg(t, 30.6, 31.2), () => {
        font(600, 24); text('1970s–80s: a mess', 634, 640, { color: C.bad, align: 'center', base: 'middle' });
        ctx.strokeStyle = C.bad; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(560, 330); ctx.lineTo(708, 530); ctx.moveTo(708, 330); ctx.lineTo(560, 530); ctx.stroke();
      });
    });
    // 32.6–41.6: the salt, and the fluorine grab
    A(span(t, 32.6, 41.8, 0.4, 0.4), () => {
      const px = 610, py = 440, F = [[0, -1], [0, 1], [-1, 0], [1, 0], [-0.55, -0.45], [0.55, 0.45]];
      const grab = eio(seg(t, 38.0, 39.4)), fall = eio(seg(t, 39.4, 41.0));
      // the salt: phosphorus with six fluorines
      F.forEach(([dx, dy], i) => {
        const away = i === 2 ? grab : 0;
        const x = lerp(px + dx * 80, 330 + 40, away), y = lerp(py + dy * 80, 440, away);
        ctx.strokeStyle = 'rgba(233,242,122,0.5)'; ctx.lineWidth = 4; if (away < 0.5) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); }
        ball(x, y, 20, C.fluorine);
      });
      ball(px, py, 26, C.phos);
      font(700, 26); text('fluorine', px + 110, py - 100, { color: C.fluorine, base: 'middle' });
      font(600, 22); text('the salt: P + 6 F', px, py + 140, { color: C.soft, align: 'center', base: 'middle' });
      // uranocene, now short of an electron, grabs a fluorine and falls apart
      sandwich(250, 440, 8, C.uranium, { gap: 96, rx: 90, ry: 26, t, metalR: 26, tilt: 0.5 * fall, drift: 120 * fall, a: 1 - 0.4 * fall });
      A(span(t, 37.2, 41.8), () => {
        chip(52, 180, 300, 60, () => { font(700, 28); text('+ one electron short', 72, 210, { color: C.gold, base: 'middle' }); });
      });
      A(seg(t, 39.6, 40.2), () => { font(800, 34, CAP); text('falls apart', 250, 660, { color: C.bad, align: 'center', base: 'middle' }); });
    });
  });
}

// ---------- E + F: uranocenium; the size; the sharing ----------
function sceneNew(t) {
  const a = span(t, 41.8, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // E: the stable cation
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      const glow = ctx.createRadialGradient(W / 2, 450, 20, W / 2, 450, 300);
      glow.addColorStop(0, 'rgba(155,225,93,0.25)'); glow.addColorStop(1, 'rgba(155,225,93,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 150, W, 600);
      sandwich(W / 2, 450, 8, C.uranium, { gap: 128, rx: 130, ry: 36, t });
      font(800, 46, CAP); text('uranocenium', 52, 190, { color: C.uranium, base: 'middle' });
      font(500, 24); text('stable at room temperature', 52, 236, { color: C.soft, base: 'middle' });
      chip(640, 410, 80, 80, () => { font(800, 56); text('+', 680, 452, { color: C.gold, align: 'center', base: 'middle' }); });
    });
    // F1: +4 to +5
    A(span(t, 46.4, 55.6, 0.4, 0.4), () => {
      const cy = 440, g = 128;
      sandwich(300, cy, 8, C.uranium, { gap: g, rx: 120, ry: 34, t });
      const ch = t < 48.0 ? '+4' : '+5';
      chip(440, 160, 380, 80, () => {
        font(600, 24); text('uranium’s charge', 460, 200, { color: C.soft, base: 'middle' });
        font(800, 46); text(ch, 740, 200, { color: C.gold, base: 'middle' });
      });
      // the ion sizes: expected shrink
      const x0 = 460, Lmax = 230, sc = Lmax / R_U4;
      A(seg(t, 48.4, 49.0), () => {
        font(600, 22); text('uranium ion size', x0, 300, { color: C.soft, base: 'middle' });
        ctx.fillStyle = 'rgba(155,225,93,0.35)'; ctx.fillRect(x0, 322, R_U4 * sc, 30);
        ctx.fillStyle = C.uranium; ctx.fillRect(x0, 366, R_U5 * sc * 1, 30);
        font(600, 24); text(`+4: ${R_U4} Å`, x0 + R_U4 * sc + 12, 337, { color: C.soft, base: 'middle' }); text(`+5: ${R_U5} Å`, x0 + R_U5 * sc + 12, 381, { color: C.uranium, base: 'middle' });
        font(600, 22); text(`expected: ${SHRINK_EXPECTED.toFixed(2)} Å smaller`, x0, 424, { color: C.soft, base: 'middle' });
      });
      // the bond length bracket: ring to metal, barely changes
      A(seg(t, 51.2, 51.8), () => {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(150, cy - g); ctx.lineTo(150, cy); ctx.moveTo(140, cy - g); ctx.lineTo(160, cy - g); ctx.moveTo(140, cy); ctx.lineTo(160, cy); ctx.stroke();
        chip(440, 470, 380, 110, () => {
          font(600, 22); text('measured: bonds shorter by', 460, 504, { color: C.soft, base: 'middle' });
          font(800, 44); text(`${SHRINK_SEEN} Å`, 460, 552, { color: C.gold, base: 'middle' });
        });
      });
    });
    // F2: the sharing
    A(span(t, 55.6, 64.8, 0.4, 0.01), () => {
      sandwich(250, 440, 8, C.uranium, { gap: 120, rx: 110, ry: 32, t, lobes: 0.4 + 0.6 * eout(seg(t, 56.6, 58.0)) });
      const x0 = 440, L = 360, y0 = 300;
      font(600, 24); text('uranium’s share of the', x0, 210, { color: C.soft, base: 'middle' });
      text('key bonding electrons', x0, 240, { color: C.soft, base: 'middle' });
      for (const [i, lab, v, col, at] of [[0, 'uranocene, +4', SHARE_U4, 'rgba(155,225,93,0.5)', 56.0], [1, 'uranocenium, +5', SHARE_U5, C.uranium, 57.2]]) {
        const y = y0 + i * 110, g = eout(seg(t, at, at + 1.2));
        font(600, 22); text(lab, x0, y, { color: C.ink, base: 'middle' });
        ctx.fillStyle = 'rgba(243,240,255,0.1)'; ctx.fillRect(x0, y + 20, L, 30);
        ctx.fillStyle = col; ctx.fillRect(x0, y + 20, (L * v * g) / 100, 30);
        font(700, 24); text(`${i ? 'over ' : 'about '}${v}%`, x0 + (L * v) / 100 + 12, y + 35, { color: col === C.uranium ? C.uranium : C.soft, base: 'middle' });
      }
      A(seg(t, 60.6, 61.4), () => {
        chip(440, 560, 380, 80, () => { font(700, 30); text('next: neptunium?', 464, 600, { color: C.gold, base: 'middle' }); });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneSandwiches(t);
    sceneOxidise(t);
    sceneNew(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.gold, '~': C.uranium, '^': C.iron } });
  },
});
