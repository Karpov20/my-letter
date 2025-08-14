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
// Добавьте в script.js
// Элементы управления музыкой
const audio = document.getElementById('background-music');
const playBtn = document.getElementById('play-music');
const pauseBtn = document.getElementById('pause-music');
const volumeSlider = document.getElementById('volume-slider');

// Автовоспроизведение с задержкой (для обхода ограничений браузеров)
setTimeout(() => {
  audio.volume = 0.3;
  audio.play().catch(e => console.log("Автовоспроизведение не разрешено:", e));
}, 2000);

// Обработчики кнопок
playBtn.addEventListener('click', () => {
  audio.play();
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'flex';
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
  pauseBtn.style.display = 'none';
  playBtn.style.display = 'flex';
});

// Регулировка громкости
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

// Индикатор проигрывания
audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  document.documentElement.style.setProperty('--music-progress', `${progress}%`);
});

// Показ/скрытие элементов управления при наведении
const musicControls = document.getElementById('music-controls');
musicControls.addEventListener('mouseenter', () => {
  musicControls.classList.add('expanded');
});

musicControls.addEventListener('mouseleave', () => {
  musicControls.classList.remove('expanded');
});
