/* =========================================================
   بافیرا | BAFIRA — interactions
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Persian digits ---- */
  var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  function toFa(value) {
    return String(value).replace(/\d/g, function (d) { return FA[+d]; });
  }

  /* ---- Sticky header + scroll progress + back to top ---- */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('is-stuck', y > 12);
    toTop.classList.toggle('is-visible', y > 600);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var scrim = document.getElementById('scrim');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    scrim.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  scrim.addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---- Reveal on scroll ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = toFa(target) + suffix; return; }

    var duration = 1400;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = toFa(Math.round(target * eased)) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---- Active nav link ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50%' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---- FAQ: keep one open at a time ---- */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---- Contact form (demo only, no network request) ---- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();

    if (!name || !phone) {
      status.textContent = 'لطفاً نام و شماره تماس را کامل کنید.';
      status.style.background = 'var(--brand-100)';
      status.style.color = 'var(--brand-600)';
      status.classList.add('is-visible');
      return;
    }

    status.textContent = name + ' عزیز، درخواست شما ثبت شد. کارشناسان بافیرا به‌زودی تماس می‌گیرند.';
    status.style.background = 'var(--forest-100)';
    status.style.color = 'var(--forest)';
    status.classList.add('is-visible');
    form.reset();
  });

  /* ---- Persian year in footer ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    try {
      yearEl.textContent = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' })
        .format(new Date()).replace(/[^۰-۹\d]/g, '');
    } catch (err) { /* keep the static fallback */ }
  }
})();
