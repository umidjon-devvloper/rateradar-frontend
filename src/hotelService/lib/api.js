import axios from "axios";

// Asosiy ilova bilan bir xil API bazasidan foydalanamiz. Prod'da frontend
// (thehotelsaas.com) va backend (api.thehotelsaas.com) alohida domenda —
// shuning uchun relative "/api" emas, VITE_API_URL ishlatiladi.
const API_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: `${API_URL}/hotel-service`, timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hotel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hotel_token");
      window.location.href = "/hotel-service/auth";
    }
    return Promise.reject(err);
  }
);

// Yuklangan rasm (/uploads/...) uchun to'liq URL — API backend'i domenidan.
// Tashqi (http...) URL bo'lsa o'zgarishsiz qaytadi.
export const assetUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
};

export default api;
