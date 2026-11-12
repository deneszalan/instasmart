// Explainer for history-1945-election-smallholders-win (Hungary 1956): the free election of 4 November 1945, held
// under Soviet occupation. The Independent Smallholders' Party won about 57% and an absolute majority of seats, the
// Communists about 17%; yet a coalition took office in which the Communists held the Interior Ministry and with it
// the police, and over the next four years they wore their rivals down. Look: dark green-grey card, cream ballot
// papers, a schematic map of Hungary, a hemicycle of the 409 elected seats computed from the official seat count, a
// cabinet table of 18 chairs; no Soviet symbols beyond a plain label. Libre Caslon Text for headings (print of the
// period), Source Sans 3 for captions and labels.
//
// Facts:
// - FRUS 1945 vol. IV, doc. 853 (history.state.gov/historicaldocuments/frus1945v04/d853): Schoenfeld, US
//   Representative in Hungary, 9 November 1945: Smallholders "popular majority of 2,680,527 or 57% of the total" of
//   4,701,026 votes; Social Democrats 818,082, Communists 795,659; 246 mandates, adjusted on 10 November to 245 (SD
//   and Communists 69 each in that adjustment); "There has been no evidence that election was anything but free and
//   untrammeled."
// - Final count (Nohlen & Stöver, Elections in Europe, 2010, via Wikipedia "1945 Hungarian parliamentary election"):
//   FKgP 57.03%, 245 seats; SZDP 17.41%, 69; MKP 16.96%, 70; NPP 6.87%, 23; PDP 1.62%, 2; 409 elected seats; turnout
//   92.5% (4,773,545 of 5,160,499 registered).
// - FRUS 1945 vol. IV, doc. 838: Schoenfeld, 17 October 1945: Voroshilov suggested to Tildy "a common electoral list
//   for national election". The parties ran separately (doc. 853's count is by party).
// - FRUS 1945 vol. IV, doc. 856: Schoenfeld, 15 November 1945: the new government "composed of 18 members including 9
//   Smallholders, 4 Communists, 4 Social Democrats and one National Peasant"; "Smallholders conceded Interior Ministry
//   to Communists"; Imre Nagy became Interior Minister. UN Special Committee report (1957), para. 218: Nagy "became
//   Minister of the Interior in November 1945"; para. 426: the Interior Ministry, under which the security police was
//   then placed, "was taken out of the hands of the Independent Smallholders' Party".
// - Library of Congress, Hungary: A Country Study, "Postwar Hungary": Voroshilov, chairman of the Allied Control
//   Commission, "exercised absolute control" and vetoed the coalition's agreement to give the Interior Ministry to a
//   Smallholder; methods "Rakosi later called 'salami tactics'"; the Soviet Union ordered the arrest of Smallholder
//   secretary general Béla Kovács in 1947 on a false charge; 1947 election: the Communists won only 22 percent and
//   "fraud tainted the election"; next page: in 1949 a single-list election; on 20 August 1949 a Soviet-style
//   constitution, the Hungarian People's Republic.
// The map is schematic: the border from rounded coordinates.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–13.8  Hungary, 4 November 1945; the Allied Control Commission; the common list that did not happen.
//  B 14.2–32.4  Turnout and a free vote; the votes; the seats.
//  C 32.6–46.2  The coalition of 18; the Interior Ministry and the police.
//  D 46.4–64.6  Salami tactics; Béla Kovács; 1947; 1949.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1b2420', bg2: '#101613', paper: '#efe6cf', paperInk: '#2a2a22', ink: '#f3ecd9',
  soft: 'rgba(243,236,217,0.74)', faint: 'rgba(243,236,217,0.22)', line: 'rgba(243,236,217,0.06)',
  fkgp: '#e2b84a', szdp: '#e8978f', mkp: '#d4483b', npp: '#8fbf62', pdp: '#8fa7bf', panel: 'rgba(12,17,14,0.88)',
};
const HEAD = 'Libre Caslon Text', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
/** One decimal, with the render language's decimal mark (a comma where thousands are not grouped with commas). */
const dec = (v) => { const s = v.toFixed(1); return Kit.fmt(1234).includes(',') ? s : s.replace('.', ','); };

// ---------- the parties: the final count of 4 November 1945 ----------
const PARTIES = [
  { key: 'mkp', short: 'Communists', name: 'Communists', pct: 16.96, seats: 70, col: C.mkp },
  { key: 'szdp', short: 'Soc. Dem.', name: 'Social Democrats', pct: 17.41, seats: 69, col: C.szdp },
  { key: 'npp', short: 'Peasants', name: 'National Peasants', pct: 6.87, seats: 23, col: C.npp },
  { key: 'pdp', short: 'Civic Dem.', name: 'Civic Democrats', pct: 1.62, seats: 2, col: C.pdp },
  { key: 'fkgp', short: 'Smallholders', name: 'Smallholders', pct: 57.03, seats: 245, col: C.fkgp },
];
const SEATS = PARTIES.reduce((s, p) => s + p.seats, 0);
if (SEATS !== 409) throw new Error(`seats ${SEATS}`);
const FKGP = PARTIES[4];
if (FKGP.seats * 2 <= SEATS) throw new Error('no majority');
// The cabinet of 15 November 1945 (FRUS doc. 856): 9 Smallholders, 4 Communists, 4 Social Democrats, 1 Peasant.
const CABINET = [...Array(9).fill('fkgp'), ...Array(4).fill('mkp'), ...Array(4).fill('szdp'), 'npp'];
if (CABINET.length !== 18) throw new Error('cabinet');
const colOf = (key) => PARTIES.find((p) => p.key === key).col;

// ---------- the hemicycle: 409 seats in rows, filled left to right ----------
const HEMI = (() => {
  const rows = 8, r0 = 120, r1 = 300, seats = [];
  const radii = Array.from({ length: rows }, (_, i) => lerp(r0, r1, i / (rows - 1)));
  const total = radii.reduce((s, r) => s + r, 0);
  let left = SEATS;
  radii.forEach((r, i) => {
    const n = i === rows - 1 ? left : Math.round((SEATS * r) / total);
    left -= n;
    for (let j = 0; j < n; j++) seats.push({ r, a: Math.PI - (Math.PI * (j + 0.5)) / n });
  });
  seats.sort((p, q) => q.a - p.a);
  let at = 0;
  for (const p of PARTIES) for (let j = 0; j < p.seats; j++) seats[at++].col = p.col;
  return seats;
})();

// ---------- the map of Hungary (schematic, from rounded coordinates) ----------
const KX = 102, KY = 150, LON0 = 16.05, LAT0 = 48.62;
const P = (lon, lat) => [80 + (lon - LON0) * KX, 230 + (LAT0 - lat) * KY];
const BORDER = [[16.11, 46.86], [16.45, 47.0], [16.52, 47.35], [16.45, 47.45], [16.65, 47.62], [16.9, 47.75], [17.1, 48.0],
  [17.7, 47.76], [18.0, 47.75], [18.7, 47.8], [18.9, 47.95], [19.4, 48.1], [19.9, 48.15], [20.4, 48.55], [21.15, 48.55],
  [21.6, 48.45], [22.1, 48.4], [22.9, 47.95], [22.3, 47.75], [21.95, 47.35], [21.7, 47.0], [21.25, 46.4], [20.75, 46.2],
  [20.25, 46.12], [19.7, 46.17], [19.1, 45.95], [18.8, 45.88], [18.2, 45.8], [17.6, 45.95], [17.2, 46.15], [16.85, 46.35],
  [16.6, 46.48], [16.4, 46.65]];
const DANUBE = [[17.1, 48.0], [17.7, 47.76], [18.7, 47.8], [18.97, 47.79], [19.05, 47.5], [18.95, 47.2], [18.92, 46.9], [18.86, 46.62], [18.68, 46.0], [18.85, 45.9]];
const TISZA = [[22.4, 48.1], [21.6, 48.2], [21.2, 47.7], [20.4, 47.2], [20.2, 46.9], [20.1, 46.3], [20.25, 46.12]];
function hungary(a, { fill = 'rgba(239,230,207,0.07)' } = {}) {
  A(a, () => {
    ctx.beginPath(); BORDER.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.stroke();
    for (const river of [DANUBE, TISZA]) {
      ctx.beginPath(); river.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p))));
      ctx.strokeStyle = 'rgba(143,167,191,0.55)'; ctx.lineWidth = 3; ctx.stroke();
    }
    const [bx, by] = P(19.05, 47.5);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill();
    font(700, 24); text('Budapest', bx + 14, by - 14, { color: C.ink });
    font(500, 22); text('Schematic map', 80, 700, { color: C.soft });
  });
}

/** A ballot paper, cream, with a cross in the box when `cross` is on. */
function ballot(x, y, w, h, title, { cross = 0, col = C.paperInk, size = 22, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = C.paper; k.rrect(-w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(42,42,34,0.35)'; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2 + 14, -h / 2 + h * 0.58, 26, 26);
  if (cross > 0) {
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const bx = -w / 2 + 14, by = -h / 2 + h * 0.58, c = clamp(cross * 2), d = clamp(cross * 2 - 1);
    ctx.beginPath(); ctx.moveTo(bx + 4, by + 4); ctx.lineTo(bx + 4 + 18 * c, by + 4 + 18 * c); ctx.stroke();
    if (d > 0) { ctx.beginPath(); ctx.moveTo(bx + 22, by + 4); ctx.lineTo(bx + 22 - 18 * d, by + 4 + 18 * d); ctx.stroke(); }
    ctx.lineCap = 'butt';
  }
  font(700, size, HEAD); text(title, 0, -h / 2 + h * 0.3, { align: 'center', color: C.paperInk });
  ctx.restore();
}

/** A tag: a short label on a dark pill. */
function tag(s, x, y, col, { size = 23, align = 'center' } = {}) {
  font(700, size);
  const tw = ctx.measureText(s).width, pad = 12, bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 9); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}

function heading(s, sub, a, y = 104) {
  A(a, () => {
    font(700, 40, HEAD); text(s, 70, y, { color: C.ink });
    if (sub) { font(600, 26); text(sub, 70, y + 42, { color: C.fkgp }); }
  });
}

// ---------- A: the place, the commission, the common list ----------
function sceneA(t) {
  A(span(t, 0, 14.0, 0.5, 0.4), () => {
    heading('4 NOVEMBER 1945', 'Hungary · a free general election', 1);
    hungary(seg(t, 0.6, 1.8) * (1 - 0.7 * seg(t, 9.8, 10.4)));
    // the Allied Control Commission (cue 2)
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(150, 470, 564, 150, 16); ctx.fill();
      ctx.strokeStyle = C.mkp; ctx.lineWidth = 2; ctx.stroke();
      font(700, 27, HEAD); text('Allied Control Commission', CX, 510, { align: 'center', color: C.ink });
      font(500, 23); text('chairman: Soviet marshal Kliment Voroshilov', CX, 552, { align: 'center', color: C.soft });
      text('Soviet troops in the country since 1944–45', CX, 588, { align: 'center', color: C.soft });
    });
    // one common list, proposed in October; the parties ran separately (cue 3)
    A(seg(t, 9.6, 10.0), () => {
      const split = eio(seg(t, 11.4, 12.8));
      A(1 - split, () => ballot(CX, 520, 300, 150, 'ONE COMMON LIST?', { size: 26 }));
      A(seg(t, 11.6, 12.0), () => PARTIES.slice().reverse().forEach((p, i) => {
        const x = lerp(CX, 140 + i * 146, split), y = lerp(520, 540, split);
        ballot(x, y, 132, 120, '', { rot: (i - 2) * 0.04 });
        ctx.fillStyle = p.col; ctx.fillRect(x - 54, y - 44, 108, 10);
        font(700, 18); text(p.short, x, y - 12, { align: 'center', color: C.paperInk });
      }));
      A(seg(t, 12.6, 13.0), () => { font(600, 23); text('Voroshilov’s idea, October 1945: the parties ran separately', CX, 650, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- B: the vote ----------
function sceneB(t) {
  A(span(t, 14.0, 32.6, 0.4, 0.4), () => {
    heading('THE VOTE', 'Final count', seg(t, 18.6, 19.0) * (1 - seg(t, 27.6, 28.0)));
    // turnout and the US envoy's verdict (cue 4)
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      const g = eout(seg(t, 14.6, 16.4));
      ballot(250, 440, 220, 150, 'BALLOT', { cross: seg(t, 15.0, 16.0), col: C.fkgp });
      font(700, 92, HEAD); text(`${dec(92.5 * g)}%`, 600, 420, { align: 'center', color: C.ink });
      font(600, 25); text('of registered voters took part', 600, 478, { align: 'center', color: C.soft });
      A(seg(t, 16.4, 17.0), () => {
        ctx.fillStyle = C.panel; k.rrect(90, 560, 684, 140, 14); ctx.fill();
        font(400, 26, HEAD); text('“no evidence that election was anything', CX, 602, { align: 'center', color: C.ink });
        text('but free and untrammeled”', CX, 638, { align: 'center', color: C.ink });
        font(500, 21); text('US representative in Budapest, 9 November 1945', CX, 676, { align: 'center', color: C.soft });
      });
    });
    // the votes, as bars (cues 5 and 6)
    A(span(t, 18.8, 28.0, 0.4, 0.4), () => {
      const x0 = 300, bw = 440, y0 = 270, dy = 84;
      PARTIES.slice().reverse().forEach((p, i) => {
        const y = y0 + i * dy, grow = eout(seg(t, 19.2 + (p.key === 'fkgp' ? 0 : 3.0 + i * 0.3), 20.6 + (p.key === 'fkgp' ? 0 : 3.0 + i * 0.3)));
        const hi = p.key === 'fkgp' ? 1 - 0.5 * seg(t, 23.4, 23.8) : 0.5 + 0.5 * seg(t, 23.4, 23.8) * (p.key === 'mkp' || p.key === 'szdp' ? 1 : 0);
        A(0.35 + 0.65 * hi, () => {
          font(700, 25); text(p.name, x0 - 18, y, { align: 'right', color: p.col });
          ctx.fillStyle = 'rgba(243,236,217,0.08)'; ctx.fillRect(x0, y - 18, bw, 36);
          ctx.fillStyle = p.col; ctx.fillRect(x0, y - 18, (bw * p.pct * grow) / 60, 36);
          if (grow > 0.9) { font(700, 25); text(`${dec(p.pct)}%`, x0 + (bw * p.pct) / 60 + 12, y, { color: C.ink }); }
        });
      });
      // the half-way line
      A(seg(t, 20.8, 21.4), () => {
        const hx = x0 + (bw * 50) / 60;
        ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.moveTo(hx, y0 - 46); ctx.lineTo(hx, y0 + 4 * dy + 30); ctx.stroke(); ctx.setLineDash([]);
        font(600, 21); text('half of all votes', hx, y0 - 58, { align: 'center', color: C.soft });
      });
      A(seg(t, 23.8, 24.4), () => { font(600, 23); text('Communist Party leader: Mátyás Rákosi', CX, 700, { align: 'center', color: C.mkp }); });
    });
    // the seats (cue 7)
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      const cx = CX, cy = 560, n = Math.round(SEATS * eout(seg(t, 28.2, 30.0)));
      HEMI.slice(0, n).forEach((s) => { ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(cx + s.r * Math.cos(s.a), cy - s.r * Math.sin(s.a), 7.5, 0, TAU); ctx.fill(); });
      font(700, 34, HEAD); text('NATIONAL ASSEMBLY', CX, 150, { align: 'center', color: C.ink });
      A(seg(t, 30.0, 30.6), () => {
        font(700, 64, HEAD); text(`${fmt(FKGP.seats)} / ${fmt(SEATS)}`, cx, cy + 64, { align: 'center', color: C.fkgp });
        font(600, 24); text('elected seats for the Smallholders: a majority on their own', cx, cy + 118, { align: 'center', color: C.soft });
        // which side is whose
        font(700, 22); text('Communists', cx - 300, cy + 26, { align: 'left', color: C.mkp });
        text('Smallholders', cx + 300, cy + 26, { align: 'right', color: C.fkgp });
      });
    });
  });
}

// ---------- C: the coalition and the Interior Ministry ----------
const CHAIRS = (() => {
  const out = [], cx = CX, cy = 440, rx = 280, ry = 150;
  for (let i = 0; i < 18; i++) {
    const a = Math.PI + (TAU * (i + 0.5)) / 18;
    out.push([cx + (rx + 46) * Math.cos(a), cy + (ry + 40) * Math.sin(a)]);
  }
  return out;
})();
const INTERIOR = 12; // the chair labelled Interior: a Communist chair on the table's right
function sceneC(t) {
  A(span(t, 32.6, 46.4, 0.4, 0.4), () => {
    heading('15 NOVEMBER 1945', 'The coalition government', 1);
    // the table
    ctx.fillStyle = 'rgba(8,12,10,0.72)'; ctx.beginPath(); ctx.ellipse(CX, 440, 280, 150, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();
    CHAIRS.forEach(([x, y], i) => A(seg(t, 33.0 + i * 0.08, 33.4 + i * 0.08), () => {
      const key = CABINET[i], interior = i === INTERIOR;
      let col = colOf(key);
      if (interior) col = seg(t, 41.6, 42.4) > 0.5 ? C.mkp : seg(t, 37.4, 37.8) > 0.5 ? C.fkgp : col;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.bg2; ctx.lineWidth = 3; ctx.stroke();
    }));
    // counts, at the centre of the table
    A(seg(t, 34.6, 35.2) * (1 - seg(t, 37.2, 37.6)), () => {
      font(700, 32, HEAD); text('18 ministers', CX, 362, { align: 'center', color: C.ink });
      [['9 Smallholders', C.fkgp], ['4 Communists', C.mkp], ['4 Social Democrats', C.szdp], ['1 National Peasant', C.npp]].forEach(([s, c], i) => {
        font(700, 27); text(s, CX, 410 + i * 36, { align: 'center', color: c });
      });
    });
    // the Interior Ministry (cues 9 and 10)
    A(seg(t, 37.4, 37.8), () => {
      const [x, y] = CHAIRS[INTERIOR];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 32 + 3 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      font(700, 30, HEAD); text('INTERIOR MINISTRY', CX, 410, { align: 'center', color: C.ink });
      font(600, 23); text('the police, and the political police', CX, 450, { align: 'center', color: C.soft });
      // Voroshilov's veto of a Smallholder there
      A(seg(t, 38.6, 39.2) * (1 - seg(t, 41.4, 41.8)), () => {
        ctx.save(); ctx.translate(CX, 506); ctx.rotate(-0.06);
        ctx.strokeStyle = C.mkp; ctx.lineWidth = 4; k.rrect(-150, -26, 300, 52, 8); ctx.stroke();
        font(700, 26); text('VETO: VOROSHILOV', 0, 2, { align: 'center', color: C.mkp });
        ctx.restore();
      });
      A(seg(t, 42.2, 42.8), () => {
        font(700, 27); text('Imre Nagy, Communist', CX, 506, { align: 'center', color: C.mkp });
        font(500, 22); text('interior minister from 15 November 1945', CX, 540, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- D: what came of it ----------
function sceneD(t) {
  A(span(t, 46.4, 65.2, 0.4, 0), () => {
    // salami tactics (cue 11): the coalition partners as one bar, in seats; slices cut off one after another
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      heading('1946–1948', 'Salami tactics: Rákosi’s later phrase', 1);
      const x0 = 90, w = 684, y = 400, h = 84, unit = w / SEATS;
      let x = x0;
      for (const p of PARTIES) {
        const pw = p.seats * unit;
        if (p.key === 'mkp') { ctx.fillStyle = p.col; ctx.fillRect(x, y, pw - 3, h); x += pw; continue; }
        const n = Math.max(1, Math.round(p.seats / 35));
        for (let i = 0; i < n; i++) {
          const order = p.key === 'fkgp' ? n - 1 - i : 0;
          const start = 47.2 + (p.key === 'fkgp' ? 0.9 + order * 0.32 : p.key === 'szdp' ? 0.3 : 0.6);
          const cut = eio(seg(t, start, start + 0.7));
          const sw = pw / n;
          A(1 - 0.9 * cut, () => {
            ctx.fillStyle = p.col;
            ctx.fillRect(x + i * sw + 2 + cut * 4, y + cut * 120, sw - 4, h);
          });
        }
        x += pw;
      }
      font(700, 23); text('Communists', x0, y - 26, { color: C.mkp });
      text('their partners and rivals', x0 + 160, y - 26, { color: C.soft });
      font(600, 24); text('rivals branded “reactionary”, one slice at a time', CX, 660, { align: 'center', color: C.soft });
    });
    // Béla Kovács (cue 12)
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      heading('1947', 'Arrested by Soviet authorities', 1);
      ctx.fillStyle = C.panel; k.rrect(130, 330, 604, 230, 18); ctx.fill(); ctx.strokeStyle = C.fkgp; ctx.lineWidth = 2; ctx.stroke();
      // a plain figure
      const fx = 240, fy = 450;
      ctx.fillStyle = C.fkgp; ctx.beginPath(); ctx.arc(fx, fy - 46, 26, 0, TAU); ctx.fill();
      k.rrect(fx - 38, fy - 14, 76, 96, 22); ctx.fill();
      font(700, 30, HEAD); text('Béla Kovács', 300, 410, { color: C.ink });
      font(500, 22); text('general secretary of the', 300, 448, { color: C.soft });
      text('Independent Smallholders’ Party', 300, 476, { color: C.soft });
      font(600, 22); text('a false charge of conspiracy', 300, 516, { color: C.mkp });
    });
    // the 1947 election (cue 13)
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      heading('1947', 'A second election', 1);
      const g = eout(seg(t, 56.0, 57.4)), x0 = 140, bw = 584, y = 420;
      ctx.fillStyle = 'rgba(243,236,217,0.08)'; ctx.fillRect(x0, y - 26, bw, 52);
      ctx.fillStyle = C.mkp; ctx.fillRect(x0, y - 26, bw * 0.22 * g, 52);
      font(700, 30); text('Communists: 22%', x0, y - 58, { color: C.mkp });
      A(seg(t, 57.4, 58.0), () => {
        ctx.save(); ctx.translate(560, 540); ctx.rotate(-0.08);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; k.rrect(-150, -30, 300, 60, 8); ctx.stroke();
        font(700, 30); text('TAINTED BY FRAUD', 0, 2, { align: 'center', color: C.ink });
        ctx.restore();
      });
    });
    // 1949 (cue 14)
    A(seg(t, 60.2, 60.6), () => {
      heading('1949', 'One list, one party in power', 1);
      ballot(CX, 430, 360, 190, 'ONE LIST', { cross: seg(t, 61.0, 62.0), size: 32 });
      A(seg(t, 62.0, 62.6), () => {
        font(700, 30, HEAD); text('Hungarian People’s Republic', CX, 600, { align: 'center', color: C.mkp });
        font(500, 23); text('Soviet-style constitution, 20 August 1949', CX, 640, { align: 'center', color: C.soft });
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
  g.strokeStyle = C.line; g.lineWidth = 1;
  for (let y = 40; y <= 780; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, 4 November 1945: half a year after the war, under *Soviet occupation*, the country votes.'],
  [5.0, 9.4, 'An Allied Control Commission, chaired by Soviet marshal *Kliment Voroshilov*, held real power.'],
  [9.6, 14.0, 'In October Voroshilov had proposed one *common list* for all parties. They ran separately.'],
  [14.2, 18.6, 'Over nine in ten voters took part; the US envoy saw *no evidence* the vote was not free.'],
  [18.8, 23.2, 'The *Independent Smallholders’ Party* won about 57% of the votes: a majority on its own.'],
  [23.4, 27.8, 'The Communists of Mátyás Rákosi won about ~17%~, close to the Social Democrats.'],
  [28.0, 32.4, 'In the new National Assembly that meant *245 of 409* elected seats for the Smallholders.'],
  [32.6, 37.0, 'Yet on 15 November a *coalition* took office: 9 Smallholder ministers out of 18.'],
  [37.2, 41.6, 'Voroshilov vetoed a Smallholder at the *Interior Ministry*, which ran the police.'],
  [41.8, 46.2, 'Communist ~Imre Nagy~ became interior minister, over the police and the political police.'],
  [46.4, 50.8, 'With the police in hand, the Communists cut their rivals down slice by slice: *salami tactics*.'],
  [51.0, 55.4, 'In 1947 Soviet authorities arrested Smallholder leader *Béla Kovács* on a false charge.'],
  [55.6, 60.0, 'In a new election in 1947, tainted by fraud, the Communists won only ~22%~.'],
  [60.2, 64.6, 'By 1949 voters had a *single list*, and Hungary became a one-party People’s Republic.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    sceneC(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.fkgp, '~': C.mkp } });
  },
});
