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
        // подстраховка: как только увидели первую карточку — снимаем mute
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
    document.body.appendChild(heart); setTimeout(()=>heart.remove(), 2000);
  });
})();

// =================== МУЗЫКА (мобилки + десктоп) =================
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

  addEventListener('pointerdown', unlockAudio, { once:true, passive:true });
  addEventListener('pointerup',   unlockAudio, { once:true, passive:true });
  addEventListener('keydown',     unlockAudio, { once:true });
  addEventListener('touchstart',  unlockAudio, { once:true, passive:true });
  addEventListener('touchend',    unlockAudio, { once:true, passive:true });
  addEventListener('touchmove',   unlockAudio, { once:true, passive:true });
  addEventListener('wheel',       unlockAudio, { once:true, passive:true });
  addEventListener('scroll',      unlockAudio, { once:true, passive:true });

  playBtn?.addEventListener('click', ()=>{ desired=parseFloat(volume?.value||'0.7'); unlockAudio(); audio.play().catch(()=>{}); });
  pauseBtn?.addEventListener('click', ()=>{ audio.pause(); if (playBtn&&pauseBtn){ pauseBtn.style.display='none'; playBtn.style.display='flex'; } });
  volume?.addEventListener('input', ()=>{ desired=parseFloat(volume.value); if (!audio.muted && !audio.paused) audio.volume = desired; });

  document.addEventListener('visibilitychange', ()=>{ if (!document.hidden && unlocked && audio.paused) audio.play().catch(()=>{}); });
})();

// ========== МОДАЛКА «Оставить воспоминание» + localStorage ==========
(() => {
  const fab = document.getElementById('memory-fab');
  const backdrop = document.getElementById('memory-backdrop');
  const dialog = document.getElementById('memory-dialog');
  const text = document.getElementById('memory-text');
  const save = document.getElementById('memory-save');
  const cancel = document.getElementById('memory-cancel');
  const toast = document.getElementById('toast');

  function open(){ if (!backdrop||!dialog) return; backdrop.hidden=false; dialog.hidden=false; setTimeout(()=>text?.focus(),30); document.body.style.overflow='hidden'; }
  function close(){ if (!backdrop||!dialog) return; backdrop.hidden=true; dialog.hidden=true; document.body.style.overflow=''; if (text) text.value=''; }
  function showToast(msg='Воспоминание сохранено'){ if (!toast) return; toast.textContent=msg; toast.hidden=false; requestAnimationFrame(()=>{ toast.classList.add('show'); setTimeout(()=>{ toast.classList.remove('show'); setTimeout(()=>toast.hidden=true,200); },1800); }); }
  function read(){ try { return JSON.parse(localStorage.getItem('memories')||'[]'); } catch { return []; } }
  function write(arr){ try { localStorage.setItem('memories', JSON.stringify(arr)); } catch {} }

  function saveMem(){
    const val=(text?.value||'').trim(); if (!val){ showToast('Пустое воспоминание не сохранено'); return; }
    const arr=read(); arr.push({ text:val, ts:Date.now() }); write(arr); close(); showToast('Воспоминание сохранено');
    if (!document.getElementById('answers-panel')?.hidden && window.renderMemories) window.renderMemories();
  }

  document.addEventListener('DOMContentLoaded', ()=>{ if (backdrop) backdrop.hidden=true; if (dialog) dialog.hidden=true; document.body.style.overflow=''; });

  fab?.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
  cancel?.addEventListener('click', close);
  save?.addEventListener('click', saveMem);
  document.addEventListener('keydown', e=>{ if (!dialog || dialog.hidden) return; if (e.key==='Escape') close(); if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='enter') saveMem(); });

  window.__memUtils = { read, write, showToast };
})();

// ===================== ПАНЕЛЬ «Ответы» (локальные) =================
(() => {
  const dockBtn  = document.getElementById('answers-fab');
  const panel    = document.createElement('aside');
  panel.id='answers-panel';
  panel.className='answers-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="answers-header">
      <h3>Твои воспоминания</h3>
      <button id="answers-close" class="btn btn-secondary">Закрыть</button>
    </div>
    <ul id="memories-list" class="memories-list"></ul>
    <div class="answers-actions">
      <button id="answers-clear" class="btn btn-secondary">Очистить всё</button>
      <button id="answers-export" class="btn btn-primary">Экспорт .txt</button>
    </div>`;
  document.body.appendChild(panel);

  const { read, write, showToast } = window.__memUtils || {};
  const list = panel.querySelector('#memories-list');
  const closeBtn = panel.querySelector('#answers-close');
  const clearBtn = panel.querySelector('#answers-clear');
  const exportBtn= panel.querySelector('#answers-export');

  function fmt(ts){ return new Date(ts).toLocaleString(); }

  function render(){
    if (!list || !read) return;
    const items = read().slice().reverse();
    list.innerHTML='';
    if (!items.length){ const li=document.createElement('li'); li.textContent='Пока пусто. Оставь первое воспоминание.'; list.appendChild(li); return; }
    for (const m of items){
      const li=document.createElement('li'); li.className='entry';
      li.innerHTML=`<time>${fmt(m.ts)}</time><p>${m.text}</p>`;
      const del=document.createElement('button'); del.className='btn btn-secondary'; del.textContent='Удалить';
      del.addEventListener('click', ()=>{
        const all=read(); const i=all.findIndex(x=>x.ts===m.ts && x.text===m.text);
        if (i>-1){ all.splice(i,1); write(all); render(); showToast?.('Удалено'); }
      });
      li.appendChild(del); list.appendChild(li);
    }
  }
  window.renderMemories = render;

  function open(){ panel.hidden=false; requestAnimationFrame(()=>panel.classList.add('open')); }
  function close(){ panel.classList.remove('open'); setTimeout(()=>panel.hidden=true,250); }

  dockBtn?.addEventListener('click', ()=>{ render(); open(); });
  closeBtn?.addEventListener('click', close);
  panel.addEventListener('click', e=>{ if (e.target===panel) close(); });

  clearBtn?.addEventListener('click', ()=>{ if (confirm('Точно удалить все воспоминания?')){ localStorage.removeItem('memories'); render(); showToast?.('Очищено'); } });
  exportBtn?.addEventListener('click', ()=>{
    const items = (window.__memUtils?.read()||[]);
    if (!items.length) return showToast?.('Нечего экспортировать');
    const txt = items.map(m=>`[${fmt(m.ts)}]\n${m.text}\n`).join('\n');
    const blob = new Blob([txt], {type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download='memories.txt'; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0);
  });
})();

// ====================== СЕКРЕТНОЕ СООБЩЕНИЕ =======================
(() => {
  const secret = document.getElementById('secret'); if (!secret) return;
  if (localStorage.getItem('secretShown') === '1'){ secret.classList.add('visible'); return; }
  const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if (e.isIntersecting){ setTimeout(()=>secret.classList.add('visible'), 450); try{ localStorage.setItem('secretShown','1'); }catch{} io.disconnect(); } }); }, { threshold:0.6 });
  io.observe(secret);
})();

// ===================== ГОСТЕВАЯ (опционально) =====================
(() => {
  const url = window.PUBLIC_GUESTBOOK_CSV;
  const wrap = document.getElementById('guestbook');
  const list = document.getElementById('guestbook-entries');
  if (!url || !wrap || !list) return; // выключено по умолчанию

  // Показать раздел
  wrap.hidden = false;

  fetch(url).then(r=>r.text()).then(csv=>{
    const rows = csv.trim().split(/\r?\n/).map(line=>{
      // очень простой CSV-парсер (без кавычек)
      return line.split(',').map(c=>c.trim());
    });
    // предполагаем: первая строка — заголовки; ищем столбцы "Timestamp" и "Message"/"Ответ"
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
