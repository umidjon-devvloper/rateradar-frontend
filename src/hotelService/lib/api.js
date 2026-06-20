import axios from "axios";

const api = axios.create({ baseURL: "/api/hotel-service", timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hotel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hotel_token");
      window.location.href = "/hotel-service/auth";
    }
    return Promise.reject(err);
  }
);

export default api;
