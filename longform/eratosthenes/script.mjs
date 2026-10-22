// "Eratosthenes: measuring the Earth with a shadow", a long-form explainer (16:9).
// The narration, one line per caption. `say` is what the voice reads when it differs (numbers in words, for the
// cloned narrator m1). `gap` is the pause before a line; chapter openings get a longer one for their title card.
//
// Facts and sources (Wikipedia unless noted; every number on screen is computed in scene.js from these):
//  - "Earth's circumference" (History > Eratosthenes): around 240 BC (per Cleomedes); his book On the Measure of the
//    Earth is lost; Cleomedes' simplified version (Caelestia i.7.49-52); 5,000 stadia Syene-Alexandria; Syene assumed
//    on the Tropic of Cancer (really north of it by less than a degree) and on Alexandria's meridian (really about
//    3 degrees of longitude east); 1/50 of a circle, 250,000 stadia; Pliny gives 252,000, which divides by every
//    number 1-10 (Rawlins: a change to simplify calculation; Russo: a new stadion "according to Eratosthenes'
//    ratio"); bematists surveyed Egypt for agriculture and taxation (Russo); Martianus Capella VI.598 on royal
//    surveyors (mensores regii); Olympic stade 176.4 m -> +10%, Italian 184.8 m -> +15% (Walkup); 155-160 m with
//    252,000 -> -2.4% to +0.8% (Russo); Firsov's 157.7 m "plagued by calculation errors and false assumptions"
//    (Engels 1985); 2012 repeat with modern data: 40,074 km; polar circumference 40,007.863 km; flattening ~0.3%;
//    Posidonius' 180,000 (Strabo) used by Ptolemy; Columbus chose to believe in an Earth 25% smaller.
//  - "Eratosthenes": born c. 276 BC in Cyrene; Athens; summoned by Ptolemy III to head the Library; the post made
//    him royal tutor to the future Ptolemy IV; nicknames Pentathlos and Beta (Suda); coined "geography";
//    Geographika mapped the known world with parallels and meridians and recorded over 400 cities; obliquity of the
//    ecliptic; chronology back to the fall of Troy (1184 BC); the sieve (Waschkies: he may only have named it).
//  - "Cleomedes": wrote a basic astronomy textbook, some time between the mid-1st century BC and AD 400; the
//    original source of the story. Cleomedes, The Heavens, tr. T. L. Heath, Greek Astronomy (1932), via Cohen &
//    Drabkin: the bowl of the sundial (scaphe), the arc one-fiftieth of its circle, parallel rays, 250,000 stades.
//    The passage mentions sundials, not the well.
//  - Strabo, Geography 17.1.48 (tr. H. L. Jones, LacusCurtius): the well at Syene marks the summer tropic; gnomons
//    cast no shadow at midday; the Sun's rays reach the water in wells.
//  - "Scaphe": a hemispherical bowl with a gnomon whose tip is level with the rim. "Gnomon".
//  - "Bematist": step-measurers in Greece and Egypt. "Stadion (unit)": 600 feet; estimates 150-210 m.
//  - "Spherical Earth": Aristotle's round shadow on the Moon, stars seen in Egypt but not further north, and his
//    reported 400,000 stadia. "Aswan" (24 05' 20" N, 32 53' 59" E; frontier town facing the south),
//    "Alexandria" (31 11' 51" N, 29 53' 33" E), "Tropic of Cancer" (drifting south; 23.44 deg today) and the
//    obliquity in Eratosthenes' time (23 43' 40", "Eratosthenes"). "Astronomical unit" (149,597,870.7 km).
//  - "Sieve of Eratosthenes": earliest reference in Nicomachus (early 2nd century AD).
//  - "Library of Alexandria" ("one of the largest and most significant libraries of the ancient world").
//  - "Pliny the Elder" (AD 23/24-79). "Christopher Columbus" (Earth about 75% of Eratosthenes' figure).

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Around 240 BC, a scholar in Egypt worked out the size of the *whole Earth*.', say: 'Around two hundred and forty BC, a scholar in Egypt worked out the size of the whole Earth.' },
  { key: 'o2', text: 'He didn’t travel round it. He used a ~shadow~, a ~distance~ and one idea from geometry.' },
  { key: 'o3', text: 'His answer: about *250,000 stadia*.', say: 'His answer was about two hundred and fifty thousand stadia.' },
  { key: 'o4', gap: 0.7, text: 'And even today, we can’t say exactly how close he came.' },
  { key: 'o5', text: 'This is the story of *Eratosthenes*, and of a number we still argue about.' },

  // ---- 1 the librarian
  { key: 'l1', gap: 4.2, chapter: 'The librarian', text: 'Eratosthenes was born around 276 BC in Cyrene, a Greek city in what is now Libya.', say: 'Eratosthenes was born around two hundred and seventy-six BC in Cyrene, a Greek city in what is now Libya.' },
  { key: 'l2', text: 'He studied in Athens for years. Then the king of Egypt, Ptolemy the Third, called him to Alexandria.' },
  { key: 'l3', text: 'There he was put in charge of the *Library of Alexandria*, one of the largest libraries of the ancient world.' },
  { key: 'l4', text: 'The post also made him tutor to the future king.' },
  { key: 'l5', text: 'He wrote about mathematics, geography, poetry, history and the stars.' },
  { key: 'l6', text: 'Admirers called him *Pentathlos*, like an athlete who competes in five events.' },
  { key: 'l7', text: 'Critics called him ~Beta~: second best at everything.' },
  { key: 'l8', gap: 0.8, text: 'One thing he didn’t need to prove was that the Earth is round.' },
  { key: 'l9', text: 'About a century earlier, Aristotle had pointed to the Earth’s round shadow on the Moon during an eclipse.' },
  { key: 'l10', text: 'And he noted that some stars seen in Egypt can’t be seen from further north.' },
  { key: 'l11', text: 'Aristotle even reported a size for the Earth: *400,000 stadia*.', say: 'Aristotle even reported a size for the Earth: four hundred thousand stadia.' },
  { key: 'l12', text: 'Eratosthenes found a way to measure it.' },

  // ---- 2 noon at Syene
  { key: 'm1', gap: 4.2, chapter: 'Noon at Syene', text: 'Far up the Nile, on Egypt’s southern frontier, lay the town of *Syene*. Today it’s Aswan.' },
  { key: 'm2', text: 'Syene was known for something that happened there once a year.' },
  { key: 'm3', text: 'At noon on the summer solstice, the longest day of the year, upright sticks cast ~no shadow~.' },
  { key: 'm4', text: 'Later writers also tell of a well at Syene, where the noon sunlight reached all the way down to the water.' },
  { key: 'm5', text: 'The Sun was standing straight overhead.' },
  { key: 'm6', text: 'Syene was taken to lie on the *Tropic of Cancer*, the furthest north the Sun can ever be overhead.' },
  { key: 'm7', gap: 0.8, text: 'But at *Alexandria*, on the coast, about 5,000 stadia further north, sticks still cast shadows at that noon.', say: 'But at Alexandria, on the coast, about five thousand stadia further north, sticks still cast shadows at that noon.' },
  { key: 'm8', text: 'If the Earth were flat, and the Sun far away, sticks in both places would cast the same shadow.' },
  { key: 'm9', text: 'They don’t. So the ground between them must ~curve~.' },
  { key: 'm10', text: 'And how much it curves over that distance tells you the size of the whole Earth.' },

  // ---- 3 the bowl at Alexandria
  { key: 'b1', gap: 4.2, chapter: 'The bowl at Alexandria', text: 'So how big was the shadow at Alexandria?' },
  { key: 'b2', text: 'According to Cleomedes, the shadow was read on a *scaphe*: a sundial shaped like a bowl.', say: 'According to Cleomedes, the shadow was read on a scaphe: a sundial shaped like a bowl.' },
  { key: 'b3', text: 'A pointer stands at the bottom, and its tip sits at the centre of the bowl’s curve.' },
  { key: 'b4', text: 'At noon, the tip’s shadow falls on the inside of the bowl.' },
  { key: 'b5', text: 'The arc from the foot of the pointer to the end of the shadow measures how far the Sun is from overhead.' },
  { key: 'b6', gap: 0.8, text: 'At Alexandria, that arc was *one fiftieth* of a full circle.' },
  { key: 'b7', text: 'In degrees, that’s ~7.2°~.', say: 'In degrees, that’s seven point two.' },
  { key: 'b8', text: 'It’s a small angle: a stick casts a noon shadow only about one eighth as long as itself.' },
  { key: 'b9', text: 'At Syene, at the same noon, the shadow was nothing at all.' },

  // ---- 4 parallel rays
  { key: 'p1', gap: 4.2, chapter: 'Parallel rays', text: 'Now the key idea. The Sun is so far away that its rays arrive almost *parallel*.' },
  { key: 'p2', text: 'Draw the Earth, with Syene at the top and Alexandria a little way round.' },
  { key: 'p3', text: 'At Syene, a ray comes straight down the stick. Extend that stick downwards, and it reaches the Earth’s centre.' },
  { key: 'p4', text: 'At Alexandria, extend the stick too. It also points to the centre.' },
  { key: 'p5', text: 'There, the ray meets the stick at *7.2°*.', say: 'There, the ray meets the stick at seven point two degrees.' },
  { key: 'p6', text: 'The Alexandria stick line crosses two parallel lines: the ray at Alexandria, and the ray down the stick at Syene.' },
  { key: 'p7', text: 'When a line crosses two parallel lines, the ~alternate angles~ are equal.' },
  { key: 'p8', text: 'So the angle at the centre of the Earth, between the two cities, is also *7.2°*.', say: 'So the angle at the centre of the Earth, between the two cities, is also seven point two degrees.' },
  { key: 'p9', text: 'Syene and Alexandria are *one fiftieth* of the way round the Earth.' },
  { key: 'p10', gap: 0.8, text: 'And how parallel are the rays? Between those cities, they differ by less than a thousandth of a degree.' },

  // ---- 5 five thousand stadia
  { key: 'f1', gap: 4.2, chapter: 'Five thousand stadia', text: 'Now he needed the distance between the two cities.' },
  { key: 'f2', text: 'Cleomedes gives it as *5,000 stadia*.', say: 'Cleomedes gives it as five thousand stadia.' },
  { key: 'f3', text: 'How was it measured? We don’t really know.' },
  { key: 'f4', text: 'Egypt had *bematists*: professional pacers who measured land for farming and for taxes.', say: 'Egypt had bematists: professional pacers who measured land for farming and for taxes.' },
  { key: 'f5', text: 'Some historians think his distance came from their surveys.' },
  { key: 'f6', text: 'A Latin writer, some 650 years later, says royal surveyors measured it.', say: 'A Latin writer, some six hundred and fifty years later, says royal surveyors measured it.' },
  { key: 'f7', gap: 0.8, text: 'Either way: if 5,000 stadia is one fiftieth of the way round, the whole way round is fifty times as far.', say: 'Either way: if five thousand stadia is one fiftieth of the way round, the whole way round is fifty times as far.' },
  { key: 'f8', text: 'Fifty times 5,000: *250,000 stadia*.', say: 'Fifty times five thousand is two hundred and fifty thousand stadia.' },
  { key: 'f9', text: 'A shadow, a distance, and the size of the whole Earth.' },

  // ---- 6 second-hand
  { key: 'c1', gap: 4.2, chapter: 'Second-hand', text: 'That’s the story as it’s usually told. But where does it come from?' },
  { key: 'c2', text: 'Eratosthenes wrote it up in a book, *On the Measure of the Earth*. The book is lost.' },
  { key: 'c3', text: 'Our main account comes from *Cleomedes*, who wrote a basic astronomy textbook.' },
  { key: 'c4', text: 'Nobody knows when he wrote it: somewhere between the first century BC and about AD 400.', say: 'Nobody knows when he wrote it: somewhere between the first century BC and about four hundred AD.' },
  { key: 'c5', text: 'And Cleomedes says himself that his version is ~simplified~.' },
  { key: 'c6', text: 'His account talks about sundials, not the well. The well comes from other writers, like the geographer Strabo.' },
  { key: 'c7', gap: 0.8, text: 'There’s even a second number.' },
  { key: 'c8', text: 'The Roman writer Pliny the Elder gives Eratosthenes’ result as *252,000 stadia*.', say: 'The Roman writer Pliny the Elder gives Eratosthenes’ result as two hundred and fifty-two thousand stadia.' },
  { key: 'c9', text: 'Why the extra 2,000? Historians disagree.', say: 'Why the extra two thousand? Historians disagree.' },
  { key: 'c10', text: '252,000 divides evenly by every whole number from one to ten. 250,000 doesn’t.', say: 'Two hundred and fifty-two thousand divides evenly by every whole number from one to ten. Two hundred and fifty thousand doesn’t.' },
  { key: 'c11', text: 'Split into 360 degrees, it gives a neat *700 stadia* for each one.', say: 'Split into three hundred and sixty degrees, it gives a neat seven hundred stadia for each one.' },
  { key: 'c12', text: 'Some think he adjusted his figure to make calculations easier.' },
  { key: 'c13', text: 'Others think he defined a stadion of his own, from the size of the Earth, as Pliny’s wording suggests.' },

  // ---- 7 how long is a stadion?
  { key: 's1', gap: 4.2, chapter: 'How long is a stadion?', text: 'So how good was his answer? To check, we need his stadia in kilometres.' },
  { key: 's2', text: 'A stadion was 600 feet. But a foot wasn’t the same everywhere in the Greek world.', say: 'A stadion was six hundred feet. But a foot wasn’t the same everywhere in the Greek world.' },
  { key: 's3', text: 'Historians’ estimates for the stadion run from about 150 to 210 metres.', say: 'Historians’ estimates for the stadion run from about a hundred and fifty to two hundred and ten metres.' },
  { key: 's4', text: 'The real distance round the Earth, through the poles, is about *40,008 kilometres*.', say: 'The real distance round the Earth, through the poles, is about forty thousand and eight kilometres.' },
  { key: 's5', gap: 0.8, text: 'Here’s what that range of stadia does to his 250,000.', say: 'Here’s what that range of stadia does to his two hundred and fifty thousand.' },
  { key: 's6', text: 'With a stadion of about 176 metres, he’s about ~10% too big~.', say: 'With a stadion of about a hundred and seventy-six metres, he’s about ten percent too big.' },
  { key: 's7', text: 'With about 185 metres, he’s about ~15% too big~.', say: 'With about a hundred and eighty-five metres, he’s about fifteen percent too big.' },
  { key: 's8', text: 'But take Pliny’s 252,000 and a short stadion, 155 to 160 metres, and he’s within *2.4%*.', say: 'But take Pliny’s two hundred and fifty-two thousand and a short stadion, a hundred and fifty-five to a hundred and sixty metres, and he’s within two point four percent.' },
  { key: 's9', text: 'One study found about 157.7 metres from ancient distances, but critics say it’s full of errors.', say: 'One study found about a hundred and fifty-seven point seven metres from ancient distances, but critics say it’s full of errors.' },
  { key: 's10', text: 'So the famous claim that he was within 2% depends on choosing a short stadion.', say: 'So the famous claim that he was within two percent depends on choosing a short stadion.' },
  { key: 's11', gap: 0.8, text: 'The method itself holds up. Repeated in 2012 with modern data, it gave *40,074 kilometres*.', say: 'The method itself holds up. Repeated in twenty twelve with modern data, it gave forty thousand and seventy-four kilometres.' },

  // ---- 8 the simplifications
  { key: 'a1', gap: 4.2, chapter: 'The simplifications', text: 'Cleomedes’ version also rests on simplifications. Let’s check them.' },
  { key: 'a2', text: 'First, parallel rays. That one holds very well, as we’ve seen.' },
  { key: 'a3', text: 'Second, that Syene sits exactly on the *Tropic of Cancer*.' },
  { key: 'a4', text: 'In fact it’s a little north of it, by less than a degree. Even there, the noon Sun wasn’t quite overhead.' },
  { key: 'a5', text: 'The tropic drifts, too. In Eratosthenes’ time it lay about 0.3 degrees further north than today.', say: 'The tropic drifts, too. In Eratosthenes’ time it lay about three tenths of a degree further north than today.' },
  { key: 'a6', gap: 0.8, text: 'Third, that Syene lies due south of Alexandria, on the same *meridian*.' },
  { key: 'a7', text: 'In fact it’s about ~3 degrees~ of longitude further east.', say: 'In fact it’s about three degrees of longitude further east.' },
  { key: 'a8', text: 'And the Earth isn’t a perfect sphere: it’s slightly flattened, by about 0.3%.', say: 'And the Earth isn’t a perfect sphere: it’s slightly flattened, by about three tenths of a percent.' },
  { key: 'a9', gap: 0.8, text: 'Still, the angle came out well. The two cities’ latitudes really differ by about *7.1°*.', say: 'Still, the angle came out well. The two cities’ latitudes really differ by about seven point one degrees.' },
  { key: 'a10', text: 'What we can’t check is the distance, because we don’t know his stadion.' },

  // ---- 9 the rest of his work
  { key: 'w1', gap: 4.2, chapter: 'The rest of his work', text: 'Measuring the Earth was only part of what he did.' },
  { key: 'w2', text: 'In his *Geographica*, he mapped the known world on a grid of parallels and meridians.' },
  { key: 'w3', text: 'It named more than 400 cities with their locations, and it gave us the word *geography*.', say: 'It named more than four hundred cities with their locations, and it gave us the word geography.' },
  { key: 'w4', text: 'He measured the tilt of the Earth’s axis, and worked out dates in history back to the fall of Troy.' },
  { key: 'w5', gap: 0.8, text: 'And his name lives on in mathematics, in the *sieve of Eratosthenes*.' },
  { key: 'w6', text: 'Write out the numbers. Cross out the multiples of 2, then of 3, then of 5, then of 7.', say: 'Write out the numbers. Cross out the multiples of two, then of three, then of five, then of seven.' },
  { key: 'w7', text: 'What’s left are the ~prime numbers~.' },
  { key: 'w8', text: 'Our earliest record of the sieve was written centuries later, and he may have named it rather than invented it.' },
  { key: 'w9', gap: 0.8, text: 'Later writers used smaller figures. Ptolemy’s *Geography*, centuries later, used just *180,000 stadia*.', say: 'Later writers used smaller figures. Ptolemy’s Geography, centuries later, used just a hundred and eighty thousand stadia.' },
  { key: 'w10', text: 'Some seventeen centuries after Eratosthenes, Columbus read his work, but chose to believe in an Earth about a quarter smaller.' },

  // ---- the whole idea
  { key: 'z1', gap: 1.6, text: 'So here’s the whole idea, in one picture.' },
  { key: 'z2', text: 'No shadow at Syene. A shadow of *one fiftieth* of a circle at Alexandria.' },
  { key: 'z3', text: 'Parallel rays carry that angle to the centre of the Earth.' },
  { key: 'z4', text: 'Fifty times *5,000 stadia*: *250,000 stadia* round.', say: 'Fifty times five thousand stadia: two hundred and fifty thousand stadia round.' },
  { key: 'z5', text: 'How close was he? That depends on a unit we still can’t pin down.' },
  { key: 'z6', text: 'But the idea was right, and it measured the whole Earth from two cities in Egypt.' },
  { key: 'z7', gap: 0.8, text: 'Not bad for a man his critics called ~Beta~.' },
];

export const HOLD = { o5: 3.4, m3: 1.0, b7: 0.6, p9: 1.2, f8: 2.2, c10: 1.0, s8: 0.8, w7: 1.6, z7: 9.0 };
