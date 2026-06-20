import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/api";
import { formatDuration } from "../../lib/utils";

export default function ReportsPage() {
  const { toast }     = useToast();
  const [data, setData]       = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date().toISOString().slice(0, 7);
  const [filters, setFilters] = useState({ month: now, staff_telegram_id: "", service_id: "" });

  useEffect(() => {
    Promise.all([api.get("/hotel/services"), api.get("/hotel/staff")])
      .then(([sv, st]) => { setServices(sv.data); setStaff(st.data); })
      .catch(() => {});
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.month)              params.month              = filters.month;
      if (filters.staff_telegram_id)  params.staff_telegram_id  = filters.staff_telegram_id;
      if (filters.service_id)         params.service_id         = filters.service_id;
      const { data: res } = await api.get("/hotel/reports", { params });
      setData(res);
    } catch { toast("Hisobot yuklanmadi", "error"); }
    finally { setLoading(false); }
  };

  const total   = data.reduce((s, r) => s + r.count, 0);
  const maxCount = Math.max(...data.map(r => r.count), 1);

  // Staff bo'yicha guruhlash
  const byStaff = data.reduce((acc, r) => {
    const key = r._id?.staff;
    if (!key) return acc;
    if (!acc[key]) acc[key] = { staff: r.staff, total: 0, rows: [] };
    acc[key].total += r.count;
    acc[key].rows.push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Hisobot</h1>
        <p className="text-sm text-gray-400 mt-0.5">Bajarilgan ishlar statistikasi</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Oy</label>
            <input type="month" value={filters.month}
              onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}
              className="input py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Xodim</label>
            <select value={filters.staff_telegram_id}
              onChange={e => setFilters(p => ({ ...p, staff_telegram_id: e.target.value }))}
              className="input py-2 text-sm bg-white">
              <option value="">Barcha xodim</option>
              {staff.map(s => <option key={s._id} value={s.telegram_id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Xizmat</label>
            <select value={filters.service_id}
              onChange={e => setFilters(p => ({ ...p, service_id: e.target.value }))}
              className="input py-2 text-sm bg-white">
              <option value="">Barcha xizmat</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={load}
          className="mt-3 flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Search size={13} /> Ko'rish
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Bajarilgan", value: total, color: "text-blue-600" },
          { label: "Faol xodim", value: Object.keys(byStaff).length, color: "text-green-600" },
          { label: "Xizmat turi", value: new Set(data.map(r => r._id?.service)).size, color: "text-purple-600" },
        ].map(m => (
          <div key={m.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : Object.keys(byStaff).length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm text-gray-500">Bu davr uchun ma'lumot yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.values(byStaff).sort((a, b) => b.total - a.total).map((item, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {item.staff?.full_name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.staff?.full_name || "Noma'lum"}</p>
                    {item.staff?.telegram_username && (
                      <p className="text-xs text-gray-400">@{item.staff.telegram_username}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{item.total}</p>
                  <p className="text-xs text-gray-400">bajarildi</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {item.rows.sort((a, b) => b.count - a.count).map((r, j) => (
                  <div key={j}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        {r.service?.icon || "🛎"} {r.service?.name || "—"}
                      </span>
                      <div className="flex items-center gap-3">
                        {r.avg_min && (
                          <span className="text-xs text-gray-400">⏱ {formatDuration(r.avg_min)}</span>
                        )}
                        <span className="text-xs font-semibold text-gray-700">{r.count} ta</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(r.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
