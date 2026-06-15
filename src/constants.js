/* =================================================================== */
/*  全域常數：LOGO、品牌色、分類資料、地點備援、資料庫設定、評價標籤        */
/*  （無 JSX、無相依，可被任何模組安全匯入）                              */
/* =================================================================== */

/* ====== LOGO（Vite public 內容掛在根路徑，勿用 /public/ 前綴） ====== */
export const LOGO = "/SVG_blue.png";
export const LOGO_white = "/Logo_white.png";

/* ====== 品牌色 ====== */
export const BLUE = "#5b91d4", BLUE2 = "#7aa9e0", BLUE_DK = "#4076bd";
export const GREEN = "#46c477", GREEN_DK = "#36ad64";
export const INK = "var(--ink)", MUTED = "var(--muted)", SOFT = "var(--soft)", BG = "var(--bg)";
export const YELLOW = "#e8a93a";
export const CHART_COLORS = ["#5b91d4", "#46c477", "#f0993e", "#a06fd0", "#e07a8a", "#2f8f7e", "#6aa0e0", "#d8632a"];

/* ====== Google 設定（填入金鑰／Client ID 後啟用真實地圖與登入） ====== */
export const GOOGLE_MAPS_API_KEY = "";
export const GOOGLE_CLIENT_ID = "";

/* ====== 活動大分類（篩選用第一層）====== */
export const GROUPS = [
    { id: "sports", label: "運動", icon: "🏅" },
    { id: "games", label: "桌遊電玩", icon: "🎲" },
    { id: "fun", label: "影音娛樂", icon: "🎤" },
    { id: "food", label: "飯局", icon: "🍜" },
];

/* ====== 活動類別（每個類別歸屬一個大分類 group）====== */
export const CATS = [
    { id: "basketball", group: "sports", label: "籃球", icon: "🏀", grad: "linear-gradient(135deg,#f6a24a,#dd5f2a)" },
    { id: "badminton", group: "sports", label: "羽球", icon: "🏸", grad: "linear-gradient(135deg,#5bc0ad,#2f8f7e)" },
    { id: "soccer", group: "sports", label: "足球", icon: "⚽", grad: "linear-gradient(135deg,#74c274,#3f8f3f)" },
    { id: "volleyball", group: "sports", label: "排球", icon: "🏐", grad: "linear-gradient(135deg,#f2c14e,#e08a1e)" },
    { id: "tabletennis", group: "sports", label: "桌球", icon: "🏓", grad: "linear-gradient(135deg,#6aa0e0,#3f6fc0)" },
    { id: "tennis", group: "sports", label: "網球", icon: "🎾", grad: "linear-gradient(135deg,#aacf4a,#6f9f1e)" },
    { id: "baseball", group: "sports", label: "棒球", icon: "⚾", grad: "linear-gradient(135deg,#9aa6b2,#5f6b7a)" },
    { id: "gym", group: "sports", label: "健身", icon: "🏋️", grad: "linear-gradient(135deg,#8a8f99,#4a4f59)" },
    { id: "running", group: "sports", label: "路跑", icon: "🏃", grad: "linear-gradient(135deg,#f08a6a,#d0503a)" },
    { id: "hiking", group: "sports", label: "登山", icon: "🥾", grad: "linear-gradient(135deg,#7fb86f,#3f7f4f)" },
    { id: "swim", group: "sports", label: "游泳", icon: "🏊", grad: "linear-gradient(135deg,#4fb6e0,#2f7fc0)" },
    { id: "boardgame", group: "games", label: "桌遊", icon: "🎲", grad: "linear-gradient(135deg,#b07fd0,#6a3fa0)" },
    { id: "poker", group: "games", label: "撲克", icon: "🃏", grad: "linear-gradient(135deg,#e07a8a,#c04a60)" },
    { id: "mahjong", group: "games", label: "麻將", icon: "🀄", grad: "linear-gradient(135deg,#6fbf8f,#3f8f5f)" },
    { id: "esports", group: "games", label: "電競", icon: "🎮", grad: "linear-gradient(135deg,#8a6fd0,#5a3fa0)" },
    { id: "karaoke", group: "fun", label: "唱歌", icon: "🎤", grad: "linear-gradient(135deg,#e07ab0,#b04a80)" },
    { id: "movie", group: "fun", label: "電影", icon: "🎬", grad: "linear-gradient(135deg,#5f6b7a,#2f3947)" },
    { id: "food", group: "food", label: "美食", icon: "🍜", grad: "linear-gradient(135deg,#f0a24a,#d0622a)" },
];
export const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0];

/* ====== 地點選擇器備援資料（無金鑰時使用）====== */
export const PRESET_PLACES = [
    { name: "雲林科技大學 體育館", address: "雲林縣斗六市大學路三段123號", lat: 23.6953, lng: 120.5347 },
    { name: "斗六運動公園", address: "雲林縣斗六市仁愛路", lat: 23.7102, lng: 120.5436 },
    { name: "臺北小巨蛋", address: "台北市松山區南京東路四段2號", lat: 25.0515, lng: 121.5505 },
    { name: "臺大綜合體育館", address: "台北市大安區羅斯福路四段1號", lat: 25.0203, lng: 121.535 },
    { name: "大安森林公園", address: "台北市大安區新生南路二段1號", lat: 25.0297, lng: 121.5347 },
    { name: "板橋第一運動場", address: "新北市板橋區漢生東路", lat: 25.0143, lng: 121.472 },
    { name: "新莊體育館", address: "新北市新莊區公園路1號", lat: 25.036, lng: 121.449 },
    { name: "信義威秀影城", address: "台北市信義區松壽路18號", lat: 25.0357, lng: 121.5675 },
    { name: "西門紅樓", address: "台北市萬華區成都路10號", lat: 25.0421, lng: 121.507 },
    { name: "青年公園籃球場", address: "台北市萬華區水源路199號", lat: 25.026, lng: 121.501 },
];

/* ====== 資料庫設定 ====== */
export const STORE_KEY = "jiu_db";
export const DB_VERSION = 5;   /* v5：結束活動＋成員互評信譽機制（users 新增 demerit 扣分進度條、activities 新增 ended） */

/* ====== 互評星等標籤 ====== */
export const RATE_LABELS = { 1: "非常不滿意", 2: "不滿意", 3: "普通", 4: "滿意", 5: "非常滿意" };
