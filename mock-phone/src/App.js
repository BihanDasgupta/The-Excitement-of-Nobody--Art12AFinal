import { useEffect, useRef, useState } from 'react';
import './App.css';

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

const APPS = [
  {
    key: 'instagram',
    name: 'Instagram',
    glyph: '📸',
    iconClass: 'icon-ig',
    people: ['@soph.h', '@micah.j', '@aiden.mp4', '@livvy', '@noah.k', '@mia.rose', '@kenzie', '@jayden'],
    groups: ['@roomies', '@studio.crew', '@club.officers', '@gradshow2025']
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    glyph: '🎵',
    iconClass: 'icon-tok',
    people: ['@chloexyz', '@campusmemes', '@partyplug', '@benji', '@ari.mov', '@samuel'],
    groups: ['@groupchat', '@dorm12b']
  },
  {
    key: 'x',
    name: 'X',
    glyph: '🕊️',
    iconClass: 'icon-x',
    people: ['@campusnews', '@prof_smith', '@em.k', '@matt', '@ella'],
    groups: ['@cs101group', '@intramurals']
  },
  {
    key: 'discord',
    name: 'Discord',
    glyph: '🎮',
    iconClass: 'icon-disc',
    people: ['Riley', 'Jamie', 'Alex', 'Taylor', 'Jordan', 'Ava', 'Chris'],
    groups: ['Server • CS Club', 'Group • Roomies', '#project-lab', '#late-night', 'Server • Game Night']
  },
  {
    key: 'snapchat',
    name: 'Snapchat',
    glyph: '👻',
    iconClass: 'icon-snap',
    people: ['Ava', 'Chris', 'Jordan', 'Bestie', 'Maya', 'Ethan', 'Sofia', 'Liam'],
    groups: ['Roomies', 'Brunch Girls', 'Gym Buddies']
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    glyph: '💼',
    iconClass: 'icon-linkedin',
    people: ['Dana P.', 'Alex P.', 'Jordan W.', 'Taylor M.', 'Maya R.', 'Ethan K.', 'Sofia L.', 'Noah S.'],
    groups: []
  },
];

function generateMessage(appKey, who, isGroup) {
  const n = 1 + Math.floor(Math.random() * 5); // 1–5
  const groupPrefix = isGroup ? `${n} new messages in ${who}.` : `You have ${n} new messages.`;
  switch (appKey) {
    case 'instagram':
      return isGroup
        ? groupPrefix
        : [
            `${who} mentioned you in their story.`,
            `${who} tagged you in a post.`,
            `${who} sent you a message.`,
            groupPrefix,
          ][Math.floor(Math.random() * 4)];
    case 'tiktok':
      return isGroup
        ? groupPrefix
        : [
            `${who} mentioned you in a comment.`,
            `${who} sent you a message.`,
            groupPrefix,
          ][Math.floor(Math.random() * 3)];
    case 'x':
      return isGroup
        ? groupPrefix
        : [
            `${who} mentioned you in a post.`,
            `${who} sent you a message.`,
            groupPrefix,
          ][Math.floor(Math.random() * 3)];
    case 'discord':
      return isGroup
        ? groupPrefix
        : [
            `${who} mentioned you.`,
            `${who} sent you a message.`,
            groupPrefix,
          ][Math.floor(Math.random() * 3)];
    case 'snapchat':
      return isGroup
        ? `New Snaps in ${who}.`
        : [
            `${who} snapped you.`,
            `${who} sent you a Snap.`,
            `${who} sent you a message.`,
          ][Math.floor(Math.random() * 3)];
    case 'linkedin': {
      const posts = [
        'Landed a summer internship!',
        'New project: interactive installation.',
        'We’re hiring campus ambassadors.',
        'Portfolio update: new case study.',
        'Accepted an offer — excited to start!',
      ];
      const companies = ['Google', 'Microsoft', 'Campus IT', 'Design Club', 'StartUp Lab', 'Coffee Roasters', 'City Museum'];
      return [
        `${who} posted "${posts[Math.floor(Math.random()*posts.length)]}".`,
        `${who} sent you a connection request.`,
        `${who} also works at ${companies[Math.floor(Math.random()*companies.length)]}, send them a connection.`,
      ][Math.floor(Math.random() * 3)];
    }
    default:
      return isGroup ? groupPrefix : `${who} sent you a message.`;
  }
}

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [notes, setNotes] = useState([]);
  const [timeText, setTimeText] = useState(() => formatTime(new Date()));
  const [dateText, setDateText] = useState(() => formatDate(new Date()));
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioEnabledRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);
  const isLockedRef = useRef(true);

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTimeText(formatTime(now));
      setDateText(formatDate(now));
    }, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioContextRef.current = new AC();
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
  };

  const beepNow = (force = false) => {
    if (!force && !audioEnabledRef.current) return;
    ensureAudioContext();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const tone = 440 + Math.random() * 440;
    const now = ctx.currentTime;
    osc.frequency.value = tone;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const createNotification = () => {
    const app = pick(APPS);
    const chooseGroup = Math.random() < 0.2; // ~20% groups
    const hasGroups = Array.isArray(app.groups) && app.groups.length > 0;
    const isGroup = chooseGroup && hasGroups;
    const who = isGroup ? pick(app.groups) : pick(app.people);
    const msg = generateMessage(app.key, who, isGroup);
    return {
      id: Math.random().toString(36).slice(2),
      appName: app.name,
      iconClass: app.iconClass,
      glyph: app.glyph,
      who,
      msg,
    };
  };

  const scheduleNextNotification = () => {
    if (!isLocked) return;
    // Aim for ~2–3 per minute → 20–30s intervals
    const delay = 20000 + Math.random() * 10000; // 20–30s
    timerRef.current = setTimeout(() => {
      if (!isLocked) return;
      setNotes((prev) => {
        const next = [createNotification(), ...prev];
        return next.slice(0, 60);
      });
      beepNow();
      scheduleNextNotification();
    }, delay);
  };

  useEffect(() => {
    if (isLocked) {
      scheduleNextNotification();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  // Keep a ref of isLocked for handlers that should not re-subscribe
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  const beginFaceId = async () => {
    if (!isLocked) return;
    // Enable audio on first interaction
    if (!audioEnabled) {
      setAudioEnabled(true);
      ensureAudioContext();
    }
    setScanning(true);
    setDetected(false);
    setTimeout(() => setDetected(true), 900);
    setTimeout(() => {
      unlock();
    }, 1500);
  };

  const unlock = () => {
    setIsLocked(false);
    setNotes([]);
    if (timerRef.current) clearTimeout(timerRef.current);
    setScanning(false);
    setDetected(false);
  };

  const relock = () => {
    setIsLocked(true);
    setScanning(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (isLocked && (e.key === 'Enter' || e.key === ' ')) beginFaceId();
      if (!isLocked && e.key.toLowerCase() === 'l') relock();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  const handleSoundToggle = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    ensureAudioContext();
  };

  // Auto-enable audio on first user interaction (robust across devices/browsers)
  useEffect(() => {
    const activate = () => {
      setAudioEnabled(true);
      ensureAudioContext();
      // Immediate confirmation beep without depending on state/closures
      if (isLockedRef.current) {
        const ctx = audioContextRef.current;
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const tone = 440 + Math.random() * 440;
          const now = ctx.currentTime;
          osc.frequency.value = tone;
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      }
    };
    const onKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') activate();
    };
    const opts = { once: true, passive: true };
    window.addEventListener('pointerdown', activate, opts);
    window.addEventListener('touchstart', activate, opts);
    window.addEventListener('click', activate, opts);
    window.addEventListener('keydown', onKeydown, { once: true });
    return () => {
      window.removeEventListener('pointerdown', activate);
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('click', activate);
      window.removeEventListener('keydown', onKeydown);
    };
  }, []);

  // Resume audio context when returning to the tab (some browsers suspend it)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && audioEnabled) {
        ensureAudioContext();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled]);

  // Keep ref in sync and play a catch-up beep if notes already exist while locked
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
    if (audioEnabled && isLocked && notes.length > 0) {
      beepNow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled, isLocked, notes.length]);

  return (
    <div>
      <button id="soundToggle" className="sound-toggle" aria-pressed={audioEnabled} onClick={handleSoundToggle} title="Enable/Disable sound">
        {audioEnabled ? '🔈 Sound on' : '🔊 Enable sound'}
      </button>
      <div className="stage">
        <div className="phone" role="region" aria-label="Mock Phone">
          <div className="bezel">
            <div className="notch" aria-hidden="true"></div>
            <div className="screen">
              {isLocked && (
                <section id="lockScreen" className="panel lock-screen" aria-hidden={!isLocked} onClick={beginFaceId}>
                  <div className="lock-time" aria-live="polite" aria-atomic="true">
                    <div id="timeText" className="time">{timeText}</div>
                    <div id="dateText" className="date">{dateText}</div>
                  </div>
                  <div id="notificationList" className="notifications" aria-live="polite" aria-relevant="additions">
                    {notes.map((n) => (
                      <div key={n.id} className="note">
                        <div className={`app-icon ${n.iconClass}`}>{n.glyph}</div>
                        <div>
                          <div className="who">{n.who}</div>
                          <div className="msg">{n.msg}</div>
                        </div>
                        <div className="app">{n.appName}</div>
                      </div>
                    ))}
                  </div>
                  <div className="faceid-hint">Click to unlock</div>
                </section>
              )}

              {scanning && (
                <div id="scanOverlay" className={`scan-overlay${detected ? ' detected' : ''}`} aria-hidden={!scanning}>
                  <div className="faceid-frame">
                    <span className="corner tl"></span>
                    <span className="corner tr"></span>
                    <span className="corner bl"></span>
                    <span className="corner br"></span>
                    <div className="smiley" aria-hidden="true">🙂</div>
                  </div>
                  <div className="scan-ring"></div>
                  <div className="scan-text">Face ID</div>
                </div>
              )}

              {!isLocked && !scanning && (
                <section id="homeScreen" className="panel home-screen" aria-hidden={isLocked}>
                  <div className="home-top">
                    <button id="lockBtn" className="lock-btn" onClick={relock} title="Lock the phone" aria-label="Lock phone">Lock</button>
                  </div>
                  <div className="home-empty">
                    <p>You have no new notifications...</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
      <noscript>
        <div className="noscript">This experience requires JavaScript.</div>
      </noscript>
    </div>
  );
}

export default App;
