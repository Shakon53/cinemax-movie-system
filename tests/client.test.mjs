import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, readdir, access } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const file = p => readFile(new URL(p, root), 'utf8');

test('all scripts parse and page-local script files exist', async () => {
  for (const name of await readdir(new URL('Frontend/js/', root))) {
    if (name.endsWith('.js')) new vm.Script(await file('Frontend/js/' + name), { filename: name });
  }
  for (const name of await readdir(new URL('Frontend/', root))) {
    if (!name.endsWith('.html')) continue;
    const html = await file('Frontend/' + name);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const src = match[1].match(/\bsrc="([^"]+)"/);
      if (src) {
        if (!src[1].startsWith('https://')) await access(new URL('Frontend/' + src[1], root));
      } else if (match[2].trim()) new vm.Script(match[2], { filename: name });
    }
  }
});

async function adapterContext() {
  const calls = [];
  const state = { admin: false, session: null, data: [], count: 0 };
  const db = {
    auth: {
      signUp: async body => { calls.push(['signUp', body]); return { data: { session: state.session } }; },
      getUser: async () => ({ data: { user: { id: 'alice', email: 'alice@example.test' } } }),
      getSession: async () => ({ data: { session: state.session } }),
      signInWithPassword: async body => { calls.push(['signIn', body]); return { data: {} }; },
      signOut: async () => ({ data: null }),
      resetPasswordForEmail: async (...args) => { calls.push(['resetPassword', ...args]); return { data: {} }; },
      updateUser: async body => { calls.push(['updateUser', body]); return { data: {} }; }
    },
    rpc: async name => { calls.push(['rpc', name]); return { data: name === 'is_admin' ? state.admin : [] }; },
    from(table) {
      calls.push(['from', table]);
      const query = {};
      for (const method of ['select','eq','contains','ilike','in','gte','upsert','lte','order','range','or','insert','update','delete']) query[method] = (...args) => { calls.push([method, table, ...args]); return query; };
      query.single = async () => ({ data: table === 'profiles' ? { username: 'alice' } : state.data });
      query.then = (resolve, reject) => Promise.resolve({ data: state.tables?.[table] ?? state.data, count: state.count }).then(resolve, reject);
      return query;
    }
  };
  const context = vm.createContext({ URL, location: { href: 'https://cinemax-test.netlify.app/auth.html' },
    window: { CINEMAX_SUPABASE: { url: 'https://project.supabase.co', publishableKey: 'public-test-key' }, supabase: { createClient: () => db } } });
  vm.runInContext(await file('Frontend/js/supabase-api.js') + '\nglobalThis.adapter = supabaseApi;', context);
  return { context, api: context.adapter, calls, state };
}

test('signup without a session requires email confirmation and never invents a login', async () => {
  const { api, calls } = await adapterContext();
  const result = await api.post('/auth/register', { username: 'alice', email: ' alice@example.test ', password: 'long-password' });
  assert.equal(result.requiresEmailConfirmation, true);
  assert.equal(calls[0][1].options.emailRedirectTo, 'https://cinemax-test.netlify.app/auth.html');
  assert.equal(calls.some(c => c[0] === 'rpc'), false);
  await assert.rejects(api.post('/auth/register', { username: '<script>', email: 'x@example.test', password: 'long-password' }), /Имя/);
});

test('reviews use the authenticated identity and ordinary users cannot edit the catalog', async () => {
  const { api, calls } = await adapterContext();
  await api.post('/reviews', { movieID: 1, userID: 'victim', email: 'victim@example.test', commentText: ' Good film ', userRating: 8 });
  const row = calls.find(c => c[0] === 'insert')[2];
  assert.equal(row.userID, 'alice');
  assert.equal(row.commentText, 'Good film');
  assert.equal(Object.hasOwn(row, 'email'), false);
  await assert.rejects(api.put('/movies/1', { title: 'Unauthorized' }), /администратора/);
  assert.equal(calls.some(c => c[0] === 'update'), false);
});

test('movie pagination and relation mapping preserve the existing page contract', async () => {
  const { api, calls, state } = await adapterContext();
  state.data = [{ movieID: 1, title: 'Film', rating: '8.5', budget: '100', boxOffice: '200', genre: { genreName: 'Drama' }, director: { fullName: 'Director' }, country: { countryName: 'Country' }, ratingInfo: { imDbRating: '8.5', rottenTomatoes: 90 } }];
  state.count = 42;
  const result = await api.getWithHeaders('/movies?page=2&pageSize=10&sortBy=title&search=test),rating.gt.0');
  assert.equal(result.total, 42);
  assert.equal(result.data[0].genreName, 'Drama');
  assert.equal(result.data[0].rating, 8.5);
  assert.equal(result.data[0].imDbRating, 8.5);
  assert.deepEqual(calls.find(c => c[0] === 'range').slice(2), [10,19]);
  const search = calls.find(c => c[0] === 'or')[2];
  assert.equal(search.includes('rating.gt.0'), false);
});

test('actor name searches include both leading actors and cast links',async()=>{
 const {api,calls,state}=await adapterContext();state.tables={actors:[{actorID:1}],movieactors:[{movieID:7}],movies:[]};
 await api.getWithHeaders('/movies?search='+encodeURIComponent('ДиКаприо'));
 assert.equal(calls.find(c=>c[0]==='ilike')[3],'%Leonardo DiCaprio%');
 const filter=calls.find(c=>c[0]==='or')[2];assert.ok(filter.includes('mainActorID.in.(1)'));assert.ok(filter.includes('movieID.in.(7)'));
});

test('diary upserts bind the authenticated user and reject invalid personal scores',async()=>{
 const {api,calls}=await adapterContext();
 await api.post('/journey',{user_id:'victim',movieID:1,status:'watched',watched_on:'2026-10-19',rating:9,note:'Private'});
 const row=calls.find(c=>c[0]==='upsert')[2];assert.equal(row.user_id,'alice');assert.equal(row.note,'Private');
 await assert.rejects(api.post('/journey',{movieID:1,status:'watched',watched_on:'2026-10-19',rating:11}),/от 1 до 10/);
});

test('cloud favorites never copy a previous local guest list into an account', async () => {
  const { context, state, calls } = await adapterContext();
  state.session = { user: { id: 'alice' } };
  state.data = [{ movie_id: 2 }];
  context.api = context.adapter;
  const local = new Map([['cinemax_guest_favs','[9]']]);
  context.localStorage = { getItem: k => local.get(k) || null, setItem: (k,v) => local.set(k,v), removeItem: k => local.delete(k) };
  vm.runInContext(await file('Frontend/js/favorites.js') + '\nglobalThis.favorites = CineMaxFavorites;', context);
  assert.deepEqual(Array.from(await context.favorites.initialize()), [2]);
  await context.favorites.toggle(3);
  assert.equal(calls.find(c => c[0] === 'insert')[2].movie_id, 3);
  assert.equal(local.get('cinemax_guest_favs'), '[9]');
});

test('HTML escaping handles comments and quoted attributes', async () => {
  const context = vm.createContext({ window: {}, URL });
  vm.runInContext(await file('Frontend/js/api.js') + '\nglobalThis.escape = escapeHtml; globalThis.safe = safeUrl;', context);
  assert.equal(context.escape('<img src=x onerror="run()">\''), '&lt;img src=x onerror=&quot;run()&quot;&gt;&#39;');
  assert.equal(context.safe('javascript:alert(1)'), '');
});

test('mood, time and intensity are server-side filters; spoiler text is escaped and collapsed',async()=>{
 const {api,calls}=await adapterContext();
 await api.getWithHeaders('/movies?mood=cozy&maxMinutes=30&intensity=2&free=true');
 assert.deepEqual(Array.from(calls.find(c=>c[0]==='contains').slice(2)),['moods',calls.find(c=>c[0]==='contains')[3]]);
 assert.equal(calls.find(c=>c[0]==='contains')[3][0],'cozy');
 assert.ok(calls.some(c=>c[0]==='lte'&&c[2]==='durationMinutes'&&c[3]===30));
 assert.ok(calls.some(c=>c[0]==='lte'&&c[2]==='intensity'&&c[3]===2));
 const context=vm.createContext({window:{},URL});
 vm.runInContext(await file('Frontend/js/api.js')+'\nglobalThis.render=renderReviewText;',context);
 const html=context.render({containsSpoilers:true,commentText:'<script>alert(1)</script>'});
 assert.ok(html.startsWith('<details'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<details open'));
 assert.ok(!context.render({containsSpoilers:false,commentText:'Fine'}).includes('<details'));
});
