function appendDiscoveryFilters(params) {
  for (const [id, key] of [['moodSelect','mood'],['timeSelect','maxMinutes'],['intensitySelect','intensity']]) {
    const value = document.getElementById(id)?.value;
    if (value) params.set(key, value);
  }
  if (document.getElementById('accessSelect')?.value === 'free') params.set('free','true');
  return params;
}
document.addEventListener('DOMContentLoaded', () => {
  for (const id of ['moodSelect','timeSelect','intensitySelect','accessSelect']) {
    document.getElementById(id)?.addEventListener('change', () => { currentPage = 1; loadMovies(); });
  }
  document.getElementById('resetDiscovery')?.addEventListener('click', () => {
    for (const id of ['moodSelect','timeSelect','intensitySelect','accessSelect','yearSelect','searchInput']) document.getElementById(id).value = '';
    currentGenre = ''; currentPage = 1;
    const all = document.querySelector('#genreFilters [data-genre=""]');
    if (all) setActiveGenre(all);
    loadMovies();
  });
  document.getElementById('randomMovie')?.addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true;
    try {
      const params = appendDiscoveryFilters(new URLSearchParams({ pageSize:'1',page:'1',sortBy:document.getElementById('sortSelect').value }));
      const search = document.getElementById('searchInput').value.trim();
      if (search) params.set('search', search);
      if (currentGenre) params.set('genreId',currentGenre);
      if (document.getElementById('yearSelect').value) params.set('year',document.getElementById('yearSelect').value);
      const first = await api.getWithHeaders('/movies?' + params);
      if (!first.total) { showToast('По этим условиям пока нет фильмов. Попробуйте изменить фильтры.','error'); return; }
      const chosen = Math.floor(Math.random()*first.total)+1;
      params.set('page',chosen);
      const result = chosen === 1 ? first : await api.getWithHeaders('/movies?' + params);
      if (result.data[0]) location.href = 'movie.html?id=' + result.data[0].movieID;
    } catch(error) { showToast(error.message,'error'); }
    finally { button.disabled = false; }
  });
});
