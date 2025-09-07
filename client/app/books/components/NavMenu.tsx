import { Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-10 right-200 z-10 bg-slate-600">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bottom-full mb-3 right-0"
          >
            <button className="bg-slate-600 hover:bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-colors duration-200 text-white font-medium flex items-center gap-2 border-0">
              <Menu className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-600 hover:bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-colors duration-200 text-white font-medium flex items-center gap-2 hover:scale-105 active:scale-95 border-0"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
