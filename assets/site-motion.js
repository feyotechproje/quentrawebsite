(function(){
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var track=document.createElement('div');
  track.className='site-scroll-track';track.setAttribute('aria-hidden','true');track.innerHTML='<span></span>';document.body.appendChild(track);
  function updateProgress(){
    var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    var value=Math.min(100,Math.max(0,(window.scrollY/max)*100));
    document.documentElement.style.setProperty('--site-scroll-progress',value.toFixed(2)+'%');
  }
  updateProgress();window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress,{passive:true});
  document.querySelectorAll('h1,h2,h3,h4').forEach(function(title){
    title.classList.add('motion-title');
    var align=getComputedStyle(title).textAlign;
    if(align!=='center')title.setAttribute('data-title-align','left');
  });
  var sections=Array.from(document.querySelectorAll('main > section'));
  sections.forEach(function(section,index){
    if(index===0||reduced){section.classList.add('motion-visible');return}
    section.classList.add('motion-section');
  });
  if(!reduced&&'IntersectionObserver' in window){
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}})},{threshold:.07,rootMargin:'0px 0px -8% 0px'});
    sections.slice(1).forEach(function(section){observer.observe(section)});
  }else{sections.forEach(function(section){section.classList.add('motion-visible')})}

  // Aynı sayfa içi çengel (anchor) linklerinde yumuşak kaydır ve adres çubuğundan #'i gizle.
  document.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var link=event.target.closest('a[href]');
    if(!link||link.target==='_blank')return;
    var raw=link.getAttribute('href');
    if(!raw||raw.charAt(0)!=='#'||raw==='#')return;
    var target=document.getElementById(raw.slice(1));
    event.preventDefault();
    if(target&&target.id!=='top'){
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    }else{
      window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
    }
    // URL'yi bölüm etiketi olmadan temiz bırak.
    if(window.history&&window.history.replaceState){
      window.history.replaceState(null,'',window.location.pathname+window.location.search);
    }
  });
})();
