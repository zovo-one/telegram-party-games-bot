// Static-text localization for PartyPack. Only user-facing static chrome lives here — the
// actual Truth/Dare/WYR/NHIE prompt content (packs.ts) is group-facing dynamic content and
// stays in English always, as does the live "{name}'s turn!" announcement in index.ts.

export const LANGS = ["en", "ru", "es", "pt", "id", "de", "tr", "uk", "fa", "ar", "hi"] as const;
export type Lang = (typeof LANGS)[number];
export type Key =
  | "start"
  | "help"
  | "spicyProOnly"
  | "spicyOn"
  | "spicyOff"
  | "whereGroup"
  | "wherePrivate"
  | "proAccountInfo"
  | "proDMOnly"
  | "proDescription"
  | "thankYou"
  | "btn_addToGroup"
  | "btn_unlockMorePrompts"
  | "app_title"
  | "app_loading"
  | "app_moreApps"
  | "app_pick"
  | "app_roll"
  | "app_freePack"
  | "app_proUnlocked"
  | "app_shareChat"
  | "app_shareStory"
  | "app_storyText"
  | "app_shareFail"
  | "app_errNoInit"
  | "app_errExpired"
  | "app_errBadSig"
  | "app_unlockPro"
  | "app_proOneTime"
  | "app_proMonthly"
  | "app_payDone"
  | "app_payCancelled"
  | "app_payFailed";

/** ctx.from.language_code -> first two letters -> known table language, else "en". */
export function resolveLang(code?: string): Lang {
  const c = (code ?? "").slice(0, 2).toLowerCase();
  return (LANGS as readonly string[]).includes(c) ? (c as Lang) : "en";
}

/** Look up `key` for `lang` (falling back to English), substituting `{name}` tokens from `vars`. */
export function t(lang: string, key: Key, vars?: Record<string, string | number>): string {
  const l: Lang = (LANGS as readonly string[]).includes(lang) ? (lang as Lang) : "en";
  let s = TABLE[key][l] ?? TABLE[key].en;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

const TABLE: Record<Key, Record<Lang, string>> = {
  start: {
    en: "🎉 Truth, dare, would-you-rather — for your group chat.\nTap below to add me, then anyone types `/truth`.\nButtons on every card: *Another ▶️* and *Next player 👉*.\nFree: 160 prompts · /help",
    ru: "🎉 Правда, действие, «что бы ты выбрал» — для твоей группы.\nНажми кнопку ниже, чтобы добавить меня, потом любой пишет `/truth`.\nНа каждой карточке: *Another ▶️* и *Next player 👉*.\nБесплатно: 160 карточек · /help",
    es: "🎉 Verdad, reto, ¿qué preferirías? — para tu grupo.\nToca el botón de abajo para añadirme, luego cualquiera escribe `/truth`.\nBotones en cada tarjeta: *Another ▶️* y *Next player 👉*.\nGratis: 160 tarjetas · /help",
    pt: "🎉 Verdade, desafio, o que você prefere — para o seu grupo.\nToque no botão abaixo para me adicionar, depois qualquer um digita `/truth`.\nBotões em cada carta: *Another ▶️* e *Next player 👉*.\nGrátis: 160 cartas · /help",
    id: "🎉 Truth, dare, would-you-rather — untuk grup chat-mu.\nKetuk tombol di bawah untuk menambahkanku, lalu siapa saja bisa ketik `/truth`.\nTombol di setiap kartu: *Another ▶️* dan *Next player 👉*.\nGratis: 160 kartu · /help",
    de: "🎉 Wahrheit, Pflicht, Was-würdest-du-eher — für deine Gruppe.\nTippe unten, um mich hinzuzufügen, dann tippt jemand `/truth`.\nSchaltflächen auf jeder Karte: *Another ▶️* und *Next player 👉*.\nKostenlos: 160 Karten · /help",
    tr: "🎉 Doğruluk, cesaret, ya-sen-olsaydın — grup sohbetin için.\nBeni eklemek için aşağıya dokun, sonra herkes `/truth` yazabilir.\nHer kartta düğmeler: *Another ▶️* ve *Next player 👉*.\nÜcretsiz: 160 kart · /help",
    uk: "🎉 Правда, дія, «що б ти обрав» — для твоєї групи.\nНатисни кнопку нижче, щоб додати мене, потім будь-хто пише `/truth`.\nКнопки на кожній карті: *Another ▶️* і *Next player 👉*.\nБезкоштовно: 160 карт · /help",
    fa: "🎉 حقیقت، جرأت، ترجیح می‌دهی — برای گروه شما.\nبرای افزودن من روی دکمه زیر بزنید، سپس هرکسی `/truth` را تایپ کند.\nدکمه‌های روی هر کارت: *Another ▶️* و *Next player 👉*.\nرایگان: 160 کارت · /help",
    ar: "🎉 الحقيقة أو الجرأة، ماذا تفضل — لمجموعتك.\nاضغط الزر أدناه لإضافتي، ثم يكتب أي شخص `/truth`.\nأزرار على كل بطاقة: *Another ▶️* و*Next player 👉*.\nمجانًا: 160 بطاقة · /help",
    hi: "🎉 ट्रुथ, डेयर, वुड-यू-रादर — आपके ग्रुप चैट के लिए।\nमुझे जोड़ने के लिए नीचे टैप करें, फिर कोई भी `/truth` टाइप करे।\nहर कार्ड पर बटन: *Another ▶️* और *Next player 👉*।\nमुफ़्त: 160 कार्ड्स · /help",
  },
  help: {
    en: "🎉 *PartyPack* — party game prompts for your group.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — get a prompt\nTap *Another ▶️* for a new prompt in the same category, or *Next player 👉* to hand off the turn.\n`/spicy` — toggle the 18+ Spicy pack (Pro). In a group it's shared by the group; in DM it applies to your own rolls and the Mini App.\n`/pro` — unlock {proMore} more prompts ({proAll} with Spicy) for your account\n\nFree: 40 prompts per category. Pro: 120 per category + Spicy.",
    ru: "🎉 *PartyPack* — карточки для вечеринки в твоей группе.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — получить карточку\nНажми *Another ▶️* для новой карточки в той же категории или *Next player 👉*, чтобы передать ход.\n`/spicy` — включить пакет 18+ Spicy (Pro). В группе — общий переключатель, в личке — только для твоих карточек и Mini App.\n`/pro` — открой ещё {proMore} карточек ({proAll} со Spicy) для своего аккаунта\n\nБесплатно: 40 карточек в каждой категории. Pro: 120 в категории + Spicy.",
    es: "🎉 *PartyPack* — tarjetas de juego para tu grupo.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — obtén una tarjeta\nToca *Another ▶️* para otra tarjeta de la misma categoría, o *Next player 👉* para pasar el turno.\n`/spicy` — activa el paquete 18+ Spicy (Pro). En un grupo es compartido; en privado aplica solo a tus tiradas y a la Mini App.\n`/pro` — desbloquea {proMore} tarjetas más ({proAll} con Spicy) para tu cuenta\n\nGratis: 40 tarjetas por categoría. Pro: 120 por categoría + Spicy.",
    pt: "🎉 *PartyPack* — cartas de jogo para o seu grupo.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — receba uma carta\nToque em *Another ▶️* para outra carta da mesma categoria, ou *Next player 👉* para passar a vez.\n`/spicy` — ativa o pacote 18+ Spicy (Pro). No grupo é compartilhado; no privado vale só para suas rodadas e o Mini App.\n`/pro` — desbloqueie mais {proMore} cartas ({proAll} com Spicy) para sua conta\n\nGrátis: 40 cartas por categoria. Pro: 120 por categoria + Spicy.",
    id: "🎉 *PartyPack* — kartu game pesta untuk grupmu.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — ambil kartu\nKetuk *Another ▶️* untuk kartu baru di kategori yang sama, atau *Next player 👉* untuk oper giliran.\n`/spicy` — aktifkan paket 18+ Spicy (Pro). Di grup berlaku bersama; di DM hanya untuk kartumu dan Mini App.\n`/pro` — buka {proMore} kartu lagi ({proAll} dengan Spicy) untuk akunmu\n\nGratis: 40 kartu per kategori. Pro: 120 per kategori + Spicy.",
    de: "🎉 *PartyPack* — Partyspiel-Karten für deine Gruppe.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — Karte ziehen\nTippe *Another ▶️* für eine neue Karte derselben Kategorie oder *Next player 👉*, um weiterzugeben.\n`/spicy` — schaltet das 18+ Spicy-Paket um (Pro). In der Gruppe gemeinsam, im DM nur für deine eigenen Karten und die Mini App.\n`/pro` — schalte {proMore} weitere Karten frei ({proAll} mit Spicy) für dein Konto\n\nKostenlos: 40 Karten pro Kategorie. Pro: 120 pro Kategorie + Spicy.",
    tr: "🎉 *PartyPack* — grubun için parti oyun kartları.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — kart al\nAynı kategoride yeni kart için *Another ▶️*'e, sırayı devretmek için *Next player 👉*'e dokun.\n`/spicy` — 18+ Spicy paketini aç/kapat (Pro). Grupta ortak, DM'de yalnızca senin kartların ve Mini App için geçerli.\n`/pro` — hesabın için {proMore} kart daha aç ({proAll} Spicy ile)\n\nÜcretsiz: kategori başına 40 kart. Pro: kategori başına 120 + Spicy.",
    uk: "🎉 *PartyPack* — карти для вечірки у твоїй групі.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — отримати карту\nНатисни *Another ▶️* для нової карти в тій самій категорії або *Next player 👉*, щоб передати хід.\n`/spicy` — увімкнути пакет 18+ Spicy (Pro). У групі — спільний перемикач, у приваті — лише для твоїх карт і Mini App.\n`/pro` — відкрий ще {proMore} карт ({proAll} зі Spicy) для свого акаунта\n\nБезкоштовно: 40 карт у кожній категорії. Pro: 120 у категорії + Spicy.",
    fa: "🎉 *PartyPack* — کارت‌های بازی مهمانی برای گروه شما.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — گرفتن یک کارت\nروی *Another ▶️* بزنید برای کارت جدید در همان دسته، یا *Next player 👉* برای واگذاری نوبت.\n`/spicy` — تعویض بسته 18+ Spicy (Pro). در گروه مشترک است؛ در پیام خصوصی فقط برای کارت‌های خودتان و Mini App اعمال می‌شود.\n`/pro` — {proMore} کارت دیگر ({proAll} با Spicy) برای حساب خود باز کنید\n\nرایگان: 40 کارت در هر دسته. Pro: 120 در هر دسته + Spicy.",
    ar: "🎉 *PartyPack* — بطاقات لعبة الحفلة لمجموعتك.\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — احصل على بطاقة\nاضغط *Another ▶️* لبطاقة جديدة في نفس الفئة، أو *Next player 👉* لتمرير الدور.\n`/spicy` — تبديل حزمة 18+ Spicy (Pro). في المجموعة مشتركة؛ في الخاص تنطبق فقط على بطاقاتك وMini App.\n`/pro` — افتح {proMore} بطاقة إضافية ({proAll} مع Spicy) لحسابك\n\nمجانًا: 40 بطاقة لكل فئة. Pro: 120 لكل فئة + Spicy.",
    hi: "🎉 *PartyPack* — आपके ग्रुप के लिए पार्टी गेम कार्ड्स।\n\n`/truth` `/dare` `/wyr` `/nhie` `/random` — एक कार्ड पाएं\nउसी श्रेणी में नया कार्ड पाने के लिए *Another ▶️* दबाएं, या बारी सौंपने के लिए *Next player 👉*।\n`/spicy` — 18+ Spicy पैक टॉगल करें (Pro)। ग्रुप में यह साझा है; DM में यह सिर्फ़ आपके कार्ड्स और Mini App पर लागू होता है।\n`/pro` — अपने खाते के लिए {proMore} और कार्ड्स अनलॉक करें ({proAll} Spicy सहित)\n\nमुफ़्त: प्रति श्रेणी 40 कार्ड्स। Pro: प्रति श्रेणी 120 + Spicy।",
  },
  spicyProOnly: {
    en: "🌶️ Spicy is a Pro feature. Unlock it for your account, then toggle it on here.",
    ru: "🌶️ Spicy — функция Pro. Открой её для своего аккаунта, потом включи здесь.",
    es: "🌶️ Spicy es una función Pro. Desbloquéala para tu cuenta y luego actívala aquí.",
    pt: "🌶️ Spicy é um recurso Pro. Desbloqueie para sua conta e ative aqui.",
    id: "🌶️ Spicy adalah fitur Pro. Buka untuk akunmu, lalu aktifkan di sini.",
    de: "🌶️ Spicy ist eine Pro-Funktion. Schalte sie für dein Konto frei und aktiviere sie dann hier.",
    tr: "🌶️ Spicy bir Pro özelliğidir. Hesabın için aç, sonra buradan etkinleştir.",
    uk: "🌶️ Spicy — функція Pro. Відкрий її для свого акаунта, потім увімкни тут.",
    fa: "🌶️ Spicy یک ویژگی Pro است. برای حساب خود باز کنید، سپس اینجا روشنش کنید.",
    ar: "🌶️ Spicy ميزة Pro. افتحها لحسابك، ثم فعّلها من هنا.",
    hi: "🌶️ Spicy एक Pro सुविधा है। इसे अपने खाते के लिए अनलॉक करें, फिर यहां चालू करें।",
  },
  spicyOn: {
    en: "🌶️ Spicy pack is now ON for {where}. Pro members get it in their rolls.",
    ru: "🌶️ Пакет Spicy теперь ВКЛЮЧЁН для {where}. Пользователи Pro получат его в своих карточках.",
    es: "🌶️ El paquete Spicy ahora está ACTIVADO para {where}. Los miembros Pro lo verán en sus tiradas.",
    pt: "🌶️ O pacote Spicy agora está ATIVADO para {where}. Membros Pro o recebem em suas rodadas.",
    id: "🌶️ Paket Spicy sekarang AKTIF untuk {where}. Anggota Pro akan mendapatkannya di kartu mereka.",
    de: "🌶️ Das Spicy-Paket ist jetzt AKTIV für {where}. Pro-Mitglieder bekommen es in ihren Karten.",
    tr: "🌶️ Spicy paketi artık {where} için AÇIK. Pro üyeler bunu kartlarında görecek.",
    uk: "🌶️ Пакет Spicy тепер УВІМКНЕНО для {where}. Користувачі Pro отримають його у своїх картах.",
    fa: "🌶️ بسته Spicy اکنون برای {where} روشن است. اعضای Pro آن را در کارت‌های خود دریافت می‌کنند.",
    ar: "🌶️ حزمة Spicy مفعّلة الآن لـ {where}. سيحصل عليها أعضاء Pro في بطاقاتهم.",
    hi: "🌶️ Spicy पैक अब {where} के लिए चालू है। Pro सदस्यों को यह उनके कार्ड्स में मिलेगा।",
  },
  spicyOff: {
    en: "Spicy pack is now off for {where}.",
    ru: "Пакет Spicy теперь выключен для {where}.",
    es: "El paquete Spicy ahora está desactivado para {where}.",
    pt: "O pacote Spicy agora está desativado para {where}.",
    id: "Paket Spicy sekarang nonaktif untuk {where}.",
    de: "Das Spicy-Paket ist jetzt deaktiviert für {where}.",
    tr: "Spicy paketi artık {where} için kapalı.",
    uk: "Пакет Spicy тепер вимкнено для {where}.",
    fa: "بسته Spicy اکنون برای {where} خاموش است.",
    ar: "حزمة Spicy معطّلة الآن لـ {where}.",
    hi: "Spicy पैक अब {where} के लिए बंद है।",
  },
  whereGroup: {
    en: "this group",
    ru: "этой группы",
    es: "este grupo",
    pt: "este grupo",
    id: "grup ini",
    de: "diese Gruppe",
    tr: "bu grup",
    uk: "цієї групи",
    fa: "این گروه",
    ar: "هذه المجموعة",
    hi: "यह ग्रुप",
  },
  wherePrivate: {
    en: "your rolls (DM + Mini App)",
    ru: "твоих карточек (личка + Mini App)",
    es: "tus tiradas (privado + Mini App)",
    pt: "suas rodadas (privado + Mini App)",
    id: "kartu-mu (DM + Mini App)",
    de: "deine Karten (DM + Mini App)",
    tr: "kartların (DM + Mini App)",
    uk: "твоїх карт (приват + Mini App)",
    fa: "کارت‌های شما (پیام خصوصی + Mini App)",
    ar: "بطاقاتك (الخاص + Mini App)",
    hi: "आपके कार्ड्स (DM + Mini App)",
  },
  proAccountInfo: {
    en: "Pro: {proMore} more prompts ({proAll} with Spicy) for your account, one-time {stars} ⭐.",
    ru: "Pro: ещё {proMore} карточек ({proAll} со Spicy) для твоего аккаунта, разовый платёж {stars} ⭐.",
    es: "Pro: {proMore} tarjetas más ({proAll} con Spicy) para tu cuenta, pago único de {stars} ⭐.",
    pt: "Pro: mais {proMore} cartas ({proAll} com Spicy) para sua conta, pagamento único de {stars} ⭐.",
    id: "Pro: {proMore} kartu lagi ({proAll} dengan Spicy) untuk akunmu, sekali bayar {stars} ⭐.",
    de: "Pro: {proMore} weitere Karten ({proAll} mit Spicy) für dein Konto, einmalig {stars} ⭐.",
    tr: "Pro: hesabın için {proMore} kart daha ({proAll} Spicy ile), tek seferlik {stars} ⭐.",
    uk: "Pro: ще {proMore} карт ({proAll} зі Spicy) для твого акаунта, разовий платіж {stars} ⭐.",
    fa: "Pro: {proMore} کارت دیگر ({proAll} با Spicy) برای حساب شما، پرداخت یک‌باره {stars} ⭐.",
    ar: "Pro: {proMore} بطاقة إضافية ({proAll} مع Spicy) لحسابك، دفعة واحدة {stars} ⭐.",
    hi: "Pro: आपके खाते के लिए {proMore} और कार्ड्स ({proAll} Spicy सहित), एकमुश्त {stars} ⭐।",
  },
  proDMOnly: {
    en: "Open a DM with @{bot} and tap /pro to unlock — Telegram doesn't allow Stars payments inside groups.",
    ru: "Открой личку с @{bot} и нажми /pro, чтобы открыть — Telegram не разрешает платежи Stars в группах.",
    es: "Abre un chat privado con @{bot} y toca /pro para desbloquear — Telegram no permite pagos con Stars dentro de grupos.",
    pt: "Abra um DM com @{bot} e toque em /pro para desbloquear — o Telegram não permite pagamentos com Stars em grupos.",
    id: "Buka DM dengan @{bot} lalu ketuk /pro untuk membuka — Telegram tidak mengizinkan pembayaran Stars di dalam grup.",
    de: "Öffne einen DM mit @{bot} und tippe /pro zum Freischalten — Telegram erlaubt keine Stars-Zahlungen in Gruppen.",
    tr: "@{bot} ile DM aç ve açmak için /pro'ya dokun — Telegram, gruplar içinde Stars ödemesine izin vermiyor.",
    uk: "Відкрий приват із @{bot} і натисни /pro, щоб відкрити — Telegram не дозволяє платежі Stars у групах.",
    fa: "با @{bot} چت خصوصی باز کنید و برای باز کردن /pro را بزنید — تلگرام پرداخت Stars داخل گروه‌ها را اجازه نمی‌دهد.",
    ar: "افتح محادثة خاصة مع @{bot} واضغط /pro للفتح — تيليجرام لا يسمح بمدفوعات Stars داخل المجموعات.",
    hi: "@{bot} के साथ DM खोलें और अनलॉक करने के लिए /pro दबाएं — Telegram ग्रुप्स के अंदर Stars भुगतान की अनुमति नहीं देता।",
  },
  proDescription: {
    en: "Unlock {proMore} more prompts (Truth, Dare, Would You Rather, Never Have I Ever) plus the {spicyMore}-prompt 18+ Spicy pack, everywhere you play. One-time payment.",
    ru: "Открой ещё {proMore} карточек (Truth, Dare, Would You Rather, Never Have I Ever) плюс пакет 18+ Spicy из {spicyMore} карточек — везде, где играешь. Разовый платёж.",
    es: "Desbloquea {proMore} tarjetas más (Truth, Dare, Would You Rather, Never Have I Ever) más el paquete 18+ Spicy de {spicyMore} tarjetas, en todas partes donde juegues. Pago único.",
    pt: "Desbloqueie mais {proMore} cartas (Truth, Dare, Would You Rather, Never Have I Ever) além do pacote 18+ Spicy de {spicyMore} cartas, em qualquer lugar que jogar. Pagamento único.",
    id: "Buka {proMore} kartu lagi (Truth, Dare, Would You Rather, Never Have I Ever) plus paket 18+ Spicy berisi {spicyMore} kartu, di mana pun kamu bermain. Sekali bayar.",
    de: "Schalte {proMore} weitere Karten frei (Truth, Dare, Would You Rather, Never Have I Ever) plus das 18+ Spicy-Paket mit {spicyMore} Karten, überall wo du spielst. Einmalzahlung.",
    tr: "{proMore} kart daha aç (Truth, Dare, Would You Rather, Never Have I Ever) artı {spicyMore} kartlık 18+ Spicy paketi, oynadığın her yerde. Tek seferlik ödeme.",
    uk: "Відкрий ще {proMore} карт (Truth, Dare, Would You Rather, Never Have I Ever) плюс пакет 18+ Spicy із {spicyMore} карт — усюди, де граєш. Разовий платіж.",
    fa: "{proMore} کارت دیگر (Truth, Dare, Would You Rather, Never Have I Ever) به‌علاوه بسته 18+ Spicy با {spicyMore} کارت را در هر جا که بازی می‌کنید باز کنید. پرداخت یک‌باره.",
    ar: "افتح {proMore} بطاقة إضافية (Truth, Dare, Would You Rather, Never Have I Ever) بالإضافة إلى حزمة 18+ Spicy المكوّنة من {spicyMore} بطاقة، أينما لعبت. دفعة واحدة.",
    hi: "{proMore} और कार्ड्स अनलॉक करें (Truth, Dare, Would You Rather, Never Have I Ever) साथ ही {spicyMore}-कार्ड वाला 18+ Spicy पैक, जहां भी आप खेलें। एकमुश्त भुगतान।",
  },
  thankYou: {
    en: "✅ Pro unlocked! You get {proMore} more prompts everywhere ({proAll} with Spicy), plus /spicy in any group or in DM.\n\n/more — more free tools",
    ru: "✅ Pro активирован! Теперь у тебя есть {proMore} новых карточек везде ({proAll} со Spicy), плюс /spicy в любой группе или в личке.\n\n/more — другие бесплатные инструменты",
    es: "✅ ¡Pro activado! Ahora tienes {proMore} tarjetas más en todas partes ({proAll} con Spicy), además de /spicy en cualquier grupo o en privado.\n\n/more — más herramientas gratis",
    pt: "✅ Pro ativado! Você ganhou {proMore} cartas a mais em todo lugar ({proAll} com Spicy), além de /spicy em qualquer grupo ou no privado.\n\n/more — mais ferramentas grátis",
    id: "✅ Pro aktif! Kamu dapat {proMore} kartu lagi di mana pun ({proAll} dengan Spicy), plus /spicy di grup mana pun atau di DM.\n\n/more — alat gratis lainnya",
    de: "✅ Pro freigeschaltet! Du bekommst überall {proMore} weitere Karten ({proAll} mit Spicy), plus /spicy in jeder Gruppe oder im DM.\n\n/more — weitere kostenlose Tools",
    tr: "✅ Pro açıldı! Her yerde {proMore} kart daha alırsın ({proAll} Spicy ile), artı herhangi bir grupta veya DM'de /spicy.\n\n/more — daha fazla ücretsiz araç",
    uk: "✅ Pro активовано! Тепер у тебе є {proMore} нових карт усюди ({proAll} зі Spicy), плюс /spicy в будь-якій групі чи в приваті.\n\n/more — інші безкоштовні інструменти",
    fa: "✅ Pro فعال شد! شما {proMore} کارت دیگر در همه‌جا دریافت می‌کنید ({proAll} با Spicy)، به‌علاوه /spicy در هر گروه یا در پیام خصوصی.\n\n/more — ابزارهای رایگان بیشتر",
    ar: "✅ تم تفعيل Pro! ستحصل على {proMore} بطاقة إضافية في كل مكان ({proAll} مع Spicy)، بالإضافة إلى /spicy في أي مجموعة أو في الخاص.\n\n/more — أدوات مجانية أخرى",
    hi: "✅ Pro अनलॉक हुआ! अब आपको हर जगह {proMore} और कार्ड्स मिलेंगे ({proAll} Spicy सहित), साथ ही किसी भी ग्रुप या DM में /spicy।\n\n/more — और मुफ़्त टूल्स",
  },
  btn_addToGroup: {
    en: "Add me to a group", ru: "Добавить в группу", es: "Añadirme a un grupo",
    pt: "Adicionar a um grupo", id: "Tambahkan ke grup", de: "Zu Gruppe hinzufügen",
    tr: "Gruba ekle", uk: "Додати до групи", fa: "افزودن به گروه",
    ar: "أضفني إلى مجموعة", hi: "ग्रुप में जोड़ें",
  },
  btn_unlockMorePrompts: {
    en: "+{proMore} prompts ⭐", ru: "+{proMore} карточек ⭐", es: "+{proMore} tarjetas ⭐",
    pt: "+{proMore} cartas ⭐", id: "+{proMore} kartu ⭐", de: "+{proMore} Karten ⭐",
    tr: "+{proMore} kart ⭐", uk: "+{proMore} карт ⭐", fa: "+{proMore} کارت ⭐",
    ar: "+{proMore} بطاقة ⭐", hi: "+{proMore} कार्ड्स ⭐",
  },
  app_title: {
    en: "🎉 PartyPack", ru: "🎉 PartyPack", es: "🎉 PartyPack", pt: "🎉 PartyPack",
    id: "🎉 PartyPack", de: "🎉 PartyPack", tr: "🎉 PartyPack", uk: "🎉 PartyPack",
    fa: "🎉 PartyPack", ar: "🎉 PartyPack", hi: "🎉 PartyPack",
  },
  app_loading: {
    en: "Loading…", ru: "Загрузка…", es: "Cargando…", pt: "Carregando…", id: "Memuat…",
    de: "Wird geladen…", tr: "Yükleniyor…", uk: "Завантаження…", fa: "در حال بارگذاری…",
    ar: "جارٍ التحميل…", hi: "लोड हो रहा है…",
  },
  app_moreApps: {
    en: "More apps", ru: "Другие приложения", es: "Más apps", pt: "Mais apps",
    id: "Aplikasi lain", de: "Mehr Apps", tr: "Diğer uygulamalar", uk: "Інші застосунки",
    fa: "برنامه‌های بیشتر", ar: "تطبيقات أخرى", hi: "और ऐप्स",
  },
  app_pick: {
    en: "Pick a category and roll.", ru: "Выбери категорию и брось.",
    es: "Elige una categoría y tira.", pt: "Escolha uma categoria e jogue.",
    id: "Pilih kategori lalu putar.", de: "Wähle eine Kategorie und würfle.",
    tr: "Bir kategori seç ve çevir.", uk: "Обери категорію та крути.",
    fa: "یک دسته انتخاب کن و بچرخان.", ar: "اختر فئة ثم أدر.",
    hi: "एक श्रेणी चुनें और रोल करें।",
  },
  app_roll: {
    en: "🎲 Roll", ru: "🎲 Крутить", es: "🎲 Tirar", pt: "🎲 Jogar", id: "🎲 Putar",
    de: "🎲 Würfeln", tr: "🎲 Çevir", uk: "🎲 Крутити", fa: "🎲 بچرخان",
    ar: "🎲 أدر", hi: "🎲 रोल करें",
  },
  app_freePack: {
    en: "Free pack", ru: "Бесплатный пакет", es: "Paquete gratis", pt: "Pacote grátis",
    id: "Paket gratis", de: "Kostenloses Paket", tr: "Ücretsiz paket",
    uk: "Безкоштовний пакет", fa: "بسته رایگان", ar: "الحزمة المجانية", hi: "मुफ़्त पैक",
  },
  app_proUnlocked: {
    en: "Pro unlocked", ru: "Pro активирован", es: "Pro desbloqueado", pt: "Pro desbloqueado",
    id: "Pro terbuka", de: "Pro freigeschaltet", tr: "Pro açıldı", uk: "Pro відкрито",
    fa: "Pro فعال شد", ar: "تم تفعيل Pro", hi: "Pro अनलॉक हुआ",
  },
  app_shareChat: {
    en: "💬 Share to a chat", ru: "💬 Отправить в чат", es: "💬 Compartir en chat",
    pt: "💬 Enviar no chat", id: "💬 Bagikan ke chat", de: "💬 In Chat teilen",
    tr: "💬 Sohbette paylaş", uk: "💬 Надіслати в чат", fa: "💬 ارسال به گفتگو",
    ar: "💬 مشاركة في محادثة", hi: "💬 चैट में भेजें",
  },
  app_shareStory: {
    en: "📣 Share to story", ru: "📣 В историю", es: "📣 A tu historia", pt: "📣 Nos stories",
    id: "📣 Bagikan ke story", de: "📣 Als Story teilen", tr: "📣 Hikâyede paylaş",
    uk: "📣 В історію", fa: "📣 اشتراک در استوری", ar: "📣 مشاركة في قصة",
    hi: "📣 स्टोरी में साझा करें",
  },
  app_storyText: {
    en: "Truth, Dare, Would You Rather and more — free party games for your group.",
    ru: "Правда, действие, «что бы ты выбрал» и другое — бесплатные игры для вечеринки в твоей группе.",
    es: "Verdad, reto, ¿qué preferirías? y más — juegos de fiesta gratis para tu grupo.",
    pt: "Verdade, desafio, o que você prefere e mais — jogos de festa grátis para o seu grupo.",
    id: "Truth, dare, would-you-rather, dan lainnya — game pesta gratis untuk grupmu.",
    de: "Wahrheit, Pflicht, Was-würdest-du-eher und mehr — kostenlose Partyspiele für deine Gruppe.",
    tr: "Doğruluk, cesaret, ya-sen-olsaydın ve daha fazlası — grubun için ücretsiz parti oyunları.",
    uk: "Правда, дія, «що б ти обрав» і більше — безкоштовні ігри для вечірки у твоїй групі.",
    fa: "حقیقت، جرأت، ترجیح می‌دهی و بیشتر — بازی‌های مهمانی رایگان برای گروه شما.",
    ar: "الحقيقة أو الجرأة، ماذا تفضل والمزيد — ألعاب حفلات مجانية لمجموعتك.",
    hi: "ट्रुथ, डेयर, वुड-यू-रादर और बहुत कुछ — आपके ग्रुप के लिए मुफ़्त पार्टी गेम्स।",
  },
  app_shareFail: {
    en: "Sharing is unavailable right now.", ru: "Поделиться сейчас не получилось.",
    es: "Ahora mismo no se puede compartir.", pt: "Não foi possível compartilhar agora.",
    id: "Berbagi sedang tidak tersedia.", de: "Teilen ist gerade nicht möglich.",
    tr: "Şu anda paylaşılamıyor.", uk: "Поділитися зараз не вдалося.",
    fa: "در حال حاضر اشتراک‌گذاری ممکن نیست.", ar: "المشاركة غير متاحة الآن.",
    hi: "अभी साझा नहीं किया जा सकता।",
  },
  app_errNoInit: {
    en: "Open this app from the bot — tap the menu button.",
    ru: "Откройте это приложение из бота — кнопка меню.",
    es: "Abre esta app desde el bot — toca el botón de menú.",
    pt: "Abra este app pelo bot — toque no botão de menu.",
    id: "Buka aplikasi ini dari bot — ketuk tombol menu.",
    de: "Öffne diese App über den Bot — tippe auf den Menü-Button.",
    tr: "Bu uygulamayı bottan aç — menü düğmesine dokun.",
    uk: "Відкрийте застосунок із бота — кнопка меню.",
    fa: "این برنامه را از داخل ربات باز کنید — دکمه منو.",
    ar: "افتح هذا التطبيق من البوت — زر القائمة.",
    hi: "यह ऐप बॉट से खोलें — मेनू बटन दबाएँ।",
  },
  app_errExpired: {
    en: "This session expired. Close and reopen the app.",
    ru: "Сессия истекла. Закройте и откройте приложение снова.",
    es: "La sesión caducó. Cierra y vuelve a abrir la app.",
    pt: "A sessão expirou. Feche e abra o app de novo.",
    id: "Sesi berakhir. Tutup lalu buka lagi aplikasinya.",
    de: "Sitzung abgelaufen. App schließen und neu öffnen.",
    tr: "Oturum doldu. Uygulamayı kapatıp yeniden aç.",
    uk: "Сесія завершилася. Закрийте й відкрийте застосунок.",
    fa: "نشست منقضی شد. برنامه را ببندید و دوباره باز کنید.",
    ar: "انتهت الجلسة. أغلق التطبيق ثم افتحه من جديد.",
    hi: "सेशन खत्म हो गया। ऐप बंद करके फिर खोलें।",
  },
  app_errBadSig: {
    en: "This link is not valid. Reopen the app from the bot.",
    ru: "Ссылка недействительна. Откройте приложение из бота.",
    es: "Este enlace no es válido. Abre la app desde el bot.",
    pt: "Este link não é válido. Abra o app pelo bot.",
    id: "Tautan ini tidak valid. Buka aplikasi dari bot.",
    de: "Dieser Link ist ungültig. Öffne die App über den Bot.",
    tr: "Bu bağlantı geçersiz. Uygulamayı bottan aç.",
    uk: "Посилання недійсне. Відкрийте застосунок із бота.",
    fa: "این پیوند معتبر نیست. برنامه را از ربات باز کنید.",
    ar: "هذا الرابط غير صالح. افتح التطبيق من البوت.",
    hi: "यह लिंक मान्य नहीं है। ऐप बॉट से खोलें।",
  },
  app_unlockPro: {
    en: "🔓 Unlock Pro", ru: "🔓 Открыть Pro", es: "🔓 Desbloquear Pro", pt: "🔓 Desbloquear Pro",
    id: "🔓 Buka Pro", de: "🔓 Pro freischalten", tr: "🔓 Pro'yu aç", uk: "🔓 Відкрити Pro",
    fa: "🔓 فعال‌سازی Pro", ar: "🔓 تفعيل Pro", hi: "🔓 Pro अनलॉक करें",
  },
  app_proOneTime: {
    en: "One-time {n} ⭐", ru: "Разово {n} ⭐", es: "Pago único {n} ⭐", pt: "Único {n} ⭐",
    id: "Sekali bayar {n} ⭐", de: "Einmalig {n} ⭐", tr: "Tek seferlik {n} ⭐",
    uk: "Разово {n} ⭐", fa: "یک‌باره {n} ⭐", ar: "مرة واحدة {n} ⭐", hi: "एकमुश्त {n} ⭐",
  },
  app_proMonthly: {
    en: "Monthly {n} ⭐/mo", ru: "Ежемесячно {n} ⭐", es: "Mensual {n} ⭐/mes",
    pt: "Mensal {n} ⭐/mês", id: "Bulanan {n} ⭐/bln", de: "Monatlich {n} ⭐",
    tr: "Aylık {n} ⭐/ay", uk: "Щомісяця {n} ⭐", fa: "ماهانه {n} ⭐", ar: "شهريًا {n} ⭐",
    hi: "मासिक {n} ⭐",
  },
  app_payDone: {
    en: "✅ Pro unlocked. Thank you.", ru: "✅ Pro активирован. Спасибо.",
    es: "✅ Pro activado. Gracias.", pt: "✅ Pro ativado. Obrigado.",
    id: "✅ Pro aktif. Terima kasih.", de: "✅ Pro aktiviert. Danke.",
    tr: "✅ Pro açıldı. Teşekkürler.", uk: "✅ Pro активовано. Дякуємо.",
    fa: "✅ Pro فعال شد. سپاسگزاریم.", ar: "✅ تم تفعيل Pro. شكرًا لك.",
    hi: "✅ Pro चालू हो गया। धन्यवाद।",
  },
  app_payCancelled: {
    en: "Payment cancelled.", ru: "Оплата отменена.", es: "Pago cancelado.",
    pt: "Pagamento cancelado.", id: "Pembayaran dibatalkan.", de: "Zahlung abgebrochen.",
    tr: "Ödeme iptal edildi.", uk: "Оплату скасовано.", fa: "پرداخت لغو شد.",
    ar: "أُلغيت عملية الدفع.", hi: "भुगतान रद्द हुआ।",
  },
  app_payFailed: {
    en: "Payment failed. Please try again.", ru: "Оплата не прошла. Попробуйте ещё раз.",
    es: "El pago falló. Inténtalo de nuevo.", pt: "O pagamento falhou. Tente de novo.",
    id: "Pembayaran gagal. Coba lagi.", de: "Zahlung fehlgeschlagen. Bitte erneut versuchen.",
    tr: "Ödeme başarısız. Tekrar dene.", uk: "Оплата не пройшла. Спробуйте ще раз.",
    fa: "پرداخت ناموفق بود. دوباره تلاش کنید.", ar: "فشل الدفع. حاول مرة أخرى.",
    hi: "भुगतान विफल। फिर कोशिश करें।",
  },
};

/** The 11 language codes this bot ships, in table order. */
export const APP_LANGS: Lang[] = [...LANGS];

/** Every `app_*` key, for every language, as a plain object — the Mini App's embedded
 * `APP_I18N` dictionary. English fills any gap so a client lookup can never miss.
 * Both loops are bounded by the static table (11 languages x the app_* key set). */
export function appDict(): Record<string, Record<string, string>> {
  const keys = (Object.keys(TABLE) as Key[]).filter((k) => k.startsWith("app_"));
  const out: Record<string, Record<string, string>> = {};
  for (const l of LANGS) {
    const m: Record<string, string> = {};
    for (const k of keys) m[k] = TABLE[k][l] ?? TABLE[k].en;
    out[l] = m;
  }
  return out;
}
