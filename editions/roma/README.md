# Roma

Roma is a separate app built from the same code as Reckon: posts about Rome, from the ancient city to its churches and art, in English, with its own name, icon and saved progress, and no links to the other apps.

```
editions/roma/
  content/posts/<field>/<id>.json   the posts (same format as content/, see content/README.md)
  content/media/<id>/<file>         their images and clips
  public/                           favicon and other static files for this app
```

- Run it: `npm run dev -- --mode roma`. Build it: `npm run build` builds every app; Roma goes to `dist/roma/`.
- New post: `npm run content -- new <field> <slug> --edition roma`. Check: `npm run content` checks every app.
- Fields: `history`, `engineering`, `art`, `politics`, `economics`, `math` and `earth`, each with a Rome-flavoured name and account in `fieldText` in `shared/editions.ts`. Every field an app lists needs at least one post, so add a new field (good next ones: `language` for Latin, `body` for Roman medicine) together with its first post.
- Animations work as in Reckon (`explainers/README.md`); the render finds the post in this folder. Credit them `"Roma · original animation"` (`· AI narration` when narrated), and give each animation post an explore lab, as in Reckon.
- German: Roma can be switched to German under Settings. Each post has its German text in `content/i18n/de/<field>/<id>.json` (see "Translations" in `content/README.md`); a new post should get one too. The German captions for each animation are kept in `explainers/i18n/de/<id>.json`, ready for a German-subtitled render.
- Offline: like every app, Roma works without internet; see "Offline" in `AGENTS.md`. On iPhone it has to be saved from the Home Screen app.
- Post ids must be unique across all apps, because `explainers/` and the labs are shared. Reckon already has posts on the Pantheon's dome, Roman concrete and Pompeii's food counters: Roma can cover them too, but with its own ids and its own take.

## Facts

Every claim must be correct and sourced (Wikipedia is a good start, ideally with the ancient author it cites). Some things that are easy to get wrong:

- Romans didn't count years BC or AD; they named years by their consuls, or counted *ab urbe condita* (from the founding of the city, by Varro's date of 753 BC). Use BC and AD in posts, but don't put them in Roman mouths.
- Many famous lines are later inventions or loose translations ("Et tu, Brute?" is Shakespeare's). Quote only what an ancient source records, and say which one.
- Ancient numbers (populations, crowd sizes, legion strengths) are estimates; give ranges and say whose.
