import { Tier, TIERS } from "@/lib/tierConfig";
import React, { useState } from "react";

interface MobileScorePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreChange: (tier: Tier) => void;
}

export function MobileScorePicker({
  isOpen,
  onClose,
  onScoreChange,
}: MobileScorePickerProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleSelect = (tier: Tier) => {
    onScoreChange(tier);
    setTimeout(() => {
      handleClose();
    }, 10);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="bg-zinc-950 rounded-t-3xl border-t border-zinc-900/50 shadow-2xl">
          <div className="pt-3 pb-4 flex justify-center">
            <div className="w-12 h-1 bg-zinc-700/80 rounded-full"></div>
          </div>

          <div className="px-5 pb-1">
            <h3 className="text-base font-semibold text-zinc-100 mb-3 text-center">
              Set Initial Tier
            </h3>

            <div className="h-56 mb-5">
              <div className="overflow-y-auto no-scrollbar h-full space-y-1.5 relative mask-gradient">
                {/* straight off TIERS -- tierOptions leads with the dropdown's
                    "-" placeholder, which is not a tier */}
                {TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleSelect(tier)}
                    className="w-full py-3 rounded-lg font-medium transition-all duration-150 active:scale-[0.98] bg-zinc-800/40 text-zinc-400 active:bg-zinc-800/60"
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
