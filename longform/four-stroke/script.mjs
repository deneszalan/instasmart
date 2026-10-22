// "The four-stroke engine: two turns, one push", a long-form explainer (16:9).
// The narration, one line per caption. `say` is what the voice reads when it differs from the caption
// (the final voice is a cloned narrator, so every number and year is written out in words there).
// `gap` is the pause before the line (seconds); chapter openings get a longer one for their title card.
//
// Facts and sources (English Wikipedia unless noted; raw texts read 22 Oct 2026):
// - "Four-stroke engine": the four strokes (intake TDC→BDC with the intake valve open, drawing in the
//   air-fuel mixture by a partial vacuum; compression with both valves closed; power, ignited near TDC by a
//   spark plug, or by the heat of compression in a diesel, "at this point the crankshaft has completed a
//   full 360 degree revolution"; exhaust with the exhaust valve open). A stroke is the piston's full travel
//   in either direction. Camshaft at half crankshaft speed; cams push the valves through tappets. Valve
//   springs close the valves (valve float). Otto was "a traveling salesman for a grocery concern"; Lenoir's
//   1860 engine ran at 4% efficiency; Otto's 1862 compressing engine ran "no more than a few minutes prior
//   to its destruction"; NA Otto & Cie with Langen in 1864, the first engine production company; Daimler
//   and Maybach's high-speed Otto engine of 1883. Spark close to TDC at low rpm, advanced as rpm rises
//   because the flame front's speed does not change. Pre-ignition with higher compression; octane rating =
//   resistance to self-ignition, allowing higher compression. "Otto engines are about 30% efficient."
//   Most common engine design for motorized land transport; diesels can be four- or two-stroke.
// - "Otto engine": atmospheric engine at 12% efficiency, gold medal at the 1867 World's Fair in Paris; the
//   Rings-Schumm engine "appeared in autumn 1876 and was immediately successful", the first commercially
//   successful engine with in-cylinder compression; "In 1886, the German patent office nullified the Deutz
//   patent ... due to the discovery of a previous patent for a four-cycle engine by ... Beau de Rochas";
//   "By 1889 more than 50 companies were manufacturing Otto design engines."
// - "Nicolaus Otto": in late autumn 1860 Otto learned of Lenoir's engine; NA Otto & Cie (31 March 1864),
//   "the world's first company focused entirely on ... internal combustion engines"; Otto lost a patent.
// - "Alphonse Beau de Rochas": "the first to patent the four-stroke engine in 1862", "did not build one".
//   French Wikipedia: patent application of 16 January 1862 (the "Otto cycle" article says 1861; we say 1862).
// - "Otto cycle": processes 0–1 intake at constant pressure, 1–2 isentropic compression, 2–3 constant-volume
//   heat addition at TDC, 3–4 isentropic expansion, 4–1 constant-volume heat rejection at BDC, 1–0 exhaust;
//   η = 1 − 1/r^(γ−1), γ = 1.4 for air; "approximately 10:1 for typical automobiles"; knock limits r; the
//   four-stroke principle "is commonly known as the Otto cycle".
// - "Pressure–volume diagram": the net work is the area enclosed by the cycle.
// - "Compression ratio": static ratio = volume at bottom of stroke / volume at top; petrol car engines of the
//   past 20 years typically 8:1 to 12:1; a higher ratio extracts more work from the same fuel.
// - "Engine knocking": pockets of mixture explode outside the flame front; metallic "pinging"; damage; knock
//   sensors retard the ignition; spark some 10 to 40 crank degrees before TDC.
// - "Ignition timing": peak pressure should come after TDC; advance grows with engine speed.
// - "Valve timing": valves open before TDC/BDC (lead) and close after (lag); overlap at the end of the
//   exhaust stroke, when the exhaust's velocity helps draw in the fresh charge; designers close the exhaust
//   valve as the fresh charge reaches it; race engines use much overlap, road cars idle below 1000 rpm;
//   variable valve timing. The angles drawn are illustrative, not from a source.
// - "Firing order": even firing interval = 720° / number of cylinders; straight-four 1-3-4-2, straight-six
//   1-5-3-6-2-4; even intervals run smoother. "Straight-four engine": with five or more cylinders the power
//   strokes overlap. "Flywheel": it stores energy from the firing piston and returns it to compress the next
//   charge. "Crankshaft": converts reciprocating motion into rotation.
// - "Piston motion equations": x = r cos A + √(l² − r² sin² A) (used for every piston in the scene).
// - "Diesel engine": compression ignition, only air compressed, typically 15:1 to 23:1, fuel injected near
//   TDC; no pre-ignition risk because only air is compressed; torque set by the fuel quantity, not a throttle;
//   first ignition 10 August 1893; Schröter's test of 17 February 1897: 26.2% effective efficiency; low-speed
//   diesels up to 55%.
// Computed in scene.js: ideal Otto efficiency for r = 4, 10, 16 (42.6%, 60.2%, 67.0%); the piston's travel
// after a quarter turn (more than half the stroke for any finite rod); 3,000 rpm = 50 turns and 25 power
// strokes per second per cylinder; the idealised gas torque of 1, 4 and 6 cylinders.
export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'At 3,000 rpm, a car engine’s crankshaft turns *50 times a second*.', say: 'At three thousand revolutions a minute, a car engine’s crankshaft turns fifty times a second.' },
  { key: 'o2', text: 'Yet each cylinder burns fuel only 25 times a second: once every *two turns*.', say: 'Yet each cylinder burns its fuel only twenty-five times a second. Once every two turns.' },
  { key: 'o3', text: 'Its piston makes four trips for every burn, and only one of them pushes.' },
  { key: 'o4', gap: 0.7, text: 'This is the four-stroke cycle, first patented by a man who never built one…', say: 'This is the four-stroke cycle. It was first patented by a man who never built one,' },
  { key: 'o5', text: '…and made to work by a former grocery salesman, who later lost his patent.', say: 'and made to work by a former grocery salesman, who later lost his patent.' },
  // ---- 1 the machine
  { key: 'm1', gap: 4.2, chapter: 'The machine', text: 'Let’s open one up. This is a simplified diagram of a single cylinder.' },
  { key: 'm2', text: 'Inside the cylinder, a *piston* slides up and down.' },
  { key: 'm3', text: 'A *connecting rod* links the piston to the *crankshaft*, which turns.' },
  { key: 'm4', text: 'At the top, two *valves*: one lets air and fuel in, the other lets burnt gas out.' },
  { key: 'm5', text: 'Cams on a *camshaft* push them open, and springs close them again.' },
  { key: 'm6', text: 'Between them sits the *spark plug*.' },
  { key: 'm7', gap: 0.7, text: 'The piston’s highest point is *top dead centre*; its lowest, *bottom dead centre*.' },
  { key: 'm8', text: 'One trip between them, up or down, is a *stroke*.' },
  { key: 'm9', gap: 0.7, text: 'As the crank turns, the piston follows, but not in a perfectly even rhythm.' },
  { key: 'm10', text: 'After a *quarter turn*, the piston has already covered *more than half* its stroke.' },
  { key: 'm11', text: 'The tilting rod makes it hurry through the top half of the stroke, and dawdle through the bottom.' },
  // ---- 2 four strokes
  { key: 'f1', gap: 4.2, chapter: 'Four strokes', text: 'Now let’s run one cycle, slowly, from the top.' },
  { key: 'f2', text: '~Stroke 1: intake.~ The intake valve opens, and the falling piston draws in air and fuel.', say: 'Stroke one: intake. The intake valve opens, and the falling piston draws in air and fuel.' },
  { key: 'f3', text: 'Stroke 2: compression. Both valves close, and the rising piston squeezes the mixture into about a tenth of the space.', say: 'Stroke two: compression. Both valves close, and the rising piston squeezes the mixture into about a tenth of the space.' },
  { key: 'f4', text: 'By now the crankshaft has turned once, all the way round.' },
  { key: 'f5', text: 'Near the top, the spark plug fires, and the mixture starts to burn.' },
  { key: 'f6', text: '*Stroke 3: power.* The hot, high-pressure gas drives the piston down.', say: 'Stroke three: power. The hot, high-pressure gas drives the piston down.' },
  { key: 'f7', text: 'This is the only stroke that pushes on the crank.' },
  { key: 'f8', text: 'Stroke 4: exhaust. The exhaust valve opens, and the rising piston pushes the burnt gas out.', say: 'Stroke four: exhaust. The exhaust valve opens, and the rising piston pushes the burnt gas out.' },
  { key: 'f9', gap: 0.7, text: 'Then it all starts again. Four strokes, *two turns* of the crank, *one push*.' },
  { key: 'f10', text: 'The camshaft turns at *half* the crankshaft’s speed, so each valve opens once per cycle.' },
  { key: 'f11', gap: 0.7, text: 'What carries the piston through the three strokes that don’t push? A heavy *flywheel*.' },
  { key: 'f12', text: 'It soaks up energy from each power stroke, and gives some back to squeeze the next charge.' },
  // ---- 3 who invented it
  { key: 'h1', gap: 4.2, chapter: 'Who invented it?', text: 'The idea is older than the engine that made it famous.' },
  { key: 'h2', text: 'In 1860, Étienne Lenoir in Paris built a gas engine that burned its fuel without compressing it first.', say: 'In eighteen sixty, Étienne Lenoir, in Paris, built a gas engine that burned its fuel without compressing it first.' },
  { key: 'h3', text: 'It turned only about *4%* of the fuel’s energy into work.', say: 'It turned only about four percent of the fuel’s energy into work.' },
  { key: 'h4', text: 'A travelling salesman in Germany, Nicolaus Otto, learned of it, and started building engines himself.' },
  { key: 'h5', text: 'In 1862 he tried one that compressed its charge first. It ran for a few minutes, then destroyed itself.', say: 'In eighteen sixty-two he tried one that compressed its charge first. It ran for a few minutes, then destroyed itself.' },
  { key: 'h6', gap: 0.7, text: 'That same year, in France, Alphonse Beau de Rochas patented the four-stroke cycle. But he never built an engine.' },
  { key: 'h7', gap: 0.7, text: 'In 1864, Otto and Eugen Langen founded the first company devoted to making engines.', say: 'In eighteen sixty-four, Otto and Eugen Langen founded the first company devoted to making engines.' },
  { key: 'h8', text: 'Their atmospheric engine, at about *12%* efficiency, won a gold medal at the Paris World’s Fair of 1867.', say: 'Their atmospheric engine, at about twelve percent efficiency, won a gold medal at the Paris World’s Fair of eighteen sixty-seven.' },
  { key: 'h9', gap: 0.7, text: 'Then, in 1876, Otto’s company built an engine that compressed its charge in four strokes.', say: 'Then, in eighteen seventy-six, Otto’s company built an engine that compressed its charge in four strokes.' },
  { key: 'h10', text: 'It was an immediate success: the first commercially successful engine to compress its charge in the cylinder.' },
  { key: 'h11', gap: 0.7, text: 'But in 1886 the patent was cancelled in Germany, because Beau de Rochas had patented the cycle first.', say: 'But in eighteen eighty-six the patent was cancelled in Germany, because Beau de Rochas had patented the cycle first.' },
  { key: 'h12', text: 'By 1889, more than 50 companies were building Otto-type engines.', say: 'By eighteen eighty-nine, more than fifty companies were building Otto-type engines.' },
  { key: 'h13', text: 'Two of Otto’s former engineers, Gottlieb Daimler and Wilhelm Maybach, made it small and fast enough for vehicles.' },
  { key: 'h14', text: 'And the cycle still carries his name: the *Otto cycle*.' },
  // ---- 4 pressure and volume
  { key: 'p1', gap: 4.2, chapter: 'Pressure and volume', text: 'Why does squeezing first help so much? Engineers answer with a graph of pressure against volume.' },
  { key: 'p2', text: 'This is the idealised version, the Otto cycle, traced as our engine turns.' },
  { key: 'p3', text: '~Intake:~ the volume grows, at about the pressure outside.', say: 'Intake: the volume grows, at about the pressure outside.' },
  { key: 'p4', text: 'Compression: the volume shrinks tenfold, and the pressure climbs steeply.' },
  { key: 'p5', text: 'Combustion is treated as instant, at the top: the pressure leaps while the volume stays the same.' },
  { key: 'p6', text: '*Power:* the hot gas expands and pushes, and its pressure falls.', say: 'Power: the hot gas expands and pushes, and its pressure falls.' },
  { key: 'p7', text: 'At the bottom, the exhaust valve opens and the pressure drops back.' },
  { key: 'p8', text: 'Exhaust: the piston sweeps the gas out, and the loop closes.' },
  { key: 'p9', gap: 0.7, text: 'The area inside the loop is the *net work*: what the power stroke gave, minus what the compression cost.' },
  // ---- 5 squeeze harder
  { key: 'c1', gap: 4.2, chapter: 'Squeeze harder', text: 'The *compression ratio* is the cylinder’s largest volume divided by its smallest.' },
  { key: 'c2', text: 'In the ideal cycle, the efficiency depends on that ratio alone.' },
  { key: 'c3', text: 'Efficiency is 1 minus r to the power 1 minus γ, where γ, gamma, is 1.4 for air.', say: 'The efficiency is one, minus r to the power of one minus gamma, where gamma is one point four for air.' },
  { key: 'c4', text: 'Squeeze four to one, and the ideal engine turns *43%* of its heat into work.', say: 'Squeeze four to one, and the ideal engine turns forty-three percent of its heat into work.' },
  { key: 'c5', text: 'At ten to one, *60%*. At sixteen to one, *67%*.', say: 'At ten to one, sixty percent. At sixteen to one, sixty-seven percent.' },
  { key: 'c6', gap: 0.7, text: 'Real engines lose heat and friction along the way: a petrol engine turns about *30%* into useful work.', say: 'Real engines lose heat and friction along the way. A petrol engine turns about thirty percent into useful work.' },
  { key: 'c7', text: 'But the lesson holds: squeeze harder, and you get more work from the same fuel.' },
  { key: 'c8', gap: 0.7, text: 'So why do most petrol car engines stop at around 8 to 12 to one?', say: 'So why do most petrol car engines stop at around eight to twelve to one?' },
  { key: 'c9', text: 'Squeezing a gas heats it, and a hot enough mixture can ignite by itself.' },
  { key: 'c10', text: 'Normally, the spark starts a flame front that sweeps across the chamber.' },
  { key: 'c11', text: 'But if the unburnt mixture ahead of the flame gets too hot, pockets of it explode all at once.' },
  { key: 'c12', text: 'That’s *knock*: a metallic pinging, and pressure spikes that can damage the engine.' },
  { key: 'c13', gap: 0.7, text: 'A fuel’s *octane rating* measures how well it resists igniting by itself. Higher octane allows more squeeze.' },
  { key: 'c14', text: 'And modern engines listen for knock with sensors, and fire the spark later when they hear it.' },
  // ---- 6 timing
  { key: 'v1', gap: 4.2, chapter: 'Timing', text: 'So far, everything happened exactly at the top or bottom of a stroke. Real engines don’t wait.' },
  { key: 'v2', text: 'The spark fires early: some 10 to 40 degrees of crank rotation before the top.', say: 'The spark fires early: some ten to forty degrees of crank rotation before the top.' },
  { key: 'v3', text: 'The flame takes time to burn, and the peak pressure should come just after the top.' },
  { key: 'v4', text: 'The flame doesn’t speed up with the engine, so at higher revs the spark needs a longer head start.' },
  { key: 'v5', gap: 0.7, text: 'The valves are early, too. They open before the end of a stroke, and close after it.' },
  { key: 'v6', text: 'At the end of the exhaust stroke, both valves are briefly open at once: *valve overlap*.' },
  { key: 'v7', text: 'The outgoing exhaust is moving fast, and it helps draw the fresh charge in behind it.' },
  { key: 'v8', text: 'Designers aim to close the exhaust valve just as the fresh charge reaches it.' },
  { key: 'v9', gap: 0.7, text: 'Racing engines use lots of overlap. Road engines, which must idle smoothly below 1,000 rpm, use less.', say: 'Racing engines use lots of overlap. Road engines, which must idle smoothly below a thousand revolutions a minute, use less.' },
  { key: 'v10', text: 'Many now shift their camshafts as they run, to get both: power at high revs, and a smooth idle.' },
  // ---- 7 more cylinders
  { key: 'n1', gap: 4.2, chapter: 'More cylinders', text: 'One cylinder gives one push every two turns. That’s a lumpy way to drive a car.' },
  { key: 'n2', text: 'So most car engines have several cylinders on one crankshaft, firing in turn.' },
  { key: 'n3', text: 'Spaced evenly, the power strokes come every *720 degrees* divided by the number of cylinders.', say: 'Spaced evenly, the power strokes come every seven hundred and twenty degrees, divided by the number of cylinders.' },
  { key: 'n4', text: 'With four cylinders, that’s every 180 degrees: a push every half turn.', say: 'With four cylinders, that’s every hundred and eighty degrees: a push every half turn.' },
  { key: 'n5', text: 'A straight four usually fires its cylinders in the order *1, 3, 4, 2*.', say: 'A straight four usually fires its cylinders in the order one, three, four, two.' },
  { key: 'n6', gap: 0.7, text: 'Here is the twisting force that the gas puts on the crank, in an idealised model.' },
  { key: 'n7', text: 'One cylinder: one big shove, then a long wait, with a drag while it compresses.' },
  { key: 'n8', text: 'Four cylinders: one shove after another.' },
  { key: 'n9', text: 'Six cylinders: the power strokes overlap, and the push is smoother still.' },
  { key: 'n10', text: 'Even spacing means less vibration and a smoother sound.' },
  // ---- 8 the diesel
  { key: 'd1', gap: 4.2, chapter: 'The diesel', text: 'There is another way to light the fire: no spark at all.' },
  { key: 'd2', text: 'A diesel draws in only air, and squeezes it much harder, typically *15 to 23 to one*.', say: 'A diesel draws in only air, and squeezes it much harder: typically fifteen to twenty-three to one.' },
  { key: 'd3', text: 'Squeezing air that hard heats it by hundreds of degrees.' },
  { key: 'd4', text: 'Near the top, fuel is sprayed in, and it ignites in the hot air by itself.' },
  { key: 'd5', gap: 0.7, text: 'With no fuel in the cylinder during the squeeze, nothing can ignite early, so a diesel can squeeze harder.' },
  { key: 'd6', text: 'That’s one reason diesels are efficient. Big, slow ship diesels reach up to *55%*.', say: 'That’s one reason diesels are efficient. Big, slow ship diesels reach up to fifty-five percent.' },
  { key: 'd7', text: 'And instead of throttling its air, a diesel sets its power by how much fuel it injects.' },
  { key: 'd8', gap: 0.7, text: 'Rudolf Diesel’s first prototype fired in 1893. His third, tested in 1897, turned about *26%* of its fuel into work.', say: 'Rudolf Diesel’s first prototype fired in eighteen ninety-three. His third, tested in eighteen ninety-seven, turned about twenty-six percent of its fuel into work.' },
  { key: 'd9', text: 'And it runs the same four strokes: intake, compression, power, exhaust.' },
  // ---- 9 recap
  { key: 'z1', gap: 4.2, chapter: 'Two turns, one push', text: 'So here is the whole idea.' },
  { key: 'z2', text: 'Draw in, squeeze, burn, push out: four strokes, two turns of the crank.' },
  { key: 'z3', text: 'The squeeze makes it efficient, and knock sets the limit on the squeeze.' },
  { key: 'z4', text: 'Patented in 1862 by a man who never built one, made to work by Otto in 1876…', say: 'Patented in eighteen sixty-two by a man who never built one, and made to work by Otto in eighteen seventy-six,' },
  { key: 'z5', text: '…it is still the cycle inside most car engines.', say: 'it is still the cycle inside most car engines.' },
  { key: 'z6', gap: 0.8, text: 'At 3,000 rpm, that’s two turns and one push, *25 times every second*.', say: 'At three thousand revolutions a minute, that’s two turns and one push, twenty-five times every second.' },
];
export const HOLD = { o3: 0.8, m11: 1.2, f8: 0.6, f12: 1.0, h14: 1.0, p8: 0.8, p9: 1.2, c5: 0.6, c14: 1.0, v10: 1.0, n9: 1.0, n10: 1.0, d9: 1.0, z6: 9.0 };
