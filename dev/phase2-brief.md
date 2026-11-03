# Phase 2 brief (read after dev/scene-contract.md, which still applies in full)

## Captions: where text may come from
1. The Qur'an (exact text, with sura and ayah).
2. Lines already on the page or in the existing scene files (they were checked earlier), reused verbatim.
3. A NEW quote from a Shia book only after it passes the source checker:
   - Add a line to your own file `dev/quotes-NAME.txt` (NAME = your first scene): `BOOKID/VOL/PAGE[,BOOKID/VOL/PAGE] || the quote as it will appear on the page` (use … between non-adjacent segments).
   - Run from your own cache dir: `mkdir -p dev/shots/NAME/eshia && cd dev/shots/NAME/eshia && python3 -I ../../../check_sources.py ../../../quotes-NAME.txt`
   - Only lines printed `OK` may go on the page. A `MISS` prints where the text diverges; fix the wording to the source or drop it.
   - lib.eshia.ir book ids: al-Kafi 11005, al-Irshad 27035, Tafsir al-Qummi 12015, Amali al-Saduq 15033, Amali al-Mufid 15035, Amali al-Tusi 27725, I'lam al-Wara 27186, al-Khisal 15339, Makarim 27049, Masar al-Shi'a 15246, Nahj 12092. In-book search: `https://lib.eshia.ir/search/<id>/<url-encoded phrase>` (curl; if DNS fails add `--resolve lib.eshia.ir:443:185.37.55.187`).
   - Never quote Sunni books. Never quote from memory. Expand ص/ع to «صلى الله عليه وآله» / «عليه السلام» only where the source abbreviates; otherwise keep the source's honorific form.
4. Ages, counts and dates in captions must come from a checked source; invented visual counts are fine only as art (list them).

## "Redraw around him"
The owner chose: battles and events are told with the Prophet ﷺ at the centre — where he stands, what he commands, his prayer, his words, his wounds — while what Ali (ع) and others did stays true to the sources. The camera favours him; captions are about him first. Keep the scene's existing terrain and quality bar (or raise it); do not lose any verified caption that still fits.

## Files
Edit or create only your scenes' three files each (`scenes/NAME.{html,css,js}`), your `dev/quotes-NAME.txt`, and `dev/shots/NAME/`. Markers and includes for new scenes are already in index.src.html. Four agents work in the tree at once; run `python3 dev/build.py` freely. No git add/commit/push.

## Report
As in the contract, plus: every caption with its source and the checker result (OK) for each new quote.
