(() => {
// tabuk — «تبوك وحديث المنزلة» (al-Irshad 1:154–157; Tafsir al-Qummi 1:290, 1:292–293; the date: Manaqib 1:182).
// Two worlds in metres under one pinhole camera keyed on p (x east, y up, z north; the camera turns about y), and one
// painted vision. Medina and the plain north of it: the mosque, the houses, the palm groves, the pass of Thaniyyat
// al-Wada' and the camp beyond it, the road north-west to al-Jurf, Uhud. Then the valley of Tabuk among sandstone mesas.
//   p −.05 → .062  Medina, noon: he stands in the yard of the mosque in a column of light (Irshad 1:154: the revelation
//                   that he should go himself, that no war would be needed)
//      .062 → .16  over the groves: the palms hang with ripe dates, the heat shimmers, men sit in the shade under the palms
//                   (Irshad 1:154–155: «وقد أينعت ثمارهم واشتدّ القيظ عليهم … وتخلّف آخرون»)
//      .16 → .24   the camp beyond Thaniyyat al-Wada': tents, couched camels, horses, men; four men carry bundles to others
//                   (Qummi 1:290: «وأمر أهل الجدة أن يعينوا من لا قوّة به»); he stands in the open ground of the camp
//      .24 → .33   close: he and Ali face each other; his sleeve goes toward the city (Irshad 1:155)
//      .33 → .42   the column goes out north-west into the heat haze, camels and riders among the men; Ali stands by the
//                   road north of the pass (Qummi 1:292–293)
//      .42 → .50   a lane of Medina in the afternoon: men stand in knots in the shade of the walls, heads together; Ali at
//                   the door of his house (Irshad 1:155–156: the rumour)
//      .50 → .57   Ali rides out across the plain, the sword at his side (Qummi 1:293: «فأخذ سيفه وسلاحه»)
//      .57 → .715  al-Jurf, late afternoon: the army halted among its tents; Ali comes in and stands before him; the words of
//                   the Manzila (Irshad 1:156)
//      .715 → .895 a vision in gold: a mountain under light, a camp at its foot and a staff standing upright before it; a
//                   thread of light climbs to the summit while the staff stays below (Taha 29–32, al-A'raf 142, Maryam 53;
//                   no figure of Musa or Harun is drawn)
//      .895 → .94  al-Jurf at sunset, looking south: he stands among the halted camp while Ali rides away toward Medina
//                   (Qummi 1:293); the army's going on is carried by the cut to Tabuk
//      .94 → 1.05  Tabuk at dusk: the camp spread across the valley, its fires lit; he stands on a low rise among a few
//                   of his companions
// The Prophet and Ali are drawn only by Holy.draw; everyone else is a faceless shape with an earth-toned or dark head
// cloth. Everything follows from p; t moves only cloth, heat shimmer, fire, stars and light.
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
function crag(x, z) {
  let s = 0, a = 1, f = 1;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}

// ---------- outlines (u across, v up, metres; facing +u): the same 16 points in the same order, so poses blend ----------
const SH = {
  stand: [-.3, 0, -.22, .4, -.18, .85, -.19, 1.1, -.18, 1.33, -.1, 1.46, -.07, 1.6, .05, 1.72, .15, 1.62, .12, 1.49, .17, 1.37, .19, 1.05, .16, .7, .17, .32, .22, 0, 0, .02],
  front: [-.3, 0, -.25, .45, -.24, .9, -.25, 1.15, -.25, 1.38, -.16, 1.5, -.1, 1.6, 0, 1.75, .1, 1.6, .16, 1.5, .25, 1.38, .25, 1.15, .24, .9, .25, .45, .3, 0, 0, .02],
  sit: [-.34, 0, -.33, .24, -.25, .5, -.21, .72, -.19, .86, -.11, .96, -.07, 1.06, .04, 1.16, .13, 1.07, .11, .96, .15, .86, .18, .62, .26, .36, .42, .2, .46, 0, 0, .02],
  sitF: [-.42, 0, -.4, .2, -.3, .46, -.26, .66, -.24, .84, -.15, .95, -.09, 1.04, 0, 1.17, .09, 1.04, .15, .95, .24, .84, .26, .66, .3, .46, .4, .2, .42, 0, 0, .02],
  bend: [-.3, 0, -.24, .4, -.2, .82, -.16, 1.06, -.1, 1.26, .0, 1.38, .06, 1.48, .2, 1.56, .28, 1.45, .22, 1.34, .24, 1.2, .22, .98, .16, .68, .17, .32, .22, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], front: [0, 1.6], sit: [.04, 1.06], sitF: [0, 1.04], bend: [.18, 1.44] };
const SHO = { stand: [.01, 1.36], front: [.2, 1.38], sit: [0, .84], sitF: [.2, .84], bend: [.1, 1.22] };
// batched crowd shapes: side man, far man, horse, rider, camel, a camel couched on the ground
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MANS = [-.3, 0, -.24, .9, -.22, 1.3, -.13, 1.45, .13, 1.45, .22, 1.3, .24, .9, .3, 0];
const SITS = [-.4, 0, -.34, .4, -.2, .78, .16, .78, .3, .5, .44, .14, .46, 0];
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const RIDER = [-.24, 1.48, -.22, 1.95, -.14, 2.12, -.13, 2.26, -.06, 2.37, .05, 2.37, .11, 2.26, .12, 2.12, .2, 1.95, .24, 1.48];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
const CAMELK = [-1.05, 0, -1.08, .42, -.8, .86, -.3, 1.18, .15, 1.06, .42, .78, .7, .74, .92, .9, 1.1, 1.3, 1.22, 1.52, 1.42, 1.54, 1.48, 1.44, 1.3, 1.34, 1.12, .8, .95, .42, .9, 0];
const poly = (pa, sh, bx, by, s, dir, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const X = bx + (sh[i] + lean * sh[i + 1]) * dir * s, Y = by - sh[i + 1] * s; i ? pa.lineTo(X, Y) : pa.moveTo(X, Y); } pa.closePath(); };
// earth tones: cloaks and head cloths
const CL = [[96, 72, 54], [72, 62, 54], [116, 84, 58], [66, 64, 72], [104, 86, 64], [88, 60, 48], [80, 76, 60]];
const HD = [[170, 134, 92], [150, 110, 72], [160, 138, 100], [140, 112, 78], [176, 142, 98], [128, 94, 62], [154, 124, 84]]; // earth-toned head cloths: only the veiled figures read white at the head
const HOUSE = [[206, 178, 136], [196, 166, 124], [214, 188, 148], [190, 160, 120]];
const TENT = [[58, 46, 40], [84, 64, 48], [70, 56, 46], [176, 160, 132], [104, 82, 60]]; // goat hair, hide, one pale cloth (invented)

// ---------- Medina and the plain north of it ----------
const MOS = [-15, 15, -12, 14], WALLH = 1.3, ROOF = [-15, 15, -12, -7.2, 3.1]; // the yard; the shade along its south wall
const HOMEA = [15.6, 22, -8, -1.2, 3], DOORA = 18.8; // Ali's house against the yard's east wall, its door on the south face
const THAN = [0, 720], HP1 = [0, 701.1], HA1 = [0, 699.5]; // the camp past the pass; where he and Ali stand
const JURF = [-1915, 3060], MEET = [-1888.6, 2863]; // the camp at al-Jurf; where they meet
const ROAD0 = [[-9, -40], [-9, 20], [-8, 300], [0, 520], [2, 760], [-260, 1250], [-860, 1980], [-1480, 2520], [-1880, 2820], [-1960, 3400], [-2060, 4500], [-2200, 6400], [-2320, 9000]];
const ROAD = (() => { // Catmull-Rom through the points; z rises along it, so x is a function of z; d is the distance along
  const out = [], n = ROAD0.length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < 16; k++) {
    const u = k / 16, a = ROAD0[Math.max(0, i - 1)], b = ROAD0[i], c2 = ROAD0[i + 1], d = ROAD0[Math.min(n - 1, i + 2)];
    out.push([0, 1].map((j) => .5 * (2 * b[j] + (-a[j] + c2[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c2[j] - d[j]) * u * u + (-a[j] + 3 * b[j] - 3 * c2[j] + d[j]) * u * u * u)));
  }
  out.push(ROAD0[n - 1]); let D = 0; out.forEach((q, i) => { if (i) D += Math.hypot(q[0] - out[i - 1][0], q[1] - out[i - 1][1]); q.push(D); }); return out;
})();
const roadX = (z) => { let lo = 0, hi = ROAD.length - 1; if (z <= ROAD[0][1]) return ROAD[0][0]; if (z >= ROAD[hi][1]) return ROAD[hi][0]; while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][1] < z ? lo = m : hi = m; } const k = (z - ROAD[lo][1]) / (ROAD[hi][1] - ROAD[lo][1]); return mix(ROAD[lo][0], ROAD[hi][0], k); };
const roadAt = (d) => { let lo = 0, hi = ROAD.length - 1; d = Math.max(0, Math.min(ROAD[hi][2], d)); while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][2] < d ? lo = m : hi = m; } const k = (d - ROAD[lo][2]) / Math.max(1e-6, ROAD[hi][2] - ROAD[lo][2]); return [mix(ROAD[lo][0], ROAD[hi][0], k), mix(ROAD[lo][1], ROAD[hi][1], k), Math.atan2(ROAD[hi][0] - ROAD[lo][0], ROAD[hi][1] - ROAD[lo][1])]; };
const roadD = (z) => { let lo = 0, hi = ROAD.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][1] < z ? lo = m : hi = m; } return mix(ROAD[lo][2], ROAD[hi][2], c01((z - ROAD[lo][1]) / Math.max(1e-6, ROAD[hi][1] - ROAD[lo][1]))); };
function hM(x, z) {
  let h = .06 * Math.sin(x * .7 + z * .4) * Math.sin(z * .6 - x * .3) + 1.6 * Math.sin(x * .004 + z * .003) * Math.sin(z * .0021 - .5) * c01((z - 200) / 300);
  h += 15 * Math.exp(-((x + 78) ** 2 + (z - 560) ** 2) / (2 * 44 ** 2)) + 12 * Math.exp(-((x - 84) ** 2 + (z - 590) ** 2) / (2 * 48 ** 2)); // the two hillocks of the pass
  h += smooth(c01((x - 700) / 500)) * (6 + 26 * crag(x * .02, z * .02)) + smooth(c01((-2750 - x) / 600)) * (5 + 22 * crag(x * .018 + 3, z * .018)); // the harra east and far west
  h += 380 * Math.exp(-((x + 300) ** 2) / (2 * 1300 ** 2) - ((z - 4700) ** 2) / (2 * 480 ** 2)) * (.6 + .6 * crag(x * .003 + 2, z * .003)); // Uhud
  h += smooth(c01((z - 7000) / 3500)) * (200 + 260 * crag(x * .0013, z * .0013)) + smooth(c01((-z - 2500) / 2500)) * (60 + 140 * crag(x * .002, z * .002));
  return h;
}
const SAND = [226, 206, 166], EARTH = [200, 174, 132], GRAV = [184, 160, 124], GROVE = [134, 140, 84], FIELD = [122, 146, 72], BASALT = [76, 64, 60], SILT = [230, 220, 196], FARC = [156, 160, 184];
function groundM(x, z, h) {
  const n = c01(.5 + .5 * Math.sin(x * .13 + Math.sin(z * .11) * 2) * Math.sin(z * .17 - x * .05)), m = c01(.5 + .5 * Math.sin(x * .011 - z * .008 + 1) * Math.sin(z * .013 + x * .004));
  if (x > MOS[0] - 2 && x < 40 && z > -30 && z < MOS[3] + 2) return lerp(lerp(SAND, EARTH, .2 + .4 * n), [180, 152, 116], .3 * c01(.5 + .5 * Math.sin(x * .4 - z * .3)));
  const fld = c01((Math.sin(x * .045 + Math.sin(z * .03) * 1.5) * Math.sin(z * .05 - x * .01) - .15) * 3);
  const green = c01((1 - Math.hypot(x / 440, (z - 60) / 400)) * 3) * (.35 + .55 * fld);
  let a = lerp(lerp(lerp(EARTH, SAND, n), lerp(GRAV, [168, 140, 106], n), c01((z - 350) / 300)), lerp(GROVE, FIELD, n), green);
  a = lerp(a, SILT, c01((m - .62) * 3) * c01((z - 900) / 400) * .7); // pale silt flats of the wadi
  a = lerp(a, lerp(BASALT, [106, 86, 74], n * .6), c01(smooth(c01((x - 700) / 500)) + smooth(c01((-2750 - x) / 600))) * .92 + c01(m - .78) * 2.5 * .55 * c01((z - 400) / 300));
  a = lerp(a, [176, 128, 96], c01((h - 30) / 160) * .75);
  a = lerp(a, [222, 204, 166], Math.exp(-((x - roadX(z)) ** 2) / 14) * c01((z - 30) / 20) * .75);
  return lerp(a, lerp([176, 128, 96], FARC, .6), smooth(c01((Math.hypot(x + 900, z - 2000) - 2600) / 4000)));
}
// ---------- the valley of Tabuk: a broad sandy floor, sandstone mesas and buttes about it ----------
const MESA = [[-760, 520, 170, 54], [690, 380, 140, 62], [-1250, 1500, 300, 90], [1180, 1700, 260, 80], [-300, 2600, 420, 120], [1800, 900, 200, 70], [-2100, 700, 260, 86], [600, 3200, 500, 140], [-1700, 3000, 380, 110]];
function hT(x, z) {
  let h = .8 * Math.sin(x * .02 + z * .013) * Math.sin(z * .017 - x * .006) + 3 * Math.sin(x * .0031 + 1) * Math.sin(z * .0023);
  h += 2.2 * Math.exp(-((x - 2) ** 2 + (z + 1) ** 2) / 60); // the low rise he stands on
  MESA.forEach(([mx, mz, r, mh]) => { const d = Math.hypot((x - mx) * (1 + .25 * Math.sin(z * .004 + mx)), z - mz) - r * (.85 + .3 * crag(x * .006 + mx, z * .006)); h += mh * smooth(c01(-d / (r * .18))) * (.92 + .08 * crag(x * .03, z * .03)); });
  return h + smooth(c01((z - 4500) / 3000)) * (160 + 220 * crag(x * .0012 + 5, z * .0012));
}
function groundT(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .021 + Math.sin(z * .017) * 2.4) * Math.sin(z * .019 - x * .007)), n2 = c01(.5 + .5 * Math.sin(x * .09 + z * .05) * Math.sin(z * .11 - x * .03));
  let a = lerp(lerp([216, 172, 128], [226, 190, 148], n), [196, 150, 112], n2 * .5);
  const str = .5 + .5 * Math.sin(h * .55 + n * 2); // the strata of the sandstone on the walls of the mesas
  a = lerp(a, lerp([170, 96, 70], [198, 132, 96], str), c01((slope - .35) * 2.2));
  a = lerp(a, [150, 118, 96], c01(n2 - .7) * 1.4 * c01(1 - slope * 2));
  return lerp(a, [150, 140, 170], smooth(c01((z - 2000) / 5000)) * .5);
}

// light: sky top, sky mid, horizon, sun, ambient, haze, elevation (deg), azimuth (rad from north toward east), fog distance
const LQ = [
  [-.06, [66, 122, 200], [174, 202, 230], [242, 236, 220], [255, 248, 230], [160, 166, 178], [238, 232, 218], 64, 2.9, 4200],
  [.33, [66, 122, 200], [174, 202, 230], [242, 236, 220], [255, 248, 230], [160, 166, 178], [238, 232, 218], 58, 2.6, 4400],
  [.42, [64, 116, 196], [170, 196, 226], [242, 228, 208], [255, 238, 210], [156, 158, 170], [236, 224, 206], 40, -2.0, 4400],
  [.5, [62, 114, 194], [168, 192, 224], [244, 224, 198], [255, 232, 198], [154, 156, 166], [236, 220, 200], 32, -1.95, 4600],
  [.57, [60, 106, 184], [166, 182, 212], [246, 214, 180], [255, 222, 174], [150, 148, 158], [234, 210, 188], 20, -1.85, 4600],
  [.715, [56, 98, 176], [168, 174, 204], [248, 206, 166], [255, 212, 156], [148, 142, 152], [234, 204, 178], 13, -1.8, 4400],
  [.896, [52, 84, 156], [170, 160, 188], [248, 190, 142], [255, 196, 128], [144, 130, 138], [232, 190, 160], 7, -1.75, 4000],
  [.94, [46, 74, 146], [160, 146, 180], [246, 180, 132], [255, 186, 120], [140, 124, 134], [226, 182, 156], 4, -1.75, 3800],
  [.941, [34, 50, 112], [104, 98, 154], [238, 156, 112], [255, 176, 112], [122, 108, 132], [176, 132, 132], 0, -1.7, 3200],
  [1.06, [8, 13, 46], [26, 32, 84], [104, 70, 96], [255, 160, 100], [60, 66, 128], [64, 58, 100], -7, -1.7, 2200]];
// cameras: [p, x, height above the ground under it, z, horizon (fraction of the height)]; subject [p, x, y, z]
const CM = [[-.06, 5.5, 1.6, -5.5, .56], [.061, 3.2, 1.9, -7.5, .55],
  [.062, -15, 1.85, 151, .55], [.16, -17.5, 2.5, 147, .53],
  [.161, 12, 2.8, 676, .53], [.239, 7, 2.3, 686, .54],
  [.24, -6.4, 1.72, 700.6, .56], [.33, -5.4, 1.68, 700.4, .56],
  [.331, -14, 3.6, 830, .5], [.42, -12, 4.4, 822, .49],
  [.421, 34.6, 1.65, -17.2, .55], [.5, 33.4, 1.62, -16.6, .55],
  [.571, -1872, 2.4, 2843, .53], [.64, -1881.6, 1.92, 2853, .54], [.715, -1883.6, 1.78, 2855.8, .55],
  [.895, -1880, 2.8, 2888, .5], [.94, -1879, 3.4, 2892, .49]];
const SM = [[-.06, 0, 1.3, 3.5], [.061, 0, 1.4, 3.5],
  [.062, -28, 1.3, 170], [.16, -29, 1.5, 172],
  [.161, 0, 1.6, 705], [.239, 0, 1.5, 703],
  [.24, 0, 1.25, 700.3], [.33, 0, 1.25, 700.3],
  [.331, -110, 2, 1010], [.42, -125, 3, 1040],
  [.421, 19.6, 1.2, -9.3], [.5, 19.6, 1.2, -9.3],
  [.571, -1888.6, 1.4, 2863], [.64, -1888.7, 1.3, 2863], [.715, -1888.7, 1.32, 2863],
  [.895, -1893, 1.4, 2838], [.94, -1890, 1.4, 2832]];
const CT = [[.94, 7, 2.0, -11, .52], [1.06, 11, 3.6, -24, .48]], ST = [[.94, 0, 1.3, .5], [1.06, 0, 1.6, 30]];
const CUTS = [[.056, .06, .064, .068], [.154, .158, .162, .166], [.236, .238, .242, .244], [.324, .328, .333, .337], [.414, .418, .423, .427], [.494, .498, .502, .506], [.565, .568, .572, .575], [.934, .938, .942, .946]];
const GOLD = [[.7, .712, .718, .73], [.884, .892, .898, .906]];
const ALIRIDE = [.502, .568]; // Ali on the road from the pass to al-Jurf
const dAli = (p) => mix(roadD(800), roadD(2700), seg(p, ...ALIRIDE));

S.tabuk = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(9142);
    // Medina: houses and palms, kept off the yard, Ali's house and the lane before it
    const keep = [[MOS[0] - 4, MOS[1] + 4, MOS[2] - 5, MOS[3] + 4], [HOMEA[0] - 1, HOMEA[1] + 1, HOMEA[2] - 1, HOMEA[3] + 1], [12, 46, -30, -4], [-20, 12, 30, 150], [-44, -8, 138, 192]];
    const clear = (x, z, m = 0) => !keep.some(([a, b, c0, d]) => x > a - m && x < b + m && z > c0 - m && z < d + m);
    st.houses = [[...HOMEA, HOUSE[0], 1, DOORA], [24, 30, -6, 0, 3.2, HOUSE[2], 0, 27], [32, 39, -7, -.5, 2.9, HOUSE[1], 0, 35], [13, 18, -24, -19, 3, HOUSE[3], 0, 15], [20, 27, -26, -20, 3.3, HOUSE[0], 0, 23], [30, 36, -27, -21, 2.8, HOUSE[2], 0, 33], [40, 46, -24, -17, 3.1, HOUSE[1], 0, 43]];
    for (let i = 0; i < 900 && st.houses.length < 44; i++) {
      const w = 4 + R() * 5, d = 4 + R() * 5, x = -110 + R() * 240, z = -80 + R() * 160, h = 2.7 + R() * 1.6;
      if (!clear(x, z, 4)) continue;
      if (st.houses.some((H) => x - w / 2 < H[1] + 2 && x + w / 2 > H[0] - 2 && z - d / 2 < H[3] + 2 && z + d / 2 > H[2] - 2)) continue;
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, HOUSE[(R() * 4) | 0], 0, mix(x - w / 2, x + w / 2, .3 + .4 * R())]);
    }
    const free = (x, z) => clear(x, z, 1) && !st.houses.some((H) => x > H[0] - 1.2 && x < H[1] + 1.2 && z > H[2] - 1.2 && z < H[3] + 1.2) && Math.abs(x - roadX(z)) > 7;
    st.palms = [];
    for (let i = 0; i < 4000 && st.palms.length < 170; i++) { const x = -140 + R() * 280, z = -90 + R() * 260; if (free(x, z)) st.palms.push([x, z, 6 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 900; i++) { const x = -460 + R() * 920, z = -360 + R() ** .9 * 760; if (Math.hypot(x / 460, (z - 40) / 400) < 1 && free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    // the grove where they sit in the shade (the near palms of the crane shot, heavy with ripe dates)
    [[-29, 160, 10], [-22, 170, 9], [-36, 176, 11], [-27, 186, 8.5], [-41, 190, 10.5], [-17, 182, 9.5], [-32, 200, 10], [-46, 168, 9]].forEach(([x, z, h], i) => st.palms.push([x, z, h, (hash(i, 4) - .5) * .2, hash(i, 5)]));
    st.idle = [[-24, 158, 1], [-23, 159.4, -1], [-25.2, 159.8, 1], [-31.5, 170, 1], [-30.4, 171.2, -1], [-26, 174, -1], [-36, 178, 1], [-35, 179.2, -1], [-20, 166, -1], [-21, 167.3, 1], [-27.6, 184, 1], [-40, 186, -1]].map(([x, z, d], i) => [x, z, d, CL[i % 7], HD[(i * 3) % 7], hash(i, 9)]);
    st.acacia = []; for (let i = 0; i < 2400 && st.acacia.length < 520; i++) { const z = 380 + R() * 6000, x = roadX(z) + (R() - .5) * (i % 3 ? 3600 : 160); if (Math.abs(x - roadX(z)) < 11 || Math.hypot(x - JURF[0], (z - JURF[1]) * 1.3) < 300 || Math.hypot(x - THAN[0], z - THAN[1]) < 170) continue; st.acacia.push([x, z, 2.6 + R() * 2.4, R()]); }
    // tents: the camp past the pass, the camp at al-Jurf, and the camp at Tabuk [x, z, w, d, h, colour, yaw]
    const camp = (cx, cz, rx, rz, n, keepOut) => { const out = []; for (let i = 0; i < n * 8 && out.length < n; i++) { const x = cx + (R() * 2 - 1) * rx, z = cz + (R() * 2 - 1) * rz; const rr = Math.hypot((x - cx) / rx, (z - cz) / rz); if (rr > 1 || R() < rr * .55 || keepOut(x, z) || out.some((q) => Math.abs(q[0] - x) < 6.2 && Math.abs(q[1] - z) < 5.2)) continue; const w = 3.2 + R() * 2.4; out.push([x, z, w, w * (.62 + R() * .2), 1.6 + R() * .6, TENT[R() < .14 ? 3 : (R() * 5) | 0], (R() - .5) * .5]); } return out; };
    st.tT = camp(THAN[0], THAN[1] + 24, 150, 110, 170, (x, z) => Math.hypot(x - HP1[0], (z - HP1[1]) * 1.4) < 13 || Math.abs(x - roadX(z)) < 6 || (z < 694 && Math.abs(x - 9) < 6));
    st.tJ = camp(JURF[0], JURF[1] - 60, 260, 230, 220, (x, z) => Math.hypot(x - MEET[0], z - MEET[1]) < 34 || Math.abs(x - roadX(z)) < 7);
    st.tK = camp(0, 230, 520, 260, 520, (x, z) => Math.hypot(x, z) < 15 || hT(x, z) > 6);
    // people among the tents: [x, z, kind (0 stand, 5 sit, 4 couched camel, 2 horse), dir, cloak, head, seed]
    const folk = (tents, cx, cz, rx, rz, n, keepOut) => { const out = []; for (let i = 0; i < n * 6 && out.length < n; i++) { const x = cx + (R() * 2 - 1) * rx, z = cz + (R() * 2 - 1) * rz; if (Math.hypot((x - cx) / rx, (z - cz) / rz) > 1 || keepOut(x, z) || tents.some((q) => Math.abs(q[0] - x) < q[2] * .6 && Math.abs(q[1] - z) < q[3] * .6)) continue; const r = R(); out.push([x, z, r < .14 ? 4 : r < .2 ? 2 : r < .55 ? 5 : 0, R() < .5 ? 1 : -1, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R()]); } return out; };
    st.fT = folk(st.tT, THAN[0], THAN[1] + 30, 160, 120, 300, (x, z) => Math.hypot(x - HP1[0], z - HP1[1]) < 9);
    st.fJ = folk(st.tJ, JURF[0], JURF[1], 270, 200, 420, (x, z) => Math.hypot(x - MEET[0], z - MEET[1]) < 11);
    st.fK = folk(st.tK, 0, 230, 540, 280, 1500, (x, z) => Math.hypot(x, z) < 7 || hT(x, z) > 5);
    // the knots of men round the camp's open ground near him, and the four who carry bundles to them (Qummi 1:290)
    st.nearT = [[-5.2, 709, 1], [-4.1, 709.8, -1], [-6.3, 710.6, 1], [6.2, 712, -1], [7.1, 711.2, -1], [5.4, 713.1, 1], [-9.5, 704.6, 1], [9.8, 705.5, -1], [-12, 716, 1], [12.6, 717, -1], [2.5, 719, 1], [-2, 721, -1]].map(([x, z, d], i) => [x, z, d, CL[(i + 2) % 7], HD[(i * 5 + 1) % 7], hash(i, 21)]);
    st.nearJ = [[-6, 9, 'sit'], [-7.2, 10.4, 'sit'], [-5.1, 11.6, 'stand'], [7.5, 12, 'sit'], [8.6, 13.4, 'stand'], [6.6, 14.2, 'sit'], [-11, 16, 'stand'], [11.5, 18, 'sit'], [-2.5, 19, 'sit'], [2.2, 21, 'stand'], [-9, 22.5, 'sit'], [13, 9.5, 'stand']].map(([dx, dz, a], i) => [MEET[0] + dx, MEET[1] + dz, a, (i % 2 ? 1 : -1), CL[(i + 1) % 7], HD[(i * 3 + 2) % 7], hash(i, 71)]);
    st.givers = [[-30, 742, -4.4, 712], [26, 748, 6.6, 714.4], [-22, 760, -6, 715], [34, 730, 9, 708]];
    // the column: [distance behind the head (m), lane, kind (0 foot, 2 horse, 3 camel), cloak, head, seed]: knots with gaps
    st.col = []; { let d = 0, i = 0; while (st.col.length < 1100) { const n = 5 + (R() * 11 | 0); for (let k = 0; k < n; k++) { const r = R(); st.col.push([d + R() * .8, (R() - .5) * 4.2, r < .16 ? 3 : r < .24 ? 2 : 0, CL[(i * 3 + k) % 7], HD[(i * 5 + k) % 7], R()]); d += .55 + R() * .7; } d += 3 + R() * 8; i++; } }
    // the whisperers in the lane: knots of two and three, heads together
    st.lane = [[25, -15.5, 1, .14], [25.8, -16.2, -1, .12], [24.6, -16.6, 1, .1], [27, -9.5, -1, .12], [27.8, -10.2, 1, .1], [26.6, -10.4, -1, .14], [14, -14, 1, .12], [14.8, -14.6, -1, .1], [9, -5, 1, .1], [10, -4.4, -1, .12]].map(([x, z, d, ln], i) => [x, z, d, ln, CL[(i * 2 + 1) % 7], HD[(i * 3 + 2) % 7], hash(i, 31)]);
    st.fires = st.tK.filter((_, i) => i % 6 === 2).map((q, i) => [q[0] + 3.5 * Math.cos(i * 1.7), q[1] + 3.5 * Math.sin(i * 1.7), hash(i, 41)]);
    st.stars = Array.from({ length: 900 }, () => [R(), R() ** 1.3, .3 + R() ** 3 * 1.7, R() * 9]);
    st.cloud = Array.from({ length: 6 }, () => [R(), .2 + R() * .45, .12 + R() * .2, R()]);
    // the vision: ridge lines of the mountain, the camp at its foot, the climbing path
    st.vTents = Array.from({ length: 34 }, (_, i) => [hash(i, 51), hash(i, 52), hash(i, 53)]);
    st.vPath = [[.44, 1], [.47, .93], [.42, .85], [.46, .77], [.4, .7], [.45, .6], [.42, .5], [.47, .4], [.45, .3], [.49, .2], [.48, .1], [.5, 0]];
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    const vision = p >= .715 && p < .895, tbk = p >= .94;
    if (vision) { visionShot(c, st, W, H, phone, p, t); grade(c, W, H, phone, p, 0); return; }
    const hW = tbk ? hT : hM;
    // ----- the camera: its place from the keys, its turn from the subject -----
    let cx, cyR, cz, hyF, sx, sy, sz;
    if (!tbk && p > .5 && p < .571) { // riding beside Ali, a little ahead, on the side away from the words
      const [ax, az, dirA] = roadAt(dAli(p)), side = -1, d = mix(7, 8.5, seg(p, .5, .57));
      cx = ax + Math.cos(dirA) * d * side + Math.sin(dirA) * 5; cz = az - Math.sin(dirA) * d * side + Math.cos(dirA) * 5; cyR = 1.7; hyF = .54;
      sx = ax + Math.sin(dirA) * 2.5; sy = 1.6; sz = az + Math.cos(dirA) * 2.5;
    } else {
      [cx, cyR, cz, hyF] = keyAt(tbk ? CT : CM, p);
      [sx, sy, sz] = keyAt(tbk ? ST : SM, p);
    }
    const camY = hW(cx, cz) + cyR;
    const fx = phone ? .5 : .4, ang = Math.atan2(sx - cx, sz - cz) - Math.atan((fx - .5) * W / F), ca = Math.cos(ang), sa = Math.sin(ang);
    const hy = H * (hyF + (phone ? .14 : 0));
    const VX = (x, z) => (x - cx) * ca - (z - cz) * sa, VZ = (x, z) => (x - cx) * sa + (z - cz) * ca;
    const P3 = (x, y, z) => { const v = Math.max(.4, VZ(x, z)); return [W / 2 + VX(x, z) * F / v, hy - (y - camY) * F / v, v]; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LQ, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const night = tbk ? fade(p, .965, 1.02) : 0, day = c01((elev + 2) / 10) * (1 - night * .8);
    const heat = tbk ? 0 : c01((elev - 25) / 30); // the shimmer of the noon heat
    const fogA = (zr) => Math.min(.9, (1 - Math.exp(-zr / fogL)) * .95);
    const lit = (al, lam, skyL = 1) => al.map((v, j) => v / 255 * (amb[j] * skyL * .72 + sunC[j] * lam * .84));
    const fogd = (col, zr, k = .9) => lerp(col, haze, fogA(zr) * k);
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };
    const sunV = [sun[0] * ca - sun[2] * sa, sun[0] * sa + sun[2] * ca];
    const sunX = sunV[1] > .05 ? W / 2 + sunV[0] / sunV[1] * F : sunV[0] > 0 ? W * 1.25 : -W * .25, sunY = hy - Math.tan(se) * F * .9;
    const litSide = sunV[0] >= 0 ? 1 : -1;

    // ----- the sky -----
    { const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      if (night > 0) st.stars.forEach(([u, v, m, ph]) => { const x = ((u * W * 1.2 - ang * 300) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, y = v * hy * .98; if (y > hy) return; const a = Math.min(1, m * .55 * (.65 + .35 * Math.sin(t * 1.4 + ph * 7))) * c01((hy - y) / (hy * .2)) * night; c.fillStyle = m > 1.5 ? `rgba(255,236,214,${a})` : `rgba(232,236,255,${a})`; c.fillRect(x, y, m > 1.2 ? 1.8 : 1.1, m > 1.2 ? 1.8 : 1.1); });
      const sunL = (1 - night) * c01((elev + 4) / 8);
      if (sunL > 0) {
        const g = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * 1.3); g.addColorStop(0, rgb(sunC, .42 * sunL)); g.addColorStop(.3, rgb(sunC, .12 * sunL)); g.addColorStop(1, rgb(sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
        if (sunV[1] > .05 && sunY > -20 && sunY < hy) { const q = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * .05); q.addColorStop(0, `rgba(255,252,236,${.95 * sunL})`); q.addColorStop(.4, rgb(sunC, .5 * sunL)); q.addColorStop(1, rgb(sunC, 0)); c.fillStyle = q; c.fillRect(sunX - F * .05, sunY - F * .05, F * .1, F * .1); }
      }
      if (heat > 0) { const g = c.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, 'rgba(255,250,236,0)'); g.addColorStop(1, `rgba(255,248,232,${.1 * heat})`); c.fillStyle = g; c.fillRect(0, 0, W, hy); }
      c.globalCompositeOperation = 'source-over';
      const cl = (1 - night) * (1 - heat * .7); if (cl > 0) st.cloud.forEach(([u, v, w, k]) => { const x = ((u * W * 1.5 - ang * 260) % (W * 1.5) + W * 1.5) % (W * 1.5) - W * .25, y = hy - v * hy * .9, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const cc = lerp([255, 255, 255], sunC, .35); q.addColorStop(0, rgb(cc, 0)); q.addColorStop(.5, rgb(cc, (.22 + .2 * k) * cl)); q.addColorStop(1, rgb(cc, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 7 * k, 0, 0, TAU); c.fill(); });
    }
    // ----- the land -----
    { const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2, z1 = 12000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), fa = fogA(zr), e = Math.max(1.4, zr * .015);
        for (let k = 0; k <= NK; k++) {
          const scx = -W * .06 + k * (W * 1.12 / NK), vx = (scx - W / 2) * zr / F, x = cx + vx * ca + zr * sa, z = cz - vx * sa + zr * ca, h = hW(x, z), o = i * (NK + 1) + k;
          TX[o] = scx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hW(x + e, z) - h) / e, hz = (hW(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, skyL = .62 + .38 / nl;
            const cc = lit(tbk ? groundT(x, z, h, Math.hypot(hx, hz)) : groundM(x, z, h), lam, skyL), n = (i * NC + k / 2) * 3;
            let wl = 0; if (night > 0) for (let f = 0; f < st.fires.length; f += 3) { const q = st.fires[f]; wl += Math.exp(-((x - q[0]) ** 2 + (z - q[1]) ** 2) / 90); }
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j] + ([4, 8, 26][j] + [140, 70, 20][j] * Math.min(1, wl)) * night, haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .1);
    }
    // the heat over the land: pale strips that waver along the horizon, a mirage of the sky on the far plain
    if (heat > 0) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 14; j++) { const y = hy + 1 + j * H * .006 * (1 + j * .2), a = .03 * heat * (1 - j / 14) * (.6 + .4 * Math.sin(t * 2.3 + j * 1.7)); const g = c.createLinearGradient(0, 0, W, 0); for (let q = 0; q <= 8; q++) g.addColorStop(q / 8, rgb(lerp(skH, [255, 252, 240], .4), a * (.4 + .6 * (.5 + .5 * Math.sin(q * 2.1 + t * 1.6 + j))))); c.fillStyle = g; c.fillRect(0, y, W, H * .006 + 1); }
      c.restore();
      const g = c.createLinearGradient(0, hy - 2, 0, hy + H * .025); g.addColorStop(0, rgb(skH, 0)); g.addColorStop(.4, rgb(lerp(skH, skM, .3), .3 * heat)); g.addColorStop(1, rgb(skH, 0)); c.fillStyle = g; c.fillRect(0, hy - 2, W, H * .025 + 2);
    }
    // ----- shared painters -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.4, shH / Math.max(.1, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [44, 34, 52], .66), shA = .42 * day + .06 + .06 * night;
    const shadow = (x, z, hm, w, a = .3) => {
      const vz = VZ(x, z); if (vz < 1) return;
      a *= shA / .38; const y0 = hW(x, z);
      const [X0, Y0] = P3(x, y0, z), [X1, Y1] = P3(x + shD[0] * hm, y0, z + shD[1] * hm), ww = w * F / vz;
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * Math.max(.16, Math.min(.5, (camY - y0) / vz * 1.2))); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      if (Math.hypot(X1 - X0, Y1 - Y0) > 2) { const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .8)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2; c.beginPath(); c.moveTo(X0 - ww * .4, Y0); c.lineTo(X1 - ww * .18, Y1); c.lineTo(X1 + ww * .18, Y1); c.lineTo(X0 + ww * .4, Y0); c.closePath(); c.fill(); }
    };
    const glow = (X, Y, R0, col, a) => { if (a <= 0 || R0 <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, R0); g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(X - R0, Y - R0, 2 * R0, 2 * R0); c.restore(); };
    const quad = (pts, col) => { // clipped at a near plane, so faces that run behind the camera stay whole and true
      const NP = .5, q = [];
      pts.forEach((A, i) => { const B = pts[(i + 1) % pts.length], va = VZ(A[0], A[2]), vb = VZ(B[0], B[2]); if (va >= NP) q.push(A); if ((va >= NP) !== (vb >= NP)) { const k = (NP - va) / (vb - va); q.push([mix(A[0], B[0], k), mix(A[1], B[1], k), mix(A[2], B[2], k)]); } });
      if (q.length < 3) return; const a = q.map(([x, y, z]) => P3(x, y, z)); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    const wallC = (base, lam, zr, a = .72) => fogd(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), zr);
    const slab = (x0, x1, z0, z1, h, alb, y0 = 0, cn = 0, key) => {
      const zr = VZ((x0 + x1) / 2, (z0 + z1) / 2); if (zr < -Math.max(x1 - x0, z1 - z0)) return;
      items.push([key ?? zr + Math.max(x1 - x0, z1 - z0) * .35, () => {
        const big = cn && F / Math.max(1, zr) > 12;
        const face = (pts, lam) => { const col = wallC(alb, lam, Math.max(1, zr)); quad(pts, rgb(col)); if (big) { c.strokeStyle = rgb(lerp(col, [40, 30, 24], .3), .6); c.lineWidth = 1; c.beginPath(); for (let r = 1; r <= cn; r++) { const u = r / (cn + 1), A = P3(pts[0][0], y0 + h * u, pts[0][2]), B = P3(pts[1][0], y0 + h * u, pts[1][2]); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); } };
        if (cx < x0) face([[x0, y0, z0], [x0, y0, z1], [x0, y0 + h, z1], [x0, y0 + h, z0]], Math.max(0, -sun[0]));
        if (cx > x1) face([[x1, y0, z0], [x1, y0, z1], [x1, y0 + h, z1], [x1, y0 + h, z0]], Math.max(0, sun[0]));
        if (cz < z0) face([[x0, y0, z0], [x1, y0, z0], [x1, y0 + h, z0], [x0, y0 + h, z0]], Math.max(0, -sun[2]));
        if (cz > z1) face([[x0, y0, z1], [x1, y0, z1], [x1, y0 + h, z1], [x0, y0 + h, z1]], Math.max(0, sun[2]));
        if (camY > y0 + h) quad([[x0, y0 + h, z0], [x1, y0 + h, z0], [x1, y0 + h, z1], [x0, y0 + h, z1]], rgb(lerp(wallC(alb, Math.max(0, sun[1]), Math.max(1, zr), .8), [255, 246, 226], .06)));
      }]);
    };
    // a figure: one faceless outline blended between two poses; dir ±1 (screen facing); o.hd the head cloth
    const person = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8 || (o.alpha ?? 1) <= 0) return null;
      const s = F / vz * (o.sc || 1), X = W / 2 + VX(x, z) * F / vz; if (X < -3 * s || X > W + 3 * s) return null;
      const Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, A = SH[o.a || 'stand'], B = SH[o.b || o.a || 'stand'], k = o.k || 0, ln = o.lean || 0;
      const pts = A.map((v, i) => mix(v, B[i], k)), hc = lerp(HC[o.a || 'stand'], HC[o.b || o.a || 'stand'], k), sho = lerp(SHO[o.a || 'stand'], SHO[o.b || o.a || 'stand'], k);
      const zr = vz, nl = o.nl ?? 1;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * o.dir, -s);
      const lu = litSide * o.dir, base = fogd(lit(o.cl, .18 * day + .02, .9 * nl), zr, .8), hi = fogd(lit(lerp(o.cl, [255, 236, 206], .1), .95 * day + .1, nl), zr, .8);
      const P = (i) => [pts[2 * i] + ln * pts[2 * i + 1], pts[2 * i + 1]];
      c.beginPath(); for (let i = 0; i < 16; i++) { const q = P(i); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath();
      const g = c.createLinearGradient(-.3 * lu, 0, .3 * lu, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.5, rgb(lerp(hi, base, .65))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
      c.strokeStyle = `rgba(28,20,14,${.35 + .2 * night})`; c.lineWidth = .025; c.stroke();
      if (o.rim) { c.strokeStyle = `rgba(${o.rimC || '255,220,160'},${o.rim})`; c.lineWidth = .05; c.stroke(); }
      { const fr = (o.a || 'stand') === 'front', robe = fogd(lit([214, 198, 166], .55 * day + .1, nl), zr, .8), wb = sho[1] * .66; // the robe under the open cloak, and a sash
        c.save(); c.clip(); c.fillStyle = rgb(robe); c.beginPath(); if (fr) { c.moveTo(-.05, 0); c.lineTo(.05, 0); c.lineTo(.03, wb); c.lineTo(-.03, wb); } else { c.moveTo(.06, 0); c.lineTo(.3, 0); c.lineTo(.2 + ln * wb, wb); c.lineTo(.1 + ln * wb, wb); } c.closePath(); c.fill();
        c.fillStyle = rgb(lerp(base, [30, 22, 16], .25)); c.fillRect(-.4, wb - .03, .8, .05); c.restore(); }
      const sx0 = sho[0] + ln * sho[1], sy0 = sho[1];
      c.strokeStyle = rgb(lerp(base, hi, .35)); c.lineWidth = .11; c.lineCap = 'round';
      (o.arms || [[sho[0] + .06, sho[1] - .55]]).forEach(([ax, ay]) => { c.beginPath(); c.moveTo(sx0, sy0); c.quadraticCurveTo(mix(sx0, ax, .5) - .06, mix(sy0, ay, .5) - .04, ax, ay); c.stroke(); });
      if (o.load) { const [ax, ay] = (o.arms || [[.3, 1.2]])[0]; c.fillStyle = rgb(fogd(lit([186, 164, 124], .7 * day + .1), zr, .8)); c.beginPath(); c.ellipse(ax + .06, ay + .12, .26, .18, .2, 0, TAU); c.fill(); c.strokeStyle = rgb(fogd(lit([120, 96, 66], .3 * day + .06), zr, .8), .7); c.lineWidth = .02; c.stroke(); }
      const hx = hc[0] + ln * hc[1], hv = hc[1];
      const hdc = fogd(lit(o.hd, .75 * day + .12, nl), zr, .8), hdd = fogd(lit(o.hd, .26 * day + .07, .85 * nl), zr, .8);
      const b5 = P(5), b4 = P(4);
      c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .9) - .035, mix(b5[1], b4[1], .9)); c.lineTo(mix(b5[0], b4[0], .9) + .07, mix(b5[1], b4[1], .9) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill();
      const q = c.createLinearGradient(hx - .14 * lu, 0, hx + .14 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
      c.fillStyle = q; c.beginPath(); c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
      c.restore();
      return { X, Y, s, hx: X + hx * s * o.dir, hy: Y - hv * s, hands: (o.arms || []).map(([ax, ay]) => [X + (ax + ln * ay) * s * o.dir, Y - ay * s]) };
    };
    const holy = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8) return null;
      const X = W / 2 + VX(x, z) * F / vz, Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, h = 1.8 * F / vz * (o.sc || 1);
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, amb: .3 + .7 * (1 - night), ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; hd.X = X; hd.Y = Y; return hd;
    };
    // a near horse or camel (rider or none), shaded, with walking legs; standing: still legs
    const mount = (x, z, dir, ph, moving, cl, hd, kind = 2, rider = true) => {
      const vz = VZ(x, z); if (vz < 1) return null; const s = F / vz, X = W / 2 + VX(x, z) * F / vz, Y = hy - (hW(x, z) - camY) * F / vz;
      const bob = moving ? Math.abs(Math.sin(ph)) * .05 * s : 0, coat = kind === 3 ? [176, 140, 96] : [96, 68, 48], lam = .55 * day + .1;
      const top = fogd(lit(lerp(coat, [255, 240, 210], .08), lam + .3 * day, 1), vz, .8), bot = fogd(lit(coat, .12 * day + .04, .8), vz, .8), dark = lerp(bot, [20, 14, 10], .35);
      const LEG = kind === 3 ? [[.68, 0, 1.28], [.8, 1.6, 1.28], [-.72, 3.1, 1.28], [-.84, 4.7, 1.28]] : [[.62, 0, 1.12], [.74, 1.6, 1.12], [-.74, 3.1, 1.12], [-.86, 4.7, 1.12]];
      c.lineCap = 'round';
      LEG.forEach(([hu, o, lh], i) => { const a = Math.sin(ph + o) * (moving ? .45 : .05), far = i % 2 === 0; c.strokeStyle = rgb(far ? dark : bot); c.lineWidth = Math.max(.8, (kind === 3 ? .1 : .085) * s); c.beginPath(); c.moveTo(X + hu * s * dir, Y - lh * s - bob); c.lineTo(X + (hu + a * .45) * s * dir, Y - lh * .48 * s + Math.abs(a) * .2 * s); c.lineTo(X + (hu + a * .25) * s * dir, Y); c.stroke(); });
      const pa = new Path2D(); poly(pa, kind === 3 ? CAMEL : HORSE, X, Y - bob, s, dir);
      const g = c.createLinearGradient(0, Y - 2.1 * s, 0, Y - 1 * s); g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot)); c.fillStyle = g; c.fill(pa);
      if (kind === 2) { c.strokeStyle = rgb(dark); c.lineWidth = Math.max(.7, .07 * s); c.beginPath(); c.moveTo(X - 1.12 * s * dir, Y - 1.4 * s - bob); c.quadraticCurveTo(X - 1.32 * s * dir, Y - 1.0 * s, X - 1.24 * s * dir + Math.sin(t * 2 + ph) * .04 * s, Y - .7 * s); c.stroke(); }
      if (!rider) return { X, Y, s, head: [X + 1.22 * dir * s, Y - bob - 1.8 * s] };
      const ry = Y - bob - (kind === 3 ? .55 : 0) * s, rx = X + (kind === 3 ? -.25 : -.1) * s * dir, rp = new Path2D(); poly(rp, RIDER, rx, ry, s, dir);
      rp.moveTo(rx - .26 * s * dir, ry - 1.62 * s); rp.quadraticCurveTo(rx - .5 * s * dir, ry - 1.4 * s, rx - .42 * s * dir, ry - 1.12 * s); rp.lineTo(rx + .36 * s * dir, ry - 1.1 * s); rp.quadraticCurveTo(rx + .4 * s * dir, ry - 1.4 * s, rx + .22 * s * dir, ry - 1.62 * s); rp.closePath();
      const cg = c.createLinearGradient(rx - .3 * s * litSide, 0, rx + .3 * s * litSide, 0); cg.addColorStop(0, rgb(fogd(lit(cl, .9 * day + .1), vz, .8))); cg.addColorStop(1, rgb(fogd(lit(cl, .15 * day + .04, .85), vz, .8))); c.fillStyle = cg; c.fill(rp);
      const hc = fogd(lit(hd, .85 * day + .12), vz, .8); c.fillStyle = rgb(hc); c.beginPath(); c.ellipse(rx - .02 * s * dir, ry - 2.3 * s, .15 * s, .12 * s, 0, 0, TAU); c.fill();
      c.fillStyle = rgb(lerp(hc, [30, 22, 16], .3)); c.beginPath(); c.moveTo(rx - .1 * s * dir, ry - 2.32 * s); c.quadraticCurveTo(rx - .22 * s * dir, ry - 2.1 * s, rx - .2 * s * dir, ry - 1.9 * s); c.lineTo(rx - .1 * s * dir, ry - 1.95 * s); c.closePath(); c.fill();
      return { X: rx, Y: ry, s };
    };
    // ----- crowds, batched by depth band. Every size reads as a person: a cloak and a separate head over a neck notch;
    //       the nearest go to the depth-sorted list as full figures -----
    const BANDS = [140, 520, 1600, 1e9], NB = BANDS.length, TONES = [[92, 70, 52], [66, 62, 64], [116, 86, 60]], bodyP = BANDS.map(() => TONES.map(() => new Path2D())), headP = BANDS.map(() => new Path2D()), legP = new Path2D();
    const bandOf = (vz) => { let b = 0; while (vz > BANDS[b]) b++; return b; };
    const crowd = (kind, x, z, dir, ph, moving, k, o = {}) => {
      const vz = VZ(x, z); if (vz < 2) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -40 || X > W + 40) return;
      const Y = hy - (hW(x, z) - camY) * F / vz, s = F / vz * (.93 + .14 * k), b = bandOf(vz), pa = bodyP[b][(k * 7 | 0) % 3], hp = headP[b], hpx = 1.8 * s;
      if (hpx > 28) { items.push([vz, () => {
        if (kind === 2 || kind === 3) { shadow(x, z, 2.2, 1.1, .24); mount(x, z, dir, ph, moving, o.cl, o.hd, kind, !o.empty); }
        else if (kind === 4) { shadow(x, z, 1.2, 1.2, .24); const pc = new Path2D(); poly(pc, CAMELK, X, Y, s, dir); c.fillStyle = rgb(fogd(lit([176, 140, 96], .5 * day + .12), vz, .8)); c.fill(pc); c.strokeStyle = rgb(fogd(lit([90, 66, 44], .2 * day + .05), vz, .8), .5); c.lineWidth = Math.max(.6, .02 * s); c.stroke(pc); }
        else { shadow(x, z, kind === 5 ? 1 : 1.7, .5, .24); person(x, z, { a: kind === 5 ? 'sit' : 'stand', dir, cl: o.cl, hd: o.hd, lean: o.lean ?? (moving ? .05 : 0), arms: o.arms, load: o.load, rim: .1 }); }
      }]); return; }
      const bob = moving ? Math.abs(Math.sin(ph)) * .04 * s : 0;
      if (kind === 2 || kind === 3) { // horse or camel with its rider
        const sh = kind === 3 ? CAMEL : HORSE, lh = kind === 3 ? 1.28 : 1.12;
        if (hpx >= 4.5) { poly(pa, sh, X, Y - bob, s, dir); [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, q]) => { const a = Math.sin(ph + q) * (moving ? .45 : .05); legP.moveTo(X + hu * s * dir, Y - lh * s); legP.lineTo(X + (hu + a * .5) * s * dir, Y - lh * .46 * s); legP.lineTo(X + (hu + a * .3) * s * dir, Y); }); }
        else { const w = Math.max(2.2, 2.1 * s), hh = Math.max(1.4, .8 * s), yb = Y - Math.max(1.2, lh * s); pa.moveTo(X - w / 2, yb); pa.quadraticCurveTo(X, yb - hh * 1.4, X + w / 2, yb); pa.lineTo(X + w * .36, Y); pa.lineTo(X + w * .26, yb + .5); pa.lineTo(X - w * .26, yb + .5); pa.lineTo(X - w * .36, Y); pa.closePath(); }
        if (!o.empty) { const ry = Y - bob - Math.max(kind === 3 ? 2.6 : 2.2, (kind === 3 ? 2.05 : 1.48) * s), rw = Math.max(.9, .44 * s), rh = Math.max(1.6, .82 * s), hr = Math.max(.7, .15 * s), rx = X - (kind === 3 ? .25 : .1) * s * dir;
          pa.moveTo(rx - rw / 2, ry); pa.lineTo(rx - rw * .32, ry - rh); pa.lineTo(rx + rw * .32, ry - rh); pa.lineTo(rx + rw / 2, ry); pa.closePath();
          hp.moveTo(rx + hr, ry - rh - hr * 1.2); hp.arc(rx, ry - rh - hr * 1.2, hr, 0, TAU); }
        return;
      }
      if (kind === 4) { if (hpx >= 4.5) poly(pa, CAMELK, X, Y, s, dir); else { const w = Math.max(2, 2.1 * s), hh = Math.max(1.1, 1.1 * s); pa.moveTo(X - w / 2, Y); pa.quadraticCurveTo(X - w * .1, Y - hh * 1.6, X + w * .3, Y - hh * .6); pa.lineTo(X + w * .5, Y - hh * 1.2); pa.lineTo(X + w * .56, Y); pa.closePath(); } return; }
      const sit = kind === 5, ln = (o.lean ?? (moving ? .06 : .015 * Math.sin(k * 40))) * dir;
      if (hpx >= 7) { poly(pa, sit ? SITS : hpx < 14 ? MANS : MAN, X, Y - bob, s, dir, ln); const hr = .15 * s, hv = (sit ? 1.0 : hpx < 14 ? 1.65 : 1.66) * s; hp.moveTo(X + ln * hv + hr, Y - bob - hv); hp.ellipse(X + ln * hv, Y - bob - hv, hr, hr * .85, 0, 0, TAU); return; }
      // small: a tapered cloak and a head set clear of the shoulders (never a post)
      const hh = Math.max(sit ? 1.6 : 2.3, (sit ? .78 : 1.42) * s), bw = Math.max(sit ? 1.6 : 1.05, (sit ? .8 : .6) * s), sw = Math.max(.7, .36 * s), hr = Math.max(.62, .14 * s), lx = ln * hh;
      pa.moveTo(X - bw / 2, Y - bob); pa.lineTo(X - sw / 2 + lx, Y - bob - hh); pa.lineTo(X + sw / 2 + lx, Y - bob - hh); pa.lineTo(X + bw / 2, Y - bob); pa.closePath();
      hp.moveTo(X + lx * 1.1 + hr, Y - bob - hh - hr * 1.25); hp.arc(X + lx * 1.1, Y - bob - hh - hr * 1.25, hr, 0, TAU);
    };
    const flushCrowd = (tone = [96, 74, 56], hdTone = [170, 136, 92]) => {
      for (let b = NB - 1; b >= 0; b--) {
        const fa = Math.min(.82, fogA([70, 300, 1000, 2600][b])), sh = .55 + .45 * day;
        TONES.forEach((tn, j) => { c.fillStyle = rgb(lerp(lit(lerp(tn, tone, .2), .35 * day + .08), haze, fa).map((v) => v * (b < 2 ? sh : 1))); c.fill(bodyP[b][j]); bodyP[b][j] = new Path2D(); });
        c.fillStyle = rgb(lerp(lit(hdTone, .9 * day + .14), haze, fa * .85)); c.fill(headP[b]);
        headP[b] = new Path2D();
      }
      c.strokeStyle = rgb([34, 26, 20], .8); c.lineWidth = Math.max(.7, F / 1600); c.stroke(legP);
    };
    // a tent: a ridge roof of goat hair or hide on poles, its gable and the slope toward the camera; far ones batched
    const tentFar = [new Path2D(), new Path2D()];
    const tent = (x, z, w, d, h, col, yaw) => {
      const vz = VZ(x, z); if (vz < 3) return; const X = W / 2 + VX(x, z) * F / vz, s = F / vz; if (X < -w * s - 20 || X > W + w * s + 20) return;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), at = (u, v, y) => P3(x + u * cy - v * sy, hW(x, z) + y, z + u * sy + v * cy);
      if (s * w < 7) { const [Xa, Ya] = at(-w / 2, 0, h), [Xb, Yb] = at(w / 2, 0, h), [Xc, Yc] = at(w / 2, 0, 0), [Xd, Yd] = at(-w / 2, 0, 0), dk = tentFar[col[0] > 150 ? 1 : 0]; const e = Math.max(.8, (Yc - Yb) * .5); dk.moveTo(Xd - e, Yd); dk.lineTo(Xa, Ya); dk.lineTo(Xb, Yb); dk.lineTo(Xc + e, Yc); dk.closePath(); return; }
      items.push([vz + d * .3, () => {
        const ev = h * .42, sideV = VZ(x - sy, z + cy) < VZ(x + sy, z - cy) ? 1 : -1, end = VX(x + cy, z + sy) - VX(x - cy, z - sy) > 0 ? (VZ(x + cy * w, z + sy * w) < VZ(x - cy * w, z - sy * w) ? 1 : -1) : 1;
        const slope = (sg, lam) => { const pts = [at(-w / 2, sg * d / 2, ev), at(w / 2, sg * d / 2, ev), at(w / 2, 0, h), at(-w / 2, 0, h)]; c.fillStyle = rgb(fogd(lit(col, lam * day + .06, .9), vz, .85)); c.beginPath(); pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill(); };
        shadow(x, z, h, w * .55, .2);
        slope(-sideV, .2); slope(sideV, .25 + .75 * Math.max(0, sun[1] * .6 + (sideV * (sun[2] * cy - sun[0] * sy)) * .6));
        const g0 = at(end * w / 2, -d / 2, ev), g1 = at(end * w / 2, 0, h), g2 = at(end * w / 2, d / 2, ev), g3 = at(end * w / 2, d / 2, 0), g4 = at(end * w / 2, -d / 2, 0);
        c.fillStyle = rgb(fogd(lit(lerp(col, [20, 16, 14], .3), .12 * day + .04, .8), vz, .85)); c.beginPath(); [g4, g0, g1, g2, g3].forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
        c.strokeStyle = rgb(fogd(lit([70, 52, 36], .3 * day + .06), vz, .85)); c.lineWidth = Math.max(.6, .05 * s); const pl = at(end * w / 2, 0, 0); c.beginPath(); c.moveTo(pl[0], pl[1]); c.lineTo(g1[0], g1[1] - .2 * s); c.stroke();
      }]);
    };
    const flushTents = () => { const fa = .6; c.fillStyle = rgb(lerp(lit(TENT[0], .2 * day + .06, .9), haze, fogA(400) * fa)); c.fill(tentFar[0]); c.fillStyle = rgb(lerp(lit(TENT[3], .7 * day + .1, .9), haze, fogA(400) * fa)); c.fill(tentFar[1]); tentFar[0] = new Path2D(); tentFar[1] = new Path2D(); };
    const dipK = Math.max(...CUTS.map((d) => bump(p, ...d))), goldK = Math.max(...GOLD.map((d) => bump(p, ...d)));

    // ----- the ground near the camera: stones and dry tufts on a fixed world grid -----
    { const G = 2.6, R0 = 80, i0 = Math.floor((cx - R0) / G), i1 = Math.ceil((cx + R0) / G), j0 = Math.floor((cz - R0) / G), j1 = Math.ceil((cz + R0) / G);
      const tuftP = new Path2D(), stoneP = new Path2D(), stoneT = new Path2D(), shP = new Path2D(), dens = tbk ? .45 : cz > 300 ? .55 : .25;
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const hh = hash(i, j, 7); if (hh > dens) continue;
        const x = (i + hash(i, j, 1)) * G, z = (j + hash(i, j, 2)) * G, vz = VZ(x, z); if (vz < 1.2 || vz > R0) continue;
        if (!tbk && ((x > MOS[0] - 1 && x < MOS[1] + 1 && z > MOS[2] - 1 && z < MOS[3] + 1) || st.houses.some((H) => x > H[0] - .5 && x < H[1] + .5 && z > H[2] - .5 && z < H[3] + .5))) continue;
        if (Math.hypot(x - (tbk ? 0 : cz > 2000 ? MEET[0] : HP1[0]), z - (tbk ? 0 : cz > 2000 ? MEET[1] : HP1[1])) < 4) continue;
        const s = F / vz, X = W / 2 + VX(x, z) * F / vz; if (X < -20 || X > W + 20) continue;
        const Y = hy - (hW(x, z) - camY) * F / vz, k = hash(i, j, 3), r = (.12 + .35 * k * k) * s;
        if (r < .6) continue;
        if (hh < dens * .45) {
          const w = r * (1.2 + k), hgt = r * (.55 + .4 * hash(i, j, 4));
          shP.moveTo(X + w * 1.3, Y); shP.ellipse(X + w * .4 * -litSide, Y, w * 1.3, hgt * .35, 0, 0, TAU);
          stoneP.moveTo(X - w, Y); stoneP.bezierCurveTo(X - w, Y - hgt * .9, X + w * .7, Y - hgt * 1.1, X + w, Y); stoneP.closePath();
          stoneT.moveTo(X - w * .7, Y - hgt * .45); stoneT.bezierCurveTo(X - w * .5, Y - hgt * .95, X + w * .4, Y - hgt * 1.0, X + w * .55, Y - hgt * .5); stoneT.quadraticCurveTo(X, Y - hgt * .62, X - w * .7, Y - hgt * .45); stoneT.closePath();
        } else {
          for (let q = 0; q < 6; q++) { const a = (q / 5 - .5) * 1.5 + (hash(i, j, q) - .5) * .4, L = r * (1.4 + hash(q, i, j)); tuftP.moveTo(X + (q - 2.5) * r * .12, Y); tuftP.quadraticCurveTo(X + Math.sin(a) * L * .4, Y - L * .6, X + Math.sin(a) * L, Y - Math.cos(a) * L * .9); }
        }
      }
      c.fillStyle = rgb(shCol, .3 * (.4 + .6 * day)); c.fill(shP);
      const stc = lit(tbk ? [150, 104, 80] : [140, 116, 92], .3 * day + .06, .85), stt = lit(tbk ? [226, 186, 150] : [222, 204, 170], day + .1, 1);
      c.fillStyle = rgb(stc); c.fill(stoneP); c.fillStyle = rgb(lerp(stc, stt, .55), .8); c.fill(stoneT);
      c.strokeStyle = rgb(lit([150, 132, 82], .7 * day + .1, 1), .85); c.lineWidth = Math.max(.7, F / 900); c.lineCap = 'round'; c.stroke(tuftP);
    }

    if (tbk) {
      // ================= Tabuk =================
      st.tK.forEach((q) => tent(...q)); flushTents();
      const sitters = []; st.fires.forEach(([x, z, k], i) => { for (let j = 0; j < 3; j++) { const a = j * 2.1 + k * 6; sitters.push([x + Math.cos(a) * 1.4, z + Math.sin(a) * 1.4, Math.cos(a) > 0 ? -1 : 1, i * 3 + j]); } });
      st.fK.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true }));
      sitters.forEach(([x, z, dir, i]) => crowd(5, x, z, dir, 0, false, hash(i, 2), { cl: CL[i % 7], hd: HD[(i * 3) % 7] }));
      flushCrowd();
      draw();
      // the fires: lit as the dusk deepens
      const fl = fade(p, .955, 1);
      if (fl > 0) st.fires.forEach(([x, z, k]) => { const vz = VZ(x, z); if (vz < 3) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -30 || X > W + 30) return; const s = F / vz, Y = hy - (hW(x, z) + .3 - camY) * F / vz, f = .8 + .2 * Math.sin(t * 9 + k * 30) * Math.sin(t * 5.3 + k * 11); glow(X, Y, Math.max(4, 6 * s) * f, [255, 150, 70], .4 * fl); glow(X, Y, Math.max(1.4, .9 * s) * f, [255, 228, 170], .9 * fl); });
      // near: he stands on the rise, a few of his companions about him
      items.push([VZ(0, 0), () => { shadow(0, 0, 1.8, .6, .3); holy(0, 0, { pose: 'stand', glow: .2 + .4 * night, arms: [[.16, -.62]] }); }]);
      items.push([VZ(2.1, .6), () => { shadow(2.1, .6, 1.7, .5, .26); person(2.1, .6, { a: 'stand', dir: -1, cl: [104, 82, 62], hd: [128, 98, 66], rim: .25 * night, rimC: '255,180,110' }); }]);
      [[-3.5, 4.6, 1], [5.6, 6.2, -1], [-6.4, 9, 1], [4.2, 11.5, -1]].forEach(([x, z, d], i) => items.push([VZ(x, z), () => { shadow(x, z, 1.7, .5, .24); person(x, z, { a: i % 2 ? 'sit' : 'stand', dir: d, cl: CL[(i + 3) % 7], hd: HD[(i + 1) % 7], rim: .2 * night, rimC: '255,180,110' }); }]));
      draw();
      if (night > 0) { const g = c.createLinearGradient(0, hy + H * .04, 0, H); g.addColorStop(0, 'rgba(14,16,46,0)'); g.addColorStop(1, `rgba(8,16,44,${.45 * night})`); c.fillStyle = g; c.fillRect(0, hy, W, H - hy); }
    } else {
      // ================= Medina and the plain =================
      // acacias on the plain: a short trunk and a flat crown; far ones a dab
      st.acacia.forEach(([x, z, r, k]) => { const vz = VZ(x, z); if (vz < 3 || vz > 3500) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -60 || X > W + 60) return;
        items.push([vz, () => {
          const s = F / vz, Y = hy - (hW(x, z) - camY) * F / vz, hh = r * .9, col = fogd(lit([82, 92, 52], .45 * day + .08, .9), vz, .92), top = fogd(lit([142, 146, 88], day + .1, 1), vz, .92);
          if (s * hh < 1.6) { c.fillStyle = rgb(col); c.fillRect(X - Math.max(1, r * s * .6), Y - Math.max(1.2, s * hh), Math.max(2, r * s * 1.2), Math.max(.8, s * hh * .35)); return; }
          c.fillStyle = rgb(shCol, .22); c.beginPath(); c.ellipse(X + shD[0] * s * hh * .4, Y, r * s * .9, r * s * .18, 0, 0, TAU); c.fill();
          c.strokeStyle = rgb(fogd(lit([92, 72, 54], .4 * day + .1, .9), vz, .92)); c.lineWidth = Math.max(.8, .18 * s); c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X + (k - .5) * .5 * s, Y - hh * .5 * s, X + (k - .5) * .2 * s, Y - hh * s); c.moveTo(X + (k - .5) * .25 * s, Y - hh * .6 * s); c.lineTo(X + (k - .2) * r * .7 * s, Y - hh * .95 * s); c.stroke();
          for (let j = 0; j < 5; j++) { const ox = (j / 4 - .5) * r * 1.5 + (hash(j, k) - .5) * .4 * r, oy = hh * (.95 + .12 * hash(k, j)); c.fillStyle = rgb(j % 2 ? col : lerp(col, top, .4)); c.beginPath(); c.ellipse(X + ox * s, Y - oy * s, r * s * (.38 + .12 * hash(j, 3)), r * s * .13, 0, 0, TAU); c.fill(); }
          c.fillStyle = rgb(top, .35); c.beginPath(); c.ellipse(X, Y - hh * 1.04 * s, r * s * .8, r * s * .07, 0, 0, TAU); c.fill();
        }]); });
      // houses, with a door on the south face
      st.houses.forEach(([x0, x1, z0, z1, h, col, lamp, dx]) => {
        slab(x0, x1, z0, z1, h, col, 0, 4); slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .25, lerp(col, [236, 214, 176], .2), h, 0, VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .05);
        if (cz > z0) return;
        items.push([VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .1, () => {
          const zr = VZ(dx, z0); if (zr < 1.5) return; const a = P3(dx - .5, 0, z0 - .01), b = P3(dx + .5, Math.min(h, 1.95), z0 - .01), s = F / zr;
          if (s < 1.6) return;
          c.fillStyle = rgb(wallC([66, 50, 38], .05, zr)); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
          if (s > 9) { c.fillStyle = rgb(wallC([88, 66, 44], .3, zr)); for (let j = 0; j < Math.floor((x1 - x0) / .9); j++) { const q = P3(x0 + .45 + j * .9, h - .3, z0 - .02); c.fillRect(q[0] - .08 * s, q[1] - .08 * s, .16 * s, .16 * s); } }
        }]);
      });
      // palms; near ones hang with ripe dates (Irshad 1:154 «وقد أينعت ثمارهم»)
      st.palms.forEach(([x, z, ht, lean, k]) => {
        const zr = VZ(x, z); if (zr < 1.5 || zr > 2600) return; const X = W / 2 + VX(x, z) * F / zr; if (X < -ht * F / zr || X > W + ht * F / zr) return;
        items.push([zr, () => {
          const s = F / zr, Y = hy - (hW(x, z) - camY) * F / zr, tx = X + lean * ht * s, ty = Y - ht * s, sw = Math.sin(t * .7 + k * 9) * .012 * ht * s;
          const trunk = fogd(lit([112, 90, 70], .45 * day + .1, .9), zr, .92), dark = fogd(lit([40, 66, 40], .2 * day + .05, .8), zr, .92), leaf = fogd(lit([66, 112, 60], .75 * day + .1, 1), zr, .92), dry = fogd(lit([150, 120, 74], .6 * day + .1, 1), zr, .92);
          if (s < 1.2) { if (s > .35) { c.fillStyle = rgb(trunk); c.fillRect(X - Math.max(.35, .14 * s), ty, Math.max(.7, .28 * s), Y - ty); }
            c.strokeStyle = rgb(lerp(dark, leaf, .4)); c.lineWidth = Math.max(.7, .5 * s); c.beginPath(); for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI + k * 3, L = Math.max(1.6, 2.6 * s); c.moveTo(tx, ty); c.lineTo(tx + Math.cos(a) * L, ty - Math.sin(a) * L * .55 + L * .25); } c.stroke(); return; }
          if (zr > 4) shadow(x, z, ht * .35, 2.2, .14 * c01(s / 6));
          c.fillStyle = rgb(trunk); c.beginPath(); tube(c, [[X, Y], [mix(X, tx, .5) + lean * .1 * ht * s, mix(Y, ty, .5)], [tx, ty]], Math.max(1, .42 * s), Math.max(.8, .28 * s)); c.fill();
          if (s > 5) { c.strokeStyle = rgb(lerp(trunk, [30, 24, 20], .35), .6); c.lineWidth = Math.max(.5, .03 * s); c.beginPath(); for (let j = 1; j < ht * 3; j++) { const u = j / (ht * 3), qx = mix(X, tx, u), qy = mix(Y, ty, u), w = mix(.21, .14, u) * s; c.moveTo(qx - w, qy + .03 * s); c.lineTo(qx + w, qy - .03 * s); } c.stroke(); }
          const nf = s > 4 ? 13 : 8;
          for (let j = 0; j < nf; j++) {
            const a = (j / nf) * TAU + k * 6, side = Math.cos(a), dep = Math.sin(a), L = (2.4 + .9 * hash(j, k)) * s * Math.min(1, ht / 3), droop = (.5 + .5 * Math.abs(dep)) * L * .55, dead = j % 5 === 0 && hash(j, k * 3) < .5;
            const ex = tx + side * L + sw, ey = ty + droop + (dead ? L * .3 : 0), mx = tx + side * L * .55 + sw * .5, my = ty - L * .28 * (1 - Math.abs(dep) * .4);
            c.fillStyle = rgb(dead ? dry : dep > 0 ? dark : leaf);
            c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my - .14 * s, ex, ey); c.quadraticCurveTo(mx, my + .16 * s, tx, ty + .1 * s); c.fill();
          }
          if (s > 2.2) for (let j = 0; j < 4; j++) { // bunches of ripe dates hanging under the crown, amber to red
            const a = j * 1.7 + k * 5, bx = tx + Math.cos(a) * .55 * s, by = ty + (.35 + .25 * hash(j, k)) * s, L = (.7 + .3 * hash(k, j)) * s;
            c.strokeStyle = rgb(fogd(lit([196, 150, 60], .7 * day + .1), zr, .92)); c.lineWidth = Math.max(.5, .05 * s); c.beginPath(); c.moveTo(tx + Math.cos(a) * .2 * s, ty + .1 * s); c.quadraticCurveTo(bx, by - L * .3, bx, by); c.stroke();
            const col = fogd(lit(j % 2 ? [176, 74, 34] : [204, 120, 40], .65 * day + .12), zr, .92);
            if (s > 7) for (let q = 0; q < 14; q++) { const u = hash(q, j, k); c.fillStyle = rgb(lerp(col, [90, 34, 20], (q % 3) * .15)); c.beginPath(); c.ellipse(bx + (u - .5) * .36 * s, by + (q / 14) * L, .06 * s, .08 * s, 0, 0, TAU); c.fill(); }
            else { c.fillStyle = rgb(col); c.beginPath(); c.ellipse(bx, by + L * .45, .2 * s, L * .5, 0, 0, TAU); c.fill(); }
          }
          c.fillStyle = rgb(lerp(trunk, dark, .5)); c.beginPath(); c.arc(tx, ty, .22 * s, 0, TAU); c.fill();
        }]);
      });
      // the mosque: the yard, its low walls (a gate in the north wall), the shade of fronds along the south wall
      const [mx0, mx1, mz0, mz1] = MOS, alb = [200, 166, 122];
      if (VZ(0, 0) > -40 && VZ(0, 0) < 900) {
        quad([[mx0, .01, mz0], [mx1, .01, mz0], [mx1, .01, mz1], [mx0, .01, mz1]], rgb(fogd(lit([226, 206, 166], Math.max(0, sun[1]) * .9 * day, 1), 20)));
        quad([[ROOF[0], .015, ROOF[2]], [ROOF[1], .015, ROOF[2]], [ROOF[1], .015, ROOF[3]], [ROOF[0], .015, ROOF[3]]], rgb(lit([150, 128, 96], .08, .85), .6));
        slab(mx0 - .5, mx0, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx1, mx1 + .5, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx0 - .5, mx1 + .5, mz0 - .5, mz0, WALLH, alb, 0, 3);
        slab(mx0 - .5, -1.6, mz1, mz1 + .5, WALLH, alb, 0, 3); slab(1.6, mx1 + .5, mz1, mz1 + .5, WALLH, alb, 0, 3);
        for (let j = 0; j < 10; j++) { const x = mix(ROOF[0] + .4, ROOF[1] - .4, j / 9); [ROOF[3] + .2, ROOF[2] + .4].forEach((z, i) => { const zr = VZ(x, z); if (zr < 1) return; items.push([zr + (i ? .3 : 0), () => { const a = P3(x, 0, z), b = P3(x, ROOF[4], z), s = F / zr; c.fillStyle = rgb(fogd(lit([120, 96, 72], Math.max(0, sun[0] * litSide) * .6 * day + .1, .9), zr)); c.beginPath(); tube(c, [[a[0], a[1]], [b[0], b[1]]], Math.max(1, .3 * s), Math.max(1, .24 * s)); c.fill(); }]); }); }
        items.push([VZ(0, ROOF[3]) - .2, () => {
          const col = camY > ROOF[4] ? lit([110, 104, 62], Math.max(0, sun[1]) * day + .12, 1) : lit([70, 58, 40], .05, .8);
          quad([[ROOF[0] - .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[3] + .3], [ROOF[0] - .3, ROOF[4], ROOF[3] + .3]], rgb(col));
        }]);
      }
      // ----- the people -----
      if (p < .062) { // he stands in the yard in a column of light (metaphoric: the revelation of Irshad 1:154)
        items.push([VZ(0, 3.5), () => {
          shadow(0, 3.5, 1.8, .6, .3); const hd = holy(0, 3.5, { pose: 'stand', glow: .25 }); if (!hd) return;
          const L = fade(p, -.04, .02), s = hd.h / 1.8;
          c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, 0, hd.Y); g.addColorStop(0, `rgba(255,246,214,0)`); g.addColorStop(.6, `rgba(255,240,200,${.16 * L})`); g.addColorStop(1, `rgba(255,236,190,${.22 * L})`); c.fillStyle = g; c.beginPath(); c.moveTo(hd.X - .5 * s, 0); c.lineTo(hd.X + .5 * s, 0); c.lineTo(hd.X + 1.1 * s, hd.Y); c.lineTo(hd.X - 1.1 * s, hd.Y); c.closePath(); c.fill(); c.restore();
          glow(hd.x, hd.y, 3 * s, [255, 232, 180], .2 * L);
        }]);
        [[-7, 8.5, 1], [-8.2, 9.6, 1], [6.8, 9.2, -1], [9, 7.6, -1], [7.8, 10.6, -1]].forEach(([x, z, d], i) => items.push([VZ(x, z), () => { shadow(x, z, 1, .5, .26); person(x, z, { a: 'sit', dir: d, cl: CL[i + 1], hd: HD[i + 2] }); }]));
      } else if (p < .16) { // over the groves: the men who stayed sit in the shade under the palms
        st.idle.forEach(([x, z, d, cl, hd, k]) => crowd(5, x, z, d, 0, false, k, { cl, hd, lean: .02 * Math.sin(t * .6 + k * 9) }));
        flushCrowd();
      } else if (p < .33) { // the camp past the pass
        st.tT.forEach((q) => tent(...q)); flushTents();
        st.fT.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true }));
        st.nearT.forEach(([x, z, d, cl, hd, k]) => crowd(0, x, z, d, 0, false, k, { cl, hd, lean: .04 * Math.sin(t * .8 + k * 9) }));
        st.givers.forEach(([x0, z0, x1, z1], i) => { const u = smooth(seg(p, .17 + i * .012, .225 + i * .01)), x = mix(x0, x1, u), z = mix(z0, z1, u), mv = u > 0 && u < 1, d = VX(x1, z1) > VX(x0, z0) ? 1 : -1; crowd(0, x, z, d, p * 1400 + i * 2, mv, .5, { cl: CL[(i + 4) % 7], hd: HD[(i + 2) % 7], arms: u < 1 ? [[.32, 1.2]] : [[.5, 1.1]], load: u < 1 }); });
        flushCrowd();
        if (p < .24) items.push([VZ(...HP1), () => { shadow(...HP1, 1.8, .6, .3); holy(...HP1, { pose: 'stand', glow: .12 }); }]);
        else { // close: he and Ali face each other; his sleeve goes toward the city (to the south, screen right)
          const sl = smooth(seg(p, .262, .282));
          items.push([VZ(...HP1), () => { shadow(...HP1, 1.8, .6, .3); holy(...HP1, { pose: 'stand', glow: .14, arms: sl > 0 ? [[.1 + .32 * sl, -.62 - .14 * sl]] : undefined }); }]);
          items.push([VZ(...HA1), () => { shadow(...HA1, 1.8, .6, .3); holy(...HA1, { who: 'ali', pose: 'stand', flip: true, glow: .1, sword: true }); }]);
        }
      } else if (p < .42) { // the column goes out north-west into the heat; Ali stands at the edge of the struck camp
        const head = roadD(760) + 260 + (p - .33) * 9000;
        st.col.forEach(([dd, lane, kind, cl, hd, k]) => { const d = head - dd; if (d < roadD(700)) return; const [x, z, a] = roadAt(d), xx = x + Math.cos(a) * lane, zz = z - Math.sin(a) * lane, fw = [Math.sin(a), Math.cos(a)], dir = VX(xx + fw[0] * 5, zz + fw[1] * 5) / Math.max(1, VZ(xx + fw[0] * 5, zz + fw[1] * 5)) - VX(xx, zz) / Math.max(1, VZ(xx, zz)) >= 0 ? 1 : -1; crowd(kind, xx, zz, dir, p * 1600 + k * 9, true, k, { cl, hd }); });
                flushCrowd();
        items.push([VZ(-6.5, 846), () => { shadow(-6.5, 846, 1.8, .6, .3); holy(-6.5, 846, { who: 'ali', pose: 'stand', flip: true, glow: .1, sword: true }); }]);
      } else if (p < .5) { // the lane: knots of men in the shade of the walls, heads together; Ali at his door
        st.lane.forEach(([x, z, d, ln, cl, hd, k]) => items.push([VZ(x, z), () => { shadow(x, z, 1.7, .5, .26); person(x, z, { a: 'bend', b: 'stand', k: .55 + .3 * Math.sin(t * .7 + k * 9), dir: d, cl, hd, lean: ln, arms: k > .5 ? [[.3, 1.05]] : undefined }); }]));
        const ak = smooth(seg(p, .456, .492)), ax = mix(DOORA, 21.2, ak), az = mix(HOMEA[2] - .7, -11.6, ak);
        items.push([VZ(ax, az), () => { shadow(ax, az, 1.8, .6, .3); holy(ax, az, { who: 'ali', pose: ak > 0 && ak < 1 ? 'walk' : 'stand', phase: p * 90, glow: .1, sword: ak > .3 }); }]);
      } else if (p < .571) { // Ali rides out across the plain, the sword at his side
        const [ax, az, a] = roadAt(dAli(p)), fw = [Math.sin(a), Math.cos(a)], dir = VX(ax + fw[0] * 5, az + fw[1] * 5) / Math.max(1, VZ(ax + fw[0] * 5, az + fw[1] * 5)) - VX(ax, az) / Math.max(1, VZ(ax, az)) >= 0 ? 1 : -1;
        items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.2, .3); const vz = VZ(ax, az), X = W / 2 + VX(ax, az) * F / vz, Y = hy - (hW(ax, az) - camY) * F / vz; Holy.draw(c, { who: 'ali', pose: 'ride', mount: 'horse', sword: true, flip: dir < 0, x: X, y: Y, h: 1.8 * F / vz, t: p * 400, amb: .8, glow: .08 }); }]);
        // dust behind him
        for (let j = 0; j < 9; j++) { const [qx, qz] = roadAt(dAli(p) - 2 - j * 1.6), vz = VZ(qx, qz); if (vz < 2) continue; const s = F / vz, X = W / 2 + VX(qx, qz) * F / vz, Y = hy - (hW(qx, qz) + .4 + j * .1 - camY) * F / vz, r = (.8 + j * .3) * s; c.save(); c.translate(X, Y); c.scale(1.6, 1); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, rgb(lerp(haze, [214, 190, 150], .4), .2 * (1 - j / 9))); g.addColorStop(1, rgb(haze, 0)); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore(); }
      } else { // al-Jurf: the army halted among its tents; Ali comes in, stands before him; then he rides back south
        const ret = p >= .895;
        st.tJ.forEach((q) => tent(...q)); flushTents();
        st.fJ.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true }));
        st.nearJ.forEach(([x, z, a, d, cl, hd, k]) => crowd(a === 'sit' ? 5 : 0, x, z, d, 0, false, k, { cl, hd, lean: .02 * Math.sin(t * .6 + k * 9) }));
        if (ret) { const head = roadD(2900) + (p - .895) * 30000; st.col.forEach(([dd, lane, kind, cl, hd, k], i) => { if (i % 2) return; const d = head - dd * .8; if (d < roadD(2880)) return; const [x, z, a] = roadAt(d), xx = x + Math.cos(a) * lane, zz = z - Math.sin(a) * lane; crowd(kind, xx, zz, 1, p * 1600 + k * 9, true, k, { cl, hd }); }); }
        flushCrowd();
        const inK = smooth(seg(p, .572, .6));
        const cam64 = keyAt(CM, .64), sub64 = keyAt(SM, .64), va = Math.atan2(sub64[0] - cam64[0], sub64[2] - cam64[2]), rv = [Math.cos(va), -Math.sin(va)]; // the screen's right in the world
        const PP = [MEET[0] - .62 * rv[0], MEET[1] - .62 * rv[1]], AP = [MEET[0] + .62 * rv[0], MEET[1] + .62 * rv[1]];
        if (!ret) {
          items.push([VZ(...PP), () => { shadow(...PP, 1.8, .6, .3); const k2 = smooth(seg(p, .652, .676)); holy(...PP, { pose: 'stand', glow: .14 + .2 * bump(p, .645, .66, .7, .715), arms: k2 > 0 ? [[.18 + .1 * k2, -.7 - .06 * k2]] : undefined }); }]);
          if (inK < 1) { const d0 = roadD(MEET[1]) - 60, [ax, az, a] = roadAt(mix(d0, roadD(MEET[1]) - 1, inK)), bx = mix(ax, AP[0], smooth(seg(inK, .7, 1))), bz = mix(az, AP[1], smooth(seg(inK, .7, 1)));
            items.push([VZ(bx, bz), () => { shadow(bx, bz, 2.2, 1.2, .3); const vz = VZ(bx, bz), X = W / 2 + VX(bx, bz) * F / vz, Y = hy - (hW(bx, bz) - camY) * F / vz; Holy.draw(c, { who: 'ali', pose: 'ride', mount: 'horse', sword: true, flip: true, x: X, y: Y, h: 1.8 * F / vz, t: inK * 40, amb: .8, glow: .08 }); }]); }
          else {
            items.push([VZ(...AP), () => { shadow(...AP, 1.8, .6, .3); holy(...AP, { who: 'ali', pose: 'stand', flip: true, glow: .12 + .2 * bump(p, .645, .66, .7, .715), sword: true }); }]);
            const hx = AP[0] + 2.6 * rv[0] + .8 * Math.sin(va), hz = AP[1] + 2.6 * rv[1] + .8 * Math.cos(va); // his horse stands behind him
            items.push([VZ(hx, hz), () => { shadow(hx, hz, 2.2, 1.1, .26); mount(hx, hz, -1, 0, false, CL[0], HD[0], 2, false); }]);
          }
          // the light between them at the words (metaphoric)
          const wl = bump(p, .645, .665, .7, .715);
          if (wl > 0) items.push([VZ(...MEET) - 1, () => { const q = P3(MEET[0], 1.55, MEET[1]), s = F / q[2]; glow(q[0], q[1], 3.2 * s, [255, 226, 170], .22 * wl); }]);
        } else { // Ali rides back south along the road toward Medina
          const u = seg(p, .896, .94), [ax, az] = roadAt(roadD(MEET[1]) - 3 - u * 30);
          items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.2, .3); const vz = VZ(ax, az), X = W / 2 + VX(ax, az) * F / vz, Y = hy - (hW(ax, az) - camY) * F / vz; Holy.draw(c, { who: 'ali', pose: 'ride', mount: 'horse', sword: true, flip: false, x: X, y: Y, h: 1.8 * F / vz, t: p * 500, amb: .7, glow: .12 }); }]);
          items.push([VZ(...MEET), () => { shadow(...MEET, 1.8, .6, .3); holy(...MEET, { pose: 'stand', flip: true, glow: .16 }); }]);
        }
      }
      draw();
    }
    grade(c, W, H, phone, p, night, goldK, dipK);
  },
};
// ----- grade: the edges close in a little; the cuts; the gold dissolves -----
function grade(c, W, H, phone, p, night, goldK = 0, dipK = 0) {
  if (!goldK) goldK = Math.max(...GOLD.map((d) => bump(p, ...d)));
  const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
  vg.addColorStop(0, 'rgba(10,12,30,0)'); vg.addColorStop(1, `rgba(10,12,30,${.16 + .2 * night})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (goldK > 0) { c.fillStyle = `rgba(255,236,196,${goldK})`; c.fillRect(0, 0, W, H); }
  if (dipK > 0) { c.fillStyle = `rgba(6,8,14,${dipK})`; c.fillRect(0, 0, W, H); }
}
// ----- the vision: a mountain under light, a camp at its foot, a staff standing before it; a thread of light climbs -----
function visionShot(c, st, W, H, phone, p, t) {
  const u = seg(p, .715, .895), zm = 1 + .07 * u, ox = phone ? W * .5 : W * .4, hy = H * (phone ? .7 : .62);
  c.save(); c.translate(ox, hy); c.scale(zm, zm); c.translate(-ox, -hy);
  const mw = phone ? W * 1.15 : Math.min(W * .62, H * 1.05), mx = ox;
  const mass = (x) => { const d = (x - mx) / mw; let h = 0; [[0, .5, .46], [-.22, .38, .28], [.25, .36, .3], [-.52, .23, .34], [.58, .21, .34], [.1, .42, .2]].forEach(([o, ph, hw]) => { const q = Math.max(0, 1 - ((d - o) / hw) ** 2); h = Math.max(h, ph * q ** .85); }); return h * mw; };
  const rough = (x) => (mw * .05 * (crag(x / mw * 9, 1.7) - .45) + mw * .018 * (crag(x / mw * 31, .4) - .45)) * c01(mass(x) / (mw * .05));
  const top = hy - mass(mx) - rough(mx);
  // the sky: deep above, gold toward the summit
  const g = c.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, '#2c2e5c'); g.addColorStop(.42, '#83607a'); g.addColorStop(.78, '#e0a16c'); g.addColorStop(1, '#f6cf92'); c.fillStyle = g; c.fillRect(-W, -H, W * 3, hy + H);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * .15 + Math.sin(t * .2 + i) * .01, L = H * 1.3, w = .035 + .02 * Math.abs(Math.sin(i * 3)); const q = c.createLinearGradient(mx, top, mx + Math.cos(a) * L, top + Math.sin(a) * L); q.addColorStop(0, 'rgba(255,236,190,.2)'); q.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = q; c.beginPath(); c.moveTo(mx, top); c.lineTo(mx + Math.cos(a - w) * L, top + Math.sin(a - w) * L); c.lineTo(mx + Math.cos(a + w) * L, top + Math.sin(a + w) * L); c.closePath(); c.fill(); }
  { const q = c.createRadialGradient(mx, top, 0, mx, top, mw * .55); q.addColorStop(0, 'rgba(255,240,206,.6)'); q.addColorStop(1, 'rgba(255,240,206,0)'); c.fillStyle = q; c.fillRect(mx - mw * .55, top - mw * .55, mw * 1.1, mw * 1.1); }
  c.restore();
  // far ranges, pale in the haze
  const range = (x0, x1, base, amp, f, ph, col) => { c.beginPath(); c.moveTo(x0, hy + 4); for (let k = 0; k <= 120; k++) { const x = mix(x0, x1, k / 120); c.lineTo(x, base - amp * (.5 + .5 * Math.sin(x / mw * f + ph)) * (.6 + .4 * crag(x / mw * 5 + ph, ph))); } c.lineTo(x1, hy + 4); c.closePath(); c.fillStyle = col; c.fill(); };
  range(mx - mw * 1.8, mx + mw * 1.8, hy - mw * .06, mw * .12, 3.1, 1, 'rgba(196,136,128,.5)');
  range(mx - mw * 1.6, mx + mw * 1.6, hy - mw * .02, mw * .1, 4.3, 2.4, 'rgba(136,88,96,.75)');
  // the mountain: granite, its crest rimmed with gold, ravines down its faces, the light pooled at the summit
  const N = 220, x0 = mx - mw * .98, x1 = mx + mw * .98, crest = [];
  for (let k = 0; k <= N; k++) { const x = mix(x0, x1, k / N); crest.push([x, hy - mass(x) - rough(x)]); }
  const mp = new Path2D(); mp.moveTo(x0, hy + 2); crest.forEach(([x, y]) => mp.lineTo(x, y)); mp.lineTo(x1, hy + 2); mp.closePath();
  { const q = c.createLinearGradient(0, top, 0, hy); q.addColorStop(0, '#5b3c3e'); q.addColorStop(.5, '#3e2a33'); q.addColorStop(1, '#2a1d26'); c.fillStyle = q; c.fill(mp); }
  c.save(); c.clip(mp);
  { const q = c.createRadialGradient(mx, top, 0, mx, top, mw * .7); q.addColorStop(0, 'rgba(255,200,140,.42)'); q.addColorStop(.5, 'rgba(255,170,120,.12)'); q.addColorStop(1, 'rgba(255,170,120,0)'); c.fillStyle = q; c.fillRect(mx - mw, top - 10, mw * 2, hy - top + 20); }
  for (let i = 0; i < 46; i++) { // ravines: a dark line and a lit edge beside it, falling from the crest
    const xa = mix(x0, x1, .04 + .92 * hash(i, 61)), ya = hy - mass(xa) - rough(xa), dir = xa < mx ? -1 : 1, L = (hy - ya) * (.6 + .4 * hash(i, 62));
    if (L < 6) continue;
    const xb = xa + dir * L * (.25 + .3 * hash(i, 63)), yb = ya + L, xm = mix(xa, xb, .5) + (hash(i, 64) - .5) * L * .2, ym = mix(ya, yb, .45);
    c.strokeStyle = 'rgba(20,12,18,.32)'; c.lineWidth = 1 + 2.2 * hash(i, 65); c.beginPath(); c.moveTo(xa, ya + 2); c.quadraticCurveTo(xm, ym, xb, yb); c.stroke();
    c.strokeStyle = `rgba(255,206,150,${.08 + .1 * (1 - Math.abs(xa - mx) / mw)})`; c.lineWidth = 1; c.beginPath(); c.moveTo(xa - dir * 2, ya + 3); c.quadraticCurveTo(xm - dir * 3, ym, xb - dir * 4, yb); c.stroke();
  }
  { const q = c.createLinearGradient(0, hy - mw * .12, 0, hy); q.addColorStop(0, 'rgba(120,80,90,0)'); q.addColorStop(1, 'rgba(150,104,104,.45)'); c.fillStyle = q; c.fillRect(x0, hy - mw * .12, x1 - x0, mw * .12); }
  c.restore();
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,214,150,.55)'; c.lineWidth = 1.4; c.beginPath(); crest.forEach(([x, y], k) => { const a = c01(1 - Math.abs(x - mx) / (mw * .7)); if (a <= 0) return; k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.restore();
  // a cloud over the summit, lit from within
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const x = mx + (i - 4) * mw * .06 + Math.sin(t * .3 + i) * 3, y = top - mw * (.03 + .03 * Math.sin(i * 2.3)), r = mw * (.07 + .03 * (i % 3)); const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(255,238,210,.26)'); q.addColorStop(1, 'rgba(255,238,210,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, 2 * r, 2 * r); } c.restore();
  // the plain at its foot and the camp there: low tents, a few lamps
  { const q = c.createLinearGradient(0, hy, 0, H); q.addColorStop(0, '#6a4840'); q.addColorStop(.4, '#3a2a2a'); q.addColorStop(1, '#171015'); c.fillStyle = q; c.fillRect(-W, hy, W * 3, H); }
  st.vTents.forEach(([a, b, k]) => { const x = mx + (a - .5) * mw * 1.4, y = hy + 2 + b * b * H * .06, w = (6 + 6 * k) * (1 + b * 2) * (mw / 900), h = w * .4; c.fillStyle = `rgb(${34 + 22 * k},${24 + 14 * k},${26})`; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * .3, y - h); c.lineTo(x + w * .3, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,200,150,.25)'; c.fillRect(x - w * .3, y - h, w * .6, 1); if (k > .8) { c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(x, y - h * .3, 0, x, y - h * .3, w * .6); gg.addColorStop(0, 'rgba(255,170,90,.5)'); gg.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = gg; c.fillRect(x - w, y - h * .3 - w, 2 * w, 2 * w); c.restore(); } });
  // the thread of light climbing the path to the summit (al-A'raf 142: the appointment); it holds at the top
  const climb = ease.io(seg(p, .784, .842));
  if (climb > 0) {
    const pts = st.vPath.map(([a, b]) => [mx + (a - .5) * mw * 1.1, mix(hy, top + 4, 1 - b)]), n = pts.length - 1, k = climb * n, i = Math.min(n - 1, Math.floor(k)), f = k - i;
    const head = [mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)], road = pts.slice(0, i + 1).concat([head]);
    const trace = () => { c.beginPath(); c.moveTo(road[0][0], road[0][1]); for (let j = 1; j < road.length - 1; j++) c.quadraticCurveTo(road[j][0], road[j][1], (road[j][0] + road[j + 1][0]) / 2, (road[j][1] + road[j + 1][1]) / 2); c.lineTo(head[0], head[1]); };
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(255,220,160,.16)'; c.lineWidth = 7; trace(); c.stroke(); c.strokeStyle = 'rgba(255,240,206,.85)'; c.lineWidth = 1.6; trace(); c.stroke();
    const gg = c.createRadialGradient(head[0], head[1], 0, head[0], head[1], 18); gg.addColorStop(0, 'rgba(255,246,220,.95)'); gg.addColorStop(1, 'rgba(255,246,220,0)'); c.fillStyle = gg; c.fillRect(head[0] - 18, head[1] - 18, 36, 36); c.restore();
  }
  // the staff: upright on a rock in the near foreground, before the camp; it stays below; at the last a soft light on it
  const sxp = phone ? W * .24 : ox - mw * .36, syp = hy + (H - hy) * .56, sh = (H - hy) * 1.08, stl = bump(p, .838, .862, .9, .95);
  { c.fillStyle = 'rgba(8,6,8,.45)'; c.beginPath(); c.ellipse(sxp + sh * .2, syp + sh * .1, sh * .32, sh * .03, 0, 0, TAU); c.fill();
    const rk = c.createLinearGradient(0, syp - sh * .06, 0, syp + sh * .12); rk.addColorStop(0, '#5a4038'); rk.addColorStop(1, '#1e1418'); c.fillStyle = rk; c.beginPath(); c.moveTo(sxp - sh * .22, syp + sh * .12); c.quadraticCurveTo(sxp - sh * .18, syp - sh * .03, sxp - sh * .02, syp - sh * .05); c.quadraticCurveTo(sxp + sh * .15, syp - sh * .06, sxp + sh * .24, syp + sh * .12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,200,150,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(sxp - sh * .17, syp - sh * .01); c.quadraticCurveTo(sxp - sh * .05, syp - sh * .055, sxp + sh * .1, syp - sh * .045); c.stroke();
    const q = c.createLinearGradient(sxp - 4, 0, sxp + 4, 0); q.addColorStop(0, '#6e4a30'); q.addColorStop(.5, '#a37848'); q.addColorStop(1, '#3a2618'); c.strokeStyle = q; c.lineWidth = Math.max(3, sh * .022); c.lineCap = 'round';
    c.beginPath(); c.moveTo(sxp, syp - sh * .04); c.quadraticCurveTo(sxp + sh * .01, syp - sh * .5, sxp - sh * .005, syp - sh * .92); c.quadraticCurveTo(sxp - sh * .02, syp - sh * .99, sxp - sh * .06, syp - sh * .97); c.stroke();
    c.strokeStyle = 'rgba(255,214,150,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(sxp + sh * .008, syp - sh * .1); c.quadraticCurveTo(sxp + sh * .018, syp - sh * .5, sxp + sh * .004, syp - sh * .9); c.stroke();
    if (stl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(sxp, syp - sh * .55, 0, sxp, syp - sh * .55, sh * .6); gg.addColorStop(0, `rgba(255,226,170,${.3 * stl})`); gg.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = gg; c.fillRect(sxp - sh * .6, syp - sh * 1.15, sh * 1.2, sh * 1.2); c.restore(); }
  }
  c.restore();
}
})();
