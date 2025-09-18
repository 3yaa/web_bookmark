"use client";
import { useState } from "react";
import Image from "next/image";
//
import { ShowProps } from "@/types/show";
import {
  formatDateShort,
  getStatusBorderGradient,
} from "@/utils/formattingUtils";
import { statusOptions, scoreOptions } from "@/utils/dropDownDetails";
//
import { AutoTextarea } from "@/app/components/ui/AutoTextArea";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { Loading } from "@/app/components/ui/Loading";
import { Trash2, Plus, X, ChevronsUp } from "lucide-react";
interface ShowDetailsProps {
  show: ShowProps;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    showId: number,
    updates?: Partial<ShowProps>,
    takeAction?: boolean
  ) => void;
  addShow?: () => void;
}

export function ShowDetails({
  isOpen,
  onClose,
  show,
  onUpdate,
  addShow,
  isLoading,
}: ShowDetailsProps) {
  const [localNote, setLocalNote] = useState(show.note || "");

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Read";
    const statusLoad: Partial<ShowProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      statusLoad.dateCompleted = new Date();
    } else if (show.dateCompleted) {
      statusLoad.dateCompleted = null;
    }
    onUpdate(show.id, statusLoad);
  };

  const saveNote = () => {
    if (localNote !== show.note) {
      onUpdate(show.id, { note: localNote });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      saveNote();
      e.currentTarget.blur(); // Optional: remove focus
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNote(e.target.value);
  };

  const handleDelete = () => {
    onClose();
    const shouldDelete = true;
    onUpdate(show.id, undefined, shouldDelete);
  };

  const handleModalClose = () => {
    if (addShow) return;
    onClose();
  };

  const handleAddShow = () => {
    if (!addShow) return;
    addShow();
    onClose();
  };

  const handleNeedYear = () => {
    const needYear = true;
    onUpdate(show.id, undefined, needYear);
  };

  if (!isOpen || !show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={handleModalClose} />
      {/* BACKGROUND BORDER GRADIENT */}
      <div
        className={`rounded-2xl bg-gradient-to-b ${getStatusBorderGradient(
          show.status
        )} py-2 px-2 lg:min-w-[45%] lg:max-w-[45%]`}
      >
        {/* ACTUAL DETAIL CARD */}
        <div className="bg-gradient-to-br bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-h-[calc(100vh-3rem)]">
          {isLoading?.isTrue && (
            <Loading customStyle={isLoading.style} text={isLoading.text} />
          )}
          <div className={`px-8.5 py-7 border-0 rounded-2xl overflow-hidden`}>
            {/* ACTION BUTTONS */}
            {addShow ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                {/* ADD */}
                <button
                  className="py-1.5 px-5 rounded-lg bg-zinc-800/50 hover:bg-green-600/20 hover:cursor-pointer transition-all group"
                  onClick={handleAddShow}
                  title={"Add Book"}
                >
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-0" />
                </button>
                {/* NEED YEAR */}
                <button
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800/50 hover:bg-blue-600/20 hover:cursor-pointer
                    transition-all group"
                  onClick={handleNeedYear}
                  title={"See More Options"}
                >
                  <ChevronsUp className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>
                {/* CLOSE BUTTON */}
                <button
                  className="py-1.5 px-2 rounded-lg bg-zinc-800/50 hover:bg-red-600/50 
                  hover:cursor-pointer transition-all group"
                  onClick={onClose}
                  title={"Close"}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-red-300 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800/0 hover:bg-red-700/20 hover:cursor-pointer transition-all duration-200 group z-10"
                onClick={handleDelete}
                title={"Delete Show"}
              >
                <Trash2 className="w-4 h-4 text-gray-400/5 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            )}

            <div className="flex gap-8">
              {/* LEFT SIDE -- PIC */}
              <div className="flex items-center justify-center max-w-62 max-h-93 overflow-hidden rounded-lg">
                {show.posterUrl !== undefined ? (
                  <>
                    <Image
                      src={show.posterUrl}
                      alt={show.title || "Untitled"}
                      width={248}
                      height={372}
                      className="min-w-[62] min-h-93 object-fill"
                    />
                    <div
                      className="absolute inset-0 left-8.5 top-7 max-w-62 max-h-93"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0) 50%, rgba(24,24,27,0.5) 100%)",
                      }}
                    />
                  </>
                ) : (
                  <div className="min-w-62 min-h-93 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30"></div>
                )}
              </div>
              {/* RIGHT SIDE -- DETAILS */}
              <div className="flex flex-col flex-1 min-h-93 min-w-62 relative">
                {/* BACKDROP */}
                {show.backdropUrl && (
                  <div className="absolute -top-7 left-20 -right-25 h-[70%] -z-10 overflow-hidden rounded-2xl">
                    <div className="relative h-full">
                      <Image
                        src={show.backdropUrl}
                        alt="Backdrop"
                        fill
                        className="object-cover opacity-30"
                        style={{
                          objectPosition: "center -10px", // image positioning
                        }}
                      />
                      {/* HORIZONTAL */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(24,24,27,1) 0%, rgba(24,24,27,0.1) 30%, transparent 50%, rgba(24,24,27,0.2) 100%)",
                        }}
                      />
                      {/* VERTICAL GRADIENT */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 0%, rgba(24,24,27,0.8) 50%, rgba(24,24,27,1) 75%, rgba(24,24,27,1) 100%)",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className={`flex flex-col justify-center flex-1`}>
                  {/* TITLE */}
                  <div className="w-fit mb-1.5 max-w-full">
                    <div className="font-bold text-zinc-100/90 text-3xl whitespace-nowrap overflow-x-auto overflow-y-hidden mb-1.5">
                      {show.title || "Untitled"}
                    </div>
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r ${getStatusBorderGradient(
                        show.status
                      )} to-zinc-800 rounded-full`}
                    ></div>
                  </div>
                  {/* STUDIO AND DATES */}
                  <div className="flex justify-start items-center gap-2 w-full mb-3">
                    <span className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 leading-6">
                      {show.studio || "Unknown Studio"}
                    </span>
                    {/* ◎ ◈ ୭ ✿ ✧ */}
                    <div className="font-medium text-zinc-200/70 text-md leading-6">
                      •
                    </div>
                    <span
                      className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-11 leading-6"
                      title="Date Published"
                    >
                      {show.dateReleased || "Unknown"}
                    </span>
                    {show.status === "Completed" && (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-zinc-200/70 text-md leading-6">
                          •
                        </div>
                        <span
                          className="font-medium text-zinc-200/70 text-md overflow-y-auto max-h-6 min-w-25 leading-6"
                          title="Date Completed"
                        >
                          {formatDateShort(show.dateCompleted)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div></div>
                  {/* STATUS AND SCORE */}
                  <div className=" flex justify-start gap-4 mb-2.5 max-w-[94%]">
                    <div className="flex-[0.77] lg:min-w-[165px]">
                      <label className="text-sm font-medium text-zinc-400 mb-1 block">
                        Status
                      </label>
                      <Dropdown
                        value={show.status}
                        onChange={handleStatusChange}
                        options={statusOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          show.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.24}
                      />
                    </div>
                    <div className="flex-[0.865] lg:min-w-[195px]">
                      <label className="ml-1 text-sm font-medium text-zinc-400 mb-1 block">
                        Score
                      </label>
                      <Dropdown
                        value={show.score?.toString() || "-"}
                        onChange={(value) => {
                          onUpdate(show.id, { score: Number(value) });
                        }}
                        options={scoreOptions}
                        customStyle="text-zinc-200/80 font-semibold"
                        dropStyle={
                          show.status === "Completed"
                            ? ["to-emerald-500/10", "text-emerald-500"]
                            : ["to-blue-500/10", "text-blue-500"]
                        }
                        dropDuration={0.4}
                      />
                    </div>
                  </div>
                  {/* NOTES */}
                  <div className="space-y-1 mb-2">
                    <label className="text-sm font-medium text-zinc-400 block">
                      Notes
                    </label>
                    <div className="bg-zinc-800/50 rounded-lg pl-3 pt-3 pr-1 pb-1.5 max-h-21.5 overflow-auto focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-200">
                      <AutoTextarea
                        value={localNote}
                        onChange={handleNoteChange}
                        onKeyDown={handleKeyDown}
                        onBlur={saveNote}
                        placeholder="Add your thoughts about this show..."
                        className="text-gray-300 text-sm leading-relaxed whitespace-pre-line w-full bg-transparent border-none resize-none outline-none placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
