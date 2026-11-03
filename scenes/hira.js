// الغلاف: جبل النور ليلاً. Stars, the valley of Mecca with its lamps, the peak, and the cave of Hira high on its flank
// with the Prophet ﷺ seated in its mouth (Holy.draw: veiled, gold disc). A column of light comes down onto the cave
// (the revelation, a metaphor; the Prophet himself is never a light). Scrolling pushes the camera into the cave and
// brightens the column. Everything follows from p; t only twinkles stars and lamps and sways cloth.
(() => {
  const R = rng(7);
  const STARS = Array.from({ length: 300 }, () => ({ x: R(), y: Math.pow(R(), 1.4), r: .45 + R() * 1.3, a: .25 + R() * .7, sp: .4 + R() * 1.6, ph: R() * TAU }));
  const LAMPS = Array.from({ length: 54 }, () => ({ x: R(), y: R(), a: .3 + R() * .6, ph: R() * TAU }));
  const CRACKS = Array.from({ length: 22 }, () => [R(), R(), R(), R()]);
  function ridge(g, w, h, y, amp, f, ph, fill) {
    g.beginPath(); g.moveTo(-w, h * 2);
    for (let x = -w; x <= w * 2; x += 8) g.lineTo(x, y - amp * (.55 * Math.sin(x * f + ph) + .3 * Math.sin(x * f * 2.3 + ph * 1.7) + .15 * Math.sin(x * f * 5.1 + ph * .3)));
    g.lineTo(w * 2, h * 2); g.closePath(); g.fillStyle = fill; g.fill();
  }

  S.hira = {
    init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); },
    frame(p, t, el, st) {
      const cv = st.cv;
      fit(cv);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w < 2 || h < 2) return;
      const g = st.g, d = cv.width / w;
      g.setTransform(d, 0, 0, d, 0, 0);
      const wide = w >= 820, push = ease.io(seg(p, .15, 1)), lift = seg(p, .3, .85);

      // sky and stars (screen space)
      let q = g.createLinearGradient(0, 0, 0, h);
      q.addColorStop(0, '#02060a'); q.addColorStop(.55, '#08141a'); q.addColorStop(1, '#13262a');
      g.fillStyle = q; g.fillRect(0, 0, w, h);
      for (const s of STARS) {
        const a = s.a * (.55 + .45 * Math.sin(t * s.sp + s.ph)) * (1 - .35 * lift);
        g.fillStyle = `rgba(240,232,210,${a.toFixed(3)})`;
        g.beginPath(); g.arc(s.x * w, s.y * h * .74 + p * 24, s.r, 0, TAU); g.fill();
      }

      // the world, pushed toward the cave
      const px = wide ? w * .27 : w * .5, py = wide ? h * .34 : h - Math.min(h * .44, 380), bw = wide ? w * .3 : w * .62;
      const peakAt = (x) => {
        const u = (x - px) / bw, a = Math.min(1, Math.abs(u)), f = u < 0 ? Math.pow(a, .78) : Math.pow(a, .66);
        return Math.min(h * 1.6, py + (h - py) * f + a * (h - py) * .03 * (Math.sin(x * .05 + 1) + .55 * Math.sin(x * .17 + .3) + .3 * Math.sin(x * .43)));
      };
      const fh = Math.min(66, Math.max(30, h * .075)), cw = fh * 1.2, ch = fh * 1.05, cx = px + bw * .13, cy = peakAt(cx) + ch * .75;
      const z = 1 + 1.7 * push, tx = mix(cx, wide ? w * .3 : w * .5, push), ty = mix(cy, wide ? h * .6 : h * .7, push);
      g.save(); g.translate(tx, ty); g.scale(z, z); g.translate(-cx, -cy);

      ridge(g, w, h, h * .8, h * .045, 7 / w, 1.3, '#0f1c20');
      for (const l of LAMPS) { // Mecca's lamps in the valley
        const x = l.x * w; if (Math.abs(x - px) < bw * .7) continue;
        const a = l.a * (.75 + .25 * Math.sin(t * 1.3 + l.ph));
        g.fillStyle = `rgba(255,205,130,${(a * .8).toFixed(3)})`; g.beginPath(); g.arc(x, h * (.83 + l.y * .07), 1.1, 0, TAU); g.fill();
      }
      ridge(g, w, h, h * .9, h * .03, 11 / w, 4.1, '#070d10');

      // the column of light onto the cave
      const br = .07 + .035 * Math.sin(t * .5) + .14 * lift;
      g.globalCompositeOperation = 'lighter';
      q = g.createLinearGradient(0, cy - h * 1.2, 0, cy);
      q.addColorStop(0, 'rgba(243,217,143,0)'); q.addColorStop(1, `rgba(243,217,143,${br.toFixed(3)})`);
      g.fillStyle = q; // nine nested soft trapezoids, so the column has feathered edges and a bright core
      for (let i = 0; i < 9; i++) { const k = 1 - i / 9; g.globalAlpha = .17; g.beginPath(); g.moveTo(cx - w * .014 * k, cy - h * 1.2); g.lineTo(cx + w * .014 * k, cy - h * 1.2); g.lineTo(cx + cw * .8 * k, cy); g.lineTo(cx - cw * .8 * k, cy); g.closePath(); g.fill(); }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';

      // the mountain: a rocky sampled profile, steeper on the far side
      g.beginPath(); g.moveTo(px - bw, h * 1.6);
      for (let x = px - bw; x <= px + bw; x += 3) g.lineTo(x, peakAt(x));
      g.lineTo(px + bw, h * 1.6); g.closePath();
      q = g.createLinearGradient(0, py, 0, h); q.addColorStop(0, '#1b2629'); q.addColorStop(1, '#05080a');
      g.fillStyle = q; g.fill();
      g.save(); g.clip();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.2;
      for (const [a, b, c, e] of CRACKS) { const sx = px - bw * .5 + a * bw, sy = py + 20 + b * (h - py) * .8; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 20 + c * 30, sy - 6, sx + 40 + e * 50, sy + 4); g.stroke(); }
      q = g.createRadialGradient(cx, cy, 0, cx, cy, fh * 3.4); q.addColorStop(0, `rgba(243,217,143,${(.12 + br * .45).toFixed(3)})`); q.addColorStop(1, 'rgba(243,217,143,0)');
      g.fillStyle = q; g.fillRect(cx - fh * 3.4, cy - fh * 3.4, fh * 6.8, fh * 6.8);
      g.restore();

      // the cave mouth, and the Prophet ﷺ seated in it
      g.beginPath(); g.moveTo(cx - cw * .55, cy + ch * .45);
      g.bezierCurveTo(cx - cw * .62, cy - ch * .2, cx - cw * .25, cy - ch * .62, cx + cw * .05, cy - ch * .58);
      g.bezierCurveTo(cx + cw * .45, cy - ch * .5, cx + cw * .62, cy - ch * .05, cx + cw * .55, cy + ch * .45);
      g.closePath(); g.fillStyle = '#020304'; g.fill();
      if (window.Holy) Holy.draw(g, { who: 'prophet', pose: 'sit', x: cx, y: cy + ch * .42, h: fh, t, amb: .28 });
      g.restore();
    },
  };
})();
