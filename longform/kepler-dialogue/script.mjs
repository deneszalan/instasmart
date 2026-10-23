// "Equal areas in equal times", the dialogue version: two narrators, A (male; m1, stood in for by am_michael) and
// B (af_nicole), talk the story through. It shares kepler/scene.js, so every key of kepler/script.mjs appears here, in
// the same order, on a line that carries the same beat; lines in between have keys x1, x2, ….
// A's `say` writes numbers and years in words (the cloned voice); B's may use digits.
// af_nicole speaks slowly (about 113 words a minute against A's 164), so B's turns are kept short and A carries the
// longer explanations; B still explains many beats.
// Facts and sources: as in kepler/script.mjs (no new claims). Extra lines only react, restate or connect, e.g. Halley's
// 35.14 AU against 0.593 AU and 54 against 0.91 km/s (both about 59 times); Neptune at about 30 AU (NASA planetary fact sheet).

export const LINES = [
  // ---- cold open
  { key: 'o1', who: 'A', gap: 1.0, text: 'Right now, you’re moving around the Sun at about *30 km/s*.', say: 'Right now, you’re moving around the Sun at about thirty kilometres a second.' },
  { key: 'o2', who: 'B', text: 'But not steadily. In January, Earth moves about *1 km/s faster* than in July.', say: 'But not steadily. In January, Earth moves about 1 kilometre a second faster than in July.' },
  { key: 'o3', who: 'A', text: 'The rule behind that was found more than 400 years ago, in old records of the planet Mars.', say: 'The rule behind that was found more than four hundred years ago, in old records of the planet Mars.' },
  { key: 'o4', who: 'A', text: 'And it started with an error of *eight arcminutes*: about a quarter of the width of the Moon.' },
  { key: 'x1', who: 'B', gap: 0.3, text: 'A quarter of the Moon? That’s all?' },
  { key: 'o5', who: 'A', gap: 0.7, text: 'That’s all. This is the story of Kepler’s second law: *equal areas in equal times*.' },

  // ---- 1 Tycho's sky
  { key: 't1', who: 'A', gap: 4.2, chapter: 'Tycho’s sky', text: 'In the late 1500s, the best measurements of the sky came from a Danish nobleman, *Tycho Brahe*.', say: 'In the late fifteen hundreds, the best measurements of the sky came from a Danish nobleman, Tycho Brahe.' },
  { key: 't2', who: 'B', text: 'From 1576 he built *Uraniborg*, on the island of Hven, with the king’s money.', say: 'From 1576 he built Uraniborg, on the island of Ven, with the king’s money.' },
  { key: 't3', who: 'A', text: 'No telescopes yet: Tycho measured by eye, with large quadrants and sextants.' },
  { key: 't4', who: 'B', text: 'His positions came close to *one arcminute*: a sixtieth of a degree.' },
  { key: 't5', who: 'B', text: 'For scale, the full Moon is about 31 arcminutes across.' },
  { key: 't6', who: 'A', text: 'Year after year, he recorded where the planets were. Mars was among them.' },
  { key: 't7', who: 'B', gap: 0.7, text: 'In 1597 he left Denmark. Soon he was working for the emperor, in Prague.' },
  { key: 't8', who: 'A', text: 'And in February 1600, a 28-year-old mathematician joined him: *Johannes Kepler*.', say: 'And in February sixteen hundred, a twenty-eight-year-old mathematician joined him: Johannes Kepler.' },
  { key: 't9', who: 'B', text: 'Tycho guarded his data, and gave Kepler one planet: ~Mars~.' },
  { key: 't10', who: 'A', text: 'Then in October 1601, Tycho died after a short illness. Two days later, Kepler took over as imperial mathematician.', say: 'Then in October sixteen oh one, Tycho died after a short illness. Two days later, Kepler took over as imperial mathematician.' },
  { key: 't11', who: 'A', text: 'Tycho’s heirs owned the observations, which would delay Kepler’s book for years. But Kepler had the Mars data.' },

  // ---- 2 Eight minutes
  { key: 'm1', who: 'A', gap: 4.2, chapter: 'Eight minutes', text: 'Now, astronomers had long modelled the planets with circles. Even Copernicus, who put the Sun near the middle, used circles.' },
  { key: 'x2', who: 'B', gap: 0.3, text: 'Circles riding on circles, in his case.' },
  { key: 'm2', who: 'A', text: 'So Kepler began with a circle too, with the Sun off-centre, and a point from which the motion looks steady.', say: 'So Kepler began with a circle too: with the Sun off centre, and a point from which the motion looks steady.' },
  { key: 'x3', who: 'B', text: 'That point is called the equant.' },
  { key: 'm3', who: 'A', text: 'Fitting all that to Tycho’s numbers meant one long calculation, over and over again.' },
  { key: 'm4', who: 'A', text: 'He complained in print: “Take pity on me, who had to go through with at least seventy repetitions of it.”', say: 'He complained in print. Take pity on me, who had to go through with at least seventy repetitions of it.' },
  { key: 'x4', who: 'B', gap: 0.3, text: 'Seventy times, by hand.' },
  { key: 'm5', who: 'B', gap: 0.7, text: 'And it nearly worked: within *two arcminutes* of Tycho’s positions.' },
  { key: 'm6', who: 'A', text: 'But at other points in the orbit, it missed by up to ~eight~.' },
  { key: 'x5', who: 'B', text: 'Couldn’t he call eight close enough?' },
  { key: 'm7', who: 'A', text: 'Not with Tycho’s data. It was far too accurate for an error that size to be ignored.' },
  { key: 'm8', who: 'A', text: 'Kepler wrote: “These eight minutes alone will lead us along a path to the reform of the whole of Astronomy.”', say: 'Kepler wrote: These eight minutes alone will lead us along a path to the reform of the whole of astronomy.' },
  { key: 'x6', who: 'B', gap: 0.8, text: 'Quite a promise, for eight arcminutes.' },
  { key: 'm9', who: 'A', text: 'Something in his model was wrong: the circle, or the way the planet moved along it.' },

  // ---- 3 A law of areas
  { key: 'a1', who: 'A', gap: 4.2, chapter: 'A law of areas', text: 'Kepler wanted a physical cause. He imagined a force from the Sun, pushing the planets round, weaker with distance.' },
  { key: 'a2', who: 'B', text: 'So a planet’s speed would fall as its distance grows: *twice as far, half as fast*.' },
  { key: 'a3', who: 'A', text: 'But to find where the planet would be, he’d have to add up its distance from the Sun all along the way.' },
  { key: 'x7', who: 'B', gap: 0.3, text: 'Every point of the orbit? By hand?' },
  { key: 'a4', who: 'A', text: 'Exactly. So by late 1602 he’d found a shortcut: measure the *area* swept by the line from the Sun.', say: 'Exactly. So by late sixteen oh two, he’d found a shortcut: measure the area swept by the line from the Sun.' },
  { key: 'a5', who: 'A', text: 'Picture each day’s motion as a thin triangle: its height is the distance from the Sun, its base the distance travelled.' },
  { key: 'x8', who: 'B', text: 'Tall and narrow far away, short and wide close in.' },
  { key: 'a6', who: 'A', text: 'And if speed falls as distance grows, every day’s triangle has the *same area*.' },
  { key: 'a7', who: 'A', gap: 0.7, text: 'Equal areas in equal times. And oddly, Kepler found this second law before the first.' },
  { key: 'x9', who: 'B', gap: 0.3, text: 'So the numbers aren’t the order he found them in.' },
  { key: 'a8', who: 'A', text: 'No. And his speed rule only works for orbits that are nearly circles. The area rule works for every orbit.' },

  // ---- 4 The ellipse
  { key: 'l1', who: 'A', gap: 4.2, chapter: 'The ellipse', text: 'Now he needed the shape. He tried egg-shaped ovals, again and again.' },
  { key: 'x10', who: 'B', gap: 0.3, text: 'How many?' },
  { key: 'l2', who: 'A', text: 'About forty failed attempts. Then, in late 1604, he tried an *ellipse*.', say: 'About forty failed attempts. Then, in late sixteen oh four, he tried an ellipse.' },
  { key: 'l3', who: 'B', text: 'He’d thought it too simple for earlier astronomers to have missed.' },
  { key: 'l4', who: 'A', text: 'But it fitted. He’d even had the formula earlier, without seeing it. He wrote: “Ah, what a foolish bird I have been!”', say: 'But it fitted. He had even had the formula earlier, without seeing it. He wrote: Ah, what a foolish bird I have been!' },
  { key: 'l5', who: 'A', gap: 0.7, text: 'An ellipse has two special points, its *foci*. The Sun sits at one. The other is empty.' },
  { key: 'l6', who: 'B', text: 'That’s Kepler’s first law: an ellipse, with the Sun at one focus.' },
  { key: 'l7', who: 'A', text: 'Mars’s ellipse is barely squashed: it’s less than *half a percent* narrower than it is long.' },
  { key: 'l8', who: 'A', text: 'But the Sun is well off-centre: more than *9%* of the way from the middle to the end.', say: 'But the Sun is well off centre: more than nine percent of the way from the middle to the end.' },
  { key: 'l9', who: 'B', text: 'Only Mercury’s orbit is more stretched. Lucky that his planet was Mars.' },
  { key: 'l10', who: 'A', text: 'In 1609 he published it all in a book: *Astronomia nova*, the New Astronomy.', say: 'In sixteen oh nine he published it all in a book: Astronomia nova, the New Astronomy.' },

  // ---- 5 Sweeping the areas
  { key: 'k1', who: 'A', gap: 4.2, chapter: 'Sweeping the areas', text: 'So where is a planet on a given day? Kepler turned the area rule into an equation.' },
  { key: 'k2', who: 'B', text: 'Time gives an angle, *M*, that ticks round steadily, like a clock hand.', say: 'Time gives an angle, called M, that ticks round steadily, like a clock hand.' },
  { key: 'k3', who: 'A', text: 'The planet’s real place is set by another angle, *E*. And the little *e* says how stretched the ellipse is.', say: 'The planet’s real place is set by another angle, called E. And a small letter e says how stretched the ellipse is.' },
  { key: 'k4', who: 'A', text: 'Put together, that’s Kepler’s equation: M equals E, minus e times the sine of E.', say: 'Put together, that’s Kepler’s equation: M equals big E, minus small e times the sine of big E.' },
  { key: 'x11', who: 'B', text: 'And you know M, but you want E.' },
  { key: 'k5', who: 'A', text: 'No algebra can solve it for E. So in 1621, Kepler suggested guessing, then improving the guess.', say: 'No algebra can solve it for E. So in sixteen twenty-one, Kepler suggested guessing, then improving the guess.' },
  { key: 'k6', who: 'A', text: 'For Mars, start with E equal to M, put each answer back in, and within four rounds the digits stop changing.' },
  { key: 'x12', who: 'B', gap: 0.3, text: 'So it’s never exact, just ever closer.' },
  { key: 'k7', who: 'A', gap: 0.7, text: 'Right. This animation does that for every frame. Here’s a stretched orbit, so the effect is easy to see.' },
  { key: 'k8', who: 'B', text: 'Split one trip around into twelve equal times, and shade the area each one sweeps.' },
  { key: 'k9', who: 'A', text: 'Near the Sun, the wedges are short and fat. Far away, they’re long and thin.' },
  { key: 'x13', who: 'B', gap: 0.3, text: 'They look nothing alike.' },
  { key: 'k10', who: 'A', text: 'But measure them, and each one is a twelfth of the ellipse: *8.3%*.', say: 'But measure them, and each one is a twelfth of the ellipse: eight point three percent.' },
  { key: 'k11', who: 'B', text: 'While the distance travelled in each is wildly different.' },
  { key: 'k12', who: 'A', text: 'On this orbit, the planet moves *four times faster* at its closest point, *perihelion*, than at *aphelion*, its farthest.' },

  // ---- 6 Fast and slow
  { key: 'f1', who: 'B', gap: 4.2, chapter: 'Fast and slow', text: 'Earth’s orbit is much rounder. Does the rule still hold?' },
  { key: 'x14', who: 'A', gap: 0.3, text: 'It does, just more gently.' },
  { key: 'f2', who: 'A', text: 'Earth passes perihelion around 3 January, *147.1 million km* from the Sun…', say: 'Earth passes perihelion around the third of January, a hundred and forty-seven point one million kilometres from the Sun,' },
  { key: 'f3', who: 'B', gap: 0.3, text: '…and aphelion around 4 July, at *152.1 million km*.', say: 'and aphelion around the 4th of July, at 152.1 million kilometres.' },
  { key: 'f4', who: 'A', text: 'So it’s fastest in January, about *30.3 km/s*, and slowest in July, about ~29.3~.', say: 'So it’s fastest in January, at about thirty point three kilometres a second, and slowest in July, at about twenty-nine point three.' },
  { key: 'f5', who: 'B', gap: 0.7, text: 'But it shows on the calendar: March equinox to September takes about *186 days*.' },
  { key: 'f6', who: 'A', text: 'And the other half of the year takes only about ~179~, because Earth passes perihelion then, moving faster.', say: 'And the other half of the year takes only about a hundred and seventy-nine, because Earth passes perihelion then, moving faster.' },
  { key: 'f7', who: 'A', text: 'So in the north, spring and summer together last about a week longer than autumn and winter.' },
  { key: 'f8', who: 'B', text: 'Mars swings more: *26.5 km/s* near the Sun, ~22~ at the far end.', say: 'Mars swings more: 26.5 kilometres a second near the Sun, 22 at the far end.' },
  { key: 'f9', who: 'A', gap: 0.7, text: 'Comets show it best. Halley’s Comet dips to about *0.6 AU* from the Sun, then out to about *35*.', say: 'Comets show it best. Halley’s Comet dips to about zero point six astronomical units from the Sun, then out to about thirty-five.' },
  { key: 'f10', who: 'B', text: 'One AU being Earth’s average distance from the Sun.', say: 'One astronomical unit being Earth’s average distance from the Sun.' },
  { key: 'x15', who: 'A', gap: 0.3, text: 'So out beyond Neptune.' },
  { key: 'f11', who: 'B', text: 'Where, in December 2023, it was crawling along at *0.91 km/s*.', say: 'Where, in December 2023, it was crawling along at 0.91 kilometres a second.' },
  { key: 'f12', who: 'A', text: 'At the two ends, speed times distance is the same. So near the Sun, it races along at about *54 km/s*.', say: 'At the two ends, speed times distance is the same. So near the Sun, it races along at about fifty-four kilometres a second.' },
  { key: 'x16', who: 'B', gap: 0.3, text: 'Fifty-nine times closer, fifty-nine times faster.' },
  { key: 'f13', who: 'A', text: 'Of its roughly 75-year orbit, it spends only about two years closer to the Sun than Jupiter. It’s due back in 2061.', say: 'Of its roughly seventy-five-year orbit, it spends only about two years closer to the Sun than Jupiter. It’s due back in twenty sixty-one.' },

  // ---- 7 The harmony of the world
  { key: 'h1', who: 'A', gap: 4.2, chapter: 'The harmony of the world', text: 'Kepler wasn’t done. He wanted a rule that linked all the planets, not just one.' },
  { key: 'h2', who: 'B', text: 'By his own account, it came to him on 8 March 1618.', say: 'By his own account, it came to him on the 8th of March, 1618.' },
  { key: 'h3', who: 'A', text: 'Square a planet’s time to go round. Cube its distance from the Sun. The ratio is the same for every planet.' },
  { key: 'x17', who: 'B', gap: 0.3, text: 'Try it with Jupiter.' },
  { key: 'h4', who: 'A', text: 'Jupiter takes 11.86 years to go round. Squared, that’s about *141*.', say: 'Jupiter takes eleven point eight six years to go round. Squared, that’s about a hundred and forty-one.' },
  { key: 'h5', who: 'B', text: 'And it’s 5.2 AU out. Cubed: about *141* again.', say: 'And it’s 5.2 astronomical units out. Cubed: about 141 again.' },
  { key: 'h6', who: 'A', text: 'With Kepler’s own numbers, all six known planets agree to within about two percent.' },
  { key: 'h7', who: 'B', text: '“I first believed I was dreaming,” he wrote.', say: 'I first believed I was dreaming, he wrote.' },
  { key: 'x18', who: 'A', gap: 0.8, text: 'After forty failed ovals, you can see why.' },
  { key: 'h8', who: 'B', gap: 0.7, text: 'It’s his third law, in his book of 1619, *The Harmony of the World*.' },
  { key: 'h9', who: 'A', text: 'There, Kepler heard music in the orbits. Earth’s turning speed, seen from the Sun, varies by about a *semitone*.' },
  { key: 'x19', who: 'B', text: 'The step from mi to fa.', say: 'The step from mee to fah.' },
  { key: 'h10', who: 'A', text: '“The Earth sings Mi, Fa, Mi,” he wrote: you may hear “misery” and “famine” in the syllables.', say: 'The Earth sings mee, fah, mee, he wrote: you may hear misery and famine in the syllables.' },
  { key: 'h11', who: 'A', text: 'In 1621, his *Epitome* gave the area law its modern form.', say: 'In sixteen twenty-one, his Epitome gave the area law its modern form.' },
  { key: 'h12', who: 'B', text: 'He also noted that the third law fits Jupiter’s four bright moons.' },

  // ---- 8 Newton's reason
  { key: 'n1', who: 'B', gap: 4.2, chapter: 'Newton’s reason', text: 'So why should planets obey these rules at all?' },
  { key: 'x20', who: 'A', text: 'That’s where Isaac Newton comes in.' },
  { key: 'n2', who: 'A', text: 'In 1684 he proved that anything pulled toward a fixed centre sweeps out equal areas in equal times.', say: 'In sixteen eighty-four he proved that anything pulled toward a fixed centre sweeps out equal areas in equal times.' },
  { key: 'x21', who: 'B', gap: 0.3, text: 'Anything? Not just planets?' },
  { key: 'n3', who: 'A', text: 'Anything. His proof, in the *Principia* of 1687, is beautifully simple. Imagine the pull comes in short, sharp tugs.', say: 'Anything. His proof, in the Principia of sixteen eighty-seven, is beautifully simple. Imagine the pull comes in short, sharp tugs.' },
  { key: 'n4', who: 'B', text: 'With no pull, the planet goes straight, in equal steps.' },
  { key: 'n5', who: 'A', text: 'Each step makes a triangle with the Sun. Same base, same height: *same area*.' },
  { key: 'x22', who: 'B', gap: 0.3, text: 'Equal steps, along one straight line.' },
  { key: 'n6', who: 'A', text: 'Now a tug toward the Sun bends the path. But it pulls only along the line to the Sun.' },
  { key: 'n7', who: 'B', text: 'So the new triangle keeps its base and height. *Same area* again.' },
  { key: 'x23', who: 'A', text: 'They share the base from the Sun to B, and the tug slides c parallel to it, so the height stays put.' },
  { key: 'n8', who: 'B', text: 'Make the tugs small and frequent, and you get a smooth orbit, with equal areas.' },
  { key: 'n9', who: 'A', gap: 0.7, text: 'Notice what the proof never needed: how strong the pull is. Any pull toward a centre will do.' },
  { key: 'x24', who: 'B', text: 'Even one that grows with distance, like this?' },
  { key: 'n10', who: 'A', text: 'Even that. Today we call this *conservation of angular momentum*.' },
  { key: 'n11', who: 'A', text: 'The ellipse and the third law need more: a pull that weakens with the *square of the distance*, as gravity does.' },

  // ---- 9 Three laws
  { key: 'z1', who: 'A', gap: 4.2, chapter: 'Three laws', text: 'Funny thing: Kepler never called these *laws*. The word first appeared in print in 1738, in a book by Voltaire.', say: 'Funny thing: Kepler never called these laws. The word first appeared in print in seventeen thirty-eight, in a book by Voltaire.' },
  { key: 'z2', who: 'B', text: 'And the tidy set of three came in 1804.' },
  { key: 'z3', who: 'A', text: 'So, one: a planet’s orbit is an ellipse, with the Sun at one focus.' },
  { key: 'z4', who: 'B', text: 'Two: equal areas in equal times.' },
  { key: 'z5', who: 'A', text: 'Three: the period squared goes with the distance cubed.' },
  { key: 'z6', who: 'A', gap: 0.8, text: 'All because Kepler refused to ignore eight arcminutes.' },
  { key: 'x25', who: 'B', gap: 0.3, text: 'A quarter of the Moon’s width.' },
  { key: 'z7', who: 'A', text: 'So this January, when it’s coldest in the north, remember: Earth is at its closest to the Sun, and moving fastest.' },
];
export const HOLD = { o4: 0.6, o5: 2.2, t5: 0.6, t6: 1.4, m6: 1.0, m8: 0.8, a6: 1.0, l2: 0.8, l5: 1.2, k6: 1.2, k8: 2.6, k10: 0.8, k12: 0.8, f4: 0.6, f7: 0.6, f12: 1.0, f13: 0.6, h5: 0.6, h10: 0.6, n5: 0.8, n7: 1.2, n8: 1.6, n11: 0.6, z5: 0.6, z7: 9.0 };
