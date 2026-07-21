(function(){
  var overlay=document.querySelector('.page-transition');
  if(!overlay)return;

  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var marker='feyonova-page-transition';
  var arriving=false;
  try{
    arriving=sessionStorage.getItem(marker)==='arrival';
    sessionStorage.removeItem(marker);
  }catch(_error){}
  if(window.name===marker){arriving=true;window.name=''}

  function finishArrival(){
    overlay.classList.add('is-ready');
    document.body.classList.remove('transition-lock');
  }

  if(arriving){
    overlay.classList.add('is-arrival');
    window.setTimeout(finishArrival,reduced?80:360);
  }else{
    window.addEventListener('load',function(){window.setTimeout(finishArrival,reduced?80:560)},{once:true});
  }

  function restartMark(){
    var mark=overlay.querySelector('.pt-mark');
    if(!mark)return;
    var fresh=mark.cloneNode(true);
    mark.replaceWith(fresh);
  }

  document.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var link=event.target.closest('a[href]');
    if(!link||link.target==='_blank'||link.hasAttribute('download')||link.hasAttribute('data-direct-navigation'))return;

    var raw=link.getAttribute('href');
    if(!raw||raw.charAt(0)==='#'||/^(mailto:|tel:|javascript:)/i.test(raw))return;

    var destination;
    try{destination=new URL(link.href,window.location.href)}catch(_error){return}
    if(destination.protocol!==window.location.protocol||destination.host!==window.location.host)return;
    if(destination.pathname===window.location.pathname&&destination.search===window.location.search)return;
    // Yalnızca sayfa (HTML) gezinmelerinde çalış; .png/.pdf gibi dosya bağlantılarını atla.
    var lastSegment=destination.pathname.split('/').pop();
    if(/\.[a-z0-9]{1,6}$/i.test(lastSegment)&&!/\.html$/i.test(lastSegment))return;

    event.preventDefault();
    document.body.classList.add('transition-lock');
    overlay.classList.remove('is-ready','is-arrival');
    restartMark();
    window.requestAnimationFrame(function(){overlay.classList.add('is-leaving')});
    try{sessionStorage.setItem(marker,'arrival')}catch(_error){}
    window.name=marker;
    window.setTimeout(function(){window.location.assign(destination.href)},reduced?120:560);
  });

  window.addEventListener('pageshow',function(event){
    if(event.persisted){overlay.classList.remove('is-leaving');finishArrival()}
  });
})();
