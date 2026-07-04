/**
 * NEON RAY — ambient light-field scroll engine.
 *
 * Translates the two blurred background orbs with the page scroll using a
 * critically-damped lerp (GSAP-style power3.out feel) inside a single
 * requestAnimationFrame loop fed by a passive scroll listener. Also owns the
 * IntersectionObserver that lights up [data-volt-reveal] panels as they enter
 * the viewport.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- orb parallax --------------------------------------------------- */

  var orbs = Array.prototype.slice
    .call(document.querySelectorAll('[data-nr-orb]'))
    .map(function (el) {
      return {
        el: el,
        depth: parseFloat(el.getAttribute('data-nr-depth')) || 0.4,
        y: 0
      };
    });

  if (orbs.length && !reduceMotion.matches) {
    var target = window.scrollY || 0;
    var ticking = false;

    var frame = function () {
      var settled = true;

      orbs.forEach(function (orb) {
        var goal = target * orb.depth;
        orb.y += (goal - orb.y) * 0.08; // smoothing factor ≈ power3.out tail
        if (Math.abs(goal - orb.y) > 0.1) settled = false;
        orb.el.style.transform = 'translate3d(0,' + orb.y.toFixed(2) + 'px,0)';
      });

      if (settled) {
        ticking = false;
      } else {
        requestAnimationFrame(frame);
      }
    };

    window.addEventListener(
      'scroll',
      function () {
        target = window.scrollY || 0;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(frame);
        }
      },
      { passive: true }
    );

    requestAnimationFrame(frame);
  }

  /* ---- scroll-reveal --------------------------------------------------- */

  var panels = document.querySelectorAll('[data-volt-reveal]');

  if (!panels.length) return;

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    panels.forEach(function (el) { el.classList.add('is-lit'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-lit');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
  );

  panels.forEach(function (el) { observer.observe(el); });
})();
