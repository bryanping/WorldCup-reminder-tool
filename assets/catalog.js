/* 公開日曆目錄 — 單一資料來源，index.html 與 events.html 共用 */
/* type: page=站內專頁 · gcal_id=Google 公共日曆 · ics=外部 ics · soon=即將上線 */
window.CATALOG=[
 {icon:"⚽",title:"2026 世界盃",cat:"運動",hot:"🔥 進行中熱門",desc:"美加墨 104 場完整賽程，逐場提醒、時區自動換算，可逐場加入 App。",type:"page",href:"/worldcup.html"},
 {icon:"🇹🇼",title:"台灣國定假日",cat:"假日",desc:"台灣國定假日與補班日，Google 官方公共日曆，自動更新。",type:"gcal_id",id:"zh_tw.taiwan#holiday@group.v.calendar.google.com"},
 {icon:"🇯🇵",title:"日本國定假日",cat:"假日",desc:"日本祝日官方公共日曆，旅日排程必備。",type:"gcal_id",id:"ja.japanese#holiday@group.v.calendar.google.com"},
 {icon:"🇺🇸",title:"美國國定假日",cat:"假日",desc:"美國聯邦假日公共日曆。",type:"gcal_id",id:"en.usa#holiday@group.v.calendar.google.com"},
 {icon:"🇭🇰",title:"香港公眾假期",cat:"假日",desc:"香港公眾假期公共日曆。",type:"gcal_id",id:"zh.hong_kong#holiday@group.v.calendar.google.com"},
 {icon:"🌙",title:"月相日曆",cat:"生活",desc:"滿月、新月等月相時間，Google 公共日曆。",type:"gcal_id",id:"ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com"},
 {icon:"🏀",title:"NBA / 更多賽事",cat:"運動",desc:"更多賽事日曆整理中，之後陸續上線。想先看哪個？歡迎許願。",type:"soon"},
 {icon:"🍎",title:"科技發表會",cat:"科技",desc:"Apple、Google 等大型發表會時間線，整理中。",type:"soon"}
];
window.CAL={
 ics:function(id){return "https://calendar.google.com/calendar/ical/"+encodeURIComponent(id)+"/public/basic.ics"},
 webcal:function(id){return window.CAL.ics(id).replace(/^https:/,"webcal:")},
 gcal:function(id){return "https://calendar.google.com/calendar/r?cid="+encodeURIComponent(id)},
 app:function(ics,title){return "secalender://addcalendar?url="+encodeURIComponent(ics)+"&title="+encodeURIComponent(title)}
};
window.TEMPLATES=[
 {icon:"🗼",title:"東京五日親子",meta:"5 天 · 28 個條目"},
 {icon:"🏃",title:"馬拉松備賽 12 週",meta:"12 週 · 逐週課表"},
 {icon:"💍",title:"婚禮籌備 90 天",meta:"90 天 · 里程碑"},
 {icon:"📚",title:"期末衝刺四週",meta:"4 週 · 每日區塊"},
 {icon:"🍼",title:"新生兒作息週表",meta:"7 天 · 循環提醒"},
 {icon:"🧳",title:"週末城市散步",meta:"2 天 · 步行動線"}
];
