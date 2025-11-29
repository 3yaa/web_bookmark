// ScoreSelector.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { scoreOptions } from "@/utils/dropDownDetails";

interface ScoreSelectorProps {
  score: number;
  onScoreChange: (score: number) => void;
}

export function ScoreSelector({ score, onScoreChange }: ScoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectScore = (newScore: number) => {
    onScoreChange(newScore);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 font-bold bg-zinc-800/60 px-3 py-1.5 rounded-md shadow-inner shadow-black/40 cursor-pointer hover:bg-zinc-700/60 transition flex items-center gap-2"
      >
        {score || "-"}
        {/* <ChevronDown className="w-4 h-4" /> */}
      </button>

      {/* FULL SCREEN MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto flex flex-col animate-fadeIn">
          {/* CLOSE BUTTON */}
          <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
            <h2 className="text-zinc-100 font-semibold">Select Score</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-zinc-800/20 backdrop-blur-2xl p-2 rounded-md"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* OPTIONS GRID */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {scoreOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectScore(Number(option.value))}
                  className={`w-full px-4 py-3 text-left font-medium rounded-lg border transition ${
                    Number(option.value) === score
                      ? "bg-zinc-700/60 text-zinc-100 border-zinc-600"
                      : "bg-zinc-900/40 text-zinc-300 border-zinc-800/40 active:bg-zinc-800/60"
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
