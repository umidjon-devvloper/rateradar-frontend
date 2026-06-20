import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings2, BarChart2,
  Cog, LogOut, Menu, X, Circle, QrCode,
} from "lucide-react";
import { useHotel }  from "../../context/HotelContext";
import { useToast }  from "../../context/ToastContext";
import { socket }    from "../../lib/socket";
import { ADMIN_T }   from "../../lib/i18n";
import { cn }        from "../../lib/utils";
import api           from "../../lib/api";

const ADMIN_LANGS = ["uz", "ru", "en"];

const NAV = [
  { to: "/hotel-service/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/hotel-service/staff",     key: "staff",     icon: Users },
  { to: "/hotel-service/services",  key: "services",  icon: Settings2 },
  { to: "/hotel-service/qr",        key: "qr",        icon: QrCode },
  { to: "/hotel-service/reports",   key: "reports",   icon: BarChart2 },
  { to: "/hotel-service/settings",  key: "settings",  icon: Cog },
];

export default function Layout() {
  const { hotel, logout } = useHotel();
  const { toast }         = useToast();
  const navigate          = useNavigate();
  const [open,      setOpen]      = useState(false);
  const [connected, setConnected] = useState(false);
  const [adminLang, setAdminLang] = useState(
    () => localStorage.getItem("admin_lang") || "en"
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
    socket.on("connect",    () => setConnected(true));
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
      ["connect","disconnect","new_request","request_accepted",
       "request_completed","request_timeout","new_staff_registered"]
        .forEach(e => socket.off(e));
      socket.disconnect();
    };
  }, [hotel?.hotel_id, adminLang]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {open && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col",
        "bg-white border-r border-gray-100 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{hotel?.hotel_name || "Hotel"}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden btn-ghost p-1">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, key, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  {t(key)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 py-3 border-t border-gray-100">
          <button onClick={() => { logout(); navigate("/hotel-service/auth"); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 font-medium transition-colors">
            <LogOut size={15} className="text-gray-400" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden btn-ghost p-1">
            <Menu size={18} />
          </button>
          <div className="flex-1" />

          {/* UZ / RU / EN switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {ADMIN_LANGS.map(l => (
              <button key={l} onClick={() => changeLang(l)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-all",
                  adminLang === l
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}>
                {l}
              </button>
            ))}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Circle size={7} className={connected ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"} />
            {connected ? "Live" : "—"}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ t, adminLang }} />
        </main>
      </div>
    </div>
  );
}
