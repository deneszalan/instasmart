// Explainer for politics-moncef-bey-deposed-1943 (Tunisia 1943): Moncef Bey, the Bey of Tunis from 19 June 1942 to
// 14 May 1943, reigned over a French protectorate through the war and the Axis occupation, stalled anti-Jewish laws,
// was deposed by the French and died in exile. Look: a midnight-blue night with a gold border of eight-pointed stars
// (a tile motif), decrees as cream sheets waiting for a red seal, a balance of power between the Bey and the French
// resident-general, and a schematic map of the western Mediterranean for the exile. No Arabic script (the fonts lack
// it). Cormorant Garamond for titles, Alegreya Sans for the captions and labels.
//
// Facts:
// - USHMM, Holocaust Encyclopedia, "Anti-Jewish Legislation in North Africa": Tunisia was a French protectorate,
//   French rule worked through the resident-general while local monarchs held nominal authority; Tunisian Jews were
//   subjects of the bey; local leaders including Moncef Bey "intentionally stalled anti-Jewish legislation"; the bey's
//   "authority was restricted by the protectorate"; after the German occupation the Germans compelled Jews to wear
//   the yellow star, confiscated property and drafted Jewish men into forced labour.
// - USHMM collections, photo record of Dr Emile Fellous (pa1167873): "In June 19, 1942 Moncef Bey succeeded his
//   cousin Ahmed II Bey"; he "heeded entreaties from the Jewish community and postponed evictions and
//   'Aryanization'"; he intervened when the German commander wanted to requisition Dr Fellous's house and car; he
//   "died in exile in September 1, 1948 in Pau, France".
// - FRUS 1943 vol. II, doc. 258 (North African Economic Board, 15 June 1943): on 6 December 1942 the Germans demanded
//   2,000 Jewish workers, about 4,000 were supplied; on 22 December a levy of 20,000,000 francs.
// - Kapitalis (K. Mestiri, 1 September 2017): a memorandum of sixteen demands in August 1942; on 1 January 1943 he
//   named M'hamed Chenik prime minister; deposed by General Juin on General Giraud's orders on 14 May 1943, flown from
//   El Aouina; accused of collaboration with the Axis; Juin's memoirs found "aucun grief sérieux"; exile at Laghouat,
//   then Ténès, then Pau from October 1945; died 1 September 1948; buried at the Djellaz cemetery.
// - Webdo (M. Charfeddine, Tunis-Hebdo, 2018), from Juin's Mémoires: nothing "de grave à reprocher"; Laghouat,
//   then Ténès, then Pau. Webdo (H. Bourial, 1 September 2023): reigned 19 June 1942 – 14 May 1943; Pau, Villa
//   Cadaval, from 17 October 1945; "le bey du peuple".
// - CVCE (University of Luxembourg): deposed on the ground that he had collaborated with the Germans; succeeded by
//   Lamine Bey.
// Computed here: 329 days on the throne, 1,937 days in exile.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Tunis, 19 June 1942; the Bey signs, the French resident-general rules.
//  B  9.6–23.2  Reforms asked; November 1942, the Axis occupies Tunis and the east; a Tunisian government.
//  C 23.4–41.6  Persecution of the Jews; laws stalled at the Bey's seal; his power limited.
//  D 41.8–55.4  May 1943: the Axis surrenders; the French depose him; Juin's verdict.
//  E 55.6–64.6  Exile: Laghouat, Ténès, Pau; death in 1948; buried in Tunis.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#15203a', bg2: '#0b1222', ink: '#f6efe0', soft: 'rgba(246,239,224,0.74)', faint: 'rgba(246,239,224,0.22)',
  gold: '#d9b45a', goldDim: 'rgba(217,180,90,0.35)', red: '#d2483a', paper: '#efe6d2', paperInk: '#2a2433', blue: '#8fb4e8',
  axis: '#c9634f', sea: '#1d2c4d', land: '#2c3a5a', panel: 'rgba(8,13,26,0.84)',
};
const TITLE = 'Cormorant Garamond', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the dates ----------
const DAY = 864e5;
const D = (y, m, d) => Date.UTC(y, m - 1, d);
const ACCESSION = D(1942, 6, 19), DEPOSED = D(1943, 5, 14), PAU = D(1945, 10, 17), DEATH = D(1948, 9, 1);
const REIGN_DAYS = (DEPOSED - ACCESSION) / DAY, EXILE_DAYS = (DEATH - DEPOSED) / DAY;
if (REIGN_DAYS !== 329 || EXILE_DAYS !== 1937) throw new Error('dates');

// ---------- a schematic map of the western Mediterranean ----------
const P = (lon, lat) => [90 + (lon + 2) * 50, 150 + (45 - lat) * 46];
const AFRICA = [[-2, 34.9], [-1, 35.3], [0.1, 35.9], [1.3, 36.5], [3.0, 36.8], [5.1, 36.8], [7.7, 36.9], [9.0, 37.2], [9.9, 37.3], [10.3, 36.9], [11.05, 37.05], [10.6, 36.4], [10.8, 35.8], [11.1, 35.2], [10.1, 34.2], [10.2, 33.8], [11.1, 33.3], [12, 32.9]];
const EUROPE = [[-2, 36.8], [-0.6, 37.6], [-0.3, 38.6], [0.2, 38.8], [-0.3, 39.5], [0.9, 40.9], [3.2, 41.9], [3.1, 42.5], [4.0, 43.5], [5.4, 43.2], [7.4, 43.7], [8.9, 44.4], [10.2, 43.9], [10.5, 42.9], [11.1, 42.4], [12, 41.8]];
const PLACES = { tunis: [10.18, 36.80], laghouat: [2.88, 33.80], tenes: [1.31, 36.51], pau: [-0.37, 43.30] };
const XY = Object.fromEntries(Object.entries(PLACES).map(([n, [lo, la]]) => [n, P(lo, la)]));

function map(a, { occupied = 0 } = {}) {
  A(a, () => {
    ctx.save();
    k.rrect(90, 150, 700, 610, 16); ctx.fillStyle = C.sea; ctx.fill(); ctx.clip();
    // land: Africa below its coast, Europe above its coast
    const fill = (pts, toY) => {
      ctx.beginPath(); ctx.moveTo(P(...pts[0])[0], toY);
      for (const p of pts) ctx.lineTo(...P(...p));
      ctx.lineTo(P(...pts.at(-1))[0], toY); ctx.closePath();
      ctx.fillStyle = C.land; ctx.fill();
      ctx.strokeStyle = C.goldDim; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.stroke();
    };
    fill(AFRICA, 770); fill(EUROPE, 140);
    // Corsica and Sardinia, roughly
    ctx.fillStyle = C.land;
    for (const [lo, la, rx, ry] of [[9.05, 42.15, 0.35, 0.55], [9.0, 40.05, 0.55, 0.95]]) { ctx.beginPath(); ctx.ellipse(...P(lo, la), rx * 50, ry * 46, 0, 0, TAU); ctx.fill(); }
    // the Algerian–Tunisian border, dashed
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.moveTo(...P(8.6, 36.9)); ctx.lineTo(...P(8.3, 35.6)); ctx.lineTo(...P(7.9, 33.8)); ctx.lineTo(...P(9.0, 32.2)); ctx.stroke(); ctx.setLineDash([]);
    // the Axis-occupied north-east of Tunisia, November 1942 – May 1943 (schematic)
    if (occupied > 0) A(occupied, () => {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(...P(8.75, 37.0)); ctx.lineTo(...P(9.9, 37.3)); ctx.lineTo(...P(10.3, 36.9)); ctx.lineTo(...P(11.05, 37.05)); ctx.lineTo(...P(10.6, 36.4)); ctx.lineTo(...P(10.8, 35.8)); ctx.lineTo(...P(11.1, 35.2)); ctx.lineTo(...P(10.1, 34.2)); ctx.lineTo(...P(10.2, 33.8)); ctx.lineTo(...P(9.4, 33.9)); ctx.lineTo(...P(9.6, 35.5)); ctx.lineTo(...P(8.75, 36.5)); ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = C.axis; ctx.lineWidth = 4;
      for (let i = -40; i < 60; i++) { const x0 = P(8, 38)[0] + i * 12; ctx.beginPath(); ctx.moveTo(x0, P(0, 38)[1]); ctx.lineTo(x0 + 220, P(0, 33)[1]); ctx.stroke(); }
      ctx.restore();
    });
    ctx.restore();
    ctx.strokeStyle = C.goldDim; ctx.lineWidth = 2; k.rrect(90, 150, 700, 610, 16); ctx.stroke();
    font(600, 22); text('Schematic map', 104, 740, { color: C.soft });
  });
}
function place(n, name, { dx = 14, dy = 0, align = 'left', col = C.ink } = {}) {
  const [x, y] = XY[n];
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
  font(700, 25); text(name, x + dx, y + dy, { align, color: col });
}

// ---------- the tile border: eight-pointed stars ----------
function star(x, y, r, col, lw = 2) {
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (const rot of [0, Math.PI / 4]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; const px = x + Math.cos(a) * r * 0.72, py = y + Math.sin(a) * r * 0.72; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.stroke();
  }
}

/** A simple, respectful figure of the Bey: a standing silhouette with a tall fez. */
function figure(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(x, y - 108 * s, 22 * s, 26 * s, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 17 * s, y - 128 * s); ctx.lineTo(x - 14 * s, y - 160 * s); ctx.lineTo(x + 14 * s, y - 160 * s); ctx.lineTo(x + 17 * s, y - 128 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 48 * s, y); ctx.quadraticCurveTo(x - 50 * s, y - 70 * s, x - 18 * s, y - 80 * s); ctx.lineTo(x + 18 * s, y - 80 * s); ctx.quadraticCurveTo(x + 50 * s, y - 70 * s, x + 48 * s, y); ctx.closePath(); ctx.fill();
}

/** A decree: a cream sheet with lines of text, and an empty or sealed seal ring. */
function decree(x, y, w, h, { title = 'DECREE', sealed = 0, ring = 1 } = {}) {
  ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 6); ctx.fill();
  font(700, 20, SANS); text(title, x + w / 2, y + 26, { align: 'center', color: C.paperInk, spacing: '2px' });
  ctx.fillStyle = 'rgba(42,36,51,0.25)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 16, y + 48 + i * 15, (w - 32) * (i === 3 ? 0.6 : 1), 6);
  const sx = x + w - 34, sy = y + h - 30;
  A(ring, () => { ctx.strokeStyle = 'rgba(210,72,58,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(sx, sy, 18, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
  if (sealed > 0) A(sealed, () => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(sx, sy, 18, 0, TAU); ctx.fill(); star(sx, sy, 15, C.paper, 1.5); });
}

// ---------- A: the protectorate ----------
function sceneThrone(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(600, 50, TITLE); text('Moncef Bey', CX, 120, { align: 'center', color: C.gold });
    font(500, 25); text('Bey of Tunis from 19 June 1942', CX, 168, { align: 'center', color: C.soft });
    A(1 - seg(t, 4.8, 5.4), () => figure(CX, 640, 2.2, 'rgba(217,180,90,0.85)'));
    // the balance of power (cue 2)
    A(seg(t, 5.2, 6.0), () => {
      const bx = [CX - 190, CX + 190];
      figure(bx[0], 520, 1.3, C.gold);
      font(700, 27); text('The Bey of Tunis', bx[0], 580, { align: 'center', color: C.gold });
      font(500, 23); text('signs the decrees', bx[0], 614, { align: 'center', color: C.soft });
      // the resident-general: a peaked cap silhouette
      ctx.fillStyle = C.blue;
      ctx.beginPath(); ctx.ellipse(bx[1], 412, 22 * 1.3, 26 * 1.3, 0, 0, TAU); ctx.fill();
      ctx.fillRect(bx[1] - 30, 366, 60, 16); ctx.fillRect(bx[1] - 38, 380, 76, 6);
      ctx.beginPath(); ctx.moveTo(bx[1] - 62, 520); ctx.quadraticCurveTo(bx[1] - 65, 429, bx[1] - 23, 416); ctx.lineTo(bx[1] + 23, 416); ctx.quadraticCurveTo(bx[1] + 65, 429, bx[1] + 62, 520); ctx.closePath(); ctx.fill();
      font(700, 27); text('French resident-general', bx[1], 580, { align: 'center', color: C.blue });
      font(500, 23); text('holds the real power', bx[1], 614, { align: 'center', color: C.soft });
      // a scale tipped to the French side
      const tilt = -0.16 * eio(seg(t, 6.2, 7.4));
      ctx.save(); ctx.translate(CX, 300); ctx.rotate(-tilt);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(150, 0); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(CX, 300); ctx.lineTo(CX - 16, 330); ctx.lineTo(CX + 16, 330); ctx.fill();
      font(600, 23); text('a French protectorate since 1881', CX, 690, { align: 'center', color: C.gold });
    });
  });
}

// ---------- B: reforms, occupation, a Tunisian government ----------
function sceneWar(t) {
  A(span(t, 9.4, 23.4, 0.4, 0.4), () => {
    // cue 3: the demands of August 1942
    A(span(t, 9.4, 14.2, 0.3, 0.3), () => {
      font(600, 40, TITLE); text('August 1942', CX, 150, { align: 'center', color: C.gold });
      font(500, 24); text('demands sent to Vichy France', CX, 192, { align: 'center', color: C.soft });
      const items = ['Tunisians in the top posts', 'a say in making laws', 'Arabic taught in schools'];
      items.forEach((s, i) => A(seg(t, 10.4 + i * 0.6, 11.0 + i * 0.6), () => {
        ctx.fillStyle = C.panel; k.rrect(170, 270 + i * 110, W - 340, 84, 14); ctx.fill();
        ctx.strokeStyle = C.goldDim; ctx.lineWidth = 2; ctx.stroke();
        star(214, 312 + i * 110, 18, C.gold);
        font(600, 28); text(s, 250, 312 + i * 110, { color: C.ink });
      }));
      A(seg(t, 12.6, 13.2), () => { font(500, 24); text('none was granted', CX, 640, { align: 'center', color: C.red }); });
    });
    // cue 4: November 1942, the Axis occupies Tunis and the east
    A(span(t, 14.0, 18.8, 0.4, 0.3), () => {
      map(1, { occupied: seg(t, 14.8, 15.8) });
      place('tunis', 'Tunis', { dx: -14, dy: -26, align: 'right' });
      A(seg(t, 15.4, 16.0), () => {
        ctx.fillStyle = C.panel; k.rrect(440, 600, 360, 120, 14); ctx.fill();
        font(700, 27); text('Axis occupation', 620, 636, { align: 'center', color: C.axis });
        font(500, 23); text('November 1942 – May 1943', 620, 674, { align: 'center', color: C.ink });
        text('Tunis, Bizerte and the east', 620, 704, { align: 'center', color: C.soft });
      });
    });
    // cue 5: a Tunisian government, 1 January 1943
    A(span(t, 18.6, 23.4, 0.4, 0.4), () => {
      font(600, 40, TITLE); text('1 January 1943', CX, 150, { align: 'center', color: C.gold });
      font(500, 24); text('a government of Tunisians', CX, 192, { align: 'center', color: C.soft });
      font(600, 30); text('Prime minister M’hamed Chenik', CX, 270, { align: 'center', color: C.ink });
      for (let i = 0; i < 5; i++) A(seg(t, 19.4 + i * 0.15, 19.8 + i * 0.15), () => figure(CX + (i - 2) * 120, 560, 0.95, i === 2 ? C.gold : 'rgba(246,239,224,0.55)'));
    });
  });
}

// ---------- C: the persecution, and the Bey's seal ----------
function sceneSeal(t) {
  A(span(t, 23.4, 41.8, 0.4, 0.4), () => {
    // cue 6: what the German occupiers did (word list, no images of violence)
    A(span(t, 23.4, 28.2, 0.3, 0.3), () => {
      font(600, 36, TITLE); text('Under German occupation', CX, 150, { align: 'center', color: C.axis });
      const rows = [['forced labour', 'about 4,000 Jewish men, from December 1942'], ['fines', 'a levy of 20 million francs on 22 December 1942'], ['seizures', 'homes, cars, radios and goods taken']];
      rows.forEach(([a, b], i) => A(seg(t, 24.2 + i * 0.7, 24.8 + i * 0.7), () => {
        ctx.fillStyle = C.panel; k.rrect(110, 230 + i * 130, W - 220, 104, 14); ctx.fill();
        font(700, 30); text(a, 140, 266 + i * 130, { color: C.ink });
        font(500, 23); text(b, 140, 304 + i * 130, { color: C.soft });
      }));
    });
    // cues 7–8: the decrees waiting for the seal
    A(span(t, 28.0, 37.4, 0.4, 0.4), () => {
      figure(170, 620, 1.2, C.gold);
      font(700, 25); text('Moncef Bey', 170, 660, { align: 'center', color: C.gold });
      const n = 4;
      for (let i = 0; i < n; i++) {
        const arrive = eout(seg(t, 28.6 + i * 0.5, 29.6 + i * 0.5));
        const x = lerp(W + 40, 330 + i * 26, arrive), y = 280 + i * 30;
        decree(x, y, 230, 150, { title: 'ANTI-JEWISH LAW', ring: 1 });
      }
      // an hourglass: stalled
      A(seg(t, 31.0, 31.8), () => {
        const hx = 470, hy = 210, flip = (t * 0.6) % 1;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(hx - 22, hy - 30); ctx.lineTo(hx + 22, hy - 30); ctx.lineTo(hx - 22, hy + 30); ctx.lineTo(hx + 22, hy + 30); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(hx - 16 + flip * 14, hy - 24 + flip * 22); ctx.lineTo(hx + 16 - flip * 14, hy - 24 + flip * 22); ctx.lineTo(hx, hy - 2); ctx.fill();
        font(700, 26); text('stalled', hx + 40, hy, { color: C.gold });
      });
      A(seg(t, 33.0, 33.8), () => {
        ctx.fillStyle = C.panel; k.rrect(300, 560, 500, 110, 14); ctx.fill();
        font(600, 24); text('evictions and “Aryanization”', 550, 598, { align: 'center', color: C.ink });
        text('postponed when the community asked', 550, 632, { align: 'center', color: C.soft });
        font(500, 21); text('US Holocaust Memorial Museum', 550, 700, { align: 'center', color: C.soft });
      });
    });
    // cue 9: but his power was limited
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      // nested circles: the occupation around the protectorate around the Bey's own authority
      const g = eout(seg(t, 37.4, 38.6));
      ctx.save(); ctx.beginPath(); ctx.arc(CX, 420, 260 * g, 0, TAU); ctx.clip();
      ctx.strokeStyle = 'rgba(201,99,79,0.45)'; ctx.lineWidth = 3;
      for (let i = -30; i < 30; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 18, 140); ctx.lineTo(CX + i * 18 + 300, 700); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(CX, 420, 170 * g, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.blue; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(CX, 430, 70 * g, 0, TAU); ctx.stroke();
      figure(CX, 470, 0.62, C.gold);
      A(seg(t, 38.4, 39.0), () => {
        font(600, 23); text('the Bey', CX, 520, { align: 'center', color: C.gold });
        text('French protectorate', CX, 300, { align: 'center', color: C.blue });
        text('German occupation', CX, 196, { align: 'center', color: C.axis });
      });
      A(seg(t, 39.2, 39.8), () => { font(600, 30, TITLE); text('a power held within limits', CX, 718, { align: 'center', color: C.ink }); });
    });
  });
}

// ---------- D: deposed ----------
function sceneDeposed(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    // cue 10: May 1943
    A(span(t, 41.6, 46.4, 0.3, 0.3), () => {
      map(1, { occupied: 1 - seg(t, 42.6, 44.2) });
      place('tunis', 'Tunis', { dx: -14, dy: -26, align: 'right' });
      ctx.fillStyle = C.panel; k.rrect(420, 610, 380, 100, 14); ctx.fill();
      font(700, 28); text('May 1943', 610, 644, { align: 'center', color: C.gold });
      font(500, 23); text('the Axis armies surrender', 610, 680, { align: 'center', color: C.ink });
    });
    // cue 11: 14 May 1943, deposed
    A(span(t, 46.2, 51.0, 0.3, 0.3), () => {
      font(600, 46, TITLE); text('14 May 1943', CX, 150, { align: 'center', color: C.gold });
      decree(CX - 160, 240, 320, 220, { title: 'DEPOSED', sealed: 0, ring: 0 });
      A(seg(t, 47.2, 47.6), () => { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(CX + 126, 430, 22, 0, TAU); ctx.fill(); });
      font(600, 25); text('by the French authorities in Algiers', CX, 520, { align: 'center', color: C.blue });
      text('under General Henri Giraud', CX, 554, { align: 'center', color: C.blue });
      A(seg(t, 48.0, 48.6), () => { font(600, 25); text('accused of collaborating with the Axis', CX, 630, { align: 'center', color: C.ink }); });
    });
    // cue 12: Juin's verdict
    A(span(t, 50.8, 55.6, 0.3, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 210, W - 180, 380, 18); ctx.fill();
      ctx.strokeStyle = C.goldDim; ctx.lineWidth = 2; ctx.stroke();
      font(600, 30, TITLE); text('General Alphonse Juin', CX, 270, { align: 'center', color: C.blue });
      font(500, 23); text('who carried out the deposition, later wrote', CX, 312, { align: 'center', color: C.soft });
      text('in his memoirs that he had found', CX, 344, { align: 'center', color: C.soft });
      font(600, 44, TITLE); text('nothing serious', CX, 424, { align: 'center', color: C.gold });
      text('against Moncef Bey', CX, 478, { align: 'center', color: C.gold });
    });
  });
}

// ---------- E: exile ----------
function sceneExile(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    map(1);
    const route = [XY.tunis, XY.laghouat, XY.tenes, XY.pau];
    const legs = [[56.0, 57.4], [57.6, 58.6], [58.8, 59.8]];
    place('tunis', 'Tunis', { dx: 0, dy: -28, align: 'center', col: C.gold });
    legs.forEach(([a, b], i) => {
      const g = eio(seg(t, a, b));
      if (g <= 0) return;
      const [x1, y1] = route[i], [x2, y2] = route[i + 1];
      const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15, my = (y1 + y2) / 2 - (x2 - x1) * 0.15;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 9]);
      ctx.beginPath(); ctx.moveTo(x1, y1);
      const N = 40;
      for (let j = 1; j <= N * g; j++) { const u = j / N; ctx.lineTo((1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2); }
      ctx.stroke(); ctx.setLineDash([]);
    });
    A(seg(t, 57.2, 57.6), () => place('laghouat', 'Laghouat, May 1943', { dx: 0, dy: 30, align: 'center' }));
    A(seg(t, 58.4, 58.8), () => place('tenes', 'Ténès', { dx: -14, dy: 0, align: 'right' }));
    A(seg(t, 59.6, 60.0), () => {
      place('pau', 'Pau, October 1945', { dx: 14, dy: 0 });
      font(600, 23); text('died there, 1 September 1948', XY.pau[0] + 14, XY.pau[1] + 34, { color: C.soft });
    });
    // home again: buried in Tunis
    A(seg(t, 60.6, 61.4), () => {
      const [tx, ty] = XY.tunis;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, ty, 18 + 2 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(470, 610, 340, 120, 14); ctx.fill();
      font(600, 26); text('buried in Tunis', 640, 646, { align: 'center', color: C.gold });
      font(500, 23); text('at the Djellaz cemetery', 640, 682, { align: 'center', color: C.ink });
      A(seg(t, 62.0, 62.6), () => { font(600, 23); text('“the people’s bey”', 640, 712, { align: 'center', color: C.gold }); });
    });
    // the days, counted
    A(seg(t, 56.4, 57.0), () => {
      ctx.fillStyle = C.panel; k.rrect(450, 170, 320, 112, 14); ctx.fill();
      // the number and the words drawn apart, so the words can be translated whatever the count
      const count = (num, words, y, col) => { const s = fmt(num); text(s, 470, y, { color: col }); text(words, 470 + ctx.measureText(s + ' ').width, y, { color: col }); };
      font(600, 23); count(REIGN_DAYS, 'days on the throne', 207, C.gold);
      count(Math.round(EXILE_DAYS * eio(seg(t, 56.6, 61.0))), 'days in exile', 247, C.ink);
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 360, 60, CX, 420, 760); rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}
function border() {
  // a frieze of small stars at the top and above the captions, like a tiled band
  for (const y of [42, 790]) for (let x = 24; x < W; x += 48) { if (y === 42 && x > 720) continue; star(x, y, 13, 'rgba(217,180,90,0.32)', 1.5); }
}

const CUES = [
  [0.4, 4.8, 'Tunis, 19 June 1942: *Moncef Bey* comes to the throne as the Bey of Tunis.'],
  [5.0, 9.4, 'Tunisia was a French protectorate: the Bey signed the laws, a French *resident-general* ruled.'],
  [9.6, 14.0, 'In August 1942 he asked Vichy France for reforms: *more Tunisians* in government.'],
  [14.2, 18.6, 'November 1942: German and Italian troops ~occupy~ Tunis and the east of the country.'],
  [18.8, 23.2, 'On 1 January 1943 he named a government of Tunisians under *M’hamed Chenik*.'],
  [23.4, 27.8, 'The Germans forced Jewish men into ~labour~, imposed fines and seized property.'],
  [28.0, 32.4, 'Laws needed the Bey’s signature, and local leaders, Moncef Bey among them, *stalled* anti-Jewish laws.'],
  [32.6, 37.0, 'When the Jewish community asked, he *postponed evictions* and the “Aryanization” of property.'],
  [37.2, 41.6, 'But the protectorate limited his power, and the persecution went on.'],
  [41.8, 46.2, 'May 1943: the German and Italian armies in Tunisia surrender; French rule returns.'],
  [46.4, 50.8, 'On 14 May the French ~deposed~ Moncef Bey, accusing him of collaborating with the Axis.'],
  [51.0, 55.4, 'General Alphonse Juin, who carried it out, later wrote that he found *nothing serious* against him.'],
  [55.6, 60.0, 'Flown to Laghouat in Algeria, then held at Ténès and in Pau, he *died in exile* in 1948.'],
  [60.2, 64.6, 'Buried in Tunis, he is remembered there as *“the people’s bey”*.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    border();
    sceneThrone(t);
    sceneWar(t);
    sceneSeal(t);
    sceneDeposed(t);
    sceneExile(t);
    k.captions(t, CUES, { x: W / 2, y: 862, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.axis } });
  },
});
