(() => {
// ghar: the night of the Hijra on Thawr, south of Mecca, then the road north at dawn. Two small worlds in metres
// (x east, y up, z north) seen through a pinhole camera keyed on p (eye, yaw, pitch); the land is a heightfield
// painted as depth bands by terrainRaster (core.js). Three shots, joined by dissolves that follow p:
//   1  the way up: Mecca's lamps far below in its valley; the Prophet and one companion climb toward the camera;
//   2  the cave: the two seated in its mouth; the pursuers' torches come up the slope, linger, go back down;
//      the first light comes over the mountain;
//   3  world B: the road north across the desert at dawn, the two walking, the palms of Quba ahead.
// The Prophet is a veiled figure with a gold disc (scenes/holy.js); the companion and the pursuers are faceless
// silhouettes. No face is drawn. As the torches come up, a spider's web spins across the mouth and stays («وبعث الله
// العنكبوت فنسجت على باب الغار», Tafsir al-Qummi 1:276); no dove (not in the verified text).
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const D2R = Math.PI / 180;
const ridged = (a, b) => 1 - Math.abs(Math.sin(a + Math.sin(b * .73) * 1.3) * Math.cos(b + Math.sin(a * .61) * 1.1));

// ---------- world A: Thawr, the plain, the valley of Mecca to the north ----------
const VX = (z) => -280 + 240 * Math.sin(z * .0006 + .5); // the valley of Mecca winds north
const dome = (x, z) => { const r = Math.hypot(x / 640, (z + 60) / 820); return 340 * Math.exp(-(r ** 1.15) * 1.9); }; // a peak, its flanks hollowing toward the plain
const HC = dome(0, 2); // the floor of the cave mouth
function hA(x, z) {
  const b = dome(x, z), rr = Math.hypot(x, z + 60), d = Math.hypot(x, z - 1);
  let h = b + 8 * Math.sin(Math.atan2(z + 60, x) * 7 + rr * .006) * c01((rr - 60) / 260) * c01(b / 200); // spurs and gullies
  h += (ridged(x * .017 + 1.3, z * .015) * 7 + ridged(x * .05, z * .046 + 2) * 1.6) * c01(b / 160) * (.35 + .65 * c01((d - 6) / 30)); // granite
  h = mix(h, HC - .15, smooth(c01(1 - Math.hypot(x / 8, (z - 2.5) / 6)))); // the ledge before the mouth
  const off = Math.abs(x - VX(z)), plain = smooth(c01((z - 420) / 420)) * (1 - smooth(c01((z - 2100) / 600)));
  const side = smooth(c01((Math.abs(x + 120) - 650) / 900)), valley = z > 1700 ? smooth(c01((off - 380) / 760)) : 1;
  const amp = mix(1, Math.max(.03, side), plain) * valley * (210 + 150 * smooth(c01((off - 1200) / 2600)));
  const hills = (ridged(x * .0017, z * .0014 + 1) * .55 + ridged(x * .0043 + 2, z * .0039) * .3 + ridged(x * .012, z * .011 + 3) * .15) * amp;
  return Math.max(h, hills - 8) + 2.2 * Math.sin(x * .013 + z * .009) * Math.sin(z * .017 - x * .006);
}
// the way up, the last part of it: the two climb toward the camera, then into the mouth
const TRAIL = [[-24, 168], [10, 136], [-18, 102], [10, 70], [-10, 44], [6, 24], [-3, 12], [.6, 4], [.6, 1.2]];
const SEAT = { pro: [.62, -.75], com: [-.62, -.75] };
const pathOf = (pts) => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; };
const along = (P, s) => {
  s = Math.max(0, Math.min(P.len, s));
  let i = 1; while (i < P.pts.length - 1 && P.cum[i] < s) i++;
  const a = P.pts[i - 1], b = P.pts[i], k = (s - P.cum[i - 1]) / ((P.cum[i] - P.cum[i - 1]) || 1);
  return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
};
const TP = pathOf(TRAIL);
const walkU = (p) => smooth(seg(p, -.02, .27));
// the cave: a gap under a heap of granite. Boulders are [x, y over the floor, z, r]; back ones stand behind the mouth
const MOUTH = [[-1.6, 0], [-1.7, .5], [-1.5, 1.1], [-1.15, 1.45], [-.55, 1.62], [-.1, 1.78], [.5, 1.7], [1.0, 1.5], [1.4, 1.12], [1.62, .55], [1.66, 0]];
const BACK = [[-3.6, 1.3, -2.4, 2.7], [3.8, 1.1, -2.5, 2.8], [.2, 3.9, -3, 3.3], [-2.4, 5.4, -5.2, 3], [2.8, 5.5, -5.4, 3.1], [-6.4, 1, -4.4, 2.6], [6.6, .8, -4.6, 2.5], [0, 7.6, -8, 3.6], [-5.2, 3.8, -7, 2.8], [5.4, 3.6, -7.2, 2.9], [-8.8, .2, -6, 2.2], [9, .1, -6.4, 2.3]];
const FRONT = [[-2.66, .95, -.15, 1.18], [2.78, .86, -.1, 1.14], [.1, 2.98, -.2, 1.26], [-1.9, 2.18, .05, .84], [2.0, 2.24, .05, .88], [-4, .45, .6, .72], [3.7, .4, .9, .64]];
// the pursuers: seven men, five torches, up the east side to the ledge and back down
const HUNT = Array.from({ length: 7 }, (_, i) => ({
  i, torch: i !== 2 && i !== 5, d: i * .0065,
  from: [40 + (i % 3) * 6 - i * 1.2, 120 + i * 8], mid: [20 + (i % 2) * 5, 44 + i * 2.6],
  at: [[4.6, 4.2], [2.8, 6.6], [6.8, 6.2], [.4, 7.4], [4.8, 9], [8.4, 4.4], [-1.6, 6.2]][i],
}));
// the web: in the plane just before the dark of the mouth (u across, v up). Frame and radials go first, then the
// sticky spiral from the rim inward, as an orb-weaver lays it; WEBK is the stretch of p it takes
const WEBZ = -.22, WEBK = [.505, .6], WHUB = [.08, .8];
function webOf(R) {
  const rim = [...MOUTH.map(([u, v]) => [u * .93, Math.max(.04, v * .93)]), [0, .04]]; // the mouth, closed along the floor
  const cast = (a) => { // where a ray from the hub meets the rim
    const dx = Math.cos(a), dy = Math.sin(a); let best = 9;
    for (let i = 0; i < rim.length; i++) {
      const [x1, y1] = rim[i], [x2, y2] = rim[(i + 1) % rim.length], ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-6) continue;
      const s = ((x1 - WHUB[0]) * ey - (y1 - WHUB[1]) * ex) / den, q = ((x1 - WHUB[0]) * dy - (y1 - WHUB[1]) * dx) / den;
      if (s > 0 && q >= 0 && q <= 1) best = Math.min(best, s);
    }
    return [WHUB[0] + dx * best, WHUB[1] + dy * best];
  };
  const N = 15, rad = Array.from({ length: N }, (_, i) => cast((i + .5 + (R() - .5) * .5) / N * TAU));
  const order = rad.map((_, i) => i).sort(() => R() - .5);
  const spiral = [], TURNS = 13;
  for (let j = 0; j < TURNS * N; j++) {
    const i = j % N, f = (.93 - (j / N) * (.8 / TURNS)) * (1 + (R() - .5) * .05), a = rad[i]; // hand-spun: never quite even
    spiral.push([WHUB[0] + (a[0] - WHUB[0]) * f, WHUB[1] + (a[1] - WHUB[1]) * f]);
  }
  return { rad, order, spiral, glint: Array.from({ length: 18 }, () => [R() * spiral.length | 0, R() * 9]) };
}

// ---------- world B: the road north across the desert; Quba's palms ahead ----------
const RX = (z) => 10 * Math.sin(z * .0024) - z * .17 + 5 * Math.sin(z * .0071 + 1); // heads a little west of north
const GROVE = [RX(700), 700];
const prof = (q) => (q < .7 ? smooth(q / .7) ** 1.3 : q < .8 ? 1 - .15 * ((q - .7) / .1) ** 2 : .85 * (1 - smooth((q - .8) / .2)));
function hB(x, z) {
  const dr = Math.abs(x - RX(z));
  let h = 1.2 * Math.sin(x * .013 + z * .008) * Math.sin(z * .011 - x * .004) + .6 * Math.sin(x * .05 - z * .031);
  const dun = smooth(c01((dr - 22) / 70)) * (1 - .7 * smooth(c01((z - 420) / 260)));
  if (dun > 0) { const a = x * .011 + z * .007 + Math.sin(z * .006 + x * .003) * 1.4, b = x * .005 - z * .013; h += dun * (2 + 6 * prof(a - Math.floor(a)) + 3 * prof(b - Math.floor(b))); }
  const lava = smooth(c01((dr - 380) / 600));
  h += lava * (16 + 30 * ridged(x * .004, z * .0033 + 1) + 9 * ridged(x * .013, z * .011));
  h += smooth(c01((z - 1500) / 900)) * (40 + 26 * Math.sin(x * .0021 + 1) + 16 * ridged(x * .006, 2)); // the hills beyond the oasis
  return h;
}
const harra = (x, z) => smooth(c01((Math.abs(x - RX(z)) - 340) / 400)) * c01(.55 + .45 * Math.sin(x * .009 + z * .005));

// ---------- shots: [p, x, y, z, yaw°, pitch°]. A: y over the cave floor. B: x off the road, y over the sand ----------
const SHOTS = [
  { B: 0, a: -.06, b: .292, keys: [[-.06, 0, 0, 0, 0, -11], [.22, 0, 0, 0, 0, -13], [.29, -13, 7.5, 3, 52, -20]] },
  { B: 0, a: .262, b: .825, keys: [[.262, -4.4, 1.85, 9.2, 165, -4], [.3, -4, 1.75, 8.6, 166, -4], [.45, -3.1, 1.55, 6.6, 168, -3], [.5, -11, 4.2, 18.5, 150, -9], [.68, -11.6, 4.4, 19.4, 151, -8.5], [.76, -12, 6, 20, 152, -4], [.825, -12, 7.6, 20, 153, -2]] },
  { B: 1, a: .785, b: 1.06, keys: [[.785, 1.4, 3.6, -18, 349, 1.5], [.86, 1, 3.2, -14, 350, 0], [.93, .7, 4.4, -20, 350.5, -2.2], [1.06, .6, 4.6, -22, 350.5, -2.3]] },
];
const camKey = (K, p) => { let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++; return crv(K.map((k) => k.slice(1)), i + smooth(c01((p - K[i][0]) / (K[i + 1][0] - K[i][0])))); };
// light keys: p, sky top, sky mid, horizon, ambient, the night sky's light, sun colour, sun elevation°, fog colour, fog length, stars
const LK = [
  [-.06, [5, 8, 20], [14, 19, 40], [40, 48, 78], [50, 58, 94], [96, 108, 146], [255, 150, 90], -14, [34, 42, 70], 3200, 1],
  [.7, [5, 8, 20], [14, 19, 40], [40, 48, 78], [50, 58, 94], [96, 108, 146], [255, 150, 90], -14, [34, 42, 70], 3200, 1],
  [.79, [14, 20, 44], [44, 50, 84], [176, 118, 104], [70, 72, 104], [40, 44, 70], [255, 150, 90], -2, [96, 82, 96], 2800, .3],
  [.84, [26, 38, 74], [80, 90, 124], [226, 162, 122], [120, 118, 140], [8, 9, 14], [255, 172, 112], 1, [176, 146, 132], 3000, .03],
  [.93, [34, 50, 90], [96, 106, 138], [236, 186, 142], [150, 144, 158], [0, 0, 0], [255, 196, 140], 3.4, [196, 170, 150], 3600, 0],
  [1.06, [38, 56, 98], [104, 114, 144], [238, 198, 156], [160, 154, 164], [0, 0, 0], [255, 210, 160], 6, [204, 182, 160], 4200, 0],
];
const NIGHT_L = norm([-.5, 1, .35]);
const SUN_AZ = 76 * D2R; // a little north of east

// ---------- silhouettes (u across, v up, metres) ----------
const MANF = [-.36, 0, -.31, .5, -.25, 1.0, -.27, 1.3, -.22, 1.42, -.13, 1.47, -.12, 1.56, -.115, 1.66, -.07, 1.75, 0, 1.78, .07, 1.75, .115, 1.66, .12, 1.56, .13, 1.47, .22, 1.42, .27, 1.3, .25, 1.0, .31, .5, .36, 0];
const SITS = [-.52, 0, -.5, .1, -.36, .26, -.27, .5, -.26, .66, -.17, .73, -.11, .76, -.115, .86, -.08, .95, 0, .98, .08, .95, .115, .86, .11, .76, .17, .73, .26, .66, .27, .5, .36, .26, .5, .1, .52, 0];
const MAN = [-.34, 0, -.27, .55, -.2, 1.0, -.25, 1.3, -.21, 1.42, -.17, 1.5, -.16, 1.62, -.1, 1.74, .02, 1.78, .11, 1.7, .12, 1.58, .08, 1.5, .2, 1.42, .24, 1.25, .19, 1.0, .26, .55, .32, 0];
const MAN2 = [-.4, 0, -.3, .5, -.21, 1.0, -.26, 1.32, -.2, 1.44, -.1, 1.5, -.14, 1.58, -.13, 1.7, -.04, 1.79, .08, 1.78, .14, 1.68, .12, 1.56, .07, 1.5, .19, 1.44, .25, 1.28, .2, 1.0, .3, .5, .36, 0];
const poly = (g, sh, bx, by, s, sv, dir, sway = 0) => {
  g.beginPath();
  for (let i = 0; i < sh.length; i += 2) { const v = sh[i + 1], X = bx + (sh[i] + sway * (1 - v / 1.8) ** 2) * dir * s, Y = by - v * sv; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath();
};

// the camera of a shot at p (before the phone's step back); shot 1 walks backwards up the slope ahead of the two
function camOf(shot, p, pro, phone = false) {
  let [ex, ey, ez, yaw, pitch] = camKey(shot.keys, p);
  if (shot.B) return [ex + RX(ez), ey + hB(ex + RX(ez), ez), ez, yaw, pitch];
  if (shot === SHOTS[0]) {
    // up the slope and off to the west of them, high enough that the way, the plain and the city all hold the frame
    const w = 1 - smooth(seg(p, .21, .27)), k = smooth(seg(p, -.06, .1)), D = mix(58, 21, k);
    if (w > 0) {
      const dx = -6 - pro[0], dz = -40 - pro[1], dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl, lx = uz > 0 ? uz : -uz, lz = uz > 0 ? -ux : ux;
      const fx = pro[0] + (ux * .85 - Math.abs(lx) * .5) * D, fz = pro[1] + (uz * .85 + lz * Math.sign(-lx || 1) * .5) * D;
      const fy = Math.max(hA(fx, fz) + 3.5, hA(pro[0], pro[1]) + D * .3) - HC;
      const down = Math.atan2(hA(pro[0], pro[1]) + 1 - (fy + HC), Math.hypot(pro[0] - fx, pro[1] - fz)) / D2R; // keep the two a little below the middle
      ex = mix(ex, fx, w); ez = mix(ez, fz, w); ey = mix(ey, fy, w); yaw = mix(yaw, Math.atan2(pro[0] - fx, pro[1] - fz) / D2R - 15, w); pitch = mix(pitch, Math.min(-13, down + (phone ? 24 : 11)), w);
    }
  }
  return [ex, ey + HC, ez, yaw, pitch];
}
const proAt = (p) => { const s = mix(6, TP.len, walkU(p)), q = along(TP, s), k = smooth(c01((s - (TP.len - 4)) / 4)); return [mix(q[0], SEAT.pro[0], k), mix(q[1], SEAT.pro[1], k)]; };

// ---------- one shot drawn into one context ----------
function render(c, W, H, st, shot, p, t, phone) {
  const B = shot.B, hf_ = B ? hB : hA;
  // the two on the way up
  const wu = walkU(p), sPro = mix(6, TP.len, wu), sCom = Math.max(0, sPro - 1.5);
  const posOn = (s, seat, side = 0) => {
    const q = along(TP, s), q2 = along(TP, s + .5), tx = q2[0] - q[0], tz = q2[1] - q[1], tl = Math.hypot(tx, tz) || 1, k = smooth(c01((s - (TP.len - 4)) / 4));
    const e = -tz < 0 ? -1 : 1, nx = -tz / tl * e, nz = tx / tl * e; // the side toward the east
    return [mix(q[0] + nx * side, seat[0], k), mix(q[1] + nz * side, seat[1], k)];
  };
  const pro = posOn(sPro, SEAT.pro), com = posOn(sCom, SEAT.com, 1.3); // the companion a pace behind, at his side
  // ----- camera -----
  let [ex, ey, ez, yaw, pitch] = camOf(shot, p, pro, phone);
  if (phone) { const k = B ? 6 : shot === SHOTS[0] ? 0 : p < .47 ? 1.5 : 2; ex -= Math.sin(yaw * D2R) * k; ez -= Math.cos(yaw * D2R) * k; ey += k * .25; }
  ey = Math.max(ey, hf_(ex, ez) + 1.3);
  const yw = yaw * D2R, pt = pitch * D2R, cp = Math.cos(pt), sp = Math.sin(pt);
  const fw = [Math.sin(yw) * cp, sp, Math.cos(yw) * cp], rt = [Math.cos(yw), 0, -Math.sin(yw)], up = cross(fw, rt);
  const F = phone ? W * 1.3 : Math.min(H * 1.3, W * .98), cx = W / 2, cy = H * (phone ? .64 : .52);
  const E0 = ex, E1 = ey, E2 = ez, [f0, f1, f2] = fw, [r0, , r2] = rt, [u0, u1, u2] = up;
  let PX = 0, PY = 0, PZ = 0;
  const pj = (x, y, z) => { const dx = x - E0, dy = y - E1, dz = z - E2, zc = dx * f0 + dy * f1 + dz * f2; if (zc < .3) return false; const iz = F / zc; PX = cx + (dx * r0 + dz * r2) * iz; PY = cy - (dx * u0 + dy * u1 + dz * u2) * iz; PZ = zc; return true; };
  const dirP = (v) => { const zc = v[0] * f0 + v[1] * f1 + v[2] * f2; if (zc < .05) return false; PX = cx + (v[0] * r0 + v[2] * r2) * F / zc; PY = cy - (v[0] * u0 + v[1] * u1 + v[2] * u2) * F / zc; return true; };
  // ----- light -----
  const [skT, skM, skH, amb, nightC, sunC, elev, fogC, fogL, starA] = keyAt(LK, p);
  const se = elev * D2R, sun = [Math.sin(SUN_AZ) * Math.cos(se), Math.sin(se), Math.cos(SUN_AZ) * Math.cos(se)];
  const dawn = c01((elev + 14) / 17), night = c01(1 - dawn * 1.15);
  const fogOf = (d) => Math.min(.94, 1 - Math.exp(-d / fogL));
  const hazeAt = (vx, vz) => { const k = Math.max(0, (vx * sun[0] + vz * sun[2]) / (Math.hypot(vx, vz) || 1)) ** 4; return lerp(fogC, lerp(skH, sunC, .3), k * .7 * dawn); };

  // ----- sky: rows of equal elevation -----
  const yAt = (e) => cy - F * Math.tan(Math.max(-1.5, Math.min(1.5, e - pt)));
  const yH = yAt(0), yZ = yAt(1.45), span = yH - yZ;
  { const g = c.createLinearGradient(0, yZ, 0, yH), at = (e) => c01((yAt(e) - yZ) / span);
    g.addColorStop(0, rgb(lerp(skT, [2, 3, 8], .3))); g.addColorStop(at(.42), rgb(skT)); g.addColorStop(at(.13), rgb(skM)); g.addColorStop(at(.035), rgb(lerp(skM, skH, .7))); g.addColorStop(1, rgb(skH));
    c.fillStyle = g; c.fillRect(0, 0, W, H); }
  if (dawn > .02) { // the first light low in the east
    const sd = [Math.sin(SUN_AZ), Math.max(sun[1], .015), Math.cos(SUN_AZ)];
    if (dirP(sd)) { const g = c.createRadialGradient(PX, PY, 0, PX, PY, F * 1.2); g.addColorStop(0, rgb(sunC, .5 * dawn)); g.addColorStop(.18, rgb(sunC, .16 * dawn)); g.addColorStop(1, rgb(sunC, 0)); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    if (elev > -.8 && dirP(sun)) { const r = F * .0068; c.globalAlpha = c01((elev + .8) / 1.4); c.globalCompositeOperation = 'lighter'; c.drawImage(st.pale, PX - r * 9, PY - r * 9, r * 18, r * 18); c.fillStyle = 'rgba(255,246,226,.95)'; c.beginPath(); c.arc(PX, PY, r, 0, TAU); c.fill(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  }
  if (starA > .01) { // the stars turn as the nights pass; the Milky Way a pale river across them
    const rot = p * .5, cr = Math.cos(rot), sr = Math.sin(rot), turn = (v) => [v[0] * cr - v[2] * sr * .5, v[1], v[2] * cr + v[0] * sr * .5];
    c.globalCompositeOperation = 'lighter';
    st.milky.forEach(([x, y, z, s]) => { if (!dirP(turn([x, y, z]))) return; const q = F * (.13 + .07 * s); c.globalAlpha = .12 * starA * c01(y * 4 + .15); c.drawImage(st.pale, PX - q, PY - q * .55, q * 2, q * 1.1); });
    c.globalAlpha = 1;
    const bins = [[], [], [], [], [], []], sz = Math.max(1, H / 900);
    for (const s of st.stars) {
      if (!dirP(turn(s)) || PX < 0 || PX > W || PY < 0 || PY > H) continue;
      const al = Math.min(1, s[3] * 1.3 * starA * (.7 + .3 * Math.sin(t * 1.3 + s[4] * 7)) * c01(s[1] * 5 + .05));
      if (al > .04) bins[Math.min(5, al * 6 | 0)].push(PX, PY, s[3] > 1.25 ? 2 * sz : sz);
    }
    bins.forEach((b, k) => { if (!b.length) return; c.fillStyle = `rgba(232,228,214,${((k + .5) / 6).toFixed(3)})`; c.beginPath(); for (let i = 0; i < b.length; i += 3) c.rect(b[i], b[i + 1], b[i + 2], b[i + 2]); c.fill(); });
    c.globalCompositeOperation = 'source-over';
  }

  // ----- point lights on the land: the pursuers' torches, the disc -----
  const lights = [], hunt = [];
  const caveShot = shot === SHOTS[1];
  if (caveShot && p > .47 && p < .74) {
    HUNT.forEach((o) => {
      const upk = smooth(seg(p, .5 + o.d, .6 + o.d)), dn = smooth(seg(p, .642 + o.d * .7, .725 + o.d * .7));
      if (upk <= 0 || dn >= 1) return;
      let q;
      if (dn > 0) q = dn < .5 ? lerp(o.at, o.mid, dn * 2) : lerp(o.mid, o.from, dn * 2 - 1); else q = upk < .6 ? lerp(o.from, o.mid, upk / .6) : lerp(o.mid, o.at, (upk - .6) / .4);
      let [x, z] = q;
      const lin = upk >= 1 && dn <= 0 ? seg(p, .6 + o.d, .642 + o.d * .7) : -1; // milling by the mouth
      if (lin >= 0) { x += Math.sin(lin * 9 + o.i * 2) * .9; z += Math.sin(lin * 6.5 + o.i) * .6; }
      const moving = (upk > 0 && upk < 1) || (dn > 0 && dn < 1) || lin >= 0, y = hA(x, z);
      const fl = .82 + .18 * Math.sin(t * 13 + o.i * 5) * Math.sin(t * 7.3 + o.i);
      hunt.push({ o, x, y, z, moving, ph: upk * 60 + dn * 60 + Math.max(0, lin) * 5 + o.i, back: dn > 0, fl });
      if (o.torch) lights.push([x + .3, y + 2.05, z, 1.6 * fl, 255, 150, 70]);
    });
  }
  const torches = lights.slice();
  const discOn = !B && (caveShot || p > .262);
  if (discOn) lights.push([SEAT.pro[0], HC + 1, SEAT.pro[1] + .5, .5, 255, 214, 150]);

  // ----- terrain: depth bands, far to near -----
  const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
  const hf = norm([f0, 0, f2]), hr = [hf[2], 0, -hf[0]];
  const by = (H - cy) / F, dyb = sp - by * cp, dhb = cp + by * sp, gE = hf_(E0, E2);
  const dMin = dyb < -.01 ? Math.max(.7, (E1 - gE) / -dyb * dhb * .45) : 2.5, dMax = B ? 6000 : 9000;
  const sunUp = sun[1] > -.04;
  const albA = (x, z, h, hx, hz) => { const rock = c01(Math.hypot(hx, hz) * 1.1 - .2), sand = c01(1 - h / 70) * (1 - rock), v = c01(.5 + .5 * Math.sin(x * .07 + z * .05) * Math.sin(z * .11 - x * .03) + .35 * Math.sin(x * .021 - z * .017)), wadi = sand * smooth(c01(1 - Math.abs(Math.sin(x * .004 + Math.sin(z * .0021) * 2.2)) * 9)); return lerp(lerp(lerp([104, 96, 90], [70, 64, 62], rock), [54, 52, 54], v * .7), lerp([132, 116, 96], [176, 160, 132], wadi), sand); };
  const albB = (x, z) => { const dr = Math.abs(x - RX(z)); let al = lerp(lerp([206, 168, 120], [186, 148, 106], c01(.5 + .5 * Math.sin(x * .03 + z * .021))), [74, 62, 58], harra(x, z)); if (dr < 3.2) al = lerp(al, [214, 186, 146], .5 * (1 - dr / 3.2)); return al; };
  for (let i = 0; i < NS; i++) {
    const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1));
    const zc0 = Math.max(.6, d * cp + Math.max(0, -sp) * (E1 + 40)), fogK = fogOf(d);
    for (let k = 0; k <= NK; k++) {
      const sx = -W * .1 + k * (W * 1.2 / NK), u = (sx - cx) / F * zc0;
      const x = E0 + hf[0] * d + hr[0] * u, z = E2 + hf[2] * d + hr[2] * u, h = hf_(x, z);
      const o = i * (NK + 1) + k;
      if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
      if (k % 2) continue;
      const e = Math.max(.35, d * .004), hx = (hf_(x + e, z) - h) / e, hz = (hf_(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz);
      const sky = .5 + .5 / nl, al = B ? albB(x, z) : albA(x, z, h, hx, hz);
      let lr = amb[0] * sky * .7, lg = amb[1] * sky * .7, lb = amb[2] * sky * .7;
      if (night > 0) { const ln = Math.max(0, (-hx * NIGHT_L[0] + NIGHT_L[1] - hz * NIGHT_L[2]) / nl) ** 1.3 * night; lr += nightC[0] * ln; lg += nightC[1] * ln; lb += nightC[2] * ln; }
      if (sunUp) {
        let lam = Math.max(0, (-hx * sun[0] + sun[1] - hz * sun[2]) / nl) * c01((elev + 4) / 4);
        if (lam > 0) { let sh = 1; for (let m = 0, L = 6; m < 4; m++, L *= 2.6) { const q = hf_(x + sun[0] * L, z + sun[2] * L) - (h + .3 + sun[1] * L); if (q > 0) { sh = Math.min(sh, 1 - c01(q / 2.5)); if (sh <= 0) break; } } lam *= sh; }
        lr += sunC[0] * lam * 1.25; lg += sunC[1] * lam * 1.25; lb += sunC[2] * lam * 1.25;
      }
      for (let j = 0; j < lights.length; j++) { const L = lights[j], dd = (x - L[0]) ** 2 + (h - L[1]) ** 2 + (z - L[2]) ** 2, q = L[3] * .7 / (1 + dd / 20); if (q > .01) { lr += L[4] * q; lg += L[5] * q; lb += L[6] * q; } }
      const hz2 = hazeAt(x - E0, z - E2), fa = Math.min(.96, fogK * (B ? 1 : 1 - .25 * c01(h / 300))), n = (i * NC + k / 2) * 3;
      TC[n] = mix(al[0] / 255 * lr, hz2[0], fa); TC[n + 1] = mix(al[1] / 255 * lg, hz2[1], fa); TC[n + 2] = mix(al[2] / 255 * lb, hz2[2], fa);
    }
  }
  terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .16);

  const items = [];
  // a figure's feet and head on screen: the height follows the real projection, so a camera looking down shortens it
  const stand = (x, y, z, m) => { if (!pj(x, y + m, z)) return null; const hx = PX, hy = PY; if (!pj(x, y, z) || PZ < 1.2) return null; return { x: PX, y: PY, z: PZ, h: Math.max(3, Math.hypot(PX - hx, PY - hy)), s: F / PZ }; };
  // granite: a faceted rounded mass, sky-lit on top, dark underneath, with grain; torchlight warms the side facing it
  const rockLit = [0, 1, 2].map((j) => 96 / 255 * (amb[j] * .8 + nightC[j] * night * .85 + sunC[j] * Math.max(0, sun[1]) * 3)), rockDark = rockLit.map((v) => v * .14), rockDarkOf = () => rockDark;
  const grain = c.createPattern(grainTile(), 'repeat');
  const shadeRock = (b, dim = 0) => {
    if (!pj(b.x, b.y, b.z)) return;
    const R0 = b.r * F / PZ; if (R0 < 1.2 || PX < -R0 * 2 || PX > W + R0 * 2 || PY < -R0 * 2 || PY > H + R0 * 2) return;
    const X = PX, Y = PY, fz = fogOf(PZ), ZZ = PZ;
    const L1 = lerp(lerp(rockLit, [0, 0, 0], dim), fogC, fz), L0 = lerp(rockDark, fogC, fz * .9);
    // contact shadow on what lies behind
    c.fillStyle = rgb([4, 4, 8], .35 * (1 - fz)); c.beginPath(); c.ellipse(X, Y + R0 * .55, R0 * 1.3, R0 * .32, 0, 0, TAU); c.fill();
    c.beginPath();
    b.pts.forEach((q, j) => { const a = j / b.pts.length * TAU + b.k, rr = R0 * q, s = Math.sin(a); const xx = X + Math.cos(a) * rr * 1.12, yy = Y + s * rr * (s > 0 ? .58 : .84); j ? c.lineTo(xx, yy) : c.moveTo(xx, yy); });
    c.closePath();
    const g = c.createLinearGradient(X - R0 * .3, Y - R0 * .85, X + R0 * .25, Y + R0 * .6);
    g.addColorStop(0, rgb(L1)); g.addColorStop(.35, rgb(lerp(L1, L0, .45))); g.addColorStop(1, rgb(L0));
    c.fillStyle = g; c.fill();
    if (R0 > 6) {
      c.save(); c.clip();
      c.globalCompositeOperation = 'overlay'; c.globalAlpha = .45 * (1 - fz) * c01((R0 - 6) / 30); c.fillStyle = grain; c.fillRect(X - R0 * 1.3, Y - R0, R0 * 2.6, R0 * 2);
      c.globalAlpha = 1; c.globalCompositeOperation = 'lighter';
      for (const L of lights) {
        const dd = (b.x - L[0]) ** 2 + (b.y - L[1]) ** 2 + (b.z - L[2]) ** 2, q = L[3] / (1 + dd / 16);
        if (q < .03 || !pj(L[0], L[1], L[2])) continue;
        const lx = PX, ly = PY, dl = Math.hypot(lx - X, ly - Y) || 1, gx = X + (lx - X) / dl * R0 * .7, gy = Y + (ly - Y) / dl * R0 * .7;
        const gg = c.createRadialGradient(gx, gy, 0, gx, gy, R0 * 1.4); gg.addColorStop(0, rgb([L[4], L[5] * .8, L[6] * .6], Math.min(.85, q * .9) * (1 - fz))); gg.addColorStop(1, rgb([L[4], L[5], L[6]], 0));
        c.fillStyle = gg; c.fillRect(X - R0 * 1.3, Y - R0, R0 * 2.6, R0 * 2);
      }
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = rgb(lerp(L0, [0, 0, 0], .5), .55); c.lineWidth = Math.max(.6, R0 * .012); c.beginPath(); c.moveTo(X - R0 * .25 + b.k * R0 * .2, Y - R0 * .7); c.quadraticCurveTo(X + R0 * (b.k - .5) * .5, Y - R0 * .1, X + R0 * (.05 + b.k * .25), Y + R0 * .48); c.stroke();
      c.restore();
      c.strokeStyle = rgb(lerp(L1, [220, 226, 240], .3), .22 * (1 - fz)); c.lineWidth = Math.max(.7, R0 * .02);
      c.beginPath(); for (let j = 0; j <= 10; j++) { const a = Math.PI * 1.08 + j / 10 * Math.PI * .62, q = b.pts[Math.round((((a - b.k) / TAU) % 1 + 1) % 1 * b.pts.length) % b.pts.length]; const xx = X + Math.cos(a) * R0 * q * 1.12, yy = Y + Math.sin(a) * R0 * q * .84; j ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
    }
    PZ = ZZ;
  };

  if (!B) {
    // ----- Mecca: lamps scattered down its valley, a low warm haze over the houses -----
    c.globalCompositeOperation = 'lighter';
    const cityA = 1 - dawn * .9;
    if (pj(VX(3800), 60, 3800)) { const fz = fogOf(PZ), rx = F * 1200 / PZ, ry = F * 160 / PZ; c.save(); c.translate(PX, PY); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(255,170,96,${(.12 * (1 - fz * .4) * cityA).toFixed(3)})`); g.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = g; c.fillRect(-rx, -rx, rx * 2, rx * 2); c.restore(); }
    for (const [x, y, z, k, ph] of st.city) {
      if (!pj(x, y, z) || PX < 0 || PX > W || PY < 0 || PY > H) continue;
      const a = cityA * (.3 + .7 * k) * (1 - fogOf(PZ) * .45) * (.85 + .15 * Math.sin(t * 3 + ph));
      const s = Math.max(1.4, Math.min(5, F * 10 / PZ)) * (.7 + k * .8);
      c.globalAlpha = a * .45; c.drawImage(st.lamp, PX - s * 2, PY - s * 2, s * 4, s * 4);
      c.globalAlpha = a * .9; c.fillStyle = '#ffd6a0'; c.fillRect(PX - .55, PY - .55, 1.1, 1.1);
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    // ----- the way up: a faint worn line on the slope, laid as a ground strip -----
    for (let s = 0; s < TP.len - 3; s += 1.5) {
      const a = along(TP, s), b2 = along(TP, s + 1.5), dx = b2[0] - a[0], dz = b2[1] - a[1], dl = Math.hypot(dx, dz) || 1, nx = -dz / dl * .55, nz = dx / dl * .55;
      const q = [[a[0] - nx, a[1] - nz], [a[0] + nx, a[1] + nz], [b2[0] + nx, b2[1] + nz], [b2[0] - nx, b2[1] - nz]].map(([x, z]) => (pj(x, hA(x, z) + .04, z) && PZ > 1.5 ? [PX, PY, PZ] : null));
      if (q.some((v) => !v)) continue;
      c.fillStyle = rgb(lerp([150, 144, 140], fogC, fogOf(q[0][2]) * .8), .11 * c01(q[0][2] / 25)); c.beginPath(); q.forEach(([X, Y], j) => (j ? c.lineTo(X, Y) : c.moveTo(X, Y))); c.closePath(); c.fill();
    }
    // gravel and grit on the granite near the camera
    c.fillStyle = rgb(lerp(rockDarkOf(), [0, 0, 0], .2), .3); c.beginPath();
    st.grit.forEach(([x, z, r]) => { if (!pj(x, hA(x, z), z) || PZ > 90 || PZ < 2) return; const s = r * F / PZ; if (s < .6) return; c.moveTo(PX + s, PY); c.ellipse(PX, PY, s, s * .5, 0, 0, TAU); });
    c.fill();
    // ----- boulders, the cave, the people: far to near -----
    st.rocks.forEach((b) => { if (pj(b.x, b.y, b.z) && PZ < 700) items.push([PZ, () => shadeRock(b)]); });
    const caveSeen = E2 > -1.5;
    if (pj(0, HC + 1, -.5)) {
      const cz = PZ;
      items.push([cz + 3, () => st.back.forEach((b) => shadeRock(b, .08))]);
      if (caveSeen) items.push([cz + .5, () => {
        // the dark of the mouth; the disc lights its floor a little
        const pts = MOUTH.map(([u, v]) => (pj(u, HC + v, -.3) ? [PX, PY] : null)); if (pts.some((q) => !q)) return;
        const ys = pts.map((q) => q[1]), xs = pts.map((q) => q[0]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = Math.max(...ys), rr = Math.max(...xs) - Math.min(...xs);
        c.beginPath(); pts.forEach(([a, b2], j) => (j ? c.lineTo(a, b2) : c.moveTo(a, b2))); c.closePath();
        const g = c.createRadialGradient(mx, my, 0, mx, my, rr * .9); g.addColorStop(0, rgb(discOn ? [46, 34, 26] : [14, 13, 16])); g.addColorStop(1, rgb([4, 4, 7])); c.fillStyle = g; c.fill();
      }]);
    }
    // the two: walking up (shot 1), seated inside the mouth (shot 2)
    const seated = caveShot, tw = (s) => s / 1.4; // phase from the distance walked: scrolling back walks them back
    const fP = seated ? stand(SEAT.pro[0], HC, SEAT.pro[1], 1.85) : stand(pro[0], hA(pro[0], pro[1]), pro[1], 1.85);
    if (fP) items.push([fP.z - (seated ? 0 : .2), () => Holy.draw(c, { who: 'prophet', pose: seated ? 'sit' : wu > 0 && wu < 1 ? 'walk' : 'stand', phase: tw(sPro), x: fP.x, y: fP.y, h: fP.h, t, amb: .25 })]);
    const fC = seated ? stand(SEAT.com[0], HC, SEAT.com[1], 1.78) : stand(com[0], hA(com[0], com[1]), com[1], 1.78);
    if (fC) items.push([fC.z - (seated ? 0 : .2), () => {
      const sv = fC.h / 1.78, s = fC.s, mv = wu > 0 && wu < 1 && !seated, sw = mv ? Math.sin(tw(sCom) * TAU) * .05 : Math.sin(t * .9) * .01;
      poly(c, seated ? SITS : MANF, fC.x, fC.y - (mv ? Math.abs(Math.sin(tw(sCom) * TAU)) * .03 * sv : 0), s, sv, 1, sw);
      const toward = fP && fP.x < fC.x ? -1 : 1, g = c.createLinearGradient(fC.x - toward * s * .45, 0, fC.x + toward * s * .45, 0), warm = seated ? .55 : .25;
      g.addColorStop(0, rgb([18, 17, 22])); g.addColorStop(.55, rgb([34, 31, 36])); g.addColorStop(1, rgb(lerp([30, 27, 30], [110, 80, 50], warm)));
      c.fillStyle = g; c.fill();
    }]);
    if (caveSeen) items.push([(pj(0, HC + 1, -.1) ? PZ : 9e9) - 1.2, () => st.front.forEach((b) => shadeRock(b))]);
    // the spider's web across the mouth: before the two inside, behind the boulders that frame it
    const wk = caveShot ? seg(p, WEBK[0], WEBK[1]) : 0;
    if (caveSeen && wk > 0 && pj(WHUB[0], HC + WHUB[1], WEBZ)) items.push([PZ - .05, () => {
      const W8 = st.web, s = F / PZ, kr = c01(wk / .3), ks = c01((wk - .3) / .7);
      const P = (q) => (pj(q[0], HC + q[1], WEBZ) ? [PX, PY] : null), hub = P(WHUB); if (!hub) return;
      // torchlight on the threads: the nearer and brighter the torches, the warmer the web
      let warm = 0; torches.forEach((L) => { warm += L[3] * .9 / (1 + ((L[0] - WHUB[0]) ** 2 + (L[1] - HC - WHUB[1]) ** 2 + (L[2] - WEBZ) ** 2) / 18); });
      warm = Math.min(1, warm);
      const path = () => {
        c.beginPath();
        W8.order.forEach((i, n) => { const g = c01(kr * W8.rad.length - n); if (g <= 0) return; const a = P(W8.rad[i]); if (!a) return; c.moveTo(hub[0], hub[1]); c.lineTo(mix(hub[0], a[0], g), mix(hub[1], a[1], g)); });
        if (ks > 0) {
          const n = ks * (W8.spiral.length - 1), m = n | 0;
          let q = P(W8.spiral[0]); if (q) c.moveTo(q[0], q[1]);
          for (let j = 1; j <= m; j++) { q = P(W8.spiral[j]); if (q) c.lineTo(q[0], q[1]); }
          const a = P(W8.spiral[m]), b = P(W8.spiral[Math.min(m + 1, W8.spiral.length - 1)]);
          if (a && b) c.lineTo(mix(a[0], b[0], n - m), mix(a[1], b[1], n - m));
        }
      };
      path(); c.lineWidth = Math.max(1, s * .006); c.lineJoin = 'round';
      c.strokeStyle = rgb(lerp([196, 206, 228], [255, 236, 210], dawn), .2 + .14 * dawn); c.stroke(); // the night's silver, paler at first light
      if (warm > .02) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgb([255, 190, 120], .5 * warm * (.88 + .12 * Math.sin(t * 11))); c.stroke(); }
      // glints where the flame catches a thread
      if (warm > .02 || dawn > .05) {
        c.globalCompositeOperation = 'lighter'; c.fillStyle = rgb([255, 222, 170], 1);
        W8.glint.forEach(([j, ph]) => { if (j > ks * W8.spiral.length) return; const q = P(W8.spiral[j]); if (!q) return; const a = Math.max(warm, dawn * .5) * (.5 + .5 * Math.sin(t * 2.3 + ph * 3)) ** 3; if (a < .03) return; const r = Math.max(1, s * .012); c.globalAlpha = a; c.drawImage(st.lamp, q[0] - r * 3, q[1] - r * 3, r * 6, r * 6); });
        c.globalAlpha = 1;
      }
      c.globalCompositeOperation = 'source-over';
      // the spider: at the end of its thread while it spins, at the hub after
      const sp = wk < 1 ? (ks > 0 ? P(W8.spiral[Math.min(W8.spiral.length - 1, Math.round(ks * (W8.spiral.length - 1)))]) : hub) : hub;
      if (sp) { c.fillStyle = 'rgba(14,10,8,.9)'; c.beginPath(); c.arc(sp[0], sp[1], Math.max(1.2, s * .014), 0, TAU); c.fill(); }
      c.lineJoin = 'miter';
    }]);
    // the pursuers: faceless shapes, the torches held high
    hunt.forEach((h) => {
      const f = stand(h.x, h.y, h.z, 1.76); if (!f) return;
      items.push([f.z, () => {
        const sv = f.h / 1.76, s = f.s, dir = h.back ? -1 : 1, alt = (h.ph * 2 | 0) & 1, fz = fogOf(f.z);
        poly(c, alt ? MAN2 : MAN, f.x, f.y - (h.moving ? Math.abs(Math.sin(h.ph * 3)) * .04 * sv : 0), s, sv, dir, h.moving ? .06 * Math.sin(h.ph * 3) : 0);
        c.fillStyle = rgb(lerp([16, 12, 12], fogC, fz * .7)); c.fill();
        if (!h.o.torch) return;
        c.strokeStyle = 'rgba(255,160,80,.5)'; c.lineWidth = Math.max(.7, f.h * .012); c.stroke();
        const tx = f.x + .3 * s * dir, ty = f.y - 2.05 * sv;
        c.strokeStyle = 'rgba(40,26,18,.95)'; c.lineWidth = Math.max(.8, s * .05); c.beginPath(); c.moveTo(f.x + .18 * s * dir, f.y - 1.2 * sv); c.lineTo(tx, ty); c.stroke();
        c.globalCompositeOperation = 'lighter';
        const q = Math.max(4, s * .8) * h.fl; c.globalAlpha = .95; c.drawImage(st.fire, tx - q, ty - q * 1.25, q * 2, q * 2.2);
        const q2 = Math.max(14, s * 6); c.globalAlpha = .3 * h.fl; c.drawImage(st.fire, tx - q2, ty - q2, q2 * 2, q2 * 2);
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }]);
    });
  } else {
    // ----- world B: the road as a ground strip, stones, palms, the two walking north -----
    // the road: a trodden track, two widths laid as single ground paths, paler in the middle
    [[2.3, .06], [1.6, .07], [1, .08], [.45, .06]].forEach(([hw, a]) => {
      const L = [], Rr = [];
      for (let z = E2 + 1.5; z < 1500; z += z - E2 < 60 ? 1.5 : z - E2 < 300 ? 5 : 14) {
        const w = hw * (1 + .18 * Math.sin(z * .37) * Math.sin(z * .13)), xr = RX(z);
        if (pj(xr - w, hB(xr - w, z) + .02, z)) L.push([PX, PY]); if (pj(xr + w, hB(xr + w, z) + .02, z)) Rr.push([PX, PY]);
      }
      if (L.length < 2 || Rr.length < 2) return;
      const g = c.createLinearGradient(0, H, 0, yH); g.addColorStop(0, rgb(lerp([228, 200, 160], sunC, .15), a)); g.addColorStop(.85, rgb(lerp([228, 200, 160], fogC, .5), a * .8)); g.addColorStop(1, rgb(fogC, 0));
      c.fillStyle = g; c.beginPath(); L.forEach(([X, Y], i) => (i ? c.lineTo(X, Y) : c.moveTo(X, Y))); for (let i = Rr.length - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath(); c.fill();
    });
    const sunSide = Math.sign(sun[0] * r0 + sun[2] * r2) || 1;
    c.fillStyle = rgb([70, 52, 40], .45); c.beginPath();
    st.stones.forEach(([x, z, r]) => { if (!pj(x, hB(x, z), z) || PZ > 260 || PZ < 4) return; const s = r * F / PZ; if (s < .5) return; c.moveTo(PX + s, PY); c.ellipse(PX, PY, s, s * .45, 0, 0, TAU); c.moveTo(PX - sunSide * s * 1.6 + s * 2.4, PY + s * .2); c.ellipse(PX - sunSide * s * 1.6, PY + s * .2, s * 2.4, s * .22, 0, 0, TAU); });
    c.fill();
    // the gardens under the palms: a low dark band of green
    if (pj(GROVE[0], hB(GROVE[0], GROVE[1]), GROVE[1])) {
      const gx = PX, gy = PY, zc = PZ, rw = 470 * F / zc, rh = Math.max(3, 2.6 * F / zc), fz = fogOf(zc) * .8;
      items.push([zc + 400, () => { c.save(); c.translate(gx, gy); c.scale(1, rh / rw); const g = c.createRadialGradient(0, 0, 0, 0, 0, rw); g.addColorStop(0, rgb(lerp([30, 44, 26], fogC, fz), .9)); g.addColorStop(.75, rgb(lerp([36, 48, 28], fogC, fz), .6)); g.addColorStop(1, rgb(fogC, 0)); c.fillStyle = g; c.fillRect(-rw, -rw, rw * 2, rw * 2); c.restore(); }]);
    }
    st.palms.forEach(([x, z, ht, ph, lean]) => {
      if (!pj(x, hB(x, z), z)) return; const bx = PX, by0 = PY, zc = PZ, s = F / zc;
      if (bx < -ht * s || bx > W + ht * s) return;
      items.push([zc, () => {
        const fz = fogOf(zc) * .85, trunk = lerp([52, 38, 28], fogC, fz), frond = lerp([40, 56, 30], fogC, fz * .9), lit = lerp(lerp(sunC, [210, 200, 120], .3), fogC, fz * .8);
        const tx = bx + lean * ht * s, ty = by0 - ht * s;
        c.strokeStyle = rgb(trunk); c.lineWidth = Math.max(.8, .38 * s); c.beginPath(); c.moveTo(bx, by0); c.quadraticCurveTo(bx + lean * ht * s * .2, by0 - ht * s * .6, tx, ty); c.stroke();
        const n = 13, L = 4.4 * s;
        for (let j = 0; j < n; j++) {
          const a = j / n * TAU + ph, cs = Math.cos(a), dn = .25 + .6 * (.5 + .5 * Math.sin(a)), sway = Math.sin(t * .8 + j) * s * .05;
          const ex2 = tx + cs * L * 1.15, ey2 = ty + L * (dn * .95 - .2) + sway;
          c.strokeStyle = rgb(cs * sunSide > .25 ? lerp(frond, lit, .45) : frond); c.lineWidth = Math.max(.8, .34 * s);
          c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + cs * L * .62, ty - L * .42, ex2, ey2); c.stroke();
        }
      }]);
    });
    const go = smooth(seg(p, .8, 1.05)), sP = mix(4, 32, go), sC = sP - 2.2;
    [[[RX(sP) - .55, sP], 'pro'], [[RX(sC) + .75, sC], 'com']].forEach(([[x, z], who]) => {
      const f = stand(x, hB(x, z), z, who === 'pro' ? 1.85 : 1.78); if (!f) return;
      items.push([f.z, () => {
        // the long morning shadow, away from the sun
        const L = 1.8 / Math.max(.09, sun[1]);
        if (pj(x - sun[0] * L, hB(x, z), z - sun[2] * L)) { const w2 = Math.max(1, f.s * .22), g = c.createLinearGradient(f.x, f.y, PX, PY); g.addColorStop(0, 'rgba(60,40,30,.32)'); g.addColorStop(1, 'rgba(60,40,30,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(f.x, f.y - w2); c.lineTo(PX, PY - w2 * .2); c.lineTo(PX, PY + w2 * .2); c.lineTo(f.x, f.y + w2); c.closePath(); c.fill(); }
        if (who === 'pro') Holy.draw(c, { who: 'prophet', pose: go > 0 && go < 1 ? 'walk' : 'stand', phase: sP / 1.4, x: f.x, y: f.y, h: f.h, t, amb: mix(.5, .92, smooth(seg(p, .8, .95))) });
        else {
          const sv = f.h / 1.78, mv = go > 0 && go < 1, sw = mv ? Math.sin(sC / 1.4 * TAU) * .05 : 0;
          poly(c, MANF, f.x, f.y, f.s, sv, 1, sw);
          const g = c.createLinearGradient(f.x - f.s * .4, 0, f.x + f.s * .4, 0); g.addColorStop(0, rgb([42, 34, 30])); g.addColorStop(.65, rgb([70, 58, 48])); g.addColorStop(1, rgb(lerp([92, 74, 58], sunC, .3)));
          c.fillStyle = g; c.fill();
        }
      }]);
    });
  }
  items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());

  // ----- motes in the low sun; a vignette -----
  if (B) {
    c.globalCompositeOperation = 'lighter'; c.fillStyle = rgb(lerp(sunC, [255, 240, 210], .4), .32);
    c.beginPath();
    for (let i = 0; i < 90; i++) { const x = (((i * 7919) % 1000) / 1000 - .5) * 60 + E0, z = E2 + 6 + ((i * 3571) % 1000) / 1000 * 60, y = hB(x, z) + .3 + ((i * 131) % 100) / 100 * 3 + Math.sin(t * .4 + i) * .2; if (!pj(x, y, z)) continue; const s = Math.max(.5, Math.min(1.8, F / PZ * .03)); c.rect(PX, PY, s, s); }
    c.fill(); c.globalCompositeOperation = 'source-over';
  }
  const vg = c.createRadialGradient(W * .45, H * .55, Math.min(W, H) * .3, W * .45, H * .55, Math.hypot(W, H) * .62);
  vg.addColorStop(0, 'rgba(4,5,10,0)'); vg.addColorStop(1, `rgba(4,5,10,${(.55 - .3 * dawn).toFixed(3)})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}

S.ghar = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.alt = mk(1, 1); st.ac = st.alt.getContext('2d');
    const R = rng(4170);
    st.fire = sprite([[0, 'rgba(255,224,170,1)'], [.22, 'rgba(255,160,70,.6)'], [.55, 'rgba(225,95,32,.16)'], [1, 'rgba(200,70,20,0)']], 96);
    st.pale = sprite([[0, 'rgba(255,246,222,1)'], [.2, 'rgba(255,236,196,.5)'], [.55, 'rgba(240,214,160,.12)'], [1, 'rgba(240,214,160,0)']], 96);
    st.lamp = sprite([[0, 'rgba(255,214,150,1)'], [.3, 'rgba(255,170,90,.35)'], [1, 'rgba(255,150,70,0)']], 32);
    st.NS = 72; st.NK = 88;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1));
    st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.stars = Array.from({ length: 3200 }, () => { const az = R() * TAU, el = Math.asin(R() * .98), m = .22 + R() ** 3 * 1.7; return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el), m, R() * 9]; });
    // the Milky Way: a great circle tilted across the sky, some clumps brighter
    st.milky = Array.from({ length: 70 }, (_, i) => { const a = i / 70 * TAU, v = [Math.cos(a), Math.sin(a) * .62, Math.sin(a) * .78 + .12]; return [...norm(v), .4 + R() * .9 * (.5 + .5 * Math.sin(a * 3))]; }).filter((m) => m[1] > -.05);
    // Mecca's lamps down its valley
    st.city = [];
    // Mecca's lamps: a sparse scatter in quarters down the winding valley and up its side ravines, thickest by the Haram
    const Q = [[3900, 0, 260, 90], [3550, -1, 220, 60], [4300, 1, 240, 60], [3200, 0, 200, 40], [4700, -1, 200, 40], [3700, 2.4, 160, 26], [4100, -2.6, 150, 24], [5050, 0, 180, 26]];
    Q.forEach(([zq, side, rad, n]) => { for (let i = 0; i < n; i++) { const z = zq + (R() + R() - 1) * rad * 1.6, x = VX(z) + side * 300 + (R() + R() - 1) * rad * (side ? .5 : 1.1); st.city.push([x, hA(x, z) + 3, z, R() ** 2.4, R() * 9]); } });
    // granite boulders over the north face, kept off the way and away from where the camera walks
    const eyes = []; for (let p = -.06; p < .3; p += .003) { const q = proAt(p), e = camOf(SHOTS[0], p, q); eyes.push([e[0], e[2], q[0], q[1]]); }
    const toSeg = (x, z, [ax, az, bx, bz]) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, u = c01(((x - ax) * dx + (z - az) * dz) / L); return Math.hypot(x - ax - dx * u, z - az - dz * u); };
    st.rocks = [];
    for (let i = 0; i < 520 && st.rocks.length < 330; i++) {
      let x, z;
      if (i < 300) { const q = along(TP, R() * TP.len); x = q[0] + (R() - .5) * 70; z = q[1] + (R() - .5) * 40; } else { x = (R() - .5) * 460; z = -30 + R() * 420; }
      if (Math.hypot(x, z - 1) < 13 || z < -4) continue;
      let near = 1e9; for (let s = 0; s < TP.len; s += 3) { const q = along(TP, s); near = Math.min(near, Math.hypot(q[0] - x, q[1] - z)); }
      let nearE = 1e9; eyes.forEach((q) => { nearE = Math.min(nearE, toSeg(x, z, q) + 2.5); }); // off the line from the camera to the two
      const r = .4 + R() ** 2.2 * 2.6;
      if (near < 3 + r || nearE < 5 + r) continue;
      st.rocks.push({ x, z, r, y: hA(x, z) + r * .45, pts: Array.from({ length: 10 }, () => .8 + R() * .32), k: R() * TAU });
    }
    st.grit = []; for (let i = 0; i < 1400; i++) { const a = R() * TAU, rr = 3 + R() ** 1.5 * 60, x = Math.cos(a) * rr, z = 2 + Math.abs(Math.sin(a)) * rr * .9; st.grit.push([x, z, .03 + R() ** 4 * .16]); }
    // rubble round the foot of the heap, so it sits in the mountain and not on it
    for (let i = 0; i < 26; i++) { const x = (R() - .5) * 22, z = -9 + R() * 12, r = .3 + R() ** 1.5 * .9; if (Math.abs(x) < 2.6 && z > -1.5) continue; st.rocks.push({ x, z, r, y: hA(x, z) + r * .4, pts: Array.from({ length: 10 }, () => .8 + R() * .32), k: R() * TAU }); }
    const bl = (b) => ({ x: b[0], y: HC + b[1], z: b[2], r: b[3], pts: Array.from({ length: 11 }, () => .84 + R() * .24), k: R() * TAU });
    st.back = BACK.map(bl); st.front = FRONT.map(bl);
    st.web = webOf(rng(276));
    // world B: the palms of the oasis, a few singles nearer along the road; stones on the sand
    st.palms = [];
    for (let i = 0; i < 300; i++) {
      const a = R() * TAU, rr = Math.sqrt(R()), x = GROVE[0] + Math.cos(a) * rr * 420 + (R() - .5) * 40, z = GROVE[1] + Math.sin(a) * rr * 280;
      if (Math.abs(x - RX(z)) < 5) continue;
      st.palms.push([x, z, 9 + R() * 7, R() * 9, (R() - .5) * .22]);
    }
    [[300, 1], [360, -1], [430, 1.4], [470, -1.2]].forEach(([z, sd]) => st.palms.push([RX(z) + sd * (12 + R() * 14), z, 10 + R() * 5, R() * 9, (R() - .5) * .2]));
    st.palms.sort((a, b) => b[1] - a[1]);
    st.stones = Array.from({ length: 900 }, () => { const z = -30 + R() ** 1.4 * 520, x = RX(z) + (R() - .5) * 140; return [x, z, .08 + R() ** 3 * .45, R()]; }).filter(([x, z]) => Math.abs(x - RX(z)) > 2.4);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    const on = SHOTS.filter((s) => p >= s.a && p <= s.b);
    if (!on.length) on.push(p < 0 ? SHOTS[0] : SHOTS[2]);
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    render(c, W, H, st, on[0], p, t, phone);
    if (on.length > 1) { // a dissolve: the next shot drawn apart and laid over at a share that follows p
      const a = st.alt, g = st.ac;
      if (a.width !== cv.width || a.height !== cv.height) { a.width = cv.width; a.height = cv.height; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      render(g, W, H, st, on[1], p, t, phone);
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = smooth(seg(p, on[1].a, on[0].b)); c.drawImage(a, 0, 0); c.globalAlpha = 1;
    }
  },
};
})();
