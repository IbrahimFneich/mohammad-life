// النور في الأصلاب: محمد بن عبد الله بن عبد المطّلب بن هاشم … بن عدنان, drawn as a vertical thread of names, Adnan at
// the top. With the scroll a light runs down the thread; each father's name lights as it passes, and at the end the
// name of the Prophet ﷺ blooms. Ancestors are names only (no figures). Metaphoric light only.
(() => {
  const NASAB = ['عدنان', 'مَعَدّ', 'نِزار', 'مُضَر', 'إلياس', 'مُدرِكة', 'خُزَيمة', 'كِنانة', 'النَّضر', 'مالك', 'فِهر', 'غالب', 'لُؤَيّ', 'كَعب', 'مُرّة', 'كِلاب', 'قُصَيّ', 'عبد مَناف', 'هاشم', 'عبد المطّلب', 'عبد الله', 'مُحَمَّد ﷺ'];
  const R = rng(23), MOTES = Array.from({ length: 80 }, () => ({ x: R(), y: R(), r: .4 + R() * 1.1, sp: .01 + R() * .03, ph: R() * TAU }));
  const lerp = mix, clamp = (v) => Math.min(1, Math.max(0, v));

  S.nasab = {
    init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); },
    frame(p, t, el, st) {
      const cv = st.cv;
      fit(cv);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w < 2 || h < 2) return;
      const g = st.g, d = cv.width / w;
      g.setTransform(d, 0, 0, d, 0, 0);
      const wide = w >= 820, X = wide ? w * .3 : w * .5, y0 = wide ? h * .16 : h * .47, y1 = wide ? h * .9 : h * .95;
      let q = g.createRadialGradient(X, h * .55, 0, X, h * .55, Math.max(w, h) * .8);
      q.addColorStop(0, '#10201f'); q.addColorStop(1, '#04080b'); g.fillStyle = q; g.fillRect(0, 0, w, h);
      for (const m of MOTES) {
        const y = ((m.y + t * m.sp) % 1) * h, x = m.x * w + Math.sin(t * .4 + m.ph) * 8;
        g.fillStyle = `rgba(243,217,143,${(.12 + .1 * Math.sin(t + m.ph)).toFixed(3)})`; g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill();
      }
      const N = NASAB.length, step = (y1 - y0) / (N - 1), k = ease.io(clamp((p - .1) / .78)), yL = y0 + (y1 - y0) * k;
      g.setLineDash([2, 6]); g.strokeStyle = 'rgba(201,165,78,.3)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(X, y0 - step * 1.5); g.lineTo(X, y0); g.stroke(); g.setLineDash([]);
      const fs = Math.min(22, Math.max(12.5, step * .62));
      g.direction = 'rtl'; g.textBaseline = 'middle';
      if (wide) { g.font = `${fs * .82}px ${FONT.naskh}`; g.textAlign = 'center'; g.fillStyle = 'rgba(201,165,78,.5)'; g.fillText('«إذا بلغ نسبي عدنان فأمسكوا»', X, y0 - step * 2.1); }
      g.strokeStyle = 'rgba(201,165,78,.16)'; g.beginPath(); g.moveTo(X, y0); g.lineTo(X, y1); g.stroke();
      q = g.createLinearGradient(0, y0, 0, Math.max(y0 + 1, yL));
      q.addColorStop(0, 'rgba(243,217,143,.2)'); q.addColorStop(1, 'rgba(243,217,143,.95)');
      g.strokeStyle = q; g.lineWidth = 2; g.beginPath(); g.moveTo(X, y0); g.lineTo(X, yL); g.stroke();
      for (let i = 0; i < N; i++) {
        const y = y0 + step * i, lit = clamp((yL - y) / step + .6), last = i === N - 1, side = i % 2 === 0 ? 1 : -1;
        g.fillStyle = `rgba(${Math.round(lerp(120, 243, lit))},${Math.round(lerp(110, 217, lit))},${Math.round(lerp(80, 143, lit))},${(.45 + .55 * lit).toFixed(3)})`;
        g.beginPath(); g.arc(X, y, last ? 3.5 + lit * 2.5 : 2.4 + lit * 1.4, 0, TAU); g.fill();
        g.strokeStyle = `rgba(201,165,78,${(.15 + .35 * lit).toFixed(3)})`; g.lineWidth = 1;
        g.beginPath(); g.moveTo(X + side * 6, y); g.lineTo(X + side * 14, y); g.stroke();
        const size = last ? fs * (1.25 + .85 * lit) : fs;
        g.font = `${last ? 700 : 400} ${size}px ${FONT.naskh}`;
        g.textAlign = side > 0 ? 'left' : 'right';
        if (last && lit > 0) {
          g.globalCompositeOperation = 'lighter';
          const bx = X + side * (20 + size * 1.6), b = g.createRadialGradient(bx, y, 0, bx, y, size * 3.2);
          b.addColorStop(0, `rgba(243,217,143,${(.28 * lit).toFixed(3)})`); b.addColorStop(1, 'rgba(243,217,143,0)');
          g.fillStyle = b; g.fillRect(bx - size * 3.2, y - size * 3.2, size * 6.4, size * 6.4);
          g.globalCompositeOperation = 'source-over';
        }
        g.fillStyle = last ? `rgba(242,237,225,${(.45 + .55 * lit).toFixed(3)})` : `rgba(${Math.round(lerp(158, 243, lit))},${Math.round(lerp(165, 217, lit))},${Math.round(lerp(150, 143, lit))},${(.45 + .55 * lit).toFixed(3)})`;
        g.fillText(NASAB[i], X + side * 20, y);
      }
      g.globalCompositeOperation = 'lighter';
      q = g.createRadialGradient(X, yL, 0, X, yL, 30); q.addColorStop(0, 'rgba(255,236,190,.85)'); q.addColorStop(.25, 'rgba(243,217,143,.35)'); q.addColorStop(1, 'rgba(243,217,143,0)');
      g.fillStyle = q; g.fillRect(X - 30, yL - 30, 60, 60);
      g.globalCompositeOperation = 'source-over';
    },
  };
})();
