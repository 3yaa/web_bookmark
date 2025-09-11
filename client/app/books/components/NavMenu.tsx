import { Menu, Home, Video, Tv, Book, Gamepad2, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { label: "Home", icon: Home },
  { label: "Movies", icon: Video },
  { label: "Shows", icon: Tv },
  { label: "Books", icon: Book },
  { label: "Games", icon: Gamepad2 },
  { label: "Profile", icon: User },
];

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col items-end">
      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-neutral-900 hover:bg-neutral-800 p-2.5 px-5 rounded-lg w-48 
                   shadow-lg border border-neutral-700/60
                   transition-all duration-200 text-gray-300/70 
                   hover:scale-105 active:scale-95 flex items-center justify-between border-t-0 border-r-0 rounded-tl-none rounded-br-none"
      >
        <span className="tracking-wide text-sm font-medium">Menu</span>
        <Menu className="w-5 h-5" />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 250, damping: 28 }}
            className="mt-0.5 w-48 rounded-xl bg-neutral-950 border border-neutral-800 shadow-xl overflow-hidden border-t-0 rounded-t-none"
          >
            <ul className="flex flex-col">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-6 py-3 
                                 text-left text-neutral-300 hover:text-emerald-500
                                 hover:bg-neutral-800/80 transition-all group"
                    >
                      <Icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="tracking-wide">{item.label}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
