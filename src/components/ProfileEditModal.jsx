import { useState, useRef } from "react";
import { User, X, Camera, Check, Trash2 } from "lucide-react";
import { INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK } from "../constants";
import { Overlay } from "./common";

export function ProfileEditModal({ user, showToast, onClose, onSave }) {
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const fileRef = useRef(null);

    const pickFile = (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";   // 允許再次選同一檔案
        if (!f) return;
        if (!f.type.startsWith("image/")) return showToast("請選擇圖片檔");
        if (f.size > 8 * 1024 * 1024) return showToast("圖片請小於 8MB");
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const max = 256;
                let { width, height } = img;
                if (width > height && width > max) { height = (height * max) / width; width = max; }
                else if (height > max) { width = (width * max) / height; height = max; }
                const canvas = document.createElement("canvas");
                canvas.width = width; canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                setAvatar(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(f);
    };

    const save = () => {
        if (!name.trim()) return showToast("暱稱不可空白");
        onSave({ name: name.trim(), bio, avatar });
    };

    return (
        <Overlay>
            <div className="bg-white rounded-3xl p-6 w-full shadow-2xl" style={{ maxWidth: 380, animation: "rise .3s" }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-extrabold" style={{ color: INK }}>編輯個人資料</div>
                    <button onClick={onClose} aria-label="關閉" className="p-1.5 rounded-full" style={{ background: "var(--field)", color: MUTED }}><X size={18} /></button>
                </div>

                {/* 頭像 */}
                <div className="flex flex-col items-center mb-5">
                    <button onClick={() => fileRef.current?.click()} className="relative" title="更換頭像">
                        <span className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-extrabold overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg,${BLUE2},${BLUE_DK})` }}>
                            {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (name?.[0] || <User size={40} />)}
                        </span>
                        <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow" style={{ background: BLUE, border: "2px solid #fff" }}><Camera size={16} /></span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-xl font-bold text-sm" style={{ background: SOFT, color: BLUE_DK }}>上傳照片</button>
                        {avatar && <button onClick={() => setAvatar(null)} className="px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1" style={{ background: "#fdeef1", color: "#e0607a" }}><Trash2 size={14} />移除</button>}
                    </div>
                </div>

                {/* 暱稱 */}
                <label className="font-bold block mb-1.5 text-sm" style={{ color: INK }}>暱稱</label>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="你的暱稱"
                    className="w-full rounded-2xl px-4 py-3 outline-none text-base mb-4" style={{ background: "var(--field)", color: INK }} />

                {/* 自我介紹 */}
                <label className="font-bold block mb-1.5 text-sm" style={{ color: INK }}>自我介紹</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={60} rows={2} placeholder="介紹一下自己吧～"
                    className="w-full rounded-2xl px-4 py-3 outline-none text-base mb-5 resize-none" style={{ background: "var(--field)", color: INK }} />

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: "var(--field)", color: MUTED }}>取消</button>
                    <button onClick={save} className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow flex items-center justify-center gap-1.5" style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}><Check size={18} />儲存</button>
                </div>
            </div>
        </Overlay>
    );
}
