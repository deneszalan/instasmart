# Queue

One writer at a time (to spare weekly credits); save after every step with `bash save.sh "<step>"`.
Each video: the writer makes `<slug>` and `<slug>-dialogue` (BRIEF.md, DIALOGUE.md). Then centrally: record m1/m2 lines
(`voice.txt` m1/m2, and `A=m1`/`A=m2` in the dialogue's cast), `bash tts.sh <slug>`, `node music-remap.mjs <slug>` after the
dialogue's timing changes, re-check a few stills, `bash render-video.sh <slug>`, verify, deliver mp4 + subtitles.srt.

| # | Slug | Short post | Voice | Dialogue cast | State |
|---|---|---|---|---|---|
| 1 | birthday | math-birthday-problem | af_bella | A=m2 B=af_bella | monologue rendered and delivered (10:16); dialogue delivered (11:20). Done |
| 2 | eratosthenes | history-eratosthenes-earth-circumference | m1 | A=m1 B=af_bella | monologue delivered (9:46); dialogue delivered (11:37). Done |
| 3 | four-stroke | engineering-four-stroke-engine | m2 | A=m2 B=af_heart | written (10:08, dialogue 12:32); queued |
| 4 | sky-blue | physics-why-the-sky-is-blue | af_heart | A=m1 B=af_heart | monologue rendered and delivered (9:46); dialogue recording (job sky-dlg) |
| 5 | kepler | space-kepler-equal-areas | m1 | A=m1 B=af_nicole | written (10:58, dialogue 14:16 with stand-ins: check it stays under 15:00); queued |
| 6 | double-slit | physics-double-slit | af_bella | A=m2 B=af_bella | written (10:49, dialogue 13:28); queued (job double-slit) |
| 7 | public-key | tech-public-key-cryptography | af_heart | A=m1 B=af_heart | writing |
| 8 | enigma | tech-enigma-never-itself | m2 | A=m2 B=af_nicole | not started |
| 9 | mendel | biology-mendel-pea-ratios | af_bella | A=m1 B=af_bella | not started |
| 10 | zeno | philosophy-zeno-achilles-tortoise | af_heart | A=m2 B=af_heart | not started |

## Central work: the runner

`runner.sh` runs the jobs in `jobs.txt` one at a time, in order, and records finished ids in `jobs.done` (failed:
`jobs.failed`, output in `logs/<id>.log`, progress in `runner.log`). After a restart, start it again:
`setsid nohup bash runner.sh &`; an unfinished job simply runs again. To add a video, append its job lines, e.g.
`<id> bash finalize.sh <slug> <voice> <A> <B> && bash deliver.sh <slug> <name> && bash deliver.sh <slug>-dialogue <name>-dialogue`.

- `tts.sh` records in batches of 20 lines (`rec/`); a batch already recorded with the same lines and voices is kept, so a
  restart only loses the batch in progress. `render-video.sh` keeps chunks rendered from the same timing and scene.
- `finalize.sh` records the final voices for both versions (`ONLY=dialogue|monologue`, `SKIP_TTS=1` to keep a recording),
  moves the music onto the new timing, checks five stills and renders. Kokoro runs on 1 thread, the cloned voice on 3.
- `deliver.sh <dir> <name>` checks a render, writes `<dir>/final/sheet.jpg` and copies the mp4 and srt to `../out/`;
  look at the sheet, then send both files.
- Edit a running script only by writing a new file and renaming it over the old one: bash reads a script as it runs.
