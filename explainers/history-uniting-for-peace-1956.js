// Explainer for history-uniting-for-peace-1956: on 23 October 2026 Hungary marked 70 years since its 1956
// revolution. In the same fortnight of 1956, vetoes blocked the UN Security Council twice, over Suez (Britain and
// France) and over Hungary (the Soviet Union). The 1950 "Uniting for Peace" resolution let the Council hand each
// crisis to an emergency special session of the General Assembly, by a procedural vote that no veto could stop.
// The Assembly could only recommend: over Suez a ceasefire and the UN's first peacekeeping force followed; over
// Hungary its call was ignored. Look: a dark ink-blue night, typed UN documents on cream paper, the Council's 11
// chairs, vote tallies, the Hungarian tricolour with a hole in its centre (the symbol of 1956). Space Mono for the
// typed documents and tallies, Libre Franklin for captions.
//
// Facts:
// - Euronews (23 October 2026) and AP photos (Outlook India, 23 October 2026): Budapest's state commemoration of the
//   70th anniversary of the 1956 uprising against Soviet-backed rule; flag-raising ceremony on 23 October; the
//   flag with a hole cut in its middle symbolises the revolution.
// - UN, "Emergency special sessions" (un.org/en/ga/sessions/emergency.shtml): resolution 377 A (V), 3 November 1950;
//   such a session can be convened within 24 hours; "Such emergency special session shall be called if requested
//   by the Security Council on the vote of any seven members, or by a majority of the Members of the United
//   Nations"; 1st session: Middle East, requested by the Council, 1–10 November 1956; 2nd: Hungary, 4–10 Nov 1956.
// - UN Dag Hammarskjöld Library, Security Council meetings and outcomes 1956: 30 October, drafts S/3710 and
//   S/3713/Rev.1 not adopted, "vetoed by France and UK", 7-2-2 each; 31 October, S/RES/119 (1956), 7-2-2;
//   4 November, draft S/3730/Rev.1 not adopted, "vetoed by USSR", 9-1-0, and S/RES/120 (1956), 10-1-0.
//   Wikipedia, "UN Security Council Resolution 119": France and the UK voted against but could not block it, as it
//   was a procedural vote, which cannot be vetoed; "Resolution 120": one vote against, the Soviet Union.
// - UN Peacekeeping, UNEF I background: the first emergency special session convened on 1 November 1956; resolution
//   997 (ES-I), 2 November, an immediate ceasefire, 64 to 5 with 6 abstentions; resolution 1000 (ES-I), 5 November,
//   the emergency force, 57 to none with 19 abstentions; ceasefire at midnight GMT 7/8 November; first troops
//   15–16 November; "the first peacekeeping Force in United Nations history".
// - Wikipedia, "Hungarian Revolution of 1956": on 4 November the USSR vetoed the Council's resolution; resolution
//   120 sent the matter to the General Assembly; the Assembly voted 50 to 8, with 15 abstentions, for withdrawal;
//   the Kádár government rejected UN observers. The Council had 11 members then (7 + 2 + 2 in the tallies), 5 permanent.
// Computed here: whether each vote passes, as a procedural vote (7 of 11) or a substantive one (7 of 11 and no
// permanent member against).
//
// Scene plan (60.4 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.4  Budapest, 23 October 2026; 1956: Suez and Hungary within a week.
//  B  9.6–18.6  The Council of 11 and the veto; 30 October: Britain and France veto.
//  C 18.8–32.4  Uniting for Peace: a procedural vote; 31 October 7–2; ceasefire 64–5; the first peacekeepers.
//  D 41.8–50.8  4 November: the Soviet veto, then 10–1 to the Assembly; 50–8 for withdrawal.
//  E 51.0–60.4  Recommend, not compel.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#152232', bg2: '#0a121c', ink: '#f1ece2', soft: 'rgba(241,236,226,0.72)', faint: 'rgba(241,236,226,0.24)',
  paper: '#efe8d8', paperInk: '#24201a', paperSoft: 'rgba(36,32,26,0.6)', un: '#7fb2ff', veto: '#ff7a66', pass: '#86dba4',
  abst: 'rgba(241,236,226,0.45)', panel: 'rgba(0,0,0,0.3)', hu: ['#d0433f', '#f1ece2', '#3f8f5a'], perm: '#f2c45a',
};
const MONO = 'Space Mono', SANS = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the votes ----------
// The 5 permanent members by name; the 6 elected members are drawn unnamed. Only the recorded no-votes of permanent
// members are coloured on the chairs; the tallies give the rest.
// Seats in the Council's usual alphabetical order of 1956, elected members unnamed.
const COUNCIL = ['elected', 'elected', 'China', 'elected', 'France', 'elected', 'elected', 'Soviet Union', 'United Kingdom', 'United States', 'elected'];
const PERM = ['United States', 'United Kingdom', 'France', 'Soviet Union', 'China'];
const NEED = 7; // affirmative votes needed in an 11-member Council (procedural and substantive)
/** A vote: yes/no/abstain counts and which permanent members voted no. */
const passes = ({ yes, noPerm }, kind) => yes >= NEED && (kind === 'procedural' || noPerm.length === 0);
const V = {
  suezDraft: { yes: 7, no: 2, abst: 2, noPerm: ['United Kingdom', 'France'], kind: 'substantive' },
  res119: { yes: 7, no: 2, abst: 2, noPerm: ['United Kingdom', 'France'], kind: 'procedural' },
  huDraft: { yes: 9, no: 1, abst: 0, noPerm: ['Soviet Union'], kind: 'substantive' },
  res120: { yes: 10, no: 1, abst: 0, noPerm: ['Soviet Union'], kind: 'procedural' },
};
for (const [key, v, want] of [['suezDraft', V.suezDraft, false], ['res119', V.res119, true], ['huDraft', V.huDraft, false], ['res120', V.res120, true]]) {
  if (passes(v, v.kind) !== want) throw new Error(`${key} should ${want ? 'pass' : 'fail'}`);
}
const GA = { ceasefire: [64, 5, 6], unef: [57, 0, 19], hungary: [50, 8, 15] };

const CUES = [
  [0.4, 4.8, 'On 23 October 2026, Hungary marked 70 years since its 1956 revolution against Soviet-backed rule.'],
  [5.0, 9.4, 'That autumn, two crises reached the UN Security Council within days: Suez and Hungary.'],
  [9.6, 14.0, 'In 1956 the Council had 11 members. Each of the 5 permanent ones could block a decision: a *veto*.'],
  [14.2, 18.6, 'On 30 October, Britain and France vetoed two drafts on the fighting in Egypt, though 7 of 11 voted yes.'],
  [18.8, 23.2, 'A 1950 resolution, ^Uniting for Peace^, said: if a veto stalls the Council, the General Assembly can meet.'],
  [23.4, 27.8, 'Sending a crisis to the Assembly is a ~procedural~ vote, and procedural votes cannot be vetoed.'],
  [28.0, 32.4, 'On 31 October the Council voted 7 to 2 to call the Assembly. Britain and France could not stop it.'],
  [32.6, 37.0, 'In the Assembly, every member had one vote and no veto. On 2 November it called for a ceasefire, 64 to 5.'],
  [37.2, 41.6, 'On 5 November it set up a UN Emergency Force, 57 to none: the UN’s first peacekeeping force.'],
  [41.8, 46.2, 'On 4 November it was Hungary: the Soviet Union vetoed a draft, though 9 members voted for it.'],
  [46.4, 50.8, 'At the same meeting, the Council voted 10 to 1 to call the Assembly. That Soviet no was not a veto.'],
  [51.0, 55.4, 'The Assembly called on Soviet forces to leave Hungary, 50 to 8. They stayed.'],
  [55.6, 60.0, 'Over Suez a ceasefire took hold; over Hungary the call was ignored. The Assembly can recommend, not compel.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint world-map-like latitude rings, as on the UN emblem
  g.strokeStyle = 'rgba(127,178,255,0.05)'; g.lineWidth = 2;
  for (let r = 80; r < 700; r += 70) { g.beginPath(); g.arc(CX, 430, r, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(CX, 430); g.lineTo(CX + Math.cos((i * Math.PI) / 6) * 700, 430 + Math.sin((i * Math.PI) / 6) * 700); g.stroke(); }
  let s = 29; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,245,230,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- drawings ----------
function header(s, y = 132, color = C.soft) { font(600, 24); text(s, CX, y, { align: 'center', color, spacing: '2px' }); }
function stamp(s, x, y, col, rot = -0.12, size = 40) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  font(700, size, MONO); const w = ctx.measureText(s).width + 34;
  ctx.strokeStyle = col; ctx.lineWidth = 5; k.rrect(-w / 2, -size * 0.8, w, size * 1.6, 8); ctx.stroke();
  text(s, 0, 2, { align: 'center', color: col });
  ctx.restore();
}
/** The Council's 11 chairs round a horseshoe table; votes: name → 'yes' | 'no' | 'abst'. */
function council(cx, cy, votes, p = 1, highlight = []) {
  const rx = 320, ry = 210;
  ctx.strokeStyle = 'rgba(241,236,226,0.25)'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(cx, cy + 60, rx - 60, ry - 50, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
  COUNCIL.forEach((name, i) => {
    const a = Math.PI * (0.97 - (i / (COUNCIL.length - 1)) * 0.94);
    const x = cx + rx * Math.cos(a), y = cy + 60 - ry * Math.sin(a);
    const g = seg(p, i / 14, i / 14 + 0.3);
    const v = votes?.[name];
    const col = !v ? 'rgba(241,236,226,0.35)' : v === 'yes' ? C.pass : v === 'no' ? C.veto : C.abst;
    A(eout(g), () => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.fill();
      if (PERM.includes(name)) { ctx.strokeStyle = C.perm; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 31, 0, 7); ctx.stroke(); }
      if (highlight.includes(name)) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 38, 0, 7); ctx.stroke(); }
      if (name !== 'elected') { const short = { 'United States': 'US', 'United Kingdom': 'UK', 'Soviet Union': 'USSR' }[name] ?? name; font(600, 18); text(short, x + 52 * Math.cos(a), y - 50 * Math.sin(a) - 6, { align: 'center', color: C.soft }); }
    });
  });
}
const SUEZ_VOTES = { 'United Kingdom': 'no', France: 'no' };
function tally(x, y, [yes, no, ab], col = C.ink) {
  font(700, 30, MONO);
  text(`${yes} yes · ${no} no · ${ab} abstain`, x, y, { align: 'center', color: col });
}
/** A General Assembly hall of dots; the first `yes` green, then `no` red, then abstentions grey. */
function assembly(cx, cy, [yes, no, ab], p = 1) {
  const n = yes + no + ab, rows = 5;
  const pts = [];
  for (let r = 0; r < rows; r++) {
    const rad = 150 + r * 36, m = Math.round(n * (rad / (150 * rows + 36 * 10)));
    for (let j = 0; j < m; j++) pts.push({ x: cx - rad * Math.cos((Math.PI * (j + 0.5)) / m), y: cy - rad * Math.sin((Math.PI * (j + 0.5)) / m), a: (j + 0.5) / m });
  }
  while (pts.length > n) pts.pop();
  while (pts.length < n) pts.push({ x: cx, y: cy - 120, a: 0.5 });
  pts.sort((u, v) => u.a - v.a);
  pts.forEach((pt, i) => {
    const on = i < n * p;
    ctx.fillStyle = !on ? 'rgba(241,236,226,0.12)' : i < yes ? C.pass : i < yes + no ? C.veto : C.abst;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 9, 0, 7); ctx.fill();
  });
}

// ---------- A: Budapest, then 1956 ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { header('BUDAPEST · 23 OCTOBER 2026'); header('70 YEARS SINCE THE REVOLUTION OF 1956', 170); });
    // the tricolour with a hole: the symbol of 1956
    A(eout(seg(t, 0.6, 1.6)) * (1 - seg(t, 4.8, 5.4)), () => {
      const x = 182, y = 240, w = 500, h = 300, wave = (yy, u) => Math.sin(u * 6 + t * 1.5) * 8 * u;
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = C.hu[b];
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) { const u = i / 30; ctx.lineTo(x + u * w, y + b * (h / 3) + wave(0, u)); }
        for (let i = 30; i >= 0; i--) { const u = i / 30; ctx.lineTo(x + u * w, y + (b + 1) * (h / 3) + wave(0, u)); }
        ctx.closePath(); ctx.fill();
      }
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.restore();
      ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 + wave(0, 0.5), 62, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 + wave(0, 0.5), 62, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(241,236,226,0.4)'; ctx.fillRect(x - 12, y - 10, 8, h + 200);
      A(seg(t, 2.0, 2.6), () => { font(500, 24); text('the flag with a hole in the middle:', CX, 610, { align: 'center', color: C.soft }); text('the symbol of the 1956 revolution', CX, 642, { align: 'center', color: C.soft }); });
    });
    // two crises in one fortnight
    A(seg(t, 5.2, 5.8), () => {
      header('1956', 230, C.ink);
      const days = ['29', '30', '31', '1', '2', '3', '4', '5'];
      days.forEach((d, i) => {
        const x = 132 + i * 86, y = 380;
        const g = eout(seg(t, 5.4 + i * 0.08, 5.9 + i * 0.08));
        A(g, () => {
          ctx.fillStyle = C.paper; k.rrect(x - 36, y - 40, 72, 80, 8); ctx.fill();
          font(700, 30, MONO); text(d, x, y + 4, { align: 'center', color: C.paperInk });
          font(600, 14); text(i < 3 ? 'OCT' : 'NOV', x, y - 26, { align: 'center', color: C.paperSoft });
        });
      });
      A(seg(t, 6.6, 7.2), () => {
        ctx.fillStyle = 'rgba(255,122,102,0.18)'; k.rrect(132 - 40, 450, 86 * 7 + 80, 56, 10); ctx.fill();
        font(700, 24); text('SUEZ: the Council meets, 29–31 October', 132 - 24, 478, { color: C.veto });
      });
      A(seg(t, 7.6, 8.2), () => {
        ctx.fillStyle = 'rgba(127,178,255,0.18)'; k.rrect(132 - 40, 530, 86 * 7 + 80, 56, 10); ctx.fill();
        font(700, 24); text('HUNGARY: the Council meets, 2–4 November', 132 - 24, 558, { color: C.un });
      });
    });
  });
}

// ---------- B: the Council and the veto ----------
function sceneCouncil(t) {
  const a = span(t, 9.4, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('UN SECURITY COUNCIL · 1956 · 11 MEMBERS');
    const votes = t > 15.0 ? SUEZ_VOTES : null;
    council(CX, 430, votes, eout(seg(t, 9.8, 11.6)));
    A(seg(t, 11.8, 12.4) * (1 - seg(t, 14.4, 14.8)), () => {
      font(600, 24); text('gold ring: the 5 permanent members, each with a veto', CX, 668, { align: 'center', color: C.perm });
      font(500, 22); text('plus 6 elected members', CX, 704, { align: 'center', color: C.soft });
    });
    A(seg(t, 15.2, 15.8), () => {
      font(700, 22, MONO); text('30 OCT · DRAFT ON THE FIGHTING IN EGYPT', CX, 200, { align: 'center', color: C.soft });
      tally(CX, 668, [7, 2, 2]);
    });
    A(seg(t, 16.4, 16.8), () => stamp('VETOED', CX, 430, C.veto));
  });
}

// ---------- C: Uniting for Peace, Suez ----------
function sceneUniting(t) {
  const a = span(t, 18.6, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 18.8–23.2: the 1950 resolution
    A(1 - seg(t, 23.2, 23.6), () => {
      header('GENERAL ASSEMBLY · 3 NOVEMBER 1950');
      const g = eout(seg(t, 19.0, 19.8));
      A(g, () => {
        const x = 152, y = 210, w = 560, h = 470;
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(x + 8, y + 10, w, h, 6); ctx.fill();
        ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 6); ctx.fill();
        font(700, 26, MONO); text('377 A (V)', x + w / 2, y + 50, { align: 'center', color: C.paperInk });
        font(700, 30, MONO); text('UNITING FOR PEACE', x + w / 2, y + 96, { align: 'center', color: C.paperInk });
        const lines = ['If the Security Council,', 'because of lack of unanimity', 'of the permanent members,', 'fails to act ...', '', '... the General Assembly', 'shall consider the matter', 'immediately.'];
        font(400, 22, MONO);
        lines.forEach((s, i) => A(seg(t, 19.6 + i * 0.18, 20.0 + i * 0.18), () => text(s, x + 44, y + 160 + i * 34, { color: C.paperSoft })));
        A(seg(t, 21.4, 22.0), () => { font(700, 20, MONO); text('emergency session within 24 hours', x + w / 2, y + h - 32, { align: 'center', color: C.paperInk }); });
      });
    });
    // 23.4–32.4: the procedural vote of 31 October
    A(seg(t, 23.4, 23.8) * (1 - seg(t, 32.4, 32.8)), () => {
      header('31 OCTOBER 1956 · CALL THE GENERAL ASSEMBLY?');
      council(CX, 430, SUEZ_VOTES, 1, t > 28.2 ? ['United Kingdom', 'France'] : []);
      A(seg(t, 23.8, 24.4), () => {
        ctx.fillStyle = 'rgba(134,219,164,0.15)'; k.rrect(170, 660, 524, 56, 28); ctx.fill();
        font(700, 24); text('a procedural vote: 7 yes is enough, no veto', CX, 688, { align: 'center', color: C.pass });
      });
      A(seg(t, 28.2, 28.8), () => tally(CX, 600, [7, 2, 2]));
      A(seg(t, 29.2, 29.6), () => stamp('ADOPTED', CX, 430, C.pass));
    });
    // 32.6–41.6: the Assembly
    A(seg(t, 32.6, 33.0), () => {
      header('GENERAL ASSEMBLY · FIRST EMERGENCY SPECIAL SESSION');
      const second = t > 37.2;
      const v = second ? GA.unef : GA.ceasefire;
      assembly(CX, 560, v, second ? eio(seg(t, 37.4, 38.6)) : eio(seg(t, 33.2, 34.6)));
      A(seg(t, 34.6, 35.0) * (1 - seg(t, 37.0, 37.4)), () => { font(700, 22, MONO); text('2 NOV · IMMEDIATE CEASEFIRE', CX, 210, { align: 'center', color: C.soft }); tally(CX, 620, GA.ceasefire); });
      A(seg(t, 38.6, 39.0), () => { font(700, 22, MONO); text('5 NOV · A UN EMERGENCY FORCE', CX, 210, { align: 'center', color: C.soft }); tally(CX, 620, GA.unef); });
      A(seg(t, 39.6, 40.2), () => {
        for (let i = 0; i < 9; i++) { ctx.fillStyle = C.un; ctx.beginPath(); ctx.arc(CX - 160 + i * 40, 690, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(CX - 174 + i * 40, 690, 28, 6); }
        font(600, 22); text('the first UN peacekeeping force', CX, 736, { align: 'center', color: C.un });
      });
    });
  });
}

// ---------- D: Hungary ----------
const HU_VOTES = { 'Soviet Union': 'no' };
function sceneHungary(t) {
  const a = span(t, 41.6, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 51.0) {
      header('4 NOVEMBER 1956 · THE SITUATION IN HUNGARY');
      const proc = t > 46.4;
      const votes = HU_VOTES;
      council(CX, 430, votes, eout(seg(t, 41.8, 43.0)), ['Soviet Union']);
      A(seg(t, 43.0, 43.6) * (1 - seg(t, 46.2, 46.6)), () => {
        font(700, 22, MONO); text('DRAFT ON HUNGARY', CX, 200, { align: 'center', color: C.soft });
        tally(CX, 668, [V.huDraft.yes, V.huDraft.no, V.huDraft.abst]);
        A(seg(t, 44.2, 44.6), () => stamp('VETOED', CX, 430, C.veto));
      });
      A(seg(t, 46.6, 47.0), () => {
        font(700, 22, MONO); text('CALL THE GENERAL ASSEMBLY? (PROCEDURAL)', CX, 200, { align: 'center', color: C.soft });
        tally(CX, 668, [V.res120.yes, V.res120.no, V.res120.abst]);
        A(seg(t, 48.0, 48.4), () => stamp('ADOPTED', CX, 430, C.pass));
      });
    } else {
      header('GENERAL ASSEMBLY · SECOND EMERGENCY SPECIAL SESSION');
      assembly(CX, 560, GA.hungary, eio(seg(t, 51.2, 52.4)));
      A(seg(t, 52.2, 52.8), () => { font(700, 22, MONO); text('4 NOV · SOVIET FORCES TO LEAVE HUNGARY', CX, 210, { align: 'center', color: C.soft }); tally(CX, 620, GA.hungary); });
      A(seg(t, 53.4, 54.0), () => { font(700, 26); text('the forces stayed', CX, 690, { align: 'center', color: C.veto }); });
    }
  });
}

// ---------- E: recommend, not compel ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.4, 56.2));
  if (a <= 0) return;
  A(a, () => {
    header('UNITING FOR PEACE');
    const col = (x, title, lines, colr, g) => A(g, () => {
      ctx.fillStyle = C.panel; k.rrect(x - 180, 200, 360, 300, 16); ctx.fill();
      ctx.fillStyle = colr; k.rrect(x - 180, 200, 360, 10, 5); ctx.fill();
      font(700, 32); text(title, x, 252, { align: 'center', color: colr });
      lines.forEach((s, i) => { font(500, 24); text(s, x, 316 + i * 40, { align: 'center', color: C.soft }); });
    });
    col(232, 'Suez', ['a ceasefire took hold', 'on 7/8 November', 'peacekeepers from', '15 November'], C.pass, eout(seg(t, 55.8, 56.6)));
    col(632, 'Hungary', ['the call ignored', 'Soviet forces stayed', 'UN observers', 'were refused'], C.veto, eout(seg(t, 56.4, 57.2)));
    A(seg(t, 57.6, 58.2), () => {
      ctx.fillStyle = 'rgba(127,178,255,0.15)'; k.rrect(110, 560, 644, 130, 16); ctx.fill();
      font(700, 30); text('the Assembly can recommend,', CX, 604, { align: 'center', color: C.ink });
      text('but not compel', CX, 648, { align: 'center', color: C.un });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60.4, fonts: [MONO, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneCouncil(t);
    sceneUniting(t);
    sceneHungary(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.veto, '^': C.un, '~': C.pass } });
  },
});
