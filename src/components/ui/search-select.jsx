import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchSelect — debounced autocomplete input
 *
 * @param {Function} fetchOptions - async (query) => array
 * @param {Function} renderOption - (option, isSelected) => JSX
 * @param {Function} getKey - (option) => string
 * @param {Function} getLabel - (option) => string for input display
 * @param {Function} onSelect - (option) => void
 */
export function SearchSelect({
  placeholder = 'Search...',
  fetchOptions,
  renderOption,
  getKey,
  getLabel,
  onSelect,
  selected,
  disabled = false,
  minChars = 2,
  delay = 350,
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (selected) setQuery(getLabel(selected));
  }, [selected]);

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < minChars) {
      setOptions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    timerRef.current = setTimeout(async () => {
      try {
        const results = await fetchOptions(val);
        setOptions(results || []);
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, delay);
  };

  const handleSelect = (opt) => {
    onSelect(opt);
    setQuery(getLabel(opt));
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= minChars && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && (options.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border bg-popover shadow-lg animate-fade-in">
          {loading && options.length === 0 && (
            <div className="p-4 text-sm text-center text-muted-foreground">Yuklanmoqda...</div>
          )}
          {options.map((opt) => {
            const key = getKey(opt);
            const isSelected = selected && getKey(selected) === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  'w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm flex items-center justify-between gap-2',
                  isSelected && 'bg-accent'
                )}
              >
                <div className="flex-1 min-w-0">{renderOption(opt, isSelected)}</div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
