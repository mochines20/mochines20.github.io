(function () {
  const shell = document.querySelector('.game-shell');
  if (!shell) return;

  const panels = Array.from(shell.querySelectorAll(':scope > section'));
  const labels = ['HOME', 'ABOUT', 'SKILLS', 'EDUCATION', 'PROJECTS', 'EXPERIENCE', 'CONTACT', 'CREDITS'];
  const level = document.querySelector('.game-level');
  const progress = document.querySelector('.game-progress span');
  const transition = document.querySelector('.level-transition');
  const previousButton = document.querySelector('.game-prev');
  const nextButton = document.querySelector('.game-next');
  let current = 0;
  let wheelLocked = false;
  let jumping = false;

  function goTo(index) {
    const next = Math.max(0, Math.min(index, panels.length - 1));
    if (next === current) return;
    current = next;
    jumping = true;
    if (transition) {
      transition.dataset.level = `LEVEL ${String(current + 1).padStart(2, '0')} / ${labels[current] || 'PORTFOLIO'}`;
      transition.classList.remove('is-running');
      void transition.offsetWidth;
      transition.classList.add('is-running');
      window.setTimeout(() => transition.classList.remove('is-running'), 900);
    }
    shell.scrollTo({ left: panels[current].offsetLeft, behavior: 'smooth' });
    updateHud(current);
    if (panels[current].id) history.replaceState(null, '', `#${panels[current].id}`);
    window.setTimeout(() => { jumping = false; }, 900);
  }

  function updateHud(index) {
    if (level) level.textContent = `LEVEL ${String(index + 1).padStart(2, '0')} / ${labels[index] || 'PORTFOLIO'}`;
    if (progress) progress.style.width = `${((index + 1) / panels.length) * 100}%`;
    panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === index));
    if (previousButton) {
      previousButton.disabled = index === 0;
      previousButton.setAttribute('aria-disabled', String(index === 0));
    }
    if (nextButton) {
      nextButton.disabled = index === panels.length - 1;
      nextButton.setAttribute('aria-disabled', String(index === panels.length - 1));
    }
  }

  previousButton?.addEventListener('click', () => goTo(current - 1));
  nextButton?.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea, select, button, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); goTo(current + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goTo(current - 1); }
    if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    if (event.key === 'End') { event.preventDefault(); goTo(panels.length - 1); }
  });

  shell.addEventListener('wheel', (event) => {
    // Regular wheel scrolling belongs to the active level so long sections
    // (especially Projects and Experience) can reach their View All controls.
    // Hold Shift for the intentional game-map level jump.
    const horizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if ((!event.shiftKey && !horizontalGesture) || wheelLocked) return;
    event.preventDefault();
    wheelLocked = true;
    const direction = event.shiftKey ? event.deltaY : event.deltaX;
    goTo(current + (direction > 0 ? 1 : -1));
    window.setTimeout(() => { wheelLocked = false; }, 650);
  }, { passive: false });

  document.querySelectorAll('header a[href^="#"], .footer a[href^="#"], .game-shell a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      const index = target ? panels.indexOf(target) : -1;
      if (index < 0) return;
      event.preventDefault();
      document.querySelector('.navbar')?.classList.remove('nav-toggle');
      document.getElementById('menu')?.classList.remove('fa-times');
      goTo(index);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    if (jumping) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = panels.indexOf(entry.target);
      if (index >= 0) { current = index; updateHud(index); }
    });
  }, { root: shell, threshold: .6 });
  panels.forEach((panel) => observer.observe(panel));
  const initialPanel = location.hash ? document.querySelector(location.hash) : null;
  const initialIndex = initialPanel ? panels.indexOf(initialPanel) : 0;
  current = initialIndex >= 0 ? initialIndex : 0;
  shell.scrollTo({ left: panels[current].offsetLeft, behavior: 'auto' });
  updateHud(current);
})();
