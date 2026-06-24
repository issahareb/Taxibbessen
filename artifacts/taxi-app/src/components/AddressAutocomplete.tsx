import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
  };
  type: string;
  class: string;
}

export interface AddressSelection {
  fullAddress: string;
  road: string;
  houseNumber: string;
  postcode: string;
  city: string;
  hasHouseNumber: boolean;
}

function parseResult(r: NominatimResult): AddressSelection {
  const a = r.address;
  const road = a.road || "";
  const houseNumber = a.house_number || "";
  const postcode = a.postcode || "";
  const city = a.city || a.town || a.village || "";
  const suburb = a.suburb ? `${a.suburb}, ` : "";
  const street = [road, houseNumber].filter(Boolean).join(" ");
  const secondary = `${suburb}${[postcode, city].filter(Boolean).join(" ")}`.trim();
  const fullAddress = [street || r.display_name.split(", ")[0], secondary]
    .filter(Boolean)
    .join(", ");
  return {
    fullAddress,
    road,
    houseNumber,
    postcode,
    city,
    hasHouseNumber: Boolean(houseNumber),
  };
}

function formatForDisplay(r: NominatimResult): { main: string; secondary: string } {
  const parsed = parseResult(r);
  const street = [parsed.road, parsed.houseNumber].filter(Boolean).join(" ");
  const secondary = [parsed.postcode, parsed.city].filter(Boolean).join(" ");
  if (street) return { main: street, secondary };
  const parts = r.display_name.split(", ");
  return { main: parts[0], secondary: parts.slice(1, 3).join(", ") };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selection: AddressSelection) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
  inputClassName,
  autoFocus,
  name,
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const justSelectedRef = useRef(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "6",
        countrycodes: "de",
        viewbox: "6.8,51.7,7.3,51.3",
        "accept-language": "de",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { signal: abortRef.current.signal }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch (e: any) {
      if (e.name !== "AbortError") setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    const timer = setTimeout(() => fetchSuggestions(value), 350);
    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (r: NominatimResult) => {
      const parsed = parseResult(r);
      justSelectedRef.current = true;
      onChange(parsed.fullAddress);
      onSelect?.(parsed);
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [open, suggestions, activeIndex, selectSuggestion]
  );

  return (
    <div ref={containerRef} className="relative">
      {icon && (
        <div className="absolute left-3.5 top-3.5 pointer-events-none z-10">{icon}</div>
      )}
      {loading && (
        <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground animate-spin" />
      )}
      <input
        name={name}
        id={id}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-haspopup="listbox"
      />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-50 left-0 right-0 mt-1.5 overflow-hidden rounded-xl bg-popover border border-border shadow-2xl shadow-black/20 origin-top"
          >
            {suggestions.map((r, i) => {
              const { main, secondary } = formatForDisplay(r);
              return (
                <li
                  key={r.place_id}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(r);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-start gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                    i === activeIndex ? "bg-accent" : "hover:bg-accent/60"
                  } ${i < suggestions.length - 1 ? "border-b border-border" : ""}`}
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-popover-foreground truncate">{main}</p>
                    {secondary && (
                      <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
