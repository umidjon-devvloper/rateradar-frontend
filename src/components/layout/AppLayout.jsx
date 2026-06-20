import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { hotelApi } from '@/lib/api';
import { pageTransition } from '@/lib/animations';
import { cn, useSourceCurrency } from '@/lib/utils';

const ACTIVE_HOTEL_KEY = 'rr_active_hotel_id';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('rr_sidebar_collapsed') === 'true'
  );
  const setSourceCurrency = useSourceCurrency((s) => s.setCurrency);

  // Aktiv hotel'ni localStorage'dan o'qiymiz (oxirgi tanlangan)
  const activeHotelId = localStorage.getItem(ACTIVE_HOTEL_KEY) || '';

  const loadHotels = useCallback(async () => {
    try {
      const list = await hotelApi.listAll();
      setHotels(list || []);

      // Aktiv hotelni aniqlash: localStorage'da ID bor va u ro'yxatda
      // mavjud bo'lsa — o'shani tanlaymiz. Aks holda birinchi hotel.
      const stored = localStorage.getItem(ACTIVE_HOTEL_KEY);
      let active = null;
      if (stored) {
        active = list.find((h) => String(h._id) === String(stored));
      }
      if (!active && list?.length) {
        active = list[0];
        localStorage.setItem(ACTIVE_HOTEL_KEY, String(active._id));
      }
      if (active) {
        // To'liq hotel ma'lumotini olamiz (listAll faqat select qiladi)
        try {
          const full = await hotelApi.getMine();
          setHotel(full);
          setSourceCurrency(full?.currency || 'USD');
        } catch {
          setHotel(active);
          setSourceCurrency(active?.currency || 'USD');
        }
      } else {
        setHotel(null);
      }
    } catch (err) {
      console.warn('Hotellar ro\'yxati yuklanmadi:', err.message);
    }
  }, [setSourceCurrency]);

  useEffect(() => { loadHotels(); }, [loadHotels]);

  // Hotel state o'zgarganda source currency'ni sinxronlash (refresh keyin).
  useEffect(() => {
    if (hotel?.currency) setSourceCurrency(hotel.currency);
  }, [hotel?.currency, setSourceCurrency]);

  // Switcher orqali boshqa hotelga o'tish
  const switchHotel = useCallback(async (hotelId) => {
    localStorage.setItem(ACTIVE_HOTEL_KEY, String(hotelId));
    try {
      const full = await hotelApi.getMine();
      setHotel(full);
      setSourceCurrency(full?.currency || 'USD');
    } catch (err) {
      console.warn('Hotel almashtirilmadi:', err.message);
    }
  }, [setSourceCurrency]);

  // Yangi hotel qo'shish — onboarding sahifasiga o'tadi
  const addHotel = useCallback(() => {
    // Yangi hotel uchun aktiv ID tozalanadi — onboarding tugagach
    // setActiveHotelId(yangi._id) chaqiriladi.
    localStorage.removeItem(ACTIVE_HOTEL_KEY);
    navigate('/onboarding');
  }, [navigate]);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem('rr_sidebar_collapsed', String(next));
      return next;
    });
  }

  function handleMenuClick() {
    if (window.innerWidth >= 1024) {
      toggleCollapsed();
    } else {
      setMobileOpen(true);
    }
  }

  return (
    <div className="h-screen flex bg-mesh overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', collapsed ? 'lg:ml-[76px]' : 'lg:ml-64')}>
        <TopBar
          hotel={hotel}
          hotels={hotels}
          activeHotelId={activeHotelId}
          onSwitchHotel={switchHotel}
          onAddHotel={addHotel}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Outlet context={{ hotel, setHotel, hotels, reloadHotels: loadHotels }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
