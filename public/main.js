/* Events Client landing — tiny progressive enhancements, no dependencies. */
(function () {
  var DISCORD = 'https://discord.gg/2T7DDmpxYr';
  // Stable "latest" download URLs — GitHub always serves the newest release's
  // asset from this path, so the landing never needs updating per version.
  var DL_BASE = 'https://github.com/EventsTeamMC/events-client-releases/releases/latest/download/';
  var DOWNLOADS = {
    windows: { file: 'Events-Client-win.exe', label: 'Windows' },
    mac: { file: 'Events-Client-mac-universal.dmg', label: 'macOS' },
    linux: { file: 'Events-Client-linux-x86_64.AppImage', label: 'Linux' },
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

  // Download page: highlight the matching card, wire the hero button.
  var primary = document.getElementById('dl-primary');
  if (primary) {
    primary.href = DL_BASE + dl.file;
    primary.textContent = 'Descargar para ' + dl.label;
  }
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
  document.querySelectorAll('a[href*="events-client-releases/releases"]').forEach(function (a) {
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

  // Sticky nav border once scrolled.
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });

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

  // Reveal sections as they enter the viewport.
  var targets = document.querySelectorAll('.section > .h2, .section > .sub, .products-head, .product, .card, .feat, .step, .cta, .shot-row figure, .panel-shot, .checks, .priv, .cmd-card');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
})();
