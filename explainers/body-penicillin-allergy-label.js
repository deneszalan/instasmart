// Explainer for body-penicillin-allergy-label: on 22 October 2026 (Australian time) the Guardian reported that
// the Australasian Society of Clinical Immunology and Allergy (ASCIA) had changed its guidelines on penicillin
// allergy, as evidence shows that up to 90% of the Australians who report one are not allergic. How a wrong label
// comes about, what a true allergy is, why the label matters (broader antibiotics, superbugs), and how doctors
// check it. Look: a clinic at night in ink blue,
// a paper allergy tag in red, antibodies in gold on lilac mast cells, histamine in pink, gut bacteria in mint,
// the infection in coral and drug-resistant bacteria in violet. Libre Franklin (a newspaper gothic) for titles and
// tags, Source Sans 3 for captions.
//
// Facts: The Guardian, "Majority of Australians who report penicillin allergy not truly allergic" (Jack Larkin,
// 21 October 2026, 10:00 US Eastern time, which is 22 October in Australia; the campaign it reports opened that day): penicillin was thought to cause allergies in 10% of Australians, about 2.8 million people;
// the latest evidence shows up to 90% of those reporting a penicillin allergy do not have one; the changes to the
// Australasian Society of Clinical Immunology and Allergy guidelines are published in the Journal of Allergy and
// Clinical Immunology; Michaela Lucas, clinical immunologist, University of Western Australia: people have a rash
// or nausea after taking penicillin and assume an allergy, doctors record side-effects as allergies to be
// cautious, a parent's report from childhood is carried into adulthood, and some side-effects may be due to the
// illness itself; penicillin is a narrow-spectrum antibiotic, targeted at the bug causing the infection; broader
// antibiotics have a bigger impact on the gut microbiome, killing good bacteria and letting superbugs in; resistant
// bacteria can spread between people; Nick Cooling (Royal Australian College of General Practitioners): to
// de-label some 2.8 million people "you can't just rely on the 300 immunologists"; in low-risk cases doctors could
// give penicillin and monitor; "No one should try taking penicillin themselves to find out whether they are
// allergic. Antibiotics should only be taken when prescribed." US Centers for Disease Control and Prevention,
// "Clinical Features of Penicillin Allergy": a true allergy may be an immediate (IgE-mediated) reaction;
// penicillin allergy-specific IgE antibodies may decrease over time; a label can prompt second-line broad-spectrum
// antibiotics; evaluation by history, risk stratification, skin testing or a direct oral challenge for low-risk
// patients. Wikipedia, "Type I hypersensitivity": IgE binds to mast cells; later exposure to the allergen
// cross-links the bound IgE and releases histamine within minutes.
//
// Computed here: up to 90% of 2.8 million is about 2.5 million; 2.8 million / 300 = about 9,300 labels for each
// immunologist. The people, cells and bacteria are illustrative; the antibiotic panels are a picture of the idea,
// not of any real drug's effect.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The news; 1 in 10 labelled, 2.8 million; up to 9 in 10 of them not allergic.
//  B 14.0–23.2  How labels happen: a rash during an illness; a cautious note; a childhood story.
//  C 23.2–37.0  A true allergy: IgE on mast cells, histamine in minutes; antibodies can fade.
//  D 37.0–51.0  Narrow vs broad antibiotics; superbugs.
//  E 51.0–64.8  Checking the label; 300 immunologists; never test yourself.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#0a1220', bg1: '#142238', ink: '#f2f5fa', soft: 'rgba(242,245,250,0.76)', faint: 'rgba(242,245,250,0.3)',
  tag: '#e5484d', paper: '#f4ead2', ige: '#f2c14e', mast: '#b48cf0', hist: '#ff7aa8', gut: '#6fdc9a',
  bug: '#ff8a5c', super: '#9b6bff', good: '#7ee0a8', panel: 'rgba(8,14,26,0.9)',
};
const HEAD = 'Libre Franklin', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const LABELLED = 2.8e6, NOT_ALLERGIC = 0.9, IMMUNOLOGISTS = 300;
const MAYBE_CLEAR = Math.round((LABELLED * NOT_ALLERGIC) / 1e5) / 10; // 2.5 million
const EACH = Math.round(LABELLED / IMMUNOLOGISTS / 100) * 100; // 9,300
const fmt = (n) => n.toLocaleString('en-US');

const CUES = [
  [0.4, 4.8, 'On *22 October 2026*, news broke that Australia’s allergy specialists had rewritten their *penicillin* advice.'],
  [5.0, 9.4, 'About *1 in 10* Australians, *2.8 million* people, have been labelled allergic to the antibiotic penicillin.'],
  [9.6, 14.0, 'But the evidence now says up to *9 in 10* of them are not allergic at all. How do so many wrong labels happen?'],
  [14.2, 18.6, 'Someone gets a rash or nausea on penicillin and assumes an allergy, though the illness may be the cause.'],
  [18.8, 23.2, 'Doctors may note a side effect as an allergy to be safe, or a parent’s memory from childhood sticks for life.'],
  [23.4, 27.8, 'In a true allergy, the body has made antibodies called ~IgE~ (immunoglobulin E) that sit on ^mast cells^.'],
  [28.0, 32.4, 'On the next dose the drug links those antibodies, and the cells burst out *histamine* within minutes.'],
  [32.6, 37.0, 'It brings hives, swelling, even trouble breathing. Yet US health officials say the antibodies can fade.'],
  [37.2, 41.6, 'A wrong label matters. Penicillin is *narrow*: it targets the bacteria behind the infection.'],
  [41.8, 46.2, 'Without it, doctors turn to ~broader~ antibiotics, which also kill many helpful bacteria in the gut.'],
  [46.4, 50.8, 'That leaves room for ^superbugs^: bacteria that resist many drugs and can spread to other people.'],
  [51.0, 55.4, 'Doctors can check: a careful history, skin tests, or for low-risk patients a dose given while they watch.'],
  [55.6, 60.0, `With some *${IMMUNOLOGISTS}* immunologists for 2.8 million labels, about ${fmt(EACH)} each, family doctors must help too.`],
  [60.2, 64.6, 'And no one should try penicillin themselves to find out, doctors warn: only when it is prescribed.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(0.75, C.bg0); lg.addColorStop(1, '#060b14');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(242,245,250,0.04)'; g.lineWidth = 1;
  for (let y = 40; y < 780; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// ---------- pieces ----------
function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 16 * s, 8 * s, 0, TAU); ctx.fill();
  k.rrect(x - 10 * s, y - 6 * s, 20 * s, 24 * s, 7 * s); ctx.fill();
}

/** A paper allergy tag; `crossed` 0–1 strikes it out. */
function tag(x, y, s = 1, crossed = 0, rot = -0.08) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = C.paper; k.rrect(-150, -40, 300, 80, 12); ctx.fill();
  ctx.fillStyle = C.tag; k.rrect(-150, -40, 60, 80, 12); ctx.fill(); ctx.fillRect(-100, -40, 10, 80);
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(-120, 0, 9, 0, TAU); ctx.fill();
  font(800, 22, HEAD); text('ALLERGY:', -78, -12, { color: C.tag });
  font(800, 26, HEAD); text('PENICILLIN', -78, 16, { color: '#3a2a20' });
  if (crossed > 0) {
    ctx.strokeStyle = C.good; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-160, 30); ctx.lineTo(-160 + 320 * crossed, -30); ctx.stroke(); ctx.lineCap = 'butt';
  }
  ctx.restore();
}

/** An antibody, a Y, at (x, y) pointing along `ang` (radians; 0 = up). */
function antibody(x, y, ang, s = 1, col = C.ige) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.lineTo(-11, -32); ctx.moveTo(0, -18); ctx.lineTo(11, -32); ctx.stroke();
  ctx.lineCap = 'butt'; ctx.restore();
}

function mastCell(cx, cy, r, burst = 0) {
  ctx.fillStyle = 'rgba(180,140,240,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.mast; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  let s = 3; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const a = rr() * TAU, d = Math.sqrt(rr()) * r * 0.82, out = burst * (60 + rr() * 220);
    const x = cx + Math.cos(a) * (d + out), y = cy + Math.sin(a) * (d + out);
    ctx.fillStyle = burst > 0 && out > 10 ? C.hist : 'rgba(255,122,168,0.7)';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(120,80,200,0.8)'; ctx.beginPath(); ctx.ellipse(cx - r * 0.15, cy + r * 0.1, r * 0.3, r * 0.22, 0.4, 0, TAU); ctx.fill();
}

/** A penicillin molecule, roughly: a square ring fused to a five-ring. */
function drug(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#e8f1ff'; ctx.lineWidth = 3.5;
  ctx.strokeRect(-14, -10, 16, 16);
  ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(16, -14); ctx.lineTo(24, -2); ctx.lineTo(16, 10); ctx.lineTo(2, 6); ctx.stroke();
  ctx.restore();
}

/** A rod-shaped bacterium. */
function bacterium(x, y, ang, col, s = 1, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = col; k.rrect(-14 * s, -6 * s, 28 * s, 12 * s, 6 * s); ctx.fill();
    ctx.restore();
  });
}

// ---------- A: the label and the numbers ----------
function sceneA(t) {
  const a = span(t, 0, 14.2, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(800, 54, HEAD); text('The penicillin label', 52, 102);
    font(600, 22); text('AUSTRALIA · NEW GUIDELINES · OCTOBER 2026', 54, 148, { color: C.ige, spacing: '1px' });
    A(span(t, 0, 5.0, 0.01, 0.4), () => {
      tag(W / 2, 360, 1.5, 0, -0.08);
      font(400, 24); text('a note in a medical record', W / 2, 500, { color: C.soft, align: 'center' });
    });
    A(span(t, 5.0, 14.2, 0.4, 0.01), () => {
      const cols = 10, sx = 64, x0 = W / 2 - ((cols - 1) * sx) / 2, y0 = 230;
      for (let i = 0; i < 100; i++) {
        const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * 46;
        const labelled = i % 10 === 4;
        const cleared = labelled && i !== 54 && t > 10.2 + (i / 100) * 1.6;
        person(x, y, 0.9, labelled ? (cleared ? C.good : C.tag) : 'rgba(242,245,250,0.28)');
      }
      chip(132, 700, 600, 66, () => {
        font(700, 28, HEAD);
        if (t < 9.6) text('10 in 100 labelled: 2.8 million', W / 2, 733, { color: C.tag, align: 'center' });
        else text(`up to 9 in 10 of them: not allergic`, W / 2, 733, { color: C.good, align: 'center' });
      });
    });
  });
}

// ---------- B: how labels happen ----------
function sceneB(t) {
  const a = span(t, 14.0, 23.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 18.8) {
      // an arm with a rash, a fever and a pill
      ctx.fillStyle = '#e2b892'; k.rrect(120, 330, 520, 120, 60); ctx.fill();
      let s = 8; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const n = Math.floor(40 * seg(t, 14.6, 16.4));
      for (let i = 0; i < n; i++) { ctx.fillStyle = 'rgba(214,60,70,0.55)'; ctx.beginPath(); ctx.arc(160 + r() * 440, 350 + r() * 80, 5 + r() * 5, 0, TAU); ctx.fill(); }
      chip(660, 300, 160, 180, () => {
        drug(740, 350, 1.6);
        font(600, 22); text('penicillin', 740, 410, { color: C.soft, align: 'center' });
      });
      chip(120, 200, 300, 70, () => { font(700, 26, HEAD); text('fever: an infection', 270, 236, { color: C.bug, align: 'center' }); });
      A(seg(t, 16.6, 17.2), () => {
        font(800, 44, HEAD); text('allergy?', W / 2, 560, { color: C.tag, align: 'center' });
        font(400, 24); text('or the illness itself?', W / 2, 610, { color: C.soft, align: 'center' });
      });
    } else {
      // the note made, and carried from childhood
      const p = eio(seg(t, 19.2, 22.6));
      tag(W / 2, 250, 1.1, 0, -0.04);
      const years = Math.round(lerp(1995, 2026, p));
      const s = lerp(0.9, 1.6, p);
      person(lerp(200, 620, p), 560, s * 2.2, C.ink);
      font(800, 40, HEAD); text(String(years), lerp(200, 620, p), 660, { color: C.ige, align: 'center' });
      font(400, 24); text('to be safe, or a parent’s memory', W / 2, 360, { color: C.soft, align: 'center' });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(150, 700); ctx.lineTo(714, 700); ctx.stroke(); ctx.setLineDash([]);
    }
  });
}

// ---------- C: what a true allergy is ----------
function sceneC(t) {
  const a = span(t, 23.2, 37.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = 432, cy = 440, r = 150;
    const burst = eout(seg(t, 30.0, 31.6));
    mastCell(cx, cy, r, burst);
    // antibodies around the surface
    const nAb = 12;
    for (let i = 0; i < nAb; i++) {
      const ang = (i / nAb) * TAU;
      antibody(cx + Math.sin(ang) * r, cy - Math.cos(ang) * r, ang, 1, C.ige);
    }
    font(700, 26, HEAD); text('mast cell', cx, cy + r + 50, { color: C.mast, align: 'center' });
    A(span(t, 23.4, 28.2, 0.4, 0.4), () => {
      font(700, 26, HEAD); text('IgE antibodies', 640, 230, { color: C.ige });
    });
    // the drug arrives and bridges pairs of antibodies
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      const p = eio(seg(t, 28.2, 29.8));
      for (let i = 0; i < nAb; i += 2) {
        const ang = ((i + 0.5) / nAb) * TAU, d = r + 44;
        const x = cx + Math.sin(ang) * lerp(d + 220, d, p), y = cy - Math.cos(ang) * lerp(d + 220, d, p);
        drug(x, y, 1.1);
      }
      font(700, 26, HEAD); text('penicillin links them', 600, 196, { color: '#e8f1ff' });
      A(seg(t, 30.0, 30.6), () => {
        chip(560, 640, 260, 90, () => {
          font(700, 30, HEAD); text('histamine', 580, 672, { color: C.hist });
          font(400, 22); text('within minutes', 580, 708, { color: C.soft });
        });
      });
    });
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      ['hives', 'swelling', 'trouble breathing'].forEach((s, i) => {
        chip(52, 190 + i * 70, 260, 56, () => { font(700, 26, HEAD); text(s, 72, 218 + i * 70, { color: C.hist }); });
      });
      chip(560, 640, 260, 90, () => {
        font(400, 22); text('IgE may fade', 580, 670, { color: C.soft });
        font(700, 26, HEAD); text('over the years', 580, 704, { color: C.ige });
      });
    });
  });
}

// ---------- D: narrow and broad ----------
const GUT = (() => {
  let s = 21; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 70 }, (_, i) => ({ x: 90 + r() * 684, y: 220 + r() * 440, a: r() * TAU, kind: i < 8 ? 'bug' : i < 11 ? 'super' : 'gut', r: r() }));
})();
function sceneD(t) {
  const a = span(t, 37.0, 51.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = 'rgba(111,220,154,0.25)'; ctx.lineWidth = 3; k.rrect(60, 190, 744, 500, 40); ctx.stroke();
    font(400, 22); text('bacteria in the body (illustrative)', W / 2, 176, { color: C.faint, align: 'center' });
    const narrow = seg(t, 38.4, 40.2), broad = seg(t, 42.4, 44.2), grow = seg(t, 46.8, 49.8);
    for (const b of GUT) {
      let alive = 1, col = b.kind === 'bug' ? C.bug : b.kind === 'super' ? C.super : C.gut;
      if (t < 41.8) { if (b.kind === 'bug') alive = 1 - narrow; }
      else { alive = b.kind === 'super' ? 1 : b.kind === 'gut' ? (b.r < 0.25 ? 1 : 1 - broad) : 1 - broad; }
      if (t >= 41.8 && b.kind === 'gut' && t >= 46.4 && b.r >= 0.25) {
        // the freed room fills with drug-resistant bacteria
        alive = grow > b.r ? 1 : 0; col = C.super;
      }
      bacterium(b.x, b.y, b.a, col, 1.2, alive);
    }
    if (t < 41.8) {
      font(700, 30, HEAD); text('penicillin: narrow', W / 2, 726, { color: C.ige, align: 'center' });
    } else if (t < 46.4) {
      font(700, 30, HEAD); text('a broader antibiotic', W / 2, 726, { color: C.ige, align: 'center' });
    } else {
      font(700, 30, HEAD); text('drug-resistant bacteria move in', W / 2, 726, { color: C.super, align: 'center' });
    }
    // a key
    const key = [[C.bug, 'infection'], [C.gut, 'helpful gut bacteria'], [C.super, 'drug-resistant']];
    key.forEach(([c, s], i) => { const x = [90, 262, 540][i]; bacterium(x, 140, 0, c, 0.9); font(400, 22); text(s, x + 22, 141, { color: C.soft }); });
  });
}

// ---------- E: checking, capacity, a warning ----------
function sceneE(t) {
  const a = span(t, 50.8, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 50.8, 55.6, 0.01, 0.4), () => {
      font(800, 40, HEAD); text('Checking the label', 52, 180);
      ['a careful history', 'skin tests', 'a dose given while they watch'].forEach((s, i) => A(seg(t, 51.2 + i * 0.9, 51.6 + i * 0.9), () => {
        chip(52, 240 + i * 120, 760, 96, () => {
          ctx.strokeStyle = C.good; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(84, 288 + i * 120); ctx.lineTo(100, 304 + i * 120); ctx.lineTo(128, 268 + i * 120); ctx.stroke(); ctx.lineCap = 'butt';
          font(700, 32, HEAD); text(s, 160, 288 + i * 120, { color: C.ink });
        });
      }));
      font(400, 22); text('the last only for low-risk patients', 160, 618, { color: C.soft });
    });
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      font(800, 92, HEAD); text(String(IMMUNOLOGISTS), 240, 300, { color: C.ige, align: 'center' });
      font(400, 24); text('immunologists', 240, 366, { color: C.soft, align: 'center' });
      font(800, 92, HEAD); text('2.8 m', 624, 300, { color: C.tag, align: 'center' });
      font(400, 24); text('labels', 624, 366, { color: C.soft, align: 'center' });
      chip(182, 450, 500, 110, () => {
        font(800, 44, HEAD); text(`≈ ${fmt(EACH)} each`, W / 2, 492, { color: C.ink, align: 'center' });
        font(400, 22); text(`up to ${MAYBE_CLEAR} million may not be allergic`, W / 2, 534, { color: C.good, align: 'center' });
      });
    });
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      ctx.strokeStyle = C.tag; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(W / 2, 420, 170, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 120, 540); ctx.lineTo(W / 2 + 120, 300); ctx.stroke();
      drug(W / 2 - 20, 410, 4);
      font(800, 34, HEAD); text('only when prescribed', W / 2, 650, { color: C.ink, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [HEAD, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC(t); sceneD(t); sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.ige, '~': C.ige, '^': C.mast } });
  },
});
