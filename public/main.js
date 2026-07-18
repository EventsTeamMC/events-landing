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

  // Reveal sections as they enter the viewport.
  var targets = document.querySelectorAll('.section > .h2, .section > .sub, .card, .feat, .step, .cta, .shot-row figure, .panel-shot, .checks');
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
