(() => {
// uhud: the foot of Mount Uhud, Shawwal 3 AH, from morning to nightfall, told around the Prophet ﷺ. A pinhole camera
// over a small world in metres: x to the east, y up, z to the north (toward the mountain). He sets fifty archers on the
// small hill and tells them not to leave it (al-Irshad 1:80); they leave it, the horse comes round behind, the people
// flee up the mountain, and he stands and calls them back (Tafsir al-Qummi 1:114). They mass on him with swords,
// spears, arrows and stones; he goes down and faints, opens his eyes and sends Ali at them (al-Irshad 1:82). He gives
// Ali Dhul-Fiqar (al-Qummi 1:116), points him at each band that comes, and at dusk draws back to the side of the
// mountain and stands. Terrain is a heightfield drawn as camera-facing depth bands (terrainRaster in core.js). People
// are faceless silhouettes; the Prophet and Ali are veiled figures with a gold disc behind the head (scenes/holy.js);
// no face is ever drawn, and the wound is shown only as the blow and the fall, never on the figure.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };

// ---------- the land: the long dark mountain, its gullies, the small hill, the plain ----------
const HILL = [170, 470, 74, 44, 15]; // the archers' hill: centre x, z, radii, height
const ridgeZ = (x) => 1080 + 120 * Math.sin(x * .0021 + .5) + 60 * Math.sin(x * .0057 + 2);
const rr = (v, e) => 1 + e - Math.sqrt(Math.sin(v) ** 2 + e * e); // a ridge: 1 on rounded crests (width e), about e in the hollows
function mountain(x, z) {
  mountain.g = 1; mountain.v = 0; // the last call's ravine factor and height, for the shading
  if (z < 440) return 0; // the lowest foot of the mountain: the plain needs no trig
  const zr = ridgeZ(x), foot = zr - 460, k = (z - foot) / 460;
  if (k <= 0) return 0;
  const w = x + 80 * Math.sin(x * .0037 + z * .0021); // the crest wanders
  const top = 207 + 72 * Math.sin(x * .0026 + 1) + 34 * Math.sin(x * .0071 + 2) * Math.sin(x * .0017) + 26 * rr(w * .0061 + Math.sin(x * .0023) * 2.4, .3) + 12 * rr(w * .0143 + Math.sin(w * .0051) * 1.3 + 3, .35) + 5 * rr(w * .037 + 1, .4);
  const s = smooth(Math.min(k, 1)), prof = k < 1 ? s * Math.sqrt(s) : 1 - .45 * smooth(c01((k - 1) / 1.6));
  const ph = x * .021 + 3 * Math.sin(x * .0043 + 1) + Math.sin(z * .012 + x * .002) * 1.7;
  const gul = .6 * rr(ph, .3) + .25 * rr(ph * 2.3 + z * .009, .45) + .15 * rr(ph * 5.1 + z * .03, .5); mountain.g = gul;
  const fh = 26 * smooth(c01(k / .35)) * (1 - smooth(c01((k - .35) / .4))) * (.5 + .5 * Math.sin(x * .013 + 2)); // foothills
  const knobs = 7 * Math.sin(x * .05 + z * .031) * Math.sin(z * .043 - x * .02) * s; // granite knobs and tors
  return mountain.v = top * prof * (1 - .26 * (1 - gul) * smooth(c01(k * 1.4)) * (1 - smooth(c01((k - .95) / .35)))) + fh + knobs;
}
function height(x, z) {
  let h = .5 * Math.sin(x * .021 + z * .013) * Math.sin(z * .017 - x * .008) + .6 * Math.sin(x * .061 + z * .047 + 2.2 * Math.sin(z * .011 + x * .004)) + mountain(x, z); // the plain's long low swells
  const dx = (x - HILL[0]) / HILL[2], dz = (z - HILL[1]) / HILL[3], r2 = dx * dx + dz * dz;
  if (r2 < 1) h += HILL[4] * (1 - r2) ** 1.6;
  return h;
}
const K = [22, 396]; // where he stood when the line broke
const P0 = [10, 524]; // before his ranks in the morning
const GORGE = [-40, 772];
const GSTAND = [GORGE[0] + 6, GORGE[1] - 8]; // «فانحاز رسول الله إلى ناحية أحد، فوقف»

// ---------- the order of the day, in p ----------
const RUSH = [[.555, .59, 0], [.632, .662, 1], [.667, .697, 2], [.702, .735, 3]]; // [start, end, band]: Ali turns each band
const GA = [-.5, -1.1, .3, -1.6]; // the side each band comes from, as an angle around him in the x-z plane
const GIFT = [.598, .626]; // he hands Ali Dhul-Fiqar
const FALL = [.488, .558]; // struck, he goes down; he opens his eyes and rises
const pk = (p) => smooth(seg(p, .13, .22)), pg = (p) => smooth(seg(p, .765, .86));
const prophetAt = (p) => { const k = pk(p), g = pg(p); return [mix(mix(P0[0], K[0], k), GSTAND[0], g), 0, mix(mix(P0[1], K[1], k), GSTAND[1], g)]; };
function aliAt(p) {
  const PR = prophetAt(p), k1 = smooth(seg(p, .3, .355));
  let ang = GA[0], press = 0;
  RUSH.forEach(([a, , g]) => { if (p >= a - .012) ang = GA[g]; });
  for (let j = 1; j < RUSH.length; j++) { const [a] = RUSH[j], k = smooth(seg(p, a - .012, a + .004)); if (k > 0 && k < 1) ang = mix(GA[RUSH[j - 1][2]], GA[RUSH[j][2]], k); }
  RUSH.forEach(([a, b]) => { press = Math.max(press, Math.sin(Math.PI * seg(p, a, b))); });
  const gift = smooth(seg(p, GIFT[0] - .01, GIFT[0])) * (1 - smooth(seg(p, GIFT[1], GIFT[1] + .008))); // close beside him for the sword
  const r = mix(mix(3.2, 4 + 9 * press, smooth(seg(p, .5, .56))), 1.9, gift), front = [-36, mix(512, 392, pk(p))];
  const kr = [PR[0] + Math.cos(ang) * r, PR[2] + Math.sin(ang) * r], g = pg(p);
  return [mix(mix(front[0], kr[0], k1), PR[0] + 1.8, g), 0, mix(mix(front[1], kr[1], k1), PR[2] + 2.6, g), press, ang];
}

// ---------- camera keys: [p, eye, look] or [p, eye, 'P'|'A', sx, sy] (aimed at his feet, or Ali's, in a 1440x900 frame) ----------
const CAM0 = [
  [-.06, [.2, 2.7, 521.6], 'P', .3, .84],
  [.03, [.4, 2.7, 521.8], 'P', .3, .84],
  [.1, [.9, 2.8, 522.2], 'P', .31, .84],
  [.135, [-200, 96, 40], [60, 24, 520]],
  [.2, [104, 52, 330], [168, 6, 452]],
  [.255, [40, 150, 110], [190, 0, 480]],
  [.3, [70, 168, 150], [170, 0, 560]],
  [.33, [12.5, 2.5, 398.8], 'P', .32, .85],
  [.43, [12.2, 2.5, 399], 'P', .33, .85],
  [.475, [10, 3.6, 400], 'P', .3, .84],
  [.5, [15.5, 1.6, 398.2], 'P', .38, .8],
  [.548, [15.3, 1.6, 398.3], 'P', .38, .8],
  [.58, [13, 2.5, 398.6], 'P', .32, .84],
  [.628, [13.2, 2.5, 398.4], 'P', .32, .84],
  [.66, [8, 5.5, 400], 'P', .3, .86],
  [.735, [7.8, 5.6, 400.3], 'P', .3, .86],
  [.765, ['P', -7, 3.2, -7], 'P', .34, .84],
  [.885, ['P', -7, 3.2, -7], 'P', .11, .93],
  [.9, [-25.5, 2.5, 761.5], 'P', .36, .8],
  [1, [-25.6, 2.5, 761.4], 'P', .36, .8],
  [1.06, [-25.65, 2.5, 761.35], 'P', .36, .8],
];
let CAM = null;
const WALK = [.765, .885], WALKO = [-7, 3.2, -7]; // while he draws back toward the mountain the camera walks behind him
function camAt(p) {
  if (p > WALK[0] && p < WALK[1]) { const q = prophetAt(p), eye = [q[0] + WALKO[0], height(q[0], q[2]) + WALKO[1], q[2] + WALKO[2]]; const k = smooth(seg(p, .8, .825)); return { eye, look: aim(eye, [q[0], height(q[0], q[2]), q[2]], mix(.34, .11, k), mix(.84, .93, k)) }; } // under the call, he keeps to the lower left
  let i = 0; while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
  const k = smooth(c01((p - CAM[i][0]) / (CAM[i + 1][0] - CAM[i][0]))); // each move eases in and settles
  return { eye: lerp(CAM[i][1], CAM[i + 1][1], k), look: lerp(CAM[i][2], CAM[i + 1][2], k) };
}
// turn a camera at eye until the point T projects to (sx, sy) of a 1440x900 frame; returns a look point at T's range
function aim(eye, T, sx, sy) {
  const F = 1170, d = sub(T, eye), L = Math.hypot(d[0], d[1], d[2]);
  let yaw = Math.atan2(d[0], d[2]), pit = Math.atan2(d[1], Math.hypot(d[0], d[2]));
  for (let it = 0; it < 30; it++) {
    const fw = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)], rt = norm(cross([0, 1, 0], fw)), up = cross(fw, rt);
    const zc = d[0] * fw[0] + d[1] * fw[1] + d[2] * fw[2], X = 720 + (d[0] * rt[0] + d[2] * rt[2]) * F / zc, Y = 468 - (d[0] * up[0] + d[1] * up[1] + d[2] * up[2]) * F / zc;
    yaw += Math.atan((X - sx * 1440) / F) * .8; pit -= Math.atan((Y - sy * 900) / F) * .8;
  }
  return [eye[0] + Math.sin(yaw) * Math.cos(pit) * L, eye[1] + Math.sin(pit) * L, eye[2] + Math.cos(yaw) * Math.cos(pit) * L];
}
CAM = CAM0.map(([p, eye, T, sx, sy]) => {
  if (eye[0] === 'P') { const q = prophetAt(p); eye = [q[0] + eye[1], height(q[0], q[2]) + eye[2], q[2] + eye[3]]; }
  if (T === 'P' || T === 'A') { const q = T === 'P' ? prophetAt(p) : aliAt(p); return [p, eye, aim(eye, [q[0], height(q[0], q[2]), q[2]], sx, sy)]; }
  return [p, eye, T];
});
// a tall screen: stand a little further off on the wide shots, and swing toward him on his own
function phoneCam(p, eye, look) {
  const PP = prophetAt(p), on = (1 - smooth(seg(p, .115, .135)) * (1 - smooth(seg(p, .3, .325)))), toward = .55 * on, ph = [PP[0], height(PP[0], PP[2]) + 1, PP[2]];
  for (let j = 0; j < 3; j++) look[j] = mix(look[j], ph[j], toward);
  const back = mix(1.3, .7, on); for (let j = 0; j < 3; j++) eye[j] = look[j] + (eye[j] - look[j]) * back;
  const call = smooth(seg(p, .8, .825)) * (1 - smooth(seg(p, .885, .905))); // under the sword and over the call: look below his feet so he rides up the frame
  if (call > 0) { const q = [PP[0], height(PP[0], PP[2]) - 1.3, PP[2]]; for (let j = 0; j < 3; j++) look[j] = mix(look[j], q[j], call); }
}
// ---------- light keys: p, sky top, sky mid, horizon, sun colour, ambient, haze, sun elevation (deg), sun azimuth (rad, from east through south), fog length ----------
const LK = [
  [-.06, [58, 80, 112], [168, 160, 148], [232, 208, 168], [255, 226, 186], [84, 90, 112], [200, 186, 166], 15, .35, 4200],
  [.25, [60, 86, 120], [172, 168, 158], [230, 212, 180], [255, 236, 206], [90, 94, 112], [204, 192, 174], 34, .9, 3800],
  [.4, [66, 90, 122], [178, 172, 160], [230, 214, 186], [255, 238, 210], [98, 100, 114], [206, 192, 172], 50, 1.6, 2600],
  [.66, [58, 70, 100], [184, 152, 128], [240, 192, 146], [255, 206, 150], [88, 86, 102], [206, 166, 136], 20, 2.4, 3200],
  [.76, [32, 34, 60], [130, 80, 78], [240, 136, 84], [255, 150, 90], [58, 54, 76], [170, 106, 86], 2, 2.75, 2600],
  [.82, [12, 16, 34], [40, 36, 58], [112, 62, 56], [255, 120, 80], [26, 28, 46], [36, 28, 38], -4, 2.85, 3000],
  [.9, [6, 9, 20], [16, 20, 38], [40, 38, 58], [255, 120, 80], [30, 34, 58], [16, 16, 26], -12, 2.9, 3200],
  [1.06, [5, 8, 18], [14, 18, 34], [34, 34, 52], [255, 120, 80], [30, 34, 58], [14, 14, 24], -14, 2.9, 3200],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MAN2 = [-.4, 0, -.3, .5, -.21, 1.0, -.26, 1.32, -.2, 1.44, -.1, 1.5, -.14, 1.58, -.13, 1.7, -.04, 1.79, .08, 1.78, .14, 1.68, .12, 1.56, .07, 1.5, .19, 1.44, .25, 1.28, .2, 1.0, .3, .5, .36, 0];
const MANS = [-.3, 0, -.22, 1.3, -.12, 1.5, -.08, 1.76, .08, 1.76, .12, 1.5, .22, 1.3, .3, 0];
const RIMF = [[9, 16], [10, 17]], RIMB = [[1, 8], [1, 9]];
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const RIDER = [-.24, 1.48, -.22, 1.95, -.14, 2.12, -.13, 2.26, -.06, 2.37, .05, 2.37, .11, 2.26, .12, 2.12, .2, 1.95, .24, 1.48];
const KNEEL = [-1.1, 0, -1.08, .55, -.8, .85, -.35, 1.18, .05, 1.12, .4, .86, .75, .78, 1.0, 1.05, 1.15, 1.4, 1.38, 1.48, 1.48, 1.4, 1.36, 1.3, 1.18, 1.0, 1.0, .55, .95, .3, 1.05, 0];
const TENT = [-3.4, 0, -3.1, 1.05, -1.8, 1.7, 0, 1.92, 1.8, 1.7, 3.1, 1.05, 3.4, 0];
const poly = (pa, sh, bx, by, s, sv, dir, rot = 0, lean = 0) => {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < sh.length; i += 2) {
    const u = (sh[i] + lean * sh[i + 1]) * dir, v = sh[i + 1], X = bx + (u * cr + v * sr * dir) * s, Y = by - (v * cr - u * sr * dir) * sv;
    i ? pa.lineTo(X, Y) : pa.moveTo(X, Y);
  }
  pa.closePath();
};
// the horse's way round the hill into the Muslims' rear
const SWEEP = [[300, 300], [372, 410], [384, 540], [320, 640], [190, 676], [90, 640], [40, 560], [30, 500]];
const sweepAt = (u) => crv(SWEEP, c01(u) * (SWEEP.length - 1));
// Dhul-Fiqar, the same outline as the sword in the sky (scenes/uhud.html) and in holy.js, for the moment he hands it over
const ZF = typeof Path2D === 'function' ? {
  blade: new Path2D('M912 166 C 770 222, 520 252, 340 220 C 270 206, 205 160, 170 100 C 200 150, 250 210, 300 245 C 220 220, 110 170, 40 124 C 120 196, 300 292, 520 298 C 700 302, 852 254, 936 212 Z'),
  grip: new Path2D('M948 162 C 1010 142, 1068 118, 1108 104 C 1134 95, 1160 108, 1158 132 C 1156 152, 1138 162, 1122 153 C 1078 166, 1020 186, 962 202 Z'),
} : null;

S.uhud = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.tag = el.querySelector('.uh-tag');
    st.bloom = mk(8, 8); st.bc = st.bloom.getContext('2d');
    st.puff = sprite([[0, 'rgba(226,200,160,.85)'], [.45, 'rgba(212,186,148,.38)'], [1, 'rgba(204,178,140,0)']]);
    st.puffD = sprite([[0, 'rgba(112,96,82,.8)'], [.5, 'rgba(112,96,82,.35)'], [1, 'rgba(112,96,82,0)']]);
    st.glow = sprite([[0, 'rgba(255,255,255,1)'], [.16, 'rgba(255,255,255,.55)'], [.42, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']], 128);
    st.tints = {};
    const R = rng(625);
    const gs = () => (R() + R() + R() - 1.5) / 1.5;
    st.NS = 66; st.NK = 84;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.ridges = [0, 1].map((L) => { const a = []; let h = .02; for (let i = 0; i <= 360; i++) { h = mix(h, (L ? .02 : .032) + .02 * Math.sin(i * .05 + L * 2) ** 2 + R() * .01, .12); a.push(h); } return a; });
    st.stars = Array.from({ length: 360 }, () => [R() * TAU, .03 + R() ** .8 * 1.2, R()]);
    st.clouds = Array.from({ length: 14 }, () => [-1.4 + R() * 3.2, .12 + R() * .3, .5 + R() * 1.2, .02 + R() * .03, .2 + R() * .4]);
    st.marks = Array.from({ length: 2400 }, () => [(R() - .5) * 900, -200 + R() * 900, R(), R()]);
    st.rocks = []; for (let i = 0; i < 260; i++) { const x = (R() - .5) * 1400, z = -300 + R() * 1000; if (Math.abs(x) < 360 && z > -60 && z < 640) continue; st.rocks.push([x, z, .4 + R() * 1.4, R(), height(x, z)]); }
    for (let x0 = -1500; x0 < 1500; x0 += 26 + R() * 30); // the draws the old gully strokes took: the people keep their places
    // ---- the people ----
    const F = [], add = (o) => { o.hs = o.hs || .92 + R() * .16; F.push(o); return o; };
    // Muslims: seven hundred with the archers (al-Qummi 1:111), the mountain at their backs, facing south. Two stay by
    // him from the first (Abu Dujana and Sahl); fourteen come back to him later (al-Irshad 1:82)
    for (let i = 0; i < 650; i++) {
      const row = i % 5, col = Math.floor(i / 5), n = 130, x0 = -150 + (col / (n - 1)) * 300 + gs() * .5, z0 = 532 + row * 2.6 + gs() * .5;
      const k = R(); let tx, tz;
      if (k < .55) { tx = x0 * .7 + gs() * 70; tz = 640 + R() * 200; } // up toward the mountain
      else if (k < .78) { tx = -260 - R() * 260; tz = 300 + R() * 260; }
      else { tx = (R() - .5) * 600; tz = 200 + R() * 120; }
      const ka = R() * TAU, kr = 3.4 + R() * 3.6;
      add({ side: 0, kind: R() < .4 ? 1 : 0, x0, z0, x1: x0 * .95 + gs() * 2, z1: z0 - 140 + gs() * 4, x2: tx, z2: tz, x3: GORGE[0] + gs() * 70 + (R() - .5) * 120, z3: GORGE[1] - 30 + R() * 80, d: R() * .02 + row * .004, d2: R() * .05, two: i < 2 ? i + 1 : 0, back14: i >= 2 && i < 16, kx: Math.cos(ka) * kr, kz: Math.sin(ka) * kr, ph: R() * TAU });
    }
    // the archers on their hill: most go down for the spoils; twelve hold and fall (al-Qummi 1:112)
    for (let i = 0; i < 50; i++) {
      const a = R() * TAU, r = Math.sqrt(R()), x0 = HILL[0] + Math.cos(a) * r * 22, z0 = HILL[1] + Math.sin(a) * r * 11;
      const stay = i < 12;
      add({ side: 0, kind: 0, archer: 1, stay, x0, z0, x1: stay ? x0 : 100 + R() * 50, z1: stay ? z0 : 200 + R() * 50, x2: -200 - R() * 200, z2: 260 + R() * 200, x3: GORGE[0] + gs() * 80, z3: GORGE[1] - 20 + R() * 70, d: stay ? 0 : (i - 12) / 38 * .035, d2: R() * .05, ph: R() * TAU });
    }
    // Quraysh across the plain (drawn as twelve hundred); two hundred horse lying in wait (al-Qummi 1:112); their camp
    for (let i = 0; i < 1200; i++) {
      const x0 = gs() * 150 + (R() - .5) * 90, z0 = 250 + R() ** .8 * 80;
      const grp = i < 64 ? i % 4 : -1, ga = GA[grp] || 0;
      const ra = -Math.PI / 2 + gs() * 1.9, rr2 = 46 + R() ** .7 * 90;
      add({ side: 1, kind: R() < .45 ? 1 : 0, x0, z0, x1: x0 * 1.05 + gs() * 8, z1: z0 - 140 + gs() * 10, x2: K[0] + Math.cos(ra) * rr2 * 1.3, z2: K[1] + Math.sin(ra) * rr2, x3: x0 * 1.3 + gs() * 60, z3: -260 - R() * 260, d: R() * .02, d2: R() * .05, grp, ga: ga + gs() * .3, gr: R(), ph: R() * TAU });
    }
    for (let i = 0; i < 200; i++) {
      const x0 = 262 + (i % 10) * 7 + gs(), z0 = 270 + Math.floor(i / 10) * 3.4 + gs();
      add({ side: 1, kind: 2, horse: 1, x0, z0, x1: x0, z1: z0, off: gs() * 9, lag: (i / 200) * .045 + R() * .006, x2: 10 + R() * 120, z2: 440 + R() * 130, x3: -100 + R() * 200, z3: -300 - R() * 200, d: 0, d2: R() * .04, ph: R() * TAU });
    }
    for (let i = 0; i < 170; i++) { const x0 = (R() - .5) * 320, z0 = -60 + R() * 120; add({ side: 1, kind: 4, fix: 1, x0, z0, dir: R() < .5 ? 1 : -1, ph: R() * TAU }); }
    for (let i = 0; i < 18; i++) { const x0 = (R() - .5) * 300, z0 = -40 + R() * 110; add({ side: 1, kind: 5, fix: 1, x0, z0, dir: 1, hs: 1, ph: 0 }); }
    st.F = F;
    st.ban = [[-60, 528, [226, 214, 186], 0], [10, 528, [226, 214, 186], 0], [80, 528, [62, 116, 88], 0]];
    for (let i = 0; i < 10; i++) st.ban.push([(R() - .5) * 280, 260 + R() * 60, i % 3 ? [112, 36, 30] : [30, 25, 24], 1]);
    // what they threw and shot at him when they massed on him: stones and arrows, each [start p, angle, range, arrow?, arc]
    st.shots = Array.from({ length: 70 }, (_, i) => [.448 + R() * .045, -Math.PI / 2 + gs() * 1.6, 16 + R() * 22, R() < .45, 2 + R() * 5, (R() - .5) * 3, (R() - .5) * 3]);
    st.shots.push([.479, -1.45, 20, false, 3, .1, .2]); // the stone that strikes him
    // dust: the push, the horse's trail round the hill, the rout, the press round him, the withdrawal
    st.puffs = [];
    for (let i = 0; i < 70; i++) st.puffs.push([(R() - .5) * 300, 300 + gs() * 14, .13 + R() * .08, 6 + R() * 9, R() * TAU, R(), 0]);
    for (let i = 0; i < 120; i++) { const u = i / 120, q = sweepAt(u); st.puffs.push([q[0] + gs() * 8, q[1] + gs() * 8, .225 + u * .12, 7 + R() * 9, R() * TAU, R(), 0]); }
    for (let i = 0; i < 70; i++) { const a = R() * TAU, r = 40 + R() * 90; st.puffs.push([K[0] + Math.cos(a) * r * 1.3, K[1] + Math.sin(a) * r, .33 + R() * .16, 6 + R() * 9, R() * TAU, R(), 0]); }
    for (let i = 0; i < 40; i++) { const a = R() * TAU, r = 14 + R() * 30; st.puffs.push([K[0] + Math.cos(a) * r, K[1] + Math.sin(a) * r, .55 + R() * .18, 5 + R() * 6, R() * TAU, R(), 0]); }
    for (let i = 0; i < 40; i++) st.puffs.push([(R() - .5) * 300, 160 + R() * 160, .8 + R() * .06, 10 + R() * 12, R() * TAU, R(), 0]);
    st.motes = new Float32Array(2400 * 4); for (let i = 0; i < 2400; i++) { st.motes[i * 4] = K[0] + (R() - .5) * 260; st.motes[i * 4 + 1] = K[1] - 60 + R() * 220; st.motes[i * 4 + 2] = R() ** 1.7 * 24; st.motes[i * 4 + 3] = R(); }
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    // ----- camera -----
    const { eye, look } = camAt(p);
    if (phone) phoneCam(p, eye, look);
    const fw = norm(sub(look, eye)), rt = norm(cross([0, 1, 0], fw)), up = cross(fw, rt);
    const F = phone ? W * 1.05 : Math.min(H * 1.3, W * .98), cx = W / 2, cy = H * (phone ? .62 : .52);
    const [E0, E1, E2] = eye, [f0, f1, f2] = fw, [r0, r1, r2] = rt, [u0, u1, u2] = up;
    let PX = 0, PY = 0, PZ = 0;
    const pj = (x, y, z) => { const dx = x - E0, dy = y - E1, dz = z - E2, zc = dx * f0 + dy * f1 + dz * f2; if (zc < .4) return false; const iz = F / zc; PX = cx + (dx * r0 + dy * r1 + dz * r2) * iz; PY = cy - (dx * u0 + dy * u1 + dz * u2) * iz; PZ = zc; return true; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze0, elev, saz, fogL0] = keyAt(LK, p);
    const fight = smooth(seg(p, .32, .38)) * (1 - smooth(seg(p, .74, .8)));
    const fogL = fogL0 * (1 - .25 * fight);
    const se = elev * Math.PI / 180, SUNH = [Math.cos(saz), 0, -Math.sin(saz)], sun = [SUNH[0] * Math.cos(se), Math.sin(se), SUNH[2] * Math.cos(se)];
    const day = c01((elev + 4) / 8), direct = c01((elev + .5) / 3); // sky light lingers after sunset; direct sun does not
    const hazeAt = (vx, vz) => { const k = Math.max(0, (vx * SUNH[0] + vz * SUNH[2]) / (Math.hypot(vx, vz) || 1)) ** 5; return lerp(haze0, lerp(skH, sunC, .25), k * .7 * day); };
    const fogOf = (zc) => Math.min(.95, 1 - Math.exp(-zc / fogL));
    const pitch = Math.asin(Math.max(-.99, Math.min(.99, f1))), hy = cy + F * Math.tan(pitch);
    const tint = (col) => { if (!st.tints[col]) { const cc = mk(128, 128), g = cc.getContext('2d'); g.drawImage(st.glow, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, 128, 128); st.tints[col] = cc; } return st.tints[col]; };
    // ----- sky -----
    const sg = c.createLinearGradient(0, Math.min(0, hy - F * 1.1), 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H); // every pixel, every frame: below the horizon the terrain paints over it
    const SD = 1e5;
    let SX = -1e4, SY = -1e4;
    if (elev > -8 && pj(E0 + sun[0] * SD, E1 + Math.max(sun[1], -.05) * SD, E2 + sun[2] * SD)) {
      SX = PX; SY = PY;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(SX, SY, 0, SX, SY, F * 1.2), a = .4 * c01((elev + 8) / 6);
      g.addColorStop(0, rgb(sunC, a)); g.addColorStop(.16, rgb(sunC, a * .35)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 2);
      if (elev > -1) { const r = F * .0062; c.globalAlpha = .9; c.drawImage(tint('#ffe6bc'), SX - r * 10, SY - r * 10, r * 20, r * 20); c.fillStyle = 'rgba(255,248,232,.95)'; c.beginPath(); c.arc(SX, SY, r, 0, TAU); c.fill(); c.globalAlpha = 1; }
      c.globalCompositeOperation = 'source-over';
    }
    const az0 = Math.atan2(f0, f2);
    const dirP = (az, e2) => pj(E0 + Math.sin(az) * Math.cos(e2) * SD, E1 + Math.sin(e2) * SD, E2 + Math.cos(az) * Math.cos(e2) * SD);
    const starA = smooth(seg(p, .8, .88));
    if (starA > 0) { c.fillStyle = '#f1e8d0'; st.stars.forEach(([az, e2, k]) => { if (!dirP(az0 + (az - Math.PI) * .5, e2) || PX < 0 || PX > W || PY > hy - 6) return; c.globalAlpha = starA * (.2 + .7 * k) * (.7 + .3 * Math.sin(t * 2 + k * 50)); const s = k > .92 ? 1.7 : 1; c.fillRect(PX, PY, s, s); }); c.globalAlpha = 1; }
    const cl = lerp(lerp(skM, sunC, .4 * day), [255, 244, 228], .12 * day);
    st.clouds.forEach(([az, e2, w, h, a]) => {
      if (!dirP(az0 + az * .6, e2)) return; const x = PX, y = PY, rw = w * F * .5, rh = h * F * .6;
      if (x < -rw || x > W + rw || y > hy) return;
      c.save(); c.translate(x, y); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(cl, a * .45 * (.3 + .7 * day))); g.addColorStop(1, rgb(cl, 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    // far ranges: pale and cool, almost the sky
    st.ridges.forEach((rg, L) => {
      const col = lerp(lerp(skH, haze0, L ? .45 : .2), skT, L ? .16 : .1);
      c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-2, hy + 4);
      for (let x = -2; x <= W + 22; x += 22) { const az = az0 + Math.atan((x - cx) / F); const ii = ((az / TAU * 720) % 360 + 360) % 360, i0 = Math.floor(ii), h = mix(rg[i0], rg[(i0 + 1) % 361], ii - i0); c.lineTo(x, hy - F * Math.tan(h) * (L ? .6 : .4)); }
      c.lineTo(W + 22, hy + 4); c.closePath(); c.fill();
    });
    // ----- terrain: depth bands, far to near -----
    const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
    const hf = norm([f0, 0, f2]), hr = [hf[2], 0, -hf[0]], cp = Math.cos(pitch), sp = Math.sin(pitch);
    const by = (H - cy) / F, dyb = sp - by * cp, dhb = cp + by * sp;
    const dMin = dyb < -.01 ? Math.max(1.5, E1 / -dyb * dhb * .8) : 4, dMax = 5200;
    const gravel = [146, 112, 84], sand = [198, 164, 120], rockA = [128, 78, 54], rockB = [100, 64, 52], lavaA = [56, 48, 48];
    const colW = W * 1.12 / NK / F * 2, rowK = (dMax / dMin) ** (1 / (NS - 1)) - 1, aerL = fogL * .7; // a colour sample's width per metre of depth; the band spacing
    for (let i = 0; i < NS; i++) {
      const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
      const zc0 = Math.max(.6, d * cp - E1 * sp), aer = 1 - Math.exp(-d / aerL), eR = Math.max(.6, zc0 * colW), eF = Math.max(.6, d * rowK);
      for (let k = 0; k <= NK; k++) {
        const sx = -W * .06 + k * (W * 1.12 / NK), u = (sx - cx) / F * zc0;
        const x = E0 + hf[0] * d + hr[0] * u, z = E2 + hf[2] * d + hr[2] * u, h = height(x, z);
        const o = i * (NK + 1) + k;
        if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
        if (k % 2 === 0) {
          const mt = mountain.v, gl = mountain.g; // from the height() just above
          const gR = (height(x + hr[0] * eR, z + hr[2] * eR) - h) / eR, gF = (height(x + hf[0] * eF, z + hf[2] * eF) - h) / eF;
          const hx = gR * hr[0] + gF * hf[0], hz = gR * hr[2] + gF * hf[2], nl = Math.hypot(hx, 1, hz);
          let lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl); const sky = .5 + .5 / nl;
          if (lam > 0 && sun[1] > 0 && sun[1] < .5 && (mt > 0 || (Math.abs(x - HILL[0]) < 160 && z > HILL[1] - 60 && z < HILL[1] + 240))) { let sh = 1; for (let m = 0, L = 10; m < 4; m++, L *= 2.8) { const q = height(x + sun[0] * L, z + sun[2] * L) - (h + .5 + sun[1] * L); if (q > 0) { sh = Math.min(sh, 1 - c01(q / 6)); if (sh <= 0) break; } } lam *= sh; }
          const lava = smooth(c01((Math.sin(x * .006 + 1) * Math.sin(z * .0071 - 2) + .1 * Math.sin(x * .03 + z * .02) - .25) / .2)) * c01((Math.abs(x) - 300) / 200 + c01((-z - 60) / 200));
          const drift = c01(.5 + .45 * Math.sin(x * .0093 + Math.sin(z * .0061) * 2.2) * Math.sin(z * .0117 - x * .0041 + 1) + .3 * Math.sin(x * .031 + z * .022 + Math.sin(z * .019) * 1.5) * Math.sin(z * .027 - x * .013));
          const al = lerp(lerp(lerp(gravel, sand, drift), lavaA, lava), lerp(rockA, rockB, c01(mt / 240)).map((v) => v * (.62 + .55 * gl) * (.9 + .1 * Math.sin(x * .0042 + z * .003))), c01(mt / 25));
          const lit = [0, 1, 2].map((j) => al[j] / 255 * (amb[j] * sky * .75 + sunC[j] * lam * 1.45 * direct));
          const hz2 = lerp(hazeAt(x - E0, z - E2), skH, .3), fa = Math.min(.96, aer * (1 - .12 * c01(h / 250))), n = (i * NC + k / 2) * 3;
          TC[n] = mix(lit[0], hz2[0], fa); TC[n + 1] = mix(lit[1], hz2[1], fa); TC[n + 2] = mix(lit[2], hz2[2], fa);
        }
      }
    }
    terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .12);
    const sandLit = [140, 114, 90].map((v, j) => v / 255 * (amb[j] * .8 + sunC[j] * Math.max(0, sun[1]) * 1.2 * day));
    c.lineJoin = 'round'; c.lineCap = 'round';
    // ground: gravel and stones near the camera; black lava stones out on the flanks
    c.lineWidth = 1;
    [0, 1].forEach((pass) => {
      c.strokeStyle = pass ? rgb(lerp(sandLit, [255, 240, 210], .3), .2) : rgb(lerp(sandLit, [16, 12, 10], .6), .28);
      c.beginPath();
      st.marks.forEach(([x, z, q, k]) => {
        if ((k > .55) !== !!pass || !pj(x, height(x, z), z) || PZ > 260) return;
        const L = (.3 + q * .9) * F / PZ; if (PX < -L || PX > W + L || PY > H + 2 || PY < hy) return;
        c.moveTo(PX - L, PY); c.lineTo(PX + L, PY);
      });
      c.stroke();
    });
    const sunSide = Math.sign(r0 * sun[0] + r2 * sun[2]) || 1, rockP = new Path2D();
    st.rocks.forEach(([x, z, r, k, h]) => { if (!pj(x, h, z)) return; const s = F / PZ * r; if (s < .6 || PX < -s * 2 || PX > W + s * 2 || PY > H + s) return; rockP.moveTo(PX + s * (1 + k * .3), PY); rockP.ellipse(PX, PY, s * (1 + k * .3), s * (.5 + k * .3), 0, 0, Math.PI, true); });
    c.fillStyle = rgb(lerp([28, 24, 26], haze0, .15)); c.fill(rockP);

    // ----- the people -----
    const towardN = Math.sign(r2) || 1; // +z (north, the mountain) lies to the right of the screen when r2 > 0
    const shadowP = new Path2D(), rimP = new Path2D(), legP = new Path2D(), spearP = new Path2D(), fallP = new Path2D();
    const BANDS = [90, 260, 700], body = [BANDS.map(() => new Path2D()), BANDS.map(() => new Path2D())];
    const sl = Math.max(.32, Math.tan(Math.max(.01, se))), shn = Math.hypot(sun[0], sun[2]) || 1, shx = -sun[0] / shn / sl, shz = -sun[2] / shn / sl;
    const draw = (side, kind, x, z, dir, ph, moving, hs, rot = 0) => {
      const y0 = height(x, z);
      if (!pj(x, y0, z)) return; const bx = PX, by0 = PY, zc = PZ;
      if (bx < -60 || bx > W + 60 || by0 < -40 || by0 > H + 80) return;
      const s = F / zc, sv = s * (1 - Math.abs(sp) * .5) * hs;
      const ht = kind === 2 ? 2.4 : kind === 5 ? 1.9 : kind === 4 ? 1.4 : 1.75;
      const pa = body[side][zc < BANDS[0] ? 0 : zc < BANDS[1] ? 1 : 2];
      const hpx = ht * sv;
      if (day > .3 && hpx > 20 && kind !== 5 && pj(x + shx * ht, y0, z + shz * ht)) { shadowP.moveTo(bx, by0); shadowP.lineTo(PX, PY); }
      if (hpx < 7) { const w = Math.max(.9, (kind >= 2 ? 1.8 : .5) * s); pa.rect(bx - w / 2, by0 - Math.max(1.2, hpx), w, Math.max(1.2, hpx)); return; }
      if (kind < 2) {
        const lean = moving ? .1 : 0, bob = moving ? Math.abs(Math.sin(ph)) * .04 * sv : 0, alt = (ph * 7 | 0) & 1, sh = hpx < 30 && !rot ? MANS : alt ? MAN2 : MAN;
        poly(pa, sh, bx, by0 - bob, s, sv, dir, rot, lean);
        if (rot) return;
        if (kind === 1) { const sa = Math.sin(ph * 3.1) * .25; spearP.moveTo(bx + (.2 - sa * .3) * s * dir, by0 - .45 * sv); spearP.lineTo(bx + (.3 + lean * 2.6 + sa) * s * dir, by0 - (2.9 + sa * .3) * sv); }
        if (hpx >= 30) { const [i0, i1] = (dir * sunSide > 0 ? RIMF : RIMB)[alt]; for (let i = i0; i <= i1; i++) { const u = (sh[i * 2] + lean * sh[i * 2 + 1]) * dir, X = bx + u * s, Y = by0 - bob - sh[i * 2 + 1] * sv; i === i0 ? rimP.moveTo(X, Y) : rimP.lineTo(X, Y); } }
      } else if (kind === 2) {
        poly(pa, HORSE, bx, by0, s, sv, dir); poly(pa, RIDER, bx - .1 * s * dir, by0, s, sv, dir);
        const sw = moving ? .5 : .08;
        [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o]) => { const a = Math.sin(ph + o) * sw; legP.moveTo(bx + hu * s * dir, by0 - 1.12 * sv); legP.lineTo(bx + (hu + a * .5) * s * dir, by0 - .52 * sv + Math.abs(a) * .2 * sv); legP.lineTo(bx + (hu + a * .3) * s * dir, by0); });
        spearP.moveTo(bx - .1 * s * dir, by0 - 1.9 * sv); spearP.lineTo(bx + 1.6 * s * dir, by0 - 3.2 * sv);
      } else poly(pa, kind === 4 ? KNEEL : TENT, bx, by0, s, sv, dir);
    };
    const lie = (x, z, a) => {
      const ca = Math.cos(a), sa = Math.sin(a), y = height(x, z) + .2, pts = [];
      for (const [u, v] of [[-1.05, -.34], [1.05, -.34], [1.05, .34], [-1.05, .34]]) { if (!pj(x + ca * u - sa * v, y, z + sa * u + ca * v)) return; pts.push(PX, PY); }
      fallP.moveTo(pts[0], pts[1]); fallP.lineTo(pts[2], pts[3]); fallP.lineTo(pts[4], pts[5]); fallP.lineTo(pts[6], pts[7]); fallP.closePath();
    };
    const PR = prophetAt(p), A = aliAt(p), Pg = pg(p);
    // positions
    const F_ = st.F, back = smooth(seg(p, .8, .9)), come = smooth(seg(p, .44, .49));
    for (let i = 0; i < F_.length; i++) {
      const o = F_[i];
      let x = o.x0, z = o.z0, moving = false, dir = o.dir || (o.side ? towardN : -towardN);
      if (!o.fix) {
        if (o.side === 0 && o.archer) {
          const dn = smooth(seg(p, .19 + o.d, .28 + o.d));
          if (o.stay) { if (p > .29 + o.d * .4) { lie(o.x0, o.z0, o.ph); continue; } }
          else { x = mix(o.x0, o.x1, dn); z = mix(o.z0, o.z1, dn); moving = dn > 0 && dn < 1; dir = dn > 0 ? -towardN : dir; }
          const r = ease.io(seg(p, .32 + o.d2, .42 + o.d2)); if (r > 0 && !o.stay) { x = mix(x, o.x2, r); z = mix(z, o.z2, r); moving = r < 1; }
          if (back > 0 && !o.stay) { x = mix(x, o.x3, back); z = mix(z, o.z3, back); moving = back < 1; dir = towardN; }
        } else if (o.side === 0) {
          const a = ease.io(seg(p, .13 + o.d, .22 + o.d)); x = mix(o.x0, o.x1, a); z = mix(o.z0, o.z1, a); moving = a > 0 && a < 1;
          if (fight > 0 && !o.two) { x += Math.sin(t * 2 + o.ph + p * 60) * .5 * fight; }
          if (o.two) { // the two who never left him, at his head
            const k = smooth(seg(p, .3, .36)), off = o.two === 1 ? [1.7, -1.3] : [1.9, 1.2];
            x = mix(x, PR[0] + off[0], k); z = mix(z, PR[2] + off[1], k); moving = k > 0 && k < 1;
            if (k >= 1) dir = Math.sign((PR[0] - x) * r0 + (PR[2] - z) * r2) || dir;
          } else {
            const r = ease.io(seg(p, .3 + o.d2, .42 + o.d2));
            if (r > 0) { x = mix(x, o.x2, r); z = mix(z, o.z2, r); moving = r < 1; dir = Math.sign((o.x2 - o.x1) * r0 + (o.z2 - o.z1) * r2) || dir; }
            if (o.back14) { const k = smooth(seg(p, .6 + o.d2 * .8, .67 + o.d2 * .8)); if (k > 0) { x = mix(x, PR[0] + o.kx, k); z = mix(z, PR[2] + o.kz, k); moving = k < 1; if (k >= 1) dir = Math.sign(-o.kx * r0 - o.kz * r2) || dir; } }
          }
          if (Pg > 0 && (o.two || o.back14)) { const ox = o.two ? (o.two === 1 ? 1.7 : 1.9) : o.kx, oz = o.two ? (o.two === 1 ? -1.3 : 1.2) : o.kz; x = PR[0] + ox; z = PR[2] + oz; moving = Pg < 1; }
          else if (back > 0 && !o.two && !o.back14) { x = mix(x, o.x3, back); z = mix(z, o.z3, back); moving = back < 1; dir = towardN; }
        } else if (o.horse) {
          const u = smooth(seg(p, .22 + o.lag, .34 + o.lag)), q = u > 0 ? sweepAt(u) : null;
          if (q) { const q2 = sweepAt(Math.min(1, u + .02)), dx = q2[0] - q[0], dz = q2[1] - q[1], dl = Math.hypot(dx, dz) || 1; x = mix(o.x0, q[0] + (-dz / dl) * o.off, smooth(c01(u * 8))); z = mix(o.z0, q[1] + (dx / dl) * o.off, smooth(c01(u * 8))); moving = u < 1; dir = Math.sign(dx * r0 + dz * r2) || dir; }
          if (u >= 1) { const m = smooth(seg(p, .34 + o.lag, .4 + o.lag)); x = mix(x, o.x2, m); z = mix(z, o.z2, m); moving = m < 1; x += Math.sin(t * 1.5 + o.ph + p * 70) * 1.5 * fight; }
          if (back > 0) { x = mix(x, o.x3, back); z = mix(z, o.z3, back); moving = back < 1; dir = -towardN; }
        } else {
          const a = ease.io(seg(p, .13 + o.d, .23 + o.d)); x = mix(o.x0, o.x1, a); z = mix(o.z0, o.z1, a); moving = a > 0 && a < 1; if (a > 0 && a < 1) dir = -towardN;
          const r = ease.io(seg(p, .32 + o.d2, .44 + o.d2));
          if (r > 0) { x = mix(x, o.x2, r); z = mix(z, o.z2, r); moving = r < 1; dir = towardN; }
          if (o.grp >= 0) { // they mass on him as one man; each band is met and turned in its turn
            const [ra, rb] = RUSH[o.grp], hit = smooth(seg(p, ra - .006, ra + .012)), turn = smooth(seg(p, ra + .012, rb));
            const rad = mix(mix(34 + o.gr * 12, 15 + o.gr * 7, come), 7 + o.gr * 3, hit) + turn * (22 + o.gr * 14), an = o.ga;
            const kx = PR[0] + Math.cos(an) * rad, kz = PR[2] + Math.sin(an) * rad, on = smooth(seg(p, .42, .45)) * (1 - smooth(seg(p, rb, rb + .03)));
            x = mix(x, kx, on); z = mix(z, kz, on); moving = moving || (on > 0 && on < 1) || (come > 0 && come < 1) || (hit > 0 && hit < 1) || (turn > 0 && turn < 1);
            if (on > .5) dir = turn > .3 ? -(Math.sign((PR[0] - kx) * r0 + (PR[2] - kz) * r2) || dir) : Math.sign((PR[0] - kx) * r0 + (PR[2] - kz) * r2) || dir;
          } else if (fight > 0) { x += Math.sin(t * 2 + o.ph + p * 60) * .8 * fight; z += Math.cos(t * 1.7 + o.ph + p * 50) * .8 * fight; }
          if (back > 0) { x = mix(x, o.x3, back); z = mix(z, o.z3, back); moving = back < 1; dir = -towardN; if (back >= 1) continue; }
        }
      } else if (back >= 1 && o.side) continue;
      draw(o.side, o.kind, x, z, dir, o.ph + p * 260, moving, o.hs);
    }
    c.lineCap = 'round';
    c.strokeStyle = rgb([30, 20, 14], .14 * day); c.lineWidth = Math.max(1, F / 380); c.stroke(shadowP);
    c.fillStyle = rgb(lerp([22, 15, 12], sandLit, .08), .92); c.fill(fallP);
    const tones = [lerp(sandLit.map((v) => v * .3), [52, 46, 38], .2), lerp(sandLit.map((v) => v * .14), [30, 16, 14], .3)];
    [1, 0].forEach((side) => [2, 1, 0].forEach((b) => { c.fillStyle = rgb(lerp(tones[side], haze0, Math.min(.75, fogOf([30, 170, 520][b])))); c.fill(body[side][b]); }));
    c.strokeStyle = rgb([28, 22, 18], .9); c.lineWidth = Math.max(.7, F / 1600); c.stroke(legP);
    c.strokeStyle = rgb([36, 28, 22], .75); c.lineWidth = .8; c.stroke(spearP);
    c.strokeStyle = rgb(lerp(sunC, [255, 240, 210], .3), .5 * day); c.lineWidth = Math.max(.8, F / 1100); c.lineJoin = 'round'; c.stroke(rimP);
    // banners
    st.ban.forEach(([bx0, bz0, col, side], j) => {
      let x = bx0, z = bz0;
      if (side) { const a = ease.io(seg(p, .13, .23)); z = mix(bz0, bz0 - 140, a); const r = ease.io(seg(p, .32, .44)); z = mix(z, 380 + j * 6, r); x = mix(bx0, bx0 * .7, r); const b2 = smooth(seg(p, .8, .9)); z = mix(z, -300, b2); if (b2 >= 1) return; }
      else { const a = ease.io(seg(p, .12, .21)); z = mix(bz0, bz0 - 140, a); const k = smooth(seg(p, .3, .4)); x = mix(x, -150 + j * 40, k); z = mix(z, 690, k); }
      const y0 = height(x, z); if (!pj(x, y0, z)) return; const bx = PX, by0 = PY, s = F / PZ, fz = fogOf(PZ);
      const L = 4.6 * s * (1 - Math.abs(sp) * .5), tx = bx, ty = by0 - L;
      c.strokeStyle = rgb(lerp([42, 32, 24], haze0, fz)); c.lineWidth = Math.max(.8, .09 * s); c.beginPath(); c.moveTo(bx, by0); c.lineTo(tx, ty); c.stroke();
      const fl = Math.sin(t * 3 + j + p * 40) * .15, w = 1.5 * s, h2 = .95 * s;
      c.fillStyle = rgb(lerp(lerp(col, [20, 18, 22], 1 - day * .8), haze0, fz * .8)); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + w * .5, ty + h2 * fl, tx + w, ty + h2 * .1 + h2 * fl * 2); c.lineTo(tx + w * .96, ty + h2 * 1.05); c.quadraticCurveTo(tx + w * .5, ty + h2 * (1 + fl), tx, ty + h2); c.closePath(); c.fill();
    });

    // ----- dust -----
    const bc = st.bc, BW = Math.max(8, Math.round(W / 6)), BH = Math.max(8, Math.round(H / 6));
    if (st.bloom.width !== BW || st.bloom.height !== BH) { st.bloom.width = BW; st.bloom.height = BH; }
    bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalCompositeOperation = 'source-over'; bc.clearRect(0, 0, BW, BH); bc.setTransform(BW / W, 0, 0, BH / H, 0, 0);
    st.puffs.forEach(([x, z, born, R0, ph, k]) => {
      const age = (p - born) / .08; if (age <= 0 || age > 2.6) return;
      const a = Math.min(1, age * 2.5) * (1 - c01((age - .9) / 1.7)) * (.4 + .6 * day);
      if (a <= .01) return;
      const y = height(x, z) + 1.5 + age * (3 + k * 6), r = R0 * (.6 + age * .8);
      if (!pj(x + Math.sin(ph + t * .2) * 2 + age * 6, y, z + age * 3)) return; const rr2 = r * F / PZ;
      const al = a * .4 * (1 - fogOf(PZ) * .4) * c01((PZ - 6) / (r * 2.5 + 10)), bk = c01(1 - Math.hypot(PX - SX, PY - SY) / (W * .7)) * day;
      c.globalAlpha = al * (1 - .5 * bk); c.drawImage(st.puffD, PX - rr2 * 1.5, PY - rr2 * .9, rr2 * 3, rr2 * 2);
      c.globalAlpha = Math.min(1, al * (.6 + 1.1 * bk) * (.4 + .6 * day)); c.drawImage(st.puff, PX - rr2 * 1.2 + sunSide * rr2 * .35, PY - rr2 * 1.15, rr2 * 2.4, rr2 * 1.7);
    });
    c.globalAlpha = 1;
    if (fight > 0) {
      const M = st.motes, n = M.length / 4;
      c.globalCompositeOperation = 'lighter'; c.fillStyle = rgb(lerp(sunC, [255, 240, 210], .3), fight * .3);
      c.beginPath();
      for (let i = 0; i < n; i++) {
        if (!pj(M[i * 4] + Math.sin(t * .3 + M[i * 4 + 3] * 40) * 1.5 + (p - .4) * 30, M[i * 4 + 2] * (.5 + fight) + .5, M[i * 4 + 1])) continue;
        if (PX < 0 || PX > W || PY < 0 || PY > H) continue;
        const s = Math.max(.6, Math.min(1.6, F / PZ * .05)); c.rect(PX, PY, s, s);
      }
      c.fill(); c.globalCompositeOperation = 'source-over';
    }
    // ----- what they threw at him: stones in arcs, arrows in flat lines -----
    const ph0 = height(PR[0], PR[2]);
    st.shots.forEach(([ts, an, rg, arrow, arc, ox, oz]) => {
      const u = (p - ts) / .012; if (u <= 0 || u >= 1) return;
      const sx0 = PR[0] + Math.cos(an) * rg, sz0 = PR[2] + Math.sin(an) * rg, tx = PR[0] + ox, tz = PR[2] + oz;
      const at = (v) => pj(mix(sx0, tx, v), ph0 + 1.6 + Math.sin(Math.PI * v) * (arrow ? arc * .3 : arc), mix(sz0, tz, v));
      if (!at(Math.max(0, u - (arrow ? .12 : .04)))) return; const ax = PX, ay = PY; if (!at(u)) return; const s = F / PZ;
      if (arrow) { c.strokeStyle = 'rgba(30,24,20,.85)'; c.lineWidth = Math.max(.8, s * .025); c.beginPath(); c.moveTo(ax, ay); c.lineTo(PX, PY); c.stroke(); }
      else { c.fillStyle = 'rgba(40,32,26,.95)'; c.beginPath(); c.arc(PX, PY, Math.max(1.2, s * .06), 0, TAU); c.fill(); }
    });
    // ----- the Prophet and Ali: veiled figures, the gold disc behind the head (scenes/holy.js) -----
    const dusk = smooth(seg(p, .76, .86)), famb = mix(1, .42, dusk), vs = 1 - Math.abs(sp) * .5;
    const place = (x, z, m, min) => { const y0 = height(x, z); if (!pj(x, y0, z)) return null; return { x: PX, y: PY, z: PZ, h: Math.max(min, m * F / Math.max(PZ, 6) * vs) }; };
    const scrDir = (x, z, dx, dz) => { if (!pj(x, height(x, z), z)) return 1; const x0 = PX; return pj(x + dx, height(x, z), z + dz) ? Math.sign(PX - x0) || 1 : 1; }; // which way (dx, dz) runs on screen
    const fP = place(PR[0], PR[2], 1.85, 14), fA = place(A[0], A[2], 1.8, 12), heads = [], figs = [];
    const hang = [[-.2, -.42], [.2, -.42]];
    let handZF = null; // where Dhul-Fiqar is drawn while it passes from his hand to Ali's
    if (fP) {
      let pose = 'stand', arms = null, phase = 0, flip = false, raise = 0, sword = p < GIFT[0] - .004;
      const toA = scrDir(PR[0], PR[2], A[0] - PR[0], A[2] - PR[2]);
      if (p < .11) { const k = smooth(seg(p, .015, .035)) * (1 - smooth(seg(p, .095, .11))), s = scrDir(PR[0], PR[2], HILL[0] - PR[0], HILL[1] - PR[2]); if (k > 0) arms = [hang[0], [mix(.2 * s, .46 * s, k), mix(-.42, -.84, k)]]; } // «لا تبرحوا…»
      else if (p < .22 && pk(p) > 0 && pk(p) < 1) { pose = 'walk'; phase = pk(p) * 60; }
      else if (p > .31 && p < .462) { const k = smooth(seg(p, .315, .335)) * (1 - smooth(seg(p, .445, .462))), s = scrDir(PR[0], PR[2], 0, 10); if (k > 0) arms = [[mix(-.2, -.3, k) * s, mix(-.42, -1.02, k)], hang[1].map((v, i) => (i ? v : v * s))]; } // «إنّي أنا رسول الله…»
      else if (p >= FALL[0] && p < FALL[1]) { // struck: he goes down, lies, lifts his head and looks to Ali, sits up
        const k = seg(p, FALL[0], FALL[1]);
        if (k < .1) { pose = 'sit'; } else if (k < .78) { pose = 'lie'; raise = smooth(seg(k, .55, .75)) * .7; flip = toA < 0; } else pose = 'sit';
        sword = false;
      } else if (p >= GIFT[0] - .006 && p < GIFT[1] + .006) { // he holds out Dhul-Fiqar to Ali
        const k = smooth(seg(p, GIFT[0] - .006, GIFT[0] + .006)) * (1 - smooth(seg(p, GIFT[1] - .004, GIFT[1] + .006)));
        arms = [hang[0], [mix(.2, .4, k) * toA, mix(-.42, -.66, k)]];
        if (p > GIFT[0] - .004 && p < GIFT[0] + .014) handZF = { by: 'P', k };
      } else if (p >= RUSH[1][0] - .014 && p < RUSH[3][1]) { // he points Ali at each band in turn (al-Irshad 1:85)
        let g = 1; RUSH.forEach(([a, , gg], j) => { if (j && p >= a - .014) g = gg; }); const [a, b] = RUSH[g];
        const k = smooth(seg(p, a - .014, a - .004)) * (1 - smooth(seg(p, b - .01, b))), s = scrDir(PR[0], PR[2], Math.cos(GA[g]), Math.sin(GA[g]));
        if (k > 0) arms = [hang[0], [mix(.2, .48, k) * s, mix(-.42, -.82, k)]];
      } else if (Pg > 0 && Pg < 1) { pose = 'walk'; phase = Pg * 50; }
      const o = { who: 'prophet', pose, phase, arms, flip, raise, sword: sword && pose === 'stand' && !arms, x: fP.x, y: fP.y, h: fP.h, t, amb: famb };
      figs.push([fP.z, () => { heads.push([Holy.draw(c, o), 1]); if (handZF && handZF.by === 'P' && arms) { const hx = fP.x + arms[1][0] * fP.h, hy2 = fP.y + arms[1][1] * fP.h; handZF.at = [hx, hy2, toA, fP.h]; } }]);
    }
    if (fA) { // Ali: in the front rank; by him from the rout; his own sword until it breaks, then Dhul-Fiqar from his hand
      const [, , , press, ang] = A, out = scrDir(PR[0], PR[2], Math.cos(ang), Math.sin(ang)), toP = fP ? Math.sign(fP.x - fA.x) || 1 : 1;
      let pose = 'stand', arms = null, phase = 0, flip = out < 0, sword = p >= GIFT[0] + .014, own = 0;
      if (p > .3 && p < .355) { pose = 'walk'; phase = seg(p, .3, .355) * 30; }
      if (!sword && p > .3) { own = p > RUSH[0][1] - .004 ? .45 : 1; arms = [hang[0], [.36, press > .2 ? -.92 : -.6]]; if (press > .2) { pose = 'walk'; phase = p * 300; } }
      if (p >= GIFT[0] - .01 && p < GIFT[1]) { flip = toP < 0; pose = 'stand'; arms = p < GIFT[0] + .014 ? [hang[0], [.3, -.6]] : null; own = 0; }
      if (sword && p >= RUSH[1][0] && p < RUSH[3][1] && press > .05) { pose = 'fight'; phase = (p * 140) % 1; }
      if (Pg > 0 && Pg < 1) { pose = 'walk'; phase = Pg * 50; flip = toP < 0; }
      const o = { who: 'ali', pose, phase, arms, sword: sword && !(pose === 'stand' && arms), flip, x: fA.x, y: fA.y, h: fA.h, t, amb: famb };
      figs.push([fA.z, () => {
        heads.push([Holy.draw(c, o), .8]);
        if (own > 0 && arms) { // his own sword, a plain straight blade; after the first band it is broken short
          const sgn = flip ? -1 : 1, hx = fA.x + arms[1][0] * sgn * fA.h, hy2 = fA.y + arms[1][1] * fA.h, ux = arms[1][0] * sgn, uy = arms[1][1] + .74, L = Math.hypot(ux, uy) || 1;
          c.strokeStyle = rgb(lerp([200, 200, 196], [60, 62, 70], 1 - famb)); c.lineWidth = Math.max(1, fA.h * .012); c.beginPath(); c.moveTo(hx, hy2); c.lineTo(hx + ux / L * fA.h * .5 * own, hy2 + uy / L * fA.h * .5 * own); c.stroke();
        }
      }]);
    }
    figs.sort((u, v) => v[0] - u[0]).forEach(([, f]) => f());
    // Dhul-Fiqar passing from his hand toward Ali's
    if (handZF && handZF.at && ZF) {
      const [hx, hy2, dirS, h] = handZF.at, len = h * .55;
      c.save(); c.translate(hx, hy2); c.rotate(dirS > 0 ? -.35 - Math.PI : .35); if (dirS < 0) c.scale(1, -1); c.scale(len / 1000, len / 1000); c.translate(-1000, -175);
      const q = c.createLinearGradient(0, 100, 0, 300); q.addColorStop(0, '#fff3cf'); q.addColorStop(.4, '#d9c27e'); q.addColorStop(.75, '#8a7038'); q.addColorStop(1, '#f3d98f');
      c.fillStyle = q; c.fill(ZF.blade); c.strokeStyle = 'rgba(255,240,200,.8)'; c.lineWidth = 6; c.stroke(ZF.blade); c.fillStyle = '#9c7a34'; c.fill(ZF.grip);
      c.restore();
    }
    const gl = (x, y, z, r, col, a, min = 0, max = 1e4) => { if (!pj(x, y, z)) return false; const rr2 = Math.min(max, Math.max(min, r * F / Math.max(PZ, 6))); c.globalAlpha = Math.min(1, a); c.drawImage(tint(col), PX - rr2, PY - rr2, rr2 * 2, rr2 * 2); c.globalAlpha = 1; return true; };
    c.globalCompositeOperation = 'lighter';
    // the discs carry a little light into the dust; more as night comes
    heads.forEach(([hd, k]) => { if (!hd) return; bc.fillStyle = `rgba(255,226,170,${k * (.22 + .45 * dusk)})`; bc.beginPath(); bc.arc(hd.x, hd.y, Math.max(8, hd.r * 4), 0, TAU); bc.fill(); });
    // each band is turned with one small soft flash at the edge
    RUSH.forEach(([a, , g]) => { const f = Math.max(0, 1 - Math.abs(p - (a + .014)) / .008); if (f > 0) gl(PR[0] + Math.cos(GA[g]) * 9, 1.4 + ph0, PR[2] + Math.sin(GA[g]) * 9, 3, '#fff0d2', .45 * f, 14, 120); });
    c.globalAlpha = .7; c.drawImage(st.bloom, 0, 0, W, H); c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    // ----- grade: nightfall and a gentle vignette -----
    if (dusk > 0) { c.fillStyle = `rgba(6,8,18,${.3 * dusk})`; c.fillRect(0, 0, W, H); }
    const vg = c.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .3, W / 2, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(8,8,10,0)'); vg.addColorStop(1, 'rgba(6,6,9,.58)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    // the label on the archers' hill follows the camera
    if (st.tag) { const hy0 = HILL[4] + 2; if (pj(HILL[0], hy0, HILL[1]) && PX > 0 && PX < W && PY > 0 && PY < H) { st.tag.style.left = `${PX.toFixed(1)}px`; st.tag.style.top = `${PY.toFixed(1)}px`; st.tag.style.visibility = ''; } else st.tag.style.visibility = 'hidden'; }
  },
};
})();
