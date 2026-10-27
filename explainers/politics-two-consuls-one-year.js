// Explainer for politics-two-consuls-one-year (Roma): after the kings, the Roman Republic split the top power in two
// and in time: two consuls, each able to veto the other, taking turns with the fasces month by month, elected for one
// year by the Centuriate Assembly, where 193 voting groups ranked by wealth voted richest first; each year was named
// after its consuls, and the marble Fasti Capitolini list them. Look: pale marble, carved Roman capitals, Roman red
// and lapis blue for the two consuls, a grid of 193 voting groups. Cinzel for inscriptions, Inter for captions.
//
// Facts:
// - Livy 1.60 (thelatinlibrary.com): kings ruled 244 years; then two consuls were elected by the comitia centuriata,
//   L. Iunius Brutus and L. Tarquinius Collatinus. Wikipedia, "Roman Kingdom": Tarquinius Superbus was deposed and
//   expelled in 509 BC (the traditional date). Livy wrote from about 27 BC.
// - Wikipedia, "Roman consul": two consuls elected each year by the comitia centuriata; one-year term; each could veto
//   the other's actions; when both were in Rome they held the fasces in alternate months; each had twelve lictors;
//   years were named after the two consuls; about ten years were normally expected between consulships; from 367 BC
//   one consul could be a plebeian.
// - Wikipedia, "Centuriate Assembly": elected consuls, praetors and censors; 193 centuries: 18 of equites (horsemen),
//   80 of the first class, 20 + 20 + 20 of the second to fourth, 30 of the fifth, 5 others; the equites voted first,
//   then the classes by descending wealth; voting ended once a majority was reached, so the poorer classes were often
//   never called; it met on the Campus Martius, outside the pomerium; a reform after 241 BC cut the first class to 70.
//   Livy 1.43: if the first class disagreed, which rarely happened, the second was called, and they hardly ever went
//   so low as to reach the lowest. Cicero, De re publica 2.39–40: "ne plurimum valeant plurimi"; one century of the
//   poorest held more citizens than almost the whole first class.
// - Wikipedia, "Fasti Capitolini": marble lists of the chief magistrates, engraved under Augustus (on the Regia, about
//   36–30 BC, or on an arch of 18 BC), removed from the Forum in 1546, now in the Sala della Lupa of the Palazzo dei
//   Conservatori (Capitoline Museums); first partly surviving year 483 BC, last AD 13; the years are named by consuls.
// - Wikipedia, "SPQR": Senatus Populusque Romanus, the Senate and People of Rome; first in inscriptions of the Late
//   Republic, from about 80 BC; still in the municipal coat of arms of Rome (and on its manhole covers: Commons photo).
// Computed here: 18 + 80 = 98 > 193 / 2; the other classes hold 193 − 98 = 95.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The king expelled, 509 BC by tradition; two consuls instead.
//  B  9.6–23.2  Veto; twelve lictors and the fasces, month by month; one year, then out.
//  C 23.4–41.6  The Centuriate Assembly: 193 centuries by wealth, richest first; 98 is a majority; voting stops.
//  D 41.8–55.4  Years named after consuls; the Fasti Capitolini; counting the years.
//  E 55.6–64.6  SPQR from about 80 BC; on Rome's manhole covers today.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  marble: '#efe9dd', marble2: '#e3dccd', vein: 'rgba(120,110,95,0.10)', slab: '#e8e1d2', slabEdge: '#cbbfa8',
  ink: '#27231f', soft: 'rgba(39,35,31,0.72)', faint: 'rgba(39,35,31,0.18)', carve: '#5d554b',
  red: '#a8321f', blue: '#2d5a8c', green: '#3f6d3a', grey: '#bdb4a4', gold: '#8a6512', iron: '#4a4744',
};
const CAPS = 'Cinzel', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const CLASSES = [['Horsemen', 18], ['1st class', 80], ['2nd class', 20], ['3rd class', 20], ['4th class', 20], ['5th class', 30], ['Others', 5]];
const TOTAL = CLASSES.reduce((s, c) => s + c[1], 0); // 193
const MAJORITY = Math.floor(TOTAL / 2) + 1; // 97
const RICH = CLASSES[0][1] + CLASSES[1][1]; // 98
if (TOTAL !== 193 || MAJORITY !== 97 || RICH !== 98) throw new Error('numbers');

// ---------- helpers ----------
function label(s, x, y, { size = 24, weight = 600, color = C.soft, align = 'center', family = SANS, spacing = '0px' } = {}) {
  font(weight, size, family); text(s, x, y, { align, base: 'middle', color, spacing });
}
/** A marble slab with carved capitals. */
function slab(x, y, w, h, lines, { size = 40, a = 1, color = C.carve } = {}) {
  A(a, () => {
    ctx.fillStyle = C.slab; k.rrect(x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = C.slabEdge; ctx.lineWidth = 3; ctx.stroke();
    lines.forEach((s, i) => label(s, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * size * 1.35, { size, weight: 700, family: CAPS, color, spacing: '3px' }));
  });
}
/** A man in a toga, schematic, with a coloured stripe. */
function figure(x, y, s, col, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#f7f2e8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-34, 120); ctx.quadraticCurveTo(-36, 30, -20, 10); ctx.quadraticCurveTo(0, 0, 20, 10); ctx.quadraticCurveTo(36, 30, 34, 120); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-20, 14); ctx.quadraticCurveTo(4, 60, 30, 118); ctx.stroke();
    ctx.fillStyle = '#e9cfae'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -12, 17, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}
/** The fasces: a bundle of rods tied with straps. */
function fasces(x, y, s, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#9b6a3c'; for (let i = -3; i <= 3; i++) ctx.fillRect(i * 5 - 2, -60, 4, 120);
    ctx.fillStyle = C.red; for (const yy of [-40, -10, 20, 48]) ctx.fillRect(-19, yy, 38, 5);
    ctx.restore();
  });
}

// ---------- A: king out, consuls in ----------
function sceneKings(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    const crack = seg(t, 2.6, 3.6);
    A(1 - seg(t, 4.2, 4.8), () => {
      slab(232, 150, 400, 150, ['REX'], { size: 84 });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(300 + 90 * crack, 150 + 60 * crack); ctx.lineTo(300 + 150 * crack, 150 + 110 * crack); ctx.lineTo(300 + 240 * crack, 150 + 150 * crack); ctx.stroke();
      figure(CX, 400, 1.6, C.gold, 1 - crack * 0.85);
      label('Tarquin the Proud, last king', CX, 650, { size: 26, weight: 600, color: C.ink, align: 'center' });
    });
    A(seg(t, 4.6, 5.4), () => {
      slab(152, 130, 560, 200, ['CONSVLES', 'L · IVNIVS BRVTVS', 'L · TARQVINIVS COLLATINVS'], { size: 30 });
      figure(300, 400, 1.6, C.blue); figure(564, 400, 1.6, C.red);
      label('two consuls (Livy)', CX, 650, { size: 26, weight: 600, color: C.ink });
    });
    A(seg(t, 1.0, 1.6), () => label('509 BC, by tradition', CX, 100, { size: 28, weight: 700, color: C.red, family: SANS, spacing: '1px' }));
  });
}

// ---------- B: veto, fasces, one year ----------
function sceneVeto(t) {
  A(span(t, 9.4, 14.2, 0.4, 0.4), () => {
    figure(170, 330, 1.5, C.blue); figure(694, 330, 1.5, C.red);
    label('CONSUL A', 170, 540, { size: 24, weight: 700, color: C.blue, family: CAPS, spacing: '2px' });
    label('CONSUL B', 694, 540, { size: 24, weight: 700, color: C.red, family: CAPS, spacing: '2px' });
    // a proposal pushed forward, then stopped
    const push = eio(seg(t, 10.2, 11.6)), stop = seg(t, 11.8, 12.2);
    const x = lerp(260, 400, push);
    ctx.fillStyle = '#f7f2e8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    k.rrect(x, 420, 160, 110, 8); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C.faint; ctx.fillRect(x + 20, 446 + i * 20, 120 - (i % 2) * 30, 7); }
    label('proposal', x + 80, 556, { size: 22, weight: 600 });
    A(stop, () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x + 10, 430); ctx.lineTo(x + 150, 520); ctx.moveTo(x + 150, 430); ctx.lineTo(x + 10, 520); ctx.stroke();
      font(800, 64, CAPS); text('VETO', 590, 210, { align: 'center', base: 'middle', color: C.red });
      label('“I forbid”', 590, 262, { size: 26, weight: 600, color: C.red });
    });
  });
  A(span(t, 14.0, 18.8, 0.4, 0.4), () => {
    // twelve lictors each, and the fasces held in alternate months
    const month = Math.floor(clamp((t - 14.6) / 0.33, 0, 11.99));
    const holder = month % 2; // 0: A, 1: B
    figure(170, 210, 1.15, C.blue); figure(694, 210, 1.15, C.red);
    for (let side = 0; side < 2; side++) for (let i = 0; i < 12; i++) {
      const x = (side ? 600 : 56) + (i % 6) * 36, y = 400 + Math.floor(i / 6) * 70;
      ctx.fillStyle = side ? C.red : C.blue; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(x, y - 20, 9, 0, TAU); ctx.fill(); ctx.fillRect(x - 8, y - 10, 16, 34); ctx.globalAlpha = 1;
      if (side === holder) fasces(x + 12, y + 2, 0.32);
    }
    label('12 lictors', 146, 548, { size: 24, weight: 700, color: C.blue });
    label('12 lictors', 690, 548, { size: 24, weight: 700, color: C.red });
    // a ring of twelve months
    const cx = CX, cy = 330, r = 118;
    for (let m = 0; m < 12; m++) {
      const a = -Math.PI / 2 + (m / 12) * TAU, on = m <= month;
      ctx.fillStyle = on ? (m % 2 ? C.red : C.blue) : C.grey;
      ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 16, 0, TAU); ctx.fill();
    }
    label('MONTHS', cx, cy - 14, { size: 22, weight: 700, color: C.soft, family: CAPS, spacing: '2px' });
    label(holder ? 'B holds the fasces' : 'A holds the fasces', cx, cy + 22, { size: 22, weight: 700, color: holder ? C.red : C.blue });
    fasces(cx, 610, 0.9);
    label('fasces', cx + 50, 610, { size: 24, weight: 700, color: C.ink, align: 'left' });
  });
  A(span(t, 18.6, 23.4, 0.4, 0.4), () => {
    label('ONE YEAR EACH', CX, 110, { size: 30, weight: 700, color: C.ink, family: CAPS, spacing: '3px' });
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'A', 'U'];
    const show = seg(t, 19.0, 21.6) * 11;
    for (let y = 0; y < 11; y++) {
      const a = clamp(show - y); if (a <= 0) continue;
      const x = 48 + y * 70;
      A(a, () => {
        ctx.fillStyle = C.slab; ctx.strokeStyle = C.slabEdge; ctx.lineWidth = 2; k.rrect(x, 230, 62, 150, 6); ctx.fill(); ctx.stroke();
        for (const [j, col] of [[0, C.blue], [1, C.red]]) {
          const n = names[y * 2 + j], again = n === 'A';
          ctx.fillStyle = again ? C.green : col; ctx.beginPath(); ctx.arc(x + 31, 275 + j * 60, 20, 0, TAU); ctx.fill();
          label(n, x + 31, 276 + j * 60, { size: 22, weight: 800, color: '#fff' });
        }
        label(`${y + 1}`, x + 31, 404, { size: 22, weight: 600 });
      });
    }
    A(seg(t, 21.6, 22.2), () => {
      ctx.strokeStyle = C.green; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(79, 430); ctx.quadraticCurveTo(429, 600, 779, 430); ctx.stroke();
      label('A again, ten years later', 429, 560, { size: 28, weight: 700, color: C.green });
    });
  });
}

// ---------- C: the Centuriate Assembly ----------
const GRID = { x: 250, y: 270, cell: 26, per: 20 };
function centuryLayout() {
  const cells = []; let row = 0;
  CLASSES.forEach(([name, n], ci) => {
    const rows = Math.ceil(n / GRID.per);
    for (let i = 0; i < n; i++) cells.push({ ci, x: GRID.x + (i % GRID.per) * GRID.cell, y: GRID.y + (row + Math.floor(i / GRID.per)) * GRID.cell });
    CLASSES[ci].row = row; CLASSES[ci].rows = rows;
    row += rows;
  });
  return cells;
}
const CELLS = centuryLayout();
function sceneAssembly(t) {
  A(span(t, 23.2, 28.0, 0.4, 0.4), () => {
    label('WHERE THE CONSULS WERE ELECTED', CX, 110, { size: 24, weight: 700, color: C.soft, family: CAPS, spacing: '2px' });
    // a sketch map: the city's sacred boundary, the Tiber's bend, the Campus Martius outside
    ctx.strokeStyle = C.blue; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(330, 150); ctx.bezierCurveTo(170, 250, 170, 420, 330, 470); ctx.bezierCurveTo(420, 500, 380, 640, 300, 720); ctx.stroke(); ctx.lineCap = 'butt';
    label('Tiber', 150, 200, { size: 24, weight: 700, color: C.blue });
    ctx.setLineDash([12, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(630, 450, 190, 180, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    label('the city’s sacred boundary', 630, 660, { size: 22, weight: 600, color: C.red });
    label('city', 630, 450, { size: 30, weight: 700, color: C.ink, family: CAPS });
    // the crowd on the Campus Martius
    const g = seg(t, 24.0, 25.2);
    let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * TAU, rr = Math.sqrt(rnd()), x = 268 + Math.cos(a) * rr * 44, y = 320 + Math.sin(a) * rr * 80;
      A(g, () => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); });
    }
    A(g, () => {
      label('Campus Martius:', 200, 540, { size: 24, weight: 800, color: C.ink });
      label('the Centuriate', 200, 572, { size: 22, weight: 600, color: C.ink });
      label('Assembly', 200, 600, { size: 22, weight: 600, color: C.ink });
    });
  });
  A(span(t, 27.8, 41.8, 0.4, 0.4), () => {
    label('193 CENTURIES, RICHEST FIRST', CX, 110, { size: 26, weight: 700, color: C.ink, family: CAPS, spacing: '2px' });
    // class labels
    CLASSES.forEach(([name, n, ], ci) => {
      const c = CLASSES[ci], y = GRID.y + (c.row + c.rows / 2) * GRID.cell - GRID.cell / 2 + 2;
      A(seg(t, 28.2 + ci * 0.2, 28.6 + ci * 0.2), () => label(`${name}  ${n}`, GRID.x - 18, y, { size: 22, weight: ci < 2 ? 800 : 600, color: ci < 2 ? C.gold : C.soft, align: 'right' }));
    });
    // voting in order of wealth: the richest 98 vote for candidate A, then the count stops
    const voted = Math.floor(seg(t, 32.8, 35.8) * RICH);
    const stopped = t > 37.2;
    CELLS.forEach((c, i) => {
      A(seg(t, 28.2 + c.ci * 0.2, 28.6 + c.ci * 0.2), () => {
        let col = '#d8d0c0';
        if (i < voted) col = C.blue;
        if (stopped && i >= RICH) col = '#e6e0d4';
        ctx.fillStyle = col; ctx.fillRect(c.x + 2, c.y + 2, GRID.cell - 4, GRID.cell - 4);
      });
    });
    A(seg(t, 32.8, 33.2), () => {
      font(800, 56, SANS); text(`${voted}`, 720, 200, { align: 'right', base: 'middle', color: C.blue });
      label(`of ${TOTAL}`, 730, 204, { size: 26, weight: 600, color: C.soft, align: 'left' });
      label(`majority: ${MAJORITY}`, 760, 240, { size: 22, weight: 700, color: C.ink, align: 'right' });
    });
    A(seg(t, 37.2, 37.6), () => {
      const y = GRID.y + CLASSES[2].row * GRID.cell + 4 * GRID.cell;
      ctx.save(); ctx.translate(520, y); ctx.rotate(-0.12);
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; k.rrect(-150, -44, 300, 88, 10); ctx.stroke();
      font(800, 48, CAPS); text('STOP', 0, 2, { align: 'center', base: 'middle', color: C.red });
      ctx.restore();
      label(`${TOTAL - RICH} centuries never called`, 520, GRID.y + 11 * GRID.cell + 34, { size: 26, weight: 700, color: C.red });
    });
  });
}

// ---------- D: the years and the Fasti ----------
function sceneFasti(t) {
  A(span(t, 41.6, 46.4, 0.4, 0.4), () => {
    label('THE YEAR’S NAME', CX, 110, { size: 26, weight: 700, color: C.soft, family: CAPS, spacing: '2px' });
    label('in the consulship of', CX, 250, { size: 34, weight: 500, color: C.ink });
    font(700, 52, CAPS); text('BRUTUS', CX, 340, { align: 'center', base: 'middle', color: C.blue });
    label('and', CX, 400, { size: 30, weight: 500 });
    font(700, 52, CAPS); text('COLLATINUS', CX, 462, { align: 'center', base: 'middle', color: C.red });
    A(seg(t, 43.6, 44.2), () => label('Romans counted no BC or AD', CX, 590, { size: 26, weight: 600, color: C.soft }));
  });
  A(span(t, 46.2, 55.6, 0.4, 0.4), () => {
    label('FASTI CAPITOLINI', CX, 104, { size: 32, weight: 800, color: C.ink, family: CAPS, spacing: '3px' });
    label('Capitoline Museums, beside the bronze she-wolf', CX, 146, { size: 22, weight: 600 });
    // a marble slab of carved lines, two names a year (shown as bars, not real readings)
    const x0 = 170, y0 = 190, w = 524, h = 480;
    ctx.fillStyle = C.slab; k.rrect(x0, y0, w, h, 8); ctx.fill(); ctx.strokeStyle = C.slabEdge; ctx.lineWidth = 3; ctx.stroke();
    const count = seg(t, 51.2, 54.8) * 11, rowH = 38;
    for (let r = 0; r < 12; r++) {
      const y = y0 + 34 + r * rowH, lit = t > 51.2 && r < count;
      ctx.fillStyle = lit ? C.gold : C.carve; ctx.globalAlpha = lit ? 0.95 : 0.7;
      ctx.fillRect(x0 + 90, y, 150 + ((r * 37) % 60), 12); ctx.fillRect(x0 + 270 + ((r * 13) % 20), y, 140 + ((r * 29) % 50), 12);
      ctx.globalAlpha = 1;
      if (lit) label(`${r + 1}`, x0 + 46, y + 6, { size: 22, weight: 800, color: C.gold });
    }
    // a crack, as the stone survives in fragments
    ctx.strokeStyle = 'rgba(39,35,31,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 330, y0); ctx.lineTo(x0 + 300, y0 + 160); ctx.lineTo(x0 + 360, y0 + 300); ctx.lineTo(x0 + 320, y0 + h); ctx.stroke();
    A(seg(t, 48.0, 48.6), () => label('two consuls a year, year after year', CX, 700, { size: 26, weight: 700, color: C.ink }));
    A(seg(t, 51.2, 51.8), () => {
      ctx.fillStyle = C.marble; ctx.fillRect(60, 682, W - 120, 40);
      label('oldest surviving year: 483 BC  ·  last: AD 13', CX, 702, { size: 26, weight: 700, color: C.gold });
    });
  });
}

// ---------- E: SPQR ----------
function sceneSPQR(t) {
  A(span(t, 55.4, 60.2, 0.4, 0.4), () => {
    slab(92, 200, 680, 200, ['SENATVS', 'POPVLVSQVE ROMANVS'], { size: 44 });
    label('the Senate and the People of Rome', CX, 450, { size: 30, weight: 600, color: C.ink });
    A(seg(t, 56.6, 57.2), () => { font(800, 100, CAPS); text('S·P·Q·R', CX, 570, { align: 'center', base: 'middle', color: C.red, spacing: '6px' }); });
    A(seg(t, 57.6, 58.2), () => label('on inscriptions from about 80 BC', CX, 660, { size: 26, weight: 600 }));
  });
  A(span(t, 60.0, 65.4, 0.4, 0), () => {
    // a manhole cover, schematic
    const cx = CX, cy = 380, r = 230;
    ctx.fillStyle = C.iron; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6d6a66'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, TAU); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 24, 0, TAU); ctx.clip();
    ctx.strokeStyle = '#5c5955'; ctx.lineWidth = 6;
    for (let d = -r; d <= r; d += 34) { ctx.beginPath(); ctx.moveTo(cx + d, cy - r); ctx.lineTo(cx + d, cy + r); ctx.moveTo(cx - r, cy + d); ctx.lineTo(cx + r, cy + d); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = C.iron; ctx.fillRect(cx - 170, cy - 56, 340, 112);
    font(800, 84, CAPS); text('S·P·Q·R', cx, cy + 4, { align: 'center', base: 'middle', color: '#cfcac2', spacing: '4px' });
    label('Rome today: on its coat of arms and its manhole covers', CX, 660, { size: 24, weight: 600, color: C.ink });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.marble); lg.addColorStop(1, C.marble2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.strokeStyle = C.vein; g.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 8; j++) { x += (r() - 0.3) * 120; y += (r() - 0.5) * 80; g.lineTo(x, y); }
    g.stroke();
  }
}

const CUES = [
  [0.4, 4.8, 'By Roman tradition, Rome drove out its last king, Tarquin the Proud, in *509 BC*.'],
  [5.0, 9.4, 'The historian Livy, writing nearly 500 years later, says ~two consuls~ were elected instead.'],
  [9.6, 14.0, 'Power was split *in two*: each consul could veto, that is forbid, what the other did.'],
  [14.2, 18.6, 'Each had 12 lictors carrying rods, the ~fasces~. In Rome, the two took turns monthly.'],
  [18.8, 23.2, 'Power was split *in time* too: one year, then out, and usually ten years before another.'],
  [23.4, 27.8, 'Consuls were elected by the ~Centuriate Assembly~, on the Campus Martius outside the city.'],
  [28.0, 32.4, 'Citizens voted in *193 groups*, called centuries, ranked by wealth. Each group had one vote.'],
  [32.6, 37.0, 'The richest voted first: 18 centuries of horsemen and 80 of the first class, *98* in all.'],
  [37.2, 41.6, 'That is already a majority of 193. Livy says the voting hardly ever reached the poorest.'],
  [41.8, 46.2, 'Romans named each year after its two consuls: “in the consulship of Brutus and Collatinus”.'],
  [46.4, 50.8, 'The names were carved in marble lists, the ~Fasti Capitolini~, now in the Capitoline Museums.'],
  [51.0, 55.4, 'Counting the pairs counts the years. The list’s oldest surviving year is *483 BC*.'],
  [55.6, 60.0, 'The Republic’s motto, *SPQR*, the Senate and People of Rome, is on inscriptions from about 80 BC.'],
  [60.2, 64.6, 'The city of Rome still puts ~SPQR~ on its coat of arms, and on its manhole covers.'],
];

Kit.scene({
  width: W, height: H, duration: 65, fonts: [CAPS, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneKings(t);
    sceneVeto(t);
    sceneAssembly(t);
    sceneFasti(t);
    sceneSPQR(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.blue, '^': C.green } });
  },
});
