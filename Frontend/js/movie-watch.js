const CineMaxWatch=(()=>{
  function source(value){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port)return '';if(url.hostname==='video.blender.org'&&/^\/videos\/embed\/[a-f0-9-]{36}$/.test(url.pathname))return url.origin+url.pathname;if(url.hostname==='rutube.ru'&&/^\/play\/embed\/[a-f0-9]{32}\/$/.test(url.pathname))return url.origin+url.pathname;if(['www.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)&&/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname))return 'https://www.youtube-nocookie.com'+url.pathname;const allowed=['download.blender.org'];return allowed.includes(url.hostname)&&/\.mp4$/i.test(url.pathname)?url.href:'';}catch{return '';}}
  function mount(movie){
    const section=document.getElementById('fullMovieSection');if(!section)return;
    const url=movie.isFree?source(movie.watchSourceUrl):'';if(!url)return;
    section.hidden=false;const root=document.getElementById('fullMoviePlayer');
    if(['video.blender.org','rutube.ru','www.youtube-nocookie.com'].includes(new URL(url).hostname)){
      const frame=document.createElement('iframe');frame.src=url;frame.className='full-movie';frame.style.aspectRatio='16/9';frame.style.border='0';frame.title='Полный фильм: '+movie.title;frame.allowFullscreen=true;frame.loading='lazy';frame.setAttribute('allow','fullscreen; picture-in-picture');root.replaceChildren(frame);
      document.getElementById('fullMovieStatus').textContent=(movie.attribution||'')+(new URL(url).hostname!=='video.blender.org'?' · Полный фильм. Язык: '+(movie.languageName||'зависит от источника')+'. Если плеер недоступен, откройте фильм у правообладателя по ссылке выше. Доступность зависит от региона и видеосервиса.':' · Официальный плеер Blender, полный фильм. Язык зависит от источника.');return;
    }
    const video=document.createElement('video');video.className='full-movie';video.controls=true;video.preload='none';video.playsInline=true;video.setAttribute('aria-label','Полный фильм: '+movie.title);
    const media=document.createElement('source');media.src=url;media.type='video/mp4';video.append(media);root.replaceChildren(video);
    document.getElementById('fullMovieStatus').textContent=(movie.attribution||'')+' · Полный фильм, открытая лицензия. Язык озвучки зависит от источника.';
    video.addEventListener('error',()=>{document.getElementById('fullMovieStatus').textContent='Источник видео временно недоступен. Откройте официальную страницу фильма по ссылке выше.';});
  }
  return {source,mount};
})();
