// "Equal areas in equal times": Kepler's second law, a long-form explainer (16:9, about 10 minutes).
// One line per caption. `say` is what the narrator reads (numbers and years in words, for the m1 voice).
// `gap` is the pause before a line; each chapter's first line gets a long one for its title card.
//
// Facts and sources (all read for this script):
// - Wikipedia, "Kepler's laws of planetary motion": the three laws and their wording; published 1609–1621 in
//   Astronomia nova, Harmonice Mundi and Epitome Astronomiae Copernicanae, from Tycho Brahe's data; Kepler
//   "discovered his second law before his first law"; the distance law held only for nearly circular orbits, the
//   area law for every ellipse; the area law took its modern form in the Epitome (1621); third law published
//   1619, and in 1621 applied to Jupiter's four brightest moons; Mars has the highest eccentricity of the planets
//   except Mercury; Copernicus used circles with epicycles and a constant speed; the March→September equinox
//   takes ~186 days and the return ~179; Voltaire (1738) was the first publication to call them "laws", and
//   Robert Small (1804) made up the set of three; Kepler's 1618 table (mean distances and periods of six
//   planets); "I first believed I was dreaming…"; Newton saw the second law follows from any radial force, the
//   others need the inverse square; the second law is equivalent to conservation of angular momentum.
// - Wikipedia, "Johannes Kepler": met Tycho at Benátky on 4 February 1600; Tycho guarded his data; Tycho died
//   24 October 1601 and Kepler was made imperial mathematician two days later; Kepler's model agreed with
//   Tycho's data to within two arcminutes but differed by up to eight at some points; the Sun's motive power
//   weakening with distance; speed inversely proportional to distance; by late 1602, equal areas; about 40
//   failed attempts with ovoids, then the ellipse in late 1604, "too simple"; Astronomia nova delayed to 1609
//   by legal disputes over Tycho's observations, the property of his heirs; third-law epiphany dated 8 March 1618.
// - Wikipedia, "Astronomia nova": the vicarious hypothesis (circle with an equant); "take pity on me, who had to
//   go through with at least seventy repetitions of it"; "This hypothesis, so closely in agreement with the
//   observations, is nevertheless false"; "these eight minutes alone will lead us along a path to the reform of
//   the whole of Astronomy"; adding up distances, the area shortcut; "Ah, what a foolish bird I have been!".
// - Wikipedia, "Tycho Brahe": 1546–1601; Uraniborg on Hven from 1576, funded by Frederick II; last major
//   astronomer before the telescope, naked eye, large quadrants and sextants; accuracy approaching one
//   arcminute; left Denmark in 1597 for Prague and the emperor.
// - Wikipedia, "Minute and second of arc": the full Moon is about 31 arcminutes across.
// - Wikipedia, "Harmonice Mundi": the short title (Harmonices mundi is a common but ungrammatical form); Earth's
//   angular speed seen from the Sun varies by a semitone (16:15), mi to fa; "The Earth sings Mi, Fa, Mi…
//   misery and famine".
// - Wikipedia, "Kepler's equation": M = E − e sin E, derived in chapter 60 of Astronomia nova (1609); no
//   algebraic solution; Kepler's 1621 iterative solution E = M + e sin E.
// - Wikipedia, "Areal velocity": Newton proved in 1684 that a body attracted to a fixed centre sweeps equal areas
//   in equal times; equal to conservation of angular momentum. Wikipedia, "Philosophiæ Naturalis Principia
//   Mathematica": Book 1, Propositions 1–3, the triangle proof; published July 1687.
// - Wikipedia, "Earth's orbit": perihelion around 3 January, aphelion around 4 July; the Northern Hemisphere is
//   coldest when Earth is nearest.
// - NASA Earth and Mars fact sheets (nssdc.gsfc.nasa.gov): Earth e 0.0167, perihelion 147.095, aphelion 152.100
//   million km, speed 30.29 max / 29.29 min / 29.78 mean km/s, longitude of perihelion 102.947°; Mars e 0.0934,
//   26.50 / 21.97 km/s. NASA planetary fact sheet: eccentricities of the planets.
// - Wikipedia, "Halley's Comet": perihelion 0.59 AU, aphelion 35 AU, period about 75 years; on 9 December 2023,
//   at aphelion, 0.91 km/s; next perihelion 2061.
// Computed in the scene (and in research/check.mjs, research/halley.mjs): wedge areas (each 1/12), 4× speed on
// the e = 0.6 diagram, Earth's halves of 186.4 and 178.8 days, Halley ≈ 54 km/s at perihelion (r·v is the
// same at both ends) and only about 2 of its 75 years inside Jupiter's orbit, Kepler's iteration for Mars,
// T² against a³ from Kepler's own 1618 table, Earth's angular-speed ratio 1.069 against 16/15.

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Right now, you are moving around the Sun at about *30 km/s*.', say: 'Right now, you are moving around the Sun at about thirty kilometres a second.' },
  { key: 'o2', text: 'But not at a steady speed: in early January, Earth moves about *1 km/s faster* than in early July.', say: 'But not at a steady speed. In early January, Earth moves about one kilometre a second faster than in early July.' },
  { key: 'o3', text: 'The rule behind that was found more than 400 years ago, in old records of the planet Mars.', say: 'The rule behind that was found more than four hundred years ago, in old records of the planet Mars.' },
  { key: 'o4', text: 'It began with an error of *eight arcminutes*: about a quarter of the width of the Moon.' },
  { key: 'o5', gap: 0.7, text: 'This is the story of Kepler’s second law: *equal areas in equal times*.' },

  // ---- 1 Tycho's sky
  { key: 't1', gap: 4.2, chapter: 'Tycho’s sky', text: 'In the late 1500s, the best measurements of the sky came from a Danish nobleman, *Tycho Brahe*.', say: 'In the late fifteen hundreds, the best measurements of the sky came from a Danish nobleman, Tycho Brahe.' },
  { key: 't2', text: 'From 1576, on the island of Hven, he built *Uraniborg*, an observatory funded by the king.', say: 'From fifteen seventy-six, on the island of Ven, he built Uraniborg, an observatory funded by the king.' },
  { key: 't3', text: 'There were no telescopes yet. Tycho measured by eye, with large quadrants and sextants.' },
  { key: 't4', text: 'His positions came close to *one arcminute*: a sixtieth of a degree.' },
  { key: 't5', text: 'For scale, the full Moon is about 31 arcminutes across.', say: 'For scale, the full Moon is about thirty-one arcminutes across.' },
  { key: 't6', text: 'Year after year, he recorded where the planets were. Mars was among them.' },
  { key: 't7', gap: 0.7, text: 'In 1597 he left Denmark, and soon he was working for the emperor, in Prague.', say: 'In fifteen ninety-seven he left Denmark, and soon he was working for the emperor, in Prague.' },
  { key: 't8', text: 'In February 1600, a 28-year-old mathematician joined him: *Johannes Kepler*.', say: 'In February sixteen hundred, a twenty-eight-year-old mathematician joined him: Johannes Kepler.' },
  { key: 't9', text: 'Tycho guarded his data closely. He set Kepler to work on one planet: ~Mars~.' },
  { key: 't10', text: 'In October 1601, Tycho died after a short illness. Two days later, Kepler took over as imperial mathematician.', say: 'In October sixteen oh one, Tycho died after a short illness. Two days later, Kepler took over as imperial mathematician.' },
  { key: 't11', text: 'Tycho’s heirs owned the observations, which would delay Kepler’s book for years. But he had the Mars data.' },

  // ---- 2 Eight minutes
  { key: 'm1', gap: 4.2, chapter: 'Eight minutes', text: 'Astronomers had long modelled the planets with circles. Even Copernicus, who put the Sun near the middle, used circles.' },
  { key: 'm2', text: 'So Kepler began with a circle too, with the Sun off-centre, and a point from which the motion looks steady.', say: 'So Kepler began with a circle too: with the Sun off centre, and a point from which the motion looks steady.' },
  { key: 'm3', text: 'Fitting it to Tycho’s numbers meant one long calculation, over and over again.' },
  { key: 'm4', text: '“Take pity on me,” he wrote, “who had to go through with at least seventy repetitions of it.”', say: 'Take pity on me, he wrote, who had to go through with at least seventy repetitions of it.' },
  { key: 'm5', gap: 0.7, text: 'The model matched Tycho’s positions of Mars to within *two arcminutes*.' },
  { key: 'm6', text: 'But at other points in the orbit, it missed by up to ~eight~.' },
  { key: 'm7', text: 'Tycho’s data was far too accurate for an error that size to be ignored.' },
  { key: 'm8', text: '“These eight minutes alone,” Kepler wrote, “will lead us along a path to the reform of the whole of Astronomy.”', say: 'These eight minutes alone, Kepler wrote, will lead us along a path to the reform of the whole of astronomy.' },
  { key: 'm9', text: 'Something in his model was wrong: the circle, or the way the planet moved along it.' },

  // ---- 3 A law of areas
  { key: 'a1', gap: 4.2, chapter: 'A law of areas', text: 'Kepler wanted a physical cause. He imagined a force from the Sun, pushing the planets round, weaker with distance.' },
  { key: 'a2', text: 'So, he reasoned, a planet’s speed falls as its distance grows: *twice as far, half as fast*.' },
  { key: 'a3', text: 'To find where the planet would be, he’d have to add up its distance from the Sun all along the way.' },
  { key: 'a4', text: 'By late 1602 he had a shortcut: measure the *area* swept by the line from the Sun.', say: 'By late sixteen oh two he had a shortcut: measure the area swept by the line from the Sun.' },
  { key: 'a5', text: 'Picture each day’s motion as a thin triangle: its height is the distance from the Sun, its base the distance travelled.' },
  { key: 'a6', text: 'If speed falls as distance grows, every day’s triangle has the *same area*.' },
  { key: 'a7', gap: 0.7, text: 'Equal areas in equal times. Oddly, Kepler found this, the second law, before the first.' },
  { key: 'a8', text: 'His speed rule only works for orbits that are nearly circles. The area rule works for every orbit.' },

  // ---- 4 The ellipse
  { key: 'l1', gap: 4.2, chapter: 'The ellipse', text: 'Now he needed the shape. He tried egg-shaped ovals, again and again.' },
  { key: 'l2', text: 'After about forty failed attempts, in late 1604, he tried an *ellipse*.', say: 'After about forty failed attempts, in late sixteen oh four, he tried an ellipse.' },
  { key: 'l3', text: 'He had thought it too simple: surely earlier astronomers wouldn’t have missed it.' },
  { key: 'l4', text: 'It fitted. He’d even had the formula earlier, without seeing it. “Ah, what a foolish bird I have been!”', say: 'It fitted. He had even had the formula earlier, without seeing it. Ah, what a foolish bird I have been!' },
  { key: 'l5', gap: 0.7, text: 'An ellipse has two special points, its *foci*. The Sun sits at one. The other is empty.' },
  { key: 'l6', text: 'That’s Kepler’s first law: a planet’s orbit is an ellipse, with the Sun at one focus.' },
  { key: 'l7', text: 'Mars’s ellipse is barely squashed: it’s less than *half a percent* narrower than it is long.' },
  { key: 'l8', text: 'But the Sun is well off-centre: more than *9%* of the way from the middle to the end.', say: 'But the Sun is well off centre: more than nine percent of the way from the middle to the end.' },
  { key: 'l9', text: 'Of the planets, only Mercury’s orbit is more stretched. Kepler was lucky that his planet was Mars.' },
  { key: 'l10', text: 'In 1609 he published it in a book: *Astronomia nova*, the New Astronomy.', say: 'In sixteen oh nine he published it in a book: Astronomia nova, the New Astronomy.' },

  // ---- 5 Sweeping the areas
  { key: 'k1', gap: 4.2, chapter: 'Sweeping the areas', text: 'So where is a planet on a given day? Kepler turned the area rule into an equation.' },
  { key: 'k2', text: 'Time gives an angle, *M*, that ticks round steadily, like the hand of a clock.', say: 'Time gives an angle, called M, that ticks round steadily, like the hand of a clock.' },
  { key: 'k3', text: 'The planet’s real place is set by another angle, *E*. And the little *e* says how stretched the ellipse is.', say: 'The planet’s real place is set by another angle, called E. And a small letter e says how stretched the ellipse is.' },
  { key: 'k4', text: 'Kepler’s equation: M equals E, minus e times the sine of E.', say: 'This is Kepler’s equation: M equals big E, minus small e times the sine of big E.' },
  { key: 'k5', text: 'No algebra can solve it for E. So in 1621 Kepler suggested guessing, then improving the guess.', say: 'No algebra can solve it for E. So in sixteen twenty-one, Kepler suggested guessing, then improving the guess.' },
  { key: 'k6', text: 'For Mars, start with E equal to M, put each answer back in, and in four rounds the digits stop changing.' },
  { key: 'k7', gap: 0.7, text: 'This animation solves it for every frame. Here’s a stretched orbit, so the effect is easy to see.' },
  { key: 'k8', text: 'Split one trip around into twelve equal stretches of time, and shade the area each one sweeps.' },
  { key: 'k9', text: 'Near the Sun, the wedges are short and fat. Far away, they’re long and thin.' },
  { key: 'k10', text: 'Measure them, and each one is a twelfth of the ellipse: *8.3%*.', say: 'Measure them, and each one is a twelfth of the ellipse: eight point three percent.' },
  { key: 'k11', text: 'But the distance travelled in each stretch is wildly different.' },
  { key: 'k12', text: 'On this orbit, the planet moves *four times faster* at its closest point, *perihelion*, than at *aphelion*, its farthest.' },

  // ---- 6 Fast and slow
  { key: 'f1', gap: 4.2, chapter: 'Fast and slow', text: 'Earth’s orbit is much rounder. But the rule still holds.' },
  { key: 'f2', text: 'Earth passes perihelion around 3 January, *147.1 million km* from the Sun…', say: 'Earth passes perihelion around the third of January, a hundred and forty-seven point one million kilometres from the Sun,' },
  { key: 'f3', text: '…and aphelion around 4 July, at *152.1 million km*.', say: 'and aphelion around the fourth of July, at a hundred and fifty-two point one million kilometres.' },
  { key: 'f4', text: 'So it’s fastest in January, about *30.3 km/s*, and slowest in July, about ~29.3~.', say: 'So it’s fastest in January, at about thirty point three kilometres a second, and slowest in July, at about twenty-nine point three.' },
  { key: 'f5', gap: 0.7, text: 'You can see it on the calendar. From the March equinox to the September one takes about *186 days*.', say: 'You can see it on the calendar. From the March equinox to the September one takes about a hundred and eighty-six days.' },
  { key: 'f6', text: 'The other half of the year takes only about ~179~, because Earth passes perihelion then, moving faster.', say: 'The other half of the year takes only about a hundred and seventy-nine, because Earth passes perihelion then, moving faster.' },
  { key: 'f7', text: 'So in the north, spring and summer together last about a week longer than autumn and winter.' },
  { key: 'f8', text: 'Mars swings more: about *26.5 km/s* near the Sun, and about ~22~ at the far end.', say: 'Mars swings more: about twenty-six and a half kilometres a second near the Sun, and about twenty-two at the far end.' },
  { key: 'f9', gap: 0.7, text: 'Comets show it best. Halley’s Comet dips to about *0.6 AU* from the Sun, then swings out to about *35*.', say: 'Comets show it best. Halley’s Comet dips to about zero point six astronomical units from the Sun, then swings out to about thirty-five.' },
  { key: 'f10', text: 'One AU is Earth’s average distance from the Sun.', say: 'One astronomical unit is Earth’s average distance from the Sun.' },
  { key: 'f11', text: 'At the far end, in December 2023, it was crawling along at just *0.91 km/s*.', say: 'At the far end, in December twenty twenty-three, it was crawling along at just zero point nine one kilometres a second.' },
  { key: 'f12', text: 'At the two ends, speed times distance is the same. So near the Sun, it races along at about *54 km/s*.', say: 'At the two ends, speed times distance is the same. So near the Sun, it races along at about fifty-four kilometres a second.' },
  { key: 'f13', text: 'Of its roughly 75-year orbit, it spends only about two years closer to the Sun than Jupiter. It’s due back in 2061.', say: 'Of its roughly seventy-five-year orbit, it spends only about two years closer to the Sun than Jupiter. It’s due back in twenty sixty-one.' },

  // ---- 7 The harmony of the world
  { key: 'h1', gap: 4.2, chapter: 'The harmony of the world', text: 'Kepler wasn’t done. He wanted a rule that linked all the planets, not just one.' },
  { key: 'h2', text: 'By his own account, the answer came to him on 8 March 1618.', say: 'By his own account, the answer came to him on the eighth of March, sixteen eighteen.' },
  { key: 'h3', text: 'Square a planet’s time to go round. Cube its distance from the Sun. The ratio is the same for every planet.' },
  { key: 'h4', text: 'Jupiter takes 11.86 years to go round. Squared, that’s about *141*.', say: 'Jupiter takes eleven point eight six years to go round. Squared, that’s about a hundred and forty-one.' },
  { key: 'h5', text: 'It’s 5.2 AU from the Sun. Cubed, that’s about *141* again.', say: 'It’s five point two astronomical units from the Sun. Cubed, that’s about a hundred and forty-one again.' },
  { key: 'h6', text: 'With Kepler’s own numbers, all six known planets agree to within about two percent.' },
  { key: 'h7', text: '“I first believed I was dreaming,” he wrote.', say: 'I first believed I was dreaming, he wrote.' },
  { key: 'h8', gap: 0.7, text: 'This third law appeared in 1619, in his book *The Harmony of the World*.', say: 'This third law appeared in sixteen nineteen, in his book The Harmony of the World.' },
  { key: 'h9', text: 'There, Kepler heard music in the orbits. Earth’s turning speed, seen from the Sun, varies by about a *semitone*.' },
  { key: 'h10', text: '“The Earth sings Mi, Fa, Mi,” he wrote: you may hear “misery” and “famine” in the syllables.', say: 'The Earth sings mee, fah, mee, he wrote: you may hear misery and famine in the syllables.' },
  { key: 'h11', text: 'In 1621, his *Epitome* gave the area law its modern form.', say: 'In sixteen twenty-one, his Epitome gave the area law its modern form.' },
  { key: 'h12', text: 'That year he also noted that the third law fits Jupiter’s four bright moons.' },

  // ---- 8 Newton's reason
  { key: 'n1', gap: 4.2, chapter: 'Newton’s reason', text: 'But why should planets obey these rules at all? The answer came from Isaac Newton.' },
  { key: 'n2', text: 'In 1684 he proved that anything pulled toward a fixed centre sweeps out equal areas in equal times.', say: 'In sixteen eighty-four he proved that anything pulled toward a fixed centre sweeps out equal areas in equal times.' },
  { key: 'n3', text: 'His proof, in the *Principia* of 1687, is beautifully simple. Imagine the pull comes in short, sharp tugs.', say: 'His proof, in the Principia of sixteen eighty-seven, is beautifully simple. Imagine the pull comes in short, sharp tugs.' },
  { key: 'n4', text: 'With no pull, the planet goes straight, covering equal distances in equal times.' },
  { key: 'n5', text: 'Each step makes a triangle with the Sun. Same base, same height: *same area*.' },
  { key: 'n6', text: 'Now a tug toward the Sun bends the path. But it pulls only along the line to the Sun.' },
  { key: 'n7', text: 'So the new triangle keeps the same base and the same height as before. *Same area* again.' },
  { key: 'n8', text: 'Make the tugs smaller and more frequent, and the path becomes a smooth orbit. The areas stay equal.' },
  { key: 'n9', gap: 0.7, text: 'Notice what the proof never needed: how strong the pull is. Any pull toward a centre will do.' },
  { key: 'n10', text: 'Today we call this *conservation of angular momentum*.' },
  { key: 'n11', text: 'The ellipse and the third law need more: a pull that weakens with the *square of the distance*, as gravity does.' },

  // ---- 9 Three laws
  { key: 'z1', gap: 4.2, chapter: 'Three laws', text: 'Kepler never called these *laws*. That word first appeared in print in 1738, in a book by Voltaire.', say: 'Kepler never called these laws. That word first appeared in print in seventeen thirty-eight, in a book by Voltaire.' },
  { key: 'z2', text: 'The tidy set of three came later still, in 1804.', say: 'The tidy set of three came later still, in eighteen oh four.' },
  { key: 'z3', text: 'One: a planet’s orbit is an ellipse, with the Sun at one focus.' },
  { key: 'z4', text: 'Two: the line from the Sun sweeps equal areas in equal times.' },
  { key: 'z5', text: 'Three: the period squared goes with the distance cubed.' },
  { key: 'z6', gap: 0.8, text: 'All because Kepler refused to ignore eight arcminutes.' },
  { key: 'z7', text: 'So this January, when it’s coldest in the north, remember: Earth is at its closest to the Sun, and moving fastest.' },
];
export const HOLD = { o4: 0.6, o5: 2.2, t5: 0.6, t6: 1.4, m6: 1.0, m8: 0.8, a6: 1.0, l2: 0.8, l5: 1.2, k6: 1.2, k8: 2.6, k10: 0.8, k12: 0.8, f4: 0.6, f7: 0.6, f12: 1.0, f13: 0.6, h5: 0.6, h10: 0.6, n5: 0.8, n7: 1.2, n8: 1.6, n11: 0.6, z5: 0.6, z7: 9.0 };
