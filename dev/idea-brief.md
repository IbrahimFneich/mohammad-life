# Idea brief: one new chapter, built and integrated end to end (read after scene-contract.md and phase2-brief.md)

Chapters are added one at a time, so you own the integration: no other agent is running.

1. **Sources first.** Find the Shia text(s) for the event and pass each through the checker (phase2-brief.md §Captions,
   your own `dev/quotes-NAME.txt`). If the core of the event has no passing Shia text, STOP: create no files, change
   nothing, and report "dropped" with what you searched (books, pages, phrases).
2. **Scene** `scenes/NAME.{html,css,js}` per scene-contract.md (quality bar, veiled figures, faceless others, captions).
3. **Chapter**: insert a `<section class="chapter" id="NAME" …>` into `index.src.html` at its place in time (data-title,
   data-y AH (negative before the Hijra), data-age, data-when if no sourced year, data-place, the `.opener` header like its
   neighbours), with `<!--@scene:NAME-->`, plus the css `<link>` (after the last scenes css link) and js `<script>`
   (before app.js). A short vellum prose band only if it adds checked text the scene doesn't carry. Add an entry to the
   `SOUND` map in app.js. If the new chapter changes a neighbour's flow (e.g. a header range), fix that text too.
4. **English**: `python3 dev/build.py && python3 dev/i18n_extract.py /tmp/x.json`; add an `i18n/en.json` entry for
   every new key in the same register (Qara'i for the Qur'an, edited as the existing entries are: God, Messenger, no
   brackets); report 0 missing.
5. **Narration**: re-collect with `dev/narr-collect.js` (see its header), merge the new blocks into `dev/narr-src.json`
   in reading order, add voweled `speak` text for them in `dev/narr-voc.json` (full harakat, numbers as words, honorifics
   expanded, chips not read; never change a word), add new Qur'an fragments to `dev/narr-verses.json` and make their
   recitation clips in `audio/q/` with the tools in `dev/quran/` (copied from the audio agent; adjust their tables/paths:
   Abdul Basit + al-Minshawi always, Parhizgar for full ayahs only; partial ayahs cut by quran.com word timings), then
   `python3 dev/narrate.py dev/narr-src.json dev/narr-voc.json dev/narr-verses.json` and run `dev/narr-playtest.js`:
   every key must be read.
6. **Check**: screenshots desktop + 500×900 through `dev/pageshot.py` (not shot.sh), no page exceptions, checker 0 misses.
7. No git add/commit/push. Report: sources + checker results, timeline of the scene, invented visual details, where the
   chapter sits (between which chapters), English count, narration/coverage result, screenshot paths.
