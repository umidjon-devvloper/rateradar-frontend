import { create } from 'zustand';
import { authApi } from './api';
import { disconnectSocket } from './socket';

const STORAGE_KEY_TOKEN = 'rr_token';
const STORAGE_KEY_USER = 'rr_user';
const STORAGE_KEY_ACTIVE_HOTEL = 'rr_active_hotel_id';

const initialUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuth = create((set, get) => ({
  user: initialUser(),
  token: localStorage.getItem(STORAGE_KEY_TOKEN) || null,
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.login({ email, password });
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      // Boshqa foydalanuvchining eski aktiv hotel IDsini tozalaymiz —
      // u bu user'ga tegishli emas, AppLayout listAll'dan to'g'risini topadi.
      localStorage.removeItem(STORAGE_KEY_ACTIVE_HOTEL);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login xato';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  async register(data) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.register(data);
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      // Yangi ro'yxatdan o'tgan foydalanuvchida hali hotel yo'q —
      // eski sessiyaning hotel ID qoldiqlari bo'lsa, tozalaymiz.
      localStorage.removeItem(STORAGE_KEY_ACTIVE_HOTEL);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Ro\'yxatdan o\'tishda xato';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout() {
    disconnectSocket();
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_HOTEL);
    set({ user: null, token: null, error: null });
  },

  async refresh() {
    if (!get().token) return null;
    try {
      const { user } = await authApi.me();
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user });
      return user;
    } catch {
      get().logout();
      return null;
    }
  },

  updateUser(patch) {
    const updated = { ...get().user, ...patch };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    set({ user: updated });
  },
}));
