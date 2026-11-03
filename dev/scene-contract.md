# Scene contract — Mohammad's Life

Project: `~/Desktop/projects/mohammad-life/` — a fork of `~/Desktop/projects/ali-life/` (an Arabic RTL scroll film on
Imam Ali). This site tells the life of the Prophet Muhammad ﷺ from SHIA (Imami) sources only. Same engine, same fonts.
Its own colour: green and white on the night of Hira, gold for Qur'an and for the gold disc.

## Files you own
Only `scenes/NAME.js`, `scenes/NAME.css`, `scenes/NAME.html` for the scene names you were given, plus screenshots
under `dev/shots/NAME/`. Never edit `index.src.html`, `styles.css`, `app.js`, `scenes/core.js`, `scenes/holy.js`,
`scenes/main.js`, any other scene, or anything in `~/Desktop/projects/ali-life/`. The `<!--@scene:NAME-->` marker and
the css/js includes are already in `index.src.html`. Do not `git add`, commit, or push. Other agents work in the same
tree at the same time on other scenes.

## Engine (read `scenes/core.js` header and `app.js` lines 57–100, 215–230)
- Register `S.NAME = { init(el, st), frame(p, t, el, st) }` (`S`, `TAU`, `seg`, `smooth`, `ease`, `mix`, `rng`, `fit`,
  `PAL`, `rgba`, `FONT`, `arNum`, `terrainRaster` come from core.js). `p` is the pinned progress (about −0.05 → 1.05),
  `t` seconds. Everything drawn must follow from `p` (scroll runs both ways); `t` is only for ambient life (flicker,
  cloth, stars).
- Markup:
  ```html
  <div class="scene sig NAME" data-scene="NAME" data-rest="0.9" style="--len:700vh">
    <div class="stage">
      <canvas class="cv" aria-hidden="true"></canvas>
      <div class="ov ov-tr" data-fx="o 0 1 .05 .1 | o 1 0 .3 .34"><p class="kick">…</p><p class="cap">…</p><span class="src">…</span></div>
    </div>
  </div>
  ```
  `data-fx="prop from to start end [ease] | …"` (props x y s sx r rx ry o g b bl clip dash; eases lin in out io).
  Text classes: `.kick` (small label), `.cap` (prose caption), `.qt` (big quote), `.ayah` (Qur'an, in ﴿…﴾), `.src`.
- Reduced motion: app.js calls `frame(data-rest, 0)` once and styles.css shows every `.scene .ov` stacked. Choose
  `data-rest` so the still frame is a good picture.
- Look at `scenes/kisa.*` (CSS caption column + scrim pattern, phone layout) and one battle (`scenes/badr.*`) before
  you start. The quality bar is those scenes plus `khaybar`, `ghadir`, `siffin`. The owner rejected earlier scenes as
  "cheap and lazy … just dots and solid background": painted skies, depth bands, haze, light, real motion tied to `p`.
  `terrainRaster` in core.js is the smooth desert painter used by badr/uhud/hunayn.

## Religious and visual rules (strict)
- No face is ever drawn, on anyone.
- The Prophet ﷺ (and Ali, Fatima, al-Hasan, al-Husayn, if they appear) are drawn ONLY with `Holy.draw(g, o)` from
  `scenes/holy.js` (read its header: poses stand/walk/sit/lie/sujud/ruku/fight/ride/above, `child: true`, `arms`,
  `amb`, `flip`, `alpha`; returns the head `{x, y, r}`): a white veil over the face and a gold disc behind the head.
  Never draw them as a ball of light.
- Everyone else is a faceless silhouette (dark cloaked shape, no eyes or mouth). Ancestors and earlier prophets are
  names only. Angels are never drawn as figures (light only). Do not draw the Buraq with a face.
- No music. No invented quotes. Captions are given below verbatim; Qur'an text must be exact. A caption whose source
  is still being checked goes in `<p class="cap" data-todo="KEY">DRAFT</p>`; keep the DRAFT text short and neutral.
- Any invented visual count or detail (number of birds, soldiers, people) is fine as art, but list it in your report.

## Layout
- Desktop captions in a right-hand column (`ov-tr`), the action left and centre; on phones (≤640px) captions on top
  over a scrim, the action in the lower half. Test at 1440×900 and 500×900 (headless clamps narrower windows).
- Cache static layers (sky, terrain) in offscreen canvases and redraw only when size changes; keep a frame cheap.

## Testing
1. `python3 dev/build.py` (writes index.html; safe to run any time).
2. A server already runs: `http://127.0.0.1:8092/` (project root). If it is down: `python3 -m http.server 8092 --bind 127.0.0.1 &` from the project root.
3. `dev/shot.sh '.NAME' P dev/shots/NAME/pP.png [W H]` renders the scene element alone at progress P. Shoot 5–7 values
   of P at desktop and 2–3 at 500×900, read the PNGs, fix, repeat. Running several shots in parallel sometimes gives a
   blank frame or "S is not defined"; rerun that one alone.
4. Check the console for errors: open `dev/scene.html?sel=.NAME&p=0.5` through the same headless Chrome if needed.

## Report (your final message)
For each scene: the timeline (which `p` range shows what), the captions used and their slots, any `data-todo`
keys, invented visual details, the screenshot paths of your best frames, and anything you could not finish.
