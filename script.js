// Создаем звёздное небо
        function createStars() {
            const starsContainer = document.getElementById('stars');
            const starsCount = 200;
            
            for (let i = 0; i < starsCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Случайные параметры для звезды
                const size = Math.random() * 2;
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const opacity = 0.1 + Math.random() * 0.9;
                const duration = 3 + Math.random() * 7;
                const delay = Math.random() * 5;
                
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${posX}%`;
                star.style.top = `${posY}%`;
                star.style.opacity = opacity;
                star.style.animationDuration = `${duration}s`;
                star.style.animationDelay = `${delay}s`;
                
                starsContainer.appendChild(star);
            }
        }

        // Создаем падающие лепестки
        function createPetals() {
            const petalsContainer = document.getElementById('petals');
            const petalCount = 15;
            const petalTypes = 5;
            
            for (let i = 0; i < petalCount; i++) {
                const petal = document.createElement('div');
                petal.className = 'petal';
                
                // Случайные параметры для лепестка
                const size = 20 + Math.random() * 30;
                const posX = Math.random() * 100;
                const duration = 10 + Math.random() * 20;
                const delay = Math.random() * 15;
                const rotation = Math.random() * 360;
                const petalType = Math.floor(Math.random() * petalTypes) + 1;
                const randomX = Math.random() * 2 - 1; // От -1 до 1
                
                petal.style.width = `${size}px`;
                petal.style.height = `${size}px`;
                petal.style.left = `${posX}%`;
                petal.style.backgroundImage = `url('https://www.transparenttextures.com/patterns/soft-circle-pink.png')`;
                petal.style.animationDuration = `${duration}s`;
                petal.style.animationDelay = `${delay}s`;
                petal.style.setProperty('--random-x', randomX);
                
                petalsContainer.appendChild(petal);
            }
        }

        // Плавное появление текста при скролле
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
scrollDown.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});

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
