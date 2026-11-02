// Explainer for earth-north-africa-american-cemetery-carthage (Tunisia 1943): the North Africa American Cemetery and
// Memorial at Carthage, run by the American Battle Monuments Commission (ABMC): who lies there, the Tablets of the
// Missing, its plan, and how it is visited today. Look: evening over the cemetery, a plan drawn from above in lawn green
// and marble white, Mediterranean blue, gold for the laurel; headstones as small white shapes, crosses and Stars of
// David. Cinzel for inscriptions and headings (memorial capitals), Lora for captions and notes.
//
// Facts:
// - ABMC brochure "North Africa American Cemetery and Memorial" (January 2024): between the Mediterranean and the Bay
//   of Tunis, atop part of ancient Roman Carthage; established in 1948 to consolidate temporary cemeteries in North
//   Africa; Tunisia granted its free use in perpetuity, without charge or taxation; 27 acres; headstones 2,833, of
//   them 2,777 Latin crosses and 56 Stars of David; Tablets of the Missing 3,724 names on a wall 364 feet long,
//   "missing in service on land, sea, and air in the region"; one Medal of Honor recipient; four sets of brothers;
//   dedicated 21 July 1960; plots A to I; four fountains and pools; open-air map room showing operations from the
//   November 1942 landings to the Axis surrender in May 1943; the figure "Honor" bestows a laurel wreath; Capt. Foy
//   Draper, of the USA's winning relay team at the 1936 Olympics, is buried here.
// - ABMC web pages "About" and "History": more than 2,800 dead; headstones in straight lines in nine rectangular plots
//   divided by wide paths with decorative pools at their intersections; the Wall of the Missing with more than 3,700
//   names, rosettes marking those since recovered and identified; most honoured there died in World War II "in
//   military activities ranging from North Africa to the Persian Gulf"; chapel and memorial court with large maps in
//   mosaic and ceramic, designed to harmonise with local architecture; 10 miles from Tunis.
// - ABMC "Plan your visit": open daily except 25 December and 1 January; admission ends at 4:45 p.m., 15 minutes
//   before closing; free, no booking; a staff member escorts relatives to graves; TGM train from Tunis Marine to
//   Carthage-Amilcar, about 30 minutes, then a 700-metre walk.
// The plan is schematic, after the brochure's drawing.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0–14.0  Carthage on the Gulf of Tunis; the cemetery; 1948, land given by Tunisia.
//  B 14.2–23.2  The plan: nine plots, pools; 2,833 headstones, crosses and Stars of David.
//  C 23.4–41.6  Where the dead served; the Tablets of the Missing, 364 ft, 3,724 names, rosettes.
//  D 41.8–55.4  The map room; Honor's laurel; Foy Draper; brothers.
//  E 55.6–64.6  Visiting: free, daily but two days; the TGM to Carthage-Amilcar, 700 m on foot.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#152a26', sky2: '#24423a', lawn: '#2f5a45', lawn2: '#3a6a52', path: '#d9d2c2', marble: '#f3f1ea', stone: '#cfc8b8',
  sea: '#2c5d7c', sea2: '#3b7397', land: '#c9bc9c', ink: '#f3f1ea', soft: 'rgba(243,241,234,0.74)', faint: 'rgba(243,241,234,0.2)',
  gold: '#d9b45a', water: '#7fb6d6', dark: '#10201c',
};
const CAPS = 'Cinzel', TEXT = 'Lora';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers (ABMC) ----------
const HEADSTONES = 2833, CROSSES = 2777, STARS = 56, MISSING = 3724, WALL_FT = 364, ACRES = 27;
if (CROSSES + STARS !== HEADSTONES) throw new Error('numbers');

// ---------- A: Carthage on the Gulf of Tunis, schematic ----------
function gulf(t, a) {
  A(a, () => {
    ctx.fillStyle = C.sea; ctx.fillRect(40, 170, 784, 600);
    // land: west and south shores, the Carthage headland, Cap Bon to the east
    ctx.fillStyle = C.land;
    ctx.beginPath(); ctx.moveTo(40, 170); ctx.lineTo(300, 170); ctx.quadraticCurveTo(330, 300, 380, 360); ctx.lineTo(430, 380);
    ctx.quadraticCurveTo(470, 360, 470, 420); ctx.quadraticCurveTo(450, 470, 420, 500); ctx.lineTo(440, 560); ctx.quadraticCurveTo(560, 600, 640, 560);
    ctx.quadraticCurveTo(720, 520, 760, 420); ctx.lineTo(824, 300); ctx.lineTo(824, 770); ctx.lineTo(40, 770); ctx.closePath(); ctx.fill();
    // the lake of Tunis
    ctx.fillStyle = C.sea2; ctx.beginPath(); ctx.ellipse(330, 560, 70, 42, -0.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(16,32,28,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(40, 170, 784, 600);
    font(600, 24, CAPS);
    text('GULF OF TUNIS', 620, 250, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    text('TUNIS', 200, 604, { align: 'center', base: 'middle', color: C.dark, spacing: '2px' });
    ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(200, 572, 7, 0, TAU); ctx.fill();
    // ruins of ancient Carthage, a few columns
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C.stone; ctx.fillRect(470 + i * 14, 430 - (i % 2) * 8, 7, 26 + (i % 2) * 8); }
    font(400, 22, TEXT); text('ruins of ancient Carthage', 440, 474, { align: 'right', base: 'middle', color: C.dark });
    // the cemetery
    const pulse = 1 + 0.15 * Math.sin(t * 3);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(436, 404, 16 * pulse, 0, TAU); ctx.stroke();
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.arc(436, 404, 7, 0, TAU); ctx.fill();
    font(400, 22, TEXT); text('schematic', 60, 750, { align: 'left', base: 'middle', color: C.dark });
  });
}
function sceneOpen(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    gulf(t, seg(t, 0.2, 1.2));
    A(seg(t, 0.8, 1.6), () => {
      font(700, 34, CAPS); text('NORTH AFRICA AMERICAN CEMETERY', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      font(400, 24); text('Carthage, Tunisia', CX, 134, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 5.0, 5.6) * (1 - seg(t, 9.2, 9.6)), () => {
      ctx.fillStyle = 'rgba(16,32,28,0.9)'; k.rrect(500, 560, 300, 180, 14); ctx.fill();
      font(700, 52, CAPS); text(`${ACRES}`, 650, 610, { align: 'center', base: 'middle', color: C.gold });
      font(400, 22); text('acres', 650, 650, { align: 'center', base: 'middle', color: C.soft });
      text('more than 2,800 dead', 650, 700, { align: 'center', base: 'middle', color: C.ink });
    });
    A(seg(t, 9.6, 10.2), () => {
      ctx.fillStyle = 'rgba(16,32,28,0.9)'; k.rrect(470, 560, 340, 190, 14); ctx.fill();
      font(700, 30, CAPS); text('1948', 640, 600, { align: 'center', base: 'middle', color: C.gold });
      font(400, 22); text('temporary graves gathered', 640, 640, { align: 'center', base: 'middle', color: C.ink });
      text('from across North Africa', 640, 670, { align: 'center', base: 'middle', color: C.ink });
      text('land given by Tunisia, for ever', 640, 712, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- B: the plan ----------
// plan coordinates: graves area 3×3 plots above a mall; memorial at the west end; tablets on the mall's south side
const PX0 = 150, PY0 = 200, PW = 170, PH = 120, PG = 22;
const plotXY = (i) => [PX0 + (i % 3) * (PW + PG), PY0 + (2 - Math.floor(i / 3)) * (PH + PG)]; // A B C at the bottom
const MALL_Y = PY0 + 3 * (PH + PG) + 6;
function headstone(x, y, s, star) {
  ctx.fillStyle = C.marble;
  if (star) {
    const r = 6 * s;
    for (const off of [0, Math.PI]) { ctx.beginPath(); for (let j = 0; j < 3; j++) { const a = off - Math.PI / 2 + (j * TAU) / 3; j ? ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); ctx.fill(); }
  } else {
    ctx.fillRect(x - 1.6 * s, y - 7 * s, 3.2 * s, 14 * s); ctx.fillRect(x - 5 * s, y - 3.5 * s, 10 * s, 3 * s);
  }
}
function plan(t, a, { build = 1, wall = 0, stones = 1 } = {}) {
  A(a, () => {
    ctx.fillStyle = C.lawn; k.rrect(PX0 - 30, PY0 - 30, 3 * PW + 2 * PG + 60, 3 * (PH + PG) + 30, 10); ctx.fill();
    for (let i = 0; i < 9; i++) {
      const [x, y] = plotXY(i), on = clamp(build * 9 - i);
      A(on, () => {
        ctx.fillStyle = C.lawn2; ctx.fillRect(x, y, PW, PH);
        // rows of headstones, schematic
        A(stones, () => { for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) headstone(x + 12 + c * 18.5, y + 16 + r * 21, 0.9, (i * 45 + r * 9 + c) % 50 === 7); });
        font(700, 30, CAPS); ctx.globalAlpha *= 0.85; text('ABCDEFGHI'[i], x + PW / 2, y + PH / 2, { align: 'center', base: 'middle', color: C.gold }); ctx.globalAlpha /= 0.85;
      });
    }
    // pools where the paths cross
    for (const [i, j] of [[1, 1], [2, 1], [1, 2], [2, 2]]) {
      const x = PX0 + i * (PW + PG) - PG / 2, y = PY0 + j * (PH + PG) - PG / 2;
      A(seg(build, 0.9, 1), () => { ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); });
    }
    // the mall with the tablets wall on its south side, the memorial at the west end
    ctx.fillStyle = C.path; ctx.fillRect(PX0 - 30, MALL_Y, 3 * PW + 2 * PG + 60, 40);
    ctx.fillStyle = mix('#cfc8b8', '#d9b45a', wall); ctx.fillRect(PX0 - 30, MALL_Y + 40, 3 * PW + 2 * PG + 60, 12);
    ctx.fillStyle = C.stone; ctx.fillRect(PX0 - 104, MALL_Y - 30, 70, 110);
    font(600, 22, CAPS); text('MEMORIAL', PX0 - 70, MALL_Y + 104, { align: 'center', base: 'middle', color: C.soft });
    font(400, 22); text('N ↑', 790, PY0 - 2, { align: 'center', base: 'middle', color: C.soft });
  });
}
function scenePlan(t) {
  A(span(t, 14.0, 23.4, 0.4, 0.4), () => {
    font(700, 32, CAPS); text('NINE PLOTS, STRAIGHT LINES', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
    plan(t, 1, { build: eout(seg(t, 14.2, 16.6)) });
    // crosses and stars of David
    A(seg(t, 18.8, 19.4), () => {
      ctx.fillStyle = 'rgba(16,32,28,0.92)'; k.rrect(112, 300, 640, 300, 16); ctx.fill();
      font(700, 50, CAPS); text(Kit.fmt(Math.round(HEADSTONES * eout(seg(t, 18.9, 20.4)))), CX, 360, { align: 'center', base: 'middle', color: C.ink });
      font(400, 24); text('headstones', CX, 402, { align: 'center', base: 'middle', color: C.soft });
      const L = 172, R = 692, wC = (R - L) * CROSSES / HEADSTONES;
      const g = eio(seg(t, 19.6, 21.0));
      ctx.fillStyle = C.marble; ctx.fillRect(L, 440, wC * g, 34);
      ctx.fillStyle = C.gold; ctx.fillRect(L + wC, 440, (R - L - wC) * g, 34);
      headstone(L + 20, 520, 2.6, false); font(600, 26); text(`${Kit.fmt(CROSSES)}`, L + 48, 520, { align: 'left', base: 'middle', color: C.ink });
      font(400, 22); text('Latin crosses', L + 48, 556, { align: 'left', base: 'middle', color: C.soft });
      headstone(R - 150, 520, 2.6, true); font(600, 26); text(`${STARS}`, R - 120, 520, { align: 'left', base: 'middle', color: C.gold });
      font(400, 22); text('Stars of David', R - 120, 556, { align: 'left', base: 'middle', color: C.soft });
    });
  });
}

// ---------- C: who; the tablets of the missing ----------
function sceneMissing(t) {
  A(span(t, 23.2, 41.8, 0.4, 0.4), () => {
    // where they served: North Africa to the Persian Gulf, a schematic band
    A(seg(t, 23.4, 24.0) * (1 - seg(t, 27.6, 28.0)), () => {
      font(700, 30, CAPS); text('FROM NORTH AFRICA TO THE PERSIAN GULF', CX, 92, { align: 'center', base: 'middle', color: C.ink });
      const pts = [[90, 420, 'Casablanca'], [240, 380, 'Algiers'], [370, 370, 'Tunis'], [560, 430, 'Cairo'], [760, 470, 'Persian Gulf']];
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
      pts.forEach(([x, y, s], i) => A(seg(t, 24.0 + i * 0.4, 24.4 + i * 0.4), () => {
        ctx.fillStyle = C.marble; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
        font(600, 22); text(s, x, y + (i % 2 ? -32 : 34), { align: 'center', base: 'middle', color: C.ink });
      }));
      font(400, 22); text('campaigns and supply routes, schematic', CX, 600, { align: 'center', base: 'middle', color: C.soft });
    });
    // the wall
    A(seg(t, 28.0, 28.6), () => {
      font(700, 32, CAPS); text('THE TABLETS OF THE MISSING', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      const L = 60, R = 804, y0 = 260, hW = 300;
      const grow = eio(seg(t, 28.2, 30.6));
      ctx.fillStyle = C.stone; ctx.fillRect(L, y0, (R - L) * grow, hW);
      // panels of names, abstract lines
      const cols = 12;
      for (let c = 0; c < cols; c++) {
        const x = L + 12 + c * ((R - L - 24) / cols);
        if (x > L + (R - L) * grow - 20) continue;
        for (let r = 0; r < 22; r++) {
          ctx.fillStyle = 'rgba(60,56,48,0.55)';
          ctx.fillRect(x, y0 + 16 + r * 12.6, ((R - L - 24) / cols) - 14 - ((c * 7 + r * 3) % 9) * 2, 4);
        }
      }
      // rosettes on a few names
      A(seg(t, 37.4, 38.0), () => {
        for (const [c, r] of [[1, 4], [3, 15], [6, 9], [8, 18], [10, 2]]) {
          const x = L + 6 + c * ((R - L - 24) / cols), y = y0 + 18 + r * 12.6;
          ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 7 + Math.sin(t * 4 + c) * 0.8, 0, TAU); ctx.fill();
        }
        font(400, 24); text('a rosette: found and identified since', CX, 720, { align: 'center', base: 'middle', color: C.gold });
      });
      // a person for scale, and the length
      A(seg(t, 29.6, 30.2), () => {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(R - 30, y0 + hW - 74, 7, 0, TAU); ctx.fill(); k.rrect(R - 37, y0 + hW - 66, 14, 40, 5); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, y0 + hW + 30); ctx.lineTo(R, y0 + hW + 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(L, y0 + hW + 22); ctx.lineTo(L, y0 + hW + 38); ctx.moveTo(R, y0 + hW + 22); ctx.lineTo(R, y0 + hW + 38); ctx.stroke();
        font(600, 24); text('364 feet, about 111 metres', CX, y0 + hW + 58, { align: 'center', base: 'middle', color: C.ink });
      });
      A(seg(t, 32.8, 33.4) * (1 - seg(t, 37.0, 37.4)), () => {
        ctx.fillStyle = 'rgba(16,32,28,0.92)'; k.rrect(132, 380, 600, 150, 16); ctx.fill();
        font(700, 56, CAPS); text(Kit.fmt(Math.round(MISSING * eout(seg(t, 32.9, 34.6)))), CX, 436, { align: 'center', base: 'middle', color: C.gold });
        font(400, 24); text('names: missing on land, at sea, in the air', CX, 492, { align: 'center', base: 'middle', color: C.ink });
      });
    });
  });
}

// ---------- D: maps, Honor, Draper, brothers ----------
function honor(x, y, s) {
  // a standing figure on a pedestal, holding out a wreath; plain shapes
  ctx.fillStyle = C.stone; ctx.fillRect(x - 60 * s, y, 120 * s, 70 * s);
  ctx.fillStyle = C.marble;
  ctx.beginPath(); ctx.arc(x, y - 190 * s, 18 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 30 * s, y); ctx.lineTo(x - 22 * s, y - 165 * s); ctx.lineTo(x + 22 * s, y - 165 * s); ctx.lineTo(x + 34 * s, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.marble; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 18 * s, y - 150 * s); ctx.lineTo(x + 80 * s, y - 175 * s); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.strokeStyle = C.gold; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.arc(x + 100 * s, y - 180 * s, 22 * s, 0, TAU); ctx.stroke();
}
function sceneMemorial(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    // the map room: a mosaic map, tiles
    A(seg(t, 41.8, 42.4) * (1 - seg(t, 46.0, 46.4)), () => {
      font(700, 32, CAPS); text('THE MAP ROOM', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(400, 22); text('maps in mosaic and ceramic, from the 1942 landings to May 1943', CX, 134, { align: 'center', base: 'middle', color: C.soft });
      const tile = 22;
      for (let y = 190; y < 720; y += tile) for (let x = 70; x < 794; x += tile) {
        const land = y > 330 + 60 * Math.sin(x / 140) && !(x > 560 && y < 400);
        const n = (x * 13 + y * 7) % 5;
        ctx.fillStyle = land ? ['#c9bc9c', '#bfb08d', '#d3c7a9', '#c4b593', '#cabd9e'][n] : ['#2c5d7c', '#336a8b', '#285573', '#3b7397', '#2f6283'][n];
        ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      }
      const arrows = [[[110, 300], [180, 380]], [[300, 280], [330, 360]], [[420, 260], [470, 340]], [[760, 560], [600, 420]]];
      arrows.forEach(([[x0, y0], [x1, y1]], i) => A(seg(t, 42.6 + i * 0.5, 43.2 + i * 0.5), () => {
        ctx.strokeStyle = i === 3 ? '#8a2f2f' : C.gold; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }));
    });
    // Honor
    A(seg(t, 46.4, 47.0) * (1 - seg(t, 50.6, 51.0)), () => {
      font(700, 32, CAPS); text('HONOR', CX, 92, { align: 'center', base: 'middle', color: C.gold, spacing: '4px' });
      honor(CX - 40, 580, 1.7);
      font(400, 24, TEXT); text('“honor to them that trod the path of honor”', CX, 740, { align: 'center', base: 'middle', color: C.soft });
    });
    // Draper and the brothers
    A(seg(t, 51.0, 51.6), () => {
      font(700, 32, CAPS); text('AMONG THE DEAD', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      ctx.fillStyle = C.marble; k.rrect(CX - 110, 220, 220, 300, 110); ctx.fill(); ctx.fillRect(CX - 110, 330, 220, 190);
      font(700, 22, CAPS); text('FOY DRAPER', CX, 300, { align: 'center', base: 'middle', color: '#2b2b2b' });
      font(400, 20, TEXT); text('Captain', CX, 336, { align: 'center', base: 'middle', color: '#2b2b2b' });
      font(400, 22, TEXT); text('1936 Olympics: the winning US relay team', CX, 580, { align: 'center', base: 'middle', color: C.ink });
      A(seg(t, 53.0, 53.6), () => {
        for (let p = 0; p < 4; p++) for (let j = 0; j < 2; j++) headstone(240 + p * 120 + j * 30, 680, 2.4, false);
        font(400, 24, TEXT); text('four pairs of brothers lie here', CX, 740, { align: 'center', base: 'middle', color: C.soft });
      });
    });
  });
}

// ---------- E: visiting ----------
function sceneVisit(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    font(700, 32, CAPS); text('VISITING TODAY', CX, 92, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    // a week strip: open every day; two dates closed
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = 'rgba(16,32,28,0.85)'; k.rrect(92, 170, 680, 220, 16); ctx.fill();
      font(700, 30, CAPS); text('FREE · EVERY DAY', CX, 220, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
      font(400, 24); text('closed only on 25 December and 1 January', CX, 266, { align: 'center', base: 'middle', color: C.ink });
      text('staff take families to a grave', CX, 304, { align: 'center', base: 'middle', color: C.soft });
      text('last entry 4:45 p.m.', CX, 342, { align: 'center', base: 'middle', color: C.soft });
    });
    // the TGM line
    A(seg(t, 60.2, 60.8), () => {
      const y = 560, L = 130, R = 640;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      ctx.fillStyle = C.ink; for (const x of [L, R]) { ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill(); }
      font(600, 23); text('Tunis Marine', L, y - 40, { align: 'center', base: 'middle', color: C.ink });
      text('Carthage-Amilcar', R, y - 40, { align: 'center', base: 'middle', color: C.ink });
      font(400, 22); text('TGM train, about 30 minutes', (L + R) / 2, y + 40, { align: 'center', base: 'middle', color: C.soft });
      const u = eio(seg(t, 60.8, 62.6));
      ctx.fillStyle = C.gold; k.rrect(lerp(L, R, u) - 30, y - 14, 60, 28, 8); ctx.fill();
      // the walk
      A(seg(t, 62.6, 63.2), () => {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(R, y); ctx.lineTo(760, 680); ctx.stroke(); ctx.setLineDash([]);
        headstone(760, 700, 2.4, false);
        font(400, 22); text('700 m on foot', 640, 680, { align: 'right', base: 'middle', color: C.gold });
      });
    });
  });
}
function mix(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}

const CUES = [
  [0.4, 4.8, 'At *Carthage*, Tunisia, beside the ruins of the ancient city, lies the North Africa American Cemetery.'],
  [5.0, 9.4, 'Its 27 acres hold more than 2,800 American dead of the Second World War.'],
  [9.6, 14.0, 'It was set up in *1948*, gathering temporary graves from across North Africa, on land Tunisia gave free.'],
  [14.2, 18.6, 'The headstones stand in straight lines, in nine plots, with pools where the paths cross.'],
  [18.8, 23.2, 'Of its *2,833* headstones, 2,777 are Latin crosses and ~56 are Stars of David~.'],
  [23.4, 27.8, 'Most of those honoured here died in campaigns and supply work from North Africa to the Persian Gulf.'],
  [28.0, 32.4, 'Along the mall runs a wall *364 feet* long: the Tablets of the Missing.'],
  [32.6, 37.0, 'It names *3,724* men missing in the region, on land, at sea and in the air.'],
  [37.2, 41.6, 'A ~rosette~ beside a name means that man has since been found and identified.'],
  [41.8, 46.2, 'In the memorial, maps in mosaic and ceramic trace the campaign from November 1942 to May 1943.'],
  [46.4, 50.8, 'A statue called *Honor* holds out a laurel wreath to those who gave their lives.'],
  [51.0, 55.4, 'Among the dead: Captain Foy Draper, a 1936 Olympic relay champion, and four pairs of brothers.'],
  [55.6, 60.0, 'Entry is free, every day but 25 December and 1 January. Staff guide families to a grave.'],
  [60.2, 64.6, 'From Tunis, the TGM train reaches Carthage-Amilcar in about 30 minutes; then 700 metres on foot.'],
];

let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sky2); lg.addColorStop(1, C.sky1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [CAPS, TEXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    scenePlan(t);
    sceneMissing(t);
    sceneMemorial(t);
    sceneVisit(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TEXT, ink: C.ink, marks: { '*': C.gold, '~': C.water } });
  },
});
