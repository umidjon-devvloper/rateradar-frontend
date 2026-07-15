import { useEffect, useState } from "react";
import { Tv, Plus, Trash2, Pencil, Check, X, RefreshCw, Circle, Eye } from "lucide-react";
import { useHotel } from "../../context/HotelContext";
import { useToast } from "../../context/ToastContext";
import { qrApi } from "../../lib/qrApi";
import api from "../../lib/api";

// Sahifa matnlari (panel tili EmbeddedLayout'dan kelmaydi — sodda lokal TXT)
const TXT = {
  uz: {
    title: "TV qurilmalar",
    desc: "Xonalardagi Android TV'lar. TV ilovasi ochilganda ekranda 6 xonali kod chiqadi — shu kodni bu yerga kiritib qurilmani ulang. Obuna tugasa TV'lar avtomatik bloklanadi.",
    codePlaceholder: "TV ekranidagi 6 xonali kod",
    roomPlaceholder: "Xona (ixtiyoriy)",
    pair: "Ulash",
    empty: "Hali TV ulanmagan. TV'da ilovani oching va koddagi raqamni kiriting.",
    online: "Online",
    offline: "Offline",
    never: "Hech qachon",
    room: "Xona",
    unlink: "Uzish",
    confirmUnlink: "Bu TV uzilsinmi? U aktivatsiya ekraniga qaytadi.",
    paired: "TV ulandi ✅",
    unlinked: "Uzildi",
    saved: "Saqlandi",
    error: "Xatolik",
    total: "ta qurilma",
  },
  ru: {
    title: "ТВ-устройства",
    desc: "Android TV в номерах. При открытии ТВ-приложения на экране появится 6-значный код — введите его здесь для привязки. При окончании подписки ТВ блокируются автоматически.",
    codePlaceholder: "6-значный код с экрана ТВ",
    roomPlaceholder: "Номер (необязательно)",
    pair: "Привязать",
    empty: "ТВ пока не привязаны. Откройте приложение на ТВ и введите код.",
    online: "Онлайн",
    offline: "Оффлайн",
    never: "Никогда",
    room: "Номер",
    unlink: "Отвязать",
    confirmUnlink: "Отвязать это ТВ? Оно вернётся на экран активации.",
    paired: "ТВ привязано ✅",
    unlinked: "Отвязано",
    saved: "Сохранено",
    error: "Ошибка",
    total: "устройств",
  },
  en: {
    title: "TV devices",
    desc: "Android TVs in rooms. When the TV app opens, a 6-digit code appears on screen — enter it here to pair. TVs lock automatically when the subscription expires.",
    codePlaceholder: "6-digit code from the TV screen",
    roomPlaceholder: "Room (optional)",
    pair: "Pair",
    empty: "No TVs paired yet. Open the app on the TV and enter the code.",
    online: "Online",
    offline: "Offline",
    never: "Never",
    room: "Room",
    unlink: "Unlink",
    confirmUnlink: "Unlink this TV? It will return to the activation screen.",
    paired: "TV paired ✅",
    unlinked: "Unlinked",
    saved: "Saved",
    error: "Error",
    total: "devices",
  },
};

export default function TvDevicesPage() {
  const { hotel } = useHotel();
  const { toast } = useToast();
  const lang = localStorage.getItem("admin_lang") || "uz";
  const t = (k) => TXT[lang]?.[k] || TXT.en[k] || k;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]); // QR yaratilgan xonalar ro'yxati
  const [pairing, setPairing] = useState(false);
  const [editing, setEditing] = useState(null); // { id, room_number, name }

  // QR yaratilgan xonalarni olamiz — TV'ga xona ro'yxatdan TANLANADI,
  // shunda TV'dagi QR aynan o'sha xonaning QR'i bilan bir xil bo'ladi.
  useEffect(() => {
    if (!hotel?.hotel_id) return;
    qrApi.list(hotel.hotel_id)
      .then((d) => setRooms((d.items || []).map((it) => String(it.room))))
      .catch(() => setRooms([])); // QR-servis o'chiq bo'lsa — qo'lda yozish qoladi
  }, [hotel?.hotel_id]);

  // TV preview — vitrina qanday ko'rinishini yangi oynada ochish
  const openPreview = () => {
    const r = room || rooms[0] || "101";
    window.open(`/tv?preview=${encodeURIComponent(hotel?.hotel_id || "")}&room=${encodeURIComponent(r)}`, "_blank");
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hotel/tv-devices");
      setDevices(data);
    } catch { toast(t("error"), "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000); // online holati yangilanib tursin
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pair = async () => {
    const c = code.replace(/\D/g, "");
    if (c.length !== 6) { toast(t("codePlaceholder"), "warning"); return; }
    try {
      setPairing(true);
      await api.post("/hotel/tv-devices/pair", { code: c, room_number: room.trim() });
      setCode(""); setRoom("");
      toast(t("paired"), "success");
      load();
    } catch (err) {
      toast(err.response?.data?.message || t("error"), "error");
    } finally { setPairing(false); }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/hotel/tv-devices/${editing.id}`, {
        room_number: editing.room_number,
        name: editing.name,
      });
      setEditing(null);
      toast(t("saved"), "success");
      load();
    } catch { toast(t("error"), "error"); }
  };

  const unlink = async (d) => {
    if (!confirm(t("confirmUnlink"))) return;
    try {
      await api.delete(`/hotel/tv-devices/${d._id}`);
      setDevices((p) => p.filter((x) => x._id !== d._id));
      toast(t("unlinked"), "info");
    } catch { toast(t("error"), "error"); }
  };

  const fmtSeen = (d) => {
    if (!d.last_seen) return t("never");
    const min = Math.round((Date.now() - new Date(d.last_seen).getTime()) / 60000);
    if (min < 1) return "hozir";
    if (min < 60) return `${min} daq`;
    const h = Math.floor(min / 60);
    return h < 24 ? `${h} soat` : new Date(d.last_seen).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Tv size={20} className="text-blue-600" /> {t("title")}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{devices.length} {t("total")}</p>
        </div>
        {/* TV vitrina qanday ko'rinishini oldindan ko'rish */}
        <button onClick={openPreview}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">
          <Eye size={15} /> TV preview
        </button>
      </div>

      <div className="card p-5">
        <p className="text-sm text-gray-500 mb-4">{t("desc")}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text" inputMode="numeric" maxLength={7} value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && pair()}
            placeholder={t("codePlaceholder")}
            className="input flex-1 text-center text-lg font-mono tracking-[0.3em]"
          />
          {rooms.length > 0 ? (
            /* Xona QR yaratilganlardan TANLANADI — TV QR'i xonaga aniq mos bo'ladi */
            <select value={room} onChange={(e) => setRoom(e.target.value)}
              className="input w-full sm:w-44">
              <option value="">{t("roomPlaceholder")}</option>
              {rooms.map((r) => (
                <option key={r} value={r}>{t("room")} {r}</option>
              ))}
            </select>
          ) : (
            <input
              type="text" value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder={t("roomPlaceholder")}
              className="input w-full sm:w-40"
            />
          )}
          <button onClick={pair} disabled={pairing || code.replace(/\D/g, "").length !== 6}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
            {pairing ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
            {t("pair")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : devices.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">📺</p>
          <p className="text-sm text-gray-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {["", t("title"), t("room"), "Faollik", ""].map((h, i) => (
                  <th key={i} className="table-head-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {devices.map((d) => {
                const isEd = editing?.id === d._id;
                return (
                  <tr key={d._id} className="hover:bg-gray-50/40">
                    <td className="table-cell w-10">
                      <Circle size={9}
                        className={d.online ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"} />
                    </td>
                    <td className="table-cell">
                      {isEd ? (
                        <input value={editing.name}
                          onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                          className="input py-1.5 text-sm w-32" />
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{d.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {d.online ? t("online") : t("offline")}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {isEd ? (
                        rooms.length > 0 ? (
                          <select value={editing.room_number}
                            onChange={(e) => setEditing((p) => ({ ...p, room_number: e.target.value }))}
                            className="input py-1.5 text-sm w-28">
                            <option value="">—</option>
                            {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <input value={editing.room_number}
                            onChange={(e) => setEditing((p) => ({ ...p, room_number: e.target.value }))}
                            className="input py-1.5 text-sm w-24" />
                        )
                      ) : (
                        d.room_number || <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell text-xs text-gray-500">{fmtSeen(d)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isEd ? (
                          <>
                            <button onClick={saveEdit}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                              <Check size={13} />
                            </button>
                            <button onClick={() => setEditing(null)}
                              className="p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditing({ id: d._id, room_number: d.room_number || "", name: d.name || "TV" })}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => unlink(d)}
                              title={t("unlink")}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
