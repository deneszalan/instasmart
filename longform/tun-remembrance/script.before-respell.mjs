// "Remembering 1943" (« Se souvenir de 1943 »), the long film of Tunisia 1943's section Remembrance (« Mémoire »),
// 16:9. Four war cemeteries near Tunis, one per chapter: who runs it, how it is laid out, what it holds, each country's
// way of marking its dead; then the dead with no cemetery of their own, and how 1943 is remembered and researched
// today. One narrator (af_heart); French version in FR (XTTS).
//
// Facts and where they come from (the four Remembrance posts were checked against their sources; their scenes'
// comments list them; tunrem-res/ in the scratchpad holds the pages fetched for this film; read 2 November 2026):
// - The war: Tunisia a French protectorate under the Bey of Tunis; the Axis occupied Tunis, Bizerte and the east from
//   November 1942 to May 1943 (editions/tunisia/README.md; USHMM, "Labor and internment camps in North Africa": "a six
//   month occupation of Tunisia (November 1942-May 1943)"); Allied armies British, Commonwealth, American and French
//   (CWGC history texts; ABMC brochure map). The dead first lay in temporary or makeshift cemeteries and field graves
//   (ABMC: "established in 1948 to consolidate temporary cemeteries in North Africa"; Volksbund: six provisional
//   cemeteries and field graves). Distances from Tunis computed here from the bodies' coordinates (scene.js checks
//   them): Medjez-el-Bab about 58 km, the other three under 25 km.
// - Carthage: ABMC brochure "North Africa American Cemetery and Memorial" (January 2024, scanned at npshistory.com):
//   "This agency of the United States government operates and maintains 26 American cemeteries"; "atop part of ancient
//   Roman Carthage"; "established in 1948 to consolidate temporary cemeteries in North Africa. The government of Tunisia
//   granted its free use as a permanent burial ground in perpetuity without charge or taxation"; 27 acres; headstones
//   2,833; Latin crosses 2,777; Stars of David 56; Tablets of the Missing 3,724, "364 feet long", "missing in service on
//   land, sea, and air in the region"; plots A–I; four fountains and pools; dedicated July 21, 1960; GPS N36 51.918
//   E10 19.876. ABMC, "History of North Africa American Cemetery": headstones in straight rows in nine rectangular plots,
//   decorative pools at the intersections of the paths; "Rosettes mark the names of those since recovered and
//   identified"; most honoured there died "in military activities ranging from North Africa to the Persian Gulf".
//   364 ft = 110.9 m (computed).
// - Medjez-el-Bab: CWGC, Medjez-el-Bab War Cemetery (47314) and Memorial (2054200): about 60 km west of Tunis; "at the
//   limit of the Allied advance in December 1942 and remained on the front line until the Allied advances of April and
//   May 1943"; the largest Commonwealth war cemetery in Tunisia; 2,903 Commonwealth servicemen of the Second World War
//   buried or commemorated, 385 of the burials unidentified; the memorial, on either side of the Cross of Sacrifice at
//   the point furthest from the entrance, names almost 2,000 men of the First and Eighth Armies with no known grave;
//   designed by Sir J. Hubert Worthington; the Stone of Remembrance opposite the entrance; the landscape redesign cuts
//   irrigated turf by 75%, with olive trees, lavender, rosemary, thyme and grasses. CWGC search, country Tunisia: eight
//   war cemeteries, with their history texts: Medjez-el-Bab 2,903; Massicault 1,576; Enfidaville 1,551; Sfax 1,253;
//   Tabarka Ras Rajel 500; Beja 396; Oued Zarga 247; Thibar Seminary 99; the sum, 8,525, is computed in scene.js ("about 8,500"). Wikipedia, "Commonwealth War
//   Graves Commission": war dead "commemorated uniformly and equally, irrespective of military or civil rank, race or
//   creed"; each headstone has "the national emblem or regimental badge, rank, name, unit, date of death and age",
//   "an appropriate religious symbol and a more personal dedication chosen by relatives"; the Cross of Sacrifice
//   (Blomfield), the Stone of Remembrance (Lutyens).
// - Gammarth: Wikipédia (fr), "Cimetière militaire de Gammarth", citing the French consulate in Tunis: opened on
//   5 January 1944; about seven hectares on the heights; kept by the veterans' service (Service des anciens
//   combattants) of the French embassy; first for the non-Muslim soldiers of the North African troops of the Tunisian
//   campaign; Muslim soldiers buried in Muslim cemeteries such as Haffouz and Tarf ech-Chena; military plots of town
//   cemeteries gathered there in 1966–68; 1,875 bodies in individual graves, from both world wars and Indochina; an
//   ossuary of 23 coffins and 1,220 boxes of unknown dead; after independence the tomb of the Unknown Soldier of the
//   Tunisian campaign and other memorials moved there. The French defence ministry's answer to written question 94860
//   (Assemblée nationale, 8 March 2011): irrigation works at Gammarth in 2010, a restoration in four stages from 2011.
//   Wikipédia (fr), "Nécropole nationale": French war graves carry a Latin cross, a Muslim stele (crescent and star),
//   a Jewish stele (Star of David), or a stele for other faiths and non-believers. The post (Le Courrier de l'Atlas,
//   8 May 2015): tirailleurs, Tunisian, Algerian and Moroccan, in the French army.
// - Bordj Cedria: Volksbund, "Kriegsgräberstätte Bordj-Cedria" (German and English pages): about 25 km from Tunis,
//   past Hammam Lif, on the Keddel foothills; 8,562 German soldiers ("In dieser Gräberstätte ruhen 8.562 deutsche
//   Soldaten von 1939 bis 1945", in Arabic, German and French), who died in combat or as prisoners of war; 104 more
//   whose graves were not found; six provisional cemeteries (Nassen on Cap Bon, Bizerta, La Mornaghia, El M'Dou,
//   Mateur, Sfax) and field graves; the war graves agreement in force on 28 March 1966; built 1973–75, then the
//   reburials; of about 2,000 unknown dead a large number identified; "six staggered individual courtyards", remains in
//   ossuaries; opened to the public on 28 September 1977; coordinates 36°41'48"N 10°23'47"E. The post's sources:
//   Volksbund teaching module (after 1945, given German war crimes, an official "Heldengedenken" was taboo; war
//   cemeteries as "Lernorte"); Volkstrauertag two Sundays before the first Sunday of Advent; Webdo (2015): the German
//   ambassador lays a wreath at Bordj Cedria on that day. The page does not describe name blocks, so the film shows only
//   the courtyards, the ossuaries and the stone.
// - Italy: Italian Ministry of Defence (Commissariato Generale per le Onoranze ai Caduti), "Sacrario dei Caduti
//   d'Oltremare, Bari": inaugurated 10 December 1967; the remains of more than 75,000 fallen brought home after the
//   war cemeteries overseas were closed; a North Africa sector for "Marocco, Tunisia, Algeria (1940-45)".
// - Without a cemetery: USHMM, "Labor and internment camps in North Africa" ("roughly 5,000 Tunisian Jewish men were
//   conscripted for forced labor"; "Some forty German labor and detention camps"); Mémorial de la Shoah, "Souvenir de la
//   rafle de Tunis (9 décembre 1942)" (90,000 Jews in Tunisia; "nearly 5,000 Jews were sent to forced labor in 32
//   camps"; "From April 1943 began the first deportations to camps in Europe"; a ceremony in its crypt, organised by
//   the Société d'histoire des Juifs de Tunisie); FRUS 1943 vol. II doc. 258 (North African Economic Board, Algiers,
//   15 June 1943): workers "put at work at the airport and harbor in Tunis, at Bizerta, Mateur, Enfidaville, and
//   Cheylus, all points of nearly constant Allied air attacks"; a levy of 20,000,000 francs on the community. Montreal
//   Holocaust Museum, "The Holocaust in Tunisia": yellow stars; a 19-year-old killed by a German soldier on the way to
//   the Cheylus camp. Muslim soldiers: as Gammarth above. Civilians: Hatem Bourial, Webdo, 6 May 2017 (Allied raids
//   "bombardèrent ports, gares et industries, faisant beaucoup de victimes dans la population civile"); Wikipedia,
//   "Sousse" ("suffered 39 bombardments between December 1942 and May 1943"); Mark W. Willis, "Not liberation, but
//   destruction: war damage in Tunisia in the Second World War, 1942–43", The Journal of North African Studies 20:2
//   (2015), 187–203, abstract: most major cities and towns destroyed or badly damaged; the civilian toll largely
//   ignored or forgotten.
// - Today: H. Kazdaghli, Hespéris-Tamuda (2018), via the Gammarth post: in February 1957 Tunis took down its monument to
//   the dead of both wars. ABMC and AFRICOM: Memorial Day ceremonies at Carthage; Stars and Stripes, 30 May 2022: at
//   the Memorial Day ceremony the US chargée d'affaires and Tunisia's foreign minister signed a memorandum that "paves
//   the way for the disinterment of the remains of unidentified American service members" for identification (DPAA).
//   Le Courrier de l'Atlas (2015) and the post: ceremonies at Gammarth on 8 May and 11 November; Serbian embassy in
//   Tunis (11 November 2024): Armistice Day at the French military cemetery. CWGC, "Remembrance Day 2024 across the
//   Commission": "A service was held at Medjez-el-Bab War Cemetery". Records online: ABMC burial search, CWGC Find War
//   Dead, Volksbund Gräbersuche, the French ministry of the armed forces' Mémoire des hommes. Paul Ghez, Six mois sous
//   la botte (Tunis, 1943), via the literature post (Posen Library). Documentation Center of North African Jews during
//   WWII, Yad Izhak Ben-Zvi, Jerusalem (its site; EHRI): an online database of indexed documents from archives in
//   Israel and abroad, and testimonies. USHMM oral history RG-50.030.1003 (Nine Moati, 2018), via the Villa Jasmin post.
// Cut for length: the French cemetery at Enfidha (1949, 235 soldiers of three faiths; Webdo); Oued Zarga's Muslim
// section facing Mecca (CWGC); the fines and the yellow star (USHMM); at Bordj Cedria, the six makeshift
// cemeteries and the unknown identified (Volksbund); the opening line on four countries.
// Not used: death tolls for the forced labourers (the figures quoted for Yad Vashem differ between sources, and its
// pages could not be read); civilian death tolls (none found in a source that could be checked); casualty figures.

export const LINES = [
  // ---- cold open
  { key: 'o1', gap: 1.0, text: 'At Carthage, by the sea, white crosses and Stars of David stand in straight lines.' },
  { key: 'o2', text: 'At Medjez-el-Bab, west of Tunis, matching headstones stand row after row.' },
  { key: 'o3', text: 'On the heights of Gammarth, north of Tunis, crosses and steles stand in rows.' },
  { key: 'o4', text: 'And at Bordj Cedria there are no rows at all, only six stone courtyards on a hillside.', say: 'And at Borj Sedria there are no rows at all, only six stone courtyards on a hillside.' },
  { key: 'o6', text: 'And many who died in that war have no such place. This film visits the four, and looks beyond them.' },

  // ---- 1 the war and its dead
  { key: 'a1', gap: 4.2, chapter: 'The war and its dead', text: 'From November 1942 to May 1943, the war crossed Tunisia, then a *French protectorate* under the Bey of Tunis.' },
  { key: 'a2', text: 'German and Italian troops occupied Tunis, Bizerte and the east, and British, Commonwealth, American and French armies fought them.' },
  { key: 'a3', text: 'Tunisians of every faith, Muslims, Jews and Christians, lived through the occupation, the bombing and the fighting.' },
  { key: 'a5', text: 'After the war, each country chose how to gather its dead, and how to mark their graves.' },
  { key: 'a6', gap: 0.8, text: 'Four of these cemeteries lie within about *60 kilometres* of Tunis.' },

  // ---- 2 Carthage
  { key: 'c1', gap: 4.2, chapter: 'Crosses and stars', text: 'Our first stop is *Carthage*, where the North Africa American Cemetery covers part of the ancient Roman city.' },
  { key: 'c2', text: 'It is run by the *American Battle Monuments Commission*, an agency of the United States government.' },
  { key: 'c3', text: 'It was set up in 1948, on land Tunisia granted free and for ever, and dedicated in 1960.' },
  { key: 'c4', text: 'On 27 acres, *2,833* headstones stand in straight lines, in nine plots, with pools where the paths cross.' },
  { key: 'c5', text: 'Of these, 2,777 are Latin crosses and ~56 are Stars of David~.' },
  { key: 'c6', text: 'Most of those honoured here died in operations from North Africa to the Persian Gulf, not only in Tunisia.' },
  { key: 'c7', gap: 0.8, text: 'Along the mall, the Tablets of the Missing run for 364 feet, about 111 metres.' },
  { key: 'c8', text: 'They name *3,724* men missing on land, at sea and in the air, more than the graves here.' },
  { key: 'c9', text: 'A ~rosette~ beside a name marks a man who has since been found and identified.' },

  // ---- 3 Medjez-el-Bab
  { key: 'm1', gap: 4.2, chapter: 'Headstones', text: 'About 60 kilometres west of Tunis, *Medjez-el-Bab* stayed on the front line from December 1942 until the Allied advances of spring 1943.' },
  { key: 'm3', text: 'Today it has Tunisia’s largest Commonwealth war cemetery, run by the *Commonwealth War Graves Commission*.' },
  { key: 'm4', text: 'The Commission counts *2,903* servicemen buried or commemorated here, and 385 of the burials are unidentified.' },
  { key: 'm5', text: 'Its headstones are all alike, whatever a man’s rank, race or faith, each with a badge, a name and a religious symbol.' },
  { key: 'm7', gap: 0.8, text: 'At Medjez, a memorial names almost *2,000* more men of the First and Eighth Armies who have no known grave.' },
  { key: 'm8', text: 'Across Tunisia, the Commission keeps *eight* war cemeteries, from Tabarka to Sfax.' },

  // ---- 4 Gammarth
  { key: 'g1', gap: 4.2, chapter: 'Crosses and steles', text: 'North of Tunis, on the heights of *Gammarth*, France opened a military cemetery on 5 January 1944.' },
  { key: 'g2', text: 'The French army in Tunisia included Tunisian, Algerian and Moroccan *tirailleurs*, as well as Europeans.' },
  { key: 'g3', text: 'Its dead were buried by faith, and Gammarth took Christians, Jews and other non-Muslims.' },
  { key: 'g4', text: 'Muslim soldiers, many of them tirailleurs, were buried in Muslim cemeteries, such as those at Haffouz and Tarf ech-Chena.', say: 'Muslim soldiers, many of them tirailleurs, were buried in Muslim cemeteries, such as those at Haffouz and Tarf esh-Shena.' },
  { key: 'g5', text: 'French war graves mark each soldier’s faith, with a Latin cross, or a stele bearing a Star of David, a crescent, or nothing.' },
  { key: 'g7', gap: 0.8, text: 'From 1966 to 1968, French military graves from town cemeteries were gathered at Gammarth.' },
  { key: 'g8', text: 'By the French consulate’s figures, *1,875* soldiers lie there in individual graves, from both world wars and Indochina.' },
  { key: 'g9', text: 'An ossuary holds *1,220* boxes of remains of unknown soldiers, and the French embassy keeps the site.' },

  // ---- 5 Bordj Cedria
  { key: 'b1', gap: 4.2, chapter: 'Stone courtyards', text: 'Some 25 kilometres from Tunis, near Hammam-Lif, the German war cemetery of *Bordj Cedria* lies on a hillside.', say: 'Some 25 kilometres from Tunis, near Hammam-Lif, the German war cemetery of Borj Sedria lies on a hillside.' },
  { key: 'b2', text: 'It holds *8,562* German soldiers who died in 1942 and 1943, in battle or as prisoners of war.' },
  { key: 'b4', text: 'After a German–Tunisian agreement in 1966, the cemetery was built from 1973 to 1975.', say: 'After a German and Tunisian agreement in 1966, the cemetery was built from 1973 to 1975.' },
  { key: 'b6', gap: 0.8, text: 'There are no rows of graves. The remains lie in *ossuaries*, in six courtyards stepping up the hill.' },
  { key: 'b7', text: 'A stone in Arabic, German and French gives the number, and remembers *104* soldiers never found.' },
  { key: 'b8', text: 'It opened in 1977, and the *Volksbund*, Germany’s war graves commission, keeps it.', say: 'It opened in 1977, and the Folksbund, Germany’s war graves commission, keeps it.' },
  { key: 'b9', text: 'The Volksbund itself writes that, given German war crimes, honouring the fallen as heroes was taboo after 1945.', say: 'The Folksbund itself writes that, given German war crimes, honouring the fallen as heroes was taboo after 1945.' },
  { key: 'b10', text: 'It calls war cemeteries like this one ~places to learn~.' },
  { key: 'b11', gap: 0.8, text: 'Italy brought its dead home from overseas, Tunisia included, to a memorial in Bari opened in 1967.' },

  // ---- 6 without a cemetery
  { key: 'w1', gap: 4.2, chapter: 'Without a cemetery', text: 'So four countries remember with crosses and stars, headstones, crosses and steles, and stone courtyards.' },
  { key: 'w2', text: 'Their figures can’t simply be added up. Each body counts in its own way, and some include other wars.' },
  { key: 'w3', text: 'And many people who died in Tunisia have no war cemetery at all.' },
  { key: 'w4', text: 'Tunisians died as soldiers in the French army, and as civilians in their own towns.' },
  { key: 'w5', gap: 0.8, text: 'Under the German occupation, about *5,000* Jewish men were sent to forced labour, in 32 to about 40 camps.' },
  { key: 'w6', text: 'A US report of June 1943 says their work sites were under nearly constant Allied air attack.' },
  { key: 'w7', text: 'Some were killed, and some Jews of Tunisia were deported to camps in Europe.' },
  { key: 'w9', gap: 0.8, text: 'The towns were bombed too. Raids on ports, stations and factories left many civilian victims.' },
  { key: 'w10', text: 'By one count, Sousse alone was bombed *39 times* in those six months.' },
  { key: 'w11', text: 'The historian Mark Willis writes that most major towns were destroyed or badly damaged, and that this toll is largely forgotten.' },
  { key: 'w12', text: 'No war cemetery gathers these dead. Their memory lives in families, in towns and in archives.' },

  // ---- 7 remembering today
  { key: 'r1', gap: 4.2, chapter: 'Remembering today', text: 'After independence, war memorials came down. In 1957, Tunis removed its monument to the dead of both wars.' },
  { key: 'r2', text: 'Ceremonies go on. In May, Americans gather at Carthage for Memorial Day, and France marks 8 May at Gammarth.', say: 'Ceremonies go on. In May, Americans gather at Carthage for Memorial Day, and France marks the 8th of May at Gammarth.' },
  { key: 'r3', text: 'In November, France marks the Armistice at Gammarth, and a Remembrance service is held at Medjez-el-Bab.' },
  { key: 'r4', text: 'On Germany’s day of mourning, two Sundays before Advent, its ambassador lays a wreath at Bordj Cedria.', say: 'On Germany’s day of mourning, two Sundays before Advent, its ambassador lays a wreath at Borj Sedria.' },
  { key: 'r5', text: 'In 2022, the United States and Tunisia agreed that unknown soldiers buried at Carthage could be exhumed, to try to identify them.' },
  { key: 'r6', gap: 0.8, text: 'Each of these bodies keeps its records online, so anyone can look up a name.' },
  { key: 'r7', text: 'The persecution of Tunisia’s Jews is documented too, some of it written at the time.' },
  { key: 'r8', text: 'Paul Ghez, made to recruit the forced labourers, published his diary in Tunis in 1943.' },
  { key: 'r9', text: 'In Jerusalem, a documentation centre indexes thousands of documents and testimonies.' },
  { key: 'r10', text: 'In Washington, the US Holocaust Memorial Museum records testimonies, Tunisian ones among them.' },
  { key: 'r11', text: 'In Paris, the *Mémorial de la Shoah* holds a ceremony for the roundup of Tunis, on 9 December 1942.', say: 'In Paris, the Shoah Memorial holds a ceremony for the roundup of Tunis, on the 9th of December 1942.' },
  { key: 'r12', gap: 0.8, text: 'Remembering 1943 in Tunisia means seeing the rows, and the people outside them too.' },
  { key: 'r13', text: 'If you visit a cemetery, check access locally, and go quietly.' },
  { key: 'r14', text: 'Every name in stone, and every name in an archive, belonged to someone.' },
];

export const HOLD = { o6: 3.0, a5: 0.4, a6: 0.4, c9: 0.6, m8: 0.6, g9: 0.4, b10: 0.4, b11: 0.4, w12: 0.6, r11: 0.4, r14: 9 };

// The French version: `text` is the subtitle (French typography: ’, « », a narrow no-break space before ? ! ; : and in
// 2 833), `say` what the XTTS voice reads where it differs (numbers and years in words, names as they are said in French).
export const FR = {
  o1: { text: 'À Carthage, au bord de la mer, des croix blanches et des étoiles de David s’alignent en rangées droites.' },
  o2: { text: 'À Medjez-el-Bab, à l’ouest de Tunis, des pierres tombales identiques se suivent, rang après rang.' },
  o3: { text: 'Sur les hauteurs de Gammarth, au nord de Tunis, des croix et des stèles se dressent en rangées.' },
  o4: { text: 'Et à Bordj Cedria, il n’y a aucune rangée, seulement six cours de pierre à flanc de colline.', say: 'Et à Borj Cédria, il n’y a aucune rangée, seulement six cours de pierre à flanc de colline' },
  o6: { text: 'Et beaucoup de ceux qui sont morts dans cette guerre n’ont pas de tel lieu. Ce film visite les quatre, puis regarde au-delà.' },
  a1: { text: 'De novembre 1942 à mai 1943, la guerre traverse la Tunisie, alors *protectorat français*, avec pour souverain le bey de Tunis.', say: 'De novembre mille neuf cent quarante-deux à mai mille neuf cent quarante-trois, la guerre traverse la Tunisie, alors protectorat français, avec pour souverain le bey de Tunis' },
  a2: { text: 'Les troupes allemandes et italiennes occupent Tunis, Bizerte et l’est du pays, face aux armées britanniques, du Commonwealth, américaines et françaises.' },
  a3: { text: 'Les Tunisiens de toutes confessions, musulmans, juifs et chrétiens, vivent l’occupation, les bombardements et les combats.' },
  a5: { text: 'Après la guerre, chaque pays décide comment rassembler ses morts, et comment marquer leurs tombes.' },
  a6: { text: 'Quatre de ces cimetières se trouvent à une *soixantaine de kilomètres* de Tunis, au plus.' },
  c1: { text: 'Première étape : *Carthage*, où le cimetière américain d’Afrique du Nord recouvre une partie de la cité romaine.', say: 'Première étape, Carthage, où le cimetière américain d’Afrique du Nord recouvre une partie de la cité romaine' },
  c2: { text: 'Il est géré par l’*American Battle Monuments Commission*, une agence du gouvernement des États-Unis.', say: 'Il est géré par une agence du gouvernement des États-Unis, la commission américaine des monuments de bataille' },
  c3: { text: 'Il est créé en 1948, sur un terrain que la Tunisie cède gratuitement et à perpétuité, et inauguré en 1960.', say: 'Il est créé en mille neuf cent quarante-huit, sur un terrain que la Tunisie cède gratuitement et à perpétuité, et inauguré en mille neuf cent soixante' },
  c4: { text: 'Sur 11 hectares, *2 833* stèles s’alignent en rangées droites, en neuf carrés, avec des bassins aux croisements des allées.', say: 'Sur onze hectares, deux mille huit cent trente-trois stèles s’alignent en rangées droites, en neuf carrés, avec des bassins aux croisements des allées' },
  c5: { text: 'On y compte 2 777 croix latines et ~56 étoiles de David~.', say: 'On y compte deux mille sept cent soixante-dix-sept croix latines et cinquante-six étoiles de David' },
  c6: { text: 'La plupart des morts honorés ici sont tombés lors d’opérations allant de l’Afrique du Nord au golfe Persique, pas seulement en Tunisie.' },
  c7: { text: 'Le long de l’allée, les tables des disparus s’étendent sur 364 pieds, soit environ 111 mètres.', say: 'Le long de l’allée, les tables des disparus s’étendent sur trois cent soixante-quatre pieds, soit environ cent onze mètres' },
  c8: { text: 'Elles portent les noms de *3 724* hommes disparus sur terre, en mer et dans les airs, plus qu’il n’y a de tombes ici.', say: 'Elles portent les noms de trois mille sept cent vingt-quatre hommes disparus sur terre, en mer et dans les airs, plus qu’il n’y a de tombes ici' },
  c9: { text: 'Une ~rosette~ près d’un nom signale un homme retrouvé et identifié depuis.' },
  m1: { text: 'À une soixantaine de kilomètres à l’ouest de Tunis, *Medjez-el-Bab* reste sur la ligne de front de décembre 1942 jusqu’aux offensives alliées du printemps suivant.', say: 'À une soixantaine de kilomètres à l’ouest de Tunis, Medjez-el-Bab reste sur la ligne de front de décembre mille neuf cent quarante-deux jusqu’aux offensives alliées du printemps suivant' },
  m3: { text: 'On y trouve aujourd’hui le plus grand cimetière militaire du Commonwealth en Tunisie, géré par la *Commission des sépultures de guerre du Commonwealth*.' },
  m4: { text: 'La Commission y compte *2 903* militaires inhumés ou commémorés, et 385 tombes y sont anonymes.', say: 'La Commission y compte deux mille neuf cent trois militaires inhumés ou commémorés, et trois cent quatre-vingt-cinq tombes y sont anonymes' },
  m5: { text: 'Toutes ses pierres tombales sont identiques, quels que soient le grade, l’origine ou la foi, avec un insigne, un nom et un symbole religieux.' },
  m7: { text: 'À Medjez, un mémorial porte les noms de près de *2 000* autres hommes des 1re et 8e armées, sans sépulture connue.', say: 'À Medjez, un mémorial porte les noms de près de deux mille autres hommes de la première et de la huitième armée, sans sépulture connue' },
  m8: { text: 'En Tunisie, la Commission entretient *huit* cimetières militaires, de Tabarka à Sfax.' },
  g1: { text: 'Au nord de Tunis, sur les hauteurs de *Gammarth*, la France ouvre un cimetière militaire le 5 janvier 1944.', say: 'Au nord de Tunis, sur les hauteurs de Gammarth, la France ouvre un cimetière militaire le cinq janvier mille neuf cent quarante-quatre' },
  g2: { text: 'L’armée française en Tunisie comptait des *tirailleurs* tunisiens, algériens et marocains, ainsi que des Européens.' },
  g3: { text: 'Ses morts sont inhumés selon leur foi, et Gammarth reçoit les chrétiens, les juifs et les autres non-musulmans.' },
  g4: { text: 'Les soldats musulmans, dont beaucoup de tirailleurs, reposent dans des cimetières musulmans, à Haffouz ou à Tarf ech-Chena par exemple.', say: 'Les soldats musulmans, dont beaucoup de tirailleurs, reposent dans des cimetières musulmans, à Haffouz ou à Tarf ech-Chéna par exemple' },
  g5: { text: 'Les tombes militaires françaises indiquent la foi de chacun : une croix latine, ou une stèle portant une étoile de David, un croissant, ou rien.', say: 'Les tombes militaires françaises indiquent la foi de chacun, avec une croix latine, ou une stèle portant une étoile de David, un croissant, ou rien' },
  g7: { text: 'De 1966 à 1968, Gammarth reçoit les tombes militaires françaises des cimetières communaux.', say: 'De mille neuf cent soixante-six à soixante-huit, Gammarth reçoit les tombes militaires françaises des cimetières communaux' },
  g8: { text: 'Selon le consulat de France, *1 875* soldats y reposent dans des tombes individuelles, des deux guerres mondiales et d’Indochine.', say: 'Selon le consulat de France, mille huit cent soixante-quinze soldats y reposent dans des tombes individuelles, des deux guerres mondiales et d’Indochine' },
  g9: { text: 'Un ossuaire abrite *1 220* caissettes de restes de soldats inconnus, et l’ambassade de France entretient le site.', say: 'Un ossuaire abrite mille deux cent vingt caissettes de restes de soldats inconnus, et l’ambassade de France entretient le site' },
  b1: { text: 'À quelque 25 kilomètres de Tunis, près de Hammam-Lif, le cimetière militaire allemand de *Bordj Cedria* s’étend à flanc de colline.', say: 'À quelque vingt-cinq kilomètres de Tunis, près de Hammam-Lif, le cimetière militaire allemand de Borj Cédria s’étend à flanc de colline' },
  b2: { text: 'Il abrite *8 562* soldats allemands morts en 1942 et 1943, au combat ou en captivité.', say: 'Il abrite huit mille cinq cent soixante-deux soldats allemands morts en mille neuf cent quarante-deux et quarante-trois, au combat ou en captivité' },
  b4: { text: 'Après un accord germano-tunisien en 1966, le cimetière est construit de 1973 à 1975.', say: 'Après un accord germano-tunisien en mille neuf cent soixante-six, le cimetière est construit de mille neuf cent soixante-treize à mille neuf cent soixante-quinze' },
  b6: { text: 'Il n’y a pas de rangées de tombes. Les restes reposent dans des *ossuaires*, en six cours étagées sur la colline.' },
  b7: { text: 'Une pierre en arabe, en allemand et en français donne le nombre, et rappelle *104* soldats jamais retrouvés.', say: 'Une pierre en arabe, en allemand et en français donne le nombre, et rappelle cent quatre soldats jamais retrouvés' },
  b8: { text: 'Il ouvre en 1977, et le *Volksbund*, la commission allemande des sépultures de guerre, l’entretient.', say: 'Il ouvre en mille neuf cent soixante-dix-sept, et le Folksbound, la commission allemande des sépultures de guerre, l’entretient' },
  b9: { text: 'Le Volksbund lui-même écrit qu’au vu des crimes de guerre allemands, honorer les morts en héros était tabou après 1945.', say: 'Le Folksbound lui-même écrit qu’au vu des crimes de guerre allemands, honorer les morts en héros était tabou après mille neuf cent quarante-cinq' },
  b10: { text: 'Pour lui, les cimetières militaires comme celui-ci sont des ~lieux pour apprendre~.' },
  b11: { text: 'L’Italie, elle, a rapatrié ses morts d’outre-mer, y compris de Tunisie, dans un mémorial à Bari ouvert en 1967.', say: 'L’Italie, elle, a rapatrié ses morts d’outre-mer, y compris de Tunisie, dans un mémorial à Bari ouvert en mille neuf cent soixante-sept' },
  w1: { text: 'Ainsi, quatre pays se souviennent avec des croix et des étoiles, des pierres tombales, des croix et des stèles, et des cours de pierre.' },
  w2: { text: 'On ne peut pas simplement additionner leurs chiffres. Chaque organisme compte à sa façon, et certains incluent d’autres guerres.' },
  w3: { text: 'Et beaucoup de ceux qui sont morts en Tunisie n’ont aucun cimetière militaire.' },
  w4: { text: 'Des Tunisiens sont morts comme soldats de l’armée française, et comme civils dans leurs propres villes.' },
  w5: { text: 'Sous l’occupation allemande, environ *5 000* hommes juifs sont envoyés au travail forcé, dans 32 à une quarantaine de camps.', say: 'Sous l’occupation allemande, environ cinq mille hommes juifs sont envoyés au travail forcé, dans trente-deux à une quarantaine de camps' },
  w6: { text: 'Selon un rapport américain de juin 1943, leurs chantiers subissent des attaques aériennes alliées presque constantes.', say: 'Selon un rapport américain de juin mille neuf cent quarante-trois, leurs chantiers subissent des attaques aériennes alliées presque constantes' },
  w7: { text: 'Certains sont tués, et des Juifs de Tunisie sont déportés vers des camps en Europe.' },
  w9: { text: 'Les villes aussi sont bombardées. Les raids sur les ports, les gares et les usines font beaucoup de victimes civiles.' },
  w10: { text: 'Selon un décompte, Sousse à elle seule est bombardée *39 fois* en ces six mois.', say: 'Selon un décompte, Sousse à elle seule est bombardée trente-neuf fois en ces six mois' },
  w11: { text: 'L’historien Mark Willis écrit que la plupart des grandes villes ont été détruites ou gravement endommagées, et que ce bilan est largement oublié.' },
  w12: { text: 'Aucun cimetière militaire ne rassemble ces morts. Leur mémoire vit dans les familles, dans les villes et dans les archives.' },
  r1: { text: 'Après l’indépendance, des monuments aux morts sont démontés. En 1957, Tunis retire son monument aux morts des deux guerres.', say: 'Après l’indépendance, des monuments aux morts sont démontés. En mille neuf cent cinquante-sept, Tunis retire son monument aux morts des deux guerres' },
  r2: { text: 'Les cérémonies continuent. En mai, les Américains se réunissent à Carthage pour le Memorial Day, et à Gammarth, la France marque le 8 Mai.', say: 'Les cérémonies continuent. En mai, les Américains se réunissent à Carthage pour le Mémorial Day, et à Gammarth, la France marque le huit mai' },
  r3: { text: 'En novembre, la France célèbre l’Armistice à Gammarth, et une cérémonie du Souvenir se tient à Medjez-el-Bab.' },
  r4: { text: 'Lors du jour de deuil national allemand, deux dimanches avant l’Avent, l’ambassadeur d’Allemagne dépose une gerbe à Bordj Cedria.', say: 'Lors du jour de deuil national allemand, deux dimanches avant l’Avent, l’ambassadeur d’Allemagne dépose une gerbe à Borj Cédria' },
  r5: { text: 'En 2022, les États-Unis et la Tunisie conviennent que des soldats inconnus de Carthage pourront être exhumés, pour tenter de les identifier.', say: 'En deux mille vingt-deux, les États-Unis et la Tunisie conviennent que des soldats inconnus de Carthage pourront être exhumés, pour tenter de les identifier' },
  r6: { text: 'Ces organismes publient leurs registres en ligne, et chacun peut y chercher un nom.' },
  r7: { text: 'La persécution des Juifs de Tunisie est documentée elle aussi, en partie dès l’époque.' },
  r8: { text: 'Paul Ghez, contraint de recruter les travailleurs forcés, publie son journal à Tunis en 1943.', say: 'Paul Ghez, contraint de recruter les travailleurs forcés, publie son journal à Tunis en mille neuf cent quarante-trois' },
  r9: { text: 'À Jérusalem, un centre de documentation indexe des milliers de documents et de témoignages.' },
  r10: { text: 'À Washington, le musée-mémorial de l’Holocauste des États-Unis recueille des témoignages, dont certains venus de Tunisie.' },
  r11: { text: 'À Paris, le *Mémorial de la Shoah* organise une cérémonie pour la rafle de Tunis du 9 décembre 1942.', say: 'À Paris, le Mémorial de la Shoah organise une cérémonie pour la rafle de Tunis du neuf décembre mille neuf cent quarante-deux' },
  r12: { text: 'Se souvenir de 1943 en Tunisie, c’est voir les rangées, et aussi ceux qui n’y figurent pas.', say: 'Se souvenir de mille neuf cent quarante-trois en Tunisie, c’est voir les rangées, et aussi ceux qui n’y figurent pas' },
  r13: { text: 'Si vous visitez un cimetière, vérifiez l’accès sur place, et faites-le en silence.' },
  r14: { text: 'Chaque nom gravé dans la pierre, chaque nom conservé dans une archive, a appartenu à quelqu’un.' },
};

// Extra time after a French line, where it differs from HOLD.
export const HOLD_FR = {};
