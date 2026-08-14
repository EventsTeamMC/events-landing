/* Events Client landing — tiny progressive enhancements, no dependencies. */
(function () {
  var DISCORD = 'https://discord.gg/2T7DDmpxYr';
  // Descargas en mantenimiento: no exponemos URLs de descarga reales.
  var DOWNLOADS = {
    windows: { label: 'Windows' },
    mac: { label: 'macOS' },
    linux: { label: 'Linux' },
  };

  // Year in the footer.
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Discord links.
  ['foot-discord', 'cta-discord'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = DISCORD;
  });

  // Detect the visitor's OS.
  var ua = navigator.userAgent;
  var osKey = /Macintosh|Mac OS X/i.test(ua) ? 'mac' : (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) ? 'linux' : 'windows';
  var dl = DOWNLOADS[osKey];

  // Home page copy: name the visitor's OS.
  var osEl = document.getElementById('dl-os');
  if (osEl) osEl.textContent = dl.label;

  // Download page: highlight the matching card.
  // Descargas en mantenimiento: no tocamos el botón, se queda deshabilitado.
  var detected = document.getElementById('dl-detected');
  if (detected) detected.textContent = 'Detectado: ' + dl.label;
  var card = document.querySelector('.dl-card[data-os="' + osKey + '"]');
  if (card) card.classList.add('detected');

  /* ---------------- Contador de descargas ----------------
     El total = descargas históricas de GitHub (base) + las que contamos aquí.
     Contamos nosotros, y no leemos el contador de GitHub en vivo, porque GitHub
     suma CADA petición: no sabe distinguir a alguien que descarga tres veces
     seguidas. El backend aplica una espera de 1 h por usuario.
     Los enlaces siguen apuntando directos a GitHub: si nuestra API está caída, la
     descarga funciona igual y lo único que se pierde es el recuento. */
  var COUNTER_API = 'https://api.eventsmc.xyz/api';
  var counterEls = document.querySelectorAll('[data-dl-count]');

  function renderCount(n) {
    if (!counterEls.length || typeof n !== 'number') return;
    counterEls.forEach(function (el) {
      var from = parseInt(String(el.textContent).replace(/\D/g, ''), 10);
      if (!isFinite(from) || !from) { el.textContent = n.toLocaleString('es-ES'); return; }
      if (from === n) return;
      // Cuenta hacia el nuevo valor para que se vea que sube.
      var start = performance.now(), dur = 700;
      (function step(t) {
        var k = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (n - from) * eased).toLocaleString('es-ES');
        if (k < 1) requestAnimationFrame(step);
      })(start);
    });
  }

  function refreshCount() {
    if (!counterEls.length) return;
    fetch(COUNTER_API + '/downloads', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.data) renderCount(j.data.total); })
      .catch(function () { /* contador caído: la página sigue funcionando */ });
  }

  if (counterEls.length) {
    refreshCount();
    setInterval(refreshCount, 20000);                       // "en directo"
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) refreshCount();
    });
  }

  // Id anónimo y estable para aplicar la espera de 1 h. No identifica a nadie: es
  // un número aleatorio que solo vive en este navegador. Hace falta porque el
  // servidor está detrás de Cloudflare y ve una IP de borde distinta en cada
  // petición, así que por IP no se puede distinguir a un usuario de otro.
  function clientId() {
    try {
      var k = 'ec_dl_id', v = localStorage.getItem(k);
      if (!v) {
        v = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
        localStorage.setItem(k, v);
      }
      return v;
    } catch (_) { return ''; }   // navegación privada: contará por IP
  }

  // Al pulsar cualquier botón de descarga, registra el hit y enseña tu número.
  // (En mantenimiento no hay enlaces de descarga reales, así que esto no encuentra nada.)
  document.querySelectorAll('a.dl-main:not(.disabled)').forEach(function (a) {
    a.addEventListener('click', function () {
      fetch(COUNTER_API + '/downloads/hit', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: clientId() }),
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.data) return;
          renderCount(j.data.total);
          // Solo damos las gracias si de verdad ha sumado; si estás en la espera
          // de 1 h no fingimos que ha contado.
          if (j.data.counted) {
            document.querySelectorAll('[data-dl-thanks]').forEach(function (el) { el.hidden = false; });
          }
        })
        .catch(function () {});
    });
  });

  /* ---------------- Motion helpers ----------------
     A spring, not a duration. It always starts from the value the element is
     showing right now and from whatever velocity it already had, which is what
     makes it safe to interrupt: grabbing something mid-flight just re-targets
     the same spring instead of cutting to a new animation.
     Parameters are Apple's two: damping ratio (overshoot) and response (how
     quickly it gets there) — not mass/stiffness/damping. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function springTo(opts) {
    var wn = 2 * Math.PI / opts.response;
    var z = opts.damping;
    var x = opts.from, v = opts.velocity || 0, target = opts.to;
    var last = performance.now(), raf = 0, done = false;

    // Reduced motion: land on the target, skip the travel. Completion is
    // deferred by a tick so the caller has its cancel handle before onDone
    // clears it.
    if (reduceMotion.matches) {
      opts.onFrame(target);
      var tick = setTimeout(function () { if (opts.onDone) opts.onDone(); }, 0);
      return function () { clearTimeout(tick); return { value: target, velocity: 0 }; };
    }

    raf = requestAnimationFrame(function step(now) {
      var dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      // Fixed sub-steps: a long frame must not blow the integrator up.
      var n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
      for (var i = 0; i < n; i++) {
        var a = -wn * wn * (x - target) - 2 * z * wn * v;
        v += a * h;
        x += v * h;
      }
      opts.onFrame(x);
      if (Math.abs(x - target) < 0.25 && Math.abs(v) < 15) {
        opts.onFrame(target);
        done = true;
        if (opts.onDone) opts.onDone();
        return;
      }
      raf = requestAnimationFrame(step);
    });

    return function cancel() {
      if (!done) cancelAnimationFrame(raf);
      return { value: x, velocity: v };
    };
  }

  /* Where a flick is going, not where the finger left off. This is the same
     exponential decay a scroll view uses — the textbook v²/2a is not it. */
  function project(velocity, decelerationRate) {
    var d = decelerationRate || 0.998;
    return (velocity / 1000) * d / (1 - d);
  }

  /* Past a boundary the surface resists more the further you push, instead of
     stopping dead. A hard stop reads as frozen; this reads as "nothing here". */
  function rubberband(overshoot, dimension, constant) {
    var c = constant || 0.55;
    return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
  }

  // Sticky nav: the scroll edge appears only once content passes under it.
  var nav = document.getElementById('nav');
  var stuck = null;
  var onScroll = function () {
    var s = window.scrollY > 8;
    if (s !== stuck) { stuck = s; nav.classList.toggle('stuck', s); }
  };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile menu ----------------
     A sheet you can throw away, not a dropdown that only obeys its button. It
     tracks the finger 1:1 while you drag, resists past its own edge, and on
     release it carries your velocity into the spring that finishes the motion —
     so there is no seam between dragging and animating. Grabbing it again mid
     flight picks it up from where it is, at the speed it is going. */
  var burger = document.getElementById('burger');
  var sheet = nav.querySelector('.nav-links');
  var scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  nav.appendChild(scrim);

  var cancelSpring = null;   // running spring, if any
  var open = false;

  function setSheet(y, scale) {
    nav.style.setProperty('--sheet-y', y + 'px');
    if (scale != null) nav.style.setProperty('--sheet-s', scale);
  }
  function clearSheet() {
    nav.style.removeProperty('--sheet-y');
    nav.style.removeProperty('--sheet-s');
    nav.style.removeProperty('--sheet-o');
    nav.classList.remove('dragging');
  }
  function setOpen(next) {
    if (next === open) return;
    open = next;
    if (cancelSpring) { cancelSpring(); cancelSpring = null; }
    clearSheet();
    nav.classList.toggle('open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'nav-links');
    if (sheet) sheet.id = sheet.id || 'nav-links';
    burger.addEventListener('click', function () { setOpen(!open); });
  }
  scrim.addEventListener('click', function () { setOpen(false); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { setOpen(false); if (burger) burger.focus(); }
  });

  if (sheet && window.PointerEvent) {
    var drag = null;

    sheet.addEventListener('pointerdown', function (e) {
      if (!open || e.button !== 0) return;
      // Start from what is on screen right now, not from the logical value: if a
      // spring or the opening transition is still running, that is where the
      // sheet actually is, and starting anywhere else would visibly jump.
      // `transform:none` is not a matrix string — reduced-motion users get it,
      // and not every engine parses it as the identity.
      var raw = getComputedStyle(sheet).transform;
      var live = { f: 0, a: 1 };
      if (raw && raw !== 'none') { try { live = new DOMMatrixReadOnly(raw); } catch (_) {} }
      var carried = 0;
      if (cancelSpring) { carried = cancelSpring().velocity; cancelSpring = null; }
      nav.classList.add('dragging');
      setSheet(live.f, live.a || 1);
      // Capture keeps the sheet tracking even once the finger leaves its bounds.
      try { sheet.setPointerCapture(e.pointerId); } catch (_) {}
      drag = {
        id: e.pointerId, startY: e.clientY, y: live.f, scale: live.a || 1,
        moved: false, carried: carried,
        // A short history, not just the last point: velocity at release comes
        // from the movement over the last few frames.
        hist: [{ t: performance.now(), y: e.clientY }],
      };
    });

    sheet.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dy) < 10) return;   // hysteresis: a tap is not a drag
      drag.moved = true;
      var h = sheet.offsetHeight;
      // Upwards it follows the finger exactly. Downwards there is nothing to
      // reveal, so it resists instead of tearing away from the nav.
      drag.y = dy < 0 ? dy : rubberband(dy, h);
      drag.scale = 1;
      setSheet(drag.y, 1);
      nav.style.setProperty('--sheet-o', String(Math.max(0, 1 + drag.y / h * 1.1)));
      drag.hist.push({ t: performance.now(), y: e.clientY });
      if (drag.hist.length > 6) drag.hist.shift();
    });

    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.moved) { clearSheet(); return; }

      // Velocity over the recent history, blended with whatever the sheet was
      // already carrying when it was grabbed — replacing one for the other at a
      // reversal is what makes a gesture hit a brick wall.
      var first = d.hist[0], lastP = d.hist[d.hist.length - 1];
      var dt = Math.max(16, lastP.t - first.t);
      var velocity = (lastP.y - first.y) / dt * 1000;
      if (d.carried && Math.sign(d.carried) === Math.sign(velocity)) velocity += d.carried * 0.5;

      var h = sheet.offsetHeight;
      var landing = d.y + project(velocity);          // where the flick is headed
      var closing = landing < -h * 0.32;
      var to = closing ? -(h + 24) : 0;

      cancelSpring = springTo({
        from: d.y, to: to, velocity: velocity,
        // Bounce only because a gesture put the momentum there. A sheet that
        // merely appeared would land flat, at damping 1.
        damping: closing ? 1 : 0.8, response: 0.3,
        onFrame: function (y) {
          setSheet(y, 1);
          nav.style.setProperty('--sheet-o', String(Math.max(0, Math.min(1, 1 + y / h * 1.1))));
        },
        onDone: function () {
          cancelSpring = null;
          if (closing) { open = false; nav.classList.remove('open');
            if (burger) burger.setAttribute('aria-expanded', 'false'); }
          clearSheet();
        },
      });
    }
    sheet.addEventListener('pointerup', endDrag);
    sheet.addEventListener('pointercancel', endDrag);
    // A drag that ends on a link must not also follow it.
    sheet.addEventListener('click', function (e) {
      if (nav.classList.contains('dragging')) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------------- Pointer spotlight ----------------
     Cards answer the pointer the whole time it is over them, not only when it
     arrives and leaves. Position is written straight to the element as a custom
     property, so the highlight is glued to the cursor. */
  var spotSel = '.product, .feat, .step, .priv, .cmd-card, .dl-card, .cl-step, .cl-panel, .card';
  if (matchMedia('(hover:hover)').matches && !reduceMotion.matches) {
    document.querySelectorAll(spotSel).forEach(function (el) {
      el.setAttribute('data-spot', '');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      el.addEventListener('pointerenter', function () { el.classList.add('spot-on'); });
      el.addEventListener('pointerleave', function () { el.classList.remove('spot-on'); });
    });
  }

  // Envía el texto de un formulario de sugerencia a /api/suggest y actualiza su
  // propio estado (deshabilita el botón mientras envía, muestra éxito/error).
  function wireSuggestForm(form) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var textarea = form.querySelector('textarea[name="message"]');
      var honeypot = form.querySelector('input[name="website"]');
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector('.suggest-status');
      var message = textarea ? textarea.value.trim() : '';

      if (message.length < 3) {
        if (status) { status.textContent = 'Escribe un poco más antes de enviar.'; status.className = 'suggest-status err'; }
        return;
      }

      if (button) button.disabled = true;
      if (status) { status.textContent = 'Enviando…'; status.className = 'suggest-status'; }

      fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, website: honeypot ? honeypot.value : '' }),
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            if (status) { status.textContent = '¡Gracias! La sugerencia se ha enviado.'; status.className = 'suggest-status ok'; }
            form.reset();
            setTimeout(function () {
              if (status) status.textContent = '';
            }, 2500);
          } else {
            if (status) { status.textContent = (result.data && result.data.error) || 'No se pudo enviar. Inténtalo de nuevo.'; status.className = 'suggest-status err'; }
          }
        })
        .catch(function () {
          if (status) { status.textContent = 'No se pudo enviar. Revisa tu conexión.'; status.className = 'suggest-status err'; }
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  }

  wireSuggestForm(document.getElementById('suggest-card-form'));

  /* ---------------- Reveal on scroll ----------------
     Whatever is already on screen when the page loads is never hidden: making
     someone wait for an animation before they can read what they came for is
     latency dressed up as design. Everything else arrives as you reach it, in
     the order it reads, and then gives up its classes — a card that has landed
     should not keep a 0.59s transition it will only ever fight with. */
  var candidates = document.querySelectorAll(
    '.section > .h2, .section > .sub, .products-head, .product, .card, .feat, .step, .cta,' +
    '.shot-row figure, .panel-shot, .checks, .priv, .cmd-card');
  var targets = [];
  var groups = new Map();

  candidates.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;   // already visible
    var n = groups.get(el.parentNode) || 0;
    groups.set(el.parentNode, n + 1);
    el.style.setProperty('--i', Math.min(n, 4));   // short stagger, capped
    el.classList.add('reveal');
    targets.push(el);
  });

  function land(el) {
    el.classList.add('in');
    // 55ms of stagger on top of the spring's own settle time.
    setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--i'); }, 900);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { land(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(land);
  }
})();
