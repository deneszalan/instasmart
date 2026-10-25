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
});
