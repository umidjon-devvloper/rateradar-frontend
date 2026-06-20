import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // host: true — dev serverni LAN'ga ochadi (telefon QR'ni shu kompyuter
    // IP'si orqali ocha oladi: http://<kompyuter-IP>:5173)
    host: true,
    proxy: {
      "/api": {
        target: "https://api.thehotelsaas.com",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "https://api.thehotelsaas.com",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
