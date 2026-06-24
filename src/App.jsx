import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Competitors from '@/pages/Competitors';
import Prices from '@/pages/Prices';
import Reviews from '@/pages/Reviews';
import AIInsights from '@/pages/AIInsights';
import OtaChannels from '@/pages/OtaChannels';
import Admin from '@/pages/Admin';
import Security from '@/pages/Security';
import Settings from '@/pages/Settings';
import Billing from '@/pages/Billing';
import Guide from '@/pages/Guide';
import Xotelo from '@/pages/Xotelo';
import RatingMap from '@/pages/RatingMap';
import Notifications from '@/pages/Notifications';
import HotelServiceApp from '@/hotelService/HotelServiceApp';
import HotelServiceGuest from '@/hotelService/HotelServiceGuest';

export default function App() {
  const refresh = useAuth((s) => s.refresh);
  const token = useAuth((s) => s.token);

  // Token bo'lsa user ma'lumotini yangilash
  useEffect(() => {
    if (token) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        
        {/* Public — landing va auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Mehmon (QR) oqimi — ommaviy, to'liq ekran (RateRadar shell'isiz) */}
        <Route path="/hotel-service/g/*" element={<HotelServiceGuest />} /> 

        {/* Auth required, lekin onboarding shart emas */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* App layout — sidebar + topbar bilan */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/competitors" element={<Competitors />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/ota-channels" element={<OtaChannels />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ai" element={<AIInsights />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/xotelo" element={<Xotelo />} />
          <Route path="/rating-map" element={<RatingMap />} />

          {/* Mehmonxona-xizmati ADMIN paneli — RateRadar shell ICHIDA,
              gorizontal tablar bilan (Qo'llanma kabi). */}
          <Route path="/hotel-service/*" element={<HotelServiceApp />} />
        </Route>

        {/* 404 — landing'ga qaytarish */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
