import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, RefreshCw, Globe, ChevronDown, Search, Check, X, Star, MessageSquareHeart } from "lucide-react";
import { useGuestLang }       from "../../context/GuestLangContext";
import { ALL_LANGUAGES, getLangDir } from "../../lib/i18n";
import { addToHistory }       from "../../lib/history";
import { DecorHeader, DecorBg } from "../../lib/templates";
import api, { assetUrl }      from "../../lib/api";

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
  const [showService, setShowService] = useState(false);
  const [subOption,   setSubOption]   = useState("");
  const [pickedItems, setPickedItems] = useState([]); // tanlangan mahsulotlar (nomlari)
  const [description, setDescription] = useState("");
  const [descErr,     setDescErr]     = useState("");

  // Sharh (Review) modali
  const [showReview,    setShowReview]    = useState(false);
  const [rating,        setRating]        = useState(0);
  const [hoverStar,     setHoverStar]     = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy,    setReviewBusy]    = useState(false);
  const [reviewDone,    setReviewDone]    = useState(false);
  const [reviewErr,     setReviewErr]     = useState("");

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

  // Xizmat kartasiga bosilganda — modal ochamiz (xona raqami to'ldirilgan bo'lsa)
  const openService = (svc) => {
    if (!room.trim()) {
      setRoomErr(t("roomRequired"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSelected(svc);
    setSubOption("");
    setPickedItems([]);
    setDescription("");
    setDescErr("");
    setShowService(true);
  };

  const toggleItem = (name) => {
    setPickedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSubmit = () => {
    if (!room.trim()) { setRoomErr(t("roomRequired")); return; }
    if (!selected) return;
    localStorage.setItem("guest_room", room.trim());
    // Tanlangan mahsulotlar sub_option sifatida yuboriladi ("Lag'mon, Cola").
    // Sub-option ham tanlangan bo'lsa, ikkalasi birlashtiriladi.
    const parts = [subOption, ...pickedItems].filter(Boolean);
    navigate("/hotel-service/g/confirm", { state: {
      hotelId, room_number: room.trim(), lang,
      service: selected,
      sub_option: parts.length ? parts.join(", ") : null,
      description: description.trim() || null,
    }});
  };

  const submitReview = async () => {
    if (!rating) { setReviewErr(t("reviewRateFirst")); return; }
    try {
      setReviewBusy(true); setReviewErr("");
      await api.post("/guest/reviews", {
        hotel_id: hotelId,
        room_number: room.trim() || null,
        rating,
        comment: reviewComment.trim() || null,
        guest_lang: lang,
      });
      setReviewDone(true);
    } catch {
      setReviewErr(t("errorSend"));
    } finally {
      setReviewBusy(false);
    }
  };

  const closeReview = () => {
    setShowReview(false);
    setTimeout(() => {
      setReviewDone(false); setRating(0); setHoverStar(0);
      setReviewComment(""); setReviewErr("");
    }, 220);
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
    <div className="relative min-h-screen" style={{ backgroundColor: pageBg, color: fg }} dir={getLangDir(lang)}>
      <DecorBg templateKey={brand.template} primary={primary} />

      {/* Premium rangli header banner */}
      <DecorHeader templateKey={brand.template} primary={primary} pageBg={pageBg}>
        <div className={`max-w-lg mx-auto relative flex items-center px-4 pt-4 pb-9 ${brand.logo_url ? "justify-center" : "gap-3"}`}>
          {brand.logo_url
            ? <img src={brand.logo_url} alt={hotel?.hotel_name} className="h-12 sm:h-14 w-auto max-w-[55%] object-contain drop-shadow" />
            : <p className="font-bold text-base sm:text-lg flex-1 truncate text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>{hotel?.hotel_name}</p>}
          <div className={brand.logo_url ? "absolute right-4 top-4" : ""}>
            <LangDropdown lang={lang} onChangeLang={changeLang} translating={translating} />
          </div>
        </div>
      </DecorHeader>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-5 space-y-6 pb-10">
        {brand.welcome_text && (
          <p className="text-sm -mb-2" style={{ color: subc }}>{brand.welcome_text}</p>
        )}

        {/* Xona raqami — ixcham */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={lbl}>
            {t("enterRoom")}
          </label>
          <input type="text" value={room}
            onChange={e => { setRoom(e.target.value); setRoomErr(""); }}
            placeholder={t("roomPlaceholder")}
            readOnly={!!roomParam}
            style={{ backgroundColor: cardBg, color: fg, borderColor: roomErr ? "#f87171" : cardBorder, padding: "10px 14px" }}
            className={`input text-base font-bold text-center tracking-wide ${roomParam ? "cursor-default" : ""}`}
            autoComplete="off" />
          {roomErr && <p className="text-red-500 text-xs mt-1.5">{roomErr}</p>}
        </div>

        {/* Xizmatlar */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={lbl}>
            {t("howHelp")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {services.map(svc => (
              <button key={svc._id}
                onClick={() => openService(svc)}
                style={{ borderColor: cardBorder, backgroundColor: cardBg }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all active:scale-[0.97] hover:shadow-md">
                <span className="text-3xl">{svc.icon || "🛎"}</span>
                <span className="text-xs font-semibold leading-tight" style={{ color: fg }}>
                  {svc.translated_name || svc.name}
                </span>
              </button>
            ))}

            {/* 5-chi: Sharh kartasi (har doim ko'rinadi) */}
            <button onClick={() => setShowReview(true)}
              style={{ borderColor: `${primary}55`, backgroundColor: `${primary}10` }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all active:scale-[0.97] hover:shadow-md">
              <span className="text-3xl">⭐</span>
              <span className="text-xs font-semibold leading-tight" style={{ color: primary }}>
                {t("reviewCard")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────── XIZMAT MODALI ───────── */}
      {showService && selected && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir={getLangDir(lang)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowService(false)} />
          <div className="relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
            style={{ backgroundColor: cardBg, color: fg }}>
            {/* Sarlavha */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <span className="text-3xl">{selected.icon || "🛎"}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{selected.translated_name || selected.name}</h3>
                <p className="text-xs" style={{ color: subc }}>{t("room")} {room}</p>
              </div>
              <button onClick={() => setShowService(false)} className="p-2 rounded-full"
                style={{ backgroundColor: `${primary}14`, color: primary }}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
              {/* Mahsulotlar (menyu) — vertikal kartalar, katta rasm (mobil uchun 2 ustun).
                  Bir nechtasini tanlash mumkin; tanlangani rangli ramka + belgi bilan. */}
              {selected.items?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={lbl}>
                    {t("selectSubOption")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.items.map(it => {
                      const name = it.translated_name || it.name;
                      const on = pickedItems.includes(name);
                      return (
                        <button key={it._id}
                          onClick={() => toggleItem(name)}
                          style={{
                            borderColor: on ? primary : cardBorder,
                            backgroundColor: cardBg,
                            boxShadow: on ? `0 4px 16px ${primary}30` : "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                          className="relative flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all active:scale-[0.97]">
                          {/* Rasm — kartaning tepa qismi, kengligi to'liq */}
                          <div className="relative w-full aspect-[4/3] overflow-hidden">
                            {it.image_url ? (
                              <img src={assetUrl(it.image_url)} alt={name}
                                className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-4xl"
                                style={{ background: `linear-gradient(135deg, ${primary}18, ${primary}08)` }}>
                                {selected.icon || "🍽"}
                              </div>
                            )}
                            {/* Tanlov belgisi — rasm burchagida */}
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                              style={on
                                ? { backgroundColor: primary }
                                : { backgroundColor: "rgba(255,255,255,0.85)", border: `1.5px solid ${cardBorder}` }}>
                              {on && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                          </div>
                          {/* Nom + narx */}
                          <div className="px-2.5 pt-2 pb-2.5">
                            <p className="text-[13px] font-semibold leading-snug line-clamp-2" style={{ color: fg }}>
                              {name}
                            </p>
                            {Number(it.price) > 0 && (
                              <p className="text-sm font-bold mt-1" style={{ color: primary }}>
                                {Number(it.price).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selected.sub_options?.length > 0 && (
                <div>
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
                            : { backgroundColor: pageBg, borderColor: cardBorder, color: fg }}
                          className="px-3.5 py-1.5 rounded-full text-sm border transition-all">
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={lbl}>
                  {t("addNote")}
                </label>
                <textarea rows={3} value={description}
                  onChange={e => { setDescription(e.target.value); setDescErr(""); }}
                  placeholder={t("notePlaceholder")}
                  style={{ backgroundColor: pageBg, color: fg, borderColor: cardBorder }}
                  className="input resize-none text-sm" />
              </div>
            </div>

            <div className="px-5 py-4 border-t" style={{ borderColor: cardBorder }}>
              <button onClick={handleSubmit} className="btn-primary gap-2 w-full" style={{ backgroundColor: primary }}>
                {t("send")} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── SHARH MODALI ───────── */}
      {showReview && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir={getLangDir(lang)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeReview} />
          <div className="relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
            style={{ backgroundColor: cardBg, color: fg }}>
            {reviewDone ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primary}18` }}>
                  <Check size={30} style={{ color: primary }} />
                </div>
                <h3 className="font-bold text-lg mb-1">{t("reviewThanks")}</h3>
                <div className="flex justify-center gap-1.5 my-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={20}
                      style={{ fill: i <= rating ? primary : "none", color: i <= rating ? primary : subc }} strokeWidth={1.5} />
                  ))}
                </div>
                <button onClick={closeReview} className="mt-2 text-sm font-semibold" style={{ color: primary }}>
                  {t("close")}
                </button>
              </div>
            ) : (
              <>
                <div className="px-5 pt-5 pb-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primary}18` }}>
                    <MessageSquareHeart size={20} style={{ color: primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">{t("reviewTitle")}</h3>
                    <p className="text-xs mt-0.5" style={{ color: subc }}>{t("reviewHint")}</p>
                  </div>
                  <button onClick={closeReview} className="p-2 rounded-full" style={{ backgroundColor: `${primary}14`, color: primary }}>
                    <X size={16} />
                  </button>
                </div>

                <div className="px-5 pb-5 space-y-4">
                  {/* Yulduzlar */}
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map(i => {
                      const active = i <= (hoverStar || rating);
                      return (
                        <button key={i}
                          onMouseEnter={() => setHoverStar(i)} onMouseLeave={() => setHoverStar(0)}
                          onClick={() => { setRating(i); setReviewErr(""); }}
                          className="transition-transform active:scale-90 hover:scale-110">
                          <Star size={36} strokeWidth={1.5}
                            style={{ fill: active ? primary : "none", color: active ? primary : subc }} />
                        </button>
                      );
                    })}
                  </div>

                  <textarea rows={3} value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder={t("reviewComment")}
                    style={{ backgroundColor: pageBg, color: fg, borderColor: cardBorder }}
                    className="input resize-none text-sm" />

                  {reviewErr && <p className="text-red-500 text-xs text-center">{reviewErr}</p>}

                  <button onClick={submitReview} disabled={reviewBusy}
                    className="btn-primary gap-2 w-full disabled:opacity-60" style={{ backgroundColor: primary }}>
                    {reviewBusy
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Star size={16} />}
                    {t("reviewSend")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
