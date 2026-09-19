(function(){
  /* 進場 */
  function reveal(){
    var els=document.querySelectorAll('[data-in]:not(.on)');
    if(!('IntersectionObserver' in window)){[].forEach.call(els,function(e){e.classList.add('on')});return}
    var io=new IntersectionObserver(function(en){
      en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})
    },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    [].forEach.call(els,function(e){io.observe(e)});
  }
  reveal();

  /* 拖曳捲動 */
  [].forEach.call(document.querySelectorAll('.rail'),function(r){
    var down=false,sx=0,sl=0,moved=0;
    r.addEventListener('pointerdown',function(e){down=true;moved=0;sx=e.clientX;sl=r.scrollLeft;r.classList.add('drag')});
    addEventListener('pointerup',function(){down=false;r.classList.remove('drag')});
    r.addEventListener('pointermove',function(e){if(!down)return;moved+=Math.abs(e.clientX-sx);r.scrollLeft=sl-(e.clientX-sx)},{passive:true});
    r.addEventListener('click',function(e){if(moved>12)e.preventDefault()},true);
  });

  /* 提示 */
  var tEl;
  window.toast=function(msg){
    if(!tEl){tEl=document.createElement('div');tEl.className='toast';document.body.appendChild(tEl)}
    tEl.textContent=msg; tEl.classList.add('on');
    clearTimeout(tEl._t); tEl._t=setTimeout(function(){tEl.classList.remove('on')},2600);
  };

  /* 日曆目錄 */
  var grid=document.getElementById('calGrid');
  if(grid&&window.CATALOG){
    var C=window.CAL,chips=document.getElementById('calChips'),q=document.getElementById('calSearch'),
        empty=document.getElementById('calEmpty'),cat='全部',kw='';
    var acts=function(c){
      if(c.type==='page') return '<a class="mini main" href="'+c.href+'">開啟專頁</a>';
      if(c.type==='gcal_id') return '<a class="mini main" href="'+C.app(C.ics(c.id),c.title)+'">加入 App</a>'+
        '<a class="mini" href="'+C.webcal(c.id)+'">訂閱</a>'+
        '<a class="mini" target="_blank" rel="noopener" href="'+C.gcal(c.id)+'">Google</a>';
      return '<span class="mini off">即將上線</span>';
    };
    var render=function(){
      var list=window.CATALOG.filter(function(c){
        if(cat!=='全部'&&c.cat!==cat) return false;
        return !kw||(c.title+c.cat+c.desc).toLowerCase().indexOf(kw)>-1;
      });
      grid.innerHTML=list.map(function(c,i){
        return '<article class="cal" style="--i:'+i+'">'+
          '<div class="hd"><span class="ic">'+c.icon+'</span><h3>'+c.title+'</h3><span class="tag">'+c.cat+'</span></div>'+
          (c.hot?'<div class="hot">'+c.hot+'</div>':'')+
          '<p>'+c.desc+'</p><div class="acts">'+acts(c)+'</div></article>';
      }).join('');
      if(empty) empty.hidden=list.length>0;
      requestAnimationFrame(function(){[].forEach.call(grid.children,function(e){e.classList.add('on')})});
    };
    var renderChips=function(){
      var cats=['全部'].concat(window.CATALOG.map(function(c){return c.cat}).filter(function(v,i,a){return a.indexOf(v)===i}));
      chips.innerHTML=cats.map(function(c){return '<button type="button" class="chip-b'+(c===cat?' on':'')+'" data-c="'+c+'">'+c+'</button>'}).join('');
    };
    renderChips(); render();
    chips.addEventListener('click',function(e){var b=e.target.closest('.chip-b');if(!b)return;cat=b.dataset.c;renderChips();render()});
    if(q) q.addEventListener('input',function(){kw=q.value.trim().toLowerCase();render()});
  }

  /* 模板卡片 */
  function tcard(t,go){
    return '<a class="tcard" href="/template.html?id='+t.id+'">'+
      '<div class="top" style="background:'+t.tint+'">'+t.icon+'</div>'+
      '<div class="body"><h3>'+t.title+'</h3><div class="meta">'+t.meta+'</div>'+
      (go?'<span class="go">檢視並加入 ›</span>':'')+'</div></a>';
  }
  var rail=document.getElementById('tplRail');
  if(rail&&window.TPL) rail.innerHTML=window.TPL.map(function(t){return tcard(t,true)}).join('');

  /* 模板詳情 */
  var det=document.getElementById('tplDetail');
  if(det&&window.TPL){
    var id=new URLSearchParams(location.search).get('id'),
        tpl=window.TPL.filter(function(t){return t.id===id})[0]||window.TPL[0];
    document.title=tpl.title+' 行程模板 · Secalender';
    document.getElementById('tplHead').innerHTML=
      '<div class="eyebrow">行程模板</div>'+
      '<h1 class="display">'+tpl.icon+' '+tpl.title+'</h1>'+
      '<p class="lede wide">'+tpl.desc+'</p>'+
      '<p class="small" style="margin-top:14px">'+tpl.meta+' · '+tpl.tags.join(' · ')+'</p>';

    var dateI=document.getElementById('startDate'),
        weekWrap=document.getElementById('weekWrap'),
        weekI=document.getElementById('weeks'),
        tl=document.getElementById('tplTimeline');
    var t0=new Date(); t0.setDate(t0.getDate()+1);
    function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
    dateI.value=iso(t0); dateI.min=iso(new Date());
    weekWrap.hidden=!tpl.weekly;

    function fmtD(d){return d.toLocaleDateString('zh-TW',{month:'long',day:'numeric',weekday:'short'})}
    function fmtT(d){return d.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false})}
    function draw(){
      var p=dateI.value.split('-'),
          base=new Date(+p[0],+p[1]-1,+p[2]),
          reps=tpl.weekly?Math.min(2,+weekI.value||1):1,
          html='',last='';
      for(var r=0;r<reps;r++) for(var i=0;i<tpl.items.length;i++){
        var it=tpl.items[i],s=new Date(base.getTime());
        s.setDate(s.getDate()+it.d+r*7); s.setHours(it.h,it.m||0,0,0);
        var e=new Date(s.getTime()+(it.dur||60)*60000),day=fmtD(s);
        if(day!==last){html+='<div class="daybar">'+day+(tpl.weekly?'（第 '+(r+1)+' 週）':'')+'</div>';last=day}
        html+='<div class="item"><div class="t">'+fmtT(s)+'<small>'+fmtT(e)+'</small></div><div>'+
          '<h4>'+it.title+'</h4>'+
          (it.loc?'<div class="loc">'+it.loc+'</div>':'')+
          (it.note?'<div class="note">'+it.note+'</div>':'')+
          '<span class="chip">'+(it.dur||60)+' 分鐘</span></div></div>';
      }
      tl.innerHTML=html;
      document.getElementById('cnt').textContent=tpl.items.length*(tpl.weekly?(+weekI.value||1):1);
    }
    dateI.addEventListener('change',draw);
    weekI.addEventListener('change',draw);
    draw();

    document.getElementById('btnIcs').addEventListener('click',function(){
      var n=window.ICS.download(tpl,dateI.value,tpl.weekly?+weekI.value:1);
      toast('已下載 '+n+' 個行程，開啟檔案即可加入行事曆');
    });
    document.getElementById('btnApp').addEventListener('click',function(){
      location.href='secalender://template/'+tpl.id+'?start='+dateI.value;
      setTimeout(function(){toast('若沒有反應，表示尚未安裝 App')},1200);
    });
    document.getElementById('btnCopy').addEventListener('click',function(){
      var lines=[tpl.title];
      [].forEach.call(tl.children,function(el){
        if(el.className==='daybar') lines.push('','【'+el.textContent+'】');
        else lines.push(el.querySelector('.t').firstChild.textContent+' '+el.querySelector('h4').textContent);
      });
      var txt=lines.join('\n');
      (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject())
        .then(function(){toast('行程已複製')},function(){toast('這個瀏覽器不支援複製')});
    });

    var more=document.getElementById('moreRail');
    if(more) more.innerHTML=window.TPL.filter(function(t){return t.id!==tpl.id}).map(function(t){return tcard(t,false)}).join('');
  }
})();
