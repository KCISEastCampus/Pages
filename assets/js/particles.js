function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    container.innerHTML = '';
    return;
  }

  const colors = ['#009fa8', '#920783', '#CBBE00'];
  const particles = [];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let rafId = null;
  let isPaused = false;
  let lastTime = performance.now();

  function getParticleCount() {
    return Math.max(12, Math.min(36, Math.floor(width / 55)));
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1.5;
      this.speedX = (Math.random() - 0.5) * 0.035;
      this.speedY = (Math.random() - 0.5) * 0.035;
      this.baseOpacity = Math.random() * 0.28 + 0.18;
      this.phase = Math.random() * Math.PI * 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.element = document.createElement('div');

      this.element.style.cssText = `
        position: fixed;
        width: ${this.size * 2}px;
        height: ${this.size * 2}px;
        background: radial-gradient(circle, ${this.color}, transparent);
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${this.size * 3}px ${this.color};
        opacity: ${this.baseOpacity};
        z-index: 0;
        transform: translate3d(${this.x}px, ${this.y}px, 0);
        will-change: transform, opacity;
      `;

      container.appendChild(this.element);
    }

    update(delta, now) {
      this.x += this.speedX * delta;
      this.y += this.speedY * delta;

      if (this.x > width + 12) this.x = -12;
      if (this.x < -12) this.x = width + 12;
      if (this.y > height + 12) this.y = -12;
      if (this.y < -12) this.y = height + 12;

      const pulse = Math.sin(now * 0.0012 + this.phase) * 0.5 + 0.5;
      const opacity = this.baseOpacity * (0.65 + pulse * 0.35);

      this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
      this.element.style.opacity = String(opacity);
    }
  }

  function buildParticles() {
    container.innerHTML = '';
    particles.length = 0;
    for (let index = 0; index < getParticleCount(); index += 1) {
      particles.push(new Particle());
    }
  }

  function animate(now) {
    if (isPaused) return;
    const delta = Math.min(34, now - lastTime);
    lastTime = now;

    for (let index = 0; index < particles.length; index += 1) {
      particles[index].update(delta, now);
    }

    rafId = requestAnimationFrame(animate);
  }

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    buildParticles();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      isPaused = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }

    isPaused = false;
    lastTime = performance.now();
    rafId = requestAnimationFrame(animate);
  }

  buildParticles();
  lastTime = performance.now();
  rafId = requestAnimationFrame(animate);
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function initRevealAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.button-link, .featured-card, .page-content table tbody tr, .hero-quick-link');

  if (reduceMotion) {
    revealTargets.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-up');
    element.style.setProperty('--reveal-delay', `${Math.min(index, 12) * 35}ms`);
    observer.observe(element);
  });
}

function initFeaturedCardPointerEffect() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  const cards = Array.from(document.querySelectorAll('.featured-card'));
  if (cards.length === 0) return;

  cards.forEach((card) => {
    let frameId = null;

    const onMove = (event) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        const rotateY = Math.max(-2.4, Math.min(2.4, offsetX * 0.015));
        const rotateX = Math.max(-2.4, Math.min(2.4, -offsetY * 0.015));
        card.style.setProperty('--card-rx', `${rotateX}deg`);
        card.style.setProperty('--card-ry', `${rotateY}deg`);
      });
    };

    const onLeave = () => {
      if (frameId) cancelAnimationFrame(frameId);
      card.style.removeProperty('--card-rx');
      card.style.removeProperty('--card-ry');
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('blur', onLeave);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.style.scrollBehavior = 'smooth';
  initRevealAnimations();
  initFeaturedCardPointerEffect();
});
