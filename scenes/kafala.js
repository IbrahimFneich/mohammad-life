(() => {
// kafala: the orphan child and his shelter, one night landscape the camera travels across from right to left. Yathrib
// among its palms, where his father lies (a grave and a name); the road south to al-Abwa', a lone grave under a low moon
// (his mother: a grave and a name); Mecca by the Kaaba, where his grandfather sits, and then his place is empty; the
// house of Abu Talib, whose lit doorway takes him in. The child Prophet is drawn only by Holy.draw (veiled, the gold
// disc); the grandfather and Abu Talib are faceless cloaked silhouettes; the father and mother are names only.
// A side view in metres: x to the right of the frame, y up, z away from the camera; the child walks the path at z = 8.
// Everything follows from p; t moves only the stars, fronds, flames and cloth.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sprite = (stops, n = 128) => { const c = mk(n, n), g = c.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, s]) => gr.addColorStop(o, s)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };
const CAMY = 1.45, ZC = 8; // eye height; the depth of the path
// The brief asks for Abd al-Muttalib as a faceless seated silhouette; the scene contract says ancestors are names only.
// false leaves his mat and his name without the figure.
const SHOW_GRANDFATHER = true;

// the four places along x
const SX = [0, -40, -80, -118];
const GRAVE1 = -1.6, GRAVE2 = -42, SEAT = -81.4, DOOR = -118.6;
// the child's x through the scene: [p, x]; he walks between the keys whose x differ and stands where they agree
const KX = [[-.06, 6.5], [.07, 0], [.19, 0], [.3, -40.2], [.44, -40.2], [.53, -79.8], [.71, -79.8], [.81, -116.6], [.845, -116.6], [.885, DOOR]];
function childAt(p) {
  if (p <= KX[0][0]) return { x: KX[0][1], walk: false, d: 0 };
  let d = 0;
  for (let i = 1; i < KX.length; i++) {
    const [p0, x0] = KX[i - 1], [p1, x1] = KX[i];
    if (p < p1) { const k = (p - p0) / (p1 - p0), e = x0 === x1 ? 0 : k < .12 ? k * k / .24 : k > .88 ? 1 - (1 - k) ** 2 / .24 : (k - .06) / .88; return { x: mix(x0, x1, e), walk: x0 !== x1 && k > .01 && k < .99, d: d + Math.abs(x1 - x0) * e }; }
    d += Math.abs(x1 - x0);
  }
  return { x: KX[KX.length - 1][1], walk: false, d };
}
// palettes: [sky top, sky mid, horizon, far ridge, mid hills, ground far, ground near, haze]
const PALS = [
  [[5, 12, 22], [12, 30, 44], [36, 62, 72], [22, 38, 48], [10, 22, 26], [34, 46, 48], [12, 18, 20], [40, 64, 72]], // Yathrib: the palms, a green night
  [[7, 9, 24], [20, 24, 54], [66, 68, 98], [40, 44, 72], [24, 26, 42], [84, 84, 104], [30, 30, 40], [72, 72, 100]], // al-Abwa': moonlit sand
  [[6, 7, 16], [16, 18, 34], [50, 44, 58], [30, 28, 42], [17, 15, 23], [58, 50, 50], [22, 18, 20], [52, 46, 60]], // Mecca: dark rock
  [[4, 5, 12], [12, 13, 26], [38, 32, 42], [24, 22, 32], [14, 12, 18], [48, 40, 38], [18, 14, 14], [40, 34, 44]], // the house of Abu Talib
];
function palAt(cx) {
  let u = 0; for (let i = 0; i < 3; i++) if (cx < SX[i]) u = i + c01((SX[i] - cx) / (SX[i] - SX[i + 1]));
  const i = Math.min(2, Math.floor(u)), k = smooth(c01((u - i - .25) / .5));
  return PALS[i].map((c, j) => lerp(c, PALS[i + 1][j], k));
}
// the hills behind: height (m) of the middle range at x, by place
const hillH = (x) => {
  const n = Math.sin(x * .09 + 1) * .5 + Math.sin(x * .23 + 2) * .3 + Math.sin(x * .61) * .15;
  const mecca = smooth(c01((-x - 74) / 10)) * (1 - smooth(c01((-x - 112) / 20)));
  const abwa = Math.exp(-(((x + 52) / 16) ** 2)); // the open plain of al-Abwa': the hills fall away under the moon
  return (4 + 3 * n) * (1 - .55 * abwa) + mecca * (16 + 9 * Math.abs(Math.sin(x * .17)) + 6 * n);
};
const farH = (x) => 14 + 8 * Math.sin(x * .021 + 1.3) + 5 * Math.sin(x * .057) + 3 * Math.abs(Math.sin(x * .13));

S.kafala = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.c = st.cv.getContext('2d');
    st.names = [...el.querySelectorAll('.kf-names li')];
    st.glow = sprite([[0, 'rgba(255,255,255,1)'], [.2, 'rgba(255,255,255,.5)'], [.5, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]);
    st.warm = sprite([[0, 'rgba(255,196,120,.9)'], [.3, 'rgba(255,170,96,.35)'], [1, 'rgba(255,150,80,0)']]);
    st.moonG = sprite([[0, 'rgba(220,226,255,.5)'], [.25, 'rgba(200,210,240,.16)'], [1, 'rgba(190,200,240,0)']]);
    const R = rng(661);
    st.stars = Array.from({ length: 320 }, () => [R(), R() ** 1.6, R()]);
    // things in the land: [kind, x, z, size, seed]
    const O = [];
    for (let i = 0; i < 52; i++) { const x = -17 + R() * 40, z = 11 + R() ** 1.3 * 70; O.push(['palm', x, z, .85 + R() * .45, R()]); } // the palms of Yathrib
    [[-9, 4.2], [7.5, 3.6], [15, 4.6]].forEach(([x, z]) => O.push(['palm', x, z, 1, R()])); // trunks close to the eye, clear of the grave
    for (let i = 0; i < 70; i++) { const x = -126 + R() * 160, z = 9.5 + R() * 34; if (Math.abs(x - GRAVE2) < 4 || Math.abs(x - GRAVE1) < 3 || (x < -60 && x > -125 && z < 16)) continue; O.push(['rock', x, z, .2 + R() ** 2 * .9, R()]); }
    for (let i = 0; i < 40; i++) { const x = -102 + R() * 32, z = 24 + R() * 22; if (Math.abs(x + 84) < 9) continue; O.push(['house', x, z, 3.6 + R() * 3.4, R()]); } // Mecca round the House
    for (let i = 0; i < 14; i++) O.push(['house', -134 + R() * 10 + (i % 2 ? 14 : 0), 13 + R() * 16, 4 + R() * 4, R()]); // the lane of Abu Talib's house
    O.push(['kaaba', -84, 48, 1, 0]);
    O.push(['grave', GRAVE1, 9.6, 1, .2]); O.push(['grave', GRAVE2, 9.6, 1.04, .7]);
    O.push(['mat', SEAT, 8.6, 1, 0]);
    O.push(['abode', DOOR, 9.9, 1, 0]);
    O.sort((a, b) => b[2] - a[2]);
    st.O = O;
    st.rip = Array.from({ length: 420 }, () => [-130 + R() * 150, 5 + R() ** 1.5 * 40, R()]);
  },

  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st;
    const dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const F = H * (phone ? .95 : 1.02), hy = H * (phone ? .6 : .57);
    // ----- the child and the camera -----
    const ch = childAt(p);
    const inDoor = smooth(seg(p, .845, .885)); // he steps up into the doorway, a little back from the path
    const czc = mix(ZC, 9.55, inDoor);
    const aimX = phone ? .5 : .4; // the child's place across the frame; the words keep the right
    // the camera holds the place at each station and travels with the child between
    const hold = [[SX[0] - (phone ? .9 : .4), .07, .19], [SX[1] - (phone ? 1.1 : 1), .3, .44], [SX[2] - (phone ? .9 : .6), .53, .71], [DOOR + (phone ? .2 : .9), .81, 1.1]];
    let camX = ch.x - (aimX - .5) * W / F * ZC;
    hold.forEach(([x, a, b]) => { const k = smooth(seg(p, a - .03, a + .02)) * (1 - smooth(seg(p, b - .01, b + .04))); camX = mix(camX, x - (aimX - .5) * W / F * ZC, k); });
    const PX = (x, z) => W / 2 + (x - camX) * F / z, PY = (y, z) => hy - (y - CAMY) * F / z;
    const [skT, skM, skH, farC, midC, g0, g1, hz] = palAt(camX + (aimX - .5) * W / F * ZC);
    const warmK = smooth(seg(p, .8, .95)); // the house fills with light
    // ----- sky -----
    const sg = c.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, rgb(skT)); sg.addColorStop(.55, rgb(skM)); sg.addColorStop(1, rgb(skH));
    c.fillStyle = sg; c.fillRect(0, 0, W, hy + 2);
    // stars, a little drift across the night
    const sa = .85 - .25 * c01((-camX - 30) / 40) * (1 - c01((-camX - 70) / 30));
    c.fillStyle = '#eef0ff';
    st.stars.forEach(([u, v, k], i) => {
      const x = ((u * 1.4 - camX * .0025 + p * .02) % 1.4 + 1.4) % 1.4 * W - W * .2, y = v * hy * .92;
      c.globalAlpha = sa * (.15 + .7 * k * k) * (.65 + .35 * Math.sin(t * (1 + k * 2) + i)) * (1 - c01((y - hy * .7) / (hy * .3)) * .7);
      const s = k > .93 ? 1.8 : k > .6 ? 1.2 : .9; c.fillRect(x, y, s, s);
    });
    c.globalAlpha = 1;
    // the moon: low over al-Abwa', setting as the night goes on
    {
      const mz = 400, my = 56 - 70 * smooth(seg(p, .46, .84)), mx = PX(-166, mz), myS = PY(my, mz), r = Math.min(W, H) * (phone ? .05 : .042);
      if (mx > -r * 8 && mx < W + r * 8) {
        c.globalCompositeOperation = 'lighter';
        const gr = r * 9; c.globalAlpha = .9; c.drawImage(st.moonG, mx - gr, myS - gr, gr * 2, gr * 2); c.globalAlpha = 1;
        c.globalCompositeOperation = 'source-over';
        const mg = c.createRadialGradient(mx - r * .3, myS - r * .3, r * .1, mx, myS, r);
        mg.addColorStop(0, '#fbf6e6'); mg.addColorStop(1, '#d8d2bc'); c.fillStyle = mg; c.beginPath(); c.arc(mx, myS, r, 0, TAU); c.fill();
        c.fillStyle = 'rgba(150,146,130,.28)'; [[-.3, -.2, .28], [.25, .15, .2], [.05, .4, .14]].forEach(([a, b, q]) => { c.beginPath(); c.arc(mx + a * r, myS + b * r, q * r, 0, TAU); c.fill(); });
      }
      st.moon = [mx, myS, my];
    }
    // the far ridge and the middle hills: depth bands with haze
    const ridge = (z, hf, col, top) => {
      const x0 = camX - W / 2 / F * z - 2, x1 = camX + W / 2 / F * z + 2, n = Math.ceil(W / 6);
      c.beginPath(); c.moveTo(-2, H);
      for (let i = 0; i <= n; i++) { const x = mix(x0, x1, i / n); c.lineTo(PX(x, z), PY(hf(x), z)); }
      c.lineTo(W + 2, H); c.closePath();
      const g = c.createLinearGradient(0, PY(top, z), 0, hy + 4); g.addColorStop(0, rgb(col)); g.addColorStop(1, rgb(lerp(col, hz, .55))); c.fillStyle = g; c.fill();
    };
    ridge(420, (x) => farH(x * .6) * 1.9 + 4, lerp(farC, skH, .35), 40);
    ridge(150, (x) => (farH(x * 1.7 + 40) * .9) * (1 - .45 * Math.exp(-(((x + 44) / 30) ** 2))) + hillH(x * .4 - 20) * .5, farC, 26);
    ridge(62, hillH, midC, 14);
    // moonlight on the hills' crest (the moon sits to the left of the frame's centre for most of the way)
    // ----- the ground -----
    const gg = c.createLinearGradient(0, hy, 0, H);
    gg.addColorStop(0, rgb(lerp(g0, hz, .4))); gg.addColorStop(.25, rgb(g0)); gg.addColorStop(1, rgb(g1));
    c.fillStyle = gg; c.fillRect(0, hy, W, H - hy);
    // the path: a paler worn band where the child walks
    {
      const y0 = PY(0, ZC + 1.3), y1 = PY(0, ZC - .9);
      const pg = c.createLinearGradient(0, y0, 0, y1); pg.addColorStop(0, rgb(lerp(g0, [200, 200, 210], .08), 0)); pg.addColorStop(.5, rgb(lerp(g0, [210, 206, 214], .14), .55)); pg.addColorStop(1, rgb(lerp(g0, [210, 206, 214], .1), 0));
      c.fillStyle = pg; c.fillRect(0, y0, W, y1 - y0);
    }
    // ripples in the sand
    c.lineWidth = 1;
    c.strokeStyle = rgb(lerp(g0, [220, 220, 236], .25), .22); c.beginPath();
    st.rip.forEach(([x, z, k]) => { const X = PX(x, z); if (X < -40 || X > W + 40) return; const Y = PY(0, z), L = (.3 + k * .6) * F / z; c.moveTo(X - L, Y); c.quadraticCurveTo(X, Y - L * .08, X + L, Y); });
    c.stroke();
    // footprints: the last steps behind the walking child
    {
      c.fillStyle = rgb(lerp(g1, [0, 0, 0], .35), .5);
      for (let k = 1; k < 26; k++) {
        const x = ch.x + k * .38; if (ch.d < k * .38 + .1 || x > KX[0][1]) break;
        const fa = 1 - k / 26, z = ZC + (k % 2 ? .12 : -.12), X = PX(x, z); if (X < -10 || X > W + 10) continue;
        c.globalAlpha = fa * .7 * (1 - inDoor); c.beginPath(); c.ellipse(X, PY(0, z), .07 * F / z, .025 * F / z, 0, 0, TAU); c.fill();
      }
      c.globalAlpha = 1;
    }

    // ----- the things in the land, far to near -----
    const moonX = st.moon[0], moonUp = c01(st.moon[2] / 4);
    const shade = (z, base, k = .55) => rgb(lerp(base, hz, Math.min(.75, (z - 6) / 90 * k + .05)));
    const sil = lerp(g1, [0, 0, 0], .55);
    const gfX = PX(SEAT, ZC + .6), gfY = PY(0, ZC + .6);
    const gone = smooth(seg(p, .625, .67)); // the grandfather's place falls empty
    const labels = [];
    const drawObj = ([kind, x, z, sz, seed]) => {
      const X = PX(x, z), Y = PY(0, z), s = F / z;
      if (X < -14 * s || X > W + 14 * s) return;
      if (kind === 'palm') {
        const h = (6 + seed * 4) * sz * s, lean = (seed - .5) * .3, near = z < 6;
        const tx = X + lean * h, ty = Y - h, base = near ? lerp(sil, [0, 0, 0], .4) : lerp(lerp(midC, [4, 12, 9], .55), hz, Math.min(.7, (z - 6) / 110)), col = rgb(base);
        const w0 = .27 * s * sz, w1 = .17 * s * sz, mx2 = X + lean * h * .2;
        c.fillStyle = col; c.beginPath(); c.moveTo(X - w0, Y); c.quadraticCurveTo(mx2 - w0 * .8, Y - h * .55, tx - w1, ty); c.lineTo(tx + w1, ty); c.quadraticCurveTo(mx2 + w0 * .8, Y - h * .55, X + w0, Y); c.closePath(); c.fill();
        if (w0 > 3) { c.strokeStyle = rgb(lerp(base, [0, 0, 0], .35)); c.lineWidth = Math.max(1, .03 * s); c.beginPath(); for (let k = .05; k < .97; k += .045) { const u = 1 - k, px = (1 - k) * (1 - k) * X + 2 * k * (1 - k) * mx2 + k * k * tx, py = Y - h * k, ww = mix(w0, w1, k); c.moveTo(px - ww, py + ww * .25); c.lineTo(px + ww, py - ww * .25 * u); } c.stroke(); }
        if (!near && moonUp > 0 && s > 5) { c.strokeStyle = rgb([196, 210, 232], .16 * moonUp); c.lineWidth = Math.max(1, .04 * s); c.beginPath(); const sd = X > moonX ? -1 : 1; c.moveTo(X + sd * w0, Y); c.quadraticCurveTo(mx2 + sd * w0 * .8, Y - h * .55, tx + sd * w1, ty); c.stroke(); }
        // the crown: feathered fronds, the upper ones lifting, the lower ones hanging
        for (let i = 0; i < 15; i++) {
          const a = -Math.PI / 2 + (i / 14 - .5) * 3.9 + Math.sin(t * .6 + seed * 9 + i * .7) * .035, L = (2.3 + .7 * Math.sin(i * 2.3 + seed * 5)) * s * sz;
          const cx2 = tx + Math.cos(a) * L * .5, cy2 = ty + Math.sin(a) * L * .55 - L * .22, ex = tx + Math.cos(a) * L * .95, ey = ty + Math.sin(a) * L * .45 + L * .42 * (1 - Math.max(0, -Math.sin(a)) * .6);
          const Lp = [], Rp = [];
          for (let k = 0; k <= 12; k++) {
            const u = k / 12, v = 1 - u, px = v * v * tx + 2 * v * u * cx2 + u * u * ex, py = v * v * ty + 2 * v * u * cy2 + u * u * ey;
            const dx = 2 * v * (cx2 - tx) + 2 * u * (ex - cx2), dy = 2 * v * (cy2 - ty) + 2 * u * (ey - cy2), dl = Math.hypot(dx, dy) || 1;
            const wd = .3 * s * sz * Math.sin(Math.PI * Math.min(1, u * 1.15 + .04)) * (k % 2 ? 1 : .55);
            Lp.push([px - dy / dl * wd, py + dx / dl * wd]); Rp.push([px + dy / dl * wd * .8, py - dx / dl * wd * .8]);
          }
          c.beginPath(); Lp.forEach(([q0, q1], k) => (k ? c.lineTo(q0, q1) : c.moveTo(q0, q1))); for (let k = Rp.length - 1; k >= 0; k--) c.lineTo(Rp[k][0], Rp[k][1]); c.closePath(); c.fill();
        }
        c.beginPath(); c.ellipse(tx, ty + .1 * s * sz, w1 * 1.6, w1 * 1.2, 0, 0, TAU); c.fill();
      } else if (kind === 'rock') {
        const w = sz * s, h = sz * .55 * s; c.fillStyle = z < 6 ? rgb(sil) : shade(z, lerp(g1, g0, .3));
        c.beginPath(); c.moveTo(X - w, Y); c.lineTo(X - w * .6, Y - h * .8); c.lineTo(X - w * .05, Y - h); c.lineTo(X + w * .55, Y - h * .7); c.lineTo(X + w, Y); c.closePath(); c.fill();
        c.strokeStyle = rgb([200, 206, 230], .12); c.lineWidth = 1; c.beginPath(); c.moveTo(X - w * .6, Y - h * .8); c.lineTo(X - w * .05, Y - h); c.stroke();
      } else if (kind === 'house') {
        const w = sz * s, h = (2.8 + seed * 2.6) * s, hc = lerp(lerp(midC, [64, 54, 52], .3), hz, Math.min(.6, z / 120)), hg = c.createLinearGradient(0, Y - h, 0, Y);
        hg.addColorStop(0, rgb(lerp(hc, [150, 156, 180], .08))); hg.addColorStop(1, rgb(lerp(hc, [0, 0, 0], .35))); c.fillStyle = hg; c.fillRect(X - w / 2, Y - h, w, h);
        c.fillStyle = rgb(lerp(hc, [0, 0, 0], .5)); c.fillRect(X - w * (.1 + seed * .25), Y - 1.9 * s, .8 * s, 1.9 * s); // a doorway
        c.fillStyle = rgb([190, 198, 226], .1); c.fillRect(X - w / 2, Y - h - .25 * s, w, Math.max(1, .05 * s));
        c.fillStyle = rgb(lerp(lerp(midC, [70, 60, 58], .25), [0, 0, 0], .3)); c.fillRect(X - w / 2 - .1 * s, Y - h - .25 * s, w + .2 * s, .25 * s);
        if (seed > .55) { // a lamp in a window
          const lx = X + (seed - .75) * w, ly = Y - h * .6, fl = .8 + .2 * Math.sin(t * 3 + seed * 40);
          c.fillStyle = rgb([255, 190, 110], .75 * fl); c.fillRect(lx - .2 * s, ly - .3 * s, .4 * s, .5 * s);
          c.globalCompositeOperation = 'lighter'; c.globalAlpha = .3 * fl; const r = 1.6 * s; c.drawImage(st.warm, lx - r, ly - r, r * 2, r * 2); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        }
      } else if (kind === 'kaaba') {
        const w = 12 * s, h = 11 * s, side = X > W / 2 ? -1 : 1, d = Math.min(3.2, Math.abs(X - W / 2) / s * .05) * s * side;
        c.fillStyle = rgb(lerp(g0, [190, 186, 196], .1), .3); c.beginPath(); c.ellipse(X, Y + .3 * s, w * 1.7, 2.4 * s, 0, 0, TAU); c.fill(); // the court
        const kc = lerp([16, 15, 19], hz, .14), fg = c.createLinearGradient(0, Y - h, 0, Y); fg.addColorStop(0, rgb(lerp(kc, [70, 72, 92], .2))); fg.addColorStop(1, rgb(kc));
        c.fillStyle = rgb(lerp(kc, [0, 0, 0], .3)); c.beginPath(); const ex = side > 0 ? X + w / 2 : X - w / 2; c.moveTo(ex, Y); c.lineTo(ex + d, Y - Math.abs(d) * .12); c.lineTo(ex + d, Y - h - Math.abs(d) * .05); c.lineTo(ex, Y - h); c.closePath(); c.fill();
        c.fillStyle = fg; c.fillRect(X - w / 2, Y - h, w, h);
        c.strokeStyle = rgb([200, 208, 236], .22 * (.4 + .6 * moonUp)); c.lineWidth = 1; c.beginPath(); c.moveTo(X - w / 2, Y - h); c.lineTo(X + w / 2, Y - h); c.stroke();
        [-1.25, 1.35].forEach((u, i) => { const lx = X + u * w * .6, ly = Y - 2.4 * s, fl = .8 + .2 * Math.sin(t * 4 + i * 2); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .45 * fl; const r = 2.2 * s; c.drawImage(st.warm, lx - r, ly - r, r * 2, r * 2); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = rgb([255, 214, 150], .9 * fl); c.fillRect(lx - .12 * s, ly - .2 * s, .24 * s, .3 * s); c.strokeStyle = rgb(lerp([14, 13, 16], hz, .2)); c.lineWidth = Math.max(1, .1 * s); c.beginPath(); c.moveTo(lx, ly + .1 * s); c.lineTo(lx, Y); c.stroke(); });
      } else if (kind === 'grave') {
        const len = 2.1 * sz * s, h = .42 * s;
        c.fillStyle = rgb([6, 8, 12], .35); c.beginPath(); c.ellipse(X, Y + .04 * s, len * .62, .12 * s, 0, 0, TAU); c.fill();
        const mg = c.createLinearGradient(0, Y - h, 0, Y); mg.addColorStop(0, rgb(lerp(g0, [210, 214, 232], .18))); mg.addColorStop(1, rgb(lerp(g1, g0, .3)));
        c.fillStyle = mg; c.beginPath(); c.moveTo(X - len / 2, Y); c.bezierCurveTo(X - len * .42, Y - h * 1.05, X + len * .42, Y - h * 1.05, X + len / 2, Y); c.closePath(); c.fill();
        const stone = (u, hh) => { const sx = X + u * len, sw = .17 * s; c.fillStyle = rgb(lerp(g1, [120, 120, 130], .25)); c.beginPath(); c.moveTo(sx - sw, Y - h * .3); c.lineTo(sx - sw * .8, Y - hh * s); c.lineTo(sx + sw * .9, Y - hh * s * .92); c.lineTo(sx + sw, Y - h * .3); c.closePath(); c.fill(); c.fillStyle = rgb([220, 224, 240], .16); c.fillRect(sx - sw * .8, Y - hh * s, sw * 1.7, Math.max(1, .03 * s)); };
        stone(-.46, .62); stone(.47, .48);
        labels.push([x === GRAVE1 ? 0 : 1, X, Y - .95 * s]);
      } else if (kind === 'mat') {
        // the grandfather's mat in the shade of the House; he sits on it, then it lies empty
        const w = 1.5 * s, d2 = .5 * s;
        c.fillStyle = rgb(lerp([92, 40, 34], g1, .45)); c.beginPath(); c.moveTo(X - w / 2, Y); c.lineTo(X + w / 2, Y); c.lineTo(X + w / 2 - .12 * s, Y - d2 * .35); c.lineTo(X - w / 2 + .12 * s, Y - d2 * .35); c.closePath(); c.fill();
        c.strokeStyle = rgb(lerp([170, 130, 70], g1, .45)); c.lineWidth = Math.max(1, .03 * s); c.stroke();
        if (SHOW_GRANDFATHER && gone < 1) { // a cloaked old man, seated, a staff beside him; no face
          c.globalAlpha = 1 - gone;
          const hs = s * 1.0, bx = X + .05 * s, by = Y - d2 * .15, dark = rgb(lerp([20, 18, 22], hz, .06));
          c.fillStyle = dark;
          c.beginPath();
          c.moveTo(bx - .62 * hs, by); c.quadraticCurveTo(bx - .62 * hs, by - .3 * hs, bx - .34 * hs, by - .42 * hs); // the knees and the lap
          c.quadraticCurveTo(bx - .36 * hs, by - .8 * hs, bx - .2 * hs, by - .98 * hs); // the back of the shoulders, a little bowed
          c.quadraticCurveTo(bx - .14 * hs, by - 1.08 * hs, bx - .05 * hs, by - 1.07 * hs); // the neck
          c.quadraticCurveTo(bx - .16 * hs, by - 1.16 * hs, bx - .12 * hs, by - 1.3 * hs); // the head under the turban cloth
          c.quadraticCurveTo(bx, by - 1.43 * hs, bx + .14 * hs, by - 1.3 * hs);
          c.quadraticCurveTo(bx + .2 * hs, by - 1.16 * hs, bx + .1 * hs, by - 1.06 * hs);
          c.quadraticCurveTo(bx + .26 * hs, by - 1.0 * hs, bx + .3 * hs, by - .8 * hs);
          c.quadraticCurveTo(bx + .38 * hs, by - .45 * hs, bx + .6 * hs, by - .2 * hs);
          c.quadraticCurveTo(bx + .66 * hs, by, bx + .5 * hs, by); c.closePath(); c.fill();
          c.strokeStyle = rgb([200, 206, 228], .2 * moonUp + .08); c.lineWidth = Math.max(1, .02 * hs); c.stroke();
          c.fillStyle = rgb(lerp([230, 226, 214], hz, .55), .5); c.beginPath(); c.ellipse(bx + .01 * hs, by - 1.3 * hs, .13 * hs, .1 * hs, 0, Math.PI, TAU); c.fill(); // the pale turban cloth
          c.strokeStyle = dark; c.lineWidth = Math.max(1.2, .05 * hs); c.beginPath(); c.moveTo(bx + .5 * hs, by + .02 * hs); c.lineTo(bx + .62 * hs, by - 1.5 * hs); c.stroke(); // the staff
          c.globalAlpha = 1;
        }
        labels.push([2, X, Y - 1.95 * s]);
      } else if (kind === 'abode') {
        // the house of Abu Talib: a mud-brick front, a lit doorway, a lit window, a palm-trunk lintel
        const w = 7.4 * s, h = 3.7 * s, dx0 = X - .55 * s, dw = 1.15 * s, dh = 2.05 * s, fx = X - w * .3;
        const wallC = lerp(lerp([80, 64, 54], g1, .62), [120, 80, 50], warmK * .15);
        const wg = c.createLinearGradient(0, Y - h, 0, Y); wg.addColorStop(0, rgb(lerp(wallC, [255, 200, 140], .04))); wg.addColorStop(1, rgb(lerp(wallC, [0, 0, 0], .3)));
        c.fillStyle = wg; c.fillRect(fx - w / 2, Y - h, w, h);
        { const wr = (2.6 + 2.2 * warmK) * s, rg = c.createRadialGradient(dx0, Y - dh * .45, 0, dx0, Y - dh * .45, wr); rg.addColorStop(0, rgb([255, 176, 104], .42 * (.6 + .4 * warmK))); rg.addColorStop(1, rgb([255, 176, 104], 0)); c.save(); c.beginPath(); c.rect(fx - w / 2, Y - h, w, h); c.clip(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg; c.fillRect(fx - w / 2, Y - h, w, h); c.restore(); }
        c.fillStyle = rgb(lerp(wallC, [0, 0, 0], .35)); c.fillRect(fx - w / 2 - .12 * s, Y - h - .3 * s, w + .24 * s, .32 * s);
        for (let i = 0; i < 7; i++) { c.fillStyle = rgb(lerp(wallC, [0, 0, 0], .45)); c.beginPath(); c.arc(fx - w / 2 + (i + .5) * w / 7, Y - h + .55 * s, .07 * s, 0, TAU); c.fill(); } // the ends of the roof beams
        // inside light: the doorway and the window; it grows as he is taken in
        const L = .55 + .45 * warmK, fl = .92 + .08 * Math.sin(t * 5) * Math.sin(t * 3.3);
        const ig = c.createLinearGradient(0, Y - dh, 0, Y); ig.addColorStop(0, rgb([255, 196, 120], L * fl)); ig.addColorStop(1, rgb([255, 168, 92], L * fl));
        c.fillStyle = ig; c.fillRect(dx0 - dw / 2, Y - dh, dw, dh);
        c.fillStyle = rgb([255, 190, 110], (.45 + .5 * warmK) * fl); c.fillRect(fx - w * .32, Y - h * .62, .7 * s, .55 * s);
        c.strokeStyle = rgb(lerp(wallC, [0, 0, 0], .5)); c.lineWidth = Math.max(1, .06 * s); c.strokeRect(fx - w * .32, Y - h * .62, .7 * s, .55 * s);
        c.beginPath(); c.moveTo(fx - w * .32 + .35 * s, Y - h * .62); c.lineTo(fx - w * .32 + .35 * s, Y - h * .62 + .55 * s); c.stroke();
        c.fillStyle = rgb(lerp(wallC, [0, 0, 0], .55)); c.fillRect(dx0 - dw / 2 - .15 * s, Y - dh - .22 * s, dw + .3 * s, .22 * s); // the lintel
        // light on the ground before the door and a warm haze round it
        c.globalCompositeOperation = 'lighter';
        const sp = c.createLinearGradient(0, Y, 0, PY(0, ZC - 1.5)); sp.addColorStop(0, rgb([255, 170, 90], .32 * L)); sp.addColorStop(1, rgb([255, 170, 90], 0));
        c.fillStyle = sp; c.beginPath(); c.moveTo(dx0 - dw / 2, Y); c.lineTo(dx0 + dw / 2, Y); c.lineTo(PX(DOOR + 1.6, ZC - 1.5), PY(0, ZC - 1.5)); c.lineTo(PX(DOOR - 2.4, ZC - 1.5), PY(0, ZC - 1.5)); c.closePath(); c.fill();
        const r = (2.6 + 1.8 * warmK) * s; c.save(); c.beginPath(); c.rect(0, Y - h - .9 * s, W, H); c.clip(); c.globalAlpha = (.35 + .4 * warmK) * fl; c.drawImage(st.warm, dx0 - r, Y - dh * .6 - r, r * 2, r * 2); c.restore();
        c.globalCompositeOperation = 'source-over';
        st.door = [dx0, Y, dw, dh, s];
      }
    };
    st.O.forEach((o) => { if (o[2] >= czc) drawObj(o); });
    // ----- the people at the door: Abu Talib comes out and reaches for the child; the child goes in -----
    const drawUncle = () => {
      if (!st.door || p < .7) return;
      const [dx0, Y, dw, dh, s] = st.door, out = smooth(seg(p, .8, .84)), reach = smooth(seg(p, .82, .855)) * (1 - .4 * inDoor);
      const ux = dx0 - dw * .1 - out * .55 * s + inDoor * .35 * s, uy = Y + out * .1 * s, hs = 1.86 * s;
      const dark = rgb([16, 12, 12]);
      c.fillStyle = dark;
      c.beginPath(); // a standing cloaked man, his face to the child; no features
      c.moveTo(ux - .34 * hs * .5, uy); c.quadraticCurveTo(ux - .36 * hs * .5, uy - .55 * hs, ux - .22 * hs * .5, uy - .8 * hs);
      c.quadraticCurveTo(ux - .2 * hs * .5, uy - .9 * hs, ux - .1 * hs * .5, uy - .9 * hs); c.quadraticCurveTo(ux - .18 * hs * .5, uy - .98 * hs, ux - .12 * hs * .5, uy - 1.0 * hs * .995);
      c.quadraticCurveTo(ux, uy - 1.07 * hs, ux + .14 * hs * .5, uy - .99 * hs); c.quadraticCurveTo(ux + .2 * hs * .5, uy - .93 * hs, ux + .12 * hs * .5, uy - .9 * hs);
      c.quadraticCurveTo(ux + .26 * hs * .5, uy - .88 * hs, ux + .28 * hs * .5, uy - .78 * hs); c.quadraticCurveTo(ux + .4 * hs * .5, uy - .5 * hs, ux + .38 * hs * .5, uy); c.closePath(); c.fill();
      // the arm: a sleeve reaching down and out toward the child, then resting on his shoulder
      const sx = ux + .14 * hs * .5, sy = uy - .78 * hs, ex = mix(sx + .05 * s, sx + .62 * s, reach), ey = mix(uy - .45 * hs, uy - .62 * hs, reach);
      c.strokeStyle = dark; c.lineWidth = .16 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mix(sx, ex, .6), sy - .05 * s * reach, ex, ey); c.stroke(); c.lineCap = 'butt';
      c.strokeStyle = rgb([255, 190, 120], .55 * (.6 + .4 * warmK)); c.lineWidth = Math.max(1, .025 * s); c.beginPath(); c.moveTo(ux - .12 * hs * .5, uy - .995 * hs); c.quadraticCurveTo(ux - .2 * hs * .5, uy - .9 * hs, ux - .22 * hs * .5, uy - .8 * hs); c.quadraticCurveTo(ux - .36 * hs * .5, uy - .55 * hs, ux - .34 * hs * .5, uy); c.stroke(); // the door's light along his back
    };
    // the child Prophet
    const drawChild = () => {
      const X = PX(ch.x, czc), Y = PY(0, czc), h = 1.12 * F / czc;
      const amb = .3 + .25 * c01((ch.x - DOOR - 3) / -3) * warmK;
      Holy.draw(c, { who: 'prophet', child: true, pose: ch.walk ? 'walk' : 'stand', phase: ch.d / 1.1, x: X, y: Y, h, t, amb, flip: true, glow: .55 });
    };
    if (inDoor > .5) { drawUncle(); drawChild(); } else { drawChild(); drawUncle(); }
    // ----- the near foreground: dark trunks, stones and grass passing close to the eye -----
    st.O.forEach((o) => { if (o[2] < czc) drawObj(o); });
    // ----- names over the graves and the grandfather -----
    const vis = [smooth(seg(p, .09, .13)) * (1 - smooth(seg(p, .2, .24))), smooth(seg(p, .31, .35)) * (1 - smooth(seg(p, .44, .48))), smooth(seg(p, .55, .59)) * (1 - smooth(seg(p, .71, .75)))];
    st.names.forEach((li, i) => {
      const L = labels.find((q) => q[0] === i), a = L ? vis[i] : 0;
      li.style.opacity = a.toFixed(3);
      if (L && a > 0) li.style.transform = `translate(${L[1].toFixed(1)}px, ${L[2].toFixed(1)}px) translate(-50%, -100%)`;
    });
    // ----- grade: the night closes in at the edges; the house's light warms the last of it -----
    if (warmK > 0 && st.door) { // warmth on the street and the walls only; the sky stays night
      const [dx0, Y, , dh, s] = st.door, roof = Y - 4.1 * s; c.globalCompositeOperation = 'soft-light'; const g = c.createRadialGradient(dx0, Y - dh * .5, 0, dx0, Y - dh * .5, Math.max(W, H) * .55); g.addColorStop(0, `rgba(255,170,90,${.35 * warmK})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(0, roof, W, H - roof); c.globalCompositeOperation = 'source-over';
    }
    const vg = c.createRadialGradient(W * (phone ? .5 : .42), H * .55, Math.min(W, H) * .28, W * .5, H * .55, Math.hypot(W, H) * .62);
    vg.addColorStop(0, 'rgba(4,5,10,0)'); vg.addColorStop(1, 'rgba(3,4,8,.62)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
};
})();
