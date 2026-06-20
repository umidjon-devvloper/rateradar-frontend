import { createContext, useContext, useState, useEffect } from "react";

const HotelCtx = createContext(null);
export const useHotel = () => useContext(HotelCtx);

const parseJwt = (t) => {
  try { return JSON.parse(atob(t.split(".")[1])); } catch { return null; }
};

export const HotelProvider = ({ children }) => {
  const [token,    setToken]    = useState(() => localStorage.getItem("hotel_token"));
  const [hotelInfo, setHotelInfo] = useState(() => {
    const t = localStorage.getItem("hotel_token");
    return t ? parseJwt(t) : null;
  });
  // hotel ma'lumotlari /api/hotel/me dan to'liq keladi
  const [hotel, setHotel] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hotel_info") || "null"); } catch { return null; }
  });

  const initSession = (newToken, hotelData) => {
    localStorage.setItem("hotel_token", newToken);
    localStorage.setItem("hotel_info",  JSON.stringify(hotelData));
    setToken(newToken);
    setHotel(hotelData);
  };

  const logout = () => {
    localStorage.removeItem("hotel_token");
    localStorage.removeItem("hotel_info");
    setToken(null);
    setHotel(null);
  };

  const updateHotelInfo = (data) => {
    const updated = { ...hotel, ...data };
    localStorage.setItem("hotel_info", JSON.stringify(updated));
    setHotel(updated);
  };

  return (
    <HotelCtx.Provider value={{
      token, hotel,
      isAuth: !!token,
      initSession, logout, updateHotelInfo,
    }}>
      {children}
    </HotelCtx.Provider>
  );
};
