# Lesefutter

Lesefutter is a separate app built from the same code as Reckon: German posts, a German interface, its own name and saved progress, and no links to Reckon. It starts with the Minnesang and the poetry of the German Middle Ages.

```
editions/lesefutter/
  content/posts/<field>/<id>.json   the posts (same format as content/, see content/README.md)
  content/media/<id>/<file>         their images and clips
  public/                           favicon and other static files for this app
```

- Run it: `npm run dev -- --mode lesefutter`. Build it: `npm run build` builds both apps; Lesefutter goes to `dist/lesefutter/`.
- New post: `npm run content -- new <field> <slug> --edition lesefutter`. Check: `npm run content` checks both apps.
- Fields: `literature` (Literatur), `language` (Sprache), `history` (Geschichte), `music` (Musik), `art` (Kunst). The German names and accounts are in `shared/editions.ts`.
- Animations work as in Reckon (`explainers/README.md`); the render finds the post in this folder. Credit them `"Lesefutter · eigene Animation"`.

## Who reads it

Learners of German, around level **B1**, for example secondary-school pupils whose first language is Dutch. So:

- **Short sentences**, one idea each, about 15 words at most. Prefer the present tense; simple past (war, hatte, lebte) is fine for history.
- **Everyday words.** Explain a hard word the first time, in brackets: *das Lehen (Land, das ein Herrscher jemandem gibt)*. A post may end with a short word list: `{ "type": "list", "heading": "Wörter", "items": ["**das Lehen** – Land, das ein Herrscher jemandem zur Nutzung gibt", …] }`. Give nouns with their article.
- **Middle High German** (Mittelhochdeutsch) always comes with a modern German translation right below it. Write your own translation; don't copy one from a schoolbook or worksheet.
- **No English and no Dutch** in posts, apart from names and titles.
- Puzzles in German too: a quiz, matching old and new words, filling a gap, sorting events in time.

## Facts

Every claim must be correct and sourced (German Wikipedia is a good start: `"source": { "label": "Wikipedia: Minnesang", "url": "https://de.wikipedia.org/wiki/Minnesang" }`). Worksheets simplify; check what they say before you repeat it. Some things that are easy to get wrong:

- The **singers' contest on the Wartburg** (Sängerkrieg) is a legend, told in the 13th-century poem *Wartburgkrieg*. The Landgrave Hermann I of Thuringia really was a patron of poets.
- Walther von der Vogelweide received a **Lehen** (a fief, land with an income) from Friedrich II, around 1220. Where exactly it was is not known.
- **Hohe Minne** is the singer's service for a noble lady who stays out of reach. Minnesang has other kinds too, such as songs about requited love (Walther's *Under der linden*) and dawn songs (Tagelieder).
