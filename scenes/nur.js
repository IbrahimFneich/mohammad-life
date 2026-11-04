(() => {
// nur — «النور الأول»: before creation. A void with depth (no sky, no stars: the text is before heavens and earth),
// then a light that is the text's own metaphor: never a ball or a figure, only shafts, veils and the written names.
//   p −.05 → .14  the void, «إن الله كان إذ لا كان»: layered dark veils, grain, a slow push-in            (Kafi 1:442)
//      .13 → .27  a seam of light opens in the dark and widens; soft rays; its light spreads into the veils (نور الأنوار)
//      .26 → .42  in that light the two names write themselves, مُحَمَّد then عَلِيّ; the seam gives way to them (Kafi 1:442)
//      .47 → .7   the name آدم rises out of the dark below, earth-dark; the two names flow down into it and it
//                 fills with light («فلمّا خلق الله آدم سلك ذلك النور في صلبه»)                                (al-Khisal 2:640)
//      .72 → 1    the camera follows a twin thread down from آدم through the loins; at the end it parts in two,
//                 to عبد الله and أبو طالب, and runs on toward the lineage chapter                         (Kafi 1:442)
// Names only (Adam too): no figure, no face, no orb. Everything follows from p; t only breathes the light and veils.
const W2 = [255, 244, 214], GOLD = [243, 206, 128], ALI = [236, 246, 230], CLAY = [92, 70, 50];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
// periodic value noise → fbm, for the veils (tiles, so a pattern can repeat it)
const NZ = (() => { const r = rng(5113), a = new Float32Array(1024); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();
const vn = (x, y, P) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const i0 = ((xi % P) + P) % P, j0 = ((yi % P) + P) % P, i1 = (i0 + 1) % P, j1 = (j0 + 1) % P, h = (i, j) => NZ[(i * 31 + j * 17 + ((i * j) % 7) * 13) & 1023];
  const a = h(i0, j0), b = h(i1, j0), c = h(i0, j1), d = h(i1, j1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x, y, P) => { let s = 0, a = .5, f = 1; for (let i = 0; i < 5; i++) { s += a * vn(x * f, y * f, P * f); f *= 2; a *= .5; } return s / .96875; };
// two veil tiles from one field: the dark haze (cool, seen in the void) and the lit haze (warm streaks, seen only
// where the light reaches: ridged, so it reads as luminous folds of cloth rather than a fog)
function veils() {
  const N = 256, dark = mk(N, N), lit = mk(N, N), gd = dark.getContext('2d'), gl = lit.getContext('2d');
  const id = gd.createImageData(N, N), il = gl.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N * 6, v = y / N * 6, wx = fbm(u + 3.1, v, 6) * 2.2, wy = fbm(u, v + 7.7, 6) * 2.2;
    const n = fbm(u + wx, v + wy, 6), m = fbm(u * .5 + 11, v * .5, 3), r = 1 - Math.abs(n * 2 - 1), k = (y * N + x) * 4;
    const a = Math.min(1, Math.max(0, (n - .34) / .5)) ** 1.4;
    id.data[k] = 10 + 16 * m; id.data[k + 1] = 22 + 20 * (1 - m); id.data[k + 2] = 34 + 36 * m; id.data[k + 3] = 255 * a;
    const b = Math.min(1, Math.max(0, (r - .5) / .5)) ** 2 * (.35 + .65 * a) + a * .06;
    il.data[k] = 255; il.data[k + 1] = 178 + 40 * m; il.data[k + 2] = 84 + 60 * m; il.data[k + 3] = 255 * Math.min(1, b);
  }
  gd.putImageData(id, 0, 0); gl.putImageData(il, 0, 0);
  return { dark, lit };
}
// a soft radial sprite (drawn stretched, so the light is a tall flare or a veil, never a round ball)
const glow = (c, n = 128) => { const s = mk(n, n), g = s.getContext('2d'), q = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); q.addColorStop(0, rgb(c, 1)); q.addColorStop(.25, rgb(c, .42)); q.addColorStop(.6, rgb(c, .1)); q.addColorStop(1, rgb(c, 0)); g.fillStyle = q; g.fillRect(0, 0, n, n); return s; };
// a soft vertical shaft: gaussian across, fading toward both ends (no bright centre, so it never reads as a ball)
const SHAFT = (() => { const s = mk(64, 256), g = s.getContext('2d'), id = g.createImageData(64, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) { const u = (x - 31.5) / 32, v = y / 255, k = (y * 64 + x) * 4; id.data[k] = 255; id.data[k + 1] = 228; id.data[k + 2] = 176; id.data[k + 3] = 255 * Math.exp(-u * u * 7) * Math.sin(Math.PI * v) ** 1.5; } g.putImageData(id, 0, 0); return s; })();
const RAY = (() => { const s = mk(256, 8), g = s.getContext('2d'), q = g.createLinearGradient(0, 0, 256, 0); q.addColorStop(0, 'rgba(255,240,205,1)'); q.addColorStop(.3, 'rgba(255,226,170,.35)'); q.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = q; g.beginPath(); g.moveTo(0, 0); g.lineTo(256, 3.6); g.lineTo(256, 4.4); g.lineTo(0, 8); g.fill(); return s; })();
const R0 = rng(4171);
const RAYS = Array.from({ length: 64 }, () => ({ a: R0() * TAU, l: .25 + R0() ** 2 * .9, w: .5 + R0() * 1.6, al: .12 + R0() * .4, sp: (R0() - .5) * .5, ph: R0() * TAU }));
// «نُوِّرت منه الأنوار»: patches of the veils that catch the first light one after another, spreading outward
const FIL = Array.from({ length: 11 }, (_, i) => ({ a: i / 11 * TAU + (R0() - .5) * .4, l: .24 + R0() * .32, c: (R0() - .5) * 2, d: R0() * .06 }));
const NODES = 11; // the loins between Adam and the parting: an invented count, as art
const NAMES = [['مُحَمَّد', W2], ['عَلِيّ', ALI]];

// a name in light: a sharp sprite and two blurred ones, cached by size (and rebuilt whenever a font finishes loading)
let fontGen = 0;
document.fonts?.addEventListener('loadingdone', () => { fontGen++; });
function nameSprite(txt, fs, font, col) {
  const pad = fs * .9, W = Math.ceil(fs * txt.length * .75 + pad * 2), H = Math.ceil(fs * 2.2 + pad), base = mk(W, H), g = base.getContext('2d');
  g.font = `700 ${fs}px ${font}`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = rgb(col); g.fillText(txt, W / 2, H / 2);
  // the width of the ink itself, read back from the pixels (the font's metrics can lag behind its loading)
  const d = g.getImageData(0, 0, W, H).data; let lo = W, hi = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 30) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const tw = Math.max(1, hi - lo);
  const blur = (r, c) => { const s = mk(W, H), q = s.getContext('2d'); q.filter = `blur(${r}px)`; q.drawImage(base, 0, 0); if (c) { q.filter = 'none'; q.globalCompositeOperation = 'source-in'; q.fillStyle = rgb(c); q.fillRect(0, 0, W, H); } return s; };
  return { base, near: blur(fs * .06, GOLD), far: blur(fs * .26, GOLD), W, H, tw, lo, hi, tmp: mk(W, H) };
}
// draw a name revealed from the right by k (Arabic is written right to left), with a soft writing edge
function drawName(g, S, x, y, sc, k, a, lit) {
  if (k <= 0 || a <= 0) return;
  const { W, H, tmp, lo, hi } = S, q = tmp.getContext('2d'), soft = (hi - lo) * .15, e = hi + soft - (hi - lo + soft * 2) * k; // the pen runs over the ink only
  const one = (src, alpha) => {
    q.globalCompositeOperation = 'copy'; q.drawImage(src, 0, 0);
    if (k < 1) { q.globalCompositeOperation = 'destination-in'; const m = q.createLinearGradient(e - soft, 0, e + soft * .3, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)'); q.fillStyle = m; q.fillRect(0, 0, W, H); }
    g.globalAlpha = alpha; g.drawImage(tmp, x - W * sc / 2, y - H * sc / 2, W * sc, H * sc);
  };
  g.globalCompositeOperation = 'lighter';
  one(S.far, Math.min(1, .55 * a * lit)); one(S.near, Math.min(1, .6 * a * lit));
  g.globalCompositeOperation = 'source-over'; one(S.base, a);
  g.globalAlpha = 1;
}

S.nur = {
  init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); },
  frame(p, t, el, st) {
    const cv = st.cv, resized = fit(cv), w = cv.clientWidth, h = cv.clientHeight;
    if (w < 2 || h < 2) return;
    if (!st.V) { st.V = veils(); st.G = glow([255, 226, 170]); st.GW = glow([255, 250, 236]); } // made on the first frame, not at page load
    const g = st.g, d = cv.width / w, wide = w >= 820 || w > h * 1.05;
    if (document.fonts && !st.fl) { st.fl = 1; Promise.all([document.fonts.load('700 40px "Aref Ruqaa"', 'مُحَمَّد عَلِيّ'), document.fonts.load('700 40px Amiri', 'آدَم عبد الله أبو طالب')]).then(() => { st.key = ''; }, () => {}); }
    // layout (CSS px): the light and the names left of the caption column (wide) or in the lower half (phones)
    const X = wide ? w * .36 : w * .5, U = wide ? Math.min(w * .62, h * 1.05) : Math.min(w * 1.05, h * .62);
    const Yn = wide ? h * .46 : h * .7, Ya = Yn + (wide ? h * .34 : h * .25), Ys = Ya + (wide ? h * .78 : h * .62), Ye = Ys + (wide ? h * .15 : h * .12);
    const fsN = Math.max(34, Math.min(wide ? 132 : 92, U * .2, wide ? 1e9 : w * .17)), fsA = fsN * 1.18;
    const key = `${w}x${h}|${fsN | 0}|${fontGen}`;
    if (resized || st.key !== key) {
      st.key = key;
      st.N = NAMES.map(([s, c]) => nameSprite(s, fsN, '"Aref Ruqaa", Amiri, serif', c));
      st.A = nameSprite('آدَم', fsA, 'Amiri, serif', [255, 238, 200]);
      st.Ad = nameSprite('آدَم', fsA, 'Amiri, serif', CLAY);
      st.L = ['عبد الله', 'أبو طالب'].map((s) => nameSprite(s, fsN * .34, 'Amiri, serif', [236, 214, 160]));
      st.sc = mk(w / 4, h / 4); st.patL = null; // the lit veils are composed at quarter size
      const bg = st.bg = mk(cv.width, cv.height), b = bg.getContext('2d');
      b.setTransform(d, 0, 0, d, 0, 0);
      let q = b.createRadialGradient(X, h * .5, 0, X, h * .5, Math.hypot(w, h) * .75);
      q.addColorStop(0, '#0a0f17'); q.addColorStop(.55, '#05080d'); q.addColorStop(1, '#020305'); b.fillStyle = q; b.fillRect(0, 0, w, h);
    }
    // the camera: holds, then lifts as the names go down to آدم, then follows the thread down to the parting
    const c1 = wide ? h * .16 : h * .14, camEnd = Ys - (wide ? h * .62 : h * .58); // at the end the parting sits clear of the dock
    const camY = c1 * ease.io(seg(p, .46, .64)) + (camEnd - c1) * ease.io(seg(p, .72, .97)) - (wide ? h * .03 : h * .02) * (1 - seg(p, -.05, .3));
    const push = 1 + .06 * p; // a slow push-in on the veils
    // the light, beat by beat
    const kindle = smooth(seg(p, .13, .24)), open = ease.out(seg(p, .17, .3)), wN = [ease.io(seg(p, .27, .335)), ease.io(seg(p, .325, .39))];
    const toA = ease.io(seg(p, .54, .66)), fillA = smooth(seg(p, .6, .7)), riseA = smooth(seg(p, .47, .57));
    const thread = ease.io(seg(p, .72, .92)), part = smooth(seg(p, .88, .98));
    const breathe = 1 + .05 * Math.sin(t * 1.3) + .03 * Math.sin(t * 2.9 + 1);
    const cy = Yn - camY, ay = Ya - camY; // screen y of the names' row and of آدم
    const L = kindle * (1 - .35 * toA); // the first light's own strength

    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(st.bg, 0, 0);
    g.setTransform(d, 0, 0, d, 0, 0);
    // the dark veils: two layers, far and near, drifting with p (depth) and breathing a little with t
    const pat = st.patD || (st.patD = g.createPattern(st.V.dark, 'repeat'));
    const layer = (P, s, ox, oy, a) => { P.setTransform(new DOMMatrix().translate(ox, oy).scale(s)); g.globalAlpha = a; g.fillStyle = P; g.fillRect(0, 0, w, h); };
    const sF = U / 200 * push, sN = U / 120 * push;
    layer(pat, sF, X - 128 * sF + Math.sin(t * .05) * 12, h * .5 - 128 * sF - camY * .35 - p * 40, .8);
    layer(pat, sN, X - 90 * sN - p * 70, h * .5 - 140 * sN - camY * .7 + Math.cos(t * .07) * 10, .5);
    g.globalAlpha = 1;
    // the lit veils: a quarter-size buffer holds the light's reach (a sum of stretched glows), then the warm folds
    // are kept only inside it and added over the scene
    const sc = st.sc, q = sc.getContext('2d'), qs = sc.width / w;
    q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, sc.width, sc.height);
    q.setTransform(qs, 0, 0, qs, 0, 0); q.globalCompositeOperation = 'lighter';
    const reach = (x, y, rx, ry, a) => { if (a > .003) { q.globalAlpha = Math.min(1, a); q.drawImage(st.GW, x - rx, y - ry, rx * 2, ry * 2); } };
    reach(X, cy, U * (.2 + .75 * open), U * (.35 + .85 * open), L * .9);
    FIL.forEach((f) => { const k = ease.out(seg(p, .19 + f.d, .34 + f.d)) * (1 - .5 * toA); const r = U * f.l * k * 1.4; reach(X + Math.cos(f.a + f.c * .4) * r, cy + Math.sin(f.a + f.c * .4) * r, U * .3, U * .24, k * .55); });
    // the pair of names centred on the light: مُحَمَّد on the right, عَلِيّ on the left, a fixed space between their ink
    const t0 = st.N[0].tw, t1 = st.N[1].tw, sp = fsN * (wide ? .9 : .6), lx = X - (t0 + t1 + sp) / 2, NX = [lx + t1 + sp + t0 / 2, lx + t1 / 2];
    NX.forEach((nx, i) => reach(mix(nx, X, toA), mix(cy, ay, toA), U * .45, U * .5, wN[i] * .7 * (1 - .6 * toA)));
    reach(X, ay, U * .7, U * .45, fillA * .9);
    if (thread > 0) for (let i = 0; i <= 6; i++) { const u = i / 6; if (u <= thread) reach(X, ay + (Ys - Ya) * u, U * .32, U * .3, .5 * (1 - u * .4)); }
    reach(X, Ys - camY, U * .5, U * .3, part * .6);
    q.globalAlpha = 1; q.globalCompositeOperation = 'source-in';
    const pl = st.patL || (st.patL = q.createPattern(st.V.lit, 'repeat'));
    pl.setTransform(new DOMMatrix().translate(X - 100 * sN - p * 70, h * .5 - 130 * sN - camY * .7).scale(sN * .9));
    q.fillStyle = pl; q.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .75; g.drawImage(sc, 0, 0, w, h); g.globalAlpha = 1;

    // the first light: a seam that opens, a tall flare, rays turning slowly with p, and the filaments
    if (L > .002) {
      const sH = U * (.06 + .85 * kindle), sW = U * (.006 + .022 * open), wn = (wN[0] + wN[1]) / 2;
      g.globalAlpha = Math.min(1, L * .42 * (1 - .6 * wn)); g.drawImage(st.G, X - U * (.25 + .5 * open), cy - U * (.7 + .5 * open), U * (.5 + 1 * open), U * (1.4 + 1 * open));
      g.globalAlpha = Math.min(1, L * breathe * (1 - .97 * wn)); g.drawImage(st.GW, X - sW * 3, cy - sH, sW * 6, sH * 2);
      g.globalAlpha = Math.min(1, L * (1 - wn)); g.drawImage(st.GW, X - sW * .5, cy - sH * .75, sW, sH * 1.5);
      g.globalAlpha = Math.min(1, L * .28 * (1 - wn)); g.drawImage(st.GW, X - U * .9 * open, cy - U * .008, U * 1.8 * open, U * .016); // a thin level streak
      for (const r of RAYS) {
        const a = r.a + p * .55 + r.sp * p, len = U * r.l * (.2 + .8 * open) * (1 + .06 * Math.sin(t * .8 + r.ph)), al = r.al * .3 * L * (.3 + .7 * open) * (1 - wn);
        if (al < .01) continue;
        g.setTransform(d * Math.cos(a), d * Math.sin(a), -d * Math.sin(a) * r.w, d * Math.cos(a) * r.w, d * X, d * cy);
        g.globalAlpha = Math.min(1, al); g.drawImage(RAY, 0, -4, len, 8);
      }
      g.setTransform(d, 0, 0, d, 0, 0);
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

    // آدم: rises out of the dark as an earth-dark name; the light then fills it from within
    const SA = st.A, sA = 1 + .04 * riseA;
    if (riseA > 0) {
      const ya = ay + (1 - riseA) * U * .05;
      g.globalAlpha = riseA * .9 * (1 - .5 * fillA); g.drawImage(st.Ad.base, X - SA.W * sA / 2, ya - SA.H * sA / 2 + 2, SA.W * sA, SA.H * sA);
      g.globalAlpha = 1;
      if (fillA > 0) drawName(g, SA, X, ya, sA, 1, fillA, 1.15 * breathe);
    }
    // the two names: written in the light, then carried down into آدم along two converging paths. One light holds
    // them: a soft band joins the two, and each stands in its own column of light
    const held = Math.min(wN[0], wN[1]) * (1 - toA), half = (NX[0] - NX[1]) / 2 + fsN * .5;
    if (held > 0) {
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = .32 * held * breathe; g.drawImage(st.G, X - half * 1.5, cy - fsN * .55, half * 3, fsN * 1.1);
      NX.forEach((nx) => { g.globalAlpha = .22 * held; g.drawImage(st.G, nx - fsN * .9, cy - U * .55, fsN * 1.8, U * 1.1); });
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    const fall = bump(p, .52, .6, .66, .73); // a soft fall of light from the names' row onto آدم while they go down
    if (fall > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .3 * fall; g.drawImage(SHAFT, X - fsA * .7, cy - (ay - cy) * .25, fsA * 1.4, (ay - cy) * 1.55); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    st.N.forEach((S, i) => {
      // each name glides down into آدم, shrinking, a soft smear of its own light behind it, and fades as it enters
      const side = i === 0 ? 1 : -1, x0 = NX[i], x2 = X + side * fsA * .14, y2 = ay - fsA * .28;
      const at = (u) => [mix(x0, x2, ease.in(u) * .6 + u * .4), mix(cy, y2, ease.io(u))];
      const hk = toA, [x, y] = at(hk), s = mix(1, .38, smooth(hk)), a = (1 - smooth(seg(hk, .5, .92))) * (.4 + .6 * seg(p, .27, .3));
      if (hk > 0 && hk < 1) {
        g.globalCompositeOperation = 'lighter';
        for (let j = 1; j <= 9; j++) {
          const kk = Math.max(0, hk - j * .03), [xx, yy] = at(kk), ss = mix(1, .38, smooth(kk));
          g.globalAlpha = .16 * (1 - j / 10) * a * seg(hk, 0, .1); g.drawImage(S.far, xx - S.W * ss / 2, yy - S.H * ss / 2, S.W * ss, S.H * ss);
        }
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      }
      drawName(g, S, x, y, s, wN[i], a, (1.1 + .3 * L) * breathe);
    });
    // the twin thread from آدم down through the loins, a strand for each; it parts at the end in two
    if (thread > 0) {
      const y0 = ay + fsA * .55, y1 = Ys - camY, yh = mix(y0, y1, thread), amp = Math.max(4, U * .012);
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      const strand = (ph, col, side) => {
        const pts = [];
        for (let y = y0; y <= yh; y += 3) { const u = (y - y0) / Math.max(1, y1 - y0); pts.push([X + Math.sin(u * 22 + ph - p * 6) * amp * Math.min(1, u * 8), y]); }
        if (part > 0) for (let i = 1; i <= 30; i++) { const u = i / 30 * part; pts.push([X + side * U * .2 * smooth(u), y1 + (Ye - Ys) * u]); }
        [[5, .07], [2.4, .22], [1.1, .8]].forEach(([lw, al]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = rgb(col, al); g.lineWidth = lw; g.stroke(); });
      };
      strand(0, GOLD, 1); strand(Math.PI, ALI, -1);
      for (let i = 1; i < NODES; i++) { // the loins it passes: small lights that wake as the thread reaches them
        const y = y0 + (y1 - y0) * i / NODES, lit = c01((yh - y) / 30);
        if (lit <= 0) continue;
        g.globalAlpha = .35 + .4 * lit; g.drawImage(st.G, X - 9, y - 6, 18, 12);
      }
      g.globalAlpha = Math.min(1, .7 * (1 - part)); g.drawImage(st.GW, X - amp * 1.6, yh - amp * 9, amp * 3.2, amp * 11); // the head of the thread
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      if (part > 0) st.L.forEach((S, i) => { const side = i === 0 ? 1 : -1; drawName(g, S, X + side * U * .2, Ye - camY + S.H * .45, 1, 1, smooth(seg(part, .45, 1)), .6); });
    }
    // grain over everything, so the dark reads as a surface and not a flat fill
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07;
    g.fillStyle = st.grain || (st.grain = g.createPattern(grainTile(), 'repeat')); g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  },
};
})();
