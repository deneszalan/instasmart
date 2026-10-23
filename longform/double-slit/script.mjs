// "The double-slit experiment", a long-form 16:9 explainer. One line per caption; `say` is what the voice
// reads when it differs. `gap` is the pause before a line; chapter openings get 4.2 s for their title card.
//
// Facts and sources (downloaded copies in research/):
// - Wikipedia, "Double-slit experiment": Young first described it (1801 lecture on Newton's rings; 1803 demos
//   with sunlight, pinholes, cards; "some question as to whether he ever actually performed a double-slit
//   interference experiment"); Taylor 1909 low intensity; Jönsson 1961, Tübingen, electrons, multiple slits;
//   Merli, Missiroli, Pozzi 1974, single electrons with a biprism; detected one dot at a time, the modulus
//   squared of the wave gives the odds; helium atoms through slits in gold foil (Carnal & Mlynek 1991);
//   buckyballs (60 C atoms, about 0.7 nm) through a grating in 1999; 810 atoms 2013; 2,000 atoms 2019;
//   which-slit detectors: each particle at one slit, pattern becomes the sum of two single-slit patterns;
//   a 1987 experiment got partial path information without destroying the interference altogether (trade-off
//   between visibility and distinguishability); the standard account "is independent of any conscious observer"
//   (Zeilinger 1999: the state reflects "what is knowable in principle"); fringe maxima where the path
//   difference is a whole number of wavelengths, dark at half; spacing w = zλ/d, example d = 0.5 mm,
//   λ = 0.6 µm, z = 1 m -> 1.2 mm; I ∝ cos²(πd sinθ/λ)·sinc²(πb sinθ/λ), the sinc² from each slit alone;
//   interpretations: Copenhagen (which slit has no meaning without a detector), many worlds, de Broglie–Bohm
//   (pilot wave through both slits, same statistics); Feynman: "impossible […] to explain in any classical
//   way, and which has in it the heart of quantum mechanics. In reality, it contains the only mystery".
// - Wikipedia, "Young's interference experiment": Hooke, Huygens (wave) vs Newton (corpuscles); Newton's
//   reputation "gave the emission theory a wide lead" by the end of the 18th century; ripple tank; 1801 lecture;
//   two-slit description; unclear which experiments he performed; unsigned Edinburgh Review attacks 1803–04
//   (Brougham); 1818 prize, Fresnel, Poisson's bright-spot objection, Arago observed it; "This convinced most
//   scientists of the wave-nature of light."
// - Wikipedia, "Thomas Young (scientist)": British polymath, Rosetta Stone; Huygens' Treatise on Light (1690);
//   24 November 1803: "whenever the sun shines, and without any other apparatus than is at hand to every one";
//   card about 0.85 mm (1/30 in) in a beam from a single opening; blocking one edge made the fringes disappear;
//   he computed wavelengths of colours "very close to modern values"; lectures published 1807.
// - Wikipedia, "Corpuscular theory of light": Opticks 1704; Qu. 29 (in later editions): "Are not the Rays of
//   Light very small Bodies emitted from shining Substances? For such Bodies will pass through uniform Mediums
//   in right Lines without bending into the Shadow".
// - Wikipedia, "Arago spot": 1818 competition, Poisson, Arago's 2 mm disc, spot confirmed 1819; with brighter
//   light "the bright dots in the mosaic diffraction pattern just assemble faster".
// - Wikipedia, "Photon": Maxwell's 1865 prediction (electromagnetic wave) "seemed to be the final blow to
//   particle models"; Einstein 1905 light quanta; 1921 Nobel Prize for the photoelectric effect.
// - Wikipedia, "G. I. Taylor": 1909 paper, gas light dimmed by dark glass plates, diffraction around a sewing
//   needle, three months' exposure; the paper does not mention photons; not a single-photon source; repeated in
//   1986 with a single-photon source (Grangier, Roger and Aspect, Europhys. Lett. 1, 173), same result.
//   (That 1986 experiment used an interferometer: the paper's title, "…photon anticorrelation effect on a beam
//   splitter: a new light on single-photon interferences".)
// - Physics World, "The double-slit experiment" (Sept 2002, physicsworld.com/a/the-double-slit-experiment/):
//   readers voted the single-electron double-slit experiment "the most beautiful experiment in physics";
//   Taylor's light equivalent to "a candle burning at a distance slightly exceeding a mile"; Dirac: "each photon
//   then interferes only with itself"; Feynman's quote in full and "This experiment has never been done in just
//   this way"; Jönsson 1961, the year Feynman's lectures began, up to five slits; English translation 1974;
//   for decades taught as a thought experiment (French & Taylor); biprism = very thin wire splitting the beam;
//   Merli et al.'s 1974 single-electron work in Bologna; Tonomura's letter: fewer than 1,000 electrons per second,
//   never two in the apparatus, more than 20 minutes, frames of 8, 270, 2,000 and 60,000 electrons.
// - Wikipedia, "Wave–particle duality" and "Matter wave": Thomson 1897 (electron as particle), de Broglie 1924,
//   1927 confirmations (Davisson–Germer, crystals; Thomson and Reid, thin films); Vienna 1999, C60 wavelength
//   2.5 pm; heavier means shorter de Broglie wavelength (λ = h/mv).
// - Nature 401, 680 (1999), Arndt et al., "Wave–particle duality of C60 molecules". Nature Physics 15, 1242
//   (2019), Fein et al.: up to 2,000 atoms, beyond 25,000 Da. Nature 649, 866 (2026), Pedalino et al., Vienna:
//   sodium nanoparticles of more than 7,000 atoms, above 170,000 Da, about 8 nm across; quantum theory "has
//   withstood all tests to date".
// - Nature 427, 711 (2004), Hackermüller et al., Vienna: heated C70 molecules "lose their quantum behaviour by
//   thermal emission of radiation" (interferograms for increasing laser heating power).
// - Wikipedia, "Complementarity (physics)": D² + V² ≤ 1 (Greenberger & Yasin 1988).
// Left out: Bohr–Einstein recoiling-slit story (the record is mostly Bohr's later account); delayed-choice
// erasers; Young's own wavelength numbers (garbled in the source).
// On screen, every pattern is computed from I(y) above, and every dot is drawn from it with a seeded generator.

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Fire tiny particles, one at a time, at a wall with two narrow slits in it.' },
  { key: 'o2', text: 'Each one lands on the screen behind as a single *dot*.' },
  { key: 'o3', text: 'At first, the dots seem to land almost anywhere.' },
  { key: 'o4', text: 'But keep going, and they sort themselves into *stripes*.' },
  { key: 'o5', text: 'Stripes like these are what ~waves~ make when they overlap.' },
  { key: 'o6', text: 'So what went through the slits: a particle, or a wave?' },
  { key: 'o7', gap: 0.7, text: 'This is the *double-slit experiment*.' },

  // ---- 1 waves or particles
  { key: 'w1', gap: 4.2, chapter: 'Waves or particles?', text: 'For centuries, people argued about what light actually is.' },
  { key: 'w2', text: 'In his *Treatise on Light* of 1690, Christiaan Huygens described it as a ~wave~.', say: 'In his Treatise on Light, of 1690, Christiaan Huygens described it as a wave.' },
  { key: 'w3', text: 'Isaac Newton’s *Opticks*, published in 1704, leaned toward *particles*.', say: 'Isaac Newton’s Opticks, published in 1704, leaned toward particles.' },
  { key: 'w4', text: 'In later editions he asked: “Are not the Rays of Light very small Bodies emitted from shining Substances?”', say: 'In later editions he asked: are not the rays of light very small bodies, emitted from shining substances?' },
  { key: 'w5', text: 'Newton’s reputation was so great that, through the 18th century, the particle view held a wide lead.', say: 'Newton’s reputation was so great that, through the eighteenth century, the particle view held a wide lead.' },
  { key: 'w6', gap: 0.8, text: 'So how could you tell a wave from a stream of particles?' },
  { key: 'w7', text: 'Send particles through two slits, and you’d expect two bright bands, one behind each slit.' },
  { key: 'w8', text: 'But waves can do something particles can’t: when they meet, they can *add up*, or ~cancel out~.' },
  { key: 'w9', text: 'Crest on crest makes a bigger wave; crest on trough makes nothing at all. That’s *interference*.', say: 'Crest on crest makes a bigger wave; crest on trough makes nothing at all. That’s interference.' },

  // ---- 2 Young's stripes
  { key: 'y1', gap: 4.2, chapter: 'Young’s stripes', text: 'Thomas Young was a British doctor and polymath, who later helped decipher the Rosetta Stone.' },
  { key: 'y2', text: 'On 24 November 1803, he described an experiment anyone could repeat “whenever the sun shines”.', say: 'On the 24th of November, 1803, he described an experiment anyone could repeat, whenever the sun shines.' },
  { key: 'y3', text: 'He let sunlight in through a small hole, and held a card a thirtieth of an inch wide in the beam.' },
  { key: 'y4', text: 'In its shadow appeared coloured *fringes*: stripes of light and dark.' },
  { key: 'y5', text: 'When he blocked the light on one side of the card, the fringes ~vanished~.' },
  { key: 'y6', text: 'So the fringes needed light from *both* sides, meeting and interfering.' },
  { key: 'y7', text: 'His lectures, published in 1807, describe the version we know: light through two narrow slits.' },
  { key: 'y8', text: 'Whether he ever actually did it with two slits is not clear.' },
  { key: 'y9', gap: 0.8, text: 'The turn came in 1818, when Augustin-Jean Fresnel entered a French prize contest with a wave theory of light.', say: 'The turn came in 1818, when Augustin Fray-nel entered a French prize contest with a wave theory of light.' },
  { key: 'y10', text: 'One judge, Siméon Poisson, spotted what looked like an absurd prediction.', say: 'One judge, Simeon Pwasson, spotted what looked like an absurd prediction.' },
  { key: 'y11', text: 'In the middle of a small round disc’s shadow, it said, there should be a *bright spot*.' },
  { key: 'y12', text: 'The head of the judges, François Arago, tried it, and there was the spot.', say: 'The head of the judges, Fran-swah Arago, tried it, and there was the spot.' },
  { key: 'y13', text: 'After that, most scientists accepted that light is a wave.' },
  { key: 'y14', text: 'In 1865, James Clerk Maxwell predicted it is an electromagnetic wave, and the particle idea seemed finished.', say: 'In 1865, James Clark Maxwell predicted it is an electromagnetic wave, and the particle idea seemed finished.' },

  // ---- 3 reading the stripes
  { key: 'r1', gap: 4.2, chapter: 'Reading the stripes', text: 'So how do two slits make so many stripes?' },
  { key: 'r2', text: 'Each slit acts as a new source, sending out waves that spread in circles.' },
  { key: 'r3', text: 'To reach a point on the screen, one wave usually travels a little farther than the other.' },
  { key: 'r4', text: 'If the extra distance is a whole number of wavelengths, crests arrive together, and that spot is *bright*.' },
  { key: 'r5', text: 'If it’s half a wavelength, crest meets trough, and the spot is ~dark~.' },
  { key: 'r6', text: 'Move along the screen and the extra distance grows steadily: bright, dark, bright, dark.' },
  { key: 'r7', gap: 0.8, text: 'The spacing of the stripes is the wavelength, times the distance to the screen, divided by the gap between the slits.' },
  { key: 'r8', text: 'Take slits half a millimetre apart, light with a wavelength of 0.6 micrometres, and a screen 1 metre away.', say: 'Take slits half a millimetre apart, light with a wavelength of zero point six micrometres, and a screen one metre away.' },
  { key: 'r9', text: 'The stripes come out *1.2 millimetres* apart.', say: 'The stripes come out one point two millimetres apart.' },
  { key: 'r10', text: 'Move the screen twice as far away, and they spread twice as wide.' },
  { key: 'r11', text: 'Young had described this too: stripes “wider also in the same proportion as the apertures are closer to each other.”', say: 'Young had described this too: stripes wider also in the same proportion as the apertures are closer to each other.' },
  { key: 'r12', text: 'He used fringes like these to estimate the wavelengths of different colours, close to modern values.' },

  // ---- 4 one at a time
  { key: 'p1', gap: 4.2, chapter: 'One at a time', text: 'But the wave picture had a crack in it.' },
  { key: 'p2', text: 'In 1905, Albert Einstein proposed that light’s energy comes in separate lumps, now called *photons*.' },
  { key: 'p3', text: 'So what happens to the stripes when light is so dim that it arrives a little at a time?' },
  { key: 'p4', text: 'In 1909, a young Cambridge physicist, Geoffrey Ingram Taylor, tried it.' },
  { key: 'p5', text: 'He dimmed a gas light with dark glass, until it was like a candle more than a mile away.' },
  { key: 'p6', text: 'The light passed a sewing needle onto a photographic plate, which took three months to expose.' },
  { key: 'p7', text: 'The fringes were still there.' },
  { key: 'p8', text: 'Paul Dirac later put it this way: “each photon then interferes only with itself.”', say: 'Paul Dirac later put it this way: each photon then interferes only with itself.' },
  { key: 'p9', gap: 0.8, text: 'One caution: Taylor’s paper never mentions photons, and his dim lamp wasn’t a true single-photon source.' },
  { key: 'p10', text: 'That test came in 1986: a French team including Alain Aspect used a genuine single-photon source and an interferometer.' },
  { key: 'p11', text: 'The interference was still there, one photon at a time.' },
  { key: 'p12', gap: 0.8, text: 'Each photon is detected at one single point.' },
  { key: 'p13', text: 'A few hundred look like noise.' },
  { key: 'p14', text: 'By ten thousand, the stripes are unmistakable.' },
  { key: 'p15', text: 'Brighter light just makes the dots pile up faster: the same pattern, sooner.' },

  // ---- 5 electrons too
  { key: 'e1', gap: 4.2, chapter: 'Electrons too', text: 'Electrons came the other way round: from 1897, experiments showed them behaving as particles.' },
  { key: 'e2', text: 'Then, in 1924, Louis de Broglie proposed that all matter has a wave side too.', say: 'Then, in 1924, Louis de Broy proposed that all matter has a wave side too.' },
  { key: 'e3', text: 'Experiments in 1927 confirmed it, bouncing electrons off crystals and through thin films.' },
  { key: 'e4', text: 'But for decades, the two-slit version with electrons was taught only as a thought experiment.' },
  { key: 'e5', text: 'In his famous lectures, Richard Feynman wrote: “This experiment has never been done in just this way.”', say: 'In his famous lectures, Richard Feynman wrote: this experiment has never been done in just this way.' },
  { key: 'e6', text: 'In fact it had, in 1961, the year those lectures began.' },
  { key: 'e7', text: 'Claus Jönsson, in Tübingen, made slits for electrons and saw the fringes, with up to *five* slits.', say: 'Klaus Yernsson, in Tubingen, made slits for electrons and saw the fringes, with up to five slits.' },
  { key: 'e8', gap: 0.8, text: 'In 1974, in Bologna, Merli, Missiroli and Pozzi sent electrons through one at a time.' },
  { key: 'e9', text: 'Instead of slits they used an electron biprism: a fine wire that splits the beam in two.' },
  { key: 'e10', text: 'In 1989, Akira Tonomura and colleagues at Hitachi made it cleaner still.' },
  { key: 'e11', text: 'Fewer than 1,000 electrons arrived each second, so two were never in the apparatus at once.' },
  { key: 'e12', text: 'Each one arrived as a single flash: 8 electrons, then 270, then 2,000.' },
  { key: 'e13', text: 'Over a 20-minute exposure, 60,000 electrons drew the stripes.', say: 'Over a twenty-minute exposure, 60,000 electrons drew the stripes.' },
  { key: 'e14', text: 'In 2002, Physics World readers voted the single-electron version the most beautiful experiment in physics.' },

  // ---- 6 how big?
  { key: 'm1', gap: 4.2, chapter: 'How big?', text: 'How big can a thing be and still do this?' },
  { key: 'm2', text: 'In 1991, helium atoms interfered after passing through slits in gold foil.' },
  { key: 'm3', text: 'In 1999, a team in Vienna sent *buckyballs*, molecules of 60 carbon atoms, through a grating of many slits.' },
  { key: 'm4', text: 'A buckyball is 0.7 nanometres across; its wave was some 280 times smaller, and still it interfered.', say: 'A buckyball is zero point seven nanometres across; its wave was some 280 times smaller, and still it interfered.' },
  { key: 'm5', text: 'The record grew to molecules of 810 atoms in 2013, and about 2,000 atoms in 2019.' },
  { key: 'm6', text: 'In 2026, a team in Vienna showed interference with sodium clusters of more than 7,000 atoms each.' },
  { key: 'm7', text: 'The heavier the object, the shorter its wave, and the harder its stripes are to see.' },
  { key: 'm8', text: 'So far, quantum theory has passed every one of these tests.' },

  // ---- 7 which slit?
  { key: 'k1', gap: 4.2, chapter: 'Which slit?', text: 'Now for the most famous twist.' },
  { key: 'k2', text: 'Put a detector at each slit, to find out which one each particle goes through.' },
  { key: 'k3', text: 'Every particle is found at one slit or the other, never split between them.' },
  { key: 'k4', text: 'And the stripes ~vanish~.' },
  { key: 'k5', text: 'The screen shows two single-slit patterns, simply added together, with no interference.' },
  { key: 'k6', gap: 0.8, text: 'Why? To learn the path, the detector has to interact with the particle.' },
  { key: 'k7', text: 'That leaves a record of which way it went, and the two paths can no longer interfere.' },
  { key: 'k8', text: 'It’s often told as if a conscious observer changes the outcome, but the standard account needs no mind at all.' },
  { key: 'k9', text: 'What matters is whether the path could be known, in principle, from anything left behind.' },
  { key: 'k10', text: 'In 2004, a Vienna team laser-heated carbon-70 molecules, so they gave off heat radiation in flight.' },
  { key: 'k11', text: 'That radiation carried traces of each molecule’s path, and the hotter the molecules, the fainter the stripes.' },
  { key: 'k12', text: 'Nobody looked at that light; it only had to exist.' },
  { key: 'k13', gap: 0.8, text: 'And it isn’t all or nothing: a 1987 experiment gathered some path information and kept fainter stripes.' },
  { key: 'k14', text: 'The better the two paths can be told apart, the fainter the stripes have to be.' },

  // ---- 8 the heart of it
  { key: 'h1', gap: 4.2, chapter: 'The heart of it', text: 'Richard Feynman put this experiment at the centre of quantum physics.' },
  { key: 'h2', text: 'He called it “impossible, absolutely impossible, to explain in any classical way.”', say: 'He called it impossible, absolutely impossible, to explain in any classical way.' },
  { key: 'h3', text: 'It “has in it the heart of quantum mechanics,” he said. “In reality, it contains the only mystery.”', say: 'It has in it the heart of quantum mechanics, he said. In reality, it contains the only mystery.' },
  { key: 'h4', gap: 0.8, text: 'Quantum mechanics describes each particle with a ~wave~ that passes through both slits.' },
  { key: 'h5', text: 'The wave only sets the odds of where each particle lands: the square of the wave at each spot.' },
  { key: 'h6', text: 'Each detection is still a single *dot*, and only the pile of dots reveals the wave.' },
  { key: 'h7', text: 'What happens in between is where interpretations of quantum mechanics part ways.' },
  { key: 'h8', text: 'Some say “which slit?” means nothing without a detector; others picture many worlds, or a guiding wave.', say: 'Some say the question of which slit means nothing without a detector; others picture many worlds, or a guiding wave.' },
  { key: 'h9', text: 'But they all predict the same stripes, dot for dot.' },
  { key: 'h10', gap: 0.8, text: 'Young’s stripes showed light is a wave; single dots showed it arrives in lumps.' },
  { key: 'h11', text: 'And a record of the path, of any kind, wipes the stripes away.' },
  { key: 'h12', gap: 0.8, text: 'Two slits, a screen, and one dot at a time: it’s still the clearest view we have of the quantum world.' },
];

export const HOLD = { o7: 1.6, w7: 0.6, y5: 0.6, r9: 0.8, p14: 1.4, e13: 1.0, k4: 0.8, h12: 9.0 };
