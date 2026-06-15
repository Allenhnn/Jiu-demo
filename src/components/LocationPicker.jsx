import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, X, Wifi, Wrench } from "lucide-react";
import { INK, MUTED, SOFT, BLUE, BLUE2, BLUE_DK, PRESET_PLACES } from "../constants";

export function LocationPicker({ gmReady, onClose, onSelect }) {
    const [query, setQuery] = useState("");
    const [gResults, setGResults] = useState([]);
    const [selected, setSelected] = useState(null);

    // Google Places 自動完成（有金鑰才會跑）
    useEffect(() => {
        if (!gmReady || !query.trim() || !window.google?.maps?.places) return;
        try {
            const svc = new window.google.maps.places.AutocompleteService();
            svc.getPlacePredictions(
                { input: query, language: "zh-TW", componentRestrictions: { country: "tw" } },
                (preds) => setGResults((preds || []).map((p) => ({
                    placeId: p.place_id,
                    name: p.structured_formatting?.main_text || p.description,
                    address: p.description,
                })))
            );
        } catch { /* Places 服務不可用時改用內建地點 */ }
    }, [query, gmReady]);

    const presetResults = useMemo(() => {
        const q = query.trim();
        if (!q) return PRESET_PLACES;
        return PRESET_PLACES.filter((p) => p.name.includes(q) || p.address.includes(q));
    }, [query]);

    const usingGoogle = gmReady && query.trim();
    const list = usingGoogle ? gResults : presetResults;

    const choose = (r) => {
        if (usingGoogle && r.placeId && window.google?.maps?.places) {
            try {
                const svc = new window.google.maps.places.PlacesService(document.createElement("div"));
                svc.getDetails({ placeId: r.placeId, fields: ["name", "formatted_address", "geometry"] }, (d) => {
                    setSelected({ name: d.name, address: d.formatted_address, lat: d.geometry.location.lat(), lng: d.geometry.location.lng() });
                });
            } catch { setSelected({ name: r.name, address: r.address, lat: null, lng: null }); }
        } else {
            setSelected(r);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(40,46,56,.5)" }}>
            <div className="w-full bg-white rounded-3xl shadow-2xl flex flex-col" style={{ maxWidth: 460, maxHeight: "88%" }}>
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                    <h3 className="text-xl font-extrabold" style={{ color: INK }}>選擇活動地點</h3>
                    <button onClick={onClose} className="p-1 rounded-full" style={{ color: MUTED }}><X size={22} /></button>
                </div>

                <div className="px-5">
                    <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "var(--field)" }}>
                        <Search size={18} style={{ color: MUTED }} />
                        <input
                            autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder="搜尋地點、地址或場館…"
                            className="flex-1 bg-transparent outline-none text-base" style={{ color: INK }}
                        />
                    </div>
                    {/* <div className="text-xs mt-1 ml-1 flex items-center gap-1" style={{ color: MUTED }}>
                        {gmReady ? <><Wifi size={12} style={{ color: "#36ad64" }} />已連線 Google 地圖</> : <><Wrench size={12} />示意模式（未設定 Google 金鑰，使用內建地點）</>}
                    </div> */}
                </div>

                {/* 地圖預覽 */}
                <div className="px-5 pt-3">
                    <div className="relative rounded-2xl overflow-hidden" style={{ height: 132, background: selected ? "linear-gradient(135deg,#cfe0f5,#aecbe9)" : "var(--border)", backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 26px),repeating-linear-gradient(90deg,rgba(255,255,255,.5) 0 1px,transparent 1px 26px)" }}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {selected ? (
                                <>
                                    <MapPin size={34} style={{ color: "#d05a78" }} fill="#d05a78" />
                                    <div className="mt-1 px-3 py-1 rounded-full text-sm font-bold bg-white shadow" style={{ color: INK }}>{selected.name}</div>
                                    {selected.lat && <div className="text-[11px] mt-1" style={{ color: BLUE_DK }}>{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</div>}
                                </>
                            ) : (
                                <div className="text-sm font-semibold" style={{ color: MUTED }}>選擇下方地點以預覽位置</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 結果列表 */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                    {list.length === 0 && (
                        <button onClick={() => setSelected({ name: query, address: "自訂地點", lat: null, lng: null })}
                            className="w-full text-left p-3 rounded-2xl" style={{ background: "var(--field)" }}>
                            使用自訂地點：「<b style={{ color: BLUE_DK }}>{query}</b>」
                        </button>
                    )}
                    {list.map((p, i) => {
                        const on = selected && selected.name === p.name;
                        return (
                            <button key={i} onClick={() => choose(p)}
                                className="w-full text-left p-3 rounded-2xl flex items-start gap-3 transition"
                                style={{ background: on ? SOFT : "var(--field)", boxShadow: on ? `inset 0 0 0 2px ${BLUE}` : "none" }}>
                                <MapPin size={20} style={{ color: BLUE, marginTop: 2 }} />
                                <div>
                                    <div className="font-bold" style={{ color: INK }}>{p.name}</div>
                                    <div className="text-sm" style={{ color: MUTED }}>{p.address}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-3 p-5 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-extrabold shadow" style={{ background: "var(--surface)", color: INK }}>取消</button>
                    <button disabled={!selected} onClick={() => { onSelect(selected); onClose(); }}
                        className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow disabled:opacity-40"
                        style={{ background: `linear-gradient(180deg,${BLUE2},${BLUE})` }}>確認地點</button>
                </div>
            </div>
        </div>
    );
}
