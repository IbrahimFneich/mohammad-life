(() => {
// habasha — «الهجرة إلى الحبشة»: the Prophet sends a party of the Muslims to Abyssinia under Ja'far b. Abi Talib;
// Quraysh send 'Amr b. al-'As and 'Umara b. al-Walid after them to the Negus; the hearing in his hall; Ja'far's answer
// and his recitation of Maryam; the Negus weeps, strikes 'Amr and keeps them; years later Ja'far comes to the Prophet
// at Khaybar (Tafsir al-Qummi 1:176–178, I'lam al-Wara 1:117, al-Khisal 2:484). Four small worlds in metres (x right,
// y up, z away) under one pinhole camera keyed on p, joined by dips to black:
//   p −.05 → .13  A  sunrise at the west edge of Mecca: the Prophet stands by the road; Ja'far before him; he points
//                    them on, the party goes up the road between the hills and he raises his hand after them
//      .13 → .276 B  the Red Sea at midday: their boat crosses under a lateen sail; a second boat follows with
//                    'Amr and 'Umara and the gifts for the Negus
//      .276 → .85 C  the hall of the Negus: the throne on its dais at the left end, a colonnade before the windows,
//                    light falling in shafts. .29 the envoys come in and lay the gifts before the dais (they stay: «فقبلها
//                    منهم»); .356 Ja'far is brought in with the emigrants; .414 he asks his questions; .474 his answer;
//                    .55 he recites, and light rises from him; .634 the Negus bows his head and weeps (posture only);
//                    .75 'Amr steps up to the dais, the Negus rises and strikes him; .806 'Amr goes out
//      .85 → 1.05 D  before Khaybar, the camp on the plain, the fortress on its hill: Ja'far's party comes in from the
//                    road; the Prophet rises, walks twelve steps to meet him (twelve prints in the sand, Khisal 2:484)
//                    and embraces him
// The Prophet is drawn only by Holy.draw (veiled, the gold disc). Everyone else, Ja'far too, is a faceless cloaked
// shape with an earth-toned head cloth. Everything follows from p; t moves only cloth, water, dust and the boats' roll.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const fade = (p, a, b) => smooth(seg(p, a, b));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const hash = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const toward = (x, tx) => Math.sign(tx - x) || 1;
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
const DIPS = [[.118, .13, .134, .146], [.262, .274, .278, .29], [.836, .848, .852, .864]];
const actOf = (p) => (p < .132 ? 0 : p < .276 ? 1 : p < .85 ? 2 : 3);

// ---------- the land: ridged noise for rock ----------
function crag(x, z) {
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
const SAND = [236, 212, 170], SANDD = [216, 188, 144], ROCK = [170, 126, 98], ROCKD = [120, 98, 90], FAR = [158, 150, 180];
const rockSand = (x, z, h, k = 30) => {
  const r = c01((h - 2) / k), mot = c01(.5 + .5 * Math.sin(x * .09 + Math.sin(z * .07) * 2) * Math.sin(z * .11 - x * .05));
  let a = lerp(lerp(SANDD, SAND, mot), lerp(ROCK, ROCKD, c01(.5 + .5 * Math.sin(x * .013 + z * .021 + h * .03))), r);
  if (z < 60) { const mt = .94 + .05 * Math.sin(x * 1.7 + z * 2.3) * Math.sin(z * 1.9 - x * .8) + .03 * Math.sin(x * 4.1 + z * 3.3); a = a.map((v) => v * mt); }
  const far = smooth(c01((z - 650) / 1100)); if (far > 0) a = lerp(a, FAR, far);
  return a;
};
// ---------- world A: the west edge of Mecca; the road out between the hills ----------
const roadX = (z) => -.07 * z - 3.5 * Math.sin(z * .009);
function hA(x, z) {
  const d = Math.abs(x - roadX(z)), wv = 24 + z * .08;
  let h = smooth(c01((d - wv) / (52 + z * .26))) * (18 + 120 * crag(x * .8 + 200, z * .8)) * (1 - .6 * smooth(c01((z - 420) / 900)));
  h += smooth(c01((z - 2400) / 2200)) * (80 + 220 * crag(x * .4 + 900, z * .4));
  return h + .05 * Math.sin(x * 1.1 + z * .6) * Math.sin(z * 1.3 - x * .5);
}
const PA = [4.0, 9.4], JA = [2.15, 10.5]; // the Prophet by the road; Ja'far before him
// ---------- world B: the Red Sea; the far shore low and blue ----------
function hB(x, z) {
  const sh = z - 2900 - 260 * Math.sin(x * .0011 + 1.2) - 120 * Math.sin(x * .0037);
  if (sh <= 0) return 0;
  return smooth(c01(sh / 900)) * (14 + 110 * crag(x * .5 + 1500, z * .5)) + Math.min(4, sh * .03);
}
const WATER = [22, 116, 140];
// ---------- world C: the hall of the Negus (the throne on its dais at the left end) ----------
const HX0 = -14, HX1 = 17, HZ1 = 27, HHT = 9.2;
const DAIS = [-11.8, -5.6, 10.4, 20.6], DY = .9, THR = [-8.9, 15.5];
const COLS = [-11, -6, -1, 4, 9, 14], CZ = 22.4, WINS = [-8.5, -3.5, 1.5, 6.5, 11.5], WY = [3.3, 6.9];
const DOOR = [10.2, 14.4]; // the doorway in the right wall
const GIFT = [[-4.1, 16.5, 0], [-3.7, 17.4, 1], [-4.2, 18.2, 2], [-3.55, 16.0, 3], [-4.15, 19.0, 0]]; // what they lay down: chests, a bale, a jar
// ---------- world D: before Khaybar ----------
function hD(x, z) {
  const near = smooth(c01((z - 30) / 90));
  let h = near * (1.6 * Math.sin(x * .021 + 1) * Math.sin(z * .017) + .9 * Math.sin(x * .05 - z * .03));
  const fx = x + 66, fz = z - 220; h += 30 * Math.exp(-(fx * fx + fz * fz) / (2 * 52 * 52));
  h += smooth(c01((z - 900) / 1600)) * (70 + 230 * crag(x * .45 + 300, z * .45));
  return Math.max(0, h) + .04 * Math.sin(x * 1.3 + z * .7) * Math.sin(z * 1.1 - x * .4);
}
const FORT = [[-74, -58, 214, 226, 9], [-60, -55, 210, 232, 12.5], [-79, -74, 212, 228, 12], [-70, -62, 226, 232, 7.5]]; // x0 x1 z0 z1 height
const PD = [-6.6, 18.8], STEP = .62, JD = [1.62, 18.9]; // his seat in the shade; twelve steps; where Ja'far stops

// ---------- light keys: sky top, sky mid, horizon, sun colour, sky light, haze, sun elevation (deg), azimuth (rad, 0 = ahead, + = right), fog ----------
const LA = [[-.06, [38, 94, 174], [118, 166, 224], [250, 226, 200], [255, 230, 192], [178, 176, 190], [222, 214, 214], 20, -2.4, 2600], [.135, [34, 92, 172], [110, 162, 222], [244, 226, 206], [255, 236, 204], [176, 178, 194], [216, 212, 216], 26, -2.35, 2800]];
const LB = [[.13, [22, 86, 170], [82, 150, 214], [214, 230, 238], [255, 246, 230], [150, 166, 186], [198, 216, 232], 36, -.3, 3400], [.28, [22, 84, 168], [84, 150, 214], [218, 230, 236], [255, 244, 226], [150, 164, 184], [200, 216, 230], 33, -.34, 3400]];
const LC = [[.27, [0, 0, 0], [0, 0, 0], [0, 0, 0], [255, 236, 204], [232, 210, 182], [200, 180, 150], 36, -.3, 1e7], [.86, [0, 0, 0], [0, 0, 0], [0, 0, 0], [255, 230, 196], [228, 204, 176], [200, 180, 150], 33, -.36, 1e7]];
const LD = [[.84, [28, 82, 160], [98, 152, 210], [238, 224, 202], [255, 238, 208], [154, 156, 170], [206, 208, 216], 34, 2.5, 3000], [.95, [30, 80, 156], [104, 150, 206], [242, 220, 196], [255, 232, 198], [156, 154, 166], [214, 208, 210], 28, 2.45, 2900], [1.06, [34, 76, 150], [114, 148, 200], [246, 214, 184], [255, 222, 178], [158, 150, 160], [226, 206, 188], 21, 2.4, 2700]];
// camera keys: p, the point it looks at (x, z), its own z, its height
const CA = [[-.07, 2.8, 11.5, -.5, 2.1], [.035, 2.4, 12.5, 0, 2.0], [.085, 1, 24, -2.5, 2.9], [.14, -1.5, 40, -4.5, 3.9]];
const CB = [[.13, 12, 42, -6, 3.2], [.2, 1, 42, -6, 3.0], [.24, 4, 34, -5, 2.8], [.28, 6, 30, -4, 2.7]];
const CC = [[.27, .5, 15, -9.5, 3.0], [.31, -2.4, 15, -4, 2.5], [.35, -1.5, 15.5, -4.5, 2.5], [.41, -3, 15.5, 0, 2.3], [.47, -5.4, 15.4, 4.2, 2.15], [.54, -5.5, 15.4, 4.6, 2.15],
  [.565, -4.4, 15.5, 1.5, 2.3], [.625, -4.8, 15.5, 3, 2.2], [.645, -7.6, 15.5, 8.2, 2.2], [.69, -7.4, 15.5, 8, 2.2], [.705, -5, 15.5, 3, 2.3], [.745, -5, 15.2, 3, 2.3],
  [.775, -5.2, 14.8, 5.6, 2.15], [.805, -2.5, 15, -1.5, 2.4], [.86, 3, 14, -6, 2.8]];
const CD = [[.84, -4, 38, -14, 4.4], [.9, -2.5, 28, -4, 3.0], [.935, -2.6, 20, 2.5, 2.3], [.975, -2.4, 18.8, 7.6, 3.0], [1.06, -2.3, 18.8, 8.3, 2.9]];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const SEAT = [-.42, 0, -.44, .22, -.36, .5, -.26, .72, -.16, .84, -.1, .9, -.02, 1.0, .1, .98, .13, .88, .12, .82, .2, .74, .24, .5, .42, .36, .55, .18, .52, 0];
const CHAIR = [-.3, 0, -.3, .62, -.2, .66, -.18, .9, -.12, .98, -.1, 1.04, -.02, 1.12, .1, 1.1, .13, 1.0, .12, .94, .2, .86, .24, .62, .5, .58, .52, .1, .46, 0]; // seated on a raised seat, the legs hanging
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };
const CLOTH = [[150, 128, 98], [120, 100, 78], [96, 86, 74], [170, 146, 110], [104, 92, 98], [132, 104, 76], [112, 86, 64], [140, 118, 92]];
const HEAD = [[168, 148, 116], [140, 118, 90], [122, 106, 86], [176, 152, 110], [150, 124, 92], [132, 112, 86]];

S.habasha = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(9137);
    // A: houses at the town's edge, behind and beside the camera's road; [x0, x1, z0, depth, height, albedo, seed, y0]
    const TONE = [[226, 200, 160], [208, 176, 136], [236, 222, 194], [194, 160, 122], [218, 194, 164]];
    const HS = [];
    const row = (xa, xb, za, zb, h0, h1) => { for (let x = xa; x < xb;) { const w = 3.4 + R() * 4; HS.push([x, x + w, za + R() * (zb - za), 5 + R() * 4, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); x += w + R() * .8; } };
    row(13, 44, 14, 19, 3.8, 6.4); row(18, 50, 24, 30, 4.0, 6.8); row(-46, -14, 9, 14, 3.6, 6.0); row(-44, -18, 20, 26, 3.4, 5.6);
    for (let i = 0; i < 70; i++) { const side = R() < .5 ? -1 : 1, z = 8 + R() * 60, x = side * (26 + R() * 44), y = hA(x, z); if (y > 18) continue; HS.push([x, x + 4 + R() * 5, z, 6, 3.6 + R() * 3, TONE[(R() * 5) | 0], R(), Math.max(0, y - .5)]); }
    st.HS = HS;
    // A: the party: gathered behind Ja'far, then up the road in a loose file; [x0, z0, x1, z1, start, cloth, head, bundle/staff]
    st.emA = Array.from({ length: 13 }, (_, i) => {
      const x0 = -2.6 + R() * 5.2, z0 = 11.4 + R() * 5.2, z1 = 30 + i * 1.7 + R() * 1.2;
      return [x0, z0, roadX(z1) + (R() - .5) * 1.8, z1, .03 + .004 * (i % 6) + R() * .006, CLOTH[i % 8], HEAD[(i * 5) % 6], R() < .45 ? 'bundle' : R() < .5 ? 'staff' : ''];
    }).filter(([x0, z0]) => Math.hypot(x0 - PA[0], z0 - PA[1]) > 1.6 && Math.hypot(x0 - JA[0], z0 - JA[1]) > 1.1);
    st.peb = Array.from({ length: 420 }, () => [-20 + R() * 40, -6 + R() ** 1.2 * 50, .03 + R() ** 2 * .08, R()]);
    st.cirrus = Array.from({ length: 9 }, () => [R() * 1.6 - .3, .1 + R() * .32, .2 + R() * .4, R()]);
    // B: low clouds along the horizon over the sea
    st.cum = Array.from({ length: 8 }, (_, i) => ({ u: i / 7 + (R() - .5) * .06, v: .06 + R() * .08, w: .07 + R() * .06, puffs: Array.from({ length: 16 }, () => { const du = R() * 2 - 1; return [du, (1 - Math.abs(du)) * (.2 + .8 * R()), .3 + R() * .45]; }).sort((a, b) => b[1] - a[1]) }));
    st.chop = Array.from({ length: 640 }, () => [R(), R() ** 1.6, R(), R()]); // flecks on the water: across, depth, length, phase
    // C: dust in the shafts of light
    st.mote = Array.from({ length: 140 }, () => [R(), R(), R(), R()]);
    // C: the courtiers at the back between the columns, the guards by the dais, the emigrants who come in with Ja'far
    st.court = [[-3.6, 20.4], [1.4, 20.8], [6.4, 20.3], [11.2, 20.7], [-8.6, 21.0]].map(([x, z], i) => ({ x, z, cl: [[58, 52, 66], [70, 58, 54], [52, 50, 62], [76, 64, 56], [60, 56, 70]][i], hd: [[110, 86, 60], [124, 98, 70], [104, 84, 62], [118, 92, 66], [98, 80, 60]][i], dir: -1 }));
    st.emC = [[1.6, 16.9], [2.6, 18.1], [3.3, 16.6], [4.3, 17.7], [5.2, 16.9], [6.0, 18.4]].map(([x, z], i) => ({ x, z, cl: CLOTH[(i * 3) % 8], hd: HEAD[(i * 2 + 1) % 6], d: .004 * i }));
    // D: palms in groves and singles; [x, z, height, phase, lean]
    st.palms = [];
    [[-36, 70, 8], [-20, 110, 6], [30, 84, 9], [52, 130, 7], [-56, 160, 8], [12, 170, 6], [70, 64, 5]].forEach(([cx, cz, n]) => { for (let i = 0; i < n; i++) st.palms.push([cx + (R() - .5) * 26, cz + (R() - .5) * 20, 6 + R() * 6, R() * TAU, (R() - .5) * .2]); });
    for (let i = 0; i < 8; i++) { const x = -44 + R() * 88, z = 34 + R() * 26; if (Math.abs(x + 2) < 16) continue; st.palms.push([x, z, 6.5 + R() * 4, R() * TAU, (R() - .5) * .2]); }
    st.scrub = Array.from({ length: 70 }, () => [-30 + R() * 60, 6 + R() ** 1.3 * 60, .2 + R() * .45, R()]).filter(([x, z]) => !(z < 24 && x > -11 && x < 12));
    st.emD = Array.from({ length: 8 }, (_, i) => ({ dx: 1.2 + (i % 3) * 1.15 + R() * .4, dz: -.8 + ((i / 3) | 0) * 1.7 + R() * .6, cl: CLOTH[(i * 5 + 2) % 8], hd: HEAD[(i + 3) % 6], d: .003 * i, kit: R() < .5 ? 'bundle' : 'staff' }));
    st.compD = [[-8.5, 19.6], [-4.9, 20.3], [-8.9, 17.7]].map(([x, z], i) => ({ x, z, cl: CLOTH[(i * 3 + 1) % 8], hd: HEAD[(i * 4) % 6] }));
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7), hy = H * (phone ? .62 : .58);
    const act = actOf(p);
    // ----- the camera -----
    const [lx, lz, camZ, camY] = keyAt([CA, CB, CC, CD][act], p), aim = phone ? .5 : .42;
    const camX = lx - (aim - .5) * W / F * (lz - camZ);
    const PX = (x, z) => W / 2 + (x - camX) * F / (z - camZ), PY = (y, z) => hy - (y - camY) * F / (z - camZ);
    const P3 = (x, y, z) => [PX(x, z), PY(y, z)];
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt([LA, LB, LC, LD][act], p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const sunSide = Math.sign(sun[0]) || 1, front = c01(-sun[2]), day = c01((elev + 2) / 10);
    const fogA = (zr) => Math.min(.88, (1 - Math.exp(-zr / fogL)) * .95);
    const fig = (base, zr = 8) => { const k = [0, 1, 2].map((j) => base[j] / 255 * (amb[j] * .7 + sunC[j] * (.3 + .3 * front) * day)); return lerp(k, haze, fogA(zr) * .9); };
    const wall = (base, lam, zr, a = .72) => lerp(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), haze, fogA(zr) * .9);
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };

    // ----- sky and land for the outdoor worlds -----
    const sky = () => {
      const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.58, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      const sx = sun[2] > .05 ? W / 2 + sun[0] / sun[2] * F : sunSide > 0 ? W * 1.3 : -W * .3, syy = sun[2] > .05 ? hy - sun[1] / sun[2] * F : hy * .55;
      const X = Math.max(-W * .4, Math.min(W * 1.4, sx)), Y = Math.max(-H * .2, Math.min(hy, syy));
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(X, Y, 0, X, Y, F * .9); g.addColorStop(0, rgb(sunC, sun[2] > .05 ? .42 : .14)); g.addColorStop(.2, rgb(sunC, .12)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
      c.globalCompositeOperation = 'source-over';
      if (sx > -20 && sx < W + 20 && syy > -20 && sun[2] > .05) { c.fillStyle = 'rgba(255,250,238,.97)'; c.beginPath(); c.arc(sx, syy, F * .012, 0, TAU); c.fill(); }
      st.cirrus.forEach(([u, v, w, k]) => {
        const x = ((u * W - camX * 6 + p * W * .2) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = v * hy, rw = w * W * .5, rh = rw * .05;
        c.save(); c.translate(x, y); c.rotate(-.04 + k * .08); c.scale(rw, rh); const q = c.createRadialGradient(0, 0, 0, 0, 0, 1); q.addColorStop(0, rgb(lerp([255, 255, 255], sunC, .3), .28 + .2 * k)); q.addColorStop(1, rgb([255, 255, 255], 0)); c.fillStyle = q; c.fillRect(-1, -1, 2, 2); c.restore();
      });
      return [sx, syy];
    };
    const land = (hgt, col) => {
      const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2.5, z1 = 7000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), z = zr + camZ, fa = fogA(zr), e = Math.max(.25, zr * .006);
        for (let k = 0; k <= NK; k++) {
          const sx = -W * .06 + k * (W * 1.12 / NK), x = camX + (sx - W / 2) * zr / F, h = hgt(x, z), o = i * (NK + 1) + k;
          TX[o] = sx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hgt(x + e, z) - h) / e, hz = (hgt(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, skyL = .62 + .38 / nl;
            const cc = col(x, z, h, zr, lam, skyL), n = (i * NC + k / 2) * 3;
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j], haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .12);
    };
    const lit = (al, lam, skyL) => al.map((v, j) => v / 255 * (amb[j] * skyL * .7 + sunC[j] * lam * .8));
    // ----- shadows on the ground, away from the sun -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [30, 30, 60], .55), shA = .3 * day + .1;
    const shadow = (x, z, hm, w, a = .26, y0 = 0) => {
      if (z - camZ < 1) return;
      a *= shA / .4;
      const tx = x + shD[0] * hm * day, tz = Math.max(camZ + 1.5, z + shD[1] * hm * day);
      const X0 = PX(x, z), Y0 = PY(y0, z), X1 = PX(tx, tz), Y1 = PY(y0, tz), ww = w * F / (z - camZ);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * .24); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      if (day > .05 && act !== 2) { const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .8)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2; c.beginPath(); c.moveTo(X0 - ww * .5, Y0); c.lineTo(X1 - ww * .25, Y1); c.lineTo(X1 + ww * .25, Y1); c.lineTo(X0 + ww * .5, Y0); c.closePath(); c.fill(); }
    };
    const gq = (pts, col, y = .005) => { const a = pts.map(([x, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    const quad = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    // a block: its faces toward the camera and its top (y0 its foot)
    const slab = (x0, x1, z0, z1, h, alb, key, y0 = 0, a = .68) => {
      const zr = (z0 + z1) / 2 - camZ; if (z1 - camZ < 1.5) return;
      items.push([key ?? zr + (z1 - z0) * .5 - .2, () => {
        if (camX < x0) quad([[x0, y0, z0], [x0, y0, z1], [x0, y0 + h, z1], [x0, y0 + h, z0]], rgb(wall(alb, Math.max(0, -sun[0]), zr, a)));
        if (camX > x1) quad([[x1, y0, z0], [x1, y0, z1], [x1, y0 + h, z1], [x1, y0 + h, z0]], rgb(wall(alb, Math.max(0, sun[0]), zr, a)));
        if (camZ < z0) quad([[x0, y0, z0], [x1, y0, z0], [x1, y0 + h, z0], [x0, y0 + h, z0]], rgb(wall(alb, Math.max(0, -sun[2]), zr, a * .97)));
        if (camY > y0 + h) quad([[x0, y0 + h, z0], [x1, y0 + h, z0], [x1, y0 + h, z1], [x0, y0 + h, z1]], rgb(lerp(wall(alb, Math.max(0, sun[1]), zr, a * 1.15), [255, 246, 226], .08)));
      }]);
    };

    // ----- figures: a faceless cloaked shape facing dir; arms are hand points in its own units -----
    const person = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2 || (o.alpha ?? 1) <= 0) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -3 * s || X > W + 3 * s) return;
      const Y = PY(o.y0 || 0, z) - (o.bob || 0) * s, dir = o.dir || 1, sq = o.sq || 1, lean = o.lean || 0, sh = o.shape || MAN, seat = sh !== MAN;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * dir, -s * sq);
      const dark = fig(lerp(o.cl, [20, 20, 30], .3), zr), lt = fig(lerp(o.cl, [255, 230, 200], .15), zr), ls = dir * sunSide > 0;
      const S0 = sh === SEAT ? [.03 + lean * .78, .76] : sh === CHAIR ? [.03 + lean * .9, .92] : [.05 + lean * 1.42, 1.4];
      const arm = (hand, near) => { const el = [(S0[0] + hand[0]) / 2 + .06, (S0[1] + hand[1]) / 2 - .12]; c.beginPath(); tube(c, [S0, el, hand], .15, .1); c.fillStyle = rgb(near ? lerp(dark, lt, o.cuff ? .75 : .45) : lerp(dark, [10, 10, 16], .2)); c.fill(); if (o.cuff) { c.strokeStyle = rgb(fig([226, 184, 96], zr)); c.lineWidth = .05; c.beginPath(); tube(c, [S0, el, hand], .15, .1); c.stroke(); } c.fillStyle = rgb(fig([200, 184, 160], zr)); c.beginPath(); c.arc(hand[0], hand[1], .05, 0, TAU); c.fill(); };
      if (o.spear) { c.strokeStyle = rgb(fig([96, 72, 46], zr)); c.lineWidth = .045; c.beginPath(); c.moveTo(.34, -.02); c.lineTo(.4, 2.55); c.stroke(); c.fillStyle = rgb(fig([206, 208, 214], zr)); c.beginPath(); c.moveTo(.41, 2.86); c.lineTo(.36, 2.55); c.lineTo(.45, 2.55); c.closePath(); c.fill(); }
      (o.arms || []).forEach((h, i) => { if (i === 1) arm(h, false); });
      c.beginPath(); poly(c, sh, lean);
      const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(ls ? dark : lt)); g.addColorStop(.6, rgb(dark)); g.addColorStop(1, rgb(ls ? lt : dark)); c.fillStyle = g; c.fill();
      if (o.rim) { c.strokeStyle = `rgba(255,222,160,${o.rim})`; c.lineWidth = 2.2 / s; c.stroke(); }
      if (o.trim) { c.save(); c.clip(); c.fillStyle = rgb(lerp(fig([214, 172, 84], zr), [255, 230, 160], .25)); c.fillRect(.02 + lean * .7, 0, .07, seat ? .86 : 1.42); c.fillRect(-.5, seat ? .05 : .05, 1.1, .05); c.restore(); }
      const hp = sh === SEAT ? [.03, .93] : sh === CHAIR ? [.03, 1.08] : [.01, 1.69], hl = lean * hp[1];
      c.fillStyle = rgb(fig(o.hd || [150, 128, 98], zr));
      if (o.cap) { // a tall rounded cap with a band of gold
        c.beginPath(); c.ellipse(hp[0] + hl, hp[1] + .03, .14, .13, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(hp[0] + hl - .13, hp[1] + .06); c.quadraticCurveTo(hp[0] + hl - .12, hp[1] + .34, hp[0] + hl + .01, hp[1] + .36); c.quadraticCurveTo(hp[0] + hl + .13, hp[1] + .34, hp[0] + hl + .13, hp[1] + .06); c.closePath(); c.fill();
        c.fillStyle = rgb(lerp(fig([214, 172, 84], zr), [255, 232, 170], .3)); c.fillRect(hp[0] + hl - .135, hp[1] + .07, .27, .05);
      } else { c.beginPath(); c.ellipse(hp[0] + hl, hp[1], .14, .1, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hp[0] + hl - .07, hp[1] - .11, .05, .11, .3, 0, TAU); c.fill(); }
      (o.arms || []).forEach((h, i) => { if (i !== 1) arm(h, true); });
      if (o.staff) { c.strokeStyle = rgb(fig([96, 70, 44], zr)); c.lineWidth = .05; c.beginPath(); c.moveTo(.34, 0); c.lineTo(.3, 1.5); c.stroke(); }
      if (o.bundle) { const [hx, hy2] = o.arms ? o.arms[0] : [-.18, 1.34]; c.fillStyle = rgb(fig([118, 84, 56], zr)); c.beginPath(); c.ellipse(hx - .06, hy2 - .02, .16, .13, .3, 0, TAU); c.fill(); }
      if (o.load) { const hy2 = 1.86; c.fillStyle = rgb(fig(o.load, zr)); c.fillRect(-.3, hy2, .6, .34); c.fillStyle = rgb(fig([214, 172, 84], zr)); c.fillRect(-.3, hy2 + .12, .6, .05); }
      c.restore();
    };
    const label = (x, z, txt, a, dy = 0, y0 = 0) => { // a name under a man's feet
      const zr = z - camZ; if (a <= 0 || zr < 1.5) return;
      const s = F / zr, X = PX(x, z), Y = PY(y0, z) + Math.max(14, .42 * s) + dy;
      c.save(); c.globalAlpha = a; c.direction = 'rtl'; c.textAlign = 'center'; c.font = `${Math.max(12, Math.min(19, .3 * s))}px ${FONT.naskh}`;
      c.fillStyle = 'rgba(10,12,22,.55)'; const w = c.measureText(txt).width; c.fillRect(X - w / 2 - 6, Y - 13, w + 12, 20);
      c.fillStyle = 'rgba(255,244,214,.96)'; c.fillText(txt, X, Y + 2); c.restore();
    };
    const holy = (x, z, o) => { // the Prophet: Holy.draw only
      const zr = z - camZ; if (zr < 1.2) return null;
      const X = PX(x, z), Y = PY(0, z), h = 1.8 * F / zr;
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; return hd;
    };
    const houses = (lamF) => st.HS.forEach(([x0, x1, z0, d, h, alb, seed, y0]) => {
      const zr = z0 - camZ; if (zr < 2) return;
      const X0 = PX(x0, z0), X1 = PX(x1, z0); if (X1 < -60 || X0 > W + 60) return;
      items.push([zr, () => {
        const s = F / zr, Yb = PY(y0, z0), Yt = PY(y0 + h, z0);
        const cf = wall(alb, lamF, zr, .66), side = camX < x0 ? -1 : camX > x1 ? 1 : 0;
        if (side) { const xs = side < 0 ? x0 : x1; quad([[xs, y0, z0], [xs, y0, z0 + d], [xs, y0 + h, z0 + d], [xs, y0 + h, z0]], rgb(wall(alb, Math.max(0, side * sun[0]), zr, .68))); }
        if (y0 + h < camY) quad([[x0, y0 + h, z0], [x1, y0 + h, z0], [x1, y0 + h, z0 + d], [x0, y0 + h, z0 + d]], rgb(wall(alb, Math.max(0, sun[1]), zr, .8)));
        c.fillStyle = rgb(cf); c.fillRect(X0, Yt, X1 - X0, Yb - Yt);
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .22)); c.fillRect(X0 - .08 * s, Yt - .2 * s, X1 - X0 + .16 * s, .2 * s);
        if (s > 2) {
          const dk = rgb(lerp(cf, [30, 22, 18], .55)), w = X1 - X0;
          if (seed > .25) { c.fillStyle = dk; c.fillRect(X0 + w * (.15 + seed * .5), Yb - 1.9 * s, .85 * s, 1.9 * s); }
          const nw = Math.max(1, Math.round(w / s / 2.2));
          for (let j = 0; j < nw; j++) { const wx = X0 + (j + .5) * w / nw - .25 * s; if (h > 4.4) { c.fillStyle = rgb(lerp(cf, [40, 30, 26], .8)); c.fillRect(wx, Yt + 1.0 * s, .5 * s, .7 * s); } }
          c.fillStyle = dk; for (let j = 0; j < w / s / .7 - 1; j++) c.fillRect(X0 + (j + .6) * .7 * s, Yt + .35 * s, Math.max(1, .1 * s), Math.max(1, .1 * s));
        }
      }]);
    });
    const walkO = (tr, ph) => (tr.walk ? { lean: Math.sin(ph) * .03, bob: Math.abs(Math.sin(ph)) * .03 } : { lean: 0, bob: 0 });

    if (act === 0) {
      // ======================= A: the edge of Mecca at sunrise =======================
      sky();
      land(hA, (x, z, h, zr, lam, skyL) => lit(rockSand(x, z, h), lam, skyL));
      { // the road: a paler beaten strip running out between the hills, foot-worn lines along it
        const L = [], Rr = [], z0 = camZ + 1.2;
        for (let k = 0; k <= 60; k++) { const z = z0 + (k / 60) ** 2 * 520, w = 1.5 + z * .004; L.push(P3(roadX(z) - w, .01, z)); Rr.push(P3(roadX(z) + w, .01, z)); }
        const g = c.createLinearGradient(0, H, 0, hy); g.addColorStop(0, rgb(lit([246, 230, 198], .9 * day, 1), .42)); g.addColorStop(1, rgb(lerp(lit([246, 230, 198], .9 * day, 1), haze, .5), .12));
        c.fillStyle = g; c.beginPath(); L.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = Rr.length - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath(); c.fill();
        c.strokeStyle = rgb(lit([190, 160, 120], .6, 1), .35); c.lineWidth = 1;
        [-.5, .4].forEach((off) => { c.beginPath(); for (let k = 0; k <= 40; k++) { const z = z0 + (k / 40) ** 2 * 200, q = P3(roadX(z) + off, .012, z); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke(); });
      }
      { // pebbles and grit by the road
        c.fillStyle = rgb(wall([150, 124, 98], .5, 20), .32); c.beginPath();
        st.peb.forEach(([x, z, r]) => { const zr = z - camZ; if (zr < 2) return; const X = PX(x, z); if (X < -10 || X > W + 10) return; const s = F / zr, Y = PY(0, z); if (Y > H + 4) return; c.moveTo(X + r * s, Y); c.ellipse(X, Y, r * s, Math.max(.6, r * s * camY / zr), 0, 0, TAU); });
        c.fill();
      }
      houses(Math.max(0, -sun[2]));
      // the party: Ja'far before the Prophet, then all up the road
      const jt = track([[-.07, ...JA], [.034, ...JA], [.04, JA[0] - .4, JA[1] + 1.2], [.134, roadX(62) + .3, 62]], p);
      const lead = { x: jt.x, z: jt.z };
      st.emA.forEach(([x0, z0, x1, z1, s0, cl, hd, kit], i) => {
        const tr = track([[-.07, x0, z0], [s0, x0, z0], [.134, x1, z1]], p), ph = p * 190 + i * 1.9, w = walkO(tr, ph);
        const dir = tr.walk ? -1 : toward(tr.x, PA[0]);
        shadow(tr.x, tr.z, 1.75, .45, .22);
        items.push([tr.z - camZ, () => person(tr.x, tr.z, { dir, cl, hd, ...w, bundle: kit === 'bundle', staff: kit === 'staff', sc: .96 + hash(i) * .08 })]);
      });
      { const ph = p * 190, w = walkO(jt, ph), dir = jt.walk ? -1 : 1, arms = jt.walk ? undefined : [lerp([.14, .44], [.3, .7], bump(p, -.02, .0, .028, .034))];
        shadow(lead.x, lead.z, 1.8, .45, .24);
        items.push([lead.z - camZ, () => { person(lead.x, lead.z, { dir, cl: [156, 112, 60], hd: [132, 104, 70], ...w, arms, sc: 1.03 }); label(lead.x, lead.z, 'جعفر بن أبي طالب', bump(p, -.04, -.02, .05, .065)); }]); }
      // the Prophet: his hand toward the road as he sends them, then raised after them
      { const send = bump(p, .0, .012, .05, .062), bye = bump(p, .075, .09, 1, 1.1);
        let arms; if (send > .01) arms = [lerp([-.13, -.42], [-.42, -.7], send)]; else if (bye > .01) arms = [lerp([.13, -.42], [.3, -1.02], bye)];
        shadow(PA[0], PA[1], 1.8, .5, .24);
        items.push([PA[1] - camZ - .01, () => holy(PA[0], PA[1], { pose: 'stand', arms, amb: .9, glow: .16 })]); }
      draw();
    } else if (act === 1) {
      // ======================= B: the Red Sea =======================
      const [sx] = sky();
      { // low clouds along the far horizon, white above and warm under
        const shade = lerp([214, 218, 230], skH, .35), litc = [255, 255, 255];
        st.cum.forEach((cl) => {
          const cx = ((cl.u * W * 1.3 - camX * 3) % (W * 1.3) + W * 1.3) % (W * 1.3) - W * .15, cy = hy - cl.v * hy * .55, rw = cl.w * W;
          c.globalAlpha = .7;
          cl.puffs.forEach(([du, dv, r]) => {
            const R0 = r * rw * .5 * (1 - .3 * Math.abs(du)), x0 = cx + du * rw * .8, y0 = cy - dv * rw * .4;
            const g = c.createRadialGradient(x0 - R0 * .2, y0 - R0 * .35, R0 * .1, x0, y0, R0);
            g.addColorStop(0, rgb(litc)); g.addColorStop(.68, rgb(lerp(litc, shade, .55))); g.addColorStop(1, rgb(shade, 0));
            c.fillStyle = g; c.beginPath(); c.arc(x0, y0, R0, 0, TAU); c.fill();
          });
        });
        c.globalAlpha = 1;
      }
      land(hB, (x, z, h, zr, lam, skyL) => {
        if (h > .02) return lit(lerp(rockSand(x, z, h * .5 + 3, 20), [196, 176, 150], .3), lam, skyL);
        const dist = Math.hypot(zr, camY), R = .02 + .98 * (1 - camY / dist) ** 5;
        const body = WATER.map((v, j) => v / 255 * (amb[j] * .62 + sunC[j] * .5 * day)), refl = lerp(skH, skM, .3);
        return lerp(body, refl, R * .82);
      });
      // the sun's path on the water, and its glints
      { const X = Math.max(-W * .2, Math.min(W * 1.2, sx));
        c.save(); c.globalCompositeOperation = 'lighter';
        c.translate(X, hy); c.scale(F * .16, (H - hy) * 1.1);
        const g = c.createRadialGradient(0, .02, 0, 0, .02, 1); g.addColorStop(0, rgb(sunC, .34)); g.addColorStop(.35, rgb(sunC, .1)); g.addColorStop(1, rgb(sunC, 0));
        c.fillStyle = g; c.fillRect(-1, 0, 2, 1.2); c.restore();
        c.save(); c.globalCompositeOperation = 'lighter';
        st.chop.forEach(([u, v, l, ph]) => {
          const zr = 3 + v * 260, z = zr + camZ, x = camX + (u * 1.3 - .65) * W * zr / F, X0 = PX(x, z); if (X0 < -20 || X0 > W + 20) return;
          const Y0 = PY(0, z), s = F / zr, near = Math.abs(X0 - X) / (W * .1 + 3 * s * 0), tw = .5 + .5 * Math.sin(t * (2 + 3 * l) + ph * 40 + u * 9);
          const glint = Math.exp(-near * near * 1.6) * tw, foam = .1 * (1 - v) * (.5 + .5 * Math.sin(t * .8 + ph * 30));
          const a = Math.min(.9, glint * .85 + foam);
          if (a < .03) return;
          c.strokeStyle = glint > foam ? rgb(lerp(sunC, [255, 255, 255], .5), a) : `rgba(236,246,250,${a})`;
          const hl = Math.min(W * .022, (.12 + l * .45) * s); if (v < .5 && glint < foam) { c.save(); c.globalCompositeOperation = 'source-over'; c.strokeStyle = `rgba(8,64,86,${.12 * (1 - v)})`; c.lineWidth = Math.max(.8, s * .06); c.beginPath(); c.moveTo(X0 - hl * 1.3, Y0 + s * .05); c.quadraticCurveTo(X0, Y0 + s * .09, X0 + hl * 1.3, Y0 + s * .05); c.stroke(); c.restore(); } c.lineWidth = Math.max(.6, s * .04); c.beginPath(); c.moveTo(X0 - hl, Y0); c.quadraticCurveTo(X0, Y0 - s * .03, X0 + hl, Y0 + Math.sin(ph * 9) * s * .02); c.stroke();
        });
        c.restore(); }
      // the boats: side views under lateen sails, their bows to the left (the way to the far shore)
      const boat = (bx, bz, L, o) => {
        const zr = bz - camZ; if (zr < 4) return;
        items.push([zr, () => {
          const s = F / zr, X = PX(bx, bz), Y0 = PY(0, bz); if (X < -L * s || X > W + L * s) return;
          const bob = Math.sin(t * 1.15 + o.ph) * .14, pitch = Math.sin(t * .9 + o.ph * 2) * .018;
          // the wake: foam spreading behind the stern, and the bow's wave
          c.save(); c.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 18; k++) { const d = k * 1.3, a = .34 * (1 - k / 18), q0 = P3(bx + L / 2 + d, 0, bz - (.5 + d * .32)), q1 = P3(bx + L / 2 + d, 0, bz + (.5 + d * .32)); c.strokeStyle = `rgba(236,246,250,${a})`; c.lineWidth = Math.max(1, s * .12 * (1 - k / 30)); c.beginPath(); c.moveTo(q0[0] - s * .4, q0[1]); c.lineTo(q0[0] + s * .4, q0[1]); c.moveTo(q1[0] - s * .4, q1[1]); c.lineTo(q1[0] + s * .4, q1[1]); c.stroke(); if (k < 6) { const m = P3(bx + L / 2 + d, 0, bz + Math.sin(k * 2.1 + t) * .3); c.fillStyle = `rgba(240,248,252,${a * .7})`; c.beginPath(); c.ellipse(m[0], m[1], s * (.6 + k * .15), s * .06, 0, 0, TAU); c.fill(); } }
          c.restore();
          c.save(); c.translate(X, Y0 - bob * s); c.rotate(pitch); c.scale(s, -s);
          const hull = rgb(fig(o.hull, zr)), hullD = rgb(fig(o.hull.map((v) => v * .62), zr));
          // the reflection under her
          c.save(); c.scale(1, -1); c.globalAlpha = .22; c.fillStyle = hullD; c.beginPath(); c.moveTo(-L / 2 - .9, 1.7); c.quadraticCurveTo(0, 1.05, L / 2, 1.35); c.lineTo(L / 2 - .2, 0); c.lineTo(-L / 2 + .6, 0); c.closePath(); c.fill(); c.restore();
          // passengers' heads and shoulders above the gunwale, behind the near side
          o.crew.forEach(([u, cl, hd, tall]) => { c.fillStyle = rgb(fig(cl, zr)); c.beginPath(); c.ellipse(u, 1.45 + tall * .5, .2, .32 + tall * .5, 0, 0, TAU); c.fill(); c.fillStyle = rgb(fig(hd, zr)); c.beginPath(); c.ellipse(u, 1.86 + tall, .13, .11, 0, 0, TAU); c.fill(); });
          (o.chests || []).forEach(([u, w, hh]) => { c.fillStyle = rgb(fig([116, 74, 44], zr)); c.fillRect(u - w / 2, 1.2, w, hh); c.fillStyle = rgb(fig([214, 172, 84], zr)); c.fillRect(u - w / 2, 1.2 + hh * .55, w, .06); });
          // the hull: the near side, the gunwale rising to the bow
          c.beginPath(); c.moveTo(-L / 2 - .9, 1.75); c.quadraticCurveTo(-L / 4, 1.32, 0, 1.3); c.quadraticCurveTo(L / 3, 1.3, L / 2, 1.5); c.lineTo(L / 2 - .15, -.1); c.quadraticCurveTo(0, -.32, -L / 2 + .7, -.1); c.closePath();
          const hg = c.createLinearGradient(0, 1.6, 0, -.2); hg.addColorStop(0, rgb(lerp(fig(o.hull, zr), [255, 240, 214], .18))); hg.addColorStop(.5, hull); hg.addColorStop(1, hullD); c.fillStyle = hg; c.fill();
          c.strokeStyle = rgb(fig([70, 46, 30], zr)); c.lineWidth = .05; c.beginPath(); c.moveTo(-L / 2 - .7, 1.62); c.quadraticCurveTo(-L / 4, 1.2, 0, 1.18); c.quadraticCurveTo(L / 3, 1.18, L / 2 - .05, 1.38); c.stroke();
          for (let k = 1; k < 4; k++) { c.globalAlpha = .35; c.beginPath(); c.moveTo(-L / 2 + .4 + k * .1, 1.3 - k * .3); c.quadraticCurveTo(0, 1.05 - k * .32, L / 2 - .1, 1.3 - k * .32); c.stroke(); } c.globalAlpha = 1;
          // the mast, the yard and the sail, lit through by the sun
          const mx = L * .08, yA = [-L / 2 + .3, 2.2], yB = [L * .42, 10.4], tack = [-L / 2 + .7, 1.85], foot = [mx + .3, 1.9];
          c.strokeStyle = rgb(fig([86, 60, 38], zr)); c.lineWidth = .14; c.beginPath(); c.moveTo(mx, 1.2); c.lineTo(mx, 8.6); c.stroke();
          const sw = Math.sin(t * .7 + o.ph) * .08;
          c.beginPath(); c.moveTo(yA[0], yA[1]); c.quadraticCurveTo((yA[0] + yB[0]) / 2 - .4, (yA[1] + yB[1]) / 2 + .3, yB[0], yB[1]); c.quadraticCurveTo(foot[0] + 2.2 + sw, 5.2, foot[0], foot[1]); c.quadraticCurveTo((foot[0] + tack[0]) / 2, 2.4 + sw, tack[0], tack[1]); c.closePath();
          const sg = c.createLinearGradient(yA[0], 2, foot[0] + 2, 9); sg.addColorStop(0, rgb(lerp(fig(o.sail, zr), [255, 248, 230], .25))); sg.addColorStop(.6, rgb(fig(o.sail, zr))); sg.addColorStop(1, rgb(lerp(fig(o.sail, zr), [120, 100, 80], .25)));
          c.fillStyle = sg; c.fill();
          c.strokeStyle = rgb(fig(o.sail.map((v) => v * .7), zr), .5); c.lineWidth = .04; for (let k = 1; k < 5; k++) { const u = k / 5; c.beginPath(); c.moveTo(mix(yA[0], yB[0], u), mix(yA[1], yB[1], u)); c.lineTo(mix(tack[0], foot[0], u), mix(tack[1], foot[1], u) + .2); c.stroke(); }
          c.strokeStyle = rgb(fig([96, 70, 44], zr)); c.lineWidth = .1; c.beginPath(); c.moveTo(yA[0], yA[1]); c.lineTo(yB[0], yB[1]); c.stroke();
          c.lineWidth = .025; c.beginPath(); c.moveTo(mx, 8.6); c.lineTo(L / 2 - .2, 1.5); c.moveTo(mx, 8.4); c.lineTo(-L / 2 - .6, 1.7); c.stroke();
          c.restore();
          // the bow's white water
          c.save(); c.globalCompositeOperation = 'lighter'; const bw = P3(bx - L / 2 + .2, 0, bz); c.fillStyle = 'rgba(240,248,252,.45)'; c.beginPath(); c.ellipse(bw[0], bw[1] - bob * s * .3, 1.2 * s, .16 * s, 0, 0, TAU); c.fill(); c.restore();
        }]);
      };
      const crew1 = Array.from({ length: 14 }, (_, i) => [-4.1 + i * .62 + hash(i, 3) * .12, CLOTH[i % 8], HEAD[(i * 5) % 6], i === 1 ? .22 : 0]); // Ja'far stands near the bow (the count is art)
      boat(mix(26, -20, smooth(seg(p, .132, .27))), 42, 11, { hull: [150, 104, 64], sail: [232, 220, 192], crew: crew1, ph: 0 });
      const crew2 = [[-2.6, [150, 66, 50], [160, 134, 100], .3], [-1.7, [118, 92, 70], [150, 124, 92], .3], [3.4, [96, 86, 74], [122, 106, 86], 0]]; // 'Amr, 'Umara, a sailor
      boat(mix(44, 2, smooth(seg(p, .19, .282))), 30, 9, { hull: [120, 80, 52], sail: [182, 104, 70], crew: crew2, chests: [[-.2, .9, .55], [.85, .7, .45], [1.7, .8, .5]], ph: 2.1 });
      draw();
    } else if (act === 2) {
      // ======================= C: the hall of the Negus =======================
      const zn = camZ + .7, LAMP = [255, 214, 160];
      const rec = bump(p, .566, .59, .624, .66), recLo = .35 * bump(p, .58, .62, .735, .76); // the light of the recitation
      const glowK = rec + recLo;
      const amb2 = amb.map((v, j) => v * (1 + .14 * glowK) + LAMP[j] * .05 * glowK);
      const wl = (base, k = .7) => base.map((v, j) => Math.min(255, v / 255 * amb2[j] * k * 1.08));
      // the ceiling and its beams
      { quad([[HX0, HHT, zn], [HX1, HHT, zn], [HX1, HHT, HZ1], [HX0, HHT, HZ1]], rgb(wl([176, 136, 96], .66)));
        c.strokeStyle = rgb(wl([110, 76, 48], .66)); for (let z = 2; z < HZ1; z += 3.4) { if (z - camZ < 1) continue; const a = P3(HX0, HHT, z), b = P3(HX1, HHT, z); c.lineWidth = Math.max(1, .32 * F / (z - camZ)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
      // the back wall: plaster, a painted frieze and dado, the arched windows full of the day outside
      { const g = c.createLinearGradient(0, PY(HHT, HZ1), 0, PY(0, HZ1)); g.addColorStop(0, rgb(wl([206, 182, 146], .62))); g.addColorStop(.7, rgb(wl([232, 212, 178], .82))); g.addColorStop(1, rgb(wl([214, 190, 152], .72)));
        quad([[HX0, 0, HZ1], [HX1, 0, HZ1], [HX1, HHT, HZ1], [HX0, HHT, HZ1]], g);
        quad([[HX0, 7.7, HZ1 - .01], [HX1, 7.7, HZ1 - .01], [HX1, 8.25, HZ1 - .01], [HX0, 8.25, HZ1 - .01]], rgb(wl([150, 62, 44], .8)));
        const zr = HZ1 - camZ, s = F / zr; c.fillStyle = rgb(wl([214, 172, 84], .9));
        for (let x = HX0 + .3; x < HX1; x += .9) { const q = P3(x, 7.98, HZ1 - .02); c.save(); c.translate(q[0], q[1]); c.rotate(Math.PI / 4); c.fillRect(-.12 * s, -.12 * s, .24 * s, .24 * s); c.restore(); }
        quad([[HX0, 0, HZ1 - .01], [HX1, 0, HZ1 - .01], [HX1, 1.25, HZ1 - .01], [HX0, 1.25, HZ1 - .01]], rgb(wl([120, 70, 50], .7)));
        WINS.forEach((wx, i) => {
          const a = P3(wx - 1.1, WY[0], HZ1), b = P3(wx + 1.1, WY[1] - 1.1, HZ1), r = (b[0] - a[0]) / 2, top = b[1];
          const path = () => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0], top); c.arc(a[0] + r, top, r, Math.PI, TAU); c.lineTo(b[0], a[1]); c.closePath(); };
          c.save(); path(); c.clip();
          const sg = c.createLinearGradient(0, top - r, 0, a[1]); sg.addColorStop(0, 'rgb(150,196,240)'); sg.addColorStop(.62, 'rgb(236,240,236)'); sg.addColorStop(1, 'rgb(250,238,214)'); c.fillStyle = sg; c.fillRect(a[0], top - r, 2 * r, a[1] - top + r);
          c.fillStyle = 'rgba(118,150,108,.75)'; c.beginPath(); c.moveTo(a[0], a[1]); for (let k = 0; k <= 8; k++) c.lineTo(a[0] + 2 * r * k / 8, a[1] - r * (.32 + .2 * Math.sin(k * 1.3 + i * 2.1))); c.lineTo(b[0], a[1]); c.fill();
          if (i === 3) { c.fillStyle = 'rgba(132,128,124,.8)'; c.fillRect(a[0] + r * .8, a[1] - r * 1.5, r * .22, r * 1.5); c.beginPath(); c.arc(a[0] + r * .91, a[1] - r * 1.5, r * .11, Math.PI, TAU); c.fill(); } // a stela on the hill (art)
          c.restore();
          c.save(); c.globalCompositeOperation = 'lighter'; const bl = c.createRadialGradient(a[0] + r, (a[1] + top) / 2, 0, a[0] + r, (a[1] + top) / 2, r * 3.4); bl.addColorStop(0, 'rgba(255,236,200,.34)'); bl.addColorStop(1, 'rgba(255,236,200,0)'); c.fillStyle = bl; c.fillRect(a[0] - r * 3, top - r * 4, r * 8, r * 8); c.restore();
          c.strokeStyle = rgb(wl([150, 120, 86], .8)); c.lineWidth = Math.max(1, .14 * s); path(); c.stroke();
        }); }
      // the side walls: a hanging behind the throne on the left; the doorway on the right
      { if (camX > HX0) { const g = c.createLinearGradient(PX(HX0, zn), 0, PX(HX0, HZ1), 0); g.addColorStop(0, rgb(wl([170, 146, 112], .5))); g.addColorStop(1, rgb(wl([214, 190, 154], .66))); quad([[HX0, 0, zn], [HX0, 0, HZ1], [HX0, HHT, HZ1], [HX0, HHT, zn]], g);
          quad([[HX0 + .02, 1.4, 11.2], [HX0 + .02, 1.4, 19.8], [HX0 + .02, 7.4, 19.8], [HX0 + .02, 7.4, 11.2]], rgb(wl([150, 44, 38], .75)));
          for (let k = 0; k < 6; k++) quad([[HX0 + .03, 1.4, 11.6 + k * 1.4], [HX0 + .03, 1.4, 12.0 + k * 1.4], [HX0 + .03, 7.4, 12.0 + k * 1.4], [HX0 + .03, 7.4, 11.6 + k * 1.4]], rgb(wl([214, 172, 84], .8), .55)); }
        if (camX < HX1) { const g = c.createLinearGradient(PX(HX1, zn), 0, PX(HX1, HZ1), 0); g.addColorStop(0, rgb(wl([170, 146, 112], .5))); g.addColorStop(1, rgb(wl([214, 190, 154], .66))); quad([[HX1, 0, zn], [HX1, 0, HZ1], [HX1, HHT, HZ1], [HX1, HHT, zn]], g);
          const dg = c.createLinearGradient(PX(HX1, DOOR[0]), 0, PX(HX1, DOOR[1]), 0); dg.addColorStop(0, 'rgb(250,236,206)'); dg.addColorStop(1, 'rgb(236,214,176)'); quad([[HX1, 0, DOOR[0]], [HX1, 0, DOOR[1]], [HX1, 4.2, DOOR[1]], [HX1, 4.2, DOOR[0]]], dg); } }
      // the floor: stone flags, the polished shine of the windows on it, the great rug before the dais
      { const g = c.createLinearGradient(0, H, 0, PY(0, HZ1)); g.addColorStop(0, rgb(wl([170, 144, 110], .66))); g.addColorStop(1, rgb(wl([206, 180, 140], .8)));
        quad([[HX0, 0, zn], [HX1, 0, zn], [HX1, 0, HZ1], [HX0, 0, HZ1]], g);
        c.strokeStyle = rgb(wl([110, 88, 64], .6), .45); c.lineWidth = 1; c.beginPath();
        for (let z = 0; z <= HZ1; z += 2) { if (z - camZ < .8) continue; const a = P3(HX0, 0, z), b = P3(HX1, 0, z); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
        for (let x = HX0; x <= HX1; x += 2.5) { const a = P3(x, 0, Math.max(zn, 0)), b = P3(x, 0, HZ1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
        c.stroke();
        c.save(); c.globalCompositeOperation = 'lighter';
        WINS.forEach((wx) => { const a = P3(wx, 0, HZ1), b = P3(wx, 0, Math.max(zn + 1, 8)); const gg = c.createLinearGradient(0, a[1], 0, b[1]); gg.addColorStop(0, 'rgba(255,236,200,.22)'); gg.addColorStop(1, 'rgba(255,236,200,0)'); const w0 = 1.0 * F / (HZ1 - camZ), w1 = 1.0 * F / (Math.max(zn + 1, 8) - camZ); c.fillStyle = gg; c.beginPath(); c.moveTo(a[0] - w0, a[1]); c.lineTo(a[0] + w0, a[1]); c.lineTo(b[0] + w1, b[1]); c.lineTo(b[0] - w1, b[1]); c.closePath(); c.fill(); });
        c.restore();
        const RG = [-5.0, 6.0, 11.0, 20.0];
        gq([[RG[0], RG[2]], [RG[1], RG[2]], [RG[1], RG[3]], [RG[0], RG[3]]], rgb(wl([60, 54, 96], .9)), .01);
        gq([[RG[0] + .45, RG[2] + .45], [RG[1] - .45, RG[2] + .45], [RG[1] - .45, RG[3] - .45], [RG[0] + .45, RG[3] - .45]], rgb(wl([150, 46, 40], .92)), .012);
        c.fillStyle = rgb(wl([214, 172, 84], .95), .8);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = mix(RG[0] + 1.6, RG[1] - 1.6, i / 3), z = mix(RG[2] + 1.8, RG[3] - 1.8, j / 2), q = [P3(x - .5, .014, z), P3(x, .014, z - .7), P3(x + .5, .014, z), P3(x, .014, z + .7)]; c.beginPath(); q.forEach((v, n) => (n ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); }
        // the patches of sun on the floor under the windows
        c.save(); c.globalCompositeOperation = 'lighter';
        const kx = -sun[0] / sun[1], kz = -sun[2] / sun[1];
        WINS.forEach((wx) => { const f = (x, y) => [x + kx * y, HZ1 + kz * y]; const pts = [f(wx - 1.1, WY[0]), f(wx + 1.1, WY[0]), f(wx + 1.1, WY[1]), f(wx - 1.1, WY[1])]; gq(pts, `rgba(255,226,170,${.2 + .1 * glowK})`, .016); });
        c.restore(); }
      // ----- items in depth: columns, the dais and throne, the canopy, the gifts, the people -----
      COLS.forEach((x) => {
        const zr = CZ - camZ; if (zr < 1) return;
        items.push([zr, () => {
          const s = F / zr, X = PX(x, CZ), Yb = PY(0, CZ), Yt = PY(8.2, CZ), r = .55 * s;
          const g = c.createLinearGradient(X - r, 0, X + r, 0); const cA = wl([196, 170, 132], .55), cB = wl([236, 214, 180], .85);
          g.addColorStop(0, rgb(cA)); g.addColorStop(.35, rgb(cB)); g.addColorStop(.7, rgb(lerp(cA, cB, .4))); g.addColorStop(1, rgb(cA.map((v) => v * .8)));
          c.fillStyle = g; c.fillRect(X - r, Yt, 2 * r, Yb - Yt);
          c.fillStyle = rgb(wl([214, 190, 150], .78)); c.fillRect(X - r * 1.5, Yt - .5 * s, r * 3, .5 * s); c.fillRect(X - r * 1.35, Yb - .45 * s, r * 2.7, .45 * s);
          c.fillStyle = rgb(wl([214, 172, 84], .9)); c.fillRect(X - r * 1.5, Yt - .14 * s, r * 3, .08 * s);
          c.strokeStyle = 'rgba(255,230,180,.35)'; c.lineWidth = Math.max(1, .05 * s); c.beginPath(); c.moveTo(X + r * .96, Yt); c.lineTo(X + r * .96, Yb - .45 * s); c.stroke();
        }]);
      });
      // the dais: three steps up from the floor toward the throne
      slab(DAIS[0], DAIS[1] + 1.0, DAIS[2] - .6, DAIS[3] + .6, .3, [196, 170, 132], undefined, 0, .62);
      slab(DAIS[0], DAIS[1] + .5, DAIS[2] - .3, DAIS[3] + .3, .3, [204, 178, 140], undefined, .3, .64);
      slab(DAIS[0], DAIS[1], DAIS[2], DAIS[3], .3, [212, 186, 148], undefined, .6, .66);
      { const zr = (DAIS[2] + DAIS[3]) / 2 - camZ + (DAIS[3] - DAIS[2]) * .5 - .25; items.push([zr, () => { gq([[DAIS[0] + .3, DAIS[2] + .5], [DAIS[1] - .3, DAIS[2] + .5], [DAIS[1] - .3, DAIS[3] - .5], [DAIS[0] + .3, DAIS[3] - .5]], rgb(wl([214, 172, 84], .95)), DY + .004); gq([[DAIS[0] + .45, DAIS[2] + .65], [DAIS[1] - .45, DAIS[2] + .65], [DAIS[1] - .45, DAIS[3] - .65], [DAIS[0] + .45, DAIS[3] - .65]], rgb(wl([56, 50, 92], .9)), DY + .006); gq([[DAIS[0] + .7, DAIS[2] + .95], [DAIS[1] - .7, DAIS[2] + .95], [DAIS[1] - .7, DAIS[3] - .95], [DAIS[0] + .7, DAIS[3] - .95]], rgb(wl([146, 42, 38], .92)), DY + .008); }]); }
      // the canopy over the throne: four posts, a roof of red cloth with a gold fringe
      { const P0 = [-11.3, -6.4], Z0 = [13.4, 18.8], top = 5.6;
        const post = (x, z) => { const zr = z - camZ; if (zr < 1) return; items.push([zr - .05, () => { const s = F / zr, a = P3(x, DY, z), b = P3(x, top, z); c.fillStyle = rgb(wl([150, 112, 60], .8)); c.fillRect(a[0] - .09 * s, b[1], .18 * s, a[1] - b[1]); c.fillStyle = rgb(wl([214, 172, 84], .95)); c.fillRect(a[0] - .14 * s, b[1] - .1 * s, .28 * s, .14 * s); }]); };
        post(P0[0], Z0[1]); post(P0[1], Z0[1]);
        const zr = Z0[0] - camZ; if (zr > 1) items.push([zr - .3, () => {
          const s = F / zr;
          quad([[P0[0], top, Z0[0]], [P0[1], top, Z0[0]], [P0[1], top, Z0[1]], [P0[0], top, Z0[1]]], rgb(wl([118, 34, 30], .7)));
          quad([[P0[0], top - .8, Z0[0]], [P0[1], top - .8, Z0[0]], [P0[1], top + .02, Z0[0]], [P0[0], top + .02, Z0[0]]], rgb(wl([164, 48, 40], .9)));
          c.fillStyle = rgb(wl([224, 182, 92], 1)); for (let k = 0; k <= 22; k++) { const q = P3(mix(P0[0], P0[1], k / 22), top - .8, Z0[0]); c.beginPath(); c.arc(q[0], q[1], .09 * s, 0, Math.PI); c.fill(); }
          quad([[P0[0], top - .78, Z0[0] - .01], [P0[1], top - .78, Z0[0] - .01], [P0[1], top - .7, Z0[0] - .01], [P0[0], top - .7, Z0[0] - .01]], rgb(wl([224, 182, 92], 1)));
        }]); }
      // the throne: a high back of carved wood with gold, the seat, arms and feet (side view, facing the hall)
      { const zr = THR[1] - camZ + .25; if (zr > 1) items.push([zr, () => {
        const s = F / zr, B = (x, y) => P3(THR[0] + x, DY + y, THR[1] + .25);
        const wood = rgb(wl([110, 70, 40], .9)), gold = rgb(wl([224, 182, 92], 1.05));
        const pth = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => { const q = B(x, y); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); };
        const back = [[-.62, 0], [-.62, 2.3]]; for (let k = 0; k <= 10; k++) { const a = Math.PI - k / 10 * Math.PI; back.push([-.44 + Math.cos(a) * .18, 2.3 + Math.sin(a) * .5]); } back.push([-.26, 2.3], [-.26, .9], [.55, .9], [.55, .55], [-.26, .55], [-.26, 0]);
        pth(back); c.fillStyle = wood; c.fill(); c.strokeStyle = gold; c.lineWidth = Math.max(1, .05 * s); c.stroke();
        const bo = B(-.44, 2.25); c.fillStyle = gold; c.beginPath(); c.arc(bo[0], bo[1], .13 * s, 0, TAU); c.fill(); const fi = B(-.44, 2.86); c.beginPath(); c.arc(fi[0], fi[1], .08 * s, 0, TAU); c.fill();
        pth([[-.25, .9], [.48, .9], [.48, 1.18], [.4, 1.2], [.38, 1.0], [-.25, 1.0]]); c.fillStyle = wood; c.fill(); c.stroke();
        pth([[.4, 0], [.5, 0], [.5, .55], [.4, .55]]); c.fillStyle = wood; c.fill();
        const cu = B(.15, .58); c.fillStyle = rgb(wl([150, 46, 40], .9)); c.beginPath(); c.ellipse(cu[0], cu[1], .4 * s, .09 * s, 0, 0, TAU); c.fill();
      }]); }
      // the gifts: carried in, set down before the dais; they stay («فقبلها منهم»)
      const down = fade(p, .306, .312);
      if (down > 0) GIFT.forEach(([x, z, k]) => {
        const zr = z - camZ; if (zr < 1) return;
        items.push([zr, () => {
          const s = F / zr, q = P3(x, 0, z);
          c.save(); c.globalAlpha = down;
          if (k === 3) { c.fillStyle = rgb(wl([170, 118, 70], .9)); c.beginPath(); c.ellipse(q[0], q[1] - .32 * s, .26 * s, .34 * s, 0, 0, TAU); c.fill(); c.fillRect(q[0] - .1 * s, q[1] - .8 * s, .2 * s, .18 * s); }
          else if (k === 1) { c.fillStyle = rgb(wl([150, 112, 72], .9)); c.beginPath(); c.ellipse(q[0], q[1] - .24 * s, .6 * s, .24 * s, 0, 0, TAU); c.fill(); c.strokeStyle = rgb(wl([96, 66, 40], .9)); c.lineWidth = Math.max(1, .05 * s); c.beginPath(); c.moveTo(q[0] - .2 * s, q[1] - .48 * s); c.lineTo(q[0] - .2 * s, q[1]); c.moveTo(q[0] + .25 * s, q[1] - .48 * s); c.lineTo(q[0] + .25 * s, q[1]); c.stroke(); }
          else { const w = (k ? .7 : .85) * s, h = (k ? .45 : .55) * s; c.fillStyle = rgb(wl([118, 74, 44], .9)); c.fillRect(q[0] - w / 2, q[1] - h, w, h); c.fillStyle = rgb(wl([140, 92, 56], 1)); c.fillRect(q[0] - w / 2, q[1] - h - .1 * s, w, .12 * s); c.fillStyle = rgb(wl([224, 182, 92], 1.05)); c.fillRect(q[0] - w / 2, q[1] - h * .55, w, .06 * s); c.fillRect(q[0] - .05 * s, q[1] - h * .7, .1 * s, .14 * s); }
          c.restore();
        }]);
      });
      const rimK = .2, figs = (x, z, o) => items.push([z - camZ, () => person(x, z, { rim: rimK, ...o })]);
      // the courtiers and the guards
      st.court.forEach((m, i) => figs(m.x, m.z, { dir: m.dir, cl: m.cl, hd: m.hd, sc: 1 + i * .01, arms: i === 4 ? [[.36, .9]] : undefined }));
      [[-10.9, 12.6], [-10.9, 18.6]].forEach(([x, z], i) => figs(x, z, { dir: 1, cl: [70, 52, 44], hd: [118, 92, 64], spear: true, arms: [[.38, 1.08]], sc: 1.04 + i * .01, y0: DY }));
      // the Negus: seated; asks; weeps (head down, a hand to his face); rises and strikes; sits again
      let ngHead = null;
      { const stand = bump(p, .757, .764, .8, .812), nx = THR[0] + .3 + 2.95 * smooth(seg(p, .762, .768)) * (1 - smooth(seg(p, .79, .808)));
        const weep = bump(p, .636, .648, .74, .755), ask = bump(p, .552, .56, .574, .582), say = bump(p, .51, .516, .53, .536), lean = .32 * weep + .05 * say;
        const tremble = weep * Math.sin(t * 7.3) * .008;
        let arms;
        if (weep > .02) arms = [lerp([.18, .5], [.27, 1.02], weep), lerp([.12, .5], [.2, .97], weep)];
        if (ask > .02) arms = [lerp([.18, .5], [.62, .72], ask)];
        if (say > .02) arms = [lerp([.18, .5], [.44, .98], say)];
        const blow = seg(p, .764, .774), strike = bump(p, .764, .768, .776, .786);
        const sArms = [lerp(lerp([.2, .9], [.32, 2.25], c01(blow * 2)), [.8, 1.3], c01(blow * 2 - 1))];
        const base = { cl: [150, 44, 38], hd: [132, 94, 54], cap: true, trim: true, dir: 1, y0: DY, sc: 1.06, rim: rimK };
        items.push([THR[1] - camZ - .05, () => {
          if (stand < 1) person(THR[0] + .3, THR[1], { ...base, shape: CHAIR, y0: DY + .02, lean: lean + tremble, sq: 1 - .05 * weep, arms, cuff: true, alpha: 1 - stand });
          if (stand > 0) person(nx, THR[1] - .1, { ...base, arms: strike > .02 ? sArms : [[.3, .95]], lean: .05 * strike, alpha: stand });
          label(THR[0] + .3, THR[1], 'النجاشي', bump(p, .29, .3, .345, .36), 0, DY);
        }]);
        ngHead = P3(THR[0] + .35 + .16 * weep, DY + 1.1, THR[1]);
      }
      // 'Amr and 'Umara, with two men carrying the gifts
      { const A = [[.284, 18.6, 14.4], [.3, -2.6, 14.8], [.358, -2.6, 14.8], [.372, .9, 13.9], [.744, .9, 13.9], [.758, -4.3, 14.4], [.772, -4.3, 14.4], [.786, -2.7, 13.6], [.806, -2.7, 13.6], [.846, 18.6, 12.4]];
        const U = [[.288, 18.6, 13.4], [.304, -1.4, 14.0], [.36, -1.4, 14.0], [.374, 2.0, 13.2], [.808, 2.0, 13.2], [.846, 18.6, 11.8]];
        const P1 = [[.282, 18.6, 16.4], [.302, -3.3, 16.6], [.312, -3.3, 16.6], [.324, 3.4, 12.6], [.81, 3.4, 12.6], [.846, 18.6, 12.8]];
        const P2 = [[.286, 18.6, 18.0], [.304, -3.2, 18.2], [.312, -3.2, 18.2], [.326, 4.2, 13.2], [.812, 4.2, 13.2], [.846, 18.6, 13.4]];
        const speak = bump(p, .322, .33, .34, .348), answer = bump(p, .438, .444, .452, .458), demand = bump(p, .75, .756, .762, .766);
        const hit = bump(p, .772, .775, .79, .8), cower = .6 * bump(p, .776, .79, .806, .812);
        const ta = track(A, p), tu = track(U, p), t1 = track(P1, p), t2 = track(P2, p);
        const alphaIn = fade(p, .283, .29);
        [[ta, 'A'], [tu, 'U'], [t1, 'P1'], [t2, 'P2']].forEach(([tr, who], i) => {
          const ph = p * 220 + i * 2.1, w = walkO(tr, ph);
          let dir = tr.walk ? (tr.dir || -1) : -1, arms, lean = w.lean, load = null;
          if (who === 'A') { if (speak > .02) arms = [lerp([.14, .44], [.64, 1.12], speak)]; if (answer > .02) arms = [lerp([.14, .44], [.4, .8], answer)]; if (demand > .02) arms = [lerp([.14, .44], [.66, 1.1], demand)]; if (hit > .02) { arms = [lerp([.14, .44], [.12, 1.62], hit)]; lean -= .16 * hit; } if (cower > .02) lean -= .06 * cower; }
          if ((who === 'P1' || who === 'P2') && p < .309) load = who === 'P1' ? [118, 74, 44] : [150, 112, 72];
          const cl = who === 'A' ? [150, 66, 50] : who === 'U' ? [118, 92, 70] : [96, 86, 74], hd = who === 'A' ? [160, 134, 100] : who === 'U' ? [150, 124, 92] : [122, 106, 86];
          figs(tr.x, tr.z, { dir, cl, hd, arms, lean, bob: w.bob, load, alpha: alphaIn * (1 - fade(p, .842, .85)), sc: who === 'A' ? 1.04 : 1 });
          if (who === 'A') items.push([tr.z - camZ - .02, () => label(tr.x, tr.z, 'عمرو بن العاص', bump(p, .298, .306, .346, .358) + bump(p, .752, .758, .79, .8))]);
          if (who === 'U') items.push([tr.z - camZ - .02, () => label(tr.x, tr.z, 'عمارة بن الوليد', bump(p, .302, .31, .346, .358), 22)]);
        });
      }
      // Ja'far, brought in with the emigrants: before the dais he asks, answers, recites
      let jHead = null;
      { const J = [[.354, 18.6, 15.6], [.38, .4, 15.6], [.414, .4, 15.6], [.428, -2.8, 15.2]];
        const tr = track(J, p), ph = p * 220, w = walkO(tr, ph), alpha = fade(p, .352, .36);
        const ask = bump(p, .418, .426, .44, .448), ask2 = bump(p, .45, .456, .462, .468), ans = bump(p, .478, .49, .52, .53), recite = bump(p, .566, .576, .624, .634);
        let arms;
        if (ask > .02) arms = [lerp([.14, .44], [.56, .92], ask)];
        if (ask2 > .02) arms = [lerp([.14, .44], [.5, .8], ask2)];
        if (ans > .02) arms = [lerp([.14, .44], [.62, 1.28], ans)];
        if (recite > .02) arms = [lerp([.14, .44], [.34, .74], recite), lerp([.1, .44], [.28, .7], recite)];
        figs(tr.x, tr.z, { dir: tr.walk ? -1 : -1, cl: [156, 112, 60], hd: [132, 104, 70], arms, lean: w.lean + .03 * recite, bob: w.bob, alpha, sc: 1.04 });
        items.push([tr.z - camZ - .02, () => label(tr.x, tr.z, 'جعفر بن أبي طالب', bump(p, .372, .38, .41, .422))]);
        jHead = P3(tr.x, 1.66, tr.z);
        st.emC.forEach((m, i) => { const tm = track([[.356 + m.d, 18.6, m.z], [.384 + m.d, m.x, m.z]], p), wm = walkO(tm, ph + i); figs(tm.x, tm.z, { dir: -1, cl: m.cl, hd: m.hd, lean: wm.lean, bob: wm.bob, alpha: fade(p, .354 + m.d, .362 + m.d), sc: .97 + i * .01 }); });
        // the attendant who brings them in, and goes back to his place
        const ta = track([[.35, 18.6, 16.2], [.376, -.6, 16.2], [.392, -.6, 16.2], [.41, -8.6, 21.0]], p);
        if (p < .41) figs(ta.x, ta.z, { dir: ta.dir || -1, cl: [60, 56, 70], hd: [98, 80, 60], ...walkO(ta, ph + 4), alpha: fade(p, .35, .356) * (1 - fade(p, .404, .41)) });
      }
      draw();
      // ----- the shafts of light from the windows, and the dust turning in them -----
      { c.save(); c.globalCompositeOperation = 'lighter';
        const kx = -sun[0] / sun[1], kz = -sun[2] / sun[1];
        WINS.forEach((wx) => {
          const A0 = P3(wx - 1.1, WY[1], HZ1), A1 = P3(wx + 1.1, WY[1], HZ1), fl = (x, y) => P3(x + kx * y, 0, HZ1 + kz * y), B0 = fl(wx - 1.1, WY[1]), B1 = fl(wx + 1.1, WY[1]), C0 = fl(wx - 1.1, WY[0]), C1 = fl(wx + 1.1, WY[0]);
          const g = c.createLinearGradient(A0[0], A0[1], B0[0], B0[1]); g.addColorStop(0, `rgba(255,232,186,${.16 + .08 * glowK})`); g.addColorStop(1, 'rgba(255,232,186,.02)');
          c.fillStyle = g; c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(A1[0], A1[1]); c.lineTo(B1[0], B1[1]); c.lineTo(C1[0], C1[1]); c.lineTo(C0[0], C0[1]); c.lineTo(B0[0], B0[1]); c.closePath(); c.fill();
        });
        st.mote.forEach(([u, v, w, k], i) => {
          const wx = WINS[i % WINS.length], y = (v * WY[1] + t * (.05 + .05 * k)) % WY[1], x = wx - 1.1 + 2.2 * u + kx * y + Math.sin(t * .3 + i) * .2, z = HZ1 + kz * y;
          const zr = z - camZ; if (zr < 1) return; const q = P3(x, y, z), s = F / zr;
          c.fillStyle = `rgba(255,236,200,${.4 * (.5 + .5 * Math.sin(t * 1.3 + i * 2.7))})`; c.beginPath(); c.arc(q[0], q[1], Math.max(.6, .025 * s * (.6 + w)), 0, TAU); c.fill();
        });
        c.restore(); }
      // ----- the recitation: light rises from him and fills the hall -----
      if (glowK > 0 && jHead) {
        const [X, Y] = jHead, R0 = F * .5;
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(X, Y, 0, X, Y, R0); g.addColorStop(0, `rgba(255,222,150,${.5 * glowK})`); g.addColorStop(.25, `rgba(255,208,130,${.2 * glowK})`); g.addColorStop(1, 'rgba(255,208,130,0)');
        c.fillStyle = g; c.fillRect(X - R0, Y - R0, 2 * R0, 2 * R0);
        for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .2 + Math.sin(t * .4 + k) * .02, L = R0 * (.7 + .3 * hash(k, 7)); const gg = c.createLinearGradient(X, Y, X + Math.cos(a) * L, Y + Math.sin(a) * L); gg.addColorStop(0, `rgba(255,230,170,${.3 * rec})`); gg.addColorStop(1, 'rgba(255,230,170,0)'); c.strokeStyle = gg; c.lineWidth = F * .006; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L); c.stroke(); }
        for (let k = 0; k < 40; k++) { const u = hash(k, 1), sp = (u * .6 + t * .04 + hash(k, 2)) % 1, x = X + (hash(k, 3) - .5) * F * .3 * (1 + sp), y = Y - sp * F * .45; c.fillStyle = `rgba(255,232,170,${.6 * glowK * (1 - sp)})`; c.beginPath(); c.arc(x, y, F * .003, 0, TAU); c.fill(); }
        c.restore();
        c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,200,120,${.22 * glowK})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
      }
    } else {
      // ======================= D: before Khaybar =======================
      sky();
      land(hD, (x, z, h, zr, lam, skyL) => { const g = c01(.5 + .5 * Math.sin(x * .05 + 2) * Math.sin(z * .04)) * (1 - smooth(c01((z - 300) / 400))); return lit(lerp(rockSand(x, z, h, 12), [168, 160, 112], .22 * g), lam, skyL); });
      // the fortress on its hill: dark stone, its walls and towers
      FORT.forEach(([x0, x1, z0, z1, h]) => { const y0 = hD((x0 + x1) / 2, z0) - 1; slab(x0, x1, z0, z1, h, [118, 104, 96], undefined, y0, .7);
        if (z0 - camZ > 2) items.push([z0 - camZ - .1, () => { const zr = z0 - camZ, col = rgb(wall([118, 104, 96], Math.max(0, -sun[2]), zr, .7)); c.fillStyle = col; for (let x = x0; x < x1 - .4; x += 1.6) { const a = P3(x, y0 + h, z0), b = P3(x + .9, y0 + h + 1.1, z0); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); } }]); });
      // low scrub on the sand
      st.scrub.forEach(([x, z, r, k]) => {
        const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -30 || X > W + 30) return;
        items.push([zr, () => {
          const s = F / zr, Y = PY(hD(x, z), z), col = lerp(lit([104, 110, 66], .75, 1), haze, fogA(zr) * .8);
          c.fillStyle = rgb(shCol, .22); c.beginPath(); c.ellipse(X + r * s * .4, Y, r * s * 1.1, r * s * .18, 0, 0, TAU); c.fill();
          for (let j = 0; j < 5; j++) { c.fillStyle = rgb(j < 2 ? col.map((v) => v * .8) : col); c.beginPath(); c.ellipse(X + (hash(j, k) - .5) * r * s * 1.4, Y - r * s * (.3 + .3 * hash(k, j)), r * s * (.45 + .2 * hash(j, 2)), r * s * .35, 0, 0, TAU); c.fill(); }
        }]);
      });
      // palms
      st.palms.forEach(([x, z, ht, ph, lean]) => {
        const zr = z - camZ; if (zr < 2) return; const s = F / zr, bx = PX(x, z), by0 = PY(hD(x, z), z); if (bx < -ht * s || bx > W + ht * s) return;
        items.push([zr, () => {
          const fz = fogA(zr) * .85, trunk = lerp(lit([96, 72, 52], .6, 1), haze, fz), frond = lerp(lit([70, 96, 52], .5, 1), haze, fz * .9), lt = lerp(lit([150, 168, 90], .9, 1), haze, fz * .8);
          const tx = bx + lean * ht * s, ty = by0 - ht * s;
          c.strokeStyle = rgb(trunk); c.lineWidth = Math.max(.8, .38 * s); c.beginPath(); c.moveTo(bx, by0); c.quadraticCurveTo(bx + lean * ht * s * .2, by0 - ht * s * .6, tx, ty); c.stroke();
          const n = 15, L = 3.3 * s;
          for (let j = 0; j < n; j++) {
            const a = j / n * TAU + ph, cs = Math.cos(a), sn = Math.sin(a), dn = .15 + .7 * (.5 + .5 * sn), sway = Math.sin(t * .8 + j) * s * .05, len = L * (.8 + .35 * hash(j, ph));
            const mx2 = tx + cs * len * .55, my2 = ty - len * (.42 - .25 * dn), ex2 = tx + cs * len * 1.05, ey2 = ty + len * (dn * 1.0 - .1) + sway;
            const col = cs * sunSide > .2 ? lerp(frond, lt, .55) : sn < -.2 ? lerp(frond, [30, 40, 26], .25) : frond;
            c.strokeStyle = rgb(col); c.lineWidth = Math.max(.6, .1 * s); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx2, my2, ex2, ey2); c.stroke();
            if (s > 3) { c.lineWidth = Math.max(.5, .045 * s); c.beginPath(); for (let k = 1; k <= 8; k++) { const u = k / 9, bx2 = (1 - u) ** 2 * tx + 2 * (1 - u) * u * mx2 + u * u * ex2, by2 = (1 - u) ** 2 * ty + 2 * (1 - u) * u * my2 + u * u * ey2, ll = len * .22 * (1 - u * .6); c.moveTo(bx2, by2); c.lineTo(bx2 + cs * ll * .3 - sn * ll * .2, by2 + ll * .75); c.moveTo(bx2, by2); c.lineTo(bx2 + cs * ll * .3 + sn * ll * .2, by2 + ll * .55); } c.stroke(); }
          }
          c.fillStyle = rgb(lerp(trunk, [60, 40, 24], .3)); c.beginPath(); c.ellipse(tx, ty + .15 * s, .3 * s, .22 * s, 0, 0, TAU); c.fill();
        }]);
      });
      // the shade where he sits: four poles and a roof of fronds
      { const X0 = -9.8, X1 = -4.4, Z0 = 17.2, Z1 = 21.2, Hh = 2.5, zr = Z0 - camZ;
        shadow(-7.1, 19.2, 2.4, 2.6, .3);
        if (zr > 1) items.push([zr + 4.2, () => { [[X0, Z1], [X1, Z1]].forEach(([x, z]) => { const a = P3(x, 0, z), b = P3(x, Hh, z); c.strokeStyle = rgb(wall([110, 80, 50], .5, zr, .7)); c.lineWidth = Math.max(1.2, .12 * F / (z - camZ)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); }]);
        if (zr > 1) items.push([zr - .5, () => {
          const s = F / zr; [[X0, Z0], [X1, Z0]].forEach(([x, z]) => { const a = P3(x, 0, z), b = P3(x, Hh, z); c.strokeStyle = rgb(wall([110, 80, 50], .5, zr, .7)); c.lineWidth = Math.max(1.2, .12 * s); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); });
          const r = [P3(X0 - .3, Hh, Z0 - .3), P3(X1 + .3, Hh, Z0 - .3), P3(X1 + .3, Hh + .2, Z1 + .3), P3(X0 - .3, Hh + .2, Z1 + .3)], under = camY < Hh, rc = under ? wall([120, 96, 60], .2, zr, .62) : wall([196, 168, 112], Math.max(0, sun[1]), zr, .78);
          c.fillStyle = rgb(rc); c.beginPath(); r.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill();
          c.strokeStyle = rgb(wall([150, 120, 70], .5, zr, .7)); c.lineWidth = Math.max(1, .06 * s); c.beginPath();
          for (let k = 0; k <= 40; k++) { const u = k / 40, x = mix(r[0][0], r[1][0], u), y = mix(r[0][1], r[1][1], u); c.moveTo(x, y); c.lineTo(x + .03 * s * Math.sin(k * 2.3 + t * .7), y + (.16 + .08 * hash(k)) * s); } c.stroke();
        }]); }
      // his companions seated in the shade
      st.compD.forEach((m, i) => { shadow(m.x, m.z, .9, .7, .18); items.push([m.z - camZ, () => person(m.x, m.z, { shape: SEAT, dir: toward(m.x, PD[0]), cl: m.cl, hd: m.hd, sc: .98 + i * .02 })]); });
      // Ja'far and those with him come in from the road
      const jt = track([[.84, 30, 66], [.928, ...JD]], p);
      const meet = smooth(seg(p, .966, .978));
      { const ph = p * 200, w = walkO(jt, ph), jx = jt.x - .15 * meet;
        shadow(jx, jt.z, 1.8, .45, .24);
        items.push([jt.z - camZ + .02, () => { person(jx, jt.z, { dir: -1, cl: [156, 112, 60], hd: [132, 104, 70], ...w, arms: meet > .02 ? [lerp([.14, .44], [.42, 1.28], meet), lerp([.1, .44], [.36, 1.2], meet)] : undefined, sc: 1.03, lean: w.lean + .05 * meet }); label(jx, jt.z, 'جعفر بن أبي طالب', bump(p, .9, .91, .95, .962)); }]);
        st.emD.forEach((m, i) => { const tm = track([[.84 + m.d, 30 + m.dx, 66 + m.dz], [.93 + m.d, JD[0] + m.dx, JD[1] + m.dz]], p), wm = walkO(tm, ph + i * 1.7); shadow(tm.x, tm.z, 1.75, .45, .2); items.push([tm.z - camZ, () => person(tm.x, tm.z, { dir: -1, cl: m.cl, hd: m.hd, ...wm, bundle: m.kit === 'bundle', staff: m.kit === 'staff', sc: .96 + hash(i, 4) * .08 })]); }); }
      // the Prophet: seated in the shade; he rises and goes twelve steps to meet him, and takes him in his arms
      { const rise = fade(p, .928, .934), D = 12 * STEP, K = [[.934, ...PD], [.966, PD[0] + D, PD[1] + .05]], tr = track(K, p);
        // the twelve prints in the sand, each as his foot leaves it
        for (let k = 0; k < 12; k++) { const dk = (k + .6) * STEP; if (p < .934 || tr.d < dk) break; const x = PD[0] + dk - STEP * .35, z = PD[1] + .05 * (dk / D) + (k % 2 ? .13 : -.13), zr = z - camZ; if (zr < 1) continue;
          items.push([zr + .3, () => { const s = F / zr, q = P3(x, .01, z), fy = Math.max(1.2, .3 * s * camY / zr); c.fillStyle = 'rgba(120,84,52,.55)'; c.beginPath(); c.ellipse(q[0], q[1], .13 * s, fy, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,240,210,.45)'; c.beginPath(); c.ellipse(q[0] + .02 * s, q[1] - fy * .7, .12 * s, fy * .45, 0, Math.PI, TAU); c.fill(); }]); }
        const x = p < .934 ? PD[0] : tr.x, z = p < .934 ? PD[1] : tr.z;
        shadow(x, z, 1.8, .5, .24);
        const embrace = meet;
        items.push([z - camZ - .01, () => {
          if (rise < 1) holy(x, z, { pose: 'sit', amb: .92, glow: .16, alpha: 1 - rise });
          if (rise > 0) holy(x, z, tr.walk ? { pose: 'walk', phase: tr.d / (2 * STEP), amb: .92, glow: .16, alpha: rise } : { pose: 'stand', amb: .92, glow: .16 + .1 * embrace, alpha: rise, arms: embrace > .02 ? [lerp([.13, -.42], [.3, -.8], embrace), lerp([.1, -.42], [.24, -.66], embrace)] : undefined });
        }]); }
      draw();
    }
    // ----- grade: the edges close in a little; the dips to black between the worlds -----
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, `rgba(10,14,30,${act === 2 ? .42 : .28})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    const dip = Math.max(...DIPS.map((d) => bump(p, ...d)));
    if (dip > 0) { c.fillStyle = `rgba(6,8,14,${dip})`; c.fillRect(0, 0, W, H); }
  },
};
})();
