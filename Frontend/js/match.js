(() => {
  let token, state, movies = new Map(), timer, voting = false, polling = false, currentMovie, revision = 0;
  const $ = id => document.getElementById(id);
  const error = message => { $('matchError').textContent = message || ''; };
  const rpc = (name, args = {}) => supabaseApi.match(name, args);
  function invitation() { const url = new URL('match.html', location.href); url.searchParams.set('room',state.code); return url.href; }
  async function loadMovies() {
    if (movies.size) return;
    const result = await api.getWithHeaders('/movies?pageSize=100');
    movies = new Map(result.data.map(m => [m.movieID,m]));
  }
  function render() {
    $('matchSetup').hidden = true; $('matchSession').hidden = false;
    $('roomCode').textContent = state.code;
    $('roomMembers').innerHTML = state.members.map(m => `<span class="match-member">${escapeHtml(m.name)}${m.host ? ' · создатель' : ''}<span class="match-status">${state.started ? ` · ${m.votes}/${state.candidates.length}` : ''}</span></span>`).join('');
    $('startRoom').hidden = !state.host || state.started;
    $('startRoom').disabled = state.members.length < 2;
    $('roomHint').textContent = state.started ? 'Выбор начался. Каждый голосует на своём устройстве.' : state.host ? 'Отправьте другу ссылку или код. Когда все присоединятся, нажмите «Начать».' : 'Вы в комнате. Дождитесь, пока создатель начнёт выбор.';
    $('matchResults').innerHTML = state.matches.length ? state.matches.map(id => `<div class="match-result"><strong>${escapeHtml(movies.get(id)?.title || 'Фильм')}</strong><br><a href="movie.html?id=${Number(id)}">Открыть карточку →</a></div>`).join('') : '<p class="match-status">Пока нет общего совпадения. Продолжайте выбирать.</p>';
    $('voteProgress').textContent = state.started ? `Ваш выбор: ${state.seen.length} из ${state.candidates.length}` : 'Скоро начнём';
    const next = state.started ? state.candidates.find(id => !state.seen.includes(id)) : undefined;
    $('voteActions').hidden = !next;
    if (!next) {
      currentMovie = undefined;
      $('voteCard').innerHTML = `<div class="empty-state" style="padding:28px 0"><i class="bi bi-${state.started ? 'check-circle' : 'people'}"></i><h3>${state.started ? 'Вы просмотрели все карточки' : 'Ждём участников'}</h3><p>${state.started ? 'Совпадения обновятся, когда остальные закончат выбирать. Если совпадений нет, создайте новую комнату и попробуйте ещё раз.' : 'Дождитесь друзей перед началом голосования.'}</p></div>`;
      return;
    }
    if (currentMovie === next) return;
    currentMovie = next;
    const m = movies.get(next);
    $('voteCard').innerHTML = m ? `<article class="match-card">${m.posterUrl ? `<img src="${escapeHtml(safeUrl(m.posterUrl))}" alt="${escapeHtml(m.title)}">` : ''}<div><h2>${escapeHtml(m.title)}</h2><p class="match-status">${m.releaseYear} · ${m.durationMinutes} мин · ${escapeHtml(m.genreName)}</p><p>${escapeHtml(m.description)}</p><a href="movie.html?id=${m.movieID}" target="_blank" rel="noopener noreferrer">Подробнее о фильме ↗</a></div></article>` : '<p>Фильм больше недоступен в каталоге. Его можно пропустить.</p>';
  }
  function startPolling() {
    clearInterval(timer);
    timer = setInterval(async () => {
      if (voting || polling || document.hidden) return;
      polling = true;
      const version = revision;
      try { const latest = await rpc('movie_match_state',{member_token:token}); if (version !== revision || voting) return; state = latest; error(''); render(); }
      catch(e) { if (Date.parse(state?.expiresAt) <= Date.now()) clearInterval(timer); error(e.message); }
      finally { polling = false; }
    },4000);
  }
  async function enter(method, args) {
    error('');
    const result = await rpc(method,args);
    token = result.token; state = result.state;
    sessionStorage.setItem('cinemax_match',JSON.stringify({token,code:state.code}));
    await loadMovies(); render(); startPolling();
  }
  for (const [id,method,args] of [
    ['createRoom','create_movie_match',()=>({display_name:$('hostName').value.trim()})],
    ['joinRoom','join_movie_match',()=>({room_code:$('roomCodeInput').value.trim(),display_name:$('guestName').value.trim()})]
  ]) $(id).addEventListener('submit',async event => {
    event.preventDefault(); const button=event.target.querySelector('button'); button.disabled=true;
    try { await enter(method,args()); } catch(e) { error(e.message); } finally { button.disabled=false; }
  });
  $('startRoom').addEventListener('click',async () => {
    revision++;
    $('startRoom').disabled=true; error('');
    try {state=await rpc('start_movie_match',{member_token:token}); render();}catch(e){error(e.message);$('startRoom').disabled=false;}
  });
  async function vote(liked) {
    if (voting || !currentMovie) return;
    voting=true; revision++; error(''); $('voteNo').disabled=$('voteYes').disabled=true;
    try {state=await rpc('vote_movie_match',{member_token:token,movie_id:currentMovie,liked});render();}
    catch(e){error(e.message);}
    finally {voting=false;$('voteNo').disabled=$('voteYes').disabled=false;}
  }
  $('voteYes').addEventListener('click',()=>vote(true)); $('voteNo').addEventListener('click',()=>vote(false));
  $('copyRoom').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(invitation());$('shareStatus').textContent='Ссылка скопирована. Отправьте её друзьям.';}
    catch {$('shareStatus').textContent=invitation();}
  });
  $('leaveRoom').addEventListener('click',()=>{clearInterval(timer);sessionStorage.removeItem('cinemax_match');location.href='match.html';});
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',event=>{if(event.persisted && token)startPolling();});
  if(localStorage.getItem('cinemax_theme')==='light')document.body.classList.add('light-mode');
  const code=new URLSearchParams(location.search).get('room'); if(code)$('roomCodeInput').value=code;
  (async()=>{
    try {
      const saved=JSON.parse(sessionStorage.getItem('cinemax_match')||'null');
      if(!saved || (code && code!==saved.code))return;
      token=saved.token;state=await rpc('movie_match_state',{member_token:token});await loadMovies();render();startPolling();
    }catch(e){sessionStorage.removeItem('cinemax_match');error(e.message);}
  })();
})();
