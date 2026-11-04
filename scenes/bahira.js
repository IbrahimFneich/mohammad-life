(() => {
// bahira — «قافلة الشام»: the boy Prophet ﷺ goes with Abu Talib's caravan toward Syria, and the monk Bahira knows him.
// Kamal al-Din (al-Saduq) 1:182–188, two narrations: Abu Talib's own long account (1:182–186) and the short one through
// Ali b. Ibrahim, Ibn Abi Umayr and Aban (1:187–188). One day's light carries the whole road; the camera travels with
// him from right to left (the road north), then he turns for home:
//   p −.05 → .185  Mecca in the morning sun: the caravan of Quraysh stands loaded at the edge of the town under the
//                  granite hills. The boy comes up from the town and takes hold of the camel's rein (زمام), Abu Talib
//                  turns to him and lays a hand on his shoulder, and takes him along (1:187).
//      .185 → .41  the road north at midday: the granite falls behind, golden dunes, acacias. A white cloud gathers over
//                  the boy's head and goes with him, its shade on him alone (1:187).
//      .41 → .49   a halt: the dry hollows fill with water and the ground round them turns green (1:183).
//      .49 → .6    the black basalt country, then the red earth and fields of the Hawran: on a low hill to the left, a
//                  stone hermitage, a lamp in its window, Busra's dark walls far behind.
//      .555 → .72  the monk comes out and down the hill toward the road (1:188). The caravan halts by a great bare tree;
//                  the boy sits under it; the tree shakes, its branches come down over him, it leafs and bears fruit of
//                  three kinds (1:183).
//      .72 → .89   Bahira stands before him and bows (1:183); the boy rises (al-Lat and al-Uzza, 1:184–185).
//      .89 → .95   Bahira turns to Abu Talib and points south: «ردّ هذا الغلام إلى بلاده» (1:188).
//      .93 → 1.05  the camels turn, and Abu Talib and the boy walk back the way they came, the cloud still over him, in
//                  the low gold of the afternoon; the monk stands by the tree and watches them go.
// The Prophet is drawn only by Holy.draw (child, veiled, the gold disc). Abu Talib, Bahira and the men of the caravan are
// faceless cloaked shapes; the camels are painted shapes. No seal, no angels. A side view in metres: x to the right of the
// frame, y up, z away from the camera. Everything follows from p; t moves only cloth, leaves, the cloud's drift and dust.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const mul = (a, b) => a.map((v, i) => v * b[i]);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
function smoothPath(g, P) { // a closed curve through the midpoints of P
  const n = P.length, m = (i) => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
  const s = m(n - 1); g.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const e = m(i); g.quadraticCurveTo(P[i][0], P[i][1], e[0], e[1]); }
  g.closePath();
}
function tube(g, pts, w0, w1) { // a tapered stroke as one filled outline
  const L = [], R = [];
  pts.forEach((q, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = mix(w0, w1, i / (pts.length - 1)) / 2;
    L.push([q[0] - dy / l * w, q[1] + dx / l * w]); R.push([q[0] + dy / l * w, q[1] - dx / l * w]);
  });
  g.moveTo(L[0][0], L[0][1]); L.forEach((q) => g.lineTo(q[0], q[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
}

// ---------- places and paths ----------
const XR = -1.4, XP = -120, XT = -262, HX = -281, HZ = 40; // the rein at Mecca, the pools, the tree, the hermitage
const ZB = 8.4, CAMY = 1.75; // the boy's depth; the eye's height
// a walker's x through the scene: [p, x]; he walks between keys whose x differ and stands where they agree
function walkAt(K, p) {
  if (p <= K[0][0]) return { x: K[0][1], walk: false, d: 0, dir: 0 };
  let d = 0;
  for (let i = 1; i < K.length; i++) {
    const [p0, x0] = K[i - 1], [p1, x1] = K[i];
    if (p < p1) { const k = (p - p0) / (p1 - p0), e = x0 === x1 ? 0 : k < .12 ? k * k / .24 : k > .88 ? 1 - (1 - k) ** 2 / .24 : (k - .06) / .88; return { x: mix(x0, x1, e), walk: x0 !== x1 && k > .01 && k < .99, d: d + Math.abs(x1 - x0) * e, dir: Math.sign(x1 - x0) }; }
    d += Math.abs(x1 - x0);
  }
  return { x: K[K.length - 1][1], walk: false, d, dir: 0 };
}
const KB = [[-.06, 7.6], [.02, 7.6], [.1, XR], [.185, XR], [.41, XP + 1.5], [.49, XP + 1.5], [.6, XT], [.935, XT], [1.06, XT + 7.5]]; // the boy
const KA = [[-.06, XR - 1.75], [.118, XR - 1.75], [.15, XR - .8], [.185, XR - .8], [.41, XP + .7], [.49, XP + .7], [.6, XT - .8], [.612, XT - .8], [.645, XT + 1.45], [.935, XT + 1.45], [1.06, XT + 8.95]]; // Abu Talib
const KC = [[-.06, XR + 1.15], [.185, XR + 1.15], [.41, XP + 2.65], [.49, XP + 2.65], [.6, XT + 3.6], [.935, XT + 3.6], [1.06, XT + 11.1]]; // the lead camel's nose
const CZ = [10.9, 12.3, 11.4, 12.8, 11.1, 12.1, 11.6, 12.9]; // the camels' depths
const MONK = [[HX + 1.2, HZ - 2.2], [HX + 3.4, HZ - 9], [HX + 7.5, HZ - 17], [HX + 13, HZ - 24], [XT - 1.75, 8.95]];
const TREE = [XT - .45, 9.75];
const POOLS = [[XP - 3.2, 13.4, 2.3, .8], [XP + 2.9, 15.6, 1.7, .6], [XP - .6, 20.5, 2.9, 1.1], [XP + 7, 24, 2.2, .8]]; // x, z, radius x, radius z

// ---------- the land: a road corridor kept flat; dunes, basalt, the Hawran plain; granite round Mecca; far ranges ----------
function crag(x, z) { // ridged noise: creased, broken rock
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
const wMecca = (x) => smooth(c01((x + 58) / 46));
const wHarra = (x) => smooth(c01((-x - 138) / 24)) * (1 - smooth(c01((-x - 196) / 22)));
const wHaur = (x) => smooth(c01((-x - 204) / 30));
function hgt(x, z) {
  const m = wMecca(x), hr = wHarra(x), hu = wHaur(x), sd = Math.max(0, 1 - m - hr - hu), off = smooth(c01((z - 15) / 32));
  let h = .1 * Math.sin(x * .9 + z * .4) * Math.sin(z * 1.3 + x * .2);
  const du = (1 - Math.abs(Math.sin(x * .052 + Math.sin(z * .019 + x * .006) * 2.4 + z * .011))) ** 2.4;
  h += off * sd * (1.1 + 8 * smooth(c01((z - 40) / 240))) * (du * .85 + .3 * Math.sin(x * .017 + z * .011));
  h += off * hr * (.9 + 3.4 * crag(x * 3.1, z * 3.1)) * (.6 + .4 * smooth(c01((z - 30) / 80)));
  h += off * hu * (.5 + .7 * Math.sin(x * .021 + z * .013) * Math.sin(z * .02 - x * .01));
  h += m * smooth(c01((z - 110) / 160)) * (16 + 46 * crag(x * 1.6 + 300, z * 1.6) + 12 * Math.sin(x * .011 + 1));
  h += smooth(c01((z - 480) / 1300)) * (80 + 250 * crag(x * .5 + 1000, z * .5) * (.55 + .45 * Math.sin(x * .0016 + 2)));
  h += hu * 220 * Math.exp(-(((x + 900) / 520) ** 2)) * smooth(c01((z - 1500) / 900)); // the far cones of the Hawran hills
  h += 5.2 * Math.exp(-(((x - HX) / 15) ** 2) - (((z - HZ) / 12) ** 2)); // the hermitage's hill
  h -= .45 * Math.exp(-(((x - XP) / 9) ** 2) - (((z - 18) / 6) ** 2)); // the hollow of the pools
  return h;
}
const SAND = [238, 202, 148], SANDD = [214, 172, 122], GRAV = [204, 168, 128], GRAN = [170, 112, 90], BAS = [72, 66, 68], SOIL = [204, 150, 104], FGRN = [150, 162, 86], FGLD = [226, 196, 120], GREEN = [104, 166, 84], FAR = [150, 136, 168];
function albedo(x, z, gk) {
  const m = wMecca(x), hr = wHarra(x), hu = wHaur(x), sd = Math.max(0, 1 - m - hr - hu);
  const drift = c01(.5 + .55 * Math.sin(x * .031 + Math.sin(z * .021) * 2) * Math.sin(z * .026 - x * .011 + 1));
  let a = lerp(SANDD, SAND, drift).map((v) => v * sd);
  const mc = lerp(GRAV, GRAN, smooth(c01((z - 45) / 60)));
  const bas = lerp(BAS, lerp(BAS, SANDD, .3), c01(.5 + .5 * Math.sin(x * .2 + z * .13)) * (1 - smooth(c01((z - 20) / 40))));
  const fi = Math.floor(x * .045 + z * .03 + Math.sin(z * .05) * 1.2), fh = Math.abs(Math.sin(fi * 12.9898) * 43758.5453) % 1;
  const haur = z > 13 ? (fh < .34 ? FGRN : fh < .7 ? FGLD : SOIL) : SOIL;
  a = a.map((v, j) => v + mc[j] * m + bas[j] * hr + haur[j] * hu);
  const far = smooth(c01((z - 420) / 700));
  if (far > 0) a = lerp(a, FAR, far);
  if (z < 24) { const mt = .93 + .07 * Math.sin(x * .7 + z * 1.3) * Math.sin(z * .9 - x * .45) + .04 * Math.sin(x * 2.3 + z * 3.1); a = a.map((v) => v * mt); } // the near ground mottled: gravel and drifted dust
  if (gk > 0) { const g = gk * Math.exp(-(((x - XP) / 17) ** 2) - (((z - 19) / 10) ** 2)); if (g > .01) a = lerp(a, GREEN, Math.min(1, g * 1.3)); }
  return a;
}

// ---------- light keys: p, sky top, sky mid, horizon, sun colour, sky light, haze, sun elevation (deg), azimuth (rad, 0 = ahead, + = right), fog length ----------
const LK = [
  [-.06, [30, 80, 148], [92, 146, 202], [236, 214, 184], [255, 226, 186], [146, 148, 160], [196, 200, 214], 30, -.9, 2600],
  [.2, [24, 76, 154], [80, 142, 206], [214, 222, 226], [255, 244, 222], [150, 158, 174], [184, 200, 220], 50, -1.9, 3000],
  [.42, [22, 72, 152], [78, 140, 204], [222, 224, 216], [255, 246, 226], [152, 158, 172], [186, 200, 218], 64, 2.6, 3000],
  [.6, [26, 72, 148], [92, 144, 200], [236, 218, 192], [255, 234, 200], [148, 150, 162], [200, 202, 214], 40, 2.4, 2800],
  [.8, [32, 70, 142], [106, 140, 192], [244, 210, 172], [255, 214, 166], [142, 138, 152], [232, 200, 170], 24, 2.55, 2500],
  [1.06, [36, 62, 128], [122, 132, 180], [248, 198, 162], [255, 192, 138], [134, 124, 144], [236, 186, 156], 11, 2.75, 2300],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const SEAT = [-.3, 0, -.32, .28, -.22, .62, -.17, .74, -.16, .86, -.1, .97, .02, 1.0, .11, .93, .12, .82, .08, .74, .2, .64, .26, .4, .36, .2, .38, 0];
const ABUT = [-.44, 0, -.38, .5, -.32, 1.0, -.3, 1.36, -.24, 1.5, -.14, 1.57, -.15, 1.66, -.11, 1.79, -.01, 1.87, .1, 1.85, .16, 1.76, .16, 1.64, .11, 1.56, .22, 1.5, .3, 1.35, .33, 1.0, .37, .5, .43, 0];
const MONKS = [-.4, 0, -.35, .55, -.31, 1.05, -.28, 1.38, -.22, 1.52, -.17, 1.64, -.08, 1.75, .04, 1.77, .13, 1.7, .18, 1.57, .14, 1.47, .22, 1.42, .28, 1.28, .3, .9, .34, .5, .38, 0];
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };
// the camel, side on, facing +u: a dromedary's line, one hump, the neck low and forward
const CAMB = [[-1.28, 1.6], [-1.22, 1.86], [-.86, 2.02], [-.42, 2.3], [-.08, 2.42], [.3, 2.26], [.62, 1.98], [.86, 1.86], [1.2, 1.62], [1.5, 1.74], [1.72, 2.04], [1.84, 2.25], [2.06, 2.29], [2.3, 2.14], [2.33, 2.0], [2.12, 1.97], [1.88, 1.9], [1.62, 1.55], [1.32, 1.3], [.98, 1.14], [.74, 1.04], [.2, 1.08], [-.5, 1.1], [-.96, 1.2], [-1.22, 1.36]];
const CLEG = [[-.86, 0, 1], [.72, 0, 1], [-.7, .5, 0], [.56, .5, 0]]; // u, gait phase (a pace: one side's legs together), near (1) / far (0)

S.bahira = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.glow = sprite([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]);
    st.warm = sprite([[0, 'rgba(255,200,130,.9)'], [.3, 'rgba(255,176,100,.35)'], [1, 'rgba(255,160,90,0)']]);
    st.puff = sprite([[0, 'rgba(255,255,255,1)'], [.55, 'rgba(255,255,255,.85)'], [.8, 'rgba(255,255,255,.3)'], [1, 'rgba(255,255,255,0)']], 96);
    st.NS = 58; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(4417);
    const O = []; // things in the land: [kind, x, z, size, seed]
    for (let i = 0; i < 90; i++) { const x = -235 + R() * 250, z = 17 + R() ** 1.4 * 150; if (wMecca(x) > .6 && z < 70) continue; O.push(['acacia', x, z, .7 + R() * .6, R()]); }
    for (let i = 0; i < 26; i++) { const x = -300 + R() * 90, z = 18 + R() * 70; if (Math.abs(x - HX) < 10 && Math.abs(z - HZ) < 9) continue; O.push(['olive', x, z, .8 + R() * .4, R()]); } // the Hawran's trees
    for (let i = 0; i < 170; i++) { const x = -300 + R() * 325, z = 13.5 + R() ** 1.3 * 60; if (Math.abs(x - XP) < 11 && z < 27) continue; if (Math.abs(x - XT) < 6 && z < 16) continue; O.push(['rock', x, z, .25 + R() ** 2 * 1.3, R()]); }
    for (let i = 0; i < 70; i++) O.push(['rock', -215 + R() * 76, 13.5 + R() ** 1.2 * 45, .3 + R() ** 2 * 1.1, R()]); // the black basalt country
    for (let i = 0; i < 26; i++) O.push(['house', 7 + R() * 44, 24 + R() * 46, 3.2 + R() * 4, R()]); // the edge of Mecca
    for (let i = 0; i < 30; i++) O.push(['town', -380 + R() * 110, 190 + R() * 140, 6 + R() * 10, R()]); // Busra's walls, far
    [[-6, 7], [5, 5], [-8.5, 2], [7.5, -1.5]].forEach(([dx, dz]) => O.push(['cypress', HX + dx, HZ + dz, 1, R()]));
    O.push(['cell', HX, HZ, 1, 0]);
    O.push(['wall', HX + 1, HZ - 3.2, 1, 0]);
    st.O = O;
    st.scrub = Array.from({ length: 260 }, () => [-300 + R() * 330, 3.8 + R() * 4, .14 + R() * .26, R()]).concat(Array.from({ length: 60 }, () => [-292 + R() * 64, 4 + R() * 9, .16 + R() * .3, R() * .55])); // and more grass near the tree // near the eye: tufts and stones
    st.rip = Array.from({ length: 520 }, () => [-300 + R() * 330, 4 + R() ** 1.6 * 30, R()]);
    st.cirrus = Array.from({ length: 9 }, () => [R() * 1.6 - .3, .1 + R() * .35, .2 + R() * .4, R()]);
    st.dust = Array.from({ length: 70 }, () => [R(), R(), R()]);
    st.dustS = sprite([[0, 'rgba(236,210,168,.8)'], [.5, 'rgba(236,210,168,.3)'], [1, 'rgba(236,210,168,0)']]);
    st.leaves = Array.from({ length: 300 }, () => [R(), R(), R(), R()]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700; // a tall but wide canvas is the stacked reduced-motion page, not a phone
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const push = smooth(seg(p, .7, .93)) * (1 - smooth(seg(p, .95, 1.04))), wide = phone ? bump(p, .53, .57, .72, .76) : 0; // phones pull back to show the hill while the monk comes down
    const F = (phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7)) * (1 + .2 * push) * (1 - .27 * wide), hy = H * (phone ? .63 : .585) - H * .03 * push; // the camera leans in on the three under the tree
    // ----- who is where -----
    const boy = walkAt(KB, p), abu = walkAt(KA, p), col = walkAt(KC, p);
    const aimX = phone ? .5 + .14 * wide : .4;
    const lookX = (p < .1 ? XR : boy.x) + (phone ? -1.2 * bump(p, .76, .8, .93, .97) : 0);
    const camX = lookX - (aimX - .5) * W / F * ZB;
    const PX = (x, z) => W / 2 + (x - camX) * F / z, PY = (y, z) => hy - (y - CAMY) * F / z;
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LK, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const sunSide = Math.sign(sun[0]) || 1, front = c01(-sun[2]); // which side of a figure the sun lights; how much it lights their front
    const fig = (base, z = 8) => { const k = [0, 1, 2].map((j) => base[j] / 255 * (amb[j] * .62 + sunC[j] * (.32 + .3 * front))); return lerp(k, haze, Math.min(.8, 1 - Math.exp(-z / fogL)) * .9); };
    const gk = smooth(seg(p, .425, .485)); // the land greening at the pools
    // ----- sky -----
    const sg = c.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.58, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    if (sun[2] > .05) { // the sun ahead: a white disc and its glare
      const sx = W / 2 + sun[0] / sun[2] * F, sy = hy - sun[1] / sun[2] * F;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, F * .9); g.addColorStop(0, rgb(sunC, .55)); g.addColorStop(.12, rgb(sunC, .2)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = 'rgba(255,250,236,.97)'; c.beginPath(); c.arc(sx, sy, F * .012, 0, TAU); c.fill();
    } else { // the sun behind: its warmth comes back off the sky low down
      const g = c.createLinearGradient(0, hy * .55, 0, hy); g.addColorStop(0, rgb(sunC, 0)); g.addColorStop(1, rgb(sunC, .18 * (1 - sun[1])));
      c.fillStyle = g; c.fillRect(0, hy * .55, W, hy * .45);
    }
    // high thin cloud
    st.cirrus.forEach(([u, v, w, k]) => {
      const x = ((u * W - camX * .6 + p * W * .05) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = v * hy, rw = w * W * .5, rh = rw * .05;
      c.save(); c.translate(x, y); c.rotate(-.04 + k * .08); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(lerp([255, 255, 255], sunC, .3), .3 + .2 * k)); g.addColorStop(1, rgb([255, 255, 255], 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    // ----- terrain: depth bands far to near, painted by terrainRaster in core.js -----
    {
      const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 3.2, z1 = 7000;
      for (let i = 0; i < NS; i++) {
        const z = z0 * (z1 / z0) ** (1 - i / (NS - 1)), fa = Math.min(.92, (1 - Math.exp(-z / fogL)) * .95), e = Math.max(.25, z * .006);
        for (let k = 0; k <= NK; k++) {
          const sx = -W * .06 + k * (W * 1.12 / NK), x = camX + (sx - W / 2) * z / F, h = hgt(x, z), o = i * (NK + 1) + k;
          TX[o] = sx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - CAMY) * F / z));
          if (k % 2 === 0) {
            const hx = (hgt(x + e, z) - h) / e, hz = (hgt(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl), sky = .62 + .38 / nl;
            const al = albedo(x, z, gk), n = (i * NC + k / 2) * 3;
            for (let j = 0; j < 3; j++) TC[n + j] = mix(al[j] / 255 * (amb[j] * sky * .68 + sunC[j] * lam * .8), haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .14);
    }
    // ----- on the ground: the road, the ripples, the pools -----
    {
      const y0 = PY(0, 12.6), y1 = PY(0, 7.4), pg = c.createLinearGradient(0, y0, 0, y1);
      pg.addColorStop(0, 'rgba(255,244,222,0)'); pg.addColorStop(.5, rgb(lerp(sunC, [255, 240, 214], .5), .16)); pg.addColorStop(1, 'rgba(255,244,222,0)');
      c.fillStyle = pg; c.fillRect(0, y0, W, y1 - y0);
      c.lineWidth = 1; c.strokeStyle = rgb(lerp(sunC, [120, 80, 50], .55), .18); c.beginPath();
      st.rip.forEach(([x, z, k]) => { const X = PX(x, z); if (X < -60 || X > W + 60) return; const Y = PY(hgt(x, z), z), L = (.3 + k * .7) * F / z; c.moveTo(X - L, Y); c.quadraticCurveTo(X, Y - L * .07, X + L, Y); });
      c.stroke();
      const fill = smooth(seg(p, .425, .475));
      if (fill > 0 && Math.abs(XP - camX) < 90) POOLS.forEach(([x, z, rx, rz], i) => {
        const X = PX(x, z), Y = PY(hgt(x, z) + .03, z), ax = rx * F / z * Math.min(1, fill * 1.4 - i * .1), ay = Math.max(1, (PY(0, z - rz) - PY(0, z + rz)) / 2) * Math.min(1, fill * 1.4 - i * .1);
        if (ax <= 0) return;
        c.fillStyle = rgb(lerp(GREEN, [60, 90, 40], .3), .5); c.beginPath(); c.ellipse(X, Y, ax * 1.25, ay * 1.35, 0, 0, TAU); c.fill(); // a wet green rim
        const g = c.createLinearGradient(0, Y - ay, 0, Y + ay); g.addColorStop(0, rgb(lerp(skM, [255, 255, 255], .25))); g.addColorStop(1, rgb(lerp(skT, skM, .4)));
        c.fillStyle = g; c.beginPath(); c.ellipse(X, Y, ax, ay, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(1, F / z * .03); c.beginPath(); c.ellipse(X, Y, ax * .97, ay * .9, 0, Math.PI * 1.1, Math.PI * 1.75); c.stroke();
        c.fillStyle = rgb(lerp(sunC, [255, 255, 255], .5), .5 + .3 * Math.sin(t * 2 + i)); c.fillRect(X - ax * .3, Y - ay * .15, ax * .25, Math.max(1, ay * .12)); // the sun's glint
      });
    }
    // ----- shadows on the ground, from each figure's feet away from the sun -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])); // shadow length per metre of height
    const shadow = (x, z, hgtM, w, a = .26) => {
      const tx = x - sun[0] / shH * shL * hgtM, tz = Math.max(3.5, z - sun[2] / shH * shL * hgtM);
      const X0 = PX(x, z), Y0 = PY(hgt(x, z), z), X1 = PX(tx, tz), Y1 = PY(hgt(tx, tz), tz), ww = w * F / z;
      const col2 = lerp(amb, [30, 30, 60], .55);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * .24); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(col2, a)); g.addColorStop(.6, rgb(col2, a * .7)); g.addColorStop(1, rgb(col2, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(col2, a * .8)); g2.addColorStop(1, rgb(col2, 0)); c.fillStyle = g2;
      c.beginPath(); c.moveTo(X0 - ww * .5, Y0); c.lineTo(X1 - ww * .25, Y1); c.lineTo(X1 + ww * .25, Y1); c.lineTo(X0 + ww * .5, Y0); c.closePath(); c.fill();
    };

    // ----- the things in the land, sorted far to near -----
    const items = [];
    const lit2 = (base, z) => fig(base, z);
    st.O.forEach(([kind, x, z, sz, seed]) => {
      const s = F / z, X = PX(x, z);
      if (X < -40 * s || X > W + 40 * s) return;
      items.push([z, () => {
        const Y = PY(hgt(x, z), z);
        if (kind === 'acacia') {
          const ht = 3.2 * sz, R0 = 2.3 * sz, trunk = lit2([92, 66, 48], z), dark = lit2([70, 92, 46], z), lt = lit2([150, 168, 84], z), sv = s;
          c.strokeStyle = rgb(trunk); c.lineCap = 'round';
          [[0, 1, .14], [-.5, .8, .09], [.55, .85, .09], [.2, .95, .07]].forEach(([u, v, w], j) => { c.lineWidth = Math.max(.8, w * s); c.beginPath(); c.moveTo(X + (j ? u * .15 : 0) * s, Y - (j ? .45 : 0) * sv); c.quadraticCurveTo(X + u * .5 * R0 * s, Y - v * .7 * ht * sv, X + u * R0 * .8 * s, Y - v * ht * sv); c.stroke(); });
          c.lineCap = 'butt';
          const cy2 = Y - ht * sv, rx = R0 * s, ry = Math.max(2, R0 * .28 * s);
          for (let j = 0; j < 5; j++) { const o = (j - 2) * .38 + Math.sin(seed * 9 + j) * .1; c.fillStyle = rgb(dark); c.beginPath(); c.ellipse(X + o * rx, cy2 + Math.abs(o) * ry * .5 + Math.sin(seed * 30 + j) * ry * .2, rx * .48, ry * .8, 0, 0, TAU); c.fill(); }
          const g = c.createLinearGradient(0, cy2 - ry, 0, cy2 + ry * .6); g.addColorStop(0, rgb(lt, .95)); g.addColorStop(1, rgb(lt, 0));
          c.fillStyle = g; c.beginPath(); c.ellipse(X + sunSide * rx * .1, cy2 - ry * .15, rx * .92, ry * .72, 0, Math.PI, TAU); c.fill();
        } else if (kind === 'olive') {
          const ht = 2.2 * sz, rr = 1.6 * sz * s, cy2 = Y - ht * s;
          c.strokeStyle = rgb(lit2([84, 70, 58], z)); c.lineWidth = Math.max(1, .22 * s); c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X - .2 * s, Y - ht * .5 * s, X + .1 * s, cy2); c.stroke();
          for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + seed * 5, q = .55 + .25 * Math.sin(seed * 20 + j); c.fillStyle = rgb(lit2(lerp([84, 102, 70], [138, 150, 108], (Math.sin(a) + 1) / 2 * .6), z)); c.beginPath(); c.ellipse(X + Math.cos(a) * rr * .45, cy2 - Math.sin(a) * rr * .25, rr * q, rr * q * .7, 0, 0, TAU); c.fill(); }
          c.fillStyle = rgb(lit2([168, 176, 128], z), .55); c.beginPath(); c.ellipse(X + sunSide * rr * .2, cy2 - rr * .35, rr * .7, rr * .35, 0, Math.PI, TAU); c.fill();
        } else if (kind === 'rock') {
          const w = sz * s, h = sz * .55 * s, base = lerp(lerp(lerp([176, 140, 104], GRAN, wMecca(x)), BAS, wHarra(x) + wHaur(x) * .7), [150, 120, 100], 0);
          const sh = lit2(lerp(base, [40, 40, 60], .35), z), lt = lit2(lerp(base, [255, 240, 220], .12), z);
          c.fillStyle = rgb(sh); c.beginPath(); c.moveTo(X - w, Y); c.lineTo(X - w * .6, Y - h * .8); c.lineTo(X - w * .05, Y - h); c.lineTo(X + w * .55, Y - h * .7); c.lineTo(X + w, Y); c.closePath(); c.fill();
          c.fillStyle = rgb(lt); c.beginPath(); c.moveTo(X - w * .6, Y - h * .8); c.lineTo(X - w * .05, Y - h); c.lineTo(X + w * .55, Y - h * .7); c.lineTo(X + w * .1 * sunSide, Y - h * .45); c.closePath(); c.fill();
        } else if (kind === 'house') {
          const w = sz * s, h = (2.6 + seed * 2.4) * s, wall = lit2([196, 160, 120], z), shd = lit2([150, 116, 88], z);
          c.fillStyle = rgb(wall); c.fillRect(X - w / 2, Y - h, w, h);
          c.fillStyle = rgb(shd); c.fillRect(X + (sunSide > 0 ? -w / 2 : w / 2 - w * .18), Y - h, w * .18, h); // the side away from the sun
          c.fillStyle = rgb(lerp(shd, [40, 30, 24], .4)); c.fillRect(X - w * (.1 + seed * .25), Y - 1.9 * s, .8 * s, 1.9 * s);
          c.fillStyle = rgb(lerp(wall, [255, 240, 210], .25)); c.fillRect(X - w / 2 - .1 * s, Y - h - .22 * s, w + .2 * s, .22 * s);
        } else if (kind === 'town') {
          const w = sz * s, h = (sz * .7 + seed * 6) * s, col2 = lit2([92, 84, 84], z);
          c.fillStyle = rgb(col2); c.fillRect(X - w / 2, Y - h, w, h);
          if (seed > .5) { c.fillStyle = rgb(lerp(col2, [20, 20, 30], .35)); for (let j = 0; j < 3; j++) { const ax = X - w * .35 + j * w * .3; c.beginPath(); c.moveTo(ax, Y); c.lineTo(ax, Y - h * .45); c.arc(ax + w * .1, Y - h * .45, w * .1, Math.PI, TAU); c.lineTo(ax + w * .2, Y); c.closePath(); c.fill(); } }
          if (seed > .8) { c.fillStyle = rgb(col2); c.fillRect(X - w * .12, Y - h * 1.6, w * .24, h * .7); }
        } else if (kind === 'cypress') {
          const ht = 6 * (.8 + seed * .4), w = .9 * s; c.fillStyle = rgb(lit2([44, 70, 46], z));
          c.beginPath(); c.moveTo(X, Y - ht * s); c.quadraticCurveTo(X + w, Y - ht * .55 * s, X + w * .5, Y - .3 * s); c.lineTo(X - w * .5, Y - .3 * s); c.quadraticCurveTo(X - w, Y - ht * .55 * s, X, Y - ht * s); c.fill();
          c.fillStyle = rgb(lit2([92, 120, 70], z), .6); c.beginPath(); c.moveTo(X, Y - ht * s); c.quadraticCurveTo(X + w * sunSide, Y - ht * .55 * s, X + w * .5 * sunSide, Y - .3 * s); c.lineTo(X, Y - .3 * s); c.closePath(); c.fill();
          c.fillStyle = rgb(lit2([80, 60, 44], z)); c.fillRect(X - .08 * s, Y - .4 * s, .16 * s, .4 * s);
        } else if (kind === 'wall') { // a low dry-stone wall round the hermitage's yard
          const L = 7, ww = s;
          c.fillStyle = rgb(lit2([86, 80, 80], z)); c.fillRect(X - L / 2 * ww, Y - .9 * ww, L * ww, .9 * ww);
          c.fillStyle = rgb(lit2([140, 130, 124], z)); c.fillRect(X - L / 2 * ww, Y - .9 * ww, L * ww, .14 * ww);
          c.strokeStyle = rgb(lit2([50, 46, 48], z), .5); c.lineWidth = 1; c.beginPath(); for (let j = 0; j < 22; j++) { const u = X - L / 2 * ww + (j + .5) * L / 22 * ww; c.moveTo(u, Y - .9 * ww); c.lineTo(u + (j % 2 ? .1 : -.1) * ww, Y); } c.stroke();
          st.wallAt = [X, Y, ww];
        } else if (kind === 'cell') { // the hermitage: a tower of black Hawran basalt, an upper room, a lamp in the arched window
          const w = 4.4 * s, h = 7.4 * s, base = lit2([86, 80, 82], z), lt = lit2([150, 140, 136], z), sh = lit2([52, 48, 54], z);
          c.fillStyle = rgb(base); c.fillRect(X - w / 2, Y - h, w, h);
          c.fillStyle = rgb(sh); c.fillRect(X + (sunSide > 0 ? -w / 2 : w / 2 - w * .2), Y - h, w * .2, h);
          c.strokeStyle = rgb(lerp(sh, [20, 20, 26], .4), .45); c.lineWidth = Math.max(.6, .03 * s); c.beginPath();
          for (let j = 1; j < 12; j++) { const yy = Y - j * h / 12; c.moveTo(X - w / 2, yy); c.lineTo(X + w / 2, yy); for (let q = 0; q < 4; q++) { const u = X - w / 2 + ((q + (j % 2) * .5) % 4 + .3) * w / 4; c.moveTo(u, yy); c.lineTo(u, yy + h / 12); } }
          c.stroke();
          const uw = w * .62, uh = 2.4 * s; // the upper room and its little dome
          c.fillStyle = rgb(base); c.fillRect(X - uw / 2, Y - h - uh, uw, uh);
          c.fillStyle = rgb(lt); c.fillRect(X - w / 2 - .15 * s, Y - h - .25 * s, w + .3 * s, .25 * s);
          c.beginPath(); c.arc(X, Y - h - uh, uw * .42, Math.PI, TAU); c.fillStyle = rgb(lerp(base, lt, .3)); c.fill();
          c.fillStyle = rgb(lt); c.fillRect(X - uw / 2 - .1 * s, Y - h - uh - .05 * s, uw + .2 * s, .18 * s);
          const lamp = .85 + .15 * Math.sin(t * 3.1) * Math.sin(t * 1.7), wx = X - w * .08, wy = Y - h * .72;
          c.fillStyle = rgb([255, 196, 120], lamp); c.beginPath(); c.moveTo(wx - .38 * s, wy + .8 * s); c.lineTo(wx - .38 * s, wy); c.arc(wx, wy, .38 * s, Math.PI, TAU); c.lineTo(wx + .38 * s, wy + .8 * s); c.closePath(); c.fill();
          c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35 * lamp; const r = 2.2 * s; c.drawImage(st.warm, wx - r, wy - r, r * 2, r * 2); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
          // the door: dark, then lit and open while the monk comes out
          const open = smooth(seg(p, .545, .565)), dx0 = X + w * .18, dh = 2.1 * s, dw = 1.0 * s;
          c.fillStyle = rgb(lerp(lerp(sh, [16, 14, 18], .6), [255, 190, 120], open * .8)); c.fillRect(dx0 - dw / 2, Y - dh, dw, dh);
          c.fillStyle = rgb(lt); c.fillRect(dx0 - dw / 2 - .1 * s, Y - dh - .18 * s, dw + .2 * s, .18 * s);
          st.door = [dx0, Y, s];
        }
      }]);
    });
    // ----- the caravan: eight camels in a column behind the lead camel, the men of Quraysh walking or riding -----
    const colMoving = col.walk, homeK = (j) => smooth(seg(p, .925 + j * .005, .948 + j * .005)); // the turn for home
    const outX = (j) => walkAt(KC, Math.min(p, .935)).x + 2.3 + j * 3.4, back = p > .935 ? col.x - (XT + 3.6) : 0; // the column's way home
    const camel = (j) => {
      const turn = homeK(j), dirS = Math.cos(Math.PI * turn) * -1; // -1 faces left (north), +1 right (home)
      const x = outX(j) + back, z = CZ[j], s = F / z, X = PX(x, z);
      if (X < -4 * s || X > W + 4 * s) return;
      const mv = colMoving ? 1 : 0, ph = (col.d + j * .9) / 2.5 * TAU;
      if (j === 0) st.nose = [x + dirS * 2.3, 2.02, z];
      shadow(x, z, 2.2, 1.3, .22);
      items.push([z, () => {
        const Y = PY(hgt(x, z), z), top = fig([214, 168, 116], z), bot = fig([150, 110, 74], z), far = lerp(bot, [40, 30, 30], .25);
        if (Math.abs(dirS) < .04) return;
        c.save(); c.translate(X, Y - (mv ? Math.abs(Math.sin(ph)) * .04 * s : 0)); c.scale(s * dirS, -s);
        const grad = c.createLinearGradient(0, 2.4, 0, 1.0); grad.addColorStop(0, rgb(top)); grad.addColorStop(1, rgb(bot));
        const leg = (u0, gp, near) => {
          const a = ph + gp * TAU, sw = Math.sin(a) * .32 * mv, lift = Math.max(0, Math.cos(a)) * .16 * mv;
          c.beginPath(); tube(c, [[u0, 1.25], [u0 + sw * .4, .66 + lift * .6], [u0 + sw, .06 + lift]], .26, .1); c.fillStyle = near ? grad : rgb(far); c.fill();
          c.beginPath(); c.ellipse(u0 + sw + .05, .05 + lift, .12, .05, 0, 0, TAU); c.fill(); // the pad
        };
        CLEG.forEach(([u, gp, near]) => { if (!near) leg(u, gp, 0); });
        c.strokeStyle = rgb(bot); c.lineWidth = .06; c.beginPath(); c.moveTo(-1.24, 1.62); c.quadraticCurveTo(-1.42, 1.3 + Math.sin(t * 1.4 + j) * .04, -1.36, .98); c.stroke(); // the tail
        c.beginPath(); smoothPath(c, CAMB); c.fillStyle = grad; c.fill();
        c.fillStyle = rgb(lerp(top, [255, 236, 200], .25), .55); c.beginPath(); c.ellipse(-.12, 2.3, .55, .12, -.05, 0, TAU); c.fill(); // light on the hump
        c.fillStyle = rgb(lerp(bot, [30, 20, 16], .4)); c.beginPath(); c.ellipse(2.04, 2.27, .06, .1, .4, 0, TAU); c.fill(); // the ear
        CLEG.forEach(([u, gp, near]) => { if (near) leg(u, gp, 1); });
        // the load: a cloth over the hump and the bales either side; the lead camel carries Abu Talib's saddle and cushion
        const cl = [[164, 56, 44], [64, 70, 116], [196, 160, 96], [120, 70, 50], [70, 96, 80]][j % 5], c1 = fig(cl, z), c2 = fig(lerp(cl, [240, 220, 180], .35), z);
        c.beginPath(); c.moveTo(-.86, 2.06); c.quadraticCurveTo(-.1, 2.62, .56, 2.08); c.lineTo(.5, 1.5); c.lineTo(-.8, 1.5); c.closePath(); c.fillStyle = rgb(c1); c.fill();
        c.strokeStyle = rgb(c2); c.lineWidth = .05; c.beginPath(); for (let q = 0; q < 3; q++) { c.moveTo(-.8, 1.62 + q * .14); c.lineTo(.5, 1.62 + q * .14); } c.stroke();
        if (j === 0) { c.fillStyle = rgb(fig([226, 206, 160], z)); c.beginPath(); c.ellipse(-.12, 2.56, .5, .13, 0, 0, TAU); c.fill(); c.strokeStyle = rgb(fig([160, 60, 44], z)); c.lineWidth = .04; c.stroke(); }
        else { c.fillStyle = rgb(fig(lerp(cl, [200, 180, 140], .5), z)); c.beginPath(); c.roundRect ? c.roundRect(-.62, 1.1, .7, .62, .12) : c.rect(-.62, 1.1, .7, .62); c.fill(); }
        if (j === 2 || j === 5) { // a rider, faceless
          c.save(); c.translate(-.1, 2.45); c.beginPath(); poly(c, SEAT); c.fillStyle = rgb(fig([70, 54, 48], z)); c.fill();
          c.fillStyle = rgb(fig([206, 196, 170], z)); c.beginPath(); c.ellipse(.0, .95, .13, .07, 0, 0, TAU); c.fill(); c.restore();
        }
        // the halter: a cord round the muzzle
        c.strokeStyle = rgb(fig([70, 40, 30], z)); c.lineWidth = .035; c.beginPath(); c.moveTo(2.24, 2.18); c.lineTo(2.2, 1.98); c.moveTo(1.92, 2.26); c.lineTo(2.26, 2.06); c.stroke();
        c.restore();
        if (mv) { // dust kicked up behind
          c.globalAlpha = 1; st.dust.forEach(([a, b, k], i) => { if (i % 8 !== j) return; const q = (b + t * .5) % 1, dx = x - dirS * (1 + q * 3.5), dz = z + .3, X2 = PX(dx, dz), Y2 = PY(.1 + q * .9 * a, dz), r = (.3 + q * 1.1) * F / dz; c.globalAlpha = .35 * (1 - q); c.drawImage(st.dustS, X2 - r, Y2 - r, r * 2, r * 2); c.globalAlpha = 1; });
        }
      }]);
    };
    for (let j = 0; j < 8; j++) camel(j);
    // the men walking beside the camels
    const MEN = [[1, 10.1, [74, 70, 104]], [3, 10.4, [128, 76, 56]], [6, 10.2, [168, 150, 118]], [7, 10.5, [86, 60, 48]]];
    MEN.forEach(([j, z, cl], i) => {
      const turn = homeK(j), dirS = Math.cos(Math.PI * turn) * -1, x = outX(j) - .6 + back, s = F / z, X = PX(x, z);
      if (X < -2 * s || X > W + 2 * s) return;
      shadow(x, z, 1.75, .45, .22);
      items.push([z, () => {
        const ph = (col.d + i * 1.3) / 1.4 * TAU, mv = colMoving ? 1 : 0, Y = PY(hgt(x, z), z) - Math.abs(Math.sin(ph)) * .03 * s * mv;
        c.save(); c.translate(X, Y); c.scale(s * (dirS || 1), -s); c.beginPath(); poly(c, MAN, Math.sin(ph) * .03 * mv);
        const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(fig(lerp(cl, [20, 20, 30], .3), z))); g.addColorStop(1, rgb(fig(lerp(cl, [255, 230, 200], .15), z))); c.fillStyle = g; c.fill();
        c.fillStyle = rgb(fig([214, 204, 182], z)); c.beginPath(); c.ellipse(.01, 1.69, .14, .1, 0, 0, TAU); c.fill(); // the head cloth
        c.restore();
      }]);
    });
    // ----- Abu Talib: a tall cloaked man, a turban, a staff; no face -----
    const abuFace = p < .105 ? -1 : p < .185 ? 1 : p < .6 ? -1 : p < .645 ? 1 : p < .935 ? -1 : 1;
    const ZA = abu.walk && p > .6 && p < .645 ? 9.3 + .7 * Math.sin(Math.PI * seg(p, .612, .645)) : 9.3;
    // the near arm: on the rein while he leads, on the boy's shoulder when he takes him, at his side otherwise
    const onBoy = Math.max(bump(p, .145, .16, .18, .19), bump(p, .918, .93, .945, .955)), onRein = p < .1 || (p > .17 && p < .6 && !(p > .41 && p < .49)) ? 1 : 0;
    const hx = onBoy > 0 ? mix(.3, (boy.x - abu.x) * abuFace + .02, onBoy) : onRein ? -.26 : .26, hy2 = onBoy > 0 ? mix(.95, 1.02, onBoy) : onRein ? .98 : .9;
    const abuHand = [abu.x + abuFace * hx, hy2, ZA];
    const rein = bump(p, .095, .11, .165, .18), boyArm = [mix(.05, .2, rein), mix(-.45, -.64, rein)], boyHand = [boy.x + boyArm[0] * 1.15, -boyArm[1] * 1.15, ZB];
    shadow(abu.x, ZA, 1.85, .5);
    items.push([ZA, () => {
      const s = F / ZA, X = PX(abu.x, ZA), ph = abu.d / 1.5 * TAU, mv = abu.walk ? 1 : 0, Y = PY(hgt(abu.x, ZA), ZA) - Math.abs(Math.sin(ph)) * .025 * s * mv;
      const dark = fig([62, 46, 36], ZA), rim = fig([196, 150, 110], ZA), turb = fig([222, 210, 186], ZA);
      // the staff in the far hand
      c.strokeStyle = rgb(fig([92, 70, 50], ZA)); c.lineWidth = Math.max(1, .05 * s); c.beginPath(); c.moveTo(X + abuFace * .42 * s, Y - 1.45 * s); c.lineTo(X + abuFace * (.5 + Math.sin(ph) * .06 * mv) * s, Y); c.stroke();
      c.save(); c.translate(X, Y); c.scale(s * abuFace, -s);
      c.beginPath(); poly(c, ABUT, Math.sin(ph) * .025 * mv);
      const g = c.createLinearGradient(-.44, 0, .44, 0), ls = abuFace * sunSide > 0; g.addColorStop(0, rgb(ls ? dark : lerp(dark, rim, .35))); g.addColorStop(.7, rgb(dark)); g.addColorStop(1, rgb(ls ? lerp(dark, rim, .45) : dark)); c.fillStyle = g; c.fill();
      c.strokeStyle = rgb(lerp(dark, [0, 0, 0], .35), .5); c.lineWidth = .02; c.beginPath(); c.moveTo(.08, 1.45); c.quadraticCurveTo(.12, .8, .2, .05); c.moveTo(-.12, 1.45); c.quadraticCurveTo(-.2, .8, -.3, .05); c.stroke(); // the cloak's open front and folds
      c.fillStyle = rgb(turb); c.beginPath(); c.ellipse(.02, 1.78, .15, .1, 0, 0, TAU); c.fill();
      c.fillStyle = rgb(lerp(turb, dark, .35)); c.beginPath(); c.ellipse(-.1, 1.66, .06, .12, .2, 0, TAU); c.fill(); // the turban's tail
      c.strokeStyle = rgb(lerp(dark, rim, .15)); c.lineCap = 'round'; c.lineWidth = .13; c.beginPath(); c.moveTo(.12, 1.42); c.quadraticCurveTo(mix(.24, hx, .5), 1.2, hx, hy2); c.stroke(); c.lineCap = 'butt';
      c.restore();
    }]);
    // the rein: from the lead camel's muzzle to the boy's hand as he clings to it, then to Abu Talib's hand on the road
    items.push([10.2, () => {
      if (!st.nose || p > .6 || (p > .41 && p < .49)) return;
      const [nx, ny, nz] = st.nose, [ax, ay, az2] = rein > .5 ? boyHand : abuHand;
      const X0 = PX(nx, nz), Y0 = PY(ny - .2, nz), X1 = PX(ax, az2), Y1 = PY(ay, az2), sag = Math.abs(X1 - X0) * .18 + 6;
      c.strokeStyle = rgb(fig([96, 60, 40], 10)); c.lineWidth = Math.max(1, F / 10 * .022); c.beginPath(); c.moveTo(X0, Y0); c.quadraticCurveTo((X0 + X1) / 2, Math.max(Y0, Y1) + sag, X1, Y1); c.stroke();
    }]);
    // ----- the boy, the Prophet: walking, holding the rein, sitting under the tree, standing before the monk -----
    const sitK = smooth(seg(p, .603, .622)) * (1 - smooth(seg(p, .803, .822)));
    const cloudK = smooth(seg(p, .235, .3));
    shadow(boy.x, ZB, 1.15, .32);
    items.push([ZB, () => {
      const X = PX(boy.x, ZB), Y = PY(hgt(boy.x, ZB), ZB), h = 1.15 * F / ZB, amb2 = 1 - .14 * cloudK;
      const arms = rein > 0 ? [boyArm] : undefined;
      if (sitK < 1) Holy.draw(c, { who: 'prophet', child: true, pose: boy.walk ? 'walk' : 'stand', phase: boy.d / 1.1, x: X, y: Y, h, t, amb: amb2, flip: false, glow: .15, alpha: 1 - sitK, arms });
      if (sitK > 0) Holy.draw(c, { who: 'prophet', child: true, pose: 'sit', x: X, y: Y, h, t, amb: amb2, glow: .15, alpha: sitK });
    }]);
    // ----- the cloud: gathers over his head on the road and goes with him; its shade falls on him -----
    if (cloudK > 0) {
      const up = bump(p, .6, .64, .93, .965), cx2 = boy.x + .1 + Math.sin(t * .25) * .1, cy2 = mix(mix(3.75, 4.5, smooth(seg(p, .93, .96))), 6.1, up) + Math.sin(t * .3 + 1) * .08, cz2 = ZB + .7; // over the tree's crown while he sits under it
      { const X = PX(boy.x, ZB), Y = PY(0, ZB), rx = 1.5 * F / ZB * cloudK, ry = Math.max(2, (PY(0, ZB - 1) - PY(0, ZB + 1)) / 2) * cloudK; c.save(); c.translate(X, Y); c.scale(rx, ry); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(lerp(amb, [30, 40, 80], .5), .26)); g.addColorStop(1, rgb(lerp(amb, [30, 40, 80], .5), 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore(); }
      items.push([cz2, () => {
        const s = F / cz2, X = PX(cx2, cz2), Y = PY(cy2, cz2), k = cloudK;
        const PUFFS = [[-1.25, -.1, .45], [1.2, -.08, .5], [-.7, .05, .6], [.65, .1, .62], [-.2, .42, .62], [.3, .5, .55], [0, .05, .7]];
        const shade = lerp([220, 226, 240], lerp(sunC, skH, .3), .25), lit = lerp([255, 255, 255], sunC, .12);
        PUFFS.forEach(([u, v, r]) => { const R0 = r * s * (.6 + .4 * k), x0 = X + u * s * k, y0 = Y - v * s * k; c.globalAlpha = .95 * k; const g = c.createRadialGradient(x0 - R0 * .2, y0 - R0 * .35, R0 * .1, x0, y0, R0); g.addColorStop(0, rgb(lit)); g.addColorStop(.7, rgb(lerp(lit, shade, .5))); g.addColorStop(1, rgb(shade, 0)); c.fillStyle = g; c.beginPath(); c.arc(x0, y0, R0, 0, TAU); c.fill(); });
        c.globalAlpha = 1;
      }]);
    }
    // ----- the monk: out of the hermitage door, down the hill to the road; he bows; he points the way home -----
    const mIn = smooth(seg(p, .552, .566));
    if (mIn > 0) {
      const u = smooth(seg(p, .56, .715)) * (MONK.length - 1), [mx, mz] = crv(MONK, u), walking = p > .56 && p < .715;
      const toward = p < .715 ? Math.sign(MONK[Math.min(MONK.length - 1, Math.floor(u) + 1)][0] - MONK[Math.floor(u)][0]) || 1 : 1;
      shadow(mx, mz, 1.8, .5);
      items.push([mz, () => {
        const s = F / mz, X = PX(mx, mz), ph = u * 9, Y = PY(hgt(mx, mz), mz) - (walking ? Math.abs(Math.sin(ph * TAU)) * .025 * s : 0);
        const bow = bump(p, .745, .765, .79, .805) * .16 + bump(p, .9, .91, .945, .96) * .03, point = bump(p, .9, .915, .945, .96);
        const dark = fig([40, 36, 42], mz), rim = fig([170, 150, 140], mz);
        c.globalAlpha = mIn;
        c.save(); c.translate(X, Y); c.scale(s * toward, -s);
        c.strokeStyle = rgb(fig([80, 62, 46], mz)); c.lineWidth = .05; c.beginPath(); c.moveTo(.36, 1.4); c.lineTo(.44 + (walking ? Math.sin(ph * TAU) * .05 : 0), 0); c.stroke(); // the staff
        c.beginPath(); poly(c, MONKS, bow + (walking ? Math.sin(ph * TAU) * .02 : 0));
        const g = c.createLinearGradient(-.4, 0, .4, 0), ls = toward * sunSide > 0; g.addColorStop(0, rgb(ls ? dark : lerp(dark, rim, .3))); g.addColorStop(.7, rgb(dark)); g.addColorStop(1, rgb(ls ? lerp(dark, rim, .4) : dark)); c.fillStyle = g; c.fill();
        c.strokeStyle = rgb(lerp(rim, dark, .4), .6); c.lineWidth = .03; c.beginPath(); c.moveTo(-.3, .9); c.lineTo(.3, .9); c.stroke(); // the cord at the waist
        const ax = mix(.22, .62, point), ay = mix(.95, 1.32, point);
        c.strokeStyle = rgb(lerp(dark, rim, .12)); c.lineCap = 'round'; c.lineWidth = .12; c.beginPath(); c.moveTo(.1 + bow * 1.3, 1.36); c.quadraticCurveTo(mix(.24, .5, point) + bow, mix(1.1, 1.38, point), ax + bow, ay); c.stroke(); c.lineCap = 'butt';
        c.restore(); c.globalAlpha = 1;
      }]);
    }
    // ----- the great tree by the road: bare, then it shakes, lowers its branches over him, leafs and bears fruit -----
    {
      const [tx, tz] = TREE, s = F / tz, X = PX(tx, tz);
      if (X > -9 * s && X < W + 9 * s) {
        shadow(tx, tz, 5, 1.1, .2);
        items.push([tz, () => {
          const Y = PY(hgt(tx, tz), tz), bend = smooth(seg(p, .66, .705)), leaf = smooth(seg(p, .668, .72)), fruit = smooth(seg(p, .69, .735));
          const shake = bump(p, .652, .662, .695, .715) * (Math.sin(t * 13) * .5 + Math.sin(t * 7.3) * .5) * .07;
          const bark = fig([132, 112, 96], tz), barkD = fig([86, 70, 60], tz), bx = boy.x - tx;
          // the trunk: thick, a little leaning, flared at the root, the bark creased
          const tw = [[-.62, 0], [-.42, .35], [-.36, 1.2], [-.34, 2.0], [-.42, 2.5], [.4, 2.55], [.34, 2.0], [.36, 1.2], [.46, .35], [.7, 0]];
          c.beginPath(); tw.forEach(([u, v], i) => (i ? c.lineTo(X + (u + v * .05) * s, Y - v * s) : c.moveTo(X + u * s, Y - v * s))); c.closePath();
          const tg = c.createLinearGradient(X - .5 * s, 0, X + .5 * s, 0); tg.addColorStop(sunSide > 0 ? 0 : 1, rgb(barkD)); tg.addColorStop(sunSide > 0 ? 1 : 0, rgb(bark)); c.fillStyle = tg; c.fill();
          c.strokeStyle = rgb(lerp(barkD, [20, 16, 14], .35), .55); c.lineWidth = Math.max(.7, .025 * s); c.beginPath();
          for (let q = 0; q < 5; q++) { const u = -.24 + q * .12; c.moveTo(X + u * s, Y - .1 * s); c.bezierCurveTo(X + (u + .06) * s, Y - .9 * s, X + (u - .05) * s, Y - 1.6 * s, X + (u + .04 + .1) * s, Y - 2.4 * s); }
          c.stroke();
          // the limbs: [start (u, v), rest end (u, v), bent end over the boy (u from him, v), thickness]
          const LIMB = [[[-.3, 2.3], [-3.5, 3.9], [-2.2, 1.2], .3], [[-.2, 2.5], [-2.5, 4.8], [-1.65, 1.7], .26], [[-.05, 2.55], [-1.0, 5.3], [-.9, 2.15], .24], [[.1, 2.55], [.8, 5.4], [.85, 2.2], .24], [[.22, 2.5], [2.2, 4.9], [1.6, 1.75], .26], [[.32, 2.35], [3.4, 4.1], [2.2, 1.25], .3]];
          const tips = [];
          LIMB.forEach(([b0, re, be, w], i) => {
            const sw = shake * (1 + i * .25) * (i % 2 ? 1 : -1), e = [mix(re[0], bx + be[0], bend) + sw * 5, mix(re[1], be[1], bend) + Math.abs(sw) * 2];
            const sg = Math.sign(be[0]), cpt = [mix(b0[0] + (re[0] - b0[0]) * .3, b0[0] + (bx + be[0] - b0[0]) * .5 + sg * .7, bend) + sw * 2, mix(b0[1] + (re[1] - b0[1]) * .85, 5.3 - Math.abs(be[0]) * .35, bend)];
            const pts = Array.from({ length: 10 }, (_, q) => { const k = q / 9, v = 1 - k; return [v * v * b0[0] + 2 * v * k * cpt[0] + k * k * e[0], v * v * b0[1] + 2 * v * k * cpt[1] + k * k * e[1]]; });
            c.beginPath(); tube(c, pts.map(([a, b]) => [X + a * s, Y - b * s]), w * s, .06 * s); c.fillStyle = rgb(lerp(bark, barkD, i % 2 ? .3 : 0)); c.fill();
            // twigs off each limb, bare and forked
            c.strokeStyle = rgb(barkD); c.lineCap = 'round'; c.beginPath();
            [4, 6, 8].forEach((q, m) => { const [a, b] = pts[q], side = (m + i) % 2 ? 1 : -1, L = (.45 + .15 * m) * (1 - bend * .25), dx = side * L * .5 + sw * 2, dy = L * (.8 - bend * 1.5); c.lineWidth = Math.max(.7, (.05 - m * .01) * s); c.moveTo(X + a * s, Y - b * s); c.quadraticCurveTo(X + (a + dx * .4) * s, Y - (b + dy * .7) * s, X + (a + dx) * s, Y - (b + dy) * s); tips.push([a + dx, b + dy], [a + dx * .5, b + dy * .5]); });
            c.stroke(); c.lineCap = 'butt';
            pts.forEach((q, m) => { if (m > 3) tips.push(q); });
          });
          // the leaves and the fruit of three kinds
          if (leaf > 0) st.leaves.forEach(([a, b, k, q], i) => {
            const tp = tips[i % tips.length], lx = tp[0] + (a - .5) * .7 + shake * 4, ly = tp[1] + (b - .5) * .5, r = (.12 + k * .13) * leaf * s;
            c.fillStyle = rgb(fig(lerp([54, 104, 46], [132, 178, 76], q * .7 + (sunSide * (a - .5) + .5) * .3), tz)); c.beginPath(); c.ellipse(X + lx * s, Y - ly * s, r, r * .62, a * 3, 0, TAU); c.fill();
            if (fruit > 0 && i % 7 === 0) { const fc = [[196, 52, 44], [236, 186, 60], [110, 52, 96]][i % 3]; c.fillStyle = rgb(fig(fc, tz)); c.beginPath(); c.arc(X + (lx + .05) * s, Y - (ly - .12) * s, .085 * s * fruit, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(X + (lx + .02) * s, Y - (ly - .09) * s, .03 * s * fruit, 0, TAU); c.fill(); }
          });
        }]);
      }
    }
    // ----- near the eye: tufts and stones passing close -----
    st.scrub.forEach(([x, z, sz, k]) => {
      const s = F / z, X = PX(x, z); if (X < -2 * s || X > W + 2 * s) return;
      items.push([z, () => {
        const Y = PY(hgt(x, z), z), hu = wHaur(x), harra = wHarra(x);
        if (k < .55) { // a tuft of dry grass (green in the Hawran)
          c.strokeStyle = rgb(fig(lerp(lerp([170, 140, 84], [110, 128, 60], hu), [140, 126, 90], harra), z)); c.lineWidth = Math.max(1, .03 * s); c.beginPath();
          for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 1.4 + Math.sin(t * 1.2 + k * 20 + j) * .05; c.moveTo(X + (j - 3) * .03 * s, Y); c.quadraticCurveTo(X + Math.sin(a) * sz * .4 * s, Y - sz * .5 * s, X + Math.sin(a) * sz * .8 * s, Y - Math.cos(a) * sz * s); }
          c.stroke();
        } else { // a stone
          const w = sz * .5 * s, base = lerp(lerp([180, 146, 110], BAS, harra + hu * .6), GRAN, wMecca(x) * .6);
          c.fillStyle = rgb(fig(lerp(base, [40, 40, 60], .3), z)); c.beginPath(); c.ellipse(X, Y - w * .2, w, w * .45, 0, Math.PI, TAU); c.fill();
          c.fillStyle = rgb(fig(lerp(base, [255, 240, 220], .15), z)); c.beginPath(); c.ellipse(X + sunSide * w * .2, Y - w * .32, w * .6, w * .25, 0, Math.PI, TAU); c.fill();
        }
      }]);
    });
    items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());
    // ----- grade: the afternoon warms; the edges close in a little -----
    const warm = smooth(seg(p, .75, 1.02));
    if (warm > 0) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${.22 * warm})`; c.fillRect(0, hy * .6, W, H - hy * .6); c.globalCompositeOperation = 'source-over'; }
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.32)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
