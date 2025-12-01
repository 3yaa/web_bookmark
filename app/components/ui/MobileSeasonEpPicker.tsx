import React, { useEffect, useRef, useState } from "react";

interface Season {
  season_number: number;
  episode_count: number;
}

interface MobileProgressPickerProps {
  isOpen: boolean;
  seasons: Season[];
  curSeasonIndex: number;
  curEpisode: number;
  onClose: () => void;
  onEpisodeChange: (episode: number) => void;
  onSeasonIndexChange: (seasonIndex: number) => void;
}

export function MobileProgressPicker({
  isOpen,
  seasons,
  curSeasonIndex,
  curEpisode,
  onClose,
  onEpisodeChange,
  onSeasonIndexChange,
}: MobileProgressPickerProps) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(
    curSeasonIndex ?? 0
  );
  const [selectedEpisode, setSelectedEpisode] = useState(curEpisode ?? 1);
  const [isClosing, setIsClosing] = useState(false);
  const seasonScrollRef = useRef<HTMLDivElement>(null);
  const episodeScrollRef = useRef<HTMLDivElement>(null);

  // Reset selection when picker opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSeasonIndex(curSeasonIndex ?? 0);
      setSelectedEpisode(curEpisode ?? 1);
      setIsClosing(false);
    }
  }, [isOpen, curSeasonIndex, curEpisode]);

  // Auto-scroll to selected items when picker opens or selection changes
  useEffect(() => {
    if (isOpen && seasonScrollRef.current) {
      const selectedButton = seasonScrollRef.current.querySelector(
        `[data-season="${selectedSeasonIndex}"]`
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
  }, [isOpen, selectedSeasonIndex]);

  useEffect(() => {
    if (isOpen && episodeScrollRef.current) {
      const selectedButton = episodeScrollRef.current.querySelector(
        `[data-episode="${selectedEpisode}"]`
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
  }, [isOpen, selectedEpisode, selectedSeasonIndex]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!isOpen || seasons.length === 0) return null;

  const seasonOptions = seasons.map((s, idx) => ({
    index: idx,
    label: `Season ${s.season_number}`,
  }));

  const episodeOptions = Array.from(
    { length: seasons[selectedSeasonIndex]?.episode_count || 0 },
    (_, i) => i + 1
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
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
        <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800/50 shadow-2xl">
          {/* Handle */}
          <div className="pt-3 pb-4 flex justify-center">
            <div className="w-12 h-1 bg-zinc-700/80 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="px-5 pb-1">
            <h3 className="text-base font-semibold text-zinc-100 mb-5 text-center">
              Update Progress
            </h3>

            {/* Scrollable Pickers */}
            <div className="flex gap-3 h-56 mb-5">
              {/* Season Picker */}
              <div className="flex flex-col flex-1">
                <span className="text-zinc-500 text-xs font-medium mb-2.5 text-center">
                  Season
                </span>
                <div
                  ref={seasonScrollRef}
                  className="overflow-y-auto no-scrollbar flex-1 space-y-1.5 relative mask-gradient"
                >
                  {seasonOptions.map((s) => (
                    <button
                      key={s.index}
                      data-season={s.index}
                      onClick={() => {
                        setSelectedSeasonIndex(s.index);
                        setSelectedEpisode(1);
                        onSeasonIndexChange(s.index);
                        setTimeout(() => {
                          handleClose();
                        }, 10);
                      }}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                        s.index === selectedSeasonIndex
                          ? "bg-zinc-700 text-zinc-50"
                          : "bg-zinc-800/40 text-zinc-400 active:bg-zinc-800/60"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Picker */}
              <div className="flex flex-col flex-1">
                <span className="text-zinc-500 text-xs font-medium mb-2.5 text-center">
                  Episode
                </span>
                <div
                  ref={episodeScrollRef}
                  className="overflow-y-auto no-scrollbar flex-1 space-y-1.5 relative mask-gradient"
                >
                  {episodeOptions.map((episode) => (
                    <button
                      key={episode}
                      data-episode={episode}
                      onClick={() => {
                        setSelectedEpisode(episode);
                        onEpisodeChange(episode);
                        setTimeout(() => {
                          handleClose();
                        }, 10);
                      }}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                        episode === selectedEpisode
                          ? "bg-zinc-700 text-zinc-50"
                          : "bg-zinc-800/40 text-zinc-400 active:bg-zinc-800/60"
                      }`}
                    >
                      Episode {episode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
