// Explainer for art-arch-of-titus-menorah (Roma): the Arch of Titus on the Via Sacra, its relief of the spoils of
// the Temple in Jerusalem, and how a 2012 study found traces of yellow ochre on the carved menorah; then Giuseppe
// Valadier's restoration of the 1820s, with the new parts in travertine. Look: dusk stone, white marble against warm
// porous travertine; the study in instrument colours (a cyan scan line, a spectrum and a reflectance graph); ochre
// gold for the traces. Crimson Pro for titles and the Latin, Space Grotesk for captions and data. The war and the
// destruction of the Temple are named, not shown.
//
// Facts:
// - Wikipedia, "Arch of Titus": on the Via Sacra, just southeast of the Roman Forum; built about AD 81 by Emperor
//   Domitian shortly after the death of his brother Titus, for Titus's deification and the victory over the Jewish
//   revolt; 15.4 m high, 13.5 m wide, 4.75 m deep, the passage 8.3 m high and 5.36 m wide; the south panel inside
//   shows the spoils of the Temple carried in procession, with the golden menorah, the trumpets and the Table of
//   Showbread; the panels commemorate the joint triumph of Titus and Vespasian in 71 after the siege of Jerusalem in
//   70; the original inscription, SENATVS POPVLVSQVE ROMANVS DIVO TITO DIVI VESPASIANI F VESPASIANO AVGVSTO; the 2012
//   Arch of Titus Digital Restoration Project found remains of yellow ochre on the menorah; restored by Raffaele
//   Stern from 1817 and Giuseppe Valadier in 1821 under Pope Pius VII, in travertine rather than marble so that new
//   can be told from old; the menorah served as the model for the emblem of the State of Israel; a local custom kept
//   Roman Jews from walking under the arch.
// - Yeshiva University News, "Discovering the Menorah's Original Color" (22 June 2012): fieldwork 5-7 June 2012, led
//   by the YU Center for Israel Studies, project director Prof. Steven Fine, with Bernard Frischer, Cinzia Conti,
//   Paolo Liverani and Heinrich Piening, with the Soprintendenza of Rome; a Breuckmann 3D scanner recorded the reliefs
//   "with sub-millimeter accuracy"; Piening used non-invasive UV-VIS spectrometry; "traces of yellow ochre were found
//   on the arms and base of the Menorah", fitting biblical, early Christian and Talmudic texts and the eyewitness
//   descriptions of the golden menorah by the first-century historian Josephus.
// - Parco archeologico del Colosseo, "Arch of Titus": in the Middle Ages incorporated into the fortress of the
//   Frangipane family; in the 1820s Valadier's radical restoration dismantled it piece by piece and reassembled it,
//   integrated with travertine in the missing parts; the bronze-letter inscription on the Forum side records the
//   restoration under Pius VII.
// The reflectance curves are a simplified illustration of how a yellow earth pigment absorbs blue light, not the
// study's measurements; the split of old and new stone in the drawing is schematic.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The arch on the Via Sacra; Domitian for his deified brother Titus.
//  B  9.6–23.2  AD 70, Jerusalem; the spoils relief inside the arch; the menorah in bare marble.
//  C 23.4–46.2  June 2012: the 3D scan, the light measurement, ochre absorbs blue; traces on the arms and base.
//  D 46.4–55.4  Josephus's golden menorah; the model for the emblem of the State of Israel.
//  E 55.6–64.6  The medieval fortress; Valadier's travertine of the 1820s.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#141722', bg2: '#2a2733', ink: '#f6f1e7', soft: 'rgba(246,241,231,0.74)', faint: 'rgba(246,241,231,0.22)',
  marble: '#ece5d6', marble2: '#d2c7b2', shade: '#a99d86', trav: '#cdb487', trav2: '#b39a6c', ochre: '#dca437', scan: '#56d4e8',
  blue: '#6f8cff', brick: '#8f4a30', dark: '#231d22',
};
const TITLE = 'Crimson Pro', SANS = 'Space Grotesk';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const ARCH_W = 13.5, ARCH_H = 15.4, PASS_W = 5.36, PASS_H = 8.3;
const TITUS = [79, 81], JERUSALEM = 70, TRIUMPH = 71, STUDY = 2012;
// a simplified reflectance (0–1) of bare marble and of yellow ochre at wavelength nm: ochre absorbs blue
const reflMarble = () => 0.85;
const reflOchre = (nm) => 0.12 + 0.56 / (1 + Math.exp(-(nm - 530) / 18));
if (!(reflOchre(450) < 0.2 && reflOchre(650) > 0.6)) throw new Error('model');

// ---------- the arch ----------
const PX = 36, BASE = 720, X0 = CX - (ARCH_W * PX) / 2;
const ax = (m) => X0 + m * PX, ay = (m) => BASE - m * PX;
const OLD_L = 2.6, OLD_R = ARCH_W - 2.6; // the ancient core between these, schematic
function stone(x, y, w, h, kind) {
  ctx.fillStyle = kind === 'trav' ? C.trav : C.marble; ctx.fillRect(x, y, w, h);
  if (kind === 'trav') {
    // pores of travertine
    ctx.fillStyle = 'rgba(110,86,50,0.35)';
    let s = Math.floor(x * 7 + y * 3) % 997;
    for (let i = 0; i < (w * h) / 900; i++) { s = (s * 16807) % 2147483647; const px = x + (s % 1000) / 1000 * w; s = (s * 16807) % 2147483647; const py = y + (s % 1000) / 1000 * h; ctx.fillRect(px, py, 3, 1.6); }
  }
}
/** The arch's face; `trav` 0–1 shows Valadier's travertine parts, `walls` 0–1 the medieval fortress around it. */
function arch(t, { trav = 0, lift = 0 } = {}) {
  const kind = (m0, m1) => (trav > 0.5 && (m1 <= OLD_L + 1e-6 || m0 >= OLD_R - 1e-6) ? 'trav' : 'marble');
  const pieces = [[0, 0, OLD_L, 11], [OLD_L, 0, OLD_R, 11], [OLD_R, 0, ARCH_W, 11], [0, 11, OLD_L, ARCH_H], [OLD_L, 11, OLD_R, ARCH_H], [OLD_R, 11, ARCH_W, ARCH_H]];
  pieces.forEach(([m0, y0, m1, y1], i) => {
    const up = (i % 3 !== 1 ? lift : 0) * 60 * (i < 3 ? 1 : 1.4);
    ctx.save(); ctx.translate(0, -up);
    stone(ax(m0), ay(y1), (m1 - m0) * PX, (y1 - y0) * PX, kind(m0, m1));
    ctx.restore();
  });
  // the passage
  const pl = (ARCH_W - PASS_W) / 2;
  ctx.fillStyle = C.dark; ctx.beginPath(); ctx.moveTo(ax(pl), BASE); ctx.lineTo(ax(pl), ay(PASS_H - PASS_W / 2)); ctx.arc(ax(ARCH_W / 2), ay(PASS_H - PASS_W / 2), (PASS_W / 2) * PX, Math.PI, 0); ctx.lineTo(ax(pl + PASS_W), BASE); ctx.closePath(); ctx.fill();
  // the reliefs on the passage walls, seen at an angle
  ctx.fillStyle = 'rgba(236,229,214,0.35)';
  ctx.beginPath(); ctx.moveTo(ax(pl), ay(6.2)); ctx.lineTo(ax(pl + 0.9), ay(5.9)); ctx.lineTo(ax(pl + 0.9), ay(2.4)); ctx.lineTo(ax(pl), ay(2.1)); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(ax(pl + PASS_W), ay(6.2)); ctx.lineTo(ax(pl + PASS_W - 0.9), ay(5.9)); ctx.lineTo(ax(pl + PASS_W - 0.9), ay(2.4)); ctx.lineTo(ax(pl + PASS_W), ay(2.1)); ctx.closePath(); ctx.fill();
  // columns (engaged), cornices, attic inscription
  for (const m of [0.6, pl - 0.6, pl + PASS_W + 0.6, ARCH_W - 0.6]) {
    ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(ax(m) - 0.35 * PX, ay(9.6), 0.7 * PX, 8 * PX);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(ax(m) - 0.35 * PX, ay(9.6), 0.2 * PX, 8 * PX);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(ax(-0.2), ay(11), (ARCH_W + 0.4) * PX, 0.5 * PX); ctx.fillRect(ax(-0.2), ay(1.6), (ARCH_W + 0.4) * PX, 0.3 * PX);
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(ax(OLD_L + 0.5), ay(14.6), (OLD_R - OLD_L - 1) * PX, 3 * PX);
  font(600, 15, TITLE);
  ['SENATVS', 'POPVLVSQVE·ROMANVS', 'DIVO·TITO·DIVI·VESPASIANI·F', 'VESPASIANO·AVGVSTO'].forEach((s, i) => text(s, ax(ARCH_W / 2), ay(14.1) + i * 23, { align: 'center', base: 'middle', color: '#5a4d3c', spacing: '1px' }));
  void t;
}

function fortress(a) {
  A(a, () => {
    ctx.fillStyle = C.brick;
    ctx.fillRect(ax(-3.2), ay(19), 3.2 * PX, 19 * PX); ctx.fillRect(ax(ARCH_W), ay(16), 3.4 * PX, 16 * PX);
    ctx.fillRect(ax(-0.2), ay(17.2), (ARCH_W + 0.4) * PX, 1.8 * PX);
    for (let i = 0; i < 12; i++) ctx.fillRect(ax(-0.2) + i * ((ARCH_W + 0.4) * PX) / 12, ay(18.0), ((ARCH_W + 0.4) * PX) / 24, 0.8 * PX);
    for (const [x0, top, w] of [[-3.2, 19, 3.2], [ARCH_W, 16, 3.4]]) for (let i = 0; i < 4; i++) ctx.fillRect(ax(x0) + i * (w * PX) / 4, ay(top + 0.8), (w * PX) / 8, 0.8 * PX);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
    for (let y = ay(19); y < BASE; y += 9) { ctx.beginPath(); ctx.moveTo(ax(-3.2), y); ctx.lineTo(ax(0), y); if (y > ay(16)) { ctx.moveTo(ax(ARCH_W), y); ctx.lineTo(ax(ARCH_W + 3.4), y); } ctx.stroke(); }
  });
}

// ---------- the spoils relief ----------
function menorah(x, y, s, { arms = C.marble, stem = C.marble, base = C.marble, lw = 7 } = {}) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = arms; ctx.lineWidth = lw * s;
  for (const r of [26, 52, 78]) { ctx.beginPath(); ctx.arc(x, y - 120 * s, r * s, 0, Math.PI); ctx.stroke(); }
  ctx.strokeStyle = stem; ctx.beginPath(); ctx.moveTo(x, y - 40 * s); ctx.lineTo(x, y - 196 * s); ctx.stroke();
  ctx.strokeStyle = arms;
  for (const r of [-78, -52, -26, 26, 52, 78]) { ctx.beginPath(); ctx.moveTo(x + r * s, y - 120 * s); ctx.lineTo(x + r * s, y - 196 * s); ctx.stroke(); }
  // lamps
  ctx.fillStyle = arms; for (const r of [-78, -52, -26, 0, 26, 52, 78]) { ctx.beginPath(); ctx.ellipse(x + r * s, y - 200 * s, 8 * s, 4 * s, 0, 0, TAU); ctx.fill(); }
  // a two-tier base
  ctx.fillStyle = base; ctx.fillRect(x - 46 * s, y - 40 * s, 92 * s, 18 * s); ctx.fillRect(x - 60 * s, y - 22 * s, 120 * s, 22 * s);
  ctx.lineCap = 'butt';
}
function figure(x, y, s, col, carry = false) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 112 * s, 13 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 96 * s); ctx.lineTo(x + 18 * s, y - 96 * s); ctx.lineTo(x + 22 * s, y - 40 * s); ctx.lineTo(x - 22 * s, y - 40 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 14 * s, y - 40 * s, 9 * s, 40 * s); ctx.fillRect(x + 6 * s, y - 40 * s, 9 * s, 40 * s);
  if (carry) { ctx.fillRect(x - 4 * s, y - 120 * s, 8 * s, -34 * s); }
}
const PANEL = { x: 70, y: 210, w: 724, h: 400 };
function relief(t, { ochre = 0, gold = 0, mesh = 0, dimRest = 0 } = {}) {
  const { x, y, w, h } = PANEL;
  ctx.fillStyle = C.marble2; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.shade; ctx.lineWidth = 4; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  const g = y + h - 30;
  A(1 - 0.6 * dimRest, () => {
    // the gate the procession passes through, at the right
    ctx.fillStyle = C.marble; ctx.fillRect(x + w - 150, y + 60, 110, g - y - 60);
    ctx.fillStyle = '#b9ad95'; ctx.beginPath(); ctx.moveTo(x + w - 130, g); ctx.lineTo(x + w - 130, y + 170); ctx.arc(x + w - 95, y + 170, 35, Math.PI, 0); ctx.lineTo(x + w - 60, g); ctx.closePath(); ctx.fill();
    // figures, some carrying trumpets and the table
    for (let i = 0; i < 7; i++) figure(x + 60 + i * 86, g, 1.0, i % 2 ? '#e3d9c4' : '#d9ceb6');
    ctx.fillStyle = '#d3c7ae'; ctx.fillRect(x + 470, y + 150, 120, 14); // the table, carried
    ctx.strokeStyle = '#c5b99f'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x + 460, y + 150); ctx.lineTo(x + 560, y + 70); ctx.moveTo(x + 500, y + 150); ctx.lineTo(x + 600, y + 70); ctx.stroke(); // trumpets
    ctx.fillStyle = '#d9ceb6'; ctx.fillRect(x + 60, y + 50, 110, 56); ctx.fillRect(x + 112, y + 106, 6, 40); // a placard on a pole
  });
  // the menorah on its carrying frame
  const mx = x + 330, my = g - 116;
  ctx.fillStyle = '#c9bda3'; ctx.fillRect(mx - 120, my, 240, 12);
  const goldA = mixCol(C.marble, C.ochre, gold);
  menorah(mx, my, 1.0, { arms: ochre > 0 ? mixCol(C.marble, C.ochre, Math.max(gold, ochre * 0.85)) : goldA, stem: goldA, base: ochre > 0 ? mixCol(C.marble, C.ochre, Math.max(gold, ochre * 0.85)) : goldA });
  // the 3D scan mesh
  if (mesh > 0) A(mesh, () => {
    ctx.strokeStyle = 'rgba(86,212,232,0.35)'; ctx.lineWidth = 1;
    for (let gx = x + 12; gx < x + w - 6; gx += 18) { ctx.beginPath(); ctx.moveTo(gx, y + 8); ctx.lineTo(gx, y + h - 8); ctx.stroke(); }
    for (let gy = y + 12; gy < y + h - 6; gy += 18) { ctx.beginPath(); ctx.moveTo(x + 8, gy); ctx.lineTo(x + w - 8, gy); ctx.stroke(); }
  });
  void t;
}
function mixCol(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}
const wl = (nm) => { const hue = nm < 440 ? 270 - ((nm - 400) / 40) * 30 : nm < 490 ? 240 - ((nm - 440) / 50) * 60 : nm < 580 ? 180 - ((nm - 490) / 90) * 120 : 60 - ((nm - 580) / 120) * 60; return `hsl(${Math.max(0, hue)},90%,58%)`; };

// ---------- A ----------
function sceneArch(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    arch(t);
    A(seg(t, 1.2, 2.0), () => {
      font(600, 40, TITLE); text('ARCH OF TITUS', CX, 96, { align: 'center', base: 'middle', color: C.ink, spacing: '4px' });
      font(500, 24); text('VIA SACRA · ROMAN FORUM · SOON AFTER AD 81', CX, 138, { align: 'center', base: 'middle', color: C.ochre, spacing: '1px' });
    });
    A(seg(t, 5.4, 6.2), () => {
      ctx.fillStyle = 'rgba(20,23,34,0.88)'; ctx.fillRect(110, 470, 644, 120);
      font(500, 28, TITLE); text('“To the deified Titus, son of the deified Vespasian”', CX, 508, { align: 'center', base: 'middle', color: C.ink });
      font(400, 22); text(`built by Emperor Domitian for his brother, emperor ${TITUS[0]}–${TITUS[1]}`, CX, 552, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- B ----------
function sceneRelief(t) {
  A(span(t, 9.4, 23.4, 0.4, 0.2), () => {
    A(1 - seg(t, 13.8, 14.4), () => {
      const ev = [[66, 'a revolt against Rome in Judaea', 10.0], [JERUSALEM, 'Jerusalem and its Temple destroyed', 10.8], [TRIUMPH, 'Titus and Vespasian’s triumph in Rome', 11.8], [TITUS[1], 'Titus dies; the arch follows', 12.6]];
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(196, 290); ctx.lineTo(196, 290 + 3 * 100); ctx.stroke();
      ev.forEach(([yr, s, t0], i) => A(seg(t, t0, t0 + 0.6), () => {
        const y = 290 + i * 100, hot = yr === JERUSALEM;
        ctx.fillStyle = hot ? C.ochre : C.ink; ctx.beginPath(); ctx.arc(196, y, 9, 0, TAU); ctx.fill();
        font(700, 38, TITLE); text(`AD ${yr}`, 176, y, { align: 'right', base: 'middle', color: hot ? C.ochre : C.ink });
        font(400, 28); text(s, 222, y, { base: 'middle', color: hot ? C.ink : C.soft });
      }));
    });
    A(seg(t, 14.2, 15.0), () => {
      relief(t);
      font(600, 30, TITLE); text('THE SPOILS OF JERUSALEM', CX, 120, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(400, 22); text('south wall of the passage', CX, 160, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 19.4, 20.0), () => {
        font(700, 26); text('MENORAH', PANEL.x + 330, PANEL.y + PANEL.h + 40, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
        font(400, 22); text('trumpets and the table', PANEL.x + 530, PANEL.y + 46, { align: 'center', base: 'middle', color: '#4d4232' });
      });
    });
  });
}

// ---------- C: the study ----------
function graph(x, y, w, h, nm, a = 1, { ochreOnly = false } = {}) {
  A(a, () => {
    ctx.fillStyle = 'rgba(20,23,34,0.92)'; ctx.fillRect(x - 14, y - 40, w + 28, h + 84);
    // spectrum bar
    for (let i = 0; i < w; i++) { ctx.fillStyle = wl(400 + (300 * i) / w); ctx.fillRect(x + i, y + h + 6, 1.2, 10); }
    const X = (n) => x + ((n - 400) / 300) * w, Y = (r) => y + h - r * h;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    if (!ochreOnly) { ctx.strokeStyle = C.marble; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(400), Y(reflMarble())); ctx.lineTo(X(700), Y(reflMarble())); ctx.stroke(); }
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.beginPath();
    for (let n = 400; n <= nm; n += 4) { const px = X(n), py = Y(reflOchre(n)); n === 400 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
    font(500, 22); text('light reflected', x, y - 18, { base: 'middle', color: C.soft });
    text('blue', X(450), y + h + 34, { align: 'center', base: 'middle', color: C.blue });
    text('red', X(660), y + h + 34, { align: 'center', base: 'middle', color: '#ff7a6a' });
    if (!ochreOnly) text('marble', X(700) - 4, Y(reflMarble()) - 16, { align: 'right', base: 'middle', color: C.marble });
    if (nm > 640) text('yellow ochre', X(700) - 4, Y(reflOchre(700)) + 20, { align: 'right', base: 'middle', color: C.ochre });
  });
}
function sceneStudy(t) {
  A(span(t, 23.2, 46.4, 0.4, 0.4), () => {
    const traces = seg(t, 42.0, 43.2);
    relief(t, { mesh: seg(t, 28.4, 30.0) * (1 - seg(t, 32.2, 32.8)), ochre: traces });
    A(seg(t, 23.6, 24.4) * (1 - seg(t, 27.6, 28.0)), () => {
      font(600, 32, TITLE); text(`JUNE ${STUDY}`, CX, 110, { align: 'center', base: 'middle', color: C.scan, spacing: '2px' });
      font(400, 24); text('Yeshiva University team, with Rome’s heritage office', CX, 152, { align: 'center', base: 'middle', color: C.soft });
    });
    // the scan line
    A(seg(t, 28.2, 28.6) * (1 - seg(t, 31.8, 32.2)), () => {
      const u = seg(t, 28.4, 31.6), sx = PANEL.x + 8 + u * (PANEL.w - 16);
      ctx.fillStyle = 'rgba(86,212,232,0.18)'; ctx.fillRect(PANEL.x + 8, PANEL.y + 8, sx - PANEL.x - 8, PANEL.h - 16);
      ctx.strokeStyle = C.scan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, PANEL.y + 4); ctx.lineTo(sx, PANEL.y + PANEL.h - 4); ctx.stroke();
      font(600, 30, TITLE); text('3D SCAN · UNDER 1 mm', CX, 130, { align: 'center', base: 'middle', color: C.scan, spacing: '2px' });
    });
    // measuring the light, then the graph
    const probe = seg(t, 32.8, 33.4) * (1 - seg(t, 41.6, 42.0));
    A(probe, () => {
      const px = PANEL.x + 330 + 52, py = PANEL.y + PANEL.h - 30 - 116 - 150;
      const ix = PANEL.x + 520, iy = PANEL.y + 150;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(ix, iy + 14); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#2b3242'; ctx.fillRect(ix, iy, 70, 30); ctx.fillStyle = C.scan; ctx.fillRect(ix + 8, iy + 8, 20, 14);
      font(600, 30, TITLE); text('UV-VIS SPECTROMETRY', CX, 120, { align: 'center', base: 'middle', color: C.scan, spacing: '2px' });
      font(400, 22); text('which colours of light come back, without touching', CX, 160, { align: 'center', base: 'middle', color: C.soft });
    });
    const sweep = lerp(400, 700, seg(t, 37.4, 40.0));
    graph(470, 470, 290, 170, sweep, seg(t, 37.2, 37.8) * (1 - seg(t, 41.6, 42.0)));
    A(seg(t, 38.2, 38.8) * (1 - seg(t, 41.6, 42.0)), () => {
      font(500, 22); text('simplified curves', 615, 700, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 42.4, 43.0), () => {
      font(600, 30, TITLE); text('TRACES OF YELLOW OCHRE', CX, 120, { align: 'center', base: 'middle', color: C.ochre, spacing: '2px' });
      font(400, 22); text('on the arms and the base', CX, 160, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- D ----------
function sceneGold(t) {
  A(span(t, 46.2, 55.6, 0.4, 0.4), () => {
    const gold = seg(t, 46.6, 48.2);
    A(1 - seg(t, 50.6, 51.2), () => {
      relief(t, { gold, dimRest: 0.4 });
      font(600, 30, TITLE); text('A GOLDEN MENORAH', CX, 120, { align: 'center', base: 'middle', color: C.ochre, spacing: '2px' });
      font(400, 22); text('as the historian Josephus, an eyewitness, described it', CX, 160, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 51.0, 51.8), () => {
      // the menorah alone, framed by two olive branches, as in the emblem
      menorah(CX, 560, 1.4, { arms: C.ink, stem: C.ink, base: C.ink, lw: 6 });
      ctx.strokeStyle = 'rgba(246,241,231,0.6)'; ctx.lineWidth = 4;
      for (const sgn of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(CX + sgn * 40, 600); ctx.quadraticCurveTo(CX + sgn * 200, 520, CX + sgn * 150, 260); ctx.stroke();
        for (let i = 0; i < 7; i++) { const u = i / 7, bx = lerp(CX + sgn * 60, CX + sgn * 165, u), by = lerp(585, 290, u); ctx.beginPath(); ctx.ellipse(bx + sgn * 14, by, 14, 5, sgn * -0.6, 0, TAU); ctx.stroke(); }
      }
      font(600, 30, TITLE); text('THE EMBLEM OF THE STATE OF ISRAEL', CX, 120, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      font(400, 22); text('modelled on this relief’s menorah', CX, 160, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E ----------
function sceneRestore(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    const walls = seg(t, 55.6, 56.4) * (1 - seg(t, 59.4, 60.2));
    const lift = Math.sin(Math.PI * seg(t, 60.0, 62.2));
    arch(t, { trav: seg(t, 61.0, 61.2), lift: lift * 0.6 });
    fortress(walls);
    A(seg(t, 56.0, 56.8) * (1 - seg(t, 59.4, 60.0)), () => {
      ctx.fillStyle = 'rgba(20,23,34,0.9)'; ctx.fillRect(170, 70, 524, 96);
      font(600, 30, TITLE); text('IN THE MIDDLE AGES', CX, 100, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(400, 22); text('walled into the fortress of the Frangipane family', CX, 140, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 60.4, 61.0), () => {
      ctx.fillStyle = 'rgba(20,23,34,0.6)'; ctx.fillRect(150, 70, 564, 92);
      font(600, 30, TITLE); text('1820s · GIUSEPPE VALADIER', CX, 100, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(400, 22); text('taken apart, rebuilt, the gaps filled in travertine', CX, 140, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 62.4, 63.0), () => {
      for (const [x, kind, name] of [[ax(1.3), 'trav', 'TRAVERTINE, 1820s'], [ax(ARCH_W / 2), 'marble', 'MARBLE, AD 81']]) {
        ctx.strokeStyle = kind === 'trav' ? C.trav : C.marble; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, ay(12.5)); ctx.lineTo(x, ay(12.5) - 0); ctx.stroke();
        void name;
      }
      ctx.strokeStyle = C.trav; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax(1.0), BASE + 12); ctx.lineTo(ax(1.0), ay(3)); ctx.stroke();
      ctx.strokeStyle = C.marble; ctx.beginPath(); ctx.moveTo(ax(ARCH_W) - 60, BASE + 12); ctx.lineTo(ax(OLD_R - 0.7), ay(3)); ctx.stroke();
      ctx.fillStyle = 'rgba(20,23,34,0.9)'; ctx.fillRect(ax(-0.4), BASE + 10, 250, 46); ctx.fillRect(ax(ARCH_W) - 230, BASE + 10, 250, 46);
      font(700, 22); text('TRAVERTINE, 1820s', ax(-0.4) + 125, BASE + 33, { align: 'center', base: 'middle', color: C.trav, spacing: '1px' });
      text('ROMAN MARBLE', ax(ARCH_W) - 105, BASE + 33, { align: 'center', base: 'middle', color: C.marble, spacing: '1px' });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.62, C.bg2); lg.addColorStop(1, '#120f14');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(205,180,135,0.18)'; g.fillRect(0, BASE, W, 4);
}

const CUES = [
  [0.4, 4.8, 'On the Via Sacra in Rome’s Forum stands the *Arch of Titus*, built soon after AD 81.'],
  [5.0, 9.4, 'Emperor Domitian raised it for his brother Titus, emperor 79–81, after Titus died.'],
  [9.6, 14.0, 'In AD 70 Titus’s army destroyed Jerusalem and its Temple, centre of Jewish worship.'],
  [14.2, 18.6, 'Inside the arch, a relief shows soldiers carrying the Temple’s treasures in triumph.'],
  [18.8, 23.2, 'At its centre is the seven-branched lampstand, the *menorah*, now bare marble.'],
  [23.4, 27.8, 'In June 2012 a team led by historian Steven Fine of Yeshiva University studied it.'],
  [28.0, 32.4, 'They scanned the relief in 3D, accurate to under a millimetre.'],
  [32.6, 37.0, 'They also measured which colours of light the stone reflects, without touching it.'],
  [37.2, 41.6, 'Yellow ochre, an earth pigment, soaks up ~blue light~; bare marble reflects it.'],
  [41.8, 46.2, 'On the menorah’s arms and base, the light found traces of *yellow ochre*.'],
  [46.4, 50.8, 'That fits the *golden* menorah described by the historian Josephus, an eyewitness.'],
  [51.0, 55.4, 'This menorah became the model for the emblem of the State of Israel.'],
  [55.6, 60.0, 'In the Middle Ages it was walled into a fortress; by the 1800s parts were gone.'],
  [60.2, 64.6, 'In the 1820s Giuseppe Valadier filled the gaps in plainer *travertine*: easy to spot.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneArch(t);
    sceneRelief(t);
    sceneStudy(t);
    sceneGold(t);
    sceneRestore(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.ochre, '~': C.blue } });
  },
});
