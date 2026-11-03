(() => {
// badr: the valley of the wells, the night before 17 Ramadan 2 AH to mid-morning, told around the Prophet ﷺ. A pinhole
// camera over a small world in metres: x to the west, y up, z to the south (the Quraysh side). The sun rises in the east
// (-x). He prays the night through at the foot of a lone tree while the camp sleeps (al-Irshad 1:73); at dawn he sends
// out Ali, Hamza and Ubayda (1:74); before the shelter he raises his hands (Tafsir al-Qummi 1:266) and a dark cloud
// lit from within comes down on his ranks: the angels are light only, never figures; he throws a handful of pebbles
// and a wind drives into Quraysh (1:267). The camera keeps coming back to him. Terrain is a heightfield drawn as
// camera-facing depth bands (terrainRaster in core.js). People are faceless silhouettes; the Prophet and Ali are veiled
// figures with a gold disc behind the head (scenes/holy.js); no face is ever drawn.
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
const pulse = (x) => { const s = Math.sin(x); return s > 0 ? s ** 6 : 0; };

// ---------- the land: a flat floor of firm sand, a ring of dunes, low hills beyond ----------
const prof = (q) => (q < .7 ? smooth(q / .7) ** 1.3 : q < .8 ? 1 - .15 * ((q - .7) / .1) ** 2 : .85 * (1 - smooth((q - .8) / .2))); // windward slope, rounded crest, slip face
function height(x, z) {
  const ex = x / 430, ez = (z - 70) / 560, r = Math.sqrt(ex * ex + ez * ez);
  const belt = smooth(c01((r - .78) / .5)), hills = smooth(c01((r - 1.45) / 1.5));
  let h = .35 * Math.sin(x * .07 + z * .043) * Math.sin(z * .09 - x * .02) * (1 - belt);
  if (belt > 0) {
    const a = x * .0135 + z * .009 + Math.sin(z * .0071 + x * .0029) * 1.6 + Math.sin(x * .0047 - z * .0105) * 1.1;
    const b = x * .006 - z * .0155 + Math.sin(x * .009 + 2) * 1.2;
    const amp = .65 + .35 * Math.sin(x * .0037 + z * .0061) * Math.sin(z * .0029 - 1);
    h += belt * (6 + amp * (14 * prof(a - Math.floor(a)) + 7 * prof(b - Math.floor(b))) + 5 * Math.sin(x * .004 + z * .002));
  }
  if (hills > 0) h += hills * (60 + 38 * Math.sin(x * .0021 + 1.3) * Math.sin(z * .0027 + .4) + 14 * Math.sin(x * .011 + z * .007));
  const ad = (x + 20) ** 2 + (z + 44) ** 2; // the low rise behind the lines where the shelter stood
  return h + 2.6 * Math.exp(-ad / 260);
}
const ARISH = [-20, 0, -44]; // the shelter on the rise
const TREE = [-31.4, 0, -47.2]; // a lone tree beside it: he stood at its foot all night (al-Irshad 1:73)
const PN = [-29.6, 0, -45.9]; // where he prays through the night
const PD = [-20, 0, -43.6]; // in the shelter, over the ranks, from dawn on
const WELLS = [[16, -4, 2.2, 1], [-26, -30, 1.6, 0], [44, -36, 1.5, 0], [-60, 14, 1.5, 0], [66, 8, 1.4, 0]]; // x, z, radius, the cistern
const SUNH = norm([-1, 0, .25]);

// ---------- camera keys: [p, eye, look] or [p, eye, 'P', sx, sy]: the second kind aims at his feet so that they sit at
// (sx, sy) of a 1440x900 frame (see aim below); it is resolved once, after prophetAt is defined ----------
const CAM0 = [
  [-.06, [-25.2, 1.75, -55.8], 'P', .4, .8],
  [.02, [-25.4, 1.75, -55.6], 'P', .4, .8],
  [.085, [-25.8, 1.7, -55.2], 'P', .42, .8],
  [.135, [-11.6, 3.9, -54], 'P', .3, .84],
  [.185, [-13.4, 3.7, -52.4], 'P', .3, .84],
  [.195, [-13.5, 3.7, -52.3], 'P', .3, .84],
  [.225, [24, 2.0, 33], [-2, 1.6, 47]],
  [.27, [20.5, 1.85, 37], [-1, 1.5, 47.5]],
  [.32, [22, 2.1, 35], [-2, 1.6, 48]],
  [.355, [-14.6, 4.5, -35.4], 'P', .34, .84],
  [.37, [-14.7, 4.5, -35.5], 'P', .34, .84],
  [.43, [-15, 4.5, -36], 'P', .35, .84],
  [.45, [-6.5, 3, -41], 'P', .32, .86],
  [.47, [-13.8, 3.6, -52.5], 'P', .28, .9],
  [.53, [-13.2, 3.9, -54], 'P', .26, .9],
  [.565, [-12.5, 4.3, -55.5], 'P', .26, .88],
  [.582, ['A', 9.5, 2.8, -10.5], 'A', .35, .8],
  [.634, ['A', 9.5, 2.8, -10.5], 'A', .35, .8],
  [.655, [-15, 3.3, -51], 'P', .32, .86],
  [.685, [-15.2, 3.4, -51.4], 'P', .3, .88],
  [.72, [-13.5, 9.5, -62], 'P', .28, .92],
  [.83, [-13.2, 9.8, -63], 'P', .28, .92],
  [.88, [-13.4, 4.2, -54.6], 'P', .3, .85],
  [1, [-13.5, 4.2, -54.8], 'P', .3, .85],
  [1.06, [-13.55, 4.2, -54.85], 'P', .3, .85],
];
let CAM = null;
const ALIC = [.582, .634], ALIO = [9.5, 2.8, -10.5]; // while Ali cuts his way through, the camera rides beside him
function camAt(p) {
  if (p > ALIC[0] && p < ALIC[1]) { const a = aliAt(p), eye = [a[0] + ALIO[0], ALIO[1], a[2] + ALIO[2]]; return { eye, look: aim(eye, [a[0], 0, a[2]], .35, .8) }; }
  let i = 0; while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
  const k = smooth(c01((p - CAM[i][0]) / (CAM[i + 1][0] - CAM[i][0]))); // each move eases in and settles: no overshoot past a key
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
// ---------- light keys: p, sky top, sky mid, horizon, sun colour, ambient, haze, sun elevation (deg), fog length ----------
const LK = [
  [-.06, [5, 7, 16], [12, 16, 32], [30, 32, 52], [255, 130, 80], [42, 48, 80], [28, 30, 48], -16, 900],
  [.03, [5, 7, 16], [13, 17, 34], [34, 34, 56], [255, 130, 80], [44, 50, 82], [32, 32, 52], -14, 900],
  [.095, [10, 12, 26], [30, 32, 54], [120, 78, 74], [255, 130, 80], [36, 40, 66], [84, 68, 80], -4, 700],
  [.15, [16, 22, 42], [58, 58, 86], [196, 120, 92], [255, 146, 90], [56, 60, 90], [140, 104, 100], -1, 760],
  [.22, [26, 34, 58], [96, 90, 108], [232, 156, 106], [255, 170, 108], [70, 76, 104], [190, 142, 112], 1.6, 820],
  [.36, [36, 48, 74], [124, 116, 122], [236, 178, 126], [255, 190, 128], [82, 88, 112], [200, 158, 124], 3.5, 760],
  [.5, [40, 48, 70], [120, 112, 116], [214, 174, 136], [255, 204, 146], [86, 90, 108], [180, 150, 124], 6, 560],
  [.66, [48, 62, 88], [144, 138, 134], [216, 192, 156], [255, 218, 170], [98, 102, 118], [188, 168, 140], 9, 900],
  [1.06, [54, 70, 98], [152, 148, 144], [214, 196, 164], [255, 226, 184], [104, 108, 124], [190, 174, 150], 13, 1100],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MAN2 = [-.4, 0, -.3, .5, -.21, 1.0, -.26, 1.32, -.2, 1.44, -.1, 1.5, -.14, 1.58, -.13, 1.7, -.04, 1.79, .08, 1.78, .14, 1.68, .12, 1.56, .07, 1.5, .19, 1.44, .25, 1.28, .2, 1.0, .3, .5, .36, 0];
const MANS = [-.3, 0, -.22, 1.3, -.12, 1.5, -.08, 1.76, .08, 1.76, .12, 1.5, .22, 1.3, .3, 0]; // far LOD
const SITM = [-.42, 0, -.4, .3, -.27, .66, -.2, .86, -.16, .95, -.15, 1.03, -.08, 1.12, .03, 1.14, .1, 1.06, .1, .95, .17, .86, .26, .55, .42, .28, .46, 0]; // a sleeper sitting up
const SLEEP = [-.95, 0, -.92, .2, -.62, .33, -.1, .36, .38, .3, .66, .37, .84, .31, .94, .15, .97, 0]; // asleep under a cloak
const RIMF = [[9, 16], [10, 17]], RIMB = [[1, 8], [1, 9]]; // contour points on each side, per shape
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const RIDER = [-.24, 1.48, -.22, 1.95, -.14, 2.12, -.13, 2.26, -.06, 2.37, .05, 2.37, .11, 2.26, .12, 2.12, .2, 1.95, .24, 1.48];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
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

// ---------- Ali's way through the Quraysh ranks ----------
const PATH = [[0, 50], [-8, 64], [-28, 78], [-46, 96], [-40, 118], [-20, 130], [-6, 148], [-22, 166], [-48, 172], [-70, 160], [-80, 138]];
const pathAt = (u) => crv(PATH, c01(u) * (PATH.length - 1));
const aliU = (p) => smooth(seg(p, .565, .665));
const MEET = [0, 1.25, 49];
function aliAt(p) {
  if (p < .12) return [0, 1.25, -12];
  if (p < .27) return [0, 1.25, mix(-12, 41, smooth(seg(p, .12, .205))) + .4 * Math.sin(p * 90) * seg(p, .205, .26)];
  if (p < .34) return [0, 1.25, mix(41, 47.4, smooth(seg(p, .27, .281))) - 3.6 * smooth(seg(p, .29, .33))];
  if (p < .5) return [0, 1.25, mix(43.8, -10, smooth(seg(p, .34, .42)))];
  if (p < .565) return [0, 1.25, mix(-10, 50, smooth(seg(p, .5, .565)))];
  const q = pathAt(aliU(p)); return [q[0], 1.25, q[1]];
}
// where the Prophet stands: at the tree through the night, then a few steps to the front of the shelter
const prophetAt = (p) => { const w = smooth(seg(p, .105, .14)); return [mix(PN[0], PD[0], w), 0, mix(PN[2], PD[2], w)]; };
// the throw: the handful leaves his hand at THROW and the wind follows it into Quraysh
const THROW = [.664, .684], GUST = [.672, .79];
CAM = CAM0.map(([p, eye, T, sx, sy]) => {
  const a = aliAt(p); if (eye[0] === 'A') eye = [a[0] + eye[1], eye[2], a[2] + eye[3]];
  if (T === 'A') return [p, eye, aim(eye, [a[0], 0, a[2]], sx, sy)];
  if (T !== 'P') return [p, eye, T]; const q = prophetAt(p); return [p, eye, aim(eye, [q[0], height(q[0], q[2]), q[2]], sx, sy)];
});
// a tall screen: stand a little further off, and swing toward him so he keeps the lower middle under the words
function phoneCam(p, eye, look) {
  const PP = prophetAt(p), on = (1 - smooth(seg(p, .2, .222)) * (1 - smooth(seg(p, .33, .355)))) * (1 - smooth(seg(p, .566, .582)) * (1 - smooth(seg(p, .634, .65)))), toward = .6 * on, ph = [PP[0], height(PP[0], PP[2]) + 1.1, PP[2]];
  for (let j = 0; j < 3; j++) look[j] = mix(look[j], ph[j], toward);
  const back = mix(1.1, .62, on); for (let j = 0; j < 3; j++) eye[j] = look[j] + (eye[j] - look[j]) * back; eye[1] = Math.max(eye[1], 1.25);
}

S.badr = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.bloom = mk(8, 8); st.bc = st.bloom.getContext('2d');
    st.puff = sprite([[0, 'rgba(236,200,150,.85)'], [.45, 'rgba(222,184,138,.38)'], [1, 'rgba(214,176,130,0)']]);
    st.puffD = sprite([[0, 'rgba(120,96,76,.8)'], [.5, 'rgba(120,96,76,.35)'], [1, 'rgba(120,96,76,0)']]);
    st.cloudS = sprite([[0, 'rgba(26,26,36,.95)'], [.5, 'rgba(30,30,42,.85)'], [.78, 'rgba(36,36,48,.4)'], [1, 'rgba(40,40,52,0)']]);
    st.glow = sprite([[0, 'rgba(255,255,255,1)'], [.16, 'rgba(255,255,255,.55)'], [.42, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']], 128);
    st.tints = {};
    const R = rng(1702);
    const gs = () => (R() + R() + R() - 1.5) / 1.5;
    st.NS = 68; st.NK = 80;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.ridges = [0, 1].map((L) => { const a = []; let h = .02; for (let i = 0; i <= 360; i++) { h = mix(h, (L ? .028 : .045) + (L ? .02 : .03) * Math.sin(i * .07 + L * 2) ** 2 + R() * .012, .3); a.push(h); } return a; });
    st.stars = Array.from({ length: 420 }, () => [R() * TAU, .02 + R() ** .8 * 1.2, R()]);
    st.clouds = Array.from({ length: 16 }, () => [-1.4 + R() * 3.2, .1 + R() * .32, .5 + R() * 1.2, .02 + R() * .03, .25 + R() * .5]);
    st.marks = Array.from({ length: 2200 }, () => [(R() - .5) * 760, -320 + R() * 820, R(), R()]);
    st.shrubs = []; for (let i = 0; i < 190; i++) { const x = (R() - .5) * 860, z = -340 + R() * 880; if (Math.abs(x) < 190 && z > -80 && z < 230) continue; st.shrubs.push([x, z, .5 + R() * 1.3, R(), height(x, z)]); }
    // the tree: a flat-topped thorn tree, its crown a few soft lobes on a short forked trunk
    st.crown = Array.from({ length: 18 }, (_, i) => { const u = i / 17 - .5; return [u * 4.6 + gs() * .35, 2.85 + R() * .25 - u * u * 1.2, gs() * 1.2, .55 + R() * .5 - Math.abs(u) * .2]; }).sort((a, b) => b[2] - a[2]);
    // ---- the people ----
    const F = [], add = (o) => { o.hs = o.hs || .92 + R() * .16; F.push(o); return o; };
    // Muslims: 313 in four ranks by the wells, facing south; seventy camels and two horses behind. At night they sleep
    // where they will stand, and rise toward dawn.
    for (let i = 0; i < 313; i++) {
      const row = i % 4, col = Math.floor(i / 4), n = 79, grp = Math.floor(col / 9);
      const x0 = -80 + (col / (n - 1)) * 156 + grp * .9 + gs() * .45, z0 = -12 - row * 2.7 + gs() * .45;
      let sx = x0 + gs() * 1.6, sz = z0 - 1 + gs() * 1.2;
      if (i % 16 === 5) { // a few sleep up on the rise, near him
        for (let k = 0; k < 20; k++) { const a = R() * TAU, r = 3 + R() * 8; sx = -27.5 + Math.cos(a) * r; sz = -41.5 + Math.sin(a) * r * .8; if (Math.hypot(sx - PN[0], sz - PN[2]) > 2.6 && Math.hypot(sx - TREE[0], sz - TREE[2]) > 2 && Math.hypot(sx - ARISH[0], sz - ARISH[2]) > 3.2) break; }
      }
      add({ side: 0, kind: R() < .38 ? 1 : 0, x0, z0, x1: x0 * .9 + gs() * 2, z1: 26 + (3 - row) * 3.2 + gs() * 2.2 + Math.abs(x0) * .05, x2: x0 * .75 + gs() * 12, z2: -26 + R() * 30, d: R() * .025 + row * .006, ph: R() * TAU, ft: 9, sx, sz, sd: R() < .5 ? 1 : -1, wake: R() });
    }
    for (let i = 0; i < 70; i++) { const x0 = -104 + (i % 10) * 6 + gs() * 1.6, z0 = -36 - Math.floor(i / 10) * 5 + gs() * 1.2; add({ side: 0, kind: R() < .8 ? 4 : 3, x0, z0, x1: x0, z1: z0, x2: x0, z2: z0, d: 0, ph: R() * TAU, ft: 9, fix: 1, dir: R() < .5 ? 1 : -1 }); }
    [-86, 86].forEach((x) => add({ side: 0, kind: 2, x0: x, z0: -17, x1: x * .95, z1: 30, x2: x * .7, z2: 40, d: .01, ph: R() * TAU, ft: 9 }));
    // the seventy who fall: al-Walid and the two others at the duel; the rest in the field, Ali's share along his way
    const fall = [{ x: 0, z: 52.6, ft: .284, ali: 1, a: .25 }, { x: -9, z: 52.6, ft: .305, ali: 0, a: -.4 }, { x: 9, z: 52.6, ft: .326, ali: 0, a: 2.6 }];
    for (let j = 0; j < 34; j++) {
      const u = .05 + (j / 33) * .92 + (R() - .5) * .03, q = pathAt(u), q2 = pathAt(u + .01), nx = -(q2[1] - q[1]), nz = q2[0] - q[0], nl = Math.hypot(nx, nz) || 1, off = (R() < .5 ? -1 : 1) * (1.4 + R() * 5.5);
      fall.push({ x: q[0] + nx / nl * off, z: q[1] + nz / nl * off, ft: .565 + .1 * smooth(c01(u)) + .004, ali: 1, a: R() * TAU });
    }
    while (fall.length < 70) { const x = (R() - .5) * 200, z = 56 + R() * 112; if (Math.abs(x) < 60 && z > 60 && z < 190 && R() < .6) continue; fall.push({ x, z, ft: .57 + R() * .14, ali: 0, a: R() * TAU }); }
    st.fall = fall;
    // Quraysh: about a thousand on foot, a hundred horse, the camels and tents of their camp
    for (let i = 0; i < 950; i++) {
      const x0 = gs() * 120 + (R() - .5) * 60, z0 = 112 + R() ** .8 * 92 + Math.abs(x0) * .1;
      const fi = i >= 3 && i < 70 ? fall[i] : null;
      add({ side: 1, kind: R() < .45 ? 1 : 0, x0, z0, x1: fi ? fi.x : x0 * .92 + gs() * 3, z1: fi ? fi.z : 58 + (z0 - 112) * .9 + gs() * 3, x2: x0 * 1.6 + gs() * 40, z2: 520 + R() * 300, d: (z0 - 112) / 92 * .03 + R() * .01, d2: R() * .05, ph: R() * TAU, ft: fi ? fi.ft : 9, fa: fi ? fi.a : 0 });
    }
    for (let i = 0; i < 100; i++) { const sd = i < 50 ? -1 : 1, x0 = sd * (128 + R() * 70), z0 = 100 + R() * 60; add({ side: 1, kind: 2, x0, z0, x1: sd * (70 + R() * 70), z1: 62 + R() * 40, x2: x0 * 1.3, z2: 560 + R() * 260, d: R() * .02 - .02, d2: R() * .03 - .02, ph: R() * TAU, ft: 9 }); }
    for (let i = 0; i < 260; i++) { const x0 = (R() - .5) * 300, z0 = 236 + R() * 110; add({ side: 1, kind: R() < .65 ? 4 : 3, x0, z0, x1: x0, z1: z0, x2: x0, z2: z0, d: 0, ph: R() * TAU, ft: 9, fix: 1, dir: R() < .5 ? 1 : -1 }); }
    for (let i = 0; i < 26; i++) { const x0 = (R() - .5) * 280, z0 = 240 + R() * 110; add({ side: 1, kind: 5, x0, z0, x1: x0, z1: z0, x2: x0, z2: z0, d: 0, ph: 0, ft: 9, fix: 1, dir: 1, hs: 1 }); }
    st.F = F;
    // champions: [x, side, which of the fallen]; the Muslim two (Hamza, Ubayda) are silhouettes, Ali the veiled figure
    st.champ = [[-9, 0, -1], [9, 0, -1], [-9, 1, 1], [0, 1, 0], [9, 1, 2]];
    st.ban = [[-52, -15, [226, 214, 186], 0], [-6, -15, [226, 214, 186], 0], [30, -15, [62, 116, 88], 0]];
    for (let i = 0; i < 12; i++) st.ban.push([(R() - .5) * 220, 120 + R() * 70, i % 3 ? [112, 36, 30] : [30, 25, 24], 1, .68 + R() * .07]);
    // dust: puffs where the lines meet and along Ali's way; trails behind the horse; motes in the low sun
    st.puffs = Array.from({ length: 300 }, (_, i) => {
      if (i < 70) { const q = pathAt(i / 70); return [q[0] + gs() * 4, q[1] + gs() * 4, .565 + .1 * (i / 70), 5 + R() * 8, R() * TAU, R(), 0]; }
      if (i < 250) { const x = (R() - .5) * 236; return [x, 54 + gs() * 7 + Math.abs(x) * .05, .55 + R() * .12, 6 + R() * 10, R() * TAU, R(), 0]; }
      return [(R() - .5) * 260, 50 + R() * 50, .54 + R() * .1, 22 + R() * 16, R() * TAU, R(), 1];
    });
    st.flick = Array.from({ length: 240 }, () => [(R() - .5) * 230, 52 + gs() * 8, .9 + R() * 1.6, R()]);
    st.trail = Array.from({ length: 90 }, () => [R() < .5 ? -1 : 1, R(), 3 + R() * 6, R() * TAU]);
    st.motes = new Float32Array(2800 * 4); for (let i = 0; i < 2800; i++) { st.motes[i * 4] = (R() - .5) * 260; st.motes[i * 4 + 1] = 30 + R() * 160; st.motes[i * 4 + 2] = R() ** 1.7 * 26; st.motes[i * 4 + 3] = R(); }
    // the cloud over his ranks (Tafsir al-Qummi 1:266: «سحابة سوداء فيها برق لائح»): dark lobes, flashes inside, and
    // shafts and motes of light falling from it onto the ranks. No figure is ever drawn in it.
    st.lobes = Array.from({ length: 72 }, () => { const x = (R() - .5) * 220, e = 1 - (x / 110) ** 2; return [x, R() ** 1.3 * 16 * e, -38 + R() * 52, (8 + R() * 13) * (.6 + .4 * e)]; });
    st.flash = Array.from({ length: 11 }, () => [(R() - .5) * 170, -24 + R() * 36, R() * TAU, .7 + R() * .8]);
    st.bolts = st.flash.map(() => Array.from({ length: 7 }, () => [gs() * 3.2, R()]));
    st.shafts = Array.from({ length: 16 }, () => [(R() - .5) * 160, -22 + R() * 14, 4 + R() * 6, R()]);
    st.light = new Float32Array(900 * 4); for (let i = 0; i < 900; i++) { st.light[i * 4] = (R() - .5) * 180; st.light[i * 4 + 1] = -28 + R() * 30; st.light[i * 4 + 2] = R(); st.light[i * 4 + 3] = R(); }
    // the handful of pebbles and the wind that carries it
    st.pebs = Array.from({ length: 70 }, () => [(R() - .5) * 190, 92 + R() * 80, 4 + R() * 16, R()]);
    st.wind = Array.from({ length: 560 }, () => [(R() - .5) * 240, -34 + R() * 90, .3 + R() ** 2 * 6, 6 + R() * 16, R()]);
    st.gustP = Array.from({ length: 120 }, () => [(R() - .5) * 260, R() * 30, 5 + R() * 9, R() * TAU, R()]);
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
    const [skT, skM, skH, sunC, amb, haze0, elev, fogL0] = keyAt(LK, p);
    const fight = smooth(seg(p, .54, .6)) * (1 - smooth(seg(p, .7, .8)));
    const fogL = fogL0 * (1 - .15 * fight);
    const se = elev * Math.PI / 180, sun = [SUNH[0] * Math.cos(se), Math.sin(se), SUNH[2] * Math.cos(se)];
    const hazeAt = (vx, vz) => { const k = Math.max(0, (vx * SUNH[0] + vz * SUNH[2]) / (Math.hypot(vx, vz) || 1)) ** 5; return lerp(haze0, lerp(skH, sunC, .25), k * .8 * c01((elev + 8) / 6)); };
    const fogOf = (zc) => Math.min(.95, 1 - Math.exp(-zc / fogL));
    const pitch = Math.asin(Math.max(-.99, Math.min(.99, f1))), hy = cy + F * Math.tan(pitch);
    const tint = (col) => { if (!st.tints[col]) { const cc = mk(128, 128), g = cc.getContext('2d'); g.drawImage(st.glow, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, 128, 128); st.tints[col] = cc; } return st.tints[col]; };
    // the cloud: comes down over the ranks as he prays, holds through the battle's first clash, then thins
    const cloudK = ease.out(seg(p, .43, .5)), cloudA = smooth(seg(p, .425, .46)) * (1 - smooth(seg(p, .6, .67))), cloudY = mix(110, 15, cloudK);
    const shaftA = smooth(seg(p, .465, .51)) * (1 - smooth(seg(p, .55, .6)));
    // ----- sky -----
    const sg = c.createLinearGradient(0, hy - F * .9, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H); // every pixel, every frame: below the horizon the terrain paints over it
    const SD = 1e5;
    let SX = -1e4, SY = -1e4;
    if (elev > -9 && pj(E0 + sun[0] * SD, E1 + Math.max(sun[1], -.02) * SD, E2 + sun[2] * SD)) {
      const sx = PX, sy = PY; SX = sx; SY = sy;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, F * 1.1), a = c01((elev + 9) / 5);
      g.addColorStop(0, rgb(sunC, .4 * a)); g.addColorStop(.16, rgb(sunC, .14 * a)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 2);
      if (elev > -1.2) { const r = F * .0062; c.globalAlpha = c01((elev + 1.2) / 1.5) * .9; c.drawImage(tint('#ffe2b0'), sx - r * 10, sy - r * 10, r * 20, r * 20); c.fillStyle = 'rgba(255,246,226,.95)'; c.beginPath(); c.arc(sx, sy, r, 0, TAU); c.fill(); c.globalAlpha = 1; }
      c.globalCompositeOperation = 'source-over';
    }
    const az0 = Math.atan2(f0, f2);
    const dirP = (az, e2) => pj(E0 + Math.sin(az) * Math.cos(e2) * SD, E1 + Math.sin(e2) * SD, E2 + Math.cos(az) * Math.cos(e2) * SD);
    const starA = 1 - smooth(seg(p, .06, .16));
    if (starA > 0) {
      c.fillStyle = '#f1e8d0';
      st.stars.forEach(([az, e2, k]) => { if (!dirP(az, e2) || PX < 0 || PX > W || PY > hy - 4) return; c.globalAlpha = starA * (.2 + .6 * k) * (.7 + .3 * Math.sin(t * 2 + k * 50)) * c01((hy - PY) / 40); const s = k > .9 ? 1.6 : 1; c.fillRect(PX, PY, s, s); });
      c.globalAlpha = 1;
    }
    const cl = lerp(lerp(skM, sunC, .55), [255, 240, 220], .15);
    st.clouds.forEach(([az, e2, w, h, a]) => {
      if (!dirP(-Math.PI / 2 + az, e2)) return; const x = PX, y = PY, rw = w * F * .5, rh = h * F * .6;
      if (x < -rw || x > W + rw || y > hy) return;
      c.save(); c.translate(x, y); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(cl, a * .5 * (1 - starA * .8))); g.addColorStop(1, rgb(cl, 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    st.ridges.forEach((rg, L) => {
      const col = lerp(lerp(skH, haze0, L ? .5 : .25), skT, L ? .14 : .08); // far ranges: pale and cool, almost the sky
      c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-2, hy + 4);
      for (let x = -2; x <= W + 22; x += 22) { const az = az0 + Math.atan((x - cx) / F); const ii = ((az / TAU * 720) % 360 + 360) % 360, i0 = Math.floor(ii), h = mix(rg[i0], rg[(i0 + 1) % 361], ii - i0); c.lineTo(x, hy - F * Math.tan(h) * (L ? .7 : .45)); }
      c.lineTo(W + 22, hy + 4); c.closePath(); c.fill();
    });
    // ----- terrain: depth bands, far to near (painted by terrainRaster in core.js) -----
    const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
    const hf = norm([f0, 0, f2]), hr = [hf[2], 0, -hf[0]], cp = Math.cos(pitch), sp = Math.sin(pitch);
    const by = (H - cy) / F, dyb = sp - by * cp, dhb = cp + by * sp;
    const dMin = dyb < -.01 ? Math.max(1.5, E1 / -dyb * dhb * .8) : 4, dMax = 4200;
    const albedo = [196, 162, 118], gravel = [164, 128, 92];
    const shade = 1 - .22 * cloudA * cloudK; // the cloud's shadow over the valley while it hangs low
    for (let i = 0; i < NS; i++) {
      const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
      const zc0 = Math.max(.6, d * cp - E1 * sp), fogK = 1 - Math.exp(-d / fogL);
      for (let k = 0; k <= NK; k++) {
        const sx = -W * .06 + k * (W * 1.12 / NK), u = (sx - cx) / F * zc0;
        const x = E0 + hf[0] * d + hr[0] * u, z = E2 + hf[2] * d + hr[2] * u, h = height(x, z);
        const o = i * (NK + 1) + k;
        if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
        if (k % 2 === 0) {
          const e = Math.max(.5, d * .004), hx = (height(x + e, z) - h) / e, hz = (height(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz); // fine: the dunes' slip faces stay crisp
          let lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl); const sky = .55 + .45 / nl;
          if (lam > 0 && sun[1] > -.02) { let sh = 1; for (let m = 0, L = 7; m < 4; m++, L *= 2.6) { const q = height(x + sun[0] * L, z + sun[2] * L) - (h + .4 + sun[1] * L); if (q > 0) { sh = Math.min(sh, 1 - c01(q / 3)); if (sh <= 0) break; } } lam *= sh; }
          const drift = c01(.55 + .45 * Math.sin(x * .021 + Math.sin(z * .013) * 2) * Math.sin(z * .017 - x * .007 + 1)), al = lerp(gravel, albedo, drift); // firm darker ground, paler drifted sand
          const sh2 = Math.abs(x) < 220 && z > -60 && z < 60 ? shade : 1;
          const lit = [0, 1, 2].map((j) => al[j] / 255 * (amb[j] * sky * .78 + sunC[j] * lam * 1.3 * sh2));
          const hz2 = hazeAt(x - E0, z - E2), fa = Math.min(.97, fogK * (1 - .25 * c01(h / 120))), n = (i * NC + k / 2) * 3;
          TC[n] = mix(lit[0], hz2[0], fa); TC[n + 1] = mix(lit[1], hz2[1], fa); TC[n + 2] = mix(lit[2], hz2[2], fa);
        }
      }
    }
    terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .12);
    const sandLit = albedo.map((v, j) => v / 255 * (amb[j] * .8 + sunC[j] * Math.max(0, sun[1]) * 1.15));
    // ground marks: wind ripples and stones near the camera
    c.lineWidth = 1;
    [0, 1].forEach((pass) => {
      c.strokeStyle = pass ? rgb(lerp(sandLit, [255, 236, 200], .35), .24) : rgb(lerp(sandLit, [20, 14, 10], .55), .26);
      c.beginPath();
      st.marks.forEach(([x, z, q, k]) => {
        if ((k > .55) !== !!pass || !pj(x, 0, z) || PZ > 300) return;
        const L = (.4 + q * 1.2) * F / PZ; if (PX < -L || PX > W + L || PY > H + 2 || PY < hy) return;
        c.moveTo(PX - L, PY); c.lineTo(PX + L, PY);
      });
      c.stroke();
    });
    // shrubs: dark low domes with a lit rim
    const sunSide = Math.sign(r0 * sun[0] + r2 * sun[2]) || 1, shrubP = new Path2D(), shrubS = new Path2D(), shrubR = new Path2D();
    st.shrubs.forEach(([x, z, r, k, h]) => {
      if (!pj(x, h, z)) return; const s = F / PZ * r; if (s < .6 || PX < -s * 3 || PX > W + s * 3 || PY > H + s) return;
      const ww = s * (1 + k * .4), hh = s * (.55 + k * .3);
      shrubS.moveTo(PX - sunSide * s * 1.4 + s * 2, PY); shrubS.ellipse(PX - sunSide * s * 1.4, PY, s * 2, s * .22, 0, 0, TAU);
      shrubP.moveTo(PX + ww, PY); shrubP.ellipse(PX, PY, ww, hh, 0, 0, Math.PI, true);
      { const a0 = sunSide > 0 ? -.3 : Math.PI + .3; shrubR.moveTo(PX + ww * Math.cos(a0), PY + hh * Math.sin(a0)); } shrubR.ellipse(PX, PY, ww, hh, 0, sunSide > 0 ? -.3 : Math.PI + .3, sunSide > 0 ? -1.2 : Math.PI + 1.2, sunSide > 0);
    });
    c.fillStyle = rgb([18, 14, 10], .3); c.fill(shrubS);
    c.fillStyle = rgb(lerp([38, 34, 22], haze0, .12)); c.fill(shrubP);
    c.strokeStyle = rgb(sunC, .35 * c01((elev + 2) / 3)); c.lineWidth = 1; c.stroke(shrubR);
    // the wells and the cistern: stone rims, dark water holding the sky
    WELLS.forEach(([x, z, r, cis]) => {
      const ring = (rr, y) => { const pts = []; for (let a = 0; a <= 24; a++) { const an = a / 24 * TAU, rx = cis ? Math.max(-1, Math.min(1, Math.cos(an) * 1.6)) * rr * 2.2 : Math.cos(an) * rr, rz = cis ? Math.max(-1, Math.min(1, Math.sin(an) * 1.6)) * rr * 1.2 : Math.sin(an) * rr; if (!pj(x + rx, y, z + rz)) return null; pts.push([PX, PY]); } return pts; };
      const out = ring(r + .5, .45), inn = ring(r, .46); if (!out || !inn) return;
      const fz = fogOf(PZ), path = (pts) => { c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.closePath(); };
      c.fillStyle = rgb(lerp([92, 76, 60], haze0, fz)); path(out); c.fill();
      const ys = inn.map((q) => q[1]), wg = c.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys) + .1);
      wg.addColorStop(0, rgb(lerp([20, 18, 20], haze0, fz))); wg.addColorStop(1, rgb(lerp(lerp(skM, skH, .5), haze0, fz), .9));
      c.fillStyle = wg; path(inn); c.fill();
      c.strokeStyle = rgb(lerp(sunC, haze0, fz), .5 * c01((elev + 6) / 6)); c.lineWidth = 1; path(out); c.stroke();
    });
    // the shelter on the rise: four palm-trunk poles and a flat roof of fronds; drawn in two parts so that he stands
    // inside it (the far poles and the roof behind him, the near poles in front)
    const ah = height(ARISH[0], ARISH[2]), RH = 2.45, CORN = [[-2.3, -1.7], [2.3, -1.7], [2.3, 1.7], [-2.3, 1.7]];
    const frondC = lerp([118, 92, 58], [70, 76, 104], starA * .7), poleC = [44, 32, 22];
    const shelter = (part) => {
      if (!pj(ARISH[0], ah, ARISH[2])) return; const zc0 = PZ, fz0 = fogOf(zc0), s0 = F / zc0;
      const lit = c01((elev + 2) / 4), under = E1 < ah + RH;
      const pole = (dx, dz) => { const hh = height(ARISH[0] + dx, ARISH[2] + dz); if (!pj(ARISH[0] + dx, hh, ARISH[2] + dz)) return; const bx = PX, by2 = PY, w = Math.max(1.2, .2 * F / PZ); if (!pj(ARISH[0] + dx, ah + RH, ARISH[2] + dz)) return;
        c.fillStyle = rgb(lerp(poleC, haze0, fz0)); c.beginPath(); c.moveTo(bx - w * .55, by2); c.lineTo(PX - w * .4, PY); c.lineTo(PX + w * .4, PY); c.lineTo(bx + w * .55, by2); c.closePath(); c.fill();
        if (w > 3) { c.strokeStyle = rgb(lerp(sunC, haze0, fz0), .3 * lit); c.lineWidth = Math.max(.6, w * .18); c.beginPath(); c.moveTo(bx - sunSide * w * .4, by2); c.lineTo(PX - sunSide * w * .3, PY); c.stroke(); c.strokeStyle = rgb([20, 14, 10], .35); c.lineWidth = Math.max(.5, w * .08); c.beginPath(); for (let k = 1; k < 9; k++) { const y = mix(by2, PY, k / 9), x = mix(bx, PX, k / 9); c.moveTo(x - w * .45, y); c.lineTo(x + w * .45, y + w * .25); } c.stroke(); } };
      const d = CORN.map(([dx, dz]) => (pj(ARISH[0] + dx, 0, ARISH[2] + dz) ? PZ : 0));
      if (part === 'back') {
        CORN.forEach(([dx, dz], i) => { if (d[i] >= zc0) pole(dx, dz); });
        const top = []; for (const [dx, dz] of CORN) { if (!pj(ARISH[0] + dx * 1.06, ah + RH, ARISH[2] + dz * 1.08)) return; top.push([PX, PY]); }
        const path = () => { c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
        c.fillStyle = rgb(lerp(under ? frondC.map((v) => v * .42) : frondC.map((v) => v * (.7 + .4 * lit)), haze0, fz0)); path(); c.fill();
        if (s0 > 14) { // the fronds: strokes across the roof, ragged past its edges
          c.save(); path(); c.clip();
          c.strokeStyle = rgb(lerp(under ? frondC.map((v) => v * .25) : frondC, haze0, fz0), .7); c.lineWidth = Math.max(.6, s0 * .025); c.beginPath();
          for (let k = 0; k <= 22; k++) { const u = k / 22; c.moveTo(mix(top[0][0], top[3][0], u), mix(top[0][1], top[3][1], u)); c.lineTo(mix(top[1][0], top[2][0], u + .02 * Math.sin(k * 3)), mix(top[1][1], top[2][1], u)); }
          c.stroke(); c.restore();
          c.strokeStyle = rgb(lerp(frondC.map((v) => v * .6), haze0, fz0), .9); c.lineWidth = Math.max(.6, s0 * .02); c.beginPath();
          for (let k = 0; k <= 30; k++) { const u = k / 30, j = (k * 7) % 5; for (const [a1, a2] of [[0, 1], [3, 2]]) { const x = mix(top[a1][0], top[a2][0], u), y = mix(top[a1][1], top[a2][1], u); c.moveTo(x, y); c.lineTo(x + (j - 2) * s0 * .05, y + s0 * (.12 + j * .04)); } }
          c.stroke();
        }
        c.strokeStyle = rgb(lerp(sunC, haze0, fz0), .3 * lit); c.lineWidth = 1; path(); c.stroke();
      } else CORN.forEach(([dx, dz], i) => { if (d[i] < zc0) pole(dx, dz); });
    };
    // the lone tree: a short trunk forking into limbs, a flat crown of soft dark lobes
    const th = height(TREE[0], TREE[2]);
    const tree = () => {
      if (!pj(TREE[0], th, TREE[2])) return; const s = F / PZ, fz = fogOf(PZ);
      const col = lerp([26, 22, 17], haze0, fz * .9), top = lerp(lerp([60, 56, 40], [52, 58, 84], starA), haze0, fz * .9);
      c.strokeStyle = rgb(col); c.lineCap = 'round';
      const limb = (x0, y0, x1, y1, w) => { if (!pj(TREE[0] + x0, th + y0, TREE[2])) return; const ax = PX, ay = PY; if (!pj(TREE[0] + x1, th + y1, TREE[2])) return; c.lineWidth = Math.max(1, w * s); c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mix(ax, PX, .5) + (x1 - x0) * s * .12, mix(ay, PY, .5), PX, PY); c.stroke(); };
      limb(0, 0, -.1, 1.4, .2); limb(-.1, 1.3, -1.3, 2.6, .11); limb(-.1, 1.3, 1.1, 2.7, .11); limb(-.05, 1.5, .25, 2.9, .08); limb(-.8, 2.1, -2, 2.8, .06); limb(.7, 2.2, 1.9, 2.8, .06);
      st.crown.forEach(([x, y, z, r]) => { if (!pj(TREE[0] + x, th + y, TREE[2] + z)) return; const rr = r * F / PZ; c.fillStyle = rgb(col); c.beginPath(); c.ellipse(PX, PY, rr * 1.25, rr * .36, 0, 0, TAU); c.fill(); c.fillStyle = rgb(top, .22); c.beginPath(); c.ellipse(PX, PY - rr * .08, rr * 1.0, rr * .22, 0, Math.PI, TAU); c.fill(); });
    };

    // ----- the people -----
    const towardS = Math.sign(r2) || 1; // +z (south) lies to the right of the screen when r2 > 0
    const shadowP = new Path2D(), rimP = new Path2D(), legP = new Path2D(), spearP = new Path2D(), fallP = new Path2D();
    const BANDS = [90, 260, 700], body = [BANDS.map(() => new Path2D()), BANDS.map(() => new Path2D())];
    const sl = Math.max(.32, Math.tan(Math.max(.01, se))), shn = Math.hypot(sun[0], sun[2]), shx = -sun[0] / shn / sl, shz = -sun[2] / shn / sl;
    const A = aliAt(p);
    const draw = (side, kind, x, z, dir, ph, moving, hs, rot = 0, band = -1) => {
      if (!pj(x, 0, z)) return; const bx = PX, by0 = PY, zc = PZ;
      if (bx < -60 || bx > W + 60 || by0 < -40 || by0 > H + 80) return;
      const s = F / zc, sv = s * (1 - Math.abs(sp) * .5) * hs;
      const ht = kind === 2 ? 2.4 : kind === 3 ? 2.3 : kind === 5 ? 1.9 : kind === 4 ? 1.4 : kind === 6 ? .4 : kind === 7 ? 1.1 : 1.75;
      const pa = body[side][band >= 0 ? band : zc < BANDS[0] ? 0 : zc < BANDS[1] ? 1 : 2];
      const hpx = ht * sv;
      if (hpx > 9 && kind !== 5 && elev > 0 && pj(x + shx * ht, 0, z + shz * ht)) { shadowP.moveTo(bx, by0); shadowP.lineTo(PX, PY); }
      if (kind === 6) { if (s * 1.9 < 1.5) return; poly(pa, SLEEP, bx, by0, s, sv, dir); return; } // asleep
      if (kind === 7) { if (hpx < 2) return; poly(pa, SITM, bx, by0, s, sv, dir); return; } // sitting up
      if (hpx < 5) { const w = Math.max(.9, (kind >= 2 ? 1.8 : .5) * s); pa.rect(bx - w / 2, by0 - Math.max(1.2, hpx), w, Math.max(1.2, hpx)); return; }
      if (kind < 2) {
        const lean = moving ? .1 : 0, bob = moving ? Math.abs(Math.sin(ph)) * .04 * sv : 0, alt = (ph * 7 | 0) & 1, sh = hpx < 16 && !rot ? MANS : alt ? MAN2 : MAN;
        poly(pa, sh, bx, by0 - bob, s, sv, dir, rot, lean);
        if (rot) return;
        if (kind === 1) { const sa = Math.sin(ph * 3.1) * .25; spearP.moveTo(bx + (.2 - sa * .3) * s * dir, by0 - .45 * sv); spearP.lineTo(bx + (.3 + lean * 2.6 + sa) * s * dir, by0 - (2.9 + sa * .3) * sv); }
        if (hpx >= 16 && elev > 0) { const [i0, i1] = (dir * sunSide > 0 ? RIMF : RIMB)[alt]; for (let i = i0; i <= i1; i++) { const u = (sh[i * 2] + lean * sh[i * 2 + 1]) * dir, X = bx + u * s, Y = by0 - bob - sh[i * 2 + 1] * sv; i === i0 ? rimP.moveTo(X, Y) : rimP.lineTo(X, Y); } }
      } else if (kind === 2) {
        poly(pa, HORSE, bx, by0, s, sv, dir); poly(pa, RIDER, bx - .1 * s * dir, by0, s, sv, dir);
        const sw = moving ? .5 : .08;
        [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o]) => { const a = Math.sin(ph + o) * sw; legP.moveTo(bx + hu * s * dir, by0 - 1.12 * sv); legP.lineTo(bx + (hu + a * .5) * s * dir, by0 - .52 * sv + Math.abs(a) * .2 * sv); legP.lineTo(bx + (hu + a * .3) * s * dir, by0); });
        spearP.moveTo(bx - .1 * s * dir, by0 - 1.9 * sv); spearP.lineTo(bx + 1.6 * s * dir, by0 - 3.2 * sv);
      } else if (kind === 3) {
        poly(pa, CAMEL, bx, by0, s, sv, dir);
        [[.68, 0], [.8, 1.6], [-.72, 3.1], [-.84, 4.7]].forEach(([hu, o]) => { legP.moveTo(bx + hu * s * dir, by0 - 1.28 * sv); legP.lineTo(bx + (hu + Math.sin(ph + o) * .04) * s * dir, by0); });
      } else poly(pa, kind === 4 ? KNEEL : TENT, bx, by0, s, sv, dir);
    };
    const lie = [];
    const rout = (o) => ease.in(seg(p, .68 + (o.d2 || 0), .8 + (o.d2 || 0)));
    const F_ = st.F;
    for (let i = 0; i < F_.length; i++) {
      const o = F_[i];
      let x = o.x0, z = o.z0, moving = false, dir = o.dir || (o.side ? -towardS : towardS), kind = o.kind;
      if (!o.fix) {
        if (o.side === 0) {
          if (o.sx !== undefined && p < .135) { // the night: all asleep but him; they wake toward dawn
            const w = seg(p, .085 + o.wake * .03, .105 + o.wake * .03);
            if (w < .45) { draw(0, 6, o.sx, o.sz, o.sd, 0, false, o.hs); continue; }
            if (w < 1) { draw(0, 7, mix(o.sx, o.x0, .3), mix(o.sz, o.z0, .3), towardS, 0, false, o.hs); continue; }
            x = mix(o.sx, o.x0, smooth(seg(p, .1 + o.wake * .03, .135))); z = mix(o.sz, o.z0, smooth(seg(p, .1 + o.wake * .03, .135))); moving = p < .135;
          }
          const a = ease.io(seg(p, .52 + o.d, .585 + o.d)); x = mix(x, o.x1, a); z = mix(z, o.z1, a); moving = moving || (a > 0 && a < 1);
          const g = ease.io(seg(p, .76 + o.d * 2, .88 + o.d * 2)); if (g > 0) { x = mix(x, o.x2, g); z = mix(z, o.z2, g); moving = moving || g < 1; }
          if (fight > 0 && z > 20) { x += Math.sin(t * 2 + o.ph + p * 60) * .6 * fight; }
        } else {
          const a = ease.io(seg(p, (o.kind === 2 ? .5 : .51) + o.d, (o.kind === 2 ? .56 : .58) + o.d)); x = mix(o.x0, o.x1, a); z = mix(o.z0, o.z1, a); moving = a > 0 && a < 1;
          if (o.ft < 2 && p >= o.ft) { lie.push([o.x1, o.z1, o.fa, o.ft]); continue; }
          if (o.ft > 2) {
            if (fight > 0) { const j = fight * (1 - rout(o)); x += Math.sin(t * 2 + o.ph + p * 60) * .8 * j; z += Math.cos(t * 1.7 + o.ph + p * 50) * .8 * j; }
            if (p > .56 && p < .67) { const dx = x - A[0], dz = z - A[2], dd = Math.hypot(dx, dz); if (dd < 12) { const k = (12 - dd) / 12 * 7; x += dx / (dd || 1) * k; z += dz / (dd || 1) * k; } } // the ranks give way where he passes
            const r = rout(o); if (r > 0) { if (r >= 1) continue; x = mix(x, o.x2, r); z = mix(z, o.z2, r); moving = true; dir = towardS; }
          }
        }
      }
      draw(o.side, kind, x, z, dir, o.ph + p * 260, moving, o.hs);
    }
    // the champions: three of Quraysh step out; Hamza and Ubayda beside Ali. Al-Walid goes down first.
    if (p > .1 && p < .5) {
      const out = smooth(seg(p, .12, .205)), back = smooth(seg(p, .34, .42));
      st.champ.forEach(([x0, side, fi], j) => {
        const z = side ? mix(108, 52.6, out) : mix(-12, mix(41, -10, back), out);
        const x = x0 + Math.sin(p * 70 + j) * .35 * seg(p, .2, .26);
        let rot = 0;
        if (side) { const f = st.fall[fi], k = seg(p, f.ft, f.ft + .01); if (k >= 1) { lie.push([f.x, f.z, f.a, f.ft]); return; } rot = -ease.in(k) * 1.45 * (side ? -towardS : towardS); }
        const walking = (out > 0 && out < 1) || (!side && back > 0 && back < 1);
        draw(side, 1, x, z, side || back > .5 ? -towardS : towardS, j + p * 300, walking, 1.04, rot, 0);
      });
    }
    // the fallen: low dark shapes on the sand
    lie.forEach(([x, z, a, ft]) => {
      const ca = Math.cos(a), sa = Math.sin(a), k = c01((p - ft) / .01);
      const pts = [[-1.05, -.34], [1.05, -.34], [1.05, .34], [-1.05, .34]].map(([u, v]) => (pj(x + ca * u - sa * v, .2, z + sa * u + ca * v) ? [PX, PY] : null));
      if (k <= 0 || pts.some((q) => !q)) return; fallP.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < 4; i++) fallP.lineTo(pts[i][0], pts[i][1]); fallP.closePath();
    });
    c.lineCap = 'round';
    c.strokeStyle = rgb([30, 20, 14], .14); c.lineWidth = Math.max(1, F / 380); c.stroke(shadowP);
    c.fillStyle = rgb(lerp([22, 15, 12], sandLit, .08), .95); c.fill(fallP);
    const tones = [lerp(sandLit.map((v) => v * .3), [52, 46, 38], .2), lerp(sandLit.map((v) => v * .14), [30, 16, 14], .3)];
    [1, 0].forEach((side) => [2, 1, 0].forEach((b) => { c.fillStyle = rgb(lerp(tones[side], haze0, Math.min(.75, fogOf([30, 170, 520][b])))); c.fill(body[side][b]); }));
    c.strokeStyle = rgb([28, 22, 18], .9); c.lineWidth = Math.max(.7, F / 1600); c.stroke(legP);
    c.strokeStyle = rgb([36, 28, 22], .75); c.lineWidth = .8; c.stroke(spearP);
    c.strokeStyle = rgb(lerp(sunC, [255, 240, 210], .3), .7 * c01(elev / 1.5) * c01(1.4 - elev / 16)); c.lineWidth = Math.max(.8, F / 1100); c.lineJoin = 'round'; c.stroke(rimP);
    // banners on their poles (the Quraysh banners go down in the rout)
    st.ban.forEach(([bx0, bz0, col, side, fallAt], j) => {
      const z = side ? mix(bz0, bz0 - 50, ease.io(seg(p, .51, .58))) : mix(bz0, 30, ease.io(seg(p, .52, .59)));
      const down = side ? ease.in(seg(p, fallAt, fallAt + .03)) : 0;
      if (p < .1 && !side) return; // raised at dawn
      if (!pj(bx0, 0, z)) return; const bx = PX, by0 = PY, s = F / PZ, fz = fogOf(PZ);
      const ang = down * 1.45 * (j % 2 ? 1 : -1), L = 4.6 * s, tx = bx + Math.sin(ang) * L, ty = by0 - Math.cos(ang) * L * (1 - Math.abs(sp) * .5);
      c.strokeStyle = rgb(lerp([42, 32, 24], haze0, fz)); c.lineWidth = Math.max(.8, .09 * s); c.beginPath(); c.moveTo(bx, by0); c.lineTo(tx, ty); c.stroke();
      const fl = Math.sin(t * 3 + j + p * 40) * .15 + (p > GUST[0] && p < GUST[1] ? .25 * Math.sin(Math.PI * seg(p, GUST[0], GUST[1])) : 0), w = 1.5 * s * (1 - down * .4), h2 = .95 * s;
      c.fillStyle = rgb(lerp(col, haze0, fz * .8)); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + w * .5, ty + h2 * fl, tx + w, ty + h2 * .1 + h2 * fl * 2); c.lineTo(tx + w * .96, ty + h2 * 1.05); c.quadraticCurveTo(tx + w * .5, ty + h2 * (1 + fl), tx + Math.sin(ang) * h2 * .3, ty + h2); c.closePath(); c.fill();
    });

    // ----- dust -----
    const bc = st.bc, BW = Math.max(8, Math.round(W / 6)), BH = Math.max(8, Math.round(H / 6));
    if (st.bloom.width !== BW || st.bloom.height !== BH) { st.bloom.width = BW; st.bloom.height = BH; }
    bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalCompositeOperation = 'source-over'; bc.clearRect(0, 0, BW, BH); bc.setTransform(BW / W, 0, 0, BH / H, 0, 0);
    const dustAll = smooth(seg(p, .5, .57)) * (1 - smooth(seg(p, .68, .745)));
    if (dustAll > 0) {
      st.puffs.forEach(([x, z, born, R0, ph, k, veil]) => {
        const age = (p - born) / .1; if (age <= 0) return;
        const a = Math.min(1, age * 2.5) * dustAll * (1 - c01((age - 1) / 1.6)) * (veil ? .16 : 1);
        if (a <= .01) return;
        const y = veil ? 2 + age * 1.5 : 1.5 + age * (3 + k * 7), r = R0 * (veil ? .8 + age * .3 : .6 + age * .8);
        if (!pj(x + Math.sin(ph + t * .2) * 2 + age * 7, y, z + age * 3)) return; const rr = r * F / PZ;
        const al = a * .42 * (1 - fogOf(PZ) * .4) * c01((PZ - 6) / (rr / (F / PZ) * 2.5 + 10)), back = c01(1 - Math.hypot(PX - SX, PY - SY) / (W * .7));
        c.globalAlpha = al * (1 - .5 * back); c.drawImage(st.puffD, PX - rr * 1.5, PY - rr * .9, rr * 3, rr * 2);
        c.globalAlpha = Math.min(1, al * (.7 + 1.1 * back)); c.drawImage(st.puff, PX - rr * 1.2 + sunSide * rr * .35, PY - rr * 1.15, rr * 2.4, rr * 1.7);
      });
      st.trail.forEach(([sd, u, r0]) => {
        const ch = seg(p, .5, .57); if (ch <= 0 || ch >= 1) return;
        if (!pj(sd * mix(160, 90, ch) + sd * u * 30, 1.2, mix(130, 70, ch) + u * 20)) return; const rr = r0 * F / PZ;
        c.globalAlpha = .4 * Math.sin(Math.PI * ch) * dustAll; c.drawImage(st.puff, PX - rr * 1.6, PY - rr, rr * 3.2, rr * 2);
      });
      c.globalAlpha = 1;
      const M = st.motes, n = M.length / 4;
      c.globalCompositeOperation = 'lighter'; c.fillStyle = rgb(lerp(sunC, [255, 240, 210], .3), dustAll * .3);
      c.beginPath();
      for (let i = 0; i < n; i++) {
        if (!pj(M[i * 4] + Math.sin(t * .3 + M[i * 4 + 3] * 40) * 1.5 + (p - .5) * 30, M[i * 4 + 2] * (.5 + dustAll) + .5, M[i * 4 + 1])) continue;
        if (PX < 0 || PX > W || PY < 0 || PY > H) continue;
        const s = Math.max(.6, Math.min(1.5, F / PZ * .05)); c.rect(PX, PY, s, s);
      }
      c.fill();
      // blades catching the low sun along the front
      c.fillStyle = 'rgba(255,246,222,.9)';
      c.beginPath();
      st.flick.forEach(([x, z, y, k], i) => {
        const b = Math.sin(t * 7 + k * 60 + p * 900) * Math.sin(t * 3.1 + i + p * 400); if (b < .86 * (2 - fight)) return;
        if (!pj(x, y, z)) return; const s = Math.max(1, Math.min(3, F / PZ * .08)); c.rect(PX - s / 2, PY - s / 2, s, s);
        bc.fillStyle = 'rgba(255,236,200,.35)'; bc.fillRect(PX - 2, PY - 2, 4, 4);
      });
      c.fill(); c.globalCompositeOperation = 'source-over';
    }
    const gl = (x, y, z, r, col, a, min = 0, max = 1e4) => { if (!pj(x, y, z)) return false; const rr = Math.min(max, Math.max(min, r * F / Math.max(PZ, 6))); c.globalAlpha = Math.min(1, a); c.drawImage(tint(col), PX - rr, PY - rr, rr * 2, rr * 2); c.globalAlpha = 1; return true; };
    // ----- the cloud lit from within, over his ranks -----
    if (cloudA > .01) {
      const L = st.lobes.map(([x, y, z, r]) => { if (!pj(x, cloudY + y, z)) return null; const rr = r * F / PZ; return PX + rr * 1.7 < 0 || PX - rr * 1.7 > W || PY + rr * .7 < 0 || PY - rr * .7 > H ? null : [PZ, PX, PY, rr, y]; }).filter(Boolean).sort((a, b) => b[0] - a[0]); // only the lobes on screen
      const glowL = [];
      L.forEach(([zc, x, y, rr, ly]) => { c.globalAlpha = cloudA * .9 * (1 - fogOf(zc) * .3); c.drawImage(st.cloudS, x - rr * 1.7, y - rr * .7, rr * 3.4, rr * 1.4); if (ly < 6) glowL.push([x, y, rr]); });
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'lighter';
      // its underside lit, as if from inside
      glowL.forEach(([x, y, rr]) => { c.globalAlpha = .16 * cloudA * cloudK; c.drawImage(tint('#ffe4b0'), x - rr * 1.5, y - rr * .2, rr * 3, rr * .9); });
      // flashes inside it, and now and then a thin bolt
      st.flash.forEach(([x, z, ph, r], i) => {
        const f = (.25 + .75 * Math.max(pulse(p * 260 + ph + t * 2.6), .8 * pulse(p * 410 + ph * 3 + t * 4.1))) * cloudA * cloudK;
        if (f <= .02) return;
        if (pj(x, cloudY + 4, z)) { const rr = Math.min(900, 26 * r * F / Math.max(PZ, 6)); c.globalAlpha = Math.min(1, f * .42); c.drawImage(tint('#ffeccc'), PX - rr * 1.6, PY - rr * .45, rr * 3.2, rr * .9); c.globalAlpha = 1; }
        if (f > .7 && pj(x, cloudY - 1, z)) {
          let bx = PX, by2 = PY; const s = F / PZ; c.strokeStyle = `rgba(255,250,236,${Math.min(1, f) * .85})`; c.lineWidth = Math.max(.8, s * .12); c.beginPath(); c.moveTo(bx, by2);
          st.bolts[i].forEach(([dx, k], j) => { bx += dx * s * .7; by2 += (cloudY * .07 + k * 2) * s; if (j < 5) c.lineTo(bx, by2); });
          c.stroke();
        }
      });
      // shafts of light down onto the ranks, soft-edged, and the ground they light
      if (shaftA > 0) {
        if (!st.shaftS) { const sc = mk(64, 256), g = sc.getContext('2d'), id = g.createImageData(64, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) { const v = Math.exp(-(((x - 31.5) / 13) ** 2)) * smooth(c01(y / 70)) * (.55 + .45 * smooth(y / 230)) * (1 - smooth(c01((y - 236) / 20)) * .6), o = (y * 64 + x) * 4; id.data[o] = 255; id.data[o + 1] = 238; id.data[o + 2] = 204; id.data[o + 3] = v * 255; } g.putImageData(id, 0, 0); st.shaftS = sc; }
        st.shafts.forEach(([x, z, w, k], i) => {
          const a = shaftA * (.26 + .36 * k) * (.8 + .2 * Math.sin(t * .8 + i + p * 40));
          if (!pj(x, cloudY - 2, z)) return; const tx = PX, ty = PY, tw = w * F / PZ; if (!pj(x, 0, z)) return; const bw = w * 1.6 * F / PZ;
          const len = Math.hypot(PX - tx, PY - ty); if (len < 4) return;
          c.save(); c.translate(tx, ty); c.rotate(Math.atan2(PX - tx, PY - ty) * -1); c.globalAlpha = a; c.drawImage(st.shaftS, -Math.max(tw, bw) / 2, 0, Math.max(tw, bw), len); c.restore();
        });
        const Lg = st.light, n = Lg.length / 4;
        c.fillStyle = `rgba(255,236,196,${.7 * shaftA})`; c.beginPath();
        for (let i = 0; i < n; i++) {
          const fall = (p * 26 + Lg[i * 4 + 2] + t * .03) % 1, y = (cloudY - 2) * (1 - fall);
          if (!pj(Lg[i * 4], y, Lg[i * 4 + 1])) continue; if (PX < 0 || PX > W || PY < 0 || PY > H) continue;
          const s = Math.max(.7, Math.min(2.2, F / PZ * .06)) * (.6 + .6 * Lg[i * 4 + 3]); c.rect(PX - s / 2, PY - s / 2, s, s);
        }
        c.fill();
        gl(0, 1, -16, 60, '#ffe9bf', .18 * shaftA, 40, 1400);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    // ----- the handful of pebbles, and the wind that drives into Quraysh -----
    const thr = seg(p, THROW[0], THROW[1]), gust = seg(p, GUST[0], GUST[1]), PP = prophetAt(p), ph0 = height(PP[0], PP[2]);
    if (thr > 0 && thr < 1) {
      st.pebs.forEach(([tx, tz, arc, k]) => {
        const u = c01((thr - k * .12) / .88); if (u <= 0 || u >= 1) return; const e = ease.out(u);
        const at = (v) => { const ee = ease.out(v); return pj(mix(PP[0] + .35, tx, ee), mix(ph0 + 1.75, 1.4, ee) + Math.sin(Math.PI * v) * arc, mix(PP[2] + .5, tz, ee)); };
        if (!at(Math.max(0, u - .012))) return; const ax = PX, ay = PY; if (!at(u)) return; void e;
        const s = Math.max(1.8, Math.min(3.6, F / PZ * .09)), al = Math.sin(Math.PI * u) ** .3;
        c.strokeStyle = rgb(lerp(sandLit, [255, 240, 214], .4), al * .4); c.lineWidth = s * .45; c.beginPath(); c.moveTo(ax, ay); c.lineTo(PX, PY); c.stroke();
        c.fillStyle = rgb([58, 46, 34], al); c.beginPath(); c.arc(PX, PY, s / 2, 0, TAU); c.fill();
      });
      c.globalCompositeOperation = 'source-over';
    }
    if (gust > 0 && gust < 1) {
      // a low wall of sand runs out from his ranks into Quraysh, and ribbons of blown sand stream past toward it
      const ga = Math.sin(Math.PI * gust), e = ease.io(gust), front = mix(20, 250, e);
      st.gustP.forEach(([x, dz, r0, ph, k]) => {
        if (!pj(x + Math.sin(ph + p * 30) * 4, 1.2 + k * 4, front - dz)) return; const rr = r0 * (1 + e) * F / PZ;
        c.globalAlpha = .34 * ga * (1 - fogOf(PZ) * .5); c.drawImage(st.puffD, PX - rr * 1.6, PY - rr * 1.1, rr * 3.2, rr * 1.9);
        c.globalAlpha = .12 * ga; c.drawImage(st.puff, PX - rr * 1.3, PY - rr * 1.3, rr * 2.6, rr * 1.5);
      });
      c.globalAlpha = 1;
      c.strokeStyle = rgb(lerp(sandLit, [255, 246, 226], .55), .5 * ga); c.lineWidth = 1; c.beginPath();
      st.wind.forEach(([x, z0, y, L, k]) => {
        const z = z0 + ((gust * (1.6 + k) + k) % 1) * 140; if (z > front) return; if (!pj(x, y, z)) return; const ax = PX, ay = PY; if (!pj(x, y + .15, z - L)) return;
        c.moveTo(ax, ay); c.lineTo(PX, PY);
      });
      c.stroke();
    }
    // ----- the Prophet and Ali: veiled figures, the gold disc behind the head (scenes/holy.js) -----
    const dim = 1 - smooth(c01((elev + 4) / 9)), famb = 1 - .7 * dim, vs = 1 - Math.abs(sp) * .5, heads = [];
    const place = (x, y, z, m, min) => (pj(x, y, z) ? { x: PX, y: PY, z: PZ, h: Math.max(min, m * F / PZ * vs) } : null);
    const flipTo = (x, z, dx, dz) => { if (!pj(x, 0, z)) return false; const x0 = PX; return pj(x + dx, 0, z + dz) && PX < x0; }; // does (dx, dz) run to screen-left?
    const figs = [];
    if (pj(ARISH[0], ah, ARISH[2])) { figs.push([PZ + .3, () => shelter('back')]); figs.push([PZ - 1.4, () => shelter('front')]); }
    if (pj(TREE[0], th, TREE[2])) figs.push([PZ, tree]);
    // the Prophet: the night prayer at the tree; the command; his hands raised before the shelter; the handful thrown
    const fP = place(PP[0], ph0, PP[2], 1.85, 30);
    if (fP) {
      const south = flipTo(PP[0], PP[2], 0, 5), sd = south ? -1 : 1, hang = [[-.2, -.42], [.2, -.42]];
      let pose = 'stand', arms = null, phase = 0, flip = false;
      const armsTo = (to, k) => hang.map((h, i) => [mix(h[0], to[i][0], k), mix(h[1], to[i][1], k)]);
      if (p < .105) {
        if (p >= .012 && p < .03) { pose = 'ruku'; flip = south; }
        else if (p >= .038 && p < .062) { pose = 'sujud'; flip = south; }
        else if (p >= .07) arms = armsTo([[-.1, -.72], [.1, -.72]], smooth(seg(p, .07, .08))); // the du'a, hands lifted before him
      } else if (p < .14) { pose = 'walk'; phase = (p - .105) / .035 * 2.5; }
      else if (p < .215) { const k = smooth(seg(p, .145, .16)) * (1 - smooth(seg(p, .2, .215))); if (k > 0) arms = [hang[0], [mix(.2 * sd, .44 * sd, k), mix(-.42, -.9, k)]]; } // «قم يا علي…»
      else if (p > .37 && p < .555) { const k = smooth(seg(p, .37, .392)) * (1 - smooth(seg(p, .535, .555))); arms = armsTo([[-.16, -1.07], [.16, -1.07]], k); } // «ثم رفع يده إلى السماء»
      else if (p >= .645 && p < THROW[0] - .002) { pose = 'ruku'; flip = south; } // he takes up the handful
      else if (p >= THROW[0] - .002 && p < .72) { const k = ease.out(seg(p, THROW[0] - .002, THROW[0] + .008)), back = smooth(seg(p, .69, .72)); arms = [hang[0], [mix(mix(.04 * sd, .46 * sd, k), .2 * sd, back), mix(mix(-.36, -1.0, k), -.42, back)]]; }
      figs.push([fP.z, () => heads.push([Holy.draw(c, { who: 'prophet', pose, phase, arms, flip, x: fP.x, y: fP.y, h: fP.h, t, amb: famb }), 1])]);
    }
    // Ali: asleep at night with the rest; out between Hamza and Ubayda, the strike at al-Walid, back to the line, then
    // his way through the ranks, a stroke at every few paces
    const fA = place(A[0], 0, A[2], 1.8, 18);
    if (fA) {
      let pose = 'stand', phase = 0, fl = flipTo(A[0], A[2], 0, 5), sword = true;
      if (p < .095) { pose = 'lie'; sword = false; fl = false; }
      else if (p < .112) { pose = 'sit'; sword = false; }
      else if (p >= .12 && p < .205) { pose = 'walk'; phase = 53 * smooth(seg(p, .12, .205)) / 1.5; }
      else if (p >= .268 && p < .3) { pose = 'fight'; phase = .5 * ease.io(seg(p, .268, .283)); }
      else if (p >= .34 && p < .42) { pose = 'walk'; phase = 54 * smooth(seg(p, .34, .42)) / 1.5; }
      else if (p >= .5 && p < .565) { pose = 'walk'; phase = 60 * smooth(seg(p, .5, .565)) / 1.5; }
      else if (p >= .565 && p < .67) {
        const u = aliU(p), q = pathAt(Math.min(1, u + .01)), cyc = u * 24, f = cyc % 1;
        fl = flipTo(A[0], A[2], q[0] - A[0], q[1] - A[2]) || (Math.abs(q[0] - A[0]) + Math.abs(q[1] - A[2]) < .01 && fl);
        if (f < .45) { pose = 'walk'; phase = (Math.floor(cyc) + f / .45) * .5; } else { pose = 'fight'; phase = (f - .45) / .55; }
      } else if (p >= .67) { const q = pathAt(.99); fl = flipTo(A[0], A[2], A[0] - q[0], A[2] - q[1]); }
      figs.push([fA.z, () => heads.push([Holy.draw(c, { who: 'ali', pose, phase, sword, plain: true, flip: fl, x: fA.x, y: fA.y, h: fA.h, t, amb: famb }), .8])]);
    }
    figs.sort((u, v) => v[0] - u[0]).forEach(([, f]) => f());
    // the discs carry a little light into the night and the dawn haze
    heads.forEach(([hd, k]) => { if (!hd) return; bc.fillStyle = `rgba(255,226,170,${k * (.22 + .45 * dim)})`; bc.beginPath(); bc.arc(hd.x, hd.y, Math.max(8, hd.r * 4), 0, TAU); bc.fill(); });
    c.globalCompositeOperation = 'lighter';
    // al-Walid's fall: one soft bloom, no rays
    const fl = Math.max(0, 1 - Math.abs(p - .283) / .01);
    if (fl > 0) { gl(MEET[0], 1.3, MEET[2] + 1.4, 5, '#fff0d2', .8 * fl, 20, 220); c.fillStyle = `rgba(255,226,180,${.05 * fl})`; c.fillRect(0, 0, W, H); }
    c.globalAlpha = .7; c.drawImage(st.bloom, 0, 0, W, H); c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    // ----- grade: a gentle vignette -----
    const vg = c.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .3, W / 2, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(8,8,10,0)'); vg.addColorStop(1, 'rgba(8,7,8,.58)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
