import React, { useState, useRef, useEffect } from "react";
import { scoreOptions } from "@/utils/dropDownDetails";

interface MobilePickerProps {
  score: number;
  onScoreChange: (score: number) => void;
}

export function MobilePicker({ score, onScoreChange }: MobilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSelectScore = (newScore: number) => {
    onScoreChange(newScore);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    //
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    //
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* OPTION */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md shadow-inner shadow-black/40 cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
      >
        {score || "-"}
      </button>
      {/* FULL SCREEN MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-2xl overflow-y-auto flex flex-col items-center justify-center animate-fadeIn p-4">
          {/* OPTIONS GRID */}
          <div ref={modalRef} className="w-full max-w-sm">
            <div className="grid grid-cols-1 gap-2">
              {scoreOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectScore(Number(option.value))}
                  className={`w-full min-w-50 px-4 py-3 text-left font-medium rounded-lg border transition ${
                    Number(option.value) === score
                      ? "bg-zinc-900/80 text-zinc-100 border-zinc-900"
                      : "bg-zinc-800/60 text-zinc-300 border-zinc-800/40 active:bg-zinc-800/60"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
