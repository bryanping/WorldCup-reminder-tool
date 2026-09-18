/* 背景交互：時間網格 — 滑鼠附近格線發亮，光點沿格線流動 */
(function(){
  var cv=document.getElementById('bgcanvas'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=0,H=0,DPR=1,CELL=56;
  var mx=-9999,my=-9999,tmx=-9999,tmy=-9999,R=190;
  var dots=[],running=true;

  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=cv.clientWidth; H=cv.clientHeight;
    cv.width=W*DPR; cv.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    CELL=W<640?40:56;
    seed();
  }
  function seed(){
    dots=[];
    var n=W<640?10:18;
    for(var i=0;i<n;i++){
      var horiz=Math.random()<.5;
      dots.push({
        h:horiz,
        line:Math.floor(Math.random()*Math.ceil((horiz?H:W)/CELL))*CELL,
        p:Math.random()*(horiz?W:H),
        v:(0.25+Math.random()*0.5)*(Math.random()<.5?-1:1),
        a:0.25+Math.random()*0.45
      });
    }
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    mx+=(tmx-mx)*0.08; my+=(tmy-my)*0.08;
    var cols=Math.ceil(W/CELL)+1, rows=Math.ceil(H/CELL)+1, i, j;

    /* 格線：離滑鼠越近越亮 */
    for(i=0;i<cols;i++){
      var x=i*CELL;
      var d=Math.abs(x-mx);
      var t=Math.max(0,1-d/R);
      ctx.strokeStyle='rgba(79,140,255,'+(0.05+t*0.30).toFixed(3)+')';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x+.5,0); ctx.lineTo(x+.5,H); ctx.stroke();
    }
    for(j=0;j<rows;j++){
      var y=j*CELL;
      var dy=Math.abs(y-my);
      var ty=Math.max(0,1-dy/R);
      ctx.strokeStyle='rgba(79,140,255,'+(0.05+ty*0.30).toFixed(3)+')';
      ctx.beginPath(); ctx.moveTo(0,y+.5); ctx.lineTo(W,y+.5); ctx.stroke();
    }

    /* 滑鼠所在格：高亮方塊，像被選中的日期 */
    if(mx>-999){
      var cx=Math.floor(mx/CELL)*CELL, cy=Math.floor(my/CELL)*CELL;
      var g=ctx.createRadialGradient(mx,my,0,mx,my,R);
      g.addColorStop(0,'rgba(79,140,255,0.13)');
      g.addColorStop(1,'rgba(79,140,255,0)');
      ctx.fillStyle=g; ctx.fillRect(mx-R,my-R,R*2,R*2);
      ctx.fillStyle='rgba(79,140,255,0.14)';
      ctx.fillRect(cx+1,cy+1,CELL-2,CELL-2);
      ctx.strokeStyle='rgba(79,140,255,0.55)';
      ctx.strokeRect(cx+.5,cy+.5,CELL-1,CELL-1);
    }

    /* 沿格線流動的光點 */
    for(i=0;i<dots.length;i++){
      var p=dots[i];
      if(!reduce){ p.p+=p.v; }
      var len=p.h?W:H;
      if(p.p<-20) p.p=len+20; if(p.p>len+20) p.p=-20;
      var px=p.h?p.p:p.line, py=p.h?p.line:p.p;
      var tail=ctx.createLinearGradient(px-(p.h?26*Math.sign(p.v):0),py-(p.h?0:26*Math.sign(p.v)),px,py);
      tail.addColorStop(0,'rgba(34,197,94,0)');
      tail.addColorStop(1,'rgba(34,197,94,'+p.a.toFixed(2)+')');
      ctx.strokeStyle=tail; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(px-(p.h?26*Math.sign(p.v):0),py-(p.h?0:26*Math.sign(p.v)));
      ctx.lineTo(px,py); ctx.stroke();
      ctx.fillStyle='rgba(134,239,172,'+Math.min(1,p.a+.25).toFixed(2)+')';
      ctx.beginPath(); ctx.arc(px,py,1.8,0,6.283); ctx.fill();
    }
    if(running) requestAnimationFrame(draw);
  }

  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect();
    tmx=e.clientX-r.left; tmy=e.clientY-r.top;
  },{passive:true});
  window.addEventListener('pointerleave',function(){tmx=-9999;tmy=-9999;},{passive:true});
  document.addEventListener('visibilitychange',function(){
    running=!document.hidden; if(running) requestAnimationFrame(draw);
  });
  /* 背景只在首屏區塊可見時繪製 */
  var host=cv.parentElement;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      var vis=en[0].isIntersecting;
      if(vis&&!running){running=true;requestAnimationFrame(draw);}
      if(!vis){running=false;}
    },{threshold:0}).observe(host);
  }
  resize(); requestAnimationFrame(draw);
})();
