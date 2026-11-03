// Play-mode text sweep (dev/narrate.py SRC): python3 dev/pageshot.py OUT d "js:$(cat dev/narr-collect.js)" — returns {H, ih, items: [key, text, section, everShown, y, domIndex]}; sort shown items by (y, domIndex).
new Promise(async (r) => {
  const L = 'p, li, blockquote, h1, h2, h3, figcaption, dt, dd';
  const norm = (s) => s.replace(/[ً-ٰٟـ]/g, '').replace(/\s+/g, ' ').trim();
  const textOf = (el) => { let t = ''; el.childNodes.forEach((n) => { if (n.nodeType === 3) t += n.textContent; else if (n.nodeType === 1 && !n.classList.contains('src') && !n.classList.contains('en')) t += textOf(n); }); return t; };
  const vis = (el) => { let o = 1; for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; o *= +cs.opacity; if (o < .6) return false; } return true; };
  const seen = new Map(); let order = 0;
  const grab = () => document.querySelectorAll(L).forEach((el, di) => {
    if (el.closest('span.en, button, dialog, nav') || el.querySelector(L)) return;
    const raw = textOf(el).replace(/\s+/g, ' ').trim(), k = norm(raw);
    if (!k || !/[ء-ي].*[ء-ي]/.test(k)) return;
    const r = el.getBoundingClientRect(), on = r.height >= 2 && r.bottom >= 8 && r.top <= innerHeight * .96 && vis(el);
    const o = seen.get(k);
    if (!o) seen.set(k, { raw, sec: el.closest('main > [id]')?.id || el.closest('[id]')?.id || '', y: on ? scrollY : 1e9, di, on });
    else if (on && !o.on) { o.on = true; o.y = scrollY; o.di = di; }
  });
  const H = document.documentElement.scrollHeight, step = innerHeight * .2;
  for (let y = 0; y <= H; y += step) { scrollTo(0, y); await new Promise((q) => requestAnimationFrame(() => setTimeout(q, 70))); grab(); }
  r(JSON.stringify({ H, ih: innerHeight, items: [...seen].map(([k, v]) => [k, v.raw, v.sec, v.on, Math.round(v.y), v.di]) }));
})
