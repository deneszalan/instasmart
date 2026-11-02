// "Two languages, one scene": a tiny test of the French version (README.md, "French version"), kept as an example.
// Six lines in a cold open and two chapters, in English (voice.txt) and French (FR, recorded by tts-fr.sh).
// No facts to source: it describes the studio itself.

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'Can one animated scene play in two languages?' },
  { key: 'o2', text: 'This short test says every line twice, once in English and once in French.' },
  // ---- 1
  { key: 'a1', gap: 4.2, chapter: 'Two timelines', text: 'The French voice keeps its own pace, so the French video gets its own timeline.' },
  { key: 'a2', text: 'The scene is keyed to the lines, so it follows either timing without a change.' },
  // ---- 2
  { key: 'b1', gap: 4.2, chapter: 'Numbers and labels', text: 'Here, *1,250,000* is written the way each language writes it.' },
  { key: 'b2', text: 'And every label on screen is swapped for its *French*.' },
];

export const HOLD = { o2: 3.0, a2: 1.0, b2: 7.0 };

// The French: `text` is the subtitle, `say` what the voice reads when it differs (numbers and years in words; the
// final full stop is dropped for the voice anyway). Typography as in French print: « », ’, a no-break space before ? ! ; :
export const FR = {
  o1: { text: 'Une même scène animée peut-elle se jouer en deux langues ?' },
  o2: { text: 'Ce court essai dit chaque phrase deux fois, une fois en anglais et une fois en français.' },
  a1: { text: 'La voix française garde son propre rythme, alors la vidéo française a sa propre chronologie.' },
  a2: { text: 'La scène est calée sur les phrases, elle suit donc l’un ou l’autre minutage sans rien changer.' },
  b1: { text: 'Ici, *1 250 000* s’écrit à la manière de chaque langue.', say: 'Ici, un million deux cent cinquante mille s’écrit à la manière de chaque langue.' },
  b2: { text: 'Et chaque étiquette à l’écran est remplacée par sa version *française*.' },
};

// Extra time after a line on the French timeline, where it differs from HOLD (here: none; the credits keep b2's 7 s).
export const HOLD_FR = {};
