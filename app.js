/* Hermanos Ayala · interacción */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Vídeo de portada: fuente según pantalla */
  const hv = $('#hero-video');
  if (hv) {
    const w = innerWidth, h = innerHeight;
    let src = hv.dataset.srcDesk;
    if (w <= 700 && h > w) { src = hv.dataset.srcMob; hv.poster = hv.dataset.posterMob; }
    else if (w * devicePixelRatio <= 1400) src = hv.dataset.srcMid;
    hv.src = src;
    const btn = $('#hero-pausa');
    const setBtn = () => { const p = hv.paused; btn.classList.toggle('is-paused', p); btn.setAttribute('aria-label', p ? 'Reproducir el vídeo' : 'Pausar el vídeo'); };
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause(); }
    else hv.play().catch(() => {});
    hv.addEventListener('play', setBtn); hv.addEventListener('pause', setBtn); setBtn();
    btn.addEventListener('click', () => (hv.paused ? hv.play() : hv.pause()));
  }

  /* Barra: sólida al salir de la portada */
  const nav = $('#nav'), hero = $('.hero');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > hero.offsetHeight - 90);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menú: marca la sección en la que estás */
  const navLinks = $$('.menu-links a');
  const secciones = navLinks.map(a => $(a.getAttribute('href')));
  const marcarSeccion = () => {
    const y = innerHeight * .4;
    let act = -1;
    secciones.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) act = i; });
    navLinks.forEach((a, i) => (i === act ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  };
  addEventListener('scroll', marcarSeccion, { passive: true }); marcarSeccion();

  /* Menú */
  const menu = $('#menu'), bMenu = $('#btn-menu');
  const abrir = () => {
    menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open'));
    document.body.classList.add('menu-open'); bMenu.setAttribute('aria-expanded', 'true');
    bMenu.firstElementChild.textContent = 'Cerrar';
  };
  const cerrar = () => {
    menu.classList.remove('is-open'); document.body.classList.remove('menu-open');
    bMenu.setAttribute('aria-expanded', 'false'); bMenu.firstElementChild.textContent = 'Menú';
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500);
  };
  bMenu.addEventListener('click', () => (menu.classList.contains('is-open') ? cerrar() : abrir()));
  menu.addEventListener('click', e => { if (e.target === menu || e.target.closest('a')) cerrar(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) cerrar(); });

  /* Aparición suave al hacer scroll: todo el contenido entra de abajo arriba, una sola vez,
     escalonado entre hermanos. Las fotos grandes entran además con un leve zoom. */
  const ANIM = [
    '.intro-side p', '.intro .btn',
    '.marca-intro > *', '.marca-title', '.fam-list li', '.marca-card-wrap',
    '.float-card', '.desde-txt', '.desde-title', '.nave-title', '.stack-txt',
    '.prov-foto', '.prov-main > h2', '.acc-item', '.prov-foot',
    '.pasos-list h2', '.paso', '.folletos-head > *', '.horario-col', '.mapa',
    '.cta-title', '.cta-side', '.footer-col', '.footer-big', '.footer-ayudas', '.footer-bottom > *',
  ];
  $$(ANIM.join(',')).forEach(el => el.classList.add('reveal'));
  $$('.panel-foto-inner, .stack-card, .prov-foto, .mapa').forEach(el => el.classList.add('reveal-img'));
  // retardo según la posición entre hermanos animados
  $$('.reveal').forEach(el => {
    if (el.style.getPropertyValue('--d')) return;
    const hermanos = [...el.parentElement.children].filter(x => x.classList.contains('reveal'));
    el.style.setProperty('--d', Math.min(hermanos.indexOf(el) * 0.08, 0.48) + 's');
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-img').forEach(el => io.observe(el));
  // al final de la página lo último (pie) no puede subir más: se muestra todo lo pendiente
  const alFinal = () => {
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4)
      $$('.reveal:not(.is-in), .reveal-img:not(.is-in)').forEach(el => { el.classList.add('is-in'); io.unobserve(el); });
  };
  addEventListener('scroll', alFinal, { passive: true }); addEventListener('resize', alFinal);

  /* Marca Ayala: familias */
  const P = 'assets/img/productos/';
  const FAM = {
    aceites: { n: 'Aceites Alberto', d: 'Oliva virgen extra, virgen y refinado, en garrafas de 1, 2 y 5 litros. Girasol y semilla también en 10 y 25 litros', i: ['aceites-alberto'], wide: true },
    legumbres: { n: 'Legumbres', d: 'Toda una vida envasando garbanzos, lentejas y alubias, en paquetes de 500 gramos', i: ['legumbres-ayala'], wide: true },
    aceitunas: { n: 'Aceitunas', d: 'De producción propia: en salmuera, rellenas de anchoa o de pimiento, aliñadas, negras y en cóctel', i: ['aceitunas-ayala'], wide: true },
    despensa: { n: 'Despensa', d: 'Arroz, conservas de verdura y especias para el día a día de la cocina', i: ['arroz-ayala', 'champinones-ayala', 'tomillo-ayala'] },
    desayuno: { n: 'Desayuno y dulces', d: 'Cacao soluble, crema de cacao, mermeladas, chocolate y aperitivos', i: ['cacao-soluble-ayala', 'crema-cacao-ayala', 'mermelada-ayala'] },
    drogueria: { n: 'Droguería e higiene', d: 'Limpieza del hogar, papel, fregonas y cuidado personal con la misma marca', i: ['oxigeno-activo-ayala', 'lavavajillas-ayala', 'desodorante-ayala'] },
    mascotas: { n: 'Mascotas', d: 'Alimento para gatos en saco de 4 kilos', i: ['pienso-gato-ayala'] },
  };
  const keys = Object.keys(FAM);
  const tabs = $$('.fam-list button');
  const fName = $('#fam-name'), fImgs = $('#fam-imgs'), fDesc = $('#fam-desc');
  let cur = 0, timer = null, userTouched = false;
  const card = $('#marca-card');
  let swap = null;
  const pintar = f => {
    fName.textContent = f.n; fDesc.textContent = f.d;
    fImgs.classList.toggle('is-wide', !!f.wide);
    fImgs.innerHTML = f.i.map(n => `<img src="${P}${n}.webp" alt="${f.n} marca Ayala">`).join('');
  };
  const show = (k, inmediato) => {
    const f = FAM[k]; cur = keys.indexOf(k);
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.fam === k));
    const lista = tabs[0].closest('ul'), act = tabs[cur];
    if (lista.scrollWidth > lista.clientWidth) lista.scrollTo({ left: act.parentElement.offsetLeft - lista.clientWidth / 2 + act.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    clearTimeout(swap);
    if (inmediato || reduce) { pintar(f); return; }
    card.classList.add('is-out');
    swap = setTimeout(() => { pintar(f); requestAnimationFrame(() => card.classList.remove('is-out')); }, 320);
  };
  const next = () => show(keys[(cur + 1) % keys.length]);
  tabs.forEach(t => t.addEventListener('click', () => { userTouched = true; stop(); show(t.dataset.fam); }));
  $('#fam-next').addEventListener('click', () => { userTouched = true; stop(); next(); });
  $$('[data-fam-link]').forEach(a => a.addEventListener('click', () => { userTouched = true; stop(); show(a.dataset.famLink); }));
  const start = () => { if (!timer && !userTouched && !reduce) timer = setInterval(next, 4200); };
  const stop = () => { clearInterval(timer); timer = null; };
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: .35 }).observe($('#marca'));
  keys.forEach(k => FAM[k].i.forEach(n => { const im = new Image(); im.src = P + n + '.webp'; }));
  show('aceites', true);

  /* Contador 1960 con dígitos que ruedan */
  const odo = $('#odometro');
  $$('.odo-col', odo).forEach((c, i) => {
    const d = +c.dataset.d, vueltas = 10 * (1 + i) + d; // acaba siempre en el dígito d
    const col = document.createElement('i');
    col.innerHTML = Array.from({ length: vueltas + 1 }, (_, n) => `<span>${n % 10}</span>`).join('');
    col.dataset.to = vueltas; col.setAttribute('aria-hidden', 'true');
    col.style.transitionDelay = i * 0.12 + 's';
    c.appendChild(col);
  });
  const rodar = () => $$('.odo-col i', odo).forEach(col => (col.style.transform = `translateY(-${col.dataset.to}em)`));
  if (reduce) rodar();
  else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { rodar(); o.disconnect(); } }, { threshold: .5 }).observe(odo);

  /* Párrafos que se rellenan con el scroll: completos cuando su centro llega a media pantalla */
  // letra a letra; cada palabra va en su span para que no se parta al cambiar de línea
  const fills = $$('[data-fill]').map(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="wd">${[...w].map(ch => `<span class="c">${ch}</span>`).join('')}</span>`).join(' ');
    return { el, chars: $$('.c', el), n: -1 };
  });
  const fill = () => {
    const vh = innerHeight;
    fills.forEach(f => {
      const r = f.el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * .92 - r.top) / (vh * .42 + r.height * .5)));
      const n = Math.round(p * f.chars.length);
      if (n === f.n) return;
      f.n = n;
      f.chars.forEach((c, i) => c.classList.toggle('on', i < n));
    });
  };
  if (reduce) fills.forEach(f => f.chars.forEach(c => c.classList.add('on')));
  else { addEventListener('scroll', fill, { passive: true }); addEventListener('resize', fill); fill(); }

  /* Acordeón */
  $$('.acc-head').forEach(h => h.addEventListener('click', () => {
    const it = h.parentElement, open = !it.classList.contains('is-open');
    $$('.acc-item').forEach(x => { x.classList.remove('is-open'); $('.acc-head', x).setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
  }));

  /* Cómo llegar: paso activo según el scroll o al pulsar */
  const pasos = $$('.paso'), imgs = $$('.pasos-media > img, .pasos-media > video');
  const activar = i => {
    pasos.forEach((p, j) => { p.classList.toggle('is-active', j === i); p.classList.toggle('is-done', j < i); });
    imgs.forEach((im, j) => {
      im.classList.toggle('is-active', j === i);
      if (im.tagName === 'VIDEO') { if (j === i && !reduce) im.play().catch(() => {}); else im.pause(); }
    });
  };
  /* La sección se queda fija y el scroll recorre los cuatro pasos */
  const secPasos = $('#llegar');
  const bar = document.createElement('div');
  bar.className = 'pasos-bar'; bar.innerHTML = '<i></i>';
  $('.pasos-pin').appendChild(bar);
  let pasoAct = -1;
  const progreso = () => {
    const r = secPasos.getBoundingClientRect();
    const recorrido = secPasos.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / recorrido));
    bar.firstChild.style.transform = `scaleX(${p})`;
    const i = Math.min(pasos.length - 1, Math.floor(p * pasos.length * 0.999));
    if (i !== pasoAct) { pasoAct = i; activar(i); }
  };
  addEventListener('scroll', progreso, { passive: true }); addEventListener('resize', progreso); progreso();
  pasos.forEach((p, i) => p.addEventListener('click', () => {
    const recorrido = secPasos.offsetHeight - innerHeight;
    scrollTo({ top: secPasos.offsetTop + recorrido * (i + .5) / pasos.length, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* Folletos en un visor dentro de la página */
  const visor = $('#visor'), vPags = $('#visor-pags');
  const cerrarVisor = () => { visor.close(); };
  visor.addEventListener('close', () => { document.body.classList.remove('visor-abierto'); vPags.innerHTML = ''; });
  $$('[data-folleto]').forEach(a => a.addEventListener('click', e => {
    if (typeof visor.showModal !== 'function') return; // navegador antiguo: abre el PDF
    e.preventDefault();
    const c = a.dataset.folleto, n = +a.dataset.paginas;
    $('#visor-tit').textContent = a.dataset.titulo;
    $('#visor-pdf').href = a.getAttribute('href');
    vPags.innerHTML = Array.from({ length: n }, (_, i) =>
      `<img src="assets/folletos/${c}/p${String(i + 1).padStart(2, '0')}.webp" alt="Página ${i + 1} de ${n} del folleto ${a.dataset.titulo}" loading="${i < 2 ? 'eager' : 'lazy'}" width="1000" height="1631">`).join('');
    vPags.scrollTop = 0;
    document.body.classList.add('visor-abierto');
    visor.showModal();
  }));
  $('#visor-x').addEventListener('click', cerrarVisor);

  /* Horario: día de hoy y estado (hora de Madrid) */
  const H = { 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 14], 0: null };
  const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const ahora = () => {
    const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = k => t.find(x => x.type === k).value;
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), h: +g('hour') + +g('minute') / 60 };
  };
  const estado = () => {
    const { d, h } = ahora();
    $$('#horario tr').forEach(tr => tr.classList.toggle('hoy', +tr.dataset.dia === d));
    const hoy = H[d], el = $('#estado');
    if (hoy && h >= hoy[0] && h < hoy[1]) { el.innerHTML = `<b>Abierto ahora</b> · cerramos a las ${hoy[1]}:00`; return; }
    for (let k = 0; k < 8; k++) {
      const dd = (d + k) % 7, x = H[dd];
      if (!x || (k === 0 && h >= x[0])) continue;
      const cuando = k === 0 ? 'hoy' : k === 1 ? 'mañana' : `el ${nombres[dd]}`;
      el.innerHTML = `<b>Cerrado</b> · abrimos ${cuando} a las ${x[0]}:00`; return;
    }
  };
  estado(); setInterval(estado, 60000);

  /* Mapa bajo demanda */
  $('#mapa-btn').addEventListener('click', () => {
    $('#mapa').innerHTML = '<iframe title="Mapa de Hermanos Ayala en Utrera" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Hermanos%20Ayala%2C%20A-376%20km%2020%2C%20Utrera&ll=37.2219227,-5.8148213&z=15&output=embed"></iframe>';
  });

  /* Vídeo de cierre: solo cuando se ve */
  const cv = $('#cta-video');
  if (cv && !reduce) new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!cv.src) cv.src = innerWidth * devicePixelRatio > 1400 ? cv.dataset.srcDesk : cv.dataset.src;
      cv.play().catch(() => {});
    } else cv.pause();
  }, { threshold: .15 }).observe(cv);

  $('#year').textContent = new Date().getFullYear();
})();
