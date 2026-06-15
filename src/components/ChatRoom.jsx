import { useState, useEffect, useMemo, useRef } from "react";
import { Users, X, ChevronRight, Send, BadgeCheck, MessageSquare, Medal } from "lucide-react";
import { catOf, INK, MUTED, BLUE, BLUE2, BLUE_DK, GREEN_DK, YELLOW } from "../constants";
import { DB } from "../db";
import { Overlay } from "./common";

export function ChatRoom({ activity, me, version, bump, onClose, onShowUser }) {
    const [text, setText] = useState("");
    // 成員資訊側欄：寬螢幕預設展開，窄螢幕預設收合（可由標題列切換）
    const [showMembers, setShowMembers] = useState(() => typeof window !== "undefined" && window.innerWidth >= 640);
    const endRef = useRef(null);
    const c = catOf(activity.cat);

    const msgs = useMemo(() => DB.messagesFor(activity.id), [activity.id, version]);
    const members = useMemo(() => DB.participantsOf(activity.id), [activity.id, version]);

    // 新訊息自動捲到底部
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs.length]);

    const send = () => {
        const t = text.trim();
        if (!t) return;
        DB.sendMessage(me, activity.id, t);
        setText(""); bump();
    };

    return (
        <Overlay>
            <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: showMembers ? 700 : 420, height: "82%", maxHeight: 640, animation: "rise .3s", transition: "max-width .25s ease" }}>
                {/* 標題列 */}
                <div className="px-5 py-4 text-white flex items-center gap-3" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: "rgba(255,255,255,.22)" }}>{c.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="font-extrabold truncate">{activity.title}</div>
                        <div className="text-xs opacity-90 flex items-center gap-1"><Users size={12} />{members.length} 位成員・{c.label}</div>
                    </div>
                    <button onClick={() => setShowMembers((v) => !v)} aria-label="成員資訊" title="成員資訊"
                        className="p-1.5 rounded-full flex items-center gap-1 text-xs font-bold px-2.5"
                        style={{ background: showMembers ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.18)" }}>
                        <Users size={16} />{members.length}
                    </button>
                    <button onClick={onClose} aria-label="關閉聊天室" className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,.18)" }}><X size={18} /></button>
                </div>

                {/* 內容：聊天區 + 成員資訊側欄 */}
                <div className="flex-1 flex min-h-0">
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* 訊息區 */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "var(--border)" }}>
                    {msgs.length === 0 && (
                        <div className="text-center py-10 font-bold" style={{ color: MUTED }}>
                            <MessageSquare size={40} className="mx-auto mb-2" />還沒有訊息，打聲招呼吧！
                        </div>
                    )}
                    {msgs.map((m) => {
                        if (m.type === "system") return (
                            <div key={m.id} className="flex justify-center">
                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#dde3ea", color: "#6b7280" }}>{m.text}</span>
                            </div>
                        );
                        const mine = m.userId === me;
                        const isHost = m.userId === activity.hostId;
                        return (
                            <div key={m.id} className={"flex gap-2 " + (mine ? "flex-row-reverse" : "")}>
                                {!mine && (
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-4" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{m.user?.name?.[0] || "?"}</span>
                                )}
                                <div style={{ maxWidth: "72%" }}>
                                    {!mine && (
                                        <div className="text-[11px] font-bold mb-0.5 ml-1 flex items-center gap-1" style={{ color: MUTED }}>
                                            {m.user?.name || "已離開的成員"}
                                            {isHost && <span className="px-1.5 rounded-full text-[10px] text-white" style={{ background: YELLOW }}>開團者</span>}
                                        </div>
                                    )}
                                    <div className={"px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm " + (mine ? "text-white" : "")}
                                        style={mine
                                            ? { background: `linear-gradient(135deg,${BLUE2},${BLUE})`, borderRadius: "18px 18px 4px 18px" }
                                            : { background: "var(--surface)", color: INK, borderRadius: "18px 18px 18px 4px" }}>
                                        {m.text}
                                    </div>
                                    <div className={"text-[10px] mt-0.5 " + (mine ? "text-right mr-1" : "ml-1")} style={{ color: "#aab1ba" }}>{m.time}</div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                        </div>

                        {/* 輸入區 */}
                        <div className="p-3 bg-white flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
                            <input
                                value={text} onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) send(); }}
                                placeholder="輸入訊息…（臨時變動、行前確認都可以聊）"
                                className="flex-1 rounded-2xl px-4 py-3 outline-none text-[15px]" style={{ background: "var(--field)", color: INK }}
                            />
                            <button onClick={send} disabled={!text.trim()} aria-label="送出訊息"
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow disabled:opacity-40"
                                style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 成員資訊側欄 */}
                    {showMembers && (
                        <aside className="overflow-y-auto bg-white shrink-0" style={{ width: 196, borderLeft: "1px solid var(--border)" }}>
                            <div className="px-3 pt-3 pb-1 text-xs font-extrabold" style={{ color: MUTED }}>成員資訊（{members.length}）</div>
                            {members.map((u) => {
                                const isHost = u.id === activity.hostId;
                                return (
                                    <div key={u.id} className="px-3 py-2.5" style={{ borderTop: "1px solid var(--field)" }}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: isHost ? `linear-gradient(135deg,#f2c14e,#e08a1e)` : `linear-gradient(135deg,${BLUE2},${BLUE})` }}>{u.name?.[0]}</span>
                                            <div className="min-w-0">
                                                <div className="text-sm font-extrabold flex items-center gap-1 truncate" style={{ color: INK }}>
                                                    {u.name}
                                                    {u.phoneVerified && <BadgeCheck size={13} style={{ color: GREEN_DK }} title="已完成手機認證" />}
                                                </div>
                                                {isHost && <span className="text-[10px] font-bold px-1.5 rounded-full text-white" style={{ background: YELLOW }}>開團者</span>}
                                            </div>
                                        </div>
                                        <div className="text-[11px] mt-1.5 leading-snug" style={{ color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{u.bio || "這位揪友還沒有自我介紹"}</div>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[11px] font-bold inline-flex items-center gap-0.5" style={{ color: GREEN_DK }}><Medal size={11} />信譽 {u.rep}</span>
                                            <button onClick={() => onShowUser(u)} className="text-[11px] font-bold flex items-center" style={{ color: BLUE_DK }}>查看紀錄<ChevronRight size={11} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </aside>
                    )}
                </div>
            </div>
        </Overlay>
    );
}
