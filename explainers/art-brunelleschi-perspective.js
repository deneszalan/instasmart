// Explainer for art-brunelleschi-perspective: a peephole and a mirror, then the vanishing-point
// construction of a tiled floor in true perspective.
// Look: a Florentine fresco. Warm mottled intonaco with hairline cracks, terracotta and ochre
// borders, faded azure, pietra serena grey. Cardo (an old-style Renaissance serif, with italics)
// for headings, Alegreya Sans for captions.
//
// Scene plan (59.2 s). Captions centred at y = 830; everything else above y = 770.
//  A  0.0– 9.0  Hook. A fresco panel with a tiled floor drawn by eye: its lines meet nowhere in
//               particular. Then the name card: Brunelleschi, Florence, between 1415 and 1420.
//  B  8.7–23.6  The experiment, as a side-view diagram: the eye behind the panel, the hole, the
//               Baptistery; sight lines go through the hole to the building. A mirror is raised:
//               the sight lines now bounce back to the painted side. An inset shows what the eye
//               sees: the real Baptistery, then the painting; they match.
//  C 23.4–45.0  The rule, on the fresco panel: two floor edges run to one point; the horizon at
//               eye level and the vanishing point; every orthogonal grows to it; the rows across
//               are placed by true projection (y = horizon + f·h/z, computed); tiles fill in a
//               checker of terracotta and stone, with pilasters sized by the same projection.
//  D 44.8–59.2  Payoff: three medallions, c. 1415–1420 Brunelleschi, c. 1427 Masaccio's Holy
//               Trinity, c. 1435 Alberti's De pictura; then the lost panel, known from Manetti.
//
// Facts: Wikipedia, "Perspective (graphical)": medieval artists knew that distance shrinks
// things "but without a basis in a systematic theory"; Brunelleschi's experiments "between 1415
// and 1420"; people looked "through a hole on his painting from the backside" at a building such
// as the Florence Baptistery; a mirror raised "between the building and the painting" reflected
// the painting to the observer to compare; the panel is lost; the account comes from Antonio
// Manetti; soon after, Donatello, Masaccio and others used geometrical perspective; Masaccio's
// Holy Trinity (c. 1427) puts the vanishing point at the viewer's eye level; Alberti's De pictura
// (c. 1435). Wikipedia, "Filippo Brunelleschi": the Baptistery "viewed from the entrance of the
// Cathedral"; "his early biographers Antonio Manetti (and Giorgio Vasari took it from him)".
// The floor is drawn by projecting a grid of square tiles; nothing in it is placed by hand.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  plaster: '#EBDDC4', plasterLight: '#F4EAD6', plasterDark: '#D9C6A6',
  ink: '#3B2618', soft: 'rgba(59,38,24,0.70)', faint: 'rgba(59,38,24,0.30)',
  terra: '#B5532F', terraDeep: '#8E3A1C', ochre: '#C9963B', ochreLight: '#E8C27A',
  azure: '#5B7FA3', azureDeep: '#2F557D', azureLight: '#A9BFD3', stone: '#8E8A80', stoneLight: '#C8C2B4',
  green: '#5E7D5A', cream: '#FBF4E6',
};
const SERIF = 'Cardo', ITAL = 'CardoItalic', TEXT = 'AlegreyaSans';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- timeline ----------
const T = { A: [0, 9.0], B: [8.7, 23.6], C: [23.4, 45.0], D: [44.8, 59.2] };
const CUES = [
  [0.4, 4.8, 'Painters knew far things look smaller, but had no exact system.'],
  [4.9, 8.8, 'In Florence, between 1415 and 1420, the architect *Filippo Brunelleschi* found one.'],
  [8.9, 14.1, 'He painted the *Baptistery* on a small panel and made a hole in it.'],
  [14.2, 18.5, 'You looked through the hole from behind, at the real Baptistery.'],
  [18.6, 23.4, 'Then a ~mirror~ was raised: you saw the painting instead. They matched.'],
  [23.5, 28.2, 'His secret: lines running straight away from you meet at one point.'],
  [28.3, 32.6, 'Draw the horizon at eye level and mark that *vanishing point*.'],
  [32.7, 36.8, 'Every floor line heading into the picture runs to it.'],
  [36.9, 41.0, 'Rows across the floor crowd closer as they recede.'],
  [41.1, 45.0, 'The result: a floor that looks truly ~deep~.'],
  [45.1, 49.4, 'Soon Masaccio, Donatello and others were using it.'],
  [49.5, 53.8, 'The scholar Leon Battista *Alberti* wrote it down in *De pictura*, about 1435.'],
  [53.9, 58.6, 'The panel itself is lost: we know it from his biographer Manetti.'],
];

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- background: intonaco plaster with a painted border ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.plaster; g.fillRect(0, 0, W, H);
  const r = rng(23);
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * H, rr = 60 + r() * 160;
    const cg = g.createRadialGradient(x, y, 0, x, y, rr * 1.6);
    const light = r() < 0.55;
    cg.addColorStop(0, light ? `rgba(250,242,226,${0.10 + r() * 0.14})` : `rgba(196,170,130,${0.035 + r() * 0.045})`);
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = cg; g.fillRect(x - rr * 1.6, y - rr * 1.6, rr * 3.2, rr * 3.2);
  }
  // hairline cracks
  g.strokeStyle = 'rgba(110,80,50,0.16)'; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    let x = r() * W, y = r() * H, dir = r() * TAU;
    g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 14; j++) { dir += (r() - 0.5) * 1.2; x += Math.cos(dir) * 12; y += Math.sin(dir) * 12; g.lineTo(x, y); }
    g.stroke();
  }
  // painted border: terracotta band with an ochre fillet, like a fresco frame
  g.strokeStyle = C.terra; g.lineWidth = 16; g.strokeRect(20, 112, W - 40, 830);
  g.strokeStyle = C.ochre; g.lineWidth = 3; g.strokeRect(36, 128, W - 72, 798);
  // a soft vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(80,50,20,0.20)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.font = `700 22px ${SERIF}`; g.fillStyle = C.terraDeep; g.letterSpacing = '3px'; g.textBaseline = 'alphabetic';
  g.fillText('RECKON', 64, 80);
  const w = g.measureText('RECKON').width;
  g.font = `500 22px ${TEXT}`; g.fillStyle = C.soft; g.letterSpacing = '2px';
  g.fillText('ART · RENAISSANCE', 64 + w + 22, 80);
  g.letterSpacing = '0px';
}
function background() { if (!bg) paintBackground(); ctx.drawImage(bg, 0, 0); }

// ---------- the floor, by projection ----------
// Picture panel, horizon at eye level, vanishing point; eye height EH; focal length F.
const P = { x: 92, y: 232, w: 680, h: 520 };
const HY = 430, VX = W / 2, EH = 1.6, Z0 = 2, F = ((P.y + P.h - HY) * Z0) / EH; // nearest row on the bottom edge
const proj = (x, z) => [VX + (F * x) / z, HY + (F * EH) / z];
const COLS = []; for (let x = -5; x <= 5; x += 0.5) COLS.push(x);
const ROWS = []; for (let z = Z0; z <= 14.01; z += 0.5) ROWS.push(z);
// The same floor drawn "by eye": lines that converge on a vertical axis instead of a point.
function byEyeEnd(x) {
  // several meeting places instead of one, as in much medieval painting
  const j = Math.sin(x * 12.9898) * 0.5;
  if (x < -0.6) return [VX - 70 + j * 30, HY + 54 + j * 20];
  if (x > 0.6) return [VX + 64 + j * 30, HY + 22 + j * 16];
  return [VX + x * 30, HY + 96];
}

function panel(fn, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.save();
    ctx.fillStyle = C.plasterLight; ctx.fillRect(P.x, P.y, P.w, P.h);
    ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    // sky above the horizon, in faded fresco azure
    const sky = ctx.createLinearGradient(0, P.y, 0, HY);
    sky.addColorStop(0, 'rgba(91,127,163,0.55)'); sky.addColorStop(1, 'rgba(169,191,211,0.35)');
    ctx.fillStyle = sky; ctx.fillRect(P.x, P.y, P.w, HY - P.y);
    fn();
    ctx.restore();
    ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 6; ctx.strokeRect(P.x, P.y, P.w, P.h);
  });
}

// ---------- scene A ----------
function sceneA(t) {
  panel(() => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    const grow = eout(seg(t, 0.4, 2.4));
    for (const x of COLS) {
      const [x0, y0] = proj(x, Z0), [x1, y1] = byEyeEnd(x);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, grow), lerp(y0, y1, grow)); ctx.stroke();
    }
    // rows spaced evenly, as if by eye
    for (let i = 0; i < 7; i++) {
      const a = eout(seg(t, 1.6 + i * 0.15, 2.2 + i * 0.15));
      const y = lerp(P.y + P.h, HY + 40, i / 7);
      ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(P.x, y); ctx.lineTo(P.x + P.w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  withAlpha(eout(seg(t, 2.8, 3.4)) * (1 - seg(t, 4.6, 5.0)), () => {
    font(500, 30, ITAL); text('drawn by eye', VX, P.y + 60, { align: 'center', color: C.terraDeep });
  });
  withAlpha(eout(seg(t, 5.0, 5.8)), () => {
    ctx.fillStyle = 'rgba(251,244,230,0.92)'; k.rrect(152, 300, 560, 170, 10); ctx.fill();
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; k.rrect(160, 308, 544, 154, 6); ctx.stroke();
    font(700, 50, SERIF); text('Filippo Brunelleschi', VX, 378, { align: 'center', color: C.terraDeep });
    font(400, 30, ITAL); text('Florence, between 1415 and 1420', VX, 426, { align: 'center', color: C.ink });
  });
}

// ---------- scene B: the experiment, from the side ----------
const GY = 700;                  // ground
const EYE = [138, 470];          // the viewer's eye
const PAN = { x: 220, y0: 390, y1: 550 }; // the panel, edge-on; the hole at its centre
const HOLE = [PAN.x, (PAN.y0 + PAN.y1) / 2];
const MIR = { x: 380, y0: 390, y1: 550 };
const BAP = { x0: 500, x1: 790 };

function baptistery(x0, x1, base, s = 1) {
  const w = x1 - x0, cx = (x0 + x1) / 2;
  const h1 = 130 * s, h2 = 54 * s, h3 = 70 * s;
  // lower storey, upper attic, pyramid roof and lantern; banded in white and green marble
  ctx.fillStyle = '#F1EBDD'; ctx.fillRect(x0, base - h1, w, h1);
  ctx.fillStyle = C.green;
  for (let i = 0; i < 5; i++) ctx.fillRect(x0 + (w / 5) * i, base - h1, 5 * s, h1);
  ctx.fillRect(x0 + w - 5 * s, base - h1, 5 * s, h1);
  ctx.fillRect(x0, base - h1, w, 6 * s); ctx.fillRect(x0, base - 6 * s, w, 6 * s);
  for (let i = 0; i < 5; i++) {
    const ax = x0 + (w / 5) * (i + 0.5);
    ctx.beginPath(); ctx.arc(ax, base - h1 * 0.55, (w / 5) * 0.28, Math.PI, 0); ctx.lineTo(ax + (w / 5) * 0.28, base - 12 * s); ctx.lineTo(ax - (w / 5) * 0.28, base - 12 * s); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#ECE4D2'; ctx.fillRect(x0 + w * 0.04, base - h1 - h2, w * 0.92, h2);
  ctx.fillStyle = C.green; ctx.fillRect(x0 + w * 0.04, base - h1 - h2, w * 0.92, 5 * s);
  for (let i = 0; i < 7; i++) ctx.fillRect(x0 + w * 0.04 + (w * 0.92 / 7) * (i + 0.4), base - h1 - h2 + 14 * s, 8 * s, h2 - 22 * s);
  ctx.fillStyle = C.stoneLight;
  ctx.beginPath(); ctx.moveTo(x0, base - h1 - h2); ctx.lineTo(cx, base - h1 - h2 - h3); ctx.lineTo(x1, base - h1 - h2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F1EBDD'; ctx.fillRect(cx - 12 * s, base - h1 - h2 - h3 - 26 * s, 24 * s, 30 * s);
  ctx.fillStyle = C.stone; ctx.beginPath(); ctx.moveTo(cx - 15 * s, base - h1 - h2 - h3 - 26 * s); ctx.lineTo(cx, base - h1 - h2 - h3 - 44 * s); ctx.lineTo(cx + 15 * s, base - h1 - h2 - h3 - 26 * s); ctx.fill();
}

function eyeIcon(x, y, a = 1) {
  withAlpha(a, () => {
    ctx.fillStyle = C.cream; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.quadraticCurveTo(x, y - 22, x + 26, y); ctx.quadraticCurveTo(x, y + 22, x - 26, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.azureDeep; ctx.beginPath(); ctx.arc(x + 6, y, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + 7, y, 4, 0, TAU); ctx.fill();
  });
}

function sceneB(t) {
  // ground and labels
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(60, GY); ctx.lineTo(W - 60, GY); ctx.stroke();
  baptistery(BAP.x0, BAP.x1, GY, 1.1);
  const lab = (s, x, y, a = 1, al = 'center') => withAlpha(a, () => { font(500, 26); text(s, x, y, { align: al, color: C.soft }); });
  lab('the Baptistery', (BAP.x0 + BAP.x1) / 2, GY + 40);
  // the panel, painted side facing the building, held at eye height
  const pa = eout(seg(t, 9.0, 9.8));
  withAlpha(pa, () => {
    ctx.fillStyle = C.terraDeep; ctx.fillRect(PAN.x - 6, PAN.y0, 12, PAN.y1 - PAN.y0);
    ctx.fillStyle = C.ochre; ctx.fillRect(PAN.x + 6, PAN.y0, 6, PAN.y1 - PAN.y0); // the painted face
    ctx.fillStyle = C.plasterLight; ctx.fillRect(PAN.x - 7, HOLE[1] - 5, 20, 10);    // the hole
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(PAN.x, PAN.y1); ctx.lineTo(PAN.x - 22, PAN.y1 + 100); ctx.stroke();
  });
  lab('painted panel', PAN.x, PAN.y0 - 22, pa);
  withAlpha(eout(seg(t, 10.6, 11.2)), () => { font(700, 26); text('hole', PAN.x + 22, HOLE[1] + 44, { color: C.terraDeep }); });
  eyeIcon(EYE[0], EYE[1], eout(seg(t, 14.0, 14.6)));
  lab('your eye', EYE[0], EYE[1] + 48, eout(seg(t, 14.0, 14.6)));
  // the mirror rises from below between panel and building
  const up = eio(seg(t, 18.6, 19.8));
  const my0 = lerp(GY - 6, MIR.y0, up), my1 = lerp(GY + 154, MIR.y1, up);
  withAlpha(seg(t, 18.5, 18.8), () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, GY); ctx.clip();
    ctx.fillStyle = C.azureLight; ctx.fillRect(MIR.x - 6, my0, 11, my1 - my0);
    ctx.fillStyle = C.ink; ctx.fillRect(MIR.x + 5, my0, 5, my1 - my0);
    ctx.restore();
    lab('mirror', MIR.x + 10, my0 - 18, up);
  });
  // sight lines: through the hole to the building, or bounced by the mirror back to the painting
  const rays = eout(seg(t, 14.6, 15.6));
  if (rays > 0) {
    ctx.setLineDash([9, 7]); ctx.lineWidth = 3;
    for (const sl of [-0.24, 0.24]) {
      const yAt = (x) => HOLE[1] + sl * (x - HOLE[0]);
      withAlpha(rays * (1 - up), () => {
        ctx.strokeStyle = C.terra;
        ctx.beginPath(); ctx.moveTo(EYE[0] + 26, EYE[1]); ctx.lineTo(HOLE[0], HOLE[1]); ctx.lineTo(BAP.x0 + 30, yAt(BAP.x0 + 30)); ctx.stroke();
      });
      withAlpha(rays * up, () => {
        // reflected: out to the mirror, and back at the mirrored angle onto the painted face
        const back = PAN.x + 12, ym = yAt(MIR.x), yb = ym + sl * (MIR.x - back);
        ctx.strokeStyle = C.azureDeep;
        ctx.beginPath(); ctx.moveTo(EYE[0] + 26, EYE[1]); ctx.lineTo(HOLE[0], HOLE[1]); ctx.lineTo(MIR.x - 4, ym); ctx.lineTo(back, yb); ctx.stroke();
      });
    }
    ctx.setLineDash([]);
  }
  // what you see through the hole
  const ins = eout(seg(t, 15.4, 16.2));
  withAlpha(ins, () => {
    const cx = 596, cy = 260, r = 96;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
    ctx.fillStyle = C.azureLight; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.fillStyle = C.stoneLight; ctx.fillRect(cx - r, cy + 48, 2 * r, r);
    ctx.save(); ctx.translate(cx, cy + 48); ctx.scale(0.62, 0.62); baptistery(-110, 110, 0); ctx.restore();
    // the painted version: a warmer, brushier tint
    withAlpha(up, () => { ctx.fillStyle = 'rgba(201,150,59,0.28)'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); });
    ctx.restore();
    ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    font(700, 24);
    withAlpha(1 - up, () => text('THE REAL BUILDING', cx - r - 16, cy - 30, { align: 'right', color: C.terraDeep, spacing: '1px' }));
    withAlpha(up, () => text('THE PAINTING', cx - r - 16, cy - 30, { align: 'right', color: C.azureDeep, spacing: '1px' }));
    font(400, 22, ITAL); text('through the hole', cx - r - 16, cy, { align: 'right', color: C.soft });
  });
}

// ---------- scene C: the construction ----------
function sceneC(t) {
  panel(() => {
    const grid = eout(seg(t, 41.0, 43.4));
    // tiles: a checker of terracotta and stone, filling from near to far
    if (grid > 0) {
      for (let j = 0; j < ROWS.length - 1; j++) {
        const rowA = clamp(grid * ROWS.length * 1.1 - j);
        if (rowA <= 0) continue;
        for (let i = 0; i < COLS.length - 1; i++) {
          const [ax, ay] = proj(COLS[i], ROWS[j]), [bx] = proj(COLS[i + 1], ROWS[j]);
          const [cx2, cy2] = proj(COLS[i + 1], ROWS[j + 1]), [dx] = proj(COLS[i], ROWS[j + 1]);
          ctx.fillStyle = (i + j) % 2 ? 'rgba(181,83,47,0.78)' : 'rgba(200,194,180,0.85)';
          ctx.globalAlpha = rowA;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, ay); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, cy2); ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // the far floor fades into haze at the horizon
      const hz = ctx.createLinearGradient(0, HY, 0, HY + 60);
      hz.addColorStop(0, 'rgba(244,234,214,0.95)'); hz.addColorStop(1, 'rgba(244,234,214,0)');
      ctx.fillStyle = hz; ctx.fillRect(P.x, HY, P.w, 60);
    }
    // the first demonstration: the two edges of a path run together
    const demo = span(t, 23.5, 28.6, 0.4, 0.4);
    withAlpha(demo, () => {
      const g = eio(seg(t, 24.4, 26.6));
      ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 5;
      for (const x of [-1, 1]) {
        const [x0, y0] = proj(x, Z0);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, VX, g), lerp(y0, HY, g)); ctx.stroke();
      }
      if (g > 0.95) { ctx.fillStyle = C.terraDeep; ctx.beginPath(); ctx.arc(VX, HY, 8, 0, TAU); ctx.fill(); }
    });
    // horizon at eye level and the vanishing point
    const hor = eout(seg(t, 28.4, 29.6));
    ctx.strokeStyle = C.azureDeep; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(VX - (P.w / 2) * hor, HY); ctx.lineTo(VX + (P.w / 2) * hor, HY); ctx.stroke();
    const vp = eout(seg(t, 30.0, 30.6));
    withAlpha(vp, () => {
      const pulse = 1 + 0.18 * Math.sin(Math.max(0, t - 30) * 4) * (1 - seg(t, 33, 34));
      ctx.fillStyle = C.terraDeep; ctx.beginPath(); ctx.arc(VX, HY, 9 * pulse, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(VX, HY, 18 * pulse, 0, TAU); ctx.stroke();
    });
    withAlpha(hor * (1 - seg(t, 40.6, 41.2)), () => {
      font(500, 24); text('horizon = eye level', P.x + 18, HY - 14, { color: C.azureDeep });
    });
    withAlpha(vp * (1 - seg(t, 40.6, 41.2)), () => {
      font(700, 24); text('vanishing point', VX, HY - 32, { align: 'center', color: C.terraDeep });
    });
    // orthogonals: every line running into the picture grows to the vanishing point
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4;
    COLS.forEach((x, i) => {
      const order = Math.abs(i - (COLS.length - 1) / 2);
      const g = eio(seg(t, 32.8 + order * 0.16, 34.4 + order * 0.16));
      if (g <= 0) return;
      const [x0, y0] = proj(x, Z0);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, VX, g), lerp(y0, HY, g)); ctx.stroke();
    });
    // transversals: rows at y = horizon + F·EH/z, near rows first
    ROWS.forEach((z, j) => {
      const a = eout(seg(t, 37.0 + j * 0.13, 37.6 + j * 0.13));
      if (a <= 0) return;
      const [, y] = proj(0, z);
      ctx.globalAlpha = a; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(VX - (P.w / 2) * a, y); ctx.lineTo(VX + (P.w / 2) * a, y); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // pilasters of pietra serena, sized by the same projection (3 units tall)
    const pil = eout(seg(t, 42.4, 43.8));
    if (pil > 0) for (const z of [10, 7, 5, 4]) for (const x of [-2.6, 2.6]) {
      const [bx, by] = proj(x, z), [, ty] = proj(x, z), hgt = (F * 3.2) / z * pil, wd = (F * 0.34) / z;
      ctx.fillStyle = C.stone; ctx.fillRect(bx - wd / 2, by - hgt, wd, hgt);
      ctx.fillStyle = C.stoneLight; ctx.fillRect(bx - wd / 2, by - hgt, wd * 0.3, hgt);
      ctx.fillStyle = C.stone; ctx.fillRect(bx - wd * 0.75, by - hgt - wd * 0.3, wd * 1.5, wd * 0.3);
      void ty;
    }
  });
  // spacing readout: how far apart neighbouring rows are, measured on screen
  withAlpha(span(t, 38.2, 41.0, 0.4, 0.3), () => {
    const ys = ROWS.slice(0, 5).map((z) => proj(0, z)[1]);
    font(500, 22);
    for (let j = 0; j < 4; j++) {
      const ymid = (ys[j] + ys[j + 1]) / 2;
      ctx.strokeStyle = C.azureDeep; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(P.x + P.w - 30, ys[j]); ctx.lineTo(P.x + P.w - 30, ys[j + 1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(P.x + P.w - 38, ys[j]); ctx.lineTo(P.x + P.w - 22, ys[j]); ctx.stroke();
      void ymid;
    }
  });
}

// ---------- scene D: what followed ----------
function sceneD(t) {
  // the finished floor, smaller, at the top
  withAlpha(1, () => {
    ctx.save();
    ctx.translate(W / 2, 236); ctx.scale(0.5, 0.5); ctx.translate(-W / 2, -P.y);
    sceneC(45.0);
    ctx.restore();
  });
  const items = [
    ['c. 1415–20', 'Brunelleschi', 'the panels'],
    ['c. 1427', 'Masaccio', 'Holy Trinity'],
    ['c. 1435', 'Alberti', 'De pictura'],
  ];
  items.forEach(([when, who, what], i) => {
    const a = eout(seg(t, 45.4 + i * 1.6, 46.2 + i * 1.6));
    const x = 196 + i * 236, y = 610;
    withAlpha(a, () => {
      ctx.fillStyle = i === 2 ? C.azureDeep : C.terra; ctx.beginPath(); ctx.arc(x, y, 90, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ochreLight; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 80, 0, TAU); ctx.stroke();
      font(700, 24); text(when, x, y - 14, { align: 'center', color: C.cream });
      font(700, 27, SERIF); text(who, x, y + 22, { align: 'center', color: C.cream });
      font(400, 28, ITAL); text(what, x, y + 128, { align: 'center', color: C.ink });
    });
  });
  // the lost panel
  withAlpha(eout(seg(t, 54.0, 54.8)), () => {
    const x = 196, y = 610;
    ctx.fillStyle = 'rgba(244,234,214,0.95)'; ctx.beginPath(); ctx.arc(x, y, 92, 0, TAU); ctx.fill();
    ctx.setLineDash([8, 7]); ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 82, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    font(700, 28); text('LOST', x, y - 4, { align: 'center', color: C.terraDeep, spacing: '3px' });
    font(400, 24, ITAL); text('known from', x, y + 26, { align: 'center', color: C.ink }); text('Manetti', x, y + 52, { align: 'center', color: C.ink });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 730 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.terraDeep, '~': C.azureDeep } });
  }
}

Kit.scene({
  width: W, height: H, duration: 59.2,
  fonts: [
    { family: SERIF, file: 'Cardo-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'Cardo-Bold.woff2', weight: '700' },
    { family: ITAL, file: 'Cardo-Italic.woff2', weight: '400' },
    { family: TEXT, file: 'AlegreyaSans-Medium.woff2', weight: '500' },
    { family: TEXT, file: 'AlegreyaSans-Bold.woff2', weight: '700' },
    { family: TEXT, file: 'AlegreyaSans-ExtraBold.woff2', weight: '800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
