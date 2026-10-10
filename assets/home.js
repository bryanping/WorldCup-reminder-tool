/* 首頁：AI 示範動畫、模板可拖曳無限輪播、公開日曆「加入 App」（依國家）、多語 */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TF='https://testflight.apple.com/join/K3JKca9n';
  var I=window.I18N, T=I?I.t:function(k){return k}; // 修改内容
  if(I) I.apply(); // 修改内容：套用字串 + 建立國家切換器
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

  /* ---------- 第三畫面：主題方案（人們用 App 在安排的事），可拖曳無限輪播 ---------- */ // 修改内容
  var track=document.getElementById('tplTrack');
  if(track&&window.SOL){
    var SOLT=window.SOL.text[I?I.lang:'zh-TW']||window.SOL.text['zh-TW'];
    var card=function(it){
      var tx=SOLT[it.id]||['',''];
      return '<a class="tp" href="#start" draggable="false">'+
        '<div class="tp-cover" style="background:'+it.tint+'"><span>'+it.icon+'</span>'+
          '<em class="tp-adj">'+esc(SOLT['@'+it.cat]||'')+'</em></div>'+
        '<div class="tp-b"><h3>'+esc(tx[0])+'</h3><p>'+esc(tx[1])+'</p>'+
        '<div class="tp-f">'+T('tpl_go')+' <i>→</i></div></div></a>';
    };
    var one=window.SOL.items.map(card).join('');
    track.innerHTML=one+one;
    track.querySelectorAll('.tp').forEach(function(a,i){ if(i>=window.SOL.items.length){a.setAttribute('aria-hidden','true');a.tabIndex=-1} });

    var wrap=track.parentElement, x=0, W=0, v=0, speed=reduce?0:0.55, dragging=false, hover=false, idle=0, last=0, moved=0, sx=0, sxAt=0, lastT=0;
    function measure(){W=track.scrollWidth/2}
    measure(); addEventListener('resize',measure);
    function norm(){ if(W>0){ while(x<=-W)x+=W; while(x>0)x-=W } }
    function frame(ts){
      var dt=Math.min(40,ts-(last||ts)); last=ts;
      if(dragging){}
      else if(Math.abs(v)>0.02){ x+=v*dt; v*=Math.pow(0.94,dt/16) }
      else { v=0; if(!hover && ts-idle>1400) x-=speed*dt/16 }
      norm(); track.style.transform='translate3d('+x+'px,0,0)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    wrap.tabIndex=0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label','themes carousel');
    wrap.addEventListener('mouseenter',function(){hover=true});
    wrap.addEventListener('mouseleave',function(){hover=false;idle=performance.now()});
    wrap.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'&&e.button!==0) return;
      dragging=true; moved=0; sx=e.clientX; sxAt=x; v=0; lastT=e.timeStamp;
      wrap.classList.add('drag'); wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener('pointermove',function(e){
      if(!dragging) return;
      var dx=e.clientX-sx; moved=Math.max(moved,Math.abs(dx));
      var nx=sxAt+dx, dt=Math.max(1,e.timeStamp-lastT);
      v=(nx-x)/dt*0.9; x=nx; lastT=e.timeStamp;
    });
    function up(){ if(!dragging) return; dragging=false; idle=performance.now(); wrap.classList.remove('drag'); v=Math.max(-2.5,Math.min(2.5,v)) }
    wrap.addEventListener('pointerup',up); wrap.addEventListener('pointercancel',up);
    track.addEventListener('click',function(e){ if(moved>8){e.preventDefault();e.stopPropagation()} },true);
    wrap.addEventListener('keydown',function(e){
      var step=(track.firstElementChild.offsetWidth+20);
      if(e.key==='ArrowRight'){v=-step/40;idle=performance.now();e.preventDefault()}
      if(e.key==='ArrowLeft'){v=step/40;idle=performance.now();e.preventDefault()}
    });
    wrap.addEventListener('wheel',function(e){
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){x-=e.deltaX;idle=performance.now();e.preventDefault()}
    },{passive:false});
  }

  /* ---------- 第四畫面：公開日曆（依國家）「加入 App」＝寫入雲端訂閱 ---------- */
  var grid=document.getElementById('pubGrid');
  if(grid&&window.CATALOG){
    var region=I?I.region:'TW';
    var LIST=window.CAL.forRegion(region); // 修改内容
    function subId(c){return 'gcal_'+String(c.id||c.title).replace(/[^A-Za-z0-9]/g,'_').slice(0,80)}
    function icsOf(c){return c.type==='gcal_id'?window.CAL.ics(c.id):c.href}
    function name(c){return c.k?T(c.k,{c:I?I.country(c.c||region):c.c}):c.title} // 修改内容
    function descOf(c){return c.dk?T(c.dk,{c:I?I.country(c.c||region):c.c}):c.desc}
    function catOf(c){return c.ck?T(c.ck):c.cat}

    grid.innerHTML=LIST.map(function(c,i){
      var btn;
      if(c.type==='gcal_id'||c.type==='ics') btn='<button class="add" type="button" data-i="'+i+'" data-sub="'+subId(c)+'">'+T('add')+'</button>';
      else if(c.type==='page') btn='<a class="add ghost" href="'+c.href+'">'+T('view')+'</a>';
      else btn='<span class="add off">'+T('soon')+'</span>';
      return '<article class="pc" data-in style="--d:'+(i%4)+'">'+
        '<div class="pc-h"><h3><i class="dot" style="background:'+(c.color||'#8E8E93')+'"></i>'+esc(name(c))+'</h3><span>'+esc(catOf(c))+'</span></div>'+
        (c.hot?'<p class="live">'+T('live')+'</p>':'')+
        '<p>'+esc(descOf(c))+'</p>'+btn+'</article>';
    }).join('');

    /* --- Firebase：用到才載入 --- */
    var fbReady=null, auth=null, db=null, me=null, subs={};
    function loadScript(src){return new Promise(function(ok,no){
      var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);
    })}
    function withTimeout(p,ms){return Promise.race([p,new Promise(function(_,no){setTimeout(function(){no(new Error('timeout'))},ms)})])}
    function ensureFirebase(){
      if(fbReady) return fbReady;
      var base='https://www.gstatic.com/firebasejs/10.12.0/';
      fbReady=withTimeout(
        loadScript(base+'firebase-app-compat.js')
          .then(function(){return Promise.all([loadScript(base+'firebase-auth-compat.js'),loadScript(base+'firebase-firestore-compat.js'),loadScript('/assets/fb.js')])})
          .then(function(){
            if(!firebase.apps.length) firebase.initializeApp(window.FB_CONFIG);
            auth=firebase.auth(); db=firebase.firestore();
            return new Promise(function(ok){var off=auth.onAuthStateChanged(function(u){off();ok(u)})});
          })
          .then(function(u){me=u;if(u)return refreshSubs();}),
        9000
      ).catch(function(e){fbReady=null;throw e});
      return fbReady;
    }
    function refreshSubs(){
      return db.collection('users').doc(me.uid).collection('calendar_subscriptions').get().then(function(s){
        subs={}; s.docs.forEach(function(d){if(d.data().active!==false)subs[d.id]=1});
        paint();
      });
    }
    function paint(){
      grid.querySelectorAll('button.add').forEach(function(b){
        var on=!!subs[b.dataset.sub];
        b.classList.toggle('done',on);
        b.textContent=on?T('added'):T('add');
      });
    }
    try{
      if(localStorage.getItem('sc_signed')==='1'){
        (window.requestIdleCallback||function(f){setTimeout(f,1500)})(function(){ensureFirebase().catch(function(){})});
      }
    }catch(e){}

    /* --- 彈窗 --- */
    var modal=document.getElementById('addModal'), pending=null;
    function openModal(mode,c){
      pending=c||pending;
      modal.dataset.mode=mode;
      var t=modal.querySelector('.m-t'), p=modal.querySelector('.m-p');
      if(mode==='login'){ t.textContent=T('m_login_t',{title:name(pending)}); p.textContent=T('m_login_p') }
      else { t.textContent=T('m_off_t'); p.textContent=T('m_off_p') }
      modal.hidden=false; requestAnimationFrame(function(){modal.classList.add('on')});
    }
    function closeModal(){modal.classList.remove('on');setTimeout(function(){modal.hidden=true},200)}
    modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('[data-close]'))closeModal()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal()});
    modal.querySelector('.m-dl').href=TF;

    function signIn(kind){
      var p=kind==='google'?new firebase.auth.GoogleAuthProvider():new firebase.auth.OAuthProvider('apple.com');
      if(kind==='apple'){p.addScope('email');p.addScope('name')}
      return auth.signInWithPopup(p).then(function(r){
        me=r.user; try{localStorage.setItem('sc_signed','1')}catch(e){}
        return refreshSubs();
      });
    }
    modal.querySelectorAll('[data-login]').forEach(function(b){
      b.addEventListener('click',function(){
        var c=pending; b.disabled=true;
        signIn(b.dataset.login).then(function(){closeModal(); if(c&&!subs[subId(c)]) subscribe(c);})
          .catch(function(e){toast(e.code==='auth/popup-closed-by-user'?T('t_cancel'):T('t_lfail',{e:e.code||e.message}))})
          .then(function(){b.disabled=false});
      });
    });

    /* --- 訂閱／取消 --- */
    function btnOf(c){return grid.querySelector('button[data-sub="'+subId(c)+'"]')}
    function subscribe(c){
      var b=btnOf(c); if(b){b.disabled=true;b.textContent=T('adding')}
      var tz='Asia/Taipei'; try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||tz}catch(e){}
      return db.collection('users').doc(me.uid).collection('calendar_subscriptions').doc(subId(c)).set({
        calendarId:subId(c), title:name(c), url:icsOf(c), color:c.color||'#267ACC', timeZone:tz, active:true,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      }).then(function(){
        subs[subId(c)]=1; paint(); toast(T('t_added',{title:name(c)}));
      }).catch(function(e){paint(); toast(T('t_fail',{e:e.code||e.message}))})
        .then(function(){if(b)b.disabled=false});
    }
    function unsubscribe(c){
      if(!confirm(T('t_confirm',{title:name(c)}))) return;
      var b=btnOf(c); if(b){b.disabled=true;b.textContent=T('removing')}
      db.collection('users').doc(me.uid).collection('calendar_subscriptions').doc(subId(c)).delete()
        .then(function(){delete subs[subId(c)]; paint(); toast(T('t_rm'))})
        .catch(function(e){paint(); toast(T('t_rmfail',{e:e.code||e.message}))})
        .then(function(){if(b)b.disabled=false});
    }

    grid.addEventListener('click',function(e){
      var b=e.target.closest('button.add'); if(!b) return;
      var c=LIST[+b.dataset.i];
      b.disabled=true;
      ensureFirebase().then(function(){
        b.disabled=false;
        if(!me) return openModal('login',c);
        subs[subId(c)]?unsubscribe(c):subscribe(c);
      }).catch(function(){b.disabled=false; openModal('offline',c)});
    });
  }

  /* 提示 */
  var tEl;
  function toast(msg){
    if(!tEl){tEl=document.createElement('div');tEl.className='toast';document.body.appendChild(tEl)}
    tEl.textContent=msg;tEl.classList.add('on');clearTimeout(tEl._t);tEl._t=setTimeout(function(){tEl.classList.remove('on')},3200);
  }

  /* ---------- 進場 ---------- */
  var io=new IntersectionObserver(function(en){en.forEach(function(x){
    if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}
  })},{threshold:.15});
  document.querySelectorAll('[data-in]').forEach(function(e){io.observe(e)});
})();
