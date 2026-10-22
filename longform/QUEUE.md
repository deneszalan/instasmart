# Queue

One writer at a time (to spare weekly credits); save after every step with `bash save.sh "<step>"`.
Each video: the writer makes `<slug>` and `<slug>-dialogue` (BRIEF.md, DIALOGUE.md). Then centrally: record m1/m2 lines
(`voice.txt` m1/m2, and `A=m1`/`A=m2` in the dialogue's cast), `bash tts.sh <slug>`, `node music-remap.mjs <slug>` after the
dialogue's timing changes, re-check a few stills, `bash render-video.sh <slug>`, verify, deliver mp4 + subtitles.srt.

| # | Slug | Short post | Voice | Dialogue cast | State |
|---|---|---|---|---|---|
| 1 | birthday | math-birthday-problem | af_bella | A=m2 B=af_bella | writing |
| 2 | eratosthenes | history-eratosthenes-earth-circumference | m1 | A=m1 B=af_bella | paused: scene drafted, previews started |
| 3 | four-stroke | engineering-four-stroke-engine | m2 | A=m2 B=af_heart | paused: scene drafted, recording |
| 4 | sky-blue | physics-why-the-sky-is-blue | af_heart | A=m1 B=af_heart | paused: scene drafted |
| 5 | kepler | space-kepler-equal-areas | m1 | A=m1 B=af_nicole | paused: scene drafted, not yet recorded |
| 6 | double-slit | physics-double-slit | af_bella | A=m2 B=af_bella | not started |
| 7 | public-key | tech-public-key-cryptography | af_heart | A=m1 B=af_heart | not started |
| 8 | enigma | tech-enigma-never-itself | m2 | A=m2 B=af_nicole | not started |
| 9 | mendel | biology-mendel-pea-ratios | af_bella | A=m1 B=af_bella | not started |
| 10 | zeno | philosophy-zeno-achilles-tortoise | af_heart | A=m2 B=af_heart | not started |
