(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const STORAGE = 'medspace.progress.v2';
  const THEME = 'medspace.theme';
  const PAGE_SIZE = 24;

  const state = {
    page: 0, query: '', module: '', total: 0, hasMore: true,
    loading: false, lessons: [], modules: [], currentIndex: -1,
    currentLesson: null, progress: loadProgress(), theme: localStorage.getItem(THEME) || 'dark'
  };

  const icons = {
    heart: '<svg viewBox="0 0 64 64"><path d="M32 55S8 41 8 23C8 13 14 7 23 7c5 0 8 3 9 7 1-4 4-7 9-7 9 0 15 6 15 16 0 18-24 32-24 32Z"/><path d="M15 31h11l4-9 6 20 4-11h9"/></svg>',
    lungs: '<svg viewBox="0 0 64 64"><path d="M31 9v18c-8 1-12 8-14 17-2 8-7 12-12 10-5-2-5-11-2-19 3-8 9-14 17-20 3-2 6-4 11-6ZM33 9v18c8 1 12 8 14 17 2 8 7 12 12 10 5-2 5-11 2-19-3-8-9-14-17-20-3-2-6-4-11-6Z"/><path d="M32 10v44"/></svg>',
    brain: '<svg viewBox="0 0 64 64"><path d="M27 11c-6-5-14 0-12 7-7-1-11 8-6 13-5 5-1 14 6 13-2 8 7 13 13 8 4 5 10 3 10-3V17c0-5-5-9-11-6Z"/><path d="M37 11c6-5 14 0 12 7 7-1 11 8 6 13 5 5 1 14-6 13 2 8-7 13-13 8-4 5-10 3-10-3V17c0-5 5-9 11-6Z"/><path d="M20 21c5 0 7 3 7 7M14 32c6-1 10 2 10 7M44 21c-5 0-7 3-7 7M50 32c-6-1-10 2-10 7"/></svg>',
    skin: '<svg viewBox="0 0 64 64"><path d="M17 10h30c4 0 7 3 7 7v30c0 4-3 7-7 7H17c-4 0-7-3-7-7V17c0-4 3-7 7-7Z"/><path d="M18 25c7-5 11 4 18-2 6-5 8 3 11-2M16 39c6-4 10 4 16 0 8-6 11 4 16-1"/><circle cx="23" cy="19" r="2"/><circle cx="42" cy="46" r="2"/></svg>',
    stomach: '<svg viewBox="0 0 64 64"><path d="M26 10v12c0 5 3 8 8 9 9 1 16 7 16 17 0 7-6 11-13 11-11 0-19-7-19-18V31c0-8 3-14 8-21Z"/><path d="M26 23c8 3 10 9 8 15M18 39c7 2 12 6 13 15M43 38c-3 4-4 9-2 14"/></svg>',
    kidney: '<svg viewBox="0 0 64 64"><path d="M35 9c-8 1-16 9-17 19-1 8 4 15 11 16 7 1 12-4 12-11 0-5-3-8-1-13 2-6 1-10-5-11Z"/><path d="M29 44c2 4 5 7 10 8"/></svg>',
    female: '<svg viewBox="0 0 64 64"><circle cx="32" cy="20" r="9"/><path d="M32 29v23M22 40h20M32 52v7M25 59h14"/></svg>',
    child: '<svg viewBox="0 0 64 64"><circle cx="32" cy="17" r="9"/><path d="M20 57c0-12 5-20 12-20s12 8 12 20M24 30l-7 12M40 30l7 12M25 47h14"/></svg>',
    bone: '<svg viewBox="0 0 64 64"><path d="M18 25c-4 4-9 1-11 6-2 4 1 8 5 8 2 0 4-1 6-3l18-18c2-2 3-4 3-6 0-4 4-7 8-5 5 2 5 8 1 11-2 1-4 1-6 0L24 36c-2 2-3 4-3 6 0 4-4 7-8 5-5-2-5-8-1-11 2-1 4-1 6 0"/></svg>',
    bladder: '<svg viewBox="0 0 64 64"><path d="M18 29c0-9 6-14 14-14s14 5 14 14v8c0 11-6 17-14 17s-14-6-14-17v-8Z"/><path d="M26 15V8M38 15V8M26 8h-4M38 8h4"/></svg>',
    eye: '<svg viewBox="0 0 64 64"><path d="M7 32s9-15 25-15 25 15 25 15-9 15-25 15S7 32 7 32Z"/><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="3"/></svg>',
    blood: '<svg viewBox="0 0 64 64"><path d="M32 7S15 27 15 39a17 17 0 0 0 34 0C49 27 32 7 32 7Z"/><path d="M23 41c2 5 6 7 11 7"/></svg>',
    thyroid: '<svg viewBox="0 0 64 64"><path d="M32 31c-4-8-11-10-16-5-6 5-4 16 5 18 5 1 8-1 11-4M32 31c4-8 11-10 16-5 6 5 4 16-5 18-5 1-8-1-11-4M32 31v24"/></svg>',
    virus: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="15"/><path d="M32 8v9M32 47v9M8 32h9M47 32h9M15 15l7 7M42 42l7 7M49 15l-7 7M22 42l-7 7"/><circle cx="26" cy="28" r="2"/><circle cx="39" cy="36" r="2"/></svg>',
    emergency: '<svg viewBox="0 0 64 64"><path d="M32 7v50M7 32h50"/><path d="M20 12h24M20 52h24M12 20v24M52 20v24"/><path d="M25 25h14v14H25z"/></svg>',
    pill: '<svg viewBox="0 0 64 64"><path d="M17 47c-5-5-5-13 0-18l12-12c5-5 13-5 18 0s5 13 0 18L35 47c-5 5-13 5-18 0Z"/><path d="m23 41 18-18"/></svg>',
    cancer: '<svg viewBox="0 0 64 64"><path d="M32 8c5 7 12 8 17 5-1 7 2 12 9 16-7 3-9 10-7 16-7-2-13 1-17 9-4-8-10-11-17-9 2-6 0-13-7-16 7-4 10-9 9-16 5 3 12 2 17-5Z"/><circle cx="32" cy="32" r="7"/></svg>',
    medical: '<svg viewBox="0 0 64 64"><path d="M32 8v48M8 32h48"/><circle cx="32" cy="32" r="23"/></svg>'
  };

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE)) || { completed: {}, recent: [], last: null }; }
    catch { return { completed: {}, recent: [], last: null }; }
  }
  function saveProgress() { localStorage.setItem(STORAGE, JSON.stringify(state.progress)); renderProgress(); }
  function completedCount() { return Object.keys(state.progress.completed).length; }
  function isDone(id) { return !!state.progress.completed[String(id)]; }
  function markDone(lesson, done = true) {
    const id = String(lesson.id);
    if (done) {
      state.progress.completed[id] = { id: lesson.id, title: lesson.title, module: lesson.module, at: new Date().toISOString() };
      state.progress.recent = [{ id: lesson.id, title: lesson.title, module: lesson.module, at: Date.now() }, ...state.progress.recent.filter(x => x.id !== lesson.id)].slice(0, 8);
    } else delete state.progress.completed[id];
    state.progress.last = { id: lesson.id, title: lesson.title, module: lesson.module, at: Date.now() };
    saveProgress();
    refreshCardStates(lesson.id);
  }

  function setTheme() { document.documentElement.dataset.theme = state.theme; localStorage.setItem(THEME, state.theme); $('#themeBtn').textContent = state.theme === 'dark' ? '☼' : '☾'; }

  function icon(key) { return icons[key] || icons.medical; }
  function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  async function fetchModules() {
    const res = await fetch('/api/modules');
    if (!res.ok) throw new Error('modules');
    state.modules = await res.json();
    renderModuleChips(); renderModuleProgress(); renderModuleShowcase();
  }

  async function fetchLessons(reset = false) {
    if (state.loading || (!state.hasMore && !reset)) return;
    if (reset) { state.page = 0; state.lessons = []; state.hasMore = true; $('#lessonGrid').innerHTML = ''; showSkeletons(); }
    state.loading = true; $('#loadMore').classList.add('hidden'); $('#loadingMore').classList.remove('hidden');
    const nextPage = state.page + 1;
    const params = new URLSearchParams({ page: nextPage, limit: PAGE_SIZE });
    if (state.query) params.set('q', state.query);
    if (state.module) params.set('module', state.module);
    try {
      const res = await fetch(`/api/lessons?${params}`);
      if (!res.ok) throw new Error('lessons');
      const data = await res.json();
      if (reset) $('#lessonGrid').innerHTML = '';
      state.page = data.page; state.total = data.total; state.hasMore = data.has_more; state.lessons.push(...data.items);
      renderLessons(data.items);
      $('#resultCount').textContent = `${data.total.toLocaleString('ar-DZ')} نتيجة`;
      $('#emptyState').classList.toggle('hidden', data.total !== 0);
    } catch (err) {
      $('#lessonGrid').innerHTML = '<div class="api-error">حدث خطأ أثناء تحميل الدروس. تأكد أن Flask يعمل ثم أعد المحاولة.</div>';
    } finally {
      state.loading = false; $('#loadingMore').classList.add('hidden'); $('#loadMore').classList.toggle('hidden', !state.hasMore || state.total === 0); hideSkeletons();
    }
  }

  function showSkeletons() { for (let i=0;i<6;i++) { const s=document.createElement('div'); s.className='skeleton-card'; s.dataset.skeleton='1'; $('#lessonGrid').appendChild(s); } }
  function hideSkeletons() { $$('[data-skeleton]').forEach(x=>x.remove()); }

  function renderLessons(items) {
    const tpl = $('#lessonTemplate');
    items.forEach(lesson => {
      const card = tpl.content.firstElementChild.cloneNode(true);
      card.dataset.id = lesson.id; card.dataset.theme = lesson.theme; card.classList.add(`theme-${lesson.theme}`);
      $('.specialty-icon', card).innerHTML = icon(lesson.icon); $('.card-module', card).textContent = lesson.module;
      const mod = state.modules.find(m => m.name === lesson.module); const visual = window.MedSpaceImages.visualForLesson(lesson); if (!lesson.image && mod) Object.assign(visual, window.MedSpaceImages.visualForSpecialty(mod)); const frame = window.MedSpaceImages.frame('course_card', visual); card.insertBefore(frame, $('.card-top', card)); card.style.setProperty('--card-accent', visual.accent);
      $('.type-pill', card).textContent = lesson.type || 'درس'; $('.lesson-title', card).textContent = lesson.title;
      $('.study-btn', card).addEventListener('click', () => openReader(lesson));
      $('.complete-toggle', card).addEventListener('click', e => { e.stopPropagation(); markDone(lesson, !isDone(lesson.id)); });
      setupTilt(card); updateCard(card, lesson);
      $('#lessonGrid').appendChild(card);
      requestAnimationFrame(() => card.classList.add('visible'));
    });
  }

  function updateCard(card, lesson) {
    const done = isDone(lesson.id); card.classList.toggle('completed', done);
    $('.complete-toggle', card).innerHTML = done ? '✓' : '○'; $('.complete-toggle', card).title = done ? 'إلغاء الإكمال' : 'تحديد كمكتمل';
    $('.lesson-status', card).textContent = done ? '✓ تمت الدراسة' : 'غير مكتمل';
  }
  function refreshCardStates(id) { $$('.lesson-card').filter(c => c.dataset.id === String(id)).forEach(c => { const l=state.lessons.find(x=>String(x.id)===String(id)); if(l) updateCard(c,l); }); }

  function setupTilt(card) {
    const fine = matchMedia('(pointer:fine)').matches; if (!fine) return;
    card.addEventListener('pointermove', e => { const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-3px)`; });
    card.addEventListener('pointerleave', () => card.style.transform='');
  }

  function renderModuleChips() {
    const box=$('#moduleChips'); box.innerHTML='';
    const all=document.createElement('button'); all.className=`chip ${!state.module?'active':''}`; all.textContent='الكل'; all.onclick=()=>chooseModule(''); box.appendChild(all);
    state.modules.forEach(m => { const b=document.createElement('button'); b.className=`chip ${state.module===m.name?'active':''} theme-${m.theme}`; b.innerHTML=`<span class="chip-icon">${icon(m.icon)}</span>${escapeHtml(m.name)} <small>${m.count}</small>`; b.onclick=()=>chooseModule(m.name); box.appendChild(b); });
  }
  function chooseModule(name) { closeSpecialty(); state.module=name; renderModuleChips(); fetchLessons(true); document.querySelector('#library').scrollIntoView({behavior:'smooth', block:'start'}); }

  function renderModuleProgress() {
    const box=$('#moduleProgressGrid'); box.innerHTML='';
    state.modules.forEach(m => {
      const done=Object.values(state.progress.completed).filter(x=>x.module===m.name).length; const pct=m.count ? Math.round(done/m.count*100) : 0;
      const el=document.createElement('article'); el.className=`module-progress theme-${m.theme}`;
      el.innerHTML=`<div class="module-progress-head"><div class="module-progress-icon">${icon(m.icon)}</div><div class="module-progress-name"><strong>${escapeHtml(m.name)}</strong><small>${done} / ${m.count} درس</small></div><div class="mini-chart" style="--p:${pct*3.6}deg"><span>${pct}%</span></div></div><div class="module-bar"><i style="width:${pct}%"></i></div><button type="button">عرض الدروس <span>←</span></button>`;
      $('button',el).onclick=()=>chooseModule(m.name); box.appendChild(el);
    });
  }

  function renderModuleShowcase() {
    const box=$('#moduleShowcaseGrid'); box.innerHTML='';
    state.modules.forEach(m=>{ const done=Object.values(state.progress.completed).filter(x=>x.module===m.name).length; const pct=m.count?Math.round(done/m.count*100):0; const el=document.createElement('button'); el.className=`module-showcase-card theme-${m.theme}`; el.style.setProperty('--card-accent',m.accent||'var(--accent)'); const visual=window.MedSpaceImages.visualForSpecialty(m); const frame=window.MedSpaceImages.frame('specialty_card',visual); frame.classList.add('showcase-image'); el.appendChild(frame); const info=document.createElement('div'); info.innerHTML=`<span class="showcase-icon">${icon(m.icon)}</span><strong>${escapeHtml(m.name)}</strong><small>${done}/${m.count} مكتمل • ${pct}%</small><span class="showcase-arrow">←</span>`; el.appendChild(info); el.onclick=()=>openSpecialty(m); box.appendChild(el); });
  }

  function openSpecialty(module){
    const view=$('#specialtyView'); if(!view) return;
    const done=Object.values(state.progress.completed).filter(x=>x.module===module.name).length; const pct=module.count?Math.round(done/module.count*100):0;
    view.classList.remove('hidden'); view.classList.add('is-open');
    view.style.setProperty('--specialty-accent',module.accent||'#61E1D0'); view.style.setProperty('--specialty-soft',`color-mix(in srgb, ${module.accent||'#61E1D0'} 9%, transparent)`); view.style.setProperty('--specialty-line',`color-mix(in srgb, ${module.accent||'#61E1D0'} 24%, var(--line))`);
    const specialtyVisual=window.MedSpaceImages.visualForSpecialty(module); $('#specialtyHeroImage').src=specialtyVisual.src; $('#specialtyHeroImage').alt=specialtyVisual.alt; $('#specialtyHeroImage').loading='eager'; $('#specialtyHeroFrame').style.setProperty('--image-accent',specialtyVisual.accent); window.MedSpaceImages.preload(specialtyVisual.src); window.MedSpaceImages.applyPagePalette(specialtyVisual.accent); $('#specialtyTitle').textContent=module.name; $('#specialtyKicker').textContent=`SPECIALTY • ${module.name.toUpperCase()}`; $('#specialtyCount').textContent=`${module.count} درس`; $('#specialtyProgress').textContent=`${pct}% مكتمل`;
    const grid=$('#specialtyLessonGrid'); grid.innerHTML='<div class="specialty-lesson-empty">جاري تحميل دروس التخصص…</div>';
    fetch(`/api/lessons?page=1&limit=60&module=${encodeURIComponent(module.name)}`).then(r=>r.json()).then(data=>{grid.innerHTML=''; if(!data.items.length){grid.innerHTML='<div class="specialty-lesson-empty">لا توجد دروس لهذا التخصص حاليًا.</div>';return;} renderSpecialtyLessons(data.items,module,grid); $('#specialtyStudyAll').onclick=()=>{chooseModule(module.name); document.querySelector('#library').scrollIntoView({behavior:'smooth',block:'start'}); closeSpecialty();};}).catch(()=>{grid.innerHTML='<div class="specialty-lesson-empty">تعذر تحميل دروس التخصص.</div>';});
    view.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderSpecialtyLessons(items,module,grid){
    const tpl=$('#lessonTemplate'); items.forEach(lesson=>{ const card=tpl.content.firstElementChild.cloneNode(true); card.dataset.id=lesson.id; card.classList.add(`theme-${module.theme}`); card.style.setProperty('--card-accent',module.accent||'var(--accent)'); const visual=window.MedSpaceImages.visualForLesson(lesson); if(!lesson.image) Object.assign(visual, window.MedSpaceImages.visualForSpecialty(module)); const frame=window.MedSpaceImages.frame('course_card', visual); card.insertBefore(frame,$('.card-top',card)); $('.specialty-icon',card).innerHTML=icon(lesson.icon); $('.card-module',card).textContent=lesson.module; $('.type-pill',card).textContent=lesson.type||'درس'; $('.lesson-title',card).textContent=lesson.title; $('.study-btn',card).addEventListener('click',()=>openReader(lesson)); $('.complete-toggle',card).addEventListener('click',e=>{e.stopPropagation();markDone(lesson,!isDone(lesson.id));}); updateCard(card,lesson); grid.appendChild(card); requestAnimationFrame(()=>card.classList.add('visible')); });
  }
  function closeSpecialty(){ const view=$('#specialtyView'); view.classList.add('hidden'); view.classList.remove('is-open'); }

  function renderProgress() {
    const done=completedCount(); const total=Number(document.body.dataset.total || 0); const pct=total?Math.round(done/total*100):0;
    $('#completedStat').textContent=done.toLocaleString('ar-DZ'); $('#percentStat').textContent=`${pct}%`; $('#ringPercent').textContent=`${pct}%`; $('#overallBar').style.width=`${pct}%`; $('#bigRing').style.setProperty('--progress', `${pct*3.6}deg`); $('#miniRing').style.setProperty('--progress', `${pct*3.6}deg`);
    $('#progressHeadline').textContent=done===0?'ابدأ أول درس لك':done===total?'أكملت المكتبة كاملة 🎉':`أنجزت ${done} درس${done===1?'':'ًا'} حتى الآن`;
    $('#progressText').textContent=done===0?'ضع علامة ✓ بعد إنهاء الدرس وستظهر هنا إحصائياتك.':`أكملت ${pct}% من مكتبتك. استمر بنفس الإيقاع.`;
    const cont=$('#continueSection');
    if(state.progress.last){
      cont.classList.remove('hidden');
      $('#continueTitle').textContent=state.progress.last.title;
      $('#continueMeta').textContent=state.progress.last.module;
    } else cont.classList.add('hidden');
    const recent=$('#recentList'); recent.innerHTML=''; $('#recentCount').textContent=state.progress.recent.length;
    if (!state.progress.recent.length) recent.innerHTML='<div class="recent-empty">لم تسجل أي درس بعد.</div>';
    state.progress.recent.slice(0,5).forEach(x=>{ const el=document.createElement('button'); el.className='recent-item'; el.innerHTML=`<span class="recent-check">✓</span><span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.module)}</small></span>`; el.onclick=()=>{ const l=state.lessons.find(z=>z.id===x.id); if(l) openReader(l); else fetch(`/api/lessons/${x.id}`).then(r=>r.json()).then(openReader); }; recent.appendChild(el); });
    renderModuleProgress(); renderModuleShowcase();
  }

  async function loadAdjacent(lesson) {
    try {
      const params=new URLSearchParams(); if(state.query)params.set('q',state.query); if(state.module)params.set('module',state.module);
      const r=await fetch(`/api/lessons/${lesson.id}/adjacent?${params}`); if(!r.ok)throw 0; return await r.json();
    } catch { return {index:-1,total:1,prev:null,next:null}; }
  }
  async function openReader(lesson) {
    state.currentLesson=lesson; state.currentIndex=state.lessons.findIndex(x=>x.id===lesson.id); state.progress.last={id:lesson.id,title:lesson.title,module:lesson.module,at:Date.now()}; localStorage.setItem(STORAGE, JSON.stringify(state.progress));
    $('#readerModal').classList.remove('hidden'); $('#readerModal').setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
    $('#readerTitle').textContent=lesson.title; $('#readerModule').textContent=lesson.module; $('#readerIcon').innerHTML=icon(lesson.icon); const readerVisual=window.MedSpaceImages.visualForLesson(lesson); $('#readerVisualImage').src=readerVisual.src; $('#readerVisualImage').alt=readerVisual.alt; $('#readerVisualFrame').style.setProperty('--image-accent',readerVisual.accent); window.MedSpaceImages.applyPagePalette(readerVisual.accent); $('#readerPosition').textContent='جاري تحديد الموقع…';
    $('#readerLoading').classList.remove('hidden'); $('#readerError').classList.add('hidden'); $('#readerFrame').src=''; $('#openDrive').href=lesson.link || lesson.preview_url;
    setTimeout(()=>{ $('#readerFrame').src=lesson.preview_url; },80); updateReaderControls(); renderProgress();
    const nav=await loadAdjacent(lesson); if(state.currentLesson?.id!==lesson.id)return;
    state.currentIndex=nav.index; state.currentPrev=nav.prev; state.currentNext=nav.next; $('#readerPosition').textContent=nav.total?`${nav.index+1} / ${nav.total}`:'درس'; updateReaderControls();
  }
  function closeReader(){ $('#readerModal').classList.add('hidden'); $('#readerModal').setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); $('#readerFrame').src=''; }
  function updateReaderControls(){ const done=state.currentLesson&&isDone(state.currentLesson.id); $('#readerComplete').textContent=done?'✓ مكتمل — اضغط للإلغاء':'○ لم أنهِ الدرس'; $('#readerComplete').classList.toggle('done',done); $('#prevLesson').disabled=!state.currentPrev; $('#nextLesson').disabled=!state.currentNext; }
  function moveReader(dir){ const target=dir<0?state.currentPrev:state.currentNext; if(target)openReader(target); }

  function continueLast(){ if(!state.progress.last)return; const l=state.lessons.find(x=>x.id===state.progress.last.id); if(l) openReader(l); else fetch(`/api/lessons/${state.progress.last.id}`).then(r=>r.json()).then(openReader).catch(()=>{}); }

  function exportProgress(){ const blob=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),...state.progress},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='medspace-progress.json'; a.click(); URL.revokeObjectURL(a.href); }
  function importProgress(file){ const r=new FileReader(); r.onload=()=>{try{const d=JSON.parse(r.result); if(!d.completed||!d.recent)throw 0; state.progress={completed:d.completed,recent:d.recent,last:d.last||null}; saveProgress(); renderLessons([]); $$('.lesson-card').forEach(c=>{const l=state.lessons.find(x=>String(x.id)===c.dataset.id);if(l)updateCard(c,l)});alert('تم استيراد تقدمك بنجاح.');}catch{alert('ملف التقدم غير صالح.');}}; r.readAsText(file); }

  function bind(){
    setTheme(); $('#themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';setTheme()};
    $('#startBtn').onclick=()=>$('#library').scrollIntoView({behavior:'smooth'}); $('#heroProgressBtn').onclick=()=>$('#progress').scrollIntoView({behavior:'smooth'}); $('#progressBtn').onclick=()=>$('#progress').scrollIntoView({behavior:'smooth'});
    $('#continueBtn').onclick=continueLast; $('#closeSpecialty').onclick=closeSpecialty;
    $('#clearContinueBtn').onclick=()=>{state.progress.last=null;saveProgress();};
    $('#loadMore').onclick=()=>fetchLessons(false); $('#allModulesBtn').onclick=()=>chooseModule(''); $('#clearFilters').onclick=()=>{state.query='';state.module='';$('#searchInput').value='';renderModuleChips();fetchLessons(true)};
    let timer; $('#searchInput').addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>{state.query=e.target.value.trim();fetchLessons(true)},220)});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus()} if(e.key==='Escape'&&!$('#readerModal').classList.contains('hidden'))closeReader(); if(!$('#readerModal').classList.contains('hidden')){if(e.key==='ArrowLeft')moveReader(1);if(e.key==='ArrowRight')moveReader(-1)}});
    $('#closeReader').onclick=closeReader; $('[data-close-reader]').onclick=closeReader; $('#prevLesson').onclick=()=>moveReader(-1); $('#nextLesson').onclick=()=>moveReader(1); $('#readerComplete').onclick=()=>{if(state.currentLesson)markDone(state.currentLesson,!isDone(state.currentLesson.id));updateReaderControls()}; $('#readerFrame').addEventListener('load',()=>$('#readerLoading').classList.add('hidden')); setTimeout(()=>$('#readerLoading').classList.add('hidden'),7000);
    $('#exportBtn').onclick=exportProgress; $('#importBtn').onclick=()=>$('#importFile').click(); $('#importFile').onchange=e=>e.target.files[0]&&importProgress(e.target.files[0]); $('#resetBtn').onclick=()=>{if(confirm('سيتم حذف كل علامات الإكمال والتقدم المحفوظ على هذا المتصفح. هل أنت متأكد؟')){state.progress={completed:{},recent:[],last:null};saveProgress();$$('.lesson-card').forEach(c=>{const l=state.lessons.find(x=>String(x.id)===c.dataset.id);if(l)updateCard(c,l)});}};
  }

  function reveal(){ const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08}); $$('.reveal').forEach(x=>io.observe(x)); }

  async function init(){ bind(); reveal(); renderProgress(); try{await fetchModules(); await fetchLessons(true);}catch(e){$('#lessonGrid').innerHTML='<div class="api-error">تعذر الاتصال بخادم الموقع.</div>';}}
  init();
})();
