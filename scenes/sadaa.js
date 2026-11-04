(() => {
// sadaa — «الصدع بالدعوة»: after three hidden years the command comes, and the Prophet ﷺ calls Quraysh openly from the
// Hijr of the House; they mock him and dare not touch him for Abu Talib; the five mockers pass him one by one and
// Gabriel points (Tafsir al-Qummi 1:378–379, I'lam al-Wara 1:106 and 1:113–114, al-Kafi 1:250). One day in Mecca, the
// last hour of night to dusk; a side view in metres (x right, y up, z away from the camera), a pinhole camera keyed on p:
//   p −.05 → .17  before dawn, in a walled yard by the court: he leads the prayer; Ali and Ja'far behind him, Zayd and
//                 Khadija behind them (Qummi 1:378: «… يأتمّون به»); one ruku' and one sujud. A clay lamp in the wall.
//      .17 → .24  the command (al-Hijr 94): a shaft of light into the yard as the sun comes up; he stands.
//      .24 → .3   he goes out through the yard's door into the court of the House and stands up on the Hijr, the low
//                 curved wall by the House (Qummi 1:379). The assemblies of Quraysh sit in rings about the court.
//      .3 → .45   he calls, an arm raised, then both; the assemblies turn to him.
//      .45 → .515 they mock: pointing, laughing, hands thrown up; two step toward him and stop when Abu Talib rises.
//      .515 → .58 Abu Talib comes to the foot of the Hijr, asks, is answered, and stands by him facing the court.
//      .58 → .64  the five mockers, named under their feet (I'lam 1:113); a column of light beside him: Gabriel, light only.
//      .64 → .925 each passes him in turn; a thread of light from the column touches the place the text names (the heel,
//                 the eyes, the belly, the foot, the face) and he goes on: limping, groping, bent, out toward the
//                 hills, where a hot wind hazes the far range for Ibn al-Talatila (I'lam 1:113–114). No wound is drawn.
//      .925 → 1.05 al-Hijr 95; the light goes; dusk: he still calls from the Hijr, Abu Talib below, the rings thinning.
// The Prophet and Ali are drawn only by Holy.draw (veiled, the gold disc). Everyone else is a faceless cloaked shape
// with an earth-toned head cloth, so only the two veils read white at the head. Everything follows from p; t moves only
// cloth, the lamp, the light's shimmer and the laughter.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const hash = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
function tube(g, pts, w0, w1) { // a tapered stroke as one filled outline
  const L = [], R = [];
  pts.forEach((q, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = mix(w0, w1, i / (pts.length - 1)) / 2;
    L.push([q[0] - dy / l * w, q[1] + dx / l * w]); R.push([q[0] + dy / l * w, q[1] - dx / l * w]);
  });
  g.moveTo(L[0][0], L[0][1]); L.forEach((q) => g.lineTo(q[0], q[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
}
// a walker: keys [p, x, z]; he walks between keys whose places differ and stands where they agree
function track(K, p) {
  if (p <= K[0][0]) return { x: K[0][1], z: K[0][2], walk: false, d: 0, dir: 0 };
  let d = 0;
  for (let i = 1; i < K.length; i++) {
    const [p0, x0, z0] = K[i - 1], [p1, x1, z1] = K[i], L = Math.hypot(x1 - x0, z1 - z0);
    if (p < p1) { const k = (p - p0) / (p1 - p0), e = L === 0 ? 0 : k < .12 ? k * k / .24 : k > .88 ? 1 - (1 - k) ** 2 / .24 : (k - .06) / .88; return { x: mix(x0, x1, e), z: mix(z0, z1, e), walk: L > 0 && k > .01 && k < .99, d: d + L * e, dir: Math.sign(x1 - x0) }; }
    d += L;
  }
  const E = K[K.length - 1];
  return { x: E[1], z: E[2], walk: false, d, dir: 0 };
}

// ---------- the House, finished and hung with its cloths; turned so the Hijr's face (Iraqi to Shami corner) looks at the court ----------
const KX = -1, KZ = 31, KHA = 6.2, KHB = 5, KTH = -1.98, TOP = 8.9;
const kc = Math.cos(KTH), ks = Math.sin(KTH);
const corner = (su, sv) => [KX + su * KHA * kc - sv * KHB * ks, KZ + su * KHA * ks + sv * KHB * kc];
const CO = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)]; // the corners of the Black Stone, Iraq, Sham, Yemen
const FC = CO.map((a, i) => {
  const b = CO[(i + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), mx = (a[0] + b[0]) / 2 - KX, mz = (a[1] + b[1]) / 2 - KZ;
  let n = [dz / L, -dx / L]; if (n[0] * mx + n[1] * mz < 0) n = [-n[0], -n[1]];
  return { a, b, L, n };
});
const DOOR = [.2, .3, 2.1, 4.5]; // on the face of the Black Stone and Iraq corners
// the Hijr: a low wall in a half-ellipse off the Iraqi–Shami face, open at both ends by the corners
const M1 = [(CO[1][0] + CO[2][0]) / 2, (CO[1][1] + CO[2][1]) / 2], T1 = [(CO[2][0] - CO[1][0]) / FC[1].L, (CO[2][1] - CO[1][1]) / FC[1].L], N1 = FC[1].n;
const HJA = 4.3, HJB = 7.2, HJH = 1.3, HJT = .85, NA = 34;
const arcPt = (th, off = 0) => {
  const ct = Math.cos(th), sn = Math.sin(th), nx = T1[0] * HJB * ct + N1[0] * HJA * sn, nz = T1[1] * HJB * ct + N1[1] * HJA * sn, nl = Math.hypot(nx, nz);
  return [M1[0] + T1[0] * HJA * ct + N1[0] * HJB * sn + nx / nl * off, M1[1] + T1[1] * HJA * ct + N1[1] * HJB * sn + nz / nl * off, nx / nl, nz / nl];
};
const HA = arcPt(Math.PI / 2); // the top of the wall at its apex, where he stands
const HF = [HA[0] + N1[0] * 1.0, HA[1] + N1[1] * 1.0]; // the ground at its foot
const PP = [HA[0] + N1[0] * 3.4 + T1[0] * .4, HA[1] + N1[1] * 3.4 + T1[1] * .4]; // where each mocker passes him
const GL = [HA[0] - T1[0] * 1.3, HA[1] - T1[1] * 1.3]; // the column of light at his side
const AT = [HF[0] + T1[0] * 2.0, HF[1] + T1[1] * 2.0 + .2]; // where Abu Talib stands below him
const AT0 = [-11.6, 13.4]; // where he sits before

// ---------- places ----------
const GX = -16.5, GZ = 27.2; // the gate of the court
const YX0 = 14, YX1 = 22, YZ0 = 21.2, YZ1 = 28.4, YH = 2.8, DZ0 = 23.9, DZ1 = 25.3; // the yard and its door in the left wall
const PR = [[16.2, 24.9], [17.6, 24.3], [17.6, 25.6], [19.0, 24.9], [20.4, 24.95]]; // the Prophet, Ali, Ja'far, Zayd, Khadija
const KP = [[.222, 16.2, 24.9], [.236, 14.6, 24.6], [.247, 12.0, 23.8]];
const W1 = arcPt(Math.PI / 3, 2.4), WALK = [[12.0, 23.8], [4.2, 19.6], [W1[0], W1[1]], [HF[0], HF[1]]]; // round the outside of the Hijr to its foot
const WLEN = WALK.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - WALK[i][0], q[1] - WALK[i][1]), 0);
function along(k) { // the point k (0..1) of the way along WALK
  let d = k * WLEN;
  for (let i = 1; i < WALK.length; i++) { const [x0, z0] = WALK[i - 1], [x1, z1] = WALK[i], L = Math.hypot(x1 - x0, z1 - z0); if (d <= L || i === WALK.length - 1) { const f = Math.min(1, d / L); return [mix(x0, x1, f), mix(z0, z1, f), Math.sign(x1 - x0)]; } d -= L; }
}
const ARROWS = [-13.7, 24.9], MAKER = [-14.9, 25.5]; // the man of Khuza'a feathering arrows by the gate
const RINGS = [[-15.6, 13.2, 7, 1.5], [-12.4, 9.4, 6, 1.35], [.8, 9.6, 7, 1.5], [-3.2, 11.6, 7, 1.45], [5.8, 16.6, 7, 1.6], [-18.4, 19.6, 6, 1.4], [8.2, 22.4, 5, 1.3]];
// the five (I'lam 1:113): name, robe, head cloth, home, beat [a, b], where the light touches (m above the ground), exit, gait
const FIVE = [
  { n: 'الوليد بن المغيرة', cl: [124, 62, 48], hd: [150, 118, 88], home: [-16.3, 26.2], a: .645, v: .06, out: [9, 12], g: 0 },
  { n: 'الأسود بن المطّلب', cl: [98, 86, 58], hd: [146, 128, 96], home: [-1.4, 13.4], a: .703, v: 1.66, out: [-15.4, 21], g: 1 },
  { n: 'الأسود بن عبد يغوث', cl: [120, 98, 70], hd: [160, 136, 102], home: [2.4, 15.4], a: .76, v: 1.0, out: [-15.6, 21.5], g: 2 },
  { n: 'العاص بن وائل', cl: [72, 80, 100], hd: [136, 122, 100], home: [5.4, 12.8], a: .815, v: .05, out: [-15.4, 21], g: 3 },
  { n: 'ابن الطلاطلة', cl: [76, 94, 72], hd: [150, 132, 100], home: [8.2, 14.4], a: .87, v: 1.6, out: [10, 11.5], g: 4 },
];
FIVE.forEach((m) => { m.at = m.a + .02; m.hit = m.a + .026; m.go = m.a + .036; m.end = m.a + .058; }); // arrive, the light, walk on, gone

// ---------- the land (hajar's valley): the flat court, the hills closing round, far ranges ----------
function crag(x, z) {
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
function hgt(x, z) {
  const r = Math.hypot(x * .7, z - 30), ring = smooth(c01((r - 190) / 320));
  let h = ring * (26 + 170 * crag(x * .9 + 300, z * .9)) * (.7 + .3 * Math.sin(x * .004 + 1.3));
  h += smooth(c01((z - 700) / 1500)) * (120 + 260 * crag(x * .5 + 1000, z * .5));
  h += .05 * Math.sin(x * 1.3 + z * .7) * Math.sin(z * 1.1 - x * .4);
  return h;
}
const SAND = [232, 208, 164], SANDD = [212, 184, 140], ROCK = [160, 116, 94], ROCKD = [108, 90, 88], FAR = [150, 138, 170];
function albedo(x, z, h) {
  const r = c01((h - 2) / 30), mot = c01(.5 + .5 * Math.sin(x * .09 + Math.sin(z * .07) * 2) * Math.sin(z * .11 - x * .05));
  let a = lerp(lerp(SANDD, SAND, mot), lerp(ROCK, ROCKD, c01(.5 + .5 * Math.sin(x * .013 + z * .021 + h * .03))), r);
  if (z < 45) { const mt = .93 + .05 * Math.sin(x * 1.7 + z * 2.3) * Math.sin(z * 1.9 - x * .8) + .04 * Math.sin(x * 4.1 + z * 3.3); a = a.map((v) => v * mt); }
  const far = smooth(c01((z - 650) / 900)); if (far > 0) a = lerp(a, FAR, far);
  return a;
}
// ---------- light keys: p, sky top, sky mid, horizon, sun colour, sky light, haze, sun elevation (deg), azimuth (rad, 0 = ahead, + = right), fog ----------
const LK = [
  [-.06, [34, 54, 112], [96, 114, 176], [236, 194, 172], [255, 186, 140], [170, 160, 176], [176, 164, 180], -4, 1.7, 2400],
  [.13, [40, 66, 130], [110, 132, 190], [246, 206, 176], [255, 192, 144], [178, 166, 178], [192, 176, 186], -1.5, 1.7, 2400],
  [.22, [36, 80, 156], [110, 152, 210], [252, 210, 172], [255, 208, 150], [146, 146, 166], [214, 200, 198], 7, 1.85, 2700],
  [.34, [26, 84, 160], [86, 148, 210], [216, 224, 228], [255, 244, 224], [152, 160, 176], [186, 202, 222], 34, 2.3, 3000],
  [.6, [22, 76, 156], [80, 142, 206], [222, 224, 216], [255, 246, 226], [152, 158, 172], [188, 200, 218], 62, 2.9, 3000],
  [.86, [28, 74, 150], [96, 144, 200], [236, 220, 196], [255, 236, 204], [148, 150, 164], [202, 204, 214], 38, -2.4, 2800],
  [.96, [34, 70, 142], [116, 142, 194], [248, 210, 172], [255, 212, 160], [156, 146, 156], [234, 202, 172], 16, -2.0, 2500],
  [1.06, [40, 62, 128], [136, 130, 176], [252, 194, 150], [255, 188, 126], [158, 136, 142], [240, 190, 158], 6, -1.75, 2300],
];
// camera keys: p, the point it looks at (x, z), its own z, its height
const CK = [
  [-.06, 18.6, 25.0, 13.4, 2.7], [.15, 18.3, 25.0, 14.4, 2.9], [.215, 18.0, 24.8, 12.6, 3.6], [.248, 11.0, 23.0, 7.8, 4.4],
  [.29, -5.4, 18.6, 3.2, 3.3], [.315, -6.2, 18.4, 4.4, 2.9], [.43, -6.2, 18.4, 3.6, 2.9], [.468, -5.0, 17.2, .6, 3.6],
  [.505, -5.0, 17.2, .2, 3.6], [.532, -5.6, 17.6, 7.2, 2.6], [.574, -5.6, 17.6, 7.6, 2.6], [.61, -3.4, 16.8, -2.4, 3.4],
  [.645, -8.4, 18.0, .2, 3.1], [.69, -8.0, 17.6, .8, 3.1], [.712, -6.0, 17.0, 4.0, 2.9], [.86, -6.0, 17.0, 4.4, 2.9],
  [.905, -5.2, 17.6, 2.6, 3.2], [.952, -5.0, 19.0, -5.6, 4.6], [.99, -6.2, 18.4, 4.2, 2.9], [1.06, -6.2, 18.4, 4.8, 2.9],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const SEAT = [-.42, 0, -.44, .22, -.36, .5, -.26, .72, -.16, .84, -.1, .9, -.02, 1.0, .1, .98, .13, .88, .12, .82, .2, .74, .24, .5, .42, .36, .55, .18, .52, 0];
// the prayer, one outline morphing between standing, bowing and prostrate (same vertices)
const QIY = [-.3, 0, -.24, .6, -.22, 1.0, -.21, 1.3, -.17, 1.48, -.08, 1.6, .04, 1.76, .14, 1.6, .22, 1.36, .23, 1.0, .25, .55, .3, 0];
const RUK = [-.28, 0, -.2, .55, -.24, .92, -.1, 1.08, .25, 1.1, .6, 1.06, .82, .98, .78, .8, .5, .84, .2, .8, .18, .5, .26, 0];
const SUJ = [-.55, 0, -.6, .22, -.5, .5, -.3, .64, 0, .6, .3, .44, .6, .22, .66, .04, .42, .06, .12, .16, -.1, .1, 0, 0];
const HQ = [[.03, 1.66], [.72, .92], [.56, .14]];
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };

S.sadaa = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(9431);
    const HS = []; // houses: [x0, x1, z0, depth, height, albedo, seed, y0]
    const TONE = [[224, 198, 158], [206, 174, 134], [234, 220, 192], [192, 158, 120], [216, 192, 162]];
    const row = (xa, xb, za, zb, h0, h1, skip) => { for (let x = xa; x < xb;) { const w = 3.2 + R() * 4.2; if (!skip || x + w < skip[0] || x > skip[1]) HS.push([x, x + w, za + R() * (zb - za), 5 + R() * 4, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); x += w + R() * .6; } };
    const col = (x0, x1, za, zb, h0, h1) => { for (let z = za; z < zb;) { const d = 3.6 + R() * 3.4, w = (x1 - x0) * (.8 + R() * .3); HS.push([x0, x0 + w, z, d, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); z += d + R() * .5; } };
    row(-36, -13.6, 26.9, 28.6, 3.6, 6.4, [GX - 2.1, GX + 2.1]); // the left side of the court, the gate among them
    row(23.6, 42, 25.5, 29, 3.2, 5.4); // past the yard
    row(-46, 46, 56, 66, 4, 7.5); // behind the House
    row(-70, 70, 76, 92, 4.5, 9);
    col(-36, -29, -14, 24, 3.6, 6.2); // the court's left and right sides
    col(27, 34, -14, 22, 3.4, 5.8);
    for (let i = 0; i < 90; i++) { const x = -260 + R() * 520, z = 150 + R() * 260, y = hgt(x, z); if (y > 45) continue; HS.push([x, x + 4 + R() * 6, z, 6, 4 + R() * 5, TONE[(R() * 5) | 0], R(), y - .5]); }
    st.HS = HS;
    st.peb = Array.from({ length: 520 }, () => [-30 + R() * 60, -8 + R() ** 1.2 * 60, .04 + R() ** 2 * .16, R()]);
    st.cirrus = Array.from({ length: 9 }, () => [R() * 1.6 - .3, .1 + R() * .32, .2 + R() * .4, R()]);
    st.stars = Array.from({ length: 70 }, () => [R(), R() * .55, .4 + R() * .9, R()]);
    // the assemblies: men seated in rings; r1 picks a gesture, r2 a phase
    st.memb = [];
    RINGS.forEach(([cx, cz, n, rad], ri) => { for (let k = 0; k < n; k++) { const a = (k + R() * .4) / n * TAU; st.memb.push({ x: cx + Math.cos(a) * rad, z: cz + Math.sin(a) * rad * .8, cx, ri, r1: R(), r2: R(), cl: [[150, 128, 98], [120, 100, 78], [96, 86, 74], [170, 146, 110], [104, 92, 98], [132, 104, 76]][(R() * 6) | 0], hd: [[168, 148, 116], [140, 118, 90], [122, 106, 86], [176, 152, 110]][(R() * 4) | 0], sc: .94 + R() * .12 }); } });
    st.stand = Array.from({ length: 9 }, () => [-24 + R() * 48, 18 + R() * 9, R()]).filter(([x, z]) => Math.abs(x - HA[0]) > 7 && !(x > 12 && z < 29)); // men standing about the House's court
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7), hy = H * (phone ? .62 : .58);
    // ----- the camera -----
    const [lx, lz, camZ, camY] = keyAt(CK, p), aim = phone ? .5 : .42;
    const camX = lx - (aim - .5) * W / F * (lz - camZ);
    const PX = (x, z) => W / 2 + (x - camX) * F / (z - camZ), PY = (y, z) => hy - (y - camY) * F / (z - camZ);
    const P3 = (x, y, z) => [PX(x, z), PY(y, z)];
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LK, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const sunSide = Math.sign(sun[0]) || 1, front = c01(-sun[2]), day = c01((elev + 2) / 10);
    const fogA = (zr) => Math.min(.88, (1 - Math.exp(-zr / fogL)) * .95);
    const fig = (base, zr = 8) => { const k = [0, 1, 2].map((j) => base[j] / 255 * (amb[j] * .66 + sunC[j] * (.3 + .3 * front) * day)); return lerp(k, haze, fogA(zr) * .9); };
    const wall = (base, lam, zr, a = .72) => lerp(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), haze, fogA(zr) * .9);
    const eve = smooth(seg(p, .93, 1.04)), night = 1 - smooth(seg(p, .1, .22)), lampA = 1 - smooth(seg(p, .16, .23));
    // ----- sky -----
    const sg = c.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.58, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    if (night > 0) st.stars.forEach(([u, v, r, k]) => { c.fillStyle = `rgba(255,248,230,${night * (.35 + .5 * k) * (.7 + .3 * Math.sin(t * 1.3 + k * 40))})`; c.beginPath(); c.arc(u * W, v * hy, r, 0, TAU); c.fill(); });
    { // the sun's glare from the side it stands on (before dawn: the glow under the horizon)
      const sx = sun[2] > .05 ? W / 2 + sun[0] / sun[2] * F : sunSide > 0 ? W * 1.3 : -W * .3, syy = sun[2] > .05 ? hy - sun[1] / sun[2] * F : hy * .55;
      const X = Math.max(-W * .4, Math.min(W * 1.4, sx)), Y = Math.max(-H * .2, Math.min(hy, syy));
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(X, Y, 0, X, Y, F * (1 + .4 * eve)); g.addColorStop(0, rgb(sunC, .4 + .2 * eve)); g.addColorStop(.18, rgb(sunC, .15)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
      c.globalCompositeOperation = 'source-over';
      if (sx > -20 && sx < W + 20 && sun[2] > .05 && elev > 0) { c.fillStyle = 'rgba(255,250,236,.97)'; c.beginPath(); c.arc(sx, syy, F * .012, 0, TAU); c.fill(); }
    }
    st.cirrus.forEach(([u, v, w, k]) => {
      const x = ((u * W - camX * 8 + p * W * .05) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = v * hy, rw = w * W * .5, rh = rw * .05;
      c.save(); c.translate(x, y); c.rotate(-.04 + k * .08); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(lerp([255, 255, 255], sunC, .3 + .4 * eve), (.3 + .2 * k) * (1 - .5 * night))); g.addColorStop(1, rgb([255, 255, 255], 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    // ----- terrain: depth bands far to near, painted by terrainRaster in core.js -----
    {
      const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 3, z1 = 7000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), z = zr + camZ, fa = fogA(zr), e = Math.max(.25, zr * .006);
        for (let k = 0; k <= NK; k++) {
          const sx = -W * .06 + k * (W * 1.12 / NK), x = camX + (sx - W / 2) * zr / F, h = hgt(x, z), o = i * (NK + 1) + k;
          TX[o] = sx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hgt(x + e, z) - h) / e, hz = (hgt(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, sky = .62 + .38 / nl;
            const al = albedo(x, z, h), n = (i * NC + k / 2) * 3;
            for (let j = 0; j < 3; j++) TC[n + j] = mix(al[j] / 255 * (amb[j] * sky * .7 + sunC[j] * lam * .8), haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .12);
    }
    // the hot wind over the far range, for Ibn al-Talatila (I'lam 1:114: «فأصابه السمائم»)
    const samum = bump(p, .885, .9, .918, .935);
    if (samum > 0) {
      c.save(); c.globalAlpha = samum;
      const g = c.createLinearGradient(0, hy - H * .16, 0, hy + H * .05); g.addColorStop(0, 'rgba(236,150,84,0)'); g.addColorStop(.6, 'rgba(236,150,84,.42)'); g.addColorStop(1, 'rgba(236,150,84,0)');
      c.fillStyle = g; c.fillRect(W * .35, hy - H * .16, W * .65, H * .21);
      c.strokeStyle = 'rgba(255,214,160,.35)'; c.lineWidth = 1.2;
      for (let i = 0; i < 24; i++) { const y = hy - H * (.01 + .12 * hash(i, 3)), x = W * (.35 + ((hash(i, 7) + t * .05 * (1 + hash(i))) % 1) * .65), L = W * (.04 + .06 * hash(i, 9)); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + L * .5, y - 3, x + L, y + 1); c.stroke(); }
      c.restore();
    }
    // ----- shadows on the ground, away from the sun -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [30, 30, 60], .55), shA = .3 * day + .1;
    const shadow = (x, z, hm, w, a = .26) => {
      if (z - camZ < 1) return;
      a *= shA / .4;
      const tx = x + shD[0] * hm * day, tz = Math.max(camZ + 1.5, z + shD[1] * hm * day);
      const X0 = PX(x, z), Y0 = PY(0, z), X1 = PX(tx, tz), Y1 = PY(0, tz), ww = w * F / (z - camZ);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * .24); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      if (day > .05) { const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .8)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2; c.beginPath(); c.moveTo(X0 - ww * .5, Y0); c.lineTo(X1 - ww * .25, Y1); c.lineTo(X1 + ww * .25, Y1); c.lineTo(X0 + ww * .5, Y0); c.closePath(); c.fill(); }
    };
    { // the House's shadow
      const sweep = (q) => [q[0] + shD[0] * TOP * day, q[1] + shD[1] * TOP * day];
      c.beginPath();
      const quad = (pts) => { const a = pts.map(([x, z]) => P3(x, 0, Math.max(camZ + 1, z))); let s = 0; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; s += a[i][0] * a[j][1] - a[j][0] * a[i][1]; } if (s < 0) a.reverse(); a.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); };
      quad(CO);
      if (day > .05) for (let i = 0; i < 4; i++) { const a = CO[i], b = CO[(i + 1) % 4]; quad([a, b, sweep(b), sweep(a)]); }
      c.fillStyle = rgb(shCol, .3 * shA / .4); c.fill('nonzero');
    }
    { // pebbles and grit on the court
      c.fillStyle = rgb(wall([120, 100, 80], .4, 20), .5);
      c.beginPath();
      st.peb.forEach(([x, z, r]) => { const zr = z - camZ; if (zr < 2) return; const X = PX(x, z); if (X < -10 || X > W + 10) return; const s = F / zr, Y = PY(0, z); if (Y > H + 4) return; c.moveTo(X + r * s, Y); c.ellipse(X, Y, r * s, Math.max(.6, r * s * camY / zr), 0, 0, TAU); });
      c.fill();
    }

    const items = [];
    // ----- the houses round the court, and up the slopes -----
    const glowW = smooth(seg(p, .95, 1.03)) + .6 * night;
    st.HS.forEach(([x0, x1, z0, d, h, alb, seed, y0]) => {
      const zr = z0 - camZ; if (zr < 2) return;
      const X0 = PX(x0, z0), X1 = PX(x1, z0); if (X1 < -60 || X0 > W + 60) return;
      items.push([zr, () => {
        const s = F / zr, Yb = PY(y0, z0), Yt = PY(y0 + h, z0), lamF = Math.max(0, -sun[2]);
        const cf = wall(alb, lamF, zr, .66), side = camX < x0 ? -1 : camX > x1 ? 1 : 0;
        if (side) {
          const xs = side < 0 ? x0 : x1, lamS = Math.max(0, side * sun[0]), cs = wall(alb, lamS, zr, .54);
          const a = P3(xs, y0, z0), b = P3(xs, y0, z0 + d), e = P3(xs, y0 + h, z0 + d), f = P3(xs, y0 + h, z0);
          c.fillStyle = rgb(cs); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill();
        }
        if (y0 + h < camY) { const a = P3(x0, y0 + h, z0), b = P3(x1, y0 + h, z0), e = P3(x1, y0 + h, z0 + d), f = P3(x0, y0 + h, z0 + d); c.fillStyle = rgb(wall(alb, Math.max(0, sun[1]), zr, .8)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill(); }
        c.fillStyle = rgb(cf); c.fillRect(X0, Yt, X1 - X0, Yb - Yt);
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .22)); c.fillRect(X0 - .08 * s, Yt - .2 * s, X1 - X0 + .16 * s, .2 * s);
        if (s > 2) {
          const dk = rgb(lerp(cf, [30, 22, 18], .55)), w = X1 - X0;
          if (seed > .25) { c.fillStyle = dk; c.fillRect(X0 + w * (.15 + seed * .5), Yb - 1.9 * s, .85 * s, 1.9 * s); }
          const nw = Math.max(1, Math.round(w / s / 2.2)), win = lerp([40, 30, 26], [255, 196, 120], c01(glowW) * (seed > .4 ? 1 : .2));
          for (let j = 0; j < nw; j++) { const wx = X0 + (j + .5) * w / nw - .25 * s; if (h > 4.4) { c.fillStyle = rgb(lerp(cf, win, .8)); c.fillRect(wx, Yt + 1.0 * s, .5 * s, .7 * s); } }
          c.fillStyle = dk; for (let j = 0; j < w / s / .7 - 1; j++) c.fillRect(X0 + (j + .6) * .7 * s, Yt + .35 * s, Math.max(1, .1 * s), Math.max(1, .1 * s));
        }
      }]);
    });
    // ----- a slab of wall (the yard): its faces toward the camera and its top -----
    const slab = (x0, x1, z0, z1, h, alb) => {
      const zc = (z0 + z1) / 2, zr = zc - camZ; if (z1 - camZ < 1.5) return;
      items.push([zr + (z1 - z0) * .5 - .2, () => {
        const q = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); if (pts[0][1] === pts[2][1]) return; const yb = Math.max(a[0][1], a[1][1]), yt = Math.min(a[2][1], a[3][1]), gg = c.createLinearGradient(0, yb, 0, yt); gg.addColorStop(0, rgb(shCol, .32)); gg.addColorStop(1, rgb(shCol, 0)); c.fillStyle = gg; c.fill(); };
        if (camX < x0) q([[x0, 0, z0], [x0, 0, z1], [x0, h, z1], [x0, h, z0]], rgb(wall(alb, Math.max(0, -sun[0]), zr, .68)));
        if (camX > x1) q([[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]], rgb(wall(alb, Math.max(0, sun[0]), zr, .68)));
        if (camZ < z0) q([[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]], rgb(wall(alb, Math.max(0, -sun[2]), zr, .66)));
        if (camY > h) q([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], rgb(lerp(wall(alb, Math.max(0, sun[1]), zr, .8), [255, 246, 226], .1)));
      }]);
    };
    const YARD = [224, 204, 170];
    slab(YX0, YX1 + .4, YZ1, YZ1 + .5, YH, YARD); // back
    slab(YX0 - .4, YX0, YZ0, DZ0, YH, YARD); slab(YX0 - .4, YX0, DZ1, YZ1 + .5, YH, YARD); // left, the door between
    slab(YX1, YX1 + .4, YZ0, YZ1 + .5, YH, YARD); // right
    { // the lamp in the back wall before dawn, and the reed mat they pray on
      const lz = YZ1 - .02, zr = lz - camZ;
      items.push([zr - .3, () => {
        const m = [[15.4, 24.0], [21.2, 24.0], [21.2, 26.2], [15.4, 26.2]].map(([x, z]) => P3(x, .01, z));
        c.fillStyle = rgb(wall([176, 150, 100], .5, zr, .7)); c.beginPath(); m.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill();
        c.strokeStyle = rgb(wall([128, 104, 66], .4, zr, .7), .6); c.lineWidth = 1; c.beginPath();
        for (let k = 1; k < 14; k++) { const a = P3(15.4 + k * 5.8 / 14, .01, 24), b = P3(15.4 + k * 5.8 / 14, .01, 26.2); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke();
        if (lampA > 0) {
          const [X, Y] = P3(18.8, 1.55, lz), s = F / zr, fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3);
          c.globalCompositeOperation = 'lighter';
          const g = c.createRadialGradient(X, Y, 0, X, Y, 5 * s); g.addColorStop(0, `rgba(255,186,104,${.55 * lampA * fl})`); g.addColorStop(.4, `rgba(255,170,90,${.18 * lampA * fl})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(X - 5 * s, Y - 5 * s, 10 * s, 10 * s);
          c.globalCompositeOperation = 'source-over';
          c.fillStyle = `rgba(255,236,190,${lampA})`; c.beginPath(); c.ellipse(X, Y - .06 * s, .035 * s, .08 * s, 0, 0, TAU); c.fill();
          c.fillStyle = rgb(wall([120, 84, 52], .3, zr, .7), lampA); c.beginPath(); c.ellipse(X, Y + .02 * s, .14 * s, .045 * s, 0, 0, TAU); c.fill();
        }
      }]);
    }
    // ----- the gate of the court -----
    {
      const zr = GZ - camZ, s = F / zr, X = PX(GX, GZ);
      if (zr > 2 && X > -6 * s && X < W + 6 * s) items.push([zr, () => {
        const Yb = PY(0, GZ), w = 4.2 * s, h = 4.9 * s, cf = wall([226, 208, 176], Math.max(0, -sun[2]), zr, .66);
        const side = camX > GX + 2.1 ? 1 : -1, xs = GX + side * 2.1, a = P3(xs, 0, GZ), b = P3(xs, 0, GZ + 3), e = P3(xs, 4.9, GZ + 3), f = P3(xs, 4.9, GZ);
        c.fillStyle = rgb(wall([226, 208, 176], Math.max(0, side * sun[0]), zr, .54)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill();
        c.fillStyle = rgb(cf); c.fillRect(X - w / 2, Yb - h, w, h);
        const ow = 1.8 * s, oh = 2.5 * s, g = c.createLinearGradient(0, Yb - oh - ow / 2, 0, Yb); g.addColorStop(0, 'rgba(24,16,12,1)'); g.addColorStop(1, rgb(lerp([40, 30, 24], shCol, .3)));
        c.fillStyle = g; c.beginPath(); c.moveTo(X - ow / 2, Yb); c.lineTo(X - ow / 2, Yb - oh); c.arc(X, Yb - oh, ow / 2, Math.PI, TAU); c.lineTo(X + ow / 2, Yb); c.closePath(); c.fill();
        c.strokeStyle = rgb(lerp(cf, [255, 248, 230], .3)); c.lineWidth = Math.max(1, .14 * s); c.beginPath(); c.arc(X, Yb - oh, ow / 2 + .12 * s, Math.PI, TAU); c.stroke();
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .25)); c.fillRect(X - w / 2 - .1 * s, Yb - h - .24 * s, w + .2 * s, .24 * s);
      }]);
    }
    // ----- the House -----
    {
      const zrK = KZ - camZ;
      const near = Math.min(...CO.map((q) => q[1])) - camZ;
      items.push([near + .4, () => {
        const inFront = (f) => { const F0 = FC[f], mx = (F0.a[0] + F0.b[0]) / 2 - camX, mz = (F0.a[1] + F0.b[1]) / 2 - camZ; return F0.n[0] * mx + F0.n[1] * mz < 0; };
        const STONE = [184, 172, 154], WOOD = [138, 92, 56];
        const fr = [0, 1, 2, 3].filter(inFront);
        fr.forEach((f) => {
          const F0 = FC[f], A = F0.a, B = F0.b, pt = (u, y) => P3(A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u);
          const lam = Math.max(0, F0.n[0] * sun[0] + F0.n[1] * sun[2]);
          const quad = (u0, u1, y0, y1, col) => { const a = pt(u0, y0), b = pt(u1, y0), e = pt(u1, y1), g = pt(u0, y1); c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill(); };
          const base = wall(STONE, lam, zrK);
          quad(0, 1, 0, TOP, rgb(base));
          for (let y = .5, k = 0; y < 2.3; k++) { const hh = k % 2 ? .14 : .56; quad(0, 1, y, y + hh, rgb(k % 2 ? wall(WOOD, lam, zrK) : base.map((v) => v * (.95 + .05 * Math.sin(k))))); y += hh; } // the courses under the cloth
          const g0 = pt(.5, 0), g1 = pt(.5, .5), gg = c.createLinearGradient(g0[0], g0[1], g1[0], g1[1]); gg.addColorStop(0, rgb(shCol, .45)); gg.addColorStop(1, rgb(shCol, 0));
          c.save(); c.beginPath(); const a0 = pt(0, 0), a1 = pt(1, 0), a2 = pt(1, TOP), a3 = pt(0, TOP); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineTo(a3[0], a3[1]); c.closePath(); c.clip(); c.fillStyle = gg; c.fillRect(0, 0, W, H); c.restore();
          // the wasa'id: striped Yemeni cloths from the roof (as hung in «بناء الكعبة»)
          const yb = 2.3, CLR = [[150, 50, 42], [226, 208, 172], [58, 62, 98], [226, 208, 172]], CW = [.62, .1, .16, .1], npn = Math.round(F0.L / .98), pw = 1 / npn;
          for (let j = 0; j < npn * 4; j++) {
            const q = j % 4, pu = Math.floor(j / 4) * pw, u0 = pu + pw * CW.slice(0, q).reduce((a, v) => a + v, 0), u1 = u0 + pw * CW[q];
            const col = wall(CLR[q], lam, zrK, .62).map((v) => v * (q ? 1 : .94 + .06 * Math.sin(j * 2.1))), w0 = yb + .06 * Math.sin(u0 * 40 + t * .8), w1 = yb + .06 * Math.sin(u1 * 40 + t * .8);
            const a = pt(u0, w0), b = pt(u1, w1), e = pt(u1, TOP), g = pt(u0, TOP);
            c.fillStyle = rgb(col); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill();
            c.strokeStyle = rgb(lerp(col, [20, 16, 20], .35), .5); c.lineWidth = 1; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke();
          }
          const ha = pt(0, yb), hb = pt(1, yb); c.strokeStyle = rgb(wall([90, 60, 40], lam, zrK), .8); c.lineWidth = Math.max(1, F / zrK * .05); c.beginPath(); c.moveTo(ha[0], ha[1]); c.lineTo(hb[0], hb[1]); c.stroke();
          if (f === 0) { const [u0, u1, y0, y1] = DOOR, dc = wall([104, 66, 38], lam, zrK); quad(u0 - .01, u1 + .01, y0 - .1, y1 + .15, rgb(lerp(base, [20, 14, 12], .8))); quad(u0 + .006, u1 - .006, y0 + .05, y1 - .04, rgb(dc)); }
          const ra = pt(0, TOP), rb = pt(1, TOP); c.strokeStyle = rgb(lerp(base, [255, 246, 226], .35)); c.lineWidth = Math.max(1, F / zrK * .08); c.beginPath(); c.moveTo(ra[0], ra[1]); c.lineTo(rb[0], rb[1]); c.stroke();
        });
      }]);
    }
    // ----- the Hijr: segments far to near, inner and outer faces and the top -----
    {
      const zr = HA[1] - camZ;
      items.push([zr + .35, () => {
        const segs = [];
        for (let k = 0; k < NA; k++) {
          const a = Math.PI * k / NA, b = Math.PI * (k + 1) / NA, oa = arcPt(a, HJT / 2), ob = arcPt(b, HJT / 2), ia = arcPt(a, -HJT / 2), ib = arcPt(b, -HJT / 2);
          const mz = (oa[1] + ob[1]) / 2; segs.push({ oa, ob, ia, ib, mz, k });
        }
        segs.sort((A, B) => B.mz - A.mz);
        const ST = [196, 182, 160];
        const q = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
        segs.forEach(({ oa, ob, ia, ib, k }) => {
          const nx = (oa[2] + ob[2]) / 2, nz = (oa[3] + ob[3]) / 2, mx = (oa[0] + ob[0]) / 2 - camX, mzz = (oa[1] + ob[1]) / 2 - camZ;
          const out = nx * mx + nz * mzz < 0, tone = .95 + .07 * hash(k, 5);
          if (!out) { const lam = Math.max(0, -nx * sun[0] - nz * sun[2]); q([[ia[0], 0, ia[1]], [ib[0], 0, ib[1]], [ib[0], HJH, ib[1]], [ia[0], HJH, ia[1]]], rgb(wall(ST, lam, zr, .6).map((v) => v * tone * .9))); }
          else { const lam = Math.max(0, nx * sun[0] + nz * sun[2]), col = wall(ST, lam, zr, .66).map((v) => v * tone); q([[oa[0], 0, oa[1]], [ob[0], 0, ob[1]], [ob[0], HJH, ob[1]], [oa[0], HJH, oa[1]]], rgb(col));
            c.strokeStyle = rgb(lerp(col, [40, 34, 30], .35), .55); c.lineWidth = 1; const j0 = P3(oa[0], HJH * .5, oa[1]), j1 = P3(ob[0], HJH * .5, ob[1]); c.beginPath(); c.moveTo(j0[0], j0[1]); c.lineTo(j1[0], j1[1]); c.stroke(); }
          if (camY > HJH) q([[oa[0], HJH, oa[1]], [ob[0], HJH, ob[1]], [ib[0], HJH, ib[1]], [ia[0], HJH, ia[1]]], rgb(lerp(wall(ST, Math.max(0, sun[1]), zr, .8), [255, 248, 232], .14)));
        });
        // the ground's dark at the wall's foot
        const a = P3(HA[0] + N1[0] * HJT / 2, 0, HA[1] + N1[1] * HJT / 2), s = F / zr;
        const g = c.createRadialGradient(a[0], a[1], 0, a[0], a[1], 4 * s); g.addColorStop(0, rgb(shCol, .22)); g.addColorStop(1, rgb(shCol, 0));
        c.save(); c.translate(0, a[1]); c.scale(1, .25); c.translate(0, -a[1]); c.fillStyle = g; c.fillRect(a[0] - 4 * s, a[1] - 4 * s, 8 * s, 8 * s); c.restore();
      }]);
    }

    // ----- figures -----
    // a faceless cloaked shape: shape (MAN / SEAT, or a prayer outline), facing dir; arms are hand points in its own units
    const person = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -2 * s || X > W + 2 * s) return;
      const Y = PY(o.y0 || 0, z) - (o.bob || 0) * s, dir = o.dir || 1, sq = o.sq || 1, lean = o.lean || 0, sh = o.shape || MAN, seat = sh === SEAT;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * dir, -s * sq);
      const dark = fig(lerp(o.cl, [20, 20, 30], .3), zr), lt = fig(lerp(o.cl, [255, 230, 200], .15), zr), ls = dir * sunSide > 0;
      const S0 = seat ? [.03 + lean * .78, .76] : [.05 + lean * 1.42, 1.4];
      const arm = (hand, near) => { const el = [(S0[0] + hand[0]) / 2 + .06, (S0[1] + hand[1]) / 2 - .12]; c.beginPath(); tube(c, [S0, el, hand], .15, .1); c.fillStyle = rgb(near ? lerp(dark, lt, .45) : lerp(dark, [10, 10, 16], .2)); c.fill(); c.fillStyle = rgb(fig([200, 184, 160], zr)); c.beginPath(); c.arc(hand[0], hand[1], .05, 0, TAU); c.fill(); };
      (o.arms || []).forEach((h, i) => { if (i === 1) arm(h, false); });
      c.beginPath(); poly(c, sh, lean);
      const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(ls ? dark : lt)); g.addColorStop(.6, rgb(dark)); g.addColorStop(1, rgb(ls ? lt : dark)); c.fillStyle = g; c.fill();
      if (o.rim) { c.strokeStyle = `rgba(255,232,180,${o.rim})`; c.lineWidth = 2.2 / s; c.stroke(); }
      const hp = o.head || (seat ? [.03, .93] : [.01, 1.69]), hl = lean * hp[1];
      c.fillStyle = rgb(fig(o.hd || [150, 128, 98], zr));
      if (o.hood) { c.beginPath(); c.ellipse(hp[0] + hl - .02, hp[1] - .08, .19, .2, 0, 0, TAU); c.fill(); } // a woman's wrap over head and shoulders
      else { c.beginPath(); c.ellipse(hp[0] + hl, hp[1], .14, .1, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hp[0] + hl - .07, hp[1] - .11, .05, .11, .3, 0, TAU); c.fill(); }
      (o.arms || []).forEach((h, i) => { if (i !== 1) arm(h, true); });
      if (o.staff) { c.strokeStyle = rgb(fig([96, 70, 44], zr)); c.lineWidth = .05; c.beginPath(); c.moveTo(.34, 0); c.lineTo(.3, 1.5); c.stroke(); }
      c.restore();
    };
    const label = (x, z, txt, a, dy = 0) => { // a name under a mocker's feet
      const zr = z - camZ; if (a <= 0 || zr < 1.5) return;
      const s = F / zr, X = PX(x, z), Y = PY(0, z) + Math.max(14, .42 * s) + dy;
      c.save(); c.globalAlpha = a; c.direction = 'rtl'; c.textAlign = 'center'; c.font = `${Math.max(12, Math.min(19, .3 * s))}px ${FONT.naskh}`;
      c.fillStyle = 'rgba(10,12,22,.55)'; const w = c.measureText(txt).width; c.fillRect(X - w / 2 - 6, Y - 13, w + 12, 20);
      c.fillStyle = 'rgba(255,244,214,.96)'; c.fillText(txt, X, Y + 2); c.restore();
    };
    const toward = (x, tx) => Math.sign(tx - x) || 1;

    // the prayer: one ruku' and one sujud before dawn (weights of the three outlines)
    const ruk = bump(p, .027, .036, .061, .07), suj = bump(p, .082, .091, .133, .142), qiy = 1 - ruk - suj;
    const pray = QIY.map((v, i) => v * qiy + RUK[i] * ruk + SUJ[i] * suj), prH = [0, 1].map((j) => HQ[0][j] * qiy + HQ[1][j] * ruk + HQ[2][j] * suj);
    const leave = smooth(seg(p, .222, .236));
    [['ja', 2, [70, 78, 92], [132, 116, 92]], ['zy', 3, [104, 90, 68], [150, 130, 100]], ['kh', 4, [62, 52, 58], [92, 74, 66], true]].forEach(([, i, cl, hd, hood]) => {
      const [x, z] = PR[i]; shadow(x, z, 1.6 * (qiy + .5 * ruk + .3 * suj), .5, .2);
      items.push([z - camZ, () => person(x, z, { shape: pray, head: prH, dir: -1, cl, hd, hood, sc: hood ? .94 : 1 })]);
    });
    { // Ali beside him (dar's scale: 1.55 m); the Prophet leads, then goes out
      const [x, z] = PR[1], zr = z - camZ;
      shadow(x, z, 1.5, .5, .2);
      items.push([zr, () => {
        const X = PX(x, z), Y = PY(0, z), h = 1.55 * F / zr, o = { who: 'ali', x: X, y: Y, h, t, amb: .5 + .5 * day, glow: .35 * (1 - day) + .1 };
        if (qiy > 0) Holy.draw(c, { ...o, pose: 'stand', alpha: qiy });
        if (ruk > 0) Holy.draw(c, { ...o, pose: 'ruku', flip: true, alpha: ruk });
        if (suj > 0) Holy.draw(c, { ...o, pose: 'sujud', flip: true, alpha: suj });
      }]);
    }

    // ----- the Prophet: leads the prayer, goes out, stands on the Hijr -----
    const climb = smooth(seg(p, .284, .297)), wk = seg(p, .247, .283), wke = wk < .1 ? wk * wk / .2 : wk > .9 ? 1 - (1 - wk) ** 2 / .2 : (wk - .05) / .9;
    let pro = track(KP, p);
    if (p > .247) { const [x, z] = along(wke); pro = { x, z, walk: wk > .005 && wk < .995, d: 4 + wke * WLEN }; }
    const onTop = p >= .284, px = onTop ? mix(HF[0], HA[0], climb) : pro.x, pz = onTop ? mix(HF[1], HA[1], climb) : pro.z, py = onTop ? HJH * climb : 0;
    let parms;
    const UP = [.3, -.98], OPEN = [[-.34, -.8], [.34, -.8]], DOWN = [.13, -.42];
    const up1 = bump(p, .298, .312, .38, .392), open = bump(p, .388, .4, .44, .452), tal = bump(p, .532, .54, .558, .566), dusk = smooth(seg(p, .955, .975));
    if (up1 > .01) parms = [lerp(DOWN, UP, up1)];
    else if (open > .01) parms = [lerp([-.13, -.42], OPEN[0], open), lerp(DOWN, OPEN[1], open)];
    else if (tal > .01) parms = [lerp(DOWN, [.4, -.62], tal)];
    else if (dusk > .01) parms = [lerp(DOWN, UP, dusk)];
    {
      const zr = pz - camZ;
      if (!onTop || climb < .5) shadow(px, pz, 1.8, .5);
      items.push([zr - (onTop ? .02 : 0), () => {
        const X = PX(px, pz), Y = PY(py, pz), h = 1.8 * F / zr, o = { who: 'prophet', x: X, y: Y, h, t, amb: .55 + .45 * day - .15 * eve, glow: .4 * (1 - day) + .14 + .18 * eve };
        if (p < .222) { // the prayer
          if (qiy > 0) Holy.draw(c, { ...o, pose: 'stand', alpha: qiy });
          if (ruk > 0) Holy.draw(c, { ...o, pose: 'ruku', flip: true, alpha: ruk });
          if (suj > 0) Holy.draw(c, { ...o, pose: 'sujud', flip: true, alpha: suj });
        } else Holy.draw(c, { ...o, pose: pro.walk && !onTop ? 'walk' : 'stand', phase: pro.d / 1.3, arms: parms });
      }]);
    }
    // the command: a shaft of light into the yard as the sun comes up (al-Hijr 94)
    const cmd = bump(p, .17, .19, .225, .25);
    if (cmd > 0) {
      const [x, z] = PR[0], zr = z - camZ, [X, Y] = P3(x, 0, z), s = F / zr;
      items.push([zr - .5, () => {
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(0, -H * .1, 0, Y); g.addColorStop(0, `rgba(255,226,150,0)`); g.addColorStop(.5, `rgba(255,226,150,${.16 * cmd})`); g.addColorStop(1, `rgba(255,232,170,${.34 * cmd})`);
        c.fillStyle = g; c.beginPath(); c.moveTo(X - .5 * s, -H * .1); c.lineTo(X + .9 * s, -H * .1); c.lineTo(X + 1.3 * s, Y); c.lineTo(X - 1.1 * s, Y); c.closePath(); c.fill();
        const g2 = c.createRadialGradient(X, Y - .9 * s, 0, X, Y - .9 * s, 2.2 * s); g2.addColorStop(0, `rgba(255,232,170,${.3 * cmd})`); g2.addColorStop(1, 'rgba(255,232,170,0)'); c.fillStyle = g2; c.fillRect(X - 2.2 * s, Y - 3.1 * s, 4.4 * s, 4.4 * s);
        c.restore();
      }]);
    }

    // ----- the court fills in the morning; the assemblies; they turn, mock, settle; thin at dusk -----
    const crowd = smooth(seg(p, .2, .245)), turn = smooth(seg(p, .3, .335)), mock = bump(p, .452, .465, .5, .516);
    st.memb.forEach((m) => {
      const a = crowd; if (a <= 0) return;
      const dirIn = toward(m.x, m.cx), dirHim = toward(m.x, HA[0]);
      let dir = turn > .5 && (p < .62 || m.r2 > .5) ? dirHim : dirIn, lean = 0, arms, bob = 0;
      if (mock > 0) {
        const sh = Math.sin(t * (8 + m.r2 * 4) + m.r1 * 30) * .5 + .5;
        if (m.r1 < .34) arms = [lerp([.14, .42], [.64, 1.0 + .06 * sh], mock)]; // pointing at him
        else if (m.r1 < .7) { lean = -.12 * mock; bob = .025 * sh * mock; arms = [lerp([.14, .42], [.2, .5], mock)]; } // laughing, a hand at the belly
        else arms = [lerp([.14, .42], [.12, 1.25 + .08 * sh], mock), lerp([.1, .4], [-.1, 1.15], mock)]; // hands thrown up
      }
      shadow(m.x, m.z, .9, .7, .2);
      items.push([m.z - camZ, () => person(m.x, m.z, { shape: SEAT, dir, cl: m.cl, hd: m.hd, lean, arms, bob, sc: m.sc, alpha: a })]);
    });
    st.stand.forEach(([x, z, r], i) => { const a = crowd; if (a <= 0) return; shadow(x, z, 1.75, .45, .2); items.push([z - camZ, () => person(x, z, { dir: turn > .5 ? toward(x, HA[0]) : (i % 2 ? 1 : -1), cl: [[150, 128, 98], [110, 96, 82], [172, 150, 116]][i % 3], hd: [158, 136, 104], alpha: a, sc: .97 + r * .06 })]); });
    // the man of Khuza'a by the gate, feathering arrows; the arrows laid by him
    if (crowd > 0) {
      const [x, z] = MAKER, [ax, az] = ARROWS, zr = az - camZ;
      items.push([z - camZ, () => person(x, z, { shape: SEAT, dir: 1, cl: [118, 104, 82], hd: [150, 130, 98], alpha: crowd, arms: [[.42, .5 + .03 * Math.sin(t * 3)], [.36, .46]], sc: .97 })]);
      items.push([zr, () => {
        const s = F / zr; c.globalAlpha = crowd;
        for (let k = 0; k < 7; k++) {
          const z0 = az + (k - 3) * .11, a = P3(ax - .38, .02, z0), b = P3(ax + .38, .02, z0 + .02);
          c.strokeStyle = rgb(wall([150, 110, 66], .5, zr, .7)); c.lineWidth = Math.max(1, .025 * s); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
          c.strokeStyle = rgb(wall([226, 220, 206], .5, zr, .7)); c.lineWidth = Math.max(1.2, .05 * s); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] + (b[0] - a[0]) * .16, a[1] + (b[1] - a[1]) * .16); c.stroke(); // the feathers
        }
        c.globalAlpha = 1;
      }]);
    }

    // ----- Abu Talib: seated near the Hijr; he rises, comes to its foot, asks, and stands by him -----
    {
      const rise = smooth(seg(p, .484, .494)), go = seg(p, .505, .53), k = smooth(go);
      const x = mix(AT0[0], AT[0], k), z = mix(AT0[1], AT[1], k), walk = go > .01 && go < .99;
      const ask = bump(p, .531, .537, .545, .55), faceCourt = p > .563;
      const dir = walk ? toward(AT0[0], AT[0]) : faceCourt ? 1 : toward(x, HA[0]);
      const a = crowd;
      if (a > 0) {
        shadow(x, z, rise > .5 ? 1.8 : .9, .5, .22);
        items.push([z - camZ, () => {
          const wph = walk ? p * 160 : 0;
          if (rise < 1) person(x, z, { shape: SEAT, dir: toward(x, HA[0]), cl: [92, 74, 56], hd: [146, 124, 92], alpha: a * (1 - rise) });
          if (rise > 0) person(x, z, { dir, cl: [92, 74, 56], hd: [146, 124, 92], alpha: a * rise, sc: 1.03, staff: true, lean: .03 + (walk ? Math.sin(wph) * .02 : 0), bob: walk ? Math.abs(Math.sin(wph)) * .03 : 0, arms: ask > .01 ? [lerp([.14, .44], [.52, 1.36], ask)] : undefined });
        }]);
      }
    }
    // ----- the five: standing apart while he calls; two step toward him and stop; then each passes him -----
    const names = bump(p, .585, .6, .632, .645);
    FIVE.forEach((m, i) => {
      const a0 = crowd; if (a0 <= 0) return;
      let x = m.home[0], z = m.home[1], dir = turn > .5 ? toward(x, HA[0]) : -1, lean = 0, arms, bob = 0, sq = 1, walk = false, wph = 0, alpha = a0, labA = names;
      if (mock > 0) { // jeering, with the rest
        const sh = Math.sin(t * 9 + i * 7) * .5 + .5;
        arms = i % 2 ? [lerp([.12, .78], [.66, 1.62 + .05 * sh], mock)] : [lerp([.12, .78], [.25, 2.0 + .06 * sh], mock), lerp([.1, .76], [-.05, 1.9], mock)];
        lean = i % 2 ? .04 * mock : -.06 * mock;
        if (i === 1 || i === 3) { const k = bump(p, .462, .486, .494, .512); x = mix(x, x + (HF[0] - x) * .3, k); z = mix(z, z + (HF[1] - z) * .3, k); } // two step toward him, and stop
      }
      if (p > m.a - .004) { // his turn: to the place before the Hijr, the light, then on and out
        const k1 = smooth(seg(p, m.a, m.at)), k2 = seg(p, m.go, m.end), k2s = k2 < .5 ? 2 * k2 * k2 : 1 - (-2 * k2 + 2) ** 2 / 2;
        let sx = m.home[0], sz = m.home[1];
        if (i === 0) { const s1 = seg(p, m.a, m.a + .008); sx = mix(m.home[0], ARROWS[0] + .3, s1); sz = mix(m.home[1], ARROWS[1] - .15, s1); } // over the arrows by the gate first
        const k1b = i === 0 ? smooth(seg(p, m.a + .008, m.at)) : k1;
        x = k2 > 0 ? mix(PP[0], m.out[0], k2s) : mix(sx, PP[0], k1b); z = k2 > 0 ? mix(PP[1], m.out[1], k2s) : mix(sz, PP[1], k1b);
        walk = (k1 > .01 && k1 < .99) || (k2 > .01 && k2 < .99);
        dir = walk ? (k2 > 0 ? toward(PP[0], m.out[0]) : toward(i === 0 ? ARROWS[0] : sx, PP[0])) : toward(x, HA[0]);
        wph = p * 170 + i; arms = undefined; lean = 0;
        const hit = p > m.hit + .004;
        if (hit && m.g === 1) arms = [[.6, 1.42 + .04 * Math.sin(wph * .5)]]; // groping, blind
        if (hit && m.g === 2) { lean = .14; arms = [[.22, 1.0]]; sq = .96; } // bent, a hand at the belly
        if (hit && m.g === 4) lean = .1; // head down
        const limp = hit && (m.g === 3 || m.g === 0) ? 1 : 0;
        bob = walk ? Math.abs(Math.sin(wph)) * .03 * (1 + limp * 1.4) : 0;
        if (walk && limp) lean += Math.max(0, Math.sin(wph)) * .05;
        alpha = a0 * (1 - smooth(seg(p, m.end - .012, m.end)));
        labA = Math.max(names, bump(p, m.a, m.a + .006, m.end - .012, m.end));
      }
      if (alpha <= 0) return;
      shadow(x, z, 1.75 * sq, .45, .22);
      items.push([z - camZ, () => {
        person(x, z, { dir, cl: m.cl, hd: m.hd, lean: lean + (walk ? Math.sin(wph) * .03 : 0), arms, bob, sq, alpha, sc: 1.02 });
        label(x, z, m.n, labA * alpha, p < .645 ? (i % 2) * 22 : 0);
      }]);
    });
    // ----- Gabriel: light only, a column at his side; a thread of it to the place the text names -----
    const gab = bump(p, .59, .615, .925, .95);
    if (gab > 0) {
      const zr = GL[1] - camZ;
      items.push([zr - .1, () => {
        const s = F / zr, [X, Y0] = P3(GL[0], HJH, GL[1]), sh = .85 + .15 * Math.sin(t * 2.1), w0 = .32 * s, w1 = .9 * s;
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(0, -H * .05, 0, Y0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.45, `rgba(255,238,196,${.13 * gab * sh})`); g.addColorStop(1, `rgba(255,236,190,${.3 * gab * sh})`);
        c.fillStyle = g; c.beginPath(); c.moveTo(X - w1, -H * .05); c.lineTo(X + w1, -H * .05); c.lineTo(X + w0, Y0); c.lineTo(X - w0, Y0); c.closePath(); c.fill();
        c.fillRect(X - w0 * .35, -H * .05, w0 * .7, Y0 + H * .05); // its bright core
        const g2 = c.createRadialGradient(X, Y0, 0, X, Y0, 1.6 * s); g2.addColorStop(0, `rgba(255,236,190,${.3 * gab * sh})`); g2.addColorStop(1, 'rgba(255,236,190,0)'); c.save(); c.translate(0, Y0); c.scale(1, .35); c.translate(0, -Y0); c.fillStyle = g2; c.fillRect(X - 1.6 * s, Y0 - 1.6 * s, 3.2 * s, 3.2 * s); c.restore();
        c.restore();
      }]);
      FIVE.forEach((m) => {
        const bm = bump(p, m.hit - .004, m.hit, m.hit + .006, m.hit + .012); if (bm <= 0) return;
        const tz = PP[1], zr2 = tz - camZ;
        items.push([zr2 - .3, () => {
          const [x0, y0] = P3(GL[0], HJH + 2.4, GL[1]), [x1, y1] = P3(PP[0] + (m.g === 1 || m.g === 4 ? .1 : .04), m.v, tz), s = F / zr2;
          c.save(); c.globalCompositeOperation = 'lighter';
          const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(255,238,196,${.5 * bm})`); g.addColorStop(1, `rgba(255,250,226,${.9 * bm})`);
          c.strokeStyle = g; c.lineCap = 'round';
          c.lineWidth = Math.max(1.5, .06 * s); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
          c.globalAlpha = .4; c.lineWidth = Math.max(4, .2 * s); c.stroke();
          c.globalAlpha = 1; const r = Math.max(6, .45 * s), g3 = c.createRadialGradient(x1, y1, 0, x1, y1, r); g3.addColorStop(0, `rgba(255,250,230,${.8 * bm})`); g3.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = g3; c.fillRect(x1 - r, y1 - r, 2 * r, 2 * r);
          c.restore();
        }]);
      });
    }
    items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());
    // ----- grade: night's blue lifts at dawn; the evening warms; the edges close in a little -----
    if (night > 0) { c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(170,176,214,${.1 * night})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    if (eve > 0) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${.3 * eve})`; c.fillRect(0, hy * .5, W, H - hy * .5); c.globalCompositeOperation = 'source-over'; }
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.3)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
