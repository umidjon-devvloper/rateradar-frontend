import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Filter, X, RefreshCw, ClipboardList, Clock, CheckCircle, Zap } from "lucide-react";
import { socket }          from "../../lib/socket";
import { useToast }        from "../../context/ToastContext";
import api                 from "../../lib/api";
import { formatDate, formatTime, statusBadge, statusLabel } from "../../lib/utils";

const todayStr = () => new Date().toISOString().split("T")[0];

export default function DashboardPage() {
  const { t } = useOutletContext();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const LIMIT = 25;

  // Default: bugungi kun
  const [filters, setFilters] = useState({
    room: "", service: "", status: "", from: todayStr(), to: "",
  });

  const pending   = requests.filter(r => r.status === "pending").length;
  const accepted  = requests.filter(r => r.status === "accepted").length;
  const completed = requests.filter(r => r.status === "completed").length;

  useEffect(() => {
    api.get("/hotel/services").then(({ data }) => setServices(data)).catch(() => {});
    fetchRequests(1);
    scheduleMidnightRefresh();
  }, []);

  // Yarim tunda sahifani yangilash
  const scheduleMidnightRefresh = () => {
    const now       = new Date();
    const midnight  = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight - now;
    const timer = setTimeout(() => window.location.reload(), ms);
    return () => clearTimeout(timer);
  };

  const fetchRequests = useCallback(async (p = 1, f = filters) => {
    try {
      setLoading(true);
      const params = { page: p, limit: LIMIT };
      if (f.room)    params.room    = f.room;
      if (f.service) params.service = f.service;
      if (f.status)  params.status  = f.status;
      if (f.from)    params.from    = f.from;
      if (f.to)      params.to      = f.to;
      const { data } = await api.get("/hotel/requests", { params });
      setRequests(data.data);
      setTotal(data.total);
      setPage(p);
    } catch { toast("Ma'lumot yuklanmadi", "error"); }
    finally { setLoading(false); }
  }, [filters]);

  // Socket real-time
  useEffect(() => {
    const upsert = (updated) =>
      setRequests(prev => {
        const exists = prev.find(r => r._id === updated._id);
        if (exists) return prev.map(r => r._id === updated._id ? { ...r, ...updated } : r);
        // Faqat bugungi bo'lsa qo'shamiz
        const today = todayStr();
        const reqDate = new Date(updated.created_at).toISOString().split("T")[0];
        if (filters.from === today && reqDate === today) return [updated, ...prev];
        return prev;
      });

    socket.on("new_request",       ({ request }) => upsert(request));
    socket.on("request_accepted",  ({ request, staffName }) => upsert({ ...request, staff: { full_name: staffName } }));
    socket.on("request_completed", ({ request }) => upsert(request));
    return () => {
      socket.off("new_request");
      socket.off("request_accepted");
      socket.off("request_completed");
    };
  }, [filters.from]);

  const hasFilter = filters.room || filters.service || filters.status || filters.to ||
    filters.from !== todayStr();

  const resetFilters = () => {
    const def = { room: "", service: "", status: "", from: todayStr(), to: "" };
    setFilters(def);
    fetchRequests(1, def);
  };

  const Metric = ({ icon: Icon, label, value, color }) => (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t("workProcess")}</h1>
        <button onClick={() => fetchRequests(page)}
          className="btn-ghost flex items-center gap-1.5 text-xs">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          {t("refresh")}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={ClipboardList} label={t("total")}     value={total}     color="bg-blue-50 text-blue-500" />
        <Metric icon={Clock}         label={t("pending")}   value={pending}   color="bg-amber-50 text-amber-500" />
        <Metric icon={CheckCircle}   label={t("completed")} value={completed} color="bg-green-50 text-green-500" />
        <Metric icon={Zap}           label={t("accepted")}  value={accepted}  color="bg-purple-50 text-purple-500" />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <input type="text" placeholder={t("roomNum")} value={filters.room}
            onChange={e => setFilters(p => ({ ...p, room: e.target.value }))}
            className="input py-2 text-sm" />
          <select value={filters.service}
            onChange={e => setFilters(p => ({ ...p, service: e.target.value }))}
            className="input py-2 text-sm bg-white">
            <option value="">{t("allServices")}</option>
            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filters.status}
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            className="input py-2 text-sm bg-white">
            <option value="">{t("allStatuses")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="accepted">{t("accepted")}</option>
            <option value="completed">{t("completed")}</option>
          </select>
          <input type="date" value={filters.from}
            onChange={e => setFilters(p => ({ ...p, from: e.target.value }))}
            className="input py-2 text-sm" />
          <input type="date" value={filters.to}
            onChange={e => setFilters(p => ({ ...p, to: e.target.value }))}
            className="input py-2 text-sm" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => fetchRequests(1)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Filter size={13} /> {t("filter")}
          </button>
          {hasFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <X size={13} /> {t("clearFilter")}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {[t("roomNum"),t("service"),t("status"),t("staffCol"),t("createdAt"),t("acceptedAt"),t("completedAt")].map(h => (
                  <th key={h} className="table-head-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  {t("noRequests")}
                </td></tr>
              ) : requests.map(r => (
                <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="table-cell font-bold text-gray-900">{r.room_number}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span>{r.service_id?.icon || "🛎"}</span>
                      <span>{r.service_id?.name || "—"}</span>
                    </div>
                    {r.sub_option_translated && <p className="text-xs text-gray-400 mt-0.5">{r.sub_option_translated}</p>}
                    {r.description_translated && <p className="text-xs text-gray-400 mt-0.5 max-w-[140px] truncate">{r.description_translated}</p>}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={statusBadge(r.status)}>{statusLabel(r.status)}</span>
                      {r.admin_resolved && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-medium whitespace-nowrap">
                          👑 {t("adminResolved")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-gray-500">
                    {r.admin_resolved ? (t("adminSelf")) : (r.staff?.full_name || "—")}
                  </td>
                  <td className="table-cell text-gray-400 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="table-cell text-gray-400 text-xs">{r.accepted_at ? formatTime(r.accepted_at) : "—"}</td>
                  <td className="table-cell text-gray-400 text-xs">{r.completed_at ? formatTime(r.completed_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} / {total}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchRequests(page-1)} disabled={page===1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">{t("prev")}</button>
              <button onClick={() => fetchRequests(page+1)} disabled={page*LIMIT>=total}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">{t("next")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
