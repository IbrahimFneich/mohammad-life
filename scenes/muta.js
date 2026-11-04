(() => {
// muta — «مؤتة» (I'lam al-Wara 1:212–214, Aban ibn Uthman's report; al-Kafi 5:49, 8:376, 1:450, 3:217; al-Faqih 1:177).
// Two small worlds in metres under one pinhole camera keyed on p (x east, y up, z north; the camera turns about y):
// Medina (the oasis, the mosque, the houses) and the highlands of al-Balqa' (rolling ochre-and-green hills, the plain
// of Mu'ta). The camera aims itself at the shot's subject so the action keeps left of the words (centre on phones).
//   p −.05 → .13   Medina, morning: he stands on a low rise at the northern edge of the palms while the army goes out
//                   north on the road toward Uhud, Ja'far at its head with the banner (Aban: Ja'far, then Zayd, then
//                   Ibn Rawaha)
//      .13 → .30   the march north through the green-and-ochre highlands, the column small in a long valley; at the
//                   end the plain opens and the host of Rome lies across it
//      .30 → .40   the plain of Mu'ta: the lines; the host vast, faceless, its banners; Ja'far gets down from his horse
//                   (al-Kafi 5:49: only the dismount is shown; the horse is led away)
//      .40 → .54   close, at the banner: Ja'far holds it high, then gathers it into his arms, goes down to his knees
//                   with it embraced, and lies with it held (posture only: no wound is drawn); two wings of light rise
//                   from where he lies (light only, no figure)
//      .54 → .60   Zayd lifts the banner from his arms, then goes down with it; Ibn Rawaha lifts it
//      .60 → .625  the camera rises and every height sinks (al-Kafi 8:376 «خُفض له كلّ رفيع»): a gold dissolve to
//      .625 → .69  Medina: he stands in the mosque; north of the yard the palms, the houses and Uhud have sunk, and the
//                   field of Mu'ta shows on the horizon; then his sleeves go to his middle («وأخذه المغص في بطنه»)
//      .69 → .80   Ja'far's door: he sits on a mat before it, his sleeves on the heads of the two boys; Asma' sits by
//                   the door, bowed
//      .80 → .875  the mosque at sunset: he stands on the minbar, the boy seated on its lowest step, the people sitting
//      .875 → 1.05 night over Medina: his own door lit, he sits inside it, a sleeve to his veil; Fatima (veiled, the
//                   gold disc) and two women carry food along the lane to Asma''s lit door (al-Kafi 3:217)
// The Prophet and Fatima are drawn only by Holy.draw; everyone else is a faceless shape with an earth-toned head
// cloth (the host of Rome: iron-grey helmets). Everything follows from p; t moves only cloth, stars, dust and light.
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
  kneel: [-.5, 0, -.46, .18, -.3, .36, -.2, .62, -.2, .86, -.12, .98, -.08, 1.1, .04, 1.22, .14, 1.12, .11, 1.0, .16, .9, .19, .66, .22, .44, .38, .3, .46, 0, 0, .02],
  lie: [-.95, 0, -.93, .14, -.66, .24, -.3, .3, .05, .33, .32, .32, .5, .36, .66, .44, .8, .4, .84, .3, .76, .22, .5, .18, .2, .16, -.2, .12, -.6, .08, 0, .02],
  sit: [-.34, 0, -.33, .24, -.25, .5, -.21, .72, -.19, .86, -.11, .96, -.07, 1.06, .04, 1.16, .13, 1.07, .11, .96, .15, .86, .18, .62, .26, .36, .42, .2, .46, 0, 0, .02],
  bow: [-.34, 0, -.34, .24, -.27, .48, -.18, .68, -.08, .8, .04, .86, .1, .94, .22, .98, .3, .88, .26, .78, .26, .66, .26, .5, .3, .34, .42, .2, .46, 0, 0, .02],
  sitF: [-.42, 0, -.4, .2, -.3, .46, -.26, .66, -.24, .84, -.15, .95, -.09, 1.04, 0, 1.17, .09, 1.04, .15, .95, .24, .84, .26, .66, .3, .46, .4, .2, .42, 0, 0, .02],
  kbow: [-.5, 0, -.46, .18, -.34, .4, -.26, .62, -.14, .8, 0, .9, .1, .96, .24, 1.0, .32, .9, .28, .8, .3, .66, .28, .5, .3, .36, .4, .24, .46, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], front: [0, 1.6], kneel: [.04, 1.11], lie: [.68, .34], sit: [.04, 1.06], bow: [.2, .88], sitF: [0, 1.04], kbow: [.22, .9] };
const SHO = { stand: [.01, 1.36], front: [.2, 1.38], kneel: [.01, .88], lie: [.5, .3], sit: [0, .84], bow: [.16, .74], sitF: [.2, .84], kbow: [.12, .78] };
// batched crowd shapes (badr): side man, far man, horse, rider, camel, a man seen from the front
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MANS = [-.3, 0, -.22, 1.3, -.12, 1.5, -.08, 1.76, .08, 1.76, .12, 1.5, .22, 1.3, .3, 0];
const MANF = [-.3, 0, -.26, .9, -.27, 1.36, -.15, 1.5, -.12, 1.66, 0, 1.8, .12, 1.66, .15, 1.5, .27, 1.36, .26, .9, .3, 0];
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const RIDER = [-.24, 1.48, -.22, 1.95, -.14, 2.12, -.13, 2.26, -.06, 2.37, .05, 2.37, .11, 2.26, .12, 2.12, .2, 1.95, .24, 1.48];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
const poly = (pa, sh, bx, by, s, dir, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const X = bx + (sh[i] + lean * sh[i + 1]) * dir * s, Y = by - sh[i + 1] * s; i ? pa.lineTo(X, Y) : pa.moveTo(X, Y); } pa.closePath(); };
// earth tones: cloaks, head cloths (the Muslims); iron and dark red (the host)
const CL = [[118, 92, 66], [96, 80, 62], [132, 104, 74], [104, 86, 68], [84, 72, 58], [124, 100, 80], [110, 96, 70]];
const HD = [[150, 116, 74], [128, 92, 60], [140, 122, 88], [112, 92, 66], [160, 128, 86], [120, 84, 58], [104, 102, 74]];
const RCL = [[84, 52, 48], [70, 64, 70], [98, 44, 40], [62, 58, 66], [80, 70, 64]], HELM = [74, 68, 60];
const WCL = [[70, 56, 48], [80, 62, 50], [64, 54, 50]], WMN = [[98, 74, 56], [86, 66, 56], [108, 84, 62]];
const HOUSE = [[206, 178, 136], [196, 166, 124], [214, 188, 148], [190, 160, 120]];

// ---------- Medina: the oasis, a low rise north of the palms, the harra east and west, Uhud to the north ----------
const MOS = [-15, 15, -12, 14], WALLH = 1.3, ROOF = [-15, 15, -12, -7.2, 3.1]; // the yard; the shade along its south wall
const HOMEP = [15.6, 22, -8, -1.2, 3], DOORP = 18.8; // his house against the yard's east wall, its door on the south face
const HOMEJ = [29.5, 36.5, -4, 3, 3.2], DOORJ = 33; // Ja'far's house
const RISE = [-3, 70], ROADX = (z) => -9.5 + Math.sin(z * .008) * 3 + Math.max(0, z - 120) * .02; // where he stands as they go out; the road north
const SINK0 = 22; // north of this (z) every height sinks in the vision
function hM(x, z, flat) {
  let h = .06 * Math.sin(x * .7 + z * .4) * Math.sin(z * .6 - x * .3) + 1.1 * Math.exp(-((x - RISE[0]) ** 2 + (z - RISE[1]) ** 2) / 40);
  const ha = smooth(c01((Math.abs(x + 80) - 520) / 640)); h += ha * (6 + 28 * crag(x * .02, z * .02));
  h += 400 * Math.exp(-((x + 300) ** 2) / (2 * 1500 ** 2) - ((z - 4300) ** 2) / (2 * 520 ** 2)) * (.6 + .6 * crag(x * .003 + 2, z * .003));
  h += smooth(c01((z - 6500) / 3500)) * (220 + 260 * crag(x * .0013, z * .0013));
  return h * (1 - flat * smooth(c01((z - SINK0 - 6) / 70)));
}
const SAND = [222, 202, 160], EARTH = [196, 170, 128], GROVE = [146, 150, 96], FIELD = [124, 150, 74], BASALT = [78, 66, 62], RED = [158, 108, 84], FARC = [150, 156, 184];
function groundM(x, z, h) {
  const n = c01(.5 + .5 * Math.sin(x * .13 + Math.sin(z * .11) * 2) * Math.sin(z * .17 - x * .05));
  if (x > MOS[0] - 2 && x < 40 && z > -30 && z < MOS[3] + 2) return lerp(lerp(SAND, EARTH, .2 + .4 * n), [180, 152, 116], .3 * c01(.5 + .5 * Math.sin(x * .4 - z * .3)));
  const fld = c01((Math.sin(x * .045 + Math.sin(z * .03) * 1.5) * Math.sin(z * .05 - x * .01) - .15) * 3);
  const green = c01(1 - Math.hypot(x / 420, (z - 60) / 380)) * (.25 + .6 * fld) * (z > 40 && z < 140 ? .55 : 1);
  let a = lerp(lerp(EARTH, SAND, n), lerp(GROVE, FIELD, n), green);
  a = lerp(a, lerp(BASALT, [104, 86, 74], n * .6), smooth(c01((Math.abs(x + 80) - 520) / 640)) * .9);
  a = lerp(a, RED, c01((h - 30) / 160) * .8);
  a = lerp(a, [218, 198, 156], Math.exp(-((x - ROADX(z)) ** 2) / 10) * c01((z - 30) / 20) * .8);
  return lerp(a, lerp(RED, FARC, .6), smooth(c01((z - 2000) / 3000)));
}

// ---------- al-Balqa': the road north in a long valley, then the plain of Mu'ta ----------
const pathX = (z) => (1 - smooth(c01((z + 1100) / 900))) * (170 * Math.sin(z * .00085 + .6) + 70 * Math.sin(z * .0021 + .3) - 160 * Math.sin(-1100 * .00085 + .6));
function hN(x, z, flat) {
  const plain = Math.exp(-(x * x) / (2 * 1500 ** 2) - ((z - 300) ** 2) / (2 * 900 ** 2));
  const rid = 1 - Math.abs(Math.sin(x * .0023 + Math.sin(z * .0011 + .4) * 1.9 + z * .0004));
  let h = 92 * crag(x * .0014 + 1, z * .0014) + 46 * rid * rid + 30 * Math.sin(x * .0021 + z * .0013) * Math.sin(z * .0017 - 1) + 12 * crag(x * .011, z * .011);
  h *= 1 - .86 * Math.exp(-((x - pathX(z)) ** 2) / (2 * 190 ** 2)) * (1 - smooth(c01((z + 300) / 400)));
  h = h * (1 - .95 * plain) + 3 * Math.sin(x * .011 + z * .007) * plain;
  h += smooth(c01((z - 2400) / 3000)) * (170 + 260 * crag(x * .0011, z * .0011)) + smooth(c01((-x - 2600) / 3000)) * 140;
  return h * (1 - flat);
}
const OCHRE = [200, 160, 92], GOLD = [222, 188, 120], LIME = [214, 200, 168], GRN = [102, 120, 62], OLV = [84, 100, 58], SOIL = [158, 104, 70];
function groundN(x, z, h, slope) {
  const n = c01(.5 + .5 * Math.sin(x * .021 + Math.sin(z * .017) * 2.4) * Math.sin(z * .019 - x * .007)), m = c01(.5 + .5 * Math.sin(x * .0041 - z * .0033 + 1));
  const n2 = c01(.5 + .5 * Math.sin(x * .09 + z * .05) * Math.sin(z * .11 - x * .03)), str = .5 + .5 * Math.sin(h * .42 + n * 2.5);
  let a = lerp(lerp(OCHRE, GOLD, n), LIME, c01((slope - .3) * 1.8) * .7);
  const patch = c01((Math.sin(x * .013 + Math.sin(z * .009) * 2) * Math.sin(z * .011 - x * .004) - .1) * 2.2);
  a = lerp(a, lerp(GRN, OLV, n2), c01((1.1 - slope * 1.6) * (.15 + .7 * m * patch) * (.5 + .6 * n2)) * (1 - .55 * Math.exp(-(x * x) / (2 * 1500 ** 2) - ((z - 300) ** 2) / (2 * 900 ** 2))));
  a = lerp(a, a.map((v) => v * .84), str * c01(slope * 3) * .8); // the strata of the limestone on the slopes
  a = lerp(a, SOIL, c01(.5 - n2) * .3 * c01(slope * 2));
  const road = Math.exp(-((x - pathX(z)) ** 2) / 18) * (1 - smooth(c01((z + 200) / 200)));
  a = lerp(a, [214, 196, 158], road * .7);
  return lerp(a, [150, 156, 184], smooth(c01((z - 3200) / 4500)) * .45);
}

// light: sky top, sky mid, horizon, sun, ambient, haze, elevation (deg), azimuth (rad from north toward east), fog distance
const LQ = [
  [-.06, [64, 124, 200], [150, 190, 228], [232, 226, 212], [255, 236, 204], [149, 157, 171], [214, 214, 220], 22, 1.75, 5200],
  [.12, [62, 122, 200], [148, 190, 228], [230, 226, 214], [255, 238, 208], [152, 158, 171], [214, 216, 222], 30, 1.85, 5600],
  [.14, [60, 120, 204], [146, 190, 232], [226, 228, 222], [255, 240, 214], [149, 160, 173], [208, 216, 224], 30, 1.95, 7000],
  [.29, [44, 110, 206], [128, 182, 236], [222, 230, 234], [255, 246, 224], [157, 165, 178], [212, 222, 232], 56, 2.9, 7600],
  [.34, [46, 104, 196], [132, 176, 228], [232, 222, 210], [255, 236, 204], [152, 158, 171], [214, 218, 226], 32, -2.5, 7000],
  [.42, [52, 104, 184], [150, 176, 214], [236, 214, 190], [255, 226, 184], [152, 149, 157], [220, 206, 194], 24, -1.95, 5600],
  [.5, [54, 98, 174], [160, 170, 204], [240, 206, 172], [255, 216, 166], [146, 140, 150], [224, 200, 180], 19, -1.8, 5000],
  [.58, [56, 92, 162], [168, 162, 186], [242, 196, 156], [255, 204, 146], [144, 134, 144], [226, 192, 166], 15, -1.85, 4400],
  [.615, [60, 86, 150], [176, 160, 180], [244, 192, 150], [255, 200, 142], [147, 134, 142], [230, 196, 166], 12, -1.8, 9000],
  [.64, [60, 110, 186], [158, 182, 216], [238, 214, 186], [255, 220, 170], [152, 152, 162], [222, 208, 196], 20, -1.9, 5200],
  [.7, [58, 98, 170], [170, 172, 198], [246, 200, 158], [255, 202, 140], [149, 136, 141], [232, 198, 168], 9, -1.7, 4200],
  [.8, [48, 70, 132], [150, 128, 168], [244, 166, 124], [255, 178, 112], [128, 109, 120], [214, 160, 140], 4, -1.6, 3600],
  [.872, [32, 42, 96], [92, 80, 136], [190, 118, 120], [220, 140, 110], [110, 100, 140], [140, 104, 124], -1, -1.6, 2600],
  [.9, [8, 12, 42], [22, 28, 80], [66, 56, 102], [110, 130, 214], [56, 66, 142], [52, 52, 112], 40, 0, 1700],
  [1.06, [8, 12, 42], [22, 28, 80], [66, 56, 102], [110, 130, 214], [56, 66, 142], [52, 52, 112], 40, 0, 1700]];
// cameras: [p, x, height above the ground under it, z, horizon (fraction of the height)]; the subject the camera aims at:
// [p, x, y, z]; the subject's place on the screen comes from the layout (left of the words; centred on phones)
const CM = [[-.06, 1.2, 1.8, 61.5, .6], [.06, .6, 2.4, 58, .58], [.135, -.5, 6.5, 50, .52],
  [.62, -2.4, 1.8, -6.2, .5], [.69, -2.1, 1.75, -4.9, .5],
  [.691, 31, 1.45, -12.2, .55], [.8, 31.6, 1.4, -10.6, .55],
  [.801, .9, 2.3, -4.6, .44], [.875, .6, 2.15, -5.6, .44],
  [.876, 22.5, 4.2, -21, .5], [1.06, 23, 9, -31, .44]];
const SM = [[-.06, -3, 1.5, 70], [.135, -4, 1.5, 76], [.62, -3, 1.4, 3], [.69, -3, 1.4, 3], [.691, 33, 1, -5], [.8, 33, 1, -5],
  [.801, 0, 1.4, -11], [.875, 0, 1.4, -11], [.876, 25.5, 1.5, -6], [1.06, 25.5, 1.5, -6]];
const CN = [[.3, -22, 8.5, -64, .42], [.385, -14, 6.5, -46, .44], [.42, 4.4, 1.2, 7.2, .62], [.475, 4.0, 1.1, 7.8, .63], [.54, 3.8, 1.05, 8.0, .63],
  [.6, 9, 4.5, -2, .54], [.626, -30, 90, -200, .3]];
const SN = [[.3, 0, 2, 70], [.385, 0, 2, 26], [.42, 0, 1.6, 12], [.475, 0, 1.2, 12], [.51, 0, .7, 12], [.54, 0, 1.4, 12], [.6, 0, 2, 12], [.626, 0, 0, 200]];
const CUTS = [[.124, .13, .132, .138], [.294, .298, .302, .306], [.684, .688, .692, .696], [.794, .798, .802, .806], [.868, .872, .876, .88]];
const GOLDCUT = [.6, .618, .622, .64];
// the march: the head of the column along the valley road (z), then the lines on the plain
const sHead = (p) => mix(-3500, -70, seg(p, .13, .3));
const J0 = [0, 4], JF = [0, 12]; // Ja'far at the front of the lines; where the lines meet

S.muta = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(8629);
    // Medina: houses and palms, kept off the yard, the two houses, the lanes and the camera's ground
    const keep = [[MOS[0] - 4, MOS[1] + 4, MOS[2] - 5, MOS[3] + 4], [HOMEP[0] - 1, HOMEP[1] + 1, HOMEP[2] - 1, HOMEP[3] + 1], [HOMEJ[0] - 2, HOMEJ[1] + 2, HOMEJ[2] - 1.5, HOMEJ[3] + 1.5],
      [12, 42, -48, -4], [-20, 12, 30, 150], [-16, -2, 30, 3000], [-12, 10, -30, -12], [14, 30, -36, -12]];
    const clear = (x, z, m = 0) => !keep.some(([a, b, c0, d]) => x > a - m && x < b + m && z > c0 - m && z < d + m);
    st.houses = [[...HOMEP, HOUSE[0], 1, DOORP], [...HOMEJ, HOUSE[2], 1, DOORJ]];
    for (let i = 0; i < 900 && st.houses.length < 40; i++) {
      const w = 4 + R() * 5, d = 4 + R() * 5, x = -110 + R() * 240, z = -70 + R() * 150, h = 2.7 + R() * 1.6;
      if (!clear(x, z, 4)) continue;
      if (st.houses.some((H) => x - w / 2 < H[1] + 2 && x + w / 2 > H[0] - 2 && z - d / 2 < H[3] + 2 && z + d / 2 > H[2] - 2)) continue;
      st.houses.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, HOUSE[(R() * 4) | 0], R() < .5 ? 1 : 0, mix(x - w / 2, x + w / 2, .3 + .4 * R())]);
    }
    const free = (x, z) => clear(x, z, 1) && !st.houses.some((H) => x > H[0] - 1.2 && x < H[1] + 1.2 && z > H[2] - 1.2 && z < H[3] + 1.2);
    st.palms = [[-17.5, 62, 9, -.05, .3], [-20, 76, 11, .06, .7], [8.5, 66, 10, .04, .5], [11.5, 81, 8.5, -.04, .9], [41, -1, 11, -.04, .6], [-18.5, -16, 10, .03, .4], [19, 22, 9, -.05, .8]];
    for (let i = 0; i < 3000 && st.palms.length < 120; i++) { const x = -120 + R() * 250, z = -80 + R() * 200; if (free(x, z)) st.palms.push([x, z, 6 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 500; i++) { const x = -420 + R() * 840, z = 120 + R() ** 1.2 * 360; if (Math.abs(x - ROADX(z)) > 12 && free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    for (let i = 0; i < 300; i++) { const x = -420 + R() * 840, z = -300 + R() * 220; if (free(x, z)) st.palms.push([x, z, 7 + R() * 6, (R() - .5) * .3, R()]); }
    st.lamps = st.houses.filter((H) => H[6]).map((H) => [H[7], H[2] - .6]);
    // the army going out of Medina, and on the march: [order, lane, kind (0 foot, 2 horse, 3 camel), cloak, head cloth, seed]
    st.army = Array.from({ length: 170 }, (_, i) => [i, i ? ((i % 3) - 1) * 2.1 + (R() - .5) * .9 : 0, i === 0 ? 2 : i % 7 === 3 ? 3 : i % 3 === 1 ? 2 : 0, CL[(i * 3) % 7], HD[(i * 5) % 7], R()]);
    // the lines on the plain: [x, z, kind, seed]; Ja'far in front (drawn alone)
    st.lines = [];
    for (let r = 0; r < 7; r++) for (let k = 0; k < 46; k++) st.lines.push([(k - 22.5) * 1.55 + (R() - .5) * .5 + (r % 2) * .7, -5 - r * 2.4 + (R() - .5) * .6, r >= 5 && k % 4 === 0 ? 2 : 0, R(), CL[(r * 7 + k) % 7], HD[(r * 3 + k) % 7]]);
    // the host of Rome: blocks across the plain to the far side, horse on the wings; banners above them
    st.host = []; st.hban = [];
    for (let b = 0; b < 15; b++) {
      const cx = -980 + b * 140 + (R() - .5) * 40, cz = 170 + R() * 90 + Math.abs(b - 7) * 14, w = 110 + R() * 40, d = 40 + R() * 34, horse = b < 2 || b > 12;
      const n = Math.round(230 * (1 - Math.abs(b - 7) / 13));
      for (let i = 0; i < n; i++) st.host.push([cx + (R() - .5) * w, cz + (R() - .5) * d, horse ? 2 : 1, R(), b, cz - d / 2]);
      for (let k = 0; k < 3; k++) st.hban.push([cx + (k - 1) * w * .32 + (R() - .5) * 10, cz - d * .3 + R() * d * .6, [[150, 40, 40], [110, 60, 120], [200, 170, 90], [170, 60, 50]][(b + k) % 4], R(), b, cz - d / 2]);
    }
    for (let r = 0; r < 30; r++) st.host.push(...Array.from({ length: 90 }, () => [-1600 + R() * 3200, 330 + r * 22 + R() * 16, 1, R(), -1, 0])); // the mass behind, to the far edge
    // the near fight: Muslims round the banner, the front ranks of the host
    st.nearM = [[-2.6, 10.9], [-4.3, 11.4], [-6.1, 10.7], [-8.2, 11.6], [-10.2, 10.9], [-3.6, 9.3], [-7, 9.2], [2.9, 13.6], [4.4, 14.2], [6.1, 13.5], [7.9, 14.4], [9.8, 13.7]].map(([x, z], i) => [x, z, CL[(i + 1) % 7], HD[(i * 2 + 1) % 7], R()]);
    st.nearR = Array.from({ length: 30 }, (_, i) => [(i % 15 - 7) * 1.7 + (R() - .5) * .7, 15.2 + Math.floor(i / 15) * 1.5 + R() * .6, RCL[i % 5], R()]);
    st.trees = []; // terebinth and oak on the hills, olive by the plain
    for (let i = 0; i < 1500 && st.trees.length < 700; i++) { const z = -3800 + R() * 4600, x = pathX(z) + (R() - .5) * 1600; if (Math.abs(x - pathX(z)) < 22 || (z > -250 && Math.abs(x) < 900)) continue; st.trees.push([x, z, 3 + R() * 4, R()]); }
    for (let i = 0; i < 220; i++) { const x = (R() < .5 ? -1 : 1) * (380 + R() * 900), z = -600 + R() * 1600; st.trees.push([x, z, 3 + R() * 3, R()]); }
    st.stars = Array.from({ length: 900 }, () => [R(), R() ** 1.3, .3 + R() ** 3 * 1.7, R() * 9]);
    st.milky = Array.from({ length: 360 }, () => { const u = R(); return [u, .85 - u * .5 + (R() - .5) * .14 * (1 + R()), .25 + R() * .55, R()]; });
    st.cloud = Array.from({ length: 7 }, () => [R(), .2 + R() * .45, .12 + R() * .2, R()]);
    st.dust = Array.from({ length: 60 }, () => [(R() - .5) * 60, 13 + R() * 6, R()]);
    // the congregation at the minbar (seated, facing south), in rows
    st.folk = [];
    for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) { const x = (k - 4.5) * 1.15 + (R() - .5) * .25; if (Math.abs(x) < .8) continue; st.folk.push([x, -9.2 + r * 1.2 + (R() - .5) * .2, CL[(r * 5 + k) % 7], HD[(r + k * 3) % 7], R()]); }
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7);
    const north = p >= .13 && p < .62; // which world
    const flatN = north ? smooth(seg(p, .588, .618)) : 0, flatM = north ? 0 : bump(p, .6, .62, .672, .69);
    const hW = north ? (x, z) => hN(x, z, flatN) : (x, z) => hM(x, z, flatM);
    // ----- the camera: its place from the keys, its turn from the subject -----
    let cx, cyR, cz, hyF, sx, sy, sz;
    if (north && p < .3) { // ahead of the column's head looking back down the valley; then round behind it to the plain
      const s = sHead(p), hx = pathX(s), sw = smooth(seg(p, .258, .3)), phi = mix(-.5 - .25 * seg(p, .13, .258), -2.85, sw), d = mix(26, 30, sw);
      cx = hx + Math.sin(phi) * d; cz = s + Math.cos(phi) * d; cyR = mix(4.2, 9, sw); hyF = mix(.46, .42, sw);
      sx = hx; sy = 2.2; sz = s - 6;
      if (sw > 0) { sz = mix(sz, s + 260, sw); sx = mix(sx, 0, sw); }
    } else {
      [cx, cyR, cz, hyF] = keyAt(north ? CN : CM, p);
      [sx, sy, sz] = keyAt(north ? SN : SM, p);
    }
    const camY = hW(cx, cz) + cyR;
    const fx = phone ? .5 : .4, ang = Math.atan2(sx - cx, sz - cz) - Math.atan((fx - .5) * W / F), ca = Math.cos(ang), sa = Math.sin(ang);
    const hy = H * (hyF + (phone ? .14 : 0));
    const VX = (x, z) => (x - cx) * ca - (z - cz) * sa, VZ = (x, z) => (x - cx) * sa + (z - cz) * ca;
    const P3 = (x, y, z) => { const v = Math.max(.4, VZ(x, z)); return [W / 2 + VX(x, z) * F / v, hy - (y - camY) * F / v, v]; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, az, fogL] = keyAt(LQ, p);
    const se = elev * Math.PI / 180, sun = [Math.cos(se) * Math.sin(az), Math.sin(se), Math.cos(se) * Math.cos(az)];
    const night = fade(p, .872, .9), day = c01((elev + 2) / 10) * (1 - night * .75);
    const fogA = (zr) => Math.min(.9, (1 - Math.exp(-zr / fogL)) * .95);
    const lit = (al, lam, skyL = 1) => al.map((v, j) => v / 255 * (amb[j] * skyL * .72 + sunC[j] * lam * .84));
    const fogd = (col, zr, k = .9) => lerp(col, haze, fogA(zr) * k);
    const items = [];
    const draw = () => { items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f()); items.length = 0; };
    const sunV = [sun[0] * ca - sun[2] * sa, sun[0] * sa + sun[2] * ca]; // the sun in camera space (x, z)
    const sunX = sunV[1] > .05 ? W / 2 + sunV[0] / sunV[1] * F : sunV[0] > 0 ? W * 1.25 : -W * .25, sunY = hy - Math.tan(se) * F * .9;
    const litSide = sunV[0] >= 0 ? 1 : -1; // which side of a figure the sun lights, on screen

    // ----- the sky -----
    { const sg = c.createLinearGradient(0, 0, 0, hy);
      sg.addColorStop(0, rgb(skT)); sg.addColorStop(.6, rgb(skM)); sg.addColorStop(1, rgb(skH));
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      if (night > 0) {
        st.milky.forEach(([u, v, s, k]) => { const x = (u * 1.3 - .15) * W - ang * 200, y = v * hy, r = s * F * .1; const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(196,176,236,${(.018 + .016 * k) * night})`); q.addColorStop(1, 'rgba(170,160,226,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, 2 * r, 2 * r); });
        st.stars.forEach(([u, v, m, ph]) => { const x = ((u * W * 1.2 - ang * 300) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, y = v * hy * .98; if (y > hy) return; const a = Math.min(1, m * .55 * (.65 + .35 * Math.sin(t * 1.4 + ph * 7))) * c01((hy - y) / (hy * .2)) * night; c.fillStyle = m > 1.5 ? `rgba(255,236,214,${a})` : `rgba(232,236,255,${a})`; c.fillRect(x, y, m > 1.2 ? 1.8 : 1.1, m > 1.2 ? 1.8 : 1.1); });
        const gl = c.createLinearGradient(0, hy - H * .14, 0, hy + 2); gl.addColorStop(0, 'rgba(255,150,90,0)'); gl.addColorStop(1, `rgba(255,150,96,${.12 * night})`); c.fillStyle = gl; c.fillRect(0, hy - H * .14, W, H * .14 + 2);
      }
      const sunL = (1 - night) * c01((elev + 3) / 8);
      if (sunL > 0) {
        const g = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * 1.3); g.addColorStop(0, rgb(sunC, .42 * sunL)); g.addColorStop(.3, rgb(sunC, .12 * sunL)); g.addColorStop(1, rgb(sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
        if (sunV[1] > .05 && sunY > -20 && sunY < hy) { const q = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, F * .05); q.addColorStop(0, `rgba(255,252,236,${.95 * sunL})`); q.addColorStop(.4, rgb(sunC, .5 * sunL)); q.addColorStop(1, rgb(sunC, 0)); c.fillStyle = q; c.fillRect(sunX - F * .05, sunY - F * .05, F * .1, F * .1); }
      }
      c.globalCompositeOperation = 'source-over';
      const cl = 1 - night; if (cl > 0) st.cloud.forEach(([u, v, w, k]) => { const x = ((u * W * 1.5 - ang * 260) % (W * 1.5) + W * 1.5) % (W * 1.5) - W * .25, y = hy - v * hy * .9, rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const cc = lerp([255, 255, 255], sunC, .35); q.addColorStop(0, rgb(cc, 0)); q.addColorStop(.5, rgb(cc, (.26 + .2 * k) * cl)); q.addColorStop(1, rgb(cc, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 7 * k, 0, 0, TAU); c.fill(); });
    }
    // ----- the land -----
    { const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, z0 = 2, z1 = north ? 14000 : 9000;
      for (let i = 0; i < NS; i++) {
        const zr = z0 * (z1 / z0) ** (1 - i / (NS - 1)), fa = fogA(zr), e = Math.max(1.4, zr * .015);
        for (let k = 0; k <= NK; k++) {
          const scx = -W * .06 + k * (W * 1.12 / NK), vx = (scx - W / 2) * zr / F, x = cx + vx * ca + zr * sa, z = cz - vx * sa + zr * ca, h = hW(x, z), o = i * (NK + 1) + k;
          TX[o] = scx; TY[o] = Math.max(-H, Math.min(H * 3, hy - (h - camY) * F / zr));
          if (k % 2 === 0) {
            const hx = (hW(x + e, z) - h) / e, hz = (hW(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * day, skyL = .62 + .38 / nl;
            const cc = lit(north ? groundN(x, z, h, Math.hypot(hx, hz)) : groundM(x, z, h), lam, skyL), n = (i * NC + k / 2) * 3;
            let wl = 0; if (night > 0) st.lamps.forEach(([qx, qz]) => { wl += Math.exp(-((x - qx) ** 2 + (z - qz) ** 2) / 12); });
            for (let j = 0; j < 3; j++) TC[n + j] = mix(cc[j] + ([4, 8, 26][j] + [120, 66, 20][j] * Math.min(1, wl)) * night, haze[j], fa);
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
    const quad = (pts, col) => { const a = pts.map(([x, y, z]) => P3(x, y, z)); c.fillStyle = col; c.beginPath(); a.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fill(); };
    const wallC = (base, lam, zr, a = .72) => fogd(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9 * day)), zr);
    // a box: the faces toward the camera and its top, with brick courses when near
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
      const path = (L) => { c.beginPath(); L.forEach((q, j) => (j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); };
      path(Array.from({ length: 16 }, (_, i) => P(i)));
      const g = c.createLinearGradient(-.3 * lu, 0, .3 * lu, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.5, rgb(lerp(hi, base, .65))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
      c.strokeStyle = `rgba(28,20,14,${.35 + .2 * night})`; c.lineWidth = .025; c.stroke();
      if (o.rim) { c.strokeStyle = `rgba(${o.rimC || '255,220,160'},${o.rim})`; c.lineWidth = .05; c.stroke(); }
      const sx0 = sho[0] + ln * sho[1], sy0 = sho[1];
      c.strokeStyle = rgb(lerp(base, hi, .35)); c.lineWidth = .11; c.lineCap = 'round';
      (o.arms || [[sho[0] + .06, sho[1] - .55]]).forEach(([ax, ay]) => { c.beginPath(); c.moveTo(sx0, sy0); c.quadraticCurveTo(mix(sx0, ax, .5) - .06, mix(sy0, ay, .5) - .04, ax, ay); c.stroke(); });
      if (o.blade) { const [ax, ay] = o.arms[0], ba = o.blade; c.strokeStyle = rgb(fogd(lit([170, 172, 172], .6 * day + .15), zr, .7)); c.lineWidth = .025; c.globalAlpha *= .8; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + Math.sin(ba) * .62, ay + Math.cos(ba) * .62); c.stroke(); }
      const hx = hc[0] + ln * hc[1], hv = hc[1];
      if (o.helm) { // the host: an iron helmet, a short crest
        c.fillStyle = rgb(fogd(lit(HELM, .35 * day + .06, .8), zr, .8)); c.beginPath(); c.ellipse(hx, hv + .01, .13, .13, 0, 0, TAU); c.fill();
        c.fillStyle = rgb(fogd(lit([110, 36, 30], .3 * day + .06, .9), zr, .8)); c.fillRect(hx - .02, hv + .11, .04, .1);
      } else {
        const hdc = fogd(lit(o.hd, .75 * day + .12, nl), zr, .8), hdd = fogd(lit(o.hd, .22 * day + .06, .85 * nl), zr, .8);
        if (o.wo) { // a mantle over the head and the shoulders
          const b3 = P(3), b4 = P(4), f10 = P(10), f11 = P(11);
          c.beginPath(); c.moveTo(b3[0] - .03, b3[1]); c.lineTo(b4[0] - .03, b4[1]); c.quadraticCurveTo(hx - .16, hv + .2, hx + .02, hv + .17); c.quadraticCurveTo(hx + .16, hv + .14, f10[0] + .03, f10[1]); c.lineTo(f11[0] + .02, f11[1]); c.closePath();
          const q = c.createLinearGradient(-.25 * lu, 0, .25 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd)); c.fillStyle = q; c.fill();
        } else {
          const b5 = P(5), b4 = P(4);
          c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .9) - .035, mix(b5[1], b4[1], .9)); c.lineTo(mix(b5[0], b4[0], .9) + .07, mix(b5[1], b4[1], .9) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill();
          const q = c.createLinearGradient(hx - .14 * lu, 0, hx + .14 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
          c.fillStyle = q; c.beginPath(); c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(28,20,14,.3)'; c.lineWidth = .02; c.stroke();
        }
      }
      c.restore();
      return { X, Y, s, hx: X + hx * s * o.dir, hy: Y - hv * s };
    };
    const holy = (x, z, o) => {
      const vz = VZ(x, z); if (vz < .8) return null;
      const X = W / 2 + VX(x, z) * F / vz, Y = hy - ((o.y0 ?? hW(x, z)) - camY) * F / vz, h = 1.8 * F / vz * (o.sc || 1);
      const hd = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, amb: .3 + .7 * (1 - night), ...o }) || { x: X, y: Y - h * .9, r: h * .07 };
      hd.h = h; hd.X = X; hd.Y = Y; return hd;
    };
    // a banner on its pole: the pole from its foot (screen) to its top; the cloth flies to the downwind side
    const banner = (X0, Y0, X1, Y1, s, col, ph, a = 1, wind = 1) => {
      c.save(); c.globalAlpha *= a;
      c.strokeStyle = rgb(lerp([58, 42, 28], haze, .1)); c.lineWidth = Math.max(1, .07 * s); c.lineCap = 'round'; c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X1, Y1); c.stroke();
      const L = Math.hypot(X1 - X0, Y1 - Y0) || 1, ux = (X1 - X0) / L, uy = (Y1 - Y0) / L, w = 1.5 * s, hh = .95 * s, N = 10;
      const top = [], bot = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, wv = Math.sin(t * 3.2 + ph + u * 4.6 - p * 30) * .13 * u * hh, droop = (1 - wind) * u * u * hh * 1.4;
        const bx = X1 + wind * u * w + (1 - wind) * u * w * .25, by = Y1 + wv + droop;
        top.push([bx, by]); bot.push([bx - ux * hh * .05 * u, by - uy * hh + Math.sin(t * 3.2 + ph + u * 4.6 + .7 - p * 30) * .1 * u * hh]);
      }
      c.beginPath(); top.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = N; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
      const g = c.createLinearGradient(X1, Y1, X1 + w, Y1); g.addColorStop(0, rgb(col)); g.addColorStop(.5, rgb(lerp(col, [255, 250, 236], .12))); g.addColorStop(1, rgb(lerp(col, [40, 30, 30], .2))); c.fillStyle = g; c.fill();
      c.strokeStyle = rgb(lerp(col, [30, 24, 20], .4), .5); c.lineWidth = Math.max(.5, .02 * s); c.stroke();
      c.restore();
    };
    // a near horse (or camel) with its rider, shaded: body and legs, the rider's cloak and head cloth
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
      if (!rider) return { X, Y, s };
      const ry = Y - bob - (kind === 3 ? .55 : 0) * s, rx = X + (kind === 3 ? -.25 : -.1) * s * dir, rp = new Path2D(); poly(rp, RIDER, rx, ry, s, dir);
      rp.moveTo(rx - .26 * s * dir, ry - 1.62 * s); rp.quadraticCurveTo(rx - .5 * s * dir, ry - 1.4 * s, rx - .42 * s * dir, ry - 1.12 * s); rp.lineTo(rx + .36 * s * dir, ry - 1.1 * s); rp.quadraticCurveTo(rx + .4 * s * dir, ry - 1.4 * s, rx + .22 * s * dir, ry - 1.62 * s); rp.closePath();
      const cg = c.createLinearGradient(rx - .3 * s * litSide, 0, rx + .3 * s * litSide, 0); cg.addColorStop(0, rgb(fogd(lit(cl, .9 * day + .1), vz, .8))); cg.addColorStop(1, rgb(fogd(lit(cl, .15 * day + .04, .85), vz, .8))); c.fillStyle = cg; c.fill(rp);
      c.strokeStyle = rgb(fogd(lit(cl, .1 * day + .03, .8), vz, .8)); c.lineWidth = Math.max(.8, .1 * s); c.beginPath(); c.moveTo(rx + .05 * s * dir, ry - 1.5 * s); c.lineTo(rx + .12 * s * dir, ry - .95 * s); c.stroke();
      const hc = fogd(lit(hd, .85 * day + .12), vz, .8); c.fillStyle = rgb(hc); c.beginPath(); c.ellipse(rx - .02 * s * dir, ry - 2.3 * s, .15 * s, .12 * s, 0, 0, TAU); c.fill();
      c.fillStyle = rgb(lerp(hc, [30, 22, 16], .3)); c.beginPath(); c.moveTo(rx - .1 * s * dir, ry - 2.32 * s); c.quadraticCurveTo(rx - .22 * s * dir, ry - 2.1 * s, rx - .2 * s * dir, ry - 1.9 * s); c.lineTo(rx - .1 * s * dir, ry - 1.95 * s); c.closePath(); c.fill();
      return { X: rx, Y: ry, s };
    };
    const BANCOL = [236, 230, 212]; // the banner's cloth: an invented pale colour (the texts give none)
    const dips = []; // a dip to black at each cut, a dip to gold at the vision
    CUTS.forEach((d) => dips.push(bump(p, ...d)));
    const dipK = Math.max(...dips), goldK = bump(p, ...GOLDCUT);

    // ----- the ground near the camera: stones, dry tufts and thorn scrub on a fixed world grid (they keep their places) -----
    { const G = 2.6, R0 = 80, fwd = [sa, ca], i0 = Math.floor((cx - R0) / G), i1 = Math.ceil((cx + R0) / G), j0 = Math.floor((cz - R0) / G), j1 = Math.ceil((cz + R0) / G);
      const tuftP = new Path2D(), stoneP = new Path2D(), stoneT = new Path2D(), shP = new Path2D(), dens = north ? .55 : .3;
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const hh = hash(i, j, 7); if (hh > dens) continue;
        const x = (i + hash(i, j, 1)) * G, z = (j + hash(i, j, 2)) * G, vz = VZ(x, z); if (vz < 1.2 || vz > R0) continue;
        if (!north && ((x > MOS[0] - 1 && x < MOS[1] + 1 && z > MOS[2] - 1 && z < MOS[3] + 1) || st.houses.some((H) => x > H[0] - .5 && x < H[1] + .5 && z > H[2] - .5 && z < H[3] + .5))) continue;
        if (north && p >= .3 && Math.abs(x) < 70 && z > -32 && z < 24) { if (hh > .2) continue; }
        const s = F / vz, X = W / 2 + VX(x, z) * F / vz; if (X < -20 || X > W + 20) continue;
        const Y = hy - (hW(x, z) - camY) * F / vz, k = hash(i, j, 3), r = (.12 + .35 * k * k) * s;
        if (r < .6) continue;
        if (hh < dens * .45) { // a stone, its top in the light
          const w = r * (1.2 + k), hgt = r * (.55 + .4 * hash(i, j, 4));
          shP.moveTo(X + w * 1.3, Y); shP.ellipse(X + w * .4 * -litSide, Y, w * 1.3, hgt * .35, 0, 0, TAU);
          stoneP.moveTo(X - w, Y); stoneP.bezierCurveTo(X - w, Y - hgt * .9, X + w * .7, Y - hgt * 1.1, X + w, Y); stoneP.closePath();
          stoneT.moveTo(X - w * .7, Y - hgt * .45); stoneT.bezierCurveTo(X - w * .5, Y - hgt * .95, X + w * .4, Y - hgt * 1.0, X + w * .55, Y - hgt * .5); stoneT.quadraticCurveTo(X, Y - hgt * .62, X - w * .7, Y - hgt * .45); stoneT.closePath();
        } else { // a dry tuft or a low thorn bush
          for (let q = 0; q < 6; q++) { const a = (q / 5 - .5) * 1.5 + (hash(i, j, q) - .5) * .4, L = r * (1.4 + hash(q, i, j)); tuftP.moveTo(X + (q - 2.5) * r * .12, Y); tuftP.quadraticCurveTo(X + Math.sin(a) * L * .4, Y - L * .6, X + Math.sin(a) * L, Y - Math.cos(a) * L * .9); }
        }
      }
      c.fillStyle = rgb(shCol, .3 * (.4 + .6 * day)); c.fill(shP);
      const stc = lit(north ? [150, 128, 100] : [128, 104, 84], .3 * day + .06, .85), stt = lit(north ? [226, 214, 188] : [206, 186, 150], day + .1, 1);
      c.fillStyle = rgb(stc); c.fill(stoneP); c.fillStyle = rgb(lerp(stc, stt, .55), .8); c.fill(stoneT);
      c.strokeStyle = rgb(lit(north ? [150, 132, 82] : [120, 112, 70], .7 * day + .1, 1), .85); c.lineWidth = Math.max(.7, F / 900); c.lineCap = 'round'; c.stroke(tuftP);
    }
    if (north) {
      // ================= al-Balqa' =================
      // trees: a trunk and a dark rounded crown; far ones a dab
      st.trees.forEach(([x, z, r, k]) => { const vz = VZ(x, z); if (vz < 3 || vz > 4500) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -60 || X > W + 60) return;
        items.push([vz, () => {
          const s = F / vz, y = hW(x, z), Y = hy - (y - camY) * F / vz, hh = r * (1 - flatN), col = fogd(lit(k < .5 ? [52, 66, 40] : [70, 80, 50], .45 * day + .08, .9), vz, .92), top = fogd(lit([118, 128, 76], day + .1, 1), vz, .92);
          if (s * hh < 1.5) { c.fillStyle = rgb(col); c.fillRect(X - 1, Y - Math.max(1, s * hh), 2, Math.max(1, s * hh)); return; }
          c.fillStyle = rgb(shCol, .25); c.beginPath(); c.ellipse(X + shD[0] * s * hh * .3, Y, r * s * .9, r * s * .2, 0, 0, TAU); c.fill();
          c.strokeStyle = rgb(fogd(lit([88, 70, 52], .4 * day + .1, .9), vz, .92)); c.lineWidth = Math.max(.8, .25 * s); c.beginPath(); c.moveTo(X, Y); c.lineTo(X + (k - .5) * .3 * s, Y - hh * .45 * s); c.stroke();
          for (let j = 0; j < 4; j++) { const ox = (hash(j, k) - .5) * r * .9, oy = hh * (.55 + .25 * hash(k, j)); c.fillStyle = rgb(j < 2 ? col : lerp(col, top, .35)); c.beginPath(); c.ellipse(X + ox * s, Y - oy * s, r * s * (.42 + .2 * hash(j, 3)), r * s * (.3 + .12 * hash(j, 5)), 0, 0, TAU); c.fill(); }
          c.fillStyle = rgb(top, .3); c.beginPath(); c.ellipse(X - litSide * -r * .15 * s, Y - hh * .8 * s, r * s * .35, r * s * .14, 0, 0, TAU); c.fill();
        }]); });
      draw();
      // ----- the crowds, batched: far to near bands -----
      const BANDS = [120, 400, 1400], bodyM = BANDS.map(() => new Path2D()), bodyR = BANDS.map(() => new Path2D()), legP = new Path2D(), spearP = new Path2D(), hdP = new Path2D();
      const crowd = (side, kind, x, z, dir, ph, moving) => {
        const vz = VZ(x, z); if (vz < 2) return; const X = W / 2 + VX(x, z) * F / vz; if (X < -40 || X > W + 40) return;
        const Y = hy - (hW(x, z) - camY) * F / vz, s = F / vz, pa = (side ? bodyR : bodyM)[vz < BANDS[0] ? 0 : vz < BANDS[1] ? 1 : 2];
        const hpx = 1.8 * s;
        if (hpx > 30) { const o = crowdNear[side]; items.push([vz, () => { if (kind >= 2) mount(x, z, dir, ph, moving, o.cl(x), o.hd(x), kind, kind === 2 || side === 0); else if (side) { const r = person(x, z, { a: 'front', dir: 1, cl: o.cl(x), helm: 1, arms: [[.22, 1.0], [-.22, .95]] }); if (r) { c.strokeStyle = rgb(fogd(lit([80, 70, 62], .6 * day + .1), vz)); c.lineWidth = Math.max(.8, .05 * r.s); c.beginPath(); c.moveTo(r.X + .28 * r.s, r.Y - .3 * r.s); c.lineTo(r.X + .32 * r.s, r.Y - 3.1 * r.s); c.stroke(); } } else { shadow(x, z, 1.7, .5, .24); person(x, z, { a: 'stand', dir, cl: o.cl(x), hd: o.hd(x), lean: moving ? .05 : 0, rim: .12 }); } }]); return; }
        if (hpx < 4) { const w = Math.max(.9, (kind >= 2 ? 1.9 : .55) * s); pa.rect(X - w / 2, Y - Math.max(1.1, (kind >= 2 ? 2.3 : 1.8) * s), w, Math.max(1.1, (kind >= 2 ? 2.3 : 1.8) * s)); if (side && kind === 1 && s > .7) { spearP.moveTo(X + .2 * s, Y); spearP.lineTo(X + .3 * s, Y - 3.2 * s); } return; }
        const bob = moving ? Math.abs(Math.sin(ph)) * .04 * s : 0;
        if (kind === 2) {
          poly(pa, HORSE, X, Y - bob, s, dir); poly(pa, RIDER, X - .1 * s * dir, Y - bob, s, dir);
          const sw = moving ? .5 : .08;
          [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o]) => { const a = Math.sin(ph + o) * sw; legP.moveTo(X + hu * s * dir, Y - 1.12 * s); legP.lineTo(X + (hu + a * .5) * s * dir, Y - .52 * s + Math.abs(a) * .2 * s); legP.lineTo(X + (hu + a * .3) * s * dir, Y); });
          if (side) { spearP.moveTo(X - .1 * s * dir, Y - 1.9 * s); spearP.lineTo(X + 1.4 * s * dir, Y - 3.4 * s); } else if (hpx > 9) { hdP.moveTo(X - .02 * s * dir + .14 * s, Y - 2.3 * s - bob); hdP.ellipse(X - .02 * s * dir, Y - 2.3 * s - bob, .14 * s, .11 * s, 0, 0, TAU); }
        } else if (kind === 3) {
          poly(pa, CAMEL, X, Y, s, dir);
          [[.68, 0], [.8, 1.6], [-.72, 3.1], [-.84, 4.7]].forEach(([hu, o]) => { legP.moveTo(X + hu * s * dir, Y - 1.28 * s); legP.lineTo(X + (hu + Math.sin(ph + o) * (moving ? .25 : .03)) * s * dir, Y); });
        } else {
          poly(pa, side ? MANF : hpx < 14 ? MANS : MAN, X, Y - bob, s, dir, moving ? .08 : 0);
          if (side) { spearP.moveTo(X + .22 * s, Y - .3 * s); spearP.lineTo(X + .3 * s, Y - 3.3 * s); } else if (hpx > 9) { hdP.moveTo(X + .03 * dir * s + .14 * s, Y - 1.68 * s - bob); hdP.ellipse(X + .03 * dir * s, Y - 1.68 * s - bob, .14 * s, .11 * s, 0, 0, TAU); }
        }
      };
      const crowdNear = [{ cl: (x) => CL[Math.abs(Math.round(x * 7)) % 7], hd: (x) => HD[Math.abs(Math.round(x * 3)) % 7] }, { cl: (x) => RCL[Math.abs(Math.round(x * 5)) % 5], hd: () => HELM }];
      const adv = ease.io(seg(p, .34, .42)), push = ease.io(seg(p, .38, .42));
      if (p < .3) { // the column on the road
        const s0 = sHead(p);
        { const zz = s0, xx = pathX(zz), vz = VZ(xx, zz); if (vz > 2) items.push([vz - .01, () => { const s = F / vz; if (s < 2) return; const X = W / 2 + VX(xx, zz) * F / vz, Y = hy - (hW(xx, zz) - camY) * F / vz; banner(X + .1 * s, Y - 1.7 * s, X + .16 * s, Y - 5.8 * s, s, fogd(lit(BANCOL, .85 * day + .2), vz, .7), 1); }]); }
        st.army.forEach(([i, lane, kind, , , k]) => { const zz = s0 - i * 5.5 - (i ? 10 : 0), xx = pathX(zz) + lane; const tx = pathX(zz + 5) - pathX(zz - 5); const dv = VX(xx + tx, zz + 10) / Math.max(1, VZ(xx + tx, zz + 10)) - VX(xx, zz) / Math.max(1, VZ(xx, zz)); crowd(0, kind, xx, zz, dv >= 0 ? 1 : -1, p * 900 + k * 9, true); });
      } else {
        st.lines.forEach(([x, z, kind, k]) => crowd(0, kind, x, z + 8 * push + Math.sin(t * 1.3 + k * 9) * .15 * push, 1, k * 9 + p * 300, push > 0 && push < 1));
      }
      if (p > .25) st.host.forEach(([x, z, kind, k, b, zf]) => { const zz = b >= 0 ? z - adv * c01(1 - Math.abs(b - 7) / 9) * (zf - 21 - Math.abs(x) * .04) : z - 120 * adv; crowd(1, kind, x, zz + Math.sin(t * 1.1 + k * 9) * .2 * adv, -1, k * 9 + p * 400, adv > 0 && adv < 1); });
      const bodyTone = (side, b) => rgb(lerp(side ? lerp([70, 64, 68], [92, 54, 48], .4) : [108, 86, 62], haze, Math.min(.8, fogA([60, 240, 900][b]))).map((v) => v * (.55 + .45 * day)));
      [2, 1, 0].forEach((b) => { c.fillStyle = bodyTone(1, b); c.fill(bodyR[b]); c.fillStyle = bodyTone(0, b); c.fill(bodyM[b]); });
      c.strokeStyle = rgb([34, 26, 20], .85); c.lineWidth = Math.max(.7, F / 1600); c.stroke(legP);
      c.strokeStyle = rgb(lerp([70, 64, 60], haze, .3), .7); c.lineWidth = .8; c.stroke(spearP);
      c.fillStyle = rgb(lerp(lit([160, 128, 86], .8 * day + .1), haze, .15)); c.fill(hdP);
      // the host's banners above its blocks
      if (p > .25) st.hban.forEach(([x, z, col, k, b, zf]) => { const zz = z - adv * c01(1 - Math.abs(b - 7) / 9) * (zf - 21); const vz = VZ(x, zz); if (vz < 3) return; const X = W / 2 + VX(x, zz) * F / vz; if (X < -40 || X > W + 40) return; const s = F / vz, Y = hy - (hW(x, zz) - camY) * F / vz; if (s < .25) return; banner(X, Y, X + .1 * s, Y - 5.4 * s, s * 1.1, fogd(lit(col, .8 * day + .2), vz, .85), k * 9, 1, .9); });
      // ----- Ja'far and the banner -----
      const jz = mix(J0[1], JF[1], push), jx = 0;
      const ride = p < .36, dis = seg(p, .358, .372); // he gets down from his horse; the horse is led back out of the line
      const near = [];
      if (p >= .3) {
        if (ride) { // riding at the front of the lines, the banner up
          items.push([VZ(jx, jz), () => {
            const vz = VZ(jx, jz), s = F / vz, X = W / 2 + VX(jx, jz) * F / vz, Y = hy - (hW(jx, jz) - camY) * F / vz, pa = new Path2D();
            poly(pa, HORSE, X, Y, s, 1); c.fillStyle = rgb(fogd(lit([84, 60, 44], .5 * day + .1), vz, .8)); c.fill(pa);
            const lp = new Path2D(); [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu]) => { lp.moveTo(X + hu * s, Y - 1.12 * s); lp.lineTo(X + hu * s, Y); }); c.strokeStyle = rgb([40, 30, 22]); c.lineWidth = Math.max(.8, .09 * s); c.stroke(lp);
            const rp = new Path2D(); poly(rp, RIDER, X - .1 * s, Y, s, 1); c.fillStyle = rgb(fogd(lit(CL[0], .6 * day + .1), vz, .8)); c.fill(rp);
            c.fillStyle = rgb(fogd(lit(HD[0], .8 * day + .12), vz, .8)); c.beginPath(); c.ellipse(X - .1 * s, Y - 2.3 * s, .15 * s, .12 * s, 0, 0, TAU); c.fill();
            banner(X + .1 * s, Y - 1.6 * s, X + .14 * s, Y - 5.6 * s, s, fogd(lit(BANCOL, .85 * day + .2), vz, .7), 1);
          }]);
        } else {
          const hk = smooth(seg(p, .372, .4)); // the horse, led back through the ranks to the left
          if (hk < 1) items.push([VZ(jx - 1.4 - hk * 30, jz - hk * 26), () => { const hx = jx - 1.4 - hk * 30, hz = jz - hk * 26, vz = VZ(hx, hz); if (vz < 1) return; const s = F / vz, X = W / 2 + VX(hx, hz) * F / vz, Y = hy - (hW(hx, hz) - camY) * F / vz, pa = new Path2D(); c.globalAlpha = 1 - smooth(seg(hk, .7, 1)); poly(pa, HORSE, X, Y, s, -1); c.fillStyle = rgb(fogd(lit([84, 60, 44], .5 * day + .1), vz, .8)); c.fill(pa); const lp = new Path2D(); [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o]) => { const a = Math.sin(p * 900 + o) * .4 * (hk > 0 && hk < 1); lp.moveTo(X - hu * s, Y - 1.12 * s); lp.lineTo(X - (hu + a * .3) * s, Y); }); c.strokeStyle = rgb([40, 30, 22]); c.lineWidth = Math.max(.8, .09 * s); c.stroke(lp); c.globalAlpha = 1; }]);
          near.push('j');
        }
      }
      // the banner: Ja'far holds it high (.40), gathers it into his arms (.43), goes down to his knees with it (.455), bows over
      // it (.48); Zayd lifts it from his arms (.547) and goes down with it (.566); Ibn Rawaha lifts it (.588)
      const jHold = smooth(seg(p, .43, .452)), jKneel = smooth(seg(p, .455, .478)), jBow = smooth(seg(p, .48, .5)), jLie = smooth(seg(p, .565, .585));
      const zLift = smooth(seg(p, .547, .558)), zKneel = smooth(seg(p, .568, .58)), zBow = smooth(seg(p, .58, .59)), rLift = smooth(seg(p, .59, .6));
      const ZD = [mix(-2.2, -.7, smooth(seg(p, .536, .547))), jz + .45], RD = [mix(2.6, .75, smooth(seg(p, .58, .59))), jz + .6];
      if (p > .38) {
        // the near fight round the banner: Muslims at his sides, the front ranks of Rome before him
        const fight = bump(p, .4, .43, .6, .64);
        st.nearM.forEach(([x, z, cl, hd, k], i) => { const zz = z + 8 * push - 8 + Math.sin(t * 1.6 + k * 7) * .12 * fight, xx = x + Math.sin(t * 1.2 + k * 11) * .1 * fight; items.push([VZ(xx, zz), () => { shadow(xx, zz, 1.7, .5, .26); const up = k > .45; person(xx, zz, { a: 'stand', dir: 1, cl, hd, lean: .05 * Math.sin(t * 2 + k * 9) * fight, arms: up ? [[.26, 1.62 + .12 * Math.sin(t * 3 + k * 9) * fight]] : undefined, blade: up ? .35 + .5 * Math.sin(t * 3 + k * 9) * fight : 0 }); }]); });
        st.nearR.forEach(([x, z, cl, k], i) => { const zz = z + mix(40, 0, adv) - (fight > 0 ? .5 * Math.sin(t * 1.4 + k * 9) * fight : 0), xx = x; items.push([VZ(xx, zz), () => { shadow(xx, zz, 1.7, .5, .24); const r = person(xx, zz, { a: 'front', dir: 1, cl, helm: 1, arms: [[.22, 1.0], [-.22, .95]] }); if (!r) return; const s = r.s; c.strokeStyle = rgb(fogd(lit([80, 70, 62], .6 * day + .1), VZ(xx, zz))); c.lineWidth = Math.max(.8, .05 * s); c.beginPath(); c.moveTo(r.X + .28 * s, r.Y - .5 * s); c.lineTo(r.X + (.3 - .9 - .3 * Math.sin(t * 2 + k * 9) * fight) * s, r.Y - 3.0 * s); c.stroke(); c.fillStyle = rgb(fogd(lit([92, 58, 42], .45 * day + .08), VZ(xx, zz))); c.beginPath(); c.ellipse(r.X - .05 * s, r.Y - .98 * s, .27 * s, .34 * s, 0, 0, TAU); c.fill(); c.strokeStyle = rgb(fogd(lit([170, 140, 90], .7 * day + .1), VZ(xx, zz)), .6); c.lineWidth = Math.max(.6, .03 * s); c.stroke(); c.fillStyle = rgb(fogd(lit([190, 160, 100], .9 * day + .1), VZ(xx, zz))); c.beginPath(); c.arc(r.X - .05 * s, r.Y - .98 * s, .06 * s, 0, TAU); c.fill(); }]); });
      }
      // one holder of the banner: the pose blends stand → kneel → bowed (→ lying), the pole goes from the hands to the arms
      const bearer = (x, z, o) => items.push([VZ(x, z) - .01, () => {
        const [ka, kb, kk] = o.kneel < 1 ? ['stand', 'kneel', o.kneel] : o.lie > 0 ? ['kbow', 'lie', o.lie] : ['kneel', 'kbow', o.bow];
        shadow(x, z, 1.7 * (1 - .6 * o.kneel), .55, .3);
        const sh = lerp(SHO[ka], SHO[kb], kk), hold = o.hold, carry = o.pole > 0;
        const up = [[.24, sh[1] + .3], [.22, sh[1] - .12]], hug = [[.34, sh[1] - .02], [.3, sh[1] - .22]];
        const arms = carry ? up.map((q, i) => lerp(q, hug[i], hold)) : undefined;
        const r = person(x, z, { a: ka, b: kb, k: kk, dir: 1, cl: o.cl, hd: o.hd, arms, rim: .3 * day }); if (!r || !carry) return;
        const s = r.s, bl = lerp(o.kneel < 1 ? [.3, .5 * (1 - o.kneel)] : [.36, 0], [.44, 0], o.kneel < 1 ? 0 : o.bow), pl = (.04 + .08 * hold + .08 * o.kneel + .2 * (o.kneel < 1 ? 0 : o.bow)) * (o.lean ?? 1) + (o.tilt || 0);
        const bx = r.X + bl[0] * s, by = r.Y - bl[1] * s, L = 4.1;
        banner(bx, by, bx + Math.sin(pl) * L * s, by - Math.cos(pl) * L * s, s, fogd(lit(BANCOL, .85 * day + .2), VZ(x, z), .7), o.ph, o.pole, 1 - .55 * (o.kneel < 1 ? 0 : o.bow));
      }]);
      if (near.length) {
        const zHas = zLift > .5 && rLift < .5, rHas = rLift >= .5;
        bearer(jx, jz, { kneel: jKneel, bow: jBow, lie: jLie, hold: jHold, cl: CL[0], hd: HD[0], pole: zLift > .5 ? 0 : 1, ph: 1 });
        if (p > .53) {
          bearer(ZD[0], ZD[1], { kneel: zKneel, bow: zBow, lie: 0, hold: mix(0, 1, smooth(seg(p, .56, .568))), cl: CL[3], hd: HD[2], pole: zHas ? 1 : 0, ph: 2, tilt: (1 - zLift) * .8 });
          bearer(RD[0], RD[1], { kneel: 0, bow: 0, lie: 0, hold: 0, cl: CL[5], hd: HD[4], pole: rHas ? 1 : 0, ph: 3, tilt: (1 - rLift) * .7 });
        }
        // the wings of light: they rise above him and go up, two wings of light and nothing between them but light
        const wg = bump(p, .488, .51, .548, .585);
        if (wg > 0) items.push([-1, () => {
          const vz = VZ(jx, jz), s = F / vz, rise = ease.in(seg(p, .5, .585)), X = W / 2 + VX(jx + .3, jz) * F / vz - rise * 2 * s, Y0 = hy - (hW(jx, jz) + 1.1 - camY) * F / vz, Y = Y0 - (.6 + rise * 9) * s, op = smooth(seg(p, .488, .515)), span = mix(.35, .85, ease.out(seg(p, .49, .53)));
          c.save(); c.globalCompositeOperation = 'lighter';
          glow(X, Y0, 2.4 * s, [255, 226, 170], .25 * wg);
          c.save(); c.translate(X, (Y0 + Y) / 2 - 2 * s); c.scale(1, Math.max(1, (Y0 - Y) / s + 4) / 1.2); const q0 = c.createRadialGradient(0, 0, 0, 0, 0, .6 * s); q0.addColorStop(0, `rgba(255,238,200,${.16 * wg})`); q0.addColorStop(1, 'rgba(255,238,200,0)'); c.fillStyle = q0; c.fillRect(-.6 * s, -.6 * s, 1.2 * s, 1.2 * s); c.restore();
          [-1, 1].forEach((side) => {
            glow(X + side * 1.1 * s * span, Y - .5 * s, 2.2 * s * span, [255, 232, 186], .2 * wg * op);
            for (let f = 0; f < 9; f++) { // each wing: nine broad feathers of light, the outer ones longest, sweeping out and up
              const u = f / 8, a0 = mix(.3, 1.3, u) * span + .1 * Math.sin(t * 1.3 + f) * (1 - u), len = mix(2.8, 1.2, u) * s * span, x0 = X + side * (.45 + .08 * f) * s, y0 = Y + (.06 * f) * s;
              const ex = x0 + side * Math.sin(a0) * len, ey = y0 - Math.cos(a0) * len, w = mix(.5, .34, u) * s;
              const g = c.createLinearGradient(x0, y0, ex, ey); g.addColorStop(0, `rgba(255,242,212,${.2 * wg * op})`); g.addColorStop(.6, `rgba(255,234,190,${.16 * wg * op})`); g.addColorStop(1, 'rgba(255,230,180,0)');
              const nx = -(ey - y0) / len, ny = (ex - x0) / len;
              c.fillStyle = g; c.beginPath(); c.moveTo(x0 - nx * w * .4, y0 - ny * w * .4); c.bezierCurveTo(x0 + (ex - x0) * .35 + nx * w * side, y0 + (ey - y0) * .35 + ny * w * side, ex + nx * w * .5 * side, ey + ny * w * .5 * side, ex, ey); c.bezierCurveTo(ex - nx * w * .2 * side, ey - ny * w * .2 * side, x0 + (ex - x0) * .4 - nx * w * .3 * side, y0 + (ey - y0) * .4 - ny * w * .3 * side, x0 + nx * w * .4, y0 + ny * w * .4); c.closePath(); c.fill();
            }
          });
          for (let j = 0; j < 22; j++) { const u = (hash(j, 1) + t * (.04 + .04 * hash(j, 2)) + p * 6) % 1, x = X + (hash(j, 3) - .5) * 4 * s * span, y = Y0 - u * 9 * s; c.fillStyle = rgb([255, 244, 214], .45 * wg * Math.sin(u * Math.PI)); c.beginPath(); c.arc(x, y, Math.max(.6, .025 * s), 0, TAU); c.fill(); }
          c.restore();
        }]);
      }
      draw();
      // dust along the meeting line, lit from behind by the low sun
      const dz = bump(p, .4, .43, .6, .63) + .4 * bump(p, .33, .38, .42, .46);
      if (dz > 0) st.dust.forEach(([x, z, k]) => { const zz = z + mix(30, 0, adv), vz = VZ(x, zz); if (vz < 4) return; const s = F / vz, X = W / 2 + VX(x + Math.sin(t * .3 + k * 9) * 2, zz) * F / vz, Y = hy - (hW(x, zz) + .6 + k * 1.4 - camY) * F / vz, r = (1.6 + 2.4 * k) * s; c.save(); c.translate(X, Y); c.scale(1.7, 1); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); const dc = lerp(haze, sunC, .35); g.addColorStop(0, rgb(dc, .12 * dz * (.5 + .5 * k))); g.addColorStop(1, rgb(dc, 0)); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore(); });
    } else {
      // ================= Medina =================
      const sink = (z) => 1 - flatM * smooth(c01((z - SINK0) / 30)); // in the vision every height north of the yard sinks
      // houses, with a door on the south face, lit at night
      st.houses.forEach(([x0, x1, z0, z1, h, col, lamp, dx]) => {
        const hh = h * sink(z0); if (hh < .05) return;
        slab(x0, x1, z0, z1, hh, col, 0, 4); slab(x0 - .1, x1 + .1, z0 - .1, z1 + .1, .25 * sink(z0), lerp(col, [236, 214, 176], .2), hh, 0, VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .05);
        if (cz > z0) return;
        items.push([VZ((x0 + x1) / 2, (z0 + z1) / 2) + Math.max(x1 - x0, z1 - z0) * .35 - .1, () => {
          const zr = VZ(dx, z0); if (zr < 1.5) return; const a = P3(dx - .5, 0, z0 - .01), b = P3(dx + .5, Math.min(hh, 1.95), z0 - .01), s = F / zr;
          if (s < 1.6) return;
          const lamp2 = lamp ? night : dx === DOORP || dx === DOORJ ? night : 0, inn = lerp(wallC([66, 50, 38], .05, zr), [255, 186, 104], .8 * lamp2);
          c.fillStyle = rgb(inn); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
          if (s > 9) { c.fillStyle = rgb(wallC([88, 66, 44], .3, zr)); for (let j = 0; j < Math.floor((x1 - x0) / .9); j++) { const q = P3(x0 + .45 + j * .9, hh - .3, z0 - .02); c.fillRect(q[0] - .08 * s, q[1] - .08 * s, .16 * s, .16 * s); } }
          if (dx === DOORP && night > .05) { // he sits inside his door, a sleeve to his veil
            c.save(); c.beginPath(); c.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); c.clip();
            Holy.draw(c, { who: 'prophet', pose: 'sit', x: (a[0] + b[0]) / 2, y: a[1] + .02 * s, h: 1.8 * s * .92, t, amb: .55, glow: .45, arms: [[.06, -.56], [-.1, -.3]] });
            c.restore();
          }
          if (dx === DOORJ && night > .05) { c.save(); c.beginPath(); c.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); c.clip(); c.translate((a[0] + b[0]) / 2 + .2 * s, a[1]); c.scale(s * -.9, -s * .9); const pts = SH.bow; c.fillStyle = rgb([70, 46, 34]); c.beginPath(); for (let i = 0; i < 16; i++) i ? c.lineTo(pts[2 * i], pts[2 * i + 1]) : c.moveTo(pts[0], pts[1]); c.closePath(); c.fill(); c.restore(); }
          if (lamp2 > 0) { glow((a[0] + b[0]) / 2, a[1] - .6 * s, 3.4 * s, [255, 170, 90], .34 * lamp2); c.save(); c.globalCompositeOperation = 'lighter'; c.translate((a[0] + b[0]) / 2, a[1]); c.scale(1, .3); const g = c.createRadialGradient(0, 0, 0, 0, 0, 4.4 * s); g.addColorStop(0, `rgba(255,170,90,${.32 * lamp2})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-4.4 * s, -4.4 * s, 8.8 * s, 8.8 * s); c.restore(); }
        }]);
      });
      // palms
      st.palms.forEach(([x, z, ht0, lean, k]) => {
        const ht = ht0 * sink(z); if (ht < .3) return; const zr = VZ(x, z); if (zr < 1.5) return; const X = W / 2 + VX(x, z) * F / zr; if (X < -ht * F / zr || X > W + ht * F / zr) return;
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
      // the mosque: the yard, its low walls (a gate in the north wall), the shade of fronds along the south wall, the minbar
      const [mx0, mx1, mz0, mz1] = MOS, alb = [200, 166, 122];
      if (VZ(0, 0) > -40) {
        quad([[mx0, .01, mz0], [mx1, .01, mz0], [mx1, .01, mz1], [mx0, .01, mz1]], rgb(fogd(lit([226, 206, 166], Math.max(0, sun[1]) * .9 * day, 1), 20)));
        quad([[ROOF[0], .015, ROOF[2]], [ROOF[1], .015, ROOF[2]], [ROOF[1], .015, ROOF[3]], [ROOF[0], .015, ROOF[3]]], rgb(lit([150, 128, 96], .08, .85), .6));
        const wk = sink(mz1);
        slab(mx0 - .5, mx0, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx1, mx1 + .5, mz0, mz1 + .5, WALLH, alb, 0, 3); slab(mx0 - .5, mx1 + .5, mz0 - .5, mz0, WALLH, alb, 0, 3);
        slab(mx0 - .5, -1.6, mz1, mz1 + .5, WALLH * wk, alb, 0, 3); slab(1.6, mx1 + .5, mz1, mz1 + .5, WALLH * wk, alb, 0, 3);
        for (let j = 0; j < 10; j++) { const x = mix(ROOF[0] + .4, ROOF[1] - .4, j / 9); [ROOF[3] + .2, ROOF[2] + .4].forEach((z, i) => { const zr = VZ(x, z); if (zr < 1) return; items.push([zr + (i ? .3 : 0), () => { const a = P3(x, 0, z), b = P3(x, ROOF[4], z), s = F / zr; c.fillStyle = rgb(fogd(lit([120, 96, 72], Math.max(0, sun[0] * litSide) * .6 * day + .1, .9), zr)); c.beginPath(); tube(c, [[a[0], a[1]], [b[0], b[1]]], Math.max(1, .3 * s), Math.max(1, .24 * s)); c.fill(); }]); }); }
        items.push([VZ(0, ROOF[3]) - .2, () => { // the roof: its underside from below, the ragged edge of the fronds, light through the gaps
          const col = camY > ROOF[4] ? lit([110, 104, 62], Math.max(0, sun[1]) * day + .12, 1) : lit([70, 58, 40], .05, .8);
          quad([[ROOF[0] - .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[2] - .3], [ROOF[1] + .3, ROOF[4], ROOF[3] + .3], [ROOF[0] - .3, ROOF[4], ROOF[3] + .3]], rgb(col));
          c.fillStyle = rgb(lerp(col, [120, 100, 60], .35)); c.beginPath(); { let first = true; for (let j = 0; j <= 480; j++) { const x = mix(ROOF[0] - .3, ROOF[1] + .3, j / 480), zr = VZ(x, ROOF[3] + .3); if (zr < 1) continue; const a = P3(x, ROOF[4], ROOF[3] + .3), l = (.03 + .07 * hash(j, 5)) * F / zr; if (first) { c.moveTo(a[0], a[1]); first = false; } c.lineTo(a[0] + (hash(j, 6) - .5) * .02 * F / zr, a[1] + (j % 2 ? l : 0)); } const e = P3(ROOF[1] + .3, ROOF[4], ROOF[3] + .3); c.lineTo(e[0], e[1]); } c.closePath(); c.fill();
          const sh = bump(p, .8, .82, .87, .875); // the low sun from the west warms the shade at the minbar
          if (sh > 0) { const q = P3(ROOF[0] - 2, 1.5, -9.5); glow(q[0], q[1], W * .5, [255, 170, 100], .12 * sh); }
        }]);
        // the minbar: three steps of wood against the south wall
        const wood = [128, 92, 60];
        slab(-.5, .5, -10.9, -10.35, .38, wood, 0, 0, VZ(0, -10.6) + .05); slab(-.5, .5, -11.45, -10.9, .76, wood, 0, 0, VZ(0, -11.15) + .05); slab(-.5, .5, -12, -11.45, 1.14, wood, 0, 0, VZ(0, -11.7) + .05);
      }
      // ----- the people of Medina -----
      if (p < .14) { // the army going out north on the road; the banner at its head
        const s0 = 150 + (p + .06) * 3200;
        st.army.forEach(([i, lane, kind, cl, hd, k]) => { const z = s0 - i * 4.5 - (i ? 8 : 0), x = ROADX(z) + lane * .9; if (VZ(x, z) < 2 || z < cz + 9) return;
          items.push([VZ(x, z), () => { const vz = VZ(x, z), s = F / vz, X = W / 2 + VX(x, z) * F / vz, Y = hy - (hW(x, z) - camY) * F / vz, ph = p * 1200 + k * 9;
            const fa = c01((vz - 15) / 8); if (fa <= 0) return; c.save(); c.globalAlpha = fa;
            if (s * 1.8 < 3) { c.fillStyle = rgb(fogd(lit(cl, .4 * day + .08), vz, .85)); c.fillRect(X - .5, Y - Math.max(1.2, s * 2), 1.2, Math.max(1.2, s * 2)); c.restore(); return; }
            shadow(x, z, kind ? 2.2 : 1.7, kind ? 1.1 : .5, .24);
            const r = kind ? mount(x, z, 1, ph, true, cl, hd, kind) : person(x, z, { a: 'stand', dir: 1, cl, hd, lean: .05, rim: .1 });
            if (i === 0 && r) banner(r.X + .2 * s, r.Y - 1.7 * s, r.X + .26 * s, r.Y - 5.8 * s, s, fogd(lit(BANCOL, .85 * day + .2), vz, .7), 1);
            c.restore();
          }]); });
        items.push([VZ(RISE[0], RISE[1]), () => { shadow(RISE[0], RISE[1], 1.8, .6, .3); holy(RISE[0], RISE[1], { pose: 'stand', glow: .12 }); }]);
      }
      if (p > .6 && p < .7) { // in the mosque: he looks north; then his sleeves go to his middle
        const pain = smooth(seg(p, .668, .69));
        items.push([VZ(SM[2][1], SM[2][3]), () => { const x = SM[2][1], z = SM[2][3]; shadow(x, z, 1.8, .6, .3); holy(x, z, { pose: 'stand', glow: .15 + .2 * flatM, arms: pain > 0 ? [[.07 * pain + .02, -.47], [-.07 * pain - .02, -.45]] : undefined }); }]);
      }
      if (p > .68 && p < .81) { // Ja'far's door: he sits before it, his sleeves on the boys' heads; Asma' sits by the door, bowed
        const pz = HOMEJ[2] - 1.1;
        items.push([VZ(DOORJ, pz) + 1.2, () => { const m = [[DOORJ - 1.5, .02, pz - 1], [DOORJ + 1.5, .02, pz - 1], [DOORJ + 1.5, .02, HOMEJ[2] - .1], [DOORJ - 1.5, .02, HOMEJ[2] - .1]]; quad(m, rgb(lit([176, 150, 96], .7 * day + .12, 1))); c.strokeStyle = rgb(lit([120, 96, 60], .5 * day + .1, .9), .6); c.lineWidth = 1; c.beginPath(); for (let j = 1; j < 14; j++) { const u = j / 14, a = P3(DOORJ - 1.5 + 3 * u, .02, pz - 1), b = P3(DOORJ - 1.5 + 3 * u, .02, HOMEJ[2] - .1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke(); }]);
        items.push([VZ(DOORJ, pz), () => { shadow(DOORJ, pz, 1.1, .7, .28); holy(DOORJ, pz, { pose: 'sit', glow: .2, arms: [[-.36, -.6 - .012 * Math.sin(t * 1.4)], [.34, -.55 + .012 * Math.sin(t * 1.4 + 1)]] }); }]);
        [[DOORJ - .76, pz - .14, .72, CL[2], HD[3]], [DOORJ + .76, pz - .12, .64, CL[5], HD[1]]].forEach(([x, z, sc, cl, hd]) => items.push([VZ(x, z) - .02, () => { shadow(x, z, 1.2, .35, .26); person(x, z, { a: 'front', dir: 1, sc, cl, hd, arms: [[.22, .8], [-.22, .82]] }); }]));
        items.push([VZ(DOORJ + 1.85, HOMEJ[2] - .45), () => { shadow(DOORJ + 1.85, HOMEJ[2] - .45, .9, .5, .26); person(DOORJ + 1.85, HOMEJ[2] - .45, { a: 'bow', dir: -1, cl: WCL[0], hd: WMN[0], wo: 1, arms: [[.3, .7]] }); }]);
      }
      if (p > .79 && p < .88) { // the minbar: he stands on it, the boy on the lowest step; the people sit before him
        items.push([VZ(0, -11.7) - .02, () => { holy(0, -11.7, { pose: 'stand', y0: 1.14, glow: .3, arms: [[-.16, -.46], [.18, -.5]] }); }]);
        items.push([VZ(0, -10.6) - .03, () => { person(0, -10.55, { a: 'sitF', dir: 1, sc: .52, y0: .38, cl: CL[2], hd: HD[3] }); }]);
        st.folk.forEach(([x, z, cl, hd, k]) => items.push([VZ(x, z), () => person(x, z, { a: 'sitF', dir: 1, cl, hd, nl: .8, lean: .02 * Math.sin(k * 9) })]));
      }
      if (p > .87) { // night: Fatima and two women carry food along the lane to Asma''s door
        const w = smooth(seg(p, .9, 1.0)), lane = [[21, -9.6], [27, -9.4], [31.8, -6.2], [32.6, -4.8]];
        const at = (u) => { const q = u * 3, i = Math.min(2, Math.floor(q)), f = q - i; return [mix(lane[i][0], lane[i + 1][0], f), mix(lane[i][1], lane[i + 1][1], f)]; };
        const walking = w > 0 && w < 1;
        [[0, 0, 0], [-.14, 1, -.5], [-.27, 2, .45]].forEach(([du, who, off]) => { const [x0, z0] = at(c01(w + du)), x = x0 + off * .4, z = z0 - Math.abs(off) * .9; items.push([VZ(x, z), () => {
          shadow(x, z, 1.6, .45, .2);
          if (!who) { const hd = holy(x, z, { who: 'fatima', pose: walking ? 'walk' : 'stand', phase: p * 160, glow: .4, arms: [[.14, -.5]] }); if (hd) { const s = hd.h / 1.8; c.fillStyle = rgb([92, 70, 50]); c.beginPath(); c.ellipse(hd.X + .17 * s, hd.Y - .9 * s, .2 * s, .07 * s, 0, 0, TAU); c.fill(); c.fillStyle = rgb([196, 182, 150]); c.beginPath(); c.ellipse(hd.X + .17 * s, hd.Y - .95 * s, .18 * s, .08 * s, 0, Math.PI, TAU); c.fill(); } return; }
          const r = person(x, z, { a: 'stand', dir: 1, cl: WCL[who], hd: WMN[who], wo: 1, lean: walking ? .04 : 0, arms: [[.28, 1.0]], rim: .2 }); if (r) { c.fillStyle = rgb([84, 64, 46]); c.beginPath(); c.ellipse(r.X + .3 * r.s, r.Y - 1.02 * r.s, .2 * r.s, .07 * r.s, 0, 0, TAU); c.fill(); }
        }]); });
      }
      draw();
      // the vision: with every height sunk, the field of Mu'ta shows on the horizon to the north
      if (flatM > .02) {
        const a = flatM, d = VZ(0, 900000) > 0, Xc = W / 2 + VX(-3, 900000) / Math.max(1, VZ(-3, 900000)) * F;
        if (d) {
          const wd = W * .34, Y = hy;
          c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(Xc, Y, 0, Xc, Y, wd); g.addColorStop(0, rgb([255, 214, 160], .28 * a)); g.addColorStop(1, rgb([255, 214, 160], 0)); c.fillStyle = g; c.fillRect(Xc - wd, Y - wd * .5, wd * 2, wd); c.restore();
          c.fillStyle = rgb([70, 58, 60], .75 * a);
          for (let j = 0; j < 260; j++) { const u = hash(j, 41) * 2 - 1, x = Xc + u * wd * .85, h2 = 1 + 2 * hash(j, 42); c.fillRect(x, Y - h2 - .6, 1, h2); }
          for (let j = 0; j < 9; j++) { const x = Xc + (hash(j, 51) * 2 - 1) * wd * .7, y = Y - 5; c.strokeStyle = rgb([60, 50, 46], .7 * a); c.lineWidth = .8; c.beginPath(); c.moveTo(x, Y); c.lineTo(x, y - 4); c.stroke(); c.fillStyle = rgb(j === 4 ? BANCOL : [[150, 40, 40], [110, 60, 120], [200, 170, 90]][j % 3], .8 * a); c.fillRect(x, y - 4, 4 + Math.sin(t * 3 + j) * .6, 2.6); }
          const wl = bump(p, .652, .662, .68, .69) * a; // the light that rose from him, far off
          if (wl > 0) { glow(Xc, Y - 14, 30, [255, 236, 190], .35 * wl); c.save(); c.globalCompositeOperation = 'lighter'; const q = c.createLinearGradient(0, Y, 0, Y - 120); q.addColorStop(0, rgb([255, 236, 190], .3 * wl)); q.addColorStop(1, rgb([255, 236, 190], 0)); c.fillStyle = q; c.fillRect(Xc - 3, Y - 120, 6, 120); c.restore(); }
        }
      }
      if (night > 0) { const g = c.createLinearGradient(0, hy + H * .04, 0, H); g.addColorStop(0, 'rgba(14,16,46,0)'); g.addColorStop(1, `rgba(8,16,44,${.5 * night})`); c.fillStyle = g; c.fillRect(0, hy, W, H - hy); }
    }
    // ----- grade: the edges close in a little; the cuts; the gold of the vision -----
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,12,30,0)'); vg.addColorStop(1, `rgba(10,12,30,${.16 + .2 * night})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (goldK > 0) { c.fillStyle = `rgba(255,236,196,${goldK})`; c.fillRect(0, 0, W, H); }
    if (dipK > 0) { c.fillStyle = `rgba(6,8,14,${dipK})`; c.fillRect(0, 0, W, H); }
  },
};
})();
