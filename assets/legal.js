/* 修改内容：法律页多语切换 — 依 I18N 语系自动选，按钮可手动切换，#hash 可直达 */
(function () {
  var ORDER = [
    { id: 'zh', label: '繁體中文', langs: ['zh-TW', 'zh-HK'] },
    { id: 'cn', label: '简体中文', langs: ['zh-CN'] },
    { id: 'en', label: 'English',  langs: ['en', 'fr', 'de'] },
    { id: 'ja', label: '日本語',   langs: ['ja'] },
    { id: 'es', label: 'Español',  langs: ['es'] }
  ];
  var LANGATTR = { zh: 'zh-Hant', cn: 'zh-Hans', en: 'en', ja: 'ja', es: 'es' };

  function blocks() {
    return ORDER.filter(function (o) { return document.getElementById(o.id); });
  }
  function show(id) {
    blocks().forEach(function (o) { document.getElementById(o.id).hidden = (o.id !== id); });
    document.querySelectorAll('.lang-sw button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === id);
    });
    document.documentElement.lang = LANGATTR[id] || 'en';
    try { history.replaceState(null, '', location.pathname + '#' + id); } catch (e) {}
  }
  window.setLang = show;

  function init() {
    var bar = document.querySelector('.lang-sw');
    if (!bar) return;
    bar.innerHTML = blocks().map(function (o) {
      return '<button data-lang="' + o.id + '" onclick="setLang(\'' + o.id + '\')">' + o.label + '</button>';
    }).join('');
    var hash = (location.hash || '').replace('#', '');
    var lang = (window.I18N && window.I18N.lang) || 'zh-TW';
    var pick = 'en';
    blocks().forEach(function (o) { if (o.langs.indexOf(lang) > -1) pick = o.id; });
    if (hash && document.getElementById(hash)) pick = hash;
    show(pick);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
