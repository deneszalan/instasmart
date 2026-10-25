// Zeno's paradoxes: Achilles, the tortoise and the infinite. Long-form narration (af_heart), one line per caption.
// `say` is what the voice reads when it differs from the caption. `gap` is the pause before a line (seconds).
//
// Facts and sources (research copies in research/):
// - Wikipedia, "Zeno of Elea": c. 490 – c. 430 BC, from Elea (Velia) in southern Italy (Magna Graecia); student of
//   Parmenides; his writings are lost; Plato, Aristotle, Diogenes Laertius and Simplicius describe his ideas; Aristotle
//   called him the "inventor of dialectic"; reductio ad absurdum; according to Proclus, forty arguments against plurality.
// - Wikipedia, "Parmenides" and "Parmenides (dialogue)": reality one and unchanging, change impossible; in Plato's dialogue
//   Parmenides (65) and Zeno (40) visit Athens and meet a young Socrates; most scholars think the meeting is Plato's invention.
// - IEP, "Zeno's Paradoxes" (B. Dowden, iep.utm.edu/zenos-paradoxes): born about 490, died about 430 BCE in Elea, now Velia;
//   "In total we know of less than two hundred words that can be attributed to Zeno"; the Plato meeting "probably invented";
//   "There is no evidence that Zeno used a tortoise rather than a slow human ... Aristotle spoke simply of 'the runner'";
//   Aristotle, Physics 263b: "If the units are actual, it is not possible: if they are potential, it is possible";
//   Aristotle's treatment "satisfied nearly all scholars for 1,500 years"; Russell held that Achilles completes infinitely
//   many tasks; Thomson (1954) and Benacerraf (1962) on the lamp; "there is no agreement in the philosophical community";
//   Russell: "Zeno's arguments, in some form, have afforded grounds for almost all theories of space and time and infinity
//   which have been constructed from his time to our own."
// - Wikipedia, "Zeno's paradoxes": Physics VI:9 quotations (Achilles 239b15; dichotomy 239b10; arrow 239b5; moving rows,
//   "half a given time is equal to double that time"); "none of the original ancient sources has Zeno discussing any
//   infinite sum"; Simplicius: "it is impossible to traverse an infinite number of things in a finite time"; Diogenes the
//   Cynic stood up and walked (per Simplicius); Aristotle: "Time is not composed of indivisible nows any more than any other
//   magnitude is composed of indivisibles"; Boyer; Cauchy and Weierstrass and limits; Kevin Brown's "foolhardy" quotation;
//   Bergson; Russell's at-at theory; Zhuangzi ch. 33 (Legge): "If from a stick a foot long you every day take the half of
//   it, in a myriad ages it will not be exhausted."
// - SEP, "Zeno's Paradoxes" (N. Huggett): Aristotle divides the time as well as the distance, then (Physics 263a) the
//   potential/actual answer, the runner would have to stop at each point; the catch-up point is not one of the stages;
//   arrow: 0/0 is no number, speed at an instant as a limit, Bergson's "movement is composed of immobilities";
//   stadium: usual verdict a confusion about relative speed, other readings against smallest units of space and time;
//   1 − 1 + 1 − … grouped two ways; "In Cauchy's system 1/2 + 1/4 + … = 1 but 1 − 1 + 1 − … is undefined";
//   quantum theories of gravity may imply space and time are not a continuum.
// - Wikipedia, "Solvitur ambulando" ("it is solved by walking"); "Diogenes" (c. 413/403 – 324/321 BC);
//   "Simplicius of Cilicia" (c. 480 – c. 540 AD).
// - Wikipedia, "Quadrature of the Parabola" and "Archimedes": 3rd century BC; triangles whose areas form a geometric series,
//   1 + 1/4 + 1/16 + … = 4/3; strictly he works with partial sums that come arbitrarily close.
// - Wikipedia, "Series (mathematics)": Cauchy (1821) insisted on strict tests of convergence; "Grandi's series" 1 − 1 + 1 …
//   does not converge. "Limit of a function": Cours d'analyse (1821); "In 1861, Karl Weierstrass first introduced the
//   epsilon-delta definition of limit in the form it is usually written today."
// - Wikipedia, "Thomson's lamp" and "Supertask": 1954; on, 1 minute, off, half a minute, on, …; total exactly two minutes;
//   on or off at two minutes?; related to Grandi's series; Benacerraf: the state at the limit is not determined.
// The race (Achilles 10 m/s, tortoise 1 m/s, 100 m head start) is the short post's example; every distance, time,
// running total and margin below is computed in scene.js from those three numbers.

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Swift-footed Achilles, the greatest of the Greek heroes, is racing a ~tortoise~, and the tortoise has a head start.' },
  { key: 'o2', text: 'Each time Achilles reaches the spot where the tortoise was, it has crept a little further on.' },
  { key: 'o3', text: 'So, says an argument nearly 2,500 years old, he can *never* catch it.' },
  { key: 'o4', gap: 0.8, text: 'Of course, he does catch it.' },
  { key: 'o5', text: 'But saying exactly what’s wrong with the argument took more than 2,000 years, and some philosophers say it still isn’t settled.' },
  { key: 'o6', gap: 0.8, text: 'This is *Zeno’s paradox* of Achilles and the tortoise.' },

  // ---- 1 the man from Elea
  { key: 'e1', gap: 4.2, chapter: 'The man from Elea', text: 'Zeno was born around 490 BC in Elea, a Greek city on the west coast of southern Italy.', say: 'Zeno was born around 490 BC in Ellia, a Greek city on the west coast of southern Italy.' },
  { key: 'e2', text: 'He was a student and friend of an older philosopher, *Parmenides*.' },
  { key: 'e3', text: 'Parmenides taught that reality is one unchanging whole, and that change and motion are illusions.' },
  { key: 'e4', text: 'Critics found that absurd. Zeno replied that *their* views, followed through, led to worse absurdities.' },
  { key: 'e5', text: 'This kind of argument is called *reductio ad absurdum*, and Aristotle called Zeno the inventor of dialectic.' },
  { key: 'e6', gap: 0.8, text: 'Zeno’s book is lost. Fewer than 200 of his own words survive.' },
  { key: 'e7', text: 'We know his arguments from others, such as Plato, Aristotle, and Simplicius, writing a thousand years later.', say: 'We know his arguments from others, such as Plato, Aristotle, and Simplishius, writing a thousand years later.' },
  { key: 'e8', text: 'Plato even has the two visit Athens to meet a young Socrates, though he probably invented that meeting.' },

  // ---- 2 the race
  { key: 'r1', gap: 4.2, chapter: 'The race', text: 'The most famous argument is a race, as Aristotle gives it in his *Physics*.' },
  { key: 'r2', text: '“In a race, the quickest runner can never overtake the slowest, since the pursuer must first reach the point whence the pursued started,”', say: 'In a race, the quickest runner can never overtake the slowest, since the pursuer must first reach the point whence the pursued started,' },
  { key: 'r3', text: '“so that the slower must always hold a lead.”', say: 'so that the slower must always hold a lead.' },
  { key: 'r4', text: 'There’s no tortoise in that version, just the slowest runner. The tortoise comes from later retellings.' },
  { key: 'r5', gap: 0.8, text: 'So let’s race. Achilles runs *10 metres a second*, and the tortoise ~1 metre a second~.' },
  { key: 'r6', text: 'And the tortoise starts ~100 metres~ ahead.' },
  { key: 'r7', text: 'In stage one, Achilles runs those 100 metres, which takes him 10 seconds.' },
  { key: 'r8', text: 'But in those 10 seconds, the tortoise has crawled ~10 metres~ further.' },
  { key: 'r9', text: 'In stage two, Achilles covers those 10 metres in 1 second, and the tortoise crawls another metre.' },
  { key: 'r10', text: 'Stage three leaves a gap of 10 centimetres, and stage four leaves just 1 centimetre.' },
  { key: 'r11', text: 'Each gap is a tenth of the one before. It shrinks forever, but it never reaches *zero*.' },
  { key: 'r12', gap: 0.8, text: 'So there is always one more stage. Achilles, Zeno concludes, never catches up.' },

  // ---- 3 adding up forever
  { key: 'a1', gap: 4.2, chapter: 'Adding up forever', text: 'So how far does Achilles run before he draws level? Let’s add up the stages.' },
  { key: 'a2', text: 'It’s 100 metres, plus 10, plus 1, plus a tenth, plus a hundredth, and so on.' },
  { key: 'a3', text: 'The running totals are 100, then 110, then 111, then 111.1, then 111.11.' },
  { key: 'a4', text: 'They close in on *111 and one ninth* metres, with the ones repeating forever.' },
  { key: 'a5', text: 'The times add up the same way, to 11 and one ninth seconds.' },
  { key: 'a6', gap: 0.8, text: 'Infinitely many stages, but a *finite* distance and a *finite* time.', say: 'That’s infinitely many stages, but they add up to a finite distance, and a finite time.' },
  { key: 'a7', text: 'Plot distance against time, and each runner is a straight line. The lines cross at *11.1 seconds* and *111.1 metres*.' },
  { key: 'a8', text: 'Zeno’s stages are a staircase closing in on that crossing, and every one of them comes *before* it.' },
  { key: 'a9', text: 'The moment Achilles catches up isn’t one of the stages. It comes just after all of them.' },
  { key: 'a10', gap: 0.8, text: 'It’s often said that Zeno thought infinitely many pieces must add up to something infinite.' },
  { key: 'a11', text: 'But no ancient source has Zeno discussing an infinite sum at all.' },
  { key: 'a12', text: 'In Simplicius’s report, his worry is that it is impossible “to traverse an infinite number of things in a finite time.”', say: 'In Simplishius’s report, his worry is that it is impossible to traverse an infinite number of things in a finite time.' },
  { key: 'a13', text: 'So the puzzle isn’t the total. It’s how anyone can *finish* infinitely many steps, with no last one.' },

  // ---- 4 half, then half again
  { key: 'd1', gap: 4.2, chapter: 'Half, then half again', text: 'Zeno’s *dichotomy* makes the same point without a tortoise.' },
  { key: 'd2', text: 'In Aristotle’s words, “that which is in locomotion must arrive at the half-way stage before it arrives at the goal.”', say: 'In Aristotle’s words, that which is in locomotion must arrive at the half-way stage before it arrives at the goal.' },
  { key: 'd3', text: 'So to run 100 metres, first run half of it. Then half of what’s left, then half of that.' },
  { key: 'd4', text: 'The running totals are one half, three quarters, seven eighths, fifteen sixteenths, creeping towards the whole.' },
  { key: 'd5', text: 'After 10 halvings, you’ve run 1,023 parts in 1,024, and less than 10 centimetres is left.' },
  { key: 'd6', text: 'After 20, less than a tenth of a millimetre is left. But there is always a half still to run.' },
  { key: 'd7', gap: 0.8, text: 'There’s a nastier version. Before the half-way mark, you must reach the quarter mark, and before that, the eighth.' },
  { key: 'd8', text: 'Then the run has no *first* step at all. So how does it ever begin?' },
  { key: 'd9', text: 'Aristotle noted that the Achilles is much the same argument. In our race, the gaps shrink by tenths, not halves.' },

  // ---- 5 the arrow and the stadium
  { key: 'w1', gap: 4.2, chapter: 'The arrow and the stadium', text: 'Zeno’s *arrow* attacks motion from the other side, by cutting time into instants.' },
  { key: 'w2', text: 'Take an arrow in flight, and freeze a single instant.' },
  { key: 'w3', text: 'In that instant, it fills a space exactly its own size, so it isn’t moving.' },
  { key: 'w4', text: 'But the whole flight is made of instants like this one. So when does the arrow move?' },
  { key: 'w5', gap: 0.8, text: 'Aristotle replied that time is not made of indivisible nows, any more than a line is made of points.' },
  { key: 'w6', text: 'The modern answer treats speed at an instant as a *limit*.' },
  { key: 'w7', text: 'Say it flies at 50 metres a second. In a tenth of a second, it goes 5 metres.' },
  { key: 'w8', text: 'In a hundredth, it goes half a metre. Distance over time stays at 50 metres a second, however short the interval.' },
  { key: 'w9', text: 'In a single instant it goes nowhere, and zero divided by zero isn’t a number at all.' },
  { key: 'w10', text: 'So the speed at an instant is defined as that *limit*.' },
  { key: 'w11', text: 'On this view, motion doesn’t happen inside an instant. It is being in different places at different times.' },
  { key: 'w12', gap: 0.8, text: 'The last of the four, the *stadium*, has rows of equal blocks passing each other in opposite directions.' },
  { key: 'w13', text: 'The front block of one row passes every oncoming block, but only half of the still ones.' },
  { key: 'w14', text: 'From this, Zeno concluded that half a given time is equal to double that time.' },
  { key: 'w15', text: 'The usual verdict is that he ignored relative speed: the oncoming blocks approach twice as fast.', say: 'The usual verdict is that he ignored relative speed, since the oncoming blocks approach twice as fast.' },

  // ---- 6 Aristotle's answer
  { key: 'p1', gap: 4.2, chapter: 'Aristotle’s answer', text: 'One famous reply to Zeno wasn’t an argument at all.' },
  { key: 'p2', text: 'Simplicius tells a story: when Diogenes the Cynic heard Zeno’s arguments, he said nothing, stood up, and walked.', say: 'Simplishius tells a story. When Diogenes the Cynic heard Zeno’s arguments, he said nothing, stood up, and walked.' },
  { key: 'p3', text: 'That kind of answer has a Latin name, *solvitur ambulando*: it is solved by walking.', say: 'That kind of answer has a Latin name, solvitur ambulando, which means it is solved by walking.' },
  { key: 'p4', text: 'But walking shows only that the conclusion is false. It doesn’t show which step of the argument fails.' },
  { key: 'p5', gap: 0.8, text: 'Aristotle noted that shorter distances take shorter times. But then the time, too, is made of infinitely many pieces.' },
  { key: 'p6', text: 'So his deeper answer splits infinity in two.' },
  { key: 'p7', text: 'An *actual* infinity would be a completed collection of infinitely many things, all there at once.' },
  { key: 'p8', text: 'A ~potential~ infinity is a process that can always go on, but is never completed.' },
  { key: 'p9', text: 'A path, he said, holds infinitely many halves only potentially. They’d be actual only if the runner stopped at each one.' },
  { key: 'p10', text: 'In his words, “if the units are actual, it is not possible: if they are potential, it is possible.”', say: 'In his words, if the units are actual, it is not possible; if they are potential, it is possible.' },
  { key: 'p11', text: 'That answer satisfied nearly all scholars for about 1,500 years.' },

  // ---- 7 sums that settle
  { key: 'm1', gap: 4.2, chapter: 'Sums that settle', text: 'Meanwhile, mathematicians were learning to tame infinite sums.' },
  { key: 'm2', text: 'In the 3rd century BC, Archimedes found the area of a slice cut from a parabola.', say: 'In the third century BC, Archimedes found the area of a slice cut from a parabola.' },
  { key: 'm3', text: 'He filled it with triangles, and each new row of triangles has a quarter of the area of the row before.' },
  { key: 'm4', text: 'So the slice is the big triangle, times 1 plus a quarter plus a sixteenth, and so on.', say: 'So the slice is the big triangle, times one, plus a quarter, plus a sixteenth, and so on.' },
  { key: 'm5', text: 'Archimedes showed that this comes to exactly *four thirds* of the big triangle.' },
  { key: 'm6', gap: 0.8, text: 'But infinite sums can be slippery. Take 1, minus 1, plus 1, minus 1, and so on.', say: 'But infinite sums can be slippery. Take one, minus one, plus one, minus one, and so on.' },
  { key: 'm7', text: 'Pair the terms one way and you get 0. Pair them another way and you get 1.', say: 'Pair the terms one way and you get zero. Pair them another way and you get one.' },
  { key: 'm8', text: 'In 1821, the French mathematician Augustin-Louis Cauchy insisted on strict tests of when an infinite sum makes sense.', say: 'In 1821, the French mathematician Augustin Louis Koh-shee insisted on strict tests of when an infinite sum makes sense.' },
  { key: 'm9', text: 'Its value is the number its running totals settle down to, if they settle at all.' },
  { key: 'm10', text: 'Then a half plus a quarter plus an eighth is exactly *1*, while 1 minus 1 plus 1 has ~no sum~.', say: 'Then a half, plus a quarter, plus an eighth, is exactly one, while one minus one plus one has no sum.' },
  { key: 'm11', text: 'In 1861, Karl Weierstrass gave the definition of a limit in the precise form used today.' },
  { key: 'm12', gap: 0.8, text: 'Pick any margin, however small. From some stage on, every running total stays within it.' },
  { key: 'm13', text: 'For a margin of a millimetre, Achilles’ totals stay inside from stage 6 on. For a micrometre, from stage 9.', say: 'For a margin of a millimetre, Achilles’ totals stay inside it from stage 6 on. For a micrometre, it’s from stage 9.' },
  { key: 'm14', text: 'So 111.1 metres is the *limit* of Zeno’s stages. Some historians, such as Carl Boyer, say calculus solves the paradox.' },

  // ---- 8 solved?
  { key: 'q1', gap: 4.2, chapter: 'Solved?', text: 'Some philosophers disagree. The maths says where and when Achilles draws level, but how does he *finish* infinitely many tasks?' },
  { key: 'q2', text: 'Bertrand Russell argued that Achilles really does complete infinitely many tasks, in a finite time.' },
  { key: 'q3', gap: 0.8, text: 'In 1954, the philosopher James Thomson replied with a ~lamp~.' },
  { key: 'q4', text: 'Switch it on. After a minute, switch it off. After half a minute, on again, then off after a quarter.' },
  { key: 'q5', text: 'Each wait is half the last, and the waits add up to exactly 2 minutes.' },
  { key: 'q6', text: 'At 2 minutes, is the lamp *on* or *off*?' },
  { key: 'q7', text: 'It can’t be on: every time it went on, it was switched off again. And off fails for the same reason.', say: 'It can’t be on, because every time it went on, it was switched off again. And off fails for the same reason.' },
  { key: 'q8', text: 'Thomson concluded that a *supertask*, infinitely many tasks in a finite time, is impossible.' },
  { key: 'q9', text: 'Its switch flips like the running totals of 1 minus 1 plus 1, which never settle.', say: 'Its switch flips like the running totals of one minus one plus one, which never settle.' },
  { key: 'q10', gap: 0.8, text: 'In 1962, Paul Benacerraf objected that the story fixes the lamp before 2 minutes, but says nothing about that moment itself.' },
  { key: 'q11', text: 'So there’s no contradiction, just a question the story leaves open.' },
  { key: 'q12', text: 'Philosophers still disagree about what counts as a task, and whether a supertask is possible.' },
  { key: 'q13', text: 'And some theories of quantum gravity suggest that space and time may not divide endlessly at all.' },
  { key: 'q14', gap: 0.8, text: 'As the philosopher Kevin Brown put it, “it’s probably foolhardy to think we’ve reached the end.”', say: 'As the philosopher Kevin Brown put it, it’s probably foolhardy to think we’ve reached the end.' },

  // ---- 9 the finish line
  { key: 'z1', gap: 4.2, chapter: 'The finish line', text: 'So, back to the race.' },
  { key: 'z2', text: 'Achilles reaches the tortoise’s start after 10 seconds, and draws level after 11.1 seconds, at 111.1 metres.' },
  { key: 'z3', text: 'Before that moment come infinitely many of Zeno’s stages, and every one of them fits inside those 11.1 seconds.' },
  { key: 'z4', text: 'Zeno was wrong that motion is impossible. But he made us say what we mean by infinity, a sum, and an instant.' },
  { key: 'z5', text: 'Bertrand Russell wrote that Zeno’s arguments have afforded grounds for almost all theories of space, time and infinity since.' },
  { key: 'z6', gap: 0.8, text: 'Achilles wins the race. Zeno’s argument, it seems, is still running.' },
];

export const HOLD = { o6: 1.6, r12: 1.2, a9: 1.0, d6: 0.8, w15: 1.0, q7: 0.6, z6: 9 };
