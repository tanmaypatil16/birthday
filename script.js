const pages = Array.from(document.querySelectorAll('.page'));
const pageById = new Map(pages.map(page => [page.id, page]));

const enterBtn = document.getElementById('enterBtn');
const bookShell = document.getElementById('bookShell');
const coverCard = document.getElementById('coverCard');
const ticketBtn = document.getElementById('ticketBtn');
const cakeBtn = document.getElementById('cakeBtn');
const celebrateBtn = document.getElementById('celebrateBtn');
const giftBtn = document.getElementById('giftBtn');
const reminderCard = document.getElementById('reminderCard');
const musicBtn = document.getElementById('musicBtn');
const musicLabel = musicBtn.querySelector('.music-label');
const envelope = document.getElementById('envelope');
const typedText = document.getElementById('typedText');
const collageSlots = [
  document.getElementById('galleryImageA'),
  document.getElementById('galleryImageB'),
  document.getElementById('galleryImageC'),
  document.getElementById('galleryImageD')
];
const bgMusic = document.getElementById('bgMusic');
const confettiCanvas = document.getElementById('confettiCanvas');
const cursorGlow = document.getElementById('cursorGlow');
const starsLayer = document.getElementById('stars');
const shootingStarsLayer = document.getElementById('shootingStars');

const LETTER_TEXT = `Dear Birthday Star,

Happy Birthday.

I hope this little universe makes you smile the way your kindness makes other people feel seen.

Even across screens and distance, some people still manage to feel bright, comforting, and unforgettable.

May this year bring you more peace, more laughter, more music, and more moments that feel exactly like you: soft, glowing, and full of life.

And because you are forever part of the BTS universe, may every dream you love find its way back to you beautifully.

Enjoy your special day, stay amazing, and keep shining.

With love,
Tanmay`;

const galleryCards = [
  {
    title: 'Happy Birthday',
    caption: 'A little collage made with love and soft purple light.',
    colors: ['#f4cad6', '#d88ca8', '#b85f88']
  },
  {
    title: 'Sweet Moments',
    caption: 'The small memories are often the most beautiful ones.',
    colors: ['#f8dec8', '#eab09e', '#c57c76']
  },
  {
    title: 'Best Days',
    caption: 'Warm smiles, cozy pictures, and a soft birthday mood.',
    colors: ['#eddcc6', '#d8b69a', '#b98b65']
  },
  {
    title: 'Forever Cute',
    caption: 'A scrapbook-style memory board for your special day.',
    colors: ['#efe4d6', '#dbc6b1', '#b89a83']
  }
];

const galleryImageFiles = [
  'asscets/images/galleryImageA.jpg',
  'asscets/images/WhatsApp Image 2025-10-06 at 11.49.27_2d7618e1.jpg',
  'asscets/images/WhatsApp Image 2025-10-06 at 11.49.27_c707128b.jpg',
  'asscets/images/WhatsApp Image 2025-10-06 at 11.49.27_c92bfa5b.jpg'
];

let typingRunId = 0;
let confettiFrame = null;
let confettiParticles = [];
let shootingTimer = null;
let musicEnabled = false;
let audioContext = null;
let masterGain = null;
let musicFade = null;
let currentPageId = 'landing';
let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let cursorFrame = null;
let parallaxFrame = null;
const reducedMotionMode = true;

const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCompactScreen = () => window.innerWidth <= 768 || isCoarsePointer;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextPaint() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

function showPage(target) {
  const pageId = typeof target === 'string' ? target : target.id;
  const nextPage = pageById.get(pageId);

  if (!nextPage) {
    return;
  }

  pages.forEach(page => page.classList.toggle('active', page === nextPage));
  currentPageId = pageId;
  document.body.classList.toggle('ticket-mode', pageId === 'ticket');

  if (pageId !== 'letterPage') {
    cancelTyping();
  }

  if (pageId === 'finalPage') {
    triggerConfettiBurst(180);
    startShootingStars();
  } else if (pageId !== 'galleryPage') {
    stopShootingStars();
  }
}

function cancelTyping() {
  typingRunId += 1;
}

async function typeLetter() {
  const runId = ++typingRunId;
  typedText.textContent = '';

  const characters = Array.from(LETTER_TEXT);
  const baseDelay = isCoarsePointer ? 1 : 2;

  for (const char of characters) {
    if (runId !== typingRunId) {
      return;
    }

    typedText.textContent += char;

    if (!isCoarsePointer) {
      await nextPaint();
    }

    let delay = baseDelay;
    if (char === ' ') {
      delay = 0;
    } else if (char === '\n') {
      delay = 4;
    } else if ('.!?'.includes(char)) {
      delay = 10;
    } else if (',;:'.includes(char)) {
      delay = 5;
    }

    await wait(delay);
  }

  if (runId !== typingRunId) {
    return;
  }

  await wait(isCoarsePointer ? 150 : 250);

  if (currentPageId === 'letterPage') {
    showPage('galleryPage');
  }
}

function buildCollageArt(card, index, slotIndex) {
  const [c1, c2, c3] = card.colors;
  const mobile = isCompactScreen();
  const angle = mobile ? [0, -1.5, 1.2, -0.6][slotIndex] : [-4, 2, -2, 3][slotIndex];
  const shiftX = mobile ? [0, 0, 0, 0][slotIndex] : [0, 10, -6, 6][slotIndex];
  const shiftY = mobile ? [0, 0, 0, 0][slotIndex] : [0, -12, 8, -6][slotIndex];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" preserveAspectRatio="none">
      <defs>
        <linearGradient id="base-${index}-${slotIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="60%" stop-color="${c2}" />
          <stop offset="100%" stop-color="${c3}" />
        </linearGradient>
        <radialGradient id="glow-${index}-${slotIndex}" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fff" stop-opacity=".45" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="700" fill="url(#base-${index}-${slotIndex})"/>
      <circle cx="180" cy="130" r="120" fill="url(#glow-${index}-${slotIndex})"/>
      <circle cx="720" cy="160" r="150" fill="#fff" fill-opacity=".12"/>
      <circle cx="690" cy="560" r="160" fill="#fff" fill-opacity=".08"/>
      <circle cx="180" cy="550" r="170" fill="#fff" fill-opacity=".09"/>
      <g transform="translate(${120 + shiftX},${100 + shiftY}) rotate(${angle})">
        <rect x="0" y="0" width="${mobile ? 320 : 250}" height="${mobile ? 220 : 180}" rx="14" fill="#fff" fill-opacity=".92"/>
        <rect x="14" y="14" width="${mobile ? 292 : 222}" height="${mobile ? 192 : 152}" rx="10" fill="url(#base-${index}-${slotIndex})"/>
        <text x="28" y="44" fill="#fff" fill-opacity=".9" font-size="22" font-family="Poppins, sans-serif" font-weight="700">Birthday</text>
        <text x="28" y="${mobile ? 104 : 96}" fill="#fff" fill-opacity=".95" font-size="${mobile ? 34 : 28}" font-family="Poppins, sans-serif" font-weight="700">${card.title}</text>
        <text x="28" y="${mobile ? 146 : 128}" fill="#fff" fill-opacity=".88" font-size="${mobile ? 16 : 15}" font-family="Poppins, sans-serif">${card.caption}</text>
      </g>
      <text x="${mobile ? 790 : 730}" y="${mobile ? 520 : 470}" fill="#fff" fill-opacity=".88" font-size="${mobile ? 86 : 70}" font-family="Poppins, sans-serif" text-anchor="middle">♥</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function updateCollageBoard() {
  collageSlots.forEach((img, index) => {
    if (!img) {
      return;
    }

    const card = galleryCards[index % galleryCards.length];
    const filePath = galleryImageFiles[index % galleryImageFiles.length];
    img.src = encodeURI(filePath);
    img.alt = card.title;
  });
}

function buildStarField() {
  if (reducedMotionMode || !starsLayer || starsLayer.childElementCount > 0) {
    return;
  }

  const count = isCompactScreen() ? 24 : 72;

  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'star-dot';
    star.style.setProperty('--x', `${Math.random() * 100}%`);
    star.style.setProperty('--y', `${Math.random() * 100}%`);
    star.style.setProperty('--size', `${1 + Math.random() * 2}px`);
    star.style.setProperty('--opacity', `${0.25 + Math.random() * 0.7}`);
    star.style.setProperty('--twinkle', `${2.8 + Math.random() * 5.5}s`);
    star.style.animationDelay = `${Math.random() * 6}s`;
    starsLayer.appendChild(star);
  }
}

function startMusic() {
  if (musicEnabled) {
    return;
  }

  if (isCoarsePointer) {
    musicLabel.textContent = 'Music On';
    musicBtn.setAttribute('aria-pressed', 'true');
    musicEnabled = true;
    return;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    musicLabel.textContent = 'Music Off';
    return;
  }

  if (!audioContext) {
    audioContext = new AudioCtor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioContext.destination);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;
    filter.connect(masterGain);

    const notes = [
      { frequency: 220, gain: 0.14 },
      { frequency: 277.18, gain: 0.1 },
      { frequency: 329.63, gain: 0.08 }
    ];

    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = note.frequency;

      const gain = audioContext.createGain();
      gain.gain.value = note.gain;

      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start();
    });
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  musicEnabled = true;
  musicLabel.textContent = 'Music On';
  musicBtn.setAttribute('aria-pressed', 'true');
  masterGain.gain.value = 0;
  fadeMusic(0.16, 700);
}

function stopMusic() {
  if (!musicEnabled) {
    return;
  }

  if (audioContext && masterGain) {
    fadeMusic(0, 400);
  }

  musicEnabled = false;
  musicLabel.textContent = 'Music Off';
  musicBtn.setAttribute('aria-pressed', 'false');
}

function fadeMusic(target, duration = 500) {
  if (!masterGain) {
    return;
  }

  window.clearInterval(musicFade);
  const start = masterGain.gain.value;
  const delta = target - start;
  const started = performance.now();

  musicFade = window.setInterval(() => {
    const progress = Math.min((performance.now() - started) / duration, 1);
    masterGain.gain.value = start + (delta * progress);
    if (progress >= 1) {
      window.clearInterval(musicFade);
      musicFade = null;
    }
  }, 16);
}

function buildConfettiParticle(originX, originY) {
  const colors = ['#9d4edd', '#c77dff', '#e0aaff', '#ffffff', '#f8e8ff'];
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 7;

  return {
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed * 0.85,
    vy: Math.sin(angle) * speed - 4,
    gravity: 0.13 + Math.random() * 0.04,
    drag: 0.986,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.24,
    hue: colors[Math.floor(Math.random() * colors.length)],
    life: 180 + Math.random() * 90,
    age: 0
  };
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  const ctx = confettiCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function renderConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiParticles = confettiParticles.filter(particle => {
    particle.age += 1;
    particle.vx *= particle.drag;
    particle.vy = (particle.vy + particle.gravity) * 0.998;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.hue;
    ctx.globalAlpha = Math.max(1 - (particle.age / particle.life), 0);
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return particle.age < particle.life && particle.y < window.innerHeight + 40;
  });

  if (confettiParticles.length > 0) {
    confettiFrame = requestAnimationFrame(renderConfetti);
  } else {
    confettiFrame = null;
  }
}

function triggerConfettiBurst(amount = 120) {
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.22;
  const burst = Array.from({ length: amount }, () => buildConfettiParticle(originX, originY));
  confettiParticles.push(...burst);

  if (!confettiFrame) {
    confettiFrame = requestAnimationFrame(renderConfetti);
  }
}

function spawnShootingStar() {
  if (reducedMotionMode || isReducedMotion) {
    return;
  }

  const star = document.createElement('div');
  star.className = 'shooting-star';
  star.style.left = `${Math.random() * 25}vw`;
  star.style.top = `${Math.random() * 35}vh`;
  star.style.animationDuration = `${0.9 + Math.random() * 0.5}s`;
  shootingStarsLayer.appendChild(star);

  star.addEventListener('animationend', () => star.remove(), { once: true });
}

function startShootingStars() {
  if (reducedMotionMode || shootingTimer || isCoarsePointer || isReducedMotion) {
    return;
  }

  shootingTimer = window.setInterval(() => {
    if (currentPageId === 'finalPage' || currentPageId === 'galleryPage') {
      spawnShootingStar();
    }
  }, 4200);
}

function stopShootingStars() {
  if (!shootingTimer) {
    return;
  }

  window.clearInterval(shootingTimer);
  shootingTimer = null;
  shootingStarsLayer.innerHTML = '';
}

function openEnvelope() {
  if (envelope.classList.contains('open')) {
    return;
  }

  envelope.classList.add('open');
  window.setTimeout(() => {
    if (currentPageId === 'envelopePage') {
      showPage('letterPage');
      typeLetter();
    }
  }, 900);
}

function handlePointerMove(event) {
  if (reducedMotionMode || isCoarsePointer) {
    return;
  }

  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;

  if (!cursorFrame) {
    cursorFrame = requestAnimationFrame(() => {
      cursorGlow.style.transform = `translate3d(${lastPointer.x}px, ${lastPointer.y}px, 0) translate(-50%, -50%)`;
      cursorFrame = null;
    });
  }

  if (!parallaxFrame) {
    parallaxFrame = requestAnimationFrame(() => {
      const xRatio = (lastPointer.x / window.innerWidth) - 0.5;
      const yRatio = (lastPointer.y / window.innerHeight) - 0.5;
      document.documentElement.style.setProperty('--parallax-x', String((xRatio * 8).toFixed(2)));
      document.documentElement.style.setProperty('--parallax-y', String((yRatio * 8).toFixed(2)));
      parallaxFrame = null;
    });
  }
}

function openScrapbook() {
  if (!isCoarsePointer) {
    startMusic();
  }

  if (bookShell) {
    bookShell.classList.add('is-opening');
  }

  window.setTimeout(() => {
    showPage('coverPage');
  }, 650);
}

enterBtn.addEventListener('click', openScrapbook);

bookShell.addEventListener('click', openScrapbook);

bookShell.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openScrapbook();
  }
});

coverCard.addEventListener('click', () => {
  showPage('ticket');
});

coverCard.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    coverCard.click();
  }
});

ticketBtn.addEventListener('click', () => {
  showPage('envelopePage');
});

ticketBtn.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    ticketBtn.click();
  }
});

envelope.addEventListener('click', openEnvelope);

envelope.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openEnvelope();
  }
});

cakeBtn.addEventListener('click', () => {
  showPage('cakePage');
});

celebrateBtn.addEventListener('click', () => {
  showPage('giftPage');
  triggerConfettiBurst(220);
});

giftBtn.addEventListener('click', () => {
  showPage('finalPage');
});

reminderCard.addEventListener('click', () => {
  reminderCard.classList.add('revealed');
  reminderCard.querySelector('.reminder-hint').textContent = 'Revealed';
});

reminderCard.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    reminderCard.click();
  }
});

musicBtn.addEventListener('click', () => {
  if (musicEnabled) {
    stopMusic();
  } else {
    startMusic();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    return;
  }

  if (currentPageId === 'landing' && event.key === 'Enter') {
    enterBtn.click();
    return;
  }

  if (currentPageId === 'coverPage' && event.key === 'Enter') {
    coverCard.click();
    return;
  }

  if (currentPageId === 'ticket' && event.key === 'Enter') {
    ticketBtn.click();
    return;
  }
});

if (!isCoarsePointer && !reducedMotionMode) {
  document.addEventListener('pointermove', handlePointerMove, { passive: true });
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
if (!reducedMotionMode) {
  buildStarField();
}
updateCollageBoard();
showPage('landing');

if (isCoarsePointer || reducedMotionMode) {
  cursorGlow.style.display = 'none';
}
