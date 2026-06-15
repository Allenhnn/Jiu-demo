import { useState, useMemo } from "react";
import { Star, BadgeCheck, UserPlus } from "lucide-react";
import { INK, MUTED, BLUE, BLUE2, GREEN, GREEN_DK, RATE_LABELS } from "../constants";
import { DB } from "../db";
import { Overlay } from "./common";

export function PeerRateModal({ activity, me, version, bump, showToast, onClose, onShowUser }) {
    const peers = useMemo(() => DB.peersToRate(me, activity.id), [activity.id, me, version]);
    const [scores, setScores] = useState({});   // { userId: stars }

    const submit = () => {
        const entries = Object.entries(scores).filter(([id, n]) => n > 0 && !peers.find((p) => p.id === id)?.rated);
        if (entries.length === 0) return showToast("請至少為一位夥伴評分");
        entries.forEach(([id, n]) => DB.ratePeer(me, id, activity.id, n));
        bump();
        showToast(`已送出 ${entries.length} 筆評分，感謝你的回饋！`);
        onClose();
    };

    return (
        <Overlay>
            <div className="bg-white rounded-3xl p-5 w-full shadow-2xl flex flex-col" style={{ maxWidth: 400, maxHeight: "86%", animation: "rise .3s" }}>
                <h2 className="text-center text-2xl font-extrabold" style={{ color: INK }}>為夥伴評分</h2>
                <p className="text-center text-sm mt-1 mb-3" style={{ color: MUTED }}>{activity.title}・為一起參與的成員評分（1～5 顆星）</p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                    {peers.length === 0 && <div className="text-center py-12 font-bold" style={{ color: MUTED }}><UserPlus size={48} className="mx-auto mb-2" />這個活動目前沒有其他成員</div>}
                    {peers.map((u) => {
                        const cur = scores[u.id] || 0;
                        return (
                            <div key={u.id} className="rounded-2xl p-3.5 shadow-sm" style={{ background: "var(--field)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{u.name?.[0]}</span>
                                        <button onClick={() => onShowUser(u)} className="font-extrabold truncate" style={{ color: INK }}>{u.name}</button>
                                    </div>
                                    <span className="text-xs font-bold shrink-0" style={{ color: BLUE }}>信譽 {u.rep}</span>
                                </div>
                                {u.rated ? (
                                    <div className="mt-2 text-sm font-bold flex items-center gap-1" style={{ color: GREEN_DK }}><BadgeCheck size={16} />已完成評分</div>
                                ) : (
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <button key={i} onClick={() => setScores((s) => ({ ...s, [u.id]: i }))}>
                                                    <Star size={28} style={{ color: i <= cur ? "#ffc23d" : "#d7dbe1" }} fill={i <= cur ? "#ffc23d" : "#d7dbe1"} />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: cur && cur <= 2 ? "#d8862a" : MUTED }}>{cur ? RATE_LABELS[cur] : "尚未評分"}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="text-[11px] mt-2 leading-snug" style={{ color: MUTED }}>※ 4～5 星不影響任何數值；3 星為中立；1～2 星會累積對方的扣分進度條，滿 100 會扣除 10 點信譽積分。</p>
                <div className="flex gap-3 mt-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>關閉</button>
                    <button onClick={submit} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>送出評分</button>
                </div>
            </div>
        </Overlay>
    );
}
