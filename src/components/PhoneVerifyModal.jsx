import { useState } from "react";
import { Phone } from "lucide-react";
import { INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, GREEN } from "../constants";
import { Overlay } from "./common";

export function PhoneVerifyModal({ onClose, onVerified, showToast, initialPhone }) {
    const [phone, setPhone] = useState(initialPhone || "");
    const [code, setCode] = useState("");
    const [sentCode, setSentCode] = useState(null);   // null = 尚未發送

    const sendCode = () => {
        if (!/^09\d{8}$/.test(phone)) return showToast("請輸入正確的手機號碼（09 開頭共 10 碼）");
        const c = String(Math.floor(100000 + Math.random() * 900000));
        setSentCode(c); setCode("");
        showToast("驗證碼已發送（示範模式，顯示於下方）");
        console.log(c);
    };
    const verify = () => {
        if (code.trim() === sentCode) onVerified(phone);
        else showToast("驗證碼錯誤，請再試一次");
    };
    
    return (
        <Overlay>
            <div className="bg-white rounded-3xl p-7 w-full shadow-2xl" style={{ maxWidth: 360, animation: "rise .3s" }}>
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: SOFT, color: BLUE_DK }}><Phone size={30} /></div>
                <div className="text-center text-xl font-extrabold" style={{ color: INK }}>手機號碼認證</div>
                <div className="text-center text-sm mt-1 mb-5" style={{ color: MUTED }}>認證本人手機號碼，提升帳號安全與信任度</div>

                <label className="font-bold block mb-2 text-sm" style={{ color: INK }}>手機號碼</label>
                <div className="flex gap-2 mb-4">
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                        placeholder="0912345678" inputMode="numeric"
                        className="flex-1 rounded-2xl px-4 py-3 outline-none text-base" style={{ background: "var(--field)", color: INK, letterSpacing: 1 }} />
                    <button onClick={sendCode} className="px-4 rounded-2xl text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>
                        {sentCode ? "重新發送" : "發送驗證碼"}
                    </button>
                </div>

                {sentCode && (
                    <>
                        {/* <div className="rounded-2xl px-4 py-2.5 mb-4 text-center text-sm font-bold" style={{ background: "#fff4e0", color: "#d8862a" }}>
                            本次驗證碼為 <span style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: 2 }}>{sentCode}</span>
                        </div> */}
                        <label className="font-bold block mb-2 text-sm" style={{ color: INK }}>輸入 6 位數驗證碼</label>
                        <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                            placeholder="••••••" inputMode="numeric"
                            className="w-full rounded-2xl px-4 py-3 outline-none text-center mb-5" style={{ background: "var(--field)", color: INK, fontSize: 22, letterSpacing: 8, fontFamily: "monospace" }} />
                    </>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>取消</button>
                    <button onClick={verify} disabled={!sentCode || code.length !== 6}
                        className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow disabled:opacity-40"
                        style={{ background: `linear-gradient(180deg,#5cd089,${GREEN})` }}>完成認證</button>
                </div>
            </div>
        </Overlay>
    );
}
