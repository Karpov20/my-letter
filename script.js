// =======================
//  ЗВЁЗДНОЕ НЕБО
// =======================
(() => {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
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
})();


// =======================
//  ПОЯВЛЕНИЕ КАРТОЧЕК
// =======================
(() => {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
})();


// =======================
//  КНОПКА СКРОЛЛА ВНИЗ
// =======================
(() => {
  const scrollDown = document.querySelector('.scroll-down');
  if (!scrollDown) return;

  scrollDown.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    scrollDown.style.display = window.scrollY > 50 ? 'none' : 'block';
  }, { passive: true });
})();


// =======================
//  СЕРДЕЧКИ ПРИ КЛИКЕ
// =======================
(() => {
  document.addEventListener('click', (e) => {
    // не рисуем сердечко поверх кнопок и диалогов
    if ((e.target && (e.target.closest('#music-controls') ||
                      e.target.closest('.memory-dialog') ||
                      e.target.closest('#answers-panel')))) return;

    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.className = 'heart';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
  });
})();


// =======================
//  МУЗЫКА (мобилки + десктоп)
// =======================
(() => {
  const audio = document.getElementById('background-music');
  const playBtn = document.getElementById('play-music');
  const pauseBtn = document.getElementById('pause-music');
  const volumeSlider = document.getElementById('volume-slider');

  if (!audio) return;

  let desiredVolume = parseFloat(volumeSlider?.value || '0.7'); // ~70%
  let fadeInterval = null;
  let unlocked = false;

  // стартуем без звука — единственный надёжный автоплей
  audio.volume = 0;
  audio.muted = true;
  audio.play().catch(() => {/* ждём жест */});

  function removeUnlockListeners() {
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown',   unlockAudio);
    window.removeEventListener('touchstart',unlockAudio);
    window.removeEventListener('touchmove', unlockAudio);
    window.removeEventListener('wheel',     unlockAudio);
    window.removeEventListener('scroll',    unlockAudio);
  }

  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;

    audio.muted = false;
    audio.play().catch(()=>{});

    clearInterval(fadeInterval);
    const step = 0.05;
    fadeInterval = setInterval(() => {
      audio.volume = Math.min(desiredVolume, (audio.volume || 0) + step);
      if (audio.volume >= desiredVolume) clearInterval(fadeInterval);
    }, 100);

    if (playBtn && pauseBtn) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'flex';
    }

    removeUnlockListeners();
  }

  // триггеры разблокировки
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown',     unlockAudio, { once: true });
  window.addEventListener('touchstart',  unlockAudio, { once: true, passive: true });
  window.addEventListener('touchmove',   unlockAudio, { once: true, passive: true });
  window.addEventListener('wheel',       unlockAudio, { once: true, passive: true });
  window.addEventListener('scroll',      unlockAudio, { once: true, passive: true });

  // кнопки
  playBtn?.addEventListener('click', () => {
    desiredVolume = parseFloat(volumeSlider?.value || '0.7');
    unlockAudio();
    audio.play().catch(()=>{});
  });

  pauseBtn?.addEventListener('click', () => {
    audio.pause();
    if (playBtn && pauseBtn) {
      pauseBtn.style.display = 'none';
      playBtn.style.display = 'flex';
    }
  });

  // громкость
  volumeSlider?.addEventListener('input', () => {
    desiredVolume = parseFloat(volumeSlider.value);
    if (!audio.muted && !audio.paused) audio.volume = desiredVolume;
  });

  // возврат во вкладку
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && unlocked && audio.paused) {
      audio.play().catch(()=>{});
    }
  });
})();


// =======================
//  МОДАЛКА "ОСТАВИТЬ ВОСПОМИНАНИЕ"
// =======================
(() => {
  const memoryFab = document.getElementById('memory-fab');
  const memoryBackdrop = document.getElementById('memory-backdrop');
  const memoryDialog = document.getElementById('memory-dialog');
  const memoryText = document.getElementById('memory-text');
  const memorySave = document.getElementById('memory-save');
  const memoryCancel = document.getElementById('memory-cancel');
  const toast = document.getElementById('toast');

  function openMemoryDialog() {
    if (!memoryBackdrop || !memoryDialog) return;
    memoryBackdrop.hidden = false;
    memoryDialog.hidden = false;
    setTimeout(() => memoryText?.focus(), 30);
    document.body.style.overflow = 'hidden';
  }

  function closeMemoryDialog() {
    if (!memoryBackdrop || !memoryDialog) return;
    memoryBackdrop.hidden = true;
    memoryDialog.hidden = true;
    document.body.style.overflow = '';
    if (memoryText) memoryText.value = '';
  }

  function showToast(msg = 'Воспоминание сохранено') {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => (toast.hidden = true), 200);
      }, 1800);
    });
  }

  function readMemories(){ try {return JSON.parse(localStorage.getItem('memories') || '[]');} catch {return [];} }
  function writeMemories(arr){ try { localStorage.setItem('memories', JSON.stringify(arr)); } catch {} }

  function saveMemory() {
    const text = (memoryText?.value || '').trim();
    if (!text) { showToast('Пустое воспоминание не сохранено'); return; }
    const current = readMemories();
    current.push({ text, ts: Date.now() });
    writeMemories(current);
    closeMemoryDialog();
    showToast('Воспоминание сохранено');
    // если панель ответов открыта — перерисуем (функция объявлена ниже, может быть undefined)
    if (window.renderMemories && !document.getElementById('answers-panel')?.hidden) {
      window.renderMemories();
    }
  }

  // гарантированно закрываем модалку при загрузке, чтобы не блокировала скролл
  document.addEventListener('DOMContentLoaded', () => {
    if (memoryBackdrop) memoryBackdrop.hidden = true;
    if (memoryDialog) memoryDialog.hidden = true;
    document.body.style.overflow = '';
  });

  memoryFab?.addEventListener('click', openMemoryDialog);
  memoryBackdrop?.addEventListener('click', closeMemoryDialog);
  memoryCancel?.addEventListener('click', closeMemoryDialog);
  memorySave?.addEventListener('click', saveMemory);

  document.addEventListener('keydown', (e) => {
    if (!memoryDialog || memoryDialog.hidden) return;
    if (e.key === 'Escape') closeMemoryDialog();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') saveMemory();
  });

  // Экспортируем некоторые функции для панели ответов
  window.__memUtils = { readMemories, writeMemories, showToast };
})();


// =======================
//  ПАНЕЛЬ "ОТВЕТЫ" (список сохранённых)
// =======================
(() => {
  const answersFab    = document.getElementById('answers-fab');
  const answersPanel  = document.getElementById('answers-panel');
  const answersClose  = document.getElementById('answers-close');
  const answersClear  = document.getElementById('answers-clear');
  const answersExport = document.getElementById('answers-export');
  const memoriesList  = document.getElementById('memories-list');

  if (!answersPanel) return;

  const { readMemories, writeMemories, showToast } = window.__memUtils || {};

  function fmtDate(ts){ return new Date(ts).toLocaleString(); }

  function renderMemories() {
    if (!memoriesList || !readMemories) return;
    const items = readMemories().slice().reverse();
    memoriesList.innerHTML = '';
    if (!items.length){
      const li = document.createElement('li');
      li.textContent = 'Пока пусто. Оставь первое воспоминание.';
      memoriesList.appendChild(li);
      return;
    }
    for (const m of items){
      const li = document.createElement('li');
      const t  = document.createElement('time'); t.textContent = fmtDate(m.ts);
      const p  = document.createElement('p');    p.textContent = m.text;

      const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px';
      const del = document.createElement('button'); del.className='btn btn-secondary'; del.textContent='Удалить';
      del.addEventListener('click', () => {
        const all = readMemories();
        const idx = all.findIndex(x => x.ts === m.ts && x.text === m.text);
        if (idx > -1){ all.splice(idx,1); writeMemories(all); renderMemories(); showToast?.('Удалено'); }
      });

      row.appendChild(del);
      li.appendChild(t); li.appendChild(p); li.appendChild(row);
      memoriesList.appendChild(li);
    }
  }
  // сделаем доступной из saveMemory()
  window.renderMemories = renderMemories;

  function openAnswers(){
    answersPanel.hidden = false;
    requestAnimationFrame(()=>answersPanel.classList.add('open'));
  }
  function closeAnswers(){
    answersPanel.classList.remove('open');
    setTimeout(()=> answersPanel.hidden = true, 250);
  }

  answersFab?.addEventListener('click', () => { renderMemories(); openAnswers(); });
  answersClose?.addEventListener('click', closeAnswers);
  answersPanel.addEventListener('click', (e) => {
    if (e.target === answersPanel) closeAnswers();
  });

  answersClear?.addEventListener('click', () => {
    if (!readMemories || !writeMemories) return;
    if (confirm('Точно удалить все воспоминания?')) {
      localStorage.removeItem('memories');
      renderMemories();
      showToast?.('Очищено');
    }
  });

  answersExport?.addEventListener('click', () => {
    if (!readMemories) return;
    const items = readMemories();
    if (!items.length) return showToast?.('Нечего экспортировать');
    const text = items.map(m => `[${fmtDate(m.ts)}]\n${m.text}\n`).join('\n');
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'memories.txt';
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  });
})();


// =======================
//  СЕКРЕТНОЕ СООБЩЕНИЕ (в самом конце)
// =======================
(() => {
  const secret = document.getElementById('secret');
  if (!secret) return;

  let secretShown = false;

  function checkBottomReveal() {
    if (secretShown) return;
    const bottom = window.scrollY + window.innerHeight;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const threshold = 4; // пиксели до низа
    if (bottom >= docHeight - threshold) {
      secretShown = true;
      setTimeout(() => secret.classList.add('visible'), 450); // мягкая задержка
      try { localStorage.setItem('secretShown', '1'); } catch {}
    }
  }

  window.addEventListener('scroll', checkBottomReveal, { passive: true });
  window.addEventListener('resize', checkBottomReveal);
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('secretShown') === '1') {
      secret.classList.add('visible');
    } else {
      checkBottomReveal();
    }
  });
})();
