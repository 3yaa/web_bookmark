import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Portal } from "@/utils/portal";
interface Option {
  value: string;
  label: string;
  bgStyle?: string;
  textStyle?: string;
}

interface DropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  dropStyle?: string[];
  customStyle?: string;
  dropDuration?: number;
}

export function Dropdown({
  value,
  options,
  onChange,
  customStyle = "text-zinc-200 font-semibold",
  disabled = false,
  dropStyle,
  dropDuration = 0.3,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // makes dropdown close when clicking outside it
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        menuRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
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
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full rounded-lg border backdrop-blur-sm
          flex items-center justify-between gap-3 px-4 py-3
          transition-all duration-300 ease-out
          hover:border-zinc-600/70 hover:bg-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/20
          focus:outline-none focus:ring-0.5 focus:ring-zinc-500/50 focus:border-zinc-700/70
          active:scale-[0.98]
            ${
              isOpen
                ? "border-zinc-600/70 bg-zinc-800/60 shadow-lg shadow-zinc-900/20"
                : "border-zinc-700/50 bg-zinc-900/40"
            }
          ${
            disabled
              ? "opacity-40 cursor-not-allowed hover:border-zinc-700/50 hover:bg-zinc-900/40 hover:shadow-none active:scale-100"
              : "cursor-pointer"
          }
        `}
      >
        <span className="text-sm font-medium tracking-wide">
          {selectedOption ? selectedOption.label : "Select Option"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-all duration-300 ease-out ${
            isOpen ? "rotate-180 text-zinc-300" : "rotate-0"
          }`}
        />
      </button>
      {/* DROPDOWN */}
      {isOpen && (
        <Portal>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            transition={{
              duration: dropDuration,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="z-50 rounded-lg rounded-t-md border border-zinc-700/40 bg-zinc-900/70 backdrop-blur-md shadow-lg overflow-hidden min-w-max"
            style={{
              position: "fixed",
              top: buttonRef.current?.getBoundingClientRect().bottom ?? 0,
              left: buttonRef.current?.getBoundingClientRect().left ?? 0,
              width: buttonRef.current?.offsetWidth, // keeps same width as button
            }}
          >
            {options.map((option) => {
              const textStyle = dropStyle?.[0] || option.textStyle;
              const bgStyle = dropStyle?.[1] || option.bgStyle;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-zinc-200 focus:outline-none border-b border-zinc-800/90 last:border-none transition-all duration-200 ease-out cursor-pointer
                  ${
                    option.value === value
                      ? `rounded-md bg-linear-to-r from-transparent ${bgStyle}`
                      : "hover:bg-zinc-800/70 hover:text-white"
                  }`}
                >
                  <span
                    className={`${option.value === value ? `${textStyle}` : ""}
                    `}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </Portal>
      )}
    </div>
  );
}
