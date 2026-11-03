(() => {
// fil: the Year of the Elephant. Mecca at dawn seen from the south: the Kaaba small and dark in its valley among dark
// granite hills. Abraha's army comes up the road from the east, a column of faceless soldiers, horsemen and war
// elephants (the lead elephant the largest), and halts below the city. Birds come in three waves from the sea side
// (the west, the left of the frame), each bird carrying stones; the stones fall like sparks and the army crumbles into
// chaff that the wind carries off. Then the sun clears the eastern hills and the morning light comes down the valley
// to the Kaaba. No face is drawn: soldiers and riders are cloaked silhouettes, the animals are painted shapes.
// World in metres: x east (right of frame), y up, z north (into the frame). Everything follows from p; t moves only
// wings, cloth, trunks and stars.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };

// ---------- the land: a broad wadi in front, the valley narrowing north to the city, dark granite all round ----------
const KB = [-40, 0, 640]; // the Kaaba
const SUNH = norm([.9, 0, .44]); // the sun rises a little north of east
const xc = (z) => mix(40, -40, smooth(c01((z - 120) / 460)));
const hw = (z) => mix(560, 200, smooth(c01((z - 60) / 480)));
const floorH = (x, z) => 9 * smooth(c01((z - 60) / 540)) + 1.1 * Math.sin(x * .021 + z * .013) * Math.sin(z * .017 - x * .006) + .5 * Math.sin(x * .07 + 1) * Math.sin(z * .05);
function crag(x, z) { // ridged noise: creased, broken granite
  let s = 0, a = 1, f = .0055;
  for (let o = 0; o < 4; o++) { s += a * (1 - Math.abs(Math.sin(x * f + Math.sin(z * f * 1.3 + o) * 1.7 + o * 1.9) * Math.sin(z * f * .9 - x * f * .4 + o * .7))) ** 2; a *= .6; f *= 2.13; }
  return s / 2.18;
}
const ROAD_A = [130, 70], ROAD_B = [900, 420]; // the eastern pass the road comes through
function mount(x, z) {
  const d = Math.abs(x - xc(z)) / hw(z);
  let m = Math.max(smooth(c01((d - .72) / .55)), smooth(c01((z - 980) / 380)));
  if (m > 0 && x > 100) { // carve the pass
    const ax = ROAD_B[0] - ROAD_A[0], az = ROAD_B[1] - ROAD_A[1], u = c01(((x - ROAD_A[0]) * ax + (z - ROAD_A[1]) * az) / (ax * ax + az * az));
    const dd = Math.hypot(x - ROAD_A[0] - ax * u, z - ROAD_A[1] - az * u); m *= 1 - .9 * Math.exp(-((dd / 120) ** 2));
  }
  if (m > 0) { // a side wadi opens toward the sunrise, so the morning light can run down it to the Kaaba
    const L = (x - KB[0]) * SUNH[0] + (z - KB[2]) * SUNH[2], dd = Math.abs((x - KB[0]) * SUNH[2] - (z - KB[2]) * SUNH[0]);
    if (L > 0) m *= 1 - .88 * Math.exp(-((dd / (70 + L * .08)) ** 2));
  }
  return m;
}
function height(x, z) {
  const m = mount(x, z);
  let h = floorH(x, z);
  if (m > 0) h += m * ((48 + 56 * Math.sin(x * .0042 + 1.1) ** 2 + 30 * Math.sin(z * .0031 - x * .002)) * (.7 + .3 * m) + 62 * crag(x, z) * m)
    * (1 - .5 * smooth(c01((x - KB[0] - 80) / 160)) * Math.exp(-(((z - 720) / 300) ** 2))); // the eastern hills stand lower beside the city
  return h;
}

// ---------- the road: from the eastern pass across the wadi to the turn below the city, then north to the Kaaba ----------
const ROADP = [[860, 410], [640, 318], [450, 236], [300, 162], [182, 104], [84, 62], [8, 46], [-32, 72], [-46, 150], [-48, 300], [-44, 460], [-41, 600]];
const HALT = 6; // the lead elephant halts at ROADP[6], where the road turns north

// ---------- camera keys: [p, eye, look]; the march (.15 to .33) rides beside the lead elephant, built in init ----------
const CAM0 = [
  [-.06, [-22, 46, 250], [-40, 12, 640]],
  [.07, [-20, 43, 272], [-40, 12, 640]],
  [.115, [60, 74, 150], [420, 20, 330]],
];
const CAM1 = [
  [.39, [14, 6.6, 4], [-30, 7.5, 400]],
  [.44, [22, 7, -4], [-190, 40, 300]],
  [.495, [30, 8, -10], [-320, 64, 130]],
  [.55, [-62, 15, -66], [140, 16, 170]],
  [.6, [-44, 12, -42], [120, 12, 150]],
  [.648, [24, 6, 8], [-20, 8, 130]],
  [.7, [28, 7, -2], [-6, 8, 200]],
  [.765, [-24, 12, -54], [160, 14, 200]],
  [.85, [40, 84, 330], [-46, 10, 650]],
  [.92, [92, 92, 370], [-52, 4, 664]],
  [1.06, [90, 91, 376], [-52, 4, 664]],
];
function camAt(K, p) {
  let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const u = i + smooth(c01((p - K[i][0]) / (K[i + 1][0] - K[i][0])));
  return { eye: crv(K.map((k) => k[1]), u), look: crv(K.map((k) => k[2]), u) };
}
// ---------- light keys: p, sky top, sky mid, horizon, sun colour, ambient, haze, sun elevation (deg), fog length ----------
const LK = [
  [-.06, [8, 12, 30], [22, 30, 58], [84, 70, 94], [255, 122, 84], [62, 68, 104], [64, 62, 88], -10, 900],
  [.12, [12, 20, 44], [38, 48, 84], [150, 102, 104], [255, 130, 88], [76, 82, 116], [102, 92, 114], -7, 950],
  [.32, [18, 28, 58], [66, 70, 106], [210, 136, 106], [255, 146, 96], [90, 92, 120], [148, 118, 122], -4, 1000],
  [.6, [22, 32, 62], [86, 86, 116], [228, 154, 112], [255, 156, 100], [96, 98, 124], [168, 130, 124], -2.2, 1000],
  [.82, [30, 42, 74], [106, 102, 126], [236, 168, 120], [255, 170, 108], [88, 92, 116], [184, 146, 126], -1.2, 1050],
  [.875, [38, 54, 88], [126, 122, 140], [238, 184, 136], [255, 186, 124], [92, 96, 118], [184, 156, 136], 1.6, 1500],
  [.93, [46, 66, 102], [140, 140, 154], [236, 198, 156], [255, 204, 150], [100, 102, 122], [176, 160, 148], 10, 2100],
  [1.06, [50, 72, 108], [148, 150, 162], [232, 206, 170], [255, 212, 164], [102, 106, 128], [180, 168, 156], 13, 2500],
];

// ---------- silhouettes (u across, v up, metres; facing +u) ----------
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MAN2 = [-.4, 0, -.3, .5, -.21, 1.0, -.26, 1.32, -.2, 1.44, -.1, 1.5, -.14, 1.58, -.13, 1.7, -.04, 1.79, .08, 1.78, .14, 1.68, .12, 1.56, .07, 1.5, .19, 1.44, .25, 1.28, .2, 1.0, .3, .5, .36, 0];
const MANS = [-.3, 0, -.22, 1.3, -.12, 1.5, -.08, 1.76, .08, 1.76, .12, 1.5, .22, 1.3, .3, 0];
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const RIDER = [-.24, 1.48, -.22, 1.95, -.14, 2.12, -.13, 2.26, -.06, 2.37, .05, 2.37, .11, 2.26, .12, 2.12, .2, 1.95, .24, 1.48];
const poly = (pa, sh, bx, by, s, sv, dir, lean = 0) => {
  for (let i = 0; i < sh.length; i += 2) { const X = bx + (sh[i] + lean * sh[i + 1]) * dir * s, Y = by - sh[i + 1] * sv; i ? pa.lineTo(X, Y) : pa.moveTo(X, Y); }
  pa.closePath();
};
// the elephant, side on, facing +u: an African bush elephant's line, the back dipped, the ears large
const EBODY = [[-1.98, 2.0], [-1.78, 2.5], [-1.2, 2.8], [-.45, 2.74], [.25, 2.92], [.8, 3.1], [1.32, 3.18], [1.74, 3.0], [1.96, 2.62], [2.02, 2.24], [1.82, 1.86], [1.52, 1.74], [1.28, 1.42], [.98, 1.16], [-.2, 1.06], [-1.18, 1.12], [-1.74, 1.32], [-2.04, 1.66]];
const EEAR = [[1.28, 3.02], [.6, 3.1], [.22, 2.7], [.24, 2.0], [.58, 1.6], [.98, 1.72], [1.22, 2.26]];
const ELEG = [[-1.38, 0, 1], [.94, .25, 1], [-1.1, .5, 0], [.68, .75, 0]]; // u, gait phase, near (1) / far (0)
function smoothPath(g, P) { // a closed curve through the midpoints of P
  const n = P.length, m = (i) => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
  const s = m(n - 1); g.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const e = m(i); g.quadraticCurveTo(P[i][0], P[i][1], e[0], e[1]); }
  g.closePath();
}
function tube(g, pts, w0, w1) { // a tapered stroke as one filled outline
  const L = [], R = [];
  pts.forEach((q, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = mix(w0, w1, i / (pts.length - 1)) / 2;
    L.push([q[0] - dy / l * w, q[1] + dx / l * w]); R.push([q[0] + dy / l * w, q[1] - dx / l * w]);
  });
  g.moveTo(L[0][0], L[0][1]); L.forEach((q) => g.lineTo(q[0], q[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
}
const qb = (a, b, c, n) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]; });
// draw one elephant in local metres (the caller has translated to the feet and scaled by (s * dir, -sv))
function elephant(g, o) {
  const { top, bot, rim, rimSide, cloth, gold, ph, mv, lead, t, seed, big, crumble, jag } = o;
  if (crumble > 0) { // the body breaks away from the top down, along a ragged edge
    const lim = (1 - crumble) * 4.6;
    g.beginPath(); g.moveTo(-3, -.5); g.lineTo(-3, lim);
    for (let i = 0; i <= 24; i++) g.lineTo(-3 + i * .25, lim + jag[i] * (.15 + crumble * .9));
    g.lineTo(3.2, -.5); g.closePath(); g.clip();
  }
  const grad = g.createLinearGradient(0, 3.3, 0, .9); grad.addColorStop(0, rgb(top)); grad.addColorStop(1, rgb(bot));
  const far = rgb(lerp(bot, [0, 0, 0], .25));
  const leg = (u0, gp, near) => {
    const a = ph + gp * TAU, sw = Math.sin(a) * .3 * mv, lift = Math.max(0, Math.cos(a)) * .2 * mv;
    g.beginPath(); g.moveTo(u0 - .34, 1.62); g.lineTo(u0 + .32, 1.62); g.lineTo(u0 + .28 + sw, .12 + lift); g.quadraticCurveTo(u0 + .32 + sw, lift, u0 + .02 + sw, lift); g.quadraticCurveTo(u0 - .3 + sw, lift, u0 - .28 + sw, .12 + lift); g.closePath();
    g.fillStyle = near ? grad : far; g.fill();
  };
  ELEG.forEach(([u, gp, near]) => { if (!near) leg(u, gp, 0); });
  // tail
  g.strokeStyle = far; g.lineWidth = .07; g.beginPath(); g.moveTo(-1.98, 2.0); g.quadraticCurveTo(-2.18, 1.6 + Math.sin(t * 1.3 + seed) * .05, -2.12, 1.06); g.stroke();
  g.beginPath(); smoothPath(g, EBODY); g.fillStyle = grad; g.fill();
  if (big) { // the hide: a few creases on the flank and the near legs
    g.strokeStyle = rgb(lerp(bot, [0, 0, 0], .3), .35); g.lineWidth = .035; g.beginPath();
    for (let i = 0; i < 4; i++) { const u = -1.4 + i * .5; g.moveTo(u, 1.25); g.quadraticCurveTo(u + .12, 1.9, u - .05, 2.5); }
    g.stroke();
  }
  ELEG.forEach(([u, gp, near]) => { if (near) leg(u, gp, 1); });
  // the trunk swings with the walk and stirs at the halt
  const sw = Math.sin(ph * .5) * .12 * mv + Math.sin(t * .9 + seed) * .06;
  const trunk = qb([1.94, 2.32], [2.34 + sw, 1.5], [2.06 + sw * 1.6, .42], 10);
  trunk.push([2.2 + sw * 1.6, .36]);
  g.beginPath(); tube(g, trunk, .5, .12); g.fillStyle = grad; g.fill();
  if (big) { g.strokeStyle = rgb(lerp(bot, [0, 0, 0], .3), .3); g.lineWidth = .025; g.beginPath(); for (let i = 3; i < 10; i++) { const q = trunk[i]; g.moveTo(q[0] - .12, q[1]); g.lineTo(q[0] + .1, q[1] + .03); } g.stroke(); }
  // tusk
  g.strokeStyle = rgb(lerp(top, [236, 226, 206], .55)); g.lineCap = 'round';
  g.lineWidth = .11; g.beginPath(); g.moveTo(1.84, 1.98); g.quadraticCurveTo(2.36, 1.48, 2.62, 1.66); g.stroke();
  // the ear: a darker flap lying on the shoulder, its front edge catching the light
  g.beginPath(); smoothPath(g, EEAR); g.fillStyle = rgb(lerp(bot, top, .45)); g.fill();
  g.strokeStyle = rgb(lerp(bot, [0, 0, 0], .35), .5); g.lineWidth = .04; g.stroke();
  // the war cloth over the back, a gold hem
  g.beginPath(); g.moveTo(-1.28, 2.78); g.quadraticCurveTo(-.45, 2.86, .2, 2.96); g.quadraticCurveTo(.5, 3.04, .72, 3.08); g.lineTo(.6, 2.06);
  for (let i = 0; i < 7; i++) { const u = .6 - (i + 1) * (1.88 / 7); g.quadraticCurveTo(u + 1.88 / 14, 1.9, u, 2.06); }
  g.closePath(); g.fillStyle = rgb(cloth); g.fill(); g.strokeStyle = rgb(gold); g.lineWidth = .06; g.stroke();
  if (lead) { // a howdah with its canopy and a cloaked rider
    g.fillStyle = rgb(lerp(cloth, [0, 0, 0], .2)); g.fillRect(-.62, 2.92, 1.12, .62);
    g.strokeStyle = rgb(gold); g.lineWidth = .05; g.strokeRect(-.62, 2.92, 1.12, .62);
    g.beginPath(); [-.58, .44].forEach((u) => { g.moveTo(u, 3.54); g.lineTo(u, 4.12); }); g.stroke();
    g.beginPath(); g.moveTo(-.74, 4.12); g.quadraticCurveTo(-.06, 4.75, .62, 4.12); g.closePath(); g.fillStyle = rgb(cloth); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-.28, 3.5); g.lineTo(-.3, 3.82); g.quadraticCurveTo(-.32, 3.98, -.18, 4.0); g.quadraticCurveTo(-.2, 4.12, -.08, 4.14); g.quadraticCurveTo(.06, 4.14, .04, 3.98); g.quadraticCurveTo(.16, 3.96, .14, 3.8); g.lineTo(.14, 3.5); g.closePath();
    g.fillStyle = rgb(lerp(bot, [0, 0, 0], .4)); g.fill();
  }
  // the driver on the neck: a cloaked, faceless shape
  g.beginPath(); g.moveTo(.86, 3.06); g.lineTo(.92, 3.5); g.quadraticCurveTo(.9, 3.66, 1.02, 3.68); g.quadraticCurveTo(1.0, 3.82, 1.12, 3.84); g.quadraticCurveTo(1.25, 3.82, 1.22, 3.68); g.quadraticCurveTo(1.32, 3.64, 1.3, 3.5); g.lineTo(1.36, 3.1); g.closePath();
  g.fillStyle = rgb(lerp(bot, [0, 0, 0], .4)); g.fill();
  // the light along the side that faces the sun
  if (rim) {
    const rg = g.createLinearGradient(-2.2, 0, 2.2, 0); rg.addColorStop(rimSide > 0 ? 0 : 1, rgb(rim, 0)); rg.addColorStop(rimSide > 0 ? 1 : 0, rgb(rim, .55));
    g.strokeStyle = rg; g.lineWidth = .06; g.beginPath(); smoothPath(g, EBODY); g.stroke();
  }
}

S.fil = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.glow = sprite([[0, 'rgba(255,255,255,1)'], [.16, 'rgba(255,255,255,.55)'], [.42, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']], 128);
    st.puff = sprite([[0, 'rgba(206,184,150,.75)'], [.45, 'rgba(196,172,138,.32)'], [1, 'rgba(190,166,130,0)']]);
    st.puffD = sprite([[0, 'rgba(70,58,52,.7)'], [.5, 'rgba(70,58,52,.3)'], [1, 'rgba(70,58,52,0)']]);
    st.shad = sprite([[0, 'rgba(8,6,10,.9)'], [.5, 'rgba(8,6,10,.45)'], [1, 'rgba(8,6,10,0)']]);
    st.tints = {};
    const R = rng(105);
    const gs = () => (R() + R() + R() - 1.5) / 1.5;
    st.NS = 70; st.NK = 84;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.ridges = [0, 1].map((L) => { const a = []; let h = .02; for (let i = 0; i <= 360; i++) { h = mix(h, (L ? .03 : .05) + (L ? .022 : .034) * Math.sin(i * .07 + L * 2) ** 2 + R() * .014, .3); a.push(h); } return a; });
    st.stars = Array.from({ length: 220 }, () => [R() * TAU, .04 + R() ** .8 * 1.1, R()]);
    st.clouds = Array.from({ length: 9 }, () => [R() * TAU, .05 + R() * .14, .5 + R() * 1.1, .05 + R() * .05, .25 + R() * .35]);
    st.rocks = []; for (let i = 0; i < 90; i++) { const x = -360 + R() * 760, z = -120 + R() * 520; if (mount(x, z) > .3) continue; st.rocks.push([x, z, .3 + R() ** 3 * 1.4, R(), R()]); }
    st.marks = Array.from({ length: 2200 }, () => [-300 + R() * 640, -120 + R() * 560, R(), R()]);
    st.shrubs = []; for (let i = 0; i < 260; i++) { const x = -420 + R() * 900, z = -150 + R() * 700; if (mount(x, z) > .25) continue; st.shrubs.push([x, z, .4 + R() * 1.1, R()]); }
    // ---- the road: resampled every 2 m ----
    const dense = []; for (let i = 0; i <= (ROADP.length - 1) * 60; i++) dense.push(crv(ROADP, i / 60));
    const cum = [0]; for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const len = cum[cum.length - 1], n = Math.ceil(len / 2) + 1; st.RX = new Float32Array(n); st.RZ = new Float32Array(n); st.RL = len;
    for (let i = 0, j = 0; i < n; i++) { const s = Math.min(len, i * 2); while (j < cum.length - 2 && cum[j + 1] < s) j++; const f = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1); st.RX[i] = mix(dense[j][0], dense[j + 1][0], f); st.RZ[i] = mix(dense[j][1], dense[j + 1][1], f); }
    st.sHalt = cum[HALT * 60];
    const road = (s) => { const u = Math.max(0, Math.min(n - 1.001, s / 2)), i = u | 0, f = u - i; return [mix(st.RX[i], st.RX[i + 1], f), mix(st.RZ[i], st.RZ[i + 1], f), st.RX[i + 1] - st.RX[i], st.RZ[i + 1] - st.RZ[i]]; };
    st.road = road;
    st.shrubs = st.shrubs.filter(([x, z]) => { for (let i = 0; i < n; i += 3) if (Math.hypot(st.RX[i] - x, st.RZ[i] - z) < 9) return false; return true; });
    st.rocks = st.rocks.filter(([x, z]) => { for (let i = 0; i < n; i += 3) if (Math.hypot(st.RX[i] - x, st.RZ[i] - z) < 16) return false; return true; });
    // ---- the army: the lead elephant, a vanguard of horse, then ranks of foot with eight more elephants among them ----
    const F = [];
    F.push({ kind: 3, off: 0, lat: 0, sc: 1.24, lead: 1 });
    for (let i = 0; i < 12; i++) F.push({ kind: 2, off: 9 + (i >> 1) * 4.2 + R() * 1.2, lat: (i & 1 ? 1 : -1) * (2.4 + R() * 1.4), sc: .96 + R() * .08 });
    for (let k = 0; k < 8; k++) F.push({ kind: 3, off: 44 + k * 31 + R() * 6, lat: (R() - .5) * 2.4, sc: .9 + R() * .14 });
    for (let i = 0; i < 330; i++) {
      const row = Math.floor(i / 5), off = 36 + row * 3.9 + R() * 1.4;
      let lat = ((i % 5) - 2) * 1.55 + gs() * .35;
      if (F.some((f) => f.kind === 3 && Math.abs(f.off - off) < 5)) lat += Math.sign(lat || 1) * 3; // make room for the elephants
      F.push({ kind: R() < .6 ? 1 : 0, off, lat, sc: .92 + R() * .16, shield: R() < .35, ban: i % 61 === 7 });
    }
    for (let i = 0; i < 12; i++) F.push({ kind: 2, off: 300 + i * 3 + R() * 2, lat: (i & 1 ? 1 : -1) * (1.6 + R() * 2), sc: .96 + R() * .08 });
    F.forEach((f) => { f.ph = R() * TAU; f.seed = R() * 10; f.flee = f.kind === 3 ? 0 : .545 + R() * .06; f.run = 14 + R() * 30; f.jag = Array.from({ length: 25 }, () => R() - .5); });
    st.F = F;
    // where each one stands at p (on the road behind the leader; after the first strike the foot turn and run back)
    const sLead = (p) => mix(380, st.sHalt, smooth(seg(p, .11, .385)));
    st.sLead = sLead;
    const trk = (pp, ph) => { // beside the road on the south side, ahead of the leader, looking back along the column into the dawn
      const [x, z, dx, dz] = road(sLead(pp)), l = Math.hypot(dx, dz) || 1, tx = dx / l, tz = dz / l;
      let nx = -tz, nz = tx; if (nz > 0) { nx = -nx; nz = -nz; }
      const ex = x + tx * (ph ? 40 : 52) + nx * (ph ? 20 : 30), ez = z + tz * (ph ? 40 : 52) + nz * (ph ? 20 : 30);
      return [pp, [ex, height(ex, ez) + 4.4, ez], [x - tx * (ph ? 16 : 60), height(x, z) + (ph ? 4 : 7), z - tz * (ph ? 16 : 60)]];
    };
    st.CAM = [...CAM0, trk(.16), trk(.22), trk(.28), trk(.335), ...CAM1];
    st.CAMP = [...CAM0, trk(.16, 1), trk(.22, 1), trk(.28, 1), trk(.335, 1), ...CAM1];
    st.posAt = (f, p) => {
      let s = sLead(p) - f.off, back = 0;
      if (f.flee && p > f.flee) back = f.run * smooth(seg(p, f.flee, f.flee + .08));
      s -= back;
      const [x, z, dx, dz] = road(Math.max(0, s)), l = Math.hypot(dx, dz) || 1;
      return [x - dz / l * f.lat, z + dx / l * f.lat, dx / l, dz / l, s, back > .01 && back < f.run - .01];
    };
    // ---- the birds: three waves from the west; each bird dives over its mark, lets its stones go, climbs away east ----
    const V = 8400, X0 = -760, waves = [.445, .495, .545];
    const B = [], stones = [];
    F.forEach((f) => {
      const w = f.lead ? 2 : Math.min(2, R() * 3 | 0), per = f.lead ? 5 : f.kind === 3 ? 3 : 1; // every wave strikes along the whole column
      for (let j = 0; j < per; j++) {
        const [tx] = st.posAt(f, waves[w] + .06);
        const r = waves[w] + (tx - X0) / V + gs() * .008 + (f.lead ? .01 + j * .004 : j * .004), hitP = r + .013;
        const [hx, hz] = st.posAt(f, hitP), hy = height(hx, hz) + (f.kind === 3 ? 2.4 * f.sc : f.kind === 2 ? 1.6 : 1.1) * (.6 + R() * .5);
        const bird = { w, x: hx - (f.lead ? 7 : 14), y: hy + (f.lead ? 7 + R() * 5 : 22 + R() * 18), z: hz + gs() * 3, r, ph: R() * TAU, sz: .9 + R() * .5, dz: gs() * 8 };
        B.push(bird);
        stones.push({ x0: bird.x, y0: bird.y - .3, z0: bird.z, x1: hx + gs() * .5, y1: hy, z1: hz + gs() * .4, r, fd: .013 });
        if (f.hit === undefined || hitP < f.hit) f.hit = hitP;
      }
    });
    waves.forEach((pw, w) => {
      for (let i = 0; i < 45; i++) { const x = -120 + R() * 360, z = -60 + R() * 100, y = 12 + R() * 30; B.push({ w, x, y, z, r: pw + (x - X0) / V + gs() * .012, ph: R() * TAU, sz: .9 + R() * .5, dz: gs() * 4, free: 1, near: 1 }); }
      for (let i = 0; i < 130; i++) { const x = -60 + R() * 380, z = R() * 320, y = 40 + R() * 70; B.push({ w, x, y, z, r: pw + (x - X0) / V + gs() * .014, ph: R() * TAU, sz: .9 + R() * .5, dz: gs() * 10, free: 1 }); }
    });
    st.B = B; st.stones = stones; st.V = V;
    // ---- the chaff: husks seeded inside each body; they come loose from the top down after the strike ----
    const CH = [];
    F.forEach((f, fi) => {
      if (f.hit === undefined) return;
      const nC = f.lead ? 260 : f.kind === 3 ? 130 : f.kind === 2 ? 18 : 10;
      const hgt = f.kind === 3 ? 3.2 * f.sc : f.kind === 2 ? 2.3 : 1.75, wid = f.kind === 3 ? 2 * f.sc : f.kind === 2 ? 1.2 : .3;
      for (let i = 0; i < nC; i++) { const v = R(); CH.push([fi, (R() - .5) * 2 * wid, .1 + v * hgt * .95, 1 - v, .6 + R() * .9, R(), R() * TAU, (R() - .5) * 60, .1 + R() * .25, .1 + R() * .12, R()]); }
    });
    st.CH = CH;
    st.dust = Array.from({ length: 70 }, () => [R(), R(), R(), R()]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    // ----- camera -----
    const phone0 = st.cv.clientWidth < st.cv.clientHeight * .8, { eye, look } = camAt(phone0 ? st.CAMP : st.CAM, p);
    if (phone) { const k = mix(.8, 1, smooth(seg(p, .1, .15))); for (let j = 0; j < 3; j++) eye[j] = look[j] + (eye[j] - look[j]) * k; eye[1] = Math.max(eye[1], 3.2); } // phones: the dawn view a step nearer the town
    const fw = norm(sub(look, eye)), rt = norm(cross([0, 1, 0], fw)), up = cross(fw, rt);
    const F = phone ? W * 1.12 : Math.min(H * 1.3, W * .9), cx = W / 2, cy = H * (phone ? .62 : .54);
    const [E0, E1, E2] = eye, [f0, f1, f2] = fw, [r0, r1, r2] = rt, [u0, u1, u2] = up;
    let PX = 0, PY = 0, PZ = 0;
    const pj = (x, y, z) => { const dx = x - E0, dy = y - E1, dz = z - E2, zc = dx * f0 + dy * f1 + dz * f2; if (zc < .4) return false; const iz = F / zc; PX = cx + (dx * r0 + dy * r1 + dz * r2) * iz; PY = cy - (dx * u0 + dy * u1 + dz * u2) * iz; PZ = zc; return true; };
    // ----- light -----
    const [skT, skM, skH, sunC, amb, haze, elev, fogL] = keyAt(LK, p);
    const se = elev * Math.PI / 180, sun = [SUNH[0] * Math.cos(se), Math.sin(se), SUNH[2] * Math.cos(se)];
    const dawn = c01((elev + 9) / 9); // the east brightens before the sun is up
    const hazeAt = (vx, vz) => { const k = Math.max(0, (vx * SUNH[0] + vz * SUNH[2]) / (Math.hypot(vx, vz) || 1)) ** 4; return lerp(haze, lerp(skH, sunC, .3), k * .75); };
    const fogOf = (zc) => Math.min(.95, 1 - Math.exp(-zc / fogL));
    const pitch = Math.asin(Math.max(-.99, Math.min(.99, f1))), hy = cy + F * Math.tan(pitch);
    const tint = (col) => { if (!st.tints[col]) { const cc = mk(128, 128), g = cc.getContext('2d'); g.drawImage(st.glow, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, 128, 128); st.tints[col] = cc; } return st.tints[col]; };
    const shadow = (x, y, z) => { // 1 lit, 0 in the shadow of the hills between this point and the sun
      if (sun[1] <= -.01) return 0;
      let sh = 1; for (let m = 0, L = 8; m < 7; m++, L *= 2.4) { const q = height(x + sun[0] * L, z + sun[2] * L) - (y + .5 + sun[1] * L); if (q > 0) { sh = Math.min(sh, 1 - c01(q / (6 + L * .07))); if (sh <= 0) return 0; } }
      return sh;
    };
    // ----- sky -----
    const sg = c.createLinearGradient(0, hy - F * .95, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.62, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    const SD = 1e5;
    if (pj(E0 + sun[0] * SD, E1 + Math.max(sun[1], -.03) * SD, E2 + sun[2] * SD) || pj(E0 + SUNH[0] * SD, E1, E2 + SUNH[2] * SD)) {
      const sx = PX, sy = Math.max(PY, hy - 4);
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, F * 1.25);
      g.addColorStop(0, rgb(sunC, .42 * dawn)); g.addColorStop(.2, rgb(sunC, .15 * dawn)); g.addColorStop(1, rgb(sunC, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, hy + 2);
      if (elev > -1) { const r = F * .0068; c.globalAlpha = c01((elev + 1) / 1.6) * .9; c.drawImage(tint('#ffe2b0'), sx - r * 10, PY - r * 10, r * 20, r * 20); c.fillStyle = 'rgba(255,246,226,.95)'; c.beginPath(); c.arc(sx, PY, r, 0, TAU); c.fill(); c.globalAlpha = 1; }
      c.globalCompositeOperation = 'source-over';
    }
    const az0 = Math.atan2(f0, f2);
    const dirP = (az, e2) => pj(E0 + Math.sin(az) * Math.cos(e2) * SD, E1 + Math.sin(e2) * SD, E2 + Math.cos(az) * Math.cos(e2) * SD);
    const starA = 1 - smooth(seg(p, .04, .3));
    if (starA > 0) { c.fillStyle = '#f1e8d0'; st.stars.forEach(([az, e2, k]) => { if (!dirP(az, e2) || PX < 0 || PX > W || PY > hy - 8) return; const east = Math.max(0, Math.sin(az)) ** 2; c.globalAlpha = starA * (.2 + .65 * k) * (1 - .8 * east * dawn) * (.7 + .3 * Math.sin(t * 2 + k * 50)); const s = k > .9 ? 1.7 : 1.1; c.fillRect(PX, PY, s, s); }); c.globalAlpha = 1; }
    // thin dawn clouds, lit from below on the east
    st.clouds.forEach(([az, e2, w, h, a]) => {
      if (!dirP(az, e2)) return; const x = PX, y = PY, rw = w * F * .5, rh = h * F * .5;
      if (x < -rw || x > W + rw || y > hy) return;
      const east = c01(.5 + .5 * Math.sin(az)), col = lerp(lerp(skM, skH, .5), lerp(sunC, [255, 236, 220], .25), east * (.35 + .65 * dawn));
      c.save(); c.translate(x, y); c.scale(rw, rh); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgb(col, a * .55)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
    });
    st.ridges.forEach((rg, L) => {
      const col = lerp(lerp(skH, haze, L ? .55 : .3), skT, L ? .16 : .1);
      c.fillStyle = rgb(col); c.beginPath(); c.moveTo(-2, hy + 4);
      for (let x = -2; x <= W + 22; x += 20) { const az = az0 + Math.atan((x - cx) / F); const ii = ((az / TAU * 720) % 360 + 360) % 360, i0 = Math.floor(ii), h = mix(rg[i0], rg[(i0 + 1) % 361], ii - i0); c.lineTo(x, hy - F * Math.tan(h) * (L ? .55 : .36)); }
      c.lineTo(W + 22, hy + 4); c.closePath(); c.fill();
    });
    // ----- terrain: depth bands far to near (terrainRaster in core.js) -----
    const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
    const hf = norm([f0, 0, f2]), hr = [hf[2], 0, -hf[0]], cp = Math.cos(pitch), sp = Math.sin(pitch);
    const by = (H - cy) / F, dyb = sp - by * cp, dhb = cp + by * sp;
    const dMin = dyb < -.01 ? Math.max(1.5, E1 / -dyb * dhb * .8) : 3, dMax = 3800;
    const sand = [202, 174, 132], gravel = [168, 140, 106], rock = [96, 82, 74];
    for (let i = 0; i < NS; i++) {
      const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
      const zc0 = Math.max(.6, d * cp - E1 * sp), fogK = 1 - Math.exp(-d / fogL);
      for (let k = 0; k <= NK; k++) {
        const sx = -W * .06 + k * (W * 1.12 / NK), u = (sx - cx) / F * zc0;
        const x = E0 + hf[0] * d + hr[0] * u, z = E2 + hf[2] * d + hr[2] * u, h = height(x, z);
        const o = i * (NK + 1) + k;
        if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
        if (k % 2 === 0) {
          const e = Math.max(.6, d * .004), hx = (height(x + e, z) - h) / e, hz = (height(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
          const m = mount(x, z), steep = c01((1 - 1 / nl) * 3);
          const al = lerp(lerp(gravel, sand, c01(.5 + .5 * Math.sin(x * .019 + Math.sin(z * .011) * 2))), lerp(rock, rock.map((v) => v * .78), crag(x * 2.3, z * 2.3)), Math.max(m * .95, steep));
          let lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl);
          if (lam > 0) lam *= shadow(x, h, z);
          const east = Math.max(0, (-hx * SUNH[0] * .9 + .45 - hz * SUNH[2] * .9) / nl) * dawn * (1 - .7 * c01(elev / 8)); // the bright east on slopes that face it
          const sky = .42 + .58 / nl;
          const lit = [0, 1, 2].map((j) => al[j] / 255 * (amb[j] * sky * .9 + sunC[j] * (lam * 1.25 + east * .34)));
          const hz2 = hazeAt(x - E0, z - E2), fa = Math.min(.96, fogK * (1 - .22 * c01(h / 140))), nn = (i * NC + k / 2) * 3;
          TC[nn] = mix(lit[0], hz2[0], fa); TC[nn + 1] = mix(lit[1], hz2[1], fa); TC[nn + 2] = mix(lit[2], hz2[2], fa);
        }
      }
    }
    terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .13);
    const sunUp = c01(elev / 3);
    const floorLit = sand.map((v, j) => v / 255 * (amb[j] * .8 + sunC[j] * Math.max(0, sun[1]) * 1.1));
    // ground: the trodden road, wind ripples, scattered rocks
    {
      const L = [], Rr = [], n = st.RX.length;
      for (let i = 0; i < n; i += 2) {
        const x = st.RX[i], z = st.RZ[i], j = Math.min(n - 1, i + 1), dx = st.RX[j] - x, dz = st.RZ[j] - z, l = Math.hypot(dx, dz) || 1, w = 4.2;
        const a = pj(x - dz / l * w, height(x - dz / l * w, z + dx / l * w) + .05, z + dx / l * w) ? [PX, PY, PZ] : null;
        const b = pj(x + dz / l * w, height(x + dz / l * w, z - dx / l * w) + .05, z - dx / l * w) ? [PX, PY, PZ] : null;
        if (a && b) { L.push(a); Rr.push(b); } else if (L.length) break;
      }
      if (L.length > 1) {
        c.beginPath(); L.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); for (let i = Rr.length - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath();
        c.fillStyle = rgb(lerp(lerp(floorLit, [236, 214, 176], .25), haze, .25), .28); c.fill();
      }
    }
    c.lineWidth = 1;
    [0, 1].forEach((pass) => {
      c.strokeStyle = pass ? rgb(lerp(floorLit, [255, 236, 200], .35), .3) : rgb(lerp(floorLit, [20, 14, 10], .6), .36);
      c.beginPath();
      st.marks.forEach(([x, z, q, k]) => {
        if ((k > .55) !== !!pass || !pj(x, height(x, z), z) || PZ > 260) return;
        const L = (.4 + q * 1.1) * F / PZ; if (PX < -L || PX > W + L || PY > H + 2 || PY < hy) return;
        c.moveTo(PX - L, PY); c.lineTo(PX + L, PY);
      });
      c.stroke();
    });
    const sunSide = Math.sign(r0 * SUNH[0] + r2 * SUNH[2]) || 1;
    {
      const rp = new Path2D(), rl = new Path2D();
      st.rocks.forEach(([x, z, r, k, k2]) => {
        const h = height(x, z); if (!pj(x, h, z) || PZ < 14) return; const s = F / PZ * r; if (s < .8 || PX < -s * 3 || PX > W + s * 3 || PY > H + s || PY < hy - s) return;
        const ww = s * (1.1 + k * .6), hh = s * (.35 + k2 * .35);
        rp.moveTo(PX - ww, PY + hh * .1); rp.lineTo(PX - ww * (.6 + k2 * .2), PY - hh * .7); rp.lineTo(PX - ww * .1, PY - hh); rp.lineTo(PX + ww * (.4 + k * .3), PY - hh * (.6 + k2 * .3)); rp.lineTo(PX + ww, PY + hh * .05); rp.closePath();
        rl.moveTo(PX - ww * .1, PY - hh); rl.lineTo(PX + ww * (.4 + k * .3) * (sunSide > 0 ? 1 : -1), PY - hh * (.6 + k2 * .3));
      });
      const tw = new Path2D();
      st.shrubs.forEach(([x, z, r, k]) => {
        const h = height(x, z); if (!pj(x, h, z) || PZ < 10) return; const s = Math.min(70, F / PZ * r); if (s < 1.2 || PX < -s * 2 || PX > W + s * 2 || PY > H + s || PY < hy - s) return;
        rp.moveTo(PX + s * .7, PY); rp.ellipse(PX, PY, s * .7, s * .16, 0, 0, Math.PI, true); // the low clump at the root
        for (let i = 0; i < 9; i++) { const a = -1.15 + i * .29 + Math.sin(k * 40 + i * 3) * .12, L = s * (.55 + .5 * Math.abs(Math.sin(k * 17 + i * 1.7))); tw.moveTo(PX + Math.sin(a) * s * .15, PY); tw.quadraticCurveTo(PX + Math.sin(a) * L * .5, PY - Math.cos(a) * L * .6, PX + Math.sin(a) * L, PY - Math.cos(a) * L * .85); }
      });
      const scrub = rgb(lerp(lerp([60, 52, 44], [0, 0, 0], .3).map((v, j) => v * (amb[j] / 80)), haze, .12));
      c.fillStyle = scrub; c.fill(rp); c.strokeStyle = scrub; c.lineWidth = Math.max(.8, F / 1400); c.stroke(tw);
      c.strokeStyle = rgb(lerp(sunC, skH, .4), .3 + .2 * dawn); c.lineWidth = 1; c.stroke(rl);
    }

    // ----- the city: low houses round the open court, the Kaaba dark in the middle -----
    const boxes = [];
    const box = (x, z, w, d, h, rot, alb, kaaba) => {
      const y0 = kaaba ? height(x, z) : height(x, z) - .3, cr = Math.cos(rot), sr = Math.sin(rot);
      const P = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([a, b]) => [x + a * cr - b * sr, z + a * sr + b * cr]);
      if (!pj(x, y0, z)) return; const zc = PZ; if (PX < -200 || PX > W + 200) return;
      boxes.push([zc, () => {
        const fz = fogOf(zc), lit = shadow(x, y0 + h * .5, z) * sunUp;
        for (let i = 0; i < 4; i++) {
          const A = P[i], Bp = P[(i + 1) % 4], nx = Bp[1] - A[1], nz = -(Bp[0] - A[0]), mx = (A[0] + Bp[0]) / 2 - E0, mz = (A[1] + Bp[1]) / 2 - E2;
          if (nx * mx + nz * mz >= 0) continue; // faces away
          const nl = Math.hypot(nx, nz), lam = Math.max(0, (nx * sun[0] + nz * sun[2]) / nl) * lit, side = kaaba ? .7 + .25 * Math.abs(nx / nl) : .78 + .42 * Math.max(0, (nx * SUNH[0] + nz * SUNH[2]) / nl) * dawn;
          const q = []; let ok = true;
          [[A[0], A[1], y0], [Bp[0], Bp[1], y0], [Bp[0], Bp[1], y0 + h], [A[0], A[1], y0 + h]].forEach(([a, b, yy]) => { if (!pj(a, yy, b)) ok = false; else q.push([PX, PY]); });
          if (!ok) continue;
          c.beginPath(); q.forEach((v, j) => (j ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath();
          const wc = lerp(alb.map((v, j) => v / 255 * (amb[j] * side + lerp(sunC, [255, 240, 222], .2)[j] * lam * (kaaba ? .55 : 1.45))), haze, fz);
          if (kaaba) c.fillStyle = rgb(wc);
          else { const g2 = c.createLinearGradient(0, Math.max(q[2][1], q[3][1]), 0, Math.min(q[0][1], q[1][1])); g2.addColorStop(0, rgb(lerp(wc, [255, 244, 226], .06))); g2.addColorStop(1, rgb(lerp(wc, [20, 16, 18], .28))); c.fillStyle = g2; }
          c.fill();
          if (!kaaba && Math.abs(q[1][0] - q[0][0]) > 24 && (x * 13 % 1) < .5) { // a dark doorway low in the wall
            const u0 = .42 + (x * 7 % 1) * .16, dw = .14, dh = .55, at = (u, v) => [mix(mix(q[0][0], q[1][0], u), mix(q[3][0], q[2][0], u), v), mix(mix(q[0][1], q[1][1], u), mix(q[3][1], q[2][1], u), v)];
            const d0 = at(u0, 0), d1 = at(u0 + dw, 0), d2 = at(u0 + dw, dh), d3 = at(u0, dh);
            c.beginPath(); c.moveTo(d0[0], d0[1]); c.lineTo(d1[0], d1[1]); c.lineTo(d2[0], d2[1]); c.lineTo(d3[0], d3[1]); c.closePath(); c.fillStyle = rgb(lerp([26, 20, 18], haze, fz * .8), .85); c.fill();
          }
          if (kaaba && lam > 0) { c.fillStyle = rgb(lerp(sunC, [255, 236, 200], .2), .16 * lam); c.fill(); c.strokeStyle = rgb(lerp(sunC, [255, 240, 210], .3), .6 * lam); c.lineWidth = 1.2; c.stroke(); }
        }
        const q = []; for (const [a, b] of P) { if (!pj(a, y0 + h, b)) return; q.push([PX, PY]); }
        c.beginPath(); q.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath();
        c.fillStyle = rgb(lerp(alb.map((v, j) => v / 255 * (amb[j] * (kaaba ? .9 : 1.5) + sunC[j] * Math.max(0, sun[1]) * lit * (kaaba ? .5 : 1.2))), haze, fz)); c.fill();
        c.strokeStyle = rgb(lerp(alb.map((v, j) => v / 255 * amb[j] * .7), haze, fz), .7); c.lineWidth = 1; c.stroke(); // the parapet
      }]);
    };
    if (!st.houses) {
      const R = rng(640); st.houses = [];
      for (let i = 0; i < 9000 && st.houses.length < 420; i++) {
        const a = R() * TAU, r = 36 + R() ** .9 * 120, x = KB[0] + Math.cos(a) * r * (1 + .25 * Math.sin(a * 3)), z = KB[2] + Math.sin(a) * r * 1.2;
        if (mount(x, z) > .5) continue;
        if (Math.abs(x - mix(-46, -41, c01((z - 150) / 450))) < 7 && z < KB[2] - 26) continue; // keep the road open
        const w = 5 + R() * 5, d = 5 + R() * 4;
        if (st.houses.some((q) => Math.abs(q[0] - x) < (q[2] + w) * .5 + .8 && Math.abs(q[1] - z) < (q[3] + d) * .5 + .8)) continue;
        st.houses.push([x, z, w, d, (R() < .2 ? 5.5 : 3) + R() * 2.4 + mount(x, z) * 3, .25 + (R() - .5) * .3, R()]);
      }
    }
    st.houses.forEach(([x, z, w, d, h, rot, k]) => box(x, z, w, d, h, rot, k < .07 ? [204, 190, 162] : k > .88 ? [150, 122, 96] : lerp([194, 162, 124], [168, 138, 106], k), false));
    box(KB[0], KB[2], 11.5, 10, 9, .25, [34, 31, 32], true);
    {
      const q = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, x = KB[0] + Math.cos(a) * 34, z = KB[2] + Math.sin(a) * 30; if (!pj(x, height(x, z) + .05, z)) { q.length = 0; break; } q.push([PX, PY]); }
      if (q.length) { c.beginPath(); q.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.closePath(); c.fillStyle = rgb(lerp(lerp(floorLit, [236, 220, 190], .3), haze, fogOf(Math.hypot(KB[0] - E0, KB[2] - E2))), .55); c.fill(); }
    }
    if (sunUp > 0 && sun[1] > .02) { // cast shadows on the ground, long in the low sun
      const sp2 = new Path2D(), kx = -sun[0] / sun[1], kz = -sun[2] / sun[1];
      const hull = (Q) => { Q.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up2 = []; for (const q of Q) { while (lo.length > 1 && cr2(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = Q.length - 1; i >= 0; i--) { const q = Q[i]; while (up2.length > 1 && cr2(up2[up2.length - 2], up2[up2.length - 1], q) <= 0) up2.pop(); up2.push(q); } return lo.slice(0, -1).concat(up2.slice(0, -1)); };
      st.houses.concat([[KB[0], KB[2], 11.5, 10, 9, .25, 0, 1]]).forEach(([x, z, w, d, h, rot]) => {
        const y0 = height(x, z), cr = Math.cos(rot), sr = Math.sin(rot), Q = [];
        if (!pj(x, y0, z) || PZ > 1400 || PX < -300 || PX > W + 300) return;
        if (shadow(x, y0 + h * .5, z) <= 0) return;
        for (const [a, b] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) {
          const gx = x + a * cr - b * sr, gz = z + a * sr + b * cr;
          if (!pj(gx, y0 + .05, gz)) return; Q.push([PX, PY]);
          if (!pj(gx + kx * h, y0 + .05, gz + kz * h)) return; Q.push([PX, PY]);
        }
        const H2 = hull(Q); H2.forEach((q, i) => (i ? sp2.lineTo(q[0], q[1]) : sp2.moveTo(q[0], q[1]))); sp2.closePath();
      });
      c.fillStyle = rgb(lerp([30, 24, 34], amb, .2), .42 * sunUp); c.fill(sp2);
    }
    boxes.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());

    // ----- the army -----
    const vs = 1 - Math.abs(sp) * .5;
    const figs = [], dimFig = lerp([40, 34, 34], [0, 0, 0], 0);
    const figTone = (zc, k = 0) => lerp(lerp(dimFig.map((v, j) => v * (.55 + amb[j] / 120)), [30, 26, 26], k), haze, Math.min(.85, fogOf(zc)));
    const rimC = lerp(sunC, [255, 236, 210], .25), rimA = .55 * dawn;
    const F_ = st.F;
    for (let i = 0; i < F_.length; i++) {
      const f = F_[i];
      const cr = f.hit === undefined ? 0 : smooth(seg(p, f.hit + .002, f.hit + (f.kind === 3 ? .05 : .025)));
      if (cr >= 1) continue;
      const [x, z, tx, tz, s, running] = st.posAt(f, p);
      if (s < 0) continue;
      const emerge = c01(s / 40);
      const y = height(x, z);
      if (!pj(x, y, z)) continue;
      const bx = PX, by0 = PY, zc = PZ, sc = F / zc;
      if (bx < -sc * 5 || bx > W + sc * 5 || by0 < -20 || by0 > H + sc * 5) continue;
      // facing: the way along the road, or back the way they came when they run
      const ahead = pj(x + tx * 3, y, z + tz * 3) ? PX - bx : 0;
      let dir = ahead < 0 ? -1 : 1; if (running) dir = -dir;
      const moving = (p > .11 && p < .385) || running;
      figs.push([zc, f, bx, by0, sc, dir, moving, s, cr, emerge, running]);
    }
    figs.sort((a, b) => b[0] - a[0]);
    // dust kicked up along the march
    const march = seg(p, .11, .4);
    if (march > 0 && march < 1) {
      const sL = st.sLead(p);
      st.dust.forEach(([a, b, k, q]) => {
        const s = sL - a * 330; if (s < 0) return; const [x, z] = st.road(s);
        if (!pj(x + (b - .5) * 12, height(x, z) + 1.2 + k * 3, z + (q - .5) * 8) || PZ < 30) return; const rr = (4 + k * 6) * F / PZ;
        c.globalAlpha = .16 * Math.sin(Math.PI * march) * (1 - fogOf(PZ) * .6); c.drawImage(st.puff, PX - rr * 1.4, PY - rr, rr * 2.8, rr * 1.8);
      });
      c.globalAlpha = 1;
    }

    c.lineJoin = 'round';
    figs.forEach(([zc, f, bx, by0, s, dir, moving, sAlong, cr, emerge, running]) => {
      const sv = s * vs * (f.sc || 1), col = figTone(zc, cr), alpha = emerge;
      c.globalAlpha = alpha;
      // a soft contact shadow under each one
      const sw = (f.kind === 3 ? 2.6 * f.sc : f.kind === 2 ? 1.4 : .45) * s;
      if (sw > 2) { c.globalAlpha = alpha * .5 * (1 - cr); c.drawImage(st.shad, bx - sw * 1.3, by0 - sw * .22, sw * 2.6, sw * .44); c.globalAlpha = alpha; }
      if (f.kind === 3) {
        const hpx = 3.2 * sv;
        const ph = sAlong / 2.2 * Math.PI + f.ph;
        if (hpx < 7) { const pa = new Path2D(); pa.ellipse(bx, by0 - hpx * .6, hpx * .7, hpx * .38, 0, 0, TAU); c.fillStyle = rgb(col); c.fill(pa); c.fillRect(bx - hpx * .45, by0 - hpx * .4, hpx * .9, hpx * .4); }
        else {
          const k = Math.min(.85, fogOf(zc)), alb = [118, 112, 108];
          const top = lerp(alb.map((v, j) => v / 255 * (amb[j] * 1.05 + sunC[j] * .25 * dawn)), haze, k), bot = lerp(alb.map((v, j) => v / 255 * amb[j] * .42), haze, k * .9);
          const cloth = lerp([96, 34, 32].map((v, j) => v * (.42 + amb[j] / 170)), haze, k), gold = lerp([170, 134, 70].map((v, j) => v * (.45 + amb[j] / 170)), haze, k);
          c.save(); c.globalAlpha = alpha * (1 - cr ** 1.4); c.translate(bx, by0); c.scale(s * dir * f.sc, -sv);
          elephant(c, { top: lerp(top, [24, 20, 20], cr * .6), bot: lerp(bot, [14, 12, 12], cr * .6), rim: rimA > .02 ? rimC : null, rimSide: sunSide * dir, cloth, gold, ph, mv: moving ? 1 : 0, lead: f.lead, t, seed: f.seed, big: hpx > 60, crumble: cr, jag: f.jag });
          c.restore();
          c.lineCap = 'butt';
        }
      } else if (f.kind === 2) {
        const pa = new Path2D(), pr = new Path2D(), lp = new Path2D(), svv = sv * (1 - cr);
        poly(pa, HORSE, bx, by0, s * f.sc, svv, dir); poly(pr, RIDER, bx - .1 * s * dir, by0, s * f.sc, svv, dir);
        const swg = moving ? .5 : .06, ph = sAlong * 1.8 + f.ph;
        [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o]) => { const a = Math.sin(ph + o) * swg; lp.moveTo(bx + hu * s * dir, by0 - 1.12 * svv); lp.lineTo(bx + (hu + a * .5) * s * dir, by0 - .52 * svv + Math.abs(a) * .2 * svv); lp.lineTo(bx + (hu + a * .3) * s * dir, by0); });
        c.fillStyle = rgb(col); c.fill(pa); c.fill(pr); c.strokeStyle = rgb(col); c.lineWidth = Math.max(.7, .1 * s); c.stroke(lp);
        c.strokeStyle = rgb(lerp(col, [0, 0, 0], .2)); c.lineWidth = Math.max(.6, .05 * s); c.beginPath(); c.moveTo(bx - .1 * s * dir, by0 - 1.9 * svv); c.lineTo(bx + 1.5 * s * dir, by0 - 3.1 * svv); c.stroke();
      } else {
        const hpx = 1.78 * sv, svv = sv * (1 - cr * .9), lean = moving ? (running ? .16 : .08) : 0, bob = moving ? Math.abs(Math.sin(sAlong * 1.4 + f.ph)) * .05 * svv : 0;
        const pa = new Path2D(), alt = ((sAlong * 1.4 + f.ph) / Math.PI | 0) & 1;
        poly(pa, hpx < 14 ? MANS : alt && moving ? MAN2 : MAN, bx, by0 - bob, s * f.sc, svv, dir, lean);
        c.fillStyle = rgb(col); c.fill(pa);
        if (cr < .5) {
          if (f.kind === 1) { c.strokeStyle = rgb(lerp(col, [0, 0, 0], .2)); c.lineWidth = Math.max(.6, .045 * s); c.beginPath(); const sa = running ? .9 : 0; c.moveTo(bx + (.18 - sa) * s * dir, by0 - .5 * svv); c.lineTo(bx + (.32 + lean * 2.6 - sa * 1.6) * s * dir, by0 - (2.75 - sa * .9) * svv); c.stroke(); }
          if (f.shield && hpx > 6) { c.fillStyle = rgb(lerp(col, [120, 90, 60], .25)); c.beginPath(); c.ellipse(bx + .26 * s * dir, by0 - 1.05 * svv, .24 * s, .3 * svv, 0, 0, TAU); c.fill(); }
          if (f.ban) {
            const L = 4.4 * svv, tx = bx - .1 * s * dir, ty = by0 - L, fl = Math.sin(t * 3 + f.seed + p * 40) * .15, w = 1.4 * s * -dir, h2 = .9 * s;
            c.strokeStyle = rgb(lerp(col, [0, 0, 0], .2)); c.lineWidth = Math.max(.7, .06 * s); c.beginPath(); c.moveTo(tx, by0 - .6 * svv); c.lineTo(tx, ty); c.stroke();
            c.fillStyle = rgb(lerp(lerp([112, 30, 26], col, .35), haze, Math.min(.8, fogOf(zc)))); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + w * .5, ty + h2 * fl, tx + w, ty + h2 * .1 + h2 * fl * 2); c.lineTo(tx + w * .96, ty + h2 * 1.05); c.quadraticCurveTo(tx + w * .5, ty + h2 * (1 + fl), tx, ty + h2); c.closePath(); c.fill();
          }
        }
      }
      c.globalAlpha = 1;
    });
    // ----- the strike: the sky darkens with the flocks; birds, falling stones, the army breaking into chaff -----
    const dark = .2 * smooth(seg(p, .45, .53)) * (1 - smooth(seg(p, .7, .8)));
    if (dark > 0) { c.fillStyle = `rgba(12,10,18,${dark})`; c.fillRect(0, 0, W, H); }
    const V = st.V;
    // chaff: husks peeling off on the wind
    if (p > .5 && p < .98) {
      const P1 = new Path2D(), P2 = new Path2D(), P3 = new Path2D(), D1 = new Path2D();
      const CH = st.CH;
      for (let i = 0; i < CH.length; i++) {
        const [fi, u, v, dl, spd, kk, sp0, spin, life, len, dark2] = CH[i], f = F_[fi];
        const rel = f.hit + .004 + dl * (f.kind === 3 ? .045 : .02);
        const age = p - rel; if (age <= 0 || age > life + .1) continue;
        const fade = 1 - smooth(c01((age - life * .3) / (life * .7 + .1)));
        if (fade <= .02) continue;
        if (!f._b) { const q = st.posAt(f, f.hit); f._b = [q[0], height(q[0], q[1]), q[1], q[2], q[3]]; }
        const [bx, byy, bz, tx, tz] = f._b;
        const gust = 1 - Math.exp(-age * 30);
        const x = bx + tx * u * .5 + (age * 760 * spd) * (.6 + .4 * gust) + Math.sin(age * 40 + sp0) * 2;
        const y = byy + v + gust * (3 + 34 * kk * kk) * Math.min(1, age * 14) - age * age * 260 + Math.sin(age * 55 + sp0) * (1 + 2 * kk);
        const z = bz + tz * u * .5 + age * 180 * spd + Math.cos(age * 33 + sp0) * 3;
        if (!pj(x, Math.max(byy + .05, y), z)) continue;
        const X1 = PX, Y1 = PY;
        if (!pj(x - 760 * spd * .004, Math.max(byy + .05, y), z - 180 * spd * .004)) continue; // where it was a moment ago: the streak runs with the wind
        const L = Math.min(14, Math.max(.8, len * F / Math.max(PZ, 1)) * (.5 + dark2 * .9)), a = sp0 + spin * age * 3, al = gust * .18;
        if (X1 < -L || X1 > W + L || Y1 < -L || Y1 > H + L) continue;
        const pa = dark2 < .28 ? D1 : fade > .66 ? P1 : fade > .33 ? P2 : P3;
        const ex = mix(Math.cos(a) * L, (X1 - PX) * .5, al), ey = mix(Math.sin(a) * L * .8, (Y1 - PY) * .5, al);
        pa.moveTo(X1 - ex, Y1 - ey); pa.lineTo(X1 + ex * .6, Y1 + ey * .6); pa.lineTo(X1 + ex, Y1 + ey + L * .12);
      }
      const straw = lerp([188, 158, 100].map((v, j) => v * (.3 + amb[j] / 120 + sunUp * .3)), [255, 214, 150], .1 * dawn);
      c.lineCap = 'round'; c.lineWidth = Math.max(.8, F / 900);
      c.strokeStyle = rgb(straw, .85); c.stroke(P1); c.strokeStyle = rgb(straw, .5); c.stroke(P2); c.strokeStyle = rgb(straw, .22); c.stroke(P3);
      c.strokeStyle = rgb([46, 38, 34], .55); c.stroke(D1);
      c.lineCap = 'butt';
      // ash and dust where the stones struck, carried off on the same wind
      F_.forEach((f) => {
        if (f.hit === undefined || (f.kind !== 3 && (f.seed * 7 | 0) % 3)) return;
        const age = p - f.hit; if (age <= 0 || age > .2) return;
        if (!f._b) { const q = st.posAt(f, f.hit); f._b = [q[0], height(q[0], q[1]), q[1], q[2], q[3]]; }
        const [bx, byy, bz] = f._b, big = f.kind === 3 ? 2.2 * f.sc : 1;
        if (!pj(bx + age * 420, byy + 2 * big + age * 40, bz + age * 90)) return;
        const rr = (2.5 + age * 60) * big * F / PZ;
        c.globalAlpha = .3 * Math.min(1, age * 60) * (1 - c01(age / .2)) * (1 - fogOf(PZ) * .5); c.drawImage(st.puffD, PX - rr, PY - rr * .7, rr * 2, rr * 1.4);
      });
      c.globalAlpha = 1;
    }
    // the birds
    if (p > .4 && p < .78) {
      const BP = [new Path2D(), new Path2D(), new Path2D()], stoneP = new Path2D();
      const flap = (ph) => Math.sin(t * 15 + ph);
      st.B.forEach((b) => {
        const dt = p - b.r; if (dt < -.11 || dt > .12) return;
        const x = b.x + dt * V, y = b.y + (b.near ? 10 : 60) * smooth(c01(-dt / .085)) + (b.near ? 30 : 90) * smooth(c01(dt / .1)), z = b.z + dt * 40 * b.dz;
        if (!pj(x, y, z)) return;
        const s = Math.min(90, F / PZ * 1.05 * b.sz); if (PX < -s || PX > W + s || PY < -s || PY > H) return;
        const band = PZ < 60 ? 0 : PZ < 220 ? 1 : 2, pa = BP[band], a = flap(b.ph);
        if (s < 3.2) { pa.moveTo(PX - s, PY - s * .25 * a); pa.lineTo(PX, PY + s * .15); pa.lineTo(PX + s, PY - s * .25 * a); }
        else {
          const wy = -s * .42 * a, jy = -s * .12 - s * .16 * a;
          pa.moveTo(PX - s, PY + wy); pa.quadraticCurveTo(PX - s * .5, PY + jy - s * .1, PX - s * .14, PY - s * .05); pa.lineTo(PX + s * .14, PY - s * .05);
          pa.quadraticCurveTo(PX + s * .5, PY + jy - s * .1, PX + s, PY + wy); pa.quadraticCurveTo(PX + s * .45, PY + jy + s * .12, PX + s * .12, PY + s * .1);
          pa.lineTo(PX + s * .05, PY + s * .32); pa.lineTo(PX, PY + s * .2); pa.lineTo(PX - s * .05, PY + s * .32); pa.lineTo(PX - s * .12, PY + s * .1);
          pa.quadraticCurveTo(PX - s * .45, PY + jy + s * .12, PX - s, PY + wy); pa.closePath();
        }
        if (dt < 0) { const r = Math.max(.7, s * .07); stoneP.rect(PX - r * 2.2, PY + s * .2, r, r); stoneP.rect(PX + r * 1.2, PY + s * .2, r, r); if (s > 6) stoneP.rect(PX + s * .3, PY - s * .02, r, r); }
      });
      const bcol = (k) => rgb(lerp([22, 18, 24], haze, k));
      c.lineJoin = 'round';
      [2, 1, 0].forEach((b) => { c.fillStyle = bcol([.42, .2, .05][b]); c.strokeStyle = c.fillStyle; c.lineWidth = b === 2 ? 1.1 : 1.3; c.fill(BP[b]); c.stroke(BP[b]); });
      c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,214,150,.85)'; c.fill(stoneP); c.globalCompositeOperation = 'source-over';
    }
    // the stones: sparks falling, a flash where each lands
    if (p > .44 && p < .74) {
      const glowP = new Path2D(), coreP = new Path2D(), heads = [];
      st.stones.forEach((q) => {
        const u = (p - q.r) / q.fd;
        if (u < 0 || u > 1.6) return;
        if (u <= 1) {
          const at = (w) => [mix(q.x0, q.x1, w), mix(q.y0, q.y1, w ** 1.5), mix(q.z0, q.z1, w)];
          const h = at(u), tl = at(Math.max(0, u - .2));
          if (!pj(h[0], h[1], h[2])) return; const hx2 = PX, hy2 = PY, hz = PZ;
          if (!pj(tl[0], tl[1], tl[2])) return;
          glowP.moveTo(PX, PY); glowP.lineTo(hx2, hy2); coreP.moveTo(mix(PX, hx2, .5), mix(PY, hy2, .5)); coreP.lineTo(hx2, hy2);
          heads.push([hx2, hy2, Math.max(3, Math.min(26, 1.6 * F / hz)), .8]);
        } else if (pj(q.x1, q.y1, q.z1)) {
          const k = (u - 1) / .6, bx = PX, by2 = PY, sz = F / PZ;
          heads.push([bx, by2, Math.max(4, Math.min(40, 2.2 * sz)), .7 * (1 - k) ** 2]);
          for (let j = 0; j < 6; j++) { const a = j * 1.05 + q.r * 900, v = (.6 + (j * .37 + q.r * 77) % 1) * 3.2, dx = Math.cos(a) * v * k, dy = -Math.abs(Math.sin(a)) * v * k + 9 * k * k; glowP.moveTo(bx + dx * sz * .85, by2 + dy * sz * .85); glowP.lineTo(bx + dx * sz, by2 + dy * sz); coreP.moveTo(bx + dx * sz * .9, by2 + dy * sz * .9); coreP.lineTo(bx + dx * sz, by2 + dy * sz); }
        }
      });
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      c.strokeStyle = 'rgba(255,150,70,.32)'; c.lineWidth = Math.max(2.2, F / 420); c.stroke(glowP);
      c.strokeStyle = 'rgba(255,240,200,.95)'; c.lineWidth = Math.max(.9, F / 1300); c.stroke(coreP);
      const tg = tint('#ffb86a');
      heads.forEach(([x, y, r, a]) => { c.globalAlpha = Math.min(1, a); c.drawImage(tg, x - r, y - r, r * 2, r * 2); });
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.lineCap = 'butt';
    }

    // ----- grade: low morning haze in the valley, a gentle vignette -----
    const mist = .18 * smooth(seg(p, .8, .95));
    if (mist > 0) { const g = c.createLinearGradient(0, hy - H * .05, 0, hy + H * .2); g.addColorStop(0, rgb(lerp(skH, sunC, .2), 0)); g.addColorStop(.4, rgb(lerp(skH, sunC, .2), mist)); g.addColorStop(1, rgb(lerp(skH, sunC, .2), 0)); c.fillStyle = g; c.fillRect(0, hy - H * .05, W, H * .25); }
    const vg = c.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .3, W / 2, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(8,8,12,0)'); vg.addColorStop(1, 'rgba(8,7,10,.6)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
