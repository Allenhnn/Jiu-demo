/* =================================================================== */
/*  共用工具函式                                                        */
/* =================================================================== */

/* 解析 Google 登入回傳的 JWT（僅取 payload，失敗回空物件） */
export function jwtDecode(token) {
    try {
        const b = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(decodeURIComponent(escape(atob(b))));
    } catch { return {}; }
}

/* 今天日期字串：YYYY/MM/DD */
export const today = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
};
