import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

const STYLE = {
  success: { wrap: "bg-white border-green-200",  icon: <CheckCircle size={16} className="text-green-500" /> },
  warning: { wrap: "bg-white border-amber-200",  icon: <AlertTriangle size={16} className="text-amber-500" /> },
  error:   { wrap: "bg-white border-red-200",    icon: <XCircle size={16} className="text-red-500" /> },
  info:    { wrap: "bg-white border-blue-200",   icon: <Info size={16} className="text-blue-500" /> },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "info", ms = 5000) => {
    const id = Date.now();
    setToasts(p => [{ id, msg, type }, ...p].slice(0, 5));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), ms);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "flex items-start gap-3 p-3.5 rounded-xl border shadow-lg animate-slide-in",
            STYLE[t.type]?.wrap
          )}>
            <span className="flex-shrink-0 mt-0.5">{STYLE[t.type]?.icon}</span>
            <p className="flex-1 text-sm text-gray-700 leading-snug">{t.msg}</p>
            <button
              onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};
