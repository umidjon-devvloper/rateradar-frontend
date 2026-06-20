import { io } from "socket.io-client";
// RateRadar backend'idagi "/hotel-service" namespace'ga ulanamiz (asosiy "/"
// namespace JWT auth talab qiladi). Bir xil origin — dev'da Vite /socket.io ni
// backendga proxy qiladi, prod'da ham birga xizmat qilinadi.
export const socket = io("/hotel-service", { autoConnect: false });
