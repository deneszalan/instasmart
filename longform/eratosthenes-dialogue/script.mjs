// "Eratosthenes: measuring the Earth with a shadow", the dialogue version. Two narrators talk it through:
// A (male, m1; am_michael stands in while writing) and B (af_bella). It shares the monologue's scene
// (../eratosthenes/scene.js), so every monologue key appears here, in order, on a line with the same beat;
// new lines in between are x1, x2, ... Numbers: A's `say` in words (cloned voice); B may use digits.
// Facts and sources: see ../eratosthenes/script.mjs. Added remarks rest on the same sources:
//  x6  Aristotle: the stars' change "could only happen on a curved surface" (Wikipedia, "Spherical Earth").
//  x21 Cleomedes' date range, mid-1st century BC to AD 400: more than four centuries ("Cleomedes").
//  x24 150 to 210 metres is a spread of 40% (computed). x28 7.1 vs 7.2 degrees (computed from coordinates).
//  x30 Columbus underestimated the distance west to Asia ("Earth's circumference", "Christopher Columbus").

export const LINES = [
  // ---- cold open
  { key: 'o1', who: 'A', gap: 1.0, text: 'Around 240 BC, a scholar in Egypt worked out the size of the *whole Earth*.', say: 'Around two hundred and forty BC, a scholar in Egypt worked out the size of the whole Earth.' },
  { key: 'x1', who: 'B', gap: 0.3, text: 'Without ever going round it?' },
  { key: 'o2', who: 'A', text: 'He didn’t need to. He used a ~shadow~, a ~distance~ and one idea from geometry.' },
  { key: 'o3', who: 'B', text: 'And his answer was about *250,000 stadia*.' },
  { key: 'o4', who: 'A', gap: 0.7, text: 'Which sounds precise. But even today, we can’t say exactly how close he came.' },
  { key: 'o5', who: 'B', text: 'So this is the story of *Eratosthenes*, and of a number we still argue about.' },

  // ---- 1 the librarian
  { key: 'l1', who: 'B', gap: 4.2, chapter: 'The librarian', text: 'Eratosthenes was born around 276 BC in Cyrene, a Greek city in what’s now Libya.' },
  { key: 'l2', who: 'A', text: 'He studied in Athens for years. Then the king of Egypt, Ptolemy the Third, called him to Alexandria.' },
  { key: 'l3', who: 'B', text: 'To run the *Library of Alexandria*, one of the largest libraries of the ancient world.' },
  { key: 'x2', who: 'A', gap: 0.3, text: 'Quite a job offer.' },
  { key: 'l4', who: 'A', text: 'And the post came with another duty: tutor to the future king.' },
  { key: 'l5', who: 'B', text: 'He wrote about mathematics, geography, poetry, history and the stars.' },
  { key: 'l6', who: 'A', text: 'His admirers called him *Pentathlos*, like an athlete who competes in five events.' },
  { key: 'l7', who: 'B', text: 'And his critics called him ~Beta~: second best at everything.' },
  { key: 'x3', who: 'A', gap: 0.3, text: 'Second best at everything is still quite something.' },
  { key: 'l8', who: 'B', gap: 0.8, text: 'One thing he didn’t have to prove was that the Earth is round.' },
  { key: 'x4', who: 'A', gap: 0.3, text: 'They already knew that?' },
  { key: 'l9', who: 'B', text: 'For a century or so. Aristotle had pointed to the Earth’s round shadow on the Moon during an eclipse.' },
  { key: 'l10', who: 'A', text: 'And he noted that some stars seen in Egypt can’t be seen from further north.' },
  { key: 'x5', who: 'B', text: 'Which only works if the ground curves between the two places.' },
  { key: 'l11', who: 'A', text: 'Aristotle even reported a size for the Earth: *400,000 stadia*.', say: 'Aristotle even reported a size for the Earth: four hundred thousand stadia.' },
  { key: 'l12', who: 'B', text: 'Eratosthenes found a way to actually measure it.' },

  // ---- 2 noon at Syene
  { key: 'm1', who: 'A', gap: 4.2, chapter: 'Noon at Syene', text: 'Far up the Nile, on Egypt’s southern frontier, lay the town of *Syene*. Today it’s Aswan.' },
  { key: 'm2', who: 'B', text: 'And Syene was known for something that happened there once a year.' },
  { key: 'm3', who: 'A', text: 'At noon on the summer solstice, the longest day of the year, upright sticks there cast ~no shadow~.' },
  { key: 'x6', who: 'B', gap: 0.3, text: 'None at all?' },
  { key: 'm4', who: 'A', text: 'None. Later writers also tell of a well there, where the noon sunlight reached all the way down to the water.' },
  { key: 'm5', who: 'B', text: 'Because the Sun was standing straight overhead.' },
  { key: 'm6', who: 'A', text: 'Syene was taken to lie on the *Tropic of Cancer*, the furthest north the Sun can ever be overhead.' },
  { key: 'm7', who: 'B', gap: 0.8, text: 'But at *Alexandria*, on the coast, about 5,000 stadia further north, sticks still cast shadows at that noon.' },
  { key: 'x7', who: 'A', text: 'And that difference is the whole clue.' },
  { key: 'm8', who: 'A', text: 'If the Earth were flat, and the Sun far away, sticks in both places would cast the same shadow.' },
  { key: 'm9', who: 'B', text: 'They don’t. So the ground between them has to ~curve~.' },
  { key: 'm10', who: 'A', text: 'And how much it curves over that distance tells you the size of the whole Earth.' },
  { key: 'x8', who: 'B', text: 'So he needs two numbers: how different the shadows are, and how far apart the cities are.' },

  // ---- 3 the bowl at Alexandria
  { key: 'b1', who: 'B', gap: 4.2, chapter: 'The bowl at Alexandria', text: 'So how big was the shadow at Alexandria?' },
  { key: 'b2', who: 'A', text: 'According to Cleomedes, it was read on a *scaphe*: a sundial shaped like a bowl.' },
  { key: 'x9', who: 'B', gap: 0.3, text: 'A bowl, not just a stick in the ground?' },
  { key: 'b3', who: 'A', text: 'A bowl. A pointer stands at the bottom, and its tip sits right at the centre of the bowl’s curve.' },
  { key: 'b4', who: 'B', text: 'So at noon, the tip’s shadow falls on the inside of the bowl.' },
  { key: 'b5', who: 'A', text: 'The arc from the foot of the pointer to the end of the shadow measures how far the Sun is from overhead.' },
  { key: 'x10', who: 'B', text: 'That’s neat. The bowl turns the shadow straight into a piece of a circle.' },
  { key: 'b6', who: 'B', gap: 0.8, text: 'And at Alexandria, that arc was *one fiftieth* of a full circle.' },
  { key: 'b7', who: 'A', text: 'In degrees, that’s ~7.2°~.', say: 'In degrees, that’s seven point two.' },
  { key: 'b8', who: 'B', text: 'That’s small. A stick would cast a noon shadow only about one eighth as long as itself.' },
  { key: 'b9', who: 'A', text: 'And at Syene, at the same noon, the shadow was nothing at all.' },

  // ---- 4 parallel rays
  { key: 'p1', who: 'A', gap: 4.2, chapter: 'Parallel rays', text: 'Now for the key idea. The Sun is so far away that its rays arrive almost *parallel*.' },
  { key: 'p2', who: 'B', text: 'Let’s draw the Earth, with Syene at the top and Alexandria a little way round.' },
  { key: 'p3', who: 'A', text: 'At Syene, a ray comes straight down the stick. Extend that stick downwards, and it reaches the Earth’s centre.' },
  { key: 'p4', who: 'B', text: 'At Alexandria, extend the stick too. It also points to the centre.' },
  { key: 'p5', who: 'A', text: 'And there, the ray meets the stick at *7.2°*.', say: 'And there, the ray meets the stick at seven point two degrees.' },
  { key: 'p6', who: 'B', text: 'Now the Alexandria stick line crosses two parallel lines: the ray at Alexandria, and the ray down the Syene stick.' },
  { key: 'x11', who: 'A', gap: 0.3, text: 'That’s the Z shape.' },
  { key: 'p7', who: 'A', text: 'When a line crosses two parallel lines, the ~alternate angles~ are equal.' },
  { key: 'p8', who: 'B', text: 'So the angle at the centre of the Earth, between the two cities, is also *7.2°*.', say: 'So the angle at the centre of the Earth, between the two cities, is also 7.2 degrees.' },
  { key: 'x12', who: 'A', gap: 0.3, text: 'So the shadow in Alexandria is really measuring the curve of the Earth.' },
  { key: 'p9', who: 'A', text: 'Syene and Alexandria are *one fiftieth* of the way round the Earth.' },
  { key: 'x13', who: 'B', gap: 0.8, text: 'But is the Sun really far enough away for that?' },
  { key: 'p10', who: 'A', text: 'Easily. Between those two cities, the rays differ by less than a thousandth of a degree.' },

  // ---- 5 five thousand stadia
  { key: 'f1', who: 'B', gap: 4.2, chapter: 'Five thousand stadia', text: 'Now he needed the distance between the two cities.' },
  { key: 'f2', who: 'A', text: 'Cleomedes gives it as *5,000 stadia*.', say: 'Cleomedes gives it as five thousand stadia.' },
  { key: 'f3', who: 'B', text: 'And how was that measured?' },
  { key: 'x14', who: 'A', gap: 0.3, text: 'Honestly, we don’t really know.' },
  { key: 'f4', who: 'B', text: 'Egypt did have *bematists*: professional pacers who measured land for farming and for taxes.' },
  { key: 'f5', who: 'A', text: 'And some historians think his distance came from their surveys.' },
  { key: 'f6', who: 'B', text: 'A Latin writer, some 650 years later, says royal surveyors measured it.' },
  { key: 'x15', who: 'A', gap: 0.3, text: 'Six hundred and fifty years later. That’s a long way from a first-hand account.', say: 'Six hundred and fifty years later. That’s a long way from a first-hand account.' },
  { key: 'f7', who: 'A', gap: 0.8, text: 'Either way: if 5,000 stadia is one fiftieth of the way round, the whole way round is fifty times as far.', say: 'Either way: if five thousand stadia is one fiftieth of the way round, the whole way round is fifty times as far.' },
  { key: 'f8', who: 'B', text: 'Fifty times 5,000: *250,000 stadia*.' },
  { key: 'f9', who: 'A', text: 'A shadow, a distance, and the size of the whole Earth.' },

  // ---- 6 second-hand
  { key: 'c1', who: 'B', gap: 4.2, chapter: 'Second-hand', text: 'That’s the story as it’s usually told. But where does it actually come from?' },
  { key: 'c2', who: 'A', text: 'Eratosthenes wrote it up in a book, *On the Measure of the Earth*. And the book is lost.' },
  { key: 'x16', who: 'B', gap: 0.3, text: 'So we’re relying on someone else’s account.' },
  { key: 'c3', who: 'A', text: 'Mostly on *Cleomedes*, who wrote a basic astronomy textbook.' },
  { key: 'c4', who: 'B', text: 'And nobody knows when he wrote it: somewhere between the first century BC and about AD 400.' },
  { key: 'x17', who: 'A', gap: 0.3, text: 'That’s a window of more than four centuries.' },
  { key: 'c5', who: 'A', text: 'And Cleomedes says himself that his version is ~simplified~.' },
  { key: 'c6', who: 'B', text: 'His account talks about sundials, not a well. The well comes from other writers, like the geographer Strabo.' },
  { key: 'x18', who: 'A', text: 'So the most famous detail isn’t even in our main source.' },
  { key: 'c7', who: 'B', gap: 0.8, text: 'And there’s a second number.' },
  { key: 'c8', who: 'A', text: 'The Roman writer Pliny the Elder gives Eratosthenes’ result as *252,000 stadia*.', say: 'The Roman writer Pliny the Elder gives Eratosthenes’ result as two hundred and fifty-two thousand stadia.' },
  { key: 'c9', who: 'B', text: 'Why the extra 2,000? Historians disagree.' },
  { key: 'c10', who: 'A', text: '252,000 divides evenly by every whole number from one to ten. 250,000 doesn’t.', say: 'Two hundred and fifty-two thousand divides evenly by every whole number from one to ten. Two hundred and fifty thousand doesn’t.' },
  { key: 'c11', who: 'B', text: 'And split into 360 degrees, it gives a neat *700 stadia* for each one.' },
  { key: 'c12', who: 'A', text: 'So some think he adjusted his figure, to make calculations easier.' },
  { key: 'c13', who: 'B', text: 'Others think he defined a stadion of his own, from the size of the Earth, as Pliny’s wording suggests.' },
  { key: 'x19', who: 'A', text: 'Which would make the unit itself part of the puzzle.' },

  // ---- 7 how long is a stadion?
  { key: 's1', who: 'A', gap: 4.2, chapter: 'How long is a stadion?', text: 'So how good was his answer? To check, we need his stadia in kilometres.' },
  { key: 's2', who: 'B', text: 'A stadion was 600 feet. But a foot wasn’t the same everywhere in the Greek world.' },
  { key: 's3', who: 'A', text: 'Historians’ estimates for the stadion run from about 150 to 210 metres.', say: 'Historians’ estimates for the stadion run from about a hundred and fifty to two hundred and ten metres.' },
  { key: 'x20', who: 'B', gap: 0.3, text: 'That’s a spread of 40%.' },
  { key: 's4', who: 'B', text: 'And the real distance round the Earth, through the poles, is about *40,008 kilometres*.' },
  { key: 's5', who: 'A', gap: 0.8, text: 'So here’s what that range of stadia does to his 250,000.', say: 'So here’s what that range of stadia does to his two hundred and fifty thousand.' },
  { key: 's6', who: 'B', text: 'With a stadion of about 176 metres, he’s about ~10% too big~.' },
  { key: 's7', who: 'A', text: 'With about 185 metres, he’s about ~15% too big~.', say: 'With about a hundred and eighty-five metres, he’s about fifteen percent too big.' },
  { key: 's8', who: 'B', text: 'But take Pliny’s 252,000 and a short stadion, 155 to 160 metres, and he’s within *2.4%*.' },
  { key: 'x21', who: 'A', gap: 0.3, text: 'So is the short stadion the right one?' },
  { key: 's9', who: 'B', text: 'One study found about 157.7 metres from ancient distances, but critics say it’s full of errors.' },
  { key: 's10', who: 'A', text: 'So the famous claim that he was within 2% depends on choosing a short stadion.', say: 'So the famous claim that he was within two percent depends on choosing a short stadion.' },
  { key: 'x22', who: 'B', text: 'That’s a lot to hang on one unit.' },
  { key: 's11', who: 'A', gap: 0.8, text: 'But the method itself is sound: measure the angle and the distance accurately, and it gives Earth’s true size.' },

  // ---- 8 the simplifications
  { key: 'a1', who: 'B', gap: 4.2, chapter: 'The simplifications', text: 'Cleomedes’ version also rests on a few simplifications. Let’s check them.' },
  { key: 'a2', who: 'A', text: 'First, parallel rays. That one holds very well, as we’ve seen.' },
  { key: 'a3', who: 'B', text: 'Second, that Syene sits exactly on the *Tropic of Cancer*.' },
  { key: 'a4', who: 'A', text: 'In fact it’s a little north of it, by less than a degree. Even there, the noon Sun wasn’t quite overhead.' },
  { key: 'x23', who: 'B', gap: 0.3, text: 'So “no shadow” was only nearly true.' },
  { key: 'a5', who: 'B', text: 'And the tropic drifts, too. In Eratosthenes’ time it lay about 0.3 degrees further north than today.' },
  { key: 'a6', who: 'A', gap: 0.8, text: 'Third, that Syene lies due south of Alexandria, on the same *meridian*.' },
  { key: 'a7', who: 'B', text: 'In fact it’s about ~3 degrees~ of longitude further east.' },
  { key: 'a8', who: 'A', text: 'And the Earth isn’t a perfect sphere: it’s slightly flattened, by about 0.3%.', say: 'And the Earth isn’t a perfect sphere: it’s slightly flattened, by about three tenths of a percent.' },
  { key: 'a9', who: 'B', gap: 0.8, text: 'Still, the angle came out well. The two cities’ latitudes really differ by about *7.1°*.', say: 'Still, the angle came out well. The two cities’ latitudes really differ by about 7.1 degrees.' },
  { key: 'x24', who: 'A', gap: 0.3, text: 'Against his 7.2. That’s close.', say: 'Against his seven point two. That’s close.' },
  { key: 'a10', who: 'A', text: 'What we can’t check is the distance, because we don’t know his stadion.' },

  // ---- 9 the rest of his work
  { key: 'w1', who: 'B', gap: 4.2, chapter: 'The rest of his work', text: 'Measuring the Earth was only part of what he did.' },
  { key: 'w2', who: 'A', text: 'In his *Geographica*, he mapped the known world on a grid of parallels and meridians.' },
  { key: 'w3', who: 'B', text: 'It named more than 400 cities with their locations, and it gave us the word *geography*.' },
  { key: 'w4', who: 'A', text: 'He also measured the tilt of the Earth’s axis, and worked out dates in history back to the fall of Troy.' },
  { key: 'w5', who: 'B', gap: 0.8, text: 'And his name lives on in mathematics, in the *sieve of Eratosthenes*.' },
  { key: 'x25', who: 'A', gap: 0.3, text: 'The way of finding prime numbers?' },
  { key: 'w6', who: 'B', text: 'Write out the numbers. Cross out the multiples of 2, then of 3, then of 5, then of 7.' },
  { key: 'w7', who: 'A', text: 'And what’s left are the ~prime numbers~.' },
  { key: 'w8', who: 'B', text: 'Though our earliest record of the sieve was written centuries later, and he may have named it rather than invented it.' },
  { key: 'w9', who: 'A', gap: 0.8, text: 'Later writers used smaller figures for the Earth. Ptolemy’s *Geography* used just *180,000 stadia*.', say: 'Later writers used smaller figures for the Earth. Ptolemy’s Geography used just a hundred and eighty thousand stadia.' },
  { key: 'w10', who: 'B', text: 'And some seventeen centuries after Eratosthenes, Columbus read his work, but chose to believe in an Earth about a quarter smaller.' },
  { key: 'x26', who: 'A', text: 'And a smaller Earth made the voyage west to Asia look shorter.' },

  // ---- the whole idea
  { key: 'z1', who: 'B', gap: 1.6, text: 'So let’s put the whole idea in one picture.' },
  { key: 'z2', who: 'A', text: 'No shadow at Syene. A shadow of *one fiftieth* of a circle at Alexandria.' },
  { key: 'z3', who: 'B', text: 'Parallel rays carry that angle to the centre of the Earth.' },
  { key: 'z4', who: 'A', text: 'Fifty times *5,000 stadia*: *250,000 stadia* round.', say: 'Fifty times five thousand stadia: two hundred and fifty thousand stadia round.' },
  { key: 'z5', who: 'B', text: 'How close was he? That depends on a unit we still can’t pin down.' },
  { key: 'z6', who: 'A', text: 'But the idea was right, and it measured the whole Earth from two cities in Egypt.' },
  { key: 'x27', who: 'B', gap: 0.6, text: 'With a stick, a bowl and a good argument.' },
  { key: 'z7', who: 'A', gap: 0.8, text: 'Not bad for a man his critics called ~Beta~.' },
];

export const HOLD = { o5: 3.4, m3: 1.0, b7: 0.6, p9: 1.2, f8: 2.2, c10: 1.0, s8: 0.8, w7: 1.6, z7: 9.0 };
