// Плавное появление абзацев при прокрутке
const paragraphs = document.querySelectorAll('p');
window.addEventListener('scroll', () => {
    paragraphs.forEach(p => {
        const rect = p.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            p.classList.add('visible');
        }
    });
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
