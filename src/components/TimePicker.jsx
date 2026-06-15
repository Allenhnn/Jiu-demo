import { useState, useRef, useEffect } from "react";
import { Clock, Check, ChevronDown } from "lucide-react";
import { INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, GREEN } from "../constants";

/* =================================================================== */
/*  時間選擇器 TimePicker                                                 */
/*  - 點開展開面板：常用時段快選 + 時/分滾輪選擇                           */
/*  - value 為 "HH:MM" 字串；未選時顯示 placeholder                       */
/* =================================================================== */
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PRESETS = [["09:00", "上午"], ["12:00", "中午"], ["14:00", "下午"], ["18:00", "傍晚"], ["19:30", "晚上"], ["21:00", "夜間"]];

const ampm = (h) => { const n = Number(h); return n < 12 ? "上午" : n < 18 ? "下午" : "晚上"; };

export function TimePicker({ value, onChange, placeholder = "選擇時間" }) {
    const [open, setOpen] = useState(false);
    const [h, m] = value ? value.split(":") : ["", ""];
    const hCol = useRef(null), mCol = useRef(null), hSel = useRef(null), mSel = useRef(null);

    // 展開時將已選的時/分滾動置中（直接操作 scrollTop，不影響外層捲動）
    useEffect(() => {
        if (!open) return;
        const center = (col, sel) => { if (col && sel) col.scrollTop = sel.offsetTop - col.clientHeight / 2 + sel.clientHeight / 2; };
        center(hCol.current, hSel.current);
        center(mCol.current, mSel.current);
    }, [open]);

    const pickH = (nh) => onChange(`${nh}:${m || "00"}`);
    const pickM = (nm) => onChange(`${h || "12"}:${nm}`);

    const column = (list, cur, colRef, selRef, onPick) => (
        <div ref={colRef} className="flex-1 overflow-y-auto rounded-xl" style={{ background: "var(--field)" }}>
            {list.map((v) => {
                const sel = v === cur;
                return (
                    <button key={v} ref={sel ? selRef : null} type="button" onClick={() => onPick(v)}
                        className="w-full py-2 text-center font-bold transition"
                        style={sel ? { background: `linear-gradient(180deg,${BLUE2},${BLUE})`, color: "#fff" } : { color: INK }}>
                        {v}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div>
            {/* 觸發列 */}
            <button type="button" onClick={() => setOpen((o) => !o)}
                className="w-full rounded-2xl px-4 py-3 flex items-center gap-2 text-base"
                style={{ background: "var(--field)", boxShadow: open ? `inset 0 0 0 2px ${BLUE}` : "none" }}>
                <Clock size={18} style={{ color: BLUE }} />
                {value
                    ? <span className="font-extrabold" style={{ color: INK }}>{value}</span>
                    : <span style={{ color: MUTED }}>{placeholder}</span>}
                {value && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: SOFT, color: BLUE_DK }}>{ampm(h)}</span>}
                <ChevronDown size={18} className="ml-auto" style={{ color: MUTED, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>

            {/* 展開面板 */}
            {open && (
                <div className="mt-2 rounded-2xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 22px rgba(0,0,0,.10)", animation: "pop .18s ease" }}>
                    {/* 常用時段 */}
                    {/* <div className="flex gap-1.5 overflow-x-auto pb-2.5" style={{ scrollbarWidth: "none" }}>
                        {PRESETS.map(([t, l]) => (
                            <button key={t} type="button" onClick={() => onChange(t)}
                                className="shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition"
                                style={value === t ? { background: BLUE, color: "#fff" } : { background: "var(--field)", color: MUTED }}>
                                {l}・{t}
                            </button>
                        ))}
                    </div> */}
                    
                    {/* 時 / 分 滾輪 */}
                    <div className="flex items-stretch gap-2" style={{ height: 168 }}>
                        <div className="flex-1 flex flex-col">
                            <div className="text-[11px] font-bold text-center mb-1" style={{ color: MUTED }}>時</div>
                            {column(HOURS, h, hCol, hSel, pickH)}
                        </div>
                        <div className="flex items-center font-extrabold text-lg pt-5" style={{ color: MUTED }}>:</div>
                        <div className="flex-1 flex flex-col">
                            <div className="text-[11px] font-bold text-center mb-1" style={{ color: MUTED }}>分</div>
                            {column(MINS, m, mCol, mSel, pickM)}
                        </div>
                    </div>
                    {/* 操作 */}
                    <div className="flex gap-2 mt-3">
                        <button type="button" onClick={() => onChange("")} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ background: "var(--field)", color: MUTED }}>清除</button>
                        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-1 shadow" style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}><Check size={16} />完成</button>
                    </div>
                </div>
            )}
        </div>
    );
}
