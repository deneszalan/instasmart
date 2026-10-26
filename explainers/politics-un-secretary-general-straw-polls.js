// Explainer for politics-un-secretary-general-straw-polls: how the UN Security Council picks a candidate for
// Secretary-General, and why red ballots changed the 2026 race. Look: deep UN-blue night with the polar grid
// of the UN emblem in the background, the Council's horseshoe table with 15 seats, and ballot cards — white
// for elected members, red for the five permanent members — marked encourage, discourage or no opinion.
// Playfair Display for headings and big numbers, Inter for captions and labels.
//
// Facts: UN Charter, Art. 97 (the Secretary-General is appointed by the General Assembly upon the
// recommendation of the Security Council), Art. 23 (15 members: China, France, Russia, the UK and the US
// permanent; ten elected for two years), Art. 27 (non-procedural decisions need nine votes including the
// concurring votes of the permanent members). Wikipedia, "2026 United Nations Secretary-General selection":
// Guterres completes his second term on 31 December 2026; straw polls on 30 July, 21 August, 18 and
// 29 September, 7 and 16 October 2026; from the sixth poll the permanent members' ballots were colour-coded.
// AP (E. M. Lederer, 16 October 2026): members vote to "encourage", "discourage" or express "no opinion"; the
// poll was the first to use red ballots for the five powers; the three leading candidates each received two
// red "discourage" votes; none of the seven candidates has the support of all five. PassBlue (16 October
// 2026): Rebeca Grynspan 9 encourage, 5 discourage, 1 no opinion (permanent members 3 encourage,
// 2 discourage); Carolyn Rodrigues Birkett 8/6/1 (3 and 2); Rafael Grossi 8 encourage (2 and 2); a candidate
// needs at least nine encourage votes and no permanent-member veto. Wikipedia (2026 selection page) gives
// Grossi's full line as 8/6/1 with permanent members 2/2/1. Wikipedia, "2016 United Nations Secretary-General
// selection": six straw polls; in the sixth, on 5 October 2016, the permanent members voted on red ballots;
// Guterres had 13 encourage, 0 discourage and 2 no opinion (permanent members 4 encourage, 1 no opinion); the
// Council recommended him by acclamation in resolution 2311 on 6 October 2016.
// A red "discourage" is a signal of a possible veto, not a veto itself (Security Council Report).
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: Guterres's term ends; the Council recommends, the Assembly appoints.
//  B  9.0–23.6  The Council: 15 seats, 5 permanent; 9 votes and no veto; secret straw polls.
//  C 23.6–37.6  The ballots: encourage, discourage, no opinion; all alike until 16 October, then red.
//  D 37.6–51.4  The sixth poll: three leaders, each with two red discourages; nobody has all five.
//  E 51.4–60.0  2016: the first red-ballot poll and Guterres's 13–0–2.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#0d2742', bg2: '#123b60', grid: 'rgba(140,200,240,0.07)', ink: '#eef4fa', soft: 'rgba(238,244,250,0.72)', faint: 'rgba(238,244,250,0.3)',
  blue: '#5fbdf0', red: '#dc4a40', redSoft: '#f08a80', white: '#f5f2ea', paperInk: '#18304a', gold: '#f2c14e', seat: 'rgba(238,244,250,0.2)',
};
const SERIF = 'Playfair Display', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the polls (E = encourage, D = discourage, N = no opinion; P = from a permanent member) ----------
// Each line lists 15 ballots: the permanent members' first, then the elected members'.
const line = (pE, pD, pN, eE, eD, eN) => [...Array(pE).fill('E'), ...Array(pD).fill('D'), ...Array(pN).fill('N')].map((v) => ({ v, red: true }))
  .concat([...Array(eE).fill('E'), ...Array(eD).fill('D'), ...Array(eN).fill('N')].map((v) => ({ v, red: false })));
const POLL6 = [
  { name: 'Rebeca Grynspan', from: 'Costa Rica', ballots: line(3, 2, 0, 6, 3, 1) },
  { name: 'Carolyn Rodrigues Birkett', from: 'Guyana', ballots: line(3, 2, 0, 5, 4, 1) },
  { name: 'Rafael Grossi', from: 'Argentina', ballots: line(2, 2, 1, 6, 4, 0) },
];
const GUTERRES_2016 = line(4, 0, 1, 9, 0, 1);
const count = (b, v, red) => b.filter((x) => x.v === v && (red === undefined || x.red === red)).length;
const passes = (b) => count(b, 'E') >= 9 && count(b, 'D', true) === 0;
// sanity: the totals the reports give
POLL6.forEach((c) => { if (c.ballots.length !== 15) throw new Error(`${c.name}: ${c.ballots.length} ballots`); });

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'António Guterres’s second term as UN Secretary-General ends on *31 December 2026*.'],
  [4.8, 9.0, 'The General Assembly appoints his successor, on the Security Council’s *recommendation*.'],
  [9.2, 13.6, 'The Council has *15 members*: five permanent, and ten elected for two years.'],
  [13.8, 18.2, 'A recommendation needs *9 votes*, and no ~veto~ from China, France, Russia, the UK or the US.'],
  [18.4, 23.6, 'So first, members test each candidate in secret, informal *straw polls*.'],
  [23.8, 28.2, 'Each ballot says *encourage*, ~discourage~ or no opinion.'],
  [28.4, 33.0, 'In the first five polls all ballots looked alike: nobody could tell whose was whose.'],
  [33.2, 37.6, 'On 16 October, the sixth poll gave the five permanent members ~red ballots~.'],
  [37.8, 42.2, 'Rebeca Grynspan led with *9 encourages*: enough votes, on paper.'],
  [42.4, 46.8, 'But two of her discourages were ~red~, and so were two for each runner-up.'],
  [47.0, 51.4, 'A red discourage signals a possible veto: no one yet has all five permanent members.'],
  [51.6, 55.8, 'In 2016 the first red-ballot poll gave Guterres *13 encourages* and no discourage.'],
  [56.0, 60.0, 'The Council recommended him the next day. In 2026, the polls go on.'],
];

// ---------- background: the polar grid of the UN emblem ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 420, 60, W / 2, 500, 760);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 2;
  const cx = W / 2, cy = 470;
  for (let r = 70; r < 900; r += 70) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 16; i++) { const a = (Math.PI * 2 * i) / 16; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 1000, cy + Math.sin(a) * 1000); g.stroke(); }
  // olive-branch-like arcs, very faint
  g.strokeStyle = 'rgba(140,200,240,0.05)'; g.lineWidth = 14;
  g.beginPath(); g.arc(cx, cy, 520, Math.PI * 0.62, Math.PI * 0.95); g.stroke();
  g.beginPath(); g.arc(cx, cy, 520, Math.PI * 0.05, Math.PI * 0.38); g.stroke();
}

// ---------- the horseshoe table ----------
const HS = { cx: W / 2, cy: 430, r: 220 };
const seatAt = (i) => { const a = Math.PI * (1.15 - (1.3 * (i + 0.5)) / 15); return [HS.cx + Math.cos(a) * HS.r, HS.cy - Math.sin(a) * HS.r]; };
const P5_SEATS = [1, 4, 7, 10, 13]; // drawing positions only; real seating rotates alphabetically
function horseshoe(t, colorOf, grow = 1) {
  ctx.strokeStyle = 'rgba(238,244,250,0.5)'; ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(HS.cx, HS.cy, HS.r - 44, Math.PI * (2 - 1.15), Math.PI * (2 - 1.15) + Math.PI * 1.3 * grow); ctx.stroke();
  ctx.lineCap = 'butt';
  for (let i = 0; i < 15; i++) {
    const g = eout(clamp(grow * 1.4 - i / 15));
    if (g <= 0) continue;
    const [x, y] = seatAt(i);
    ctx.fillStyle = colorOf(i); ctx.beginPath(); ctx.arc(x, y, 19 * g, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- a ballot card ----------
function ballot(x, y, w, h, b, a = 1) {
  A(a, () => {
    ctx.fillStyle = b.red ? C.red : C.white; k.rrect(x - w / 2, y - h / 2, w, h, 5); ctx.fill();
    const ink = b.red ? C.white : C.paperInk, s = Math.min(w, h) * 0.26;
    ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2.5, w * 0.09); ctx.lineCap = 'round';
    ctx.beginPath();
    if (b.v === 'E') { ctx.moveTo(x - s, y); ctx.lineTo(x - s * 0.25, y + s * 0.8); ctx.lineTo(x + s * 1.1, y - s * 0.9); }
    else if (b.v === 'D') { ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); }
    else if (b.v === 'N') { ctx.moveTo(x - s * 0.8, y); ctx.lineTo(x + s * 0.8, y); }
    ctx.stroke(); ctx.lineCap = 'butt';
  });
}

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(600, 26); text('UNITED NATIONS · SECRETARY-GENERAL', CX, 150, { align: 'center', base: 'middle', color: C.blue, spacing: '3px' });
    });
    const up = eio(seg(t, 4.8, 5.8));
    A(eout(seg(t, 0.6, 1.6)) * (1 - up), () => {
      k.font(700, 64, SERIF); text('2017 – 2026', CX, 380, { align: 'center', base: 'middle' });
      font(500, 28); text('António Guterres, two five-year terms', CX, 450, { align: 'center', base: 'middle', color: C.soft });
      // the calendar running out
      const L = 172, R = 692, y = 540, f = eio(seg(t, 1.2, 4.2));
      ctx.fillStyle = C.faint; k.rrect(L, y, R - L, 18, 9); ctx.fill();
      ctx.fillStyle = C.blue; k.rrect(L, y, (R - L) * f, 18, 9); ctx.fill();
      font(600, 24); text('31 Dec 2026', R, y + 52, { align: 'right', base: 'middle', color: C.gold });
    });
    A(up, () => {
      const box = (x, y, w, title, sub, col) => {
        ctx.strokeStyle = col; ctx.lineWidth = 3; k.rrect(x - w / 2, y - 62, w, 124, 16); ctx.stroke();
        k.font(700, 36, SERIF); text(title, x, y - 14, { align: 'center', base: 'middle', color: col });
        font(500, 24); text(sub, x, y + 30, { align: 'center', base: 'middle', color: C.soft });
      };
      box(CX, 300, 420, 'Security Council', 'recommends a name', C.blue);
      box(CX, 560, 420, 'General Assembly', 'appoints', C.ink);
      const p = eio(seg(t, 5.6, 6.6));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(CX, 368); ctx.lineTo(CX, lerp(368, 488, p)); ctx.stroke();
      if (p > 0.9) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(CX - 14, 478); ctx.lineTo(CX + 14, 478); ctx.lineTo(CX, 496); ctx.fill(); }
      font(500, 22); text('UN Charter, Article 97', CX, 680, { align: 'center', base: 'middle', color: C.faint });
    });
  });
}

function sceneCouncil(t) {
  const a = span(t, 9.2, 23.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const red = eout(seg(t, 10.6, 11.4));
    horseshoe(t, (i) => (P5_SEATS.includes(i) && red > 0.5 ? C.redSoft : C.ink), seg(t, 9.3, 10.6));
    k.font(800, 88, SERIF); text('15', CX, HS.cy - 10, { align: 'center', base: 'middle' });
    font(500, 26); text('members', CX, HS.cy + 46, { align: 'center', base: 'middle', color: C.soft });
    A(span(t, 10.8, 13.8), () => {
      font(600, 24); text('5 permanent', 210, 640, { align: 'center', base: 'middle', color: C.redSoft });
      text('10 elected for 2 years', 620, 640, { align: 'center', base: 'middle', color: C.soft });
    });
    // nine votes and no veto
    A(span(t, 13.8, 18.6), () => {
      const y = 650, w = 38, gap = 8, x0 = CX - (15 * (w + gap) - gap) / 2;
      for (let i = 0; i < 15; i++) {
        const on = i < 9 && t > 14.2 + i * 0.12;
        ctx.fillStyle = on ? C.blue : C.seat; k.rrect(x0 + i * (w + gap), y - 18, w, 36, 6); ctx.fill();
      }
      font(700, 24); text('9 of 15', x0, y + 44, { base: 'middle', color: C.blue });
      text('+ no veto', x0 + 15 * (w + gap) - gap, y + 44, { align: 'right', base: 'middle', color: C.redSoft });
    });
    A(span(t, 18.4, 23.8), () => {
      font(600, 26); text('straw poll · secret · informal', CX, 680, { align: 'center', base: 'middle', color: C.gold });
      for (let i = 0; i < 15; i++) {
        const [x, y] = seatAt(i), p = eio(seg(t, 18.8 + i * 0.06, 19.8 + i * 0.06));
        ballot(lerp(x, CX + (i - 7) * 44, p), lerp(y, HS.cy + 150, p), 32, 46, { v: '', red: false }, p);
      }
    });
  });
}

function sceneBallots(t) {
  const a = span(t, 23.8, 37.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // one big ballot with the three answers
    A(span(t, 23.9, 28.4, 0.4, 0.4), () => {
      const opts = [['E', 'Encourage'], ['D', 'Discourage'], ['N', 'No opinion expressed']];
      ctx.fillStyle = C.white; k.rrect(212, 220, 440, 420, 14); ctx.fill();
      k.font(700, 30, SERIF); text('Candidate', 432, 272, { align: 'center', base: 'middle', color: C.paperInk });
      opts.forEach(([v, lab], i) => {
        const y = 360 + i * 92, g = eout(seg(t, 24.4 + i * 0.5, 25.0 + i * 0.5));
        A(g, () => {
          ctx.strokeStyle = C.paperInk; ctx.lineWidth = 3; k.rrect(250, y - 28, 56, 56, 6); ctx.stroke();
          ballot(278, y, 56, 56, { v, red: false });
          font(600, 28); text(lab, 330, y, { base: 'middle', color: C.paperInk });
        });
      });
    });
    // fifteen ballots, five polls, all alike; then the sixth with red
    A(span(t, 28.4, 37.8, 0.4, 0.4), () => {
      const polls = ['30 Jul', '21 Aug', '18 Sep', '29 Sep', '7 Oct', '16 Oct'];
      const sixth = eout(seg(t, 33.4, 34.4));
      polls.forEach((d, p) => {
        const y = 210 + p * 78, g = eout(seg(t, 28.6 + p * 0.35, 29.2 + p * 0.35));
        if (p === 5 && t < 33.2) return;
        A(p === 5 ? eout(seg(t, 33.2, 33.8)) : g * (1 - 0.45 * sixth), () => {
          font(600, 24); text(d, 140, y, { align: 'right', base: 'middle', color: p === 5 ? C.ink : C.soft });
          for (let i = 0; i < 15; i++) ballot(180 + i * 43 + 17, y, 34, 50, { v: '', red: p === 5 && i < 5 && sixth > 0.5 });
        });
      });
      A(sixth, () => { font(700, 26); text('5 red: the permanent members', CX, 700, { align: 'center', base: 'middle', color: C.redSoft }); });
    });
  });
}

function scenePoll6(t) {
  const a = span(t, 37.8, 51.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    k.font(700, 36, SERIF); text('Sixth straw poll · 16 October', CX, 150, { align: 'center', base: 'middle' });
    POLL6.forEach((c, r) => {
      const y = 270 + r * 150, show = r === 0 ? eout(seg(t, 37.9, 38.6)) : eout(seg(t, 42.4 + r * 0.6, 43.0 + r * 0.6));
      A(show, () => {
        font(700, 26); text(c.name, 96, y - 52, { base: 'middle' });
        font(500, 22); text(c.from, 768, y - 52, { align: 'right', base: 'middle', color: C.soft });
        // order: encourages, no opinion, discourages; red ones first in each group
        const order = ['E', 'N', 'D'].flatMap((v) => c.ballots.filter((b) => b.v === v).sort((p, q) => Number(q.red) - Number(p.red)));
        order.forEach((b, i) => {
          const x = 96 + i * 45 + 19, flag = b.red && b.v === 'D' && t > 42.6;
          ballot(x, y, 36, 52, b);
          if (flag) { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; k.rrect(x - 23, y - 31, 46, 62, 8); ctx.stroke(); }
        });
        font(600, 22);
        text(`${count(c.ballots, 'E')} encourage`, 96, y + 52, { base: 'middle', color: C.ink });
        text(`${count(c.ballots, 'D', true)} red discourage`, 768, y + 52, { align: 'right', base: 'middle', color: C.redSoft });
      });
    });
    A(span(t, 47.0, 51.6), () => {
      const n = POLL6.filter((c) => passes(c.ballots)).length;
      font(700, 28); text(`passing (9+ encourage, no red discourage): ${n}`, CX, 720, { align: 'center', base: 'middle', color: C.gold });
    });
  });
}

function scene2016(t) {
  const a = eout(seg(t, 51.6, 52.4));
  if (a <= 0) return;
  A(a, () => {
    k.font(700, 60, SERIF); text('2016', CX, 190, { align: 'center', base: 'middle', color: C.gold });
    font(500, 26); text('sixth straw poll · 5 October · the first with red ballots', CX, 250, { align: 'center', base: 'middle', color: C.soft });
    font(700, 28); text('António Guterres', 96, 340, { base: 'middle' });
    const order = ['E', 'N', 'D'].flatMap((v) => GUTERRES_2016.filter((b) => b.v === v).sort((p, q) => Number(q.red) - Number(p.red)));
    order.forEach((b, i) => ballot(96 + i * 45 + 19, 410, 36, 52, b, eout(seg(t, 52.0 + i * 0.07, 52.4 + i * 0.07))));
    font(600, 24);
    text(`${count(GUTERRES_2016, 'E')} encourage · ${count(GUTERRES_2016, 'D')} discourage · ${count(GUTERRES_2016, 'N')} no opinion`, CX, 478, { align: 'center', base: 'middle', color: C.ink });
    A(eout(seg(t, 56.0, 56.8)), () => {
      const s = 0.9 + 0.1 * back(seg(t, 56.0, 56.8));
      ctx.save(); ctx.translate(CX, 610); ctx.scale(s, s); ctx.rotate(-0.04);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 4; k.rrect(-250, -54, 500, 108, 12); ctx.stroke();
      k.font(700, 32, SERIF); text('Resolution 2311', 0, -14, { align: 'center', base: 'middle', color: C.blue });
      font(500, 22); text('6 October 2016 · by acclamation', 0, 26, { align: 'center', base: 'middle', color: C.soft });
      ctx.restore();
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneCouncil(t);
    sceneBallots(t);
    scenePoll6(t);
    scene2016(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.blue, '~': C.redSoft } });
  },
});
