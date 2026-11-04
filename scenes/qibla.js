(() => {
// qibla — «تحويل القبلة» (Tafsir al-Qummi 1:63; al-Kafi 3:286; Man La Yahduruhu al-Faqih 1:275).
// One world in metres under a pinhole camera keyed on p: x runs north (screen right: the camera looks west), y up,
// z west (away). The mosque of Bani Salim: a walled yard of packed earth, a frond roof on palm trunks along its north
// wall, houses and palms of the oasis around it, the black lava ridges of the harra far to the west.
//   p −.05 → .165  night: he stands outside the yard and looks at the sky, from one place to another (Qummi 1:63)
//      .165 → .245 the night ends, the day comes up behind the camera; he walks in to the north end; the men and then
//                  the women come in at the gate and stand in rows behind him, facing north (Bayt al-Maqdis)
//      .25 → .455  the second rak'a of the noon prayer toward the north: ruku', the prostration; the sitting, the
//                  second prostration and the tashahhud pass in a dip to black (.336–.374: Holy.draw has no prayer
//                  sitting), and they are standing when it lifts (shadows fall north, the way they face; a small
//                  dial, bottom left, points to Bayt al-Maqdis)
//      .47 → .585  the third rak'a begins; a shaft of light comes down on him and takes his upper arms (Jibril is
//                  light only)
//      .585 → .75  the turn: the whole congregation swings round its middle like one body, half a circle, so that he
//                  stands at the south end, the men's rows where the women were and the women's where the men were
//                  (al-Faqih 1:275); the light leads him; the dial swings to the Ka'ba
//      .77 → .92   the third rak'a toward the Ka'ba, into the sun: ruku', the prostration, a dip (.836–.874), up
//      .9 → 1.05   the camera rises over the oasis: the mosque small among the palms, the rows facing south (the
//                  fourth rak'a: «ركعتين إلى الكعبة», Qummi 1:63)
// The Prophet is drawn only by Holy.draw (veiled, the gold disc); everyone else is a faceless cloaked shape with an
// earth-toned head cloth (the women in a mantle). Everything follows from p; t moves only cloth, stars and light.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const fade = (p, a, b) => smooth(seg(p, a, b));
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
  if (p <= K[0][0]) return { x: K[0][1], z: K[0][2], walk: false, d: 0, dx: 0 };
  let d = 0;
  for (let i = 1; i < K.length; i++) {
    const [p0, x0, z0] = K[i - 1], [p1, x1, z1] = K[i], L = Math.hypot(x1 - x0, z1 - z0);
    if (p < p1) { const k = (p - p0) / (p1 - p0), e = L === 0 ? 0 : k < .12 ? k * k / .24 : k > .88 ? 1 - (1 - k) ** 2 / .24 : (k - .06) / .88; return { x: mix(x0, x1, e), z: mix(z0, z1, e), walk: L > 0 && k > .01 && k < .99, d: d + L * e, dx: x1 - x0, dz: z1 - z0 }; }
    d += L;
  }
  const E = K[K.length - 1];
  return { x: E[1], z: E[2], walk: false, d, dx: 0, dz: 0 };
}
const paced = (p0, dp, pts) => { const K = [[p0, ...pts[0]]]; let q = p0; for (let i = 1; i < pts.length; i++) { q += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * dp; K.push([q, ...pts[i]]); } return K; };

// ---------- the land: the flat oasis, a low hill to the north-west, the harra ridges, far mountains ----------
function crag(x, z) {
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
const harraK = (z) => smooth(c01((z - 420) / 520));
function hQ(x, z) {
  return .05 * Math.sin(x * .9 + z * .5) * Math.sin(z * .7 - x * .3)
    + harraK(z) * (14 + 44 * crag(x * .03 + 7, z * .03))
    + 90 * Math.exp(-((x - 760) ** 2 + (z - 1150) ** 2) / (2 * 300 ** 2)) * (.7 + .5 * crag(x * .05, z * .05))
    + smooth(c01((z - 2200) / 1800)) * (180 + 300 * crag(x * .004 + 3, z * .004));
}
const SAND = [222, 202, 160], EARTH = [196, 170, 128], GROVE = [146, 150, 96], FIELD = [124, 150, 74], BASALT = [78, 66, 62], RED = [150, 104, 84], FARC = [150, 156, 184];
function groundCol(x, z, h) {
  const n = c01(.5 + .5 * Math.sin(x * .13 + Math.sin(z * .11) * 2) * Math.sin(z * .17 - x * .05));
  if (z < 40 && Math.abs(x - 4) < 45) { const m = c01(.5 + .5 * Math.sin(x * .9 + Math.sin(z * .7) * 1.5) * Math.sin(z * 1.1 - x * .4)), d = c01(.5 + .5 * Math.sin(x * .31 - z * .23 + Math.sin(x * .17) * 2)); return lerp(lerp(SAND, EARTH, .25 + .45 * n), [132, 110, 86], .5 * m * d); }
  const green = c01(1 - harraK(z) * 1.6) * c01((z - 25) / 40) * (.45 + .55 * c01(.5 + .5 * Math.sin(x * .05) * Math.sin(z * .04 + 1)));
  let a = lerp(lerp(EARTH, SAND, n), lerp(GROVE, FIELD, n), green);
  a = lerp(a, lerp(BASALT, [104, 86, 74], n * .6), harraK(z) * .9);
  const hill = Math.exp(-((x - 760) ** 2 + (z - 1150) ** 2) / (2 * 300 ** 2)); if (hill > .05) a = lerp(a, RED, c01(hill * 1.6));
  const far = smooth(c01((z - 1800) / 2600)); if (far > 0) a = lerp(a, lerp(RED, FARC, .6), far);
  return a;
};

// ---------- the mosque and the people ----------
const CY = [-4.4, 13.8, -6, 15.6], WALLH = 1.3, GATE = [2.2, 4.2]; // the yard inside its walls (x0, x1, z0, z1); the gate in the east wall
const AR = [11.3, 13.8, -5.4, 15.3, 3.05]; // the frond roof along the north wall: x0, x1, z0, z1, height
const PP = [9.0, 7.75], C0 = [4.7, 7.75]; // his place at the north end; the middle of the congregation, round which it turns
// rows: [x, how many, woman?]; each row runs east–west (along z) behind him
const ROWS = [[7.6, 9, 0], [6.4, 9, 0], [5.2, 9, 0], [4.0, 9, 0], [1.6, 8, 1], [.4, 8, 1]];
const rot = (q, th) => { const dx = q[0] - C0[0], dz = q[1] - C0[1], c = Math.cos(th), s = Math.sin(th); return [C0[0] + dx * c + dz * s, C0[1] + dz * c - dx * s]; };
// the prayer: [p0, p1, from, to]; the imam's timing (the rows follow a moment later)
const PRAY = [ // his sitting is never shown (Holy.draw has only a cross-legged sit): the jalsa, the second prostration
  // and the tashahhud pass inside a dip to black (DIPS), and the picture comes back on the standing
  [.262, .272, 'stand', 'ruku'], [.29, .298, 'ruku', 'stand'], [.308, .32, 'stand', 'sujud'], [.349, .351, 'sujud', 'stand'],
  [.772, .782, 'stand', 'ruku'], [.796, .804, 'ruku', 'stand'], [.814, .826, 'stand', 'sujud'], [.849, .851, 'sujud', 'stand'],
  [.93, .94, 'stand', 'ruku'], [.955, .963, 'ruku', 'stand'], [.975, .987, 'stand', 'sujud']];
const DIPS = [[.336, .346, .362, .374], [.836, .846, .862, .874]]; // long enough for the last rows, who follow a moment late
function poseAt(p) { let a = 'stand', b = 'stand', k = 0; for (const [p0, p1, f, t] of PRAY) { if (p < p0) break; if (p < p1) { a = f; b = t; k = smooth((p - p0) / (p1 - p0)); break; } a = b = t; k = 0; } return [a, b, k]; }
const TURN = [.585, .745], theta = (p, lag = 0) => Math.PI * ease.io(seg(p, TURN[0] + lag, TURN[1] + lag));
// one outline in five poses, the same 16 points in the same order (back hem → back → head → front → front hem), so
// one pose flows into the next; facing +u, metres; with the head-cloth centre
const SH = {
  stand: [-.3, 0, -.22, .4, -.18, .85, -.19, 1.1, -.18, 1.33, -.1, 1.46, -.07, 1.6, .05, 1.72, .15, 1.62, .12, 1.49, .17, 1.37, .19, 1.05, .16, .7, .17, .32, .22, 0, 0, .02],
  ruku: [-.22, 0, -.2, .5, -.17, .92, 0, 1.07, .3, 1.1, .5, 1.08, .6, 1.08, .76, 1.04, .78, .94, .62, .88, .45, .85, .25, .62, .16, .5, .12, .25, .2, 0, 0, .02],
  sujud: [-.4, 0, -.34, .18, -.24, .45, -.08, .6, .22, .5, .42, .36, .52, .28, .66, .2, .72, .05, .6, .02, .48, .06, .35, .04, .2, .03, .1, .01, 0, 0, -.2, 0],
  front: [-.3, 0, -.25, .45, -.24, .9, -.25, 1.15, -.25, 1.38, -.16, 1.5, -.1, 1.6, 0, 1.75, .1, 1.6, .16, 1.5, .25, 1.38, .25, 1.15, .24, .9, .25, .45, .3, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], ruku: [.67, .99], sujud: [.6, .17], front: [0, 1.6] };
// the near arm (a sleeve line): shoulder, hand
const ARM = { stand: [.01, 1.36, .07, .78], ruku: [.46, 1.0, .2, .56], sujud: [.4, .36, .56, .04], front: [.18, 1.38, .21, .8] };
const MCL = [[120, 96, 70], [96, 80, 64], [86, 74, 66], [134, 108, 78], [104, 86, 70], [112, 92, 68], [80, 70, 60], [128, 104, 80], [74, 74, 90], [98, 96, 66]];
const MHD = [[150, 116, 74], [128, 90, 60], [138, 122, 88], [112, 94, 68], [158, 128, 88], [118, 82, 58], [100, 104, 76]];
const WCL = [[64, 52, 46], [74, 60, 50], [58, 50, 48], [82, 64, 52], [66, 58, 56]];
const WMN = [[96, 72, 54], [82, 64, 56], [108, 82, 60], [72, 62, 60], [100, 78, 62]];
const HOUSE = [[206, 178, 136], [196, 166, 124], [214, 188, 148], [190, 160, 120]];

// light keys: sky top, sky mid, horizon, sun colour (at night the sky's own light, from behind), ambient, haze, elevation (deg), azimuth
// (rad; 0 = ahead/west, + = right/north, −π/2 = south), fog distance
const LQ = [[-.06, [12, 14, 52], [38, 32, 98], [104, 70, 124], [124, 146, 222], [62, 72, 150], [62, 54, 122], 48, 2.3, 1400], [.15, [12, 14, 52], [38, 32, 98], [104, 70, 124], [124, 146, 222], [62, 72, 150], [62, 54, 122], 48, 2.3, 1400],
  [.18, [42, 50, 116], [128, 104, 156], [240, 176, 164], [255, 196, 156], [156, 144, 174], [176, 152, 174], 4, 3.0, 1900],
  [.21, [58, 124, 204], [142, 188, 232], [228, 230, 232], [255, 236, 206], [194, 200, 218], [208, 214, 226], 34, -2.5, 2600],
  [.245, [36, 108, 202], [118, 178, 236], [218, 230, 240], [255, 248, 230], [200, 210, 228], [210, 220, 234], 56, -1.45, 3200], [1.06, [36, 108, 202], [118, 178, 236], [218, 230, 240], [255, 248, 230], [200, 210, 228], [210, 220, 234], 56, -1.45, 3200]];
// camera keys: p, the point it looks at (x, z), its own z, its height, the horizon (fraction of the height)
const CQ = [[-.06, 5.5, -4, -25, 1.7, .66], [.07, 6.5, -4, -24, 1.75, .65], [.15, 7.5, -4, -23.5, 1.8, .64], [.2, 5, 0, -17, 5, .38], [.245, 6.03, 7.75, -4.5, 3, .41],
  [.44, 6.03, 7.75, -4.3, 3, .41], [.5, 7.6, 7.75, -.5, 2.6, .42], [.575, 7.6, 7.75, -.9, 2.7, .42], [.625, 4.7, 7.5, -8, 7.5, .28], [.75, 4.7, 7.5, -8, 7.5, .28],
  [.8, .23, 7.75, -4.5, 3, .41], [.89, .3, 7.75, -4.8, 3.1, .41], [.965, 4, 16, -60, 34, .25], [1.06, 4, 18, -72, 42, .25]];
// the Prophet: at night outside the yard, looking from one place to another; at daybreak in at the gate to the north end
const KP = [[-.06, 4.8, -11.6], [.02, 4.8, -11.6], [.044, 6.6, -12.4], [.098, 6.6, -12.4], [.122, 8.4, -11.5], [.172, 8.4, -11.5], ...paced(.172, .0022, [[8.4, -11.5], [3.4, -8.2], [3.2, -6.25], [6, -1], PP]).slice(1)];

S.qibla = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(1442);
    const inYard = (x, z, m = 0) => x > CY[0] - 6 - m && x < CY[1] + 6 + m && z > CY[2] - 4 - m && z < CY[3] + 5 + m;
    // houses round the mosque: [x0, x1, z0, z1, h, colour, lamp]
    st.houses = [];
    for (let i = 0; i < 400 && st.houses.length < 30; i++) {
      const w = 4 + R() * 5, d = 4 + R() * 5, x = -40 + R() * 90, z = -12 + R() * 70, h = 2.8 + R() * 1.6;
      if (inYard(x, z, 3) || (z < -9 && Math.abs(x - 5) < 16)) continue;
      if (st.houses.some((H) => x - w / 2 < H[1] + 2 && x + w / 2 > H[0] - 2 && z - d / 2 < H[3] + 2 && z + d / 2 > H[2] - 2)) continue;
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, HOUSE[(R() * 4) | 0], R() < .55]);
    }
    st.lamps = st.houses.filter((H) => H[6]).map(([x0, x1, z0]) => [mix(x0, x1, .3 + .4 * hash(x0, z0)), z0 - .6]);
    // palms: [x, z, height, lean, seed]; near ones round the yard and the houses, groves beyond, far crowns
    const free = (x, z) => !inYard(x, z, 1) && !st.houses.some((H) => x > H[0] - 1.2 && x < H[1] + 1.2 && z > H[2] - 1.2 && z < H[3] + 1.2) && !(z < -9 && Math.abs(x - 6) < 10);
    st.palms = [];
    for (let i = 0; i < 2000 && st.palms.length < 70; i++) { const x = -45 + R() * 100, z = -14 + R() * 74; if (free(x, z)) st.palms.push([x, z, 6 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 420; i++) { const x = -260 + R() * 520, z = 34 + R() ** 1.3 * 350; if (Math.abs(x) < 300 && free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 360; i++) st.palms.push([-700 + R() * 1400, 390 + R() ** 1.5 * 520, 8 + R() * 5, 0, R()]);
    // stones and thorn scrub on the open ground round the yard
    st.rocks = []; st.scrub = [];
    for (let i = 0; i < 900 && st.rocks.length < 130; i++) { const x = -40 + R() * 95, z = -34 + R() * 90; if (free(x, z) || (z < -9 && Math.abs(x - 6) < 10 && Math.abs(x - 5) > 3.5)) { if (!inYard(x, z, -3)) st.rocks.push([x, z, .12 + R() ** 2 * .45, R()]); } }
    for (let i = 0; i < 900 && st.scrub.length < 52; i++) { const x = -40 + R() * 95, z = -30 + R() * 80; if (free(x, z) && !inYard(x, z, -2)) st.scrub.push([x, z, .35 + R() * .5, R()]); }
    st.stars = Array.from({ length: 1000 }, () => [R(), R() ** 1.3, .3 + R() ** 3 * 1.7, R() * 9]);
    st.milky = Array.from({ length: 380 }, () => { const u = R(); return [u, .9 - u * .55 + (R() - .5) * .14 * (1 + R()), .25 + R() * .55, R()]; });
    st.cloud = Array.from({ length: 6 }, () => [R(), .25 + R() * .4, .14 + R() * .2, R()]);
    // the congregation: places in the rows; in at the gate one by one, the men first
    st.folk = []; let n = 0;
    ROWS.forEach(([rx, cnt, wo], ri) => { for (let j = 0; j < cnt; j++) {
      const sp = [rx, C0[1] + (j - (cnt - 1) / 2) * .82], k = st.folk.length, pa = .168 + .05 * (n++) / 51;
      const start = [R() < .5 ? -8 - R() * 7 : 14 + R() * 7, -7.4 - R() * 2.4];
      const inK = paced(pa, .0007, [start, [3.2 + (R() - .5) * 1.2, -7.1], [3.2 + (R() - .5) * .8, -5.2], [mix(3.2, sp[0], .5), mix(-5.2, sp[1], .55)], sp]);
      st.folk.push({ sp, ri, wo, inK, lag: .002 + .0012 * ri + .0015 * hash(k, 3), tlag: .004 + .0016 * ri + .002 * hash(k, 5), cl: wo ? WCL[k % 5] : MCL[(k * 3) % 8], hd: wo ? WMN[(k * 2) % 5] : MHD[(k * 5) % 6], sc: wo ? .93 + .04 * hash(k, 7) : .97 + .07 * hash(k, 7), j: R() });
    } });
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    // ----- the camera -----
    let [lx, lz, camZ, camY, hyF] = keyAt(CQ, p);
    if (phone) { // phones: the narrow frame keeps the whole congregation, and him in the close shots
      const pr = bump(p, .2, .25, .93, .97); lx = mix(lx, mix(3.8, 5.6, 1 - fade(p, .6, .74)), pr); camZ -= 3 * pr; camY += .5 * pr;
      lx = mix(lx, 8.4, bump(p, .47, .5, .575, .62)) ;
    }
    const hy = H * (hyF + (phone ? .14 : 0)), aim = phone ? .5 : .42;
    const camX = lx - (aim - .5) * W / F * (lz - camZ);
    const PX = (x, z) => W / 2 + (x - camX) * F / (z - camZ), PY = (y, z) => hy - (y - camY) * F / (z - camZ);
    const P3 = (x, y, z) => [PX(x, z), PY(y, z)];
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LQ, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const night = 1 - fade(p, .15, .19), day = c01((elev + 2) / 10) * (1 - night * .72);
    const fogA = (zr) => Math.min(.9, (1 - Math.exp(-zr / fogL)) * .95);
    const lit = (al, lam, skyL = 1) => al.map((v, j) => v / 255 * (amb[j] * skyL * .72 + sunC[j] * lam * .82));
    const fogd = (col, zr, k = .9) => lerp(col, haze, fogA(zr) * k);
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };

    // ----- the sky: night (stars, the Milky Way) giving way to the day -----
    { const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      if (night > 0) {
        st.milky.forEach(([u, v, s, k]) => { const x = (u * 1.3 - .15) * W - camX * 4, y = v * hy, r = s * F * .1; const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(196,176,236,${(.035 + .03 * k) * night})`); q.addColorStop(1, 'rgba(170,160,226,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, 2 * r, 2 * r); });
        st.stars.forEach(([u, v, m, ph]) => { const x = ((u * W * 1.2 - camX * 6) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, y = v * hy * .98; if (y > hy) return; const a = Math.min(1, m * .55 * (.65 + .35 * Math.sin(t * 1.4 + ph * 7))) * c01((hy - y) / (hy * .2)) * night; c.fillStyle = m > 1.5 ? `rgba(255,236,214,${a})` : `rgba(232,236,255,${a})`; c.fillRect(x, y, m > 1.2 ? 1.8 : 1.1, m > 1.2 ? 1.8 : 1.1); });
        // no moon is drawn (the texts give no phase): starlight, and the warm haze of the oasis lamps along the horizon
        const gl = c.createLinearGradient(0, hy - H * .14, 0, hy + 2); gl.addColorStop(0, 'rgba(255,150,90,0)'); gl.addColorStop(1, `rgba(255,150,96,${.12 * night})`); c.fillStyle = gl; c.fillRect(0, hy - H * .14, W, H * .14 + 2);
      }
      // the sun's glow from the left (south); at daybreak a rose band low in the west, ahead
      const sunL = (1 - night) * c01(se * 3);
      if (sunL > 0) { const X = -W * .1, Y = hy - H * .55, g = c.createRadialGradient(X, Y, 0, X, Y, F * 1.4); g.addColorStop(0, rgb(sunC, .34 * sunL)); g.addColorStop(.35, rgb(sunC, .1 * sunL)); g.addColorStop(1, rgb(sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4); }
      const rose = bump(p, .155, .175, .19, .215); if (rose > 0) { const g = c.createLinearGradient(0, hy - H * .16, 0, hy); g.addColorStop(0, 'rgba(255,170,170,0)'); g.addColorStop(1, `rgba(255,170,150,${.34 * rose})`); c.fillStyle = g; c.fillRect(0, hy - H * .16, W, H * .16); }
      c.globalCompositeOperation = 'source-over';
      const cl = 1 - night; if (cl > 0) st.cloud.forEach(([u, v, w, k]) => { const x = ((u * W * 1.5 - camX * 2) % (W * 1.5) + W * 1.5) % (W * 1.5) - W * .25, y = hy - v * hy * .9, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); q.addColorStop(0, 'rgba(255,255,255,0)'); q.addColorStop(.5, `rgba(255,255,255,${(.3 + .2 * k) * cl})`); q.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 6 * k, 0, 0, TAU); c.fill(); });
    }
    // ----- the land -----
    { const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2.5, z1 = 8000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), z = zr + camZ, fa = fogA(zr), e = Math.max(1.4, zr * .015);
        for (let k = 0; k <= NK; k++) {
          const sx = -W * .06 + k * (W * 1.12 / NK), x = camX + (sx - W / 2) * zr / F, h = hQ(x, z), o = i * (NK + 1) + k;
          TX[o] = sx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hQ(x + e, z) - h) / e, hz = (hQ(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, skyL = .62 + .38 / nl;
            const cc = lit(groundCol(x, z, h), lam, skyL), n = (i * NC + k / 2) * 3;
            let wl = 0; if (night > 0) st.lamps.forEach(([qx, qz]) => { wl += Math.exp(-((x - qx) ** 2 + (z - qz) ** 2) / 14); });
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j] + ([4, 8, 26][j] + [120, 66, 20][j] * Math.min(1, wl)) * night, haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .1);
    }
    // ----- shadows on the ground, away from the light: at noon they fall north -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [44, 34, 52], .66), shA = .42 * day + .06 + .06 * night;
    const shadow = (x, z, hm, w, a = .3) => {
      if (z - camZ < 1) return;
      a *= shA / .38;
      const tx = x + shD[0] * hm, tz = Math.max(camZ + 1.5, z + shD[1] * hm);
      const X0 = PX(x, z), Y0 = PY(0, z), X1 = PX(tx, tz), Y1 = PY(0, tz), ww = w * F / (z - camZ);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * Math.max(.18, Math.min(.5, (camY / (z - camZ)) * 1.2))); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .85)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2; c.beginPath(); c.moveTo(X0 - ww * .45, Y0); c.lineTo(X1 - ww * .2, Y1); c.lineTo(X1 + ww * .2, Y1); c.lineTo(X0 + ww * .45, Y0); c.closePath(); c.fill();
    };
    const quad = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, Math.max(camZ + .6, z))); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    const wall = (base, lam, zr, a = .72) => fogd(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), zr);
    // a mud-brick block: its faces toward the camera and its top, with courses of brick when near
    const slab = (x0, x1, z0, z1, h, alb, key, y0 = 0, cn = 0) => {
      const zr = (z0 + z1) / 2 - camZ; if (z1 - camZ < 1.5) return;
      items.push([key ?? zr + (z1 - z0) * .5 - .2, () => {
        const big = cn && F / Math.max(1, zr) > 12;
        const face = (pts, lam) => { const col = wall(alb, lam, zr); quad(pts, rgb(col)); if (big) { c.strokeStyle = rgb(lerp(col, [40, 30, 24], .3), .7); c.lineWidth = 1; c.beginPath(); for (let r = 1; r <= cn; r++) { const u = r / (cn + 1), A = P3(pts[0][0], y0 + h * u, Math.max(camZ + .6, pts[0][2])), B = P3(pts[1][0], y0 + h * u, Math.max(camZ + .6, pts[1][2])); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); } };
        if (camX < x0) face([[x0, y0, z0], [x0, y0, z1], [x0, y0 + h, z1], [x0, y0 + h, z0]], Math.max(0, -sun[0]));
        if (camX > x1) face([[x1, y0, z0], [x1, y0, z1], [x1, y0 + h, z1], [x1, y0 + h, z0]], Math.max(0, sun[0]));
        if (camZ < z0) face([[x0, y0, z0], [x1, y0, z0], [x1, y0 + h, z0], [x0, y0 + h, z0]], Math.max(0, -sun[2]));
        if (camY > y0 + h) quad([[x0, y0 + h, z0], [x1, y0 + h, z0], [x1, y0 + h, z1], [x0, y0 + h, z1]], rgb(lerp(wall(alb, Math.max(0, sun[1]), zr, .8), [255, 246, 226], .06)));
      }]);
    };
    // a palm: a ringed trunk leaning a little, a crown of drooping fronds; far ones only a crown
    const palm = (x, z, ht, lean, k) => {
      const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -ht * F / zr || X > W + ht * F / zr) return;
      items.push([zr, () => {
        const s = F / zr, Y = PY(hQ(x, z), z), fz = fogA(zr) * .92, tx = X + lean * ht * s, ty = Y - ht * s, sw = Math.sin(t * .7 + k * 9) * .012 * ht * s;
        const trunk = fogd(lit([112, 90, 70], .45 * day + .1, .9), zr, .92), dark = fogd(lit([40, 66, 40], .2 * day + .05, .8), zr, .92), leaf = fogd(lit([66, 112, 60], .75 * day + .1, 1), zr, .92), dry = fogd(lit([150, 120, 74], .6 * day + .1, 1), zr, .92);
        if (s < 1.2) { // far: a thin trunk and a star of fronds
          if (s > .35) { c.fillStyle = rgb(trunk); c.fillRect(X - Math.max(.35, .14 * s), ty, Math.max(.7, .28 * s), Y - ty); }
          c.strokeStyle = rgb(lerp(dark, leaf, .4)); c.lineWidth = Math.max(.7, .5 * s); c.beginPath(); for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI + k * 3, L = Math.max(1.6, 2.6 * s); c.moveTo(tx, ty); c.lineTo(tx + Math.cos(a) * L, ty - Math.sin(a) * L * .55 + L * .25); } c.stroke(); return; }
        if (z - camZ > 4) shadow(x, z, ht * .35, 2.2, .14 * c01(s / 6));
        c.fillStyle = rgb(trunk); c.beginPath(); tube(c, [[X, Y], [mix(X, tx, .5) + lean * .1 * ht * s, mix(Y, ty, .5)], [tx, ty]], Math.max(1, .42 * s), Math.max(.8, .28 * s)); c.fill();
        if (s > 5) { c.strokeStyle = rgb(lerp(trunk, [30, 24, 20], .35), .6); c.lineWidth = Math.max(.5, .03 * s); c.beginPath(); for (let j = 1; j < ht * 3; j++) { const u = j / (ht * 3), qx = mix(X, tx, u), qy = mix(Y, ty, u), w = mix(.21, .14, u) * s; c.moveTo(qx - w, qy + .03 * s); c.lineTo(qx + w, qy - .03 * s); } c.stroke(); }
        const nf = s > 4 ? 13 : 8;
        for (let j = 0; j < nf; j++) {
          const a = (j / nf) * TAU + k * 6, side = Math.cos(a), dep = Math.sin(a), L = (2.4 + .9 * hash(j, k)) * s, droop = (.5 + .5 * Math.abs(dep)) * L * .55, dead = j % 5 === 0 && hash(j, k * 3) < .5;
          const ex = tx + side * L + sw, ey = ty + droop + (dead ? L * .3 : 0), mx = tx + side * L * .55 + sw * .5, my = ty - L * .28 * (1 - Math.abs(dep) * .4);
          c.fillStyle = rgb(dead ? dry : dep > 0 ? dark : leaf);
          c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my - .14 * s, ex, ey); c.quadraticCurveTo(mx, my + .16 * s, tx, ty + .1 * s); c.fill();
          if (s > 6) { c.strokeStyle = rgb(lerp(dep > 0 ? dark : leaf, [20, 30, 18], .3), .55); c.lineWidth = Math.max(.5, .025 * s); c.beginPath(); for (let q = 1; q < 9; q++) { const u = q / 9, bx = (1 - u) ** 2 * tx + 2 * (1 - u) * u * mx + u * u * ex, by = (1 - u) ** 2 * ty + 2 * (1 - u) * u * my + u * u * ey; c.moveTo(bx, by); c.lineTo(bx + side * .12 * s, by + .28 * s * (1 - u * .5)); } c.stroke(); }
        }
        c.fillStyle = rgb(lerp(trunk, dark, .5)); c.beginPath(); c.arc(tx, ty, .22 * s, 0, TAU); c.fill();
      }]);
    };
    // ----- figures: one faceless outline, blended between poses; dir ±1 (facing north = +1), front 0..1 toward the camera -----
    const outline = (a, b, k, front) => { const A = SH[a], B = SH[b], out = new Array(32); for (let i = 0; i < 32; i++) out[i] = mix(mix(A[i], B[i], k), SH.front[i], front); return { pts: out, hc: lerp(lerp(HC[a], HC[b], k), HC.front, front), arm: lerp(lerp(ARM[a], ARM[b], k), ARM.front, front) }; };
    const person = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2 || (o.alpha ?? 1) <= 0) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -3 * s || X > W + 3 * s) return;
      const Y = PY(0, z) - (o.bob || 0) * s, { pts, hc, arm } = o.shape, ln = o.lean || 0;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * o.dir, -s);
      const litU = -o.dir; // the sun is in the south: screen left
      const base = fogd(lit(o.cl, .2 * day + .02, .9), zr, .8), hi = fogd(lit(lerp(o.cl, [255, 236, 206], .1), .9 * day + .1, 1), zr, .8);
      const P = (i, du = 0, dv = 0) => [pts[2 * i] + ln * pts[2 * i + 1] + du, pts[2 * i + 1] + dv];
      const path = (L) => { c.beginPath(); L.forEach((q, j) => (j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); };
      path(Array.from({ length: 16 }, (_, i) => P(i)));
      const g = c.createLinearGradient(-.3 * litU, 0, .3 * litU, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.5, rgb(lerp(hi, base, .65))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
      c.strokeStyle = `rgba(28,20,14,${.35 + .2 * night})`; c.lineWidth = .025; c.stroke();
      if (o.rim) { c.strokeStyle = `rgba(${o.rimC || '255,226,170'},${o.rim})`; c.lineWidth = .045; c.stroke(); }
      // the robe under the open cloak, down the front
      const rb = fogd(lit(o.wo ? lerp(o.cl, [150, 120, 96], .35) : [170, 150, 116], .55 * day + .08, .95), zr, .8);
      c.fillStyle = rgb(rb, .55); path([P(10, -.04, -.04), P(11, -.03), P(12, -.03), P(13, -.035), P(14, -.07, .01), lerp(P(13), P(14), .5).map((v, j) => v - [.13, -.02][j]), lerp(P(11), P(12), .5).map((v, j) => v - [.12, 0][j])]); c.fill();
      // the near sleeve, from the shoulder to the hand
      c.strokeStyle = rgb(lerp(base, [20, 14, 10], .4), .8); c.lineWidth = .065; c.lineCap = 'round'; c.beginPath(); c.moveTo(arm[0] + ln * arm[1], arm[1]); c.quadraticCurveTo(mix(arm[0], arm[2], .5) - .05, mix(arm[1], arm[3], .5), arm[2] + ln * arm[3], arm[3]); c.stroke();
      const hx = hc[0] + ln * hc[1], hv = hc[1], hdc = fogd(lit(o.hd, .7 * day + .12, 1), zr, .8), hdd = fogd(lit(o.hd, .22 * day + .06, .85), zr, .8);
      if (o.wo) { // the mantle: over the head, the shoulders and the chest, down to the waist
        const mid = lerp(P(11), P(12), .5);
        path([P(3, -.025), P(4, -.03), P(5, -.03), P(6, -.035, .01), P(7, 0, .035), P(8, .035, .01), P(9, .025), P(10, .025), [mid[0] + .02, mid[1]]]);
        const q = c.createLinearGradient(-.25 * litU, 0, .25 * litU, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd)); c.fillStyle = q; c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
      } else { // the head cloth, its end hanging down the back
        const b5 = P(5), b4 = P(4);
        c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .95) - .035, mix(b5[1], b4[1], .95)); c.lineTo(mix(b5[0], b4[0], .95) + .07, mix(b5[1], b4[1], .95) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill();
        const q = c.createLinearGradient(hx - .14 * litU, 0, hx + .14 * litU, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
        c.fillStyle = q; c.beginPath(); c.ellipse(hx, hv, .14, .11, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
      }
      c.restore();
    };
    const holy = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2) return null;
      const X = PX(x, z), Y = PY(0, z), h = 1.8 * F / zr;
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; return hd;
    };
    const glow = (X, Y, R0, col, a) => { if (a <= 0 || R0 <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, R0); g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(X - R0, Y - R0, 2 * R0, 2 * R0); c.restore(); };

    // ----- the oasis: houses, palms -----
    st.houses.forEach(([x0, x1, z0, z1, h, col, lamp]) => {
      slab(x0, x1, z0, z1, h, col, undefined, 0, 4);
      slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .25, lerp(col, [236, 214, 176], .2), (z0 + z1) / 2 - camZ - .1 + (z1 - z0) * .5 - .2, h);
      const zr = z0 - camZ; if (zr < 2 || camZ > z0) return;
      items.push([(z0 + z1) / 2 - camZ + (z1 - z0) * .5 - .3, () => { // the door on the east face; a lamp in it at night
        const dx = mix(x0, x1, .3 + .4 * hash(x0, z0)), a = P3(dx - .45, 0, z0 - .01), b = P3(dx + .45, 1.9, z0 - .01), s = F / zr;
        if (s < 2) return;
        if (s > 9) { c.fillStyle = rgb(wall([90, 66, 44], .3, zr)); for (let j = 0; j < Math.floor((x1 - x0) / .9); j++) { const q = P3(x0 + .45 + j * .9, h - .3, z0 - .02); c.fillRect(q[0] - .08 * s, q[1] - .08 * s, .16 * s, .16 * s); } }
        c.fillStyle = rgb(lerp(wall([70, 52, 40], .1, zr), [255, 190, 110], lamp ? .75 * night : 0)); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        if (lamp && night > 0) { glow((a[0] + b[0]) / 2, a[1] - .6 * s, 3.2 * s, [255, 170, 90], .32 * night); c.save(); c.globalCompositeOperation = 'lighter'; c.translate((a[0] + b[0]) / 2, a[1]); c.scale(1, .3); const g = c.createRadialGradient(0, 0, 0, 0, 0, 4 * s); g.addColorStop(0, `rgba(255,170,90,${.3 * night})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-4 * s, -4 * s, 8 * s, 8 * s); c.restore(); }
      }]);
    });
    st.palms.forEach(([x, z, h, l, k]) => palm(x, z, h, l, k));
    st.rocks.forEach(([x, z, r, k]) => { const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -60 || X > W + 60) return;
      items.push([zr, () => {
        const s = F / zr, Y = PY(hQ(x, z) - .04, z), col = fogd(lit(lerp([110, 92, 78], [150, 128, 104], k), .5 * day + .05, .9), zr, .8), top = fogd(lit([176, 154, 124], day + .1, 1), zr, .8);
        c.fillStyle = rgb(shCol, .28); c.beginPath(); c.ellipse(X + r * s * .6, Y, r * s * 1.3, r * s * .22, 0, 0, TAU); c.fill();
        const v = [[-1.05, 0], [-.95, .42 + .2 * hash(k, 1)], [-.45, .8 + .25 * k], [.15, .95 - .2 * hash(k, 2)], [.7, .62 + .2 * hash(k, 3)], [1.05, 0]].map(([u, w]) => [X + u * r * s, Y - w * r * s]);
        c.fillStyle = rgb(col); c.beginPath(); v.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
        c.fillStyle = rgb(top, .55); c.beginPath(); c.moveTo(v[1][0], v[1][1]); c.lineTo(v[2][0], v[2][1]); c.lineTo(v[3][0], v[3][1]); c.lineTo(mix(v[2][0], v[3][0], .5), mix(v[2][1], v[3][1], .5) + .3 * r * s); c.closePath(); c.fill();
      }]); });
    st.scrub.forEach(([x, z, r, k]) => { const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z); if (X < -40 || X > W + 40) return;
      items.push([zr, () => {
        const s = F / zr, Y = PY(hQ(x, z), z), col = fogd(lit([92, 104, 58], .7 * day + .08, 1), zr, .8);
        c.fillStyle = rgb(shCol, .22); c.beginPath(); c.ellipse(X + r * s * .5, Y, r * s * 1.4, r * s * .2, 0, 0, TAU); c.fill();
        c.strokeStyle = rgb(col.map((v) => v * .7)); c.lineWidth = Math.max(.6, .05 * r * s); c.beginPath(); for (let j = 0; j < 5; j++) { c.moveTo(X + (j - 2) * .06 * r * s, Y); c.lineTo(X + (j - 2) * .4 * r * s, Y - r * s * (.6 + .2 * hash(j, k))); } c.stroke();
        for (let j = 0; j < 5; j++) { c.fillStyle = rgb(j < 2 ? col.map((v) => v * .75) : col); c.beginPath(); c.ellipse(X + (hash(j, k) - .5) * r * s * 1.3, Y - r * s * (.55 + .25 * hash(k, j)), r * s * (.32 + .2 * hash(j, 2)), r * s * .22, 0, 0, TAU); c.fill(); }
      }]); });

    // ----- the mosque of Bani Salim: the yard, its walls, the frond roof along the north wall -----
    const [cx0, cx1, cz0, cz1] = CY, alb = [200, 166, 122];
    { // the yard floor, at once (under every shadow)
      quad([[cx0, .01, cz0], [cx1, .01, cz0], [cx1, .01, cz1], [cx0, .01, cz1]], rgb(lerp(lit([226, 206, 166], Math.max(0, sun[1]) * .9 * day, 1), [10, 12, 30], 0)));
      for (let j = 0; j < 26; j++) { const zz = mix(cz0 + 1, cz1 - 1, hash(j, 21)), zr = zz - camZ; if (zr < 1) continue; const q = P3(mix(cx0 + 1, cx1 - 1, hash(j, 22)), .012, zz), r = (1.2 + 2.4 * hash(j, 23)) * F / zr; c.save(); c.translate(q[0], q[1]); c.scale(1, Math.min(.5, camY / zr)); const mc = lit(hash(j, 24) < .5 ? [190, 166, 126] : [236, 222, 190], Math.max(0, sun[1]) * .9 * day, 1), g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, rgb(mc, .35)); g.addColorStop(1, rgb(mc, 0)); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore(); }
      quad([[cx0, .014, cz0], [cx0 + Math.max(0, shD[0]) * WALLH, .014, cz0], [cx0 + Math.max(0, shD[0]) * WALLH, .014, cz1], [cx0, .014, cz1]], rgb(shCol, .32 * day));
      quad([[AR[0], .015, AR[2]], [AR[1], .015, AR[2]], [AR[1], .015, AR[3]], [AR[0], .015, AR[3]]], rgb(lit([150, 128, 96], .1, .9), .55)); // the shade under the roof
      if (F / (cz0 - camZ) > 9) { c.fillStyle = rgb(lit([150, 126, 92], .5 * day, 1), .3); for (let j = 0; j < 220; j++) { const zz = mix(cz0 + .3, cz1 - .3, hash(j, 12)), q = P3(mix(cx0 + .3, cx1 - .3, hash(j, 11)), .02, zz), r = (.03 + .06 * hash(j, 13)) * F / (zz - camZ); c.beginPath(); c.ellipse(q[0], q[1], r * 1.6, r * .5, 0, 0, TAU); c.fill(); } }
    }
    slab(cx1, cx1 + .5, cz0, cz1 + .5, WALLH, alb, cz1 - camZ + 8, 0, 3); // north
    slab(cx0 - .5, cx0, cz0, cz1 + .5, WALLH, alb, cz1 - camZ + 8, 0, 3); // south
    slab(cx0 - .5, cx1 + .5, cz1, cz1 + .5, WALLH, alb, cz1 - camZ + 9, 0, 3); // west
    slab(cx0 - .5, GATE[0], cz0 - .5, cz0, WALLH * .75, alb, cz0 - camZ - .2, 0, 2); slab(GATE[1], cx1 + .5, cz0 - .5, cz0, WALLH * .75, alb, cz0 - camZ - .2, 0, 2); // east, low, with the gate
    // the 'arish: palm trunks holding a roof of fronds
    for (let j = 0; j < 9; j++) { const z = mix(AR[2] + .3, AR[3] - .3, j / 8); [AR[0] + .2, AR[1] - .25].forEach((x, i) => { const zr = z - camZ; if (zr < 1.5) return; items.push([zr + (i ? .3 : 0), () => { const a = P3(x, 0, z), b = P3(x, AR[4], z), s = F / zr; c.fillStyle = rgb(fogd(lit([120, 96, 72], Math.max(0, -sun[0]) * .8 * day + .1, .9), zr)); c.beginPath(); tube(c, [[a[0], a[1]], [b[0], b[1]]], Math.max(1, .3 * s), Math.max(1, .24 * s)); c.fill(); }]); }); }
    items.push([AR[2] - camZ - (camY > AR[4] ? -.5 : 0) + .1, () => { // the roof: under it from below, its thatch from above
      const above = camY > AR[4], col = above ? lit([110, 104, 62], Math.max(0, sun[1]) * day + .12, 1) : lit([70, 58, 40], .05, .8);
      quad([[AR[0] - .3, AR[4], AR[2] - .3], [AR[1] + .2, AR[4], AR[2] - .3], [AR[1] + .2, AR[4], AR[3] + .3], [AR[0] - .3, AR[4], AR[3] + .3]], rgb(col));
      const n = 110; c.lineWidth = Math.max(.6, F / (AR[2] - camZ + 6) * .05);
      for (let j = 0; j < n; j++) { const z = mix(AR[2] - .2, AR[3] + .2, j / n), zr = z - camZ; if (zr < 1.5) continue; const A = P3(AR[0] - .3, AR[4] + .04, z), B = P3(AR[1] + .2, AR[4] + .04, z + .4 * (hash(j, 2) - .5)); c.strokeStyle = rgb(lerp(col, hash(j, 3) < .5 ? [60, 84, 40] : [176, 150, 92], .35), .8); c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - .1 * F / zr, B[0], B[1]); c.stroke(); }
      c.fillStyle = rgb(lerp(col, [40, 52, 26], .3)); c.beginPath(); { let first = true; for (let j = 0; j <= 260; j++) { const z = mix(AR[2] - .3, AR[3] + .3, j / 260), zr = z - camZ; if (zr < 1.5) continue; const a = P3(AR[0] - .3, AR[4], z), l = (.05 + .13 * hash(j, 5)) * F / zr; if (first) { c.moveTo(a[0], a[1]); first = false; } c.lineTo(a[0] + (hash(j, 6) - .5) * .06 * F / zr, a[1] + (j % 2 ? l : 0)); } const e = P3(AR[0] - .3, AR[4], AR[3] + .3); c.lineTo(e[0], e[1]); } c.closePath(); c.fill(); // the ragged edge of the fronds
    }]);

    // ----- the Prophet -----
    const thP = theta(p), [pa, pb, pk] = poseAt(p);
    let pX, pZ, walkP = false, phaseP = 0;
    if (p < .245) { const tr = track(KP, p); pX = tr.x; pZ = tr.z; walkP = tr.walk; phaseP = tr.d / 1.5; } else [pX, pZ] = rot(PP, thP);
    const flipP = thP > Math.PI / 2, turning = p > TURN[0] && p < TURN[1] + .01;
    const LJ = bump(p, .472, .505, .76, .8); // the light that comes down on him
    const ARM = bump(p, .548, .572, .74, .765); // it takes his upper arms
    let headP = null;
    shadow(pX, pZ, 1.8, .55, .3);
    items.push([pZ - camZ - .02, () => {
      const amb0 = .3 + .7 * (1 - night), hol = { amb: amb0, glow: .5 * night + .15 * LJ, flip: flipP };
      if (walkP) headP = holy(pX, pZ, { ...hol, pose: 'walk', phase: phaseP });
      else if (turning || p < .25) headP = holy(pX, pZ, { ...hol, pose: 'stand' });
      else { // the prayer: one pose melts into the next (Holy.draw has no in-between)
        const k2 = smooth(c01((pk - .3) / .4));
        if (pa === pb || k2 < 1) headP = holy(pX, pZ, { ...hol, pose: pa, alpha: 1 - k2 });
        if (pa !== pb && k2 > 0) { const h2 = holy(pX, pZ, { ...hol, pose: pb, alpha: k2 }); if (k2 >= .5 || !headP) headP = h2; }
      }
      if (night > .05 && headP) { glow(headP.x, headP.y + headP.h * .3, headP.h * 1.1, [255, 226, 170], .08 * night); c.save(); c.globalCompositeOperation = 'lighter'; const Yf = PY(0, pZ); c.translate(headP.x, Yf); c.scale(1, .26); const g = c.createRadialGradient(0, 0, 0, 0, 0, headP.h * 1.6); g.addColorStop(0, `rgba(255,206,140,${.2 * night})`); g.addColorStop(1, 'rgba(255,206,140,0)'); c.fillStyle = g; c.fillRect(-headP.h * 1.6, -headP.h * 1.6, headP.h * 3.2, headP.h * 3.2); c.restore(); }
      // Jibril: light only — a shaft from above, motes in it, and the light at his upper arms
      if (LJ > .01 && headP) {
        const s = headP.h / 1.8, X = headP.x, Yb = PY(0, pZ), Yt = Math.min(-20, headP.y - 12 * s), wTop = 1.1 * s, wBot = 1.5 * s;
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let L = 0; L < 7; L++) { // soft-edged: seven nested shafts, the core brightest
          const f = 1 - L / 7, g = c.createLinearGradient(0, Yt, 0, Yb); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.75, `rgba(255,238,196,${.035 * LJ})`); g.addColorStop(1, `rgba(255,244,214,${.05 * LJ})`);
          c.fillStyle = g; c.beginPath(); c.moveTo(X - wTop * f, Yt); c.lineTo(X + wTop * f, Yt); c.lineTo(X + wBot * f, Yb); c.lineTo(X - wBot * f, Yb); c.closePath(); c.fill();
        }
        for (let j = 0; j < 40; j++) { const u = ((hash(j, 1) + t * (.05 + .05 * hash(j, 2)) + p * 6) % 1), y = mix(Yt, Yb, u), x = X + (hash(j, 3) - .5) * mix(wTop, wBot, u) * 1.6, a = .5 * LJ * Math.sin(u * Math.PI); c.fillStyle = `rgba(255,240,200,${a})`; c.beginPath(); c.arc(x, y, Math.max(.8, .03 * s * (1 + hash(j, 4))), 0, TAU); c.fill(); }
        c.translate(X, Yb); c.scale(1, .28); const q = c.createRadialGradient(0, 0, 0, 0, 0, 3 * s); q.addColorStop(0, `rgba(255,244,214,${.24 * LJ})`); q.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = q; c.fillRect(-3 * s, -3 * s, 6 * s, 6 * s);
        c.restore();
        if (ARM > 0) [-1, 1].forEach((sd) => { const ax = X + sd * headP.r * 1.9, ay = headP.y + headP.r * 3.1; glow(ax, ay, headP.r * 3.4, [255, 240, 200], .5 * ARM); glow(ax, ay, headP.r * 1.1, [255, 252, 240], .7 * ARM); });
      }
    }]);
    // the path of the turn: a trace of light on the ground behind him
    if (thP > .02 && p < .82) {
      const trA = (1 - fade(p, .76, .82)) * .55;
      items.push([1e3, () => { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (let j = 0; j < 40; j++) { const a0 = thP * j / 40, a1 = thP * (j + 1) / 40, A = rot(PP, a0), B = rot(PP, a1); if (A[1] - camZ < 1.5) continue; const P0 = P3(A[0], .02, A[1]), P1 = P3(B[0], .02, B[1]); c.strokeStyle = `rgba(255,226,160,${trA * (.15 + .85 * j / 40)})`; c.lineWidth = Math.max(1, .16 * F / (A[1] - camZ)); c.beginPath(); c.moveTo(P0[0], P0[1]); c.lineTo(P1[0], P1[1]); c.stroke(); }
        c.restore(); }]);
    }

    // ----- the congregation -----
    st.folk.forEach((M, i) => {
      if (p < M.inK[0][0]) return;
      const arrived = p >= M.inK[M.inK.length - 1][0];
      let x, z, o = { cl: M.cl, hd: M.hd, wo: M.wo, sc: M.sc, rim: night > .05 ? .25 * night : 0 };
      if (!arrived) {
        const tr = track(M.inK, p), dx = tr.dx || 1; x = tr.x; z = tr.z;
        const ph = p * 320 + i * 1.3;
        const hl = Math.hypot(tr.dx, tr.dz) || 1; o.dir = Math.sign(dx) || 1; o.shape = outline('stand', 'stand', 0, Math.min(.9, Math.abs(tr.dz) / hl)); o.bob = tr.walk ? Math.abs(Math.sin(ph)) * .03 : 0; o.lean = tr.walk ? .03 : 0;
        o.alpha = fade(p, M.inK[0][0], M.inK[0][0] + .006);
      } else {
        const th = theta(p, M.tlag); [x, z] = rot(M.sp, th);
        const [a, b, k] = poseAt(p - M.lag), cs = Math.cos(th), front = Math.abs(Math.sin(th));
        o.dir = cs >= 0 ? 1 : -1; o.shape = outline(a, b, k, front * (a === 'stand' && b === 'stand' ? 1 : .2));
      }
      shadow(x, z, 1.7 * (o.shape.hc[1] / 1.62), .45, .26);
      items.push([z - camZ, () => person(x, z, o)]);
    });
    draw();

    // ----- the dial: the qibla of the moment, north (Bayt al-Maqdis) to the right, south (the Ka'ba) to the left -----
    { const da = bump(p, .25, .29, .93, .97) * .95;
      if (da > 0) {
        const r = phone ? 20 : 30, cx = phone ? W * .5 : 34 + r + W * .02, cy = H - (phone ? 122 : 70), a = thP; // a runs 0 (north) → π (south) through the near side
        c.save(); c.globalAlpha = da;
        c.fillStyle = 'rgba(10,14,30,.4)'; c.beginPath(); c.ellipse(cx, cy + 6, r * 3.4, r * 1.25, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(10,14,30,.58)'; c.beginPath(); c.arc(cx, cy, r + 8, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(243,217,143,.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke();
        for (let j = 0; j < 16; j++) { const b = j / 16 * TAU, l = j % 4 === 0 ? 6 : 3; c.beginPath(); c.moveTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r); c.lineTo(cx + Math.cos(b) * (r - l), cy + Math.sin(b) * (r - l)); c.stroke(); }
        const nx = Math.cos(a), ny = Math.sin(a); // the needle: gold toward the qibla
        c.fillStyle = '#f3d98f'; c.beginPath(); c.moveTo(cx + nx * (r - 4), cy + ny * (r - 4)); c.lineTo(cx - ny * 4, cy + nx * 4); c.lineTo(cx + ny * 4, cy - nx * 4); c.closePath(); c.fill();
        c.fillStyle = 'rgba(230,220,195,.45)'; c.beginPath(); c.moveTo(cx - nx * (r - 6), cy - ny * (r - 6)); c.lineTo(cx - ny * 3, cy + nx * 3); c.lineTo(cx + ny * 3, cy - nx * 3); c.closePath(); c.fill();
        c.direction = 'rtl'; c.textAlign = 'center'; c.font = `${phone ? 12.5 : 14.5}px ${FONT.naskh}`;
        const north = 1 - smooth(c01(a / Math.PI * 1.4 - .2));
        c.fillStyle = `rgba(${north > .5 ? '243,217,143' : '230,220,195'},${.75 + .25 * north})`; c.fillText('بيت المقدس', cx + r + (phone ? 30 : 36), cy + 4);
        c.fillStyle = `rgba(${north < .5 ? '243,217,143' : '230,220,195'},${.75 + .25 * (1 - north)})`; c.fillText('الكعبة', cx - r - (phone ? 22 : 26), cy + 4);
        c.font = `${phone ? 10 : 11.5}px ${FONT.ui}`; c.fillStyle = 'rgba(236,228,206,.85)'; c.fillText('الشمال', cx + r + (phone ? 30 : 36), cy + 18); c.fillText('الجنوب', cx - r - (phone ? 22 : 26), cy + 18);
        c.restore();
      }
    }
    if (night > 0) { const g = c.createLinearGradient(0, hy + H * .04, 0, H); g.addColorStop(0, 'rgba(14,16,46,0)'); g.addColorStop(1, `rgba(8,16,44,${.58 * night})`); c.fillStyle = g; c.fillRect(0, hy, W, H - hy); }
    // ----- grade: the edges close in a little; the dips to black over the sittings -----
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,12,30,0)'); vg.addColorStop(1, `rgba(10,12,30,${.16 + .2 * night})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    const dip = Math.max(...DIPS.map((d) => bump(p, ...d))); if (dip > 0) { c.fillStyle = `rgba(6,8,14,${dip})`; c.fillRect(0, 0, W, H); }
  },
};
})();
