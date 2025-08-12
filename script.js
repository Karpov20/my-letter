// Эффект появления текста при скролле
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.letter p').forEach(p => {
    observer.observe(p);
});

// Прячем стрелку при скролле
const scrollDown = document.querySelector('.scroll-down');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        scrollDown.style.display = 'none';
    } else {
        scrollDown.style.display = 'block';
    }
});

// Эффект сердечек при клике
document.addEventListener('click', (e) => {
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.className = 'heart';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
});
