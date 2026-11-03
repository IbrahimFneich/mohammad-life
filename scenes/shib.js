(() => {
// shib: the siege in the valley of Abu Talib. A narrow rocky ravine under Mecca, closed at its head, opening on
// Mecca's basin where the Kaaba stands far off with the boycott document hung in it. A world in metres (x across,
// y up, z down the valley toward its mouth) seen through a pinhole camera keyed on p; the ground is a heightfield
// painted as depth bands by terrainRaster (core.js), lit by the moon and by the few fires of the camp.
//   p  -.05 → .19  dusk: Banu Hashim come up the valley from Mecca, the Prophet ﷺ and Abu Talib at their head (Qummi 1:380)
//       .19 → .37  night: the camera comes down to the bed; Abu Talib stands at his head with the sword  (Qummi 1:380)
//       .37 → .55  the same night: he raises him and lays him down in another place, and again; the moon crosses
//                  the sky                                                                       (I'lam al-Wara 1:125)
//       .55 → .72  four years: the camera rises; moons wax and wane, the fires thin; twice a year a few go out to
//                  the markets of the seasons and come back                                  (I'lam 1:126; count ١→٤)
//       .72 → .89  the document in the Kaaba, close: its forty seals hold, its writing is eaten away line by line
//                  until nothing is left but «باسمك اللّهم»                                       (I'lam 1:127–128)
//       .89 → 1    dawn: the camera turns at the mouth; he walks out of the valley toward us, Abu Talib beside him,
//                  his people behind                                                              (I'lam 1:129)
// The Prophet is drawn only by Holy.draw (veiled, gold disc); everyone else is a faceless silhouette. Abu Talib's
// sword is a plain straight blade (not Dhul-Fiqar). Everything follows from p; t only flickers fires, twinkles stars
// and sways cloth.
const R0 = rng(5150);
const ridged = (a, b) => 1 - Math.abs(Math.sin(a + Math.sin(b * .73) * 1.3) * Math.cos(b + Math.sin(a * .61) * 1.1));
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const bend = (z) => 3 * Math.sin(z * .021) + 7 * Math.sin(z * .006 + 1) - 7 * Math.sin(1);
const wv = (z) => 14 + .045 * Math.max(0, z) + 3 * Math.sin(z * .043);
const KA = [bend(640), 640]; // the Kaaba, out in the basin past the mouth
function hgt(x, z) {
  const ax = Math.abs(x - bend(z)), wall = Math.max(0, ax - wv(z)), open = smooth(c01((z - 240) / 170));
  const rough = ridged(x * .05, z * .05) * 1.6 + ridged(x * .016 + 4, z * .022) * 6 + ridged(x * .006, z * .008 + 2) * 15;
  let h = Math.min(90, wall ** 1.2 * 1.1) + rough * c01(wall / 5);
  const T = 4.5 + 1.5 * Math.sin(z * .047 + x * .02), v = h / T, fr = v - Math.floor(v); // ledges: the granite breaks in steps
  h = mix(h, (Math.floor(v) + smooth(c01((fr - .55) / .45))) * T, .55 * c01(wall / 3));
  h *= 1 - open * .92;
  const dh = Math.max(0, -z - 44); // the head of the ravine: a ragged rise closing the camp in
  h += (16 * (1 - Math.exp(-dh / 20)) + 12 * ridged(x * .045 + 1.7, dh * .04) + rough * .4) * c01(dh / 6) * (1 - open); // the head of the ravine closes behind the camp
  h += .22 * Math.sin(x * .31 + z * .2) * Math.sin(z * .17 - x * .05); // the floor's small rises
  const rb = Math.hypot((x - KA[0]) / 1.3, z - KA[1]);
  h = Math.max(h, Math.min(170, Math.max(0, rb - 520) ** 1.1 * .5) * (.55 + .45 * ridged(x * .0045, z * .0041)) * open);
  return h - 5 * open;
}
// the camp: tents along both walls, low stone walls, the few fires; bed places A → B → C for the one night
const TENTS = [], WALLS = [];
for (let z = 9, s = 1; z < 236; z += 7 + R0() * 9, s = -s) {
  const side = R0() < .78 ? s : -s, x = bend(z) + side * (wv(z) - 2.2 - R0() * 2.6);
  TENTS.push({ x, z, w: 4.4 + R0() * 3, h: 1.6 + R0() * .7, pk: 2 + (R0() * 2 | 0), sh: R0() });
  if (R0() < .45) WALLS.push({ x: x - side * 2.6, z: z + 2 + R0() * 2, w: 3 + R0() * 4 });
}
const FIRES = [[-5.8, 24], [6.6, 33], [-7, 57], [5.5, 88], [-6, 132], [7.4, 176]].map(([x, z], i) => ({ x: bend(z) + x, z, ph: i * 1.7 }));
const BED = [[-2.6, 14], [1.6, 16.6], [-4.3, 19.2]].map(([x, z]) => [bend(z) + x, z]);
// the people: the line that comes up the valley at dusk, and leaves it at dawn
const FOLK = Array.from({ length: 22 }, (_, i) => ({ dx: (R0() - .5) * 5.6, dz: 4 + i * 2.1 + R0() * 1.6, k: R0() < .25 ? 'child' : R0() < .45 ? 'woman' : 'man', s: .9 + R0() * .14, ph: R0() }));
const SEAT = Array.from({ length: 9 }, (_, i) => { const f = FIRES[i % 4]; const a = R0() * TAU; return { f: i % 4, x: f.x + Math.cos(a) * 1.5, z: f.z + Math.sin(a) * 1.1 }; });
const STONES = Array.from({ length: 220 }, () => { const z = -36 + R0() ** 1.4 * 150; return [bend(z) + (R0() - .5) * 2 * (wv(z) - 1), z, .08 + R0() ** 2 * .3]; });
const STARS = Array.from({ length: 520 }, () => [R0() * TAU, Math.asin(R0() * .98), R0()]);
const HOUSES = []; for (let i = 0; i < 170; i++) { const a = R0() * TAU, r = 70 + R0() ** .7 * 430, x = KA[0] + Math.cos(a) * r * 1.2, z = KA[1] + Math.sin(a) * r * .8; if (z < 400) continue; HOUSES.push({ x, z, w: 6 + R0() * 9, h: 4 + R0() * 6, lamp: R0() < .32, ph: R0() * TAU }); }
const TERM = Array.from({ length: 70 }, () => [R0(), R0(), R0() * TAU]); // the creatures on the document, as specks
const MOVES = [[.39, .403, .43], [.462, .475, .502]]; // [rise, set out, lie down again]
// the camera keys: [p, x, y, z, yaw°, pitch° (down), focal ×]
const CAM = [[-.06, .5, 7.5, -38, 0, 2.5, 1], [.12, -.5, 5, -24, 0, 3.5, 1], [.2, -2, 3.2, -6, 0, 6, 1.05], [.26, 0, 0, 0, 0, 5.5, 1.12], [.55, 0, 0, 0, 0, 5.5, 1.12],
  [.61, 0, 15, -30, 0, 8, 1], [.71, 0, 17, -36, 0, 7.5, 1], [.8, 0, 12, 60, 0, 3, 1.6], [.88, 0, 12, 120, 0, 2, 1.9]];
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => v + (B[j + 1] - v) * k); };
// where the Prophet is on the night of the moves (and through the years): [x, z, pose, walk phase]
function nightAt(p) {
  for (let m = 0; m < 2; m++) {
    const [r, s, e] = MOVES[m], a = BED[m], b = BED[m + 1];
    if (p < r) return [a[0], a[1], 'lie', 0];
    if (p < s) return [a[0], a[1], 'stand', 0];
    if (p < e) { const u = smooth((p - s) / (e - s)); return [mix(a[0], b[0], u), mix(a[1], b[1], u), 'walk', (p - s) / (e - s) * 3.2]; }
  }
  return [BED[2][0], BED[2][1], 'lie', 0];
}
const outAt = (p) => { const u = c01((p - .885) / .2); return [mix(BED[2][0], bend(70) - .6, smooth(c01(u * 1.6)) ** .5 * .3 + u * .7), mix(BED[2][1], 70, u)]; };

// ---------- drawing helpers ----------
// a faceless person: a draped head, shoulders, a robe to the ground; o.k 'man' | 'woman' | 'child'; walk sways it
function person(g, x, y, hp, o = {}) {
  if (hp < 1.5) return;
  const k = o.k || 'man', H = hp * (k === 'child' ? .62 : k === 'woman' ? .93 : 1), w = H * (k === 'woman' ? .15 : .135), sw = o.walk ? Math.sin((o.ph || 0) * TAU) * H * .025 : 0;
  const hr = H * .075, hy = y - H + hr * 1.1, sh = y - H * .8;
  g.fillStyle = o.col || '#0b0b10';
  g.beginPath();
  g.moveTo(x - hr * .95, hy + hr * .5); // the headcloth, falling to the shoulders
  g.quadraticCurveTo(x - hr * 1.2, hy - hr * 1.25, x, hy - hr * 1.2);
  g.quadraticCurveTo(x + hr * 1.2, hy - hr * 1.25, x + hr * .95, hy + hr * .5);
  g.quadraticCurveTo(x + hr * 1.3, sh - H * .01, x + w * 1.08, sh + H * .04); // the shoulder
  g.quadraticCurveTo(x + w * 1.15, y - H * .45, x + w * (k === 'woman' ? 1.3 : 1.12) + sw, y);
  g.quadraticCurveTo(x + sw * .5, y + H * .012, x - w * (k === 'woman' ? 1.3 : 1.12) + sw, y);
  g.quadraticCurveTo(x - w * 1.15, y - H * .45, x - w * 1.08, sh + H * .04);
  g.quadraticCurveTo(x - hr * 1.3, sh - H * .01, x - hr * .95, hy + hr * .5);
  g.fill();
  if (o.rim) { g.strokeStyle = o.rim; g.lineWidth = Math.max(.6, H * .007); g.stroke(); }
  if (H > 30) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(.6, H * .006); g.beginPath(); g.moveTo(x - w * .3, y - H * .62); g.quadraticCurveTo(x - w * .4, y - H * .3, x - w * .5 + sw, y); g.moveTo(x + w * .35, y - H * .6); g.quadraticCurveTo(x + w * .45, y - H * .3, x + w * .55 + sw, y); g.stroke(); }
  if (o.sword) { // a straight blade held point down before him, both hands on the hilt
    const hx = x + w * .15, hyy = y - H * .5, tx = x + w * .75, ty = y - H * .015;
    g.strokeStyle = o.blade || 'rgba(205,210,220,.85)'; g.lineWidth = Math.max(1.2, H * .02); g.lineCap = 'round';
    g.beginPath(); g.moveTo(hx, hyy); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(.5, H * .005); g.beginPath(); g.moveTo(hx + 1, hyy + H * .02); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = o.col || '#0b0b10'; g.lineWidth = Math.max(1.4, H * .024);
    g.beginPath(); g.moveTo(hx - w * .5, hyy + H * .03); g.lineTo(hx + w * .5, hyy + H * .045); g.stroke(); // the guard
    g.beginPath(); g.moveTo(hx, hyy + H * .03); g.lineTo(hx - w * .12, hyy - H * .06); g.stroke(); // the grip in his hands
    g.beginPath(); g.ellipse(hx - w * .1, hyy - H * .02, w * .32, H * .035, -.4, 0, TAU); g.fillStyle = o.col || '#0b0b10'; g.fill(); // the sleeves over it
    g.lineCap = 'butt';
  }
}
// a goat-hair tent seen from the valley floor: a low roof on two or three poles, the front open and dark
function tent(g, x, y, s, T, lit) {
  const W = T.w * s, Hh = T.h * s, n = T.pk;
  g.fillStyle = rgb(lerp([14, 12, 12], [60, 40, 26], lit)); g.beginPath(); g.moveTo(x - W / 2, y);
  for (let i = 0; i <= n; i++) { const u = i / n, px = x - W / 2 + u * W; g.lineTo(px, y - Hh * (i === 0 || i === n ? .55 : 1) + (i % 2 ? Hh * .06 : 0)); if (i < n) g.quadraticCurveTo(px + W / n / 2, y - Hh * .72, px + W / n, y - Hh * ((i + 1) === n ? .55 : 1)); }
  g.lineTo(x + W / 2, y); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(x - W * .3, y - Hh * .55, W * .6, Hh * .55); // the open front
  g.fillStyle = rgb(lerp([30, 24, 20], [120, 80, 46], lit), .55); g.fillRect(x - W / 2, y - Hh * .6, W, Math.max(1, Hh * .05)); // the hem of the roof
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(.5, s * .03); g.beginPath(); g.moveTo(x - W / 2, y - Hh * .55); g.lineTo(x - W * .62, y); g.moveTo(x + W / 2, y - Hh * .55); g.lineTo(x + W * .62, y); g.stroke();
}
function fire(g, x, y, s, t, ph, k) {
  if (s < .4 || k <= 0) return;
  g.globalCompositeOperation = 'lighter';
  let q = g.createRadialGradient(x, y - s * .3, 0, x, y - s * .3, s * 7);
  q.addColorStop(0, `rgba(255,170,80,${.5 * k})`); q.addColorStop(.3, `rgba(255,120,40,${.14 * k})`); q.addColorStop(1, 'rgba(255,110,40,0)');
  g.fillStyle = q; g.fillRect(x - s * 7, y - s * 7.3, s * 14, s * 14);
  for (let i = 0; i < 3; i++) { // flames
    const fl = .75 + .25 * Math.sin(t * (7 + i * 2.3) + ph + i), fx = x + (i - 1) * s * .22, fh = s * (1.05 - Math.abs(i - 1) * .35) * fl * k;
    g.fillStyle = i === 1 ? `rgba(255,236,170,${.9 * k})` : `rgba(255,150,60,${.75 * k})`;
    g.beginPath(); g.moveTo(fx - s * .16, y); g.quadraticCurveTo(fx - s * .12, y - fh * .6, fx + Math.sin(t * 5 + ph + i) * s * .06, y - fh); g.quadraticCurveTo(fx + s * .12, y - fh * .6, fx + s * .16, y); g.fill();
  }
  for (let i = 0; i < 4; i++) { const u = (t * .5 + i / 4 + ph) % 1; g.fillStyle = `rgba(255,190,110,${(1 - u) * .7 * k})`; const sz = Math.min(2.6, Math.max(1, s * .05)); g.fillRect(x + Math.sin(i * 3 + t) * s * .3 * u, y - s * (1 + u * 2.2), sz, sz); }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#1a120c'; g.fillRect(x - s * .3, y - s * .06, s * .6, s * .1);
}
// the document, close: parchment, illegible lines of writing, forty seals; e 0..1 how much is eaten; nm the name glowing
function docTex(st, W2, H2) {
  if (st.doc && st.doc.w === W2) return st.doc;
  const R = rng(4040), cv = mk(W2, H2), g = cv.getContext('2d');
  let q = g.createLinearGradient(0, 0, W2, H2); q.addColorStop(0, '#d9c49a'); q.addColorStop(.5, '#cdb487'); q.addColorStop(1, '#b89a6c');
  g.fillStyle = q; g.beginPath(); g.moveTo(W2 * .04, H2 * .02); for (let i = 1; i <= 12; i++) g.lineTo(W2 * (.04 + .92 * i / 12), H2 * (.02 + (R() - .5) * .012)); g.lineTo(W2 * .97, H2 * .98); for (let i = 11; i >= 0; i--) g.lineTo(W2 * (.04 + .92 * i / 12), H2 * (.98 + (R() - .5) * .012)); g.closePath(); g.fill();
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${R() < .5 ? '90,60,30' : '255,245,220'},${R() * .08})`; g.fillRect(R() * W2, R() * H2, 1 + R() * 3, 1 + R() * 2); }
  const ink = mk(W2, H2), gi = ink.getContext('2d'), lines = [];
  gi.strokeStyle = 'rgba(40,24,14,.88)'; gi.fillStyle = 'rgba(40,24,14,.88)'; gi.lineCap = 'round';
  for (let l = 0; l < 13; l++) { // the writing: a running hand of strokes, loops and dots, never words
    const y = H2 * (.2 + l * .043), x1 = W2 * .88, x0 = W2 * (l === 12 ? .45 : .12); let x = x1; lines.push(y);
    gi.lineWidth = Math.max(1, W2 * .004);
    while (x > x0) {
      const n = 2 + (R() * 5 | 0); gi.beginPath(); gi.moveTo(x, y);
      for (let i = 0; i < n && x > x0; i++) {
        const st2 = W2 * (.006 + R() * .016), up = R() < .22 ? H2 * (.014 + R() * .012) : H2 * R() * .005;
        gi.quadraticCurveTo(x - st2 * .5, y - up - H2 * .003, x - st2, y + (R() - .5) * H2 * .002);
        if (up > H2 * .012) { gi.moveTo(x - st2 * .2, y); gi.lineTo(x - st2 * .3, y - up); gi.moveTo(x - st2, y); }
        if (R() < .1) { gi.quadraticCurveTo(x - st2 * 1.3, y + H2 * .016, x - st2 * 1.8, y + H2 * .004); gi.moveTo(x - st2, y); }
        x -= st2;
      }
      gi.stroke(); x -= W2 * (.008 + R() * .014);
    }
    for (let i = 0; i < 16; i++) gi.fillRect(x0 + R() * (x1 - x0), y + (R() < .5 ? -1 : 1) * H2 * (.008 + R() * .004), W2 * .0045, W2 * .0035);
  }
  st.doc = { w: W2, cv, ink, lines, out: mk(W2, H2), noise: Float32Array.from({ length: Math.ceil(W2 / 4) * Math.ceil(H2 / 4) }, () => R()), e: -1 };
  return st.doc;
}
function drawDoc(g, st, x, y, w, h, e, nm, t) {
  const W2 = Math.max(60, Math.round(w)), H2 = Math.round(W2 * h / w), D = docTex(st, W2, H2);
  if (Math.abs(D.e - e) > .002) { // eat the writing: a noise field, coarse and swelling from the line ends inward
    const og = D.out.getContext('2d'); og.clearRect(0, 0, W2, H2); og.globalCompositeOperation = 'source-over'; og.drawImage(D.ink, 0, 0);
    if (e > 0) {
      og.globalCompositeOperation = 'destination-out'; og.fillStyle = '#000';
      const cw = Math.ceil(W2 / 4);
      for (let j = 0; j < H2 / 4; j++) for (let i = 0; i < cw; i++) {
        const n = D.noise[j * cw + i], edge = Math.abs(i / cw - .5) * .5;
        if (n * .7 + (.5 - edge) * .6 < e * 1.25) og.fillRect(i * 4 - 1, j * 4 - 1, 6, 6);
      }
    }
    D.e = e;
  }
  g.save();
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
  g.drawImage(D.cv, x, y, w, h); g.restore();
  g.drawImage(D.out, x, y, w, h);
  // the gnawed paper along the eaten lines
  if (e > .02) {
    g.fillStyle = 'rgba(120,90,55,.35)';
    D.lines.forEach((ly, l) => { const k = Math.min(1, e * 1.6 - l * .02); if (k <= 0) return; for (let i = 0; i < 34; i++) { const hh = Math.sin(i * 12.99 + l * 78.2) * 4375.5, r = hh - Math.floor(hh), u = (i + r * .8) / 34; if (Math.abs(u - .5) * .5 > k || (l === 12 && u < .4)) continue; g.beginPath(); g.ellipse(x + w * (.12 + u * .76), y + h * ly / H2 + (r - .5) * 3, w * (.006 + r * .012), 1 + r * 1.6, 0, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,20,12,.8)'; // the creatures, small dark specks along the lines
    const live = Math.sin(Math.PI * c01(e)) ;
    TERM.forEach(([a, b, ph]) => { if (b > live) return; const l = (a * D.lines.length) | 0, u = (b + t * .03 + ph) % 1; g.fillRect(x + w * (.12 + u * .76), y + h * D.lines[l] / H2 + Math.sin(t * 3 + ph) * 2, 2.2, 1.6); });
  }
  // the name of God at the head, untouched; it glows as the rest goes
  const fs = w * .085;
  g.font = `700 ${fs}px ${FONT.naskh}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  g.fillStyle = `rgba(48,28,14,${1 - nm})`; g.fillText('باسمك اللّهم', x + w / 2, y + h * .1);
  if (nm > 0) { g.save(); g.shadowColor = `rgba(255,206,120,${nm})`; g.shadowBlur = 34 * nm; g.fillStyle = `rgba(196,132,40,${nm})`; g.fillText('باسمك اللّهم', x + w / 2, y + h * .1); g.shadowBlur = 12 * nm; g.fillText('باسمك اللّهم', x + w / 2, y + h * .1); g.restore(); }
  // forty seals in four rows, every one intact
  for (let i = 0; i < 40; i++) {
    const cx = x + w * (.13 + (i % 10) * .083), cy = y + h * (.82 + ((i / 10) | 0) * .042), r = w * .019;
    g.fillStyle = '#7a2a1c'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,190,160,.25)'; g.beginPath(); g.arc(cx - r * .3, cy - r * .3, r * .45, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(40,10,6,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r * .62, 0, TAU); g.stroke();
  }
}

S.shib = {
  init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); st.NS = 72; st.NK = 84; st.TX = new Float32Array(st.NS * (st.NK + 1)); st.TY = new Float32Array(st.NS * (st.NK + 1)); st.TC = new Float32Array(st.NS * (st.NK / 2 + 1) * 3); },
  frame(p, t, el, st) {
    const cv = st.cv;
    fit(cv);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (W < 2 || H < 2) return;
    const g = st.g, d = cv.width / W, wide = W >= 820 || W > H * 1.05;
    g.setTransform(d, 0, 0, d, 0, 0);

    // ----- the time of night, the moon, the fires -----
    const yrs = seg(p, .555, .715), endP = p >= .878, dawn = smooth(seg(p, .87, 1.02));
    const dusk = 1 - smooth(seg(p, -.02, .2)); // the last of the evening at the start
    const fires = mix(4, 1, smooth(yrs)) * (1 - .7 * dawn), fireK = (i) => c01(fires - i);
    // the moon as seen: low in the notch of the valley, crossing it in the night of the moves, once a month in the years
    const mU = p < .37 ? .2 : p < .555 ? seg(p, .37, .55) : (yrs * 9.5) % 1;
    const moonAz = endP ? -.6 : mix(.3, -.3, mU), moonEl = .035 + .09 * Math.sin(Math.PI * mU);
    const phase = p < .555 ? .55 : (.55 + yrs * 9.5) % 1; // 0 new → .5 full → 1 new
    const moonI = (1 - Math.abs(phase - .5) * 1.6) * (1 - dawn) * (1 - dusk * .8);

    // ----- the camera -----
    let [ex, ey, ez, yaw, pitch, fm] = keyAt(CAM, p);
    const pro = endP ? outAt(p) : p < .2 ? null : nightAt(p);
    const near = smooth(seg(p, .19, .26)) * (1 - smooth(seg(p, .55, .61)));
    if (near > 0) { const n = nightAt(p); ex = mix(ex, n[0] + .1, near); ey = mix(ey, 1.7, near); ez = mix(ez, n[1] - 5.6, near); }
    if (endP) { ex = pro[0] - .2; ey = 2.1; ez = pro[1] + 7.2; yaw = 180; pitch = -1.5; fm = 1.12; }
    const F = W * (wide ? .78 : 1.5) * fm, CX = W * (wide ? .4 : .5), CY = H * (wide ? .46 : .6);
    const ya = yaw * Math.PI / 180, pa = pitch * Math.PI / 180, fw = [Math.sin(ya), 0, Math.cos(ya)], rt = [Math.cos(ya), 0, -Math.sin(ya)], cp = Math.cos(pa), sp = Math.sin(pa);
    let PX = 0, PY = 0, ZC = 0;
    const pj = (x, y, z) => { const dx = x - ex, dy = y - ey, dz = z - ez, f = dx * fw[0] + dz * fw[2], r = dx * rt[0] + dz * rt[2], zc = f * cp - dy * sp; if (zc < .15) return false; const yc = f * sp + dy * cp; PX = CX + r * F / zc; PY = CY - yc * F / zc; ZC = zc; return true; };
    const hy = CY - Math.tan(pa) * F; // the horizon

    // ----- the sky -----
    const skT = lerp(lerp([5, 7, 16], [20, 24, 56], dusk), [34, 44, 86], dawn), skM = lerp(lerp([10, 15, 32], [84, 60, 92], dusk), [96, 92, 128], dawn), skH = lerp(lerp([24, 30, 52], [212, 128, 88], dusk), [226, 164, 128], dawn);
    let q = g.createLinearGradient(0, hy - F * .9, 0, hy);
    q.addColorStop(0, rgb(skT)); q.addColorStop(.62, rgb(skM)); q.addColorStop(1, rgb(skH));
    g.fillStyle = q; g.fillRect(0, 0, W, H);
    const dirP = (az, el) => pj(ex + Math.sin(az) * Math.cos(el) * 1e5, ey + Math.sin(el) * 1e5, ez + Math.cos(az) * Math.cos(el) * 1e5);
    const sa = (1 - dusk) * (1 - dawn);
    if (sa > .02) {
      const rot = p * .5 + yrs * 2.4;
      g.fillStyle = '#efe8d4';
      for (const [az, el, k] of STARS) { if (!dirP(az + rot * .3, el) || PX < 0 || PX > W || PY > hy) continue; g.globalAlpha = sa * (.18 + .72 * k) * (.7 + .3 * Math.sin(t * 2 + k * 50)) * (1 - .5 * moonI); const s = k > .93 ? 1.8 : 1.05; g.fillRect(PX, PY, s, s); }
      g.globalAlpha = 1;
    }
    if (moonEl > 0 && moonI > .12 && dirP(moonAz, moonEl)) { // the moon, with its phase
      const mx = PX, my = PY, mr = F * .011;
      g.globalCompositeOperation = 'lighter';
      q = g.createRadialGradient(mx, my, mr, mx, my, mr * 14); q.addColorStop(0, `rgba(200,210,240,${.22 * moonI})`); q.addColorStop(1, 'rgba(200,210,240,0)');
      g.fillStyle = q; g.fillRect(mx - mr * 14, my - mr * 14, mr * 28, mr * 28);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = `rgba(20,24,40,${.6 * c01(moonI * 2)})`; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      const ph = phase * 2, wx = Math.cos(ph * Math.PI) * mr; // the lit part: one limb and the terminator
      g.fillStyle = '#f2ecd8'; g.beginPath();
      if (ph < 1) { g.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2, false); g.ellipse(mx, my, Math.abs(wx), mr, 0, Math.PI / 2, -Math.PI / 2, wx > 0); }
      else { g.arc(mx, my, mr, Math.PI / 2, -Math.PI / 2, false); g.ellipse(mx, my, Math.abs(wx), mr, 0, -Math.PI / 2, Math.PI / 2, wx > 0); }
      g.fill();
    }

    // ----- the land: far bands (Mecca's basin and its mountains), then the town, then the near bands (the ravine) -----
    const NS = st.NS, NK = st.NK, NC = NK / 2 + 1, TX = st.TX, TY = st.TY, TC = st.TC;
    const bot = Math.atan((H - CY) / F) + pa, dMin = Math.max(1, ey / Math.tan(Math.min(1.45, Math.max(.05, bot))) * .7), dMax = 2600, dCut = 330;
    const moonV = [Math.sin(moonAz * 2) * .72, .42, Math.cos(moonAz * 2) * .55]; // its light, from higher than it is drawn
    const amb = lerp(lerp([52, 58, 88], [104, 80, 86], dusk), [120, 104, 116], dawn), mC = [84, 96, 132].map((v) => v * (.35 + .65 * moonI)), sunC = [255, 190, 140].map((v) => v * (dawn * .8 + dusk * .7));
    const sunV = endP ? [-.3, .3, .9] : [.25, .28, .92];
    const ROCK = [112, 92, 80], SAND = [150, 126, 98], fogL = endP ? 1200 : 2400, fogC = lerp(skH, skM, .4);
    const firePos = FIRES.map((f, i) => [f.x, hgt(f.x, f.z) + .6, f.z, fireK(i) * (.85 + .15 * Math.sin(t * 9 + f.ph))]);
    const bands = (i0, i1) => {
      for (let i = i0; i < i1; i++) {
        const dd = dMin * (dMax / dMin) ** (1 - i / (NS - 1)), zc0 = dd * cp + ey * sp, aer = 1 - Math.exp(-dd / fogL), e2 = Math.max(1.2, dd * .03);
        for (let k = 0; k <= NK; k++) {
          const sx = -W * .06 + k * (W * 1.12 / NK), u = (sx - CX) / F * zc0;
          const x = ex + fw[0] * dd + rt[0] * u, z = ez + fw[2] * dd + rt[2] * u, h = hgt(x, z), o = i * (NK + 1) + k;
          if (pj(x, h, z)) { TX[o] = PX; TY[o] = Math.max(-H, Math.min(H * 3, PY)); } else { TX[o] = sx; TY[o] = H * 3; }
          if (k % 2) continue;
          const gx = (hgt(x + e2, z) - h) / e2, gz = (hgt(x, z + e2) - h) / e2, nl = Math.hypot(gx, 1, gz), nx = -gx / nl, ny = 1 / nl, nz = -gz / nl;
          const lam = Math.max(0, nx * moonV[0] + ny * moonV[1] + nz * moonV[2]), lsun = Math.max(0, nx * sunV[0] + ny * sunV[1] + nz * sunV[2]);
          const rock = c01((1 - ny) * 3), strata = .6 + .4 * (.5 + .5 * Math.sin(h * .9 + 1.4 * Math.sin(z * .02 + x * .03))) ** 3 * (.6 + .4 * Math.sin(h * .27 + z * .011));
          const patch = .74 + .26 * Math.sin(x * .19 + Math.sin(z * .13) * 2) * Math.sin(z * .23 - x * .07), vv = mix(patch, strata, rock);
          const al = lerp(SAND, ROCK, rock).map((v) => v * vv);
          let L = [0, 1, 2].map((j) => amb[j] * (.75 + .25 * ny) + mC[j] * lam * 1.3 + sunC[j] * lsun * 1.2);
          for (const [fx, fy, fz, fk] of firePos) { if (fk <= 0) continue; const q2 = (x - fx) ** 2 + (z - fz) ** 2 + (h - fy) ** 2; if (q2 > 700) continue; const f = fk * 260 / (1 + q2 / 5); L = [L[0] + f, L[1] + f * .58, L[2] + f * .26]; }
          const n = (i * NC + k / 2) * 3, col = [0, 1, 2].map((j) => al[j] / 255 * L[j]);
          TC[n] = mix(col[0], fogC[0], aer * .9); TC[n + 1] = mix(col[1], fogC[1], aer * .9); TC[n + 2] = mix(col[2], fogC[2], aer * .9);
        }
      }
    };
    let iCut = 0; while (iCut < NS - 1 && dMin * (dMax / dMin) ** (1 - iCut / (NS - 1)) > dCut) iCut++;
    bands(0, NS);
    terrainRaster(st, g, W, H, NS, NK, 2, TX, TY, TC, .12); // one pass; the town is laid on after, clipped above the near ground
    g.save(); g.beginPath(); g.moveTo(TX[iCut * (NK + 1)], -H);
    for (let k = 0; k <= NK; k++) { let y = H * 3; for (let i = iCut; i < NS; i++) y = Math.min(y, TY[i * (NK + 1) + k]); g.lineTo(TX[iCut * (NK + 1) + k], y); }
    g.lineTo(TX[iCut * (NK + 1) + NK], -H); g.closePath(); g.clip();
    // Mecca: its houses and lamps, the Kaaba with the document in it
    const items = [];
    HOUSES.forEach((o) => { const y0 = hgt(o.x, o.z); if (!pj(o.x, y0, o.z)) return; items.push([ZC, 'h', o, PX, PY, F / ZC]); });
    if (pj(KA[0], hgt(KA[0], KA[1]), KA[1])) items.push([ZC, 'k', null, PX, PY, F / ZC]);
    items.sort((a, b) => b[0] - a[0]);
    for (const [zc, kind, o, x, y, s] of items) {
      const fa = 1 - Math.exp(-zc / fogL), hz2 = skH;
      if (kind === 'h') {
        const w2 = o.w * s, h2 = o.h * s; if (w2 < .8) continue;
        g.fillStyle = rgb(lerp(lerp([60, 52, 50], [150, 120, 96], dawn), hz2, .55 * fa)); g.fillRect(x - w2 / 2, y - h2, w2, h2);
        g.fillStyle = rgb(lerp([30, 28, 34], hz2, .5 * fa)); g.fillRect(x + w2 / 2 - w2 * .25, y - h2, w2 * .25, h2);
        if (o.lamp && dawn < .9) { g.fillStyle = `rgba(255,196,120,${(.6 + .3 * Math.sin(t * 1.5 + o.ph)) * (1 - dawn) * (1 - .5 * yrs)})`; g.fillRect(x - w2 * .1, y - h2 * .55, Math.max(1.2, w2 * .12), Math.max(1.2, w2 * .12)); }
      } else {
        const k2 = 13 * s, hk = 15 * s;
        g.fillStyle = '#08080b'; g.fillRect(x - k2 / 2, y - hk, k2, hk);
        g.fillStyle = '#0e0d12'; g.fillRect(x + k2 / 2 - k2 * .3, y - hk, k2 * .3, hk);
        g.fillStyle = 'rgba(214,170,80,.9)'; g.fillRect(x - k2 / 2, y - hk * .78, k2, Math.max(1, hk * .07)); // the gold band
        g.fillStyle = 'rgba(236,222,190,.95)'; g.fillRect(x - k2 * .12, y - hk * .62, Math.max(1, k2 * .14), Math.max(1.4, hk * .2)); // the document, hung
        g.globalCompositeOperation = 'lighter';
        q = g.createRadialGradient(x, y - hk * .5, 0, x, y - hk * .5, k2 * 2.4); q.addColorStop(0, 'rgba(255,214,150,.22)'); q.addColorStop(1, 'rgba(255,214,150,0)');
        g.fillStyle = q; g.fillRect(x - k2 * 2.4, y - hk * .5 - k2 * 2.4, k2 * 4.8, k2 * 4.8);
        g.globalCompositeOperation = 'source-over';
      }
    }
    g.restore();

    // ----- the near walls: strips of granite down both sides, flat-shaded facets with strata, far to near -----
    // (the raster smears a steep wall seen edge-on into curtains, so the walls in front of the camera are drawn here)
    const OFF = [-.8, 1, 3.5, 7.5, 13, 20, 29, 40, 54], STR = [3.5, 8, 13.5, 20, 28, 37, 48];
    const zDir = endP ? -1 : 1, M = 44, zFar = endP ? Math.max(-46, ez - 120) : ez + 300;
    const mv = Math.hypot(...moonV), mvn = moonV.map((v) => v / mv);
    for (const sd of [-1, 1]) {
      const Pp = [], Ww = [];
      for (let j = 0; j < M; j++) {
        const dist = 1.5 * ((Math.abs(zFar - ez) / 1.5) ** (j / (M - 1))), z = ez + zDir * dist, row = [], wrow = [];
        for (const of of OFF) { const x = bend(z) + sd * (wv(z) + of), y = hgt(x, z); wrow.push([x, y, z]); row.push(pj(x, y, z) ? [PX, PY, ZC] : null); }
        Pp.push(row); Ww.push(wrow);
      }
      for (let j = M - 1; j > 0; j--) {
        const A = Pp[j], Bq = Pp[j - 1], WA = Ww[j], WB = Ww[j - 1];
        for (let m = OFF.length - 2; m >= 0; m--) {
          const a = A[m], b = A[m + 1], c = Bq[m + 1], e = Bq[m];
          if (!a || !b || !c || !e) continue;
          const u = [WA[m + 1][0] - WA[m][0], WA[m + 1][1] - WA[m][1], WA[m + 1][2] - WA[m][2]], v = [WB[m][0] - WA[m][0], WB[m][1] - WA[m][1], WB[m][2] - WA[m][2]];
          let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0]; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
          if (nx * -sd + ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const cx3 = (WA[m][0] + WB[m + 1][0]) / 2, cy3 = (WA[m][1] + WB[m + 1][1]) / 2, cz3 = (WA[m][2] + WB[m + 1][2]) / 2;
          const lam = Math.max(0, nx * mvn[0] + ny * mvn[1] + nz * mvn[2]), lsun = Math.max(0, nx * sunV[0] + ny * sunV[1] + nz * sunV[2]);
          const hsh = Math.sin(j * 12.9898 + m * 78.233 + sd * 3.1) * 43758.5453, vv = .84 + .16 * (hsh - Math.floor(hsh)), al = lerp(SAND, ROCK, c01((1 - ny) * 3)).map((q3) => q3 * vv);
          let L = [0, 1, 2].map((jj) => amb[jj] * (.7 + .3 * ny) + mC[jj] * lam * 1.25 + sunC[jj] * lsun * 1.15);
          for (const [fx, fy, fz, fk] of firePos) { if (fk <= 0) continue; const q2 = (cx3 - fx) ** 2 + (cz3 - fz) ** 2 + (cy3 - fy) ** 2; if (q2 > 900) continue; const ff = fk * 260 / (1 + q2 / 6) * Math.max(.2, nx * Math.sign(fx - cx3) * .5 + .5); L = [L[0] + ff, L[1] + ff * .58, L[2] + ff * .26]; }
          const aer2 = 1 - Math.exp(-((a[2] + e[2]) / 2) / fogL), col = [0, 1, 2].map((jj) => mix(al[jj] / 255 * L[jj], fogC[jj], aer2 * .9));
          g.fillStyle = g.strokeStyle = rgb(col); g.lineWidth = .9;
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(e[0], e[1]); g.closePath(); g.fill(); g.stroke();
        }
        // the strata: ledges at fixed heights, dark under the lip and lit along its top, converging down the valley
        for (const hs of STR) {
          const at = (row, wrow) => { for (let m = 0; m < OFF.length - 1; m++) { const h0 = wrow[m][1], h1 = wrow[m + 1][1]; if ((h0 - hs) * (h1 - hs) <= 0 && h1 !== h0 && row[m] && row[m + 1]) { const f = (hs - h0) / (h1 - h0); return [mix(row[m][0], row[m + 1][0], f), mix(row[m][1], row[m + 1][1], f), row[m][2]]; } } return null; };
          const p0 = at(A, WA), p1 = at(Bq, WB); if (!p0 || !p1) continue;
          const hs2 = Math.sin(j * 7.13 + hs * 3.7 + sd) * 9301.7, rnd = hs2 - Math.floor(hs2); if (rnd < .3) continue; // the ledges break off here and there
          const zz = (p0[2] + p1[2]) / 2, aer2 = 1 - Math.exp(-zz / fogL), lw = Math.max(.6, Math.min(2.4, F / zz * .07)) * (.6 + .6 * rnd);
          g.strokeStyle = `rgba(0,0,0,${(.14 + .22 * rnd) * (1 - aer2)})`; g.lineWidth = lw; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
          g.strokeStyle = rgb(lerp([150, 160, 190].map((q3) => q3 * (.35 + .65 * moonI) + 60 * (dawn + dusk)), fogC, aer2), .22 * (1 - aer2 * .7)); g.lineWidth = lw * .7;
          g.beginPath(); g.moveTo(p0[0], p0[1] - lw * 1.1); g.lineTo(p1[0], p1[1] - lw * 1.1); g.stroke();
        }
      }
    }

    // ----- the camp and the people, far to near -----
    const B = [];
    const lightAt = (x, z) => { let s2 = 0; for (const [fx, , fz, fk] of firePos) s2 += fk / (1 + ((x - fx) ** 2 + (z - fz) ** 2) / 14); return c01(s2); };
    TENTS.forEach((T) => { const y0 = hgt(T.x, T.z); if (!pj(T.x, y0, T.z)) return; const x = PX, y = PY, s = F / ZC, lt = lightAt(T.x, T.z); B.push([ZC, () => tent(g, x, y, s, T, lt)]); });
    WALLS.forEach((o) => { const y0 = hgt(o.x, o.z); if (!pj(o.x, y0, o.z)) return; const x = PX, y = PY, s = F / ZC, lt = lightAt(o.x, o.z); B.push([ZC, () => { const w2 = o.w * s, h2 = .7 * s; g.fillStyle = rgb(lerp([22, 20, 22], [96, 70, 50], lt)); g.beginPath(); g.moveTo(x - w2 / 2, y); for (let i = 0; i <= 8; i++) g.lineTo(x - w2 / 2 + i / 8 * w2, y - h2 * (.8 + .2 * Math.sin(i * 2.3 + o.z))); g.lineTo(x + w2 / 2, y); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(.5, s * .02); g.beginPath(); g.moveTo(x - w2 / 2, y - h2 * .45); g.lineTo(x + w2 / 2, y - h2 * .45); g.stroke(); }]); });
    firePos.forEach(([fx, fy, fz, fk], i) => { if (fk <= 0 || !pj(fx, fy - .6, fz)) return; const x = PX, y = PY, s = F / ZC; B.push([ZC, () => fire(g, x, y, s * .9, t, FIRES[i].ph, fk)]); });
    SEAT.forEach((o) => { // sitting round the fires, hunched, faceless
      const fk = firePos[o.f][3]; if (fk <= .05 || endP) return; const y0 = hgt(o.x, o.z); if (!pj(o.x, y0, o.z)) return;
      const x = PX, y = PY, s = F / ZC, side = Math.sign(FIRES[o.f].x - o.x) || 1;
      B.push([ZC, () => {
        g.fillStyle = '#0a0a0e'; g.beginPath();
        g.moveTo(x - s * .42, y); g.quadraticCurveTo(x - s * .44, y - s * .3, x - s * .2, y - s * .5);
        g.quadraticCurveTo(x - s * .16 + side * s * .05, y - s * .76, x + side * s * .06, y - s * .8);
        g.arc(x + side * s * .06, y - s * .86, s * .12, Math.PI * .9, Math.PI * 2.1);
        g.quadraticCurveTo(x + s * .26, y - s * .62, x + s * .26, y - s * .4); g.quadraticCurveTo(x + s * .46, y - s * .2, x + s * .42, y);
        g.closePath(); g.fill();
        g.strokeStyle = `rgba(255,160,80,${.55 * fk})`; g.lineWidth = Math.max(.6, s * .025); g.stroke();
      }]);
    });
    STONES.forEach(([sx2, sz, sr]) => { // stones and grit on the floor, near the camera
      const y0 = hgt(sx2, sz); if (!pj(sx2, y0, sz)) return; const s = F / ZC * sr; if (s < 1.4 || s > 26 || ZC > 60) return;
      const x = PX, y = PY, lt = lightAt(sx2, sz);
      B.push([ZC + 2, () => { g.fillStyle = 'rgba(14,12,14,.7)'; g.beginPath(); g.ellipse(x, y - s * .25, s, s * .45, 0, 0, TAU); g.fill(); g.fillStyle = rgb(lerp([70, 76, 100], [230, 150, 90], lt), .35 + .3 * Math.max(lt, moonI)); g.beginPath(); g.ellipse(x - s * .15, y - s * .45, s * .55, s * .16, 0, 0, TAU); g.fill(); }]);
    });
    const rimAt = (x, z) => { const l = lightAt(x, z); return l > .05 ? `rgba(255,170,90,${.55 * l})` : moonI > .2 ? `rgba(170,185,220,${.25 * moonI})` : null; };
    // the line up the valley at dusk, and out of it at dawn
    const inU = smooth(seg(p, -.06, .19)), inA = 1 - smooth(seg(p, .19, .23));
    const lineAt = (lead) => (o) => {
      const zz = lead[1] + o.dz, xx = bend(zz) + o.dx, y0 = hgt(xx, zz);
      if (!pj(xx, y0, zz)) return; const x = PX, y = PY, s = F / ZC;
      B.push([ZC, () => person(g, x, y, 1.72 * o.s * s, { k: o.k, walk: true, ph: o.ph + p * 30, rim: rimAt(xx, zz) })]);
    };
    if (inA > 0 && !endP) {
      const lead = [bend(mix(230, 22, inU)), mix(230, 22, inU)];
      g.globalAlpha = 1; FOLK.forEach(lineAt([lead[0], lead[1] + 1]));
      st.lead = lead;
    }
    if (endP) FOLK.forEach((o) => { const zz = pro[1] - 3 - o.dz * .9, xx = pro[0] + o.dx * .8, y0 = hgt(xx, zz); if (!pj(xx, y0, zz)) return; const x = PX, y = PY, s = F / ZC; const dk = Math.min(1, dawn * 1.3); B.push([ZC, () => person(g, x, y, 1.72 * o.s * s, { k: o.k, walk: true, ph: o.ph + p * 30, col: rgb(lerp([10, 10, 14], [44, 34, 36], dk)), rim: `rgba(255,200,160,${.35 * dawn})` })]); });
    // the seasons: twice a year (Rajab, Dhu al-Hijja) a few go down to the markets and come back (I'lam 1:126)
    if (!endP && yrs > 0 && yrs < 1) for (let k = 0; k < 8; k++) {
      const u = seg(yrs, k / 8 + .01, k / 8 + .07); if (u <= 0 || u >= 1) continue;
      const zl = mix(34, 236, Math.sin(Math.PI * u)), back = u > .5;
      for (let i = 0; i < 5; i++) {
        const zz = zl + (back ? -i : i) * 2.4, xx = bend(zz) + (i % 2 ? 1.1 : -.6), y0 = hgt(xx, zz); if (!pj(xx, y0, zz)) continue;
        const x = PX, y = PY, s = F / ZC; B.push([ZC, () => person(g, x, y, 1.72 * s, { k: i === 3 ? 'woman' : 'man', walk: true, ph: i * .3 + u * 40, rim: rimAt(xx, zz) })]);
      }
    }
    // the bed, the guard, the Prophet ﷺ
    let P = null, AT = null;
    if (!endP && p < .2) { P = [bend(mix(230, 22, inU)), mix(230, 22, inU) - 1.5, 'walk', p * 30]; AT = [P[0] + 1.1, P[1] + .4, 'walk']; }
    else if (!endP) { P = nightAt(p); AT = P[2] === 'walk' || P[2] === 'stand' ? [P[0] + 1, P[1] + .3, 'walk'] : [P[0] - 1.25, P[1] + .45, 'guard']; }
    else { P = [pro[0], pro[1], 'walk', p * 26]; AT = [pro[0] + 1.15, pro[1] - .5, 'walk']; }
    const bedOn = !endP && p >= .2;
    if (bedOn) BED.forEach(([bx, bz], i) => { // the mats, the one in use and the ones he is moved to
      const used = i === 0 ? p < .43 : i === 1 ? p > .41 && p < .5 : p > .48; if (!used && near < .5) return;
      const y0 = hgt(bx, bz) + .03, c = [[-1.05, -.42], [1.05, -.42], [1.05, .42], [-1.05, .42]].map(([dx, dz]) => (pj(bx + dx, y0, bz + dz) ? [PX, PY, ZC] : null));
      if (c.some((v) => !v)) return;
      const lt = lightAt(bx, bz);
      B.push([c[0][2] + .6, () => { g.fillStyle = rgb(lerp([38, 18, 16], [120, 52, 34], lt)); g.beginPath(); c.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = rgb(lerp([60, 44, 30], [190, 140, 80], lt), .7); g.lineWidth = Math.max(.6, F / c[0][2] * .03); g.beginPath(); for (let j = 1; j < 4; j++) { const f = j / 4; g.moveTo(mix(c[0][0], c[3][0], f), mix(c[0][1], c[3][1], f)); g.lineTo(mix(c[1][0], c[2][0], f), mix(c[1][1], c[2][1], f)); } g.stroke(); }]);
    });
    if (AT) {
      const y0 = hgt(AT[0], AT[1]);
      if (pj(AT[0], y0, AT[1])) { const x = PX, y = PY, s = F / ZC, lt = lightAt(AT[0], AT[1]); B.push([ZC, () => person(g, x, y, 1.8 * s, { k: 'man', walk: AT[2] === 'walk', ph: p * 30 + .3, sword: AT[2] === 'guard' || (p > .2 && p < .555), col: endP ? rgb(lerp([10, 10, 14], [44, 34, 36], dawn)) : '#0a0a0e', rim: endP ? `rgba(255,200,160,${.4 * dawn})` : rimAt(AT[0], AT[1]) || 'rgba(160,170,200,.15)', blade: `rgba(${lt > .1 ? '255,214,170' : '205,214,235'},${.65 + .3 * Math.max(lt, moonI)})` })]); }
    }
    if (P) {
      const y0 = hgt(P[0], P[1]);
      if (pj(P[0], y0, P[1])) {
        const x = PX, y = PY, s = F / ZC, lt = lightAt(P[0], P[1]);
        B.push([ZC - .01, () => {
          const amb2 = endP ? .45 + .4 * dawn : .22 + .3 * lt + (p < .2 ? .25 * dusk : 0), o = { who: 'prophet', pose: P[2] === 'walk' ? 'walk' : P[2], x, y, h: 1.76 * s, t, amb: amb2, phase: P[3], seed: 1 };
          Holy.draw(g, o);
        }]);
      }
    }
    B.sort((a, b) => b[0] - a[0]).forEach((b) => b[1]());

    // ----- the document in the Kaaba, close -----
    const docA = smooth(seg(p, .715, .755)) * (1 - smooth(seg(p, .879, .9)));
    if (docA > .002) {
      g.setTransform(d, 0, 0, d, 0, 0);
      g.globalAlpha = docA;
      q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, '#07070a'); q.addColorStop(1, '#0d0c10');
      g.fillStyle = q; g.fillRect(0, 0, W, H); // the kiswa: black cloth, a faint weave, the gold band of writing
      g.strokeStyle = 'rgba(255,255,255,.025)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x < W; x += 6) { g.moveTo(x, 0); g.lineTo(x + H * .05, H); } g.stroke();
      const by = H * (wide ? .9 : .94), bh = Math.max(18, H * .045);
      q = g.createLinearGradient(0, by, 0, by + bh); q.addColorStop(0, 'rgba(120,90,30,.9)'); q.addColorStop(.5, 'rgba(214,170,80,.95)'); q.addColorStop(1, 'rgba(120,90,30,.9)');
      g.fillStyle = q; g.fillRect(0, by, W, bh);
      g.strokeStyle = 'rgba(70,46,12,.7)'; g.lineWidth = 1.4; g.beginPath(); for (let x = 8; x < W; x += 22) { g.moveTo(x, by + bh * .75); g.quadraticCurveTo(x + 6, by + bh * .2, x + 13, by + bh * .7); } g.stroke(); // ornament, not writing
      const dw = wide ? Math.min(W * .3, H * .5) : Math.min(W * .66, H * .3), dh = dw * 1.32, dx = wide ? W * .38 - dw / 2 : W * .5 - dw / 2, dy = wide ? H * .5 - dh / 2 + H * .04 : H * .5;
      const sway = Math.sin(t * .7) * dw * .004;
      g.strokeStyle = 'rgba(150,120,80,.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(dx + dw * .2, dy); g.lineTo(dx + dw / 2, dy - dh * .12); g.lineTo(dx + dw * .8, dy); g.stroke();
      const eat = smooth(seg(p, .765, .86)), nm = smooth(seg(p, .845, .875));
      drawDoc(g, st, dx + sway, dy, dw, dh, eat, nm, t);
      g.globalAlpha = 1;
    }

    // dark edges
    g.setTransform(d, 0, 0, d, 0, 0);
    q = g.createRadialGradient(W * (wide ? .4 : .5), H * .55, Math.min(W, H) * .3, W * .5, H * .5, Math.max(W, H) * .8);
    q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = q; g.fillRect(0, 0, W, H);
  },
};
})();
