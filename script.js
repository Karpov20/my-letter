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

// ===================== СЕРДЕЧКИ ПРИ КЛИКЕ ====================
(() => {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#music-controls, .memory-dialog, #answers-panel, .fab-dock')) return;
    const heart = document.createElement('div');
    heart.textContent = '❤️'; heart.className = 'heart';
    heart.style.left = e.clientX + 'px'; heart.style.top = e.clientY + 'px';
    heart.style.position = 'absolute'; heart.style.pointerEvents = 'none';
    heart.style.transform = 'translate(-50%, -50%) scale(1)';
    heart.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
    heart.style.opacity = '1';
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = 'translate(-50%, -50%) scale(2)';
      heart.style.opacity = '0';
    });
    setTimeout(() => heart.remove(), 1600);
  });
})();

// =================== МУЗЫКА (автозапуск при скролле) =================
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

  addEventListener('scroll', unlockAudio, { once:true, passive:true });
  addEventListener('pointerdown', unlockAudio, { once:true, passive:true });
  addEventListener('touchstart', unlockAudio, { once:true, passive:true });

  playBtn?.addEventListener('click', ()=>{ desired=parseFloat(volume?.value||'0.7'); unlockAudio(); audio.play().catch(()=>{}); });
  pauseBtn?.addEventListener('click', ()=>{ audio.pause(); if (playBtn&&pauseBtn){ pauseBtn.style.display='none'; playBtn.style.display='flex'; } });
  volume?.addEventListener('input', ()=>{ desired=parseFloat(volume.value); if (!audio.muted && !audio.paused) audio.volume = desired; });
})();

// ========== МОДАЛКА «Оставить воспоминание» + localStorage + Sheets ==========
(() => {
  const fab = document.getElementById('memory-fab');
  const backdrop = document.getElementById('memory-backdrop');
  const dialog = document.getElementById('memory-dialog');
  const text = document.getElementById('memory-text');
  const save = document.getElementById('memory-save');
  const cancel = document.getElementById('memory-cancel');
  const toast = document.getElementById('toast');
  const answersBtn = document.getElementById('answers-fab');

  function open(){ if (!backdrop||!dialog) return; backdrop.hidden=false; dialog.hidden=false; setTimeout(()=>text?.focus(),30); document.body.style.overflow='hidden'; }
  function close(){ if (!backdrop||!dialog) return; backdrop.hidden=true; dialog.hidden=true; document.body.style.overflow=''; if (text) text.value=''; }
  function showToast(msg='Воспоминание сохранено'){ if (!toast) return; toast.textContent=msg; toast.hidden=false; requestAnimationFrame(()=>{ toast.classList.add('show'); setTimeout(()=>{ toast.classList.remove('show'); setTimeout(()=>toast.hidden=true,200); },1800); }); }
  function read(){ try { return JSON.parse(localStorage.getItem('memories')||'[]'); } catch { return []; } }
  function write(arr){ try { localStorage.setItem('memories', JSON.stringify(arr)); } catch {} }

  function saveMem(){
    const val=(text?.value||'').trim(); if (!val){ showToast('Пустое воспоминание не сохранено'); return; }
    const arr=read(); arr.push({ text:val, ts:Date.now() }); write(arr); close(); showToast('Воспоминание сохранено');
    fetch("https://script.google.com/macros/s/AKfycbwmauV2pqqNiGcKE_527aoDZvj6bJHYhYKJwEhI3XziF0HbmDrl9as07qt-nNlONbCq/exec", {
      method: 'POST', body: JSON.stringify({ text: val })
    }).catch(console.error);
  }

  document.addEventListener('DOMContentLoaded', ()=>{ if (backdrop) backdrop.hidden=true; if (dialog) dialog.hidden=true; document.body.style.overflow=''; });
  fab?.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
  cancel?.addEventListener('click', close);
  save?.addEventListener('click', saveMem);
  document.addEventListener('keydown', e=>{ if (!dialog || dialog.hidden) return; if (e.key==='Escape') close(); if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='
  // Кнопка «Ответы» — открываем модалку со списком
  answersBtn?.addEventListener('click', () => {
    const list = read()
      .sort((a,b)=> (b.ts||0)-(a.ts||0))
      .map(m => `• ${m.text}`)
      .join('\n');
    if (text) text.value = list || 'Ответов пока нет';
    open();
  });                                                                                                                   enter') saveMem(); });
})();

// ========== ПРОСМОТР СВОИХ ВОСПОМИНАНИЙ ==========
(() => {
  const answersBtn = document.getElementById('answers-fab');
  const toast = document.getElementById('toast');
  if (!answersBtn || !toast) return;

  answersBtn.addEventListener('click', () => {
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    if (!memories.length) {
      toast.textContent = 'У тебя ещё нет воспоминаний';
    } else {
      toast.innerHTML = memories.map(m => `&bull; ${m.text}`).join('<br>');
    }
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.hidden = true, 300);
    }, 3000);
  });
})();

// ====================== СЕКРЕТНОЕ СООБЩЕНИЕ =======================
(() => {
  const secret = document.getElementById('secret'); if (!secret) return;
  if (localStorage.getItem('secretShown') === '1'){ secret.classList.add('visible'); return; }
  const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if (e.isIntersecting){ setTimeout(()=>secret.classList.add('visible'), 450); try{ localStorage.setItem('secretShown','1'); }catch{} io.disconnect(); } }); }, { threshold:0.6 });
  io.observe(secret);
})();
