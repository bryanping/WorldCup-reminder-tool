/* 網頁日曆：登入 → 我的行程週視圖 + 好友／社群行程對比與加入 */
(function(){
  if(typeof firebase==='undefined'){
    var g=document.querySelector('#gate .gate');
    if(g) g.innerHTML='<h1>暫時無法連線</h1><p>登入服務載入失敗，請檢查網路後重新整理。</p>'+
      '<a class="btn" href="/">回首頁</a>';
    return;
  }
  firebase.initializeApp(window.FB_CONFIG);
  var auth=firebase.auth(), db=firebase.firestore();
  var $=function(id){return document.getElementById(id)};
  var gate=$('gate'), app=$('calApp'), me=null;
  var weekStart=startOfWeek(new Date()), overlay={}, cacheFriends=[], cacheGroups=[], myEvents=[], otherEvents=[];

  function startOfWeek(d){var x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-x.getDay());return x}
  function addD(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function mins(t){var p=(t||'00:00:00').split(':');return (+p[0])*60+(+p[1]||0)}
  function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}

  /* ---------- 登入 ---------- */
  function signIn(kind){
    var p;
    if(kind==='google'){p=new firebase.auth.GoogleAuthProvider()}
    else{p=new firebase.auth.OAuthProvider('apple.com');p.addScope('email');p.addScope('name')}
    auth.signInWithPopup(p).catch(function(e){
      toast(e.code==='auth/unauthorized-domain'?'這個網域尚未在 Firebase 授權':'登入失敗：'+e.code);
    });
  }
  $('btnGoogle').addEventListener('click',function(){signIn('google')});
  $('btnApple').addEventListener('click',function(){signIn('apple')});
  $('btnOut').addEventListener('click',function(){auth.signOut()});

  auth.onAuthStateChanged(function(u){
    me=u;
    gate.hidden=!!u; app.hidden=!u;
    if(!u) return;
    $('who').textContent=u.displayName||u.email||'已登入';
    loadAll();
  });

  /* ---------- 讀取 ---------- */
  function weekRange(){return {from:iso(weekStart),to:iso(addD(weekStart,6))}}

  /* ---------- 重複規則（對齊 App 的 RepeatRule） ---------- */
  function parseRule(raw){
    if(!raw) return null;
    raw=String(raw).trim();
    if(!raw||raw==='never') return null;
    if(['daily','weekly','monthly','yearly'].indexOf(raw)>-1) return {unit:raw,interval:1,values:[]};
    var p=raw.split(':');
    if(p.length<3||p[0]!=='custom') return null;
    var unit=p[1]; if(['daily','weekly','monthly','yearly'].indexOf(unit)<0) return null;
    var interval=parseInt(p[2],10)||1,
        values=p.length>=4?p[3].split(',').map(function(v){return parseInt(v,10)}).filter(function(v){return !isNaN(v)}):[];
    return {unit:unit,interval:Math.max(1,interval),values:values};
  }
  function dayDiff(a,b){return Math.round((b-a)/86400000)}
  function weekStartOf(d){var x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-x.getDay());return x}
  function ruleMatches(rule,day,anchor){
    if(day<anchor) return false;
    switch(rule.unit){
      case 'daily':
        return dayDiff(anchor,day)%rule.interval===0;
      case 'weekly':
        var wd=day.getDay()+1; /* App：1=週日 */
        if(rule.values.length? rule.values.indexOf(wd)<0 : day.getDay()!==anchor.getDay()) return false;
        return Math.round(dayDiff(weekStartOf(anchor),weekStartOf(day))/7)%rule.interval===0;
      case 'monthly':
        if(rule.values.length? rule.values.indexOf(day.getDate())<0 : day.getDate()!==anchor.getDate()) return false;
        return ((day.getFullYear()-anchor.getFullYear())*12+(day.getMonth()-anchor.getMonth()))%rule.interval===0;
      case 'yearly':
        if(day.getDate()!==anchor.getDate()) return false;
        if(rule.values.length? rule.values.indexOf(day.getMonth()+1)<0 : day.getMonth()!==anchor.getMonth()) return false;
        return (day.getFullYear()-anchor.getFullYear())%rule.interval===0;
    }
    return false;
  }

  /* 一筆 Firestore 事件 → 本週實際出現的區段（含重複展開、跨日切段） */
  function expand(d,src,from,to){
    if(!d||d.deleted===1||!d.date) return [];
    var p=String(d.date).split('-');
    if(p.length<3) return [];
    var anchor=new Date(+p[0],+p[1]-1,+p[2]); anchor.setHours(0,0,0,0);
    var s0=mins(d.startTime), e0=mins(d.endTime);
    if(e0<=s0) e0=Math.min(1440,s0+60);
    var allDay=d.isAllDay===true;
    if(allDay){s0=0;e0=1440}
    var span=0;
    if(d.endDate){
      var q=String(d.endDate).split('-');
      if(q.length>=3){
        var ed=new Date(+q[0],+q[1]-1,+q[2]); ed.setHours(0,0,0,0);
        span=Math.max(0,Math.min(60,dayDiff(anchor,ed)));
      }
    }
    var base={title:d.title||'（未命名）',loc:d.destination||'',allDay:allDay,color:d.color||'',src:src,raw:d,
              repeating:!!parseRule(d.repeatType)};
    var out=[], rule=parseRule(d.repeatType), day;
    function push(startDay,offset){
      var cur=new Date(startDay.getTime()); cur.setDate(cur.getDate()+offset);
      if(cur<from||cur>to) return;
      var first=offset===0, last=offset===span;
      out.push(Object.assign({},base,{
        date:iso(cur),
        s:first?s0:0,
        e:last?e0:1440
      }));
    }
    if(!rule){
      for(var k=0;k<=span;k++) push(anchor,k);
      return out;
    }
    for(day=new Date(from.getTime());day<=to;day.setDate(day.getDate()+1)){
      if(ruleMatches(rule,day,anchor)){
        out.push(Object.assign({},base,{date:iso(day),s:s0,e:e0}));
      }
    }
    return out;
  }

  function bounds(){
    var f=new Date(weekStart.getTime()); f.setHours(0,0,0,0);
    var t=addD(weekStart,6); t.setHours(0,0,0,0);
    return {f:f,t:t};
  }
  function dedup(docs){
    var seen={},out=[];
    docs.forEach(function(d){ if(!seen[d.id]){seen[d.id]=1;out.push(d)} });
    return out;
  }

  function loadAll(){
    var r=weekRange(), b=bounds();
    $('weekLabel').textContent=weekStart.toLocaleDateString('zh-TW',{year:'numeric',month:'long'})+
      ' · '+(weekStart.getMonth()+1)+'/'+weekStart.getDate()+'–'+(addD(weekStart,6).getMonth()+1)+'/'+addD(weekStart,6).getDate();
    myEvents=[]; otherEvents=[];
    drawGrid();

    var col=db.collection('users').doc(me.uid).collection('events');
    /* 三段查詢：本週起始的、跨日延伸進本週的、所有重複行程母筆 */
    Promise.all([
      col.where('date','>=',r.from).where('date','<=',r.to).get().catch(function(){return {docs:[]}}),
      col.where('endDate','>=',r.from).limit(300).get().catch(function(){return {docs:[]}}),
      col.where('repeatType','!=','never').limit(300).get().catch(function(){return {docs:[]}})
    ]).then(function(snaps){
      var docs=dedup([].concat.apply([],snaps.map(function(s){return s.docs})));
      myEvents=[].concat.apply([],docs.map(function(d){return expand(d.data(),{kind:'me'},b.f,b.t)}));
      drawGrid();
      renderSide('friendList',cacheFriends,'好友這週沒有公開行程。');
      renderSide('groupList',cacheGroups,'社群這週沒有行程。');
    }).catch(function(e){toast('讀取行程失敗：'+(e.code||e.message))});

    loadFriends(); loadGroups();
  }

  function loadFriends(){
    var b=bounds();
    db.collection('friends').where('owner','==',me.uid).get().then(function(s){
      var ids=s.docs.map(function(d){return d.data().friend}).filter(Boolean);
      if(!ids.length){$('friendList').innerHTML='<p class="side-empty">還沒有好友。在 App 中加好友後，這裡就會顯示他們公開的行程。</p>';return}
      return Promise.all(ids.map(function(fid){
        return db.collection('users').doc(fid).get().then(function(u){
          var d=u.exists?u.data():{},
              name=d.name||d.nickname||d.alias||d.userName||'好友';
          /* 只用單一等式條件，避免複合索引；週範圍與重複展開都在前端做 */
          return db.collection('users').doc(fid).collection('events')
            .where('openChecked','==',1).limit(500).get()
            .then(function(es){
              return [].concat.apply([],es.docs.map(function(x){
                return expand(x.data(),{kind:'friend',id:fid,name:name},b.f,b.t);
              }));
            }).catch(function(){return []});
        });
      })).then(function(all){
        cacheFriends=[].concat.apply([],all);
        renderSide('friendList',cacheFriends,'好友這週沒有公開行程。');
      });
    }).catch(function(e){$('friendList').innerHTML='<p class="side-empty">讀取好友失敗：'+(e.code||e.message)+'</p>'});
  }

  function loadGroups(){
    var r=weekRange(), b=bounds();
    db.collection('groups').where('members','array-contains',me.uid).get().then(function(s){
      if(s.empty){$('groupList').innerHTML='<p class="side-empty">還沒有加入社群。</p>';return}
      return Promise.all(s.docs.map(function(g){
        var gc=g.ref.collection('groupEvents'), gname=g.data().name||'社群';
        return Promise.all([
          gc.where('date','>=',r.from).where('date','<=',r.to).get().catch(function(){return {docs:[]}}),
          gc.where('repeatType','!=','never').limit(200).get().catch(function(){return {docs:[]}})
        ]).then(function(snaps){
          var docs=dedup([].concat.apply([],snaps.map(function(x){return x.docs})));
          return [].concat.apply([],docs.map(function(x){
            return expand(x.data(),{kind:'group',id:g.id,name:gname},b.f,b.t);
          }));
        });
      })).then(function(all){
        cacheGroups=[].concat.apply([],all);
        renderSide('groupList',cacheGroups,'社群這週沒有行程。');
      });
    }).catch(function(e){$('groupList').innerHTML='<p class="side-empty">讀取社群失敗：'+(e.code||e.message)+'</p>'});
  }

  /* ---------- 右側清單 ---------- */
  function renderSide(elId,list,emptyMsg){
    var el=$(elId);
    if(!list.length){el.innerHTML='<p class="side-empty">'+emptyMsg+'</p>';return}
    list.sort(function(a,b){return (a.date+a.s)<(b.date+b.s)?-1:1});
    el.innerHTML=list.map(function(ev,i){
      var key=elId+':'+i, d=new Date(ev.date+'T00:00:00');
      return '<div class="side-item'+(conflict(ev)?' clash':'')+'">'+
        '<div class="si-h"><b>'+esc(ev.title)+'</b><span>'+esc(ev.src.name)+'</span></div>'+
        '<div class="si-m">'+(d.getMonth()+1)+'/'+d.getDate()+' '+hm(ev.s)+'–'+hm(ev.e)+
          (ev.repeating?' · 重複':'')+(ev.loc?' · '+esc(ev.loc):'')+'</div>'+
        (conflict(ev)?'<div class="si-clash">與你的行程重疊</div>':'')+
        '<div class="si-a">'+
          '<label class="si-chk"><input type="checkbox" data-ov="'+key+'"'+(overlay[key]?' checked':'')+'> 疊在日曆上</label>'+
          '<button class="mini main" data-add="'+key+'">加入我的行事曆</button>'+
        '</div></div>';
    }).join('');
    [].forEach.call(el.querySelectorAll('[data-ov]'),function(c){
      c.addEventListener('change',function(){
        overlay[c.dataset.ov]=c.checked; syncOverlay(); drawGrid();
      });
    });
    [].forEach.call(el.querySelectorAll('[data-add]'),function(b){
      b.addEventListener('click',function(){addToMine(list[+b.dataset.add.split(':')[1]],b)});
    });
    syncOverlay();
  }
  function syncOverlay(){
    otherEvents=[];
    ['friendList','groupList'].forEach(function(id){
      var list=id==='friendList'?cacheFriends:cacheGroups;
      list.forEach(function(ev,i){ if(overlay[id+':'+i]) otherEvents.push(ev) });
    });
  }
  function hm(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2)}
  function conflict(ev){
    return myEvents.some(function(m){
      return m.date===ev.date && ev.s < m.e && m.s < ev.e;
    });
  }

  /* ---------- 加入我的行事曆 ---------- */
  function addToMine(ev,btn){
    if(!me) return;
    var now=new Date(), pad=function(n){return ('0'+n).slice(-2)};
    var d=ev.raw;
    var doc={
      id:Date.now()%2147483647,
      title:d.title||'',
      creatorOpenid:me.uid,
      color:d.color||'#4f8cff',
      date:d.date, startTime:d.startTime||'09:00:00', endTime:d.endTime||'10:00:00',
      endDate:d.endDate||null,
      destination:d.destination||'', mapObj:d.mapObj||'',
      openChecked:0, personChecked:0,
      category:d.category||null, information:d.information||null,
      isAllDay:d.isAllDay===true, repeatType:'never',
      createTime:now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+
                 pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds()),
      deleted:0,
      sourceKind:ev.src.kind, sourceOwner:ev.src.id||null, sourceName:ev.src.name||null
    };
    btn.disabled=true; btn.textContent='加入中…';
    db.collection('users').doc(me.uid).collection('events').add(doc).then(function(){
      btn.textContent='已加入'; toast('已加入你的行事曆');
      var b=bounds();
      myEvents=myEvents.concat(expand(doc,{kind:'me'},b.f,b.t)); drawGrid();
    }).catch(function(e){
      btn.disabled=false; btn.textContent='加入我的行事曆'; toast('加入失敗：'+e.code);
    });
  }

  /* ---------- 週視圖 ---------- */
  var H0=6, H1=24, PXH=44;
  function drawGrid(){
    var head='', body='', i, h;
    for(i=0;i<7;i++){
      var d=addD(weekStart,i), today=iso(d)===iso(new Date());
      head+='<div class="col-h'+(today?' today':'')+'"><span>'+['日','一','二','三','四','五','六'][i]+'</span><b>'+d.getDate()+'</b></div>';
    }
    $('gridHead').innerHTML='<div class="col-h gutter"></div>'+head;

    var hours='';
    for(h=H0;h<H1;h++) hours+='<div class="hr"><span>'+('0'+h).slice(-2)+':00</span></div>';
    body='<div class="gutter">'+hours+'</div>';
    for(i=0;i<7;i++){
      var day=iso(addD(weekStart,i)), cells='';
      for(h=H0;h<H1;h++) cells+='<div class="cell"></div>';
      var evs=myEvents.filter(function(e){return e.date===day}).map(function(e){return block(e,'mine')})
        .concat(otherEvents.filter(function(e){return e.date===day}).map(function(e){return block(e,'other')}));
      body+='<div class="col">'+cells+evs.join('')+'</div>';
    }
    $('gridBody').innerHTML=body;
  }
  function block(ev,cls){
    var top=(Math.max(ev.s,H0*60)-H0*60)/60*PXH,
        hgt=Math.max(20,(Math.min(ev.e,H1*60)-Math.max(ev.s,H0*60))/60*PXH-3);
    return '<div class="ev '+cls+(ev.allDay?' allday':'')+'" style="top:'+top+'px;height:'+hgt+'px">'+
      '<b>'+(ev.repeating?'↻ ':'')+esc(ev.title)+'</b>'+
      '<i>'+(ev.allDay?'整日':hm(ev.s))+(ev.src.kind!=='me'?' · '+esc(ev.src.name):'')+'</i></div>';
  }

  /* ---------- 週切換 / 分頁 ---------- */
  $('prevW').addEventListener('click',function(){weekStart=addD(weekStart,-7);overlay={};loadAll()});
  $('nextW').addEventListener('click',function(){weekStart=addD(weekStart,7);overlay={};loadAll()});
  $('todayW').addEventListener('click',function(){weekStart=startOfWeek(new Date());overlay={};loadAll()});
  [].forEach.call(document.querySelectorAll('.side-tab'),function(t){
    t.addEventListener('click',function(){
      [].forEach.call(document.querySelectorAll('.side-tab'),function(x){x.classList.toggle('on',x===t)});
      $('friendList').hidden=t.dataset.t!=='friend';
      $('groupList').hidden=t.dataset.t!=='group';
    });
  });
  drawGrid();
})();
