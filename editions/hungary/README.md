# Hungary 1956 · Ötvenhat

Hungary 1956 (in Hungarian, *Ötvenhat*) is a separate app built from the same code as Reckon: the Hungarian revolution and freedom fight of 1956 in short animated posts, in six sections, from the background to the consequences. **It opens in Hungarian** (`defaultLang: 'hu'` in `shared/editions.ts`) and readers can switch it to English under Settings.

Its posts are written in English, the codebase's own language, and translated into Hungarian, so the app reads Hungarian by default and English on request, with every post, clip and film in both.

```
editions/hungary/
  content/posts/<field>/<id>.json        the posts, in English (same format as content/, see content/README.md)
  content/i18n/hu/<field>/<id>.json      each post in Hungarian (see "Translations" in content/README.md)
  content/media/<id>/<file>              their images and clips, the Hungarian clip too (<name>-hu.mp4)
  content/media/films/<field>[-hu].*     the long films, their stills and subtitles
  public/                                favicon and icons (the flag of 1956, with the hole)
```

- Run it: `npm run dev -- --mode hungary`. Build it: `npm run build` builds every app; this one goes to `dist/hungary/`.
- Published from its own repository, [deneszalan/Hun-56](https://github.com/deneszalan/Hun-56), which builds the commit of this repository named in its `instasmart.sha` (as Tun-WW does for Tunisia 1943). This repository's own deploy leaves `dist/hungary/` out.
- New post: `npm run content -- new <field> <slug> --edition hungary`. Check: `npm run content` checks every app.
- Post ids must be unique across all apps, because `explainers/` and the labs are shared.

## Sections

The six sections reuse six field ids, renamed in `fieldText` (English) and `langs.hu.fieldText` (Hungarian):

| field id | English | Hungarian | what belongs here |
|---|---|---|---|
| `history` | Background | Előzmények | 1945–1953: the end of the war, Soviet occupation, the 1945 and 1947 elections, the Communist takeover, Rákosi’s dictatorship, the show trials |
| `philosophy` | Why | Miért? | why it broke out: terror and the ÁVH, internment and deportations, poverty, norms and compulsory deliveries, Soviet troops and national grievances |
| `politics` | The road to October | Az út októberig | from Stalin’s death in 1953 to 22 October 1956: Nagy’s first government, his fall, the Petőfi Circle, Rákosi’s removal, Rajk’s reburial, the Polish October, the students’ demands |
| `engineering` | The freedom fight | A szabadságharc | 23 October to 3 November: the demonstration, the Stalin statue, the Radio, the fighting, Kossuth Square, the revolutionary and workers’ councils, Nagy’s government, neutrality |
| `earth` | The end | A leverés | 4 November and after: the Soviet attack, the last fighting, the workers’ councils and the general strike, Nagy’s abduction, the world’s reaction |
| `economics` | Consequences | Következmények | the reprisals and executions, the refugees, the Kádár era and its silence, the reburial of 16 June 1989 and 23 October as a national day |

## Each post

Every post is an animation with an explore lab, as in Reckon (`explainers/README.md`, "Explore labs" in `content/README.md`). Credit the clip `"Hungary 1956 · original animation · AI narration"`; in Hungarian `"Ötvenhat · saját animáció · MI-narráció"`.

## Hungarian

Every post needs its Hungarian version, and so does its animation:

1. `content/i18n/hu/<field>/<id>.json`: the post’s text in Hungarian (title, body, every slide’s text, `alt`, `credit`, the lab’s `prompt` and `takeaway`, the source label if it is in English; a link may point to a Hungarian source that says the same).
2. `explainers/i18n/hu/<id>.json`: `{ "captions": [...], "labels": { "English": "Magyar" } }`, one Hungarian caption per caption of the scene, in order, and every other text the scene draws. Render the Hungarian picture with `npm run explainer -- <id> --lang hu --name <name>-hu --keep-sound --still <s>` after copying the music-only English clip to `<name>-hu.mp4`; the render lists any text it still drew in English, and points the Hungarian translation’s video slide at the new clip and still.
3. The Hungarian narration lines, one per caption, spoken without the final full stop; they are voiced with XTTS (Hungarian), one model for every post.
4. The lab’s own text: every `t('…')` string needs Hungarian in `src/i18n/hu.ts` and German in `src/i18n/de.ts`.

Write Hungarian as a Hungarian historian or journalist would, not word for word from the English:

- Names family name first: Nagy Imre, Rákosi Mátyás, Kádár János, Maléter Pál, Rajk László (in English: Imre Nagy, Mátyás Rákosi).
- Dates as `1956. október 23.`, times as `21 óra 37 perc` or `21.37-kor`; quotation marks „…” (and »…« inside them); thousands with a space (200 000).
- The established Hungarian names: forradalom és szabadságharc, ÁVH (Államvédelmi Hatóság), Petőfi Kör, MEFESZ, a 16 pont, a Rádió (Magyar Rádió, Bródy Sándor utca), Corvin köz, Kilián laktanya, Kossuth tér, Nagybudapesti Központi Munkástanács, a 301-es parcella, „ellenforradalom” as the regime’s word, in quotation marks.
- Use correct accents everywhere (ő, ű, not õ, û).

## Facts

1956 is remembered in Hungarian families to this day, and parts of it were fought over by historians and by governments. Write plainly and humanely: no casualty animations, no glorifying of weapons or violence on either side, no jokes. Every claim must be correct and sourced:

- Prefer the 1956 Institute (rev.hu, now part of the National Széchényi Library), the Hungarian National Archives, the National Remembrance Committee (NEB), the UN Special Committee’s report of 1957, the Wilson Center and National Security Archive document collections, the Hungarian Academy of Sciences, Encyclopaedia Britannica and scholarly books (Litván, Gati, Rainer, Kramer); Wikipedia only as a start.
- Numbers differ between sources: the dead of October–November 1956 (about 2,500–3,000 Hungarians and about 700 Soviet soldiers are the usual figures), the refugees (about 200,000), the executions after 1956 (229 is the 1956 Institute’s count for those executed for acts connected with the revolution). Give the figure, say whose it is, and give a range where sources differ.
- Keep apart what is documented and what is disputed: who fired first at the Radio and at Kossuth Square, how many died there, what Moscow decided and when (the Malin notes), what the West promised or was believed to promise (Radio Free Europe).
- Name people with respect: the young fighters and the old, workers and students, Soviet conscripts who did not know where they were, the members of the ÁVH lynched in Köztársaság Square as well as the people they shot. Say what happened to each without taking revenge on any.
- Don’t use photographs or newsreel stills (copyright); draw your own pictures: schematic maps of Budapest and Hungary, simple respectful figures, timelines.
