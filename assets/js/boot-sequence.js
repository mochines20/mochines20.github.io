(function () {
  const screen = document.getElementById('boot-screen');
  const progress = document.getElementById('boot-progress');
  const status = document.getElementById('boot-status');
  const skipButton = document.getElementById('boot-skip');
  if (!screen) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phases = [
    [0, 'POWERING ON...'],
    [18, 'CHECKING MEMORY...'],
    [42, 'LOADING DEV ARCADE...'],
    [67, 'SYNCING PORTFOLIO DATA...'],
    [86, 'CALIBRATING PIXEL WORLD...'],
    [100, 'READY PLAYER 01']
  ];
  let finished = false;
  let timers = [];
  let hasBooted = false;

  try { hasBooted = sessionStorage.getItem('jeysi-booted') === 'true'; } catch (_) {}

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    if (progress) progress.style.width = '100%';
    if (status) status.textContent = 'READY PLAYER 01';
    document.body.classList.remove('booting');
    document.body.classList.add('boot-complete');
    try { sessionStorage.setItem('jeysi-booted', 'true'); } catch (_) {}
    window.setTimeout(() => screen.remove(), 650);
  }

  function run() {
    if (reducedMotion) return finish();
    const stepDuration = hasBooted ? 95 : 430;
    const finishDelay = hasBooted ? 650 : 2850;
    phases.forEach(([value, message], index) => {
      timers.push(window.setTimeout(() => {
        if (progress) progress.style.width = value + '%';
        if (status) status.textContent = message;
      }, index * stepDuration));
    });
    timers.push(window.setTimeout(finish, finishDelay));
  }

  document.addEventListener('keydown', finish, { once: true });
  screen.addEventListener('click', finish, { once: true });
  skipButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    finish();
  }, { once: true });
  run();
})();
