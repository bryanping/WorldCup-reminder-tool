/* 公開日曆目錄 — 單一資料來源，index.html 與 events.html 共用 */
/* type: page=站內專頁 · gcal_id=Google 公共日曆 · ics=外部 ics · soon=即將上線
   regions: 首頁依國家顯示（"*"=全部）；k/dk/ck: i18n 鍵（首頁多語用；events.html 仍用 title/desc/cat） */
window.CATALOG=[
 {icon:"⚽",title:"2026 世界盃",k:"wc",dk:"wc_d",ck:"cat_sport",color:"#FF9500",cat:"運動",hot:"🔥 進行中熱門",desc:"美加墨 104 場完整賽程，逐場提醒、時區自動換算，可逐場加入 App。",type:"page",href:"/worldcup.html",regions:["*"]},
 {icon:"🇹🇼",title:"台灣國定假日",k:"holiday",c:"TW",dk:"holiday_d",ck:"cat_holiday",color:"#34C759",cat:"假日",desc:"台灣國定假日與補班日，Google 官方公共日曆，自動更新。",type:"gcal_id",id:"zh_tw.taiwan#holiday@group.v.calendar.google.com",regions:["TW"]},
 {icon:"🇭🇰",title:"香港公眾假期",k:"holiday",c:"HK",dk:"holiday_d",ck:"cat_holiday",color:"#5856D6",cat:"假日",desc:"香港公眾假期公共日曆。",type:"gcal_id",id:"zh.hong_kong#holiday@group.v.calendar.google.com",regions:["HK"]},
 {icon:"🇨🇳",title:"中國法定節假日",k:"holiday",c:"CN",dk:"holiday_d",ck:"cat_holiday",color:"#FF3B30",cat:"假日",desc:"中國大陸法定節假日公共日曆。",type:"gcal_id",id:"zh.china#holiday@group.v.calendar.google.com",regions:["CN"]},
 {icon:"🇯🇵",title:"日本國定假日",k:"holiday",c:"JP",dk:"holiday_d",ck:"cat_holiday",color:"#FF2D55",cat:"假日",desc:"日本祝日官方公共日曆，旅日排程必備。",type:"gcal_id",id:"ja.japanese#holiday@group.v.calendar.google.com",regions:["JP","TW","HK"]},
 {icon:"🇺🇸",title:"美國國定假日",k:"holiday",c:"US",dk:"holiday_d",ck:"cat_holiday",color:"#007AFF",cat:"假日",desc:"美國聯邦假日公共日曆。",type:"gcal_id",id:"en.usa#holiday@group.v.calendar.google.com",regions:["US"]},
 {icon:"🇫🇷",title:"法國國定假日",k:"holiday",c:"FR",dk:"holiday_d",ck:"cat_holiday",color:"#0055A4",cat:"假日",desc:"法國國定假日公共日曆。",type:"gcal_id",id:"fr.french#holiday@group.v.calendar.google.com",regions:["FR"]},
 {icon:"🇪🇸",title:"西班牙國定假日",k:"holiday",c:"ES",dk:"holiday_d",ck:"cat_holiday",color:"#C60B1E",cat:"假日",desc:"西班牙國定假日公共日曆。",type:"gcal_id",id:"es.spain#holiday@group.v.calendar.google.com",regions:["ES"]},
 {icon:"🇩🇪",title:"德國國定假日",k:"holiday",c:"DE",dk:"holiday_d",ck:"cat_holiday",color:"#1d1d1f",cat:"假日",desc:"德國國定假日公共日曆。",type:"gcal_id",id:"de.german#holiday@group.v.calendar.google.com",regions:["DE"]},
 {icon:"🌙",title:"月相日曆",k:"moon",dk:"moon_d",ck:"cat_life",color:"#AF52DE",cat:"生活",desc:"滿月、新月等月相時間，Google 公共日曆。",type:"gcal_id",id:"ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com",regions:["*"]},
 {icon:"🏀",title:"NBA / 更多賽事",k:"sports",dk:"sports_d",ck:"cat_sport",color:"#FF9500",cat:"運動",desc:"更多賽事日曆整理中，之後陸續上線。想先看哪個？歡迎許願。",type:"soon",regions:["*"]},
 {icon:"🍎",title:"科技發表會",k:"tech",dk:"tech_d",ck:"cat_tech",color:"#8E8E93",cat:"科技",desc:"Apple、Google 等大型發表會時間線，整理中。",type:"soon",regions:["*"]}
];
window.CAL={
 ics:function(id){return "https://calendar.google.com/calendar/ical/"+encodeURIComponent(id)+"/public/basic.ics"},
 webcal:function(id){return window.CAL.ics(id).replace(/^https:/,"webcal:")},
 gcal:function(id){return "https://calendar.google.com/calendar/r?cid="+encodeURIComponent(id)},
 app:function(ics,title){return "secalender://addcalendar?url="+encodeURIComponent(ics)+"&title="+encodeURIComponent(title)},
 forRegion:function(r){return window.CATALOG.filter(function(c){return !c.regions||c.regions.indexOf("*")>-1||c.regions.indexOf(r)>-1})}
};
window.TEMPLATES=[
 {icon:"🗼",title:"東京五日親子",meta:"5 天 · 22 個行程"},
 {icon:"🏃",title:"馬拉松備賽 12 週",meta:"12 週 · 每週 3–5 練"},
 {icon:"💍",title:"婚禮籌備 90 天",meta:"90 天 · 里程碑"},
 {icon:"📚",title:"期末衝刺四週",meta:"4 週 · 依科目輪排"},
 {icon:"🍼",title:"新生兒作息週表",meta:"每日循環 · 可調間隔"},
 {icon:"🧳",title:"週末城市散步",meta:"2 天 · 步行動線"}
];
