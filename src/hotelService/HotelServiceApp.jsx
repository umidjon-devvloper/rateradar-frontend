import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useOutletContext } from "react-router-dom";

import { api as rrApi } from "@/lib/api";

import { HotelProvider, useHotel } from "./context/HotelContext";
import { ToastProvider } from "./context/ToastContext";
import hsApi from "./lib/api";

import ProtectedRoute from "./components/hotel/ProtectedRoute";
import EmbeddedLayout from "./components/hotel/EmbeddedLayout";

import AuthPage from "./pages/hotel/AuthPage";
import DashboardPage from "./pages/hotel/DashboardPage";
import StaffPage from "./pages/hotel/StaffPage";
import ServicesPage from "./pages/hotel/ServicesPage";
import ReportsPage from "./pages/hotel/ReportsPage";
import SettingsPage from "./pages/hotel/SettingsPage";
import RoomQrPage from "./pages/hotel/RoomQrPage";
import DesignPage from "./pages/hotel/DesignPage";

/**
 * SSO ko'prigi — RateRadar foydalanuvchisini avtomatik Mehmonxona-xizmati
 * admin paneliga kiritadi.
 */
function SSOBridge() {
  const { isAuth, initSession } = useHotel();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAuth) {
      navigate("/hotel-service/dashboard", { replace: true });
      return;
    }
    (async () => {
      try {
        const { data: sso } = await rrApi.get("/hotel-service/sso");
        const { data } = await hsApi.post("/hotel/auth", { token: sso.token });
        initSession(data.token, data.hotel);
        navigate("/hotel-service/dashboard", { replace: true });
      } catch {
        setError(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm text-gray-500">
              Mehmonxona-xizmatiga kirib bo'lmadi.
            </p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Yuklanmoqda...</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Mehmonxona-xizmati ADMIN paneli — RateRadar AppLayout ICHIDA sahifa sifatida.
 * O'z shell'i yo'q; gorizontal tablar (EmbeddedLayout) bilan ishlaydi.
 * Mehmon (QR) oqimi alohida — HotelServiceGuest.jsx (ommaviy, to'liq ekran).
 */
export default function HotelServiceApp() {
  // RateRadar AppLayout aktiv mehmonxonani Outlet context orqali beradi.
  const ctx = useOutletContext();
  const activeHotelId = ctx?.hotel?._id ? String(ctx.hotel._id) : "";

  // Aktiv mehmonxona o'zgargan bo'lsa — eski xizmat sessiyasini sinxron
  // tozalaymiz (HotelProvider localStorage'ni o'qishidan OLDIN). Shunda
  // har bir mehmonxona o'zining alohida xizmat makoniga kiradi.
  if (activeHotelId) {
    try {
      const info = JSON.parse(localStorage.getItem("hotel_info") || "null");
      if (info && String(info.hotel_id) !== activeHotelId) {
        localStorage.removeItem("hotel_token");
        localStorage.removeItem("hotel_info");
      }
    } catch {
      /* ignore */
    }
  }

  return (
    // key — mehmonxona almashtirilganda butun daraxtni qayta mount qiladi →
    // yangi mehmonxona uchun avtomatik qayta SSO bo'ladi.
    <HotelProvider key={activeHotelId || "default"}>
      <ToastProvider>
        <Routes>
          <Route index element={<SSOBridge />} />
          <Route path="auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute><EmbeddedLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="qr" element={<RoomQrPage />} />
            <Route path="design" element={<DesignPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/hotel-service" replace />} />
        </Routes>
      </ToastProvider>
    </HotelProvider>
  );
}
