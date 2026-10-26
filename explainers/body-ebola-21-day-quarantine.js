// Explainer for body-ebola-21-day-quarantine: why people exposed to Ebola are watched for 21 days, told
// through the 2026 Bundibugyo virus outbreak. Look: calm slate-teal with sand-coloured ink, a 21-day calendar
// as the motif; cases in muted coral, people being watched in amber, cleared in sage. Serious and quiet: no
// alarm colours, no graphic images. Lora (a humane serif) for captions, Fira Sans for numbers and labels.
//
// Facts: CDC, "Ebola Outbreak: Current Situation" (updated 24 October 2026): 9,995 confirmed cases and 4,845
// confirmed deaths (DRC 9,964 and 4,841; Kenya 9 and 2; Uganda 20 and 2, plus 1 probable case and death;
// Nigeria 1; France 1); caused by Bundibugyo virus; the second-largest Ebola outbreak on record; in Kenya the
// first case was a traveller from the DRC reported on 6 October, and all further cases were among close
// contacts who were already in quarantine when diagnosed. CDC, "How it spreads": contact of broken skin or
// mucous membranes with blood or body fluids of a person who is sick or has died, or with contaminated
// objects; it does not spread like flu or COVID, you cannot get it from being near someone; people cannot
// spread it before symptoms begin. CDC, "Signs and symptoms": symptoms appear 2 to 21 days after exposure, on
// average 8 to 10 days. WHO fact sheet "Ebola disease": incubation 2 to 21 days; containment includes
// identifying contacts and monitoring their health for 21 days, safe and dignified burials; vaccines and
// treatments are approved only for Ebola virus, none for Sudan or Bundibugyo virus. CDC MMWR, "Notes from the
// Field" (August 2026): in the DRC, 15–20% of new confirmed cases had been known contacts (last reported 12
// July 2026; target over 90%).
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  The outbreak: 9,995 confirmed cases, one square each.
//  B  9.0–27.4  How it spreads, and the 2–21 day incubation: a 21-day calendar.
//  C 27.4–50.4  Contact tracing: watched daily, isolated at the first fever, a missed contact; Kenya; Congo.
//  D 50.4–64.4  No approved vaccine for Bundibugyo; the old tools; 21 days and cleared.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#12262b', bg2: '#1c3439', ink: '#efe4d2', soft: 'rgba(239,228,210,0.74)', faint: 'rgba(239,228,210,0.34)',
  case: '#e07a5f', caseDim: 'rgba(224,122,95,0.45)', watch: '#f2cc8f', ok: '#8fc1a3', panel: 'rgba(10,24,27,0.82)', line: 'rgba(239,228,210,0.18)',
};
const SERIF = 'Lora', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const n0 = (v) => v.toLocaleString('en-US');

// ---------- the numbers (CDC, 24 October 2026) ----------
const CASES = 9995, DEATHS = 4845;
const KENYA = 9, KNOWN = [15, 20], TARGET = 90;
const INC = [2, 21], AVG = [8, 10];

const CUES = [
  [0.4, 4.6, 'By 24 October 2026, CDC had counted *9,995* confirmed cases in an Ebola outbreak centred on DR Congo.'],
  [4.8, 9.0, 'It is the *second-largest* Ebola outbreak on record, caused by ~Bundibugyo~ virus.'],
  [9.2, 13.6, 'The virus spreads through contact with the *blood or body fluids* of someone who is ill.'],
  [13.8, 18.2, 'It does ~not~ spread like flu: you can’t catch it just by being near someone.'],
  [18.4, 22.8, 'Symptoms start *2 to 21 days* after infection, and before them, no one is infectious.'],
  [23.0, 27.4, 'So anyone in contact with a case is checked for *21 days*, the top of that range.'],
  [27.6, 32.0, 'Health workers list the people each patient touched or cared for, and *visit them daily*.'],
  [32.2, 36.6, 'At a first fever, a contact is *isolated at once*, before they can pass the virus on.'],
  [36.8, 41.2, 'Miss a single contact, and a new chain of cases can start ~unseen~.'],
  [41.4, 45.8, 'In Kenya in October, every case after the first was *already in quarantine* when found.'],
  [46.0, 50.4, 'In DR Congo in July, only ~15–20%~ of new cases were on a contact list. Target: *over 90%*.'],
  [50.6, 55.0, 'Vaccines exist for one Ebola virus, but ~none~ is approved for Bundibugyo.'],
  [55.2, 59.6, 'So it is stopped the long way: care for the sick, *safe burials* and every contact traced.'],
  [59.8, 64.2, 'After *21 days* without symptoms, a contact is cleared.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(239,228,210,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- a person ----------
function person(x, y, s, color, { ring = null, ringP = 1, cross = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -26, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, 18); ctx.quadraticCurveTo(-20, -10, 0, -10); ctx.quadraticCurveTo(20, -10, 20, 18); ctx.closePath(); ctx.fill();
  if (ring) {
    ctx.strokeStyle = 'rgba(239,228,210,0.15)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -6, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ring; ctx.beginPath(); ctx.arc(0, -6, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringP); ctx.stroke();
  }
  ctx.restore();
}

// ---------- A: one square per confirmed case ----------
function sceneA(t) {
  const a = 1 - seg(t, 8.6, 9.3);
  if (a <= 0) return;
  A(a, () => {
    const cols = 125, cell = 5.2, gx = (W - cols * cell) / 2, gy = 300;
    const shown = Math.floor(CASES * eio(seg(t, 0.4, 3.6)));
    for (let i = 0; i < shown; i++) {
      const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell;
      ctx.fillStyle = i < DEATHS && t > 4.8 ? C.case : 'rgba(239,228,210,0.55)';
      ctx.fillRect(x, y, cell - 1.2, cell - 1.2);
    }
    font(700, 92); text(n0(shown), W / 2, 170, { color: C.ink, align: 'center', base: 'middle' });
    font(500, 26); text('confirmed cases · one square each', W / 2, 238, { color: C.soft, align: 'center', base: 'middle' });
    A(seg(t, 4.8, 5.6), () => {
      ctx.fillStyle = C.case; ctx.fillRect(gx, 745, 18, 18);
      font(500, 24); text(`${n0(DEATHS)} confirmed deaths`, gx + 30, 754, { color: C.ink, base: 'middle' });
      font(400, 22); text('CDC, 24 October 2026', gx + cols * cell, 754, { color: C.soft, align: 'right', base: 'middle' });
    });
  });
}

// ---------- B: how it spreads, and the 21 days ----------
function spread(t) {
  const a = span(t, 9.2, 18.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const y = 460;
    // direct contact: a carer's hand on a patient
    const p1 = span(t, 9.2, 13.8, 0.4, 0.3);
    A(p1, () => {
      person(300, y, 2.2, C.case);
      person(560, y, 2.2, C.ink);
      ctx.strokeStyle = C.watch; ctx.lineWidth = 6; ctx.lineCap = 'round';
      const reach = eio(seg(t, 9.8, 11.0));
      ctx.beginPath(); ctx.moveTo(520, y - 10); ctx.lineTo(lerp(520, 360, reach), y - 10 + 20 * reach); ctx.stroke();
      ctx.fillStyle = C.watch; ctx.beginPath(); ctx.arc(lerp(520, 360, reach), y - 10 + 20 * reach, 10, 0, Math.PI * 2); ctx.fill();
      font(500, 24);
      text('ill with Ebola', 300, y + 90, { color: C.case, align: 'center', base: 'middle' });
      text('carer', 560, y + 90, { color: C.ink, align: 'center', base: 'middle' });
      A(seg(t, 11.2, 11.8), () => { font(600, 26); text('direct contact with body fluids', W / 2, 250, { color: C.watch, align: 'center', base: 'middle' }); });
    });
    // not through the air
    const p2 = span(t, 13.8, 18.4, 0.4, 0.3);
    A(p2, () => {
      person(300, y, 2.2, C.case);
      person(560, y, 2.2, C.ink);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
      for (const dy of [-40, -10, 20]) { ctx.beginPath(); ctx.moveTo(360, y + dy); ctx.bezierCurveTo(400, y + dy - 20, 450, y + dy + 20, 500, y + dy); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.strokeStyle = C.case; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(430, y - 10, 64, 0, Math.PI * 2); ctx.moveTo(430 - 45, y - 10 + 45); ctx.lineTo(430 + 45, y - 10 - 45); ctx.stroke();
      font(600, 26); text('not through the air', W / 2, 250, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}
/** A 21-day calendar: 3 weeks of 7 days. */
function calendar(x0, y0, cell, t, { fill = 0, highlight = true } = {}) {
  for (let d = 1; d <= 21; d++) {
    const x = x0 + ((d - 1) % 7) * cell, y = y0 + Math.floor((d - 1) / 7) * cell;
    const inRange = d >= INC[0], avg = d >= AVG[0] && d <= AVG[1];
    ctx.fillStyle = d <= fill ? 'rgba(143,193,163,0.55)' : highlight && avg ? 'rgba(242,204,143,0.42)' : highlight && inRange ? 'rgba(242,204,143,0.16)' : 'rgba(239,228,210,0.06)';
    k.rrect(x + 3, y + 3, cell - 6, cell - 6, 8); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    font(600, cell * 0.3); text(String(d), x + cell / 2, y + cell / 2, { color: d <= fill ? C.ink : C.soft, align: 'center', base: 'middle' });
  }
}
function incubation(t) {
  const a = span(t, 18.4, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cell = 92, x0 = (W - 7 * cell) / 2, y0 = 300;
    font(600, 26); text('Days from infection to the first symptoms', W / 2, 190, { color: C.soft, align: 'center', base: 'middle' });
    calendar(x0, y0, cell, t, { highlight: true });
    // the range bracket
    A(seg(t, 19.0, 19.8), () => {
      font(500, 22);
      text(`can be ${INC[0]} to ${INC[1]} days`, x0, y0 - 36, { color: C.watch, base: 'middle' });
      text(`most often ${AVG[0]}–${AVG[1]} (CDC average)`, x0 + 7 * cell, y0 - 36, { color: C.watch, align: 'right', base: 'middle' });
    });
    // day 1: infected but no symptoms yet, and not infectious
    A(seg(t, 20.4, 21.2) * (1 - seg(t, 23.0, 23.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(x0, y0 + 3 * cell + 24, 7 * cell, 64, 14); ctx.fill();
      font(500, 24); text('no symptoms yet = not infectious', W / 2, y0 + 3 * cell + 56, { color: C.ink, align: 'center', base: 'middle' });
    });
    // the watch: 21 days, the whole calendar
    A(seg(t, 23.2, 24.0), () => {
      ctx.strokeStyle = C.ok; ctx.lineWidth = 5; k.rrect(x0 - 6, y0 - 6, 7 * cell + 12, 3 * cell + 12, 16); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(x0, y0 + 3 * cell + 24, 7 * cell, 64, 14); ctx.fill();
      font(600, 26); text('every contact is followed for all 21 days', W / 2, y0 + 3 * cell + 56, { color: C.ok, align: 'center', base: 'middle' });
    });
  });
}

// ---------- C: contact tracing ----------
const IDX = { x: 140, y: 470 };
const CONTACTS = [
  { x: 400, y: 240 }, { x: 400, y: 355 }, { x: 400, y: 470, fever: 9 }, { x: 400, y: 585 },
];
const MISSED = { x: 560, y: 690 };
const SECOND = [{ x: 700, y: 640 }, { x: 760, y: 720 }, { x: 680, y: 750 }];
function tracing(t) {
  const a = eout(seg(t, 27.6, 28.4)) * (1 - seg(t, 41.0, 41.6));
  if (a <= 0) return;
  A(a, () => {
    // day counter for the watch
    const day = Math.min(21, Math.floor(1 + 20 * seg(t, 29.0, 40.6)));
    font(600, 26); text('Contacts of one patient', 60, 150, { color: C.soft, base: 'middle' });
    ctx.fillStyle = C.panel; k.rrect(560, 124, 200, 52, 26); ctx.fill();
    font(700, 26); text(`day ${day} of 21`, 660, 150, { color: C.watch, align: 'center', base: 'middle' });
    // lines from the patient to the listed contacts
    CONTACTS.forEach((c, i) => {
      const g = eout(seg(t, 28.0 + i * 0.25, 28.6 + i * 0.25));
      ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(IDX.x + 40, IDX.y); ctx.lineTo(lerp(IDX.x + 40, c.x - 44, g), lerp(IDX.y, c.y, g)); ctx.stroke();
    });
    person(IDX.x, IDX.y, 1.7, C.case);
    font(500, 22); text('patient', IDX.x, IDX.y + 64, { color: C.case, align: 'center', base: 'middle' });
    CONTACTS.forEach((c, i) => {
      const g = eout(seg(t, 28.4 + i * 0.25, 28.9 + i * 0.25));
      if (g <= 0) return;
      const ill = c.fever && day >= c.fever;
      const isoX = 690, moved = ill ? eio(seg(t, 33.0, 34.2)) : 0;
      const x = lerp(c.x, isoX, moved);
      A(g, () => person(x, c.y, 1.2, ill ? C.case : C.ink, { ring: ill ? C.case : C.watch, ringP: Math.min(day, ill ? c.fever : 21) / 21 }));
      // the daily visit: a tick next to each contact
      if (!ill && t > 29.0) A(g, () => { font(500, 20); text(day >= 21 ? 'cleared' : 'checked today', c.x + 56, c.y - 4, { color: day >= 21 ? C.ok : C.soft, base: 'middle' }); });
      if (ill) A(seg(t, 32.6, 33.2), () => {
        font(600, 21); text(`fever on day ${c.fever}`, x, c.y + 54, { color: C.case, align: 'center', base: 'middle' });
      });
    });
    // the isolation room
    A(seg(t, 33.0, 33.8), () => {
      ctx.strokeStyle = C.case; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); k.rrect(615, 380, 150, 170, 16); ctx.stroke(); ctx.setLineDash([]);
      font(600, 22); text('isolation', 690, 366, { color: C.case, align: 'center', base: 'middle' });
    });
    // the contact nobody listed, and the chain that starts from them
    A(eout(seg(t, 36.8, 37.6)), () => {
      ctx.strokeStyle = 'rgba(224,122,95,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(IDX.x + 20, IDX.y + 40); ctx.lineTo(MISSED.x - 30, MISSED.y - 20); ctx.stroke(); ctx.setLineDash([]);
      person(MISSED.x, MISSED.y, 1.2, C.case);
      font(600, 21); text('not on the list', MISSED.x, MISSED.y + 54, { color: C.case, align: 'center', base: 'middle' });
    });
    SECOND.forEach((s, i) => {
      const g = eout(seg(t, 38.4 + i * 0.5, 39.0 + i * 0.5));
      if (g <= 0) return;
      A(g, () => {
        ctx.strokeStyle = 'rgba(224,122,95,0.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(MISSED.x + 30, MISSED.y); ctx.lineTo(s.x - 26, s.y); ctx.stroke();
        person(s.x, s.y, 0.9, C.caseDim);
      });
    });
  });
}
function kenya(t) {
  const a = span(t, 41.4, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 28); text(`Kenya: ${KENYA} confirmed cases`, W / 2, 190, { color: C.soft, align: 'center', base: 'middle' });
    for (let i = 0; i < KENYA; i++) {
      const g = eout(seg(t, 41.8 + i * 0.22, 42.3 + i * 0.22));
      const first = i === 0;
      const x = first ? 150 : 360 + ((i - 1) % 4) * 105, y = first ? 440 : 370 + Math.floor((i - 1) / 4) * 150;
      A(g, () => person(x, y, 1.3, first ? C.case : C.watch));
    }
    A(seg(t, 43.0, 43.6), () => {
      ctx.strokeStyle = C.watch; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); k.rrect(300, 290, 430, 300, 20); ctx.stroke(); ctx.setLineDash([]);
      font(500, 22);
      text('first case: a traveller', 150, 530, { color: C.case, align: 'center', base: 'middle' });
      text('reported 6 October', 150, 560, { color: C.soft, align: 'center', base: 'middle' });
      text('all already in quarantine when diagnosed', 515, 624, { color: C.watch, align: 'center', base: 'middle' });
    });
  });
}
function congo(t) {
  const a = span(t, 46.0, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('New cases who were already on a contact list', W / 2, 190, { color: C.soft, align: 'center', base: 'middle' });
    const L = 130, R = 740, X = (p) => lerp(L, R, p / 100);
    const bar = (y, from, to, color, label, sub, g) => {
      ctx.fillStyle = 'rgba(239,228,210,0.08)'; k.rrect(L, y, R - L, 70, 12); ctx.fill();
      ctx.fillStyle = color; k.rrect(L, y, Math.max(8, (X(to) - L) * g), 70, 12); ctx.fill();
      if (from !== to) { ctx.fillStyle = 'rgba(18,38,43,0.45)'; ctx.fillRect(X(from), y, Math.max(0, (X(to) - X(from)) * g), 70); }
      font(700, 30); text(label, L, y - 30, { color, base: 'middle' });
      font(500, 22); text(sub, R, y - 30, { color: C.soft, align: 'right', base: 'middle' });
    };
    bar(320, KNOWN[0], KNOWN[1], C.case, `${KNOWN[0]}–${KNOWN[1]}%`, 'DRC, July 2026', eio(seg(t, 46.4, 47.4)));
    bar(500, TARGET, TARGET, C.ok, `over ${TARGET}%`, 'the response target', eio(seg(t, 47.4, 48.6)));
    font(500, 22);
    for (const p of [0, 25, 50, 75, 100]) text(`${p}%`, X(p), 620, { color: C.faint, align: 'center', base: 'middle' });
    font(400, 21); text('CDC, Morbidity and Mortality Weekly Report, August 2026', W / 2, 690, { color: C.soft, align: 'center', base: 'middle' });
  });
}

// ---------- D: no vaccine; the old tools; cleared ----------
function vaccines(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('Approved vaccines and treatments (WHO)', W / 2, 190, { color: C.soft, align: 'center', base: 'middle' });
    const rows = [['Ebola virus', true], ['Sudan virus', false], ['Bundibugyo virus', false]];
    rows.forEach(([name, ok], i) => {
      const y = 320 + i * 130, g = eout(seg(t, 51.0 + i * 0.4, 51.6 + i * 0.4));
      A(g, () => {
        ctx.fillStyle = i === 2 ? 'rgba(224,122,95,0.16)' : 'rgba(239,228,210,0.07)'; k.rrect(110, y - 48, 644, 96, 16); ctx.fill();
        font(600, 32, SERIF); text(name, 150, y, { color: i === 2 ? C.case : C.ink, base: 'middle' });
        font(700, 26); text(ok ? 'yes' : 'none', 714, y, { color: ok ? C.ok : C.case, align: 'right', base: 'middle' });
      });
    });
    A(seg(t, 52.6, 53.2), () => { font(500, 22); text('this outbreak', 150, 320 + 2 * 130 + 70, { color: C.case, base: 'middle' }); });
  });
}
function tools(t) {
  const a = span(t, 55.2, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const items = [['Care for the sick', 'early care improves survival'], ['Safe, dignified burials', 'touching the body can spread the virus'], ['Trace every contact', 'and watch them for 21 days']];
    items.forEach(([h, s], i) => {
      const y = 280 + i * 150, g = eout(seg(t, 55.6 + i * 0.5, 56.2 + i * 0.5));
      A(g, () => {
        ctx.fillStyle = C.ok; ctx.beginPath(); ctx.arc(150, y, 26, 0, Math.PI * 2); ctx.fill();
        font(700, 28); text(String(i + 1), 150, y + 1, { color: C.bg, align: 'center', base: 'middle' });
        font(600, 34, SERIF); text(h, 200, y - 14, { color: C.ink, base: 'middle' });
        font(400, 24); text(s, 200, y + 24, { color: C.soft, base: 'middle' });
      });
    });
  });
}
function cleared(t) {
  const a = eout(seg(t, 59.8, 60.6));
  if (a <= 0) return;
  A(a, () => {
    const cell = 92, x0 = (W - 7 * cell) / 2, y0 = 260;
    calendar(x0, y0, cell, t, { fill: Math.floor(21 * eio(seg(t, 60.0, 62.8))), highlight: false });
    A(seg(t, 62.8, 63.4), () => {
      person(W / 2, y0 + 3 * cell + 120, 1.4, C.ok, { ring: C.ok, ringP: 1 });
      font(600, 30, SERIF); text('cleared', W / 2, y0 + 3 * cell + 200, { color: C.ok, align: 'center', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    spread(t);
    incubation(t);
    tracing(t);
    kenya(t);
    congo(t);
    vaccines(t);
    tools(t);
    cleared(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.watch, '~': C.case } });
  },
});
