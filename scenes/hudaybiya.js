(() => {
// hudaybiya: Dhu al-Qa'da 6 AH. The Muslims in white ihram with their sacrificial camels camped at al-Hudaybiya, the
// hills of Mecca ahead to the south. Quraysh's envoy (a faceless silhouette, unnamed) rides in; the Prophet ﷺ sits
// on the mat and Ali writes the treaty. The dispute as al-Irshad 1:119–121 tells it: Ali wipes «بسم الله الرحمن
// الرحيم» at the Prophet's word and writes «باسمك اللهمّ»; «رسول الله» his hand will not erase, so the Prophet erases
// it with his own hand. Then the camp turns back north toward Medina at dusk and a gold light comes down (al-Fath 1).
// A pinhole camera over a small world in metres (x east, y up, z north), always looking south toward Mecca, keyed on
// p; the land is a heightfield painted by terrainRaster (core.js). Two inserts look straight down on the sheet:
//   -.05–.16  the camp from above, late afternoon        .42–.575  insert: the Bismillah, «باسمك اللهمّ», the name
//   .16–.33   down to the mat; the envoy rides in       .555–.675 the mat: the envoy objects; Ali's hand stops
//   .33–.44   the mat: Ali takes up the pen             .655–.77  insert: the Prophet's sleeve wipes «رسول الله»
//   .75–1.05  up and back over the camp; the column turns north at dusk, the Prophet at its head; the light comes
// The Prophet and Ali are drawn only by Holy.draw (scenes/holy.js); in the inserts only their sleeves are in frame.
// Everyone else is a faceless silhouette. The words on the sheet are al-Irshad's (dev/quotes-hudaybiya.txt).
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const D2R = Math.PI / 180;
const ridged = (a, b) => 1 - Math.abs(Math.sin(a + Math.sin(b * .73) * 1.3) * Math.cos(b + Math.sin(a * .61) * 1.1));

// ---------- the land: a broad gravel plain, low hills round it, the ridges of the Haram to the south ----------
function hgt(x, z) {
  const d0 = Math.hypot(x, z);
  let h = (.32 * Math.sin(x * .05 + z * .031) * Math.sin(z * .043 - x * .02) + .18 * Math.sin(x * .13 - z * .09)) * c01((d0 - 6) / 30);
  h += 2.4 * Math.sin(x * .0042 + 1) * Math.sin(z * .0037 + .3) * c01((d0 - 150) / 300); // broad swells
  const r = Math.hypot(x, (z - 100) * .9), ring = smooth(c01((r - 650) / 1100));
  if (ring > 0) h += ring * (18 + 80 * ridged(x * .0026, z * .0023 + 1) + 24 * ridged(x * .009 + 2, z * .008));
  const haram = smooth(c01((-z - 1500) / 3000));
  if (haram > 0) h += haram * (160 + 300 * ridged(x * .00095 + .4, z * .0011) + 110 * ridged(x * .0031, z * .0029 + 2) + 34 * ridged(x * .011, z * .01 + 1));
  return h;
}
const alb = (x, z, h, hx, hz) => {
  const v = c01(.5 + .5 * Math.sin(x * .07 + z * .05) * Math.sin(z * .11 - x * .03) + .3 * Math.sin(x * .021 - z * .017));
  const grav = c01(Math.sin(x * .013 + Math.sin(z * .011) * 2) * .8 - .1) * .55, rock = Math.max(c01(Math.hypot(hx, hz) * 1.5 - .25), c01(h / 45) * .9);
  return lerp(lerp(lerp([206, 184, 148], [184, 160, 124], v), [150, 132, 108], grav), lerp([110, 94, 82], [72, 62, 58], v), rock);
};

// ---------- the mat, the seats, the sheet (metres; the sheet's text reads from the north, the camera's side) ----------
const PRO = [.42, -.42], ALI = [-.5, -.3], ENV = [1.55, .95], INK = [-.44, .2];
const SC = [-.04, .24], SHW = .27, SHD = .19; // the sheet's centre and half sizes; u runs west, v runs north
const MAT = [.08, -.02, 1.45, 1.05];
const CAMEL_STOP = [4.2, -12], RIDE_FROM = [34, -380], RIDE_TO = [60, -1100];
const ENV_WALK = [[3.9, -11.2], [3.6, -4], [2.9, 1.5], ENV];
const PATHX = (z) => PRO[0] + 2.6 * Math.sin(z * .017) * c01(z / 12);
const headZ = (p) => mix(PRO[1], 235, smooth(seg(p, .79, 1.06)));
const walkPath = (P, u) => {
  const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { L.push(Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); tot += L[i - 1]; }
  let s = c01(u) * tot; for (let i = 0; i < L.length; i++) { if (s <= L[i] || i === L.length - 1) { const k = c01(s / L[i]); return [mix(P[i][0], P[i + 1][0], k), mix(P[i][1], P[i + 1][1], k), P[i + 1][0] - P[i][0], tot]; } s -= L[i]; }
  return [P[0][0], P[0][1], 1, tot];
};
// the envoy: rides in, the camel kneels, he walks to the mat and sits; after the treaty he rides back toward Mecca
function envoyAt(p) {
  const rideIn = seg(p, .165, .275), kneel = smooth(seg(p, .274, .292)) * (1 - smooth(seg(p, .81, .826))), rideOut = seg(p, .826, 1.03);
  let cx, cz, dir = 1, moving = false, dist;
  if (p < .275) { const k = 1 - (1 - rideIn) ** 1.4; cx = mix(RIDE_FROM[0], CAMEL_STOP[0], k); cz = mix(RIDE_FROM[1], CAMEL_STOP[1], k); moving = rideIn > 0 && rideIn < 1; dir = 1; dist = k * 370; }
  else if (p < .826) { cx = CAMEL_STOP[0]; cz = CAMEL_STOP[1]; dist = 370; }
  else { const k = rideOut * rideOut; cx = mix(CAMEL_STOP[0], RIDE_TO[0], k); cz = mix(CAMEL_STOP[1], RIDE_TO[1], k); moving = rideOut > 0 && rideOut < 1; dir = -1; dist = 370 + k * 1090; }
  const camel = { x: cx, z: cz, kneel, dir, moving, ph: dist / 1.9 };
  let man = null;
  if (p >= .292 && p < .81) {
    const wIn = seg(p, .292, .33), wOut = seg(p, .786, .81);
    if (p < .33) { const q = walkPath(ENV_WALK, smooth(wIn)); man = { mode: 'walk', x: q[0], z: q[1], ph: wIn * q[3] / 1.4, dir: q[2] < 0 ? -1 : 1 }; }
    else if (p < .786) man = { mode: 'sit', x: ENV[0], z: ENV[1] };
    else { const q = walkPath(ENV_WALK, 1 - smooth(wOut)); man = { mode: 'walk', x: q[0], z: q[1], ph: wOut * q[3] / 1.4, dir: q[2] < 0 ? 1 : -1 }; }
  }
  return { camel, man, mounted: p < .292 || p >= .81 };
}

// ---------- the sheet's words and when each is written or wiped ----------
const TXT = { a: 'بسم الله الرحمن الرحيم', b: 'باسمك اللهمّ', c: 'هذا ما قاضى عليه محمّد', d: 'رسول الله' };
const SCHED = { a: [.437, .474], o1: [.474, .5], wa: [.5, .52], b: [.522, .536], c: [.54, .557], o2: [.585, .645], wd: [.697, .735], rest: [.776, .87] };

// ---------- camera keys: [p, x, y, z, yaw°, pitch°, phone yaw shift°, phone step back m] ----------
const CAM = [
  [-.06, 30, 15, 190, 193, -6.5, -3, 0], [.07, 22, 12, 140, 192, -6, -3, 0], [.16, 8, 7, 52, 189, -5, -3, 4],
  [.22, -2.4, 2.9, 10.5, 186, -4, -6, 4], [.3, -1.7, 2.5, 8.6, 187, -4.5, -7, 3.5],
  [.37, .55, 1.72, 4.7, 189, -12.5, -9, 1.6], [.44, .45, 1.66, 4.35, 189, -13, -9, 1.6], [.56, .6, 1.6, 4.15, 190, -11, -9, 1.5],
  [.66, .45, 1.55, 3.8, 190, -10.5, -9, 1.5], [.76, .45, 1.62, 4.0, 189, -10.5, -9, 1.5], [.79, .1, 2.1, 6.8, 188, -8, -9, 1.6],
];
const track = (p) => { const z = headZ(p); return [PATHX(z) - 3.4, hgt(PATHX(z), z + 13) + 2.7, z + 13, 183.5, -4.2, -6, 3]; };
const camKey = (K, p) => { let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++; return crv(K.map((k) => k.slice(1)), i + smooth(c01((p - K[i][0]) / (K[i + 1][0] - K[i][0])))); };
const CAMX = CAM.concat([.83, .9, .97, 1.06].map((q) => [q, ...track(q)]));
const camAt = (p) => (p > .79 ? lerp(camKey(CAMX, p), track(p), smooth(seg(p, .79, .84))) : camKey(CAMX, p)); // in the return, exactly ahead of him
// light keys: p, sky top, sky mid, horizon, ambient, sun colour, sun elevation°, fog colour, fog length, stars
const LK = [
  [-.06, [62, 96, 146], [140, 160, 184], [232, 214, 186], [126, 128, 142], [255, 228, 186], 18, [214, 200, 178], 5200, 0],
  [.4, [58, 88, 138], [140, 150, 172], [238, 206, 164], [124, 120, 132], [255, 214, 160], 12, [218, 196, 166], 5000, 0],
  [.74, [50, 70, 120], [140, 136, 160], [246, 186, 130], [126, 114, 122], [255, 190, 126], 6, [222, 184, 148], 4800, 0],
  [.82, [40, 52, 100], [128, 112, 140], [250, 164, 108], [124, 104, 112], [255, 160, 96], 2, [214, 160, 130], 4500, 0],
  [.9, [26, 34, 74], [96, 80, 118], [238, 136, 98], [110, 92, 112], [255, 136, 84], -1.5, [168, 120, 116], 4200, .12],
  [1.06, [12, 16, 40], [52, 50, 86], [184, 104, 92], [82, 76, 104], [255, 120, 70], -5, [110, 88, 102], 3800, .55],
];
const SUN_AZ = 258 * D2R; // a little south of west

// ---------- silhouettes (u across, v up, metres) ----------
const IHS = [-.2, .27, -.215, .6, -.25, .98, -.245, 1.2, -.24, 1.31, -.2, 1.38, -.12, 1.43, -.05, 1.46, .05, 1.46, .12, 1.43, .2, 1.38, .24, 1.31, .245, 1.2, .25, .98, .215, .6, .2, .27, .08, .24, -.08, .24]; // the two cloths of ihram, to mid-shin
const IHT = [-.46, 0, -.44, .1, -.3, .24, -.24, .5, -.23, .66, -.16, .72, -.06, .75, .06, .75, .16, .72, .23, .66, .24, .5, .3, .24, .44, .1, .46, 0];
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MAN2 = [-.4, 0, -.3, .5, -.21, 1.0, -.26, 1.32, -.2, 1.44, -.1, 1.5, -.14, 1.58, -.13, 1.7, -.04, 1.79, .08, 1.78, .14, 1.68, .12, 1.56, .07, 1.5, .19, 1.44, .25, 1.28, .2, 1.0, .3, .5, .36, 0];
const BACKSIT = [-.46, 0, -.47, .12, -.4, .32, -.32, .52, -.28, .64, -.2, .72, -.1, .77, .1, .78, .2, .74, .3, .64, .36, .46, .42, .24, .48, .06, .46, 0]; // the envoy seated, seen from behind
const CAMS = [-1.15, 1.55, -1.0, 1.75, -.6, 1.92, -.15, 2.18, .25, 1.98, .5, 1.72, .72, 1.6, .98, 1.72, 1.12, 1.95, 1.18, 2.12, 1.32, 2.2, 1.6, 2.1, 1.6, 2.0, 1.35, 1.98, 1.15, 1.82, 1.0, 1.5, .82, 1.25, .6, 1.08, -.2, 1.02, -.8, 1.08, -1.05, 1.2];
const CAMK = [-1.2, .15, -1.25, .45, -1.0, .78, -.5, .98, -.1, 1.25, .3, 1.05, .5, .85, .68, .78, .9, .95, 1.05, 1.25, 1.12, 1.48, 1.28, 1.56, 1.55, 1.46, 1.54, 1.37, 1.3, 1.36, 1.08, 1.12, .95, .8, .85, .4, .95, .12, .8, 0, -.9, 0, -1.15, .05];
const poly = (g, sh, bx, by, s, sv, dir, sway = 0) => {
  g.beginPath();
  for (let i = 0; i < sh.length; i += 2) { const v = sh[i + 1], X = bx + (sh[i] + sway * (1 - v / 1.8) ** 2) * dir * s, Y = by - v * sv; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath();
};
// a sleeve for anyone who is not of the five: tapered from the shoulder, a dark cuff, no hand
const sleeveOf = (g, sx, sy, ex, ey, w, col, cuff) => {
  const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  g.beginPath(); g.moveTo(sx + nx * w / 2, sy + ny * w / 2); g.lineTo(ex + nx * w * .38, ey + ny * w * .38);
  g.arc(ex, ey, w * .38, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); g.lineTo(sx - nx * w / 2, sy - ny * w / 2); g.closePath();
  g.fillStyle = col; g.fill();
  g.beginPath(); g.arc(ex, ey, w * .3, 0, TAU); g.fillStyle = cuff; g.fill();
};

// ---------- the sheet, painted at the insert's size and laid on the mat in the wide shots too ----------
function parchment(R) {
  const W = 1024, H = Math.round(W * SHD / SHW), c = mk(W, H), g = c.getContext('2d');
  g.beginPath(); // a deckled edge
  const pts = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 24; j++) { const f = j / 24, e = (R() - .5) * 7; pts.push(i === 0 ? [f * W, 6 + e] : i === 1 ? [W - 6 + e, f * H] : i === 2 ? [W - f * W, H - 6 + e] : [6 + e, H - f * H]); }
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  const q = g.createLinearGradient(0, 0, W, H); q.addColorStop(0, '#e6d5ae'); q.addColorStop(.5, '#eadbb8'); q.addColorStop(1, '#d8c294');
  g.fillStyle = q; g.fill(); g.save(); g.clip();
  for (let i = 0; i < 26; i++) { const x = R() * W, y = R() * H, r = 30 + R() * 160, s = g.createRadialGradient(x, y, 0, x, y, r); s.addColorStop(0, `rgba(150,110,60,${.03 + R() * .05})`); s.addColorStop(1, 'rgba(150,110,60,0)'); g.fillStyle = s; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .35; g.fillStyle = g.createPattern(grainTile(), 'repeat'); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.strokeStyle = 'rgba(120,90,50,.06)'; g.lineWidth = 1; for (let i = 0; i < 160; i++) { const x = R() * W, y = R() * H, a = R() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
  const e = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) * .56); e.addColorStop(0, 'rgba(110,70,30,0)'); e.addColorStop(1, 'rgba(110,70,30,.32)'); g.fillStyle = e; g.fillRect(0, 0, W, H);
  g.restore();
  return c;
}
// a palm-leaf mat, woven in a two-over-two twill
function matTile(R) {
  const N = 256, c = mk(N, N), g = c.getContext('2d'), w = 16;
  g.fillStyle = '#7a5f3c'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < N / w; i++) for (let j = 0; j < N / w; j++) {
    const hor = ((i + j) >> 1) % 2 === 0, x = i * w, y = j * w, q = hor ? g.createLinearGradient(x, y, x, y + w) : g.createLinearGradient(x, y, x + w, y), b = 150 + R() * 30;
    q.addColorStop(0, `rgb(${b - 40},${b - 66},${b - 104})`); q.addColorStop(.45, `rgb(${b + 22},${b - 6},${b - 52})`); q.addColorStop(1, `rgb(${b - 50},${b - 76},${b - 112})`);
    g.fillStyle = q; g.fillRect(x + .5, y + .5, w - 1, w - 1);
  }
  return c;
}
// the words on the sheet at p; also where Ali's pen and the Prophet's sleeve are, in sheet units (0..1 across and down)
function paintSheet(st, p) {
  const g = st.tg, TW = st.tex.width, TH = st.tex.height, fs = TW * .07, xr = TW * .885, y1 = TH * .3, y2 = TH * .52, y3 = TH * .68;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, TW, TH); g.drawImage(st.parch, 0, 0, TW, TH);
  g.font = `${fs}px ${FONT.naskh}`; g.direction = 'rtl'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
  const w = { a: g.measureText(TXT.a).width, b: g.measureText(TXT.b).width, c: g.measureText(TXT.c).width, d: g.measureText(TXT.d).width, sp: g.measureText(' ').width };
  const S = SCHED, ka = seg(p, ...S.a), wa = seg(p, ...S.wa), kb = seg(p, ...S.b), kc = seg(p, ...S.c), wd = seg(p, ...S.wd), kr = seg(p, ...S.rest);
  const tc = w.c + w.sp + w.d, xd = xr - w.c - w.sp; // «رسول الله» ends the line, at its left
  const ink = (a) => `rgba(34,22,12,${a})`;
  // one run of words, shown from the right as far as `rev`, wiped from the right as far as `wipe` (a soft front)
  const run = (txt, x, y, wd0, rev, wipe, smear) => {
    if (rev <= 0) return;
    const left = x - wd0 * rev - (rev >= 1 ? fs : 0), front = x + fs * 1.1 - (wd0 + fs * 2) * wipe;
    if (wipe <= 0) { g.save(); g.beginPath(); g.rect(left, y - fs * 1.6, x + fs - left, fs * 2.4); g.clip(); g.fillStyle = ink(.9); g.fillText(txt, x, y); g.restore(); return; }
    const N = 22, x0 = x - wd0 - fs, x1 = x + fs;
    for (let i = 0; i < N; i++) {
      const a = x0 + (x1 - x0) * i / N, b = x0 + (x1 - x0) * (i + 1) / N, m = (a + b) / 2, al = 1 - smooth(c01((m - front) / (fs * 1.1) + .5));
      if (al < .02 || b < left) continue;
      g.save(); g.beginPath(); g.rect(Math.max(a, left), y - fs * 1.6, b - Math.max(a, left) + .5, fs * 2.4); g.clip(); g.fillStyle = ink(.9 * al); g.fillText(txt, x, y); g.restore();
    }
    if (smear) { // the wet ink drawn along by the cloth: a faint brown stain where the words were
      g.save(); g.beginPath(); g.rect(front, y - fs * 1.6, x1 - front, fs * 2.4); g.clip(); g.filter = `blur(${(fs * .14).toFixed(1)}px)`; g.fillStyle = `rgba(90,60,30,${.16 * smear})`; g.fillText(txt, x - fs * .25, y + fs * .05); g.filter = 'none'; g.restore();
    }
  };
  run(TXT.a, xr, y1, w.a, ka, wa, 1);
  run(TXT.b, xr, y1, w.b, kb, 0);
  run(TXT.c, xr, y2, w.c, c01(kc * tc / w.c), 0);
  run(TXT.d, xd, y2, w.d, c01((kc * tc - w.c - w.sp) / w.d), wd, 1);
  // the rest of the treaty in Ali's hand: unread lines, at the size of a wide shot only
  if (kr > 0) {
    g.strokeStyle = ink(.75); g.lineWidth = fs * .09; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const k = c01(kr * 3 - i), y = y3 + i * fs * 1.25, len = (i === 2 ? .45 : .78) * TW * k; if (k <= 0) continue;
      g.beginPath(); for (let x = 0; x <= len; x += fs * .18) { const X = xr - x, Y = y - Math.abs(Math.sin(x * .19 / fs * 6 + i)) * fs * .35 * (Math.sin(x * .07 / fs * 6 + i * 2) > .3 ? 1.6 : .4); x ? g.lineTo(X, Y) : g.moveTo(X, Y); }
      g.stroke();
    }
    g.lineCap = 'butt';
  }
  // Ali's pen tip: poised, writing at the edge of each run, lifted at the objection, gone when his hand stops
  const U = (x, y) => [x / TW, y / TH];
  const lift = (x, y) => U(x, y - fs * 1.3);
  let ali = null;
  if (p < S.a[0]) ali = lift(xr + fs * .2, y1);
  else if (p < S.a[1]) ali = U(xr - w.a * ka, y1 - fs * .3);
  else if (p < S.wa[0]) ali = lerp(U(xr - w.a, y1 - fs * .3), lift(xr - w.a * .6, y1), smooth(seg(p, S.a[1], S.a[1] + .01)));
  else if (p < S.wa[1]) ali = U(xr + fs * 1.1 - (w.a + fs * 2) * wa, y1 - fs * .1);
  else if (p < S.b[0]) ali = lerp(U(xr - w.a - fs * .3, y1 - fs * .1), U(xr, y1 - fs * .3), smooth(seg(p, S.wa[1], S.b[0])));
  else if (p < S.b[1]) ali = U(xr - w.b * kb, y1 - fs * .3);
  else if (p < S.c[0]) ali = lerp(U(xr - w.b, y1 - fs * .3), U(xr, y2 - fs * .3), smooth(seg(p, S.b[1], S.c[0])));
  else if (p < S.c[1]) ali = U(xr - tc * kc, y2 - fs * .3);
  else if (p < .57) ali = lerp(U(xr - tc, y2 - fs * .3), lift(xr - tc * .5, y2), smooth(seg(p, S.c[1], .57)));
  else if (p >= S.rest[0] && p < S.rest[1]) { const i = Math.min(2, kr * 3 | 0), k = c01(kr * 3 - i); ali = U(xr - (i === 2 ? .45 : .78) * TW * k, y3 + i * fs * 1.25 - fs * .2); }
  st.pen = { ali, wd, front: U(xd + fs * 1.1 - (w.d + fs * 2) * wd, y2 - fs * .15), dR: U(xd + fs * .2, y2 - fs * .2), dL: U(xd - w.d, y2 - fs * .2), objA: U(xr - w.a * .55, y1 + fs * .5), fs: fs / TW };
}

// ---------- the world: one view drawn into one context ----------
function renderWorld(c, W, H, st, p, t, phone) {
  // ----- camera -----
  let [ex, ey, ez, yaw, pitch, pyaw, pback] = camAt(p);
  if (phone) { yaw += pyaw; ex -= Math.sin(yaw * D2R) * pback; ez -= Math.cos(yaw * D2R) * pback; ey += pback * .22; }
  ey = Math.max(ey, hgt(ex, ez) + 1.2);
  const yw = yaw * D2R, pt = pitch * D2R, cp = Math.cos(pt), sp = Math.sin(pt);
  const fw = [Math.sin(yw) * cp, sp, Math.cos(yw) * cp], rt = [Math.cos(yw), 0, -Math.sin(yw)], up = cross(fw, rt);
  const F = phone ? W * 1.3 : Math.min(H * 1.3, W * .98), cx = W / 2, cy = H * (phone ? .62 : .5);
  const E0 = ex, E1 = ey, E2 = ez, [f0, f1, f2] = fw, [r0, , r2] = rt, [u0, u1, u2] = up;
  let PX = 0, PY = 0, PZ = 0;
  const pj = (x, y, z) => { const dx = x - E0, dy = y - E1, dz = z - E2, zc = dx * f0 + dy * f1 + dz * f2; if (zc < .3) return false; const iz = F / zc; PX = cx + (dx * r0 + dz * r2) * iz; PY = cy - (dx * u0 + dy * u1 + dz * u2) * iz; PZ = zc; return true; };
  const dirP = (v) => { const zc = v[0] * f0 + v[1] * f1 + v[2] * f2; if (zc < .05) return false; PX = cx + (v[0] * r0 + v[2] * r2) * F / zc; PY = cy - (v[0] * u0 + v[1] * u1 + v[2] * u2) * F / zc; return true; };
  // ----- light -----
  const [skT, skM, skH, amb, sunC, elev, fogC, fogL, starA] = keyAt(LK, p);
  const se = elev * D2R, sun = [Math.sin(SUN_AZ) * Math.cos(se), Math.sin(se), Math.cos(SUN_AZ) * Math.cos(se)];
  const sunAmt = c01((elev + 1.5) / 9), low = 1 - c01(elev / 20);
  const fogOf = (d) => Math.min(.94, 1 - Math.exp(-d / fogL));
  const hazeAt = (vx, vz) => { const k = Math.max(0, (vx * sun[0] + vz * sun[2]) / (Math.hypot(vx, vz) || 1)) ** 3; return lerp(fogC, lerp(skH, sunC, .35), k * .75 * low); };
  const litOf = (al, k = 1) => [0, 1, 2].map((j) => Math.min(255, al[j] / 255 * (amb[j] * .8 + sunC[j] * sunAmt * .72 * k)));
  const shdOf = (al) => [0, 1, 2].map((j) => al[j] / 255 * amb[j] * .78);
  const sunSide = Math.sign(sun[0] * r0 + sun[2] * r2) || 1;

  // ----- sky: rows of equal elevation, the low sun's glow at the right, thin cloud -----
  const yAt = (e) => cy - F * Math.tan(Math.max(-1.5, Math.min(1.5, e - pt)));
  const yH = yAt(0), yZ = yAt(1.45), span = yH - yZ;
  { const g = c.createLinearGradient(0, yZ, 0, yH), at = (e) => c01((yAt(e) - yZ) / span);
    g.addColorStop(0, rgb(lerp(skT, [4, 6, 14], .3))); g.addColorStop(at(.45), rgb(skT)); g.addColorStop(at(.14), rgb(skM)); g.addColorStop(at(.04), rgb(lerp(skM, skH, .7))); g.addColorStop(1, rgb(skH));
    c.fillStyle = g; c.fillRect(0, 0, W, H); }
  { const sd = [Math.sin(SUN_AZ), Math.max(sun[1], .02), Math.cos(SUN_AZ)];
    if (dirP(sd)) { const g = c.createRadialGradient(PX, PY, 0, PX, PY, F * 1.25), a = .2 + .35 * low; g.addColorStop(0, rgb(sunC, a)); g.addColorStop(.2, rgb(sunC, a * .35)); g.addColorStop(1, rgb(sunC, 0)); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; } }
  st.clouds.forEach(([az, el, wd, ht, k]) => {
    if (!dirP([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)])) return;
    const rw = F * wd, rh = F * ht, toward = Math.max(0, Math.cos(az - SUN_AZ)) ** 2;
    const col = lerp(lerp([226, 222, 214], skM, .35), lerp(sunC, [255, 120, 110], low * .4), (.25 + .6 * toward) * (.4 + .6 * low));
    c.save(); c.translate(PX, PY); c.scale(1, rh / rw); const g = c.createRadialGradient(0, 0, 0, 0, 0, rw); g.addColorStop(0, rgb(col, .34 * k)); g.addColorStop(.6, rgb(col, .14 * k)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(-rw, -rw, rw * 2, rw * 2); c.restore();
  });
  if (starA > .01) {
    c.globalCompositeOperation = 'lighter';
    const bins = [[], [], [], [], [], []], sz = Math.max(1, H / 900);
    for (const s of st.stars) {
      if (!dirP(s) || PX < 0 || PX > W || PY < 0 || PY > H) continue;
      const al = Math.min(1, s[3] * starA * (.7 + .3 * Math.sin(t * 1.3 + s[4] * 7)) * c01(s[1] * 4 - .1));
      if (al > .04) bins[Math.min(5, al * 6 | 0)].push(PX, PY, s[3] > 1.25 ? 2 * sz : sz);
    }
    bins.forEach((b, k) => { if (!b.length) return; c.fillStyle = `rgba(236,230,214,${((k + .5) / 6).toFixed(3)})`; c.beginPath(); for (let i = 0; i < b.length; i += 3) c.rect(b[i], b[i + 1], b[i + 2], b[i + 2]); c.fill(); });
    c.globalCompositeOperation = 'source-over';
  }

  // ----- terrain: depth bands, far to near -----
  const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
  const hf = norm([f0, 0, f2]), hr = [hf[2], 0, -hf[0]];
  const by = (H - cy) / F, dyb = sp - by * cp, dhb = cp + by * sp, gE = hgt(E0, E2);
  const dMin = dyb < -.01 ? Math.max(.7, (E1 - gE) / -dyb * dhb * .45) : 2.5, dMax = 12000;
  for (let i = 0; i < NS; i++) {
    const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
    const zc0 = Math.max(.6, d * cp + Math.max(0, -sp) * (E1 + 40)), fogK = fogOf(d);
    for (let k = 0; k <= NK; k++) {
      const sx = -W * .1 + k * (W * 1.2 / NK), u = (sx - cx) / F * zc0;
      const x = E0 + hf[0] * d + hr[0] * u, z = E2 + hf[2] * d + hr[2] * u, h = hgt(x, z);
      const o = i * (NK + 1) + k;
      if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
      if (k % 2) continue;
      const e = Math.max(.35, d * .004), hx = (hgt(x + e, z) - h) / e, hz = (hgt(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
      const sky = .55 + .45 / nl, al = alb(x, z, h, hx, hz);
      let lr = amb[0] * sky * .72, lg = amb[1] * sky * .72, lb = amb[2] * sky * .72;
      let lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * sunAmt;
      if (lam > 0) { let sh = 1; for (let m = 0, L = 8; m < 4; m++, L *= 2.8) { const q = hgt(x + sun[0] * L, z + sun[2] * L) - (h + .3 + sun[1] * L); if (q > 0) { sh = Math.min(sh, 1 - c01(q / 3)); if (sh <= 0) break; } } lam *= sh; }
      lr += sunC[0] * lam * 1.2; lg += sunC[1] * lam * 1.2; lb += sunC[2] * lam * 1.2;
      const hz2 = hazeAt(x - E0, z - E2), fa = Math.min(.95, fogK * (1 - .2 * c01(h / 400))), n = (i * NC + k / 2) * 3;
      TC[n] = mix(al[0] / 255 * lr, hz2[0], fa); TC[n + 1] = mix(al[1] / 255 * lg, hz2[1], fa); TC[n + 2] = mix(al[2] / 255 * lb, hz2[2], fa);
    }
  }
  terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .14);

  // ----- what stands on the land -----
  const stand = (x, y, z, m) => { if (!pj(x, y + m, z)) return null; const hx = PX, hy = PY; if (!pj(x, y, z) || PZ < 1.1) return null; return { x: PX, y: PY, z: PZ, h: Math.max(2, Math.hypot(PX - hx, PY - hy)), s: F / PZ }; };
  const items = [], shadows = [];
  // a soft shadow laid on the ground away from the sun (drawn before everything that stands)
  const sdx = -sun[0], sdz = -sun[2], sdl = Math.hypot(sdx, sdz) || 1, SL = Math.min(7, 1 / Math.tan(Math.max(.05, se)));
  const shadow = (x, z, hM, wM, a = .32) => { if (sunAmt < .02) return; shadows.push([x, z, hM * SL, wM, a * sunAmt]); };
  const fog = (col, z) => lerp(col, fogC, fogOf(z) * .85);
  const LIT = litOf([246, 240, 226]).map((v, j) => Math.min(255, v + amb[j] * .25)), SHDC = shdOf([232, 234, 240]), HEAD = lerp(shdOf([62, 48, 40]), litOf([62, 48, 40]), .3);
  const pilgrim = (f, sit, mv, ph) => {
    const sv = f.h / 1.75, s = f.s, fz = fogOf(f.z) * .85, lit = lerp(LIT, fogC, fz), shd = lerp(SHDC, fogC, fz), head = lerp(HEAD, fogC, fz);
    if (f.h < 10) { const hh = (sit ? .75 : 1.42) * sv; c.fillStyle = rgb(lerp(shd, lit, .6)); c.fillRect(f.x - s * .22, f.y - hh, Math.max(1, s * .44), hh); c.fillStyle = rgb(head); c.fillRect(f.x - s * .08, f.y - hh - s * .2, Math.max(1, s * .16), s * .2); return; }
    const bob = mv ? Math.abs(Math.sin(ph * Math.PI)) * .03 * sv : 0, sway = mv ? .05 * Math.sin(ph * Math.PI) : Math.sin(t * .8 + ph) * .008;
    if (!sit) { // the bare shins and feet under the hem; walking moves them in turn
      c.fillStyle = rgb(head); const st2 = mv ? Math.sin(ph * Math.PI) * .07 : 0;
      [[-.075, st2], [.075, -st2]].forEach(([u, d]) => { c.beginPath(); c.moveTo(f.x + (u - .035) * s, f.y - bob - .3 * sv); c.lineTo(f.x + (u + d - .03) * s, f.y - (d > 0 ? .03 : 0) * sv); c.lineTo(f.x + (u + d + .05) * s, f.y - (d > 0 ? .03 : 0) * sv); c.lineTo(f.x + (u + .035) * s, f.y - bob - .3 * sv); c.fill(); });
    }
    poly(c, sit ? IHT : IHS, f.x, f.y - bob, s, sv, 1, sway);
    const g = c.createLinearGradient(f.x - sunSide * s * .3, 0, f.x + sunSide * s * .3, 0);
    g.addColorStop(0, rgb(shd)); g.addColorStop(.62, rgb(lerp(shd, lit, .5))); g.addColorStop(1, rgb(lit)); c.fillStyle = g; c.fill();
    if (f.h > 36) { // the rida's edge across the chest, the izar's fold at the waist, a fall of cloth
      const y0 = f.y - bob; c.save(); c.clip(); c.strokeStyle = rgb(lerp(shd, [40, 40, 52], .35), .5); c.lineWidth = Math.max(.6, s * .016); c.beginPath();
      if (sit) { c.moveTo(f.x - .2 * s, y0 - .7 * sv); c.quadraticCurveTo(f.x - .02 * s, y0 - .5 * sv, f.x + .24 * s, y0 - .28 * sv); c.moveTo(f.x - .34 * s, y0 - .2 * sv); c.quadraticCurveTo(f.x, y0 - .3 * sv, f.x + .34 * s, y0 - .2 * sv); }
      else { c.moveTo(f.x - .2 * s, y0 - 1.38 * sv); c.quadraticCurveTo(f.x - .02 * s, y0 - 1.12 * sv, f.x + .22 * s, y0 - .9 * sv); c.moveTo(f.x - .22 * s, y0 - .86 * sv); c.quadraticCurveTo(f.x, y0 - .82 * sv, f.x + .2 * s, y0 - .88 * sv); c.moveTo(f.x - .06 * s, y0 - .8 * sv); c.quadraticCurveTo(f.x - .08 * s, y0 - .5 * sv, f.x - .1 * s, y0 - .27 * sv); }
      c.stroke(); c.restore();
    }
    c.fillStyle = rgb(head); c.beginPath(); c.ellipse(f.x + sway * s * .2, f.y - bob - (sit ? .86 : 1.565) * sv, .088 * s, .11 * sv, 0, 0, TAU); c.fill();
  };
  const CAML = litOf([170, 132, 92]), CAMD = shdOf([120, 92, 66]);
  const camel = (f, kneel, mv, ph, dir, hady) => {
    const sv = f.h / 2.2, s = f.s, fz = fogOf(f.z) * .85, top = lerp(CAML, fogC, fz), bot = lerp(CAMD, fogC, fz);
    if (kneel < 1) { // legs, then the standing body; walking swings the legs in pairs
      c.globalAlpha = 1 - kneel; c.strokeStyle = rgb(lerp(bot, top, .3)); c.lineWidth = Math.max(1, s * .1); c.lineCap = 'round';
      [[-.74, 0], [-.6, Math.PI], [.62, Math.PI], [.78, 0]].forEach(([u, o]) => { const sw = mv ? Math.sin(ph * Math.PI + o) * .2 : 0; c.beginPath(); c.moveTo(f.x + u * dir * s, f.y - 1.1 * sv); c.quadraticCurveTo(f.x + (u + sw * .2) * dir * s, f.y - .55 * sv, f.x + (u + sw) * dir * s, f.y); c.stroke(); });
      c.lineCap = 'butt';
      poly(c, CAMS, f.x, f.y - (mv ? Math.abs(Math.sin(ph * Math.PI)) * .04 * sv : 0), s, sv, dir);
      const g = c.createLinearGradient(0, f.y - 2.2 * sv, 0, f.y - 1 * sv); g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot)); c.fillStyle = g; c.fill();
      if (hady && f.h > 14) { c.fillStyle = 'rgba(170,52,36,.9)'; c.beginPath(); c.ellipse(f.x + .95 * dir * s, f.y - 1.68 * sv, .06 * s, .1 * sv, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(40,28,18,.95)'; c.fillRect(f.x + .92 * dir * s - s * .04, f.y - 1.56 * sv, s * .08, sv * .14); }
      c.globalAlpha = 1;
    }
    if (kneel > 0) {
      c.globalAlpha = kneel; poly(c, CAMK, f.x, f.y, s, sv, dir);
      const g = c.createLinearGradient(0, f.y - 1.6 * sv, 0, f.y); g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot)); c.fillStyle = g; c.fill();
      if (hady && f.h > 14) { c.fillStyle = 'rgba(170,52,36,.9)'; c.beginPath(); c.ellipse(f.x + .98 * dir * s, f.y - 1.05 * sv, .06 * s, .1 * sv, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(40,28,18,.95)'; c.fillRect(f.x + .95 * dir * s - s * .04, f.y - .94 * sv, s * .08, sv * .14); }
      c.globalAlpha = 1;
    }
  };
  const DARK = [30, 24, 22], RIM = lerp(sunC, [255, 200, 150], .3);
  const darkFill = (f, cool = 0) => { const g = c.createLinearGradient(f.x - sunSide * f.s * .4, 0, f.x + sunSide * f.s * .4, 0), fz = fogOf(f.z) * .8; g.addColorStop(0, rgb(lerp(lerp(DARK, [14, 12, 14], cool), fogC, fz))); g.addColorStop(.75, rgb(lerp(DARK, fogC, fz))); g.addColorStop(1, rgb(lerp(lerp(DARK, RIM, .35 * sunAmt + .05), fogC, fz))); return g; };

  // the acacias of the plain
  st.trees.forEach(([x, z, ht, R0, k]) => {
    const f = stand(x, hgt(x, z), z, ht); if (!f || f.x < -R0 * f.s * 2 || f.x > W + R0 * f.s * 2) return;
    shadow(x, z, ht, R0 * 1.3, .26);
    items.push([f.z, () => {
      const fz = fogOf(f.z) * .88, s = f.s, sv = f.h / ht, trunk = lerp([58, 44, 34], fogC, fz), dark = lerp(shdOf([60, 72, 42]), fogC, fz), lit = lerp(litOf([110, 120, 64]), fogC, fz);
      c.strokeStyle = rgb(trunk); c.lineCap = 'round';
      [[0, 1, .1], [-.5, .8, .07], [.55, .85, .07], [.2, .95, .05]].forEach(([u, v, w], j) => { c.lineWidth = Math.max(.8, w * s); c.beginPath(); c.moveTo(f.x + (j ? u * .15 : 0) * s, f.y - (j ? .45 : 0) * sv); c.quadraticCurveTo(f.x + u * .5 * R0 * s, f.y - v * .7 * ht * sv, f.x + u * R0 * .8 * s, f.y - v * ht * sv); c.stroke(); });
      c.lineCap = 'butt';
      const cy2 = f.y - ht * sv, rx = R0 * s, ry = Math.max(2, R0 * .26 * s);
      for (let j = 0; j < 5; j++) { const o = (j - 2) * .38 + Math.sin(k + j) * .1; c.fillStyle = rgb(lerp(dark, lit, .15)); c.beginPath(); c.ellipse(f.x + o * rx, cy2 + Math.abs(o) * ry * .5 + Math.sin(k * 3 + j) * ry * .2, rx * .48, ry * .8, 0, 0, TAU); c.fill(); }
      const g = c.createLinearGradient(0, cy2 - ry, 0, cy2 + ry * .6); g.addColorStop(0, rgb(lit, .9)); g.addColorStop(1, rgb(lit, 0));
      c.fillStyle = g; c.beginPath(); c.ellipse(f.x + sunSide * rx * .12, cy2 - ry * .1, rx * .92, ry * .7, 0, Math.PI, TAU); c.fill();
    }]);
  });
  // smoke from the cooking fires, low in the camp
  if (p < .84) st.fires.forEach(([x, z]) => {
    if (!pj(x, hgt(x, z), z) || PZ > 900) return;
    const zz = PZ;
    items.push([zz, () => {
      c.globalCompositeOperation = 'source-over';
      for (let j = 0; j < 9; j++) {
        const q = (j + (t * .25) % 1) / 9, y = hgt(x, z) + q * 22, xx = x + q * q * 14 + Math.sin(q * 5 + x) * 1.5;
        if (!pj(xx, y, z + q * 4)) continue; const r = (1 + q * 7) * F / PZ, a = .16 * (1 - q) * (1 - fogOf(PZ) * .7) * (1 - c01((p - .78) / .06));
        const col = lerp(lerp([150, 146, 150], sunC, .25), fogC, fogOf(PZ) * .6), g = c.createRadialGradient(PX, PY, 0, PX, PY, r); g.addColorStop(0, rgb(col, a)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(PX - r, PY - r, r * 2, r * 2);
      }
    }]);
  });

  // the camp: the pilgrims, then the camels; at the turn they rise and join the column north behind the Prophet
  const zh = headZ(p), going = p > .79;
  st.pil.forEach((q) => {
    let x = q.x, z = q.z, sit = q.sit, mv = false, ph = q.ph;
    if (going) {
      const sz = zh - 4.5 - (q.k / 3 | 0) * 1.25 + q.jz, sx = PATHX(sz) + ((q.k % 3) - 1) * 1.05 + q.jx, d = Math.abs(q.x - sx);
      const u = c01((sz - (q.z - 2)) / (d * .8 + 6));
      if (u > 0) { x = mix(q.x, sx, smooth(u)); z = mix(q.z, sz, smooth(u)); mv = true; ph = sz / .75; }
      else { const dx = q.x - PATHX(q.z), aside = Math.max(0, 13 - Math.abs(dx)) * smooth(c01((zh + 34 - q.z) / 12)); x += Math.sign(dx || 1) * aside; }
      if (p > q.up) sit = false;
    }
    const f = stand(x, hgt(x, z), z, 1.75); if (!f || f.x < -40 || f.x > W + 40 || f.y < -10) return;
    if (f.z < 70) shadow(x, z, sit ? .9 : 1.7, .45);
    items.push([f.z, () => pilgrim(f, sit, mv, ph)]);
  });
  st.cam.forEach((q) => {
    if (q.hady && p > .45) return; // the sacrificial camels: slaughtered at Hudaybiya when the peace was made
    let x = q.x, z = q.z, mv = false, ph = 0, kneel = q.kneel ? 1 : 0, dir = q.dir;
    if (going) {
      const sz = zh - 8 - q.kc * 5.5, sx = PATHX(sz) + q.side * 2.5, d = Math.abs(q.x - sx), u = c01((sz - (q.z - 3)) / (d * .8 + 8));
      if (u > 0) { x = mix(q.x, sx, smooth(u)); z = mix(q.z, sz, smooth(u)); mv = true; ph = sz / 1.9; kneel = 0; dir = 1; }
      else { const dx = q.x - PATHX(q.z); x += Math.sign(dx || 1) * Math.max(0, 16 - Math.abs(dx)) * smooth(c01((zh + 34 - q.z) / 12)); }
    }
    const f = stand(x, hgt(x, z), z, 2.2); if (!f || f.x < -60 || f.x > W + 60 || f.y < -10) return;
    if (f.z < 70) shadow(x, z, kneel ? 1.3 : 2.1, .9);
    items.push([f.z, () => camel(f, kneel, mv, ph, dir, q.hady)]);
  });

  // ----- the mat, the sheet, the four -----
  const pen = st.pen;
  const sheetW = (u, v) => [SC[0] + SHW - 2 * SHW * u, hgt(SC[0], SC[1]) + .012, SC[1] - SHD + 2 * SHD * v];
  const matSeen = pj(MAT[0], 0, MAT[1]) && PZ < 60;
  if (matSeen) {
    const quad = (cx2, cz2, hw, hd, y0) => [[cx2 + hw, cz2 - hd], [cx2 - hw, cz2 - hd], [cx2 + hw, cz2 + hd]].map(([x, z]) => (pj(x, y0, z) ? [PX, PY] : null));
    const affine = (P, w, h) => [(P[1][0] - P[0][0]) / w, (P[1][1] - P[0][1]) / w, (P[2][0] - P[0][0]) / h, (P[2][1] - P[0][1]) / h, P[0][0], P[0][1]];
    const dpr = st.dpr, light = litOf([255, 255, 255]).map((v) => Math.min(255, v * 1.02));
    // the mat, woven, under the day's light
    const mq = quad(MAT[0], MAT[1], MAT[2], MAT[3], hgt(MAT[0], MAT[1]) + .005);
    if (mq.every(Boolean)) {
      const A = affine(mq, 1, 1);
      c.save(); c.setTransform(A[0] * dpr, A[1] * dpr, A[2] * dpr, A[3] * dpr, A[4] * dpr, A[5] * dpr);
      st.matPat.setTransform(new DOMMatrix().scale(1 / 256 * .16 / MAT[2] * 2, 1 / 256 * .16 / MAT[3] * 2));
      c.fillStyle = st.matPat; c.fillRect(0, 0, 1, 1);
      c.globalCompositeOperation = 'multiply'; c.fillStyle = rgb(light); c.fillRect(0, 0, 1, 1);
      c.globalCompositeOperation = 'source-over'; c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = .006; c.strokeRect(0, 0, 1, 1);
      c.restore();
    }
  }
  // shadows on the ground and the mat
  c.fillStyle = 'rgba(40,30,30,1)';
  shadows.forEach(([x, z, L, w, a]) => {
    const nx = -sdz / sdl * w / 2, nz = sdx / sdl * w / 2, tx = x + sdx / sdl * L, tz = z + sdz / sdl * L, y0 = hgt(x, z) + .02, y1 = hgt(tx, tz) + .02;
    const P = [[x + nx, y0, z + nz], [x - nx, y0, z - nz], [tx - nx * .6, y1, tz - nz * .6], [tx + nx * .6, y1, tz + nz * .6]].map(([X, Y, Z]) => (pj(X, Y, Z) ? [PX, PY] : null));
    if (P.some((q) => !q)) return;
    const g = c.createLinearGradient(P[0][0], P[0][1], (P[2][0] + P[3][0]) / 2, (P[2][1] + P[3][1]) / 2); g.addColorStop(0, `rgba(46,34,40,${a})`); g.addColorStop(1, 'rgba(46,34,40,0)');
    c.fillStyle = g; c.beginPath(); P.forEach(([X, Y], i) => (i ? c.lineTo(X, Y) : c.moveTo(X, Y))); c.closePath(); c.fill();
  });
  if (matSeen) {
    const dpr = st.dpr, light = litOf([255, 255, 255]);
    const P = [sheetW(0, 0), sheetW(1, 0), sheetW(0, 1)].map(([x, y, z]) => (pj(x, y, z) ? [PX, PY] : null));
    if (P.every(Boolean)) {
      const TW = st.tex.width, TH = st.tex.height, A = [(P[1][0] - P[0][0]) / TW, (P[1][1] - P[0][1]) / TW, (P[2][0] - P[0][0]) / TH, (P[2][1] - P[0][1]) / TH, P[0][0], P[0][1]];
      c.save(); c.setTransform(A[0] * dpr, A[1] * dpr, A[2] * dpr, A[3] * dpr, A[4] * dpr, A[5] * dpr);
      c.drawImage(st.tex, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = rgb(light.map((v) => Math.min(255, v * 1.08))); c.globalAlpha = .9; c.fillRect(0, 0, TW, TH);
      c.restore();
    }
    // the inkwell
    if (pj(INK[0], hgt(INK[0], INK[1]) + .07, INK[1])) { const s = F / PZ, X = PX, Y = PY; c.fillStyle = 'rgba(28,22,20,.95)'; c.beginPath(); c.ellipse(X, Y + .035 * s, .05 * s, .03 * s, 0, 0, TAU); c.fill(); c.fillRect(X - .05 * s, Y, .1 * s, .035 * s); c.fillStyle = 'rgba(70,56,48,1)'; c.beginPath(); c.ellipse(X, Y, .05 * s, .018 * s, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(10,8,8,1)'; c.beginPath(); c.ellipse(X, Y, .03 * s, .011 * s, 0, 0, TAU); c.fill(); }
  }
  const scr = (uv) => { const [x, y, z] = sheetW(uv[0], uv[1]); return pj(x, y, z) ? [PX, PY] : null; };
  const amb01 = mix(1, .3, smooth(seg(p, .8, 1)));
  // the Prophet: seated on the mat facing north; his sleeve goes to the sheet to erase the name; at the turn he leads
  if (!going || p < .795) {
    const f = stand(PRO[0], hgt(PRO[0], PRO[1]), PRO[1], 1.82);
    if (f) items.push([f.z, () => {
      const reach = smooth(seg(p, .645, .668)) * (1 - smooth(seg(p, .752, .776)));
      let arms;
      if (reach > 0 && pen) { const w2 = p < .7 ? pen.dR : lerp(pen.dR, pen.dL, c01(pen.wd)); const q = scr(w2); if (q) { const lap = [f.x - f.h * .1, f.y - f.h * .2]; arms = [[(mix(lap[0], q[0], reach) - f.x) / f.h, (mix(lap[1], q[1] - f.h * .02, reach) - f.y) / f.h]]; } }
      Holy.draw(c, { who: 'prophet', pose: 'sit', x: f.x, y: f.y, h: f.h, t, amb: amb01, arms });
    }]);
  }
  if (!going || p < .795) {
    const f = stand(ALI[0], hgt(ALI[0], ALI[1]), ALI[1], 1.8);
    if (f) items.push([f.z, () => {
      let arms; const tip = pen && pen.ali ? scr(pen.ali) : null;
      if (tip && p > .33) { const cuff = [tip[0] + f.h * .05, tip[1] - f.h * .075]; arms = [[(cuff[0] - f.x) / f.h, (cuff[1] - f.y) / f.h]]; }
      Holy.draw(c, { who: 'ali', pose: 'sit', x: f.x, y: f.y, h: f.h, t, amb: amb01, arms });
      if (arms) { const cuff = [f.x + arms[0][0] * f.h, f.y + arms[0][1] * f.h]; c.strokeStyle = 'rgba(150,112,62,1)'; c.lineWidth = Math.max(1, f.h * .006); c.beginPath(); c.moveTo(cuff[0], cuff[1]); c.lineTo(tip[0], tip[1]); c.stroke(); }
    }]);
  }
  // the walk north: the Prophet first, Ali at his side a pace behind
  if (going && p >= .795) {
    [[0, 'prophet', 1.82, 0], [2.2, 'ali', 1.8, -1.1]].forEach(([back, who, m, off]) => {
      const z = Math.max(PRO[1] - back * .3, zh - back), x = PATHX(z) + off * c01((zh - PRO[1]) / 4) + (who === 'ali' ? ALI[0] - PRO[0] : 0) * (1 - c01((zh - PRO[1]) / 4));
      const f = stand(x, hgt(x, z), z, m); if (!f) return;
      if (f.z < 70) shadow(x, z, 1.8, .5);
      const k = smooth(seg(p, .87, .93));
      items.push([f.z, () => { const hd = Holy.draw(c, { who, pose: zh > PRO[1] + .2 ? 'walk' : 'stand', phase: z / 1.3, x: f.x, y: f.y, h: f.h, t, amb: amb01, glow: who === 'prophet' ? Math.min(1, .6 + .5 * k) : undefined }); if (who === 'prophet') st.head = hd; }]);
    });
  }
  // the envoy: riding in, on foot, seated with his back to us, his arm up at the objection; then back toward Mecca
  const ev = envoyAt(p);
  { const q = ev.camel, f = stand(q.x, hgt(q.x, q.z), q.z, 2.2);
    if (f) {
      if (f.z < 90) shadow(q.x, q.z, 2.1, 1.1, .3);
      const dust = q.moving ? 1 : 0;
      items.push([f.z, () => {
        camel(f, q.kneel, q.moving, q.ph, q.dir, false);
        if (ev.mounted) { const sv = f.h / 2.2, s = f.s; poly(c, MAN, f.x - .15 * q.dir * s, f.y - (1.55 - q.kneel * .9) * sv, s * .9, sv * .75, q.dir); c.fillStyle = darkFill(f); c.fill(); }
      }]);
      if (dust) items.push([f.z + .5, () => {
        for (let j = 1; j < 12; j++) {
          const back = j * 2.2, dx = (q.dir > 0 ? .081 : -.051) * back, dz = (q.dir > 0 ? -.997 : .999) * back; // behind it, along the way it came
          if (!pj(q.x + dx, hgt(q.x + dx, q.z + dz) + .4 + j * .12, q.z + dz)) continue;
          const r = (1.4 + j * .55) * F / PZ, a = .2 * (1 - j / 12) * (1 - fogOf(PZ) * .6), col = lerp(lerp(litOf([170, 146, 116]), [120, 100, 84], .3), fogC, fogOf(PZ) * .5);
          const g = c.createRadialGradient(PX, PY, 0, PX, PY, r); g.addColorStop(0, rgb(col, a)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(PX - r, PY - r, r * 2, r * 2);
        }
      }]);
    } }
  if (ev.man) {
    const m = ev.man, f = stand(m.x, hgt(m.x, m.z), m.z, 1.76);
    if (f) {
      if (f.z < 70) shadow(m.x, m.z, m.mode === 'sit' ? .95 : 1.7, .55);
      items.push([f.z - .05, () => {
        const sv = f.h / 1.76, s = f.s;
        if (m.mode === 'walk') { poly(c, (m.ph * 2 | 0) & 1 ? MAN2 : MAN, f.x, f.y - Math.abs(Math.sin(m.ph * Math.PI)) * .03 * sv, s, sv, m.dir, .06 * Math.sin(m.ph * Math.PI)); c.fillStyle = darkFill(f); c.fill(); return; }
        // seated, his back three-quarters to us, facing the Prophet; the arm lifts at each objection
        const obj = Math.max(smooth(seg(p, ...SCHED.o2)) * (1 - smooth(seg(p, SCHED.o2[1] - .012, SCHED.o2[1] + .008))), smooth(seg(p, SCHED.o1[0], SCHED.o1[0] + .01)) * (1 - smooth(seg(p, SCHED.o1[1] - .01, SCHED.o1[1]))));
        const lean = obj * .05;
        poly(c, BACKSIT, f.x, f.y, s, sv, 1, -lean); c.fillStyle = darkFill(f, .4); c.fill();
        c.save(); c.clip(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(.8, s * .012); c.beginPath(); c.moveTo(f.x - .05 * s, f.y - .72 * sv); c.quadraticCurveTo(f.x + .08 * s, f.y - .4 * sv, f.x + .02 * s, f.y); c.moveTo(f.x + .22 * s, f.y - .6 * sv); c.quadraticCurveTo(f.x + .3 * s, f.y - .3 * sv, f.x + .38 * s, f.y); c.stroke(); c.restore();
        c.strokeStyle = rgb(lerp(RIM, [255, 230, 190], .2), .5 * sunAmt + .1); c.lineWidth = Math.max(1, s * .01); c.beginPath(); c.moveTo(f.x + .2 * s, f.y - .74 * sv); c.quadraticCurveTo(f.x + .38 * s, f.y - .5 * sv, f.x + .46 * s, f.y - .06 * sv); c.stroke();
        // the head, wrapped, the cloth's tail down the back; no face is seen from here
        const hx = f.x - .02 * s + lean * s, hy = f.y - .93 * sv;
        c.fillStyle = rgb([38, 30, 26]); c.beginPath(); c.moveTo(hx - .1 * s, hy); c.quadraticCurveTo(hx - .14 * s, hy + .2 * sv, hx - .08 * s, hy + .26 * sv); c.lineTo(hx + .1 * s, hy + .2 * sv); c.closePath(); c.fill();
        c.fillStyle = darkFill({ x: hx, s: s * .4, z: f.z }); c.beginPath(); c.ellipse(hx, hy, .115 * s, .13 * sv, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = Math.max(.8, s * .01); for (let j = 0; j < 3; j++) { c.beginPath(); c.ellipse(hx, hy - (.06 - j * .045) * sv, .108 * s, .04 * sv, .1, .3, Math.PI - .3); c.stroke(); }
        if (obj > .01) { // the forearm raised in protest: elbow out at his side, the wide cloak sleeve falling back from it
          const sx = f.x + .26 * s, sy = f.y - .66 * sv, ex = f.x + mix(.3, .44, obj) * s, ey = f.y - mix(.38, .5, obj) * sv;
          const hx = f.x + mix(.34, .56 + .02 * Math.sin(t * 2.6), obj) * s, hy = f.y - mix(.4, .98 + .02 * Math.sin(t * 3.1), obj) * sv, col = rgb([46, 36, 32]);
          sleeveOf(c, sx, sy, ex, ey, .13 * s, col, col);
          const dx = hx - ex, dy = hy - ey, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w0 = .065 * s, w1 = .095 * s;
          c.beginPath(); c.moveTo(ex + nx * w0, ey + ny * w0); c.quadraticCurveTo(mix(ex, hx, .6) + nx * w1 * 1.1, mix(ey, hy, .6) + ny * w1 * 1.1, hx + nx * w1, hy + ny * w1); c.lineTo(hx - nx * w1 * .6, hy - ny * w1 * .6 + .04 * sv); c.quadraticCurveTo(mix(ex, hx, .5) - nx * w0, mix(ey, hy, .5) - ny * w0, ex - nx * w0, ey - ny * w0); c.closePath();
          c.fillStyle = col; c.fill(); c.strokeStyle = rgb(RIM, .4 * sunAmt + .05); c.lineWidth = Math.max(1, s * .008); c.stroke();
          c.fillStyle = 'rgba(14,10,8,.9)'; c.beginPath(); c.ellipse(mix(hx + nx * w1, hx - nx * w1 * .6, .5), mix(hy + ny * w1, hy - ny * w1 * .6, .5) + .02 * sv, w1 * .55, w1 * .2, Math.atan2(ny, nx), 0, TAU); c.fill();
        }
      }]);
    }
  }
  items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());

  // ----- the light that comes down on him on the way home (al-Fath 1) -----
  const rev = smooth(seg(p, .87, .95));
  if (rev > 0 && going && st.head) {
    const hd = st.head, x = hd.x, y = hd.y, R0 = hd.r * 9, a = rev * (.75 + .25 * Math.sin(t * .7));
    c.globalCompositeOperation = 'lighter';
    c.save(); c.filter = `blur(${(hd.r * 1.6).toFixed(1)}px)`; c.beginPath(); c.moveTo(x - hd.r * 2, y); c.lineTo(x + hd.r * 2, y); c.lineTo(x + R0 * 1.6, 0); c.lineTo(x - R0 * 1.6, 0); c.closePath();
    const v = c.createLinearGradient(0, 0, 0, y); v.addColorStop(0, `rgba(255,220,160,${.12 * a})`); v.addColorStop(1, `rgba(255,214,140,${.42 * a})`); c.fillStyle = v; c.fill(); c.filter = 'none'; c.restore();
    const gl = c.createRadialGradient(x, y, 0, x, y, hd.r * 14); gl.addColorStop(0, `rgba(255,220,150,${.4 * a})`); gl.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = gl; c.fillRect(x - hd.r * 14, y - hd.r * 14, hd.r * 28, hd.r * 28);
    c.fillStyle = 'rgba(255,230,180,1)';
    for (let i = 0; i < 40; i++) { const q = ((i * .618 + t * .03) % 1), mx = x + Math.sin(i * 12.9) * R0 * (.3 + q * 1.2), my = y * q; c.globalAlpha = a * .5 * Math.sin(q * Math.PI); c.fillRect(mx, my, 1.5, 1.5); }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
  st.head = null;
  const vg = c.createRadialGradient(W * .45, H * .55, Math.min(W, H) * .3, W * .45, H * .55, Math.hypot(W, H) * .62);
  vg.addColorStop(0, 'rgba(8,6,10,0)'); vg.addColorStop(1, `rgba(8,6,10,${(.3 + .3 * c01((p - .8) / .2)).toFixed(3)})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}

// ---------- the inserts: straight down on the sheet on the mat, the sleeves coming in over it ----------
function insLayout(W, H, phone, p, a) {
  const z = 1 + .035 * seg(p, a, a + .15);
  return phone ? { Cx: W * .5, Cy: H * .72, SW: W * .94 * z, rot: -.025 } : { Cx: W * .35, Cy: H * .52, SW: Math.min(W * .6, H * 1.1) * z, rot: -.035 };
}
function renderInsert(c, W, H, st, p, t, phone, shot) {
  const L = insLayout(W, H, phone, p, shot.a), SW = L.SW, SH = SW * SHD / SHW, cr = Math.cos(L.rot), sr = Math.sin(L.rot);
  const at = ([u, v]) => { const x = (u - .5) * SW, y = (v - .5) * SH; return [L.Cx + x * cr - y * sr, L.Cy + x * sr + y * cr]; };
  const [, , , amb, sunC, elev] = keyAt(LK, p), sunAmt = c01((elev + 1.5) / 9);
  // the mat
  c.save(); c.translate(L.Cx, L.Cy); c.rotate(L.rot);
  st.matPat.setTransform(new DOMMatrix().scale(SW / 760 * .55));
  c.fillStyle = st.matPat; c.fillRect(-W * 1.5, -H * 1.5, W * 3, H * 3);
  // the sheet: a soft shadow under it, the paper, the words
  c.fillStyle = 'rgba(30,18,8,.5)'; c.filter = `blur(${(SW * .012).toFixed(1)}px)`; c.fillRect(-SW / 2 - SW * .018, -SH / 2 + SW * .012, SW, SH); c.filter = 'none';
  c.drawImage(st.tex, -SW / 2, -SH / 2, SW, SH);
  // the inkwell at the sheet's corner
  { const x = SW * .56, y = -SH * .36, r = SW * .045; c.fillStyle = 'rgba(20,12,8,.45)'; c.beginPath(); c.ellipse(x - r * .5, y + r * .3, r * 1.15, r * 1.05, 0, 0, TAU); c.fill(); const g = c.createRadialGradient(x + r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#5a4a40'); g.addColorStop(1, '#1a1412'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#060404'; c.beginPath(); c.arc(x, y, r * .55, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,240,210,.35)'; c.lineWidth = r * .08; c.beginPath(); c.arc(x, y, r * .78, -2.4, -1.2); c.stroke(); }
  c.restore();
  // the sleeves, on their own layer so they can cast a shadow on the paper
  const lay = st.lay, g = st.lg, dpr = st.dpr;
  if (lay.width !== c.canvas.width || lay.height !== c.canvas.height) { lay.width = c.canvas.width; lay.height = c.canvas.height; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, lay.width, lay.height); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const hh = SW * 1.55, pen = st.pen, fsPx = pen.fs * SW;
  // Ali, from the top right (his seat is south-west of the sheet): the reed pen at the writing, or resting at the edge
  const sleeves = [];
  if (pen.ali) { const tip = at(pen.ali), x = L.Cx + SW * .72 + hh * .131, y = -hh * .03;
    const cuff = [tip[0] + fsPx * 1.25, tip[1] - fsPx * 1.55];
    Holy.draw(g, { who: 'ali', pose: 'sit', x, y, h: hh, t, amb: 1, glow: 0, arms: [[(cuff[0] - x) / hh, (cuff[1] - y) / hh]] });
    sleeves.push([x - hh * .131, y - hh * .337, cuff[0], cuff[1]]);
    { g.lineCap = 'round'; g.strokeStyle = '#8c6a3a'; g.lineWidth = fsPx * .16; g.beginPath(); g.moveTo(cuff[0] + fsPx * .1, cuff[1] - fsPx * .15); g.lineTo(tip[0], tip[1]); g.stroke(); g.strokeStyle = '#a98a52'; g.lineWidth = fsPx * .05; g.beginPath(); g.moveTo(cuff[0], cuff[1] - fsPx * .2); g.lineTo(mix(cuff[0], tip[0], .8), mix(cuff[1], tip[1], .8) - fsPx * .03); g.stroke(); g.fillStyle = '#1c120a'; g.beginPath(); g.arc(tip[0], tip[1], fsPx * .07, 0, TAU); g.fill(); g.lineCap = 'butt'; } }
  // the envoy's arm, from the bottom left (his seat, across the sheet), up at the first objection
  { const k = smooth(seg(p, SCHED.o1[0], SCHED.o1[0] + .011)) * (1 - smooth(seg(p, SCHED.o1[1] - .01, SCHED.o1[1])));
    if (k > .01) { // a short wide cloak sleeve rising at a slant from the near edge, its open end toward the words
      const tg = at(pen.objA), bx = L.Cx - SW * .5, by = H + SW * .06, hx = mix(bx + SW * .04, mix(bx, tg[0], .55), k), hy = mix(H + SW * .02, mix(by, tg[1] + fsPx * 2.6, .75), k) + Math.sin(t * 2.4) * fsPx * .12 * k;
      const dx = hx - bx, dy = hy - by, Ls = Math.hypot(dx, dy) || 1, nx = -dy / Ls, ny = dx / Ls, w0 = SW * .055, w1 = SW * .085;
      g.beginPath(); g.moveTo(bx + nx * w0, by + ny * w0); g.quadraticCurveTo(mix(bx, hx, .6) + nx * w1 * 1.05, mix(by, hy, .6) + ny * w1 * 1.05, hx + nx * w1, hy + ny * w1);
      g.quadraticCurveTo(hx + dx / Ls * w1 * .25, hy + dy / Ls * w1 * .25, hx - nx * w1 * .7, hy - ny * w1 * .7); g.quadraticCurveTo(mix(bx, hx, .5) - nx * w0, mix(by, hy, .5) - ny * w0, bx - nx * w0, by - ny * w0); g.closePath();
      const q = g.createLinearGradient(bx - nx * w1, by - ny * w1, bx + nx * w1, by + ny * w1); q.addColorStop(0, '#1c1512'); q.addColorStop(1, '#3a2e28'); g.fillStyle = q; g.fill();
      g.strokeStyle = 'rgba(255,214,170,.22)'; g.lineWidth = SW * .003; g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = SW * .004; for (let j = 1; j < 4; j++) { const m = 1 - j * .2; g.beginPath(); g.moveTo(mix(bx, hx, m) + nx * w1 * .9, mix(by, hy, m) + ny * w1 * .9); g.quadraticCurveTo(mix(bx, hx, m - .06), mix(by, hy, m - .06), mix(bx, hx, m) - nx * w1 * .5, mix(by, hy, m) - ny * w1 * .5); g.stroke(); }
      g.fillStyle = 'rgba(10,7,6,.92)'; g.beginPath(); g.ellipse(hx + nx * w1 * .15, hy + ny * w1 * .15, w1 * .7, w1 * .2, Math.atan2(ny, nx), 0, TAU); g.fill(); } }
  // the Prophet, from the top left: down onto «رسول الله», across it from the right, and away
  { const inK = smooth(seg(p, .675, .697)), outK = smooth(seg(p, .735, .755));
    if (inK > 0 && outK < 1) {
      const R0 = at(pen.dR), Lf = at(pen.dL), front = pen.wd > 0 ? at(pen.front) : R0, cuffAt = [Math.min(R0[0], Math.max(Lf[0], front[0])), mix(R0[1], Lf[1], .5) + fsPx * .1];
      const from = [R0[0] - SW * .25, -SW * .12], away = [Lf[0] - SW * .3, -SW * .1];
      const cuff = outK > 0 ? lerp(cuffAt, away, outK) : lerp(from, cuffAt, inK);
      const x = L.Cx - SW * .78 - hh * .131, y = -hh * .03;
      Holy.draw(g, { who: 'prophet', pose: 'sit', x, y, h: hh, t, amb: 1, glow: 0, arms: [[(cuff[0] - x) / hh, (cuff[1] - y) / hh]] });
      sleeves.push([x + hh * .131, y - hh * .337, cuff[0], cuff[1]]);
    } }
  // the sleeves' cloth takes the light from the right, darker at the left
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  { const q = g.createLinearGradient(0, 0, lay.width, lay.height * .3); q.addColorStop(0, 'rgba(0,0,0,.34)'); q.addColorStop(.5, 'rgba(0,0,0,.08)'); q.addColorStop(1, 'rgba(255,220,170,.16)'); g.fillStyle = q; g.fillRect(0, 0, lay.width, lay.height); }
  // over each sleeve (only where it is): a sheen along the lit edge, the cloth bunched toward the cuff, the cuff in shade
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  sleeves.forEach(([sx, sy, ex, ey]) => {
    const w = hh * .0864, dx = ex - sx, dy = ey - sy, Ls = Math.hypot(dx, dy) || 1, ux = dx / Ls, uy = dy / Ls, nx = -uy, ny = ux, side = nx > 0 ? 1 : -1;
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,236,200,.2)'; g.lineWidth = w * .14; g.beginPath(); g.moveTo(sx + nx * side * w * .28, sy + ny * side * w * .28); g.lineTo(ex - ux * w * .5 + nx * side * w * .22, ey - uy * w * .5 + ny * side * w * .22); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.26)'; g.lineWidth = w * .05;
    for (let i = 0; i < 4; i++) { const d = w * (.9 + i * .55 + (i % 2) * .2), mx = ex - ux * d, my = ey - uy * d; g.beginPath(); g.moveTo(mx + nx * w * .55, my + ny * w * .55); g.quadraticCurveTo(mx - ux * w * .3, my - uy * w * .3, mx - nx * w * (.2 + .15 * (i % 2)), my - ny * w * (.2 + .15 * (i % 2))); g.stroke(); }
    const q = g.createRadialGradient(ex, ey, w * .05, ex, ey, w * .4); q.addColorStop(0, 'rgba(90,70,50,.18)'); q.addColorStop(1, 'rgba(60,40,24,.45)'); g.fillStyle = q; g.beginPath(); g.arc(ex, ey, w * .42, 0, TAU); g.fill();
    g.lineCap = 'butt';
  });
  g.globalCompositeOperation = 'source-over';
  // light: a shadow of the sleeves on the paper, cast away from the low sun at the right
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = .38 * (.4 + .6 * sunAmt); c.filter = `brightness(0) blur(${(SW * .012 * dpr).toFixed(1)}px)`; c.drawImage(lay, -SW * .03 * dpr, SW * .018 * dpr); c.filter = 'none'; c.globalAlpha = 1;
  c.drawImage(lay, 0, 0); c.restore();
  // the warm light from the west (the right), the shade to the east; a vignette
  const w = c.createLinearGradient(0, 0, W, 0); w.addColorStop(0, `rgba(20,14,22,${.38 - .1 * sunAmt})`); w.addColorStop(.6, 'rgba(20,14,22,0)'); w.addColorStop(1, rgb(sunC, .1 * sunAmt));
  c.fillStyle = w; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = rgb([0, 1, 2].map((j) => Math.min(255, 140 + amb[j] * .5 + sunC[j] * sunAmt * .1))); c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  const vg = c.createRadialGradient(L.Cx, L.Cy, SW * .4, L.Cx, L.Cy, Math.hypot(W, H) * .7); vg.addColorStop(0, 'rgba(8,5,4,0)'); vg.addColorStop(1, 'rgba(8,5,4,.62)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}

const SHOTS = [
  { k: 'w', a: -.06, b: .44 }, { k: 'i', a: .42, b: .575 }, { k: 'w', a: .555, b: .675 }, { k: 'i', a: .655, b: .77 }, { k: 'w', a: .75, b: 1.06 },
];

S.hudaybiya = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.alt = mk(1, 1); st.ac = st.alt.getContext('2d');
    st.lay = mk(1, 1); st.lg = st.lay.getContext('2d');
    st.tex = mk(1, 1); st.tg = st.tex.getContext('2d');
    const R = rng(628);
    st.parch = parchment(R); st.matPat = st.c.createPattern(matTile(R), 'repeat');
    if (document.fonts && document.fonts.load) document.fonts.load(`40px ${FONT.naskh}`).catch(() => {});
    st.NS = 72; st.NK = 88;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.stars = Array.from({ length: 1800 }, () => { const az = R() * TAU, e = Math.asin(R() * .98); return [Math.sin(az) * Math.cos(e), Math.sin(e), Math.cos(az) * Math.cos(e), .22 + R() ** 3 * 1.6, R() * 9]; });
    st.clouds = Array.from({ length: 16 }, () => [(150 + R() * 140) * D2R, (3 + R() ** 1.5 * 13) * D2R, .16 + R() * .3, .012 + R() * .02, .5 + R() * .5]);
    // the camp: groups of pilgrims, seated and standing, between the mat and the north; camels kneel in their herds
    st.pil = [];
    const near = (x, z) => Math.abs(x - PATHX(z)) < 3.2 || (z < 16 && Math.abs(x) < 12);
    for (let i = 0; i < 36; i++) {
      const gx = (R() - .5) * 260, gz = 14 + R() ** 1.3 * 240, n = 8 + R() * 16 | 0;
      for (let j = 0; j < n; j++) { const a = R() * TAU, rr = Math.sqrt(R()) * (2.5 + n * .32), x = gx + Math.cos(a) * rr, z = gz + Math.sin(a) * rr * .7; if (near(x, z)) continue; st.pil.push({ x, z, sit: R() < .6, ph: R() * 9, up: .795 + R() * .05 }); }
    }
    // the companions standing round the mat, and some seated watching
    [[-2.6, -3.4], [2.3, -4.2], [3.8, -2.2], [-4.2, -1.6], [.9, -5.6], [-1.3, -6.2]].forEach(([x, z]) => st.pil.push({ x, z, sit: false, ph: R() * 9, up: 0 }));
    for (let j = 0; j < 11; j++) st.pil.push({ x: -9 + (R() - .5) * 6, z: -5 + (R() - .5) * 5, sit: true, ph: R() * 9, up: .8 + R() * .03 });
    st.pil.sort((a, b) => a.z - b.z).forEach((q, k) => { q.k = k; q.jx = (R() - .5) * .4; q.jz = (R() - .5) * .5; });
    st.cam = []; let kc = 0;
    for (let i = 0; i < 13; i++) { // herds where the opening shot sees them
      const gz = 22 + R() * 150, gx = (R() - .5) * (190 - gz) * .9, n = 4 + R() * 7 | 0, hady = i % 3 !== 2;
      for (let j = 0; j < n; j++) { const x = gx + (R() - .5) * 14, z = gz + (R() - .5) * 9; if (near(x, z)) continue; st.cam.push({ x, z, kneel: R() < .7, dir: R() < .5 ? -1 : 1, hady, side: R() < .5 ? -1 : 1 }); }
    }
    st.cam.sort((a, b) => a.z - b.z).forEach((q) => { if (!q.hady) q.kc = kc++; });
    st.fires = [[-30, 60], [42, 96], [-70, 130], [14, 150]];
    // acacias on the plain, kept off the camp's middle and the way north
    st.trees = [];
    for (let i = 0; i < 400 && st.trees.length < 70; i++) {
      const a = R() * TAU, rr = 25 + R() ** .8 * 900, x = Math.cos(a) * rr, z = Math.sin(a) * rr * .8 - 120;
      if (Math.abs(x - PATHX(z)) < 12 || (Math.abs(x) < 9 && z > -16 && z < 16) || (z > 0 && z < 260 && Math.abs(x) < 150 && R() < .7)) continue;
      st.trees.push([x, z, 3 + R() * 2.4, 2.4 + R() * 2.2, R() * 9]);
    }
    st.trees.push([-15, -22, 4.4, 3.8, 2]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = st.dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    // the sheet's texture at the insert's size, painted for this p (wide and insert shots share it)
    const SWi = insLayout(W, H, phone, 0, 0).SW * 1.05, TW = Math.max(400, Math.min(2000, Math.round(SWi * dpr))), TH = Math.round(TW * SHD / SHW);
    if (st.tex.width !== TW || st.tex.height !== TH) { st.tex.width = TW; st.tex.height = TH; st.texKey = ''; }
    const pk = Math.min(.88, Math.max(.43, p)), key = `${pk}|${document.fonts ? document.fonts.check(`40px ${FONT.naskh}`) : 1}`; // the sheet only changes in .437–.87
    if (st.texKey !== key) { paintSheet(st, pk); st.texKey = key; }
    const on = SHOTS.filter((s) => p >= s.a && p <= s.b);
    if (!on.length) on.push(p < 0 ? SHOTS[0] : SHOTS[4]);
    const draw = (g, s) => { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; s.k === 'w' ? renderWorld(g, W, H, st, p, t, phone) : renderInsert(g, W, H, st, p, t, phone, s); };
    draw(c, on[0]);
    if (on.length > 1) {
      const a = st.alt, g = st.ac;
      if (a.width !== cv.width || a.height !== cv.height) { a.width = cv.width; a.height = cv.height; }
      draw(g, on[1]);
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = smooth(seg(p, on[1].a, on[0].b)); c.drawImage(a, 0, 0); c.globalAlpha = 1;
    }
  },
};
})();
