(() => {
// iqra: the first revelation, inside the cave of Hira, 27 Rajab, at forty. The camera sits at the back of the small
// granite cave; a narrow cleft on the left opens on the night sky toward Mecca (stars wheeling, far ridges, the
// valley's lamps). The Prophet ﷺ sits in contemplation (Holy.draw 'sit', veiled, gold disc). Then light enters by the
// cleft (Gabriel is never drawn: light only), falls onto him, and pulses five times as the five verses come (the DOM
// carries their exact text, one line each). It settles into a steady glow while the sky in the cleft turns toward
// dawn. Everything follows from p; t only twinkles stars and lamps, drifts motes and sways cloth.
//   p  0   → .22  night: the cave dark, the disc glowing, stars turning in the cleft            (Nahj 192)
//      .23 → .42  the light comes: the cleft pales, then blazes; a beam falls onto him           (al-Qummi 2:430)
//      .44 → .72  five pulses of light, one per verse                                           (al-'Alaq 1–5)
//      .72 → 1    the light settles; the cave stays lit; outside the night turns toward dawn    (Masar al-Shi'a 59)
// World units: a 1600 × 1000 box (the rock runs on past it); the camera covers the screen and keeps the cleft and
// him to the left of the caption column. The granite is painted twice into offscreen canvases (night, lit by the
// cleft) when the size changes; a frame cross-fades them and adds the light on top.
const VW = 1600, VH = 1000;
// the cleft: a ragged gap between two blocks, narrow at the top, leaning, its edges broken
const SL = [], SR = [];
{ const R = rng(913);
  for (let i = 0; i <= 9; i++) {
    const v = 64 + i * 550 / 9, u = i / 9, cx = 336 - u * 60, hw = 6 + 62 * u ** .9 * (1 - .2 * u ** 8);
    SL.push([cx - hw * (.72 + R() * .5) - (i % 3 === 1 ? 9 : 0), v + (R() - .5) * 22]);
    SR.push([cx + hw * (.72 + R() * .5) + (i % 3 === 2 ? 9 : 0), v + (R() - .5) * 22]);
  }
  SL[9][1] = SR[9][1] = 614; SL[0][1] = SR[0][1] = 64; }
const SLIT = [...SL, ...SR.slice().reverse()];
const SC = [318, 330]; // where the light stands in the cleft
const HZ = 470; // the horizon seen through the cleft
const PRO = { x: 720, y: 874, h: 520 };
const PK = [.455, .515, .575, .635, .695]; // the five verses (the DOM lines reveal at the same p)
const R0 = rng(4051);
const STARS = Array.from({ length: 1100 }, () => ({ R: 1470 + R0() * 720, a: (R0() - .5) * .9, r: .45 + R0() ** 3 * 1.9, al: .3 + R0() * .7, sp: .5 + R0() * 2, ph: R0() * TAU, warm: R0() < .14 }));
const MILKY = Array.from({ length: 46 }, (_, i) => ({ a: -.45 + i / 45 * .9, dr: (R0() - .5) * 90, s: 40 + R0() * 70, al: .03 + R0() * .05 }));
const LAMPS = Array.from({ length: 34 }, () => ({ x: 236 + R0() * 150, y: 528 + R0() * 34, a: .35 + R0() * .6, ph: R0() * TAU, r: .7 + R0() * 1.1 }));
const MOTES = Array.from({ length: 150 }, () => ({ u: R0(), v: R0() - .5, sp: .006 + R0() * .02, ph: R0() * TAU, r: .6 + R0() * 1.8 }));
// the granite: [x, y, rx, ry, rot, tone] back to front; tone darkens the nearer masses
const ROCKS = [
  [330, -40, 360, 150, .05, .9], [60, 330, 300, 430, .05, 1], [560, 300, 210, 270, -.15, 1], [840, 440, 250, 230, .1, 1],
  [1140, 450, 290, 250, -.1, 1], [1450, 430, 270, 290, .15, 1], [1010, 90, 560, 210, -.07, .85], [1560, 120, 430, 250, .1, .85],
  [240, 650, 210, 120, .05, .95], [1780, 520, 300, 460, 0, .8], [-200, 760, 260, 300, 0, .8],
];
const FRONT = [[-60, 1000, 340, 190, .2, .6], [1720, 1020, 430, 200, -.1, .6], [760, 1100, 560, 120, 0, .6], [60, -150, 470, 220, .1, .6], [1300, -170, 620, 220, -.08, .6]];
const FLOOR = [[-400, 700], [-100, 690], [236, 640], [420, 690], [700, 762], [1000, 742], [1300, 726], [1900, 704], [2100, 704], [2100, 1300], [-400, 1300]];
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hexc = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const poly = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };

// the camera: cover the screen; the Prophet at .42 of the width (wide) or .64 (phones, the cave in the lower half)
function camOf(w, h) {
  if (w >= 820 || w > h * 1.05) { const s = Math.max(w / VW, h / VH); return { s, ox: w * .42 - PRO.x * s, oy: (h - VH * s) / 2, wide: true }; }
  const s = w / 880; return { s, ox: w * .62 - PRO.x * s, oy: h - 975 * s, wide: false };
}
// a granite block: a chunky polygon, squarish, its faces flattened
function outline(b, R) {
  const [x, y, rx, ry, rot] = b, n = 12 + (R() * 6 | 0), pts = [], ph = [R() * TAU, R() * TAU];
  for (let i = 0; i < n; i++) {
    const a = (i + (R() - .5) * .5) / n * TAU, c = Math.cos(a), s = Math.sin(a);
    const k = 1 + .08 * Math.sin(a * 3 + ph[0]) + .05 * Math.sin(a * 5 + ph[1]) + (R() - .5) * .07;
    const lx = Math.sign(c) * Math.abs(c) ** .86 * rx * k, ly = Math.sign(s) * Math.abs(s) ** .86 * ry * k;
    pts.push([x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)]);
  }
  return pts;
}
const GRAN = hexc('#2f2824'), DEEP = hexc('#0a090b'), STAR = hexc('#4a5878'), WARM = hexc('#e2954a'), HOT = hexc('#ffdc96');
const RED = [74, 50, 40], GREY = [54, 54, 60];
// one block, painted for the night (mode 0) or for the light from the cleft (mode 1): a rounded mass, lit on the side
// that faces the cleft, its edges turning away into shadow, its face broken by a few planes, grain and cracks
function block(g, pts, tone, mode, R, k) {
  let cx = 0, cy = 0; pts.forEach(([x, y]) => { cx += x; cy += y; }); cx /= pts.length; cy /= pts.length;
  let rad = 0; pts.forEach(([x, y]) => { rad = Math.max(rad, Math.hypot(x - cx, y - cy)); });
  const dx = SC[0] - cx, dy = SC[1] - cy, dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
  const fall = 1 / (1 + ((Math.max(0, dist - rad * .5)) / 420) ** 2);
  const base = lerp3(lerp3(DEEP, GRAN, tone), R() < .5 ? RED : GREY, .3 * tone);
  const near = mode ? lerp3(base, lerp3(WARM, HOT, fall * .45), Math.min(.86, fall * 1.1) * tone) : lerp3(base, STAR, .3 * fall * tone);
  const far = mode ? lerp3(lerp3(base, DEEP, .45), WARM, .05) : lerp3(base, DEEP, .5);
  const path = new Path2D(); poly(path, pts);
  g.save(); // its shadow on the rock behind, thrown away from the light
  g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 50 * k; g.shadowOffsetX = -ux * 22 * k; g.shadowOffsetY = -uy * 22 * k;
  g.fillStyle = rgb(far); g.fill(path); g.restore();
  let q = g.createRadialGradient(cx + ux * rad * .5, cy + uy * rad * .5, rad * .05, cx + ux * rad * .3, cy + uy * rad * .3, rad * 1.4);
  q.addColorStop(0, rgb(near)); q.addColorStop(.45, rgb(lerp3(near, far, .45))); q.addColorStop(1, rgb(far));
  g.fillStyle = q; g.fill(path);
  g.save(); g.clip(path);
  // planes: a few faces a little lighter or darker, and the short creases between them
  for (let i = 0, n = 1 + (R() * 2 | 0); i < n; i++) {
    const a = R() * TAU, o = (R() - .5) * rad, nx = Math.cos(a), ny = Math.sin(a), px = cx + nx * o, py = cy + ny * o;
    const tx = -ny * rad * 3, ty = nx * rad * 3, lit = nx * ux + ny * uy > 0;
    g.beginPath(); g.moveTo(px - tx, py - ty); g.lineTo(px + tx, py + ty); g.lineTo(px + tx + nx * rad * 3, py + ty + ny * rad * 3); g.lineTo(px - tx + nx * rad * 3, py - ty + ny * rad * 3); g.closePath();
    g.fillStyle = lit && mode ? `rgba(255,210,150,${(.04 + R() * .06) * fall})` : `rgba(0,0,0,${.06 + R() * .09})`; g.fill();
    const l0 = (R() - .5) * rad * .8, l1 = l0 + rad * (.35 + R() * .5), ex = -ny, ey = nx;
    g.beginPath(); g.moveTo(px + ex * l0, py + ey * l0); g.quadraticCurveTo(px + ex * (l0 + l1) / 2 + nx * 6, py + ey * (l0 + l1) / 2 + ny * 6, px + ex * l1, py + ey * l1);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.3; g.stroke();
  }
  // granite grain: speckles of dark mica and pale feldspar
  const N = Math.min(1800, rad * rad / 45 | 0);
  for (let i = 0; i < N; i++) {
    const x = cx + (R() - .5) * rad * 2, y = cy + (R() - .5) * rad * 2, s = .8 + R() * 1.9, dk = R() < .6;
    g.fillStyle = dk ? `rgba(0,0,0,${.2 + R() * .25})` : (mode ? `rgba(255,222,180,${(.04 + R() * .1) * (.25 + fall)})` : `rgba(190,200,225,${.03 + R() * .06})`);
    g.fillRect(x, y, s, s);
  }
  for (let i = 0, n = R() * 2.2 | 0; i < n; i++) { // cracks, with a lit lip on the side toward the cleft
    let x = cx + (R() - .5) * rad, y = cy + (R() - .5) * rad, a = R() * TAU; const P = [[x, y]];
    for (let j = 0; j < 8; j++) { a += (R() - .5) * 1.2; x += Math.cos(a) * rad * .1; y += Math.sin(a) * rad * .1; P.push([x, y]); }
    g.beginPath(); P.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1.8; g.stroke();
    if (mode) { g.beginPath(); P.forEach(([x, y], j) => (j ? g.lineTo(x + ux * 2.2, y + uy * 2.2) : g.moveTo(x + ux * 2.2, y + uy * 2.2))); g.strokeStyle = `rgba(255,214,160,${.22 * fall})`; g.lineWidth = 1; g.stroke(); }
  }
  // the edges turn away into shadow: a soft dark band inside the outline
  g.filter = `blur(${Math.max(1, 14 * k)}px)`; g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 64; g.stroke(path); g.filter = 'none';
  g.restore();
  for (let i = 0; i < pts.length; i++) { // the rim that faces the cleft catches its light
    const a = pts[i], b = pts[(i + 1) % pts.length], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1;
    let nx = ey / L, ny = -ex / L; if (nx * (a[0] - cx) + ny * (a[1] - cy) < 0) { nx = -nx; ny = -ny; }
    const f = nx * ux + ny * uy;
    if (f < .2) continue;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
    g.strokeStyle = mode ? `rgba(255,220,160,${Math.min(.7, f * fall * .85 * tone)})` : `rgba(150,170,215,${f * fall * .2 * tone})`;
    g.lineWidth = mode ? 2 : 1.2; g.stroke();
  }
}
function paint(g, C, cs, mode) {
  const k = cs * C.s, R = rng(77);
  g.setTransform(k, 0, 0, k, cs * C.ox, cs * C.oy);
  const hole = new Path2D(); hole.rect(-600, -800, 2900, 2300); poly(hole, SLIT);
  g.save(); g.clip(hole, 'evenodd');
  g.fillStyle = rgb(mode ? lerp3(DEEP, GRAN, .25) : DEEP); g.fillRect(-600, -800, 2900, 2300);
  // the floor: a sloping slab, its top turned up to the light, darkest where it meets the wall
  const fp = new Path2D(); poly(fp, FLOOR);
  g.save(); g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 50 * k; g.shadowOffsetY = -12 * k; g.fillStyle = rgb(DEEP); g.fill(fp); g.restore();
  let q = g.createLinearGradient(0, 640, 0, 1050);
  if (mode) { q.addColorStop(0, rgb(lerp3(GRAN, WARM, .3))); q.addColorStop(.35, rgb(lerp3(GRAN, WARM, .12))); q.addColorStop(1, rgb(lerp3(DEEP, GRAN, .4))); }
  else { q.addColorStop(0, rgb(lerp3(GRAN, STAR, .14))); q.addColorStop(.4, rgb(lerp3(DEEP, GRAN, .65))); q.addColorStop(1, rgb(DEEP)); }
  g.fillStyle = q; g.fill(fp);
  g.save(); g.clip(fp);
  if (mode) { // where the beam lands, the floor is brightest
    q = g.createRadialGradient(620, 840, 10, 620, 840, 560); q.addColorStop(0, 'rgba(255,214,150,.42)'); q.addColorStop(.5, 'rgba(255,214,150,.12)'); q.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = q; g.fillRect(0, 600, 1400, 500);
  }
  for (let i = 0; i < 22; i++) { // strata: short broken ledges
    const y = 700 + R() * 330, x0 = -300 + R() * 2100, L = 120 + R() * 380;
    g.beginPath(); g.moveTo(x0, y);
    for (let x = x0; x <= x0 + L; x += 40) g.lineTo(x, y + Math.sin(x * .01 + i) * 5 + (R() - .5) * 5);
    g.strokeStyle = `rgba(0,0,0,${.2 + R() * .25})`; g.lineWidth = 1.2 + R() * 1.6; g.stroke();
  }
  for (let i = 0; i < 2800; i++) { const x = -300 + R() * 2300, y = 640 + R() * 460, s = .8 + R() * 1.9; g.fillStyle = R() < .6 ? `rgba(0,0,0,${.16 + R() * .25})` : (mode ? `rgba(255,222,180,${.05 + R() * .09})` : `rgba(180,190,215,${.03 + R() * .05})`); g.fillRect(x, y, s, s); }
  g.beginPath(); FLOOR.slice(0, 9).forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.filter = `blur(${Math.max(1, 18 * k)}px)`; g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = 80; g.stroke(); g.filter = 'none';
  g.restore();
  ROCKS.forEach((b) => block(g, outline(b, R), b[5], mode, R, k)); // the blocks stand on the floor
  for (let i = 0; i < 30; i++) { // stones on the floor
    const x = -100 + R() * 1900; if (Math.abs(x - PRO.x) < 230) continue;
    const y = 750 + R() * 250, r = 10 + R() * 34 * (y / 900);
    block(g, outline([x, y, r * 1.4, r * .75, (R() - .5) * .4], R), .8, mode, R, k);
  }
  FRONT.forEach((b) => block(g, outline(b, R), b[5], mode, R, k));
  if (mode) { // the light thins with distance from the cleft: the far side of the cave keeps its dark
    q = g.createRadialGradient(SC[0], SC[1] + 200, 200, SC[0], SC[1] + 200, 1500);
    q.addColorStop(0, 'rgba(8,6,6,0)'); q.addColorStop(.55, 'rgba(8,6,6,.3)'); q.addColorStop(1, 'rgba(8,6,6,.7)');
    g.fillStyle = q; g.fillRect(-600, -800, 2900, 2300);
  }
  g.restore();
  // the cleft's own wall, seen edge-on inside its right side, and its sill
  const jamb = [...SR.map(([x, y]) => [x + 1, y]), ...SR.slice().reverse().map(([x, y], i) => [x - 9 - 7 * Math.sin(i * .9), y + 4])];
  q = g.createLinearGradient(260, 0, 390, 0);
  q.addColorStop(0, rgb(mode ? lerp3(GRAN, HOT, .8) : lerp3(DEEP, STAR, .3))); q.addColorStop(1, rgb(mode ? lerp3(GRAN, WARM, .45) : DEEP));
  g.beginPath(); poly(g, jamb); g.fillStyle = q; g.fill();
  g.beginPath(); g.moveTo(SL[9][0] - 4, 616); g.lineTo(SR[9][0] + 4, 616); g.lineTo(SR[8][0] - 2, 598); g.lineTo(SL[8][0] + 6, 600); g.closePath();
  g.fillStyle = rgb(mode ? lerp3(GRAN, HOT, .55) : lerp3(DEEP, STAR, .22)); g.fill();
  g.beginPath(); poly(g, SLIT); g.strokeStyle = mode ? 'rgba(255,232,190,.55)' : 'rgba(140,160,205,.3)'; g.lineWidth = mode ? 1.6 : 1.2; g.stroke();
}
function build(st, w, h, d, C) {
  const cs = Math.min(d, Math.sqrt(3.4e6 / (w * h)));
  const mk = () => { const c = document.createElement('canvas'); c.width = Math.ceil(w * cs); c.height = Math.ceil(h * cs); return c; };
  st.rk = [mk(), mk()];
  st.rk.forEach((c, m) => paint(c.getContext('2d'), C, cs, m));
  st.key = `${w}x${h}x${d}`;
}

// the sky in the cleft: night to dawn, stars wheeling, far ridges and Mecca's lamps; the light washes it white
function sky(g, p, t, dawn, glare) {
  g.save(); g.beginPath(); poly(g, SLIT); g.clip();
  const N = [hexc('#02040a'), hexc('#07101f'), hexc('#111c2e')], D = [hexc('#101d3b'), hexc('#34426e'), hexc('#d9946a')];
  let q = g.createLinearGradient(0, 40, 0, HZ + 10);
  q.addColorStop(0, rgb(lerp3(N[0], D[0], dawn))); q.addColorStop(.6, rgb(lerp3(N[1], D[1], dawn))); q.addColorStop(1, rgb(lerp3(N[2], D[2], dawn)));
  g.fillStyle = q; g.fillRect(200, 40, 220, 600);
  const rot = (p - .5) * .32, sa = c01(1 - dawn * 1.15) * (1 - .9 * glare);
  if (sa > .01) {
    g.globalCompositeOperation = 'lighter';
    for (const m of MILKY) { // the faint band of the galaxy
      const a = m.a + rot, R = 1760 + m.dr + 220 * Math.sin(m.a * 5), x = 300 + R * Math.sin(a), y = -1500 + R * Math.cos(a);
      if (x < 160 || x > 460 || y > HZ + 60) continue;
      const gq = g.createRadialGradient(x, y, 0, x, y, m.s); gq.addColorStop(0, `rgba(170,180,215,${m.al * sa})`); gq.addColorStop(1, 'rgba(170,180,215,0)');
      g.fillStyle = gq; g.fillRect(x - m.s, y - m.s, m.s * 2, m.s * 2);
    }
    for (const s of STARS) {
      const a = s.a + rot, x = 300 + s.R * Math.sin(a), y = -1500 + s.R * Math.cos(a);
      if (x < 230 || x > 390 || y > HZ) continue;
      const al = s.al * sa * (.6 + .4 * Math.sin(t * s.sp + s.ph)) * c01((HZ - y) / 60);
      g.fillStyle = s.warm ? `rgba(255,214,170,${al})` : `rgba(235,238,255,${al})`;
      g.beginPath(); g.arc(x, y, s.r, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  // the ridges beyond, and the valley of Mecca with its lamps
  const ridge = (y0, amp, f, ph, col) => {
    g.beginPath(); g.moveTo(200, 700);
    for (let x = 200; x <= 420; x += 4) g.lineTo(x, y0 - amp * (.6 * Math.sin(x * f + ph) + .4 * Math.sin(x * f * 2.7 + ph * 1.3)));
    g.lineTo(420, 700); g.closePath(); g.fillStyle = col; g.fill();
  };
  ridge(HZ + 6, 12, .03, 1.2, rgb(lerp3(hexc('#141c2a'), hexc('#5a5068'), dawn)));
  ridge(HZ + 34, 16, .045, 3.1, rgb(lerp3(hexc('#0c111b'), hexc('#3a3448'), dawn)));
  for (const l of LAMPS) {
    const a = l.a * (.7 + .3 * Math.sin(t * 1.4 + l.ph)) * (1 - .7 * dawn) * (1 - glare);
    if (a < .02) continue;
    g.fillStyle = `rgba(255,200,120,${a})`; g.beginPath(); g.arc(l.x, l.y, l.r, 0, TAU); g.fill();
  }
  ridge(HZ + 92, 22, .028, .4, rgb(lerp3(hexc('#07090e'), hexc('#211d27'), dawn)));
  if (glare > 0) { // the light: white at its heart, gold toward the edges of the cleft
    q = g.createRadialGradient(SC[0], SC[1] - 60, 10, SC[0], SC[1], 340);
    q.addColorStop(0, `rgba(255,250,232,${Math.min(1, glare * 1.15)})`); q.addColorStop(.5, `rgba(255,228,170,${Math.min(1, glare)})`); q.addColorStop(1, `rgba(255,200,120,${glare * .9})`);
    g.globalCompositeOperation = 'lighter'; g.fillStyle = q; g.fillRect(200, 40, 220, 600); g.globalCompositeOperation = 'source-over';
  }
  g.restore();
}

S.iqra = {
  init(el, st) { st.cv = el.querySelector('.cv'); st.g = st.cv.getContext('2d'); },
  frame(p, t, el, st) {
    const cv = st.cv;
    fit(cv);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (w < 2 || h < 2) return;
    const g = st.g, d = cv.width / w, C = camOf(w, h);
    if (st.key !== `${w}x${h}x${d}`) build(st, w, h, d, C);

    // the timeline
    const lin = smooth(seg(p, .225, .37)), dawn = smooth(seg(p, .72, 1.02)), settle = smooth(seg(p, .72, .88));
    let pulse = 0, steps = 0;
    PK.forEach((k) => {
      const u = (p - k) / .055;
      if (u > -.25 && u < 1) pulse += u < 0 ? smooth((u + .25) / .25) : (1 - u) ** 2;
      steps += smooth(seg(p, k - .01, k + .03));
    });
    const glare = Math.min(1, lin * (1 - settle) + .4 * pulse * (1 - settle)); // the cleft ablaze
    const miracle = Math.min(1, lin * (1 - .72 * settle) + .4 * pulse * (1 - settle)); // the light inside the cave
    const lit = c01(.5 * lin + .04 * steps + .06 * dawn * lin);
    const z = 1 + .07 * ease.io(seg(p, 0, 1)), fx = C.ox + PRO.x * C.s, fy = C.oy + 600 * C.s;
    const V = () => g.setTransform(d * z * C.s, 0, 0, d * z * C.s, d * (fx + (C.ox - fx) * z), d * (fy + (C.oy - fy) * z));

    g.setTransform(d, 0, 0, d, 0, 0);
    g.fillStyle = '#050608'; g.fillRect(0, 0, w, h);
    V(); sky(g, p, t, dawn, glare);
    g.setTransform(d * z, 0, 0, d * z, d * (fx - fx * z), d * (fy - fy * z));
    g.drawImage(st.rk[0], 0, 0, w, h);
    if (lit > .003) { g.globalAlpha = lit; g.drawImage(st.rk[1], 0, 0, w, h); g.globalAlpha = 1; }
    V();

    // the light inside: a bloom about the cleft, the beam onto him, the pool on the floor, a wave per verse
    g.globalCompositeOperation = 'lighter';
    if (miracle > .002) {
      const bl = Math.max(glare, miracle * .4);
      let q = g.createRadialGradient(SC[0], SC[1], 20, SC[0], SC[1], 620);
      q.addColorStop(0, `rgba(255,228,170,${.42 * bl})`); q.addColorStop(.35, `rgba(255,210,140,${.14 * bl})`); q.addColorStop(1, 'rgba(255,200,130,0)');
      g.fillStyle = q; g.fillRect(SC[0] - 620, SC[1] - 620, 1240, 1240);
      const A = [262, 200], B = [380, 410], Cc = [540, 910], Dd = [1010, 862]; // the beam, from the cleft down onto him
      q = g.createLinearGradient(330, 300, 760, 890);
      q.addColorStop(0, `rgba(255,236,190,${.3 * miracle})`); q.addColorStop(.6, `rgba(255,222,165,${.14 * miracle})`); q.addColorStop(1, `rgba(255,214,150,${.05 * miracle})`);
      g.fillStyle = q;
      for (let i = 0; i < 8; i++) {
        const f = i / 8, m = (a, b) => [a[0] + (b[0] - a[0]) * f * .5, a[1] + (b[1] - a[1]) * f * .5];
        const a = m(A, B), b = m(B, A), c = m(Cc, Dd), e = m(Dd, Cc);
        g.globalAlpha = .2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(e[0], e[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill();
      }
      for (let i = 0; i < 7; i++) { // shafts within the beam, breathing slowly
        const f = (i + .5) / 7, a0 = [mix(A[0], B[0], f), mix(A[1], B[1], f)], a1 = [mix(Cc[0], Dd[0], f), mix(Cc[1], Dd[1], f)], wd = 5 + 9 * ((i * 7) % 3);
        g.globalAlpha = .45 + .35 * Math.sin(t * .4 + i * 2.1);
        g.beginPath(); g.moveTo(a0[0] - wd * .4, a0[1]); g.lineTo(a0[0] + wd * .4, a0[1]); g.lineTo(a1[0] + wd * 3, a1[1]); g.lineTo(a1[0] - wd * 3, a1[1]); g.closePath(); g.fill();
      }
      g.globalAlpha = 1;
    }
    const pool = .3 * lit + .5 * miracle;
    if (pool > .003) {
      g.save(); g.translate(PRO.x - 40, PRO.y + 4); g.scale(1, .2);
      const q = g.createRadialGradient(0, 0, 0, 0, 0, 380); q.addColorStop(0, `rgba(255,220,160,${.5 * pool})`); q.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = q; g.fillRect(-380, -380, 760, 760); g.restore();
    }
    PK.forEach((k) => { // the wave: a ring of light out of the cleft, over the rock and past him
      const u = seg(p, k - .004, k + .05);
      if (u <= 0 || u >= 1) return;
      const r = 60 + 1500 * ease.out(u), a = .28 * Math.sin(Math.PI * u) * (1 - u * .5), rr = r + 120;
      const q = g.createRadialGradient(SC[0], SC[1], 0, SC[0], SC[1], rr);
      q.addColorStop(Math.max(0, (r - 140) / rr), 'rgba(255,220,160,0)'); q.addColorStop(r / rr, `rgba(255,226,170,${a})`); q.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = q; g.fillRect(SC[0] - rr, SC[1] - rr, rr * 2, rr * 2);
    });
    g.globalCompositeOperation = 'source-over';

    // the Prophet ﷺ, seated, and his shadow thrown away from the cleft
    if (lit > .02) {
      g.save(); g.translate(PRO.x + 150, PRO.y + 2); g.scale(1, .12);
      const q = g.createRadialGradient(0, 0, 0, 0, 0, 260); q.addColorStop(0, `rgba(0,0,0,${.55 * lit})`); q.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = q; g.fillRect(-260, -260, 520, 520); g.restore();
    }
    const amb = .2 + .58 * lit, o = { who: 'prophet', pose: 'sit', x: PRO.x, y: PRO.y, h: PRO.h, t, amb, glow: .95 - .4 * lit, seed: 2, };
    const hd = Holy.head(o);
    g.globalCompositeOperation = 'lighter'; // the disc's own quiet light on the dark rock, before the light comes
    let q = g.createRadialGradient(hd.x, hd.y, hd.r, hd.x, hd.y, hd.r * 11);
    q.addColorStop(0, `rgba(255,214,150,${.16 * (1 - lit * .6)})`); q.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = q; g.fillRect(hd.x - hd.r * 11, hd.y - hd.r * 11, hd.r * 22, hd.r * 22);
    g.globalCompositeOperation = 'source-over';
    Holy.draw(g, o);
    if (miracle > .01) { // the beam's light on his left side
      g.globalCompositeOperation = 'lighter';
      q = g.createRadialGradient(PRO.x - 120, PRO.y - 260, 10, PRO.x - 120, PRO.y - 260, 330);
      q.addColorStop(0, `rgba(255,226,170,${.16 * miracle})`); q.addColorStop(1, 'rgba(255,226,170,0)');
      g.fillStyle = q; g.fillRect(PRO.x - 450, PRO.y - 590, 660, 660);
      g.globalCompositeOperation = 'source-over';
    }

    // motes adrift in the beam
    const ma = Math.min(1, miracle * 1.3 + lit * .25);
    if (ma > .01) {
      g.globalCompositeOperation = 'lighter';
      for (const m of MOTES) {
        const u = (m.u + t * m.sp + p * .6) % 1, x = mix(320, 780, u) + m.v * mix(90, 380, u) + Math.sin(t * .7 + m.ph) * 8, y = mix(300, 880, u) + Math.cos(t * .5 + m.ph) * 6;
        const a = ma * (.25 + .5 * Math.sin(t * 1.3 + m.ph) ** 2) * Math.sin(Math.PI * u);
        g.fillStyle = `rgba(255,230,180,${a})`; g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }

    // the dark of the cave closes in at the edges
    g.setTransform(d, 0, 0, d, 0, 0);
    q = g.createRadialGradient(w * (C.wide ? .36 : .5), h * (C.wide ? .55 : .72), Math.min(w, h) * .2, w * .5, h * .5, Math.max(w, h) * .85);
    q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, `rgba(0,0,0,${.7 - .25 * lit})`);
    g.fillStyle = q; g.fillRect(0, 0, w, h);
  },
};
})();
