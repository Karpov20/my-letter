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

// =================== КАРТОЧКИ + запуск музыки =================
(() => {
  const cards = document.querySelectorAll('.card'); if (!cards.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('visible');
        if (window.unlockAudio) window.unlockAudio();
      }
    });
  }, { threshold:0.2 });
  cards.forEach(c=>io.observe(c));
})();

// ==================== КНОПКА СКРОЛЛА ВНИЗ ====================
(() => {
  const btn = document.querySelector('.scroll-down'); if (!btn) return;
  btn.addEventListener('click', ()=>{ if (window.unlockAudio) window.unlockAudio(); scrollTo({top:innerHeight, behavior:'smooth'}); });
  addEventListener('scroll', ()=>{ btn.style.display = scrollY>50 ? 'none' : 'block'; }, { passive:true });
})();

// =================== МУЗЫКА (скролл + разблокировка) ===================
(() => {
  const audio = document.getElementById('background-music');
  const playBtn = document.getElementById('play-music');
  const pauseBtn = document.getElementById('pause-music');
  const volume = document.getElementById('volume-slider');
  if (!audio) return;

  let desired = parseFloat(volume?.value || '0.7');
  let fade = null; let unlocked = false;

  audio.volume = 0; audio.muted = true;
  audio.play().catch(()=>{});

  function removeUnlock(){
    ['pointerdown','pointerup','keydown','touchstart','touchend','touchmove','wheel','scroll']
      .forEach(ev=> removeEventListener(ev, unlockAudio));
  }

  function unlockAudio(){
    if (unlocked) return; unlocked = true;
    audio.muted = false; audio.play().catch(()=>{});
    clearInterval(fade);
    fade = setInterval(()=>{
      audio.volume = Math.min(desired, (audio.volume || 0)+0.06);
      if (audio.volume >= desired) clearInterval(fade);
    }, 90);
    if (playBtn && pauseBtn){ playBtn.style.display='none'; pauseBtn.style.display='flex'; }
    removeUnlock();
  }
  window.unlockAudio = unlockAudio;

  ['pointerdown','pointerup','keydown','touchstart','touchend','touchmove','wheel','scroll']
    .forEach(ev=> addEventListener(ev, unlockAudio, { once:true, passive:true }));

  playBtn?.addEventListener('click', ()=>{ desired=parseFloat(volume?.value||'0.7'); unlockAudio(); audio.play().catch(()=>{}); });
  pauseBtn?.addEventListener('click', ()=>{ audio.pause(); if (playBtn&&pauseBtn){ pauseBtn.style.display='none'; playBtn.style.display='flex'; } });
  volume?.addEventListener('input', ()=>{ desired=parseFloat(volume.value); if (!audio.muted && !audio.paused) audio.volume = desired; });

  document.addEventListener('visibilitychange', ()=>{ if (!document.hidden && unlocked && audio.paused) audio.play().catch(()=>{}); });
})();

// =================== СЕКРЕТНОЕ СООБЩЕНИЕ ===================
(() => {
  const secret = document.getElementById('secret'); if (!secret) return;
  if (localStorage.getItem('secretShown') === '1'){ secret.classList.add('visible'); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        setTimeout(()=>secret.classList.add('visible'), 450);
        try{ localStorage.setItem('secretShown','1'); }catch{}
        io.disconnect();
      }
    });
  }, { threshold:0.6 });
  io.observe(secret);
})();

// ================== ГОСТЕВАЯ ИЗ GOOGLE SHEETS (CSV) ==================
(() => {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnmT6oQkz1fQqqid83Ytudk0ODyUZtVaUwckzx_sucV-MPhVANDqN5TE4sX9PAuE-w1JLIa--RbgbQ/pub?output=csv";
  const wrap = document.getElementById('guestbook');
  const list = document.getElementById('guestbook-entries');
  if (!url || !wrap || !list) return;

  wrap.hidden = false;

  fetch(url).then(r=>r.text()).then(csv=>{
    const rows = csv.trim().split(/\r?\n/).map(line=>line.split(',').map(c=>c.trim()));
    const head = rows.shift() || [];
    const iTime = head.findIndex(h=>/time|время|timestamp/i.test(h));
    const iText = head.findIndex(h=>/text|сообщ|message|ответ/i.test(h));
    list.innerHTML='';
    rows.reverse().forEach(r=>{
      const when = iTime>-1 ? r[iTime] : '';
      const msg  = iText>-1 ? r[iText] : r.join(' – ');
      const div = document.createElement('div');
      div.className='entry';
      div.innerHTML = `<time>${when}</time><p>${msg}</p>`;
      list.appendChild(div);
    });
  }).catch(()=>{ list.innerHTML = '<div class="entry">Не удалось загрузить гостевую ленту.</div>'; });
})();

// ============== ФОРМА «Оставить воспоминание» ===============
(() => {
  const fab = document.getElementById('memory-fab');
  const backdrop = document.getElementById('memory-backdrop');
  const dialog = document.getElementById('memory-dialog');
  const text = document.getElementById('memory-text');
  const save = document.getElementById('memory-save');
  const cancel = document.getElementById('memory-cancel');
  const toast = document.getElementById('toast');

  const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwmauV2pqqNiGcKE_527aoDZvj6bJHYhYKJwEhI3XziF0HbmDrl9as07qt-nNlONbCq/exec";

  function open(){ backdrop.hidden=false; dialog.hidden=false; setTimeout(()=>text?.focus(),30); document.body.style.overflow='hidden'; }
  function close(){ backdrop.hidden=true; dialog.hidden=true; document.body.style.overflow=''; text.value=''; }
  function showToast(msg='Воспоминание сохранено'){ toast.textContent=msg; toast.hidden=false; requestAnimationFrame(()=>{ toast.classList.add('show'); setTimeout(()=>{ toast.classList.remove('show'); setTimeout(()=>toast.hidden=true,200); },1800); }); }

  function saveMemory(){
    const message = (text?.value || '').trim();
    if (!message) return showToast('Пустое воспоминание не сохранено');

    fetch(SHEET_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message })
    }).then(()=>{
      showToast('Сохранено!');
      close();
    }).catch(()=>{
      showToast('Ошибка отправки');
    });
  }

  fab?.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
  cancel?.addEventListener('click', close);
  save?.addEventListener('click', saveMemory);
  document.addEventListener('keydown', e=>{ if (!dialog || dialog.hidden) return; if (e.key==='Escape') close(); if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='enter') saveMemory(); });
})();
