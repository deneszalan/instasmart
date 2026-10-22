// "The birthday problem: why 23 people are enough", a long-form 16:9 explainer.
// The narration, one line per caption. `say` is what the voice reads when it differs from the caption.
// `gap` is the pause before the line (seconds); chapter openings get a longer one for their title card.
//
// Facts and sources
// - Wikipedia, "Birthday problem" (https://en.wikipedia.org/wiki/Birthday_problem):
//   23 people give 50.7% (P(A') = 365/365 × 364/365 × … × 343/365 ≈ 0.492703, so 50.7297%); the table
//   (10: 11.7%, 30: 70.6%, 50: 97.0%, 70: 99.9%; ≥ 366: 100% by the pigeonhole principle, leap years ignored);
//   23 × 22 / 2 = 253 pairs; the usual assumptions (365 equally likely days, independent; leap years, twins,
//   selection bias and seasonal variation disregarded); "Any unevenness increases the likelihood of two
//   people sharing a birthday", but real birthdays are "not sufficiently uneven to make much change": the
//   real-world answer is still 23 (Cortina Borja & Haigh 2007); Harold Davenport, about 1927, unpublished, did
//   not claim discovery "because he could not believe that it had not been stated earlier"; first publication
//   by Richard von Mises, 1939; "same birthday as you": q(n) = 1 − (364/365)^n, at least 253 people, far more
//   than 182.5 because the others share birthdays among themselves; an event of probability 1/k has a 1/2
//   chance after about k ln 2 tries; p(23) ≈ 1 − (364/365)^253 ≈ 0.500477; mean number of people to the first
//   match ≈ 24.61659; 2014 FIFA World Cup: 32 squads of 23, an analysis of the squad lists suggested 16 had
//   shared birthdays, 5 of them two pairs (BBC, 2014); Voracek, Tran & Formann (2008): most people markedly
//   overestimate the number of people needed.
// - Wikipedia, "Birthday attack" (https://en.wikipedia.org/wiki/Birthday_attack): collision with 50% chance
//   after about 2^(l/2) hashes (n(0.5; H) ≈ 1.1774 √H); a 64-bit hash has about 1.8 × 10^19 outputs and needs
//   about 5.1 × 10^9 hashes for 50%; 2^(l−1) for the classical (preimage) security with the same probability;
//   the fair/fraudulent contract variations (commas, spaces, synonyms) and the signature moved across; the
//   defence: about twice as many bits as are needed against an ordinary brute-force attack.
// - Wikipedia, "Cryptographic hash function" (https://en.wikipedia.org/wiki/Cryptographic_hash_function):
//   fixed-size output; hash values are sometimes called digital fingerprints; collision resistance n/2 bits
//   "because of the birthday paradox"; SHA-256 has a 256-bit output.
// - Wikipedia, "Birthday" (https://en.wikipedia.org/wiki/Birthday), "Distribution through the year": in the US,
//   more births in September and October; 1973–1999, September 16 the most common US birthday and December 25
//   the least common (other than February 29).
// Computed here (numbers.mjs, sim.mjs): q(22) = 5.9%; 46 guests make 1,035 pairs; p passes 99% at 57; with
// 181 equally likely days (January–June) 17 guests give 53.9%; with a million days, 1,178 people; √506 = 22.49;
// 1.1774 × √365 = 22.49; 2^63 ≈ 9.2 × 10^18; 2^128 has 39 digits. Simulations (seeded mulberry32, see sim.mjs):
// the demo party (seed 35: guest 20 matches guest 7 on November 19); 1,000 rooms (seed 2026: 511 matched by
// guest 23, mean 24.68, min 3, 6 rooms past 60, first rooms 28, 33, 18); 253 birthdays (seed 253: 180 days).
import { rooms, demo, crowd } from './sim.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
const md = (d) => { let m = 0; while (d >= LEN[m]) { d -= LEN[m]; m++; } return [m, d]; };

const D = demo();
const [DM, DD] = md(D.days[D.first]);
export const DEMO = { seed: D.seed, guest: D.first + 1, with: D.other + 1, date: `${MONTHS[DM]} ${DD + 1}`, said: `${MONTHS[DM]} the ${ORD[DD]}` };
const F = rooms();
export const ROOMS = { by23: F.filter((k) => k <= 23).length, mean: (F.reduce((a, b) => a + b, 0) / F.length).toFixed(1), min: Math.min(...F), past60: F.filter((k) => k > 60).length, first: F.slice(0, 3) };
export const CROWD = crowd().distinct;

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Imagine a party with 23 guests.' },
  { key: 'o2', text: 'What are the chances that two of them share a birthday?' },
  { key: 'o3', text: 'With 365 days in a year, a match sounds unlikely.' },
  { key: 'o4', text: 'In fact, it’s more likely than not: *50.7%*.', say: 'In fact, it’s more likely than not: 50.7 percent.' },
  { key: 'o5', text: 'With 70 guests, it’s *99.9%*: almost certain.', say: 'With 70 guests, it’s 99.9 percent. Almost certain.' },
  { key: 'o6', gap: 0.6, text: 'This is the *birthday problem*. Let’s see why it works.' },
  // ---- 1 a room of 23
  { key: 'a1', gap: 4.2, chapter: 'A room of 23', text: 'First, the rules of our party.' },
  { key: 'a2', text: 'Each birthday is one of 365 days, all equally likely, and we’ll leave out February 29.', say: 'Each birthday is one of 365 days, all equally likely, and we’ll leave out February the twenty-ninth.' },
  { key: 'a3', text: 'Guests arrive one at a time, and we mark each birthday on the calendar.' },
  { key: 'a4', gap: 0.8, text: `Guest ${DEMO.guest} lands on a day that’s already taken: *${DEMO.date}*, the birthday of guest ${DEMO.with}.`, say: `Guest ${DEMO.guest} lands on a day that’s already taken: ${DEMO.said}, the birthday of guest ${DEMO.with}.` },
  { key: 'a5', text: 'That’s one party. Here are 1,000 more, each with 23 random guests.' },
  { key: 'a6', text: `~${ROOMS.by23}~ of them have a shared birthday: about half, just as the maths says.` },
  { key: 'a7', gap: 0.8, text: 'Our instincts say it should take far more guests. In one study, most people *markedly overestimated* the number needed.' },
  { key: 'a8', text: 'The puzzle is usually credited to the mathematician Harold Davenport, around 1927.' },
  { key: 'a9', text: 'He didn’t publish it, or claim it as his own: he couldn’t believe nobody had stated it before.' },
  { key: 'a10', text: 'The first published version came from Richard von Mises, in 1939.', say: 'The first published version came from Richard von Meezes, in 1939.' },
  // ---- 2 it's not about you
  { key: 'b1', gap: 4.2, chapter: 'It’s not about you', text: 'So why does our intuition get this so wrong?' },
  { key: 'b2', text: 'It’s natural to think about *your own* birthday.' },
  { key: 'b3', text: 'With 22 other guests, the chance that someone shares *yours* is only about 6%.', say: 'With 22 other guests, the chance that someone shares yours is only about 6 percent.' },
  { key: 'b4', gap: 0.8, text: 'But any two guests can make a match, not just you and someone else.' },
  { key: 'b5', text: 'So draw a line between every pair of guests.' },
  { key: 'b6', text: 'The first guest pairs with 22 others, the next with 21 more, and so on.' },
  { key: 'b7', text: 'That’s 23 × 22 ÷ 2: ~253 pairs~.', say: 'That’s 23 times 22, divided by 2. 253 pairs.' },
  { key: 'b8', gap: 0.8, text: 'Only 22 of those pairs include you. The other ~231~ are matches you weren’t counting.' },
  { key: 'b9', text: 'And pairs grow fast. Double the guests to 46, and there are 1,035 pairs: about four times as many.' },
  // ---- 3 counting the misses
  { key: 'c1', gap: 4.2, chapter: 'Counting the misses', text: 'For the exact chance, it’s easier to work out the opposite: that *no two* guests share a birthday.' },
  { key: 'c2', text: 'The first guest can have any birthday: 365 days out of 365.' },
  { key: 'c3', text: 'The second must miss the first: 364 out of 365.' },
  { key: 'c4', text: 'The third must miss both: 363 out of 365. And so on.' },
  { key: 'c5', text: 'Guest 23 must miss all 22 before: 343 out of 365.' },
  { key: 'c6', gap: 0.8, text: 'Multiply all 23 fractions, and the chance that every birthday differs is ~49.3%~.', say: 'Multiply all 23 fractions, and the chance that every birthday differs is 49.3 percent.' },
  { key: 'c7', text: 'So the chance of at least one shared birthday is *50.7%*.', say: 'So the chance of at least one shared birthday is 50.7 percent.' },
  { key: 'c8', text: 'Each fraction is close to 1, but there are many, and each new guest has more birthdays to avoid.' },
  { key: 'c9', gap: 0.8, text: 'Do the same sum for every size of party, and the chance climbs quickly.' },
  { key: 'c10', text: '10 guests: 11.7%. 30 guests: 70.6%. 50 guests: 97%.', say: '10 guests: 11.7 percent. 30 guests: 70.6 percent. 50 guests: 97 percent.' },
  { key: 'c11', text: 'It passes 99% at 57 guests, and 99.9% at 70.', say: 'It passes 99 percent at 57 guests, and 99.9 percent at 70.' },
  { key: 'c12', text: 'A match is only *certain* at 366 guests, when there are more guests than days.' },
  // ---- 4 rooms filling up
  { key: 'd1', gap: 4.2, chapter: 'Rooms filling up', text: 'Let’s watch it happen. Guests enter a room one by one, and we stop at the first shared birthday.' },
  { key: 'd2', text: `In this room, the first match came with guest ${ROOMS.first[0]}.` },
  { key: 'd3', text: `In this one, guest ${ROOMS.first[1]}. And in this one, guest ${ROOMS.first[2]}.` },
  { key: 'd4', gap: 0.8, text: 'Now a thousand rooms. Each dot is one room, placed at the guest who brought its first match.' },
  { key: 'd5', text: `A few rooms matched very early, with just ${ROOMS.min} guests. A few went past 60.` },
  { key: 'd6', text: `In *${ROOMS.by23}* of the 1,000 rooms, the first match came by guest 23.` },
  { key: 'd7', text: `On average, the first match took ${ROOMS.mean} guests. The theory says about 24.6.` },
  { key: 'd8', gap: 0.8, text: 'Real groups behave the same way. At the 2014 World Cup, each of the 32 squads had 23 players.' },
  { key: 'd9', text: 'An analysis of the squad lists suggested that *16* of them had a shared birthday: exactly half.' },
  { key: 'd10', text: 'Five of those squads even had two pairs.' },
  // ---- 5 someone shares my birthday
  { key: 'y1', gap: 4.2, chapter: 'Someone shares my birthday', text: 'Now change the question: how many people do you need for an even chance that someone shares *your* birthday?' },
  { key: 'y2', text: 'Each person matches you with a chance of 1 in 365.', say: 'Each person matches you with a chance of one in 365.' },
  { key: 'y3', text: 'So the chance that nobody does is 364 out of 365, multiplied once for every person.' },
  { key: 'y4', text: 'That shrinks slowly. It takes ~253 people~ to reach an even chance.' },
  { key: 'y5', gap: 0.8, text: 'That’s far more than half of 365, because many of those people share birthdays with each other instead.' },
  { key: 'y6', text: `Drop 253 random birthdays on the calendar, and they land on only ${CROWD} different days.` },
  { key: 'y7', text: 'So your birthday has only about an even chance of being one of them.' },
  { key: 'y8', gap: 0.8, text: 'Now look at that number again: 253, exactly the number of pairs among 23 guests.' },
  { key: 'y9', text: 'That’s no coincidence. Both questions need about 253 chances, each of 1 in 365.', say: 'That’s no coincidence. Both questions need about 253 chances, each of one in 365.' },
  { key: 'y10', text: 'A 1-in-365 chance becomes an even bet after about 253 tries: *365 × ln 2*.', say: 'A one-in-365 chance becomes an even bet after about 253 tries. That’s 365 times the natural log of 2.' },
  // ---- 6 a rule of thumb
  { key: 'r1', gap: 4.2, chapter: 'A rule of thumb', text: 'That gives a quick rule for any number of days, not just 365.' },
  { key: 'r2', text: 'With *n* guests, there are about *n² ÷ 2* pairs.', say: 'With n guests, there are about n squared over 2 pairs.' },
  { key: 'r3', text: 'For an even chance we need about 253 pairs, so n² should be about 506.', say: 'For an even chance we need about 253 pairs, so n squared should be about 506.' },
  { key: 'r4', text: 'The square root of 506 is about 22.5. Round up, and you get ~23~.' },
  { key: 'r5', gap: 0.8, text: 'In general, you need about *1.18 × √days*.', say: 'In general, you need about 1.18 times the square root of the number of days.' },
  { key: 'r6', text: 'With a million equally likely days, just 1,178 people would give an even chance.' },
  { key: 'r7', text: 'That’s the real surprise: the people needed grow only like the square root of the days.' },
  // ---- 7 real birthdays
  { key: 'u1', gap: 4.2, chapter: 'Real birthdays', text: 'Our party made some simplifications: 365 equally likely days, no February 29, and no twins.', say: 'Our party made some simplifications: 365 equally likely days, no February the twenty-ninth, and no twins.' },
  { key: 'u2', text: 'Real birthdays aren’t spread evenly. In the US, more babies tend to be born in September and October.' },
  { key: 'u3', text: 'From 1973 to 1999, September 16 was the most common US birthday, and Christmas Day the rarest, apart from February 29.', say: 'From 1973 to 1999, September the sixteenth was the most common birthday in the US, and Christmas Day the rarest, apart from February the twenty-ninth.' },
  { key: 'u4', gap: 0.8, text: 'Does that break the maths? No: any unevenness only makes a shared birthday *more* likely.' },
  { key: 'u5', text: 'Take an extreme case: imagine everyone was born in the first half of the year.' },
  { key: 'u6', text: 'Then just ~17 guests~ would give a better-than-even chance.' },
  { key: 'u7', text: 'Real birthdays are only slightly uneven, so the real-world answer is still ~23~.' },
  { key: 'u8', text: 'And twins nearly always share a birthday, which can only raise the chance.' },
  // ---- 8 the birthday attack
  { key: 'h1', gap: 4.2, chapter: 'The birthday attack', text: 'The same maths matters in computer security.' },
  { key: 'h2', text: 'A hash function turns any file into a short digital fingerprint of fixed length.' },
  { key: 'h3', text: 'A 64-bit fingerprint has about *18 billion billion* possible values.' },
  { key: 'h4', text: 'Two different files with the same fingerprint make a *collision*.' },
  { key: 'h5', gap: 0.8, text: 'Fingerprints are like birthdays, in a year with an enormous number of days.' },
  { key: 'h6', text: 'So collisions show up after about the square root of that number: 2 to the power of half the bits.', say: 'So collisions show up after about the square root of that number. That’s 2 to the power of half the number of bits.' },
  { key: 'h7', text: 'For 64 bits, about *5 billion* tries give an even chance of a collision.' },
  { key: 'h8', text: 'Matching one particular fingerprint, like matching your own birthday, takes about 9 billion billion tries.' },
  { key: 'h9', gap: 0.8, text: 'That’s the idea behind the *birthday attack*. Imagine a forger with a fair contract and a fraudulent one.' },
  { key: 'h10', text: 'She makes many harmless variations of each: an extra comma, a double space, a synonym.' },
  { key: 'h11', text: 'When a fair version and a fraudulent version share a fingerprint, she has her collision.' },
  { key: 'h12', text: 'Her victim signs the fair version, and the signature fits the fraudulent one just as well.' },
  { key: 'h13', gap: 0.8, text: 'The defence is longer fingerprints, with about twice as many bits as brute force alone would demand.' },
  { key: 'h14', text: 'SHA-256 has 256 bits, so a collision takes around 2 to the 128 tries: a 39-digit number.', say: 'S H A 256 has 256 bits, so a collision takes around 2 to the power of 128 tries. That’s a number with 39 digits.' },
  // ---- 9 the answer
  { key: 'z1', gap: 4.2, chapter: 'The answer', text: 'So, back to the party.' },
  { key: 'z2', text: '23 guests sound like too few, because we picture matches with ourselves.' },
  { key: 'z3', text: 'But every pair is a chance, and 23 guests make *253 pairs*.' },
  { key: 'z4', text: 'That’s enough for a better-than-even chance: *50.7%*.', say: 'That’s enough for a better-than-even chance: 50.7 percent.' },
  { key: 'z5', gap: 0.8, text: 'So next time you’re in a room of 23 people or more, ask around.' },
  { key: 'z6', text: 'More often than not, two of you will share a birthday.' },
];
export const HOLD = { o5: 0.6, a3: 1.0, a5: 1.2, b5: 1.0, b7: 0.6, c5: 0.6, c11: 0.6, c12: 0.8, d1: 0.4, d4: 1.4, d9: 0.4, y6: 0.8, h11: 0.6, h12: 0.6, z6: 9 };
