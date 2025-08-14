// ======================= ЗВЁЗДНОЕ НЕБО =======================
(() => {
  const canvas = document.getElementById('stars'); if (!canvas) return;
  const ctx = canvas.getContext('2d'); let stars = []; let w, h;
  function initStars(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight;
    stars = Array.from({length:200}, ()=>({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.5, d:Math.random()*0.5 }));
  }
  function draw(){ ctx.clearRect(0,0,w,h); ctx.fillStyle="white";
    for (const s of stars){ ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); s.y += s.d; if (s.y>h){ s.x=Math.random()*w; s.y=0; } }
    requestAnimationFrame(draw);
  }
  addEventListener('resize', initStars); initStars(); draw();
})();

// ==================== КНОПКА СКРОЛЛА И МУЗЫКА ====================
(() => {
  const btn = document.querySelector('.scroll-down');
  const audio = document.getElementById('background-music');
  const playBtn = document.getElementById('play-music');
  const pauseBtn = document.getElementById('pause-music');
  const volume = document.getElementById('volume-slider');

  let unlocked = false;
  let desiredVolume = parseFloat(volume?.value || '0.7');

  function unlockAudio() {
    if (unlocked || !audio) return;
    unlocked = true;
    audio.muted = false;
    audio.volume = 0;
    audio.play().catch(()=>{});
    const fade = setInterval(() => {
      audio.volume = Math.min(desiredVolume, (audio.volume || 0) + 0.06);
      if (audio.volume >= desiredVolume) clearInterval(fade);
    }, 90);
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
  }
  window.unlockAudio = unlockAudio;

  btn?.addEventListener('click', () => {
    unlockAudio();
    scrollTo({ top: innerHeight, behavior: 'smooth' });
  });

  addEventListener('scroll', unlockAudio, { passive: true });
  playBtn?.addEventListener('click', unlockAudio);
  pauseBtn?.addEventListener('click', () => { audio.pause(); playBtn.style.display = 'flex'; pauseBtn.style.display = 'none'; });
  volume?.addEventListener('input', () => { desiredVolume = parseFloat(volume.value); audio.volume = desiredVolume; });
})();

// =================== КАРТОЧКИ И АНИМАЦИЯ ПО СКРОЛЛУ ===================
(() => {
  const cards = document.querySelectorAll('.card');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('visible'); } });
  }, { threshold:0.2 });
  cards.forEach(c=>io.observe(c));
})();

// ================== МОДАЛКА ОТПРАВКИ В GOOGLE SHEET ==================
(() => {
  const fab = document.getElementById('memory-fab');
  const backdrop = document.getElementById('memory-backdrop');
  const dialog = document.getElementById('memory-dialog');
  const text = document.getElementById('memory-text');
  const save = document.getElementById('memory-save');
  const cancel = document.getElementById('memory-cancel');
  const toast = document.getElementById('toast');

  function open(){ backdrop.hidden=false; dialog.hidden=false; document.body.style.overflow='hidden'; setTimeout(()=>text?.focus(),30); }
  function close(){ backdrop.hidden=true; dialog.hidden=true; document.body.style.overflow=''; text.value=''; }
  function showToast(msg='Сохранено'){ toast.textContent = msg; toast.hidden = false; requestAnimationFrame(() => {
    toast.classList.add('show'); setTimeout(() => {
      toast.classList.remove('show'); setTimeout(() => toast.hidden = true, 300);
    }, 2000);
  }); }

  fab?.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
  cancel?.addEventListener('click', close);
  save?.addEventListener('click', async () => {
    const val = text.value.trim(); if (!val) return;
    try {
      await fetch('https://script.google.com/macros/s/AKfycbwmauV2pqqNiGcKE_527aoDZvj6bJHYhYKJwEhI3XziF0HbmDrl9as07qt-nNlONbCq/exec', {
        method: 'POST', body: JSON.stringify({ text: val }), mode: 'no-cors'
      });
      showToast(); close();
    } catch { showToast('Ошибка при отправке'); }
  });
})();

// ================== ГОСТЕВАЯ КНИГА (CSV из Sheets) ==================
(() => {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnmT6oQkz1fQqqid83Ytudk0ODyUZtVaUwckzx_sucV-MPhVANDqN5TE4sX9PAuE-w1JLIa--RbgbQ/pub?output=csv";
  const wrap = document.getElementById('guestbook');
  const list = document.getElementById('guestbook-entries');
  if (!wrap || !list) return;

  fetch(url).then(r => r.text()).then(csv => {
    const rows = csv.trim().split(/\r?\n/).map(line => line.split(',').map(cell => cell.trim()));
    const head = rows.shift();
    const iTime = head.findIndex(h => /время|timestamp/i.test(h));
    const iText = head.findIndex(h => /сообщ|text|message/i.test(h));
    list.innerHTML = '';
    rows.reverse().forEach(r => {
      const when = iTime >= 0 ? r[iTime] : '';
      const msg  = iText >= 0 ? r[iText] : r.join(', ');
      const div = document.createElement('div');
      div.className = 'entry';
      div.innerHTML = `<time>${when}</time><p>${msg}</p>`;
      list.appendChild(div);
    });
    wrap.hidden = false;
  });
})();

// ================ СЕКРЕТНОЕ СООБЩЕНИЕ =================
(() => {
  const secret = document.getElementById('secret');
  if (!secret) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => secret.classList.add('visible'), 600);
        io.disconnect();
      }
    });
  }, { threshold: 0.5 });
  io.observe(secret);
})();
