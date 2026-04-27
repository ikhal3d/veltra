/* Veltra — interactive behaviors */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Header scroll state ------------------------------------- */
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -- Mobile nav --------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.hidden = !open;
    };
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });
  }

  /* -- Reveal-on-scroll --------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* -- Stat counters ------------------------------------------ */
  const counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const v = Math.round(target * ease(p));
          el.textContent = v + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cIO.observe(el));
  } else {
    counters.forEach(el => {
      el.textContent = (el.dataset.target || '') + (el.dataset.suffix || '');
    });
  }

  /* -- Card tilt (parallax) ----------------------------------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    const tilts = document.querySelectorAll('[data-tilt]');
    tilts.forEach(card => {
      let raf = null;
      const inner = card.querySelector('.project-photo, .card-photo');
      if (!inner) return;

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 8;
        const ry = (x - 0.5) * 10;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          inner.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        inner.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* -- Year ----------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();
