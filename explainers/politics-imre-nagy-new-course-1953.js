// Explainer for politics-imre-nagy-new-course-1953 (Hungary 1956, "The road to October"): after Stalin's death,
// Moscow made Imre Nagy prime minister of Hungary (4 July 1953). His "new course" closed the internment camps, ended
// the deportations, brought an amnesty, slowed forced industrialisation and let peasants leave the collective farms.
// It raised hopes; but Mátyás Rákosi stayed First Secretary of the party, which kept the press, the radio and the
// apparatus, and by 1955 he had Nagy removed and expelled. Look: night blue turning to a dawn amber, the government
// in light blue, the party in red, two pillars of power. Fraunces for headings, Jost for captions and labels.
//
// Facts:
// - 1956 Institute (Szakolczai Attila), Az 1956-os forradalom története, lesson 1 (mek.oszk.hu/01900/01937): after
//   Stalin's death the new Moscow leadership planned changes; in June 1953 leading Hungarian Communists were summoned
//   to Moscow and, led by Beria, sharply criticised the party's policy; Nagy named prime minister; the Kremlin wanted
//   calm in Hungary; "1953-ra 20%-kal csökkent a bérből élők reáljövedelme 1949-hez képest"; the economy at the edge
//   of collapse; 4 July 1953 parliament: Nagy's programme speech announcing the "új szakasz"; heavy-industry
//   investment cut and money redirected to consumer industry, housing and agriculture; forced collectivisation
//   stopped, leaving the co-operatives allowed, delivery quotas lowered; information reports of bonfires in villages
//   celebrating Nagy until dawn; consumption about 20% higher in 1954 than in 1950; amnesty, internment camps
//   dissolved, deportation and forced residence ended; "felfeslett a terror mindent beborító szövedéke"; Rákosi
//   remained the party's First Secretary; press, radio and all social organisations stayed under the party he led;
//   Rákosi argued the premier's policy undermined the party and threatened socialism; December 1954 Politburo; January
//   1955 Moscow branded Nagy anti-party; March 1955 Central Committee resolution condemned his policy; removed from
//   his party posts and then as prime minister (successor András Hegedüs); expelled from the party in December 1955.
// - UN Special Committee report (1957), para. 218: Nagy as Minister of Agriculture implemented the land reform; in
//   July 1953 became Prime Minister; stopped forcible collectivisation and the persecution of the "kulaks"; enforced
//   displacements ended; para. 48: his name "continued to stand for more liberal policies".
// - Hungarian National Archives (telepesek.mnl.gov.hu, "Hatvanöt év után"): the amnesty decree of 26 July 1953;
//   resolution 034/1953 (VII. 26.) abolished internment.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–18.6  Stalin's death; Moscow summons Hungary's leaders; real wages; Imre Nagy.
//  B 18.8–37.0  4 July 1953: the new course; camps, amnesty; industry; peasants.
//  C 37.2–46.2  Bonfires in the villages; consumption up.
//  D 46.4–64.6  Two pillars: the government and the party; Rákosi's comeback; Nagy removed and expelled.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#16213a', bg2: '#0c1322', dawn: '#f0a64a', ink: '#f4efe4', soft: 'rgba(244,239,228,0.74)', faint: 'rgba(244,239,228,0.22)',
  gov: '#7fb2e5', party: '#d1495b', field: '#9cc36b', panel: 'rgba(8,12,22,0.86)',
};
const HEAD = 'Fraunces', TXT = 'Jost';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const WAGES_1953 = 80; // real wages of wage earners, 1949 = 100 (fell 20%: 1956 Institute)
const CONSUMPTION_1954 = 120; // consumption, 1950 = 100 (about 20% higher: 1956 Institute)

function heading(s, sub, a, y = 104, subCol = C.dawn) {
  A(a, () => {
    font(700, 44, HEAD); text(s, 70, y, { color: C.ink });
    if (sub) { font(500, 26); text(sub, 70, y + 44, { color: subCol }); }
  });
}

/** A plain standing figure: head and body, no face. */
function figure(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 34 * s, 13 * s, 0, TAU); ctx.fill();
  k.rrect(x - 15 * s, y - 18 * s, 30 * s, 46 * s, 10 * s); ctx.fill();
}

/** A horizontal bar with a value, on a 0–max scale. */
function bar(x, y, w, h, v, max, col, labelText) {
  ctx.fillStyle = 'rgba(244,239,228,0.08)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, (w * v) / max, h);
  font(600, 24); text(labelText, x, y - 20, { color: C.soft });
  font(700, 30); text(fmt(v), x + (w * v) / max + 12, y + h / 2, { color: C.ink });
}

// ---------- A ----------
function sceneA(t) {
  A(span(t, 0, 18.8, 0.5, 0.4), () => {
    // Stalin's death (cue 1)
    A(span(t, 0, 5.0, 0, 0.4), () => {
      heading('MOSCOW, 1953', 'After Stalin', seg(t, 0.2, 0.8));
      ctx.fillStyle = C.ink; k.rrect(CX - 150, 300, 300, 300, 12); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 10; k.rrect(CX - 138, 312, 276, 276, 8); ctx.stroke();
      font(800, 120, HEAD); text('5', CX, 420, { align: 'center', color: '#1a1a1a' });
      font(600, 34); text('MARCH 1953', CX, 520, { align: 'center', color: '#1a1a1a' });
      A(seg(t, 1.6, 2.2), () => { font(600, 28); text('Joseph Stalin dies', CX, 660, { align: 'center', color: C.soft }); });
    });
    // summoned to Moscow (cue 2)
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      heading('JUNE 1953', 'Hungary’s leaders summoned to Moscow', 1);
      const bx = 240, by = 560, mx = 640, my = 300, g = eio(seg(t, 5.4, 7.0));
      ctx.strokeStyle = C.party; ctx.lineWidth = 5; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(lerp(bx, mx, g), lerp(by, my, g)); ctx.stroke(); ctx.setLineDash([]);
      for (const [x, y, s, al] of [[bx, by, 'Budapest', 'right'], [mx, my, 'Moscow', 'left']]) {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
        font(700, 30); text(s, x + (al === 'left' ? 22 : -22), y, { align: al, color: C.ink });
      }
      A(seg(t, 7.2, 7.8), () => {
        ctx.fillStyle = C.panel; k.rrect(150, 620, 564, 110, 14); ctx.fill();
        font(600, 26); text('Soviet leaders condemn', CX, 658, { align: 'center', color: C.party });
        text('Mátyás Rákosi’s policies', CX, 696, { align: 'center', color: C.party });
      });
    });
    // real wages (cue 3)
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
      heading('BY 1953', 'An economy near collapse', 1);
      const g = eio(seg(t, 10.2, 11.6));
      bar(130, 330, 560, 54, 100, 110, C.faint, 'Real wages, 1949');
      bar(130, 490, 560, 54, Math.round(lerp(100, WAGES_1953, g)), 110, C.party, 'Real wages, 1953');
      A(seg(t, 11.8, 12.4), () => { font(500, 23); text('1949 = 100; wage earners', 130, 610, { color: C.soft }); });
    });
    // Imre Nagy (cue 4)
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      heading('MOSCOW’S CHOICE', 'Prime minister: Imre Nagy', 1, 104, C.gov);
      figure(240, 520, 3.2, C.gov);
      font(700, 38, HEAD); text('Imre Nagy', 400, 400, { color: C.ink });
      font(500, 24);
      ['a Communist since 1918', 'minister of agriculture, 1944–45:', 'he carried out the land reform'].forEach((s, i) => A(seg(t, 15.0 + i * 0.4, 15.4 + i * 0.4), () => text(s, 400, 452 + i * 40, { color: C.soft })));
    });
  });
}

// ---------- B: the new course ----------
const MEASURES = [
  ['Internment camps closed', C.dawn, 23.6],
  ['Deportations ended', C.dawn, 24.2],
  ['An amnesty', C.dawn, 24.8],
  ['Less for heavy industry', C.gov, 28.4],
  ['More for food, homes, goods', C.gov, 29.0],
  ['Peasants may leave the co-ops', C.field, 32.8],
  ['Lower compulsory deliveries', C.field, 33.4],
];
function sceneB(t) {
  A(span(t, 18.8, 37.2, 0.4, 0.4), () => {
    heading('4 JULY 1953', 'Parliament: the “new course”', 1);
    // the parliament, schematic: a dome and a long front
    A(1 - 0.75 * seg(t, 22.8, 23.4), () => {
      ctx.fillStyle = '#28365a';
      ctx.fillRect(130, 470, 604, 160);
      ctx.beginPath(); ctx.arc(CX, 470, 96, Math.PI, 0); ctx.fill();
      ctx.fillRect(CX - 8, 330, 16, 50);
      for (let i = 0; i < 12; i++) ctx.fillRect(150 + i * 50, 420, 22, 50);
      ctx.fillStyle = 'rgba(240,166,74,0.55)';
      for (let i = 0; i < 11; i++) ctx.fillRect(160 + i * 53, 520, 20, 60);
    });
    // the measures, as a growing list
    MEASURES.forEach(([s, col, at], i) => A(seg(t, at, at + 0.4), () => {
      const y = 250 + i * 70;
      ctx.fillStyle = C.panel; k.rrect(110, y - 28, 644, 56, 12); ctx.fill();
      ctx.fillStyle = col; ctx.fillRect(110, y - 28, 10, 56);
      font(600, 28); text(s, 144, y, { color: C.ink });
    }));
  });
}

// ---------- C: hope ----------
function sceneC(t) {
  A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
    // bonfires in the villages (cue 9)
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      heading('SUMMER 1953', 'From the party’s own reports', 1);
      // village roofs
      for (let i = 0; i < 6; i++) {
        const x = 90 + i * 120, y = 520;
        ctx.fillStyle = '#26324f'; ctx.fillRect(x, y, 90, 70);
        ctx.fillStyle = '#33426a'; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 45, y - 44); ctx.lineTo(x + 98, y); ctx.fill();
      }
      // small bonfires: warm flickering triangles
      for (let i = 0; i < 5; i++) A(seg(t, 38.0 + i * 0.3, 38.4 + i * 0.3), () => {
        const x = 168 + i * 120, y = 640, f = 0.8 + 0.2 * Math.sin(t * 9 + i * 2);
        ctx.fillStyle = 'rgba(240,166,74,0.25)'; ctx.beginPath(); ctx.arc(x, y - 20, 40 * f, 0, TAU); ctx.fill();
        ctx.fillStyle = C.dawn; ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x, y - 44 * f); ctx.lineTo(x + 16, y); ctx.fill();
      });
      A(seg(t, 39.6, 40.2), () => { font(600, 27); text('bonfires, and Nagy celebrated until dawn', CX, 330, { align: 'center', color: C.dawn }); });
    });
    // consumption (cue 10)
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      heading('BY 1954', 'Living a little better', 1);
      const g = eio(seg(t, 42.2, 43.6));
      bar(130, 330, 560, 54, 100, 130, C.faint, 'Consumption, 1950');
      bar(130, 490, 560, 54, Math.round(lerp(100, CONSUMPTION_1954, g)), 130, C.dawn, 'Consumption, 1954');
      A(seg(t, 44.0, 44.6), () => { font(500, 23); text('1950 = 100', 130, 610, { color: C.soft }); });
    });
  });
}

// ---------- D: the government and the party ----------
function pillar(x, top, w, col, title, who, a = 1) {
  A(a, () => {
    ctx.fillStyle = col; ctx.globalAlpha *= 0.85; ctx.fillRect(x - w / 2, top, w, 640 - top); ctx.globalAlpha /= 0.85;
    ctx.fillRect(x - w / 2 - 14, top - 20, w + 28, 20); ctx.fillRect(x - w / 2 - 14, 640, w + 28, 20);
    font(700, 26); text(title, x, top - 50, { align: 'center', color: col });
    font(700, 28, HEAD); text(who, x, top + 50, { align: 'center', color: '#0c1322' });
  });
}
function sceneD(t) {
  A(span(t, 46.4, 65.2, 0.4, 0), () => {
    // two pillars (cues 11 and 12)
    A(span(t, 46.4, 55.6, 0.4, 0.4), () => {
      heading('TWO CENTRES OF POWER', '1953–1955', 1);
      const grow = eio(seg(t, 51.4, 53.4)), sink = eio(seg(t, 51.4, 53.4));
      pillar(260, lerp(330, 380, sink), 210, C.gov, 'GOVERNMENT', 'Imre Nagy');
      pillar(604, lerp(330, 270, grow), 210, C.party, 'PARTY', 'Rákosi');
      A(seg(t, 47.6, 48.2), () => {
        font(600, 23);
        ['First Secretary', 'press and radio', 'party officials'].forEach((s, i) => text(s, 604, lerp(330, 270, grow) + 110 + i * 40, { align: 'center', color: '#0c1322' }));
      });
      A(seg(t, 52.2, 52.8), () => {
        ctx.fillStyle = C.panel; k.rrect(140, 680, 584, 70, 12); ctx.fill();
        font(600, 24); text('Rákosi to Moscow: the new course endangers socialism', CX, 715, { align: 'center', color: C.party });
      });
    });
    // the fall (cues 13 and 14): a timeline
    A(seg(t, 55.6, 56.0), () => {
      heading('1955', 'Rákosi’s comeback', 1, 104, C.party);
      const x0 = 120, x1 = 744, y = 420;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      // the four steps, evenly spaced (not to scale in time)
      const EVENTS = [['January', 'Moscow: Nagy is “anti-party”', 56.0], ['March', 'the party condemns him', 56.8], ['April', 'removed as prime minister', 57.6], ['December', 'expelled from the party', 61.0]];
      EVENTS.forEach(([when, what, at], i) => A(seg(t, at, at + 0.5), () => {
        const x = lerp(170, 694, i / 3), up = i % 2 === 0;
        ctx.fillStyle = C.party; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, up ? y - 70 : y + 70); ctx.stroke();
        font(700, 24); text(when, x, up ? y - 116 : y + 96, { align: 'center', color: C.ink });
        font(500, 22); text(what, x, up ? y - 86 : y + 126, { align: 'center', color: C.soft });
      }));
      A(seg(t, 62.0, 62.6), () => {
        const g = 0.6 + 0.4 * Math.sin(t * 2);
        const rg = ctx.createRadialGradient(CX, 640, 10, CX, 640, 300); rg.addColorStop(0, `rgba(240,166,74,${0.22 * g})`); rg.addColorStop(1, 'rgba(240,166,74,0)');
        ctx.fillStyle = rg; ctx.fillRect(CX - 300, 340, 600, 440);
        font(700, 30, HEAD); text('Imre Nagy: still the name of hope', CX, 640, { align: 'center', color: C.dawn });
      });
    });
  });
}

// ---------- background: night blue, a dawn glow that grows with the new course ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, '5 March 1953: Soviet dictator Joseph Stalin dies. In Moscow, his heirs want *calm* in Eastern Europe.'],
  [5.0, 9.4, 'In June they summon Hungary’s leaders and condemn ~Mátyás Rákosi’s~ policies to their faces.'],
  [9.6, 14.0, 'Hungarians’ real wages had fallen by *a fifth* since 1949. The economy neared collapse.'],
  [14.2, 18.6, 'Moscow’s choice for prime minister: *Imre Nagy*, a Communist who had run the 1945 land reform.'],
  [18.8, 23.2, '4 July 1953: in Hungary’s Parliament, Imre Nagy announces a *new course*.'],
  [23.4, 27.8, 'Internment camps are closed, deportations end, and an *amnesty* sets many free.'],
  [28.0, 32.4, 'Heavy industry slows; money goes to *food, homes* and everyday goods instead.'],
  [32.6, 37.0, 'Peasants may now *leave the collective farms*, and their compulsory deliveries are cut.'],
  [37.2, 41.6, 'Party reports said villages lit *bonfires* and celebrated Nagy until dawn.'],
  [41.8, 46.2, 'By 1954 people consumed about *a fifth more* than in 1950, and fear began to loosen.'],
  [46.4, 50.8, 'But Rákosi stayed ~First Secretary~ of the party, which ran the press, the radio and the officials.'],
  [51.0, 55.4, 'Officials dragged their feet; Rákosi told Moscow the new course *endangered socialism*.'],
  [55.6, 60.0, 'In early 1955 Moscow turned: the party ~condemned~ Nagy, and in April he lost his post.'],
  [60.2, 64.6, 'Expelled from the party in December 1955, Nagy remained the name of *hope*.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    // a dawn glow on the horizon, strongest in the months of hope
    const glow = seg(t, 18.8, 22) * (1 - 0.7 * seg(t, 50, 56));
    if (glow > 0) {
      const rg = ctx.createRadialGradient(CX, 800, 40, CX, 800, 620);
      rg.addColorStop(0, `rgba(240,166,74,${0.28 * glow})`); rg.addColorStop(1, 'rgba(240,166,74,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    sceneA(t);
    sceneB(t);
    sceneC(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.dawn, '~': C.party } });
  },
});
