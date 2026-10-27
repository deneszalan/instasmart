// Explainer for history-augustus-offices-counted (Roma): Octavian, named Augustus in 27 BC, kept the Republic's
// offices but held them himself, year after year: consul thirteen times, a tribune's powers for life renewed and
// counted each year, chief priest, Father of the Country; his inscriptions give the counts, so they date themselves
// (the obelisk now in Piazza del Popolo: COS XI, TRIB POT XIV, 10/9 BC). He also rebuilt the city in marble from the
// new quarries at Luna. Look: verde-antico green, white Luna marble, grey peperino, gold for his titles, porphyry red.
// Cormorant Garamond for inscriptions and quotations, Archivo for captions and labels.
//
// Facts:
// - Wikipedia, "Augustus": on 16 January 27 BC the Senate gave him the name Augustus; consulships in 43, 33, 31–23,
//   5 and 2 BC (13); on 1 July 23 BC he gave up the consulship and received tribunician power for life, renewed
//   annually; pontifex maximus on 6 March 12 BC; pater patriae on 5 February 2 BC; died 19 August AD 14.
//   Coin evidence (search result): TRIBVN POT XXXIIII on a coin of AD 11/12, consistent with years counted from 23 BC.
// - Res Gestae 34 (Loeb 1924, LacusCurtius): "I transferred the republic from my own control to the will of the
//   senate and the Roman people"; "After that time I took precedence of all in rank, but of power I possessed no more
//   than those who were my colleagues in any magistracy." 35: Father of my Country in my thirteenth consulship,
//   inscribed in the Forum Augustum. 20: in my sixth consulship (28 BC) I rebuilt 82 temples of the gods in the city.
//   21: on my own ground I built the temple of Mars Ultor and the Augustan Forum from the spoils of war.
// - Wikipedia, "Flaminio Obelisk": Augustus's inscription: IMP CAESAR DIVI F AVGVSTVS PONTIFEX MAXIMVS IMP XII COS XI
//   TRIB POT XIV AEGVPTO IN POTESTATEM POPVLI ROMANI REDACTA SOLI DONVM DEDIT; set up in the Circus Maximus about
//   10 BC; from Heliopolis; re-erected in Piazza del Popolo in 1589.
// - Suetonius, Augustus 28.3: he could boast that he found Rome built of brick and left it in marble. Cassius Dio
//   56.30: "I found Rome of clay; I leave it to you of marble" did not refer to its buildings but to the strength of
//   the empire.
// - Wikipedia, "Luni, Italy": Augustus was the first to use Luni (Luna) marble extensively to beautify Rome; Pliny
//   says the quarries were found only recently. Strabo 5.2.5: the Luna quarries, white and bluish marble, supply most
//   of the finer works in Rome; the quarries lie above the sea, and the Tiber takes the cargo up from the sea to Rome.
//   Wikipedia, "Carrara marble": called marmor lunense, Luna marble, in Roman times.
// - Wikipedia, "Forum of Augustus" and "Temple of Mars Ultor": vowed at Philippi in 42 BC, dedicated in 2 BC, eight
//   Corinthian columns across the front. Platner (LacusCurtius), "Forum Augustum": the enclosure wall originally
//   nearly 36 m high, of peperino blocks, its inner surface covered with marble and stucco; three columns of the
//   temple still stand, white marble, 15.30 m high and 1.76 m thick; the cella wall peperino lined with Greek marble.
// Computed here: Roman numerals; the count of consulships and the year of tribunician power at a date (years renewed
// at mid-year from 1 July 23 BC); TRIB POT XIV runs from mid-10 BC to mid-9 BC; columns and wall to one scale.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The name: IMP CAESAR DIVI F, then AVGVSTVS, 27 BC; the Republic "handed back".
//  B  9.6–27.8  The offices on a time line: consul, tribune's power counted, chief priest, Father of the Country.
//  C 28.0–37.0  The obelisk's inscription dates itself: COS XI, TRIB POT XIV, 10/9 BC.
//  D 37.2–50.8  82 temples; brick to marble; Luna marble by sea and up the Tiber.
//  E 51.0–59.8  The Temple of Mars Ultor and the forum wall, to scale; marble lining over grey stone.
//  F 60.2–64.6  Cassius Dio's reading; AD 14.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0c1310', bg2: '#1c2a24', ink: '#f3f0e8', soft: 'rgba(243,240,232,0.72)', faint: 'rgba(243,240,232,0.2)',
  marble: '#f1eee7', marble2: '#d9d4c8', carve: '#57524a', grey: '#7d7a72', grey2: '#5f5c55', brick: '#b4613f', brick2: '#9b5034',
  gold: '#dcb661', red: '#c8553f', sea: '#5b93b5', green: '#8fc19a',
};
const SERIF = 'Cormorant Garamond', SANS = 'Archivo';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
/** Astronomical year (1 BC = 0) of a year given as negative for BC. */
const astro = (y) => (y < 0 ? y + 1 : y);
const CONSULSHIPS = [-43, -33, -31, -30, -29, -28, -27, -26, -25, -24, -23, -5, -2];
const TRIB_START = astro(-23) + 0.5; // 1 July 23 BC
const roman = (n) => { let s = ''; for (const [v, r] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { s += r; n -= v; } return s; };
/** Consulships begun and the year of tribunician power at time tau (astronomical years). */
const cosAt = (tau) => CONSULSHIPS.filter((y) => astro(y) <= tau).length;
const tribAt = (tau) => (tau < TRIB_START ? 0 : Math.floor(tau - TRIB_START) + 1);
// the obelisk: COS XI, TRIB POT XIV, set up from mid-10 to mid-9 BC
const OB0 = TRIB_START + 13, OB1 = TRIB_START + 14;
if (CONSULSHIPS.length !== 13 || roman(14) !== 'XIV' || cosAt(OB0) !== 11 || tribAt(OB0 + 0.1) !== 14 || OB0 !== astro(-10) + 0.5 || OB1 !== astro(-9) + 0.5 || tribAt(astro(11) + 0.6) !== 34) throw new Error('numbers');
const PX_M = 14.4; // px per metre for the temple and wall
const WALL_M = 36, COL_M = 15.3;

// ---------- helpers ----------
function label(s, x, y, { size = 24, weight = 500, color = C.soft, align = 'center', family = SANS, spacing = '0px', style = '' } = {}) {
  font(`${style} ${weight}`.trim(), size, family); text(s, x, y, { align, base: 'middle', color, spacing });
}
function slab(x, y, w, h, a = 1) {
  A(a, () => { ctx.fillStyle = C.marble; k.rrect(x, y, w, h, 6); ctx.fill(); ctx.strokeStyle = C.marble2; ctx.lineWidth = 3; ctx.stroke(); });
}
const carved = (s, x, y, size, color = C.carve, spacing = '3px') => label(s, x, y, { size, weight: 700, color, family: SERIF, spacing });

// ---------- A: the name ----------
function sceneName(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    slab(72, 200, 720, 230);
    carved('IMP · CAESAR · DIVI · F', CX, 270, 54);
    A(seg(t, 2.4, 3.4), () => carved('AVGVSTVS', CX, 360, 76, '#8a6a1f', '10px'));
    A(seg(t, 1.0, 1.6), () => label('27 BC', CX, 140, { size: 40, weight: 800, color: C.gold }));
    A(seg(t, 0.6, 1.2), () => label('“Commander Caesar, son of the deified”', CX, 470, { size: 24, weight: 500, color: C.soft }));
    A(seg(t, 3.0, 3.6), () => label('+ Augustus, “the revered”, from the Senate', CX, 506, { size: 24, weight: 600, color: C.gold }));
    A(seg(t, 5.2, 5.8), () => {
      ctx.fillStyle = 'rgba(12,19,16,0.9)'; k.rrect(80, 560, 704, 130, 12); ctx.fill();
      label('“I transferred the republic from my own control', CX, 596, { size: 26, weight: 500, color: C.ink, family: SERIF, style: 'italic' });
      label('to the will of the senate and the Roman people.”', CX, 634, { size: 26, weight: 500, color: C.ink, family: SERIF, style: 'italic' });
      label('Res Gestae 34, his own record of his deeds', CX, 672, { size: 20, weight: 500 });
    });
  });
}

// ---------- B: the offices on a time line ----------
const TL = { x0: 70, x1: 794, y0: 220 };
const tx = (tau) => TL.x0 + (TL.x1 - TL.x0) * (tau - astro(-44)) / (astro(14) + 0.7 - astro(-44));
function sceneOffices(t) {
  A(span(t, 9.4, 28.0, 0.4, 0.4), () => {
    label('HIS OFFICES, YEAR BY YEAR', CX, 110, { size: 26, weight: 800, color: C.soft, spacing: '2px' });
    // axis
    const ay = 600;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TL.x0, ay); ctx.lineTo(TL.x1, ay); ctx.stroke();
    for (const [y, s] of [[-40, '40 BC'], [-30, '30 BC'], [-20, '20 BC'], [-10, '10 BC'], [1, 'AD 1'], [10, 'AD 10']]) {
      const x = tx(astro(y)); ctx.fillStyle = C.faint; ctx.fillRect(x - 1, ay - 8, 2, 16); label(s, x, ay + 26, { size: 20 });
    }
    const rows = [
      ['consul', 220, C.gold], ['tribune’s power', 320, C.red], ['chief priest', 420, C.sea], ['Father of the Country', 500, C.green],
    ];
    // consul: one bar per year
    A(seg(t, 9.8, 10.4), () => label(rows[0][0], TL.x0, rows[0][1] - 40, { size: 24, weight: 700, color: C.gold, align: 'left' }));
    const shown = seg(t, 10.0, 13.2) * CONSULSHIPS.length;
    CONSULSHIPS.forEach((y, i) => A(clamp(shown - i), () => {
      const x = tx(astro(y)); ctx.fillStyle = C.gold; ctx.fillRect(x + 1, rows[0][1] - 18, tx(astro(y) + 1) - x - 2, 36);
      if (i === 0 || i === 12) label(i ? 'XIII' : 'I', (x + tx(astro(y) + 1)) / 2, rows[0][1] + 36, { size: 22, weight: 700, color: C.gold, family: SERIF });
    }));
    // tribune's power for life, counted
    A(seg(t, 14.2, 14.8), () => label(rows[1][0], TL.x0, rows[1][1] - 40, { size: 24, weight: 700, color: C.red, align: 'left' }));
    const reach = lerp(TRIB_START, astro(14) + 0.63, eio(seg(t, 14.6, 18.2)));
    if (t > 14.6) {
      for (let n = 1; TRIB_START + n - 1 < reach; n++) {
        const a0 = TRIB_START + n - 1, a1 = Math.min(reach, a0 + 1);
        ctx.fillStyle = n % 2 ? C.red : '#a8463a'; ctx.fillRect(tx(a0), rows[1][1] - 18, tx(a1) - tx(a0), 36);
      }
      label(`TRIB · POT · ${roman(tribAt(reach - 0.001))}`, TL.x1, rows[1][1] - 40, { size: 26, weight: 700, color: C.ink, family: SERIF, align: 'right' });
    }
    // chief priest from 6 March 12 BC; Father of the Country from 5 February 2 BC
    A(seg(t, 18.8, 19.4), () => {
      label(rows[2][0], TL.x0, rows[2][1] - 34, { size: 24, weight: 700, color: C.sea, align: 'left' });
      const a0 = astro(-12) + 0.18; ctx.fillStyle = C.sea; ctx.fillRect(tx(a0), rows[2][1] - 14, (tx(astro(14) + 0.63) - tx(a0)) * eio(seg(t, 19.0, 20.4)), 28);
      label('12 BC', tx(a0) - 8, rows[2][1], { size: 20, weight: 600, color: C.sea, align: 'right' });
    });
    A(seg(t, 20.6, 21.2), () => {
      label(rows[3][0], TL.x0, rows[3][1] - 34, { size: 24, weight: 700, color: C.green, align: 'left' });
      const a0 = astro(-2) + 0.09; ctx.fillStyle = C.green; ctx.fillRect(tx(a0), rows[3][1] - 14, (tx(astro(14) + 0.63) - tx(a0)) * eio(seg(t, 20.8, 22.0)), 28);
      label('2 BC', tx(a0) - 8, rows[3][1], { size: 20, weight: 600, color: C.green, align: 'right' });
    });
    // his own claim
    A(seg(t, 23.6, 24.2), () => {
      ctx.fillStyle = 'rgba(12,19,16,0.94)'; k.rrect(60, 640, 744, 130, 12); ctx.fill();
      label('“Of power I possessed no more than those', CX, 676, { size: 26, weight: 500, color: C.ink, family: SERIF, style: 'italic' });
      label('who were my colleagues in any magistracy.”', CX, 712, { size: 26, weight: 500, color: C.ink, family: SERIF, style: 'italic' });
      label('Res Gestae 34', CX, 748, { size: 20, weight: 500 });
    });
  });
}

// ---------- C: the obelisk ----------
const OB_LINES = ['IMP · CAESAR · DIVI · F', 'AVGVSTVS', 'PONTIFEX · MAXIMVS', 'IMP · XII', 'COS · XI · TRIB · POT · XIV', 'AEGVPTO · IN · POTESTATEM', 'POPVLI · ROMANI · REDACTA', 'SOLI · DONVM · DEDIT'];
function sceneObelisk(t) {
  A(span(t, 27.8, 37.2, 0.4, 0.4), () => {
    // the obelisk: a tall tapering shaft on a base
    const cx = 170, base = 700;
    ctx.fillStyle = '#c9a77c';
    ctx.beginPath(); ctx.moveTo(cx - 40, base - 200); ctx.lineTo(cx - 26, 150); ctx.lineTo(cx, 110); ctx.lineTo(cx + 26, 150); ctx.lineTo(cx + 40, base - 200); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(80,50,20,0.35)'; for (let i = 0; i < 12; i++) ctx.fillRect(cx - 8, 180 + i * 26, 16, 10);
    ctx.fillStyle = C.marble2; ctx.fillRect(cx - 70, base - 200, 140, 200);
    ctx.fillStyle = C.carve; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 54, base - 180 + i * 24, 108 - (i % 3) * 14, 6);
    label('from Egypt; now in', cx, base + 28, { size: 20, weight: 500 });
    label('Piazza del Popolo', cx, base + 54, { size: 22, weight: 700, color: C.ink });
    // the inscription on its base, enlarged
    const x0 = 290, y0 = 150, w = 540, h = 430;
    slab(x0, y0, w, h);
    OB_LINES.forEach((s, i) => {
      const y = y0 + 40 + i * 50;
      A(seg(t, 28.4 + i * 0.22, 28.8 + i * 0.22), () => carved(s, x0 + w / 2, y, 30, C.carve, '2px'));
    });
    // highlight the counts
    A(seg(t, 32.8, 33.4), () => {
      const y = y0 + 40 + 4 * 50;
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(x0 + 40, y - 23, w - 80, 46, 8); ctx.stroke();
      label('consul 11 times · tribune’s power, year 14', x0 + w / 2, y0 + h + 30, { size: 24, weight: 700, color: C.red });
    });
    A(seg(t, 34.2, 34.8), () => {
      label('→ mid-10 BC to mid-9 BC', x0 + w / 2, y0 + h + 76, { size: 34, weight: 800, color: C.gold });
    });
  });
}

// ---------- D: the city of marble ----------
function temple(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 14 * s); ctx.lineTo(x, y - 24 * s); ctx.lineTo(x + 14 * s, y - 14 * s); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 4; i++) ctx.fillRect(x - 12 * s + i * 7.4 * s, y - 13 * s, 3 * s, 12 * s);
  ctx.fillRect(x - 14 * s, y - 2 * s, 28 * s, 3 * s);
}
function sceneMarble(t) {
  A(span(t, 37.0, 46.4, 0.4, 0.4), () => {
    label('82 TEMPLES REBUILT IN 28 BC (RES GESTAE 20)', CX, 110, { size: 24, weight: 800, color: C.soft, spacing: '1px' });
    const n = Math.floor(seg(t, 37.4, 40.6) * 82);
    for (let i = 0; i < 82; i++) {
      const x = 96 + (i % 12) * 61, y = 190 + Math.floor(i / 12) * 54;
      temple(x, y, 1.5, i < n ? C.marble : 'rgba(243,240,232,0.12)');
    }
    // brick to marble
    A(seg(t, 41.8, 42.4), () => {
      const y0 = 590, turn = seg(t, 42.6, 45.4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) {
        const x = 60 + c * 62 + (r % 2 ? 31 : 0), y = y0 + r * 30, i = c + r * 12;
        if (x + 58 > 810) continue;
        const m = turn * 48 > i;
        ctx.fillStyle = m ? (i % 2 ? C.marble : C.marble2) : (i % 2 ? C.brick : C.brick2);
        ctx.fillRect(x, y, 58, 26);
      }
      label('brick', 60, y0 - 24, { size: 24, weight: 700, color: C.brick, align: 'left' });
      label('marble', 804, y0 - 24, { size: 24, weight: 700, color: C.marble, align: 'right' });
      label('Suetonius, Life of Augustus 28', CX, y0 + 150, { size: 22, weight: 500 });
    });
  });
  A(span(t, 46.2, 51.2, 0.4, 0.4), () => {
    // Italy's west coast, schematic: Luna in the north, the mouth of the Tiber, Rome inland
    label('MARBLE FROM LUNA, NOW CARRARA', CX, 110, { size: 26, weight: 800, color: C.soft, spacing: '1px' });
    ctx.fillStyle = 'rgba(91,147,181,0.25)'; ctx.fillRect(0, 140, W, 600);
    ctx.fillStyle = '#2f3f35';
    ctx.beginPath(); ctx.moveTo(300, 140); ctx.bezierCurveTo(360, 200, 430, 300, 470, 380); ctx.bezierCurveTo(520, 480, 600, 560, 700, 680); ctx.lineTo(W, 740); ctx.lineTo(W, 140); ctx.closePath(); ctx.fill();
    const luna = [318, 168], ostia = [612, 584], rome = [690, 548];
    ctx.strokeStyle = C.sea; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ostia[0], ostia[1]); ctx.quadraticCurveTo(650, 560, rome[0], rome[1]); ctx.stroke();
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.arc(luna[0] + 30, luna[1] - 6, 10, 0, TAU); ctx.fill();
    label('Luna: quarries above the sea', luna[0] + 50, luna[1] - 6, { size: 22, weight: 700, color: C.ink, align: 'left' });
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(rome[0], rome[1], 10, 0, TAU); ctx.fill();
    label('Rome', rome[0] + 16, rome[1] - 4, { size: 24, weight: 800, color: C.gold, align: 'left' });
    label('Tiber', 650, 600, { size: 20, weight: 600, color: C.sea });
    label('Ostia', ostia[0] - 14, ostia[1] + 22, { size: 20, weight: 600, color: C.ink, align: 'right' });
    // a ship down the coast, then up the river
    const p = eio(seg(t, 46.8, 50.0));
    const path = (u) => u < 0.8 ? [lerp(luna[0] + 10, ostia[0] - 30, u / 0.8) - 60 * Math.sin((u / 0.8) * Math.PI) , lerp(luna[1] + 20, ostia[1] + 10, u / 0.8)] : [lerp(ostia[0], rome[0], (u - 0.8) / 0.2), lerp(ostia[1], rome[1], (u - 0.8) / 0.2)];
    const [sx, sy] = path(p);
    ctx.fillStyle = '#6b4a2b'; ctx.beginPath(); ctx.moveTo(sx - 22, sy); ctx.lineTo(sx + 22, sy); ctx.lineTo(sx + 14, sy + 12); ctx.lineTo(sx - 14, sy + 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.marble; ctx.fillRect(sx - 12, sy - 12, 24, 12);
    label('by sea, then up the Tiber (Strabo)', 230, 640, { size: 24, weight: 600, color: C.ink });
  });
}

// ---------- E: the Temple of Mars Ultor and the wall ----------
function sceneForum(t) {
  A(span(t, 50.8, 60.2, 0.4, 0.4), () => {
    label('FORUM OF AUGUSTUS', CX, 104, { size: 28, weight: 800, color: C.soft, spacing: '2px' });
    const ground = 700, wallH = WALL_M * PX_M, colH = COL_M * PX_M;
    // the wall behind, grey stone, nearly 36 m
    const wx0 = 90, wx1 = 774;
    ctx.fillStyle = C.grey; ctx.fillRect(wx0, ground - wallH, wx1 - wx0, wallH);
    ctx.strokeStyle = C.grey2; ctx.lineWidth = 2;
    for (let y = ground - wallH + 26; y < ground; y += 26) { ctx.beginPath(); ctx.moveTo(wx0, y); ctx.lineTo(wx1, y); ctx.stroke(); }
    // the temple front: podium, eight columns, pediment; three still stand
    const tx0 = 220, tx1 = 644, podium = 52, cy = ground - podium;
    const ruin = seg(t, 52.6, 53.6);
    ctx.fillStyle = C.marble2; ctx.fillRect(tx0 - 10, cy, tx1 - tx0 + 20, podium);
    A(1 - ruin * 0.8, () => {
      ctx.fillStyle = C.marble; ctx.beginPath(); ctx.moveTo(tx0 - 14, cy - colH - 30); ctx.lineTo(CX, cy - colH - 120); ctx.lineTo(tx1 + 14, cy - colH - 30); ctx.closePath(); ctx.fill();
      ctx.fillRect(tx0 - 14, cy - colH - 30, tx1 - tx0 + 28, 30);
    });
    for (let i = 0; i < 8; i++) {
      const x = tx0 + 10 + i * ((tx1 - tx0 - 20) / 7), stand = i >= 5; // the three on the right stand today
      A(stand ? 1 : 1 - ruin * 0.85, () => {
        ctx.fillStyle = C.marble; ctx.fillRect(x - 12, cy - colH, 24, colH);
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 4, cy - colH, 6, colH);
        ctx.fillStyle = C.marble2; ctx.fillRect(x - 17, cy - colH - 8, 34, 10);
      });
    }
    A(ruin, () => {
      const xa = tx0 + 10 + 5 * ((tx1 - tx0 - 20) / 7) - 12, xb = tx1 - 10 + 12;
      ctx.fillStyle = C.marble; ctx.fillRect(xa - 6, cy - colH - 30, xb - xa + 12, 22);
      label('three columns stand today', (xa + xb) / 2, cy - colH - 54, { size: 22, weight: 700, color: C.gold });
    });
    // heights, to one scale
    A(seg(t, 51.4, 52.0), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(190, cy); ctx.lineTo(190, cy - colH); ctx.stroke();
      label(`${COL_M} m`, 180, cy - colH / 2, { size: 22, weight: 800, color: C.gold, align: 'right' });
      ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(800, ground); ctx.lineTo(800, ground - wallH); ctx.stroke();
      label(`${WALL_M} m`, 806, ground - wallH - 16, { size: 22, weight: 800, color: C.ink, align: 'right' });
      label('wall', 806, ground - wallH + 16, { size: 20, weight: 600, align: 'right' });
    });
    // the wall in section: grey stone, marble on its inner face
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = 'rgba(12,19,16,0.92)'; ctx.fillRect(0, ground - wallH - 10, W, wallH + 60);
      const sx = 330, sw = 120, top = ground - wallH;
      ctx.fillStyle = C.grey; ctx.fillRect(sx, top, sw, wallH);
      ctx.strokeStyle = C.grey2; for (let y = top + 26; y < ground; y += 26) { ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + sw, y); ctx.stroke(); }
      ctx.fillStyle = C.marble; ctx.fillRect(sx + sw, top, 14 * eio(seg(t, 56.4, 57.6)), wallH);
      label('peperino stone', sx - 16, top + 120, { size: 24, weight: 700, color: C.ink, align: 'right' });
      label('outside', sx - 16, top + 150, { size: 20, weight: 500, align: 'right' });
      label('marble and stucco', sx + sw + 30, top + 120, { size: 24, weight: 700, color: C.marble, align: 'left' });
      label('on the forum side', sx + sw + 30, top + 150, { size: 20, weight: 500, align: 'left' });
      label('after Platner’s Topographical Dictionary of Ancient Rome', CX, ground + 30, { size: 20, weight: 500 });
    });
  });
}

// ---------- F: Dio's reading ----------
function sceneEnd(t) {
  A(span(t, 60.0, 65.4, 0.4, 0), () => {
    label('Augustus, as the historian Cassius Dio reports it:', CX, 210, { size: 26, weight: 600, color: C.soft });
    label('“I found Rome of clay;', CX, 290, { size: 52, weight: 600, color: C.ink, family: SERIF, style: 'italic' });
    label('I leave it to you of marble.”', CX, 360, { size: 52, weight: 600, color: C.ink, family: SERIF, style: 'italic' });
    A(seg(t, 61.2, 61.8), () => {
      label('Dio: he meant the strength of the empire,', CX, 470, { size: 28, weight: 700, color: C.gold });
      label('not the look of its buildings', CX, 510, { size: 28, weight: 700, color: C.gold });
    });
    A(seg(t, 62.4, 63.0), () => label('Augustus died in AD 14', CX, 620, { size: 30, weight: 800, color: C.ink }));
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.55, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.strokeStyle = 'rgba(143,193,154,0.06)'; g.lineWidth = 3;
  for (let i = 0; i < 10; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.4) * 160; y += (r() - 0.5) * 90; g.lineTo(x, y); } g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'In 27 BC Octavian, Julius Caesar’s heir and winner of the civil wars, took the name *Augustus*.'],
  [5.0, 9.4, 'He claimed to hand the state back to the Senate and people, and kept the Republic’s offices.'],
  [9.6, 14.0, 'But he held them himself: *consul* every year from 31 to 23 BC, thirteen times in all.'],
  [14.2, 18.6, 'From 23 BC he held a tribune’s powers for life, renewed each year and counted: ^TRIB POT^.'],
  [18.8, 23.2, 'In 12 BC he became chief priest, ~pontifex maximus~; in 2 BC, “Father of the Country”.'],
  [23.4, 27.8, 'His own record of his deeds says that in power he was no more than his colleagues.'],
  [28.0, 32.4, 'His inscriptions give these counts, so they date themselves, like this obelisk’s.'],
  [32.6, 37.0, 'It reads consul *XI* times, tribune’s power year ^XIV^: it was set up in 10 or 9 BC.'],
  [37.2, 41.6, 'He rebuilt the city too. In 28 BC alone, he says, he restored *82 temples*.'],
  [41.8, 46.2, 'The writer Suetonius says he found Rome a city of brick and left it a city of marble.'],
  [46.4, 50.8, 'White marble came from new quarries at ~Luna~, now Carrara, by sea and up the Tiber.'],
  [51.0, 55.4, 'His forum’s Temple of Mars the Avenger opened in 2 BC; three of its 15-metre columns stand.'],
  [55.6, 60.0, 'Behind it rose a wall nearly 36 m high: grey stone outside, marble and stucco inside.'],
  [60.2, 64.6, 'The historian Cassius Dio thought he meant the empire’s strength. Augustus died in AD 14.'],
];

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneName(t);
    sceneOffices(t);
    sceneObelisk(t);
    sceneMarble(t);
    sceneForum(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.sea, '^': C.red } });
  },
});
