import { useEffect, useId, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Suggestion = {
  label: string;
  mainText: string;
  secondaryText: string | null;
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  inputClassName: string;
  autoComplete?: string;
}

const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

/**
 * Address input that offers live suggestions while typing.
 *
 * Lookups go through our own /api/places/autocomplete rather than straight
 * to a geocoder: that keeps the API key on the server and means a visitor's
 * IP and half-typed address never reach a third party.
 *
 * Requests are debounced and superseded: only the newest keystroke's result
 * is applied, so fast typing cannot leave a stale list behind. If the
 * suggestion endpoint is unavailable the field silently stays a plain text
 * input, because a booking must never depend on the lookup working.
 */
export function AddressField({
  value,
  onChange,
  placeholder,
  icon: Icon,
  inputClassName,
  autoComplete,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  // Set while a suggestion is being applied, so the resulting value change
  // does not immediately trigger a fresh lookup for the text we just filled in.
  const skipNextLookup = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }

    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE}/api/places/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("lookup failed");
        const data = (await response.json()) as { suggestions?: Suggestion[] };
        const next = data.suggestions ?? [];
        setSuggestions(next);
        setActiveIndex(-1);
        setOpen(next.length > 0);
      } catch {
        // Aborted or unavailable: keep the field usable, just without hints.
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  const apply = (suggestion: Suggestion) => {
    skipNextLookup.current = true;
    onChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0) {
        event.preventDefault();
        apply(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Icon className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55 pointer-events-none z-10" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete ?? "off"}
        className={inputClassName}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      />

      {loading && value.trim().length >= MIN_QUERY_LENGTH && !open && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white/25 border-t-primary animate-spin" />
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-white/20 bg-[#14161c] shadow-2xl shadow-black/60"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.label}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                // The input's blur must not close the list before the click
                // lands, so selection happens on mousedown.
                onMouseDown={(event) => {
                  event.preventDefault();
                  apply(suggestion);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-primary/20" : "hover:bg-white/[0.07]"
                }`}
              >
                <span className="text-sm text-white leading-snug">{suggestion.mainText}</span>
                {suggestion.secondaryText && (
                  <span className="text-xs text-white/50 leading-snug">{suggestion.secondaryText}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
