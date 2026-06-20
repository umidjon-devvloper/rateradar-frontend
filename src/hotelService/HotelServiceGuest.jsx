import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { GuestLangProvider } from "./context/GuestLangContext";

import ServicePage from "./pages/guest/ServicePage";
import ConfirmPage from "./pages/guest/ConfirmPage";
import SuccessPage from "./pages/guest/SuccessPage";

/**
 * Mehmon (QR) oqimi — ommaviy, to'liq ekran. RateRadar shell'idan tashqarida.
 * URL: /hotel-service/g?h=<hotel_id>&room=<room>
 */
export default function HotelServiceGuest() {
  return (
    <ToastProvider>
      <GuestLangProvider>
        <Routes>
          <Route index element={<ServicePage />} />
          <Route path="confirm" element={<ConfirmPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/hotel-service/g" replace />} />
        </Routes>
      </GuestLangProvider>
    </ToastProvider>
  );
}
