import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {stripTypeScriptTypes} from 'node:module';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('optional AI server function has valid TypeScript syntax',async()=>{
  new vm.Script(stripTypeScriptTypes(await read('supabase/functions/movie-concierge/index.ts')));
});

test('private diary, catalog expansion, full films and AI rate limit execute in PostgreSQL',async()=>{
 const db=new PGlite();
 try{
  await db.exec((await read('tests/security.test.mjs')).match(/await db\.exec\(`([\s\S]*?)`\);/)[1]);
  await db.exec(await read('supabase/migrations/202610150001_cinemax.sql'));
  await db.exec(await read('supabase/seed.sql'));
  for(const name of ['202610150003_vibes_match','202610190005_movie_journey','202610190006_expand_catalog','202610190007_movie_concierge'])await db.exec(await read('supabase/migrations/'+name+'.sql'));
  await db.exec(await read('supabase/migrations/202610190006_expand_catalog.sql'));
  assert.equal((await db.query('select count(*)::int n from public.movies where published')).rows[0].n,36);
  assert.equal((await db.query('select count(*)::int n from public.movies where "watchSourceUrl"<>\'\' and "isFree"')).rows[0].n,4);
  const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
  for(const[id,name]of[[alice,'alice'],[bob,'bob']])await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,name+'@example.test',JSON.stringify({username:name})]);
  async function as(id,sql,args=[]){await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);try{return await db.query(sql,args);}finally{await db.exec('reset role');}}
  await as(alice,'insert into public.movie_journey(user_id,movie_id,status,rating,note,watched_on) values($1,1,\'watched\',9,\'Private note\',\'2026-09-15\')',[alice]);
  assert.equal((await as(bob,'select * from public.movie_journey')).rows.length,0);
  await assert.rejects(as(bob,'insert into public.movie_journey(user_id,movie_id,status) values($1,2,\'want\')',[alice]),/row-level security/);
  assert.equal((await as(bob,'update public.movie_journey set note=\'stolen\' where movie_id=1 returning *')).rows.length,0);
  assert.equal((await as(bob,'delete from public.movie_journey returning *')).rows.length,0);
  assert.equal((await as(alice,'select note from public.movie_journey')).rows[0].note,'Private note');
  await assert.rejects(as(alice,'update public.movie_journey set rating=11'),/check constraint/);
  await assert.rejects(as(alice,'update public.movie_journey set status=\'want\''),/check constraint/);
  await assert.rejects(as(alice,'truncate public.movie_journey'),/permission denied/);
  assert.equal((await as(alice,'select public.reserve_movie_concierge() ok')).rows[0].ok,true);
  assert.equal((await as(alice,'select public.reserve_movie_concierge() ok')).rows[0].ok,false);
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.movie_journey'),/permission denied/);
  await assert.rejects(db.query('select public.reserve_movie_concierge()'),/permission denied/);
 }finally{await db.close();}
});

test('personal stats use only watched entries, their genres and actual viewing month',async()=>{
 const c=vm.createContext({});vm.runInContext(await read('Frontend/js/journey.js')+'\nglobalThis.stats=CineMaxJourney.stats;',c);
 const result=c.stats([{status:'watched',rating:8,watched_on:'2026-09-30',movie:{title:'A',genreName:'Drama'}},{status:'watched',rating:10,watched_on:'2026-10-01',movie:{title:'B',genreName:'Drama'}},{status:'want',rating:null,movie:{title:'C',genreName:'Comedy'}}]);
 assert.equal(result.watched,2);assert.equal(result.want,1);assert.equal(result.genres[0][0],'Drama');assert.equal(result.genres[0][1],2);assert.equal(result.months[0][0],'2026-09');assert.equal(result.months[1][0],'2026-10');assert.equal(result.top[0].movie.title,'B');
});

test('tired and negative-horror requests respect mood, duration and watched exclusions',async()=>{
 const c=vm.createContext({document:{addEventListener(){}}});vm.runInContext(await read('Frontend/js/concierge.js')+'\nglobalThis.engine=CineMaxConcierge;',c);
 const prefs=c.engine.interpret('Мен шаршадым, не хочу страшное');assert.equal(prefs.mood,'calm');assert.equal(prefs.avoidHorror,true);assert.equal(prefs.tired,true);
 const movies=[{movieID:1,durationMinutes:100,intensity:1,moods:['calm'],rating:8},{movieID:2,durationMinutes:100,intensity:4,moods:['calm'],rating:9},{movieID:3,durationMinutes:150,intensity:1,moods:['calm'],rating:9},{movieID:4,durationMinutes:90,intensity:1,moods:['calm','horror'],rating:9}];
 assert.deepEqual(Array.from(c.engine.recommend(movies,prefs,'evening').map(m=>m.movieID)),[1]);
 assert.equal(c.engine.recommend(movies,prefs,'evening',[1]).length,0);
});

test('full movie player accepts only verified Blender embed or approved MP4 origins',async()=>{
 const c=vm.createContext({URL});vm.runInContext(await read('Frontend/js/movie-watch.js')+'\nglobalThis.source=CineMaxWatch.source;',c);
 assert.ok(c.source('https://video.blender.org/videos/embed/bf1f3fb5-b119-4f9f-9930-8e20e892b898'));
 assert.equal(c.source('https://evil.test/movie.mp4'),'');assert.equal(c.source('https://video.blender.org.evil.test/videos/embed/bf1f3fb5-b119-4f9f-9930-8e20e892b898'),'');assert.equal(c.source('javascript:alert(1)'),'');
});

test('catalog navigation serializes and restores filters, page and scroll after Back',async()=>{
 const fields=new Map();const element=()=>({value:'',append(){}});for(const id of ['searchInput','yearSelect','sortSelect','moodSelect','timeSelect','minTimeSelect','intensitySelect','accessSelect','actorSelect'])fields.set(id,element());
 const c=vm.createContext({URL,URLSearchParams,currentPage:1,currentGenre:'',location:{href:'https://site.test/index.html?search=Leonardo&genreId=4&actorId=1&page=2&mood=thoughtful',search:'?search=Leonardo&genreId=4&actorId=1&page=2&mood=thoughtful'},document:{getElementById:id=>fields.get(id),createElement:element},performance:{getEntriesByType:()=>[{type:'back_forward'}]},window:{addEventListener(){},scrollTo(x,y){c.scroll=y;}},history:{state:null,replaceState(a,b,url){c.saved=String(url);}},sessionStorage:{getItem:()=> '880'},requestAnimationFrame:fn=>fn()});
 vm.runInContext(await read('Frontend/js/catalog-state.js')+'\nglobalThis.catalog=CineMaxCatalog;',c);c.catalog.restore();c.catalog.save();c.catalog.rendered();
 assert.equal(fields.get('searchInput').value,'Leonardo');assert.equal(fields.get('actorSelect').value,'1');assert.equal(c.currentGenre,'4');assert.equal(c.currentPage,2);assert.match(c.saved,/page=2/);assert.match(c.saved,/mood=thoughtful/);assert.equal(c.scroll,880);
});
