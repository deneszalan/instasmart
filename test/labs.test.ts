import { describe, expect, it } from 'vitest';
import { LAB_IDS } from '../shared/labs';
import { LAB_COMPONENTS } from '../src/labs';
import { rng } from '../src/labs/kit';
import { simulate } from '../src/labs/math/monty-hall';
import { shared, sharesMine } from '../src/labs/math/birthday-problem';
import { ppv } from '../src/labs/math/base-rate-fallacy';
import { kaprekarStep, stepsTo6174 } from '../src/labs/math/kaprekar-6174';
import { overall } from '../src/labs/math/simpsons-paradox';
import { rippleAdd } from '../src/labs/tech/binary-adder-logic-gates';
import { enough } from '../src/labs/tech/binary-search-twenty-guesses';
import { encipher, stepRotors } from '../src/labs/tech/enigma-never-itself';
import { codes, forest, tieRarest } from '../src/labs/tech/huffman-coding-term-paper';
import { generator, powMod } from '../src/labs/tech/public-key-cryptography';
import { intensity } from '../src/labs/physics/double-slit';
import { turnRate } from '../src/labs/physics/foucault-pendulum';
import { DROPS } from '../src/labs/physics/pitch-drop-experiment';
import { airMass } from '../src/labs/physics/why-the-sky-is-blue';
import { amplitude } from '../src/labs/physics/chladni-figures-sand';
import { walkYears } from '../src/labs/space/ancient-sunlight';
import { circular, gravityShare } from '../src/labs/space/astronauts-are-falling';
import { orbitPoint } from '../src/labs/space/kepler-equal-areas';
import { retrograde } from '../src/labs/space/mars-retrograde-loop';
import { litShare, phaseIndex } from '../src/labs/space/moon-phases';
import { summerSunshine, TODAY } from '../src/labs/earth/milankovitch-cycles';
import { rossby } from '../src/labs/earth/coriolis-toilet-myth';
import { beats, loudness } from '../src/labs/music/beats-tuning';
import { fretGap, fretPosition, fretUnder } from '../src/labs/music/guitar-fret-spacing';
import { grid } from '../src/labs/music/polyrhythm-three-against-two';
import { waveAt } from '../src/labs/music/timbre-overtones';
import { greenwood, place } from '../src/labs/body/cochlea-pitch-map';
import { ecg, ESCAPE, qt } from '../src/labs/body/heart-pacemaker-sinoatrial-node';
import { urine } from '../src/labs/body/kidneys-filter-180-litres';
import { greyAt } from '../src/labs/psychology/checker-shadow-illusion';
import { makeTrials, SHAPES } from '../src/labs/psychology/mental-rotation';
import { darkDisc, litDot, msAt } from '../src/labs/psychology/phi-phenomenon';
import { recall } from '../src/labs/psychology/spacing-effect';
import { project } from '../src/labs/art/brunelleschi-perspective';
import { apparentWidth, rightAngle } from '../src/labs/art/holbein-anamorphic-skull';
import { brightness, mixLight } from '../src/labs/art/seurat-pointillism';
import { bendRadius, moulds, RADIUS } from '../src/labs/art/sydney-opera-house-sphere';
import { danceAngle, foodBearing } from '../src/labs/biology/honeybee-waggle-dance';
import { bandOf, COLS, freshPlate, ROWS, step } from '../src/labs/biology/mega-plate-evolution';
import { grow, wrinkledShare } from '../src/labs/biology/mendel-pea-ratios';
import { RESULTS, TESTS } from '../src/labs/biology/mitochondria-were-bacteria';
import { cobaltPasses, FLAMES } from '../src/labs/chemistry/flame-test-colours';
import { advance, density, ICE } from '../src/labs/chemistry/ice-floats';
import { front, RF, spot } from '../src/labs/chemistry/paper-chromatography';
import { coated, PER_DROP, SCUM } from '../src/labs/chemistry/soap-micelles';
import { fallSpeed, water } from '../src/labs/earth/hailstones-grow-in-layers';
import { distance, RATES, yearsAt } from '../src/labs/earth/plates-fingernail-speed';
import { clothCost, output } from '../src/labs/economics/comparative-advantage';
import { priceFactor } from '../src/labs/economics/hungary-hyperinflation';
import { play, tournament, YEARS } from '../src/labs/economics/prisoners-dilemma';
import { doublingYears, ruleOf72 } from '../src/labs/economics/rule-of-72';
import { season } from '../src/labs/economics/tragedy-of-the-commons';
import { peakAfterTop, push, stroke } from '../src/labs/engineering/four-stroke-engine';
import { tick } from '../src/labs/engineering/fridge-moves-heat';
import { fillStep, LIFT, STEP } from '../src/labs/engineering/panama-canal-gravity';
import { worst } from '../src/labs/engineering/taipei-101-damper';
import { equinox, leap } from '../src/labs/history/calendar-1752';
import { circumference, SHADOW } from '../src/labs/history/eratosthenes-earth-circumference';
import { forme } from '../src/labs/history/gutenberg-printing-press';
import { noonsAboard } from '../src/labs/history/magellan-lost-a-day';
import { hop, HOPS } from '../src/labs/language/a-napron-an-apron';
import { STAGES } from '../src/labs/language/aleph-to-a-alphabet';
import { placeIn, WORDS } from '../src/labs/language/great-vowel-shift';
import { CHAIN, PAIRS } from '../src/labs/language/grimms-law';
import { ruleHolds } from '../src/labs/philosophy/barber-paradox';
import { SHADOWS, shadowScale } from '../src/labs/philosophy/plato-allegory-of-the-cave';
import { PLANKS } from '../src/labs/philosophy/ship-of-theseus';
import { catchUp, steps } from '../src/labs/philosophy/zeno-achilles-tortoise';
import { doublingTime, formula, realPopulation } from '../src/labs/math/doomsday-13-november-2026';
import { MIDTERMS, record } from '../src/labs/politics/us-midterm-penalty';
import { problems, ROWS_MAP, seats } from '../src/labs/politics/redistricting-gerrymander';

describe('labs', () => {
  it('has a component for every lab and no others', () => {
    expect(Object.keys(LAB_COMPONENTS).sort()).toEqual([...LAB_IDS].sort());
  });
});

describe('lab maths', () => {
  it('Monty Hall: switching wins about 2 in 3 with a host who knows, 1 in 2 with one who guesses', () => {
    const knows = simulate(20000, true, rng(1)), guesses = simulate(20000, false, rng(2));
    expect(knows.switch[0] / knows.switch[1]).toBeCloseTo(2 / 3, 1);
    expect(knows.stay[0] / knows.stay[1]).toBeCloseTo(1 / 3, 1);
    expect(guesses.switch[0] / guesses.switch[1]).toBeCloseTo(0.5, 1);
  });

  it('birthdays: 50.7% at 23 people, under half at 22, and about 5.9% for your own', () => {
    expect(shared(23)).toBeCloseTo(0.507, 3);
    expect(shared(22)).toBeLessThan(0.5);
    expect(shared(70)).toBeGreaterThan(0.999);
    expect(sharesMine(23)).toBeCloseTo(0.0586, 3);
  });

  it('base rate: the post’s alarm is right 99 times in 10,098', () => {
    expect(ppv(1e-4, 0.99, 0.01)).toBeCloseTo(99 / 10098, 4);
  });

  it('Kaprekar: 3524 goes 3087, 8352, 6174; nothing needs more than 7 rounds; 8,991 numbers in all', () => {
    expect([3524, 3087, 8352].map((n) => kaprekarStep(n).next)).toEqual([3087, 8352, 6174]);
    expect(stepsTo6174(2025)).toBe(6);
    let count = 0, most = 0;
    for (let n = 1000; n <= 9999; n++) {
      if (/^(\d)\1{3}$/.test(String(n))) continue;
      count++;
      most = Math.max(most, stepsTo6174(n));
    }
    expect(count).toBe(8991);
    expect(most).toBe(7);
  });

  it('Simpson: the real mix of cases gives A 78% and B 83% overall', () => {
    expect(overall({ small: 81 / 87, large: 192 / 263 }, 263 / 350)).toBeCloseTo(273 / 350, 4);
    expect(overall({ small: 234 / 270, large: 55 / 80 }, 80 / 350)).toBeCloseTo(289 / 350, 4);
  });

  it('adder: 5 + 3 carries through three columns to make 8', () => {
    const { cols, total } = rippleAdd(5, 3);
    expect(total).toBe(8);
    expect(cols.map((c) => c.sum)).toEqual([0, 0, 0, 1]);
    expect(cols.map((c) => c.carryOut)).toEqual([1, 1, 1, 0]);
  });

  it('binary search: 7, 10 and 20 guesses for a hundred, a thousand and a million', () => {
    expect([100, 1000, 1000000].map(enough)).toEqual([7, 10, 20]);
  });

  it('Enigma I (I-II-III, reflector B, AAA): AAAAA gives BDZGO and HELLOWORLD gives ILBDAAMTAZ, never a letter as itself', () => {
    const type = (text: string) => {
      let pos = [0, 0, 0];
      return [...text]
        .map((ch) => {
          pos = stepRotors(pos);
          return String.fromCharCode(65 + encipher(ch.charCodeAt(0) - 65, pos));
        })
        .join('');
    };
    expect(type('AAAAA')).toBe('BDZGO');
    expect(type('HELLOWORLD')).toBe('ILBDAAMTAZ');
    const long = 'A'.repeat(2000), out = type(long);
    expect([...out].some((c) => c === 'A')).toBe(false);
    expect(type(type('HELLOWORLD'))).toBe('HELLOWORLD');
  });

  it('Huffman: ABRACADABRA takes 23 bits, with A as 0, B as 110 and R as 111', () => {
    let trees = forest('ABRACADABRA'), id = 100;
    while (trees.length > 1) trees = tieRarest(trees, id++);
    const table = codes(trees[0]);
    expect([...'ABRACADABRA'].reduce((n, ch) => n + table.get(ch)!.length, 0)).toBe(23);
    expect([table.get('A'), table.get('B'), table.get('R')]).toEqual(['0', '110', '111']);
  });

  it('Diffie–Hellman with 23 and 5: Alice sends 10, Bob 17, and both get 14', () => {
    expect(generator(23)).toBe(5);
    expect([powMod(5, 3, 23), powMod(5, 7, 23), powMod(17, 3, 23), powMod(10, 7, 23)]).toEqual([10, 17, 14, 14]);
  });

  it('double slit: a dark fringe between the slits’ waves, none when the slits are watched', () => {
    const darkY = 520 / (2 * 3 * 600);
    expect(intensity(darkY, 3, 520, false)).toBeLessThan(0.01);
    expect(intensity(darkY, 3, 520, true)).toBeGreaterThan(0.9);
  });

  it('Foucault: 11.3° an hour and about 31.8 hours in Paris, nothing at the equator', () => {
    expect(turnRate(48.85)).toBeCloseTo(11.3, 1);
    expect(360 / turnRate(48.85)).toBeCloseTo(31.8, 1);
    expect(turnRate(0)).toBeCloseTo(0, 6);
  });

  it('pitch drop: nine drops, the last in April 2014', () => {
    expect(DROPS).toHaveLength(9);
    expect(Math.floor(DROPS[8])).toBe(2014);
  });

  it('sky: the Sun near the horizon shines through about 38 times as much air', () => {
    expect(airMass(90)).toBeCloseTo(1, 2);
    expect(airMass(0)).toBeGreaterThan(35);
  });

  it('Chladni: the plate’s diagonals stay still in the (1, 2) mode', () => {
    for (const x of [0.1, 0.3, 0.7]) expect(Math.abs(amplitude(x, x, 1, 2))).toBeLessThan(1e-9);
  });

  it('sunlight: 1 mm steps across the radiative zone take some 25,000 years', () => {
    expect(walkYears(1e-3)).toBeGreaterThan(20000);
    expect(walkYears(1e-3)).toBeLessThan(30000);
  });

  it('orbit: 7.7 km/s at the station’s height, where gravity is 89% of its pull on the ground', () => {
    expect(circular(400)).toBeCloseTo(7.67, 1);
    expect(gravityShare(400)).toBeCloseTo(0.885, 2);
  });

  it('Kepler: closest at the start of the orbit, farthest halfway round', () => {
    const e = 0.5, d = (f: number) => Math.hypot(...orbitPoint(f, e));
    expect(d(0)).toBeCloseTo(1 - e, 6);
    expect(d(0.5)).toBeCloseTo(1 + e, 6);
  });

  it('Mars: backwards around opposition, forwards half a synodic period later', () => {
    expect(retrograde(0)).toBe(true);
    expect(retrograde(1.07)).toBe(false);
  });

  it('Moon: half lit at the quarters, named only near the exact phase', () => {
    expect(litShare(90)).toBeCloseTo(0.5, 6);
    expect([0, 70, 90, 180, 265, 330].map(phaseIndex)).toEqual([0, 1, 2, 4, 6, 7]);
  });

  it('Milankovitch: June sunshine at 65° N is about 478 W/m² today, and less with a smaller tilt', () => {
    expect(TODAY).toBeGreaterThan(470);
    expect(TODAY).toBeLessThan(485);
    expect(summerSunshine(22.1, 0.0167, 3)).toBeLessThan(TODAY - 20);
  });

  it('Coriolis: a toilet’s own swirl beats Earth’s spin thousands of times over; a hurricane’s doesn’t', () => {
    expect(rossby(1, 0.5, 45)).toBeGreaterThan(1000);
    expect(rossby(30, 5e5, 45)).toBeLessThan(1);
  });

  it('beats: 222 and 220 Hz beat twice a second; silent halfway between beats', () => {
    expect(beats(222, 220)).toBe(2);
    expect(loudness(0, 220, 224)).toBeCloseTo(2, 9);
    expect(loudness(1 / 8, 220, 224)).toBeCloseTo(0, 9);
  });

  it('frets: the 12th halfway along a 650 mm string, gaps from 36.5 mm to 19.3 mm', () => {
    expect(fretPosition(12)).toBeCloseTo(325, 6);
    expect(fretGap(1)).toBeCloseTo(36.5, 1);
    expect(fretGap(12)).toBeCloseTo(19.3, 1);
    expect(fretGap(2) / fretGap(1)).toBeCloseTo(1 / 1.0595, 4);
    expect([0, fretPosition(12) - 1, fretPosition(12) + 1].map(fretUnder)).toEqual([0, 12, 13]);
  });

  it('polyrhythm: 3 against 2 on six steps hits 1, 3, 4 and 5; 4:3 needs 12 and 5:4 needs 20', () => {
    const g = grid(3, 2);
    expect(g).toEqual({ steps: 6, a: [0, 2, 4], b: [0, 3] });
    expect([...new Set([...g.a, ...g.b])].sort().map((s) => s + 1)).toEqual([1, 3, 4, 5]);
    expect([grid(4, 3).steps, grid(5, 4).steps]).toEqual([12, 20]);
  });

  it('timbre: 2× and 3× without the fundamental still repeat once per cycle, not twice', () => {
    const amps = [0, 1, 1];
    expect(waveAt(0.3 + 1, amps)).toBeCloseTo(waveAt(0.3, amps), 9);
    expect(waveAt(0.25, amps)).not.toBeCloseTo(waveAt(0.75, amps), 3);
  });

  it('cochlea: Greenwood’s map runs from about 20 Hz at the tip to 20 kHz at the base', () => {
    expect(greenwood(0)).toBeCloseTo(19.8, 0);
    expect(greenwood(1)).toBeGreaterThan(20000);
    expect(greenwood(1)).toBeLessThan(21000);
    expect(place(10000)).toBeLessThan(place(1000));
    expect(place(greenwood(0.4))).toBeCloseTo(0.6, 9);
  });

  it('heart: a P wave only when the SA node starts the beat; backup at 40 to 60 a minute', () => {
    expect(qt(1)).toBeCloseTo(0.4, 9);
    expect(ecg(0.89, [{ at: 0.84, sinus: true }], 1)).toBeCloseTo(0.15, 2);
    expect(Math.abs(ecg(0.89, [{ at: 1, sinus: false }], 1))).toBeLessThan(0.01);
    expect(ecg(0.84 + 0.16, [{ at: 0.84, sinus: true }], 1)).toBeGreaterThan(0.9);
    expect(ESCAPE).toBeGreaterThanOrEqual(40);
    expect(ESCAPE).toBeLessThanOrEqual(60);
  });

  it('kidneys: taking back 99% of 180 litres leaves 1.8, 98% leaves 3.6', () => {
    expect(urine(0.99)).toBeCloseTo(1.8, 9);
    expect(urine(0.98)).toBeCloseTo(3.6, 9);
  });

  it('checker shadow: A in the light and B in the shadow are both 120', () => {
    expect([greyAt(1.5, 4.5, 0.6), greyAt(2.5, 2.5, 0.6)]).toEqual([120, 120]);
    expect(greyAt(2.5, 2.5, 1)).toBe(200);
    // every point of each square has the same grey, so a tap anywhere on it reads the same
    for (const d of [0.1, 0.5, 0.9]) expect([greyAt(1 + d, 4 + d, 0.6), greyAt(2 + d, 2 + 1 - d, 0.6)]).toEqual([120, 120]);
  });

  it('mental rotation: no figure matches its mirror image; 12 trials, 3 at each angle, half mirrored', () => {
    const norm = (cells: number[][]) => {
      const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1]));
      return cells.map(([x, y]) => `${x - mx},${y - my}`).sort().join(' ');
    };
    for (const shape of SHAPES) {
      let r = shape.map(([x, y]) => [-x, y]);
      for (let k = 0; k < 4; k++) {
        expect(norm(r)).not.toBe(norm(shape));
        r = r.map(([x, y]) => [-y, x]);
      }
    }
    const trials = makeTrials(rng(3));
    expect(trials).toHaveLength(12);
    expect(trials.filter((x) => x.mirror)).toHaveLength(6);
    for (const a of [0, 60, 120, 180]) expect(trials.filter((x) => x.angle === a)).toHaveLength(3);
  });

  it('phi: timings from one screen refresh to a second; dots and discs take turns', () => {
    expect([msAt(0), msAt(100)]).toEqual([17, 1000]);
    expect([litDot(50, 100), litDot(150, 100)]).toEqual([0, 1]);
    expect([darkDisc(50, 100), darkDisc(750, 100), darkDisc(850, 100)]).toEqual([0, 7, 0]);
  });

  it('spacing model: cramming the day before passes the test and fades; spread reviews last', () => {
    expect(recall([], 0)).toBe(1);
    expect(recall([29, 29, 29, 29], 30)).toBeGreaterThan(0.8);
    expect(recall([29, 29, 29, 29], 60)).toBeLessThan(0.05);
    expect(recall([6, 12, 18, 24], 60)).toBeGreaterThan(0.3);
    expect(recall([1, 3, 7, 15], 60)).toBeGreaterThan(0.3);
  });

  it('perspective: anything as tall as your eye reaches the horizon, however far away', () => {
    for (const Z of [5, 10, 40]) expect(project(1, 1.7, Z, 1.7)[1]).toBeCloseTo(0, 12);
    expect(project(0, 0, 10, 1.7)[1]).toBeCloseTo(2 * project(0, 0, 20, 1.7)[1], 12);
  });

  it('anamorphosis: a 5× stretch looks right from about 12°', () => {
    expect(rightAngle(5)).toBeCloseTo(11.5, 1);
    expect(apparentWidth(5, rightAngle(5))).toBeCloseTo(1, 9);
  });

  it('pointillism: red and yellow dots average to orange, no brighter than the dots', () => {
    const red = [255, 0, 0] as [number, number, number], yellow = [255, 255, 0] as [number, number, number];
    expect(mixLight(red, yellow)).toEqual([255, 188, 0]);
    expect(brightness(mixLight(red, yellow))).toBeCloseTo((brightness(red) + brightness(yellow)) / 2, 2);
  });

  it('Opera House: a rib cut from the sphere needs one mould; a parabola needs one per piece', () => {
    expect(bendRadius('sphere', 0.3)).toBeCloseTo(RADIUS, 1);
    expect(moulds('sphere', 12).count).toBe(1);
    expect(moulds('parabola', 12).count).toBe(12);
    expect(moulds('ellipse', 12).count).toBe(12);
  });

  it('waggle dance: food 40° right of the Sun is danced 40° right of up, and reads back the same', () => {
    expect(danceAngle(175, 135)).toBe(40);
    expect(danceAngle(100, 135)).toBe(325);
    expect(foodBearing(danceAngle(20, 300), 300)).toBe(20);
  });

  it('mega-plate: without mutations the bacteria never leave the drug-free edge; with them they reach the middle', () => {
    const run = (mu: number, gens: number) => {
      let cells = freshPlate();
      const rand = rng(5);
      for (let g = 0; g < gens; g++) cells = step(cells, mu, rand);
      let far = 0;
      cells.forEach((v, i) => v >= 0 && (far = Math.max(far, bandOf(i % COLS))));
      return far;
    };
    expect(run(0, 400)).toBe(0);
    expect(run(0.02, 1500)).toBe(4);
    expect(freshPlate().filter((v) => v === 0)).toHaveLength(ROWS);
  });

  it('Mendel: RR × rr gives no wrinkled seeds; Rr × Rr about one in four', () => {
    expect(wrinkledShare('RR', 'rr')).toBe(0);
    expect(wrinkledShare('Rr', 'Rr')).toBe(0.25);
    expect(grow('Rr', 'Rr', 20000, rng(9)) / 20000).toBeCloseTo(0.25, 1);
  });

  it('mitochondria: every test puts the mitochondrion with the bacterium, not the cell', () => {
    for (const test of TESTS) expect(RESULTS[test]).toEqual([true, true, false]);
  });

  it('flame test: sodium at 589 nm, held back by cobalt glass; potassium’s violet and deep red pass', () => {
    expect(FLAMES.Na.lines[0][0]).toBeCloseTo(589, 0);
    expect(cobaltPasses(589)).toBe(false);
    expect(FLAMES.K.lines.map(([nm]) => cobaltPasses(nm))).toEqual([true, true, true]);
  });

  it('ice: water is densest at 4 °C and ice floats; a cooling lake keeps 4 °C water at the bottom under its ice', () => {
    expect(density(4)).toBeGreaterThan(density(0));
    expect(density(4)).toBeGreaterThan(density(8));
    expect(density(0)).toBeCloseTo(999.84, 0);
    expect(ICE / density(0)).toBeCloseTo(0.917, 3);
    let lake = { temps: Array(20).fill(10), ice: 0, day: 0 };
    for (let k = 0; k < 4000; k++) lake = advance(lake, -8, 0.05);
    expect(lake.ice).toBeGreaterThan(0.1);
    expect(lake.temps[19]).toBeCloseTo(4, 0);
  });

  it('chromatography: a dye’s share of the solvent’s climb is its Rf, wherever the front is', () => {
    const f = front(30);
    expect((spot('M', f) - 1.5) / (f - 1.5)).toBeCloseTo(RF.M, 9);
    expect(front(1000)).toBe(11);
  });

  it('soap: 10 molecules coat a speck; hard water spends 30 on scum first', () => {
    expect(coated(90, 9, false)).toBe(9);
    expect(coated(90, 9, true)).toBe((90 - SCUM) / PER_DROP);
    expect(coated(5, 9, false)).toBe(0);
  });

  it('hail: 1 cm stones fall at about 9 m/s and 8 cm ones at about 48', () => {
    expect(fallSpeed(1)).toBe(9);
    expect(fallSpeed(8)).toBeCloseTo(48, -0.5);
    expect(water(3)).toBe(0);
  });

  it('plates: 42 mm of fingernail a year; 25 mm a year opens 5,000 km in 200 million years', () => {
    expect(yearsAt(0)).toBeCloseTo(1, 9);
    expect(yearsAt(100)).toBeCloseTo(2e8, -3);
    expect(RATES.nail).toBeCloseTo(3.5 * 12, 9);
    expect(distance(RATES.ridge * 2e8)).toBe('5,000 km');
  });

  it('Ricardo: England on cloth and Portugal on wine make 2.2 cloth and 2.125 wine', () => {
    expect(output('england', 1).cloth + output('portugal', 0).cloth).toBeCloseTo(2.2, 9);
    expect(output('england', 1).wine + output('portugal', 0).wine).toBeCloseTo(2.125, 9);
    expect(output('england', 100 / 220).cloth).toBeCloseTo(1, 9);
    expect([clothCost('england'), clothCost('portugal')]).toEqual([100 / 120, 1.125]);
  });

  it('hyperinflation: doubling every 15 hours makes prices 65,536 times higher in ten days', () => {
    expect(priceFactor(240, 15)).toBe(65536);
  });

  it('prisoner’s dilemma: betraying always cuts your own years; tit for tat wins the tournament', () => {
    for (const other of ['C', 'D']) expect(YEARS['D' + other][0]).toBeLessThan(YEARS['C' + other][0]);
    expect(play('tft', [], Math.random)).toBe('C');
    expect(play('tft', ['D'], Math.random)).toBe('D');
    const total = tournament();
    expect(Math.min(...Object.values(total))).toBe(total.tft);
  });

  it('rule of 72: 9.01 years at 8%, spot on near 7.8%, and 69.3 exact for continuous interest', () => {
    expect(doublingYears(8)).toBeCloseTo(9.01, 2);
    expect(Math.abs(ruleOf72(7.8) - doublingYears(7.8))).toBeLessThan(0.01);
    expect(doublingYears(6) * 6).toBeLessThan(72);
    expect(doublingYears(6, true) * 6).toBeCloseTo(69.3, 1);
  });

  it('commons: 12 cows leave the pasture green; 60 strip it bare', () => {
    let a = 80, b = 80;
    for (let k = 0; k < 100; k++) {
      a = season(a, 12).grass;
      b = season(b, 60).grass;
    }
    expect(a).toBeGreaterThan(70);
    expect(b).toBeLessThan(1);
  });

  it('engine: four strokes in two turns; the spark comes earlier at higher speed', () => {
    expect([0, 200, 400, 600].map(stroke)).toEqual(['intake', 'compression', 'power', 'exhaust']);
    expect(push(peakAfterTop(2, 1000))).toBeCloseTo(1, 9);
    expect(push(peakAfterTop(26, 3000))).toBeCloseTo(1, 9);
    expect(push(peakAfterTop(2, 3000))).toBeLessThan(0.9);
  });

  it('fridge: with the door open in a closed kitchen, the kitchen only gets warmer', () => {
    let s = { kitchen: 20, box: 4, on: true, moved: 0, used: 0 };
    for (let k = 0; k < 2000; k++) s = tick(s, true, 0.05);
    expect(s.kitchen).toBeGreaterThan(20);
    expect(s.moved + s.used).toBeGreaterThan(s.moved);
  });

  it('locks: three steps of about 8.7 m lift a ship 26 m, and water only runs downhill', () => {
    expect(STEP * 3).toBeCloseTo(LIFT, 9);
    expect(fillStep(0, STEP, 0.1)).toBeGreaterThan(0);
    expect(fillStep(STEP, STEP, 0.1)).toBe(STEP);
  });

  it('tuned damper: well tuned, it cuts the worst sway by about 40%; badly tuned, hardly at all', () => {
    const none = worst(1, null);
    expect(1 - worst(1, 0.015) / none).toBeCloseTo(0.4, 1);
    expect(1 - worst(1.15, 0.01) / none).toBeLessThan(0.1);
  });

  it('calendar: 97 leap years in 400; the Julian equinox drifts to 11 March by 1582', () => {
    let n = 0;
    for (let y = 2000; y < 2400; y++) if (leap(y, true)) n++;
    expect(n).toBe(97);
    expect(Math.round(equinox(1582, false))).toBe(11);
    expect(Math.round(equinox(2000, true))).toBe(21);
  });

  it('Eratosthenes: 7.2° and 5,000 stadia make 250,000 stadia', () => {
    expect(circumference(SHADOW)).toBeCloseTo(250000, 6);
  });

  it('Gutenberg: the type is the page’s mirror image, letters in reverse order', () => {
    expect(forme('MAINZ').join('')).toBe('ZNIAM');
  });

  it('Magellan: one noon fewer sailing west, one more sailing east', () => {
    expect([noonsAboard(5, true), noonsAboard(5, false)]).toEqual([4, 6]);
  });

  it('a napron: hopping the n gives an apron, and back again', () => {
    for (const h of HOPS) {
      expect(hop(h.from)).toEqual(h.to);
      expect(hop(h.to)).toEqual(h.from);
    }
  });

  it('alphabet: five stages from about 1850 BC to today', () => {
    expect(STAGES[0]).toContain('1850');
    expect(STAGES).toHaveLength(5);
  });

  it('vowel shift: each word starts at its Middle English vowel and ends at today’s', () => {
    const bite = WORDS.find((w) => w.word === 'bite')!, meet = WORDS.find((w) => w.word === 'meet')!;
    expect(placeIn(bite, 1400).to).toBeNull();
    expect(placeIn(bite, 1900).to).not.toBeNull();
    expect(placeIn(meet, 1900).at).toEqual(placeIn(WORDS.find((w) => w.word === 'meat')!, 1900).at);
  });

  it('Grimm: every example follows a step in the chain', () => {
    const steps = new Map(CHAIN.flat());
    for (const p of PAIRS) expect(steps.get(p.from)).toBe(p.to);
  });

  it('barber: the rule fails whether he shaves himself or not', () => {
    expect([ruleHolds(true), ruleHolds(false)]).toEqual([false, false]);
  });

  it('cave: three different things cast the same circle; nearer the fire, a bigger shadow', () => {
    expect(new Set(SHADOWS.filter((s) => s.shadow === 'circle').map((s) => s.thing)).size).toBe(3);
    expect(shadowScale(2, 10)).toBeGreaterThan(shadowScale(8, 10));
  });

  it('Theseus: 38 planks', () => {
    expect(PLANKS).toBe(38);
  });

  it('Zeno: 10 + 1 + 0.1 + … seconds add up to 11.1 s', () => {
    const t = steps(100, 10, 1, 30);
    expect(t.slice(0, 3)).toEqual([10, 1, 0.1].map((x) => expect.closeTo(x, 9)));
    expect(t.reduce((a, b) => a + b, 0)).toBeCloseTo(catchUp(100, 10, 1), 9);
    expect(catchUp(100, 10, 1)).toBeCloseTo(11.11, 2);
  });

  it('doomsday: the 1960 formula fits 1950, says 27 billion for 2020, and doubles in under a year from late 2024', () => {
    expect(formula(1950)).toBeCloseTo(2.4, 1);
    expect(Math.round(formula(2020))).toBe(27);
    expect(realPopulation(2020)).toBe(7.9);
    expect(doublingTime(1960)).toBeCloseTo(33.7, 1);
    expect(doublingTime(2024.8)).toBeGreaterThan(1);
    expect(doublingTime(2024.9)).toBeLessThan(1);
  });

  it('midterms: since 1946 the president’s party lost House seats in 18 of 20, about 26 on average, and Senate seats in 13', () => {
    expect(MIDTERMS).toHaveLength(20);
    expect(record('house').losses).toBe(18);
    expect(record('house').average).toBeCloseTo(-25.65, 2);
    expect(record('senate').losses).toBe(13);
    expect(MIDTERMS.filter((m) => m.house > 0).map((m) => m.year)).toEqual([1998, 2002]);
  });

  it('gerrymander: rows give purple 5–0; column pairs, a valid map, give orange 3 of 5 with 40% of the votes', () => {
    expect(problems(ROWS_MAP)).toEqual([]);
    expect(seats(ROWS_MAP).purple).toBe(5);
    const pairs = ROWS_MAP.map((_, i) => Math.floor((i % 10) / 2));
    expect(problems(pairs)).toEqual([]);
    expect(seats(pairs).orange).toBe(3);
    const broken = ROWS_MAP.map((d, i) => (i === 0 ? 4 : d));
    expect(problems(broken)).toEqual([0, 4]);
  });
});
