
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.view');
  const nav = document.querySelector('.nav-tabs');
  const mobileToggle = document.querySelector('.mobile-toggle');

  function showView(name, updateHash = true) {
    const target = document.getElementById(`view-${name}`);
    if (!target) return;
    views.forEach(v => v.classList.remove('active'));
    links.forEach(l => l.classList.toggle('active', l.dataset.view === name));
    target.classList.add('active');
    if (updateHash) history.replaceState(null, '', `#${name}`);
    window.scrollTo({top: 0, behavior: 'instant'});
    if (nav) nav.classList.remove('open');
  }

  links.forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    showView(link.dataset.view);
  }));

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const initial = location.hash.replace('#','');
  showView(['home','past','speakers'].includes(initial) ? initial : 'home', false);
});


// CURRENT SPEAKERS CAROUSEL
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-speaker-carousel]').forEach(carousel => {
    const viewport = carousel.querySelector('.speaker-carousel__viewport');
    const cards = Array.from(carousel.querySelectorAll('.current-speaker-card'));
    const prev = carousel.querySelector('.speaker-carousel__arrow--prev');
    const next = carousel.querySelector('.speaker-carousel__arrow--next');
    const counter = carousel.querySelector('.speaker-carousel__counter');
    const dotsWrap = carousel.querySelector('.speaker-carousel__dots');
    if (!viewport || cards.length < 2) return;

    let active = 0;
    let pointerStartX = null;

    const dots = cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'speaker-carousel__dot';
      dot.setAttribute('aria-label', `Показать спикера ${index + 1}`);
      dot.addEventListener('click', () => { active = index; update(); });
      dotsWrap?.appendChild(dot);
      card.addEventListener('click', () => {
        if (index !== active) { active = index; update(); }
      });
      return dot;
    });

    const circularDistance = (index) => {
      let d = index - active;
      const half = cards.length / 2;
      if (d > half) d -= cards.length;
      if (d < -half) d += cards.length;
      return d;
    };

    function update() {
      const vw = viewport.clientWidth;
      const nearX = vw < 620 ? vw * 0.72 : Math.min(390, vw * 0.34);
      const farX = vw < 620 ? vw * 1.12 : Math.min(700, vw * 0.61);

      cards.forEach((card, index) => {
        const d = circularDistance(index);
        const abs = Math.abs(d);
        card.classList.toggle('is-active', d === 0);
        card.classList.toggle('is-near', abs === 1);
        card.classList.toggle('is-far', abs === 2);
        card.setAttribute('aria-hidden', abs > 2 ? 'true' : 'false');

        let x = 0, scale = 1, opacity = 1;
        if (abs === 1) { x = Math.sign(d) * nearX; scale = .84; opacity = .72; }
        else if (abs === 2) { x = Math.sign(d) * farX; scale = .70; opacity = .20; }
        else if (abs > 2) { x = Math.sign(d || 1) * (farX + 180); scale = .64; opacity = 0; }

        card.style.transform = `translateX(calc(-50% + ${x}px)) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = d === 0 ? 5 : abs === 1 ? 3 : abs === 2 ? 1 : 0;
      });

      dots.forEach((dot, index) => dot.classList.toggle('active', index === active));
      if (counter) counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    }

    const goPrev = () => { active = (active - 1 + cards.length) % cards.length; update(); };
    const goNext = () => { active = (active + 1) % cards.length; update(); };
    prev?.addEventListener('click', goPrev);
    next?.addEventListener('click', goNext);

    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    });

    viewport.addEventListener('pointerdown', e => {
      pointerStartX = e.clientX;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener('pointerup', e => {
      if (pointerStartX === null) return;
      const dx = e.clientX - pointerStartX;
      pointerStartX = null;
      viewport.classList.remove('is-dragging');
      if (Math.abs(dx) > 42) dx < 0 ? goNext() : goPrev();
    });
    viewport.addEventListener('pointercancel', () => {
      pointerStartX = null;
      viewport.classList.remove('is-dragging');
    });

    window.addEventListener('resize', update);
    update();
  });
});
