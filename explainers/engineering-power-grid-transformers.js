// Explainer for engineering-power-grid-transformers: why a damaged power grid can take so long to repair.
// Hook: on 14 October 2026 Kyiv's mayor said missile strikes on energy facilities had cut power in the city.
// The idea: the grid's big transformers step voltage up for transmission (so the current, and the heat lost
// in the wires, are small) and down again for use; the largest are huge, custom-built and slow to replace.
// Look: a dark slate night, amber for power, copper windings, steel-blue iron, red for heat losses. Barlow
// for captions and labels, Azeret Mono for the meter-style numbers.
//
// Computed here: the loss example, the same as the post's lab: 10 MW sent through a line of 5 ohms (a
// simplified single line): I = P/V and loss = I²R, so 10 kV gives 1,000 A and 5 MW lost (half), 100 kV gives
// 100 A and 0.05 MW lost (0.5%): ten times the voltage, a hundredth of the loss. The transformer's turns
// ratio sets the voltage ratio.
// Facts: Meduza (14 October 2026), citing Kyiv mayor Vitali Klitschko: a massive missile strike hit energy
// facilities in Kyiv and the Kyiv region and caused power outages in the capital. US Department of Energy,
// "Large Power Transformers and the U.S. Electric Grid" (2012): transformers step voltage up for transmission
// and down for distribution; electricity is generally generated at 5–34.5 kV and transmitted at 115–765 kV
// for low-loss transmission; large power transformers are custom-designed, cost millions of dollars and
// weigh about 100 to 400 tons; about 1.3 are made for each design; a core of electrical steel and copper
// windings; the heaviest load a railroad normally carries is about 100 tons, so they need special railcars.
// DOE, "Large Power Transformer Resilience" report to Congress (2024): about 90% of the electricity used in
// the US passes through a large power transformer; 36-month lead times are commonly quoted and up to 60
// months; before the pandemic, under a year was possible; spares and sharing programmes are the main defence.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: a city at night loses its lights; the transformer.
//  B  9.0–36.8  Up and down: the chain from station to homes; power = volts × amps; losses grow with the
//               current squared; ten times the voltage, a hundredth of the loss; real line voltages.
//  C 36.8–46.0  Inside: two coils on an iron core; 90% of US electricity passes through one.
//  D 46.0–59.6  Why replacing one is slow: weight, custom designs, years of lead time, special railcars.
//  E 59.8–64.6  Spares, kept and shared.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f131a', bg2: '#1a2230', ink: '#f1f4f8', soft: 'rgba(241,244,248,0.72)', faint: 'rgba(241,244,248,0.22)',
  amber: '#ffb000', copper: '#d9824a', steel: '#7cb7e6', heat: '#ff5a4f', ok: '#6ee7a8', panel: 'rgba(8,11,16,0.74)', tank: '#5d6b7d', tank2: '#46525f',
};
const CAP = 'Barlow', NUM = 'Azeret Mono';

let k, ctx;
const font = (w, s, f = CAP) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

// ---------- the loss example (as in the lab) ----------
const P_MW = 10, R_OHM = 5;
const lineAt = (kV) => { const amps = (P_MW * 1e6) / (kV * 1e3), lossMW = (amps * amps * R_OHM) / 1e6; return { amps, lossMW, share: lossMW / P_MW }; };
const LOW = lineAt(10), HIGH = lineAt(100);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 14 October 2026, Kyiv’s mayor said missile strikes on energy sites had cut power.'],
  [4.8, 9.0, 'Repairing a grid can take a long time. One reason is a machine: the *transformer*.'],
  [9.2, 13.6, 'Transformers step voltage ~up~ for long power lines, then back *down* for homes.'],
  [13.8, 18.2, 'Why? Power is voltage times current. More volts carry the same power with fewer amps.'],
  [18.4, 22.8, 'Wires waste some power as heat, and the loss grows with the ^square^ of the current.'],
  [23.0, 27.4, 'Ten times the voltage means a tenth of the current, and a ^hundredth^ of the loss.'],
  [27.6, 32.0, 'So in the US, big lines run at *115,000* to *765,000* volts.'],
  [32.2, 36.6, 'Inside, two copper coils share an iron core. Their turns set the voltage ratio.'],
  [36.8, 41.2, 'About *90%* of the electricity used in the US passes through a large transformer.'],
  [41.4, 45.8, 'The biggest weigh some *100 to 400 tons*, says the US Department of Energy.'],
  [46.0, 50.4, 'Most are custom-built for one spot: only about 1.3 are made of each design.'],
  [50.6, 55.0, 'A new one often takes *three years* to arrive, and up to five.'],
  [55.2, 59.6, 'Even moving one is hard: ordinary rail cars carry about 100 tons, so they need special ones.'],
  [59.8, 64.2, 'That is why grid companies keep spare transformers, and set up schemes to share them.'],
];

// ---------- background ----------
let bg = null;
const WINDOWS = [];
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(241,244,248,${0.1 + r() * 0.4})`; g.fillRect(r() * W, r() * 420, 1.4, 1.4); }
  // a skyline for the hook; its windows are drawn per frame
  let x = 20;
  while (x < W - 20) {
    const w = 50 + r() * 70, h = 120 + r() * 230;
    WINDOWS.push({ x, w, h, lit: [] });
    for (let wy = 0; wy < h - 30; wy += 26) for (let wx = 8; wx < w - 12; wx += 18) WINDOWS.at(-1).lit.push({ dx: wx, dy: wy, off: r() });
    x += w + 6 + r() * 10;
  }
}

function skyline(t, dark) {
  const base = 720;
  for (const b of WINDOWS) {
    ctx.fillStyle = '#0a0d12'; ctx.fillRect(b.x, base - b.h, b.w, b.h);
    for (const w of b.lit) {
      const on = w.off > dark;
      ctx.fillStyle = on ? 'rgba(255,196,90,0.85)' : 'rgba(80,90,105,0.25)';
      ctx.fillRect(b.x + w.dx, base - b.h + 14 + w.dy, 9, 12);
    }
  }
}

function transformer(cx, cy, s, glow = 0) {
  // a substation transformer: a tank with cooling fins, three bushings on top
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = C.tank2; ctx.fillRect(-150 + i * 12, -40, 6, 140); ctx.fillRect(100 + i * 12 - 50, -40, 6, 140); }
  ctx.fillStyle = C.tank; k.rrect(-110, -70, 220, 190, 10); ctx.fill();
  ctx.fillStyle = C.tank2; ctx.fillRect(-110, -70, 220, 16);
  for (const bx of [-60, 0, 60]) {
    ctx.fillStyle = '#c9d2dc';
    for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.ellipse(bx, -82 - j * 16, 14 - j, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(bx - 5, -170, 10, 90);
    if (glow > 0) circle(bx, -172, 8 * glow, C.amber);
  }
  ctx.fillStyle = C.tank2; ctx.fillRect(-120, 120, 240, 14);
  ctx.restore();
}

function pylon(x, base, h, color = 'rgba(241,244,248,0.55)') {
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 22, base); ctx.lineTo(x, base - h); ctx.lineTo(x + 22, base); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 30, base - h * 0.8); ctx.lineTo(x + 30, base - h * 0.8); ctx.moveTo(x - 22, base - h * 0.6); ctx.lineTo(x + 22, base - h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 14, base - h * 0.35); ctx.lineTo(x + 14, base - h * 0.55); ctx.moveTo(x + 14, base - h * 0.35); ctx.lineTo(x - 14, base - h * 0.55); ctx.stroke();
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.2, 9.2, 0.6, 0.4), () => {
      font(600, 26, NUM); text('KYIV · 14 OCTOBER 2026', 60, 100, { color: C.amber, base: 'middle' });
    });
    A(1 - seg(t, 4.6, 5.4), () => skyline(t, eio(seg(t, 1.6, 4.0)) * 0.9));
    A(seg(t, 4.8, 5.6), () => {
      transformer(W / 2, 470, 1.25, 0);
      font(700, 34); text('a large power transformer', W / 2, 700, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}

const CHAIN = [[100, 'power station', '5–35 kV'], [260, 'step up', ''], [432, 'long-distance line', '115–765 kV'], [604, 'step down', ''], [764, 'homes', 'low voltage']];
function sceneUpDown(t) {
  const a = span(t, 9.2, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the chain from power station to homes, with voltage as the height of the line
    A(1 - seg(t, 13.6, 14.2), () => {
      const y = 470, lev = [90, 90, 240, 240, 50];
      const p = eout(seg(t, 9.4, 12.0));
      ctx.strokeStyle = C.amber; ctx.lineWidth = 5;
      const pts = [[100, lev[0]], [260, lev[0]], [300, lev[2]], [564, lev[2]], [604, lev[4]], [764, lev[4]]];
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, lerp(100, 780, p), H); ctx.clip();
      ctx.beginPath(); pts.forEach(([x, h], i) => (i ? ctx.lineTo(x, y - h) : ctx.moveTo(x, y - h))); ctx.stroke(); ctx.restore();
      font(600, 22, NUM); text('voltage', 70, 180, { color: C.amber, base: 'middle' });
      // icons along the bottom
      const iy = 600;
      ctx.fillStyle = C.tank; ctx.fillRect(70, iy - 40, 60, 50); ctx.fillRect(84, iy - 80, 14, 40); // station
      transformer(260, iy - 20, 0.28); transformer(604, iy - 20, 0.28);
      pylon(400, iy + 10, 80); pylon(470, iy + 10, 80);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(740, iy - 20); ctx.lineTo(764, iy - 44); ctx.lineTo(788, iy - 20); ctx.closePath(); ctx.fill(); ctx.fillRect(744, iy - 20, 40, 30);
      CHAIN.forEach(([x, lab, v], i) => A(eout(seg(t, 9.6 + i * 0.35, 10.2 + i * 0.35)), () => {
        font(700, 24); text(lab, x, iy + 46, { color: C.ink, align: 'center', base: 'middle' });
        if (v) { font(600, 20, NUM); text(v, x, iy + 76, { color: C.amber, align: 'center', base: 'middle' }); }
      }));
      A(seg(t, 10.8, 11.4), () => { font(800, 30); text('UP', 236, y - 170, { color: C.amber, align: 'right', base: 'middle' }); text('DOWN', 628, y - 170, { color: C.amber, base: 'middle' }); });
      font(500, 20); text('US figures, Department of Energy', W / 2, 720, { color: C.faint, align: 'center', base: 'middle' });
    });
    // power = volts × amps, and the losses
    A(span(t, 13.8, 27.6, 0.4, 0.4), () => {
      font(700, 40, NUM); text('power = volts × amps', W / 2, 140, { color: C.ink, align: 'center', base: 'middle' });
      A(seg(t, 18.4, 19.0), () => { font(700, 34, NUM); text('heat lost = amps² × resistance', W / 2, 200, { color: C.heat, align: 'center', base: 'middle' }); });
      const rows = [[LOW, 10, 330], [HIGH, 100, 560]];
      rows.forEach(([r, kV, y], i) => {
        const g = eout(seg(t, 14.2 + i * 1.6, 15.0 + i * 1.6));
        A(g, () => {
          font(700, 26); text(`${P_MW} MW sent at ${kV} kV`, 70, y - 70, { color: C.ink, base: 'middle' });
          // the wire: thickness shows the current, glow shows the heat
          const heat = seg(t, 18.6, 19.6) * Math.sqrt(r.share * 2);
          if (heat > 0) { ctx.strokeStyle = `rgba(255,90,79,${0.5 * heat})`; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(560, y); ctx.stroke(); }
          ctx.strokeStyle = C.copper; ctx.lineWidth = 4 + 16 * (r.amps / LOW.amps); ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(560, y); ctx.stroke();
          // moving charges, faster for more current
          for (let j = 0; j < 8; j++) { const x = 70 + ((j * 61 + (t - 14) * (r.amps / 4)) % 490); circle(x, y, 4, C.ink); }
          font(700, 28, NUM); text(`${fmt(r.amps)} A`, 600, y - 18, { color: C.amber, base: 'middle' });
          A(seg(t, 18.6, 19.4), () => text(`lost: ${r.share >= 0.1 ? Math.round(r.share * 100) : (r.share * 100).toFixed(1)}%`, 600, y + 22, { color: C.heat, base: 'middle' }));
        });
      });
      A(span(t, 23.0, 27.6), () => {
        ctx.fillStyle = C.panel; k.rrect(140, 650, 584, 80, 14); ctx.fill();
        font(700, 30, NUM); text(`× 10 volts  →  ÷ ${Math.round(LOW.lossMW / HIGH.lossMW)} loss`, W / 2, 690, { color: C.ok, align: 'center', base: 'middle' });
      });
      font(500, 20); text(`simplified: one line with ${R_OHM} ohms of resistance`, W / 2, 760, { color: C.faint, align: 'center', base: 'middle' });
    });
    // real line voltages
    A(span(t, 27.6, 32.2, 0.4, 0.3), () => {
      const base = 660;
      for (const [x, h] of [[150, 220], [430, 300], [710, 380]]) pylon(x, base, h);
      ctx.strokeStyle = 'rgba(255,176,0,0.6)'; ctx.lineWidth = 2;
      for (const off of [0.8, 0.6]) { ctx.beginPath(); ctx.moveTo(0, base - 200 * off); ctx.quadraticCurveTo(290, base - 220 * off + 40, 430, base - 300 * off); ctx.quadraticCurveTo(570, base - 300 * off + 40, 710, base - 380 * off); ctx.lineTo(W, base - 380 * off - 10); ctx.stroke(); }
      font(700, 30, NUM); text('115 kV', 150, base - 250, { color: C.amber, align: 'center', base: 'middle' }); text('345 kV', 430, base - 330, { color: C.amber, align: 'center', base: 'middle' }); text('765 kV', 700, base - 410, { color: C.amber, align: 'center', base: 'middle' });
    });
    // inside: two coils on a core
    A(span(t, 32.2, 36.8, 0.4, 0.3), () => {
      const cx = W / 2, cy = 430;
      ctx.strokeStyle = C.steel; ctx.lineWidth = 46; ctx.strokeRect(cx - 220, cy - 170, 440, 340);
      const coil = (x, turns, color, lab, v) => {
        ctx.strokeStyle = color; ctx.lineWidth = 6;
        for (let i = 0; i < turns; i++) { const y = cy - 120 + (i * 240) / (turns - 1); ctx.beginPath(); ctx.ellipse(x, y, 44, 9, 0, 0, Math.PI * 2); ctx.stroke(); }
        font(700, 26); text(lab, x, cy + 220, { color, align: 'center', base: 'middle' });
        font(600, 24, NUM); text(v, x, cy + 254, { color: C.soft, align: 'center', base: 'middle' });
      };
      coil(cx - 220, 6, C.copper, 'in: 6 turns', '10 kV');
      coil(cx + 220, 30, C.copper, 'out: 30 turns', '50 kV');
      font(600, 24); text('iron core', cx, cy, { color: C.steel, align: 'center', base: 'middle' });
    });
  });
}

function sceneScale(t) {
  const a = span(t, 36.8, 59.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // 90% of US electricity
    A(1 - seg(t, 41.2, 41.8), () => {
      for (let i = 0; i < 100; i++) {
        const x = 150 + (i % 10) * 58, y = 170 + Math.floor(i / 10) * 52, on = i < 90 && t > 37.2 + i * 0.02;
        ctx.fillStyle = on ? C.amber : 'rgba(241,244,248,0.15)';
        ctx.beginPath(); ctx.moveTo(x + 4, y - 18); ctx.lineTo(x - 10, y + 4); ctx.lineTo(x + 1, y + 4); ctx.lineTo(x - 4, y + 20); ctx.lineTo(x + 12, y - 4); ctx.lineTo(x + 1, y - 4); ctx.closePath(); ctx.fill();
      }
      font(500, 22); text('each bolt: 1% of the electricity used in the US', W / 2, 720, { color: C.soft, align: 'center', base: 'middle' });
    });
    // the weight
    A(span(t, 41.4, 46.0, 0.4, 0.3), () => {
      transformer(W / 2, 430, 1.35, 0);
      font(800, 64, NUM); text('100–400 t', W / 2, 160, { color: C.amber, align: 'center', base: 'middle' });
      font(500, 22); text('t = US tons of 2,000 pounds; about 90 to 360 tonnes', W / 2, 720, { color: C.soft, align: 'center', base: 'middle' });
    });
    // custom designs
    A(span(t, 46.0, 50.6, 0.4, 0.3), () => {
      const shapes = [[0.6, 1.0], [0.8, 0.8], [0.5, 1.2], [0.9, 1.0], [0.7, 0.7], [0.55, 0.9]];
      shapes.forEach(([sx, sy], i) => {
        const g = eout(seg(t, 46.2 + i * 0.25, 46.8 + i * 0.25));
        A(g, () => {
          ctx.save(); ctx.translate(170 + (i % 3) * 262, 330 + Math.floor(i / 3) * 250); ctx.scale(sx, sy);
          transformer(0, 0, 0.75); ctx.restore();
        });
      });
      font(700, 30); text('each built to fit one place', W / 2, 140, { color: C.ink, align: 'center', base: 'middle' });
    });
    // lead time
    A(span(t, 50.6, 55.2, 0.4, 0.3), () => {
      const L = 100, R = 780, y = 420, X = (m) => L + (m / 60) * (R - L);
      font(700, 30); text('waiting time for a new one, months', L, 220, { color: C.ink, base: 'middle' });
      ctx.fillStyle = 'rgba(241,244,248,0.12)'; ctx.fillRect(L, y - 26, R - L, 52);
      const p = eout(seg(t, 50.8, 52.4));
      ctx.fillStyle = C.amber; ctx.fillRect(L, y - 26, (X(36) - L) * p, 52);
      ctx.fillStyle = 'rgba(255,176,0,0.35)'; ctx.fillRect(X(36), y - 26, (X(60) - X(36)) * eout(seg(t, 52.2, 53.4)), 52);
      for (const m of [0, 12, 24, 36, 48, 60]) { font(600, 22, NUM); text(`${m}`, X(m), y + 56, { color: C.soft, align: 'center', base: 'middle' }); }
      A(p, () => { font(700, 26); text('often quoted: 36', X(36), y - 60, { color: C.amber, align: 'center', base: 'middle' }); });
      A(seg(t, 53.0, 53.6), () => { font(700, 26); text('up to 60', X(60), y + 100, { color: C.amber, align: 'right', base: 'middle' }); });
      A(seg(t, 51.4, 52.0), () => { ctx.strokeStyle = C.ok; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(11), y - 40); ctx.lineTo(X(11), y + 40); ctx.stroke(); font(600, 22); text('before 2020: under a year', X(11), y + 100, { color: C.ok, align: 'center', base: 'middle' }); });
      font(500, 20); text('US, Department of Energy, 2024', W / 2, 720, { color: C.faint, align: 'center', base: 'middle' });
    });
    // the railcar
    A(span(t, 55.2, 59.6, 0.4, 0.4), () => {
      const y = 560;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, y + 46); ctx.lineTo(824, y + 46); ctx.stroke();
      // an ordinary flat car with its usual limit
      ctx.fillStyle = C.tank2; ctx.fillRect(60, y, 260, 22); for (const wx of [90, 130, 250, 290]) circle(wx, y + 34, 12, C.soft);
      ctx.fillStyle = C.steel; ctx.fillRect(110, y - 60, 160, 60);
      font(700, 26, NUM); text('≈100 t', 190, y - 30, { color: C.bg1, align: 'center', base: 'middle' });
      font(600, 22); text('ordinary rail car', 190, y + 80, { color: C.soft, align: 'center', base: 'middle' });
      // a long special car carrying the transformer between its two halves
      const sx = lerp(900, 600, eout(seg(t, 55.4, 57.0)));
      ctx.fillStyle = C.tank2; ctx.fillRect(sx - 230, y - 6, 120, 28); ctx.fillRect(sx + 110, y - 6, 120, 28);
      for (const wx of [-215, -185, -155, -125, 125, 155, 185, 215]) circle(sx + wx, y + 34, 11, C.soft);
      transformer(sx, y - 110, 0.62);
      font(700, 26, NUM); text('2–3 times heavier', sx, y - 250, { color: C.amber, align: 'center', base: 'middle' });
      font(600, 22); text('special rail car', sx, y + 80, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

function sceneSpare(t) {
  const a = span(t, 59.8, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // a spare waiting in a yard, then the city's lights come back
    skyline(t, 0.9 * (1 - eio(seg(t, 61.6, 63.8))));
    ctx.fillStyle = 'rgba(15,19,26,0.82)'; k.rrect(60, 150, 744, 240, 18); ctx.fill();
    transformer(220, 290, 0.5, seg(t, 61.0, 61.6));
    font(700, 34); text('a spare, ready to go', 360, 250, { color: C.ok, base: 'middle' });
    font(500, 24); text('kept by grid companies, with schemes to share', 360, 300, { color: C.soft, base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [CAP, NUM],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneUpDown(t);
    sceneScale(t);
    sceneSpare(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 42, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.amber, '~': C.ok, '^': C.heat } });
  },
});
