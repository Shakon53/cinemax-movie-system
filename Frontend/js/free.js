const freeFilms = [
  {title:'Big Buck Bunny',year:2008,genre:'Анимация, комедия',description:'Большой добрый кролик против трёх лесных хулиганов.',url:'https://peach.blender.org/',license:'CC BY 3.0',licenseUrl:'https://peach.blender.org/about/',credit:'© 2008 Blender Foundation / www.bigbuckbunny.org'},
  {title:'Sintel',year:2010,genre:'Анимация, фэнтези',description:'История девушки, которая отправляется на поиски маленького дракона.',url:'https://durian.blender.org/',license:'CC BY 3.0',licenseUrl:'https://durian.blender.org/about/',credit:'© Blender Foundation | durian.blender.org'}
];
function renderFreeFilms() {
  const query = document.getElementById('search').value.trim().toLocaleLowerCase();
  const films = freeFilms.filter(f => (f.title + ' ' + f.genre).toLocaleLowerCase().includes(query));
  document.getElementById('films').innerHTML = films.map(f => '<article class="free-card"><span>БЕСПЛАТНО · ' + f.year + '</span><h2>' + escapeHtml(f.title) + '</h2><p>' + escapeHtml(f.genre) + '</p><p>' + escapeHtml(f.description) + '</p><a class="btn-red" href="' + f.url + '" target="_blank" rel="noopener noreferrer">Официальная страница фильма ↗</a><small>' + escapeHtml(f.credit) + ' · <a href="' + f.licenseUrl + '" target="_blank" rel="noopener noreferrer">' + f.license + '</a></small></article>').join('');
  document.getElementById('empty').hidden = films.length > 0;
}
document.getElementById('search').addEventListener('input', renderFreeFilms);
renderFreeFilms();
