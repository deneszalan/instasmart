// "Mendel's peas: the friar who counted heredity", a long-form explainer (16:9).
// One line per caption; `say` is what the voice (af_bella, Kokoro) reads when it differs. `gap` is the pause before
// a line; chapter openings get 4.2 s for their title card. Every derived number is computed in sim.mjs from the
// counts below, and the scene computes them again, so picture, narration and source agree.
//
// Facts and where they come from (research/ holds the raw pages):
// - Mendel's paper, "Versuche über Pflanzen-Hybriden" (1866), in the English translation by S. Abbott and
//   D. J. Fairbanks, "Experiments on Plant Hybrids by Gregor Mendel", Genetics 204 (2016) 407–422 (PMC5068836):
//   peas because the organs are enclosed by the keel and the anthers burst in the bud, so the stigma is covered
//   with pollen before the flower opens; crossing: open the bud, remove each stamen with forceps, dust the stigma
//   with other pollen; 34 varieties tried for 2 years, 22 kept; the seven pairs of characters (round/wrinkled seed,
//   yellow/green albumen, grey-brown/white seed coat with violet/white flowers, inflated/constricted pod,
//   green/yellow unripe pod, axial/terminal flowers, long 6–7 ft / short 0.75–1.5 ft stem); earlier hybridisers had
//   never counted the forms among hybrids' progeny; "dominant" and "recessive" defined by Mendel; reciprocal crosses
//   give the same hybrid; seed shape and albumen show directly after fertilisation, in the first year; F2 counts:
//   253 hybrids, 7,324 seeds, 5,474 round, 1,850 wrinkled (2.96:1); 8,023 seeds, 6,022 yellow, 2,001 green (3.01);
//   705/224, 882/299, 428/152, 651/207, 787/277; average 2.98:1; both kinds of seed in one pod; no transitional
//   forms; first ten plants (45/12, 27/8, 24/7, 19/10, 32/11, 26/6, 88/24, 22/10, 28/6, 25/7); extremes 43/2 and
//   14/15; F3 test: of 565 plants from round seeds, 193 constant, 372 hybrid (1.93:1); 100 plants × 10 seeds for
//   characters 3–7 (36/64, 29/71, 40/60 repeated as 35/65, 33/67, 28/72); A + 2Aa + a; pollen over germ cell
//   fractions A/A + A/a + a/A + a/a; "It is a matter of chance which of the two kinds of pollen unites with each
//   individual germ cell"; individual values fluctuate, "the larger their number is, the more mere chance effects
//   are eliminated"; two-trait cross: 15 plants, 556 seeds: 315 round yellow, 101 angular yellow, 108 round green,
//   32 angular green; three traits: 27 classes; all 2^7 = 128 constant combinations produced.
// - Wikipedia, "Gregor Mendel" (the short post's source): Augustinian friar of St Thomas's Abbey in Brno (Brünn),
//   Austrian Empire; 1822–1884; pea experiments 1856–1863, some 28,000 plants, most of them peas; coined dominant and
//   recessive; lectures to the Natural History Society of Brno on 8 February and 8 March 1865, about forty listeners;
//   published 1866, seen as about hybridisation rather than inheritance, cited about three times in 35 years;
//   correspondence with Carl Nägeli, who failed to appreciate it; hawkweed results unlike peas (apomixis, realised
//   later); as abbot his scientific work largely ended; 1900: de Vries and Correns (and Tschermak, no longer accepted
//   as a rediscoverer because he did not understand the laws), each from a different country, within two months in
//   spring 1900; de Vries probably understood his results only after reading Mendel; Bateson; Fisher 1936; Edwards's
//   "lucky gambler"; Hartl and Fairbanks ("can finally be put to rest"; Mendel likely scored more than ten
//   progeny); the 2008 book (Franklin, Edwards, Fairbanks, Hartl, Seidenfeld) found no reason to think he fabricated
//   results; the seven genes, the last three identified in 2025.
// - Wikipedia, "Mendelian inheritance": results not completely unknown, but not seen as generally applicable, even
//   by Mendel, who thought they applied only to certain species or traits; 1900 rediscovery debated.
// - Wikipedia, "Carl Correns": a student of Nägeli. "Hugo de Vries", "Erich von Tschermak": Dutch, Austrian.
// - Wikipedia, "William Bateson": "Mendel's bulldog"; coined "genetics". "Punnett square", "Reginald Punnett": the
//   square devised by Punnett in the 1900s. "Experiments on Plant Hybridization": Fisher used Pearson's chi-squared
//   test; Mendel reported a subset of his data; the seven genes' functions (Reid & Ross 2011).
// - T. H. N. Ellis et al., "Mendel's pea crosses: varieties, traits and statistics", Hereditas 156:33 (2019)
//   (PMC6823958): Fisher's 1936 paper "Has Mendel's work been rediscovered?" and his words ("Mendel was deceived by
//   some assistant who knew too well what was expected"; "the data of most, if not all, of the experiments have been
//   falsified so as to agree closely with Mendel's expectations"); the 10-seed misclassification, (3/4)^10, Fisher's
//   1 : 1.6964; exactly 10 seeds of exactly 100 plants unlikely; Edwards: 84 ratios, chi-squared total 48.91 against
//   an expectation of 84; with Mendel's example and extreme plants the total is 90.6 or 86.2 against 88; Mendel
//   left out some small data sets that "deviate not insignificantly".
// - J. B. Reid and J. J. Ross, "Mendel's Genes: Toward a Full Molecular Characterization", Genetics 189 (2011) 3–10
//   (PMC3176118), and M. K. Bhattacharyya et al., Cell 60 (1990) 115–122 (abstract): starch grains differ (Gregory
//   1903); wrinkled seeds lack SBE1 (Smith 1988); R the first of Mendel's genes cloned, interrupted by a 0.8-kb
//   insertion very similar to the Ac/Ds transposable elements of maize; more sugar, more water in immature seeds;
//   round seeds (RR or Rr) have the enzyme; LE is GA 3-oxidase 1, Mendel's le a single G-to-A change.
// Simulations (sim.mjs, seeded): ten imaginary plants with the seed numbers of Mendel's first ten (seed 10), a
// harvest of 7,324 seeds (seed 9), 1,000 honest gardens of the seven experiments (seed 11).
import { EXPTS, FIRST10, tenPlants, harvest, gardens, MENDEL_CHI, SEEDS } from './sim.mjs';

const r2 = (x) => x.toFixed(2);
const fmt = (n) => n.toLocaleString('en-US');
const TEN = tenPlants(SEEDS.ten).map(([a, b]) => ({ a, b, r: a / b }));
const LO = TEN.reduce((p, q) => (q.r < p.r ? q : p)), HI = TEN.reduce((p, q) => (q.r > p.r ? q : p));
const H = harvest(SEEDS.harvest), at = (n) => (n - H[n - 1]) / H[n - 1], HW = H.at(-1), HR = 7324 - HW;
const G = gardens(SEEDS.gardens), GOOD = G.filter((c) => c <= MENDEL_CHI).length;
export const NUM = { TEN, LO, HI, at40: at(40), at400: at(400), HR, HW, GOOD };
const D = EXPTS.reduce((s, x) => s + x[3], 0), R = EXPTS.reduce((s, x) => s + x[4], 0);
const near = (x) => (Math.abs(x - Math.round(x)) < 0.05 ? `${Math.round(x)}` : r2(x));
if (GOOD < 35 || GOOD > 65) throw new Error(`gardens: ${GOOD}`);

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Cross a pea plant that has round seeds with one that has wrinkled seeds, and every seed you get is round.' },
  { key: 'o2', text: 'But grow those round seeds into plants, and wrinkled seeds come back, about *one in four*.' },
  { key: 'o3', text: 'A friar counted thousands of them in a monastery garden, and found the first rules of genetics.' },
  { key: 'o4', gap: 0.6, text: 'This is the story of *Gregor Mendel’s peas*, and of numbers that some called too good to be true.' },
  // ---- 1 the monastery garden
  { key: 'g1', gap: 4.2, chapter: 'The monastery garden', text: 'Mendel was a friar at St Thomas’s Abbey in Brno, then called Brünn, in the Austrian Empire.', say: 'Mendel was a friar at Saint Thomas’s Abbey in Brno, then called Brünn, in the Austrian Empire.' },
  { key: 'g2', text: 'From 1856 to 1863, he used the abbey’s garden to cross pea plants and follow their offspring.' },
  { key: 'g3', text: 'Pea flowers fertilise themselves in the bud, so to cross two plants, Mendel opened a young bud and pulled out its stamens.' },
  { key: 'g4', text: 'Then he dusted it with pollen from another plant.' },
  { key: 'g5', text: 'He tested 34 varieties, kept 22 that bred true, and chose *seven traits*, each with two clear forms.' },
  { key: 'g6', text: 'Seeds were round or wrinkled, and yellow or green. Seed coats were grey or white, with violet or white flowers.' },
  { key: 'g7', text: 'Pods were inflated or pinched, green or yellow. Flowers grew along the stem or at its tip, and stems were tall or short.' },
  { key: 'g9', text: 'Over those years, he grew and tested some *28,000 plants*, most of them peas, and he counted their offspring.' },
  // ---- 2 three to one
  { key: 'r1', gap: 4.2, chapter: 'Three to one', text: 'Take seed shape. Mendel crossed plants with round seeds and plants with wrinkled ones.' },
  { key: 'r2', text: 'The shape shows in the seed itself, and that same year, every seed was *round*.' },
  { key: 'r3', text: 'Mendel called round *dominant*, and wrinkled, which had vanished, ~recessive~.' },
  { key: 'r4', text: 'The next year, he sowed them and let the plants fertilise themselves.' },
  { key: 'r5', text: 'Wrinkled seeds were back in their pods, often beside round ones, with nothing in between.' },
  { key: 'r6', text: `From 253 hybrid plants, he counted ${fmt(EXPTS[0][3] + EXPTS[0][4])} seeds. Of those, ${fmt(EXPTS[0][3])} were round and ${fmt(EXPTS[0][4])} were wrinkled.` },
  { key: 'r7', text: `That makes *${r2(EXPTS[0][3] / EXPTS[0][4])}* round seeds for every wrinkled one, close to three to one.` },
  { key: 'r8', text: `He did the same for all seven traits, and each one landed near three to one, from ${r2(EXPTS[4][3] / EXPTS[4][4])} to ${r2(EXPTS[2][3] / EXPTS[2][4])}.` },
  { key: 'r9', text: `All seven together gave ${fmt(D)} dominant to ${fmt(R)} recessive, which is *${r2(D / R)} to 1*.`, say: `All seven together gave ${fmt(D)} dominant to ${fmt(R)} recessive, which is ${r2(D / R)} to one.` },
  { key: 'r10', gap: 0.8, text: 'So why three to one? And how can a trait vanish for a generation, then come back unchanged?' },
  // ---- 3 two copies
  { key: 'c1', gap: 4.2, chapter: 'Two copies', text: 'Mendel’s answer, in today’s words, is that each plant carries two copies of a factor for seed shape, one from each parent.' },
  { key: 'c2', text: 'We call these factors genes. Write round as *R*, and wrinkled as ~r~.', say: 'We call these factors genes. Write round as a capital R, and wrinkled as a small r.' },
  { key: 'c4', text: 'A hybrid gets R from one parent and r from the other, and one R is enough to make a seed round.', say: 'A hybrid gets a capital R from one parent and a small r from the other, and one capital R is enough to make a seed round.' },
  { key: 'c5', text: 'That’s dominance. The r stays hidden, and it can be passed on.', say: 'That’s dominance. The small r stays hidden, and it can be passed on.' },
  { key: 'c6', text: 'Each pollen grain and each egg cell gets just one copy, so a hybrid’s are half R and half r.', say: 'Each pollen grain and each egg cell gets just one copy, so a hybrid’s are half capital R and half small r.' },
  { key: 'c7', text: 'Which pollen meets which egg, Mendel wrote, “is a matter of chance”.', say: 'Which pollen meets which egg, Mendel wrote, is a matter of chance.' },
  { key: 'c8', text: 'He wrote the four equally likely meetings as fractions, the pollen over the egg cell.' },
  { key: 'c9', text: 'Only r over r, one meeting in four, makes a wrinkled seed. The other three make round ones.', say: 'Only small r over small r, one meeting in four, makes a wrinkled seed. The other three make round ones.' },
  { key: 'c10', text: 'Today this is drawn as a square, devised decades later by Reginald Punnett.' },
  { key: 'c11', text: 'It predicts *one pure round, two hybrids and one pure wrinkled*, in every four.' },
  { key: 'c12', gap: 0.8, text: 'So two round seeds in three should be hybrids, still hiding an r. Mendel tested that.', say: 'So two round seeds in three should be hybrids, still hiding a small r. Mendel tested that.' },
  { key: 'c13', text: 'Of 565 plants grown from round seeds, 372 made both kinds of seed, and 193 made only round ones.' },
  { key: 'c14', text: `That’s *${r2(372 / 193)}* hybrids for every pure plant, close to the two to one his idea predicted.` },
  // ---- 4 two traits at once
  { key: 'd1', gap: 4.2, chapter: 'Two traits at once', text: 'Next, Mendel crossed plants that differed in two traits, round yellow seeds with wrinkled green ones.' },
  { key: 'd2', text: 'The hybrids were all round and yellow. From 15 of them, he harvested 556 seeds, in four kinds.' },
  { key: 'd3', text: 'There were 315 round yellow seeds, 101 wrinkled yellow, 108 round green, and 32 wrinkled green.' },
  { key: 'd4', text: 'If the traits are inherited separately, three quarters of the seeds are round, and three quarters of those are yellow.' },
  { key: 'd5', text: 'That makes nine sixteenths round and yellow, and the four kinds come in *nine, three, three and one*.' },
  { key: 'd6', text: 'For 556 seeds, that predicts about 313 round yellow and 35 wrinkled green, with 104 of each mixed kind.' },
  { key: 'd7', text: 'Seed shape and seed colour had sorted *independently*.' },
  { key: 'd8', text: 'With three traits, he found 27 kinds of offspring. In the end, he bred all 128 true-breeding combinations of his seven traits.' },
  // ---- 5 forgotten and found
  { key: 'h1', gap: 4.2, chapter: 'Forgotten and found', text: 'Mendel presented all this to the Natural History Society of Brno, at two meetings in February and March 1865.' },
  { key: 'h2', text: 'About forty people listened, and his paper appeared in the society’s journal in 1866.' },
  { key: 'h3', text: 'It wasn’t unknown, but readers took it as being about breeding hybrids, not heredity.' },
  { key: 'h4', text: 'Over the next 35 years, it was cited only about three times.' },
  { key: 'h5', text: 'Even Mendel seems to have thought his rules held only for some kinds of plants.' },
  { key: 'h6', text: 'His crosses of hawkweeds didn’t fit at all. Many hawkweeds, it turned out later, make most of their seeds without fertilisation.' },
  { key: 'h7', text: 'When Mendel became abbot, his duties largely ended his science. He died in 1884.' },
  { key: 'h8', gap: 0.8, text: 'Then, in the spring of 1900, three plant scientists in three countries published within about two months, and pointed back to Mendel.' },
  { key: 'h9', text: 'They were Hugo de Vries in the Netherlands, Carl Correns in Germany, and Erich von Tschermak in Austria.', say: 'They were Hugo de Vries in the Netherlands, Carl Correns in Germany, and Erich von Chermak in Austria.' },
  { key: 'h10', text: 'Historians now doubt that Tschermak understood Mendel’s laws, and how much de Vries owed to Mendel is still debated.', say: 'Historians now doubt that Chermak understood Mendel’s laws, and how much de Vries owed to Mendel is still debated.' },
  { key: 'h11', text: 'In England, William Bateson, nicknamed *Mendel’s bulldog*, championed it and named the new science *genetics*.' },
  // ---- 6 chance in every pod
  { key: 'p1', gap: 4.2, chapter: 'Chance in every pod', text: 'Three to one is an average. Plant by plant, Mendel’s counts wandered.' },
  { key: 'p2', text: 'His first ten plants for seed shape gave 45 to 12, then 27 to 8, then 24 to 7.' },
  { key: 'p3', text: 'One gave 19 to 10, under two to one, and another, he noted, gave 43 to 2.' },
  { key: 'p4', text: 'Small counts swing widely, because, as Mendel saw, chance decides which pollen meets which egg.' },
  { key: 'p5', gap: 0.8, text: 'Let’s have chance do the same. For every seed, we pick R or r for the pollen, and again for the egg.', say: 'Let’s have chance do the same. For every seed, we pick capital R or small r for the pollen, and again for the egg.' },
  { key: 'p6', text: 'Here are ten imaginary plants, with the same numbers of seeds as Mendel’s first ten.' },
  { key: 'p7', text: `They scatter just like his, from ${LO.a} to ${LO.b} on one plant to ${HI.a} to ${HI.b} on another.` },
  { key: 'p8', text: 'Now keep going, seed after seed.' },
  { key: 'p9', text: `After 40 seeds, the ratio stands at ${near(NUM.at40)} to 1. After 400, it has fallen to ${r2(NUM.at400)} to 1.`, say: `After 40 seeds, the ratio stands at ${near(NUM.at40)} to one. After 400, it has fallen to ${r2(NUM.at400)} to one.` },
  { key: 'p10', text: `By ${fmt(7324)} seeds, as many as Mendel counted, it has settled at *${r2(HR / HW)} to 1*.`, say: `By ${fmt(7324)} seeds, as many as Mendel counted, it has settled at ${r2(HR / HW)} to one.` },
  { key: 'p11', text: 'In Mendel’s words, “the larger their number is, the more mere chance effects are eliminated”.', say: 'In Mendel’s words, the larger their number is, the more mere chance effects are eliminated.' },
  { key: 'p12', text: 'But never entirely. Honest counts almost never land exactly on three to one.' },
  // ---- 7 too good to be true?
  { key: 'f1', gap: 4.2, chapter: 'Too good to be true?', text: 'In 1936, the statistician Ronald Fisher tested how closely Mendel’s numbers fit his theory.' },
  { key: 'f2', text: 'Real counts miss a prediction by chance. Mendel’s, Fisher argued, missed by too little.' },
  { key: 'f3', text: 'Let’s test that on Mendel’s seven totals, against 1,000 gardens run by chance alone.' },
  { key: 'f4', text: `Only ${GOOD} of them come as close to three to one as Mendel did, about one in twenty.` },
  { key: 'f5', text: 'Lucky, but not shocking. Fisher’s point was that the luck kept repeating.' },
  { key: 'f6', text: 'His sharpest point was a test in which Mendel grew ten offspring of each plant.' },
  { key: 'f7', text: 'Sometimes all ten offspring of a hybrid look dominant, so Mendel should have found about 1.7 hybrids per pure plant, not 2.' },
  { key: 'f8', text: 'He reported 399 hybrids to 201 pure, almost exactly two to one.' },
  { key: 'f9', text: 'Fisher concluded that most of the data had been falsified, perhaps by an assistant “who knew too well what was expected”.', say: 'Fisher concluded that most of the data had been falsified, perhaps by an assistant who knew too well what was expected.' },
  { key: 'f10', gap: 0.8, text: 'Daniel Hartl and Daniel Fairbanks replied that Mendel probably grew more than ten, and that the fraud charge could be put to rest.' },
  { key: 'f11', text: 'Their 2008 book with others, “Ending the Mendel–Fisher Controversy”, found no reason to think he made up results.', say: 'Their 2008 book with others, called Ending the Mendel Fisher Controversy, found no reason to think he made up results.' },
  { key: 'f12', text: 'Yet one of its authors, the statistician A. W. F. Edwards, still found too little scatter in 84 of Mendel’s ratios.', say: 'Yet one of its authors, the statistician A W F Edwards, still found too little scatter in 84 of Mendel’s ratios.' },
  { key: 'f13', text: '“One can applaud the lucky gambler,” he wrote, “but when he is lucky again tomorrow, and the next day, and the following day,', say: 'One can applaud the lucky gambler, he wrote, but when he is lucky again tomorrow, and the next day, and the following day,' },
  { key: 'f14', gap: 0.2, text: 'one is entitled to become a little suspicious.”', say: 'one is entitled to become a little suspicious.' },
  { key: 'f15', text: 'A 2019 reanalysis included the extreme plants Mendel himself reported, and found the scatter close to what chance predicts.' },
  { key: 'f16', text: 'Mendel also said he left out some small experiments that strayed, which may explain some of the tidiness.' },
  { key: 'f17', gap: 0.8, text: 'The open question is how he chose, counted and reported his peas, not whether he grew them.' },
  // ---- 8 what the wrinkle is
  { key: 'w1', gap: 4.2, chapter: 'What the wrinkle is', text: 'Mendel never knew what his factors were made of. For the wrinkled seed, the answer came in 1990.' },
  { key: 'w2', text: 'Wrinkled seeds lack one form of an enzyme that builds starch, *starch-branching enzyme 1*.', say: 'Wrinkled seeds lack one form of an enzyme that builds starch, called starch-branching enzyme one.' },
  { key: 'w3', text: 'In wrinkled peas, its gene is interrupted by an extra stretch of DNA, about *800 letters* long.' },
  { key: 'w4', text: 'The intruder resembles a jumping gene known from maize.' },
  { key: 'w5', text: 'Without the enzyme, the young seed makes less starch and keeps more sugar, which draws in extra water.' },
  { key: 'w6', text: 'Then, as the ripe seed dries out, it ends up *wrinkled*.' },
  { key: 'w7', text: 'One working copy of the gene makes the enzyme, so the seed stays round. That’s dominance, in chemistry.' },
  { key: 'w8', text: 'It was the first of Mendel’s seven genes to be found, and by 2025, all seven had been identified.' },
  // ---- 9 counting chance
  { key: 'z1', gap: 4.2, chapter: 'Counting chance', text: 'So here is what the peas were saying. Every plant carries two copies of each gene, one from each parent.' },
  { key: 'z2', text: 'Each pollen grain and each egg cell gets one of them, by chance.' },
  { key: 'z3', text: 'A recessive copy can hide for a generation, and shows again when two hidden copies meet, *one time in four*.' },
  { key: 'z4', text: 'None of this shows in a single pod. It appears only when someone counts thousands.' },
  { key: 'z5', text: 'Mendel’s counts waited 34 years to be understood, and then they became the first rules of genetics.' },
  { key: 'z6', gap: 0.8, text: 'All from a friar, a garden, and a careful count of peas.' },
];

export const HOLD = { o4: 1.4, g9: 0.6, r9: 0.8, c11: 0.6, c14: 0.4, d6: 0.6, d8: 0.6, h7: 0.6, p7: 0.6, p10: 1.4, f4: 0.8, f8: 0.6, w6: 0.6, z6: 9 };
