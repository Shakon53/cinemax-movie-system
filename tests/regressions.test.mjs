import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
const file = p => readFile(new URL('../Frontend/'+p,import.meta.url),'utf8');
const inline = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src=')).map(m=>m[2]).join('\n');
function screen() {
  const elements=new Map();
  const make=()=>({value:'',style:{},dataset:{},innerHTML:'',textContent:'',disabled:false,
    classList:{toggle(){},remove(){},add(){}},addEventListener(){},replaceChildren(){this.innerHTML='';},
    querySelectorAll(){return[];},querySelector(){return make();},appendChild(){}});
  return {elements,document:{body:make(),getElementById(id){if(!elements.has(id))elements.set(id,make());return elements.get(id);},querySelector(){return make();},querySelectorAll(){return[];},createElement:make}};
}

test('inline button and image fallback handlers are valid JavaScript',async()=>{
  for(const name of (await readdir(new URL('../Frontend/',import.meta.url))).filter(n=>n.endsWith('.html'))) {
    const html=(await file(name)).replace(/\$\{[^}]+\}/g,'1');
    for(const match of html.matchAll(/\bon\w+="([^"]*)"/g)) {
      const code=match[1].replace(/\$\{[^}]+\}/g,'1');
      new vm.Script('(function(event){'+code+'})',{filename:name});
    }
  }
});

test('failed login and confirmation-required signup show visible feedback',async()=>{
  const {document}=screen();
  const store=new Map([['cinemax_user','broken-json']]);
  const c=vm.createContext({document,window:{location:{}},localStorage:{getItem:k=>store.get(k),removeItem:k=>store.delete(k),setItem:(k,v)=>store.set(k,v)},
    api:{get:async()=>{throw new Error('Guest');},post:async path=>{if(path==='/auth/login')throw new Error('Wrong password');return {requiresEmailConfirmation:true};}}});
  vm.runInContext(inline(await file('auth.html')),c);
  await c.doLogin({preventDefault(){}});
  assert.equal(document.getElementById('alertError').textContent,'Wrong password');
  assert.equal(document.getElementById('alertError').style.display,'block');
  document.getElementById('regPass').value=document.getElementById('regPassConfirm').value='long-password';
  let reset=false;
  await c.doRegister({preventDefault(){},target:{reset(){reset=true;}}});
  assert.equal(document.getElementById('alertSuccess').style.display,'block');
  assert.equal(reset,true);
  assert.equal(store.has('cinemax_user'),false);
});

test('login returns to Netlify pretty movie URLs and rejects external destinations',async()=>{
 const {document}=screen();
 const c=vm.createContext({document,window:{},URL,URLSearchParams,location:{origin:'https://site.test',href:'https://site.test/auth',search:'?returnTo=%2Fmovie%3Fid%3D1'},localStorage:{getItem(){return null;}},api:{get:()=>new Promise(()=>{})}});
 vm.runInContext(inline(await file('auth.html')),c);
 assert.equal(c.authDestination(),'https://site.test/movie?id=1');
 c.location.search='?returnTo=https%3A%2F%2Fevil.test%2Fmovie';
 assert.equal(c.authDestination(),'index.html');
});

test('expired confirmation gives recovery instructions and never redirects or marks account confirmed',async()=>{
 const {document}=screen();let requested=false,cleaned=false;
 const c=vm.createContext({document,window:{location:{}},URLSearchParams,location:{hash:'#error=access_denied&error_code=otp_expired',search:'',pathname:'/auth'},history:{state:null,replaceState(){cleaned=true;}},localStorage:{getItem(){return null;},setItem(){throw Error('Must not create session');}},api:{get(){requested=true;}}});
 vm.runInContext(inline(await file('auth.html')),c);
 assert.match(document.getElementById('alertError').textContent,/истекла или уже использована/);assert.equal(document.getElementById('alertError').style.display,'block');assert.equal(requested,false);assert.equal(cleaned,true);assert.equal(c.window.location.href,undefined);
});

test('successful email callback waits for authenticated identity before redirecting',async()=>{
 const {document}=screen(),store=new Map();let resolve;
 const c=vm.createContext({document,window:{location:{}},URL,URLSearchParams,location:{hash:'#access_token=example&type=signup',search:'',pathname:'/auth',href:'https://site.test/auth',origin:'https://site.test'},localStorage:{getItem(){return null;},setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},api:{get:()=>new Promise(r=>{resolve=r;})}});
 vm.runInContext(inline(await file('auth.html')),c);assert.equal(c.window.location.href,undefined);
 resolve({userID:'alice',username:'Alice'});await new Promise(r=>setImmediate(r));assert.equal(c.window.location.href,'https://site.test/index.html');assert.equal(JSON.parse(store.get('cinemax_user')).userID,'alice');
});

test('slow earlier catalog requests cannot overwrite newer search results',async()=>{
  const {document}=screen();const requests=[];
  const c=vm.createContext({document,window:{},location:{search:''},CineMaxCatalog:{restore(){},save(){},rendered(){}},localStorage:{getItem(){return null;}},URLSearchParams,
    api:{get:async()=>[],getWithHeaders:()=>new Promise(resolve=>requests.push(resolve))},
    CineMaxFavorites:{initialize:async()=>[],list:()=>[]},loadCinemaHero(){},appendDiscoveryFilters(){},t:k=>k,escapeHtml:s=>s,applyLang(){}});
  vm.runInContext(inline(await file('index.html')),c);
  const old=c.loadMovies();const latest=c.loadMovies();
  requests[2]({data:[{movieID:1,title:'Latest result',description:'',genreName:'Drama',rating:8,releaseYear:2024}],total:1});
  await latest;
  assert.match(document.getElementById('moviesGrid').innerHTML,/Latest result/);
  requests[1]({data:[],total:0});await old;
  assert.match(document.getElementById('moviesGrid').innerHTML,/Latest result/);
});

test('trailer IDs accept official YouTube URL formats and reject other origins',async()=>{
  const c=vm.createContext({window:{},URL});vm.runInContext(await file('js/api.js'),c);
  for(const value of ['YoHD9XEInc0','https://www.youtube.com/watch?v=YoHD9XEInc0','https://youtu.be/YoHD9XEInc0?t=20','https://www.youtube.com/embed/YoHD9XEInc0'])assert.equal(c.youtubeVideoId(value),'YoHD9XEInc0');
  for(const value of ['https://evil.test/watch?v=YoHD9XEInc0','javascript:alert(1)','https://youtube.com.evil.test/watch?v=YoHD9XEInc0'])assert.equal(c.youtubeVideoId(value),'');
});

test('trailer iframe loads only after the visitor presses play',async()=>{
  const {document}=screen();
  const c=vm.createContext({document,window:{},location:{search:'?id=1'},URL,URLSearchParams,
    CineMaxJourney:{loadMovie(){}},CineMaxWatch:{mount(){}},api:{get:()=>new Promise(()=>{}),getWithHeaders:async()=>({data:[]})},escapeHtml:String,safeUrl:()=>'',formatMoney:()=>'',youtubeVideoId:()=> 'YoHD9XEInc0'});
  vm.runInContext(inline(await file('movie.html')),c);
  c.render({movieID:1,title:'Film',rating:8,genreID:1,actors:[],reviews:[]});
  assert.equal(document.getElementById('trailerFrame').src,undefined);
  c.playTrailer();
  assert.match(document.getElementById('trailerFrame').src,/youtube-nocookie.com\/embed\/YoHD9XEInc0/);
});
