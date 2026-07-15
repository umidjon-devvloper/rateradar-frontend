import { useEffect, useRef, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";

// ════════════════════════════════════════════════════════════════════
// TV VITRINA — xonadagi Android TV/Smart TV uchun to'liq ekran sahifa.
// URL: /tv                       — real qurilma (pairing + token)
//      /tv?preview=<hotelId>&room=101 — admin PREVIEW (panel'dan ochiladi)
//
// Pult:  ⬅ ➡  — tilni almashtirish (barcha matn + xizmat nomlari tarjima)
//
// Holatlar: pairing (6 xonali kod) | active (vitrina) | locked (obuna tugagan)
// ════════════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || "/api";
const tvApi = axios.create({ baseURL: `${API_URL}/hotel-service/tv`, timeout: 15000 });
const guestApi = axios.create({ baseURL: `${API_URL}/hotel-service/guest`, timeout: 15000 });

// /uploads/... kabi nisbiy rasm yo'llarini API originiga absolyutlashtiradi
const asset = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
};

const LS = { token: "tv_token", deviceId: "tv_device_id", deviceKey: "tv_device_key", lang: "tv_lang" };

// TV'da mavjud tillar — pult bilan aylantiriladi
const TV_LANGS = [
  { code: "uz", flag: "🇺🇿", native: "O'zbek" },
  { code: "ru", flag: "🇷🇺", native: "Русский" },
  { code: "en", flag: "🇬🇧", native: "English" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe" },
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "fr", flag: "🇫🇷", native: "Français" },
  { code: "ja", flag: "🇯🇵", native: "日本語" },
  { code: "zh", flag: "🇨🇳", native: "中文" },
  { code: "ko", flag: "🇰🇷", native: "한국어" },
  { code: "ar", flag: "🇸🇦", native: "العربية" },
];

// TV interfeysi matnlari (xizmat nomlari serverda tarjima qilinadi)
const UI = {
  uz: { services: "Xizmatlar", scan: "Xizmat buyurtma qilish uchun skanerlang", scanSub: "Telefon kamerasi bilan QR kodni skanerlang", room: "Xona", choices: "ta tanlov", langHint: "til" },
  ru: { services: "Услуги", scan: "Отсканируйте, чтобы заказать услугу", scanSub: "Наведите камеру телефона на QR-код", room: "Номер", choices: "вариантов", langHint: "язык" },
  en: { services: "Services", scan: "Scan to order a service", scanSub: "Point your phone camera at the QR code", room: "Room", choices: "options", langHint: "language" },
  tr: { services: "Hizmetler", scan: "Hizmet siparişi için tarayın", scanSub: "Telefon kameranızı QR koda tutun", room: "Oda", choices: "seçenek", langHint: "dil" },
  de: { services: "Services", scan: "Scannen, um Service zu bestellen", scanSub: "Richten Sie die Handykamera auf den QR-Code", room: "Zimmer", choices: "Optionen", langHint: "Sprache" },
  fr: { services: "Services", scan: "Scannez pour commander un service", scanSub: "Pointez la caméra du téléphone vers le QR code", room: "Chambre", choices: "options", langHint: "langue" },
  ja: { services: "サービス", scan: "QRコードをスキャンして注文", scanSub: "スマートフォンのカメラをQRコードに向けてください", room: "部屋", choices: "件", langHint: "言語" },
  zh: { services: "服务", scan: "扫码即可下单", scanSub: "用手机摄像头扫描二维码", room: "房间", choices: "个选项", langHint: "语言" },
  ko: { services: "서비스", scan: "스캔하여 서비스 주문", scanSub: "휴대폰 카메라로 QR코드를 스캔하세요", room: "객실", choices: "개 옵션", langHint: "언어" },
  ar: { services: "الخدمات", scan: "امسح لطلب الخدمة", scanSub: "وجّه كاميرا هاتفك نحو رمز QR", room: "غرفة", choices: "خيارات", langHint: "اللغة" },
};

export default function TvPage() {
  const params = new URLSearchParams(window.location.search);
  const previewHotelId = params.get("preview") || "";
  const previewRoom = params.get("room") || "101";
  const isPreview = Boolean(previewHotelId);

  const [mode, setMode] = useState("boot"); // boot | pairing | active | locked | error
  const [pairCode, setPairCode] = useState("");
  const [content, setContent] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [clock, setClock] = useState(new Date());
  const [lang, setLang] = useState(() => localStorage.getItem(LS.lang) || "uz");
  const pollRef = useRef(null);
  const contentRef = useRef(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const ui = UI[lang] || UI.en;

  // ── Soat ──
  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(iv);
  }, []);

  // ── PULT: ⬅ ➡ — til almashtirish ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const idx = TV_LANGS.findIndex((l) => l.code === langRef.current);
      const next = e.key === "ArrowRight"
        ? TV_LANGS[(idx + 1) % TV_LANGS.length]
        : TV_LANGS[(idx - 1 + TV_LANGS.length) % TV_LANGS.length];
      changeLang(next.code);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeLang(code) {
    localStorage.setItem(LS.lang, code);
    setLang(code);
    refreshContent(code); // yangi tilda darhol qayta yuklaymiz
  }

  // ── Boshlanish ──
  useEffect(() => {
    if (isPreview) {
      startPreviewLoop();
    } else {
      const token = localStorage.getItem(LS.token);
      if (token) startContentLoop(token);
      else startPairing();
    }
    return () => { clearInterval(pollRef.current); clearInterval(contentRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── PREVIEW: ommaviy guest endpointlardan (token kerak emas) ──
  async function fetchPreview(l = langRef.current) {
    const [hotelRes, svcRes] = await Promise.all([
      guestApi.get(`/hotel/${previewHotelId}`),
      guestApi.get(`/services/${previewHotelId}`, { params: { lang: l } }),
    ]);
    setContent({
      locked: false,
      hotel_id: hotelRes.data.hotel_id,
      hotel_name: hotelRes.data.hotel_name,
      branding: hotelRes.data.branding || {},
      room_number: previewRoom,
      device_name: "PREVIEW",
      services: (svcRes.data || []).map((s) => ({
        name: s.translated_name || s.name,
        icon: s.icon || "🛎",
        image_url: s.image_url || "",
        items_count: (s.items || []).length,
      })),
    });
    setMode("active");
  }
  function startPreviewLoop() {
    fetchPreview().catch(() => setMode("error"));
    contentRef.current = setInterval(() => fetchPreview().catch(() => {}), 60_000);
  }

  // ── 1) Aktivatsiya oqimi ──
  async function startPairing() {
    setMode("pairing");
    try {
      let deviceId = localStorage.getItem(LS.deviceId);
      let deviceKey = localStorage.getItem(LS.deviceKey);

      if (!deviceId || !deviceKey) {
        const { data } = await tvApi.post("/register");
        deviceId = data.device_id;
        deviceKey = data.device_key;
        localStorage.setItem(LS.deviceId, deviceId);
        localStorage.setItem(LS.deviceKey, deviceKey);
        setPairCode(data.pair_code);
      }

      clearInterval(pollRef.current);
      const poll = async () => {
        try {
          const { data } = await tvApi.get(`/status/${deviceId}`, { params: { key: deviceKey } });
          if (data.status === "active" && data.token) {
            clearInterval(pollRef.current);
            localStorage.setItem(LS.token, data.token);
            localStorage.removeItem(LS.deviceId);
            localStorage.removeItem(LS.deviceKey);
            startContentLoop(data.token);
          } else if (data.status === "unpaired") {
            setPairCode(data.pair_code || "");
          } else if (data.status === "revoked") {
            localStorage.removeItem(LS.deviceId);
            localStorage.removeItem(LS.deviceKey);
            startPairing();
          }
        } catch (err) {
          if (err.response?.status === 404) {
            localStorage.removeItem(LS.deviceId);
            localStorage.removeItem(LS.deviceKey);
            clearInterval(pollRef.current);
            startPairing();
          }
        }
      };
      poll();
      pollRef.current = setInterval(poll, 5000);
    } catch {
      setMode("error");
      setTimeout(startPairing, 10_000);
    }
  }

  // ── 2) Kontent oqimi (har 60s — heartbeat ham shu) ──
  function startContentLoop(token) {
    clearInterval(contentRef.current);
    const fetchContent = async (l = langRef.current) => {
      try {
        const { data } = await tvApi.get("/content", {
          headers: { "X-TV-Token": token },
          params: { lang: l },
        });
        setContent(data);
        setMode(data.locked ? "locked" : "active");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(LS.token);
          clearInterval(contentRef.current);
          startPairing();
        }
      }
    };
    fetchContent();
    contentRef.current = setInterval(() => fetchContent(), 60_000);
  }

  // Til o'zgarganda kontentni yangi tilda olish
  function refreshContent(l) {
    if (isPreview) { fetchPreview(l).catch(() => {}); return; }
    const token = localStorage.getItem(LS.token);
    if (token && (mode === "active" || mode === "locked")) {
      tvApi.get("/content", { headers: { "X-TV-Token": token }, params: { lang: l } })
        .then(({ data }) => { setContent(data); setMode(data.locked ? "locked" : "active"); })
        .catch(() => {});
    }
  }

  // ── QR: mehmon sahifasi (tanlangan til bilan ochiladi) ──
  useEffect(() => {
    if (mode !== "active" || !content?.hotel_id) return;
    const url =
      `${window.location.origin}/hotel-service/g` +
      `?h=${encodeURIComponent(content.hotel_id)}` +
      (content.room_number ? `&room=${encodeURIComponent(content.room_number)}` : "") +
      `&lang=${encodeURIComponent(lang)}`;
    QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [mode, content?.hotel_id, content?.room_number, lang]);

  // ── Render ──
  const brand = content?.branding || {};
  const primary = brand.primary_color || "#2563eb";

  if (mode === "boot") return <TvShell primary={primary}><div className="tv-spin" /></TvShell>;

  if (mode === "pairing" || mode === "error") {
    return (
      <TvShell primary={primary}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📺</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 10 }}>Qurilmani ulash</h1>
          <p style={{ fontSize: 20, opacity: 0.7, marginBottom: 36, lineHeight: 1.5 }}>
            Panel → <b>TV qurilmalar</b> bo'limiga kirib, quyidagi kodni kiriting
          </p>
          {mode === "error" ? (
            <p style={{ fontSize: 22, color: "#f87171" }}>Serverga ulanib bo'lmadi — qayta urinilmoqda...</p>
          ) : (
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              {(pairCode || "······").split("").map((ch, i) => (
                <div key={i} style={{
                  width: 84, height: 104, borderRadius: 18,
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 56, fontWeight: 800, fontFamily: "monospace",
                }}>
                  {ch}
                </div>
              ))}
            </div>
          )}
          <p style={{ marginTop: 40, fontSize: 15, opacity: 0.4 }}>TheHotelSaaS · Hotel TV</p>
        </div>
      </TvShell>
    );
  }

  if (mode === "locked") {
    return (
      <TvShell primary="#334155">
        <div style={{ textAlign: "center", maxWidth: 720 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>
            {content?.hotel_name || "Mehmonxona"}
          </h1>
          <p style={{ fontSize: 22, opacity: 0.75, lineHeight: 1.6 }}>
            Xizmat vaqtincha faol emas — obuna muddati tugagan.<br />
            Iltimos, administratsiyaga murojaat qiling.
          </p>
          <p style={{ marginTop: 40, fontSize: 15, opacity: 0.4 }}>TheHotelSaaS</p>
        </div>
      </TvShell>
    );
  }

  // ── ACTIVE: vitrina ──
  const services = content?.services || [];
  const curLang = TV_LANGS.find((l) => l.code === lang) || TV_LANGS[0];

  return (
    <TvShell primary={primary} align="stretch">
      {isPreview && (
        <div style={{
          position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
          background: "#f59e0b", color: "#1c1917", fontWeight: 800, fontSize: 13,
          padding: "5px 16px", borderRadius: 999, letterSpacing: 2, zIndex: 10,
        }}>
          PREVIEW
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "28px 48px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {brand.logo_url ? (
            <img src={asset(brand.logo_url)} alt="" style={{ height: 56, objectFit: "contain" }} />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 800, color: "#fff",
            }}>
              {(content?.hotel_name || "H").charAt(0)}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{content?.hotel_name}</h1>
            {brand.welcome_text && (
              <p style={{ fontSize: 16, opacity: 0.6, marginTop: 3 }}>{brand.welcome_text}</p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Til tanlagich — pult ⬅ ➡ yoki bosish */}
          <button onClick={() => {
            const idx = TV_LANGS.findIndex((l) => l.code === lang);
            changeLang(TV_LANGS[(idx + 1) % TV_LANGS.length].code);
          }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: 999, padding: "9px 18px", color: "#f1f5f9", cursor: "pointer",
            }}>
            <span style={{ fontSize: 22 }}>{curLang.flag}</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{curLang.native}</span>
            <span style={{ fontSize: 12, opacity: 0.5 }}>◀ ▶</span>
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 44, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </div>
            {content?.room_number && (
              <div style={{ fontSize: 16, opacity: 0.6 }}>{ui.room} {content.room_number}</div>
            )}
          </div>
        </div>
      </div>

      {/* Body: xizmatlar + QR */}
      <div style={{
        flex: 1, display: "flex", gap: 40, padding: "32px 48px 24px", alignItems: "stretch",
        minHeight: 0,
      }}>
        {/* Xizmatlar grid — rasm fonli plitkalar */}
        <div style={{ flex: 1.5, minWidth: 0, overflow: "hidden" }}>
          <p style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            opacity: 0.5, marginBottom: 18,
          }}>
            {ui.services}
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 18,
          }}>
            {services.map((s, i) => (
              <div key={i} style={{
                position: "relative", borderRadius: 20, overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.12)",
                minHeight: 130,
                background: s.image_url
                  ? undefined
                  : "rgba(255,255,255,0.07)",
              }}>
                {/* Fon rasmi + qoraytiruvchi gradient (matn o'qilishi uchun) */}
                {s.image_url && (
                  <>
                    <img src={asset(s.image_url)} alt="" style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover",
                    }} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(180deg, rgba(11,18,32,0.15) 0%, rgba(11,18,32,0.82) 100%)",
                    }} />
                  </>
                )}
                <div style={{
                  position: "relative", height: "100%", minHeight: 130,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  padding: "18px 20px", gap: 2,
                }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>{s.icon}</span>
                  <p style={{
                    fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginTop: 8,
                    textShadow: s.image_url ? "0 1px 6px rgba(0,0,0,0.6)" : "none",
                  }}>
                    {s.name}
                  </p>
                  {s.items_count > 0 && (
                    <p style={{ fontSize: 13, opacity: 0.7 }}>
                      {s.items_count} {ui.choices}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR panel */}
        <div style={{
          width: 380, flexShrink: 0, borderRadius: 28, background: "rgba(255,255,255,0.06)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: 32, gap: 20,
        }}>
          <p style={{ fontSize: 21, fontWeight: 800, textAlign: "center", lineHeight: 1.35 }}>
            📱 {ui.scan}
          </p>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR" style={{
              width: 260, height: 260, borderRadius: 20, background: "#fff", padding: 10,
            }} />
          )}
          <p style={{ fontSize: 14, opacity: 0.55, textAlign: "center" }}>
            {ui.scanSub}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "0 48px 20px", display: "flex", justifyContent: "space-between",
        fontSize: 13, opacity: 0.35,
      }}>
        <span>{content?.device_name}</span>
        <span>◀ ▶ {ui.langHint} · Powered by TheHotelSaaS</span>
      </div>
    </TvShell>
  );
}

// To'liq ekran qobiq — brend rangidan gradient fon.
// Kursor: qimirlaganda ko'rinadi, 3 soniya tinch tursa yashirinadi.
function TvShell({ primary = "#2563eb", align = "center", children }) {
  const [cursorHidden, setCursorHidden] = useState(false);
  const hideTimer = useRef(null);
  useEffect(() => {
    const onMove = () => {
      setCursorHidden(false);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setCursorHidden(true), 3000);
    };
    onMove();
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(hideTimer.current); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, overflow: "hidden",
      background: `radial-gradient(1200px 700px at 85% -10%, ${primary}33, transparent 60%),
                   radial-gradient(900px 600px at -10% 110%, ${primary}22, transparent 55%),
                   #0b1220`,
      color: "#f1f5f9",
      display: "flex", flexDirection: "column",
      alignItems: align === "center" ? "center" : "stretch",
      justifyContent: align === "center" ? "center" : "flex-start",
      fontFamily: "'Inter', system-ui, sans-serif",
      cursor: cursorHidden ? "none" : "default",
    }}>
      {children}
      <style>{`
        .tv-spin {
          width: 44px; height: 44px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: #fff;
          animation: tvspin 0.9s linear infinite;
        }
        @keyframes tvspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
