(function () {
  const ufo = document.getElementById('ufo-encounter');
  const target = document.getElementById('cursor-target');
  const alertBox = document.getElementById('alien-alert');
  const cow = document.getElementById('pixel-cow');
  const abductionFlash = document.getElementById('abduction-flash');
  if (!ufo || !target || !alertBox) return;

  // The reference sprites arrive with white matte backgrounds. Remove near-white
  // pixels at runtime so the art stays crisp and transparent over the world.
  document.querySelectorAll('.sprite-image').forEach((image) => {
    const clean = () => {
      if (!image.naturalWidth || image.dataset.cleaned) return;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        if (pixels.data[index] > 242 && pixels.data[index + 1] > 242 && pixels.data[index + 2] > 242) pixels.data[index + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      image.src = canvas.toDataURL('image/png');
      image.dataset.cleaned = 'true';
    };
    image.addEventListener('load', clean, { once: true });
    if (image.complete) clean();
  });

  const shot = document.createElement('span');
  shot.className = 'alien-shot';
  shot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(shot);
  let frame = 0;

  function track(event) {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = ufo.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const dx = event.clientX - originX;
      const dy = event.clientY - originY;
      const distance = Math.hypot(dx, dy);
      const nearby = distance < 260;
      target.style.left = event.clientX + 'px';
      target.style.top = event.clientY + 'px';
      if (!nearby) {
        ufo.classList.remove('is-alert');
        target.classList.remove('is-visible');
        alertBox.classList.remove('is-visible');
        shot.classList.remove('is-active');
        return;
      }
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      ufo.classList.add('is-alert');
      target.classList.add('is-visible');
      alertBox.textContent = 'WARNING // ALIEN TARGET LOCK';
      alertBox.classList.add('is-visible');
      shot.style.left = originX + 'px';
      shot.style.top = originY + 'px';
      shot.style.width = distance + 'px';
      shot.style.transform = 'rotate(' + angle + 'deg)';
      shot.classList.add('is-active');
    });
  }

  window.addEventListener('pointermove', track, { passive: true });
  ufo.addEventListener('click', () => {
    alertBox.textContent = 'DIRECT HIT // ALIEN DODGED';
    alertBox.classList.add('is-visible');
    ufo.classList.add('is-hit');
    window.setTimeout(() => ufo.classList.remove('is-hit'), 420);
  });

  // Patrol the sky between waypoints. On each encounter the UFO approaches
  // the wandering cow, lifts it with a pixel beam, leaves the scene, then
  // respawns after a 20-second cooldown.
  if (!cow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const waypoints = [[76, 18], [60, 12], [42, 23], [22, 16], [31, 31], [68, 30]];
  let waypointIndex = 0;
  let patrolTimer;
  let alignmentTimer;

  function moveToWaypoint() {
    if (ufo.classList.contains('abducting') || ufo.classList.contains('departing') || ufo.classList.contains('ufo-hidden')) return;
    const [x, y] = waypoints[waypointIndex++ % waypoints.length];
    ufo.style.left = x + 'vw';
    ufo.style.top = y + 'vh';
    ufo.style.right = 'auto';
  }

  function startPatrol() {
    ufo.classList.add('patrolling');
    moveToWaypoint();
    patrolTimer = window.setInterval(moveToWaypoint, 3600);
  }

  function beginAbduction() {
    if (ufo.classList.contains('abducting') || ufo.classList.contains('ufo-hidden')) return;
    window.clearInterval(patrolTimer);
    ufo.classList.remove('patrolling');
    ufo.classList.add('abducting');
    cow.classList.add('cow-targeted');
    // Freeze the roaming character before measuring it. This prevents the
    // target from drifting away while the UFO is flying into position.
    cow.style.animationPlayState = 'paused';
    const cowRect = cow.getBoundingClientRect();
    // Align the UFO's center to the cow's center so the beam lands on the
    // character even when the cow is mid-roam or the viewport changes size.
    const ufoRect = ufo.getBoundingClientRect();
    const targetX = Math.max(8, Math.min(window.innerWidth - ufoRect.width - 8, cowRect.left + (cowRect.width - ufoRect.width) / 2));
    const targetY = Math.max(120, cowRect.top - ufoRect.height - 8);
    ufo.style.left = targetX + 'px';
    ufo.style.top = targetY + 'px';
    ufo.style.right = 'auto';
    const alignToCow = () => {
      if (!cow.isConnected || cow.classList.contains('cow-hidden')) return;
      const currentCow = cow.getBoundingClientRect();
      const currentUfo = ufo.getBoundingClientRect();
      const x = Math.max(8, Math.min(window.innerWidth - currentUfo.width - 8, currentCow.left + (currentCow.width - currentUfo.width) / 2));
      const y = Math.max(120, currentCow.top - currentUfo.height - 8);
      ufo.style.left = x + 'px';
      ufo.style.top = y + 'px';
    };
    window.clearInterval(alignmentTimer);
    alignmentTimer = window.setInterval(alignToCow, 80);
    alertBox.textContent = 'ALIEN EVENT // ABDUCTION INCOMING';
    alertBox.classList.add('is-visible');
    window.setTimeout(() => {
      // Recalculate once the approach transition settles, keeping the beam
      // centered if the cow's layout shifted during the approach.
      const alignedCow = cow.getBoundingClientRect();
      const alignedUfo = ufo.getBoundingClientRect();
      ufo.style.left = Math.max(8, Math.min(window.innerWidth - alignedUfo.width - 8, alignedCow.left + (alignedCow.width - alignedUfo.width) / 2)) + 'px';
      ufo.style.top = Math.max(120, alignedCow.top - alignedUfo.height - 8) + 'px';
      ufo.classList.add('beam-active');
      cow.classList.add('being-abducted');
      alertBox.textContent = 'COW ABDUCTED // RETURNING IN 20 SEC';
    }, 1500);
    window.setTimeout(() => {
      window.clearInterval(alignmentTimer);
      ufo.classList.remove('beam-active');
      abductionFlash?.classList.remove('is-active');
      void abductionFlash?.offsetWidth;
      abductionFlash?.classList.add('is-active');
      ufo.classList.add('departing');
      cow.classList.add('cow-hidden');
      ufo.style.left = Math.min(window.innerWidth - 160, targetX + 180) + 'px';
      ufo.style.top = '-12rem';
    }, 4500);
    window.setTimeout(() => {
      window.clearInterval(alignmentTimer);
      ufo.classList.remove('abducting', 'departing');
      ufo.classList.add('ufo-hidden');
      abductionFlash?.classList.remove('is-active');
      alertBox.classList.remove('is-visible');
      window.setTimeout(() => {
        cow.classList.remove('cow-hidden', 'cow-targeted');
        cow.style.animationPlayState = '';
        ufo.classList.remove('ufo-hidden');
        ufo.style.left = '12vw';
        ufo.style.top = '20vh';
        startPatrol();
        window.setTimeout(beginAbduction, 20000);
      }, 20000);
    }, 5700);
  }

  startPatrol();
  window.setTimeout(beginAbduction, 20000);
})();
