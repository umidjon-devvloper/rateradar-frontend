import { Navigate } from "react-router-dom";
import { useHotel } from "../../context/HotelContext";

const ProtectedRoute = ({ children }) => {
  const { isAuth } = useHotel();
  // Sessiya yo'q bo'lsa index'ga — u yerda SSOBridge avtomatik kiritadi
  // (aktiv mehmonxona uchun).
  if (!isAuth) return <Navigate to="/hotel-service" replace />;
  return children;
};

export default ProtectedRoute;
