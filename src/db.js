/* =================================================================== */
/*  資料庫層 DB：users / activities / applications / ratings / messages  */
/*  - localStorage 持久化、版本遷移、結束活動與成員互評信譽機制            */
/* =================================================================== */
import { STORE_KEY, DB_VERSION } from "./constants";
import { today } from "./utils";

export function seedDB() {
    return {
        version: DB_VERSION,
        seq: 1000,
        users: [
            { id: "u_admin", account: "admin", password: "admin123", name: "系統管理員", email: "admin@jiu.app", rep: 100, provider: "local", role: "admin", status: "active", createdAt: "2025/01/01", phone: "0911000111", phoneVerified: true, demerit: 0, avatar: null, bio: "揪是要聚 平台管理員" },
            { id: "u_demo", account: "demo", password: "1234", name: "測試員", email: "demo@jiu.app", rep: 95, provider: "local", role: "user", status: "active", createdAt: "2025/02/14", phone: null, phoneVerified: false, demerit: 0, avatar: null, bio: "愛好打球、休閒娛樂等…" },
            { id: "u_sam", account: "sam", password: "0000", name: "豬勝宏", email: "sam@jiu.app", rep: 95, provider: "local", role: "user", status: "active", createdAt: "2025/03/02", phone: "0922333444", phoneVerified: true, demerit: 0, avatar: null, bio: "愛好打球、休閒娛樂等…" },
            { id: "u_amy", account: "amy", password: "0000", name: "張大胖", email: "amy@jiu.app", rep: 88, provider: "local", role: "user", status: "active", createdAt: "2025/03/18", phone: "0933555666", phoneVerified: true, demerit: 0, avatar: null, bio: "籃球校隊，會帶隊熱身～" },
            { id: "u_joy", account: "joy", password: "0000", name: "尾鰭", email: "joy@jiu.app", rep: 72, provider: "local", role: "user", status: "active", createdAt: "2025/04/05", phone: null, phoneVerified: false, demerit: 0, avatar: null, bio: "新手一枚，請多多指教！" },
            { id: "u_kevin", account: "kevin", password: "0000", name: "洽莉", email: "kevin@jiu.app", rep: 91, provider: "local", role: "user", status: "active", createdAt: "2025/02/20", phone: "0955123789", phoneVerified: true, demerit: 0, avatar: null, bio: "晨型人，揪晨跑與晨泳！" },
            { id: "u_leo", account: "leo", password: "0000", name: "艾倫", email: "leo@jiu.app", rep: 85, provider: "local", role: "user", status: "active", createdAt: "2025/03/30", phone: null, phoneVerified: false, demerit: 0, avatar: null, bio: "足球狂熱者，週週開踢⚽" },
            { id: "u_allen", account: "allen", password: "0000", name: "艾倫", email: "allen@jiu.app", rep: 100, provider: "local", role: "user", status: "active", createdAt: "2025/03/30", phone: null, phoneVerified: false, demerit: 0, avatar: null, bio: "藍球狂熱者，週週開打" },
        ],
        activities: [
            { id: 1, cat: "basketball", title: "雲科籃球場5v5全場", start: "16:00", end: "18:00", location: "雲林科技大學 體育館", lat: 23.6953, lng: 120.5347, cap: 10, note: "自由參加，歡迎來打球流流汗！", hostId: "u_kevin", full: false },
            { id: 2, cat: "badminton", title: "體育館羽球雙打", start: "19:30", end: "21:30", location: "新莊體育館", cap: 6, note: "初學者友善，球拍可借！", hostId: "u_amy", full: false },
            { id: 3, cat: "boardgame", title: "桌遊咖揪人開新團", start: "20:00", end: "23:00", location: "西門紅樓", cap: 5, note: "璀璨寶石、卡坦島，新手歡迎～", hostId: "u_sam", full: false },
            { id: 4, cat: "soccer", title: "河堤夜間足球賽", start: "18:00", end: "20:00", location: "青年公園籃球場", cap: 14, note: "七人制友誼賽，缺守門員！", hostId: "u_leo", full: true },
            { id: 5, cat: "esports", title: "英雄聯盟5排上分", start: "21:00", end: "23:30", location: "信義威秀影城", cap: 5, note: "鑽石以上，語音溝通佳。", hostId: "u_demo", full: false },
            { id: 6, cat: "food", title: "東區巷弄美食揪", start: "12:00", end: "14:00", location: "信義威秀影城", cap: 8, note: "一起探店嗑美食～", hostId: "u_joy", full: false },
            /* v4 擴充：更多元的活動資料 */
            { id: 9, cat: "tennis", title: "週末網球雙打切磋", start: "09:00", end: "11:00", location: "臺大綜合體育館", cap: 4, note: "中等程度，場地已預訂，歡迎切磋！", hostId: "u_sam", full: false },
            { id: 10, cat: "hiking", title: "大坑步道輕鬆行", start: "07:30", end: "12:00", location: "大坑登山步道", cap: 12, note: "新手友善路線，記得帶水與防曬。", hostId: "u_amy", full: false },
            { id: 11, cat: "mahjong", title: "週五夜麻將團", start: "19:00", end: "23:00", location: "西門紅樓", cap: 4, note: "小注怡情，缺一咖！", hostId: "u_joy", full: false },
            { id: 12, cat: "karaoke", title: "好樂迪歡唱之夜", start: "20:00", end: "23:00", location: "西門紅樓", cap: 8, note: "抒情搖滾都歡迎，包廂已訂！", hostId: "u_amy", full: false },
            { id: 13, cat: "movie", title: "科幻新片首映團", start: "18:30", end: "21:30", location: "信義威秀影城", cap: 6, note: "看完一起吃宵夜聊劇情～", hostId: "u_sam", full: false },
            { id: 14, cat: "swim", title: "晨泳健身團", start: "06:30", end: "08:00", location: "臺大綜合體育館", cap: 10, note: "游完一起吃早餐，自由式為主。", hostId: "u_kevin", full: false },
            { id: 15, cat: "poker", title: "德州撲克友誼局", start: "20:00", end: "23:00", location: "西門紅樓", cap: 9, note: "純友誼籌碼局，新手教學！", hostId: "u_leo", full: false },
            { id: 16, cat: "food", title: "斗六夜市美食團", start: "18:00", end: "20:00", location: "斗六運動公園", cap: 10, note: "在地人帶路，吃遍人氣攤位！", hostId: "u_amy", full: false },
            { id: 17, cat: "gym", title: "重訓夥伴互相督促", start: "19:00", end: "20:30", location: "雲林科技大學 體育館", cap: 6, note: "胸背腿循環，互相補位保護。", hostId: "u_sam", full: false },
            { id: 18, cat: "running", title: "晨跑 5K 揪團", start: "06:00", end: "07:00", location: "斗六運動公園", cap: 15, note: "配速 6:30，跑完拉伸收操。", hostId: "u_kevin", full: false },
            { id: 19, cat: "boardgame", title: "阿瓦隆推理之夜", start: "19:30", end: "22:30", location: "西門紅樓", cap: 10, note: "歡迎嘴遊高手，氣氛輕鬆！", hostId: "u_leo", full: false },
            // 以下為過往（封存）活動，僅供歷史紀錄關聯使用，不顯示於主頁
            { id: 7, cat: "basketball", title: "雲林子公園3v3", start: "16:00", end: "18:00", location: "雲林子公園", lat: 23.6953, lng: 120.5347, cap: 10, note: "自由參加", hostId: "u_kevin", full: false },
            { id: 8, cat: "volleyball", title: "雲科排球友誼賽", start: "14:00", end: "16:00", location: "雲林科技大學 體育場", cap: 12, note: "", hostId: "u_sam", full: false, archived: true },
            { id: 90, cat: "running", title: "河濱夜跑團", start: "06:00", end: "07:00", location: "大佳河濱公園", cap: 20, note: "", hostId: "u_amy", full: false, archived: true },
            { id: 91, cat: "volleyball", title: "排球友誼賽", start: "14:00", end: "16:00", location: "青年公園", cap: 12, note: "", hostId: "u_sam", full: false, archived: true },
            { id: 92, cat: "tabletennis", title: "桌球練習局", start: "18:00", end: "20:00", location: "臺大綜合體育館", cap: 4, note: "", hostId: "u_joy", full: false, archived: true },
            { id: 93, cat: "gym", title: "瑜珈健身團", start: "10:00", end: "11:00", location: "大安森林公園", cap: 15, note: "", hostId: "u_amy", full: false, archived: true },
            { id: 94, cat: "volleyball", title: "雲科排球友誼賽", start: "14:00", end: "16:00", location: "雲林科技大學 體育場", cap: 12, note: "", hostId: "u_sam", full: false, archived: true },
        ],
        applications: [
            { id: 301, activityId: 2, userId: "u_demo", status: "approved" },
            { id: 302, activityId: 6, userId: "u_demo", status: "approved" },
            { id: 303, activityId: 3, userId: "u_demo", status: "pending" },
            { id: 311, activityId: 5, userId: "u_sam", status: "pending" },
            { id: 312, activityId: 5, userId: "u_amy", status: "pending" },
            { id: 313, activityId: 5, userId: "u_joy", status: "pending" },
            /* v4 擴充 */
            { id: 321, activityId: 9, userId: "u_demo", status: "approved", createdAt: "2025/06/01" },
            { id: 322, activityId: 12, userId: "u_demo", status: "pending", createdAt: "2025/06/05" },
            { id: 323, activityId: 10, userId: "u_joy", status: "approved", createdAt: "2025/06/02" },
            { id: 324, activityId: 13, userId: "u_amy", status: "approved", createdAt: "2025/06/03" },
            { id: 325, activityId: 14, userId: "u_sam", status: "approved", createdAt: "2025/06/04" },
            { id: 326, activityId: 18, userId: "u_amy", status: "approved", createdAt: "2025/06/05" },
            { id: 327, activityId: 19, userId: "u_joy", status: "pending", createdAt: "2025/06/06" },
        ],
        ratings: [
            { id: 401, activityId: 2, userId: "u_demo", stars: 5, date: "2025/05/20" },
            { id: 402, activityId: 4, userId: "u_demo", stars: 4, date: "2025/05/12" },
            { id: 403, activityId: 3, userId: "u_demo", stars: 5, date: "2025/05/03" },
            { id: 404, activityId: 6, userId: "u_demo", stars: 3, date: "2025/04/28" },
            { id: 411, activityId: 1, userId: "u_sam", stars: 5, date: "2025/05/18" },
            { id: 412, activityId: 90, userId: "u_sam", stars: 4, date: "2025/05/10" },
            { id: 421, activityId: 91, userId: "u_amy", stars: 5, date: "2025/05/15" },
            { id: 422, activityId: 92, userId: "u_amy", stars: 4, date: "2025/05/06" },
            { id: 431, activityId: 93, userId: "u_joy", stars: 3, date: "2025/05/09" },
        ],
        /* v3：活動聊天室訊息（type:"system" 為系統通知，userId 可為 null） */
        messages: [
            { id: 501, activityId: 2, userId: null, text: "聊天室已建立，參與者可在此聯繫 👋", time: "17:55", date: "2025/05/28", type: "system" },
            { id: 502, activityId: 2, userId: "u_amy", text: "大家好～今晚 7 點半準時開打，記得帶水！", time: "18:02", date: "2025/05/28", type: "text" },
            { id: 503, activityId: 2, userId: "u_demo", text: "收到！請問球拍可以借嗎？", time: "18:05", date: "2025/05/28", type: "text" },
            { id: 504, activityId: 2, userId: "u_amy", text: "可以喔，我會多帶兩支 👍", time: "18:06", date: "2025/05/28", type: "text" },
            { id: 511, activityId: 6, userId: "u_joy", text: "臨時變動：集合地點改到威秀一樓大廳喔！", time: "11:20", date: "2025/05/29", type: "text" },
            { id: 512, activityId: 6, userId: "u_demo", text: "了解～大概 11:50 到！", time: "11:24", date: "2025/05/29", type: "text" },
            { id: 521, activityId: 9, userId: null, text: "聊天室已建立，參與者可在此聯繫 👋", time: "10:00", date: "2025/06/01", type: "system" },
            { id: 522, activityId: 9, userId: "u_sam", text: "場地訂好了，週六早上 9 點臺大體育館見！", time: "10:05", date: "2025/06/01", type: "text" },
            { id: 523, activityId: 9, userId: "u_demo", text: "OK！我帶一筒新球 🎾", time: "10:12", date: "2025/06/01", type: "text" },
            { id: 531, activityId: 10, userId: "u_amy", text: "週日 7:20 在登山口集合，遲到不等喔～", time: "21:40", date: "2025/06/02", type: "text" },
        ],
    };
}

export const DB = {
    data: seedDB(),
    /* 持久化：localStorage（重新整理後資料不會消失）；版本不符時自動遷移 */
    async load() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = parsed.version === DB_VERSION ? parsed : this.migrate(parsed);
            }
        } catch { /* 解析失敗則使用種子資料 */ this.data = seedDB(); }
    },
    save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch { /* 容量滿或隱私模式時略過 */ }
    },
    /* 舊版資料遷移：補齊缺漏欄位、確保 admin 帳號存在、合併新種子資料（以 id 判斷） */
    migrate(old) {
        const seed = seedDB();
        const data = { ...seed, ...old, version: DB_VERSION };
        data.users = (old.users || seed.users).map((u) => ({ role: "user", status: "active", createdAt: "2025/01/01", phone: null, phoneVerified: false, demerit: 0, ...u }));
        if (!data.users.some((u) => u.role === "admin")) data.users.unshift(seed.users[0]);
        data.activities = (old.activities || seed.activities).map((a) => ({ createdAt: a.createdAt || "2025/05/01", ...a }));
        data.applications = (old.applications || seed.applications).map((x) => ({ createdAt: x.createdAt || "2025/05/01", ...x }));
        data.messages = old.messages || seed.messages; // v3：補上聊天室資料表
        // v4：將新版種子資料合併進舊資料（不覆蓋使用者既有變更）
        const mergeById = (target, source) => { source.forEach((s) => { if (!target.some((t) => t.id === s.id)) target.push(s); }); };
        mergeById(data.users, seed.users);
        mergeById(data.activities, seed.activities);
        mergeById(data.applications, seed.applications);
        mergeById(data.messages, seed.messages);
        this.data = data; this.save();
        return data;
    },
    reset() { this.data = seedDB(); this.save(); },
    nextId() { return ++this.data.seq; },
    /* users */
    userById(id) { return this.data.users.find((u) => u.id === id); },
    userByAccount(a) { return this.data.users.find((u) => u.account === a); },
    auth(account, password) {
        const u = this.userByAccount(account.trim());
        return u && u.provider === "local" && u.password === password ? u : null;
    },
    createUser({ account, password, name }) {
        if (this.userByAccount(account.trim())) return { error: "此帳號已被註冊" };
        const u = { id: "u_" + this.nextId(), account: account.trim(), password, name: name.trim(), email: "", rep: 100, provider: "local", role: "user", status: "active", createdAt: today(), phone: null, phoneVerified: false, demerit: 0, avatar: null, bio: "這位揪友還沒有自我介紹" };
        this.data.users.push(u); this.save(); return { user: u };
    },
    loginGoogle(p) {
        let u = this.data.users.find((x) => x.provider === "google" && x.email === p.email);
        if (!u) {
            u = { id: "g_" + (p.sub || this.nextId()), account: p.email, password: null, name: p.name || "Google 使用者", email: p.email || "", rep: 100, provider: "google", role: "user", status: "active", createdAt: today(), phone: null, phoneVerified: false, demerit: 0, avatar: p.picture || null, bio: "使用 Google 帳號登入" };
            this.data.users.push(u);
        }
        this.save(); return u;
    },
    /* activities */
    activitiesView(meId) {
        return this.data.activities.filter((a) => !a.archived).map((a) => ({ ...a, hostBy: a.hostId, ended: !!a.ended, myStatus: this.myStatus(meId, a.id), rated: this.hasRatedActivity(meId, a.id) }));
    },
    /* 是否已對該活動評過分（「已參與活動」的活動滿意度評分） */
    hasRatedActivity(meId, actId) {
        return this.data.ratings.some((r) => r.activityId === actId && r.raterId === meId && r.rateeId === meId);
    },
    myStatus(meId, actId) {
        const ap = this.data.applications.find((x) => x.userId === meId && x.activityId === actId);
        if (!ap) return null;
        return ap.status === "approved" ? "joined" : ap.status === "pending" ? "pending" : null;
    },
    createActivity(meId, f) {
        const id = this.nextId();
        this.data.activities.unshift({ id, cat: f.cat, title: f.title.trim(), start: f.start, end: f.end, location: f.location, lat: f.lat, lng: f.lng, cap: f.cap, note: f.note.trim(), hostId: meId, full: false, createdAt: today() });
        // 自動產生示範報名者（pending），讓開團者可體驗審核流程
        ["u_sam", "u_amy"].forEach((uid) => this.data.applications.push({ id: this.nextId(), activityId: id, userId: uid, status: "pending", createdAt: today() }));
        this.save(); return id;
    },
    /* applications */
    apply(meId, actId) {
        if (!this.data.applications.find((x) => x.userId === meId && x.activityId === actId))
            this.data.applications.push({ id: this.nextId(), activityId: actId, userId: meId, status: "pending", createdAt: today() });
        this.save();
    },
    setStatus(meId, actId, status) {
        const ap = this.data.applications.find((x) => x.userId === meId && x.activityId === actId);
        if (ap && ap.status !== status) {
            ap.status = status;
            if (status === "approved") this.systemMessage(actId, `${this.userById(meId)?.name || "新成員"} 加入了活動`);
        }
        this.save();
    },
    applicantsFor(actId) {
        return this.data.applications
            .filter((x) => x.activityId === actId && x.status === "pending")
            .map((x) => ({ app: x, user: this.userById(x.userId) }))
            .filter((o) => o.user);
    },
    decide(appId, ok) {
        const ap = this.data.applications.find((x) => x.id === appId);
        if (ap) {
            ap.status = ok ? "approved" : "rejected";
            if (ok) this.systemMessage(ap.activityId, `${this.userById(ap.userId)?.name || "新成員"} 加入了活動`);
        }
        this.save();
    },
    approveAll(actId) {
        this.data.applications.filter((x) => x.activityId === actId && x.status === "pending").forEach((x) => {
            x.status = "approved";
            this.systemMessage(actId, `${this.userById(x.userId)?.name || "新成員"} 加入了活動`);
        });
        this.save();
    },
    /* 對「活動本身」評分（記錄個人滿意度，不影響信譽積分；信譽僅由成員互評決定） */
    rate(meId, actId, stars) {
        const d = new Date();
        const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
        this.data.ratings.unshift({ id: this.nextId(), activityId: actId, userId: meId, raterId: meId, rateeId: meId, stars, date });
        this.save();
    },
    /* ===== 結束活動 ===== */
    /* 開團者可自由決定結束時間，按下後活動進入「互評階段」 */
    endActivity(actId) {
        const a = this.data.activities.find((x) => x.id === actId);
        if (a && !a.ended) {
            a.ended = true;
            this.systemMessage(actId, "活動已結束，開放成員互相評分");
        }
        this.save();
    },
    /* ===== 成員互評 / 信譽積分 ===== */
    /* 待我評分的對象：同活動其他成員（排除自己），附上是否已評分 */
    peersToRate(meId, actId) {
        return this.participantsOf(actId)
            .filter((u) => u.id !== meId)
            .map((u) => ({ ...u, rated: this.hasRated(meId, u.id, actId) }));
    },
    hasRated(raterId, rateeId, actId) {
        return this.data.ratings.some((r) => r.activityId === actId && r.raterId === raterId && r.rateeId === rateeId);
    },
    /* 互評核心：依「信譽積分規則」處理扣分進度條與信譽積分
       - 權重 = 100 ÷ 活動參與人數
       - 1 顆星：扣分進度條 +2×權重；2 顆星：+1×權重
       - 3 顆星中立、4～5 顆星不影響任何數值
       - 扣分進度條每滿 100 → 信譽積分 −10、進度條歸零（保留溢出量）          */
    ratePeer(raterId, rateeId, actId, stars) {
        if (this.hasRated(raterId, rateeId, actId)) return;
        const d = new Date();
        const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
        this.data.ratings.unshift({ id: this.nextId(), activityId: actId, raterId, rateeId, stars, date });

        const ratee = this.userById(rateeId);
        if (ratee && stars <= 2) {
            const n = Math.max(1, this.participantsOf(actId).length);
            const weight = 100 / n;
            const add = stars === 1 ? 2 * weight : weight;   // 1 星 2×權重、2 星 1×權重
            ratee.demerit = (ratee.demerit || 0) + add;
            while (ratee.demerit >= 100) {                    // 每滿 100 觸發一次扣分
                ratee.demerit -= 100;
                ratee.rep = Math.max(0, (ratee.rep ?? 100) - 10);
            }
        }
        this.save();
    },
    historyOf(userId) {
        // 顯示「收到的評價」：新版以 rateeId 記錄，舊版資料以 userId 記錄
        return this.data.ratings.filter((r) => (r.rateeId || r.userId) === userId).map((r) => {
            const a = this.data.activities.find((x) => x.id === r.activityId) || {};
            return { title: a.title || "活動", cat: a.cat || "basketball", stars: r.stars, date: r.date };
        });
    },
    /* ===== 聊天室 messages ===== */
    nowTime() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    },
    messagesFor(actId) {
        return this.data.messages
            .filter((m) => m.activityId === actId)
            .map((m) => ({ ...m, user: m.userId ? this.userById(m.userId) : null }));
    },
    sendMessage(meId, actId, text) {
        this.data.messages.push({ id: this.nextId(), activityId: actId, userId: meId, text, time: this.nowTime(), date: today(), type: "text" });
        this.save();
    },
    systemMessage(actId, text) {
        this.data.messages.push({ id: this.nextId(), activityId: actId, userId: null, text, time: this.nowTime(), date: today(), type: "system" });
        this.save();
    },
    /* 聊天室成員 = 開團者 + 已通過審核的參與者 */
    participantsOf(actId) {
        const a = this.data.activities.find((x) => x.id === actId);
        const ids = [a?.hostId, ...this.data.applications.filter((x) => x.activityId === actId && x.status === "approved").map((x) => x.userId)];
        return [...new Set(ids)].map((id) => this.userById(id)).filter(Boolean);
    },
    /* ===== 手機認證 ===== */
    verifyPhone(meId, phone) {
        const u = this.userById(meId);
        if (u) { u.phone = phone; u.phoneVerified = true; this.save(); }
    },
    /* ===== 編輯個人資料（姓名、自我介紹、頭像） ===== */
    updateProfile(meId, { name, bio, avatar }) {
        const u = this.userById(meId);
        if (!u) return;
        if (typeof name === "string" && name.trim()) u.name = name.trim();
        if (typeof bio === "string") u.bio = bio;
        if (avatar !== undefined) u.avatar = avatar;   // 傳 null 可移除頭像
        this.save();
    },
    /* ===== 管理後台查詢 ===== */
    adminStats() {
        const { users, activities, applications, ratings } = this.data;
        return {
            users: users.length,
            activities: activities.filter((a) => !a.archived).length,
            archived: activities.filter((a) => a.archived).length,
            applications: applications.length,
            pending: applications.filter((x) => x.status === "pending").length,
            ratings: ratings.length,
            avgStars: ratings.length ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) : 0,
        };
    },
    adminUsers(q = "") {
        const kw = q.trim().toLowerCase();
        return this.data.users
            .map((u) => ({
                ...u,
                demerit: u.demerit || 0,
                hosted: this.data.activities.filter((a) => a.hostId === u.id).length,
                joined: this.data.applications.filter((x) => x.userId === u.id && x.status === "approved").length,
            }))
            .filter((u) => !kw || u.account.toLowerCase().includes(kw) || u.name.toLowerCase().includes(kw) || (u.email || "").toLowerCase().includes(kw));
    },
    adminActivities() {
        return this.data.activities.map((a) => ({
            ...a,
            hostName: this.userById(a.hostId)?.name || a.hostId,
            applyCount: this.data.applications.filter((x) => x.activityId === a.id).length,
            approvedCount: this.data.applications.filter((x) => x.activityId === a.id && x.status === "approved").length,
        }));
    },
    toggleUserStatus(userId) {
        const u = this.userById(userId);
        if (u && u.role !== "admin") { u.status = u.status === "active" ? "suspended" : "active"; this.save(); }
    },
};

/* =================================================================== */
/*  地點選擇器（串 Google Places，無金鑰時自動備援）                      */
/* =================================================================== */
/* 效能/品質：改為「開啟才掛載」(conditional mount)，
   每次開啟自動重設狀態，省去 reset 用的 useEffect 與多餘 re-render */
