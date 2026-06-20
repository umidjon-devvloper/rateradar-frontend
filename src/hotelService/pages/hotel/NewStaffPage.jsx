import { useEffect, useState } from "react";
import { UserCheck, Trash2, Phone, AtSign, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { socket } from "../../lib/socket";
import api from "../../lib/api";
import { formatDate } from "../../lib/utils";

export default function NewStaffPage() {
  const { toast } = useToast();
  const [staff,    setStaff]    = useState([]);
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState({});   // { staffId: [serviceId] }
  const [saving,   setSaving]   = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sv] = await Promise.all([
        api.get("/hotel/staff/pending"),
        api.get("/hotel/services"),
      ]);
      setStaff(s.data);
      setServices(sv.data.filter(x => x.is_active));
    } catch { toast("Yuklanmadi", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    socket.on("new_staff_registered", () => load());
    return () => socket.off("new_staff_registered");
  }, []);

  const toggle = (staffId, serviceId) =>
    setSelected(p => {
      const cur = p[staffId] || [];
      return { ...p, [staffId]: cur.includes(serviceId) ? cur.filter(id => id !== serviceId) : [...cur, serviceId] };
    });

  const activate = async (s) => {
    const ids = selected[s._id] || [];
    if (!ids.length) { toast("Kamida 1 ta xizmat tanlang", "warning"); return; }
    try {
      setSaving(s._id);
      await api.put(`/hotel/staff/${s._id}`, { status: "active", service_ids: ids });
      toast(`${s.full_name} faollashtirildi ✅`, "success");
      setStaff(p => p.filter(x => x._id !== s._id));
    } catch (e) { toast(e.response?.data?.message || "Xatolik", "error"); }
    finally { setSaving(null); }
  };

  const remove = async (s) => {
    if (!confirm(`${s.full_name} ni o'chirish?`)) return;
    await api.delete(`/hotel/staff/${s._id}`);
    toast("O'chirildi", "info");
    setStaff(p => p.filter(x => x._id !== s._id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Yangi xodimlar</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Rol berilmagan — {staff.length} kishi
        </p>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : staff.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm text-gray-500">Yangi xodim yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => (
            <div key={s._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0">
                    {s.full_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.full_name}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5">
                      {s.telegram_username && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <AtSign size={10} />{s.telegram_username}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} />{s.phone}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />{formatDate(s.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(s)} className="btn-ghost text-gray-300 hover:text-red-400 p-1.5">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Xizmat turlari
                </p>
                {services.length === 0 ? (
                  <p className="text-xs text-amber-500">⚠ Avval xizmat qo'shing</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {services.map(svc => {
                      const active = (selected[s._id] || []).includes(svc._id);
                      return (
                        <button
                          key={svc._id}
                          onClick={() => toggle(s._id, svc._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all
                            ${active ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-300 bg-white"}`}
                        >
                          {svc.icon} {svc.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => activate(s)}
                disabled={saving === s._id || !(selected[s._id]?.length > 0)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving === s._id
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserCheck size={15} />}
                Faollashtirish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
