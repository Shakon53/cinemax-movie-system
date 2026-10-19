const CineMaxConcierge = (() => {
  function interpret(text, selectedMood='') {
    const s=String(text||'').toLowerCase();
    const avoidHorror=/не\s+(?:хочу\s+)?(?:страш|ужас)|без\s+(?:ужас|страш)|қорқынышты\s+емес/.test(s);
    const tired=/устал|устала|шарша|tired|без\s+напряг|отдохну|демал/.test(s);
    let mood=selectedMood;
    if(!mood){
      if(/романт|махаббат|romant|свидан/.test(s))mood='romantic';
      else if(!avoidHorror && /страш|ужас|қорқыныш|horror/.test(s))mood='horror';
      else if(/подум|ойлан|философ|think/.test(s))mood='thoughtful';
      else if(/смеш|весел|весёл|комеди|көңілді|күл|funny/.test(s))mood='happy';
      else if(tired || /спокой|тих|тыныш|calm|уют/.test(s))mood='calm';
      else if(/драйв|экшен|action|адреналин/.test(s))mood='adrenaline';
    }
    return {mood,tired,avoidHorror};
  }
  const ranges={short:[0,30],half:[30,60],evening:[60,120],long:[121,1000]};
  function recommend(movies,preferences,range,watched=[]) {
    const bounds=ranges[range];if(!bounds)return[];
    const wanted={happy:['happy','cozy'],calm:['calm','cozy'],romantic:['romantic'],horror:['horror'],thoughtful:['thoughtful'],adrenaline:['adrenaline','epic']}[preferences.mood]||[preferences.mood];
    return movies.filter(m=>m.durationMinutes>=bounds[0]&&m.durationMinutes<=bounds[1]&&!watched.includes(m.movieID))
      .filter(m=>!preferences.avoidHorror||!(m.moods||[]).includes('horror'))
      .filter(m=>!preferences.tired||Number(m.intensity)<=2)
      .map(m=>({movie:m,affinity:(m.moods||[]).some(v=>wanted.includes(v))?1:0}))
      .filter(row=>row.affinity>0).sort((a,b)=>b.movie.rating-a.movie.rating||a.movie.movieID-b.movie.movieID).slice(0,6).map(r=>r.movie);
  }
  return {interpret,recommend,ranges};
})();

document.addEventListener('DOMContentLoaded',()=>{
  const root=document.getElementById('movieConcierge');if(!root)return;
  root.innerHTML=`<div class="concierge-heading"><div><span class="featured-badge">FIND MY MOVIE</span><h2>Какой у тебя сегодня вечер?</h2><p>«Мен шаршадым…» или «Хочу что-нибудь смешное» — расскажи, а мы сузим выбор.</p></div><i class="bi bi-stars" aria-hidden="true"></i></div><form id="conciergeForm"><label for="conciergeText" class="visually-hidden">Расскажи о настроении</label><input id="conciergeText" class="search-bar" maxlength="600" placeholder="Я устал, хочу лёгкий фильм. Мен фильм көргім келеді…"><div class="concierge-fields"><label>Что хочется почувствовать?<select id="conciergeMood" class="filter-btn"><option value="">Определить по описанию</option><option value="happy">Көңілді · Посмеяться</option><option value="romantic">Романтика</option><option value="horror">Қорқынышты · Страшное</option><option value="thoughtful">Ойландыратын · Подумать</option><option value="calm">Тыныш · Отдохнуть</option><option value="adrenaline">Драйв</option></select></label><label>Сколько есть времени?<select id="conciergeTime" class="filter-btn" required><option value="">Выбрать время</option><option value="short">До 30 минут</option><option value="half">30–60 минут</option><option value="evening">1–2 часа</option><option value="long">Больше 2 часов</option></select></label><label class="concierge-checkbox"><input id="conciergeFree" type="checkbox">Только с полным бесплатным просмотром</label><button class="btn-red" type="submit">Подобрать мне фильм →</button></div></form><p id="conciergeStatus" class="concierge-status" role="status">Подбор по настроению, времени и редакционным меткам. Внешняя ИИ-модель не подключена.</p><div id="conciergeResults" class="diary-grid"></div>`;
  const $=id=>document.getElementById(id);
  $('conciergeForm').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.target.querySelector('[type="submit"]');button.disabled=true;
    const status=$('conciergeStatus'),grid=$('conciergeResults');grid.replaceChildren();
    const prefs=CineMaxConcierge.interpret($('conciergeText').value,$('conciergeMood').value);
    if(!prefs.mood){status.textContent='Что ближе: посмеяться, романтика, страшное, подумать или спокойное кино? Выбери настроение выше.';button.disabled=false;return;}
    try{
      status.textContent='Ищем в каталоге…';
      const first=await api.getWithHeaders('/movies?pageSize=100&sortBy=rating');let movies=first.data;
      for(let page=2;page<=Math.min(10,Math.ceil(first.total/100));page++)movies.push(...(await api.getWithHeaders('/movies?pageSize=100&page='+page)).data);
      if($('conciergeFree').checked)movies=movies.filter(m=>m.isFree&&CineMaxWatch.source(m.watchSourceUrl));
      let seen=[];try{if(await supabaseApi.hasSession())seen=(await api.get('/journey')).filter(e=>e.status==='watched').map(e=>e.movie_id);}catch{}
      let results=CineMaxConcierge.recommend(movies,prefs,$('conciergeTime').value,seen),aiExplanation='';
      if(window.CINEMAX_AI_ENABLED){
        try{const ai=await supabaseApi.recommend({message:$('conciergeText').value,mood:prefs.mood,time:$('conciergeTime').value,tired:prefs.tired,avoidHorror:prefs.avoidHorror});
          const range=CineMaxConcierge.ranges[$('conciergeTime').value];
          results=(ai.ids||[]).map(id=>movies.find(m=>m.movieID===id)).filter(m=>m&&!seen.includes(m.movieID)&&m.durationMinutes>=range[0]&&m.durationMinutes<=range[1]&&(!prefs.tired||m.intensity<=2)&&(!prefs.avoidHorror||!(m.moods||[]).includes('horror')));aiExplanation=String(ai.explanation||'Подбор ИИ по твоему описанию.');
        }catch{aiExplanation='ИИ временно недоступен — используем подбор по правилам каталога.';}
      }
      status.textContent=aiExplanation||(results.length?(prefs.tired?'Выбрали лёгкие фильмы, чтобы отдохнуть. ':'')+'Подходят настроение и длительность. Подбор по правилам каталога, без внешней ИИ-модели.':'Точного совпадения в каталоге пока нет. Попробуй другое время или настроение — условия автоматически не ослабляем.');
      grid.innerHTML=results.map(m=>`<article class="concierge-film">${m.posterUrl?`<img src="${escapeHtml(safeUrl(m.posterUrl))}" alt="" loading="lazy">`:''}<div><h3><a href="movie.html?id=${m.movieID}">${escapeHtml(m.title)}</a></h3><small>${m.releaseYear} · ${m.durationMinutes} мин · ${escapeHtml(m.genreName)}</small><p>${escapeHtml(m.description)}</p><a class="journey-profile" href="movie.html?id=${m.movieID}">Открыть фильм →</a>${m.isFree?' <span class="concierge-free">Полный просмотр</span>':''}</div></article>`).join('');
    }catch(e){status.textContent=e.message;}finally{button.disabled=false;}
  });
});
