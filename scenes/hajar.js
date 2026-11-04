(() => {
// hajar — «بناء الكعبة»: Quraysh rebuild the House and the Prophet ﷺ sets the Black Stone in its place. al-Kafi 4:217–218
// (the chapter on Tubba', the Elephant, Zamzam and Quraysh's rebuilding of the House): hadith 3 from al-Sadiq (ع) and
// hadith 4 (marfu'), which names the four men. One day's light, morning to evening, in the court of the House; a side
// view in metres (x right, y up, z away from the camera), the camera at about a roof's height:
//   p −.05 → .24  morning: the House pulled down to Ibrahim's foundations, its stones in heaps round it (4:217), a stack
//                 of timber by the court; the men stand off from it, afraid to build (4:217).
//      .24 → .355 the walls rise round the house, a course of stone and a course of wood, men carrying stones from the
//                 heaps; they stop at the place of the Black Stone, a gap left in the east corner. The Stone waits on a
//                 low plinth of old stones.
//      .355 → .53 the four clans gather about the Stone and quarrel: arms raised, the groups pressing in (4:217–218).
//      .53 → .64  they agree on the first man through the gate and turn to it; he comes in from the gate on the left
//                 and walks to the Stone, and they part for him (4:217–218).
//      .64 → .735 he spreads his rida' on the ground and lays the Stone in the middle of it (4:218).
//      .735 → .87 he calls a man from each quarter of Quraysh; the four come to the corners, take hold, lift it, and
//                 carry it to the corner (4:218).
//      .87 → .925 he takes it and sets it in its place (4:217): sleeves only, no hands.
//      .925 → 1.05 the walls go up to their full height and the door is set; evening; the House is hung with striped
//                 Yemeni cloths, the wasa'id (4:218), the Stone left bare at its corner.
// The Prophet is drawn only by Holy.draw (adult, veiled, the gold disc). The men of Quraysh are faceless cloaked shapes;
// their head cloths stay earth-toned so only the Prophet's white veil reads as white at the head.
// Everything follows from p; t moves only cloth, the Stone's glint and the arms of the quarrel.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const hash = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const tri = (x) => 1 - Math.abs((((x % 2) + 2) % 2) - 1); // 0 → 1 → 0 every 2
function tube(g, pts, w0, w1) { // a tapered stroke as one filled outline
  const L = [], R = [];
  pts.forEach((q, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = mix(w0, w1, i / (pts.length - 1)) / 2;
    L.push([q[0] - dy / l * w, q[1] + dx / l * w]); R.push([q[0] + dy / l * w, q[1] - dx / l * w]);
  });
  g.moveTo(L[0][0], L[0][1]); L.forEach((q) => g.lineTo(q[0], q[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
}
// a walker through the scene: keys [p, x, z]; he walks between keys whose places differ and stands where they agree
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

// ---------- the House: a box turned so the Black Stone's (east) corner faces the camera ----------
const KX = -1, KZ = 31, KHA = 6.2, KHB = 5, KTH = .52, TH = .9; // centre, half length, half width, turn, wall thickness
const kc = Math.cos(KTH), ks = Math.sin(KTH);
const corner = (su, sv) => [KX + su * KHA * kc - sv * KHB * ks, KZ + su * KHA * ks + sv * KHB * kc];
const CO = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)]; // the corners of the Black Stone, Iraq, Sham, Yemen
const FC = CO.map((a, i) => { // faces: corner i to corner i+1, with the outward normal
  const b = CO[(i + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), mx = (a[0] + b[0]) / 2 - KX, mz = (a[1] + b[1]) / 2 - KZ;
  let n = [dz / L, -dx / L]; if (n[0] * mx + n[1] * mz < 0) n = [-n[0], -n[1]];
  return { a, b, L, n };
});
const CI = CO.map((q, i) => { const n0 = FC[i].n, n1 = FC[(i + 3) % 4].n; return [q[0] - TH * (n0[0] + n1[0]), q[1] - TH * (n0[1] + n1[1])]; }); // the inner corners
const SC = CO[0], BIS = [(SC[0] - KX) / Math.hypot(SC[0] - KX, SC[1] - KZ), (SC[1] - KZ) / Math.hypot(SC[0] - KX, SC[1] - KZ)];
const SL = [SC[0] + BIS[0] * .14, 1.47, SC[1] + BIS[1] * .14]; // the Stone's place in the corner
// courses: Ibrahim's foundation, then stone and wood in turn, up to the roof
const LAY = [[0, .5, 'f']];
for (let y = .5, k = 0; y < 8.6; k++) { const hh = k % 2 ? .14 : .56; LAY.push([y, y + hh, k % 2 ? 'w' : 's']); y += hh; }
const TOP = LAY[LAY.length - 1][1];
const level = (p) => .5 + 1.4 * seg(p, .24, .355) + (TOP - 1.9) * smooth(seg(p, .925, .972)); // the built height
function topAt(f, u, L, rag) { // the top of face f at u: the course being laid goes round the house from the Black Stone's corner
  let j = 1; while (j < LAY.length - 1 && LAY[j][1] <= L) j++;
  const [y0, y1] = LAY[j], fr = c01((L - y0) / (y1 - y0)), s = (f + u) / 4;
  let y = L >= TOP - 1e-3 ? TOP : s < fr ? y1 : y0;
  if (rag > 0) y += rag * (.16 + .14 * Math.sin(u * 23 + f * 3.1) * Math.sin(u * 9.7 + f * 2));
  return y;
}
const DOOR = [.2, .3, 2.1, 4.5]; // on the face of the Black Stone and Iraq corners: u from, u to, y from, y to

// ---------- places ----------
const GX = -16.5, GZ = 27.2; // the gate of the court
const PL = [-.2, 22.6]; // the plinth where the Stone waits
const P1 = [-2.4, 21.95], P2 = [-3.05, 22.75]; // where he stands by the cloth, then by the corner
const CL = [-2.4, 20.35], CL2 = [-2.75, 20.95], CHX = 1.15, CHZ = .7; // the cloth's centre on the ground, then carried; half sizes
const KP = [[.555, GX, GZ - .1], [.64, P1[0], P1[1]], [.838, P1[0], P1[1]], [.868, P2[0], P2[1]]];
const CLANS = [ // the four quarters of Quraysh at 4:218: robe colour; before, at the quarrel, after (a ring); facing in the quarrel
  { cl: [52, 62, 108], A0: [-12.6, 21.4], A1: [-5.2, 21.3], A2: [-7.4, 20.5], f1: 1 }, // 'Abd Shams
  { cl: [186, 134, 58], A0: [-10.2, 18.4], A1: [-4.7, 18.3], A2: [-6.2, 17.4], f1: 1 }, // Asad
  { cl: [150, 52, 44], A0: [10.6, 21.2], A1: [2.8, 21.4], A2: [4.0, 21.2], f1: -1 }, // Makhzum
  { cl: [84, 108, 70], A0: [8.2, 18.2], A1: [2.1, 18.4], A2: [3.2, 17.4], f1: -1 }, // Sahm
];
const OFF = [[.55, 0], [-.35, .75], [.75, .62], [-.55, -.62], [.3, -.8]]; // member 0 is the clan's elder, nearest the Stone
const ECORN = [[-1, 1], [-1, -1], [1, 1], [1, -1]]; // each elder's corner of the cloth (x side, z side)
const HEAPS = [[-10.6, 22.4, 1.05], [5.9, 23.2, .95], [-13.9, 31.4, 1.2], [11.3, 30.6, 1.1], [-.5, 41.5, 1.1]];
const WORK = [[0, [-7.3, 27.4]], [0, [-6.4, 26.2]], [0, [-8.2, 28.9]], [1, [2.0, 25.9]], [1, [3.4, 26.7]], [1, [.6, 25.1]]]; // heap, wall
const TIMB = [7.4, 19.6]; // the timber stack

// ---------- the land: the flat court in its valley, the hills closing round, far ranges ----------
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
const SAND = [230, 206, 162], SANDD = [210, 182, 138], ROCK = [156, 112, 92], ROCKD = [104, 88, 86], FAR = [150, 138, 170];
function albedo(x, z, h) {
  const r = c01((h - 2) / 30), mot = c01(.5 + .5 * Math.sin(x * .09 + Math.sin(z * .07) * 2) * Math.sin(z * .11 - x * .05));
  let a = lerp(lerp(SANDD, SAND, mot), lerp(ROCK, ROCKD, c01(.5 + .5 * Math.sin(x * .013 + z * .021 + h * .03))), r);
  if (z < 45) { const mt = .93 + .05 * Math.sin(x * 1.7 + z * 2.3) * Math.sin(z * 1.9 - x * .8) + .04 * Math.sin(x * 4.1 + z * 3.3); a = a.map((v) => v * mt); } // the near court mottled: grit and trodden dust
  const far = smooth(c01((z - 650) / 900)); if (far > 0) a = lerp(a, FAR, far);
  return a;
}
// ---------- light keys: p, sky top, sky mid, horizon, sun colour, sky light, haze, sun elevation (deg), azimuth (rad, 0 = ahead, + = right), fog ----------
const LK = [
  [-.06, [42, 96, 168], [108, 158, 210], [236, 218, 192], [255, 230, 194], [150, 152, 166], [200, 204, 216], 26, -2.3, 2600],
  [.25, [26, 84, 160], [86, 148, 210], [216, 224, 228], [255, 244, 224], [152, 160, 176], [186, 202, 222], 52, -2.0, 3000],
  [.55, [22, 76, 156], [80, 142, 206], [222, 224, 216], [255, 246, 226], [152, 158, 172], [188, 200, 218], 64, 2.7, 3000],
  [.86, [28, 74, 150], [96, 144, 200], [236, 220, 196], [255, 236, 204], [148, 150, 164], [202, 204, 214], 40, 2.3, 2800],
  [.96, [34, 68, 140], [112, 138, 190], [246, 208, 172], [255, 212, 162], [144, 138, 154], [230, 198, 170], 17, 1.75, 2500],
  [1.06, [38, 58, 124], [128, 124, 172], [250, 188, 148], [255, 184, 124], [134, 122, 144], [232, 180, 152], 7, 1.35, 2300],
];
// camera keys: p, the point it looks at (x, z), its own z, its height
const CK = [
  [-.06, -.6, 26, 7.5, 2.6], [.22, -.8, 25.5, 8, 2.5], [.36, -1.2, 21.5, 8.5, 2.5], [.5, -1.2, 21.2, 9, 2.5],
  [.565, -7.6, 24, 7.5, 2.5], [.625, -3.6, 22.2, 8.5, 2.6], [.665, -2.4, 21.2, 11.5, 2.9], [.78, -2.4, 21.2, 11.5, 2.9],
  [.86, -2.8, 21.9, 12.3, 2.7], [.925, -3.1, 22.4, 12.6, 2.6], [1.0, -1.3, 29, 5, 2.1], [1.06, -1.3, 29, 4.4, 2.1],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const poly = (g, sh, lean = 0) => { for (let i = 0; i < sh.length; i += 2) { const u = sh[i] + lean * sh[i + 1]; i ? g.lineTo(u, sh[i + 1]) : g.moveTo(u, sh[i + 1]); } g.closePath(); };

S.hajar = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.NS = 56; st.NK = 96;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    const R = rng(7319);
    const HS = []; // houses: [x0, x1, z0, depth, height, albedo, seed, y0]
    const TONE = [[222, 196, 156], [204, 172, 132], [232, 218, 190], [190, 156, 118], [214, 190, 160]];
    const row = (xa, xb, za, zb, h0, h1, skip) => { for (let x = xa; x < xb;) { const w = 3.2 + R() * 4.2; if (!skip || x + w < skip[0] || x > skip[1]) HS.push([x, x + w, za + R() * (zb - za), 5 + R() * 4, h0 + R() * (h1 - h0), TONE[(R() * 5) | 0], R(), 0]); x += w + R() * .6; } };
    row(-36, -13.6, 26.9, 28.6, 3.6, 6.4, [GX - 2.1, GX + 2.1]); // the left side of the court, the gate among them
    row(15, 40, 25.5, 29, 3.2, 5.4);
    row(-46, 46, 56, 66, 4, 7.5); // behind the House
    row(-70, 70, 76, 92, 4.5, 9);
    for (let i = 0; i < 90; i++) { const x = -260 + R() * 520, z = 150 + R() * 260, y = hgt(x, z); if (y > 45) continue; HS.push([x, x + 4 + R() * 6, z, 6, 4 + R() * 5, TONE[(R() * 5) | 0], R(), y - .5]); } // up the lower slopes
    st.HS = HS;
    st.blk = Array.from({ length: 40 }, () => [-13 + R() * 26, 10 + R() * 13, .5 + R() * .4, R()]).filter(([x, z]) => !(x > -5.2 && x < 1.4 && z > 18.6) && !(x > 5 && x < 10 && z > 18.5 && z < 21)).slice(0, 16); // squared stones lying about the court
    st.peb = Array.from({ length: 420 }, () => [-32 + R() * 64, 7 + R() ** 1.3 * 48, .04 + R() ** 2 * .16, R()]);
    st.cirrus = Array.from({ length: 9 }, () => [R() * 1.6 - .3, .1 + R() * .32, .2 + R() * .4, R()]);
    st.spect = [[-12.6, 24.6, [120, 96, 80]], [-11.4, 25.4, [70, 66, 90]], [-13.2, 22.9, [150, 128, 96]], [10.1, 24.0, [96, 80, 70]], [11.6, 25.2, [140, 110, 80]], [9.0, 22.2, [80, 92, 110]], [-9.6, 38.5, [110, 90, 70]], [8.6, 39.5, [90, 80, 100]]];
    st.memb = CLANS.map((G, g) => OFF.map(([dx, dz], m) => [dx * G.f1 + (R() - .5) * .2, dz + (R() - .5) * .2, .95 + R() * .1, R(), R()]));
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
    const sunSide = Math.sign(sun[0]) || 1, front = c01(-sun[2]);
    const fogA = (zr) => Math.min(.88, (1 - Math.exp(-zr / fogL)) * .95);
    const fig = (base, zr = 8) => { const k = [0, 1, 2].map((j) => base[j] / 255 * (amb[j] * .62 + sunC[j] * (.32 + .3 * front))); return lerp(k, haze, fogA(zr) * .9); };
    const wall = (base, lam, zr, a = .72) => lerp(base.map((v, j) => v / 255 * (amb[j] * a + sunC[j] * lam * .9)), haze, fogA(zr) * .9);
    const eve = smooth(seg(p, .93, 1.04));
    // ----- sky -----
    const sg = c.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.58, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    { // the sun's glare from the side it stands on
      const sx = sun[2] > .05 ? W / 2 + sun[0] / sun[2] * F : sunSide > 0 ? W * 1.3 : -W * .3, syy = sun[2] > .05 ? hy - sun[1] / sun[2] * F : hy * .55;
      const X = Math.max(-W * .4, Math.min(W * 1.4, sx)), Y = Math.max(-H * .2, Math.min(hy, syy));
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(X, Y, 0, X, Y, F * (1 + .4 * eve)); g.addColorStop(0, rgb(sunC, .42 + .2 * eve)); g.addColorStop(.18, rgb(sunC, .16)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 4);
      c.globalCompositeOperation = 'source-over';
      if (sx > -20 && sx < W + 20 && sun[2] > .05) { c.fillStyle = 'rgba(255,250,236,.97)'; c.beginPath(); c.arc(sx, syy, F * .012, 0, TAU); c.fill(); }
    }
    st.cirrus.forEach(([u, v, w, k]) => {
      const x = ((u * W - camX * 8 + p * W * .05) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = v * hy, rw = w * W * .5, rh = rw * .05;
      c.save(); c.translate(x, y); c.rotate(-.04 + k * .08); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(lerp([255, 255, 255], sunC, .3 + .4 * eve), .3 + .2 * k)); g.addColorStop(1, rgb([255, 255, 255], 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
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
            const lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl), sky = .62 + .38 / nl;
            const al = albedo(x, z, h), n = (i * NC + k / 2) * 3;
            for (let j = 0; j < 3; j++) TC[n + j] = mix(al[j] / 255 * (amb[j] * sky * .68 + sunC[j] * lam * .8), haze[j], fa);
          }
        }
      }
      terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .12);
    }
    // ----- shadows on the ground, away from the sun -----
    const shH = Math.hypot(sun[0], sun[2]) || 1e-6, shL = Math.min(3.2, shH / Math.max(.12, sun[1])), shD = [-sun[0] / shH * shL, -sun[2] / shH * shL];
    const shCol = lerp(amb, [30, 30, 60], .55);
    const shadow = (x, z, hm, w, a = .26) => {
      if (z - camZ < 1) return;
      const tx = x + shD[0] * hm, tz = Math.max(camZ + 1.5, z + shD[1] * hm);
      const X0 = PX(x, z), Y0 = PY(0, z), X1 = PX(tx, tz), Y1 = PY(0, tz), ww = w * F / (z - camZ);
      c.save(); c.translate(X0, Y0); c.scale(ww, ww * .24); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(shCol, a)); g.addColorStop(.6, rgb(shCol, a * .7)); g.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
      const g2 = c.createLinearGradient(X0, Y0, X1, Y1); g2.addColorStop(0, rgb(shCol, a * .8)); g2.addColorStop(1, rgb(shCol, 0)); c.fillStyle = g2;
      c.beginPath(); c.moveTo(X0 - ww * .5, Y0); c.lineTo(X1 - ww * .25, Y1); c.lineTo(X1 + ww * .25, Y1); c.lineTo(X0 + ww * .5, Y0); c.closePath(); c.fill();
    };
    const L = level(p), rag = 1 - smooth(seg(p, .2, .26));
    { // the House's shadow: its base and each wall swept along the light, as one shape
      const hh = L + rag * .2, sweep = (q) => [q[0] + shD[0] * hh, q[1] + shD[1] * hh];
      c.beginPath();
      const quad = (pts) => { const a = pts.map(([x, z]) => P3(x, 0, Math.max(camZ + 1, z))); let s = 0; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; s += a[i][0] * a[j][1] - a[j][0] * a[i][1]; } if (s < 0) a.reverse(); a.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); };
      quad(CO);
      for (let i = 0; i < 4; i++) { const a = CO[i], b = CO[(i + 1) % 4]; quad([a, b, sweep(b), sweep(a)]); }
      c.fillStyle = rgb(shCol, .3); c.fill('nonzero');
    }
    // pebbles and grit on the court
    {
      c.fillStyle = rgb(wall([120, 100, 80], .4, 20), .5);
      c.beginPath();
      st.peb.forEach(([x, z, r]) => { const zr = z - camZ; if (zr < 2) return; const X = PX(x, z); if (X < -10 || X > W + 10) return; const s = F / zr, Y = PY(0, z); c.moveTo(X + r * s, Y); c.ellipse(X, Y, r * s, Math.max(.6, r * s * camY / zr), 0, 0, TAU); });
      c.fill();
    }

    const items = [];
    // ----- the houses round the court, and up the slopes -----
    const glowW = smooth(seg(p, .985, 1.05));
    st.HS.forEach(([x0, x1, z0, d, h, alb, seed, y0]) => {
      const zr = z0 - camZ; if (zr < 2) return;
      const X0 = PX(x0, z0), X1 = PX(x1, z0); if (X1 < -60 || X0 > W + 60) return;
      items.push([zr, () => {
        const s = F / zr, Yb = PY(y0, z0), Yt = PY(y0 + h, z0), lamF = Math.max(0, -sun[2]);
        const cf = wall(alb, lamF, zr, .66), side = camX < x0 ? -1 : camX > x1 ? 1 : 0;
        if (side) { // the side toward the camera
          const xs = side < 0 ? x0 : x1, lamS = Math.max(0, side * sun[0]), cs = wall(alb, lamS, zr, .54);
          const a = P3(xs, y0, z0), b = P3(xs, y0, z0 + d), e = P3(xs, y0 + h, z0 + d), f = P3(xs, y0 + h, z0);
          c.fillStyle = rgb(cs); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill();
        }
        if (y0 + h < camY) { const a = P3(x0, y0 + h, z0), b = P3(x1, y0 + h, z0), e = P3(x1, y0 + h, z0 + d), f = P3(x0, y0 + h, z0 + d); c.fillStyle = rgb(wall(alb, Math.max(0, sun[1]), zr, .8)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill(); }
        c.fillStyle = rgb(cf); c.fillRect(X0, Yt, X1 - X0, Yb - Yt);
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .22)); c.fillRect(X0 - .08 * s, Yt - .2 * s, X1 - X0 + .16 * s, .2 * s); // the parapet
        if (s > 2) {
          const dk = rgb(lerp(cf, [30, 22, 18], .55)), w = X1 - X0;
          if (seed > .25) { c.fillStyle = dk; c.fillRect(X0 + w * (.15 + seed * .5), Yb - 1.9 * s, .85 * s, 1.9 * s); } // a door
          const nw = Math.max(1, Math.round(w / s / 2.2)), win = lerp([40, 30, 26], [255, 196, 120], glowW * (seed > .4 ? 1 : .2));
          for (let j = 0; j < nw; j++) { const wx = X0 + (j + .5) * w / nw - .25 * s; if (h > 4.4) { c.fillStyle = rgb(lerp(cf, win, .8)); c.fillRect(wx, Yt + 1.0 * s, .5 * s, .7 * s); } }
          c.fillStyle = dk; for (let j = 0; j < w / s / .7 - 1; j++) c.fillRect(X0 + (j + .6) * .7 * s, Yt + .35 * s, Math.max(1, .1 * s), Math.max(1, .1 * s)); // the ends of the roof beams
        }
      }]);
    });
    // ----- the gate of the court: an arch between the houses, dark inside -----
    {
      const zr = GZ - camZ, s = F / zr, X = PX(GX, GZ);
      if (zr > 2 && X > -6 * s && X < W + 6 * s) items.push([zr, () => {
        const Yb = PY(0, GZ), w = 4.2 * s, h = 4.9 * s, cf = wall([226, 208, 176], Math.max(0, -sun[2]), zr, .66);
        const side = camX > GX + 2.1 ? 1 : -1, xs = GX + side * 2.1, a = P3(xs, 0, GZ), b = P3(xs, 0, GZ + 3), e = P3(xs, 4.9, GZ + 3), f = P3(xs, 4.9, GZ);
        c.fillStyle = rgb(wall([226, 208, 176], Math.max(0, side * sun[0]), zr, .54)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fill();
        c.fillStyle = rgb(cf); c.fillRect(X - w / 2, Yb - h, w, h);
        const ow = 1.8 * s, oh = 2.5 * s, g = c.createLinearGradient(0, Yb - oh - ow / 2, 0, Yb); g.addColorStop(0, 'rgba(24,16,12,1)'); g.addColorStop(1, rgb(lerp([40, 30, 24], shCol, .3)));
        c.fillStyle = g; c.beginPath(); c.moveTo(X - ow / 2, Yb); c.lineTo(X - ow / 2, Yb - oh); c.arc(X, Yb - oh, ow / 2, Math.PI, TAU); c.lineTo(X + ow / 2, Yb); c.closePath(); c.fill();
        c.strokeStyle = rgb(lerp(cf, [255, 248, 230], .3)); c.lineWidth = Math.max(1, .14 * s); c.beginPath(); c.arc(X, Yb - oh, ow / 2 + .12 * s, Math.PI, TAU); c.stroke(); // the arch's rim
        c.fillStyle = rgb(lerp(cf, [255, 246, 226], .25)); c.fillRect(X - w / 2 - .1 * s, Yb - h - .24 * s, w + .2 * s, .24 * s);
        c.fillStyle = rgb(lerp(cf, [60, 44, 34], .5)); for (let j = 0; j < 5; j++) c.fillRect(X - w / 2 + (j + .5) * w / 5 - .06 * s, Yb - h + .35 * s, .12 * s, .12 * s);
      }]);
    }
    // ----- the heaps of the House's stones, used up as the walls rise -----
    const used = .75 * seg(p, .24, .355) + .25 * seg(p, .925, 1);
    HEAPS.forEach(([x, z, sz], hi) => {
      const zr = z - camZ, k = sz * (1 - used * (.85 - hi * .05)); if (zr < 2 || k < .06) return;
      const s = F / zr, X = PX(x, z); if (X < -4 * s || X > W + 4 * s) return;
      shadow(x, z, 1.1 * k, 2.4 * Math.sqrt(k), .2);
      items.push([zr, () => {
        const Y = PY(0, z), w = 1.5 * Math.sqrt(k) * s, hh = 1.0 * k * s, base = [150, 140, 126];
        c.fillStyle = rgb(wall(lerp(base, [40, 40, 50], .35), .3, zr, .6)); c.beginPath(); c.moveTo(X - w, Y); c.quadraticCurveTo(X - w * .5, Y - hh * 1.2, X, Y - hh); c.quadraticCurveTo(X + w * .5, Y - hh * 1.2, X + w, Y); c.closePath(); c.fill();
        for (let j = 0; j < 14 * k + 3; j++) { // squared stones on the heap
          const u = (hash(hi, j) - .5) * 1.7, v = (1 - u * u) * hash(j, hi, 2) * .85, bw = (.32 + hash(j, 7) * .2) * s, bh = bw * .55, bx = X + u * w * .9, by = Y - v * hh - bh;
          const lam = c01(.4 + sunSide * .3), col = wall(lerp(base, [255, 240, 220], hash(j, hi, 5) * .2), lam, zr, .62);
          c.fillStyle = rgb(col); c.fillRect(bx - bw / 2, by, bw, bh);
          c.fillStyle = rgb(lerp(col, [255, 250, 240], .25)); c.fillRect(bx - bw / 2, by, bw, Math.max(1, bh * .25));
          c.fillStyle = rgb(lerp(col, [20, 20, 30], .35)); c.fillRect(sunSide > 0 ? bx - bw / 2 : bx + bw / 2 - bw * .18, by, bw * .18, bh);
        }
      }]);
    });
    st.blk.forEach(([x, z, w, k]) => {
      const zr = z - camZ; if (zr < 1.5) return; const X = PX(x, z), s = F / zr; if (X < -2 * s || X > W + 2 * s) return;
      items.push([zr, () => {
        const hh = w * .55, d = w * .7, col = wall([180, 170, 152], .3 + .4 * Math.max(0, -sun[2]), zr, .7).map((v) => v * (.9 + k * .15));
        const a = P3(x - w / 2, 0, z), b = P3(x + w / 2, hh, z), tq = P3(x + w / 2, hh, z + d), tp = P3(x - w / 2, hh, z + d);
        c.fillStyle = rgb(lerp(col, [255, 250, 236], .22)); c.beginPath(); c.moveTo(a[0], b[1]); c.lineTo(b[0], b[1]); c.lineTo(tq[0], tq[1]); c.lineTo(tp[0], tp[1]); c.closePath(); c.fill();
        c.fillStyle = rgb(col); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        c.fillStyle = rgb(lerp(col, [30, 30, 44], .3)); c.fillRect(sunSide > 0 ? a[0] : b[0] - (b[0] - a[0]) * .16, b[1], (b[0] - a[0]) * .16, a[1] - b[1]);
      }]);
    });
    // ----- the timber stack: the wood for the courses and the roof -----
    {
      const [x, z] = TIMB, zr = z - camZ, nb = Math.round(6 * (1 - .55 * seg(p, .24, .355) - .45 * seg(p, .925, 1)));
      if (zr > 2 && nb > 0) {
        shadow(x, z, .6, 3, .18);
        items.push([zr, () => {
          const rows = [[0, 0], [1, 0], [2, 0], [.5, 1], [1.5, 1], [1, 2]];
          for (let j = 0; j < nb; j++) {
            const [cx, cy] = rows[j], bx0 = x - 2.2 + (j % 2) * .3, bx1 = bx0 + 4.2, y0 = cy * .27, y1 = y0 + .27, zz = z + (cx - 1) * .3 - .15;
            const a = P3(bx0, y0, zz), b = P3(bx1, y1, zz), tp = P3(bx0, y1, zz + .3), tq = P3(bx1, y1, zz + .3);
            const wc = wall([150, 104, 66], Math.max(0, -sun[2]) * .6 + .2, zz - camZ, .62);
            if (y1 < camY) { c.fillStyle = rgb(lerp(wc, [255, 230, 190], .2)); c.beginPath(); c.moveTo(a[0], b[1]); c.lineTo(b[0], b[1]); c.lineTo(tq[0], tq[1]); c.lineTo(tp[0], tp[1]); c.closePath(); c.fill(); }
            c.fillStyle = rgb(wc); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
            c.strokeStyle = rgb(lerp(wc, [40, 24, 14], .4), .6); c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], (a[1] + b[1]) / 2); c.lineTo(b[0], (a[1] + b[1]) / 2 + 1); c.stroke();
            c.fillStyle = rgb(lerp(wc, [236, 200, 150], .35)); const ex = camX < bx0 ? a[0] : b[0]; c.beginPath(); c.ellipse(ex, (a[1] + b[1]) / 2, Math.max(1, (a[1] - b[1]) * .3), (a[1] - b[1]) / 2, 0, 0, TAU); c.fill(); // the cut end
          }
        }]);
      }
    }
    // ----- the House -----
    const NU = 36, placed = smooth(seg(p, .905, .92)), drop = smooth(seg(p, .972, 1)) * (level(p) >= TOP - .01 ? 1 : 0);
    items.push([SC[1] - camZ + .05, () => {
      const zrK = KZ - camZ, cam = [camX, camZ], inFront = (f) => { const F0 = FC[f], mx = (F0.a[0] + F0.b[0]) / 2 - cam[0], mz = (F0.a[1] + F0.b[1]) / 2 - cam[1]; return F0.n[0] * mx + F0.n[1] * mz < 0; };
      const STONE = [182, 170, 152], FOUND = [140, 136, 120], WOOD = [138, 92, 56];
      const face = (f, inner) => {
        const F0 = FC[f], A = inner ? CI[f] : F0.a, B = inner ? CI[(f + 1) % 4] : F0.b, nn = inner ? [-F0.n[0], -F0.n[1]] : F0.n, len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        const pt = (u, y) => P3(A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u);
        const tops = Array.from({ length: NU + 1 }, (_, k) => topAt(f, k / NU, L, rag)), mt = Math.max(...tops);
        const lam = Math.max(0, nn[0] * sun[0] + nn[1] * sun[2]) * (inner ? .55 : 1), sh = inner ? .8 : 1;
        c.beginPath(); let q = pt(0, 0); c.moveTo(q[0], q[1]); q = pt(1, 0); c.lineTo(q[0], q[1]);
        for (let k = NU; k >= 0; k--) { q = pt(k / NU, tops[k]); c.lineTo(q[0], q[1]); }
        c.closePath();
        const base = wall(STONE, lam, zrK).map((v) => v * sh);
        c.fillStyle = rgb(base); c.fill();
        c.save(); c.clip();
        const quad = (u0, u1, y0, y1, col) => { const a = pt(u0, y0), b = pt(u1, y0), e = pt(u1, y1), g = pt(u0, y1); c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill(); };
        LAY.forEach(([y0, y1, kind], li) => {
          if (y0 > mt) return;
          if (kind === 'w') { // a course of wood: beams laid along the wall, their ends showing
            const wc = wall(WOOD, lam, zrK).map((v) => v * sh); quad(0, 1, y0, y1, rgb(wc));
            c.strokeStyle = rgb(lerp(wc, [30, 18, 10], .4), .7); c.lineWidth = 1; const a = pt(0, (y0 + y1) / 2), b = pt(1, (y0 + y1) / 2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
            return;
          }
          const bl = kind === 'f' ? 1.7 : .95, nb = Math.ceil(len / bl) + 1, off = hash(li, f) * bl;
          for (let j = 0; j < nb; j++) { // each block a little different
            const u0 = Math.max(0, (j * bl - off) / len), u1 = Math.min(1, ((j + 1) * bl - off) / len); if (u1 <= u0) continue;
            const tone = .9 + hash(li, j, f) * .2, col = wall(kind === 'f' ? FOUND : STONE, lam, zrK).map((v) => v * sh * tone);
            quad(u0 + .004, u1 - .004, y0 + .03, y1 - .03, rgb(col));
          }
        });
        // the dark of the ground's edge, and the light along the top
        const g0 = pt(.5, 0), g1 = pt(.5, .5), gg = c.createLinearGradient(g0[0], g0[1], g1[0], g1[1]); gg.addColorStop(0, rgb(shCol, .45)); gg.addColorStop(1, rgb(shCol, 0)); c.fillStyle = gg; c.fillRect(0, 0, W, H);
        // the gap for the Black Stone, left in the corner until it is set
        const gw = .5 / len;
        if (!inner && (f === 0 || f === 3) && L > 1.24) quad(f === 0 ? 0 : 1 - gw, f === 0 ? gw : 1, 1.24, Math.min(1.74, mt), rgb(lerp(base, [24, 18, 16], .72)));
        // the door, raised above the ground, its leaves hung once the wall is up to the lintel
        if (!inner && f === 0 && L > DOOR[2]) {
          const [u0, u1, y0, y1] = DOOR; quad(u0, u1, y0, y1, rgb(lerp(base, [20, 14, 12], .8)));
          const hung = c01((L - y1) / .6);
          if (hung > 0) { const dc = wall([104, 66, 38], lam, zrK); c.globalAlpha = hung; quad(u0 + .006, (u0 + u1) / 2 - .002, y0 + .05, y1 - .04, rgb(dc)); quad((u0 + u1) / 2 + .002, u1 - .006, y0 + .05, y1 - .04, rgb(lerp(dc, [40, 24, 14], .12)));
            c.fillStyle = rgb(lerp(dc, [255, 220, 140], .45)); for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) { const q2 = pt(u0 + (u1 - u0) * (.2 + a * .3), y0 + .4 + b * .6); c.fillRect(q2[0] - 1, q2[1] - 1, 2.2, 2.2); } c.globalAlpha = 1; }
        }
        c.restore();
        return { pt, tops, base };
      };
      const cap = (f, tops) => { // the wall's top, seen from above while it is lower than the eye
        const A = FC[f].a, B = FC[f].b, A2 = CI[f], B2 = CI[(f + 1) % 4];
        if (Math.max(...tops) > camY - .05) return;
        c.beginPath();
        for (let k = 0; k <= NU; k++) { const u = k / NU, q = P3(A[0] + (B[0] - A[0]) * u, tops[k], A[1] + (B[1] - A[1]) * u); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }
        for (let k = NU; k >= 0; k--) { const u = k / NU, q = P3(A2[0] + (B2[0] - A2[0]) * u, tops[k], A2[1] + (B2[1] - A2[1]) * u); c.lineTo(q[0], q[1]); }
        c.closePath(); c.fillStyle = rgb(wall([196, 184, 166], Math.max(0, sun[1]), zrK, .8)); c.fill();
      };
      const back = [0, 1, 2, 3].filter((f) => !inFront(f)), fr = [0, 1, 2, 3].filter(inFront);
      if (L < camY + 1) back.forEach((f) => { const r = face(f, true); cap(f, r.tops); });
      const done = fr.map((f) => [f, face(f, false)]);
      done.forEach(([f, r]) => cap(f, r.tops));
      // the corner's edge catches the light
      if (fr.includes(0) && fr.includes(3)) { const a = P3(SC[0], 0, SC[1]), b = P3(SC[0], topAt(0, 0, L, rag), SC[1]); c.strokeStyle = rgb(lerp(wall(STONE, .6, zrK), [255, 248, 230], .3), .5); c.lineWidth = Math.max(1, F / zrK * .04); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
      // the wasa'id: striped Yemeni cloths hung from the roof once the House is built (4:218)
      if (drop > 0) {
        const yb = TOP - (TOP - 2.3) * drop, CLR = [[150, 50, 42], [226, 208, 172], [58, 62, 98], [226, 208, 172]], CW = [.62, .1, .16, .1]; // a Yemeni stripe: madder, cream, indigo, cream
        done.forEach(([f, r]) => {
          const F0 = FC[f], lam = Math.max(0, F0.n[0] * sun[0] + F0.n[1] * sun[2]), npn = Math.round(F0.L / .98), pw = 1 / npn;
          for (let j = 0; j < npn * 4; j++) {
            const q = j % 4, pu = Math.floor(j / 4) * pw, u0 = pu + pw * CW.slice(0, q).reduce((a, v) => a + v, 0), u1 = u0 + pw * CW[q];
            const col = wall(CLR[q], lam, zrK, .62).map((v) => v * (q ? 1 : .94 + .06 * Math.sin(j * 2.1))), w0 = yb + .06 * Math.sin(u0 * 40 + t * .8), w1 = yb + .06 * Math.sin(u1 * 40 + t * .8);
            const a = r.pt(u0, w0), b = r.pt(u1, w1), e = r.pt(u1, TOP), g = r.pt(u0, TOP);
            c.fillStyle = rgb(col); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(g[0], g[1]); c.closePath(); c.fill();
            c.strokeStyle = rgb(lerp(col, [20, 16, 20], .35), .5); c.lineWidth = 1; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke();
          }
          const a = r.pt(0, yb), b = r.pt(1, yb); c.strokeStyle = rgb(wall([90, 60, 40], lam, zrK), .8); c.lineWidth = Math.max(1, F / zrK * .05); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); // the hem
          if (f === 0 && L > DOOR[3]) { const [u0, u1, y0, y1] = DOOR, q = [r.pt(u0 - .01, y0 - .1), r.pt(u1 + .01, y0 - .1), r.pt(u1 + .01, y1 + .15), r.pt(u0 - .01, y1 + .15)]; c.fillStyle = rgb(lerp(r.base, [20, 14, 12], .8)); c.beginPath(); q.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.fill();
            const dc = wall([104, 66, 38], lam, zrK); const d0 = r.pt(u0 + .006, y0 + .05), d1 = r.pt(u1 - .006, y1 - .04); c.fillStyle = rgb(dc); c.beginPath(); c.moveTo(d0[0], d0[1]); const m1 = r.pt(u1 - .006, y0 + .05); c.lineTo(m1[0], m1[1]); c.lineTo(d1[0], d1[1]); const m2 = r.pt(u0 + .006, y1 - .04); c.lineTo(m2[0], m2[1]); c.closePath(); c.fill(); }
        });
      }
      // the roof's edge
      if (L >= TOP - .01) done.forEach(([f, r]) => { const a = r.pt(0, TOP), b = r.pt(1, TOP); c.strokeStyle = rgb(lerp(r.base, [255, 246, 226], .35)); c.lineWidth = Math.max(1, F / zrK * .08); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); });
    }]);

    // ----- who is where -----
    const pro = track(KP, p), proIn = c01((p - .555) / .02);
    const unf = smooth(seg(p, .642, .688)), lift = smooth(seg(p, .792, .832)) * (1 - smooth(seg(p, .925, .945))), carry = smooth(seg(p, .836, .866));
    const fold = smooth(seg(p, .945, .972));
    const ccx = mix(CL[0], CL2[0], carry), ccz = mix(CL[1], CL2[1], carry);
    const chx = CHX * mix(.12, 1, unf) * (1 - .8 * fold), chz = CHZ * unf * (1 - .8 * fold), czc = ccz + CHZ - chz; // the edge by his feet stays put while it unrolls toward the camera
    const cy = .03 + 1.12 * lift, sag = .32 * lift;
    const ECP = (g) => [ccx + ECORN[g][0] * (CHX + .32), ccz + ECORN[g][1] * (CHZ + .22)]; // where each elder stands at his corner
    const sagPt = [ccx, cy - sag + .2, czc];
    // the Stone: on its plinth, in his arms, on the cloth, carried, in his arms, in the corner
    const PLS = [PL[0], .82, PL[1]], HOLD1 = [P1[0] + .1, 1.05, P1[1] - .45], ONC = [CL[0], .13, CL[1]], HOLD2 = [P2[0] - .2, 1.25, P2[1] - .5];
    let stone;
    if (p < .692) stone = PLS;
    else if (p < .712) { const k = smooth(seg(p, .692, .712)); stone = lerp(PLS, HOLD1, k); stone[1] += Math.sin(k * Math.PI) * .25; }
    else if (p < .732) stone = lerp(HOLD1, ONC, smooth(seg(p, .712, .732)));
    else if (p < .79) stone = ONC;
    else if (p < .87) stone = lerp(ONC, sagPt, smooth(seg(p, .79, .8)));
    else if (p < .895) stone = lerp(sagPt, HOLD2, smooth(seg(p, .87, .895)));
    else stone = lerp(HOLD2, SL, smooth(seg(p, .895, .918)));
    const stoneOnCloth = p >= .725 && p < .88;
    const drawStone = ([x, y, z], gl = 1) => {
      const zr = z - camZ; if (zr < 1) return;
      const s = F / zr, X = PX(x, z), Y = PY(y, z), rx = .27 * s, ry = .2 * s;
      const g = c.createRadialGradient(X - rx * .3, Y - ry * .4, 0, X, Y, rx * 1.1); g.addColorStop(0, '#3a3a44'); g.addColorStop(.55, '#141318'); g.addColorStop(1, '#060608');
      c.fillStyle = g; c.beginPath(); c.ellipse(X, Y, rx, ry, -.15, 0, TAU); c.fill();
      c.strokeStyle = rgb(lerp(sunC, [200, 210, 230], .5), .35); c.lineWidth = Math.max(.8, .02 * s); c.stroke();
      c.fillStyle = 'rgba(210,220,240,.35)'; c.beginPath(); c.ellipse(X - rx * .35, Y - ry * .45, rx * .32, ry * .14, -.3, 0, TAU); c.fill();
      const tw = (.55 + .45 * Math.sin(t * 2.6)) * gl, L2 = .3 * s * tw; // the glint
      if (tw > .05) { c.strokeStyle = `rgba(255,252,240,${.85 * tw})`; c.lineWidth = Math.max(.8, .018 * s); c.beginPath(); c.moveTo(X - rx * .35 - L2, Y - ry * .45); c.lineTo(X - rx * .35 + L2, Y - ry * .45); c.moveTo(X - rx * .35, Y - ry * .45 - L2 * .8); c.lineTo(X - rx * .35, Y - ry * .45 + L2 * .8); c.stroke(); }
    };
    // the plinth of old stones where the Stone waits
    {
      const [x, z] = PL, zr = z - camZ;
      if (zr > 1.5) {
        shadow(x, z, .8, 1.1, .22);
        items.push([zr, () => {
          const a = P3(x - .5, 0, z - .35), b = P3(x + .5, .74, z - .35), tq = P3(x + .5, .74, z + .35), tp = P3(x - .5, .74, z + .35), col = wall([132, 128, 116], Math.max(0, -sun[2]) * .5 + .25, zr, .62);
          if (.74 < camY) { c.fillStyle = rgb(lerp(col, [255, 248, 232], .25)); c.beginPath(); c.moveTo(a[0], b[1]); c.lineTo(b[0], b[1]); c.lineTo(tq[0], tq[1]); c.lineTo(tp[0], tp[1]); c.closePath(); c.fill(); }
          c.fillStyle = rgb(col); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
          c.strokeStyle = rgb(lerp(col, [20, 20, 26], .4), .6); c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], (a[1] * 2 + b[1]) / 3); c.lineTo(b[0], (a[1] * 2 + b[1]) / 3); c.moveTo(a[0], (a[1] + b[1] * 2) / 3); c.lineTo(b[0], (a[1] + b[1] * 2) / 3); c.moveTo((a[0] * 2 + b[0]) / 3, a[1]); c.lineTo((a[0] * 2 + b[0]) / 3, (a[1] * 2 + b[1]) / 3); c.stroke();
          if (p < .692) drawStone(stone);
        }]);
      }
    }
    // ----- the cloth: his rida', spread on the ground, then lifted at its four corners -----
    if (unf > 0 && fold < 1) {
      items.push([czc - camZ, () => {
        const C4 = [[ccx - chx, czc - chz], [ccx + chx, czc - chz], [ccx + chx, czc + chz], [ccx - chx, czc + chz]].map(([x, z]) => [x, cy, z]);
        const mid = (a, b, d) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - d, (a[2] + b[2]) / 2];
        const edge = (a, b, d, first) => { const m = mid(a, b, d), A = P3(...a), B = P3(...b), M = P3(...m); if (first) c.moveTo(A[0], A[1]); c.quadraticCurveTo(2 * M[0] - (A[0] + B[0]) / 2, 2 * M[1] - (A[1] + B[1]) / 2, B[0], B[1]); };
        const es = .24 * lift, base = wall([236, 226, 198], .45 + .4 * Math.max(0, sun[1]), czc - camZ, .78);
        c.beginPath(); edge(C4[0], C4[1], es, true); edge(C4[1], C4[2], es); edge(C4[2], C4[3], es); edge(C4[3], C4[0], es); c.closePath();
        const S0 = P3(...sagPt), g = c.createRadialGradient(S0[0], S0[1], 0, S0[0], S0[1], Math.max(4, F / (czc - camZ) * 1.3));
        g.addColorStop(0, rgb(lerp(base, [80, 70, 60], .35 * lift))); g.addColorStop(1, rgb(base)); c.fillStyle = g; c.fill();
        c.strokeStyle = rgb(wall([40, 96, 70], .5, czc - camZ, .7)); c.lineWidth = Math.max(1, F / (czc - camZ) * .06); c.stroke(); // a woven green border
        if (lift > .05) { c.strokeStyle = rgb(lerp(base, [60, 50, 40], .3), .5); c.lineWidth = 1; c.beginPath(); C4.forEach((q) => { const A = P3(...q); c.moveTo(A[0], A[1]); c.lineTo(S0[0], S0[1]); }); c.stroke(); } // the pull of the corners
        if (stoneOnCloth) drawStone(stone);
      }]);
    }
    if (!stoneOnCloth && p >= .692) items.push([stone[2] - camZ - .3, () => drawStone(stone, p > .918 ? 1 : .6)]);
    if (placed > 0) { // a soft gold light as it goes in
      const fl = bump(p, .912, .925, .94, .985);
      if (fl > 0) items.push([SL[2] - camZ - .25, () => { const s = F / (SL[2] - camZ), [X, Y] = P3(...SL), r = 1.6 * s; c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(255,222,150,${.5 * fl})`); g.addColorStop(1, 'rgba(255,222,150,0)'); c.fillStyle = g; c.fillRect(X - r, Y - r, r * 2, r * 2); c.globalCompositeOperation = 'source-over'; }]);
    }

    // ----- the men of Quraysh: faceless cloaked figures -----
    const drawMan = (x, z, o) => {
      const zr = z - camZ; if (zr < 1.2) return;
      const s = F / zr * (o.sc || 1), X = PX(x, z); if (X < -2 * s || X > W + 2 * s) return;
      const Y = PY(0, z) - (o.bob || 0) * s, dir = o.dir || 1, sq = o.sq || 1, lean = o.lean || 0;
      c.save(); c.globalAlpha = o.alpha ?? 1; c.translate(X, Y); c.scale(s * dir, -s * sq);
      const dark = fig(lerp(o.cl, [20, 20, 30], .3), zr), lt = fig(lerp(o.cl, [255, 230, 200], .15), zr), ls = dir * sunSide > 0;
      const arm = (hand, near) => { const sh = [.05 + lean * 1.42, 1.4], el = [(sh[0] + hand[0]) / 2 + .06, (sh[1] + hand[1]) / 2 - .12]; c.beginPath(); tube(c, [sh, el, hand], .15, .1); c.fillStyle = rgb(near ? lerp(dark, lt, .45) : lerp(dark, [10, 10, 16], .2)); c.fill(); c.fillStyle = rgb(fig([214, 204, 182], zr)); c.beginPath(); c.arc(hand[0], hand[1], .05, 0, TAU); c.fill(); };
      (o.arms || []).forEach((h, i) => { if (i === 1) arm(h, false); });
      c.beginPath(); poly(c, MAN, lean);
      const g = c.createLinearGradient(-.3, 0, .3, 0); g.addColorStop(0, rgb(ls ? dark : lt)); g.addColorStop(.6, rgb(dark)); g.addColorStop(1, rgb(ls ? lt : dark)); c.fillStyle = g; c.fill();
      c.fillStyle = rgb(fig(o.hd || [150, 128, 98], zr)); c.beginPath(); c.ellipse(.01 + lean * 1.69, 1.69, .14, .1, 0, 0, TAU); c.fill(); // the head cloth
      c.beginPath(); c.ellipse(-.06 + lean * 1.6, 1.58, .05, .11, .3, 0, TAU); c.fill(); // its tail
      if (o.load) { const lc = fig([170, 160, 144], zr); c.fillStyle = rgb(lc); c.fillRect(-.28 + lean * 1.6, 1.52, .42, .26); c.fillStyle = rgb(lerp(lc, [255, 250, 240], .3)); c.fillRect(-.28 + lean * 1.6, 1.72, .42, .06); }
      (o.arms || []).forEach((h, i) => { if (i !== 1) arm(h, true); });
      c.restore();
    };
    const toLocal = (x, z, s, dir, sq, X2, Y2) => [(X2 - PX(x, z)) / (s * dir), (PY(0, z) - Y2) / (s * sq)];
    // the workers: from the heaps to the walls with a stone on the shoulder while the courses go up
    WORK.forEach(([hi, wp], j) => {
      const hp = [HEAPS[hi][0] + (j % 3 - 1) * .9 + (hi ? -1.2 : 1.2), HEAPS[hi][1] - .9 - (j % 3) * .35];
      const b1 = seg(p, .24, .355), b2 = seg(p, .925, 1), ph = b1 * 3 + b2 * 5 + j * .37, active = (b1 > 0 && b1 < 1) || (b2 > 0 && b2 < 1);
      const k = active ? smooth(tri(ph)) : 0, x = mix(hp[0], wp[0], k), z = mix(hp[1], wp[1], k), going = ((ph % 2) + 2) % 2 < 1;
      shadow(x, z, 1.75, .45, .22);
      items.push([z - camZ, () => drawMan(x, z, { dir: active ? Math.sign((going ? wp[0] - hp[0] : hp[0] - wp[0])) || 1 : Math.sign(SC[0] - x) || 1, cl: [196, 176, 140], hd: [168, 148, 116], load: active && going, bob: active ? Math.abs(Math.sin(ph * 9)) * .03 : 0, lean: active ? Math.sin(ph * 9) * .02 : 0 })]);
    });
    st.spect.forEach(([x, z, cl], i) => { shadow(x, z, 1.75, .45, .2); items.push([z - camZ, () => drawMan(x, z, { dir: Math.sign((p > .56 ? pro.x : -1) - x) || 1, cl, sc: .96 + (i % 3) * .03 })]); });
    // the four clans: gathered off to the sides, then about the Stone in the quarrel, then a ring round him
    const qa = bump(p, .375, .41, .5, .535), press = bump(p, .41, .45, .49, .53) * .55;
    CLANS.forEach((G, g) => st.memb[g].forEach(([dx, dz, sc, r1, r2], m) => {
      const sd = m * .006 + g * .004, k1 = smooth(seg(p, .33 + sd, .375 + sd)), k2 = smooth(seg(p, .572 + sd, .622 + sd));
      let x = mix(mix(G.A0[0], G.A1[0], k1), G.A2[0], k2) + dx + G.f1 * press * (m ? .8 : 1), z = mix(mix(G.A0[1], G.A1[1], k1), G.A2[1], k2) + dz;
      let walk = (k1 > .02 && k1 < .98) || (k2 > .02 && k2 < .98), dir = walk ? Math.sign(k1 < .98 ? G.A1[0] - G.A0[0] : G.A2[0] - G.A1[0]) : p < .33 ? Math.sign(SC[0] - x) : p < .53 ? G.f1 : p < .575 ? -1 : Math.sign(pro.x - x) || 1;
      let lean = qa * (.05 + .03 * Math.sin(t * 1.7 + r1 * 9)), sq = 1, arms, hd = m ? [156, 134, 104] : [176, 150, 112], sc2 = m ? sc : 1.02;
      if (qa > 0) { // the quarrel: one arm up, or pointing at the Stone, or both out
        const a = Math.sin(t * (1.6 + r2) + r1 * 20) * .08 * qa, rest = [.12, .78];
        const up = r1 < .45 ? [.3, 2.02 + a] : r1 < .8 ? [.66, 1.42 + a] : [.55, 1.62 + a], up2 = r1 > .8 ? [.4, 1.3 - a] : rest;
        arms = [lerp(rest, up, qa), lerp(rest, up2, qa)];
      }
      if (m === 0) { // the elder: to his corner, stoop, lift, carry, hold, lower, back to his clan
        const e0 = smooth(seg(p, .728 + g * .006, .765 + g * .006)), e1 = smooth(seg(p, .938, .975)), at = ECP(g);
        if (e0 > 0 && e1 < 1) {
          const k = e0 * (1 - e1); x = mix(x, at[0], k); z = mix(z, at[1], k);
          walk = (e0 > .02 && e0 < .98) || (e1 > .02 && e1 < .98);
          if (!walk) dir = Math.sign(ccx - x) || 1;
          const bend = bump(p, .77, .786, .794, .82) + bump(p, .925, .935, .942, .95) * .6;
          sq = 1 - .3 * bend; lean = .26 * bend;
          if (p > .77 && p < .95) { // a hand on his corner of the cloth
            const zr = z - camZ, s = F / zr * sc2, cc = [ccx + ECORN[g][0] * chx, cy, czc + ECORN[g][1] * chz], Q = P3(...cc);
            const hl = toLocal(x, z, s, dir, sq, Q[0], Q[1]), sh = [.05 + lean * 1.42, 1.4], dd = Math.hypot(hl[0] - sh[0], hl[1] - sh[1]), mx = .78;
            arms = [dd > mx ? [sh[0] + (hl[0] - sh[0]) * mx / dd, sh[1] + (hl[1] - sh[1]) * mx / dd] : hl];
          }
        }
      }
      const wph = (walk ? (p * 140 + m) : 0);
      shadow(x, z, 1.75 * sq, .45, .22);
      items.push([z - camZ, () => drawMan(x, z, { dir, cl: G.cl, hd, lean: lean + (walk ? Math.sin(wph) * .03 : 0), sq, arms, sc: sc2, bob: walk ? Math.abs(Math.sin(wph)) * .03 : 0 })]);
    }));
    // ----- the Prophet: in through the gate, to the Stone; he spreads his rida', lays the Stone in it, calls the four, sets it -----
    if (proIn > 0) {
      const zr = pro.z - camZ;
      shadow(pro.x, pro.z, 1.8, .5);
      items.push([zr, () => {
        const X = PX(pro.x, pro.z), Y = PY(0, pro.z), h = 1.8 * F / zr;
        const armTo = (tx, ty) => { const sx = X + (tx < X ? -.131 : .131) * h, sy = Y - .737 * h; let dx = tx - sx, dy = ty - sy; const l = Math.hypot(dx, dy), m = .5 * h; if (l > m) { dx *= m / l; dy *= m / l; } return [(sx + dx - X) / h, (sy + dy - Y) / h]; };
        let arms;
        const S2 = P3(...stone);
        if (p > .645 && p < .69) { const a = P3(ccx - chx * .8, .1, czc + chz), b = P3(ccx + chx * .8, .1, czc + chz); arms = [armTo(a[0], a[1]), armTo(b[0], b[1])]; } // spreading it
        else if (p >= .692 && p < .734) arms = [armTo(S2[0] - h * .06, S2[1]), armTo(S2[0] + h * .06, S2[1])]; // the Stone into the cloth
        else if (p >= .738 && p < .772) arms = [[.3, -.98]]; // «يأتي من كلّ ربعٍ من قريش رجل»
        else if (p >= .872 && p < .922) arms = [armTo(S2[0] - h * .07, S2[1]), armTo(S2[0] + h * .07, S2[1])]; // he takes it and sets it
        else if (p >= .922 && p < .955) arms = [armTo(S2[0] + h * .05, S2[1])]; // a sleeve on it, in its place
        Holy.draw(c, { who: 'prophet', pose: pro.walk ? 'walk' : 'stand', phase: pro.d / 1.3, x: X, y: Y, h, t, amb: 1 - .18 * eve, glow: .12 + .2 * eve, alpha: proIn, arms });
      }]);
    }
    items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());
    // ----- grade: the evening warms; the edges close in a little -----
    if (eve > 0) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${.24 * eve})`; c.fillRect(0, hy * .5, W, H - hy * .5); c.globalCompositeOperation = 'source-over'; }
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .6, Math.min(W, H) * .35, W * .5, H * .55, Math.hypot(W, H) * .65);
    vg.addColorStop(0, 'rgba(10,14,30,0)'); vg.addColorStop(1, 'rgba(10,14,30,.3)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
