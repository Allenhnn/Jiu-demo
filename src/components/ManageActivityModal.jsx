import { useMemo } from "react";
import { Users, Star, X, ChevronRight, MessageSquare, BadgeCheck, UserCheck, CheckCircle2, Medal } from "lucide-react";
import { catOf, INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, GREEN, GREEN_DK, YELLOW } from "../constants";
import { DB } from "../db";
import { Overlay, Avatar } from "./common";

export function ManageActivityModal({ activity, me, version, bump, showToast, onClose, onShowUser, onChat, onEnd, onRatePeers }) {
    const isHost = (activity.hostBy || activity.hostId) === me;
    const c = catOf(activity.cat);
    const apps = useMemo(() => DB.applicantsFor(activity.id), [activity.id, version]);
    const members = useMemo(() => DB.participantsOf(activity.id), [activity.id, version]);
    const hostId = activity.hostBy || activity.hostId;

    return (
        <Overlay>
            <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: 440, maxHeight: "88%", animation: "rise .3s" }}>
                {/* 標題列 */}
                <div className="px-5 py-4 text-white flex items-center gap-3" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: "rgba(255,255,255,.22)" }}>{c.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="font-extrabold truncate">{activity.title}</div>
                        <div className="text-xs opacity-90 flex items-center gap-2">
                            <span className="flex items-center gap-1"><Users size={12} />{members.length} 位成員</span>
                            <span>・{activity.ended ? "已結束" : "進行中"}</span>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="關閉" className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,.18)" }}><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "var(--field)" }}>
                    {/* 待審核名單（僅開團者可見） */}
                    {isHost && (
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-extrabold flex items-center gap-1.5" style={{ color: INK }}><UserCheck size={17} style={{ color: BLUE }} />待審核報名（{apps.length}）</span>
                                {apps.length > 0 && <button onClick={() => { DB.approveAll(activity.id); bump(); showToast("已全部審核通過！"); }} className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>全部通過</button>}
                            </div>
                            {apps.length === 0 ? (
                                <div className="text-center py-5 text-sm font-bold flex items-center justify-center gap-1" style={{ color: MUTED }}><CheckCircle2 size={16} />目前沒有待審核的報名</div>
                            ) : apps.map(({ app, user }) => (
                                <div key={app.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: "1px solid var(--field)" }}>
                                    <Avatar u={user} size={40} />
                                    <div className="flex-1 min-w-0">
                                        <button onClick={() => onShowUser(user)} className="font-extrabold truncate block" style={{ color: INK }}>{user.name}</button>
                                        <div className="text-xs flex items-center gap-1" style={{ color: GREEN_DK }}><Medal size={12} />信譽 {user.rep}{user.phoneVerified && <BadgeCheck size={12} style={{ color: GREEN_DK }} />}</div>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                        <button onClick={() => { DB.decide(app.id, false); bump(); showToast(`已婉拒 ${user.name}`); }} className="px-3 py-1.5 rounded-xl font-bold text-sm" style={{ background: "var(--field)", color: MUTED }}>拒絕</button>
                                        <button onClick={() => { DB.decide(app.id, true); bump(); showToast(`已同意 ${user.name} 加入`); }} className="px-3 py-1.5 rounded-xl font-bold text-sm text-white" style={{ background: BLUE }}>同意</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 參與成員 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="font-extrabold flex items-center gap-1.5 mb-1" style={{ color: INK }}><Users size={17} style={{ color: BLUE }} />參與成員（{members.length}）</div>
                        {members.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: "1px solid var(--field)" }}>
                                <Avatar u={u} size={40} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-extrabold truncate flex items-center gap-1.5" style={{ color: INK }}>
                                        {u.name}
                                        {u.id === hostId && <span className="text-[10px] font-bold px-1.5 rounded-full text-white" style={{ background: YELLOW }}>開團者</span>}
                                        {u.phoneVerified && <BadgeCheck size={13} style={{ color: GREEN_DK }} title="已完成手機認證" />}
                                    </div>
                                    <div className="text-xs flex items-center gap-1" style={{ color: MUTED }}><Medal size={12} />信譽 {u.rep}</div>
                                </div>
                                <button onClick={() => onShowUser(u)} className="text-xs font-bold flex items-center shrink-0" style={{ color: BLUE_DK }}>查看紀錄<ChevronRight size={13} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="p-3 bg-white flex gap-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => { onClose(); onChat(activity); }} className="flex-1 py-3 rounded-2xl font-extrabold flex items-center justify-center gap-1.5" style={{ background: SOFT, color: BLUE_DK }}><MessageSquare size={18} />聊天室</button>
                    {activity.ended
                        ? <button onClick={() => { onClose(); onRatePeers(activity); }} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow flex items-center justify-center gap-1.5" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}><Star size={18} />為夥伴評分</button>
                        : isHost && <button onClick={() => { onClose(); onEnd(activity); }} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow" style={{ background: "linear-gradient(180deg,#f2a64e,#d8862a)" }}>結束活動</button>}
                </div>
            </div>
        </Overlay>
    );
}
