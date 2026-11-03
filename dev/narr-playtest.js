// Play coverage test: python3 dev/pageshot.py OUT d "js:$(cat dev/narr-playtest.js)" — runs Play at Play.fast = 3 (no audio) and lists narr.json keys never read.
new Promise(async (r) => {
  window.Play.fast = 3; document.querySelector('#play').click();
  const t0 = performance.now();
  while (performance.now() - t0 < 900000) { await new Promise((q) => setTimeout(q, 1000)); if ((!window.Play.on || window.Play.paused) && performance.now() - t0 > 4000) break; }
  const man = await (await fetch('audio/narr.json')).json();
  const miss = Object.keys(man.k).filter((k) => !window.Play.read.has(k));
  const extra = [...window.Play.read].filter((k) => !man.k[k]);
  r(JSON.stringify({ secs: Math.round((performance.now() - t0) / 1000), y: Math.round(scrollY), H: document.documentElement.scrollHeight, read: window.Play.read.size, total: Object.keys(man.k).length, miss, extra }));
})
