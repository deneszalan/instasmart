// "Enigma: the letter that never came out as itself", a long-form explainer (16:9).
// One line per caption; `say` is what the voice reads when it differs (the final voice is a cloned narrator, so
// every number and year is written in words there). `gap` is the pause before a line; chapter openings get 4.2 s
// for their title card. The machine in the scene is a real Enigma I in code (rotors I-III, reflector B, rings,
// plugboard, double step), checked against the documented sequences AAAAA -> BDZGO and EWTYX and ADU -> ADV AEW BFX;
// every number marked "computed" comes from it (node sim.mjs prints them all).
//
// Facts and where they come from (research/ holds the raw pages):
// - Wikipedia, "Enigma machine": one person types, another writes down which of the 26 lamps lit; Enigma I from
//   1930; every key press steps one or more rotors before the electrical connection is made; current runs from the
//   battery through the key, plugboard, entry wheel, three rotors, the reflector, back by an entirely different path,
//   to light a lamp; right rotor steps on every key press; ratchet and pawl, notch; double-stepping; period
//   26 x 25 x 26 = 16,900; messages limited to a few hundred letters, no chance of repeating a rotor position in one;
//   the reflector made Enigma self-reciprocal (no switch between enciphering and deciphering) and meant no letter
//   ever encrypted to itself, "a severe cryptological flaw that was subsequently exploited by codebreakers"; plugboard
//   swaps letters before and after the rotors, up to 13 pairs, 10 normally; the count for three rotors from five,
//   26^3 positions and ten cables = 158,962,555,217,826,360,000 (ring settings not counted); users confident, a
//   brute-force attack not feasible; Hans-Thilo Schmidt spied for the French, keys for September and October 1932;
//   Poznan students knew German because the area was German before WWI; Polish Cipher Bureau read Enigma from
//   January 1933; two extra rotors in 1938 meant ten times as many bomby; "procedural flaws, operator mistakes ...
//   and Allied capture of key tables and hardware" enabled success; the break not disclosed until the 1970s.
// - Wikipedia, "Enigma rotor details": the wirings of rotors I, II, III and reflector B; notches Q, E, V; the test
//   sequences; "No letter can map to itself ... the same wires being used for forwards and backwards legs."
// - Wikipedia, "Cryptanalysis of the Enigma": the reflector's thirteen paired connections; the 1929 Poznan course;
//   Rejewski, Zygalski, Rozycki hired 1 September 1932; Rejewski worked on Enigma alone a couple of hours a day from
//   late 1932; the global ground setting and the doubled message key; cycles pair with cycles of equal length; the
//   plugboard changes the letters in the cycles but not their number or lengths; the card catalogue of 105,456
//   settings, made with the cyclometer, over a year, then keys in 12-20 minutes; the early key sheet (day 31: I II III,
//   rings W N M, plugs HK CN IO FY JM LW, ground RAO) used in chapter 4; the change of 15 September 1938; "females";
//   Zygalski sheets cut with razor blades, holes where a female could occur; bomba = six sets of rotors, about two
//   hours; 15 December 1938 two more rotors, 6 -> 60 wheel orders; the July 1939 conference near Warsaw (the pages
//   disagree on 25-26 or 26-27 July, so the script says "late July"); Turing and Welchman reported to Bletchley Park
//   on 4 September 1939; the doubled key dropped in May 1940; crib = known or suspected plaintext; "Keine besonderen
//   Ereignisse", a phrase regularly used by one German outpost in North Africa; crib-dragging; the bombe designed by
//   Turing, built by Harold Keen of BTM; the diagonal board from Welchman's observation that plug connections are
//   reciprocal; Victory delivered 18 March 1940, Agnes with the diagonal board 8 August 1940; about 2,000 Wrens by
//   1945; naval Enigma three rotors from eight, more secure procedures; Turing took naval Enigma "because no one else
//   was doing anything about it and I could have it to myself"; pinches; M4 for U-boats from 1 February 1942;
//   regular reading of U-boat traffic restarted in December 1942; the last message from Cuxhaven (7 May 1945).
// - Wikipedia, "Marian Rejewski": the theorem (conjugate permutations have the same cycle structure) that Cipher A.
//   Deavours called "the theorem that won World War II"; documents given to him about 9-10 December 1932; the guessed
//   alphabetical entry wheel; all wirings recovered by the end of 1932 (he never saw a military machine: "sight-
//   unseen"); 60 bomby would have cost fifteen times the Bureau's annual equipment budget; Hinsley's estimate.
// - Wikipedia, "Hans-Thilo Schmidt": sold Enigma secrets to the French. "Cipher Bureau (Poland)": Knox's first
//   question at Pyry was about the entry-drum connections; he was "mortified" at how simple the answer was.
// - Wikipedia, "Zygalski sheets", "Bomba (cryptography)", "Bombe" (menus, loops, contradictions, stops; each bombe
//   about a ton; about 20 minutes for all 17,576 positions of one rotor order), "Bletchley Park" (8,995 people in
//   January 1945, about three-quarters women), "Battle of the Atlantic" (U-110 on 9 May 1941; convoys routed around
//   patrol lines through late 1941; ten months unread from February 1942; U-559 off Port Said on 30 October 1942),
//   "German submarine U-559" (Fasson and Grazier drowned inside), "Ultra (cryptography)" (Hinsley's "no less than
//   two years"; wide disagreement, radar), "The Imitation Game" (historical inaccuracies: the machine named
//   "Christopher", a lone effort; in reality "Victory", collaborative, 200+ bombes).
// - GCHQ's release of 8 May 2020, reported by The Times of Israel and others: "Closing down forever - all the best
//   - goodbye."
// Simulated (computed by the scene's machine): the lamps in the cold open; the 456,976-press self test; the loops of
// the 1932 key sheet (with reflector A, in use until November 1937, its day 31 gives exactly the cycles of the worked
// example in "Cryptanalysis of the Enigma": ANPLXMJFI, CYDQWVOUG, BSZ, ETK, H, R; the scene checks this); the Zygalski stack (a made-up day, seven sheets); the crib message (made up, message key MLH);
// the bombe run on its menu (2 stops with the diagonal board, 662 without).
export const NUM = { selfTests: 456976, period: 16900, cribPlaces: 16, ruledOut: 9, survivors: 7, stops: 2, stopsNoDiagonal: 662, zSheets: 7 };

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Press a key on this machine, and a lamp lights up another letter.' },
  { key: 'o2', text: 'Press the same key again, and a different lamp lights.' },
  { key: 'o3', text: 'In the war, the army’s version could be set up in nearly *159 quintillion* ways.', say: 'In the war, the army’s version could be set up in nearly a hundred and fifty-nine quintillion ways.' },
  { key: 'o4', text: 'But it had one odd habit. It never turned a letter into ~itself~.' },
  { key: 'o5', gap: 0.6, text: 'That small rule, and the people who saw what it meant, helped break *Enigma*.' },

  // ---- 1 one key press
  { key: 'k1', gap: 4.2, chapter: 'One key press', text: 'Enigma has 26 keys and 26 lamps. One operator types; another writes down the lamps that light.', say: 'Enigma has twenty-six keys and twenty-six lamps. One operator types; another writes down the lamps that light.' },
  { key: 'k3', text: 'Let’s follow one key press. First, the key turns the right-hand *rotor* one step, before any current flows.' },
  { key: 'k4', text: 'Then the current runs to the *plugboard*, where a cable can swap it for another letter.' },
  { key: 'k5', text: 'Next come three rotors, each wired inside to turn one letter into another.' },
  { key: 'k6', text: 'At the far end, the *reflector* sends the current back through the rotors by another route.' },
  { key: 'k7', text: 'Back through the plugboard, and one lamp lights. Here, A became C.', say: 'Back through the plugboard, and one lamp lights. Here, the letter A became C.' },
  { key: 'k8', gap: 0.8, text: 'Press A again. The rotor has moved, so every wire has shifted, and A becomes N.', say: 'Press A again. The rotor has moved, so every wire has shifted, and A becomes the letter N.' },
  { key: 'k9', text: 'Once per turn, a notch lets the right rotor push the middle one along, like a car’s odometer.' },
  { key: 'k10', text: 'Almost. The middle rotor sometimes steps twice in a row, which is called the *double step*.' },
  { key: 'k11', text: 'The rotors come back to where they started only after *16,900* key presses.', say: 'The rotors come back to where they started only after sixteen thousand nine hundred key presses.' },

  // ---- 2 the reflector
  { key: 'r1', gap: 4.2, chapter: 'The reflector', text: 'The reflector joins the 26 letters in *13 pairs*, and turns the current round.', say: 'The reflector joins the twenty-six letters in thirteen pairs, and turns the current round.' },
  { key: 'r2', text: 'So the machine works both ways. At the same setting, press C, and the current runs backwards to A.', say: 'So the machine works both ways. At the same setting, press the letter C, and the current runs backwards to A.' },
  { key: 'r3', text: 'The receiver sets up a machine the same way, types in the ciphertext, and out comes the message.' },
  { key: 'r4', gap: 0.8, text: 'But there’s a price. Could a key ever light its own lamp?' },
  { key: 'r5', text: 'Only if the current came back along the very wire it went in on.' },
  { key: 'r6', text: 'That would mean the reflector joining a letter to itself, and it never does.' },
  { key: 'r7', text: 'So no letter is ever enciphered as itself. Press A, and you get any letter *but* A.', say: 'So no letter is ever enciphered as itself. Press A, and you get any letter but A.' },
  { key: 'r8', text: 'We tried every key at every rotor position. Not one lit its own lamp.' },
  { key: 'r9', text: 'The plugboard can’t change that, because it swaps a letter on the way in and swaps it back on the way out.' },

  // ---- 3 the number
  { key: 'n1', gap: 4.2, chapter: '159 quintillion', text: 'How many ways could the army’s Enigma be set up, with three rotors from a box of five and ten cables?' },
  { key: 'n2', text: 'Choosing the rotors and their order gives 5 × 4 × 3, which is *60* ways.', say: 'Choosing the rotors and their order gives five times four times three, which is sixty ways.' },
  { key: 'n3', text: 'Their starting positions give 26 × 26 × 26, which is *17,576*.', say: 'Their starting positions give twenty-six times twenty-six times twenty-six, which is seventeen thousand five hundred and seventy-six.' },
  { key: 'n4', text: 'Ten cables pairing up letters on the plugboard give about *151 trillion* ways.', say: 'Ten cables pairing up letters on the plugboard give about a hundred and fifty-one trillion ways.' },
  { key: 'n5', text: 'Multiply them: nearly *159 quintillion* settings, even before the rotors’ ring settings.', say: 'Multiply them, and you get nearly a hundred and fifty-nine quintillion settings, even before the rotors’ ring settings.' },
  { key: 'n6', text: 'At a million settings a second, trying them all would take about *five million years*.', say: 'At a million settings a second, trying them all would take about five million years.' },
  { key: 'n7', gap: 0.8, text: 'But nobody broke Enigma by trying every setting. They found shortcuts, and the first came from Poland.' },

  // ---- 4 Warsaw, 1932
  { key: 'p1', gap: 4.2, chapter: 'Warsaw, 1932', text: 'In 1929, Poland’s Cipher Bureau trained German-speaking mathematics students in Poznań, in secret.', say: 'In nineteen twenty-nine, Poland’s Cipher Bureau trained German-speaking mathematics students in Poznan, in secret.' },
  { key: 'p2', text: 'In September 1932, the Bureau took on three of them, Marian Rejewski, Jerzy Różycki and Henryk Zygalski.', say: 'In September nineteen thirty-two, the Bureau took on three of them, Marian Rayefski, Yerzy Roozhitski, and Henrik Zigalski.' },
  { key: 'p3', text: 'Rejewski spotted a German habit. Each message began with its own rotor setting, typed *twice*, from a start shared that day.', say: 'Rayefski spotted a German habit. Each message began with its own rotor setting, typed twice, from a start shared that day.' },
  { key: 'p4', text: 'So the 1st and 4th letters hid the same letter, and so did the 2nd and 5th, and the 3rd and 6th.', say: 'So the first and fourth letters hid the same letter, and so did the second and fifth, and the third and sixth.' },
  { key: 'p5', text: 'From a day’s messages, those links join up into *loops*, which come in pairs of the same length.', say: 'From a day’s messages, those links join up into loops, which come in pairs of the same length.' },
  { key: 'p6', text: 'And the plugboard changes which letters sit in each loop, but never how long the loops are.' },
  { key: 'p7', text: 'A cryptology scholar later called this fact about permutations “the theorem that won World War Two.”', say: 'A cryptology scholar later called this fact about permutations the theorem that won World War Two.' },
  { key: 'p8', gap: 0.8, text: 'Rejewski still needed the rotors’ wiring. Help came from a spy.', say: 'Rayefski still needed the rotors’ wiring. Help came from a spy.' },
  { key: 'p9', text: 'Hans-Thilo Schmidt, at Germany’s Cipher Office, sold secrets to the French, including two months of keys from 1932.', say: 'Hans-Thilo Schmidt, at Germany’s Cipher Office, sold secrets to the French, including two months of keys from nineteen thirty-two.' },
  { key: 'p10', text: 'In December, the French shared them with Poland.' },
  { key: 'p11', text: 'Another puzzle was the keys’ wiring. Rejewski guessed plain order, A to A and B to B, and was right.', say: 'Another puzzle was the keys’ wiring. Rayefski guessed plain order, A to A and B to B, and he was right.' },
  { key: 'p12', text: 'By the end of 1932, he had all three rotors and the reflector, without ever seeing the machine.', say: 'By the end of nineteen thirty-two, he had all three rotors and the reflector, without ever seeing the machine.' },

  // ---- 5 sheets and bombs
  { key: 'z1', gap: 4.2, chapter: 'Sheets and bombs', text: 'From January 1933, the Poles read Enigma. As the Germans tightened their rules, they kept finding new ways in.', say: 'From January nineteen thirty-three, the Poles read Enigma. As the Germans tightened their rules, they kept finding new ways in.' },
  { key: 'z2', text: 'In September 1938, each operator began choosing his own starting position, but still typed the key twice.', say: 'In September nineteen thirty-eight, each operator began choosing his own starting position, but still typed the key twice.' },
  { key: 'z3', text: 'Sometimes a repeated letter came out the same twice. Zygalski punched sheets with holes wherever that could happen.', say: 'Sometimes a repeated letter came out the same twice. Zigalski punched sheets with holes wherever that could happen.' },
  { key: 'z4', text: 'Stack the sheets for a day’s messages, line them up, and fewer and fewer holes shine through.' },
  { key: 'z5', text: 'Here are seven, from a simulated day. The one hole left gives away the ring settings.' },
  { key: 'z6', gap: 0.8, text: 'Rejewski also designed the *bomba*, which was in effect six Enigmas wired together and driven by a motor.', say: 'Rayefski also designed the bomba, which was in effect six Enigmas wired together and driven by a motor.' },
  { key: 'z7', text: 'Six were built, one for each order of the rotors. A day’s key took about two hours.' },
  { key: 'z8', text: 'Then, in December 1938, the Germans added two more rotors. Three from five made *60* orders, not six.', say: 'Then, in December nineteen thirty-eight, the Germans added two more rotors. Three from five made sixty orders, not six.' },
  { key: 'z9', text: 'Sixty bombas would have cost fifteen times the Bureau’s yearly budget for equipment.' },
  { key: 'z10', gap: 0.8, text: 'So in late July 1939, at a secret site outside Warsaw, the Poles showed French and British codebreakers everything.', say: 'So in late July nineteen thirty-nine, at a secret site outside Warsaw, the Poles showed French and British codebreakers everything.' },
  { key: 'z12', text: 'Five weeks later, Germany invaded Poland.' },

  // ---- 6 cribs
  { key: 'c1', gap: 4.2, chapter: 'Cribs', text: 'At Bletchley Park, Alan Turing and Gordon Welchman reported for work the day after Britain declared war.' },
  { key: 'c2', text: 'Turing expected the Germans to stop typing the key twice. In May 1940, they did.', say: 'Turing expected the Germans to stop typing the key twice. In May nineteen forty, they did.' },
  { key: 'c3', text: 'So Bletchley leaned on *cribs*, which were stretches of a message they could guess, like set phrases.' },
  { key: 'c4', text: 'One outpost in North Africa regularly sent a phrase meaning ~nothing special to report~.' },
  { key: 'c5', text: 'But where in the message is it? Slide the crib along the ciphertext, one place at a time.' },
  { key: 'c6', text: 'Enigma never enciphers a letter as itself, so wherever a crib letter sits on the same letter, the crib can’t be there.' },
  { key: 'c7', text: 'In the second place, an R sits on an R, so that place is crossed out.' },
  { key: 'c8', text: 'Slide on, and cross out every clash.' },
  { key: 'c9', text: 'Of these *16* places, *9* are ruled out, without any machine at all.', say: 'Of these sixteen places, nine are ruled out, without any machine at all.' },

  // ---- 7 the bombe
  { key: 'b1', gap: 4.2, chapter: 'The bombe', text: 'A crib in the right place still doesn’t give you the key. For that, Turing designed the *bombe*.' },
  { key: 'b2', text: 'Line the crib up with the ciphertext, and each pair of letters is a link.' },
  { key: 'b3', text: 'Draw all the links, and you get a *menu*. Where links close into ~loops~, the menu gets powerful.' },
  { key: 'b4', text: 'At each rotor position, the bombe guesses one letter’s plug partner and follows the consequences.' },
  { key: 'b5', text: 'A contradiction means that position is impossible, and the drums turn on.' },
  { key: 'b6', text: 'Gordon Welchman added the *diagonal board*, which uses the rule that if A is plugged to B, B is plugged to A.' },
  { key: 'b7', text: 'We ran our menu through every position. Without the diagonal board, it stopped *662* times.', say: 'We ran our menu through every position. Without the diagonal board, it stopped six hundred and sixty-two times.' },
  { key: 'b8', text: 'With it, it stopped just *twice*. One stop was false. The other was right, and showed E plugged to J.', say: 'With it, it stopped just twice. One stop was false. The other was right, and showed the letter E plugged to J.' },
  { key: 'b9', gap: 0.8, text: 'The first bombe, *Victory*, arrived in March 1940, built by Harold Keen’s engineers.', say: 'The first bombe, Victory, arrived in March nineteen forty, built by Harold Keen’s engineers.' },
  { key: 'b10', text: 'By 1945 there were about two hundred, run by some two thousand Wrens of the Royal Navy.', say: 'By nineteen forty-five there were about two hundred, run by some two thousand Wrens of the Royal Navy.' },

  // ---- 8 the U-boat war
  { key: 'u1', gap: 4.2, chapter: 'The U-boat war', text: 'The hardest Enigma was the navy’s, with three rotors from eight and stricter procedures.' },
  { key: 'u2', text: 'Turing took it on, he said, because no one else was doing anything about it, and he could have it to himself.' },
  { key: 'u3', text: 'It also took captured papers. In May 1941, sailors seized codebooks and keys from the submarine U-110.', say: 'It also took captured papers. In May nineteen forty-one, sailors seized codebooks and keys from the submarine U one-ten.' },
  { key: 'u4', text: 'Through late 1941, decrypts helped steer convoys around the waiting U-boats.', say: 'Through late nineteen forty-one, decrypts helped steer convoys around the waiting U-boats.' },
  { key: 'u5', text: 'Then, on 1 February 1942, the U-boats switched to a new Enigma with *four* rotors.', say: 'Then, on the first of February nineteen forty-two, the U-boats switched to a new Enigma with four rotors.' },
  { key: 'u6', text: 'For ten months, Bletchley couldn’t read them, and the wolf packs ravaged convoys.' },
  { key: 'u7', text: 'In October 1942, off Port Said, sailors from HMS Petard climbed into the sinking U-559 for its papers.', say: 'In October nineteen forty-two, off Port Said, sailors from H M S Petard climbed into the sinking U five-five-nine for its papers.' },
  { key: 'u8', text: 'Two of them, Tony Fasson and Colin Grazier, were still inside when it sank, and drowned.' },
  { key: 'u9', text: 'By December 1942, U-boat messages were being read again.', say: 'By December nineteen forty-two, U-boat messages were being read again.' },
  { key: 'u10', text: 'How much this decided the Atlantic is still argued. Radar and much else mattered too.' },

  // ---- 9 never itself
  { key: 'f1', gap: 4.2, chapter: 'Never itself', text: 'In the film The Imitation Game, Turing builds one machine almost alone, and calls it Christopher.' },
  { key: 'f2', text: 'In fact, the first bombe was Victory, and breaking Enigma took thousands of people.' },
  { key: 'f3', text: 'By January 1945, Bletchley Park and its outstations had almost 9,000 staff. About three quarters were women.', say: 'By January nineteen forty-five, Bletchley Park and its outstations had almost nine thousand staff. About three quarters were women.' },
  { key: 'f4', text: 'Harry Hinsley, a veteran and later Bletchley’s official historian, judged their work shortened the war by at least two years.' },
  { key: 'f5', text: 'Other historians find any such number too precise. No one can run a war twice.' },
  { key: 'f6', gap: 0.8, text: 'One of the last messages Bletchley decoded was sent from Cuxhaven on 7 May 1945. British troops had entered the town.', say: 'One of the last messages Bletchley decoded was sent from Cuxhaven, on the seventh of May, nineteen forty-five. British troops had entered the town.' },
  { key: 'f7', text: 'The operator signed off: “Closing down forever. All the best. Goodbye.”', say: 'The operator signed off. Closing down forever. All the best. Goodbye.' },
  { key: 'f8', gap: 0.8, text: 'The reflector made Enigma convenient. It also meant no letter could ever be itself.' },
  { key: 'f9', text: 'Add German habits, captured papers and thousands of patient people, and that was enough.' },
  { key: 'f10', text: 'Press A, and you could get any letter at all, except A.' },
];

export const HOLD = { k7: 1.0, k11: 0.6, r3: 0.8, r8: 0.8, n5: 1.2, p6: 0.6, p12: 0.6, z5: 1.4, c8: 2.4, c9: 0.6, b5: 0.6, b8: 0.6, u6: 0.6, f7: 1.6, f10: 9 };
