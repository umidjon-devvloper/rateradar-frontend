import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHotel } from "../../context/HotelContext";
import api from "../../lib/api";

export default function AuthPage() {
  const { initSession, isAuth } = useHotel();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | error | no_token

  useEffect(() => {
    if (isAuth) { navigate("/hotel-service/dashboard", { replace: true }); return; }
    const token = searchParams.get("token");
    if (token) {
      verifyToken(token);
    } else {
      setStatus("no_token");
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const { data } = await api.post("/hotel/auth", { token });
      initSession(data.token, data.hotel);
      navigate("/hotel-service/dashboard", { replace: true });
    } catch {
      setStatus("error");
    }
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-400">Kirish tasdiqlanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">{status === "error" ? "❌" : "🏨"}</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          {status === "error" ? "Kirish amalga oshmadi" : "Tizimga kirish"}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {status === "error"
            ? "Token yaroqsiz yoki muddati o'tgan. Asosiy tizim orqali qayta kiring."
            : "Admin panelga kirish uchun asosiy tizimdan yo'naltirilishi kerak."}
        </p>
        <a
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Asosiy sahifaga qaytish
        </a>
      </div>
    </div>
  );
}
