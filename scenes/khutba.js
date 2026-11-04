(() => {
// khutba — «خطبة الوداع» (al-Kafi 4:245–247, 4:257–258, 7:273, 1:403; al-Irshad 1:171–172, 1:174; Tafsir al-Qummi
// 1:171–172; I'lam al-Wara 1:261). Four worlds in metres under one pinhole camera keyed on p (x east, y up, z north; the
// camera turns about y): Medina and the road south-west of it, the valley of Mecca and its northern rim, the plain of
// 'Arafat with Namira at its western edge, and the valley of Mina.
//   p −.05 → .06   Medina, morning: he stands in the yard of the mosque in a column of light (Kafi 4:245, al-Hajj 27)
//      .06 → .125  over the roofs: criers stand on the roofs and rings of light go out from them over the town; people
//                   come in from the groves and the outskirts (Kafi 4:245: «بأعلى أصواتهم … وأهل العوالي والأعراب»)
//      .125 → .165 al-Bayda', noon: he rides his camel among the column, now all in white; a thread of light runs along it
//      .165 → .2   high over the road: the white column runs to the horizon, the light along all of it (Irshad 1:171:
//                   «فاتّصل ما بين الحرمين بالتلبية»; 1:172: «ركباناً ومشاةً»)
//      .2 → .255   the northern rim over Mecca, afternoon: he on his camel at the brow, the valley and the House below; Ali
//                   rides up the slope from the south-west (Irshad 1:172: «وقد أشرف على مكّة»)
//      .255 → .315 close: the two riders face each other at the brow; a light between them at the words
//      .315 → .375 the House, late afternoon: the people go round it in white; he walks among them (Kafi 4:245)
//      .375 → .44  Namira, noon: tents among the arak, his domed tent; he stands before the people seated on the ground
//                   (Kafi 4:247: «فضُربت قبّته … فوعظ الناس»)
//      .44 → .52   the standing place: he on his camel; the people press about its feet; he moves it, they follow; his
//                   sleeve goes out over the plain and they spread across it (Kafi 4:247)
//      .52 → .595  late afternoon, the whole plain full of people; the sway stops; a light goes out over all of them
//                   from him at the words (Kafi 4:258; metaphoric)
//      .595 → .64  the sun's disc goes down behind the western hills; the people begin to move west (Kafi 4:247)
//      .64 → .69   Mina, morning: the valley full of tents and people; he stands on a rise, Ali beside him
//      .69 → .745  over his shoulder, the crowd below; at each answer a ring of light runs through the crowd
//      .745 → .78  the camera rises; at «نعم» a wave of light; at «اللهمّ اشهد» a column of light rises from him
//      .78 → .885  from the east side of the rise, closing in to him and Ali (Kafi 7:273; Qummi 1:171–172)
//      .885 → .94  the yard of al-Khayf at the foot of the north slope: rows of men seated; he stands before them
//      .94 → 1.05  dusk: the caravan goes west down the valley; he rides his camel, Ali on his horse beside him
// The Prophet and Ali are drawn only by Holy.draw (on the camel: Holy's riding figure clipped to the rider, over a camel
// painted here). Everyone else is a faceless shape: in ihram (al-Bayda' to 'Arafat; Kafi 4:249: «التجرّد في إزار
// ورداء») a white wrap and a bare dark head, at Mina after the rites an earth-toned cloak and head cloth. Everything
// follows from p; t moves only cloth, light, fire and stars.
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
function smoothPath(g, P) { // a closed curve through the midpoints of P
  const n = P.length, m = (i) => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
  const s = m(n - 1); g.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const e = m(i); g.quadraticCurveTo(P[i][0], P[i][1], e[0], e[1]); }
  g.closePath();
}
function crag(x, z) {
  let s = 0, a = 1, f = 1;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}

// ---------- outlines (u across, v up, metres; facing +u): the same 16 points in the same order ----------
const SH = {
  stand: [-.3, 0, -.22, .4, -.18, .85, -.19, 1.1, -.18, 1.33, -.1, 1.46, -.07, 1.6, .05, 1.72, .15, 1.62, .12, 1.49, .17, 1.37, .19, 1.05, .16, .7, .17, .32, .22, 0, 0, .02],
  sit: [-.34, 0, -.33, .24, -.25, .5, -.21, .72, -.19, .86, -.11, .96, -.07, 1.06, .04, 1.16, .13, 1.07, .11, .96, .15, .86, .18, .62, .26, .36, .42, .2, .46, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], sit: [.04, 1.06] };
const SHO = { stand: [.01, 1.36], sit: [0, .84] };
// batched crowd shapes: side man, far man, sitting man, horse, camel, a camel couched on the ground
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MANS = [-.3, 0, -.24, .9, -.22, 1.3, -.13, 1.45, .13, 1.45, .22, 1.3, .24, .9, .3, 0];
const SITS = [-.4, 0, -.34, .4, -.2, .78, .16, .78, .3, .5, .44, .14, .46, 0];
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
const CAMELK = [-1.05, 0, -1.08, .42, -.8, .86, -.3, 1.18, .15, 1.06, .42, .78, .7, .74, .92, .9, 1.1, 1.3, 1.22, 1.52, 1.42, 1.54, 1.48, 1.44, 1.3, 1.34, 1.12, .8, .95, .42, .9, 0];
const poly = (pa, sh, bx, by, s, dir, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const X = bx + (sh[i] + lean * sh[i + 1]) * dir * s, Y = by - sh[i + 1] * s; i ? pa.lineTo(X, Y) : pa.moveTo(X, Y); } pa.closePath(); };
// the near camel, side on, facing +u: a dromedary's line, one hump; CAMBK the same points couched (from baraa)
const CAMB = [[-1.28, 1.6], [-1.22, 1.86], [-.86, 2.02], [-.42, 2.3], [-.08, 2.42], [.3, 2.26], [.62, 1.98], [.86, 1.86], [1.2, 1.62], [1.5, 1.74], [1.72, 2.04], [1.84, 2.25], [2.06, 2.29], [2.3, 2.14], [2.33, 2.0], [2.12, 1.97], [1.88, 1.9], [1.62, 1.55], [1.32, 1.3], [.98, 1.14], [.74, 1.04], [.2, 1.08], [-.5, 1.1], [-.96, 1.2], [-1.22, 1.36]];
const CAMBK = [[-1.3, .5], [-1.24, .8], [-.88, .98], [-.44, 1.26], [-.1, 1.38], [.28, 1.22], [.6, .96], [.84, .86], [1.04, .9], [1.3, 1.16], [1.46, 1.5], [1.56, 1.74], [1.78, 1.8], [2.02, 1.66], [2.05, 1.52], [1.84, 1.5], [1.62, 1.42], [1.44, 1.06], [1.26, .62], [1.0, .3], [.78, .06], [.2, 0], [-.5, 0], [-1.0, .06], [-1.26, .24]];
const CLEG = [[-.86, 0, 1], [.72, 0, 1], [-.7, .5, 0], [.56, .5, 0]];
const SEAT = [-.3, 0, -.32, .28, -.22, .62, -.17, .74, -.16, .86, -.1, .97, .02, 1.0, .11, .93, .12, .82, .08, .74, .2, .64, .26, .4, .36, .2, .38, 0];
// earth tones: cloaks and head cloths (only the veiled figures read white at the head)
const CL = [[96, 72, 54], [72, 62, 54], [116, 84, 58], [66, 64, 72], [104, 86, 64], [88, 60, 48], [80, 76, 60]];
const HD = [[170, 134, 92], [150, 110, 72], [160, 138, 100], [140, 112, 78], [176, 142, 98], [128, 94, 62], [154, 124, 84]];
// ihram: the wrap and the shoulder cloth, unbleached white; the head bare and dark
const CLI = [[236, 230, 214], [226, 220, 202], [242, 238, 226], [220, 212, 194], [232, 224, 206]];
const HDI = [[62, 46, 36], [50, 38, 32], [74, 54, 42], [44, 34, 30], [58, 44, 38]];
const HOUSE = [[206, 178, 136], [196, 166, 124], [214, 188, 148], [190, 160, 120]];
const MHOUSE = [[150, 128, 108], [168, 146, 120], [132, 112, 96], [176, 156, 128]];
const TENT = [[58, 46, 40], [84, 64, 48], [70, 56, 46], [176, 160, 132], [104, 82, 60]];
const TONES = [[92, 70, 52], [66, 62, 64], [116, 86, 60]], TONESI = [[232, 226, 210], [216, 210, 196], [242, 236, 222]];

// ---------- Medina and the road south-west of it (as baraa) ----------
const MOS = [-15, 15, -12, 14], WALLH = 1.3, ROOF = [-15, 15, -12, -7.2, 3.1];
const HOMEA = [15.6, 22, -8, -1.2, 3];
const ROAD0 = [[2, -14], [3, -40], [-4, -160], [-40, -380], [-150, -650], [-380, -1000], [-760, -1450], [-1250, -2000], [-1850, -2700], [-2500, -3500], [-3200, -4500], [-4000, -5800], [-4900, -7500], [-5900, -9600], [-7000, -12000]];
const ROAD = (() => {
  const out = [], n = ROAD0.length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < 16; k++) {
    const u = k / 16, a = ROAD0[Math.max(0, i - 1)], b = ROAD0[i], c2 = ROAD0[i + 1], d = ROAD0[Math.min(n - 1, i + 2)];
    out.push([0, 1].map((j) => .5 * (2 * b[j] + (-a[j] + c2[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c2[j] - d[j]) * u * u + (-a[j] + 3 * b[j] - 3 * c2[j] + d[j]) * u * u * u)));
  }
  out.push(ROAD0[n - 1]); let D = 0; out.forEach((q, i) => { if (i) D += Math.hypot(q[0] - out[i - 1][0], q[1] - out[i - 1][1]); q.push(D); }); return out;
})();
const roadX = (z) => { let lo = 0, hi = ROAD.length - 1; if (z >= ROAD[0][1]) return ROAD[0][0]; if (z <= ROAD[hi][1]) return ROAD[hi][0]; while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][1] > z ? lo = m : hi = m; } return mix(ROAD[lo][0], ROAD[hi][0], (z - ROAD[lo][1]) / (ROAD[hi][1] - ROAD[lo][1])); };
const roadAt = (d) => { let lo = 0, hi = ROAD.length - 1; d = Math.max(0, Math.min(ROAD[hi][2], d)); while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][2] < d ? lo = m : hi = m; } const k = (d - ROAD[lo][2]) / Math.max(1e-6, ROAD[hi][2] - ROAD[lo][2]); return [mix(ROAD[lo][0], ROAD[hi][0], k), mix(ROAD[lo][1], ROAD[hi][1], k), Math.atan2(ROAD[hi][0] - ROAD[lo][0], ROAD[hi][1] - ROAD[lo][1])]; };
const offR = (d, side, up = 0) => { const [x, z, a] = roadAt(d); return [x + Math.cos(a) * side, up, z - Math.sin(a) * side]; };
function hM(x, z) {
  let h = .06 * Math.sin(x * .7 + z * .4) * Math.sin(z * .6 - x * .3) + 1.4 * Math.sin(x * .004 + z * .003) * Math.sin(z * .0021 - .5) * c01((-z - 300) / 300);
  h += smooth(c01((x - 700) / 500)) * (6 + 26 * crag(x * .02, z * .02)) + smooth(c01((-1800 - x + z * .2) / 600)) * (5 + 22 * crag(x * .018 + 3, z * .018));
  h += 380 * Math.exp(-((x + 300) ** 2) / (2 * 1300 ** 2) - ((z - 4700) ** 2) / (2 * 480 ** 2)) * (.6 + .6 * crag(x * .003 + 2, z * .003));
  h += smooth(c01((-z - 2600) / 2600)) * (60 + 170 * crag(x * .002, z * .002)) * c01((Math.abs(x - roadX(z)) - 420) / 900);
  return h + smooth(c01((z - 7000) / 3500)) * (200 + 260 * crag(x * .0013, z * .0013));
}
const SAND = [226, 206, 166], EARTH = [200, 174, 132], GRAV = [184, 160, 124], GROVE = [134, 140, 84], FIELD = [122, 146, 72], BASALT = [76, 64, 60], SILT = [230, 220, 196], FARC = [156, 160, 184];
function groundM(x, z, h) {
  const n = c01(.5 + .5 * Math.sin(x * .13 + Math.sin(z * .11) * 2) * Math.sin(z * .17 - x * .05)), m = c01(.5 + .5 * Math.sin(x * .011 - z * .008 + 1) * Math.sin(z * .013 + x * .004));
  if (x > MOS[0] - 2 && x < 40 && z > -34 && z < MOS[3] + 2) return lerp(lerp(SAND, EARTH, .2 + .4 * n), [180, 152, 116], .3 * c01(.5 + .5 * Math.sin(x * .4 - z * .3)));
  const fld = c01((Math.sin(x * .045 + Math.sin(z * .03) * 1.5) * Math.sin(z * .05 - x * .01) - .15) * 3);
  const green = c01((1 - Math.hypot(x / 440, (z + 40) / 420)) * 3) * (.35 + .55 * fld);
  let a = lerp(lerp(lerp(EARTH, SAND, n), lerp(GRAV, [168, 140, 106], n), c01((-z - 450) / 300)), lerp(GROVE, FIELD, n), green);
  a = lerp(a, SILT, c01((m - .62) * 3) * c01((-z - 900) / 400) * .7);
  a = lerp(a, lerp(BASALT, [106, 86, 74], n * .6), c01(smooth(c01((x - 700) / 500)) + smooth(c01((-1800 - x + z * .2) / 600))) * .92 + c01(m - .78) * 2.5 * .55 * c01((-z - 500) / 300));
  a = lerp(a, [176, 128, 96], c01((h - 30) / 160) * .75);
  a = lerp(a, [222, 204, 166], Math.exp(-((x - roadX(z)) ** 2) / 30) * c01((-z - 30) / 20) * .75);
  return lerp(a, lerp([176, 128, 96], FARC, .6), smooth(c01((Math.hypot(x + 600, z + 1500) - 2800) / 5000)));
}
// ---------- Mecca: the court of the House, the houses round it, the ring of mountains; a low saddle on the north rim ----------
const KA = { hu: 5.6, hv: 6.2, h: 13, door: [-3.6, -1.7, 2.2, 5.2] };
const UN = [Math.SQRT1_2, Math.SQRT1_2], VN = [-Math.SQRT1_2, Math.SQRT1_2];
const kw = (u, v) => [u * UN[0] + v * VN[0], u * UN[1] + v * VN[1]];
const HIJR = Array.from({ length: 19 }, (_, i) => { const a = mix(.32, Math.PI - .32, i / 18); return kw(5.8 * Math.cos(a), KA.hv + 8.2 * Math.sin(a)); });
const RIM = [[30, 160], [10, 240], [-8, 320], [-24, 392], [-30, 420], [-36, 470], [-50, 600], [-70, 900]]; // the way down from the north rim into the valley
function hK(x, z) {
  const r = Math.hypot(x, z), az = Math.atan2(x, z);
  let h = smooth(c01((r - 34) / 120)) * (2 + .012 * (r - 34)) + .04 * Math.sin(x * .6 + z * .5);
  const mf = smooth(c01((r - 70) / 170));
  h += mf * 230 * Math.exp(-((x - 290) ** 2) / (2 * 100 ** 2) - ((z + 30) ** 2) / (2 * 220 ** 2)) * (.7 + .5 * crag(x * .008, z * .008));
  h += mf * 210 * Math.exp(-((x + 330) ** 2 + (z - 300) ** 2) / (2 * 160 ** 2)) * (.7 + .5 * crag(x * .008 + 3, z * .008));
  h += smooth(c01((r - 300) / 380)) * (120 + 190 * crag(x * .004 + 1, z * .004)) * (1 - .75 * Math.exp(-((az + 2.6) ** 2) / .08)) * (1 - .55 * Math.exp(-((az + .08) ** 2) / .05));
  return mix(h, 52.6, Math.exp(-((x + 28) ** 2 + (z - 421) ** 2) / (2 * 9 ** 2))); // a level place on the brow where they meet
}
function groundK(x, z, h, slope) {
  const r = Math.hypot(x, z), n = c01(.5 + .5 * Math.sin(x * .3 + Math.sin(z * .25) * 2) * Math.sin(z * .37 - x * .11));
  let a = lerp([206, 186, 154], [186, 164, 134], n);
  a = lerp(a, [218, 204, 178], c01((32 - r) / 8) * .6);
  a = lerp(a, lerp([92, 76, 70], [128, 104, 90], n), c01((h - 8) / 40) * .9 + c01((slope - .35) * 2) * .5);
  return lerp(a, [150, 140, 168], smooth(c01((r - 900) / 4000)) * .55);
}
// ---------- 'Arafat: a broad gravel plain, the dry bed of 'Urana on its west side, low hills and a ring of mountains ----------
const QB = [0, 0], PNM = [9, -6], MQ = [600, 200], MQ2 = [607, 196]; // his domed tent at Namira, where he stands; the standing place, the camel moved
const xU = (z) => -150 + 50 * Math.sin(z * .002 + 1); // the bed of 'Urana
function hA(x, z) {
  let h = .4 * Math.sin(x * .013 + z * .009) * Math.sin(z * .011 - x * .004) + 2.2 * Math.sin(x * .0021 + 1) * Math.sin(z * .0017) + .05 * Math.sin(x * .7 + z * .5);
  h -= 1.2 * Math.exp(-((x - xU(z)) ** 2) / (2 * 30 ** 2));
  h += 34 * Math.exp(-((x - 1500) ** 2 + (z - 760) ** 2) / (2 * 130 ** 2)) * (.7 + .5 * crag(x * .01, z * .01));
  const r = Math.hypot(x - 700, (z - 200) * 1.25);
  h += smooth(c01((r - 2600) / 1600)) * (150 + 280 * crag(x * .0016 + 2, z * .0016));
  return h;
}
function groundA(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .021 + Math.sin(z * .017) * 2.4) * Math.sin(z * .019 - x * .007)), n2 = c01(.5 + .5 * Math.sin(x * .09 + z * .05) * Math.sin(z * .11 - x * .03));
  let a = lerp(lerp([196, 176, 146], [178, 158, 130], n), [204, 186, 156], n2 * .5);
  a = lerp(a, [226, 212, 184], Math.exp(-((x - xU(z)) ** 2) / (2 * 26 ** 2)) * .8);
  a = lerp(a, lerp([98, 82, 76], [146, 120, 102], .5 + .5 * Math.sin(h * .2 + n * 3)), c01((h - 6) / 30) * .85 + c01((slope - .3) * 2) * .4);
  return lerp(a, [150, 142, 166], smooth(c01((Math.hypot(x - 700, z - 200) - 1200) / 4200)) * .6);
}
// ---------- Mina: a sand floor between steep granite walls, running east to west (as baraa) ----------
const KN = [0, 128], AL = [2.3, 127.4], KH = [-420, 318]; // the rise he stands on (invented place); Ali beside him; the yard of al-Khayf
function hN(x, z) {
  let h = .6 * Math.sin(x * .021 + z * .013) * Math.sin(z * .017 - x * .006) + 1.8 * Math.sin(x * .0031 + 1) + .05 * Math.sin(x * .7 + z * .4);
  const zn = 360 + 40 * Math.sin(x * .004 + 1) + 20 * Math.sin(x * .013), zs = -380 + 40 * Math.sin(x * .0045 + 3);
  h += smooth(c01((z - zn) / 260)) * (80 + 120 * crag(x * .004, z * .004)) + smooth(c01((zs - z) / 260)) * (90 + 130 * crag(x * .004 + 5, z * .004));
  h += 3.2 * Math.exp(-((x - KN[0]) ** 2 + (z - KN[1]) ** 2) / (2 * 6.5 ** 2)) + 1.6 * Math.exp(-((x - KN[0] - 4) ** 2 + (z - KN[1] - 9) ** 2) / (2 * 10 ** 2));
  return h + smooth(c01((-x - 1500) / 900)) * (70 + 120 * crag(x * .004, z * .004)) * c01((Math.abs(z - zc(x)) - 40) / 160) + smooth(c01((x - 1600) / 900)) * (50 + 100 * crag(x * .004 + 2, z * .004));
}
const zc = (x) => 10 + 30 * Math.sin(x * .002); // the way west down the valley
function groundN(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .021 + Math.sin(z * .017) * 2.4) * Math.sin(z * .019 - x * .007)), n2 = c01(.5 + .5 * Math.sin(x * .09 + z * .05) * Math.sin(z * .11 - x * .03));
  let a = lerp(lerp([212, 184, 146], [224, 200, 162], n), [196, 166, 128], n2 * .5);
  const rock = c01((h - 6) / 30) * .8 + c01((slope - .3) * 2.2) * .5 + c01(1 - Math.hypot(x - KN[0], z - KN[1]) / 9) * .7;
  a = lerp(a, lerp([110, 92, 84], [158, 130, 110], .5 + .5 * Math.sin(h * .3 + n * 3)), c01(rock));
  if (x > KH[0] - 26 && x < KH[0] + 26 && z > KH[1] - 18 && z < KH[1] + 18) a = lerp(a, [200, 180, 150], .5); // the swept floor of the yard
  return lerp(a, [150, 140, 170], smooth(c01((Math.hypot(x, z) - 1200) / 4000)) * .55);
}

// light: sky top, sky mid, horizon, sun, ambient, haze, elevation (deg), azimuth (rad from north toward east), fog distance
const DAY = [[66, 122, 200], [174, 202, 230], [242, 236, 220], [255, 248, 230], [160, 166, 178], [238, 232, 218]];
const WARM = [[58, 100, 178], [168, 178, 206], [248, 210, 170], [255, 214, 160], [148, 144, 154], [234, 208, 182]];
const LQ = [
  [-.06, [70, 124, 198], [178, 202, 228], [244, 232, 212], [255, 242, 220], [158, 164, 178], [236, 228, 214], 34, 2.0, 4200],
  [.124, ...DAY, 48, 2.3, 4400],
  [.125, ...DAY, 70, 3.0, 5200], [.164, ...DAY, 68, 3.1, 5400], [.166, ...DAY, 66, -3.0, 11000], [.2, ...DAY, 64, -2.8, 12000],
  [.201, [62, 108, 186], [168, 186, 216], [246, 220, 188], [255, 228, 190], [152, 150, 162], [236, 216, 196], 28, -1.95, 4400],
  [.314, ...WARM, 19, -1.85, 4400],
  [.315, [56, 98, 176], [168, 174, 204], [248, 206, 166], [255, 212, 156], [148, 142, 152], [234, 204, 178], 15, -1.9, 3000],
  [.374, [54, 92, 168], [168, 168, 198], [248, 200, 158], [255, 206, 148], [146, 138, 150], [234, 200, 174], 11, -1.95, 3000],
  [.375, ...DAY, 72, 3.0, 5600], [.44, ...DAY, 62, -2.6, 5600],
  [.52, [64, 112, 192], [172, 192, 222], [246, 226, 198], [255, 234, 202], [154, 156, 168], [236, 222, 204], 34, -1.85, 5600],
  [.595, ...WARM, 10, -1.68, 5200],
  [.62, [52, 84, 156], [170, 160, 188], [248, 190, 142], [255, 196, 128], [144, 130, 138], [232, 190, 160], 3.2, -1.66, 4600],
  [.632, [46, 70, 140], [150, 136, 170], [244, 172, 128], [255, 186, 118], [132, 118, 134], [214, 168, 150], -.5, -1.66, 4200],
  [.64, [40, 60, 128], [132, 118, 158], [238, 160, 118], [255, 176, 112], [122, 108, 132], [196, 150, 140], -3, -1.66, 3800],
  [.641, [74, 120, 196], [184, 202, 224], [248, 226, 198], [255, 232, 200], [156, 158, 170], [236, 224, 206], 26, 1.85, 2600],
  [.884, [68, 120, 200], [178, 204, 230], [244, 232, 212], [255, 242, 218], [160, 164, 176], [238, 230, 216], 44, 2.4, 2800],
  [.885, ...DAY, 62, 2.9, 2800], [.939, ...DAY, 58, -2.9, 2800],
  [.94, [46, 74, 146], [160, 146, 180], [246, 180, 132], [255, 186, 120], [140, 124, 134], [226, 182, 156], 3, -1.6, 2600],
  [1.06, [12, 18, 52], [34, 40, 92], [116, 78, 102], [255, 160, 100], [62, 66, 128], [72, 62, 104], -6, -1.6, 2000]];
// cameras: [p, x, height above the ground under it, z, horizon (fraction of the height)]; subject [p, x, y, z]
const CM = [
  [-.06, 5.5, 1.6, -5.5, .56], [.0595, 3.4, 1.85, -7.2, .55],
  [.0605, 43, 6.5, -17, .47], [.1245, 39, 7.5, -13, .46],
  [.2005, -38, 2.4, 437, .5], [.2545, -36.5, 2.2, 434, .5],
  [.2555, -28, 1.9, 431.5, .55], [.3145, -28, 1.85, 430.6, .55],
  [.3155, 15, 3.2, 29, .52], [.3745, 12, 2.4, 24.5, .54],
  [.3755, 16, 1.7, -14, .55], [.4395, 14, 1.65, -12, .55],
  [.4405, 592, 2.0, 189.5, .55], [.5195, 594, 2.2, 188.5, .55],
  [.5205, 630, 3.4, 216, .53], [.595, 624, 3.0, 212, .53], [.64, 618, 2.4, 208, .53],
  [.6405, -78, 5, 66, .52], [.6895, -40, 4.2, 94, .53],
  [.6905, -6.2, 3.7, 136.6, .52], [.745, -5.2, 3.5, 134.8, .52], [.7795, -16, 12, 148, .46],
  [.7805, 22, 2.2, 108, .54], [.812, 14, 2.0, 113, .55], [.8465, 9, 1.9, 117, .55], [.8845, 4.6, 1.9, 121.2, .56],
  [.8855, KH[0] + 8, 3.4, KH[1] - 5, .5], [.9395, KH[0] + 6, 3.0, KH[1] - 2, .52]];
const SM = [
  [-.06, 0, 1.3, 3.5], [.0595, 0, 1.4, 3.5],
  [.0605, 0, 3, -3], [.1245, -4, 3, 1],
  [.2005, -30, 2.4, 420], [.2545, -29, 2.4, 420],
  [.2555, -28.6, 2.5, 419.6], [.3145, -28.6, 2.5, 419.6],
  [.3155, 3, 4, 6], [.3745, 2, 4, 6],
  [.3755, 2, 1.4, -2], [.4395, 3, 1.4, -3],
  [.4405, 601, 2.1, 199.5], [.5195, 605, 2.2, 197],
  [.5205, 560, 2, 186], [.595, 500, 2.5, 176], [.64, 420, 3, 150],
  [.6405, 0, 6, 128], [.6895, 0, 6, 128],
  [.6905, 30, 0, 40], [.745, 34, 0, 46], [.7795, 10, 2, 60],
  [.7805, 0, 5, 126], [.812, 0, 5.2, 126], [.8465, .6, 5.2, 127], [.8845, 1.1, 5.3, 127.6],
  [.8855, KH[0], 1.6, KH[1] + 9.5], [.9395, KH[0] - .5, 1.6, KH[1] + 9.5]];
// the dips to dark between shots: [fade in, black, black, fade out]
const JUMPS = [.06, .125, .165, .2, .255, .315, .375, .44, .52, .64, .69, .78, .885, .94];
const CUTS = JUMPS.map((j) => [j - .0045, j - .0012, j + .0012, j + .0045]);
const dPro = (p) => mix(2400, 2470, seg(p, .125, .165)); // his camel along the road at al-Bayda'
const PB = [-30, 420]; // his camel at the brow over Mecca
const aliUp = (p) => { const u = ease.out(seg(p, .204, .25)); return [mix(80, -25.4, u), mix(372, 419.6, u), u]; }; // Ali up the slope to him
const pxDep = (p) => -60 - 70 * seg(p, .94, 1.05); // his camel on the way west at dusk
const tawafAt = (p) => { const a = .55 - (p - .315) * 2.4 * (14 / 13.2); return [Math.sin(a) * 13.2, Math.cos(a) * 13.2]; };
const hisAt = (p) => { // where he is, beat by beat (none: the criers, the long view of the road)
  if (p < .06) return [0, 3.5]; if (p < .125) return null; if (p < .165) { const [x, , z] = offR(dPro(p), 0); return [x, z]; } if (p < .2) return null;
  if (p < .315) return PB; if (p < .375) return tawafAt(p); if (p < .44) return PNM;
  if (p < .64) { const mv = smooth(seg(p, .468, .48)); return [mix(MQ[0], MQ2[0], mv) - smooth(seg(p, .622, .64)) * 30, mix(MQ[1], MQ2[1], mv)]; }
  if (p < .885) return KN; if (p < .94) return [KH[0], KH[1] + 9.5]; const x = pxDep(p); return [x, zc(x)]; };

S.khutba = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(1010);
    const pick = (A) => A[(R() * A.length) | 0];
    // ----- Medina: houses and palms, kept off the yard and the road -----
    const keep = [[MOS[0] - 4, MOS[1] + 4, MOS[2] - 5, MOS[3] + 4], [HOMEA[0] - 1, HOMEA[1] + 1, HOMEA[2] - 1, HOMEA[3] + 1]];
    const clear = (x, z, m = 0) => !keep.some(([a, b, c0, d]) => x > a - m && x < b + m && z > c0 - m && z < d + m) && (z > -12 || Math.abs(x - roadX(z)) > 9 + m);
    st.houses = [[...HOMEA, HOUSE[0]], [24, 30, -6, 0, 3.2, HOUSE[2]], [32, 39, -7, -.5, 2.9, HOUSE[1]], [36, 42, -24, -18, 3, HOUSE[3]], [40, 46, -36, -29, 3.1, HOUSE[1]], [-22, -16, -24, -18, 3.3, HOUSE[0]], [-30, -24, -20, -14, 2.8, HOUSE[2]], [20, 27, 20, 27, 3.4, HOUSE[0]], [-26, -19, 22, 29, 3, HOUSE[3]]];
    for (let i = 0; i < 900 && st.houses.length < 48; i++) {
      const w = 4 + R() * 5, d = 4 + R() * 5, x = -110 + R() * 240, z = -90 + R() * 170, h = 2.7 + R() * 1.6;
      if (!clear(x, z, 4)) continue;
      if (st.houses.some((H) => x - w / 2 < H[1] + 2 && x + w / 2 > H[0] - 2 && z - d / 2 < H[3] + 2 && z + d / 2 > H[2] - 2)) continue;
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, HOUSE[(R() * 4) | 0]]);
    }
    const free = (x, z) => clear(x, z, 1) && !st.houses.some((H) => x > H[0] - 1.2 && x < H[1] + 1.2 && z > H[2] - 1.2 && z < H[3] + 1.2);
    st.palms = [];
    for (let i = 0; i < 4000 && st.palms.length < 170; i++) { const x = -140 + R() * 280, z = -110 + R() * 260; if (free(x, z)) st.palms.push([x, z, 6 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 1100; i++) { const x = -470 + R() * 940, z = -440 + R() ** .9 * 780; if (Math.hypot(x / 470, (z + 40) / 420) < 1 && free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    st.acacia = []; for (let i = 0; i < 2600 && st.acacia.length < 600; i++) { const d = 380 + R() * 8200, [rx, rz] = roadAt(d), x = rx + (R() - .5) * (i % 3 ? 3600 : 160), z = rz + (R() - .5) * 300; if (Math.abs(x - roadX(z)) < 26 || Math.hypot(x / 470, (z + 40) / 420) < 1.05) continue; st.acacia.push([x, z, 2.6 + R() * 2.4, R()]); }
    st.yard = [[-7, 8.5, 1], [-8.2, 9.6, 1], [6.8, 9.2, -1], [9, 7.6, -1], [7.8, 10.6, -1], [-5.4, 11.2, 1]].map(([x, z, d], i) => [x, z, d, CL[(i + 1) % 7], HD[(i + 2) % 7]]);
    // the criers on the roofs: [x, z, roof height]; the mosque's roof of fronds is one of them
    st.criers = [[0, -9.6, 3.1], ...[1, 2, 3, 5, 7, 8].map((i) => { const H = st.houses[i]; return [(H[0] + H[1]) / 2, (H[2] + H[3]) / 2, H[4]]; })];
    // people coming in from the groves and the outskirts toward the mosque: [x0, z0, x1, z1, start, cloak, head, seed]
    st.come = []; for (let i = 0; i < 1600 && st.come.length < 160; i++) { const a = R() * TAU, r0 = 240 + R() * 260, r1 = 26 + R() * 34, x0 = Math.sin(a) * r0, z0 = Math.cos(a) * r0 - 30; if (!free(x0, z0)) continue; st.come.push([x0, z0, Math.sin(a) * r1, Math.cos(a) * r1 - 4, R() * .02, pick(CL), pick(HD), R()]); }
    // the column in white on the road at al-Bayda': [offset along the road from him (m), lane, kind (0 foot, 3 camel), cloak, head, seed]
    st.colI = []; for (let i = 0; i < 9000 && st.colI.length < 900; i++) { const e = -460 + R() ** .8 * 600, lane = (R() - .5) * 11; if ((e > -3.5 && e < 3.5 && Math.abs(lane) < 2.6) || (e > -1 && e < 18 && lane > 2.6)) continue; const r = R(); st.colI.push([e, lane, r < .26 ? 3 : 0, pick(CLI), pick(HDI), R()]); }
    st.colFar = []; for (let i = 0; i < 4200; i++) { const d = 1500 + R() * 7400, lane = (R() - .5) * (8 + 6 * R()); st.colFar.push([d, lane, R() < .2 ? 3 : 0, pick(CLI), pick(HDI), R()]); }
    // ----- Mecca: the houses round the court; the people going round the House; the column down from the rim -----
    st.housesK = []; for (let i = 0; i < 5000 && st.housesK.length < 230; i++) { const a = R() * TAU, rr = 46 + R() ** 1.6 * 230, x = Math.sin(a) * rr, z = Math.cos(a) * rr, w = 5 + R() * 7, d = 5 + R() * 7; if (hK(x, z) > 45 || (Math.abs(Math.sin(a * 3 + .4)) < .12 && rr < 120)) continue; if (st.housesK.some((H) => x - w / 2 < H[1] + 2.4 && x + w / 2 > H[0] - 2.4 && z - d / 2 < H[3] + 2.4 && z + d / 2 > H[2] - 2.4)) continue; st.housesK.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, 3.2 + R() * 3.4, MHOUSE[(R() * 4) | 0], Math.min(hK(x - w / 2, z - d / 2), hK(x + w / 2, z + d / 2), hK(x, z)) - .2]); }
    const inHijr = (x, z, m) => { const u = x * UN[0] + z * UN[1], v = x * VN[0] + z * VN[1]; return v > 0 && (u / (5.8 + m)) ** 2 + ((v - KA.hv) / (8.2 + m)) ** 2 < 1 || v > 0 && v < KA.hv + m && Math.abs(u) < KA.hu + m; };
    st.tawaf = []; for (let i = 0; i < 3000 && st.tawaf.length < 300; i++) { const a = R() * TAU, rr = 10.5 + R() ** .8 * 14; if (inHijr(Math.sin(a) * rr, Math.cos(a) * rr, 1.6) || (Math.abs(rr - 13.2) < 1.1 && Math.abs(Math.sin((a - .55) / 2)) < .1)) continue; st.tawaf.push([a, rr, pick(CLI), pick(HDI), R()]); }
    st.watchK = []; for (let i = 0; i < 120; i++) { const a = R() * TAU, rr = 27 + R() * 8, x = Math.sin(a) * rr, z = Math.cos(a) * rr; if (Math.abs(((a - Math.atan2(15, 37)) % TAU + TAU + Math.PI) % TAU - Math.PI) < .4) continue; st.watchK.push([x, z, R() < .5 ? 1 : -1, pick(CLI), pick(HDI), R()]); }
    const rimAt = (u) => { const n = RIM.length - 1, k = Math.max(0, Math.min(n - 1e-6, u * n)), i = Math.floor(k), f = k - i; return [mix(RIM[i][0], RIM[i + 1][0], f), mix(RIM[i][1], RIM[i + 1][1], f)]; };
    st.colK = []; for (let i = 0; i < 4000 && st.colK.length < 520; i++) { const u = R(), [x, z] = rimAt(u), lx = x + (R() - .5) * 9, lz = z + (R() - .5) * 6; if (Math.hypot(lx - PB[0], lz - PB[1]) < 7 || (lz > 400 && lz < 470 && lx > -60 && lx < -14) && Math.hypot(lx - PB[0], lz - PB[1]) < 26) continue; st.colK.push([lx, lz, R() < .25 ? 3 : 0, R() < .5 ? 1 : -1, pick(CLI), pick(HDI), R()]); }
    st.nearK = [[-36.5, 424, 1], [-35, 427.5, 1], [-22.5, 424.5, -1], [-34, 414, 1], [-21, 415.5, -1]].map(([x, z, d], i) => [x, z, d, CLI[i % 5], HDI[(i + 2) % 5], hash(i, 81)]);
    // ----- 'Arafat: tents at Namira among the arak; the people; the near ring that presses about his camel -----
    const camp = (cx, cz, rx, rz, n, keepOut, pal = TENT) => { const out = []; for (let i = 0; i < n * 8 && out.length < n; i++) { const x = cx + (R() * 2 - 1) * rx, z = cz + (R() * 2 - 1) * rz; if (keepOut(x, z) || out.some((q) => Math.abs(q[0] - x) < 6.2 && Math.abs(q[1] - z) < 5.2)) continue; const w = 3.2 + R() * 2.4; out.push([x, z, w, w * (.62 + R() * .2), 1.6 + R() * .6, pal[R() < .14 ? 3 : (R() * 5) | 0], (R() - .5) * .5]); } return out; };
    st.tA = camp(40, 10, 260, 220, 300, (x, z) => Math.hypot(x - QB[0], z - QB[1]) < 18 || Math.hypot(x - PNM[0] + 14, z - PNM[1]) < 30 || Math.abs(x - xU(z)) < 34 || Math.hypot(x - 34, z + 36) < 8);
    st.arak = []; for (let i = 0; i < 3000 && st.arak.length < 220; i++) { const x = -260 + R() * 420, z = -320 + R() * 640; if (Math.hypot(x - QB[0], z - QB[1]) < 14 || Math.hypot(x - PNM[0] + 14, z - PNM[1]) < 28 || st.tA.some((q) => Math.abs(q[0] - x) < 5 && Math.abs(q[1] - z) < 4) || Math.hypot(x - 34, z + 36) < 9) continue; st.arak.push([x, z, 1.4 + R() * 1.6, R()]); }
    // seated before him at Namira, facing east to him; the rest stand at the back
    st.sitA = []; for (let i = 0; i < 4000 && st.sitA.length < 340; i++) { const a = -Math.PI / 2 + (R() - .5) * 2.2, rr = 4.5 + R() ** .8 * 34, x = PNM[0] + Math.sin(a) * rr, z = PNM[1] + Math.cos(a) * rr * .9; if (Math.hypot(x - 34, z + 36) < 9 || Math.hypot(x - QB[0], z - QB[1]) < 5 || st.sitA.some((q) => Math.hypot(q[0] - x, q[1] - z) < .95)) continue; st.sitA.push([x, z, rr < 30 ? 5 : 0, 1, pick(CLI), pick(HDI), R()]); }
    // the plain: many thousands, thinner far off (invented counts); a clear lane where the camera stands
    st.fA = []; for (let i = 0; i < 60000 && st.fA.length < 9000; i++) { const x = 160 + R() * 1900, z = -700 + R() * 1500; const dm = Math.hypot(x - MQ[0], z - MQ[1]); if (dm < 26 || hA(x, z) > 4 || R() > .35 + .65 * Math.exp(-dm / 700) || Math.hypot(x - 627, z - 214.5) < 6 || Math.hypot(x - 620, z - 209) < 5) continue; const r = R(); st.fA.push([x, z, r < .05 ? 4 : r < .1 ? 3 : r < .3 ? 5 : 0, R() < .5 ? 1 : -1, pick(CLI), pick(HDI), R()]); }
    st.press = []; for (let i = 0; i < 46; i++) { const a = R() * TAU, rr = 2.0 + R() * 2.6; st.press.push([a, rr, pick(CLI), pick(HDI), R()]); }
    st.midA = []; for (let i = 0; i < 6000 && st.midA.length < 520; i++) { const a = R() * TAU, rr = 9 + R() ** .7 * 60, x = MQ[0] + Math.sin(a) * rr, z = MQ[1] + Math.cos(a) * rr; if (Math.hypot(x - 592, z - 189.5) < 6 || Math.hypot(x - 594, z - 188.5) < 6 || Math.hypot(x - 627, z - 214.5) < 6 || Math.hypot(x - 620, z - 209) < 5) continue; st.midA.push([x, z, R() < .2 ? 5 : 0, R() < .5 ? 1 : -1, pick(CLI), pick(HDI), R()]); }
    // ----- Mina: tents, couched camels, the people in their own clothes; near the rise they stand in an arc facing him -----
    const offN = (x, z, m) => hN(x, z) > 2.2 + m || Math.hypot(x - KN[0], z - KN[1]) < 44 || (x > KH[0] - 30 && x < KH[0] + 30 && z > KH[1] - 24 && z < KH[1] + 22);
    st.tN = camp(-100, -20, 900, 300, 460, (x, z) => offN(x, z, 0) || (Math.abs(x) < 90 && z > 60 && z < 200) || (x < -40 && x > -260 && Math.abs(z - zc(x)) < 14));
    const camLane = (x, z) => Math.hypot(x - 22, z - 108) < 5 || Math.hypot(x - 18, z - 110.5) < 4.5 || Math.hypot(x - 14, z - 113) < 4 || Math.hypot(x - 11.5, z - 115) < 3.6 || Math.hypot(x - 9, z - 117) < 3.4 || Math.hypot(x - 6.8, z - 119) < 3 || Math.hypot(x - 4.6, z - 121.2) < 3;
    st.fN = []; for (let i = 0; i < 50000 && st.fN.length < 6500; i++) { // knots of two to six people, sitting and standing, turned to each other
      const wide = R() < .3, gx = (R() * 2 - 1) * (wide ? 950 : 560) - 60, gz = (R() * 2 - 1) * (wide ? 300 : 210) + 10; if (offN(gx, gz, .5) || camLane(gx, gz) || R() > .5 + .5 * Math.exp(-Math.hypot(gx - KN[0], (gz - KN[1]) * 1.4) / 300) || st.tN.some((q) => Math.abs(q[0] - gx) < q[2] * .7 && Math.abs(q[1] - gz) < q[3] * .7)) continue;
      const n = 2 + (R() * 5 | 0), sitG = R() < .4;
      for (let j = 0; j < n; j++) { const a = j / n * TAU + R() * .6, rr = .7 + R() * .9, x = gx + Math.sin(a) * rr * 1.2, z = gz + Math.cos(a) * rr * .8; if (camLane(x, z)) continue; const r = R(); st.fN.push([x, z, r < .05 ? 4 : sitG && r < .8 ? 5 : 0, x < gx ? 1 : -1, pick(CL), pick(HD), R()]); }
    }
    st.arcN = []; for (let i = 0; i < 380; i++) { const a = Math.PI + (R() - .5) * 2.4, rr = 12 + R() ** .7 * 50, x = KN[0] + Math.sin(a) * rr * 1.3, z = KN[1] + Math.cos(a) * rr * .8; if (hN(x, z) > 3 || camLane(x, z)) continue; st.arcN.push([x, z, x < KN[0] ? 1 : -1, pick(CL), pick(HD), R()]); }
    st.rocksN = [[-2.6, 125.5, .55], [4.6, 125.6, .45], [-1.4, 131, .7], [3.6, 132, .6], [-4.2, 129, .4], [-1.2, 122.6, .35], [5.9, 128.9, .5], [-6, 124, .45], [6.4, 123.4, .4]];
    st.firesN = st.tN.filter((_, i) => i % 7 === 3).map((q, i) => [q[0] + 3.5 * Math.cos(i * 1.7), q[1] + 3.5 * Math.sin(i * 1.7), hash(i, 41)]);
    // the yard of al-Khayf: rows of men seated facing north to him (invented layout)
    st.khayf = []; for (let r = 0; r < 9; r++) for (let j = 0; j < 30; j++) { const x = KH[0] - 17 + j * 1.15 + (r % 2) * .5 + (hash(r, j) - .5) * .2, z = KH[1] + 6.5 - r * 1.5 + (hash(j, r) - .5) * .2; if (Math.hypot(x - (KH[0] + 8), z - (KH[1] - 5)) < 3.6 || Math.hypot(x - (KH[0] + 7), z - (KH[1] - 3.5)) < 3.4 || Math.hypot(x - (KH[0] + 6), z - (KH[1] - 2)) < 3.4) continue; st.khayf.push([x, z, 5, x < KH[0] ? 1 : -1, pick(CL), pick(HD), R()]); }
    // the caravan west down the valley at dusk: [distance ahead of him along the way (m), lane, kind, cloak, head, seed]
    st.dep = []; { let d = 8, i = 0; while (st.dep.length < 1500) { const n = 4 + (R() * 9 | 0); for (let k = 0; k < n; k++) { const r = R(); st.dep.push([d + R() * .8, (R() - .5) * 7, r < .38 ? 3 : r < .44 ? 2 : 0, CL[(i * 3 + k) % 7], HD[(i * 5 + k) % 7], R()]); d += .8 + R() * 1.1; } d += 3 + R() * 8; i++; } }
    st.stars = Array.from({ length: 900 }, () => [R(), R() ** 1.3, .3 + R() ** 3 * 1.7, R() * 9]);
    st.cloud = Array.from({ length: 6 }, () => [R(), .2 + R() * .45, .12 + R() * .2, R()]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    const wM = p < .2, wK = p >= .2 && p < .375, wA = p >= .375 && p < .64, wN = p >= .64;
    const IH = p >= .125 && p < .64; // in ihram from al-Bayda' to 'Arafat; at Mina, after the rites, in their own clothes
    const hW = wM ? hM : wK ? hK : wA ? hA : hN, gW = wM ? (x, z, h) => groundM(x, z, h) : wK ? groundK : wA ? groundA : groundN;
    // ----- the camera -----
    let cx, cyR, cz, hyF, sx, sy, sz;
    if (p >= .125 && p < .165) { // beside him on the road, a little ahead of him, on the right of the way
      const d = dPro(p), [ax, , az] = offR(d + 8.5, 7.6), [bx, , bz] = offR(d - 1.5, 0);
      cx = ax; cz = az; cyR = 2.0; hyF = .55; sx = bx; sy = 2.4; sz = bz;
    } else if (p >= .165 && p < .2) { // high over the road, the column running on to the horizon
      const u = seg(p, .165, .2), [ax, , az] = offR(mix(1150, 1260, u), -70), [bx, , bz] = offR(5200, 0);
      cx = ax; cz = az; cyR = mix(62, 70, u); hyF = .36; sx = bx; sy = 0; sz = bz;
    } else if (p >= .94) { // behind him on the way west at dusk, on the valley's south side of him
      const x = pxDep(p), z = zc(x);
      cx = x + 15; cz = z - 8.5; cyR = 3.2; hyF = .52; sx = x - 140; sy = 2; sz = zc(x - 140);
    } else { [cx, cyR, cz, hyF] = keyAt(CM, p); [sx, sy, sz] = keyAt(SM, p); }
    const camY = hW(cx, cz) + cyR;
    const fx = phone ? .5 : .4;
    let ang = Math.atan2(sx - cx, sz - cz) - Math.atan((fx - .5) * W / F);
    { // keep him in the picture: if his place falls outside the frame's open part, the camera turns just enough
      const hp = hisAt(p); if (hp) { const aH = Math.atan2(hp[0] - cx, hp[1] - cz); let d = aH - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); const X = W / 2 + Math.tan(d) * F, lo = W * (phone ? .16 : .1), hi = W * (phone ? .84 : .58);
        if (Math.abs(d) < 1.3 && (X < lo || X > hi)) ang = aH - Math.atan(((X < lo ? lo : hi) - W / 2) / F); }
    }
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const hy = H * (hyF + (phone ? .14 : 0));
    const VX = (x, z) => (x - cx) * ca - (z - cz) * sa, VZ = (x, z) => (x - cx) * sa + (z - cz) * ca;
    const P3 = (x, y, z) => { const v = Math.max(.4, VZ(x, z)); return [W / 2 + VX(x, z) * F / v, hy - (y - camY) * F / v, v]; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LQ, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const night = p >= .94 ? fade(p, .985, 1.06) : 0, day = c01((elev + 3) / 10) * (1 - night * .8);
    const fogA = (zr) => Math.min(.9, (1 - Math.exp(-zr / fogL)) * .95);
    const lit = (al, lam, skyL = 1) => al.map((v, j) => v / 255 * (amb[j] * skyL * .72 + sunC[j] * lam * .84));
    const fogd = (col, zr, k = .9) => lerp(col, haze, fogA(zr) * k);
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };
    const sunV = [sun[0] * ca - sun[2] * sa, sun[0] * sa + sun[2] * ca];
    const sunX = sunV[1] > .05 ? W / 2 + sunV[0] / sunV[1] * F : sunV[0] > 0 ? W * 1.25 : -W * .25, sunY = hy - Math.tan(se) * F;
    const litSide = sunV[0] >= 0 ? 1 : -1;

    // ----- the sky -----
    { const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      if (night > 0) st.stars.forEach(([u, v, m, ph]) => { const x = ((u * W * 1.2 - ang * 300) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, y = v * hy * .98; if (y > hy) return; const a = Math.min(1, m * .55 * (.65 + .35 * Math.sin(t * 1.4 + ph * 7))) * c01((hy - y) / (hy * .2)) * night; c.fillStyle = m > 1.5 ? `rgba(255,236,214,${a})` : `rgba(232,236,255,${a})`; c.fillRect(x, y, m > 1.2 ? 1.8 : 1.1, m > 1.2 ? 1.8 : 1.1); });
      const sunL = (1 - night) * c01((elev + 5) / 8);
      if (sunL > 0) {
        const g = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * 1.3); g.addColorStop(0, rgb(sunC, .42 * sunL)); g.addColorStop(.3, rgb(sunC, .12 * sunL)); g.addColorStop(1, rgb(sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
        if (sunV[1] > .05 && sunY > -20 && sunY < hy + F * .03) { const low = c01(1 - elev / 12), rD = F * .011 * (1 + .25 * low); // the disc itself: low, it is clear enough to be seen as a disc
          const q = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * .06); q.addColorStop(0, `rgba(255,252,236,${.9 * sunL})`); q.addColorStop(.25, rgb(sunC, .45 * sunL)); q.addColorStop(1, rgb(sunC, 0)); c.fillStyle = q; c.fillRect(sunX - F * .06, sunY - F * .06, F * .12, F * .12);
          if (low > 0) { c.fillStyle = rgb(lerp([255, 250, 230], [255, 196, 120], low), .95 * low * sunL); c.beginPath(); c.arc(sunX, sunY, rD, 0, TAU); c.fill(); } }
      }
      c.globalCompositeOperation = 'source-over';
      const cl = 1 - night; if (cl > 0) st.cloud.forEach(([u, v, w, k]) => { const x = ((u * W * 1.5 - ang * 260) % (W * 1.5) + W * 1.5) % (W * 1.5) - W * .25, y = hy - v * hy * .9, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const cc = lerp([255, 255, 255], sunC, .35); q.addColorStop(0, rgb(cc, 0)); q.addColorStop(.5, rgb(cc, (.2 + .2 * k) * cl)); q.addColorStop(1, rgb(cc, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 7 * k, 0, 0, TAU); c.fill(); });
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
            const cc = lit(gW(x, z, h, Math.hypot(hx, hz)), lam, skyL), n = (i * NC + k / 2) * 3;
            let wl = 0; if (night > 0 && wN) for (let f = 0; f < st.firesN.length; f += 3) { const q = st.firesN[f]; wl += Math.exp(-((x - q[0]) ** 2 + (z - q[1]) ** 2) / 90); }
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j] + ([4, 8, 26][j] + [140, 70, 20][j] * Math.min(1, wl)) * night, haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .1);
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
    const quad = (pts, col) => {
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
    // a figure: a faceless outline; dir ±1 (screen facing); o.hd the head cloth, or in ihram (o.ih) a bare dark head
    const person = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8 || (o.alpha ?? 1) <= 0) return null;
      const s = F / vz * (o.sc || 1), X = W / 2 + VX(x, z) * F / vz; if (X < -3 * s || X > W + 3 * s) return null;
      const Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, A = SH[o.a || 'stand'], hc = HC[o.a || 'stand'], sho = SHO[o.a || 'stand'], ln = o.lean || 0, ih = o.ih;
      const zr = vz;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * o.dir, -s);
      const lu = litSide * o.dir, base = fogd(lit(o.cl, (ih ? .3 : .18) * day + .02, .9), zr, .8), hi = fogd(lit(lerp(o.cl, [255, 236, 206], .1), .95 * day + .1, 1), zr, .8);
      const P = (i) => [A[2 * i] + ln * A[2 * i + 1], A[2 * i + 1]];
      c.beginPath(); for (let i = 0; i < 16; i++) { const q = P(i); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath();
      const g = c.createLinearGradient(-.3 * lu, 0, .3 * lu, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.5, rgb(lerp(hi, base, .65))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
      c.strokeStyle = `rgba(28,20,14,${(ih ? .45 : .35) + .2 * night})`; c.lineWidth = .025; c.stroke();
      if (o.rim) { c.strokeStyle = `rgba(${o.rimC || '255,220,160'},${o.rim})`; c.lineWidth = .05; c.stroke(); }
      if (ih) { // the shoulder cloth's edge, falling across the chest to the waist of the wrap
        c.save(); c.clip(); c.strokeStyle = rgb(lerp(base, [60, 50, 44], .25), .7); c.lineWidth = .035; c.beginPath(); c.moveTo(.16 + ln * 1.4, 1.4); c.quadraticCurveTo(-.02, 1.1, -.2 + ln * .9, .86); c.stroke();
        c.strokeStyle = rgb(lerp(base, [60, 50, 44], .2), .5); c.lineWidth = .025; c.beginPath(); c.moveTo(-.3, .9 + ln * .1); c.lineTo(.3, .9); c.stroke(); c.restore();
      } else { const robe = fogd(lit([214, 198, 166], .55 * day + .1, 1), zr, .8), wb = sho[1] * .66;
        c.save(); c.clip(); c.fillStyle = rgb(robe); c.beginPath(); c.moveTo(.06, 0); c.lineTo(.3, 0); c.lineTo(.2 + ln * wb, wb); c.lineTo(.1 + ln * wb, wb); c.closePath(); c.fill();
        c.fillStyle = rgb(lerp(base, [30, 22, 16], .25)); c.fillRect(-.4, wb - .03, .8, .05); c.restore(); }
      const sx0 = sho[0] + ln * sho[1], sy0 = sho[1];
      c.strokeStyle = rgb(lerp(base, hi, .35)); c.lineWidth = .11; c.lineCap = 'round';
      (o.arms || [[sho[0] + .06, sho[1] - .55]]).forEach(([ax, ay]) => { c.beginPath(); c.moveTo(sx0, sy0); c.quadraticCurveTo(mix(sx0, ax, .5) - .06, mix(sy0, ay, .5) - .04, ax, ay); c.stroke(); });
      const hx = hc[0] + ln * hc[1], hv = hc[1];
      const hdc = fogd(lit(o.hd, (ih ? .5 : .75) * day + .12, 1), zr, ih ? .5 : .8), hdd = fogd(lit(o.hd, .2 * day + .06, .85), zr, ih ? .5 : .8);
      if (!ih) { const b5 = P(5), b4 = P(4); c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .9) - .035, mix(b5[1], b4[1], .9)); c.lineTo(mix(b5[0], b4[0], .9) + .07, mix(b5[1], b4[1], .9) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill(); }
      const q = c.createLinearGradient(hx - .14 * lu, 0, hx + .14 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
      c.fillStyle = q; c.beginPath(); ih ? c.ellipse(hx - .01, hv - .02, .118, .108, 0, 0, TAU) : c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
      c.restore();
      return { X, Y, s };
    };
    const holy = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8) return null;
      const X = W / 2 + VX(x, z) * F / vz, Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, h = 1.8 * F / vz * (o.sc || 1);
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, amb: .3 + .7 * day, ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; hd.X = X; hd.Y = Y; return hd;
    };
    // a veiled rider on the camel: Holy's riding figure, clipped to the rider (cloak, disc and any sleeve), on the hump
    const rideHoly = (Xs, Ys, h, dir, o) => {
      const r = .072 * h, sw = .1425 * h, ny = Ys - .36 * h, hyy = ny - 1.1 * r, X = (u) => Xs + dir * u, ox = Xs + dir * .0213 * h, oy = Ys + .7568 * h;
      c.save(); c.beginPath();
      c.moveTo(X(-.6 * r), ny); c.quadraticCurveTo(X(-.85 * sw), ny + .15 * r, X(-.9 * sw), ny + 1.1 * r);
      c.bezierCurveTo(X(-sw), Ys - .1 * h, X(-.9 * sw), Ys, X(-1.1 * sw), Ys + .2 * h); c.quadraticCurveTo(X(0), Ys + .26 * h, X(1.3 * sw), Ys + .2 * h);
      c.bezierCurveTo(X(1.1 * sw), Ys, X(sw), Ys - .1 * h, X(.9 * sw), ny + 1.1 * r); c.quadraticCurveTo(X(.85 * sw), ny + .15 * r, X(.6 * r), ny); c.closePath();
      const R2 = (o.who === 'ali' ? 2.6 : 2.95) * r; c.moveTo(Xs + R2, hyy - .2 * r); c.arc(Xs, hyy - .2 * r, R2, 0, TAU, dir > 0);
      (o.arms || []).forEach(([dx, dy]) => { // the sleeve's way out from the shoulder
        const S0 = [X(.8 * sw), ny + 1.3 * r], T0 = [ox + dir * dx * h, oy + dy * h], L = Math.hypot(T0[0] - S0[0], T0[1] - S0[1]) || 1, nx = -(T0[1] - S0[1]) / L * 1.5 * r, nz = (T0[0] - S0[0]) / L * 1.5 * r;
        const e = [(T0[0] - S0[0]) / L * 1.2 * r, (T0[1] - S0[1]) / L * 1.2 * r];
        c.moveTo(S0[0] + nx, S0[1] + nz); c.lineTo(T0[0] + nx + e[0], T0[1] + nz + e[1]); c.lineTo(T0[0] - nx + e[0], T0[1] - nz + e[1]); c.lineTo(S0[0] - nx, S0[1] - nz); c.closePath();
      });
      c.clip('nonzero');
      const hd = Holy.draw(c, { who: o.who || 'prophet', pose: 'ride', mount: 'horse', flip: dir < 0, x: ox, y: oy, h, t: 0, amb: .3 + .7 * day, glow: o.glow ?? .1, arms: o.arms, sword: o.sword });
      c.restore();
      return hd;
    };
    // the near camel: walking (ph the gait, mv 0..1), or couched (k 0..1); a rider: 'man' (faceless) or 'holy' (veiled)
    const camelNear = (x, z, dir, o) => {
      const vz = VZ(x, z); if (vz < 1.2) return null; const s = F / vz, X = W / 2 + VX(x, z) * F / vz; if (X < -5 * s || X > W + 5 * s) return null;
      const Y = hy - (hW(x, z) - camY) * F / vz, k = o.k || 0, mv = (o.mv || 0) * (1 - k), ph = o.ph || 0, bob = Math.abs(Math.sin(ph)) * .05 * mv;
      const top = fogd(lit([212, 168, 118], .7 * day + .14), vz, .8), bot = fogd(lit([150, 112, 76], .22 * day + .08, .9), vz, .8), far = lerp(bot, [40, 30, 30], .25);
      const body = CAMB.map((q, i) => lerp(q, CAMBK[i], k));
      c.save(); c.translate(X, Y - bob * s); c.scale(s * dir, -s);
      const grad = c.createLinearGradient(0, 2.4 - k, 0, 1.0 - k); grad.addColorStop(0, rgb(top)); grad.addColorStop(1, rgb(bot));
      const leg = (u0, gp, near) => {
        if (k > .97) return; const L = 1 - k, a = ph + gp * TAU, sw = Math.sin(a) * .34 * mv, lift = Math.max(0, Math.cos(a)) * .18 * mv;
        c.beginPath(); tube(c, [[u0, 1.25 - k * 1.1], [u0 + sw * .4 + k * .25, (.66 + lift * .6) * L], [u0 + sw + k * .5, (.06 + lift) * L]], .26, .1); c.fillStyle = near ? grad : rgb(far); c.fill();
        c.beginPath(); c.ellipse(u0 + sw + .05 + k * .5, (.05 + lift) * L, .12, .05, 0, 0, TAU); c.fill();
      };
      CLEG.forEach(([u, gp, near]) => { if (!near) leg(u, gp, 0); });
      c.strokeStyle = rgb(bot); c.lineWidth = .06; c.beginPath(); c.moveTo(-1.24, 1.62 - k * 1.08); c.quadraticCurveTo(-1.42, 1.3 - k * 1.08 + Math.sin(t * 1.4 + x) * .04, -1.36, Math.max(.05, .98 - k * 1.08)); c.stroke();
      c.beginPath(); smoothPath(c, body); c.fillStyle = grad; c.fill();
      c.fillStyle = rgb(lerp(top, [255, 236, 200], .25), .5); c.beginPath(); c.ellipse(-.12, 2.3 - k * 1.04, .55, .12, -.05, 0, TAU); c.fill();
      c.fillStyle = rgb(lerp(bot, [30, 20, 16], .4)); c.beginPath(); c.ellipse(mix(2.04, 1.78, k), mix(2.27, 1.78, k), .06, .1, .4, 0, TAU); c.fill();
      CLEG.forEach(([u, gp, near]) => { if (near) leg(u, gp, 1); });
      const cl = o.saddle || [120, 70, 50], c1 = fogd(lit(cl, .6 * day + .12), vz, .8), c2 = fogd(lit(lerp(cl, [240, 220, 180], .4), .7 * day + .14), vz, .8), dv = -k * 1.04;
      c.beginPath(); c.moveTo(-.8, 2.04 + dv); c.quadraticCurveTo(-.1, 2.6 + dv, .52, 2.06 + dv); c.lineTo(.46, 1.46 + dv); c.lineTo(-.76, 1.46 + dv); c.closePath(); c.fillStyle = rgb(c1); c.fill();
      c.strokeStyle = rgb(c2); c.lineWidth = .05; c.beginPath(); c.moveTo(-.76, 1.62 + dv); c.lineTo(.46, 1.62 + dv); c.stroke();
      c.strokeStyle = rgb(fogd(lit([70, 40, 30], .3 * day + .06), vz, .8)); c.lineWidth = .035; c.beginPath(); const mz = lerp([2.24, 2.18], [1.98, 1.66], k), mz2 = lerp([1.92, 2.26], [1.7, 1.78], k); c.moveTo(mz[0], mz[1]); c.lineTo(mz[0] - .04, mz[1] - .2); c.moveTo(mz2[0], mz2[1]); c.lineTo(mz[0] + .02, mz[1] - .12); c.stroke();
      if (o.rider === 'man') {
        c.save(); c.translate(-.1, 2.42 + dv); c.beginPath(); for (let i = 0; i < SEAT.length; i += 2) i ? c.lineTo(SEAT[i], SEAT[i + 1]) : c.moveTo(SEAT[i], SEAT[i + 1]); c.closePath(); const rg = c.createLinearGradient(-.3 * litSide * dir, 0, .3 * litSide * dir, 0); rg.addColorStop(0, rgb(fogd(lit(o.cl, .9 * day + .12), vz, .7))); rg.addColorStop(1, rgb(fogd(lit(o.cl, .22 * day + .06, .85), vz, .7))); c.fillStyle = rg; c.fill(); c.strokeStyle = 'rgba(40,30,24,.5)'; c.lineWidth = .03; c.stroke();
        c.fillStyle = rgb(fogd(lit(o.hd, .6 * day + .12), vz, o.ih ? .5 : .8)); c.beginPath(); c.ellipse(.02, 1.12, .14, .12, 0, 0, TAU); c.fill(); c.restore();
      }
      c.restore();
      const seat = [X + (-.1) * s * dir, Y - bob * s - (2.4 - k * 1.04) * s];
      let hd = null; if (o.rider === 'holy') hd = rideHoly(seat[0], seat[1], 1.8 * s, dir, o);
      return { X, Y, s, seat, hd };
    };
    // a near horse (from tabuk), with or without its rider
    const horseRide = (x, z, dir, ph, moving, who, o = {}) => { // a veiled rider on his horse: Holy's own ride pose
      const vz = VZ(x, z); if (vz < 1) return null; const X = W / 2 + VX(x, z) * F / vz, Y = hy - (hW(x, z) - camY) * F / vz;
      return Holy.draw(c, { who, pose: 'ride', mount: 'horse', sword: who === 'ali', flip: dir < 0, x: X, y: Y, h: 1.8 * F / vz, t: moving ? ph : 0, amb: .3 + .7 * day, glow: o.glow ?? .1, arms: o.arms });
    };
    // ----- crowds, batched by depth band. Every size reads as a person: a cloak (or a white wrap) and a separate head
    //       over a neck notch; the nearest go to the depth-sorted list as full figures -----
    const BANDS = [140, 520, 1600, 1e9], NB = BANDS.length, bodyP = BANDS.map(() => [0, 1, 2].map(() => new Path2D())), headP = BANDS.map(() => new Path2D()), robeP = BANDS.map(() => new Path2D()), legP = new Path2D();
    const bandOf = (vz) => { let b = 0; while (vz > BANDS[b]) b++; return b; };
    const nearPx = wA || wN ? 36 : 28;
    const crowd = (kind, x, z, dir, ph, moving, k, o = {}) => {
      const vz = VZ(x, z); if (vz < 2) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -40 || X > W + 40) return;
      const Y = hy - (hW(x, z) - camY) * F / vz, s = F / vz * (.93 + .14 * k), b = bandOf(vz), pa = bodyP[b][(k * 7 | 0) % 3], hp = headP[b], hpx = 1.8 * s;
      if (hpx > nearPx) { items.push([vz, () => {
        if (kind === 3) { shadow(x, z, 2.2, 1.3, .22); camelNear(x, z, dir, { mv: moving ? 1 : 0, ph, rider: o.empty ? null : 'man', cl: o.cl, hd: o.hd, ih: IH, saddle: IH ? [150, 120, 92] : o.cl }); }
        else if (kind === 4) { shadow(x, z, 1.2, 1.3, .22); camelNear(x, z, dir, { k: 1, saddle: lerp(o.cl || CL[0], [200, 180, 140], .3) }); }
        else if (kind === 2) { shadow(x, z, 2.2, 1.1, .24); const pc = new Path2D(); poly(pc, HORSE, X, Y, s, dir); c.fillStyle = rgb(fogd(lit([96, 68, 48], .5 * day + .12), vz, .8)); c.fill(pc); }
        else { shadow(x, z, kind === 5 ? 1 : 1.7, .5, .24); person(x, z, { a: kind === 5 ? 'sit' : 'stand', dir, cl: o.cl, hd: o.hd, ih: IH, lean: o.lean ?? (moving ? .05 : 0), arms: o.arms, rim: o.rim ?? .1, rimC: o.rimC }); }
      }]); return; }
      const bob = moving ? Math.abs(Math.sin(ph)) * .04 * s : 0;
      if (kind === 2 || kind === 3) {
        const sh = kind === 3 ? CAMEL : HORSE, lh = kind === 3 ? 1.28 : 1.12;
        if (hpx >= 4.5) { poly(pa, sh, X, Y - bob, s, dir); [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, q]) => { const a = Math.sin(ph + q) * (moving ? .45 : .05); legP.moveTo(X + hu * s * dir, Y - lh * s); legP.lineTo(X + (hu + a * .5) * s * dir, Y - lh * .46 * s); legP.lineTo(X + (hu + a * .3) * s * dir, Y); }); }
        else { const w = Math.max(2.2, 2.1 * s), hh = Math.max(1.4, .8 * s), yb = Y - Math.max(1.2, lh * s); pa.moveTo(X - w / 2, yb); pa.quadraticCurveTo(X, yb - hh * 1.4, X + w / 2, yb); pa.lineTo(X + w * .36, Y); pa.lineTo(X + w * .26, yb + .5); pa.lineTo(X - w * .26, yb + .5); pa.lineTo(X - w * .36, Y); pa.closePath(); }
        if (!o.empty) { const ry = Y - bob - Math.max(kind === 3 ? 2.6 : 2.2, (kind === 3 ? 2.05 : 1.48) * s), rw = Math.max(.9, .44 * s), rh = Math.max(1.6, .82 * s), hr = Math.max(.7, .15 * s), rx = X - (kind === 3 ? .25 : .1) * s * dir, rp = IH ? bodyP[b][0] : pa;
          rp.moveTo(rx - rw / 2, ry); rp.lineTo(rx - rw * .32, ry - rh); rp.lineTo(rx + rw * .32, ry - rh); rp.lineTo(rx + rw / 2, ry); rp.closePath();
          hp.moveTo(rx + hr, ry - rh - hr * 1.2); hp.arc(rx, ry - rh - hr * 1.2, hr, 0, TAU); }
        return;
      }
      if (kind === 4) { const cp = IH ? camP[b] : pa; if (hpx >= 4.5) poly(cp, CAMELK, X, Y, s, dir); else { const w = Math.max(2, 2.1 * s), hh = Math.max(1.1, 1.1 * s); cp.moveTo(X - w / 2, Y); cp.quadraticCurveTo(X - w * .1, Y - hh * 1.6, X + w * .3, Y - hh * .6); cp.lineTo(X + w * .5, Y - hh * 1.2); cp.lineTo(X + w * .56, Y); cp.closePath(); } return; }
      const sit = kind === 5, ln = (o.lean ?? (moving ? .06 : .015 * Math.sin(k * 40))) * dir;
      if (hpx >= 7) { poly(pa, sit ? SITS : hpx < 14 ? MANS : MAN, X, Y - bob, s, dir, ln); if (!IH && !sit) { const rp = robeP[b], P = (u, v) => [X + (u + ln * v) * s * dir, Y - bob - v * s]; [[.05, 0], [.25, 0], [.17, .92], [.09, .92]].forEach(([u, v], q) => { const [px, py] = P(u, v); q ? rp.lineTo(px, py) : rp.moveTo(px, py); }); rp.closePath(); } const hr = (hpx < 14 ? .17 : .15) * s, hv = (sit ? 1.0 : hpx < 14 ? 1.66 : 1.66) * s; hp.moveTo(X + ln * hv + hr, Y - bob - hv); hp.ellipse(X + ln * hv, Y - bob - hv, hr, hr * .85, 0, 0, TAU); return; }
      // small: a tapered cloak and a head set clear of the shoulders (never a post)
      const hh = Math.max(sit ? 1.6 : 2.3, (sit ? .78 : 1.42) * s), bw = Math.max(sit ? 1.6 : 1.05, (sit ? .8 : .6) * s), sw = Math.max(.7, .36 * s), hr = Math.max(.62, .14 * s), lx = ln * hh;
      pa.moveTo(X - bw / 2, Y - bob); pa.lineTo(X - sw / 2 + lx, Y - bob - hh); pa.lineTo(X + sw / 2 + lx, Y - bob - hh); pa.lineTo(X + bw / 2, Y - bob); pa.closePath();
      hp.moveTo(X + lx * 1.1 + hr, Y - bob - hh - hr * 1.25); hp.arc(X + lx * 1.1, Y - bob - hh - hr * 1.25, hr, 0, TAU);
    };
    const camP = BANDS.map(() => new Path2D()); // in ihram the couched camels keep their own brown, apart from the white wraps
    const flushCrowd = () => {
      const TN = IH ? TONESI : TONES, hdTone = IH ? [58, 44, 36] : [170, 136, 92];
      for (let b = NB - 1; b >= 0; b--) {
        const fa = Math.min(.86, fogA([70, 300, 1000, 2600][b]) * (b > 1 ? 1.35 : 1)), sh = .55 + .45 * day;
        if (IH) { c.fillStyle = rgb(lerp(lit([176, 140, 96], .45 * day + .1), haze, fa)); c.fill(camP[b]); camP[b] = new Path2D(); }
        TN.forEach((tn, j) => { c.fillStyle = rgb(lerp(lit(tn, (IH ? .42 : .35) * day + .08), haze, fa * (IH ? .75 : 1)).map((v) => v * (b < 2 ? sh : 1))); c.fill(bodyP[b][j]); if (IH && b < 3) { c.strokeStyle = rgb(lerp([70, 58, 50], haze, fa * .6), .5); c.lineWidth = .7; c.stroke(bodyP[b][j]); } bodyP[b][j] = new Path2D(); });
        if (!IH) { c.fillStyle = rgb(lerp(lit([214, 198, 166], .6 * day + .12), haze, fa)); c.fill(robeP[b]); } robeP[b] = new Path2D();
        c.fillStyle = rgb(lerp(lit(hdTone, (IH ? .5 : .9) * day + .14), haze, fa * (IH ? .45 : .85))); c.fill(headP[b]);
        headP[b] = new Path2D();
      }
      c.strokeStyle = rgb([34, 26, 20], .8); c.lineWidth = Math.max(.7, F / 1600); c.stroke(legP);
    };
    // a tent: a ridge roof of goat hair or hide on poles; far ones batched
    const tentFar = [new Path2D(), new Path2D()];
    const tent = (x, z, w, d, h, col, yaw) => {
      const vz = VZ(x, z); if (vz < 3) return; const X = W / 2 + VX(x, z) * F / vz, s = F / vz; if (X < -w * s - 20 || X > W + w * s + 20) return;
      const cy = Math.cos(yaw), sy2 = Math.sin(yaw), at = (u, v, y) => P3(x + u * cy - v * sy2, hW(x, z) + y, z + u * sy2 + v * cy);
      if (s * w < 7) { const [Xa, Ya] = at(-w / 2, 0, h), [Xb, Yb] = at(w / 2, 0, h), [Xc, Yc] = at(w / 2, 0, 0), [Xd, Yd] = at(-w / 2, 0, 0), dk = tentFar[col[0] > 150 ? 1 : 0]; const e = Math.max(.8, (Yc - Yb) * .5); dk.moveTo(Xd - e, Yd); dk.lineTo(Xa, Ya); dk.lineTo(Xb, Yb); dk.lineTo(Xc + e, Yc); dk.closePath(); return; }
      items.push([vz + d * .3, () => {
        const ev = h * .42, sideV = VZ(x - sy2, z + cy) < VZ(x + sy2, z - cy) ? 1 : -1, end = VX(x + cy, z + sy2) - VX(x - cy, z - sy2) > 0 ? (VZ(x + cy * w, z + sy2 * w) < VZ(x - cy * w, z - sy2 * w) ? 1 : -1) : 1;
        const slope = (sg, lam) => { const pts = [at(-w / 2, sg * d / 2, ev), at(w / 2, sg * d / 2, ev), at(w / 2, 0, h), at(-w / 2, 0, h)]; c.fillStyle = rgb(fogd(lit(col, lam * day + .06, .9), vz, .85)); c.beginPath(); pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill(); };
        shadow(x, z, h, w * .55, .2);
        slope(-sideV, .2); slope(sideV, .25 + .75 * Math.max(0, sun[1] * .6 + (sideV * (sun[2] * cy - sun[0] * sy2)) * .6));
        const g0 = at(end * w / 2, -d / 2, ev), g1 = at(end * w / 2, 0, h), g2 = at(end * w / 2, d / 2, ev), g3 = at(end * w / 2, d / 2, 0), g4 = at(end * w / 2, -d / 2, 0);
        c.fillStyle = rgb(fogd(lit(lerp(col, [20, 16, 14], .3), .12 * day + .04, .8), vz, .85)); c.beginPath(); [g4, g0, g1, g2, g3].forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
        c.strokeStyle = rgb(fogd(lit([70, 52, 36], .3 * day + .06), vz, .85)); c.lineWidth = Math.max(.6, .05 * s); const pl = at(end * w / 2, 0, 0); c.beginPath(); c.moveTo(pl[0], pl[1]); c.lineTo(g1[0], g1[1] - .2 * s); c.stroke();
      }]);
    };
    const flushTents = () => { const fa = .6; c.fillStyle = rgb(lerp(lit(TENT[0], .2 * day + .06, .9), haze, fogA(400) * fa)); c.fill(tentFar[0]); c.fillStyle = rgb(lerp(lit(TENT[3], .7 * day + .1, .9), haze, fogA(400) * fa)); c.fill(tentFar[1]); tentFar[0] = new Path2D(); tentFar[1] = new Path2D(); };
    // a shrub or a tree: an acacia (a short trunk and a flat crown) or an arak bush (a low rounded green mass)
    const tree = (x, z, r, k, arak) => { const vz = VZ(x, z); if (vz < 3 || vz > 3500) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -60 || X > W + 60) return;
      items.push([vz, () => {
        const s = F / vz, Y = hy - (hW(x, z) - camY) * F / vz, hh = r * .9, col = fogd(lit(arak ? [70, 96, 54] : [82, 92, 52], .45 * day + .08, .9), vz, .92), top = fogd(lit(arak ? [126, 150, 84] : [142, 146, 88], day + .1, 1), vz, .92);
        if (s * hh < 1.6) { c.fillStyle = rgb(col); c.fillRect(X - Math.max(1, r * s * .6), Y - Math.max(1.2, s * hh), Math.max(2, r * s * 1.2), Math.max(.8, s * hh * (arak ? .8 : .35))); return; }
        c.fillStyle = rgb(shCol, .22); c.beginPath(); c.ellipse(X + shD[0] * s * hh * .4, Y, r * s * .9, r * s * .18, 0, 0, TAU); c.fill();
        if (arak) { for (let j = 0; j < 7; j++) { const ox = (hash(j, k) - .5) * r * 1.3, oy = hh * (.3 + .45 * hash(k, j)), rr = r * (.36 + .2 * hash(j, 5)); c.fillStyle = rgb(j % 3 ? col : lerp(col, top, .6)); c.beginPath(); c.ellipse(X + ox * s, Y - oy * s, rr * s, rr * .72 * s, 0, 0, TAU); c.fill(); } c.fillStyle = rgb(top, .35); c.beginPath(); c.ellipse(X - litSide * r * .2 * s, Y - hh * .78 * s, r * s * .45, r * s * .2, 0, 0, TAU); c.fill(); return; }
        c.strokeStyle = rgb(fogd(lit([92, 72, 54], .4 * day + .1, .9), vz, .92)); c.lineWidth = Math.max(.8, .18 * s); c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X + (k - .5) * .5 * s, Y - hh * .5 * s, X + (k - .5) * .2 * s, Y - hh * s); c.moveTo(X + (k - .5) * .25 * s, Y - hh * .6 * s); c.lineTo(X + (k - .2) * r * .7 * s, Y - hh * .95 * s); c.stroke();
        for (let j = 0; j < 5; j++) { const ox = (j / 4 - .5) * r * 1.5 + (hash(j, k) - .5) * .4 * r, oy = hh * (.95 + .12 * hash(k, j)); c.fillStyle = rgb(j % 2 ? col : lerp(col, top, .4)); c.beginPath(); c.ellipse(X + ox * s, Y - oy * s, r * s * (.38 + .12 * hash(j, 3)), r * s * .13, 0, 0, TAU); c.fill(); }
        c.fillStyle = rgb(top, .35); c.beginPath(); c.ellipse(X, Y - hh * 1.04 * s, r * s * .8, r * s * .07, 0, 0, TAU); c.fill();
      }]); };
    // a ring of light on the ground, centred on (x, z): its radius R (m), at height y above the ground there
    const ring = (x, z, R0, a, y = .3, col = [255, 222, 160], wpx = 2) => { if (a <= 0 || R0 <= 0) return;
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.strokeStyle = rgb(col, a); c.lineWidth = wpx; c.beginPath(); let on = false;
      let lx = 0, ly = 0; for (let i = 0; i <= 96; i++) { const q = i / 96 * TAU, px = x + Math.sin(q) * R0, pz = z + Math.cos(q) * R0; if (VZ(px, pz) < Math.max(6, R0 * .35)) { on = false; continue; } const [X, Y] = P3(px, hW(px, pz) + y, pz); if (on && Math.hypot(X - lx, Y - ly) > W * .25) on = false; on ? c.lineTo(X, Y) : c.moveTo(X, Y); on = true; lx = X; ly = Y; }
      c.stroke(); c.lineWidth = wpx * 5; c.strokeStyle = rgb(col, a * .18); c.stroke(); c.restore(); };
    const dipK = Math.max(...CUTS.map((d) => bump(p, ...d)));

    // ----- the ground near the camera: stones and dry tufts on a fixed world grid -----
    { const G = 2.6, R0 = 80, i0 = Math.floor((cx - R0) / G), i1 = Math.ceil((cx + R0) / G), j0 = Math.floor((cz - R0) / G), j1 = Math.ceil((cz + R0) / G);
      const tuftP = new Path2D(), stoneP = new Path2D(), stoneT = new Path2D(), shP = new Path2D(), dens = wK ? (cz > 200 ? .5 : .06) : wN ? .12 : wA ? .32 : cz < -60 ? .55 : .2;
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const hh = hash(i, j, 7); if (hh > dens) continue;
        const x = (i + hash(i, j, 1)) * G, z = (j + hash(i, j, 2)) * G, vz = VZ(x, z); if (vz < 1.2 || vz > R0) continue;
        if (wM && ((x > MOS[0] - 1 && x < MOS[1] + 1 && z > MOS[2] - 1 && z < MOS[3] + 1) || st.houses.some((H) => x > H[0] - .5 && x < H[1] + .5 && z > H[2] - .5 && z < H[3] + .5))) continue;
        if (wN && x > KH[0] - 24 && x < KH[0] + 24 && z > KH[1] - 16 && z < KH[1] + 16) continue;
        const s = F / vz, X = W / 2 + VX(x, z) * F / vz; if (X < -20 || X > W + 20) continue;
        const Y = hy - (hW(x, z) - camY) * F / vz, k = hash(i, j, 3), r = (.12 + .35 * k * k) * s;
        if (r < .6) continue;
        if (hh < dens * .45 || wN || (wK && cz < 200)) {
          const w = r * (1.2 + k), hgt = r * (.55 + .4 * hash(i, j, 4));
          shP.moveTo(X + w * 1.3, Y); shP.ellipse(X + w * .4 * -litSide, Y, w * 1.3, hgt * .35, 0, 0, TAU);
          stoneP.moveTo(X - w, Y); stoneP.bezierCurveTo(X - w, Y - hgt * .9, X + w * .7, Y - hgt * 1.1, X + w, Y); stoneP.closePath();
          stoneT.moveTo(X - w * .7, Y - hgt * .45); stoneT.bezierCurveTo(X - w * .5, Y - hgt * .95, X + w * .4, Y - hgt * 1.0, X + w * .55, Y - hgt * .5); stoneT.quadraticCurveTo(X, Y - hgt * .62, X - w * .7, Y - hgt * .45); stoneT.closePath();
        } else {
          for (let q = 0; q < 6; q++) { const a = (q / 5 - .5) * 1.5 + (hash(i, j, q) - .5) * .4, L = r * (1.4 + hash(q, i, j)); tuftP.moveTo(X + (q - 2.5) * r * .12, Y); tuftP.quadraticCurveTo(X + Math.sin(a) * L * .4, Y - L * .6, X + Math.sin(a) * L, Y - Math.cos(a) * L * .9); }
        }
      }
      c.fillStyle = rgb(shCol, .3 * (.4 + .6 * day)); c.fill(shP);
      const stc = lit(wN || wK ? [108, 92, 84] : [140, 116, 92], .3 * day + .06, .85), stt = lit(wN || wK ? [184, 160, 140] : [222, 204, 170], day + .1, 1);
      c.fillStyle = rgb(stc); c.fill(stoneP); c.fillStyle = rgb(lerp(stc, stt, .55), .8); c.fill(stoneT);
      c.strokeStyle = rgb(lit([150, 132, 82], .7 * day + .1, 1), .85); c.lineWidth = Math.max(.7, F / 900); c.lineCap = 'round'; c.stroke(tuftP);
    }

    if (wM) {
      // ================= Medina and the road =================
      st.acacia.forEach(([x, z, r, k]) => tree(x, z, r, k, false));
      st.houses.forEach(([x0, x1, z0, z1, h, col]) => { slab(x0, x1, z0, z1, h, col, 0, 4); slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .25, lerp(col, [236, 214, 176], .2), h, 0, VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .05); });
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
          c.fillStyle = rgb(lerp(trunk, dark, .5)); c.beginPath(); c.arc(tx, ty, .22 * s, 0, TAU); c.fill();
        }]);
      });
      // the mosque: the yard, its low walls, the shade of fronds along the south wall
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
      if (p < .06) { // he stands in the yard in a column of light (metaphoric: the verse coming down, Kafi 4:245)
        items.push([VZ(0, 3.5), () => {
          shadow(0, 3.5, 1.8, .6, .3); const hd = holy(0, 3.5, { pose: 'stand', glow: .25 }); if (!hd) return;
          const L = fade(p, -.04, .02), s = hd.h / 1.8;
          c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, 0, hd.Y); g.addColorStop(0, 'rgba(255,246,214,0)'); g.addColorStop(.6, `rgba(255,240,200,${.16 * L})`); g.addColorStop(1, `rgba(255,236,190,${.22 * L})`); c.fillStyle = g; c.beginPath(); c.moveTo(hd.X - .5 * s, 0); c.lineTo(hd.X + .5 * s, 0); c.lineTo(hd.X + 1.1 * s, hd.Y); c.lineTo(hd.X - 1.1 * s, hd.Y); c.closePath(); c.fill(); c.restore();
          glow(hd.x, hd.y, 3 * s, [255, 232, 180], .2 * L);
        }]);
        st.yard.forEach(([x, z, d, cl, hd]) => items.push([VZ(x, z), () => { shadow(x, z, 1, .5, .26); person(x, z, { a: 'sit', dir: d, cl, hd }); }]));
        draw();
      } else if (p < .125) { // the criers on the roofs; the people coming in
        st.come.forEach(([x0, z0, x1, z1, s0, cl, hd, k]) => { const u = smooth(seg(p, .064 + s0, .122)), x = mix(x0, x1, u), z = mix(z0, z1, u), mv = u > 0 && u < 1; crowd(0, x, z, VX(x1, z1) > VX(x0, z0) ? 1 : -1, p * 1600 + k * 9, mv, k, { cl, hd }); });
        st.criers.forEach(([x, z, y0], i) => items.push([VZ(x, z) - 1, () => { person(x, z, { a: 'stand', dir: i % 2 ? 1 : -1, cl: CL[(i + 2) % 7], hd: HD[(i + 4) % 7], y0, arms: [[.24, 1.62]], rim: .2, rimC: '255,226,170' }); }]));
        flushCrowd(); draw();
        // their voices: rings of light going out over the roofs, three from each crier, one after another
        st.criers.forEach(([x, z, y0]) => { const [X, Y] = P3(x, y0 + 1.6, z); glow(X, Y, 18, [255, 226, 170], .3 * bump(p, .064, .07, .118, .124)); }); st.criers.forEach(([x, z, y0], i) => { for (let j = 0; j < 3; j++) { const t0 = .066 + j * .015 + i * .0035, u = seg(p, t0, t0 + .04); if (u <= 0 || u >= 1) continue; const R0 = 4 + 90 * ease.out(u), a = .5 * (1 - u) * fade(u, 0, .08); const [X, Y] = P3(x, y0 + 1.7, z); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,224,160,${a})`; c.lineWidth = 1.6; c.beginPath(); let on = false; for (let q = 0; q <= 64; q++) { const qa = q / 64 * TAU, px = x + Math.sin(qa) * R0, pz = z + Math.cos(qa) * R0; if (VZ(px, pz) < 2) { on = false; continue; } const [PX, PY] = P3(px, y0 + 1.7, pz); on ? c.lineTo(PX, PY) : c.moveTo(PX, PY); on = true; } c.stroke(); c.lineWidth = 7; c.strokeStyle = `rgba(255,224,160,${a * .15})`; c.stroke(); c.restore(); glow(X, Y, 14, [255, 226, 170], .3 * (1 - u)); } });
      } else if (p < .165) { // al-Bayda': he rides his camel in the white column; the light runs along it
        const d0 = dPro(p), mvK = 1;
        st.colI.forEach(([e, lane, kind, cl, hd, k]) => { const [x, , z] = offR(d0 + e, lane), [fx2, , fz2] = offR(d0 + e - 4, lane), dir = VX(fx2, fz2) / Math.max(1, VZ(fx2, fz2)) - VX(x, z) / Math.max(1, VZ(x, z)) >= 0 ? 1 : -1; crowd(kind, x, z, dir, (d0 + e) * 2.2 + k * 9, mvK, k, { cl, hd }); });
        flushCrowd();
        const [hx, , hz] = offR(d0, 0), [fx3, , fz3] = offR(d0 - 4, 0), hdir = VX(fx3, fz3) / Math.max(1, VZ(fx3, fz3)) - VX(hx, hz) / Math.max(1, VZ(hx, hz)) >= 0 ? 1 : -1;
        items.push([VZ(hx, hz), () => { shadow(hx, hz, 2.2, 1.4, .28); camelNear(hx, hz, hdir, { mv: 1, ph: d0 * 2.2, rider: 'holy', who: 'prophet', saddle: [128, 52, 40], glow: .16 }); }]);
        draw();
        const ta = fade(p, .133, .148); // the talbiya: from the heads near him small rings of light rise and widen (metaphoric)
        if (ta > 0) { c.save(); c.globalCompositeOperation = 'lighter'; st.colI.forEach(([e, lane, kind, , , k], i) => { if (i % 4 || e < -60 || e > 30) return; const [x, , z] = offR(d0 + e, lane), vz = VZ(x, z); if (vz < 4 || vz > 90) return; const u = ((p - .125) * 60 + k) % 1, s2 = F / vz, [X, Y] = P3(x, hW(x, z) + (kind === 3 ? 3.1 : 1.9) + u * 2.4, z), a = ta * .55 * Math.sin(u * Math.PI); c.strokeStyle = `rgba(255,226,170,${a})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(X, Y, (.2 + .9 * u) * s2, (.07 + .3 * u) * s2, 0, 0, TAU); c.stroke(); }); c.restore(); }
      } else { // high over the road: the white thread to the horizon, the light all along it
        const head = 6000 + (p - .165) * 3000;
        st.colFar.forEach(([d, lane, kind, cl, hd, k]) => { const dd = d - (6000 - head); if (dd < 900) return; const [x, , z] = offR(dd, lane); crowd(kind, x, z, -1, dd * 2.2 + k * 9, true, k, { cl, hd }); });
        flushCrowd(); draw();
        talbiya(900, head + 1200, 3, fade(p, .168, .185));
      }
    } else if (wK) {
      // ================= Mecca: the rim and the House =================
      st.housesK.forEach(([x0, x1, z0, z1, h, col, y0]) => { slab(x0, x1, z0, z1, h, col, y0, 3); slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .3, lerp(col, [210, 196, 170], .25), y0 + h, 0, VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .05); });
      kaaba();
      for (let i = 0; i < HIJR.length - 1; i++) { const [x0, z0] = HIJR[i], [x1, z1] = HIJR[i + 1], xm = (x0 + x1) / 2, zm = (z0 + z1) / 2; items.push([VZ(xm, zm) + .2, () => { const nx = z1 - z0, nz = -(x1 - x0), nl = Math.hypot(nx, nz), lam = Math.max(0, (nx * sun[0] + nz * sun[2]) / nl) * .8 + .1; const col = rgb(fogd(lit([214, 202, 178], lam * day + .1), VZ(xm, zm))); quad([[x0, 0, z0], [x1, 0, z1], [x1, 1.3, z1], [x0, 1.3, z0]], col); quad([[x0, 1.3, z0], [x1, 1.3, z1], [x1 - nx / nl * .9, 1.3, z1 - nz / nl * .9], [x0 - nx / nl * .9, 1.3, z0 - nz / nl * .9]], rgb(fogd(lit([226, 216, 194], Math.max(0, sun[1]) * day + .14), VZ(xm, zm)))); }]); }
      const turn = (p - .315) * 2.4;
      st.tawaf.forEach(([a0, rr, cl, hd, k]) => { const a = a0 - turn * (14 / rr), x = Math.sin(a) * rr, z = Math.cos(a) * rr, fwx = Math.cos(a), fwz = -Math.sin(a), dir = VX(x - fwx, z - fwz) > VX(x, z) ? 1 : -1; crowd(0, x, z, dir, a * rr * 3.1, true, k, { cl, hd }); });
      st.watchK.forEach(([x, z, dir, cl, hd, k]) => crowd(k < .3 ? 5 : 0, x, z, dir, 0, false, k, { cl, hd }));
      st.colK.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, p < .315, k, { cl, hd, lean: .02 * Math.sin(t * .6 + k * 9) }));
      flushCrowd();
      if (p < .315) { // the rim: he on his camel at the brow; Ali rides up; the near pilgrims stop
        st.nearK.forEach(([x, z, d, cl, hd, k]) => crowd(0, x, z, d, 0, false, k, { cl, hd, lean: .02 * Math.sin(t * .7 + k * 9) }));
        flushCrowd();
        const [ax, az, au] = aliUp(p), toA = VX(ax, az) > VX(...PB) ? 1 : -1;
        items.push([VZ(...PB), () => { shadow(...PB, 2.2, 1.4, .28); camelNear(PB[0], PB[1], toA, { mv: 0, ph: 0, rider: 'holy', who: 'prophet', saddle: [128, 52, 40], glow: .14 + .2 * bump(p, .282, .29, .306, .314) }); }]);
        items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.2, .28); horseRide(ax, az, VX(...PB) > VX(ax, az) ? 1 : -1, au < 1 ? p * 400 : 0, au < 1, 'ali', { glow: .1 + .2 * bump(p, .282, .29, .306, .314) }); }]);
        const wl = bump(p, .29, .298, .306, .314); // the light between them at his words (metaphoric)
        if (wl > 0) items.push([VZ(-27.7, 419.8) - 2, () => { const q = P3(-27.7, hK(-27.7, 419.8) + 2.6, 419.8), s = F / q[2]; glow(q[0], q[1], 3.4 * s, [255, 226, 170], .22 * wl); }]);
      } else { // the House: he goes round it among the people (Kafi 4:245)
        const rr = 13.2, a = .55 - turn * (14 / rr), [x, z] = tawafAt(p), fwx = Math.cos(a), fwz = -Math.sin(a), dir = VX(x - fwx, z - fwz) > VX(x, z) ? 1 : -1;
        items.push([VZ(x, z), () => { shadow(x, z, 1.8, .6, .3); holy(x, z, { pose: 'walk', phase: (p * 260) % 1, flip: dir < 0, glow: .2 }); }]);
      }
      draw();
    } else if (wA) {
      // ================= 'Arafat =================
      st.arak.forEach(([x, z, r, k]) => tree(x, z, r, k, true));
      st.tA.forEach((q) => tent(...q)); flushTents();
      // his domed tent (Kafi 4:247: «فضُربت قبّته»): a dome of hide over a low wall of cloth (its look invented)
      items.push([VZ(...QB), () => { const vz = VZ(...QB); if (vz < 3) return; const R0 = 2.8, Hd = 3.1, [X, Y] = P3(QB[0], hA(...QB), QB[1]), s = F / vz, w = R0 * s, hh = Hd * s;
        shadow(QB[0], QB[1], 3, 2.6, .28);
        const g = c.createLinearGradient(X - w * litSide, 0, X + w * litSide, 0); g.addColorStop(0, rgb(fogd(lit([168, 92, 62], .9 * day + .14), vz))); g.addColorStop(1, rgb(fogd(lit([104, 52, 38], .18 * day + .06), vz)));
        c.fillStyle = g; c.beginPath(); c.moveTo(X - w, Y); c.lineTo(X - w, Y - hh * .32); c.bezierCurveTo(X - w, Y - hh * 1.02, X + w, Y - hh * 1.02, X + w, Y - hh * .32); c.lineTo(X + w, Y); c.closePath(); c.fill();
        c.strokeStyle = rgb(fogd(lit([226, 196, 150], .7 * day + .1), vz), .55); c.lineWidth = Math.max(.8, .05 * s); c.beginPath(); c.moveTo(X - w, Y - hh * .32); c.lineTo(X + w, Y - hh * .32); c.stroke();
        c.fillStyle = rgb(fogd(lit([40, 22, 18], .05), vz)); c.fillRect(X - .45 * s, Y - 1.7 * s, .9 * s, 1.7 * s);
        c.strokeStyle = rgb(fogd(lit([90, 70, 50], .4), vz)); c.lineWidth = Math.max(.8, .06 * s); c.beginPath(); c.moveTo(X, Y - hh * .78); c.lineTo(X, Y - hh * 1.02); c.stroke(); }]);
      if (p < .44) { // Namira: he stands before the people seated on the ground (Kafi 4:247: «فوعظ الناس وأمرهم ونهاهم»)
        st.sitA.forEach(([x, z, kind, , cl, hd, k]) => crowd(kind, x, z, VX(...PNM) > VX(x, z) ? 1 : -1, 0, false, k, { cl, hd }));
        flushCrowd();
        const ar = smooth(seg(p, .4, .412));
        items.push([VZ(...PNM), () => { shadow(...PNM, 1.8, .6, .3); holy(...PNM, { pose: 'stand', flip: VX(PNM[0] - 10, PNM[1]) < VX(...PNM), glow: .16, arms: ar > 0 ? [[.16 + .14 * ar, -.66 - .12 * ar]] : undefined }); }]);
        draw();
      } else { // the standing place and the plain
        const mv = smooth(seg(p, .468, .48)), [qx, qz] = [mix(MQ[0], MQ2[0], mv), mix(MQ[1], MQ2[1], mv)], fol = smooth(seg(p, .48, .492)), spread = smooth(seg(p, .502, .518)), hush = 1 - smooth(seg(p, .536, .548));
        const wo = smooth(seg(p, .622, .64)), walkOut = wo * 60, walking = wo > 0 && wo < 1; // the move west after the sun has gone
        const pqx = qx - walkOut * .5;
        st.fA.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x - walkOut * (.4 + .6 * k), z, walking && kind < 3 ? -1 : dir, x * 2.4 + p * 900, walking, k, { cl, hd, empty: true, lean: .02 * Math.sin(t * .5 + k * 20) * hush }));
        st.midA.forEach(([x, z, kind, dir, cl, hd, k]) => { const dx = x - qx, dz = z - qz, rr = Math.hypot(dx, dz), sp = 1 + spread * 1.6 * c01(1 - rr / 70); crowd(walking ? 0 : kind, qx + dx * sp - walkOut * (.5 + .5 * k), qz + dz * sp, walking ? -1 : dir, p * 1300 + k * 9, (spread > 0 && spread < 1) || walking, k, { cl, hd, lean: .025 * Math.sin(t * .6 + k * 9) * hush }); });
        // the near ring about his camel: they press to its feet; he moves it, they follow; then they spread out
        st.press.forEach(([a, rr, cl, hd, k], i) => { const r1 = mix(rr, rr * 3.2 + 9 + 14 * k, spread), cxp = mix(MQ[0], MQ2[0], fol), czp = mix(MQ[1], MQ2[1], fol), x = cxp + Math.sin(a) * r1 - walkOut * (.5 + .4 * k), z = czp + Math.cos(a) * r1 * .8, mvP = (fol > 0 && fol < 1) || (spread > 0 && spread < 1) || walking; crowd(0, x, z, walking ? -1 : VX(cxp, czp) > VX(x, z) ? 1 : -1, p * 1500 + i, mvP, k, { cl, hd, lean: mvP ? .05 : .04 }); });
        flushCrowd();
        const sl = smooth(seg(p, .498, .506)) * (1 - smooth(seg(p, .514, .52))), dirP = wo > 0 ? (VX(pqx - 4, qz) > VX(pqx, qz) ? 1 : -1) : VX(qx + 4, qz - 2) > VX(qx, qz) ? 1 : -1;
        items.push([VZ(pqx, qz), () => { shadow(pqx, qz, 2.2, 1.4, .28); camelNear(pqx, qz, dirP, { mv: (mv > 0 && mv < 1) || walking ? 1 : 0, ph: p * 900, rider: 'holy', who: 'prophet', saddle: [128, 52, 40], glow: .16 + .14 * bump(p, .49, .496, .51, .516) + .25 * bump(p, .548, .556, .58, .59), arms: sl > .02 ? [[.18 + .3 * sl, -1.34 - .1 * sl]] : undefined }); }]);
        draw();
        // at the words a light goes out from him over all the plain (metaphoric)
        const lw = seg(p, .552, .59);
        if (lw > 0 && lw < 1) { ring(qx, qz, 6 + 900 * ease.out(lw), .55 * (1 - lw), .5, [255, 224, 160], 2.4); ring(qx, qz, 4 + 500 * ease.out(lw), .4 * (1 - lw), .5, [255, 232, 186], 1.6); }
      }
    } else {
      // ================= Mina =================
      const dep = p >= .94, khayf = p >= .885 && !dep;
      st.tN.forEach((q) => tent(...q)); flushTents();
      if (!dep) st.fN.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true, lean: .02 * Math.sin(t * .5 + k * 20) }));
      else st.fN.forEach(([x, z, kind, dir, cl, hd, k], i) => { if (i % 3 || (x > -150 && x < -20 && Math.abs(z - zc(x) + 8) < 14)) return; crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true }); });
      if (!khayf && !dep) st.arcN.forEach(([x, z, dir, cl, hd, k]) => crowd(0, x, z, dir, 0, false, k, { cl, hd, lean: .03 * Math.sin(t * .6 + k * 9) }));
      if (khayf) {
        st.khayf.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, 0, false, k, { cl, hd }));
        // the yard's low walls (invented), a gap on the south side
        const [kx, kz] = KH, wl = [210, 186, 150];
        slab(kx - 22, kx + 22, kz + 15, kz + 15.6, 1.1, wl, hN(kx, kz + 15) - .1, 2); slab(kx - 22.6, kx - 22, kz - 15, kz + 15.6, 1.1, wl, hN(kx - 22, kz) - .1, 2); slab(kx + 22, kx + 22.6, kz - 15, kz + 15.6, 1.1, wl, hN(kx + 22, kz) - .1, 2);
        slab(kx - 22.6, kx - 4, kz - 15.6, kz - 15, 1.1, wl, hN(kx - 12, kz - 15) - .1, 2); slab(kx + 4, kx + 22.6, kz - 15.6, kz - 15, 1.1, wl, hN(kx + 12, kz - 15) - .1, 2);
      }
      if (dep) { // the caravan west down the valley at dusk
        const x0 = pxDep(p);
        st.dep.forEach(([d, lane, kind, cl, hd, k]) => { const x = x0 - d, z = zc(x) + lane; crowd(kind, x, z, VX(x - 3, z) > VX(x, z) ? 1 : -1, x * 2.2 + k * 9, true, k, { cl, hd }); });
      }
      flushCrowd();
      if (!khayf && !dep) {
        st.rocksN.forEach(([x, z, r], i) => items.push([VZ(x, z) + .3, () => { const vz = VZ(x, z); if (vz < 1.5) return; const [X, Y] = P3(x, hN(x, z) - .1, z), s = F / vz, w = r * s, hh = r * (.7 + .4 * hash(i, 5)) * s;
          const pts = [[-1, 0], [-.95, -.45], [-.55, -.9], [-.05, -1], [.5, -.82], [.92, -.4], [1, 0]].map(([u, v], j) => [X + u * w * (1 + .15 * (hash(i, j) - .5)), Y + v * hh * (1 + .2 * (hash(j, i) - .5))]);
          c.fillStyle = rgb(fogd(lit([88, 74, 70], .14 * day + .06), vz, .8)); c.beginPath(); pts.forEach(([u, v], j) => (j ? c.lineTo(u, v) : c.moveTo(u, v))); c.closePath(); c.fill();
          const L = litSide > 0 ? [3, 4, 5, 6] : [0, 1, 2, 3]; c.fillStyle = rgb(fogd(lit([132, 112, 100], .9 * day + .12), vz, .8)); c.beginPath(); c.moveTo(X, Y - hh * .35); L.forEach((j) => c.lineTo(pts[j][0], pts[j][1])); c.closePath(); c.fill(); }]));
        const toCrowd = VX(KN[0], KN[1] - 20) > VX(...KN) ? 1 : -1, g2 = bump(p, .854, .862, .874, .882);
        items.push([VZ(...KN), () => { shadow(...KN, 1.8, .6, .3); const hd = holy(...KN, { pose: 'stand', flip: toCrowd < 0, glow: .16 + .3 * bump(p, .756, .762, .772, .778) + .18 * g2 }); if (hd) st.hdN = hd; }]);
        items.push([VZ(...AL), () => { shadow(...AL, 1.8, .6, .3); holy(...AL, { who: 'ali', pose: 'stand', flip: toCrowd < 0, glow: .1 + .18 * g2, sword: true }); }]);
      }
      if (khayf) { const P0 = [KH[0], KH[1] + 9.5]; items.push([VZ(...P0), () => { shadow(...P0, 1.8, .6, .3); holy(...P0, { pose: 'stand', flip: VX(P0[0], P0[1] - 10) < VX(...P0), glow: .16 }); }]); }
      if (dep) {
        const x0 = pxDep(p), z0 = zc(x0), dirW = VX(x0 - 3, z0) > VX(x0, z0) ? 1 : -1, ax = x0 + 1.5, az = z0 + 3.6;
        items.push([VZ(x0, z0), () => { shadow(x0, z0, 2.2, 1.4, .28); camelNear(x0, z0, dirW, { mv: 1, ph: x0 * 2.2, rider: 'holy', who: 'prophet', saddle: [128, 52, 40], glow: .14 + .3 * night }); }]);
        items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.2, .28); horseRide(ax, az, dirW, p * 500, true, 'ali', { glow: .1 + .25 * night }); }]);
      }
      draw();
      // fires in the tents as the dusk deepens
      const fl = dep ? fade(p, .975, 1.02) : 0;
      if (fl > 0) st.firesN.forEach(([x, z, k]) => { const vz = VZ(x, z); if (vz < 3) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -30 || X > W + 30) return; const s = F / vz, Y = hy - (hN(x, z) + .3 - camY) * F / vz, f = .8 + .2 * Math.sin(t * 9 + k * 30) * Math.sin(t * 5.3 + k * 11); glow(X, Y, Math.max(4, 6 * s) * f, [255, 150, 70], .4 * fl); glow(X, Y, Math.max(1.4, .9 * s) * f, [255, 228, 170], .9 * fl); });
      if (night > 0) { const g = c.createLinearGradient(0, hy + H * .04, 0, H); g.addColorStop(0, 'rgba(14,16,46,0)'); g.addColorStop(1, `rgba(8,16,44,${.4 * night})`); c.fillStyle = g; c.fillRect(0, hy, W, H - hy); }
      // the answers: a ring of light runs through the crowd at each «قالوا»; at «نعم» a brighter wave (metaphoric)
      [[.705, .03], [.714, .03], [.723, .03], [.753, .03]].forEach(([t0, du], i) => { const u = seg(p, t0, t0 + du); if (u <= 0 || u >= 1) return; ring(KN[0], KN[1], 8 + 420 * ease.out(u), (i === 3 ? .7 : .5) * (1 - u), .4, [255, 222, 160], i === 3 ? 3 : 2); });
      // «اللهمّ اشهد»: a column of light rises from him into the sky (metaphoric)
      const col = bump(p, .757, .764, .776, .781);
      if (col > 0 && st.hdN && !khayf && !dep) { const hd = st.hdN, s = hd.h / 1.8, u = ease.out(seg(p, .757, .772)), top = mix(hd.Y - hd.h, -H * .1, u);
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, top, 0, hd.y); g.addColorStop(0, 'rgba(255,240,206,0)'); g.addColorStop(.25, `rgba(255,236,196,${.22 * col})`); g.addColorStop(1, `rgba(255,232,186,${.32 * col})`); c.fillStyle = g; c.beginPath(); c.moveTo(hd.x - .5 * s, hd.y); c.lineTo(hd.x - (.5 + 1.4 * u) * s, top); c.lineTo(hd.x + (.5 + 1.4 * u) * s, top); c.lineTo(hd.x + .5 * s, hd.y); c.closePath(); c.fill(); c.restore();
        glow(hd.x, hd.y, 4 * s, [255, 232, 180], .3 * col); }
    }
    grade(c, W, H, phone, night, dipK);

    // ----- the light along the column: a soft gold thread at head height running along the road (metaphoric: the talbiya) -----
    function talbiya(d0, d1, y, a) {
      if (a <= 0) return; const pts = []; for (let i = 0; i <= 120; i++) { const d = mix(d0, d1, i / 120), [x, , z] = offR(d, 0); if (VZ(x, z) < 2) continue; pts.push(P3(x, hW(x, z) + y + .4 * Math.sin(d * .02 + p * 300), z)); }
      if (pts.length < 2) return; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
      const tr = () => { c.beginPath(); pts.forEach(([X, Y], i) => (i ? c.lineTo(X, Y) : c.moveTo(X, Y))); };
      c.strokeStyle = `rgba(255,220,160,${.14 * a})`; c.lineWidth = 12; tr(); c.stroke(); c.globalCompositeOperation = 'source-over'; c.strokeStyle = `rgba(250,206,120,${.5 * a})`; c.lineWidth = 2.6; tr(); c.stroke(); c.strokeStyle = `rgba(255,246,222,${.7 * a})`; c.lineWidth = 1.1; tr(); c.stroke(); c.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 7; j++) { const u = (j / 7 + p * 9) % 1, q = pts[Math.min(pts.length - 1, Math.floor(u * pts.length))]; glow(q[0], q[1], 10 + 6 * (1 - q[2] / 600), [255, 226, 170], .35 * a); } // pulses running along it
      c.restore();
    }
    // ----- the Kaaba: dark cloth over the walls, the door high on the NE face, the spout on the NW (as baraa) -----
    function kaaba() {
      const { hu, hv, h, door } = KA, cnr = [kw(hu, hv), kw(hu, -hv), kw(-hu, -hv), kw(-hu, hv)];
      const faces = [[0, 1, UN, 'NE'], [1, 2, [-VN[0], -VN[1]], 'SE'], [2, 3, [-UN[0], -UN[1]], 'SW'], [3, 0, VN, 'NW']];
      const vz0 = Math.max(1, VZ(0, 0));
      faces.forEach(([i0, i1, n, nm]) => {
        const [x0, z0] = cnr[i0], [x1, z1] = cnr[i1];
        if ((cx - (x0 + x1) / 2) * n[0] + (cz - (z0 + z1) / 2) * n[1] <= 0) return;
        items.push([VZ((x0 + x1) / 2, (z0 + z1) / 2), () => {
          const lam = Math.max(0, n[0] * sun[0] + n[1] * sun[2]) * day, col = fogd(lit([36, 32, 30], lam * 1.1 + .12, .9), vz0, .7);
          quad([[x0, 0, z0], [x1, 0, z1], [x1, h, z1], [x0, h, z0]], rgb(col));
          for (let j = 0; j < 14; j++) { const u0 = j / 14, u1 = (j + 1) / 14, k = hash(j, i0) - .5; quad([[mix(x0, x1, u0), .5, mix(z0, z1, u0)], [mix(x0, x1, u1), .5, mix(z0, z1, u1)], [mix(x0, x1, u1), h, mix(z0, z1, u1)], [mix(x0, x1, u0), h, mix(z0, z1, u0)]], rgb(k > 0 ? [255, 240, 220] : [0, 0, 0], Math.abs(k) * .08)); }
          c.strokeStyle = rgb(lerp(col, [0, 0, 0], .4), .55); c.lineWidth = 1; c.beginPath();
          for (let j = 1; j < 14; j++) { const u = j / 14, A = P3(mix(x0, x1, u), .5, mix(z0, z1, u)), B = P3(mix(x0, x1, u), h, mix(z0, z1, u)); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
          c.stroke();
          const T = P3(x0, h, z0), T2 = P3(x1, h, z1), B0 = P3(x0, h * .55, z0), B1 = P3(x1, h * .55, z1), g = c.createLinearGradient(0, T[1], 0, B0[1]); g.addColorStop(0, rgb(lerp(col, sunC, .25), .35 * (lam + .1))); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(T[0], T[1]); c.lineTo(T2[0], T2[1]); c.lineTo(B1[0], B1[1]); c.lineTo(B0[0], B0[1]); c.closePath(); c.fill();
          const F0 = P3(x0, 0, z0), F1 = P3(x1, 0, z1), H0 = P3(x0, .5, z0), H1 = P3(x1, .5, z1); c.fillStyle = rgb(fogd(lit([150, 140, 126], lam + .14), vz0, .7)); c.beginPath(); c.moveTo(F0[0], F0[1]); c.lineTo(F1[0], F1[1]); c.lineTo(H1[0], H1[1]); c.lineTo(H0[0], H0[1]); c.closePath(); c.fill();
          if (nm === 'NE') {
            const [d0, d1, y0, y1] = door, P = (v, y) => { const [x, z] = kw(hu + .02, v); return P3(x, y, z); }, a = P(d0, y0), b = P(d1, y0), cc = P(d1, y1), d = P(d0, y1);
            c.fillStyle = rgb(fogd(lit([92, 60, 34], lam * .9 + .1), vz0, .7)); c.beginPath(); [a, b, cc, d].forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
          }
          if (nm === 'NW') { const [x, z] = kw(0, hv + .05), A = P3(x, h - .25, z), [x2, z2] = kw(0, hv + 1.1), B = P3(x2, h - .45, z2); c.strokeStyle = rgb(fogd(lit([70, 54, 40], lam + .1), vz0, .7)); c.lineWidth = Math.max(1.2, .25 * F / vz0); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); }
        }]);
      });
      if (camY > h) items.push([VZ(0, 0) - .01, () => quad(cnr.map(([x, z]) => [x, h, z]), rgb(fogd(lit([60, 54, 50], Math.max(0, sun[1]) * day + .1), vz0, .7)))]);
    }
  },
};
// ----- grade: the edges close in a little; the cuts -----
function grade(c, W, H, phone, night, dipK = 0) {
  const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
  vg.addColorStop(0, 'rgba(10,12,30,0)'); vg.addColorStop(1, `rgba(10,12,30,${.16 + .2 * night})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (dipK > 0) { c.fillStyle = `rgba(6,8,14,${dipK})`; c.fillRect(0, 0, W, H); }
}
})();
