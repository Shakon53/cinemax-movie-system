/* Supabase adapter for the existing CineMax screens. Access is enforced by SQL RLS. */
const supabaseApi = (() => {
  let client;
  function db() {
    if (client) return client;
    const config = window.CINEMAX_SUPABASE || {};
    if (!config.url || !config.publishableKey)
      throw new Error('Supabase ещё не подключён: заполните js/config.js.');
    if (!window.supabase?.createClient) throw new Error('Не удалось загрузить клиент Supabase.');
    client = window.supabase.createClient(config.url, config.publishableKey);
    return client;
  }
  function value(result) {
    if (result.error) {
      if (result.error.code === '23505') throw new Error('Такое имя или запись уже существует.');
      if (result.error.code === '42501') throw new Error('Недостаточно прав. Войдите в нужный аккаунт.');
      if (['42P01','PGRST205'].includes(result.error.code)) throw new Error('Личный дневник временно недоступен. Попробуйте позже.');
      throw new Error(result.error.message || 'Ошибка Supabase.');
    }
    return result.data;
  }
  async function currentUser() {
    const authUser = value(await db().auth.getUser())?.user;
    if (!authUser) throw new Error('Войдите в аккаунт.');
    const profile = value(await db().from('profiles').select('*').eq('userID', authUser.id).single());
    const admin = value(await db().rpc('is_admin'));
    return { userID: authUser.id, username: profile.username, email: authUser.email, role: admin ? 'Admin' : 'User' };
  }
  async function requireAdmin() {
    if (!value(await db().rpc('is_admin'))) throw new Error('Требуются права администратора.');
  }
  const movieSelect = '*,genre:genres(*),director:directors(*),country:countries(*),mainActor:actors!movies_mainActorID_fkey(*),ratingInfo:ratings(*)';
  const reviewSelect = '*,profile:profiles(username)';
  function review(row) {
    return { ...row, username: row.profile?.username || row.legacyUsername || 'Пользователь', userRating: Number(row.userRating), profile: undefined };
  }
  function movie(row) {
    const rating = Array.isArray(row.ratingInfo) ? row.ratingInfo[0] : row.ratingInfo;
    return { ...row, rating: Number(row.rating), budget: Number(row.budget), boxOffice: Number(row.boxOffice),
      genreName: row.genre?.genreName || '', directorName: row.director?.fullName || '',
      countryName: row.country?.countryName || '', mainActorName: row.mainActor?.fullName || null,
      imDbRating: rating?.imDbRating == null ? null : Number(rating.imDbRating),
      rottenTomatoes: rating?.rottenTomatoes ?? null,
      actors: (row.cast || []).map(c => ({ ...c.actor, roleName: c.roleName })),
      reviews: (row.reviews || []).map(review), genre: undefined, director: undefined,
      country: undefined, mainActor: undefined, ratingInfo: undefined, cast: undefined };
  }
  function actor(row) { return { ...row, salary: Number(row.salary), countryName: row.country?.countryName || '', country: undefined }; }
  const routeTables = { movies: ['movies','movieID'], actors: ['actors','actorID'], reviews: ['reviews','reviewID'],
    genres: ['genres','genreID'], countries: ['countries','countryID'], directors: ['directors','directorID'],
    movieactors: ['movieactors','movieActorID'], ratings: ['ratings','ratingID'], discounts: ['discounts','discountID'], boxoffice: ['boxoffice','boxOfficeID'] };
  const writable = {
    movies: ['title','description','releaseYear','durationMinutes','countryID','directorID','genreID','mainActorID','budget','boxOffice','rating','discountPercent','languageName','ageRestriction','productionCompany','subtitleAvailable','is3D','posterUrl','trailerUrl','watchUrl','watchSourceUrl','licenseUrl','attribution','isFree','moods','vibeTags','intensity','published'],
    actors: ['fullName','age','gender','countryID','oscarAwards','salary','photoUrl']
  };
  async function movieList(params) {
    const page = Math.max(1, parseInt(params.get('page')) || 1);
    const size = Math.min(100, Math.max(1, parseInt(params.get('pageSize')) || 10));
    let query = db().from('movies').select(movieSelect, { count: 'exact' });
    const search = params.get('search')?.trim();
    if (search) {
      // Strip PostgREST filter syntax; user input cannot introduce another filter.
      const term = search.replace(/[(),.*%_\\"]/g, ' ').trim().slice(0, 100);
      if (term) {
        const aliases=[['дикаприо','Leonardo DiCaprio'],['леонардо','Leonardo DiCaprio'],['том хэнкс','Tom Hanks'],['том ханкс','Tom Hanks'],['том харди','Tom Hardy'],['томас харди','Tom Hardy'],['гослинг','Ryan Gosling'],['джим керри','Jim Carrey'],['джим кэрри','Jim Carrey'],['эми адамс','Amy Adams'],['хью джекман','Hugh Jackman'],['эмма стоун','Emma Stone'],['хэтэуэй','Anne Hathaway'],['уинслет','Kate Winslet'],['бэйл','Christian Bale'],['бейл','Christian Bale'],['киллиан','Cillian Murphy'],['мерфи','Cillian Murphy'],['шаламе','Timothee Chalamet']];
        const actorTerm=aliases.find(([name])=>term.toLowerCase().includes(name))?.[1]||term;
        const actors = value(await db().from('actors').select('actorID').ilike('fullName', `%${actorTerm}%`)) || [];
        const actorIds = actors.map(a=>a.actorID).filter(Number.isSafeInteger);
        const cast = actorIds.length ? value(await db().from('movieactors').select('movieID').in('actorID',actorIds)) || [] : [];
        const clauses = [`title.ilike.%${term}%`,`description.ilike.%${term}%`];
        if (actorIds.length) clauses.push(`mainActorID.in.(${actorIds.join(',')})`);
        const castIds = [...new Set(cast.map(c=>c.movieID))].filter(Number.isSafeInteger);
        if (castIds.length) clauses.push(`movieID.in.(${castIds.join(',')})`);
        query = query.or(clauses.join(','));
      }
    }
    if (params.get('actorId')) {
      const id = Number(params.get('actorId'));
      if (!Number.isSafeInteger(id) || id < 1) throw new Error('Некорректный актёр.');
      const [cast,main] = await Promise.all([
        db().from('movieactors').select('movieID').eq('actorID',id),
        db().from('movies').select('movieID').eq('mainActorID',id)
      ]);
      const ids = [...new Set([...(value(cast)||[]),...(value(main)||[])].map(m=>m.movieID))];
      query = query.in('movieID',ids.length?ids:[-1]);
    }
    if (Number(params.get('minMinutes')) > 0) query = query.gte('durationMinutes',Number(params.get('minMinutes')));
    if (params.get('genreId')) query = query.eq('genreID', Number(params.get('genreId')));
    if (params.get('year')) query = query.eq('releaseYear', Number(params.get('year')));
    if (params.get('mood')) query = query.contains('moods', [params.get('mood')]);
    if (Number(params.get('maxMinutes')) > 0) query = query.lte('durationMinutes', Number(params.get('maxMinutes')));
    if (Number(params.get('intensity')) > 0) query = query.lte('intensity', Number(params.get('intensity')));
    if (params.get('free') === 'true') query = query.eq('isFree', true);
    const sort = { rating: 'rating', year: 'releaseYear', title: 'title' }[params.get('sortBy')] || 'rating';
    const result = await query.order(sort, { ascending: sort === 'title' }).order('movieID').range((page - 1) * size, page * size - 1);
    return { data: (value(result) || []).map(movie), total: result.count || 0 };
  }
  async function get(path) {
    const url = new URL(path, 'https://cinemax.local');
    const [name, id] = url.pathname.split('/').filter(Boolean);
    if (name === 'auth') {
      if (id === 'me') return currentUser();
      if (id === 'users') return value(await db().rpc('admin_users'));
    }
    if (name === 'favorites') {
      await currentUser();
      return (value(await db().from('favorites').select('movie_id')) || []).map(x => x.movie_id);
    }
    if (name === 'journey') {
      const user = await currentUser();
      let q = db().from('movie_journey').select(`*,movie:movies(${movieSelect})`).eq('user_id',user.userID).order('updated_at',{ascending:false});
      if (url.searchParams.get('movieId')) q = q.eq('movie_id',Number(url.searchParams.get('movieId')));
      return (value(await q)||[]).map(row=>({...row,movie:row.movie?movie(row.movie):null}));
    }
    if (name === 'movies') {
      if (!id) return (await movieList(url.searchParams)).data;
      return movie(value(await db().from('movies').select(movieSelect + ',cast:movieactors(roleName,actor:actors(*)),reviews(' + reviewSelect + ')').eq('movieID', Number(id)).single()));
    }
    if (name === 'actors') {
      let q = db().from('actors').select('*,country:countries(countryName)');
      return id ? actor(value(await q.eq('actorID', Number(id)).single())) : (value(await q.order('fullName')) || []).map(actor);
    }
    if (name === 'reviews') {
      let q = db().from('reviews').select(reviewSelect).order('reviewDate', { ascending: false });
      if (url.searchParams.get('movieId')) q = q.eq('movieID', Number(url.searchParams.get('movieId')));
      return (value(await q) || []).map(review);
    }
    if (name === 'directors') return (value(await db().from('directors').select('*,country:countries(countryName)').order('fullName')) || []).map(x => ({ ...x, country: x.country?.countryName || '' }));
    if (name === 'database') {
      await requireAdmin();
      if (id === 'summary') return value(await db().rpc('admin_summary'));
      if (id === 'users') return value(await db().rpc('admin_users'));
      if (!routeTables[id]) throw new Error('Неизвестная таблица.');
      return value(await db().from(routeTables[id][0]).select('*'));
    }
    if (name === 'genres' || name === 'countries') return value(await db().from(name).select('*'));
    throw new Error('Неизвестный запрос: ' + path);
  }
  async function post(path, body) {
    if (path === '/journey') {
      const user = await currentUser();
      if (!['want','watched'].includes(body.status)) throw new Error('Выберите статус фильма.');
      const id=Number(body.movieID);
      if (!Number.isSafeInteger(id)||id<1) throw new Error('Некорректный фильм.');
      const watched=body.status==='watched';
      const rating=watched && body.rating!=='' && body.rating!=null ? Number(body.rating) : null;
      if (rating!==null && (!Number.isInteger(rating)||rating<1||rating>10)) throw new Error('Оценка должна быть целым числом от 1 до 10.');
      const note=watched?String(body.note||'').trim():'';
      if(note.length>2000)throw new Error('Заметка: максимум 2000 символов.');
      const date=watched?String(body.watched_on||''):null;
      if(watched && (!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))))throw new Error('Укажите дату просмотра.');
      return value(await db().from('movie_journey').upsert({user_id:user.userID,movie_id:id,status:body.status,rating,note,watched_on:date,updated_at:new Date().toISOString()},{onConflict:'user_id,movie_id'}).select().single());
    }
    if (path === '/auth/password-reset') {
      value(await db().auth.resetPasswordForEmail(body.email.trim(), { redirectTo: new URL('reset.html', location.href).href }));
      return null;
    }
    if (path === '/auth/password-update') {
      if (body.password.length < 10) throw new Error('Пароль должен содержать минимум 10 символов.');
      value(await db().auth.updateUser({ password: body.password }));
      return null;
    }
    if (path === '/auth/login') {
      value(await db().auth.signInWithPassword({ email: body.email.trim(), password: body.password }));
      return currentUser();
    }
    if (path === '/auth/register') {
      const username = body.username.trim();
      if (!/^[A-Za-z0-9_-]{3,40}$/.test(username)) throw new Error('Имя: 3–40 латинских букв, цифр, знаков _ или -.');
      if (body.password.length < 10) throw new Error('Пароль должен содержать минимум 10 символов.');
      const data = value(await db().auth.signUp({ email: body.email.trim(), password: body.password,
        options: { data: { username }, emailRedirectTo: new URL('auth.html', location.href).href.split('?')[0] } }));
      if (!data.session) return { requiresEmailConfirmation: true };
      return currentUser();
    }
    if (path === '/auth/logout') { value(await db().auth.signOut()); return null; }
    if (path === '/reviews') {
      const comment = String(body.commentText || '').trim();
      const rating = Number(body.userRating);
      if (!comment || comment.length > 2000) throw new Error('Отзыв должен содержать от 1 до 2000 символов.');
      if (!Number.isInteger(Number(body.movieID)) || Number(body.movieID) < 1) throw new Error('Выберите фильм.');
      if (!Number.isFinite(rating) || rating < 1 || rating > 10) throw new Error('Оценка должна быть от 1 до 10.');
      const user = await currentUser();
      value(await db().from('reviews').insert({ userID: user.userID, movieID: Number(body.movieID), commentText: comment, userRating: rating, containsSpoilers: Boolean(body.containsSpoilers) }));
      return { message: 'Отзыв опубликован.' };
    }
    if (path === '/favorites') {
      const user = await currentUser();
      // Duplicate additions from another tab are harmless.
      const result = await db().from('favorites').insert({ user_id: user.userID, movie_id: Number(body.movieID) });
      if (result.error?.code !== '23505') value(result);
      return null;
    }
    const table = path.replace(/^\//, '');
    if (!writable[table]) throw new Error('Операция не поддерживается.');
    await requireAdmin();
    const row = Object.fromEntries(writable[table].filter(k => Object.hasOwn(body, k)).map(k => [k, body[k]]));
    return value(await db().from(table).insert(row).select().single());
  }
  async function put(path, body) {
    const [table, id] = path.split('/').filter(Boolean);
    if (!writable[table]) throw new Error('Операция не поддерживается.');
    await requireAdmin();
    const row = Object.fromEntries(writable[table].filter(k => Object.hasOwn(body, k)).map(k => [k, body[k]]));
    value(await db().from(table).update(row).eq(routeTables[table][1], Number(id)).select().single());
    return null;
  }
  async function remove(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'journey') {
      const user=await currentUser();
      value(await db().from('movie_journey').delete().eq('user_id',user.userID).eq('movie_id',Number(parts[1])));
      return null;
    }
    if (parts[0] === 'auth' && parts[1] === 'users') return value(await db().rpc('admin_delete_user', { target: parts[2] }));
    if (parts[0] === 'favorites') {
      const user = await currentUser();
      let query = db().from('favorites').delete().eq('user_id', user.userID);
      if (parts[1]) query = query.eq('movie_id', Number(parts[1]));
      value(await query); return null;
    }
    if (!['movies','actors','reviews'].includes(parts[0])) throw new Error('Операция не поддерживается.');
    if (parts[0] !== 'reviews') await requireAdmin();
    const [table, pk] = routeTables[parts[0]];
    const rows = value(await db().from(table).delete().eq(pk, Number(parts[1])).select(pk));
    if (!rows?.length) throw new Error('Запись не найдена или недостаточно прав.');
    return null;
  }
  const matchMethods = new Set(['create_movie_match','join_movie_match','movie_match_state','start_movie_match','vote_movie_match']);
  return { get, getWithHeaders: path => movieList(new URL(path, 'https://cinemax.local').searchParams), post, put, delete: remove,
    recommend: async body => value(await db().functions.invoke('movie-concierge',{body})),
    match: async (method, args) => { if (!matchMethods.has(method)) throw new Error('Неизвестная операция комнаты.'); return value(await db().rpc(method, args)); },
    hasSession: async () => Boolean(value(await db().auth.getSession())?.session) };
})();
