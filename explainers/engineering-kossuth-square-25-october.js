// Explainer for engineering-kossuth-square-25-october (Hungary 1956): "Bloody Thursday", 25 October 1956. A crowd that
// had fraternised with Soviet tank crews at the Astoria went with them to Parliament, in Kossuth Square, and was fired
// on from several directions; who fired and how many died are still disputed. Also Mosonmagyaróvár, 26 October.
// Look: dusk-grey stone, the Danube in slate blue, the crowd as small pale dots, the accounts of the shooting as thin
// dashed lines, each in its own muted colour; no figures falling, no weapons drawn, numbers shown as a range on a scale.
// Jost for headings and labels, Crimson Pro for the captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (A/3592, 1957; MEK 01274), paras 481–483: in the morning of
//   25 October demonstrators talked with Soviet tank crews; the tanks were decorated with Hungarian colours, people
//   climbed on, and they went to Parliament together; probably 20,000–25,000 people waited for Prime Minister Nagy;
//   between 11 a.m. and 12, ÁVH police, and possibly Soviet soldiers, on the roof-tops opened fire with machine-guns;
//   other Soviet tanks came from the side streets and exchanged fire with the tanks that had come with the crowd;
//   estimates of the number killed vary from 300 to 800; a British Legation staff member counted twelve truckloads
//   of bodies. Para 497: at Mosonmagyaróvár on 26 October the crowd asked for the Soviet star to be removed; fire was
//   opened with machine-guns and grenades; "101 people were killed and 150 wounded".
// - Gábor Jobbágyi, "Bloody Thursday, 1956: the anatomy of the Kossuth Square massacre", Hungarian Review: crowd
//   estimates 3,000–20,000; the regime's White Book: 22 dead; András Kő and Lambert Nagy identify 76 dead; Edit Kéri
//   estimates 1,000; the official British report 300–800; one account blames the Soviet tanks (Kő and Nagy), another
//   the shooting from the Ministry of Agriculture (Kéri); Miklós Horváth adds Hungarian border guards firing at ground
//   level; the Justice Commission of 1991 concluded it was a joint action; no proper investigation has taken place.
// - Hungarian Wikipedia, "Kossuth téri sortűz" (after Kő and Nagy, Kossuth tér 1956, 2001): at least 75 killed, 284
//   wounded; a Soviet tank coming from Báthory Street fired at the people sheltering at the Rákóczi statue.
// - Imre Berki, "Az 1956–57. évi sortüzek rövid története", Rendvédelem-történeti Füzetek 16 (2007): 25 October,
//   about 11.30, fire from several sides on a crowd fraternising with Soviet tanks; nobody was called to account in
//   the reprisals; Mosonmagyaróvár, 26 October: border guards fired on the crowd at their barracks for about a minute
//   and a half; the next day's county paper reported 59 dead and 130 wounded, the radio 105 dead.
// The maps are schematic: places from their coordinates, the square's buildings simplified.
//
// Scene plan (65 s). Captions centred at y = 846.
//  A  0.4–18.6  Budapest: the Astoria, the tanks, the march to Parliament.
//  B 18.8–46.2  Kossuth Square: the crowd, the shooting, three accounts, the return fire.
//  C 46.4–60.0  how many died: the range of estimates; no one called to account.
//  D 60.2–64.6  Mosonmagyaróvár, 26 October.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1b1e1d', bg2: '#0c0e0d', ink: '#f0ede6', soft: 'rgba(240,237,230,0.74)', faint: 'rgba(240,237,230,0.2)',
  river: '#3e5a6e', riverDim: 'rgba(62,90,110,0.55)', stone: '#cfc6b0', stoneDim: 'rgba(207,198,176,0.2)', crowd: '#e9e4d6',
  red: '#d2433f', green: '#4f9a6a', soviet: '#c97a4a', roof: '#c9a6e6', guard: '#7fb7c9', gold: '#e3c06b', panel: 'rgba(12,14,13,0.86)',
};
const HEAD = 'Jost', TXT = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function fit(s, maxW, size, w = 400, f = TXT) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }
function rand(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// ---------- Budapest, schematic: equal-area projection around 47.5° N ----------
const LON0 = 19.025, LAT0 = 47.5175, PXKM = 140.7;
const B = (lon, lat) => [60 + (lon - LON0) * 75.1 * PXKM, 160 + (LAT0 - lat) * 111.2 * PXKM];
const PL = {
  parliament: [19.0458, 47.5070], astoria: [19.0605, 47.4935], bem: [19.0383, 47.5130], radio: [19.0640, 47.4917], stalin: [19.0845, 47.5060],
};
const XY = Object.fromEntries(Object.entries(PL).map(([key, [lo, la]]) => [key, B(lo, la)]));
const DANUBE = [[19.046, 47.540], [19.047, 47.527], [19.043, 47.514], [19.040, 47.506], [19.042, 47.499], [19.048, 47.492], [19.056, 47.486], [19.066, 47.478], [19.074, 47.468]].map(([lo, la]) => B(lo, la));

function river(pts, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}
function place(key, name, { dx = 14, dy = 0, align = 'left', a = 1, col = C.ink } = {}) {
  A(a, () => {
    const [x, y] = XY[key];
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
    font(500, 23, HEAD); text(name, x + dx, y + dy, { align, color: col });
  });
}
/** An arrow along a polyline, drawn to fraction g. */
function arrow(pts, g, col, { w = 6, dash = null } = {}) {
  if (g <= 0) return;
  const lens = []; let total = 0;
  for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); lens.push(l); total += l; }
  let left = total * clamp(g), end = pts[0], dir = [1, 0];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    end = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    dir = [(pts[i + 1][0] - pts[i][0]) / lens[i], (pts[i + 1][1] - pts[i][1]) / lens[i]];
    ctx.lineTo(...end); left -= lens[i];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const s = w * 2.4; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s); ctx.lineTo(end[0] - dir[1] * s * 0.7, end[1] + dir[0] * s * 0.7); ctx.lineTo(end[0] + dir[1] * s * 0.7, end[1] - dir[0] * s * 0.7); ctx.closePath(); ctx.fill();
}
/** A tank, as a simple shape seen from above; `flag` adds a small tricolour. */
function tank(x, y, ang, flag = 0, col = C.soviet) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col; k.rrect(-22, -13, 44, 26, 5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(28, 0); ctx.stroke();
  if (flag > 0) A(flag, () => {
    ctx.fillStyle = C.red; ctx.fillRect(-6, -30, 18, 5); ctx.fillStyle = '#ffffff'; ctx.fillRect(-6, -25, 18, 5); ctx.fillStyle = C.green; ctx.fillRect(-6, -20, 18, 5);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(-6, -8); ctx.stroke();
  });
  ctx.restore();
}

function sceneCity(t) {
  A(span(t, 0, 18.8, 0.5, 0.4), () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 170, W, 610); ctx.clip();
    river(DANUBE, 34, C.riverDim);
    ctx.restore();
    font(500, 22, HEAD); text('DANUBE', ...B(19.034, 47.488), { color: C.river, spacing: '3px' });
    text('BUDA', ...B(19.027, 47.500), { color: C.soft, spacing: '3px' }); text('PEST', ...B(19.075, 47.497), { color: C.soft, spacing: '3px' });
    font(800, 40, HEAD); text('BUDAPEST', 60, 100, { spacing: '3px' });
    font(400, 26, TXT); text('Thursday, 25 October 1956', 60, 140, { color: C.gold });
    font(400, 20, TXT); text('schematic map', 60, 760, { color: C.soft });
    place('parliament', 'Parliament', { dx: 16, dy: -18, a: seg(t, 1.0, 1.6) });
    place('astoria', 'Astoria', { dx: 16, dy: 18, a: seg(t, 1.4, 2.0), col: C.gold });
    // cues 2–3: the tanks at the Astoria, flags
    const [ax, ay] = XY.astoria;
    A(seg(t, 5.2, 5.8), () => {
      tank(ax + 50, ay - 70, -2.2, seg(t, 10.0, 10.8));
      tank(ax + 100, ay - 30, -2.4, seg(t, 10.4, 11.2));
      // the crowd around, dots
      const r = rand(3); for (let i = 0; i < 70; i++) { const a = r() * TAU, d = 30 + r() * 80; ctx.fillStyle = C.crowd; ctx.fillRect(ax + 70 + Math.cos(a) * d, ay - 40 + Math.sin(a) * d * 0.7, 4, 4); }
      A(seg(t, 6.0, 6.6) * (1 - seg(t, 13.6, 14.0)), () => { font(400, 23, TXT); text('people talk with the Soviet crews', ax + 70, ay + 110, { align: 'center', color: C.ink }); });
    });
    // cue 4: together to Parliament
    const g = eio(seg(t, 14.6, 17.6));
    const [px, py] = XY.parliament;
    arrow([[ax + 40, ay - 60], [ax - 40, ay - 230], [px + 30, py + 10]], g, C.gold, { w: 7 });
    A(seg(t, 16.0, 16.6), () => { font(400, 23, TXT); text('hoping to see Prime Minister Imre Nagy', CX, 700, { align: 'center', color: C.ink }); });
  });
}

// ---------- the square, schematic ----------
const SQ = { river: 120, parl: [150, 250, 170, 380], ministry: [640, 300, 150, 240], statue: [420, 600] };
const CROWD = (() => { const r = rand(11); const out = []; for (let i = 0; i < 260; i++) out.push([350 + r() * 260, 330 + r() * 330]); return out; })();
function square(a, dim = 0) {
  A(a * (1 - dim * 0.5), () => {
    ctx.fillStyle = C.riverDim; ctx.fillRect(0, 180, SQ.river, 600);
    font(500, 20, HEAD); ctx.save(); ctx.translate(60, 480); ctx.rotate(-Math.PI / 2); text('DANUBE', 0, 0, { align: 'center', color: C.river, spacing: '3px' }); ctx.restore();
    const [x, y, w, h] = SQ.parl;
    ctx.fillStyle = C.stoneDim; ctx.fillRect(x, y, w, h); ctx.strokeStyle = C.stone; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 34, 0, TAU); ctx.fill();
    font(600, 22, HEAD); ctx.save(); ctx.translate(x + w / 2, y + h - 40); text('PARLIAMENT', 0, 0, { align: 'center', color: C.stone, spacing: '2px' }); ctx.restore();
    const [mx, my, mw, mh] = SQ.ministry;
    ctx.fillStyle = C.stoneDim; ctx.fillRect(mx, my, mw, mh); ctx.strokeStyle = C.stone; ctx.strokeRect(mx, my, mw, mh);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(207,198,176,0.5)'; ctx.beginPath(); ctx.arc(mx + 4, my + 30 + i * 36, 12, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
    fit('MINISTRY OF', mw - 20, 20, 600, HEAD); text('MINISTRY OF', mx + mw / 2, my + mh / 2 - 14, { align: 'center', color: C.stone }); fit('AGRICULTURE', mw - 20, 20, 600, HEAD); text('AGRICULTURE', mx + mw / 2, my + mh / 2 + 14, { align: 'center', color: C.stone });
    // side streets
    ctx.fillStyle = 'rgba(240,237,230,0.08)'; ctx.fillRect(640, 560, 224, 60); ctx.fillRect(640, 230, 224, 50);
    font(400, 21, TXT); text('to Akadémia St.', 852, 590, { align: 'right', color: C.soft }); text('to Báthory St.', 852, 255, { align: 'right', color: C.soft });
    font(400, 20, TXT); text('Kossuth Square · schematic plan', 150, 760, { color: C.soft });
  });
}
function crowd(n, a) { A(a, () => { ctx.fillStyle = C.crowd; for (let i = 0; i < n; i++) { const [x, y] = CROWD[i]; ctx.fillRect(x - 2, y - 2, 4, 4); } }); }
const ACCOUNTS = {
  tanks: { col: C.soviet, lines: [[[850, 590], [560, 600], [440, 610]], [[850, 255], [600, 300], [470, 560]]] },
  roofs: { col: C.roof, lines: [[[650, 330], [520, 420]], [[650, 450], [500, 500]], [[650, 520], [470, 560]]] },
  guards: { col: C.guard, lines: [[[330, 360], [400, 420]], [[330, 520], [400, 520]]] },
};
function account(key, g, a = 1) { A(a, () => { const { col, lines } = ACCOUNTS[key]; lines.forEach((p) => arrow(p, g, col, { w: 4, dash: [10, 8] })); }); }

function sceneSquare(t) {
  A(span(t, 18.6, 46.4, 0.5, 0.4), () => {
    square(1);
    font(800, 34, HEAD); text('KOSSUTH SQUARE', 150, 100, { spacing: '3px' }); font(400, 24, TXT); text('about 11 a.m. to noon', 150, 138, { color: C.gold });
    // cue 5: the crowd fills the square; tanks by Parliament
    crowd(Math.floor(seg(t, 19.0, 22.0) * CROWD.length), 1);
    tank(350, 300, 0, 1); tank(350, 640, 0, 1);
    A(seg(t, 20.6, 21.2) * (1 - seg(t, 22.8, 23.2)), () => { ctx.fillStyle = C.panel; k.rrect(360, 170, 470, 50, 10); ctx.fill(); fit('crowd estimates: 3,000 to over 20,000', 440, 22, 500, HEAD); text('crowd estimates: 3,000 to over 20,000', 595, 196, { align: 'center', color: C.ink }); });
    // cue 6: shooting from several sides at once: three short pulses
    A(span(t, 23.4, 28.0, 0.3, 0.3), () => {
      for (const key of ['tanks', 'roofs', 'guards']) account(key, eio(seg(t, 24.0, 25.6)), 0.6);
    });
    // cues 7–9: one account at a time
    const accs = [['tanks', 28.0, 'Account 1: Soviet tanks in the side streets', 'András Kő and Lambert Nagy'], ['roofs', 32.6, 'Account 2: shots from rooftops and the ministry', 'Edit Kéri; the UN report of 1957'], ['guards', 37.2, 'Account 3: border guards at ground level', 'military historian Miklós Horváth']];
    for (const [key, t0, title, who] of accs) {
      A(span(t, t0, t0 + 4.6, 0.3, 0.3), () => {
        account(key, eio(seg(t, t0 + 0.3, t0 + 1.6)));
        ctx.fillStyle = C.panel; k.rrect(150, 168, 680, 66, 10); ctx.fill();
        fit(title, 650, 23, 600, HEAD); text(title, 490, 190, { align: 'center', color: ACCOUNTS[key].col });
        font(400, 19, TXT); text(who, 490, 218, { align: 'center', color: C.soft });
      });
    }
    // cue 10: the tanks that came with the crowd fire back at the buildings
    A(span(t, 41.8, 46.4, 0.3, 0.3), () => {
      arrow([[370, 300], [600, 360]], eio(seg(t, 42.2, 43.4)), C.gold, { w: 4, dash: [10, 8] });
      arrow([[370, 640], [610, 520]], eio(seg(t, 42.4, 43.6)), C.gold, { w: 4, dash: [10, 8] });
      ctx.fillStyle = C.panel; k.rrect(150, 168, 680, 66, 10); ctx.fill();
      font(600, 23, HEAD); text('Tanks that came with the crowd fire back', 490, 190, { align: 'center', color: C.gold });
      font(400, 19, TXT); text('the UN report of 1957, from witnesses', 490, 218, { align: 'center', color: C.soft });
    });
  });
}

// ---------- C: how many died ----------
const MARKS = [[22, 'the regime’s “White Book”, 1957', C.soft], [75, 'named one by one: András Kő and Lambert Nagy, 2001', C.gold], [300, 'the UN report, 1957: estimates', C.roof], [1000, 'some eyewitnesses', C.soft]];
function sceneToll(t) {
  A(span(t, 46.2, 60.2, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('HOW MANY DIED?', CX, 160, { align: 'center', spacing: '3px' });
    fit('estimates of the dead at Kossuth Square, 25 October 1956', W - 160, 24); text('estimates of the dead at Kossuth Square, 25 October 1956', CX, 200, { align: 'center', color: C.soft });
    const x0 = 90, x1 = W - 90, y = 400, X = (v) => x0 + (x1 - x0) * (v / 1000);
    ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 4, x1 - x0, 8);
    font(400, 20, TXT); [0, 250, 500, 750, 1000].forEach((v) => { ctx.fillStyle = C.faint; ctx.fillRect(X(v) - 1, y - 12, 2, 24); text(fmt(v), X(v), y + 34, { align: 'center', color: C.soft }); });
    const when = [47.0, 47.8, 51.6, 52.4];
    const legend = 1 - seg(t, 55.6, 56.0);
    MARKS.forEach(([v, name, col], i) => {
      A(seg(t, when[i], when[i] + 0.6), () => {
        if (v === 300) { ctx.fillStyle = 'rgba(201,166,230,0.35)'; ctx.fillRect(X(300), y - 10, X(800) - X(300), 20); }
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(v), y, 10, 0, TAU); ctx.fill();
        const above = i % 2 === 0;
        const label = v === 300 ? '300–800' : v === 1000 ? `≈ ${fmt(1000)}` : fmt(v);
        font(700, 30, HEAD); text(label, v === 300 ? (X(300) + X(800)) / 2 : X(v), above ? y - 40 : y - 40, { align: v === 1000 ? 'right' : v === 22 ? 'right' : v === 75 ? 'left' : 'center', color: col });
        // the legend, one row each
        A(legend, () => {
          const ly = 500 + i * 48;
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(120, ly, 8, 0, TAU); ctx.fill();
          font(700, 24, HEAD); text(label, 142, ly, { color: col });
          fit(name, W - 330, 23, 400); text(name, 290, ly, { color: C.soft });
        });
      });
    });
    // cue 13: no one called to account
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 540, W - 220, 110, 14); ctx.fill();
      font(600, 28, HEAD); text('No one was called to account.', CX, 576, { align: 'center', color: C.ink });
      font(400, 24, TXT); text('Who gave the order is still not known.', CX, 616, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: Mosonmagyaróvár ----------
const HU = [[16.11, 46.87], [16.5, 47.4], [16.44, 47.7], [16.9, 47.72], [17.07, 48.03], [17.5, 47.88], [18.1, 47.75], [18.7, 47.88], [18.85, 48.05], [19.5, 48.1], [19.9, 48.17], [20.3, 48.26], [20.8, 48.57], [21.44, 48.58], [21.72, 48.34], [22.15, 48.4], [22.9, 47.95], [22.32, 47.75], [21.95, 47.37], [21.65, 46.95], [21.27, 46.62], [21.18, 46.4], [20.7, 46.17], [20.26, 46.13], [19.57, 46.17], [19.0, 45.98], [18.8, 45.88], [18.3, 45.76], [17.65, 45.95], [17.25, 46.3], [16.88, 46.38], [16.52, 46.5], [16.11, 46.87]];
const HXY = (lon, lat) => [90 + (lon - 16.1) * 101, 260 + (48.6 - lat) * 150];
function sceneMoson(t) {
  A(seg(t, 60.2, 60.8), () => {
    font(800, 34, HEAD); text('26 OCTOBER 1956', CX, 150, { align: 'center', spacing: '3px', color: C.gold });
    ctx.fillStyle = 'rgba(240,237,230,0.07)'; ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    ctx.beginPath(); HU.forEach(([lo, la], i) => (i ? ctx.lineTo(...HXY(lo, la)) : ctx.moveTo(...HXY(lo, la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    font(400, 20, TXT); text('Hungary · schematic', 100, 700, { color: C.soft });
    const [bx, by] = HXY(19.04, 47.5), [mx, my] = HXY(17.27, 47.87);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill(); font(500, 22, HEAD); text('Budapest', bx + 14, by + 4, { color: C.ink });
    const g = seg(t, 60.8, 61.4);
    A(g, () => {
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 18 + 4 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      font(600, 24, HEAD); text('Mosonmagyaróvár', mx, my - 32, { align: 'center', color: C.red });
    });
    A(seg(t, 61.6, 62.2), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 560, W - 220, 100, 14); ctx.fill();
      fit('border guards fire on an unarmed crowd at their barracks', W - 260, 24, 500); text('border guards fire on an unarmed crowd at their barracks', CX, 592, { align: 'center', color: C.ink });
      font(400, 22, TXT); text('reports at the time: 59 to 105 dead', CX, 628, { align: 'center', color: C.soft });
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
  [0.4, 4.8, 'Budapest, Thursday 25 October 1956: the third day of the *uprising*.'],
  [5.0, 9.4, 'In the morning, near the Astoria hotel, people talk with the crews of *Soviet tanks*.'],
  [9.6, 14.0, 'Some crews let them climb aboard; *Hungarian flags* fly from the turrets.'],
  [14.2, 18.6, 'Together they head for Parliament, in Kossuth Square, hoping to see *Imre Nagy*.'],
  [18.8, 23.2, 'The square fills: estimates of the crowd run from *3,000* to over *20,000*.'],
  [23.4, 27.8, 'Between 11 and 12 o’clock, ~shooting~ begins from several directions at once.'],
  [28.0, 32.4, 'One account: Soviet tanks in the side streets fired into the crowd.'],
  [32.6, 37.0, 'Another: shots came from the rooftops and from the Ministry of Agriculture.'],
  [37.2, 41.6, 'Newer research adds Hungarian border guards firing at ground level.'],
  [41.8, 46.2, 'The tanks that had come with the crowd *fired back* at the buildings.'],
  [46.4, 50.8, 'How many died? The regime said *22*; a count by name found at least *75*.'],
  [51.0, 55.4, 'The UN report gave estimates of *300 to 800*; some witnesses speak of 1,000.'],
  [55.6, 60.0, 'No one was called to account; who gave the order is ~still not known~.'],
  [60.2, 64.6, 'Next day at Mosonmagyaróvár, border guards fired on another ~unarmed crowd~.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneCity(t);
    sceneSquare(t);
    sceneToll(t);
    sceneMoson(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.red } });
  },
});
