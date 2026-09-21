/* 首頁：AI 示範動畫、模板無限輪播、公開日曆「加入 App」 */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  /* ---------- 第四畫面：公開日曆「加入 App」＝寫入雲端訂閱，App／網頁同步可見 ---------- */
  var grid=document.getElementById('pubGrid');
  if(grid&&window.CATALOG){
    function subId(c){return 'gcal_'+String(c.id||c.title).replace(/[^A-Za-z0-9]/g,'_').slice(0,80)}
    function icsOf(c){return c.type==='gcal_id'?window.CAL.ics(c.id):c.href}

    grid.innerHTML=window.CATALOG.map(function(c,i){
      var btn;
      if(c.type==='gcal_id'||c.type==='ics') btn='<button class="add" type="button" data-i="'+i+'" data-sub="'+subId(c)+'">加入 App</button>';
      else if(c.type==='page') btn='<a class="add ghost" href="'+c.href+'">查看賽程</a>';
      else btn='<span class="add off">即將上線</span>';
      return '<article class="pc" data-in style="--d:'+(i%4)+'">'+
        '<div class="pc-h"><h3><i class="dot" style="background:'+(c.color||'#8E8E93')+'"></i>'+esc(c.title)+'</h3><span>'+esc(c.cat)+'</span></div>'+
        (c.hot?'<p class="live">進行中</p>':'')+
        '<p>'+esc(c.desc)+'</p>'+btn+'</article>';
    }).join('');

    /* --- Firebase：用到才載入，首頁不背負 SDK 重量 --- */
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
        b.textContent=on?'已加入 ✓':'加入 App';
      });
    }
    /* 曾登入過的訪客：閒置時預先載入，按鈕直接顯示「已加入」 */
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
      if(mode==='login'){
        t.textContent='登入後加入「'+pending.title+'」';
        p.textContent='用你的 Secalender 帳號登入，行程會直接進你的行事曆，手機 App 同步可見。還沒有帳號？先下載 App 註冊。';
      }else{
        t.textContent='暫時無法連線';
        p.textContent='目前的網路無法連到登入服務。請下載 Secalender App，在 App 內加入這個日曆。';
      }
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
          .catch(function(e){toast(e.code==='auth/popup-closed-by-user'?'已取消登入':'登入失敗：'+(e.code||e.message))})
          .then(function(){b.disabled=false});
      });
    });

    /* --- 訂閱／取消 --- */
    function btnOf(c){return grid.querySelector('button[data-sub="'+subId(c)+'"]')}
    function subscribe(c){
      var b=btnOf(c); if(b){b.disabled=true;b.textContent='加入中…'}
      var tz='Asia/Taipei'; try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||tz}catch(e){}
      return db.collection('users').doc(me.uid).collection('calendar_subscriptions').doc(subId(c)).set({
        calendarId:subId(c), title:c.title, url:icsOf(c), color:c.color||'#267ACC', timeZone:tz, active:true,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      }).then(function(){
        subs[subId(c)]=1; paint(); toast('已加入「'+c.title+'」，App 與網頁日曆會同步顯示');
      }).catch(function(e){paint(); toast('加入失敗：'+(e.code||e.message))})
        .then(function(){if(b)b.disabled=false});
    }
    function unsubscribe(c){
      if(!confirm('取消加入「'+c.title+'」？這個日曆帶入的行程會一併移除。')) return;
      var b=btnOf(c); if(b){b.disabled=true;b.textContent='移除中…'}
      db.collection('users').doc(me.uid).collection('calendar_subscriptions').doc(subId(c)).delete()
        .then(function(){delete subs[subId(c)]; paint(); toast('已取消加入')})
        .catch(function(e){paint(); toast('取消失敗：'+(e.code||e.message))})
        .then(function(){if(b)b.disabled=false});
    }

    grid.addEventListener('click',function(e){
      var b=e.target.closest('button.add'); if(!b) return;
      var c=window.CATALOG[+b.dataset.i];
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
