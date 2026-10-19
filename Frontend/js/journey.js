const CineMaxJourney = (() => {
  function today() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function stats(entries) {
    const watched=entries.filter(e=>e.status==='watched');
    const genres=new Map(), months=new Map();
    watched.forEach(e=>{
      const genre=e.movie?.genreName;
      if(genre)genres.set(genre,(genres.get(genre)||0)+1);
      if(/^\d{4}-\d{2}-\d{2}$/.test(e.watched_on||'')){const key=e.watched_on.slice(0,7);months.set(key,(months.get(key)||0)+1);}
    });
    return {watched:watched.length,want:entries.filter(e=>e.status==='want').length,
      genres:[...genres].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),
      months:[...months].sort((a,b)=>a[0].localeCompare(b[0])),
      top:watched.filter(e=>e.rating!=null).sort((a,b)=>b.rating-a.rating||String(a.movie?.title||'').localeCompare(String(b.movie?.title||''))).slice(0,5)};
  }
  async function loadMovie(movieID) {
    const root=document.getElementById('journeyWidget');if(!root)return;
    root.innerHTML=`<div class="journey-actions"><button type="button" class="filter-btn" data-journey="want">＋ Көргім келеді · Хочу посмотреть</button><button type="button" class="filter-btn" data-journey="watched">✓ Көрдім · Просмотрено</button><button type="button" class="filter-btn" data-journey="favorite">♡ В избранное</button><a href="profile.html" class="journey-profile">Мой кино-дневник ↗</a></div><p class="journey-message" role="status"></p><form class="journey-editor" hidden><h3>Мой просмотр</h3><div class="journey-fields"><label>Дата просмотра<input type="date" name="watched_on" required class="form-control form-control-dark"></label><label>Моя оценка<select name="rating" class="form-control form-control-dark"><option value="">Без оценки</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1}/10</option>`).join('')}</select></label></div><label class="d-block mt-3">Личная заметка<textarea name="note" maxlength="2000" rows="3" class="form-control form-control-dark" placeholder="Что запомнилось? Заметка видна только вам."></textarea></label><div class="journey-actions mt-3"><button class="btn-red" type="submit">Сохранить просмотр</button><button class="filter-btn" type="button" data-cancel>Закрыть</button><button class="filter-btn" type="button" data-remove hidden>Убрать статус</button></div></form>`;
    const form=root.querySelector('form'), message=root.querySelector('.journey-message');
    const buttons=[...root.querySelectorAll('[data-journey]')];
    let entry=null, busy=false, signedIn=false;
    function notify(text){message.textContent=text;}
    function paint(){buttons.forEach(b=>{const active=b.dataset.journey==='favorite'?CineMaxFavorites.list().includes(movieID):entry?.status===b.dataset.journey;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(Boolean(active)));});}
    function login(){location.href='auth.html?returnTo='+encodeURIComponent(location.pathname+location.search);}
    async function act(work){if(busy)return;busy=true;buttons.forEach(b=>b.disabled=true);try{await work();paint();}catch(e){notify(e.message);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}}
    await CineMaxFavorites.initialize().then(paint).catch(e=>notify(e.message));
    try{signedIn=await supabaseApi.hasSession();if(signedIn){entry=(await api.get('/journey?movieId='+movieID))[0]||null;paint();}else notify('Войдите, чтобы сохранять дневник и статистику между устройствами.');}catch(e){notify(e.message);}
    buttons.forEach(button=>button.addEventListener('click',()=>act(async()=>{
      const action=button.dataset.journey;
      if(action==='favorite'){await CineMaxFavorites.toggle(movieID);notify('Избранное обновлено.');return;}
      if(!signedIn){login();return;}
      if(action==='watched'){
        form.hidden=false;form.elements.watched_on.value=entry?.watched_on||today();form.elements.watched_on.max=today();
        form.elements.rating.value=entry?.rating??'';form.elements.note.value=entry?.note||'';
        root.querySelector('[data-remove]').hidden=!entry;
      }else{
        if(entry?.status==='want'){await api.delete('/journey/'+movieID);entry=null;}
        else{if(entry?.status==='watched'&&!confirm('Заменить просмотр статусом «Хочу посмотреть»? Оценка и заметка этого просмотра будут удалены.'))return;entry=await api.post('/journey',{movieID,status:'want'});}
        form.hidden=true;notify('Дневник обновлён.');
      }
    })));
    root.querySelector('[data-cancel]').addEventListener('click',()=>form.hidden=true);
    root.querySelector('[data-remove]').addEventListener('click',()=>act(async()=>{if(!confirm('Удалить статус, оценку и личную заметку этого фильма?'))return;await api.delete('/journey/'+movieID);entry=null;form.hidden=true;notify('Запись убрана из дневника.');}));
    form.addEventListener('submit',event=>{event.preventDefault();if(busy)return;const save=form.querySelector('[type="submit"]');save.disabled=true;act(async()=>{entry=await api.post('/journey',{movieID,status:'watched',rating:form.elements.rating.value,note:form.elements.note.value,watched_on:form.elements.watched_on.value});form.hidden=true;notify('Просмотр сохранён. Статистика обновлена.');}).finally(()=>save.disabled=false);});
  }
  return {stats,today,loadMovie};
})();
