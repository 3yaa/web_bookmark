"use client";
import {
  Menu,
  Home,
  Video,
  Tv,
  Book,
  Gamepad2,
  X,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const menuItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Movies", icon: Video, path: "/movies" },
  { label: "Shows", icon: Tv, path: "/shows" },
  { label: "Books", icon: Book, path: "/books" },
  { label: "Games", icon: Gamepad2, path: "/games" },
  // { label: "Profile", icon: User, path: "" },
];

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isOpen) {
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-8 left-8 z-10 flex flex-col items-start"
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Dropdown - now appears above the button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="mb-3 w-40 rounded-xl bg-gradient-to-tr from-zinc-transparent via-zinc-800/20 to-zinc-800/60 backdrop-blur-xl 
                       border border-zinc-800/50 ring-1 ring-zinc-800/50 overflow-hidden"
          >
            <ul className="flex flex-col-reverse">
              {menuItems.reverse().map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.05, duration: 0.1 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        if (item.path) {
                          router.push(item.path);
                        }
                        setIsOpen(false); // Close menu after selection
                      }}
                      className="w-full flex items-center justify-between pl-4.5 pr-5 py-3
                                 text-sm font-medium text-zinc-300 
                                 hover:text-emerald-500 hover:bg-gradient-to-r  from-emerald-500/8
                                 transition-all group hover:cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4.5 h-4.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span className="tracking-wide truncate">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 
                                               translate-x-[-4px] group-hover:translate-x-0 
                                               transition-all duration-200"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN BUTTON */}
      <button
        className={`flex items-center justify-center w-14 h-14 rounded-full 
          border border-zinc-800/50 
          bg-gradient-to-bl from-zinc-transparent to-zinc-800/60 
          hover:bg-graident-to-bl hover:from-zinc-800/60 hover:to-transparent
          backdrop-blur-xl 
          shadow-md  hover:scale-105 active:scale-95 
          transition-all duration-200 relative z-10 hover:cursor-pointer`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-zinc-300" />
        ) : (
          <Menu className="w-5 h-5 text-zinc-300" />
        )}
      </button>
    </div>
  );
}
