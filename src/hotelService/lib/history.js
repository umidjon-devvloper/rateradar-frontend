const KEY = "hs_history";
const MAX = 5;

export const getHistory = (hotelId) => {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    return all[hotelId] || [];
  } catch { return []; }
};

export const addToHistory = (hotelId, entry) => {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    const current = all[hotelId] || [];
    all[hotelId] = [{ ...entry, at: new Date().toISOString() }, ...current].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
};
