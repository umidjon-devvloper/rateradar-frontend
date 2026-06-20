import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, RefreshCw, Globe, ChevronDown, Search, Check, X } from "lucide-react";
import { useGuestLang }       from "../../context/GuestLangContext";
import { ALL_LANGUAGES, getLangDir } from "../../lib/i18n";
import { addToHistory }       from "../../lib/history";
import api                    from "../../lib/api";

// Inline til dropdown (guest uchun)
function LangDropdown({ lang, onChangeLang, translating }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");

  const cur = ALL_LANGUAGES.find(l => l.code === lang);
  const filtered = search
    ? ALL_LANGUAGES.filter(l =>
        l.en.toLowerCase().includes(search.toLowerCase()) ||
        l.native.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_LANGUAGES;

  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest("[data-langdrop]")) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="relative" data-langdrop>
      <button
        onClick={() => setOpen(p => !p)}
        disabled={translating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-sm font-medium text-gray-700 transition-all disabled:opacity-60"
      >
        {translating
          ? <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          : <Globe size={14} className="text-gray-400" />}
        <span className="uppercase text-xs">{cur?.code || lang}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={13} className="text-gray-400" />
            <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search language..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-gray-400" /></button>}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map(l => (
              <button key={l.code}
                onClick={() => { onChangeLang(l.code); setOpen(false); setSearch(""); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${lang === l.code ? "bg-blue-50" : ""}`}>
                <span className={`font-medium ${lang === l.code ? "text-blue-700" : "text-gray-800"}`}>{l.native}</span>
                <span className="text-gray-400 text-xs">{l.en}</span>
                {lang === l.code && <Check size={13} className="text-blue-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicePage() {
  const { t, lang, translating, changeLang } = useGuestLang();
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("h") || localStorage.getItem("guest_hotel_id");
  // Xona QR kodida ?room=101 bo'lsa — xona raqami avtomatik to'ldiriladi.
  const roomParam = searchParams.get("room");

  const [hotel,       setHotel]       = useState(null);
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const [room,        setRoom]        = useState(roomParam || localStorage.getItem("guest_room") || "");
  const [roomErr,     setRoomErr]     = useState("");
  const [selected,    setSelected]    = useState(null);
  const [subOption,   setSubOption]   = useState("");
  const [description, setDescription] = useState("");
  const [descErr,     setDescErr]     = useState("");

  // Brauzer tilini detect qilish (birinchi kirish uchun)
  useEffect(() => {
    const saved = localStorage.getItem("guest_lang");
    if (!saved) {
      const browserLang = navigator.language?.slice(0, 2) || "en";
      const supported = ALL_LANGUAGES.find(l => l.code === browserLang);
      if (supported && browserLang !== "en") changeLang(browserLang);
    }
  }, []);

  useEffect(() => {
    if (!hotelId) return;
    localStorage.setItem("guest_hotel_id", hotelId);
    document.documentElement.dir = getLangDir(lang);
    loadServices();
  }, [lang, hotelId]);

  const loadServices = async () => {
    try {
      setLoading(true); setError("");
      const [hotelRes, svcRes] = await Promise.all([
        api.get(`/guest/hotel/${hotelId}`),
        api.get(`/guest/services/${hotelId}?lang=${lang}`),
      ]);
      setHotel(hotelRes.data);
      setServices(svcRes.data);
      // Branding'ni saqlaymiz — Confirm/Success sahifalari ham ishlatadi
      try { localStorage.setItem("hs_brand", JSON.stringify(hotelRes.data.branding || {})); } catch {}
    } catch (err) {
      setError(err.response?.data?.code === "SUBSCRIPTION_INACTIVE"
        ? t("serviceUnavailable")
        : t("errorLoad"));
    } finally { setLoading(false); }
  };

  const handleSubmit = () => {
    if (!room.trim()) { setRoomErr(t("roomRequired")); return; }
    if (!selected) return;
    localStorage.setItem("guest_room", room.trim());
    navigate("/hotel-service/g/confirm", { state: {
      hotelId, room_number: room.trim(), lang,
      service: selected,
      sub_option: subOption || null,
      description: description.trim() || null,
    }});
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5">
      <div className="text-center max-w-xs">
        <p className="text-gray-500 mb-5 text-sm">{error}</p>
        <button onClick={loadServices} className="btn-primary flex items-center justify-center gap-2">
          <RefreshCw size={15} /> {t("retry")}
        </button>
      </div>
    </div>
  );

  // ── Branding token'lari (admin Dizayn sahifasidan) ──
  const brand = hotel?.branding || {};
  const primary = brand.primary_color || "#2563eb";
  const bgStyle = brand.bg_style || "light";
  const pageBg = bgStyle === "dark" ? "#0f172a" : bgStyle === "soft" ? "#f1f5f9" : "#ffffff";
  const fg = bgStyle === "dark" ? "#e2e8f0" : "#111827";
  const subc = bgStyle === "dark" ? "#94a3b8" : "#9ca3af";
  const cardBg = bgStyle === "dark" ? "#1e293b" : "#ffffff";
  const cardBorder = bgStyle === "dark" ? "#334155" : "#f1f5f9";
  const headerBg = bgStyle === "dark" ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)";
  const lbl = { color: subc };

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: fg }} dir={getLangDir(lang)}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur border-b z-10" style={{ backgroundColor: headerBg, borderColor: cardBorder }}>
        <div className={`max-w-lg mx-auto relative flex items-center px-4 ${brand.logo_url ? "justify-center h-[72px] sm:h-20" : "h-14 gap-3"}`}>
          {brand.logo_url
            ? <img src={brand.logo_url} alt={hotel?.hotel_name} className="h-12 sm:h-14 w-auto max-w-[55%] object-contain" />
            : <p className="font-semibold text-sm flex-1 truncate" style={{ color: fg }}>{hotel?.hotel_name}</p>}
          <div className={brand.logo_url ? "absolute right-3 top-1/2 -translate-y-1/2" : ""}>
            <LangDropdown lang={lang} onChangeLang={changeLang} translating={translating} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6 pb-24">
        {brand.welcome_text && (
          <p className="text-sm -mb-2" style={{ color: subc }}>{brand.welcome_text}</p>
        )}

        {/* Xona raqami */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={lbl}>
            {t("enterRoom")}
          </label>
          <input type="text" value={room}
            onChange={e => { setRoom(e.target.value); setRoomErr(""); }}
            placeholder={t("roomPlaceholder")}
            readOnly={!!roomParam}
            style={{ backgroundColor: cardBg, color: fg, borderColor: roomErr ? "#f87171" : cardBorder }}
            className={`input text-2xl font-bold text-center tracking-widest ${roomParam ? "cursor-default" : ""}`}
            autoComplete="off" />
          {roomErr && <p className="text-red-500 text-xs mt-1.5">{roomErr}</p>}
        </div>

        {/* Xizmatlar */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={lbl}>
            {t("howHelp")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {services.map(svc => {
              const isSelected = selected?._id === svc._id;
              return (
                <button key={svc._id}
                  onClick={() => { setSelected(svc); setSubOption(""); setDescription(""); setDescErr(""); }}
                  style={{
                    borderColor: isSelected ? primary : cardBorder,
                    backgroundColor: isSelected ? `${primary}14` : cardBg,
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all">
                  <span className="text-3xl">{svc.icon || "🛎"}</span>
                  <span className="text-xs font-semibold leading-tight" style={{ color: isSelected ? primary : fg }}>
                    {svc.translated_name || svc.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-options */}
        {selected && selected.sub_options?.length > 0 && (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={lbl}>
              {t("selectSubOption")}
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.sub_options.map(opt => {
                const name = opt.translated_name || opt.name;
                const on = subOption === name;
                return (
                  <button key={opt._id}
                    onClick={() => setSubOption(on ? "" : name)}
                    style={on
                      ? { backgroundColor: primary, borderColor: primary, color: "#fff" }
                      : { backgroundColor: cardBg, borderColor: cardBorder, color: fg }}
                    className="px-3.5 py-1.5 rounded-full text-sm border transition-all">
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Izoh */}
        {selected && (
          <div className="animate-fade-in">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={lbl}>
              {t("addNote")}
            </label>
            <textarea rows={3} value={description}
              onChange={e => { setDescription(e.target.value); setDescErr(""); }}
              placeholder={t("notePlaceholder")}
              style={{ backgroundColor: cardBg, color: fg, borderColor: descErr ? "#f87171" : cardBorder }}
              className="input resize-none text-sm" />
            {descErr && <p className="text-red-500 text-xs mt-1">{descErr}</p>}
          </div>
        )}
      </div>

      {/* Bottom button */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur border-t" style={{ backgroundColor: headerBg, borderColor: cardBorder }}>
          <div className="max-w-lg mx-auto">
            <button onClick={handleSubmit} className="btn-primary gap-2" style={{ backgroundColor: primary }}>
              {t("send")} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
