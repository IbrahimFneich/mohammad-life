(() => {
// aqaba — «بيعة العقبة» (Tafsir al-Qummi 1:272–273; I'lam al-Wara 1:139–144 from 'Ali b. Ibrahim; al-Khisal 2:491).
// Two small worlds in metres (x right, y up, z away) under one pinhole camera keyed on p (the horizon line is keyed
// too, a lens shift that tilts the view down without bending the verticals):
//   p −.05 → .17 A  first light on a road out of the hills of Mecca: As'ad b. Zurara, Dhakwan and Mus'ab b. 'Umayr
//                    walk north toward Yathrib (I'lam 1:139); the day comes up as they near the pass (1:141)
//      .17 → .935 B  the middle night of Tashriq at Mina under a moon past its first quarter: the valley floor full of
//                    tents and fires; the house of 'Abd al-Muttalib on a ledge above the ravine of the 'Aqaba.
//                    .24 the men of Yathrib leave the tents and climb to it one at a time; .34 he stands in its yard with
//                    Hamza, 'Ali and al-'Abbas; .39–.445 seventy come in and sit; .5 he speaks; .59 they raise their
//                    hands; .676–.704 a light touches twelve of them, one after another (nine, then three), and each
//                    rises and stands before him; .73 torches wake all through the tents and move up the valley;
//                    .79 the men slip out by the back way; .845 Hamza and 'Ali go down and stand in the pass with
//                    swords; the torches halt below them (.87) and go back (.91)
//      .935 → 1.05   the same place at dawn: the fires low; he comes out and down the ravine toward Mecca, al-'Abbas
//                    behind him, Hamza and 'Ali coming back up from the pass to walk with him
// The Prophet and 'Ali are drawn only by Holy.draw (veiled, the gold disc). Everyone else is a faceless cloaked shape
// with an earth-toned head cloth; Jibril is light only; Iblis's cry has no figure, only the torches it wakes. The
// Prophet has sleeves and no hands. Everything follows from p; t moves only cloth, flames, stars.
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
  if (p <= K[0][0]) return { x: K[0][1], z: K[0][2], walk: false, d: 0, dx: 0 };
  let d = 0;
  for (let i = 1; i < K.length; i++) {
    const [p0, x0, z0] = K[i - 1], [p1, x1, z1] = K[i], L = Math.hypot(x1 - x0, z1 - z0);
    if (p < p1) { const k = (p - p0) / (p1 - p0), e = L === 0 ? 0 : k < .12 ? k * k / .24 : k > .88 ? 1 - (1 - k) ** 2 / .24 : (k - .06) / .88; return { x: mix(x0, x1, e), z: mix(z0, z1, e), walk: L > 0 && k > .01 && k < .99, d: d + L * e, dx: x1 - x0 }; }
    d += L;
  }
  const E = K[K.length - 1];
  return { x: E[1], z: E[2], walk: false, d, dx: 0 };
}
// a walk at an even pace through points [x, z], starting at p0 and taking dp per metre: keys for track()
const paced = (p0, dp, pts) => { const K = [[p0, ...pts[0]]]; let q = p0; for (let i = 1; i < pts.length; i++) { q += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * dp; K.push([q, ...pts[i]]); } return K; };
const DIPS = [[.156, .168, .172, .184]];

// ---------- the land ----------
function crag(x, z) {
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
const GRANITE = [118, 102, 92], GRANITED = [86, 74, 70], SAND = [200, 180, 142], SANDD = [176, 156, 122], TRACK = [222, 204, 168], FAR = [128, 140, 166];
const steepOf = (skyL) => c01((.38 / Math.max(.01, skyL - .62) - 1.25) / 1.2); // 0 flat … 1 cliff
const rockland = (x, z, h, skyL, sandK) => { // granite where steep (in strata broken by the grain of the rock), sand where flat, the far ridges bluish
  const mot = c01(.5 + .5 * Math.sin(x * .07 + Math.sin(z * .05) * 2) * Math.sin(z * .09 - x * .04)), band = c01(.5 + .5 * Math.sin(6 * crag(x * .5 + 3, z * .5) + z * .02));
  let a = lerp(lerp(SANDD, SAND, mot), lerp(GRANITED, GRANITE, band), Math.max(steepOf(skyL), 1 - sandK));
  const far = smooth(c01((z - 500) / 1400)); if (far > 0) a = lerp(a, FAR, far * .6);
  return a;
};
// ---------- world A: a road out of the hills, rising to the right ----------
const zRoadA = (x) => 25 + 2.2 * Math.sin(x * .06), yRoadA = (x) => .09 * x;
function hA(x, z) {
  const d = z - zRoadA(x);
  return yRoadA(x) + (d > 8 ? smooth(c01((d - 8) / 190)) * (16 + 70 * crag(x * .3 + 11, z * .3)) + .3 * (d - 8) ** .9 * crag(x * .9 + 5, z * .9) : 0) - (d < -3 ? .05 * (-d - 3) ** 1.35 * (.7 + .6 * crag(x + 40, z)) : 0)
    + smooth(c01((z - 240) / 700)) * (150 + 190 * crag(x * .12 + 300, z * .12)) + .04 * Math.sin(x * 1.3 + z * .7) * Math.sin(z * 1.1 - x * .4);
}
const KW = [[-.07, -12, 0], [.172, 17.5, 0]]; // the three walk the road left to right (x along it; z follows the road)
// ---------- world B: the valley of Mina, the ravine of the 'Aqaba, the ledge of the house ----------
const YH = 5.5; // the ledge of the house
const cxB = (z) => 4 + 10 * smooth(c01((z - 40) / 200)), wvB = (z) => 6 + 16 * smooth(c01((z - 30) / 40)) + 110 * smooth(c01((z - 70) / 420)), floorB = (z) => 3.2 * smooth(c01((52 - z) / 40));
function hB(x, z) {
  const d = Math.abs(x - cxB(z)) - wvB(z), sideK = x < cxB(z) ? mix(.3, .55, smooth(c01((z - 50) / 60))) : .55;
  let h = floorB(z) + (d > 0 ? Math.min(sideK * d ** 1.3 * (.75 + .5 * crag(x * .4, z * .4)), 120 + 90 * crag(x * .2 + 50, z * .2)) : 0)
    + smooth(c01((z - 900) / 900)) * (140 + 160 * crag(x * .15 + 300, z * .15)) + .05 * Math.sin(x * 1.3 + z * .7) * Math.sin(z * 1.1 - x * .4);
  const m = smooth(c01((x + 30) / 3)) * smooth(c01((-6 - x) / 3.5)) * smooth(c01((z + 6) / 6)) * smooth(c01((47 - z) / 3)); // the ledge, cut flat
  const yard = x > CY[0] - .5 && x < CY[1] + .5 && z > CY[2] - .5 && z < CY[3] + .5;
  return mix(h, YH + (yard ? 0 : .35 * crag(x * 1.3 + 7, z * 1.3) - .12), m);
}
const CY = [-25, -9, 26, 42], WALLH = 1.1, ROOM = [-25, -20.5, 37.6, 42, 3.0];
const PP = [-22.4, 33.4], HAMZA = [-23.6, 30.4], ABBAS = [-23.9, 36.2], ALI = [-20.2, 38.9];
const GATE = [-9.2, 33.6], BACK = [-14, 42.4];
const PASS = [[-4.0, 38.4], [-1.9, 39.9]]; // Hamza, then 'Ali, standing at the head of the climb from the ravine
const SEATS = []; for (let r = 0; r < 7; r++) for (let k = 0; k < 10; k++) SEATS.push([-18.4 + k * .9 + (r % 2) * .3, 27.7 + r * 2.06]);
SEATS.sort((a, b) => Math.hypot(a[0] - PP[0], (a[1] - PP[1]) * .7) - Math.hypot(b[0] - PP[0], (b[1] - PP[1]) * .7)); // the first to come sit nearest him
const NAQ = [0, 3, 6, 10, 15, 20, 26, 33, 40, 47, 55, 62]; // which of the seventy (by arrival) are named: nine of al-Khazraj, then three of al-Aws
const ARC = NAQ.map((_, k) => { const a = k < 9 ? -1.2 + k * (1.62 / 8) : .82 + (k - 9) * .2; return [PP[0] + 2.7 * Math.cos(a), PP[1] + 4.0 * Math.sin(a)]; });
const PN0 = .676, PNS = .0026; // the light comes to the k-th named man at PN0 + k·PNS

// ---------- light keys: sky top, sky mid, horizon, sun/moon colour, sky light, haze, elevation (deg), azimuth (rad, 0 = ahead, + = right), fog ----------
const LA = [[-.06, [52, 72, 132], [146, 136, 172], [244, 186, 146], [255, 206, 164], [204, 194, 206], [212, 194, 192], 15, -.45, 2400], [.06, [56, 98, 172], [150, 166, 204], [244, 212, 174], [255, 228, 190], [206, 204, 214], [214, 206, 202], 18, -.42, 2800], [.175, [44, 104, 184], [124, 174, 222], [218, 226, 228], [255, 240, 216], [196, 206, 218], [208, 218, 226], 24, -.4, 3200]];
const LB = [[.16, [10, 18, 44], [26, 44, 88], [62, 80, 124], [214, 222, 246], [62, 74, 112], [48, 62, 100], 38, -.55, 1900], [.935, [10, 18, 44], [26, 44, 88], [62, 80, 124], [214, 222, 246], [62, 74, 112], [48, 62, 100], 38, -.55, 1900],
  [.995, [34, 56, 112], [104, 112, 160], [222, 160, 136], [252, 210, 180], [150, 148, 172], [140, 136, 162], 14, -.35, 2400], [1.06, [52, 96, 170], [150, 164, 202], [246, 208, 170], [255, 228, 192], [206, 200, 212], [192, 184, 192], 24, -.3, 2800]];
// camera keys: p, the point it looks at (x, z), its own z, its height, the horizon (fraction of the height)
const CB = [[.16, -2, 50, -10, 17, .42], [.24, -2, 50, -6, 15.5, .39], [.3, -2, 50, -2, 15, .36], [.345, -12, 40, 6, 13, .3], [.39, -16, 34, 11, 12.5, .3], [.47, -17, 34, 13, 12, .3],
  [.6, -17.5, 34, 14.5, 11.5, .3], [.66, -18.5, 33.6, 16, 11, .3], [.712, -18.5, 33.6, 16, 11, .3], [.75, -6, 60, -4, 20, .38], [.795, -10, 46, 4, 15, .34], [.835, -12, 44, 4, 13, .36],
  [.935, -12, 46, 5, 12.5, .36], [.975, -4, 36, 6, 9, .42], [1.06, -1, 30, 6, 8, .44]];

// ---------- silhouettes (u across, v up, metres; facing +u), with the head and the shoulder ----------
const MAN = { pts: [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0], hp: [.01, 1.69], s0: [.05, 1.4] };
const KNEEL = { pts: [-.38, 0, -.4, .16, -.3, .3, -.22, .52, -.2, .8, -.17, .98, -.12, 1.08, -.05, 1.14, .08, 1.12, .13, 1.03, .11, .95, .18, .84, .2, .6, .24, .44, .44, .36, .56, .18, .54, 0], hp: [.03, 1.24], s0: [.05, 1.0] };
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };
const CLOTH = [[150, 128, 98], [120, 100, 78], [96, 86, 74], [170, 146, 110], [104, 92, 98], [132, 104, 76], [112, 86, 64], [140, 118, 92]];
const HEAD = [[168, 148, 116], [140, 118, 90], [122, 106, 86], [176, 152, 110], [150, 124, 92], [132, 112, 86]];
const TENT = [[66, 54, 46], [82, 66, 52], [58, 48, 42], [124, 100, 74], [150, 128, 98], [98, 80, 62]];

S.aqaba = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(7303);
    // ----- A: boulders and thorn scrub along the road; thin clouds at dawn
    st.rocksA = Array.from({ length: 46 }, () => { const x = -60 + R() * 120, z = zRoadA(x) + (R() < .5 ? -1 : 1) * (3.5 + R() ** 1.4 * 30); return [x, z, .25 + R() ** 2 * 1.1, R()]; });
    st.scrubA = Array.from({ length: 60 }, () => { const x = -60 + R() * 120, near = R() < .4, dd = 5 + R() * 26, z = zRoadA(x) + (near ? -(dd + 8) : dd); return [x, z, .4 + R() * .5, R()]; });
    st.streak = Array.from({ length: 7 }, () => [R(), .18 + R() * .5, .2 + R() * .3, R()]);
    // ----- B: the tents of Mina [x, z, w, d, h, cloth, seed]; fires among them [x, z, seed]; people by the fires
    st.tents = []; st.fires = []; st.idle = [];
    for (let i = 0; i < 420 && st.tents.length < 330; i++) {
      const z = 66 + R() ** 1.7 * 820, half = wvB(z) - 4, x = cxB(z) + (R() * 2 - 1) * half;
      if (half < 4) continue;
      st.tents.push([x, z, 3.2 + R() * 3.4, 2.4 + R() * 1.6, 1.5 + R() * .9, TENT[(R() * 6) | 0], R()]);
      if (R() < .3) st.fires.push([x + (R() - .5) * 3, z - 1.6 - R() * 1.4, R()]);
    }
    st.tents.forEach((T) => { T.push(Math.max(0, ...st.fires.map(([fx, fz]) => c01(1 - Math.hypot(fx - T[0], fz - T[1]) / 5.5)))); });
    st.fires.slice(0, 40).forEach(([x, z, k], i) => { if (z < 300) st.idle.push([x + (k < .5 ? -1 : 1) * (.9 + R() * .5), z + (R() - .5) * .6, CLOTH[i % 8], HEAD[i % 6], R()]); });
    st.rocksB = Array.from({ length: 70 }, () => { const z = 18 + R() * 70, sd = R() < .5 ? -1 : 1, x = cxB(z) + sd * (wvB(z) + 1 + R() * 9); return [x, z, .2 + R() ** 2 * .6, R()]; }).filter(([x, z]) => z > 24 && !(x < -6 && x > -29 && z > 22 && z < 46));
    for (let i = 0; i < 40; i++) { const x = -29 + R() * 22, z = 2 + R() * 44; if (x > CY[0] - 1 && x < CY[1] + 1 && z > CY[2] - 1 && z < CY[3] + 1) continue; st.rocksB.push([x, z, .15 + R() ** 2 * .45, R()]); }
    st.stars = Array.from({ length: 900 }, () => [R(), R() ** 1.4, .3 + R() ** 3 * 1.6, R() * 9]);
    st.milky = Array.from({ length: 360 }, () => { const u = R(); return [u, .06 + u * .4 + (R() - .5) * .1 * (1 + R()), .25 + R() * .5, R()]; });
    // the seventy: from the tents, up the ravine, in at the gate, to a seat; [keys in, seat, cloth, head, keys out, out-alpha p]
    st.men = SEATS.map(([sx, sz], k) => {
      const pa = .29 + .155 * k / 69, start = [6 + (R() - .5) * 30, 96 + R() * 60];
      const pts = [start, [6 + (R() - .5) * 3, 64], [1.6 + (R() - .5) * 1.2, 47], [-4.6, 37.2], GATE, [GATE[0] - 1.2, GATE[1]], [sx, sz]];
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const dp = .055 / 110, inK = paced(pa - L * dp, dp, pts);
      return { inK, seat: [sx, sz], cl: CLOTH[(k * 3) % 8], hd: HEAD[(k * 5) % 6], pa, j: R() };
    });
    // the twelve: the light, the rise, the walk to the crescent before him
    NAQ.forEach((m, k) => { const M = st.men[m], pk = PN0 + k * PNS; M.naq = { k, pk, K: [[pk + .0026, ...M.seat], [pk + .011, ...ARC[k]]] }; });
    // everyone out by the back way when he says «تفرّقوا»
    st.men.forEach((M, i) => { const from = M.naq ? ARC[M.naq.k] : M.seat, pl = .79 + .03 * hash(i, 7), end = [-15 - hash(i, 8) * 12, 60 + hash(i, 9) * 18]; M.outK = paced(pl, .02 / 30, [from, [BACK[0] + (hash(i, 3) - .5), BACK[1] - .6], [BACK[0] + (hash(i, 3) - .5), BACK[1] + 1.4], end]); M.pl = pl; });
    // Quraysh with torches: lit among the tents, up the valley to the mouth of the ravine, halted, back
    st.torch = Array.from({ length: 60 }, (_, j) => {
      const z0 = 100 + R() ** .9 * 200, x0 = cxB(z0) + (R() * 2 - 1) * (wvB(z0) - 8), pt = .728 + .028 * R(), hx = 4 + (R() - .5) * 15, hz = 52 + R() * 24, ph = .858 + .012 * R();
      const L = Math.hypot(x0 - hx, z0 - hz), pw = Math.max(pt + .004, ph - L * .0011);
      return { K: [[pw, x0, z0], [ph, hx, hz]], back: [[.904 + .01 * R(), hx, hz], [.95, x0, z0]], pt, cl: CLOTH[(j * 7) % 8], hd: HEAD[(j * 5 + 2) % 6], j: R() };
    });
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    const act = p < .17 ? 0 : 1;
    // ----- the camera -----
    let lx, lz, camZ, camY, hyF;
    if (act === 0) { const w = track(KW, p); st.wx = w.x; lx = w.x + 1.5; lz = zRoadA(w.x); camZ = lz - 13; camY = yRoadA(w.x) + 2.4; hyF = .58; }
    else [lx, lz, camZ, camY, hyF] = keyAt(CB, p);
    if (phone && act) lx += 3.5 * bump(p, .82, .845, .93, .95); // phones: the standoff sits right of the yard; keep both in the narrow frame
    const hy = H * (hyF + (phone ? .14 : 0)), aim = phone ? .5 : .42;
    const camX = lx - (aim - .5) * W / F * (lz - camZ);
    const PX = (x, z) => W / 2 + (x - camX) * F / (z - camZ), PY = (y, z) => hy - (y - camY) * F / (z - camZ);
    const P3 = (x, y, z) => [PX(x, z), PY(y, z)];
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(act ? LB : LA, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const sunSide = Math.sign(sun[0]) || 1, front = c01(-sun[2]), day = c01((elev + 2) / 10), night = act === 1 && p < .95;
    const dawn = act ? fade(p, .935, 1.04) : 0;
    const fogA = (zr) => Math.min(.88, (1 - Math.exp(-zr / fogL)) * .95);
    const fig = (base, zr = 8) => { const k = [0, 1, 2].map((j) => base[j] / 255 * (amb[j] * .7 + sunC[j] * (.3 + .3 * front) * day)); return lerp(k, haze, fogA(zr) * .9); };
    const wall = (base, lam, zr, a = .72) => lerp(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), haze, fogA(zr) * .9);
    const lit = (al, lam, skyL) => al.map((v, j) => v / 255 * (amb[j] * skyL * .7 + sunC[j] * lam * .8));
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };

    // ----- skies -----
    const dawnSky = () => {
      const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      const X = W / 2 + sun[0] / Math.max(.2, sun[2]) * F, Y = hy - Math.max(0, sun[1]) / Math.max(.2, sun[2]) * F;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(X, Y, 0, X, Y, F * 1.1); g.addColorStop(0, rgb(sunC, .3)); g.addColorStop(.2, rgb(sunC, .1)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
      c.globalCompositeOperation = 'source-over';
      st.streak.forEach(([u, v, w, k]) => { const x = ((u * W * 1.4 - camX * 3) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * .2, y = hy - v * hy * .8, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const col = lerp([255, 214, 190], [255, 246, 236], c01(p * 6)); q.addColorStop(0, rgb(col, 0)); q.addColorStop(.5, rgb(col, .42 + .2 * k)); q.addColorStop(1, rgb(col, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 2 + 5 * k, 0, 0, TAU); c.fill(); });
    };
    const nightSky = () => {
      const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      const sa = 1 - dawn;
      c.globalCompositeOperation = 'lighter';
      if (sa > 0) {
        st.milky.forEach(([u, v, s, k]) => { const x = (u * 1.3 - .15) * W - camX * .5, y = v * hy * 1.1, r = s * F * .09; const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(176,188,226,${(.03 + .025 * k) * sa})`); q.addColorStop(1, 'rgba(170,184,226,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, 2 * r, 2 * r); });
        st.stars.forEach(([u, v, m, ph]) => { const x = ((u * W * 1.2 - camX * .8) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, y = v * hy * .98; if (y > hy) return; const a = Math.min(1, m * .5 * (.65 + .35 * Math.sin(t * 1.4 + ph * 7))) * c01((hy - y) / (hy * .25)) * sa; c.fillStyle = `rgba(236,240,255,${a})`; c.fillRect(x, y, m > 1.2 ? 1.8 : 1.1, m > 1.2 ? 1.8 : 1.1); });
        // the moon, gibbous (the twelfth night), drawn lower in the sky than the light it throws so it stays in frame
        const me = .3, ma = -.2, mz = Math.cos(me) * Math.cos(ma), mX = W / 2 + Math.cos(me) * Math.sin(ma) / mz * F, mY = Math.max(H * .07, hy - Math.sin(me) / mz * F), mr = Math.max(9, F * .022);
        const halo = c.createRadialGradient(mX, mY, mr * .8, mX, mY, mr * 9); halo.addColorStop(0, `rgba(210,220,246,${.26 * sa})`); halo.addColorStop(1, 'rgba(210,220,246,0)'); c.fillStyle = halo; c.fillRect(mX - mr * 9, mY - mr * 9, mr * 18, mr * 18);
        c.globalCompositeOperation = 'source-over';
        c.save(); c.globalAlpha = sa; c.fillStyle = '#eef0f6'; c.beginPath(); c.arc(mX, mY, mr, 0, TAU); c.fill();
        c.fillStyle = 'rgba(150,158,186,.5)'; c.beginPath(); c.arc(mX, mY, mr, Math.PI * .5, Math.PI * 1.5); c.ellipse(mX, mY, mr * .62, mr, 0, Math.PI * 1.5, Math.PI * .5, true); c.fill();
        c.fillStyle = 'rgba(160,166,190,.35)'; [[.3, -.25, .22], [-.1, .3, .16], [.15, .1, .12]].forEach(([u, v, r]) => { c.beginPath(); c.arc(mX + u * mr, mY + v * mr, r * mr, 0, TAU); c.fill(); });
        c.restore();
        c.globalCompositeOperation = 'lighter';
      }
      // the glow of the camp over the valley; the dawn at its far end
      const gl = c.createLinearGradient(0, hy - H * .12, 0, hy + 2); gl.addColorStop(0, 'rgba(255,150,90,0)'); gl.addColorStop(1, `rgba(255,150,90,${.07 * (1 - dawn)})`); c.fillStyle = gl; c.fillRect(0, hy - H * .12, W, H * .12 + 2);
      if (dawn > 0) { const X = W / 2 + sun[0] / Math.max(.2, sun[2]) * F, g = c.createRadialGradient(X, hy, 0, X, hy, F * 1.2); g.addColorStop(0, rgb([255, 200, 150], .35 * dawn)); g.addColorStop(.3, rgb([255, 180, 140], .12 * dawn)); g.addColorStop(1, 'rgba(255,180,140,0)'); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4); }
      c.globalCompositeOperation = 'source-over';
    };
    const land = (hgt, col) => {
      const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2.5, z1 = 7000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), z = zr + camZ, fa = fogA(zr), e = Math.max(1.4, zr * .015);
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
    // ----- shadows on the ground, away from the light -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [20, 20, 44], .6), shA = act ? .22 : .3 * day + .1;
    const shadow = (x, z, hm, w, a = .26, y0 = 0) => {
      if (z - camZ < 1) return;
      a *= shA / .4;
      const tx = x + shD[0] * hm, tz = Math.max(camZ + 1.5, z + shD[1] * hm);
      const X0 = PX(x, z), Y0 = PY(y0, z), X1 = PX(tx, tz), Y1 = PY(y0, tz), ww = w * F / (z - camZ);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * .24); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .8)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2; c.beginPath(); c.moveTo(X0 - ww * .5, Y0); c.lineTo(X1 - ww * .25, Y1); c.lineTo(X1 + ww * .25, Y1); c.lineTo(X0 + ww * .5, Y0); c.closePath(); c.fill();
    };
    const quad = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    // a block: its faces toward the camera and its top (y0 its foot)
    const courses = (pts, h, y0, col, n) => { // stone courses on a face: joints along it, staggered uprights
      c.strokeStyle = rgb(lerp(col, [24, 22, 26], .42)); c.lineWidth = 1; c.beginPath();
      for (let r = 1; r <= n; r++) { const u = r / (n + 1), A = P3(pts[0][0], y0 + h * u, pts[0][1]), B = P3(pts[1][0], y0 + h * u, pts[1][1]); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]);
        const m = Math.max(2, Math.round(Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) / .55)); for (let j = 0; j < m; j++) { const f = (j + (r % 2) * .5 + .3 * hash(j, r)) / m; if (f > 1) continue; const Q = P3(mix(pts[0][0], pts[1][0], f), y0 + h * u, mix(pts[0][1], pts[1][1], f)), Q2 = P3(mix(pts[0][0], pts[1][0], f), y0 + h * (u - 1 / (n + 1)), mix(pts[0][1], pts[1][1], f)); c.moveTo(Q[0], Q[1]); c.lineTo(Q2[0], Q2[1]); } }
      c.stroke();
    };
    const slab = (x0, x1, z0, z1, h, alb, key, y0 = 0, a = .72, cn = 0) => {
      const zr = (z0 + z1) / 2 - camZ; if (z1 - camZ < 1.5) return;
      items.push([key ?? zr + (z1 - z0) * .5 - .2, () => {
        const big = cn && F / Math.max(1, zr) > 9;
        if (camX < x0) { const col = wall(alb, Math.max(0, -sun[0]), zr, a); quad([[x0, y0, z0], [x0, y0, z1], [x0, y0 + h, z1], [x0, y0 + h, z0]], rgb(col)); if (big) courses([[x0, z0], [x0, z1]], h, y0, col, cn); }
        if (camX > x1) { const col = wall(alb, Math.max(0, sun[0]), zr, a); quad([[x1, y0, z0], [x1, y0, z1], [x1, y0 + h, z1], [x1, y0 + h, z0]], rgb(col)); if (big) courses([[x1, z0], [x1, z1]], h, y0, col, cn); }
        if (camZ < z0) { const col = wall(alb, Math.max(0, -sun[2]), zr, a * .97); quad([[x0, y0, z0], [x1, y0, z0], [x1, y0 + h, z0], [x0, y0 + h, z0]], rgb(col)); if (big) courses([[x0, z0], [x1, z0]], h, y0, col, cn); }
        if (camY > y0 + h) quad([[x0, y0 + h, z0], [x1, y0 + h, z0], [x1, y0 + h, z1], [x0, y0 + h, z1]], rgb(lerp(wall(alb, Math.max(0, sun[1]), zr, a * 1.15), [255, 246, 226], .08)));
      }]);
    };
    const rock = (x, z, r, k, y0) => {
      const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -60 || X > W + 60) return;
      items.push([zr, () => {
        const s = F / zr, Y = PY(y0, z), col = lerp(lit(lerp(GRANITED, GRANITE, k), .55, 1), haze, fogA(zr) * .8), top = lerp(lit(GRANITE, 1, 1), haze, fogA(zr) * .8);
        c.fillStyle = rgb(shCol, .25); c.beginPath(); c.ellipse(X + r * s * .5, Y, r * s * 1.3, r * s * .22, 0, 0, TAU); c.fill();
        const v = [[-1.05, 0], [-.95, .42 + .2 * hash(k, 1)], [-.45, .8 + .25 * k], [.15, .95 - .2 * hash(k, 2)], [.7, .62 + .2 * hash(k, 3)], [1.05, 0]].map(([u, w]) => [X + u * r * s, Y - w * r * s]);
        c.fillStyle = rgb(col); c.beginPath(); v.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
        c.fillStyle = rgb(top, .55); c.beginPath(); c.moveTo(v[1][0], v[1][1]); c.lineTo(v[2][0], v[2][1]); c.lineTo(v[3][0], v[3][1]); c.lineTo(v[4][0], v[4][1]); c.lineTo(mix(v[3][0], v[4][0], .5), mix(v[3][1], v[4][1], .5) + .25 * r * s); c.lineTo(mix(v[1][0], v[2][0], .5), mix(v[1][1], v[2][1], .5) + .2 * r * s); c.closePath(); c.fill();
      }]);
    };
    const scrub = (x, z, r, k, y0, tone) => {
      const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -30 || X > W + 30) return;
      items.push([zr, () => {
        const s = F / zr, Y = PY(y0, z), col = lerp(lit(tone, .75, 1), haze, fogA(zr) * .8);
        c.fillStyle = rgb(shCol, .2); c.beginPath(); c.ellipse(X + r * s * .4, Y, r * s * 1.4, r * s * .2, 0, 0, TAU); c.fill();
        // a thorn tree: a few bare stems, a flat dark crown
        c.strokeStyle = rgb(col.map((v) => v * .7)); c.lineWidth = Math.max(.6, .06 * r * s); c.beginPath(); for (let j = 0; j < 3; j++) { c.moveTo(X + (j - 1) * .1 * r * s, Y); c.lineTo(X + (j - 1) * .55 * r * s, Y - r * s * (.95 + .1 * hash(j, k))); } c.stroke();
        for (let j = 0; j < 4; j++) { c.fillStyle = rgb(j < 2 ? col.map((v) => v * .78) : col); c.beginPath(); c.ellipse(X + (hash(j, k) - .5) * r * s * 1.2, Y - r * s * (1.0 + .12 * hash(k, j)), r * s * (.6 + .25 * hash(j, 2)), r * s * .17, 0, 0, TAU); c.fill(); }
      }]);
    };
    // ----- figures: a faceless cloaked shape facing dir; arms are hand points in its own units -----
    const person = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2 || (o.alpha ?? 1) <= 0) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -3 * s || X > W + 3 * s) return;
      const Y = PY(o.y0 || 0, z) - (o.bob || 0) * s, dir = o.dir || 1, lean = o.lean || 0, sh = o.shape || MAN;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * dir, -s);
      const dark = fig(lerp(o.cl, [20, 20, 30], .3), zr), lt = fig(lerp(o.cl, [255, 230, 200], .15), zr), ls = dir * sunSide > 0;
      const S0 = [sh.s0[0] + lean * sh.s0[1], sh.s0[1]];
      const arm = (hand, near) => { const el = [(S0[0] + hand[0]) / 2 + .06, (S0[1] + hand[1]) / 2 - .12]; c.beginPath(); tube(c, [S0, el, hand], .15, .1); c.fillStyle = rgb(near ? lerp(dark, lt, .45) : lerp(dark, [10, 10, 16], .2)); c.fill(); c.fillStyle = rgb(fig([200, 184, 160], zr)); c.beginPath(); c.arc(hand[0], hand[1], .05, 0, TAU); c.fill(); };
      (o.arms || []).forEach((h, i) => { if (i === 1) arm(h, false); });
      c.beginPath(); poly(c, sh.pts, lean);
      const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(ls ? dark : lt)); g.addColorStop(.6, rgb(dark)); g.addColorStop(1, rgb(ls ? lt : dark)); c.fillStyle = g; c.fill();
      if (o.rim) { c.strokeStyle = `rgba(255,170,100,${o.rim})`; c.lineWidth = .05; c.stroke(); }
      const hl = lean * sh.hp[1], hx = sh.hp[0] + hl, hv = sh.hp[1];
      c.fillStyle = rgb(fig(o.hd || [150, 128, 98], zr));
      c.beginPath(); c.ellipse(hx, hv, .14, .1, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hx - .07, hv - .11, .05, .11, .3, 0, TAU); c.fill();
      (o.arms || []).forEach((h, i) => { if (i !== 1) arm(h, true); });
      if (o.blade) { const [ax, ay] = o.arms[0]; c.strokeStyle = rgb(lerp(fig([210, 214, 226], zr), [230, 236, 250], .3)); c.lineWidth = .045; c.beginPath(); c.moveTo(ax - .04, ay - .06); c.lineTo(ax + .3, ay + .92); c.stroke(); c.strokeStyle = rgb(fig([90, 70, 50], zr)); c.lineWidth = .07; c.beginPath(); c.moveTo(ax - .1, ay + .02); c.lineTo(ax + .08, ay - .03); c.stroke(); }
      if (o.torch) { const [ax, ay] = o.arms[0]; c.strokeStyle = rgb(fig([96, 70, 46], zr)); c.lineWidth = .05; c.beginPath(); c.moveTo(ax - .02, ay - .18); c.lineTo(ax + .04, ay + .32); c.stroke(); }
      c.restore();
    };
    // a flame in screen space at (X, Y) of size s (px per metre), k its strength: a pool of light, the glow, the tongue
    const flame = (X, Y, s, k, seed, big = 1, hot = false) => {
      const fl = .82 + .18 * Math.sin(t * 9 + seed * 40) * Math.sin(t * 5.3 + seed * 17), R0 = Math.max(hot ? 8 : 6, (hot ? 3.4 : 5.2) * s * big) * fl;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(X, Y - .3 * s, 0, X, Y - .3 * s, R0); g.addColorStop(0, hot ? `rgba(255,170,80,${.4 * k})` : `rgba(255,190,110,${.5 * k})`); g.addColorStop(.22, hot ? `rgba(255,110,40,${.14 * k})` : `rgba(255,140,70,${.2 * k})`); g.addColorStop(1, 'rgba(255,120,60,0)');
      c.fillStyle = g; c.fillRect(X - R0, Y - .3 * s - R0, 2 * R0, 2 * R0);
      const fh = Math.max(1.6, .75 * s * big * fl), fw = Math.max(.9, .22 * s * big);
      c.fillStyle = `rgba(255,214,140,${.9 * Math.min(1, k)})`; c.beginPath(); c.moveTo(X - fw, Y); c.quadraticCurveTo(X - fw * .9, Y - fh * .55, X + Math.sin(t * 7 + seed * 9) * fw * .5, Y - fh); c.quadraticCurveTo(X + fw * .9, Y - fh * .5, X + fw, Y); c.closePath(); c.fill();
      c.restore();
    };
    const label = (x, z, txt, a, dy = 0, y0 = 0) => { // a name under a man's feet
      const zr = z - camZ; if (a <= 0 || zr < 1.5) return;
      const s = F / zr, X = PX(x, z), Y = PY(y0, z) + Math.max(14, .42 * s) + dy;
      c.save(); c.globalAlpha = a; c.direction = 'rtl'; c.textAlign = 'center'; c.font = `${Math.max(12, Math.min(19, .3 * s))}px ${FONT.naskh}`;
      c.fillStyle = 'rgba(10,12,22,.55)'; const w = c.measureText(txt).width; c.fillRect(X - w / 2 - 6, Y - 13, w + 12, 20);
      c.fillStyle = 'rgba(255,244,214,.96)'; c.fillText(txt, X, Y + 2); c.restore();
    };
    const holy = (who, x, z, o, y0 = 0) => { // the Prophet and 'Ali: Holy.draw only
      const zr = z - camZ; if (zr < 1.2) return null;
      const X = PX(x, z), Y = PY(y0, z), h = 1.8 * F / zr;
      const hd = Holy.draw(c, { who, x: X, y: Y, h, t, ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; return hd;
    };
    const walkO = (tr, ph) => (tr.walk ? { lean: Math.sin(ph) * .03, bob: Math.abs(Math.sin(ph)) * .03 } : { lean: 0, bob: 0 });

    if (act === 0) {
      // ======================= A: first light on the road toward Yathrib =======================
      dawnSky();
      land(hA, (x, z, h, zr, lam, skyL) => {
        const d = z - zRoadA(x);
        if (Math.abs(d) < 2.4) return lit(lerp(TRACK, SAND, .35 + .3 * c01(.5 + .5 * Math.sin(x * 2.1) * Math.sin(z * .9))), lam, skyL);
        return lit(rockland(x, z, h, skyL, d > 3 ? .25 : .8), lam, skyL);
      });
      st.rocksA.forEach(([x, z, r, k]) => rock(x, z, r, k, hA(x, z) - .05));
      st.scrubA.forEach(([x, z, r, k]) => scrub(x, z, r, k, hA(x, z), [82, 80, 56]));
      // the three: As'ad b. Zurara, Mus'ab b. 'Umayr between them, Dhakwan
      const w = track(KW, p);
      [[-.9, .5, [118, 92, 66], [160, 134, 98]], [1.0, -.1, [146, 124, 92], [182, 160, 120]], [2.8, .7, [98, 84, 72], [140, 118, 88]]].forEach(([dx, dz, cl, hd], i) => {
        const x = w.x + dx, z = zRoadA(x) + dz, y0 = hA(x, z), ww = walkO({ walk: p > -.07 && p < .172 }, p * 260 + i * 1.7);
        shadow(x, z, 1.8, .5, .26, y0);
        items.push([z - camZ, () => person(x, z, { dir: 1, cl, hd, ...ww, y0, sc: i === 1 ? .96 : 1, arms: i === 0 ? [[.32, .62]] : undefined })]);
      });
      { const x = w.x + 1.0, z = zRoadA(x) - .1; items.push([z - camZ - 2, () => { label(x, z, 'مصعب بن عمير', bump(p, -.03, .0, .05, .07), 0, hA(x, z)); label(w.x - .9, z + .6, 'أسعد بن زرارة', bump(p, .075, .09, .11, .122), 0, hA(w.x - .9, z)); label(w.x + 2.8, z + .8, 'ذكوان', bump(p, .075, .09, .11, .122), 0, hA(w.x + 2.8, z)); }]); }
      draw();
    } else {
      // ======================= B: the night at Mina; the dawn after =======================
      nightSky();
      land(hB, (x, z, h, zr, lam, skyL) => {
        const d = Math.abs(x - cxB(z)) - wvB(z);
        const ledge = x > -27 && x < -8 && z > 24 && z < 44;
        const base = ledge ? lerp(SANDD, [188, 168, 136], .5) : rockland(x, z, h, skyL, d < 0 ? 1 : c01(1 - d / 6));
        return lit(base, lam, skyL).map((v, j) => v + [2, 4, 10][j] * (1 - dawn));
      });
      const fireK = (1 + .7 * bump(p, .726, .738, .77, .8)) * (1 - .75 * dawn);
      // the track up from the valley, past the cairn, to the ledge
      { const pts = [[6, 70], [5, 58], [1.6, 47], [-1.2, 41.5], [-4.6, 37.2], [GATE[0], GATE[1]]], L = [], Rr = [];
        for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++) { const u = k / 8, x = mix(pts[i][0], pts[i + 1][0], u), z = mix(pts[i][1], pts[i + 1][1], u); if (z - camZ < 1.5) continue; L.push(P3(x - .9, hB(x - .9, z) + .02, z)); Rr.push(P3(x + .9, hB(x + .9, z) + .02, z)); }
        if (L.length > 1) { c.fillStyle = rgb(lit(TRACK, .7, 1), .32); c.beginPath(); L.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = Rr.length - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath(); c.fill(); } }
      st.rocksB.forEach(([x, z, r, k]) => rock(x, z, r, k, hB(x, z) - .05));
      // the cairn of the Jamra in the ravine
      { const x = 7.2, z = 41.5, zr = z - camZ; if (zr > 1.5) items.push([zr, () => { const s = F / zr, X = PX(x, z), Y = PY(hB(x, z), z), col = lit([150, 136, 118], .6, 1);
        c.fillStyle = rgb(col); c.beginPath(); c.ellipse(X, Y, 1.3 * s, .55 * s, 0, Math.PI, TAU); c.fill();
        for (let j = 0; j < 26; j++) { const a = hash(j, 4) * Math.PI, r = Math.sqrt(hash(j, 5)); c.fillStyle = rgb(lerp(col, [230, 224, 214], hash(j, 6) * .5)); c.beginPath(); c.arc(X + Math.cos(a) * r * 1.2 * s, Y - Math.sin(a) * r * .5 * s, Math.max(.6, .08 * s), 0, TAU); c.fill(); } }]); }
      // the tents: a low cloth roof on poles, its face to the camera; fires before some of them
      st.tents.forEach(([x, z, w, d, h, cl, k, warm]) => {
        const zr = z - camZ; if (zr < 3) return; const X0 = PX(x - w / 2, z), X1 = PX(x + w / 2, z); if (X1 < -20 || X0 > W + 20) return;
        items.push([zr + d * .5, () => {
          const y0 = hB(x, z), s = F / zr, fz = fogA(zr) * .9, roof = lerp(lit(cl, Math.max(0, sun[1]) * day + .1, 1.1), haze, fz), face = lerp(lerp(lit(cl, Math.max(0, -sun[2]) * .5 * day, .8), lerp(cl, [255, 170, 100], .35), warm * .55 * Math.min(1, fireK)), haze, fz);
          if (s < 1.4) { c.fillStyle = rgb(face); c.fillRect(X0, PY(y0 + h * .8, z), X1 - X0, Math.max(1, h * .8 * s)); c.fillStyle = rgb(roof); c.fillRect(X0, PY(y0 + h * .8, z) - 1, X1 - X0, 1); return; }
          const top = (zz) => [P3(x - w / 2, y0 + h * .55, zz), P3(x - w / 4, y0 + h * .95, zz), P3(x, y0 + h * .82, zz), P3(x + w / 4, y0 + h * .95, zz), P3(x + w / 2, y0 + h * .55, zz)];
          const Ft = top(z), Bt = top(z + d);
          if (camY > y0 + h) { c.fillStyle = rgb(roof); c.beginPath(); Ft.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = Bt.length - 1; i >= 0; i--) c.lineTo(Bt[i][0], Bt[i][1]); c.closePath(); c.fill(); }
          c.fillStyle = rgb(face); c.beginPath(); c.moveTo(X0, PY(y0, z)); Ft.forEach((q) => c.lineTo(q[0], q[1])); c.lineTo(X1, PY(y0, z)); c.closePath(); c.fill();
          if (k < .45) { const dx = X0 + (X1 - X0) * (.32 + k * .5), dw = (X1 - X0) * .18; c.fillStyle = rgb(lerp(face, [255, 150, 80], .28 * fireK), .9); c.fillRect(dx, PY(y0 + h * .55, z), dw, PY(y0, z) - PY(y0 + h * .55, z)); }
          c.strokeStyle = rgb(lerp(roof, [255, 250, 240], .12)); c.lineWidth = Math.max(.6, .04 * s); c.beginPath(); Ft.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke();
        }]);
      });
      st.fires.forEach(([x, z, k]) => { const zr = z - camZ; if (zr < 2) return; const X = PX(x, z); if (X < -60 || X > W + 60) return; items.push([zr - .01, () => flame(X, PY(hB(x, z), z), F / zr, fireK * (.75 + .25 * k), k)]); });
      // people up by their fires; at the cry they turn toward the 'Aqaba
      st.idle.forEach(([x, z, cl, hd, k], i) => { const zr = z - camZ; if (zr < 2) return; const turn = p > .73 + .01 * k; items.push([zr, () => person(x, z, { cl, hd, y0: hB(x, z), dir: turn ? toward(x, 4) * (x > 4 ? 1 : -1) : k < .5 ? 1 : -1, rim: .35 * fireK, alpha: 1 - dawn })]); });
      // ----- the house of 'Abd al-Muttalib: a walled yard on the ledge, a room at its back corner -----
      const [cx0, cx1, cz0, cz1] = CY, alb = [206, 176, 138];
      items.push([cz1 - camZ + 6, () => {
        quad([[cx0, YH + .01, cz0], [cx1, YH + .01, cz0], [cx1, YH + .01, cz1], [cx0, YH + .01, cz1]], rgb(lit([196, 168, 128], Math.max(0, sun[1]) * .8, 1)));
        if (F / (cz0 - camZ) > 8) { c.fillStyle = rgb(lit([120, 100, 80], .5, 1), .35); for (let j = 0; j < 90; j++) { const q = P3(mix(cx0 + .5, cx1 - .5, hash(j, 11)), YH + .02, mix(cz0 + .5, cz1 - .5, hash(j, 12))), r = (.04 + .08 * hash(j, 13)) * F / (mix(cz0, cz1, hash(j, 12)) - camZ); c.beginPath(); c.ellipse(q[0], q[1], r * 1.6, r * .6, 0, 0, TAU); c.fill(); } }
      }]);
      slab(cx0, cx0 + .4, cz0, cz1, WALLH, alb, cz1 - camZ + 4, YH, .72, 2);
      slab(cx0, BACK[0] - 1, cz1 - .4, cz1, WALLH, alb, cz1 - camZ + 3, YH, .72, 2); slab(BACK[0] + 1, cx1, cz1 - .4, cz1, WALLH, alb, cz1 - camZ + 3, YH, .72, 2);
      slab(ROOM[0], ROOM[1], ROOM[2], ROOM[3], ROOM[4], [204, 178, 140], cz1 - camZ + 2, YH, .74, 5);
      slab(ROOM[0] - .1, ROOM[1] + .1, ROOM[2] - .1, ROOM[3] + .1, .32, [214, 188, 150], cz1 - camZ + 1.95, YH + ROOM[4], .74); // the parapet
      { const zr = ROOM[2] - camZ; if (zr > 2) items.push([cz1 - camZ + 1.92, () => { const s = F / zr; if (s < 8) return; c.fillStyle = rgb(wall([96, 70, 46], .4, zr, .7)); for (let j = 0; j < 6; j++) { const q = P3(mix(ROOM[0] + .3, ROOM[1] - .3, j / 5), YH + ROOM[4] - .18, ROOM[2] - .02); c.fillRect(q[0] - .07 * s, q[1] - .07 * s, .14 * s, .14 * s); } }]); }
      { const zr = (ROOM[2] + ROOM[3]) / 2 - camZ; if (zr > 2 && camX > ROOM[1]) items.push([cz1 - camZ + 1.9, () => { // the lamp in the doorway, its light on the yard
        const a = P3(ROOM[1], YH, 38.8), b = P3(ROOM[1], YH, 40.2), a2 = P3(ROOM[1], YH + 2, 38.8), b2 = P3(ROOM[1], YH + 2, 40.2), fl = .9 + .1 * Math.sin(t * 6.1);
        c.fillStyle = rgb(lerp([60, 40, 26], [255, 196, 120], .75 * fl)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(b2[0], b2[1]); c.lineTo(a2[0], a2[1]); c.closePath(); c.fill();
        const q = P3(ROOM[1] + 1.8, YH, 39.5), s = F / zr; c.save(); c.globalCompositeOperation = 'lighter'; c.translate(q[0], q[1]); c.scale(1, .32); const g = c.createRadialGradient(0, 0, 0, 0, 0, 4.5 * s); g.addColorStop(0, `rgba(255,170,90,${.22 * fl * (1 - dawn * .6)})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-4.5 * s, -4.5 * s, 9 * s, 9 * s); c.restore(); }]); }
      // the side wall toward the ravine, with its gate: behind the yard when seen from inside, in front of it from outside
      { const kR = camX > cx1 ? cz0 - camZ + .05 : cz1 - camZ + 3.5; slab(cx1 - .4, cx1, cz0, GATE[1] - 1, WALLH, alb, kR, YH, .72, 2); slab(cx1 - .4, cx1, GATE[1] + 1, cz1, WALLH, alb, kR, YH, .72, 2); }
      slab(cx0, cx1, cz0, cz0 + .4, WALLH * .8, alb, cz0 - camZ - .05, YH, .72, 1); // the near wall, low
      // ----- the seventy -----
      const raise = (j) => bump(p, .584 + .008 * j, .592 + .008 * j, .606, .618);
      const prophetSpeaks = bump(p, .4, .41, .43, .44) + bump(p, .508, .518, .53, .538) + bump(p, .622, .63, .642, .65);
      let pointAt = null;
      st.men.forEach((M, i) => {
        const seated = p >= M.pa, out = p >= M.pl, walkIn = !seated && p >= M.inK[0][0];
        let x, z, o = { cl: M.cl, hd: M.hd };
        if (!seated && !walkIn) return;
        if (out) { // out by the back way, gone into the dark
          const tr = track(M.outK, p); x = tr.x; z = tr.z; Object.assign(o, walkO(tr, p * 300 + i), { dir: toward(0, tr.dx || -1), alpha: 1 - fade(p, M.outK[2][0], M.outK[3][0]) });
        } else if (walkIn) {
          const tr = track(M.inK, p); x = tr.x; z = tr.z; Object.assign(o, walkO(tr, p * 300 + i), { dir: toward(0, tr.dx || -1) });
        } else if (M.naq && p >= M.naq.pk + .0008) { // one of the twelve: up, and over to stand before him
          const N = M.naq, up = fade(p, N.pk + .0008, N.pk + .0026), tr = track(N.K, p); x = tr.x; z = tr.z;
          if (up < 1) { const y0 = hB(x, z); items.push([z - camZ, () => person(x, z, { ...o, shape: KNEEL, dir: -1, y0, alpha: 1 - up })]); }
          Object.assign(o, walkO(tr, p * 300 + i), { dir: tr.walk ? toward(0, tr.dx) : -1, alpha: up });
        } else { // seated, facing him; the hands go up together at «قد رضينا»
          [x, z] = M.seat; o.shape = KNEEL; o.dir = -1; o.sc = .92; const r = raise(M.j);
          if (r > .01) o.arms = [lerp([.3, .7], [.22, 1.86], r)];
        }
        const y0 = hB(x, z);
        if (o.shape !== KNEEL) shadow(x, z, 1.7, .42, .2, y0);
        items.push([z - camZ, () => person(x, z, { ...o, y0 })]);
        // the light: a shaft from above onto the one named, then gone
        if (M.naq) { const N = M.naq, L0 = bump(p, N.pk - .0016, N.pk - .0002, N.pk + .0009, N.pk + .0024); if (L0 > .01) { pointAt = M.seat; const [lx0, lz0] = M.seat; items.push([lz0 - camZ - .02, () => {
          const zr = lz0 - camZ, s = F / zr, X = PX(lx0, lz0), Yb = PY(YH + .2, lz0), Yt = PY(YH + 7, lz0);
          c.save(); c.globalCompositeOperation = 'lighter';
          const g = c.createLinearGradient(0, Yt, 0, Yb); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.6, `rgba(255,240,200,${.13 * L0})`); g.addColorStop(1, `rgba(255,244,214,${.3 * L0})`);
          c.fillStyle = g; c.beginPath(); c.moveTo(X - .3 * s, Yt); c.lineTo(X + .3 * s, Yt); c.lineTo(X + .7 * s, Yb); c.lineTo(X - .7 * s, Yb); c.closePath(); c.fill();
          c.translate(X, Yb); c.scale(1, .3); const q = c.createRadialGradient(0, 0, 0, 0, 0, 1.4 * s); q.addColorStop(0, `rgba(255,244,214,${.34 * L0})`); q.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = q; c.fillRect(-1.4 * s, -1.4 * s, 2.8 * s, 2.8 * s); c.restore(); }]); } }
      });
      // ----- Hamza, al-'Abbas, 'Ali; then Hamza and 'Ali down to the pass with their swords, and back at dawn -----
      const DOWN = (from, to, p0) => paced(p0, .02 / 30, [from, [GATE[0] - 1.4, GATE[1]], GATE, to]);
      const kH = [...DOWN(HAMZA, PASS[0], .846), [.955, ...PASS[0]], [1.03, 2.4, 23.5]], kL = [...DOWN(ALI, PASS[1], .849), [.958, ...PASS[1]], [1.03, 4.4, 25.2]];
      const KP = paced(.962, .07 / 30, [PP, [GATE[0] - 1.4, GATE[1]], GATE, [-4.6, 37.2], [-.6, 33], [2.4, 21.5]]), KAb = paced(.97, .07 / 30, [ABBAS, [GATE[0] - 1.4, GATE[1] + .6], GATE, [-4.6, 37.2], [-1.2, 34], [.8, 24]]);
      { const tr = track(kH, p), armed = p > .842, x = tr.x, z = tr.z, y0 = hB(x, z), stand = p > .87 && p < .955 ? bump(p, .875, .885, .9, .91) : 0;
        shadow(x, z, 1.8, .45, .22, y0);
        items.push([z - camZ, () => person(x, z, { cl: [104, 70, 50], hd: [150, 122, 88], y0, dir: tr.walk ? toward(0, tr.dx) : 1, ...walkO(tr, p * 280), arms: armed ? [lerp([.36, .9], [.42, 1.36], stand)] : undefined, blade: armed, sc: 1.04 })]);
        label(x, z, 'حمزة', bump(p, .345, .355, .372, .382) + bump(p, .86, .87, .9, .91), 0, y0); }
      { const tr = track(KAb, p), x = tr.x, z = tr.z, y0 = hB(x, z); shadow(x, z, 1.8, .45, .22, y0); items.push([z - camZ, () => { person(x, z, { cl: [86, 74, 66], hd: [136, 116, 92], y0, dir: tr.walk ? toward(0, tr.dx) : 1, ...walkO(tr, p * 280 + 1) }); label(x, z, 'العبّاس', bump(p, .345, .355, .372, .382), 0, y0); }]); }
      { const tr = track(kL, p), x = tr.x, z = tr.z, y0 = hB(x, z); shadow(x, z, 1.8, .5, .22, y0);
        items.push([z - camZ, () => { holy('ali', x, z, { pose: tr.walk ? 'walk' : 'stand', phase: tr.d / 1.4, amb: .3 + .6 * dawn, glow: .4, sword: p > .842, plain: true }, y0); label(x, z, 'عليّ', bump(p, .345, .355, .372, .382) + bump(p, .86, .87, .9, .91), 0, y0); }]); }
      // ----- the Prophet: standing in the yard; his sleeve out as he speaks, toward each of the twelve as they are named -----
      { const tr = track(KP, p), x = tr.x, z = tr.z, y0 = hB(x, z);
        let arms; if (pointAt) arms = [[pointAt[0] > x ? .3 : -.3, -.58]]; else if (prophetSpeaks > .01) arms = [lerp([.12, -.42], [.34, -.64], Math.min(1, prophetSpeaks))];
        shadow(x, z, 1.8, .55, .22, y0);
        items.push([z - camZ - .01, () => { const hd = holy('prophet', x, z, { pose: tr.walk ? 'walk' : 'stand', phase: tr.d / 1.5, amb: .32 + .6 * dawn, glow: .55 - .3 * dawn, arms }, y0);
          if (hd && night) { c.save(); c.globalCompositeOperation = 'lighter'; const R0 = hd.h * 1.2, g = c.createRadialGradient(hd.x, hd.y + hd.h * .3, 0, hd.x, hd.y + hd.h * .3, R0); g.addColorStop(0, 'rgba(255,226,170,.1)'); g.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = g; c.fillRect(hd.x - R0, hd.y + hd.h * .3 - R0, 2 * R0, 2 * R0); c.restore(); } }]); }
      // ----- Quraysh: torches through the tents, up to the mouth of the ravine, halted, back -----
      st.torch.forEach((T, j) => {
        if (p < T.pt || p > .95) return;
        const back = p > T.back[0][0], tr = back ? track(T.back, p) : track(T.K, p), x = tr.x, z = tr.z, zr = z - camZ; if (zr < 2) return;
        const lit0 = fade(p, T.pt, T.pt + .004) * (1 - fade(p, .935, .95)), y0 = hB(x, z), arms = [[.3, 1.72 + .06 * Math.sin(j)]];
        items.push([zr, () => { person(x, z, { cl: T.cl, hd: T.hd, y0, dir: back ? toward(0, tr.dx) : tr.walk ? toward(0, tr.dx || -1) : toward(x, PASS[0][0]), ...walkO(tr, p * 300 + j), arms, torch: true, rim: .5 * lit0, alpha: lit0 });
          const s = F / zr, hx = x + (back ? toward(0, tr.dx) : tr.walk ? toward(0, tr.dx || -1) : toward(x, PASS[0][0])) * .34; flame(PX(hx, z), PY(y0 + 2.04, z), s, 1.2 * lit0, T.j, .7, true); }]);
      });
      draw();
    }
    // ----- grade: the edges close in a little; the dip to black between the worlds -----
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(8,10,24,0)'); vg.addColorStop(1, `rgba(8,10,24,${night ? .36 : .24})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    const dip = Math.max(...DIPS.map((d) => bump(p, ...d)));
    if (dip > 0) { c.fillStyle = `rgba(6,8,14,${dip})`; c.fillRect(0, 0, W, H); }
  },
};
})();
