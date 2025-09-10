(() => {
  const lockScreen = document.getElementById('lockScreen');
  const homeScreen = document.getElementById('homeScreen');
  const noteList = document.getElementById('notificationList');
  const timeText = document.getElementById('timeText');
  const dateText = document.getElementById('dateText');
  const scanOverlay = document.getElementById('scanOverlay');
  const cameraPreview = document.getElementById('cameraPreview');
  const lockBtn = document.getElementById('lockBtn');
  const soundToggle = document.getElementById('soundToggle');

  let isLocked = true;
  let audioContext = null;
  let audioEnabled = false;
  let notificationTimer = null;
  let mediaStream = null;

  function formatTime(date) {
    const h = date.getHours();
    const m = date.getMinutes();
    const hh = (h % 12) || 12;
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function formatDate(date) {
    const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    return fmt.format(date);
  }

  function updateClock() {
    const now = new Date();
    timeText.textContent = formatTime(now);
    dateText.textContent = formatDate(now);
  }

  function ensureAudioContext() {
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioContext = new AC();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  function playBeep() {
    if (!audioEnabled) return;
    ensureAudioContext();
    if (!audioContext) return;
    const ctx = audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const tone = 440 + Math.random() * 440; // 440–880 Hz
    const now = ctx.currentTime;
    osc.frequency.value = tone;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  const APPS = [
    { key: 'imsg', name: 'Messages', glyph: '💬', iconClass: 'icon-imsg', people: ['Mom', 'Alex', 'Sam', 'Jamie', 'Taylor', 'Unknown'] },
    { key: 'snap', name: 'Snapchat', glyph: '👻', iconClass: 'icon-snap', people: ['Ava', 'Chris', 'Jordan', 'Bestie'] },
    { key: 'ig', name: 'Instagram', glyph: '📸', iconClass: 'icon-ig', people: ['@artlover', '@studio.time', '@night.shift', '@you.were.tagged'] },
    { key: 'mail', name: 'Mail', glyph: '✉️', iconClass: 'icon-mail', people: ['Gallery', 'No-Reply', 'Curator', 'Your Past Self'] },
    { key: 'disc', name: 'Discord', glyph: '🎮', iconClass: 'icon-disc', people: ['Server • Studio', 'DM • Riley', 'Group • Night Shift'] },
    { key: 'tok', name: 'Tok', glyph: '🎵', iconClass: 'icon-tok', people: ['@random', 'Live Now', 'For You'] },
    { key: 'news', name: 'News', glyph: '📰', iconClass: 'icon-news', people: ['Breaking'] },
  ];

  const LINES = [
    'Did you see this?',
    'Call me when you can.',
    'Where are you right now?',
    'This can’t wait.',
    'You were mentioned in a story.',
    'Someone is outside.',
    'They found the thing.',
    'You’re late.',
    'New message (image).',
    'Open this before midnight.',
    'We need to talk.',
    'You won. Don’t tell anyone.',
    'The door is unlocked.',
    'Is this you?',
    'You missed 3 calls.',
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createNotification() {
    const app = pick(APPS);
    const who = pick(app.people);
    const msg = pick(LINES);
    const el = document.createElement('div');
    el.className = 'note';
    const icon = document.createElement('div');
    icon.className = `app-icon ${app.iconClass}`;
    icon.textContent = app.glyph;
    const body = document.createElement('div');
    const whoEl = document.createElement('div');
    whoEl.className = 'who';
    whoEl.textContent = who;
    const msgEl = document.createElement('div');
    msgEl.className = 'msg';
    msgEl.textContent = msg;
    body.appendChild(whoEl);
    body.appendChild(msgEl);
    const appEl = document.createElement('div');
    appEl.className = 'app';
    appEl.textContent = app.name;
    el.appendChild(icon);
    el.appendChild(body);
    el.appendChild(appEl);
    return el;
  }

  function addNotification() {
    const el = createNotification();
    noteList.prepend(el);
    // limit visible notes
    const max = 6;
    while (noteList.children.length > max) {
      noteList.removeChild(noteList.lastElementChild);
    }
  }

  function scheduleNextNotification() {
    if (!isLocked) return;
    const delay = 2400 + Math.random() * 5200; // 2.4s–7.6s
    notificationTimer = setTimeout(() => {
      if (!isLocked) return;
      addNotification();
      playBeep();
      scheduleNextNotification();
    }, delay);
  }

  async function beginFaceId() {
    if (!isLocked) return;
    scanOverlay.classList.remove('hidden');
    scanOverlay.setAttribute('aria-hidden', 'false');

    let gotCamera = false;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        cameraPreview.srcObject = mediaStream;
        gotCamera = true;
      }
    } catch (_) {
      gotCamera = false;
    }

    // Accept any face — unlock shortly after camera starts (or regardless if unavailable)
    setTimeout(() => unlockPhone(), gotCamera ? 1100 : 900);
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    cameraPreview.srcObject = null;
  }

  function clearNotifications() {
    noteList.innerHTML = '';
  }

  function unlockPhone() {
    isLocked = false;
    clearTimeout(notificationTimer);
    stopCamera();
    scanOverlay.classList.add('hidden');
    scanOverlay.setAttribute('aria-hidden', 'true');
    lockScreen.classList.add('hidden');
    lockScreen.setAttribute('aria-hidden', 'true');
    homeScreen.classList.remove('hidden');
    homeScreen.setAttribute('aria-hidden', 'false');
    clearNotifications();
  }

  function lockPhone() {
    isLocked = true;
    lockScreen.classList.remove('hidden');
    lockScreen.setAttribute('aria-hidden', 'false');
    homeScreen.classList.add('hidden');
    homeScreen.setAttribute('aria-hidden', 'true');
    scheduleNextNotification();
  }

  function initTime() {
    updateClock();
    setInterval(updateClock, 1000 * 30);
  }

  function initSound() {
    soundToggle.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      ensureAudioContext();
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      soundToggle.setAttribute('aria-pressed', String(audioEnabled));
      soundToggle.textContent = audioEnabled ? '🔈 Sound on' : '🔊 Enable sound';
    });
  }

  function initInteractions() {
    lockScreen.addEventListener('click', () => {
      // Any tap simulates raising/looking — begin permissive Face ID
      beginFaceId();
    });
    lockBtn.addEventListener('click', () => {
      lockPhone();
    });

    // Keyboard accessibility: Enter unlock, L to lock
    document.addEventListener('keydown', (e) => {
      if (isLocked && (e.key === 'Enter' || e.key === ' ')) beginFaceId();
      if (!isLocked && (e.key.toLowerCase() === 'l')) lockPhone();
    });
  }

  function start() {
    initTime();
    initSound();
    initInteractions();
    scheduleNextNotification();
  }

  start();
})();


