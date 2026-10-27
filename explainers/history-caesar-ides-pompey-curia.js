// Explainer for history-caesar-ides-pompey-curia (Roma): Julius Caesar was killed on 15 March 44 BC at a Senate
// meeting in the Curia of Pompey, the hall at the far end of Pompey's theatre and gardens, whose base survives in
// Largo di Torre Argentina; what happened inside comes from accounts written decades to centuries later, which
// disagree; "Et tu, Brute?" is famous from Shakespeare. Look: night blue, a plan of the complex in pale stone lines,
// parchment cards for the sources on a time line, gold for Caesar, crimson used sparingly. No violence is shown.
// Libre Caslon Text for titles and quotations, Fira Sans (which has Greek) for captions and labels.
//
// Facts:
// - Wikipedia, "Assassination of Julius Caesar": 15 March 44 BC, the Ides of March, at a Senate session in the Curia
//   of Pompey, in the Theatre of Pompey complex; ringleaders Marcus Junius Brutus, Gaius Cassius Longinus and Decimus
//   Junius Brutus Albinus; about 23 wounds; he fell near a statue of Pompey; Suetonius and Dio say he said nothing,
//   others reported "καὶ σύ, τέκνον"; the Second Triumvirate (Antony, Octavian, Lepidus) of 43 BC, Philippi, Actium
//   in 31 BC, and in 27 BC Octavian became Augustus.
// - Suetonius, Julius 80.4, 82, 88 (LacusCurtius): more than sixty conspirators, led by Gaius Cassius and Marcus and
//   Decimus Brutus; 23 wounds; not a word, only a groan at the first blow, though some have written that he said in
//   Greek to Marcus Brutus "You too, my child?"; the physician Antistius judged that only the second wound, in the
//   breast, was mortal; the Senate voted to wall up the hall and call the Ides of March the Day of Parricide.
//   Wikipedia, "The Twelve Caesars": written in AD 121.
// - Plutarch, Caesar 66 (LacusCurtius): the hall had been dedicated by Pompey as an ornament to his theatre and held his
//   statue; Casca struck first; seeing Brutus, Caesar pulled his toga over his head; he fell against the pedestal of
//   Pompey's statue; twenty-three wounds. Wikipedia, "Parallel Lives": probably written early in the 2nd century AD.
// - Nicolaus of Damascus, Life of Augustus 19, 24 (Hall's translation, csun.edu): more than eighty shared in the plot;
//   he fell before the statue of Pompey after thirty-five wounds. Wikipedia, "Nicolaus of Damascus": born about 64 BC;
//   the Life seems to have been completed before Augustus died in AD 14.
// - Cassius Dio 47.19 (LacusCurtius): the room was closed and later turned into a privy.
// - Wikipedia, "Et tu, Brute?": Caesar says it in Shakespeare's Julius Caesar (1599), Act 3 Scene 1.
// - Wikipedia, "Theatre of Pompey": completed 55 BC, the first permanent theatre in Rome; a temple of Venus Victrix near
//   the top of the seating; the cavea about 150–160 m across; porticoes enclosing a garden; the Curia of Pompey on the
//   opposite end of the garden. Platner (LacusCurtius), "Porticus Pompei": a court about 180 × 135 m adjoining the
//   stage. Wikipedia, "Curia of Pompey": the Curia Hostilia burned in 52 BC, so the Senate used Pompey's complex.
// - Turismo Roma, "Area Sacra di largo di Torre Argentina": a large tufa base that was part of the Curia of Pompey,
//   behind temples B and C, where Caesar was stabbed on the Ides of March, 44 BC; four Republican temples, B the only
//   round one.
// - Wikipedia, "Dictator perpetuo": Caesar took the title between 26 January and 15 February 44 BC; it lifted the
//   time limits of the dictatorship. Wikipedia, "Roman consul": a dictator held office for no more than six months.
// The plan is a schematic at about 1.95 px per metre, not a survey. Computed: years between 44 BC and a later year.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The plan: theatre, portico garden, the curia at its end; the temples of Largo Argentina; the Pantheon.
//  B 14.2–27.8  Dictator for life; six months before; more than 60 plotters, their leaders.
//  C 28.0–55.4  The accounts on a time line: Nicolaus, Plutarch, Suetonius; the wounds; the words; Shakespeare.
//  D 55.6–64.6  The hall walled up; civil wars to 27 BC.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0d1119', bg2: '#1c2636', ink: '#f2ede3', soft: 'rgba(242,237,227,0.72)', faint: 'rgba(242,237,227,0.22)',
  stone: '#cdbf9f', stone2: '#8f846b', garden: '#4f6b4a', paper: '#efe4cc', paperInk: '#2a2420',
  gold: '#e7b95c', red: '#d9584a', teal: '#7cc8c2', lilac: '#b9a6e0',
};
const SERIF = 'Libre Caslon Text', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const IDES = -44; // 44 BC
/** Years from 44 BC to a later year (there is no year 0). */
const after = (y) => (y > 0 ? y - IDES - 1 : y - IDES);
const SOURCES = [
  { who: 'Nicolaus of Damascus', when: 'before AD 14', year: 14, wounds: 35, plot: 'more than 80', col: C.teal },
  { who: 'Plutarch', when: 'about AD 100', year: 100, wounds: 23, plot: '', col: C.lilac },
  { who: 'Suetonius', when: 'AD 121', year: 121, wounds: 23, plot: 'more than 60', col: C.gold },
];
const SHAKESPEARE = 1599;
if (after(121) !== 164 || after(SHAKESPEARE) !== 1642 || after(14) !== 57) throw new Error('numbers');

// ---------- helpers ----------
function label(s, x, y, { size = 24, weight = 500, color = C.soft, align = 'center', family = SANS, spacing = '0px', style = '' } = {}) {
  font(`${style} ${weight}`.trim(), size, family); text(s, x, y, { align, base: 'middle', color, spacing });
}
const PX = 1.95; // px per metre in the plan
/** The plan of Pompey's complex: theatre to the west, the portico garden, the curia at its east end, then the temples. */
function plan(a, { hi = 0, t = 0 } = {}) {
  A(a, () => {
    const cy = 400, sx = 196, R = 77.5 * PX;
    // theatre: the curved seating faces west, the stage on its straight side
    ctx.fillStyle = 'rgba(205,191,159,0.18)'; ctx.strokeStyle = C.stone; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sx, cy, R, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let r = 0.45; r < 1; r += 0.11) { ctx.strokeStyle = 'rgba(205,191,159,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx, cy, R * r, Math.PI / 2, Math.PI * 1.5); ctx.stroke(); }
    ctx.fillStyle = C.stone; ctx.fillRect(sx - R - 14, cy - 18, 26, 36); // temple of Venus Victrix at the top of the seats
    ctx.fillRect(sx - 4, cy - 120, 12, 240); // the stage building
    // the portico round a garden
    const px0 = sx + 8, pw = 180 * PX, ph = 135 * PX, py0 = cy - ph / 2;
    ctx.fillStyle = 'rgba(79,107,74,0.55)'; ctx.fillRect(px0, py0, pw, ph);
    ctx.strokeStyle = C.stone; ctx.lineWidth = 3; ctx.strokeRect(px0, py0, pw, ph);
    ctx.fillStyle = C.stone;
    for (let i = 0; i <= 24; i++) { ctx.fillRect(px0 + (i / 24) * pw - 2, py0 - 2, 4, 4); ctx.fillRect(px0 + (i / 24) * pw - 2, py0 + ph - 2, 4, 4); }
    ctx.fillStyle = 'rgba(160,200,140,0.55)';
    for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(px0 + 40 + i * 34, py0 + 50 + r * 56, 6, 0, TAU); ctx.fill(); }
    // the curia: an exedra at the east end
    const cx0 = px0 + pw;
    const glow = hi * (0.6 + 0.4 * Math.sin(t * 4));
    ctx.fillStyle = hi ? `rgba(231,185,92,${0.35 + 0.4 * glow})` : 'rgba(205,191,159,0.35)';
    ctx.strokeStyle = hi ? C.gold : C.stone; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx0, cy - 40); ctx.lineTo(cx0 + 22, cy - 40); ctx.arc(cx0 + 22, cy, 40, -Math.PI / 2, Math.PI / 2); ctx.lineTo(cx0, cy + 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    // the temples of today's Largo Argentina, east of the curia (schematic)
    ctx.strokeStyle = C.stone2; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(143,132,107,0.3)';
    const tx = cx0 + 92;
    ctx.fillRect(tx, cy - 150, 46, 62); ctx.strokeRect(tx, cy - 150, 46, 62);
    ctx.beginPath(); ctx.arc(tx + 23, cy - 30, 26, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillRect(tx, cy + 18, 46, 62); ctx.strokeRect(tx, cy + 18, 46, 62);
    ctx.fillRect(tx - 4, cy + 100, 56, 76); ctx.strokeRect(tx - 4, cy + 100, 56, 76);
    return { sx, cy, R, px0, pw, ph, py0, cx0, tx };
  });
  return { sx: 196, cy: 400, R: 77.5 * PX, px0: 204, pw: 180 * PX, ph: 135 * PX, py0: 400 - 67.5 * PX, cx0: 204 + 180 * PX, tx: 204 + 180 * PX + 92 };
}

// ---------- A: the plan ----------
function scenePlan(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    const hi = seg(t, 5.0, 5.8);
    const g = plan(1, { hi, t });
    A(seg(t, 0.6, 1.4), () => {
      label('15 MARCH 44 BC', CX, 100, { size: 34, weight: 700, color: C.gold, family: SERIF, spacing: '3px' });
      label('Theatre of Pompey', g.sx - 70, g.cy + g.R + 30, { size: 22, weight: 600, color: C.stone });
      label('portico and gardens', g.px0 + g.pw / 2, g.py0 + g.ph + 30, { size: 22, weight: 600, color: C.stone });
      label('about 180 m', g.px0 + g.pw / 2, g.py0 - 24, { size: 20, weight: 500, color: C.soft });
    });
    A(hi, () => {
      label('Curia of Pompey', g.cx0 - 50, g.cy - 210, { size: 26, weight: 700, color: C.gold });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(g.cx0 - 30, g.cy - 192); ctx.lineTo(g.cx0 + 26, g.cy - 46); ctx.stroke();
    });
    A(seg(t, 7.0, 7.6) * (1 - seg(t, 9.4, 9.8)), () => label('the Senate’s own house had burned in 52 BC', CX, 690, { size: 26, weight: 600, color: C.ink }));
    A(seg(t, 9.8, 10.6), () => {
      ctx.setLineDash([8, 8]); ctx.strokeStyle = C.teal; ctx.lineWidth = 3;
      k.rrect(g.cx0 - 14, g.cy - 170, 190, 360, 14); ctx.stroke(); ctx.setLineDash([]);
      label('today: Largo di Torre Argentina', CX + 60, 660, { size: 26, weight: 700, color: C.teal });
      label('the curia’s stone base, behind the temples', CX + 60, 696, { size: 22, weight: 500, color: C.soft });
      // the Pantheon, a few minutes' walk north
      ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(g.tx + 40, 168, 22, 0, TAU); ctx.fill(); ctx.fillRect(g.tx + 6, 182, 68, 22);
      label('Pantheon', g.tx + 40, 132, { size: 22, weight: 600, color: C.ink });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(g.tx + 40, 210); ctx.lineTo(g.tx + 30, g.cy - 175); ctx.stroke(); ctx.setLineDash([]);
    });
    // scale bar
    A(seg(t, 1.0, 1.6), () => {
      ctx.fillStyle = C.soft; ctx.fillRect(60, 640, 100 * PX, 4);
      label('100 m', 60 + 50 * PX, 620, { size: 20, weight: 500 });
    });
  });
}

// ---------- B: dictator for life; the plot ----------
function sceneDictator(t) {
  A(span(t, 14.0, 23.4, 0.4, 0.4), () => {
    // a coin of 44 BC with Caesar's new title
    const cx = CX, cy = 300, r = 150;
    ctx.fillStyle = '#c9c2b4'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8f887b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r - 10, 0, TAU); ctx.stroke();
    // a laureate head in profile, schematic
    ctx.fillStyle = '#9d968a';
    ctx.beginPath(); ctx.moveTo(cx - 40, cy + 70); ctx.quadraticCurveTo(cx - 60, cy - 20, cx - 10, cy - 70); ctx.quadraticCurveTo(cx + 40, cy - 80, cx + 46, cy - 30); ctx.lineTo(cx + 60, cy - 6); ctx.lineTo(cx + 44, cy + 4); ctx.quadraticCurveTo(cx + 50, cy + 40, cx + 20, cy + 60); ctx.lineTo(cx + 10, cy + 90); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6f685d'; ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.32; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 52, cy - 20 + Math.sin(a) * 52, 12, 5, a + 1.2, 0, TAU); ctx.stroke(); }
    ctx.save(); ctx.translate(cx, cy);
    font(700, 26, SERIF); ctx.fillStyle = '#3d3830'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const word = 'CAESAR · DICT · PERPETVO ·';
    for (let i = 0; i < word.length; i++) { ctx.save(); ctx.rotate(-Math.PI * 0.95 + (i / word.length) * Math.PI * 1.9); ctx.translate(0, -r + 30); ctx.fillText(word[i], 0, 0); ctx.restore(); }
    ctx.restore();
    label('a coin of 44 BC', cx, cy + r + 30, { size: 22, weight: 500 });
    // six months against for life
    A(seg(t, 19.0, 19.6), () => {
      const L = 120, R = 744, y0 = 560;
      label('a dictator’s term', L, y0 - 34, { size: 24, weight: 600, color: C.ink, align: 'left' });
      ctx.fillStyle = C.teal; ctx.fillRect(L, y0, (R - L) * 0.12, 34);
      label('at most 6 months', L + (R - L) * 0.12 + 14, y0 + 17, { size: 22, weight: 600, color: C.teal, align: 'left' });
      const grow = eio(seg(t, 20.2, 22.0));
      ctx.fillStyle = C.gold; ctx.fillRect(L, y0 + 60, (R - L) * grow, 34);
      A(seg(t, 21.6, 22.0), () => label('Caesar, early 44 BC: for life', R - 10, y0 + 77, { size: 22, weight: 700, color: C.bg1, align: 'right' }));
    });
  });
  A(span(t, 23.2, 28.0, 0.4, 0.4), () => {
    label('MORE THAN 60 PLOTTERS (SUETONIUS)', CX, 110, { size: 24, weight: 700, color: C.soft, spacing: '2px' });
    let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const g = seg(t, 23.4, 25.4);
    for (let i = 0; i < 61; i++) {
      const x0 = 80 + r() * 700, y0 = 160 + r() * 420, a = r() * TAU, rr = 40 + r() * 170;
      const x = lerp(x0, CX + Math.cos(a) * rr, eio(g)), y = lerp(y0, 380 + Math.sin(a) * rr * 0.75, eio(g));
      ctx.fillStyle = C.ink; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(x, y - 10, 7, 0, TAU); ctx.fill(); ctx.fillRect(x - 6, y - 2, 12, 18); ctx.globalAlpha = 1;
    }
    A(seg(t, 25.6, 26.2), () => {
      ctx.fillStyle = 'rgba(13,17,25,0.85)'; k.rrect(130, 620, 604, 120, 14); ctx.fill();
      label('led by Gaius Cassius,', CX, 652, { size: 26, weight: 600, color: C.ink });
      label('Marcus Brutus and Decimus Brutus', CX, 700, { size: 26, weight: 600, color: C.ink });
    });
  });
}

// ---------- C: the accounts ----------
const TL = { x0: 70, x1: 794, y: 210 };
/** The time line: 44 BC to AD 150 on the left part, a break, then AD 1599. */
const tlx = (y) => (y <= 150 ? TL.x0 + (TL.x1 - 150 - TL.x0) * ((y - IDES) / (150 - IDES)) : TL.x1 - 40);
function timeline(t, a) {
  A(a, () => {
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(TL.x0, TL.y); ctx.lineTo(tlx(150), TL.y); ctx.moveTo(tlx(150) + 30, TL.y); ctx.lineTo(TL.x1, TL.y); ctx.stroke();
    label('//', tlx(150) + 15, TL.y, { size: 22, weight: 700 });
    for (const [y, s] of [[IDES, '44 BC'], [1, 'AD 1'], [100, 'AD 100']]) { ctx.fillStyle = C.faint; ctx.fillRect(tlx(y) - 1, TL.y - 8, 2, 16); label(s, tlx(y), TL.y + 26, { size: 20 }); }
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(tlx(IDES), TL.y, 9, 0, TAU); ctx.fill();
    label('the Ides', tlx(IDES) + 4, TL.y - 26, { size: 20, weight: 700, color: C.gold, align: 'left' });
  });
}
function card(x, y, w, h, col, title, lines, a) {
  A(a, () => {
    ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(x, y, 10, h);
    label(title, x + 26, y + 30, { size: 24, weight: 700, color: C.paperInk, align: 'left' });
    lines.forEach((s, i) => label(s, x + 26, y + 66 + i * 32, { size: 22, weight: i === 0 ? 600 : 500, color: C.paperInk, align: 'left' }));
  });
}
function sceneSources(t) {
  A(span(t, 27.8, 55.6, 0.4, 0.4), () => {
    label('WHO TELLS IT, AND WHEN', CX, 110, { size: 26, weight: 700, color: C.soft, spacing: '2px' });
    timeline(t, seg(t, 28.0, 28.6));
    const [nic, plu, sue] = SOURCES;
    const mark = (s, t0) => A(seg(t, t0, t0 + 0.4), () => {
      ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(tlx(s.year), TL.y, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = s.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tlx(s.year), TL.y + 40); ctx.lineTo(tlx(s.year), TL.y + 60); ctx.stroke();
    });
    // Nicolaus: alive at the time
    mark(nic, 32.6);
    card(46, 280, 370, 160, nic.col, nic.who, [`${nic.when}, within ${after(nic.year)} years`, `${nic.wounds} wounds`, `${nic.plot} plotters`], seg(t, 32.8, 33.4));
    // Plutarch and Suetonius
    mark(plu, 37.2); mark(sue, 37.6);
    card(444, 280, 374, 160, sue.col, 'Plutarch, Suetonius', [`AD 100–121, ${after(plu.year)}–${after(sue.year)} years later`, `${sue.wounds} wounds`, 'over 60 plotters (Suetonius)'], seg(t, 37.4, 38.0));
    // the wounds as tally marks; one judged fatal (Suetonius, the physician Antistius)
    A(seg(t, 41.8, 42.4), () => {
      label('23 wounds; one fatal, the doctor Antistius judged', CX, 490, { size: 24, weight: 600, color: C.ink });
      for (let i = 0; i < 23; i++) {
        const x = 152 + i * 25, fatal = i === 1, on = seg(t, 42.2 + i * 0.05, 42.4 + i * 0.05);
        A(on, () => { ctx.fillStyle = fatal && t > 43.6 ? C.red : C.soft; ctx.fillRect(x, 520, 8, 56); });
      }
      A(seg(t, 43.6, 44.0), () => label('the second', 152 + 25 + 4, 600, { size: 20, weight: 700, color: C.red }));
    });
    // the words
    A(seg(t, 46.4, 47.0), () => {
      ctx.fillStyle = '#141b27'; ctx.fillRect(40, 466, W - 80, 160);
      label('Suetonius: not a word, only a groan.', CX, 500, { size: 26, weight: 600, color: C.ink });
      label('Some wrote he said in Greek to Brutus:', CX, 544, { size: 24, weight: 500, color: C.soft });
      label('καὶ σύ, τέκνον; “You too, child?”', CX, 596, { size: 34, weight: 600, color: C.gold, family: SANS });
    });
    // Shakespeare, far to the right
    A(seg(t, 51.0, 51.6), () => {
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(tlx(SHAKESPEARE), TL.y, 9, 0, TAU); ctx.fill();
      label('1599', tlx(SHAKESPEARE), TL.y + 26, { size: 20, weight: 700, color: C.red });
      ctx.fillStyle = '#141b27'; ctx.fillRect(40, 466, W - 80, 224);
      font('italic 400', 64, SERIF); text('“Et tu, Brute?”', CX, 540, { align: 'center', base: 'middle', color: C.red });
      label(`Shakespeare’s Julius Caesar, ${after(SHAKESPEARE).toLocaleString('en-US')} years later`, CX, 612, { size: 26, weight: 600, color: C.ink });
      label('in no ancient account', CX, 656, { size: 24, weight: 500, color: C.soft });
    });
  });
}

// ---------- D: walled up; the Republic's end ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.4, 0.4, 0), () => {
    // the hall walled up, brick by brick
    const cx = CX, cy = 300, w = 300, h = 220;
    ctx.strokeStyle = C.stone; ctx.lineWidth = 4; ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
    label('the hall where he was killed', cx, cy - h / 2 - 28, { size: 24, weight: 600, color: C.ink });
    const fill = seg(t, 56.0, 58.6) * 48;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6); ctx.clip();
    for (let i = 0; i < 48; i++) {
      if (i >= fill) break;
      const row = Math.floor(i / 6), col = i % 6, off = row % 2 ? -30 : 0;
      ctx.fillStyle = (row + col) % 2 ? '#a8573f' : '#b9664a';
      ctx.fillRect(cx - w / 2 + 4 + col * 60 + off, cy + h / 2 - 4 - (row + 1) * 27, 56, 24);
    }
    ctx.restore();
    A(seg(t, 58.4, 58.8), () => label('walled up (Suetonius); later a latrine (Cassius Dio)', cx, cy + h / 2 + 34, { size: 22, weight: 500 }));
    // the years after
    const L = 80, R = 784, y = 600;
    const xs = (bc) => L + (R - L) * (44 - bc) / (44 - 27);
    A(seg(t, 60.2, 60.8), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      const ev = [[44, 'Ides', C.gold], [42, 'Philippi', C.ink], [31, 'Actium', C.ink], [27, 'Augustus', C.gold]];
      ev.forEach(([bc, s, col], i) => A(seg(t, 60.6 + i * 0.5, 61.0 + i * 0.5), () => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xs(bc), y, 9, 0, TAU); ctx.fill();
        label(s, xs(bc), bc === 42 ? y - 62 : y - 30, { size: 24, weight: 700, color: col });
        label(`${bc} BC`, xs(bc), y + 30, { size: 20, weight: 500 });
      }));
      label('civil wars', (xs(42) + xs(31)) / 2, y + 66, { size: 24, weight: 600, color: C.red });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.55, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'On 15 March 44 BC, the Ides of March, *Julius Caesar* was killed at a Senate meeting.'],
  [5.0, 9.4, 'The Senate met in the *Curia of Pompey*: its own house had burned down in 52 BC.'],
  [9.6, 14.0, 'That hall closed off Pompey’s gardens; its base lies in today’s ~Largo di Torre Argentina~.'],
  [14.2, 18.6, 'Caesar, a general who had won a civil war, ruled Rome as dictator, and took a new title.'],
  [18.8, 23.2, 'A dictator used to serve six months at most. In early 44 BC Caesar became *dictator for life*.'],
  [23.4, 27.8, 'More than 60 men joined a plot against him, says the writer Suetonius.'],
  [28.0, 32.4, 'What happened inside comes from accounts written later. They do not all agree.'],
  [32.6, 37.0, '~Nicolaus of Damascus~, alive at the time, wrote before AD 14: 35 wounds, over 80 plotters.'],
  [37.2, 41.6, 'Plutarch and Suetonius, writing some 150 years later, count *23 wounds*.'],
  [41.8, 46.2, 'A doctor, Antistius, judged only one of them fatal, the second, says Suetonius.'],
  [46.4, 50.8, 'Suetonius says Caesar said nothing; some told of Greek words to Brutus: “You too, child?”'],
  [51.0, 55.4, '“Et tu, Brute?” is in no ancient account: it is famous from Shakespeare’s play of 1599.'],
  [55.6, 60.0, 'The hall was walled up. The plotters meant to save the Republic; new civil wars followed.'],
  [60.2, 64.6, 'They ended with Caesar’s adopted heir as *Augustus*, Rome’s first emperor, in 27 BC.'],
];

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePlan(t);
    sceneDictator(t);
    sceneSources(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.teal, '^': C.red } });
  },
});
