/* 國家／語系：判定 → 套用字串 → 切換器
   優先序：?region= → localStorage → 時區 → 瀏覽器語言 → TW */
window.I18N=(function(){
  var REGIONS={
    TW:{lang:"zh-TW",flag:"🇹🇼",name:"台灣"},
    HK:{lang:"zh-HK",flag:"🇭🇰",name:"香港"},
    CN:{lang:"zh-CN",flag:"🇨🇳",name:"中国大陆"},
    JP:{lang:"ja",flag:"🇯🇵",name:"日本"},
    US:{lang:"en",flag:"🇺🇸",name:"United States"},
    FR:{lang:"fr",flag:"🇫🇷",name:"France"},
    ES:{lang:"es",flag:"🇪🇸",name:"España"},
    DE:{lang:"de",flag:"🇩🇪",name:"Deutschland"}
  };
  var TZ={"Asia/Taipei":"TW","Asia/Hong_Kong":"HK","Asia/Macau":"HK","Asia/Shanghai":"CN","Asia/Chongqing":"CN","Asia/Urumqi":"CN","Asia/Tokyo":"JP",
          "Europe/Paris":"FR","Europe/Madrid":"ES","Atlantic/Canary":"ES","Europe/Berlin":"DE","Europe/Busingen":"DE"};
  var S={
  "zh-TW":{
    nav_intro:"介紹",nav_tpl:"主題",nav_cal:"日曆",nav_contact:"聯繫我們",nav_dl:"下載 App",region:"國家／地區",
    hero_h:"行程，不用從空白開始。",hero_p:"現成的行程模板與公開活動，選一個開始日期，整份直接進你的行事曆。",hero_dl:"下載 App",hero_pub:"查看公開行程",
    intro_h:"網頁看得到，<br>App 做得更多。",intro_p:"說一句話，AI 把它拆成行程、比對你和朋友的空檔，直接排進行事曆。",
    tpl_h:"人們用它，在安排什麼？",tpl_p:"團課、演出、看房、讀書會…左右拖曳看看。挑一個主題，App 幫你排好時間、開放報名、自動提醒。",tpl_go:"在 App 中開始",
    pub_h:"正在發生的事，也一起放進來。",pub_p:"{region}的賽事、假日、發表會公開日曆，加入後在 App 裡逐場挑選。",
    add:"加入 App",added:"已加入 ✓",adding:"加入中…",removing:"移除中…",live:"進行中",soon:"即將上線",view:"查看賽程",
    start_h:"開始我的行程。",start_ios:"下載 iOS 版",start_web:"開啟網頁版",
    help_h:"需要幫忙？",help_p:"使用問題、日曆內容許願、合作提案，都可以直接寫信給我們，兩個工作日內回覆。",help_mail:"寫信給我們",help_faq:"常見問題",
    sup_h:"支援中心",sup_p:"找不到答案？來信 <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a>，我們會在 2 個工作日內回覆。",f_events:"時事活動",f_support:"支援",f_privacy:"隱私政策",f_terms:"服務條款",f_guidelines:"社群規範",f_delete:"刪除帳號",
    m_login_t:"登入後加入「{title}」",m_login_p:"用你的 Secalender 帳號登入，行程會直接進你的行事曆，手機 App 同步可見。還沒有帳號？先下載 App 註冊。",
    m_off_t:"暫時無法連線",m_off_p:"目前的網路無法連到登入服務。請下載 Secalender App，在 App 內加入這個日曆。",
    m_google:"使用 Google 登入",m_apple:"使用 Apple 登入",m_nodl:"沒有帳號？下載 App",m_later:"稍後再說",
    t_added:"已加入「{title}」，App 與網頁日曆會同步顯示",t_fail:"加入失敗：{e}",t_rm:"已取消加入",t_rmfail:"取消失敗：{e}",t_cancel:"已取消登入",t_lfail:"登入失敗：{e}",
    t_confirm:"取消加入「{title}」？這個日曆帶入的行程會一併移除。",
    holiday:"{c}國定假日",holiday_d:"{c}官方公共日曆，自動更新。",moon:"月相日曆",moon_d:"滿月、新月等月相時間。",
    wc:"2026 世界盃",wc_d:"美加墨 104 場完整賽程，逐場提醒、時區自動換算。",
    sports:"更多賽事",sports_d:"更多賽事日曆整理中，想先看哪個？歡迎許願。",tech:"科技發表會",tech_d:"Apple、Google 等大型發表會時間線，整理中。",
    cat_sport:"運動",cat_holiday:"假日",cat_life:"生活",cat_tech:"科技",
    C:{TW:"台灣",HK:"香港",CN:"中國",JP:"日本",US:"美國",FR:"法國",ES:"西班牙",DE:"德國"}
  },
  "zh-CN":{
    nav_intro:"介绍",nav_tpl:"主题",nav_cal:"日历",nav_contact:"联系我们",nav_dl:"下载 App",region:"国家／地区",
    hero_h:"行程，不用从空白开始。",hero_p:"现成的行程模板与公开活动，选一个开始日期，整份直接进你的日历。",hero_dl:"下载 App",hero_pub:"查看公开行程",
    intro_h:"网页看得到，<br>App 做得更多。",intro_p:"说一句话，AI 把它拆成行程、比对你和朋友的空档，直接排进日历。",
    tpl_h:"人们用它，在安排什么？",tpl_p:"团课、演出、看房、读书会…左右拖动看看。挑一个主题，App 帮你排好时间、开放报名、自动提醒。",tpl_go:"在 App 中开始",
    pub_h:"正在发生的事，也一起放进来。",pub_p:"{region}的赛事、假日、发布会公开日历，加入后在 App 里逐场挑选。",
    add:"加入 App",added:"已加入 ✓",adding:"加入中…",removing:"移除中…",live:"进行中",soon:"即将上线",view:"查看赛程",
    start_h:"开始我的行程。",start_ios:"下载 iOS 版",start_web:"打开网页版",
    help_h:"需要帮忙？",help_p:"使用问题、日历内容许愿、合作提案，都可以直接写信给我们，两个工作日内回复。",help_mail:"写信给我们",help_faq:"常见问题",
    sup_h:"支持中心",sup_p:"找不到答案？来信 <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a>，我们会在 2 个工作日内回复。",f_events:"时事活动",f_support:"支持",f_privacy:"隐私政策",f_terms:"服务条款",f_guidelines:"社群规范",f_delete:"删除账号",
    m_login_t:"登录后加入「{title}」",m_login_p:"用你的 Secalender 账号登录，行程会直接进你的日历，手机 App 同步可见。还没有账号？先下载 App 注册。",
    m_off_t:"暂时无法连接",m_off_p:"当前网络无法连接登录服务。请下载 Secalender App，在 App 内加入这个日历。",
    m_google:"使用 Google 登录",m_apple:"使用 Apple 登录",m_nodl:"没有账号？下载 App",m_later:"稍后再说",
    t_added:"已加入「{title}」，App 与网页日历会同步显示",t_fail:"加入失败：{e}",t_rm:"已取消加入",t_rmfail:"取消失败：{e}",t_cancel:"已取消登录",t_lfail:"登录失败：{e}",
    t_confirm:"取消加入「{title}」？这个日历带入的行程会一并移除。",
    holiday:"{c}法定节假日",holiday_d:"{c}官方公共日历，自动更新。",moon:"月相日历",moon_d:"满月、新月等月相时间。",
    wc:"2026 世界杯",wc_d:"美加墨 104 场完整赛程，逐场提醒、时区自动换算。",
    sports:"更多赛事",sports_d:"更多赛事日历整理中，想先看哪个？欢迎许愿。",tech:"科技发布会",tech_d:"Apple、Google 等大型发布会时间线，整理中。",
    cat_sport:"运动",cat_holiday:"假日",cat_life:"生活",cat_tech:"科技",
    C:{TW:"台湾",HK:"香港",CN:"中国",JP:"日本",US:"美国",FR:"法国",ES:"西班牙",DE:"德国"}
  },
  ja:{
    nav_intro:"紹介",nav_tpl:"テーマ",nav_cal:"カレンダー",nav_contact:"お問い合わせ",nav_dl:"アプリを入手",region:"国／地域",
    hero_h:"予定を、白紙から始めない。",hero_p:"用意されたテンプレートと公開イベント。開始日を選ぶだけで、まるごとカレンダーに入ります。",hero_dl:"アプリを入手",hero_pub:"公開カレンダーを見る",
    intro_h:"ウェブで見て、<br>アプリでもっと。",intro_p:"ひと言話すだけで、AIが予定に分解し、友だちの空き時間と照らし合わせてカレンダーに入れます。",
    tpl_h:"みんなは何を組んでいる？",tpl_p:"レッスン、公演、内見、読書会…左右にドラッグ。テーマを選べば、日程・申込・リマインドまでアプリが引き受けます。",tpl_go:"アプリで始める",
    pub_h:"いま起きていることも、一緒に。",pub_p:"{region}のスポーツ・祝日・発表会の公開カレンダー。追加後はアプリで個別に選べます。",
    add:"アプリに追加",added:"追加済み ✓",adding:"追加中…",removing:"削除中…",live:"開催中",soon:"近日公開",view:"日程を見る",
    start_h:"自分の予定を始める。",start_ios:"iOS版をダウンロード",start_web:"ウェブ版を開く",
    help_h:"お困りですか？",help_p:"使い方、カレンダーのリクエスト、提携のご提案はメールでどうぞ。2営業日以内に返信します。",help_mail:"メールを送る",help_faq:"よくある質問",
    sup_h:"サポート",sup_p:"答えが見つからない場合は <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a> までご連絡ください。2 営業日以内に返信します。",f_events:"イベント",f_support:"サポート",f_privacy:"プライバシー",f_terms:"利用規約",f_guidelines:"コミュニティガイドライン",f_delete:"アカウント削除",
    m_login_t:"ログインして「{title}」を追加",m_login_p:"Secalenderアカウントでログインすると、予定がカレンダーに入り、アプリでも同期されます。アカウントがない方はまずアプリをダウンロード。",
    m_off_t:"接続できません",m_off_p:"現在のネットワークではログインできません。Secalenderアプリからこのカレンダーを追加してください。",
    m_google:"Googleでログイン",m_apple:"Appleでログイン",m_nodl:"アカウントがない？アプリを入手",m_later:"あとで",
    t_added:"「{title}」を追加しました。アプリとウェブで同期されます",t_fail:"追加できませんでした：{e}",t_rm:"追加を取り消しました",t_rmfail:"取り消せませんでした：{e}",t_cancel:"ログインをキャンセルしました",t_lfail:"ログイン失敗：{e}",
    t_confirm:"「{title}」の追加を取り消しますか？このカレンダーの予定も削除されます。",
    holiday:"{c}の祝日",holiday_d:"{c}の公式公開カレンダー。自動更新。",moon:"月相カレンダー",moon_d:"満月・新月などの時刻。",
    wc:"2026 ワールドカップ",wc_d:"米・加・墨 全104試合。試合ごとの通知、時差は自動換算。",
    sports:"その他のスポーツ",sports_d:"準備中。見たい大会をリクエストしてください。",tech:"テック発表会",tech_d:"Apple・Googleなどの発表会タイムライン。準備中。",
    cat_sport:"スポーツ",cat_holiday:"祝日",cat_life:"生活",cat_tech:"テック",
    C:{TW:"台湾",HK:"香港",CN:"中国",JP:"日本",US:"アメリカ",FR:"フランス",ES:"スペイン",DE:"ドイツ"}
  },
  en:{
    nav_intro:"Overview",nav_tpl:"Themes",nav_cal:"Calendar",nav_contact:"Contact",nav_dl:"Get the App",region:"Country / Region",
    hero_h:"Plans don't have to start from blank.",hero_p:"Ready-made itineraries and public events. Pick a start date and the whole plan lands in your calendar.",hero_dl:"Get the App",hero_pub:"Browse public calendars",
    intro_h:"See it on the web,<br>do more in the app.",intro_p:"Say one sentence—AI turns it into events, checks your friends' availability, and puts it on the calendar.",
    tpl_h:"What people schedule with it.",tpl_p:"Classes, shows, viewings, book clubs — drag to browse. Pick a theme and the app handles the times, sign-ups and reminders.",tpl_go:"Start in the app",
    pub_h:"What's happening now, too.",pub_p:"Public calendars for {region}: sports, holidays, launches. Add one and pick events inside the app.",
    add:"Add to App",added:"Added ✓",adding:"Adding…",removing:"Removing…",live:"Live now",soon:"Coming soon",view:"See schedule",
    start_h:"Start my plan.",start_ios:"Download for iOS",start_web:"Open web version",
    help_h:"Need help?",help_p:"Questions, calendar requests or partnership ideas—email us and we'll reply within two business days.",help_mail:"Email us",help_faq:"FAQ",
    sup_h:"Support",sup_p:"Can't find an answer? Email <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a> and we reply within 2 business days.",f_events:"Events",f_support:"Support",f_privacy:"Privacy",f_terms:"Terms",f_guidelines:"Guidelines",f_delete:"Delete account",
    m_login_t:"Sign in to add “{title}”",m_login_p:"Sign in with your Secalender account. Events go straight to your calendar and sync to the app. No account yet? Download the app first.",
    m_off_t:"Can't connect right now",m_off_p:"The sign-in service isn't reachable on this network. Please add this calendar from the Secalender app.",
    m_google:"Sign in with Google",m_apple:"Sign in with Apple",m_nodl:"No account? Get the app",m_later:"Maybe later",
    t_added:"Added “{title}”. It syncs to the app and web calendar.",t_fail:"Couldn't add: {e}",t_rm:"Removed",t_rmfail:"Couldn't remove: {e}",t_cancel:"Sign-in cancelled",t_lfail:"Sign-in failed: {e}",
    t_confirm:"Remove “{title}”? Events from this calendar will be removed too.",
    holiday:"{c} Holidays",holiday_d:"Official public holiday calendar for {c}, auto-updated.",moon:"Moon Phases",moon_d:"Full moon, new moon and more.",
    wc:"2026 World Cup",wc_d:"All 104 matches across US, Canada & Mexico. Per-match reminders, local time zones.",
    sports:"More sports",sports_d:"More sports calendars in the works—tell us which you'd like first.",tech:"Tech Events",tech_d:"Apple, Google and other keynote timelines. In progress.",
    cat_sport:"Sports",cat_holiday:"Holidays",cat_life:"Life",cat_tech:"Tech",
    C:{TW:"Taiwan",HK:"Hong Kong",CN:"China",JP:"Japan",US:"US",FR:"France",ES:"Spain",DE:"Germany"}
  },
  fr:{
    nav_intro:"Présentation",nav_tpl:"Thèmes",nav_cal:"Calendrier",nav_contact:"Contact",nav_dl:"Télécharger",region:"Pays / Région",
    hero_h:"Un planning ne part pas de zéro.",hero_p:"Des itinéraires prêts et des événements publics. Choisissez une date de départ, tout arrive dans votre calendrier.",hero_dl:"Télécharger l'app",hero_pub:"Voir les calendriers publics",
    intro_h:"Voir sur le web,<br>faire plus dans l'app.",intro_p:"Une phrase suffit : l'IA la transforme en événements, compare vos disponibilités et remplit le calendrier.",
    tpl_h:"Ce que les gens organisent.",tpl_p:"Cours, spectacles, visites, clubs de lecture — glissez pour parcourir. Choisissez un thème : l'app gère horaires, inscriptions et rappels.",tpl_go:"Commencer dans l'app",
    pub_h:"Ce qui se passe maintenant, aussi.",pub_p:"Calendriers publics pour {region} : sport, jours fériés, keynotes. Ajoutez-en un et choisissez dans l'app.",
    add:"Ajouter à l'app",added:"Ajouté ✓",adding:"Ajout…",removing:"Retrait…",live:"En cours",soon:"Bientôt",view:"Voir le calendrier",
    start_h:"Commencer mon planning.",start_ios:"Télécharger pour iOS",start_web:"Ouvrir la version web",
    help_h:"Besoin d'aide ?",help_p:"Questions, demandes de calendriers ou partenariats : écrivez-nous, réponse sous deux jours ouvrés.",help_mail:"Nous écrire",help_faq:"FAQ",
    sup_h:"Assistance",sup_p:"Vous ne trouvez pas de réponse ? Écrivez à <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a>, réponse sous 2 jours ouvrés.",f_events:"Événements",f_support:"Assistance",f_privacy:"Confidentialité",f_terms:"Conditions",f_guidelines:"Règles",f_delete:"Supprimer le compte",
    m_login_t:"Connectez-vous pour ajouter « {title} »",m_login_p:"Connectez-vous avec votre compte Secalender : les événements vont dans votre calendrier et se synchronisent avec l'app. Pas de compte ? Téléchargez d'abord l'app.",
    m_off_t:"Connexion impossible",m_off_p:"Le service de connexion est inaccessible sur ce réseau. Ajoutez ce calendrier depuis l'app Secalender.",
    m_google:"Continuer avec Google",m_apple:"Continuer avec Apple",m_nodl:"Pas de compte ? Télécharger",m_later:"Plus tard",
    t_added:"« {title} » ajouté. Synchronisé avec l'app et le web.",t_fail:"Échec : {e}",t_rm:"Retiré",t_rmfail:"Échec du retrait : {e}",t_cancel:"Connexion annulée",t_lfail:"Connexion échouée : {e}",
    t_confirm:"Retirer « {title} » ? Ses événements seront aussi supprimés.",
    holiday:"Jours fériés – {c}",holiday_d:"Calendrier public officiel ({c}), mis à jour automatiquement.",moon:"Phases de la Lune",moon_d:"Pleine lune, nouvelle lune, etc.",
    wc:"Coupe du monde 2026",wc_d:"Les 104 matchs aux États-Unis, Canada et Mexique. Rappels par match, fuseau local.",
    sports:"Plus de sport",sports_d:"D'autres calendriers arrivent — dites-nous lesquels en premier.",tech:"Keynotes tech",tech_d:"Apple, Google et autres grands événements. En préparation.",
    cat_sport:"Sport",cat_holiday:"Fériés",cat_life:"Vie",cat_tech:"Tech",
    C:{TW:"Taïwan",HK:"Hong Kong",CN:"Chine",JP:"Japon",US:"États-Unis",FR:"France",ES:"Espagne",DE:"Allemagne"}
  },
  es:{
    nav_intro:"Descripción",nav_tpl:"Temas",nav_cal:"Calendario",nav_contact:"Contacto",nav_dl:"Descargar",region:"País / Región",
    hero_h:"Tus planes no empiezan desde cero.",hero_p:"Itinerarios listos y eventos públicos. Elige una fecha de inicio y todo el plan entra en tu calendario.",hero_dl:"Descargar la app",hero_pub:"Ver calendarios públicos",
    intro_h:"Míralo en la web,<br>haz más en la app.",intro_p:"Di una frase: la IA la convierte en eventos, compara la disponibilidad de tus amigos y la pone en el calendario.",
    tpl_h:"Lo que la gente organiza.",tpl_p:"Clases, conciertos, visitas, clubes de lectura: arrastra para explorar. Elige un tema y la app se encarga de horarios, inscripciones y recordatorios.",tpl_go:"Empezar en la app",
    pub_h:"Lo que está pasando, también.",pub_p:"Calendarios públicos de {region}: deportes, festivos, presentaciones. Añade uno y elige eventos en la app.",
    add:"Añadir a la app",added:"Añadido ✓",adding:"Añadiendo…",removing:"Quitando…",live:"En curso",soon:"Próximamente",view:"Ver calendario",
    start_h:"Empezar mi plan.",start_ios:"Descargar para iOS",start_web:"Abrir versión web",
    help_h:"¿Necesitas ayuda?",help_p:"Dudas, peticiones de calendarios o propuestas: escríbenos y respondemos en dos días laborables.",help_mail:"Escríbenos",help_faq:"Preguntas frecuentes",
    sup_h:"Soporte",sup_p:"¿No encuentras la respuesta? Escribe a <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a>, respondemos en 2 días laborables.",f_events:"Eventos",f_support:"Soporte",f_privacy:"Privacidad",f_terms:"Términos",f_guidelines:"Normas",f_delete:"Eliminar cuenta",
    m_login_t:"Inicia sesión para añadir «{title}»",m_login_p:"Con tu cuenta Secalender, los eventos van directo a tu calendario y se sincronizan con la app. ¿Sin cuenta? Descarga la app primero.",
    m_off_t:"No hay conexión",m_off_p:"No se puede acceder al inicio de sesión en esta red. Añade este calendario desde la app Secalender.",
    m_google:"Continuar con Google",m_apple:"Continuar con Apple",m_nodl:"¿Sin cuenta? Descargar app",m_later:"Más tarde",
    t_added:"«{title}» añadido. Se sincroniza con la app y la web.",t_fail:"No se pudo añadir: {e}",t_rm:"Eliminado",t_rmfail:"No se pudo quitar: {e}",t_cancel:"Inicio de sesión cancelado",t_lfail:"Error al iniciar sesión: {e}",
    t_confirm:"¿Quitar «{title}»? Sus eventos también se eliminarán.",
    holiday:"Festivos de {c}",holiday_d:"Calendario público oficial de {c}, actualizado automáticamente.",moon:"Fases lunares",moon_d:"Luna llena, luna nueva y más.",
    wc:"Mundial 2026",wc_d:"Los 104 partidos en EE. UU., Canadá y México. Recordatorios por partido, hora local.",
    sports:"Más deportes",sports_d:"Más calendarios en camino: dinos cuál quieres primero.",tech:"Eventos tech",tech_d:"Presentaciones de Apple, Google y más. En preparación.",
    cat_sport:"Deportes",cat_holiday:"Festivos",cat_life:"Vida",cat_tech:"Tech",
    C:{TW:"Taiwán",HK:"Hong Kong",CN:"China",JP:"Japón",US:"EE. UU.",FR:"Francia",ES:"España",DE:"Alemania"}
  },
  de:{
    nav_intro:"Überblick",nav_tpl:"Themen",nav_cal:"Kalender",nav_contact:"Kontakt",nav_dl:"App laden",region:"Land / Region",
    hero_h:"Pläne müssen nicht bei null beginnen.",hero_p:"Fertige Pläne und öffentliche Events. Startdatum wählen – der ganze Plan landet in deinem Kalender.",hero_dl:"App laden",hero_pub:"Öffentliche Kalender ansehen",
    intro_h:"Im Web sehen,<br>in der App mehr tun.",intro_p:"Ein Satz genügt: Die KI macht daraus Termine, gleicht freie Zeiten mit Freunden ab und trägt alles ein.",
    tpl_h:"Was Menschen damit planen.",tpl_p:"Kurse, Auftritte, Besichtigungen, Lesekreise – zum Stöbern ziehen. Thema wählen, die App übernimmt Termine, Anmeldungen und Erinnerungen.",tpl_go:"In der App starten",
    pub_h:"Was gerade passiert – auch dabei.",pub_p:"Öffentliche Kalender für {region}: Sport, Feiertage, Keynotes. Hinzufügen und in der App einzeln auswählen.",
    add:"Zur App hinzufügen",added:"Hinzugefügt ✓",adding:"Wird hinzugefügt…",removing:"Wird entfernt…",live:"Läuft gerade",soon:"Bald verfügbar",view:"Spielplan ansehen",
    start_h:"Meinen Plan starten.",start_ios:"Für iOS laden",start_web:"Web-Version öffnen",
    help_h:"Brauchst du Hilfe?",help_p:"Fragen, Kalenderwünsche oder Kooperationen – schreib uns, Antwort innerhalb von zwei Werktagen.",help_mail:"Schreib uns",help_faq:"FAQ",
    sup_h:"Hilfe",sup_p:"Keine Antwort gefunden? Schreib an <a href=\"mailto:linping@huodonli.com\">linping@huodonli.com</a> – Antwort in 2 Werktagen.",f_events:"Events",f_support:"Hilfe",f_privacy:"Datenschutz",f_terms:"Nutzungsbedingungen",f_guidelines:"Richtlinien",f_delete:"Konto löschen",
    m_login_t:"Anmelden, um „{title}“ hinzuzufügen",m_login_p:"Mit deinem Secalender-Konto landen die Termine direkt im Kalender und werden mit der App synchronisiert. Noch kein Konto? Erst die App laden.",
    m_off_t:"Keine Verbindung",m_off_p:"Der Anmeldedienst ist in diesem Netz nicht erreichbar. Bitte füge den Kalender in der Secalender-App hinzu.",
    m_google:"Mit Google anmelden",m_apple:"Mit Apple anmelden",m_nodl:"Kein Konto? App laden",m_later:"Später",
    t_added:"„{title}“ hinzugefügt. Wird mit App und Web synchronisiert.",t_fail:"Fehler: {e}",t_rm:"Entfernt",t_rmfail:"Entfernen fehlgeschlagen: {e}",t_cancel:"Anmeldung abgebrochen",t_lfail:"Anmeldung fehlgeschlagen: {e}",
    t_confirm:"„{title}“ entfernen? Die Termine daraus werden ebenfalls gelöscht.",
    holiday:"Feiertage {c}",holiday_d:"Offizieller öffentlicher Kalender ({c}), automatisch aktualisiert.",moon:"Mondphasen",moon_d:"Vollmond, Neumond und mehr.",
    wc:"WM 2026",wc_d:"Alle 104 Spiele in USA, Kanada & Mexiko. Erinnerung pro Spiel, lokale Zeitzone.",
    sports:"Mehr Sport",sports_d:"Weitere Sportkalender in Arbeit – sag uns, welchen zuerst.",tech:"Tech-Events",tech_d:"Keynotes von Apple, Google u. a. In Arbeit.",
    cat_sport:"Sport",cat_holiday:"Feiertage",cat_life:"Leben",cat_tech:"Tech",
    C:{TW:"Taiwan",HK:"Hongkong",CN:"China",JP:"Japan",US:"USA",FR:"Frankreich",ES:"Spanien",DE:"Deutschland"}
  }};
  S["zh-HK"]=S["zh-TW"];
  /* 修改内容：外部补充字串（assets/i18n-ui.js），同名覆写 */
  (function(){var EX=window.I18N_EXTRA||{};for(var l in EX){if(!S[l])S[l]={};for(var k in EX[l])S[l][k]=EX[l][k];}})();

  function detect(){
    var q=new URLSearchParams(location.search).get("region");
    if(q&&REGIONS[q.toUpperCase()]) return q.toUpperCase();
    try{var s=localStorage.getItem("sc_region");if(s&&REGIONS[s])return s}catch(e){}
    try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;if(TZ[tz])return TZ[tz];if(/^America\//.test(tz))return "US"}catch(e){}
    var l=(navigator.language||"").toLowerCase();
    if(/^zh-(tw|hant)/.test(l))return "TW"; if(/^zh-hk/.test(l))return "HK"; if(/^zh/.test(l))return "CN";
    if(/^ja/.test(l))return "JP"; if(/^fr/.test(l))return "FR"; if(/^es/.test(l))return "ES"; if(/^de/.test(l))return "DE"; if(/^en/.test(l))return "US";
    return "TW";
  }
  var region=detect(),lang=REGIONS[region].lang,D=S[lang];

  function t(k,v){var s=D[k]!=null?D[k]:((S.en&&S.en[k])||S["zh-TW"][k]||k);if(v)for(var x in v)s=s.split("{"+x+"}").join(v[x]);return s}
  function country(code){return (D.C||{})[code]||code}
  function apply(root){
    root=root||document;
    document.documentElement.lang=lang; document.documentElement.dataset.region=region;
    /* 修改内容：页面标题与描述也跟着语系 */
    var dt=document.documentElement.dataset;
    if(dt.i18nTitle) document.title=t(dt.i18nTitle);
    if(dt.i18nDesc){ var m=document.querySelector('meta[name="description"]'); if(m) m.setAttribute("content",t(dt.i18nDesc)); }
    root.querySelectorAll("[data-i18n]").forEach(function(el){
      var k=el.dataset.i18n,v={region:country(region)};
      if(el.dataset.i18nHtml!=null) el.innerHTML=t(k,v); else el.textContent=t(k,v);
    });
    /* 修改内容：整段内容区块（长文页用），缺该语系时退回英文、再退回繁中 */
    root.querySelectorAll("[data-i18n-ph]").forEach(function(el){ el.placeholder=t(el.dataset.i18nPh); }); /* 修改内容：输入框提示文字 */
    root.querySelectorAll("[data-i18n-block]").forEach(function(el){
      var P=window.I18N_PAGES&&window.I18N_PAGES[el.dataset.i18nBlock];
      if(!P) return;
      el.innerHTML=P[lang]||P.en||P["zh-TW"]||"";
    });
    root.querySelectorAll("[data-region-switch]").forEach(function(box){
      if(box.querySelector("select")) return;
      var sel=document.createElement("select");sel.className="rsel";sel.setAttribute("aria-label",t("region"));
      Object.keys(REGIONS).forEach(function(c){
        var o=document.createElement("option");o.value=c;o.textContent=REGIONS[c].flag+" "+REGIONS[c].name;o.selected=c===region;sel.appendChild(o);
      });
      sel.addEventListener("change",function(){set(sel.value)});
      box.appendChild(sel);
    });
  }
  function set(c){
    if(!REGIONS[c])return;
    try{localStorage.setItem("sc_region",c)}catch(e){}
    var u=new URL(location.href);u.searchParams.delete("region");
    history.replaceState(null,"",u.pathname+u.search+u.hash);
    location.reload();
  }
  return {REGIONS:REGIONS,region:region,lang:lang,t:t,country:country,apply:apply,set:set};
})();

/* 修改内容：每个载入 i18n.js 的页面自动套用字串（index 由 home.js 另外呼叫一次，重复套用无害） */
(function(){
  function go(){ try{ window.I18N.apply() }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
