/* 首頁交互：搜尋過濾、分類切換、進場動畫、數字遞增、指標光暈、磁吸按鈕 */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CAT=window.CATALOG||[], C=window.CAL;
  var grid=document.getElementById('calGrid'),
      chips=document.getElementById('calChips'),
      q=document.getElementById('calSearch'),
      empty=document.getElementById('calEmpty'),
      count=document.getElementById('calCount');
  var activeCat='全部', kw='';

  function actions(c){
    if(c.type==='page') return '<a class="b main" href="'+c.href+'">開啟專頁 →</a>';
    if(c.type==='gcal_id') return '<a class="b main" href="'+C.app(C.ics(c.id),c.title)+'">⚡ 加入 App</a>'+
      '<a class="b" href="'+C.webcal(c.id)+'">📱 訂閱</a>'+
      '<a class="b" target="_blank" rel="noopener" href="'+C.gcal(c.id)+'">🟦 Google</a>';
    if(c.type==='ics') return '<a class="b main" href="'+C.app(c.href,c.title)+'">⚡ 加入 App</a>'+
      '<a class="b" href="'+c.href.replace(/^https:/,'webcal:')+'">📱 訂閱</a>';
    return '<span class="b off">即將上線</span>';
  }
  function hit(c){
    if(activeCat!=='全部'&&c.cat!==activeCat) return false;
    if(!kw) return true;
    return (c.title+c.cat+c.desc).toLowerCase().indexOf(kw)>-1;
  }
  function render(){
    var list=CAT.filter(hit);
    grid.innerHTML=list.map(function(c,i){
      return '<article class="cal" style="--i:'+i+'" tabindex="0">'+
        '<span class="glow" aria-hidden="true"></span>'+
        '<header><span class="ic">'+c.icon+'</span><h3>'+c.title+'</h3><span class="tag">'+c.cat+'</span></header>'+
        (c.hot?'<p class="hot">'+c.hot+'</p>':'')+
        '<p class="desc">'+c.desc+'</p>'+
        '<div class="acts">'+actions(c)+'</div></article>';
    }).join('');
    empty.hidden=list.length>0;
    if(count) count.textContent=list.length;
    if(!reduce) requestAnimationFrame(function(){
      [].forEach.call(grid.children,function(el){el.classList.add('in');});
    }); else [].forEach.call(grid.children,function(el){el.classList.add('in');});
  }
  function renderChips(){
    var cats=['全部'].concat(CAT.map(function(c){return c.cat}).filter(function(v,i,a){return a.indexOf(v)===i}));
    chips.innerHTML=cats.map(function(c){
      return '<button type="button" class="chip'+(c===activeCat?' on':'')+'" data-cat="'+c+'">'+c+'</button>';
    }).join('');
  }
  if(grid){
    renderChips(); render();
    chips.addEventListener('click',function(e){
      var b=e.target.closest('.chip'); if(!b) return;
      activeCat=b.dataset.cat; renderChips(); render();
    });
    if(q) q.addEventListener('input',function(){ kw=q.value.trim().toLowerCase(); render(); });
  }

  /* 卡片光暈跟隨指標 */
  document.addEventListener('pointermove',function(e){
    var card=e.target.closest('.cal,.tpl,.step'); if(!card) return;
    var r=card.getBoundingClientRect();
    card.style.setProperty('--mx',(e.clientX-r.left)+'px');
    card.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});

  /* 進場動畫：逐層、逐項 */
  var io;
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    [].forEach.call(document.querySelectorAll('[data-reveal]'),function(el){io.observe(el);});
  }else{
    [].forEach.call(document.querySelectorAll('[data-reveal]'),function(el){el.classList.add('in');});
  }

  /* 數字遞增 */
  function countUp(el){
    var to=parseFloat(el.dataset.count), t0=null, dur=900;
    if(reduce){ el.textContent=to; return; }
    function tick(t){
      if(!t0) t0=t;
      var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(to*e);
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    var io2=new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){ countUp(x.target); io2.unobserve(x.target); } });
    },{threshold:.5});
    [].forEach.call(document.querySelectorAll('[data-count]'),function(el){io2.observe(el);});
  }else{
    [].forEach.call(document.querySelectorAll('[data-count]'),function(el){el.textContent=el.dataset.count;});
  }

  /* 模板列：拖曳捲動 */
  var rail=document.getElementById('tplRail');
  if(rail&&window.TEMPLATES){
    rail.innerHTML=window.TEMPLATES.map(function(t,i){
      return '<article class="tpl" style="--i:'+i+'"><span class="glow" aria-hidden="true"></span>'+
        '<span class="ic">'+t.icon+'</span><h3>'+t.title+'</h3><p>'+t.meta+'</p>'+
        '<span class="soon">即將上線</span></article>';
    }).join('');
    var down=false,sx=0,sl=0;
    rail.addEventListener('pointerdown',function(e){down=true;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('drag');});
    window.addEventListener('pointerup',function(){down=false;rail.classList.remove('drag');});
    rail.addEventListener('pointermove',function(e){ if(down) rail.scrollLeft=sl-(e.clientX-sx); },{passive:true});
  }

  /* 導覽：捲動後收窄 */
  var nav=document.querySelector('nav.site');
  if(nav) window.addEventListener('scroll',function(){
    nav.classList.toggle('shrink',window.scrollY>24);
  },{passive:true});

  /* 磁吸按鈕 */
  if(!reduce) [].forEach.call(document.querySelectorAll('[data-magnet]'),function(b){
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.14).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.22).toFixed(1)+'px)';
    });
    b.addEventListener('pointerleave',function(){b.style.transform='';});
  });
})();
