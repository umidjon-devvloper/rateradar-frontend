import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor — token + aktiv hotel ID qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rr_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Aktiv hotel ID — backend resolveHotel middleware uchun. Foydalanuvchi
  // bir nechta hotelga ega bo'lsa, qaysi biri ustida ishlayotganini ko'rsatadi.
  const activeHotelId = localStorage.getItem("rr_active_hotel_id");
  if (activeHotelId) {
    config.headers["X-Hotel-Id"] = activeHotelId;
  }
  return config;
});

// Response interceptor — 401 da logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        localStorage.removeItem("rr_token");
        localStorage.removeItem("rr_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// ─── Endpoint metodlari ─────────────────────────────
export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (data) => api.put("/auth/me", data).then((r) => r.data),
};

export const searchApi = {
  countries: () => api.get("/search/countries").then((r) => r.data.countries),
  cities: (q, country) =>
    api
      .get("/search/cities", { params: { q, country } })
      .then((r) => r.data.cities),
  hotels: (q, country, city, opts = {}) =>
    api
      .get("/search/hotels", {
        params: { q, country, ...city, ...(opts.direct && { direct: 1 }) },
        timeout: opts.direct ? 20000 : undefined, // jonli Google qidiruvi sekinroq
      })
      .then((r) => r.data.hotels),
  geocode: (address) =>
    api.get("/search/geocode", { params: { address } }).then((r) => r.data),
};

export const hotelApi = {
  create: (data) => api.post("/hotels", data).then((r) => r.data.hotel),
  getMine: () => api.get("/hotels/me").then((r) => r.data.hotel),
  collectStatus: () => api.get("/hotels/me/collect-status").then((r) => r.data),
  listAll: () => api.get("/hotels/mine/all").then((r) => r.data.hotels),
  update: (data) => api.put("/hotels/me", data).then((r) => r.data.hotel),
  enrich: () => api.post("/hotels/me/enrich").then((r) => r.data),
  findBookingUrl: (autoSave = true) =>
    api.post("/hotels/me/find-booking-url", { autoSave, ota: 'Booking.com' }).then((r) => r.data),
  findOtaUrl: (ota, autoSave = true) =>
    api.post("/hotels/me/find-booking-url", { autoSave, ota }).then((r) => r.data),
  otaPrices: () => api.get("/hotels/me/ota-prices").then((r) => r.data),
  xoteloRates: () =>
    api.get("/hotels/me/xotelo-rates", { timeout: 60 * 1000 }).then((r) => r.data),
  // "Aha moment" — bepul Xotelo orqali o'z + raqiblar narxini avtomatik oladi.
  // Birinchi marta raqiblarni topish + DuckDuckGo qidiruvlari sababli sekinroq.
  instantSnapshot: () =>
    api.post("/hotels/me/instant-snapshot", null, { timeout: 120 * 1000 }).then((r) => r.data),
  categoryRatings: (refresh = false) =>
    api
      .get("/hotels/me/category-ratings", { params: refresh ? { refresh: true } : {}, timeout: 90 * 1000 })
      .then((r) => r.data),
  otaChannels: (opts = {}) =>
    api.get("/hotels/me/ota-channels", { params: { lite: opts.lite !== false } }).then((r) => r.data),
  fetchOtaChannel: (source) =>
    api.post("/hotels/me/ota-channels/fetch", { source }, { timeout: 4 * 60 * 1000 }).then((r) => r.data),
  fetchAllOtaChannels: () =>
    api.post("/hotels/me/ota-channels/fetch-all", null, { timeout: 2 * 60 * 1000 }).then((r) => r.data),
  otaChannelDetail: (source) =>
    api.get(`/hotels/me/ota-channels/${encodeURIComponent(source)}`).then((r) => r.data),
  setOtaChannelPrice: (source, price) =>
    api
      .put(`/hotels/me/ota-channels/${encodeURIComponent(source)}/price`, { price })
      .then((r) => r.data),
  competitors: () =>
    api.get("/hotels/competitors").then((r) => r.data.competitors),
  discoverNearby: (lat, lng, radius = 2) =>
    api
      .get("/hotels/discover-nearby", { params: { lat, lng, radius } })
      .then((r) => r.data),
  addCompetitor: (data) =>
    api.post("/hotels/competitors", data).then((r) => r.data.competitor),
  deleteCompetitor: (id) =>
    api.delete(`/hotels/competitors/${id}`).then((r) => r.data),
  fetchCompetitorPrice: (id) =>
    // Apify Booking fallback 30-60s davom etishi mumkin — 3 daqiqa timeout.
    api
      .post(`/hotels/competitors/${id}/fetch-price`, null, { timeout: 3 * 60 * 1000 })
      .then((r) => r.data),
  fetchCompetitorXotelo: (id) =>
    api.post(`/hotels/competitors/${id}/fetch-xotelo`).then((r) => r.data),
  fetchCompetitorHasData: (id) =>
    // HasData Booking.com scraping 30-90s davom etishi mumkin — 2 daqiqa timeout.
    api
      .post(`/hotels/competitors/${id}/fetch-hasdata`, null, { timeout: 2 * 60 * 1000 })
      .then((r) => r.data),
  getCompetitorDetail: (id) =>
    api.get(`/hotels/competitors/${id}/detail`).then((r) => r.data),
  updateCompetitorOtaUrls: (id, otaUrls) =>
    api.put(`/hotels/competitors/${id}/ota-urls`, { otaUrls }).then((r) => r.data.competitor),
  fetchCompetitorChannel: (id, source) =>
    // Apify kanal so'rovi 30-90s davom etishi mumkin — 3 daqiqa timeout.
    api
      .post(`/hotels/competitors/${id}/fetch-channel`, { source }, { timeout: 3 * 60 * 1000 })
      .then((r) => r.data),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  users: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  user: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  recentUsers: (limit = 20) =>
    api.get("/admin/users/recent", { params: { limit } }).then((r) => r.data),
  activeUsers: () => api.get("/admin/users/active").then((r) => r.data),
  toggleUser: (id) =>
    api.patch(`/admin/users/${id}/toggle`).then((r) => r.data),
  // Qo'lda Pro dostup berish: days = 30 | 365 | 0 (doimiy)
  grantPlan: (id, days) =>
    api.patch(`/admin/users/${id}/grant`, { days }).then((r) => r.data),
  revokePlan: (id) =>
    api.patch(`/admin/users/${id}/revoke`).then((r) => r.data),
  apiStats: () => api.get("/admin/api-stats").then((r) => r.data),
  transactions: (params) =>
    api.get("/admin/transactions", { params }).then((r) => r.data),
  broadcast: (data) => api.post("/admin/broadcast", data).then((r) => r.data),
};

export const securityApi = {
  overview: () => api.get("/admin/security/overview").then((r) => r.data),
  events: (params = {}) =>
    api.get("/admin/security/events", { params }).then((r) => r.data),
  banned: () => api.get("/admin/security/banned").then((r) => r.data),
  ban: (data) => api.post("/admin/security/ban", data).then((r) => r.data),
  unban: (ip) => api.post("/admin/security/unban", { ip }).then((r) => r.data),
};

export const aiApi = {
  status: () => api.get("/ai/status").then((r) => r.data),
  priceRecommendations: (lang = "uz", refresh = false) =>
    api
      .get("/ai/price-recommendations", { params: refresh ? { lang, refresh: true } : { lang } })
      .then((r) => r.data),
  summarizeReviews: (lang = "uz") =>
    api.get("/ai/summarize-reviews", { params: { lang } }).then((r) => r.data),
  analyzeReview: (text, lang = "uz") =>
    api.post("/ai/analyze-review", { text, lang }).then((r) => r.data),
  chat: (messages) =>
    axios.post(`${API_URL}/ai/chat`, { messages }).then((r) => r.data.reply),
  // AI-tahlil sahifasidagi shaxsiy yordamchi (hotel konteksti bilan, auth talab)
  assistantChat: (messages, lang = "uz") =>
    api.post("/ai/assistant-chat", { messages, lang }, { timeout: 60 * 1000 }).then((r) => r.data.reply),
  // Har bir OTA kanali uchun AI narx tavsiyasi (dashboard kartasi, 6h kesh)
  otaAdvice: (lang = "uz", refresh = false) =>
    api
      .get("/ai/ota-advice", { params: refresh ? { lang, refresh: true } : { lang }, timeout: 90 * 1000 })
      .then((r) => r.data),
};

export const notificationApi = {
  list: () => api.get("/notifications").then((r) => r.data),
  unreadCount: () => api.get("/notifications/unread-count").then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
  checkCompetitors: (lang = "uz") =>
    api
      .post("/notifications/check-competitors", null, { params: { lang } })
      .then((r) => r.data),
};

export const reviewApi = {
  list: (params = {}) => api.get("/reviews", { params }).then((r) => r.data),
  scrape: (reset = false) =>
    api
      .post("/reviews/scrape", null, { params: reset ? { reset: true } : {} })
      .then((r) => r.data),
  markSeen: (id) => api.patch(`/reviews/${id}/seen`).then((r) => r.data),
  markAllSeen: () => api.patch("/reviews/seen-all").then((r) => r.data),
  generateResponse: (id, lang = "ru") =>
    api.post(`/reviews/${id}/generate-response`, { lang }).then((r) => r.data),
  scrapeApify: (opts = {}) =>
    api.post("/reviews/scrape-apify", opts, { timeout: 6 * 60 * 1000 }).then((r) => r.data),
  scrapeTripadvisor: (reset = false) =>
    api
      .post("/reviews/scrape-tripadvisor", null, { params: reset ? { reset: true } : {}, timeout: 60 * 1000 })
      .then((r) => r.data),
};

export const paymentApi = {
  // Sotib olinadigan rejalar (public — token shart emas).
  plans: () => api.get("/payments/plans").then((r) => r.data),
  // 1-qadam: to'lov yaratish → paymentId
  create: (plan) => api.post("/payments/create", { plan }).then((r) => r.data),
  // ATMOS to'lov sahifasi (Visa/MC/UzCard/Humo) → { paymentId, url }
  createInvoice: (plan, successUrl) =>
    api
      .post("/payments/invoice", { plan, successUrl })
      .then((r) => r.data),
  // 2-qadam: karta yuborish → SMS-OTP keladi
  submitCard: (paymentId, cardNumber, expiry) =>
    api
      .post("/payments/card", { paymentId, cardNumber, expiry })
      .then((r) => r.data),
  // 3-qadam: OTP tasdiqlash → pul yechiladi, obuna yoqiladi
  confirm: (paymentId, otp) =>
    api.post("/payments/confirm", { paymentId, otp }).then((r) => r.data),
  resendOtp: (paymentId) =>
    api.post(`/payments/${paymentId}/resend-otp`).then((r) => r.data),
  list: () => api.get("/payments").then((r) => r.data.payments),
  get: (id) => api.get(`/payments/${id}`).then((r) => r.data.payment),
};

export const pricesApi = {
  rateShopper: (days = 7, channel = "all") =>
    api
      .get("/prices/rate-shopper", { params: { days, channel } })
      .then((r) => r.data),
  roomShopper: (days = 7, provider = "booking") =>
    api.get("/prices/room-shopper", { params: { days, provider } }).then((r) => r.data),
  refreshRooms: () =>
    api
      .post("/prices/refresh-rooms", null, { timeout: 5 * 60 * 1000 })
      .then((r) => r.data),
  refreshChannel: (channel) =>
    api
      .post(
        "/prices/refresh-channel",
        { channel },
        { timeout: 5 * 60 * 1000 },
      )
      .then((r) => r.data),
  refreshAll: () =>
    api
      .post("/prices/refresh-all", null, { timeout: 10 * 60 * 1000 })
      .then((r) => r.data),
};
