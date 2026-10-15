/* 行程模板庫 — 骨架 + 參數
   每份模板：params（可調參數）+ build(p)→items；items 依預設參數預先生成（App / 舊程式相容）
   item：d=第幾天(0起；weekly 時為星期 0=日) h=小時 m=分 dur=分鐘 */
(function(){
function ev(d,h,m,dur,title,loc,note){var o={d:d,h:h,m:m,dur:dur,title:title};if(loc)o.loc=loc;if(note)o.note=note;return o}
function shift(items,hours){return items.map(function(it){var o=Object.assign({},it);o.h=it.h+hours;return o})}

var TPL=[
/* ---------- 東京五日親子 ---------- */
{id:"tokyo-family-5d",icon:"🗼",title:"東京五日親子",meta:"5 天 · 22 個行程",tint:"#eaf3ff",
 desc:"親子節奏排法：上午景點、下午室內、傍晚回飯店休息，不趕路。",
 tags:["旅遊","親子"],
 params:[
  {key:"day3",label:"第 3 天",type:"select",def:"disney",opts:[["disney","迪士尼樂園"],["odaiba","台場・teamLab"],["free","自由活動"]]},
  {key:"pace",label:"起床節奏",type:"select",def:"0",opts:[["0","正常（9:00 出門）"],["1","慢一點（10:00 出門）"]]}
 ],
 build:function(p){
  var d3={
   disney:[ev(2,9,30,240,"東京迪士尼樂園","東京迪士尼樂園","提早 30 分到門口排隊"),ev(2,14,0,60,"園內午餐","樂園餐廳"),ev(2,15,0,240,"下午遊玩・遊行","東京迪士尼樂園"),ev(2,20,0,60,"返回飯店","舞濱 → 上野")],
   odaiba:[ev(2,10,0,150,"teamLab Planets","豐洲","線上預約指定時段"),ev(2,13,0,75,"午餐","台場 DiverCity"),ev(2,14,30,120,"樂高樂園探索中心","台場"),ev(2,17,0,90,"台場海濱公園看夕陽","台場"),ev(2,19,0,60,"返回飯店","台場 → 上野")],
   free:[ev(2,10,0,180,"自由活動・補眠日","上野周邊"),ev(2,14,0,120,"阿卡將本舖採買","錦糸町"),ev(2,17,30,90,"回飯店休息","飯店")]
  }[p.day3];
  var items=[
   ev(0,10,0,90,"抵達成田機場・入境","成田國際機場"),
   ev(0,12,0,90,"Skyliner 進市區","成田 → 上野","先在機場買 Suica，省後面排隊時間"),
   ev(0,14,30,60,"飯店寄放行李","上野站周邊"),
   ev(0,16,0,120,"上野公園散步","上野恩賜公園"),
   ev(0,18,30,90,"阿美橫町晚餐","阿美橫町"),
   ev(1,9,0,180,"上野動物園","上野動物園","開園即入場，熊貓館人最少"),
   ev(1,12,30,60,"午餐・休息","園區餐廳"),
   ev(1,14,30,120,"國立科學博物館","國立科學博物館"),
   ev(1,17,30,90,"回飯店休息","飯店")
  ].concat(d3,[
   ev(3,10,0,120,"淺草寺・仲見世通","淺草寺"),
   ev(3,12,30,90,"午餐：天婦羅","淺草"),
   ev(3,14,30,120,"晴空塔展望台","東京晴空塔","網路預約可跳過現場排隊"),
   ev(3,17,0,120,"晴空塔街購物","Solamachi"),
   ev(4,9,30,120,"最後採買","上野／藥妝店"),
   ev(4,12,0,60,"退房・寄行李","飯店"),
   ev(4,13,30,90,"前往機場","上野 → 成田"),
   ev(4,15,30,90,"辦理登機・退稅","成田國際機場"),
   ev(4,17,30,60,"登機","成田國際機場")
  ]);
  return +p.pace?items.map(function(it){return (it.d===0||it.d===4)?it:Object.assign({},it,{h:it.h+1})}):items;
 }},

/* ---------- 馬拉松備賽 12 週 ---------- */
{id:"marathon-12w",icon:"🏃",title:"馬拉松備賽 12 週",meta:"12 週 · 每週 3–5 練",tint:"#eafaf0",
 desc:"依目標配速與每週可練天數生成課表，三週加量一週減量，賽前兩週減量。",
 tags:["運動","長期"],
 weekly:true,
 params:[
  {key:"goal",label:"目標",type:"select",def:"finish",opts:[["finish","完賽（5:00 內）"],["sub4","破 4"],["sub330","破 3:30"]]},
  {key:"days",label:"每週練",type:"select",def:"4",opts:[["3","3 天"],["4","4 天"],["5","5 天"]]},
  {key:"time",label:"練跑時間",type:"select",def:"6",opts:[["6","06:30 晨跑"],["19","19:30 夜跑"]]},
  {key:"long",label:"長跑日",type:"select",def:"6",opts:[["6","週六"],["0","週日"]]}
 ],
 build:function(p){
  var G={finish:{easy:"輕鬆跑 6K",iv:"間歇 5×600m",tempo:"節奏跑 5K",lg:"長跑 14K",pace:"配速 7:00–7:30"},
         sub4:{easy:"輕鬆跑 8K",iv:"間歇 6×800m",tempo:"節奏跑 8K",lg:"長跑 18K",pace:"配速 5:40"},
         sub330:{easy:"輕鬆跑 10K",iv:"間歇 8×800m",tempo:"節奏跑 10K",lg:"長跑 22K",pace:"配速 4:58"}}[p.goal];
  var h=+p.time,m=30,lg=+p.long,items=[
   ev(1,h,m,50,G.easy,null,"比目標慢 60–75 秒，能對話的速度"),
   ev(3,h,m,60,G.iv,null,"每趟間慢跑 400m，目標 "+G.pace)
  ];
  if(+p.days>=4) items.push(ev(5,h,m,45,"恢復跑 6K + 核心 15 分",null,"核心：平板、橋式、鳥狗式各 3 組"));
  if(+p.days>=5) items.push(ev(2,h,m,50,G.tempo,null,"接近目標配速，維持穩定"));
  items.push(ev(lg,lg===0?7:6,0,120,G.lg,null,"每三週加 2K，第 4 週減半；補給每 40 分一次"));
  return items;
 }},

/* ---------- 婚禮籌備 90 天 ---------- */
{id:"wedding-90d",icon:"💍",title:"婚禮籌備 90 天",meta:"90 天 · 12–15 個里程碑",tint:"#fdeef2",
 desc:"從訂場地到當天流程，每個節點都有明確截止日；可加上婚紗照與蜜月籌備。",
 tags:["人生大事"],
 params:[
  {key:"photo",label:"婚紗照",type:"select",def:"1",opts:[["1","要拍"],["0","不拍"]]},
  {key:"honey",label:"蜜月",type:"select",def:"0",opts:[["0","不安排"],["1","婚後出發"]]},
  {key:"hour",label:"處理時間",type:"select",def:"19",opts:[["19","19:00 下班後"],["21","21:00 睡前"]]}
 ],
 build:function(p){
  var h=+p.hour,items=[
   ev(0,h,0,60,"確認預算與賓客人數",null,"先定總預算上限，再分配場地／餐飲／攝影比例"),
   ev(3,h,0,90,"看場地・比價",null,"至少 3 家，問清楚低消與加桌條件"),
   ev(10,h,0,60,"訂場地・付訂金"),
   ev(17,h,0,60,"挑婚攝與婚錄",null,"看完整一場的成品，不只精選")
  ];
  if(+p.photo){items.push(ev(24,14,0,120,"試婚紗・選款"),ev(45,8,0,600,"拍婚紗照",null,"前一晚早睡，帶備用鞋"))}
  items.push(
   ev(38,h,0,60,"寄出喜帖",null,"附回覆截止日與交通資訊"),
   ev(52,h,0,90,"確認菜單與試菜"),
   ev(66,h,0,60,"回收出席回覆・排桌次"),
   ev(76,h,0,60,"確認當天流程表",null,"把每段負責人寫進流程表")
  );
  if(+p.honey) items.push(ev(60,h,0,60,"訂蜜月機票與住宿",null,"確認護照效期 6 個月以上"));
  items.push(
   ev(83,14,0,120,"彩排"),
   ev(88,h,0,60,"最後確認：車輛、飾品、紅包"),
   ev(90,9,0,600,"婚禮當天")
  );
  return items.sort(function(a,b){return a.d-b.d||a.h-b.h});
 }},

/* ---------- 期末衝刺四週 ---------- */
{id:"final-sprint-4w",icon:"📚",title:"期末衝刺四週",meta:"4 週 · 依科目輪排",tint:"#fff4e6",
 desc:"輸入你的科目，每天兩個深度區塊輪流排科目，週三複習、週六模擬考、週日補進度。",
 tags:["學習"],
 weekly:true,
 params:[
  {key:"subjects",label:"科目",type:"text",def:"微積分, 統計, 經濟學, 英文",ph:"用逗號分隔"},
  {key:"blocks",label:"每日區塊",type:"select",def:"2",opts:[["1","1 個（90 分）"],["2","2 個（早／午）"],["3","3 個（早／午／晚）"]]},
  {key:"start",label:"開始時間",type:"select",def:"9",opts:[["8","08:00"],["9","09:00"],["10","10:00"],["14","14:00 起"]]},
  {key:"sat",label:"週六",type:"select",def:"mock",opts:[["mock","模擬考"],["review","總複習"],["off","休息"]]}
 ],
 build:function(p){
  var S=String(p.subjects||"").split(/[,，、\n]/).map(function(s){return s.trim()}).filter(Boolean);
  if(!S.length) S=["科目 A","科目 B"];
  var st=+p.start,slots=[st,st+5,19].slice(0,+p.blocks),items=[],k=0;
  if(st===14) slots=[14,16,19].slice(0,+p.blocks);
  for(var d=1;d<=5;d++){
   for(var b=0;b<slots.length;b++){
    if(d===3&&b===slots.length-1){items.push(ev(3,19,0,60,"當週複習 + 自我測驗",null,"只看錯題與沒把握的章節"));continue}
    var s=S[k++%S.length];
    items.push(ev(d,slots[b],0,90,"深度讀書："+s,null,"番茄鐘 3 輪，手機放另一間"));
   }
  }
  if(p.sat==="mock") items.push(ev(6,10,0,120,"模擬考："+S[0],null,"計時、不翻書；下午改考卷"));
  else if(p.sat==="review") items.push(ev(6,10,0,150,"總複習：本週所有科目"));
  return items;
 }},

/* ---------- 新生兒作息 ---------- */
{id:"newborn-week",icon:"🍼",title:"新生兒作息週表",meta:"每日循環 · 依餵奶間隔生成",tint:"#f0efff",
 desc:"設定餵奶間隔、第一餐與洗澡時間，每天自動排出餵奶／清醒／小睡／夜奶輪班。",
 tags:["家庭","循環"],
 weekly:true,
 params:[
  {key:"gap",label:"餵奶間隔",type:"select",def:"3",opts:[["2.5","2.5 小時"],["3","3 小時"],["3.5","3.5 小時"],["4","4 小時"]]},
  {key:"first",label:"第一餐",type:"select",def:"7",opts:[["6","06:00"],["7","07:00"],["8","08:00"]]},
  {key:"bath",label:"洗澡",type:"select",def:"19",opts:[["18","18:00 前後"],["19","19:00 前後"],["0","不排"]]},
  {key:"night",label:"夜奶輪班",type:"select",def:"alt",opts:[["alt","爸媽輪流（單雙日）"],["dad","爸爸"],["mom","媽媽"]]}
 ],
 build:function(p){
  var gap=+p.gap,first=+p.first,bath=+p.bath,items=[];
  for(var d=0;d<7;d++){
   var t=first,n=1;
   while(t<24){
    var h=Math.floor(t),m=Math.round((t-h)*60),title,note;
    if(n===1){title="第 1 餐・起床餵奶・換尿布";note="記錄奶量／尿布次數"}
    else if(bath&&Math.abs(t-bath)<gap/2){title="洗澡・餵奶・哄睡";note="洗澡後 15 分內餵，較好入睡"}
    else if(t>=21){var who=p.night==="alt"?(d%2?"媽媽":"爸爸"):(p.night==="dad"?"爸爸":"媽媽");title="夜奶（"+who+"）";note="燈光調暗、不逗玩，餵完直接放回"}
    else{title="第 "+n+" 餐・餵奶・拍嗝";note="清醒 20–30 分後小睡"}
    items.push(ev(d,h,m,40,title,null,note));
    t+=gap;n++;
   }
  }
  return items;
 }},

/* ---------- 週末城市散步 ---------- */
{id:"weekend-walk",icon:"🧳",title:"週末城市散步",meta:"2 天 · 步行動線",tint:"#eef7f0",
 desc:"兩天走完一個城區，早市、咖啡、書店、夕陽，全程步行可達。",
 tags:["旅遊","輕鬆"],
 params:[
  {key:"pace",label:"節奏",type:"select",def:"0",opts:[["0","早鳥（08:30 出門）"],["1","慢活（10:00 出門）"]]},
  {key:"day2",label:"第 2 天",type:"select",def:"museum",opts:[["museum","美術館 + 公園"],["market","週末市集 + 河岸"]]}
 ],
 build:function(p){
  var d1=[
   ev(0,8,30,60,"早市吃早餐","在地傳統市場"),
   ev(0,10,0,90,"老街散步","舊城區"),
   ev(0,12,0,75,"午餐：在地小館"),
   ev(0,14,0,90,"獨立書店","書店街"),
   ev(0,16,30,60,"咖啡歇腳"),
   ev(0,18,0,60,"看夕陽","河岸／高點")
  ];
  var d2=p.day2==="market"?[
   ev(1,10,0,120,"週末市集","市集廣場"),
   ev(1,12,30,60,"市集午餐"),
   ev(1,14,0,120,"河岸步道・租單車","河岸")
  ]:[
   ev(1,9,0,120,"美術館","市立美術館"),
   ev(1,12,0,60,"午餐"),
   ev(1,14,0,120,"公園野餐・收尾")
  ];
  var items=d1.concat(d2);
  return +p.pace?items.map(function(it){return Object.assign({},it,{h:Math.min(it.h+1,21)})}):items;
 }}
];

function defaults(t){var o={};(t.params||[]).forEach(function(q){o[q.key]=q.def});return o}
TPL.forEach(function(t){t.defaults=defaults(t);t.items=t.build(t.defaults)});
window.TPL=TPL;
})();
