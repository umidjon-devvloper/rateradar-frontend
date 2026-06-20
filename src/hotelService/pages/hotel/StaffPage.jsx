import { useEffect, useState } from "react";
import { useOutletContext }    from "react-router-dom";
import { Pencil, Trash2, Check, X, Send } from "lucide-react";
import { useToast }        from "../../context/ToastContext";
import SearchableSelect    from "../../components/ui/SearchableSelect";
import api                 from "../../lib/api";

export default function StaffPage() {
  const { t }              = useOutletContext();
  const { toast }          = useToast();
  const [staff,    setStaff]    = useState([]);
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null); // { id, svcIds }
  const [saving,   setSaving]   = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sv] = await Promise.all([
        api.get("/hotel/staff"),
        api.get("/hotel/services"),
      ]);
      setStaff(s.data);
      setServices(sv.data.filter(x => x.is_active));
    } catch { toast(t("error"), "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Services ni SearchableSelect uchun options formatiga o'tkazish
  const serviceOptions = services.map(s => ({
    value: s._id,
    label: s.name,
    sublabel: s.icon,
  }));

  const saveEdit = async (s) => {
    if (!editing.svcIds.length) { toast(t("selectServices"), "warning"); return; }
    try {
      setSaving(s._id);
      await api.put(`/hotel/staff/${s._id}`, { service_ids: editing.svcIds });
      toast(t("saved"), "success");
      setEditing(null);
      load();
    } catch { toast(t("error"), "error"); }
    finally { setSaving(null); }
  };

  const remove = async (s) => {
    if (!confirm(t("confirmDelete"))) return;
    await api.delete(`/hotel/staff/${s._id}`);
    toast(t("delete") + " ✓", "info");
    setStaff(p => p.filter(x => x._id !== s._id));
  };

  const telegramLink = (s) =>
    s.telegram_username
      ? `https://t.me/${s.telegram_username}`
      : `tg://user?id=${s.telegram_id}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{t("staffList")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("totalStaff")}: {staff.length}</p>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : staff.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">👤</p>
          <p className="text-sm text-gray-500">{t("noStaff")}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {[t("fullName"), t("servicesCol"), t("actions")].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map(s => {
                  const isEditing = editing?.id === s._id;
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/40">
                      {/* Ism */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {s.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{s.full_name}</p>
                            <p className="text-xs text-gray-400">{s.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Xizmatlar */}
                      <td className="table-cell min-w-[220px]">
                        {isEditing ? (
                          <SearchableSelect
                            value={editing.svcIds[0] || ""}
                            onChange={(v) => setEditing(p => ({
                              ...p,
                              svcIds: p.svcIds.includes(v)
                                ? p.svcIds.filter(x => x !== v)
                                : [...p.svcIds, v],
                            }))}
                            options={serviceOptions}
                            placeholder={t("selectServices")}
                            searchPlaceholder={t("searchServices")}
                            className="w-52"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {!s.service_ids?.length ? (
                              <span className="text-gray-400 text-xs">—</span>
                            ) : s.service_ids.map(sv => (
                              <span key={sv._id}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {sv.icon} {sv.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Amallar */}
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(s)} disabled={saving === s._id}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditing(null)}
                                className="p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditing({ id: s._id, svcIds: s.service_ids?.map(x => x._id) || [] })}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t("edit")}>
                                <Pencil size={13} />
                              </button>
                              <a
                                href={telegramLink(s)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t("telegram")}>
                                <Send size={13} />
                              </a>
                              <button onClick={() => remove(s)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title={t("delete")}>
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
