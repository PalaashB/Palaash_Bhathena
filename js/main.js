/* Main site interactions */

'use strict';

/* Run once DOM is ready */
function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

onReady(() => {
  console.log(
    '%c✦ The Semantic Explorer — Portfolio Loaded',
    'color: #00f0ff; font-size: 14px; font-weight: bold;'
  );

  initNavigation();
  initTypingAnimation();
  initNeuralCanvas();
  initScrollAnimations();
  initProjectInteractivity();
});

/* Navigation */
function initNavigation() {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav__link');

  if (!header || !hamburger || !navLinks) return;

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu after selecting a link
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Hide header while scrolling down, show when scrolling up
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const currentY = window.scrollY;
    header.classList.toggle('scrolled', currentY > 80);
    if (currentY > lastScrollY && currentY > 200) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  // Keep nav link in sync with visible section
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(link => {
              link.classList.toggle('active', link.getAttribute('data-section') === id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(s => observer.observe(s));
  }
}

/* Typing effect in hero terminal */
function initTypingAnimation() {
  const textEl = document.getElementById('typing-text');
  if (!textEl) return;

  const phrases = [
    'AI/ML Researcher',
    'Undergraduate Course Assistant',
    'Full-Stack Developer',
    'Computer Vision Engineer',
    'Semantic Search Builder'
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;
  const TYPE_SPEED = 80, DEL_SPEED = 40, PAUSE_END = 2000, PAUSE_START = 400;

  function tick() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      textEl.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPE_SPEED + Math.random() * 40);
    } else {
      charIdx--;
      textEl.textContent = current.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DEL_SPEED);
    }
  }

  setTimeout(tick, 1200);
}

/* Background particle canvas */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  let mouse = { x: -9999, y: -9999 };
  let particles = [];
  const PARTICLE_COUNT = 90;
  const CONNECT_DIST = 150;
  const MOUSE_RADIUS = 200;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      });
    }
  }

  function drawParticle(p) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nearMouse = dist < MOUSE_RADIUS;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    if (nearMouse) {
      const alpha = 1 - dist / MOUSE_RADIUS;
      ctx.fillStyle = `rgba(0, 240, 255, ${0.4 + alpha * 0.6})`;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          // Highlight lines near the cursor
          const d1 = Math.sqrt(
            (particles[i].x - mouse.x) ** 2 + (particles[i].y - mouse.y) ** 2
          );
          const d2 = Math.sqrt(
            (particles[j].x - mouse.x) ** 2 + (particles[j].y - mouse.y) ** 2
          );
          const nearMouse = d1 < MOUSE_RADIUS || d2 < MOUSE_RADIUS;

          const alpha = (1 - dist / CONNECT_DIST) * (nearMouse ? 0.5 : 0.08);

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          if (nearMouse) {
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2;
          } else {
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }
    }
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    update();
    drawConnections();
    particles.forEach(drawParticle);
    requestAnimationFrame(animate);
  }

  // Input listeners
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Start animation
  resize();
  createParticles();
  animate();
}

/* Reveal animations on scroll */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (animatedEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  animatedEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
    observer.observe(el);
  });
}

/* Project cards and modal */
function initProjectInteractivity() {
  const cards = document.querySelectorAll('.bento__card');
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');
  const backdrop = modal ? modal.querySelector('.modal__backdrop') : null;

  if (!modal || !modalBody) return;

  // Card click behavior
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Let CTA links behave normally
      if (e.target.closest('.bento__overlay-btn')) return;

      // Use modal on smaller screens
      if (window.innerWidth <= 768) {
        const overlay = card.querySelector('.bento__overlay');
        if (overlay) {
          modalBody.innerHTML = overlay.innerHTML;
          openModal();
        }
      } else {
        // Desktop/touch fallback: toggle active card
        cards.forEach(c => { if (c !== card) c.classList.remove('active'); });
        card.classList.toggle('active');
      }
    });
  });

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}
