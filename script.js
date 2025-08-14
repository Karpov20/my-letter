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
// === Музыка (универсальный мобильный + десктоп) ===
const audio = document.getElementById('background-music');
const playBtn = document.getElementById('play-music');
const pauseBtn = document.getElementById('pause-music');
const volumeSlider = document.getElementById('volume-slider');

let desiredVolume = 0.7;     // целевая громкость ~70%
let fadeInterval = null;
let unlocked = false;

// стартуем без звука — это единственный разрешённый автоплей
audio.volume = 0;
audio.muted = true;
audio.play().catch(() => {/* нормально: ждём жест */});

// универсальная разблокировка (снимет mute, поднимет громкость, запустит play)
function unlockAudio() {
  if (unlocked) return;
  unlocked = true;

  // снимаем mute и запускаем (если остановлен)
  audio.muted = false;
  audio.play().catch(() => {/* если пользователь сразу нажал паузу — ок */});

  // плавный подъём громкости до desiredVolume
  clearInterval(fadeInterval);
  const step = 0.05;  // чем больше, тем быстрее набирает звук
  fadeInterval = setInterval(() => {
    audio.volume = Math.min(desiredVolume, (audio.volume || 0) + step);
    if (audio.volume >= desiredVolume) clearInterval(fadeInterval);
  }, 100);

  // обновляем UI
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'flex';

  // снимаем все одноразовые слушатели
  removeUnlockListeners();
}

function addUnlockListeners() {
  // pointerdown покрывает мышь и большинство тачей; на iOS добавим touch*
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  // для мобилок: первый тап/движение пальцем/прокрутка колесом
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  window.addEventListener('touchmove', unlockAudio, { once: true, passive: true });
  // некоторые браузеры засчитывают wheel/scroll как жест
  window.addEventListener('wheel', unlockAudio, { once: true, passive: true });
  window.addEventListener('scroll', unlockAudio, { once: true, passive: true });
}

function removeUnlockListeners() {
  window.removeEventListener('pointerdown', unlockAudio, { passive: true });
  window.removeEventListener('keydown', unlockAudio);
  window.removeEventListener('touchstart', unlockAudio, { passive: true });
  window.removeEventListener('touchmove', unlockAudio, { passive: true });
  window.removeEventListener('wheel', unlockAudio, { passive: true });
  window.removeEventListener('scroll', unlockAudio, { passive: true });
}

addUnlockListeners();

// Кнопки play/pause
playBtn.addEventListener('click', () => {
  desiredVolume = parseFloat(volumeSlider.value || '0.7');
  unlockAudio(); // снимет mute и поднимет громкость
  audio.play().catch(()=>{});
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

// На некоторых устройствах вкладка могла «уснуть» — при возврате попробуем продолжить
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && unlocked && audio.paused) {
    audio.play().catch(()=>{});
  }
});
// === Воспоминания: модалка и сохранение в localStorage ===
const memoryFab = document.getElementById('memory-fab');
const memoryBackdrop = document.getElementById('memory-backdrop');
const memoryDialog = document.getElementById('memory-dialog');
const memoryText = document.getElementById('memory-text');
const memorySave = document.getElementById('memory-save');
const memoryCancel = document.getElementById('memory-cancel');
const toast = document.getElementById('toast');

function openMemoryDialog() {
  memoryBackdrop.hidden = false;
  memoryDialog.hidden = false;
  // задержка, чтобы анимации успели примениться
  setTimeout(() => memoryText.focus(), 30);
  // запрет прокрутки фона (опционально)
  document.body.style.overflow = 'hidden';
}
function closeMemoryDialog() {
  memoryBackdrop.hidden = true;
  memoryDialog.hidden = true;
  document.body.style.overflow = '';
  memoryText.value = '';
}

function showToast(msg = 'Воспоминание сохранено') {
  toast.textContent = msg;
  toast.hidden = false;
  // рендер тик
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => (toast.hidden = true), 200);
    }, 1800);
  });
}

function saveMemory() {
  const text = (memoryText.value || '').trim();
  if (!text) {
    showToast('Пустое воспоминание не сохранено');
    return;
  }
  const key = 'memories';
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push({ text, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(current));
  closeMemoryDialog();
  showToast('Воспоминание сохранено');
}

memoryFab.addEventListener('click', openMemoryDialog);
memoryBackdrop.addEventListener('click', closeMemoryDialog);
memoryCancel.addEventListener('click', closeMemoryDialog);
memorySave.addEventListener('click', saveMemory);
document.addEventListener('keydown', (e) => {
  if (!memoryDialog.hidden && e.key === 'Escape') closeMemoryDialog();
  if (!memoryDialog.hidden && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') saveMemory();
});

// === Секретное сообщение: показать при полной прокрутке ===
const secret = document.getElementById('secret');
let secretShown = false;
function checkBottomReveal() {
  if (secretShown) return;
  const bottom = window.scrollY + window.innerHeight;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const threshold = 4; // пикселей от низа
  if (bottom >= docHeight - threshold) {
    secretShown = true;
    // немного «драматургии» — задержка появления
    setTimeout(() => secret.classList.add('visible'), 450);
    // можно запомнить, что показывали
    try { localStorage.setItem('secretShown', '1'); } catch {}
  }
}
window.addEventListener('scroll', checkBottomReveal, { passive: true });
window.addEventListener('resize', checkBottomReveal);
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('secretShown') === '1') {
    // если уже был показан ранее — можно показать сразу
    secret.classList.add('visible');
  } else {
    checkBottomReveal();
  }
});


