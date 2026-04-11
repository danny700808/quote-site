/* =========================
   逐日導引版
   ========================= */

const BRAND_NAME = "柚子樂器";
const PRINT_TITLE = "活動企劃｜設備與器材報價單（主案＋活動）";

// ✅ 官網
const OFFICIAL_HOME_URL = "https://www.mingtinghuang.com/";
// ✅ 修改 token（送出後後端回傳、或從 URL 載入）
let EDIT_TOKEN = "";

// Apps Script
const ORDER_API_URL = "https://script.google.com/macros/s/AKfycbwXwMYFPFx8KnyJ43RIpL9gq6VAmU7tPq_JUpbkNX5PUf9MB92GiltUaWONfLw9NxkAYA/exec";

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));
const escapeHtml = (v)=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const fmt = (n)=>"NT$"+Number(n||0).toLocaleString("zh-Hant-TW");

function getSiteBaseUrl_(){
  try{
    const u = new URL(window.location.href);
    u.search = "";
    u.hash = "";
    return u.toString();
  }catch(_){
    return "";
  }
}

function pad2(n){ return String(n).padStart(2,"0"); }
function deepClone(obj){ return JSON.parse(JSON.stringify(obj||{})); }
function normalizeDateStr(d){ if(!d) return ""; return String(d).slice(0,10); }
function compareDate(a,b){ return (a||"").localeCompare(b||""); }
function addDays(dateStr, days){
  const d = new Date(dateStr+"T00:00:00");
  if(isNaN(d)) return dateStr;
  d.setDate(d.getDate()+Number(days||0));
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function todayISO(){
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function applyDateMinConstraints(scope){
  const root = scope || document;
  const min = todayISO();
  root.querySelectorAll('input[type="date"]').forEach(el=>{
    try{ el.min = min; }catch(_){ }
  });
}

function todayStr(){
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
}
function genId(){ return "x" + Math.random().toString(36).slice(2,8) + Date.now().toString(36); }

function svgThumb(label){
  const safe = (label||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
 <defs>
   <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
     <stop offset="0" stop-color="#eef8f3"/>
     <stop offset="1" stop-color="#f7faf8"/>
   </linearGradient>
 </defs>
 <rect width="200" height="200" rx="22" fill="url(#g)"/>
 <circle cx="160" cy="40" r="26" fill="#1e8e6f" opacity="0.12"/>
 <circle cx="40" cy="160" r="36" fill="#156e56" opacity="0.08"/>
 <text x="18" y="108" font-size="18" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#156e56" font-weight="800">${safe}</text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}
function svgCategoryThumb(kind,label){
  const safe = (label||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const map = {
    stage:{glyph:"◫"},
    audio:{glyph:"◉"},
    light:{glyph:"✦"},
    screen:{glyph:"▣"},
    backdrop:{glyph:"▤"},
    power:{glyph:"⚡"},
    outdoor:{glyph:"△"},
    decor:{glyph:"✿"},
    staff:{glyph:"👥"},
    other:{glyph:"＋"}
  };
  const it = map[kind] || {glyph:"◎"};
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <defs>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eff8f3"/>
        <stop offset="1" stop-color="#f8fbf9"/>
      </linearGradient>
    </defs>
    <rect width="320" height="320" rx="28" fill="url(#g2)"/>
    <circle cx="76" cy="88" r="34" fill="#e6f4ed"/>
    <text x="76" y="100" text-anchor="middle" font-size="42" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#177255">${it.glyph}</text>
    <text x="160" y="108" text-anchor="middle" font-size="42" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#173f32" font-weight="1000">${safe}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

function showView(id){
  $$(".view").forEach(v=>v.classList.remove("show"));
  const el = $("#"+id);
  if(el) el.classList.add("show");
}

function setStep(step){
  const boxes = $$("#stepsBar .stepBox");
  boxes.forEach(b=>{
    const n = Number(b.dataset.step||0);
    b.classList.toggle("active", n===step);
    b.classList.toggle("done", n<step);
  });
  const topPrintBtn = $("#btnPrintTop"); if(topPrintBtn) topPrintBtn.style.display = (step>=4) ? "" : "none";
  updateStepBarClickable();
}

function toMin(hh, mm){ return (parseInt(hh,10)||0)*60 + (parseInt(mm,10)||0); }
function fromMin(m){
  m = Math.max(0, Math.min(24*60-10, m));
  const hh = String(Math.floor(m/60)).padStart(2,"0");
  const mm = String(m%60).padStart(2,"0");
  return [hh, mm];
}

/* =========================
   State
   ========================= */
const state = {
  step: 1,
  isMulti: false,
  isExtra: false,
  extraUnits: [],
  planMeta: {},
  globalForm: {},
  units: [],
  currentIndex: 0,
};

/* =========================
   Part2：資料區
   ========================= */
const TW = {
  "台北市":["中正區","大同區","中山區","松山區","大安區","萬華區","信義區","士林區","北投區","內湖區","南港區","文山區"],
  "新北市":["板橋區","新莊區","中和區","永和區","三重區","土城區","新店區","汐止區","淡水區","林口區"],
  "桃園市":["桃園區","中壢區","平鎮區","八德區","龜山區","蘆竹區"],
  "台中市":["西屯區","北屯區","南屯區","中區","東區","西區","南區","北區","豐原區"],
  "台南市":["中西區","東區","南區","北區","永康區","安平區"],
  "高雄市":["三民區","左營區","鼓山區","苓雅區","前鎮區","鳳山區"]
};
const CATEGORIES = [
{ id:"stage", name:"舞台區", desc:"舞台、樓梯、地毯、講台等和舞台本體有關的設備。", hero:"step3_icons/stage.svg", items:[
{ id:"stage-deck", name:"基本舞台", unit:"片", price:1200,
priceTiers:[{min:1,price:1200},{min:20,price:1100},{min:50,price:1000}],
options:{
height:{label:"舞台高度", values:["請選擇","20cm","40cm","60cm","80cm","100cm"]},
color:{label:"舞台顏色", values:["請選擇","黑","灰","紅","藍"]},
carpet:{label:"是否要鋪地毯", values:["請選擇","要","不要"], omitValues:["不要"]},
carpet_color:{label:"地毯顏色", values:["請選擇","黑","灰","紅","藍","綠","米白"], when:{opt:"carpet", is:"要"}}
},
img:svgThumb("基本舞台"),
desc:"活動常用的基本舞台板，可依大小、高度與地毯需求調整。適合典禮、致詞、表演。"},
{ id:"stage-runway", name:"延伸舞台／走道台", unit:"組", price:5800, img:svgThumb("延伸舞台"), desc:"適合婚禮、走秀、頒獎與需要往前延伸視覺焦點的活動。"},
{ id:"stage-step", name:"舞台樓梯", unit:"座", price:900, img:svgThumb("舞台樓梯"), desc:"舞台上下台使用，搭配中高舞台時很常一起選。"},
{ id:"stage-ramp", name:"無障礙斜坡", unit:"座", price:2200, img:svgThumb("斜坡"), desc:"推設備或需要無障礙動線時可一起配置。"},
{ id:"stage-carpet", name:"舞台地毯", unit:"組", price:1800, img:svgThumb("舞台地毯"), desc:"讓舞台看起來更完整，也能搭配主視覺配色。"},
{ id:"stage-skirt", name:"舞台裙邊", unit:"組", price:1500, img:svgThumb("裙邊"), desc:"遮住舞台下方結構，讓整體畫面更整齊。"},
{ id:"stage-podium", name:"講台／司儀台", unit:"座", price:2500, img:svgThumb("講台"), desc:"適合致詞、主持與典禮流程使用。"}
]},
{ id:"audio", name:"音響區", desc:"喇叭、麥克風、混音器與舞台收音相關設備。", hero:"step3_icons/audio.svg", items:[
{ id:"audio-main", name:"基本主喇叭", unit:"組", price:6000, img:svgThumb("主喇叭"), desc:"活動基本擴聲，適合典禮、講座與中小型活動。"},
{ id:"audio-sub", name:"低音喇叭", unit:"顆", price:4500, img:svgThumb("低音喇叭"), desc:"需要更有低頻能量時使用，常見於音樂型活動。"},
{ id:"audio-mixer", name:"混音器", unit:"台", price:3000, img:svgThumb("混音器"), desc:"收音與音量控制的核心設備。"},
{ id:"audio-wireless2", name:"無線手持麥克風", unit:"組", price:2200, img:svgThumb("手持麥"), desc:"主持、互動、交接講話最常用。"},
{ id:"audio-lavalier", name:"無線領夾麥克風", unit:"支", price:1800, img:svgThumb("領夾麥"), desc:"簡報、演講常用，雙手可以保持自由。"},
{ id:"audio-headset", name:"耳掛式麥克風", unit:"支", price:2200, img:svgThumb("耳掛麥"), desc:"需要走動、表演或動作較多時較穩定。"},
{ id:"audio-monitor", name:"舞台監聽喇叭", unit:"顆", price:1800, img:svgThumb("監聽"), desc:"讓主持或表演者能聽到現場與自己的聲音。"}
]},
{ id:"light", name:"燈光區", desc:"基本照明、氣氛燈與表演效果燈都從這裡挑。", hero:"step3_icons/light.svg", items:[
{ id:"light-white", name:"基本舞台白光", unit:"組", price:3600, img:svgThumb("白光"), desc:"先把人照清楚，適合致詞、典禮、講座。"},
{ id:"light-par", name:"LED 染色燈", unit:"盞", price:900, img:svgThumb("染色燈"), desc:"常用於活動主色與背景氛圍營造。"},
{ id:"light-uplight", name:"Uplight 氣氛燈", unit:"盞", price:800, img:svgThumb("Uplight"), desc:"牆面、背板、品牌區域常用的氣氛燈。"},
{ id:"light-moving", name:"Moving Head", unit:"盞", price:2500, img:svgThumb("Moving Head"), desc:"適合表演、開場、高潮橋段使用。"},
{ id:"light-follow", name:"追光燈（含操作）", unit:"組", price:6000, img:svgThumb("追光燈"), desc:"人物走位或頒獎上台時很常需要。"},
{ id:"light-console", name:"燈控台", unit:"套", price:3500, img:svgThumb("燈控台"), desc:"需要做場景切換與節奏控制時使用。"},
{ id:"fx-haze", name:"薄霧機", unit:"台", price:2200, img:svgThumb("薄霧機"), desc:"讓光束更有層次，常和表演燈一起搭配。"}
]},
{ id:"screen", name:"螢幕投影區", desc:"簡報、影片、歌詞或活動畫面顯示都在這裡。", hero:"step3_icons/screen.svg", items:[
{ id:"video-projector", name:"投影機", unit:"台", price:6500, img:svgThumb("投影機"), desc:"會議、典禮、簡報播放的基本選項。"},
{ id:"video-screen", name:"前投布幕", unit:"面", price:1800, img:svgThumb("前投布幕"), desc:"常見投影布幕，適合一般簡報與活動播放。"},
{ id:"video-rearscreen", name:"後投布幕", unit:"面", price:4200, img:svgThumb("後投布幕"), desc:"畫面較乾淨，不容易被人影遮住，但後方要留空間。"},
{ id:"video-tv", name:"電視螢幕", unit:"台", price:4800, img:svgThumb("電視螢幕"), desc:"展場或小型活動很實用。"},
{ id:"video-ledwall", name:"LED 顯示屏", unit:"式", price:28000, img:svgThumb("LED屏"), desc:"亮度高、視覺強，適合大型或高規格活動。"},
{ id:"video-clicker", name:"簡報器", unit:"支", price:600, img:svgThumb("簡報器"), desc:"有簡報需求時常會一起搭配。"}
]},
{ id:"backdrop", name:"背板結構區", desc:"背板、Truss、拍照區與畫面支撐相關項目。", hero:"step3_icons/backdrop.svg", items:[
{ id:"stage-truss", name:"Truss 桁架", unit:"支", price:1800, img:svgThumb("Truss"), desc:"掛燈、掛布條、掛品牌視覺常會用到。"},
{ id:"stage-backdrop", name:"主視覺背板", unit:"組", price:6500, img:svgThumb("主背板"), desc:"常見的活動主背板，適合典禮與品牌活動。"},
{ id:"backdrop-photo", name:"拍照背板", unit:"組", price:5200, img:svgThumb("拍照背板"), desc:"簽到區、拍照區、品牌合照常用。"},
{ id:"stage-drape", name:"布幕／側遮", unit:"組", price:4800, img:svgThumb("布幕"), desc:"讓舞台與側邊視覺更乾淨完整。"},
{ id:"backdrop-pipe", name:"布幕架 / Pipe & Drape", unit:"組", price:5800, img:svgThumb("布幕架"), desc:"可快速形成背景與區隔空間。"},
{ id:"backdrop-banner", name:"橫幅吊掛結構", unit:"組", price:3200, img:svgThumb("吊掛"), desc:"適合掛布條、主題字樣與品牌指示。"}
]},
{ id:"power", name:"電力設備區", desc:"發電、配電、線材與技術控制相關設備。", hero:"step3_icons/power.svg", items:[
{ id:"power-gen-small", name:"小型靜音發電機", unit:"台", price:12000, img:svgThumb("小發電機"), desc:"中小型戶外活動常用的補強電力方案。"},
{ id:"power-gen-mid", name:"中型發電機", unit:"台", price:18000, img:svgThumb("中發電機"), desc:"舞台、音響、燈光需求較多時使用。"},
{ id:"power-gen", name:"大型發電機", unit:"台", price:26000, img:svgThumb("大發電機"), desc:"大型或高規格活動的獨立供電。"},
{ id:"power-dist", name:"配電箱／延長線組", unit:"套", price:1800, img:svgThumb("配電"), desc:"發電或大量設備時幾乎都會一起配置。"},
{ id:"power-cableramp", name:"護線板", unit:"條", price:120, img:svgThumb("護線板"), desc:"保護線材並降低絆倒風險。"},
{ id:"power-comms", name:"對講機", unit:"支", price:600, img:svgThumb("對講機"), desc:"工作人員溝通、控場與現場聯繫使用。"}
]},
{ id:"outdoor", name:"戶外配套區", desc:"帳篷、桌椅、欄杆與現場配套都在這裡。", hero:"step3_icons/outdoor.svg", items:[
{ id:"site-tent", name:"快帳", unit:"頂", price:1800, img:svgThumb("快帳"), desc:"戶外活動最常見的遮陽遮雨設備。"},
{ id:"outdoor-canopy", name:"大型帳篷", unit:"頂", price:6800, img:svgThumb("大型帳篷"), desc:"適合主要活動區、報到區或休息區。"},
{ id:"site-chair", name:"折疊椅", unit:"張", price:30, img:svgThumb("椅子"), desc:"觀眾座位或活動等待區常用。"},
{ id:"site-table", name:"折疊桌", unit:"張", price:150, img:svgThumb("桌子"), desc:"報到、講義、餐點或工作區配置。"},
{ id:"site-queue", name:"欄杆／紅龍", unit:"支", price:120, img:svgThumb("紅龍"), desc:"排隊、入口、動線管理常見配套。"},
{ id:"outdoor-sign", name:"指示牌／立牌", unit:"組", price:1200, img:svgThumb("指示牌"), desc:"協助現場動線與活動資訊引導。"}
]},
{ id:"decor", name:"佈置美化區", desc:"氣球、花藝、拍照區與視覺美化項目。", hero:"step3_icons/decor.svg", items:[
{ id:"decor-balloon", name:"氣球佈置", unit:"組", price:3500, img:svgThumb("氣球"), desc:"適合開幕、慶生、品牌活動與拍照區。"},
{ id:"decor-floral", name:"花藝佈置", unit:"組", price:4200, img:svgThumb("花藝"), desc:"婚禮、典禮、品牌活動常見。"},
{ id:"decor-photozone", name:"拍照區佈置", unit:"組", price:5800, img:svgThumb("拍照區"), desc:"讓現場更有主題感與分享感。"},
{ id:"decor-table", name:"桌面佈置", unit:"組", price:2600, img:svgThumb("桌面佈置"), desc:"適合接待桌、主桌、簽到區。"},
{ id:"decor-brand", name:"品牌主題佈置", unit:"式", price:8800, img:svgThumb("品牌佈置"), desc:"品牌活動、開幕與展場常見。"}
]},
{ id:"staff", name:"人力服務區", desc:"主持、音控、燈控、攝影與現場支援人力。", hero:"step3_icons/staff.svg", items:[
{ id:"staff-host", name:"主持人", unit:"人/場", price:9000, img:svgThumb("主持人"), desc:"主持、串場與流程帶動。"},
{ id:"staff-audio", name:"音控工程師", unit:"人/場", price:6500, img:svgThumb("音控"), desc:"音響設定、彩排與現場控音。"},
{ id:"staff-light", name:"燈控工程師", unit:"人/場", price:6500, img:svgThumb("燈控"), desc:"燈光場景操作與現場配合。"},
{ id:"staff-stage", name:"舞台監督／控場", unit:"人/場", price:7000, img:svgThumb("舞監"), desc:"協調流程、演出與後台節奏。"},
{ id:"staff-photo", name:"活動攝影", unit:"人/場", price:5000, img:svgThumb("攝影"), desc:"平面拍攝與活動紀錄。"},
{ id:"staff-video", name:"活動錄影", unit:"人/場", price:6800, img:svgThumb("錄影"), desc:"動態錄影與後續回看使用。"}
]},
{ id:"other", name:"其他加購區", desc:"客製需求、備用設備與特殊加購放這裡。", hero:"step3_icons/other.svg", items:[
{ id:"other-sparemic", name:"備用麥克風", unit:"支", price:900, img:svgThumb("備用麥"), desc:"避免臨時狀況，常見的保險型加購。"},
{ id:"other-extra-speaker", name:"補強喇叭", unit:"顆", price:2200, img:svgThumb("補強喇叭"), desc:"場地較長或較寬時可加強後方覆蓋。"},
{ id:"other-rehearsal", name:"技術彩排", unit:"式", price:4800, img:svgThumb("技術彩排"), desc:"流程較複雜或演出型活動很建議安排。"},
{ id:"other-rush", name:"急件加班處理", unit:"式", price:3500, img:svgThumb("急件"), desc:"臨時追加或時間緊迫時使用。"},
{ id:"other-custom", name:"其他客製需求", unit:"式", price:0, img:svgThumb("客製"), desc:"有特殊需求時可先加入，後續再人工確認。"}
]}

];

const CATEGORY_NOTES = {
  stage:[
    "先確認舞台大概尺寸與高度，再往下挑選相關項目。",
    "中高舞台通常會一起搭配舞台樓梯。",
    "若要畫面更完整，可一起考慮地毯與裙邊。",
    "多人站台或表演時，舞台深度通常要抓得更足。",
    "婚禮、走秀、頒獎常會一起選延伸舞台或走道台。",
    "如需推車或無障礙動線，可加選斜坡。"
  ],
  audio:[
    "先想清楚這場活動是以講話為主，還是表演為主。",
    "主持常用手持麥，演講常用領夾或耳掛麥。",
    "活動規模越大，主喇叭與補強需求也會跟著增加。",
    "有歌唱、表演或樂手時，通常會一起需要監聽。",
    "混音器是整個收音與輸出的核心。",
    "若流程較複雜，建議一起安排音控人員。"
  ],
  light:[
    "基本白光是先把人照清楚，典禮與講座最常用。",
    "染色燈與 Uplight 比較偏氛圍與品牌色呈現。",
    "若有演出橋段，才會較常用到 Moving Head 或追光。",
    "燈光數量通常會跟舞台大小與背板寬度一起變動。",
    "有主視覺或品牌活動時，可考慮 Logo 投影類型。",
    "想讓光束更有層次時，可再加薄霧機。"
  ],
  screen:[
    "先確認你要播放的是簡報、影片、歌詞還是直播畫面。",
    "一般會議與講座常用投影機加布幕。",
    "若場地較亮，電視或 LED 顯示通常更直觀。",
    "後投布幕畫面乾淨，但後方要留足夠空間。",
    "活動規模越大，越要留意後排是否看得清楚。",
    "有簡報需求時，可一起搭配簡報器。"
  ],
  backdrop:[
    "若要做主視覺、品牌感或拍照區，通常會用到這一區。",
    "Truss 常用來掛燈、掛布條或支撐大型視覺。",
    "若只是讓畫面更整齊，布幕或側遮就很有感。",
    "拍照背板與主舞台背板用途不太一樣，可分開選。",
    "背板寬度通常會跟舞台寬度一起考量。",
    "想區隔空間時，Pipe & Drape 會比硬式背板更彈性。"
  ],
  power:[
    "如果設備數量多，電力與配電通常要一起評估。",
    "戶外活動很常需要發電機或額外配電。",
    "發電機不是越大越好，要看整體設備負載。",
    "延長線、配電箱與護線板常常會一起出現。",
    "走道或觀眾區有線材時，建議加護線板。",
    "流程複雜或區域很多時，可一起準備對講機。"
  ],
  outdoor:[
    "戶外活動最常見的是帳篷、桌椅與動線設備。",
    "報到區、休息區、主活動區常會分別配置帳篷。",
    "若有排隊或入口控管，紅龍與欄杆很好用。",
    "桌椅數量通常會跟預估人數與停留時間有關。",
    "指示牌與立牌能讓現場動線更清楚。",
    "若有日曬或下雨風險，帳篷通常會優先處理。"
  ],
  decor:[
    "這一區主要是讓現場畫面更完整、更有主題感。",
    "開幕、婚禮、慶生與品牌活動很常會用到氣球或花藝。",
    "若現場要拍照分享，拍照區佈置通常很有感。",
    "桌面與接待區的佈置，也會影響整體質感。",
    "若主題較明確，可直接往品牌或主題佈置挑選。",
    "有主視覺時，顏色與背板通常建議一起搭配。"
  ],
  staff:[
    "當流程越多、設備越多時，人力支援就越重要。",
    "主持人適合需要串場、帶氣氛或流程控場的活動。",
    "音控與燈控屬於現場技術人員，可避免流程卡住。",
    "活動攝影適合拍平面紀錄，錄影則適合留存完整畫面。",
    "若有表演或時間點很多，舞台監督會很有幫助。",
    "不確定要不要加人力時，可先選進來後續再微調。"
  ],
  other:[
    "這一區適合放臨時追加、備用或客製型需求。",
    "若擔心現場突發狀況，可考慮備用麥克風。",
    "場地太長太寬時，常會再補強喇叭。",
    "活動流程複雜時，技術彩排通常很值得加進來。",
    "若時間很趕，可先把急件處理選進來。",
    "有特殊需求時，也可以先用客製項目保留。"
  ]
};

const LEVELS = {
  safety: ["① 基礎穩定","② 標準配置","③ 活動專業","④ 演出進階","⑤ 旗艦舞台","⑥ 全盛典藏"],
  ambience:["① 純淨燈色","② 典禮質感","③ 氛圍層次","④ 視覺焦點","⑤ 沉浸舞台","⑥ 全感體驗"],
  upgrade:["① 亮點入門","② 氣氛效果","③ 儀式震撼","④ 演出支援","⑤ 全方位","⑥ 尊榮規格"]
};

const LEVEL_PRICES = {
  safety:  [ 10000, 15000, 20000, 25000, 35000, 50000 ],
  ambience:[ 20000, 25000, 35000, 45000, 60000, 80000 ],
  upgrade: [ 30000, 40000, 50000, 80000, 100000, 150000 ],
};

const PACKS_SAFETY = {
1: [{id:"audio-main",qty:1},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:1}],
2: [{id:"audio-main",qty:1},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:2},{id:"audio-monitor",qty:1},{id:"power-dist",qty:1}],
3: [{id:"audio-main",qty:2},{id:"audio-sub",qty:1},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:2},{id:"audio-monitor",qty:2},{id:"power-dist",qty:1},{id:"staff-audio",qty:1}],
4: [{id:"audio-main",qty:2},{id:"audio-sub",qty:2},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:3},{id:"audio-monitor",qty:3},{id:"power-dist",qty:1},{id:"staff-audio",qty:1}],
5: [{id:"audio-main",qty:3},{id:"audio-sub",qty:3},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:4},{id:"audio-monitor",qty:4},{id:"power-gen",qty:1},{id:"power-dist",qty:2},{id:"staff-audio",qty:1}],
6: [{id:"audio-main",qty:4},{id:"audio-sub",qty:4},{id:"audio-mixer",qty:1},{id:"audio-wireless2",qty:5},{id:"audio-monitor",qty:5},{id:"power-gen",qty:1},{id:"power-dist",qty:3},{id:"staff-audio",qty:1}],
};
const PACKS_AMBIENCE = {
1: [{id:"light-par",qty:4}],
2: [{id:"stage-backdrop",qty:1},{id:"light-par",qty:6},{id:"light-console",qty:1}],
3: [{id:"stage-deck",qty:4},{id:"stage-backdrop",qty:1},{id:"light-par",qty:8},{id:"light-console",qty:1},{id:"staff-light",qty:1}],
4: [{id:"stage-deck",qty:6},{id:"stage-truss",qty:2},{id:"stage-backdrop",qty:1},{id:"light-par",qty:10},{id:"light-moving",qty:4},{id:"light-console",qty:1},{id:"fx-haze",qty:1},{id:"staff-light",qty:1}],
5: [{id:"stage-deck",qty:8},{id:"stage-truss",qty:4},{id:"stage-drape",qty:1},{id:"stage-backdrop",qty:1},{id:"light-par",qty:12},{id:"light-moving",qty:6},{id:"light-console",qty:1},{id:"fx-haze",qty:1},{id:"staff-light",qty:1}],
6: [{id:"stage-deck",qty:10},{id:"stage-truss",qty:6},{id:"stage-drape",qty:1},{id:"stage-backdrop",qty:1},{id:"light-par",qty:16},{id:"light-moving",qty:8},{id:"light-console",qty:1},{id:"fx-haze",qty:2},{id:"staff-light",qty:1}],
};
const PACKS_UPGRADE = {
1: [{id:"light-follow",qty:1}],
2: [{id:"fx-haze",qty:1}],
3: [{id:"video-projector",qty:1},{id:"video-screen",qty:1}],
4: [{id:"audio-drumkit",qty:1},{id:"audio-di",qty:4},{id:"audio-monitor",qty:2}],
5: [{id:"staff-host",qty:1},{id:"staff-stage",qty:1},{id:"staff-audio",qty:1}],
6: [{id:"staff-host",qty:1},{id:"staff-stage",qty:1},{id:"staff-audio",qty:1},{id:"staff-light",qty:1}],
};

const TIER_PHOTOS = {
  safety: Array.from({length:6},(_,i)=>[
    `https://picsum.photos/seed/safety-${i+1}-a/800/600`,
    `https://picsum.photos/seed/safety-${i+1}-b/800/600`
  ]),
  ambience: Array.from({length:6},(_,i)=>[
    `https://picsum.photos/seed/ambience-${i+1}-a/800/600`,
    `https://picsum.photos/seed/ambience-${i+1}-b/800/600`
  ]),
  upgrade: Array.from({length:6},(_,i)=>[
    `https://picsum.photos/seed/upgrade-${i+1}-a/800/600`,
    `https://picsum.photos/seed/upgrade-${i+1}-b/800/600`
  ])
};
/* =========================
   Modal（保留）
   ========================= */
function openModal(title, htmlBody){
  $("#mTitle").textContent = title || "詳情";
  $("#mBody").innerHTML = htmlBody || "—";
  $("#modalMask").style.display="flex";
}
function closeModal(){ $("#modalMask").style.display="none"; }
(function(){
  const mask = document.getElementById("modalMask");
  const btnClose = document.getElementById("mClose");
  function closeSafe(){ try{ closeModal(); }catch(_){ if(mask) mask.style.display="none"; } }
  if(btnClose) btnClose.addEventListener("click", closeSafe);
  if(mask) mask.addEventListener("click", (e)=>{ if(e.target===mask) closeSafe(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape" && mask && mask.style.display==="flex") closeSafe(); });
})();

function buildPhotoHTML(urls){
  const a = (urls && urls[0]) ? urls[0] : "https://picsum.photos/seed/event-fallback/800/600";
  const b = (urls && urls[1]) ? urls[1] : "https://picsum.photos/seed/stage-fallback/800/600";
  return `
    <div class="photoGrid">
      <div class="photoBox">
        <img src="${a}" alt="示意照片 1" loading="lazy">
        <div class="photoCap">示意照片 1（可換成你的照片連結）</div>
      </div>
      <div class="photoBox">
        <img src="${b}" alt="示意照片 2" loading="lazy">
        <div class="photoCap">示意照片 2（可換成你的照片連結）</div>
      </div>
    </div>
  `;
}

function getItemPhotos(catId, itemId){
  const cat = CATEGORIES.find(c=>c.id===catId);
  if(cat && cat.hero){
    return [cat.hero, cat.hero];
  }
  const seedBase = `${catId||"cat"}-${itemId||"item"}`;
  return [
    `https://picsum.photos/seed/${seedBase}-a/800/600`,
    `https://picsum.photos/seed/${seedBase}-b/800/600`
  ];
}

function findItem(itemId){
  for(const c of CATEGORIES){
    const it = (c.items||[]).find(x=>x.id===itemId);
    if(it) return {cat:c,item:it};
  }
  return null;
}

function openItemDetail(itemId){
  const f=findItem(itemId); if(!f) return;
  const photos = getItemPhotos(f.cat.id, f.item.id);
  const desc = ((f.item.desc||"—")+"").replace(/\n/g,"<br>");
  openModal(`商品詳情｜${f.item.name}`, `
    ${buildPhotoHTML(photos)}
    <div class="modalDesc">${desc}</div>
  `);
}

function openTierDetail(tierKey, level){
  const tierLabel = ({safety:"安全", ambience:"氣氛", upgrade:"升級"}[tierKey]) || "套裝";
  const levelName = (LEVELS[tierKey] && LEVELS[tierKey][level-1]) ? LEVELS[tierKey][level-1] : `第${level}級`;
  const price = LEVEL_PRICES[tierKey]?.[level-1];
  const packs = tierKey==="safety" ? PACKS_SAFETY : (tierKey==="ambience" ? PACKS_AMBIENCE : PACKS_UPGRADE);
  const list = packs[level] || [];
  const photos = TIER_PHOTOS[tierKey]?.[level-1];

  const itemsHTML = list.map(p=>{
    const f = findItem(p.id);
    const name = f ? f.item.name : p.id;
    const unit = f ? f.item.unit : "";
    return `<li><b>${name}</b> × ${p.qty}${unit?` ${unit}`:""}</li>`;
  }).join("");

  const usage = (()=>{ // 原本簡述
    if(tierKey==="safety"){
      if(level<=2) return "適合：室內/小型活動、主持/致詞、背景音樂；以穩定清晰為主。";
      if(level<=4) return "適合：中型活動/表演，有基本監聽與工程配置；可應付較複雜流程。";
      return "適合：大型戶外/舞台演出，多監聽與電力配套；更適合人多與需求較高的活動。";
    }
    if(tierKey==="ambience"){
      if(level<=2) return "適合：典禮/活動基礎氛圍，主色染色與基本控制。";
      if(level<=4) return "適合：表演/進退場需要視覺焦點，含移動燈/薄霧等效果提升。";
      return "適合：舞台感更強的活動，視覺層次與整體質感加強。";
    }
    if(level<=2) return "加值：追光或薄霧等單點升級，快速提升舞台感。";
    if(level<=4) return "加值：投影/螢幕或演出支援（鼓組/DI/監聽），適合有表演需求。";
    return "加值：人力/控場/全方位支援，適合大型或流程複雜的活動。";
  })();

  openModal(`套裝詳情｜${tierLabel} ${levelName}`, `
    ${buildPhotoHTML(photos)}
    <div class="packMeta">
      <span class="tag">${tierLabel}</span>
      <span class="tag">等級：${levelName}</span>
      <span class="tag">參考價：${price?fmt(price):"—"}</span>
    </div>
    <div class="subttl">包含內容</div>
    <ul class="packList">${itemsHTML || "<li>—</li>"}</ul>
    <div class="subttl" style="margin-top:10px">說明</div>
    <div class="modalDesc">${usage}</div>
  `);
}

/* ===== 城市/區域：填入指定 select ===== */
function fillCityArea(citySel, areaSel, cityVal, areaVal){
  if(!citySel || !areaSel) return;
  citySel.innerHTML = Object.keys(TW).map(c=>`<option value="${c}">${c}</option>`).join("");
  function fillArea(){
    areaSel.innerHTML = (TW[citySel.value]||[]).map(a=>`<option value="${a}">${a}</option>`).join("");
  }
  citySel.addEventListener("change", ()=>{ fillArea(); });
  fillArea();
  if(cityVal && Object.keys(TW).includes(cityVal)){
    citySel.value = cityVal;
    fillArea();
  }
  if(areaVal && (TW[citySel.value]||[]).includes(areaVal)){
    areaSel.value = areaVal;
  }
}

/* =========================
   Step1：日期 → 生成主案日期清單
   ========================= */
function getMainDates(){
  const ds = normalizeDateStr($("#fDateStart")?.value||"");
  if(!ds) return [];
  const isMulti = !!$("#fIsMultiDay")?.checked;
  if(!isMulti) return [ds];

  const de = normalizeDateStr($("#fDateEnd")?.value||"") || addDays(ds,1);
  const s = new Date(ds+"T00:00:00");
  const e = new Date(de+"T00:00:00");
  const start = new Date(Math.min(s.getTime(), e.getTime()));
  const finish= new Date(Math.max(s.getTime(), e.getTime()));
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end2= new Date(finish.getFullYear(), finish.getMonth(), finish.getDate());

  const out=[];
  while(cur.getTime()<=end2.getTime()){
    out.push(`${cur.getFullYear()}-${pad2(cur.getMonth()+1)}-${pad2(cur.getDate())}`);
    cur.setDate(cur.getDate()+1);
  }
  return out;
}

function ensurePlanMeta(key){
  state.planMeta = state.planMeta || {};
  if(!state.planMeta[key]){
    state.planMeta[key] = { start:"09:00", end:"12:00", s2On:false, s2Start:"18:00", s2End:"21:00" };
  }
  return state.planMeta[key];
}

function makeHMSelectHTML(name, value, isMin){
  const hours = Array.from({length:24}, (_,i)=>pad2(i));
  const mins  = ["00","10","20","30","40","50"];
  const arr = isMin ? mins : hours;
  return `<select data-hm="${name}">
    ${arr.map(v=>`<option value="${v}" ${v===value?"selected":""}>${v}</option>`).join("")}
  </select>`;
}

function fixSession2NotOverlap(container, meta, writeBack=true){
  const get = (n)=>container.querySelector(`select[data-hm="${n}"]`)?.value || "";
  const fEnd = toMin(get("endH"), get("endM"));
  const STEP = 10;

  let s2Start = toMin(get("s2StartH") || "18", get("s2StartM") || "00");
  let s2End   = toMin(get("s2EndH") || "21", get("s2EndM") || "00");

  if(s2Start < fEnd){
    s2Start = fEnd;
    const [hh, mm] = fromMin(s2Start);
    if(writeBack){
      const elH = container.querySelector(`select[data-hm="s2StartH"]`);
      const elM = container.querySelector(`select[data-hm="s2StartM"]`);
      if(elH) elH.value = hh;
      if(elM) elM.value = mm;
    }
  }
  if(s2End <= s2Start){
    s2End = s2Start + STEP;
    const [hh, mm] = fromMin(s2End);
    if(writeBack){
      const elH = container.querySelector(`select[data-hm="s2EndH"]`);
      const elM = container.querySelector(`select[data-hm="s2EndM"]`);
      if(elH) elH.value = hh;
      if(elM) elM.value = mm;
    }
  }

  const s2H = container.querySelector(`select[data-hm="s2StartH"]`)?.value || "18";
  const s2M = container.querySelector(`select[data-hm="s2StartM"]`)?.value || "00";
  const e2H = container.querySelector(`select[data-hm="s2EndH"]`)?.value || "21";
  const e2M = container.querySelector(`select[data-hm="s2EndM"]`)?.value || "00";
  meta.s2Start = `${s2H}:${s2M}`;
  meta.s2End   = `${e2H}:${e2M}`;
}

function renderPlannerRows(containerEl, rows, onChange){
  containerEl.innerHTML = rows.map(r=>{
    const meta = ensurePlanMeta(r.key);
    const [sh, sm]   = (meta.start||"09:00").split(":");
    const [eh, em]   = (meta.end||"12:00").split(":");
    const [s2h,s2m]  = (meta.s2Start||"18:00").split(":");
    const [e2h,e2m]  = (meta.s2End||"21:00").split(":");
    const s2On = !!meta.s2On;

    return `
      <div class="planRow" data-key="${r.key}">
        <div class="planRowTop">
          <div>
            <b>${escapeHtml(r.title)}：${escapeHtml(r.dateText)}</b>
            
          </div>
          
        </div>

        <div class="planTimes">
          <div class="timeRow">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${makeHMSelectHTML("startH", sh||"09", false)}
              ${makeHMSelectHTML("startM", sm||"00", true)}
            </div>
            <div class="sep">～</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${makeHMSelectHTML("endH", eh||"12", false)}
              ${makeHMSelectHTML("endM", em||"00", true)}
            </div>
          </div>

          <div class="planS2">
            <label style="display:flex;align-items:center;gap:10px;font-weight:900;color:var(--muted);cursor:pointer;">
              <input type="checkbox" data-s2="1" ${s2On?"checked":""} style="width:18px;height:18px">
              此活動當天需要第二場次
            </label>

            <div class="s2Times" style="${s2On?"":"display:none"}">
              <div class="timeRow" style="margin-top:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  ${makeHMSelectHTML("s2StartH", s2h||"18", false)}
                  ${makeHMSelectHTML("s2StartM", s2m||"00", true)}
                </div>
                <div class="sep">～</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  ${makeHMSelectHTML("s2EndH", e2h||"21", false)}
                  ${makeHMSelectHTML("s2EndM", e2m||"00", true)}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  containerEl.querySelectorAll(".planRow").forEach(row=>{
    const key = row.dataset.key;
    const meta = ensurePlanMeta(key);

    row.querySelectorAll("select[data-hm]").forEach(sel=>{
      sel.addEventListener("change", ()=>{
        const get = (n)=>row.querySelector(`select[data-hm="${n}"]`)?.value || "";
        meta.start = `${get("startH")}:${get("startM")}`;
        meta.end   = `${get("endH")}:${get("endM")}`;
        if(meta.s2On) fixSession2NotOverlap(row, meta);
        if(typeof onChange==="function") onChange();
      });
    });

    const cb = row.querySelector('input[type="checkbox"][data-s2="1"]');
    if(cb){
      cb.addEventListener("change", ()=>{
        meta.s2On = !!cb.checked;
        const s2Box = row.querySelector(".s2Times");
        if(s2Box) s2Box.style.display = cb.checked ? "" : "none";
        if(cb.checked) fixSession2NotOverlap(row, meta);
        if(typeof onChange==="function") onChange();
      });
    }

    row.querySelectorAll('.s2Times select[data-hm]').forEach(sel=>{
      sel.addEventListener("change", ()=>{
        fixSession2NotOverlap(row, meta, true);
        if(typeof onChange==="function") onChange();
      });
    });
  });
}

/* Step1：主案 inline */
function renderMainInline(){
  const ds = normalizeDateStr($("#fDateStart")?.value||"");
  const wrap = $("#mainInlineWrap");
  const list = $("#mainInlinePlanner");
  if(!wrap || !list) return;

  if(!ds){
    wrap.style.display = "none";
    list.innerHTML = "";
    return;
  }

  const dates = getMainDates();
  wrap.style.display = "block";

  const rows = dates.map((d,i)=>({
    key: `main-${d}`,
    title: `主案第${i+1}天`,
    dateText: d,
    sub: "",
    pill: ($("#fIsMultiDay")?.checked ? "主案連續" : "主案單日")
  }));

  renderPlannerRows(list, rows, ()=>{ if(state.units.length){ renderDayCards(); renderIfEditingMain(); } });
}

/* Step1：活動 inline list */
function renderExtraInline(){
  const box = $("#extraList");
  if(!box) return;

  const list = (state.extraUnits||[]).map(u=>({id:u.id, date:normalizeDateStr(u.date||"")})).filter(x=>!!x.date);
  state.extraUnits = list;

  if(!list.length){
    box.innerHTML = `<div class="note">目前沒有加入活動。</div>`;
    return;
  }

  box.innerHTML = list.map((u, idx)=>`
    <div class="planRow" data-extra="${u.id}">
      <div class="planRowTop">
        <div>
          <b>活動 ${idx+1}：${u.date}</b>
          <div class="note">此筆為獨立活動/地點（可與主案同日）。</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="pill">活動</span>
          <button class="btn danger" type="button" data-del="${u.id}" style="padding:8px 10px">刪除</button>
        </div>
      </div>
      <div class="planTimes" data-slot="${u.id}"></div>
    </div>
  `).join("");

  box.querySelectorAll("button[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = b.dataset.del;
      state.extraUnits = (state.extraUnits||[]).filter(x=>x.id!==id);
      delete state.planMeta[`extra-${id}`];
      renderExtraInline();
      if(state.units.length){ renderDayCards(); }
    });
  });

  list.forEach((u, idx)=>{
    const slot = box.querySelector(`[data-slot="${u.id}"]`);
    if(!slot) return;
    renderPlannerRows(slot, [{
      key: `extra-${u.id}`,
      title: `活動 ${idx+1}`,
      dateText: u.date,
      sub: "",
      pill: "活動"
    }], ()=>{
      if(state.units.length){ renderDayCards(); renderIfEditingExtra(`extra-${u.id}`); }
    });
  });
}

/* =========================
   Step1：表單
   ========================= */
function getGlobalFormFromUI(){
  return {
    name: $("#fName")?.value?.trim() || "",
    phone: $("#fPhone")?.value?.trim() || "",
    email: $("#fEmail")?.value?.trim() || "",
    city: $("#fCity")?.value || "",
    area: $("#fArea")?.value || "",
    addr: $("#fAddr")?.value?.trim() || "",
    bldg: $("#fBldg")?.value?.trim() || "",
    eventType: $("#fEventType")?.value || "",
    crowd: $("#fCrowd")?.value || "",
    indoor: $("#fIndoor")?.value || "",
    truckAccess: $("#fTruckAccess")?.value || "",
    moveFloor: $("#fMoveFloor")?.value || "",
    note: $("#fNote")?.value?.trim() || "",
    dateStart: normalizeDateStr($("#fDateStart")?.value||""),
    dateEnd: normalizeDateStr($("#fDateEnd")?.value||""),
  };
}
function applyGlobalFormToUnit(u){
  u.form = deepClone(state.globalForm || {});
  u.form.dayNote = "";
}

/* =========================
   Step2：建立 units
   ========================= */
function createMainUnit(){
  const dates = getMainDates();
  const ds = dates[0] || "";
  const de = dates[dates.length-1] || ds;
  return {
    uid: "main",
    kind: "main",
    dates,
    startDate: ds,
    endDate: de,
    form: {},
    tiers: { safety:0, ambience:0, upgrade:0 },
    cart: { packs:{}, items:{} },
    itemOpts: {},
    catId: CATEGORIES?.[0]?.id || "stage",
    done: false,
  };
}

function createExtraUnit(extra, idx){
  return {
    uid: `extra-${extra.id}`,
    kind: "extra",
    extraIndex: idx+1,
    date: extra.date,
    form: {},
    tiers: { safety:0, ambience:0, upgrade:0 },
    cart: { packs:{}, items:{} },
    itemOpts: {},
    catId: CATEGORIES?.[0]?.id || "stage",
    done: false,
  };
}

function buildUnitsFromStep1(){
  const ds = normalizeDateStr($("#fDateStart")?.value||"");
  if(!ds){ alert("請先選擇主案 Day1 日期。"); return false; }
  if(ds < todayStr()){ alert("不可以選過去的日期。"); return false; }

  state.globalForm = getGlobalFormFromUI();

  const main = createMainUnit();
  applyGlobalFormToUnit(main);

  const extras = (state.extraUnits||[]).map((x)=>({id:x.id, date:normalizeDateStr(x.date)})).filter(x=>x.date);
  extras.sort((a,b)=>compareDate(a.date,b.date));
  const extraUnits = extras.map((e,i)=>{
    const u = createExtraUnit(e,i);
    applyGlobalFormToUnit(u);
    return u;
  });

  state.units = [main, ...extraUnits];
  state.currentIndex = 0;
  return true;
}

/* =========================
   計價
   ========================= */
function getUnitPrice(item, qty){
  const q = Math.max(1, Number(qty||1));
  const tiers = item?.priceTiers;
  if(Array.isArray(tiers) && tiers.length){
    let price = Number(item.price||0);
    for(const t of tiers){
      const min = Number(t.min||1);
      const p = Number(t.price||0);
      if(q >= min) price = p;
    }
    return price;
  }
  return Number(item?.price||0);
}
function formatTiers(item){
  const tiers = item?.priceTiers;
  if(!Array.isArray(tiers) || !tiers.length) return "";
  const sorted = [...tiers].sort((a,b)=>Number(a.min||1)-Number(b.min||1));
  const parts=[];
  for(let i=0;i<sorted.length;i++){
    const cur=sorted[i];
    const next=sorted[i+1];
    const min=Number(cur.min||1);
    const max = next ? (Number(next.min||1)-1) : null;
    if(max && max>=min) parts.push(`${min}–${max}${item.unit} ${fmt(cur.price)} / ${item.unit}`);
    else parts.push(`${min}${item.unit}以上 ${fmt(cur.price)} / ${item.unit}`);
  }
  return parts.join("；");
}
function getLineSubtotal(item, qty){ return getUnitPrice(item, qty) * Number(qty||0); }
function getItemSubPriceText(item, qty){
  const hasTiers = Array.isArray(item?.priceTiers) && item.priceTiers.length;
  if(!hasTiers) return `${fmt(item.price)} / ${item.unit}`;
  const q = Number(qty||0);
  if(q>0){
    const up = getUnitPrice(item, q);
    const base = Number(item.price||0);
    const tag = up < base ? "（優惠）" : "";
    return `${fmt(up)}${tag} / ${item.unit} <span class="mini">｜${formatTiers(item)}</span>`;
  }
  return `${fmt(item.price)} 起 / ${item.unit} <span class="mini">｜${formatTiers(item)}</span>`;
}

function calcEquipSubtotal(u){
  let sum = 0;
  const packs = u.cart?.packs || {};
  for(const p of Object.values(packs)){
    if(!p) continue;
    sum += Number(p.price||0);
  }
  const items = u.cart?.items || {};
  for(const [id, qty] of Object.entries(items)){
    const f=findItem(id); if(!f) continue;
    sum += getUnitPrice(f.item, qty) * Number(qty||0);
  }
  return sum;
}

function countMainS2Days(mainUnit){
  const dates = mainUnit.dates || [];
  let count = 0;
  for(const d of dates){
    const meta = ensurePlanMeta(`main-${d}`);
    if(meta.s2On) count++;
  }
  return count;
}

function calcMainTotal(mainUnit){
  const B = calcEquipSubtotal(mainUnit);
  const N = Math.max(1, (mainUnit.dates||[]).length);

  let contFee = 0;
  if(N>=2) contFee += Math.round(B*0.50);
  if(N>=3) contFee += Math.round(B*0.30) * (N-2);

  const s2Count = countMainS2Days(mainUnit);
  const s2Fee = Math.round(B*0.30) * s2Count;

  const total = B + contFee + s2Fee;
  return {B, N, contFee, s2Count, s2Fee, total};
}

function calcExtraTotal(extraUnit){
  const B = calcEquipSubtotal(extraUnit);
  const meta = ensurePlanMeta(extraUnit.uid);
  const s2Fee = meta.s2On ? Math.round(B*0.30) : 0;
  return {B, s2Fee, total: B + s2Fee};
}

function calcGrandTotal(){
  const units = state.units || [];
  const main = units[0];
  const mainR = main ? calcMainTotal(main) : {total:0};
  const extras = units.slice(1).map(u=>calcExtraTotal(u));
  const extraSum = extras.reduce((a,x)=>a+Number(x.total||0),0);
  return {
    main: mainR,
    extras,
    total: Number(mainR.total||0) + extraSum
  };
}

/* =========================
   Step2：render day cards（主案只出一張）
   ========================= */
function renderDayCards(){
  const box = $("#dayCards");
  if(!box) return;

  const units = state.units || [];
  const pill = $("#daysCountPill");
  if(pill) pill.textContent = `${units.length} 項`;

  const note = $("#dayListNote");
  if(note){
    note.textContent = "這一頁只顯示各活動的日期、時間、地點與重點摘要。確認無誤後，請從下方進入設備選擇。";
  }

  const COLORS = [
    {bg:'#e8f7ee', border:'#4ca976', text:'#21543b'},
    {bg:'#ffe4ef', border:'#d95c96', text:'#7a1f4a'},
    {bg:'#fff0d8', border:'#d98d2b', text:'#7a4a00'},
    {bg:'#f3e8ff', border:'#8b5cf6', text:'#4b2ea7'}
  ];
  const colorOf = (idx)=>COLORS[(idx-1)%COLORS.length];
  const safe = (v)=>escapeHtml(v == null ? "" : String(v));
  const locText = (f)=>[f.city, f.area, f.addr, f.bldg].filter(Boolean).join(" ");

  const headline = (idx, form)=>{
    const parts = [`活動${idx}`];
    if(form.eventType) parts.push(form.eventType);
    if(form.crowd) parts.push(`預估${form.crowd}`);
    return parts.join('｜');
  };

  const metaLines = (form)=>{
    const rows = [];
    if(form.truckAccess) rows.push(`貨車是否可以直接到達場地：${form.truckAccess}`);
    if(form.moveFloor) rows.push(`搬運方式／樓層：${form.moveFloor}`);
    if(form.indoor) rows.push(`場地類型：${form.indoor}`);
    return rows;
  };

  const scheduleLines = (u)=>{
    const dates = (u.dates && u.dates.length) ? u.dates : [u.date];
    const form = u.form || {};
    const location = locText(form) || '地點未填寫';
    return dates.map((d, i)=>{
      const key = u.kind === "main" ? `main-${d}` : `${u.uid}-${d}`;
      const meta = ensurePlanMeta(key);
      const dayTitle = dates.length > 1 ? `第${i+1}天｜${d}` : `活動日期：${d}`;
      const second = meta.s2On
        ? `第二場：${meta.s2Start || "—"}～${meta.s2End || "—"}`
        : `第二場：無`;
      return `
        <div style="display:grid;gap:4px;padding:${dates.length > 1 ? '8px 0 0' : '0'};${dates.length > 1 && i > 0 ? 'border-top:1px dashed rgba(0,0,0,.12);margin-top:8px;' : ''}">
          <div style="font-weight:900;color:#1f2937">${safe(dayTitle)}</div>
          <div class="mini">${safe(`地點：${location}`)}</div>
          <div class="mini">${safe(`第一場：${meta.start || "—"}～${meta.end || "—"}`)}</div>
          <div class="mini">${safe(second)}</div>
        </div>
      `;
    }).join("");
  };

  const cardsHTML = units.map((u, i)=>{
    const idx = i + 1;
    const color = colorOf(idx);
    const form = u.form || {};
    const lines = metaLines(form).map(x=>`<div class="mini">${safe(x)}</div>`).join("");
    return `
      <div class="dayCard" data-idx="${i}" style="background:${color.bg};border:2px solid ${color.border};box-shadow:0 6px 18px rgba(0,0,0,.05)">
        <div style="display:grid;gap:8px">
          <div style="font-weight:900;font-size:16px;color:${color.text}">${safe(headline(idx, form))}</div>
          <div style="display:grid;gap:4px">${scheduleLines(u)}</div>
          ${lines ? `<div style="border-top:1px dashed ${color.border};padding-top:8px;display:grid;gap:4px">${lines}</div>` : ''}
        </div>
      </div>
    `;
  });

  box.innerHTML = cardsHTML.join("");
}
  /* =========================
   Step3：編輯（主案/活動）
   ========================= */
function getCurUnit(){ return state.units[state.currentIndex]; }

function fillSelectOptions(){
  return;
}
function getStep3UnitLabelByIndex(idx){
  return `活動${Number(idx||0)+1}`;
}

function getUnitColors(idx){
  const COLORS = [
    {bg:'#e8f7ee', border:'#4ca976', text:'#21543b'},
    {bg:'#ffe4ef', border:'#d95c96', text:'#7a1f4a'},
    {bg:'#fff0d8', border:'#d98d2b', text:'#7a4a00'},
    {bg:'#f3e8ff', border:'#8b5cf6', text:'#4b2ea7'},
    {bg:'#e0f2fe', border:'#0284c7', text:'#0c4a6e'},
    {bg:'#fef3c7', border:'#d97706', text:'#78350f'}
  ];
  return COLORS[(Number(idx||0)) % COLORS.length];
}

function renderEquipUnitBar(){
  const box = $("#equipUnitBar");
  if(!box) return;
  const units = state.units || [];
  if(!units.length){ box.innerHTML = ""; return; }

  box.innerHTML = units.map((u, idx)=>{
    const color = getUnitColors(idx);
    const active = idx===state.currentIndex;
    const label = getStep3UnitLabelByIndex(idx);
    const status = active ? "目前填寫中" : (u.done ? "已完成" : "待填寫");
    return `
      <button type="button" class="equipUnitBtn ${active?'isCurrent':''} ${u.done?'isDone':''}" data-equip-idx="${idx}"
        style="background:${color.bg};border-color:${color.border};color:${color.text}">
        <span>${label}</span>
        <span class="sub">${status}</span>
      </button>
    `;
  }).join("");

  box.querySelectorAll('[data-equip-idx]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.getAttribute('data-equip-idx')||0);
      openUnit(idx);
    });
  });
}

function fillUnitFormUI(u){
  const idx = Number(state.currentIndex||0);
  const label = getStep3UnitLabelByIndex(idx);
  const dateText = (u && u.kind==='main')
    ? (((u.dates||[]).length>=2) ? `${u.startDate} ～ ${u.endDate}` : (u.startDate||''))
    : (u?.date || u?.startDate || '');
  const title = dateText ? `3) 選設備｜${label}｜${dateText}` : `3) 選設備｜${label}`;
  const titleEl = $("#dayEditTitle");
  if(titleEl) titleEl.textContent = title;
  renderEquipUnitBar();
  renderStep3FlowButton();
}
function fixDaySession2(writeBack=true){
  const u = getCurUnit(); if(!u) return;
  const meta = ensurePlanMeta(u.uid);
  const endH = $("#dEndH"), endM = $("#dEndM"), s2H = $("#d2StartH"), s2M = $("#d2StartM"), e2H = $("#d2EndH"), e2M = $("#d2EndM");
  if(!endH || !endM || !s2H || !s2M || !e2H || !e2M) return;
  const fEnd = toMin(endH.value, endM.value);
  const STEP=10;

  let s2Start = toMin(s2H.value, s2M.value);
  let s2End   = toMin(e2H.value, e2M.value);

  if(s2Start < fEnd){
    s2Start = fEnd;
    const [hh,mm]=fromMin(s2Start);
    if(writeBack){ s2H.value=hh; s2M.value=mm; }
  }
  if(s2End <= s2Start){
    s2End = s2Start + STEP;
    const [hh,mm]=fromMin(s2End);
    if(writeBack){ e2H.value=hh; e2M.value=mm; }
  }

  meta.s2Start = `${s2H.value}:${s2M.value}`;
  meta.s2End   = `${e2H.value}:${e2M.value}`;
}
function getItemOpts(u, itemId){
  u.itemOpts = u.itemOpts || {};
  return u.itemOpts[itemId] ? u.itemOpts[itemId] : {};
}
function isOptVisible(def, opts){
  if(!def) return true;
  const w = def.when;
  if(w && w.opt) return String(opts?.[w.opt] ?? "") === String(w.is ?? "");
  return true;
}
function normalizeOptValue(def, value){
  const v = (value==null) ? "" : String(value);
  if(v==="請選擇") return "";
  return v;
}
function cleanupHiddenOpts(u, itemId){
  const f=findItem(itemId); if(!f) return;
  const item=f.item;
  if(!item?.options) return;
  const opts = getItemOpts(u, itemId) || {};
  let changed=false;
  for(const [k,def] of Object.entries(item.options)){
    if(opts[k]==null) continue;
    if(!isOptVisible(def, opts)){
      delete opts[k];
      changed=true;
    }
  }
  if(changed){
    u.itemOpts[itemId]=opts;
    if(Object.keys(opts).length===0) delete u.itemOpts[itemId];
  }
}
function setItemOpt(u, itemId, key, value){
  const f=findItem(itemId);
  const def = f?.item?.options?.[key];
  const v = normalizeOptValue(def, value);
  u.itemOpts = u.itemOpts || {};
  if(!u.itemOpts[itemId]) u.itemOpts[itemId] = {};
  if(v===""){
    delete u.itemOpts[itemId][key];
    if(Object.keys(u.itemOpts[itemId]).length===0) delete u.itemOpts[itemId];
  }else{
    u.itemOpts[itemId][key] = v;
  }
  cleanupHiddenOpts(u, itemId);
}
function clearItemOpts(u, itemId){
  u.itemOpts = u.itemOpts || {};
  if(u.itemOpts[itemId]) delete u.itemOpts[itemId];
}
function formatOptText(u, itemId){
  const f=findItem(itemId); if(!f) return "";
  const item=f.item;
  const opts=getItemOpts(u, itemId) || {};
  if(!item?.options) return "";
  const parts=[];
  for(const [k,def] of Object.entries(item.options)){
    if(!isOptVisible(def, opts)) continue;
    const v = opts[k];
    if(v==null || v==="") continue;
    if(def && Array.isArray(def.omitValues) && def.omitValues.includes(String(v))) continue;
    parts.push(`${def.label||k}：${v}`);
  }
  return parts.length ? `（${parts.join("，")}）` : "";
}
function buildOptionsHTML(u, item){
  if(!item?.options) return "";
  const optsState = getItemOpts(u, item.id) || {};
  const rows = Object.entries(item.options).map(([k,def])=>{
    if(!isOptVisible(def, optsState)) return "";
    const values = Array.isArray(def.values) ? def.values : [];
    const curRaw = (optsState[k] != null) ? String(optsState[k]) : "";
    const cur = normalizeOptValue(def, curRaw);
    const optionsHTML = values.map(v=>{
      const vv = String(v);
      const valueAttr = (vv==="請選擇") ? "" : vv;
      const selected = (valueAttr === cur) || (cur==="" && valueAttr==="");
      return `<option value="${escapeHtml(valueAttr)}" ${selected?"selected":""}>${escapeHtml(vv)}</option>`;
    }).join("");
    return `
      <div class="optrow">
        <div class="optlabel">${escapeHtml(def.label||k)}</div>
        <select class="optselect" data-act="opt" data-id="${item.id}" data-opt="${k}">
          ${optionsHTML}
        </select>
      </div>
    `;
  }).join("");
  return rows.trim() ? `<div class="optbox">${rows}</div>` : "";
}

/* =========================
   設備選擇（沿用）
   ========================= */
function setQty(u, itemId, qty){
  u.cart = u.cart || {packs:{}, items:{}};
  u.cart.items = u.cart.items || {};
  u.itemOpts = u.itemOpts || {};
  if(qty<=0){
    delete u.cart.items[itemId];
    clearItemOpts(u, itemId);
  }else{
    u.cart.items[itemId]=qty;
  }
  renderEquipmentUI();
  renderUnitTotalsAndCart();
  renderDayCards();
}

function adjustQty(itemId, delta){
  const u = getCurUnit();
  if(!u) return;
  const cur = Number(u.cart?.items?.[itemId] || 0);
  setQty(u, itemId, Math.max(0, cur + Number(delta||0)));
}

function applyPackLevel(u, tierKey, level){
  const packs = tierKey==="safety" ? PACKS_SAFETY : (tierKey==="ambience" ? PACKS_AMBIENCE : PACKS_UPGRADE);
  const list = (packs && packs[level]) ? packs[level] : [];
  if(!level || !list.length){ alert("此等級尚未設定套裝內容。"); return; }

  u.tiers = u.tiers || {safety:0, ambience:0, upgrade:0};
  u.tiers[tierKey] = level;

  const packLabel = tierKey==="safety" ? "安全等級" : (tierKey==="ambience" ? "氣氛等級" : "升級等級");
  const name = (LEVELS[tierKey]?.[level-1]) || `第${level}級`;
  const price = (LEVEL_PRICES[tierKey]?.[level-1]) || 0;

  u.cart = u.cart || {packs:{}, items:{}};
  u.cart.packs = u.cart.packs || {};
  u.cart.packs[tierKey] = { tierKey, label: packLabel, level, name, price, items: list };

  renderEquipmentUI();
  renderUnitTotalsAndCart();
  renderDayCards();
}

function removePack(u, tierKey){
  if(u.cart?.packs) delete u.cart.packs[tierKey];
  u.tiers = u.tiers || {safety:0, ambience:0, upgrade:0};
  u.tiers[tierKey]=0;
  renderEquipmentUI();
  renderUnitTotalsAndCart();
  renderDayCards();
}

function renderTierPills(u){
  return;
}

function renderTierButtons(u){
  const mk = (tierKey, containerSel) => {
    const el = $(containerSel);
    if(!el) return;
    el.innerHTML = LEVELS[tierKey].map((name, idx)=>{
      const n = idx+1;
      const on = (u.tiers?.[tierKey]===n) ? "active" : "";
      const price = LEVEL_PRICES[tierKey]?.[idx];
      return `
        <div class="levelBtn ${on}" data-tier="${tierKey}" data-level="${n}">
          <div class="levelText">
            <div class="levelTopRow">
              <span class="levelName">${name}</span>
              <span class="levelPrice">${price?fmt(price):"—"}</span>
            </div>
            <div class="levelActions">
              <button type="button" class="miniBtn primaryMini" data-act="apply" data-tier="${tierKey}" data-level="${n}">加入報價</button>
              <button type="button" class="miniBtn" data-act="detail" data-tier="${tierKey}" data-level="${n}">詳情</button>
            </div>
          </div>
          <div class="levelMedia">
            <img src="${(TIER_PHOTOS[tierKey]?.[idx]?.[0]) || 'https://picsum.photos/seed/stage-fallback/800/600'}" alt="示意照片" loading="lazy">
          </div>
        </div>
      `;
    }).join("");

    el.querySelectorAll(".levelBtn").forEach(box=>{
      box.addEventListener("click", (e)=>{
        if(e.target && e.target.closest(".miniBtn")) return;
        const tier = box.dataset.tier;
        const level = Number(box.dataset.level);
        u.tiers[tier]=level;
        renderTierPills(u);
        renderTierButtons(u);
      });
    });

    el.querySelectorAll(".miniBtn").forEach(b=>{
      b.addEventListener("click", (e)=>{
        e.stopPropagation();
        const act = b.dataset.act || "";
        const tier = b.dataset.tier;
        const level = Number(b.dataset.level);
        if(act==="apply"){ applyPackLevel(u, tier, level); return; }
        openTierDetail(tier, level);
      });
    });
  };

  mk("safety","#levelsSafety");
  mk("ambience","#levelsAmbience");
  mk("upgrade","#levelsUpgrade");
}

function getCatSelectedCount(u, catId){
  const cat = CATEGORIES.find(c=>c.id===catId);
  if(!cat) return 0;
  return (cat.items||[]).reduce((sum,it)=>sum + (Number(u.cart?.items?.[it.id]||0)>0 ? 1 : 0), 0);
}

function getCategoryIconSVG(catId){
  const map = {
    stage:['M4 8h16v10H4z M8 6V4m8 2V4 M7 18v2m10-2v2','舞台'],
    audio:['M5 8a5 5 0 1 0 0 8a5 5 0 0 0 0-8zm0 3a2 2 0 1 1 0 4a2 2 0 0 1 0-4M15 7h4v10h-4','音響'],
    light:['M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z','燈光'],
    screen:['M5 5h14v10H5z M9 19h6','螢幕'],
    backdrop:['M6 5h12v14H6z M8 8h8 M8 11h8 M8 14h8','背板'],
    power:['M13 2L6 13h5l-1 9l7-11h-5l1-9z','電力'],
    outdoor:['M12 4l7 13H5L12 4z','戶外'],
    decor:['M12 5l1.5 3.5L17 10l-3.5 1.5L12 15l-1.5-3.5L7 10l3.5-1.5L12 5z','佈置'],
    staff:['M9 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6zm6 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M4 19a5 5 0 0 1 10 0 M10 19a5 5 0 0 1 10 0','人力'],
    other:['M12 5v14 M5 12h14','其他']
  };
  const [path] = map[catId] || map.other;
  return `<svg class="catSvg" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderTabs(u){
  if(!CATEGORIES.find(c=>c.id===u.catId)) u.catId = CATEGORIES[0].id;
  if(typeof u.catFocus !== "boolean") u.catFocus = false;
  const el = $("#tabs");
  const overview = $("#equipOverview");
  const focusWrap = $("#equipFocusWrap");
  const activeCat = CATEGORIES.find(c=>c.id===u.catId) || CATEGORIES[0];
  if(overview) overview.style.display = u.catFocus ? "none" : "block";
  if(focusWrap) focusWrap.style.display = u.catFocus ? "block" : "none";
  if(!el) return;

  el.innerHTML = CATEGORIES.map((c)=>{
    const selectedCount = getCatSelectedCount(u, c.id);
    const isDone = !!(u.completedCats && u.completedCats[c.id]);
    return `
      <button class="tab ${c.id===u.catId?"active":""}" data-cat="${c.id}" type="button">
        <div class="catCard">
          <div class="catPhoto">
            <div class="catPhotoInner">
              ${getCategoryIconSVG(c.id)}
              <div class="catPhotoLabel">${escapeHtml(c.name)}</div>
            </div>
          </div>
          <div class="catBody">
            <div class="catMetaRow">
              <span class="catCount">${isDone ? "已完成" : (selectedCount>0 ? `已選 ${selectedCount} 項` : `共 ${(c.items||[]).length} 項`)}</span>
              <span class="catEnter">點此進入</span>
            </div>
          </div>
        </div>
      </button>`;
  }).join("");

  el.querySelectorAll(".tab").forEach((b)=>b.addEventListener("click", ()=>{
    u.catId = b.dataset.cat;
    u.catFocus = true;
    renderTabs(u);
    renderItems(u);
    window.scrollTo({top:0, behavior:'smooth'});
  }));
}

function backToEquipOverview(){
  const u = getCurUnit(); if(!u) return;
  u.catFocus = false;
  renderTabs(u);
  renderItems(u);
  window.scrollTo({top:0, behavior:'smooth'});
}

function goToNextEquipCategory(){
  const u = getCurUnit(); if(!u) return;
  if(!u.completedCats) u.completedCats = {};
  u.completedCats[u.catId] = true;
  const idx = Math.max(0, CATEGORIES.findIndex(c=>c.id===u.catId));
  if(idx < CATEGORIES.length - 1){
    u.catId = CATEGORIES[idx + 1].id;
    u.catFocus = true;
  }else{
    u.catFocus = false;
  }
  renderTabs(u);
  renderItems(u);
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderItems(u){
  const cat = CATEGORIES.find(c=>c.id===u.catId) || CATEGORIES[0];
  const el = $("#items");
  const titleEl = $("#equipCatTitle");
  const notesEl = $("#equipCatNotes");
  const nextBtn = $("#btnNextCategory");
  const overview = $("#equipOverview");
  const focusWrap = $("#equipFocusWrap");
  if(titleEl) titleEl.textContent = cat?.name || "設備區";
  if(notesEl){
    const notes = CATEGORY_NOTES[cat.id] || [cat.desc || "請依照需求挑選這一區相關設備。"];
    notesEl.innerHTML = notes.map(n=>`<li>${escapeHtml(n)}</li>`).join("");
  }
  if(nextBtn){
    const idx = Math.max(0, CATEGORIES.findIndex(c=>c.id===cat.id));
    nextBtn.textContent = idx < CATEGORIES.length - 1
      ? `完成此區塊，前往${CATEGORIES[idx + 1].name}`
      : "完成此區塊，返回所有區塊";
  }
  if(overview) overview.style.display = u.catFocus ? "none" : "block";
  if(focusWrap) focusWrap.style.display = u.catFocus ? "block" : "none";
  if(!el) return;
  const rows = (cat?.items||[]);
  el.innerHTML = rows.length ? rows.map(it=>{
    const qty = Number(u.cart?.items?.[it.id]||0);
    return `
      <div class="equipItemCard">
        <img class="equipItemThumb" src="${it.img || svgThumb(it.name)}" alt="${escapeHtml(it.name)}" loading="lazy" onerror="this.onerror=null;this.src='${svgThumb("設備")}';">
        <div class="equipItemMeta">
          <div class="equipItemName">${escapeHtml(it.name)}</div>
          <div class="equipItemDesc">${escapeHtml(it.desc||"")}</div>
          <div class="equipItemRow2">
            <button class="linkbtn js-item-detail" type="button" data-itemid="${it.id}">查看詳情</button>
          </div>
        </div>
        <div class="equipItemPrice">
          <div>${fmt(getUnitPrice(it, qty||1))}</div>
          <div class="sub">／${escapeHtml(it.unit||'項')}</div>
          <div class="qty" style="margin-top:10px">
            <button class="qbtn js-qbtn" type="button" data-itemid="${it.id}" data-delta="-1">－</button>
            <div class="qval">${qty}</div>
            <button class="qbtn js-qbtn" type="button" data-itemid="${it.id}" data-delta="1">＋</button>
          </div>
        </div>
      </div>`;
  }).join("") : `<div class="note">這一區目前沒有可選項目。</div>`;

  el.querySelectorAll('.js-item-detail').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      openItemDetail(btn.dataset.itemid || '');
    });
  });
  el.querySelectorAll('.js-qbtn').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      adjustQty(btn.dataset.itemid || '', Number(btn.dataset.delta || 0));
    });
  });
}


function groupCart(u){
  const groups=new Map();
  const items = u.cart?.items || {};
  for(const [id,qty] of Object.entries(items)){
    const f=findItem(id); if(!f) continue;
    const key=f.cat.name;
    if(!groups.has(key)) groups.set(key, []);
    groups.get(key).push({item:f.item, qty});
  }
  return groups;
}

function renderCart(u){
  const el=$("#cart");
  const groups=groupCart(u);
  const parts=[];

  if(u.cart?.packs){
    const order = [["safety","安全等級"],["ambience","氣氛等級"],["upgrade","升級等級"]];
    for(const [tierKey, title] of order){
      const pack = u.cart.packs[tierKey];
      if(!pack) continue;
      const lv = Number(pack.level||0);
      const packName = `${title}｜${pack.name || ((LEVELS[tierKey]?.[lv-1]) || `第${lv}級`)}`;
      const price = Number(pack.price||0);
      parts.push(`
        <div class="group">
          <div class="gh"><span>${title}（套裝）</span><span class="subttl">已選 <b>1</b> 項</span></div>
          <div class="gb">
            <div class="cartRow">
              <div class="cartRowMain">
                <div class="cartRowName">${escapeHtml(packName)}</div>
                <div class="cartRowMeta">套裝價格</div>
              </div>
              <div class="cartRowPrice">${fmt(price)}</div>
              <div class="cartRowQty"><div class="qty"><div class="qval">1</div></div></div>
              <button class="xbtn cartDelBtn" data-act="delpack" data-tier="${tierKey}" title="刪除套裝">✕</button>
            </div>
          </div>
        </div>
      `);
    }
  }

  for(const [gname, rows] of groups.entries()){
    parts.push(`
      <div class="group">
        <div class="gh"><span>${escapeHtml(gname)}</span><span class="subttl">已選 <b>${rows.length}</b> 項</span></div>
        <div class="gb">
          ${rows.map(({item,qty})=>{
            const up=getUnitPrice(item, qty);
            const line=up*qty;
            const optText = formatOptText(u, item.id);
            return `
              <div class="cartRow">
                <div class="cartRowMain">
                  <div class="cartRowName">${escapeHtml(item.name)}${escapeHtml(optText)}</div>
                  <div class="cartRowMeta">${fmt(up)} / ${escapeHtml(item.unit||"")}</div>
                </div>
                <div class="cartRowPrice">${fmt(line)}</div>
                <div class="cartRowQty">
                  <div class="qty">
                    <button class="qbtn" data-act="dec" data-id="${item.id}" type="button">-</button>
                    <div class="qval">${qty}</div>
                    <button class="qbtn" data-act="inc" data-id="${item.id}" type="button">+</button>
                  </div>
                </div>
                <button class="xbtn cartDelBtn" data-act="del" data-id="${item.id}" title="刪除" type="button">✕</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `);
  }

  el.innerHTML = parts.join("") || `<div class="note">尚未選擇任何設備。</div>`;

  el.querySelectorAll("button").forEach(b=>{
    const act=b.dataset.act, id=b.dataset.id;
    const u = getCurUnit();
    if(!u) return;
    if(act==="inc") b.addEventListener("click", ()=>setQty(u, id, (u.cart.items[id]||0)+1));
    if(act==="dec") b.addEventListener("click", ()=>setQty(u, id, Math.max(0,(u.cart.items[id]||0)-1)));
    if(act==="del") b.addEventListener("click", ()=>setQty(u, id, 0));
    if(act==="delpack") b.addEventListener("click", ()=>removePack(u, b.dataset.tier));
  });
}

function renderEquipmentUI(){
  const u = getCurUnit(); if(!u) return;
  if(!CATEGORIES.find(c=>c.id===u.catId)) u.catId = CATEGORIES[0].id;
  if(typeof u.catFocus !== "boolean") u.catFocus = false;
  if(!u.completedCats) u.completedCats = {};
  renderTierPills(u);
  renderTierButtons(u);
  renderTabs(u);
  renderItems(u);
}

function renderUnitTotalsAndCart(){
  const u = getCurUnit(); if(!u) return;

  const B = calcEquipSubtotal(u);
  $("#dayEquipSubtotal").textContent = fmt(B);

  if(u.kind==="main"){
    const r = calcMainTotal(u);
    $("#dayContinuousRow").style.display = (r.N>=2) ? "flex" : "none";
    $("#dayContinuousFee").textContent = fmt(r.contFee);

    $("#daySession2Row").style.display = (r.s2Count>0) ? "flex" : "none";
    $("#daySession2Label").textContent = `第二場加價（天數×B×30%）`;
    $("#daySession2Fee").textContent = fmt(r.s2Fee);

    $("#dayTotal").textContent = fmt(r.total);
    $("#dayTotalPill").textContent = fmt(r.total);
  }else{
    const meta = ensurePlanMeta(u.uid);
    const s2Fee = meta.s2On ? Math.round(B*0.30) : 0;

    $("#dayContinuousRow").style.display = "none";
    $("#daySession2Row").style.display = meta.s2On ? "flex" : "none";
    $("#daySession2Label").textContent = `第二場加價（B×30%）`;
    $("#daySession2Fee").textContent = fmt(s2Fee);

    $("#dayTotal").textContent = fmt(B + s2Fee);
    $("#dayTotalPill").textContent = fmt(B + s2Fee);
  }

  renderCart(u);
  updateQuickNavBar();
}

/* Copy equipment */
function copyEquip(fromIdx, toIdx){
  const units = state.units || [];
  const from = units[fromIdx];
  const to = units[toIdx];
  if(!from || !to) return;

  to.tiers = deepClone(from.tiers||{});
  to.cart  = deepClone(from.cart||{packs:{}, items:{}});
  to.itemOpts = deepClone(from.itemOpts||{});
  to.catId = from.catId || to.catId;
}

/* Step3：open unit */
function getNextTodoIndex(fromIdx){
  const units = state.units || [];
  if(!units.length) return -1;
  const cur = Number(fromIdx||0);
  // 先找後面第一個未完成
  for(let i=cur+1;i<units.length;i++){
    if(!units[i].done) return i;
  }
  // 再找前面第一個未完成
  for(let i=0;i<units.length;i++){
    if(!units[i].done) return i;
  }
  return -1;
}

function isAnyEquipChosen(u){
  if(!u || !u.cart) return false;
  const packs = u.cart.packs || {};
  const items = u.cart.items || {};
  return Object.keys(packs).length>0 || Object.values(items).some(q=>Number(q||0)>0);
}

function updateQuickNavBar(){
  renderStep3FlowButton();
  renderEquipUnitBar();
}
function openUnit(idx){
  idx = Math.max(0, Math.min((state.units||[]).length-1, Number(idx||0)));
  state.currentIndex = idx;

  setStep(3);
  showView("viewDayEdit");

  fillSelectOptions();
  const curUnitForOpen = getCurUnit();
  if(curUnitForOpen){ curUnitForOpen.catFocus = false; if(!curUnitForOpen.completedCats) curUnitForOpen.completedCats = {}; }
  fillUnitFormUI(getCurUnit());
  renderEquipmentUI();
  renderUnitTotalsAndCart();
  renderEquipUnitBar();
  renderStep3FlowButton();
  window.scrollTo({top:0, behavior:'smooth'});
}
function renderIfEditingMain(){
  const u = getCurUnit();
  if(u && u.kind==="main"){
    renderUnitTotalsAndCart();
  }
}
function renderIfEditingExtra(uid){
  const u = getCurUnit();
  if(u && u.kind==="extra" && u.uid===uid){
    renderUnitTotalsAndCart();
  }
}

/* 完成後彈窗（保留） */
function openAfterDoneChoice(){
  renderStep3FlowButton();
  renderEquipUnitBar();
}
function markDone(){
  const u = getCurUnit(); if(!u) return;
  u.done = true;
  renderDayCards();
  renderStep3FlowButton();
  renderEquipUnitBar();
}
function renderQuote(){
  const root = $("#quoteOverview");
  const warn = $("#quoteWarning");
  if(!root) return;
  if(warn) warn.innerHTML = "";

  const units = state.units || [];
  if(!units.length){
    root.innerHTML = `<div class="note">尚未建立任何活動。</div>`;
    $("#quoteGrandTotal") && ($("#quoteGrandTotal").textContent = fmt(0));
    return;
  }

  function getQuotePalette(idx){
    const palettes = [
      {header:'#dff3e7', accent:'#2f8f7b', text:'#184c37', border:'#b7e3ca', subtotal:'#f2fbf6'},
      {header:'#ffe1eb', accent:'#d95c96', text:'#7d234d', border:'#f5bfd4', subtotal:'#fff5f8'},
      {header:'#fff0d8', accent:'#d98d2b', text:'#7a4a00', border:'#f6d7a2', subtotal:'#fff8ec'},
      {header:'#efe6ff', accent:'#8b5cf6', text:'#4b2ea7', border:'#d7c5ff', subtotal:'#f8f4ff'}
    ];
    return palettes[idx % palettes.length];
  }

  function getUnitLabel(idx){
    return `活動${idx+1}`;
  }

  function getUnitDateText(u){
    if(u.kind === "main"){
      return (u.dates && u.dates.length >= 2) ? `${u.startDate}～${u.endDate}` : (u.startDate || "");
    }
    return u.date || "";
  }

  function getLineQtyText(qty, unit){
    const q = Number(qty||0);
    if(q <= 0) return "";
    return `${q} ${unit || "件"}`;
  }

  function buildGroups(u){
    const groups = [];
    const byTitle = new Map();
    const addLine = (groupTitle, name, qtyText, amount)=>{
      if(!byTitle.has(groupTitle)){
        const g = { title: groupTitle, lines: [] };
        byTitle.set(groupTitle, g);
        groups.push(g);
      }
      byTitle.get(groupTitle).lines.push({ name, qtyText, amount:Number(amount||0) });
    };

    const packs = u.cart?.packs || {};
    for(const p of Object.values(packs)){
      if(!p) continue;
      addLine(p.label || '套裝', p.name || '未命名套裝', '1 套', Number(p.price||0));
    }

    const items = u.cart?.items || {};
    for(const [id, qty] of Object.entries(items)){
      const q = Number(qty||0);
      if(q <= 0) continue;
      const f = findItem(id);
      if(!f) continue;
      addLine(f.cat?.name || '其他項目', f.item.name, getLineQtyText(q, f.item.unit), getLineSubtotal(f.item, q));
    }

    const fees = [];
    if(u.kind === 'main'){
      const r = calcMainTotal(u);
      if((r.N||0) >= 2 && Number(r.contFee||0) > 0){
        fees.push({ name:'連續多日加價', qtyText:'第2天 50%｜第3天起 30%', amount:Number(r.contFee||0) });
      }
      if((r.s2Count||0) > 0 && Number(r.s2Fee||0) > 0){
        fees.push({ name:'同日第二場加價', qtyText:`${r.s2Count} 天（B×30%）`, amount:Number(r.s2Fee||0) });
      }
    }else{
      const r = calcExtraTotal(u);
      const meta = ensurePlanMeta(u.uid);
      if(meta.s2On && Number(r.s2Fee||0) > 0){
        fees.push({ name:'同日第二場加價', qtyText:'B×30%', amount:Number(r.s2Fee||0) });
      }
    }
    if(fees.length) groups.push({ title:'加價項目', lines: fees });
    return groups;
  }

  let grand = 0;
  root.innerHTML = units.map((u, idx)=>{
    const palette = getQuotePalette(idx);
    const label = getUnitLabel(idx);
    const dateText = getUnitDateText(u);
    const groups = buildGroups(u);
    let subtotal = 0;
    if(u.kind === 'main'){
      subtotal = Number(calcMainTotal(u).total||0);
    }else{
      subtotal = Number(calcExtraTotal(u).total||0);
    }
    grand += subtotal;

    const groupHtml = groups.length
      ? groups.map(g=>`
          <div class="quoteGroup">
            <div class="quoteGroupTitle">${escapeHtml(g.title)}</div>
            <div class="quoteLines">
              ${g.lines.map(line=>`
                <div class="quoteLine">
                  <div class="quoteLineTop">
                    <div class="quoteLineName">${escapeHtml(line.name)}</div>
                    <div class="quoteLineAmount">${fmt(line.amount||0)}</div>
                  </div>
                  ${line.qtyText ? `<div class="quoteLineMeta">${escapeHtml(line.qtyText)}</div>` : ``}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')
      : `<div class="note">尚未選擇設備。</div>`;

    return `
      <section class="quoteDay" style="border-color:${palette.border}">
        <div class="quoteDayHd" style="background:${palette.header};border-bottom:1px solid ${palette.border};color:${palette.text}">
          <div class="quoteDayTitle">${escapeHtml(label)}</div>
          <div class="quoteDayDate">${escapeHtml(dateText || '未填日期')}</div>
        </div>
        <div class="quoteDayBody" style="background:#fff">
          ${groupHtml}
          <div class="quoteSubtotal" style="background:${palette.subtotal};border-top-color:${palette.border}">
            <span class="label">本活動小計</span>
            <span class="value">${fmt(subtotal)}</span>
          </div>
        </div>
      </section>
    `;
  }).join('');

  $("#quoteGrandTotal") && ($("#quoteGrandTotal").textContent = fmt(grand));
}


function renderStep3FlowButton(){
  const btn = $("#btnStep3Continue");
  const hint = $("#step3FlowHint");
  const units = state.units || [];
  const idx = Number(state.currentIndex||0);
  if(!btn) return;
  if(!units.length){
    btn.style.display = 'none';
    if(hint) hint.textContent = '';
    return;
  }
  btn.style.display = '';
  const curLabel = getStep3UnitLabelByIndex(idx);
  const nextLabel = getStep3UnitLabelByIndex(idx+1);
  if(idx < units.length-1){
    btn.textContent = `完成${curLabel}，前往${nextLabel}繼續填表`;
    if(hint) hint.textContent = `完成 ${curLabel} 後，系統會帶你到 ${nextLabel}。`;
  }else{
    btn.textContent = '完成全部活動，前往列印/送出報價單';
    if(hint) hint.textContent = '這是最後一個活動，完成後會前往列印 / 送出報價單。';
  }
}

function completeCurrentAndContinue(){
  const units = state.units || [];
  if(!units.length) return;
  const idx = Number(state.currentIndex||0);
  const u = units[idx];
  if(u) u.done = true;
  renderDayCards();
  renderEquipUnitBar();
  renderStep3FlowButton();
  if(idx < units.length-1){
    openUnit(idx+1);
  }else{
    goQuote();
  }
}

function goQuote(){
  setStep(4);
  showView("viewQuote");
  renderQuote();
}

/* =========================
   Print（保留簡化版本）
   ========================= */
function buildDayItemsForPrint(u){
  const items = [];
  const packs = u.cart?.packs || {};
  for(const [k, p] of Object.entries(packs)){
    if(!p) continue;
    items.push({
      category: "套裝",
      name: `套裝｜${p.label||k}｜${p.name||""}`,
      unit: "套",
      price: Number(p.price||0),
      qty: 1,
      total: Number(p.price||0),
      options: {}
    });
  }
  const rows = u.cart?.items || {};
  for(const [id, qty] of Object.entries(rows)){
    const f = findItem(id); if(!f) continue;
    const up = getUnitPrice(f.item, qty);
    items.push({
      category: f.cat.name,
      name: f.item.name,
      unit: f.item.unit,
      price: Number(up||0),
      qty: Number(qty||0),
      total: Number(up||0)*Number(qty||0),
      options: u.itemOpts?.[id] || {}
    });
  }
  return items;
}
function formatOptionsInline(opts){
  if(!opts) return "";
  const ks = Object.keys(opts);
  if(!ks.length) return "";
  return ks.map(k=>`${k}=${opts[k]}`).join("；");
}

function buildPrint(){
  const root = $("#printRoot");
  const units = state.units || [];
  const totals = calcGrandTotal();
  const g = state.globalForm || {};

  const now = new Date();
  const ts = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  const summaryRows = (()=> {
    const rows = [];
    const main = units[0];
    if(main){
      const label = (main.dates.length>=2) ? "活動1（連續）" : "主案";
      const dateText = (main.dates.length>=2) ? `${main.startDate}～${main.endDate}` : main.startDate;
      rows.push(`<tr><td>${label}</td><td>${dateText}</td><td class="right">${fmt(totals.main.total)}</td></tr>`);
    }
    units.slice(1).forEach((u,i)=>{
      const r = totals.extras[i] || {total:0};
      rows.push(`<tr><td>活動 ${u.extraIndex}</td><td>${u.date}</td><td class="right">${fmt(r.total)}</td></tr>`);
    });
    return rows.join("");
  })();

  const summaryPage = `
    <div class="printHdr">
      <p class="printBrand">${escapeHtml(BRAND_NAME)}</p>
      <p class="printTitle">${escapeHtml(PRINT_TITLE)}</p>
      <div class="printMeta">產生時間：${escapeHtml(ts)}</div>
      <div class="printMeta">聯絡人：${escapeHtml(g.name||"")}｜電話：${escapeHtml(g.phone||"")}｜Email：${escapeHtml(g.email||"")}</div>
      <div class="printMeta">地點：${escapeHtml(g.city||"")} ${escapeHtml(g.area||"")} ${escapeHtml(g.addr||"")} ${escapeHtml(g.bldg||"")}</div>
      <div class="printMeta">活動：${escapeHtml(g.eventType||"")}｜人數：${escapeHtml(g.crowd||"")}｜室內外：${escapeHtml(g.indoor||"")}</div>
      <div class="printMeta">貨車到場：${escapeHtml(g.truckAccess||"")}｜搬運方式／樓層：${escapeHtml(g.moveFloor||"")}</div>
    </div>

    <div class="printH3">總覽</div>
    <table class="printTbl">
      <thead><tr><th style="width:110px">項目</th><th>日期</th><th class="right" style="width:100px">金額</th></tr></thead>
      <tbody>${summaryRows || `<tr><td colspan="3">—</td></tr>`}</tbody>
    </table>

    <div class="totalsBox">
      <div class="totals">
        <div class="trow"><span class="muted">總計</span><b>${fmt(totals.total)}</b></div>
      </div>
    </div>

    <div class="pageBreak"></div>
  `;

  const detailPages = units.map((u, idx)=>{
    const items = buildDayItemsForPrint(u);
    const rows = items.map(it=>`
      <tr>
        <td>${escapeHtml(it.category||"")}</td>
        <td>${escapeHtml(it.name||"")}</td>
        <td>${escapeHtml(it.unit||"")}</td>
        <td class="right">${fmt(it.price||0)}</td>
        <td class="right">${it.qty||0}</td>
        <td class="right">${fmt(it.total||0)}</td>
        <td>${escapeHtml(formatOptionsInline(it.options))}</td>
      </tr>
    `).join("");

    let title = "";
    let money = 0;

    if(u.kind==="main"){
      title = (u.dates.length>=2) ? `活動1（連續）｜${u.startDate}～${u.endDate}` : `活動1｜${u.startDate}`;
      money = calcMainTotal(u).total;
    }else{
      title = `活動 ${u.extraIndex}｜${u.date}`;
      money = calcExtraTotal(u).total;
    }

    return `
      <div class="printHdr">
        <p class="printBrand">${escapeHtml(BRAND_NAME)}</p>
        <p class="printTitle">${escapeHtml(title)}</p>
        <div class="printMeta">聯絡人：${escapeHtml(u.form?.name||"")}｜電話：${escapeHtml(u.form?.phone||"")}｜Email：${escapeHtml(u.form?.email||"")}</div>
        <div class="printMeta">地點：${escapeHtml(u.form?.city||"")} ${escapeHtml(u.form?.area||"")} ${escapeHtml(u.form?.addr||"")} ${escapeHtml(u.form?.bldg||"")}</div>
        <div class="printMeta">活動：${escapeHtml(u.form?.eventType||"")}｜人數：${escapeHtml(u.form?.crowd||"")}｜室內外：${escapeHtml(u.form?.indoor||"")}</div>
        <div class="printMeta">貨車到場：${escapeHtml(u.form?.truckAccess||"")}｜搬運方式／樓層：${escapeHtml(u.form?.moveFloor||"")}</div>
      </div>

      <div class="printH3">設備清單</div>
      <table class="printTbl">
        <thead>
          <tr>
            <th style="width:90px">分類</th>
            <th>品項</th>
            <th style="width:40px">單位</th>
            <th class="right" style="width:90px">單價</th>
            <th class="right" style="width:50px">數量</th>
            <th class="right" style="width:90px">小計</th>
            <th>選項</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="7">—</td></tr>`}</tbody>
      </table>

      <div class="totalsBox">
        <div class="totals">
          <div class="trow"><span class="muted">本項合計</span><b>${fmt(money)}</b></div>
        </div>
      </div>

      ${idx === units.length-1 ? `` : `<div class="pageBreak"></div>`}
    `;
  }).join("");

  root.innerHTML = summaryPage + detailPages;
}

function printPDF(){
  buildPrint();
  document.body.classList.add("printing");
  window.print();
  setTimeout(()=>{ document.body.classList.remove("printing"); }, 500);
}

/* Send helpers */
function buildItemsForPayload_(u){
  const items = buildDayItemsForPrint(u) || [];
  return items.map(it=>({
    category: it.category || "",
    name: it.name || "",
    unit: it.unit || "",
    price: Number(it.price || 0),
    qty: Number(it.qty || 0),
    total: Number(it.total || 0),
    optionsText: formatOptionsInline(it.options || {})
  }));
}
function calcMainDayBase_(B, dayIndex){
  if(dayIndex === 0) return Number(B||0);
  if(dayIndex === 1) return Math.round(Number(B||0) * 0.50);
  return Math.round(Number(B||0) * 0.30);
}

function buildQuotePayload_v2(){
  const units = state.units || [];
  const main = units[0];
  if(!main){
    throw new Error("尚未建立任何項目，請先完成 Step1 並生成活動表單。");
  }

  const sessions = [];
  const g = state.globalForm || {};

  const B = calcEquipSubtotal(main);
  const mainItems = buildItemsForPayload_(main);

  (main.dates || []).forEach((d, i)=>{
    const meta = ensurePlanMeta(`main-${d}`);
    const dayBase = calcMainDayBase_(B, i);

    sessions.push({
      label: `主案 Day${i+1} 第一場`,
      date: d,
      timeStart: meta.start || "",
      timeEnd: meta.end || "",
      total: dayBase,
      form: Object.assign({}, main.form || g, { sessionNote: (main.form && main.form.dayNote) ? main.form.dayNote : "" }),
      items: mainItems
    });

    if(meta.s2On){
      sessions.push({
        label: `主案 Day${i+1} 第二場`,
        date: d,
        timeStart: meta.s2Start || "",
        timeEnd: meta.s2End || "",
        total: Math.round(B * 0.30),
        form: Object.assign({}, main.form || g, { sessionNote: (main.form && main.form.dayNote) ? main.form.dayNote : "" }),
        items: mainItems
      });
    }
  });

  units.slice(1).forEach((u)=>{
    const Bx = calcEquipSubtotal(u);
    const meta = ensurePlanMeta(u.uid);
    const items = buildItemsForPayload_(u);

    sessions.push({
      label: `活動 ${u.extraIndex} 第一場`,
      date: u.date,
      timeStart: meta.start || "",
      timeEnd: meta.end || "",
      total: Number(Bx || 0),
      form: Object.assign({}, u.form || g, { sessionNote: (u.form && u.form.dayNote) ? u.form.dayNote : "" }),
      items: items
    });

    if(meta.s2On){
      sessions.push({
        label: `活動 ${u.extraIndex} 第二場`,
        date: u.date,
        timeStart: meta.s2Start || "",
        timeEnd: meta.s2End || "",
        total: Math.round(Bx * 0.30),
        form: Object.assign({}, u.form || g, { sessionNote: (u.form && u.form.dayNote) ? u.form.dayNote : "" }),
        items: items
      });
    }
  });

  const baseTotal = sessions.reduce((a, s)=>a + Number(s.total||0), 0);

  return {
    action: "submitQuote_v2",
    editToken: EDIT_TOKEN || "",
    siteBaseUrl: getSiteBaseUrl_(),
    uiState: {
      state: deepClone(state),
      ui: {
        fIsMultiDay: !!$("#fIsMultiDay")?.checked,
        fDateStart: normalizeDateStr($("#fDateStart")?.value||""),
        fDateEnd: normalizeDateStr($("#fDateEnd")?.value||""),
        globalFormNow: getGlobalFormFromUI()
      }
    },
    globalForm: g,
    sessions: sessions,
    summary: {
      baseTotal: baseTotal,
      surcharge: 0,
      grandTotal: baseTotal,
      continuousEligible: true
    }
  };
}

async function submitQuote(){
  try{
    const payload = buildQuotePayload_v2();

    const res = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();
    let j = null;
    try{ j = JSON.parse(txt); }catch(_){}

    if(res.ok && j && j.ok){
      if(j.editToken) EDIT_TOKEN = j.editToken;

      openModal("已送出報價單", `
        <div class="note" style="margin-bottom:10px">
          系統已寄出 PDF 報價單，請至信箱查收（含垃圾郵件/促銷）。<br>
          之後若要修改，可用信件內的「修改訂單」連結回來更新。
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
          <button class="btn" id="afterGoHome" type="button">回柚子樂器官網</button>
          <button class="btn primary" id="afterNew" type="button">新增一筆新的表單</button>
          <button class="btn" id="afterClose" type="button">關閉</button>
        </div>
      `);

      setTimeout(()=>{
        $("#afterGoHome")?.addEventListener("click", ()=>window.open(OFFICIAL_HOME_URL, "_blank", "noopener"));
        $("#afterNew")?.addEventListener("click", ()=>{
          window.location.href = getSiteBaseUrl_();
        });
        $("#afterClose")?.addEventListener("click", closeModal);
      },0);

    }else{
      const msg = (j && (j.message || j.error)) ? (j.message || j.error) : txt;
      alert("送出失敗（後端回傳）：" + msg);
      console.log("Server response:", txt);
    }
  }catch(e){
    console.error(e);
    alert("送出失敗：" + (e?.message || e));
  }
}

/* =========================
   Step nav
   ========================= */
function goStep1(){
  setStep(1);
  showView("viewBasic");
}
function goDayList(){
  setStep(2);
  showView("viewDayList");
  renderDayCards();
}
function canNavigateToStep(n){
  if(n===1) return true;
  return (state.units && state.units.length>0);
}
function navToStep(n){
  if(!canNavigateToStep(n)){
    alert("請先完成 Step1 並按「下一步：生成活動表單」。");
    return;
  }
  if(n===1) return goStep1();
  if(n===2) return goDayList();
  if(n===3) return openUnit(state.currentIndex||0);
  if(n===4) return goQuote();
}
function updateStepBarClickable(){
  $$("#stepsBar .stepBox").forEach(b=>{
    const n = Number(b.dataset.step||0);
    b.classList.toggle("disabled", !canNavigateToStep(n));
  });
}

/* =========================
   Init：時間 select（活動編輯用）
   ========================= */
function fillTimeSelectsForEdit(){
  const hours = Array.from({length:24}, (_,i)=>pad2(i));
  const mins  = ["00","10","20","30","40","50"];
  function fill(id, arr){
    const sel=$("#"+id);
    if(sel) sel.innerHTML = arr.map(v=>`<option value="${v}">${v}</option>`).join("");
  }
  ["dStartH","dEndH","d2StartH","d2EndH"].forEach(id=>fill(id, hours));
  ["dStartM","dEndM","d2StartM","d2EndM"].forEach(id=>fill(id, mins));
}

/* =========================
   Buttons & Step1 wiring
   ========================= */
function bindNavButtons(){
  $("#btnGoHome")?.addEventListener("click", ()=>window.open(OFFICIAL_HOME_URL, "_blank", "noopener"));

  $("#btnGoStep1")?.addEventListener("click", goStep1);
  $("#btnBackToBasic")?.addEventListener("click", goStep1);
  $("#btnBackToDays2")?.addEventListener("click", goDayList);
  $("#btnBackToEdit")?.addEventListener("click", ()=>openUnit(state.currentIndex));
  $("#btnGoQuote")?.addEventListener("click", ()=>{
    const todo = getNextTodoIndex(-1);
    if(todo !== -1){
      alert(`尚有未完成：活動${todo+1}（請先完成）`);
      openUnit(todo);
      return;
    }
    goQuote();
  });

  $("#btnGoSelectEquip")?.addEventListener("click", ()=>{
    const units = state.units || [];
    if(!units.length){
      alert("請先完成 Step1 並生成活動表單。");
      return;
    }
    openUnit(0);
  });

  $("#btnStep3Continue")?.addEventListener("click", completeCurrentAndContinue);

  $("#btnPrint")?.addEventListener("click", printPDF);
  $("#btnPrintTop")?.addEventListener("click", printPDF);
  const bp=$("#btnBottomPrint"); if(bp) bp.addEventListener("click", ()=>$("#btnPrint")?.click());
  const bs=$("#btnBottomSend"); if(bs) bs.addEventListener("click", submitQuote);

  $$("#stepsBar .stepBox").forEach(b=>{
    b.addEventListener("click", ()=>navToStep(Number(b.dataset.step||0)));
  });
}


function bindStep1Events(){
  const t = todayStr();
  ["fDateStart","fDateEnd","fDateAdd"].forEach(id=>{
    const el = $("#"+id);
    if(el) el.min = t;
  });

  function syncEndMin(){
    const ds = normalizeDateStr($("#fDateStart")?.value||"");
    if($("#fDateStartMirror")) $("#fDateStartMirror").value = ds || "";
    if(!ds) return;
    const end = $("#fDateEnd");
    if(!end) return;
    if($("#fIsMultiDay")?.checked){
      const minEnd = addDays(ds, 1);
      end.min = minEnd;
      if(!end.value || normalizeDateStr(end.value) < minEnd){
        end.value = minEnd;
      }
    }else{
      end.min = t;
    }
  }

  $("#fIsMultiDay")?.addEventListener("change", ()=>{
    syncEndMin();
    renderMainInline();
  });


  $("#fDateStart").addEventListener("change", ()=>{
    syncEndMin();
    renderMainInline();
  });
  $("#fDateEnd")?.addEventListener("change", ()=>{
    syncEndMin();
    renderMainInline();
  });

  $("#btnAddDate")?.addEventListener("click", ()=>{
    const d = normalizeDateStr($("#fDateAdd").value||"");
    if(!d){ alert("請先選擇活動日期。"); return; }
    if(d < t){ alert("不可以選過去的日期。"); return; }
    state.extraUnits = state.extraUnits || [];
    state.extraUnits.push({ id: genId(), date: d });
    $("#fDateAdd").value = "";
    renderExtraInline();
  });

  $("#btnNextToDays").addEventListener("click", ()=>{
    const ok = buildUnitsFromStep1();
    if(!ok) return;
    
    goDayList();
  });
}

/* =========================
   修改模式：載入 token
   ========================= */
async function tryLoadEditMode_(){
  const sp = new URLSearchParams(window.location.search || "");
  const mode = sp.get("mode");
  const token = sp.get("token");
  if(mode !== "edit" || !token) return;

  try{
    EDIT_TOKEN = token;

    const url = ORDER_API_URL + "?action=getQuote_v2&token=" + encodeURIComponent(token);
    const res = await fetch(url, { method:"GET" });
    const txt = await res.text();
    let j=null; try{ j=JSON.parse(txt); }catch(_){}

    if(!j || !j.ok || !j.uiState || !j.uiState.state){
      alert("載入修改單失敗：" + (j && (j.message||j.error) ? (j.message||j.error) : txt));
      return;
    }

    const saved = j.uiState.state;
    state.step = saved.step || 1;
    state.isMulti = !!saved.isMulti;
    state.isExtra = !!saved.isExtra;
    state.extraUnits = deepClone(saved.extraUnits || []);
    state.planMeta = deepClone(saved.planMeta || {});
    state.globalForm = deepClone(saved.globalForm || (j.uiState.ui && j.uiState.ui.globalFormNow) || {});
    state.units = deepClone(saved.units || []);
    state.currentIndex = Number(saved.currentIndex || 0);

    const gf = (j.uiState.ui && j.uiState.ui.globalFormNow) ? j.uiState.ui.globalFormNow : (state.globalForm||{});
    $("#fName").value = gf.name || "";
    $("#fPhone").value = gf.phone || "";
    $("#fEmail").value = gf.email || "";
    $("#fAddr").value = gf.addr || "";
    $("#fBldg").value = gf.bldg || "";
    $("#fEventType").value = gf.eventType || "";
    $("#fCrowd").value = gf.crowd || "";
    $("#fIndoor").value = gf.indoor || "";
    $("#fTruckAccess").value = gf.truckAccess || "";
    $("#fMoveFloor").value = gf.moveFloor || "";
    $("#fNote").value = gf.note || "";

    if(gf.city) $("#fCity").value = gf.city;
    $("#fCity").dispatchEvent(new Event("change"));
    if(gf.area) $("#fArea").value = gf.area;

    if(j.uiState.ui){
      $("#fDateStart").value = j.uiState.ui.fDateStart || (gf.dateStart||"");
      $("#fDateEnd").value = j.uiState.ui.fDateEnd || (gf.dateEnd||"");
      $("#fIsMultiDay").checked = !!j.uiState.ui.fIsMultiDay;
    }


    renderMainInline();
    renderExtraInline();
    renderDayCards();

    
    goQuote();

    openModal("已進入修改模式", `
      <div class="note">你正在修改先前的報價單（Token：<b>${escapeHtml(token)}</b>）。修改完成後再次按「送出報價單」即可更新。</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px">
        <button class="btn" id="editGoStep1" type="button">回到基本資料</button>
        <button class="btn primary" id="editGoQuote" type="button">查看報價單</button>
      </div>
    `);
    setTimeout(()=>{
      $("#editGoStep1")?.addEventListener("click", ()=>{ closeModal(); goStep1(); });
      $("#editGoQuote")?.addEventListener("click", ()=>{ closeModal(); goQuote(); });
    },0);

  }catch(e){
    alert("載入修改單失敗：" + (e?.message || e));
  }
}

/* =========================
   Init
   ========================= */
(async function init(){
  fillCityArea($("#fCity"), $("#fArea"), "台中市", "豐原區");


  fillTimeSelectsForEdit();
  fillSelectOptions();
  bindNavButtons();
  bindStep1Events();

  setStep(1);
  showView("viewBasic");
  syncBasicFormLayoutLikeExtra();
  renderMainInline();
  renderExtraInline();

  await tryLoadEditMode_();
  syncBasicFormLayoutLikeExtra();
})();