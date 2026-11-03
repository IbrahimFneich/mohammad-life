(() => {
// khandaq: the trench north of Medina, winter of 5 AH. World in metres: x east, y up, z north. The trench runs
// east-west (z = 0..9) with a narrow point at x = 122. The camp of the Confederates fills the north out to the
// horizon; the Muslim line, the palms and the mud-brick houses of Medina lie south, the hill of Sal' to the west.
// A low winter sun stands east-south-east. The Prophet ﷺ and Ali are veiled figures with a gold disc (scenes/holy.js);
// everyone else is a faceless silhouette; no face is ever drawn. Sources: Tafsir al-Qummi 2:177-187.
// Beats, in scroll progress p (the scene is 1300vh):
//   -.05-.20  the trench is dug, the plain to the north still empty. The camera comes down to the Prophet digging with a
//             pick in the Muhajirun's section (DIG), Ali carrying the earth out of the cut; diggers along both lips.
//    .20-.33  the rock in the cut: three strikes of his pick (S1-S3), three flashes, three far palaces in the light;
//             the rock pours away like sand.
//    .33-.45  the Confederates arrive and fill the north (camp in by campK); the Muslims fall back to their line; the
//             Prophet stands in front of it (PRO), Ali beside him.
//    .45-.52  the dark rider gallops, leaps the narrow point, rears, calls the challenge.
//    .52-.60  the Prophet calls Ali, turbans him with his own hand, gives him Dhul-Fiqar, raises his hands for him.
//    .60-.70  Ali goes out on foot; they circle; one flash (FLASH_N); the rider falls; the camp falters. Dusk.
//    .70-.81  night: the Prophet on the shoulder of Sal' (SAL), hands raised, the camp's fires below.
//    .81-.92  the westerly wind (al-dabur) comes from behind him and sweeps the camp west to east; it stops at the trench.
//    .92-1.05 a clear, cold, empty night over Medina.
// The rider's choreography keeps its original timing in duel time q = plin(DUEL_Q, p) (the old scene's p).
const FLASH = .47, FLASH_N = .675, D = [128, 0, -17], DEEP = 4.6, NEAR = 1;
const plin = (K, p) => { if (p <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (p <= K[i][0]) return mix(K[i - 1][1], K[i][1], (p - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
const DUEL_Q = [[.45, .115], [.51, .29], [.6, .291], [.615, .314], [.66, .44], [FLASH_N, FLASH], [.7, .53], [.74, .62]];
const S1 = .262, S2 = .279, S3 = .296; // the three strikes on the rock
const DIG = [30, 0, -.55], ROCK = [30.9, -.55, 2.5], PRO = [116, 0, -28], ALI_S = [118.4, 0, -31.2], ALI_T = [117.25, 0, -28.6];
const WALL0 = .815, WALL1 = .905; // the westerly front crosses the camp from x = -900 to 3900
const salY = (x) => 74 * Math.exp(-(((x - -470) / 190) ** 2)) * (1 + .07 * Math.sin(x * .047) + .04 * Math.sin(x * .13)) + 18 * Math.exp(-(((x - -230) / 70) ** 2));
const salZ = (x) => -330 + 30 * Math.sin(x * .008);
const SAL = [-262, salY(-262), salZ(-262)];
const SUN = (() => { const v = [.963, .078, -.258], l = Math.hypot(...v); return v.map((x) => x / l); })();
const SUN_AZ = Math.atan2(SUN[2], SUN[0]);
const SHX = -SUN[0] / Math.hypot(SUN[0], SUN[2]), SHZ = -SUN[2] / Math.hypot(SUN[0], SUN[2]), SHL = Math.hypot(SUN[0], SUN[2]) / SUN[1];
const v3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => {
  const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i;
  const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)];
  return [0, 1, 2].map((j) => cr1(a[j], b[j], c[j], d[j], f));
};
const hash = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const mixc = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const rgb = (a, k = 1) => `rgba(${Math.min(255, a[0]) | 0},${Math.min(255, a[1]) | 0},${Math.min(255, a[2]) | 0},${k})`;
const lerpAny = (a, b, k) => (Array.isArray(a) ? a.map((x, i) => mix(x, b[i], k)) : mix(a, b, k));
const keyv = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerpAny(v, B[j + 1], k)); };
const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
const sprite = (stops, n = 64) => { const cv = mk(n, n), g = cv.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return cv; };
function mono(xs, ys) { // monotone cubic through (xs, ys): smooth, and never overshoots between far-apart keys
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (!d[i]) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], q = a * a + b * b; if (q > 9) { const k = 3 / Math.sqrt(q); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return (x) => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

// the trench lips: a long ditch with a narrow point at x = 122
const zS = (x) => .6 * Math.sin(x * .013) + .4 * Math.sin(x * .041 + 1);
const zN = (x) => 9 + .7 * Math.sin(x * .017 + 2) + .4 * Math.sin(x * .05) - 3.6 * Math.exp(-(((x - 122) / 14) ** 2));

// ---------- camera keys: [p, eye, look, zoom] ----------
const CAM = [
  [-.06, [380, 150, -1150], [340, 0, 500], .95],
  [0, [372, 140, -1120], [330, 0, 500], .95],
  [.05, [150, 46, -300], [44, 0, 30], 1],
  [.09, [48, 5, -9.6], [14, .1, 1.2], 1.4],
  [.19, [47, 4.7, -9.2], [14, .2, 1.2], 1.48],
  [.23, [14.5, 4.4, -7.4], [38, 1.1, 3], 1.4],
  [.31, [15, 4.3, -7.2], [38, 1.2, 3], 1.42],
  [.345, [40, 14, -60], [90, 0, 80], 1],
  [.38, [124, 5.4, -52], [138, 0, 300], 1],
  [.44, [123, 4.2, -46], [136, 0, 260], 1.05],
  [.47, [52, 4.6, -36], [130, 1.4, 3], 1.2],
  [.505, [60, 2.6, -27], [133, 1.6, -12], 1.55],
  [.53, [105.5, 1.75, -34.5], [118.4, 1.45, -28.4], 1.8],
  [.58, [105, 1.75, -35], [118.4, 1.45, -28.4], 1.8],
  [.615, [84, 2.3, -33], [124, 1.6, -22], 1.5],
  [.655, [80, 1.95, -26], [126, 1.9, -20], 1.75],
  [FLASH_N, [81, 1.85, -25.5], [127, 2.1, -19.5], 1.8],
  [.7, [92, 3.1, -28], [126, .9, -19], 1.5],
  [.735, [-120, 60, -470], [60, 0, 160], .95],
  [.77, [-264, 38.7, -367], [186, -10, 523], 1.15],
  [.828, [-265.5, 39, -369], [186, -10, 523], 1.1],
  [.865, [-150, 30, -260], [560, 80, 560], .92],
  [.9, [-60, 24, -170], [800, 70, 520], .95],
  [.94, [330, 70, -640], [380, 0, 560], .97],
  [1, [394, 170, -1180], [420, 0, 620], .95],
  [1.06, [395, 171, -1182], [420, 0, 620], .95],
];
const CS = (() => { const xs = CAM.map((k) => k[0]); return [0, 1, 2].map((j) => mono(xs, CAM.map((k) => k[1][j]))).concat([0, 1, 2].map((j) => mono(xs, CAM.map((k) => k[2][j]))), [mono(xs, CAM.map((k) => k[3]))]); })();
const camAt = (p) => ({ eye: [CS[0](p), CS[1](p), CS[2](p)], look: [CS[3](p), CS[4](p), CS[5](p)], zoom: CS[6](p) });
// ---------- light keys: p, sky top, sky horizon, haze, far ground, near ground, sun, fires, night, storm ----------
const LK = [
  [-.06, [17, 27, 52], [146, 128, 122], [114, 102, 98], [88, 76, 70], [43, 38, 35], .85, .9, 0, 0],
  [.06, [20, 31, 56], [150, 132, 126], [120, 106, 100], [104, 88, 76], [76, 64, 54], .95, .9, 0, 0],
  [.3, [22, 33, 58], [148, 134, 132], [128, 112, 104], [104, 88, 76], [74, 62, 52], 1, .85, 0, 0],
  [.38, [22, 33, 58], [148, 134, 132], [128, 112, 104], [94, 78, 68], [45, 39, 35], 1, .85, 0, 0],
  [.62, [28, 42, 70], [150, 140, 136], [136, 120, 110], [100, 84, 72], [46, 39, 34], 1, .8, 0, 0],
  [.7, [30, 34, 50], [146, 116, 100], [124, 104, 94], [86, 70, 60], [30, 26, 23], .55, .9, 0, 0],
  [.74, [12, 16, 32], [70, 60, 72], [58, 56, 68], [42, 40, 48], [19, 19, 23], .02, 1, .55, 0],
  [.775, [6, 10, 24], [34, 42, 66], [30, 36, 56], [28, 32, 44], [12, 14, 20], 0, 1, 1, 0],
  [.81, [6, 10, 24], [36, 42, 62], [32, 36, 54], [28, 31, 42], [12, 14, 19], 0, 1, .95, .1],
  [.845, [12, 12, 18], [62, 52, 48], [54, 48, 46], [36, 32, 30], [16, 14, 14], 0, .95, .6, .85],
  [.89, [10, 12, 20], [50, 50, 58], [44, 44, 52], [30, 31, 36], [14, 15, 18], 0, .3, .8, .5],
  [.94, [6, 11, 26], [40, 54, 84], [36, 46, 70], [38, 44, 58], [14, 17, 24], 0, 0, 1, 0],
  [1.06, [6, 11, 26], [40, 54, 84], [36, 46, 70], [38, 44, 58], [14, 17, 24], 0, 0, 1, 0],
];
const FOG = [[-.06, 3600], [.6, 3800], [.72, 3000], [.8, 2600], [.845, 1050], [.89, 1300], [.94, 6000], [1.06, 6000]];

// ---------- the dark rider and Ali ----------
const RUN = [[56, 0, 172], [77, 0, 116], [101, 0, 58], [116.5, 0, 22], [121, 0, 9.6]];
const LAND = [124.6, 0, -3.4];
const IN = [[124.6, 0, -3.4], [127.4, 0, -8.6], [130.4, 0, -12.6], [132, 0, -14.6]];
const STAND = IN[3], M0 = [130.4, 0, -14.9];
const RM0 = Math.hypot(M0[0] - D[0], M0[2] - D[2]), AM0 = Math.atan2(M0[2] - D[2], M0[0] - D[0]);
const AEND = Math.PI / 2 + TAU;
const ARR = (x) => WALL0 + (WALL1 - WALL0) * c01((x + 900) / 4800); // when the westerly front reaches x
const tri = (u) => 1 - Math.abs(((u % 1) + 1) % 1 * 2 - 1); // 0 → 1 → 0 over each unit of u
const campK = (p, h) => smooth(seg(p, .345 + .055 * h, .375 + .055 * h)); // the Confederates arrive, h in [0, 1)
const pathLen = (pts, n = 60) => { let L = 0, q = crv(pts, 0); for (let i = 1; i <= n; i++) { const r = crv(pts, (pts.length - 1) * i / n); L += Math.hypot(r[0] - q[0], r[2] - q[2]); q = r; } return L; };
const RUN_L = pathLen(RUN), IN_L = pathLen(IN);
function amr(p) { // the horse: h (feet), v (heading), gait, ph, pitch, ha; the man: m (feet), fall, ma
  const o = { h: STAND, v: [1, 0, 0], gait: 'stand', ph: 0, pitch: 0, ha: 1, m: null, mounted: true, fall: 0, ma: 1 };
  if (p < .115) { o.h = RUN[0]; o.v = [.3, 0, -1]; }
  else if (p < .2) { const k = seg(p, .115, .2), u = k * k * .3 + k * .7; o.h = crv(RUN, 4 * u); o.v = v3.sub(crv(RUN, Math.min(4, 4 * u + .02)), crv(RUN, Math.max(0, 4 * u - .02))); o.gait = 'gallop'; o.ph = u * RUN_L / 5.8; }
  else if (p < .222) { const k = seg(p, .2, .222); o.h = [mix(RUN[4][0], LAND[0], k), 1.75 * 4 * k * (1 - k), mix(RUN[4][2], LAND[2], k)]; o.v = v3.sub(LAND, RUN[4]); o.gait = 'leap'; o.pitch = .32 * Math.cos(Math.PI * k); o.ph = k; }
  else if (p < .258) { const k = ease.out(seg(p, .222, .258)); o.h = crv(IN, 3 * k); o.v = v3.sub(crv(IN, Math.min(3, 3 * k + .03)), crv(IN, Math.max(0, 3 * k - .03))); o.gait = 'gallop'; o.ph = RUN_L / 5.8 + k * IN_L / 4.6; }
  else if (p < .29) { const k = seg(p, .258, .29); o.v = v3.sub(IN[3], IN[2]); o.gait = 'rear'; o.pitch = .62 * Math.sin(Math.PI * k) ** .8; o.ph = k; }
  else { o.v = v3.sub(IN[3], IN[2]); o.ph = p * 40; }
  // he slides from the saddle as Ali comes out; the horse runs off east into the dust
  const dm = smooth(seg(p, .292, .314));
  if (dm > 0) {
    o.mounted = false;
    const off = seg(p, .31, .44);
    if (off > 0) { o.h = [mix(STAND[0], 176, off), 0, mix(STAND[2], -25, off)]; o.v = [1, 0, -.2]; o.gait = 'gallop'; o.ph = off * 50 / 4.8; o.ha = 1 - smooth(seg(p, .37, .44)); }
    let m;
    const saddle = [STAND[0], 1.5, STAND[2]];
    if (p < .314) m = [mix(saddle[0], M0[0], dm), saddle[1] * (1 - dm) ** 1.5, mix(saddle[2], M0[2], dm)];
    else if (p < .44) { const k = seg(p, .314, .44), a = mix(AM0, AEND, k), r = mix(RM0, 3.1, k); m = [D[0] + Math.cos(a) * r, 0, D[2] + Math.sin(a) * r]; }
    else { const k = ease.in(seg(p, .44, FLASH)); m = [D[0], 0, D[2] + mix(3.1, .75, k)]; }
    o.m = m; o.fall = smooth(seg(p, FLASH + .006, FLASH + .05)); o.ma = 1 - .5 * smooth(seg(p, .58, .72));
  }
  return o;
}
// Ali in new p: carrying earth out of the cut at DIG (a full basket out to the spoil, an empty one back), watching the
// rock, beside the Prophet, called to him, then out to the ring and the old duel path in duel time q
const aliCarry = (p) => (p + .01) / .05;
function aliAt(p) {
  if (p < .2) { const u = tri(aliCarry(p)); return [mix(32, 35, u), 0, mix(-2.6, -7.5, u)]; }
  if (p < .335) return [34.3, 0, -2.4];
  if (p < .52) return ALI_S;
  if (p < .6) return v3.add(ALI_S, v3.mul(v3.sub(ALI_T, ALI_S), smooth(seg(p, .52, .535))));
  const q = plin(DUEL_Q, p), a0 = AM0 + Math.PI, r0 = RM0 * .6;
  if (q < .314) { const k = smooth(seg(p, .6, .615)); return crv([ALI_T, [122.5, 0, -24.5], [D[0] + Math.cos(a0) * r0, 0, D[2] + Math.sin(a0) * r0]], 2 * k); }
  if (q < .44) { const k = seg(q, .314, .44), a = mix(AM0, AEND, k) + Math.PI, r = mix(RM0, 3.1, k) * .6; return [D[0] + Math.cos(a) * r, 0, D[2] + Math.sin(a) * r]; }
  const k = ease.in(seg(q, .44, FLASH)); return [D[0], 0, D[2] - mix(1.86, .45, k)];
}
// the Prophet: where he stands in new p (the dig, the line, the hill of Sal'), and the swing of his pick (0 raised, 1 struck)
const proAt = (p) => (p < .335 ? DIG : p < .72 ? PRO : SAL);
function pickSwing(p) {
  if (p < .2) { const f = (((p - .03) / .016) % 1 + 1) % 1; return f < .6 ? 1 - smooth(f / .6) : f < .66 ? 0 : ease.in(c01((f - .66) / .14)); }
  let s = 1;
  [S1, S2, S3].forEach((k) => { if (p > k - .013 && p < k + .002) s = p < k - .003 ? 1 - smooth(seg(p, k - .013, k - .004)) : ease.in(seg(p, k - .003, k)); });
  return s;
}

// ---------- silhouettes in local metres (u forward, v down) ----------
const HORSE = [[-1.05, -1.45], [-.6, -1.52], [.2, -1.46], [.55, -1.56], [.85, -1.95], [1.05, -2.15], [1.1, -2.32], [1.17, -2.14], [1.48, -1.8], [1.52, -1.66], [1.3, -1.68], [1.0, -1.78], [.85, -1.38], [.72, -1.06], [-.2, -.98], [-.85, -1.04], [-1.12, -1.22]];
const LEGS = [[.62, -1.08, 1, .45], [.46, -1.08, 1, .55], [-.8, -1.12, 0, 0], [-.64, -1.12, 0, .1]]; // hip u, v, front?, gallop phase

S.khandaq = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.bloom = mk(8, 8); st.bc = st.bloom.getContext('2d');
    st.puffW = sprite([[0, 'rgba(206,178,144,.8)'], [.45, 'rgba(206,178,144,.32)'], [1, 'rgba(206,178,144,0)']]);
    st.puffD = sprite([[0, 'rgba(86,68,52,.9)'], [.5, 'rgba(86,68,52,.4)'], [1, 'rgba(86,68,52,0)']]);
    st.smoke = sprite([[0, 'rgba(150,144,140,.65)'], [.5, 'rgba(150,144,140,.22)'], [1, 'rgba(150,144,140,0)']]);
    st.wall = mk(8, 8); st.wc = st.wall.getContext('2d');
    st.wallS = sprite([[0, 'rgba(70,53,41,.95)'], [.55, 'rgba(70,53,41,.6)'], [1, 'rgba(70,53,41,0)']]);
    st.wallL = sprite([[0, 'rgba(132,104,80,.85)'], [.55, 'rgba(132,104,80,.45)'], [1, 'rgba(132,104,80,0)']]);
    st.glowS = sprite([[0, 'rgba(255,214,150,1)'], [.2, 'rgba(255,160,80,.5)'], [1, 'rgba(255,120,40,0)']]);
    const R = rng(55), F32 = (n) => new Float32Array(n);
    const gs = () => (R() + R() + R() - 1.5) / 1.5;
    // camp knots: each tribe and clan its own cluster of tents
    const cl = [[330, 330, 110], [640, 270, 95], [120, 420, 90], [-260, 360, 100]];
    for (let i = 0; i < 58; i++) { const z = 220 + R() ** 1.45 * 5200; cl.push([-1700 + R() * 5400 + z * .15, z, 50 + R() * 110 + z * .028]); }
    st.cl = cl;
    const NT = 1650; const T = st.T = { n: NT, x: F32(NT), z: F32(NT), w: F32(NT), h: F32(NT), ty: new Uint8Array(NT), tear: F32(NT), fly: new Uint8Array(NT), v: F32(NT) };
    for (let i = 0; i < NT; i++) {
      const k = cl[i < 160 ? i % 4 : Math.floor(R() * cl.length)], a = R() * TAU, r = Math.sqrt(R()) * k[2];
      T.x[i] = k[0] + Math.cos(a) * r * 1.9; T.z[i] = Math.max(185, k[1] + Math.sin(a) * r);
      const ty = R() < .64 ? 0 : R() < .5 ? 1 : 2; T.ty[i] = ty;
      T.w[i] = ty === 0 ? 8 + R() * 9 : ty === 1 ? 5 + R() * 3 : 4 + R() * 2.2; T.h[i] = ty === 0 ? 2 + R() * .8 : ty === 1 ? 3.1 + R() * 1.1 : 2.9 + R();
      T.tear[i] = ARR(T.x[i]) + R() * .01; T.fly[i] = R() < .42 ? 1 : 0; T.v[i] = R();
    }
    // people: 0 = the Confederates on foot, 1 = their horses (mounted or tethered), 2 = the Muslim line on foot
    const NC = 3500, NH = 1000, NM = 1250, NG = NC + NH + NM;
    const G = st.G = { n: NG, nc: NC, nh: NH, x: F32(NG), z: F32(NG), ty: new Uint8Array(NG), d: F32(NG), hh: F32(NG), front: new Uint8Array(NG), dir: new Int8Array(NG), rider: new Uint8Array(NG) };
    const corridor = (x, z) => x > 40 && x < 136 && z < 190;
    for (let i = 0; i < NG; i++) {
      let x, z, ty = i < NC ? 0 : i < NC + NH ? 1 : 2, front = 0;
      if (ty === 2) { // in knots along the south lip, thicker towards the narrow point
        do { x = R() < .35 ? 122 + gs() * 260 : -950 + R() * 2600; z = -(30 + R() ** 1.25 * 78); } while (x > 36 && x < 152 && z > -62);
      } else if (R() < (ty === 1 ? .72 : .42)) { // the lines facing the trench
        do { x = R() < .4 ? 160 + gs() * 420 : -1200 + R() * 3000; z = 15 + R() ** 1.7 * 135; } while (corridor(x, z));
        front = 1;
      } else {
        const k = cl[Math.floor(R() * cl.length)], a = R() * TAU, r = Math.sqrt(R()) * k[2] * 1.15;
        x = k[0] + Math.cos(a) * r * 1.9; z = Math.max(180, k[1] + Math.sin(a) * r);
      }
      G.x[i] = x; G.z[i] = z; G.ty[i] = ty; G.front[i] = front; G.d[i] = R(); G.hh[i] = R();
      G.dir[i] = R() < .5 ? -1 : 1; G.rider[i] = ty === 1 && front && R() < .7 ? 1 : 0;
    }
    // while the trench is dug the Muslims are on it: diggers on both lips (job 0 south, 2 north), carriers (1) taking
    // the earth out to the spoil and back; none within a few metres of the Prophet's own place
    G.dx = F32(NG); G.dz = F32(NG); G.job = new Uint8Array(NG);
    for (let i = NC + NH; i < NG; i++) {
      let x = -700 + R() ** 1.15 * 1900; if (x > 18 && x < 46) x = R() < .5 ? 18 - R() * 30 : 46 + R() * 60; // the Prophet's own stretch stays clear
      const r = R(), job = r < .5 ? 0 : r < .78 ? 1 : 2;
      G.dx[i] = x; G.job[i] = job; G.dz[i] = job === 2 ? zN(x) + .5 + R() * .9 : zS(x) - (job ? 2 + R() * 6 : .45 + R() * .8);
    }
    // fires: in the knots of tents, and pickets along the front
    const NF = 300; const Fi = st.Fi = { n: NF, x: F32(NF), z: F32(NF), out: F32(NF), h: F32(NF) };
    for (let i = 0; i < NF; i++) {
      if (i < 40) { Fi.x[i] = -1100 + R() * 2900; Fi.z[i] = 60 + R() * 110; if (corridor(Fi.x[i], Fi.z[i])) Fi.x[i] += 120; }
      else { const k = cl[i < 64 ? i % 4 : Math.floor(R() * cl.length)], a = R() * TAU, r = Math.sqrt(R()) * k[2] * .8; Fi.x[i] = k[0] + Math.cos(a) * r * 1.6; Fi.z[i] = Math.max(190, k[1] + Math.sin(a) * r); }
      Fi.out[i] = ARR(Fi.x[i]) - .004 + R() * .01; Fi.h[i] = R();
    }
    // banners
    st.ban = [];
    for (let i = 0; i < 52; i++) {
      let x, z;
      if (i < 14) { do { x = -300 + R() * 1400; z = 30 + R() * 90; } while (corridor(x, z)); } else { const k = cl[i < 22 ? i % 4 : Math.floor(R() * cl.length)]; x = k[0] + gs() * k[2]; z = Math.max(200, k[1] + gs() * k[2] * .5); }
      st.ban.push({ x, z, c: [[118, 30, 26], [28, 24, 24], [152, 112, 52]][i % 3], h: 6 + R() * 3, ph: R() * TAU, fall: ARR(x) - .006 });
    }
    // Medina: palm groves, mud-brick houses; the hill of Sal' to the west, behind the Muslim line
    st.palms = [];
    const groves = [[260, -640, 200], [520, -600, 180], [-120, -560, 200], [700, -420, 160], [40, -1000, 140], [760, -1120, 150], [440, -900, 60]];
    for (let i = 0; i < 30; i++) groves.push([-1000 + R() * 2900, -(140 + R() ** 1.2 * 1400), 50 + R() * 170]);
    for (let i = 0; i < 820; i++) { const g = groves[i % groves.length], a = R() * TAU, r = Math.sqrt(R()) * g[2]; const z = Math.min(-108, g[1] + Math.sin(a) * r); st.palms.push([g[0] + Math.cos(a) * r * 1.5, z, 9 + R() * 9, (R() - .5) * 1.6, R()]); }
    for (let i = 0; i < 30; i++) st.palms.push([-1200 + R() * 3000, 300 + R() * 1600, 8 + R() * 7, (R() - .5) * 1.4, R()]); // a few on the camp side
    st.houses = [];
    // a close-packed town of flat roofs and narrow lanes, ragged at its edges
    for (let gx = 150; gx < 690; gx += 13) for (let gz = -930; gz < -650; gz += 13) {
      const ex = Math.hypot((gx - 420) / 270, (gz + 790) / 140) + (R() - .5) * .35; if (ex > 1 || R() < .14) continue;
      const x = gx + (R() - .5) * 2.5, z = gz + (R() - .5) * 2.5, w = 9 + R() * 3, d = 9 + R() * 3, h = 3 + R() * (R() < .2 ? 4.5 : 2.2);
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, R()]);
    }
    for (let i = 0; i < 40; i++) { const x = 560 + R() * 260, z = -260 - R() * 160, w = 7 + R() * 4, d = 7 + R() * 4; st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, 3 + R() * 2.5, R()]); } // farmsteads near the line
    st.houses.sort((a, b) => a[2] - b[2]);
    st.sal = []; for (let x = -820; x <= -120; x += 9) st.sal.push([x, salY(x), salZ(x)]);
    st.sand = []; for (let i = 0; i < 90; i++) st.sand.push([R() * TAU, R(), R(), R()]); // the rock pouring away
    // distant ridges: the long massif to the north, low hills elsewhere
    st.ridge = [];
    for (let a = -1.4; a <= 3.4; a += .016) {
      const n = Math.sin(a * 9 + 1) * .5 + Math.sin(a * 23) * .25 + Math.sin(a * 51 + 2) * .12;
      const um = Math.exp(-(((a - 1.62) / .3) ** 2)), R2 = mix(8600, 5600, um);
      st.ridge.push([300 + Math.cos(a) * R2, mix(60 + 40 * n, 290 + 60 * n, um), Math.sin(a) * R2]);
    }
    st.marks = []; for (let i = 0; i < 2000; i++) { const z = -1400 + R() ** .9 * 5400; if (Math.abs(z - 4.5) < 9) continue; st.marks.push([-1700 + R() * 5600, z, .5 + R() * 1.6, R()]); }
    st.stones = []; for (let i = 0; i < 1500; i++) { const a = R() * TAU, r = 4 + R() ** .7 * 170, x = 110 + Math.cos(a) * r * 1.6, z = -20 + Math.sin(a) * r * .7; if (z > -1.5 && z < 12) continue; st.stones.push([x, z, .04 + R() * R() * .22, R()]); }
    st.stars = []; for (let i = 0; i < 320; i++) { const az = -1 + R() * 4.2, el2 = .03 + R() ** 1.3 * 1.1; st.stars.push([Math.cos(el2) * Math.cos(az), Math.sin(el2), Math.cos(el2) * Math.sin(az), R()]); }
    st.clouds = []; for (let i = 0; i < 34; i++) st.clouds.push([-1.2 + R() * 4.4, .03 + R() ** 1.4 * .45, .1 + R() * .3, .01 + R() * .025, R()]);
    st.dust = []; for (let i = 0; i < 1800; i++) st.dust.push([R(), R(), R(), R()]);
    st.duelDust = []; for (let i = 0; i < 90; i++) st.duelDust.push([R() * TAU, 1.5 + R() * 7, .3 + R() * 2.4, 1.6 + R() * 3.4, R()]);
    st.trail = []; for (let i = 0; i < 46; i++) st.trail.push([R(), R(), R()]);
    st.tx = new Float32Array(T.n * 6); st.gx = new Float32Array(G.n * 7); st.fx = new Float32Array(Fi.n * 4);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .85;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const [skyT, skyH, haze, gFar, gNear, sunK, fireK, night, storm] = keyv(LK, p);
    const fogLen = keyv(FOG, p)[0], fogK = (d) => 1 - Math.exp(-d / fogLen);
    const duel = Math.min(smooth(seg(p, .06, .1)), 1 - smooth(seg(p, .845, .88))) * (1 - .8 * Math.max(0, 1 - Math.abs(p - .35) / .025)) * (1 - .8 * Math.max(0, 1 - Math.abs(p - .74) / .03)); // close shots (phones stand back between them)
    const q = plin(DUEL_Q, p), deep = mix(1.5, DEEP, smooth(seg(p, 0, .34)));
    // ----- camera -----
    let { eye, look, zoom } = camAt(p);
    if (storm > 0) eye = v3.add(eye, [Math.sin(t * 13.1) * .4 * storm, Math.sin(t * 9.7 + 1) * .3 * storm, Math.sin(t * 11.3 + 2) * .4 * storm]);
    if (phone) { // a tall screen: stand back between the close shots; in the duel keep the Prophet in frame
      const back = mix(1.2, 1, duel); eye = v3.add(look, v3.mul(v3.sub(eye, look), back));
      const k = Math.max(.42 * smooth(seg(p, .59, .62)) * (1 - smooth(seg(p, .7, .72))), .85 * smooth(seg(p, .355, .38)) * (1 - smooth(seg(p, .445, .465)))); if (k > 0) look = v3.add(look, v3.mul(v3.sub([PRO[0], 1.2, PRO[2]], look), k));
    }
    const fw = v3.norm(v3.sub(look, eye)), rt = v3.norm(v3.cross([0, 1, 0], fw)), up = v3.cross(fw, rt);
    const F = (phone ? W * mix(1.08, 1.5, duel) : Math.min(H * 1.25, W * .8)) * zoom, cx = W / 2, cy = H * .5;
    const e0 = eye[0], e1 = eye[1], e2 = eye[2], f0 = fw[0], f1 = fw[1], f2 = fw[2], r0 = rt[0], r2 = rt[2], u0 = up[0], u1 = up[1], u2 = up[2];
    let QX = 0, QY = 0, QZ = 0;
    const pj = (x, y, z) => { const dx = x - e0, dy = y - e1, dz = z - e2, zc = dx * f0 + dy * f1 + dz * f2; if (zc < NEAR) return false; QX = cx + F * (dx * r0 + dz * r2) / zc; QY = cy - F * (dx * u0 + dy * u1 + dz * u2) / zc; QZ = zc; return true; };
    const P = (q) => (pj(q[0], q[1], q[2]) ? [QX, QY, QZ] : null);
    const hd = v3.norm([f0, 0, f2]), hy = cy - F * v3.dot(hd, up) / v3.dot(hd, fw);
    const hazeC = (col, d, k = 1) => mixc(col, haze, Math.min(.92, fogK(d) * k));
    const amb = mix(.6, .32, storm) * mix(1, .7, night);
    // where the sun sits on the horizon, even when it is off-frame
    let daz = SUN_AZ - Math.atan2(hd[2], hd[0]); daz = Math.atan2(Math.sin(daz), Math.cos(daz));
    const sunX = Math.abs(daz) < 2.2 ? Math.max(-W * .3, Math.min(W * 1.3, cx - F * Math.tan(Math.max(-1.3, Math.min(1.3, daz))))) : null, sunVis = sunX === null ? 0 : Math.max(Math.cos(daz), .3) ** 2;
    // ----- sky -----
    const sg = c.createLinearGradient(0, Math.min(0, hy - H * .62), 0, hy);
    sg.addColorStop(0, rgb(skyT)); sg.addColorStop(.55, rgb(mixc(skyT, skyH, .45))); sg.addColorStop(1, rgb(skyH));
    c.fillStyle = sg; c.fillRect(0, 0, W, Math.max(0, hy + 2));
    if (sunX !== null && (sunK > .01 || p < .2)) {
      const sy = pj(e0 + SUN[0] * 1e5, e1 + SUN[1] * 1e5, e2 + SUN[2] * 1e5) ? QY : hy - F * .08;
      const r = W * (sunX > W || sunX < 0 ? 1.25 : .7), g = c.createRadialGradient(0, 0, 0, 0, 0, r);
      const ga = sunK * sunVis + .9 * (1 - smooth(seg(p, .08, .2))) * Math.max(0, Math.cos(daz * .55)); g.addColorStop(0, `rgba(255,214,160,${.85 * ga})`); g.addColorStop(.1, `rgba(244,176,118,${.5 * ga})`); g.addColorStop(.42, `rgba(206,128,92,${.16 * ga})`); g.addColorStop(1, 'rgba(206,128,92,0)');
      c.save(); c.beginPath(); c.rect(0, 0, W, hy + 2); c.clip(); c.translate(sunX, sy); c.scale(1, .42); c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2); c.restore();
      if (sunX > -20 && sunX < W + 20 && sunK > .5) { c.fillStyle = `rgba(255,244,214,${.95 * sunK})`; c.beginPath(); c.arc(sunX, sy, Math.max(3, F * .0046), 0, TAU); c.fill(); }
    }
    if (night > .05) { // the stars, once the storm has gone
      c.fillStyle = '#f1ead6';
      const sa = smooth(seg(p, .72, .78));
      st.stars.forEach(([x, y, z, k]) => { if (!pj(e0 + x * 1e5, e1 + y * 1e5, e2 + z * 1e5) || QY > hy - 6) return; c.globalAlpha = sa * (.2 + .7 * k) * (.75 + .25 * Math.sin(t * 2.3 + k * 50)) * c01((hy - QY) / (H * .2)); const s = k > .9 ? 1.7 : 1.1; c.fillRect(QX, QY, s, s); });
      c.globalAlpha = 1;
    }
    // winter stratus, lit from below near the sun; in the storm a dark roof rolls over
    st.clouds.forEach(([az0, el2, w, h, k]) => {
      const az = az0 + t * .0015 * (1 + k) + p * .06, ce = Math.cos(el2);
      if (!pj(e0 + ce * Math.cos(az) * 1e5, e1 + Math.sin(el2) * 1e5, e2 + ce * Math.sin(az) * 1e5) || QY > hy + 4) return;
      const rw = w * F * (1 + storm * .8), rh = h * F * (1 + storm * 1.6), near = sunX !== null ? Math.exp(-Math.abs(QX - sunX) / (W * .3)) * sunVis : 0;
      const col = mixc(mixc(skyT, skyH, .25 + .45 * k), [255, 200, 150], .55 * near * sunK);
      c.save(); c.translate(QX, QY); c.scale(rw, rh);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(mixc(col, [22, 18, 18], storm * .6), (.16 + .3 * k) * (1 + storm))); g.addColorStop(1, rgb(col, 0));
      c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    // the ridges on the horizon
    {
      c.beginPath(); let first = null, last = null;
      st.ridge.forEach(([x, y, z]) => { if (!pj(x, y, z)) return; if (!first) { first = 1; c.moveTo(QX, hy + 2); } c.lineTo(QX, QY); last = QX; });
      if (first) { c.lineTo(last, hy + 2); c.closePath(); const g = c.createLinearGradient(0, hy - F * .06, 0, hy); g.addColorStop(0, rgb(mixc(mixc(gFar, [52, 46, 56], .6), haze, .62))); g.addColorStop(1, rgb(mixc(gFar, haze, .78))); c.fillStyle = g; c.fill(); }
    }
    // ----- ground -----
    const gg = c.createLinearGradient(0, hy, 0, H);
    gg.addColorStop(0, rgb(mixc(gFar, haze, .62))); gg.addColorStop(.1, rgb(mixc(gFar, haze, .2))); gg.addColorStop(.45, rgb(mixc(gFar, gNear, .6))); gg.addColorStop(1, rgb(gNear));
    c.fillStyle = gg; c.fillRect(0, hy, W, H - hy);
    if (sunX !== null && sunK > .01) { // the sun's glare laid along the ground beneath it
      const r = W * .55, g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(255,200,140,${.3 * sunK * sunVis})`); g.addColorStop(1, 'rgba(255,200,140,0)');
      c.save(); c.translate(sunX, hy); c.scale(1, .1); c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2); c.restore();
    }
    // scrub and ruts, then stones near the duel ground, rimmed by the low sun
    [0, 1].forEach((pass) => {
      c.strokeStyle = pass ? rgb(mixc(gNear, [255, 222, 180], .2), .3) : rgb(mixc(gNear, [6, 5, 4], .5), .5);
      c.lineWidth = 1; c.beginPath();
      st.marks.forEach(([x, z, l, q]) => { if ((q > .62) !== !!pass || !pj(x, 0, z) || QZ > 2600 || QY > H + 2 || QY < hy) return; const L = l * F / QZ; if (L < .4 || QX < -L || QX > W + L) return; c.moveTo(QX - L, QY); c.lineTo(QX + L, QY); });
      c.stroke();
    });
    if (duel > .01) {
      const sc = rgb(mixc(gNear, [6, 5, 4], .55)), rc = rgb(mixc([255, 200, 140], gNear, .35), .55 * sunK);
      c.fillStyle = sc; c.beginPath();
      const rims = [];
      st.stones.forEach(([x, z, r, k]) => { if (!pj(x, 0, z) || QZ > 260) return; const s = F / QZ * r; if (s < .5 || QX < -s * 2 || QX > W + s * 2) return; const w = s * (1 + k * .9), h = s * (.3 + k * .25); c.moveTo(QX + w, QY); c.ellipse(QX, QY, w, h, 0, 0, Math.PI, true); if (k > .55) { c.moveTo(QX + w * .1, QY - h * .9); c.lineTo(QX + w * .5 + s * .3, QY - h * 2.6 - s * .6); c.lineTo(QX + w * .3, QY - h * .5); } if (s > 1.5) rims.push(QX, QY, w, h); });
      c.fill();
      c.strokeStyle = rc; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < rims.length; i += 4) { c.moveTo(rims[i] + rims[i + 2] * .2, rims[i + 1] - rims[i + 3] * .95); c.ellipse(rims[i], rims[i + 1], rims[i + 2], rims[i + 3], 0, -Math.PI * .45, -Math.PI * .05); }
      c.stroke();
    }
    // ----- the rock in the cut: pale, hard; cracks at each strike; after the third it pours away like sand -----
    const strikeK = (k) => (p >= k ? Math.exp(-(p - k) / .0035) : c01((p - k + .0015) / .0015));
    const drawRock = (earthLit) => {
      const pc = P(ROCK); if (!pc || p < .2) return;
      const gone = smooth(seg(p, S3 + .003, S3 + .03)), R = F * 1.2 / pc[2] * (1 - gone * .85), cx0 = pc[0], cy0 = pc[1] + F * 1.2 / pc[2] * gone * .7;
      if (R > 1.5 && gone < .98) {
        c.beginPath();
        for (let k = 0; k < 22; k++) { const a = k / 22 * TAU, rr = R * (1 + .18 * (hash(k, 3) - .5)), y = cy0 + Math.sin(a) * rr * (Math.sin(a) > 0 ? .42 : .8); k ? c.lineTo(cx0 + Math.cos(a) * rr * 1.35, y) : c.moveTo(cx0 + Math.cos(a) * rr * 1.35, y); }
        c.closePath();
        const g = c.createLinearGradient(cx0 + R * .7, cy0 - R * .8, cx0 - R * .6, cy0 + R * .8), lit = mixc([206, 198, 182], [255, 236, 206], .25 * sunK);
        g.addColorStop(0, rgb(v3.mul(lit, amb * 1.55))); g.addColorStop(.55, rgb(v3.mul([150, 142, 130], amb * 1.5))); g.addColorStop(1, rgb(v3.mul(mixc([70, 62, 58], earthLit, .2), amb * 1.4)));
        c.fillStyle = g; c.globalAlpha = 1 - gone * .6; c.fill();
        c.strokeStyle = rgb(v3.mul([60, 54, 50], amb * 1.4), .5); c.lineWidth = Math.max(.6, R * .02); c.stroke();
        [S1, S2, S3].forEach((k, n) => { // a crack from each strike, lit while the flash lasts
          if (p < k) return;
          c.beginPath(); let x = cx0 + R * (.2 - n * .35), y = cy0 - R * .72; c.moveTo(x, y);
          for (let j = 0; j < 5; j++) { x += R * (hash(j, n + 7) - .5) * .5; y += R * (.16 + .1 * hash(j, n + 9)); c.lineTo(x, y); }
          const fk = strikeK(k); c.strokeStyle = fk > .05 ? `rgba(255,240,200,${Math.min(1, .3 + fk)})` : rgb(v3.mul([40, 36, 34], amb * 1.3), .8); c.lineWidth = Math.max(.8, R * .03); c.stroke();
        });
        c.globalAlpha = 1;
      }
      if (gone > 0 && gone < 1) { // the sand: grains poured off the top and slipping down into the cut
        c.fillStyle = rgb(v3.mul([200, 188, 168], amb * 1.5), .85);
        const R0 = F * 1.2 / pc[2];
        st.sand.forEach(([a, r, hh, v]) => {
          const tau = seg(p, S3 + .002 + hh * .012, S3 + .022 + hh * .012); if (tau <= 0 || tau >= 1) return;
          const x = pc[0] + Math.cos(a) * r * R0 * 1.3 * (1 + tau * .4), y = pc[1] - R0 * .6 * (1 - r) + tau * tau * R0 * 2.2 * (.6 + v), sz = Math.max(1, R0 * .035);
          c.fillRect(x, y, sz, sz);
        });
      }
    };
    // ----- the trench -----
    {
      const xs = []; for (let x = Math.max(-1600, e0 - 80); x < 4200;) { xs.push(x); x += Math.max(.35, Math.abs(x - e0) * .02 + .2); }
      const lipN = [], lipS = [], botN = [], berN = [], berS = [], berS2 = [], berN2 = [];
      xs.forEach((x) => {
        const n = zN(x), s = zS(x);
        const a = P([x, 0, n]), b = P([x, 0, s]), d = P([x, -deep, n]), e = P([x, .75, n + 1.3]), f = P([x, 0, n + 3.2]), g = P([x, .7, s - 1.3]), h = P([x, 0, s - 3]);
        if (a && b && d && e && f && g && h) { lipN.push(a); lipS.push(b); botN.push(d); berN.push(e); berN2.push(f); berS.push(g); berS2.push(h); }
      });
      st.lip = lipN;
      if (lipN.length > 1) {
        const poly = (A, B) => { const pa = new Path2D(); pa.moveTo(A[0][0], A[0][1]); A.forEach((q) => pa.lineTo(q[0], q[1])); for (let i = B.length - 1; i >= 0; i--) pa.lineTo(B[i][0], B[i][1]); pa.closePath(); return pa; };
        const earthLit = mixc(mixc([178, 128, 86], [60, 54, 52], 1 - sunK * .9), [44, 50, 62], night * .6), earthSh = mixc([70, 52, 40], [22, 22, 26], night);
        const dMid = Math.max(30, Math.hypot(122 - e0, e2));
        c.fillStyle = rgb(hazeC(mixc(earthLit, earthSh, .3), dMid, .6)); c.fill(poly(berN2, berN));
        c.fillStyle = rgb(hazeC(earthLit, dMid, .6)); c.fill(poly(berN, lipN));
        const open = poly(lipN, lipS);
        c.fillStyle = rgb(mixc(v3.mul(earthSh, .55), haze, .06)); c.fill(open);
        c.save(); c.clip(open);
        { const m = lipN.length >> 1, g = c.createLinearGradient(0, lipN[m][1], 0, botN[m][1]); g.addColorStop(0, rgb(mixc(mixc(earthLit, earthSh, .35), haze, .08))); g.addColorStop(1, rgb(mixc(earthSh, [8, 7, 6], .6))); c.fillStyle = g; c.fill(poly(lipN, botN)); }
        c.strokeStyle = rgb(mixc(earthSh, [0, 0, 0], .4), .22); c.lineWidth = 1; c.beginPath(); // spade marks on the cut face
        for (let i = 0; i < lipN.length; i += 3) { const a = lipN[i], b = botN[i]; if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) < 3) continue; c.moveTo(a[0], a[1]); c.lineTo(mix(a[0], b[0], .7), mix(a[1], b[1], .7)); }
        c.stroke();
        c.restore();
        c.strokeStyle = rgb(hazeC(mixc(earthLit, [255, 226, 186], .35 * sunK), dMid, .5), .85); c.lineWidth = 1.2;
        c.beginPath(); lipN.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke();
        if (p < .335) drawRock(earthLit);
        c.fillStyle = rgb(hazeC(mixc(earthLit, earthSh, .6), dMid, .45)); c.fill(poly(lipS, berS));
        c.fillStyle = rgb(hazeC(mixc(earthLit, earthSh, .35), dMid, .45)); c.fill(poly(berS, berS2));
      }
    }
    // ----- the storm: a wall of dust that sweeps the camp from the east and stops at the trench -----
    const xw = mix(-900, 3900, seg(p, WALL0, WALL1)), wallA = smooth(seg(p, WALL0 - .012, WALL0 + .018)) * (1 - smooth(seg(p, WALL1 - .008, WALL1 + .03)));
    if (wallA > .01 && st.lip && st.lip.length > 1) {
      const wc = st.wc, WW = Math.max(8, Math.round(W / 5)), WH = Math.max(8, Math.round(H / 5));
      if (st.wall.width !== WW || st.wall.height !== WH) { st.wall.width = WW; st.wall.height = WH; }
      wc.setTransform(1, 0, 0, 1, 0, 0); wc.clearRect(0, 0, WW, WH); wc.setTransform(WW / W, 0, 0, WH / H, 0, 0);
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 36; i++) {
        const z = 40 + i * 170 + hash(i, 1) * 70, top = 700 + 600 * hash(i, 3);
        for (let j = 0; j < 7; j++) {
          const front = j < 5, back = front ? j * 160 : 800 + (j - 5) * 900, x = xw - back + (hash(i, j) - .5) * 160 + Math.sin(t * .25 + i + j) * 12;
          const y = front ? (.12 + .78 * hash(i, j + 9)) * top : top * .55, r = (150 + 170 * hash(i, j + 4)) * (front ? 1 : 2);
          if ((pass === 1) !== (front && y > top * .55)) continue;
          if (!pj(x, y, z)) continue;
          const rs = r * F / QZ; wc.globalAlpha = pass ? .55 : .92; wc.drawImage(pass ? st.wallL : st.wallS, QX - rs, QY - rs * .85, rs * 2, rs * 1.7);
        }
      }
      wc.globalCompositeOperation = 'lighter'; // its foot glows with the fires it is swallowing
      for (let i = 0; i < 36; i++) { const z = 40 + i * 170 + hash(i, 1) * 70; if (!pj(xw - 60, 60, z)) continue; const rs = 220 * F / QZ; wc.globalAlpha = .35 * (.5 + .5 * Math.sin(t * 3 + i * 1.7)); wc.drawImage(st.glowS, QX - rs * 1.4, QY - rs * .5, rs * 2.8, rs); }
      wc.globalCompositeOperation = 'source-over';
      c.save(); c.beginPath(); const L = st.lip; c.moveTo(-20, L[0][1]); L.forEach((q) => c.lineTo(q[0], q[1])); c.lineTo(W + 20, L[L.length - 1][1]); c.lineTo(W + 20, -20); c.lineTo(-20, -20); c.closePath(); c.clip();
      c.globalAlpha = wallA; c.drawImage(st.wall, 0, 0, W, H); c.globalAlpha = 1; c.restore();
    }
    // ----- the world, far to near in depth bands -----
    const BANDS = [1e9, 3200, 1600, 800, 400, 200, 100, 50, 0];
    const bandOf = (z) => { let b = 0; while (z < BANDS[b + 1]) b++; return b; };
    const NB = BANDS.length - 1, bandMid = (b) => (b === 0 ? 4500 : (BANDS[b] + BANDS[b + 1]) / 2);
    const { T, G, Fi } = st;
    const falter = smooth(seg(p, .685, .74)), flee = (x, d) => smooth(seg(p, ARR(x) - .02 + d * .006, ARR(x) + .018 + d * .012));
    const TP = st.tx, LB = st.lb || (st.lb = Array.from({ length: NB }, () => ({ t: [], g: [], p: [] })));
    LB.forEach((L) => { L.t.length = 0; L.g.length = 0; L.p.length = 0; });
    for (let i = 0; i < T.n; i++) {
      const k = seg(p, T.tear[i], T.tear[i] + .03), j = i * 6, ck = campK(p, T.v[i]);
      let x = T.x[i], y = 0, z = T.z[i], a = 1, lean = storm * .12 * (1 + T.v[i]) * (1 - k), hk = 1;
      if (k > 0) { lean += .7 * Math.min(1, k * 3); if (T.fly[i]) { const f = c01(k * 1.4 - .25); x += 140 * f * f; y = 22 * f * (1 - f * .5); z -= 12 * f; a = 1 - f; hk = 1 - .4 * f; } else hk = mix(1, .28, smooth(c01(k * 2 - .3))); }
      TP[j + 5] = 0; hk *= ck;
      if (a <= .01 || ck < .02 || !pj(x, y, z)) continue;
      TP[j] = QX; TP[j + 1] = QY; TP[j + 2] = QZ; TP[j + 3] = lean; TP[j + 4] = hk; TP[j + 5] = a;
      const m = T.w[i] * F / QZ + 30; if (QX < -m || QX > W + m || QY < hy - 40) continue;
      LB[bandOf(QZ)].t.push(i);
    }
    const GP = st.gx;
    for (let i = 0; i < G.n; i++) {
      const j = i * 8, ty = G.ty[i];
      let x = G.x[i], z = G.z[i], a = 1, dg = 0;
      if (ty !== 2) { // the Confederates come down from the north, falter after the duel, flee east before the wind
        const ck = campK(p, G.d[i]); a = ck; z += (1 - ck) * 320;
        if (G.front[i]) z += falter * (18 + 40 * G.d[i]);
        const fl = flee(x, G.d[i]); if (fl > 0) { x += fl * (60 + 160 * G.hh[i]); z += fl * (260 + 500 * G.d[i]); a *= 1 - smooth(c01(fl * 1.4 - .4)); }
      } else { // the Muslims on the trench while it is dug, then back to their line as the armies come
        const bk = smooth(seg(p, .315 + .035 * G.d[i], .345 + .035 * G.d[i]));
        if (bk < 1) { let dz = G.dz[i]; if (G.job[i] === 1) dz = mix(zS(G.dx[i]) - 1.2, dz, tri(p * 26 + G.hh[i])); x = mix(G.dx[i], x, bk); z = mix(dz, z, bk); dg = 1 - bk; }
      }
      GP[j + 4] = 0; GP[j + 5] = x; GP[j + 6] = z; GP[j + 7] = dg;
      if (a <= .01 || !pj(x, 0, z)) continue;
      GP[j] = QX; GP[j + 1] = QY; GP[j + 2] = QZ; GP[j + 3] = F / QZ; GP[j + 4] = a;
      if (a < .35 || QX < -6 * GP[j + 3] - 4 || QX > W + 6 * GP[j + 3] + 4 || QY < hy - 2 || QY > H + 3 * GP[j + 3]) continue;
      LB[bandOf(QZ)].g.push(i);
    }
    st.palms.forEach((pm, i) => { const d = Math.hypot(pm[0] - e0, pm[1] - e2); if (d > 9000) return; LB[bandOf(d)].p.push(i); });
    const FP = st.fx;
    for (let i = 0; i < Fi.n; i++) { const j = i * 4; FP[j + 3] = 0; if (!pj(Fi.x[i], .4, Fi.z[i])) continue; FP[j] = QX; FP[j + 1] = QY; FP[j + 2] = QZ; FP[j + 3] = 1; }
    // the bloom buffer (fires, lamps, Ali's disc)
    const bc = st.bc, BW = Math.max(8, Math.round(W / 4)), BH = Math.max(8, Math.round(H / 4));
    if (st.bloom.width !== BW || st.bloom.height !== BH) { st.bloom.width = BW; st.bloom.height = BH; }
    bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, BW, BH); bc.setTransform(BW / W, 0, 0, BH / H, 0, 0);
    const tentC = [[34, 28, 26], [92, 60, 42], [118, 100, 82]], manC = [[30, 24, 22], [36, 28, 24], [58, 50, 44]];
    const rimC = mixc([255, 196, 140], [140, 120, 110], 1 - sunK);
    const windS = (() => { const a = P(D), b = P([D[0] + 20, D[1], D[2]]); if (!a || !b) return [1, 0]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; })();
    const lampA = smooth(seg(night, .15, .6));
    const dirN = (() => { const a = P([DIG[0], 0, -5]), b = P([DIG[0], 0, 8]); return a && b && b[0] < a[0] ? -1 : 1; })(); // which way the cut lies on screen
    const drawHouse = ([x0, x1, z0, z1, h, k]) => {
      const faces = [[[0, 0, -1], [[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]]], [[-1, 0, 0], [[x0, 0, z1], [x0, 0, z0], [x0, h, z0], [x0, h, z1]]], [[1, 0, 0], [[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]]], [[0, 0, 1], [[x1, 0, z1], [x0, 0, z1], [x0, h, z1], [x1, h, z1]]], [[0, 1, 0], [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]]]];
      const d = Math.hypot((x0 + x1) / 2 - e0, (z0 + z1) / 2 - e2);
      faces.forEach(([n, pts]) => {
        if ((pts[0][0] - e0) * n[0] + (pts[0][1] - e1) * n[1] + (pts[0][2] - e2) * n[2] >= 0) return;
        const q = pts.map(P); if (q.some((v) => !v)) return;
        const lit = Math.max(0, v3.dot(n, SUN)) * sunK, wall = n[1] === 0;
        const base = mixc([118, 88, 62], [40, 31, 26], wall ? .66 - lit * .55 : .42 + .15 * k);
        c.fillStyle = rgb(hazeC(mixc(v3.mul(base, amb * mix(1, 1.5, sunK)), [240, 180, 124], lit * .3), d, .9));
        c.beginPath(); q.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill();
        if (lampA > 0 && k < .16 && wall) { const m = P([mix(pts[0][0], pts[1][0], .3 + k), h * .42, mix(pts[0][2], pts[1][2], .3 + k)]); if (m) { const s = F / m[2]; c.fillStyle = `rgba(255,186,104,${.9 * lampA})`; c.fillRect(m[0] - .3 * s, m[1] - .45 * s, Math.max(1, .6 * s), Math.max(1.2, .9 * s)); bc.fillStyle = `rgba(255,160,80,${.35 * lampA})`; bc.fillRect(m[0] - 1.2 * s - 1.5, m[1] - 1.2 * s - 1.5, 2.4 * s + 3, 2.4 * s + 3); } }
      });
    };
    const drawSal = () => {
      const top = [], bot = [];
      st.sal.forEach(([x, y, z]) => { const a = P([x, y, z]), b = P([x, 0, z]); if (a && b) { top.push(a); bot.push(b); } });
      if (top.length < 2) return;
      c.beginPath(); top.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1] + 2); c.closePath();
      const d = top[top.length >> 1][2], ytop = Math.min(...top.map((q) => q[1])), g = c.createLinearGradient(0, ytop, 0, Math.max(...bot.map((q) => q[1])));
      g.addColorStop(0, rgb(hazeC(v3.mul([62, 50, 46], amb * 1.5), d, .5))); g.addColorStop(1, rgb(hazeC(v3.mul([62, 50, 46], amb * 1.5), d, 1)));
      c.fillStyle = g; c.fill();
      c.strokeStyle = rgb(hazeC(rimC, d, .45), .5 * sunK); c.lineWidth = 1.2; c.beginPath(); top.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke();
    };
    const palm = (x, z, h, lean, v) => {
      if (!pj(x, 0, z)) return; const bx = QX, by = QY, s = F / QZ; if (bx < -14 * s || bx > W + 14 * s || by < hy - 1) return;
      const tx = bx + lean * s, ty = by - h * s, sw = storm * .9 + .06 * Math.sin(t * .8 + v * 9);
      if (s < .7) { c.moveTo(bx, by); c.lineTo(tx, ty); for (let f = 0; f < 6; f++) { const a = f / 6 * TAU + v * 6, l = 3 * s; c.moveTo(tx, ty); c.lineTo(tx + Math.cos(a) * l + windS[0] * sw * l, ty + Math.abs(Math.sin(a)) * l * .5 + l * .2); } return; }
      c.moveTo(bx, by); c.quadraticCurveTo((bx + tx) / 2 + .5 * s * Math.sin(v * 7), (by + ty) / 2, tx, ty);
      for (let f = 0; f < 11; f++) { const a = f / 11 * TAU + v * 6 + Math.sin(t * .7 + v * 20) * .04, l = (3 + hash(f, v) * 1.3) * s, dx = Math.cos(a) * l + windS[0] * sw * l * .9, dy = Math.sin(a) * l * .4 + l * .4 * Math.abs(Math.cos(a)) + windS[1] * sw * l; c.moveTo(tx, ty); c.quadraticCurveTo(tx + dx * .55, ty - l * .32 + dy * .1, tx + dx, ty + dy); }
    };
    const fig = (bx, by, s, h, wv, spear) => { // a cloaked standing figure; no face, only its outline
      if (s * h < 2.4) { const w = Math.max(.8, .5 * s), hh = Math.max(1.1, h * s); c.rect(bx - w / 2, by - hh, w, hh); return; }
      if (s * h < 13) { c.rect(bx - .28 * s * wv, by - 1.46 * s, .56 * s * wv, 1.46 * s); c.rect(bx - .12 * s, by - h * s, .24 * s, .26 * s); return; }
      const k = h / 1.75, w = s * wv;
      c.moveTo(bx - .31 * w, by); c.lineTo(bx - .24 * w, by - .9 * s * k); c.lineTo(bx - .26 * w, by - 1.34 * s * k); c.quadraticCurveTo(bx - .25 * w, by - 1.47 * s * k, bx - .1 * s, by - 1.47 * s * k); c.lineTo(bx - .05 * s, by - 1.5 * s * k);
      c.lineTo(bx + .05 * s, by - 1.5 * s * k); c.lineTo(bx + .1 * s, by - 1.47 * s * k); c.quadraticCurveTo(bx + .25 * w, by - 1.47 * s * k, bx + .26 * w, by - 1.34 * s * k); c.lineTo(bx + .24 * w, by - .9 * s * k); c.lineTo(bx + .31 * w, by); c.closePath();
      c.moveTo(bx + .13 * s, by - 1.63 * s * k); c.arc(bx, by - 1.63 * s * k, .13 * s, 0, TAU);
      if (spear && s > 3) { const sx = bx + .26 * w * spear; c.moveTo(sx - .03 * s, by); c.lineTo(sx + .03 * s, by); c.lineTo(sx + .03 * s, by - 2.9 * s); c.lineTo(sx, by - 3.1 * s); c.lineTo(sx - .03 * s, by - 2.9 * s); c.closePath(); }
    };
    const horseSil = (bx, by, s, d, rider, spear) => {
      if (s < 4) { c.rect(bx - 1.05 * s, by - 1.55 * s, Math.max(1.2, 2.1 * s), Math.max(.9, .55 * s)); if (s > .8) { c.rect(bx - .9 * s, by - s, Math.max(.6, .25 * s), s); c.rect(bx + .6 * s, by - s, Math.max(.6, .25 * s), s); } if (rider) c.rect(bx - .2 * s, by - 2.4 * s, Math.max(.7, .45 * s), .9 * s); return; }
      c.moveTo(bx + d * HORSE[0][0] * s, by + HORSE[0][1] * s); for (let i = 1; i < HORSE.length; i++) c.lineTo(bx + d * HORSE[i][0] * s, by + HORSE[i][1] * s); c.closePath();
      LEGS.forEach(([u, v]) => { const x = bx + d * u * s; c.moveTo(x - .065 * s, by + v * s); c.lineTo(x + .065 * s, by + v * s); c.lineTo(x + .05 * s, by); c.lineTo(x - .05 * s, by); c.closePath(); });
      c.moveTo(bx - d * 1.02 * s, by - 1.42 * s); c.lineTo(bx - d * 1.3 * s, by - .8 * s); c.lineTo(bx - d * 1.16 * s, by - .78 * s); c.lineTo(bx - d * .96 * s, by - 1.3 * s); c.closePath();
      if (rider) {
        c.moveTo(bx - d * .32 * s, by - 1.45 * s); c.lineTo(bx + d * .26 * s, by - 1.45 * s); c.lineTo(bx + d * .1 * s, by - 2.28 * s); c.lineTo(bx - d * .14 * s, by - 2.28 * s); c.closePath();
        c.moveTo(bx + .13 * s, by - 2.43 * s); c.arc(bx, by - 2.43 * s, .14 * s, 0, TAU);
        if (spear) { c.moveTo(bx + d * .1 * s, by - 1.4 * s); c.lineTo(bx + d * .14 * s, by - 1.4 * s); c.lineTo(bx + d * .6 * s, by - 4.3 * s); c.lineTo(bx + d * .56 * s, by - 4.3 * s); c.closePath(); }
      }
    };
    const tentPath = (bx, by, s, w, h, ty, lean, hk, v) => {
      const W2 = w * s / 2, Hh = h * s * hk, L = lean * Hh, sx = windS[0] * L, sy = windS[1] * L * .3;
      if (W2 < .6) { c.rect(bx - Math.max(.5, W2), by - Math.max(.7, Hh), Math.max(1, W2 * 2), Math.max(.7, Hh)); return; }
      if (ty === 0) { c.moveTo(bx - W2, by); c.lineTo(bx - W2 + sx * .4, by - Hh * .45 + sy); c.lineTo(bx - W2 * .5 + sx * .9, by - Hh * (.86 + .1 * v) + sy); c.lineTo(bx + sx * .8, by - Hh * .74 + sy); c.lineTo(bx + W2 * .5 + sx, by - Hh + sy); c.lineTo(bx + W2 + sx * .4, by - Hh * .42 + sy); c.lineTo(bx + W2, by); c.closePath(); }
      else if (ty === 1) { c.moveTo(bx - W2, by); c.bezierCurveTo(bx - W2 + sx * .5, by - Hh * 1.05 + sy, bx + W2 + sx * .9, by - Hh * 1.05 + sy, bx + W2, by); c.closePath(); }
      else { c.moveTo(bx - W2, by); c.lineTo(bx + sx, by - Hh + sy); c.lineTo(bx + W2, by); c.closePath(); }
    };
    const shadowK = sunK * (1 - storm);
    const HB = st.hb || (st.hb = new Int8Array(st.houses.length));
    st.houses.forEach((hs, i) => { HB[i] = -1; const x = (hs[0] + hs[1]) / 2, z = (hs[2] + hs[3]) / 2; if (!pj(x, hs[4] / 2, z) || QX < -150 || QX > W + 150 || QY > H + 150) return; HB[i] = bandOf(Math.hypot(x - e0, z - e2)); });
    for (let b = 0; b < NB; b++) {
      const dm = bandMid(b), fk = fogK(dm);
      if (b <= 6) for (let i = 0; i < st.houses.length; i++) if (HB[i] === b) drawHouse(st.houses[i]);
      if (bandOf(Math.hypot(-470 - e0, -330 - e2)) === b) drawSal();
      // palms
      const pc = mixc(v3.mul([22, 25, 18], amb * 1.5), haze, Math.min(.92, fk));
      c.strokeStyle = rgb(pc); c.lineCap = 'round';
      const LBb = LB[b];
      if (b < 5) { c.lineWidth = b >= 3 ? 1.2 : .8; c.beginPath(); LBb.p.forEach((i) => { const [x, z, h, l, v] = st.palms[i]; palm(x, z, h, l, v); }); c.stroke(); }
      else LBb.p.forEach((i) => { const [x, z, h, l, v] = st.palms[i]; c.lineWidth = Math.max(1, .3 * F / Math.hypot(x - e0, z - e2)); c.beginPath(); palm(x, z, h, l, v); c.stroke(); });
      // tents
      for (let ty = 0; ty < 3; ty++) {
        const col = mixc(v3.mul(tentC[ty], amb * 1.9), haze, Math.min(.92, fk)); c.fillStyle = rgb(col); c.beginPath(); let any = false;
        for (const i of LBb.t) { if (T.ty[i] !== ty) continue; const j = i * 6; if (TP[j + 5] < .5) continue; tentPath(TP[j], TP[j + 1], F / TP[j + 2], T.w[i], T.h[i], ty, TP[j + 3], TP[j + 4], T.v[i]); any = true; }
        if (any) { c.fill(); if (b >= 3 && shadowK > .05) { c.strokeStyle = rgb(hazeC(rimC, dm, .8), .3 * shadowK); c.lineWidth = 1; c.stroke(); } }
      }
      if (storm > .05) { // canvas torn loose, tumbling, fading
        c.fillStyle = rgb(mixc([40, 32, 28], haze, Math.min(.9, fk)), .75); c.beginPath(); let any = false;
        for (const i of LBb.t) { const j = i * 6, a = TP[j + 5]; if (a >= .5) continue; const z = TP[j + 2], s = F / z, w = T.w[i] * s * .45, ang = p * 70 + i, yy = TP[j + 1] - T.h[i] * s, fx = TP[j], fl2 = Math.sin(p * 400 + i) * .5; c.moveTo(fx + Math.cos(ang) * w, yy + Math.sin(ang) * w * .35); c.quadraticCurveTo(fx + Math.cos(ang + 1.3) * w * (.6 + fl2), yy + Math.sin(ang + 1.3) * w * .6, fx + Math.cos(ang + 2.4) * w * .7, yy + Math.sin(ang + 2.4) * w * .4); c.lineTo(fx + Math.cos(ang + 3.6) * w * .9, yy + Math.sin(ang + 3.6) * w * .3); c.quadraticCurveTo(fx + Math.cos(ang + 4.8) * w * (.5 - fl2), yy + Math.sin(ang + 4.8) * w * .5, fx + Math.cos(ang) * w, yy + Math.sin(ang) * w * .35); any = true; }
        if (any) c.fill();
      }
      // people and horses: long shadows first (near field only), then the bodies
      if (b >= 5 && shadowK > .03) {
        c.fillStyle = `rgba(12,9,8,${.3 * shadowK})`; c.beginPath();
        for (const i of LBb.g) { const L = (G.ty[i] === 1 ? 2.4 : 1.75) * SHL, x = GP[i * 8 + 5], zz = GP[i * 8 + 6]; if (!pj(x + SHX * L, 0, zz + SHZ * L)) continue; const ex = QX, ey = QY; if (!pj(x - .3 * SHZ, 0, zz + .3 * SHX)) continue; const ax = QX, ay = QY; if (!pj(x + .3 * SHZ, 0, zz - .3 * SHX)) continue; c.moveTo(ax, ay); c.lineTo(ex, ey); c.lineTo(QX, QY); c.closePath(); }
        c.fill();
      }
      for (let ty = 0; ty < 3; ty++) {
        const base = ty === 1 ? [30, 22, 18] : manC[ty];
        const col = rgb(mixc(v3.mul(base, amb * 1.8), haze, Math.min(.92, fk))); c.fillStyle = col; c.beginPath(); let any = false;
        const tools = [];
        for (const i of LBb.g) {
          if (G.ty[i] !== ty) continue; const j = i * 8;
          const s = GP[j + 3], bx = GP[j] + (ty !== 1 && s > 3 ? Math.sin(t * 1.3 + G.hh[i] * 40) * .02 * s : 0), by = GP[j + 1];
          if (ty === 1) horseSil(bx, by, s, G.dir[i], G.rider[i], G.hh[i] < .5);
          else if (ty === 2 && GP[j + 7] > .5) { // digging: a pick or a mattock in the swing; a carrier with a basket on the head
            fig(bx, by, s, 1.62 + G.hh[i] * .24, .85 + G.d[i] * .35, 0);
            if (G.job[i] === 1) { if (s > 1.2) { c.moveTo(bx - .24 * s, by - 1.82 * s); c.lineTo(bx + .24 * s, by - 1.82 * s); c.lineTo(bx + .16 * s, by - 1.66 * s); c.lineTo(bx - .16 * s, by - 1.66 * s); c.closePath(); } }
            else if (s > 1.6) tools.push(bx, by, s, (G.job[i] === 2 ? -dirN : dirN), ((p * 64 + G.hh[i] * 7) % 1));
          } else fig(bx, by, s, 1.62 + G.hh[i] * .24, .85 + G.d[i] * .35, G.hh[i] < .22 ? G.dir[i] : 0);
          any = true;
        }
        if (any) c.fill();
        if (tools.length) { // the handle swings from over the head down into the cut
          c.strokeStyle = col; c.lineWidth = Math.max(.7, tools[2] * .055); c.beginPath();
          for (let k = 0; k < tools.length; k += 5) {
            const [bx, by, s, dr, f] = tools.slice(k, k + 5), sw = f < .6 ? 1 - smooth(f / .6) : f < .7 ? 0 : ease.in(c01((f - .7) / .12));
            const th = mix(-2.1, .93, sw), cs = Math.cos(th), sn = Math.sin(th), hx = bx + dr * .55 * cs * s, hy = by - 1.35 * s + .55 * sn * s;
            const ex = hx + dr * .75 * cs * s, ey = hy + .75 * sn * s;
            c.moveTo(hx - dr * .15 * cs * s, hy - .15 * sn * s); c.lineTo(ex, ey); c.moveTo(ex + dr * .2 * sn * s, ey - .2 * cs * s); c.lineTo(ex - dr * .2 * sn * s, ey + .2 * cs * s);
          }
          c.stroke();
        }
      }
      // banners
      st.ban.forEach((bn) => {
        const fl = seg(p, bn.fall, bn.fall + .02), fa = campK(p, bn.ph / TAU) * (1 - smooth(seg(p, bn.fall + .014, bn.fall + .04))); if (fa <= .02) return;
        if (!pj(bn.x, 0, bn.z + (bn.z < 200 ? falter * 30 : 0)) || QZ >= BANDS[b] || QZ < BANDS[b + 1]) return;
        const bx = QX, by = QY, s = F / QZ, dip = falter * .25 + fl * 1.2, hh = bn.h * s;
        const tx = bx - Math.sin(dip) * hh * windS[0], ty = by - Math.cos(dip) * hh;
        const col = mixc(v3.mul(bn.c, amb * 2), haze, Math.min(.92, fk)), wv = 1 + storm * 2, ww = 2.4 * s * (1 + storm * .3);
        c.strokeStyle = rgb(mixc([36, 28, 22], haze, Math.min(.92, fk)), fa); c.lineWidth = Math.max(.7, .12 * s); c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke();
        c.fillStyle = rgb(col, fa); c.beginPath(); c.moveTo(tx, ty);
        for (let k = 1; k <= 6; k++) { const u = k / 6; c.lineTo(tx - windS[0] * ww * u + Math.sin(t * 3 * wv + bn.ph + u * 5) * .12 * s * wv, ty + u * .15 * s + Math.cos(t * 2.6 * wv + bn.ph + u * 4) * .18 * s * wv * u); }
        for (let k = 6; k >= 0; k--) { const u = k / 6; c.lineTo(tx - windS[0] * ww * u + Math.sin(t * 3 * wv + bn.ph + u * 5 + .5) * .12 * s * wv, ty + 1.2 * s + u * .1 * s + Math.cos(t * 2.6 * wv + bn.ph + u * 4) * .18 * s * wv * u); }
        c.closePath(); c.fill();
      });
    }
    // ----- fires: a bright core, their light in the bloom buffer; smoke leaning with the wind -----
    const fireOn = (i) => { const o = Fi.out[i]; return campK(p, Fi.h[i]) * (1 - smooth(seg(p, o, o + .01))) * (1 + 1.2 * Math.sin(Math.PI * seg(p, o - .008, o + .004))); };
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < Fi.n; i++) {
      const j = i * 4; if (!FP[j + 3]) continue; const on = fireOn(i) * fireK; if (on <= .01) continue;
      const z = FP[j + 2], s = F / z, fl = .75 + .25 * Math.sin(t * 8 + Fi.h[i] * 30) * Math.sin(t * 5.1 + i), x = FP[j], y = FP[j + 1];
      if (x < -20 || x > W + 20 || y < hy - 3) continue;
      const vis = 1 - fogK(z) * .7, r = Math.max(1.3, .6 * s) * fl;
      c.fillStyle = `rgba(255,${190 + 40 * fl | 0},120,${Math.min(1, on * vis)})`; c.fillRect(x - r / 2, y - r, r, r);
      const gr = Math.max(3, 2.6 * s) * (1 + storm * .4); bc.globalAlpha = Math.min(1, on * vis * .8); bc.drawImage(st.glowS, x - gr, y - gr * .9, gr * 2, gr * 2);
    }
    bc.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    const smokeA = (.35 + .4 * (1 - storm)) * (1 - night * .6);
    for (let i = 0; i < Fi.n; i += 3) {
      const j = i * 4; if (!FP[j + 3]) continue; const on = fireOn(i); if (on <= .02) continue; const z = FP[j + 2]; if (z > 2200 || FP[j] < -100 || FP[j] > W + 100) continue;
      for (let k = 0; k < 4; k++) {
        const u = ((k + t * .12 + Fi.h[i] * 4) % 4) / 4, y = 1.5 + u * (18 + 10 * Fi.h[i]), drift = u * u * (14 + storm * 120);
        if (!pj(Fi.x[i] + drift * (storm * .9 + .1), y, Fi.z[i] - drift * (1 - storm) * .9)) continue;
        const r = (1.5 + u * 7) * F / QZ; c.globalAlpha = smokeA * Math.min(1, on) * (1 - u) * (1 - fogK(QZ) * .6) * .6; c.drawImage(st.smoke, QX - r, QY - r, r * 2, r * 2);
      }
    }
    c.globalAlpha = 1;
    // ----- the duel; and the Prophet and Ali through the whole film -----
    const A = amr(q), ali = aliAt(p), amrA = campK(p, .5);
    const drawShadow = (x, z, h, w, a) => { if (shadowK <= .02) return; const L = h * SHL; const q0 = P([x - w * SHZ, .01, z + w * SHX]), q1 = P([x + w * SHZ, .01, z - w * SHX]), q2 = P([x + SHX * L + w * .3 * SHZ, .01, z + SHZ * L - w * .3 * SHX]), q3 = P([x + SHX * L - w * .3 * SHZ, .01, z + SHZ * L + w * .3 * SHX]); if (!q0 || !q1 || !q2 || !q3) return; const g = c.createLinearGradient((q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, (q2[0] + q3[0]) / 2, (q2[1] + q3[1]) / 2); g.addColorStop(0, `rgba(10,7,6,${.55 * a * shadowK})`); g.addColorStop(1, 'rgba(10,7,6,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q3[0], q3[1]); c.lineTo(q2[0], q2[1]); c.lineTo(q1[0], q1[1]); c.closePath(); c.fill(); };
    const dark = [16, 11, 10];
    if (q > .12 && q < .34 && p < .62) { // dust behind the galloping horse
      st.trail.forEach(([u, k, v]) => {
        const back = u * .06, pp = q - back; if (pp < .115) return; const B = amr(pp); if (B.gait === 'stand' || B.gait === 'rear') return;
        const age = back / .06, qq = P([B.h[0] + (k - .5) * 2, .4 + age * 2.2 * v, B.h[2] + (v - .5) * 2]); if (!qq) return;
        const r = (1 + age * 3.2) * F / qq[2]; c.globalAlpha = .5 * (1 - age) * (1 - smooth(seg(q, .3, .34))); c.drawImage(st.puffW, qq[0] - r, qq[1] - r, r * 2, r * 2);
      });
      c.globalAlpha = 1;
    }
    const dA = .45 * smooth(seg(q, .216, .23)) * (1 - smooth(seg(q, .26, .3))) + .5 * smooth(seg(q, .3, .44)) + .45 * smooth(seg(q, .44, FLASH)) - .72 * smooth(seg(q, .5, .63));
    const duelDust = (front) => {
      if (dA <= .01) return;
      const ref = P(D); if (!ref) return;
      st.duelDust.forEach(([a, r, y, R, k]) => {
        const cen = q < .3 ? LAND : D, sp = q * (3 + k * 4) + a, rr = r * (1 + .35 * smooth(seg(q, FLASH, .6)));
        const qq = P([cen[0] + Math.cos(sp) * rr, y * (1 + seg(q, FLASH, .6)), cen[2] + Math.sin(sp) * rr * .8]); if (!qq || (qq[2] < ref[2] - 1.5) !== front) return;
        const rs = R * F / qq[2] * (1 + .4 * seg(q, FLASH, .62));
        c.globalAlpha = Math.min(1, dA) * (.3 + .4 * k) * (front ? .4 : .75);
        c.drawImage(k < .3 ? st.puffD : st.puffW, qq[0] - rs, qq[1] - rs * .8, rs * 2, rs * 1.6);
      });
      c.globalAlpha = 1;
    };
    duelDust(false);
    const famb = c01(mix(1, .25, night) - .3 * storm), duelists = [];
    const jump = (a) => Math.min(1, Math.abs(p - a) / .006); // the two holy figures change place while the camera is wide
    const sizeA = (z) => smooth(c01((1.8 * F / z - 9) / 9)); // far off, the veiled figures fade rather than shrink to a point of light
    const aliA = jump(.337) * (1 - smooth(seg(p, .712, .728))), aq = P(ali);
    if (A.ha > .01 && amrA > .01) {
      const qq = P(A.h);
      if (qq) duelists.push([qq[2], () => {
        const s = F / qq[2], qa = P(v3.add(A.h, v3.mul(v3.norm(A.v), 2))), face = qa && qa[0] < qq[0] ? -1 : 1;
        drawShadow(A.h[0], A.h[2], A.mounted ? 2.7 : 2, .5, A.ha);
        c.save(); c.globalAlpha = A.ha * amrA; drawHorseFull(c, dpr, qq[0], qq[1], s, face, A, A.mounted, dark, t); c.restore();
      }]);
    }
    if (A.m) {
      const qq = P(A.m);
      if (qq) duelists.push([qq[2], () => {
        const s = F / qq[2], face = aq ? (aq[0] < qq[0] ? -1 : 1) : 1;
        drawShadow(A.m[0], A.m[2], 1.9 * (1 - A.fall * .8), .35, A.ma);
        c.save(); c.globalAlpha = A.ma;
        const g = c.createRadialGradient(qq[0], qq[1] - s, 0, qq[0], qq[1] - s, s * 2.4); g.addColorStop(0, `rgba(24,4,3,${.4 * (1 - A.fall)})`); g.addColorStop(1, 'rgba(24,4,3,0)'); c.fillStyle = g; c.fillRect(qq[0] - s * 3, qq[1] - s * 4, s * 6, s * 6);
        drawMan(c, dpr, qq[0], qq[1], s, face, q, A.fall, dark, t);
        c.restore();
      }]);
    }
    const holyGlow = (hd, a, k = 1) => { if (hd) { bc.fillStyle = `rgba(255,226,170,${.8 * a * k * (.22 + .45 * Math.max(night, storm * .5))})`; bc.beginPath(); bc.arc(hd.x, hd.y, Math.max(8, hd.r * 4), 0, TAU); bc.fill(); } };
    // Ali: carries the earth out (a full basket on the shoulder, an empty one back), watches the rock, stands by the
    // Prophet, is turbaned and given the sword, walks out, circles facing the rider, raises Dhul-Fiqar, strikes at the flash
    const ag = P(ali);
    let aliH = null;
    if (aliA > 0 && ag && sizeA(ag[2]) > 0) duelists.push([ag[2], () => {
      const foe = A.m ? P(A.m) : P(A.h), h = 1.8 * F / ag[2], aliA2 = aliA * sizeA(ag[2]);
      let pose = 'stand', phase = 0, arms, basket = 0, flip = false;
      if (p < .2) { const u = aliCarry(p), f = ((u % 1) + 1) % 1; pose = 'walk'; phase = (p + .01) * 150; basket = f < .5 ? 1 : -1; arms = basket > 0 ? [[.17, -.97]] : [[.21, -.47]]; }
      else if (p >= .6 && q < .314) { pose = 'walk'; phase = 14 * smooth(seg(p, .6, .615)) / 1.5; }
      else if (q >= .314 && q < .44) { pose = 'walk'; phase = 13.5 * seg(q, .314, .44) / 1.2; }
      else if (q >= .44 && q < FLASH + .05) { pose = 'fight'; phase = .5 * ease.in(seg(q, .44, FLASH)); }
      if (p > .6) flip = !!foe && foe[0] < ag[0];
      const o = { who: 'ali', pose, phase, arms, sword: p > .566, flip, x: ag[0], y: ag[1], h, t, amb: famb, alpha: aliA2 };
      aliH = Holy.draw(c, o);
      if (basket && aliH) { // a palm-leaf basket: full of earth on the shoulder, empty on the way back
        const bx = ag[0] + arms[0][0] * h, by = ag[1] + arms[0][1] * h, w = h * .13;
        c.save(); c.globalAlpha = aliA2;
        if (basket > 0) { c.fillStyle = rgb(v3.mul([120, 92, 64], famb * 1.2)); c.beginPath(); c.ellipse(bx, by - w * .45, w * .95, w * .5, 0, Math.PI, 0); c.fill(); }
        c.fillStyle = rgb(v3.mul([96, 70, 42], famb * 1.1)); c.beginPath(); c.moveTo(bx - w, by - w * .45); c.quadraticCurveTo(bx, by + w * .9, bx + w, by - w * .45); c.closePath(); c.fill();
        c.strokeStyle = rgb(v3.mul([150, 118, 80], famb * 1.1), .7); c.lineWidth = Math.max(.6, w * .06); c.stroke();
        c.restore();
      }
      holyGlow(aliH, aliA2);
      const tu = Math.sin(Math.PI * seg(p, .538, .566)); // the turban wound by the Prophet's hand: a brief light about the head
      if (aliH && tu > 0) { bc.fillStyle = `rgba(255,236,190,${.55 * tu})`; bc.beginPath(); bc.arc(aliH.x, aliH.y, aliH.r * 3.2, 0, TAU); bc.fill(); }
    }]);
    // the Prophet: digging with the pick, striking the rock, before his line, turbaning Ali and giving him the sword,
    // hands raised for him through the duel, and at night on the hill
    const pro = proAt(p), proA = Math.min(jump(.337), Math.min(1, Math.abs(p - .72) / .008)) * (1 - smooth(seg(p, .9, .925)));
    const pg = P(pro);
    if (pg && proA > 0 && sizeA(pg[2]) > 0) duelists.push([pg[2] - .05, () => {
      const h = 1.8 * F / pg[2], o = { who: 'prophet', pose: 'stand', x: pg[0], y: pg[1], h, t, amb: famb, alpha: proA * sizeA(pg[2]), sword: p > .335 && p < .566 };
      const two = (L, R) => [[Math.min(L[0], -.03), L[1]], [Math.max(R[0], .03), R[1]]];
      let pick = null;
      if (p < .335) { // both hands on the haft; th turns it from over the head down into the cut
        const sw = pickSwing(p), th = mix(-2.1, .93, sw), cs = Math.cos(th), sn = Math.sin(th), dr = dirN, hx = dr * .32 * cs, hy = -.74 + .32 * sn;
        o.arms = two([hx - .04, hy + .02], [hx + .04, hy - .02]); pick = { hx, hy, cs, sn, dr, sw };
      } else if (p > .53 && p < .575 && ag) { // the turban, then the sword into Ali's hand
        const ah = Holy.head({ who: 'ali', pose: 'stand', x: ag[0], y: ag[1], h: 1.8 * F / ag[2] });
        const rch = smooth(seg(p, .53, .54)) * (1 - smooth(seg(p, .568, .575))), give = smooth(seg(p, .553, .56));
        let dx = (ah.x - pg[0]) / h, dy = (ah.y - pg[1]) / h - .02; const L = Math.hypot(dx, dy + .74); if (L > .62) { dx *= .62 / L; dy = -.74 + (dy + .74) * .62 / L; }
        const wind = .025 * Math.sin(p * 900) * (1 - give);
        const head = [[dx - .06 + wind, dy], [dx + .05 - wind, dy - .03]], hand = [[-.12, -.42], [mix(dx, dx * .8, .5), -.5]];
        o.arms = two(...head.map((hp, i) => [mix(i ? .14 : -.14, mix(hp[0], hand[i][0], give), rch), mix(-.42, mix(hp[1], hand[i][1], give), rch)]));
      } else {
        const up = smooth(seg(p, .578, .592)) * (1 - smooth(seg(p, .695, .71))) + smooth(seg(p, .742, .76)) * (1 - smooth(seg(p, .885, .9)));
        if (up > 0) o.arms = [[mix(-.13, -.21, up), mix(-.42, -1.07, up)], [mix(.13, .21, up), mix(-.42, -1.07, up)]];
      }
      const drawPick = () => {
        const { hx, hy, cs, sn, dr } = pick, X = pg[0] + hx * h, Y = pg[1] + hy * h, dxp = dr * cs, dyp = sn, nx = -sn, ny = dr * cs;
        const ex = X + dxp * .5 * h, ey = Y + dyp * .5 * h;
        c.save(); c.globalAlpha = proA; c.lineCap = 'round';
        c.strokeStyle = rgb(v3.mul([132, 96, 60], famb * 1.15)); c.lineWidth = Math.max(1.2, h * .018);
        c.beginPath(); c.moveTo(X - dxp * .12 * h, Y - dyp * .12 * h); c.lineTo(ex, ey); c.stroke();
        c.fillStyle = rgb(v3.mul([58, 56, 60], famb * 1.3)); c.beginPath();
        c.moveTo(ex + nx * .17 * h, ey + ny * .17 * h); c.quadraticCurveTo(ex + dxp * .07 * h, ey + dyp * .07 * h, ex - nx * .13 * h, ey - ny * .13 * h);
        c.lineTo(ex - nx * .1 * h - dxp * .02 * h, ey - ny * .1 * h - dyp * .02 * h); c.quadraticCurveTo(ex - dxp * .03 * h, ey - dyp * .03 * h, ex + nx * .14 * h - dxp * .025 * h, ey + ny * .14 * h - dyp * .025 * h); c.closePath(); c.fill();
        c.strokeStyle = rgb(mixc([200, 190, 176], [255, 226, 186], sunK), .5 * famb); c.lineWidth = Math.max(.6, h * .005); c.stroke();
        c.restore();
      };
      if (pick && pick.sw < .4) drawPick();
      const hd = Holy.draw(c, o);
      if (pick && pick.sw >= .4) drawPick();
      holyGlow(hd, o.alpha, 1.15);
    }]);
    duelists.sort((u, v) => v[0] - u[0]).forEach(([, f]) => f());
    duelDust(true);
    // ----- wind: grit in the air; in the storm a flood of sand driven out of the east -----
    {
      const wv = [mix(2, 44, storm), 0, mix(-3, 2, storm)], L = 160, Wz = 220, Hy = mix(14, 60, storm), T0 = t + p * 30;
      const n = Math.floor(st.dust.length * (.22 + storm * .78) * (1 - .6 * c01(night - storm)));
      c.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) {
        c.strokeStyle = pass ? rgb(mixc(haze, [255, 226, 190], .3), .32 + storm * .35) : rgb(mixc(haze, [50, 38, 28], .35), .3 + storm * .4);
        c.lineWidth = pass ? 1 : 1.8; c.beginPath();
        for (let i = pass; i < n; i += 2) {
          const [u, v, w, k] = st.dust[i], sp = .6 + k;
          const x = e0 + 3 + (((u * L + wv[0] * sp * T0) % L) + L) % L, z = e2 - Wz / 2 + (((w * Wz + wv[2] * sp * T0) % Wz) + Wz) % Wz, y = v * v * Hy;
          if (!pj(x, y, z)) continue; const ax = QX, ay = QY;
          if (!pj(x - wv[0] * sp * (.05 + storm * .05) - 1.2, y, z - wv[2] * sp * .05)) continue;
          c.moveTo(ax, ay); c.lineTo(QX, QY);
        }
        c.stroke();
      }
      if (storm > .02) { c.fillStyle = rgb(haze, .16 * storm); c.fillRect(0, 0, W, H); }
    }
    // ----- bloom -----
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = .75; c.drawImage(st.bloom, 0, 0, W, H); c.globalAlpha = 1;
    // ----- the flash: one bloom at the meeting point, the whole frame whitened for a breath -----
    const fl = Math.max(0, 1 - Math.abs(p - FLASH_N) / .006) ** .7 + .55 * smooth(seg(p, FLASH_N, FLASH_N + .003)) * (1 - smooth(seg(p, FLASH_N + .003, FLASH_N + .04)));
    if (fl > 0) {
      const q = P([D[0], 1.4, D[2]]);
      if (q) { const r = F / q[2] * 9 * (1 + fl), g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); g.addColorStop(0, `rgba(255,250,232,${Math.min(1, fl)})`); g.addColorStop(.3, `rgba(255,226,170,${.5 * fl})`); g.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = g; c.fillRect(q[0] - r, q[1] - r, r * 2, r * 2); }
      c.fillStyle = `rgba(255,240,214,${.5 * Math.min(1, fl)})`; c.fillRect(0, 0, W, H);
    }
    // ----- the three strikes: a flash on the rock, and in each the far palaces stand in the light for a breath:
    // al-Sham, al-Mada'in, al-Yaman; while he speaks of them all three return faintly together -----
    const ech = .3 * smooth(seg(p, S3 + .012, S3 + .02)) * (1 - smooth(seg(p, .325, .342)));
    if (p > S1 - .003 && p < .345) {
      const rk = P([ROCK[0] - .4, ROCK[1] + 1.15, ROCK[2] - .7]);
      [S1, S2, S3].forEach((k, n) => {
        const fk = strikeK(k), vk = Math.max(ech, .65 * smooth(seg(p, k - .0005, k + .002)) * (1 - smooth(seg(p, k + .008, k + .016))));
        if (fk > .01 && rk) { const r = F / rk[2] * 2.2 * (1 + fk), g = c.createRadialGradient(rk[0], rk[1], 0, rk[0], rk[1], r); g.addColorStop(0, `rgba(255,250,232,${Math.min(1, fk)})`); g.addColorStop(.35, `rgba(255,226,170,${.45 * fk})`); g.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = g; c.fillRect(rk[0] - r, rk[1] - r, r * 2, r * 2); c.fillStyle = `rgba(255,240,214,${.2 * Math.min(1, fk)})`; c.fillRect(0, 0, W, H); }
        if (vk > .01) drawVision(c, n, phone ? W * (.2 + n * .3) : W * (.12 + n * .2), Math.min(hy, H * .62), phone ? W * .27 : W * .16, phone ? H * .13 : H * .2, vk);
      });
    }
    c.globalCompositeOperation = 'source-over';
    // ----- grade -----
    if (night > 0) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(50,80,150,${.3 * night})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    const vg = c.createRadialGradient(W / 2, H * .52, Math.min(W, H) * .32, W / 2, H * .52, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(6,7,10,0)'); vg.addColorStop(1, `rgba(6,7,10,${mix(.5, .68, storm)})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};

// The horse in full: articulated legs, a gait from p, pitch for the leap and the rearing; the rider while mounted.
function drawHorseFull(c, dpr, x, y, s, face, A, mounted, col, t) {
  c.setTransform(dpr * s * face, 0, 0, dpr * s, dpr * x, dpr * y);
  const pv = A.gait === 'rear' ? [-.75, 0] : [0, -1.1];
  c.translate(pv[0], pv[1]); c.rotate(-A.pitch); c.translate(-pv[0], -pv[1]);
  c.fillStyle = rgb(col); c.strokeStyle = rgb(col); c.lineCap = 'round'; c.lineJoin = 'round';
  const ang = A.ph * TAU;
  LEGS.forEach(([u, v, front, ph], li) => {
    let a1 = 0, a2 = 0;
    if (A.gait === 'gallop') { const w = ang + ph * TAU; a1 = (front ? .62 : .5) * Math.sin(w); a2 = front ? -Math.max(0, Math.sin(w + 1.3)) * 1.35 : Math.max(0, Math.sin(w + 1.6)) * .9; }
    else if (A.gait === 'leap') { a1 = front ? .95 : -.85; a2 = front ? -1.75 : -.15; }
    else if (A.gait === 'rear') { a1 = front ? .55 + .15 * Math.sin(t * 6 + li) : .3; a2 = front ? -1.5 : .2; }
    else { a1 = .03 * Math.sin(A.ph + li); }
    const L1 = front ? .5 : .52, L2 = .58;
    const kx = u + Math.sin(a1) * L1, ky = v + Math.cos(a1) * L1, hx = kx + Math.sin(a1 + a2) * L2, hy = ky + Math.cos(a1 + a2) * L2;
    c.lineWidth = .15; c.beginPath(); c.moveTo(u, v); c.lineTo(kx, ky); c.lineTo(hx, hy); c.stroke();
    c.lineWidth = .1; c.beginPath(); c.moveTo(hx - .02, hy); c.lineTo(hx + .1, hy); c.stroke();
  });
  c.beginPath(); HORSE.forEach(([u, v], i) => (i ? c.lineTo(u, v) : c.moveTo(u, v))); c.closePath(); c.fill();
  const wv = Math.sin(t * 5 + A.ph * 3) * .06;
  c.lineWidth = .16; c.beginPath(); c.moveTo(-1.02, -1.42); c.quadraticCurveTo(-1.5, -1.42 + wv, -1.62, -1.02 + wv * 2); c.stroke();
  c.lineWidth = .1; c.beginPath(); c.moveTo(.6, -1.6); c.quadraticCurveTo(.75, -1.9, 1.0, -2.12); c.stroke();
  if (mounted) { // mail, a helmet, a cloak driven back, a long lance
    c.beginPath(); c.moveTo(-.2, -1.5); c.lineTo(.2, -1.5); c.lineTo(.22, -2.3); c.lineTo(-.06, -2.34); c.closePath(); c.fill();
    c.lineWidth = .16; c.beginPath(); c.moveTo(0, -1.52); c.lineTo(.28, -1.2); c.lineTo(.2, -.92); c.stroke();
    c.beginPath(); c.arc(.1, -2.5, .15, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(.02, -2.62); c.lineTo(.1, -2.82); c.lineTo(.18, -2.62); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-.02, -2.28); c.quadraticCurveTo(-.6, -2.2 + wv, -1.05, -1.9 + wv * 2); c.lineTo(-.2, -1.62); c.closePath(); c.fill();
    c.lineWidth = .06; c.beginPath(); c.moveTo(-.9, -1.75); c.lineTo(2.5, -2.45); c.stroke();
    c.beginPath(); c.moveTo(2.5, -2.45); c.lineTo(2.25, -2.48); c.lineTo(2.3, -2.36); c.closePath(); c.fill();
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}
// The dark figure on foot: a long mail coat, a helmet, a sword; he circles, then falls backward into the dust.
function drawMan(c, dpr, x, y, s, face, p, fall, col, t) {
  c.setTransform(dpr * s * face, 0, 0, dpr * s, dpr * x, dpr * y);
  if (fall > .7) { // down in the dust: a long dark shape on the ground, the sword fallen beside it
    const k = smooth(seg(fall, .7, 1)), a0 = c.globalAlpha;
    c.fillStyle = rgb(col); c.strokeStyle = rgb(col);
    c.globalAlpha = a0 * k;
    c.beginPath(); c.moveTo(-2.1, -.05); c.quadraticCurveTo(-1.9, -.42, -1.3, -.4); c.quadraticCurveTo(-.4, -.46, .15, -.26); c.quadraticCurveTo(.35, -.1, .2, 0); c.closePath(); c.fill();
    c.beginPath(); c.arc(-1.95, -.2, .16, 0, TAU); c.fill();
    c.lineWidth = .06; c.beginPath(); c.moveTo(.5, -.04); c.lineTo(1.35, -.1); c.stroke();
    c.globalAlpha = a0 * (1 - k);
  }
  c.rotate(-fall * 1.5); c.translate(-fall * .2, 0);
  c.fillStyle = rgb(col); c.strokeStyle = rgb(col); c.lineCap = 'round'; c.lineJoin = 'round';
  const walk = Math.sin(p * 260) * (1 - fall) * (p > .314 && p < FLASH ? 1 : .15);
  c.lineWidth = .17; c.beginPath(); c.moveTo(0, -.85); c.lineTo(.18 * walk, -.42); c.lineTo(.25 * walk, 0); c.moveTo(0, -.85); c.lineTo(-.18 * walk, -.42); c.lineTo(-.2 * walk, 0); c.stroke();
  c.beginPath(); c.moveTo(-.25, -1.52); c.lineTo(.21, -1.52); c.lineTo(.37, -.6); c.lineTo(-.42, -.6); c.closePath(); c.fill();
  const wv = Math.sin(t * 4 + p * 30) * .05;
  c.beginPath(); c.moveTo(-.2, -1.5); c.quadraticCurveTo(-.72, -1.2 + wv, -.88, -.52 + wv); c.lineTo(-.3, -.7); c.closePath(); c.fill();
  c.beginPath(); c.arc(0, -1.7, .15, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(-.08, -1.82); c.lineTo(0, -2.02); c.lineTo(.08, -1.82); c.closePath(); c.fill();
  const raise = smooth(seg(p, .4, FLASH)) * (1 - fall), hx = .4 + .05 * raise, hy = mix(-1.15, -1.95, raise);
  c.lineWidth = .13; c.beginPath(); c.moveTo(.12, -1.45); c.lineTo(hx, hy); c.stroke();
  c.lineWidth = .06; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + mix(.75, .35, raise), hy - mix(.35, .8, raise)); c.stroke();
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}
// One of the three far palaces, seen in the light of a strike: a silhouette of light standing on the horizon at
// (x, base), w wide and h tall. n = 0 al-Sham (domes over arcades), 1 al-Mada'in (the great arch of the Persian king's
// hall between walls of blind arcades), 2 al-Yaman (tower-houses of many storeys). Drawn additively; no figures.
function drawVision(c, n, x, base, w, h, a) {
  const U = (u) => x + u * w, V = (v) => base - v * h;
  const rect = (u0, v0, u1, v1) => { c.moveTo(U(u0), V(v0)); c.lineTo(U(u1), V(v0)); c.lineTo(U(u1), V(v1)); c.lineTo(U(u0), V(v1)); c.closePath(); };
  const arch = (u0, u1, v0, v1) => { const m = (u0 + u1) / 2; c.moveTo(U(u0), V(v0)); c.lineTo(U(u0), V(v1 - (u1 - u0) * .5 * w / h)); c.quadraticCurveTo(U(u0), V(v1), U(m), V(v1)); c.quadraticCurveTo(U(u1), V(v1), U(u1), V(v1 - (u1 - u0) * .5 * w / h)); c.lineTo(U(u1), V(v0)); c.closePath(); };
  const dome = (u, v, rx, ry) => { c.moveTo(U(u - rx), V(v)); c.ellipse(U(u), V(v), rx * w, ry * h, 0, Math.PI, 0); c.closePath(); };
  c.save(); c.globalCompositeOperation = 'lighter';
  const halo = c.createRadialGradient(x, base - h * .4, 0, x, base - h * .4, w * .9); halo.addColorStop(0, `rgba(255,214,150,${.32 * a})`); halo.addColorStop(1, 'rgba(255,214,150,0)');
  c.fillStyle = halo; c.fillRect(x - w, base - h * 1.4, w * 2, h * 1.6);
  const g = c.createLinearGradient(0, base, 0, base - h); g.addColorStop(0, `rgba(255,200,130,${.04 * a})`); g.addColorStop(.3, `rgba(255,214,150,${.24 * a})`); g.addColorStop(1, `rgba(255,232,190,${.15 * a})`);
  c.shadowColor = `rgba(255,210,140,${.8 * a})`; c.shadowBlur = Math.max(6, h * .06);
  c.fillStyle = g; c.beginPath();
  if (n === 0) {
    rect(-.5, 0, .5, .07); rect(-.14, .07, .14, .36); dome(0, .36, .16, .24); rect(-.006, .6, .006, .68);
    [-1, 1].forEach((sd) => { rect(sd * .19, .07, sd * .35, .24); dome(sd * .27, .24, .085, .12); rect(sd * .36, .07, sd * .5, .17); });
    for (let i = 0; i < 4; i++) { const u = -.49 + i * .034; arch(u, u + .022, .07, .14); arch(-u - .022, -u, .07, .14); }
    for (let i = 0; i < 4; i++) arch(-.11 + i * .06, -.07 + i * .06, .1, .26);
  } else if (n === 1) {
    rect(-.5, 0, -.17, .5); rect(.17, 0, .5, .5); rect(-.17, 0, .17, .64); arch(-.12, .12, 0, .56);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const v = .06 + r * .14, u = .2 + i * .075; arch(u, u + .045, v, v + .1); arch(-u - .045, -u, v, v + .1); }
  } else {
    [[-.46, -.3, .46], [-.28, -.08, .86], [-.06, .1, 1], [.12, .3, .7], [.32, .48, .54]].forEach(([u0, u1, v1]) => {
      rect(u0, 0, u1, v1);
      for (let k = 0; k < 3; k++) rect(u0 + (k + .25) * (u1 - u0) / 3, v1, u0 + (k + .75) * (u1 - u0) / 3, v1 + .04);
      for (let v = .08; v < v1 - .06; v += .11) for (let k = 0; k < 2; k++) rect(u0 + (k + .3) * (u1 - u0) / 2 - .012, v, u0 + (k + .3) * (u1 - u0) / 2 + .012, v + .045);
    });
  }
  c.fill('evenodd');
  c.restore();
}
})();
