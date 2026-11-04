// Climb to Hira: an opt-in third-person walk up Mount Hira at night. three.js r128 loads only on first open.
// The walker is a present-day visitor (faceless, backpack, a railing, other pilgrims), never the Prophet ﷺ. He is drawn
// only in the site's convention (scenes/holy.js): seated in the cave, never moving, never played, a white veil over the
// face and a flat gold disc behind the head. Faint footprints lead up to him: an artistic sign, not a sourced detail.
// Station texts are cloned from the iqra scene, so the Arabic, its source chips and the English (when on)
// are the page's own checked texts. Music: original generative ambient (pads, bells, reverb) that plays only
// inside the walk and falls silent before the recitation of al-'Alaq 1–5.
(() => {
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const q = (s, r = document) => r.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sstep = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  let seed = 23;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- music: slow D-major pads, glassy bells, a long reverb ----------
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const CHORDS = [[50, 57, 64, 66, 73], [47, 54, 62, 64, 69], [43, 50, 59, 66, 73], [45, 52, 59, 61, 64]]; // Dmaj9, Bm11, Gmaj7#11, Asus2
  const BAR = 9;
  const music = {
    ctx: null, on: true, timer: 0, step: 0, next: 0,
    init(ctx) {
      this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.connect(ctx.destination);
      this.out = ctx.createGain(); this.out.gain.value = 0; this.out.connect(comp);
      this.dry = ctx.createGain(); this.dry.gain.value = 0.45; this.dry.connect(this.out);
      this.rev = ctx.createConvolver(); this.rev.buffer = this.impulse(5.5);
      const wet = ctx.createGain(); wet.gain.value = 0.9; this.rev.connect(wet); wet.connect(this.out);
    },
    impulse(sec) {
      const c = this.ctx, len = (c.sampleRate * sec) | 0, b = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2; }
      return b;
    },
    start() {
      if (!this.ctx || !this.on || this.timer) return;
      const t = this.ctx.currentTime;
      this.out.gain.cancelScheduledValues(t);
      this.out.gain.setTargetAtTime(0.32, t, 1.6);
      this.next = t + 0.1;
      this.tick();
    },
    stop(sec = 1.5) {
      clearTimeout(this.timer); this.timer = 0;
      if (this.ctx) this.out.gain.setTargetAtTime(0, this.ctx.currentTime, sec / 3);
    },
    tick() {
      while (this.next < this.ctx.currentTime + 1) { this.chord(CHORDS[this.step++ % CHORDS.length], this.next); this.next += BAR; }
      this.timer = setTimeout(() => this.tick(), 500);
    },
    chord(notes, t) {
      const len = BAR + 4; // chords overlap by 4 s
      notes.forEach((m) => this.pad(hz(m), t, len, 'sawtooth', 0.018));
      this.pad(hz(notes[0] - 12), t, len, 'sine', 0.06);
      for (let k = 0; k < 3; k++) if (Math.random() < 0.8) this.bell(hz(notes[(Math.random() * notes.length) | 0] + (Math.random() < 0.5 ? 12 : 24)), t + 1 + Math.random() * (BAR - 2));
    },
    pad(f, t, len, type, g) {
      const c = this.ctx, v = c.createGain(), lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 0.4;
      lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1300, t + len / 2); lp.frequency.linearRampToValueAtTime(600, t + len);
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 3.5); v.gain.setValueAtTime(g, t + len - 4.5); v.gain.linearRampToValueAtTime(0, t + len);
      lp.connect(v); v.connect(this.dry); v.connect(this.rev);
      (type === 'sine' ? [0] : [-7, 7]).forEach((det) => {
        const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + len + 0.1);
      });
    },
    bell(f, t) {
      const c = this.ctx, v = c.createGain();
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.045, t + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
      v.connect(this.dry); v.connect(this.rev);
      [[1, 1], [2, 0.3], [4.01, 0.08]].forEach(([ratio, amp]) => {
        const o = c.createOscillator(), a = c.createGain(); o.frequency.value = f * ratio; a.gain.value = amp;
        o.connect(a); a.connect(v); o.start(t); o.stop(t + 4.6);
      });
    },
  };

  // ---------- overlay ----------
  let root, cv, card, endBox, barFill, loadMsg, musBtn, ctx, opener;
  let open = false, built = false, raf = 0, runId = 0;
  function buildDom() {
    root = document.createElement('div');
    root.className = 'walk'; root.id = 'walk'; root.hidden = true; root.dir = 'rtl'; root.lang = 'ar';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'الصعود إلى غار حراء');
    root.innerHTML = `
      <canvas class="walk-cv" tabindex="0" aria-label="جبل حراء ليلاً. استعمل الأسهم للمشي والالتفات."></canvas>
      <div class="walk-top">
        <div class="walk-k">
          <b>الصعود إلى غار حراء</b><span class="en" lang="en">Climb to the Cave of Hira</span>
          <span class="walk-hint keys">↑ ↓ للمشي · ← → للالتفات · Shift للإسراع · Esc للخروج<span class="en" lang="en">↑ ↓ walk · ← → turn · Shift faster · Esc to leave</span></span>
          <span class="walk-hint touch">اضغط الأسهم مطوّلاً للمشي والالتفات<span class="en" lang="en">Hold the arrows to walk and turn</span></span>
        </div>
        <div class="walk-btns">
          <button type="button" id="walk-mus" aria-pressed="true">الموسيقى: تعمل</button>
          <button type="button" id="walk-x">خروج</button>
        </div>
      </div>
      <div class="walk-card" aria-live="polite"></div>
      <div class="walk-end" hidden>
        <button type="button" id="walk-back">العودة إلى السيرة</button>
        <button type="button" id="walk-again">من جديد</button>
      </div>
      <i class="walk-bar"><b></b></i>
      <div class="walk-pad">
        <button type="button" id="walk-up" data-k="ArrowUp" aria-label="إلى الأمام">↑</button>
        <button type="button" id="walk-left" data-k="ArrowLeft" aria-label="التفت يساراً">←</button>
        <button type="button" id="walk-down" data-k="ArrowDown" aria-label="إلى الخلف">↓</button>
        <button type="button" id="walk-right" data-k="ArrowRight" aria-label="التفت يميناً">→</button>
      </div>
      <div class="walk-load">يجري تحميل المشهد…</div>`;
    document.body.append(root);
    cv = q('.walk-cv', root); card = q('.walk-card', root); endBox = q('.walk-end', root);
    barFill = q('.walk-bar b', root); loadMsg = q('.walk-load', root); musBtn = q('#walk-mus', root);
    q('#walk-x', root).addEventListener('click', () => closeWalk());
    q('#walk-back', root).addEventListener('click', () => closeWalk(true));
    q('#walk-again', root).addEventListener('click', () => reset());
    musBtn.addEventListener('click', () => {
      music.on = !music.on;
      musBtn.setAttribute('aria-pressed', String(music.on));
      musBtn.textContent = music.on ? 'الموسيقى: تعمل' : 'الموسيقى: مُطفأة';
      if (music.on && !done) music.start(); else music.stop();
    });
    cv.addEventListener('pointerdown', () => cv.focus({ preventScroll: true }));
    root.querySelectorAll('.walk-pad button').forEach((b) => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', (e) => { keys[k] = true; b.setPointerCapture(e.pointerId); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => { keys[k] = false; }));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  // A text block from the iqra scene, without its scroll-animation state.
  function grab(sel) {
    const n = q(sel);
    if (!n) return null;
    const c = n.cloneNode(true);
    c.removeAttribute('class');
    [c, ...c.querySelectorAll('*')].forEach((e) => { e.removeAttribute('style'); e.removeAttribute('data-fx'); e.classList.remove('speaking'); });
    return c;
  }
  function intro() {
    const d = document.createElement('div');
    d.innerHTML = '<p class="kick">جبل حراء · مكة<span class="en" lang="en">Mount Hira · Mecca</span></p>'
      + '<p class="cap">تصعد زائراً اليوم، على أثره، إلى الغار قرب القمّة<span class="en" lang="en">You climb as a visitor today, in his footsteps, to the cave near the summit</span></p>';
    return d;
  }
  let cardTimer = 0;
  function showCard(node, ms = 0) {
    clearTimeout(cardTimer);
    const swap = () => {
      card.replaceChildren(...(node ? [node] : []));
      card.classList.add('on');
      if (ms) cardTimer = setTimeout(() => card.classList.remove('on'), ms);
    };
    if (card.classList.contains('on')) { card.classList.remove('on'); cardTimer = setTimeout(swap, 800); } else swap();
  }

  // ---------- world ----------
  let T, renderer, scene, camera, sun, sky, starMat, player, body, legL, legR, armL, armR, MOON, nightC, dawnC;
  const R0 = 46, R1 = 7.5, TURNS = 1.8, N = 280, W = 2.3; // spiral trail from r=46 up to r=7.5, half-width W
  const pts = [], cum = [0];
  let total = 0;
  const prof = (r) => 50 * (1 - sstep(r, 6, 54)) + 12 * (1 - sstep(r, 0, 9));
  const rough = (x, z) => Math.sin(x * 0.21 + Math.cos(z * 0.17) * 1.7) * 1.6 + Math.sin(z * 0.26 - x * 0.12) * 1.3 + Math.sin((x + z) * 0.55) * 0.2;
  const hills = (x, z) => { const a = Math.atan2(z, x); return sstep(Math.hypot(x, z), 80, 125) * (12 + 7 * Math.sin(a * 4 + 1) + 4 * Math.sin(a * 11)); };
  const base = (x, z) => { const r = Math.hypot(x, z); return prof(r) + rough(x, z) * (0.35 + 0.65 * Math.min(1, r / 30)) + hills(x, z); };

  for (let i = 0; i <= N; i++) {
    const u = i / N, a = u * TURNS * Math.PI * 2, r = R0 + (R1 - R0) * u;
    pts.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: prof(r) });
    if (i) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  }
  total = cum[N];

  // Nearest point on the trail: distance, position, height and progress (0 at the foot, 1 at the cave).
  function nearest(x, z) {
    let best = Infinity, bi = 0, bt = 0;
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dz = b.z - a.z;
      const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz), 0, 1);
      const ex = a.x + dx * t - x, ez = a.z + dz * t - z, d = ex * ex + ez * ez;
      if (d < best) { best = d; bi = i; bt = t; }
    }
    const a = pts[bi], b = pts[bi + 1];
    return { d: Math.sqrt(best), x: a.x + (b.x - a.x) * bt, z: a.z + (b.z - a.z) * bt, y: a.y + (b.y - a.y) * bt, s: (cum[bi] + (cum[bi + 1] - cum[bi]) * bt) / total };
  }

  // Height of the built terrain (trail cut included), for putting things on the ground.
  const groundAt = (x, z) => {
    const b = base(x, z);
    if (Math.hypot(x, z) >= R0 + 10) return b;
    const m = nearest(x, z);
    return m.y + (b - m.y) * sstep(m.d, W, W + 4.5);
  };
  // Point, unit tangent and slope at arc length l along the trail.
  function pointAt(l) {
    let i = 0;
    while (i < N - 1 && cum[i + 1] < l) i++;
    const a = pts[i], b = pts[i + 1], seg = cum[i + 1] - cum[i], t = clamp((l - cum[i]) / seg, 0, 1);
    return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, y: a.y + (b.y - a.y) * t, tx: (b.x - a.x) / seg, tz: (b.z - a.z) / seg, slope: (b.y - a.y) / seg };
  }

  function mesh(geo, color, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color, flatShading: true, roughness: 1 }));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function buildTerrain() {
    const g = new T.PlaneGeometry(320, 320, 280, 280);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    const rock = new T.Color(0x6b6355), rockHi = new T.Color(0x857b69), sand = new T.Color(0x5a5244), trail = new T.Color(0xc7bda4), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      let y = base(x, z);
      c.copy(rock).lerp(rockHi, (0.5 + 0.5 * Math.sin(x * 0.9 + Math.sin(z * 0.7) * 2)) * 0.6);
      c.lerp(sand, sstep(r, 52, 62) * (1 - sstep(r, 85, 110)));
      if (r < R0 + 10) { // cut the trail into the slope and pale it
        const m = nearest(x, z);
        y = m.y + (y - m.y) * sstep(m.d, W, W + 4.5);
        c.lerp(trail, 1 - sstep(m.d, W - 0.6, W + 0.9));
      }
      p.setY(i, y);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const ground = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // The cave: a dark cleft under a slab between two boulders, a few steps past the end of the trail, so the
  // visitor stops about 4 units short of him. He sits at its mouth, facing the trail.
  function buildCave() {
    const E = pts[N], P = pts[N - 4], tl = Math.hypot(E.x - P.x, E.z - P.z);
    const Tx = (E.x - P.x) / tl, Tz = (E.z - P.z) / tl, Nx = -Tz, Nz = Tx, face = Math.atan2(Tx, Tz);
    const Cx = E.x + Tx * 6.8, Cz = E.z + Tz * 6.8, gy = groundAt(Cx, Cz);
    const stone = (r, x, z, y, sx, sy, sz, ry = rnd() * 6) => {
      const m = mesh(new T.DodecahedronGeometry(r, 0), 0x5d5547, x, y, z);
      m.scale.set(sx, sy, sz); m.rotation.set((rnd() - 0.5) * 0.4, ry, (rnd() - 0.5) * 0.4);
      scene.add(m);
    };
    stone(2.1, Cx + Nx * 2.9, Cz + Nz * 2.9, gy + 0.9, 1, 1.15, 1.3);
    stone(2.1, Cx - Nx * 2.9, Cz - Nz * 2.9, gy + 0.9, 1, 1.15, 1.3);
    stone(2.6, Cx + Tx * 2.4, Cz + Tz * 2.4, gy + 1.2, 1.3, 1.2, 1);
    stone(2.4, Cx, Cz, gy + 3.7, 1.5, 0.5, 1.1, face);
    const hole = new T.Mesh(new T.BoxGeometry(1.8, 2.6, 1.8), new T.MeshBasicMaterial({ color: 0x010203 }));
    hole.position.set(Cx, gy + 1.25, Cz); hole.rotation.y = face;
    scene.add(hole);
    const Fx = Cx - Tx * 1.6, Fz = Cz - Tz * 1.6, holy = veiled(); // in front of the dark cleft, not inside it
    holy.position.set(Fx, groundAt(Fx, Fz), Fz); holy.rotation.y = Math.atan2(-Tx, -Tz);
    scene.add(holy);
    footprints(E, Fx, Fz);
  }

  // The site's convention in 3D, seated: green cloak, white robe and turban, a white veil over the face, a flat gold
  // disc behind the head. No face is drawn. Scaled to a seated adult beside the standing visitor.
  function veiled() {
    const g = new T.Group();
    const add = (geo, color, x, y, z) => { const m = mesh(geo, color, x, y, z); m.receiveShadow = false; g.add(m); return m; };
    add(new T.CylinderGeometry(0.42, 0.78, 0.55, 12), 0x24553f, 0, 0.28, 0);
    add(new T.CylinderGeometry(0.3, 0.44, 0.85, 12), 0x2f6e52, 0, 0.95, 0);
    add(new T.BoxGeometry(0.3, 0.62, 0.06), 0xe9e2d0, 0, 1.0, 0.37);
    add(new T.SphereGeometry(0.22, 14, 12), 0xf2ede1, 0, 1.6, 0);
    add(new T.SphereGeometry(0.26, 14, 10), 0xf2ede1, 0, 1.74, 0).scale.set(1, 0.72, 1);
    add(new T.BoxGeometry(0.4, 0.52, 0.03), 0xf7f2e6, 0, 1.42, 0.21);
    const disc = new T.Mesh(new T.CircleGeometry(0.5, 48), new T.MeshBasicMaterial({ color: 0xc9a54e, transparent: true, opacity: 0.92, side: T.DoubleSide }));
    disc.position.set(0, 1.68, -0.22);
    g.add(disc);
    g.scale.setScalar(0.68);
    return g;
  }

  // His trace: faint footprints up the middle of the trail and on to the cave mouth (one instanced draw).
  function footprints(E, Fx, Fz) {
    const geo = new T.CircleGeometry(0.1, 14);
    geo.rotateX(-Math.PI / 2); geo.scale(1, 1, 2.2);
    const mat = new T.MeshBasicMaterial({ color: 0xf2ede1, transparent: true, opacity: 0.45, depthWrite: false });
    const gap = Math.hypot(Fx - E.x, Fz - E.z), ex = (Fx - E.x) / gap, ez = (Fz - E.z) / gap, STEP = 0.55;
    const n = Math.floor((total + gap - 2.4) / STEP), im = new T.InstancedMesh(geo, mat, n), o = new T.Object3D();
    o.rotation.order = 'YXZ';
    for (let i = 0; i < n; i++) {
      const l = 1.5 + i * STEP;
      let f;
      if (l <= total) f = pointAt(l);
      else { const x = E.x + ex * (l - total), z = E.z + ez * (l - total); f = { x, z, y: groundAt(x, z), tx: ex, tz: ez, slope: 0 }; }
      const side = i % 2 ? 0.16 : -0.16;
      o.position.set(f.x - f.tz * side, f.y + 0.05, f.z + f.tx * side);
      o.rotation.set(-Math.atan(f.slope), Math.atan2(f.tx, f.tz), 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    scene.add(im);
  }

  // Today's railing on the outer edge of the trail (posts + rails, two instanced draws).
  function buildRailing() {
    const STEP = 2.4, n = Math.floor((total * 0.97 - 6) / STEP), metal = new T.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.7 });
    const posts = new T.InstancedMesh(new T.CylinderGeometry(0.035, 0.035, 0.95, 6), metal, n);
    const rails = new T.InstancedMesh(new T.BoxGeometry(0.05, 0.05, 1), metal, n - 1), o = new T.Object3D();
    const at = (i) => { const f = pointAt(6 + i * STEP); return { x: f.x + f.tz * 2.15, z: f.z - f.tx * 2.15, y: f.y }; };
    let prev = null;
    for (let i = 0; i < n; i++) {
      const q0 = at(i);
      o.position.set(q0.x, q0.y + 0.47, q0.z); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix();
      posts.setMatrixAt(i, o.matrix);
      if (prev) {
        const dx = q0.x - prev.x, dy = q0.y - prev.y, dz = q0.z - prev.z, len = Math.hypot(dx, dy, dz);
        o.position.set((q0.x + prev.x) / 2, (q0.y + prev.y) / 2 + 0.95, (q0.z + prev.z) / 2);
        o.rotation.order = 'YXZ'; o.rotation.set(-Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(dx, dz), 0);
        o.scale.set(1, 1, len); o.updateMatrix();
        rails.setMatrixAt(i - 1, o.matrix);
        o.rotation.order = 'XYZ';
      }
      prev = q0;
    }
    posts.castShadow = rails.castShadow = true;
    scene.add(posts, rails);
  }

  // Other present-day visitors on the inner edge of the trail; the walker cannot pass through them.
  const others = [];
  function buildVisitors() {
    [[0.24, 0x4b5562, 0x6b4b36, false], [0.52, 0xeeeae0, 0, true], [0.8, 0x8a7f6a, 0x2f4a5a, false]].forEach(([s, shirt, pack, dua]) => {
      const f = pointAt(s * total), x = f.x - f.tz * 1.95, z = f.z + f.tx * 1.95;
      const v = visitorModel({ shirt, pack, dua });
      v.g.position.set(x, groundAt(x, z), z);
      v.g.rotation.y = dua ? Math.atan2(f.tx, f.tz) : Math.atan2(-f.tx, -f.tz);
      scene.add(v.g);
      others.push({ x, z });
    });
  }

  function buildSky() {
    const n = 1500, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 0.04 + rnd() * 0.96, t = rnd() * Math.PI * 2, k = Math.sqrt(1 - y * y);
      a[i * 3] = Math.cos(t) * k * 500; a[i * 3 + 1] = y * 500; a[i * 3 + 2] = Math.sin(t) * k * 500;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(a, 3));
    starMat = new T.PointsMaterial({ color: 0xf2ede1, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.7, fog: false, depthWrite: false });
    sky = new T.Group();
    sky.add(new T.Points(g, starMat));
    const moon = new T.Mesh(new T.SphereGeometry(10, 20, 14), new T.MeshBasicMaterial({ color: 0xf2ede1, fog: false }));
    moon.position.copy(MOON).multiplyScalar(480);
    sky.add(moon);
    scene.add(sky);
  }

  // A present-day visitor, faceless: shirt, trousers, backpack. Local +z is forward.
  function visitorModel({ shirt = 0xd9d4c8, pants = 0x2c3036, head = 0x1c1c1f, pack = 0x3d5a4a, dua = false } = {}) {
    const g = new T.Group(), b = new T.Group();
    g.add(b);
    b.add(mesh(new T.CylinderGeometry(0.3, 0.27, 0.72, 10), shirt, 0, 1.26, 0));
    b.add(mesh(new T.SphereGeometry(0.21, 12, 10), head, 0, 1.83, 0));
    if (pack) b.add(mesh(new T.BoxGeometry(0.42, 0.5, 0.2), pack, 0, 1.3, -0.3));
    const limb = (len, rad, color, x, y, rx, rz) => {
      const pivot = new T.Group();
      pivot.position.set(x, y, 0); pivot.rotation.set(rx, 0, rz);
      pivot.add(mesh(new T.CylinderGeometry(rad, rad * 0.88, len, 6), color, 0, -len / 2, 0));
      b.add(pivot);
      return pivot;
    };
    const arms = [limb(0.62, 0.075, shirt, 0.37, 1.55, dua ? -1.1 : 0, dua ? 0 : 0.11), limb(0.62, 0.075, shirt, -0.37, 1.55, dua ? -1.1 : 0, dua ? 0 : -0.11)];
    const legs = [limb(0.9, 0.11, pants, 0.13, 0.9, 0, 0), limb(0.9, 0.11, pants, -0.13, 0.9, 0, 0)];
    return { g, b, arms, legs };
  }
  function buildPilgrim() {
    const v = visitorModel();
    player = v.g; body = v.b; [armL, armR] = v.arms; [legL, legR] = v.legs;
    scene.add(player);
  }

  function buildWorld() {
    T = window.THREE;
    MOON = new T.Vector3(-0.45, 0.42, -0.79).normalize();
    nightC = new T.Color(0x07111b); dawnC = new T.Color(0x12263a);
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene();
    scene.background = nightC.clone();
    scene.fog = new T.Fog(0x07111b, 45, 230);
    camera = new T.PerspectiveCamera(55, 1, 0.1, 900);
    scene.add(new T.HemisphereLight(0x3b5270, 0x1b150f, 0.6));
    sun = new T.DirectionalLight(0xcdd6f0, 0.95);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.001;
    Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 200 });
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun, sun.target);
    buildTerrain(); buildCave(); buildRailing(); buildVisitors(); buildSky(); buildPilgrim();
    resize();
  }
  function resize() {
    if (!renderer) return;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  const loadThree = () => (window.THREE ? Promise.resolve() : new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = THREE_URL; s.onload = res; s.onerror = rej;
    document.head.append(s);
  }));

  // ---------- input ----------
  const keys = {};
  const BLOCK = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End']);
  const onKey = (e) => {
    if (!open) return;
    e.stopPropagation(); // the page's own scroll and menu keys stay quiet while walking
    if (e.code === 'Escape') { e.preventDefault(); if (e.type === 'keydown') closeWalk(); return; }
    if (BLOCK.has(e.code) && !(e.code === 'Space' && e.target.closest?.('button'))) e.preventDefault();
    keys[e.code] = e.type === 'keydown';
  };
  addEventListener('keydown', onKey, true);
  addEventListener('keyup', onKey, true);
  const clearKeys = () => { for (const k in keys) keys[k] = false; };
  addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', clearKeys);
  const on = (...codes) => (codes.some((c) => keys[c]) ? 1 : 0);

  // ---------- run ----------
  const STATIONS = [{ s: 0.3, sel: '.iqra .iq-c1' }, { s: 0.62, sel: '.iqra .iq-rest' }];
  const READERS = ['basit', 'minshawi', 'parhizgar'];
  let yaw = 0, camYaw = 0, camY = 0, camDist = 7, camH = 3.4, phase = 0, last = 0;
  let maxS = 0, shownBar = -1, station = -1, done = false, glow = 0, glowT = 0, recite = null, recSrc = null;
  const look = { x: 0, y: 0, z: 0 };

  function reset() {
    runId++;
    done = false; root.classList.remove('done'); endBox.hidden = true;
    maxS = 0; station = -1; glowT = 0; recite = null;
    try { recSrc?.stop(); } catch { /* not started */ }
    recSrc = null;
    const a = pts[2], b = pts[6];
    player.position.set(a.x, a.y, a.z);
    yaw = camYaw = Math.atan2(b.x - a.x, b.z - a.z);
    camY = a.y + camH;
    showCard(intro(), 9000);
    music.start();
  }

  function progress(s) {
    if (s > maxS) maxS = s;
    const pct = Math.round(maxS * 200) / 200;
    if (pct !== shownBar) { shownBar = pct; barFill.style.transform = `scaleX(${pct})`; }
    while (station + 1 < STATIONS.length && maxS >= STATIONS[station + 1].s) showCard(grab(STATIONS[++station].sel), 11000);
    if (maxS > 0.55 && !recite) recite = loadRecitation();
    if (!done && maxS >= 0.992) finale();
  }
  function loadRecitation() {
    if (!ctx) return Promise.resolve(null);
    const who = READERS[(Math.random() * READERS.length) | 0];
    return fetch(`audio/q/96-1_5-${who}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).catch(() => null);
  }
  // At the cave: the music falls silent, al-Qummi's report appears, then the five verses are recited.
  async function finale() {
    const id = runId;
    done = true; root.classList.add('done'); clearKeys();
    music.stop(2.5);
    showCard(grab('.iqra .iq-c2'));
    recite ||= loadRecitation();
    const [buf] = await Promise.all([recite, wait(7000)]);
    if (id !== runId) return;
    const ay = grab('.iqra .iq-ay');
    showCard(ay);
    glowT = 1;
    await wait(900);
    if (id !== runId) return;
    const spans = ay ? [...ay.querySelectorAll('.ayah > span:not(.en)')] : [];
    const dur = buf ? buf.duration : spans.length * 4;
    if (buf) { recSrc = ctx.createBufferSource(); recSrc.buffer = buf; recSrc.connect(ctx.destination); recSrc.start(); }
    // ponytail: verse reveal is timed by letter count across the clip, not by per-verse timestamps.
    const w = spans.map((e) => e.textContent.length), sum = w.reduce((x, y) => x + y, 0) || 1;
    let acc = 0;
    spans.forEach((e, i) => { setTimeout(() => { if (id === runId) e.classList.add('on'); }, (acc / sum) * dur * 1000); acc += w[i]; });
    await wait(dur * 1000 + 1500);
    if (id !== runId) return;
    endBox.hidden = false;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    const turn = done ? 0 : on('ArrowLeft', 'KeyA') - on('ArrowRight', 'KeyD');
    const move = done ? 0 : on('ArrowUp', 'KeyW') - on('ArrowDown', 'KeyS');
    const run = move > 0 && on('ShiftLeft', 'ShiftRight');
    yaw += turn * 2.1 * dt;
    const speed = move * (run ? 8.5 : 4.2) * (move < 0 ? 0.55 : 1);

    const p = player.position;
    p.x += Math.sin(yaw) * speed * dt;
    p.z += Math.cos(yaw) * speed * dt;
    const m = nearest(p.x, p.z), lim = W - 0.45;
    if (m.d > lim) { p.x = m.x + ((p.x - m.x) * lim) / m.d; p.z = m.z + ((p.z - m.z) * lim) / m.d; }
    for (const o of others) {
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz);
      if (d < 0.75 && d > 1e-4) { p.x = o.x + (dx / d) * 0.75; p.z = o.z + (dz / d) * 0.75; }
    }
    p.y = m.y; // the trail is level across its width
    player.rotation.y = yaw;
    progress(m.s);

    const moving = speed !== 0;
    phase += dt * Math.abs(speed) * 2.4;
    const sw = moving ? Math.sin(phase) * (run ? 0.8 : 0.55) : 0, ease = 1 - Math.exp(-dt * 14);
    legL.rotation.x += (sw - legL.rotation.x) * ease;
    legR.rotation.x += (-sw - legR.rotation.x) * ease;
    armL.rotation.x += (-sw * 0.8 - armL.rotation.x) * ease;
    armR.rotation.x += (sw * 0.8 - armR.rotation.x) * ease;
    body.position.y += ((moving ? Math.abs(Math.sin(phase)) * 0.07 : 0) - body.position.y) * ease;

    // Follow camera trails the heading; at the cave it draws back to show the summit and the sky.
    const follow = 1 - Math.exp(-dt * 4.5), slow = Math.min(1, dt * 0.5);
    camYaw += (yaw - camYaw) * follow;
    camDist += ((done ? 15 : 7) - camDist) * slow;
    camH += ((done ? 7.5 : 3.4) - camH) * slow;
    const cx = p.x - Math.sin(camYaw) * camDist, cz = p.z - Math.cos(camYaw) * camDist;
    camY += (Math.max(p.y + camH, base(cx, cz) + 1.6) - camY) * follow;
    camera.position.set(cx, camY, cz);
    look.x = p.x; look.y = p.y + 1.5; look.z = p.z;
    camera.lookAt(look.x, look.y, look.z);

    glow += (glowT - glow) * Math.min(1, dt * 0.35);
    scene.background.copy(nightC).lerp(dawnC, glow);
    scene.fog.color.copy(scene.background);
    starMat.opacity = 0.7 + 0.3 * glow;
    starMat.size = 1.6 + glow;
    sky.position.copy(camera.position);
    sun.position.set(p.x + MOON.x * 80, p.y + MOON.y * 80, p.z + MOON.z * 80);
    sun.target.position.copy(p);
    renderer.render(scene, camera);
  }

  // ---------- open / close ----------
  async function openWalk() {
    if (open) return;
    if (!ctx) { // inside the click, so the browser lets audio start
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ctx = new AC(); music.init(ctx); }
    }
    ctx?.resume().catch(() => {});
    if (!root) buildDom();
    const playBtn = q('#play');
    if (playBtn?.getAttribute('aria-pressed') === 'true') playBtn.click();
    if (window.Sound?.on && window.Sound.ctx) window.Sound.ctx.suspend().catch(() => {});
    open = true; root.hidden = false;
    document.documentElement.classList.add('walking');
    cv.focus({ preventScroll: true });
    if (!built) {
      loadMsg.textContent = 'يجري تحميل المشهد…'; loadMsg.hidden = false;
      try { await loadThree(); buildWorld(); built = true; } catch {
        loadMsg.textContent = 'تعذّر تحميل المشهد. تحقّق من الاتصال ثم أعد المحاولة.';
        return;
      }
      loadMsg.hidden = true;
      if (!open) return;
    }
    reset();
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function closeWalk(toChapter = false) {
    if (!open) return;
    open = false; runId++;
    cancelAnimationFrame(raf);
    clearKeys(); music.stop(1);
    try { recSrc?.stop(); } catch { /* not started */ }
    recSrc = null;
    root.hidden = true;
    document.documentElement.classList.remove('walking');
    if (window.Sound?.on) window.Sound.ctx?.resume().catch(() => {});
    if (toChapter) q('#mabath')?.scrollIntoView(); else opener?.focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-walk]');
    if (!b) return;
    opener = b;
    openWalk();
  });
  // Test hooks: Walk.open(), Walk.jump(0.98) puts the pilgrim near the cave.
  window.Walk = {
    open: openWalk,
    close: closeWalk,
    jump(s) { const i = Math.min(N - 1, Math.round(s * N)), a = pts[i], b = pts[i + 1]; player.position.set(a.x, a.y, a.z); yaw = camYaw = Math.atan2(b.x - a.x, b.z - a.z); },
  };
})();
