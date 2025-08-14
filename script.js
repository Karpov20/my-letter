// ======================= ЗВЁЗДНОЕ НЕБО =======================
(() => {
  const canvas = document.getElementById('stars'); if (!canvas) return;
  const ctx = canvas.getContext('2d'); let stars = []; let w, h;
  function initStars(){
    w = canvas.width = innerWidth; h = canvas.height = innerHeight;
    stars = Array.from({length:200}, ()=>({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5, d: Math.random()*0.5
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h); ctx.fillStyle="white";
    for (const s of stars){
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      s.y += s.d; if (s.y>h){ s.x=Math.random()*w; s.y=0; }
    }
    requestAnimationFrame(draw);
  }
  addEventListener('resize', initStars);
  initStars(); draw();
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
  btn.addEventListener('click', ()=>{
    if (window.unlockAudio) window.unlockAudio();
    scrollTo({ top: innerHeight, behavior: 'smooth' });
  });
  addEventListener('scroll', ()=>{
    btn.style.display = scrollY>50 ? 'none' : 'block';
  }, { passive:true });
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

  let desired = parseFloat((volume && volume.value) || '0.7');
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

  if (playBtn) playBtn.addEventListener('click', ()=>{
    desired=parseFloat((volume && volume.value) || '0.7'); unlockAudio(); audio.play().catch(()=>{});
  });
  if (pauseBtn) pauseBtn.addEventListener('click', ()=>{
    audio.pause(); if (playBtn&&pauseBtn){ pauseBtn.style.display='none'; playBtn.style.display='flex'; }
  });
  if (volume) volume.addEventListener('input', ()=>{
    desired=parseFloat(volume.value); if (!audio.muted && !audio.paused) audio.volume = desired;
  });
})();

// ========== МОДАЛКА «Оставить воспоминание» + localStorage + Sheets + список ==========
(() => {
  const backdrop = document.getElementById('memory-backdrop');
  const dialog   = document.getElementById('memory-dialog');
  const toast    = document.getElementById('toast');

  const title = document.getElementById('memory-title');
  const sub   = document.querySelector('.memory-sub');

  // Режимы
  const formWrap  = document.getElementById('memory-form');
  const listWrap  = document.getElementById('memory-list');
  const textarea  = document.getElementById('memory-text');
  const listBox   = document.getElementById('memory-list-items');

  const saveBtn   = document.getElementById('memory-save');
  const cancelBtn = document.getElementById('memory-cancel');
  const listClose = document.getElementById('list-close');
  const listWrite = document.getElementById('list-write');

  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg || 'Готово';
    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => (toast.hidden = true), 200);
      }, 1800);
    });
  }

  function readMem(){ try { return JSON.parse(localStorage.getItem('memories') || '[]'); } catch (e) { return []; } }
  function writeMem(arr){ try { localStorage.setItem('memories', JSON.stringify(arr)); } catch (e) {} }

  function openModal(){
    if (!backdrop || !dialog) return;
    backdrop.hidden = false; dialog.hidden = false; document.body.style.overflow='hidden';
  }
  function closeModal(){
    if (!backdrop || !dialog) return;
    backdrop.hidden = true; dialog.hidden = true; document.body.style.overflow='';
    if (textarea) textarea.value='';
    if (listBox) listBox.querySelectorAll('[data-new="1"]').forEach(el => el.removeAttribute('data-new'));
  }

  function setMode(mode){
    const isForm = mode === 'form';
    if (formWrap) formWrap.hidden = !isForm;
    if (listWrap) listWrap.hidden = isForm;

    if (title && sub){
      if (isForm){
        title.textContent = 'Оставить воспоминание';
        sub.textContent   = 'Поделись коротким ответом или тёплой памятью. Она сохранится только у тебя на этом устройстве.';
        setTimeout(()=> textarea && textarea.focus(), 30);
      } else {
        title.textContent = 'Твои воспоминания';
        sub.textContent   = 'Здесь хранятся твои ответы на этом устройстве.';
      }
    }
  }

  // Рендер списка
  function renderList(highlightId){
    if (!listBox) return;
    const data = readMem().sort((a,b)=> (b.ts||0) - (a.ts||0));
    listBox.innerHTML = '';
    if (!data.length){
      const empty = document.createElement('div');
      empty.className = 'memory-item';
      empty.innerHTML = '<div class="item-text">Ответов пока нет</div>';
      listBox.appendChild(empty);
      return;
    }
    for (const m of data){
      const wrap = document.createElement('div');
      wrap.className = 'memory-item';
      wrap.setAttribute('role','listitem');
      if (highlightId && (m.id || m.ts) === highlightId) wrap.dataset.new = '1';

      const text = document.createElement('div');
      text.className = 'item-text';
      text.textContent = m.text;

      const meta = document.createElement('div');
      meta.className = 'item-meta';

      const time = document.createElement('div');
      time.className = 'item-time';
      const d = new Date(m.ts || 0);
      time.textContent = d.toLocaleString([], { hour12:false });

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const del = document.createElement('button');
      del.className = 'item-btn';
      del.type = 'button';
      del.textContent = 'Удалить';
      del.addEventListener('click', () => {
        const arr = readMem().filter(x => (x.id || x.ts) !== (m.id || m.ts));
        writeMem(arr);
        renderList();
      });

      actions.appendChild(del);
      meta.append(time, actions);
      wrap.append(text, meta);
      listBox.appendChild(wrap);
    }

    if (highlightId){
      const el = listBox.querySelector('[data-new="1"]');
      if (el) el.scrollIntoView({ block:'center', behavior:'smooth' });
    }
  }

  function openForm(){ setMode('form'); openModal(); }
  function openList(highlightId){ setMode('list'); renderList(highlightId || null); openModal(); }

  // Сохранение
  function saveMem(){
    const val = (textarea && textarea.value || '').trim();
    if (!val){ showToast('Пустое воспоминание не сохранено'); return; }

    const id = Math.random().toString(36).slice(2);
    const entry = { id, text: val, ts: Date.now() };

    const arr = readMem(); arr.push(entry); writeMem(arr);

    showToast('Воспоминание сохранено');
    openList(id);

    // Отправка в Apps Script (urlencoded без preflight)
    const url = "https://script.google.com/macros/s/AKfycbwmauV2pqqNiGcKE_527aoDZvj6bJHYhYKJwEhI3XziF0HbmDrl9as07qt-nNlONbCq/exec";
    const body = new URLSearchParams({ text: val, ts: String(entry.ts), id: id });
    fetch(url, { method:'POST', body })
      .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); })
      .catch(err => { console.error('GAS error:', err); });
  }

  // Инициализация / привязки
  document.addEventListener('DOMContentLoaded', ()=>{
    if (backdrop) backdrop.hidden=true;
    if (dialog) dialog.hidden=true;
    document.body.style.overflow='';
  });

  const fab = document.getElementById('memory-fab');
  const answersFab = document.getElementById('answers-fab');
  if (fab) fab.addEventListener('click', openForm);
  if (answersFab) answersFab.addEventListener('click', ()=> openList(null));

  if (saveBtn)   saveBtn.addEventListener('click', saveMem);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (listClose) listClose.addEventListener('click', closeModal);
  if (listWrite) listWrite.addEventListener('click', openForm);

  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e)=>{
    if (!dialog || dialog.hidden) return;
    if (e.key === 'Escape') closeModal();
    const isForm = formWrap && !formWrap.hidden;
    if (isForm && (e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='enter') saveMem();
  });
})();
