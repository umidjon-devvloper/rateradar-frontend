import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import { useGuestLang }  from "../../context/GuestLangContext";
import { getLangDir }    from "../../lib/i18n";
import { addToHistory }  from "../../lib/history";
import api               from "../../lib/api";

export default function ConfirmPage() {
  const { t, lang }  = useGuestLang();
  const navigate     = useNavigate();
  const { state }    = useLocation();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  if (!state?.service) { navigate("/hotel-service/g"); return null; }

  // Branding (ServicePage saqlagan) — tasdiqlash tugmasi rangi uchun
  let primary = "#2563eb";
  try { primary = JSON.parse(localStorage.getItem("hs_brand") || "{}").primary_color || primary; } catch {}
  const { hotelId, room_number, service, sub_option, description } = state;

  const handleConfirm = async () => {
    try {
      setLoading(true); setError("");
      await api.post("/guest/requests", {
        hotel_id: hotelId, room_number,
        service_id: service._id,
        sub_option, description, guest_lang: lang,
      });
      addToHistory(hotelId, {
        service_name: service.translated_name || service.name,
        service_icon: service.icon,
        room: room_number,
      });
      navigate("/hotel-service/g/success", { replace: true });
    } catch { setError(t("errorSend")); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white" dir={getLangDir(lang)}>
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-1.5 -ml-1">
            <ChevronLeft size={20} />
          </button>
          <p className="font-semibold text-gray-900">{t("confirmTitle")}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-gray-400">{t("confirmDesc")}</p>

        <div className="card divide-y divide-gray-50">
          <Row label={t("room")}    value={`🏠 ${room_number}`} highlight />
          <Row label={t("service")} value={`${service.icon || "🛎"} ${service.translated_name || service.name}`} />
          {sub_option   && <Row label={t("type")} value={sub_option} />}
          {description  && <Row label={t("note")} value={description} />}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-2.5 pt-2">
          <button onClick={handleConfirm} disabled={loading} className="btn-primary gap-2" style={{ backgroundColor: primary }}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("sending")}</>
              : <><Send size={15} />{t("confirm")}</>}
          </button>
          <button onClick={() => navigate(-1)} disabled={loading} className="btn-secondary">{t("back")}</button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, highlight }) => (
  <div className={`flex items-center gap-4 px-4 py-3.5 ${highlight ? "bg-blue-50/50" : ""}`}>
    <span className="text-xs font-semibold text-gray-400 w-16 flex-shrink-0 uppercase tracking-wide">{label}</span>
    <span className={`text-sm font-medium flex-1 ${highlight ? "text-blue-700" : "text-gray-800"}`}>{value}</span>
  </div>
);
