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
                setTimeout(() => scrollDown.style.opacity = '1', 10);
            }
            
            // Показываем/скрываем кнопку "наверх"
            const backToTop = document.getElementById('backToTop');
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // Плавный скролл при клике на стрелку вниз
        scrollDown.addEventListener('click', () => {
            window.scrollTo({
                top: document.querySelector('.letter').offsetTop - 50,
                behavior: 'smooth'
            });
        });

        // Плавный скролл при клике на кнопку "наверх"
        document.getElementById('backToTop').addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Эффект чернильных клякс при клике
        document.addEventListener('click', (e) => {
            const inkBlot = document.createElement('div');
            inkBlot.className = 'ink-blot';
            
            // Случайные параметры для кляксы
            const size = 50 + Math.random() * 100;
            const colors = ['#e94584', '#0f3460', '#53354a', '#ffc107'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            inkBlot.style.width = `${size}px`;
            inkBlot.style.height = `${size}px`;
            inkBlot.style.backgroundColor = color;
            inkBlot.style.borderRadius = `${50 + Math.random() * 50}%`;
            inkBlot.style.left = `${e.clientX - size/2}px`;
            inkBlot.style.top = `${e.clientY - size/2}px`;
            
            document.body.appendChild(inkBlot);
            
            // Удаляем кляксу через некоторое время
            setTimeout(() => {
                inkBlot.style.opacity = '0';
                setTimeout(() => inkBlot.remove(), 1000);
            }, 3000);
        });

        // Инициализация при загрузке
        document.addEventListener('DOMContentLoaded', () => {
            createStars();
            createPetals();
            
            // Плавное появление стрелки вниз
            setTimeout(() => {
                scrollDown.style.opacity = '1';
            }, 1500);
        });
