// Звёздное небо
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let stars = [];
let w, h;

function initStars() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5,
            d: Math.random() * 0.5
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
    moveStars();
}

function moveStars() {
    stars.forEach(s => {
        s.y += s.d;
        if (s.y > h) {
            s.x = Math.random() * w;
            s.y = 0;
        }
    });
}

function animateStars() {
    drawStars();
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();

// Плавное появление карточек
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// Прячем стрелку при скролле
const scrollDown = document.querySelector('.scroll-down');
scrollDown.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    scrollDown.style.display = window.scrollY > 50 ? 'none' : 'block';
});

// Сердечки при клике
document.addEventListener('click', (e) => {
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.className = 'heart';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
});
// === Музыка ===
const audio = document.getElementById('background-music');
const playBtn = document.getElementById('play-music');
const pauseBtn = document.getElementById('pause-music');
const volumeSlider = document.getElementById('volume-slider');
const musicControls = document.getElementById('music-controls');

// стартуем без звука (см. muted в <audio>)
audio.volume = 0;           
let desiredVolume = 0.7;    // ⬅️ целевая громкость ~70%
let fadeInterval = null;

// Пытаемся автоплейнуть сразу (muted-автоплей)
audio.play().catch(() => {});

// Разблокировка звука на первом взаимодействии пользователя
function unlockAudio() {
  clearInterval(fadeInterval);
  audio.muted = false;

  // плавный fade‑in к desiredVolume
  const step = 0.03;
  fadeInterval = setInterval(() => {
    audio.volume = Math.min(desiredVolume, audio.volume + step);
    if (audio.volume >= desiredVolume) clearInterval(fadeInterval);
  }, 100);

  audio.play().catch(() => {});
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'flex';

  // Снимаем одноразовые слушатели
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
  window.removeEventListener('scroll', unlockAudio);
}

// Триггеры: клик/тап, клавиша, СКРОЛЛ
window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });
window.addEventListener('scroll', unlockAudio, { once: true, passive: true });

// Кнопки play/pause
playBtn.addEventListener('click', () => {
  audio.play().then(unlockAudio).catch(() => {});
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
  pauseBtn.style.display = 'none';
  playBtn.style.display = 'flex';
});

// Ползунок громкости
volumeSlider.addEventListener('input', () => {
  desiredVolume = parseFloat(volumeSlider.value);
  if (!audio.muted && !audio.paused) audio.volume = desiredVolume;
});

// Индикатор прогресса (опционально)
audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / (audio.duration || 1)) * 100;
  document.documentElement.style.setProperty('--music-progress', `${progress}%`);
});


