(function () {
  const screen = document.getElementById('boot-screen');
  const progress = document.getElementById('boot-progress');
  const status = document.getElementById('boot-status');
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

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    if (progress) progress.style.width = '100%';
    if (status) status.textContent = 'READY PLAYER 01';
    document.body.classList.remove('booting');
    document.body.classList.add('boot-complete');
    window.setTimeout(() => screen.remove(), 650);
  }

  function run() {
    if (reducedMotion) return finish();
    phases.forEach(([value, message], index) => {
      timers.push(window.setTimeout(() => {
        if (progress) progress.style.width = value + '%';
        if (status) status.textContent = message;
      }, index * 820));
    });
    timers.push(window.setTimeout(finish, 5900));
  }

  document.addEventListener('keydown', finish, { once: true });
  screen.addEventListener('click', finish, { once: true });
  run();
})();
