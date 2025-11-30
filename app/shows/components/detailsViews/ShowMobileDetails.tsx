import { ShowProps } from "@/types/show";
import { ShowAction } from "../ShowDetailsHub";
import React, { useEffect, useState } from "react";
import { X, Trash2, Plus, ChevronsUp } from "lucide-react";
import { showStatusOptions } from "@/utils/dropDownDetails";
import { formatDateShort, getStatusBg } from "@/utils/formattingUtils";
import Image from "next/image";
import { MobilePicker } from "@/app/components/ui/MobilePicker";
import { MobileAutoTextarea } from "@/app/components/ui/MobileAutoTextArea";
import { Loading } from "@/app/components/ui/Loading";

interface ShowMobileDetailsProps {
  show: ShowProps;
  localNote: string;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  addingShow?: boolean;
  onAddShow: () => void;
  onAction: (action: ShowAction) => void;
}

export function ShowMobileDetails({
  show,
  localNote,
  onClose,
  onAddShow,
  addingShow,
  onAction,
  isLoading,
}: ShowMobileDetailsProps) {
  const [posterLoaded, setPosterLoaded] = useState(false);

  useEffect(() => {
    // original values
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    // lock body in place
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-30 bg-zinc-950 overflow-y-auto flex flex-col animate-fadeIn">
      {isLoading?.isTrue && (
        <Loading
          customStyle={isLoading.style}
          text={isLoading.text}
          isMobile={true}
        />
      )}
      {/* ACTION BAR */}
      {(posterLoaded || addingShow) && (
        <div className="sticky top-0 z-30">
          <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
            <button
              className="bg-zinc-800/20 backdrop-blur-2xl p-2 rounded-md"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              {addingShow ? (
                <>
                  {/* NEED YEAR */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md px-2.5"
                    onClick={() => {
                      onAction({ type: "needYear" });
                    }}
                    title={"Search with year"}
                  >
                    <ChevronsUp className="w-5 h-5 text-slate-400 transition-colors" />
                  </button>
                  {/* ADD BUTTON */}
                  <button
                    className="bg-zinc-800/50 backdrop-blur-2xl p-2 rounded-md"
                    onClick={onAddShow}
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                </>
              ) : (
                <button
                  className="bg-zinc-800/20 backdrop-blur-2xl p-2 rounded-md"
                  onClick={() => onAction({ type: "deleteShow" })}
                >
                  <Trash2 className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* INFO */}
      <div className="pb-10">
        {/* POSTER */}
        <div className="relative w-full overflow-hidden bg-zinc-900/40">
          {show.posterUrl ? (
            <Image
              src={show.posterUrl}
              alt={show.title || "Poster"}
              width={1280}
              height={900}
              className="object-cover w-full"
              onLoad={() => setPosterLoaded(true)}
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-zinc-700 to-zinc-800" />
          )}

          {/* BOTTOM FADE */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>

        <div className="px-4">
          <div className="mt-4">
            <div></div>
            <div className="flex justify-between">
              {/* TITLE */}
              <h1 className="text-zinc-100 text-2xl font-bold -mt-0.5">
                {show.title}
              </h1>
              {/* SCORE */}
              <div>
                <MobilePicker
                  score={show.score || 0}
                  onScoreChange={(newScore) =>
                    onAction({
                      type: "changeScore",
                      payload: newScore,
                    })
                  }
                />
              </div>
            </div>
            {/* STUDIO AND DATE */}
            <div className="text-zinc-400 text-sm -mt-1 flex items-center gap-2">
              <span>{show.studio || "Unknown"}</span>•
              <span>{show.dateReleased || "-"}</span>
              {show.dateCompleted && (
                <>
                  •<span>{formatDateShort(show.dateCompleted)}</span>
                </>
              )}
            </div>
          </div>
          {/* STATUS */}
          <div className="mt-3">
            <label className="text-zinc-400 text-xs font-medium">Status</label>
            <div className="pt-1 flex flex-wrap gap-2 pb-1">
              {showStatusOptions.map((status, index) => (
                <button
                  key={status.value}
                  onClick={() =>
                    onAction({
                      type: "changeStatus",
                      payload: `${status.label}`,
                    })
                  }
                  className={`${
                    index === 3 ? "w-full" : "flex-1"
                  } px-4 py-1.5 text-sm rounded-md border border-zinc-700/30 font-semibold whitespace-nowrap transition ${
                    status.label === show.status
                      ? `${getStatusBg(status.label)} text-zinc-100`
                      : "text-zinc-300 bg-zinc-900/40 hover:bg-zinc-800/60"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
          {/* NOTE */}
          <div className="mt-1">
            <label className="text-zinc-400 text-xs font-medium">Notes</label>
            <div className="bg-zinc-800/40 rounded-lg pl-3 pr-1 pt-3 pb-2 focus-within:ring-1 focus-within:ring-zinc-700 transition duration-200 max-h-22 overflow-auto">
              <MobileAutoTextarea
                value={localNote}
                onChange={(e) =>
                  onAction({
                    type: "changeNote",
                    payload: e.target.value,
                  })
                }
                onBlur={() => onAction({ type: "saveNote" })}
                placeholder="Add your thoughts about this show..."
                className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none outline-none placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
