import React from "react";
import { MapPin, Clock, Users, MessageSquare, Settings } from "lucide-react";
import { catOf, INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, GREEN, GREEN_DK, YELLOW } from "../constants";

export const ActivityCard = React.memo(function ActivityCard({ a, me, onJoin, onReview, onRate, onChat, onEnd, onRatePeers, onManage, delay = 0 }) {
    const c = catOf(a.cat);
    const isHost = a.hostBy === me;
    const isMember = isHost || a.myStatus === "joined";   // 開團者或已通過審核者
    const manageable = !!onManage;   // 「我的活動」中可點卡片開啟管理頁
    const canChat = isMember;   // 聊天室：僅開團者與已加入活動者可進入
    let btn;
    if (a.ended) {
        // 活動已結束：成員可進入互評，其餘顯示已結束
        if (isMember) btn = <button onClick={() => onRatePeers(a)} className="px-5 py-3 rounded-3xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>為夥伴評分</button>;
        else btn = <button disabled className="px-5 py-3 rounded-3xl font-extrabold text-white" style={{ background: MUTED }}>活動已結束</button>;
    }
    else if (isHost) btn = <button onClick={() => onReview(a)} className="px-5 py-3 rounded-3xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>審核報名</button>;
    else if (a.myStatus === "joined" && a.rated) btn = <button disabled className="px-5 py-3 rounded-3xl font-extrabold text-white" style={{ background: GREEN_DK }}>評分完畢</button>;
    else if (a.myStatus === "joined") btn = <button onClick={() => onRate(a)} className="px-5 py-3 rounded-3xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>已參與活動</button>;
    else if (a.myStatus === "pending") btn = <button disabled className="px-5 py-3 rounded-3xl font-extrabold text-white" style={{ background: YELLOW }}>審核中…</button>;
    else if (a.full) btn = <button disabled className="px-5 py-3 rounded-3xl font-extrabold text-white" style={{ background: MUTED }}>名額已滿</button>;
    else btn = <button onClick={() => onJoin(a)} className="px-5 py-3 rounded-3xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>參與活動</button>;

    return (
        <div className="bg-white rounded-3xl p-3 shadow-lg" style={{ animation: `pop .4s ease ${delay}s backwards`, cursor: manageable ? "pointer" : "default" }}
            onClick={manageable ? () => onManage(a) : undefined}
            title={manageable ? "點擊查看參與者與管理" : undefined}>
            <div className="relative rounded-2xl flex items-center justify-center" style={{ height: 168, background: c.grad }}>
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold bg-white/90" style={{ color: INK }}>{isHost ? "我的揪團" : c.label}</span>
                {a.ended && <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ background: "rgba(20,25,35,.55)" }}>已結束</span>}
                {manageable && !a.ended && <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-white/90" style={{ color: BLUE_DK }}><Settings size={13} />點擊管理</span>}
                <span style={{ fontSize: 64, filter: "drop-shadow(0 8px 12px rgba(0,0,0,.25))" }}>{c.icon}</span>
                {a.full && !a.ended && <div className="absolute inset-0 flex items-center justify-center rounded-2xl text-white font-extrabold text-xl tracking-widest" style={{ background: "rgba(20,25,35,.5)" }}>名額已滿</div>}
            </div>
            <div className="flex items-start justify-between gap-3 px-1 pt-3">
                <h3 className="text-xl font-extrabold" style={{ color: INK }}>{a.title}</h3>
                <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {canChat && (
                        <button onClick={() => onChat(a)} aria-label="開啟活動聊天室" title="活動聊天室"
                            className="w-11 h-11 rounded-full flex items-center justify-center shadow"
                            style={{ background: SOFT, color: BLUE_DK }}>
                            <MessageSquare size={20} />
                        </button>
                    )}
                    {btn}
                </div>
            </div>
            <p className="px-1 mt-1 text-[15px]" style={{ color: MUTED }}>{a.note || "歡迎一起來同樂！"}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 px-1 mt-3 pb-1">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: INK }}><Users size={18} style={{ color: BLUE }} />{a.cap} 位</span>
                <span className="flex items-center gap-1.5 font-bold" style={{ color: INK }}><Clock size={18} style={{ color: BLUE }} />{a.start}{a.end ? ` - ${a.end}` : ""}</span>
                <span className="flex items-center gap-1.5 font-bold truncate" style={{ color: INK, maxWidth: "100%" }}><MapPin size={18} style={{ color: BLUE }} />{a.location || "地點未定"}</span>
            </div>
            {isHost && !a.ended && (
                <button onClick={(e) => { e.stopPropagation(); onEnd(a); }} className="w-full mt-2 py-2.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-1.5"
                    style={{ background: "#fff4e0", color: "#d8862a", border: "1.5px solid #f3d6a6" }}>
                    結束活動並開始評分
                </button>
            )}
           
        </div>
    );
});


// let db = JSON.parse(localStorage.getItem("jiu_db"));
// db.users[1]["phone"] = null;
// db.users[1]["phoneVerified"] = null;
// localStorage.setItem("jiu_db",JSON.stringify(db));

