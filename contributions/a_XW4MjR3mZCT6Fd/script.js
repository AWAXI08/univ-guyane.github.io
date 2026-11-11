// Animation isolée dans la contribution GUYANE WARS.
(() => {
  const root = document.querySelector('.sw-animation');
  if (!root) return;
  const soundButton = root.querySelector('.sw-sound');
  const replayButton = root.querySelector('.sw-replay');
  const animated = root.querySelectorAll('.sw-intro, .sw-logo, .sw-crawl, .sw-ending');
  const soundtrack = new Audio('intro-star-wars.mp3');
  soundtrack.preload = 'auto';
  soundtrack.loop = false;
  soundtrack.volume = 0;

  const DURATION = 80000;
  const MUSIC_START = 8500;
  let soundEnabled = false;
  let musicTimer = null;
  let endTimer = null;

  function updateButton() {
    if (!soundButton) return;
    soundButton.textContent = soundEnabled ? '🔊 Désactiver le son' : '🔇 Activer le son';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
  }

  function restartVisuals() {
    animated.forEach(el => { el.style.animation = 'none'; });
    void root.offsetWidth;
    animated.forEach(el => { el.style.animation = ''; });
  }

  function clearSchedule() {
    clearTimeout(musicTimer);
    clearTimeout(endTimer);
    musicTimer = null;
    endTimer = null;
  }

  function stopAudio() {
    soundtrack.pause();
    soundtrack.currentTime = 0;
    soundtrack.volume = 0;
  }

  function scheduleMusic() {
    clearSchedule();
    musicTimer = setTimeout(() => {
      if (!soundEnabled) return;
      soundtrack.currentTime = 0;
      soundtrack.volume = 0.75;
      if (soundtrack.paused) soundtrack.play().catch(console.error);
    }, MUSIC_START);
    endTimer = setTimeout(() => {
      soundtrack.pause();
      soundtrack.volume = 0;
    }, DURATION);
  }

  async function enableSound() {
    try {
      // Autorisation de lecture obtenue grâce au clic de l'utilisateur.
      soundtrack.currentTime = 0;
      soundtrack.volume = 0;
      await soundtrack.play();
      soundEnabled = true;
      updateButton();
      restartVisuals();
      scheduleMusic();
    } catch (error) {
      console.error('Lecture audio impossible :', error);
      soundEnabled = false;
      updateButton();
      alert('Vérifie la présence de intro-star-wars.mp3 dans ce dossier.');
    }
  }

  function disableSound() {
    soundEnabled = false;
    clearSchedule();
    stopAudio();
    updateButton();
  }

  soundButton?.addEventListener('click', () => {
    if (soundEnabled) disableSound();
    else enableSound();
  });

  replayButton?.addEventListener('click', () => {
    restartVisuals();
    if (soundEnabled) {
      stopAudio();
      soundtrack.play().then(scheduleMusic).catch(console.error);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && soundEnabled) disableSound();
  });
})();
