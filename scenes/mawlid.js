(() => {
// mawlid — «ليلة المولد»: the night of his birth and its dawn, as al-Sadiq (ع) tells it (Amali al-Saduq, majlis 48;
// al-Kafi 8:302). Four shots joined by dips through light or dark; everything follows p:
//   p −.05 → .47  Mecca before dawn from the western hills: the town dark round the Kaaba, and at the mouth of Shi'b
//                 Abi Talib one house with a lit window (Kafi 8:302: Fatima bint Asad with Amina). The camera comes in.
//      .14 → .26  light pours out of the house: window and door blaze, a shaft rises, the valley and the hills take
//                 its warmth («ثم خرج مني نور أضاء له كل شيء»).
//      .25 → .44  the camera lifts into the sky; stars are thrown across it («ورميت الشياطين بالنجوم»).
//      .36 → .47  the light runs east from the Hijaz; the camera follows it over the hills to the horizon («حتى بلغ
//                 المشرق») and the frame dips into the light.
//      .47 → .63  al-Mada'in: the Iwan of Kisra at night, the light behind it in the west; the palace shakes and
//                 fourteen merlons fall from its crown («وسقطت منه أربعة عشر شرفة»).
//      .63 → .775 Persia: the lake of Sawa sinks into its bed; the fire of a fire temple, not out for a thousand
//                 years, sinks to embers and smoke.
//      .775 → 1   Mecca at first light, Friday: by the Kaaba the idols lie on their faces («صبيحة مولد النبي»); the
//                 camera rises back to the hills over the town and the house in the Shi'b.
// No figure is drawn: the house shows only its lit window and door, and the newborn is never shown. The light is
// window spill, shafts and a wash over the land, never a ball. Iblis and the devils appear only as falling stars.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
function camAt(K, p) {
  let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const u = i + smooth(c01((p - K[i][0]) / (K[i + 1][0] - K[i][0])));
  return [crv(K.map((k) => k[1]), u), crv(K.map((k) => k[2]), u)];
}
// a pinhole camera: x right, y up, looking from eye to look; pj() leaves the screen point in L.X, L.Y (depth L.Z)
function lens(eye, look, F, cx, cy) {
  const fw = norm3(sub3(look, eye)), rt = norm3(cross3([0, 1, 0], fw)), up = cross3(fw, rt);
  const L = { eye, fw, rt, up, F, cx, cy, X: 0, Y: 0, Z: 0 };
  L.pj = (x, y, z) => {
    const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], zc = dx * fw[0] + dy * fw[1] + dz * fw[2];
    if (zc < .3) return false;
    const iz = F / zc; L.X = cx + (dx * rt[0] + dy * rt[1] + dz * rt[2]) * iz; L.Y = cy - (dx * up[0] + dy * up[1] + dz * up[2]) * iz; L.Z = zc; return true;
  };
  L.dirv = (v) => L.pj(eye[0] + v[0] * 1e5, eye[1] + v[1] * 1e5, eye[2] + v[2] * 1e5);
  L.dir = (az, el) => L.dirv([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]);
  L.pitch = Math.asin(Math.max(-.99, Math.min(.99, fw[1])));
  L.hy = cy + F * Math.tan(L.pitch);
  return L;
}
const WARM = [255, 208, 146], LIGHT = [255, 238, 205];
// a soft vertical shaft: gaussian across, fading toward both ends (no bright centre, so it never reads as a ball)
const SHAFT = (() => { const s = mk(64, 256), g = s.getContext('2d'), id = g.createImageData(64, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) { const u = (x - 31.5) / 32, v = y / 255, k = (y * 64 + x) * 4; id.data[k] = 255; id.data[k + 1] = 232; id.data[k + 2] = 186; id.data[k + 3] = 255 * Math.exp(-u * u * 7) * Math.min(1, v * 6) * (1 - v) ** 1.2; } g.putImageData(id, 0, 0); return s; })();
// a beam: gaussian across, brightest at its foot and fading upward (drawn rotated along a projected column)
const BEAM = (() => { const s = mk(64, 256), g = s.getContext('2d'), id = g.createImageData(64, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) { const u = (x - 31.5) / 32, v = y / 255, k = (y * 64 + x) * 4; id.data[k] = 255; id.data[k + 1] = 236; id.data[k + 2] = 196; id.data[k + 3] = 255 * Math.exp(-u * u * 6) * v ** 1.6 * Math.min(1, (1 - v) * 14); } g.putImageData(id, 0, 0); return s; })();
// value noise for the haze, the sky band and the crags
const NZ = (() => { const r = rng(1703), a = new Float32Array(4096); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();
const vn = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const h = (i, j) => NZ[((i & 63) * 64 + (j & 63)) & 4095], a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x, y) => { let s = 0, a = .5, f = 1; for (let i = 0; i < 4; i++) { s += a * vn(x * f, y * f); f *= 2; a *= .5; } return s / .9375; };
const rid = (x, y) => { let s = 0, a = .5, f = 1; for (let o = 0; o < 5; o++) { const n = 1 - Math.abs(2 * vn(x * f + o * 7.3, y * f - o * 3.1) - 1); s += a * n * n; a *= .5; f *= 2.03; } return s / .97; };

// ====================================================== MECCA ======================================================
// World in metres: x south (right of frame when looking east), y up, z east. The Kaaba at the origin; Abu Qubays and
// the hills east of it; the Shi'b, a narrow ravine cut east into them, the house of the birth at its mouth.
const HS = [-112, 282];
const shibX = (z) => -112 + 9 * Math.sin((z - 282) * .013) - .05 * Math.max(0, z - 282);
function crag(x, z) {
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
function mount(x, z) {
  let m = smooth(c01((z - 248 - 36 * Math.sin(x * .0065 + .4)) / 240)); // Abu Qubays and the hills behind it
  m = Math.max(m, smooth(c01((-z - 330 + 40 * Math.sin(x * .005)) / 240))); // the western hills the camera stands on
  m = Math.max(m, smooth(c01((Math.abs(x + 30) - 400 - 70 * Math.sin(z * .0045)) / 260))); // north and south
  if (z > 180 && m > 0) { const w = 22 + .07 * (z - 260), d = (x - shibX(z)) / w; m *= 1 - (1 - smooth(c01((z - 640) / 140))) * .94 * Math.exp(-d * d); }
  return m;
}
function height(x, z) {
  const m = mount(x, z);
  let h = 1.2 * Math.sin(x * .02 + z * .013) * Math.sin(z * .017 - x * .006);
  if (m > 0) h += m * (40 + 175 * rid(x * .0042 + 3, z * .0042) + 80 * Math.exp(-(((x - 70) / 220) ** 2 + ((z - 560) / 240) ** 2))) * (.6 + .4 * m) + 22 * crag(x * 1.6, z * 1.6) * m;
  return h;
}
// camera keys [p, eye, look]: A the night (to the dip into light), D the dawn
const KA = [
  [-.06, [200, 118, -470], [-40, 70, 262]],
  [.12, [-42, 42, 172], [-110, 24, 292]],
  [.225, [-44, 25, 168], [-108, 64, 300]],
  [.335, [-34, 34, 140], [-104, 175, 470]],
  [.405, [-60, 300, 380], [-104, 250, 3000]],
  [.47, [-74, 420, 720], [-104, 300, 4600]],
];
const KD = [
  [.765, [-.8, 2.2, -24], [3.2, .5, -16.8]],
  [.83, [-4.8, 2.6, -24.1], [1.4, .6, -17.5]],
  [.885, [-6, 12, -70], [-30, 12, 80]],
  [.965, [70, 64, -150], [-84, 32, 280]],
  [1.06, [76, 67, -160], [-84, 32, 280]],
];
const MOON = norm3([.42, .62, -.66]); // the 17th night's moon, low in the south-west behind the camera
const NIGHT = { top: [3, 5, 14], mid: [9, 14, 33], hor: [28, 33, 58], amb: [22, 28, 50], key: [108, 120, 166], kk: 1, haze: [20, 24, 44], fog: 3400 };
const DAWN0 = { top: [10, 16, 40], mid: [34, 44, 82], hor: [130, 104, 118], amb: [46, 52, 80], key: [112, 122, 160], kk: .6, haze: [48, 52, 80], fog: 5500 };
const DAWN1 = { top: [34, 54, 100], mid: [108, 122, 160], hor: [242, 194, 152], amb: [80, 90, 124], key: [140, 150, 190], kk: .35, haze: [112, 118, 146], fog: 7500 };
const mixL = (A, B, k) => Object.fromEntries(Object.keys(A).map((n) => [n, lerp(A[n], B[n], k)]));

// a box with three axes (unit vectors) and half sizes; faces culled by the eye, shaded by the key and the ambient
function boxFaces(ctr, ax, ay, az, hx, hy, hz) {
  const A = [ax, ay, az], Hh = [hx, hy, hz], out = [];
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) {
    const n = A[k].map((v) => v * s), a = A[(k + 1) % 3], b = A[(k + 2) % 3], ha = Hh[(k + 1) % 3], hb = Hh[(k + 2) % 3];
    const fc = [0, 1, 2].map((j) => ctr[j] + n[j] * Hh[k]);
    const q = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([u, v]) => [0, 1, 2].map((j) => fc[j] + a[j] * ha * u + b[j] * hb * v));
    out.push({ n, fc, q, a, b, ha, hb });
  }
  return out;
}
const UP = [0, 1, 0];
// idol outlines across (a) and up (v), counter-clockwise, normalised: a figure, a stele with a rounded head, a squat one
const IDOL = [
  [[-.5, 0], [.5, 0], [.5, .1], [.34, .12], [.36, .5], [.46, .62], [.44, .72], [.22, .76], [.2, .8], [.27, .86], [.28, .94], [.2, 1], [-.2, 1], [-.28, .94], [-.27, .86], [-.2, .8], [-.22, .76], [-.44, .72], [-.46, .62], [-.36, .5], [-.34, .12], [-.5, .1]],
  [[-.5, 0], [.5, 0], [.5, .1], [.4, .1], [.4, .82], [.32, .94], [.16, 1], [-.16, 1], [-.32, .94], [-.4, .82], [-.4, .1], [-.5, .1]],
  [[-.5, 0], [.5, 0], [.5, .14], [.42, .16], [.44, .56], [.3, .62], [.34, .7], [.36, .84], [.26, .96], [0, 1], [-.26, .96], [-.36, .84], [-.34, .7], [-.3, .62], [-.44, .56], [-.42, .16], [-.5, .14]],
];
const yaw = (r) => [[Math.cos(r), 0, Math.sin(r)], UP, [-Math.sin(r), 0, Math.cos(r)]];

function meccaInit(st) {
  const R = rng(1703);
  const H = st.houses = [];
  H.push({ x: HS[0], z: HS[1], w: 9, d: 7.5, h: 4.6, rot: .05, alb: [200, 170, 132], birth: 1 });
  H.push({ x: HS[0] + 6.6, z: HS[1] + 1.5, w: 4.2, d: 6, h: 3.4, rot: .05, alb: [186, 156, 120] }); // a second room
  [[-2.95, -7.7, 3.5, .45], [2.95, -7.7, 3.5, .45], [-4.5, -5.8, .45, 3.8], [4.5, -5.8, .45, 3.8]].forEach(([dx, dz, w, d]) => H.push({ x: HS[0] + dx, z: HS[1] + dz, w, d, h: 1.9, rot: .05, alb: [176, 148, 114], yard: 1 })); // the yard wall, its gate before the door
  // a few neighbours in the mouth of the Shi'b (the houses of Banu Hashim)
  for (let i = 0; i < 40 && H.length < 9; i++) { const z = 262 + R() * 120, x = shibX(z) + (R() - .5) * 30; if (Math.hypot(x - HS[0], z - HS[1]) < 13 || mount(x, z) > .5) continue; if (H.some((q) => Math.abs(q.x - x) < (q.w + 7) * .5 + 1 && Math.abs(q.z - z) < (q.d + 6) * .5 + 1)) continue; H.push({ x, z, w: 5 + R() * 3, d: 5 + R() * 3, h: 3 + R() * 1.8, rot: (R() - .5) * .3, k: R(), lamp: R() < .25 }); }
  for (let i = 0; i < 12000 && H.length < 360; i++) {
    const a = R() * TAU, r = 30 + R() ** .85 * 270, x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r * .95 + 20;
    if (mount(x, z) > .32 || Math.hypot(x, z) < 58 || Math.hypot(x - HS[0], z - HS[1]) < 15) continue;
    const w = 5 + R() * 5, d = 5 + R() * 4;
    if (H.some((q) => Math.abs(q.x - x) < (q.w + w) * .5 + .8 && Math.abs(q.z - z) < (q.d + d) * .5 + .8)) continue;
    H.push({ x, z, w, d, h: (R() < .2 ? 5.5 : 3) + R() * 2.4 + mount(x, z) * 3, rot: .25 + (R() - .5) * .3, k: R(), lamp: R() < .05 });
  }
  H.forEach((q) => { q.y0 = height(q.x, q.z) - .3; if (!q.alb) q.alb = q.k < .07 ? [204, 190, 162] : q.k > .88 ? [150, 122, 96] : lerp([194, 162, 124], [168, 138, 106], q.k); });
  // the idols round the Kaaba: each on its plinth; at dawn each lies fallen forward, on its face, toward the House
  const RI = rng(360), STONE = [[150, 138, 122], [124, 114, 106], [170, 152, 128], [146, 118, 98], [112, 104, 100], [180, 166, 140]];
  st.idols = [];
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU + (RI() - .5) * .05, r = 15 + RI() * 5 + (i % 2) * 2.6, x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r;
    const k = RI() < .5 ? 0 : RI() < .6 ? 1 : 2, Hh = k === 2 ? 1.1 + RI() * .5 : 1.5 + RI() * .9, A = (k === 2 ? .36 : .27) + RI() * .1, T = .26 + RI() * .14;
    st.idols.push({ x, z, a, k, Hh, A, T, out: Math.atan2(z, x) + (RI() - .5) * .5, pw: A * .75 + .05 + RI() * .06, ph: .18 + RI() * .22, roll: (RI() - .5) * .3, alb: STONE[(RI() * STONE.length) | 0] });
  }
  st.stars = Array.from({ length: 900 }, () => [R() * TAU - Math.PI, .03 + Math.asin(R()) * .97, R() ** 1.6]);
  // the Milky Way: faint stars crowded about a great circle across the sky, and its soft glow
  const mw = norm3([.55, .35, -.76]), m1 = norm3(cross3(mw, UP)), m2 = cross3(mw, m1);
  for (let i = 0; i < 1300; i++) { const a = R() * TAU, off = (R() + R() + R() - 1.5) * .16, v = norm3([0, 1, 2].map((j) => m1[j] * Math.cos(a) + m2[j] * Math.sin(a) + mw[j] * off)); if (v[1] > .02) st.stars.push([Math.atan2(v[0], v[2]), Math.asin(v[1]), R() * .45]); }
  st.mwGlow = []; for (let i = 0; i < 70; i++) { const a = i / 70 * TAU, v = norm3([0, 1, 2].map((j) => m1[j] * Math.cos(a) + m2[j] * Math.sin(a) + mw[j] * (vn(i * .3, 2) - .5) * .12)); if (v[1] > 0) st.mwGlow.push([v, .5 + vn(i * .4, 7)]); }
  // the thrown stars: they streak away from a radiant high in the east
  const rad = norm3([-.1, .94, .33]), e1 = norm3(cross3(rad, [0, 0, 1])), e2 = cross3(rad, e1);
  st.met = Array.from({ length: 190 }, (_, i) => {
    const ang = Math.PI * (.15 + R() * .7) + (R() < .5 ? 0 : Math.PI), pv = [0, 1, 2].map((j) => e1[j] * Math.cos(ang) + e2[j] * Math.sin(ang)), big = R() < .14;
    return { rad, pv, r0: .3 + R() * .55, len: (big ? .3 : .12) + R() * .22, ps: .245 + (i / 190) ** 1.05 * .2 + (R() - .5) * .01, dur: .01 + R() * .014 + (big ? .012 : 0), br: big ? 1 : .45 + R() * .5, w: big ? 2.6 : 1.2 + R() * .8 };
  });
  st.NS = 78; st.NK = 84;
  st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1)); st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
}

function drawMecca(c, st, W, H, p, t, lay, dawnShot) {
  const [eye, look] = camAt(dawnShot ? KD : KA, p);
  const L = lens(eye, look, lay.F, lay.cx, lay.cy), F = lay.F;
  const u = dawnShot ? smooth(seg(p, .765, 1)) : 0;
  const lt = dawnShot ? mixL(DAWN0, DAWN1, u) : NIGHT;
  // the light of the birth, beat by beat (night shot only)
  const Lh = dawnShot ? 0 : smooth(seg(p, .14, .215));
  const win = dawnShot ? .5 + .25 * (1 - u) : .6 + .4 * Lh; // the lamp in the room, then the light
  const shaftK = dawnShot ? 0 : ease.out(seg(p, .15, .28)), runK = dawnShot ? 0 : ease.io(seg(p, .36, .465));
  const breathe = 1 + .05 * Math.sin(t * 1.3) + .03 * Math.sin(t * 2.7 + 1);
  const wash = Lh * (1 - .3 * runK); // how far the light lies over the land
  const fallAt = (x, y, z) => { const d = Math.hypot(x - HS[0], z - HS[1], (y - 8) * .6); return wash * (.14 + 1.3 / (1 + (d / 70) ** 2)) + (dawnShot ? .12 * (1 - u) / (1 + (d / 24) ** 2) : .05 / (1 + (d / 14) ** 2)); };

  // ----- sky: gradient, the dawn behind the eastern hills, the Milky Way and the stars -----
  const hy = L.hy;
  const sg = c.createLinearGradient(0, hy - F * .95, 0, hy);
  sg.addColorStop(0, rgb(lt.top)); sg.addColorStop(.62, rgb(lt.mid)); sg.addColorStop(1, rgb(lt.hor));
  c.fillStyle = sg; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';
  if (dawnShot && L.dir(.05, .02)) {
    const g = c.createRadialGradient(L.X, hy, 0, L.X, hy, F * 1.4);
    g.addColorStop(0, rgb([255, 214, 168], .55 * u)); g.addColorStop(.22, rgb([250, 180, 146], .22 * u)); g.addColorStop(1, 'rgba(240,170,140,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  const starA = dawnShot ? .9 * (1 - smooth(seg(p, .78, .93))) : 1, dimS = 1 - .3 * wash;
  if (starA > 0) {
    for (const [v, k] of st.mwGlow) { if (!L.dirv(v) || L.Y > hy) continue; const r = F * .2; c.globalAlpha = .07 * k * starA * dimS; c.drawImage(st.glowW, L.X - r, L.Y - r * .7, r * 2, r * 1.4); }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#f2ecdc';
    for (const [az, el, k] of st.stars) {
      if (!L.dir(az, el) || L.X < -2 || L.X > W + 2 || L.Y < -2 || L.Y > hy - 3) continue;
      c.globalAlpha = starA * (.22 + .78 * k) * (.78 + .22 * Math.sin(t * 2 + k * 60 + az * 9)) * dimS;
      const s = k > .9 ? 1.9 : k > .55 ? 1.35 : .95; c.fillRect(L.X, L.Y, s, s);
    }
    c.globalAlpha = 1;
  }
  c.globalCompositeOperation = 'lighter';
  // the light of the birth spread over the sky
  if (wash > .002 && L.pj(HS[0], 300, HS[1] + 60)) {
    const g = c.createRadialGradient(L.X, L.Y, 0, L.X, L.Y, F * .8);
    g.addColorStop(0, rgb(WARM, .22 * wash)); g.addColorStop(.4, rgb(WARM, .07 * wash)); g.addColorStop(1, rgb(WARM, 0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // the thrown stars
  if (!dawnShot && p > .24 && p < .47) {
    c.lineCap = 'round';
    for (const m of st.met) {
      const k = (p - m.ps) / m.dur; if (k <= 0 || k >= 1.3) continue;
      const at = (th) => [0, 1, 2].map((j) => m.rad[j] * Math.cos(th) + m.pv[j] * Math.sin(th));
      const kh = Math.min(1, k), th = m.r0 + m.len * kh, tl = m.r0 + m.len * Math.max(0, kh - .5 - Math.max(0, k - 1) * 1.6);
      if (!L.dirv(at(th))) continue; const hx = L.X, hy2 = L.Y;
      if (!L.dirv(at(tl))) continue; const tx = L.X, ty = L.Y;
      if (hy2 > hy - 2) continue;
      const a = m.br * Math.min(1, k * 3) * (1 - smooth(c01((k - .85) / .45))) * (1 - .4 * runK);
      const g = c.createLinearGradient(tx, ty, hx, hy2); g.addColorStop(0, 'rgba(255,226,180,0)'); g.addColorStop(.7, `rgba(255,236,206,${.45 * a})`); g.addColorStop(1, `rgba(255,250,236,${Math.min(1, a)})`);
      c.strokeStyle = g; c.lineWidth = m.w; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy2); c.stroke();
      if (k < 1) { c.globalAlpha = Math.min(1, a * .9); c.drawImage(st.glowW, hx - m.w * 3.5, hy2 - m.w * 3.5, m.w * 7, m.w * 7); c.globalAlpha = 1; }
    }
    c.lineCap = 'butt';
  }
  c.globalCompositeOperation = 'source-over';

  // ----- terrain: depth bands far to near (terrainRaster in core.js) -----
  const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
  if (L.pitch < .75) {
    const fw = L.fw, hf = norm3([fw[0], 0, fw[2]]), hr = [hf[2], 0, -hf[0]], cp = Math.cos(L.pitch), sp = Math.sin(L.pitch);
    const by = (H - L.cy) / F, dyb = sp - by * cp, dhb = cp + by * sp, E = eye, eh = Math.max(1.2, E[1] - height(E[0], E[2]));
    const dMin = dyb < -.01 ? Math.max(1, eh / -dyb * dhb * .8) : 3, dMax = 9000;
    const sand = [176, 152, 120], gravel = [146, 126, 102], rock = [92, 80, 74];
    for (let i = 0; i < NS; i++) {
      const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
      const zc0 = Math.max(.6, d * cp - eh * sp), fogK = 1 - Math.exp(-d / lt.fog);
      for (let k = 0; k <= NK; k++) {
        const sx = -W * .06 + k * (W * 1.12 / NK), uu = (sx - L.cx) / F * zc0;
        const x = E[0] + hf[0] * d + hr[0] * uu, z = E[2] + hf[2] * d + hr[2] * uu, h = height(x, z), o = i * (NK + 1) + k;
        if (L.pj(x, h, z)) { TX[o] = L.X; TY[o] = Math.max(-H, Math.min(H * 3, L.Y)); } else { TX[o] = sx; TY[o] = H * 3; }
        if (k % 2 === 0) {
          const e = Math.max(.5, d * .0035), hx = (height(x + e, z) - h) / e, hz = (height(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
          const m = mount(x, z), steep = c01((1 - 1 / nl) * 3), cg = crag(x * 2.3, z * 2.3);
          const al = lerp(lerp(gravel, sand, c01(.5 + .5 * Math.sin(x * .019 + Math.sin(z * .011) * 2))), lerp(rock, rock.map((v) => v * .62), cg), Math.max(m * .95, steep));
          const lam = Math.max(0, (-hx * MOON[0] + MOON[1] - hz * MOON[2]) / nl) ** 1.2, sky = .4 + .6 / nl, fl = fallAt(x, h, z), ao = .75 + .25 * cg;
          const lit = [0, 1, 2].map((j) => al[j] / 255 * (lt.amb[j] * sky * ao + lt.key[j] * lam * lt.kk) + WARM[j] * fl * al[j] / 255 * 1.15);
          const fa = Math.min(.94, fogK * (1 - .25 * c01(h / 160))), nn = (i * NC + k / 2) * 3;
          TC[nn] = mix(lit[0], lt.haze[0], fa); TC[nn + 1] = mix(lit[1], lt.haze[1], fa); TC[nn + 2] = mix(lit[2], lt.haze[2], fa);
        }
      }
    }
    terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .13);
  }
  const fogOf = (zc) => Math.min(.95, 1 - Math.exp(-zc / lt.fog));

  // ----- the town, the Kaaba, the idols: boxes painted far to near -----
  const items = [];
  const shadeFace = (f, alb, fz, x, y, z) => {
    const lam = Math.max(0, dot3(f.n, MOON)), sk = .6 + .4 * (f.n[1] * .5 + .5), fl = fallAt(x, y, z), face = .55 + .65 * Math.max(0, -(f.n[2] * .8 + f.n[0] * .25));
    const col = [0, 1, 2].map((j) => alb[j] / 255 * (lt.amb[j] * sk + lt.key[j] * lam * lt.kk) + WARM[j] * fl * alb[j] / 255 * face);
    return lerp(col, lt.haze, fz);
  };
  const quad = (q) => { c.beginPath(); for (let i = 0; i < 4; i++) { if (!L.pj(q[i][0], q[i][1], q[i][2])) return false; i ? c.lineTo(L.X, L.Y) : c.moveTo(L.X, L.Y); } c.closePath(); return true; };
  const addBox = (ctr, axes, hs, alb, extra) => {
    if (!L.pj(ctr[0], ctr[1], ctr[2])) return; const zc = L.Z, px = L.X;
    if (px < -W * .6 || px > W * 1.6) return;
    items.push([zc, () => {
      const fz = fogOf(zc);
      for (const f of boxFaces(ctr, axes[0], axes[1], axes[2], hs[0], hs[1], hs[2])) {
        if (dot3(f.n, sub3(eye, f.fc)) <= 0) continue;
        if (!quad(f.q)) continue;
        c.fillStyle = rgb(shadeFace(f, alb, fz, f.fc[0], f.fc[1], f.fc[2])); c.fill();
        if (extra) extra(f, fz);
      }
    }]);
  };
  const faceAt = (f) => { // a point on a wall face: uu across, vv up (0 = foot)
    const vert = Math.abs(f.a[1]) > .5, ve = vert ? f.a : f.b, ho = vert ? f.b : f.a, hv = (vert ? f.ha : f.hb) * Math.sign(ve[1]), hh = vert ? f.hb : f.ha;
    return { ext: hh * 2, at: (uu, vv) => [0, 1, 2].map((j) => f.fc[j] + ho[j] * hh * (2 * uu - 1) + ve[j] * hv * (2 * vv - 1)) };
  };
  for (const q of st.houses) {
    const ax = yaw(q.rot), hs = [q.w / 2, q.h / 2, q.d / 2], ctr = [q.x, q.y0 + q.h / 2, q.z];
    addBox(ctr, ax, hs, q.alb, (f, fz) => {
      if (f.n[1] > .5) { c.strokeStyle = rgb(lerp(q.alb.map((v, j) => v / 255 * lt.amb[j] * .6), lt.haze, fz), .7); c.lineWidth = 1; c.stroke(); return; } // the parapet
      if (q.yard) return;
      const { ext, at } = faceAt(f); if (ext < 3) return;
      const rect = (u0, u1, v0, v1) => quad([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]);
      if (q.birth) {
        if (f.n[2] > -.5) return; // the door and the window are on the side toward the Kaaba
        const k = win * breathe, open = (u0, u1, v0, v1, a2, wm, hm) => {
          if (!rect(u0, u1, v0, v1)) return;
          c.fillStyle = rgb(lerp([255, 168, 88], LIGHT, .3 + .7 * Lh), Math.min(1, .95 * k)); c.fill();
          const m0 = at((u0 + u1) / 2, (v0 + v1) / 2); if (!L.pj(m0[0], m0[1], m0[2])) return;
          const s = F / L.Z;
          c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(.9, a2 * k); c.drawImage(SHAFT, L.X - wm * s * 1.2, L.Y - hm * s, wm * s * 2.4, hm * s * 2); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        };
        open(.42, .58, .02, .62, .5 + .5 * Lh, 1.44, 2.85); open(.72, .86, .45, .7, .4 + .5 * Lh, 1.26, 1.15);
      } else if (q.lamp && !dawnShot && f.n[2] < -.3 && (q.x * 13 % 1) < .7) {
        if (rect(.55, .66, .5, .66)) { c.fillStyle = rgb([255, 176, 96], .8 * (.85 + .15 * Math.sin(t * 3 + q.x))); c.fill(); }
      } else if (ext > 4 && (q.x * 7 % 1) < .55) {
        if (rect(.42, .56, .02, .55)) { c.fillStyle = rgb(lerp([16, 13, 15], lt.haze, fz * .8), .85); c.fill(); }
      }
    });
  }
  // the Kaaba: a dark house; its faces darken toward the foot and its edges catch the sky
  addBox([0, 4.5, 0], yaw(.25), [5.75, 4.5, 5], [46, 42, 46], (f, fz) => {
    if (f.n[1] > .5) return;
    const { at, ext } = faceAt(f), a0 = at(.5, 1), a1 = at(.5, 0);
    c.save(); c.clip(); c.lineWidth = 1; c.beginPath(); for (let i = 1; i < 14; i++) { const u2 = i / 14 + Math.sin(i * 7.3) * .012, b0 = at(u2, 0), b1 = at(u2, 1); if (L.pj(b0[0], b0[1], b0[2])) { const x0 = L.X, y0 = L.Y; if (L.pj(b1[0], b1[1], b1[2])) { c.moveTo(x0, y0); c.lineTo(L.X, L.Y); } } } c.strokeStyle = 'rgba(0,0,0,.22)'; c.stroke(); c.restore();
    quad(f.q);
    if (L.pj(a0[0], a0[1], a0[2])) { const y0 = L.Y; if (L.pj(a1[0], a1[1], a1[2])) { const g = c.createLinearGradient(0, y0, 0, L.Y); g.addColorStop(0, rgb(lerp(lt.hor, lt.mid, .4), .3)); g.addColorStop(.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = g; c.fill(); } }
    c.strokeStyle = rgb(lerp(lt.hor, [200, 190, 180], .3), .28 * (1 - fz)); c.lineWidth = 1; c.stroke();
  });
  { const ky = yaw(.25), nN = ky[0].map((v) => -v), tg = ky[2];
    for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i + .5) / 14 * Math.PI, r = 8.2, cx2 = nN[0] * (5.75 + r * Math.cos(a) * .9) + tg[0] * r * Math.sin(a), cz2 = nN[2] * (5.75 + r * Math.cos(a) * .9) + tg[2] * r * Math.sin(a); addBox([cx2, .65, cz2], yaw(.25 + a + Math.PI / 2), [1.25, .65, .45], [132, 118, 102]); } }
  if (Math.hypot(eye[0], eye[2]) < 300) {
    const idol = (d, fallen) => {
      const n0 = [Math.cos(d.out), 0, Math.sin(d.out)], side = [-n0[2], 0, n0[0]];
      const vA = fallen ? n0 : UP, nA = fallen ? [0, -1, 0] : n0, aA = side;
      const base = fallen ? [d.x + n0[0] * d.pw * .85, d.T / 2 + .02, d.z + n0[2] * d.pw * .85] : [d.x, d.ph, d.z];
      const at = (a2, v, w) => [0, 1, 2].map((j) => base[j] + aA[j] * a2 * d.A * 2 + vA[j] * v * d.Hh + nA[j] * w * d.T / 2);
      const ctr = at(0, .5, 0); if (!L.pj(ctr[0], ctr[1], ctr[2])) return; const zc = L.Z;
      if (L.X < -W * .3 || L.X > W * 1.3 || zc > 260) return;
      items.push([zc, () => {
        const fz = fogOf(zc), P = IDOL[d.k], shade = (n) => rgb(lerp([0, 1, 2].map((j) => d.alb[j] / 255 * (lt.amb[j] * (.62 + .38 * (n[1] * .5 + .5)) + lt.key[j] * Math.max(0, dot3(n, MOON)) * lt.kk)), lt.haze, fz));
        const poly3 = (Q) => { c.beginPath(); for (let i = 0; i < Q.length; i++) { if (!L.pj(Q[i][0], Q[i][1], Q[i][2])) return false; i ? c.lineTo(L.X, L.Y) : c.moveTo(L.X, L.Y); } c.closePath(); return true; };
        for (let i = 0; i < P.length; i++) { // the sides
          const [a0, v0] = P[i], [a1, v1] = P[(i + 1) % P.length], ea = (a1 - a0) * d.A * 2, ev = (v1 - v0) * d.Hh, l = Math.hypot(ea, ev) || 1;
          const n = [0, 1, 2].map((j) => aA[j] * ev / l - vA[j] * ea / l), q0 = at(a0, v0, 1);
          if (dot3(n, sub3(eye, q0)) <= 0) continue;
          if (poly3([q0, at(a1, v1, 1), at(a1, v1, -1), at(a0, v0, -1)])) { c.fillStyle = shade(n); c.fill(); }
        }
        for (const w of [1, -1]) { // the front or the back, whichever faces the eye
          const n = nA.map((v) => v * w), q0 = at(0, .5, w); if (dot3(n, sub3(eye, q0)) <= 0) continue;
          if (poly3(P.map(([a2, v]) => at(a2, v, w)))) { c.fillStyle = shade(n); c.fill(); c.strokeStyle = rgb(lerp(lt.hor, [0, 0, 0], .5), .25 * (1 - fz)); c.lineWidth = 1; c.stroke(); }
        }
      }]);
    };
    for (const d of st.idols) {
      addBox([d.x, d.ph / 2, d.z], yaw(-d.a), [d.pw, d.ph / 2, d.pw * .8], lerp(d.alb, [86, 80, 76], .55));
      idol(d, dawnShot);
    }
  }
  items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());

  // ----- the light of the birth -----
  if (!dawnShot) {
    c.globalCompositeOperation = 'lighter';
    // the doorway's light thrown out through the gate over the ground
    const z0 = HS[1] - 3.8, reach = 14 + 10 * Lh, pts = [[HS[0] - .8, z0], [HS[0] + .8, z0], [HS[0] + 4, z0 - reach], [HS[0] - 4, z0 - reach]];
    c.beginPath(); let ok = true; pts.forEach(([x, z], i) => { if (!L.pj(x, height(x, z) + .05, z)) ok = false; else i ? c.lineTo(L.X, L.Y) : c.moveTo(L.X, L.Y); });
    if (ok && L.pj(HS[0], .1, z0)) {
      const x0 = L.X, y0 = L.Y; L.pj(HS[0], .1, z0 - reach);
      const g = c.createLinearGradient(x0, y0, L.X, L.Y); g.addColorStop(0, rgb(lerp([255, 170, 90], LIGHT, Lh), .5 * win)); g.addColorStop(1, rgb([255, 190, 120], 0));
      c.closePath(); c.fillStyle = g; c.fill();
    }
    // the beam: a wide veil, a body and a core, each a soft column drawn along the projected vertical
    const beam = (y1, wb, al, img) => {
      if (al <= .003 || !L.pj(HS[0], 3, HS[1] + .5)) return; const bx = L.X, by = L.Y, bz = L.Z;
      if (!L.pj(HS[0], y1, HS[1] + .5)) return; const dx = L.X - bx, dy = L.Y - by, len = Math.hypot(dx, dy); if (len < 2) return;
      const w = Math.max(3, wb * F / bz);
      c.save(); c.translate(bx, by); c.rotate(Math.atan2(dx, -dy)); c.globalAlpha = Math.min(1, al); c.drawImage(img, -w / 2, -len, w, len); c.restore();
    };
    const fade = 1 - .4 * runK;
    beam(260 + 1500 * shaftK, 220, .2 * Lh * fade, BEAM);
    beam(40 + 1300 * shaftK, 40, .42 * shaftK * breathe * fade, BEAM);
    beam(8 + 1300 * shaftK, 9, .75 * shaftK * breathe * fade, BEAM);
    if (L.pj(HS[0], 1.5, HS[1] - 2)) { const s = F / L.Z; c.globalAlpha = Math.min(1, .55 * Lh * breathe); c.drawImage(st.glowWarm, L.X - s * 40, L.Y - s * 9, s * 80, s * 18); }
    c.globalAlpha = 1;
    // the light runs east from the Hijaz, over the hills, to the horizon
    if (runK > 0) {
      const P = (s2) => [HS[0] + 40 * s2, mix(40, 190, smooth(c01(s2 / .04))) + 30 * s2, HS[1] + 60000 * s2 * s2];
      const N = 96, pts = [];
      for (let i = 0; i <= N; i++) { const q = P(i / N * runK); if (L.pj(q[0], q[1], q[2])) pts.push([L.X, L.Y, L.Z, i / N]); }
      c.lineCap = 'butt'; c.lineJoin = 'round';
      const CH = 6;
      for (const [wm, al, col] of [[70, .045, WARM], [20, .1, WARM], [5, .5, LIGHT]]) for (let k2 = 0; k2 < CH; k2++) {
        const i0 = Math.floor(pts.length * k2 / CH), i1 = Math.min(pts.length - 1, Math.floor(pts.length * (k2 + 1) / CH)); if (i1 <= i0) continue;
        const A = pts[Math.floor((i0 + i1) / 2)], head = A[3] > .92 ? (1 - A[3]) / .08 : 1;
        c.strokeStyle = rgb(col, al * head); c.lineWidth = Math.max(.8, Math.min(W * (wm > 50 ? .05 : wm > 10 ? .016 : .005), wm * F / A[2]));
        c.beginPath(); for (let i = i0; i <= i1; i++) (i === i0 ? c.moveTo(pts[i][0], pts[i][1]) : c.lineTo(pts[i][0], pts[i][1])); c.stroke();
      }
      const q = P(runK);
      if (L.pj(q[0], q[1], q[2])) {
        const g = c.createRadialGradient(L.X, L.Y, 0, L.X, L.Y, F * .9); g.addColorStop(0, rgb(LIGHT, .5 * runK)); g.addColorStop(.25, rgb(WARM, .18 * runK)); g.addColorStop(1, rgb(WARM, 0));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
      c.lineCap = 'butt';
    }
    c.globalCompositeOperation = 'source-over';
  }
  if (dawnShot && p > .9 && L.pj(HS[0], 6, HS[1])) { // the light that lingers over the house of the birth
    const r = Math.max(14, 60 * F / L.Z); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .3 * (1 - .5 * u); c.drawImage(st.glowWarm, L.X - r * 1.6, L.Y - r, r * 3.2, r * 1.6); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
}

// ====================================================== AL-MADA'IN ======================================================
// The Iwan of Kisra, front on, at night: x across the façade (metres, 0 at the arch), y up, z toward the façade.
// Façade 104 m wide and 31 m high, the great arch 25.6 m across and 29.5 m high, the vault's crown behind it at 37.5 m;
// four registers of blind arcades on each wing; stepped merlons along the crown, fourteen of which fall.
const IWS = 12, IX0 = -56, IY1 = 41;
const MER = []; for (let s of [-1, 1]) for (let x = 16.6; x < 51.6; x += 2.62) MER.push(s * x);
const FALL = (() => { const R = rng(1414), pool = MER.map((x, i) => i).filter((i) => Math.abs(MER[i]) < 40), out = []; while (out.length < 14) { const i = pool[(R() * pool.length) | 0]; if (!out.includes(i)) out.push(i); } return out.sort((a, b) => Math.abs(MER[a]) - Math.abs(MER[b])); })();
const archY = (x) => 29.5 * (1 - (x / 12.8) ** 2);
function merlonPath(g, x, y, w, s) { // stepped, in metres scaled by s about (x, y) at its foot
  const h = w * .8, pts = [[-.5, 0], [-.5, .34], [-.32, .34], [-.32, .66], [-.15, .66], [-.15, 1], [.15, 1], [.15, .66], [.32, .66], [.32, .34], [.5, .34], [.5, 0]];
  g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(x + u * w * s, y - v * h * s) : g.moveTo(x + u * w * s, y - v * h * s))); g.closePath();
}
function iwanArt(pal) {
  const s = IWS, cv = mk(112 * s, 43 * s), g = cv.getContext('2d'), R = rng(226);
  const X = (m) => (m - IX0) * s, Y = (m) => (IY1 - m) * s;
  const col = (c0, k = 0) => rgb(lerp(c0, [0, 0, 0], k));
  // the vault's crown above the wall
  g.beginPath(); for (let i = 0; i <= 40; i++) { const xx = -15.8 + i * 31.6 / 40; g.lineTo(X(xx), Y(37.5 * (1 - (xx / 15.8) ** 2))); } g.closePath();
  let gr = g.createLinearGradient(0, Y(37.5), 0, Y(28)); gr.addColorStop(0, col(pal.base, .42)); gr.addColorStop(1, col(pal.base, .55)); g.fillStyle = gr; g.fill();
  // the wall
  gr = g.createLinearGradient(0, Y(31), 0, Y(0)); gr.addColorStop(0, col(pal.base)); gr.addColorStop(1, col(pal.base, .32)); g.fillStyle = gr; g.fillRect(X(-52), Y(31), 104 * s, 31 * s);
  // the four registers of blind arcades on both wings
  const regs = [[1, 12.6, 4.2, 1.1, 1], [13.8, 19.4, 3.0, .8, 0], [20.3, 24.8, 2.2, .6, 0], [25.6, 29.1, 1.6, .5, 0]];
  for (const [y0, y1, nw, gap, cols] of regs) {
    const span = 36.2, n = Math.floor((span + gap) / (nw + gap)), x0 = 15.4 + (span - (n * nw + (n - 1) * gap)) / 2;
    for (const sd of [-1, 1]) for (let i = 0; i < n; i++) {
      const a = x0 + i * (nw + gap), xl = sd > 0 ? a : -a - nw, xr = xl + nw, r = nw / 2, top = y1 - r;
      g.beginPath(); g.moveTo(X(xl), Y(y0)); g.lineTo(X(xl), Y(top)); g.arc(X(xl + r), Y(top), r * s, Math.PI, 0); g.lineTo(X(xr), Y(y0)); g.closePath();
      const ng = g.createLinearGradient(0, Y(y1), 0, Y(y0)); ng.addColorStop(0, col(pal.dark, .25)); ng.addColorStop(.35, col(pal.dark)); ng.addColorStop(1, col(pal.dark, .1)); g.fillStyle = ng; g.fill();
      g.strokeStyle = rgb(pal.hi, .35); g.lineWidth = Math.max(1, s * .12); g.stroke();
      if (cols) { g.fillStyle = rgb(pal.hi, .28); [xr + gap * .2, xr + gap * .58].forEach((cx) => { if (Math.abs(cx) < 51.6 && Math.abs(cx) > 15.4) g.fillRect(X(cx), Y(y1 + .2), gap * .24 * s, (y1 + .2 - y0) * s); }); }
    }
    g.fillStyle = rgb(pal.hi, .3); g.fillRect(X(-52), Y(y1 + .62), 104 * s, .42 * s); // the cornice
    g.fillStyle = rgb([0, 0, 0], .28); g.fillRect(X(-52), Y(y1 + .2), 104 * s, .22 * s);
  }
  g.fillStyle = rgb(pal.hi, .22); g.fillRect(X(-52), Y(31), 104 * s, .5 * s);
  // the great arch: its frame, then the dark of the hall with the vault's rings going back to the far wall
  const archP = (k, vx, vy) => { const P = []; for (let i = 0; i <= 48; i++) { const xx = -12.8 + i * 25.6 / 48; P.push([vx + (xx - vx) * k, vy + (archY(xx) - vy) * k]); } return P; };
  const path = (P) => { g.beginPath(); P.forEach(([a, b], i) => (i ? g.lineTo(X(a), Y(b)) : g.moveTo(X(a), Y(b)))); g.closePath(); };
  path(archP(1.08, 0, 0)); g.fillStyle = col(pal.base, -.0); g.fill(); g.strokeStyle = rgb(pal.hi, .4); g.lineWidth = s * .5; g.stroke();
  path(archP(1, 0, 0)); gr = g.createLinearGradient(0, Y(29.5), 0, Y(0)); gr.addColorStop(0, col(pal.hall, .45)); gr.addColorStop(1, col(pal.hall, .1)); g.fillStyle = gr; g.fill();
  for (let k = 1; k <= 7; k++) { path(archP(1 - k * .075, 0, 4)); g.strokeStyle = rgb(pal.hi, .1 - k * .008); g.lineWidth = s * .3; g.stroke(); }
  path(archP(.42, 0, 4)); g.fillStyle = col(pal.hall, .55); g.fill();
  g.fillStyle = col(pal.hall, .8); g.fillRect(X(-1.5), Y(5.6), 3 * s, 3.9 * s); // the far doorway
  // brick courses, speckle, and rain streaks under the cornices
  g.save(); g.beginPath(); g.rect(X(-52), Y(31), 104 * s, 31 * s); archP(1, 0, 0).forEach(([a, b], i) => (i ? g.lineTo(X(a), Y(b)) : g.moveTo(X(a), Y(b)))); g.closePath(); g.clip('evenodd');
  g.fillStyle = 'rgba(0,0,0,.13)'; for (let y = .3; y < 31; y += .38) g.fillRect(X(-52), Y(y), 104 * s, Math.max(1, s * .05));
  for (let i = 0; i < 5200; i++) { const x = -52 + R() * 104, y = R() * 31; g.fillStyle = R() < .5 ? 'rgba(0,0,0,.09)' : rgb(pal.hi, .07); g.fillRect(X(x), Y(y), s * (.2 + R() * .5), s * .12); }
  for (let i = 0; i < 70; i++) { const x = -52 + R() * 104, y = 13 + R() * 18, w = .4 + R() * 1.6, h = 2 + R() * 7, sg = g.createLinearGradient(0, Y(y), 0, Y(y - h)); sg.addColorStop(0, 'rgba(0,0,0,.14)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(X(x), Y(y), w * s, h * s); }
  g.restore();
  // the merlons that stay
  MER.forEach((x, i) => { if (FALL.includes(i)) return; merlonPath(g, X(x), Y(31), 2.3, s); g.fillStyle = col(pal.base, .06); g.fill(); });
  return cv;
}
function palm(c, x, y, s, seed, t, col, rim) { // a date palm in silhouette at screen (x, y), s px per metre
  const h = (10 + (seed * 7 % 1) * 8) * s, lean = ((seed * 13 % 1) - .5) * .35, tx = x + lean * h, ty = y - h, mx = x + lean * h * .25;
  c.fillStyle = rgb(col);
  c.beginPath(); c.moveTo(x - .38 * s, y); c.quadraticCurveTo(mx - .3 * s, y - h * .5, tx - .2 * s, ty); c.lineTo(tx + .2 * s, ty); c.quadraticCurveTo(mx + .3 * s, y - h * .5, x + .38 * s, y); c.closePath(); c.fill();
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI * (.04 + .92 * i / 14) + Math.sin(t * .6 + seed * 9 + i) * .025, L = (3.4 + ((i * 7 + seed * 11) % 3) * .5) * s;
    const ca = Math.cos(a), sa = Math.sin(a), droop = L * (.55 - .5 * Math.abs(sa));
    const ex = tx + ca * L, ey = ty + sa * L * .55 + droop, kx = tx + ca * L * .5, ky = ty + sa * L * .62 - L * .18, w = .32 * s;
    c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(kx - sa * w, ky + ca * w * .4 - w, ex, ey); c.quadraticCurveTo(kx + sa * w, ky - ca * w * .4 + w, tx, ty); c.fill();
  }
  if (rim) { c.strokeStyle = rim; c.lineWidth = Math.max(.6, .14 * s); c.beginPath(); c.moveTo(tx - 1.8 * s, ty - .1 * s); c.quadraticCurveTo(tx, ty - 1.1 * s, tx + 1.8 * s, ty - .1 * s); c.stroke(); }
}
function drawIwan(c, st, W, H, p, t, lay) {
  if (!st.iwan) {
    st.iwan = [iwanArt({ base: [50, 52, 68], dark: [17, 17, 27], hi: [112, 114, 138], hall: [14, 12, 18] }), iwanArt({ base: [124, 98, 80], dark: [40, 30, 28], hi: [214, 178, 136], hall: [34, 22, 18] })];
    const R = rng(77); st.palms = [];
    for (let i = 0; i < 22; i++) { const sd = i % 2 ? 1 : -1, z = -150 + R() * 300, x = sd * (58 + R() * 120) + (R() - .5) * 10; st.palms.push([x, z, R()]); }
    st.palms.sort((a, b) => b[1] - a[1]);
    st.debris = Array.from({ length: 70 }, () => [(R() - .5) * 100, .5 + R() * .07, R(), R()]);
  }
  const k = ease.io(seg(p, .465, .64)), Z = mix(292, 222, k), ex = mix(-5, 3, k), ey = 3.6;
  const F = lay.phone ? W / 70 * Z : Math.min(H * .62 * Z / 34, W * .78 * Z / 104);
  const cx = lay.phone ? W * .5 : W * .4, cy = lay.phone ? H * .9 : H * .8, S = F / Z;
  const glowK = smooth(seg(p, .46, .54)), shake = bump(p, .5, .512, .565, .6);
  const shx = (.32 * Math.sin(p * 1300) + .18 * Math.sin(p * 2900 + 1)) * shake, shy = .12 * Math.sin(p * 2100 + 2) * shake;
  const X = (x) => cx + (x - ex + shx) * S, Y = (y) => cy - (y - ey + shy) * S;
  // sky: the night, and behind the palace the light come from the Hijaz, low in the west
  const sg = c.createLinearGradient(0, 0, 0, cy); sg.addColorStop(0, '#05070f'); sg.addColorStop(.55, '#0e1328'); sg.addColorStop(1, rgb(lerp([34, 34, 56], [120, 90, 70], glowK)));
  c.fillStyle = sg; c.fillRect(0, 0, W, H);
  if (!st.ivSky || st.ivSky.width !== Math.ceil(W) || st.ivSky.height !== Math.ceil(H)) {
    const sk = st.ivSky = mk(W, H), g = sk.getContext('2d'), R = rng(91);
    for (let i = 0; i < 520; i++) { const x = R() * W, y = R() ** 1.4 * H * .8, kk = R(); g.fillStyle = `rgba(240,232,214,${.15 + .6 * kk})`; const s = kk > .93 ? 1.8 : kk > .6 ? 1.2 : .8; g.fillRect(x, y, s, s); }
  }
  c.globalAlpha = 1 - .55 * glowK; c.drawImage(st.ivSky, 0, 0, W, H); c.globalAlpha = 1;
  c.globalCompositeOperation = 'lighter';
  let g = c.createRadialGradient(X(-8), cy, 0, X(-8), cy, Math.max(W, H) * .95);
  g.addColorStop(0, rgb(WARM, .62 * glowK)); g.addColorStop(.18, rgb([240, 170, 110], .3 * glowK)); g.addColorStop(.5, rgb([150, 100, 110], .1 * glowK)); g.addColorStop(1, 'rgba(80,60,90,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  // rays of the light rising behind the crown
  if (glowK > 0) {
    c.globalCompositeOperation = 'lighter';
    const ox = X(-6), oy = Y(12);
    for (let i = 0; i < 22; i++) {
      const a = -Math.PI / 2 + (((i * .618) % 1) - .5) * 2.4, L2 = H * (.45 + .6 * ((i * .37) % 1)), w2 = .008 + .03 * ((i * .71) % 1) ** 2;
      const g2 = c.createRadialGradient(ox, oy, 0, ox, oy, L2); g2.addColorStop(0, rgb(WARM, .07 * glowK)); g2.addColorStop(.5, rgb(WARM, .025 * glowK)); g2.addColorStop(1, rgb(WARM, 0));
      c.fillStyle = g2; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a - w2) * L2, oy + Math.sin(a - w2) * L2); c.lineTo(ox + Math.cos(a + w2) * L2, oy + Math.sin(a + w2) * L2); c.closePath(); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
  }
  // a far grove along the horizon behind the palace
  { const z2 = 700, s2 = F / (Z + z2); c.fillStyle = rgb(lerp([20, 20, 32], [86, 62, 58], glowK * .6)); c.beginPath(); c.moveTo(0, cy + ey * s2 + 2);
    for (let x = -1; x <= W + 8; x += 6) { const wx = (x - cx) / s2 + ex, hh = 6 + 9 * fbm(wx * .02 + 4, 1) + 5 * Math.max(0, Math.sin(wx * .37) * Math.sin(wx * .11 + 1)); c.lineTo(x, cy - (hh - ey) * s2); }
    c.lineTo(W + 8, cy + ey * s2 + 2); c.closePath(); c.fill(); }
  // far land and palms beyond the palace's sides, then the palace
  c.fillStyle = rgb(lerp([18, 18, 28], [70, 52, 48], glowK)); c.fillRect(0, cy, W, H - cy);
  g = c.createLinearGradient(0, Y(0), 0, H); g.addColorStop(0, rgb(lerp([22, 22, 30], [58, 44, 42], glowK))); g.addColorStop(1, '#06070a');
  c.fillStyle = g; c.fillRect(0, Y(0), W, H - Y(0));
  const pal = st.iwan, iw = 112 * S, ih = 43 * S, ix = X(IX0), iy = Y(IY1);
  for (const [x, z, sd] of st.palms) if (z > 0) { const s2 = F / (Z + z); palm(c, cx + (x - ex) * s2, cy + ey * s2, s2, sd, t, lerp([10, 10, 16], [60, 44, 46], glowK * .5), glowK > .05 ? rgb(WARM, .5 * glowK) : null); }
  c.drawImage(pal[0], ix, iy, iw, ih);
  if (glowK > 0) { c.globalAlpha = glowK * .38; c.drawImage(pal[1], ix, iy, iw, ih); c.globalAlpha = 1; }
  // the rim of light along the crown, from the glow behind
  if (glowK > 0) {
    c.globalCompositeOperation = 'lighter';
    g = c.createLinearGradient(0, Y(33.5), 0, Y(30.4)); g.addColorStop(0, rgb(WARM, 0)); g.addColorStop(.7, rgb(WARM, .22 * glowK)); g.addColorStop(1, rgb(WARM, 0));
    c.fillStyle = g; c.fillRect(X(-52), Y(33.5), 104 * S, 3.1 * S);
    c.beginPath(); for (let i = 0; i <= 40; i++) { const xx = -15.8 + i * 31.6 / 40, yy = 37.5 * (1 - (xx / 15.8) ** 2); if (yy > 30.8) c.lineTo(X(xx), Y(yy)); }
    c.strokeStyle = rgb(WARM, .22 * glowK); c.lineWidth = Math.max(1, .2 * S); c.stroke();
    c.globalCompositeOperation = 'source-over';
  }
  { const g3 = c.createLinearGradient(X(-52), 0, X(52), 0); g3.addColorStop(0, 'rgba(4,4,8,.5)'); g3.addColorStop(.3, 'rgba(4,4,8,.08)'); g3.addColorStop(.5, 'rgba(4,4,8,0)'); g3.addColorStop(.7, 'rgba(4,4,8,.08)'); g3.addColorStop(1, 'rgba(4,4,8,.5)'); c.fillStyle = g3; c.fillRect(X(-52), Y(31), 104 * S, 31 * S); }
  { const r = 16 * S; c.globalCompositeOperation = 'lighter'; c.save(); c.translate(X(0), Y(0)); c.scale(1, .22); c.globalAlpha = .3; c.drawImage(st.glowWarm, -r, -r, r * 2, r * 2); c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  // lamps deep in the hall, swaying while the palace shakes
  {
    c.save(); c.beginPath(); for (let i = 0; i <= 30; i++) { const xx = -12.8 + i * 25.6 / 30; c.lineTo(X(xx), Y(archY(xx))); } c.closePath(); c.clip();
    c.globalCompositeOperation = 'lighter';
    const sw = Math.sin(p * 700) * shake * 1.2;
    for (const [lx, ly] of [[-4.5, 7], [4.5, 7], [0, 12]]) { const r = 4.5 * S; c.globalAlpha = .35 * (.85 + .15 * Math.sin(t * 4 + lx)); c.drawImage(st.glowWarm, X(lx + sw) - r, Y(ly) - r, r * 2, r * 2); }
    c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
  // the falling merlons: each tips forward off the crown, falls, breaks on the ground in a burst of dust
  const tone = rgb(lerp([50, 52, 68], [124, 98, 80], glowK * .38)), toneD = rgb(lerp([30, 30, 40], [80, 62, 52], glowK * .38));
  FALL.forEach((mi, j) => {
    const x0 = MER[mi], p0 = .512 + j * .0042 + ((mi * .37) % 1) * .004, uu = seg(p, p0, p0 + .03), sd = x0 > 0 ? 1 : -1;
    const dz = -uu * (3 + (j % 4)), y = 31 - 31 * Math.min(1, uu) ** 2, rot = uu * (1.2 + (j % 3) * .5) * (j % 2 ? 1 : -1), s2 = F / (Z + dz);
    const sx = cx + (x0 + sd * uu * (.8 + j % 3) - ex + shx * (1 - uu)) * s2, sy = cy - (y - ey + shy * (1 - uu)) * s2;
    if (uu < 1) {
      c.save(); c.translate(sx, sy - 1.05 * s2); c.rotate(rot); merlonPath(c, 0, 1.05 * s2, 2.3, s2); c.fillStyle = tone; c.fill(); c.restore();
    } else {
      [[-.7, .3], [.6, -.5], [1.4, .9]].forEach(([ox, rr], q) => { c.save(); c.translate(sx + ox * s2, cy + ey * s2 - .25 * s2); c.rotate(rr + j); c.fillStyle = q ? toneD : tone; c.fillRect(-.5 * s2, -.35 * s2, (q ? .8 : 1.2) * s2, .7 * s2); c.restore(); });
    }
    const dust = bump(p, p0 + .028, p0 + .034, p0 + .05, p0 + .1);
    if (dust > 0) { const r = (2 + 10 * seg(p, p0 + .028, p0 + .1)) * s2; c.globalAlpha = .5 * dust; c.drawImage(st.puff, sx - r * 1.3, cy + ey * s2 - r * 1.3, r * 2.6, r * 1.6); c.globalAlpha = 1; }
  });
  // grit shaken loose from the crown
  if (shake > 0) {
    c.fillStyle = toneD;
    for (const [x, y, k2, d2] of st.debris) { const uu = seg(p, .505 + k2 * .07, .52 + k2 * .07); if (uu <= 0 || uu >= 1) continue; const yy = 31 * y - 31 * uu * uu; c.fillRect(X(x + d2), Y(yy), Math.max(1, .3 * S), Math.max(1, .3 * S)); }
    c.globalAlpha = .3 * shake; c.drawImage(st.puff, X(-50), Y(34), 100 * S, 6 * S); c.globalAlpha = 1;
  }
  // a low mist about the palace's foot, lit from behind
  g = c.createLinearGradient(0, Y(7), 0, Y(-1)); g.addColorStop(0, 'rgba(60,56,70,0)'); g.addColorStop(.6, rgb(lerp([44, 44, 60], [120, 92, 80], glowK), .35)); g.addColorStop(1, 'rgba(40,36,44,0)');
  c.fillStyle = g; c.fillRect(0, Y(7), W, 8 * S);
  // the near palms, in front of the palace
  for (const [x, z, sd] of st.palms) if (z <= 0) { const s2 = F / (Z + z); palm(c, cx + (x - ex) * s2, cy + ey * s2, s2, sd, t, lerp([7, 7, 12], [40, 30, 32], glowK * .4), glowK > .05 ? rgb(WARM, .4 * glowK) : null); }
}

// ====================================================== PERSIA: SAWA AND THE FIRE ======================================================
// The lake of Sawa in its basin under the moon; a fire temple (a chahar-taq: four arches and a dome) on the near
// shore. x right, y up, z away, in metres; the temple at TP.
const TP = [-15, 0, 52], TH = 4.4; // the temple's centre and half side
function drawFire(c, st, W, H, p, t, lay) {
  const KC = [[.615, [24, 19, -70], [-30, -6, 290]], [.675, [16, 10, -22], [-22, 0, 190]], [.73, [6, 4.2, 14], [-16, 4.4, 60]], [.79, [1, 3.4, 26], [-15, 4.8, 52]]];
  const [eye, look] = camAt(KC, p), L = lens(eye, look, lay.F, lay.cx, lay.cy), F = L.F, hy = L.hy;
  const sink = ease.io(seg(p, .645, .715)), fire = 1 - smooth(seg(p, .69, .748)), ember = bump(p, .7, .73, .75, .79), smoke = smooth(seg(p, .69, .73));
  const flick = (.86 + .09 * Math.sin(t * 11) + .05 * Math.sin(t * 23 + 1)) * fire;
  // sky: stars and the Milky Way (cached per size), then the moon of the 17th night, low in the west
  if (!st.fSky || st.fSky.width !== Math.ceil(W) || st.fSky.height !== Math.ceil(H)) {
    const sk = st.fSky = mk(W, H), g = sk.getContext('2d'), R = rng(57), q = 4, bw = Math.ceil(W / q), bh = Math.ceil(H / q), band = mk(bw, bh), bg = band.getContext('2d'), id = bg.createImageData(bw, bh);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const u = x / bw, v = y / bh, d = (u - .12 - v * .62) / .13, n = fbm(u * 7, v * 7) * .7 + fbm(u * 19 + 3, v * 19) * .3, a = Math.exp(-d * d) * Math.max(0, n - .32) * 1.5 * (1 - v * .6), k = (y * bw + x) * 4; id.data[k] = 150 + 60 * n; id.data[k + 1] = 156 + 50 * n; id.data[k + 2] = 196; id.data[k + 3] = 255 * Math.min(1, a) * .38; }
    bg.putImageData(id, 0, 0); g.filter = 'blur(2px)'; g.drawImage(band, 0, 0, W, H); g.filter = 'none';
    for (let i = 0; i < 900; i++) { const x = R() * W, y = R() ** 1.3 * H * .85, kk = R() ** 1.5, near = Math.exp(-(((x / W - .12 - y / H * .62) / .13) ** 2)); if (R() > .45 + .55 * near) continue; g.fillStyle = `rgba(238,232,216,${.2 + .7 * kk})`; const s2 = kk > .9 ? 1.9 : kk > .5 ? 1.3 : .9; g.fillRect(x, y, s2, s2); }
  }
  let g = c.createLinearGradient(0, hy - F * .9, 0, hy); g.addColorStop(0, '#03050c'); g.addColorStop(.6, '#0b1229'); g.addColorStop(1, '#262c48');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.drawImage(st.fSky, 0, 0, W, H);
  let mx = W * .3;
  if (L.dir(-.16, .27)) {
    mx = L.X; const my = L.Y, r = F * .011;
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = .45; c.drawImage(st.glowW, mx - r * 10, my - r * 10, r * 20, r * 20); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#eee8d8'; c.beginPath(); c.arc(mx, my, r, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(mx, my, r, 0, TAU); c.clip(); c.fillStyle = 'rgba(70,72,96,.5)'; c.beginPath(); c.ellipse(mx + r * 1.55, my, r * .85, r * 1.1, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(160,156,150,.25)'; [[-.3, -.2, .28], [.15, .3, .2], [-.1, .35, .16]].forEach(([a2, b2, r2]) => { c.beginPath(); c.arc(mx + a2 * r, my + b2 * r, r2 * r, 0, TAU); c.fill(); }); c.restore();
  }
  // far mountains round the basin, two bands
  const az0 = Math.atan2(L.fw[0], L.fw[2]);
  [[.05, .03, 3, [36, 40, 66]], [.032, .022, 7, [22, 24, 40]]].forEach(([h0, h1, sd, col]) => {
    c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-2, hy + 3);
    for (let x = -2; x <= W + 12; x += 8) { const az = az0 + Math.atan((x - L.cx) / F), hh = h0 + h1 * (rid(az * 5 + sd, sd) - .45) + .01 * Math.sin(az * 23 + sd); c.lineTo(x, hy - F * Math.tan(Math.max(.004, hh))); }
    c.lineTo(W + 12, hy + 3); c.closePath(); c.fill();
  });
  // the ground plane, falling to the basin
  g = c.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#24263a'); g.addColorStop(.18, '#191a24'); g.addColorStop(1, '#0b0a0d'); c.fillStyle = g; c.fillRect(0, hy, W, H - hy);
  // the lake: its bed, the water sinking from the shore to a few pools, the moon's path on the water
  const lake = (k, wob) => { const P = []; for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, r = 1 + .13 * Math.sin(3 * a + 1) + .07 * Math.sin(5 * a + wob); if (!L.pj(-46 + Math.cos(a) * 210 * r * k, -14, 300 + Math.sin(a) * 150 * r * k)) return null; P.push([L.X, L.Y]); } return P; };
  const poly = (P) => { c.beginPath(); P.forEach(([a2, b2], i) => (i ? c.lineTo(a2, b2) : c.moveTo(a2, b2))); c.closePath(); };
  const bed = lake(1.04, 0);
  if (bed) {
    poly(bed); c.fillStyle = rgb(lerp([24, 26, 40], [58, 60, 76], sink)); c.fill();
    if (sink > .05) { // the salt crust left by the water, crazed with cracks
      c.save(); poly(bed); c.clip(); c.strokeStyle = `rgba(20,20,30,${.35 * sink})`; c.lineWidth = 1; c.beginPath();
      if (!st.cracks) { const R = rng(808); st.cracks = Array.from({ length: 220 }, () => { const a2 = R() * TAU, r2 = R() ** .7, x = -46 + Math.cos(a2) * 210 * r2, z = 300 + Math.sin(a2) * 150 * r2, an = R() * TAU, l2 = 6 + R() * 22; return [x, z, x + Math.cos(an) * l2, z + Math.sin(an) * l2 * .6]; }); }
      for (const [x1, z1, x2, z2] of st.cracks) { if (L.pj(x1, -14, z1)) { const X1 = L.X, Y1 = L.Y; if (L.pj(x2, -14, z2)) { c.moveTo(X1, Y1); c.lineTo(L.X, L.Y); } } }
      c.stroke(); c.restore();
    }
  }
  const wk = 1 - .9 * sink;
  const wet = lake(Math.min(1.02, wk * 1.12 + .04), .5);
  if (wet && sink > 0) { poly(wet); c.fillStyle = 'rgba(24,24,34,.55)'; c.fill(); }
  const water = lake(wk, .9 + sink * 2);
  if (water) {
    c.save(); poly(water); c.clip();
    g = c.createLinearGradient(0, hy - 2, 0, hy + F * .07); g.addColorStop(0, '#363d62'); g.addColorStop(1, '#10162c'); c.fillStyle = g; c.fillRect(0, hy - 4, W, H);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) { const yy = hy + 2 + i * i * .1, ww = (5 + i * 1.1) * (.55 + .45 * Math.sin(t * 1.4 + i * 1.7)); c.fillStyle = `rgba(232,228,212,${.26 * (1 - i / 46)})`; c.fillRect(mx - ww / 2 + Math.sin(i * 2.3 + t) * 3, yy, ww, 1.1); }
    c.globalCompositeOperation = 'source-over'; c.restore();
    poly(water); c.strokeStyle = `rgba(200,206,226,${.22 + .2 * sink})`; c.lineWidth = 1; c.stroke();
  }
  const [tx, , tz] = TP, P3 = (x, y, z) => (L.pj(x, y, z) ? [L.X, L.Y] : null);
  const fillPts = (Q, col, holes, courses) => {
    c.beginPath(); let ok = true;
    Q.forEach((q, i) => { const s2 = P3(...q); if (!s2) ok = false; else i ? c.lineTo(s2[0], s2[1]) : c.moveTo(s2[0], s2[1]); }); c.closePath();
    (holes || []).forEach((Hh) => { Hh.forEach((q, i) => { const s2 = P3(...q); if (!s2) ok = false; else i ? c.lineTo(s2[0], s2[1]) : c.moveTo(s2[0], s2[1]); }); c.closePath(); });
    if (!ok) return false; c.fillStyle = col; c.fill('evenodd');
    if (courses) { c.save(); c.clip('evenodd'); c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 1; c.beginPath(); for (let y = .55; y < 7.8; y += .55) { const A = P3(...courses(0, y)), B = P3(...courses(1, y)); if (A && B) { c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } } c.stroke(); c.restore(); }
    return true;
  };
  // the fire's light on the ground about the temple
  if (L.pj(tx, 0, tz)) {
    const s2 = F / L.Z, r = 40 * s2 * (.6 + .4 * fire);
    c.globalCompositeOperation = 'lighter';
    g = c.createRadialGradient(L.X, L.Y, 0, L.X, L.Y, r); g.addColorStop(0, rgb([255, 150, 70], .42 * flick + .1 * ember)); g.addColorStop(.4, rgb([230, 110, 50], .13 * flick)); g.addColorStop(1, 'rgba(200,90,40,0)');
    c.save(); c.translate(L.X, L.Y); c.scale(1, .34); c.translate(-L.X, -L.Y); c.fillStyle = g; c.fillRect(L.X - r, L.Y - r, r * 2, r * 2); c.restore();
    c.globalCompositeOperation = 'source-over';
  }
  // the platform under the temple
  const PH = .9, PW = 6.2, stone = (k) => rgb(lerp([30, 30, 40], [110, 88, 72], k));
  fillPts([[tx - PW, 0, tz - PW], [tx + PW, 0, tz - PW], [tx + PW, PH, tz - PW], [tx - PW, PH, tz - PW]], stone(.25 + .3 * flick));
  fillPts([[tx + PW, 0, tz - PW], [tx + PW, 0, tz + PW], [tx + PW, PH, tz + PW], [tx + PW, PH, tz - PW]], stone(.14 + .2 * flick));
  fillPts([[tx - PW, PH, tz - PW], [tx + PW, PH, tz - PW], [tx + PW, PH, tz + PW], [tx - PW, PH, tz + PW]], stone(.32 + .35 * flick));
  // the chahar-taq: piers, arches, a dome; seen through its arches the fire on its altar
  const archPts = (face, k) => { // the opening of a face, k = 0 outer plane, 1 inner plane
    const out = [], hw = 2.4, spring = PH + 3.4, rise = 2.5, d = TH - 1.6 * k;
    for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 - i / 20), uu = Math.cos(a) * hw, v = spring + Math.sin(a) * rise; out.push(face(uu, v, d)); }
    out.push(face(hw, PH, d)); out.unshift(face(-hw, PH, d)); return out;
  };
  const front = (uu, v, d) => [tx + uu, v, tz - d], right = (uu, v, d) => [tx + d, v, tz + uu], T0 = PH, T1 = PH + 7;
  const inner = (k) => rgb(lerp([22, 18, 22], [250, 160, 80], Math.min(1, k)));
  fillPts([[tx - TH, T0, tz + TH], [tx + TH, T0, tz + TH], [tx + TH, T1, tz + TH], [tx - TH, T1, tz + TH]], inner(.95 * flick + .2 * ember), [archPts((uu, v) => [tx - uu, v, tz + TH], 0)]);
  fillPts([[tx - TH, T0, tz - TH], [tx - TH, T0, tz + TH], [tx - TH, T1, tz + TH], [tx - TH, T1, tz - TH]], inner(.8 * flick + .15 * ember), [archPts((uu, v) => [tx - TH, v, tz - uu], 0)]);
  fillPts([[tx - .9, T0, tz - .9], [tx + .9, T0, tz - .9], [tx + .7, T0 + 1.2, tz - .7], [tx - .7, T0 + 1.2, tz - .7]], rgb(lerp([40, 32, 30], [160, 96, 58], fire)));
  if (L.pj(tx, T0 + 1.25, tz)) {
    const bx = L.X, by = L.Y, s2 = F / L.Z;
    c.globalCompositeOperation = 'lighter';
    if (fire > .01) {
      c.globalAlpha = Math.min(1, .6 * flick); c.drawImage(st.glowFire, bx - s2 * 2.6, by - s2 * 5 * fire - s2 * 1.6, s2 * 5.2, s2 * (6 + 4.5 * fire)); c.globalAlpha = 1;
      for (let i = 0; i < 11; i++) { // the tongues of the flame
        const ph = t * (5 + i) + i * 2.1, hh = (2 + 2.2 * ((i * .37) % 1)) * s2 * fire * (.8 + .2 * Math.sin(ph)), ww = (.25 + .22 * ((i * .61) % 1)) * s2, ox = (i - 5) * .13 * s2 + Math.sin(ph * .7) * .12 * s2;
        c.fillStyle = i % 3 ? 'rgba(255,136,48,.5)' : 'rgba(255,222,150,.62)';
        c.beginPath(); c.moveTo(bx + ox - ww, by); c.quadraticCurveTo(bx + ox - ww * .8, by - hh * .55, bx + ox + Math.sin(ph) * ww * .8, by - hh); c.quadraticCurveTo(bx + ox + ww * .8, by - hh * .55, bx + ox + ww, by); c.closePath(); c.fill();
      }
    }
    if (ember > 0) { for (let i = 0; i < 16; i++) { const ox = ((i * .37) % 1 - .5) * 1.4 * s2, oy = ((i * .71) % 1) * .2 * s2; c.fillStyle = `rgba(255,90,40,${(.5 + .5 * Math.sin(t * 3 + i)) * .8 * ember})`; c.fillRect(bx + ox, by - oy, Math.max(1, .1 * s2), Math.max(1, .1 * s2)); } }
    c.globalCompositeOperation = 'source-over';
  }
  // the near faces: right side and front, each with its arch and the depth of its reveal (only where it faces the eye)
  const lit = (k) => stone(.05 + .22 * k);
  const reveal = (fn, k) => { const o = archPts(fn, 0), i2 = archPts(fn, 1); for (let j = 0; j < o.length - 1; j++) if (dot3(cross3(sub3(o[j + 1], o[j]), sub3(i2[j], o[j])), sub3(eye, o[j])) > 0) fillPts([o[j], o[j + 1], i2[j + 1], i2[j]], inner(k)); };
  fillPts([[tx + TH, T0, tz - TH], [tx + TH, T0, tz + TH], [tx + TH, T1, tz + TH], [tx + TH, T1, tz - TH]], lit(.25 + .2 * flick), [archPts(right, 0)], (uu, y) => [tx + TH, y, tz - TH + uu * TH * 2]);
  reveal(right, .85 * flick + .1 * ember);
  fillPts([[tx - TH, T0, tz - TH], [tx + TH, T0, tz - TH], [tx + TH, T1, tz - TH], [tx - TH, T1, tz - TH]], lit(.4 + .25 * flick), [archPts(front, 0)], (uu, y) => [tx - TH + uu * TH * 2, y, tz - TH]);
  reveal(front, 1 * flick + .12 * ember);
  // the firelight thrown out of the arches over the platform and the ground
  c.globalCompositeOperation = 'lighter';
  [[front, [0, 0, -1]], [right, [1, 0, 0]]].forEach(([fn, n]) => {
    for (const [sp, al] of [[0, .2], [1.6, .12], [3.4, .07]]) {
      const A = fn(-2.4 - sp * .3, PH + .02, TH), B = fn(2.4 + sp * .3, PH + .02, TH), C = [B[0] + n[0] * (9 + sp) + n[2] * -(2.5 + sp), .02, B[2] + n[2] * (9 + sp) + n[0] * (2.5 + sp)], D = [A[0] + n[0] * (9 + sp) - n[2] * -(2.5 + sp), .02, A[2] + n[2] * (9 + sp) - n[0] * (2.5 + sp)];
      const pa = [A, B, C, D].map((q) => P3(...q)); if (pa.some((q) => !q)) continue;
      const m0 = P3(...fn(0, PH, TH)), m1 = P3((C[0] + D[0]) / 2, 0, (C[2] + D[2]) / 2); if (!m0 || !m1) continue;
      const g2 = c.createLinearGradient(m0[0], m0[1], m1[0], m1[1]); g2.addColorStop(0, `rgba(255,150,70,${al * (flick + .15 * ember)})`); g2.addColorStop(1, 'rgba(255,130,60,0)');
      c.fillStyle = g2; c.beginPath(); pa.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill();
    }
  });
  c.globalCompositeOperation = 'source-over';
  // the top: a square drum, its roof, then the dome
  fillPts([[tx - TH, T1, tz - TH], [tx + TH, T1, tz - TH], [tx + TH, T1 + .8, tz - TH], [tx - TH, T1 + .8, tz - TH]], stone(.45));
  fillPts([[tx + TH, T1, tz - TH], [tx + TH, T1, tz + TH], [tx + TH, T1 + .8, tz + TH], [tx + TH, T1 + .8, tz - TH]], stone(.3));
  fillPts([[tx - TH, T1 + .8, tz - TH], [tx + TH, T1 + .8, tz - TH], [tx + TH, T1 + .8, tz + TH], [tx - TH, T1 + .8, tz + TH]], stone(.4));
  { const pts = []; for (let i = 0; i <= 8; i++) for (let j = 0; j < 16; j++) { const a = i / 8 * Math.PI / 2, b2 = j / 16 * TAU, s2 = P3(tx + Math.cos(b2) * Math.cos(a) * 3.9, T1 + .8 + Math.sin(a) * 3.4, tz + Math.sin(b2) * Math.cos(a) * 3.9); if (s2) pts.push(s2); }
    if (pts.length > 3) { pts.sort((a, b2) => a[0] - b2[0] || a[1] - b2[1]); const cr = (o, a, b2) => (a[0] - o[0]) * (b2[1] - o[1]) - (a[1] - o[1]) * (b2[0] - o[0]); const lo = [], up = []; for (const q of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = pts.length - 1; i >= 0; i--) { const q = pts[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } const hull = lo.slice(0, -1).concat(up.slice(0, -1));
      c.beginPath(); hull.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath();
      const top = Math.min(...hull.map((q) => q[1])), bot = Math.max(...hull.map((q) => q[1])), lft = Math.min(...hull.map((q) => q[0])), rgt = Math.max(...hull.map((q) => q[0]));
      g = c.createLinearGradient(lft, top, rgt, bot); g.addColorStop(0, '#585868'); g.addColorStop(.5, '#2c2c38'); g.addColorStop(1, '#16151c'); c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(206,210,232,.22)'; c.lineWidth = 1; c.stroke();
    }
  }
  // the smoke that rises once the fire has sunk
  if (smoke > 0) {
    for (let i = 0; i < 30; i++) {
      const ph = ((t * .05 + i / 30) % 1), y = T1 + 1 + ph * 30, x = tx + Math.sin(ph * 5 + i) * (1 + ph * 6) - ph * 9;
      if (!L.pj(x, y, tz)) continue; const r = (1.4 + ph * 8) * F / L.Z;
      c.globalAlpha = .3 * smoke * Math.sin(Math.PI * ph) * (1 - .5 * seg(p, .76, .8)); c.drawImage(st.puffD, L.X - r, L.Y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }
}

// ====================================================== THE SCENE ======================================================
S.mawlid = {
  init(el, st) {
    st.cv = el.querySelector('.cv'); st.c = st.cv.getContext('2d');
  },
  frame(p, t, el, st) {
    const cv = st.cv; fit(cv);
    const W = cv.clientWidth, H = cv.clientHeight; if (W < 2 || H < 2) return;
    const c = st.c, dpr = cv.width / W;
    if (!st.ready) { // made on the first frame, not at page load
      st.ready = 1; meccaInit(st);
      const tint = (stops) => sprite(stops, 128);
      st.glowW = tint([[0, 'rgba(255,250,236,1)'], [.2, 'rgba(255,244,220,.45)'], [.5, 'rgba(255,236,200,.1)'], [1, 'rgba(255,230,190,0)']]);
      st.glowWarm = tint([[0, 'rgba(255,226,170,1)'], [.25, 'rgba(255,206,140,.42)'], [.6, 'rgba(255,190,120,.1)'], [1, 'rgba(255,180,110,0)']]);
      st.glowFire = tint([[0, 'rgba(255,200,120,1)'], [.3, 'rgba(255,140,60,.45)'], [.7, 'rgba(220,90,40,.1)'], [1, 'rgba(200,70,30,0)']]);
      st.puff = sprite([[0, 'rgba(150,132,116,.75)'], [.5, 'rgba(130,114,100,.3)'], [1, 'rgba(120,104,92,0)']]);
      st.puffD = sprite([[0, 'rgba(66,62,66,.75)'], [.5, 'rgba(60,56,60,.32)'], [1, 'rgba(56,52,56,0)']]);
    }
    const phone = W < H * .8, lay = { phone, F: phone ? W * 1.15 : Math.min(H * 1.3, W * .9), cx: phone ? W / 2 : W * .42, cy: H * (phone ? .66 : .55) };
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    // which shot, and the dips between them
    let veil = 0, vcol = LIGHT;
    if (p < .47) { drawMecca(c, st, W, H, p, t, lay, false); veil = smooth(seg(p, .425, .47)); }
    else if (p < .625) { drawIwan(c, st, W, H, p, t, lay); veil = Math.max(1 - smooth(seg(p, .47, .515)), smooth(seg(p, .605, .625))); if (p > .55) vcol = [4, 5, 10]; }
    else if (p < .775) { drawFire(c, st, W, H, p, t, lay); veil = Math.max(1 - smooth(seg(p, .625, .645)), smooth(seg(p, .755, .775))); vcol = [4, 5, 10]; }
    else { drawMecca(c, st, W, H, p, t, lay, true); veil = 1 - smooth(seg(p, .775, .805)); vcol = [4, 5, 10]; }
    // grade: a vignette and a fine grain, then the dip
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const vg = c.createRadialGradient(W * .45, H * .55, Math.min(W, H) * .3, W * .45, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(6,6,10,0)'); vg.addColorStop(1, 'rgba(6,6,10,.55)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'overlay'; c.globalAlpha = .06; c.fillStyle = st.grain || (st.grain = c.createPattern(grainTile(), 'repeat')); c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (veil > .002) { if (vcol === LIGHT) { c.globalCompositeOperation = 'screen'; c.fillStyle = rgb([255, 244, 222], veil); c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; } else { c.fillStyle = rgb(vcol, veil); c.fillRect(0, 0, W, H); } }
  },
};
})();
