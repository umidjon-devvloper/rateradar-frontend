import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check } from "lucide-react";
import { useHotel }      from "../../context/HotelContext";
import { useToast }      from "../../context/ToastContext";
import { ALL_LANGUAGES } from "../../lib/i18n";
import SearchableSelect  from "../../components/ui/SearchableSelect";
import api               from "../../lib/api";

const langOptions = ALL_LANGUAGES.map(l => ({
  value:    l.code,
  label:    l.native,
  sublabel: l.en,
}));

export default function SettingsPage() {
  const { t }                  = useOutletContext();
  const { hotel, updateHotelInfo } = useHotel();
  const { toast }              = useToast();

  const [lang,   setLang]   = useState(hotel?.language || "ru");
  const [saving, setSaving] = useState(false);

  const saveLang = async () => {
    try {
      setSaving(true);
      await api.put("/hotel/settings", { language: lang });
      updateHotelInfo({ language: lang });
      toast(t("saved"), "success");
    } catch { toast(t("error"), "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900">{t("settingsTitle")}</h1>

      {/* Hotel tili */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1">{t("hotelLang")}</h2>
        <p className="text-sm text-gray-400 mb-4">{t("hotelLangDesc")}</p>

        <SearchableSelect
          value={lang}
          onChange={setLang}
          options={langOptions}
          placeholder={t("hotelLang")}
          searchPlaceholder={t("searchLang")}
          className="mb-4"
        />

        <button onClick={saveLang} disabled={saving || lang === hotel?.language}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
          {saving
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Check size={15} />}
          {t("save")}
        </button>
      </div>

      {/* Hotel ma'lumotlari */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">{t("hotelInfo")}</h2>
        <div className="space-y-2">
          <Row label={t("name")}         value={hotel?.hotel_name} />
          <Row label={t("id")}           value={hotel?.hotel_id} mono />
          <Row label={t("subscription")} value={hotel?.subscription?.active ? t("subActive") : t("subInactive")} />
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, mono }) => (
  <div className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs font-semibold text-gray-400 w-20 flex-shrink-0 uppercase tracking-wide">{label}</span>
    <span className={`text-sm text-gray-700 flex-1 ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
  </div>
);
