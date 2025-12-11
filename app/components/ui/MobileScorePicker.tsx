import React, { useEffect, useRef, useState } from "react";

interface ScoreOption {
  value: string;
  label: string;
}

interface MobileScorePickerProps {
  isOpen: boolean;
  score: number;
  scoreOptions: ScoreOption[];
  onClose: () => void;
  onScoreChange: (score: number) => void;
}

export function MobileScorePicker({
  isOpen,
  score,
  scoreOptions,
  onClose,
  onScoreChange,
}: MobileScorePickerProps) {
  const [selectedScore, setSelectedScore] = useState(score);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset selection when picker opens
  useEffect(() => {
    if (isOpen) {
      setSelectedScore(score);
      setIsClosing(false);
    }
  }, [isOpen, score]);

  // Auto-scroll to selected score when picker opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const selectedButton = scrollRef.current.querySelector(
        `[data-score="${selectedScore}"]`
      ) as HTMLElement;
      if (selectedButton) {
        setTimeout(() => {
          selectedButton.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [isOpen, selectedScore]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleScoreSelect = (newScore: number) => {
    setSelectedScore(newScore);
    onScoreChange(newScore);
    setTimeout(() => {
      handleClose();
    }, 10);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="bg-zinc-950 rounded-t-3xl border-t border-zinc-900/50 shadow-2xl">
          {/* Handle */}
          <div className="pt-3 pb-4 flex justify-center">
            <div className="w-12 h-1 bg-zinc-700/80 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="px-5 pb-1">
            <h3 className="text-base font-semibold text-zinc-100 mb-3 text-center">
              Update Score
            </h3>

            {/* Scrollable Picker */}
            <div className="h-56 mb-5">
              <div
                ref={scrollRef}
                className="overflow-y-auto no-scrollbar h-full space-y-1.5 relative mask-gradient"
              >
                {scoreOptions.map((option) => (
                  <button
                    key={option.value}
                    data-score={Number(option.value)}
                    onClick={() => handleScoreSelect(Number(option.value))}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-150 active:scale-[0.98] ${
                      Number(option.value) === selectedScore
                        ? "bg-zinc-700 text-zinc-50"
                        : "bg-zinc-800/40 text-zinc-400 active:bg-zinc-800/60"
                    }`}
                  >
                    {option.label}
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
