import { useNavigate } from "react-router-dom";
import { CheckCircle, Plus, Clock } from "lucide-react";
import { useGuestLang } from "../../context/GuestLangContext";
import { getLangDir }   from "../../lib/i18n";
import { getHistory }   from "../../lib/history";

export default function SuccessPage() {
  const { t, lang } = useGuestLang();
  const navigate    = useNavigate();
  const hotelId     = localStorage.getItem("guest_hotel_id");
  const history     = getHistory(hotelId || "");

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={getLangDir(lang)}>
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 animate-scale-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">{t("successTitle")}</h1>
        <p className="text-gray-400 text-center text-sm max-w-xs">{t("successDesc")}</p>
      </div>

      {history.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t("history")}</p>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl flex-shrink-0">{item.service_icon || "🛎"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{item.service_name}</p>
                  <p className="text-xs text-gray-400">🏠 {item.room}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                  <Clock size={11} /> {new Date(item.at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-8 pt-2">
        <button
          onClick={() => navigate(`/hotel-service/g${hotelId ? `?h=${hotelId}` : ""}`)}
          className="btn-primary gap-2">
          <Plus size={16} /> {t("newRequest")}
        </button>
      </div>
    </div>
  );
}
