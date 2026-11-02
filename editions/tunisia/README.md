# Tunisia 1943

Tunisia 1943 (in French, *Tunisie 1943*) is a separate app built from the same code as Reckon: the Second World War in Tunisia in short animated posts. It covers the campaign of November 1942 to May 1943, life under the war and the Axis occupation, the novels, memoirs and films it inspired, and how it is remembered. Its own language is English, and readers can switch it to French under Settings.

```
editions/tunisia/
  content/posts/<field>/<id>.json        the posts (same format as content/, see content/README.md)
  content/i18n/fr/<field>/<id>.json      each post in French (see "Translations" in content/README.md)
  content/media/<id>/<file>              their images and clips, the French clip too (<name>-fr.mp4)
  public/                                favicon and icons for this app
```

- Run it: `npm run dev -- --mode tunisia`. Build it: `npm run build` builds every app; this one goes to `dist/tunisia/`.
- New post: `npm run content -- new <field> <slug> --edition tunisia`. Check: `npm run content` checks every app.
- Fields, renamed for this app in `fieldText` in `shared/editions.ts`: `history` (Campaign), `politics` (Occupation), `literature` (Literature), `art` (Film) and `earth` (Remembrance).
- Every post is an animation with an explore lab, as in Reckon (`explainers/README.md`, "Explore labs" in `content/README.md`). Credit the clip `"Tunisia 1943 · original animation · AI narration"`; in French `"Tunisie 1943 · animation originale · voix IA"`.
- Post ids must be unique across all apps, because `explainers/` and the labs are shared.

## French

Every post needs its French version, and so does its animation:

1. `content/i18n/fr/<field>/<id>.json`: the post's text in French (title, body, every slide's text, the source label if it is in English; links may point to French sources where they say the same).
2. `explainers/i18n/fr/<id>.json`: `{ "captions": [...], "labels": { "English": "Français" } }`, one French caption per caption of the scene, in order, and every other text the scene draws. Render the French picture with `npm run explainer -- <id> --lang fr --name <name>-fr --keep-sound --still <s>` after copying the music-only English clip to `<name>-fr.mp4`; the render lists any text it still drew in English, and points the French translation's video slide at the new clip and still.
3. The French narration lines, one per caption, spoken without the final full stop; they are voiced with XTTS (see the lead's notes).
4. The lab's own text: every `t('…')` string needs French in `src/i18n/fr.ts` as well as German in `src/i18n/de.ts`.

Write French as a French reader expects it: French typography (a non-breaking space before ? ! : ; and inside « »), French names for places and events where they exist (la bataille de Kasserine, la ligne Mareth, le cap Bon), dates as « 13 mai 1943 ».

## Facts

This is a war in which people died, were deported, imprisoned and forced to work, and it is still remembered by their families. Write plainly and humanely: no casualty animations, no jokes, no glorifying of any army. Every claim must be correct and sourced, and some are easy to get wrong:

- Numbers of prisoners, dead and soldiers differ between sources (the Axis surrender of May 1943 is given as about 230,000 to 275,000 prisoners). Give ranges and say whose figure it is.
- Tunisia was a French protectorate under the Bey of Tunis; the Axis occupied Tunis, Bizerte and the east from November 1942 to May 1943. Say who governed what, and when.
- The persecution of Tunisia's Jews under the German occupation (forced labour, fines, hostages, the yellow star in some places) is documented by Yad Vashem, the United States Holocaust Memorial Museum and historians; use their figures and words.
- Novels and films are fiction: say what is invented, what is based on the author's life, and what is history. Don't quote more than a short line, and say who wrote it. Don't use film stills or book covers (copyright); draw your own pictures.
- Cemeteries and memorials: use the figures of the body that runs them (the American Battle Monuments Commission, the Commonwealth War Graves Commission, the German War Graves Commission, the French ministry of the armed forces).
