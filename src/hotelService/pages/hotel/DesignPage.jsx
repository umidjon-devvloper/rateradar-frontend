import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Palette, Image as ImageIcon, Type, Smartphone, ArrowRight } from "lucide-react";
import { useHotel } from "../../context/HotelContext";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/api";

const TXT = {
  uz: {
    title: "Dizayn", desc: "Mehmon QR orqali ochadigan sahifa ko'rinishini sozlang.",
    theme: "Mavzu (tayyor ranglar)", color: "Asosiy rang", logo: "Logo havolasi (ixtiyoriy)",
    logoHint: "Rasm URL'i (https://...). Bo'sh qoldirsangiz mehmonxona nomi ko'rinadi.",
    welcome: "Salomlashuv matni (ixtiyoriy)", welcomeHint: "Masalan: Xush kelibsiz! Sizga qanday yordam bera olamiz?",
    bg: "Fon uslubi", bgLight: "Oq", bgSoft: "Yumshoq", bgDark: "To'q",
    preview: "Jonli ko'rinish", save: "Saqlash", saved: "Dizayn saqlandi ✅", error: "Xatolik",
    sampleRoom: "Xona raqami", sampleHelp: "Sizga qanday yordam beramiz?",
    s1: "Tozalash", s2: "Kir yuvish", s3: "Room service", send: "Yuborish",
  },
  ru: {
    title: "Дизайн", desc: "Настройте вид страницы, которую открывает гость по QR.",
    theme: "Тема (готовые цвета)", color: "Основной цвет", logo: "Ссылка на логотип (необяз.)",
    logoHint: "URL изображения (https://...). Если пусто — показывается название отеля.",
    welcome: "Приветствие (необяз.)", welcomeHint: "Например: Добро пожаловать! Чем помочь?",
    bg: "Стиль фона", bgLight: "Белый", bgSoft: "Мягкий", bgDark: "Тёмный",
    preview: "Предпросмотр", save: "Сохранить", saved: "Дизайн сохранён ✅", error: "Ошибка",
    sampleRoom: "Номер комнаты", sampleHelp: "Чем мы можем помочь?",
    s1: "Уборка", s2: "Прачечная", s3: "Room service", send: "Отправить",
  },
  en: {
    title: "Design", desc: "Customize the page guests open via the QR code.",
    theme: "Theme (presets)", color: "Primary color", logo: "Logo URL (optional)",
    logoHint: "Image URL (https://...). Leave empty to show the hotel name.",
    welcome: "Welcome text (optional)", welcomeHint: "e.g. Welcome! How can we help you?",
    bg: "Background style", bgLight: "Light", bgSoft: "Soft", bgDark: "Dark",
    preview: "Live preview", save: "Save", saved: "Design saved ✅", error: "Error",
    sampleRoom: "Your room number", sampleHelp: "How can we help you?",
    s1: "Cleaning", s2: "Laundry", s3: "Room service", send: "Send",
  },
};

const PRESETS = [
  { key: "blue", color: "#2563eb", name: "Ko'k" },
  { key: "emerald", color: "#059669", name: "Zumrad" },
  { key: "violet", color: "#7c3aed", name: "Binafsha" },
  { key: "rose", color: "#e11d48", name: "Atirgul" },
  { key: "amber", color: "#d97706", name: "Amber" },
  { key: "cyan", color: "#0891b2", name: "Moviy" },
  { key: "slate", color: "#334155", name: "Grafit" },
  { key: "pink", color: "#db2777", name: "Pushti" },
];

const BG_STYLES = [
  { key: "light", swatch: "#ffffff" },
  { key: "soft", swatch: "#f1f5f9" },
  { key: "dark", swatch: "#0f172a" },
];

export default function DesignPage() {
  const { adminLang } = useOutletContext();
  const t = (k) => (TXT[adminLang] || TXT.uz)[k] || TXT.uz[k] || k;
  const { hotel, updateHotelInfo } = useHotel();
  const { toast } = useToast();

  const [b, setB] = useState({
    theme: "blue", primary_color: "#2563eb", logo_url: "", welcome_text: "", bg_style: "light",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/hotel/me").then(({ data }) => {
      if (data.branding) setB((p) => ({ ...p, ...data.branding }));
    }).catch(() => {});
  }, []);

  const set = (patch) => setB((p) => ({ ...p, ...patch }));

  const pickPreset = (preset) => set({ theme: preset.key, primary_color: preset.color });

  const save = async () => {
    try {
      setSaving(true);
      const { data } = await api.put("/hotel/branding", b);
      updateHotelInfo({ branding: data });
      toast(t("saved"), "success");
    } catch {
      toast(t("error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const bg = b.bg_style === "dark" ? "#0f172a" : b.bg_style === "soft" ? "#f1f5f9" : "#ffffff";
  const fg = b.bg_style === "dark" ? "#e2e8f0" : "#111827";
  const sub = b.bg_style === "dark" ? "#94a3b8" : "#9ca3af";
  const cardBg = b.bg_style === "dark" ? "#1e293b" : "#ffffff";
  const cardBorder = b.bg_style === "dark" ? "#334155" : "#f1f5f9";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sozlamalar */}
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Palette size={20} className="text-blue-600" /> {t("title")}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{t("desc")}</p>
        </div>

        {/* Mavzu */}
        <div className="card p-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">{t("theme")}</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESETS.map((p) => (
              <button key={p.key} onClick={() => pickPreset(p)} title={p.name}
                className="relative h-10 w-10 rounded-xl border-2 transition-transform hover:scale-105"
                style={{ backgroundColor: p.color, borderColor: b.primary_color === p.color ? "#111827" : "transparent" }}>
                {b.primary_color === p.color && <Check size={16} className="text-white absolute inset-0 m-auto" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("color")}</label>
            <input type="color" value={b.primary_color}
              onChange={(e) => set({ primary_color: e.target.value, theme: "custom" })}
              className="h-9 w-14 rounded-lg border border-gray-200 cursor-pointer bg-white" />
            <span className="text-sm font-mono text-gray-600">{b.primary_color}</span>
          </div>
        </div>

        {/* Fon */}
        <div className="card p-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">{t("bg")}</label>
          <div className="flex gap-2">
            {BG_STYLES.map((s) => (
              <button key={s.key} onClick={() => set({ bg_style: s.key })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${b.bg_style === s.key ? "border-blue-500 text-blue-700 bg-blue-50" : "border-gray-200 text-gray-600"}`}>
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: s.swatch }} />
                {t(s.key === "light" ? "bgLight" : s.key === "soft" ? "bgSoft" : "bgDark")}
              </button>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="card p-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ImageIcon size={13} /> {t("logo")}
          </label>
          <input type="url" value={b.logo_url} onChange={(e) => set({ logo_url: e.target.value })}
            placeholder="https://..." className="input" />
          <p className="text-xs text-gray-400 mt-1.5">{t("logoHint")}</p>
        </div>

        {/* Salomlashuv */}
        <div className="card p-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Type size={13} /> {t("welcome")}
          </label>
          <input type="text" value={b.welcome_text} onChange={(e) => set({ welcome_text: e.target.value })}
            placeholder={t("welcomeHint")} className="input" maxLength={120} />
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: b.primary_color }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
          {t("save")}
        </button>
      </div>

      {/* Jonli ko'rinish — telefon mockup */}
      <div className="lg:sticky lg:top-4 self-start">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Smartphone size={13} /> {t("preview")}
        </p>
        <div className="mx-auto w-[300px] rounded-[2rem] border-[10px] border-gray-900 shadow-xl overflow-hidden">
          <div className="h-[560px] overflow-y-auto" style={{ backgroundColor: bg, color: fg }}>
            {/* Header */}
            <div className={`sticky top-0 px-3 border-b relative flex items-center ${b.logo_url ? "justify-center h-[60px]" : "h-14 gap-2"}`}
              style={{ backgroundColor: bg, borderColor: cardBorder }}>
              {b.logo_url ? (
                <img src={b.logo_url} alt="" className="h-10 w-auto max-w-[55%] object-contain" />
              ) : (
                <span className="font-semibold text-sm truncate" style={{ color: fg }}>{hotel?.hotel_name || "Hotel"}</span>
              )}
              <span className={`text-[10px] px-2 py-1 rounded-lg border ${b.logo_url ? "absolute right-3" : "ml-auto"}`} style={{ borderColor: cardBorder, color: sub }}>EN</span>
            </div>

            <div className="px-4 py-4 space-y-4">
              {b.welcome_text && <p className="text-sm" style={{ color: sub }}>{b.welcome_text}</p>}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: sub }}>{t("sampleRoom")}</p>
                <div className="rounded-xl border text-center py-3 text-xl font-bold"
                  style={{ borderColor: cardBorder, backgroundColor: cardBg }}>102</div>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: sub }}>{t("sampleHelp")}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[{ i: "🧹", n: t("s1"), on: true }, { i: "🧺", n: t("s2") }, { i: "🍽", n: t("s3") }, { i: "🛎", n: "..." }].map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center"
                    style={{
                      borderColor: s.on ? b.primary_color : cardBorder,
                      backgroundColor: s.on ? `${b.primary_color}14` : cardBg,
                    }}>
                    <span className="text-2xl">{s.i}</span>
                    <span className="text-[11px] font-semibold" style={{ color: s.on ? b.primary_color : fg }}>{s.n}</span>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: b.primary_color }}>
                {t("send")} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
