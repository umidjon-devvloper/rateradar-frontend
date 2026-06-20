import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { QrCode, Plus, Printer, Trash2, Download, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";
import { useHotel } from "../../context/HotelContext";
import { useToast } from "../../context/ToastContext";
import { qrApi } from "../../lib/qrApi";

// Sahifa matnlari (admin tiliga qarab)
const TXT = {
  uz: {
    title: "Xona QR kodlari",
    desc: "Har bir xona uchun QR yarating, chop eting va xonaga joylashtiring. Mehmon QR'ni skanlaganda xona raqami avtomatik to'ladi.",
    roomsLabel: "Xona raqamlari",
    roomsHint: "Vergul yoki probel bilan: 101, 102, 103 — yoki oraliq: 101-120",
    generate: "QR yaratish",
    generating: "Yaratilmoqda...",
    printAll: "Hammasini chop etish",
    print: "Chop etish",
    open: "Brauzerda ochish",
    download: "Yuklab olish",
    del: "O'chirish",
    empty: "Hali QR kod yo'q. Yuqorida xona raqamlarini kiriting.",
    room: "Xona",
    offline: "QR-servisga ulanib bo'lmadi. Python servis ishlab turganini tekshiring (qr-service, port 8000).",
    added: "QR kodlar yaratildi ✅",
    deleted: "O'chirildi",
    error: "Xatolik yuz berdi",
    confirmDel: "Bu xona QR kodini o'chirasizmi?",
  },
  ru: {
    title: "QR-коды номеров",
    desc: "Создайте QR для каждого номера, распечатайте и разместите в комнате. При сканировании номер заполняется автоматически.",
    roomsLabel: "Номера комнат",
    roomsHint: "Через запятую/пробел: 101, 102, 103 — или диапазон: 101-120",
    generate: "Создать QR",
    generating: "Создание...",
    printAll: "Печать всех",
    print: "Печать",
    open: "Открыть в браузере",
    download: "Скачать",
    del: "Удалить",
    empty: "Пока нет QR-кодов. Введите номера комнат выше.",
    room: "Номер",
    offline: "Не удалось подключиться к QR-сервису. Проверьте, что Python-сервис запущен (qr-service, порт 8000).",
    added: "QR-коды созданы ✅",
    deleted: "Удалено",
    error: "Произошла ошибка",
    confirmDel: "Удалить QR этого номера?",
  },
  en: {
    title: "Room QR codes",
    desc: "Generate a QR for each room, print it and place it in the room. Scanning auto-fills the room number.",
    roomsLabel: "Room numbers",
    roomsHint: "Comma/space separated: 101, 102, 103 — or a range: 101-120",
    generate: "Generate QR",
    generating: "Generating...",
    printAll: "Print all",
    print: "Print",
    open: "Open in browser",
    download: "Download",
    del: "Delete",
    empty: "No QR codes yet. Enter room numbers above.",
    room: "Room",
    offline: "Could not reach the QR service. Make sure the Python service is running (qr-service, port 8000).",
    added: "QR codes generated ✅",
    deleted: "Deleted",
    error: "Something went wrong",
    confirmDel: "Delete this room's QR code?",
  },
};

// "101, 102 103" yoki "101-105" → ["101","102",...]
function parseRooms(input) {
  const out = [];
  const seen = new Set();
  for (const part of input.split(/[\s,]+/).filter(Boolean)) {
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      let a = parseInt(range[1], 10);
      let b = parseInt(range[2], 10);
      if (a > b) [a, b] = [b, a];
      if (b - a > 500) b = a + 500; // xavfsizlik chegarasi
      for (let i = a; i <= b; i++) {
        const v = String(i);
        if (!seen.has(v)) { seen.add(v); out.push(v); }
      }
    } else if (!seen.has(part)) {
      seen.add(part);
      out.push(part);
    }
  }
  return out;
}

export default function RoomQrPage() {
  const { adminLang } = useOutletContext();
  const t = (k) => (TXT[adminLang] || TXT.en)[k] || TXT.en[k] || k;
  const { hotel } = useHotel();
  const { toast } = useToast();
  const hotelId = hotel?.hotel_id;

  const [items, setItems] = useState([]);
  const [roomsInput, setRoomsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = async () => {
    if (!hotelId) return;
    try {
      setLoading(true);
      const data = await qrApi.list(hotelId);
      setItems(data.items || []);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const handleGenerate = async () => {
    const rooms = parseRooms(roomsInput);
    if (!rooms.length) return;
    try {
      setBusy(true);
      // Joriy origin (masalan http://192.168.1.10:5173) — QR shu manzilni
      // yozadi, shunda bir xil Wi-Fi'dagi telefon ocha oladi.
      await qrApi.generate(hotelId, rooms, window.location.origin);
      setRoomsInput("");
      toast(t("added"), "success");
      setOffline(false);
      await load();
    } catch {
      setOffline(true);
      toast(t("offline"), "error", 8000);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDel"))) return;
    try {
      await qrApi.remove(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast(t("deleted"), "success");
    } catch {
      toast(t("error"), "error");
    }
  };

  const printCards = (list) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const cards = list
      .map(
        (it) => `
        <div class="card">
          <img src="${it.image_url}" />
          <div class="room">${t("room")} ${it.room}</div>
          <div class="hotel">${hotel?.hotel_name || ""}</div>
        </div>`
      )
      .join("");
    w.document.write(`
      <html><head><title>QR — ${hotel?.hotel_name || ""}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 16px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px;
                text-align: center; page-break-inside: avoid; }
        .card img { width: 100%; max-width: 240px; height: auto; }
        .room { font-size: 22px; font-weight: 700; margin-top: 8px; }
        .hotel { font-size: 12px; color: #6b7280; margin-top: 2px; }
        @media print { @page { margin: 12mm; } }
      </style></head>
      <body><div class="grid">${cards}</div>
      <script>window.onload = () => { setTimeout(() => window.print(), 400); };</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <QrCode size={20} className="text-blue-600" /> {t("title")}
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">{t("desc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost" title={t("refresh")}>
            <RefreshCw size={15} />
          </button>
          {items.length > 0 && (
            <button
              onClick={() => printCards(items)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer size={15} /> {t("printAll")}
            </button>
          )}
        </div>
      </div>

      {/* Generatsiya */}
      <div className="card p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          {t("roomsLabel")}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={roomsInput}
            onChange={(e) => setRoomsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="101, 102, 103  yoki  101-120"
            className="input flex-1"
          />
          <button
            onClick={handleGenerate}
            disabled={busy || !roomsInput.trim()}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            {busy ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {busy ? t("generating") : t("generate")}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">{t("roomsHint")}</p>
      </div>

      {offline && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{t("offline")}</span>
        </div>
      )}

      {/* Ro'yxat */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        !offline && <p className="text-center text-sm text-gray-400 py-12">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.id} className="card p-3 text-center group">
              <img
                src={it.image_url}
                alt={`QR ${it.room}`}
                className="w-full aspect-square object-contain rounded-lg bg-white"
              />
              <div className="mt-2 font-bold text-gray-900">
                {t("room")} {it.room}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <button onClick={() => printCards([it])} className="btn-ghost p-1.5" title={t("print")}>
                  <Printer size={14} />
                </button>
                <a
                  href={it.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost p-1.5"
                  title={t("open")}
                >
                  <ExternalLink size={14} />
                </a>
                <a href={it.image_url} download className="btn-ghost p-1.5" title={t("download")}>
                  <Download size={14} />
                </a>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="btn-ghost p-1.5 text-red-400 hover:text-red-600"
                  title={t("del")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
