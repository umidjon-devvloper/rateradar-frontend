import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Qidiruv imkoniyatli dropdown select.
 *
 * options: [{ value, label, sublabel? }]
 */
export default function SearchableSelect({
  value, onChange, options = [], placeholder = "Tanlang...",
  searchPlaceholder = "Qidirish...", className = "", disabled = false,
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  const filtered = search
    ? options.filter(o =>
        o.label?.toLowerCase().includes(search.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(search.toLowerCase()) ||
        o.value?.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Tashqarida bosilsa yopish
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        className={cn(
          "input flex items-center justify-between gap-2 text-left cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn("flex-1 truncate", !selected && "text-gray-400")}>
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selected.label}</span>
              {selected.sublabel && (
                <span className="text-gray-400 text-xs">{selected.sublabel}</span>
              )}
            </span>
          ) : placeholder}
        </span>
        <ChevronDown size={15} className={cn("text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent"
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">Topilmadi</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm",
                    "hover:bg-gray-50 transition-colors",
                    value === opt.value && "bg-blue-50"
                  )}
                >
                  <span className="flex-1 min-w-0">
                    <span className={cn("font-medium truncate block", value === opt.value ? "text-blue-700" : "text-gray-800")}>
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span className="text-xs text-gray-400 truncate block">{opt.sublabel}</span>
                    )}
                  </span>
                  {value === opt.value && <Check size={14} className="text-blue-600 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
