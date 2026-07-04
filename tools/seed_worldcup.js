// 修改内容：時事活動 — 將 2026 世界盃 104 場賽事時間線寫入 Firestore `public_events`
// 供所有 App 使用者（待安排「時事活動」區）與網站讀取。
//
// 使用方式（需管理者本機執行一次）：
//   1. Firebase Console → 專案設定 → 服務帳戶 → 產生新私鑰，存為 serviceAccount.json（勿入 git）
//   2. npm install firebase-admin
//   3. node seed_worldcup.js ./serviceAccount.json
//
// 冪等：以固定文件 id（wc2026_001…）覆寫，可重複執行。

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("用法：node seed_worldcup.js ./serviceAccount.json");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
});
const db = admin.firestore();

const events = JSON.parse(fs.readFileSync(path.join(__dirname, "worldcup2026_events.json"), "utf8"));

(async () => {
  let batch = db.batch();
  let count = 0;
  for (const ev of events) {
    const ref = db.collection("public_events").doc(ev.id);
    batch.set(ref, {
      title: ev.title,
      category: ev.category,
      stage: ev.stage,
      matchNo: ev.matchNo,
      startAt: admin.firestore.Timestamp.fromDate(new Date(ev.startAt)),
      endAt: admin.firestore.Timestamp.fromDate(new Date(ev.endAt)),
      location: ev.location,
      source: "secalender_official",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
    if (count % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log(`✅ 已寫入 ${count} 場賽事到 public_events`);
  process.exit(0);
})();
