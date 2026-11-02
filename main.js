/* =========================================================
   BEL ART BELLEZA — comportamiento de la página
   Sin dependencias. Todo lo interactivo vive en este archivo.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Menú móvil ---- */
  const bg = $('#bg'), nav = $('#nav'), hd = $('#hd');
  const closeNav = () => { nav.classList.remove('open'); bg.setAttribute('aria-expanded', 'false'); bg.setAttribute('aria-label', 'Abrir menú'); };
  bg.addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    bg.setAttribute('aria-expanded', o); bg.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav a').forEach(a => a.addEventListener('click', closeNav));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ---- Cabecera con fondo al bajar + sección activa ---- */
  const links = $$('#nav ul a[href^="#"]');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  /* Se calcula una sola vez por cuadro (no en cada evento de scroll) y las posiciones se guardan,
     así el scroll en el celular no obliga al navegador a recalcular el diseño todo el tiempo. */
  let tops = [], sTick = false;
  const measure = () => { tops = secs.map(s => s.offsetTop); };
  const onScroll = () => {
    sTick = false;
    const y0 = window.pageYOffset || 0;
    hd.classList.toggle('stuck', y0 > 30);
    const y = y0 + 140; let cur = null;
    secs.forEach((s, i) => { if (tops[i] <= y) cur = s.id; });
    links.forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', () => { if (!sTick) { sTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('load', () => { measure(); onScroll(); });
  addEventListener('resize', () => { measure(); onScroll(); });
  measure(); onScroll();
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); onScroll(); }).observe(document.body);   /* por si las fotos o fuentes cambian la altura */

  /* ---- Pausar animaciones que no se están viendo (anillos del inicio, cinta de texto) ---- */
  if ('IntersectionObserver' in window) {
    const pz = new IntersectionObserver(es => es.forEach(x => x.target.classList.toggle('anim-off', !x.isIntersecting)), { rootMargin: '60px' });
    $$('.hero, .mq').forEach(e => pz.observe(e));
  }

  /* ---- Aparición al hacer scroll ---- */
  const rv = $$('.rv-in');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); io.unobserve(x.target); } }), { threshold: .12 });
    rv.forEach(e => io.observe(e));
  } else rv.forEach(e => e.classList.add('on'));

  /* ---- Brillo local en tarjetas (sigue al cursor) ---- */
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.card, .svc');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---- Inclinación suave de la foto del hero ---- */
  const art = $('#heroArt');
  if (art && finePointer && !reduceMotion) {
    const hero = $('#inicio');
    hero.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      art.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
      art.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { art.style.setProperty('--ry', '0deg'); art.style.setProperty('--rx', '0deg'); });
  }

  /* ---- Galería: filtros y ampliar ---- */
  const figs = $$('#gal figure');
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    figs.forEach(f => { f.hidden = b.dataset.f !== 'all' && f.dataset.c !== b.dataset.f; });
  }));
  const lbx = $('#lbx'), lImg = $('#lbxImg'), lCap = $('#lbxCap');
  let li = 0, lastFocus = null;
  const vis = () => figs.filter(f => !f.hidden);
  const show = i => {
    const v = vis(); if (!v.length) return;
    li = (i + v.length) % v.length;
    const im = $('img', v[li]); lImg.src = im.src; lImg.alt = im.alt; lCap.textContent = im.alt;
  };
  const openLb = f => { lastFocus = document.activeElement; show(vis().indexOf(f)); lbx.hidden = false; document.body.style.overflow = 'hidden'; $('.lbx-x').focus(); };
  const closeLb = () => { lbx.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
  figs.forEach(f => $('.gz', f).addEventListener('click', () => openLb(f)));
  $('.lbx-x').addEventListener('click', closeLb);
  $('.lbx-p').addEventListener('click', () => show(li - 1));
  $('.lbx-n').addEventListener('click', () => show(li + 1));
  lbx.addEventListener('click', e => { if (e.target === lbx) closeLb(); });
  addEventListener('keydown', e => {
    if (lbx.hidden) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') show(li - 1); else if (e.key === 'ArrowRight') show(li + 1);
  });

  /* ---- Reseñas de Google ----
     Para mostrar reseñas reales, agrega una por línea: {n:'Nombre',r:5,t:'Texto copiado de Google'}, */
  const RESENAS = [];
  const sc = $('#sc');
  $('#nx').addEventListener('click', () => sc.scrollBy({ left: 350, behavior: 'smooth' }));
  $('#pv').addEventListener('click', () => sc.scrollBy({ left: -350, behavior: 'smooth' }));
  if (RESENAS.length) {
    RESENAS.forEach(o => {
      const a = document.createElement('article'); a.className = 'rv';
      const h = document.createElement('div'); h.className = 'rh';
      const v = document.createElement('span'); v.className = 'av'; v.textContent = o.n.trim()[0].toUpperCase();
      const m = document.createElement('div'); const b = document.createElement('b'); b.textContent = o.n;
      const g = document.createElement('span'); g.className = 'tag'; g.textContent = 'Reseña de Google';
      m.append(b, g); h.append(v, m);
      const s = document.createElement('span'); s.className = 'st'; s.textContent = '★'.repeat(o.r) + '☆'.repeat(5 - o.r);
      const p = document.createElement('p'); p.textContent = '“' + o.t + '”';
      a.append(h, s, p); sc.append(a);
    });
    $('#rw').hidden = false; $('#rnote').hidden = true;
  }

  /* ---- Páginas legales (ventana) ---- */
  const lp = $$('.lp');
  function leg() {
    const h = location.hash.slice(1); let o = false;
    lp.forEach(p => { const on = p.id === h; p.hidden = !on; if (on) { o = true; p.scrollTop = 0; $('button', p).focus(); } });
    document.body.style.overflow = o ? 'hidden' : '';
  }
  addEventListener('hashchange', leg); leg();
  $$('.lp button').forEach(b => b.addEventListener('click', () => { history.replaceState(null, '', location.pathname + location.search); leg(); }));
  addEventListener('keydown', e => { const p = $('.lp:not([hidden])'); if (e.key === 'Escape' && p) $('button', p).click(); });

  /* ---- Brillo rosa que sigue al cursor (solo PC) ---- */
  const glow = $('#cursorGlow');
  if (glow && !reduceMotion && finePointer) {
    let tx = innerWidth / 2, ty = innerHeight / 2, gx = tx, gy = ty, on = false, raf = 0;
    const loop = () => {
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      glow.style.transform = 'translate3d(' + (gx - 260).toFixed(1) + 'px,' + (gy - 260).toFixed(1) + 'px,0)';
      raf = (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(loop) : 0;
    };
    document.addEventListener('pointermove', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; gx = tx; gy = ty; glow.classList.add('on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { on = false; glow.classList.remove('on'); });
    document.addEventListener('pointerdown', () => glow.classList.add('press'));
    document.addEventListener('pointerup', () => glow.classList.remove('press'));
  }

  /* =========================================================
     GALAXIA DE POLVO DE ESTRELLAS (fondo de toda la página)
     Espiral rosa y dorada. Se mueve con el mouse (solo pasarlo),
     con el dedo (deslizar), con el scroll, y reacciona a los toques
     con destellos.

     Cómo está hecha (para que vuele en el celular):
     - Las estrellas, el núcleo y las nebulosas se dibujan en la GPU con WebGL:
       una sola "orden" por capa en vez de miles de dibujos desde el procesador.
       Se ve igual (mismas estrellas, mismos colores) pero casi no cuesta nada.
     - Los destellos al tocar y las estrellas fugaces van en una capa 2D aparte
       que solo se usa mientras hay algo animándose.
     - Si el equipo no soporta WebGL, se usa el dibujo 2D de siempre (con sus niveles de calidad).
     - Calidad adaptativa: si de verdad va lento, baja SOLO la resolución interna, de a poquito,
       y si bajarla no mejora nada, devuelve la calidad (el problema sería otra cosa de la página).
     ========================================================= */
  (function galaxy() {
    let cv = $('#galaxy');
    if (!cv || !cv.getContext) return;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const hint = $('#galaxyHint');
    const lbxEl = $('#lbx');

    const NS = coarse ? 2200 : 5200;      // estrellas en brazos y disco
    const NB = coarse ? 320 : 800;        // estrellas del núcleo
    const NC = coarse ? 60 : 150;         // nebulosas pequeñas
    const NH = coarse ? 8 : 14;           // neblina grande
    const NBG = coarse ? 110 : 260;       // estrellas lejanas fijas

    /* paleta: champaña → oro → rosa → rosa fuerte → malva → perla */
    const PAL = [[255,243,226],[246,205,140],[245,155,190],[228,105,160],[190,135,205],[255,226,236]];
    const AL = [0.5, 0.8, 1];
    const NEB = [[236,110,160],[176,110,210],[250,190,130]];   // colores de las nebulosas

    const rnd = Math.random;
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 0.58;
    const pick = u => {
      const x = rnd();
      if (u < .14) return x < .55 ? 0 : (x < .85 ? 1 : 5);
      if (u < .35) return x < .3 ? 1 : (x < .7 ? 2 : (x < .85 ? 0 : 3));
      if (u < .65) return x < .15 ? 1 : (x < .5 ? 2 : (x < .9 ? 3 : 5));
      return x < .1 ? 2 : (x < .55 ? 3 : (x < .9 ? 4 : 5));
    };

    const TW = 4.4, ARMS = 4;

    /* ---------- datos de la galaxia (iguales para WebGL y 2D) ---------- */
    const stars = [];
    for (let i = 0; i < NS; i++) {
      const u = Math.pow(rnd(), 1.2) * 0.97 + 0.03;
      let th;
      if (rnd() < 0.16) th = rnd() * 6.2832;
      else th = Math.floor(rnd() * ARMS) * (6.2832 / ARMS) + u * TW + gauss() * (0.085 + 0.24 * Math.exp(-u * 4.5));
      const a = rnd() < .6 ? 0 : (rnd() < .75 ? 1 : 2);
      stars.push({ x: Math.cos(th) * u, y: Math.sin(th) * u, z: gauss() * 0.022 * (1.25 - u), b: pick(u) * 3 + a, s: 1 + a * 0.7 + rnd() * 0.8 });
    }
    for (let i = 0; i < NB; i++) {
      const u = Math.abs(gauss()) * 0.075, th = rnd() * 6.2832, a = rnd() < .5 ? 0 : (rnd() < .7 ? 1 : 2);
      stars.push({ x: Math.cos(th) * u, y: Math.sin(th) * u, z: gauss() * 0.05, b: (rnd() < .6 ? 0 : 1) * 3 + a, s: 0.7 + a * 0.5 + rnd() * 0.6 });
    }
    for (let i = stars.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, tmp = stars[i]; stars[i] = stars[j]; stars[j] = tmp; }
    stars.sort((p, q) => p.b - q.b);
    const N = stars.length;
    const X0 = new Float32Array(N), Y0 = new Float32Array(N), Z0 = new Float32Array(N), SZ = new Float32Array(N), BK = new Uint8Array(N);
    stars.forEach((s, i) => { X0[i] = s.x; Y0[i] = s.y; Z0[i] = s.z; SZ[i] = s.s; BK[i] = s.b; });
    const BST = new Int32Array(19);
    for (let i = 0; i < N; i++) BST[BK[i] + 1]++;
    for (let b = 0; b < 18; b++) BST[b + 1] += BST[b];

    const clouds = [];
    for (let i = 0; i < NC + NH; i++) {
      const big = i >= NC, u = big ? 0.1 + rnd() * 0.55 : 0.12 + Math.pow(rnd(), 1.2) * 0.85;
      const th = Math.floor(rnd() * ARMS) * (6.2832 / ARMS) + u * TW + gauss() * 0.12;
      clouds.push({ x: Math.cos(th) * u, y: Math.sin(th) * u, z: gauss() * 0.01, ci: (rnd() * 3) | 0,
        r: big ? 0.3 + rnd() * 0.2 : 0.05 + rnd() * 0.09, a: big ? 0.06 + rnd() * 0.05 : 0.14 + rnd() * 0.2 });
    }
    for (let i = clouds.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, tmp = clouds[i]; clouds[i] = clouds[j]; clouds[j] = tmp; }
    const bg = [];
    for (let i = 0; i < NBG; i++) bg.push({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 1.3, f: 0.6 + rnd() * 1.8, p: rnd() * 6.28, d: 0.2 + rnd() * 0.8, c: rnd() < .3 ? '255,215,170' : (rnd() < .5 ? '255,190,215' : '255,255,255') });

    /* ---------- estado y movimiento (compartido) ---------- */
    const BASE_TILT = 1.08, BASE_ROLL = -0.38, BASE_SPIN = 0.05;
    let rot = rnd() * 6.28, spin = BASE_SPIN, tilt = BASE_TILT, roll = BASE_ROLL;
    let ptX = 0, ptY = 0, tgX = 0, tgY = 0, dragTilt = 0, pulse = 0;
    let lastX = null, lastY = null, scrollY = window.pageYOffset || 0, lastScroll = scrollY, touched = false;
    const ripples = [], shoots = [], bursts = [];
    let nextShoot = 2.5;
    let W = 0, H = 0, dpr = 1, R = 400, t = 0;
    let M = [1, 0, 0, 0, 1, 0, 0, 0, 1], cx = 0, cy = 0, br = 1, boost = 1;
    const PF = 0.22;

    /* modo de dibujo: 'gl' (GPU) o '2d' (respaldo) */
    let mode = '2d', GL = null, ctx = null;

    /* niveles de calidad.
       WebGL: solo cambia la resolución interna (las estrellas nunca se reducen).
       2D (respaldo): d = resolución, s = estrellas, c = nebulosas, f = cuadros por segundo */
    const GLT = coarse ? [1.5, 1.25, 1, 0.85] : [2, 1.5, 1.25, 1];
    const TIERS = [
      { d: coarse ? 1.25 : 1.75, s: 1,    c: 1,    f: 60 },
      { d: 1,                    s: 0.72, c: 0.7,  f: 60 },
      { d: 0.85,                 s: 0.5,  c: 0.45, f: 30 },
      { d: 0.7,                  s: 0.35, c: 0.3,  f: 30 }
    ];
    let tier = 0, TR = TIERS[0];

    /* ---------- capa de efectos (destellos al tocar y estrellas fugaces) ---------- */
    let fcv = null, fx = null, fxDirty = false;
    const mul = (A, B) => [
      A[0]*B[0]+A[1]*B[3]+A[2]*B[6], A[0]*B[1]+A[1]*B[4]+A[2]*B[7], A[0]*B[2]+A[1]*B[5]+A[2]*B[8],
      A[3]*B[0]+A[4]*B[3]+A[5]*B[6], A[3]*B[1]+A[4]*B[4]+A[5]*B[7], A[3]*B[2]+A[4]*B[5]+A[5]*B[8],
      A[6]*B[0]+A[7]*B[3]+A[8]*B[6], A[6]*B[1]+A[7]*B[4]+A[8]*B[7], A[6]*B[2]+A[7]*B[5]+A[8]*B[8]];

    /* destello de 4 puntas */
    const star4 = (c, x, y, s) => {
      const k = s * 0.2;
      c.beginPath();
      c.moveTo(x, y - s); c.lineTo(x + k, y - k); c.lineTo(x + s, y); c.lineTo(x + k, y + k);
      c.lineTo(x, y + s); c.lineTo(x - k, y + k); c.lineTo(x - s, y); c.lineTo(x - k, y - k);
      c.closePath(); c.fill();
    };
    const fxCanvas = () => {
      if (fcv) return;
      fcv = document.createElement('canvas');
      fcv.className = 'galaxy galaxy-fx'; fcv.setAttribute('aria-hidden', 'true');
      cv.after(fcv);
      fx = fcv.getContext('2d');
      sizeFx();
    };
    const sizeFx = () => {
      if (!fcv) return;
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      fcv.width = Math.round(W * d); fcv.height = Math.round(H * d);
      fcv._d = d;
    };

    /* cada cierto tiempo aparece una estrella fugaz */
    function spawn(dt) {
      if (reduceMotion) return;
      nextShoot -= dt;
      if (nextShoot > 0) return;
      nextShoot = 4 + rnd() * 6;
      const dir = rnd() < .5 ? 1 : -1;
      shoots.push({ x: dir > 0 ? rnd() * W * 0.6 : W * 0.4 + rnd() * W * 0.6, y: rnd() * H * 0.45, vx: dir * (620 + rnd() * 380), vy: 260 + rnd() * 200, t: 0, life: 0.9 + rnd() * 0.5 });
      if (mode === 'gl') fxCanvas();
    }

    /* avanza y dibuja ondas, destellos y estrellas fugaces en el lienzo c */
    function effects(c, dt) {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; r.t += dt;
        if (r.t > 1.1) { ripples.splice(i, 1); continue; }
        const p = r.t / 1.1, rad = 14 + p * 190;
        c.globalAlpha = (1 - p) * 0.8; c.lineWidth = 2; c.strokeStyle = 'rgba(255,180,210,1)';
        c.beginPath(); c.arc(r.x, r.y, rad, 0, 6.2832); c.stroke();
        c.globalAlpha = (1 - p) * 0.35; c.strokeStyle = 'rgba(255,230,190,1)';
        c.beginPath(); c.arc(r.x, r.y, rad * 0.62, 0, 6.2832); c.stroke();
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]; b.t += dt;
        if (b.t > b.life) { bursts.splice(i, 1); continue; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.96; b.vy *= 0.96;
        const f = 1 - b.t / b.life;
        c.globalAlpha = f; c.fillStyle = 'rgba(' + b.c + ',1)';
        star4(c, b.x, b.y, b.s * (0.5 + f));
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.t > s.life) { shoots.splice(i, 1); continue; }
        const f = 1 - s.t / s.life, len = 0.11, tx = s.x - s.vx * len, ty = s.y - s.vy * len;
        const g = c.createLinearGradient(s.x, s.y, tx, ty);
        g.addColorStop(0, 'rgba(255,248,235,' + (0.95 * f) + ')'); g.addColorStop(0.3, 'rgba(255,175,205,' + (0.5 * f) + ')'); g.addColorStop(1, 'rgba(224,112,154,0)');
        c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 1.8;
        c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(tx, ty); c.stroke();
      }
    }
    const fxActive = () => ripples.length || bursts.length || shoots.length;

    /* =====================================================
       WEBGL
       ===================================================== */
    const PREC = 'precision mediump float;';
    /* fragmento común de las estrellas: cuadradito con borde suave (igual que el dibujo 2D) */
    const FS_STAR = PREC + `
varying vec4 vC; varying float vS; varying float vP;
void main(){
  vec2 rel = (gl_PointCoord - 0.5) * vP;
  float h = vS * 0.5;
  vec2 ov = clamp(min(vec2(h), rel + 0.5) - max(vec2(-h), rel - 0.5), 0.0, 1.0);
  float A = vC.a * ov.x * ov.y;
  gl_FragColor = vec4(vC.rgb * A, A);
}`;
    const VS_STAR = `
attribute vec3 aP; attribute float aS; attribute vec4 aC;
uniform vec3 uR0, uR1, uR2; uniform vec2 uCen, uView, uPx; uniform float uR, uPf, uSk, uA;
varying vec4 vC; varying float vS; varying float vP;
void main(){
  float sc = 1.0 / (1.0 - dot(uR2, aP) * uPf);
  vec2 c = vec2(uCen.x + dot(uR0, aP) * uR * sc, uCen.y + dot(uR1, aP) * uR * sc);
  float ds = aS * sc * uSk * uPx.x;
  vS = ds; vP = ceil(ds) + 2.0;
  vC = vec4(aC.rgb, aC.a * uA);
  gl_PointSize = vP;
  gl_Position = vec4(c.x / uView.x * 2.0 - 1.0, 1.0 - c.y / uView.y * 2.0, 0.0, 1.0);
}`;
    const VS_BG = `
attribute vec2 aXY; attribute vec4 aB; attribute vec3 aC;
uniform vec2 uView, uPx, uPar; uniform float uT;
varying vec4 vC; varying float vS; varying float vP;
void main(){
  float s = aB.x;
  vec2 c = vec2(aXY.x * uView.x - uPar.x * aB.w, aXY.y * uView.y - uPar.y * aB.w) + s * 0.5;
  float a = 0.12 + (0.5 + 0.5 * sin(uT * aB.y + aB.z)) * 0.5;
  float ds = s * uPx.x;
  vS = ds; vP = ceil(ds) + 2.0;
  vC = vec4(aC, a);
  gl_PointSize = vP;
  gl_Position = vec4(c.x / uView.x * 2.0 - 1.0, 1.0 - c.y / uView.y * 2.0, 0.0, 1.0);
}`;
    const VS_SPR = `
attribute vec2 aK; attribute vec3 aP; attribute vec2 aRA; attribute vec3 aC;
uniform vec3 uR0, uR1, uR2; uniform vec2 uCen, uView; uniform float uR, uPf, uBoost, uAdd, uSz;
varying vec2 vK; varying vec4 vCol;
void main(){
  float sc = 1.0 / (1.0 - dot(uR2, aP) * uPf);
  vec2 c = vec2(uCen.x + dot(uR0, aP) * uR * sc, uCen.y + dot(uR1, aP) * uR * sc);
  vec2 p = c + aK * aRA.x * uSz * uR * sc;
  vK = aK;
  vCol = vec4(aC, min(1.0, aRA.y * uBoost + uAdd));
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
}`;
    /* mismo degradado radial que usaba el dibujo 2D: 1 → .38 (a 35%) → 0 */
    const FS_SPR = PREC + `
varying vec2 vK; varying vec4 vCol;
void main(){
  float r = length(vK);
  float a = r < 0.35 ? 1.0 - 0.62 * (r / 0.35) : 0.38 * (1.0 - (r - 0.35) / 0.65);
  float A = max(a, 0.0) * vCol.a;
  gl_FragColor = vec4(vCol.rgb * A, A);
}`;

    function mkProg(g, vs, fs) {
      const sh = (ty, src) => {
        const o = g.createShader(ty); g.shaderSource(o, src); g.compileShader(o);
        if (!g.getShaderParameter(o, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(o) || 'shader');
        return o;
      };
      const p = g.createProgram();
      g.attachShader(p, sh(g.VERTEX_SHADER, vs)); g.attachShader(p, sh(g.FRAGMENT_SHADER, fs));
      g.linkProgram(p);
      if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p) || 'link');
      const u = {}, a = {};
      for (let i = g.getProgramParameter(p, g.ACTIVE_UNIFORMS) - 1; i >= 0; i--) { const q = g.getActiveUniform(p, i); u[q.name] = g.getUniformLocation(p, q.name); }
      for (let i = g.getProgramParameter(p, g.ACTIVE_ATTRIBUTES) - 1; i >= 0; i--) { const q = g.getActiveAttrib(p, i); a[q.name] = g.getAttribLocation(p, q.name); }
      return { p, u, a };
    }
    const mkBuf = (g, data) => { const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b); g.bufferData(g.ARRAY_BUFFER, data, g.STATIC_DRAW); return b; };

    function buildGL(g) {
      const S = { g, star: mkProg(g, VS_STAR, FS_STAR), bg: mkProg(g, VS_BG, FS_STAR), spr: mkProg(g, VS_SPR, FS_SPR) };

      /* estrellas: x y z tamaño | r g b a */
      const sd = new Float32Array(N * 8);
      for (let i = 0; i < N; i++) {
        const o = i * 8, c = PAL[(BK[i] / 3) | 0];
        sd[o] = X0[i]; sd[o + 1] = Y0[i]; sd[o + 2] = Z0[i]; sd[o + 3] = SZ[i];
        sd[o + 4] = c[0] / 255; sd[o + 5] = c[1] / 255; sd[o + 6] = c[2] / 255; sd[o + 7] = AL[BK[i] % 3];
      }
      S.starBuf = mkBuf(g, sd); S.nStar = N;

      /* estrellas lejanas: x y | tamaño frecuencia fase profundidad | r g b */
      const bd = new Float32Array(NBG * 9);
      bg.forEach((o, i) => {
        const k = o.c.split(','), j = i * 9;
        bd[j] = o.x; bd[j + 1] = o.y; bd[j + 2] = o.s; bd[j + 3] = o.f; bd[j + 4] = o.p; bd[j + 5] = o.d;
        bd[j + 6] = k[0] / 255; bd[j + 7] = k[1] / 255; bd[j + 8] = k[2] / 255;
      });
      S.bgBuf = mkBuf(g, bd); S.nBg = NBG;

      /* nebulosas + brillo grande + núcleo: cada una es un cuadrado (6 vértices): kx ky | x y z | radio alfa | r g b */
      const items = clouds.map(c => ({ x: c.x, y: c.y, z: c.z, r: c.r, a: c.a, c: NEB[c.ci] }));
      items.push({ x: 0, y: 0, z: 0, r: 0.575, a: 0.5, c: NEB[0] });          // brillo grande (se escala con br)
      items.push({ x: 0, y: 0, z: 0, r: 0.13, a: 0.85, c: [255, 238, 220] });  // núcleo
      const K = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1];
      const pd = new Float32Array(items.length * 6 * 10);
      items.forEach((it, n) => {
        for (let v = 0; v < 6; v++) {
          const o = (n * 6 + v) * 10;
          pd[o] = K[v * 2]; pd[o + 1] = K[v * 2 + 1];
          pd[o + 2] = it.x; pd[o + 3] = it.y; pd[o + 4] = it.z;
          pd[o + 5] = it.r; pd[o + 6] = it.a;
          pd[o + 7] = it.c[0] / 255; pd[o + 8] = it.c[1] / 255; pd[o + 9] = it.c[2] / 255;
        }
      });
      S.sprBuf = mkBuf(g, pd); S.nCl = clouds.length;

      g.disable(g.DEPTH_TEST); g.disable(g.CULL_FACE); g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE);          // suma de luz, igual que 'lighter' del 2D
      g.clearColor(0, 0, 0, 0);
      return S;
    }

    function tryGL() {
      let g = null;
      try {
        g = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: true });
      } catch (e) { g = null; }
      if (!g) return false;
      try { GL = buildGL(g); }
      catch (e) {
        /* el lienzo ya quedó "tomado" por WebGL: se cambia por uno nuevo para usar el respaldo 2D */
        const n = document.createElement('canvas'); n.id = cv.id; n.className = cv.className; n.setAttribute('aria-hidden', 'true');
        cv.replaceWith(n); cv = n; GL = null; return false;
      }
      mode = 'gl';
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); glLost = true; }, false);
      cv.addEventListener('webglcontextrestored', () => {
        try { GL = buildGL(cv.getContext('webgl')); glLost = false; resize(); drawGL(); } catch (er) { /* se queda sin fondo animado */ }
      }, false);
      return true;
    }
    let glLost = false;

    const att = (P, name, size, stride, off) => {
      const l = P.a[name]; if (l === undefined) return;
      GL.g.enableVertexAttribArray(l); GL.g.vertexAttribPointer(l, size, GL.g.FLOAT, false, stride, off);
    };
    const attOff = P => { for (const k in P.a) GL.g.disableVertexAttribArray(P.a[k]); };
    const matU = (P, g) => { g.uniform3f(P.u.uR0, M[0], M[1], M[2]); g.uniform3f(P.u.uR1, M[3], M[4], M[5]); g.uniform3f(P.u.uR2, M[6], M[7], M[8]); };

    function drawGL() {
      if (glLost) return;
      const g = GL.g, px = cv.width / W, py = cv.height / H;
      g.viewport(0, 0, cv.width, cv.height);
      g.clear(g.COLOR_BUFFER_BIT);

      /* estrellas lejanas (titilan solas, con un poco de paralaje) */
      let P = GL.bg;
      g.useProgram(P.p); g.bindBuffer(g.ARRAY_BUFFER, GL.bgBuf);
      att(P, 'aXY', 2, 36, 0); att(P, 'aB', 4, 36, 8); att(P, 'aC', 3, 36, 24);
      g.uniform2f(P.u.uView, W, H); g.uniform2f(P.u.uPx, px, py); g.uniform2f(P.u.uPar, ptX * 14, ptY * 10); g.uniform1f(P.u.uT, t);
      g.drawArrays(g.POINTS, 0, GL.nBg); attOff(P);

      /* nebulosas pequeñas y neblina grande */
      P = GL.spr;
      g.useProgram(P.p); g.bindBuffer(g.ARRAY_BUFFER, GL.sprBuf);
      att(P, 'aK', 2, 40, 0); att(P, 'aP', 3, 40, 8); att(P, 'aRA', 2, 40, 20); att(P, 'aC', 3, 40, 28);
      matU(P, g); g.uniform2f(P.u.uCen, cx, cy); g.uniform2f(P.u.uView, W, H); g.uniform1f(P.u.uR, R); g.uniform1f(P.u.uPf, PF);
      g.uniform1f(P.u.uBoost, boost); g.uniform1f(P.u.uAdd, 0); g.uniform1f(P.u.uSz, 1);
      g.drawArrays(g.TRIANGLES, 0, GL.nCl * 6);
      /* brillo grande central */
      g.uniform1f(P.u.uBoost, 1); g.uniform1f(P.u.uAdd, pulse * 0.3); g.uniform1f(P.u.uSz, br);
      g.drawArrays(g.TRIANGLES, GL.nCl * 6, 6); attOff(P);

      /* estrellas de los brazos y del núcleo */
      const P2 = GL.star;
      g.useProgram(P2.p); g.bindBuffer(g.ARRAY_BUFFER, GL.starBuf);
      att(P2, 'aP', 3, 32, 0); att(P2, 'aS', 1, 32, 12); att(P2, 'aC', 4, 32, 16);
      matU(P2, g); g.uniform2f(P2.u.uCen, cx, cy); g.uniform2f(P2.u.uView, W, H); g.uniform2f(P2.u.uPx, px, py);
      g.uniform1f(P2.u.uR, R); g.uniform1f(P2.u.uPf, PF); g.uniform1f(P2.u.uSk, 1);
      g.uniform1f(P2.u.uA, Math.min(1, 0.9 + 0.1 * Math.sin(t * 0.9) + pulse * 0.1));
      g.drawArrays(g.POINTS, 0, GL.nStar); attOff(P2);

      /* núcleo brillante */
      g.useProgram(P.p); g.bindBuffer(g.ARRAY_BUFFER, GL.sprBuf);
      att(P, 'aK', 2, 40, 0); att(P, 'aP', 3, 40, 8); att(P, 'aRA', 2, 40, 20); att(P, 'aC', 3, 40, 28);
      g.uniform1f(P.u.uBoost, 1); g.uniform1f(P.u.uAdd, pulse * 0.15); g.uniform1f(P.u.uSz, br);
      g.drawArrays(g.TRIANGLES, (GL.nCl + 1) * 6, 6); attOff(P);
    }

    /* =====================================================
       RESPALDO 2D (el dibujo de siempre)
       ===================================================== */
    let S2 = null;
    function init2D() {
      ctx = cv.getContext('2d');
      const FILL = [];
      PAL.forEach(c => AL.forEach(a => FILL.push('rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')')));
      const sprite = (r, g, b, size) => {
        const c = document.createElement('canvas'); c.width = c.height = size;
        const x = c.getContext('2d'), h = size / 2, gr = x.createRadialGradient(h, h, 0, h, h, h);
        gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
        gr.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ',.38)');
        gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        x.fillStyle = gr; x.fillRect(0, 0, size, size);
        return c;
      };
      const SP = NEB.map(c => sprite(c[0], c[1], c[2], 128));
      const BGG = {};
      bg.forEach(o => (BGG[o.c] = BGG[o.c] || []).push(o));
      const hz = document.createElement('canvas');
      S2 = { FILL, SP, SPCORE: sprite(255, 238, 220, 256), SPWIDE: sprite(232, 110, 160, 256),
        BGL: Object.keys(BGG).map(k => ({ fs: 'rgb(' + k + ')', a: BGG[k] })), hz, hx: hz.getContext('2d'), HS: coarse ? 0.5 : 0.75, hsc: 1 };
    }

    function draw2D() {
      const { FILL, SP, SPCORE, SPWIDE, BGL, hz, hx } = S2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (let g = 0; g < BGL.length; g++) {
        const G = BGL[g], n = Math.ceil(G.a.length * TR.s);
        ctx.fillStyle = G.fs;
        for (let i = 0; i < n; i++) {
          const s = G.a[i];
          ctx.globalAlpha = 0.12 + (0.5 + 0.5 * Math.sin(t * s.f + s.p)) * 0.5;
          ctx.fillRect(s.x * W - ptX * 14 * s.d, s.y * H - ptY * 10 * s.d, s.s, s.s);
        }
      }

      const ncl = Math.ceil(clouds.length * TR.c), pf = PF;
      hx.setTransform(S2.hsc, 0, 0, S2.hsc, 0, 0);
      hx.clearRect(0, 0, W, H);
      hx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < ncl; i++) {
        const c = clouds[i];
        const sx = M[0]*c.x + M[1]*c.y + M[2]*c.z, sy = M[3]*c.x + M[4]*c.y + M[5]*c.z, d = M[6]*c.x + M[7]*c.y + M[8]*c.z;
        const sc2 = 1 / (1 - d * pf), s2 = c.r * R * 2 * sc2;
        hx.globalAlpha = Math.min(1, c.a * boost);
        hx.drawImage(SP[c.ci], cx + sx * R * sc2 - s2 / 2, cy + sy * R * sc2 - s2 / 2, s2, s2);
      }
      hx.globalAlpha = Math.min(1, 0.5 + pulse * 0.3);
      const ww = R * 1.15 * br; hx.drawImage(SPWIDE, cx - ww / 2, cy - ww / 2, ww, ww);
      ctx.globalAlpha = 1; ctx.drawImage(hz, 0, 0, W, H);

      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 0.9) + pulse * 0.1;
      const sk = 1 + (1 - TR.s) * 0.35;
      const m0 = M[0], m1 = M[1], m2 = M[2], m3 = M[3], m4 = M[4], m5 = M[5], m6 = M[6], m7 = M[7], m8 = M[8];
      for (let b = 0; b < 18; b++) {
        const a0 = BST[b], a1 = a0 + Math.ceil((BST[b + 1] - a0) * TR.s);
        if (a1 <= a0) continue;
        ctx.fillStyle = FILL[b];
        for (let i = a0; i < a1; i++) {
          const x = X0[i], y = Y0[i], z = Z0[i];
          const d = m6 * x + m7 * y + m8 * z, sc2 = 1 / (1 - d * pf), s = SZ[i] * sc2 * sk;
          ctx.fillRect(cx + (m0 * x + m1 * y + m2 * z) * R * sc2 - s / 2, cy + (m3 * x + m4 * y + m5 * z) * R * sc2 - s / 2, s, s);
        }
      }

      ctx.globalAlpha = Math.min(1, 0.85 + pulse * 0.15);
      const w = R * 0.26 * br; ctx.drawImage(SPCORE, cx - w / 2, cy - w / 2, w, w);
    }

    /* =====================================================
       TAMAÑO, ENTRADAS (mouse / dedo / scroll) Y BUCLE
       ===================================================== */
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mode === 'gl' ? GLT[gt] : TR.d);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      if (S2) { S2.hsc = dpr * S2.HS; S2.hz.width = Math.max(1, Math.round(W * S2.hsc)); S2.hz.height = Math.max(1, Math.round(H * S2.hsc)); }
      R = Math.max(W, H) * (coarse ? 0.56 : 0.5);
      sizeFx();
    };
    let gt = 0;
    if (!tryGL()) {
      init2D();
      const lowEnd = coarse && ((navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
      tier = lowEnd ? 2 : 0; TR = TIERS[tier];
      if (tier >= 2) document.documentElement.classList.add('lite');
    }
    resize();
    addEventListener('resize', () => {
      const nw = cv.clientWidth, nh = cv.clientHeight;
      /* en el celular la barra del navegador sube y baja al hacer scroll: no rehacer el lienzo por eso */
      if (nw === W && (coarse ? Math.abs(nh - H) < 200 : nh === H)) return;
      resize(); if (mode === 'gl') { prepare(0); drawGL(); } else if (reduceMotion) frame(0);
    });

    const interact = () => {
      if (touched) return; touched = true;
      if (hint) { hint.classList.remove('show'); hint.classList.add('gone'); }
    };

    if (!reduceMotion) {
      const move = (x, y, type) => {
        if (lastX !== null) {
          const dx = x - lastX, dy = y - lastY;
          spin = Math.max(-3.4, Math.min(3.4, spin + dx * (type === 'mouse' ? 0.0016 : 0.0030)));
          dragTilt = Math.max(-0.5, Math.min(0.5, dragTilt + dy * 0.0016));
          if (Math.abs(dx) + Math.abs(dy) > 6) interact();
        }
        lastX = x; lastY = y;
        tgX = (x / W) * 2 - 1; tgY = (y / H) * 2 - 1;
      };
      addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; move(e.clientX, e.clientY, e.pointerType); }, { passive: true });
      const spark = (x, y) => {
        if (mode === 'gl') fxCanvas();
        ripples.push({ x, y, t: 0 });
        const nb = coarse ? 9 : 12;
        for (let i = 0; i < nb; i++) {
          const an = rnd() * 6.2832, sp = 60 + rnd() * 190;
          bursts.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, t: 0, life: 0.7 + rnd() * 0.7, s: 3 + rnd() * 6, c: rnd() < .5 ? '255,226,190' : '255,170,205' });
        }
      };
      const INTER = 'a,button,input,textarea,select,label,summary,iframe';
      /* En pantallas táctiles: un toque suelta brillitos, pero NO mueve la galaxia (solo el scroll la mueve).
         Si el dedo se desliza para hacer scroll, no hay brillitos. */
      let tap = null;
      addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') {
          tap = { x: e.clientX, y: e.clientY, t: performance.now(), ok: !(e.target.closest && e.target.closest(INTER)) };
          return;
        }
        lastX = e.clientX; lastY = e.clientY; tgX = (lastX / W) * 2 - 1; tgY = (lastY / H) * 2 - 1;
        if (e.target.closest && e.target.closest(INTER)) return;
        spark(e.clientX, e.clientY);
        pulse = 1; spin += (rnd() < .5 ? -1 : 1) * 0.9; interact();
      }, { passive: true });
      const end = e => { if (e.pointerType !== 'mouse') { lastX = lastY = null; tgX = tgY = 0; } };
      addEventListener('pointerup', e => {
        if (e.pointerType !== 'mouse' && tap) {
          const q = tap; tap = null;
          if (q.ok && Math.abs(e.clientX - q.x) < 12 && Math.abs(e.clientY - q.y) < 12 && performance.now() - q.t < 600) spark(e.clientX, e.clientY);
        }
        end(e);
      }, { passive: true });
      addEventListener('pointercancel', e => { tap = null; end(e); }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { lastX = lastY = null; tgX = tgY = 0; });
      addEventListener('scroll', () => { scrollY = window.pageYOffset || 0; if (coarse && Math.abs(scrollY - lastScroll) > 30) interact(); }, { passive: true });
      document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) { prev = performance.now(); raf = requestAnimationFrame(loop); } });

      if (hint) {
        hint.textContent = '✦ ' + (coarse ? 'Desliza hacia abajo y la galaxia se mueve' : 'Mueve el mouse para girar la galaxia');
        setTimeout(() => { if (!touched) hint.classList.add('show'); }, 1600);
        setTimeout(() => { hint.classList.remove('show'); hint.classList.add('gone'); }, 11000);
      }
    }

    /* movimiento: calcula la posición de la galaxia para este cuadro */
    function prepare(dt) {
      t += dt;
      const k = 1 - Math.exp(-dt * 3);
      ptX += (tgX - ptX) * k; ptY += (tgY - ptY) * k;
      dragTilt *= Math.exp(-dt * 0.9);
      pulse *= Math.exp(-dt * 1.6);
      const sv = (scrollY - lastScroll) / Math.max(dt, 0.001); lastScroll = scrollY;
      if (dt > 0) spin += Math.max(-1.4, Math.min(1.4, sv * 0.00045)) * Math.min(1, dt * 12);
      spin += (BASE_SPIN - spin) * (1 - Math.exp(-dt * 0.8));
      rot += spin * dt;

      const tT = BASE_TILT + ptY * 0.26 + dragTilt + Math.sin(scrollY / 1100) * 0.14;
      const rT = BASE_ROLL + ptX * 0.16 + Math.sin(scrollY / 1700) * 0.1;
      tilt += (tT - tilt) * k; roll += (rT - roll) * k;

      const cz = Math.cos(rot), sz = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);
      M = mul(mul([cr, -sr, 0, sr, cr, 0, 0, 0, 1], [1, 0, 0, 0, ct, -st, 0, st, ct]), [cz, -sz, 0, sz, cz, 0, 0, 0, 1]);
      cx = W * (W < 900 ? 0.5 : 0.66) + ptX * 16;
      cy = H * 0.47 - Math.min(scrollY * 0.1, 260) + ptY * 12;
      boost = 1 + pulse * 0.6;
      br = 1 + 0.05 * Math.sin(t * 1.3) + pulse * 0.25;
    }

    function frame(dt) {
      prepare(dt);
      spawn(dt);
      if (mode === 'gl') {
        drawGL();
        if (fcv) {
          if (fxActive()) {
            const d = fcv._d;
            fx.setTransform(d, 0, 0, d, 0, 0); fx.clearRect(0, 0, W, H);
            fx.globalCompositeOperation = 'lighter';
            effects(fx, dt); fx.globalAlpha = 1; fxDirty = true;
          } else if (fxDirty) {
            fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, fcv.width, fcv.height); fxDirty = false;
          }
        }
      } else {
        draw2D();
        effects(ctx, dt);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
    }

    let raf = 0, prev = performance.now();

    /* ---- calidad adaptativa ---- */
    /* no se mide mientras la página termina de cargar (las fotos y fuentes causan tirones que no son de la galaxia) */
    let startAfter = performance.now() + 4000;
    addEventListener('load', () => { startAfter = performance.now() + 1500; });

    /* WebGL: baja solo la resolución, un escalón a la vez. Si bajarla no mejora al menos 8%,
       el lag no viene de la galaxia: devuelve la calidad y deja de tocarla. */
    let win = 0, winSum = 0, winT0 = 0, settle = 0, probe = null, locked = false;
    const setGT = n => { gt = n; resize(); prepare(0); drawGL(); win = winSum = 0; settle = 12; };
    /* promedio de ms por cuadro cada 50 cuadros (null mientras no haya uno nuevo) */
    function judge(gap) {
      if (performance.now() < startAfter) return null;
      if (gap > 250) { win = winSum = 0; return null; }        /* pausa o cambio de pestaña: no cuenta */
      if (settle > 0) { settle--; return null; }
      if (!win) winT0 = performance.now();
      win++; winSum += Math.min(gap, 100);
      /* 50 cuadros; si el equipo va muy lento, con 15 cuadros o 3 segundos ya alcanza para juzgar */
      if (win < 50 && !(win >= 15 && performance.now() - winT0 > 3000)) return null;
      const avg = winSum / win; win = winSum = 0; return avg;
    }

    /* Nivel extremo: teléfono muy viejo (menos de ~15 cuadros por segundo de forma sostenida aun con la
       calidad al mínimo). Se apaga la galaxia y queda un fondo estático. Se comprueba que apagarla
       sí mejore; si no mejora, el lag es de otra cosa y se vuelve a encender. Solo se intenta una vez. */
    const EXTREME = 66;
    let off = false, killTried = false, offProbe = null, bad = 0;
    const showCanvases = v => { cv.style.display = v ? '' : 'none'; if (fcv) fcv.style.display = v ? '' : 'none'; };
    function turnOff(avg) {
      off = true; killTried = true; offProbe = { avg }; bad = 0; win = winSum = 0; settle = 12;
      ripples.length = bursts.length = shoots.length = 0;
      showCanvases(false); document.documentElement.classList.add('galaxy-off');
      if (hint) { hint.classList.remove('show'); hint.classList.add('gone'); }
    }
    function turnOn() {
      off = false; locked = true; win = winSum = 0; settle = 12;
      showCanvases(true); document.documentElement.classList.remove('galaxy-off');
      resize(); prepare(0); if (mode === 'gl') drawGL();
    }
    function extremeCheck(avg, atFloor) {
      bad = (avg > EXTREME && atFloor) ? bad + 1 : 0;
      if (bad >= 2 && !killTried) { turnOff(avg); return true; }
      return false;
    }

    /* WebGL: baja solo la resolución, un escalón a la vez. Si bajarla no mejora al menos 8%,
       el lag no viene de la galaxia: devuelve la calidad y deja de tocarla. */
    function adaptGL(gap, fi) {
      const avg = judge(gap);
      if (avg === null) return;
      if (extremeCheck(avg, locked || gt >= GLT.length - 1)) return;
      if (locked) return;
      if (probe) {
        const p = probe; probe = null;
        if (avg > p.avg * 0.92) { setGT(p.tier); locked = true; return; }
      }
      if (avg > fi * 1.35 && gt < GLT.length - 1) { probe = { avg, tier: gt }; setGT(gt + 1); }
    }

    /* 2D (respaldo): baja estrellas, resolución y cuadros por segundo */
    let warm = 0, nF = 0, sumI = 0, sumC = 0;
    const setTier2D = n => {
      tier = n; TR = TIERS[n]; resize();
      if (n >= 2 || (!coarse && n >= 1)) document.documentElement.classList.add('lite');
      warm = 0; nF = sumI = sumC = 0;
      if (reduceMotion) frame(0);
    };
    function adapt2D(gap, fi, cost) {
      const avg = judge(gap);
      if (avg !== null && extremeCheck(avg, tier >= 3)) return;
      if (tier >= 3 || performance.now() < startAfter || gap > 250) return;
      if (warm < 40) { warm++; return; }
      nF++; sumI += gap; sumC += cost;
      if (nF >= 40) {
        if (sumI / nF > fi * 1.3 || sumC / nF > 11) setTier2D(tier + 1);
        nF = sumI = sumC = 0;
      }
    }

    function loop(now) {
      if (document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      const fi = mode === 'gl' ? 1000 / 60 : 1000 / TR.f, gap = now - prev;
      if (gap < fi - 3) return;                         /* tope de cuadros por segundo */
      prev = now;
      if (off) {                                         /* galaxia apagada: solo se mide si apagarla ayudó */
        const avg = judge(gap);
        if (avg !== null && offProbe) { const p = offProbe; offProbe = null; if (avg > p.avg * 0.75 || avg > EXTREME) turnOn(); }   /* apagarla no mejoró lo suficiente: el lag es de otra cosa */
        return;
      }
      if (lbxEl && !lbxEl.hidden) { win = winSum = 0; return; }   /* con la foto ampliada no hace falta dibujar */
      const t0 = performance.now();
      frame(Math.min(0.1, gap / 1000));
      if (mode === 'gl') adaptGL(gap, fi); else adapt2D(gap, fi, performance.now() - t0);
    }
    if (reduceMotion) frame(0); else raf = requestAnimationFrame(loop);
  })();
})();
