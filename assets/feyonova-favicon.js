(function(){
  var link=document.querySelector('link[data-feyonova-favicon]');
  if(!link)return;
  var canvas=document.createElement('canvas');
  canvas.width=64;canvas.height=64;
  var ctx=canvas.getContext('2d');
  ctx.fillStyle='#081f2d';
  ctx.beginPath();
  ctx.roundRect(3,3,58,58,13);
  ctx.fill();
  ctx.fillStyle='#21c7c1';
  ctx.fillRect(3,45,58,6);
  ctx.fillStyle='#ffffff';
  ctx.font='700 42px Arial, sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText('F',31,30);
  link.href=canvas.toDataURL('image/png');
})();
