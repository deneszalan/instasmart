// Explainer for art-tunisian-victory-1944-film (Tunisia 1943): Tunisian Victory (1944), the joint British–American
// documentary of the campaign, made after a long fight over who would tell the story; much American footage was lost
// at sea, so scenes were re-created; it opened on 16 March 1944. Look: a dark cutting room, film strips and cans,
// British material in brass, American in steel blue; shot sheets in a typewriter face. No film stills are shown.
// Libre Franklin for headings and captions, Space Mono for labels on cans and shot sheets.
//
// Facts:
// - AFI Catalog, "Tunisian Victory" (1944): made after Brendan Bracken of the British Ministry of Information and
//   Elmer Davis of the US Office of War Information decided to co-produce a film of the North African campaign from
//   footage shot separately by British and American units; the British unit that had made Desert Victory was making a
//   documentary called Africa Freed; the combined staff of some 300 technicians, including 50 cameramen covering a
//   2,000-mile area, was led by Lt. Col. Hugh Stewart; Frank Capra supervised in the US; writers J. L. Hodson and
//   Capt. Anthony Veiller; besides its own footage it used newsreels, captured enemy film and other agencies' film;
//   Variety reported three cameramen killed and 300,000 feet of film shot; Capra and John Huston were assigned to
//   re-enact scenes in the Mojave Desert and Orlando, and "it is uncertain whether these scenes were included".
// - US National Archives, The Unwritten Record (A. Amidon and H. Holmstrom, 8 November 2017): Capra, Hollywood
//   director and colonel in the Army Signal Corps; "the Germans sank the ship carrying the footage"; Capra turned to
//   stock footage and re-creations; George Stevens, stationed in Algiers, spent two weeks filming tanks, artillery and
//   infantry at the coast; Huston filmed planes and dummy tanks in Orlando and the California desert with GIs; after a
//   months-long struggle between the British and American war information units over who would tell the story, Capra
//   gained full control and released it on 16 March 1944; alternating British and American narrators.
// - Imperial War Museums film record, "Tunisian Victory: an official record": 76 minutes, 6,871 ft, 35 mm; production
//   sponsors MOI and OWI; voices include Bernard Miles and Burgess Meredith, narrator Leo Genn; music by William Alwyn
//   and Dimitri Tiomkin; "much greater prominence to the American effort" than Africa Freed.
// - The Axis surrender in Tunisia was on 13 May 1943 (ABMC): ten months before the release.
//
// Scene plan (60.6 s, music track 89 s). Captions centred at y = 846.
//  A  0.0– 9.4  Desert Victory, 1943; Africa Freed in the making; the Americans want the story too.
//  B  9.6–18.6  Two ministries agree on one film; Capra and Stewart.
//  C 18.8–27.8  300 staff, 50 cameramen, 2,000 miles; footage lost at sea.
//  D 28.0–37.0  Re-creations: Stevens near Algiers; Huston in Florida and California.
//  E 37.2–51.0  Two soldiers' voices; the American weight; Capra takes control; 16 March 1944.
//  F 51.2–60.6  Ten months after the fighting; what the 76 minutes are made of.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#141416', bg2: '#1d1d22', film: '#2a2a30', hole: '#0e0e10', silver: '#d9cfb8', soft: 'rgba(217,207,184,0.72)',
  faint: 'rgba(217,207,184,0.20)', brass: '#d4a24c', steel: '#7fa7c9', sea: '#22384a', red: '#c8553d', paper: '#ece4d0', type: '#2b2b2b',
};
const HEAD = 'Libre Franklin', MONO = 'Space Mono';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.silver, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const STAFF = 300, CAMERAMEN = 50, FRONT_MI = 2000, SHOT_FT = 300000, FINAL_FT = 6871, MINUTES = 76;
const RELEASE = Date.UTC(1944, 2, 16), SURRENDER = Date.UTC(1943, 4, 13);
const MONTHS_AFTER = Math.round((RELEASE - SURRENDER) / (30.44 * 86400000));
if (MONTHS_AFTER !== 10 || Math.round(SHOT_FT / FINAL_FT) !== 44) throw new Error('numbers');

/** A horizontal strip of film with sprocket holes, scrolling by `off` px. */
function strip(x, y, w, h, off, tint = C.film, frames = null) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = tint; ctx.fillRect(x, y, w, h);
  const hs = h * 0.12, step = h * 0.3;
  ctx.fillStyle = C.hole;
  for (let i = -1; i < w / step + 2; i++) {
    const hx = x + ((i * step + off) % (w + step)) - step / 2;
    ctx.fillRect(hx, y + h * 0.06, hs, hs); ctx.fillRect(hx, y + h - h * 0.06 - hs, hs, hs);
  }
  if (frames) {
    const fw = h * 0.9;
    for (let i = -1; i < w / fw + 2; i++) {
      const fx = x + ((i * fw + off) % (w + fw)) - fw / 2;
      ctx.fillStyle = frames(i); ctx.fillRect(fx + 4, y + h * 0.22, fw - 8, h * 0.56);
    }
  }
  ctx.restore();
}
function can(x, y, r, label, color, sub) {
  ctx.fillStyle = C.film; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.72, 0, TAU); ctx.stroke();
  ctx.fillStyle = C.paper; k.rrect(x - r * 0.78, y - 30, r * 1.56, 60, 6); ctx.fill();
  font(700, 21, MONO); text(label, x, y - 6, { align: 'center', base: 'middle', color: C.type });
  if (sub) { font(400, 18, MONO); text(sub, x, y + 18, { align: 'center', base: 'middle', color: C.type }); }
}
function card(x, y, w, h, lines, border = C.silver) {
  ctx.fillStyle = C.bg2; k.rrect(x - w / 2, y - h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke();
  let yy = y - h / 2 + 40;
  for (const [s, size, color = C.silver, weight = 600, fam = HEAD] of lines) { font(weight, size, fam); text(s, x, yy, { align: 'center', base: 'middle', color }); yy += size * 1.45; }
}
function heading(s, a, color = C.silver, y = 96) { A(a, () => { font(800, 38); text(s, CX, y, { align: 'center', base: 'middle', color, spacing: '1px' }); }); }

/** Several strings on one line, each drawn (and translated) on its own: words stay whole for other languages, numbers can change. */
function words(parts, x, y, { align = 'center', color } = {}) {
  const sp = ctx.measureText(' ').width, ws = parts.map((p) => ctx.measureText(p).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach((p, i) => { text(p, cx, y, { align: 'left', base: 'middle', ...(color ? { color } : {}) }); cx += ws[i] + sp; });
}
// ---------- A ----------
function sceneA(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    heading('1943: TWO ALLIES, ONE STORY', seg(t, 0.4, 1.2));
    A(seg(t, 0.6, 1.4), () => can(250, 420, 150, 'DESERT VICTORY', C.brass, 'British · 1943'));
    A(seg(t, 2.0, 2.8), () => { font(600, 24); text('El Alamein, a much-praised success', 250, 610, { align: 'center', base: 'middle', color: C.brass }); });
    A(seg(t, 5.0, 5.8), () => {
      can(614, 420, 150, 'AFRICA FREED', C.brass, 'in the making');
      // a tug of war over the strip
      const pull = Math.sin(t * 2.2) * 14;
      strip(350 + pull, 640, 360, 80, t * 40, C.film, (i) => (i % 2 ? 'rgba(212,162,76,0.35)' : 'rgba(127,167,201,0.35)'));
      font(600, 24); text('…but the Americans want to tell Tunisia too', CX, 750, { align: 'center', base: 'middle', color: C.steel });
    });
  });
}

// ---------- B ----------
function sceneB(t) {
  A(span(t, 9.4, 18.8, 0.4, 0.4), () => {
    heading('ONE FILM, TWO GOVERNMENTS', seg(t, 9.6, 10.4));
    const meet = eio(seg(t, 10.2, 12.4));
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 13.8, 14.2)), () => {
      card(lerp(170, 262, meet), 380, 300, 170, [['LONDON', 22, C.brass, 700, MONO], ['Ministry of', 26], ['Information', 26], ['Brendan Bracken', 22, C.soft, 400]], C.brass);
      card(lerp(694, 602, meet), 380, 300, 170, [['WASHINGTON', 22, C.steel, 700, MONO], ['Office of', 26], ['War Information', 26], ['Elmer Davis', 22, C.soft, 400]], C.steel);
      A(seg(t, 12.2, 12.8), () => can(CX, 640, 120, 'TUNISIAN', C.silver, 'VICTORY'));
    });
    A(seg(t, 14.2, 14.8), () => {
      card(250, 420, 320, 230, [['FRANK CAPRA', 30, C.steel, 800], ['Hollywood director,', 24, C.silver, 400], ['colonel, US Army', 24, C.silver, 400], ['Signal Corps', 24, C.silver, 400]], C.steel);
      card(614, 420, 320, 230, [['HUGH STEWART', 30, C.brass, 800], ['British army', 24, C.silver, 400], ['film unit officer,', 24, C.silver, 400], ['led the joint team', 24, C.silver, 400]], C.brass);
    });
  });
}

// ---------- C ----------
function sceneC(t) {
  A(span(t, 18.6, 28.0, 0.4, 0.4), () => {
    heading('FILMING A CAMPAIGN', seg(t, 18.8, 19.6) * (1 - seg(t, 23.0, 23.4)));
    A(seg(t, 18.8, 19.6) * (1 - seg(t, 23.0, 23.4)), () => {
      // a long front with cameras along it
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(90, 420); ctx.quadraticCurveTo(CX, 300, 774, 420); ctx.stroke();
      for (let i = 0; i < 10; i++) {
        const u = i / 9, x = lerp(90, 774, u), y = 420 - Math.sin(u * Math.PI) * 60;
        A(seg(t, 19.2 + i * 0.12, 19.6 + i * 0.12), () => camera(x, y - 24, 0.8, i % 2 ? C.brass : C.steel));
      }
      font(800, 54); text(`${Kit.fmt(STAFF)} · ${Kit.fmt(CAMERAMEN)}`, CX, 540, { align: 'center', base: 'middle', color: C.silver });
      font(400, 24); text('film staff · of them cameramen', CX, 590, { align: 'center', base: 'middle', color: C.soft });
      font(600, 26); text('a front of 2,000 miles', CX, 650, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 20.4, 21.0), () => { font(700, 26, MONO); words([Kit.fmt(SHOT_FT), 'feet of film shot'], CX, 720, { color: C.brass }); });
    });
    // the ship and its lost film
    A(seg(t, 23.4, 24.0), () => {
      heading('FOOTAGE LOST AT SEA', 1, C.red);
      ctx.fillStyle = C.sea; ctx.fillRect(0, 520, W, 260);
      const sink = eio(seg(t, 25.2, 27.6));
      ctx.save(); ctx.translate(CX, 500 + sink * 120); ctx.rotate(sink * 0.25);
      ctx.fillStyle = '#8a8f98';
      ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.lineTo(170, 50); ctx.lineTo(-170, 50); ctx.closePath(); ctx.fill();
      ctx.fillRect(-80, -50, 120, 50); ctx.fillRect(60, -30, 50, 30);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = C.film; ctx.beginPath(); ctx.arc(-130 + i * 40, -14, 16, 0, TAU); ctx.fill(); ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = C.sea; ctx.globalAlpha *= 0.85;
      ctx.beginPath(); ctx.moveTo(0, 560); for (let x = 0; x <= W; x += 24) ctx.lineTo(x, 556 + Math.sin(x / 40 + t * 2) * 8); ctx.lineTo(W, 780); ctx.lineTo(0, 780); ctx.closePath(); ctx.fill();
      ctx.globalAlpha /= 0.85;
      font(600, 24); text('American film of the campaign', CX, 180, { align: 'center', base: 'middle', color: C.steel });
      text('went down with its ship', CX, 214, { align: 'center', base: 'middle', color: C.steel });
    });
  });
}
function camera(x, y, s, color) {
  ctx.fillStyle = color;
  k.rrect(x - 22 * s, y - 14 * s, 44 * s, 28 * s, 4 * s); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 10 * s, y - 24 * s, 10 * s, 0, TAU); ctx.arc(x + 12 * s, y - 24 * s, 10 * s, 0, TAU); ctx.fill();
  ctx.fillRect(x + 22 * s, y - 6 * s, 12 * s, 12 * s);
  ctx.strokeStyle = color; ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.moveTo(x, y + 14 * s); ctx.lineTo(x - 18 * s, y + 46 * s); ctx.moveTo(x, y + 14 * s); ctx.lineTo(x + 18 * s, y + 46 * s); ctx.moveTo(x, y + 14 * s); ctx.lineTo(x, y + 46 * s); ctx.stroke();
}
function dummyTank(x, y, s, color) {
  ctx.fillStyle = color; ctx.strokeStyle = C.silver; ctx.lineWidth = 2;
  k.rrect(x - 70 * s, y - 16 * s, 140 * s, 34 * s, 14 * s); ctx.fill(); ctx.stroke();
  ctx.fillRect(x - 40 * s, y - 40 * s, 70 * s, 24 * s); ctx.strokeRect(x - 40 * s, y - 40 * s, 70 * s, 24 * s);
  ctx.fillRect(x + 30 * s, y - 32 * s, 60 * s, 8 * s);
  // props behind: it is a flat
  ctx.strokeStyle = C.soft; ctx.beginPath(); ctx.moveTo(x - 50 * s, y + 18 * s); ctx.lineTo(x - 80 * s, y + 50 * s); ctx.moveTo(x + 40 * s, y + 18 * s); ctx.lineTo(x + 70 * s, y + 50 * s); ctx.stroke();
}

// ---------- D ----------
function sceneD(t) {
  A(span(t, 27.8, 37.2, 0.4, 0.4), () => {
    heading('RE-CREATED SCENES', seg(t, 28.0, 28.8));
    // Stevens in Algeria
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 32.4, 32.8)), () => {
      card(CX, 230, 560, 120, [['GEORGE STEVENS · ALGIERS', 26, C.steel, 800], ['two weeks filming tanks, guns and infantry', 22, C.silver, 400]], C.steel);
      camera(200, 500, 1.4, C.steel);
      for (let i = 0; i < 3; i++) { const x = 420 + i * 130 + Math.sin(t + i) * 6; ctx.fillStyle = '#5a5a48'; k.rrect(x - 50, 470, 100, 30, 10); ctx.fill(); ctx.fillRect(x - 24, 452, 46, 20); }
    });
    A(seg(t, 32.6, 33.2), () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 300, W, 480);
      card(CX, 360, 640, 120, [['JOHN HUSTON · ORLANDO, CALIFORNIA', 26, C.steel, 800], ['planes and dummy tanks, played by GIs', 22, C.silver, 400]], C.steel);
      camera(180, 600, 1.4, C.steel);
      dummyTank(520, 620, 1.3, '#5a5a48');
      A(seg(t, 34.4, 35.0), () => { font(700, 26, MONO); text('IN THE FINAL CUT? UNCERTAIN', CX, 740, { align: 'center', base: 'middle', color: C.brass }); });
    });
  });
}

// ---------- E ----------
function sceneE(t) {
  A(span(t, 37.0, 51.2, 0.4, 0.4), () => {
    // two voices
    A(seg(t, 37.2, 37.8) * (1 - seg(t, 41.4, 41.8)), () => {
      heading('TWO INVENTED SOLDIERS SPEAK', 1);
      const mic = (x, color, who, actor) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, 380, 34, 0, TAU); ctx.fill(); k.rrect(x - 40, 420, 80, 140, 20); ctx.fill();
        ctx.fillStyle = C.silver; k.rrect(x + 50, 380, 24, 44, 12); ctx.fill(); ctx.fillRect(x + 60, 424, 4, 120);
        font(700, 26); text(who, x, 610, { align: 'center', base: 'middle', color });
        font(400, 22); text(actor, x, 646, { align: 'center', base: 'middle', color: C.soft });
      };
      mic(250, C.brass, 'a British soldier', 'voiced by Bernard Miles');
      mic(614, C.steel, 'an American soldier', 'voiced by Burgess Meredith');
    });
    // the balance
    A(seg(t, 41.8, 42.4) * (1 - seg(t, 46.0, 46.4)), () => {
      heading('WHOSE WAR?', 1);
      const tilt = 0.16 * eout(seg(t, 42.4, 44.0));
      ctx.save(); ctx.translate(CX, 360); ctx.rotate(-tilt);
      ctx.strokeStyle = C.silver; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.silver; ctx.beginPath(); ctx.moveTo(CX - 30, 600); ctx.lineTo(CX + 30, 600); ctx.lineTo(CX, 360); ctx.closePath(); ctx.fill();
      const lx = CX - 250 * Math.cos(tilt), ly = 360 + 250 * Math.sin(tilt), rx = CX + 250 * Math.cos(tilt), ry = 360 - 250 * Math.sin(tilt);
      can(lx, ly + 80, 66, 'US', C.steel); can(rx, ry + 80, 50, 'UK', C.brass);
      font(400, 24); text('the Imperial War Museum: “much greater prominence', CX, 690, { align: 'center', base: 'middle', color: C.soft });
      text('to the American effort” than in Africa Freed', CX, 724, { align: 'center', base: 'middle', color: C.soft });
    });
    // Capra takes control; 16 March 1944
    A(seg(t, 46.4, 47.0), () => {
      heading('AFTER MONTHS OF WRANGLING', 1);
      can(CX, 420, 150, 'TUNISIAN', C.silver, 'VICTORY');
      font(700, 30, MONO); text('IN CINEMAS 16 MARCH 1944', CX, 640, { align: 'center', base: 'middle', color: C.brass });
      font(400, 24); text('Capra had taken full control of the edit', CX, 690, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- F ----------
function sceneF(t) {
  A(span(t, 51.0, 60.6, 0.4, 0), () => {
    heading('10 MONTHS AFTER THE BATTLE', seg(t, 51.2, 52.0));
    // a calendar gap: 13 May 1943 to 16 March 1944
    const L = 120, R = 744, y = 240;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    const g = eio(seg(t, 51.6, 53.4));
    ctx.strokeStyle = C.brass; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(lerp(L, R, g), y); ctx.stroke();
    font(600, 22, MONO); text('13 MAY 1943', L, y + 36, { align: 'left', base: 'middle', color: C.silver });
    A(g, () => text('16 MARCH 1944', R, y + 36, { align: 'right', base: 'middle', color: C.brass }));
    font(400, 22); text('Axis surrender in Tunisia', L, y - 30, { align: 'left', base: 'middle', color: C.soft });
    A(g, () => text('the film opens', R, y - 30, { align: 'right', base: 'middle', color: C.soft }));
    // what the 76 minutes are made of
    A(seg(t, 55.6, 56.2), () => {
      const parts = [['combat film', C.brass], ['newsreels', C.silver], ['captured enemy film', '#9c9c9c'], ['re-created scenes', C.steel]];
      strip(60, 400, 744, 120, (t - 55.6) * 60, C.film, (i) => parts[((i % 4) + 4) % 4][1]);
      parts.forEach(([s, c], i) => {
        const lx = i % 2 ? 470 : 150, ly = 560 + Math.floor(i / 2) * 38;
        ctx.fillStyle = c; ctx.fillRect(lx, ly - 10, 20, 20);
        font(600, 24); text(s, lx + 32, ly, { align: 'left', base: 'middle', color: C.silver });
      });
      font(800, 54); text('76 MINUTES', CX, 680, { align: 'center', base: 'middle', color: C.silver });
      font(400, 22, MONO); text('6,871 feet of film', CX, 730, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, '*1943*: British army filmmakers had a hit with *Desert Victory*, on the battle of El Alamein.'],
  [5.0, 9.4, 'Next they began *Africa Freed*, on the war in Tunisia. But the Americans wanted that story too.'],
  [9.6, 14.0, 'Britain’s Ministry of Information and the US Office of War Information agreed on one joint film.'],
  [14.2, 18.6, 'Hollywood director ~Frank Capra~, a US Army colonel, and Britain’s *Hugh Stewart* made it together.'],
  [18.8, 23.2, 'Some 300 staff, 50 of them cameramen, covered a 2,000-mile front: 300,000 feet of film, Variety said.'],
  [23.4, 27.8, 'But much American footage was lost when German forces sank the ship carrying it.'],
  [28.0, 32.4, 'So scenes were re-created. Director George Stevens spent two weeks filming tanks and troops.'],
  [32.6, 37.0, 'John Huston shot planes and dummy tanks in Florida and California. How much was used is unclear.'],
  [37.2, 41.6, 'Two invented soldiers tell the story, one British, one American, voiced by actors.'],
  [41.8, 46.2, 'Britain’s Imperial War Museum notes it gives far more weight to the ~American~ effort.'],
  [46.4, 50.8, 'After months of wrangling over who would tell it, Capra took control. It opened on *16 March 1944*.'],
  [51.0, 55.4, 'By then the fighting in Tunisia had been over for ten months.'],
  [55.6, 60.0, 'Combat film, newsreels, captured enemy film and re-created scenes, all cut into *76 minutes*.'],
];

let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 420, 60, CX, 420, 720); rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}

Kit.scene({
  width: W, height: H, duration: 60.6, fonts: [HEAD, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC(t); sceneD(t); sceneE(t); sceneF(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: HEAD, ink: C.silver, marks: { '*': C.brass, '~': C.steel } });
  },
});
