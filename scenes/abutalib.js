(() => {
// abutalib — «حماية أبي طالب»: Quraysh come to Abu Talib about his nephew, and he stands between them and him
// (Tafsir al-Qummi 2:228–229 and 1:379–380, I'lam al-Wara 1:107–108, al-Kafi 1:448–449). Mecca: the house of Abu
// Talib on the court of the House (sadaa's court and House), a walled yard open to the camera, its gate in the left
// wall, the rooms behind under a reed awning. A side view in metres (x right, y up, z away), a pinhole camera keyed on p:
//   p −.05 → .09  morning: the elders cross the court, come in at the gate and sit before Abu Talib (Qummi 2:228)
//      .095 → .15 their offer: bags of wealth set down on the mat (the count is art); he comes out of the house door
//      .155 → .21 close on him: his hands open, a sun over the one and a moon over the other, then they fade
//      .228 → .28 the elders lean in («نعم وعشر كلمات»)
//      .29 → .35  he steps toward them, a hand raised; they rise, throw up their hands, turn away
//      .35 → .405 Sad 4–5 as they go out across the court; he goes back in
//      .405 → .55 afternoon: they come back with Umara b. al-Walid (named under his feet) and stand; Abu Talib rises on
//                 his staff, his hand out; they go (I'lam 1:107–108)
//      .55 → .68  dusk at the gate: Abu Talib stands in it facing the court, where the assemblies sit by torches; the
//                 Prophet in the gateway behind him; men of his house come out with spears (Qummi 1:379–380)
//      .678 → .712 a dip to black: another day
//      .712 → .77 morning in the court by the House: the assembly laughs; he walks to Abu Talib by his gate (Kafi 1:449)
//      .775 → .83 Abu Talib rises with a sword; Hamza comes out of the gate, a bundle in his hand; the three cross to
//                 the assembly by the House, which shrinks back
//      .84 → .9   Hamza goes round the ring and each head goes down as he passes; Abu Talib turns to his nephew
//      .9 → 1.05  the assemblies rise and go; late light; clouds gather over the court (Abu Talib's verse, Kafi 1:449)
// The Prophet is drawn only by Holy.draw (veiled, the gold disc). Everyone else is a faceless cloaked shape with an
// earth-toned head cloth, so only his veil reads white at the head. Nothing is drawn on him. Everything follows from
// p; t moves only cloth, flames, the light's shimmer and the laughter.
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

// ---------- the House, hung with its cloths, and its Hijr (as in «الصدع بالدعوة») ----------
const KX = -1, KZ = 31, KHA = 6.2, KHB = 5, KTH = -1.98, TOP = 8.9;
const kc = Math.cos(KTH), ks = Math.sin(KTH);
const corner = (su, sv) => [KX + su * KHA * kc - sv * KHB * ks, KZ + su * KHA * ks + sv * KHB * kc];
const CO = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
const FC = CO.map((a, i) => {
  const b = CO[(i + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), mx = (a[0] + b[0]) / 2 - KX, mz = (a[1] + b[1]) / 2 - KZ;
  let n = [dz / L, -dx / L]; if (n[0] * mx + n[1] * mz < 0) n = [-n[0], -n[1]];
  return { a, b, L, n };
});
const KDOOR = [.2, .3, 2.1, 4.5];
const M1 = [(CO[1][0] + CO[2][0]) / 2, (CO[1][1] + CO[2][1]) / 2], T1 = [(CO[2][0] - CO[1][0]) / FC[1].L, (CO[2][1] - CO[1][1]) / FC[1].L], N1 = FC[1].n;
const HJA = 4.3, HJB = 7.2, HJH = 1.3, HJT = .85, NA = 34;
const arcPt = (th, off = 0) => {
  const ct = Math.cos(th), sn = Math.sin(th), nx = T1[0] * HJB * ct + N1[0] * HJA * sn, nz = T1[1] * HJB * ct + N1[1] * HJA * sn, nl = Math.hypot(nx, nz);
  return [M1[0] + T1[0] * HJA * ct + N1[0] * HJB * sn + nx / nl * off, M1[1] + T1[1] * HJA * ct + N1[1] * HJB * sn + nz / nl * off, nx / nl, nz / nl];
};
const HA = arcPt(Math.PI / 2);
const GX = -16.5, GZ = 27.2; // the gate of the court

// ---------- the house of Abu Talib on the court's right ----------
const YX0 = 14, YX1 = 22, YZ0 = 21.2, YZ1 = 28.4, YH = 2.6, DZ0 = 23.9, DZ1 = 25.3; // the yard; its gate in the left wall
const RX0 = 13.6, RX1 = 22.4, RZ1 = 33.4, RH = 4.4, DR = [16.35, 17.45, 2.2]; // the rooms behind it; their door
const AW = [17.0, 22.0, 25.9, 2.45, 2.95]; // the awning: x0, x1, its front z, front height, height at the house wall
const DOOR = [16.9, 28.2], GIN = [14.9, 24.6], GOUT = [12.9, 24.6], ATD = [12.6, 24.2], PRD = [13.25, 25.15]; // dusk: before the gate, he a step behind
const AT1 = [20.8, 26.9], PR1 = [19.25, 27.55], PR2 = [18.5, 26.7], WEALTH = [18.95, 25.6];
// the elders: robe, head cloth, place in the court, seat (first time), place (second time, or null), delay
const ELD = [
  { cl: [150, 128, 98], hd: [168, 148, 116], c0: [4.6, 13.8], s1: [17.3, 23.4], s2: [16.5, 23.3], d: .000 },
  { cl: [120, 100, 78], hd: [140, 118, 90], c0: [6.2, 14.8], s1: [16.6, 24.6], s2: [16.6, 26.3], d: .004 },
  { cl: [96, 86, 74], hd: [122, 106, 86], c0: [3.4, 15.2], s1: [16.4, 25.9], s2: [15.4, 23.9], d: .008 },
  { cl: [170, 146, 110], hd: [176, 152, 110], c0: [7.2, 13.0], s1: [16.8, 27.2], s2: [15.4, 25.7], d: .011 },
  { cl: [104, 92, 98], hd: [150, 130, 100], c0: [5.4, 12.4], s1: [15.4, 23.6], s2: null, d: .014 },
  { cl: [132, 104, 76], hd: [158, 136, 104], c0: [2.6, 13.6], s1: [15.3, 26.6], s2: null, d: .017 },
];
const UM = { cl: [146, 70, 52], hd: [160, 134, 100], c0: [6.4, 15.8], s2: [17.75, 24.75] }; // Umara b. al-Walid
const RINGS = [[-15.6, 13.2, 7, 1.5], [-12.4, 9.4, 6, 1.35], [.8, 9.6, 7, 1.5], [-3.2, 11.6, 7, 1.45], [5.8, 16.6, 7, 1.6], [-18.4, 19.6, 6, 1.4]];
const RING = 4; // the assembly by the House that Abu Talib goes to
const AT2 = [12.7, 23.0], PC0 = [2.6, 20.6], PC1 = [11.25, 22.75]; // the other day: Abu Talib by his gate; the Prophet by the House, then before him
const AT3 = [8.7, 17.9], PC2 = [9.8, 18.5], HZ1 = [12.1, 24.2], HZ2 = [7.7, 19.0]; // before the assembly
const SPEAR = [[12.85, 22.75, .625], [12.6, 26.45, .63], [11.95, 23.45, .636], [11.75, 25.8, .642]]; // men of his house at dusk (the count is art)
const TORCH = [[3.4, 13.4], [-.6, 7.6], [-6.6, 10.8], [8.6, 15.4], [-11.4, 12.6]];
const DIP = [.678, .692, .699, .712];

// ---------- the land (sadaa's valley) ----------
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
const MORN = [[30, 82, 158], [96, 150, 210], [244, 214, 182], [255, 222, 176], [150, 152, 170], [210, 204, 204], 16, 2.0, 2800];
const DAY = [[26, 84, 160], [86, 148, 210], [216, 224, 228], [255, 244, 224], [152, 160, 176], [186, 202, 222], 44, 2.4, 3000];
const NOON = [[22, 76, 156], [80, 142, 206], [222, 224, 216], [255, 246, 226], [152, 158, 172], [188, 200, 218], 62, 2.9, 3000];
const AFT = [[28, 74, 150], [96, 144, 200], [236, 220, 196], [255, 236, 204], [148, 150, 164], [202, 204, 214], 36, 3.9, 2800];
const GOLD = [[34, 70, 142], [116, 142, 194], [248, 210, 172], [255, 212, 160], [156, 146, 156], [234, 202, 172], 15, 4.3, 2500];
const LATE = [[30, 74, 150], [106, 146, 202], [246, 214, 180], [255, 220, 172], [156, 150, 162], [226, 204, 182], 20, 2.75, 2700];
const DUSK = [[40, 62, 128], [136, 130, 176], [252, 194, 150], [255, 190, 128], [160, 138, 146], [240, 190, 158], 5, 4.53, 2300];
const LK = [[-.06, ...MORN], [.2, ...DAY], [.4, ...NOON], [.5, ...AFT], [.585, ...GOLD], [.66, ...DUSK], [.697, ...DUSK], [.7, ...MORN], [.78, ...DAY], [.9, ...DAY], [.96, ...LATE], [1.06, ...LATE]];
// camera keys: p, the point it looks at (x, z), its own z, its height
const CK = [
  [-.06, 9.0, 23.0, -12, 7.2], [.0, 11.5, 23.0, -4, 5.6], [.05, 17.9, 25.4, 10.6, 3.4], [.125, 18.0, 25.5, 11.6, 3.2],
  [.155, 19.25, 27.5, 19.6, 2.25], [.205, 19.25, 27.5, 20.1, 2.25], [.235, 18.0, 25.5, 12.2, 3.1], [.33, 17.8, 25.3, 11.8, 3.2],
  [.36, 13.4, 23.2, 2.2, 4.2], [.4, 13.4, 23.2, 1.6, 4.2], [.425, 17.4, 25.0, 11.4, 3.2], [.535, 17.4, 25.0, 12.6, 3.0],
  [.565, 11.1, 23.8, 10.8, 2.4], [.69, 11.1, 23.8, 11.6, 2.3], [.7, 6.4, 21.2, 8.2, 2.8], [.765, 7.6, 21.6, 9.6, 2.6],
  [.8, 8.2, 19.4, 7.8, 2.8], [.845, 7.4, 18.4, 7.6, 2.7], [.9, 7.6, 18.6, 8.2, 2.6], [.95, 7.8, 18.8, 7.6, 2.3], [1.06, 7.8, 19.0, 8.6, 2.1],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const SEAT = [-.42, 0, -.44, .22, -.36, .5, -.26, .72, -.16, .84, -.1, .9, -.02, 1.0, .1, .98, .13, .88, .12, .82, .2, .74, .24, .5, .42, .36, .55, .18, .52, 0];
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };

S.abutalib = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(7253);
    const HS = []; // houses: [x0, x1, z0, depth, height, albedo, seed, y0]
    const TONE = [[224, 198, 158], [206, 174, 134], [234, 220, 192], [192, 158, 120], [216, 192, 162]];
    const row = (xa, xb, za, zb, h0, h1, skip) => { for (let x = xa; x < xb;) { const w = 3.2 + R() * 4.2; if (!skip || x + w < skip[0] || x > skip[1]) HS.push([x, x + w, za + R() * (zb - za), 5 + R() * 4, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); x += w + R() * .6; } };
    const col = (x0, x1, za, zb, h0, h1) => { for (let z = za; z < zb;) { const d = 3.6 + R() * 3.4, w = (x1 - x0) * (.8 + R() * .3); HS.push([x0, x0 + w, z, d, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); z += d + R() * .5; } };
    row(-36, -13.6, 26.9, 28.6, 3.6, 6.4, [GX - 2.1, GX + 2.1]); // the left side of the court, its gate among them
    row(24, 44, 31, 35, 3.4, 5.8); // past Abu Talib's house, set back
    row(10, 34, 35, 40, 4.6, 7.2); // behind it
    row(-46, 46, 56, 66, 4, 7.5); // behind the House
    row(-70, 70, 76, 92, 4.5, 9);
    col(-36, -29, -14, 24, 3.6, 6.2); // the court's left and right sides
    col(29, 36, -14, 9, 3.4, 5.8); // (kept short of Abu Talib's house, so its long side never walls the yard shots)
    for (let i = 0; i < 90; i++) { const x = -260 + R() * 520, z = 150 + R() * 260, y = hgt(x, z); if (y > 45) continue; HS.push([x, x + 4 + R() * 6, z, 6, 4 + R() * 5, TONE[(R() * 5) | 0], R(), y - .5]); }
    st.HS = HS;
    st.peb = Array.from({ length: 520 }, () => [-30 + R() * 60, -8 + R() ** 1.2 * 60, .04 + R() ** 2 * .16, R()]).filter(([x, z]) => !(x > YX0 - .3 && x < YX1 + .5 && z > YZ0 - .5));
    st.cirrus = Array.from({ length: 9 }, () => [R() * 1.6 - .3, .1 + R() * .32, .2 + R() * .4, R()]);
    // the clouds that gather at the end: clusters of puffs in screen units (u across, v up from the horizon)
    st.cum = Array.from({ length: 7 }, (_, i) => ({ u: .02 + i * .1 + R() * .05, v: .36 + R() * .3, w: .1 + R() * .08, puffs: Array.from({ length: 20 }, () => { const du = R() * 2 - 1; return [du, (1 - Math.abs(du)) * (.2 + .8 * R()), .3 + R() * .45]; }).sort((a, b) => b[1] - a[1]) }));
    // the assemblies: men seated in rings; r1 picks a gesture, r2 a phase; a = the angle on the ring
    st.memb = [];
    RINGS.forEach(([cx, cz, n, rad], ri) => { for (let k = 0; k < n; k++) { const a = (k + R() * .4) / n * TAU; st.memb.push({ x: cx + Math.cos(a) * rad, z: cz + Math.sin(a) * rad * .8, a, cx, ri, r1: R(), r2: R(), cl: [[150, 128, 98], [120, 100, 78], [96, 86, 74], [170, 146, 110], [104, 92, 98], [132, 104, 76]][(R() * 6) | 0], hd: [[168, 148, 116], [140, 118, 90], [122, 106, 86], [176, 152, 110]][(R() * 4) | 0], sc: .94 + R() * .12 }); } });
    st.stand = Array.from({ length: 7 }, () => [-24 + R() * 34, 18 + R() * 9, R()]).filter(([x]) => Math.abs(x - HA[0]) > 7);
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
    const eve = smooth(seg(p, .6, .68)) * (1 - smooth(seg(p, .69, .7))) + .6 * smooth(seg(p, .95, 1.04)), dusk = bump(p, .575, .62, .69, .7);
    const gather = smooth(seg(p, .925, 1.0));
    // ----- sky -----
    const sg = c.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.58, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    { // the sun's glare from the side it stands on
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
      c.save(); c.translate(x, y); c.rotate(-.04 + k * .08); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(lerp([255, 255, 255], sunC, .3 + .4 * eve), .3 + .2 * k)); g.addColorStop(1, rgb([255, 255, 255], 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    // the clouds gathering at the end: each a cluster of puffs, white above and warm under, rising from the horizon
    if (gather > 0) {
      const shade = lerp([206, 204, 218], lerp(sunC, skH, .4), .35), lit = lerp([255, 255, 255], sunC, .14);
      st.cum.forEach((cl, i) => {
        const g0 = smooth(c01((gather - i * .05) / .65)); if (g0 <= 0) return;
        const cx = cl.u * (phone ? 1.1 : .78) * W - (camX - 7.6) * 6, cy = hy * (1 - cl.v) + (1 - g0) * hy * .1, rw = cl.w * W * (.55 + .45 * g0) * (phone ? 1.5 : 1);
        c.globalAlpha = .78 * g0;
        cl.puffs.forEach(([du, dv, r]) => {
          const R0 = r * rw * .5 * (1 - .3 * Math.abs(du)), x0 = cx + du * rw * .8 + Math.sin(t * .15 + du * 4) * 2, y0 = cy - dv * rw * .45;
          const g = c.createRadialGradient(x0 - R0 * .2, y0 - R0 * .35, R0 * .1, x0, y0, R0);
          g.addColorStop(0, rgb(lit)); g.addColorStop(.68, rgb(lerp(lit, shade, .55))); g.addColorStop(1, rgb(shade, 0));
          c.fillStyle = g; c.beginPath(); c.arc(x0, y0, R0, 0, TAU); c.fill();
        });
      });
      c.globalAlpha = 1;
    }
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
    const gq = (pts, col) => { const a = pts.map(([x, z]) => P3(x, .005, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
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
    const glowW = dusk;
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
    // ----- a block of wall: its faces toward the camera and its top -----
    const slab = (x0, x1, z0, z1, h, alb, key) => {
      const zc = (z0 + z1) / 2, zr = zc - camZ; if (z1 - camZ < 1.5) return;
      items.push([key ?? zr + (z1 - z0) * .5 - .2, () => {
        const q = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); if (pts[0][1] === pts[2][1]) return; const yb = Math.max(a[0][1], a[1][1]), yt = Math.min(a[2][1], a[3][1]), gg = c.createLinearGradient(0, yb, 0, yt); gg.addColorStop(0, rgb(shCol, .32)); gg.addColorStop(1, rgb(shCol, 0)); c.fillStyle = gg; c.fill(); };
        if (camX < x0) q([[x0, 0, z0], [x0, 0, z1], [x0, h, z1], [x0, h, z0]], rgb(wall(alb, Math.max(0, -sun[0]), zr, .68)));
        if (camX > x1) q([[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]], rgb(wall(alb, Math.max(0, sun[0]), zr, .68)));
        if (camZ < z0) q([[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]], rgb(wall(alb, Math.max(0, -sun[2]), zr, .66)));
        if (camY > h) q([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], rgb(lerp(wall(alb, Math.max(0, sun[1]), zr, .8), [255, 246, 226], .1)));
        const cap = P3(x0, h, z0), cap1 = P3(x1, h, z0); c.strokeStyle = rgb(lerp(wall(alb, .6, zr, .8), [255, 248, 230], .25)); c.lineWidth = Math.max(1, .08 * F / zr); c.beginPath(); c.moveTo(cap[0], cap[1]); c.lineTo(cap1[0], cap1[1]); c.stroke();
      }]);
    };
    // ----- the house of Abu Talib -----
    const YARD = [226, 204, 168], HOUSE = [214, 186, 146];
    slab(YX0 - .4, YX0, YZ0, DZ0, YH, YARD); slab(YX0 - .4, YX0, DZ1, YZ1, YH, YARD); // the left wall, the gate between
    slab(YX1, YX1 + .4, YZ0, YZ1, YH, YARD); // the right wall
    slab(RX0, RX1, YZ1, RZ1, RH, HOUSE); // the rooms
    { // the yard floor, the door and window of the rooms, the awning, the mat, a water jar, the lamp at dusk
      const zr = YZ1 - camZ;
      if (zr > 1.5) items.push([zr - .15, () => {
        const s = F / zr, lamF = Math.max(0, -sun[2]);
        // the beaten floor of the yard, a shade lighter than the court
        gq([[YX0, YZ0], [YX1, YZ0], [YX1, YZ1], [YX0, YZ1]], rgb(wall([226, 206, 170], Math.max(0, sun[1]), zr, .74), .55));
        // the door: a dark opening under a lintel; the window
        const d0 = P3(DR[0], 0, YZ1 - .01), d1 = P3(DR[1], DR[2], YZ1 - .01), dc = wall([104, 70, 44], lamF, zr);
        c.fillStyle = rgb(lerp(wall(HOUSE, lamF, zr), [26, 18, 14], .85)); c.fillRect(d0[0], d1[1], d1[0] - d0[0], d0[1] - d1[1]);
        c.fillStyle = rgb(dc); c.fillRect(d0[0] - .12 * s, d1[1] - .16 * s, d1[0] - d0[0] + .24 * s, .16 * s);
        const w0 = P3(19.6, 2.9, YZ1 - .01), w1 = P3(20.4, 3.5, YZ1 - .01);
        c.fillStyle = rgb(lerp(lerp(wall(HOUSE, lamF, zr), [26, 18, 14], .8), [255, 196, 120], dusk * .8)); c.fillRect(w0[0], w1[1], w1[0] - w0[0], w0[1] - w1[1]);
        // the awning's shade on the ground, the mat, the cushion
        gq([[AW[0] - .2, AW[2] - .5], [AW[1] + .2, AW[2] - .5], [AW[1], YZ1], [AW[0], YZ1]], rgb(shCol, .22 * day + .06));
        gq([[17.6, 25.7], [21.7, 25.7], [21.7, 28.1], [17.6, 28.1]], rgb(wall([176, 146, 96], .6, zr, .7)));
        c.strokeStyle = rgb(wall([128, 100, 62], .4, zr, .7), .55); c.lineWidth = 1; c.beginPath();
        for (let k = 1; k < 16; k++) { const a = P3(17.6 + k * 4.1 / 16, .01, 25.7), b = P3(17.6 + k * 4.1 / 16, .01, 28.1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke();
        const cu = P3(AT1[0] + .15, .12, AT1[1] + .1); c.fillStyle = rgb(wall([150, 62, 46], .6, zr, .7)); c.beginPath(); c.ellipse(cu[0], cu[1], .55 * s, .14 * s, 0, 0, TAU); c.fill();
        // a water jar by the door
        const j = P3(15.6, 0, YZ1 - .3); c.fillStyle = rgb(wall([170, 112, 70], Math.max(0, sunSide * sun[0]) * .6 + .3, zr, .7)); c.beginPath(); c.ellipse(j[0], j[1] - .32 * s, .22 * s, .3 * s, 0, 0, TAU); c.fill(); c.fillRect(j[0] - .08 * s, j[1] - .72 * s, .16 * s, .16 * s);
        // the awning: poles and a roof of palm fronds sloping to the house wall
        const pol = (x) => { const a = P3(x, 0, AW[2]), b = P3(x, AW[3], AW[2]); c.strokeStyle = rgb(wall([110, 80, 50], .5, zr, .7)); c.lineWidth = Math.max(1.2, .1 * s); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
        pol(AW[0] + .1); pol(AW[1] - .1); pol((AW[0] + AW[1]) / 2);
        const r = [P3(AW[0] - .2, AW[3], AW[2] - .3), P3(AW[1] + .2, AW[3], AW[2] - .3), P3(AW[1] + .2, AW[4], YZ1), P3(AW[0] - .2, AW[4], YZ1)];
        const under = camY < AW[3], rc = under ? wall([120, 96, 60], .2, zr, .62) : wall([196, 168, 112], Math.max(0, sun[1]), zr, .78);
        c.fillStyle = rgb(rc); c.beginPath(); r.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill();
        c.strokeStyle = rgb(lerp(rc, [40, 30, 20], .3), .6); c.lineWidth = 1; c.beginPath();
        for (let k = 0; k <= 22; k++) { const u = k / 22, a = [mix(r[0][0], r[1][0], u), mix(r[0][1], r[1][1], u)], b = [mix(r[3][0], r[2][0], u), mix(r[3][1], r[2][1], u)]; c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke();
        c.strokeStyle = rgb(wall([150, 120, 70], .5, zr, .7)); c.lineWidth = Math.max(1, .06 * s); c.beginPath();
        for (let k = 0; k <= 40; k++) { const u = k / 40, x = mix(r[0][0], r[1][0], u), y = mix(r[0][1], r[1][1], u); c.moveTo(x, y); c.lineTo(x + .03 * s * Math.sin(k * 2.3 + t * .7), y + (.14 + .08 * hash(k)) * s); } c.stroke(); // the fronds' fringe
        // the lamp by the door at dusk
        if (dusk > 0) {
          const [X, Y] = P3(DR[1] + .45, 1.9, YZ1 - .05), fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3);
          c.globalCompositeOperation = 'lighter';
          const g = c.createRadialGradient(X, Y, 0, X, Y, 4 * s); g.addColorStop(0, `rgba(255,186,104,${.5 * dusk * fl})`); g.addColorStop(.4, `rgba(255,170,90,${.16 * dusk * fl})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(X - 4 * s, Y - 4 * s, 8 * s, 8 * s);
          c.globalCompositeOperation = 'source-over';
          c.fillStyle = `rgba(255,236,190,${dusk})`; c.beginPath(); c.ellipse(X, Y - .06 * s, .04 * s, .09 * s, 0, 0, TAU); c.fill();
        }
      }]);
      // the lamp at the gate at dusk, on the wall's outer face
      if (dusk > 0) { const zg = DZ1 + 2.3, zr2 = zg - camZ; if (zr2 > 1.5) items.push([zr2 - 1.2, () => {
        const s = F / zr2, [X, Y] = P3(YX0 - .45, 2.0, zg), fl = .85 + .15 * Math.sin(t * 8.1 + 1) * Math.sin(t * 4.7);
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(X, Y, 0, X, Y, 4.5 * s); g.addColorStop(0, `rgba(255,186,104,${.55 * dusk * fl})`); g.addColorStop(.4, `rgba(255,170,90,${.17 * dusk * fl})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(X - 4.5 * s, Y - 4.5 * s, 9 * s, 9 * s);
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = `rgba(255,236,190,${dusk})`; c.beginPath(); c.ellipse(X, Y - .06 * s, .045 * s, .1 * s, 0, 0, TAU); c.fill();
      }]); }
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
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .25)); c.fillRect(X - w / 2 - .1 * s, Yb - h - .24 * s, w + .2 * s, .24 * s);
      }]);
    }
    // ----- the House -----
    {
      const zrK = KZ - camZ, near = Math.min(...CO.map((q) => q[1])) - camZ;
      items.push([near + .4, () => {
        const inFront = (f) => { const F0 = FC[f], mx = (F0.a[0] + F0.b[0]) / 2 - camX, mz = (F0.a[1] + F0.b[1]) / 2 - camZ; return F0.n[0] * mx + F0.n[1] * mz < 0; };
        const STONE = [184, 172, 154], WOOD = [138, 92, 56];
        [0, 1, 2, 3].filter(inFront).forEach((f) => {
          const F0 = FC[f], A = F0.a, B = F0.b, pt = (u, y) => P3(A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u);
          const lam = Math.max(0, F0.n[0] * sun[0] + F0.n[1] * sun[2]);
          const quad = (u0, u1, y0, y1, col) => { const a = pt(u0, y0), b = pt(u1, y0), e = pt(u1, y1), g = pt(u0, y1); c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill(); };
          const base = wall(STONE, lam, zrK);
          quad(0, 1, 0, TOP, rgb(base));
          for (let y = .5, k = 0; y < 2.3; k++) { const hh = k % 2 ? .14 : .56; quad(0, 1, y, y + hh, rgb(k % 2 ? wall(WOOD, lam, zrK) : base.map((v) => v * (.95 + .05 * Math.sin(k))))); y += hh; }
          const g0 = pt(.5, 0), g1 = pt(.5, .5), gg = c.createLinearGradient(g0[0], g0[1], g1[0], g1[1]); gg.addColorStop(0, rgb(shCol, .45)); gg.addColorStop(1, rgb(shCol, 0));
          c.save(); c.beginPath(); const a0 = pt(0, 0), a1 = pt(1, 0), a2 = pt(1, TOP), a3 = pt(0, TOP); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineTo(a3[0], a3[1]); c.closePath(); c.clip(); c.fillStyle = gg; c.fillRect(0, 0, W, H); c.restore();
          const yb = 2.3, CLR = [[150, 50, 42], [226, 208, 172], [58, 62, 98], [226, 208, 172]], CW = [.62, .1, .16, .1], npn = Math.round(F0.L / .98), pw = 1 / npn;
          for (let j = 0; j < npn * 4; j++) {
            const q = j % 4, pu = Math.floor(j / 4) * pw, u0 = pu + pw * CW.slice(0, q).reduce((a, v) => a + v, 0), u1 = u0 + pw * CW[q];
            const col = wall(CLR[q], lam, zrK, .62).map((v) => v * (q ? 1 : .94 + .06 * Math.sin(j * 2.1))), w0 = yb + .06 * Math.sin(u0 * 40 + t * .8), w1 = yb + .06 * Math.sin(u1 * 40 + t * .8);
            const a = pt(u0, w0), b = pt(u1, w1), e = pt(u1, TOP), g = pt(u0, TOP);
            c.fillStyle = rgb(col); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill();
            c.strokeStyle = rgb(lerp(col, [20, 16, 20], .35), .5); c.lineWidth = 1; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke();
          }
          const ha = pt(0, yb), hb = pt(1, yb); c.strokeStyle = rgb(wall([90, 60, 40], lam, zrK), .8); c.lineWidth = Math.max(1, F / zrK * .05); c.beginPath(); c.moveTo(ha[0], ha[1]); c.lineTo(hb[0], hb[1]); c.stroke();
          if (f === 0) { const [u0, u1, y0, y1] = KDOOR, dc = wall([104, 66, 38], lam, zrK); quad(u0 - .01, u1 + .01, y0 - .1, y1 + .15, rgb(lerp(base, [20, 14, 12], .8))); quad(u0 + .006, u1 - .006, y0 + .05, y1 - .04, rgb(dc)); }
          const ra = pt(0, TOP), rb = pt(1, TOP); c.strokeStyle = rgb(lerp(base, [255, 246, 226], .35)); c.lineWidth = Math.max(1, F / zrK * .08); c.beginPath(); c.moveTo(ra[0], ra[1]); c.lineTo(rb[0], rb[1]); c.stroke();
        });
      }]);
    }
    // ----- the Hijr -----
    {
      const zr = HA[1] - camZ;
      items.push([zr + .35, () => {
        const segs = [];
        for (let k = 0; k < NA; k++) { const a = Math.PI * k / NA, b = Math.PI * (k + 1) / NA, oa = arcPt(a, HJT / 2), ob = arcPt(b, HJT / 2), ia = arcPt(a, -HJT / 2), ib = arcPt(b, -HJT / 2); segs.push({ oa, ob, ia, ib, mz: (oa[1] + ob[1]) / 2, k }); }
        segs.sort((A, B) => B.mz - A.mz);
        const ST = [196, 182, 160];
        const q = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
        segs.forEach(({ oa, ob, ia, ib, k }) => {
          const nx = (oa[2] + ob[2]) / 2, nz = (oa[3] + ob[3]) / 2, mx = (oa[0] + ob[0]) / 2 - camX, mzz = (oa[1] + ob[1]) / 2 - camZ;
          const out = nx * mx + nz * mzz < 0, tone = .95 + .07 * hash(k, 5);
          if (!out) { const lam = Math.max(0, -nx * sun[0] - nz * sun[2]); q([[ia[0], 0, ia[1]], [ib[0], 0, ib[1]], [ib[0], HJH, ib[1]], [ia[0], HJH, ia[1]]], rgb(wall(ST, lam, zr, .6).map((v) => v * tone * .9))); }
          else { const lam = Math.max(0, nx * sun[0] + nz * sun[2]), col = wall(ST, lam, zr, .66).map((v) => v * tone); q([[oa[0], 0, oa[1]], [ob[0], 0, ob[1]], [ob[0], HJH, ob[1]], [oa[0], HJH, oa[1]]], rgb(col)); }
          if (camY > HJH) q([[oa[0], HJH, oa[1]], [ob[0], HJH, ob[1]], [ib[0], HJH, ib[1]], [ia[0], HJH, ia[1]]], rgb(lerp(wall(ST, Math.max(0, sun[1]), zr, .8), [255, 248, 232], .14)));
        });
      }]);
    }

    // ----- figures -----
    // a faceless cloaked shape facing dir; arms are hand points in its own units; staff / sword / spear / bundle in hand
    const person = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2 || (o.alpha ?? 1) <= 0) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -3 * s || X > W + 3 * s) return;
      const Y = PY(0, z) - (o.bob || 0) * s, dir = o.dir || 1, sq = o.sq || 1, lean = o.lean || 0, sh = o.shape || MAN, seat = sh === SEAT;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * dir, -s * sq);
      const dark = fig(lerp(o.cl, [20, 20, 30], .3), zr), lt = fig(lerp(o.cl, [255, 230, 200], .15), zr), ls = dir * sunSide > 0;
      const S0 = seat ? [.03 + lean * .78, .76] : [.05 + lean * 1.42, 1.4];
      const arm = (hand, near) => { const el = [(S0[0] + hand[0]) / 2 + .06, (S0[1] + hand[1]) / 2 - .12]; c.beginPath(); tube(c, [S0, el, hand], .15, .1); c.fillStyle = rgb(near ? lerp(dark, lt, .45) : lerp(dark, [10, 10, 16], .2)); c.fill(); c.fillStyle = rgb(fig([200, 184, 160], zr)); c.beginPath(); c.arc(hand[0], hand[1], .05, 0, TAU); c.fill(); };
      if (o.spear) { c.strokeStyle = rgb(fig([96, 72, 46], zr)); c.lineWidth = .045; c.beginPath(); c.moveTo(.34, -.02); c.lineTo(.4, 2.55); c.stroke(); c.fillStyle = rgb(lerp(fig([196, 200, 208], zr), [255, 244, 220], .2 * dusk)); c.beginPath(); c.moveTo(.41, 2.86); c.lineTo(.36, 2.55); c.lineTo(.45, 2.55); c.closePath(); c.fill(); }
      (o.arms || []).forEach((h, i) => { if (i === 1) arm(h, false); });
      c.beginPath(); poly(c, sh, lean);
      const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(ls ? dark : lt)); g.addColorStop(.6, rgb(dark)); g.addColorStop(1, rgb(ls ? lt : dark)); c.fillStyle = g; c.fill();
      if (o.rim) { c.strokeStyle = `rgba(255,214,150,${o.rim})`; c.lineWidth = 2.2 / s; c.stroke(); }
      const hp = seat ? [.03, .93] : [.01, 1.69], hl = lean * hp[1];
      c.fillStyle = rgb(fig(o.hd || [150, 128, 98], zr));
      c.beginPath(); c.ellipse(hp[0] + hl, hp[1], .14, .1, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hp[0] + hl - .07, hp[1] - .11, .05, .11, .3, 0, TAU); c.fill();
      (o.arms || []).forEach((h, i) => { if (i !== 1) arm(h, true); });
      if (o.staff) { c.strokeStyle = rgb(fig([96, 70, 44], zr)); c.lineWidth = .05; c.beginPath(); c.moveTo(.34, 0); c.lineTo(.3, 1.5); c.stroke(); }
      if (o.sword && o.arms) { // a straight sword held low and forward
        const [hx, hy2] = o.arms[0];
        c.strokeStyle = rgb(lerp(fig([200, 206, 214], zr), [255, 250, 236], .25)); c.lineWidth = .04; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy2); c.lineTo(hx + .62 * o.sword, hy2 - .5 * o.sword); c.stroke();
        c.strokeStyle = rgb(fig([110, 80, 40], zr)); c.lineWidth = .06; c.beginPath(); c.moveTo(hx - .05, hy2 - .07); c.lineTo(hx + .05, hy2 + .07); c.stroke();
      }
      if (o.bundle && o.arms) { const [hx, hy2] = o.arms[0]; c.fillStyle = rgb(fig([92, 58, 44], zr)); c.beginPath(); c.ellipse(hx + .04, hy2 - .13, .11, .14, .3, 0, TAU); c.fill(); }
      c.restore();
    };
    const label = (x, z, txt, a, dy = 0) => { // a name under a man's feet
      const zr = z - camZ; if (a <= 0 || zr < 1.5) return;
      const s = F / zr, X = PX(x, z), Y = PY(0, z) + Math.max(14, .42 * s) + dy;
      c.save(); c.globalAlpha = a; c.direction = 'rtl'; c.textAlign = 'center'; c.font = `${Math.max(12, Math.min(19, .3 * s))}px ${FONT.naskh}`;
      c.fillStyle = 'rgba(10,12,22,.55)'; const w = c.measureText(txt).width; c.fillRect(X - w / 2 - 6, Y - 13, w + 12, 20);
      c.fillStyle = 'rgba(255,244,214,.96)'; c.fillText(txt, X, Y + 2); c.restore();
    };
    const toward = (x, tx) => Math.sign(tx - x) || 1;
    const fade = (p, a, b) => smooth(seg(p, a, b));

    // ----- the assemblies in the court; the one by the House laughs, then shrinks before Abu Talib, bows as Hamza passes -----
    const crowd = 1 - fade(p, .905, .935);
    const mockR = bump(p, .714, .72, .73, .737), see = bump(p, .815, .83, .9, .91);
    const hzK = seg(p, .848, .878), HZA0 = Math.atan2((HZ2[1] - RINGS[RING][1]) / .8, HZ2[0] - RINGS[RING][0]);
    st.memb.forEach((m) => {
      if (crowd <= 0) return;
      const near = m.ri === RING;
      let dir = toward(m.x, m.cx), lean = 0, arms, bob = 0, sq = 1;
      if (near && mockR > 0) {
        const sh = Math.sin(t * (8 + m.r2 * 4) + m.r1 * 30) * .5 + .5; dir = toward(m.x, PC0[0]);
        if (m.r1 < .4) arms = [lerp([.14, .42], [.64, 1.0 + .06 * sh], mockR)]; else { lean = -.12 * mockR; bob = .025 * sh * mockR; arms = [lerp([.14, .42], [.2, .5], mockR)]; }
      }
      if (near && see > 0) { // they see him coming and shrink; each bows as Hamza passes
        dir = toward(m.x, AT3[0]); lean = -.06 * see; sq = 1 - .04 * see;
        const da = ((HZA0 - m.a) % TAU + TAU) % TAU, pm = .848 + .03 * Math.min(1, da / (TAU * .85));
        const bow = smooth(seg(p, pm, pm + .004)) * see; lean += .2 * bow; sq -= .05 * bow;
      }
      shadow(m.x, m.z, .9, .7, .2 * crowd);
      items.push([m.z - camZ, () => person(m.x, m.z, { shape: SEAT, dir, cl: m.cl, hd: m.hd, lean, arms, bob, sq, sc: m.sc, alpha: crowd })]);
    });
    st.stand.forEach(([x, z, r], i) => { if (crowd <= 0) return; shadow(x, z, 1.75, .45, .2 * crowd); items.push([z - camZ, () => person(x, z, { dir: i % 2 ? 1 : -1, cl: [[150, 128, 98], [110, 96, 82], [172, 150, 116]][i % 3], hd: [158, 136, 104], alpha: crowd, sc: .97 + r * .06 })]); });
    // torches by the assemblies at dusk
    if (dusk > 0) TORCH.forEach(([x, z], i) => {
      const zr = z - camZ; if (zr < 1.5) return;
      items.push([zr, () => {
        const s = F / zr, [X, Yb] = P3(x, 0, z), Yt = PY(2.1, z), fl = .8 + .2 * Math.sin(t * 11 + i * 3) * Math.sin(t * 7.3 + i);
        c.strokeStyle = rgb(fig([80, 60, 40], zr), dusk); c.lineWidth = Math.max(1, .07 * s); c.beginPath(); c.moveTo(X, Yb); c.lineTo(X, Yt); c.stroke();
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(X, Yt - .15 * s, 0, X, Yt - .15 * s, 3.4 * s); g.addColorStop(0, `rgba(255,180,96,${.5 * dusk * fl})`); g.addColorStop(.35, `rgba(255,160,80,${.14 * dusk * fl})`); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.fillRect(X - 3.4 * s, Yt - 3.55 * s, 6.8 * s, 6.8 * s);
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = `rgba(255,230,170,${dusk})`; c.beginPath(); c.ellipse(X, Yt - .14 * s, .07 * s, .17 * s * fl, 0, 0, TAU); c.fill();
      }]);
    });

    // ----- the elders: in at the gate, seated, eager, rising, out; back with Umara, standing, out -----
    const eager = bump(p, .232, .245, .27, .285), anger = bump(p, .316, .325, .345, .36), rise1 = .318;
    const ask = bump(p, .442, .45, .462, .47), back = bump(p, .505, .515, .528, .535);
    const who = [...ELD.map((e, i) => ({ ...e, i })), { ...UM, i: 6, d: -.004, s1: null }];
    who.forEach((e) => {
      const { i, d } = e;
      let K1 = null, K2 = null;
      if (e.s1) K1 = [[-.07, ...e.c0], [-.05 + d, ...e.c0], [.022 + d, ...GOUT], [.03 + d, ...GIN], [.046 + d, ...e.s1], [.335 + d, ...e.s1], [.35 + d, ...GIN], [.357 + d, ...GOUT], [.4 + d, e.c0[0] - 4, e.c0[1] - 2]];
      if (e.s2) { const d2 = i === 6 ? 0 : .003 + (i % 4) * .003; K2 = [[.4, e.c0[0] + 2, e.c0[1] + 2], [.405 + d2, e.c0[0] + 2, e.c0[1] + 2], [.425 + d2, ...GOUT], [.431 + d2, ...GIN], [.443 + d2, ...e.s2], [.53 + d2 * .5, ...e.s2], [.541 + d2 * .5, ...GIN], [.546 + d2 * .5, ...GOUT], [.57, e.c0[0], e.c0[1] + 1]]; }
      const ph1 = K1 && p < .402, ph2 = K2 && p >= .402 && p < .575;
      if (!ph1 && !ph2) return;
      const K = ph1 ? K1 : K2, tr = track(K, p);
      let alpha = ph1 ? fade(p, -.07, -.06) * (1 - fade(p, .385 + d, .4 + d)) : fade(p, .405, .412) * (1 - fade(p, .55, .566));
      const sitAt = .047 + d, seated = ph1 ? fade(p, sitAt, sitAt + .006) * (1 - fade(p, rise1 + d * .4, rise1 + .008 + d * .4)) : 0;
      let dir = tr.walk ? (tr.dir || 1) : toward(tr.x, AT1[0]), lean = 0, arms, bob = 0;
      const wph = p * 170 + i * 1.7;
      if (tr.walk) { lean = Math.sin(wph) * .03; bob = Math.abs(Math.sin(wph)) * .03; }
      if (ph1 && eager > 0) { lean += .1 * eager; if (i % 2 === 0) arms = [lerp([.14, .42], [.5, .62], eager)]; }
      if (ph1 && anger > 0 && !tr.walk) { const sh = Math.sin(t * 9 + i * 7) * .5 + .5; arms = i % 2 ? [lerp([.12, .78], [.66, 1.62 + .05 * sh], anger)] : [lerp([.12, .78], [.25, 2.0 + .06 * sh], anger), lerp([.1, .76], [-.05, 1.9], anger)]; lean = i % 2 ? .04 * anger : -.06 * anger; }
      if (ph2 && i === 0 && ask > 0) arms = [lerp([.14, .8], [.7, 1.2], ask)]; // he points from the young man to the house door
      if (ph2 && back > 0 && !tr.walk) lean -= .05 * back;
      const x = tr.x, z = tr.z;
      shadow(x, z, seated > .5 ? .9 : 1.75, .45, .22 * alpha);
      items.push([z - camZ, () => {
        if (seated < 1) person(x, z, { dir, cl: e.cl, hd: e.hd, lean, arms: seated > 0 ? undefined : arms, bob, alpha: alpha * (1 - seated), sc: i === 6 ? 1.06 : 1 });
        if (seated > 0) person(x, z, { shape: SEAT, dir, cl: e.cl, hd: e.hd, lean, arms, alpha: alpha * seated });
        if (i === 6) label(x, z, 'عمارة بن الوليد', alpha * bump(p, .43, .44, .535, .55));
      }]);
    });
    // ----- the wealth they set down: bags and a scatter of coin (the count is art) -----
    const wA = fade(p, .1, .112) * (1 - fade(p, .336, .35));
    if (wA > 0) {
      const zr = WEALTH[1] - camZ;
      items.push([zr, () => {
        const s = F / zr, drop = (1 - fade(p, .1, .112)) * .5;
        c.save(); c.globalAlpha = wA;
        [[-.5, -.2, 1], [.05, -.35, .9], [.5, -.1, 1.05], [-.2, .3, .85], [.35, .35, .95]].forEach(([dx, dz, k], j) => {
          const [X, Y] = P3(WEALTH[0] + dx, drop, WEALTH[1] + dz), r = .2 * k * s;
          c.fillStyle = rgb(wall([150, 116, 76], .6 + .3 * hash(j), zr, .7)); c.beginPath(); c.ellipse(X, Y - r * .9, r, r * .95, 0, 0, TAU); c.fill();
          c.fillStyle = rgb(wall([118, 88, 56], .5, zr, .7)); c.beginPath(); c.ellipse(X, Y - r * 1.85, r * .3, r * .2, 0, 0, TAU); c.fill();
        });
        for (let j = 0; j < 16; j++) { const [X, Y] = P3(WEALTH[0] - .7 + 1.4 * hash(j, 2), .01, WEALTH[1] - .5 + .9 * hash(j, 4)); c.fillStyle = `rgba(255,222,140,${.75 + .25 * Math.sin(t * 3 + j)})`; c.beginPath(); c.ellipse(X, Y, .045 * s, .02 * s, 0, 0, TAU); c.fill(); }
        c.restore();
      }]);
    }

    // ----- Abu Talib -----
    let atHead = null;
    {
      const ATC = [92, 74, 56], ATH = [146, 124, 92];
      let x, z, dir = -1, seated = 0, walk = false, arms, alpha = 1, sword = 0, lean = .03;
      if (p < .69) {
        const tr = track([[.556, ...AT1], [.568, ...GIN], [.578, ...ATD]], p);
        x = tr.x; z = tr.z; walk = tr.walk;
        seated = 1 - fade(p, .488, .498);
        if (p < .3) dir = toward(x, ELD[1].s1[0]);
        if (walk) dir = -1;
        const no = bump(p, .5, .508, .528, .536);
        if (no > 0) arms = [lerp([.14, .44], [.56, 1.38], no)];
        alpha = 1 - fade(p, .69, .7);
      } else {
        const tr = track([[.7, ...AT2], [.79, ...AT2], [.826, ...AT3]], p);
        x = tr.x; z = tr.z; walk = tr.walk; alpha = fade(p, .7, .705);
        seated = 1 - fade(p, .775, .785);
        dir = p < .79 ? toward(x, PC1[0]) : walk ? -1 : p > .884 ? 1 : -1;
        sword = fade(p, .782, .79) * (1 - fade(p, .884, .892)); // he lowers it away before he turns to his nephew
        if (sword > 0) arms = [[.38, .9]];
        const turn = bump(p, .886, .895, .95, .96);
        if (turn > 0) arms = [lerp([.38, .9], [.6, 1.25], turn)];
      }
      const wph = p * 160;
      const oo = { dir, cl: ATC, hd: ATH, alpha, sc: 1.03, staff: p < .69, sword, arms, lean: lean + (walk ? Math.sin(wph) * .02 : 0), bob: walk ? Math.abs(Math.sin(wph)) * .03 : 0 };
      shadow(x, z, seated > .5 ? .9 : 1.8, .5, .22 * alpha);
      items.push([z - camZ, () => {
        if (seated < 1) person(x, z, { ...oo, alpha: alpha * (1 - seated) });
        if (seated > 0) person(x, z, { ...oo, shape: SEAT, staff: false, sword: 0, arms: undefined, alpha: alpha * seated });
      }]);
      atHead = [x, z];
    }
    // ----- Hamza: called out of the gate, a bundle in his hand; round the ring; back at his brother's side -----
    {
      const hzA = fade(p, .776, .784) * (1 - fade(p, 1.05, 1.06));
      if (hzA > 0 && p > .7) {
        let x, z, walk = false, dir = -1;
        if (p < .848) { const tr = track([[.776, ...GIN], [.79, ...HZ1], [.826, ...HZ2]], p); x = tr.x; z = tr.z; walk = tr.walk; dir = walk ? (tr.dir || -1) : -1; }
        else if (p < .878) { const [cx, cz, , rad] = RINGS[RING], a = HZA0 - TAU * .85 * hzK, R2 = rad + .75; x = cx + Math.cos(a) * R2; z = cz + Math.sin(a) * R2 * .8; walk = true; dir = Math.sin(a) > 0 ? -1 : 1; }
        else { const [cx, cz, , rad] = RINGS[RING], a = HZA0 - TAU * .85, R2 = rad + .75, sx = cx + Math.cos(a) * R2, sz = cz + Math.sin(a) * R2 * .8, k = smooth(seg(p, .878, .89)); x = mix(sx, HZ2[0], k); z = mix(sz, HZ2[1], k); walk = k > 0 && k < 1; dir = toward(sx, HZ2[0]); }
        const wph = p * 175 + 2, arms = p < .88 ? [[.42, .82 + (p > .848 ? .2 : 0)]] : undefined;
        shadow(x, z, 1.8, .5, .22 * hzA);
        items.push([z - camZ, () => person(x, z, { dir, cl: [112, 72, 50], hd: [144, 112, 80], alpha: hzA, sc: 1.04, arms, bundle: p < .88, lean: walk ? Math.sin(wph) * .03 : .02, bob: walk ? Math.abs(Math.sin(wph)) * .03 : 0 })]);
      }
    }
    // ----- men of his house with spears at dusk -----
    SPEAR.forEach(([x1, z1, a0], i) => {
      const a = fade(p, a0, a0 + .01) * (1 - fade(p, .69, .7)); if (a <= 0) return;
      const k = smooth(seg(p, a0, a0 + .016)), x = mix(GIN[0], x1, k), z = mix(GIN[1], z1, k), walk = k > 0 && k < 1, wph = p * 170 + i;
      shadow(x, z, 1.8, .45, .2 * a);
      items.push([z - camZ, () => person(x, z, { dir: walk ? -1 : -1, cl: [[86, 70, 54], [104, 82, 60], [78, 66, 58], [96, 76, 52]][i], hd: [[132, 112, 86], [150, 124, 92], [124, 108, 88], [140, 118, 86]][i], alpha: a, spear: true, arms: [[.38, 1.08]], sc: .99 + i * .01, lean: walk ? Math.sin(wph) * .03 : 0, bob: walk ? Math.abs(Math.sin(wph)) * .03 : 0 })]);
    });

    // ----- the Prophet -----
    let pHead = null;
    {
      let K, alpha = 1;
      if (p < .41) { K = [[.128, ...DOOR], [.134, ...DOOR], [.15, ...PR1], [.288, ...PR1], [.302, ...PR2], [.385, ...PR2], [.4, ...DOOR]]; alpha = fade(p, .128, .135) * (1 - fade(p, .398, .405)); }
      else if (p < .69) { K = [[.556, ...DOOR], [.561, ...DOOR], [.572, ...GIN], [.58, ...PRD]]; alpha = fade(p, .556, .563) * (1 - fade(p, .69, .7)); }
      else { K = [[.7, ...PC0], [.735, ...PC0], [.763, ...PC1], [.792, ...PC1], [.826, ...PC2]]; alpha = fade(p, .7, .705); }
      const tr = track(K, p);
      if (alpha > 0) {
        const x = tr.x, z = tr.z, zr = z - camZ;
        let arms;
        const open = bump(p, .16, .172, .198, .21), up = bump(p, .295, .304, .33, .34), asks = bump(p, .742 + .022, .768, .776, .784);
        if (open > .01) arms = [lerp([-.13, -.42], [-.36, -.84], open), lerp([.13, -.42], [.36, -.84], open)];
        else if (up > .01) arms = [lerp([.13, -.42], [-.3, -.98], up)];
        else if (asks > .01) arms = [lerp([.13, -.42], [.38, -.62], asks)];
        const dayL = .55 + .45 * day - .15 * eve;
        if (!tr.walk || zr > 1.2) shadow(x, z, 1.8, .5, .22 * alpha);
        items.push([zr - .01, () => {
          const X = PX(x, z), Y = PY(0, z), h = 1.8 * F / zr;
          const o = { who: 'prophet', x: X, y: Y, h, t, amb: dayL, glow: .4 * (1 - day) + .14 + .18 * eve, alpha };
          pHead = Holy.draw(c, tr.walk ? { ...o, pose: 'walk', phase: tr.d / 1.3, flip: tr.dir < 0 } : { ...o, pose: 'stand', arms }) || { x: X, y: Y - h * .9, r: h * .07 };
          pHead.h = h;
        }]);
      }
    }
    items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());

    // ----- the sun over one open hand and the moon over the other: the words made a picture, then gone -----
    const emb = bump(p, .162, .178, .196, .209);
    if (emb > 0 && pHead) {
      const { x, y, h } = pHead, sx = x - h * .62, mx = x + h * .62, yy = y - h * .26, r = h * .13;
      c.save(); c.globalCompositeOperation = 'lighter';
      let g = c.createRadialGradient(sx, yy, 0, sx, yy, r * 5); g.addColorStop(0, `rgba(255,214,130,${.55 * emb})`); g.addColorStop(.3, `rgba(255,190,100,${.18 * emb})`); g.addColorStop(1, 'rgba(255,190,100,0)'); c.fillStyle = g; c.fillRect(sx - r * 5, yy - r * 5, r * 10, r * 10);
      g = c.createRadialGradient(mx, yy, 0, mx, yy, r * 4); g.addColorStop(0, `rgba(214,226,255,${.42 * emb})`); g.addColorStop(.3, `rgba(190,206,240,${.13 * emb})`); g.addColorStop(1, 'rgba(190,206,240,0)'); c.fillStyle = g; c.fillRect(mx - r * 4, yy - r * 4, r * 8, r * 8);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = emb;
      g = c.createRadialGradient(sx - r * .3, yy - r * .3, 0, sx, yy, r); g.addColorStop(0, '#fff4cf'); g.addColorStop(.7, '#ffd36e'); g.addColorStop(1, '#f2a93c'); c.fillStyle = g; c.beginPath(); c.arc(sx, yy, r, 0, TAU); c.fill();
      g = c.createRadialGradient(mx - r * .25, yy - r * .25, 0, mx, yy, r * .9); g.addColorStop(0, '#f7f8ff'); g.addColorStop(1, '#c9d0e4'); c.fillStyle = g; c.beginPath(); c.arc(mx, yy, r * .9, 0, TAU); c.fill();
      c.fillStyle = 'rgba(150,160,190,.35)'; [[-.3, -.2, .22], [.25, .1, .16], [-.05, .35, .12]].forEach(([dx, dy, rr]) => { c.beginPath(); c.arc(mx + dx * r, yy + dy * r, rr * r, 0, TAU); c.fill(); });
      c.restore();
    }
    // ----- grade: dusk warms; the edges close in a little; the dip to black between the two days -----
    if (eve > 0) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${.3 * eve})`; c.fillRect(0, hy * .5, W, H - hy * .5); c.globalCompositeOperation = 'source-over'; }
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.3)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    const dip = bump(p, ...DIP);
    if (dip > 0) { c.fillStyle = `rgba(6,8,14,${dip})`; c.fillRect(0, 0, W, H); }
  },
};
})();
