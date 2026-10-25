// "Why the sky is blue", a long-form explainer (16:9). One line per caption; `say` is what the voice reads
// when it differs from the caption. `gap` is the pause before a line; chapter openings get 4.2 s for their card.
//
// Facts and where they come from:
// - Physics FAQ, "Why is the sky blue?" (P. Gibbs, 1997), math.ucr.edu/home/baez/physics/General/BlueSky/blue_sky.html:
//   white sunlight is a mixture of all colours (Newton's prism); visible light from red ~720 nm to violet ~380 nm,
//   with orange, yellow, green, blue between; molecules of oxygen and nitrogen are enough to account for the
//   scattering; Einstein calculated the scattering by molecules and it agreed with experiment; "Part of the answer"
//   to "why not violet" is that sunlight's spectrum is not constant and violet "is absorbed by the high atmosphere,
//   giving less violet in the light"; "a rainbow shows that there remains a significant amount" of violet; "The rest
//   of the answer ... lies in the way our vision works. For one thing, our eyes are less sensitive to violet"; three
//   kinds of cones respond most strongly to red, green, blue; skylight stimulates red and green cones about equally,
//   blue more strongly: "This combination accounts for the pale blue colour"; clear-air sunsets look yellow, small
//   particles make them redder, sea salt orange; clouds and haze are white because their particles are larger than
//   the wavelength and scatter all wavelengths equally (Mie scattering); seen from the beach, the sea is blue
//   because it reflects the sky; skylight looks a deeper blue through polaroid sunglasses.
// - Wikipedia, "Rayleigh scattering": scattering by particles much smaller than the wavelength (< 1/10 of it),
//   inversely proportional to the fourth power of the wavelength; the light's oscillating electric field moves the
//   charges in a particle, which becomes a small radiating dipole; Leonardo (c. 1506–1510) conjectured that small
//   particles give the sky its blue; 1869 Tyndall saw faint blue scattering, proposed it explained the sky, but could
//   not explain the preference for blue, nor could dust explain the intensity; 1871 Rayleigh's two papers on the
//   colour and polarisation of skylight; 1899 he showed it applies to individual molecules ("established the basic
//   scientific model for the color of the sky"); blue and violet light comes from all regions of the sky; the eye
//   takes the mix as blue plus white; scattered blue light is polarised. Works: J. W. Strutt, "On the light from
//   the sky, its polarization and colour", Phil. Mag. 41 (1871).
// - Wikipedia, "John William Strutt, 3rd Baron Rayleigh": British physicist, born 1842; inherited the barony in 1873.
// - Wikipedia, "John Tyndall" (Irish physicist) and "Tyndall effect": he needed dust-free air for his work on radiant
//   heat and detected particles with intense light; a tube gradually filled with smoke looked blue from the sides and
//   red from the far end; air molecules (N2, O2) are < 1 nm.
// - Wikipedia, "Diffuse sky radiation": the blue-sky spectrum has all visible wavelengths with a broad maximum around
//   450–485 nm; ozone absorption helps keep the evening sky blue.
// - Wikipedia, "Mie scattering": named after the German physicist Gustav Mie; cloud droplets scatter all visible
//   wavelengths approximately identically, so clouds look white or grey; direct sunlight looks slightly yellow.
// - Wikipedia, "Cloud physics": cloud droplets are a few micrometres across. "Cloud": dense, deep clouds reflect
//   70–95% across the visible spectrum; bases look grey depending on thickness. "Sunset": blue and green are removed
//   almost completely on the long path, leaving orange and red; the reddened light lights up clouds; Mie scattering
//   gives the white glow around the Sun; the Sun seen from Mars is about two-thirds the size.
// - Wikipedia, "Rayleigh sky model": polarisation is highest in a band 90° from the Sun, near 80%; can be seen with
//   polarised sunglasses; many animals, typically insects, navigate by it; first proposed by Karl von Frisch for
//   honeybees; "It has been suggested" that Vikings used a "sunstone" crystal.
// - Wikipedia, "Air mass (astronomy)": relative air mass about 38 at the horizon; homogeneous atmosphere height
//   about 8,435 m. Kasten & Young's formula (computed below and in the scene) gives 37.9 at the horizon.
// - Wikipedia, "Atmosphere of Mars": surface density 1–2% of Earth's. "Extraterrestrial sky": the Martian daytime sky
//   is butterscotch; near the setting Sun it is blue, the opposite of Earth. NASA, "Sunset at Mars' Gale Crater"
//   (science.nasa.gov/resource/sunset-at-mars-gale-crater-curiosity): Curiosity, 2015; fine dust lets blue light
//   through more efficiently, so blue stays close to the Sun while yellow and red scatter more widely.
const rel = (nm) => Math.pow(700 / nm, 4); // scattering relative to red at 700 nm, from 1/λ⁴
export const BLUE = rel(450); // 5.86
export const VIOLET = rel(400); // 9.38
const airMass = (z) => 1 / (Math.cos((z * Math.PI) / 180) + 0.50572 * Math.pow(96.07995 - z, -1.6364)); // Kasten & Young 1989
export const HORIZON = airMass(90); // 37.9
export const COLUMN_KM = 8.435; // all the air overhead at sea-level density
const blue1 = BLUE.toFixed(1), horizon = Math.round(HORIZON), pathKm = Math.floor((HORIZON * COLUMN_KM) / 100) * 100;

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Look up on a clear day, and the whole sky glows *blue*.' },
  { key: 'o2', text: 'But sunlight is white, and the air around you looks perfectly clear.' },
  { key: 'o3', text: 'So where does all that blue come from?' },
  { key: 'o4', text: 'And once you know, a second puzzle appears. Why isn’t the sky ~violet~?' },
  { key: 'o5', text: 'The answer takes in a tube of smoke, a fourth power, the sunsets of Mars, and your own eyes.' },
  { key: 'o6', gap: 0.7, text: 'This is why the sky is blue.' },
  // ---- 1 white light
  { key: 'w1', gap: 4.2, chapter: 'White light', text: 'Start with sunlight. It looks white, but it’s a mixture of every colour of the rainbow.' },
  { key: 'w2', text: 'Isaac Newton showed this with a prism, which spreads white light out into a spectrum.' },
  { key: 'w3', text: 'Light is a wave, and its colour is set by its *wavelength*, which is the distance from one crest to the next.' },
  { key: 'w4', text: 'Visible light runs from ^red^, with waves about 720 nanometres long, to ~violet~, at about 380.' },
  { key: 'w5', text: 'A nanometre is a millionth of a millimetre.' },
  { key: 'w6', text: 'In between come orange, yellow, green and *blue*.' },
  { key: 'w7', text: 'We’ll compare *blue* light at 450 nanometres with ^red^ light at 700.' },
  { key: 'w8', text: 'Blue waves are shorter, and the whole story turns on that difference.' },
  // ---- 2 Tyndall's tube
  { key: 't1', gap: 4.2, chapter: 'A blue glow', text: 'People have wondered about the colour of the sky for centuries.' },
  { key: 't2', text: 'In the early 1500s, Leonardo da Vinci guessed that sunlight scattered by tiny particles in the air makes the sky blue.', say: 'In the early fifteen-hundreds, Leonardo da Vinci guessed that sunlight scattered by tiny particles in the air makes the sky blue.' },
  { key: 't3', text: 'In 1869, the Irish physicist John Tyndall took the first steps toward a real explanation.' },
  { key: 't4', text: 'He needed perfectly clean air for his work on heat, and he hunted for dust by shining bright light through it.' },
  { key: 't5', text: 'When he slowly filled a tube with smoke and shone a beam along it, he saw something striking.' },
  { key: 't6', text: 'From the side, the beam looked *blue*. From the far end, it looked ^red^.' },
  { key: 't7', text: 'The tiny particles were scattering blue light out sideways, and letting redder light carry on.' },
  { key: 't8', text: 'Tyndall suggested that this is why the sky is blue.' },
  { key: 't9', text: 'But he couldn’t explain why blue light scatters more, and dust alone couldn’t explain how blue the sky is.' },
  // ---- 3 Rayleigh's rule
  { key: 'r1', gap: 4.2, chapter: 'The fourth power', text: 'The explanation began in 1871, with a young British physicist, John William Strutt.' },
  { key: 'r2', text: 'Two years later he became Lord Rayleigh, and the effect now carries his name. It’s called *Rayleigh scattering*.', say: 'Two years later he became Lord Rayleigh, and the effect now carries his name. It’s called Rayleigh scattering.' },
  { key: 'r3', text: 'Light is an electric and magnetic wave. As it passes a tiny particle, its electric field shakes the charges inside.' },
  { key: 'r4', text: 'The shaken particle becomes a tiny antenna, and sends out light of its own in new directions.' },
  { key: 'r5', text: 'This works for particles far smaller than the wavelength, meaning less than about a tenth of it.' },
  { key: 'r6', text: 'And it follows a simple rule, that scattering goes as one over the *wavelength to the fourth power*.' },
  { key: 'r7', text: 'Halve the wavelength, and the scattering gets *16 times* stronger.' },
  { key: 'r8', text: `So compare blue at 450 nanometres with red at 700. The ratio of 700 to 450, to the fourth power, is about ${blue1}.`, say: `So compare blue at 450 nanometres with red at 700. The ratio of 700 to 450, raised to the fourth power, is about ${blue1}.` },
  { key: 'r9', text: 'Air scatters *blue* light nearly *6 times* more strongly than ^red^.' },
  { key: 'r10', gap: 0.8, text: 'In 1899, Rayleigh showed that the same rule applies to single molecules.' },
  { key: 'r11', text: 'Molecules of nitrogen and oxygen are less than a nanometre across, which is hundreds of times smaller than a wave of light.' },
  { key: 'r12', text: 'So the air itself scatters the light. No dust is needed.' },
  { key: 'r13', text: 'Later, Albert Einstein worked out the scattering by molecules in detail, and his result agreed with experiment.' },
  // ---- 4 a sky full of blue
  { key: 'b1', gap: 4.2, chapter: 'A sky full of blue', text: 'Now picture sunlight streaming down through the air.' },
  { key: 'b2', text: 'Most of it comes straight through, but some is scattered by molecules on the way.' },
  { key: 'b3', text: 'Because short waves scatter most, it’s mostly *blue* light that gets knocked off in new directions.' },
  { key: 'b4', text: 'That scattered blue reaches your eyes from every part of the sky, so the whole dome glows.' },
  { key: 'b5', text: 'The sunlight that comes straight through has lost a little blue, so the Sun itself looks slightly yellow.' },
  { key: 'b6', text: 'When it’s measured, the light of a blue sky holds every colour, with a broad peak between 450 and 485 nanometres.' },
  { key: 'b7', text: 'Our eyes take that mix as *blue* blended with white, which gives the soft colour we call sky blue.' },
  { key: 'b8', gap: 0.8, text: 'And no, the sky isn’t blue because it reflects the sea. If anything, it’s the other way round.' },
  { key: 'b9', text: 'Seen from the beach, the sea looks blue partly because it reflects the sky.' },
  // ---- 5 why not violet
  { key: 'v1', gap: 4.2, chapter: 'Why not violet?', text: 'But here’s the puzzle. ~Violet~ light has even shorter waves than blue.' },
  { key: 'v2', text: `At 400 nanometres, violet scatters more than ${Math.floor(VIOLET)} times as strongly as red.` },
  { key: 'v3', text: 'So why isn’t the sky ~violet~?' },
  { key: 'v4', text: 'Part of the answer is that sunlight holds less violet than blue to begin with.' },
  { key: 'v5', text: 'And some violet is absorbed high in the atmosphere, before it reaches us.' },
  { key: 'v6', text: 'Still, a rainbow shows that plenty of violet gets through. The rest of the answer is in your *eyes*.' },
  { key: 'v7', text: 'For one thing, our eyes are less sensitive to violet.' },
  { key: 'v8', text: 'We see colour with three kinds of cone cells, which respond most strongly to red, green and blue light.' },
  { key: 'v9', text: 'Skylight stimulates the red and green cones about equally, and the blue cones more strongly.' },
  { key: 'v10', text: 'Our vision reads that combination as a *pale blue*.' },
  { key: 'v11', text: 'So the blue of the sky is partly physics, and partly the way we see.' },
  // ---- 6 white clouds
  { key: 'c1', gap: 4.2, chapter: 'White clouds', text: 'If air turns sunlight blue, why are clouds white?' },
  { key: 'c2', text: 'Clouds are made of water droplets, typically a few micrometres, or thousandths of a millimetre, across.' },
  { key: 'c3', text: 'That’s thousands of times bigger than an air molecule, and bigger than a wave of light.' },
  { key: 'c4', text: 'Particles that big don’t follow Rayleigh’s rule. They scatter all colours about *equally*.' },
  { key: 'c5', text: 'This is *Mie scattering*, after the German physicist Gustav Mie.', say: 'This is called Mee scattering, after the German physicist Gustav Mee.' },
  { key: 'c6', text: 'Scatter every colour alike, and white light stays white.' },
  { key: 'c7', text: 'A thick cloud reflects 70 to 95 percent of the light that falls on it, across all colours.' },
  { key: 'c8', text: 'Its base can look grey, simply because less light makes it through.' },
  { key: 'c9', text: 'The same kind of scattering makes haze look whitish, and puts a bright white glow around the Sun.' },
  // ---- 7 polarised light
  { key: 'p1', gap: 4.2, chapter: 'A hidden pattern', text: 'Scattered skylight has another property that our eyes can’t see. It’s *polarised*.' },
  { key: 'p2', text: 'Light waves can vibrate in any direction across their path. In polarised light, one direction wins out.' },
  { key: 'p3', text: 'Skylight is most strongly polarised in a band 90 degrees away from the Sun.' },
  { key: 'p4', text: 'There, in a clear sky, the polarisation can reach about 80 percent.' },
  { key: 'p5', text: 'Polarising sunglasses can make that part of the sky look a deeper blue.' },
  { key: 'p6', text: 'Rayleigh’s first papers on the sky, in 1871, were titled “On the light from the sky, its polarization and colour”.', say: 'Rayleigh’s first papers on the sky, in 1871, were titled On the light from the sky, its polarization and colour.' },
  { key: 'p7', text: 'Many insects can sense this pattern and use it as a compass.' },
  { key: 'p8', text: 'The idea goes back to Karl von Frisch’s studies of honeybees.' },
  { key: 'p9', text: 'From the pattern alone, an animal can work out where the Sun is, even when it’s out of sight.' },
  { key: 'p10', text: 'It has even been suggested that Viking sailors did something similar, with a crystal called a sunstone.' },
  // ---- 8 sunset
  { key: 's1', gap: 4.2, chapter: 'Sunset', text: 'As the day ends, the same rule paints the sky in different colours.' },
  { key: 's2', text: 'When the Sun is high, its light takes the shortest route through the air.' },
  { key: 's3', text: 'Squeeze all the air above you to sea-level density, and it would be only about 8 kilometres deep.' },
  { key: 's4', text: `Near the horizon, sunlight has to slant through far more air, about ${horizon} times as much.` },
  { key: 's5', text: `That’s like crossing more than ${pathKm} kilometres of air at sea level.` },
  { key: 's6', text: 'Along that path, the blue and green are scattered out almost completely.' },
  { key: 's7', text: 'What’s left to reach you is ^orange and red^.' },
  { key: 's8', text: 'That reddened light falls on clouds, and they scatter it back to us, painting red and orange on white.' },
  { key: 's9', gap: 0.8, text: 'In very clear air, a setting Sun looks yellow.' },
  { key: 's10', text: 'Fine particles of smoke or dust make it redder, and sea salt can turn it orange.' },
  { key: 's11', text: 'And after sunset, ozone high in the atmosphere helps keep the sky overhead blue.' },
  // ---- 9 other skies
  { key: 'm1', gap: 4.2, chapter: 'Other skies', text: 'On other worlds, the physics is the same, but the air is different.' },
  { key: 'm2', text: 'At the surface of Mars, the air is only 1 to 2 percent as dense as ours, and full of fine dust.' },
  { key: 'm3', text: 'By day, the Martian sky is a *butterscotch* colour.' },
  { key: 'm4', text: 'But near the setting Sun, the Martian sky turns *blue*.' },
  { key: 'm5', text: 'NASA’s Curiosity rover photographed a sunset like this in 2015, from Gale Crater.' },
  { key: 'm6', text: 'According to NASA, the fine dust lets blue light through more efficiently than redder colours.' },
  { key: 'm7', text: 'So the blue stays close to the Sun, while yellow and red light spreads across the sky.' },
  { key: 'm8', text: 'It’s the opposite of what happens on Earth.' },
  // ---- payoff
  { key: 'z1', gap: 1.6, text: 'So, why is the sky blue?' },
  { key: 'z2', text: 'Sunlight holds every colour, and the molecules of the air scatter short waves far more than long ones.' },
  { key: 'z3', text: 'Blue scatters nearly 6 times more than red, so scattered blue reaches us from all over the sky.' },
  { key: 'z4', text: 'Violet scatters even more, but sunlight holds less of it, and our eyes are less sensitive to it.' },
  { key: 'z5', text: 'At sunset, the light crosses so much air that the blue is scattered away, leaving orange and red.' },
  { key: 'z6', text: 'And clouds, made of far bigger droplets, scatter every colour alike, so they stay white.' },
  { key: 'z7', gap: 0.9, text: 'Every patch of blue you see is sunlight that the air itself has turned toward your eyes.' },
];
export const HOLD = { o6: 1.2, t6: 1.0, r9: 0.8, b4: 1.2, s7: 1.0, m4: 0.8, z7: 9.0 };
