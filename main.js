/* ============================================================
   Arman Saeedi — portfolio motion layer (zero CDN)
   Progressive enhancement: content is fully visible with no JS.
   JS only enlists .anim (GSAP + no reduced motion) and animates.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';

  // JS is alive — flip the noscript hook.
  root.classList.remove('no-js');
  root.classList.add('js-on');

  /* ---------- Smooth scroll for nav (works without GSAP) ---------- */
  var lenis = null;
  var links = document.querySelectorAll('a[data-scroll]');
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Reduced motion (or no GSAP): stop here — everything stays visible.
  if (reducedMotion || !hasGsap) return;

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  // Enlist animation only now that GSAP is present.
  document.body.classList.add('anim');

  /* ---------- Lenis smooth scroll, hooked into the GSAP ticker ---------- */
  if (typeof window.Lenis !== 'undefined' && hasST) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Hero: line-mask reveal (SplitText chars, else line fallback) ---------- */
  var heroLines = document.querySelectorAll('.hero-title .line-inner');
  if (heroLines.length) {
    if (typeof window.SplitText !== 'undefined') {
      var heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.9 } });
      Array.prototype.forEach.call(heroLines, function (line, i) {
        var split = new SplitText(line, { type: 'chars' });
        heroTl.fromTo(split.chars,
          { yPercent: 120, rotate: 0.001 },
          { yPercent: 0, rotate: 0, stagger: 0.015 },
          0.12 * i
        );
      });
    } else {
      gsap.fromTo('.hero-title .line-inner',
        { yPercent: 120 },
        { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.14, delay: 0.05 });
    }
  }

  /* ---------- Scroll reveals: [data-reveal] ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (hasST) {
      Array.prototype.forEach.call(revealEls, function (el) {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
          });
      });
    } else {
      // No ScrollTrigger: one staggered fade on load.
      gsap.fromTo(revealEls,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
    }
  }

  /* ---------- Word scrub on section headings: [data-scrub] ---------- */
  if (hasST && typeof window.SplitText !== 'undefined') {
    var scrubHeads = document.querySelectorAll('[data-scrub]');
    Array.prototype.forEach.call(scrubHeads, function (head) {
      var split = new SplitText(head, { type: 'words' });
      gsap.fromTo(split.words,
        { opacity: 0.14, y: 8 },
        {
          opacity: 1, y: 0, stagger: 0.05, ease: 'none',
          scrollTrigger: { trigger: head, start: 'top 85%', end: 'top 40%', scrub: 0.6 }
        });
    });
  }

  /* ---------- Stats count-up: [data-count] ---------- */
  var countEls = document.querySelectorAll('[data-count]');
  Array.prototype.forEach.call(countEls, function (el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var state = { v: 0 };
    gsap.to(state, {
      v: target, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = Math.round(state.v) + suffix; }
    });
  });

  /* ---------- Magnetic hover (fine pointers only) ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    var magnetics = document.querySelectorAll('.magnetic');
    Array.prototype.forEach.call(magnetics, function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.18;
        gsap.to(el, { x: x, y: y, duration: 0.35, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------- Recompute after images settle ---------- */
  window.addEventListener('load', function () {
    if (hasST) ScrollTrigger.refresh();
  });
})();