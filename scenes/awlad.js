(() => {
// awlad — «أولاده»: his children, as a family tree of names in light over the night, inside the chapter «خديجة».
// The list is al-Kafi's (1:439–440), in its order: from Khadija القاسم، رقيّة، زينب، أمّ كلثوم, then الطيّب، الطاهر،
// فاطمة; from Mariya, إبراهيم (I'lam al-Wara 1:276). The rows of the fan are only its shape, not a claim about dates.
//   p −.05 → .135  مُحَمَّد ﷺ at the root; a branch of light to خديجة; from her four branches, each name written as the
//                  light reaches it («فوُلد له منها قبل مبعثه …», Kafi 1:439)
//      .15 → .275  the camera comes close to القاسم: his light settles and a thin shaft lifts from it (Kafi 3:218)
//      .29 → .415  three more branches from خديجة: الطيّب، الطاهر، فاطمة; Fatima's name in gold, a dashed halo ring drawn
//                  round it (Kafi 1:439–440)
//      .43 → .55   الطاهر settles the same way (Kafi 3:219)
//      .555 → .675 the camera crosses to the other side of the root: a branch to مارية, and from her to إبراهيم. The sky
//                  turns toward day over Medina and a pale sun stands in it (I'lam al-Wara 1:276)
//      .685 → .785 إبراهيم settles (Kafi 3:262–263)
//      .785 → .89  the moon's disc crosses the sun and the sky darkens; then the sun comes back clear (Kafi 3:208)
//      .885 → 1.05 night again. عليّ is written beside فاطمة, a link of light joins them, and from it two branches go
//                  down to الحسن and الحسين (gold, halo rings), their light running on below. Every other name recedes
//                  by the same amount (focus, not a claim); the camera draws back over the whole tree (Amali, majlis 58)
// Names only, no figure and no orb: a name in light is the text's own metaphor. Only the deaths the captions tell
// (al-Qasim, al-Tahir, Ibrahim) dim. Everything follows from p; t only breathes the light, the stars and the haze.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const WHITE = [255, 249, 234], IVORY = [242, 229, 196], BRONZE = [150, 128, 96], GREEN = [204, 236, 216], GOLD = [243, 206, 128], GOLDHI = [243, 217, 143], GGLOW = [121, 201, 162];
const FONT_N = 'Amiri, "Noto Naskh Arabic", serif', FS = 56; // names are drawn once at FS px and scaled

// the tree in units (x right, y down). [id, name, x, y, size, kind, written at, death at]
const NODES = [
  ['mo', 'مُحَمَّد ﷺ', 0, 0, 3.4, 'root', -1],
  ['kh', 'خديجة', 18.5, 11, 2.5, 'mother', .03],
  ['qa', 'القاسم', 38, 22.5, 2.6, 'kid', .068, .175],
  ['ru', 'رقيّة', 31.5, 30, 2.6, 'kid', .081],
  ['za', 'زينب', 25, 22.5, 2.6, 'kid', .092],
  ['uk', 'أمّ كلثوم', 18.5, 30, 2.6, 'kid', .105],
  ['ty', 'الطيّب', 12, 22.5, 2.6, 'kid', .318],
  ['th', 'الطاهر', 5.5, 30, 2.6, 'kid', .331, .455],
  ['fa', 'فاطمة', -1, 22.5, 2.8, 'holy', .343],
  ['ma', 'مارية', -26, 11, 2.5, 'mother', .588],
  ['ib', 'إبراهيم', -26, 22.5, 2.6, 'kid', .618, .7],
  ['al', 'عليّ', -13, 22.5, 2.7, 'holy', .898],
  ['ha', 'الحسن', -1, 39, 2.6, 'holy', .915],
  ['hu', 'الحسين', -13, 39, 2.6, 'holy', .92],
];
const LINE = new Set(['mo', 'fa', 'al', 'ha', 'hu']); // the names that do not recede at the end
const RING = 4.8; // halo radius in units at size 2.8
// branches: [from, to, grow start, grow end]; 'L' is the low point of the link between فاطمة and عليّ
const BR = [['mo', 'kh', 0, .032], ['kh', 'qa', .05, .07], ['kh', 'ru', .061, .083], ['kh', 'za', .073, .094], ['kh', 'uk', .085, .107],
  ['kh', 'ty', .3, .32], ['kh', 'th', .311, .333], ['kh', 'fa', .322, .345], ['mo', 'ma', .56, .59], ['ma', 'ib', .6, .62],
  ['L', 'ha', .903, .918], ['L', 'hu', .906, .922]];
const KEEP = new Set(['mo>kh', 'kh>fa', 'L>ha', 'L>hu']); // the light's path to al-Hasan and al-Husayn stays bright
// the camera: boxes in units [p, x0, x1, y0, y1] fitted into the free part of the frame
const CAM = [[-.05, -6, 42, -5, 33], [.13, -6, 42, -5, 33], [.18, 15, 44, 4, 35], [.25, 15, 44, 4, 35], [.3, -7, 42, -4, 34], [.42, -7, 42, -4, 34],
  [.465, -8, 42, 6, 36], [.53, -8, 42, 6, 36], [.59, -37, 7, -6, 32], [.67, -37, 7, -6, 32], [.79, -38, 9, -12, 28], [.87, -38, 9, -12, 28],
  [.912, -20, 6, 15, 47], [.958, -20, 6, 15, 47], [.988, -31, 43, -5, 49], [1.05, -31, 43, -5, 49]];

// periodic value noise → fbm, for the haze (tiles, so a pattern can repeat it)
const NZ = (() => { const r = rng(7121), a = new Float32Array(1024); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();
const vn = (x, y, P) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const i0 = ((xi % P) + P) % P, j0 = ((yi % P) + P) % P, i1 = (i0 + 1) % P, j1 = (j0 + 1) % P, hh = (i, j) => NZ[(i * 31 + j * 17 + ((i * j) % 7) * 13) & 1023];
  const a = hh(i0, j0), b = hh(i1, j0), c = hh(i0, j1), d = hh(i1, j1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x, y, P) => { let s = 0, a = .5, f = 1; for (let i = 0; i < 5; i++) { s += a * vn(x * f, y * f, P * f); f *= 2; a *= .5; } return s / .96875; };
function hazeTiles() {
  const N = 192, c = mk(N, N), g = c.getContext('2d'), id = g.createImageData(N, N), l = mk(N, N), gl = l.getContext('2d'), il = gl.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N * 5, v = y / N * 5, wx = fbm(u + 2.3, v, 5) * 2, wy = fbm(u, v + 5.9, 5) * 2, n = fbm(u + wx, v + wy, 5), m = fbm(u * .6 + 9, v * .6, 3), k = (y * N + x) * 4;
    const a = Math.min(1, Math.max(0, (n - .36) / .5)) ** 1.5;
    id.data[k] = 18 + 24 * m; id.data[k + 1] = 40 + 30 * (1 - m); id.data[k + 2] = 52 + 34 * m; id.data[k + 3] = 255 * a;
    const r = 1 - Math.abs(n * 2 - 1), b = Math.min(1, Math.max(0, (r - .45) / .55)) ** 2 * (.3 + .7 * a) + a * .08; // ridged: folds of lit mist
    il.data[k] = 255; il.data[k + 1] = 196 + 36 * m; il.data[k + 2] = 120 + 60 * m; il.data[k + 3] = 255 * Math.min(1, b);
  }
  g.putImageData(id, 0, 0); gl.putImageData(il, 0, 0);
  return { dark: c, lit: l };
}
const glowSprite = (c, n = 128) => { const s = mk(n, n), g = s.getContext('2d'), q = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); q.addColorStop(0, rgb(c, 1)); q.addColorStop(.25, rgb(c, .42)); q.addColorStop(.6, rgb(c, .1)); q.addColorStop(1, rgb(c, 0)); g.fillStyle = q; g.fillRect(0, 0, n, n); return s; };
// a soft vertical shaft: gaussian across, fading toward both ends (the light that lifts from a name as its death is told)
const SHAFT = (() => { const s = mk(48, 192), g = s.getContext('2d'), id = g.createImageData(48, 192); for (let y = 0; y < 192; y++) for (let x = 0; x < 48; x++) { const u = (x - 23.5) / 24, v = y / 191, k = (y * 48 + x) * 4; id.data[k] = 255; id.data[k + 1] = 232; id.data[k + 2] = 186; id.data[k + 3] = 255 * Math.exp(-u * u * 8) * Math.sin(Math.PI * v) ** 1.6; } g.putImageData(id, 0, 0); return s; })();
const R0 = rng(5309);
const STARS = Array.from({ length: 170 }, () => ({ x: R0(), y: R0() ** 1.3, r: .35 + R0() ** 3 * 1.3, a: .25 + R0() * .6, ph: R0() * TAU, sp: .6 + R0() * 1.8 }));
const MOTES = Array.from({ length: 46 }, () => ({ x: R0(), y: R0(), r: .5 + R0() * 1.2, sp: .006 + R0() * .02, ph: R0() * TAU }));

// a name: its ink, its glow (gold, or green for the mothers) and its settled bronze, rebuilt whenever a font loads
let fontGen = 0;
document.fonts?.addEventListener('loadingdone', () => { fontGen++; });
function nameSprite(txt, col, glowCol) {
  const font = `700 ${FS}px ${FONT_N}`, m = mk(4, 4).getContext('2d'); m.font = font;
  const tw = Math.max(FS, m.measureText(txt).width), pad = FS * .8, W = Math.ceil(tw + pad * 2), H = Math.ceil(FS * 2.1);
  const base = mk(W, H), g = base.getContext('2d');
  g.font = font; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgb(col); g.fillText(txt, W / 2, H * .52);
  const tint = (c, blur) => { const s = mk(W, H), q = s.getContext('2d'); if (blur) q.filter = `blur(${blur}px)`; q.drawImage(base, 0, 0); q.filter = 'none'; q.globalCompositeOperation = 'source-in'; q.fillStyle = rgb(c); q.fillRect(0, 0, W, H); return s; };
  const glow = mk(W, H), q = glow.getContext('2d');
  q.globalAlpha = .85; q.drawImage(tint(glowCol, FS * .07), 0, 0); q.globalCompositeOperation = 'lighter'; q.globalAlpha = .75; q.drawImage(tint(glowCol, FS * .3), 0, 0);
  return { base, glow, dim: tint(BRONZE, 0), W, H, tw, lo: (W - tw) / 2, hi: (W + tw) / 2 };
}

S.awlad = {
  init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); },
  frame(p, t, el, st) {
    const cv = st.cv, resized = fit(cv), w = cv.clientWidth, h = cv.clientHeight;
    if (w < 2 || h < 2) return;
    const g = st.g, d = cv.width / w, wide = w >= 820 || w > h * 1.05;
    if (document.fonts && !st.fl) { st.fl = 1; document.fonts.load(`700 ${FS}px Amiri`, NODES.map((n) => n[1]).join(' ')).then(() => { st.fk = ''; }, () => {}); }
    if (!st.haze) { st.haze = hazeTiles(); st.GW = glowSprite([255, 236, 196]); st.GS = glowSprite([255, 246, 224]); }
    if (st.fk !== `${fontGen}`) {
      st.fk = `${fontGen}`;
      st.N = {};
      let mw = 1, mh = 1;
      NODES.forEach(([id, txt, , , , kind]) => {
        const col = kind === 'root' ? WHITE : kind === 'mother' ? GREEN : kind === 'holy' ? GOLDHI : IVORY;
        const S2 = st.N[id] = nameSprite(txt, col, kind === 'mother' ? GGLOW : GOLD);
        mw = Math.max(mw, S2.W); mh = Math.max(mh, S2.H);
      });
      st.tmp = mk(mw, mh);
    }
    // the free part of the frame: left of the caption column on wide screens, the lower half on phones
    let ax0, ax1, ay0, ay1;
    if (wide) { const col = w - w * .04 - Math.min(w * .5, 30 * 16 + 32); ax0 = w * .03; ax1 = Math.max(w * .45, col - 18); ay0 = h * .07; ay1 = h * .95; }
    else { ax0 = 10; ax1 = w - 10; ay0 = h * .42; ay1 = h * .975; }
    const aw = ax1 - ax0, ah = ay1 - ay0;
    if (resized || !st.bg || st.bgW !== cv.width || st.bgH !== cv.height) {
      st.bgW = cv.width; st.bgH = cv.height;
      const bg = st.bg = mk(cv.width, cv.height), b = bg.getContext('2d');
      b.setTransform(d, 0, 0, d, 0, 0);
      let q = b.createLinearGradient(0, 0, 0, h); q.addColorStop(0, '#0c1a22'); q.addColorStop(.55, '#081218'); q.addColorStop(1, '#04080b'); b.fillStyle = q; b.fillRect(0, 0, w, h);
      q = b.createRadialGradient(ax0 + aw * .5, ay0 + ah * .45, 0, ax0 + aw * .5, ay0 + ah * .45, Math.hypot(aw, ah) * .7);
      q.addColorStop(0, 'rgba(40,64,58,.38)'); q.addColorStop(1, 'rgba(40,64,58,0)'); b.fillStyle = q; b.fillRect(0, 0, w, h);
      st.patH = null; st.patL = null; st.grainP = null; st.lb = mk(w / 4, h / 4);
    }
    // ---------- the camera ----------
    const [bx0, bx1, by0, by1] = keyAt(CAM, p), s = Math.min(aw / (bx1 - bx0), ah / (by1 - by0));
    const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2, ox = ax0 + aw / 2 - cx * s, oy = ay0 + ah / 2 - cy * s;
    const X = (u) => ox + u * s, Y = (v) => oy + v * s;
    // ---------- beats ----------
    const day = bump(p, .555, .61, .875, .915); // Medina by day, then night again
    const mv = .5 * smooth(seg(p, .785, .83)) + .5 * smooth(seg(p, .852, .892)); // the moon's crossing, 0 → .5 (full) → 1
    const cover = Math.max(0, 1 - Math.abs(mv - .5) * 2.2) * seg(p, .785, .79) * (1 - seg(p, .889, .892));
    const rec = smooth(seg(p, .885, .925)), breathe = 1 + .05 * Math.sin(t * 1.2) + .03 * Math.sin(t * 2.7 + 1);
    const nd = {};
    NODES.forEach(([id, , x, y, f, kind, wAt, dieAt]) => {
      const wr = wAt < 0 ? 1 : ease.out(seg(p, wAt, wAt + .02)), die = dieAt ? smooth(seg(p, dieAt, dieAt + .06)) : 0, rr = LINE.has(id) ? 0 : rec;
      nd[id] = { id, x, y, f, kind, wr, die, rec: rr, ring: kind === 'holy' ? RING * f / 2.8 : 0, ringK: kind === 'holy' ? ease.io(seg(p, wAt + .006, wAt + .036)) : 0 };
    });

    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(st.bg, 0, 0);
    g.setTransform(d, 0, 0, d, 0, 0);
    // the day over Medina: a dusky blue wash, warm low down
    if (day > .002) {
      let q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, 'rgba(96,132,172,1)'); q.addColorStop(.55, 'rgba(62,90,120,1)'); q.addColorStop(1, 'rgba(84,76,64,1)');
      g.globalAlpha = .72 * day * (1 - .75 * cover); g.fillStyle = q; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
    }
    // the stars, a little parallax with the camera; gone by day
    const px = -cx * s * .05, py = -cy * s * .05;
    for (const o of STARS) {
      const a = o.a * (.7 + .3 * Math.sin(t * o.sp + o.ph)) * (1 - .95 * day + .8 * cover * day);
      if (a < .02) continue;
      const x = ((o.x * w + px) % w + w) % w, y = ((o.y * h * .9 + py) % h + h) % h;
      g.fillStyle = `rgba(228,236,240,${a.toFixed(3)})`; g.beginPath(); g.arc(x, y, o.r, 0, TAU); g.fill();
    }
    // the haze: two layers, far and near, moving with the camera (depth) and drifting a little with t
    const pat = st.patH || (st.patH = g.createPattern(st.haze.dark, 'repeat'));
    const layer = (k, sc, a) => { pat.setTransform(new DOMMatrix().translate(-cx * s * k + Math.sin(t * .04) * 14, -cy * s * k + Math.cos(t * .05) * 9).scale(sc)); g.globalAlpha = a; g.fillStyle = pat; g.fillRect(0, 0, w, h); };
    const U = Math.max(w, h) / 192;
    layer(.18, U * 1.6, .8 * (1 - .4 * day)); layer(.42, U * 1.05, .5 * (1 - .4 * day));
    // the light of the root: a wide warm dawn in the mist round مُحَمَّد ﷺ, carried with the camera
    { const rx = X(0), ry = Y(4), R = Math.max(aw, ah) * 1.05, q = g.createRadialGradient(rx, ry, 0, rx, ry, R); q.addColorStop(0, 'rgba(243,206,128,.13)'); q.addColorStop(.45, 'rgba(243,206,128,.045)'); q.addColorStop(1, 'rgba(243,206,128,0)'); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - .5 * day; g.fillStyle = q; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    g.globalAlpha = 1;
    // the lit haze: a quarter-size buffer holds the reach of each lit name's light, then the warm folds of the mist are
    // kept only inside it and added over the scene, so the names light the air round them
    const lb = st.lb, lq = lb.getContext('2d'), ls = lb.width / w;
    lq.setTransform(1, 0, 0, 1, 0, 0); lq.globalCompositeOperation = 'source-over'; lq.globalAlpha = 1; lq.clearRect(0, 0, lb.width, lb.height);
    lq.setTransform(ls, 0, 0, ls, 0, 0); lq.globalCompositeOperation = 'lighter';
    for (const n of Object.values(nd)) {
      const a = n.wr * (1 - .85 * n.die) * (1 - .6 * n.rec) * (n.kind === 'root' ? 1 : n.kind === 'holy' ? .85 : .55);
      if (a < .01) continue;
      const rx = n.f * s * (n.kind === 'root' ? 8 : 5), ry = n.f * s * (n.kind === 'root' ? 5 : 3.2);
      lq.globalAlpha = Math.min(1, a); lq.drawImage(st.GW, X(n.x) - rx, Y(n.y) - ry, rx * 2, ry * 2);
    }
    lq.globalAlpha = 1; lq.globalCompositeOperation = 'source-in';
    const pl = st.patL || (st.patL = lq.createPattern(st.haze.lit, 'repeat'));
    pl.setTransform(new DOMMatrix().translate(-cx * s * .42 + Math.sin(t * .04) * 14, -cy * s * .42 + Math.cos(t * .05) * 9).scale(U * 1.05));
    lq.fillStyle = pl; lq.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .95 * (1 - .5 * day); g.drawImage(lb, 0, 0, w, h);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // the sun over Medina, and the eclipse (Kafi 3:208): the moon's disc is cut out of the sun, its corona at the full
    if (day > .01) {
      const sx = ax0 + aw * (wide ? .15 : .13), sy = ay0 + ah * (wide ? .12 : .1), R = Math.min(w, h) * (wide ? .036 : .045);
      const mx = sx + R * 2.3 * (1 - 2 * mv), my = sy - R * .35 * (1 - 2 * mv);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = .5 * day * (1 - .88 * cover); g.drawImage(st.GS, sx - R * 10, sy - R * 10, R * 20, R * 20);
      g.globalAlpha = .75 * day * (1 - .8 * cover); g.drawImage(st.GS, sx - R * 3, sy - R * 3, R * 6, R * 6);
      g.globalCompositeOperation = 'source-over';
      const sd = st.sun || (st.sun = mk(1, 1)), n = Math.ceil(R * 3 * d);
      if (sd.width !== n) { sd.width = sd.height = n; }
      const q = sd.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, n, n);
      q.fillStyle = 'rgb(255,250,236)'; q.beginPath(); q.arc(n / 2, n / 2, R * d, 0, TAU); q.fill();
      q.globalCompositeOperation = 'destination-out'; q.beginPath(); q.arc(n / 2 + (mx - sx) * d, n / 2 + (my - sy) * d, R * d * 1.01, 0, TAU); q.fill();
      g.globalAlpha = day; g.drawImage(sd, sx - n / d / 2, sy - n / d / 2, n / d, n / d);
      if (cover > .02) { // the moon's dark disc against the glow, and at the full the corona round it
        const k = smooth(Math.min(1, cover * 1.6)), kc = smooth(c01((cover - .55) / .45));
        if (kc > 0) {
          g.globalCompositeOperation = 'lighter';
          const cq = g.createRadialGradient(mx, my, R * .95, mx, my, R * 3.2); cq.addColorStop(0, `rgba(255,248,232,${(.9 * kc * day).toFixed(3)})`); cq.addColorStop(.18, `rgba(240,232,214,${(.35 * kc * day).toFixed(3)})`); cq.addColorStop(1, 'rgba(240,232,214,0)');
          g.globalAlpha = 1; g.fillStyle = cq; g.fillRect(mx - R * 3.2, my - R * 3.2, R * 6.4, R * 6.4);
          g.globalCompositeOperation = 'source-over';
        }
        g.globalAlpha = .92 * k * day; g.fillStyle = '#0b111c'; g.beginPath(); g.arc(mx, my, R, 0, TAU); g.fill();
      }
      g.globalAlpha = 1;
      if (cover > .01) { g.fillStyle = `rgba(3,6,12,${(.42 * cover * day).toFixed(3)})`; g.fillRect(0, 0, w, h); } // the sky darkens
    }
    // motes in the air
    for (const m of MOTES) {
      const y = ((m.y - t * m.sp) % 1 + 1) % 1 * h, x = m.x * w + Math.sin(t * .35 + m.ph) * 10;
      g.fillStyle = `rgba(243,217,143,${(.08 + .07 * Math.sin(t + m.ph)).toFixed(3)})`; g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill();
    }

    { const q = g.createRadialGradient(w * .45, h * .5, Math.min(w, h) * .35, w * .45, h * .5, Math.hypot(w, h) * .62); q.addColorStop(0, 'rgba(1,3,5,0)'); q.addColorStop(1, 'rgba(1,3,5,.62)'); g.fillStyle = q; g.fillRect(0, 0, w, h); } // the corners of the sky darken
    // ---------- the tree: drawn on its own layer, faded where it runs under the words ----------
    const g0 = g;
    {
    const tl = st.tl && st.tl.width === cv.width && st.tl.height === cv.height ? st.tl : (st.tl = mk(cv.width, cv.height)), g = tl.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, tl.width, tl.height);
    g.setTransform(d, 0, 0, d, 0, 0);
    const top = (n) => n.y - (n.ring || n.f * .62), bot = (n) => n.y + (n.ring || n.f * .62);
    // the link between فاطمة and عليّ, and its low point L, where the two branches below begin
    const fa = nd.fa, al = nd.al, Lx = (fa.x + al.x) / 2, Ly = bot(fa) + 2;
    const link = ease.io(seg(p, .886, .902));
    const bez = (P0, P1, P2, P3, n = 36) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0], v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1]]; });
    const quad = (P0, P1, P2, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * P0[0] + 2 * v * u * P1[0] + u * u * P2[0], v * v * P0[1] + 2 * v * u * P1[1] + u * u * P2[1]]; });
    const kh = nd.kh, bar = (x) => 16.4 + ((x - kh.x) / 20) ** 2 * 1.3; // the bar under خديجة that her children hang from
    const paths = BR.map(([a, b, g0, g1]) => {
      const A = a === 'L' ? { x: Lx, y: Ly } : nd[a], B = nd[b], y0 = a === 'L' ? Ly : bot(A), y1 = top(B), dy = y1 - y0;
      let pts;
      if (a === 'kh' && Math.abs(B.x - A.x) < .5) pts = [[A.x, y0], [B.x, y1]];
      else if (a === 'kh') { // down from her, along the bar, round the corner and down to the name
        const sd = Math.sign(B.x - A.x), c = 1.6, xs = [];
        for (let x = A.x + sd * c; sd > 0 ? x < B.x - c : x > B.x + c; x += sd * .8) xs.push([x, bar(x)]);
        pts = [[A.x, y0], ...quad([A.x, bar(A.x) - c], [A.x, bar(A.x)], [A.x + sd * c, bar(A.x + sd * c)]), ...xs, ...quad([B.x - sd * c, bar(B.x - sd * c)], [B.x, bar(B.x)], [B.x, bar(B.x) + c]), [B.x, y1]];
      } else if (Math.abs(B.x - A.x) < .5) pts = [[A.x, y0], [B.x, y1]];
      else pts = bez([A.x + Math.sign(B.x - A.x) * (a === 'mo' ? 2.2 : 0), y0], [A.x + (B.x - A.x) * .12, y0 + dy * .55], [B.x, y1 - dy * .5], [B.x, y1]);
      return { key: `${a}>${b}`, pts, k: ease.io(seg(p, g0, g1)), dim: (KEEP.has(`${a}>${b}`) ? 0 : rec) + .55 * (B.die || 0) };
    });
    paths.push({ key: 'link', pts: [...bez([fa.x, bot(fa)], [fa.x - .5, Ly], [Lx + 2, Ly], [Lx, Ly], 18), ...bez([Lx, Ly], [Lx - 2, Ly], [al.x + .5, Ly], [al.x, bot(al)], 18).slice(1)], k: link, dim: 0 });
    const thread = smooth(seg(p, .942, .975)); // the light runs on below al-Hasan and al-Husayn
    ['ha', 'hu'].forEach((id) => { const n = nd[id], y0 = bot(n); paths.push({ key: `run>${id}`, pts: bez([n.x, y0], [n.x, y0 + 2], [n.x + (id === 'ha' ? .8 : -.8), y0 + 5], [n.x + (id === 'ha' ? 1 : -1), y0 + 9], 20), k: thread, dim: 0, fade: 1 }); });

    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const P of paths) {
      if (P.k <= 0) continue;
      const Q = P.pts, cum = [0];
      for (let i = 1; i < Q.length; i++) cum.push(cum[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]));
      const L = P.k * cum[cum.length - 1], sp = [[X(Q[0][0]), Y(Q[0][1])]];
      for (let i = 1; i < Q.length; i++) {
        if (cum[i] <= L) { sp.push([X(Q[i][0]), Y(Q[i][1])]); continue; }
        const fr = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); sp.push([X(lerp(Q[i - 1][0], Q[i][0], fr)), Y(lerp(Q[i - 1][1], Q[i][1], fr))]); break;
      }
      if (sp.length < 2) continue;
      const br = (1 - .65 * Math.min(1, P.dim)) * (1 - .25 * cover), line = (a, lw) => { g.beginPath(); sp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = a; g.lineWidth = lw; g.stroke(); };
      if (P.fade) { // a thread that fades as it runs on
        const q = g.createLinearGradient(0, sp[0][1], 0, sp[sp.length - 1][1] + 1); q.addColorStop(0, rgb(GOLD, .8)); q.addColorStop(1, rgb(GOLD, 0));
        line(q, Math.max(1, s * .08)); continue;
      }
      line(rgb(GOLD, .07 * br), s * .6); line(rgb(GOLD, .22 * br), s * .2); line(rgb([255, 236, 190], .85 * br), Math.max(1, s * .07));
      if (P.k >= 1) { // the light keeps flowing down the branch
        g.setLineDash([s * .5, s * 2.6]); g.lineDashOffset = -t * s * 1.6; line(rgb([255, 240, 205], .3 * br), Math.max(1.2, s * .12)); g.setLineDash([]);
      } else { // the head of the light, where it is still growing
        const hd = sp.slice(-5); g.beginPath(); hd.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = 'rgba(255,246,224,.9)'; g.lineWidth = Math.max(1.6, s * .16); g.stroke();
        const [hx, hy] = sp[sp.length - 1]; g.globalAlpha = .5; g.drawImage(st.GW, hx - s * .9, hy - s * .9, s * 1.8, s * 1.8); g.globalAlpha = 1;
      }
    }
    // the halo rings of the four of the Kisa named here: a dashed gold ring drawn round the name (as .fr-halo)
    g.globalCompositeOperation = 'source-over';
    for (const n of Object.values(nd)) {
      if (!n.ringK) continue;
      const r = n.ring * s; g.setLineDash([r * .13, r * .17]); g.lineDashOffset = -t * r * .05;
      g.strokeStyle = `rgba(243,217,143,${(.88 * n.ringK).toFixed(3)})`; g.lineWidth = Math.max(1.2, s * .09);
      g.beginPath(); g.arc(X(n.x), Y(n.y), r, -Math.PI / 2, -Math.PI / 2 - TAU * n.ringK, true); g.stroke();
    }
    g.setLineDash([]);
    // the names: glow, ink, and the settled bronze of those whose death is told; a shaft of light lifts from them
    const tmp = st.tmp, tq = tmp.getContext('2d');
    for (const n of Object.values(nd)) {
      if (n.wr <= 0) continue;
      const S2 = st.N[n.id]; if (!S2) continue;
      const sc = n.f * s / FS, dw = S2.W * sc, dh = S2.H * sc, x = X(n.x), y = Y(n.y), X0 = x - dw / 2, Y0 = y - dh / 2;
      const lit = (n.kind === 'holy' || n.kind === 'root' ? 1.15 : .9) * (1 - .92 * n.die) * (1 - .6 * n.rec) * breathe * (1 - .2 * cover);
      const a = (1 - .45 * n.rec) * (1 - .2 * n.die), soft = (S2.hi - S2.lo) * .15, edge = S2.hi + soft - (S2.hi - S2.lo + soft * 2) * n.wr;
      const one = (img, alpha, op) => {
        if (alpha <= .004) return;
        let im = img;
        if (n.wr < 1) { // written from the right, as Arabic is
          tq.globalCompositeOperation = 'source-over'; tq.clearRect(0, 0, S2.W, S2.H); tq.drawImage(img, 0, 0);
          tq.globalCompositeOperation = 'destination-in'; const m = tq.createLinearGradient(edge - soft, 0, edge + soft * .3, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)'); tq.fillStyle = m; tq.fillRect(0, 0, S2.W, S2.H);
          im = tmp;
        }
        g.globalCompositeOperation = op; g.globalAlpha = Math.min(1, alpha); g.drawImage(im, 0, 0, S2.W, S2.H, X0, Y0, dw, dh);
      };
      if (lit > .02) { // a wide, low pool of light on the haze under a lit name (stretched flat, so it never reads as a ball)
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, .16 * lit * n.wr * (n.kind === 'root' ? 1.6 : 1)); g.drawImage(st.GW, x - dw * .75, y - dh * .3, dw * 1.5, dh * .6);
      }
      one(S2.glow, .55 * lit, 'lighter');
      one(S2.base, a * (1 - n.die), 'source-over');
      if (n.die > 0) one(S2.dim, a * n.die * .9, 'source-over');
      const lift = bump(n.die, 0, .3, .55, 1);
      if (lift > .01) {
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = .42 * lift;
        const sh = n.f * s * 2.6, up = n.f * s * (.15 + 1.1 * n.die);
        g.drawImage(SHAFT, x - n.f * s * .5, y - up - sh, n.f * s, sh);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    g.globalCompositeOperation = 'destination-in'; g.globalAlpha = 1;
    const mq = wide ? g.createLinearGradient(ax1 - w * .05, 0, ax1 + w * .045, 0) : g.createLinearGradient(0, ay0 - h * .06, 0, ay0 + 10);
    mq.addColorStop(0, wide ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)'); mq.addColorStop(1, wide ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    g.fillStyle = mq; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
    g0.setTransform(1, 0, 0, 1, 0, 0); g0.globalCompositeOperation = 'source-over'; g0.globalAlpha = 1; g0.drawImage(tl, 0, 0); g0.setTransform(d, 0, 0, d, 0, 0);
    }
    // grain over everything, so the dark reads as a surface and not a flat fill
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .06;
    g.fillStyle = st.grainP || (st.grainP = g.createPattern(grainTile(), 'repeat')); g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  },
};
})();
