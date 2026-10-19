const CineMaxCatalog = (() => {
  const fields={searchInput:'search',yearSelect:'year',sortSelect:'sortBy',moodSelect:'mood',timeSelect:'maxMinutes',minTimeSelect:'minMinutes',intensitySelect:'intensity',accessSelect:'access',actorSelect:'actorId'};
  let restoreScroll=false;
  function restore(){
    const p=new URLSearchParams(location.search);
    for(const[id,key]of Object.entries(fields)){const el=document.getElementById(id);if(el&&p.has(key)){
      if(id==='actorSelect'&&p.get(key)){const option=document.createElement('option');option.value=p.get(key);option.textContent='Выбранный актёр';el.append(option);}
      el.value=p.get(key);
    }}
    currentGenre=p.get('genreId')||'';currentPage=Math.max(1,parseInt(p.get('page'))||1);
    restoreScroll=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  }
  function save(){
    const url=new URL(location.href),p=new URLSearchParams();
    for(const[id,key]of Object.entries(fields)){const value=document.getElementById(id)?.value;if(value&&!(key==='sortBy'&&value==='featured'))p.set(key,value);}
    if(currentGenre)p.set('genreId',currentGenre);if(currentPage>1)p.set('page',currentPage);
    url.search=p.toString();history.replaceState(history.state,'',url);
  }
  function rendered(){if(!restoreScroll)return;restoreScroll=false;try{const y=Number(sessionStorage.getItem('cinemax_catalog_scroll:'+location.search));if(Number.isFinite(y))requestAnimationFrame(()=>window.scrollTo(0,y));}catch{}}
  window.addEventListener('pagehide',()=>{try{sessionStorage.setItem('cinemax_catalog_scroll:'+location.search,String(window.scrollY));}catch{}});
  return {restore,save,rendered};
})();
