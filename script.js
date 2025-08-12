// Эффект появления текста при скролле
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.letter p').forEach(p => {
    observer.observe(p);
});

// Прячем стрелку при скролле
const scrollDown = document.querySelector('.scroll-down');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        scrollDown.style.opacity = '0';
        setTimeout(() => scrollDown.style.display = 'none', 300);
    } else {
        scrollDown.style.display = 'block';
        setTimeout(() => scrollDown.style.opacity = '0.8', 10);
    }
});

// Плавный скролл при клике на стрелку
scrollDown.addEventListener('click', () => {
    window.scrollTo({
        top: document.querySelector('.letter').offsetTop - 50,
        behavior: 'smooth'
    });
});

// Эффект сердечек при клике
document.addEventListener('click', (e) => {
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.className = 'heart';
    heart.style.left = (e.clientX - 12) + 'px';
    heart.style.top = (e.clientY - 12) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
});

// Плавная прокрутка при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 500);
});
