import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Copy, Users, RefreshCw } from "lucide-react";
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

  // Telegram guruh holati — /hotel/me dan yangi ma'lumot (group_chat_id, invite_code)
  const [me, setMe] = useState(null);
  const loadMe = async () => {
    try { const { data } = await api.get("/hotel/me"); setMe(data); } catch { /* jim */ }
  };
  useEffect(() => { loadMe(); }, []);

  const linkCmd = me?.invite_code ? `/ulash ${me.invite_code}` : "";
  const copyCmd = () => {
    navigator.clipboard.writeText(linkCmd);
    toast(t("copied") || "Nusxalandi", "success");
  };

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

      {/* Telegram GURUH integratsiyasi */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-blue-600" /> Telegram guruh
          </h2>
          <button onClick={loadMe} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="Yangilash">
            <RefreshCw size={14} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Botni guruhga qo'shsangiz, mehmonlarning barcha buyurtmalari xodimlarga
          shaxsiy xabardan tashqari shu guruhga ham tushadi.
        </p>

        {me?.group_chat_id ? (
          <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm">
            <Check size={16} className="flex-shrink-0" />
            <span>Ulangan: <b>{me.group_title || "guruh"}</b>. Uzish uchun guruhda <code className="font-mono bg-white/60 px-1 rounded">/uzish</code> yozing.</span>
          </div>
        ) : (
          <ol className="space-y-2.5 text-sm text-gray-600 list-decimal list-inside">
            <li>
              Botni guruhga qo'shing:{" "}
              {me?.bot_username
                ? <a href={`https://t.me/${me.bot_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">@{me.bot_username}</a>
                : <span className="font-medium">xizmat botini</span>}
            </li>
            <li>
              Guruhda shu buyruqni yuboring:
              <span className="inline-flex items-center gap-1.5 ml-1.5 bg-gray-100 rounded-lg px-2 py-1">
                <code className="font-mono text-xs text-gray-800">{linkCmd || "/ulash inv_..."}</code>
                {linkCmd && (
                  <button onClick={copyCmd} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Copy size={12} />
                  </button>
                )}
              </span>
            </li>
            <li>Bot tasdiqlagach, buyurtmalar guruhga tushadi. Guruhdan istalgan kishi «Qabul qilish»ni bosishi mumkin.</li>
          </ol>
        )}
      </div>

      {/* ADMIN shaxsiy bot ulanishi */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
          👑 Admin nazorati (shaxsiy bot)
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          O'zingizni botga ulasangiz: barcha buyurtmalar, «5 daqiqada hech kim olmadi»
          va «2.5 soatda bajarilmadi (kim olgani bilan)» ogohlantirishlari shaxsiy chatga keladi.
        </p>

        {me?.admin_telegram_id ? (
          <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm">
            <Check size={16} className="flex-shrink-0" />
            <span>Ulangan: <b>{me.admin_name || "admin"}</b>. Uzish uchun botga <code className="font-mono bg-white/60 px-1 rounded">/uzish</code> yozing.</span>
          </div>
        ) : (
          <ol className="space-y-2.5 text-sm text-gray-600 list-decimal list-inside">
            <li>
              Botni oching:{" "}
              {me?.bot_username
                ? <a href={`https://t.me/${me.bot_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">@{me.bot_username}</a>
                : <span className="font-medium">xizmat boti</span>}
            </li>
            <li>
              Shaxsiy chatda shu buyruqni yuboring:
              <span className="inline-flex items-center gap-1.5 ml-1.5 bg-gray-100 rounded-lg px-2 py-1">
                <code className="font-mono text-xs text-gray-800">{linkCmd || "/ulash inv_..."}</code>
                {linkCmd && (
                  <button onClick={copyCmd} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Copy size={12} />
                  </button>
                )}
              </span>
            </li>
          </ol>
        )}
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
