import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  customStyle?: string;
}

export function Dropdown({
  value,
  options,
  onChange,
  customStyle = "",
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // makes dropdown close when clicking outside it
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  // makes dropdown close when pressing 'ecs' key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => {
    return option.value === value;
  });

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${customStyle}`}>
      {/* BUTTON FOR DROPDOWN */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`border rounded-md flex items-center justify-between  gap-1 px-2 py-2 transition-all duration-200 ${
          disabled ? "opacity-50 cusor-not-allowed" : "cursor-pointer"
        } ${isOpen ? "ring-2" : ""}`}
      >
        <span>{selectedOption ? selectedOption.label : "-"}</span>
        <ChevronDown
          className={`w-5 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden bg-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-lg shadow-2xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="flex justify-between items-center w-full px-3 py-1"
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
