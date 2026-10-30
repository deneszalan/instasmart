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
import { allocate, LISTS } from '../src/labs/politics/israel-electoral-threshold';
import { LAYERS as PARTY_LAYERS, membersPerSeat } from '../src/labs/politics/china-party-pyramid';
import { OTHERS, ROUND1, ROUND2, runoff, tieShare } from '../src/labs/politics/brazil-runoff-comeback';
import { OCT_16, OCT_2016, verdict } from '../src/labs/politics/un-secretary-general-straw-polls';
import { rights, type People, type Place } from '../src/labs/politics/bosnia-three-presidents';
import { doublingCut, PEAK, PREWAR, price } from '../src/labs/politics/strait-of-hormuz-oil';
import { CHOSEN_BY, inOslo, PRIZES, score } from '../src/labs/politics/nobel-peace-prize-norway';
import { autonav, shortest, straight, GOAL } from '../src/labs/space/perseverance-driving-record';
import { heliumAt, heliumShare, MEASURED, MEASURED_ERR, neutronsPerProton } from '../src/labs/space/primordial-helium-big-bang';
import { outbreak, perCase, possibleTree, GENERATIONS } from '../src/labs/body/ebola-21-day-quarantine';
import { CHLORINE, DU_LINE, lowestOzone } from '../src/labs/earth/ozone-hole-2026';
import { EAST_2026, pacific } from '../src/labs/earth/el-nino-record-seas';
import { angleGap, fitAt, hitsOf, newEvent, SENSORS, THETA } from '../src/labs/physics/icecube-neutrino-nobel';
import { simulate as optoRun } from '../src/labs/body/optogenetics-nobel';
import { round as chiralRound, rounds as chiralRounds } from '../src/labs/chemistry/mirror-molecules-nobel';
import { spendingToday } from '../src/labs/economics/nobel-hall-woodford';
import { lineLoss } from '../src/labs/engineering/power-grid-transformers';
import { flyby as juiceFlyby, turnAngle as juiceTurn, VINF as JUICE_VINF } from '../src/labs/space/juice-earth-gravity-assist';
import { heightAfter as swiftHeight, periodAt as swiftPeriod, speedAt as swiftSpeed } from '../src/labs/space/swift-solar-drag-reentry';
import { holds as positronHolds, REAL_RATIO as POSITRON_RATIO, simulate as positronRun } from '../src/labs/physics/one-positron-quantum-cyclotron';
import { outcome as uranOutcome } from '../src/labs/chemistry/uranocenium-sandwich';
import { duels as condorcetDuels, isCycle as condorcetCycle, winner as condorcetWinner } from '../src/labs/math/condorcet-cycle-klein-bottle';
import { energyRatio, magnitude, moment as quakeMoment, PANAMA_MOMENT, shown as shownMag } from '../src/labs/earth/panama-quake-magnitude-scale';
import { indexChange, meanChange, totalChange } from '../src/labs/biology/living-planet-index-average';
import { paired as asoPaired, RNA as HBV_RNA, TARGET_AT as ASO_AT } from '../src/labs/body/bepirovirsen-antisense-hepatitis-b';
import { bandBalance, glacier, ICE_FACTOR } from '../src/labs/earth/swiss-glaciers-snowline-2026';
import { inside as coneInside, misses as coneMisses, MISSES as CONE_N, NHC_RADIUS_KM } from '../src/labs/psychology/hurricane-cone-not-storm-size';
import { bruteForce, G as curveG, multiply as curveMultiply, ORDER as curveOrder, samePoint, searchSeconds, UNIVERSE_SECONDS } from '../src/labs/tech/certificate-key-number-four';
import { clockCount, measured as leapMeasured } from '../src/labs/tech/leap-seconds-abolished';
import { NUCLIDES, remaining as nuclideLeft, yearsAt as repositoryYears, yearsUntil } from '../src/labs/engineering/onkalo-nuclear-waste-licence';
import { agreeing as sapphicAgreeing, fits as sapphicFits, SAPPHIC, SYLLABLES as SAPPHO_SYLLABLES } from '../src/labs/language/anne-carson-sappho-brackets';
import { AVERAGE as AVERAGE_BASKET, inflationFor } from '../src/labs/economics/us-inflation-basket-weights';
import { MPS as SWE_MPS, OCT_15 as SWE_OCT_15, REJECT_AT as SWE_REJECT, tally as sweTally } from '../src/labs/politics/sweden-negative-parliamentarism';
import { ridings as qcRidings, seatsWon as qcSeats } from '../src/labs/politics/quebec-first-past-the-post';
import { canJoin, canSuspend, ELECT_AT as HRC_ELECT, UN_MEMBERS } from '../src/labs/politics/un-human-rights-council-election';
import { banned as infBanned, kmAt, rangeClass } from '../src/labs/history/reykjavik-summit-inf-treaty';
import { convicts, ordinaryDecision } from '../src/labs/history/nuremberg-judgment-three-votes';
import { AVERAGE as JULIAN_AVERAGE, chartEnd as calendarEnd, drift as calendarDrift, MAX_DAYS as CALENDAR_MAX_DAYS, yearsPerDay } from '../src/labs/history/caesar-445-day-year';
import { busiestQueue, minutesToEmpty, openArches, PUBLIC_ARCHES } from '../src/labs/engineering/colosseum-numbered-arches';
import { GATE_Y as CIRCUS_GATES, runs as circusRuns, unfairness as circusUnfairness } from '../src/labs/math/circus-maximus-staggered-gates';
import { plinysCase, verdict as curiaVerdict } from '../src/labs/politics/curia-vote-by-walking';
import { interval as vestalInterval, stages as vestalStages } from '../src/labs/history/vestals-thirty-years';
import { forum as forumState, FLOOR as FORUM_FLOOR, YEARLY_FLOOD } from '../src/labs/engineering/mouth-of-truth-drain';
import { coverage as goldCoverage, flashing as goldFlashing, GOAL as GOLD_GOAL, reflectedAngle as goldReflected, tiltsFor as goldTilts } from '../src/labs/art/trastevere-gold-tesserae';
import { buried as scBuried, site as scSite, STEPS as SC_STEPS } from '../src/labs/earth/san-clemente-three-levels';
import { farWidth as cpFar, viewAngle as cpView, widerThanRectangle as cpWider } from '../src/labs/art/campidoglio-trapezoid';
import { angularSize as akAngle, distanceFor as akDistance, DOME as AK_DOME, KEYHOLE_DISTANCE as AK_DIST, MOON as AK_MOON } from '../src/labs/art/aventine-keyhole-view';
import { carbonLeft as wfLeft, ETRUSCAN_YEAR as WF_ETRUSCAN, radiocarbonAge as wfAge, roughYear as wfYear, WOLF_BP as WF_BP } from '../src/labs/history/capitoline-wolf-dating';
import { canLay, PATCHES as GIORNATE_PATCHES, relief, seams as giornateSeams, under as lapsOver } from '../src/labs/art/sistine-ceiling-giornate';
import { DIAGONALS as ATHENS_DIAGONALS, DIST as ATHENS_DIST, EDGES as ATHENS_EDGES, EYE as ATHENS_EYE, offLine, project as athensProject } from '../src/labs/math/school-of-athens-vanishing-point';
import { bestLine, fits as thrustFits, PIECES as DOME_PIECES, SLICE_WEIGHT, THICK, thrustLine } from '../src/labs/engineering/st-peters-dome-chains';
import { apennineSide, REGIONS as MAP_REGIONS } from '../src/labs/earth/gallery-of-maps-danti';
import { LAYERS as CASTLE_LAYERS, newest as newestLayer } from '../src/labs/history/castel-sant-angelo-tomb-fortress';
import { doorwayLit, litStretch, noonAltitude, placeOf, R as PANTHEON_R } from '../src/labs/engineering/pantheon-noon-sunbeam';
import { MAX_ROWS as NAVONA_MAX_ROWS, nearEstimate as navonaNear, rowLength as navonaRow, seats as navonaSeats, STANDS as NAVONA_STANDS } from '../src/labs/history/navona-domitian-stadium';
import { jetHeight as virgoJet, jetTop as virgoTop, nozzleSpeed as virgoSpeed } from '../src/labs/engineering/aqua-virgo-low-fountains';
import { contrast as studioContrast, TENEBRIST } from '../src/labs/art/caravaggio-calling-light';
import { litresPerYear as testaccioPerYear, totalLitres as testaccioLitres } from '../src/labs/economics/monte-testaccio-amphorae';
import { foundingYear as palatineFounding, nearest as palatineNearest, reignFor as palatineReign, VARRO_BC as PALATINE_VARRO } from '../src/labs/history/palatine-huts-romulus';
import { MAJORITY as CENTURIATE_MAJORITY, RICH as CENTURIATE_RICH, runVote as centuriateVote, shareOut as centuriateShare, TOTAL as CENTURIATE_TOTAL } from '../src/labs/politics/two-consuls-one-year';
import { latest as caesarLatest, posOf as caesarPos, yearOf as caesarYear, yearsAfter as caesarAfter, yearsAt as caesarYearsAt } from '../src/labs/history/caesar-ides-pompey-curia';
import { astro as augAstro, inscription as augInscription, matchesObelisk as augObelisk, roman as augRoman, STEPS as AUG_STEPS, tauAt as augTau, titlesAt as augTitles } from '../src/labs/history/augustus-offices-counted';
import { backFor as trajanBack, COLUMN as TRAJAN_COLUMN, earthPerMetre as trajanEarth, faceHeight as trajanFace } from '../src/labs/engineering/trajans-column-hill';
import { carvedBy as archCarvedBy, DEDICATED as ARCH_DEDICATED, REUSED_TOTAL as ARCH_REUSED } from '../src/labs/history/arch-of-constantine-spolia';
import { density as sackDensity, estimateAt as sackAt, TENTH as SACK_TENTH } from '../src/labs/history/rome-after-the-sacks';
import { contrast as titusContrast, ochreReflects as titusOchre, spotReflects as titusSpot, STANDS_OUT as TITUS_STANDS } from '../src/labs/art/arch-of-titus-menorah';
import { move as obeliskMove, NEED as OBELISK_NEED, ROPES as OBELISK_ROPES, slacks as obeliskSlacks, start as obeliskStart, TARGET as OBELISK_TARGET } from '../src/labs/engineering/vatican-obelisk-1586';
import { classify as vaticanClassify, insideBorder as vaticanInside, PLACES as VATICAN_PLACES } from '../src/labs/politics/vatican-city-1929';
import { BEST as PIETA_BEST, fit as pietaFit, MARY_HEAD_X } from '../src/labs/art/pieta-michelangelo';
import { floorPerPerson as ghettoFloor, groundPerPerson as ghettoGround, PEOPLE as GHETTO_PEOPLE, perHectare as ghettoPerHa, ROME_PER_HA, TARGET as GHETTO_TARGET } from '../src/labs/history/rome-ghetto-1555';
import { fits as smmFits, LIBERIUS as SMM_LIBERIUS, windows as smmWindows, yearsLeft as smmYears } from '../src/labs/art/santa-maria-maggiore-sixtus-arch';
import { flowShare as nasoniFlow, GOAL as NASONI_GOAL, HOLES as NASONI_HOLES, spoutPressure as nasoniPressure } from '../src/labs/engineering/nasoni-finger-fountain';
import { DOCS as CARB_DOCS, firstName as carbFirstName, firstWith as carbFirstWith, known as carbKnown } from '../src/labs/history/carbonara-paper-trail';
import { IN_2025 as CO2_IN, OUT_2025 as CO2_OUT, STEADY_AT as CO2_STEADY, yearlyChange as co2Change } from '../src/labs/earth/co2-half-stays-in-air';
import { GOAL_RINGS as TBM_GOAL, mine as tbmMine, place as tbmPlace, SEGMENTS as TBM_SEGMENTS, START as TBM_START, type Tbm } from '../src/labs/engineering/hudson-tunnel-boring-machine';
import { dayToTime as kskDay, LAST_SAFE_DAY as KSK_LAST, trustsNewKeyAt as kskTrusts, works as kskWorks } from '../src/labs/tech/dnssec-root-key-rollover';
import { azimuth as swAzimuth, compassError as swError, GOAL as SW_GOAL, kmPerDegree as swKmPerDeg, shiftMinutes as swShift } from '../src/labs/biology/shearwater-jet-lag-sun-compass';
import { beadSpeedChange as gasDv, kick as gasKick, MASS_U as GAS_MASS, meanSpeed as gasMean, speedFor as gasSpeedFor, THRESHOLD as GAS_THRESHOLD } from '../src/labs/physics/levitated-nanoparticle-gas-kicks';
import { ageFromSlope as rbAge, decayedShare as rbDecayed, grainAt as rbGrain, GRAINS as RB_GRAINS, slope as rbSlope, TARGET_AGE as RB_TARGET } from '../src/labs/space/mars-meteorite-rubidium-clock';
import { BALLOTS as LV_BALLOTS, elected as lvElected, NO_MARKS as LV_NO_MARKS, ranking as lvRanking, votes as lvVotes } from '../src/labs/politics/latvia-open-list-votes';
import { fits as hitFits, LINE as HIT_LINE, OFFER as HIT_OFFER, reading as hitReading, WORDS as HIT_WORDS } from '../src/labs/language/hittite-bread-and-water';
import { BEATS as CLAP_BEATS, NO_SILENCE as CLAP_NO_SILENCE, overlap as clapOverlap, PATTERN as CLAP_PATTERN, shifted as clapShifted } from '../src/labs/music/clapping-music-phase-shift';
import { enlarge as solEnlarge, FULL as SOL_FULL, STAGES as SOL_STAGES } from '../src/labs/art/statue-of-liberty-enlarged-by-four';
import { aligned as laoAligned, armEnds as laoArmEnds, FIT as LAO_FIT, HEAD as LAO_HEAD, holesOff as laoHolesOff, SHOULDER as LAO_SHOULDER } from '../src/labs/art/laocoon-lost-arm';
import { COL_DISC, COL_ROWS, COL_SETS, colonnadeColumns, placeEye, sightFrom } from '../src/labs/math/st-peters-colonnade-foci';
import { STAIR_HEADROOM, gentlestTurns, stairDesign } from '../src/labs/engineering/vatican-double-helix-stairs';
import { blockers as concBlockers, BLOCS as CONC_BLOCS, ELECTORS as CONC_N, need as concNeed, votes as concVotes, wins as concWins } from '../src/labs/politics/conclave-two-thirds';
import { DIED as SG_DIED, GUARDS as SG_GUARDS, hit as sgHit, km as sgKm, lengthKm as sgLength, PASSETTO as SG_PASSETTO, PLACES as SG_PLACES, ROUTE as SG_ROUTE, SURVIVED as SG_SURVIVED } from '../src/labs/history/swiss-guard-sack-of-rome';
import { DAWNS as SN_DAWNS, dawnDate as snDate, fits as snFits, skyAt as snSky } from '../src/labs/art/starry-night-dawn-sky-date';
import { finalAverage as baAverage, MEASURED as BA_MEASURED, SEEDS as BA_SEEDS, simulate as baSimulate, TIPPED as BA_TIPPED } from '../src/labs/psychology/bad-apple-rule-breaking';

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

  it('threshold: at 3.25% the bloc with fewer votes wins 63 seats; at 2.5% it loses its majority; at 2% the other bloc has 61', () => {
    expect(LISTS.reduce((n, l) => n + l.share, 0)).toBeCloseTo(100, 6);
    for (const th of [1, 2, 3.25, 5]) expect(allocate(th).blue + allocate(th).gold).toBe(120);
    expect(allocate(3.25)).toMatchObject({ blue: 63, gold: 57 });
    expect(allocate(3.25).wasted).toBeCloseTo(8, 6);
    expect(allocate(2.5).blue).toBeLessThan(61);
    expect(allocate(2).gold).toBeGreaterThanOrEqual(61);
  });

  it('party pyramid: six layers; about 14 million members per Standing Committee seat', () => {
    expect(PARTY_LAYERS.map((l) => l.people)).toEqual([96_000_000, 2296, 205, 24, 7, 1]);
    expect(membersPerSeat(4) / 1e6).toBeCloseTo(13.7, 1);
    expect(membersPerSeat(5)).toBe(96_000_000);
  });

  it('brazil runoff: an even split keeps Flávio ahead; Lula needs 61.9% of the 9.3 million; the real gains reproduce the result', () => {
    expect(OTHERS).toBe(9316747);
    expect(runoff(0.5).flavio).toBeGreaterThan(runoff(0.5).lula);
    expect(tieShare()).toBeCloseTo(0.6194, 4);
    expect(runoff(0.62).lula).toBeGreaterThan(runoff(0.62).flavio);
    const extra = ROUND2.lula + ROUND2.flavio - ROUND1.valid;
    expect(extra).toBe(4781485);
    const real = runoff((ROUND2.lula - ROUND1.lula) / (OTHERS + extra), extra);
    expect(real.lula).toBeCloseTo(ROUND2.lula, 0);
    expect(real.flavio).toBeCloseTo(ROUND2.flavio, 0);
    expect(real.lulaShare * 100).toBeCloseTo(51.79, 2);
  });

  it('straw polls: Grynspan had 9 encourages but 2 red discourages on 16 October; flipping those two passes; Guterres 2016 passed', () => {
    expect(OCT_16).toHaveLength(15);
    expect(verdict(OCT_16)).toEqual({ encourage: 9, redDiscourage: 2, passes: false });
    expect(OCT_16.filter((v) => v === 'D')).toHaveLength(5);
    const whiteOnly = OCT_16.map((v, i) => (i >= 5 ? 'E' : v));
    expect(verdict(whiteOnly).passes).toBe(false);
    const flipped = OCT_16.map((v, i) => (i < 5 && v === 'D' ? 'N' : v));
    expect(verdict(flipped).passes).toBe(true);
    expect(verdict(OCT_2016)).toEqual({ encourage: 13, redDiscourage: 0, passes: true });
  });

  it('bosnia: Federation voters pick the Bosniak or Croat ballot, Srpska voters the Serb one; only 3 of 8 citizens may stand', () => {
    expect(rights('serb', 'federation')).toEqual({ vote: ['bosniak', 'croat'], run: null });
    expect(rights('bosniak', 'srpska')).toEqual({ vote: ['serb'], run: null });
    expect(rights('croat', 'federation').run).toBe('croat');
    expect(rights('serb', 'srpska').run).toBe('serb');
    const people: People[] = ['bosniak', 'croat', 'serb', 'other'], places: Place[] = ['federation', 'srpska'];
    expect(people.flatMap((p) => places.map((w) => rights(p, w).run)).filter(Boolean)).toHaveLength(3);
    expect(places.map((w) => rights('other', w).run)).toEqual([null, null]);
  });

  it('hormuz: at elasticity 0.05, 1% less oil means +22%, the price doubles at a 3.4% shortfall, and about 3.3% reaches the April high', () => {
    expect(price(0, 0.05)).toBeCloseTo(PREWAR, 9);
    expect(price(0.01, 0.05) / PREWAR).toBeCloseTo(1.2226, 3);
    expect(doublingCut(0.05)).toBeCloseTo(0.0341, 4);
    expect(price(doublingCut(0.05), 0.05)).toBeCloseTo(2 * PREWAR, 6);
    expect(price(0.032, 0.05)).toBeLessThan(PEAK);
    expect(price(0.033, 0.05)).toBeGreaterThan(PEAK);
    expect(price(0.033, 0.3) / PREWAR).toBeCloseTo(1.118, 2);
  });

  it('nobel: five prizes are chosen in Stockholm, three by the Academy of Sciences; only peace in Oslo', () => {
    expect(PRIZES.filter((p) => inOslo(CHOSEN_BY[p]))).toEqual(['peace']);
    expect(PRIZES.filter((p) => CHOSEN_BY[p] === 'academy')).toEqual(['physics', 'chemistry', 'economics']);
    expect(score(CHOSEN_BY)).toBe(6);
    expect(score({ peace: 'swedish', literature: 'swedish' })).toBe(1);
  });

  it('perseverance: looking 10 m ahead it drives into a dead end; 70 m gives nearly the shortest route; a straight line hits a rock', () => {
    const best = shortest();
    expect(best).toBeGreaterThan(200);
    expect(autonav(10).reached).toBe(true);
    expect(autonav(10).metres).toBeGreaterThan(best * 1.3);
    expect(autonav(60).metres).toBeGreaterThan(best * 1.05);
    expect(autonav(70).metres).toBeLessThanOrEqual(best * 1.05);
    expect(autonav(80).metres).toBeCloseTo(best, 6);
    for (const v of [10, 20, 30, 40, 50, 60, 70, 80]) expect(autonav(v).path.at(-1)).toEqual(GOAL);
    expect(straight().reached).toBe(false);
  });

  it('helium: n/p 1/7 gives 25%; decay alone from 1/6 at one second reaches the measured 24.6% after about 2.2 minutes', () => {
    expect(heliumShare(1 / 7)).toBeCloseTo(0.25, 10);
    expect(neutronsPerProton(1)).toBeCloseTo(1 / 6, 10);
    expect(Math.abs(heliumAt(132) - MEASURED)).toBeLessThanOrEqual(MEASURED_ERR);
    expect(Math.abs(heliumAt(126) - MEASURED)).toBeGreaterThan(MEASURED_ERR);
    expect(heliumAt(600)).toBeCloseTo(0.145, 3);
    expect(heliumAt(20 * 60)).toBeLessThan(heliumAt(10 * 60));
  });

  it('ebola tracing: with 2 infections per missed case, chains shrink once more than half of contacts are found', () => {
    expect(perCase(2, 0.5)).toBe(1);
    expect(perCase(2, 0.55)).toBeLessThan(1);
    expect(perCase(3, 0.65)).toBeGreaterThan(1);
    const tree = possibleTree(2);
    const none = outbreak(tree, 0), most = outbreak(tree, 0.9), all = outbreak(tree, 1);
    expect(none.perGen[GENERATIONS]).toBeGreaterThan(8);
    expect(most.perGen[GENERATIONS]).toBeLessThan(none.perGen[GENERATIONS]);
    expect(all.perGen.slice(2).every((n) => n === 0)).toBe(true);
    expect(all.perGen[1]).toBe(none.perGen[1]);
  });

  it('ozone toy model: a hole needs cold, sunlight and chlorine together; peak chlorine gives about 120 DU', () => {
    expect(lowestOzone(-92, CHLORINE[2000], true)).toBeCloseTo(120, 6);
    expect(lowestOzone(-92, CHLORINE[2024], true)).toBeLessThan(DU_LINE);
    expect(lowestOzone(-92, CHLORINE[2024], false)).toBe(350);
    expect(lowestOzone(-92, CHLORINE[1980], true)).toBe(350);
    expect(lowestOzone(-75, CHLORINE[2024], true)).toBe(350);
    expect(lowestOzone(-80, CHLORINE[2024], true)).toBeGreaterThan(DU_LINE);
  });

  it('el niño toy model: normal winds give NOAA’s half-metre slope and 8 °C contrast; half-strength winds warm the east by 4 °C', () => {
    expect(pacific(1)).toMatchObject({ slope: 0.5, contrast: 8, eastAnomaly: 0 });
    expect(pacific(0.5).eastAnomaly).toBeGreaterThanOrEqual(EAST_2026);
    expect(pacific(0.55).eastAnomaly).toBeLessThan(EAST_2026);
    expect(pacific(0).rainAt).toBeGreaterThan(pacific(1).rainAt);
    expect(pacific(1.5).eastAnomaly).toBeLessThan(0);
  });

  it('icecube: 540 sensors in the slice, a 40° Cherenkov angle, and hit times that match only the true direction', () => {
    expect(SENSORS).toHaveLength(9 * 60);
    expect((THETA * 180) / Math.PI).toBeCloseTo(40.2, 1);
    for (const seed of [2026, 2027, 2028]) {
      const tr = newEvent(seed), hits = hitsOf(tr);
      expect(tr.angle).toBeGreaterThan(0);
      expect(tr.angle).toBeLessThan(180);
      expect(fitAt(hits, tr.angle).rms).toBeLessThan(6);
      expect(fitAt(hits, tr.angle + 4).rms).toBeGreaterThan(40);
      expect(fitAt(hits, tr.angle - 4).rms).toBeGreaterThan(40);
      expect(fitAt(hits, tr.angle + 180).rms).toBeGreaterThan(1000);
    }
    expect(angleGap(359, 2)).toBe(3);
  });

  it('optogenetics: 1 ms flashes are too short, 5 ms flashes fire once each, 20 ms fire repeatedly, and no gene means no signal', () => {
    expect(optoRun(true, 1, 10).spikes).toHaveLength(0);
    expect(optoRun(true, 5, 10).spikes).toHaveLength(10);
    expect(optoRun(true, 5, 40).spikes).toHaveLength(40);
    expect(optoRun(true, 20, 10).spikes.length).toBeGreaterThan(10);
    expect(optoRun(false, 5, 10).spikes).toHaveLength(0);
    expect(optoRun(false, 5, 10).flashes).toBe(10);
  });

  it('mirror molecules: 75% right acts like 90%; from 50.5% one hand passes 99% in 8 rounds; with working mixed pairs nothing changes', () => {
    expect(chiralRound(0.75, false)).toBeCloseTo(0.9, 9);
    expect(chiralRound(0.5, false)).toBe(0.5);
    const r = chiralRounds(0.505, 8, false);
    expect(r[7]).toBeLessThan(0.99);
    expect(r[8]).toBeGreaterThan(0.99);
    for (const s of chiralRounds(0.505, 12, true)) expect(s).toBeCloseTo(0.505, 9);
  });

  it('forward guidance: a one-quarter cut of a point adds 0.25%, a believed two-year promise adds 2%, half belief half that', () => {
    expect(spendingToday(3, 3, 1)).toBeCloseTo(0, 9);
    expect(spendingToday(2, 3, 1)).toBeCloseTo(0.25, 9);
    expect(spendingToday(3, 2, 1)).toBeCloseTo(2, 9);
    expect(spendingToday(3, 2, 0.5)).toBeCloseTo(1, 9);
    expect(spendingToday(3, 2, 0)).toBeCloseTo(0, 9);
    expect(spendingToday(4, 4, 1)).toBeCloseTo(-2.25, 9);
  });

  it('power grid: 10 MW at 10 kV loses half; ten times the voltage loses a hundredth as much; under 1% from about 71 kV', () => {
    expect(lineLoss(10).amps).toBeCloseTo(1000, 9);
    expect(lineLoss(10).share).toBeCloseTo(0.5, 9);
    expect(lineLoss(100).share).toBeCloseTo(0.005, 9);
    expect(lineLoss(10).lossMW / lineLoss(100).lossMW).toBeCloseTo(100, 9);
    expect(lineLoss(70).share).toBeGreaterThan(0.01);
    expect(lineLoss(75).share).toBeLessThan(0.01);
  });

  it('gravity assist: Juice’s 8,640 km flyby turns it by 20°; passing behind Earth adds 3.5 km/s, in front it brakes, closer turns more', () => {
    expect(JUICE_VINF).toBeCloseTo(11.24, 1);
    expect(juiceTurn(8640, JUICE_VINF)).toBeCloseTo(20, 6);
    expect(juiceFlyby(8640, 'behind').gain).toBeCloseTo(3.5, 2);
    expect(juiceFlyby(8640, 'front').gain).toBeLessThan(0);
    expect(juiceFlyby(300, 'behind').turn).toBeGreaterThan(juiceFlyby(8640, 'behind').turn);
    expect(juiceFlyby(300, 'behind').gain).toBeGreaterThan(5);
    expect(juiceFlyby(40000, 'behind').gain).toBeLessThan(2);
    expect(Math.abs(juiceFlyby(8100, 'behind').gain - 3.5)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(juiceFlyby(9300, 'behind').gain - 3.5)).toBeGreaterThan(0.1);
  });

  it('satellite drag: about 183 m/s of braking takes a 600 km orbit down to 275 km and leaves it 183 m/s faster', () => {
    expect(swiftSpeed(600)).toBeCloseTo(7.562, 3);
    expect(swiftPeriod(600)).toBeCloseTo(96.5, 1);
    expect(swiftHeight(0)).toBeCloseTo(600, 6);
    expect(swiftHeight(182)).toBeGreaterThan(275);
    expect(swiftHeight(183)).toBeLessThan(275);
    expect((swiftSpeed(swiftHeight(150)) - swiftSpeed(600)) * 1000).toBeCloseTo(150, 6);
  });

  it('Penning trap: with no voltage the positron slides out, too much voltage beats the magnet, and it holds only if ωc² > 2ωz²', () => {
    expect(positronRun(4, 0).fate).toBe('cap');
    expect(positronRun(4, 2).fate).toBe('trapped');
    expect(positronRun(3, 6).fate).toBe('ring');
    expect(positronRun(0, 2).fate).toBe('ring');
    expect(positronHolds(4, 2)).toBe(true);
    expect(positronHolds(3, 6)).toBe(false);
    for (let wc = 0; wc <= 8; wc += 1) for (let v = 0; v <= 8; v += 1) if (positronRun(wc, v).fate === 'trapped') expect(positronHolds(wc, v)).toBe(true);
    expect(POSITRON_RATIO).toBeCloseTo(757.3, 1);
  });

  it('uranocenium: only a borate salt in a calm solvent keeps it; fluoride salts, silver and THF each destroy it', () => {
    expect(uranOutcome('trityl', 'borate', 'difluorobenzene')).toBe('stable');
    expect(uranOutcome('ferrocenium', 'borate', 'bromobenzene')).toBe('stable');
    expect(uranOutcome('trityl', 'pf6', 'difluorobenzene')).toBe('fluoride');
    expect(uranOutcome('trityl', 'sbf6', 'bromobenzene')).toBe('sbf6');
    expect(uranOutcome('trityl', 'borate', 'thf')).toBe('solvent');
    expect(uranOutcome('silver', 'borate', 'difluorobenzene')).toBe('rings');
    expect(uranOutcome('silver', 'pf6', 'thf')).toBe('rings');
  });

  it('Condorcet: majorities run in a circle exactly when no group outnumbers the other two; otherwise the biggest group’s favourite wins', () => {
    expect(condorcetDuels(1, 1, 1)).toEqual({ aliceBob: [2, 1], bobCarol: [2, 1], carolAlice: [2, 1] });
    expect(condorcetCycle(1, 1, 1)).toBe(true);
    expect(condorcetCycle(20, 15, 10)).toBe(true);
    expect(condorcetCycle(30, 10, 10)).toBe(false);
    expect(condorcetWinner(30, 10, 10)).toBe('Alice');
    expect(condorcetWinner(5, 30, 10)).toBe('Bob');
    expect(condorcetCycle(20, 10, 10)).toBe(false);
    expect(condorcetWinner(20, 10, 10)).toBe(null);
  });

  it('quake magnitude: the USGS moment gives 7.7; 32 times the moment adds about one step; 100 km × 20 km × 6.4 m makes a 7.7', () => {
    expect(shownMag(magnitude(PANAMA_MOMENT))).toBe(7.7);
    expect(magnitude(quakeMoment(40, 20, 4)) - magnitude(quakeMoment(10, 5, 2))).toBeCloseTo(1.0, 1);
    expect(energyRatio(8, 7.7)).toBeCloseTo(2.82, 2);
    expect(energyRatio(7.7, 6.6)).toBeCloseTo(44.7, 1);
    expect(shownMag(magnitude(quakeMoment(100, 20, 6.4)))).toBe(7.7);
    expect(shownMag(magnitude(quakeMoment(20, 10, 1)))).toBeLessThan(7);
  });

  it('living planet index: the report’s example averages −18% but loses 2% of animals; a doubling and a halving cancel', () => {
    expect(meanChange([5, -60, 0])).toBeCloseTo(-18.33, 1);
    expect(totalChange([5, -60, 0])).toBeCloseTo((-10 / 483) * 100, 6);
    expect(indexChange([100, -50, 0])).toBeCloseTo(0, 9);
    expect(indexChange([5, -60, 0])).toBeCloseTo(-25.1, 1);
    expect(indexChange([20, -90, -90])).toBeLessThan(-50);
    expect(totalChange([20, -90, -90])).toBeGreaterThan(0);
  });

  it('antisense: bepirovirsen pairs all 20 letters only at its target in the 70-letter stretch, at most 11 elsewhere', () => {
    expect(HBV_RNA.length).toBe(70);
    expect(asoPaired(ASO_AT)).toBe(20);
    for (let at = 0; at <= HBV_RNA.length - 20; at++) if (at !== ASO_AT) expect(asoPaired(at)).toBeLessThanOrEqual(11);
  });

  it('glacier budget: a thin snowy winter and a high freezing level lose everywhere; more snow or a cooler summer balances it', () => {
    expect(glacier(0.75, 4400).allLose).toBe(true);
    expect(glacier(0.75, 4000).mean).toBeLessThan(-2);
    expect(glacier(1, 3100).mean).toBeGreaterThan(0);
    const even = glacier(1, 3300).even!;
    expect(even).toBeGreaterThan(2700);
    expect(even).toBeLessThan(2900);
    // once the snow is gone, the ice melts faster
    expect(bandBalance(2000, 0, 3000)).toBeCloseTo(-ICE_FACTOR * 0.0028 * 1000, 9);
  });

  it('hurricane cone: each NHC 2026 circle holds exactly two-thirds of the simulated misses', () => {
    expect(NHC_RADIUS_KM[24]).toBeCloseTo(72.2, 1);
    expect(NHC_RADIUS_KM[120]).toBeCloseTo(370.4, 1);
    for (const h of [24, 72, 120]) {
      const pts = coneMisses(h);
      expect(pts.length).toBe(CONE_N);
      expect(coneInside(pts, NHC_RADIUS_KM[h])).toBe((2 * CONE_N) / 3);
      expect(coneInside(pts, NHC_RADIUS_KM[h] / 2)).toBeLessThan(CONE_N / 2);
    }
  });
  it('certificate keys: the toy curve has 257 points, k·G repeats only after 257, brute force finds key 4 in 4 tries, and 99 bits outlast the universe', () => {
    expect(curveOrder).toBe(257);
    expect(curveMultiply(curveOrder)).toBeNull();
    expect(samePoint(curveMultiply(1), curveG)).toBe(true);
    const seen = new Set<string>();
    for (let k = 1; k < curveOrder; k++) seen.add(String(curveMultiply(k)));
    expect(seen.size).toBe(256);
    for (const key of [4, 56, 66, 115, 155, 156, 230, 237]) expect(bruteForce(curveMultiply(key))).toBe(key);
    expect(searchSeconds(8)).toBeLessThan(1e-9);
    expect(searchSeconds(98)).toBeLessThan(UNIVERSE_SECONDS);
    expect(searchSeconds(99)).toBeGreaterThan(UNIVERSE_SECONDS);
    expect(Math.floor(Math.log10(searchSeconds(384) / (365.25 * 86400))) + 1).toBe(97);
  });

  it('leap seconds: a clock that repeats 23:59:59 steps back, so a half-second timer across it reads −0.5 s; a smear or no leap second never goes negative', () => {
    expect(clockCount('repeat', 1.99)).toBeCloseTo(86399.99, 9);
    expect(clockCount('repeat', 2)).toBeCloseTo(86399, 9);
    expect(clockCount('repeat', 3)).toBeCloseTo(86400, 9);
    expect(leapMeasured('repeat', 1.8, 0.5)).toBeCloseTo(-0.5, 9);
    expect(leapMeasured('repeat', 0.5, 1)).toBeCloseTo(1, 9);
    expect(leapMeasured('repeat', 1.5, 2)).toBeCloseTo(1, 9);
    expect(leapMeasured('none', 1.8, 0.5)).toBeCloseTo(0.5, 9);
    expect(leapMeasured('smear', 1.8, 0.5)).toBeCloseTo((0.5 * 86400) / 86401, 9);
    for (let s = 0; s <= 3; s += 0.1) for (let l = 0.1; l <= 1.5; l += 0.1) {
      expect(leapMeasured('smear', s, l)).toBeGreaterThan(0);
      expect(leapMeasured('none', s, l)).toBeGreaterThan(0);
    }
  });

  it('spent fuel: caesium-137 falls below a thousandth after about 300 years (ten half-lives), while 99% of plutonium-239 is still there', () => {
    const cs = NUCLIDES.find((n) => n.id === 'cs137')!, pu = NUCLIDES.find((n) => n.id === 'pu239')!;
    expect(nuclideLeft(cs.half, cs.half)).toBeCloseTo(0.5, 9);
    expect(yearsUntil(cs.half, 1 / 1000)).toBeCloseTo(299.4, 1);
    expect(nuclideLeft(cs.half, 300)).toBeLessThan(1 / 1000);
    expect(nuclideLeft(pu.half, 300)).toBeGreaterThan(0.99);
    expect(repositoryYears(0)).toBeCloseTo(1, 9);
    expect(repositoryYears(100)).toBeCloseTo(1e6, 3);
    expect(nuclideLeft(cs.half, repositoryYears(41))).toBeGreaterThan(1 / 1000);
    expect(nuclideLeft(cs.half, repositoryYears(42))).toBeLessThan(1 / 1000);
  });

  it('Sapphic line: fragment 31 line 1 scans – u – – – u u – u – –; the 4th and last places may be either', () => {
    expect(SAPPHO_SYLLABLES).toHaveLength(11);
    expect(SAPPHIC).toHaveLength(11);
    const L = 'long' as const, S = 'short' as const;
    const line = [L, S, L, L, L, S, S, L, S, L, L];
    expect(sapphicFits(line)).toBe(true);
    expect(sapphicFits([L, S, L, S, L, S, S, L, S, L, S])).toBe(true);
    expect(sapphicFits(line.map(() => S))).toBe(false);
    expect(sapphicAgreeing(line.map(() => S))).toBe(6);
    expect(sapphicFits([S, ...line.slice(1)])).toBe(false);
  });

  it('inflation basket: the average basket gives 3.7%, energy adds about 1.3 points, and from about 13.6% spent on energy inflation reaches 5%', () => {
    expect(AVERAGE_BASKET.energy).toBeCloseTo(6.39, 1);
    expect(AVERAGE_BASKET.food).toBeCloseTo(13.67, 1);
    const avg = inflationFor(AVERAGE_BASKET.energy, AVERAGE_BASKET.food);
    expect(avg.total).toBeCloseTo(3.7, 1);
    expect(avg.energy).toBeCloseTo(1.3, 1);
    expect(inflationFor(15, AVERAGE_BASKET.food).total).toBeCloseTo(5.26, 1);
    expect(inflationFor(13.5, 13.5).total).toBeLessThan(5);
    expect(inflationFor(14, 13.5).total).toBeGreaterThan(5);
    expect(inflationFor(0, 13.5).total).toBeCloseTo(2.6 - 0.135 * 0.1, 6);
  });

  it('sweden pm vote: 349 seats and 175 no votes reject; 15 October rejected; with V, C and MP abstaining she passes on 99 yes to 173 no', () => {
    expect(SWE_MPS).toBe(349);
    expect(SWE_REJECT).toBe(175);
    const oct = sweTally(SWE_OCT_15);
    expect(oct).toEqual({ yes: 99, no: 250, abstain: 0, approved: false });
    const abst = sweTally(['yes', 'no', 'no', 'abstain', 'abstain', 'no', 'abstain', 'no']);
    expect(abst).toEqual({ yes: 99, no: 173, abstain: 77, approved: true });
    expect(abst.no).toBeGreaterThan(abst.yes);
    expect(sweTally(['yes', 'no', 'no', 'abstain', 'abstain', 'no', 'no', 'no']).approved).toBe(false);
    expect(sweTally(['no', 'yes', 'yes', 'no', 'no', 'yes', 'no', 'yes'])).toEqual({ yes: 173, no: 176, abstain: 0, approved: false });
  });

  it('first past the post: 13% spread over all ten ridings wins nothing; packed into three it wins three; into two, two; over four, none', () => {
    expect(qcSeats(10)).toBe(0);
    expect(qcSeats(3)).toBe(3);
    expect(qcSeats(2)).toBe(2);
    expect(qcSeats(4)).toBe(0);
    const total = qcRidings(3).reduce((n, r) => n + r.ours, 0);
    expect(total).toBeCloseTo(130, 9);
    for (const r of qcRidings(5)) expect(r.ours + r.a + r.b).toBeCloseTo(100, 9);
  });

  it('rights council: 97 of 193 to join; Russia 2022 suspended by 93 to 24 with 58 abstaining; Russia 2023 not elected with 83', () => {
    expect(UN_MEMBERS).toBe(193);
    expect(HRC_ELECT).toBe(97);
    expect(canJoin(97)).toBe(true);
    expect(canJoin(96)).toBe(false);
    expect(canJoin(83)).toBe(false);
    expect(canSuspend(93, 24)).toBe(true);
    expect(canJoin(93)).toBe(false);
    expect(canSuspend(120, 70)).toBe(false);
    expect(canSuspend(2, 1)).toBe(true);
    expect(canSuspend(0, 0)).toBe(false);
  });

  it('INF treaty: ground-launched 500 to 5,500 km banned; the same range from a ship or plane allowed; the slider spans 100 to 10,000 km', () => {
    expect(infBanned('ground', 500)).toBe(true);
    expect(infBanned('ground', 5500)).toBe(true);
    expect(infBanned('ground', 450)).toBe(false);
    expect(infBanned('ground', 6000)).toBe(false);
    expect(infBanned('ship', 2500)).toBe(false);
    expect(infBanned('plane', 2500)).toBe(false);
    expect(rangeClass(800)).toBe('shorter');
    expect(rangeClass(2500)).toBe('intermediate');
    expect(kmAt(0)).toBe(100);
    expect(kmAt(100)).toBe(10000);
    expect(kmAt(50)).toBe(1000);
  });

  it('Nuremberg: three of four judges convict; a 2–2 split never does, though a tie-break by the President would', () => {
    expect(convicts([true, true, true, false])).toBe(true);
    expect(convicts([true, true, false, false])).toBe(false);
    expect(convicts([true, true, true, true])).toBe(true);
    expect(ordinaryDecision([true, true, false, false])).toBe(true);
    expect(ordinaryDecision([true, false, true, false])).toBe(false);
    expect(ordinaryDecision([false, false, false, true])).toBe(false);
  });

  it('caesar calendar: every 4th year drifts a day in about 128 years; every 3rd and none drift fast; only the Gregorian rule stays within a day over 1,000 years', () => {
    expect(JULIAN_AVERAGE.four).toBe(365.25);
    expect(Math.round(yearsPerDay('four'))).toBe(128);
    expect(calendarDrift('four', 1000)).toBeCloseTo(7.8, 1);
    expect(calendarDrift('none', 100)).toBeCloseTo(-24.22, 2);
    expect(calendarDrift('three', 36)).toBeCloseTo(3.28, 2);
    expect(Math.abs(calendarDrift('gregorian', 1000))).toBeLessThan(1);
    expect(Math.abs(calendarDrift('four', 100))).toBeLessThan(1);
    // the drawn line follows the drift until it leaves the chart: no leap days runs off the bottom after about 66 years
    expect(calendarEnd('none').years).toBeCloseTo(66, 0);
    expect(calendarEnd('none').days).toBeCloseTo(-CALENDAR_MAX_DAYS, 6);
    expect(calendarEnd('three').days).toBeCloseTo(CALENDAR_MAX_DAYS, 6);
    expect(calendarEnd('four')).toEqual({ years: 2000, days: calendarDrift('four', 2000) });
  });

  it('colosseum arches: 50,000 people through 4 arches at 3 a second take over an hour; spread evenly over all 76 they take under 4 minutes', () => {
    expect(PUBLIC_ARCHES).toBe(76);
    expect(minutesToEmpty(50000, 4, 0.25, 3)).toBeCloseTo(69.4, 1);
    expect(minutesToEmpty(50000, 76, 0.25, 3)).toBeCloseTo(3.65, 2);
    expect(busiestQueue(50000, 76, 0.25)).toBeCloseTo(50000 / 76, 6);
    expect(minutesToEmpty(50000, 76, 0.5, 3)).toBeCloseTo(2 * minutesToEmpty(50000, 76, 0.25, 3), 6);
    expect(minutesToEmpty(50000, 76, 0.35, 3)).toBeGreaterThan(5);
    for (const n of [4, 8, 36, 76]) expect(openArches(n).size).toBe(n);
    expect(Math.max(...openArches(76))).toBe(75);
  });

  it('circus gates: a straight row gives the outer chariot a longer run; an arc round the break point makes all 12 equal, an arc round the track’s middle does not', () => {
    expect(CIRCUS_GATES).toHaveLength(12);
    expect(circusUnfairness(0, 'straight')).toBeGreaterThan(0.15);
    expect(circusUnfairness(1, 'straight')).toBeLessThan(1e-9);
    expect(circusUnfairness(1, 'track')).toBeGreaterThan(0.01);
    const r = circusRuns(1, 'straight');
    expect(Math.max(...r) - Math.min(...r)).toBeLessThan(1e-9);
  });

  it('curia vote: with acquittal ahead of each rival alone but not of both, three groups acquit and the death party crossing over banishes', () => {
    expect(curiaVerdict(110, 80, 60, 'three')).toBe('acquit');
    expect(curiaVerdict(110, 80, 60, 'cross')).toBe('banish');
    expect(curiaVerdict(110, 80, 60, 'together')).toBe('banish');
    expect(curiaVerdict(110, 40, 90, 'together')).toBe('death');
    expect(curiaVerdict(150, 50, 50, 'cross')).toBe('acquit');
    expect(curiaVerdict(100, 100, 50, 'three')).toBe('tie');
    expect(plinysCase(110, 80, 60)).toBe(true);
    expect(plinysCase(150, 50, 50)).toBe(false);
  });

  it('vestals: six places and 30-year terms need a new girl every 5 years, two in each decade; 57-year terms only every 9.5', () => {
    expect(vestalInterval(30)).toBe(5);
    expect(vestalInterval(57)).toBeCloseTo(9.5, 6);
    for (const y of [0, 7, 33, 61]) expect(vestalStages(30, y)).toEqual({ learning: 2, performing: 2, teaching: 2, staying: 0 });
    const s = vestalStages(60, 12);
    expect(s.learning + s.performing + s.teaching + s.staying).toBe(6);
    expect(s.staying).toBe(3);
  });

  it('mouth of truth drain: the yearly flood swamps the old 6 m floor; raised to 9 m and given a canal, it stays dry', () => {
    expect(FORUM_FLOOR).toBe(6);
    expect(YEARLY_FLOOD).toBe(9);
    expect(forumState(0, 9, true)).toBe('flooded');
    expect(forumState(3, 9, false)).toBe('marsh');
    expect(forumState(3, 9, true)).toBe('dry');
    expect(forumState(2.5, 9, true)).toBe('flooded');
    expect(forumState(0, 5, true)).toBe('dry');
  });
  it('Trastevere gold: a tile tipped by 1° turns its reflection by 2°; flat tiles flash only about 12 to 15 m from the wall; tilts up to 8° light up most of the nave', () => {
    expect(goldReflected(0)).toBe(35);
    expect(goldReflected(1)).toBe(37);
    const flat = goldTilts(0);
    expect(goldFlashing(flat, 13).length).toBeGreaterThan(0);
    expect(goldFlashing(flat, 8).length).toBe(0);
    expect(goldFlashing(flat, 20).length).toBe(0);
    expect(goldCoverage(flat)).toBeLessThan(0.15);
    expect(goldCoverage(goldTilts(8))).toBeGreaterThan(GOLD_GOAL);
    expect(goldCoverage(goldTilts(2))).toBeLessThan(GOLD_GOAL);
  });

  it('San Clemente: building on the ruins leaves three levels under today’s church, the deepest the ruins of AD 64; clearing them away leaves none', () => {
    expect(scSite(4, 'build')).toEqual(['ruins', 'roman', 'church4', 'church12']);
    expect(scBuried(4, 'build')).toBe(3);
    expect(scSite(4, 'clear')).toEqual(['church12']);
    expect(scBuried(4, 'clear')).toBe(0);
    expect(scSite(2, 'build')).toEqual(['ruins', 'roman']);
    expect(scBuried(2, 'build')).toBe(1);
    expect(SC_STEPS.map((s) => s.year)).toEqual([64, 90, 200, 392, 1100]);
  });

  it('Campidoglio: turning each side palace out by about 7.4° widens the square from 44 to 58 m, and from the ramp the far palace looks 1.32 times as wide as at the end of a rectangle', () => {
    expect(cpFar(0)).toBe(44);
    expect(cpFar(7.4)).toBeCloseTo(58, 0);
    expect(cpWider(7.4)).toBeCloseTo(1.32, 2);
    expect(cpView(44)).toBeCloseTo(39.1, 1);
    expect(cpView(58)).toBeCloseTo(50.1, 1);
    expect(cpWider(-5)).toBeLessThan(1);
  });

  it('Aventine keyhole: the 42 m dome spans 0.81° from 2,976 m, 1.55 full Moons; it would match the Moon from about 4.6 km, and twice as far it looks half as wide', () => {
    expect(akAngle(AK_DOME, AK_DIST)).toBeCloseTo(0.81, 2);
    expect(akAngle(AK_DOME, AK_DIST) / AK_MOON).toBeCloseTo(1.55, 2);
    expect(akDistance(AK_DOME, AK_MOON)).toBeCloseTo(4628, -1);
    expect(akAngle(AK_DOME, 2 * AK_DIST) / akAngle(AK_DOME, AK_DIST)).toBeCloseTo(0.5, 3);
  });

  it('Capitoline wolf: 963 radiocarbon years leave 88.7% of the carbon-14; a core from about 480 BC would hold about 74%', () => {
    expect(wfLeft(WF_BP)).toBeCloseTo(0.887, 3);
    expect(wfAge(wfLeft(WF_BP))).toBeCloseTo(963, 6);
    expect(wfLeft(1950 - WF_ETRUSCAN)).toBeCloseTo(0.739, 3);
    expect(wfYear(0.739)).toBeCloseTo(-480, -1);
    expect(wfYear(1)).toBe(1950);
  });
  it('sistine giornate: a patch can be numbered only after every older neighbour it laps over; the days in order always work; raking light shows the seams', () => {
    const byDay = GIORNATE_PATCHES.map((_, i) => i).sort((a, b) => GIORNATE_PATCHES[a].day - GIORNATE_PATCHES[b].day);
    const laid: number[] = [];
    for (const i of byDay) {
      expect(canLay(i, laid)).toBe(true);
      laid.push(i);
    }
    const first = byDay[0];
    expect(lapsOver(first)).toEqual([]);
    for (const i of byDay.slice(1)) expect(canLay(i, [])).toBe(lapsOver(i).length === 0);
    expect(giornateSeams().length).toBeGreaterThanOrEqual(GIORNATE_PATCHES.length);
    expect(relief(90)).toBeCloseTo(0, 6);
    expect(relief(0)).toBe(1);
    expect(relief(10)).toBeGreaterThan(relief(45));
  });
  it('school of athens: every receding edge runs through the vanishing point at the eye height; tile diagonals meet the horizon at the viewing distance', () => {
    for (const [a, b] of ATHENS_EDGES) expect(offLine(a, b, [0, ATHENS_EYE])).toBeLessThan(1e-9);
    for (const [a, b] of ATHENS_DIAGONALS) expect(offLine(a, b, [Math.sign(b[0] - a[0]) * ATHENS_DIST, ATHENS_EYE])).toBeLessThan(1e-9);
    expect(athensProject(1, 2, 0)).toEqual([1, 2]);
    expect(athensProject(0, 2, ATHENS_DIST)[1]).toBeCloseTo((2 + ATHENS_EYE) / 2, 9);
    expect(offLine([0, 0], [1, 0], [0.5, 2])).toBe(2);
  });
  it('st peters dome: a line of thrust fits inside the slice only for a middling outward push; the chain ends on the springing line; pieces weigh less towards the top', () => {
    expect(thrustFits(0.25, 0.1)).toBe(true);
    expect(thrustFits(0.08, 0.1)).toBe(false);
    expect(thrustFits(0.9, 0.1)).toBe(false);
    expect(bestLine(0.25, 0.1).off).toBeLessThan(THICK / 2);
    const pts = thrustLine(0.25, 0.1, 27);
    expect(pts.at(-1)![1]).toBeCloseTo(0, 9);
    expect(DOME_PIECES[0].w).toBeGreaterThan(DOME_PIECES.at(-1)!.w);
    expect(DOME_PIECES.reduce((s, p) => s + p.w, 0)).toBeCloseTo(SLICE_WEIGHT, 9);
  });
  it('gallery of maps: every region lies on the side of the Apennines that matches its wall; Rome is west, Milan and Turin drain to the Adriatic side', () => {
    for (const r of MAP_REGIONS) expect([r.name, apennineSide(r.lon, r.lat)]).toEqual([r.name, r.wall]);
    expect(apennineSide(12.5, 41.9)).toBe('tyrrhenian');
    expect(apennineSide(9.19, 45.46)).toBe('adriatic');
    expect(apennineSide(7.69, 45.07)).toBe('adriatic');
    expect(apennineSide(13.36, 38.12)).toBe('tyrrhenian');
    expect(apennineSide(18.17, 40.35)).toBe('adriatic');
  });
  it('castel sant angelo: peeling the newest layer each time ends at Hadrian’s tomb, the oldest', () => {
    let standing = CASTLE_LAYERS.map((l) => l.id);
    const order: string[] = [];
    while (standing.length > 1) {
      const top = newestLayer(standing)!;
      order.push(top);
      standing = standing.filter((s) => s !== top);
    }
    expect(order).toEqual(['bastions', 'towers', 'door', 'chapel', 'walls']);
    expect(standing).toEqual(['tomb']);
    expect(newestLayer(['tomb', 'walls', 'chapel'])).toBe('chapel');
  });
  it('Pantheon: the noon light is on the dome in December, at the dome’s base at the equinox, fills the doorway around 21 April and lies on the floor in June', () => {
    expect(Math.round(noonAltitude(355))).toBe(25);
    expect(Math.round(noonAltitude(172))).toBe(72);
    expect(placeOf(noonAltitude(355))).toBe('dome');
    const [e0, e1] = litStretch(noonAltitude(80));
    expect(e0).toBeLessThan(2 * PANTHEON_R);
    expect(e1).toBeGreaterThan(2 * PANTHEON_R);
    expect(doorwayLit(noonAltitude(111))).toBe(true);
    expect(doorwayLit(noonAltitude(233))).toBe(true);
    expect(doorwayLit(noonAltitude(80))).toBe(false);
    expect(doorwayLit(noonAltitude(140))).toBe(false);
    expect(placeOf(noonAltitude(172))).toBe('floor');
  });
  it('Navona stadium: the stands are about 26.5 m deep; some 27 rows at 50 cm a person seat about 30,000', () => {
    expect(NAVONA_STANDS).toBeCloseTo(26.55, 2);
    expect(NAVONA_MAX_ROWS).toBe(37);
    expect(navonaRow(0)).toBeCloseTo(2 * 222 + Math.PI * 26.8, 1);
    expect(navonaNear(navonaSeats(27, 0.5))).toBe(true);
    expect(navonaNear(navonaSeats(24, 0.45))).toBe(true);
    expect(navonaSeats(12, 0.6)).toBeLessThan(15000);
    expect(navonaSeats(37, 0.35)).toBeGreaterThan(50000);
  });
  it('Aqua Virgo: a jet climbs only to its source level, so sinking the nozzle 1.5 m gives a 2 m jet from water half a metre above the street', () => {
    expect(virgoJet(0.5, 0)).toBe(0.5);
    expect(virgoJet(0.5, 1.5)).toBe(2);
    expect(virgoTop(0.5, 1.5)).toBeCloseTo(0.5, 9);
    expect(virgoSpeed(0.5, 1.5)).toBeCloseTo(6.26, 2);
  });
  it('Caravaggio: only black walls and a single window make the lit side 20 times as bright as the shadow side', () => {
    expect(studioContrast('black', 'one')).toBeGreaterThan(TENEBRIST);
    expect(studioContrast('black', 'one')).toBeCloseTo(34.33, 1);
    expect(studioContrast('grey', 'one')).toBeLessThan(TENEBRIST);
    expect(studioContrast('white', 'one')).toBeLessThan(4);
    expect(studioContrast('black', 'two')).toBeLessThan(2);
  });
  it('Monte Testaccio: 25 to 53 million jars of 70 litres hold about 1.75 to 3.7 billion litres; 25 million over 250 years is 7 million litres a year', () => {
    expect(testaccioLitres(25e6)).toBe(1.75e9);
    expect(testaccioLitres(53e6)).toBe(3.71e9);
    expect(testaccioPerYear(25e6, 250)).toBe(7e6);
  });
  it('Palatine: 244 years of seven kings back from 509 BC is Varro’s 753 BC, almost 35 years a reign; Timaeus’s 814 BC would need nearly 44', () => {
    expect(palatineFounding(244 / 7)).toBe(PALATINE_VARRO);
    expect(palatineFounding(34.8)).toBe(753);
    expect(palatineFounding(34.9)).toBe(753);
    expect(palatineFounding(35)).toBe(754);
    expect(palatineReign(753)).toBeCloseTo(34.86, 2);
    expect(palatineReign(814)).toBeCloseTo(43.57, 2);
    expect(palatineNearest(palatineFounding(20)).who).toBe('Cincius');
    expect(palatineNearest(753).who).toBe('Varro');
  });
  it('Consuls: in the Centuriate Assembly the 98 richest of 193 centuries are a majority, so if they agree 95 are never called', () => {
    expect(CENTURIATE_TOTAL).toBe(193);
    expect(CENTURIATE_MAJORITY).toBe(97);
    expect(CENTURIATE_RICH).toBe(98);
    expect(centuriateVote(98, 0)).toEqual({ a: 98, b: 0, called: 98, winner: 'A', blocks: 1 });
    expect(centuriateVote(97, 95).called).toBe(98);
    expect(centuriateVote(1, 95)).toMatchObject({ winner: 'B', called: 98 });
    expect(centuriateVote(80, 30)).toMatchObject({ winner: 'A', blocks: 4, called: 158 });
    expect(centuriateVote(60, 30)).toMatchObject({ winner: 'B', called: 188 });
    expect(centuriateVote(49, 48).called).toBe(193);
    for (const n of [0, 7, 48, 95]) expect(centuriateShare(n).reduce((s, x) => s + x, 0)).toBe(n);
  });
  it('Caesar: Suetonius wrote 164 years after the Ides of 44 BC, Shakespeare 1,642; the slider reaches every account', () => {
    expect(caesarAfter(121)).toBe(164);
    expect(caesarAfter(1599)).toBe(1642);
    expect(caesarAfter(14)).toBe(57);
    expect(caesarYear(0)).toBe(-44);
    expect(caesarYear(44)).toBe(1);
    expect(caesarYear(164)).toBe(121);
    expect(caesarLatest(30)).toBeUndefined();
    expect(caesarLatest(60)?.id).toBe('nicolaus');
    expect(caesarLatest(160)?.id).toBe('plutarch');
    expect(caesarLatest(caesarYearsAt(100))?.id).toBe('shakespeare');
    for (const n of [0, 100, 270, 900, 1700]) expect(caesarYearsAt(caesarPos(n))).toBeCloseTo(n, 6);
  });
  it('Augustus: consul XI and tribune’s power XIV only from mid-10 to mid-9 BC, the obelisk’s date; XXXVII by AD 14', () => {
    expect(augRoman(14)).toBe('XIV');
    expect(augRoman(37)).toBe('XXXVII');
    expect(augTitles(augAstro(-10) + 0.75)).toMatchObject({ cos: 11, trib: 14, pontifex: true, pater: false, augustus: true });
    expect(augObelisk(augTitles(augAstro(-10) + 0.25))).toBe(false);
    expect(augObelisk(augTitles(augAstro(-9) + 0.25))).toBe(true);
    expect(augObelisk(augTitles(augAstro(-9) + 0.75))).toBe(false);
    expect(augTitles(augAstro(11) + 0.6).trib).toBe(34);
    const last = augTitles(augTau(AUG_STEPS));
    expect(last).toMatchObject({ cos: 13, trib: 37, pater: true });
    expect(augInscription(last).join(' ')).toContain('TRIB · POT · XXXVII');
    expect(augTitles(augTau(0))).toMatchObject({ augustus: false, cos: 4, trib: 0 });
    const hits = Array.from({ length: AUG_STEPS + 1 }, (_, i) => i).filter((i) => augObelisk(augTitles(augTau(i))));
    expect(hits).toEqual([41, 42]);
  });
  it('Trajan’s Column: a 30° hillside cut back about 51.6 m leaves a face of 100 Roman feet (29.77 m) and about 767 m³ of earth per metre', () => {
    expect(TRAJAN_COLUMN).toBeCloseTo(29.77, 9);
    expect(trajanBack(30, TRAJAN_COLUMN)).toBeCloseTo(51.56, 2);
    expect(trajanFace(30, trajanBack(30, TRAJAN_COLUMN))).toBeCloseTo(29.77, 9);
    expect(trajanEarth(30, 51.56)).toBeCloseTo(767.4, 0);
    expect(trajanEarth(45, 20) / trajanEarth(45, 10)).toBeCloseTo(4, 9);
  });
  it('Arch of Constantine: all 28 reused sculptures existed by AD 176, 139 years before the dedication; none for certain before 117', () => {
    expect(ARCH_REUSED).toBe(28);
    expect(archCarvedBy(116)).toBe(0);
    expect(archCarvedBy(117)).toBe(12);
    expect(archCarvedBy(175)).toBe(20);
    expect(archCarvedBy(176)).toBe(28);
    expect(ARCH_DEDICATED - 176).toBe(139);
  });
  it('Rome after the sacks: from up to a million to at most 60,000 by about 550; a million inside the walls is 72,150 per km²', () => {
    expect(Math.round(sackDensity(1e6))).toBe(72150);
    expect(sackAt(100).high).toBe(1e6);
    expect(sackAt(454).high).toBe(500000);
    expect(sackAt(549).high).toBeGreaterThanOrEqual(SACK_TENTH);
    expect(sackAt(550).high).toBeLessThan(SACK_TENTH);
    expect(sackAt(600).high).toBe(90000);
  });
  it('Arch of Titus: in the model, ochre traces stand out in blue light but hardly in red, because yellow ochre absorbs blue', () => {
    expect(titusOchre(450)).toBeLessThan(0.15);
    expect(titusOchre(650)).toBeGreaterThan(0.6);
    expect(titusSpot(500, 0)).toBeCloseTo(0.85, 9);
    expect(titusContrast(450)).toBeGreaterThan(TITUS_STANDS);
    expect(titusContrast(500)).toBeLessThan(TITUS_STANDS);
    expect(titusContrast(620)).toBeLessThan(1.1);
  });
  it('Vatican obelisk: with uneven ropes, overloaded capstans that stop let all 40 share the load and lift it 2¾ palms; ropes that snap fail', () => {
    const slack = obeliskSlacks(0.5);
    let s = obeliskStart(slack);
    let moves = 0;
    while (s.h < OBELISK_TARGET && moves < 30) { s = obeliskMove(s, slack, 'stop'); moves++; }
    expect(s.h).toBeGreaterThanOrEqual(OBELISK_TARGET);
    expect(s.broken.some(Boolean)).toBe(false);
    expect(Math.max(...s.pull)).toBeLessThanOrEqual(1 + 1e-9);
    expect(s.pull.reduce((a, b) => a + b, 0)).toBeCloseTo(OBELISK_NEED, 6);
    let f = obeliskStart(slack);
    for (let i = 0; i < 30; i++) f = obeliskMove(f, slack, 'snap');
    expect(f.broken.filter(Boolean).length).toBeGreaterThan(OBELISK_ROPES - OBELISK_NEED);
    expect(f.h).toBe(0);
    const even = obeliskSlacks(0);
    let g = obeliskStart(even);
    for (let i = 0; i < 14; i++) g = obeliskMove(g, even, 'snap');
    expect(g.broken.some(Boolean)).toBe(false);
  });
  it('Vatican City: the basilica and gardens are inside the border, the square is Vatican City policed by Italy, the Lateran is Holy See property in Italy', () => {
    expect(vaticanInside(41.9022, 12.4536)).toBe(true);
    expect(vaticanInside(41.902, 12.4615)).toBe(false);
    expect(vaticanClassify(41.9022, 12.4536).kind).toBe('vatican');
    expect(vaticanClassify(41.904, 12.45).kind).toBe('vatican');
    expect(vaticanClassify(41.90222, 12.45727).kind).toBe('square');
    expect(vaticanClassify(41.88585, 12.50559)).toEqual({ kind: 'embassy', place: 'lateran' });
    expect(vaticanClassify(41.89094, 12.4919).kind).toBe('italy');
    expect(vaticanClassify(41.88, 12.52).kind).toBe('italy');
    for (const p of VATICAN_PLACES) expect(vaticanClassify(p.lat, p.lon, 0.05).kind).toBe(p.kind);
  });
  it('Pietà: the triangle that best fits the outline of the group has its tip right above Mary’s head', () => {
    expect(Math.abs(PIETA_BEST.ax - MARY_HEAD_X)).toBeLessThanOrEqual(4);
    expect(PIETA_BEST.f).toBeGreaterThan(0.8);
    expect(pietaFit(MARY_HEAD_X, 180)).toBeGreaterThan(PIETA_BEST.f - 0.03);
    expect(pietaFit(40, 240)).toBeLessThan(PIETA_BEST.f - 0.1);
    expect(pietaFit(170, 140)).toBeLessThan(PIETA_BEST.f - 0.1);
  });
  it('Rome ghetto: 4,000 people on 3 hectares in 1656 is over 1,300 a hectare, about 60 times Rome today, and needs two floors for the room one floor gave in 1555', () => {
    expect(ghettoPerHa(GHETTO_PEOPLE[1656])).toBeCloseTo(1333.3, 1);
    expect(Math.round(ROME_PER_HA)).toBe(21);
    expect(ghettoPerHa(GHETTO_PEOPLE[1656]) / ROME_PER_HA).toBeGreaterThan(60);
    expect(ghettoGround(GHETTO_PEOPLE[1555])).toBe(15);
    expect(GHETTO_TARGET).toBe(15);
    expect(ghettoFloor(GHETTO_PEOPLE[1656], 1)).toBeLessThan(GHETTO_TARGET);
    expect(ghettoFloor(GHETTO_PEOPLE[1656], 2)).toBe(GHETTO_TARGET);
  });
  it('Santa Maria Maggiore: a bishop Sixtus, after Ephesus and before the 1295 apse leaves only Sixtus III, 432–440', () => {
    expect(smmWindows([])).toEqual([[100, 1600]]);
    expect(smmWindows(['sixtus'])).toHaveLength(5);
    expect(smmWindows(['sixtus', 'legal'])).toEqual([[432, 440], [1471, 1484], [1585, 1590]]);
    const solved = smmWindows(['sixtus', 'ephesus', 'apse']);
    expect(solved).toEqual([[432, 440]]);
    expect(smmYears(solved)).toBe(8);
    expect(smmFits(solved, SMM_LIBERIUS)).toBe(false);
    expect(smmFits(smmWindows(['legal', 'apse']), SMM_LIBERIUS)).toBe(true);
  });
  it('Nasoni: blocking the spout cuts the flow, so the pressure at the spout climbs from about 9% to about 93% of the main', () => {
    const hole = NASONI_HOLES.medium;
    expect(nasoniPressure(0, hole)).toBeCloseTo(0.0936, 3);
    expect(nasoniPressure(1, hole)).toBeCloseTo(0.9259, 3);
    expect(nasoniFlow(0, hole)).toBe(1);
    expect(nasoniFlow(1, hole)).toBeCloseTo(0.286, 3);
    expect(nasoniPressure(1, NASONI_HOLES.small)).toBeGreaterThan(NASONI_GOAL);
    expect(nasoniPressure(1, NASONI_HOLES.large)).toBeLessThan(NASONI_GOAL);
    expect(nasoniPressure(0.9, hole)).toBeLessThan(NASONI_GOAL);
  });
  it('Carbonara: the name is in print by 1939, the first recipes in 1952, guanciale first in 1957', () => {
    expect(carbFirstName(1938)).toBeNull();
    expect(carbFirstName(2026)).toBe(1939);
    expect(carbFirstWith('guanciale')).toBe(1957);
    expect(carbFirstWith('gruyere')).toBe(1954);
    expect(carbFirstWith('cream')).toBe(1960);
    expect(carbKnown(1952).filter((d) => d.kind === 'recipe')).toHaveLength(2);
    expect(CARB_DOCS.map((d) => d.year)).toEqual([...CARB_DOCS.map((d) => d.year)].sort((a, b) => a - b));
  });
  it('CO₂ bathtub: with half of 2025’s emissions staying, the level stops rising at half of 2025’s emissions', () => {
    expect(CO2_IN).toBeCloseTo(5.6, 6);
    expect(CO2_OUT).toBeCloseTo(2.8, 6);
    expect(co2Change(100)).toBeCloseTo(2.8, 6);
    expect(co2Change(80)).toBeGreaterThan(0);
    expect(co2Change(50)).toBeCloseTo(0, 6);
    expect(co2Change(0)).toBeCloseTo(-2.8, 6);
    expect(CO2_STEADY).toBeCloseTo(50, 6);
  });
  it('Tunnel boring machine: it can only push off a finished ring, so each stroke needs a ring built behind it', () => {
    expect(tbmPlace(TBM_START).refused).toBe('no-gap');
    let s: Tbm = tbmMine(TBM_START).next;
    expect(s.extended).toBe(true);
    expect(tbmMine(s).refused).toBe('jacks-out');
    s = tbmPlace(s).next;
    expect(s.placed).toBe(1);
    expect(tbmMine(s).refused).toBe('ring-unfinished');
    for (let i = 1; i < TBM_SEGMENTS; i++) s = tbmPlace(s).next;
    expect(s).toEqual({ rings: 1, extended: false, placed: 0 });
    for (let r = 1; r < TBM_GOAL; r++) {
      s = tbmMine(s).next;
      for (let i = 0; i < TBM_SEGMENTS; i++) s = tbmPlace(s).next;
    }
    expect(s.rings).toBe(TBM_GOAL);
  });
  it('Root key rollover: with automatic updates a resolver must be on by 11 September 2026, 30 days before the switch', () => {
    expect(new Date(kskDay(KSK_LAST)).toISOString().slice(0, 10)).toBe('2026-09-11');
    expect(kskWorks(KSK_LAST, 'auto')).toBe(true);
    expect(kskWorks(KSK_LAST + 1, 'auto')).toBe(false);
    expect(new Date(kskTrusts(10, 'auto')!).toISOString().slice(0, 10)).toBe('2025-02-10');
    expect(kskWorks(10, 'off')).toBe(false);
    expect(kskWorks(KSK_LAST + 100, 'auto')).toBe(false);
  });
  it('Shearwater jet lag: 1,000 km at 52° N is 58 minutes of sun time; 50 minutes at 2 pm turns the sun compass about 15° clockwise', () => {
    expect(swAzimuth(12)).toBeCloseTo(180, 6);
    expect(swAzimuth(6)).toBeLessThan(90);
    expect(swAzimuth(18)).toBeGreaterThan(270);
    expect(swKmPerDeg()).toBeCloseTo(68.53, 1);
    expect(swShift(1000)).toBeCloseTo(58.4, 1);
    expect(swShift(-1000)).toBeCloseTo(-58.4, 1);
    expect(swError(14, (50 / 4) * swKmPerDeg())).toBeCloseTo(14.8, 1);
    expect(swError(10, -850)).toBeLessThan(0);
    expect(swError(12, 550)).toBeGreaterThan(SW_GOAL - 0.5);
    expect(swError(8, 1000)).toBeLessThan(SW_GOAL - 0.5);
    expect(swError(15, -900)).toBeLessThan(-(SW_GOAL - 0.5));
  });
  it('Gas kicks: a typical xenon atom bouncing back kicks 177 keV/c, below the 200 keV/c the experiment could see; 245 m/s reaches it', () => {
    expect(gasMean(GAS_MASS.xe)).toBeCloseTo(217.4, 1);
    expect(gasKick(GAS_MASS.xe, gasMean(GAS_MASS.xe), true)).toBeCloseTo(177.3, 1);
    expect(gasKick(GAS_MASS.xe, 300, false)).toBeCloseTo(gasKick(GAS_MASS.xe, 300, true) / 2, 6);
    expect(gasSpeedFor(GAS_THRESHOLD, GAS_MASS.xe)).toBeCloseTo(245.1, 1);
    expect(gasKick(GAS_MASS.xe, 245, true)).toBeLessThan(GAS_THRESHOLD);
    expect(gasKick(GAS_MASS.xe, 250, true)).toBeGreaterThan(GAS_THRESHOLD);
    expect(gasKick(GAS_MASS.xe, 250, true)).toBeLessThan(GAS_THRESHOLD + 5);
    expect(gasDv(390)).toBeCloseTo(0.208, 3);
    expect(gasKick(GAS_MASS.sf6, gasMean(GAS_MASS.sf6), true)).toBeGreaterThan(gasKick(GAS_MASS.kr, gasMean(GAS_MASS.kr), true));
  });
  it('Rubidium clock: after 4.1 billion years 5.6% of the rubidium-87 has decayed and the isochron slope is 0.059, whatever the starting mix', () => {
    expect(rbDecayed(49.23)).toBeCloseTo(0.5, 6);
    expect(rbDecayed(RB_TARGET)).toBeCloseTo(0.0561, 4);
    expect(rbSlope(RB_TARGET)).toBeCloseTo(0.0594, 4);
    expect(rbAge(rbSlope(RB_TARGET))).toBeCloseTo(RB_TARGET, 9);
    for (const mix of [0.7, 0.72, 0.75]) {
      const pts = RB_GRAINS.map((x0) => rbGrain(x0, RB_TARGET, mix));
      for (const p of pts) expect(p.y).toBeCloseTo(mix + p.x * rbSlope(RB_TARGET), 12);
    }
    const g = rbGrain(1, RB_TARGET);
    expect(g.x + g.y).toBeCloseTo(1 + 0.7, 12);
  });
  it('Latvia open list: votes are ballots + for − against; against marks on four rivals give the last name a seat', () => {
    expect(lvVotes(LV_NO_MARKS)).toEqual([1000, 1000, 1000, 1000, 1000, 1000]);
    expect(LV_BALLOTS).toBe(1000);
    expect(lvElected(LV_NO_MARKS)).toEqual([0, 1]);
    const struck = { pro: [0, 0, 0, 0, 0, 0], con: [50, 50, 50, 50, 0, 0] };
    expect(lvRanking(struck).slice(0, 2)).toEqual([4, 5]);
    expect(lvElected(struck)).toContain(5);
    const boosted = { pro: [0, 0, 0, 0, 0, 50], con: [0, 0, 0, 0, 0, 0] };
    expect(lvElected(boosted)).toEqual([5, 0]);
    // the real case it models: 34,294 Progressive ballots in Rīga; No. 43 got 4,577 for and 856 against, No. 4 got 2,841 and 6,502
    expect(34294 + 4577 - 856).toBe(38015);
    expect(34294 + 2841 - 6502).toBe(30633);
  });
  it('Hittite: Hrozný’s line has five words, NINDA known; each unknown word fits one meaning, offered out of order', () => {
    expect(HIT_LINE).toEqual(['nu', 'NINDA-an', 'ezzatteni', 'watar-ma', 'ekutteni']);
    expect(HIT_WORDS.map((w, i) => hitFits(i, w.meaning))).toEqual([true, true, true]);
    expect(hitFits(0, 1)).toBe(false);
    expect(hitFits(1, 2)).toBe(false);
    expect([...HIT_OFFER].sort()).toEqual([0, 1, 2]);
    expect(HIT_OFFER.some((m, i) => m === HIT_WORDS[i].meaning)).toBe(false);
    expect(hitReading([true, true, false]).done).toBe(false);
    expect(hitReading([true, true, true]).done).toBe(true);
  });
  it('Clapping Music: 8 claps in 12 beats; one move takes the first beat to the end; 12 moves are unison; no silence at 1, 6 and 11', () => {
    expect(CLAP_BEATS).toBe(12);
    expect(CLAP_PATTERN.filter(Boolean)).toHaveLength(8);
    expect(clapShifted(1).join('')).toBe('110110101101');
    expect(clapShifted(12)).toEqual([...CLAP_PATTERN]);
    expect(clapOverlap(0)).toEqual({ both: 8, one: 0, silent: 4 });
    expect(clapOverlap(1)).toEqual({ both: 4, one: 8, silent: 0 });
    expect(CLAP_NO_SILENCE).toEqual([1, 6, 11]);
    expect(new Set(Array.from({ length: 12 }, (_, s) => clapShifted(s).join(''))).size).toBe(12);
    expect(Math.max(...Array.from({ length: 11 }, (_, s) => clapOverlap(s + 1).silent))).toBe(2);
  });
  it('Statue of Liberty: four times taller is 16 times the skin and 64 times the volume; the statue is about 37 times the study model', () => {
    expect(solEnlarge(4)).toEqual({ height: 5, skin: 16, volume: 64 });
    expect(SOL_FULL).toBeCloseTo(36.84, 2);
    expect(solEnlarge(SOL_FULL).height).toBeCloseTo(46.05, 2);
    expect(solEnlarge(SOL_FULL).skin).toBeCloseTo(1357, 0);
    expect(Math.round(solEnlarge(SOL_FULL).volume / 1000)).toBe(50);
    expect(SOL_STAGES.map((s) => s.m)).toEqual([1.25, 2.85, 11, 46.05]);
    expect(SOL_STAGES[2].m / SOL_STAGES[1].m).toBeCloseTo(3.86, 2);
  });
  it('Laocoön: the drill holes line up at one angle only; there the rigid bent arm rises and folds back toward the head', () => {
    expect(laoHolesOff(LAO_FIT, 0)).toEqual({ deg: 0, cm: 0 });
    expect(laoAligned(LAO_FIT, 0)).toBe(true);
    expect(laoAligned(LAO_FIT + 3, 0)).toBe(false);
    expect(laoAligned(LAO_FIT, 0.5)).toBe(false);
    expect(laoAligned(196, 2.5)).toBe(false);
    const { elbow, end } = laoArmEnds(LAO_FIT);
    expect(elbow[1]).toBeGreaterThan(LAO_SHOULDER[1]);
    expect(Math.hypot(end[0] - LAO_HEAD[0], end[1] - LAO_HEAD[1])).toBeLessThan(Math.hypot(elbow[0] - LAO_HEAD[0], elbow[1] - LAO_HEAD[1]));
  });
  it('St Peter’s colonnade: from its disc only the front column of each set of four shows; from the obelisk or the other disc the back rows show', () => {
    const cols = colonnadeColumns();
    expect(cols).toHaveLength(COL_SETS * 4);
    for (const c of cols) expect(Math.hypot(c.x - COL_DISC, c.y)).toBeCloseTo(COL_ROWS[c.row], 9);
    const fromDisc = sightFrom(COL_DISC, 0);
    expect(fromDisc.seen).toHaveLength(COL_SETS);
    expect(fromDisc.rear).toBe(0);
    expect(fromDisc.seen.every((c) => c.row === 0)).toBe(true);
    expect(sightFrom(0, 0).rear).toBeGreaterThan(COL_SETS);
    expect(sightFrom(-COL_DISC, 0).rear).toBeGreaterThan(COL_SETS);
    expect(sightFrom(20, -30).rear).toBeGreaterThan(COL_SETS);
    expect(placeEye(COL_DISC + 1.5, 1)).toEqual([COL_DISC, 0]);
    const [x, y] = placeEye(300, 0);
    expect(x).toBeLessThan(99.06);
    expect(y).toBe(0);
  });
  it('Double helix stairs: a second ramp halves the headroom, so it can make at most half the turns, at twice the slope', () => {
    const one = stairDesign(1, 4), two = stairDesign(2, 4);
    expect(one.pitch).toBeCloseTo(5.5, 9);
    expect(two.pitch).toBeCloseTo(5.5, 9);
    expect(one.headroom).toBeCloseTo(5, 9);
    expect(two.headroom).toBeCloseTo(2.25, 9);
    expect(gentlestTurns(1)).toBe(8);
    expect(gentlestTurns(2)).toBe(4);
    expect(stairDesign(2, 4.5).headroom).toBeLessThan(STAIR_HEADROOM);
    expect(stairDesign(2, 4).slope).toBeCloseTo(2 * stairDesign(1, 8).slope, 9);
    expect(Math.round(stairDesign(2, 4).slope * 100)).toBe(15);
    expect(Math.round(stairDesign(1, 8).slope * 100)).toBe(7);
    expect(stairDesign(1, 1).length).toBeCloseTo(Math.hypot(2 * Math.PI * 6, 22), 9);
  });
  it('Conclave: two thirds of 133 is 89 and 45 can block; no two of the imagined groups reach 89, the biggest and any other reach 67', () => {
    expect(concNeed(CONC_N, 'two-thirds')).toBe(89);
    expect(concNeed(CONC_N, 'late-1996')).toBe(67);
    expect(concBlockers(CONC_N, 'two-thirds')).toBe(45);
    expect(concNeed(120, 'two-thirds')).toBe(80);
    expect(concNeed(115, 'two-thirds')).toBe(77);
    expect(CONC_BLOCS.reduce((a, b) => a + b, 0)).toBe(CONC_N);
    const pairs: boolean[][] = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push([0, 1, 2, 3].map((k) => k === i || k === j));
    expect(pairs.some((c) => concWins(c, 'two-thirds'))).toBe(false);
    expect(pairs.filter((c) => concWins(c, 'late-1996')).map(concVotes)).toEqual([84, 75, 70]);
    expect(concWins([true, true, true, false], 'two-thirds')).toBe(true);
    expect(concWins([false, true, true, true], 'two-thirds')).toBe(false);
  });
  it('Swiss Guard: 189 − 147 = 42; the Passetto on the map is about 0.75 km; taps find the 1527 route', () => {
    expect(SG_GUARDS - SG_DIED).toBe(42);
    expect(SG_SURVIVED).toBe(42);
    expect(sgLength(SG_PASSETTO)).toBeGreaterThan(0.7);
    expect(sgLength(SG_PASSETTO)).toBeLessThan(0.85);
    expect(sgKm(SG_PLACES.obelisk1527, SG_PLACES.obeliskNow)).toBeCloseTo(0.24, 1);
    expect(SG_ROUTE).toEqual(['obelisk1527', 'passetto', 'castle']);
    expect(sgHit(SG_PLACES.obelisk1527)).toBe('obelisk1527');
    expect(sgHit(SG_PLACES.obeliskNow)).toBe('obeliskNow');
    expect(sgHit(SG_PLACES.castle)).toBe('castle');
    expect(sgHit([41.90315, 12.4605])).toBe('passetto');
    expect(sgHit([41.9049, 12.4600])).toBe(null);
  });
  it('Starry Night: the low-precision sky matches the 2026 paper and finds the same three dawns', () => {
    const july = [21, 22, 23, 24].map((d) => snSky(7, d).sep);
    [29.7, 18.6, 7.66, 3.2].forEach((v, i) => expect(Math.abs(july[i] - v)).toBeLessThan(0.25));
    expect(Math.abs(snSky(6, 19, 2 + 27 / 60).lit * 100 - 63.1)).toBeLessThan(1);
    expect(Math.abs(snSky(6, 19, 2 + 27 / 60).venus.alt - 3)).toBeLessThan(0.2);
    expect(Math.abs(snSky(7, 22).lit * 100 - 28.44)).toBeLessThan(1);
    const hits = SN_DAWNS.map((s, i) => [s, snDate(i)] as const).filter(([s]) => snFits(s)).map(([, d]) => `${d.day}/${d.month}`);
    expect(hits).toEqual(['23/6', '22/7', '23/7']);
    expect(snDate(0)).toEqual({ month: 6, day: 1 });
    expect(snDate(60)).toEqual({ month: 7, day: 31 });
  });
  it('Bad apple: copying alone levels off, rare overshoots tip the group, steady rule-followers hold it', () => {
    const avg = (e: number, steady: number) => baAverage(BA_SEEDS.map((sd) => baSimulate(e, steady, sd)));
    expect(avg(0, 0)).toBeGreaterThan(0.3);
    expect(avg(0, 0)).toBeLessThan(0.7);
    expect(avg(BA_MEASURED, 0)).toBeGreaterThanOrEqual(BA_TIPPED);
    expect(avg(0.02, 0)).toBeLessThan(BA_TIPPED);
    expect(avg(BA_MEASURED, 0.25)).toBeLessThan(0.2);
    const run = baSimulate(0.03, 0.2, 7);
    expect(run.end.slice(0, run.steady).every((v) => v === 0)).toBe(true);
    expect(run.end.every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
