(() => {
  if(localStorage.getItem('cinemax_theme')==='light')document.body.classList.add('light-mode');
  let entries=[],tab='all';const $=id=>document.getElementById(id);
  function render(){
    const s=CineMaxJourney.stats(entries);
    $('watchedCount').textContent=s.watched;$('wantCount').textContent=s.want;$('favoriteGenre').textContent=s.genres[0]?.[0]||'—';
    $('tasteSummary').textContent=s.genres.length?'Ты чаще выбираешь: '+s.genres.slice(0,2).map(g=>g[0]).join(' и ')+'.':'Отметь первый просмотр — здесь появится твой кино-портрет.';
    const maximum=Math.max(1,...s.months.map(m=>m[1]));
    $('monthlyStats').innerHTML=s.months.length?s.months.map(([month,count])=>`<div class="stat-bar-row"><span>${escapeHtml(month)}</span><span class="stat-bar"><i style="width:${Math.round(count/maximum*100)}%"></i></span><strong>${count}</strong></div>`).join(''):'<p class="profile-subtitle">Пока нет отмеченных просмотров.</p>';
    $('topRated').innerHTML=s.top.length?s.top.map(e=>`<p><a class="journey-profile" href="movie.html?id=${e.movie_id}">${escapeHtml(e.movie?.title||'Фильм недоступен')}</a> <strong style="color:var(--gold)">${e.rating}/10</strong></p>`).join(''):'<p class="profile-subtitle">Поставь личные оценки просмотренным фильмам.</p>';
    const rows=entries.filter(e=>tab==='all'||e.status===tab);
    $('diaryGrid').innerHTML=rows.length?rows.map(e=>`<article class="diary-card"><div class="diary-card-header">${e.movie?.posterUrl?`<img class="diary-cover" src="${escapeHtml(safeUrl(e.movie.posterUrl))}" alt="" loading="lazy">`:''}<div><h3><a href="movie.html?id=${e.movie_id}">${escapeHtml(e.movie?.title||'Фильм недоступен')}</a></h3><small class="profile-subtitle">${e.status==='watched'?'✓ Просмотрено':'＋ Хочу посмотреть'}${e.watched_on?' · '+escapeHtml(e.watched_on):''}</small></div></div>${e.rating!=null?`<strong style="color:var(--gold)">${e.rating}/10</strong>`:''}${e.note?`<p class="mt-2">${escapeHtml(e.note)}</p>`:''}<div class="journey-actions"><a href="movie.html?id=${e.movie_id}" class="journey-profile">Открыть / изменить</a><button class="filter-btn" type="button" data-remove="${e.movie_id}">Убрать</button></div></article>`).join(''):'<p class="profile-subtitle">Здесь пока пусто. Добавь фильм в дневник на его странице.</p>';
  }
  $('diaryTabs').addEventListener('click',event=>{const button=event.target.closest('[data-tab]');if(!button)return;tab=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button));render();});
  $('diaryGrid').addEventListener('click',async event=>{const button=event.target.closest('[data-remove]');if(!button||!confirm('Удалить запись, оценку и личную заметку из дневника?'))return;button.disabled=true;try{await api.delete('/journey/'+button.dataset.remove);entries=entries.filter(e=>String(e.movie_id)!==button.dataset.remove);render();}catch(e){$('profileMessage').textContent=e.message;button.disabled=false;}});
  (async()=>{try{
    if(!await supabaseApi.hasSession()){$('profileMessage').innerHTML='<a class="btn-red text-decoration-none" href="auth.html?returnTo=profile.html">Войти и открыть дневник</a>';return;}
    entries=await api.get('/journey');$('profileMessage').textContent='Личные оценки и заметки видны только тебе.';$('profileContent').hidden=false;render();
  }catch(e){$('profileMessage').textContent=e.message;}})();
})();
