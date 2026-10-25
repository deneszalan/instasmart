/**
 * The labs an `explore` slide can show: small interactive experiments built into the app (src/labs/), where the
 * reader changes something and watches what happens. The descriptions say what each lets the reader do; the
 * slide's own `prompt` sets the goal and its `takeaway` says what they found.
 */
export const LABS = {
  'monty-hall': 'Play the game yourself, staying or switching, then run 1,000 games each way; the host can know or guess.',
  'birthday-problem': 'Drag the group size to see the chance of a shared birthday, and fill random rooms to test it.',
  'blind-spot': 'A real blind spot test: close one eye, fix on the cross and move the phone until the dot vanishes.',
  'base-rate-fallacy': 'Set how rare the target is, how many the test catches and how often it is wrong; see how many alarms are real.',
  'kaprekar-6174': 'Type any four digits and run Kaprekar’s routine round by round to 6174, beside how many rounds every number needs.',
  'pythagoras-rearrangement-proof': 'Slide the four triangles from one arrangement to the other and change their shape; the empty area never changes.',
  'simpsons-paradox': 'Change which share of each treatment’s patients have the hard cases and watch the overall winner flip.',
  'slide-rule-adds-logarithms': 'Drag the C scale and the cursor of a slide rule to multiply by adding lengths.',
  'binary-adder-logic-gates': 'Flip the bits of two 4-bit numbers and watch a ripple-carry adder pass its carries from column to column.',
  'binary-search-twenty-guesses': 'Hunt for a hidden number with “higher” or “lower”, watching the range halve; 1 to 100, 1,000 or a million.',
  'enigma-never-itself': 'Type on a working three-rotor Enigma I and see that no letter ever comes out as itself; reset to decrypt.',
  'huffman-coding-term-paper': 'Build a Huffman tree by tying the two rarest letters together, for ABRACADABRA or your own text, and count the bits.',
  'public-key-cryptography': 'Diffie–Hellman with small primes: choose secrets, swap numbers in the open, then play Eve and hunt for a secret.',
  'double-slit': 'Fire particles one at a time at two slits and watch stripes build up; change the colour and the gap, or watch the slits.',
  'foucault-pendulum': 'A Foucault pendulum seen from above: move it from the pole to the equator and the south and time its turning.',
  'pitch-drop-experiment': 'Fast-forward the pitch drop experiment from 1930 and try to catch a drop as it falls.',
  'why-the-sky-is-blue': 'Lower the Sun from noon to sunset and see the sky and the sunlight change, worked out from Rayleigh scattering.',
  'chladni-figures-sand': 'Bow a sandy square plate at different notes and watch the sand gather on the still lines.',
  'ancient-sunlight': 'Follow a photon’s random walk out of a model Sun and see how many steps it needs, and how long the real one takes.',
  'astronauts-are-falling': 'Newton’s cannon at the space station’s height: find the launch speed that falls all the way round Earth.',
  'kepler-equal-areas': 'Stretch an orbit and watch twelve equal-time wedges: short and fat near the Sun, long and thin far away.',
  'mars-retrograde-loop': 'Run Earth and Mars round the Sun and watch Mars’s path across the sky turn back as Earth overtakes it.',
  'moon-phases': 'Drag the Moon round Earth, with sunlight from one side, and see its phase from Earth.',
  'milankovitch-cycles': 'Change Earth’s tilt, the stretch of its orbit and when it passes closest to the Sun; see summer sunshine at 65° N.',
  'coriolis-toilet-myth': 'Grow a swirl from a toilet bowl to a hurricane and find the size at which Earth’s spin decides its direction.',
} as const;

export type LabId = keyof typeof LABS;

export const LAB_IDS = Object.keys(LABS) as [LabId, ...LabId[]];
