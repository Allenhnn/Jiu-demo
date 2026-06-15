/* =================================================================== */
/*  揪是要聚 — 主應用程式 App（畫面組裝與狀態管理）                        */
/*  各 UI 元件、資料庫、常數已拆分至獨立模組，於下方匯入。                  */
/* =================================================================== */
import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search, MapPin, Plus, Home, BarChart3, Bookmark, User, Target, Trophy,
    Star, X, LogOut, Bell, ChevronRight, Megaphone, MessageSquare, Smartphone, Monitor,
    TrendingUp, Phone, BadgeCheck, Pencil, Settings, Moon, Sun,
    Sparkles, Asterisk, Flame, CheckCircle2, Hourglass, Hand, SearchX, Medal, FolderOpen, AlertTriangle
} from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid
} from "recharts";
import {
    catOf, GROUPS, CATS, CHART_COLORS, LOGO, LOGO_white,
    INK, MUTED, SOFT, BG, BLUE, BLUE2, BLUE_DK, GREEN, GREEN_DK, YELLOW,
    GOOGLE_MAPS_API_KEY, GOOGLE_CLIENT_ID
} from "./constants";
import { jwtDecode } from "./utils";
import { DB } from "./db";
import { Overlay, Chip, Field, HistoryList, GoogleIcon } from "./components/common";
import { LocationPicker } from "./components/LocationPicker";
import { ActivityCard } from "./components/ActivityCard";
import { ChatRoom } from "./components/ChatRoom";
import { PhoneVerifyModal } from "./components/PhoneVerifyModal";
import { PeerRateModal } from "./components/PeerRateModal";
import { ManageActivityModal } from "./components/ManageActivityModal";
import { ProfileEditModal } from "./components/ProfileEditModal";
import { RouletteModal } from "./components/RouletteModal";
import { TimePicker } from "./components/TimePicker";
import { AdminPanel } from "./components/AdminPanel";

/* toast 自動隱藏計時器（模組層級） */
let toastTimerId = null;

export default function App() {
    const [view, setView] = useState("mobile");        // mobile | desktop
    const [theme, setTheme] = useState(() => {         // light | dark（深色模式）
        try { return localStorage.getItem("jiu_theme") || "light"; } catch { return "light"; }
    });
    useEffect(() => { try { localStorage.setItem("jiu_theme", theme); } catch { /* 隱私模式略過 */ } }, [theme]);
    const [screen, setScreen] = useState("login");     // login|register|home|stats|mine|profile
    const [version, setVersion] = useState(0);
    const bump = () => setVersion((v) => v + 1);
    const [me, setMe] = useState(null);                // user id
    const [toast, setToast] = useState("");
    const [gmReady, setGmReady] = useState(() => !!(GOOGLE_MAPS_API_KEY && window.google?.maps)); // 已載入則直接視為就緒
    const [gsiReady, setGsiReady] = useState(false);

    // 效能優化：以 useMemo 快取衍生資料，僅在登入者或資料版本變動時重算
    const meUser = useMemo(() => (me ? { ...DB.userById(me), history: DB.historyOf(me) } : null), [me, version]);
    const activities = useMemo(() => DB.activitiesView(me), [me, version]); // 由資料庫即時推導（含 myStatus / hostBy）

    const showToast = (m) => { setToast(m); clearTimeout(toastTimerId); toastTimerId = setTimeout(() => setToast(""), 1900); };

    // Google 登入憑證處理（宣告於 GSI useEffect 之前，避免暫時性死區）
    const handleGoogleCredential = (resp) => {
        const p = jwtDecode(resp.credential);
        const u = DB.loginGoogle({ sub: p.sub, email: p.email, name: p.name, picture: p.picture });
        setMe(u.id); setScreen("home"); bump(); showToast(`Google 登入成功：${u.name}`);
    };

    // 效能優化：字型改於 index.html 以 <link rel="preconnect"> 預載、
    // 動畫 keyframes 移至 index.css 靜態載入，移除原本的 JS 動態插入。

    // 從資料庫載入持久化資料
    useEffect(() => { (async () => { await DB.load(); bump(); })(); }, []);

    // 載入 Google 登入（有 Client ID 才載）
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        const init = () => {
            try {
                window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
                setGsiReady(true);
            } catch { /* GSI 初始化失敗時略過 */ }
        };
        if (window.google?.accounts?.id) { init(); return; }
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true; s.defer = true; s.onload = init;
        document.head.appendChild(s);
    }, []);

    // 載入 Google Maps（有金鑰才載；已就緒則不重複載入）
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY || gmReady) return;
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=zh-TW`;
        s.async = true; s.onload = () => setGmReady(true);
        document.head.appendChild(s);
    }, [gmReady]);

    /* ---------- 表單 / 彈窗狀態 ---------- */
    const [grp, setGrp] = useState("all");   // 大分類（運動/桌遊電玩/影音娛樂/飯局）
    const [tab, setTab] = useState("all");   // 子分類（籃球、桌遊…）
    const [q, setQ] = useState("");
    const [mineFilter, setMineFilter] = useState("hosted");
    const [joinTarget, setJoinTarget] = useState(null);
    const [rateTarget, setRateTarget] = useState(null);
    const [rating, setRating] = useState(0);
    const [reviewActId, setReviewActId] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [locOpen, setLocOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState(null);   // 活動聊天室
    const [phoneOpen, setPhoneOpen] = useState(false);     // 手機認證彈窗
    const [verifyPromptOpen, setVerifyPromptOpen] = useState(false); // 發起活動前的電話認證提示窗
    const [endTarget, setEndTarget] = useState(null);      // 結束活動確認
    const [peerTarget, setPeerTarget] = useState(null);    // 成員互評彈窗
    const [manageTarget, setManageTarget] = useState(null); // 活動管理彈窗
    const [editProfileOpen, setEditProfileOpen] = useState(false); // 編輯個人資料
    const [rouletteOpen, setRouletteOpen] = useState(false); // 活動轉盤
    const [historyOpen, setHistoryOpen] = useState(false);   // 全部歷史紀錄彈窗
    const blank = { cat: "basketball", title: "", start: "", end: "", location: "", lat: null, lng: null, cap: 8, note: "" };
    const [form, setForm] = useState(blank);

    /* ---------- 登入 / 註冊 ---------- */
    const [authMode, setAuthMode] = useState("login");   // login | register
    const [loginForm, setLoginForm] = useState({ account: "", password: "" });
    const [regForm, setRegForm] = useState({ account: "", password: "", confirm: "", name: "" });

    const doLogin = () => {
        const u = DB.auth(loginForm.account, loginForm.password);
        if (!u) return showToast("帳號或密碼錯誤，請再試一次");
        if (u.status === "suspended") return showToast("此帳號已被停權，請聯繫管理員");
        setMe(u.id); bump();
        // 管理員登入後導向後台
        if (u.role === "admin") { setScreen("admin"); showToast(`管理員 ${u.name} 已登入後台`); }
        else { setScreen("home"); showToast(`歡迎回來，${u.name}！`); }
    };
    const doRegister = () => {
        const { account, password, confirm, name } = regForm;
        if (!account.trim() || !password || !name.trim()) return showToast("請完整填寫所有欄位");
        if (password.length < 4) return showToast("密碼至少需 4 碼");
        if (password !== confirm) return showToast("兩次密碼不一致");
        const r = DB.createUser({ account, password, name });
        if (r.error) return showToast(r.error);
        setMe(r.user.id); setScreen("home"); bump(); showToast("註冊成功，已自動登入！");
    };
    const googleLogin = () => {
        if (GOOGLE_CLIENT_ID && gsiReady && window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        } else {
            // 示範模式：未設定 Client ID 時模擬 Google 登入
            const u = DB.loginGoogle({ sub: "demo-google", email: "google.user@gmail.com", name: "Google 使用者", picture: null });
            setMe(u.id); setScreen("home"); bump(); showToast("已使用 Google 登入（示範模式）");
        }
    };
    const logout = () => { setMe(null); setScreen("login"); setAuthMode("login"); setLoginForm({ account: "", password: "" }); };


    /* ---------- 參與流程 ---------- */
    const applyJoin = (id) => {
        DB.apply(me, id); bump();
        showToast("報名已送出，等待開團者審核…");
        setTimeout(() => { DB.setStatus(me, id, "approved"); bump(); showToast("開團者已通過你的報名！"); }, 2200);
    };
    const confirmJoin = () => {
        const id = joinTarget.id; setJoinTarget(null);
        applyJoin(id);
    };
    const submitRate = (n) => {
        setRating(n);
        const t = rateTarget;
        setTimeout(() => {
            setRateTarget(null); setRating(0);
            if (t) DB.rate(me, t.id, n);
            bump();
            showToast(`已記錄 ${n} 顆星活動評分，感謝你的回饋！`);
        }, 400);
    };

    /* ---------- 結束活動 ---------- */
    const confirmEnd = () => {
        const id = endTarget.id; setEndTarget(null);
        DB.endActivity(id); bump();
        showToast("活動已結束，開放成員互相評分");
    };

    /* ---------- 開團 ---------- */
    const openCreate = () => {
        // 發起活動前必須完成手機號碼認證，未認證則跳出提示窗
        if (!meUser?.phoneVerified) { setVerifyPromptOpen(true); return; }
        setForm(blank); setCreateOpen(true);
    };
    const submitCreate = () => {
        if (!meUser?.phoneVerified) { setCreateOpen(false); setVerifyPromptOpen(true); return; }
        if (!form.title.trim()) return showToast("請輸入活動名稱");
        if (!form.start) return showToast("請選擇開始時間");
        DB.createActivity(me, form);
        setCreateOpen(false); setScreen("home"); setTab("all"); setQ(""); bump();
        showToast("活動已建立，已更新到主頁！");
    };

    /* ---------- 篩選資料（useMemo 避免每次 render 重複過濾） ---------- */
    const homeList = useMemo(
        () => activities.filter((a) =>
            (grp === "all" || catOf(a.cat).group === grp) &&
            (tab === "all" || a.cat === tab) &&
            (!q || a.title.includes(q) || (a.note || "").includes(q) || (a.location || "").includes(q))),
        [activities, grp, tab, q]
    );
    const mineList = useMemo(
        () => activities.filter((a) =>
            mineFilter === "hosted" ? a.hostBy === me :
                mineFilter === "pending" ? a.myStatus === "pending" :
                    mineFilter === "rated" ? a.myStatus === "joined" && a.rated :
                        a.myStatus === "joined" && !a.rated   // 已成功參與（尚未評分）
        ),
        [activities, mineFilter, me]
    );
    // 活動轉盤可抽選的池：非自己發起、尚未報名、未額滿、未結束
    const joinablePool = useMemo(
        () => activities.filter((a) => a.hostBy !== me && !a.myStatus && !a.full && !a.ended),
        [activities, me]
    );

    // 效能優化：handler 以 useCallback 固定參考，讓 React.memo 的 ActivityCard 不會無謂重繪
    const onReview = useCallback((a) => setReviewActId(a.id), [setReviewActId]);
    const cardProps = { me, onJoin: setJoinTarget, onReview, onRate: setRateTarget, onChat: setChatTarget, onEnd: setEndTarget, onRatePeers: setPeerTarget };

    /* =============================================================== */
    /*  畫面區塊（render functions，桌機/手機共用）                      */
    /* =============================================================== */
    const NAV = [
        { id: "home", label: "首頁", icon: Home },
        { id: "stats", label: "我的戰績", icon: BarChart3 },
        { id: "mine", label: "我的活動", icon: Bookmark },
        { id: "profile", label: "個人設定", icon: User },
    ];

    function searchTabs() {
        return (
            <div className="mt-3 mb-5">
                <div className="flex items-center gap-3 bg-white rounded-3xl px-5 py-3.5 shadow " >
                    <Search size={20} style={{ color: MUTED }} />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋想去的活動！" className="flex-1 bg-transparent outline-none text-base" style={{ color: INK }} />
                    {/* UI/UX：搜尋有字時提供一鍵清除 */}
                    {q && <button onClick={() => setQ("")} aria-label="清除搜尋" className="shrink-0 rounded-full p-1" style={{ color: MUTED, background: "#f0f2f6" }}><X size={16} /></button>}
                </div>
                {/* 第一層：大分類 */}
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    <Chip active={grp === "all"} onClick={() => { setGrp("all"); setTab("all"); }} label="全部" icon={<Sparkles size={15} />} />
                    {GROUPS.map((g) => <Chip key={g.id} active={grp === g.id} onClick={() => { setGrp(g.id); setTab("all"); }} label={g.label} icon={g.icon} />)}
                </div>
                {/* 第二層：所選大分類下的子分類 */}
                {grp !== "all" && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", animation: "pop .25s ease" }}>
                        <Chip active={tab === "all"} onClick={() => setTab("all")} label={`全部${GROUPS.find((g) => g.id === grp)?.label}`} icon={<Asterisk size={15} />} />
                        {CATS.filter((c) => c.group === grp).map((c) => <Chip key={c.id} active={tab === c.id} onClick={() => setTab(c.id)} label={c.label} icon={c.icon} />)}
                    </div>
                )}
            </div>
        );
    }

    function renderHome(desktop) {
        // 主頁儀表板資料
        const myJoined = activities.filter((a) => a.myStatus === "joined").length;
        const myPending = activities.filter((a) => a.myStatus === "pending").length;
        const myHosted = activities.filter((a) => a.hostBy === me).length;
        const catCount = {};
        activities.forEach((a) => { catCount[a.cat] = (catCount[a.cat] || 0) + 1; });
        const hotCats = Object.entries(catCount).map(([id, v]) => ({ name: catOf(id).label, value: v }))
            .sort((a, b) => b.value - a.value).slice(0, 6);
        const dashTiles = [
            [Flame, activities.length, "可參加活動"],
            [CheckCircle2, myJoined, "已參與"],
            [Hourglass, myPending, "審核中"],
            [Megaphone, myHosted, "我發起"],
        ];
        return (
            <div>
                {!desktop && (
                    <div className="flex items-center justify-between px-1 pt-3 pb-2">
                        <h2 className="text-2xl font-extrabold  ml-2 " style={{ background: `linear-gradient(135deg, ${BLUE2}, ${BLUE_DK})`, WebkitBackgroundClip: "text", color: "transparent" }}>揪是要聚</h2>
                        {/* <img src={LOGO} alt="logo" style={{ width: 54, height: 54, borderRadius: "24%", objectFit: "cover" }} /> */}
                        <button onClick={() => setScreen("profile")} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow font-extrabold" style={{ color: BLUE }}>
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm overflow-hidden" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{meUser?.avatar ? <img src={meUser.avatar} alt="" className="w-full h-full object-cover" /> : meUser?.name?.[0]}</span>
                            {meUser?.name}
                        </button>
                    </div>
                )}

                {/* ===== 搜尋欄位 ===== */}
                {searchTabs()}


                {/* ===== 活動轉盤入口 ===== */}
                <button onClick={() => setRouletteOpen(true)}
                    className="w-full rounded-3xl p-4 mb-4 flex items-center gap-3 shadow-sm text-left"
                    style={{ background: "linear-gradient(135deg,#fff4e0,#ffe9c7)", border: "1.5px solid #f3d6a6" }}>
                    <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#fff", color: "#d8862a", boxShadow: "0 2px 8px rgba(216,134,42,.25)" }}><Target size={26} /></span>
                    <div className="flex-1 min-w-0">
                        <div className="font-extrabold" style={{ color: "#a4631a" }}>揪是要轉！</div>
                        <div className="text-sm" style={{ color: "#c08334" }}>從 {joinablePool.length} 個活動隨機抽一個給你</div>
                    </div>
                    <span className="px-4 py-2 rounded-2xl font-extrabold text-white text-sm shrink-0" style={{ background: "linear-gradient(180deg,#f2a64e,#d8862a)" }}>開始轉盤</span>
                </button>
                {/* ===== 主頁儀表板：我的概覽 ===== */}
                <div className={desktop ? "grid grid-cols-3 gap-4 mb-5" : "space-y-3 mb-4"}>
                    <div className={(desktop ? "col-span-2 " : " ") + "rounded-3xl p-5 text-white shadow-lg"} style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}>
                        <div className="font-bold opacity-90 flex items-center gap-1.5">哈囉，{meUser?.name}<Hand size={16} /></div>
                        <div className="text-lg font-extrabold mb-3">今天想揪點什麼？</div>
                        <div className="grid grid-cols-4 gap-2">
                            {dashTiles.map((t, i) => {
                                const TileIcon = t[0];
                                return (
                                    <div key={i} className="rounded-2xl py-3 text-center" style={{ background: "rgba(255,255,255,.18)" }}>
                                        <TileIcon size={18} className="mx-auto mb-1 opacity-90" />
                                        <div style={{ fontFamily: "'Baloo 2'", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{t[1]}</div>
                                        <div className="text-[11px] opacity-90 mt-0.5">{t[2]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={!desktop ? "hidden" : "bg-white rounded-3xl p-4 shadow-sm"}>
                        <div className="font-extrabold mb-1 flex items-center gap-1.5" style={{ color: INK }}><TrendingUp size={17} style={{ color: BLUE }} />熱門活動類別</div>
                        <div style={{ width: "100%", height: desktop ? 150 : 132 }}>
                            <ResponsiveContainer>
                                <BarChart data={hotCats} layout="vertical" margin={{ left: 6, right: 14, top: 4, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={42} tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: "var(--field)" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={14}>
                                        {hotCats.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== 活動列表：發起者視角分成「我發起的」與「可參與的」 ===== */}
                {(() => {
                    // <div className="mt-4 h-auto flex self-center justify-center items-center flex-wrap gap-5">
                    const gridCls = desktop ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" : "space-y-4";
                    // const gridCls = desktop ? "mt-4 h-auto flex self-center justify-center items-center flex-wrap gap-5" : "space-y-4";
                    const hostedList = homeList.filter((a) => a.hostBy === me);
                    const joinList = homeList.filter((a) => a.hostBy !== me);
                    const empty = (
                        <div className="text-center py-16 font-bold" style={{ color: MUTED }}><SearchX size={48} className="mx-auto mb-2" />找不到符合的活動</div>
                    );
                    const sectionTitle = (icon, text, count) => (
                        <div className="flex items-center gap-2 mt-5 mb-3 px-1">
                            <span className="text-lg">{icon}</span>
                            <span className="text-lg font-extrabold" style={{ color: INK }}>{text}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: SOFT, color: BLUE_DK }}>{count}</span>
                        </div>
                    );
                    if (!hostedList.length) {
                        return <div className={gridCls + " mt-4"}>{homeList.length ? homeList.map((a, i) => <ActivityCard key={a.id} a={a} delay={i * 0.04} {...cardProps} />) : empty}</div>;
                    }
                    return (
                        <>
                            {sectionTitle(<Megaphone size={18} style={{ color: BLUE_DK }} />, "我發起的活動", hostedList.length)}
                            <div className={gridCls}>{hostedList.map((a, i) => <ActivityCard key={a.id} a={a} delay={i * 0.04} {...cardProps} onManage={setManageTarget} />)}</div>
                            {sectionTitle(<Sparkles size={18} style={{ color: BLUE_DK }} />, "可參與的活動", joinList.length)}
                            <div className={gridCls}>{joinList.length ? joinList.map((a, i) => <ActivityCard key={a.id} a={a} delay={i * 0.04} {...cardProps} />) : empty}</div>
                        </>
                    );
                })()}
            </div>
        );
    }

    function renderStats(desktop) {
        const rep = meUser?.rep ?? 90;
        const hist = meUser?.history || [];
        const total = hist.length;
        const avg = total ? (hist.reduce((s, h) => s + h.stars, 0) / total) : 0;
        const hosted = activities.filter((a) => a.hostBy === me).length;
        const five = hist.filter((h) => h.stars === 5).length;

        // 評分分佈
        const starDist = [5, 4, 3, 2, 1].map((s) => ({ name: `${s}★`, count: hist.filter((h) => h.stars === s).length, star: s }));
        // 類別佔比：取場次數前五高的類別（由高到低排序）
        const catMap = {};
        hist.forEach((h) => { catMap[h.cat] = (catMap[h.cat] || 0) + 1; });
        const catData = Object.entries(catMap)
            .map(([id, v]) => ({ name: catOf(id).label, value: v }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        // 評分趨勢（依日期由舊到新）
        const trend = [...hist].sort((a, b) => a.date.localeCompare(b.date)).map((h) => ({ date: h.date.slice(5), stars: h.stars }));

        const boxes = [
            [Target, total, "完成場次", "#e8f1fb", BLUE],
            [Megaphone, hosted, "開團場次", "#e7f7ee", GREEN_DK],
            [Star, total ? avg.toFixed(1) : "—", "平均評分", "#fde9ef", "#d05a78"],
            [Trophy, five, "五星好評", "#fff4e0", "#d8862a"],
        ];

        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-extrabold pt-3" style={{ color: INK }}>我的戰績分析</h2>

                {/* Hero */}
                <div className="rounded-3xl p-6 text-white flex items-center justify-between shadow-lg mt-5" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}>
                    <div><div style={{ fontFamily: "'Baloo 2'", fontSize: 46, fontWeight: 800, lineHeight: 1 }}>{total + hosted}</div><div className="font-bold opacity-90 mt-1">累積揪團場次</div></div>
                    <div className="rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,.22)" }}><Medal size={30} className="mx-auto" /><div className="text-sm mt-1">優良揪友</div></div>
                </div>

                {/* 四宮格 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {boxes.map((s, i) => {
                        const IndirectList = s[0];
                        return (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 text-" style={{ background: s[3] }}><IndirectList size={20} /></div>
                                <div style={{ fontFamily: "'Baloo 2'", fontSize: 28, fontWeight: 800, color: INK }}>{s[1]}</div>
                                <div className="font-bold text-sm" style={{ color: MUTED }}>{s[2]}</div>
                            </div>
                        )
                    })}
                </div>

                {/* 圖表區 */}
                <div className={desktop ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                    {/* 評分分佈 */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="font-extrabold mb-3 flex items-center gap-1.5" style={{ color: INK }}><Star size={17} style={{ color: "#ffc23d" }} fill="#ffc23d" />評分分佈</div>
                        <div style={{ width: "100%", height: 170 }}>
                            <ResponsiveContainer>
                                <BarChart data={starDist} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: "var(--field)" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={26}>
                                        {starDist.map((e, i) => <Cell key={i} fill={e.star >= 4 ? GREEN : e.star === 3 ? YELLOW : "#e08a8a"} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 類別佔比 */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="font-extrabold mb-3 flex items-center gap-1.5" style={{ color: INK }}><BarChart3 size={17} style={{ color: BLUE }} />活動類別佔比{catData.length >= 5 ? "（前五名）" : `（前 ${catData.length} 名）`}</div>
                        {total ? (
                            <div className="flex items-center">
                                <div style={{ width: 150, height: 150 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={66} paddingAngle={2}>
                                                {catData.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-1.5 pl-2">
                                    {catData.map((e, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm font-bold" style={{ color: INK }}>
                                            <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            {e.name}<span className="ml-auto" style={{ color: MUTED }}>{e.value} 場</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <div className="text-center py-10 font-bold" style={{ color: MUTED }}>尚無資料</div>}
                    </div>

                    {/* 評分趨勢 */}
                    <div className={"bg-white rounded-3xl p-5 shadow-sm" + (desktop ? " col-span-2" : "")}>
                        <div className="font-extrabold mb-3 flex items-center gap-1.5" style={{ color: INK }}><TrendingUp size={17} style={{ color: GREEN_DK }} />評分趨勢</div>
                        {trend.length ? (
                            <div style={{ width: "100%", height: 180 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={trend} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                                        <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity={0.5} /><stop offset="100%" stopColor={GREEN} stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                        <Area type="monotone" dataKey="stars" stroke={GREEN_DK} strokeWidth={3} fill="url(#g1)" dot={{ r: 4, fill: GREEN_DK }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <div className="text-center py-10 font-bold" style={{ color: MUTED }}>完成活動評分後即可看到趨勢</div>}
                    </div>
                </div>

                {/* 信譽積分 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="font-extrabold mb-3" style={{ color: INK }}>信譽積分</div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: `${rep}%`, background: `linear-gradient(90deg,#5cd089,${GREEN})` }}>{rep}</div>
                    </div>
                    <div className="text-sm mt-3 font-semibold flex items-center flex-wrap gap-x-1" style={{ color: MUTED }}><span className="inline-flex items-center gap-0.5">距離「鑽石揪友<Trophy size={13} />」還差</span><b style={{ color: GREEN_DK }}>{100 - rep}</b>分，準時出席就能加分！</div>
                </div>
            </div>
        );
    }

    function renderMine(desktop) {
        const filters = [["hosted", "發起活動"], ["pending", "審核中"], ["joined", "已成功參與"], ["rated", "評分完畢"]];
        return (
            <div className="h-full">
                <h2 className="text-2xl font-extrabold pt-3 pb-1" style={{ color: INK }}>我的活動</h2>
                <p className="text-sm pb-3 flex items-center gap-1" style={{ color: MUTED }}><Settings size={14} />點擊任一活動卡片，即可查看參與者並進行審核管理</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {filters.map(([id, label]) => (
                        <button key={id} onClick={() => setMineFilter(id)} className="shrink-0 px-4 py-2.5 rounded-2xl font-bold text-[15px] shadow-sm transition"
                            style={mineFilter === id ? { background: `linear-gradient(180deg,${BLUE2},${BLUE})`, color: "#fff" } : { background: "var(--surface)", color: MUTED }}>{label}</button>
                    ))}
                </div>
                <div className={desktop ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-4" : "space-y-4 mt-4"}>
                    {mineList.length ? mineList.map((a, i) => <ActivityCard key={a.id} a={a} delay={i * 0.04} {...cardProps} onManage={setManageTarget} />) :
                        <div className="text-center py-16 font-bold" style={{ color: MUTED }}>
                            {(() => { const EmptyIcon = mineFilter === "hosted" ? Megaphone : mineFilter === "pending" ? Hourglass : mineFilter === "rated" ? Star : FolderOpen; return <EmptyIcon size={48} className="mx-auto mb-2" />; })()}
                            {mineFilter === "hosted" ? "還沒有開團，按「開揪！」來揪人" : mineFilter === "pending" ? "目前沒有審核中的報名" : mineFilter === "rated" ? "還沒有評分完畢的活動" : "尚未成功參與任何活動"}
                        </div>}
                </div>
            </div>
        );
    }

    function renderProfile(desktop) {
        const rep = meUser?.rep ?? 90;
        const dem = Math.round(meUser?.demerit || 0);

        // 頭像（顯示上傳的照片，未設定時顯示暱稱字首）
        const avatarEl = (
            <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-3xl font-extrabold overflow-hidden" style={{ background: "rgba(255,255,255,.25)" }}>
                {meUser?.avatar ? <img src={meUser.avatar} alt="" className="w-full h-full object-cover" /> : (meUser?.name?.[0] || <User size={40} />)}
            </div>
        );

        const headerCard = (
            <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: `linear-gradient(150deg,${BLUE2},${BLUE_DK})` }}>
                <div className="flex items-center gap-4">
                    {avatarEl}
                    <div className="flex-1 min-w-0">
                        <div className="text-2xl font-extrabold flex items-center gap-1.5">
                            <span className="truncate">{meUser?.name}</span>
                            {meUser?.phoneVerified && <BadgeCheck size={22} style={{ color: "#9ff0bd" }} title="已完成手機認證" />}
                        </div>
                        <div className="opacity-85 text-sm mt-1 line-clamp-2">{meUser?.bio || "愛好打球、休閒娛樂等…"}</div>
                    </div>
                </div>
                <button onClick={() => setEditProfileOpen(true)} className="w-full mt-4 py-2.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-1.5" style={{ background: "rgba(255,255,255,.22)", color: "#fff" }}>
                    <Pencil size={16} />編輯個人資料
                </button>
            </div>
        );

        const phoneCard = (
            <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={meUser?.phoneVerified ? { background: "#e7f7ee", color: GREEN_DK } : { background: "#fff4e0", color: "#d8862a" }}>
                    <Phone size={22} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-extrabold flex items-center gap-1.5" style={{ color: INK }}>
                        本人認證
                        {meUser?.phoneVerified && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white inline-flex items-center gap-0.5" style={{ background: GREEN }}><BadgeCheck size={12} />已認證</span>}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: MUTED }}>
                        {meUser?.phoneVerified ? `${meUser.phone}（手機號碼已驗證）` : "尚未認證手機號碼，完成認證可提升信任度"}
                    </div>
                </div>
                {meUser?.phoneVerified ? (
                    <button onClick={() => setPhoneOpen(true)} className="px-4 py-2 rounded-2xl font-bold text-sm shrink-0" style={{ background: "var(--field)", color: MUTED }}>變更號碼</button>
                ) : (
                    <button onClick={() => setPhoneOpen(true)} className="px-4 py-2 rounded-2xl font-extrabold text-sm text-white shadow shrink-0" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>立即認證</button>
                )}
            </div>
        );

        const repCard = (
            <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-5">
                <div className="w-[92px] h-[92px] rounded-full flex items-center justify-center shrink-0" style={{ background: `conic-gradient(${GREEN} ${rep}%, #eaeef3 0)` }}>
                    <div className="w-[74px] h-[74px] rounded-full bg-white flex flex-col items-center justify-center">
                        <span style={{ fontFamily: "'Baloo 2'", fontSize: 26, fontWeight: 800, color: GREEN_DK }}>{rep}</span>
                        <span className="text-[11px] font-bold" style={{ color: MUTED }}>信譽積分</span>
                    </div>
                </div>
                <div><div className="font-extrabold flex items-center gap-1" style={{ color: INK }}>優良揪友<Medal size={16} style={{ color: YELLOW }} /></div><div className="text-sm mt-1 leading-relaxed" style={{ color: MUTED }}>準時出席、不放鳥能累積信譽分數，分數越高越容易通過開團者審核。</div></div>
            </div>
        );

        const demCard = (
            <div className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold flex items-center gap-1.5" style={{ color: INK }}><AlertTriangle size={16} style={{ color: "#d8862a" }} />扣分進度條</span>
                    <span className="text-sm font-bold" style={{ color: dem >= 60 ? "#d8862a" : MUTED }}>{dem} / 100</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${dem}%`, background: dem >= 60 ? "linear-gradient(90deg,#f2a64e,#e0607a)" : `linear-gradient(90deg,${BLUE2},${BLUE})`, transition: "width .4s ease" }} />
                </div>
                <div className="text-sm mt-2 leading-relaxed" style={{ color: MUTED }}>累積他人的負面評價（1～2 星）。進度條每滿 100 會扣除 10 點信譽積分並歸零，保持良好表現即可遠離扣分。</div>
            </div>
        );

        const histCount = meUser?.history?.length || 0;
        const historyCard = (
            <div className={"bg-white rounded-3xl p-5 shadow-sm flex flex-col" + (desktop ? " flex-1 min-h-0" : "")}>
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <span className="font-extrabold flex items-center gap-1.5" style={{ color: INK }}><Star size={18} style={{ color: "#ffc23d" }} fill="#ffc23d" />歷史紀錄</span>
                    <span className="text-sm font-bold" style={{ color: MUTED }}>共 {histCount} 場</span>
                </div>
                <div className={"overflow-y-auto -mr-2 pr-2" + (desktop ? " flex-1 min-h-0" : "")} style={!desktop ? { maxHeight: 320 } : undefined}>
                    <HistoryList items={meUser?.history} />
                </div>
                {histCount > 0 && (
                    <button onClick={() => setHistoryOpen(true)} className="mt-3 shrink-0 w-full py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-1" style={{ background: "var(--field)", color: BLUE_DK }}>
                        查看全部歷史紀錄<ChevronRight size={16} />
                    </button>
                )}
            </div>
        );

        const dark = theme === "dark";
        const themeCard = (
            <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={dark ? { background: "#23344a", color: "#9ff0bd" } : { background: "#fff4e0", color: "#d8862a" }}>
                    {dark ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-extrabold" style={{ color: INK }}>深色模式</div>
                    <div className="text-sm mt-0.5" style={{ color: MUTED }}>{dark ? "已開啟，享受護眼的深色介面" : "切換為深色佈景，夜間使用更舒適"}</div>
                </div>
                <button onClick={() => setTheme(dark ? "light" : "dark")} role="switch" aria-checked={dark} aria-label="切換深色模式"
                    className="relative shrink-0 rounded-full transition" style={{ width: 52, height: 30, background: dark ? BLUE : "#cfd6df" }}>
                    <span className="absolute top-1 rounded-full bg-white shadow flex items-center justify-center transition-all" style={{ width: 22, height: 22, left: dark ? 26 : 4 }}>
                        {dark ? <Moon size={12} style={{ color: BLUE }} /> : <Sun size={12} style={{ color: "#d8862a" }} />}
                    </span>
                </button>
            </div>
        );
        const menuCard = (
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                {[[User, "編輯個人資料", () => setEditProfileOpen(true)], [Bell, "通知設定", () => showToast("通知設定")], [Bookmark, "我的揪團紀錄", () => setScreen("mine")]].map(([Icon, label, fn], i) => (
                    <button key={i} onClick={fn} className="w-full flex items-center gap-3 px-5 py-4 border-b font-bold" style={{ color: INK, borderColor: "var(--border)" }}>
                        <Icon size={20} style={{ color: BLUE }} />{label}<ChevronRight size={18} className="ml-auto" style={{ color: "#c5cbd2" }} />
                    </button>
                ))}
                <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-4 font-bold justify-center" style={{ color: "#e0607a" }}><LogOut size={20} />登出</button>
            </div>
        );

        // 電腦版：雙欄版面（左欄個人資訊／認證／選單，右欄信譽相關與歷史）
        if (desktop) {
            return (
                // <div className="pt-3 pb-8">
                //     <h2 className="text-2xl font-extrabold pb-4" style={{ color: INK }}>個人設定</h2>
                //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                //         <div className="lg:col-span-1 space-y-5">
                //             {headerCard}
                //             {phoneCard}
                //             {menuCard}
                //         </div>
                //         <div className="lg:col-span-2 space-y-5">
                //             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                //                 {repCard}
                //                 {demCard}
                //             </div>
                //             {historyCard}
                //         </div>
                //     </div>
                // </div>
                <div className="pt-3 pb-8">
                    <h2 className="text-2xl font-extrabold pb-4" style={{ color: INK }}>個人設定</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                        <div className="lg:col-span-1 flex flex-col gap-5 min-h-0">
                            {headerCard}
                            {historyCard}
                        </div>
                        <div className="lg:col-span-2 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {repCard}
                                {demCard}
                            </div>

                            {phoneCard}
                            {themeCard}
                            {menuCard}
                        </div>
                    </div>
                </div>
            );
        }

        // 手機版：單欄
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-extrabold pt-3 pb-3" style={{ color: INK }}>個人設定</h2>
                {headerCard}
                {phoneCard}
                {repCard}
                {demCard}
                {historyCard}
                {themeCard}
                {menuCard}
            </div>
        );
    }

    function renderActive(desktop) {
        if (screen === "home") return renderHome(desktop);
        if (screen === "stats") return renderStats(desktop);
        if (screen === "mine") return renderMine(desktop);
        if (screen === "profile") return renderProfile(desktop);
        return null;
    }

    /* ---------- 登入 / 註冊畫面 ---------- */
    function renderAuth() {
        const reg = authMode === "register";
        const seg = (id, label) => (
            <button onClick={() => setAuthMode(id)} className="flex-1 py-2.5 rounded-2xl font-extrabold transition" style={authMode === id ? { background: "var(--surface)", color: BLUE_DK, boxShadow: "0 4px 12px rgba(60,90,140,.12)" } : { color: MUTED }}>{label}</button>
        );
        return (
            <div className="w-full flex items-center justify-center p-5" style={{ minHeight: 520 }}>
                <div className="w-full p-7 shadow-xl" style={{ maxWidth: 348, borderRadius: 28, background: "rgba(255,255,255,.72)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.85)" }}>
                    <img src={LOGO} alt="logo" style={{ width: 84, height: 84, borderRadius: "24%", objectFit: "cover", margin: "auto", display: "block" }} />
                    <div className="text-center text-2xl font-extrabold" style={{ color: INK }}>揪是要聚</div>
                    <div className="text-center text-sm mb-5" style={{ color: MUTED }}>揪團、揪咖，揪是要聚！</div>

                    {/* 登入 / 註冊 切換 */}
                    <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "#e9eef4" }}>
                        {seg("login", "登入")}
                        {seg("register", "註冊")}
                    </div>

                    {reg ? (
                        <>
                            <Field placeholder="暱稱" value={regForm.name} onChange={(v) => setRegForm({ ...regForm, name: v })} />
                            <Field placeholder="帳號" value={regForm.account} onChange={(v) => setRegForm({ ...regForm, account: v })} />
                            <Field placeholder="密碼（至少 4 碼）" type="password" value={regForm.password} onChange={(v) => setRegForm({ ...regForm, password: v })} />
                            <Field placeholder="確認密碼" type="password" value={regForm.confirm} onChange={(v) => setRegForm({ ...regForm, confirm: v })} />
                            <button onClick={doRegister} className="w-full py-2 rounded-2xl text-white font-extrabold text-lg mt-1 shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>註 冊</button>
                        </>
                    ) : (
                        <>
                            <Field placeholder="帳號" value={loginForm.account} onChange={(v) => setLoginForm({ ...loginForm, account: v })} />
                            <Field placeholder="密碼" type="password" value={loginForm.password} onChange={(v) => setLoginForm({ ...loginForm, password: v })} />
                            <button onClick={doLogin} className="w-full py-2 rounded-2xl text-white font-extrabold text-lg mt-1 shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>登 入</button>
                            <button onClick={() => showToast("已寄出重設密碼信件")} className="w-full text-center mt-3 font-bold text-sm tracking-wide" style={{ color: MUTED }}>忘記密碼？</button>
                        </>
                    )}

                    {/* 分隔線 */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px" style={{ background: "#d7dde5" }} />
                        <span className="text-sm font-bold" style={{ color: MUTED }}>或</span>
                        <div className="flex-1 h-px" style={{ background: "#d7dde5" }} />
                    </div>

                    {/* Google 登入 */}
                    <button onClick={googleLogin} className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2.5 bg-white" style={{ color: "#3c4043", boxShadow: "0 2px 10px rgba(60,90,140,.12)", border: "1px solid #e3e7ee" }}>
                        <GoogleIcon size={20} />使用 Google 帳號{reg ? "註冊" : "登入"}
                    </button>

                    {/* <div className="text-center text-xs mt-4" style={{ color: MUTED }}>
                        測試帳號 <b>demo</b> ｜ 密碼 <b>1234</b>
                        <span className="block mt-1">管理員 <b>admin</b> ｜ 密碼 <b>admin123</b></span>
                    </div> */}
                </div>
            </div>
        );
    }

    /* ---------- 底部導覽（手機）/ 中央開揪鈕 ---------- */
    function bottomNav() {
        return (
            <div className="relative bg-white border-t flex px-2 pt-2.5 pb-6" style={{ borderColor: "#e7eaef", boxShadow: "0 -6px 20px rgba(60,90,140,.06)" }}>
                {NAV.slice(0, 2).map((n) => navItem(n))}
                <div className="flex-1 flex flex-col items-center justify-end relative">
                    <button onClick={openCreate} className="absolute flex items-center justify-center rounded-full text-white shadow-lg" style={{ top: -32, width: 60, height: 60, border: "4px solid #fff", background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}><img src={LOGO_white} alt="logo" style={{ width: 45, height: 45, borderRadius: "24%", objectFit: "cover", color: "white" }} /></button>
                    <span className="font-extrabold text-[12.5px]" style={{ color: BLUE }}>開揪！</span>
                </div>
                {NAV.slice(2).map((n) => navItem(n))}
            </div>
        );
    }
    function navItem(n) {
        const on = screen === n.id; const Icon = n.icon;
        return (
            <button key={n.id} onClick={() => setScreen(n.id)} className="flex-1 flex flex-col items-center gap-1 font-bold text-[12.5px]" style={{ color: on ? BLUE : "#b3b9c1" }}>
                <Icon size={24} />{n.label}
            </button>
        );
    }

    /* ---------- 頂部導覽（桌機）---------- */
    function topNav() {
        return (
            <div className="flex items-center justify-between bg-white rounded-3xl px-5 py-3 shadow mb-6">
                <div className="flex items-center gap-3">
                    <img src={LOGO} alt="logo" style={{ width: 46, height: 46, borderRadius: "24%", objectFit: "cover" }} />
                    <span className="text-xl font-extrabold" style={{ color: INK }}>揪是要聚</span>
                </div>
                <div className="flex items-center gap-1">
                    {NAV.map((n) => {
                        const on = screen === n.id; const Icon = n.icon;
                        return <button key={n.id} onClick={() => setScreen(n.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold transition" style={on ? { background: SOFT, color: BLUE_DK } : { color: MUTED }}><Icon size={18} />{n.label}</button>;
                    })}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openCreate} className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-white font-extrabold shadow" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}><Plus size={18} />開揪！</button>
                    <button onClick={() => setScreen("profile")} className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{meUser?.avatar ? <img src={meUser.avatar} alt="" className="w-full h-full object-cover" /> : meUser?.name?.[0]}</button>
                </div>
            </div>
        );
    }

    /* =============================================================== */
    /*  外層 render                                                     */
    /* =============================================================== */
    // 管理員登入 → 進入管理後台（與一般使用者介面分流）
    if (me && meUser?.role === "admin") {
        return <AdminPanel meUser={meUser} version={version} bump={bump} showToast={showToast} onLogout={logout} toast={toast} />;
    }

    return (
        <div className={"w-full min-h-screen flex flex-col items-center py-6" + (theme === "dark" ? " theme-dark" : "")} style={{ background: "var(--page)", color: INK, fontFamily: "'Noto Sans TC',sans-serif" }}>
            {/* Demo 工具列：切換手機 / 電腦版 */}
            <div className="flex items-center gap-2 mb-5 bg-white rounded-full p-1.5 shadow">
                <button onClick={() => setView("mobile")} className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm" style={view === "mobile" ? { background: BLUE, color: "#fff" } : { color: MUTED }}><Smartphone size={16} />手機版</button>
                <button onClick={() => setView("desktop")} className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm" style={view === "desktop" ? { background: BLUE, color: "#fff" } : { color: MUTED }}><Monitor size={16} />電腦版</button>
            </div>

            {view === "mobile" ? (
                <div style={{ width: "100%", maxWidth: 412 }}>
                    <div className="relative flex flex-col overflow-hidden shadow-2xl pt-5" style={{ height: 788, background: BG, borderRadius: 44, border: "11px solid #14171c" }}>
                        {me ? (
                            <>
                                <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>{renderActive(false)}</div>
                                {bottomNav()}
                            </>
                        ) : (
                            // <div className="flex-1 overflow-y-auto flex justify-center" style={{ background: "linear-gradient(135deg,rgba(122,169,224,.18),rgba(91,145,212,.05))" }}>{renderAuth()}</div>
                            <div className="flex-1 overflow-y-auto flex justify-center">{renderAuth()}</div>
                        )}
                        {/* toast */}
                        {toast && <div className="absolute left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-lg w-max" style={{ bottom: 110, background: "rgba(30,35,44,.92)", animation: "rise .3s" }}>{toast}</div>}
                    </div>
                </div>
            ) : (
                <div className="w-full  max-w-10/12  px-4">
                    {me ? (<>{topNav()}<div>{renderActive(true)}</div></>) : <div className="flex justify-center pt-6">{renderAuth()}</div>}
                    {toast && <div className="fixed left-1/2 -translate-x-1/2 bottom-8 px-6 py-3 rounded-full text-white font-bold shadow-lg z-50" style={{ background: "rgba(30,35,44,.92)" }}>{toast}</div>}
                </div>
            )}

            {/* =================== 共用彈窗 =================== */}
            {/* 參與確認 */}
            {joinTarget && (
                <Overlay>
                    <div className="bg-white rounded-3xl p-7 w-full shadow-2xl" style={{ maxWidth: 360, animation: "rise .3s" }}>
                        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-extrabold" style={{ background: "#cfd4da" }}>?</div>
                        <div className="text-center text-xl font-extrabold my-5" style={{ color: INK }}>確定要參與此活動嗎？</div>
                        <div className="flex gap-4">
                            <button onClick={() => setJoinTarget(null)} className="flex-1 py-3.5 rounded-2xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>取消</button>
                            <button onClick={confirmJoin} className="flex-1 py-3.5 rounded-2xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>確認</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* 評分 */}
            {rateTarget && (
                <Overlay>
                    <div className="bg-white rounded-3xl p-7 w-full shadow-2xl" style={{ maxWidth: 360, animation: "rise .3s" }}>
                        <div className="text-center text-xl font-extrabold mb-4" style={{ color: INK }}>給此次活動評分數吧！</div>
                        <div className="flex justify-center gap-2 mb-5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <button key={i} onClick={() => submitRate(i)}><Star size={42} style={{ color: i <= rating ? "#ffc23d" : "#d7dbe1" }} fill={i <= rating ? "#ffc23d" : "#d7dbe1"} /></button>
                            ))}
                        </div>
                        <button onClick={() => { setRateTarget(null); setRating(0); }} className="w-full text-center font-bold underline" style={{ color: MUTED }}>下次再說</button>
                    </div>
                </Overlay>
            )}

            {/* 結束活動確認 */}
            {endTarget && (
                <Overlay>
                    <div className="bg-white rounded-3xl p-7 w-full shadow-2xl text-center" style={{ maxWidth: 360, animation: "rise .3s" }}>
                        <div className="text-xl font-extrabold" style={{ color: INK }}>結束「{endTarget.title}」？</div>
                        <div className="text-sm mt-2 mb-6 leading-relaxed" style={{ color: MUTED }}>結束後活動將進入互評階段，成員可互相評分。此操作無法復原。</div>
                        <div className="flex gap-3">
                            <button onClick={() => setEndTarget(null)} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: "var(--field)", color: MUTED }}>取消</button>
                            <button onClick={confirmEnd} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow" style={{ background: "linear-gradient(180deg,#f2a64e,#d8862a)" }}>結束活動</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* 成員互評 */}
            {peerTarget && (
                <PeerRateModal activity={peerTarget} me={me} version={version} bump={bump} showToast={showToast}
                    onClose={() => setPeerTarget(null)} onShowUser={(u) => setUserDetail(u)} />
            )}

            {/* 活動管理（我的活動 → 點卡片） */}
            {manageTarget && (
                <ManageActivityModal activity={manageTarget} me={me} version={version} bump={bump} showToast={showToast}
                    onClose={() => setManageTarget(null)} onShowUser={(u) => setUserDetail(u)}
                    onChat={(a) => setChatTarget(a)} onEnd={(a) => setEndTarget(a)} onRatePeers={(a) => setPeerTarget(a)} />
            )}

            {/* 編輯個人資料 */}
            {editProfileOpen && (
                <ProfileEditModal user={meUser} showToast={showToast} onClose={() => setEditProfileOpen(false)}
                    onSave={({ name, bio, avatar }) => { DB.updateProfile(me, { name, bio, avatar }); bump(); setEditProfileOpen(false); showToast("個人資料已更新"); }} />
            )}

            {/* 活動轉盤 */}
            {rouletteOpen && (
                <RouletteModal pool={joinablePool} onClose={() => setRouletteOpen(false)}
                    onJoin={(a) => applyJoin(a.id)} />
            )}

            {/* 全部歷史紀錄 */}
            {historyOpen && (
                <Overlay>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: 420, maxHeight: "84%", animation: "rise .3s" }}>
                        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
                            <Star size={20} style={{ color: "#ffc23d" }} fill="#ffc23d" />
                            <div className="flex-1 font-extrabold" style={{ color: INK }}>全部歷史紀錄</div>
                            <span className="text-sm font-bold" style={{ color: MUTED }}>共 {meUser?.history?.length || 0} 場</span>
                            <button onClick={() => setHistoryOpen(false)} aria-label="關閉" className="p-1.5 rounded-full ml-1" style={{ background: "var(--field)", color: MUTED }}><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <HistoryList items={meUser?.history} />
                        </div>
                    </div>
                </Overlay>
            )}

            {/* 活動審核（信譽機制）*/}
            {reviewActId != null && (() => {
                const apps = DB.applicantsFor(reviewActId);
                return (
                    <Overlay>
                        <div className="bg-white rounded-3xl p-5 w-full shadow-2xl flex flex-col" style={{ maxWidth: 400, maxHeight: "85%", animation: "rise .3s" }}>
                            <h2 className="text-center text-2xl font-extrabold mb-4" style={{ color: INK }}>活動審核</h2>
                            <div className="flex-1 overflow-y-auto space-y-4">
                                {apps.length ? apps.map(({ app, user }) => (
                                    <div key={app.id} className="rounded-2xl p-4 flex gap-3 items-center shadow-sm" style={{ background: "var(--field)" }}>
                                        {/* <button onClick={() => setUserDetail(user)} className="w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: INK, color: INK }}>
                                            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={28} />}
                                        </button> */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center"><button onClick={() => setUserDetail(user)} className="font-extrabold" style={{ color: INK }}>{user.name}</button><span className="font-bold text-sm" style={{ color: BLUE }}>信譽積分：{user.rep}</span></div>
                                            <div className="text-sm my-1 py-2" style={{ color: MUTED }}>{user.bio}</div>
                                            <div className="flex justify-between items-center ">
                                                <button onClick={() => setUserDetail(user)} className="text-xs font-bold flex items-center gap-0.5" style={{ color: BLUE_DK }}>查看歷史紀錄<ChevronRight size={14} /></button>
                                                <div className="flex gap-1 mt-1">
                                                    <button onClick={() => { DB.decide(app.id, false); bump(); showToast(`已婉拒 ${user.name}`); }} className="px-4 py-1.5 rounded-xl font-bold text-sm shadow-sm" style={{ background: "var(--surface)", color: MUTED }}>拒絕</button>
                                                    <button onClick={() => { DB.decide(app.id, true); bump(); showToast(`已同意 ${user.name} 加入`); }} className="px-4 py-1.5 rounded-xl font-bold text-sm text-white" style={{ background: BLUE }}>同意</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="text-center py-12 font-bold" style={{ color: MUTED }}><CheckCircle2 size={48} className="mx-auto mb-2" />目前沒有待審核的報名</div>}
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setReviewActId(null)} className="flex-1 py-2 rounded-xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>關閉</button>
                                <button onClick={() => { DB.approveAll(reviewActId); bump(); setReviewActId(null); showToast("已全部審核通過！"); }} className="flex-1 py-2 rounded-xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>全部確認</button>
                            </div>
                        </div>
                    </Overlay>
                );
            })()}

            {/* 建立活動 */}
            {createOpen && (
                <Overlay>
                    <div className="bg-white rounded-3xl p-6 w-full shadow-2xl flex flex-col" style={{ maxWidth: 440, maxHeight: "90%", animation: "rise .3s" }}>
                        <h2 className="text-center text-2xl font-extrabold mb-4" style={{ color: INK }}>建立活動</h2>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4" style={{ scrollbarWidth: "thin" }}>
                            {/* 類別：橫向滑動 */}
                            <div>
                                <label className="font-bold block mb-2" style={{ color: INK }}>活動類別</label>
                                <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                    {CATS.map((c) => (
                                        <button key={c.id} onClick={() => setForm({ ...form, cat: c.id })} className="shrink-0 px-4 py-2.5 rounded-2xl font-bold text-[15px] transition"
                                            style={form.cat === c.id ? { background: SOFT, color: BLUE_DK, boxShadow: `inset 0 0 0 2px ${BLUE}` } : { background: "var(--field)", color: MUTED }}>
                                            <span className="mr-1">{c.icon}</span>{c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 名稱 */}
                            <div>
                                <label className="font-bold block mb-2" style={{ color: INK }}>活動名稱</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：雲科羽球館雙打" className="w-full rounded-2xl px-4 py-3.5 outline-none text-base" style={{ background: "var(--field)", color: INK }} />
                            </div>
                            {/* 時間：開始 / 結束 */}
                            <div>
                                <label className="font-bold block mb-2" style={{ color: INK }}>活動時間</label>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs mb-1 font-bold" style={{ color: MUTED }}>開始時間</div>
                                        <TimePicker value={form.start} onChange={(v) => setForm({ ...form, start: v })} placeholder="選擇開始時間" />
                                    </div>
                                    <div>
                                        <div className="text-xs mb-1 font-bold" style={{ color: MUTED }}>結束時間（可選）</div>
                                        <TimePicker value={form.end} onChange={(v) => setForm({ ...form, end: v })} placeholder="選擇結束時間" />
                                    </div>
                                </div>
                            </div>
                            {/* 地點：Google Maps 選擇 */}
                            <div>
                                <label className="font-bold block mb-2" style={{ color: INK }}>活動地點</label>
                                <div className="flex gap-2">
                                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="點右側按鈕從地圖選擇" className="flex-1 rounded-2xl px-4 py-3.5 outline-none text-base" style={{ background: "var(--field)", color: INK }} />
                                    <button onClick={() => setLocOpen(true)} className="px-4 rounded-2xl text-white font-bold shrink-0 flex items-center gap-1" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}><MapPin size={18} />地圖</button>
                                </div>
                            </div>
                            {/* 人數 */}
                            <div>
                                <label className="font-bold block mb-2" style={{ color: INK }}>人數限制</label>
                                <div className="flex items-center justify-center gap-5">
                                    <button onClick={() => setForm({ ...form, cap: Math.max(2, form.cap - 1) })} className="w-12 h-12 rounded-full text-white text-2xl shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>−</button>
                                    <div className="w-28 text-center rounded-2xl py-3 text-2xl font-extrabold" style={{ background: "var(--field)", color: INK, fontFamily: "'Baloo 2'" }}>{form.cap}</div>
                                    <button onClick={() => setForm({ ...form, cap: Math.min(50, form.cap + 1) })} className="w-12 h-12 rounded-full text-white text-2xl shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>+</button>
                                </div>
                            </div>
                            {/* 發起者留言 */}
                            <div>
                                <label className="font-bold block mb-2 flex items-center gap-1.5" style={{ color: INK }}><MessageSquare size={16} />給參與者的話</label>
                                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} placeholder="例：自由參加，歡迎來打球流流汗！記得帶水～" className="w-full rounded-2xl px-4 py-3 outline-none text-base resize-none" style={{ background: "var(--field)", color: INK }} />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button onClick={() => setCreateOpen(false)} className="flex-1 py-3.5 rounded-2xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>取消</button>
                            <button onClick={submitCreate} className="flex-1 py-3.5 rounded-2xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>確認</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* 其他使用者：歷史紀錄 */}
            {userDetail && (() => {
                const uHist = DB.historyOf(userDetail.id);
                return (
                    <div className="fixed inset-0 flex items-center justify-center p-5" style={{ background: "rgba(40,46,56,.55)", zIndex: 60 }}>
                        <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: 380, maxHeight: "85%", animation: "rise .3s" }}>
                            <div className="p-6 pb-4 text-white rounded-t-3xl" style={{ background: `linear-gradient(150deg,${BLUE2},${BLUE_DK})` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "rgba(255,255,255,.25)" }}>{userDetail.avatar ? <img src={userDetail.avatar} alt="" className="w-full h-full object-cover" /> : <User size={34} />}</div>
                                    <div className="flex-1">
                                        <div className="text-xl font-extrabold">{userDetail.name}</div>
                                        <div className="text-sm opacity-90">{userDetail.bio || "這位揪友還沒有自我介紹"}</div>
                                    </div>
                                </div>
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm" style={{ background: "rgba(255,255,255,.22)" }}><Medal size={15} />信譽積分 {userDetail.rep}</div>
                            </div>
                            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                                <span className="font-extrabold flex items-center gap-1.5" style={{ color: INK }}><Star size={18} style={{ color: "#ffc23d" }} fill="#ffc23d" />歷史紀錄</span>
                                <span className="text-sm font-bold" style={{ color: MUTED }}>共 {uHist.length} 場</span>
                            </div>
                            <div className="px-5 flex-1 overflow-y-auto"><HistoryList items={uHist} /></div>
                            <div className="p-5 pt-3">
                                <button onClick={() => setUserDetail(null)} className="w-full py-3.5 rounded-2xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>關閉</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {locOpen && <LocationPicker gmReady={gmReady} onClose={() => setLocOpen(false)} onSelect={(p) => setForm({ ...form, location: p.name, lat: p.lat, lng: p.lng })} />}

            {/* 活動聊天室 */}
            {chatTarget && <ChatRoom activity={chatTarget} me={me} version={version} bump={bump} onClose={() => setChatTarget(null)} onShowUser={(u) => setUserDetail(u)} />}

            {/* 手機號碼認證 */}
            {phoneOpen && (
                <PhoneVerifyModal
                    initialPhone={meUser?.phone}
                    showToast={showToast}
                    onClose={() => setPhoneOpen(false)}
                    onVerified={(phone) => { DB.verifyPhone(me, phone); bump(); setPhoneOpen(false); showToast("手機認證成功，帳號更有保障！"); }}
                />
            )}

            {/* 發起活動前的電話認證提示窗 */}
            {verifyPromptOpen && (
                <Overlay>
                    <div className="bg-white rounded-3xl p-7 w-full shadow-2xl text-center" style={{ maxWidth: 360, animation: "rise .3s" }}>
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: "#fff4e0", color: "#d8862a" }}><Phone size={30} /></div>
                        <div className="text-xl font-extrabold" style={{ color: INK }}>需要先完成手機認證</div>
                        <div className="text-sm mt-2 mb-6 leading-relaxed" style={{ color: MUTED }}>為確保活動真實與參與者安全，發起活動前請先完成手機號碼本人認證。</div>
                        <div className="flex gap-3">
                            <button onClick={() => setVerifyPromptOpen(false)} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: "var(--field)", color: MUTED }}>稍後再說</button>
                            <button onClick={() => { setVerifyPromptOpen(false); setPhoneOpen(true); }} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>立即認證</button>
                        </div>
                    </div>
                </Overlay>
            )}
            
        </div>
    );
}
