(() => {
// baraa — «سورة براءة» (I'lam al-Wara 1:248; Tafsir al-Qummi 1:282; al-Irshad 1:65–66; al-Kafi 4:290; Manaqib 1:391).
// Four worlds in metres under one pinhole camera keyed on p (x east, y up, z north; the camera turns about y): Medina and
// the plain south-west of it, the wadi of al-Rawha', the valley of Mina, and the Kaaba in its court at Mecca.
//   p −.05 → .085  Medina, morning: he sits in the yard of the mosque with a few men; light comes down on him (I'lam: the
//                   verses come down; al-Tawba 1–2)
//      .085 → .17  the edge of the groves: he stands by the road; the caravan goes out south-west, a man on a camel
//                   among its first riders (Qummi 1:282: he gave him the verses for Mina on the Day of Sacrifice)
//      .17 → .25   the yard, afternoon: he stands; a light comes down on him (Irshad 1:65: Jibril's word; no figure)
//      .25 → .33   by Ali's house, late afternoon: he and Ali face each other; al-'Adba' couched beside; his sleeve to her
//      .33 → .41   Ali rides al-'Adba' fast across the plain toward the sunset (Irshad 1:65)
//      .41 → .50   al-Rawha', morning: the caravan halted in the wadi; Ali rides in, the camel kneels, he steps down; the
//                   man comes to meet him; the verses pass to Ali's sleeve; the man rides back north (Qummi; Irshad)
//      .50 → .60   the yard at noon: he sits in the shade of the roof; the man stands before him; light at his words
//      .60 → .67   Mina at dawn on the Day of Sacrifice: the valley filled with people, tents and couched camels
//      .67 → .80   Ali stands on a rise above the crowd (al-Tawba 3; al-Kafi 4:290; Qummi: «الأذان أمير المؤمنين»)
//      .80 → .89   the sword drawn and held up; four lines of light go out over the valley, one with each of his words
//                   (Manaqib 1:391)
//      .89 → 1.05  Mecca: the Kaaba in its open court, the people going round it clothed; Ali at the court's edge (I'lam)
// The Prophet and Ali are drawn only by Holy.draw (on the camel: Holy's riding figure clipped to the rider, over a camel
// painted here); everyone else is a faceless shape with an earth-toned or dark head cloth. Everything follows from p;
// t moves only cloth, flicker and light.
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

// ---------- outlines (u across, v up, metres; facing +u): the same 16 points in the same order, so poses blend ----------
const SH = {
  stand: [-.3, 0, -.22, .4, -.18, .85, -.19, 1.1, -.18, 1.33, -.1, 1.46, -.07, 1.6, .05, 1.72, .15, 1.62, .12, 1.49, .17, 1.37, .19, 1.05, .16, .7, .17, .32, .22, 0, 0, .02],
  sit: [-.34, 0, -.33, .24, -.25, .5, -.21, .72, -.19, .86, -.11, .96, -.07, 1.06, .04, 1.16, .13, 1.07, .11, .96, .15, .86, .18, .62, .26, .36, .42, .2, .46, 0, 0, .02],
  bend: [-.3, 0, -.24, .4, -.2, .82, -.16, 1.06, -.1, 1.26, .0, 1.38, .06, 1.48, .2, 1.56, .28, 1.45, .22, 1.34, .24, 1.2, .22, .98, .16, .68, .17, .32, .22, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], sit: [.04, 1.06], bend: [.18, 1.44] };
const SHO = { stand: [.01, 1.36], sit: [0, .84], bend: [.1, 1.22] };
// batched crowd shapes: side man, far man, sitting man, a camel walking, a camel couched on the ground
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MANS = [-.3, 0, -.24, .9, -.22, 1.3, -.13, 1.45, .13, 1.45, .22, 1.3, .24, .9, .3, 0];
const SITS = [-.4, 0, -.34, .4, -.2, .78, .16, .78, .3, .5, .44, .14, .46, 0];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
const CAMELK = [-1.05, 0, -1.08, .42, -.8, .86, -.3, 1.18, .15, 1.06, .42, .78, .7, .74, .92, .9, 1.1, 1.3, 1.22, 1.52, 1.42, 1.54, 1.48, 1.44, 1.3, 1.34, 1.12, .8, .95, .42, .9, 0];
const poly = (pa, sh, bx, by, s, dir, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const X = bx + (sh[i] + lean * sh[i + 1]) * dir * s, Y = by - sh[i + 1] * s; i ? pa.lineTo(X, Y) : pa.moveTo(X, Y); } pa.closePath(); };
// the near camel, side on, facing +u: a dromedary's line, one hump; CAMBK the same points couched, the neck up
const CAMB = [[-1.28, 1.6], [-1.22, 1.86], [-.86, 2.02], [-.42, 2.3], [-.08, 2.42], [.3, 2.26], [.62, 1.98], [.86, 1.86], [1.2, 1.62], [1.5, 1.74], [1.72, 2.04], [1.84, 2.25], [2.06, 2.29], [2.3, 2.14], [2.33, 2.0], [2.12, 1.97], [1.88, 1.9], [1.62, 1.55], [1.32, 1.3], [.98, 1.14], [.74, 1.04], [.2, 1.08], [-.5, 1.1], [-.96, 1.2], [-1.22, 1.36]];
const CAMBK = [[-1.3, .5], [-1.24, .8], [-.88, .98], [-.44, 1.26], [-.1, 1.38], [.28, 1.22], [.6, .96], [.84, .86], [1.04, .9], [1.3, 1.16], [1.46, 1.5], [1.56, 1.74], [1.78, 1.8], [2.02, 1.66], [2.05, 1.52], [1.84, 1.5], [1.62, 1.42], [1.44, 1.06], [1.26, .62], [1.0, .3], [.78, .06], [.2, 0], [-.5, 0], [-1.0, .06], [-1.26, .24]];
const CLEG = [[-.86, 0, 1], [.72, 0, 1], [-.7, .5, 0], [.56, .5, 0]]; // u, gait phase (a pace: one side's legs together), near (1) / far (0)
const SEAT = [-.3, 0, -.32, .28, -.22, .62, -.17, .74, -.16, .86, -.1, .97, .02, 1.0, .11, .93, .12, .82, .08, .74, .2, .64, .26, .4, .36, .2, .38, 0];
// earth tones: cloaks and head cloths (only the veiled figures read white at the head)
const CL = [[96, 72, 54], [72, 62, 54], [116, 84, 58], [66, 64, 72], [104, 86, 64], [88, 60, 48], [80, 76, 60]];
const HD = [[170, 134, 92], [150, 110, 72], [160, 138, 100], [140, 112, 78], [176, 142, 98], [128, 94, 62], [154, 124, 84]];
const HOUSE = [[206, 178, 136], [196, 166, 124], [214, 188, 148], [190, 160, 120]];
const MHOUSE = [[150, 128, 108], [168, 146, 120], [132, 112, 96], [176, 156, 128]]; // Mecca: stone of the valley, darker
const TENT = [[58, 46, 40], [84, 64, 48], [70, 56, 46], [176, 160, 132], [104, 82, 60]]; // goat hair, hide, one pale cloth (invented)
const CARR = [104, 84, 66], CARRH = [150, 118, 82]; // the first carrier: an ordinary cloak and head cloth

// ---------- Medina and the plain south-west of it ----------
const MOS = [-15, 15, -12, 14], WALLH = 1.3, ROOF = [-15, 15, -12, -7.2, 3.1]; // the yard; the shade along its south wall
const HOMEA = [15.6, 22, -8, -1.2, 3], DOORA = 18.8; // Ali's house against the yard's east wall, its door on the south face
const ROAD0 = [[2, -14], [3, -40], [-4, -160], [-40, -380], [-150, -650], [-380, -1000], [-760, -1450], [-1250, -2000], [-1850, -2700], [-2500, -3500], [-3200, -4500], [-4000, -5800], [-4900, -7500]];
const ROAD = (() => { // Catmull-Rom through the points; z falls along it, so x is a function of z; d is the distance along
  const out = [], n = ROAD0.length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < 16; k++) {
    const u = k / 16, a = ROAD0[Math.max(0, i - 1)], b = ROAD0[i], c2 = ROAD0[i + 1], d = ROAD0[Math.min(n - 1, i + 2)];
    out.push([0, 1].map((j) => .5 * (2 * b[j] + (-a[j] + c2[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c2[j] - d[j]) * u * u + (-a[j] + 3 * b[j] - 3 * c2[j] + d[j]) * u * u * u)));
  }
  out.push(ROAD0[n - 1]); let D = 0; out.forEach((q, i) => { if (i) D += Math.hypot(q[0] - out[i - 1][0], q[1] - out[i - 1][1]); q.push(D); }); return out;
})();
const roadX = (z) => { let lo = 0, hi = ROAD.length - 1; if (z >= ROAD[0][1]) return ROAD[0][0]; if (z <= ROAD[hi][1]) return ROAD[hi][0]; while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][1] > z ? lo = m : hi = m; } return mix(ROAD[lo][0], ROAD[hi][0], (z - ROAD[lo][1]) / (ROAD[hi][1] - ROAD[lo][1])); };
const roadAt = (d) => { let lo = 0, hi = ROAD.length - 1; d = Math.max(0, Math.min(ROAD[hi][2], d)); while (hi - lo > 1) { const m = (lo + hi) >> 1; ROAD[m][2] < d ? lo = m : hi = m; } const k = (d - ROAD[lo][2]) / Math.max(1e-6, ROAD[hi][2] - ROAD[lo][2]); return [mix(ROAD[lo][0], ROAD[hi][0], k), mix(ROAD[lo][1], ROAD[hi][1], k), Math.atan2(ROAD[hi][0] - ROAD[lo][0], ROAD[hi][1] - ROAD[lo][1])]; };
const offR = (d, side, up = 0) => { const [x, z, a] = roadAt(d); return [x + Math.cos(a) * side, up, z - Math.sin(a) * side]; }; // a point beside the road: side > 0 to the right of the way
function hM(x, z) {
  let h = .06 * Math.sin(x * .7 + z * .4) * Math.sin(z * .6 - x * .3) + 1.4 * Math.sin(x * .004 + z * .003) * Math.sin(z * .0021 - .5) * c01((-z - 300) / 300);
  h += smooth(c01((x - 700) / 500)) * (6 + 26 * crag(x * .02, z * .02)) + smooth(c01((-1800 - x + z * .2) / 600)) * (5 + 22 * crag(x * .018 + 3, z * .018)); // the harra east and west
  h += 380 * Math.exp(-((x + 300) ** 2) / (2 * 1300 ** 2) - ((z - 4700) ** 2) / (2 * 480 ** 2)) * (.6 + .6 * crag(x * .003 + 2, z * .003)); // Uhud, north
  h += 300 * Math.exp(-((x + 900) ** 2) / (2 * 1500 ** 2) - ((z + 7600) ** 2) / (2 * 700 ** 2)) * (.6 + .6 * crag(x * .003 + 7, z * .003)); // 'Ayr, south
  h += smooth(c01((-z - 2600) / 2600)) * (60 + 170 * crag(x * .002, z * .002)) * c01((Math.abs(x - roadX(z)) - 260) / 700); // the hills the road runs among
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
  a = lerp(a, [222, 204, 166], Math.exp(-((x - roadX(z)) ** 2) / 14) * c01((-z - 30) / 20) * .75);
  return lerp(a, lerp([176, 128, 96], FARC, .6), smooth(c01((Math.hypot(x + 600, z + 1500) - 2800) / 4000)));
}
// ---------- the wadi of al-Rawha': a sandy floor winding between dark hills; the road on the floor ----------
const xcR = (z) => 34 * Math.sin(z * .0042) + 12 * Math.sin(z * .011 + 1);
function hR(x, z) {
  const d = Math.abs(x - xcR(z));
  let h = .5 * Math.sin(x * .05 + z * .03) * Math.sin(z * .04 - x * .02) + .05 * Math.sin(x * .8 + z * .5);
  h += smooth(c01((d - 110) / 220)) * (22 + 48 * crag(x * .008 + 4, z * .008)) + smooth(c01((d - 520) / 600)) * (70 + 130 * crag(x * .003, z * .003));
  return h + 1.4 * Math.exp(-((x - xcR(z) - 26) ** 2) / 400) * (.5 + .5 * Math.sin(z * .02)); // a low bank along the floor
}
function groundR(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .09 + Math.sin(z * .07) * 2) * Math.sin(z * .11 - x * .04)), n2 = c01(.5 + .5 * Math.sin(x * .021 - z * .017));
  let a = lerp(lerp([222, 198, 158], [206, 178, 140], n), [234, 222, 196], c01(n2 - .55) * 1.6 * c01(1 - h / 3));
  a = lerp(a, lerp([128, 104, 88], [164, 134, 110], n), c01((h - 3) / 30) * .85 + c01((slope - .3) * 2) * .3);
  a = lerp(a, [214, 196, 160], Math.exp(-((x - xcR(z) * .8) ** 2) / 10) * .6);
  return lerp(a, [150, 146, 170], smooth(c01((Math.hypot(x, z) - 900) / 4000)) * .6);
}
// ---------- the valley of Mina: a sand floor between steep granite walls, running east to west ----------
const KN = [0, 128]; // the rise Ali stands on (invented place in the valley)
function hN(x, z) {
  let h = .6 * Math.sin(x * .021 + z * .013) * Math.sin(z * .017 - x * .006) + 1.8 * Math.sin(x * .0031 + 1) + .05 * Math.sin(x * .7 + z * .4);
  const zn = 360 + 40 * Math.sin(x * .004 + 1) + 20 * Math.sin(x * .013), zs = -380 + 40 * Math.sin(x * .0045 + 3);
  h += smooth(c01((z - zn) / 260)) * (80 + 120 * crag(x * .004, z * .004)) + smooth(c01((zs - z) / 260)) * (90 + 130 * crag(x * .004 + 5, z * .004));
  h += 3.2 * Math.exp(-((x - KN[0]) ** 2 + (z - KN[1]) ** 2) / (2 * 6.5 ** 2)) + 1.6 * Math.exp(-((x - KN[0] - 4) ** 2 + (z - KN[1] - 9) ** 2) / (2 * 10 ** 2));
  return h + smooth(c01((-x - 1500) / 900)) * (70 + 120 * crag(x * .004, z * .004)) + smooth(c01((x - 1600) / 900)) * (50 + 100 * crag(x * .004 + 2, z * .004));
}
function groundN(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .021 + Math.sin(z * .017) * 2.4) * Math.sin(z * .019 - x * .007)), n2 = c01(.5 + .5 * Math.sin(x * .09 + z * .05) * Math.sin(z * .11 - x * .03));
  let a = lerp(lerp([212, 184, 146], [224, 200, 162], n), [196, 166, 128], n2 * .5);
  const rock = c01((h - 6) / 30) * .8 + c01((slope - .3) * 2.2) * .5 + c01(1 - Math.hypot(x - KN[0], z - KN[1]) / 9) * .7;
  a = lerp(a, lerp([110, 92, 84], [158, 130, 110], .5 + .5 * Math.sin(h * .3 + n * 3)), c01(rock));
  return lerp(a, [150, 140, 170], smooth(c01((Math.hypot(x, z) - 1200) / 4000)) * .55);
}
// ---------- Mecca: the court of the House, the low houses round it, the mountains over the valley ----------
const KA = { hu: 5.6, hv: 6.2, h: 13, door: [-3.6, -1.7, 2.2, 5.2] }; // half-sizes along the NE normal (u) and the NW normal (v), as dar.js; the door on the NE face near the east corner
const UN = [Math.SQRT1_2, Math.SQRT1_2], VN = [-Math.SQRT1_2, Math.SQRT1_2]; // the NE and NW face normals in (x, z)
const kw = (u, v) => [u * UN[0] + v * VN[0], u * UN[1] + v * VN[1]]; // the Kaaba's frame to the world
const HIJR = Array.from({ length: 19 }, (_, i) => { const a = mix(.32, Math.PI - .32, i / 18); return kw(5.8 * Math.cos(a), KA.hv + 8.2 * Math.sin(a)); });
function hK(x, z) {
  const r = Math.hypot(x, z);
  let h = smooth(c01((r - 34) / 120)) * (2 + .012 * (r - 34)) + .04 * Math.sin(x * .6 + z * .5);
  const mf = smooth(c01((r - 70) / 170)); // the mountains leave the valley floor and the court level
  h += mf * 230 * Math.exp(-((x - 290) ** 2) / (2 * 100 ** 2) - ((z + 30) ** 2) / (2 * 220 ** 2)) * (.7 + .5 * crag(x * .008, z * .008)); // Abu Qubays, east
  h += mf * 210 * Math.exp(-((x + 330) ** 2 + (z - 300) ** 2) / (2 * 160 ** 2)) * (.7 + .5 * crag(x * .008 + 3, z * .008)); // Qu'ayqi'an, north-west
  h += smooth(c01((r - 300) / 380)) * (120 + 190 * crag(x * .004 + 1, z * .004)) * (1 - .75 * Math.exp(-((Math.atan2(x, z) + 2.6) ** 2) / .08)); // the ring of mountains, a gap down the valley south-west
  return h;
}
function groundK(x, z, h, slope) {
  const r = Math.hypot(x, z), n = c01(.5 + .5 * Math.sin(x * .3 + Math.sin(z * .25) * 2) * Math.sin(z * .37 - x * .11));
  let a = lerp([206, 186, 154], [186, 164, 134], n);
  a = lerp(a, [218, 204, 178], c01((32 - r) / 8) * .6); // the court: sand and fine gravel
  a = lerp(a, lerp([92, 76, 70], [128, 104, 90], n), c01((h - 8) / 40) * .9 + c01((slope - .35) * 2) * .5);
  return lerp(a, [150, 140, 168], smooth(c01((r - 900) / 4000)) * .55);
}

// light: sky top, sky mid, horizon, sun, ambient, haze, elevation (deg), azimuth (rad from north toward east), fog distance
const DAYM = [[66, 122, 200], [174, 202, 230], [242, 236, 220], [255, 248, 230], [160, 166, 178], [238, 232, 218]];
const LQ = [
  [-.06, [70, 124, 198], [178, 202, 228], [244, 232, 212], [255, 242, 220], [158, 164, 178], [236, 228, 214], 26, 1.8, 4200],
  [.17, ...DAYM, 38, 2.1, 4400],
  [.171, [66, 120, 198], [172, 198, 228], [244, 234, 214], [255, 244, 222], [158, 162, 176], [238, 230, 214], 42, -2.3, 4400],
  [.25, [64, 114, 192], [170, 192, 222], [246, 226, 200], [255, 236, 206], [154, 156, 168], [236, 224, 206], 36, -2.15, 4400],
  [.251, [62, 108, 186], [168, 186, 216], [246, 220, 188], [255, 228, 190], [152, 150, 162], [236, 216, 196], 22, -1.85, 4400],
  [.33, [58, 100, 178], [168, 178, 206], [248, 210, 170], [255, 214, 160], [148, 144, 154], [234, 208, 182], 15, -1.95, 4400],
  [.335, [50, 84, 158], [172, 162, 188], [250, 192, 140], [255, 196, 126], [144, 130, 140], [232, 192, 160], 9, -2.05, 4200],
  [.409, [44, 66, 132], [140, 126, 166], [246, 174, 122], [255, 180, 110], [136, 122, 138], [206, 160, 144], 3, -2.1, 3600],
  [.41, [92, 132, 196], [196, 206, 222], [250, 222, 186], [255, 226, 180], [150, 150, 164], [234, 220, 200], 10, 1.95, 4200],
  [.5, [76, 124, 198], [180, 202, 226], [246, 230, 206], [255, 238, 210], [156, 160, 172], [236, 226, 210], 20, 2.05, 4400],
  [.501, ...DAYM, 70, 3.0, 4600],
  [.6, ...DAYM, 72, 3.1, 4600],
  [.601, [58, 76, 136], [186, 160, 176], [252, 200, 156], [255, 206, 146], [150, 136, 146], [230, 204, 184], 5, 1.62, 1900],
  [.67, [76, 110, 180], [196, 190, 204], [250, 214, 176], [255, 220, 170], [150, 146, 158], [232, 214, 194], 10, 1.66, 2100],
  [.671, [74, 120, 196], [184, 202, 224], [248, 226, 198], [255, 232, 200], [156, 158, 170], [236, 224, 206], 16, 1.72, 2300],
  [.89, [68, 120, 200], [178, 204, 230], [244, 232, 212], [255, 242, 218], [160, 164, 176], [238, 230, 216], 27, 1.8, 2500],
  [.891, [66, 120, 200], [176, 202, 230], [242, 234, 216], [255, 244, 222], [160, 164, 178], [236, 230, 218], 30, 1.95, 3000],
  [1.06, [64, 118, 198], [174, 200, 228], [242, 232, 214], [255, 242, 220], [158, 162, 176], [236, 228, 214], 36, 2.1, 3000]];
// cameras: [p, x, height above the ground under it, z, horizon (fraction of the height)]; subject [p, x, y, z]
const C1A = offR(206, 9.8, 2.2), C1B = offR(213, 9, 2.1), S1A = offR(420, -1, 2), S1B = offR(560, -2, 2.4), PR1 = offR(225, 5); // the Prophet by the road
const CMM = [[-.06, 4.4, 1.45, 5.6, .56], [.085, 3.6, 1.5, 4.2, .56],
  [.086, C1A[0], C1A[1], C1A[2], .52], [.17, C1B[0], C1B[1], C1B[2], .53],
  [.171, -9.5, 1.6, 10.5, .55], [.25, -8.2, 1.58, 9, .55],
  [.251, 16.4, 1.62, -26.8, .55], [.33, 16.9, 1.62, -25.2, .55],
  [.5, 3.9, 1.45, -3.2, .55], [.501, 3.9, 1.45, -3.2, .55], [.6, 3.6, 1.42, -4.3, .55]];
const SMM = [[-.06, 0, .95, -4.6], [.085, 0, 1, -4.6],
  [.086, S1A[0], 2, S1A[2]], [.17, S1B[0], 2.4, S1B[2]],
  [.171, -2, 1.4, 2], [.25, -2, 1.42, 2],
  [.251, 17.6, 1.25, -16.2], [.33, 17.8, 1.22, -16.2],
  [.5, 2.6, 1.0, -9.4], [.501, 2.6, 1.0, -9.4], [.6, 2.6, 1.0, -9.4]];
const CMR = [[.437, -7.2, 1.7, -2.4], [.47, -6.6, 1.65, .4], [.5, -9.5, 2.0, -3]].map((k) => [...k, .55]);
const SMR = [[.437, .2, 1.4, 2.6], [.47, .9, 1.3, .6], [.5, 1, 1.5, 12]];
const CMN = [[.6, -330, 10, -40, .52], [.67, -280, 8, -20, .53], [.671, 7, 1.75, 113, .56], [.74, 5.5, 1.75, 115, .56], [.741, 3.2, 2, 118.5, .56], [.8, 2.6, 2, 119.5, .56], [.801, -9, 2.4, 108, .54], [.89, -7.6, 2.6, 110, .54]];
const SMN = [[.6, 200, 6, 30], [.67, 200, 6, 50], [.671, 0, 5, 128], [.74, 0, 5.2, 128], [.741, 0, 5.6, 128], [.8, 0, 5.6, 128], [.801, 0, 6.5, 128], [.89, 0, 6.6, 128]];
const CMK = [[.89, 14, 10, 44, .5], [1.06, 11, 2.4, 33, .54]], SMK = [[.89, 0, 6, 0], [1.06, -.5, 6.5, 0]], ALK = [13, 23], ALKP = [9, 25]; // Ali at the court's edge (phones: nearer the line of sight)
const CUTS = [[.079, .083, .088, .092], [.163, .167, .174, .178], [.244, .248, .254, .258], [.325, .329, .336, .34], [.403, .407, .413, .417], [.494, .498, .503, .507], [.594, .598, .603, .607], [.664, .668, .673, .677], [.734, .738, .743, .747], [.795, .799, .803, .807], [.884, .888, .893, .897]];
const RIDE = [.335, .409]; // Ali on al-'Adba' from the edge of Medina into the plain
const dAli = (p) => mix(150, 2500, seg(p, ...RIDE));
// al-Rawha': where things stand (x, z); the road runs along the wadi floor, Mecca toward −z
const RA = [.6, 2.2], RM0 = [2.4, -5.2], RM1 = [.9, -1.4], RCM = [3.8, -7.6], RAC = [-.4, 4.6]; // Ali, the man, the man's camel, al-'Adba' couched
const aliRideR = (p) => [mix(xcR(260) * .8, RAC[0], seg(p, .41, .437)), mix(260, RAC[1], ease.out(seg(p, .41, .437)))];
// Mina: the crowd is thinner far off; near the rise it stands in an arc facing him
const AP = [KN[0], KN[1]];

S.baraa = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(6091);
    // ----- Medina: houses and palms, kept off the yard, Ali's house, the ground before it and the road -----
    const keep = [[MOS[0] - 4, MOS[1] + 4, MOS[2] - 5, MOS[3] + 4], [HOMEA[0] - 1, HOMEA[1] + 1, HOMEA[2] - 1, HOMEA[3] + 1], [8, 34, -34, -6]];
    const clear = (x, z, m = 0) => !keep.some(([a, b, c0, d]) => x > a - m && x < b + m && z > c0 - m && z < d + m) && (z > -12 || Math.abs(x - roadX(z)) > 9 + m);
    st.houses = [[...HOMEA, HOUSE[0], 1, DOORA], [24, 30, -6, 0, 3.2, HOUSE[2], 0, 27], [32, 39, -7, -.5, 2.9, HOUSE[1], 0, 35], [36, 42, -24, -18, 3, HOUSE[3], 0, 39], [40, 46, -36, -29, 3.1, HOUSE[1], 0, 43], [-22, -16, -24, -18, 3.3, HOUSE[0], 0, -19], [-30, -24, -20, -14, 2.8, HOUSE[2], 0, -27]];
    for (let i = 0; i < 900 && st.houses.length < 46; i++) {
      const w = 4 + R() * 5, d = 4 + R() * 5, x = -110 + R() * 240, z = -90 + R() * 170, h = 2.7 + R() * 1.6;
      if (!clear(x, z, 4)) continue;
      if (st.houses.some((H) => x - w / 2 < H[1] + 2 && x + w / 2 > H[0] - 2 && z - d / 2 < H[3] + 2 && z + d / 2 > H[2] - 2)) continue;
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, HOUSE[(R() * 4) | 0], 0, mix(x - w / 2, x + w / 2, .3 + .4 * R())]);
    }
    const free = (x, z) => clear(x, z, 1) && !st.houses.some((H) => x > H[0] - 1.2 && x < H[1] + 1.2 && z > H[2] - 1.2 && z < H[3] + 1.2) && Math.hypot(x - PR1[0], z - PR1[2]) > 9;
    st.palms = [];
    for (let i = 0; i < 4000 && st.palms.length < 170; i++) { const x = -140 + R() * 280, z = -110 + R() * 260; if (free(x, z)) st.palms.push([x, z, 6 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 1100; i++) { const x = -470 + R() * 940, z = -440 + R() ** .9 * 780; if (Math.hypot(x / 470, (z + 40) / 420) < 1 && free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    st.acacia = []; for (let i = 0; i < 2400 && st.acacia.length < 520; i++) { const d = 380 + R() * 6200, [rx, rz] = roadAt(d), x = rx + (R() - .5) * (i % 3 ? 3600 : 160), z = rz + (R() - .5) * 300; if (Math.abs(x - roadX(z)) < (d < 2700 ? 26 : 11) || Math.hypot(x / 470, (z + 40) / 420) < 1.05) continue; st.acacia.push([x, z, 2.6 + R() * 2.4, R()]); }
    // the men sitting with him in the yard; the men by him at the road; the men in the shade at noon
    st.yard = [[-2.8, -2.6, 1], [3.0, -2.8, -1], [-4.6, -4.4, 1], [4.7, -4.8, -1], [-3.3, -6.4, 1], [3.4, -6.6, -1]].map(([x, z, d], i) => [x, z, d, CL[(i + 2) % 7], HD[(i * 3 + 1) % 7]]);
    st.shade = [[-1.8, -9.8, 1], [-3.4, -10.2, 1], [6.6, -9.9, -1], [8.2, -10.4, -1], [-5.2, -9.6, 1]].map(([x, z, d], i) => [x, z, d, CL[(i + 4) % 7], HD[(i * 5 + 2) % 7]]);
    st.byRoad = [[-1.6, 2.2], [2.0, 1.2], [1.1, 4.4]].map(([a, b], i) => { const [x, , z] = offR(225 + b, 5 + a); return [x, z, CL[(i + 1) % 7], HD[(i + 3) % 7]]; });
    // the caravan: [distance behind the head (m), lane, kind (0 foot, 3 camel), cloak, head, seed]: knots with gaps; the carrier is one of the first riders
    st.col = []; { let d = 0, i = 0; while (st.col.length < 260) { const n = 4 + (R() * 9 | 0); for (let k = 0; k < n; k++) { const r = R(); st.col.push([d + R() * .8, (R() - .5) * 4.4, r < .42 ? 3 : 0, CL[(i * 3 + k) % 7], HD[(i * 5 + k) % 7], R()]); d += .9 + R() * 1.1; } d += 4 + R() * 9; i++; } }
    st.col[3] = [st.col[3][0], .6, 3, CARR, CARRH, .4, 1]; // the carrier
    // ----- al-Rawha': the caravan halted on the floor of the wadi -----
    st.rTree = []; for (let i = 0; i < 1400 && st.rTree.length < 300; i++) { const z = -900 + R() * 2400, x = xcR(z) + (R() - .5) * 300; if (hR(x, z) > 6 || Math.abs(x - xcR(z) * .8) < 9 || (Math.abs(x) < 26 && z > -220 && z < 30)) continue; st.rTree.push([x, z, 2.4 + R() * 2.6, R()]); }
    st.rHalt = []; for (let i = 0; i < 900 && st.rHalt.length < 150; i++) { const z = -12 - R() ** 1.3 * 220, x = xcR(z) * .8 + (R() - .5) * 46; if (Math.hypot(x - RM0[0], z - RM0[1]) < 6 || Math.hypot(x - RCM[0], z - RCM[1]) < 4) continue; const r = R(); st.rHalt.push([x, z, r < .32 ? 4 : r < .4 ? 3 : r < .7 ? 5 : 0, R() < .5 ? 1 : -1, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R()]); }
    st.rBales = Array.from({ length: 36 }, () => { const z = -14 - R() * 160, x = xcR(z) * .8 + (R() - .5) * 30; return [x, z, .5 + R() * .5, R()]; });
    // ----- Mina: tents, couched camels, the people; near the rise they stand in an arc facing him -----
    const camp = (cx, cz, rx, rz, n, keepOut) => { const out = []; for (let i = 0; i < n * 8 && out.length < n; i++) { const x = cx + (R() * 2 - 1) * rx, z = cz + (R() * 2 - 1) * rz; if (keepOut(x, z) || out.some((q) => Math.abs(q[0] - x) < 6.2 && Math.abs(q[1] - z) < 5.2)) continue; const w = 3.2 + R() * 2.4; out.push([x, z, w, w * (.62 + R() * .2), 1.6 + R() * .6, TENT[R() < .14 ? 3 : (R() * 5) | 0], (R() - .5) * .5]); } return out; };
    const offN = (x, z, m) => hN(x, z) > 2.2 + m || Math.hypot(x - AP[0], z - AP[1]) < 44;
    st.tN = camp(-100, -20, 900, 300, 460, (x, z) => offN(x, z, 0) || (Math.abs(x) < 90 && z > 60 && z < 200));
    st.fN = []; for (let i = 0; i < 50000 && st.fN.length < 7000; i++) { const wide = R() < .3, x = (R() * 2 - 1) * (wide ? 950 : 560) - 60, z = (R() * 2 - 1) * (wide ? 300 : 210) + 10; if (offN(x, z, .5) || R() > .5 + .5 * Math.exp(-Math.hypot(x - AP[0], (z - AP[1]) * 1.4) / 300) || st.tN.some((q) => Math.abs(q[0] - x) < q[2] * .6 && Math.abs(q[1] - z) < q[3] * .6)) continue; const r = R(); st.fN.push([x, z, r < .07 ? 4 : r < .1 ? 3 : r < .3 ? 5 : 0, R() < .5 ? 1 : -1, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R()]); }
    st.arcN = []; for (let i = 0; i < 300; i++) { const a = Math.PI + (R() - .5) * 2.4, rr = 12 + R() ** .7 * 50, x = AP[0] + Math.sin(a) * rr * 1.3, z = AP[1] + Math.cos(a) * rr * .8; if (hN(x, z) > 3 || Math.hypot(x - 8, z - 108) < 5 || Math.hypot(x - 3, z - 119) < 4 || Math.hypot(x + 8.5, z - 109) < 4) continue; st.arcN.push([x, z, x < AP[0] ? 1 : -1, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R()]); }
    st.rocksN = [[-2.6, 125.5, .55], [2.4, 126.2, .45], [-1.4, 131, .7], [3.6, 132, .6], [-4.2, 129, .4], [1.2, 122.6, .35], [5.6, 128.6, .5], [-6, 124, .45], [6.4, 123.4, .4]];
    // ----- Mecca: the houses round the court; the people going round the House -----
    st.housesK = []; for (let i = 0; i < 5000 && st.housesK.length < 230; i++) { const a = R() * TAU, rr = 46 + R() ** 1.6 * 230, x = Math.sin(a) * rr, z = Math.cos(a) * rr, w = 5 + R() * 7, d = 5 + R() * 7; if (hK(x, z) > 45 || (Math.abs(Math.sin(a * 3 + .4)) < .12 && rr < 120)) continue; if (st.housesK.some((H) => x - w / 2 < H[1] + 2.4 && x + w / 2 > H[0] - 2.4 && z - d / 2 < H[3] + 2.4 && z + d / 2 > H[2] - 2.4)) continue; st.housesK.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, 3.2 + R() * 3.4, MHOUSE[(R() * 4) | 0], Math.min(hK(x - w / 2, z - d / 2), hK(x + w / 2, z + d / 2), hK(x, z)) - .2]); }
    const inHijr = (x, z, m) => { const u = x * UN[0] + z * UN[1], v = x * VN[0] + z * VN[1]; return v > 0 && (u / (5.8 + m)) ** 2 + ((v - KA.hv) / (8.2 + m)) ** 2 < 1 || v > 0 && v < KA.hv + m && Math.abs(u) < KA.hu + m; };
    st.tawaf = []; for (let i = 0; i < 2000 && st.tawaf.length < 230; i++) { const a = R() * TAU, rr = 10.5 + R() ** .8 * 13; if (inHijr(Math.sin(a) * rr, Math.cos(a) * rr, 1.6)) continue; st.tawaf.push([a, rr, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R(), R() < .3]); }
    st.watchK = []; for (let i = 0; i < 90; i++) { const a = R() * TAU, rr = 26 + R() * 8, x = Math.sin(a) * rr, z = Math.cos(a) * rr; if (Math.hypot(x - ALK[0], z - ALK[1]) < 5 || Math.hypot(x - ALKP[0], z - ALKP[1]) < 5 || Math.abs(((a - Math.atan2(12, 38)) % TAU + TAU + Math.PI) % TAU - Math.PI) < .45) continue; st.watchK.push([x, z, R() < .5 ? 1 : -1, CL[(R() * 7) | 0], HD[(R() * 7) | 0], R()]); }
    st.cloud = Array.from({ length: 6 }, () => [R(), .2 + R() * .45, .12 + R() * .2, R()]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    const wR = p >= .41 && p < .5, wN = p >= .6 && p < .89, wK = p >= .89, wM = !wR && !wN && !wK;
    const hW = wR ? hR : wN ? hN : wK ? hK : hM;
    // ----- the camera: its place from the keys, its turn from the subject -----
    let cx, cyR, cz, hyF, sx, sy, sz;
    if (wM && p >= RIDE[0] && p < .41) { // riding beside Ali, a little ahead, on his left
      const [ax, az, dirA] = roadAt(dAli(p)), side = -1, d = mix(8, 9.5, seg(p, ...RIDE));
      cx = ax + Math.cos(dirA) * d * side + Math.sin(dirA) * 5.5; cz = az - Math.sin(dirA) * d * side + Math.cos(dirA) * 5.5; cyR = 1.9; hyF = .55;
      sx = ax + Math.sin(dirA) * 2.5; sy = 1.9; sz = az + Math.cos(dirA) * 2.5;
    } else if (wR && p < .437) { // at the halt, watching Ali come down the wadi
      cx = -7.5; cyR = 1.9; cz = -4; hyF = .55; [sx, sz] = aliRideR(p); sy = 1.6;
    } else {
      const [CK, SK] = wR ? [CMR, SMR] : wN ? [CMN, SMN] : wK ? [CMK, SMK] : [CMM, SMM];
      [cx, cyR, cz, hyF] = keyAt(CK, p); [sx, sy, sz] = keyAt(SK, p);
    }
    const camY = hW(cx, cz) + cyR;
    const fx = phone ? .5 : .4, ang = Math.atan2(sx - cx, sz - cz) - Math.atan((fx - .5) * W / F), ca = Math.cos(ang), sa = Math.sin(ang);
    const hy = H * (hyF + (phone ? .14 : 0));
    const VX = (x, z) => (x - cx) * ca - (z - cz) * sa, VZ = (x, z) => (x - cx) * sa + (z - cz) * ca;
    const P3 = (x, y, z) => { const v = Math.max(.4, VZ(x, z)); return [W / 2 + VX(x, z) * F / v, hy - (y - camY) * F / v, v]; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LQ, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const day = c01((elev + 2) / 10);
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
      const sunL = c01((elev + 4) / 8);
      if (sunL > 0) {
        const g = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * 1.3); g.addColorStop(0, rgb(sunC, .42 * sunL)); g.addColorStop(.3, rgb(sunC, .12 * sunL)); g.addColorStop(1, rgb(sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
        if (sunV[1] > .05 && sunY > -20 && sunY < hy) { const q = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * .05); q.addColorStop(0, `rgba(255,252,236,${.95 * sunL})`); q.addColorStop(.4, rgb(sunC, .5 * sunL)); q.addColorStop(1, rgb(sunC, 0)); c.fillStyle = q; c.fillRect(sunX - F * .05, sunY - F * .05, F * .1, F * .1); }
      }
      c.globalCompositeOperation = 'source-over';
      st.cloud.forEach(([u, v, w, k]) => { const x = ((u * W * 1.5 - ang * 260) % (W * 1.5) + W * 1.5) % (W * 1.5) - W * .25, y = hy - v * hy * .9, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const cc = lerp([255, 255, 255], sunC, .35); q.addColorStop(0, rgb(cc, 0)); q.addColorStop(.5, rgb(cc, .22 + .2 * k)); q.addColorStop(1, rgb(cc, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 7 * k, 0, 0, TAU); c.fill(); });
    }
    // ----- the land -----
    { const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2, z1 = 12000;
      const gW = wR ? groundR : wN ? groundN : wK ? groundK : (x, z, h) => groundM(x, z, h);
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), fa = fogA(zr), e = Math.max(1.4, zr * .015);
        for (let k = 0; k <= NK; k++) {
          const scx = -W * .06 + k * (W * 1.12 / NK), vx = (scx - W / 2) * zr / F, x = cx + vx * ca + zr * sa, z = cz - vx * sa + zr * ca, h = hW(x, z), o = i * (NK + 1) + k;
          TX[o] = scx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hW(x + e, z) - h) / e, hz = (hW(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, skyL = .62 + .38 / nl;
            const cc = lit(gW(x, z, h, Math.hypot(hx, hz)), lam, skyL), n = (i * NC + k / 2) * 3;
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j], haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .1);
    }
    // ----- shared painters -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.4, shH / Math.max(.1, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [44, 34, 52], .66), shA = .42 * day + .06;
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
      const zr = vz;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * o.dir, -s);
      const lu = litSide * o.dir, base = fogd(lit(o.cl, .18 * day + .02, .9), zr, .8), hi = fogd(lit(lerp(o.cl, [255, 236, 206], .1), .95 * day + .1, 1), zr, .8);
      const P = (i) => [pts[2 * i] + ln * pts[2 * i + 1], pts[2 * i + 1]];
      c.beginPath(); for (let i = 0; i < 16; i++) { const q = P(i); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath();
      const g = c.createLinearGradient(-.3 * lu, 0, .3 * lu, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.5, rgb(lerp(hi, base, .65))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(28,20,14,.35)'; c.lineWidth = .025; c.stroke();
      if (o.rim) { c.strokeStyle = `rgba(${o.rimC || '255,220,160'},${o.rim})`; c.lineWidth = .05; c.stroke(); }
      { const robe = fogd(lit([214, 198, 166], .55 * day + .1, 1), zr, .8), wb = sho[1] * .66; // the robe under the open cloak, and a sash
        c.save(); c.clip(); c.fillStyle = rgb(robe); c.beginPath(); c.moveTo(.06, 0); c.lineTo(.3, 0); c.lineTo(.2 + ln * wb, wb); c.lineTo(.1 + ln * wb, wb); c.closePath(); c.fill();
        c.fillStyle = rgb(lerp(base, [30, 22, 16], .25)); c.fillRect(-.4, wb - .03, .8, .05); c.restore(); }
      const sx0 = sho[0] + ln * sho[1], sy0 = sho[1];
      c.strokeStyle = rgb(lerp(base, hi, .35)); c.lineWidth = .11; c.lineCap = 'round';
      (o.arms || [[sho[0] + .06, sho[1] - .55]]).forEach(([ax, ay]) => { c.beginPath(); c.moveTo(sx0, sy0); c.quadraticCurveTo(mix(sx0, ax, .5) - .06, mix(sy0, ay, .5) - .04, ax, ay); c.stroke(); });
      if (o.scroll) { const [ax, ay] = (o.arms || [[.3, 1.2]])[0]; scrollAt(ax + .04, ay + .02, zr); }
      const hx = hc[0] + ln * hc[1], hv = hc[1];
      const hdc = fogd(lit(o.hd, .75 * day + .12, 1), zr, .8), hdd = fogd(lit(o.hd, .26 * day + .07, .85), zr, .8);
      const b5 = P(5), b4 = P(4);
      c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .9) - .035, mix(b5[1], b4[1], .9)); c.lineTo(mix(b5[0], b4[0], .9) + .07, mix(b5[1], b4[1], .9) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill();
      const q = c.createLinearGradient(hx - .14 * lu, 0, hx + .14 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
      c.fillStyle = q; c.beginPath(); c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
      c.restore();
      return { X, Y, s };
    };
    // the verses: a folded sheet with a cord, in a hand (metres, in the current figure frame)
    const scrollAt = (u, v, zr) => { const col = fogd(lit([238, 226, 196], .8 * day + .2), zr, .8); c.save(); c.translate(u, v); c.rotate(.5); c.fillStyle = rgb(col); c.beginPath(); c.rect(-.13, -.04, .26, .08); c.fill(); c.strokeStyle = rgb(fogd(lit([150, 70, 44], .5 * day + .1), zr, .8)); c.lineWidth = .02; c.beginPath(); c.moveTo(0, -.045); c.lineTo(0, .045); c.stroke(); c.restore(); };
    const scrollScreen = (X, Y, s, a = 1) => { c.save(); c.globalAlpha = a; c.translate(X, Y); c.scale(s, -s); scrollAt(0, 0, 4); c.restore(); };
    const holy = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8) return null;
      const X = W / 2 + VX(x, z) * F / vz, Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, h = 1.8 * F / vz * (o.sc || 1);
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, amb: .3 + .7 * day, ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; hd.X = X; hd.Y = Y; return hd;
    };
    // the near camel: walking (ph the gait, mv 0..1), or couched (k 0..1); a rider: 'man' (faceless) or 'ali' (veiled)
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
      c.fillStyle = rgb(lerp(top, [255, 236, 200], .25), .5); c.beginPath(); c.ellipse(-.12, 2.3 - k * 1.04, .55, .12, -.05, 0, TAU); c.fill(); // light on the hump
      c.fillStyle = rgb(lerp(bot, [30, 20, 16], .4)); c.beginPath(); c.ellipse(mix(2.04, 1.78, k), mix(2.27, 1.78, k), .06, .1, .4, 0, TAU); c.fill(); // the ear
      CLEG.forEach(([u, gp, near]) => { if (near) leg(u, gp, 1); });
      // the saddle: a cloth over the hump, girth straps; al-'Adba' a dark red cloth with a pale stripe (invented)
      const cl = o.saddle || [120, 70, 50], c1 = fogd(lit(cl, .6 * day + .12), vz, .8), c2 = fogd(lit(lerp(cl, [240, 220, 180], .4), .7 * day + .14), vz, .8), dv = -k * 1.04;
      c.beginPath(); c.moveTo(-.8, 2.04 + dv); c.quadraticCurveTo(-.1, 2.6 + dv, .52, 2.06 + dv); c.lineTo(.46, 1.46 + dv); c.lineTo(-.76, 1.46 + dv); c.closePath(); c.fillStyle = rgb(c1); c.fill();
      c.strokeStyle = rgb(c2); c.lineWidth = .05; c.beginPath(); c.moveTo(-.76, 1.62 + dv); c.lineTo(.46, 1.62 + dv); c.stroke();
      c.strokeStyle = rgb(fogd(lit([70, 40, 30], .3 * day + .06), vz, .8)); c.lineWidth = .035; c.beginPath(); const mz = lerp([2.24, 2.18], [1.98, 1.66], k), mz2 = lerp([1.92, 2.26], [1.7, 1.78], k); c.moveTo(mz[0], mz[1]); c.lineTo(mz[0] - .04, mz[1] - .2); c.moveTo(mz2[0], mz2[1]); c.lineTo(mz[0] + .02, mz[1] - .12); c.stroke(); // the halter
      if (o.rider === 'man') { // a faceless rider, seated on the hump
        c.save(); c.translate(-.1, 2.42 + dv); c.beginPath(); for (let i = 0; i < SEAT.length; i += 2) i ? c.lineTo(SEAT[i], SEAT[i + 1]) : c.moveTo(SEAT[i], SEAT[i + 1]); c.closePath(); c.fillStyle = rgb(fogd(lit(o.cl || CARR, .5 * day + .1), vz, .8)); c.fill();
        c.fillStyle = rgb(fogd(lit(o.hd || CARRH, .8 * day + .14), vz, .8)); c.beginPath(); c.ellipse(.02, 1.12, .14, .12, 0, 0, TAU); c.fill(); c.restore();
      }
      c.restore();
      const seat = [X + (-.1) * s * dir, Y - bob * s - (2.4 + dv) * s];
      if (o.rider === 'ali') rideAli(seat[0], seat[1], 1.8 * s, dir, o.alpha ?? 1);
      return { X, Y, s, seat };
    };
    // Ali on the camel: Holy's riding figure, clipped to the rider (cloak and disc), seated on the hump painted above
    const rideAli = (Xs, Ys, h, dir, alpha) => {
      const r = .072 * h, sw = .1425 * h, ny = Ys - .36 * h, hyy = ny - 1.1 * r, X = (u) => Xs + dir * u;
      c.save(); c.beginPath();
      c.moveTo(X(-.6 * r), ny); c.quadraticCurveTo(X(-.85 * sw), ny + .15 * r, X(-.9 * sw), ny + 1.1 * r);
      c.bezierCurveTo(X(-sw), Ys - .1 * h, X(-.9 * sw), Ys, X(-1.1 * sw), Ys + .2 * h); c.quadraticCurveTo(X(0), Ys + .26 * h, X(1.3 * sw), Ys + .2 * h);
      c.bezierCurveTo(X(1.1 * sw), Ys, X(sw), Ys - .1 * h, X(.9 * sw), ny + 1.1 * r); c.quadraticCurveTo(X(.85 * sw), ny + .15 * r, X(.6 * r), ny); c.closePath();
      c.moveTo(Xs + 2.55 * r, hyy - .2 * r); c.arc(Xs, hyy - .2 * r, 2.55 * r, 0, TAU, dir > 0);
      c.clip();
      Holy.draw(c, { who: 'ali', pose: 'ride', mount: 'horse', flip: dir < 0, x: Xs + dir * .0213 * h, y: Ys + .7568 * h, h, t: 0, amb: .3 + .7 * day, glow: .06, alpha });
      c.restore();
    };
    // ----- crowds, batched by depth band. Every size reads as a person: a cloak and a separate head over a neck notch;
    //       the nearest go to the depth-sorted list as full figures -----
    const BANDS = [140, 520, 1600, 1e9], NB = BANDS.length, TONES = [[92, 70, 52], [66, 62, 64], [116, 86, 60]], bodyP = BANDS.map(() => TONES.map(() => new Path2D())), headP = BANDS.map(() => new Path2D()), legP = new Path2D();
    const bandOf = (vz) => { let b = 0; while (vz > BANDS[b]) b++; return b; };
    const crowd = (kind, x, z, dir, ph, moving, k, o = {}) => {
      const vz = VZ(x, z); if (vz < 2) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -40 || X > W + 40) return;
      const Y = hy - (hW(x, z) - camY) * F / vz, s = F / vz * (.93 + .14 * k), b = bandOf(vz), pa = bodyP[b][(k * 7 | 0) % 3], hp = headP[b], hpx = 1.8 * s;
      if (hpx > (wN ? 44 : 28)) { items.push([vz, () => { // Mina: only the nearest as full figures (thousands in view)
        if (kind === 3) { shadow(x, z, 2.2, 1.3, .22); camelNear(x, z, dir, { mv: moving ? 1 : 0, ph, rider: o.empty ? null : 'man', cl: o.cl, hd: o.hd, saddle: o.cl }); }
        else if (kind === 4) { shadow(x, z, 1.2, 1.3, .22); camelNear(x, z, dir, { k: 1, saddle: lerp(o.cl || CL[0], [200, 180, 140], .3) }); }
        else { shadow(x, z, kind === 5 ? 1 : 1.7, .5, .24); person(x, z, { a: kind === 5 ? 'sit' : 'stand', dir, cl: o.cl, hd: o.hd, lean: o.lean ?? (moving ? .05 : 0), arms: o.arms, rim: .1 }); }
      }]); return; }
      const bob = moving ? Math.abs(Math.sin(ph)) * .04 * s : 0;
      if (kind === 3) { // camel and its rider
        const lh = 1.28;
        if (hpx >= 4.5) { poly(pa, CAMEL, X, Y - bob, s, dir); [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, q]) => { const a = Math.sin(ph + q) * (moving ? .45 : .05); legP.moveTo(X + hu * s * dir, Y - lh * s); legP.lineTo(X + (hu + a * .5) * s * dir, Y - lh * .46 * s); legP.lineTo(X + (hu + a * .3) * s * dir, Y); }); }
        else { const w = Math.max(2.2, 2.1 * s), hh = Math.max(1.4, .8 * s), yb = Y - Math.max(1.2, lh * s); pa.moveTo(X - w / 2, yb); pa.quadraticCurveTo(X, yb - hh * 1.4, X + w / 2, yb); pa.lineTo(X + w * .36, Y); pa.lineTo(X + w * .26, yb + .5); pa.lineTo(X - w * .26, yb + .5); pa.lineTo(X - w * .36, Y); pa.closePath(); }
        if (!o.empty) { const ry = Y - bob - Math.max(2.6, 2.05 * s), rw = Math.max(.9, .44 * s), rh = Math.max(1.6, .82 * s), hr = Math.max(.7, .15 * s), rx = X - .25 * s * dir;
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
    // an acacia: a short trunk and a flat crown; far ones a dab
    const acacia = (x, z, r, k) => { const vz = VZ(x, z); if (vz < 3 || vz > 3500) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -60 || X > W + 60) return;
      items.push([vz, () => {
        const s = F / vz, Y = hy - (hW(x, z) - camY) * F / vz, hh = r * .9, col = fogd(lit([82, 92, 52], .45 * day + .08, .9), vz, .92), top = fogd(lit([142, 146, 88], day + .1, 1), vz, .92);
        if (s * hh < 1.6) { c.fillStyle = rgb(col); c.fillRect(X - Math.max(1, r * s * .6), Y - Math.max(1.2, s * hh), Math.max(2, r * s * 1.2), Math.max(.8, s * hh * .35)); return; }
        c.fillStyle = rgb(shCol, .22); c.beginPath(); c.ellipse(X + shD[0] * s * hh * .4, Y, r * s * .9, r * s * .18, 0, 0, TAU); c.fill();
        c.strokeStyle = rgb(fogd(lit([92, 72, 54], .4 * day + .1, .9), vz, .92)); c.lineWidth = Math.max(.8, .18 * s); c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X + (k - .5) * .5 * s, Y - hh * .5 * s, X + (k - .5) * .2 * s, Y - hh * s); c.moveTo(X + (k - .5) * .25 * s, Y - hh * .6 * s); c.lineTo(X + (k - .2) * r * .7 * s, Y - hh * .95 * s); c.stroke();
        for (let j = 0; j < 5; j++) { const ox = (j / 4 - .5) * r * 1.5 + (hash(j, k) - .5) * .4 * r, oy = hh * (.95 + .12 * hash(k, j)); c.fillStyle = rgb(j % 2 ? col : lerp(col, top, .4)); c.beginPath(); c.ellipse(X + ox * s, Y - oy * s, r * s * (.38 + .12 * hash(j, 3)), r * s * .13, 0, 0, TAU); c.fill(); }
        c.fillStyle = rgb(top, .35); c.beginPath(); c.ellipse(X, Y - hh * 1.04 * s, r * s * .8, r * s * .07, 0, 0, TAU); c.fill();
      }]); };
    // a light coming down on him (metaphoric: the revelation, the word of Jibril; no figure)
    const lightDown = (hd, L) => { if (!hd || L <= 0) return; const s = hd.h / 1.8;
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, 0, hd.Y); g.addColorStop(0, 'rgba(255,246,214,0)'); g.addColorStop(.6, `rgba(255,240,200,${.15 * L})`); g.addColorStop(1, `rgba(255,236,190,${.22 * L})`); c.fillStyle = g; c.beginPath(); c.moveTo(hd.X - .45 * s, 0); c.lineTo(hd.X + .45 * s, 0); c.lineTo(hd.X + 1.1 * s, hd.Y); c.lineTo(hd.X - 1.1 * s, hd.Y); c.closePath(); c.fill(); c.restore();
      glow(hd.x, hd.y, 3 * s, [255, 232, 180], .2 * L); };
    const dipK = Math.max(...CUTS.map((d) => bump(p, ...d)));

    // ----- the ground near the camera: stones and dry tufts on a fixed world grid -----
    { const G = 2.6, R0 = 80, i0 = Math.floor((cx - R0) / G), i1 = Math.ceil((cx + R0) / G), j0 = Math.floor((cz - R0) / G), j1 = Math.ceil((cz + R0) / G);
      const tuftP = new Path2D(), stoneP = new Path2D(), stoneT = new Path2D(), shP = new Path2D(), dens = wK ? .06 : wN ? .1 : wR ? .55 : cz < -60 ? .55 : .25;
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const hh = hash(i, j, 7); if (hh > dens) continue;
        const x = (i + hash(i, j, 1)) * G, z = (j + hash(i, j, 2)) * G, vz = VZ(x, z); if (vz < 1.2 || vz > R0) continue;
        if (wM && ((x > MOS[0] - 1 && x < MOS[1] + 1 && z > MOS[2] - 1 && z < MOS[3] + 1) || st.houses.some((H) => x > H[0] - .5 && x < H[1] + .5 && z > H[2] - .5 && z < H[3] + .5))) continue;
        if (wK && Math.hypot(x, z) < 30) continue;
        const s = F / vz, X = W / 2 + VX(x, z) * F / vz; if (X < -20 || X > W + 20) continue;
        const Y = hy - (hW(x, z) - camY) * F / vz, k = hash(i, j, 3), r = (.12 + .35 * k * k) * s;
        if (r < .6) continue;
        if (hh < dens * .45 || wN || wK) {
          const w = r * (1.2 + k), hgt = r * (.55 + .4 * hash(i, j, 4));
          shP.moveTo(X + w * 1.3, Y); shP.ellipse(X + w * .4 * -litSide, Y, w * 1.3, hgt * .35, 0, 0, TAU);
          stoneP.moveTo(X - w, Y); stoneP.bezierCurveTo(X - w, Y - hgt * .9, X + w * .7, Y - hgt * 1.1, X + w, Y); stoneP.closePath();
          stoneT.moveTo(X - w * .7, Y - hgt * .45); stoneT.bezierCurveTo(X - w * .5, Y - hgt * .95, X + w * .4, Y - hgt * 1.0, X + w * .55, Y - hgt * .5); stoneT.quadraticCurveTo(X, Y - hgt * .62, X - w * .7, Y - hgt * .45); stoneT.closePath();
        } else {
          for (let q = 0; q < 6; q++) { const a = (q / 5 - .5) * 1.5 + (hash(i, j, q) - .5) * .4, L = r * (1.4 + hash(q, i, j)); tuftP.moveTo(X + (q - 2.5) * r * .12, Y); tuftP.quadraticCurveTo(X + Math.sin(a) * L * .4, Y - L * .6, X + Math.sin(a) * L, Y - Math.cos(a) * L * .9); }
        }
      }
      c.fillStyle = rgb(shCol, .3 * (.4 + .6 * day)); c.fill(shP);
      const stc = lit(wN || wR ? [108, 92, 84] : [140, 116, 92], .3 * day + .06, .85), stt = lit(wN || wR ? [184, 160, 140] : [222, 204, 170], day + .1, 1);
      c.fillStyle = rgb(stc); c.fill(stoneP); c.fillStyle = rgb(lerp(stc, stt, .55), .8); c.fill(stoneT);
      c.strokeStyle = rgb(lit([150, 132, 82], .7 * day + .1, 1), .85); c.lineWidth = Math.max(.7, F / 900); c.lineCap = 'round'; c.stroke(tuftP);
    }

    let lines = null; // the four lines of light over Mina, drawn after the people
    if (wM) {
      // ================= Medina and the plain =================
      st.acacia.forEach((q) => acacia(...q));
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
      // the mosque: the yard, its low walls (a gate in the north wall), the shade of fronds along the south wall
      const [mx0, mx1, mz0, mz1] = MOS, alb = [200, 166, 122];
      if (VZ(0, 0) > -40 && VZ(0, 0) < 900) {
        quad([[mx0, .01, mz0], [mx1, .01, mz0], [mx1, .01, mz1], [mx0, .01, mz1]], rgb(fogd(lit([226, 206, 166], Math.max(0, sun[1]) * .9 * day, 1), 20)));
        quad([[ROOF[0], .015, ROOF[2]], [ROOF[1], .015, ROOF[2]], [ROOF[1], .015, ROOF[3]], [ROOF[0], .015, ROOF[3]]], rgb(lit([150, 128, 96], .08, .85), .6));
        slab(mx0 - .5, mx0, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx1, mx1 + .5, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx0 - .5, mx1 + .5, mz0 - .5, mz0, WALLH, alb, 0, 3);
        slab(mx0 - .5, -1.6, mz1, mz1 + .5, WALLH, alb, 0, 3); slab(1.6, mx1 + .5, mz1, mz1 + .5, WALLH, alb, 0, 3);
        for (let j = 0; j < 10; j++) { const x = mix(ROOF[0] + .4, ROOF[1] - .4, j / 9); [ROOF[3] + .2, ROOF[2] + .4].forEach((z, i) => { const zr = VZ(x, z); if (zr < 1) return; items.push([zr + (i ? .3 : 0), () => { const a = P3(x, 0, z), b = P3(x, ROOF[4], z), s = F / zr; c.fillStyle = rgb(fogd(lit([120, 96, 72], Math.max(0, sun[0] * litSide) * .6 * day + .1, .9), zr)); c.beginPath(); tube(c, [[a[0], a[1]], [b[0], b[1]]], Math.max(1, .3 * s), Math.max(1, .24 * s)); c.fill(); }]); }); }
        items.push([VZ(0, ROOF[3]) - .2, () => {
          const col = camY > ROOF[4] ? lit([110, 104, 62], Math.max(0, sun[1]) * day + .12, 1) : lit([128, 106, 76], .12, .9);
          quad([[ROOF[0] - .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[3] + .3], [ROOF[0] - .3, ROOF[4], ROOF[3] + .3]], rgb(col));
          if (camY < ROOF[4]) { c.strokeStyle = rgb(lit([60, 48, 32], .05, .8), .7); c.lineWidth = 1; c.beginPath(); for (let j = 0; j < 30; j++) { const x = mix(ROOF[0], ROOF[1], j / 29), A = P3(x, ROOF[4], ROOF[2]), B = P3(x, ROOF[4], ROOF[3]); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); } // the fronds of the roof seen from under it
        }]);
      }
      // ----- the people -----
      if (p < .086) { // he sits in the yard with a few men; light comes down on him (I'lam 1:248: the verses come down)
        st.yard.forEach(([x, z, d, cl, hd]) => items.push([VZ(x, z), () => { shadow(x, z, 1, .5, .26); person(x, z, { a: 'sit', dir: d, cl, hd }); }]));
        items.push([VZ(0, -4.6), () => { shadow(0, -4.6, 1.2, .6, .3); const hd = holy(0, -4.6, { pose: 'sit', glow: .22 }); lightDown(hd, bump(p, -.03, .02, .06, .085)); }]);
      } else if (p < .171) { // the caravan goes out south-west; he stands by the road with three men
        const head = 300 + (p - .086) * 3200;
        st.col.forEach(([dd, lane, kind, cl, hd, k]) => { const d = head - dd; if (d < 232) return; const [x, z, a] = roadAt(d), xx = x + Math.cos(a) * lane, zz = z - Math.sin(a) * lane, fw = [Math.sin(a), Math.cos(a)], dir = VX(xx + fw[0] * 5, zz + fw[1] * 5) / Math.max(1, VZ(xx + fw[0] * 5, zz + fw[1] * 5)) - VX(xx, zz) / Math.max(1, VZ(xx, zz)) >= 0 ? 1 : -1; crowd(kind, xx, zz, dir, d * 2.2 + k * 9, true, k, { cl, hd }); });
        flushCrowd();
        st.byRoad.forEach(([x, z, cl, hd], i) => items.push([VZ(x, z), () => { shadow(x, z, 1.7, .5, .26); person(x, z, { a: 'stand', dir: i % 2 ? 1 : -1, cl, hd, lean: .02 * Math.sin(t * .6 + i) }); }]));
        items.push([VZ(PR1[0], PR1[2]), () => { shadow(PR1[0], PR1[2], 1.8, .6, .3); holy(PR1[0], PR1[2], { pose: 'stand', glow: .14 }); }]);
      } else if (p < .251) { // the yard, afternoon: he stands; the light of Jibril's word comes down on him (Irshad 1:65)
        st.yard.slice(0, 4).forEach(([x, z, d, cl, hd]) => items.push([VZ(x - 2, z + 6), () => { shadow(x - 2, z + 6, 1, .5, .26); person(x - 2, z + 6, { a: 'sit', dir: d, cl, hd }); }]));
        items.push([VZ(-2, 2), () => { shadow(-2, 2, 1.8, .6, .3); const hd = holy(-2, 2, { pose: 'stand', glow: .18 + .25 * bump(p, .19, .205, .23, .25) }); lightDown(hd, bump(p, .182, .2, .232, .25)); }]);
      } else if (p < .331) { // by Ali's house: he and Ali face each other; al-'Adba' couched beside; his sleeve goes to her
        const PP = [15.2, -16.5], AA = [17.7, -16.5], CC = [21.6, -15.4], sl = smooth(seg(p, .272, .292)), sl2 = smooth(seg(p, .3, .315));
        items.push([VZ(...CC), () => { shadow(CC[0], CC[1], 1.4, 1.5, .26); camelNear(CC[0], CC[1], -1, { k: 1, saddle: [120, 44, 36] }); }]);
        items.push([VZ(...PP), () => { shadow(...PP, 1.8, .6, .3); holy(...PP, { pose: 'stand', glow: .14, arms: sl > 0 ? [[mix(.12, .4, sl) - .2 * sl2, mix(-.6, -.74, sl) + .1 * sl2]] : undefined }); }]);
        items.push([VZ(...AA), () => { shadow(...AA, 1.8, .6, .3); holy(...AA, { who: 'ali', pose: 'stand', flip: true, glow: .1 }); }]);
      } else if (p < .41) { // Ali rides al-'Adba' across the plain toward the sunset; dust behind
        const dd = dAli(p), [ax, az, a] = roadAt(dd), fw = [Math.sin(a), Math.cos(a)], dir = VX(ax + fw[0] * 5, az + fw[1] * 5) / Math.max(1, VZ(ax + fw[0] * 5, az + fw[1] * 5)) - VX(ax, az) / Math.max(1, VZ(ax, az)) >= 0 ? 1 : -1;
        items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.4, .3); camelNear(ax, az, dir, { mv: 1, ph: dd * 1.9, rider: 'ali', saddle: [120, 44, 36] }); }]);
        for (let j = 0; j < 10; j++) { const [qx, qz] = roadAt(dd - 2.4 - j * 1.7), vz = VZ(qx, qz); if (vz < 2) continue; const s = F / vz, X = W / 2 + VX(qx, qz) * F / vz, Y = hy - (hW(qx, qz) + .4 + j * .12 - camY) * F / vz, r = (.9 + j * .32) * s; c.save(); c.translate(X, Y); c.scale(1.6, 1); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, rgb(lerp(haze, [214, 182, 144], .5), .24 * (1 - j / 10))); g.addColorStop(1, rgb(haze, 0)); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore(); }
      } else { // the yard at noon: he sits in the shade; the man stands before him; light at his answer (Irshad 1:65–66)
        const PP = [3.25, -9.6], MM = [1.7, -8.7], wl = bump(p, .552, .566, .59, .6);
        st.shade.forEach(([x, z, d, cl, hd]) => items.push([VZ(x, z), () => { person(x, z, { a: 'sit', dir: d, cl, hd }); }]));
        items.push([VZ(...PP), () => { const hd = holy(...PP, { pose: 'sit', glow: .14 + .3 * wl, arms: wl > 0 ? [[.2, -.42]] : undefined }); if (hd) glow(hd.x, hd.y, hd.h * .9, [255, 226, 170], .16 * wl); }]);
        items.push([VZ(...MM), () => { shadow(...MM, 1.7, .5, .2); person(...MM, { a: 'stand', b: 'bend', k: .25, dir: VX(...PP) > VX(...MM) ? 1 : -1, cl: CARR, hd: CARRH }); }]);
      }
      draw();
    } else if (wR) {
      // ================= al-Rawha' =================
      st.rTree.forEach((q) => acacia(...q));
      st.rBales.forEach(([x, z, r, k]) => items.push([VZ(x, z), () => { const vz = VZ(x, z); if (vz < 1.5) return; const [X, Y] = P3(x, hW(x, z), z), s = F / vz; c.fillStyle = rgb(fogd(lit(lerp([150, 120, 86], [96, 80, 70], k), .45 * day + .1), vz, .85)); c.beginPath(); c.ellipse(X, Y - r * .45 * s, r * .8 * s, r * .45 * s, 0, 0, TAU); c.fill(); }]));
      st.rHalt.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true }));
      flushCrowd();
      // al-'Adba' comes in along the road and kneels; Ali steps down beside her
      const kneel = smooth(seg(p, .437, .447)), down = smooth(seg(p, .447, .454)), [ax, az] = aliRideR(p);
      const moving = p < .437;
      items.push([VZ(ax, az), () => { shadow(ax, az, 2.2, 1.4, .28); camelNear(ax, az, VX(ax, az - 3) > VX(ax, az) ? 1 : -1, { mv: moving ? 1 : 0, ph: az * 1.9, k: kneel, rider: down < 1 ? 'ali' : null, alpha: 1 - down, saddle: [120, 44, 36] }); }]);
      // the man: from beside his couched camel to meet Ali; the verses pass to Ali's sleeve; he goes back and rides north
      const meet = smooth(seg(p, .44, .452)), give = smooth(seg(p, .456, .464)), back = smooth(seg(p, .47, .482)), rideN = seg(p, .484, .5);
      const mx = mix(mix(RM0[0], RM1[0], meet), RCM[0] - .6, back), mz = mix(mix(RM0[1], RM1[1], meet), RCM[1] + 1.4, back), mDir = VX(RA[0], RA[1]) > VX(mx, mz) ? 1 : -1;
      if (rideN <= 0) {
        items.push([VZ(RCM[0], RCM[1]), () => { shadow(RCM[0], RCM[1], 1.4, 1.5, .24); camelNear(RCM[0], RCM[1], VX(RCM[0], RCM[1] - 3) > VX(RCM[0], RCM[1]) ? 1 : -1, { k: 1, saddle: [96, 82, 70] }); }]);
        items.push([VZ(mx, mz), () => { shadow(mx, mz, 1.7, .5, .26); const reach = give > 0 && give < 1 ? Math.sin(give * Math.PI) : 0, holdS = give < .5; person(mx, mz, { a: 'stand', b: 'bend', k: .15 + .2 * reach, dir: back > .3 ? -mDir : mDir, cl: CARR, hd: CARRH, arms: holdS ? [[.34 + .2 * reach, 1.12 + .08 * reach]] : undefined, scroll: holdS }); }]);
      } else { // he rides back toward Medina, past Ali, out of the picture
        const rz = mix(RCM[1], 64, rideN), rx = mix(RCM[0], 6.5, rideN);
        items.push([VZ(rx, rz), () => { shadow(rx, rz, 2.2, 1.4, .26); camelNear(rx, rz, VX(rx, rz + 3) > VX(rx, rz) ? 1 : -1, { mv: rideN > .02 ? 1 : 0, ph: rz * 1.9, rider: 'man', cl: CARR, hd: CARRH, saddle: [96, 82, 70] }); }]);
      }
      if (down > 0) items.push([VZ(...RA), () => { shadow(...RA, 1.8, .6, .3); const hasS = give >= .5, hd = holy(...RA, { who: 'ali', pose: 'stand', flip: mDir > 0, glow: .1, alpha: down, arms: hasS ? [[.2, -.62]] : undefined }); if (hd && hasS) scrollScreen(hd.X + (mDir > 0 ? -.2 : .2) * hd.h, hd.Y - .62 * hd.h, hd.h / 1.8, down); }]);
      draw();
    } else if (wN) {
      // ================= Mina =================
      st.tN.forEach((q) => tent(...q)); flushTents();
      st.fN.forEach(([x, z, kind, dir, cl, hd, k]) => crowd(kind, x, z, dir, k * 9, false, k, { cl, hd, empty: true, lean: .02 * Math.sin(t * .5 + k * 20) }));
      st.arcN.forEach(([x, z, dir, cl, hd, k]) => crowd(0, x, z, dir, 0, false, k, { cl, hd, lean: .03 * Math.sin(t * .6 + k * 9) }));
      flushCrowd();
      // the rise: a few boulders on its crown
      st.rocksN.forEach(([x, z, r], i) => items.push([VZ(x, z) + .3, () => { const vz = VZ(x, z); if (vz < 1.5) return; const [X, Y] = P3(x, hW(x, z) - .1, z), s = F / vz, w = r * s, hh = r * (.7 + .4 * hash(i, 5)) * s;
        const pts = [[-1, 0], [-.95, -.45], [-.55, -.9], [-.05, -1], [.5, -.82], [.92, -.4], [1, 0]].map(([u, v], j) => [X + u * w * (1 + .15 * (hash(i, j) - .5)), Y + v * hh * (1 + .2 * (hash(j, i) - .5))]);
        c.fillStyle = rgb(fogd(lit([88, 74, 70], .14 * day + .06), vz, .8)); c.beginPath(); pts.forEach(([u, v], j) => (j ? c.lineTo(u, v) : c.moveTo(u, v))); c.closePath(); c.fill();
        const L = litSide > 0 ? [3, 4, 5, 6] : [0, 1, 2, 3]; c.fillStyle = rgb(fogd(lit([132, 112, 100], .9 * day + .12), vz, .8)); c.beginPath(); c.moveTo(X, Y - hh * .35); L.forEach((j) => c.lineTo(pts[j][0], pts[j][1])); c.closePath(); c.fill(); }]));
      // Ali on the rise: at first he stands with a sleeve up over the people; then the sword is out and held up (Manaqib)
      const swd = p >= .801, up = smooth(seg(p, .688, .71));
      items.push([VZ(...AP) - .1, () => { shadow(AP[0], AP[1], 1.8, .6, .3); const o = swd ? { pose: 'fight', phase: .17, sword: true } : { pose: 'stand', sword: true, arms: up > 0 ? [[.16 + .12 * up, -.66 - .26 * up]] : undefined }; const hd = holy(AP[0], AP[1], { who: 'ali', glow: .16 + .16 * bump(p, .75, .77, .8, .82), ...o }); if (hd) lines = hd; }]);
      draw();
    } else {
      // ================= Mecca, the House =================
      st.housesK.forEach(([x0, x1, z0, z1, h, col, y0]) => { slab(x0, x1, z0, z1, h, col, y0, 3); slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .3, lerp(col, [210, 196, 170], .25), y0 + h, 0, VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .05); });
      // the Kaaba: dark cloth over the walls (seams of the cloth widths), the door high on the NE face, the spout on the NW
      kaaba();
      // the low wall of the Hijr on the NW side
      for (let i = 0; i < HIJR.length - 1; i++) { const [x0, z0] = HIJR[i], [x1, z1] = HIJR[i + 1], xm = (x0 + x1) / 2, zm = (z0 + z1) / 2; items.push([VZ(xm, zm) + .2, () => { const nx = z1 - z0, nz = -(x1 - x0), nl = Math.hypot(nx, nz), lam = Math.max(0, (nx * sun[0] + nz * sun[2]) / nl) * .8 + .1; const col = rgb(fogd(lit([214, 202, 178], lam * day + .1), VZ(xm, zm))); quad([[x0, 0, z0], [x1, 0, z1], [x1, 1.3, z1], [x0, 1.3, z0]], col); quad([[x0, 1.3, z0], [x1, 1.3, z1], [x1 - nx / nl * .9, 1.3, z1 - nz / nl * .9], [x0 - nx / nl * .9, 1.3, z0 - nz / nl * .9]], rgb(fogd(lit([226, 216, 194], Math.max(0, sun[1]) * day + .14), VZ(xm, zm)))); }]); }
      // the people going round it, the House on their left: the turning follows p
      const turn = (p - .89) * 2.6;
      st.tawaf.forEach(([a0, rr, cl, hd, k, pale]) => { const a = a0 - turn * (14 / rr), x = Math.sin(a) * rr, z = Math.cos(a) * rr, fwx = Math.cos(a), fwz = -Math.sin(a), dir = VX(x - fwx, z - fwz) > VX(x, z) ? 1 : -1; crowd(0, x, z, dir, a * rr * 3.1, true, k, { cl: pale ? [196, 186, 164] : cl, hd: pale ? [92, 74, 60] : hd }); });
      st.watchK.forEach(([x, z, dir, cl, hd, k]) => crowd(k < .3 ? 5 : 0, x, z, dir, 0, false, k, { cl, hd }));
      flushCrowd();
      const ak = phone ? ALKP : ALK; items.push([VZ(...ak), () => { shadow(...ak, 1.8, .6, .3); holy(...ak, { who: 'ali', pose: 'stand', glow: .14, sword: true }); }]);
      draw();
    }
    // the four lines of light over Mina, one with each of his words (Manaqib 1:391); metaphoric
    if (lines && p > .83) {
      const T0 = [.832, .846, .86, .872];
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      T0.forEach((t0, i) => {
        const a = smooth(seg(p, t0, t0 + .008)) * (1 - smooth(seg(p, .886, .892))), rv = ease.out(seg(p, t0, t0 + .02)); if (a <= 0) return;
        const y = lines.y - lines.h * (1.05 + .5 * i) - H * .03 * i, L = W * .62 * rv, x0 = lines.x, sag = H * .02 * (1 + i * .4);
        [[-1, 1], [1, 1]].forEach(([sd]) => {
          const len = sd > 0 && !phone ? Math.max(0, Math.min(L, W * .54 - x0)) : L, x1 = x0 + sd * len, sg2 = sag * len / Math.max(1, W * .62), g = c.createLinearGradient(x0, 0, x1 + sd, 0); if (len < 2) return; g.addColorStop(0, `rgba(255,232,176,${.75 * a})`); g.addColorStop(.7, `rgba(255,214,140,${.35 * a})`); g.addColorStop(1, 'rgba(255,214,140,0)');
          c.strokeStyle = g; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(mix(x0, x1, .5), y - sg2, x1, y + sg2 * .4); c.stroke();
          c.lineWidth = 9; c.strokeStyle = `rgba(255,214,140,${.08 * a})`; c.stroke();
        });
        glow(x0, y, lines.h * .5, [255, 230, 170], .35 * a);
      });
      c.restore();
    }
    grade(c, W, H, phone, dipK);

    // ----- the Kaaba (inside frame: it needs P3, quad, lit, sun) -----
    function kaaba() {
      const { hu, hv, h, door } = KA, cnr = [kw(hu, hv), kw(hu, -hv), kw(-hu, -hv), kw(-hu, hv)]; // N, E, S, W corners
      const faces = [[0, 1, UN, 'NE'], [1, 2, [-VN[0], -VN[1]], 'SE'], [2, 3, [-UN[0], -UN[1]], 'SW'], [3, 0, VN, 'NW']];
      const vz0 = Math.max(1, VZ(0, 0));
      faces.forEach(([i0, i1, n, nm]) => {
        const [x0, z0] = cnr[i0], [x1, z1] = cnr[i1];
        if ((cx - (x0 + x1) / 2) * n[0] + (cz - (z0 + z1) / 2) * n[1] <= 0) return; // turned away
        items.push([VZ((x0 + x1) / 2, (z0 + z1) / 2), () => {
          const lam = Math.max(0, n[0] * sun[0] + n[1] * sun[2]) * day, col = fogd(lit([36, 32, 30], lam * 1.1 + .12, .9), vz0, .7);
          quad([[x0, 0, z0], [x1, 0, z1], [x1, h, z1], [x0, h, z0]], rgb(col));
          for (let j = 0; j < 14; j++) { const u0 = j / 14, u1 = (j + 1) / 14, k = hash(j, i0) - .5; quad([[mix(x0, x1, u0), .5, mix(z0, z1, u0)], [mix(x0, x1, u1), .5, mix(z0, z1, u1)], [mix(x0, x1, u1), h, mix(z0, z1, u1)], [mix(x0, x1, u0), h, mix(z0, z1, u0)]], rgb(k > 0 ? [255, 240, 220] : [0, 0, 0], Math.abs(k) * .08)); } // the cloth widths, each a shade apart
          // the cloth: seams of its widths, a faint sheen at the top where the light falls
          c.strokeStyle = rgb(lerp(col, [0, 0, 0], .4), .55); c.lineWidth = 1; c.beginPath();
          for (let j = 1; j < 14; j++) { const u = j / 14, A = P3(mix(x0, x1, u), .5, mix(z0, z1, u)), B = P3(mix(x0, x1, u), h, mix(z0, z1, u)); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
          c.stroke();
          const T = P3(x0, h, z0), T2 = P3(x1, h, z1), B0 = P3(x0, h * .55, z0), B1 = P3(x1, h * .55, z1), g = c.createLinearGradient(0, T[1], 0, B0[1]); g.addColorStop(0, rgb(lerp(col, sunC, .25), .35 * (lam + .1))); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(T[0], T[1]); c.lineTo(T2[0], T2[1]); c.lineTo(B1[0], B1[1]); c.lineTo(B0[0], B0[1]); c.closePath(); c.fill();
          const F0 = P3(x0, 0, z0), F1 = P3(x1, 0, z1), H0 = P3(x0, .5, z0), H1 = P3(x1, .5, z1); c.fillStyle = rgb(fogd(lit([150, 140, 126], lam + .14), vz0, .7)); c.beginPath(); c.moveTo(F0[0], F0[1]); c.lineTo(F1[0], F1[1]); c.lineTo(H1[0], H1[1]); c.lineTo(H0[0], H0[1]); c.closePath(); c.fill(); // the stone foot under the hem
          if (nm === 'NE') { // the door: dark wood, its sill well above the ground
            const [d0, d1, y0, y1] = door, P = (v, y) => { const [x, z] = kw(hu + .02, v); return P3(x, y, z); }, a = P(d0, y0), b = P(d1, y0), cc = P(d1, y1), d = P(d0, y1);
            c.fillStyle = rgb(fogd(lit([92, 60, 34], lam * .9 + .1), vz0, .7)); c.beginPath(); [a, b, cc, d].forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
            c.strokeStyle = rgb(fogd(lit([60, 38, 22], .1), vz0, .7)); c.lineWidth = 1; const m0 = P((d0 + d1) / 2, y0), m1 = P((d0 + d1) / 2, y1); c.beginPath(); c.moveTo(m0[0], m0[1]); c.lineTo(m1[0], m1[1]); c.stroke();
          }
          if (nm === 'NW') { const [x, z] = kw(0, hv + .05), A = P3(x, h - .25, z), [x2, z2] = kw(0, hv + 1.1), B = P3(x2, h - .45, z2); c.strokeStyle = rgb(fogd(lit([70, 54, 40], lam + .1), vz0, .7)); c.lineWidth = Math.max(1.2, .25 * F / vz0); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); } // the spout
        }]);
      });
      if (camY > h) items.push([VZ(0, 0) - .01, () => quad(cnr.map(([x, z]) => [x, h, z]), rgb(fogd(lit([60, 54, 50], Math.max(0, sun[1]) * day + .1), vz0, .7)))]);
    }
  },
};
// ----- grade: the edges close in a little; the cuts -----
function grade(c, W, H, phone, dipK = 0) {
  const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
  vg.addColorStop(0, 'rgba(10,12,30,0)'); vg.addColorStop(1, 'rgba(10,12,30,.18)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (dipK > 0) { c.fillStyle = `rgba(6,8,14,${dipK})`; c.fillRect(0, 0, W, H); }
}
})();
