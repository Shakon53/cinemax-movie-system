const freeFilms = [
  {title:'Big Buck Bunny',year:2008,genre:'Анимация, комедия',description:'Большой добрый кролик против трёх лесных хулиганов.',url:'https://peach.blender.org/',license:'CC BY 3.0',licenseUrl:'https://peach.blender.org/about/',credit:'© 2008 Blender Foundation / www.bigbuckbunny.org'},
  {title:'Sintel',year:2010,genre:'Анимация, фэнтези',description:'История девушки, которая отправляется на поиски маленького дракона.',url:'https://durian.blender.org/',license:'CC BY 3.0',licenseUrl:'https://durian.blender.org/about/',credit:'© Blender Foundation | durian.blender.org'}
];
function renderFreeFilms() {
  const query = document.getElementById('search').value.trim().toLocaleLowerCase();
  const films = freeFilms.filter(f => (f.title + ' ' + f.genre).toLocaleLowerCase().includes(query));
  document.getElementById('films').innerHTML = films.map(f => '<article class="free-card"><span>БЕСПЛАТНО · ' + f.year + '</span><h2>' + escapeHtml(f.title) + '</h2><p>' + escapeHtml(f.genre) + '</p><p>' + escapeHtml(f.description) + '</p>'+(f.movieID?'<a class="btn-red" href="movie.html?id='+Number(f.movieID)+'">'+(f.full?'Смотреть полностью':'Открыть карточку')+'</a><br>':'')+'<a href="' + escapeHtml(safeUrl(f.url)) + '" target="_blank" rel="noopener noreferrer">Официальная страница фильма ↗</a><small>' + escapeHtml(f.credit) + ' · <a href="' + escapeHtml(safeUrl(f.licenseUrl)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(f.license) + '</a></small></article>').join('');
  document.getElementById('empty').hidden = films.length > 0;
}
document.getElementById('search').addEventListener('input', renderFreeFilms);
renderFreeFilms();
api.getWithHeaders('/movies?free=true&pageSize=100').then(({data})=>{
  if(!data.length)return;
  freeFilms.splice(0,freeFilms.length,...data.map(m=>({movieID:m.movieID,title:m.title,year:m.releaseYear,genre:m.genreName,description:m.description,url:m.watchUrl,license:'Условия лицензии',licenseUrl:m.licenseUrl,credit:m.attribution,full:Boolean(CineMaxWatch.source(m.watchSourceUrl))})));
  renderFreeFilms();
}).catch(()=>{});
