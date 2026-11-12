// Explainer for history-1949-single-list-and-rakosi-cult (Hungary 1956): how Hungary went from the free election of
// 1945 to the single list of 15 May 1949, the Soviet-model constitution of 20 August 1949 and the cult of Mátyás Rákosi.
// Look: a propaganda-poster palette (oxblood, cream paper, signal red, gold), the ballot paper and ballot box as the
// motif, portraits as empty gilt frames with names only (no likenesses). Oswald for headings and labels, Lora for the
// captions.
//
// Facts:
// - Gyarmati György, "Népfront-tojásokból reakciós rántotta – à la ÁVH. Egy választás Magyarországon – kétfajta
//   eredménnyel – 1949-ben", Betekintő 2015/2 (Historical Archives of the Hungarian State Security): the MDP was formed
//   in the summer of 1948; in February 1949 the Hungarian Independent People's Front (MFNF) replaced the earlier front;
//   voters could vote only for one common People's Front list, drawn up in fact by the MDP's election committee;
//   Rákosi said the Front's aim was "to reduce the importance of the bourgeois parties and speed up their dying away";
//   Interior Ministry communiqué of 18 May 1949: 6,053,792 entitled to vote, 5,730,519 voted (94.66%), 5,478,515 for
//   the Front (90.5% of the entitled, 95.6% of the voters), 165,283 against (2.88%), 86,721 invalid (1.51%), 323,273
//   did not vote; a "yes" needed no mark: the ballot could be dropped in as it was; a "no" meant crossing the circle on
//   the slip "with two lines"; the committee at Dusnok noted that the parish priest had voted against "because the
//   time he spent in the booth would not have been needed for a vote for the People's Front"; a union paper, 7 May
//   1949: "Only an enemy of the people does not vote."
// - Hungarian Wikipedia, "Magyar Dolgozók Pártja": founded on 12 June 1948 by forcibly merging the Social Democratic
//   Party into the Hungarian Communist Party; English Wikipedia, "1945 Hungarian parliamentary election" (4 November
//   1945): the Smallholders won a sweeping victory (57%), the Communists about 17%, then "salami tactics".
// - 1949. évi XX. törvény, footnote of the 1990 consolidated text (hffa.hu): promulgated on 20 August 1949; Hungarian
//   and English Wikipedia: modelled on the Soviet constitution of 1936, it made Hungary a People's Republic.
// - Hungarian Wikipedia, "Rákosi Mátyás": by 1952 the cult peaked; he was called "our people's wise leader" and
//   "Stalin's best Hungarian disciple"; work competitions for his 60th birthday. OSA Archivum catalogue: the 1952 album
//   for "the wise leader and teacher of our people and party". Museum of Ethnography (neprajz.hu), "Rakosi60": on
//   9 March 1952 an exhibition of the birthday gifts opened in the former Palace of Justice, filling its rooms,
//   galleries and corridors: embroidered and woven textiles, ceramics, carvings, dolls, models of machines.
//
// Scene plan (65 s). Captions are centred at y = 846; nothing important below 780.
//  A  0.4–14.0  1945: the free election, then the salami.
//  B 14.2–18.6  12 June 1948: two parties become the MDP.
//  C 18.8–41.6  15 May 1949: one list; the ballot; the booth; the result.
//  D 41.8–46.2  20 August 1949: the constitution.
//  E 46.4–64.6  the cult: frames, titles, the birthday gifts, and the ÁVH behind it.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#2b1013', bg2: '#150809', paper: '#f3e6cf', paperDim: 'rgba(243,230,207,0.16)', ink: '#f6ecda', soft: 'rgba(246,236,218,0.74)',
  faint: 'rgba(246,236,218,0.22)', red: '#e2443d', redDim: 'rgba(226,68,61,0.28)', gold: '#e8b04a', grey: '#9a8f86', dark: '#1d0b0c', panel: 'rgba(20,7,8,0.84)',
};
const HEAD = 'Oswald', TXT = 'Lora';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
/** Sets a font no bigger than `size` at which `s` fits in `maxW` (measured in the render's language). */
function fit(s, maxW, size, w = 400, f = TXT) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }

// The 1949 tally (Interior Ministry, 18 May 1949, in Gyarmati 2015)
const ROLL = 6053792, CAST = 5730519, FOR = 5478515, AGAINST = 165283, INVALID = 86721;
const pct = (n, d) => Math.round((n / d) * 1000) / 10;
const FOR_PCT = pct(FOR, CAST); // 95.6
if (FOR_PCT !== 95.6 || FOR + AGAINST + INVALID !== CAST) throw new Error('tally');
const one = (x) => x.toLocaleString(TRL(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function TRL() { return window.TR?.locale ?? 'en-US'; }

// ---------- A: 1945 ----------
const P45 = [['Smallholders', 57, C.gold], ['Social Democrats', 17.4, C.soft], ['Communists', 17, C.red], ['National Peasants', 6.9, C.grey]];
function scene1945(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    font(700, 44, HEAD); text('HUNGARY · 1945–1949', 70, 110, { spacing: '3px' });
    font(400, 26, TXT); text('From a free election to a single list', 70, 152, { color: C.gold });
    // cue 1: many lists, then one
    A(span(t, 0.6, 5.0, 0.5, 0.4), () => {
      font(700, 96, HEAD); text('1945', 240, 380, { align: 'center', color: C.gold }); text('1949', 624, 380, { align: 'center', color: C.red });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(360, 380); ctx.lineTo(500, 380); ctx.stroke();
      ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(512, 380); ctx.lineTo(490, 366); ctx.lineTo(490, 394); ctx.closePath(); ctx.fill();
      const cols = [C.gold, C.soft, C.red, C.grey];
      cols.forEach((col, i) => A(seg(t, 1.2 + i * 0.2, 1.6 + i * 0.2), () => {
        ctx.fillStyle = C.paper; ctx.fillRect(150 + i * 46, 470, 38, 54); ctx.fillStyle = col; ctx.fillRect(150 + i * 46, 470, 38, 10);
      }));
      A(seg(t, 2.4, 2.8), () => { ctx.fillStyle = C.paper; ctx.fillRect(605, 470, 38, 54); ctx.fillStyle = C.red; ctx.fillRect(605, 470, 38, 10); });
      font(400, 23, TXT);
      A(seg(t, 1.6, 2.2), () => text('several parties to choose', 240, 570, { align: 'center', color: C.soft }));
      A(seg(t, 2.6, 3.2), () => text('one list', 624, 570, { align: 'center', color: C.soft }));
    });
    // the 1945 result as bars
    const x0 = 270, y0 = 260, bw = 470, bh = 58;
    A(seg(t, 4.8, 5.4), () => {
      font(600, 26, HEAD); text('ELECTION OF 4 NOVEMBER 1945', 70, 226, { color: C.soft, spacing: '2px' });
    });
    P45.forEach(([name, v, col], i) => {
      const y = y0 + i * 84, g = eout(seg(t, 5.0 + i * 0.25, 6.4 + i * 0.25));
      A(seg(t, 5.0 + i * 0.25, 5.4 + i * 0.25), () => {
        font(500, 24, HEAD); text(name, x0 - 16, y + bh / 2, { align: 'right', color: C.ink });
        ctx.fillStyle = C.paperDim; ctx.fillRect(x0, y, bw, bh);
        // the slicing: the rivals of the Communists are cut away during cue 3
        const sliced = i === 2 ? 0 : eio(seg(t, 10.0 + i * 0.5, 12.6 + i * 0.4));
        const w = bw * (v / 60) * g * (1 - sliced);
        ctx.fillStyle = col; ctx.fillRect(x0, y, w, bh);
        A(1 - sliced, () => { font(700, 26, HEAD); text(`${fmt(Math.round(v))}%`, x0 + bw * (v / 60) * g + 12, y + bh / 2, { color: col }); });
        if (i !== 2) A(seg(t, 9.8, 10.2) * (1 - sliced * 0.4), () => {
          // slices falling away, schematic
          for (let s = 0; s < 5; s++) {
            const f = seg(t, 10.0 + i * 0.5 + s * 0.35, 11.2 + i * 0.5 + s * 0.35);
            if (f <= 0) continue;
            const sx = x0 + bw * (v / 60) * (1 - (s + 1) / 5), sw = (bw * (v / 60)) / 5 - 4;
            A(1 - f, () => { ctx.fillStyle = col; ctx.fillRect(sx, y + f * 120, sw, bh); });
          }
        });
        if (i === 2) A(seg(t, 5.0, 5.4), () => { font(700, 26, HEAD); text(`${fmt(Math.round(v))}%`, x0 + bw * (v / 60) * g + 12, y + bh / 2, { color: col }); });
      });
    });
    A(seg(t, 9.8, 10.4), () => { font(600, 25, HEAD); text('“SALAMI TACTICS”', CX, 640, { align: 'center', color: C.red, spacing: '3px' }); font(400, 22, TXT); text('rivals split, banned, arrested or driven abroad', CX, 676, { align: 'center', color: C.soft }); });
  });
}

// ---------- B: the merger ----------
function sceneMerger(t) {
  A(span(t, 14.0, 18.8, 0.4, 0.4), () => {
    font(700, 32, HEAD); text('12 JUNE 1948', CX, 190, { align: 'center', color: C.gold, spacing: '3px' });
    const m = eio(seg(t, 15.0, 17.0));
    const r = 120, y = 430;
    const xa = lerp(CX - 170, CX, m), xb = lerp(CX + 170, CX, m);
    A(1 - seg(t, 16.6, 17.2), () => {
      ctx.fillStyle = C.redDim; ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(xa, y, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(154,143,134,0.25)'; ctx.strokeStyle = C.grey;
      ctx.beginPath(); ctx.arc(xb, y, r, 0, TAU); ctx.fill(); ctx.stroke();
      font(600, 25, HEAD); text('Communist', xa, y - 14, { align: 'center' }); text('Party', xa, y + 18, { align: 'center' });
      text('Social', xb, y - 14, { align: 'center' }); text('Democrats', xb, y + 18, { align: 'center' });
    });
    A(seg(t, 16.8, 17.4), () => {
      const s = eback(seg(t, 16.8, 17.6));
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(CX, y, 150 * s, 0, TAU); ctx.fill();
      font(700, 56, HEAD); text('MDP', CX, y - 8, { align: 'center', color: C.paper });
      font(400, 22, TXT); text('Hungarian Working', CX, y + 40, { align: 'center', color: C.paper }); text('People’s Party', CX, y + 66, { align: 'center', color: C.paper });
    });
    A(seg(t, 17.2, 17.8), () => { font(400, 23, TXT); text('Social Democrats who refused were pushed out or fled abroad', CX, 650, { align: 'center', color: C.soft }); });
  });
}

// ---------- C: the ballot ----------
const BX = 230, BY = 250, BW = 400, BH = 300; // the ballot slip
function ballot(x, y, s, a, { cross = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = C.paper; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 18; ctx.fillRect(0, 0, BW, BH); ctx.shadowBlur = 0;
    ctx.fillStyle = C.dark;
    font(600, 22, HEAD); text('BALLOT · 15 MAY 1949', BW / 2, 34, { align: 'center', color: C.dark, spacing: '2px' });
    ctx.fillStyle = C.red; ctx.fillRect(24, 56, BW - 48, 4);
    font(700, 30, HEAD); text('Hungarian Independent', BW / 2, 104, { align: 'center', color: C.dark }); text('People’s Front', BW / 2, 142, { align: 'center', color: C.dark });
    font(400, 20, TXT); text('one list of candidates', BW / 2, 178, { align: 'center', color: '#5b4a40' });
    // the circle
    ctx.strokeStyle = C.dark; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(BW / 2, 240, 30, 0, TAU); ctx.stroke();
    if (cross > 0) {
      ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const a1 = clamp(cross * 2), a2 = clamp(cross * 2 - 1);
      ctx.beginPath(); ctx.moveTo(BW / 2 - 40, 200); ctx.lineTo(lerp(BW / 2 - 40, BW / 2 + 40, a1), lerp(200, 280, a1)); ctx.stroke();
      if (a2 > 0) { ctx.beginPath(); ctx.moveTo(BW / 2 + 40, 200); ctx.lineTo(lerp(BW / 2 + 40, BW / 2 - 40, a2), lerp(200, 280, a2)); ctx.stroke(); }
      ctx.lineCap = 'butt';
    }
    ctx.restore();
  });
}
function box(x, y, a) {
  A(a, () => {
    ctx.fillStyle = '#5a3a26'; ctx.fillRect(x - 130, y, 260, 170);
    ctx.fillStyle = '#3e271a'; ctx.fillRect(x - 130, y, 260, 22);
    ctx.fillStyle = C.dark; ctx.fillRect(x - 70, y + 6, 140, 10);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.strokeRect(x - 130, y, 260, 170);
    font(500, 20, HEAD); text('BALLOT BOX', x, y + 100, { align: 'center', color: C.gold, spacing: '2px' });
  });
}
function sceneBallot(t) {
  A(span(t, 18.6, 41.8, 0.4, 0.4), () => {
    // cue 5: the single list
    A(span(t, 18.6, 23.4, 0.4, 0.3), () => {
      font(700, 32, HEAD); text('15 MAY 1949', CX, 170, { align: 'center', color: C.gold, spacing: '3px' });
      ballot(BX, BY, 1, eout(seg(t, 19.0, 19.8)));
      A(seg(t, 20.6, 21.2), () => {
        font(400, 23, TXT); text('candidates chosen by the MDP’s election committee', CX, 620, { align: 'center', color: C.soft });
        text('no other list to choose', CX, 656, { align: 'center', color: C.red });
      });
    });
    // cue 6: yes = drop it in unmarked
    A(span(t, 23.4, 28.0, 0.3, 0.3), () => {
      font(700, 30, HEAD); text('TO VOTE YES', CX, 150, { align: 'center', color: C.gold, spacing: '3px' });
      const d = eio(seg(t, 24.4, 26.2));
      box(CX, 520, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 526); ctx.clip();
      ballot(CX - (BW * 0.5) / 2, lerp(200, 470, d), 0.5, 1);
      ctx.restore();
      A(seg(t, 25.8, 26.4), () => { font(400, 24, TXT); text('no mark at all: in it went', CX, 740, { align: 'center', color: C.ink }); });
    });
    // cue 7: no = two lines through the circle, behind the curtain
    A(span(t, 28.0, 32.6, 0.3, 0.3), () => {
      font(700, 30, HEAD); text('TO VOTE NO', CX, 150, { align: 'center', color: C.red, spacing: '3px' });
      // the booth: a curtain on the left
      ctx.fillStyle = 'rgba(226,68,61,0.22)'; ctx.fillRect(70, 200, 120, 520);
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(226,68,61,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(84 + i * 20, 206); ctx.lineTo(84 + i * 20, 716); ctx.stroke(); }
      font(500, 20, HEAD); text('BOOTH', 130, 186, { align: 'center', color: C.red, spacing: '2px' });
      ballot(BX + 20, 260, 1, 1, { cross: eio(seg(t, 29.0, 31.0)) });
      A(seg(t, 30.8, 31.4), () => { font(400, 24, TXT); text('the circle crossed out with two lines', CX + 70, 610, { align: 'center', color: C.ink }); });
    });
    // cue 8: time in the booth was watched
    A(span(t, 32.6, 37.2, 0.3, 0.3), () => {
      font(700, 30, HEAD); text('DUSNOK, 15 MAY 1949', CX, 150, { align: 'center', color: C.gold, spacing: '2px' });
      // a clock and the committee's table
      const cx0 = 270, cy0 = 380, R = 110;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, TAU); ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(cx0 + Math.cos(a) * (R - 14), cy0 + Math.sin(a) * (R - 14)); ctx.lineTo(cx0 + Math.cos(a) * (R - 4), cy0 + Math.sin(a) * (R - 4)); ctx.stroke(); }
      const sweep = seg(t, 33.0, 36.4) * TAU * 0.8;
      ctx.fillStyle = C.redDim; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.arc(cx0, cy0, R - 20, -Math.PI / 2, -Math.PI / 2 + sweep); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx0 + Math.cos(-Math.PI / 2 + sweep) * (R - 24), cy0 + Math.sin(-Math.PI / 2 + sweep) * (R - 24)); ctx.stroke();
      // the committee's note, as a slip of paper
      A(seg(t, 34.0, 34.8), () => {
        ctx.fillStyle = C.paper; ctx.fillRect(430, 270, 370, 230);
        font(600, 21, HEAD); text('COMMITTEE’S REPORT', 615, 304, { align: 'center', color: C.dark, spacing: '1px' });
        ['the parish priest “voted against”:', 'the time he spent in the booth', 'was not needed for a vote', 'for the People’s Front'].forEach((s, i) => { fit(s, 340, 21, 400, TXT); text(s, 615, 350 + i * 34, { align: 'center', color: C.dark }); });
      });
      A(seg(t, 35.4, 36.0), () => { font(400, 22, TXT); text('a union paper, 7 May 1949: “Only an enemy of the people does not vote.”', CX, 620, { align: 'center', color: C.soft }); });
    });
    // cue 9: the result
    A(span(t, 37.2, 41.8, 0.3, 0.3), () => {
      font(700, 30, HEAD); text('OFFICIAL RESULT', CX, 150, { align: 'center', color: C.gold, spacing: '3px' });
      const g = eio(seg(t, 37.6, 39.4));
      const x0 = 90, y0 = 300, bw = W - 180, bh = 90;
      const parts = [[FOR, C.red], [AGAINST, C.paper], [INVALID, C.grey]];
      let x = x0;
      for (const [n, col] of parts) { const w = (bw * n) / CAST * g; ctx.fillStyle = col; ctx.fillRect(x, y0, w, bh); x += w; }
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, bw, bh);
      A(seg(t, 39.0, 39.6), () => {
        font(700, 76, HEAD); text(`${one(FOR_PCT)}%`, CX, 480, { align: 'center', color: C.red });
        font(400, 24, TXT); text('of those who voted backed the list', CX, 540, { align: 'center', color: C.ink });
        font(400, 22, TXT);
        [[FOR, 'for the list', C.red], [AGAINST, 'against', C.paper], [INVALID, 'invalid', C.grey], [ROLL - CAST, 'did not vote', C.soft]].forEach(([n, s, col], i) => {
          text(fmt(n), CX - 14, 594 + i * 32, { align: 'right', color: col });
          text(s, CX + 14, 594 + i * 32, { align: 'left', color: C.soft });
        });
      });
    });
  });
}

// ---------- D: the constitution ----------
function sceneConstitution(t) {
  A(span(t, 41.6, 46.4, 0.4, 0.4), () => {
    const s = eout(seg(t, 41.8, 42.8));
    ctx.save(); ctx.translate(CX, 440); ctx.rotate(-0.03); ctx.scale(lerp(0.9, 1, s), lerp(0.9, 1, s));
    ctx.fillStyle = C.paper; ctx.fillRect(-250, -300, 500, 600);
    font(600, 22, HEAD); text('ACT XX OF 1949', 0, -250, { align: 'center', color: C.dark, spacing: '3px' });
    font(700, 34, HEAD); text('CONSTITUTION', 0, -196, { align: 'center', color: C.dark }); font(500, 26, HEAD); text('of the People’s Republic of Hungary', 0, -156, { align: 'center', color: C.dark });
    ctx.fillStyle = 'rgba(29,11,12,0.25)'; for (let i = 0; i < 9; i++) ctx.fillRect(-190, -100 + i * 30, i % 3 === 2 ? 240 : 380, 8);
    font(400, 22, TXT); text('promulgated 20 August 1949', 0, 220, { align: 'center', color: '#5b4a40' });
    ctx.restore();
    A(seg(t, 43.0, 43.6), () => {
      const st = eback(seg(t, 43.0, 43.8));
      ctx.save(); ctx.translate(560, 520); ctx.rotate(-0.22); ctx.scale(st, st);
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; k.rrect(-150, -46, 300, 92, 10); ctx.stroke();
      font(700, 26, HEAD); text('MODEL: USSR, 1936', 0, 2, { align: 'center', color: C.red, spacing: '2px' });
      ctx.restore();
    });
  });
}

// ---------- E: the cult ----------
function frame(x, y, w, h, name, sub, a, col = C.gold) {
  A(a, () => {
    ctx.fillStyle = 'rgba(232,176,74,0.08)'; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.lineWidth = 2; ctx.strokeRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28);
    font(700, 40, HEAD); text(name, x, y - 6, { align: 'center', color: col, spacing: '3px' });
    if (sub) { font(400, 20, TXT); text(sub, x, y + 34, { align: 'center', color: C.soft }); }
  });
}
function sceneCult(t) {
  A(span(t, 46.2, 65.2, 0.4, 0), () => {
    // cues 11–12: two frames, side by side; the titles
    A(span(t, 46.2, 55.6, 0.4, 0.4), () => {
      const g = eout(seg(t, 46.6, 47.6));
      frame(CX - 170, 360, 260, 330, 'STALIN', 'Moscow', g, C.soft);
      frame(CX + 170, 360, 260, 330, 'RÁKOSI', 'Budapest', g);
      A(seg(t, 47.8, 48.4), () => { font(400, 22, TXT); text('portraits as a pair: the model and the copy', CX, 580, { align: 'center', color: C.soft }); });
      A(seg(t, 48.6, 49.2) * (1 - seg(t, 50.8, 51.2)), () => { font(400, 28, TXT); text('“our people’s wise leader”', CX, 650, { align: 'center', color: C.gold }); });
      A(seg(t, 51.2, 51.8), () => { font(400, 28, TXT); text('“Stalin’s best Hungarian disciple”', CX, 650, { align: 'center', color: C.gold }); });
    });
    // cue 13: 9 March 1952: the gifts fill a palace
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      font(700, 30, HEAD); text('9 MARCH 1952 · HIS 60th BIRTHDAY', CX, 150, { align: 'center', color: C.gold, spacing: '2px' });
      // the palace: a facade with columns
      const py = 560;
      ctx.fillStyle = 'rgba(243,230,207,0.12)'; ctx.fillRect(110, py - 260, W - 220, 260);
      ctx.fillStyle = 'rgba(243,230,207,0.2)'; ctx.beginPath(); ctx.moveTo(90, py - 260); ctx.lineTo(CX, py - 340); ctx.lineTo(W - 90, py - 260); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(243,230,207,0.28)'; ctx.fillRect(140 + i * 72, py - 240, 18, 240); }
      // gifts filling it, row by row
      const fill = seg(t, 56.0, 58.8);
      const n = Math.floor(fill * 36);
      for (let i = 0; i < n; i++) {
        const col = [C.red, C.gold, C.paper, C.grey][i % 4], r = Math.floor(i / 12), c = i % 12;
        const gx = 140 + c * 50, gy = py - 34 - r * 54;
        ctx.fillStyle = col; ctx.fillRect(gx, gy, 34, 30);
        ctx.fillStyle = C.dark; ctx.fillRect(gx + 15, gy, 4, 30); ctx.fillRect(gx, gy + 13, 34, 4);
      }
      A(seg(t, 57.0, 57.6), () => {
        font(400, 22, TXT); text('the former Palace of Justice, opposite Parliament in Budapest', CX, 610, { align: 'center', color: C.soft });
        text('embroidery, carvings, ceramics, dolls, models of machines', CX, 646, { align: 'center', color: C.ink });
      });
    });
    // cue 14: behind the cheering, the ÁVH
    A(seg(t, 60.2, 60.8), () => {
      const g = seg(t, 60.4, 62.2);
      frame(CX, 330, 300, 360, 'RÁKOSI', '', 1);
      // the long shadow behind the frame
      ctx.fillStyle = `rgba(0,0,0,${0.55 * g})`;
      ctx.beginPath(); ctx.moveTo(CX - 150, 510); ctx.lineTo(CX + 150, 510); ctx.lineTo(CX + 330, 760); ctx.lineTo(CX - 330, 760); ctx.closePath(); ctx.fill();
      A(seg(t, 61.0, 61.6), () => { font(700, 30, HEAD); text('ÁVH', CX, 660, { align: 'center', color: C.red, spacing: '6px' }); font(400, 22, TXT); text('the State Protection Authority: the political police', CX, 700, { align: 'center', color: C.soft }); });
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
  // poster rays from below, very faint
  g.save(); g.translate(CX, 1150); g.fillStyle = 'rgba(226,68,61,0.045)';
  for (let i = 0; i < 18; i++) { g.rotate(Math.PI / 18); g.beginPath(); g.moveTo(0, 0); g.lineTo(-40, -1400); g.lineTo(40, -1400); g.closePath(); g.fill(); g.rotate(Math.PI / 18); }
  g.restore();
}

const CUES = [
  [0.4, 4.8, 'Hungary, 1945–1949: in four years, from a free election to a vote with a *single list*.'],
  [5.0, 9.4, 'November 1945: the Smallholders won *57%* of the vote; the Communists won ~17%~.'],
  [9.6, 14.0, 'Communist leader *Mátyás Rákosi* cut up rival parties: the ~salami tactics~.'],
  [14.2, 18.6, '12 June 1948: Communists and Social Democrats merge into one party, the ~MDP~.'],
  [18.8, 23.2, '15 May 1949: voters get *one list*, the People’s Front, drawn up by the MDP.'],
  [23.4, 27.8, 'A yes needed no mark: you dropped the ballot in *as it was*.'],
  [28.0, 32.4, 'To vote no, you had to cross out a circle ~with two lines~, behind the curtain.'],
  [32.6, 37.0, 'Time in the booth was watched: a priest who stayed too long was noted as a ~no~.'],
  [37.2, 41.6, 'Official result: *95.6%* of those who voted backed the list.'],
  [41.8, 46.2, '20 August 1949: a constitution on the *Soviet model* makes Hungary a People’s Republic.'],
  [46.4, 50.8, 'Around Rákosi, the party leader, grew a *cult* copied from Stalin’s.'],
  [51.0, 55.4, 'The press hailed him as *“Stalin’s best Hungarian disciple”*.'],
  [55.6, 60.0, '9 March 1952, his 60th birthday: gifts from all over Hungary filled a *palace*.'],
  [60.2, 64.6, 'Praise was compulsory; behind the cheering stood the political police, the ~ÁVH~.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scene1945(t);
    sceneMerger(t);
    sceneBallot(t);
    sceneConstitution(t);
    sceneCult(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.red } });
  },
});
