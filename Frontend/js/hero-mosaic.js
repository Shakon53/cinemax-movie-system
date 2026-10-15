/* Real catalog posters; no remote demo assets or additional dependencies. */
(() => {
  const copy = {
    en: { cinema_eyebrow: 'GOOD FILMS. YOUR KIND OF EVENING.', cinema_title: '<span>A new story.</span><span>A new <em>feeling.</em></span>', cinema_intro: 'Find a film for your mood. Discover something unexpected or choose your next watch together.', cinema_catalog: 'Explore movies', cinema_friends: 'Choose with friends', cinema_pause: 'Pause motion', cinema_resume: 'Resume motion', cinema_loading: 'Loading the collection…', cinema_unavailable: 'The collection is temporarily unavailable. Try refreshing the page.', cinema_free: 'FREE' },
    ru: { cinema_eyebrow: 'ХОРОШЕЕ КИНО. ТВОЙ ВЕЧЕР.', cinema_title: '<span>Новая история.</span><span>Новые <em>эмоции.</em></span>', cinema_intro: 'Найди фильм под своё настроение. Открой что-то неожиданное или выбери, что посмотреть, вместе с друзьями.', cinema_catalog: 'Выбрать фильм', cinema_friends: 'Выбрать с друзьями', cinema_pause: 'Остановить', cinema_resume: 'Продолжить', cinema_loading: 'Загружаем коллекцию…', cinema_unavailable: 'Коллекция временно недоступна. Попробуй обновить страницу.', cinema_free: 'БЕСПЛАТНО' },
    kz: { cinema_eyebrow: 'ЖАҚСЫ КИНО. СЕНІҢ КЕШІҢ.', cinema_title: '<span>Жаңа оқиға.</span><span>Жаңа <em>сезім.</em></span>', cinema_intro: 'Көңіл күйіңе сай фильм тап. Өзің үшін жаңалық аш немесе достарыңмен бірге таңда.', cinema_catalog: 'Фильм таңдау', cinema_friends: 'Достармен таңдау', cinema_pause: 'Тоқтату', cinema_resume: 'Жалғастыру', cinema_loading: 'Жинақ жүктелуде…', cinema_unavailable: 'Жинақ уақытша қолжетімсіз. Бетті жаңартып көріңіз.', cinema_free: 'ТЕГІН' }
  };
  Object.entries(copy).forEach(([lang, values]) => Object.assign(TRANSLATIONS[lang], values));
  const hero = document.getElementById('featuredHero');
  const columns = document.getElementById('cinemaColumns');
  const status = document.getElementById('cinemaWallStatus');
  const motion = document.getElementById('cinemaMotion');
  function setMotion(paused) {
    hero.classList.toggle('is-paused', paused);
    hero.classList.toggle('is-playing', !paused);
    motion.setAttribute('aria-pressed', String(paused));
    motion.querySelector('i').className = paused ? 'bi bi-play-fill' : 'bi bi-pause-fill';
    const label = motion.querySelector('span');
    label.dataset.i18n = paused ? 'cinema_resume' : 'cinema_pause';
    label.textContent = t(label.dataset.i18n);
  }
  // Start the poster wall automatically on every visit.
  setMotion(false);
  // Capture also handles image errors in the duplicated loop tiles.
  columns.addEventListener('error', event => {
    if (event.target.tagName === 'IMG') event.target.remove();
  }, true);
  motion.addEventListener('click', () => {
    setMotion(!hero.classList.contains('is-paused'));
  });

  function tile(movie) {
    const link = document.createElement('a');
    link.className = 'cinema-tile';
    link.href = `movie.html?id=${encodeURIComponent(movie.movieID)}`;
    link.setAttribute('aria-label', movie.title || 'Movie');
    const poster = safeUrl(movie.posterUrl);
    if (poster) {
      const image = document.createElement('img');
      image.src = poster;
      image.alt = '';
      image.decoding = 'async';
      link.append(image);
    }
    if (movie.isFree) {
      const badge = document.createElement('span');
      badge.className = 'cinema-tile-free';
      badge.dataset.i18n = 'cinema_free';
      badge.textContent = t('cinema_free');
      link.append(badge);
    }
    const info = document.createElement('span');
    info.className = 'cinema-tile-info';
    const title = document.createElement('span');
    title.className = 'cinema-tile-title';
    title.textContent = movie.title;
    const meta = document.createElement('span');
    meta.className = 'cinema-tile-meta';
    const year = document.createElement('span');
    year.textContent = movie.releaseYear || '';
    const rating = document.createElement('span');
    rating.className = 'cinema-tile-rating';
    rating.textContent = `★ ${Number(movie.rating || 0).toFixed(1)}`;
    meta.append(year, rating);
    info.append(title, meta);
    link.append(info);
    return link;
  }

  let collection;
  window.loadCinemaHero = async () => {
    // Language switches reuse the collection instead of restarting the animation.
    if (!collection) collection = api.getWithHeaders('/movies?pageSize=15&sortBy=rating').catch(error => { collection = null; throw error; });
    try {
      const { data: movies, total } = await collection;
      document.getElementById('statMovies').textContent = total;
      if (columns.childElementCount) return;
      if (!movies.length) throw new Error('Empty catalog');
      const fragment = document.createDocumentFragment();
      for (let col = 0; col < Math.min(3, movies.length); col++) {
        const column = document.createElement('div');
        column.className = 'cinema-column';
        const track = document.createElement('div');
        track.className = 'cinema-track';
        const set = document.createElement('div');
        set.className = 'cinema-poster-set';
        movies.filter((_, i) => i % 3 === col).forEach(movie => set.append(tile(movie)));
        // A short collection still fills the hero without a blank section.
        const originals = [...set.children];
        while (set.childElementCount < 4) originals.forEach(item => set.append(item.cloneNode(true)));
        const duplicate = set.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.querySelectorAll('a').forEach(link => link.tabIndex = -1);
        track.append(set, duplicate);
        column.append(track);
        fragment.append(column);
      }
      columns.replaceChildren(fragment);
      status.hidden = true;
      motion.hidden = false;
    } catch (error) {
      status.dataset.i18n = 'cinema_unavailable';
      status.textContent = t('cinema_unavailable');
    }
  };
})();
