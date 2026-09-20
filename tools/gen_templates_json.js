// 由 assets/templates.js 產生 assets/templates.json（App 端讀取用）
// 用法：node tools/gen_templates_json.js
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'assets/templates.js'),'utf8'),sandbox);
const out={version:1,generatedAt:new Date().toISOString(),templates:sandbox.window.TPL};
fs.writeFileSync(path.join(root,'assets/templates.json'),JSON.stringify(out,null,1),'utf8');
console.log('templates.json 已更新：'+out.templates.length+' 份模板');
