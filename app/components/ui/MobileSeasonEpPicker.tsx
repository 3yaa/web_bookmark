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
  onProgressChange: (seasonIndex: number, episode: number) => void;
}

export function MobileProgressPicker({
  isOpen,
  seasons,
  curSeasonIndex,
  curEpisode,
  onClose,
  onProgressChange,
}: MobileProgressPickerProps) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(
    curSeasonIndex ?? 0
  );
  const [selectedEpisode, setSelectedEpisode] = useState(curEpisode ?? 1);
  const [isClosing, setIsClosing] = useState(false);
  const seasonRef = useRef<HTMLDivElement | null>(null);
  const episodeRef = useRef<HTMLDivElement | null>(null);
  const seasonObservers = useRef<IntersectionObserver | null>(null);
  const episodeObservers = useRef<IntersectionObserver | null>(null);

  // keep local state in sync with incoming props when opener resyncs
  useEffect(() => {
    if (isOpen) {
      setSelectedSeasonIndex(curSeasonIndex ?? 0);
      setSelectedEpisode(curEpisode ?? 1);
      // we'll programmatically scroll below after elements mount
    }
  }, [isOpen, curSeasonIndex, curEpisode]);

  const currentSeason = seasons[selectedSeasonIndex];
  const maxEpisodes = currentSeason?.episode_count || 0;

  // guard episode to valid range whenever season changes
  useEffect(() => {
    if (!seasons?.length) return;
    const newMax = seasons[selectedSeasonIndex]?.episode_count ?? 0;
    if (newMax <= 0) {
      setSelectedEpisode(0);
    } else {
      setSelectedEpisode((prev) => {
        if (prev <= 0) return 1;
        return prev > newMax ? newMax : prev;
      });
    }
  }, [selectedSeasonIndex, seasons]);

  // When modal opens: scroll both wheels to selected items (instant)
  useEffect(() => {
    if (!isOpen) return;

    // small timeout to allow DOM to render children
    const t = setTimeout(() => {
      const seasonEl = seasonRef.current?.querySelector<HTMLElement>(
        `[data-season="${selectedSeasonIndex}"]`
      );
      const episodeEl = episodeRef.current?.querySelector<HTMLElement>(
        `[data-episode="${selectedEpisode}"]`
      );

      seasonEl?.scrollIntoView({ behavior: "auto", block: "center" });
      episodeEl?.scrollIntoView({ behavior: "auto", block: "center" });
    }, 60);

    return () => clearTimeout(t);
    // intentionally not watching selectedSeasonIndex here to avoid fighting user scroll
    // we only do this on open to position the wheels initially.
  }, [isOpen, selectedEpisode, selectedSeasonIndex]);

  // IntersectionObserver: watch which season / episode is centered and update state
  useEffect(() => {
    if (!isOpen) return;
    // cleanup any existing observers
    seasonObservers.current?.disconnect();
    episodeObservers.current?.disconnect();

    const rootMargin = "-60% 0px -60% 0px"; // narrow center slab
    const seasonCb: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const idx = Number(el.dataset.season);
          if (!Number.isNaN(idx)) setSelectedSeasonIndex(idx);
        }
      });
    };
    const episodeCb: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const ep = Number(el.dataset.episode);
          if (!Number.isNaN(ep)) setSelectedEpisode(ep);
        }
      });
    };

    const sObserver = new IntersectionObserver(seasonCb, {
      root: seasonRef.current,
      rootMargin,
      threshold: 0.5,
    });
    const eObserver = new IntersectionObserver(episodeCb, {
      root: episodeRef.current,
      rootMargin,
      threshold: 0.5,
    });

    seasonObservers.current = sObserver;
    episodeObservers.current = eObserver;

    // observe season items
    const seasonNodes =
      seasonRef.current?.querySelectorAll<HTMLElement>("[data-season]");
    seasonNodes?.forEach((n) => sObserver.observe(n));
    // observe episode items
    const episodeNodes =
      episodeRef.current?.querySelectorAll<HTMLElement>("[data-episode]");
    episodeNodes?.forEach((n) => eObserver.observe(n));

    return () => {
      sObserver.disconnect();
      eObserver.disconnect();
    };
  }, [isOpen, seasons, maxEpisodes]);

  const handleConfirm = () => {
    onProgressChange(selectedSeasonIndex, selectedEpisode);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // match animation duration
  };

  const handleBackdropClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen || seasons.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${
          isClosing ? "animate-fadeOut" : "animate-fadeIn"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
      >
        <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-2xl">
          {/* Handle */}
          <div className="pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6 text-center">
              Update Progress
            </h3>

            <div className="flex gap-4 h-52">
              {/* Season Wheel */}
              <div className="flex-1 relative">
                <div className="text-xs text-zinc-400 font-medium mb-2 text-center">
                  Season
                </div>

                {/* Selection highlight */}
                <div className="absolute left-0 right-0 top-10 h-12 bg-zinc-800/50 rounded-lg pointer-events-none z-10"></div>

                <div
                  ref={seasonRef}
                  className="h-44 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide relative"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                  }}
                >
                  <div style={{ paddingTop: "96px", paddingBottom: "96px" }}>
                    {seasons.map((season, index) => (
                      <div
                        key={season.season_number + "-" + index}
                        data-season={index}
                        onClick={() => {
                          // clicking will scroll it into center and also set state
                          const el =
                            seasonRef.current?.querySelector<HTMLElement>(
                              `[data-season="${index}"]`
                            );
                          el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          // setSelectedSeasonIndex(index);
                        }}
                        className={`h-12 flex items-center justify-center text-2xl font-bold snap-center cursor-pointer transition-all duration-200 ${
                          selectedSeasonIndex === index
                            ? "text-zinc-100 scale-110"
                            : "text-zinc-600 scale-90"
                        }`}
                      >
                        {season.season_number}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Episode Wheel */}
              <div className="flex-1 relative">
                <div className="text-xs text-zinc-400 font-medium mb-2 text-center">
                  Episode
                </div>

                {/* Selection highlight */}
                <div className="absolute left-0 right-0 top-10 h-12 bg-zinc-800/50 rounded-lg pointer-events-none z-10"></div>

                <div
                  ref={episodeRef}
                  className="h-44 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide relative"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                  }}
                >
                  <div style={{ paddingTop: "96px", paddingBottom: "96px" }}>
                    {maxEpisodes > 0 ? (
                      Array.from({ length: maxEpisodes }, (_, i) => i + 1).map(
                        (ep) => (
                          <div
                            key={ep}
                            data-episode={ep}
                            onClick={() => {
                              const el =
                                episodeRef.current?.querySelector<HTMLElement>(
                                  `[data-episode="${ep}"]`
                                );
                              el?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              // setSelectedEpisode(ep);
                            }}
                            className={`h-12 flex items-center justify-center text-2xl font-bold snap-center cursor-pointer transition-all duration-200 ${
                              selectedEpisode === ep
                                ? "text-zinc-100 scale-110"
                                : "text-zinc-600 scale-90"
                            }`}
                          >
                            {ep}
                          </div>
                        )
                      )
                    ) : (
                      <div className="h-12 flex items-center justify-center text-zinc-500">
                        No episodes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            {/* <button
              onClick={handleConfirm}
              className="w-full mt-6 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold active:scale-[0.98] transition"
            >
              Done
            </button> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
