// Explainer for philosophy-norms-wages-and-deliveries (Hungary 1956): why Hungarians were poorer in the early 1950s
// than before the war. The first five-year plan poured money into heavy industry ("a land of iron and steel"); in the
// factories higher norms cut pay, prices outran wages and food was rationed again; in the villages the compulsory
// deliveries took a fixed share of the harvest, set by the land and not by the crop. Look: soot-grey steelworks
// palette (steel blue, furnace orange, wheat gold), chimneys and a field as the two motifs; no faces. Saira for
// headings and labels, Source Sans 3 for the captions.
//
// Facts:
// - Endre Domonkos, "The Consequences of Stalinist Economic Policy in Hungary (1949–1953)", Multidiszciplináris
//   kihívások, sokszínű válaszok 2022/1 (MTA REAL repository): the first Five-Year Plan, officially launched on
//   1 January 1950, aimed at "the land of iron and steel"; planned investment 27.6 billion forints in the 1948 draft,
//   35 billion in April 1949, 50.9 billion in December 1949, 85 billion in February 1951, "more than three times" the
//   first version (Berend); more than half of investment went to industry and about 90% of that to heavy industry;
//   food rationing was reintroduced from 1 January 1951 (Honvári); compulsory deliveries were set by the value and
//   quality of the land "irrespective of the given quantity of crop", at fixed low prices (Berend); Peace Loans: at
//   least a month's pay a year, 5.6 billion forints in all (Kaposi); in the early 1950s real wages dropped by 20% and
//   stood at 66% of the pre-war level in 1952; a 1954 Trade Union Council survey found a third of wage earners
//   under the subsistence minimum (Romsics).
// - Zsombor Bódy, "Actors, Ruptures, and Continuity ... The Hungarian Vehicle Industry around 1950", Hungarian
//   Historical Review 10/3 (2021): the "standardization of norms" for 1950, "which really meant wage cuts", lowered
//   average wages at the Ikarus works by a nominal 35.5%.
// - Csaba Kovács, "The Last Wave of Hungarian Collectivisation in the Mirror of Complaints" (rcin.org.pl), after
//   Romsics: the number of private farms fell by about 400,000 between the end of 1948 and the summer of 1953;
//   360,000 people found jobs in industry.
// - House of Terror Museum, "Peasants" (terrorhaza.hu): deliveries at fixed prices, quantities increasing every year;
//   "attic sweepings", in which officials confiscated all produce that could be taken, often even seed.
//
// Scene plan (65 s). Captions centred at y = 846.
//  A  0.4–14.0  the plan: iron and steel; investment more than tripled; heavy industry first.
//  B 14.2–23.2  the norm, and Ikarus 1950.
//  C 23.4–41.6  real wages, Peace Loans, rationing.
//  D 41.8–55.4  the villages: deliveries fixed by the land, low prices, attic sweeping.
//  E 55.6–64.6  400,000 farms gone; a third below the minimum.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#1d2227', bg2: '#0e1114', ink: '#eef2f4', soft: 'rgba(238,242,244,0.72)', faint: 'rgba(238,242,244,0.2)',
  steel: '#8fb3c9', steelDim: 'rgba(143,179,201,0.25)', fire: '#f08a3c', fireDim: 'rgba(240,138,60,0.25)', wheat: '#e6c35c', wheatDim: 'rgba(230,195,92,0.22)',
  soil: '#6b4f35', panel: 'rgba(12,15,18,0.86)',
};
const HEAD = 'Saira', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
/** Sets a font no bigger than `size` at which `s` fits in `maxW` (measured in the render's language). */
function fit(s, maxW, size, w = 400, f = TXT) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }

// Domonkos 2022 (after Berend): the plan's investment, billion forints, version by version
const PLAN = [['1948 draft', 27.6], ['April 1949', 35], ['Dec 1949', 50.9], ['Feb 1951', 85]];
const TIMES = PLAN[3][1] / PLAN[0][1];
if (TIMES < 3 || TIMES > 3.2) throw new Error('plan');
const REAL_1952 = 66; // Domonkos 2022 (Romsics): real wages in 1952, % of pre-war

// ---------- the skyline ----------
function skyline(a, smoke = 1) {
  A(a, () => {
    const base = 640;
    ctx.fillStyle = '#2a3138';
    const blocks = [[60, 120, 180], [190, 90, 120], [290, 160, 220], [460, 110, 150], [580, 140, 200], [730, 80, 130]];
    for (const [x, w, h] of blocks) ctx.fillRect(x, base - h, w, h);
    // chimneys
    const ch = [[110, 300], [330, 360], [370, 330], [620, 340], [760, 280]];
    for (const [x, h] of ch) {
      ctx.fillStyle = '#353e46'; ctx.fillRect(x - 12, base - h, 24, h);
      ctx.fillStyle = C.fire; ctx.fillRect(x - 12, base - h, 24, 6);
      // smoke puffs, drifting
      A(smoke * 0.5, () => {
        for (let i = 0; i < 4; i++) {
          const r = 16 + i * 9, y = base - h - 20 - i * 34, x2 = x + i * 16;
          ctx.fillStyle = 'rgba(160,170,178,0.18)'; ctx.beginPath(); ctx.arc(x2, y, r, 0, TAU); ctx.fill();
        }
      });
    }
    ctx.fillStyle = '#14181c'; ctx.fillRect(0, base, W, 6);
  });
}

// ---------- A: the plan ----------
function scenePlan(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    font(800, 40, HEAD); text('THE FIRST FIVE-YEAR PLAN', 60, 110, { spacing: '2px' });
    font(400, 27, TXT); text('Hungary, 1950–1954', 60, 152, { color: C.fire });
    A(span(t, 0.4, 5.2, 0.6, 0.4), () => {
      skyline(1);
      A(seg(t, 1.6, 2.4), () => { font(700, 34, HEAD); text('“A LAND OF IRON AND STEEL”', CX, 740, { align: 'center', color: C.wheat, spacing: '2px' }); });
    });
    // cue 2: the plan's investment, version by version
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      font(600, 26, HEAD); text('PLANNED INVESTMENT, BILLION FORINTS', 60, 230, { color: C.soft, spacing: '1px' });
      const x0 = 60, base = 660, bw = 150, gap = 40, top = 300;
      PLAN.forEach(([name, v], i) => {
        const g = eout(seg(t, 5.4 + i * 0.5, 6.4 + i * 0.5)), hgt = (base - top) * (v / 85) * g, x = x0 + i * (bw + gap);
        ctx.fillStyle = i === 3 ? C.fire : C.steel; ctx.fillRect(x, base - hgt, bw, hgt);
        A(g, () => {
          font(700, 32, HEAD); text(dec(v), x + bw / 2, base - hgt - 26, { align: 'center', color: i === 3 ? C.fire : C.ink });
          font(500, 22, TXT); text(name, x + bw / 2, base + 30, { align: 'center', color: C.soft });
        });
      });
      A(seg(t, 7.6, 8.2), () => { font(800, 34, HEAD); text(`× ${dec(TIMES)}`, 60 + 3 * (bw + gap) + bw / 2, 380, { align: 'center', color: '#1a1206' }); });
    });
    // cue 3: where it went
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
      font(600, 26, HEAD); text('WHERE THE INVESTMENT WENT', 60, 230, { color: C.soft, spacing: '1px' });
      const x0 = 80, y0 = 330, bw = W - 160, bh = 80;
      const g = eio(seg(t, 10.0, 11.2));
      ctx.fillStyle = C.faint; ctx.fillRect(x0, y0, bw, bh);
      ctx.fillStyle = C.steel; ctx.fillRect(x0, y0, bw * 0.52 * g, bh);
      font(600, 24, TXT); text('industry: more than half', x0, y0 - 22, { color: C.steel });
      fit('the rest: farming, transport, homes', bw * 0.48 - 28, 21, 600); text('the rest: farming, transport, homes', x0 + bw - 14, y0 + bh / 2, { align: 'right', color: C.ink });
      // zoom into industry
      A(seg(t, 11.2, 11.8), () => {
        const y1 = 520, g2 = eio(seg(t, 11.4, 12.6));
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 + bh); ctx.lineTo(x0, y1); ctx.moveTo(x0 + bw * 0.52, y0 + bh); ctx.lineTo(x0 + bw, y1); ctx.stroke();
        ctx.fillStyle = C.steelDim; ctx.fillRect(x0, y1, bw, bh);
        ctx.fillStyle = C.fire; ctx.fillRect(x0, y1, bw * 0.9 * g2, bh);
        font(700, 26, HEAD); text('HEAVY INDUSTRY ≈ 90%', x0 + 20, y1 + bh / 2, { color: '#1a1206' });
        font(600, 22, TXT); text('of the money for industry: steel, machines, mines, arms', x0, y1 + bh + 32, { color: C.fire });
      });
    });
  });
}

// ---------- B: the norm ----------
function sceneNorm(t) {
  A(span(t, 14.0, 23.4, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('THE NORM', 60, 130, { spacing: '3px', color: C.steel });
    font(400, 24, TXT); text('pay ≈ base pay × output ÷ norm (simplified)', 60, 172, { color: C.soft });
    // a worker's day as a bar; the norm as a line that moves up
    const x0 = 140, base = 640, top = 260, bw = 200;
    const out = 100, raise = 1 + eio(seg(t, 19.0, 21.0)) * 0.55;
    const scale = (v) => (base - top) * (v / 170);
    ctx.fillStyle = C.steel; ctx.fillRect(x0, base - scale(out), bw, scale(out));
    font(600, 22, TXT); text('a day’s output', x0 + bw / 2, base + 28, { align: 'center', color: C.soft });
    const ny = base - scale(100 * raise);
    ctx.strokeStyle = C.fire; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x0 - 40, ny); ctx.lineTo(x0 + bw + 40, ny); ctx.stroke(); ctx.setLineDash([]);
    font(700, 24, HEAD); text('NORM', x0 + bw + 52, ny, { color: C.fire });
    // the pay packet, shrinking as the norm rises
    const pay = 100 / raise, px = 560, pw = 200;
    ctx.fillStyle = C.wheatDim; ctx.fillRect(px, base - scale(100), pw, scale(100));
    ctx.fillStyle = C.wheat; ctx.fillRect(px, base - scale(pay), pw, scale(pay));
    font(600, 22, TXT); text('pay for that day', px + pw / 2, base + 28, { align: 'center', color: C.soft });
    A(seg(t, 19.6, 20.2), () => {
      font(700, 30, HEAD); text(`−${dec(100 - pay)}%`, px + pw / 2, base - scale(pay) - 30, { align: 'center', color: C.wheat });
    });
    A(seg(t, 18.8, 19.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 700, W - 160, 70, 12); ctx.fill();
      font(600, 24, TXT); text('Ikarus bus works, Budapest, 1950: average pay −35.5%', CX, 735, { align: 'center', color: C.ink });
    });
  });
}

// ---------- C: wages, loans, rations ----------
function sceneWages(t) {
  A(span(t, 23.2, 41.8, 0.4, 0.4), () => {
    // cues 6–7: real wages, before the war and in 1952
    A(span(t, 23.2, 32.6, 0.4, 0.4), () => {
      font(800, 34, HEAD); text('REAL WAGES', 60, 130, { spacing: '3px', color: C.wheat });
      font(400, 24, TXT); text('what a wage could buy', 60, 172, { color: C.soft });
      // prices running ahead of pay (cue 6): two arrows
      A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
        const g = eio(seg(t, 23.8, 26.4));
        ctx.lineCap = 'round';
        ctx.strokeStyle = C.fire; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(140, 600); ctx.lineTo(lerp(140, 720, g), lerp(600, 300, g)); ctx.stroke();
        ctx.strokeStyle = C.steel; ctx.beginPath(); ctx.moveTo(140, 640); ctx.lineTo(lerp(140, 720, g), lerp(640, 520, g)); ctx.stroke();
        ctx.lineCap = 'butt';
        A(g, () => { font(700, 26, HEAD); text('PRICES', 730, 290, { color: C.fire }); text('PAY', 730, 520, { color: C.steel }); });
        A(g, () => { font(400, 20, TXT); text('schematic', 140, 680, { color: C.soft }); });
        A(seg(t, 26.4, 27.0), () => { font(700, 30, HEAD); text('about a fifth less to spend', CX, 700, { align: 'center', color: C.wheat }); });
      });
      // 1938 vs 1952 (cue 7)
      A(seg(t, 28.0, 28.4), () => {
        const base = 640, top = 260, bw = 220, xs = [180, 480];
        [[100, 'before the war (1938)', C.soft], [REAL_1952, '1952', C.wheat]].forEach(([v, name, col], i) => {
          const g = eout(seg(t, 28.2 + i * 0.6, 29.4 + i * 0.6)), hgt = (base - top) * (v / 100) * g;
          ctx.fillStyle = col; ctx.fillRect(xs[i], base - hgt, bw, hgt);
          A(g, () => { font(700, 40, HEAD); text(fmt(v), xs[i] + bw / 2, base - hgt - 30, { align: 'center', color: col }); font(500, 23, TXT); text(name, xs[i] + bw / 2, base + 30, { align: 'center', color: C.soft }); });
        });
        A(seg(t, 30.0, 30.6), () => { font(700, 28, HEAD); text('about two-thirds', CX, 720, { align: 'center', color: C.wheat }); });
      });
    });
    // cue 8: the Peace Loan
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      const s = eout(seg(t, 32.8, 33.8));
      ctx.save(); ctx.translate(CX, 420); ctx.scale(lerp(0.92, 1, s), lerp(0.92, 1, s));
      ctx.fillStyle = '#d9d0b8'; ctx.fillRect(-300, -190, 600, 380);
      ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = 6; ctx.strokeRect(-282, -172, 564, 344);
      for (let i = 0; i < 24; i++) { ctx.strokeStyle = 'rgba(106,90,58,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 60 + i * 9, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
      font(800, 40, HEAD); text('PEACE LOAN', 0, -110, { align: 'center', color: '#2a2214', spacing: '4px' });
      font(600, 24, TXT); text('bonds every worker was pressed to buy', 0, -60, { align: 'center', color: '#2a2214' });
      font(800, 34, HEAD); text('≈ ONE MONTH’S PAY', 0, 20, { align: 'center', color: '#8a3a12' }); font(600, 24, TXT); text('a year, at least', 0, 62, { align: 'center', color: '#2a2214' });
      font(500, 22, TXT); text('1949–1955: 5.6 billion forints in all', 0, 130, { align: 'center', color: '#2a2214' });
      ctx.restore();
    });
    // cue 9: ration coupons
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      font(800, 34, HEAD); text('1 JANUARY 1951', CX, 150, { align: 'center', color: C.steel, spacing: '2px' });
      const cols = 5, rows = 4, cw = 120, chh = 92, x0 = CX - (cols * cw) / 2, y0 = 230;
      const torn = Math.floor(seg(t, 38.6, 41.0) * 7);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (i < torn) continue;
        ctx.fillStyle = '#cfd6d9'; ctx.fillRect(x0 + c * cw + 4, y0 + r * chh + 4, cw - 8, chh - 8);
        ctx.strokeStyle = '#7d8a91'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(x0 + c * cw + 4, y0 + r * chh + 4, cw - 8, chh - 8); ctx.setLineDash([]);
        font(700, 26, HEAD); text(String(i + 1), x0 + c * cw + cw / 2, y0 + r * chh + chh / 2, { align: 'center', color: '#2b3338' });
      }
      A(seg(t, 38.2, 38.8), () => { font(700, 30, HEAD); text('FOOD RATIONED AGAIN', CX, 640, { align: 'center', color: C.wheat, spacing: '2px' }); font(400, 22, TXT); text('a sheet of coupons, schematic', CX, 680, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- D: the villages ----------
function field(a) {
  A(a, () => {
    ctx.fillStyle = C.soil; ctx.fillRect(0, 600, W, 120);
    for (let i = 0; i < 40; i++) { ctx.strokeStyle = 'rgba(230,195,92,0.5)'; ctx.lineWidth = 3; const x = 10 + i * 22; ctx.beginPath(); ctx.moveTo(x, 600); ctx.lineTo(x + 4, 560); ctx.stroke(); }
  });
}
function sceneVillage(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    field(1);
    // cue 10: the deliveries
    A(span(t, 41.6, 46.2, 0.4, 0.4), () => {
      font(800, 34, HEAD); text('COMPULSORY DELIVERIES', CX, 140, { align: 'center', color: C.wheat, spacing: '2px' });
      const items = ['grain', 'meat', 'other produce'];
      items.forEach((s, i) => A(seg(t, 42.4 + i * 0.5, 43.0 + i * 0.5), () => {
        const x = 190 + i * 242;
        ctx.fillStyle = C.wheatDim; k.rrect(x - 105, 260, 210, 120, 14); ctx.fill(); ctx.strokeStyle = C.wheat; ctx.lineWidth = 3; ctx.stroke();
        fit(s, 190, 26, 700, HEAD); text(s, x, 320, { align: 'center', color: C.wheat });
      }));
      A(seg(t, 43.8, 44.4), () => {
        const g = eio(seg(t, 43.8, 45.4));
        ctx.strokeStyle = C.wheat; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(CX, 400); ctx.lineTo(CX, lerp(400, 500, g)); ctx.stroke();
        font(600, 26, TXT); text('to the state, at fixed prices', CX, 530, { align: 'center', color: C.ink });
      });
    });
    // cue 11: good year, bad year: the quota stays (schematic)
    A(span(t, 46.2, 50.8, 0.4, 0.4), () => {
      font(800, 30, HEAD); text('SET BY THE LAND, NOT BY THE HARVEST', CX, 140, { align: 'center', color: C.wheat, spacing: '1px' });
      const base = 540, top = 220, bw = 150, xs = [150, 520];
      [['good year', 1], ['bad year', 0.5 + 0.5 * (1 - eio(seg(t, 47.4, 48.8)))]].forEach(([name, h], i) => {
        const x = xs[i], harvest = (base - top) * 0.95 * h, quota = (base - top) * 0.45;
        ctx.fillStyle = C.wheatDim; ctx.fillRect(x, base - harvest, bw, harvest);
        ctx.fillStyle = C.fire; ctx.fillRect(x + bw + 10, base - quota, 60, quota);
        font(600, 22, TXT); text(name, x + bw / 2 + 35, base + 30, { align: 'center', color: C.soft });
        font(700, 20, HEAD); text('quota', x + bw + 40, base - quota - 18, { align: 'center', color: C.fire }); text('harvest', x + bw / 2, base - harvest - 18, { align: 'center', color: C.wheat });
      });
      A(seg(t, 48.8, 49.4), () => { font(400, 22, TXT); text('schematic: the quota stays the same', CX, 752, { align: 'center', color: C.ink }); });
    });
    // cue 12: attic sweeping
    A(span(t, 50.8, 55.6, 0.4, 0.4), () => {
      // a house in section, with its loft
      const hx = 260, hy = 560;
      ctx.fillStyle = '#3a3f45'; ctx.fillRect(hx, hy - 180, 340, 180);
      ctx.fillStyle = '#4b4136'; ctx.beginPath(); ctx.moveTo(hx - 30, hy - 180); ctx.lineTo(hx + 170, hy - 330); ctx.lineTo(hx + 370, hy - 180); ctx.closePath(); ctx.fill();
      // the loft's sacks, carried away one by one
      const gone = seg(t, 51.6, 54.4) * 4;
      for (let i = 0; i < 4; i++) {
        const f = clamp(gone - i);
        const sx = lerp(hx + 90 + i * 50, hx + 560 + i * 20, eio(f)), sy = lerp(hy - 220, hy - 40, eio(f));
        A(1 - f * 0.6, () => { ctx.fillStyle = C.wheat; k.rrect(sx - 20, sy - 26, 40, 52, 10); ctx.fill(); });
      }
      // a ladder
      ctx.strokeStyle = '#a58a62'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(hx + 300, hy); ctx.lineTo(hx + 250, hy - 200); ctx.moveTo(hx + 330, hy); ctx.lineTo(hx + 280, hy - 200); ctx.stroke();
      for (let i = 1; i < 6; i++) { const f = i / 6; ctx.beginPath(); ctx.moveTo(lerp(hx + 300, hx + 250, f), lerp(hy, hy - 200, f)); ctx.lineTo(lerp(hx + 330, hx + 280, f), lerp(hy, hy - 200, f)); ctx.stroke(); }
      font(800, 34, HEAD); text('“ATTIC SWEEPING”', CX, 140, { align: 'center', color: C.fire, spacing: '2px' });
      font(400, 23, TXT); text('lofts searched; grain taken, often even the seed', CX, 186, { align: 'center', color: C.soft });
    });
  });
}

// ---------- E: the outcome ----------
function sceneOutcome(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    // cue 13: 400,000 fewer private farms; 360,000 into industry
    A(span(t, 55.4, 60.2, 0.4, 0.4), () => {
      font(800, 30, HEAD); text('END OF 1948 → SUMMER 1953', CX, 140, { align: 'center', color: C.steel, spacing: '2px' });
      const n = 40, gone = Math.floor(seg(t, 56.2, 58.4) * 40);
      for (let i = 0; i < n; i++) {
        const c = i % 10, r = Math.floor(i / 10), x = 120 + c * 64, y = 230 + r * 70;
        A(i < gone ? 0.18 : 1, () => {
          ctx.fillStyle = C.wheat; ctx.fillRect(x, y + 12, 40, 28); ctx.beginPath(); ctx.moveTo(x - 6, y + 14); ctx.lineTo(x + 20, y - 4); ctx.lineTo(x + 46, y + 14); ctx.closePath(); ctx.fill();
        });
      }
      A(seg(t, 58.0, 58.6), () => {
        font(800, 52, HEAD); text(fmt(400000), CX, 560, { align: 'center', color: C.wheat });
        font(500, 24, TXT); text('fewer private farms (each faded house: 10,000)', CX, 606, { align: 'center', color: C.soft });
        font(600, 24, TXT); text('360,000 people moved to jobs in industry', CX, 660, { align: 'center', color: C.steel });
      });
    });
    // cue 14: 1954: a third below the subsistence minimum
    A(seg(t, 60.2, 60.6), () => {
      font(800, 30, HEAD); text('1954 · TRADE UNION SURVEY', CX, 140, { align: 'center', color: C.steel, spacing: '2px' });
      for (let i = 0; i < 30; i++) {
        const c = i % 10, r = Math.floor(i / 10), x = 150 + c * 62, y = [230, 340, 490][r];
        const below = r === 2;
        A(below ? 1 : 0.7, () => {
          const col = below ? C.fire : C.soft;
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
          ctx.fillRect(x - 12, y + 18, 24, 44);
        });
      }
      A(seg(t, 61.0, 61.6), () => {
        ctx.strokeStyle = C.fire; ctx.lineWidth = 3; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(100, 440); ctx.lineTo(W - 100, 440); ctx.stroke(); ctx.setLineDash([]);
        font(700, 24, HEAD); text('SUBSISTENCE MINIMUM', W - 100, 422, { align: 'right', color: C.fire });
        font(600, 24, TXT); text('one wage earner in three below it', CX, 640, { align: 'center', color: C.ink });
      });
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
  g.strokeStyle = 'rgba(143,179,201,0.05)'; g.lineWidth = 1;
  for (let y = 0; y < 790; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, 1950: the first five-year plan aims at *a land of iron and steel*.'],
  [5.0, 9.4, 'Planned investment rose from *27.6* to ~85 billion forints~: more than three times.'],
  [9.6, 14.0, 'Most went to industry, and about nine-tenths of that to ~heavy industry~.'],
  [14.2, 18.6, 'In the factories, pay depended on the *norm*: the output that counted as a day’s work.'],
  [18.8, 23.2, 'The new norms of 1950 meant wage cuts: at the Ikarus bus works, pay fell ~35.5%~.'],
  [23.4, 27.8, 'Prices ran ahead of pay: in the early 1950s *real wages* fell by about a fifth.'],
  [28.0, 32.4, 'In 1952 real wages were about *two-thirds* of their level before the war.'],
  [32.6, 37.0, 'Workers were also pressed to lend the state a month’s pay a year in ~Peace Loans~.'],
  [37.2, 41.6, 'From 1 January 1951, food was *rationed* again, on coupons.'],
  [41.8, 46.2, 'In the villages, peasants owed the state *compulsory deliveries* of grain and meat.'],
  [46.4, 50.8, 'The quota was set by the land, ~not by the harvest~: a bad year did not lower it.'],
  [51.0, 55.4, 'Officials searched lofts for hidden grain: the ~“attic sweepings”~.'],
  [55.6, 60.0, 'By 1953 some *400,000* private farms were gone; 360,000 people moved into industry.'],
  [60.2, 64.6, 'In 1954 a union survey found ~a third~ of wage earners below the subsistence minimum.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePlan(t);
    sceneNorm(t);
    sceneWages(t);
    sceneVillage(t);
    sceneOutcome(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.wheat, '~': C.fire } });
  },
});
