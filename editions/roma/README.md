# Roma

Roma is a separate app built from the same code as Reckon: posts about ancient Rome, in English, with its own name, icon and saved progress, and no links to the other apps.

```
editions/roma/
  content/posts/<field>/<id>.json   the posts (same format as content/, see content/README.md)
  content/media/<id>/<file>         their images and clips
  public/                           favicon and other static files for this app
```

- Run it: `npm run dev -- --mode roma`. Build it: `npm run build` builds every app; Roma goes to `dist/roma/`.
- New post: `npm run content -- new <field> <slug> --edition roma`. Check: `npm run content` checks every app.
- Fields: so far only `history` (shown as History, @ab.urbe.condita). Every field an app lists needs at least one post, so add a field to `fields` in `shared/editions.ts` (with a Rome-flavoured name and account in `fieldText`) together with its first post. Good next ones: `engineering` (roads, aqueducts, concrete), `politics` (the Senate, consuls, the tribunes), `language` (Latin), `art`, `body` (Roman medicine), `economics` (coins and prices).
- Animations work as in Reckon (`explainers/README.md`); the render finds the post in this folder. Credit them `"Roma · original animation"` (`· AI narration` when narrated), and give each animation post an explore lab, as in Reckon.
- Post ids must be unique across all apps, because `explainers/` and the labs are shared. Reckon already has posts on the Pantheon's dome, Roman concrete and Pompeii's food counters: Roma can cover them too, but with its own ids and its own take.

## Facts

Every claim must be correct and sourced (Wikipedia is a good start, ideally with the ancient author it cites). Some things that are easy to get wrong:

- Romans didn't count years BC or AD; they named years by their consuls, or counted *ab urbe condita* (from the founding of the city, by Varro's date of 753 BC). Use BC and AD in posts, but don't put them in Roman mouths.
- Many famous lines are later inventions or loose translations ("Et tu, Brute?" is Shakespeare's). Quote only what an ancient source records, and say which one.
- Ancient numbers (populations, crowd sizes, legion strengths) are estimates; give ranges and say whose.
