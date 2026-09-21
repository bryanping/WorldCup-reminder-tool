/* 首頁：AI 示範動畫、模板無限輪播、公開日曆「加入 App」 */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
  var TF='https://testflight.apple.com/join/K3JKca9n';
  function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}

  /* ---------- 第二畫面：一句話 → 行程 ---------- */
  var demo=document.getElementById('aiDemo');
  if(demo){
    var SCRIPTS=[
      {q:'三天京都自由行，第二天要去伏見稻荷',items:[['第 1 天 10:00','清水寺・二年坂'],['第 2 天 07:30','伏見稻荷大社（避開人潮）'],['第 2 天 13:00','錦市場午餐'],['第 3 天 09:00','嵐山竹林']]},
      {q:'這個月讀完兩本書，平日晚上比較有空',items:[['週一 21:00','閱讀 45 分鐘'],['週三 21:00','閱讀 45 分鐘'],['週五 21:00','閱讀 45 分鐘'],['週日 10:00','讀書筆記整理']]},
      {q:'下週找一天和三個朋友吃晚餐',items:[['比對 4 人空檔','共同可行：週四、週六'],['建議','週四 19:00'],['已發送確認','3 人待回覆']]}
    ];
    var qEl=demo.querySelector('.q'),list=demo.querySelector('.ans'),k=0;
    function run(){
      var s=SCRIPTS[k%SCRIPTS.length];k++;
      qEl.textContent='';list.innerHTML='';demo.classList.remove('done');
      if(reduce){qEl.textContent=s.q;show(s);return}
      var i=0;(function type(){
        if(i<=s.q.length){qEl.textContent=s.q.slice(0,i++);setTimeout(type,55)}
        else setTimeout(function(){show(s)},350);
      })();
    }
    function show(s){
      list.innerHTML=s.items.map(function(it,j){
        return '<li style="--j:'+j+'"><span>'+esc(it[0])+'</span><b>'+esc(it[1])+'</b></li>';
      }).join('');
      demo.classList.add('done');
      if(!reduce) setTimeout(run,4200);
    }
    var started=false;
    new IntersectionObserver(function(en){
      if(en[0].isIntersecting&&!started){started=true;run()}
    },{threshold:.4}).observe(demo);
  }

  /* ---------- 第三畫面：模板無限輪播 ---------- */
  var track=document.getElementById('tplTrack');
  if(track&&window.TPL){
    function fmt(it){return ('0'+it.h).slice(-2)+':'+('0'+(it.m||0)).slice(-2)}
    var cards=window.TPL.map(function(t){
      var prev=t.items.slice(0,4).map(function(it){
        return '<li><span>'+(t.weekly?'週'+'日一二三四五六'[it.d%7]:'第 '+(it.d+1)+' 天')+' '+fmt(it)+'</span>'+esc(it.title)+'</li>';
      }).join('');
      return '<a class="tp" href="/template.html?id='+t.id+'">'+
        '<div class="tp-h"><h3>'+esc(t.title)+'</h3><span>'+esc(t.meta)+'</span></div>'+
        '<ul>'+prev+'</ul>'+
        '<div class="tp-f">檢視並加入 <i>→</i></div></a>';
    }).join('');
    track.innerHTML=cards+cards;           /* 兩份接續，做無縫循環 */
    track.querySelectorAll('.tp').forEach(function(a,i){ if(i>=window.TPL.length) a.setAttribute('aria-hidden','true'), a.tabIndex=-1 });
    /* 觸控：按住暫停 */
    var wrap=track.parentElement;
    wrap.addEventListener('touchstart',function(){wrap.classList.add('hold')},{passive:true});
    wrap.addEventListener('touchend',function(){wrap.classList.remove('hold')},{passive:true});
  }

  /* ---------- 第四畫面：公開日曆（只保留加入 App） ---------- */
  var grid=document.getElementById('pubGrid');
  if(grid&&window.CATALOG){
    grid.innerHTML=window.CATALOG.map(function(c,i){
      var btn;
      if(c.type==='gcal_id'||c.type==='ics') btn='<button class="add" type="button" data-i="'+i+'">加入 App</button>';
      else if(c.type==='page') btn='<a class="add ghost" href="'+c.href+'">查看賽程</a>';
      else btn='<span class="add off">即將上線</span>';
      return '<article class="pc" data-in style="--d:'+(i%4)+'">'+
        '<div class="pc-h"><h3>'+esc(c.title)+'</h3><span>'+esc(c.cat)+'</span></div>'+
        (c.hot?'<p class="live">進行中</p>':'')+
        '<p>'+esc(c.desc)+'</p>'+btn+'</article>';
    }).join('');

    var modal=document.getElementById('addModal');
    function openModal(c){
      modal.querySelector('.m-t').textContent='把「'+c.title+'」加入 App';
      modal.hidden=false;
      requestAnimationFrame(function(){modal.classList.add('on')});
    }
    function closeModal(){modal.classList.remove('on');setTimeout(function(){modal.hidden=true},200)}
    modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('[data-close]'))closeModal()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal()});

    grid.addEventListener('click',function(e){
      var b=e.target.closest('button.add');if(!b)return;
      var c=window.CATALOG[+b.dataset.i];
      var ics=c.type==='gcal_id'?window.CAL.ics(c.id):c.href;
      if(isIOS){
        /* 手機：直接開 App；沒裝則顯示引導 */
        var t=setTimeout(function(){openModal(c)},1400);
        window.addEventListener('pagehide',function(){clearTimeout(t)},{once:true});
        location.href=window.CAL.app(ics,c.title);
      }else{
        openModal(c);
      }
    });
    modal.querySelector('.m-dl').href=TF;
  }

  /* ---------- 進場 ---------- */
  var io=new IntersectionObserver(function(en){en.forEach(function(x){
    if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}
  })},{threshold:.15});
  document.querySelectorAll('[data-in]').forEach(function(e){io.observe(e)});
})();
