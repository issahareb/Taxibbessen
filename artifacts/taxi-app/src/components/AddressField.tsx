import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { AddressAutocomplete, AddressSelection } from "./AddressAutocomplete";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
  houseNumberInputClassName?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  houseNumberLabel?: string;
  houseNumberPlaceholder?: string;
}

interface AddressBase {
  road: string;
  postcode: string;
  city: string;
}

function buildCombined(base: AddressBase, houseNumber: string): string {
  const street = [base.road, houseNumber.trim()].filter(Boolean).join(" ");
  const locality = [base.postcode, base.city].filter(Boolean).join(" ");
  return [street, locality].filter(Boolean).join(", ");
}

export function AddressField({
  value,
  onChange,
  placeholder,
  icon,
  inputClassName,
  houseNumberInputClassName,
  autoFocus,
  name,
  id,
  houseNumberLabel = "Hausnummer",
  houseNumberPlaceholder = "z. B. 12a",
}: Props) {
  const [showHouseNumber, setShowHouseNumber] = useState(false);
  const [houseNumber, setHouseNumber] = useState("");
  const [addressBase, setAddressBase] = useState<AddressBase | null>(null);
  const houseNumberRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (selection: AddressSelection) => {
      if (selection.road) {
        const base: AddressBase = {
          road: selection.road,
          postcode: selection.postcode,
          city: selection.city,
        };
        setAddressBase(base);
        setHouseNumber(selection.houseNumber);
        setShowHouseNumber(true);
        if (!selection.hasHouseNumber) {
          setTimeout(() => houseNumberRef.current?.focus(), 250);
        }
      } else {
        setShowHouseNumber(false);
        setAddressBase(null);
      }
    },
    []
  );

  const handleHouseNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = e.target.value;
      setHouseNumber(num);
      if (addressBase) {
        onChange(buildCombined(addressBase, num));
      }
    },
    [addressBase, onChange]
  );

  const handleMainChange = useCallback(
    (val: string) => {
      onChange(val);
      if (showHouseNumber) {
        setShowHouseNumber(false);
        setAddressBase(null);
        setHouseNumber("");
      }
    },
    [onChange, showHouseNumber]
  );

  const defaultHouseInputCls =
    houseNumberInputClassName ||
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div>
      <AddressAutocomplete
        value={value}
        onChange={handleMainChange}
        onSelect={handleSelect}
        placeholder={placeholder}
        icon={icon}
        inputClassName={inputClassName}
        autoFocus={autoFocus}
        name={name}
        id={id}
      />

      <AnimatePresence>
        {showHouseNumber && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={houseNumberRef}
                  type="text"
                  value={houseNumber}
                  onChange={handleHouseNumberChange}
                  placeholder={houseNumberPlaceholder}
                  className={`${defaultHouseInputCls} pl-9`}
                  maxLength={10}
                />
              </div>
              <label className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {houseNumberLabel}
              </label>
            </div>
            {!houseNumber.trim() && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-amber-500" />
                Bitte Hausnummer eingeben
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
