// Floating particles animation effect
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const particleCount = Math.max(15, Math.min(50, Math.floor(window.innerWidth / 40)));
  const particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.element = document.createElement('div');
      
      // Color palette matching theme
      const colors = ['#009fa8', '#920783', '#CBBE00'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      this.element.style.cssText = `
        position: fixed;
        width: ${this.size * 2}px;
        height: ${this.size * 2}px;
        background: radial-gradient(circle, ${this.color}, transparent);
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${this.size * 3}px ${this.color};
        opacity: ${this.opacity};
        z-index: 0;
        left: ${this.x}px;
        top: ${this.y}px;
      `;
      
      container.appendChild(this.element);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x > window.innerWidth + 10) this.x = -10;
      if (this.x < -10) this.x = window.innerWidth + 10;
      if (this.y > window.innerHeight + 10) this.y = -10;
      if (this.y < -10) this.y = window.innerHeight + 10;

      this.element.style.left = this.x + 'px';
      this.element.style.top = this.y + 'px';
    }

    draw() {
      // Pulsing effect
      const pulse = Math.sin(Date.now() * 0.001 + this.x) * 0.5 + 0.5;
      this.element.style.opacity = this.opacity * (0.5 + pulse * 0.5);
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    // Optional: recreate particles on resize for better distribution
  });
}

// Smooth scroll enhancement
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slide-up 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe button-link and featured-card elements
  const elements = document.querySelectorAll('.button-link, .featured-card, .page-content table tbody tr');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${index * 0.05}s`;
    observer.observe(el);
  });
});

// Mouse follow effect on featured cards (optional enhancement)
document.addEventListener('mousemove', (e) => {
  const featuredCards = document.querySelectorAll('.featured-card');
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  featuredCards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const distX = (e.clientX - cardCenterX) * 0.02;
    const distY = (e.clientY - cardCenterY) * 0.02;

    // Only apply subtle effect
    if (Math.abs(distX) < 5 && Math.abs(distY) < 5) {
      card.style.setProperty('--mouse-x', distX + 'px');
      card.style.setProperty('--mouse-y', distY + 'px');
    }
  });
});
