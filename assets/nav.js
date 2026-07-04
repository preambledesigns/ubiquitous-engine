/* Preamble Design — mobile navigation (hamburger + full-screen overlay)
   Desktop is untouched: the burger and overlay only appear under the phone
   breakpoint via CSS. This script only builds the markup + wires behaviour. */
(function () {
  function build() {
    var header = document.querySelector('header.nav');
    if (!header || header.querySelector('.nav-burger')) return;
    var wrap = header.querySelector('.wrap');
    if (!wrap) return;

    // ---- burger button ----
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span>';
    wrap.appendChild(burger);

    // ---- links (derived from the desktop nav so labels stay in one place) ----
    var links = [];
    header.querySelectorAll('nav.menu a').forEach(function (a) {
      links.push({ href: a.getAttribute('href'), label: a.textContent.trim(), active: a.classList.contains('active') });
    });
    var cta = header.querySelector('.nav-cta');
    var here = (location.pathname.split('/').pop() || 'index.html');

    // ---- overlay ----
    var ov = document.createElement('div');
    ov.className = 'nav-overlay';
    ov.setAttribute('aria-hidden', 'true');
    var inner = '<div class="nav-overlay-in"><nav class="nav-overlay-links">';
    links.forEach(function (l) {
      var on = l.active || l.href === here;
      inner += '<a href="' + l.href + '"' + (on ? ' class="on"' : '') + '>' + l.label + '</a>';
    });
    inner += '</nav>';
    if (cta) {
      inner += '<a class="nav-overlay-cta" href="' + cta.getAttribute('href') + '">' + cta.textContent.trim() + '</a>';
    }
    inner += '</div>';
    ov.innerHTML = inner;
    document.body.appendChild(ov);

    function open() {
      ov.classList.add('open');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      ov.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      ov.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      ov.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', function () {
      ov.classList.contains('open') ? close() : open();
    });
    ov.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target === ov) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    // Safety: if resized up to desktop, ensure overlay is closed and scroll restored
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && ov.classList.contains('open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
