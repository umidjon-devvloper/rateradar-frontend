import axios from "axios";

// Mustaqil Python QR-servis (default localhost:8000). Boshqa manzilga
// o'tkazish uchun frontend .env'da VITE_QR_API ni belgilang.
const QR_BASE = import.meta.env.VITE_QR_API || "http://localhost:8000";

const qr = axios.create({ baseURL: QR_BASE, timeout: 30000 });

export const qrApi = {
  base: QR_BASE,
  list: (hotelId) =>
    qr.get("/api/qr/list", { params: { hotel_id: hotelId } }).then((r) => r.data),
  generate: (hotelId, rooms, clientUrl) =>
    qr
      .post("/api/qr/generate", {
        hotel_id: hotelId,
        rooms,
        // Admin qaysi manzilda turgan bo'lsa, QR ham o'shani yozsin —
        // shunda telefon (LAN IP / public domen) orqali ochiladi.
        client_url: clientUrl,
      })
      .then((r) => r.data),
  remove: (id) => qr.delete(`/api/qr/${id}`).then((r) => r.data),
};
