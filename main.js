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
  const onScroll = () => {
    hd.classList.toggle('stuck', (window.pageYOffset || 0) > 30);
    const y = (window.pageYOffset || 0) + 140; let cur = null;
    secs.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
    links.forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

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
     ========================================================= */
  (function galaxy() {
    const cv = $('#galaxy');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const coarse = matchMedia('(pointer: coarse)').matches;
    const hint = $('#galaxyHint');

    const NS = coarse ? 2200 : 5200;      // estrellas en brazos y disco
    const NB = coarse ? 320 : 800;        // estrellas del núcleo
    const NC = coarse ? 60 : 150;         // nebulosas pequeñas
    const NH = coarse ? 8 : 14;           // neblina grande
    const NBG = coarse ? 110 : 260;       // estrellas lejanas fijas

    /* paleta: champaña → oro → rosa → rosa fuerte → malva → perla */
    const PAL = [[255,243,226],[246,205,140],[245,155,190],[228,105,160],[190,135,205],[255,226,236]];
    const AL = [0.5, 0.8, 1];
    const FILL = [];
    PAL.forEach(c => AL.forEach(a => FILL.push('rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')')));

    const rnd = Math.random;
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 0.58;
    const pick = u => {
      const x = rnd();
      if (u < .14) return x < .55 ? 0 : (x < .85 ? 1 : 5);
      if (u < .35) return x < .3 ? 1 : (x < .7 ? 2 : (x < .85 ? 0 : 3));
      if (u < .65) return x < .15 ? 1 : (x < .5 ? 2 : (x < .9 ? 3 : 5));
      return x < .1 ? 2 : (x < .55 ? 3 : (x < .9 ? 4 : 5));
    };

    let W = 0, H = 0, dpr = 1, R = 400;
    const TW = 4.4, ARMS = 4;

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
    stars.sort((p, q) => p.b - q.b);
    const N = stars.length;
    const X0 = new Float32Array(N), Y0 = new Float32Array(N), Z0 = new Float32Array(N), SZ = new Float32Array(N), BK = new Uint8Array(N);
    stars.forEach((s, i) => { X0[i] = s.x; Y0[i] = s.y; Z0[i] = s.z; SZ[i] = s.s; BK[i] = s.b; });

    const sprite = (r, g, b, size) => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const x = c.getContext('2d'), h = size / 2, gr = x.createRadialGradient(h, h, 0, h, h, h);
      gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
      gr.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ',.38)');
      gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      x.fillStyle = gr; x.fillRect(0, 0, size, size);
      return c;
    };
    const SP = [sprite(236, 110, 160, 128), sprite(176, 110, 210, 128), sprite(250, 190, 130, 128)];
    const SPCORE = sprite(255, 238, 220, 256);
    const SPWIDE = sprite(232, 110, 160, 256);

    const clouds = [];
    for (let i = 0; i < NC + NH; i++) {
      const big = i >= NC, u = big ? 0.1 + rnd() * 0.55 : 0.12 + Math.pow(rnd(), 1.2) * 0.85;
      const th = Math.floor(rnd() * ARMS) * (6.2832 / ARMS) + u * TW + gauss() * 0.12;
      clouds.push({ x: Math.cos(th) * u, y: Math.sin(th) * u, z: gauss() * 0.01, sp: SP[(rnd() * 3) | 0],
        r: big ? 0.3 + rnd() * 0.2 : 0.05 + rnd() * 0.09, a: big ? 0.06 + rnd() * 0.05 : 0.14 + rnd() * 0.2 });
    }

    const bg = [];
    for (let i = 0; i < NBG; i++) bg.push({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 1.3, f: 0.6 + rnd() * 1.8, p: rnd() * 6.28, d: 0.2 + rnd() * 0.8, c: rnd() < .3 ? '255,215,170' : (rnd() < .5 ? '255,190,215' : '255,255,255') });

    const BASE_TILT = 1.08, BASE_ROLL = -0.38, BASE_SPIN = 0.05;
    let rot = rnd() * 6.28, spin = BASE_SPIN, tilt = BASE_TILT, roll = BASE_ROLL;
    let ptX = 0, ptY = 0, tgX = 0, tgY = 0, dragTilt = 0, pulse = 0;
    let lastX = null, lastY = null, scrollY = window.pageYOffset || 0, lastScroll = scrollY, touched = false;
    const ripples = [], shoots = [], bursts = [];
    let nextShoot = 2.5;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      R = Math.max(W, H) * (coarse ? 0.56 : 0.5);
    };
    resize();
    addEventListener('resize', () => { resize(); if (reduceMotion) frame(0); });

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
      addEventListener('pointermove', e => move(e.clientX, e.clientY, e.pointerType), { passive: true });
      addEventListener('pointerdown', e => {
        lastX = e.clientX; lastY = e.clientY; tgX = (lastX / W) * 2 - 1; tgY = (lastY / H) * 2 - 1;
        if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,summary,iframe')) return;
        ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
        for (let i = 0; i < 12; i++) {
          const an = rnd() * 6.2832, sp = 60 + rnd() * 190;
          bursts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, t: 0, life: 0.7 + rnd() * 0.7, s: 3 + rnd() * 6, c: rnd() < .5 ? '255,226,190' : '255,170,205' });
        }
        pulse = 1; spin += (rnd() < .5 ? -1 : 1) * 0.9; interact();
      }, { passive: true });
      const end = e => { if (e.pointerType !== 'mouse') { lastX = lastY = null; tgX = tgY = 0; } };
      addEventListener('pointerup', end, { passive: true });
      addEventListener('pointercancel', end, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { lastX = lastY = null; tgX = tgY = 0; });
      addEventListener('scroll', () => { scrollY = window.pageYOffset || 0; }, { passive: true });
      document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) { prev = performance.now(); raf = requestAnimationFrame(loop); } });

      if (hint) {
        hint.textContent = '✦ ' + (coarse ? 'Desliza o toca para mover la galaxia' : 'Mueve el mouse para girar la galaxia');
        setTimeout(() => { if (!touched) hint.classList.add('show'); }, 1600);
        setTimeout(() => { hint.classList.remove('show'); hint.classList.add('gone'); }, 11000);
      }
    }

    const mul = (A, B) => [
      A[0]*B[0]+A[1]*B[3]+A[2]*B[6], A[0]*B[1]+A[1]*B[4]+A[2]*B[7], A[0]*B[2]+A[1]*B[5]+A[2]*B[8],
      A[3]*B[0]+A[4]*B[3]+A[5]*B[6], A[3]*B[1]+A[4]*B[4]+A[5]*B[7], A[3]*B[2]+A[4]*B[5]+A[5]*B[8],
      A[6]*B[0]+A[7]*B[3]+A[8]*B[6], A[6]*B[1]+A[7]*B[4]+A[8]*B[7], A[6]*B[2]+A[7]*B[5]+A[8]*B[8]];

    /* destello de 4 puntas */
    const star4 = (x, y, s) => {
      const k = s * 0.2;
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + k, y - k); ctx.lineTo(x + s, y); ctx.lineTo(x + k, y + k);
      ctx.lineTo(x, y + s); ctx.lineTo(x - k, y + k); ctx.lineTo(x - s, y); ctx.lineTo(x - k, y - k);
      ctx.closePath(); ctx.fill();
    };

    let t = 0;
    function frame(dt) {
      t += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

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
      const M = mul(mul([cr, -sr, 0, sr, cr, 0, 0, 0, 1], [1, 0, 0, 0, ct, -st, 0, st, ct]), [cz, -sz, 0, sz, cz, 0, 0, 0, 1]);
      const cx = W * (W < 900 ? 0.5 : 0.66) + ptX * 16;
      const cy = H * 0.47 - Math.min(scrollY * 0.1, 260) + ptY * 12;
      const pf = 0.22;

      for (let i = 0; i < bg.length; i++) {
        const s = bg[i], tw = 0.5 + 0.5 * Math.sin(t * s.f + s.p);
        ctx.fillStyle = 'rgba(' + s.c + ',' + (0.12 + tw * 0.5).toFixed(3) + ')';
        ctx.fillRect(s.x * W - ptX * 14 * s.d, s.y * H - ptY * 10 * s.d, s.s, s.s);
      }

      const boost = 1 + pulse * 0.6;
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const sx = M[0]*c.x + M[1]*c.y + M[2]*c.z, sy = M[3]*c.x + M[4]*c.y + M[5]*c.z, d = M[6]*c.x + M[7]*c.y + M[8]*c.z;
        const sc2 = 1 / (1 - d * pf), s2 = c.r * R * 2 * sc2;
        ctx.globalAlpha = Math.min(1, c.a * boost);
        ctx.drawImage(c.sp, cx + sx * R * sc2 - s2 / 2, cy + sy * R * sc2 - s2 / 2, s2, s2);
      }

      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 0.9) + pulse * 0.1;
      let lb = -1;
      const m0 = M[0], m1 = M[1], m2 = M[2], m3 = M[3], m4 = M[4], m5 = M[5], m6 = M[6], m7 = M[7], m8 = M[8];
      for (let i = 0; i < N; i++) {
        if (BK[i] !== lb) { lb = BK[i]; ctx.fillStyle = FILL[lb]; }
        const x = X0[i], y = Y0[i], z = Z0[i];
        const d = m6 * x + m7 * y + m8 * z, sc2 = 1 / (1 - d * pf), s = SZ[i] * sc2;
        ctx.fillRect(cx + (m0 * x + m1 * y + m2 * z) * R * sc2 - s / 2, cy + (m3 * x + m4 * y + m5 * z) * R * sc2 - s / 2, s, s);
      }

      const br = 1 + 0.05 * Math.sin(t * 1.3) + pulse * 0.25;
      ctx.globalAlpha = Math.min(1, 0.5 + pulse * 0.3);
      let w = R * 1.15 * br; ctx.drawImage(SPWIDE, cx - w / 2, cy - w / 2, w, w);
      ctx.globalAlpha = Math.min(1, 0.85 + pulse * 0.15);
      w = R * 0.26 * br; ctx.drawImage(SPCORE, cx - w / 2, cy - w / 2, w, w);

      /* ondas y destellos al tocar */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; r.t += dt;
        if (r.t > 1.1) { ripples.splice(i, 1); continue; }
        const p = r.t / 1.1, rad = 14 + p * 190;
        ctx.globalAlpha = (1 - p) * 0.8; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,180,210,1)';
        ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = (1 - p) * 0.35; ctx.strokeStyle = 'rgba(255,230,190,1)';
        ctx.beginPath(); ctx.arc(r.x, r.y, rad * 0.62, 0, 6.2832); ctx.stroke();
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]; b.t += dt;
        if (b.t > b.life) { bursts.splice(i, 1); continue; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.96; b.vy *= 0.96;
        const f = 1 - b.t / b.life;
        ctx.globalAlpha = f; ctx.fillStyle = 'rgba(' + b.c + ',1)';
        star4(b.x, b.y, b.s * (0.5 + f));
      }

      if (!reduceMotion) {
        nextShoot -= dt;
        if (nextShoot <= 0) {
          nextShoot = 4 + rnd() * 6;
          const dir = rnd() < .5 ? 1 : -1;
          shoots.push({ x: dir > 0 ? rnd() * W * 0.6 : W * 0.4 + rnd() * W * 0.6, y: rnd() * H * 0.45, vx: dir * (620 + rnd() * 380), vy: 260 + rnd() * 200, t: 0, life: 0.9 + rnd() * 0.5 });
        }
        for (let i = shoots.length - 1; i >= 0; i--) {
          const s = shoots[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
          if (s.t > s.life) { shoots.splice(i, 1); continue; }
          const f = 1 - s.t / s.life, len = 0.11, tx = s.x - s.vx * len, ty = s.y - s.vy * len;
          const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
          g.addColorStop(0, 'rgba(255,248,235,' + (0.95 * f) + ')'); g.addColorStop(0.3, 'rgba(255,175,205,' + (0.5 * f) + ')'); g.addColorStop(1, 'rgba(224,112,154,0)');
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    let raf = 0, prev = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      frame(dt);
      raf = document.hidden ? 0 : requestAnimationFrame(loop);
    }
    if (reduceMotion) frame(0); else raf = requestAnimationFrame(loop);
  })();
})();
