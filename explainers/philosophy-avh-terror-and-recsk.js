// Explainer for philosophy-avh-terror-and-recsk (Hungary 1956, "Why"): the State Protection Authority (ÁVH), the
// political police of Mátyás Rákosi's dictatorship. Its informers, its prisons, internment without trial, the Recsk
// labour camp (1950–53) and the deportations to the Hortobágy camps; fear in everyday life, and why the ÁVH became the
// first target of the crowds in October 1956. Look: a night street in charcoal blue, lit windows in amber, the ÁVH in
// brick red; plain figures, no violence shown. Crimson Pro for headings, IBM Plex Sans for captions and labels.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, report (A/3592, 1957; full text at mek.oszk.hu/01200/01274):
//   para. 426: the security police began in December 1944; para. 427: "After 1949, both the security police and the
//   military frontier guards were placed under the ÁVH and made directly responsible to the Council of Ministers";
//   para. 431: "the ÁVH building at 60 Stalin (Andrássy) Street"; para. 433: informers "in all offices and all
//   factories, so that no one knew, even when talking to friends, where his words would be repeated half an hour
//   later"; "six steel cabinets of tape recordings"; "By Law II of 1952 anyone discriminating against a person who
//   acted as informer for the ÁVH was punishable by up to six months in prison"; para. 769: informers "into offices
//   and factories, into apartment houses and schools"; paras 771–774: beatings, starvation, mock executions, threats
//   to families, solitary confinement; para. 776: ÁVH methods "most brutal between 1948 and 1953"; para. 777: the
//   people "continued to be afraid"; in October 1956 "There were lynchings, hangings and shootings" of ÁVH members,
//   and many found sanctuary pending trial; para. 424: the demand that the ÁVH be disbanded.
// - House of Terror Museum, "Anteroom of the Hungarian political police": the political police (PRO) chose 60
//   Andrássy út, the former headquarters of the Arrow Cross Party; "Internment": camps at Recsk, Kistarcsa, Tiszalök
//   and Kazincbarcika; people interned without explanation; camps wound down from 1953.
// - Géza Böszörményi, Recsk 1950–1953 (2nd ed., Széphalom, 2006; mek.oszk.hu/15200/15293): a secret camp, interned
//   without trial, stone quarry; "Recsken 1200-1300 internált volt", one inmate counted 1,265 in winter 1950–51; "A
//   tábor zömét 1953. szeptember közepéig szabadon bocsátották"; "Recsk halottai": 25 names (Barbara Bank's research).
// - Telepesek (Hortobágy) project, Hungarian National Archives (telepesek.mnl.gov.hu, "Táborvilág"): 23 June 1950 the
//   ÁVH with police deported families from the Yugoslav border zone; 12 forced-labour camps on the Hortobágy and
//   Nagykunság; between July 1953 and the 31 October deadline "2524 család, 7281 fő szabadult".
// - "Hatvanöt év után" (telepesek.mnl.gov.hu): internment abolished by Council of Ministers resolution 034/1953
//   (VII. 26.) (Saád 2015).
// The map is schematic.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Hungary, 1950: the ÁVH; 60 Andrássy út.
//  B  9.6–27.8  Under the government itself; informers everywhere; "half an hour later"; Law II of 1952.
//  C 28.0–46.2  Arrest and cells; internment without trial; Recsk; about 1,300 men, 25 named dead.
//  D 46.4–64.6  The Hortobágy camps; 7,281 released in 1953; internment ended, fear stayed; October 1956.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#161a22', bg2: '#0b0d11', ink: '#ece8e1', soft: 'rgba(236,232,225,0.74)', faint: 'rgba(236,232,225,0.22)',
  lamp: '#f2b33d', lampDim: 'rgba(242,179,61,0.22)', avh: '#c0503f', slate: '#7c8aa0', wall: '#232838', panel: 'rgba(9,11,15,0.88)',
};
const HEAD = 'Crimson Pro', TXT = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
/** A small deterministic pseudo-random number from an integer, so frames depend on t only. */
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const RECSK_AT_A_TIME = 1300; // "Recsken 1200-1300 internált volt" (Böszörményi); one inmate counted 1,265
const RECSK_NAMED_DEAD = 25; // "Recsk halottai" (Böszörményi, from Barbara Bank's research)
const HORTOBAGY_CAMPS = 12;
const HORTOBAGY_RELEASED = 7281; // families 2,524, July–31 October 1953 (official records, telepesek.mnl.gov.hu)

function heading(s, sub, a, y = 104) {
  A(a, () => {
    font(700, 44, HEAD); text(s, 70, y, { color: C.ink });
    if (sub) { font(500, 25); text(sub, 70, y + 44, { color: C.lamp }); }
  });
}

/** A plain standing figure: head and body, no face. */
function figure(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 10 * s, 0, TAU); ctx.fill();
  k.rrect(x - 11 * s, y - 18 * s, 22 * s, 34 * s, 8 * s); ctx.fill();
}

/** The building at 60 Andrássy út, schematic: a four-storey front with a grid of windows. */
function building(x, y, w, h, lit, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.wall; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#2c3245'; ctx.fillRect(x - 10, y - 16, w + 20, 18);
    const cols = 6, rows = 4, gx = w / cols, gy = (h - 90) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = lit(r * cols + c);
      ctx.fillStyle = on > 0 ? `rgba(242,179,61,${0.25 + 0.7 * on})` : 'rgba(10,12,16,0.85)';
      ctx.fillRect(x + c * gx + gx * 0.25, y + 14 + r * gy, gx * 0.5, gy * 0.62);
    }
    // the door
    ctx.fillStyle = 'rgba(10,12,16,0.9)';
    ctx.beginPath(); ctx.moveTo(x + w / 2 - 34, y + h); ctx.lineTo(x + w / 2 - 34, y + h - 54); ctx.arc(x + w / 2, y + h - 54, 34, Math.PI, 0); ctx.lineTo(x + w / 2 + 34, y + h); ctx.fill();
    font(700, 30, HEAD); text('60', x + w / 2, y + h - 104, { align: 'center', color: C.ink });
  });
}

// ---------- A: the ÁVH and its headquarters ----------
function sceneA(t) {
  A(span(t, 0, 9.8, 0.5, 0.4), () => {
    heading('BUDAPEST, 1950', 'The State Protection Authority: ÁVH', 1);
    const lit = (i) => (rnd(i) < 0.35 ? 0.5 + 0.5 * Math.sin(t * 1.3 + i) : 0);
    building(210, 250, 444, 380, lit, seg(t, 0.6, 1.4));
    // the street sign
    A(seg(t, 1.6, 2.2), () => {
      ctx.fillStyle = '#1d4f86'; k.rrect(250, 198, 230, 40, 6); ctx.fill();
      font(700, 24); text('Andrássy út', 365, 219, { align: 'center', color: '#ffffff' });
    });
    A(seg(t, 5.2, 5.8), () => {
      ctx.fillStyle = C.panel; k.rrect(120, 650, 624, 110, 14); ctx.fill();
      font(600, 24); text('1944: headquarters of the Arrow Cross party', CX, 686, { align: 'center', color: C.soft });
      text('from 1945: headquarters of the political police', CX, 726, { align: 'center', color: C.avh });
    });
  });
}

// ---------- B: watched ----------
const BLOCK = { x: 110, y: 270, w: 300, h: 380 };
const FACTORY = { x: 470, y: 420, w: 300, h: 230 };
function sceneB(t) {
  A(span(t, 9.6, 28.0, 0.4, 0.4), () => {
    // above everyone: the government itself (cue 3)
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
      heading('FROM 1950', 'Answerable to the government alone', 1);
      const boxes = [['Council of Ministers', 260, C.ink], ['ÁVH', 380, C.avh]];
      boxes.forEach(([s, y, col], i) => A(seg(t, 10.0 + i * 0.6, 10.6 + i * 0.6), () => {
        ctx.strokeStyle = col; ctx.lineWidth = 3; k.rrect(CX - 210, y - 34, 420, 68, 12); ctx.stroke();
        font(700, 30, HEAD); text(s, CX, y, { align: 'center', color: col });
      }));
      A(seg(t, 11.2, 11.8), () => {
        ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX, 294); ctx.lineTo(CX, 346); ctx.stroke();
        font(500, 23);
        ['political police', 'border guards', 'internment camps'].forEach((s, i) => A(seg(t, 12.0 + i * 0.4, 12.4 + i * 0.4), () => text(s, CX, 470 + i * 40, { align: 'center', color: C.soft })));
      });
    });
    // informers in flats, offices, factories (cue 4)
    A(span(t, 14.2, 28.0, 0.4, 0.4), () => {
      heading('WATCHED', 'Informers in flats, offices, schools and factories', seg(t, 14.2, 14.6) * (1 - seg(t, 23.0, 23.4)));
      // a block of flats and a factory, windows lighting where someone listens
      const lit = (i) => (rnd(i + 7) < 0.18 ? seg(t, 15.0 + rnd(i) * 3, 15.6 + rnd(i) * 3) : 0);
      ctx.fillStyle = C.wall; ctx.fillRect(BLOCK.x, BLOCK.y, BLOCK.w, BLOCK.h);
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
        const on = lit(r * 5 + c);
        ctx.fillStyle = on ? `rgba(242,179,61,${0.2 + 0.75 * on})` : 'rgba(10,12,16,0.85)';
        ctx.fillRect(BLOCK.x + 22 + c * 56, BLOCK.y + 22 + r * 50, 34, 30);
      }
      ctx.fillStyle = C.wall; ctx.fillRect(FACTORY.x, FACTORY.y, FACTORY.w, FACTORY.h);
      ctx.beginPath(); ctx.moveTo(FACTORY.x, FACTORY.y);
      for (let i = 0; i < 4; i++) { ctx.lineTo(FACTORY.x + i * 75 + 37, FACTORY.y - 40); ctx.lineTo(FACTORY.x + (i + 1) * 75, FACTORY.y); }
      ctx.fill();
      ctx.fillRect(FACTORY.x + 230, FACTORY.y - 130, 30, 100);
      for (let c = 0; c < 6; c++) {
        const on = lit(40 + c);
        ctx.fillStyle = on ? `rgba(242,179,61,${0.2 + 0.75 * on})` : 'rgba(10,12,16,0.85)';
        ctx.fillRect(FACTORY.x + 18 + c * 47, FACTORY.y + 60, 30, 46);
      }
      font(500, 22); text('flats', BLOCK.x + BLOCK.w / 2, BLOCK.y + BLOCK.h + 26, { align: 'center', color: C.soft });
      text('factory', FACTORY.x + FACTORY.w / 2, FACTORY.y + FACTORY.h + 26, { align: 'center', color: C.soft });
      // "half an hour later" (cue 5): a remark travels from a window to the ÁVH
      A(span(t, 18.8, 23.4, 0.3, 0.3), () => {
        const g = eio(seg(t, 19.2, 21.4)), sx = BLOCK.x + 22 + 2 * 56 + 17, sy = BLOCK.y + 22 + 3 * 50 + 15, ex = 560, ey = 230;
        ctx.strokeStyle = C.lamp; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(420, 190, lerp(sx, ex, g), lerp(sy, ey, g)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.arc(sx, sy, 9, 0, TAU); ctx.fill();
        // a clock: thirty minutes
        const cx = 600, cy = 230, r = 40;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
        ctx.fillStyle = C.lampDim; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * g); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(Math.PI * g) * (r - 10), cy - Math.cos(Math.PI * g) * (r - 10)); ctx.stroke();
        A(seg(t, 21.4, 22.0), () => { font(700, 26); text('30 min', cx + r + 16, cy, { color: C.lamp }); });
      });
      // Law II of 1952 (cue 6)
      A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
        ctx.fillStyle = C.panel; k.rrect(100, 120, 640, 150, 14); ctx.fill(); ctx.strokeStyle = C.avh; ctx.lineWidth = 2; ctx.stroke();
        font(700, 32, HEAD); text('Law II of 1952', 420, 160, { align: 'center', color: C.avh });
        font(500, 23); text('shunning an ÁVH informer: up to six months in prison', 420, 204, { align: 'center', color: C.ink });
        text('found later: six steel cabinets of tape recordings', 420, 240, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- C: cells, internment, Recsk ----------
function sceneC(t) {
  A(span(t, 28.0, 46.4, 0.4, 0.4), () => {
    // the cell (cue 7): a door with a spyhole, a bare bulb
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      heading('ARREST', 'Interrogation in the cellars', 1);
      const dx = 120, dw = 280;
      ctx.fillStyle = '#20242f'; k.rrect(dx, 260, dw, 440, 10); ctx.fill();
      ctx.strokeStyle = C.slate; ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = 'rgba(124,138,160,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx, 330 + i * 100); ctx.lineTo(dx + dw, 330 + i * 100); ctx.stroke(); }
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(dx + dw / 2, 380, 14, 0, TAU); ctx.fill();
      const flick = 0.7 + 0.3 * Math.abs(Math.sin(t * 7));
      A(flick, () => { ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.arc(dx + dw / 2, 222, 12, 0, TAU); ctx.fill(); });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + dw / 2, 180); ctx.lineTo(dx + dw / 2, 210); ctx.stroke();
      font(500, 26);
      ['beatings and hunger', 'mock executions', 'threats to families', 'months alone in a cell'].forEach((s, i) => A(seg(t, 29.2 + i * 0.5, 29.6 + i * 0.5), () => text(s, 450, 360 + i * 64, { color: C.ink })));
      A(seg(t, 31.4, 31.8), () => { font(500, 21); text('as witnesses told the UN in 1957', 450, 640, { color: C.soft }); });
    });
    // internment without trial (cue 8): a map of camps
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      heading('INTERNED', 'Held without any trial', 1);
      hungary(0.9);
      CAMPS.forEach(([name, lon, lat, dx, dy, al], i) => A(seg(t, 33.2 + i * 0.4, 33.6 + i * 0.4), () => {
        const [x, y] = P(lon, lat);
        ctx.fillStyle = C.avh; ctx.fillRect(x - 8, y - 8, 16, 16);
        font(700, 24); text(name, x + dx, y + dy, { align: al, color: C.ink });
      }));
      font(500, 21); text('Schematic map', 80, 690, { color: C.soft });
    });
    // Recsk (cues 9 and 10): hills, a quarry, barracks behind wire
    A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
      heading('RECSK, 1950–1953', 'A secret labour camp in the Mátra hills', 1);
      // hills
      ctx.fillStyle = '#1f2633';
      ctx.beginPath(); ctx.moveTo(0, 560); ctx.quadraticCurveTo(200, 300, 420, 470); ctx.quadraticCurveTo(620, 280, W, 520); ctx.lineTo(W, 720); ctx.lineTo(0, 720); ctx.fill();
      // the quarry: stepped terraces cut into the hill
      ctx.fillStyle = '#3a4152';
      for (let i = 0; i < 4; i++) ctx.fillRect(560 + i * 26, 420 + i * 40, 220 - i * 52, 40);
      // barracks and the fence
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#2b3140'; ctx.fillRect(120 + i * 92, 560, 70, 52); ctx.fillStyle = '#353c4d'; ctx.beginPath(); ctx.moveTo(114 + i * 92, 560); ctx.lineTo(155 + i * 92, 532); ctx.lineTo(196 + i * 92, 560); ctx.fill(); }
      ctx.strokeStyle = C.slate; ctx.lineWidth = 2;
      for (let x = 90; x <= 520; x += 22) { ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 596); ctx.stroke(); }
      for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(90, 604 + j * 12); ctx.lineTo(520, 604 + j * 12); ctx.stroke(); }
      // small figures at the quarry face
      for (let i = 0; i < 6; i++) figure(600 + i * 28, 460 + (i % 3) * 40, 0.75, C.slate);
      A(seg(t, 41.8, 42.4), () => {
        ctx.fillStyle = C.panel; k.rrect(90, 200, 640, 190, 14); ctx.fill();
        font(700, 56, HEAD); text(`about ${fmt(RECSK_AT_A_TIME)}`, 120, 250, { color: C.lamp });
        font(500, 23); text('men held at a time, by former prisoners’ counts', 120, 302, { color: C.ink });
        A(seg(t, 43.4, 44.0), () => { font(700, 26); text(`${fmt(RECSK_NAMED_DEAD)} named among its dead`, 120, 352, { color: C.ink }); });
      });
    });
  });
}

// ---------- the map of Hungary (schematic, from rounded coordinates) ----------
const KX = 102, KY = 150, LON0 = 16.05, LAT0 = 48.62;
const P = (lon, lat) => [80 + (lon - LON0) * KX, 250 + (LAT0 - lat) * KY];
const BORDER = [[16.11, 46.86], [16.45, 47.0], [16.52, 47.35], [16.45, 47.45], [16.65, 47.62], [16.9, 47.75], [17.1, 48.0],
  [17.7, 47.76], [18.0, 47.75], [18.7, 47.8], [18.9, 47.95], [19.4, 48.1], [19.9, 48.15], [20.4, 48.55], [21.15, 48.55],
  [21.6, 48.45], [22.1, 48.4], [22.9, 47.95], [22.3, 47.75], [21.95, 47.35], [21.7, 47.0], [21.25, 46.4], [20.75, 46.2],
  [20.25, 46.12], [19.7, 46.17], [19.1, 45.95], [18.8, 45.88], [18.2, 45.8], [17.6, 45.95], [17.2, 46.15], [16.85, 46.35],
  [16.6, 46.48], [16.4, 46.65]];
// camps named by the House of Terror (Recsk, Kistarcsa, Tiszalök, Kazincbarcika), placed from their towns' coordinates
const CAMPS = [['Recsk', 20.11, 47.93, 14, -16, 'left'], ['Kistarcsa', 19.26, 47.55, 14, 24, 'left'], ['Tiszalök', 21.38, 48.02, 14, 16, 'left'], ['Kazincbarcika', 20.62, 48.25, 0, -28, 'center']];
function hungary(a) {
  A(a, () => {
    ctx.beginPath(); BORDER.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.closePath();
    ctx.fillStyle = 'rgba(124,138,160,0.10)'; ctx.fill(); ctx.strokeStyle = C.slate; ctx.lineWidth = 3; ctx.stroke();
    const [bx, by] = P(19.05, 47.5);
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(bx, by, 6, 0, TAU); ctx.fill();
    font(500, 22); text('Budapest', bx - 12, by + 4, { align: 'right', color: C.soft });
  });
}

// ---------- D: deported families, 1953, and October 1956 ----------
const HORTOBAGY = [21.0, 47.55];
function sceneD(t) {
  A(span(t, 46.4, 65.2, 0.4, 0), () => {
    // the Hortobágy camps (cues 11 and 12)
    A(span(t, 46.4, 55.6, 0.4, 0.4), () => {
      heading('HORTOBÁGY, 1950–1953', 'Families deported to forced-labour camps', 1);
      hungary(1);
      const [hx, hy] = P(...HORTOBAGY);
      for (let i = 0; i < HORTOBAGY_CAMPS; i++) A(seg(t, 47.0 + i * 0.18, 47.3 + i * 0.18), () => {
        const a = (TAU * i) / HORTOBAGY_CAMPS, r = 26 + 18 * rnd(i);
        ctx.fillStyle = C.avh; ctx.beginPath(); ctx.arc(hx + r * Math.cos(a), hy + r * Math.sin(a) * 0.7, 7, 0, TAU); ctx.fill();
      });
      // trains from the southern border zone
      const g = eio(seg(t, 47.4, 49.6));
      ctx.strokeStyle = C.lamp; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      for (const [lon, lat] of [[18.6, 45.95], [17.3, 46.1], [20.1, 46.2]]) {
        const [sx, sy] = P(lon, lat);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, hx, g), lerp(sy, hy, g)); ctx.stroke();
      }
      ctx.setLineDash([]);
      font(700, 24); text(`${fmt(HORTOBAGY_CAMPS)} camps`, hx + 48, hy + 40, { color: C.avh });
      font(500, 21); text('Schematic map', 80, 215, { color: C.soft });
      A(seg(t, 51.4, 52.0), () => {
        ctx.fillStyle = C.panel; k.rrect(130, 678, 604, 92, 14); ctx.fill();
        font(700, 52, HEAD); text(fmt(Math.round(HORTOBAGY_RELEASED * eout(seg(t, 51.6, 53.0)))), 160, 724, { color: C.lamp });
        font(500, 22); text('released in 1953, by official records', 370, 708, { color: C.ink });
        text('July to 31 October', 370, 740, { color: C.soft });
      });
    });
    // internment ends; fear stays (cue 13)
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      heading('26 JULY 1953', 'After Stalin’s death', 1);
      ctx.fillStyle = C.panel; k.rrect(150, 260, 564, 230, 16); ctx.fill(); ctx.strokeStyle = C.lamp; ctx.lineWidth = 2; ctx.stroke();
      font(700, 34, HEAD); text('Internment abolished', CX, 330, { align: 'center', color: C.lamp });
      font(500, 23); text('a government decree; most of Recsk', CX, 384, { align: 'center', color: C.ink });
      text('released by mid-September 1953', CX, 418, { align: 'center', color: C.ink });
      A(seg(t, 57.6, 58.2), () => { font(600, 26); text('The ÁVH remained, and so did the fear.', CX, 580, { align: 'center', color: C.soft }); });
    });
    // October 1956 (cue 14)
    A(seg(t, 60.2, 60.6), () => {
      heading('OCTOBER 1956', 'The crowds’ fury turned on the ÁVH', 1);
      for (let i = 0; i < 13; i++) figure(110 + i * 54, 560 + (i % 2) * 14, 1.25, i % 4 === 1 ? C.lamp : C.slate);
      ctx.fillStyle = '#e8e2d6'; k.rrect(250, 360, 364, 70, 8); ctx.fill();
      font(700, 30, HEAD); text('Disband the ÁVH!', CX, 396, { align: 'center', color: '#3a2a22' });
      ctx.strokeStyle = '#e8e2d6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(280, 430); ctx.lineTo(280, 520); ctx.moveTo(584, 430); ctx.lineTo(584, 520); ctx.stroke();
      A(seg(t, 62.0, 62.6), () => { font(500, 23); text('some ÁVH men lynched; others sheltered to await trial', CX, 680, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'Hungary, 1950: the State Protection Authority, the *ÁVH*, guards Mátyás Rákosi’s dictatorship.'],
  [5.0, 9.4, 'Its home: 60 Andrássy út in Budapest, the *Arrow Cross* party’s headquarters until 1945.'],
  [9.6, 14.0, 'From 1950 the ÁVH answered only to the government, and ran its own *camps*.'],
  [14.2, 18.6, 'Its *informers* sat in blocks of flats, offices, schools and factories.'],
  [18.8, 23.2, 'Witnesses told the UN: no one knew where their words would be repeated *half an hour later*.'],
  [23.4, 27.8, 'A 1952 law made it a crime, punishable by six months, to *shun an informer*.'],
  [28.0, 32.4, 'Those arrested were beaten, starved, threatened and held alone, until they *confessed*.'],
  [32.6, 37.0, 'Many were *interned* without any trial, at camps such as Kistarcsa, Tiszalök and Recsk.'],
  [37.2, 41.6, 'Recsk, in the Mátra hills, 1950–53: a *secret camp* where prisoners broke stone in a quarry.'],
  [41.8, 46.2, 'About 1,300 men were held there at a time, by inmates’ counts; ~25~ are named among its dead.'],
  [46.4, 50.8, 'From June 1950 the ÁVH also deported whole *families* to 12 camps on the Hortobágy plain.'],
  [51.0, 55.4, 'When those camps closed in 1953, official records counted *7,281* people released.'],
  [55.6, 60.0, 'After Stalin’s death, internment was abolished on 26 July 1953. The *fear* stayed.'],
  [60.2, 64.6, 'In October 1956 the crowds’ fury turned on the ÁVH, and some of its men were *lynched*.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    sceneC(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.lamp, '~': C.avh } });
  },
});
