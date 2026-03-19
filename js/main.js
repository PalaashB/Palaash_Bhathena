/* ================================================
   Main JS — The Semantic Explorer
   ================================================
   Entry point. Module scripts will be added per commit.
   ================================================ */

'use strict';

/**
 * DOM Ready wrapper
 */
function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReady(() => {
  console.log(
    '%c✦ The Semantic Explorer — Portfolio Loaded',
    'color: #00f0ff; font-size: 14px; font-weight: bold;'
  );

  initNavigation();
  initTypingAnimation();
});

/* ================================================
   Navigation
   ================================================ */
function initNavigation() {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav__link');

  if (!header || !hamburger || !navLinks) return;

  /* ── Hamburger Toggle ─────────────────────────── */
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close mobile menu when a link is clicked */
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ── Scroll: Show/Hide Header ─────────────────── */
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const currentY = window.scrollY;

    if (currentY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (currentY > lastScrollY && currentY > 200) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* ── Active Section Tracking ──────────────────── */
  const sections = document.querySelectorAll('section[id]');

  if (sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(link => {
              link.classList.toggle(
                'active',
                link.getAttribute('data-section') === id
              );
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }
}

/* ================================================
   Terminal Typing Animation
   ================================================ */
function initTypingAnimation() {
  const textEl = document.getElementById('typing-text');
  const cursorEl = document.getElementById('typing-cursor');

  if (!textEl) return;

  const phrases = [
    'AI/ML Researcher',
    'Undergraduate Course Assistant',
    'Full-Stack Developer',
    'Computer Vision Engineer',
    'Semantic Search Builder'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const TYPING_SPEED = 80;
  const DELETING_SPEED = 40;
  const PAUSE_END = 2000;
  const PAUSE_START = 400;

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      textEl.textContent = current.substring(0, charIndex);

      if (charIndex === current.length) {
        // Finished typing — pause, then start deleting
        isDeleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPING_SPEED + Math.random() * 40);
    } else {
      // Deleting
      charIndex--;
      textEl.textContent = current.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETING_SPEED);
    }
  }

  // Start after a short delay for entrance animation
  setTimeout(tick, 1200);
}
