// Explainer for politics-secret-speech-and-petofi-circle-1956 (Hungary 1956): from Khrushchev's secret speech of
// 25 February 1956 to the Petőfi Circle's press debate of 27 June and Rákosi's fall on 18 July, and why replacing him
// with Ernő Gerő changed too little. Look: night-blue ink and newsprint, amber lamplight; a hall full of listeners as
// dots, loudspeakers carrying the voices into a courtyard, a telegram; no faces. Cormorant Garamond for headings,
// Fira Sans for captions and labels.
//
// Facts:
// - A Petőfi Kör vitái, vol. 4: Partizántalálkozó, sajtóvita (1956 Institute documentary edition, MEK 12097): the
//   20th Congress's "secret speech" listed above all Stalin's personal crimes and was more or less known among party
//   intellectuals by June 1956; in March 1956 Rákosi had the Central Leadership declare that the congress vindicated
//   the MDP's policy since June 1953; the partisans' meeting (18 June), where Mrs László Rajk spoke of her husband's
//   rehabilitation; the press debate of 27 June 1956 in the House of the People's Army officers, where the chair spoke
//   of "six thousand comrades" present and a microphone was rigged for those in the courtyard; speakers included
//   Tibor Déry, Tibor Méray, Tibor Tardos, Géza Losonczy and three Central Leadership members; the debate went on
//   until half past one in the morning; on 30 June Rákosi had the MDP leadership condemn the Circle, and rumours of
//   mass arrests spread; Khrushchev still backed Rákosi on 13 July; the new leader, Ernő Gerő, agreed with rolling
//   back "the spirit of the congress".
// - FRUS 1955–1957, vol. XXV, doc. 83: telegram from the US Legation in Budapest, 19 July 1956: Rákosi's resignation
//   speech dwelt on his health and on his mistakes (violations of socialist legality, the personal cult); Gerő's long
//   speech cited the Petőfi Club with Poznań as tools of the enemy, said control of debates and press had been allowed
//   to slip out of party hands, attacked Nagy's "right deviation" and called for full support for the army and
//   security organs; the Legation's own view: a "curious and perhaps unstable compromise": "Rakosi out as First
//   Secretary Party—but Gero with hardly more savory record in", "old gang with exception Rakosi still there".
// - The Rajk trial (same volume, note 4): László Rajk, foreign minister, was tried in September 1949 and executed on
//   15 October 1949; his widow said on 18 June that she had spent five years in prison and asked for his memory to be
//   restored. Wikipedia, "On the Cult of Personality and Its Consequences": delivered on 25 February 1956 at a closed
//   session; it denounced Stalin's cult of personality, the mass arrests and executions of party members and falsified
//   evidence; The New York Times printed it on 5 June 1956.
// - Hungarian Review (Jobbágyi, "Bloody Thursday"): Mikoyan and Suslov demoted Rákosi in July 1956; EBSCO and others:
//   Anastas Mikoyan arrived in Budapest on 17 July. OSA catalogue: Budapest Radio announced the resignation on
//   18 July 1956.
//
// Scene plan (65 s). Captions centred at y = 846.
//  A  0.4– 9.4  Moscow, 25 February 1956: the secret speech.
//  B  9.6–14.0  Rákosi: "the congress proves us right".
//  C 14.2–41.6  the Petőfi Circle: 18 June, 27 June (6,000, loudspeakers, until 1.30 a.m.), 30 June.
//  D 41.8–64.6  July: Mikoyan, Rákosi out, Gerő in; the telegram; 23 October.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#131b2c', bg2: '#090d17', ink: '#f1ece0', soft: 'rgba(241,236,224,0.74)', faint: 'rgba(241,236,224,0.2)',
  paper: '#e9e2d0', amber: '#f2b134', amberDim: 'rgba(242,177,52,0.22)', blue: '#7aa7e0', blueDim: 'rgba(122,167,224,0.22)', red: '#e0675f', dark: '#1a1712', panel: 'rgba(9,13,23,0.86)',
};
const HEAD = 'Cormorant Garamond', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function fit(s, maxW, size, w = 400, f = TXT) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }
// A small pseudo-random generator, so the crowd's dots stay put from frame to frame.
function rand(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// ---------- A: Moscow ----------
function sceneMoscow(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(600, 46, HEAD); text('Moscow, 25 February 1956', 60, 110, { color: C.ink });
    font(400, 24, TXT); text('20th Congress of the Soviet Communist Party · closed session', 60, 152, { color: C.amber });
    // a lectern and a sheet of paper: the speech
    const g = eout(seg(t, 0.8, 1.8));
    A(g, () => {
      ctx.fillStyle = C.paper; ctx.save(); ctx.translate(CX, 420); ctx.rotate(-0.02);
      ctx.fillRect(-190, -190, 380, 380);
      font(700, 30, HEAD); text('On the Cult of Personality', 0, -140, { align: 'center', color: C.dark }); text('and Its Consequences', 0, -104, { align: 'center', color: C.dark });
      ctx.fillStyle = 'rgba(26,23,18,0.3)'; for (let i = 0; i < 8; i++) ctx.fillRect(-150, -60 + i * 26, i % 4 === 3 ? 180 : 300, 7);
      font(500, 22, TXT); text('N. S. Khrushchev', 0, 160, { align: 'center', color: C.dark });
      ctx.restore();
    });
    A(seg(t, 2.6, 3.2) * (1 - seg(t, 4.8, 5.2)), () => {
      ctx.save(); ctx.translate(CX + 150, 590); ctx.rotate(-0.15);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(-90, -30, 180, 60, 8); ctx.stroke();
      font(700, 26, TXT); text('SECRET', 0, 2, { align: 'center', color: C.red, spacing: '4px' });
      ctx.restore();
    });
    // cue 2: what it listed
    A(seg(t, 5.2, 5.8), () => {
      const items = ['mass arrests and executions of party members', 'falsified evidence', 'the cult of one leader'];
      items.forEach((s, i) => A(seg(t, 5.6 + i * 0.6, 6.2 + i * 0.6), () => {
        ctx.fillStyle = C.panel; k.rrect(130, 640 + i * 46 - 20, W - 260, 40, 8); ctx.fill();
        font(500, 23, TXT); text(s, CX, 640 + i * 46, { align: 'center', color: C.ink });
      }));
    });
  });
}

// ---------- B: Budapest, March ----------
function sceneBudapest(t) {
  A(span(t, 9.4, 14.2, 0.4, 0.4), () => {
    font(600, 44, HEAD); text('Budapest, March 1956', 60, 110);
    font(400, 24, TXT); text('the MDP Central Leadership, under Mátyás Rákosi', 60, 152, { color: C.amber });
    // a newspaper front page with the resolution
    const g = eout(seg(t, 9.8, 10.8));
    ctx.save(); ctx.translate(CX, 440); ctx.scale(lerp(0.94, 1, g), lerp(0.94, 1, g));
    A(g, () => {
      ctx.fillStyle = C.paper; ctx.fillRect(-280, -220, 560, 440);
      ctx.fillStyle = C.dark; ctx.fillRect(-250, -170, 500, 4);
      font(700, 30, HEAD); text('RESOLUTION', 0, -130, { align: 'center', color: C.dark });
      font(500, 24, TXT); text('“The congress confirms', 0, -60, { align: 'center', color: C.dark }); text('our party’s correct policy”', 0, -26, { align: 'center', color: C.dark });
      ctx.fillStyle = 'rgba(26,23,18,0.25)'; for (let i = 0; i < 6; i++) { ctx.fillRect(-250, 30 + i * 26, 230, 7); ctx.fillRect(20, 30 + i * 26, 230, 7); }
      font(400, 18, TXT); text('the gist, not a quotation', 0, 196, { align: 'center', color: '#6b6250' });
    });
    ctx.restore();
  });
}

// ---------- C: the Petőfi Circle ----------
const SEATS = (() => { const r = rand(7); const out = []; for (let i = 0; i < 420; i++) out.push([r(), r()]); return out; })();
function scenePetofi(t) {
  A(span(t, 14.0, 41.8, 0.4, 0.4), () => {
    font(600, 44, HEAD); text('The Petőfi Circle', 60, 110);
    fit('a debating club of the party’s youth league, named after the poet of 1848', W - 120, 24); text('a debating club of the party’s youth league, named after the poet of 1848', 60, 152, { color: C.amber });
    // cue 4: a circle of chairs, people arriving
    A(span(t, 14.0, 18.8, 0.4, 0.4), () => {
      const n = 18, g = seg(t, 14.6, 17.6);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, x = CX + Math.cos(a) * 200, y = 440 + Math.sin(a) * 170;
        A(clamp(g * n - i), () => { ctx.fillStyle = i % 3 ? C.blue : C.amber; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); });
      }
      font(500, 24, TXT); text('debates on history, economics, philosophy, the press', CX, 690, { align: 'center', color: C.soft });
    });
    // cue 5: 18 June, Júlia Rajk
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('18 June 1956', CX, 250, { align: 'center', color: C.amber });
      ctx.fillStyle = C.panel; k.rrect(110, 300, W - 220, 300, 18); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();
      font(500, 26, TXT); text('Júlia Rajk speaks', CX, 360, { align: 'center' });
      font(400, 22, TXT); text('widow of László Rajk, the Communist minister', CX, 410, { align: 'center', color: C.soft });
      text('executed in 1949 after a show trial', CX, 444, { align: 'center', color: C.soft });
      A(seg(t, 20.4, 21.0), () => { font(500, 25, TXT); text('after five years in prison,', CX, 516, { align: 'center', color: C.amber }); text('she asks that his name be cleared', CX, 552, { align: 'center', color: C.amber }); });
    });
    // cues 6–8: 27 June, the press debate: the hall fills, the courtyard listens
    A(span(t, 23.4, 37.2, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('27 June 1956 · the press debate', CX, 230, { align: 'center', color: C.amber });
      font(400, 22, TXT); text('House of the People’s Army officers, Budapest', CX, 268, { align: 'center', color: C.soft });
      // the hall: a rectangle filling with dots; the courtyard beyond
      const hx = 90, hy = 310, hw = 440, hh = 300, cx0 = 570, cw = 210;
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);
      ctx.setLineDash([8, 6]); ctx.strokeRect(cx0, hy, cw, hh); ctx.setLineDash([]);
      font(500, 22, TXT); text('hall', hx + 10, hy - 18, { color: C.soft }); text('courtyard', cx0 + 10, hy - 18, { color: C.soft });
      const fill = seg(t, 23.8, 28.0);
      SEATS.forEach(([u, v], i) => {
        const inHall = i < 330;
        if (i / SEATS.length > fill) return;
        const x = inHall ? hx + 14 + u * (hw - 28) : cx0 + 12 + u * (cw - 24), y = hy + 14 + v * (hh - 28);
        ctx.fillStyle = inHall ? C.blue : C.amber; ctx.fillRect(x - 3, y - 3, 6, 6);
      });
      // loudspeakers on the courtyard wall, with sound arcs (cue 7)
      A(seg(t, 28.0, 28.6), () => {
        const sx = cx0 + cw / 2, sy = hy + 20;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(sx - 16, sy - 10); ctx.lineTo(sx + 16, sy - 22); ctx.lineTo(sx + 16, sy + 22); ctx.lineTo(sx - 16, sy + 10); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 3; i++) {
          const ph = ((t * 1.2 + i / 3) % 1);
          A(1 - ph, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx, sy + 10, 30 + ph * 90, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke(); });
        }
      });
      A(seg(t, 28.6, 29.2) * (1 - seg(t, 32.4, 32.8)), () => {
        font(700, 52, HEAD); text(`≈ ${fmt(6000)}`, CX, 680, { align: 'center', color: C.amber });
        font(400, 22, TXT); text('present, by the chairman’s count', CX, 722, { align: 'center', color: C.soft });
      });
      // a clock running on to 1.30 a.m. (cue 8)
      A(seg(t, 32.8, 33.4), () => {
        const ccx = CX, ccy = 690, R = 56;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, TAU); ctx.stroke();
        const hours = lerp(19, 25.5, eio(seg(t, 33.0, 36.4))); // 7 p.m. to 1.30 a.m., schematic
        const ha = ((hours % 12) / 12) * TAU - Math.PI / 2, ma = ((hours % 1) * TAU) - Math.PI / 2;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(ha) * R * 0.5, ccy + Math.sin(ha) * R * 0.5); ctx.stroke();
        ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(ma) * R * 0.8, ccy + Math.sin(ma) * R * 0.8); ctx.stroke();
        ctx.lineCap = 'butt';
        A(seg(t, 36.0, 36.6), () => { font(600, 30, HEAD); text('until 1.30 a.m.', ccx + 90, ccy, { color: C.amber }); });
        font(400, 20, TXT); text('Tibor Déry · Tibor Méray · Géza Losonczy …', CX, 760, { align: 'center', color: C.soft });
      });
    });
    // cue 9: 30 June: the Circle condemned
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('30 June 1956', CX, 250, { align: 'center', color: C.red });
      const g = eback(seg(t, 37.6, 38.4));
      ctx.save(); ctx.translate(CX, 450); ctx.scale(g, g);
      ctx.fillStyle = C.paper; ctx.fillRect(-260, -150, 520, 300);
      font(700, 28, HEAD); text('MDP Central Leadership', 0, -100, { align: 'center', color: C.dark });
      font(500, 24, TXT); text('condemns the Petőfi Circle', 0, -50, { align: 'center', color: C.dark });
      ctx.fillStyle = 'rgba(26,23,18,0.25)'; for (let i = 0; i < 4; i++) ctx.fillRect(-220, 0 + i * 26, 440, 7);
      ctx.restore();
      A(seg(t, 38.8, 39.4), () => { font(500, 24, TXT); text('rumours: mass arrests are coming', CX, 660, { align: 'center', color: C.red }); });
    });
  });
}

// ---------- D: July ----------
function sceneJuly(t) {
  A(span(t, 41.6, 65.2, 0.4, 0), () => {
    // cue 10: Mikoyan; Rákosi resigns
    A(span(t, 41.6, 46.4, 0.4, 0.4), () => {
      font(600, 40, HEAD); text('18 July 1956', 60, 110, { color: C.amber });
      // two name plates: one slides away
      const g = eio(seg(t, 44.8, 46.2));
      A(1 - g * 0.85, () => {
        ctx.fillStyle = C.paper; ctx.fillRect(CX - 220 - g * 140, 360, 440, 110);
        font(700, 40, HEAD); text('Mátyás Rákosi', CX - g * 140, 400, { align: 'center', color: C.dark });
        font(500, 20, TXT); text('leader of the MDP since 1948', CX - g * 140, 444, { align: 'center', color: '#4b4436' });
      });
      font(500, 23, TXT); text('Soviet leader Anastas Mikoyan in Budapest', CX, 270, { align: 'center', color: C.soft });
      A(seg(t, 44.0, 44.6), () => { font(400, 22, TXT); text('his letter: his health, and his mistakes', CX, 560, { align: 'center', color: C.ink }); });
    });
    // cue 11: Gerő
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      const g = eout(seg(t, 46.6, 47.6));
      A(g, () => {
        ctx.fillStyle = C.paper; ctx.fillRect(CX - 220, 360 + (1 - g) * 40, 440, 110);
        font(700, 40, HEAD); text('Ernő Gerő', CX, 400 + (1 - g) * 40, { align: 'center', color: C.dark });
        font(500, 20, TXT); text('the new First Secretary', CX, 444 + (1 - g) * 40, { align: 'center', color: '#4b4436' });
      });
      A(seg(t, 47.6, 48.2), () => {
        font(500, 23, TXT); text('for years Rákosi’s partner in running the economy', CX, 540, { align: 'center', color: C.soft });
        fit('debate and press had “slipped out of party hands”', W - 160, 25, 500); text('debate and press had “slipped out of party hands”', CX, 600, { align: 'center', color: C.red });
        font(400, 20, TXT); text('as the US Legation summed up his speech', CX, 636, { align: 'center', color: C.soft });
      });
    });
    // cue 12: Gerő attacks Imre Nagy, calls for discipline
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('Gerő’s programme', CX, 230, { align: 'center', color: C.amber });
      const items = [['Imre Nagy, the reformer: attacked', C.red], ['unity and discipline', C.ink], ['full support for the army and security organs', C.ink], ['a 25% rise in real wages, still planned', C.blue]];
      items.forEach(([s, col], i) => A(seg(t, 51.4 + i * 0.5, 52.0 + i * 0.5), () => {
        ctx.fillStyle = C.panel; k.rrect(110, 300 + i * 80, W - 220, 62, 10); ctx.fill();
        fit(s, W - 260, 25, 500); text(s, CX, 331 + i * 80, { align: 'center', color: col });
      }));
    });
    // cue 13: the telegram
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      const g = eout(seg(t, 55.8, 56.8));
      ctx.save(); ctx.translate(CX, 440); ctx.rotate(0.02); ctx.scale(lerp(0.92, 1, g), lerp(0.92, 1, g));
      ctx.fillStyle = '#efe6c8'; ctx.fillRect(-300, -210, 600, 420);
      font(600, 22, TXT); text('TELEGRAM · US LEGATION, BUDAPEST', 0, -170, { align: 'center', color: C.dark, spacing: '2px' });
      text('19 JULY 1956', 0, -136, { align: 'center', color: C.dark, spacing: '2px' });
      ctx.fillStyle = C.dark; ctx.fillRect(-260, -112, 520, 3);
      font(500, 22, TXT); text('“curious and perhaps unstable compromise”', 0, -70, { align: 'center', color: '#4b4436' });
      const lines = ['“Rakosi out as First Secretary', '— but Gero with hardly more', 'savory record in”', '“old gang with exception Rakosi', 'still there”'];
      lines.forEach((l, i) => A(seg(t, 56.6 + i * 0.35, 57.0 + i * 0.35), () => { fit(l, 520, 28, 700); text(l, 0, -10 + i * 40 + (i > 2 ? 16 : 0), { align: 'center', color: i > 2 ? C.red : C.dark }); }));
      ctx.restore();
    });
    // cue 14: 23 October
    A(seg(t, 60.2, 60.8), () => {
      font(600, 40, HEAD); text('Three months later', CX, 300, { align: 'center', color: C.soft });
      const g = eback(seg(t, 60.8, 61.8));
      ctx.save(); ctx.translate(CX, 460); ctx.scale(g, g);
      font(700, 92, HEAD); text('23 October 1956', 0, 0, { align: 'center', color: C.amber });
      ctx.restore();
      A(seg(t, 62.0, 62.6), () => { font(400, 26, TXT); text('Budapest rises', CX, 580, { align: 'center', color: C.ink }); });
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
  const rg = g.createRadialGradient(CX, 360, 20, CX, 360, 520); rg.addColorStop(0, 'rgba(242,177,52,0.08)'); rg.addColorStop(1, 'rgba(242,177,52,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'Moscow, 1956: Soviet leader Nikita Khrushchev denounces Stalin in a *secret speech*.'],
  [5.0, 9.4, 'He lists Stalin’s crimes and his *cult of personality*: the model Hungary had copied.'],
  [9.6, 14.0, 'In March, Mátyás Rákosi’s party leadership claims the Moscow congress ~proved it right~.'],
  [14.2, 18.6, 'In Budapest, the *Petőfi Circle*, a club named after a poet, hosts freer debates.'],
  [18.8, 23.2, '18 June: Júlia Rajk asks that her husband László, executed after a ~show trial~, be cleared.'],
  [23.4, 27.8, '27 June 1956: the Circle debates the *press*, at the officers’ club of the army in Budapest.'],
  [28.0, 32.4, 'About *6,000* people come; loudspeakers carry the debate to those in the courtyard.'],
  [32.6, 37.0, 'Writers and journalists such as Tibor Déry criticise the leaders until *1.30 a.m.*'],
  [37.2, 41.6, '30 June: the party leadership ~condemns~ the Circle; rumours spread of mass arrests.'],
  [41.8, 46.2, 'With Soviet leader Anastas Mikoyan in Budapest, Rákosi ~resigns~ on 18 July 1956.'],
  [46.4, 50.8, 'His successor, *Ernő Gerő*, had run the economy at Rákosi’s side for years.'],
  [51.0, 55.4, 'Gerő attacks the reformer *Imre Nagy* and calls for discipline and strong security forces.'],
  [55.6, 60.0, 'The US Legation cables Washington: Rákosi is out, but “the ~old gang~” is still there.'],
  [60.2, 64.6, 'One leader out, his partner in: three months later, on *23 October*, Budapest rose.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMoscow(t);
    sceneBudapest(t);
    scenePetofi(t);
    sceneJuly(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 37, weight: 400, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.red } });
  },
});
