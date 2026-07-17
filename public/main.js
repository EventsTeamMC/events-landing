/* Events Client landing — tiny progressive enhancements, no dependencies. */
(function () {
  var DISCORD = 'https://discord.gg/2T7DDmpxYr';
  // Cuando el cliente esté listo: publica una release y sustituye los
  // <span class="btn btn-soon"> de index.html por enlaces a esta URL.
  var RELEASES = 'https://github.com/EventsTeamMC/events-client-releases/releases/latest';
  void RELEASES;

  // Year in the footer.
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Discord links.
  ['foot-discord', 'cta-discord'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = DISCORD;
  });

  // Downloads aren't live yet — we only name the visitor's OS in the copy.
  var ua = navigator.userAgent;
  var os = /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? 'Linux' : 'Windows';
  var osEl = document.getElementById('dl-os');
  if (osEl) osEl.textContent = os;

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
