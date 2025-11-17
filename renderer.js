const video = document.getElementById('bg-video');
video.playbackRate = 0.5;

const startScreen = document.getElementById('start-screen');
const cutsceneScreen = document.getElementById('cutscene-screen');

document.getElementById('start-button').addEventListener('click', () => {
  window.location.href = "/Game";
  startScreen.style.display = 'none';
  cutsceneScreen.style.display = 'flex';
});

document.getElementById('exit-button').addEventListener('click', () => {
  if (!confirm('Close this tab?')) return;

  window.close();

  try {
    window.open('', '_self'); 
    window.close();
  } catch (e) {
    window.location.href = 'about:blank';
  }
});

// bg music 

const bgAudio = document.getElementById('bg-music');
const volumeButton = document.getElementById('volume-button');
const startButton = document.getElementById('start-button'); 

bgAudio.loop = true;
const TARGET_VOLUME = 0.5;
bgAudio.volume = TARGET_VOLUME;

function tryPlayAudio() {
  const p = bgAudio.play();
  if (!p) return Promise.reject(new Error('play() returned falsy'));
  return p;
}

function fadeInAudio(target = TARGET_VOLUME, step = 0.05, interval = 80) {
  bgAudio.volume = 0;
  const id = setInterval(() => {
    bgAudio.volume = Math.min(bgAudio.volume + step, target);
    if (bgAudio.volume >= target) clearInterval(id);
  }, interval);
}

window.addEventListener('load', () => {
  const savedTime = localStorage.getItem('bgMusicTime');
  const savedMuted = localStorage.getItem('bgMusicMuted');

  if (savedMuted !== null) {
    bgAudio.muted = savedMuted === 'true';
    volumeButton.src = bgAudio.muted ? 'assets/Volume-off.png' : 'assets/Volume-on.png';
  }

  const onLoadedMetadata = () => {
    if (savedTime !== null && !isNaN(savedTime)) {
      try {
        const t = Math.min(parseFloat(savedTime), bgAudio.duration || parseFloat(savedTime));
        if (isFinite(t)) bgAudio.currentTime = t;
      } catch (e) { }
    }

    tryPlayAudio()
      .then(() => { if (!bgAudio.muted) fadeInAudio(); })
      .catch(() => {
        const resumeOnce = () => {
          tryPlayAudio().then(() => { if (!bgAudio.muted) fadeInAudio(); }).catch(() => {});
          window.removeEventListener('click', resumeOnce);
          startButton && startButton.removeEventListener('click', resumeOnce);
        };
        window.addEventListener('click', resumeOnce, { once: true });
        if (startButton) startButton.addEventListener('click', resumeOnce, { once: true });
      });
  };

  if (bgAudio.readyState >= 1) {
    onLoadedMetadata();
  } else {
    bgAudio.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
  }
});

window.addEventListener('beforeunload', () => {
  try {
    localStorage.setItem('bgMusicTime', bgAudio.currentTime);
    localStorage.setItem('bgMusicMuted', bgAudio.muted);
  } catch (e) {  }
});

volumeButton.addEventListener('click', () => {
  bgAudio.muted = !bgAudio.muted;
  volumeButton.src = bgAudio.muted ? 'assets/Volume-off.png' : 'assets/Volume-on.png';
  try { localStorage.setItem('bgMusicMuted', bgAudio.muted); } catch (e) {}
});

//google sign-in button

const GOOGLE_CLIENT_ID = '898335762947-8vavg6euu2rcq8ui2nel2n4pl2kl0g54.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:5500/oauth2callback.html';
const SCOPES = 'openid profile email';

function buildGoogleAuthUrl() {
  const base = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token', 
    scope: SCOPES,
    prompt: 'select_account'
  });
  return `${base}?${params.toString()}`;
}

function openAuthPopup(url, name = 'googleAuth', width = 500, height = 650) {
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  const opts = `width=${width},height=${height},top=${top},left=${left}`;
  const popup = window.open(url, name, opts);
  return new Promise((resolve, reject) => {
    if (!popup) return reject(new Error('Popup blocked'));
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        reject(new Error(''));
      }
    }, 500);
    function onMessage(e) {
      if (e.origin !== window.location.origin) return;
      clearInterval(timer);
      window.removeEventListener('message', onMessage);
      resolve(e.data);
    }
    window.addEventListener('message', onMessage);
  });
}

async function handleGoogleSignIn() {
  try {
    const authUrl = buildGoogleAuthUrl();
    const result = await openAuthPopup(authUrl);

    const hash = result.hash || '';
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');

    if (!accessToken) {
      console.warn('Auth result', result);
      return;
    }

    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch Google profile');
    const profile = await resp.json();

    console.log('Signed in user', profile);
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) playerNameInput.value = profile.given_name || profile.name || '';



    alert(`Signed in as ${profile.email || profile.name}`);
  } catch (err) {
    console.error('Google sign-in error', err);
  }
}

document.getElementById('google-signin').addEventListener('click', (e) => {
  e.preventDefault();
  handleGoogleSignIn();
});
