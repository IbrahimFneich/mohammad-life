(() => {
// kutub — «كتبه إلى الملوك» (al-Kafi 8:269, 6:473, 2:651; Manaqib 1:70, 1:73, 1:142, 1:146; I'lam al-Wara 1:210, 1:287).
// Seven small sets in metres under one pinhole camera keyed on p (x right, y up, z away), and one painted map:
//   p −.05 → .10   Medina, morning: under the frond roof of the mosque he sits on a mat, a sleeve toward the scribe who
//                   writes on his knee; two envoys in travel cloaks wait (Kafi 8:269)
//      .10 → .20   insert from above: the sheet fills with lines of writing (illegible strokes, right to left); his
//                   sleeve comes down and lifts, and the seal «محمد رسول الله» stays on the sheet in light (Kafi 6:473);
//                   then six rolled letters, each sealed (six: the envoys of Manaqib 1:142's list)
//      .20 → .36   a painted map: the roads go out from Medina north to the Rum, north-east to Fars, south-west over
//                   the Red Sea to al-Habasha, north-west to al-Iskandariyya, and to al-Harith b. Shamir and Hawdha b. Ali
//      .36 → .47   the court of Rum: the envoy walks in and bows; the king rises and lifts the letter high; a robe is
//                   laid on the envoy («فعظّم كتاب رسول الله وأكرم رسوله»)
//      .47 → .62   the iwan of Fars at dusk: the envoy walks up the carpet; the letter goes up to the king; he tears it,
//                   the pieces fall, and the guards turn the envoy away («استخفّ بكتاب رسول الله ومزّقه واستخفّ برسوله»)
//      .62 → .70   Medina, noon: he sits with his sleeves raised in prayer (Manaqib 1:73)
//      .70 → .835  al-Habasha: the king under his canopy among the stelae takes the letter and rises with it to his
//                   chest; then the shore: Ja'far's company goes aboard two ships, and they sail (I'lam 1:210)
//      .835 → .92  al-Iskandariyya: the gifts cross the terrace before the harbour and its tower: two women in mantles,
//                   the grey mule, the donkey (I'lam 1:287; Manaqib 1:146)
//      .92 → 1.05  Medina, late afternoon: the grey mule is led in; he hands its rein to Ali (Manaqib 1:146)
// The Prophet and Ali are drawn only by Holy.draw; everyone else is a faceless shape with an earth-toned or dark head
// (helmets iron-dark, crowns dark with dull bronze). Everything follows from p; t moves only cloth, flame, water, stars.
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
const bump = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));
const fade = (p, a, b) => smooth(seg(p, a, b));
const keyAt = (K, p) => { let i = 1; while (i < K.length - 1 && p > K[i][0]) i++; const A = K[i - 1], B = K[i], k = smooth(c01((p - A[0]) / (B[0] - A[0]))); return A.slice(1).map((v, j) => lerp(v, B[j + 1], k)); };
const hash = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };

// ---------- people: the same 16-point outlines as muta (u across, v up, metres, facing +u), so poses blend ----------
const SH = {
  stand: [-.3, 0, -.22, .4, -.18, .85, -.19, 1.1, -.18, 1.33, -.1, 1.46, -.07, 1.6, .05, 1.72, .15, 1.62, .12, 1.49, .17, 1.37, .19, 1.05, .16, .7, .17, .32, .22, 0, 0, .02],
  front: [-.3, 0, -.25, .45, -.24, .9, -.25, 1.15, -.25, 1.38, -.16, 1.5, -.1, 1.6, 0, 1.75, .1, 1.6, .16, 1.5, .25, 1.38, .25, 1.15, .24, .9, .25, .45, .3, 0, 0, .02],
  kneel: [-.5, 0, -.46, .18, -.3, .36, -.2, .62, -.2, .86, -.12, .98, -.08, 1.1, .04, 1.22, .14, 1.12, .11, 1.0, .16, .9, .19, .66, .22, .44, .38, .3, .46, 0, 0, .02],
  sit: [-.34, 0, -.33, .24, -.25, .5, -.21, .72, -.19, .86, -.11, .96, -.07, 1.06, .04, 1.16, .13, 1.07, .11, .96, .15, .86, .18, .62, .26, .36, .42, .2, .46, 0, 0, .02],
  bow: [-.34, 0, -.34, .24, -.27, .48, -.18, .68, -.08, .8, .04, .86, .1, .94, .22, .98, .3, .88, .26, .78, .26, .66, .26, .5, .3, .34, .42, .2, .46, 0, 0, .02],
  sitF: [-.42, 0, -.4, .2, -.3, .46, -.26, .66, -.24, .84, -.15, .95, -.09, 1.04, 0, 1.17, .09, 1.04, .15, .95, .24, .84, .26, .66, .3, .46, .4, .2, .42, 0, 0, .02],
  kbow: [-.5, 0, -.46, .18, -.34, .4, -.26, .62, -.14, .8, 0, .9, .1, .96, .24, 1.0, .32, .9, .28, .8, .3, .66, .28, .5, .3, .36, .4, .24, .46, 0, 0, .02],
  stoop: [-.3, 0, -.24, .4, -.2, .82, -.16, 1.06, -.1, 1.26, .0, 1.38, .06, 1.48, .2, 1.56, .28, 1.45, .22, 1.34, .24, 1.2, .22, .98, .16, .68, .17, .32, .22, 0, 0, .02],
};
const HC = { stand: [.05, 1.6], front: [0, 1.6], kneel: [.04, 1.11], sit: [.04, 1.06], bow: [.2, .88], sitF: [0, 1.04], kbow: [.22, .9], stoop: [.18, 1.44] };
const SHO = { stand: [.01, 1.36], front: [.2, 1.38], kneel: [.01, .88], sit: [0, .84], bow: [.16, .74], sitF: [.2, .84], kbow: [.12, .78], stoop: [.1, 1.22] };
// a light: ambient, key, haze; side +1 = the key comes from screen right
const mkL = (amb, key, haze, side = -1) => ({ amb, key, haze, side, sh(col, lam, fa = 0) { const v = col.map((x, j) => Math.min(255, x / 255 * (amb[j] * .8 + key[j] * lam * .82))); return fa ? lerp(v, haze, fa) : v; } });
const BRONZE = [128, 98, 54], IRON = [70, 66, 64];
// a faceless figure at screen (X, Y), s px per metre. o: a/b/k pose blend, dir, cl cloak, hd head colour, head type,
// arms [[u, v]] hand points, lean, alpha, fa haze, trim colour, rim. Returns the hand points on screen.
function person(c, X, Y, s, o, L) {
  const al = o.alpha ?? 1; if (al <= .01 || s < .4) return null;
  const a = o.a || 'stand', b = o.b || a, k = o.k || 0, ln = o.lean || 0, dir = o.dir || 1, fa = o.fa || 0;
  const pts = SH[a].map((v, i) => mix(v, SH[b][i], k)), hc = lerp(HC[a], HC[b], k), sho = lerp(SHO[a], SHO[b], k);
  const P = (i) => [pts[2 * i] + ln * pts[2 * i + 1], pts[2 * i + 1]];
  c.save(); c.globalAlpha *= al; c.translate(X, Y); c.scale(s * dir, -s);
  const lu = L.side * dir, base = L.sh(o.cl, .1, fa), hi = L.sh(lerp(o.cl, [255, 238, 210], .08), o.lit ?? 1, fa);
  c.beginPath(); for (let i = 0; i < 16; i++) { const q = P(i); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath();
  const g = c.createLinearGradient(-.3 * lu, 0, .3 * lu, 0); g.addColorStop(0, rgb(hi)); g.addColorStop(.55, rgb(lerp(hi, base, .62))); g.addColorStop(1, rgb(base));
  c.fillStyle = g; c.fill();
  if (o.trim) { c.save(); c.clip(); c.fillStyle = rgb(L.sh(o.trim, .8, fa)); c.fillRect(-1, 0, 2, .1); c.fillRect(-.03 * lu, .2, .06, 1.2); c.restore(); }
  c.strokeStyle = `rgba(22,15,12,${.42 * (1 - fa)})`; c.lineWidth = .025; c.stroke();
  if (o.rim) { c.strokeStyle = `rgba(255,214,150,${o.rim})`; c.lineWidth = .05; c.stroke(); }
  const sx0 = sho[0] + ln * sho[1], sy0 = sho[1], arms = o.arms || [[sho[0] + .06, sho[1] - .55]];
  c.strokeStyle = rgb(lerp(base, hi, .4)); c.lineWidth = .11; c.lineCap = 'round';
  arms.forEach(([ax, ay, su]) => { const s0 = su ?? sx0; c.beginPath(); c.moveTo(s0, sy0); c.quadraticCurveTo(mix(s0, ax, .5) - .06, mix(sy0, ay, .5) - .04, ax, ay); c.stroke(); });
  const hx = hc[0] + ln * hc[1], hv = hc[1], hd = o.hd || [120, 92, 64], hdc = L.sh(hd, .9, fa), hdd = L.sh(hd, .15, fa);
  const ell = (x, y, rx, ry, col) => { c.fillStyle = rgb(col); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); };
  const type = o.head || 'cloth';
  if (type === 'mantle' || type === 'hood') { // a mantle over the head and shoulders
    const b3 = P(3), b4 = P(4), f10 = P(10), f11 = P(11);
    c.beginPath(); c.moveTo(b3[0] - .03, b3[1]); c.lineTo(b4[0] - .03, b4[1]); c.quadraticCurveTo(hx - .17, hv + .22, hx + .02, hv + .18); c.quadraticCurveTo(hx + .17, hv + .15, f10[0] + .03, f10[1]); c.lineTo(f11[0] + .02, f11[1]); c.closePath();
    const q = c.createLinearGradient(-.25 * lu, 0, .25 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd)); c.fillStyle = q; c.fill();
  } else if (type === 'helm') {
    ell(hx, hv + .01, .13, .13, L.sh(IRON, .45, fa)); c.fillStyle = rgb(L.sh(IRON, .9, fa)); c.fillRect(hx - .13, hv - .02, .26, .035);
  } else {
    if (type === 'cloth' || type === 'band') { // the cloth falling behind the head
      const b5 = P(5), b4 = P(4);
      c.fillStyle = rgb(hdd); c.beginPath(); c.moveTo(hx - .09, hv + .03); c.quadraticCurveTo(b5[0] - .06, b5[1] - .02, mix(b5[0], b4[0], .9) - .035, mix(b5[1], b4[1], .9)); c.lineTo(mix(b5[0], b4[0], .9) + .07, mix(b5[1], b4[1], .9) + .03); c.quadraticCurveTo(b5[0] + .05, b5[1], hx - .01, hv - .02); c.closePath(); c.fill();
    }
    const q = c.createLinearGradient(hx - .14 * lu, 0, hx + .14 * lu, 0); q.addColorStop(0, rgb(hdc)); q.addColorStop(1, rgb(hdd));
    c.fillStyle = q; c.beginPath(); c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.fill();
    if (type === 'cap') { c.beginPath(); c.moveTo(hx - .12, hv + .04); c.quadraticCurveTo(hx - .1, hv + .34, hx + .02, hv + .36); c.quadraticCurveTo(hx + .12, hv + .3, hx + .12, hv + .04); c.closePath(); c.fill(); }
    if (type === 'band') { c.fillStyle = rgb(L.sh(BRONZE, .9, fa)); c.fillRect(hx - .14, hv + .02, .28, .04); }
    if (type === 'crownB') { // a dark cap in a dull bronze band, with hanging strings
      c.fillStyle = rgb(L.sh(BRONZE, .8, fa)); c.fillRect(hx - .14, hv + .04, .28, .07);
      c.fillRect(hx - .13, hv - .12, .025, .16); c.fillRect(hx + .105, hv - .12, .025, .16);
      c.fillStyle = rgb(L.sh([110, 30, 34], .8, fa)); c.fillRect(hx - .02, hv + .055, .04, .04);
    }
    if (type === 'crownP') { // a tall dark crown, dull bronze wings and a dark globe
      c.fillStyle = rgb(L.sh([60, 44, 40], .6, fa)); c.beginPath(); c.moveTo(hx - .13, hv + .05); c.lineTo(hx - .1, hv + .3); c.lineTo(hx + .1, hv + .3); c.lineTo(hx + .13, hv + .05); c.closePath(); c.fill();
      c.fillStyle = rgb(L.sh(BRONZE, .8, fa)); c.fillRect(hx - .14, hv + .05, .28, .05);
      c.beginPath(); c.moveTo(hx - .02, hv + .3); c.quadraticCurveTo(hx - .22, hv + .38, hx - .2, hv + .5); c.quadraticCurveTo(hx - .1, hv + .38, hx, hv + .33); c.quadraticCurveTo(hx + .1, hv + .38, hx + .2, hv + .5); c.quadraticCurveTo(hx + .22, hv + .38, hx + .02, hv + .3); c.closePath(); c.fill();
      ell(hx, hv + .44, .075, .075, L.sh([90, 66, 50], .7, fa));
    }
    if (type !== 'cap' && type !== 'crownP') { c.strokeStyle = 'rgba(24,16,12,.3)'; c.lineWidth = .02; c.beginPath(); c.ellipse(hx, hv, .14, .115, 0, 0, TAU); c.stroke(); }
  }
  c.restore();
  return { hands: arms.map(([ax, ay]) => [X + (ax + ln * ay) * s * dir, Y - ay * s]), head: [X + hx * s * dir, Y - hv * s] };
}
// mules, donkeys, horses, camels: the batched outlines of badr, shaded, with walking legs
const HORSE = [-1.14, 1.3, -.98, 1.5, -.3, 1.46, .42, 1.56, .66, 1.76, .9, 2.06, 1.02, 2.1, 1.3, 1.86, 1.3, 1.75, 1.16, 1.73, .96, 1.84, .82, 1.42, .78, 1.16, .2, 1.02, -.6, 1.05, -.96, 1.14, -1.04, .98, -1.2, 1.06];
const CAMEL = [-1.05, 1.36, -.95, 1.62, -.6, 1.95, -.2, 2.2, .15, 2.05, .45, 1.78, .72, 1.72, .95, 1.62, 1.18, 1.78, 1.32, 2.08, 1.42, 2.28, 1.62, 2.32, 1.72, 2.24, 1.66, 2.14, 1.46, 2.08, 1.3, 1.7, 1.08, 1.38, .85, 1.3, .3, 1.24, -.4, 1.24, -.9, 1.3];
function beast(c, X, Y, s, dir, kind, coat, ph, moving, L, fa = 0) {
  const sc = { mule: .9, donkey: .74, horse: 1, camel: 1 }[kind], S2 = s * sc, bob = moving ? Math.abs(Math.sin(ph)) * .04 * S2 : 0;
  const top = L.sh(lerp(coat, [255, 244, 222], .1), 1, fa), bot = L.sh(coat, .2, fa), dark = lerp(bot, [20, 14, 10], .4);
  const lh = kind === 'camel' ? 1.28 : 1.12;
  c.lineCap = 'round';
  [[.62, 0], [.74, 1.6], [-.74, 3.1], [-.86, 4.7]].forEach(([hu, o], i) => {
    const a = Math.sin(ph + o) * (moving ? .42 : .04);
    c.strokeStyle = rgb(i % 2 === 0 ? dark : bot); c.lineWidth = Math.max(.8, (kind === 'camel' ? .1 : .085) * S2);
    c.beginPath(); c.moveTo(X + hu * S2 * dir, Y - lh * S2 - bob); c.lineTo(X + (hu + a * .45) * S2 * dir, Y - lh * .48 * S2 + Math.abs(a) * .2 * S2); c.lineTo(X + (hu + a * .25) * S2 * dir, Y); c.stroke();
  });
  const sh = kind === 'camel' ? CAMEL : HORSE;
  c.beginPath(); for (let i = 0; i < sh.length; i += 2) { const x = X + sh[i] * dir * S2, y = Y - bob - sh[i + 1] * S2; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath();
  const g = c.createLinearGradient(0, Y - 2.1 * S2, 0, Y - 1 * S2); g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot)); c.fillStyle = g; c.fill();
  c.strokeStyle = rgb(dark, .5); c.lineWidth = Math.max(.5, .02 * S2); c.stroke();
  if (kind !== 'camel') { // ears (long on the mule and the donkey), a dark mane on the donkey, a tail
    const el = kind === 'horse' ? .12 : kind === 'mule' ? .26 : .3;
    c.fillStyle = rgb(lerp(top, bot, .3)); [[.98, 2.1, -.5], [1.06, 2.08, -.2]].forEach(([u, v, r]) => { c.save(); c.translate(X + u * dir * S2, Y - bob - v * S2); c.rotate(r * dir); c.beginPath(); c.ellipse(0, -el * S2 * .5, .045 * S2, el * S2 * .5, 0, 0, TAU); c.fill(); c.restore(); });
    if (kind === 'donkey') { c.strokeStyle = rgb(dark); c.lineWidth = .05 * S2; c.beginPath(); c.moveTo(X + .9 * dir * S2, Y - bob - 2.0 * S2); c.lineTo(X + .5 * dir * S2, Y - bob - 1.6 * S2); c.stroke(); }
    c.strokeStyle = rgb(dark); c.lineWidth = Math.max(.7, .06 * S2); c.beginPath(); c.moveTo(X - 1.12 * S2 * dir, Y - 1.4 * S2 - bob); c.quadraticCurveTo(X - 1.32 * S2 * dir, Y - 1.0 * S2, X - 1.24 * S2 * dir, Y - .72 * S2); c.stroke();
  }
  return { head: [X + 1.22 * dir * S2, Y - bob - 1.8 * S2], back: [X - .1 * dir * S2, Y - bob - 1.5 * S2], s: S2 };
}
// a ship side-on at (X, Y = waterline): hull, mast, a square sail (fill 0..1); dir: the bow
function ship(c, X, Y, s, dir, sail, t, L, fa = 0) {
  const hull = L.sh([92, 64, 42], .7, fa), hullD = L.sh([60, 42, 30], .2, fa);
  c.beginPath(); c.moveTo(X - 4.6 * s * dir, Y - 1.5 * s); c.quadraticCurveTo(X - 3.6 * s * dir, Y + .2 * s, X - 1 * s * dir, Y + .35 * s); c.lineTo(X + 2.6 * s * dir, Y + .3 * s); c.quadraticCurveTo(X + 4.4 * s * dir, Y, X + 5 * s * dir, Y - 1.7 * s); c.lineTo(X + 4.2 * s * dir, Y - 1.2 * s); c.lineTo(X - 3.9 * s * dir, Y - 1.1 * s); c.closePath();
  const g = c.createLinearGradient(0, Y - 1.7 * s, 0, Y + .3 * s); g.addColorStop(0, rgb(hull)); g.addColorStop(1, rgb(hullD)); c.fillStyle = g; c.fill();
  c.strokeStyle = rgb(L.sh([150, 116, 70], .8, fa)); c.lineWidth = Math.max(.6, .08 * s); c.beginPath(); c.moveTo(X - 4 * s * dir, Y - 1.05 * s); c.lineTo(X + 4.3 * s * dir, Y - 1.15 * s); c.stroke();
  c.strokeStyle = rgb(L.sh([70, 52, 36], .5, fa)); c.lineWidth = Math.max(.8, .14 * s); c.beginPath(); c.moveTo(X, Y - 1.1 * s); c.lineTo(X, Y - 8 * s); c.stroke();
  c.lineWidth = Math.max(.6, .08 * s); c.beginPath(); c.moveTo(X - 2.6 * s, Y - 7.4 * s); c.lineTo(X + 2.6 * s, Y - 7.4 * s); c.stroke();
  if (sail > 0) {
    const bl = Math.sin(t * 1.3) * .15 * s, h = 5.6 * sail;
    c.beginPath(); c.moveTo(X - 2.5 * s, Y - 7.4 * s); c.lineTo(X + 2.5 * s, Y - 7.4 * s); c.quadraticCurveTo(X + 2.8 * s + bl, Y - (7.4 - h * .5) * s, X + 2.4 * s, Y - (7.4 - h) * s); c.lineTo(X - 2.4 * s, Y - (7.4 - h) * s); c.quadraticCurveTo(X - 2.2 * s + bl, Y - (7.4 - h * .5) * s, X - 2.5 * s, Y - 7.4 * s); c.closePath();
    const q = c.createLinearGradient(X - 2.5 * s, 0, X + 2.5 * s, 0); q.addColorStop(0, rgb(L.sh([222, 200, 160], .3, fa))); q.addColorStop(.5, rgb(L.sh([226, 206, 166], 1, fa))); q.addColorStop(1, rgb(L.sh([200, 176, 136], .5, fa))); c.fillStyle = q; c.fill();
    c.strokeStyle = rgb(L.sh([150, 120, 86], .5, fa), .6); c.lineWidth = Math.max(.4, .04 * s); c.stroke();
  }
}
// the camera: K = [x, y, z, yaw, horizon (fraction of H), zoom]; the scene's centre sits left of the words (centred on phones)
function view(W, H, phone, K) {
  const [cx, cy, cz, yaw, hyF, zm] = K, F = (phone ? Math.min(H * .78, W * 1.42) : Math.min(H, W * .7)) * zm;
  const ox = phone ? W / 2 : W * .38, hy = H * (hyF + (phone ? .14 : 0)), ca = Math.cos(yaw), sa = Math.sin(yaw);
  const VX = (x, z) => (x - cx) * ca - (z - cz) * sa, VZ = (x, z) => (x - cx) * sa + (z - cz) * ca;
  const P = (x, y, z) => { const v = Math.max(.05, VZ(x, z)); return [ox + VX(x, z) * F / v, hy - (y - cy) * F / v, v]; };
  return { F, ox, hy, P, VX, VZ, W, H, cy };
}
const quad = (c, V, pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y, z], i) => { const q = V.P(x, y, z); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); };
const glow = (c, X, Y, R0, col, a) => { if (a <= 0 || R0 <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, R0); g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); c.fillStyle = g; c.fillRect(X - R0, Y - R0, 2 * R0, 2 * R0); c.restore(); };
const sky = (c, W, y1, top, mid, hor) => { const g = c.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, rgb(top)); g.addColorStop(.6, rgb(mid)); g.addColorStop(1, rgb(hor)); c.fillStyle = g; c.fillRect(0, 0, W, y1 + 1); };
// a column: shaded shaft between floor and h, a capital and a base
function column(c, V, x, z, r, h, col, L, fa = 0, cap = BRONZE) {
  const [X0, Y0, v] = V.P(x, 0, z), [, Y1] = V.P(x, h, z), w = r * V.F / v;
  if (X0 < -w * 3 || X0 > V.W + w * 3) return;
  const g = c.createLinearGradient(X0 - w, 0, X0 + w, 0), lo = L.side < 0;
  g.addColorStop(0, rgb(L.sh(col, lo ? 1 : .15, fa))); g.addColorStop(.45, rgb(L.sh(col, .6, fa))); g.addColorStop(1, rgb(L.sh(col, lo ? .12 : 1, fa)));
  c.fillStyle = g; c.fillRect(X0 - w, Y1, 2 * w, Y0 - Y1);
  c.fillStyle = rgb(L.sh(cap, .7, fa)); c.fillRect(X0 - w * 1.5, Y1 - w * .2, w * 3, w * .9); c.fillRect(X0 - w * 1.35, Y0 - w * .7, w * 2.7, w * .7);
}
const lamp = (c, X, Y, s, t, ph) => { const f = .85 + .15 * Math.sin(t * 9 + ph) * Math.sin(t * 5.3 + ph * 2); glow(c, X, Y, s * 2.4 * f, [255, 176, 96], .5); glow(c, X, Y, s * .5, [255, 236, 190], .9 * f); };
// a date palm: a tapered, ringed trunk from (X, Y) up h metres with a lean, a crown of arched fronds
function palm(c, X, Y, s, h, lean, seed, L, fa = 0, t = 0) {
  const tx = X + lean * h * s, ty = Y - h * s, w = Math.max(.6, .2 * s);
  c.fillStyle = rgb(L.sh([118, 92, 66], .5, fa)); c.beginPath(); c.moveTo(X - w, Y); c.quadraticCurveTo(X + lean * h * s * .4 - w * .8, Y - h * s * .5, tx - w * .65, ty); c.lineTo(tx + w * .65, ty); c.quadraticCurveTo(X + lean * h * s * .4 + w * .8, Y - h * s * .5, X + w, Y); c.closePath(); c.fill();
  if (s > 6) { c.strokeStyle = rgb(L.sh([76, 58, 42], .3, fa), .6); c.lineWidth = Math.max(.5, .03 * s); c.beginPath(); for (let i = 1; i < h * 3; i++) { const u = i / (h * 3), x = mix(X, tx, u), y = mix(Y, ty, u); c.moveTo(x - w * (1 - u * .35), y); c.quadraticCurveTo(x, y + w * .3, x + w * (1 - u * .35), y); } c.stroke(); }
  const n = 13;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + seed * 6 + Math.sin(t * .8 + i) * .03, dx = Math.cos(a), up = Math.sin(a) * .5 + .25, L0 = (2.4 + hash(seed, i) * 1.2) * s;
    const ex = tx + dx * L0, ey = ty - up * L0 * .55 + L0 * .42 * (1 - Math.abs(dx) * .3), mx = tx + dx * L0 * .5, my = ty - L0 * (.32 + up * .2);
    const col = L.sh(i % 3 ? [86, 112, 58] : [70, 94, 50], .45 + .55 * c01(.5 - dx * L.side * .8), fa);
    c.fillStyle = rgb(col); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my - .18 * s, ex, ey); c.quadraticCurveTo(mx, my + .22 * s, tx, ty + .1 * s); c.fill();
  }
}
// ---------- Medina: the shade of the mosque (frond roof on palm trunks against the north wall), the sunlit yard ----------
const MEDL = [
  [-.06, [74, 128, 200], [150, 190, 228], [232, 226, 210], [150, 156, 170], [255, 234, 198], -1],
  [.5, [74, 128, 200], [150, 190, 228], [232, 226, 210], [150, 156, 170], [255, 234, 198], -1],
  [.62, [52, 112, 206], [132, 182, 234], [226, 232, 236], [156, 162, 178], [255, 246, 226], -1],
  [.8, [52, 112, 206], [132, 182, 234], [226, 232, 236], [156, 162, 178], [255, 246, 226], -1],
  [.92, [66, 96, 172], [196, 176, 184], [248, 204, 154], [150, 132, 132], [255, 196, 128], 1],
  [1.06, [62, 84, 160], [190, 160, 172], [246, 190, 138], [146, 124, 128], [255, 184, 116], 1]];
const MCAM = [[-.06, .5, 1.45, -2.8, 0, .6, 1.1], [.1, .2, 1.38, -1.0, 0, .6, 1.12],
  [.6, -.7, 1.25, -1.6, 0, .62, 1.3], [.71, -.9, 1.22, -.6, 0, .62, 1.34],
  [.9, 1.5, 1.32, -1.2, 0, .57, .96], [1.06, 1.0, 1.5, -2.6, 0, .57, .96]];
function medina(c, st, W, H, phone, p, t, mode) {
  const V = view(W, H, phone, keyAt(MCAM, p)), [skT, skM, skH, amb, key, side] = keyAt(MEDL, p), L = mkL(amb, key, skH, side >= 0 ? 1 : -1);
  const P = V.P, F = V.F, sun = mode === 2 ? .85 : 1;
  sky(c, W, V.hy, skT, skM, skH);
  st.cloud.forEach(([u, v, w, k]) => { const x = u * W * 1.3 - W * .15, y = V.hy * (.12 + v * .5), rw = w * W; const q = c.createLinearGradient(x - rw, 0, x + rw, 0); const cc = lerp([255, 255, 255], key, .3); q.addColorStop(0, rgb(cc, 0)); q.addColorStop(.5, rgb(cc, .22 + .2 * k)); q.addColorStop(1, rgb(cc, 0)); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, 3 + 8 * k, 0, 0, TAU); c.fill(); });
  // far palms over the wall, then the yard floor
  st.mpalms.forEach(([x, z, h, ln, sd]) => { const [X, Y, v] = P(x, 0, z); if (v < 2) return; palm(c, X, Y, F / v, h, ln, sd, L, Math.min(.55, v / 90), t); });
  { const g = c.createLinearGradient(0, V.hy, 0, H); g.addColorStop(0, rgb(L.sh([196, 170, 128], .55 * sun))); g.addColorStop(1, rgb(L.sh([206, 178, 134], .62 * sun))); c.fillStyle = g; c.fillRect(0, V.hy, W, H - V.hy); }
  const mud = [178, 142, 102], shade = .16;
  // the west wall of the yard, the north wall under the roof, the floor of the shade, the roof's underside
  quad(c, V, [[-22, 0, -6], [-22, 2.4, -6], [-22, 2.4, 11], [-22, 0, 11]], rgb(L.sh(mud, side > 0 ? .7 : .2)));
  quad(c, V, [[-22, 0, 11], [22, 0, 11], [22, 3, 11], [-22, 3, 11]], rgb(L.sh(mud, shade)));
  { c.strokeStyle = rgb(L.sh([120, 92, 66], .12), .5); c.lineWidth = 1; c.beginPath(); for (let r = 1; r < 9; r++) { const a = P(-22, r * .33, 11), b = P(22, r * .33, 11); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke(); }
  quad(c, V, [[4.6, 0, 10.98], [5.8, 0, 10.98], [5.8, 2.1, 10.98], [4.6, 2.1, 10.98]], rgb(L.sh([40, 30, 24], .05)));
  quad(c, V, [[-22, 0, 6], [22, 0, 6], [22, 0, 11], [-22, 0, 11]], rgb(L.sh([196, 168, 128], shade + .04)));
  quad(c, V, [[-22, 3, 6], [22, 3, 6], [22, 3, 11], [-22, 3, 11]], rgb(L.sh([96, 74, 52], .1)));
  { c.strokeStyle = rgb(L.sh([60, 44, 32], .05), .8); c.lineWidth = Math.max(1, F * .004); c.beginPath(); for (let x = -22; x <= 22; x += 1.3) { const a = P(x, 2.98, 6), b = P(x, 2.98, 11); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const x = -21 + hash(i, 3) * 42, z = 6.3 + hash(i, 4) * 4.5, a = P(x, 2.99, z), b = P(x + .35, 2.99, z); c.strokeStyle = rgb(key, .22 * sun); c.lineWidth = Math.max(.6, F * .0025); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } c.restore(); }
  // dapples of sun through the fronds on the floor of the shade, and a few shafts
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) { const x = -12.5 + hash(i, 7) * 25, z = 6.4 + hash(i, 8) * 4.4, [X, Y, v] = P(x, 0, z), r = (.14 + .22 * hash(i, 9)) * F / v; c.save(); c.translate(X, Y); c.scale(1, .3); const q = c.createRadialGradient(0, 0, 0, 0, 0, r); q.addColorStop(0, rgb(key, .2 * sun)); q.addColorStop(1, rgb(key, 0)); c.fillStyle = q; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore(); }
  for (let i = 0; i < 7; i++) { const x = -9 + i * 3.1 + hash(i, 2), z = 7 + hash(i, 5) * 3, a = P(x, 3, z), b = P(x + side * .9, 0, z - .3), w0 = .05 * F / a[2], w1 = .3 * F / b[2]; const g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, rgb(key, .1 * sun)); g.addColorStop(1, rgb(key, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(a[0] - w0, a[1]); c.lineTo(a[0] + w0, a[1]); c.lineTo(b[0] + w1, b[1]); c.lineTo(b[0] - w1, b[1]); c.closePath(); c.fill(); }
  c.restore();
  const trunk = [138, 108, 76];
  [-17.6, -13.5, -9.5, -5.4, -1.8 - (mode === 2 ? .6 : 0), 2.4, 6.4, 10.4, 14.4, 18.4].forEach((x) => column(c, V, x + .4, 10.2, .17, 3, trunk, L, 0, [110, 86, 60]));
  // the people in the shade
  const S0 = (x, z) => { const [X, Y, v] = P(x, 0, z); return [X, Y, F / v]; };
  const seated = (x, z, dir, cl, hd, extra = {}) => { const [X, Y, s] = S0(x, z); return person(c, X, Y, s, { a: 'sit', dir, cl, hd, lit: .35, ...extra }, L); };
  const holy = (x, z, o) => { const [X, Y, s] = S0(x, z); const h = 1.8 * s; const at = Holy.draw(c, { who: 'prophet', x: X, y: Y, h, t, amb: mode === 2 ? .8 : .62, ...o }); return { X, Y, h, at }; };
  const shadowE = (x, z, w) => { const [X, Y, s] = S0(x, z); c.fillStyle = 'rgba(40,28,24,.28)'; c.beginPath(); c.ellipse(X - side * .3 * s, Y, w * s, w * s * .22, 0, 0, TAU); c.fill(); };
  if (mode === 0) {
    [[-5.8, 10.2, 1, 0], [-4.8, 10.3, 1, 1], [-3.9, 10.1, 1, 2], [7, 10.1, -1, 3], [7.9, 10.25, -1, 4]].forEach(([x, z, d, i]) => seated(x, z, d, st.CL[i], st.HD[i + 1]));
    holy(-1.2, 8.4, { pose: 'sit', arms: [[.2, -.36]] });
    const sc = seated(.42, 8.15, -1, [112, 92, 70], [128, 96, 62], { arms: [[.36, .5 + Math.sin(t * 5) * .015], [.31, .47]], lean: .05 });
    if (sc) { const [hx, hy2] = sc.hands[0], s = S0(.42, 8.15)[2]; c.fillStyle = rgb(L.sh([236, 224, 196], .8)); c.beginPath(); c.moveTo(hx - .16 * s, hy2 + .02 * s); c.lineTo(hx + .06 * s, hy2 - .02 * s); c.lineTo(hx + .1 * s, hy2 + .05 * s); c.lineTo(hx - .12 * s, hy2 + .09 * s); c.closePath(); c.fill(); }
    [[2.5, 7.4, [126, 104, 78], [150, 116, 74]], [3.3, 7.9, [104, 86, 66], [120, 84, 58]]].forEach(([x, z, cl, hd]) => { const [X, Y, s] = S0(x, z); c.strokeStyle = rgb(L.sh([92, 70, 50], .4)); c.lineWidth = Math.max(1, .05 * s); c.beginPath(); c.moveTo(X - .32 * s, Y); c.lineTo(X - .36 * s, Y - 1.8 * s); c.stroke(); person(c, X, Y, s, { dir: -1, cl, hd, lit: .4, arms: [[.3, 1.0]] }, L); });
  } else if (mode === 1) {
    [[-3.9, 9.6, 1, 0], [-2.9, 9.0, 1, 1], [1.4, 9.4, -1, 2], [.5, 8.9, -1, 3], [2.4, 9.9, -1, 4]].forEach(([x, z, d, i]) => seated(x, z, d, st.CL[i], st.HD[i + 2]));
    holy(-1.2, 8.4, { pose: 'sit', arms: [[-.13, -.47], [.13, -.47]] });
  } else {
    [[-3.6, 9.5, 1, 0], [-4.6, 9.8, 1, 1], [3.8, 9.5, -1, 2], [4.7, 9.9, -1, 5]].forEach(([x, z, d, i]) => seated(x, z, d, st.CL[i], st.HD[i]));
  }
  [-18.6, -14.8, -11, -7.2, -3.6, 4.6, 8.4, 12, 15.8, 19.6].forEach((x) => column(c, V, x, 6.15, .19, 2.9, trunk, L, 0, [118, 92, 64]));
  { const a = P(-22, 2.86, 6), b = P(22, 2.86, 6), a2 = P(-22, 3.12, 6); c.fillStyle = rgb(L.sh([150, 116, 78], .75 * sun)); c.fillRect(Math.min(a[0], b[0]), a2[1], Math.abs(b[0] - a[0]), a[1] - a2[1]);
    c.strokeStyle = rgb(L.sh([110, 96, 60], .6)); c.lineWidth = Math.max(1, F * .003); c.beginPath(); for (let x = -22; x < 22; x += .16) { const q = P(x, 3.12, 6), w = .22 * F / q[2], h0 = hash(x * 10); c.moveTo(q[0], q[1]); c.quadraticCurveTo(q[0] + w * .5, q[1] - w * (.2 + .3 * h0), q[0] + w * (.8 + h0 * .6), q[1] - w * .05 + w * .25 * hash(x * 7)); } c.stroke();
    c.strokeStyle = rgb(L.sh([70, 54, 36], .2), .8); c.lineWidth = Math.max(1, F * .002); c.beginPath(); for (let x = -22; x < 22; x += .23) { const q = P(x, 2.86, 6), w = .3 * F / q[2]; c.moveTo(q[0], q[1]); c.lineTo(q[0] + w * .1, q[1] + w * (.15 + .25 * hash(x * 3))); } c.stroke(); }
  if (mode === 2) { // the gifts come in: the groom, the grey mule, the donkey; he hands the rein to Ali
    const k = smooth(seg(p, .926, .962)), mx = mix(9.5, 2.9, k), walking = k > 0 && k < 1, ph = p * 260;
    shadowE(mx + 3.3, 5.7, 1.1); shadowE(mx, 5, 1.3);
    const dk = beast(c, ...S0(mx + 3.3, 5.7).slice(0, 2), S0(mx + 3.3, 5.7)[2], -1, 'donkey', [132, 120, 108], ph + 1, walking, L);
    const gx = mix(mx - 1.5, 6.2, smooth(seg(p, .962, .985))), gz = mix(4.6, 3.4, smooth(seg(p, .962, .985)));
    const ml = beast(c, ...S0(mx, 5).slice(0, 2), S0(mx, 5)[2], -1, 'mule', [184, 182, 176], ph, walking, L);
    const pr = holy(-.8, 6.9, { pose: 'stand', arms: p < .978 ? [[.24 * smooth(seg(p, .95, .968)) + .05, -.58]] : [[.06, -.5]] });
    const [ax, az] = [1.0, 6.3], ali = S0(ax, az), ah = 1.8 * ali[2], reach = smooth(seg(p, .968, .982));
    Holy.draw(c, { who: 'ali', pose: 'stand', x: ali[0], y: ali[1], h: ah, t, amb: .8, arms: [[-.05 + .22 * reach, -.56]] });
    if (ml && p > .95) { // the rein: from the mule's head to his sleeve, then to Ali's
      const hp = [pr.X + (.24 * smooth(seg(p, .95, .968)) + .05) * pr.h, pr.Y - .58 * pr.h], ha = [ali[0] + (-.05 + .22 * reach) * ah, ali[1] - .56 * ah], end = p < .978 ? hp : ha;
      c.strokeStyle = rgb(L.sh([70, 50, 34], .5)); c.lineWidth = Math.max(1, .025 * ml.s); c.beginPath(); c.moveTo(ml.head[0], ml.head[1] + .15 * ml.s); c.quadraticCurveTo((ml.head[0] + end[0]) / 2, Math.max(ml.head[1], end[1]) + .25 * ml.s, end[0], end[1]); c.stroke();
    }
    const [gX, gY, gs] = S0(gx, gz); shadowE(gx, gz, .5);
    person(c, gX, gY, gs, { dir: p < .965 ? -1 : 1, cl: [118, 94, 70], hd: [140, 108, 72], arms: p < .962 ? [[.45, 1.05]] : undefined }, L);
    void dk;
  }
  // stones near the camera
  c.fillStyle = rgb(L.sh([140, 112, 80], .25), .35); for (let i = 0; i < 30; i++) { const u = i / 30, [X, Y, v] = P(mix(6.5, 1.5, u) + (i % 2) * .22, 0, mix(-.5, 5.6, u)); if (v < .8) continue; const r = .07 * F / v; c.beginPath(); c.ellipse(X, Y, r * 1.5, r * .45, 0, 0, TAU); c.fill(); }
  { const [X, Y, v] = P(-7.4, 0, mode === 1 ? 5.2 : .9); if (v > .5) palm(c, X, Y, F / v, 9, .03, .7, L, 0, t); }
  for (let i = 0; i < 36; i++) { const x = -8 + hash(i, 1) * 20, z = (mode === 1 ? 4.4 : .5) + hash(i, 2) * 5, [X, Y, v] = P(x, 0, z); if (v < .8 || z > 5.8) continue; const r = (.025 + .05 * hash(i, 3)) * F / v; c.fillStyle = rgb(L.sh([130, 106, 80], .2)); c.beginPath(); c.ellipse(X, Y, r * 1.4, r * .5, 0, 0, TAU); c.fill(); c.fillStyle = rgb(L.sh([196, 172, 134], .7)); c.beginPath(); c.ellipse(X - r * .2, Y - r * .2, r, r * .35, 0, 0, TAU); c.fill(); }
}
// ---------- the insert from above: the sheet, the writing, the seal; then six letters rolled and sealed ----------
function sleeveTo(c, sx, sy, ex, ey, w) { // his sleeve from above (Holy's cloak colours), widening to the shoulder, a pale cuff, no hand
  const dx = ex - sx, dy = ey - sy, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w0 = w * 1.25, w1 = w * .55;
  const path = (o) => { c.beginPath(); c.moveTo(sx + nx * w0 + o, sy + ny * w0 + o); c.quadraticCurveTo((sx + ex) / 2 + nx * w * .95 + o, (sy + ey) / 2 + ny * w * .95 + o, ex + nx * w1 + o, ey + ny * w1 + o); c.arc(ex + o, ey + o, w1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); c.quadraticCurveTo((sx + ex) / 2 - nx * w * .8 + o, (sy + ey) / 2 - ny * w * .8 + o, sx - nx * w0 + o, sy - ny * w0 + o); c.closePath(); };
  path(w * .35); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
  path(0); const g = c.createLinearGradient(sx + nx * w0, sy + ny * w0, sx - nx * w0, sy - ny * w0); g.addColorStop(0, '#3f8262'); g.addColorStop(.5, '#2a5e45'); g.addColorStop(1, '#143426'); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(8,22,16,.45)'; c.lineWidth = Math.max(1, w * .05); c.stroke();
  c.strokeStyle = 'rgba(10,30,20,.35)'; c.beginPath(); for (let k = 1; k <= 3; k++) { const u = k / 4.2, x0 = mix(sx, ex, u), y0 = mix(sy, ey, u), ww = mix(w0, w1, u) * .8; c.moveTo(x0 + nx * ww, y0 + ny * ww); c.quadraticCurveTo(x0 + dx / l * w * .25, y0 + dy / l * w * .25, x0 - nx * ww * .6, y0 - ny * ww * .6); } c.stroke();
  c.fillStyle = '#e9e2d0'; c.beginPath(); c.ellipse(ex, ey, w1 * .9, w1 * .9, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(120,110,90,.5)'; c.lineWidth = 1; c.stroke();
}
function seal(c, X, Y, r, a, t) { // the impression «محمد رسول الله» in light (the three-line layout is the painter's)
  if (a <= 0) return;
  glow(c, X, Y, r * 3.2, [255, 200, 110], .32 * a); glow(c, X, Y, r * 1.4, [255, 226, 160], .45 * a);
  c.save(); c.globalAlpha *= a;
  c.fillStyle = 'rgba(120,64,30,.55)'; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill();
  c.strokeStyle = '#f6dc98'; c.lineWidth = Math.max(1, r * .07); c.beginPath(); c.arc(X, Y, r * .9, 0, TAU); c.stroke();
  c.fillStyle = '#fbe6ae'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,200,110,.9)'; c.shadowBlur = r * .35;
  c.font = `700 ${(r * .5).toFixed(1)}px ${FONT.naskh}`; c.direction = 'rtl';
  c.fillText('محمد', X, Y - r * .44); c.fillText('رسول', X, Y + r * .02); c.fillText('الله', X, Y + r * .46);
  c.restore();
}
function cloth(c, st, W, H) { // the green cloth the letters and the map lie on: soft folds and a weave
  c.fillStyle = '#1d3a2e'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { const a = hash(i, 11) * W, g = c.createLinearGradient(a - W * .2, 0, a + W * .3, H); g.addColorStop(0, 'rgba(70,120,96,0)'); g.addColorStop(.5, `rgba(70,120,96,${.1 + .1 * hash(i, 12)})`); g.addColorStop(1, 'rgba(70,120,96,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  if (!st.weave) { const cv = mk(8, 8), g = cv.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 8, 1); g.fillRect(0, 4, 8, 1); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, 2, 1, 8); g.fillRect(5, 0, 1, 8); st.weave = cv; }
  c.fillStyle = c.createPattern(st.weave, 'repeat'); c.fillRect(0, 0, W, H);
}
function sheetShot(c, st, W, H, phone, p, t) {
  const cx0 = phone ? W / 2 : W * .38, cy0 = phone ? H * .66 : H * .53, zm = keyAt([[.09, 1.1], [.168, 1], [.21, .86]], p)[0];
  // the cloth: deep green with soft folds and a weave
  cloth(c, st, W, H);
  const rl = fade(p, .17, .186), base = (phone ? Math.min(W * .78, H * .36) : Math.min(W * .36, H * .62)) * zm, sw = base, shh = base * 1.22;
  const x0 = cx0 - sw / 2, y0 = cy0 - shh / 2;
  // the inkwell and the reed pen at the side of the sheet
  { const ix = x0 + sw * 1.12, iy = y0 + shh * .2, r = sw * .07; c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(ix + r * .3, iy + r * .4, r * 1.1, r * .9, 0, 0, TAU); c.fill(); const g = c.createRadialGradient(ix - r * .3, iy - r * .3, r * .1, ix, iy, r); g.addColorStop(0, '#7a5a3c'); g.addColorStop(1, '#2e2016'); c.fillStyle = g; c.beginPath(); c.arc(ix, iy, r, 0, TAU); c.fill(); c.fillStyle = '#0d0907'; c.beginPath(); c.arc(ix, iy, r * .45, 0, TAU); c.fill();
    c.strokeStyle = '#b89a62'; c.lineWidth = Math.max(1.5, sw * .012); c.lineCap = 'round'; c.beginPath(); c.moveTo(ix - r * .2, iy + r * 1.6); c.lineTo(ix + r * 2.2, iy + shh * .45); c.stroke(); }
  if (rl < 1) {
    c.save(); c.globalAlpha = 1 - rl;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x0 + sw * .025, y0 + shh * .025, sw, shh);
    const g = c.createLinearGradient(x0, y0, x0 + sw, y0 + shh); g.addColorStop(0, '#efe3c6'); g.addColorStop(.5, '#e6d6b2'); g.addColorStop(1, '#d6c39a'); c.fillStyle = g; c.fillRect(x0, y0, sw, shh);
    c.strokeStyle = 'rgba(120,90,50,.35)'; c.lineWidth = 1; c.strokeRect(x0 + .5, y0 + .5, sw - 1, shh - 1);
    for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(150,120,80,${.05 + .05 * hash(i, 2)})`; c.beginPath(); const yy = y0 + hash(i, 1) * shh; c.moveTo(x0, yy); c.lineTo(x0 + sw, yy + (hash(i, 3) - .5) * 8); c.stroke(); }
    // the writing appears right to left, line by line
    const w = seg(p, .102, .15) * st.script.length;
    c.strokeStyle = '#2e2016'; c.fillStyle = '#2e2016'; c.lineCap = 'round'; c.lineJoin = 'round';
    st.script.forEach((line, i) => {
      const f = c01(w - i); if (f <= 0) return;
      c.save(); c.beginPath(); c.rect(x0 + sw * (line.x1 - (line.x1 - line.x0) * f) - 2, y0, sw * (line.x1 - line.x0) * f + 4 + sw * .02, shh); c.clip();
      c.lineWidth = Math.max(1, sw * (i ? .0045 : .006));
      line.st.forEach((s) => { c.beginPath(); s.forEach(([u, v], j) => (j ? c.lineTo(x0 + u * sw, y0 + v * shh) : c.moveTo(x0 + u * sw, y0 + v * shh))); c.stroke(); });
      line.dots.forEach(([u, v]) => { c.beginPath(); c.arc(x0 + u * sw, y0 + v * shh, Math.max(.8, sw * .0045), 0, TAU); c.fill(); });
      c.restore();
    });
    // the sleeve comes down on the place of the seal and lifts
    const SX = x0 + sw * .2, SY = y0 + shh * .87, down = smooth(seg(p, .146, .156)) * (1 - smooth(seg(p, .162, .174)));
    seal(c, SX, SY, sw * .075, fade(p, .158, .166), t);
    if (down > 0) { const ex = mix(SX + sw * 1.2, SX + sw * .02, down), ey = mix(SY + sw * .9, SY + sw * .02, down); sleeveTo(c, ex + sw * .75, ey + sw * .55, ex, ey, sw * .13); }
    c.restore();
  }
  if (rl > 0) { // six letters, rolled and tied, each with its seal in light
    c.save(); c.globalAlpha = rl;
    for (let i = 0; i < 6; i++) {
      const a = (i - 2.5) * .16, X = cx0 + Math.sin(a) * sw * 1.05, Y = cy0 + sw * .55 - Math.cos(a) * sw * .62 + (i % 2) * sw * .05, L0 = sw * .5, r = sw * .05;
      c.save(); c.translate(X, Y); c.rotate(a + Math.PI / 2 + (hash(i, 4) - .5) * .2);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-L0 / 2 + 4, -r + 6, L0, r * 2);
      const g = c.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#d3bf96'); g.addColorStop(.35, '#f1e5c8'); g.addColorStop(1, '#a8916a'); c.fillStyle = g; c.fillRect(-L0 / 2, -r, L0, r * 2);
      c.fillStyle = '#e8dbbb'; c.beginPath(); c.ellipse(-L0 / 2, 0, r * .35, r, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(120,90,60,.6)'; c.stroke();
      c.strokeStyle = '#6b3e26'; c.lineWidth = Math.max(1, r * .18); c.beginPath(); c.moveTo(-r * .4, -r); c.lineTo(-r * .4, r); c.moveTo(r * .4, -r); c.lineTo(r * .4, r); c.stroke();
      c.restore();
      seal(c, X, Y, r * 1.15, fade(p, .174 + i * .0018, .182 + i * .0018), t);
    }
    c.restore();
  }
}
// ---------- the painted map (lon, lat in degrees; an old flat projection, not a modern one) ----------
const MAP = { lon0: 25, lat1: 39, kx: .91, ppd: 80 }, MW = Math.round(28 * .91 * 80), MH = 30 * 80;
const mp = (lon, lat) => [(lon - MAP.lon0) * MAP.kx * MAP.ppd, (MAP.lat1 - lat) * MAP.ppd];
const SEAS = [
  [[25, 39.5], [25, 31.7], [27.5, 31.1], [29, 30.9], [29.9, 31.2], [30.4, 31.45], [31, 31.6], [31.6, 31.5], [32.3, 31.25], [33.5, 31.15], [34.2, 31.3], [34.5, 31.5], [34.9, 32.5], [35.2, 33.2], [35.6, 34.3], [35.9, 35.2], [36.2, 36.2], [35.9, 36.8], [34.6, 36.8], [34, 36.6], [32.8, 36.1], [32, 36.4], [30.6, 36.8], [29.6, 36.2], [28.2, 36.7], [27.4, 37.2], [27.2, 38], [26.4, 38.6], [26.8, 39.5]],
  [[32.55, 29.95], [32.7, 29.0], [33.5, 27.6], [34.0, 26.6], [35.2, 24.5], [35.7, 23.0], [36.8, 21.8], [37.2, 21.0], [37.3, 19.6], [38.4, 18.0], [39.2, 15.8], [40.1, 15.2], [41.2, 13.9], [42.4, 12.9], [43.2, 12.5], [43.4, 12.7], [43.2, 13.3], [42.7, 15.0], [42.6, 16.4], [41.8, 17.9], [40.9, 19.2], [39.7, 20.8], [39.1, 21.5], [38.9, 22.4], [38.4, 23.5], [37.5, 24.6], [36.6, 25.8], [35.7, 27.2], [35.0, 28.0], [34.95, 29.5], [34.6, 28.6], [34.3, 27.8], [33.6, 28.3], [32.9, 29.4]],
  [[47.9, 30.0], [48.9, 30.0], [50.2, 29.2], [50.7, 28.6], [51.6, 27.8], [53.5, 26.8], [53.5, 24.2], [52, 24.1], [51.6, 24.3], [51.4, 25.2], [51.6, 25.9], [51.2, 26.1], [50.8, 25.6], [50.6, 25.0], [50.2, 25.6], [50.0, 26.2], [49.6, 26.8], [49.0, 27.4], [48.6, 28.0], [48.3, 28.6], [47.9, 29.4]],
  [[43.4, 12.7], [44.5, 12.8], [46, 13.4], [48.5, 14.0], [50.5, 15.0], [52, 15.6], [53.5, 16.4], [53.5, 8.5], [51.2, 8.5], [51.3, 11.8], [49, 11.3], [47, 11.1], [45, 10.4], [44, 10.4], [43.3, 11.5], [42.9, 11.9], [43.2, 12.5]],
  [[49, 39.5], [49, 37.6], [49.9, 37.4], [51, 36.8], [52.5, 36.7], [53.5, 36.9], [53.5, 39.5]],
  [[32.3, 35.1], [33, 35.4], [34.5, 35.65], [34, 35.0], [33, 34.6], [32.4, 34.8]].reverse(), // Cyprus: land inside the sea (drawn as an island below)
  [[37, 12.3], [37.4, 12.2], [37.5, 11.6], [37.1, 11.7]],
];
const ISLES = [[[32.3, 35.1], [33, 35.4], [34.5, 35.65], [34, 35.0], [33, 34.6], [32.4, 34.8]], [[25, 35.45], [26.3, 35.3], [26.2, 35.0], [25, 35.05]]];
const RIVERS = [
  [[31.0, 30.1], [31.2, 29], [30.8, 28], [31.0, 27], [31.8, 26.2], [32.7, 25.6], [32.9, 24.1], [32.9, 23], [31.4, 22.0], [30.9, 21], [30.6, 19.8], [31.6, 18.6], [32.4, 17.6], [33.6, 17.4], [32.6, 16.0], [32.5, 15.6], [33.6, 14.4], [34.4, 12.8], [35.6, 11.4], [36.8, 10.8], [37.2, 11.7]],
  [[31.0, 30.1], [30.4, 31.45]], [[31.0, 30.1], [31.8, 31.5]],
  [[38.6, 37.9], [38.4, 36.6], [39.1, 36], [40.2, 35.2], [41.4, 34.4], [42.7, 33.5], [43.6, 32.8], [44.3, 32.0], [45.4, 31.3], [46.5, 31.0], [47.5, 30.6], [48.2, 30.1]],
  [[40.9, 38.6], [42.2, 37.3], [43.1, 36.3], [43.4, 35.2], [44.0, 34.2], [44.5, 33.3], [45.3, 32.6], [46.2, 31.9], [47.0, 31.2], [47.6, 30.6]]];
const RANGES = [[[29.5, 37.6], [33, 37.3], [36, 37.7], [38.5, 38.1], [41.5, 38.3]], [[44.6, 37.6], [46.4, 35.4], [48, 33.6], [49.6, 31.6], [51.4, 29.8], [53, 28.3]], [[45.6, 37.8], [47.4, 35.5], [49, 33.8], [50.6, 31.9], [52.4, 30.1]],
  [[35.9, 34.4], [36.4, 33.1]], [[35.4, 28.8], [37, 26.2], [38.6, 24.1], [40.2, 21.1], [41.6, 18.5], [43.3, 15.6], [44, 13.5]], [[33.7, 28.9], [34.1, 28.3]], [[44.2, 16.6], [44.5, 13.6]]];
const ETH = [36, 40.6, 9.2, 14.8];
// the roads: [key, points, start, end, label, main]; the Habasha road is at sea from point 2 to 6
const ROADS = [
  ['rum', [[39.6, 24.47], [39.3, 25.7], [38.5, 27.6], [36.6, 28.4], [35.75, 30.2], [35.9, 31.3], [35.22, 31.78]], .222, .3, 'قيصر', 1],
  ['fars', [[39.6, 24.47], [40.8, 26.4], [42.2, 28.4], [43.2, 30.4], [44.1, 32.1], [44.58, 33.09]], .232, .31, 'كسرى', 1],
  ['hab', [[39.6, 24.47], [39.0, 23.9], [38.6, 23.3], [38.3, 21.5], [38.7, 19.0], [39.3, 16.6], [39.65, 15.27], [39.0, 14.6], [38.72, 14.13]], .242, .32, 'النجاشي', 1, [2, 6]],
  ['misr', [[39.6, 24.47], [38.4, 25.4], [37.2, 26.8], [36.2, 28.3], [35.0, 29.6], [34.0, 30.1], [32.6, 30.4], [31.4, 30.8], [29.92, 31.2]], .252, .33, 'المقوقس', 1],
  ['harith', [[39.6, 24.47], [39.3, 25.7], [38.5, 27.6], [36.6, 28.4], [35.75, 30.2], [36.3, 31.6], [36.5, 32.5], [36.3, 33.5]], .27, .332, 'الحارث بن شمر', 0],
  ['hawdha', [[39.6, 24.47], [41.5, 24.9], [43.6, 24.9], [45.4, 24.6], [46.7, 24.6]], .282, .334, 'هوذة بن علي', 0]];
const REGIONS = [['الروم', 32, 37.0], ['فارس', 50.6, 31.6], ['الحبشة', 37.6, 10.4]];
function buildMap(st) {
  const cv = mk(MW, MH), g = cv.getContext('2d'), R = rng(5150), path = (pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = mp(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  g.fillStyle = '#e3d2ad'; g.fillRect(0, 0, MW, MH);
  const blob = (lo, la, r, col, a) => { const [x, y] = mp(lo, la), rr = r * MAP.ppd, q = g.createRadialGradient(x, y, 0, x, y, rr); q.addColorStop(0, rgb(col, a)); q.addColorStop(1, rgb(col, 0)); g.fillStyle = q; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); };
  for (let i = 0; i < 40; i++) blob(25 + R() * 28, 9 + R() * 30, 1 + R() * 3, R() < .5 ? [200, 176, 128] : [240, 226, 196], .25);
  [[41, 28.4, 3, [220, 170, 104], .55], [49.5, 19.6, 5, [222, 168, 98], .6], [27.6, 27, 4, [214, 176, 116], .5], [45.6, 25.5, 2.5, [214, 176, 116], .35], [33.8, 29.2, 1.6, [206, 168, 112], .4],
    [35.8, 33.6, 1.6, [150, 164, 104], .55], [44.2, 33, 2.6, [150, 166, 106], .55], [38.4, 11.8, 3.2, [128, 154, 92], .7], [44.2, 15, 1.8, [156, 160, 104], .5], [31.2, 29.6, 1.1, [140, 160, 96], .6], [48.6, 33, 3, [176, 168, 126], .45], [32, 37.5, 4, [168, 166, 120], .45]].forEach((b) => blob(...b));
  RIVERS[0].slice(0, 12).forEach(([lo, la]) => blob(lo, la, .55, [128, 150, 90], .5));
  // the seas: deep water, painted shallows along the coast, wave strokes, the ink of the shore
  SEAS.forEach((s, i) => {
    if (i === 5) return;
    path(s); const [x, y] = mp(s[0][0], s[0][1]); const q = g.createLinearGradient(x, 0, x + 800, MH); q.addColorStop(0, '#6f9fa4'); q.addColorStop(1, '#5d8e98'); g.fillStyle = q; g.fill();
    g.save(); g.clip(); for (let w = 26; w > 2; w -= 6) { g.strokeStyle = `rgba(180,206,190,${.08 + (26 - w) * .006})`; g.lineWidth = w; path(s); g.stroke(); }
    g.strokeStyle = 'rgba(52,86,98,.4)'; g.lineWidth = 2; for (let k = 0; k < 900; k++) { const lo = 25 + R() * 28.5, la = 8.5 + R() * 31, [wx, wy] = mp(lo, la); g.beginPath(); g.arc(wx, wy + 6, 7, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    g.restore();
  });
  ISLES.forEach((s) => { path(s); g.fillStyle = '#d8c398'; g.fill(); });
  g.strokeStyle = '#4c3626'; g.lineWidth = 2.6; g.lineJoin = 'round'; SEAS.forEach((s, i) => { if (i !== 5) { path(s); g.stroke(); } }); ISLES.forEach((s) => { path(s); g.stroke(); });
  g.strokeStyle = 'rgba(76,54,38,.35)'; g.lineWidth = 1.2; g.setLineDash([2, 6]); SEAS.forEach((s, i) => { if (i === 5) return; g.save(); path(s); g.clip(); g.lineWidth = 14; g.stroke(); g.restore(); }); g.setLineDash([]);
  // rivers
  RIVERS.forEach((r, i) => { g.beginPath(); r.forEach(([lo, la], j) => { const [x, y] = mp(lo, la); j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = '#4c3626'; g.lineWidth = i < 3 ? 6.5 : 7; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#6f9fa4'; g.lineWidth = i < 3 ? 4 : 4.5; g.stroke(); });
  // mountains: small painted ridges, lit from the left, inked
  const mtn = (lo, la, s) => { const [x, y] = mp(lo, la), w = 20 * s, h = 22 * s; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .1, y - h); g.lineTo(x, y); g.closePath(); g.fillStyle = '#ece0c2'; g.fill(); g.beginPath(); g.moveTo(x - w * .1, y - h); g.lineTo(x + w, y); g.lineTo(x, y); g.closePath(); g.fillStyle = '#a98a5c'; g.fill(); g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .1, y - h); g.lineTo(x + w, y); g.strokeStyle = '#4c3626'; g.lineWidth = 2; g.stroke(); };
  RANGES.forEach((r) => { for (let i = 0; i < r.length - 1; i++) { const [a0, b0] = r[i], [a1, b1] = r[i + 1], n = Math.ceil(Math.hypot(a1 - a0, b1 - b0) / .42); for (let k = 0; k < n; k++) { const u = k / n; mtn(mix(a0, a1, u) + (R() - .5) * .25, mix(b0, b1, u) + (R() - .5) * .25, .8 + R() * .5); } } });
  const pts = []; for (let i = 0; i < 70; i++) pts.push([ETH[0] + R() * (ETH[1] - ETH[0]), ETH[2] + R() * (ETH[3] - ETH[2])]);
  pts.filter(([lo, la]) => !(lo > 38.6 && la > 13.6 + (lo - 38.6) * .9)).sort((a, b) => b[1] - a[1]).forEach(([lo, la]) => mtn(lo, la, .7 + R() * .5));
  // dunes
  g.strokeStyle = 'rgba(150,104,56,.5)'; g.lineWidth = 2; [[41, 28.4, 1.6], [49.5, 19.6, 3.4], [27.5, 26.5, 2.2], [46, 25.6, 1]].forEach(([lo, la, r]) => { for (let k = 0; k < r * 90; k++) { const a = R() * TAU, d = Math.sqrt(R()) * r, [x, y] = mp(lo + Math.cos(a) * d / MAP.kx, la + Math.sin(a) * d * .8); g.beginPath(); g.arc(x, y + 8, 10, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); } });
  // oases and the cities at the ends of the roads
  const tree = (x, y) => { g.strokeStyle = '#4c3626'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 14); g.stroke(); g.fillStyle = '#5e7a3e'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + Math.cos(k * 1.26) * 6, y - 15 + Math.sin(k * 1.26) * 3, 7, 2.6, k * 1.26, 0, TAU); g.fill(); } };
  [[39.6, 24.47, 6], [39.3, 25.7, 4], [38.5, 27.6, 3], [46.7, 24.6, 4]].forEach(([lo, la, n]) => { const [x, y] = mp(lo, la); for (let k = 0; k < n; k++) tree(x + (k - n / 2) * 11 + 4, y + (k % 2) * 6 + 14); });
  const ink = '#4c3626', city = (lo, la, kind) => {
    const [x, y] = mp(lo, la); g.save(); g.translate(x, y); g.lineWidth = 2; g.strokeStyle = ink;
    if (kind === 'dome') { g.fillStyle = '#c8b28a'; g.fillRect(-22, -14, 44, 14); g.strokeRect(-22, -14, 44, 14); g.fillStyle = '#9c7a44'; g.beginPath(); g.arc(0, -14, 13, Math.PI, 0); g.fill(); g.stroke(); for (let k = -16; k <= 16; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, -10); g.stroke(); } }
    if (kind === 'walls') { g.fillStyle = '#c8b28a'; g.fillRect(-18, -12, 36, 12); g.strokeRect(-18, -12, 36, 12); [-18, 12].forEach((k) => { g.fillRect(k, -20, 7, 20); g.strokeRect(k, -20, 7, 20); }); }
    if (kind === 'iwan') { g.fillStyle = '#c8b28a'; g.fillRect(-30, -26, 60, 26); g.strokeRect(-30, -26, 60, 26); g.fillStyle = '#5a4030'; g.beginPath(); g.moveTo(-11, 0); g.lineTo(-11, -12); g.quadraticCurveTo(0, -34, 11, -12); g.lineTo(11, 0); g.closePath(); g.fill(); g.stroke(); }
    if (kind === 'stele') { [[-9, 40], [6, 30], [16, 20]].forEach(([k, h]) => { g.fillStyle = '#b8a27a'; g.beginPath(); g.moveTo(k - 4, 0); g.lineTo(k - 4, -h); g.quadraticCurveTo(k, -h - 6, k + 4, -h); g.lineTo(k + 4, 0); g.closePath(); g.fill(); g.stroke(); }); }
    if (kind === 'tower') { g.fillStyle = '#c8b28a'; g.fillRect(-9, -22, 18, 22); g.strokeRect(-9, -22, 18, 22); g.fillRect(-6, -36, 12, 14); g.strokeRect(-6, -36, 12, 14); g.fillRect(-3.5, -46, 7, 10); g.strokeRect(-3.5, -46, 7, 10); g.fillStyle = '#c0542c'; g.beginPath(); g.arc(0, -50, 4, 0, TAU); g.fill(); }
    if (kind === 'fort') { g.fillStyle = '#c8b28a'; g.fillRect(-14, -14, 28, 14); g.strokeRect(-14, -14, 28, 14); }
    if (kind === 'mosque') { g.fillStyle = '#d4c094'; g.fillRect(-14, -10, 28, 12); g.strokeRect(-14, -10, 28, 12); g.fillStyle = '#7a6a48'; g.fillRect(-14, -10, 28, 4); }
    g.restore();
  };
  city(35.22, 31.78, 'dome'); city(36.3, 33.5, 'walls'); city(44.58, 33.09, 'iwan'); city(38.72, 14.13, 'stele'); city(29.92, 31.2, 'tower'); city(46.7, 24.6, 'fort'); city(39.6, 24.47, 'mosque');
  // grain and an old darkening at the edges
  g.globalCompositeOperation = 'multiply'; for (let i = 0; i < 160; i++) { const x = R() * MW, y = R() * MH, r = 20 + R() * 120, q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(180,150,110,${.05 + R() * .08})`); q.addColorStop(1, 'rgba(180,150,110,0)'); g.fillStyle = q; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .35; g.fillStyle = g.createPattern(grainTile(), 'repeat'); g.fillRect(0, 0, MW, MH);
  // a deckled edge: the vellum cut by hand, darker toward its rim
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.beginPath(); const m = 22, E = [];
  for (let x = m; x < MW - m; x += 24) E.push([x, m + (R() - .5) * 10]); for (let y = m; y < MH - m; y += 24) E.push([MW - m + (R() - .5) * 10, y]);
  for (let x = MW - m; x > m; x -= 24) E.push([x, MH - m + (R() - .5) * 10]); for (let y = MH - m; y > m; y -= 24) E.push([m + (R() - .5) * 10, y]);
  E.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-atop'; g.strokeStyle = 'rgba(110,76,40,.35)'; g.lineWidth = 60; g.stroke(); g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 14; g.stroke();
  st.map = cv;
}
function mapShot(c, st, W, H, phone, p, t) {
  if (!st.map) buildMap(st);
  const [zm, clo, cla] = keyAt([[.19, 3.1, 39.4, 24.9], [.235, 2.1, 39.2, 25.2], [.3, 1.03, 39.2, 24.4], [.37, .97, 39.2, 24.2]], p);
  const Hv = Math.min(H, innerHeight || H); // reduced motion: the stage is as tall as its stacked words; keep the map in the first screen
  const base = phone ? Math.min(W * .94 / MW, Hv * .54 / MH) : Math.min(W * .6 / MW, Hv * .9 / MH), sc = base * zm;
  const ox = phone ? W / 2 : W * .38, oy = phone ? Hv * .67 : Hv * .5, [mcx, mcy] = mp(clo, cla);
  const S2 = (lo, la) => { const [x, y] = mp(lo, la); return [ox + (x - mcx) * sc, oy + (y - mcy) * sc]; };
  cloth(c, st, W, H);
  c.save(); c.shadowColor = 'rgba(30,20,10,.6)'; c.shadowBlur = 40; c.drawImage(st.map, ox - mcx * sc, oy - mcy * sc, MW * sc, MH * sc); c.restore();
  const ink = 'rgba(62,42,28,.92)', halo = 'rgba(236,224,196,.85)';
  const label = (txt, X, Y, px, font, col = ink) => { c.font = `700 ${px.toFixed(1)}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.lineWidth = Math.max(2, px * .22); c.strokeStyle = halo; c.lineJoin = 'round'; c.strokeText(txt, X, Y); c.fillStyle = col; c.fillText(txt, X, Y); };
  const fs = Math.max(12, Math.min(22, H * .021)) * Math.min(1.25, Math.sqrt(zm));
  REGIONS.forEach(([n, lo, la]) => { const [X, Y] = S2(lo, la); label(n, X, Y, fs * 1.5, FONT.kufi, 'rgba(92,62,38,.75)'); });
  // the roads, drawn as they go
  ROADS.forEach(([, pts, a, b, lab, main, sea]) => {
    const f = seg(p, a, b); if (f <= 0) return;
    const D = st.dense.get(pts), S = D.map(([lo, la]) => S2(lo, la)), cum = [0];
    for (let i = 1; i < S.length; i++) cum.push(cum[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
    const Lh = cum[cum.length - 1] * smooth(f); let hx = S[0][0], hy2 = S[0][1], hi = 0;
    c.beginPath(); c.moveTo(S[0][0], S[0][1]);
    for (let i = 1; i < S.length; i++) { if (cum[i] <= Lh) { c.lineTo(S[i][0], S[i][1]); hx = S[i][0]; hy2 = S[i][1]; hi = i; } else { const u = (Lh - cum[i - 1]) / (cum[i] - cum[i - 1]); hx = mix(S[i - 1][0], S[i][0], u); hy2 = mix(S[i - 1][1], S[i][1], u); c.lineTo(hx, hy2); hi = i - 1 + u; break; } }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,190,90,${main ? .28 : .16})`; c.lineWidth = main ? 9 : 6; c.stroke();
    c.globalCompositeOperation = 'source-over'; c.strokeStyle = main ? '#8a3b1e' : 'rgba(120,64,34,.85)'; c.lineWidth = main ? 3.2 : 2.2; c.setLineDash(main ? [10, 6] : [5, 6]); c.stroke(); c.restore();
    const atSea = sea && hi / (D.length - 1) * (pts.length - 1) > sea[0] && hi / (D.length - 1) * (pts.length - 1) < sea[1];
    if (f < 1) { // the envoy on the road (a rider's mark), at sea a small ship
      glow(c, hx, hy2, 22, [255, 200, 110], .5 + .2 * Math.sin(t * 6));
      if (atSea) { c.fillStyle = '#4c3626'; c.beginPath(); c.moveTo(hx - 10, hy2); c.quadraticCurveTo(hx, hy2 + 6, hx + 10, hy2); c.closePath(); c.fill(); c.beginPath(); c.moveTo(hx, hy2 - 1); c.lineTo(hx, hy2 - 16); c.lineTo(hx + 8, hy2 - 4); c.closePath(); c.fillStyle = '#efe0bc'; c.fill(); c.strokeStyle = '#4c3626'; c.lineWidth = 1.2; c.stroke(); }
      else { c.fillStyle = '#efe0bc'; c.strokeStyle = '#4c3626'; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy2, 6, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#8a3b1e'; c.beginPath(); c.arc(hx, hy2, 2.5, 0, TAU); c.fill(); }
    } else { glow(c, hx, hy2, 30, [255, 206, 120], .35); }
    const la = fade(p, b - .012, b + .004); if (la > 0) { c.save(); c.globalAlpha = la; const [ex, ey] = S[S.length - 1], dy = lab === 'هوذة بن علي' ? 28 : lab === 'الحارث بن شمر' || lab === 'المقوقس' ? -34 : 30; const dx = lab === 'قيصر' ? -fs * 1.9 : 0; label(lab, ex + dx, ey + (dx ? fs * .2 : dy * fs / 18), fs * (main ? 1.08 : .9), FONT.naskh); c.restore(); }
  });
  { const [X, Y] = S2(39.6, 24.47); glow(c, X, Y, 46, [255, 210, 130], .5); c.strokeStyle = `rgba(255,214,140,${.5 + .3 * Math.sin(t * 2.4)})`; c.lineWidth = 2; c.beginPath(); c.arc(X, Y, 14 + 6 * ((t * .6) % 1), 0, TAU); c.stroke(); label('المدينة', X - fs * 2.6, Y + fs * .3, fs * 1.15, FONT.naskh); }
  { const [X, Y] = S2(29.92, 31.2); label('الإسكندريّة', X, Y + fs * 1.4, fs * .95, FONT.naskh); }
  const v = c.createRadialGradient(ox, oy, Math.min(W, H) * .3, ox, oy, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(40,24,12,0)'); v.addColorStop(1, 'rgba(40,24,12,.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
// the letter in someone's hand: a small pale sheet with its seal; k lights it
function letter(c, X, Y, s, k, t) {
  c.save(); c.translate(X, Y); c.rotate(-.15);
  c.fillStyle = '#efe4c8'; c.strokeStyle = 'rgba(90,60,30,.6)'; c.lineWidth = Math.max(.5, .01 * s);
  c.fillRect(-.16 * s, -.11 * s, .32 * s, .22 * s); c.strokeRect(-.16 * s, -.11 * s, .32 * s, .22 * s);
  c.restore();
  glow(c, X, Y, .5 * s * (1 + k * 2), [255, 206, 120], .25 + .45 * k);
  c.fillStyle = '#f3d98f'; c.beginPath(); c.arc(X - .07 * s, Y + .04 * s, Math.max(1, .035 * s), 0, TAU); c.fill();
}
const hold = (h, dx = 0, dy = 0) => (h ? [h[0] + dx, h[1] + dy] : null);
// ---------- Rum: a hall of marble columns, a band of gold mosaic with high windows, the king under a canopy ----------
const RCAM = [[.355, .8, 1.55, -1.6, .1, .55, 1], [.41, -1.5, 1.45, .2, .1, .55, 1.05], [.475, -2.1, 1.5, .8, .1, .55, 1.08]];
function rumShot(c, st, W, H, phone, p, t) {
  const V = view(W, H, phone, keyAt(RCAM, p)), P = V.P, F = V.F, L = mkL([132, 122, 126], [255, 224, 176], [150, 140, 140], -1);
  const S0 = (x, z, y = 0) => { const [X, Y, v] = P(x, y, z); return [X, Y, F / v, v]; };
  c.fillStyle = rgb(L.sh([120, 104, 96], .2)); c.fillRect(0, 0, W, H);
  // the back wall and the band of gold mosaic with its windows
  quad(c, V, [[-18, 0, 14.5], [18, 0, 14.5], [18, 11, 14.5], [-18, 11, 14.5]], rgb(L.sh([150, 132, 120], .25)));
  { const a = P(-18, 9.6, 14.5), b = P(18, 6.2, 14.5), g = c.createLinearGradient(0, a[1], 0, b[1]); g.addColorStop(0, '#5a4422'); g.addColorStop(.3, '#a07a36'); g.addColorStop(.7, '#8a6a30'); g.addColorStop(1, '#4e3a1e'); c.fillStyle = g; c.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    if (!st.tess) { const cv = mk(24, 24), g2 = cv.getContext('2d'), R = rng(77); for (let i = 0; i < 64; i++) { g2.fillStyle = `rgba(${R() < .5 ? '255,226,150' : '60,40,16'},${.12 + R() * .2})`; g2.fillRect((i % 8) * 3, ((i / 8) | 0) * 3, 2.4, 2.4); } st.tess = cv; }
    c.fillStyle = c.createPattern(st.tess, 'repeat'); c.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    c.fillStyle = '#26305a'; const d0 = P(-18, 9.6, 14.5), d1 = P(18, 9.3, 14.5); c.fillRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]); }
  for (let x = -14; x <= 14; x += 3.5) { // the windows, the light falling from them
    const a = P(x - .45, 7, 14.45), b = P(x + .45, 8.6, 14.45), r = (b[0] - a[0]) / 2;
    c.fillStyle = '#f2ecdc'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0], b[1] + r); c.arc(a[0] + r, b[1] + r, r, Math.PI, 0); c.lineTo(b[0], a[1]); c.closePath(); c.fill();
    glow(c, a[0] + r, (a[1] + b[1]) / 2, r * 4, [255, 236, 200], .35);
  }
  // the aisle behind the arcade (dark), then the arcade with its arches, and its columns
  { c.fillStyle = rgb(L.sh([110, 96, 92], .12, .1)); c.beginPath(); const a = P(-18, 0, 12), b = P(18, 6.4, 12); c.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
    for (let x = -16.5; x < 16.5; x += 3) { const l = P(x + .3, 0, 12), r = P(x + 2.7, 5, 12), rad = (r[0] - l[0]) / 2; c.moveTo(l[0], l[1]); c.lineTo(l[0], r[1]); c.arc(l[0] + rad, r[1], rad, Math.PI, 0, false); c.lineTo(r[0], l[1]); c.closePath(); }
    c.fillStyle = rgb(L.sh([200, 190, 178], .45)); c.fill('evenodd');
    for (let x = -15; x <= 15; x += 3) column(c, V, x, 12, .24, 5, [190, 196, 186], L, .08, [150, 124, 70]); }
  // curtains in two arches (deep purple), drawn back
  [[4.5, 7.5], [-13.5, -10.5]].forEach(([x0, x1]) => { const a = P(x0 + .3, 5, 11.9), b = P(x1 - .3, 0, 11.9), w = b[0] - a[0]; c.fillStyle = rgb(L.sh([92, 38, 86], .45)); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(a[0] + w * .3, a[1] + (b[1] - a[1]) * .5, a[0] + w * .12, b[1]); c.lineTo(a[0], b[1]); c.closePath(); c.moveTo(b[0], a[1]); c.quadraticCurveTo(b[0] - w * .3, a[1] + (b[1] - a[1]) * .5, b[0] - w * .12, b[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill(); });
  // the marble floor: a grid in perspective, discs of porphyry
  { const a = P(0, 0, 12); const g = c.createLinearGradient(0, a[1], 0, H); g.addColorStop(0, rgb(L.sh([196, 190, 180], .5))); g.addColorStop(1, rgb(L.sh([214, 206, 194], .7))); c.fillStyle = g; c.fillRect(0, a[1], W, H - a[1]);
    c.strokeStyle = rgb(L.sh([120, 110, 104], .3), .5); c.lineWidth = 1; c.beginPath();
    for (let z = 2.4; z <= 12; z += 1.6) { const l = P(-18, 0, z), r = P(18, 0, z); c.moveTo(l[0], l[1]); c.lineTo(r[0], r[1]); }
    for (let x = -18; x <= 18; x += 1.6) { const n = P(x, 0, 2.4), f = P(x, 0, 12); c.moveTo(n[0], n[1]); c.lineTo(f[0], f[1]); } c.stroke();
    for (let x = -9.6; x <= 9.6; x += 3.2) for (let z = 4; z <= 11; z += 3.2) { const [X, Y, v] = P(x + .8, 0, z + .8), r = .32 * F / v; c.fillStyle = rgb(L.sh([120, 50, 60], .5), .55); c.beginPath(); c.ellipse(X, Y, r, r * Math.min(.5, (V.cy) / v * 1.1), 0, 0, TAU); c.fill(); } }
  // courtiers along the far side, guards behind the throne
  const CLs = [[74, 58, 82], [52, 58, 84], [52, 70, 60], [88, 64, 50], [70, 52, 64]];
  for (let i = 0; i < 9; i++) { const x = .8 + i * 1.15 + hash(i, 1) * .3, z = 10.2 + hash(i, 2) * .5, [X, Y, s, v] = S0(x, z); person(c, X, Y, s, { dir: -1, cl: CLs[i % 5], hd: [64, 52, 46], trim: i % 3 ? null : [140, 110, 60], fa: .12 }, L); void v; }
  [[-5.8, 9.7, 1], [-1.0, 9.9, -1]].forEach(([x, z, d]) => { const [X, Y, s] = S0(x, z); c.strokeStyle = rgb(L.sh([90, 80, 70], .5)); c.lineWidth = Math.max(1, .04 * s); c.beginPath(); c.moveTo(X + .25 * s * d, Y); c.lineTo(X + .3 * s * d, Y - 2.6 * s); c.stroke(); person(c, X, Y, s, { dir: d, cl: [120, 44, 38], head: 'helm', arms: [[.26, 1.2]], fa: .08 }, L); });
  // the canopy over the throne: back columns, the dais, the throne, the king, the front columns, the dome
  [-4.7, -2.1].forEach((x) => column(c, V, x, 9.4, .09, 3.7, [196, 192, 182], L, .05, [150, 118, 60]));
  const box = (x0, x1, z0, y0, y1, col, lam) => { quad(c, V, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], rgb(L.sh(col, lam))); quad(c, V, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z0 + 3.2], [x0, y1, z0 + 3.2]], rgb(L.sh(col, lam + .25))); };
  box(-5.4, -1.4, 6.5, 0, .25, [186, 176, 166], .35); box(-5.0, -1.8, 6.9, .25, .5, [120, 50, 60], .35);
  { const [X, Y, s] = S0(-3.4, 8.6, .5); c.fillStyle = rgb(L.sh([150, 118, 60], .5)); c.fillRect(X - .5 * s, Y - 2.1 * s, 1.0 * s, 2.1 * s); c.fillStyle = rgb(L.sh([96, 40, 92], .5)); c.fillRect(X - .42 * s, Y - 1.95 * s, .84 * s, 1.5 * s); c.beginPath(); c.arc(X, Y - 2.1 * s, .5 * s, Math.PI, 0); c.fillStyle = rgb(L.sh([150, 118, 60], .6)); c.fill(); }
  const rise = smooth(seg(p, .418, .436)), lift = smooth(seg(p, .426, .446));
  const kingArms = p < .404 ? [[.32, .62]] : p < .418 ? [[mix(.32, .5, smooth(seg(p, .404, .414))), mix(.62, .98, smooth(seg(p, .404, .414)))]] : [[mix(.42, .22, lift), mix(1.05, 2.0, lift)]];
  const [KX, KY, ks] = S0(-3.25, 8.3, .5);
  const king = person(c, KX, KY, ks, { a: 'sit', b: 'stand', k: rise, dir: 1, cl: [96, 40, 92], trim: [150, 118, 60], head: 'crownB', hd: [60, 46, 42], arms: kingArms, lit: .8 }, L);
  // the envoy: walks in, bows to his knees, holds up the letter; a robe is laid on him
  const wk = smooth(seg(p, .36, .392)), ex = mix(7.5, -1.25, wk), walking = wk > 0 && wk < 1, kb = smooth(seg(p, .392, .402)) * (1 - smooth(seg(p, .446, .456)));
  const robe = smooth(seg(p, .452, .464)), [EX, EY, es] = S0(ex, 7.7);
  const envArms = p < .4 ? undefined : p < .418 ? [[.52, mix(.7, 1.15, smooth(seg(p, .4, .41)))]] : undefined;
  const env = person(c, EX, EY - (walking ? Math.abs(Math.sin(p * 900)) * .03 * es : 0), es, { a: 'stand', b: 'kbow', k: kb, dir: -1, cl: lerp([126, 102, 76], [104, 48, 86], robe), hd: [150, 116, 74], trim: robe > .5 ? [150, 118, 60] : null, arms: envArms, lit: .9 }, L);
  // the letter: in the envoy's hand, then the king's, held high in light
  if (p >= .392) { const hk = p < .416 ? hold(env && env.hands[0]) : hold(king && king.hands[0]); if (hk) letter(c, hk[0], hk[1], es, p < .416 ? .2 : .3 + .7 * lift, t); }
  else if (env) letter(c, env.hands[0][0], env.hands[0][1], es, 0, t);
  if (lift > 0 && king) { const [lx, ly] = king.hands[0]; glow(c, lx, ly, ks * 3.5, [255, 214, 140], .3 * lift); }
  // the courtier with the robe
  { const k2 = smooth(seg(p, .436, .452)), x = mix(1.8, -.2, k2), z = mix(10, 8.2, k2), [X, Y, s] = S0(x, z); if (p > .43) { const r = person(c, X, Y, s, { dir: -1, cl: [74, 58, 82], hd: [64, 52, 46], arms: [[.45, 1.15]], alpha: 1 - smooth(seg(p, .462, .472)) }, L); if (r && robe < 1) { const [hx, hy2] = r.hands[0]; c.fillStyle = rgb(L.sh([104, 48, 86], .7)); c.fillRect(hx - .25 * s, hy2 - .05 * s, .5 * s, .18 * s); } } }
  [-4.7, -2.1].forEach((x) => column(c, V, x, 7.2, .1, 3.7, [210, 206, 196], L, 0, [150, 118, 60]));
  { const [X, Y, s] = S0(-3.4, 8.3, 3.7); c.fillStyle = rgb(L.sh([150, 118, 60], .55)); c.fillRect(X - 1.5 * s, Y - .1 * s, 3 * s, .3 * s); c.beginPath(); c.ellipse(X, Y - .1 * s, 1.35 * s, 1.0 * s, 0, Math.PI, 0); c.fill(); c.strokeStyle = rgb(L.sh([90, 66, 34], .3)); c.lineWidth = Math.max(1, .03 * s); c.stroke(); }
  // hanging lamps; light from the windows; the near column and two near shapes in the dark
  [[-.6, 4.2, 9.4, 1], [3.4, 4.6, 10.4, 2], [7.4, 4.3, 9.8, 3], [-7.5, 4.6, 10.6, 4]].forEach(([x, y, z, i]) => { const [X, Y, s] = S0(x, z, y), [, Yt] = S0(x, z, 9); c.strokeStyle = 'rgba(40,30,20,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(X, Yt); c.lineTo(X, Y); c.stroke(); c.strokeStyle = rgb(L.sh([150, 118, 60], .6)); c.lineWidth = Math.max(1, .05 * s); c.beginPath(); c.ellipse(X, Y, .45 * s, .1 * s, 0, 0, TAU); c.stroke(); for (let k = 0; k < 5; k++) lamp(c, X + (k - 2) * .18 * s, Y - .08 * s, .1 * s, t, i * 3 + k); });
  c.save(); c.globalCompositeOperation = 'lighter'; for (let x = -14; x <= 14; x += 3.5) { const a = P(x, 7.8, 14.4), b = P(x + 4.5, 0, 9 - (x + 14) * .05); const g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, 'rgba(255,236,196,.16)'); g.addColorStop(1, 'rgba(255,236,196,0)'); c.fillStyle = g; const w0 = .4 * F / a[2], w1 = 1.1 * F / b[2]; c.beginPath(); c.moveTo(a[0] - w0, a[1]); c.lineTo(a[0] + w0, a[1]); c.lineTo(b[0] + w1, b[1]); c.lineTo(b[0] - w1, b[1]); c.closePath(); c.fill(); } c.restore();
  [[6.2, 3], [7.5, 3.4]].forEach(([x, z], i) => { const [X, Y, s] = S0(x, z); person(c, X, Y, s, { dir: -1, cl: [44, 36, 44], hd: [40, 32, 30], lit: .1, arms: i ? [[.2, .8]] : undefined }, mkL([60, 52, 60], [120, 100, 90], [40, 30, 30], -1)); });
  column(c, V, 9.4, 2.2, .34, 7, [120, 116, 110], mkL([70, 64, 66], [150, 130, 110], [40, 30, 30], -1), 0, [90, 70, 40]);
}
// ---------- Fars: the great arch at dusk, then inside under its vault: carpets, lamps, the king on a high seat ----------
const FCAM = [[.468, 0, 2.2, -52, 0, .66, 1], [.5, 0, 2.1, -38, 0, .65, 1], [.522, 0, 1.7, -6, 0, .6, 1], [.56, 0, 1.65, 2.5, 0, .6, 1.05], [.625, 0, 1.6, 4.5, 0, .6, 1.08]];
const VH = 15, VW = 7, VD = 22; // the vault: height, half width, depth
const vy = (x) => VH * Math.max(0, 1 - (x / VW) ** 2);
function farsShot(c, st, W, H, phone, p, t) {
  const K = keyAt(FCAM, p), zn = Math.max(0, K[2] + .5), V = view(W, H, phone, K), P = V.P, F = V.F, Lout = mkL([110, 96, 140], [255, 160, 110], [70, 60, 110], 1), L = mkL([96, 84, 112], [255, 176, 108], [40, 32, 56], -1);
  const S0 = (x, z, y = 0) => { const [X, Y, v] = P(x, y, z); return [X, Y, F / v, v]; };
  // the dusk: indigo above, a last red at the horizon, the first stars; a dark plain and palms
  sky(c, W, V.hy + 2, [16, 20, 58], [64, 54, 112], [214, 124, 98]);
  st.stars.slice(0, 260).forEach(([u, v, m, ph]) => { const y = v * V.hy * .8; c.fillStyle = `rgba(236,236,255,${Math.min(1, m * .5) * (.6 + .4 * Math.sin(t * 1.4 + ph * 7)) * c01((V.hy - y) / (V.hy * .3))})`; c.fillRect(u * W, y, m > 1.2 ? 1.7 : 1.1, m > 1.2 ? 1.7 : 1.1); });
  { const g = c.createLinearGradient(0, V.hy, 0, H); g.addColorStop(0, '#3e3040'); g.addColorStop(1, '#5a4438'); c.fillStyle = g; c.fillRect(0, V.hy, W, H - V.hy); }
  // inside: floor and carpets, the vault in bands from the back to the mouth, the back wall
  const brick = [168, 124, 90], lampW = (z) => .5 + .5 * Math.sin(z * .7);
  quad(c, V, [[-VW, 0, zn], [VW, 0, zn], [VW, 0, VD], [-VW, 0, VD]], rgb(L.sh([112, 54, 44], .45)));
  quad(c, V, [[-5.6, .01, Math.max(1, zn)], [5.6, .01, Math.max(1, zn)], [5.6, .01, 21], [-5.6, .01, 21]], rgb(L.sh([128, 34, 36], .55)));
  { c.strokeStyle = rgb(L.sh([170, 130, 60], .6), .7); c.lineWidth = Math.max(1, F * .002); c.beginPath(); for (let z = 1; z <= 21; z += 2.5) { if (z < zn) continue; const a = P(-5.6, .02, z), b = P(5.6, .02, z); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } [-5.6, -5.2, -1.4, 1.4, 5.2, 5.6].forEach((x) => { const a = P(x, .02, Math.max(1, zn)), b = P(x, .02, 21); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }); c.stroke();
    for (let z = 2.25; z < 21; z += 2.5) for (const x of [-3.3, 0, 3.3]) { if (z < zn + .7) continue; const [X, Y, v] = P(x, .02, z), r = .42 * F / v; c.fillStyle = rgb(L.sh(x ? [40, 52, 104] : [176, 132, 60], .6), .45); c.beginPath(); c.ellipse(X, Y, r, r * Math.min(.6, 1.6 / v), 0, 0, TAU); c.fill(); } }
  quad(c, V, (() => { const a = []; for (let i = 0; i <= 20; i++) { const x = -VW + i * VW / 10; a.push([x, vy(x), VD]); } return a; })(), rgb(L.sh([176, 140, 104], .35)));
  for (let k = -2; k <= 2; k++) { const x = k * 2.4, [X0, Y0] = P(x - .6, 0, VD - .01), [X1, Y1] = P(x + .6, 3.6 + (2 - Math.abs(k)) * .8, VD - .01), r = (X1 - X0) / 2; c.fillStyle = rgb(L.sh([60, 44, 52], .1)); c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X0, Y1 + r); c.arc(X0 + r, Y1 + r, r, Math.PI, 0); c.lineTo(X1, Y0); c.closePath(); c.fill(); }
  { const a = P(-VW, 7.4, VD - .01), b = P(VW, 6.6, VD - .01); c.fillStyle = rgb(L.sh([40, 70, 132], .5)); c.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
  const NZ = 10, NX = 18;
  for (let i = NZ - 1; i >= 0; i--) { const z0 = Math.max(zn, i * VD / NZ), z1 = (i + 1) * VD / NZ; if (z1 <= z0) continue; for (let j = 0; j < NX; j++) { const x0 = -VW + j * 2 * VW / NX, x1 = x0 + 2 * VW / NX, side = Math.abs((x0 + x1) / 2) / VW, warm = lampW(z0) * (1 - c01((vy((x0 + x1) / 2) - 2) / 10)); const col = lerp(L.sh(brick, .08 + .3 * warm * side), [30, 24, 46], c01(1 - side) * .5); quad(c, V, [[x0, vy(x0), z0], [x1, vy(x1), z0], [x1, vy(x1), z1], [x0, vy(x0), z1]], rgb(col)); } }
  { c.strokeStyle = 'rgba(30,20,24,.35)'; c.lineWidth = 1; c.beginPath(); for (let i = 1; i < NZ; i++) { const z = i * VD / NZ; if (z < zn) continue; for (let j = 0; j <= 24; j++) { const x = -VW + j * VW / 12, q = P(x, vy(x), z); j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } } c.stroke(); }
  // the hanging crown (on its chain from the crown of the vault) and the high seat
  { const [X, Y, s] = S0(0, 20.6, 4.6), [, Yt] = S0(0, 20.6, vy(0)); c.strokeStyle = 'rgba(150,118,60,.8)'; c.lineWidth = Math.max(1, .03 * s); c.beginPath(); c.moveTo(X, Yt); c.lineTo(X, Y - .9 * s); c.stroke(); c.fillStyle = rgb(L.sh([170, 132, 64], .8)); c.beginPath(); c.moveTo(X - .55 * s, Y); c.lineTo(X - .62 * s, Y - .6 * s); c.lineTo(X - .3 * s, Y - .35 * s); c.lineTo(X, Y - .75 * s); c.lineTo(X + .3 * s, Y - .35 * s); c.lineTo(X + .62 * s, Y - .6 * s); c.lineTo(X + .55 * s, Y); c.closePath(); c.fill(); glow(c, X, Y - .4 * s, s, [255, 190, 110], .25); }
  const steps = [[-2.4, 2.4, 18.6, .45], [-2.0, 2.0, 19.2, .9], [-1.6, 1.6, 19.8, 1.35]];
  steps.forEach(([x0, x1, z0, y]) => { quad(c, V, [[x0, y - .45, z0], [x1, y - .45, z0], [x1, y, z0], [x0, y, z0]], rgb(L.sh([150, 116, 84], .5))); quad(c, V, [[x0, y, z0], [x1, y, z0], [x1, y, 22], [x0, y, 22]], rgb(L.sh([120, 40, 40], .6))); });
  { const [X, Y, s] = S0(0, 21, 1.35); c.fillStyle = rgb(L.sh([150, 116, 60], .6)); c.fillRect(X - .9 * s, Y - 2.4 * s, 1.8 * s, 2.4 * s); c.fillStyle = rgb(L.sh([40, 52, 104], .5)); c.fillRect(X - .75 * s, Y - 2.25 * s, 1.5 * s, 1.9 * s); }
  // the king: seated, the letter comes up to him, he tears it
  const tear = smooth(seg(p, .556, .572)), [KX, KY, ks] = S0(0, 20.7, 1.35);
  const kArms = p < .53 ? [[.32, .62, .2], [-.32, .62, -.2]] : tear <= 0 ? [[.14, 1.05, .2], [-.14, 1.05, -.2]] : [[mix(.14, .5, tear), mix(1.05, 1.15, tear), .2], [mix(-.14, -.5, tear), mix(1.05, 1.15, tear), -.2]];
  const king = person(c, KX, KY, ks, { a: 'sitF', dir: 1, cl: [128, 36, 32], trim: [160, 124, 60], head: 'crownP', hd: [60, 44, 40], arms: kArms, lit: .9 }, L);
  // courtiers in two rows facing the carpet, guards at the steps, lamps along the walls
  const rows = []; for (let z = 4; z <= 18; z += 2) rows.push([-4.3, z, 1], [4.3, z + 1, -1]);
  const gk = smooth(seg(p, .58, .6)) * (1 - smooth(seg(p, .614, .624)));
  rows.concat([[-2.6, 18.2, 1, 'g'], [2.6, 18.2, -1, 'g']]).sort((a, b) => b[1] - a[1]).forEach(([x, z, d, g], i) => {
    const gx = g ? x - d * gk * 1.3 : x, gz = g ? z - gk * 2.2 : z, [X, Y, s, v] = S0(gx, gz); if (v < 1) return;
    if (g) { c.strokeStyle = rgb(L.sh([90, 80, 70], .5)); c.lineWidth = Math.max(1, .04 * s); c.beginPath(); c.moveTo(X + .25 * s * d, Y); c.lineTo(X + .3 * s * d, Y - 2.6 * s); c.stroke(); }
    person(c, X, Y, s, { dir: d, cl: g ? [70, 40, 36] : [[44, 48, 86], [96, 40, 36], [60, 46, 70]][i % 3], hd: [52, 40, 36], head: g ? 'helm' : 'cap', trim: g ? null : [150, 118, 60], fa: Math.min(.5, v / 50), arms: g ? [[.3, 1.2]] : undefined }, L);
  });
  for (let z = 3; z <= 21; z += 3) [-6.4, 6.4].forEach((x, j) => { const [X, Y, s, v] = S0(x, z, 2.4); if (v < 1) return; c.fillStyle = 'rgba(40,28,24,.8)'; c.fillRect(X - .05 * s, Y, .1 * s, 2.4 * s); lamp(c, X, Y - .1 * s, .16 * s, t, z + j * 7); });
  [-1.9, 1.9].forEach((x, j) => { const [X, Y, s] = S0(x, 18.3, 1.5); lamp(c, X, Y, .18 * s, t, 40 + j); });
  // the envoy: up the carpet (seen from behind); the letter flies up the steps; he is turned away
  const up = smooth(seg(p, .474, .515)), back = smooth(seg(p, .586, .618)), ez = mix(mix(2, 16.4, up), 13.6, back), [EX, EY, es] = S0(0, ez);
  const env = person(c, EX, EY, es, { a: 'front', dir: 1, cl: [118, 94, 70], hd: [140, 108, 72], lit: .6, arms: p < .52 && p > .51 ? [[.3, 1.15]] : undefined }, L);
  if (p < .52 && env) letter(c, env.hands[0][0], env.hands[0][1] - (p < .51 ? -.2 * es : 0), es, 0, t);
  else if (p < .535 && king && env) { const u = smooth(seg(p, .52, .535)), a = env.hands[0], b = king.hands[0]; letter(c, mix(a[0], b[0], u), mix(a[1], b[1], u) - Math.sin(u * Math.PI) * 1.2 * ks, mix(es, ks, u), .1, t); }
  else if (tear <= 0 && king) letter(c, (king.hands[0][0] + king.hands[1][0]) / 2, king.hands[0][1], ks, .15, t);
  if (tear > 0 && king) { // the two halves in his hands, then the pieces falling
    const fall = seg(p, .568, .62);
    [0, 1].forEach((j) => { const h = king.hands[j]; if (fall < .2) { c.fillStyle = '#efe4c8'; c.fillRect(h[0] - .08 * ks, h[1] - .1 * ks, .16 * ks, .2 * ks); } });
    for (let i = 0; i < 12; i++) { const sx = hash(i, 5) - .5, h0 = king.hands[i % 2], X = h0[0] + (sx * 2.4 + Math.sin(fall * 6 + i) * .3) * ks * fall, Y = h0[1] + fall * fall * 3 * ks * (.7 + hash(i, 6) * .6) + fall * ks * .2; if (fall <= 0) break; c.save(); c.translate(X, Y); c.rotate(fall * 9 * (hash(i, 7) - .5) + i); c.globalAlpha = 1 - smooth(seg(fall, .7, 1)); c.fillStyle = '#efe4c8'; c.fillRect(-.06 * ks, -.04 * ks, .12 * ks, .08 * ks); c.restore(); }
  }
  // the front of the great arch: a brick face with rows of blind arches round the opening
  if (K[2] < -.5) { c.beginPath(); [[-36, 0], [36, 0], [36, 22], [-36, 22]].forEach(([x, y], i) => { const q = P(x, y, 0); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); for (let i = 0; i <= 30; i++) { const x = -VW + i * VW / 15, q = P(x, vy(x), 0); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath();
    const top = P(0, 22, 0), g = c.createLinearGradient(0, top[1], 0, P(0, 0, 0)[1]); g.addColorStop(0, rgb(Lout.sh([176, 136, 100], .55))); g.addColorStop(.6, rgb(Lout.sh([170, 128, 96], .35))); g.addColorStop(1, rgb(Lout.sh([120, 90, 76], .15))); c.fillStyle = g; c.fill('evenodd');
    c.save(); c.clip('evenodd'); c.fillStyle = rgb(Lout.sh([96, 70, 60], .1), .8);
    for (let r = 0; r < 4; r++) for (let x = -34; x <= 34; x += 2.6) { if (Math.abs(x) < VW + 1.2) continue; const y0 = 1.5 + r * 5.1, a = P(x - .7, y0, -.01), b = P(x + .7, y0 + 3.6, -.01), rad = (b[0] - a[0]) / 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0], b[1] + rad); c.arc(a[0] + rad, b[1] + rad, rad, Math.PI, 0); c.lineTo(b[0], a[1]); c.closePath(); c.fill(); }
    c.restore();
    c.strokeStyle = rgb(Lout.sh([110, 78, 60], .2)); c.lineWidth = Math.max(2, F * .02 / Math.max(1, -V.cy + 1)); c.beginPath(); for (let i = 0; i <= 30; i++) { const x = -VW + i * VW / 15, q = P(x, vy(x), 0); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke();
    c.strokeStyle = rgb(Lout.sh([120, 88, 70], .2), .35); c.lineWidth = 1; c.beginPath(); for (let y = 1.5; y < 22; y += 1.7) { const a = P(-36, y, -.02), b = P(36, y, -.02); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke();
    const tl = P(-36, 22, 0), tr = P(36, 22, 0); c.fillStyle = rgb(Lout.sh([150, 112, 90], .5)); c.fillRect(tl[0], tl[1] - 3, tr[0] - tl[0], 4); }
  st.fpalms.forEach(([x, z, h, ln, sd]) => { const [X, Y, v] = P(x, 0, z); if (v < 3 || K[2] > -.5) return; palm(c, X, Y, F / v, h, ln, sd, mkL([60, 50, 84], [200, 120, 90], [50, 40, 80], 1), Math.min(.6, v / 120), t); });
  // the warm light of the hall spills out on the ground before the arch
  if (K[2] < -.5) { const [X, Y, s] = S0(0, 0); glow(c, X, Y, 8 * s, [255, 170, 100], .18); }
}
// a far range painted across the screen: flat-topped mountains (al-Habasha) or low hills; z its distance
function ridge(c, V, cx, z, base, amp, col, seed, flat) {
  const v = z, step = 6; c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, V.H);
  for (let X = 0; X <= V.W + step; X += step) { const x = cx + (X - V.ox) * v / V.F, n = .5 + .5 * Math.sin(x * .011 + seed) * Math.sin(x * .0043 + seed * 2.3) + .2 * Math.sin(x * .031 + seed * 5); const h = base + amp * (flat ? Math.min(1, Math.max(0, n * 2 - .5)) : n); c.lineTo(X, V.hy - (h - V.cy) * V.F / v); }
  c.lineTo(V.W, V.H); c.closePath(); c.fill();
}
const acacia = (c, X, Y, s, L, fa) => { c.strokeStyle = rgb(L.sh([84, 66, 50], .4, fa)); c.lineWidth = Math.max(1, .14 * s); c.beginPath(); c.moveTo(X, Y); c.lineTo(X - .2 * s, Y - 2.4 * s); c.moveTo(X - .1 * s, Y - 1.4 * s); c.lineTo(X + .9 * s, Y - 2.6 * s); c.stroke(); c.fillStyle = rgb(L.sh([92, 112, 56], .7, fa)); c.beginPath(); c.ellipse(X + .3 * s, Y - 2.8 * s, 2.4 * s, .55 * s, 0, 0, TAU); c.fill(); c.fillStyle = rgb(L.sh([120, 138, 70], 1, fa)); c.beginPath(); c.ellipse(X + .1 * s, Y - 3.0 * s, 1.9 * s, .3 * s, 0, 0, TAU); c.fill(); };
// ---------- al-Habasha: the king's canopy among the stelae of the green highlands; then the shore and the two ships ----------
const HCAM = [[.7, 1.2, 1.5, -1.5, 0, .58, 1], [.778, -.2, 1.45, .6, 0, .58, 1.06]], SCAM = [[.774, 0, 1.7, -2, 0, .61, 1], [.84, 2.4, 1.9, -3.4, 0, .61, .95]];
function habShot(c, st, W, H, phone, p, t) {
  const coast = p >= .776, K = keyAt(coast ? SCAM : HCAM, p), V = view(W, H, phone, K), P = V.P, F = V.F, L = mkL([150, 158, 172], [255, 240, 210], [190, 206, 214], -1);
  const S0 = (x, z, y = 0) => { const [X, Y, v] = P(x, y, z); return [X, Y, F / v, v]; };
  sky(c, W, V.hy + 2, [56, 116, 198], [140, 186, 230], [222, 232, 232]);
  st.cloud.forEach(([u, v, w, k]) => { const x = u * W * 1.3 - W * .15 - K[1] * 4, y = V.hy * (.1 + v * .55), rw = w * W * 1.2; const q = c.createRadialGradient(x, y, 0, x, y, rw); q.addColorStop(0, `rgba(255,255,255,${.35 + .2 * k})`); q.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = q; c.beginPath(); c.ellipse(x, y, rw, rw * .22, 0, 0, TAU); c.fill(); });
  if (!coast) {
    ridge(c, V, K[1], 420, 30, 70, [150, 176, 190], 1.3, true); ridge(c, V, K[1], 230, 10, 46, [118, 150, 132], 2.1, true); ridge(c, V, K[1], 110, 0, 18, [104, 140, 92], 3.7, false);
    { const g = c.createLinearGradient(0, V.hy, 0, H); g.addColorStop(0, rgb(L.sh([120, 146, 78], .8))); g.addColorStop(1, rgb(L.sh([150, 152, 88], .9))); c.fillStyle = g; c.fillRect(0, V.hy, W, H - V.hy); }
    [[-14, 22], [2, 34], [16, 30], [-24, 40]].forEach(([x, z]) => { const [X, Y, s, v] = S0(x, z); acacia(c, X, Y, s, L, Math.min(.5, v / 80)); });
    c.strokeStyle = rgb(L.sh([96, 120, 56], .7), .7); c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 260; i++) { const x = -14 + hash(i, 1) * 34, z = .5 + hash(i, 2) ** 1.5 * 16, [X, Y, v] = P(x, 0, z); if (v < .6) continue; const hh = (.12 + .14 * hash(i, 3)) * F / v; for (let k = -1; k <= 1; k++) { c.moveTo(X + k * hh * .3, Y); c.quadraticCurveTo(X + k * hh * .35, Y - hh * .6, X + k * hh * .6, Y - hh); } } c.stroke();
    { const a2 = P(-1, .01, 7.2), b2 = P(4, .01, -1), g2 = c.createLinearGradient(a2[0], a2[1], b2[0], b2[1]); g2.addColorStop(0, rgb(L.sh([180, 160, 118], .7), .7)); g2.addColorStop(1, rgb(L.sh([180, 160, 118], .7), .2)); quad(c, V, [[-1.6, .01, 7.4], [.2, .01, 7.4], [5, .01, 0], [2, .01, 0]], 'rgba(0,0,0,0)'); c.fillStyle = g2; c.fill(); }
    [[13.5, 20, 7, .9], [4.2, 30, 9, 1], [10.5, 26, 11, 1.1], [7, 22, 15, 1.4]].sort((a, b) => b[1] - a[1]).forEach(([x, z, h, w]) => { // the stelae: granite, carved in storeys, rounded heads
      const a = P(x - w / 2, 0, z), b = P(x + w / 2, h, z), r = (b[0] - a[0]) / 2, fa = Math.min(.35, (a[2]) / 90), top = b[1] + r * .9;
      const g = c.createLinearGradient(a[0], 0, b[0], 0); g.addColorStop(0, rgb(L.sh([164, 146, 126], 1, fa))); g.addColorStop(.6, rgb(L.sh([150, 134, 118], .5, fa))); g.addColorStop(1, rgb(L.sh([120, 108, 98], .15, fa))); c.fillStyle = g;
      c.beginPath(); c.moveTo(a[0] - r * .06, a[1]); c.lineTo(a[0], top); c.arc(a[0] + r, top, r, Math.PI, 0); c.lineTo(b[0] + r * .06, a[1]); c.closePath(); c.fill();
      c.fillStyle = rgb(L.sh([70, 60, 54], .1, fa), .55); c.fillRect(a[0] + r * .62, a[1] - (a[1] - b[1]) * .1, r * .76, (a[1] - b[1]) * .1);
      const fl = Math.floor(h / 2.2); for (let i = 2; i < fl; i++) { const y = mix(a[1], b[1], i / fl); c.fillRect(a[0] + r * .1, y, r * 1.8, Math.max(1, r * .05)); if (i > fl / 2) c.fillRect(a[0] + r * .78, y - (a[1] - b[1]) / fl * .55, r * .44, (a[1] - b[1]) / fl * .35); }
    });
    [[-9, 14], [12, 9.5]].forEach(([x, z]) => { const [X, Y, s] = S0(x, z); acacia(c, X, Y, s, L, .05); });
    // the canopy, the dais, the hanging behind the seat
    const post = (x, z) => { const [X0, Y0, s] = S0(x, z), [, Y1] = S0(x, z, 3.2); c.fillStyle = rgb(L.sh([92, 64, 44], .5)); c.fillRect(X0 - .06 * s, Y1, .12 * s, Y0 - Y1); };
    post(-5, 9.6); post(-1.8, 9.6);
    quad(c, V, [[-5, .35, 9.55], [-1.8, .35, 9.55], [-1.8, 3.1, 9.55], [-5, 3.1, 9.55]], rgb(L.sh([40, 90, 64], .45)));
    quad(c, V, [[-5.4, 0, 6.6], [-1.4, 0, 6.6], [-1.4, .35, 6.6], [-5.4, .35, 6.6]], rgb(L.sh([170, 150, 120], .5))); quad(c, V, [[-5.4, .35, 6.6], [-1.4, .35, 6.6], [-1.4, .35, 9.8], [-5.4, .35, 9.8]], rgb(L.sh([196, 176, 140], .8)));
    [[-5.4, 9.8, 1, 'f'], [-1.5, 10, -1, 'f'], [.6, 10.6, -1, 's'], [1.9, 10.9, -1, 's'], [3.2, 10.6, -1, 's'], [4.5, 11, -1, 's']].forEach(([x, z, d, k], i) => {
      const [X, Y, s] = S0(x, z), stick = k === 'f' ? [.3, 1.2] : [.26, 1.2];
      if (k === 's') { c.strokeStyle = rgb(L.sh([92, 72, 52], .6)); c.lineWidth = Math.max(1, .04 * s); c.beginPath(); c.moveTo(X + .24 * s * d, Y); c.lineTo(X + .3 * s * d, Y - 2.7 * s); c.stroke(); }
      person(c, X, Y, s, { dir: d, cl: i % 2 ? [184, 166, 128] : [150, 124, 90], hd: [58, 42, 32], arms: [stick] }, L);
      if (k === 's') { c.fillStyle = rgb(L.sh([150, 110, 70], .8)); c.beginPath(); c.ellipse(X + .32 * s * d, Y - 1.05 * s, .22 * s, .42 * s, 0, 0, TAU); c.fill(); c.strokeStyle = rgb(L.sh([90, 60, 40], .3)); c.stroke(); }
      else { const hx = X + .3 * s * d, hy2 = Y - 1.2 * s; c.strokeStyle = rgb(L.sh([92, 72, 52], .6)); c.lineWidth = Math.max(1, .03 * s); c.beginPath(); c.moveTo(hx, hy2); c.lineTo(hx + .1 * s * d, hy2 - .9 * s); c.stroke(); c.fillStyle = rgb(L.sh([60, 70, 40], .7)); c.beginPath(); c.ellipse(hx + .12 * s * d, hy2 - 1.15 * s, .26 * s, .34 * s, Math.sin(t * 1.5 + i) * .2, 0, TAU); c.fill(); }
    });
    { const [X, Y, s] = S0(-3.4, 8.7, .35); c.fillStyle = rgb(L.sh([110, 76, 48], .6)); c.fillRect(X - .45 * s, Y - 1.5 * s, .9 * s, 1.5 * s); }
    const rise = smooth(seg(p, .752, .768)), [KX, KY, ks] = S0(-3.25, 8.3, .35);
    const king = person(c, KX, KY, ks, { a: 'sit', b: 'stand', k: rise, dir: 1, cl: [42, 84, 60], trim: [150, 118, 60], head: 'band', hd: [62, 44, 34], arms: p < .742 ? [[.32, .62]] : p < .752 ? [[.5, .95]] : [[mix(.5, .24, rise), mix(.95, 1.25, rise)]], lit: .9 }, L);
    const wk = smooth(seg(p, .704, .732)), ex = mix(7.5, -1.2, wk), kb = smooth(seg(p, .732, .74)), [EX, EY, es] = S0(ex, 7.8);
    const env = person(c, EX, EY - (wk > 0 && wk < 1 ? Math.abs(Math.sin(p * 1100)) * .03 * es : 0), es, { a: 'stand', b: 'kbow', k: kb, dir: -1, cl: [126, 102, 76], hd: [150, 116, 74], arms: p > .74 && p < .754 ? [[.52, 1.1]] : undefined }, L);
    const lh = p < .752 ? env && env.hands[0] : king && king.hands[0]; if (lh) letter(c, lh[0], lh[1], es, p < .752 ? .1 : .3 + .7 * rise, t);
    if (rise > 0 && king) glow(c, king.head[0], king.head[1] + ks * .5, ks * 3, [255, 220, 150], .25 * rise);
    // the canopy roof and its fringe, the front posts
    post(-5, 7); post(-1.8, 7);
    { const a = P(-5.2, 3.2, 6.9), b = P(-1.6, 3.2, 6.9), a2 = P(-5.2, 3.2, 9.7), top = P(-3.4, 3.9, 8.3); c.fillStyle = rgb(L.sh([150, 40, 36], .9)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(top[0], top[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill(); c.fillStyle = rgb(L.sh([120, 30, 30], .4)); c.beginPath(); c.moveTo(a2[0], a2[1]); c.lineTo(top[0], top[1]); c.lineTo(a[0], a[1]); c.closePath(); c.fill();
      const n = 9; c.fillStyle = rgb(L.sh([40, 90, 64], .8)); for (let i = 0; i < n; i++) { const x0 = mix(a[0], b[0], i / n), x1 = mix(a[0], b[0], (i + 1) / n); c.beginPath(); c.moveTo(x0, a[1]); c.quadraticCurveTo((x0 + x1) / 2, a[1] + (x1 - x0) * .7, x1, a[1]); c.fill(); }
      c.strokeStyle = rgb(L.sh([150, 118, 60], .9)); c.lineWidth = Math.max(1, (b[0] - a[0]) * .01); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  } else {
    // the shore: a far headland, the sea to the horizon, the sand; the two ships, the company going aboard
    ridge(c, V, K[1], 260, -1, 14, [150, 170, 172], 4.4, false);
    { const g = c.createLinearGradient(0, V.hy, 0, H); g.addColorStop(0, '#a9c6cc'); g.addColorStop(.12, '#3f7fa2'); g.addColorStop(.5, '#3a9aa4'); g.addColorStop(1, '#5fc0b4'); c.fillStyle = g; c.fillRect(0, V.hy, W, H - V.hy);
      c.strokeStyle = 'rgba(236,248,246,.35)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const z = 6 + i * i * .25, y = P(0, 0, z)[1], ph = t * .6 + i; c.beginPath(); for (let X = 0; X <= W; X += 24) { const yy = y + Math.sin(X * .02 + ph) * 1.2; X ? c.lineTo(X, yy) : c.moveTo(X, yy); } c.globalAlpha = .6 * (1 - i / 40); c.stroke(); } c.globalAlpha = 1; }
    const sand = (z) => P(0, 0, z)[1], shoreY = sand(11.6 + Math.sin(t * .8) * .1);
    { const g = c.createLinearGradient(0, shoreY, 0, H); g.addColorStop(0, rgb(L.sh([150, 132, 100], .6))); g.addColorStop(.08, rgb(L.sh([196, 172, 128], .7))); g.addColorStop(1, rgb(L.sh([206, 180, 134], .78))); c.fillStyle = g; c.fillRect(0, shoreY, W, H - shoreY); c.fillStyle = 'rgba(250,252,250,.65)'; c.fillRect(0, shoreY - 1.5, W, 2.5);
      { const wet = sand(9.6), g2 = c.createLinearGradient(0, shoreY, 0, wet); g2.addColorStop(0, 'rgba(120,150,150,.45)'); g2.addColorStop(1, 'rgba(120,150,150,0)'); c.fillStyle = g2; c.fillRect(0, shoreY, W, wet - shoreY); }
      c.fillStyle = rgb(L.sh([140, 118, 86], .3), .45); for (let i = 0; i < 26; i++) { const u = i / 26, [X, Y, v] = P(mix(14, 1, u) + (i % 2) * .25, 0, mix(5, 10.4, u)); const r = .07 * F / v; c.beginPath(); c.ellipse(X, Y, r * 1.6, r * .45, 0, 0, TAU); c.fill(); }
      c.fillStyle = rgb(L.sh([150, 128, 96], .4), .5); for (let i = 0; i < 40; i++) { const [X, Y, v] = P(-12 + hash(i, 1) * 30, 0, 1 + hash(i, 2) * 10); const r = .05 * F / v; c.beginPath(); c.ellipse(X, Y, r * 2, r * .5, 0, 0, TAU); c.fill(); } }
    const go = smooth(seg(p, .806, .838)), sail = smooth(seg(p, .8, .816));
    const shipA = [-1.5 + go * 8, 13.4 + go * 26], shipB = [9.5 + go * 8, 15 + go * 30];
    [shipB, shipA].forEach(([x, z], j) => { const [X, Y, s, v] = S0(x, z); ship(c, X, Y, s, 1, sail, t + j, L, Math.min(.3, v / 120));
      const on = j ? c01((p - .786) / .016) * 5 : c01((p - .782) / .016) * 7;
      if (go <= 0) { const pl = P(x + 1.9, 0, z - 2.2), pt = P(x + 1.9, 1.2, z - .4); c.strokeStyle = rgb(L.sh([110, 82, 56], .6)); c.lineWidth = Math.max(2, .25 * s); c.beginPath(); c.moveTo(pl[0], pl[1]); c.lineTo(pt[0], pt[1]); c.stroke(); } for (let i = 0; i < Math.floor(on); i++) { const hx = X + (-2.6 + i * .8) * s, hy2 = Y - 1.5 * s; c.fillStyle = rgb(L.sh([118, 92, 66], .5)); c.fillRect(hx - .16 * s, hy2 - .3 * s, .32 * s, .4 * s); c.fillStyle = rgb(L.sh([132, 100, 66], .8)); c.beginPath(); c.ellipse(hx, hy2 - .42 * s, .13 * s, .11 * s, 0, 0, TAU); c.fill(); } });
    // the company: walking along the sand to the boarding places, bundles on their shoulders
    for (let i = 0; i < 12; i++) {
      const toA = i < 7, d0 = .774 + i * .0021, k = seg(p, d0, d0 + .02), x = mix(14 + i * .6, toA ? .4 : 11.4, k), z = toA ? mix(5, 11.2, k) : mix(5, 12.8, k);
      if (k >= 1) continue; const [X, Y, s] = S0(x, z), r = person(c, X, Y - Math.abs(Math.sin(p * 1400 + i)) * .03 * s, s, { dir: -1, cl: [[126, 102, 76], [104, 86, 66], [116, 96, 72]][i % 3], hd: [[150, 116, 74], [120, 84, 58], [140, 108, 72]][i % 3], arms: [[.1, 1.45]], alpha: 1 - smooth(seg(k, .85, 1)) }, L);
      if (r) { const [hx, hy2] = r.hands[0]; c.fillStyle = rgb(L.sh(i % 2 ? [176, 150, 112] : [150, 70, 52], .8)); c.beginPath(); c.ellipse(hx, hy2 - .04 * s, .16 * s, .1 * s, 0, 0, TAU); c.fill(); }
    }
    [[10.5, 3.4], [11.6, 3.7], [12.5, 3.3]].forEach(([x, z], i) => { const [X, Y, s] = S0(x, z); person(c, X, Y, s, { dir: -1, cl: i % 2 ? [184, 166, 128] : [150, 124, 90], hd: [58, 42, 32] }, L); });
  }
}
// ---------- al-Iskandariyya: a terrace under a portico over the harbour, the great tower on its island ----------
const ECAM = [[.83, -.3, 1.75, -4.6, 0, .62, 1], [.925, -.9, 1.65, -2.8, 0, .62, 1.04]];
function misrShot(c, st, W, H, phone, p, t) {
  const K = keyAt(ECAM, p), V = view(W, H, phone, K), P = V.P, F = V.F, L = mkL([150, 156, 176], [255, 238, 206], [196, 212, 226], -1);
  const S0 = (x, z, y = 0) => { const [X, Y, v] = P(x, y, z); return [X, Y, F / v, v]; };
  sky(c, W, V.hy + 2, [52, 108, 196], [134, 182, 232], [214, 228, 236]);
  { const g = c.createLinearGradient(0, V.hy, 0, H); g.addColorStop(0, '#9fbfd0'); g.addColorStop(.1, '#3e74a6'); g.addColorStop(1, '#2f6a96'); c.fillStyle = g; c.fillRect(0, V.hy, W, H - V.hy); }
  ridge(c, V, K[1], 160, -6, 7, [176, 176, 168], 7.7, false);
  { // the tower: square, then eight-sided, then round, the fire at its head
    const fa = .4, base = -6, x = 64, z = 300, tiers = [[0, 62, 18], [62, 92, 11], [92, 108, 6.5]];
    { const a = P(x - 46, base, z + 2), b = P(x + 46, base + 5, z + 2); c.fillStyle = rgb(L.sh([176, 166, 140], .7, fa + .1)); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); }
    tiers.forEach(([y0, y1, w]) => { const a = P(x - w / 2, base + y0, z), b = P(x + w / 2, base + y1, z), g = c.createLinearGradient(a[0], 0, b[0], 0); g.addColorStop(0, rgb(L.sh([222, 214, 196], 1, fa))); g.addColorStop(1, rgb(L.sh([196, 186, 168], .25, fa))); c.fillStyle = g; c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); c.fillStyle = rgb(L.sh([150, 140, 126], .2, fa), .6); for (let k = 1; k < 4; k++) c.fillRect(a[0], mix(a[1], b[1], k / 4), b[0] - a[0], 1); });
    const [fx, fy, fs] = S0(x, z, base + 112); glow(c, fx, fy, fs * 9, [255, 170, 90], .45 + .1 * Math.sin(t * 7)); glow(c, fx, fy, fs * 2.4, [255, 236, 180], .9);
  }
  for (let i = 0; i < 5; i++) { const x = -110 + i * 52 + Math.sin(t * .1 + i) * 2, z = 130 + i * 34, [X, Y, s, v] = S0(x, z, -6); ship(c, X, Y, s, i % 2 ? 1 : -1, 1, t + i, L, Math.min(.5, v / 90)); }
  // the terrace: floor, the balustrade, palms beyond it
  { const a = P(0, 0, 13); const g = c.createLinearGradient(0, a[1], 0, H); g.addColorStop(0, rgb(L.sh([190, 178, 156], .5))); g.addColorStop(1, rgb(L.sh([200, 186, 162], .6))); c.fillStyle = g; c.fillRect(0, a[1], W, H - a[1]);
    c.strokeStyle = rgb(L.sh([150, 140, 124], .4), .45); c.lineWidth = 1; c.beginPath(); for (let z = 2; z <= 13; z += 1.4) { const l = P(-20, 0, z), r = P(20, 0, z); c.moveTo(l[0], l[1]); c.lineTo(r[0], r[1]); } for (let x = -20; x <= 20; x += 1.4) { const n = P(x, 0, 2), f = P(x, 0, 13); c.moveTo(n[0], n[1]); c.lineTo(f[0], f[1]); } c.stroke(); }
  [[-12, 15.5], [9, 16], [18, 15]].forEach(([x, z], i) => { const [X, Y, s] = S0(x, z, -.5); palm(c, X, Y, s, 8 + i, (i - 1) * .04, i * .37, L, .05, t); });
  [[-8.6, 10], [-2.0, 10], [-8.6, 6], [-2.0, 6]].forEach(([x, z]) => quad(c, V, [[x - .24, .005, z], [x + .24, .005, z], [x + 5.2, .005, z - 2.6], [x + 4.6, .005, z - 2.6]], 'rgba(90,84,104,.22)'));
  quad(c, V, [[-9.4, .004, 10], [-1.2, .004, 10], [3.2, .004, 7.4], [-5, .004, 7.4]], 'rgba(90,84,104,.1)');
  quad(c, V, [[-20, 0, 13], [20, 0, 13], [20, .95, 13], [-20, .95, 13]], rgb(L.sh([210, 200, 180], .8)));
  { c.fillStyle = rgb(L.sh([150, 140, 124], .2)); for (let x = -19.6; x < 20; x += .5) { const a = P(x, .15, 12.98), b = P(x + .2, .8, 12.98); c.fillRect(a[0], b[1], Math.max(1, b[0] - a[0]), a[1] - b[1]); } quad(c, V, [[-20, .95, 13], [20, .95, 13], [20, 1.05, 12.6], [-20, 1.05, 12.6]], rgb(L.sh([226, 218, 200], 1))); }
  // the portico and the chair; the governor and his men
  [-8.6, -2.0].forEach((x) => column(c, V, x, 10, .22, 4.2, [214, 206, 190], L, .04, [170, 150, 116]));
  { const a = P(-9.4, 4.2, 10), b = P(-1.2, 4.8, 10); c.fillStyle = rgb(L.sh([206, 196, 176], .5, .04)); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); }
  [[-6.8, 9.4, 1], [-7.8, 9.8, 1], [-3.0, 9.7, -1]].forEach(([x, z, d], i) => { const [X, Y, s] = S0(x, z); person(c, X, Y, s, { dir: d, cl: [[44, 48, 64], [120, 92, 58], [70, 52, 48]][i], hd: [52, 42, 40], head: i === 1 ? 'cloth' : 'hood', lit: .5 }, L); });
  { const [X, Y, s] = S0(-5.2, 8.5); c.fillStyle = rgb(L.sh([92, 62, 40], .5)); c.fillRect(X - .45 * s, Y - 1.7 * s, .9 * s, 1.7 * s); }
  { const [X, Y, s] = S0(-5.05, 8.2); person(c, X, Y, s, { a: 'sit', dir: 1, cl: [40, 44, 62], trim: [130, 40, 40], head: 'hood', hd: [44, 38, 40], arms: [[.4, .9]], lit: .6 }, L); }
  { const [X, Y, s] = S0(6.4, 6.6); person(c, X, Y, s, { dir: -1, cl: [118, 94, 70], hd: [140, 108, 72], arms: p > .88 ? [[.4, 1.0]] : undefined }, L); }
  // the gifts go across to the envoy: two women in mantles, the groom with the grey mule, the donkey
  const lead = mix(1.4, 5.2, smooth(seg(p, .842, .9))), walking = p > .842 && p < .9, ph = p * 320, zP = 5.4;
  const at = (dx) => S0(lead + dx, zP), shad = (X, Y, s, w) => { c.fillStyle = 'rgba(60,50,60,.22)'; c.beginPath(); c.ellipse(X + .4 * s, Y, w * s, w * .2 * s, 0, 0, TAU); c.fill(); };
  { const [X, Y, s] = at(-4.9); shad(X, Y, s, 1.1); beast(c, X, Y, s, 1, 'donkey', [132, 120, 108], ph + 2, walking, L); }
  { const [X, Y, s] = at(-3.0); shad(X, Y, s, 1.3); const m = beast(c, X, Y, s, 1, 'mule', [190, 188, 182], ph, walking, L); const [gX, gY] = at(-1.75); const gr = person(c, gX, gY, s, { dir: 1, cl: [118, 94, 70], hd: [134, 102, 66], arms: [[-.4, 1.0]] }, L); if (m && gr) { c.strokeStyle = rgb(L.sh([70, 50, 34], .5)); c.lineWidth = Math.max(1, .025 * s); c.beginPath(); c.moveTo(m.head[0], m.head[1] + .15 * s); c.quadraticCurveTo((m.head[0] + gr.hands[0][0]) / 2, gr.hands[0][1] + .2 * s, gr.hands[0][0], gr.hands[0][1]); c.stroke(); } }
  [[-.9, [104, 80, 64], [110, 84, 64]], [0, [92, 72, 60], [96, 74, 60]]].forEach(([dx, cl, hd], i) => { const [X, Y, s] = at(dx); shad(X, Y, s, .5); person(c, X, Y - (walking ? Math.abs(Math.sin(ph + i)) * .02 * s : 0), s, { dir: 1, cl, hd, head: 'mantle' }, L); });
  [-8.6, -2.0].forEach((x) => column(c, V, x, 6, .24, 4.2, [220, 212, 196], L, 0, [170, 150, 116]));
  { const a = P(-9.4, 4.2, 5.8), b = P(-1.2, 4.9, 5.8); c.fillStyle = rgb(L.sh([214, 204, 184], .8)); c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); c.fillStyle = rgb(L.sh([130, 40, 40], .6)); c.fillRect(a[0], mix(a[1], b[1], .55), b[0] - a[0], Math.max(1, (a[1] - b[1]) * .12)); }
}
// ---------- the scene ----------
const CUTS = [.1, .2, .36, .472, .622, .706, .776, .836, .922];
function densify(pts) { // a smooth road through its points (Catmull-Rom)
  const out = [], n = pts.length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < 12; k++) {
    const u = k / 12, a = pts[Math.max(0, i - 1)], b = pts[i], c2 = pts[i + 1], d = pts[Math.min(n - 1, i + 2)];
    out.push([0, 1].map((j) => .5 * (2 * b[j] + (-a[j] + c2[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c2[j] - d[j]) * u * u + (-a[j] + 3 * b[j] - 3 * c2[j] + d[j]) * u * u * u)));
  }
  out.push(pts[n - 1]); return out;
}
S.kutub = {
  init(el, st) {
    st.cv = el.querySelector('canvas'); st.c = st.cv.getContext('2d');
    const R = rng(4410);
    st.cloud = Array.from({ length: 7 }, () => [R(), R(), .1 + R() * .18, R()]);
    st.stars = Array.from({ length: 400 }, () => [R(), R() ** 1.3, .3 + R() ** 3 * 1.7, R() * 9]);
    st.mpalms = []; for (let i = 0; i < 40; i++) { const x = -34 + R() * 68, z = 14 + R() ** 1.4 * 34; st.mpalms.push([x, z, 7 + R() * 6, (R() - .5) * .12, R()]); } st.mpalms.sort((a, b) => b[1] - a[1]);
    st.fpalms = []; for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1, x = sd * (17 + R() * 22), z = -16 + R() * 12; st.fpalms.push([x, z, 9 + R() * 6, sd * (.03 + R() * .05), R()]); } st.fpalms.sort((a, b) => b[1] - a[1]);
    st.CL = [[118, 92, 66], [96, 80, 62], [132, 104, 74], [104, 86, 68], [84, 72, 58], [124, 100, 80], [110, 96, 70]];
    st.HD = [[150, 116, 74], [128, 92, 60], [140, 122, 88], [112, 92, 66], [160, 128, 86], [120, 84, 58], [104, 102, 74], [136, 104, 70]];
    st.dense = new Map(ROADS.map((r) => [r[1], densify(r[1])]));
    (window.requestIdleCallback || setTimeout)(() => { if (!st.map) buildMap(st); }); // the map is painted once, off the scroll
    // the writing on the sheet: illegible strokes in lines, right to left (no real words: the texts give none)
    st.script = [];
    for (let i = 0; i < 9; i++) {
      const v = .1 + i * .074, x1 = i ? .9 : .7, x0 = i ? (i === 8 ? .45 : .1) : .3, line = { x0, x1, st: [], dots: [] };
      let x = x1;
      while (x > x0 + .04) {
        const ww = Math.min(x - x0, .04 + R() * .08), xl = x - ww, base = [];
        for (let u = x; u >= xl; u -= .006) base.push([u, v + Math.sin(u * 300 + i) * .002 - (R() < .22 ? .008 : 0)]);
        base.push([xl - .006, v + .02], [xl + .01, v + .028]); line.st.push(base);
        const na = 1 + (R() * 2 | 0); for (let k = 0; k < na; k++) { const ax = xl + R() * ww; line.st.push([[ax, v], [ax + .002, v - .04 - R() * .015]]); }
        if (R() < .5) { const lx = xl + R() * ww, lp = []; for (let k = 0; k <= 8; k++) lp.push([lx + Math.cos(k / 8 * TAU) * .006, v - .006 + Math.sin(k / 8 * TAU) * .006]); line.st.push(lp); }
        const nd = R() * 3 | 0; for (let k = 0; k < nd; k++) line.dots.push([xl + R() * ww, v + (R() < .6 ? -.022 : .018)]);
        x = xl - .022;
      }
      st.script.push(line);
    }
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { c, cv } = st, dpr = cv.width / Math.max(1, cv.clientWidth), W = cv.clientWidth, H = cv.clientHeight, phone = W < H * .8 && W < 700;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.lineCap = 'butt'; c.setLineDash([]);
    if (p < .1) medina(c, st, W, H, phone, p, t, 0);
    else if (p < .2) sheetShot(c, st, W, H, phone, p, t);
    else if (p < .36) mapShot(c, st, W, H, phone, p, t);
    else if (p < .472) rumShot(c, st, W, H, phone, p, t);
    else if (p < .622) farsShot(c, st, W, H, phone, p, t);
    else if (p < .706) medina(c, st, W, H, phone, p, t, 1);
    else if (p < .836) habShot(c, st, W, H, phone, p, t);
    else if (p < .922) misrShot(c, st, W, H, phone, p, t);
    else medina(c, st, W, H, phone, p, t, 2);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const dip = Math.max(...CUTS.map((k) => 1 - Math.abs(p - k) / .008));
    if (dip > 0) { c.fillStyle = `rgba(6,6,10,${smooth(c01(dip))})`; c.fillRect(0, 0, W, H); }
  },
};
})();
