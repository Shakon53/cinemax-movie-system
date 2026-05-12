const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_actors: 'Actors', nav_reviews: 'Reviews',
    nav_about: 'About', nav_favorites: 'Favorites', nav_admin: 'Admin',
    hero_title: 'Discover <span>Amazing</span> Movies',
    hero_sub: 'Explore thousands of films, ratings, and reviews',
    featured_badge: 'TOP RATED',
    stat_movies: 'Movies', stat_actors: 'Actors', stat_directors: 'Directors',
    btn_view_details: 'View Details', btn_watch_trailer: 'Watch Trailer',
    btn_view_details2: '<i class="bi bi-info-circle me-2"></i>Details',
    search_placeholder: 'Search movies by title or description...',
    sort_top: '⭐ Top Rated', sort_new: '📅 Newest', sort_az: '🔤 A-Z',
    year_all: 'All Years',
    genre_all: 'All',
    section_movies: 'All Movies',
    movies_found: 'movies found',
    no_movies: 'No movies found',
    no_movies_sub: 'Try adjusting your search or filters',
    failed_movies: 'Failed to load movies',
    failed_sub: 'API server is unavailable. Please try again in a moment.',
    pagination_prev: 'Prev', pagination_next: 'Next',
    footer_nav: 'Navigation', footer_more: 'More',
    footer_copy: '© 2025 CineMax. Built with ❤️ using ASP.NET Core 8, PostgreSQL & Bootstrap 5.',
    footer_desc: 'A full-stack Movie Management System built with ASP.NET Core 8 & Bootstrap 5.',
    actors_title: 'Meet the <span>Cast</span>',
    actors_sub: 'Talented actors from our movie collection',
    actors_intl: 'International Cast',
    actors_all: 'All', actors_male: 'Male', actors_female: 'Female', actors_oscar: 'Oscar Winners',
    actors_search: 'Search actors...',
    actors_section: 'All Actors',
    actors_no: 'No actors found',
    actor_age: 'years', actor_country: '', actor_salary: 'Salary',
    actor_oscar_none: 'No Oscar awards',
    detail_director: 'Director', detail_actor: 'Main Actor', detail_country: 'Country', detail_studio: 'Studio',
    detail_budget: 'Budget', detail_boxoffice: 'Box Office', detail_imdb: 'IMDb Rating', detail_rt: 'Rotten Tomatoes',
    detail_subtitles: 'Subtitles', detail_format: 'Format', detail_lang: 'Language', detail_age: 'Age Rating',
    detail_cast: 'Cast', detail_reviews: 'Reviews', detail_similar: '🎬 You May Also Like',
    detail_trailer: 'Official Trailer',
    review_write: 'Write a Review', review_name: 'Your name', review_email: 'Your email',
    review_text: 'Share your thoughts about this movie...', review_rating_label: 'Click to rate',
    review_submit: 'Submit Review', review_none: 'No reviews yet', review_first: 'Be the first to review!',
    review_success: 'Review submitted! 🎉', review_fail: 'Failed to submit review',
    review_select_rating: 'Please select a rating',
    ratings_overview: 'Ratings Overview', movie_info: 'Movie Info',
    sub_yes: '✅ Available', sub_no: '❌ Not available',
    back: '← Back',
    light: 'Light', dark: 'Dark',
    fav_added: 'added to favorites!', fav_removed: 'Removed from favorites',
  },
  ru: {
    nav_home: 'Главная', nav_actors: 'Актёры', nav_reviews: 'Отзывы',
    nav_about: 'О нас', nav_favorites: 'Избранное', nav_admin: 'Админ',
    hero_title: 'Откройте <span>Лучшие</span> Фильмы',
    hero_sub: 'Тысячи фильмов, рейтингов и рецензий',
    featured_badge: 'ТОП РЕЙТИНГ',
    stat_movies: 'Фильмы', stat_actors: 'Актёры', stat_directors: 'Режиссёры',
    btn_view_details: 'Подробнее', btn_watch_trailer: 'Смотреть трейлер',
    btn_view_details2: '<i class="bi bi-info-circle me-2"></i>Подробнее',
    search_placeholder: 'Поиск фильмов по названию или описанию...',
    sort_top: '⭐ По рейтингу', sort_new: '📅 Новые', sort_az: '🔤 А-Я',
    year_all: 'Все годы',
    genre_all: 'Все',
    section_movies: 'Все фильмы',
    movies_found: 'фильмов найдено',
    no_movies: 'Фильмы не найдены',
    no_movies_sub: 'Попробуйте изменить поиск или фильтры',
    failed_movies: 'Не удалось загрузить фильмы',
    failed_sub: 'Сервер недоступен. Попробуйте позже.',
    pagination_prev: 'Назад', pagination_next: 'Далее',
    footer_nav: 'Навигация', footer_more: 'Ещё',
    footer_copy: '© 2025 CineMax. Создано с ❤️ на ASP.NET Core 8, PostgreSQL и Bootstrap 5.',
    footer_desc: 'Система управления фильмами на ASP.NET Core 8 и Bootstrap 5.',
    actors_title: 'Познакомьтесь с <span>Актёрами</span>',
    actors_sub: 'Талантливые актёры нашей коллекции',
    actors_intl: 'Международный состав',
    actors_all: 'Все', actors_male: 'Мужчины', actors_female: 'Женщины', actors_oscar: 'Лауреаты Оскара',
    actors_search: 'Поиск актёров...',
    actors_section: 'Все актёры',
    actors_no: 'Актёры не найдены',
    actor_age: 'лет', actor_country: '', actor_salary: 'Гонорар',
    actor_oscar_none: 'Нет наград Оскар',
    detail_director: 'Режиссёр', detail_actor: 'Главный актёр', detail_country: 'Страна', detail_studio: 'Студия',
    detail_budget: 'Бюджет', detail_boxoffice: 'Сборы', detail_imdb: 'Рейтинг IMDb', detail_rt: 'Rotten Tomatoes',
    detail_subtitles: 'Субтитры', detail_format: 'Формат', detail_lang: 'Язык', detail_age: 'Возрастной рейтинг',
    detail_cast: 'В ролях', detail_reviews: 'Отзывы', detail_similar: '🎬 Вам также понравится',
    detail_trailer: 'Официальный трейлер',
    review_write: 'Написать отзыв', review_name: 'Ваше имя', review_email: 'Ваш email',
    review_text: 'Поделитесь мнением о фильме...', review_rating_label: 'Нажмите для оценки',
    review_submit: 'Отправить отзыв', review_none: 'Нет отзывов', review_first: 'Будьте первым!',
    review_success: 'Отзыв отправлен! 🎉', review_fail: 'Не удалось отправить отзыв',
    review_select_rating: 'Пожалуйста, выберите оценку',
    ratings_overview: 'Обзор рейтингов', movie_info: 'О фильме',
    sub_yes: '✅ Доступны', sub_no: '❌ Недоступны',
    back: '← Назад',
    light: 'Светлая', dark: 'Тёмная',
    fav_added: 'добавлен в избранное!', fav_removed: 'Удалено из избранного',
  },
  kz: {
    nav_home: 'Басты', nav_actors: 'Актёрлар', nav_reviews: 'Пікірлер',
    nav_about: 'Біз туралы', nav_favorites: 'Таңдаулы', nav_admin: 'Админ',
    hero_title: '<span>Керемет</span> Фильмдер',
    hero_sub: 'Мыңдаған фильмдер, рейтингтер мен пікірлер',
    featured_badge: 'ЕҢ ЖОҒАРЫ РЕЙТИНГ',
    stat_movies: 'Фильмдер', stat_actors: 'Актёрлар', stat_directors: 'Режиссёрлар',
    btn_view_details: 'Толығырақ', btn_watch_trailer: 'Трейлерді қарау',
    btn_view_details2: '<i class="bi bi-info-circle me-2"></i>Толығырақ',
    search_placeholder: 'Фильмді атауы немесе сипаттама бойынша іздеу...',
    sort_top: '⭐ Үздіктер', sort_new: '📅 Жаңалар', sort_az: '🔤 А-Я',
    year_all: 'Барлық жылдар',
    genre_all: 'Барлығы',
    section_movies: 'Барлық фильмдер',
    movies_found: 'фильм табылды',
    no_movies: 'Фильм табылмады',
    no_movies_sub: 'Іздеуді немесе сүзгіні өзгертіп көріңіз',
    failed_movies: 'Фильмдерді жүктеу сәтсіз аяқталды',
    failed_sub: 'Сервер қолжетімсіз. Кейінірек қайталап көріңіз.',
    pagination_prev: 'Алдыңғы', pagination_next: 'Келесі',
    footer_nav: 'Навигация', footer_more: 'Тағы да',
    footer_copy: '© 2025 CineMax. ASP.NET Core 8, PostgreSQL және Bootstrap 5-те жасалған.',
    footer_desc: 'ASP.NET Core 8 және Bootstrap 5-те жасалған фильм басқару жүйесі.',
    actors_title: '<span>Актёрлармен</span> танысыңыз',
    actors_sub: 'Фильм коллекциямыздың дарынды актёрлары',
    actors_intl: 'Халықаралық актёрлар',
    actors_all: 'Барлығы', actors_male: 'Ер', actors_female: 'Әйел', actors_oscar: 'Оскар жеңімпаздары',
    actors_search: 'Актёр іздеу...',
    actors_section: 'Барлық актёрлар',
    actors_no: 'Актёр табылмады',
    actor_age: 'жас', actor_country: '', actor_salary: 'Гонорар',
    actor_oscar_none: 'Оскар жоқ',
    detail_director: 'Режиссёр', detail_actor: 'Бас актёр', detail_country: 'Ел', detail_studio: 'Студия',
    detail_budget: 'Бюджет', detail_boxoffice: 'Жинаған ақша', detail_imdb: 'IMDb рейтингі', detail_rt: 'Rotten Tomatoes',
    detail_subtitles: 'Субтитрлер', detail_format: 'Формат', detail_lang: 'Тіл', detail_age: 'Жас шектеуі',
    detail_cast: 'Актёрлар', detail_reviews: 'Пікірлер', detail_similar: '🎬 Ұнауы мүмкін',
    detail_trailer: 'Ресми трейлер',
    review_write: 'Пікір жазу', review_name: 'Атыңыз', review_email: 'Электрондық поштаңыз',
    review_text: 'Фильм туралы пікіріңізді жазыңыз...', review_rating_label: 'Бағалау үшін басыңыз',
    review_submit: 'Пікір жіберу', review_none: 'Пікірлер жоқ', review_first: 'Бірінші болыңыз!',
    review_success: 'Пікір жіберілді! 🎉', review_fail: 'Пікірді жіберу сәтсіз аяқталды',
    review_select_rating: 'Баға таңдаңыз',
    ratings_overview: 'Рейтинг шолуы', movie_info: 'Фильм туралы',
    sub_yes: '✅ Қолжетімді', sub_no: '❌ Қолжетімсіз',
    back: '← Артқа',
    light: 'Ашық', dark: 'Күңгірт',
    fav_added: 'таңдаулыға қосылды!', fav_removed: 'Таңдаулылардан жойылды',
  }
};

const LANGS = { en: { label: 'EN', flag: '🇬🇧' }, ru: { label: 'RU', flag: '🇷🇺' }, kz: { label: 'KZ', flag: '🇰🇿' } };

let currentLang = localStorage.getItem('cinemax_lang') || 'en';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const val = t(key);
    if (attr) el.setAttribute(attr, val);
    else el.innerHTML = val;
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('cinemax_lang', lang);
  applyLang();
  if (typeof onLangChange === 'function') onLangChange();
}

function renderLangSwitcher(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Object.entries(LANGS).map(([code, info]) => `
    <button class="lang-btn ${code === currentLang ? 'active' : ''}" data-lang="${code}" onclick="setLang('${code}')" title="${info.label}">
      <span class="lang-flag">${info.flag}</span><span class="lang-label">${info.label}</span>
    </button>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderLangSwitcher('langSwitcher');
  applyLang();
});
