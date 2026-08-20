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

  // Adaptive particle count — fewer on mobile to reduce GPU pressure
  function getParticleCount() {
    const base = width < 600 ? 18 : width < 1000 ? 24 : 36;
    return Math.max(10, Math.min(base, Math.floor(width / 55)));
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

      // Create element once, set static styles via class or initial CSS
      const el = document.createElement('div');
      el.style.cssText =
        'position:fixed;border-radius:50%;pointer-events:none;z-index:0;' +
        'width:' + (this.size * 2) + 'px;height:' + (this.size * 2) + 'px;' +
        'background:radial-gradient(circle,' + this.color + ',transparent);' +
        'box-shadow:0 0 ' + (this.size * 3) + 'px ' + this.color + ';' +
        'will-change:transform,opacity;';

      this.element = el;
      container.appendChild(el);
    }

    update(delta, now) {
      this.x += this.speedX * delta;
      this.y += this.speedY * delta;

      // Wrap around screen edges
      if (this.x > width + 12) this.x = -12;
      else if (this.x < -12) this.x = width + 12;
      if (this.y > height + 12) this.y = -12;
      else if (this.y < -12) this.y = height + 12;

      // Opacity pulsing
      const pulse = Math.sin(now * 0.0012 + this.phase) * 0.5 + 0.5;
      const opacity = this.baseOpacity * (0.65 + pulse * 0.35);

      // Batch writes — only transform + opacity per frame
      this.element.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
      this.element.style.opacity = opacity;
    }
  }

  function buildParticles() {
    // Detach container from DOM to batch-remove children
    const parent = container.parentNode;
    const next = container.nextSibling;
    parent.removeChild(container);
    container.innerHTML = '';
    particles.length = 0;

    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Re-attach — single reflow
    if (next) parent.insertBefore(container, next);
    else parent.appendChild(container);
  }

  function animate(now) {
    if (isPaused) return;
    const delta = Math.min(34, now - lastTime);
    lastTime = now;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(delta, now);
    }

    rafId = requestAnimationFrame(animate);
  }

  let resizeTimer = null;
  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    // Debounce rebuild to avoid thrashing on rapid resize
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      buildParticles();
      resizeTimer = null;
    });
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
  initFeaturedCardPointerEffect();
});
