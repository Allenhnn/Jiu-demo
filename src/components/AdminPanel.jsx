import { useState, useMemo } from "react";
import { Search, Users, BarChart3, Star, X, LogOut, Megaphone, TrendingUp, Shield, RefreshCw, Calendar, Activity, BadgeCheck, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { catOf, INK, MUTED, SOFT, BG, BLUE, BLUE2, BLUE_DK, GREEN, GREEN_DK, YELLOW, CHART_COLORS, LOGO, DB_VERSION } from "../constants";
import { DB } from "../db";

export function AdminPanel({ meUser, version, bump, showToast, onLogout, toast }) {
    const [tab, setTab] = useState("overview");      // overview | users | activities
    const [search, setSearch] = useState("");
    const [confirmReset, setConfirmReset] = useState(false);

    const stats = useMemo(() => DB.adminStats(), [version]);
    const users = useMemo(() => DB.adminUsers(search), [version, search]);
    const acts = useMemo(() => DB.adminActivities(), [version]);

    const catData = useMemo(() => {
        const m = {};
        acts.filter((a) => !a.archived).forEach((a) => { m[a.cat] = (m[a.cat] || 0) + 1; });
        return Object.entries(m).map(([id, v]) => ({ name: catOf(id).label, value: v })).sort((a, b) => b.value - a.value);
    }, [acts]);
    const appData = useMemo(() => {
        const m = { approved: 0, pending: 0, rejected: 0 };
        DB.data.applications.forEach((x) => { m[x.status] = (m[x.status] || 0) + 1; });
        return [
            { name: "已通過", value: m.approved, color: GREEN },
            { name: "審核中", value: m.pending, color: YELLOW },
            { name: "已婉拒", value: m.rejected, color: "#e07a8a" },
        ].filter((d) => d.value > 0);
    }, [version]);


    const TABS = [["overview", "總覽", BarChart3], ["users", "使用者管理", Users], ["activities", "活動管理", Calendar]];
    const th = "text-left px-4 py-3 text-xs font-extrabold whitespace-nowrap";
    const td = "px-4 py-3 whitespace-nowrap text-sm";

    const statTiles = [
        [Users, stats.users, "註冊使用者", "#e8f1fb", BLUE],
        [Activity, stats.activities, "上架活動", "#e7f7ee", GREEN_DK],
        [Megaphone, `${stats.applications}（${stats.pending} 待審）`, "報名申請", "#fff4e0", "#d8862a"],
        [Star, `${stats.ratings}（均 ${stats.avgStars.toFixed(1)}★）`, "活動評分", "#fde9ef", "#d05a78"],
    ];

    return (
        <div className="w-full min-h-screen" style={{ background: BG, fontFamily: "'Noto Sans TC',sans-serif" }}>
            {/* 頂部列 */}
            <div className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-10/12 mx-auto px-5 py-3 flex items-center justify-between">
                {/* <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between"> */}
                    <div className="flex items-center gap-3">
                        <img src={LOGO} alt="logo" style={{ width: 42, height: 42, borderRadius: "24%", objectFit: "cover" }} />
                        <div>
                            <div className="font-extrabold text-lg leading-tight" style={{ color: INK }}>揪是要聚・管理後台</div>
                            <div className="text-xs font-bold flex items-center gap-1" style={{ color: BLUE_DK }}><Shield size={12} />Administrator</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: SOFT, color: BLUE_DK }}>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{meUser?.name?.[0]}</span>
                            {meUser?.name}
                        </span>
                        <button onClick={onLogout} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm" style={{ color: "#e0607a", background: "#fdeef1" }}><LogOut size={16} />登出</button>
                    </div>
                </div>
                {/* 分頁 */}
                <div className="max-w-6xl mx-auto px-5 pb-3 flex gap-2">
                    {TABS.map(([id, label, Icon]) => (
                        <button key={id} onClick={() => setTab(id)} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm transition"
                            style={tab === id ? { background: `linear-gradient(180deg,${BLUE2},${BLUE})`, color: "#fff" } : { background: "var(--field)", color: MUTED }}>
                            <Icon size={16} />{label}
                        </button>
                    ))}
                </div>
            </div>

            {/* <div className="max-w-6xl mx-auto px-5 py-6 space-y-5"> */}
            <div className="max-w-10/12 mx-auto px-5 py-6 space-y-5">
                {/* ===== 總覽 ===== */}
                {tab === "overview" && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {statTiles.map(([Icon, val, label, bg, color], i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: bg, color }}><Icon size={20} /></div>
                                    <div style={{ fontFamily: "'Baloo 2'", fontSize: 24, fontWeight: 800, color: INK }}>{val}</div>
                                    <div className="font-bold text-sm" style={{ color: MUTED }}>{label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <div className="font-extrabold mb-3 flex items-center gap-1.5" style={{ color: INK }}><TrendingUp size={17} style={{ color: BLUE }} />活動類別分佈</div>
                                <div style={{ width: "100%", height: 220 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={44} tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: "var(--field)" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                                                {catData.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <div className="font-extrabold mb-3 flex items-center gap-1.5" style={{ color: INK }}><Megaphone size={17} style={{ color: GREEN_DK }} />報名審核狀態</div>
                                {appData.length ? (
                                    <div className="flex items-center">
                                        <div style={{ width: 190, height: 190 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie data={appData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={2}>
                                                        {appData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.12)", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 space-y-2 pl-3">
                                            {appData.map((e, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm font-bold" style={{ color: INK }}>
                                                    <span className="w-3 h-3 rounded-full" style={{ background: e.color }} />
                                                    {e.name}<span className="ml-auto" style={{ color: MUTED }}>{e.value} 筆</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : <div className="text-center py-12 font-bold" style={{ color: MUTED }}>尚無報名資料</div>}
                            </div>
                        </div>
                        {/* 資料庫管理 */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-wrap items-center gap-3 justify-between">
                            <div>
                                <div className="font-extrabold" style={{ color: INK }}>資料庫管理</div>
                                <div className="text-sm" style={{ color: MUTED }}>資料以 localStorage 持久化（版本 v{DB_VERSION}）。可一鍵還原為種子資料。</div>
                            </div>
                            {confirmReset ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold" style={{ color: "#e0607a" }}>確定還原？所有變更將遺失</span>
                                    <button onClick={() => { DB.reset(); bump(); setConfirmReset(false); showToast("已還原為種子資料"); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-white" style={{ background: "#e0607a" }}>確定還原</button>
                                    <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-2xl font-bold text-sm" style={{ background: "var(--field)", color: MUTED }}>取消</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm" style={{ background: "var(--field)", color: INK }}><RefreshCw size={15} />還原種子資料</button>
                            )}
                        </div>
                    </>
                )}

                {/* ===== 使用者管理 ===== */}
                {tab === "users" && (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-5 pb-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="font-extrabold text-lg" style={{ color: INK }}>使用者列表</div>
                                <div className="text-xs flex items-start gap-1" style={{ color: MUTED }}><AlertTriangle size={13} className="mt-0.5 shrink-0" />密碼為課程示範用明碼儲存；實務上應以雜湊（如 bcrypt）保存，後台亦不應可見。</div>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: "var(--field)", minWidth: 240 }}>
                                <Search size={16} style={{ color: MUTED }} />
                                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋帳號 / 暱稱 / Email" className="flex-1 bg-transparent outline-none text-sm" style={{ color: INK }} />
                                {search && <button onClick={() => setSearch("")} aria-label="清除"><X size={14} style={{ color: MUTED }} /></button>}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "var(--field)", color: MUTED }}>
                                        <th className={th}>使用者</th><th className={th}>帳號</th><th className={th}>Email</th>
                                        <th className={th}>電話</th><th className={th}>來源</th><th className={th}>信譽</th><th className={th}>扣分進度</th><th className={th}>開團</th><th className={th}>參加</th>
                                        <th className={th}>註冊日期</th><th className={th}>狀態</th><th className={th}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isAdmin = u.role === "admin";
                                        return (
                                            <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                                                <td className={td}>
                                                    <span className="flex items-center gap-2 font-bold" style={{ color: INK }}>
                                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ background: isAdmin ? `linear-gradient(135deg,#8a6fd0,#5a3fa0)` : `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{u.name?.[0]}</span>
                                                        {u.name}
                                                        {isAdmin && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: "#8a6fd0" }}>管理員</span>}
                                                    </span>
                                                </td>
                                                <td className={td} style={{ color: INK, fontWeight: 700 }}>{u.account}</td>
                                                {/* <td className={td}>
                                                    {u.password == null ? (
                                                        <span style={{ color: MUTED }}>—（Google 登入）</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2">
                                                            <code className="px-2 py-0.5 rounded-lg text-sm" style={{ background: "var(--field)", color: INK, fontFamily: "monospace", letterSpacing: shown ? 0 : 2 }}>
                                                                {shown ? u.password : "•".repeat(Math.max(u.password.length, 6))}
                                                            </code>
                                                            <button onClick={() => toggleReveal(u.id)} aria-label={shown ? "隱藏密碼" : "顯示密碼"} style={{ color: shown ? BLUE_DK : MUTED }}>
                                                                {shown ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </span>
                                                    )}
                                                </td> */}
                                                <td className={td} style={{ color: MUTED }}>{u.email || "—"}</td>
                                                <td className={td}>
                                                    {u.phone ? (
                                                        <span className="inline-flex items-center gap-1" style={{ color: INK }}>
                                                            {u.phone}
                                                            {u.phoneVerified && <BadgeCheck size={14} style={{ color: GREEN_DK }} title="已完成手機認證" />}
                                                        </span>
                                                    ) : <span style={{ color: MUTED }}>未認證</span>}
                                                </td>
                                                <td className={td}>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={u.provider === "google" ? { background: "#fde9ef", color: "#d05a78" } : { background: SOFT, color: BLUE_DK }}>{u.provider === "google" ? "Google" : "本地"}</span>
                                                </td>
                                                <td className={td} style={{ color: GREEN_DK, fontWeight: 800 }}>{u.rep}</td>
                                                <td className={td}>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-14 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                                                            <div className="h-full rounded-full" style={{ width: `${Math.round(u.demerit || 0)}%`, background: (u.demerit || 0) >= 60 ? "#e0607a" : BLUE }} />
                                                        </div>
                                                        <span className="text-xs font-bold" style={{ color: (u.demerit || 0) >= 60 ? "#e0607a" : MUTED }}>{Math.round(u.demerit || 0)}</span>
                                                    </div>
                                                </td>
                                                <td className={td} style={{ color: INK }}>{u.hosted}</td>
                                                <td className={td} style={{ color: INK }}>{u.joined}</td>
                                                <td className={td} style={{ color: MUTED }}>{u.createdAt || "—"}</td>
                                                <td className={td}>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={u.status === "active" ? { background: "#e7f7ee", color: GREEN_DK } : { background: "#fdeef1", color: "#e0607a" }}>{u.status === "active" ? "正常" : "停權"}</span>
                                                </td>
                                                <td className={td}>
                                                    {!isAdmin && (
                                                        <button onClick={() => { DB.toggleUserStatus(u.id); bump(); showToast(u.status === "active" ? `已停權 ${u.name}` : `已恢復 ${u.name}`); }}
                                                            className="px-3 py-1 rounded-xl text-xs font-bold"
                                                            style={u.status === "active" ? { background: "#fdeef1", color: "#e0607a" } : { background: "#e7f7ee", color: GREEN_DK }}>
                                                            {u.status === "active" ? "停權" : "復權"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {!users.length && <div className="text-center py-12 font-bold" style={{ color: MUTED }}>找不到符合的使用者</div>}
                        </div>
                    </div>
                )}

                {/* ===== 活動管理 ===== */}
                {tab === "activities" && (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-5 pb-3 font-extrabold text-lg" style={{ color: INK }}>活動列表 <span className="text-sm font-bold" style={{ color: MUTED }}>共 {acts.length} 筆（含封存 {stats.archived} 筆）</span></div>
                        <div className="overflow-x-auto">
                            <table className="w-full" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "var(--field)", color: MUTED }}>
                                        <th className={th}>活動</th><th className={th}>類別</th><th className={th}>發起人</th><th className={th}>時間</th>
                                        <th className={th}>地點</th><th className={th}>人數</th><th className={th}>報名</th><th className={th}>狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acts.map((a) => {
                                        const c = catOf(a.cat);
                                        return (
                                            <tr key={a.id} style={{ borderTop: "1px solid var(--border)", opacity: a.archived ? 0.55 : 1 }}>
                                                <td className={td}>
                                                    <span className="flex items-center gap-2 font-bold" style={{ color: INK }}>
                                                        <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.grad }}>{c.icon}</span>
                                                        {a.title}
                                                    </span>
                                                </td>
                                                <td className={td} style={{ color: MUTED }}>{c.label}</td>
                                                <td className={td} style={{ color: INK }}>{a.hostName}</td>
                                                <td className={td} style={{ color: MUTED }}>{a.start}{a.end ? `–${a.end}` : ""}</td>
                                                <td className={td} style={{ color: MUTED, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{a.location || "—"}</td>
                                                <td className={td} style={{ color: INK, fontWeight: 700 }}>{a.approvedCount}/{a.cap}</td>
                                                <td className={td} style={{ color: INK }}>{a.applyCount}</td>
                                                <td className={td}>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={a.archived ? { background: "#f0f2f6", color: MUTED } : a.full ? { background: "#fff4e0", color: "#d8862a" } : { background: "#e7f7ee", color: GREEN_DK }}>
                                                        {a.archived ? "已封存" : a.full ? "已額滿" : "招募中"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {toast && <div className="fixed left-1/2 -translate-x-1/2 bottom-8 px-6 py-3 rounded-full text-white font-bold shadow-lg z-50" style={{ background: "rgba(30,35,44,.92)" }}>{toast}</div>}
        </div>
    );
}
