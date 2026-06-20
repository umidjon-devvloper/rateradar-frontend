import { io } from 'socket.io-client';

const STORAGE_KEY_TOKEN = 'rr_token';

const API_URL = import.meta.env.VITE_API_URL || '/api';
// Socket URL — /api emas, balki origin (yoki VITE_SOCKET_URL bo'lsa o'sha)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL.replace(/\/api\/?$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '');

let socket = null;

export function getSocket() {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (!token) return null;

  if (socket && socket.connected) return socket;
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL || '/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  if (import.meta.env.DEV) {
    socket.on('connect', () => console.log('[socket] connected', socket.id));
    socket.on('disconnect', (r) => console.log('[socket] disconnected', r));
    socket.on('connect_error', (e) => console.warn('[socket] error', e.message));
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function onNotification(handler) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('notification:new', handler);
  return () => s.off('notification:new', handler);
}

// Narx yangilash jarayoni — kanal-bo'yicha jonli progress eventlari.
// Backend `price:progress` chiqaradi (refreshAllChannels). Payload misollari:
//   { stage:'start', channels:[...] }
//   { stage:'own', status:'searching' }
//   { stage:'own', channel:'Booking.com', status:'done', price, via }
//   { stage:'own', channel:'Hotels.com', status:'processing'|'fail'|'skipped', via }
//   { stage:'own', status:'complete', channels }
//   { stage:'competitors', status:'start', total }
//   { stage:'competitor', name, index, total, status:'processing'|'done'|'failed', channels, lowest, via }
//   { stage:'complete', summary }
export function onPriceProgress(handler) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('price:progress', handler);
  return () => s.off('price:progress', handler);
}
