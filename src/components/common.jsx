/* 共用小元件：GoogleIcon / Avatar / Overlay / Chip / Field / StarRow / HistoryList */
import { useState } from "react";
import { Eye, EyeOff, Star, Inbox } from "lucide-react";
import { INK, MUTED, BLUE, BLUE2, catOf } from "../constants";

export function GoogleIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.7 38 46.5 31.8 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.3 28.4c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.5l7.8-6.1z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.4 0-11.8-3.7-13.7-9.1l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
        </svg>
    );
}

export function Avatar({ u, size = 40 }) {
    return (
        <span className="rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"
            style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg,${BLUE2},${BLUE})` }}>
            {u?.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u?.name?.[0] || "?")}
        </span>
    );
}

export function Overlay({ children }) {
    return <div className="fixed inset-0 z-40 flex items-center justify-center p-5" style={{ background: "rgba(40,46,56,.5)" }}>{children}</div>;
}

export function Chip({ active, onClick, label, icon }) {
    return (
        <button onClick={onClick} className="shrink-0 px-4 py-2.5 rounded-2xl font-bold shadow-sm transition" style={active ? { background: `linear-gradient(180deg,${BLUE2},${BLUE})`, color: "#fff", fontSize: 15 } : { background: "var(--surface)", color: MUTED, fontSize: 15 }}>
            <span className="inline-flex items-center gap-1">{icon}{label}</span>
        </button>
    );
}

export function Field({ placeholder, value, onChange, type = "text" }) {
    const [show, setShow] = useState(false);
    const isPwd = type === "password";
    return (
        <div className="relative mb-3.5">
            <input type={isPwd && show ? "text" : type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white rounded-2xl px-4 py-2 outline-none shadow-sm" style={{ color: INK, paddingRight: isPwd ? 42 : 16 }} />
            {isPwd && (
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "隱藏密碼" : "顯示密碼"}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    );
}

export function StarRow({ n, size = 15 }) {
    return (
        <span className="inline-flex shrink-0">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={size} style={{ color: i <= n ? "#ffc23d" : "#d7dbe1" }} fill={i <= n ? "#ffc23d" : "#d7dbe1"} />
            ))}
        </span>
    );
}

export function HistoryList({ items }) {
    if (!items || !items.length)
        return <div className="text-center py-7 font-bold" style={{ color: MUTED }}><Inbox size={40} className="mx-auto mb-1" />還沒有歷史紀錄<br /><span className="text-sm font-normal">完成活動並評分後就會出現在這裡</span></div>;
    return (
        <div className="space-y-2">
            {items.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "var(--field)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: catOf(h.cat).grad }}>{catOf(h.cat).icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold truncate" style={{ color: INK }}>{h.title}</div>
                        <div className="text-xs" style={{ color: MUTED }}>{h.date}</div>
                    </div>
                    <StarRow n={h.stars} />
                </div>
            ))}
        </div>
    );
}
