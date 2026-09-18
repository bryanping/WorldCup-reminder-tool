// 修改内容：Step 4 — 方案頁非旅遊示範內容 seed → Firestore `public_plan_listings`（status: approved, isSample: true）
// 使用方式：node seed_plan_listings.js ./serviceAccount.json
// 冪等：固定文件 id（sample_<solutionId>），可重複執行。

const admin = require("firebase-admin");
const path = require("path");

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("用法：node seed_plan_listings.js ./serviceAccount.json");
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(keyPath))) });
const db = admin.firestore();

const T = admin.firestore.Timestamp;
const day = 86400000;
const at = (d, h) => T.fromDate(new Date(Date.now() + d * day + h * 3600000));

// [solutionId, identity, ownerType, ownerName, title, description, location, scope, startDay, startHour, durHours]
const rows = [
  ["tutor", "education", "individual", "林老師", "國中數學家教・週末", "國一至國三數學，週六日上午，可到府或線上。免費試教一堂。", "台北市大安區 / 線上", "nearby", 6, 10, 2],
  ["language_class", "education", "company", "晨光語言教室", "日語會話班・每週三晚", "N4–N3 程度小班會話，每週三 19:00–20:30，共 8 週。", "新北市板橋區", "all", 3, 19, 1.5],
  ["workshop_lecture", "education", "group", "青年創業社", "AI 工具工作坊：一天做出你的第一個 App", "從構想到上架流程實作，限 20 人，需自備筆電。", "台中市西區", "all", 12, 13, 4],
  ["study_group", "education", "individual", "小安", "多益讀書會・找 3 位夥伴", "每週日下午圖書館讀書會，互相考單字、模擬測驗。", "高雄市左營區", "nearby", 7, 14, 3],

  ["coach_class", "health", "individual", "Kevin 教練", "晨間瑜伽團課・河濱公園", "週二四 06:30 戶外瑜伽，自備瑜伽墊，初學可。", "台北市大直河濱", "nearby", 2, 6.5, 1],
  ["sports_meetup", "health", "group", "松山羽球團", "羽球揪團・週五晚缺 4 人", "松山運動中心 3 面場地，中階程度，分攤場地費。", "台北市松山區", "nearby", 5, 20, 2],
  ["hiking_trip", "health", "group", "山友會", "陽明山七星山日出團", "05:00 小油坑集合，約 3 小時來回，需頭燈與保暖衣物。", "台北市北投區", "all", 9, 5, 4],

  ["beauty_booking", "service", "company", "Lumi 美甲工作室", "本週空檔：凝膠美甲", "週三、週五下午尚有空檔，線上預約免等候。", "台北市信義區", "nearby", 3, 14, 1.5],
  ["photographer", "service", "individual", "阿哲攝影", "10 月外拍檔期開放", "形象照／親子寫真，週末檔期，含 20 張精修。", "台北・新竹", "all", 20, 10, 2],
  ["repair_visit", "service", "individual", "老王水電", "到府水電維修・週間可約", "水管漏水、電路跳電、燈具更換，大台北地區當日到府。", "大台北", "nearby", 1, 9, 2],

  ["restaurant_event", "food", "company", "巷口咖啡", "手沖體驗日・限量 12 位", "週六下午手沖咖啡教學，含兩款單品豆試飲。", "台南市中西區", "nearby", 6, 14, 2],
  ["market_stall", "food", "individual", "阿嬤的醬料", "週末市集出攤：華山文創", "自製辣椒醬、麻油，週六日 11:00–18:00。", "台北市華山文創園區", "nearby", 6, 11, 7],
  ["venue_rental", "food", "company", "共享教室 Space+", "教室空檔出租・可容 30 人", "投影、白板、Wi-Fi 齊全，平日晚間與週末時段開放。", "台中市北區", "nearby", 4, 18, 3],

  ["volunteer", "community", "group", "淨灘聯盟", "八里淨灘・招募 30 位志工", "提供手套與夾子，活動結束發志工時數證明。", "新北市八里區", "nearby", 13, 8, 3],
  ["neighborhood_notice", "community", "group", "幸福社區管委會", "社區中庭整修說明會", "說明施工期程與停車調度，歡迎住戶參加。", "幸福社區活動中心", "nearby", 4, 19.5, 1.5],
  ["parent_group", "community", "individual", "小米媽媽", "親子共學・週三上午", "2–4 歲繪本共讀與感統遊戲，歡迎附近家庭加入。", "桃園市中壢區", "nearby", 3, 10, 1.5],

  ["recruiting", "workplace", "company", "星河科技", "iOS 工程師招募說明會", "介紹團隊與職缺，現場可直接安排面談。", "台北市內湖區 / 線上", "all", 10, 19, 1.5],
  ["freelance_slots", "workplace", "individual", "設計師 Yuki", "11 月接案檔期開放", "品牌識別、UI 設計，可接 2 個中型案。", "線上", "all", 30, 10, 1],

  ["live_show", "creative", "group", "夜行樂團", "Live 演出・河岸留言", "獨立搖滾專場，19:30 開演，免費入場。", "台北市公館", "all", 8, 19.5, 2.5],
  ["handmade_workshop", "creative", "individual", "陶陶手作", "手捏陶杯體驗", "含材料與燒製，2 小時完成一只專屬陶杯。", "新竹市東區", "nearby", 5, 14, 2],
  ["boardgame_esports", "creative", "company", "骰子桌遊店", "週五桌遊之夜・開團", "新手友善，店長帶團，飲料無限暢飲。", "台中市西屯區", "nearby", 5, 19, 3],

  ["foodie_meetup", "lifestyle", "individual", "吃貨小美", "永康街探店團・缺 2 人", "四家小吃走跳，AA 制。", "台北市永康街", "nearby", 6, 12, 3],
  ["run_ride", "lifestyle", "group", "河濱夜跑團", "週三夜跑 8K・配速 6'30", "大稻埕碼頭集合，全程有補給。", "台北市大稻埕", "nearby", 3, 20, 1.5],
  ["pet_meetup", "lifestyle", "group", "柴犬同好會", "柴犬聚會・大安森林公園", "每月一次遛狗聚會，歡迎所有毛孩。", "台北市大安森林公園", "nearby", 11, 16, 2],
  ["language_exchange", "lifestyle", "individual", "Emma", "中英語言交換・咖啡廳", "一小時中文一小時英文，輕鬆聊天。", "台北市中山區", "nearby", 4, 19, 2],
  ["swap_market", "lifestyle", "group", "永續生活圈", "二手換物日", "衣物、書籍、小家電，以物易物零消費。", "台北市松山文創園區", "nearby", 14, 13, 4],
];


// 修改内容：示範地點近似座標（附近距離篩選用）
const COORDS = {
  "台北市大安區 / 線上": [25.0264, 121.5435],
  "新北市板橋區": [25.0125, 121.4625],
  "台中市西區": [24.1418, 120.6650],
  "高雄市左營區": [22.6900, 120.3100],
  "台北市大直河濱": [25.0790, 121.5460],
  "台北市松山區": [25.0500, 121.5600],
  "台北市北投區": [25.1300, 121.5100],
  "台北市信義區": [25.0330, 121.5654],
  "台北・新竹": [25.0330, 121.5654],
  "大台北": [25.0478, 121.5170],
  "台南市中西區": [22.9920, 120.2000],
  "台北市華山文創園區": [25.0440, 121.5290],
  "台中市北區": [24.1550, 120.6820],
  "新北市八里區": [25.1480, 121.3990],
  "幸福社區活動中心": [25.0400, 121.5300],
  "桃園市中壢區": [24.9530, 121.2250],
  "台北市內湖區 / 線上": [25.0690, 121.5890],
  "線上": null,
  "台北市公館": [25.0130, 121.5340],
  "新竹市東區": [24.8010, 120.9760],
  "台中市西屯區": [24.1810, 120.6400],
  "台北市永康街": [25.0330, 121.5300],
  "台北市大稻埕": [25.0560, 121.5100],
  "台北市大安森林公園": [25.0300, 121.5360],
  "台北市中山區": [25.0640, 121.5260],
  "台北市松山文創園區": [25.0440, 121.5600],
};

(async () => {
  const batch = db.batch();
  for (const r of rows) {
    const [solutionId, identity, ownerType, ownerName, title, description, location, scope, sd, sh, dur] = r;
    const ref = db.collection("public_plan_listings").doc(`sample_${solutionId}`);
    batch.set(ref, {
      ownerId: "secalender",
      ownerType, ownerName, solutionId, identity, title, description, location, scope,
      startAt: at(sd, sh),
      endAt: at(sd, sh + dur),
      price: 0,
      ...(COORDS[location] ? { latitude: COORDS[location][0], longitude: COORDS[location][1] } : {}),
      contactPhone: "",
      contactOther: "",
      status: "approved",
      reviewFee: 0,
      reviewPaid: true,
      phoneVerified: true,
      isSample: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await batch.commit();
  console.log(`seeded ${rows.length} sample listings`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
