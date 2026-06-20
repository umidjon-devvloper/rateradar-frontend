import { useEffect, useState } from "react";
import { useOutletContext }    from "react-router-dom";
import { Plus, Pencil, Trash2, X, Check, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import api          from "../../lib/api";

const EMPTY = { name: "", sub_options: [] };

export default function ServicesPage() {
  const { t }                  = useOutletContext();
  const { toast }              = useToast();
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [newSub,   setNewSub]   = useState("");
  const [copied,   setCopied]   = useState(null);

  const load = async () => {
    try { setLoading(true); const { data } = await api.get("/hotel/services"); setServices(data); }
    catch { toast(t("error"), "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => setModal({ mode: "add",  data: { ...EMPTY, sub_options: [] } });
  const openEdit = (s) => setModal({ mode: "edit", data: { ...s, sub_options: s.sub_options || [] } });
  const close    = () => { setModal(null); setNewSub(""); };
  const set      = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const addSub = () => {
    if (!newSub.trim()) return;
    set("sub_options", [...modal.data.sub_options, { name: newSub.trim(), _id: Date.now().toString() }]);
    setNewSub("");
  };

  const save = async () => {
    if (!modal.data.name.trim()) { toast(t("serviceName").replace(" *","") + " majburiy", "warning"); return; }
    try {
      setSaving(true);
      if (modal.mode === "add") {
        const { data } = await api.post("/hotel/services", modal.data);
        setServices(p => [...p, data]);
        toast(t("add") + " ✅", "success");
      } else {
        const { data } = await api.put(`/hotel/services/${modal.data._id}`, modal.data);
        setServices(p => p.map(s => s._id === data._id ? data : s));
        toast(t("saved"), "success");
      }
      close();
    } catch { toast(t("error"), "error"); }
    finally { setSaving(false); }
  };

  const remove = async (s) => {
    if (!confirm(`"${s.name}" ${t("delete")}?`)) return;
    await api.delete(`/hotel/services/${s._id}`);
    setServices(p => p.filter(x => x._id !== s._id));
    toast(t("delete") + " ✓", "info");
  };

  const regenerate = async (s) => {
    try {
      const { data } = await api.post(`/hotel/services/${s._id}/regenerate-invite`);
      setServices(p => p.map(x => x._id === s._id ? { ...x, invite_code: data.invite_code, invite_link: data.invite_link } : x));
      toast(t("saved"), "success");
    } catch { toast(t("error"), "error"); }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast(t("copied"), "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t("serviceTypes")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} ta</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={15} /> {t("add")}
        </button>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">🛎</p>
          <p className="text-sm text-gray-500 mb-4">{t("noServices")}</p>
          <button onClick={openAdd} className="text-sm text-blue-600 font-medium hover:underline">
            {t("addFirst")}
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {[t("serviceName").replace(" *",""), t("subOptions"), t("inviteLink"), t("actions")].map(h => (
                  <th key={h} className="table-head-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map(s => (
                <tr key={s._id} className="hover:bg-gray-50/40">
                  <td className="table-cell">
                    <p className="font-medium text-gray-900">{s.name}</p>
                  </td>
                  <td className="table-cell">
                    {s.sub_options?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.sub_options.map(o => (
                          <span key={o._id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {o.name}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="table-cell">
                    {s.invite_link ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-gray-500 truncate max-w-[140px]">
                          {s.invite_link}
                        </span>
                        <button onClick={() => copyLink(s.invite_link, s._id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          title={t("copy")}>
                          {copied === s._id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => regenerate(s)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          title={t("regenerate")}>
                          <RefreshCw size={13} />
                        </button>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => remove(s)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={close}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">
                {modal.mode === "add" ? t("newService") : t("editService")}
              </h2>
              <button onClick={close} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Nom */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  {t("serviceName")}
                </label>
                <input type="text" value={modal.data.name}
                  onChange={e => set("name", e.target.value)}
                  className="input" placeholder={t("serviceNamePlaceholder")} />
              </div>

              {/* Ichki tanlovlar */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t("subOptions")}
                </label>
                <div className="space-y-1.5 mb-2">
                  {modal.data.sub_options.map(o => (
                    <div key={o._id} className="flex items-center gap-2">
                      <span className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">
                        {o.name}
                      </span>
                      <button
                        onClick={() => set("sub_options", modal.data.sub_options.filter(x => x._id !== o._id))}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newSub}
                    onChange={e => setNewSub(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSub())}
                    className="input flex-1 py-2 text-sm"
                    placeholder={t("subOptionPlaceholder")} />
                  <button onClick={addSub}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={close} className="btn-secondary py-2.5">{t("cancel")}</button>
              <button onClick={save} disabled={saving} className="btn-primary py-2.5 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
