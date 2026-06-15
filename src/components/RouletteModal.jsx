import { useState } from "react";
import { X, MapPin, Clock, Users, Target, PartyPopper } from "lucide-react";
import { catOf, INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, GREEN, GREEN_DK, CHART_COLORS } from "../constants";
import { Overlay } from "./common";

/* =================================================================== */
/*  活動轉盤 RouletteModal                                                */
/*  - 從可參加的活動中隨機抽選一個，跳出詢問使用者是否要參加               */
/* =================================================================== */
export function RouletteModal({ pool, onJoin, onClose }) {
    // 最多 8 個上盤，讓轉盤清楚好看（隨機只發生在按下轉盤時，符合純 render 規範）
    const items = pool.slice(0, 8);
    const n = items.length;
    const seg = n ? 360 / n : 0;
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);

    const R = 96;   // 標籤距圓心半徑
    const grad = items.map((it, i) => `${CHART_COLORS[i % CHART_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`).join(",");

    const spin = () => {
        if (spinning || !n) return;
        const winner = Math.floor(Math.random() * n);
        const centerAngle = winner * seg + seg / 2;     // 此扇形中心（自頂端順時針）
        const within = (360 - centerAngle) % 360;       // 轉到頂端指針位置
        const base = rotation - (rotation % 360);
        setResult(null);
        setSpinning(true);
        setRotation(base + 360 * 6 + within);            // 多轉 6 圈再停在贏家
        setTimeout(() => { setSpinning(false); setResult(items[winner]); }, 4200);
    };

    return (
        <Overlay>
            <div className="bg-white rounded-3xl p-6 w-full shadow-2xl" style={{ maxWidth: 380, animation: "rise .3s" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="text-xl font-extrabold flex items-center gap-1.5" style={{ color: INK }}><Target size={20} style={{ color: "#d8862a" }} />揪是要轉</div>
                    <button onClick={onClose} aria-label="關閉" className="p-1.5 rounded-full" style={{ background: "var(--field)", color: MUTED }}><X size={18} /></button>
                </div>
                <p className="text-sm mb-4" style={{ color: MUTED }}>讓命運幫你決定！轉一下，隨機抽一個活動。</p>

                {n === 0 ? (
                    <div className="text-center py-12 font-bold" style={{ color: MUTED }}><PartyPopper size={48} className="mx-auto mb-2" />目前沒有可參加的新活動<br /><span className="text-sm font-normal">你已加入所有活動，或活動都額滿了</span></div>
                ) : (
                    <>
                        {/* 轉盤 */}
                        <div className="relative mx-auto" style={{ width: 244, height: 244 }}>
                            {/* 頂端指針 */}
                            <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: -2, width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: `20px solid ${BLUE_DK}`, filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))" }} />
                            <div className="rounded-full" style={{
                                width: 244, height: 244, position: "relative",
                                background: `conic-gradient(${grad})`,
                                transform: `rotate(${rotation}deg)`,
                                transition: "transform 4s cubic-bezier(.16,.84,.3,1)",
                                boxShadow: "0 8px 24px rgba(0,0,0,.18), inset 0 0 0 6px rgba(255,255,255,.85)",
                            }}>
                                {items.map((it, i) => {
                                    const angle = i * seg + seg / 2;
                                    return (
                                        <span key={it.id} className="absolute left-1/2 top-1/2 text-2xl" style={{
                                            transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-${R}px) rotate(${-angle}deg)`,
                                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
                                        }}>{catOf(it.cat).icon}</span>
                                    );
                                })}
                            </div>
                            {/* 中心圓鈕 */}
                            <button onClick={spin} disabled={spinning} aria-label="開始抽選"
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full font-extrabold text-white shadow-lg disabled:opacity-70"
                                style={{ width: 64, height: 64, background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})`, border: "4px solid #fff" }}>
                                {spinning ? "…" : "GO"}
                            </button>
                        </div>

                        {/* 結果 / 操作 */}
                        {result ? (
                            <div className="mt-5 rounded-2xl p-4" style={{ background: "var(--field)", animation: "rise .25s" }}>
                                <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: GREEN_DK }}><PartyPopper size={13} />抽中了！</div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: catOf(result.cat).grad }}>{catOf(result.cat).icon}</span>
                                    <div className="min-w-0">
                                        <div className="font-extrabold truncate" style={{ color: INK }}>{result.title}</div>
                                        <div className="text-xs flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5" style={{ color: MUTED }}>
                                            <span className="flex items-center gap-1"><Users size={12} style={{ color: BLUE }} />{result.cap} 位</span>
                                            <span className="flex items-center gap-1"><Clock size={12} style={{ color: BLUE }} />{result.start}{result.end ? `-${result.end}` : ""}</span>
                                            <span className="flex items-center gap-1 truncate"><MapPin size={12} style={{ color: BLUE }} />{result.location || "地點未定"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 mt-3.5">
                                    <button onClick={spin} className="px-4 py-2.5 rounded-2xl font-bold text-sm shrink-0" style={{ background: SOFT, color: BLUE_DK }}>再抽一次</button>
                                    <button onClick={() => { onJoin(result); onClose(); }} className="flex-1 py-2.5 rounded-2xl font-extrabold text-white shadow text-sm" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>參加這個活動</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={spin} disabled={spinning} className="w-full mt-5 py-3 rounded-2xl font-extrabold text-white shadow disabled:opacity-60" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>
                                {spinning ? "轉動中…" : `開始抽選（${n} 個活動）`}
                            </button>
                        )}
                    </>
                )}
            </div>
        </Overlay>
    );
}
