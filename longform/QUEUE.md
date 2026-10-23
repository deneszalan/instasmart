# Queue

One writer at a time (to spare weekly credits); save after every step with `bash save.sh "<step>"`.
Each video: the writer makes `<slug>` and `<slug>-dialogue` (BRIEF.md, DIALOGUE.md). Then centrally: record m1/m2 lines
(`voice.txt` m1/m2, and `A=m1`/`A=m2` in the dialogue's cast), `bash tts.sh <slug>`, `node music-remap.mjs <slug>` after the
dialogue's timing changes, re-check a few stills, `bash render-video.sh <slug>`, verify, deliver mp4 + subtitles.srt.

| # | Slug | Short post | Voice | Dialogue cast | State |
|---|---|---|---|---|---|
| 1 | birthday | math-birthday-problem | af_bella | A=m2 B=af_bella | monologue rendered and delivered (10:16); dialogue finalizing |
| 2 | eratosthenes | history-eratosthenes-earth-circumference | m1 | A=m1 B=af_bella | written (10:17, dialogue 12:26); 2012 repeat replaced; finalizing |
| 3 | four-stroke | engineering-four-stroke-engine | m2 | A=m2 B=af_heart | written (10:08, dialogue 12:32); finalize queued |
| 4 | sky-blue | physics-why-the-sky-is-blue | af_heart | A=m1 B=af_heart | written (9:46, dialogue 11:44); finalize queued |
| 5 | kepler | space-kepler-equal-areas | m1 | A=m1 B=af_nicole | writing |
| 6 | double-slit | physics-double-slit | af_bella | A=m2 B=af_bella | not started |
| 7 | public-key | tech-public-key-cryptography | af_heart | A=m1 B=af_heart | not started |
| 8 | enigma | tech-enigma-never-itself | m2 | A=m2 B=af_nicole | not started |
| 9 | mendel | biology-mendel-pea-ratios | af_bella | A=m1 B=af_bella | not started |
| 10 | zeno | philosophy-zeno-achilles-tortoise | af_heart | A=m2 B=af_heart | not started |

`finalize.sh <slug> <voice> <A> <B>` does the central part for both versions (record, re-time music, check stills, render);
start it with `bash run-finalize.sh <slug> <voice> <A> <B>` (detached) and wait for `<slug>/finalize.done` (or `.failed`, see
`finalize.log`). Kokoro runs on 1 thread, the cloned voice on 3; cloned-voice recording and final renders take turns.
