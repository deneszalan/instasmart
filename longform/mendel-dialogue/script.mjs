// "Mendel's peas", the dialogue version: two narrators talk the story through over the same pictures.
// Every key of ../mendel/script.mjs appears here, in the same order, on a line that carries the same beat;
// new lines are x1, x2, … . A is the male voice (the cloned narrator, recorded later; am_michael stands in), so A's
// `say` writes numbers and years in words; B is af_bella. Facts and sources: see ../mendel/script.mjs. The lines
// added here use only that research: Mendel's paper (artificial fertilisation "somewhat laborious, but … almost always
// successful"; characters resting on a "more or less" left out; the hybrid resembles one parent so perfectly that the
// other escapes observation), Wikipedia "Gregor Mendel" (cited about three times in 35 years; by 1900 research aimed
// at a theory of discontinuous rather than blending inheritance; Mendel died in 1884), Ellis et al. 2019 (after the
// 2008 book "some doubt about Mendel's results remained, notably in Edwards"), Reid & Ross 2011 (immature wrinkled
// seeds hold more water).
import { tenPlants, harvest, SEEDS } from '../mendel/sim.mjs';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n) => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ' and ' + words(n % 100) : ''}`);
const dec = (x) => { const [i, f] = x.toFixed(2).replace(/0$/, '').split('.'); return `${words(+i)} point ${[...f].map((d) => ONES[+d]).join(' ')}`; };
const r2 = (x) => x.toFixed(2);
const TEN = tenPlants(SEEDS.ten).map(([a, b]) => ({ a, b, r: a / b }));
const LO = TEN.reduce((p, q) => (q.r < p.r ? q : p)), HI = TEN.reduce((p, q) => (q.r > p.r ? q : p));
const H = harvest(SEEDS.harvest), HW = H.at(-1), HR = 7324 - HW;

export const LINES = [
  // ---- cold open
  { key: 'o1', who: 'A', gap: 1.0, text: 'Cross a pea plant that has round seeds with one that has wrinkled seeds, and every seed you get is round.' },
  { key: 'x1', who: 'B', gap: 0.3, text: 'So the wrinkles just disappear?' },
  { key: 'o2', who: 'A', text: 'That’s how it looks. But grow those round seeds into plants, and wrinkled seeds come back, about *one in four*.' },
  { key: 'o3', who: 'B', text: 'A friar counted thousands of them in a monastery garden, and out of his counts came the first rules of genetics.' },
  { key: 'o4', who: 'A', gap: 0.6, text: 'This is the story of *Gregor Mendel’s peas*, and of numbers that some called too good to be true.' },
  // ---- 1 the monastery garden
  { key: 'g1', who: 'B', gap: 4.2, chapter: 'The monastery garden', text: 'Mendel was a friar at St Thomas’s Abbey in Brno, which was called Brünn back then, in the Austrian Empire.', say: 'Mendel was a friar at Saint Thomas’s Abbey in Brno, which was called Brünn back then, in the Austrian Empire.' },
  { key: 'g2', who: 'A', text: 'From 1856 to 1863, he used the abbey’s garden to cross pea plants and follow their offspring.', say: 'From eighteen fifty-six to eighteen sixty-three, he used the abbey’s garden to cross pea plants and follow their offspring.' },
  { key: 'x3', who: 'B', gap: 0.3, text: 'Why peas, of all plants?' },
  { key: 'g3', who: 'A', text: 'Pea flowers fertilise themselves in the bud, so to cross two plants, Mendel opened a young bud and pulled out its stamens.' },
  { key: 'g4', who: 'B', text: 'And then he dusted it with pollen from another plant.' },
  { key: 'x4', who: 'A', text: 'He called that somewhat laborious, but almost always successful.' },
  { key: 'g5', who: 'B', text: 'He tested 34 varieties, kept 22 that bred true, and picked *seven traits*, each with two clear forms.' },
  { key: 'g6', who: 'A', text: 'Seeds were round or wrinkled, and yellow or green. Seed coats were grey or white, with violet or white flowers.' },
  { key: 'g7', who: 'B', text: 'Pods were inflated or pinched, green or yellow. Flowers grew along the stem or at the tip, and stems were tall or short.' },
  { key: 'x5', who: 'A', text: 'He chose them that way on purpose. Traits that came in degrees, more or less, he left out.' },
  { key: 'g9', who: 'B', text: 'And he counted. Over those years, he grew and tested some *28,000 plants*, most of them peas.' },
  // ---- 2 three to one
  { key: 'r1', who: 'B', gap: 4.2, chapter: 'Three to one', text: 'Take seed shape. Mendel crossed plants with round seeds and plants with wrinkled ones.' },
  { key: 'r2', who: 'A', text: 'The shape shows in the seed itself, so he saw the answer that same year. Every seed was *round*.' },
  { key: 'r3', who: 'A', text: 'He coined the words for it. Round was *dominant*, and wrinkled, which had vanished, was ~recessive~.' },
  { key: 'r4', who: 'B', text: 'The next year, he sowed those hybrid seeds and let the plants fertilise themselves.' },
  { key: 'r5', who: 'A', text: 'And in their pods, wrinkled seeds were back, often right next to round ones, with nothing in between.' },
  { key: 'x8', who: 'B', gap: 0.3, text: 'So the wrinkle skipped a generation. Where was it hiding?' },
  { key: 'r6', who: 'A', text: 'First, he counted. From 253 hybrid plants, he got 7,324 seeds.', say: 'First, he counted. From two hundred and fifty-three hybrid plants, he got seven thousand, three hundred and twenty-four seeds.' },
  { key: 'x40', who: 'B', text: 'And 5,474 of them were round, and 1,850 wrinkled.' },
  { key: 'r7', who: 'A', text: 'That’s *2.96* round seeds for every wrinkled one, which is close to three to one.', say: 'That’s two point nine six round seeds for every wrinkled one, which is close to three to one.' },
  { key: 'r8', who: 'B', text: 'He did the same for all seven traits, and each one landed near three to one, from 2.82 to 3.15.' },
  { key: 'x9', who: 'A', gap: 0.3, text: 'Seven different traits, and the same ratio every time?' },
  { key: 'r9', who: 'B', text: 'Near enough. All seven together gave 14,949 dominant to 5,010 recessive, which is *2.98 to 1*.', say: 'Near enough. All seven together gave 14,949 dominant to 5,010 recessive, which is 2.98 to one.' },
  { key: 'r10', who: 'A', gap: 0.8, text: 'So why three to one? And how can a trait vanish for a generation, then come back unchanged?' },
  // ---- 3 two copies
  { key: 'c1', who: 'B', gap: 4.2, chapter: 'Two copies', text: 'Mendel’s answer, in today’s words, is that each plant carries two copies of a gene for seed shape, one from each parent.' },
  { key: 'c2', who: 'A', text: 'Let’s write the round version as *R*, and the wrinkled one as ~r~.', say: 'Let’s write the round version as a capital R, and the wrinkled one as a small r.' },
  { key: 'c4', who: 'B', text: 'A hybrid gets R from one parent and r from the other, and one R is enough to make the seed round.', say: 'A hybrid gets a capital R from one parent and a small r from the other, and one capital R is enough to make the seed round.' },
  { key: 'x11', who: 'A', gap: 0.3, text: 'And the r? Is it gone?', say: 'And the small r? Is it gone?' },
  { key: 'c5', who: 'B', text: 'Not at all. That’s dominance. The r stays hidden, and it can still be passed on.', say: 'Not at all. That’s dominance. The small r stays hidden, and it can still be passed on.' },
  { key: 'c6', who: 'A', text: 'Each pollen grain and egg cell gets just one copy, so a hybrid’s are half R and half r.', say: 'Each pollen grain and egg cell gets just one copy, so a hybrid’s are half capital R and half small r.' },
  { key: 'c7', who: 'B', text: 'And which pollen meets which egg is, in Mendel’s own words, “a matter of chance”.', say: 'And which pollen meets which egg is, in Mendel’s own words, a matter of chance.' },
  { key: 'x12', who: 'A', text: 'Like tossing two coins, one for the pollen and one for the egg.' },
  { key: 'c8', who: 'B', text: 'Mendel wrote out the four equally likely meetings as fractions, the pollen over the egg cell.' },
  { key: 'c9', who: 'A', text: 'And only r over r, one in four, makes a wrinkled seed.', say: 'And only small r over small r, one in four, makes a wrinkled seed.' },
  { key: 'x13', who: 'B', gap: 0.3, text: 'The other three hold an R, so they’re round.', say: 'The other three hold a capital R, so they’re round.' },
  { key: 'c10', who: 'A', text: 'Today the same bookkeeping is drawn as a square, which Reginald Punnett devised decades later.' },
  { key: 'c11', who: 'B', text: 'It predicts *one pure round, two hybrids and one pure wrinkled*, in every four.' },
  { key: 'c12', who: 'A', gap: 0.8, text: 'Which means two round seeds in three should be hybrids, still hiding an r. And Mendel tested that.', say: 'Which means two round seeds in three should be hybrids, still hiding a small r. And Mendel tested that.' },
  { key: 'x14', who: 'B', gap: 0.3, text: 'How do you test for something you can’t see?' },
  { key: 'x15', who: 'A', text: 'You grow the seed, and look at the seeds its plant makes.' },
  { key: 'c13', who: 'B', text: 'Of 565 plants grown from round seeds, 372 made both kinds of seed, and 193 made only round ones.' },
  { key: 'c14', who: 'A', text: `That’s *${r2(372 / 193)}* to 1, close to the two to one he predicted.`, say: `That’s ${dec(372 / 193)} to one, close to the two to one he predicted.` },
  // ---- 4 two traits at once
  { key: 'd1', who: 'A', gap: 4.2, chapter: 'Two traits at once', text: 'Next, Mendel crossed plants that differed in two traits, round yellow seeds with wrinkled green ones.' },
  { key: 'd2', who: 'A', text: 'The hybrids were all round and yellow. From 15 of them, he harvested 556 seeds, in four kinds.', say: 'The hybrids were all round and yellow. From fifteen of them, he harvested five hundred and fifty-six seeds, in four kinds.' },
  { key: 'd3', who: 'B', text: 'There were 315 round yellow seeds, 101 wrinkled yellow, 108 round green, and 32 wrinkled green.' },
  { key: 'x17', who: 'A', text: 'And two of those kinds are new. Round green and wrinkled yellow don’t look like either original parent.' },
  { key: 'd4', who: 'B', text: 'If the two traits are inherited separately, three quarters of the seeds are round, and three quarters of those are yellow.' },
  { key: 'd5', who: 'A', text: 'That makes nine sixteenths round and yellow, and the four kinds come in *nine, three, three and one*.' },
  { key: 'd6', who: 'B', text: 'For 556 seeds, that predicts about 313 round yellow and 35 wrinkled green, with 104 of each mixed kind.' },
  { key: 'x18', who: 'A', gap: 0.3, text: 'And he got 315 and 32. That’s close.', say: 'And he got three hundred and fifteen, and thirty-two. That’s close.' },
  { key: 'd7', who: 'B', text: 'So seed shape and seed colour had sorted *independently*.' },
  { key: 'd8', who: 'A', text: 'With three traits, he found 27 kinds, and he bred all 128 pure combinations of the seven.', say: 'With three traits, he found twenty-seven kinds, and he bred all one hundred and twenty-eight pure combinations of the seven.' },
  // ---- 5 forgotten and found
  { key: 'h1', who: 'B', gap: 4.2, chapter: 'Forgotten and found', text: 'Mendel presented all of this to the Natural History Society of Brno, at two meetings in February and March 1865.' },
  { key: 'h2', who: 'A', text: 'About forty people listened, and his paper came out in the society’s journal in 1866.', say: 'About forty people listened, and his paper came out in the society’s journal in eighteen sixty-six.' },
  { key: 'x20', who: 'B', gap: 0.3, text: 'And then, the famous silence?' },
  { key: 'h3', who: 'A', text: 'Not total silence. But it was read as a paper on hybrids, and cited only about three times in 35 years.', say: 'Not total silence. But it was read as a paper on hybrids, and cited only about three times in thirty-five years.' },
  { key: 'h5', who: 'B', text: 'Even Mendel seems to have thought his rules held only for some kinds of plants.' },
  { key: 'h6', who: 'A', text: 'His hawkweed crosses didn’t fit, since many hawkweeds, it turned out, make most of their seeds without fertilisation.' },
  { key: 'h7', who: 'B', text: 'Then he became abbot, and his duties largely ended his science. He died in 1884.' },
  { key: 'h8', who: 'A', gap: 0.8, text: 'In the spring of 1900, three plant scientists in three countries published within about two months, all pointing back to Mendel.', say: 'In the spring of nineteen hundred, three plant scientists in three countries published within about two months, all pointing back to Mendel.' },
  { key: 'h9', who: 'B', text: 'They were Hugo de Vries in the Netherlands, Carl Correns in Germany, and Erich von Tschermak in Austria.', say: 'They were Hugo de Vries in the Netherlands, Carl Correns in Germany, and Erich von Chermak in Austria.' },
  { key: 'x22', who: 'A', gap: 0.3, text: 'Three at once, after 34 years. Was that a coincidence?', say: 'Three at once, after thirty-four years. Was that a coincidence?' },
  { key: 'x23', who: 'B', text: 'Not entirely. Botanists were already hunting for a theory of inheritance without blending.' },
  { key: 'h10', who: 'A', text: 'Historians now doubt that Tschermak understood Mendel’s laws, and how much de Vries owed to Mendel is still debated.', say: 'Historians now doubt that Chermak understood Mendel’s laws, and how much de Vries owed to Mendel is still debated.' },
  { key: 'h11', who: 'B', text: 'And in England, William Bateson championed the work so hard he was called *Mendel’s bulldog*. He named the new science *genetics*.' },
  // ---- 6 chance in every pod
  { key: 'p1', who: 'A', gap: 4.2, chapter: 'Chance in every pod', text: 'Three to one is an average, though. Plant by plant, Mendel’s counts wandered.' },
  { key: 'p2', who: 'B', text: 'His first ten plants for seed shape gave 45 to 12, then 27 to 8, then 24 to 7.' },
  { key: 'p3', who: 'A', text: 'One gave 19 to 10, under two to one. And another, he noted, gave 43 to 2.', say: 'One gave nineteen to ten, under two to one. And another, he noted, gave forty-three to two.' },
  { key: 'x24', who: 'B', gap: 0.3, text: 'If that were your only plant, you’d never guess three to one.' },
  { key: 'p4', who: 'A', text: 'Small counts swing widely, because chance decides which pollen meets which egg.' },
  { key: 'p5', who: 'B', gap: 0.8, text: 'So let’s have chance do the same. For every seed, we pick R or r for the pollen, and again for the egg.', say: 'So let’s have chance do the same. For every seed, we pick capital R or small r for the pollen, and again for the egg.' },
  { key: 'p6', who: 'B', text: 'Here are ten imaginary plants, with the same numbers of seeds as Mendel’s first ten.' },
  { key: 'p7', who: 'A', text: `And they scatter just like his, from ${LO.a} to ${LO.b} on one plant to ${HI.a} to ${HI.b} on another.`, say: `And they scatter just like his, from ${words(LO.a)} to ${words(LO.b)} on one plant, to ${words(HI.a)} to ${words(HI.b)} on another.` },
  { key: 'p8', who: 'B', text: 'Now let’s keep going, seed after seed.' },
  { key: 'p9', who: 'B', text: `After 40 seeds, the ratio stands at ${Math.round((40 - H[39]) / H[39])} to 1. After 400, it has fallen to ${r2((400 - H[399]) / H[399])} to 1.`, say: `After 40 seeds, the ratio stands at ${Math.round((40 - H[39]) / H[39])} to one. After 400, it has fallen to ${r2((400 - H[399]) / H[399])} to one.` },
  { key: 'p10', who: 'A', text: `And by 7,324 seeds, as many as Mendel counted, it has settled at *${r2(HR / HW)} to 1*.`, say: `And by seven thousand, three hundred and twenty-four seeds, as many as Mendel counted, it has settled at ${dec(HR / HW)} to one.` },
  { key: 'p11', who: 'B', text: 'Mendel put it this way. “The larger their number is, the more mere chance effects are eliminated.”', say: 'Mendel put it this way. The larger their number is, the more mere chance effects are eliminated.' },
  // ---- 7 too good to be true?
  { key: 'f1', who: 'B', gap: 4.2, chapter: 'Too good to be true?', text: 'In 1936, the statistician Ronald Fisher tested how well Mendel’s numbers fit.' },
  { key: 'f2', who: 'A', text: 'Real counts miss a prediction by chance. Mendel’s, Fisher argued, missed by too little.' },
  { key: 'x29', who: 'B', gap: 0.3, text: 'Too little? How can data be too good?' },
  { key: 'x30', who: 'A', text: 'Chance always leaves some scatter. Counts that hug the prediction every time are strange in their own way.' },
  { key: 'f3', who: 'B', text: 'Against 1,000 gardens run by chance alone, only 50 come as close to three to one as Mendel’s seven totals.' },
  { key: 'f4', who: 'A', text: 'That’s about one garden in twenty. Lucky, but not shocking.' },
  { key: 'f5', who: 'B', text: 'Fisher’s point was that the luck kept repeating.' },
  { key: 'f6', who: 'A', text: 'His sharpest point was a test in which Mendel grew ten offspring of each plant.' },
  { key: 'x31', who: 'B', gap: 0.3, text: 'That was to tell the pure plants from the hybrids, right?' },
  { key: 'f7', who: 'A', text: 'Yes, but a hybrid’s ten can all look dominant by chance, so he should have found about 1.7, not 2.', say: 'Yes, but a hybrid’s ten can all look dominant by chance, so he should have found about one point seven, not two.' },
  { key: 'f8', who: 'B', text: 'And he reported 399 hybrids to 201 pure, almost exactly two to one.' },
  { key: 'f9', who: 'A', text: 'Fisher concluded that most of the data had been falsified, perhaps by an assistant “who knew too well what was expected”.', say: 'Fisher concluded that most of the data had been falsified, perhaps by an assistant who knew too well what was expected.' },
  { key: 'x32', who: 'B', text: 'That’s a heavy charge, made more than fifty years after Mendel died.' },
  { key: 'f10', who: 'A', gap: 0.8, text: 'Daniel Hartl and Daniel Fairbanks replied that Mendel probably grew more than ten, and that the fraud charge could be put to rest.' },
  { key: 'f11', who: 'B', text: 'Their 2008 book with others, “Ending the Mendel–Fisher Controversy”, found no reason to think he made up results.', say: 'Their 2008 book with others, called Ending the Mendel Fisher Controversy, found no reason to think he made up results.' },
  { key: 'f12', who: 'B', text: 'Yet one of its own authors, A. W. F. Edwards, still found too little scatter in 84 of Mendel’s ratios.', say: 'Yet one of its own authors, A W F Edwards, still found too little scatter in 84 of Mendel’s ratios.' },
  { key: 'f13', who: 'A', text: '“One can applaud the lucky gambler,” he wrote, “but when he is lucky again tomorrow, and the next day, and the following day,', say: 'One can applaud the lucky gambler, he wrote, but when he is lucky again tomorrow, and the next day, and the following day,' },
  { key: 'f14', who: 'A', gap: 0.2, text: 'one is entitled to become a little suspicious.”', say: 'one is entitled to become a little suspicious.' },
  { key: 'x33', who: 'B', text: 'So the book meant to end the controversy didn’t quite end it.' },
  { key: 'f15', who: 'A', text: 'Then a 2019 reanalysis, adding the extreme plants Mendel himself reported, found about as much scatter as chance predicts.', say: 'Then a twenty nineteen reanalysis, adding the extreme plants Mendel himself reported, found about as much scatter as chance predicts.' },
  { key: 'f16', who: 'B', text: 'And Mendel also said he left out some small experiments that strayed.' },
  { key: 'f17', who: 'B', gap: 0.8, text: 'So the open question is how he chose, counted and reported his peas, not whether he grew them.' },
  // ---- 8 what the wrinkle is
  { key: 'w1', who: 'A', gap: 4.2, chapter: 'What the wrinkle is', text: 'Mendel never knew what his factors were made of. For the wrinkled seed, the answer came in 1990.', say: 'Mendel never knew what his factors were made of. For the wrinkled seed, the answer came in nineteen ninety.' },
  { key: 'w2', who: 'B', text: 'Wrinkled seeds lack one form of an enzyme that builds starch, *starch-branching enzyme 1*.', say: 'Wrinkled seeds lack one form of an enzyme that builds starch, called starch-branching enzyme one.' },
  { key: 'w3', who: 'A', text: 'In wrinkled peas, its gene is interrupted by an extra stretch of DNA, about *800 letters* long.', say: 'In wrinkled peas, its gene is interrupted by an extra stretch of DNA, about eight hundred letters long.' },
  { key: 'w4', who: 'B', text: 'And the intruder looks like a jumping gene known from maize.' },
  { key: 'w5', who: 'B', text: 'Without the enzyme, the young seed makes less starch and keeps more sugar, which draws in extra water.' },
  { key: 'x36', who: 'A', gap: 0.3, text: 'So a wrinkled seed starts out swollen?' },
  { key: 'w6', who: 'B', text: 'Yes, and then, as the ripe seed dries out, it ends up *wrinkled*.' },
  { key: 'w7', who: 'A', text: 'One working copy of the gene makes the enzyme, so the seed stays round. That’s dominance, in chemistry.' },
  { key: 'x37', who: 'B', gap: 0.3, text: 'So dominant just means one good copy is enough.' },
  { key: 'w8', who: 'A', text: 'It was the first of Mendel’s seven genes to be found, and by 2025, all seven had been identified.', say: 'It was the first of Mendel’s seven genes to be found, and by twenty twenty-five, all seven had been identified.' },
  // ---- 9 counting chance
  { key: 'z1', who: 'A', gap: 4.2, chapter: 'Counting chance', text: 'So here is what the peas were saying. Every plant carries two copies of each gene, one from each parent.' },
  { key: 'z2', who: 'B', text: 'Each pollen grain and each egg cell gets one of them, by chance.' },
  { key: 'z3', who: 'A', text: 'A recessive copy can hide for a generation, and shows again when two hidden copies meet, *one time in four*.' },
  { key: 'z4', who: 'B', text: 'None of this shows in a single pod. It appears only when someone counts thousands.' },
  { key: 'x38', who: 'A', text: 'Which is why the counting mattered as much as the crossing.' },
  { key: 'z5', who: 'B', text: 'His counts waited 34 years to be understood, and then they became the first rules of genetics.' },
  { key: 'z6', who: 'A', gap: 0.8, text: 'All from a friar, a garden, and a careful count of peas.' },
];

export const HOLD = { o4: 1.4, g9: 0.6, r9: 0.8, c11: 0.6, c14: 0.4, d6: 0.6, d8: 0.6, h7: 0.6, p7: 0.6, p10: 1.4, f3: 0.6, f8: 0.6, w6: 0.6, z6: 9 };
