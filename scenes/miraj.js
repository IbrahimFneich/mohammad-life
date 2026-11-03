(() => {
// miraj: the Night Journey and the Ascension, by scroll. Five shots joined by dissolves that follow p:
//   H  night over al-Masjid al-Haram: the Kaaba, the Prophet standing near it; the camera cranes up into cloud;
//   M  the Isra: a night map of Arabia and Sham seen from high above (a textured ground plane, north up); a line of
//      light draws itself from Mecca north to Bayt al-Maqdis; the two ends are labelled;
//   Q  the hill of al-Aqsa at night: bare rock and olive trees, the sacred rock in a soft glow, no building;
//      the camera looks up and rises;
//   S  the Mi'raj: seven heavens as seven vast planes of light, each its own colour and texture, passed one by one;
//   T  above the seventh: the lote tree of the boundary, a vast tree of light; then pure light.
// The Prophet is drawn only with Holy.draw (veil, gold disc). No angel, prophet or mount is drawn: light only.
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const cr1 = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
const crv = (P, u) => { const n = P.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(u))), f = u - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)]; return b.map((_, j) => cr1(a[j], b[j], c[j], d[j], f)); };
const camKey = (K, p) => { let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++; return crv(K.map((k) => k.slice(1)), i + smooth(c01((p - K[i][0]) / (K[i + 1][0] - K[i][0])))); };
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 64) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const D2R = Math.PI / 180;
const ridged = (a, b) => 1 - Math.abs(Math.sin(a + Math.sin(b * .73) * 1.3) * Math.cos(b + Math.sin(a * .61) * 1.1));
// value noise; with a period P (cells) it tiles
const NZ = (() => { const r = rng(9001), a = new Float32Array(65536); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();
const vn = (x, y, P = 256) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const i0 = ((xi % P) + P) % P, j0 = ((yi % P) + P) % P, i1 = (i0 + 1) % P, j1 = (j0 + 1) % P;
  const r0 = (j0 & 255) * 256, r1 = (j1 & 255) * 256, a = NZ[r0 + (i0 & 255)], b = NZ[r0 + (i1 & 255)], c = NZ[r1 + (i0 & 255)], d = NZ[r1 + (i1 & 255)];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x, y, P = 256, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vn(x * f, y * f, P * f); f *= 2; a *= .5; } return s / (1 - .5 ** o); };

// ---------- the timeline: shots and their spans (overlaps dissolve) ----------
const SH = { H: [-.06, .205], M: [.185, .44], Q: [.415, .53], S: [.505, .82], T: [.79, 1.06] };
const PLANE_P = [.535, .575, .615, .655, .695, .735, .775]; // p at which each heaven is passed
const HEAVEN = ['السماء الأولى', 'السماء الثانية', 'السماء الثالثة', 'السماء الرابعة', 'السماء الخامسة', 'السماء السادسة', 'السماء السابعة'];
// each heaven: its air (the haze between the planes) and its flash colour when it is passed
const AIR = [[44, 30, 96], [16, 84, 82], [112, 130, 176], [22, 104, 70], [176, 84, 70], [50, 100, 196], [255, 206, 136]];

// ---------- a pinhole camera: eye, yaw, pitch ----------
function camera(W, H, phone, eye, yaw, pitch, fmul = 1) {
  const yw = yaw * D2R, pt = pitch * D2R, cp = Math.cos(pt), sp = Math.sin(pt);
  const fw = [Math.sin(yw) * cp, sp, Math.cos(yw) * cp], rt = [Math.cos(yw), 0, -Math.sin(yw)], up = cross(fw, rt);
  const F = (phone ? W * 1.15 : Math.min(H * 1.3, W * .98)) * fmul, cx = phone ? W / 2 : W * .44, cy = H * (phone ? .64 : .52);
  const V = { E: eye, fw, rt, up, F, cx, cy, pt, cp, sp, yw, X: 0, Y: 0, Z: 0 };
  V.pj = (x, y, z) => { const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], zc = dx * fw[0] + dy * fw[1] + dz * fw[2]; if (zc < .3) return false; const iz = F / zc; V.X = cx + (dx * rt[0] + dz * rt[2]) * iz; V.Y = cy - (dx * up[0] + dy * up[1] + dz * up[2]) * iz; V.Z = zc; return true; };
  V.dir = (v) => { const zc = v[0] * fw[0] + v[1] * fw[1] + v[2] * fw[2]; if (zc < .05) return false; V.X = cx + (v[0] * rt[0] + v[2] * rt[2]) * F / zc; V.Y = cy - (v[0] * up[0] + v[1] * up[1] + v[2] * up[2]) * F / zc; return true; };
  V.yAt = (e) => cy - F * Math.tan(Math.max(-1.5, Math.min(1.5, e - pt)));
  return V;
}

// ---------- the night sky: gradient by elevation, the Milky Way, stars ----------
function nightSky(c, W, H, V, st, t, sk, starA = 1) {
  const yH = V.yAt(0), yZ = Math.min(V.yAt(1.45), yH - 1), span = yH - yZ, at = (e) => c01((V.yAt(e) - yZ) / span);
  const g = c.createLinearGradient(0, yZ, 0, yH);
  g.addColorStop(0, rgb(sk[0])); g.addColorStop(at(.45), rgb(sk[0])); g.addColorStop(at(.14), rgb(sk[1])); g.addColorStop(at(.03), rgb(lerp(sk[1], sk[2], .7))); g.addColorStop(1, rgb(sk[2]));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (starA <= .01) return;
  c.globalCompositeOperation = 'lighter';
  st.milky.forEach(([x, y, z, s]) => { if (!V.dir([x, y, z])) return; const q = V.F * (.12 + .07 * s); c.globalAlpha = .12 * starA * c01(y * 4 + .15); c.drawImage(st.pale, V.X - q, V.Y - q * .55, q * 2, q * 1.1); });
  c.globalAlpha = 1;
  const bins = [[], [], [], [], [], []], sz = Math.max(1, H / 900);
  for (const s of st.stars) {
    if (!V.dir(s) || V.X < 0 || V.X > W || V.Y < 0 || V.Y > H) continue;
    const al = Math.min(1, s[3] * 1.3 * starA * (.7 + .3 * Math.sin(t * 1.3 + s[4] * 7)) * c01(s[1] * 5 + .05));
    if (al > .04) bins[Math.min(5, al * 6 | 0)].push(V.X, V.Y, s[3] > 1.25 ? 2 * sz : sz);
  }
  bins.forEach((b, k) => { if (!b.length) return; c.fillStyle = `rgba(236,232,218,${((k + .5) / 6).toFixed(3)})`; c.beginPath(); for (let i = 0; i < b.length; i += 3) c.rect(b[i], b[i + 1], b[i + 2], b[i + 2]); c.fill(); });
  c.globalCompositeOperation = 'source-over';
}

// ---------- land as depth bands (terrainRaster, core.js), lit by the night sky and point lights ----------
function land(c, W, H, V, st, hf, alb, L) {
  const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC, [E0, E1, E2] = V.E;
  const hfw = norm([V.fw[0], 0, V.fw[2]]), hr = [hfw[2], 0, -hfw[0]];
  const by = (H - V.cy) / V.F, dyb = V.sp - by * V.cp, dhb = V.cp + by * V.sp, gE = hf(E0, E2);
  const dMin = dyb < -.01 ? Math.max(.7, (E1 - gE) / -dyb * dhb * .45) : 2.5, dMax = L.dMax;
  const fogOf = (d) => Math.min(.95, 1 - Math.exp(-d / L.fogL));
  for (let i = 0; i < NS; i++) {
    const d = dMin * (dMax / dMin) ** (1 - i / (NS - 1)), zc0 = Math.max(.6, d * V.cp + Math.max(0, -V.sp) * (E1 + 40)), fogK = fogOf(d);
    for (let k = 0; k <= NK; k++) {
      const sx = -W * .1 + k * (W * 1.2 / NK), u = (sx - V.cx) / V.F * zc0;
      const x = E0 + hfw[0] * d + hr[0] * u, z = E2 + hfw[2] * d + hr[2] * u, h = hf(x, z), o = i * (NK + 1) + k;
      if (V.pj(x, h, z)) { TX[o] = V.X; TY[o] = Math.max(-H, Math.min(H * 3, V.Y)); } else { TX[o] = sx; TY[o] = H * 3; }
      if (k % 2) continue;
      const e = Math.max(.3, d * .004), hx = (hf(x + e, z) - h) / e, hz = (hf(x, z + e) - h) / e, nl = Math.hypot(hx, 1, hz), al = alb(x, z, h, hx, hz);
      const ln = Math.max(0, (-hx * L.dir[0] + L.dir[1] - hz * L.dir[2]) / nl) ** 1.3, sky = .5 + .5 / nl;
      let lr = L.amb[0] * sky * .7 + L.key[0] * ln, lg = L.amb[1] * sky * .7 + L.key[1] * ln, lb = L.amb[2] * sky * .7 + L.key[2] * ln;
      for (const P of L.pts) { const dd = (x - P[0]) ** 2 + (h - P[1]) ** 2 + (z - P[2]) ** 2, q = P[3] / (1 + dd / P[7]); if (q > .005) { lr += P[4] * q; lg += P[5] * q; lb += P[6] * q; } }
      const n = (i * NC + k / 2) * 3;
      TC[n] = mix(al[0] / 255 * lr, L.fog[0], fogK); TC[n + 1] = mix(al[1] / 255 * lg, L.fog[1], fogK); TC[n + 2] = mix(al[2] / 255 * lb, L.fog[2], fogK);
    }
  }
  terrainRaster(st, c, W, H, NS, NK, 2, TX, TY, TC, .14);
  return fogOf;
}
// a box with flat faces (a house, the Kaaba): the faces turned to the camera, shaded by their direction
function box(c, V, b, col, fog, fz) {
  const { x0, x1, z0, z1, y0, y1 } = b, [ex, , ez] = V.E;
  const faces = [];
  if (ez < z0) faces.push([[x0, z0], [x1, z0], .55]); if (ez > z1) faces.push([[x1, z1], [x0, z1], .42]);
  if (ex < x0) faces.push([[x0, z1], [x0, z0], .62]); if (ex > x1) faces.push([[x1, z0], [x1, z1], .36]);
  const pt = (x, y, z) => (V.pj(x, y, z) ? [V.X, V.Y] : null);
  for (const [[ax, az], [bx, bz], k] of faces) {
    const q = [pt(ax, y0, az), pt(bx, y0, bz), pt(bx, y1, bz), pt(ax, y1, az)]; if (q.some((v) => !v)) continue;
    c.fillStyle = rgb(lerp(col.map((v) => v * k), fog, fz)); c.beginPath(); q.forEach(([X, Y], i) => (i ? c.lineTo(X, Y) : c.moveTo(X, Y))); c.closePath(); c.fill();
    if (b.win && Math.abs(q[1][0] - q[0][0]) > 26) { // small dark windows high in the wall, a door at its foot
      c.fillStyle = rgb(lerp([14, 12, 14], fog, fz)); c.beginPath();
      b.win.forEach(([u, v, du, dv]) => { const p0 = pt(mix(ax, bx, u), mix(y0, y1, v), mix(az, bz, u)), p1 = pt(mix(ax, bx, u + du), mix(y0, y1, v + dv), mix(az, bz, u + du)); if (p0 && p1) c.rect(Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.abs(p1[0] - p0[0]), Math.abs(p1[1] - p0[1])); });
      c.fill();
    }
  }
  if (V.E[1] > y1) { const q = [pt(x0, y1, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x0, y1, z1)]; if (!q.some((v) => !v)) { c.fillStyle = rgb(lerp(col.map((v, j) => v * 1.02 + [4, 7, 16][j]), fog, fz)); c.beginPath(); q.forEach(([X, Y], i) => (i ? c.lineTo(X, Y) : c.moveTo(X, Y))); c.closePath(); c.fill(); } }
}

// ---------- H: the Haram at night. Metres: x east, y up, z north; the Kaaba at the origin ----------
const KA = { x0: -5.5, x1: 5.5, z0: -6, z1: 6, y0: 0, y1: 12 };
const hMecca = (x, z) => {
  const r = Math.hypot(x, z), aq = Math.hypot((x - 330) / 170, (z - 40) / 260); // Abu Qubays rises to the east
  let h = .4 * Math.sin(x * .03) * Math.sin(z * .027) + Math.max(0, r - 150) * .02;
  h += 165 * Math.exp(-(aq ** 2) * 1.1) * (.85 + .15 * ridged(x * .02, z * .02));
  const ring = smooth(c01((r - 380) / 500)); h += ring * (110 + 90 * ridged(x * .0045, z * .0041 + 1) + 30 * ridged(x * .014, z * .012));
  return h;
};
const albMecca = (x, z, h, hx, hz) => { const rock = c01(Math.hypot(hx, hz) * 1.3 - .15), r = Math.hypot(x, z), mat = smooth(c01((40 - r) / 8)); return lerp(lerp([112, 100, 84], lerp([84, 76, 70], [62, 58, 56], c01(.5 + .5 * Math.sin(x * .05 + z * .04))), rock), [140, 128, 108], mat); };
const CAMH = [[-.06, -27, 1.75, -30, 47, 2.5], [.04, -25, 1.75, -28, 46, 3], [.1, -24, 5, -27, 44, -3], [.16, -60, 60, -80, 40, -28], [.205, -90, 170, -150, 36, -44]];
function shotH(c, W, H, st, p, t, phone) {
  const [ex, ey, ez, yaw, pitch] = camKey(CAMH, p);
  const V = camera(W, H, phone, [ex - (phone ? 6 : 0), ey + hMecca(ex, ez), ez - (phone ? 8 : 0)], yaw - (phone ? 12 : 0), pitch);
  nightSky(c, W, H, V, st, t, [[4, 7, 18], [12, 18, 40], [40, 50, 82]]);
  const prophet = [-10.5, 0, -1.5];
  const L = { dir: norm([-.5, 1, .35]), amb: [40, 46, 78], key: [80, 90, 128], fog: [30, 38, 64], fogL: 2600, dMax: 6000, pts: [[prophet[0], 1.7, prophet[2], .5, 255, 214, 150, 12]] };
  st.lamps.forEach((l) => L.pts.length < 9 && Math.hypot(l[0] - ex, l[2] - ez) < 120 && L.pts.push([l[0], l[1], l[2], .55, 255, 170, 90, 30]));
  const fogOf = land(c, W, H, V, st, hMecca, albMecca, L);
  // the houses around the open ground, the Kaaba, the lamps: far to near
  const items = [];
  const wall = [74, 66, 58], dark = [26, 24, 26];
  st.houses.forEach((b) => { if (V.pj((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2) && V.Z < 900) { const z = V.Z; items.push([z, () => box(c, V, b, b.col, L.fog, fogOf(z) * .9)]); } });
  if (V.pj(0, 6, 0)) {
    const z = V.Z;
    items.push([z, () => {
      box(c, V, KA, [36, 34, 38], L.fog, fogOf(z) * .6);
      // a woven band near the top, faint in the dark
      const q = [[KA.x0, KA.z0], [KA.x1, KA.z0], [KA.x1, KA.z1], [KA.x0, KA.z1], [KA.x0, KA.z0]];
      c.strokeStyle = 'rgba(160,138,90,.35)'; c.lineWidth = Math.max(1, V.F / z * .35); c.beginPath();
      for (let i = 0; i < 4; i++) { const [ax, az] = q[i], [bx, bz] = q[i + 1], mx = (ax + bx) / 2, mz = (az + bz) / 2; if ((V.E[0] - mx) * mx + (V.E[2] - mz) * mz <= 0) continue; if (V.pj(ax, 9.2, az)) { const X = V.X, Y = V.Y; if (V.pj(bx, 9.2, bz)) { c.moveTo(X, Y); c.lineTo(V.X, V.Y); } } }
      c.stroke();
    }]);
  }
  // the Hijr: a low curved wall on the north-west side
  if (V.pj(0, .5, 9)) { const z = V.Z; items.push([z, () => { c.strokeStyle = rgb(lerp([120, 108, 92], L.fog, fogOf(z))); c.lineWidth = Math.max(1, V.F / z * .7); c.beginPath(); let first = true; for (let a = 0; a <= 20; a++) { const an = Math.PI * (a / 20), x = Math.cos(an) * 6.2, zz = 6.2 + Math.sin(an) * 7.5; if (V.pj(x, .55, zz)) { first ? c.moveTo(V.X, V.Y) : c.lineTo(V.X, V.Y); first = false; } } c.stroke(); }]); }
  // the Prophet: standing near the Kaaba, the disc glowing in the dark
  if (V.pj(prophet[0], 1.85, prophet[2])) {
    const hx = V.X, hy = V.Y;
    if (V.pj(prophet[0], 0, prophet[2])) { const z = V.Z, f = { x: V.X, y: V.Y, h: Math.max(4, Math.hypot(V.X - hx, V.Y - hy)) }; items.push([z - .1, () => Holy.draw(c, { who: 'prophet', pose: 'stand', x: f.x, y: f.y, h: f.h, t, amb: .25 })]); }
  }
  items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());
  // lamps in a few doorways and windows
  c.globalCompositeOperation = 'lighter';
  st.lamps.forEach(([x, y, z, k]) => { if (!V.pj(x, y, z)) return; const s = Math.max(2, Math.min(26, V.F * 1.6 / V.Z)); c.globalAlpha = (.5 + .5 * k) * (1 - fogOf(V.Z) * .6) * (.88 + .12 * Math.sin(t * 5 + k * 20)); c.drawImage(st.fire, V.X - s, V.Y - s, s * 2, s * 2); });
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}

// ---------- Q: the hill of Bayt al-Maqdis at night; bare rock, olives, the sacred rock in a soft glow ----------
const hQuds = (x, z) => {
  const hill = 34 * Math.exp(-((x / 120) ** 2 + (z / 150) ** 2)), olives = 70 * smooth(c01((x - 180) / 260)) * (.8 + .2 * ridged(x * .01, z * .012));
  const valley = -26 * Math.exp(-(((x - 150) / 45) ** 2)), far = smooth(c01((Math.hypot(x, z) - 500) / 900)) * (60 + 50 * ridged(x * .004, z * .004 + 2));
  return hill + Math.max(olives, 0) + valley + far + 1.4 * Math.sin(x * .07 + z * .05) * Math.sin(z * .09) + (ridged(x * .08, z * .08) - .5) * 1.4;
};
const albQuds = (x, z, h, hx, hz) => { const rock = c01(Math.hypot(hx, hz) * 1.2 - .1); return lerp([104, 98, 86], [62, 58, 56], rock * .5 + .5 * c01(.5 + .5 * Math.sin(x * .09 + z * .07) * Math.sin(z * .05 - x * .03) + .2)); };
const ROCK = [0, 0, 6];
const CAMQ = [[.415, -17, 4.5, -30, 30, -4], [.47, -13, 3.2, -22, 31, 1.5], [.505, -12, 3.6, -20, 30, 34], [.53, -11, 4, -19, 28, 58]];
function shotQ(c, W, H, st, p, t, phone) {
  const [ex, ey, ez, yaw, pitch] = camKey(CAMQ, p);
  const V = camera(W, H, phone, [ex - (phone ? 4 : 0), ey + hQuds(ex, ez) + (phone ? 1.5 : 0), ez - (phone ? 6 : 0)], yaw - (phone ? 12 : 0), pitch);
  nightSky(c, W, H, V, st, t, [[4, 7, 20], [12, 18, 42], [42, 52, 84]]);
  const glow = smooth(seg(p, .42, .47)), ry = hQuds(ROCK[0], ROCK[2]);
  const L = { dir: norm([-.5, 1, .35]), amb: [36, 42, 72], key: [60, 68, 100], fog: [28, 36, 62], fogL: 1600, dMax: 4000, pts: [[ROCK[0], ry + 2, ROCK[2], .9 * glow, 255, 214, 150, 50]] };
  const fogOf = land(c, W, H, V, st, hQuds, albQuds, L);
  const items = [];
  st.olives.forEach(([x, z, r, k]) => { const y = hQuds(x, z); if (!V.pj(x, y + r, z) || V.Z < 8) return; const X = V.X, Y = V.Y, Z = V.Z, R = r * V.F / Z; if (R < .8) return; items.push([Z, () => {
    const fz = fogOf(Z), q = Math.hypot(x - ROCK[0], z - ROCK[2]), warm = glow * c01(1 - q / 60);
    const col = lerp(lerp([26, 32, 30], [92, 84, 60], warm * .7), L.fog, fz), hi = lerp(lerp([52, 62, 60], [150, 130, 90], warm), L.fog, fz);
    c.strokeStyle = rgb(lerp([30, 26, 24], L.fog, fz)); c.lineWidth = Math.max(.7, R * .2); c.beginPath(); c.moveTo(X - R * .1, Y + R * .3); c.quadraticCurveTo(X + R * .25, Y + R * .9, X, Y + R * 1.25); c.stroke();
    for (let j = 0; j < 4; j++) { const a = j * 1.7 + k * 6, bx = X + Math.cos(a) * R * .55, byy = Y + Math.sin(a) * R * .22 - R * .05, rr = R * (.55 + .2 * Math.sin(j + k * 5)); c.fillStyle = rgb(j < 3 ? col : hi); c.beginPath(); c.ellipse(bx, byy - (j === 3 ? rr * .25 : 0), rr * 1.05, rr * .72, 0, 0, TAU); c.fill(); }
  }]); });
  // the sacred rock: a broad low outcrop of pale stone at the top of the hill, lit from within its own glow
  c.fillStyle = 'rgba(14,14,20,.45)'; c.beginPath();
  st.qgrit.forEach(([x, z, r]) => { if (!V.pj(x, hQuds(x, z), z) || V.Z > 70 || V.Z < 1.5) return; const s = r * V.F / V.Z; if (s < .6) return; c.moveTo(V.X + s, V.Y); c.ellipse(V.X, V.Y, s, s * .5, 0, 0, TAU); });
  c.fill();
  st.rock.forEach((b) => { const y = ry + b[3] * .35; if (!V.pj(ROCK[0] + b[0], y, ROCK[2] + b[1])) return; const X = V.X, Y = V.Y, Z = V.Z, R = b[2] * V.F / Z; items.push([Z, () => {
    const fz = fogOf(Z) * .5, lit = lerp(lerp([96, 92, 98], [236, 214, 170], glow * .6), L.fog, fz), dk = lerp(lerp([24, 24, 32], [86, 70, 56], glow * .5), L.fog, fz);
    const g = c.createLinearGradient(X, Y - R * .6, X, Y + R * .5); g.addColorStop(0, rgb(lit)); g.addColorStop(1, rgb(dk));
    c.fillStyle = g; c.beginPath(); for (let j = 0; j < 14; j++) { const a = j / 14 * TAU + b[4], rr = R * (.86 + .18 * Math.sin(j * 1.9 + b[4] * 3)), s = Math.sin(a); c.lineTo(X + Math.cos(a) * rr * 1.6, Y + s * rr * (s > 0 ? .3 : .34)); } c.closePath(); c.fill();
  }]); });
  items.sort((a, b) => b[0] - a[0]).forEach(([, f]) => f());
  // the glow over the rock, and a broad soft light going up from it into the sky
  if (glow > 0 && V.pj(ROCK[0], ry + 1.5, ROCK[2])) {
    const X = V.X, Y = V.Y, s = V.F / V.Z;
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = .5 * glow; c.drawImage(st.pale, X - s * 22, Y - s * 9, s * 44, s * 18);
    // a tall soft light over the rock, opening into the sky as the eye lifts
    const lift = smooth(seg(p, .47, .53)), q = s * 30 * (1 + 3 * lift);
    c.save(); c.translate(X, Y); c.scale(1, 3.2); const g = c.createRadialGradient(0, -q * .3, 0, 0, -q * .3, q); g.addColorStop(0, `rgba(255,236,196,${(.22 * glow).toFixed(3)})`); g.addColorStop(1, 'rgba(255,236,196,0)');
    c.globalAlpha = 1; c.fillStyle = g; c.fillRect(-q, -q * 1.3, q * 2, q * 2); c.restore();
    c.globalCompositeOperation = 'source-over';
  }
}

// ---------- a textured horizontal plane (the map, the heavens), drawn a few screen rows at a time ----------
// The camera's heading is fixed to the plane's v axis, so every screen row is one strip of the texture, stretched.
// u = (X - X0) / ts; v = vs * (Z - Z0) / ts. Rows beyond lmax are left to the haze.
function plane(c, W, H, dpr, V, A, pat, ts, X0, Z0, vs, lmax, y0 = 0, y1 = H, rs = 2) {
  const dy = A - V.E[1], { cp, sp, F, cx, cy } = V, Ex = V.E[0], Ez = V.E[2];
  const lam = (y) => { const v = (cy - y) / F, ry = sp + v * cp; return ry * dy > 0 ? dy / ry : -1; };
  const Zof = (y, l) => { const v = (cy - y) / F; return Ez + l * (cp - v * sp); };
  c.fillStyle = pat;
  for (let y = Math.max(0, y0); y < Math.min(H, y1); y += rs) {
    const la = lam(y), lb = lam(y + rs); if (la < 0 || lb < 0 || Math.min(la, lb) > lmax) continue;
    const lm = (la + lb) / 2, Va = vs * (Zof(y, la) - Z0) / ts, Vb = vs * (Zof(y + rs, lb) - Z0) / ts, dv = Vb - Va;
    if (Math.abs(dv) < 1e-6) continue;
    const k = F * ts / lm, e = cx + (X0 - Ex) * F / lm, d = rs / dv;
    c.setTransform(k * dpr, 0, 0, d * dpr, e * dpr, (y - Va * d) * dpr);
    const u0 = (-e) / k, u1 = (W - e) / k;
    c.fillRect(u0, Va, u1 - u0, dv);
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------- M: the night map. Kilometres, Mecca at the origin, x east, z north ----------
const KX = 99.6, KZ = 110.6, MLON = 39.826, MLAT = 21.423;
const geo = (lat, lon) => [(lon - MLON) * KX, (lat - MLAT) * KZ];
const JER = geo(31.778, 35.235);
const MAPBASE = [22, 28, 38];
const MAP = { lon0: 26, lon1: 47, lat0: 12, lat1: 37.5, ts: 2.6 }; // the texture's extent; 2.6 km per texture pixel
const COAST = {
  red: [[12, 43.4], [13, 43.2], [14, 42.95], [15, 42.75], [16, 42.75], [16.5, 42.8], [17.5, 42.3], [18.5, 41.6], [19.5, 41], [20, 40.6], [20.5, 40.2], [21, 39.6], [21.49, 39.17], [22, 39.05], [22.5, 39], [23, 38.8], [23.5, 38.5], [24, 38.1], [24.5, 37.6], [25, 37.2], [25.5, 36.9], [26, 36.6], [26.5, 36.3], [27, 35.8], [27.5, 35.5], [28, 35.2], [28.5, 34.85], [29, 34.82], [29.53, 35.0],
    [29.4, 34.88], [29, 34.68], [28.5, 34.5], [28, 34.4], [27.73, 34.25], [27.9, 33.9], [28.5, 33.3], [29, 32.95], [29.95, 32.55], [29.9, 32.45], [29, 32.65], [28.2, 33.2], [27.5, 33.7], [27, 33.95], [26, 34.3], [25, 34.9], [24, 35.5], [23, 35.65], [22, 36.8], [21, 37.15], [20, 37.25], [19, 37.4], [18, 38.2], [17, 38.9], [16, 39.3], [15, 39.8], [14, 40.6], [13, 41.6], [12, 42.5]],
  med: [[31.0, 26], [31.2, 28], [31.0, 29.2], [31.3, 29.8], [31.45, 30], [31.5, 30.6], [31.45, 31.2], [31.55, 31.9], [31.27, 32.3], [31.13, 32.6], [31.08, 33.1], [31.18, 33.6], [31.33, 34.2], [31.5, 34.47], [31.67, 34.57], [32.05, 34.75], [32.5, 34.9], [32.82, 34.98], [33.1, 35.12], [33.5, 35.4], [34, 35.65], [34.5, 35.9], [35, 35.9], [35.5, 35.85], [36, 35.95], [36.6, 36.1], [36.9, 35.8], [36.7, 35.0], [36.6, 34.2], [36.4, 33], [36.2, 32], [37.6, 31], [37.6, 26]],
  dead: [[31.76, 35.52], [31.6, 35.47], [31.4, 35.4], [31.2, 35.38], [31.05, 35.42], [31.12, 35.5], [31.4, 35.56], [31.62, 35.58]],
  gal: [[32.88, 35.57], [32.8, 35.52], [32.72, 35.57], [32.8, 35.65]],
};
// towns and oases: faint lamps on the map, not named (Mecca and Jerusalem are named by the labels)
const TOWNS = [[21.27, 40.42], [24.47, 39.61], [25.7, 39.29], [27.63, 38.55], [28.38, 36.57], [29.53, 35.01], [30.32, 35.44], [31.5, 34.47], [31.53, 35.1], [30.6, 32.3], [33.5, 36.3], [32.6, 36.1], [26.6, 37.9], [22.8, 39.2], [32.0, 35.8]];
function buildMap() {
  const { lon0, lon1, lat0, lat1, ts } = MAP;
  const Wt = Math.round((lon1 - lon0) * KX / ts), Ht = Math.round((lat1 - lat0) * KZ / ts);
  const cv = mk(Wt, Ht), g = cv.getContext('2d');
  const P = (lat, lon) => [(lon - lon0) * KX / ts, (lat1 - lat) * KZ / ts];
  // land and water masks
  g.fillStyle = '#fff'; g.fillRect(0, 0, Wt, Ht);
  g.fillStyle = '#000';
  ['red', 'med', 'dead', 'gal'].forEach((k) => { g.beginPath(); COAST[k].forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? g.lineTo(x, y) : g.moveTo(x, y); }); if (k === 'red') { g.lineTo(P(lat0 - 1, 42.5)[0], Ht + 2); g.lineTo(P(lat0 - 1, 43.4)[0], Ht + 2); } g.closePath(); g.fill(); });
  const mask = g.getImageData(0, 0, Wt, Ht).data;
  // a blurred copy of the mask for the shore glow
  const bl = mk(Wt, Ht), bg = bl.getContext('2d'); bg.filter = 'blur(3px)'; bg.drawImage(cv, 0, 0); const soft = bg.getImageData(0, 0, Wt, Ht).data;
  // relief: Hijaz and Sarawat along the coast, Sinai, Midian, the Judean hills, the rift, the plateau; lava fields; sand
  const coastLon = (lat) => { const r = COAST.red; for (let i = 0; i < 29; i++) if (lat >= r[i][0] && lat <= r[i + 1][0]) return mix(r[i][1], r[i + 1][1], (lat - r[i][0]) / (r[i + 1][0] - r[i][0])); return 35; };
  const hgt = new Float32Array(Wt * Ht), kind = new Float32Array(Wt * Ht * 2);
  for (let y = 0; y < Ht; y++) {
    const lat = lat1 - y * ts / KZ;
    const cl = coastLon(Math.min(29.5, Math.max(12.1, lat)));
    for (let x = 0; x < Wt; x++) {
      const lon = lon0 + x * ts / KX, i = y * Wt + x;
      const n1 = fbm(x * .026, y * .026, 256, 4), n2 = fbm(x * .09 + 9, y * .09, 256, 3);
      let h = n1 * .25;
      const d = lon - cl; h += Math.exp(-(((d - .75) / .55) ** 2)) * (.6 + .9 * n2) * mix(1.2, .9, smooth(c01((lat - 22) / 4))) * (1 - smooth(c01((lat - 29.2) / 1.2)));
      h += Math.exp(-(((lat - 28.6) / .55) ** 2 + ((lon - 33.9) / .45) ** 2)) * (1 + n2); // Sinai
      h += Math.exp(-(((lat - 31.7) / .9) ** 2 + ((lon - 35.15) / .18) ** 2)) * (.7 + .4 * n2); // the hills of al-Quds
      h += Math.exp(-(((lat - 30.8) / 1.6) ** 2 + ((lon - 35.75) / .3) ** 2)) * (.8 + .5 * n2); // Edom and Moab
      h -= Math.exp(-(((lon - 35.5 - (lat - 31) * .05) / .08) ** 2)) * .9 * smooth(c01((lat - 29.3) / .6)) * (1 - smooth(c01((lat - 32.6) / .8))); // the rift
      const lava = Math.max(Math.exp(-(((lat - 23.4) / .9) ** 2 + ((lon - 39.9) / .35) ** 2)), Math.exp(-(((lat - 25.9) / .5) ** 2 + ((lon - 40.1) / .45) ** 2)), Math.exp(-(((lat - 32.2) / .7) ** 2 + ((lon - 37.3) / .7) ** 2))) * c01((n2 - .3) * 3);
      const sand = Math.max(Math.exp(-(((lat - 28.4) / .9) ** 2 + ((lon - 41) / 1.3) ** 2)), Math.exp(-(((lat - 19) / 1.5) ** 2 + ((lon - 45) / 2) ** 2)) * .8);
      hgt[i] = h + sand * .012 * Math.sin(x * .35 + y * .12 + n2 * 9); kind[i * 2] = lava; kind[i * 2 + 1] = sand;
    }
  }
  const img = g.createImageData(Wt, Ht), D = img.data;
  for (let y = 0; y < Ht; y++) for (let x = 0; x < Wt; x++) {
    const i = y * Wt + x, o = i * 4, land = mask[o] / 255, sh = soft[o] / 255;
    const hx = (hgt[i + (x < Wt - 1 ? 1 : 0)] - hgt[i - (x > 0 ? 1 : 0)]), hy = (hgt[i + (y < Ht - 1 ? Wt : 0)] - hgt[i - (y > 0 ? Wt : 0)]);
    const lit = c01(.6 + (-hx * .7 + -hy * .9) * 12), h = hgt[i], lava = kind[i * 2], sand = kind[i * 2 + 1];
    let col = lerp([34, 44, 54], [64, 74, 84], c01(h * .7));
    col = lerp(col, [24, 24, 30], lava * .8); col = lerp(col, [86, 70, 62], sand * .6);
    col = col.map((v) => v * (.42 + .78 * lit));
    const nz = fbm(x * .15, y * .15, 256, 2);
    const sea = lerp([7, 14, 30], [12, 24, 46], nz * .6 + (1 - sh) * .0).map((v, j) => v + [26, 40, 58][j] * Math.max(0, sh - .02) * (1 - land) * 1.4);
    const edge = c01(Math.min(x, y, Wt - 1 - x, Ht - 1 - y) / 70), c3 = lerp(MAPBASE, lerp(sea, col, land), smooth(edge));
    D[o] = c3[0]; D[o + 1] = c3[1]; D[o + 2] = c3[2]; D[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // the shore: a fine pale line
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(90,110,130,.35)'; g.lineWidth = .8;
  ['red', 'med', 'dead'].forEach((k) => { g.beginPath(); COAST[k].forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); });
  g.globalCompositeOperation = 'source-over';
  return { cv, X0: (lon0 - MLON) * KX, Z0: (lat1 - MLAT) * KZ };
}
// the line of light: a gentle arc from Mecca bowing east of the straight line, to Bayt al-Maqdis
const ARC = (u) => { const [jx, jz] = JER, bx = 120, bz = 560; const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; return [b * bx + d * jx, b * bz + d * jz]; };
const CAMM = [[.185, 0, 760, -20, -88], [.24, -30, 820, -260, -64], [.29, -190, 960, -470, -50], [.36, -260, 1000, -150, -52], [.41, -440, 420, 930, -62], [.44, -457, 220, 1030, -66]];
function shotM(c, W, H, st, p, t, phone, dpr) {
  if (!st.map) st.map = buildMap();
  if (!st.mapPat) st.mapPat = c.createPattern(st.map.cv, 'no-repeat');
  const [ex, ey, ez, pitch] = camKey(CAMM, p);
  const V = camera(W, H, phone, [ex + (phone ? -60 : 0), ey, ez - (phone ? 120 : 0)], 0, pitch - (phone ? 13 : 0), 1);
  // the sky beyond the curve of the earth: deep night, a thin green airglow along the horizon, stars
  const yH = V.yAt(-.02);
  nightSky(c, W, H, V, st, t, [[3, 5, 14], [8, 12, 30], [24, 46, 58]], 1);
  c.fillStyle = rgb(MAPBASE); c.fillRect(0, Math.max(0, yH), W, H);
  plane(c, W, H, dpr, V, 0, st.mapPat, MAP.ts, st.map.X0, st.map.Z0, -1, 4200);
  // haze toward the horizon, and the airglow line
  if (yH < H) {
    const hz = c.createLinearGradient(0, yH, 0, Math.min(H, yH + H * .5)); hz.addColorStop(0, 'rgba(26,48,58,1)'); hz.addColorStop(.25, 'rgba(18,30,44,.6)'); hz.addColorStop(1, 'rgba(14,22,36,0)');
    c.fillStyle = hz; c.fillRect(0, yH - 2, W, H * .5 + 2);
    c.globalCompositeOperation = 'lighter'; const ag = c.createLinearGradient(0, yH - H * .05, 0, yH + 2); ag.addColorStop(0, 'rgba(60,160,120,0)'); ag.addColorStop(.8, 'rgba(70,170,130,.22)'); ag.addColorStop(1, 'rgba(90,190,150,0)'); c.fillStyle = ag; c.fillRect(0, yH - H * .05, W, H * .05 + 2); c.globalCompositeOperation = 'source-over';
  }
  // towns: faint lamps
  c.globalCompositeOperation = 'lighter';
  TOWNS.forEach(([la, lo], i) => { const [x, z] = geo(la, lo); if (!V.pj(x, 0, z)) return; const s = Math.max(2, Math.min(9, V.F * 4 / V.Z)); c.globalAlpha = .55 * (.85 + .15 * Math.sin(t * 2 + i)); c.drawImage(st.fire, V.X - s, V.Y - s, s * 2, s * 2); });
  c.globalAlpha = 1;
  // the line of light
  const run = smooth(seg(p, .265, .385)), N = 140;
  if (run > 0) {
    const pts = []; for (let i = 0; i <= N * run; i++) { const [x, z] = ARC(i / N); if (V.pj(x, 2, z)) pts.push([V.X, V.Y]); else pts.push(null); }
    [[26, .03], [12, .06], [5, .16], [2.2, .55], [1, .95]].forEach(([w, a]) => {
      for (let i = 1; i < pts.length; i++) { const A = pts[i - 1], B = pts[i]; if (!A || !B) continue; const tail = c01((pts.length - i) / 12); c.strokeStyle = `rgba(255,226,160,${(a * (.25 + .75 * tail)).toFixed(3)})`; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); }
    });
  }
  // the two ends: a soft glow at each, and their names
  const ends = [[0, 0, 'المسجد الحرام', bump(p, .225, .25, 2, 3)], [JER[0], JER[1], 'المسجد الأقصى', smooth(seg(p, .37, .395))]];
  ends.forEach(([x, z, name, a]) => {
    if (a <= 0 || !V.pj(x, 0, z)) return; const X = V.X, Y = V.Y, s = Math.max(16, Math.min(60, V.F * 40 / V.Z));
    c.globalAlpha = a * .85; c.drawImage(st.pale, X - s, Y - s, s * 2, s * 2); c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = `rgba(243,217,143,${a})`; c.beginPath(); c.arc(X, Y, 2.6, 0, TAU); c.fill();
    const fs = Math.round(Math.max(15, Math.min(22, W / 70))); c.font = `500 ${fs}px ${FONT.kufi}`; c.textAlign = 'center'; c.direction = 'rtl';
    c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = 8; c.fillStyle = `rgba(243,217,143,${a})`; c.fillText(name, X, Y - fs * 1.1); c.shadowBlur = 0;
    c.globalCompositeOperation = 'lighter';
  });
  c.globalCompositeOperation = 'source-over';
}

// ---------- S: the seven heavens ----------
function heavenTex(k) {
  const N = 384, cv = mk(N, N), g = cv.getContext('2d'), img = g.createImageData(N, N), D = img.data, R = rng(700 + k * 31), P = 6, sc = P / N;
  const put = (f) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const o = (y * N + x) * 4, c3 = f(x, y); D[o] = Math.min(255, c3[0]); D[o + 1] = Math.min(255, c3[1]); D[o + 2] = Math.min(255, c3[2]); D[o + 3] = 255; } g.putImageData(img, 0, 0); };
  const wrap = (fn) => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) fn(dx, dy); };
  if (k === 0) { // the first: a deep violet night set with lamps
    put((x, y) => { const n = fbm(x * sc, y * sc, P, 5), m = fbm(x * sc * 2 + 5, y * sc * 2, P * 2, 3); return lerp([10, 8, 30], [62, 40, 118], c01((n - .35) * 1.8) * .8).map((v, j) => v + [30, 20, 60][j] * c01((m - .55) * 3)); });
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 520; i++) { const x = R() * N, y = R() * N, m = R() ** 3; wrap((dx, dy) => { g.fillStyle = `rgba(240,236,255,${(.35 + .65 * m).toFixed(2)})`; g.fillRect(x + dx, y + dy, m > .5 ? 2 : 1, m > .5 ? 2 : 1); if (m > .6) { const q = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, 7); q.addColorStop(0, 'rgba(220,210,255,.5)'); q.addColorStop(1, 'rgba(220,210,255,0)'); g.fillStyle = q; g.fillRect(x + dx - 7, y + dy - 7, 14, 14); } }); }
  } else if (k === 1) { // the second: green curtains of light, finely striated
    put((x, y) => {
      let a = 0; for (let j = 0; j < 3; j++) { const cxj = ((j + .3) / 3) * N + Math.sin((y / N) * TAU * (1 + j % 2) + j * 1.7) * N * .09 + Math.sin((y / N) * TAU * 2 + j) * N * .03; let d = Math.abs(x - cxj); d = Math.min(d, N - d); a += Math.exp(-((d / (22 + 10 * Math.sin(j + y / N * TAU))) ** 2)) * (.6 + .4 * Math.sin((y / N) * TAU * 3 + j * 2)); }
      const st2 = .75 + .25 * Math.sin((y / N) * TAU * 5 + x * .02), n = fbm(x * sc, y * sc, P, 3);
      return lerp([4, 18, 24], [10, 46, 52], n).map((v, j) => v + [70, 255, 170][j] * c01(a) * st2 * .85 + [120, 60, 200][j] * c01(a - .8) * .3);
    });
  } else if (k === 2) { // the third: a sea of silver cloud
    put((x, y) => { const n = fbm(x * sc, y * sc, P, 5), w = fbm(x * sc * 3 + 2, y * sc * 3, P * 3, 2), c2 = smooth(c01((n - .42) / .3)); return lerp([26, 34, 60], lerp([150, 166, 204], [236, 240, 252], w), c2); });
  } else if (k === 3) { // the fourth: deep green, a lattice of eight-pointed stars drawn in gold and green light
    put((x, y) => { const n = fbm(x * sc, y * sc, P, 4); return lerp([4, 26, 20], [12, 60, 42], n); });
    const cell = N / 4; g.lineJoin = 'round';
    const star = (cx0, cy0, r) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + TAU / 32, rr = i % 2 ? r * .62 : r; g.lineTo(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr); } g.closePath(); };
    [[10, 'rgba(120,230,170,.18)', 6], [3, 'rgba(250,220,140,.55)', 2], [1.2, 'rgba(255,246,210,.9)', 0]].forEach(([lw, col, blur]) => {
      g.strokeStyle = col; g.lineWidth = lw; g.shadowColor = col; g.shadowBlur = blur * 3;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) wrap((dx, dy) => { const cx0 = (i + .5) * cell + dx, cy0 = (j + .5) * cell + dy; star(cx0, cy0, cell * .42); g.stroke(); g.beginPath(); g.moveTo(cx0 + cell * .42, cy0); g.lineTo(cx0 + cell * .58, cy0); g.moveTo(cx0, cy0 + cell * .42); g.lineTo(cx0, cy0 + cell * .58); g.stroke(); star(cx0 + cell / 2, cy0 + cell / 2, cell * .16); g.stroke(); });
    });
    g.shadowBlur = 0;
  } else if (k === 4) { // the fifth: rose and amber, clouds of warm light
    put((x, y) => { const wx = fbm(x * sc + 3, y * sc, P, 3) * 40, n = fbm((x + wx) * sc, (y - wx) * sc, P, 5), h = fbm(x * sc * 2, y * sc * 2 + 7, P * 2, 3); return lerp([30, 6, 20], lerp([210, 70, 80], [255, 190, 110], h), smooth(c01((n - .38) / .4))); });
  } else if (k === 5) { // the sixth: sapphire, rings of light spreading as on still water
    const C = Array.from({ length: 9 }, () => [R() * N, R() * N, 20 + R() * 40]);
    put((x, y) => { let a = 0; C.forEach(([cx0, cy0, r0]) => { let dx = Math.abs(x - cx0), dy = Math.abs(y - cy0); dx = Math.min(dx, N - dx); dy = Math.min(dy, N - dy); const d = Math.hypot(dx, dy); a += Math.max(0, Math.sin(d * .32 - r0)) ** 8 * Math.exp(-d / 90); }); const n = fbm(x * sc, y * sc, P, 4); return lerp([4, 14, 50], [16, 44, 110], n).map((v, j) => v + [150, 210, 255][j] * c01(a) * .9); });
  } else { // the seventh: white gold, fine streams of light
    put((x, y) => { const n = fbm(x * sc, y * sc * .25, P, 5), f = fbm(x * sc * 6, y * sc * .6, P * 6, 3), s = Math.max(0, Math.sin(x * .25 + n * 14)) ** 6; return lerp([140, 92, 30], [255, 226, 160], n).map((v, j) => v + [120, 110, 80][j] * s + [60, 50, 30][j] * f); });
  }
  // soften a little (the planes are seen far and wide, and fine detail only shimmers): blur a 3x3 tiling, keep the middle
  const big = mk(N * 3, N * 3), bg = big.getContext('2d'); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bg.drawImage(cv, i * N, j * N);
  const out = mk(N, N), og = out.getContext('2d'); og.filter = 'blur(1.2px)'; og.drawImage(big, -N, -N);
  return out;
}
function shotS(c, W, H, st, p, t, phone, dpr) {
  st.htex = st.htex || [];
  // height of the eye: the planes stand 1000 apart; the eye rests a little inside each heaven, passes each plane at PLANE_P
  const KP = [[.505, -900], ...PLANE_P.map((q, i) => [q, (i + 1) * 1000]), [.82, 7700]];
  let Ey = KP[0][1]; for (let i = 0; i < KP.length - 1; i++) if (p >= KP[i][0]) { const u = c01((p - KP[i][0]) / (KP[i + 1][0] - KP[i][0])); Ey = mix(KP[i][1], KP[i + 1][1], i && i < 7 ? u + .72 * Math.sin(TAU * u) / TAU : smooth(u)); }
  const pitch = mix(56, 12, smooth(seg(p, .505, .545))) + 2 * Math.sin(p * 40);
  const V = camera(W, H, phone, [0, Ey, p * 9000], 0, pitch, .9);
  const below = Math.max(-1, Math.min(6, Math.floor(Ey / 1000) - 1)); // the last heaven passed (-1: none yet)
  const kC = below + 1, kF = below; // ceiling: the next heaven; floor: this one
  const airF = kF >= 0 ? AIR[kF] : [8, 12, 30], airC = kC < 7 ? AIR[kC] : [255, 236, 200], yH = V.yAt(0);
  // the air between the planes: dark overhead, glowing at the far horizon
  const g = c.createLinearGradient(0, 0, 0, H);
  const tH = c01(yH / H);
  g.addColorStop(0, rgb(lerp(airC, [0, 0, 0], .9))); g.addColorStop(Math.max(0, tH - .1), rgb(lerp(airC, [0, 0, 0], .6))); g.addColorStop(tH, rgb(lerp(lerp(airC, airF, .5), [255, 255, 255], .1))); g.addColorStop(Math.min(1, tH + .08), rgb(lerp(airF, [0, 0, 0], .6))); g.addColorStop(1, rgb(lerp(airF, [0, 0, 0], .9)));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (below < 0) { // still under the first: the night sky of the earth, fading as the first heaven nears
    nightSky(c, W, H, V, st, t, [[4, 6, 18], [10, 14, 34], [30, 36, 64]], 1);
  }
  const drawPlane = (k, alpha) => {
    if (k < 0 || k > 6 || alpha <= 0) return;
    if (!st.htex[k]) st.htex[k] = { cv: heavenTex(k) };
    const T = st.htex[k]; if (!T.pat) T.pat = c.createPattern(T.cv, 'repeat');
    const A = (k + 1) * 1000, dy = A - Ey;
    c.globalAlpha = alpha * c01(Math.abs(dy) / 120);
    plane(c, W, H, dpr, V, A, T.pat, 9, 0, 0, 1, 30000);
    c.globalAlpha = 1;
    // haze toward the horizon in that heaven's air
    const near = dy > 0, y0 = near ? 0 : yH, y1 = near ? yH : H, hz = c.createLinearGradient(0, near ? yH : yH, 0, near ? Math.max(0, yH - H * .45) : Math.min(H, yH + H * .45));
    hz.addColorStop(0, rgb(lerp(AIR[k], [255, 255, 255], .2), .9)); hz.addColorStop(.18, rgb(AIR[k], .3)); hz.addColorStop(.5, rgb(AIR[k], 0)); hz.addColorStop(1, rgb(AIR[k], 0));
    c.fillStyle = hz; c.fillRect(0, y0, W, y1 - y0);
  };
  drawPlane(kF, 1); drawPlane(kC, smooth(c01(1 - (kC * 1000 + 1000 - Ey) / 1100)) * .9 + .1);
  // motes of light falling past as the eye rises
  c.globalCompositeOperation = 'lighter';
  const col = lerp(airF.map((v) => v * .5 + 128), [255, 246, 220], .5);
  for (let i = 0; i < 160; i++) { const x = ((i * 7919) % 1000 - 500) * .9, z = V.E[2] + 60 + ((i * 3571) % 1000) * 1.1, y = Ey + ((((i * 131 + 1) % 1000) * 1.9 - Ey) % 1900 + 1900) % 1900 - 950; if (!V.pj(x, y, z)) continue; const s = Math.max(2, Math.min(14, V.F * 3 / V.Z)); c.globalAlpha = .35 + .3 * ((i * 17) % 10) / 10; c.drawImage(st.pale, V.X - s, V.Y - s, s * 2, s * 2); }
  c.globalAlpha = 1;
  // passing a plane: a wash of its light
  PLANE_P.forEach((q, k) => { const f = Math.max(0, 1 - Math.abs(p - q) / .009); if (f > 0) { c.fillStyle = rgb(lerp(AIR[k], [255, 255, 255], .45), .55 * f * f); c.fillRect(0, 0, W, H); } });
  c.globalCompositeOperation = 'source-over';
  // the name of each heaven as it is passed
  PLANE_P.forEach((q, k) => {
    const a = bump(p, q - .008, q + .004, q + .026, q + .034); if (a <= 0) return;
    const fs = Math.round(Math.max(20, Math.min(34, W / 42))), x = phone ? W / 2 : W * .38, y = phone ? H * .74 : H * .58;
    c.font = `500 ${fs}px ${FONT.kufi}`; c.textAlign = 'center'; c.direction = 'rtl';
    c.shadowColor = rgb(lerp(AIR[k], [0, 0, 0], .7), .95); c.shadowBlur = 18; c.fillStyle = `rgba(250,236,196,${a})`; c.fillText(HEAVEN[k], x, y); c.shadowBlur = 0;
    c.strokeStyle = `rgba(243,217,143,${.6 * a})`; c.lineWidth = 1; c.beginPath(); c.moveTo(x - fs * 2.4, y + fs * .55); c.lineTo(x + fs * 2.4, y + fs * .55); c.stroke();
  });
}

// ---------- T: the lote tree of the boundary, then pure light ----------
function growTree(R) {
  const seg2 = [], leaves = [], clusters = [];
  // the root flare
  const grow = (x, y, ang, len, w, depth) => {
    const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len, bend = (R() - .5) * .6;
    const mx = (x + x2) / 2 + Math.cos(ang) * len * bend * .25, my = (y + y2) / 2 + Math.sin(ang) * len * bend * .25;
    seg2.push([x, y, mx, my, x2, y2, w, depth]);
    if (depth <= 1) {
      clusters.push([x2, y2, .05 + depth * .02]);
      const n = 7 + (R() * 6 | 0); for (let i = 0; i < n; i++) { const a = R() * TAU, r = (.01 + R() * .05) * (1 + depth * .4); leaves.push([x2 + Math.cos(a) * r * 1.4, y2 + Math.sin(a) * r * .8, .5 + R() * 1, R() * TAU]); }
    }
    if (depth === 0) return;
    const n = depth === 7 ? 5 : depth === 6 ? 2 + (R() < .5 ? 1 : 0) : 2 + (R() < .4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = depth === 7 ? 2.5 : depth === 6 ? 1.1 : .95, a0 = ang + spread * (n === 1 ? 0 : i / (n - 1) - .5) + (R() - .5) * .5;
      const a1 = a0 + (Math.abs(a0) > .95 ? -Math.sign(a0) * .18 : 0); // the outer limbs level out: a wide, flat crown
      grow(x2, y2, a1, len * (depth === 7 ? .95 : .7 + R() * .14), w * (depth === 7 ? .5 : .66), depth - 1);
    }
  };
  grow(0, 0, (R() - .5) * .08, .3, .095, 7);
  return { seg: seg2, leaves, clusters };
}
function shotT(c, W, H, st, p, t, phone) {
  if (!st.tree) st.tree = growTree(rng(5151));
  const T = st.tree, rise = smooth(seg(p, .79, .885)), light = bump(p, .87, .905, .925, .965), rest = smooth(seg(p, .93, .97));
  // the sky above the seventh: gold below, deep above; the horizon of the heaven under the tree
  const hy = H * mix(.55, .86, rise);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b0a1c'); g.addColorStop(c01(hy / H - .3), '#2a1f3a'); g.addColorStop(c01(hy / H - .04), '#9a6a3a'); g.addColorStop(c01(hy / H), '#ffe3a8'); g.addColorStop(c01(hy / H + .02), '#c88a3e'); g.addColorStop(1, '#3a2410');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the floor of the seventh heaven: streams of gold light running to the horizon
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const u = (i / 25 - .5) * 2.4, x0 = W * (phone ? .5 : .4) + u * W * .1, x1 = W * (phone ? .5 : .4) + u * W * 1.6; const gg = c.createLinearGradient(0, hy, 0, H); gg.addColorStop(0, 'rgba(255,220,150,.0)'); gg.addColorStop(.2, `rgba(255,214,140,${(.05 + .04 * Math.sin(i * 2.7 + t * .6)).toFixed(3)})`); gg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gg; c.beginPath(); c.moveTo(x0 - 2, hy); c.lineTo(x0 + 2, hy); c.lineTo(x1 + W * .02, H); c.lineTo(x1 - W * .02, H); c.closePath(); c.fill(); }
  c.globalCompositeOperation = 'source-over';
  // the tree: trunk on the horizon of the heaven, crown spread wide; the camera rises along it
  const S = phone ? W * .58 : H * .6, ox = phone ? W * .5 : W * .37, oy = hy + H * mix(.62, .02, rise);
  const X = (x) => ox + x * S, Y = (y) => oy + y * S * .95;
  const sh = .8 + .2 * Math.sin(t * .7);
  c.globalCompositeOperation = 'lighter';
  // halo behind the crown
  const crown = c.createRadialGradient(X(0), Y(-1.05), 0, X(0), Y(-1.05), S * 1.3);
  crown.addColorStop(0, `rgba(255,236,190,${(.26 * sh).toFixed(3)})`); crown.addColorStop(.45, 'rgba(240,200,130,.1)'); crown.addColorStop(1, 'rgba(240,190,120,0)');
  c.fillStyle = crown; c.fillRect(0, 0, W, H);
  // limbs: a wide soft glow, then a bright core
  for (let dd = 7; dd >= 0; dd--) { // one path per depth, three strokes: a wide soft glow, then a bright core
    const segs = T.seg.filter((q) => q[7] === dd); if (!segs.length) continue;
    const pa = new Path2D(); segs.forEach(([x, y, mx, my, x2, y2]) => { pa.moveTo(X(x), Y(y)); pa.quadraticCurveTo(X(mx), Y(my), X(x2), Y(y2)); });
    const w = segs[0][6]; c.lineCap = 'round';
    (dd >= 4 ? [[2.6, .05], [1.2, .12], [dd === 7 ? .75 : .42, .7]] : [[1.1, .08], [.42, .5]]).forEach(([wk, a]) => { c.strokeStyle = `rgba(255,232,180,${a})`; c.lineWidth = Math.max(.6, w * S * wk * .9); c.stroke(pa); });
  }
  // the leaves: small lights, clustered, trembling
  const sz = Math.max(1.2, S / 420);
  c.globalAlpha = .1; T.clusters.forEach(([x, y, r], i) => { const q = r * S * 1.5; if (i % 3) return; c.drawImage(st.green, X(x) - q, Y(y) - q * .7, q * 2, q * 1.4); }); c.globalAlpha = 1;
  const bins = [[], [], [], []];
  T.leaves.forEach(([x, y, m, ph]) => { const tw = .55 + .45 * Math.sin(t * 1.6 + ph * 3 + p * 30); bins[Math.min(3, (tw * m * 2.2) | 0)].push(X(x + Math.sin(t * .9 + ph) * .002), Y(y), sz * (m > 1.2 ? 1.6 : 1)); });
  bins.forEach((b, k) => { c.fillStyle = ['rgba(70,170,120,.3)', 'rgba(130,214,166,.42)', 'rgba(236,220,160,.55)', 'rgba(255,248,226,.85)'][k]; c.beginPath(); for (let i = 0; i < b.length; i += 3) c.rect(b[i] - b[i + 2] / 2, b[i + 1] - b[i + 2] / 2, b[i + 2], b[i + 2]); c.fill(); });
  // what covers it: veils of coloured light drifting over the crown
  const veil = smooth(seg(p, .8, .86));
  [[-.5, -1.2, [120, 220, 170]], [.45, -1.0, [250, 200, 120]], [0, -1.45, [200, 200, 255]], [-.2, -.85, [255, 180, 140]]].forEach(([vx, vy, col], i) => {
    const q = S * (.55 + .1 * Math.sin(t * .4 + i)), x = X(vx + .12 * Math.sin(p * 14 + i * 2 + t * .15)), y = Y(vy + .06 * Math.cos(p * 11 + i));
    const gg = c.createRadialGradient(x, y, 0, x, y, q); gg.addColorStop(0, rgb(col, .16 * veil)); gg.addColorStop(1, rgb(col, 0)); c.fillStyle = gg; c.fillRect(x - q, y - q, q * 2, q * 2);
  });
  // motes of light drifting down through the branches
  c.fillStyle = 'rgba(255,240,200,.85)'; c.beginPath();
  for (let i = 0; i < 220; i++) { const x = ((i * 7919) % 1000 / 1000 - .5) * 2.6, y0 = -1.9 + ((i * 3571) % 1000) / 1000 * 2, y = y0 + ((p * 2 + t * .01 + i * .37) % 1) * .4; c.rect(X(x), Y(y), sz, sz); }
  c.fill();
  // pure light: from beyond the crown, filling the left and centre, held off the words on the right
  const L = Math.max(light, rest * .55);
  if (L > 0) {
    const lx = phone ? W * .5 : W * .36, ly = phone ? H * .3 : -H * .05, R0 = Math.hypot(W, H) * (.5 + .4 * L);
    const lg = c.createRadialGradient(lx, ly, 0, lx, ly, R0); lg.addColorStop(0, `rgba(255,252,240,${(.95 * L).toFixed(3)})`); lg.addColorStop(.35, `rgba(255,240,210,${(.55 * L).toFixed(3)})`); lg.addColorStop(1, 'rgba(255,230,190,0)');
    c.fillStyle = lg; c.fillRect(0, 0, W, H);
    // a few broad soft rays falling from it
    for (let i = 0; i < 9; i++) { const a = Math.PI / 2 + (i / 8 - .5) * 1.5 + .04 * Math.sin(t * .3 + i), len = R0 * 1.3, w = .05 + .03 * Math.sin(i * 3.1); c.fillStyle = `rgba(255,246,220,${(.06 * L).toFixed(3)})`; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + Math.cos(a - w) * len, ly + Math.sin(a - w) * len); c.lineTo(lx + Math.cos(a + w) * len, ly + Math.sin(a + w) * len); c.closePath(); c.fill(); }
  }
  c.globalCompositeOperation = 'source-over';
  // keep the words readable: a shade over the right-hand column on desktop, over the top on phones
  const sc = c.createLinearGradient(phone ? 0 : W, phone ? 0 : 0, phone ? 0 : W * .55, phone ? H * .4 : 0);
  sc.addColorStop(0, `rgba(10,8,18,${(.55 + .2 * L).toFixed(3)})`); sc.addColorStop(1, 'rgba(10,8,18,0)'); c.fillStyle = sc; c.fillRect(0, 0, W, H);
}

// ---------- the clouds the camera rises through over Mecca ----------
function clouds(c, W, H, st, p) {
  const a = bump(p, .145, .185, .2, .24); if (a <= 0) return;
  const rise = seg(p, .14, .25);
  c.fillStyle = `rgba(30,40,66,${(.55 * a * a).toFixed(3)})`; c.fillRect(0, 0, W, H);
  for (let i = 0; i < st.cl.length; i++) {
    const R = st.cl[i], x = (R[0] * 1.4 - .2) * W, y = ((R[1] + rise * (1.6 + R[2])) % 1.8 - .4) * H, s = (R[2] * .6 + .5) * Math.max(W, H);
    c.globalAlpha = a * (.55 + .4 * R[3]); c.drawImage(i % 3 ? st.cloud : st.cloudLit, x - s, y - s * .32, s * 2, s * .64);
  }
  c.globalAlpha = 1;
}

S.miraj = {
  init(el, st) {
    st.cv = el.querySelector('canvas'); st.c = st.cv.getContext('2d');
    st.alt = mk(1, 1); st.ac = st.alt.getContext('2d');
    const R = rng(1717);
    st.fire = sprite([[0, 'rgba(255,224,170,1)'], [.25, 'rgba(255,170,80,.5)'], [.6, 'rgba(225,110,40,.12)'], [1, 'rgba(200,80,20,0)']], 64);
    st.pale = sprite([[0, 'rgba(255,246,222,1)'], [.2, 'rgba(255,236,196,.5)'], [.55, 'rgba(240,214,160,.12)'], [1, 'rgba(240,214,160,0)']], 96);
    st.green = sprite([[0, 'rgba(200,255,220,1)'], [.3, 'rgba(120,220,170,.45)'], [1, 'rgba(90,200,150,0)']], 64);
    st.cloud = sprite([[0, 'rgba(40,52,84,.9)'], [.5, 'rgba(34,44,74,.55)'], [1, 'rgba(30,40,70,0)']], 96);
    st.cl = Array.from({ length: 30 }, () => [R(), R(), R(), R()]);
    st.cloudLit = sprite([[0, 'rgba(92,104,140,.85)'], [.5, 'rgba(60,72,106,.5)'], [1, 'rgba(40,52,84,0)']], 96);
    st.NS = 66; st.NK = 84;
    st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1)); st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3);
    st.stars = Array.from({ length: 3000 }, () => { const az = R() * TAU, el = Math.asin(R() * .98), m = .22 + R() ** 3 * 1.7; return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el), m, R() * 9]; });
    st.milky = Array.from({ length: 70 }, (_, i) => { const a = i / 70 * TAU, v = [Math.cos(a) * .9, Math.sin(a) * .62 + .1, Math.sin(a) * .78]; return [...norm(v), .4 + R() * .9 * (.5 + .5 * Math.sin(a * 3))]; }).filter((m) => m[1] > -.05);
    // the houses close round the open ground of the Kaaba, lanes running out between them
    // the houses packed close round the open ground of the Kaaba, lanes running out between the blocks
    st.houses = []; st.lamps = [];
    const CELL = 10;
    for (let gx = -34; gx <= 34; gx++) for (let gz = -40; gz <= 40; gz++) {
      const x = gx * CELL + (R() - .5) * 2, z = gz * CELL + (R() - .5) * 2, r = Math.hypot(x, z);
      if (r < 44 || r > 330 + 60 * Math.sin(Math.atan2(z, x) * 3) || hMecca(x, z) > 9) continue;
      if (((gx + 400) % 5 === 0 && Math.abs(gz) > 3) || ((gz + 400) % 6 === 0 && Math.abs(gx) > 3) || R() < .08) continue; // lanes and yards
      const w = CELL - 1 - R() * 2.4, d = CELL - 1 - R() * 2.4, h = 3.2 + R() * 3 + (R() < .25 ? 3 : 0), y = hMecca(x, z) - .3, tone = .6 + R() * .4;
      const b = { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, y0: y, y1: y + h, col: [76 * tone, 66 * tone, 56 * tone] };
      b.win = Array.from({ length: 1 + (R() * 2 | 0) }, () => { const u = .15 + R() * .6, v = .55 + R() * .2; return [u, v, .06 + R() * .05, .1 + R() * .06]; }); b.win.push([.3 + R() * .4, 0, .09, .42]);
      st.houses.push(b);
      if (R() < .11) st.lamps.push([x + (R() - .5) * w * .4, y + 1.4 + (R() < .4 ? 2.6 : 0), (R() < .5 ? z - d / 2 - .2 : z + d / 2 + .2), R()]);
    }
    // the hill of al-Quds: olive trees on its slopes; the rock at its top, broad and low
    st.olives = []; for (let i = 0; i < 240; i++) { const x = (R() - .5) * 360, z = -20 + R() * 320; if (Math.hypot(x - ROCK[0], z - ROCK[2]) < 24 || Math.hypot(x + 20, z + 34) < 30) continue; st.olives.push([x, z, 1.2 + R() * 1.1, R()]); }
    st.qgrit = Array.from({ length: 900 }, () => [-60 + R() * 90, -50 + R() * 70, .04 + R() ** 3 * .35]);
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const queue = [() => { st.map = st.map || buildMap(); }, ...[0, 1, 2, 3, 4, 5, 6].map((k) => () => { st.htex = st.htex || []; st.htex[k] = st.htex[k] || { cv: heavenTex(k) }; })];
    const next = () => { const job = queue.shift(); if (job) idle(() => { job(); next(); }, { timeout: 3000 }); };
    if (!reduced) next(); // a still frame at rest never needs them
    st.rock = [[0, 0, 5.5, 1.6, .3], [-4, 2, 3.6, 1.2, 1.2], [3.6, -1.5, 3.2, 1.0, 2.2], [1.5, 3.4, 2.6, .9, 3.1], [-2.6, -2.6, 2.4, .8, 4]];
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    const draw = { H: shotH, M: shotM, Q: shotQ, S: shotS, T: shotT };
    const on = Object.keys(SH).filter((k) => p >= SH[k][0] && p <= SH[k][1]);
    if (!on.length) on.push(p < 0 ? 'H' : 'T');
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    draw[on[0]](c, W, H, st, p, t, phone, dpr);
    if (on.length > 1) {
      const a = st.alt, g = st.ac;
      if (a.width !== cv.width || a.height !== cv.height) { a.width = cv.width; a.height = cv.height; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      draw[on[1]](g, W, H, st, p, t, phone, dpr);
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = smooth(seg(p, SH[on[1]][0], SH[on[0]][1])); c.drawImage(a, 0, 0); c.globalAlpha = 1;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    clouds(c, W, H, st, p);
    // a gentle vignette
    const vg = c.createRadialGradient(W * .45, H * .55, Math.min(W, H) * .32, W * .45, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(3,4,10,0)'); vg.addColorStop(1, 'rgba(3,4,10,.5)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
