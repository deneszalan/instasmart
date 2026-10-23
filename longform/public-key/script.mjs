// "Public-key cryptography: how strangers share secrets in public", a long-form explainer (16:9).
// One line per caption; `say` is what the voice reads when it differs. `gap` is the pause before a line;
// chapter openings get 4.2 s for their title card. Every number below is computed (see NUM) and the scene
// computes the same numbers again, so picture, narration and source agree.
//
// Facts and where they come from (research/ holds the raw pages):
// - Wikipedia, "William Stanley Jevons": English economist and logician; The Principles of Science (1874, p. 141):
//   "Can the reader say what two numbers multiplied together will produce the number 8,616,460,799? I think it
//   unlikely that anyone but myself will ever know." Factored by Charles J. Busk in 1889, D. N. Lehmer in 1903, and
//   later on a pocket calculator by Solomon Golomb: 89,681 × 96,079. ("Public-key cryptography" quotes it too.)
// - Diffie & Hellman, "New Directions in Cryptography", IEEE Trans. Information Theory IT-22(6), November 1976
//   (ee.stanford.edu/~hellman/publications/24.pdf): first line "We stand today on the brink of a revolution in
//   cryptography"; parties must share a key "sent in advance over some secure channel such as private courier or
//   registered mail"; it is "unrealistic to expect initial business contacts to be postponed long enough for keys to
//   be transmitted by some physical means"; "this key distribution problem is a major barrier"; n users give
//   (n² − n)/2 pairs; a public key cryptosystem has distinct enciphering and deciphering keys, the enciphering key
//   in "a public directory"; such a system "is really a set of trap-door one-way functions"; "the problem is still
//   largely open"; public key distribution as the other approach.
// - Wikipedia, "Public-key cryptography": early keys exchanged face to face or by trusted courier; Ellis conceived
//   "non-secret encryption" in 1970 but saw no way to implement it; Cocks 1973 (RSA), Williamson 1974 (Diffie–
//   Hellman); military focus, limited computing power; declassified 1997; Diffie–Hellman 1976, influenced by
//   Merkle; RSA 1977 at MIT, described in Gardner's August 1977 Scientific American column; hybrid systems: public-key
//   algorithms are much more computationally intensive, so they exchange a symmetric key (TLS does this);
//   man-in-the-middle substitution of public keys.
// - Wikipedia, "Diffie–Hellman key exchange": paper key lists carried by a trusted courier; the paint analogy
//   (public yellow, secret colours, swap, same final mixture; very hard for an eavesdropper); p = 23, g = 5 (a
//   primitive root); only a and b secret; one-way function; only 23 possible results, so much larger values needed;
//   primes of at least 2048 bits recommended; discrete logarithm problem; plain DH has no authentication, Mallory
//   runs two exchanges; ephemeral keys in TLS give forward secrecy; Hellman (2006) asked for the name
//   Diffie–Hellman–Merkle; Shor's algorithm breaks finite-field and elliptic-curve DH.
// - Wikipedia, "Whitfield Diffie": independent research from 1973 ("digging up rare manuscripts in libraries...
//   visiting friends at universities"); in summer 1974 Alan Konheim of IBM advised him to meet Martin Hellman, a
//   young Stanford professor; "A planned half-hour meeting... extended over many hours". "Martin Hellman": 2015 Turing
//   Award with Diffie. "Ralph Merkle"/"Merkle's Puzzles": devised as a Berkeley class project, 1974, published 1978.
// - Wikipedia, "RSA cryptosystem": Rivest, Shamir, Adleman at MIT, attempts over a year; Rivest and Shamir proposed,
//   Adleman found weaknesses; April 1977 Passover at a student's house, Rivest unable to sleep, "much of the paper
//   ready by daybreak"; named from their initials; worked example p = 61, q = 53, n = 3233, λ(n) = lcm(60, 52) = 780,
//   e = 17, d = 413, m = 65 → c = 2790 → 65; padding (plain RSA attacks); signing a hash with d, verifying with e;
//   no polynomial-time classical factoring method known, not proven that none exists; Shor 1994. Typical key sizes
//   2,048 to 4,096 bits (infobox).
// - Wikipedia, "The Magic Words are Squeamish Ossifrage" and "RSA numbers": Gardner's August 1977 challenge, a
//   129-digit number (RSA-129), US$100 prize; Rivest estimated in 1977 that a 125-digit semiprime would take
//   40 quadrillion years with the best algorithm and fastest computers of the day; factored April 1994 by about 600
//   volunteers with about 1,600 machines over the internet; "ossifrage" (bone-breaker, Latin) is an older name for
//   the bearded vulture. The largest RSA challenge numbers factored in public have under 300 digits (RSA numbers
//   table); RSA-2048 has 617 digits.
// - Wikipedia, "Digital signature": Diffie and Hellman first described digital signatures in 1976; RSA gave
//   primitive (proof-of-concept) signatures. "Public key certificate": a public key with the issuer's signature;
//   the issuer is usually a certificate authority; browsers trust root programs.
// - Wikipedia, "James H. Ellis": report "The Possibility of Secure Non-Secret Digital Encryption" (January 1970);
//   inspired by a WWII Bell Labs paper (Project C43): the receiver adds, then subtracts, random noise; died
//   25 November 1997; Cocks's public talk 18 December 1997. "Clifford Cocks": joined GCHQ's CESG in September 1973,
//   told of Ellis's idea, chose prime factorisation with his number-theory background, "did not even write it down
//   at the time", quickly developed RSA; GCHQ found no way to use it; no evidence of a leak. "Malcolm J. Williamson":
//   1974, what is now known as Diffie–Hellman; Hellman developed it independently; declassified 1997.
// - Wikipedia, "Transport Layer Security": TLS 1.3 (2018) mandates forward secrecy with ephemeral (EC)DH, requires
//   signatures, adds x25519; hybrid X25519MLKEM768 on by default in Chrome 131 (Nov 2024) and Firefox 132.
//   "Key size": NIST minimum 2048-bit RSA since 2015. "Elliptic-curve cryptography": a 256-bit key gives security
//   comparable to 3072-bit RSA. "Forward secrecy".
// - Wikipedia, "Shor's algorithm": 1994, Peter Shor; factoring and discrete logarithms; breaks RSA, finite-field and
//   elliptic-curve DH given a large enough quantum computer; may need millions of qubits for error correction;
//   demonstrations factored 15 (2001) and 21 (2012), compiled using prior knowledge of the answer.
//   "Harvest now, decrypt later". "Post-quantum cryptography": symmetric ciphers are relatively secure (doubling key
//   size counters Grover). "NIST Post-Quantum Cryptography Standardization": 13 August 2024, FIPS 203 (ML-KEM),
//   FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA). "ML-KEM": based on the module learning-with-errors lattice problem.
// Left out: Spycatcher and the 1987 delay (one source), "AI" maths warnings, the 2026 factoring records (kept to
// "under 300 digits"), qubit estimates beyond "millions", any claim about the padlock icon.
const pm = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), E = BigInt(e); const M = BigInt(m); while (E > 0n) { if (E & 1n) r = (r * x) % M; x = (x * x) % M; E >>= 1n; } return Number(r); };
const isPrime = (x) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
const primesUpTo = (x) => { let n = 0; for (let i = 2; i <= x; i++) if (isPrime(i)) n++; return n; };
const P = 23, G = 5, SA = 3, SB = 7, A = pm(G, SA, P), B = pm(G, SB, P), K = pm(B, SA, P);
if (K !== pm(A, SB, P) || K !== pm(G, SA * SB, P)) throw new Error('key exchange');
const RP = 61, RQ = 53, N = RP * RQ, LAM = 780, E = 17, D = 413, M = 65, C = pm(M, E, N);
if ((E * D) % LAM !== 1 || pm(C, D, N) !== M) throw new Error('rsa');
const SIGM = 1977, SIG = pm(SIGM, D, N);
if (pm(SIG, E, N) !== SIGM) throw new Error('signature');
export const NUM = { P, G, SA, SB, A, B, K, N, E, D, M, C, EVE: pm(C, E, N), SIGM, SIG, TRY_N: primesUpTo(RQ), TRY_J: primesUpTo(89681), DIG17: (65n ** 17n).toString().length };
const f = (n) => n.toLocaleString('en-US');
const pow5 = Array.from({ length: 5 }, (_, i) => pm(G, i + 1, P)).join(', ');

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'In 1874, the English economist William Stanley Jevons printed this puzzle.' },
  { key: 'o2', text: 'Which two numbers, multiplied together, make *8,616,460,799*?' },
  { key: 'o3', text: '“I think it unlikely,” he wrote, “that anyone but myself will ever know.”', say: 'I think it unlikely, he wrote, that anyone but myself will ever know.' },
  { key: 'o4', text: 'Multiplying two numbers is easy. Finding them again from the answer can be very hard.' },
  { key: 'o5', text: 'Lopsided problems like his now guard every secure web page you open.' },
  { key: 'o6', text: 'They let two strangers agree on a secret while everyone listens.' },
  { key: 'o7', gap: 0.7, text: 'This is the story of *public-key cryptography*, which was invented twice.' },

  // ---- 1 the key problem
  { key: 'k1', gap: 4.2, chapter: 'The key problem', text: 'For most of history, sending a secret message meant sharing a secret *key* first.' },
  { key: 'k2', text: 'The same key locks and unlocks the message, so whoever has it can read everything.' },
  { key: 'k3', text: 'So the key had to travel, by trusted courier or at a face-to-face meeting.' },
  { key: 'k4', text: 'And every pair of people who want to talk privately needs its own key.' },
  { key: 'k5', text: 'Ten people need *45* keys.' },
  { key: 'k6', text: 'A thousand people need *499,500*.' },
  { key: 'k7', gap: 0.8, text: 'Two researchers at Stanford called this the *key distribution problem* in 1976.' },
  { key: 'k8', text: 'Their answer sounds impossible. It lets strangers agree on a key in full view of everyone.' },

  // ---- 2 new directions
  { key: 'n1', gap: 4.2, chapter: 'New directions', text: 'In 1974, Whitfield Diffie, an independent researcher, was advised to meet a young Stanford professor, Martin Hellman.' },
  { key: 'n2', text: 'A planned half-hour meeting lasted many hours.' },
  { key: 'n3', text: 'In November 1976, they published *New Directions in Cryptography*.' },
  { key: 'n4', text: 'Its first line reads, “We stand today on the brink of a revolution in cryptography.”', say: 'Its first line reads, We stand today on the brink of a revolution in cryptography.' },
  { key: 'n5', gap: 0.8, text: 'The big idea was to split the key in two.' },
  { key: 'n6', text: 'One key locks, a different key unlocks, and knowing the first doesn’t give you the second.' },
  { key: 'n7', text: 'Publish your locking key like a phone number, and anyone can send you messages only you can read.' },
  { key: 'n8', text: 'For that they needed a *trapdoor one-way function*, which is easy to compute but hard to undo, unless you hold a secret.' },
  { key: 'n9', text: 'They didn’t have one. The problem, they wrote, was “still largely open”.', say: 'They didn’t have one. The problem, they wrote, was still largely open.' },
  { key: 'n10', gap: 0.8, text: 'But they did have a way to agree on a key in public, building on ideas from Ralph Merkle.' },

  // ---- 3 mixing in public
  { key: 'm1', gap: 4.2, chapter: 'Mixing in public', text: 'Here’s the idea in paint. Alice and Bob publicly agree on *yellow* as their starting colour.' },
  { key: 'm2', text: 'Each mixes in a secret colour of their own, red for Alice and ~blue~ for Bob.' },
  { key: 'm3', text: 'They swap the mixtures in the open, where Eve, listening in, sees them too.' },
  { key: 'm4', text: 'Then each stirs in their own secret again, and both end up with the same brown.' },
  { key: 'm5', text: 'Eve has the yellow and both mixtures, but she can’t pull the secret colours back out.' },
  { key: 'm6', gap: 0.8, text: 'Here the picture breaks down. Paint can never be unmixed, but the maths can, by trying every secret.' },
  { key: 'm7', text: 'The defence is sheer numbers, with far too many secrets to try.' },
  { key: 'm8', gap: 0.8, text: 'The real thing uses clock arithmetic. Picture a clock with *23* hours.', say: 'The real thing uses clock arithmetic. Picture a clock with 23 hours.' },
  { key: 'm9', text: 'Start at 1 and keep multiplying by *5*, keeping only the remainder after dividing by 23.', say: 'Start at 1 and keep multiplying by 5, keeping only the remainder after dividing by 23.' },
  { key: 'm10', text: `The hand jumps ${pow5}… with no pattern you can easily see.`, say: `The hand jumps to ${pow5.split(', ').join(', then ')}, with no pattern you can easily see.` },
  { key: 'm11', text: 'Stepping forward is easy. Working back to how many steps it took is the *discrete logarithm problem*, and it’s hard.' },
  { key: 'm12', gap: 0.8, text: `Now comes the exchange. Everyone, Eve included, knows ${P} and ${G}.` },
  { key: 'm13', text: `Alice secretly picks ${SA}. After ${SA} steps, the hand is on *${A}*, and she sends ${A}.` },
  { key: 'm14', text: `Bob secretly picks ${SB}. After ${SB} steps, the hand is on *${B}*, and he sends ${B}.` },
  { key: 'm15', text: `Alice raises Bob’s ${B} to the power of her secret ${SA}, and Bob raises Alice’s ${A} to the power of his ${SB}.` },
  { key: 'm16', text: `Both get ~${K}~, because both have really taken ${SA} times ${SB} steps from the start, which is ${SA * SB}.` },
  { key: 'm17', text: `Eve heard the numbers ${P} and ${G}, then ${A} and ${B}. To reach ${K}, she needs ${SA} or ${SB}.` },
  { key: 'm18', text: 'With 23 hours she could try them all, so real exchanges use a prime of at least *2,048 bits*, which is 617 digits.', say: 'With 23 hours she could try them all, so real exchanges use a prime of at least 2,048 bits, which is 617 digits.' },

  // ---- 4 a lock anyone can close
  { key: 'r1', gap: 4.2, chapter: 'A lock anyone can close', text: 'But a true public lock, one that anyone could close, was still missing.' },
  { key: 'r2', text: 'At MIT, Ron Rivest, Adi Shamir and Leonard Adleman spent about a year hunting for one.', say: 'At M I T, Ron Rivest, Adi Shamir and Leonard Adleman spent about a year hunting for one.' },
  { key: 'r3', text: 'Rivest and Shamir proposed ideas, and Adleman, the mathematician, kept breaking them.' },
  { key: 'r4', text: 'In April 1977, after a Passover evening at a student’s house, Rivest couldn’t sleep.' },
  { key: 'r5', text: 'By daybreak, the story goes, he had much of the paper written.' },
  { key: 'r6', text: 'The method, named *RSA* after their initials, starts with two primes.', say: 'The method, named R S A after their initials, starts with two primes.' },
  { key: 'r7', gap: 0.8, text: `Let’s build a tiny key. Take the primes ${RP} and ${RQ}, and multiply them to get *${f(N)}*.` },
  { key: 'r8', text: `Pick ${E} as the power that locks. From the primes, we can work out that the power that unlocks is ${D}.` },
  { key: 'r10', text: `The public key is just ${f(N)} and ${E}. Anyone can have it.` },
  { key: 'r11', gap: 0.8, text: `To send Bob ${M}, raise it to the power of ${E} and keep the remainder after dividing by ${f(N)}.` },
  { key: 'r12', text: `That power has ${NUM.DIG17} digits, but only the remainder, *${f(C)}*, travels.` },
  { key: 'r13', text: `Bob raises that to the power of ${D}, divides by ${f(N)} again, and out comes ~${M}~.` },
  { key: 'r15', text: `Finding ${D} needs the two primes, and the public key shows only their product.` },
  { key: 'r16', text: 'Real systems also add random padding. Bare RSA like this is just a demonstration.', say: 'Real systems also add random padding. Bare R S A like this is just a demonstration.' },

  // ---- 5 easy one way
  { key: 'e1', gap: 4.2, chapter: 'Easy one way', text: 'It all rests on a lopsided pair of jobs. Multiplying is easy, and factoring is hard.' },
  { key: 'e2', text: `To factor ${f(N)}, try dividing by each prime in turn. The ${NUM.TRY_N}th prime, which is ${RQ}, works.` },
  { key: 'e3', text: 'Jevons’s number needs thousands of tries. It’s 89,681 times 96,079.' },
  { key: 'e4', text: 'Charles Busk found that in 1889.' },
  { key: 'e5', gap: 0.8, text: 'In August 1977, Martin Gardner described RSA in *Scientific American*, along with a challenge message locked with a 129-digit number.', say: 'In August 1977, Martin Gardner described R S A in Scientific American, along with a challenge message locked with a 129 digit number.' },
  { key: 'e7', text: 'Rivest estimated that, with the best methods of the day, a 125-digit number would take 40 quadrillion years.', say: 'Rivest estimated that, with the best methods of the day, a 125 digit number would take 40 quadrillion years.' },
  { key: 'e8', text: 'But better methods came, and about 600 volunteers, with some 1,600 computers, cracked it in 1994.' },
  { key: 'e9', text: 'The message read, “The magic words are squeamish ossifrage.”', say: 'The message read, the magic words are squeamish ossifrage.' },
  { key: 'e10', gap: 0.8, text: 'So keys grew. Public factoring records are under 300 digits; a 2,048-bit key has 617.', say: 'So keys grew. Public factoring records are under 300 digits. A 2,048 bit key has 617.' },
  { key: 'e11', text: 'And no one has proved that factoring is hard. There’s just no fast way known on ordinary computers.' },

  // ---- 6 signed
  { key: 's1', gap: 4.2, chapter: 'Signed', text: 'Run the same maths the other way, and you get something just as useful, which is a *signature*.' },
  { key: 's2', text: 'Diffie and Hellman proposed digital signatures in 1976, and RSA made them work.', say: 'Diffie and Hellman proposed digital signatures in 1976, and R S A made them work.' },
  { key: 's3', text: `Bob locks a message with his private ${D}. Anyone can open it with his public ${E}.` },
  { key: 's4', text: `Signing ${SIGM} gives ${SIG}, and raising ${SIG} to the power of ${E} gives back ${SIGM}.` },
  { key: 's5', text: `Only the holder of ${D} could have made ${SIG}, so it proves who signed.` },
  { key: 's6', text: 'In practice you sign a short fingerprint of the message, called a *hash*.' },
  { key: 's7', gap: 0.8, text: 'Signatures also close a gap in key exchange, one that lets an attacker sit in the middle.' },
  { key: 's8', text: 'Mallory sits between Alice and Bob and runs one exchange with each, posing as the other.' },
  { key: 's9', text: 'Each thinks they share a key with the other. Both share one with Mallory, who reads everything.' },
  { key: 's10', text: 'Plain Diffie–Hellman can’t tell who is really on the other end.' },
  { key: 's11', text: 'On the web, the proof is a *certificate*, which is the site’s public key, signed by an authority your browser trusts.' },

  // ---- 7 found first, in secret
  { key: 'g1', gap: 4.2, chapter: 'Found first, in secret', text: 'There’s a twist, kept secret for more than twenty years.' },
  { key: 'g2', text: 'In January 1970, at Britain’s GCHQ, James Ellis wrote a secret report on “non-secret encryption”.', say: 'In January 1970, at Britain’s G C H Q, James Ellis wrote a secret report on non-secret encryption.' },
  { key: 'g3', text: 'The idea came from a wartime Bell Labs paper, in which the receiver adds noise to a call, then removes it.' },
  { key: 'g4', text: 'Ellis argued that it was possible, but he couldn’t see a way to build it.' },
  { key: 'g5', text: 'In September 1973, a young mathematician, Clifford Cocks, joined and heard about the idea.' },
  { key: 'g6', text: 'Cocks knew number theory. He chose prime factoring, and quickly found what we now call RSA.', say: 'Cocks knew number theory. He chose prime factoring, and quickly found what we now call R S A.' },
  { key: 'g7', text: 'He didn’t even write it down at the time.' },
  { key: 'g8', text: 'In 1974, his colleague Malcolm Williamson found what we now call Diffie–Hellman key exchange.' },
  { key: 'g9', text: 'With a military focus and little computing power, GCHQ found no use for it, and it stayed secret.', say: 'With a military focus and little computing power, G C H Q found no use for it, and it stayed secret.' },
  { key: 'g10', gap: 0.8, text: 'It was made public in 1997, when Cocks gave a talk on 18 December.', say: 'It was made public in 1997, when Cocks gave a talk on the 18th of December.' },
  { key: 'g11', text: 'James Ellis had died on 25 November, a month too soon.', say: 'James Ellis had died on the 25th of November, a month too soon.' },
  { key: 'g12', text: 'As far as anyone knows, the Stanford and MIT teams found it all on their own.', say: 'As far as anyone knows, the Stanford and M I T teams found it all on their own.' },

  // ---- 8 every secure page
  { key: 'p1', gap: 4.2, chapter: 'Every secure page', text: 'So what happens when you open a secure web page today?' },
  { key: 'p2', text: 'Your browser and the server run a fresh key exchange, often on elliptic curves rather than a clock.' },
  { key: 'p3', text: 'The server signs the exchange, and its certificate shows that the signature really is the site’s.' },
  { key: 'p4', text: 'Public-key maths is slow, so it only sets up a key; a fast ordinary cipher carries the page.' },
  { key: 'p5', text: 'The exchange keys are thrown away afterwards, so a key stolen later can’t unlock today’s traffic.' },
  { key: 'p6', gap: 0.8, text: 'RSA keys usually have *2,048 bits* or more. On elliptic curves, *256* bits does as well as 3,072.', say: 'R S A keys usually have 2,048 bits or more. On elliptic curves, 256 bits does as well as 3,072.' },

  // ---- 9 the quantum question
  { key: 'q1', gap: 4.2, chapter: 'The quantum question', text: 'In 1994, Peter Shor showed how a quantum computer could factor huge numbers quickly.' },
  { key: 'q2', text: 'It solves discrete logarithms too, so it would break RSA and Diffie–Hellman alike.', say: 'It solves discrete logarithms too, so it would break R S A and Diffie–Hellman alike.' },
  { key: 'q3', text: 'No such machine exists yet. Demonstrations have factored only 15 and 21, helped by knowing the answer.' },
  { key: 'q4', text: 'Breaking real keys might take millions of qubits, because of error correction.' },
  { key: 'q5', gap: 0.8, text: 'But a message recorded today could be decrypted later. This is called *harvest now, decrypt later*.' },
  { key: 'q6', text: 'In August 2024, NIST, the US standards institute, published three post-quantum standards, one for keys and two for signatures.', say: 'In August 2024, N I S T, the U S standards institute, published three post-quantum standards, one for keys and two for signatures.' },
  { key: 'q7', text: 'The key one, ML-KEM, rests on lattice problems, which are thought to resist quantum attacks.', say: 'The key one, M L Kem, rests on lattice problems, which are thought to resist quantum attacks.' },
  { key: 'q9', text: 'Chrome and Firefox already mix it into their key exchange, alongside a classic elliptic curve.' },

  // ---- recap
  { key: 'z1', gap: 1.6, text: 'So strangers can agree on a key in public, because some sums are easy one way and hard the other.' },
  { key: 'z2', text: 'A lock can be public, if only its owner knows the trapdoor.' },
  { key: 'z3', text: 'And run backwards, the same maths signs.' },
  { key: 'z4', gap: 0.8, text: 'Jevons was wrong about his number, but right that some sums are far easier done than undone.' },
  { key: 'z5', text: 'Every secure connection begins that way, with two strangers, in public, agreeing on a secret only they know.' },
];

export const HOLD = { o7: 0.6, k6: 0.6, m4: 0.8, m10: 0.8, m16: 0.6, r13: 0.6, e3: 0.4, e9: 0.8, s4: 0.6, s9: 0.6, g11: 0.8, q9: 0.6, z5: 9 };
