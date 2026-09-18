// 修改内容：方案模板資料修正 — 刪除 4 筆重複 seed、修正「高第公園」→「奎爾公園」
// 使用方式：node fix_templates.js ./serviceAccount.json
// 冪等：可重複執行。

const admin = require("firebase-admin");
const path = require("path");

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("用法：node fix_templates.js ./serviceAccount.json");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
});
const db = admin.firestore();

// 14:55 舊 seed 重複（釜山／首爾／愛丁堡／倫敦）
const DUPLICATE_IDS = [
  "Teh4FSuC3M3ikAV5doVM",
  "e1oxgHKQVdTEkZJxgfuc",
  "frY4Mhw3alkxdamx63Yw",
  "V9fx5PJ8xyuL6Gj3szeQ",
];

// 巴塞隆納4日高第之旅
const BARCELONA_ID = "OnPsW6T5O418WWcIDd4D";

(async () => {
  const col = db.collection("templates");

  for (const id of DUPLICATE_IDS) {
    const ref = col.doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log(`skip (not found): ${id}`); continue; }
    await ref.delete();
    console.log(`deleted: ${id} ${snap.get("title")}`);
  }

  const bref = col.doc(BARCELONA_ID);
  const bsnap = await bref.get();
  if (bsnap.exists) {
    const data = bsnap.data();
    const desc = String(data.description || "").replace(/高第公園/g, "奎爾公園");
    const patch = { description: desc };
    if (data.plan_json && typeof data.plan_json === "object") {
      patch.plan_json = JSON.parse(JSON.stringify(data.plan_json).replace(/高第公園/g, "奎爾公園"));
    }
    if (typeof data.plan_json === "string") {
      patch.plan_json = data.plan_json.replace(/高第公園/g, "奎爾公園");
    }
    await bref.update(patch);
    console.log(`updated: ${BARCELONA_ID} 高第公園 → 奎爾公園`);
  } else {
    console.log(`skip (not found): ${BARCELONA_ID}`);
  }

  console.log("done");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
