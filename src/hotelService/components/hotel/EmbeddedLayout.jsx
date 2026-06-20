import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings2, BarChart2, Cog, QrCode, Circle, Palette,
} from "lucide-react";
import { useHotel } from "../../context/HotelContext";
import { useToast } from "../../context/ToastContext";
import { socket } from "../../lib/socket";
import { ADMIN_T } from "../../lib/i18n";
import { cn } from "../../lib/utils";

const ADMIN_LANGS = ["uz", "ru", "en"];

const NAV = [
  { to: "/hotel-service/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/hotel-service/staff",     key: "staff",     icon: Users },
  { to: "/hotel-service/services",  key: "services",  icon: Settings2 },
  { to: "/hotel-service/qr",        key: "qr",        icon: QrCode },
  { to: "/hotel-service/design",    key: "design",    icon: Palette },
  { to: "/hotel-service/reports",   key: "reports",   icon: BarChart2 },
  { to: "/hotel-service/settings",  key: "settings",  icon: Cog },
];

/**
 * RateRadar AppLayout ICHIDA ishlaydigan yengil layout — alohida shell EMAS.
 * Yon panel/topbar o'rniga gorizontal tablar. Sub-sahifalar useOutletContext()
 * orqali { t, adminLang } oladi (eski Layout bilan bir xil).
 */
export default function EmbeddedLayout() {
  const { hotel } = useHotel();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [adminLang, setAdminLang] = useState(
    () => localStorage.getItem("admin_lang") || "uz",
  );

  const t = (key) => ADMIN_T[adminLang]?.[key] || ADMIN_T.en[key] || key;

  const changeLang = (lang) => {
    localStorage.setItem("admin_lang", lang);
    setAdminLang(lang);
  };

  useEffect(() => {
    const hotelId = hotel?.hotel_id;
    if (!hotelId) return;

    socket.connect();
    socket.emit("join_hotel", hotelId);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_request", ({ request }) => {
      toast(`🔔 ${t("roomNum")} ${request.room_number}`, "info");
    });
    socket.on("request_accepted", ({ request, staffName }) => {
      toast(`✅ ${t("roomNum")} ${request.room_number}: ${staffName}`, "success");
    });
    socket.on("request_completed", ({ request }) => {
      toast(`🏁 ${t("roomNum")} ${request.room_number}`, "success");
    });
    socket.on("request_timeout", ({ request }) => {
      toast(
        `⚠️ ${t("roomNum")} ${request.room_number} — ${t("notAccepted")}`,
        "warning",
        10000,
      );
    });
    socket.on("new_staff_registered", () => {
      toast("👤 Yangi xodim", "info");
    });

    return () => {
      [
        "connect", "disconnect", "new_request", "request_accepted",
        "request_completed", "request_timeout", "new_staff_registered",
      ].forEach((e) => socket.off(e));
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel?.hotel_id, adminLang]);

  return (
    <div className="space-y-4">
      {/* Sarlavha qatori: tillar + live indikatori */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {ADMIN_LANGS.map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-all",
                adminLang === l
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Circle
            size={7}
            className={connected ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"}
          />
          {connected ? "Live" : "—"}
        </div>
      </div>

      {/* Gorizontal tablar */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 -mx-1 px-1">
        {NAV.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {t(key)}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Kontent */}
      <div className="pt-1">
        <Outlet context={{ t, adminLang }} />
      </div>
    </div>
  );
}
