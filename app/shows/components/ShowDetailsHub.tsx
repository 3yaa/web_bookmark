"use client";
import { ShowProps } from "@/types/show";
import React, { useCallback, useEffect, useState } from "react";
import { ShowDesktopDetails } from "./detailsViews/ShowDesktopDetails";
import { ShowMobileDetails } from "./detailsViews/ShowMobileDetails";

export type ShowAction =
  | { type: "closeModal" }
  | { type: "deleteShow" }
  | { type: "needYear" }
  | {
      type: "changeStatus";
      payload: "Completed" | "Want to Watch" | "Dropped" | "Watching";
    }
  | { type: "changeScore"; payload: number }
  | { type: "changeNote"; payload: string }
  | { type: "saveNote" }
  | { type: "changeSeason"; payload: "left" | "right" }
  | { type: "changeEpisode"; payload: "left" | "right" }
  | { type: "clickSeasonInput" }
  | { type: "clickEpisodeInput" }
  | { type: "submitSeasonInput" }
  | { type: "submitEpisodeInput" }
  | { type: "changeSeasonInput"; payload: string }
  | { type: "changeEpisodeInput"; payload: string }
  | {
      type: "changeProgress";
      payload: { seasonIndex: number; episode: number };
    };

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
  const [editingMode, setEditingMode] = useState({
    season: false,
    episode: false,
  });
  const [inputValues, setInputValues] = useState<{
    season: number | "";
    episode: number | "";
  }>({
    season: show.curSeasonIndex + 1,
    episode: show.curEpisode,
  });

  const handleAction = (action: ShowAction) => {
    switch (action.type) {
      // =========modal actions=============
      case "closeModal":
        handleModalClose();
        break;
      case "deleteShow":
        handleDelete();
        break;
      case "needYear":
        handleNeedYear();
        break;
      // =========update actions=============
      case "changeStatus":
        handleStatusChange(action.payload);
        break;
      case "changeScore":
        onUpdate(show.id, { score: action.payload });
        break;
      case "changeNote":
        setLocalNote(action.payload);
        break;
      case "saveNote":
        handleSaveNote();
        break;
      // =========season/episode navigation=============
      case "changeSeason":
        handleSeasonChange(action.payload);
        break;
      case "changeEpisode":
        handleEpisodeChange(action.payload);
        break;
      // =========s/ep input editing=============
      case "clickSeasonInput":
        handleInputClick("season");
        break;
      case "clickEpisodeInput":
        handleInputClick("episode");
        break;
      case "changeSeasonInput":
        handleSeasonInputChange(action.payload);
        break;
      case "changeEpisodeInput":
        handleEpisodeInputChange(action.payload);
        break;
      case "submitSeasonInput":
        handleInputSubmit("season");
        break;
      case "submitEpisodeInput":
        handleInputSubmit("episode");
        break;
      case "changeProgress":
        handleProgressChange(action.payload);
        break;
    }
  };

  const handleProgressChange = (payload: {
    seasonIndex: number;
    episode: number;
  }) => {
    onUpdate(show.id, {
      curSeasonIndex: payload.seasonIndex,
      curEpisode: payload.episode,
    });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as "Completed" | "Want to Watch";
    const updatesViaStatus: Partial<ShowProps> = {
      status: newStatus,
    };
    if (newStatus === "Completed") {
      updatesViaStatus.dateCompleted = new Date();
      if (show.seasons) {
        updatesViaStatus.curEpisode =
          show.seasons[show.seasons.length - 1].episode_count;
        updatesViaStatus.curSeasonIndex = show.seasons.length - 1;
      }
    } else if (show.dateCompleted) {
      updatesViaStatus.dateCompleted = null;
    }
    onUpdate(show.id, updatesViaStatus);
  };

  const handleSaveNote = () => {
    if (localNote !== show.note) {
      onUpdate(show.id, { note: localNote });
    }
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

  const handleAddShow = useCallback(() => {
    if (!addShow) return;
    addShow();
    onClose();
  }, [addShow, onClose]);

  const handleNeedYear = () => {
    const needYear = true;
    onUpdate(show.id, undefined, needYear);
  };

  const handleInputClick = (type: "season" | "episode") => {
    if (editingMode[type]) {
      setEditingMode({ season: false, episode: false });
      return;
    }
    //
    setEditingMode({
      season: type === "season",
      episode: type === "episode",
    });
    //
    setInputValues({
      season: show.curSeasonIndex + 1,
      episode: show.curEpisode,
    });
  };

  const handleInputSubmit = (type: "season" | "episode") => {
    if (!show.seasons) return;

    if (type === "season") {
      // empty input
      let seasonNum =
        inputValues.season === ""
          ? show.curSeasonIndex + 1
          : inputValues.season;
      // force clamp top
      seasonNum =
        seasonNum > show.seasons.length ? show.seasons.length : seasonNum;
      //
      if (seasonNum >= 1 && seasonNum <= show.seasons.length) {
        setEditingMode({ ...editingMode, season: false });
        onUpdate(show.id, {
          curSeasonIndex: seasonNum - 1,
          curEpisode: 1,
        });
      } else {
        setInputValues({ ...inputValues, season: show.curSeasonIndex + 1 });
        setEditingMode({ ...editingMode, season: false });
      }
    } else if (type === "episode") {
      const maxEpisodes = show.seasons[show.curSeasonIndex].episode_count;
      // empty input
      let episodeNum =
        inputValues.episode === "" ? show.curEpisode : inputValues.episode;
      // force clamp top
      episodeNum = episodeNum > maxEpisodes ? maxEpisodes : episodeNum;
      //
      if (episodeNum >= 1 && episodeNum <= maxEpisodes) {
        setEditingMode({ ...editingMode, episode: false });
        onUpdate(show.id, { curEpisode: episodeNum });
      } else {
        setInputValues({ ...inputValues, episode: show.curEpisode });
        setEditingMode({ ...editingMode, episode: false });
      }
    }
  };

  const handleSeasonInputChange = (value: string) => {
    // allow empty string so user can clear and retype
    if (value === "") {
      setInputValues({
        ...inputValues,
        season: "",
      });
    } else {
      const numValue = parseInt(value);
      setInputValues({
        ...inputValues,
        season: isNaN(numValue) ? "" : Math.max(1, numValue),
      });
    }
  };

  const handleEpisodeInputChange = (value: string) => {
    if (value === "") {
      setInputValues({
        ...inputValues,
        episode: "",
      });
    } else {
      const numValue = parseInt(value);
      setInputValues({
        ...inputValues,
        episode: isNaN(numValue) ? "" : Math.max(1, numValue),
      });
    }
  };

  const handleSeasonChange = (dir: string) => {
    if (!show.seasons) return;
    //
    let seasonIndex = show.curSeasonIndex;
    const seasons = show.seasons;
    //
    const isFirstSeason = seasonIndex === 0;
    const isLastSeason = seasonIndex === seasons.length - 1;
    //
    if (dir === "left") {
      if (isFirstSeason) return;
      //
      seasonIndex -= 1;
    } else if (dir === "right") {
      if (isLastSeason) return;
      //
      seasonIndex += 1;
    }
    const curEp = 1;
    onUpdate(show.id, { curSeasonIndex: seasonIndex, curEpisode: curEp });
  };

  const handleEpisodeChange = (dir: string) => {
    if (!show.seasons) return;
    //
    let { curSeasonIndex: seasonIndex, curEpisode: curEp } = show;
    const seasons = show.seasons;
    //
    const isFirstEpisode = seasonIndex === 0 && curEp === 1;
    const isLastEpisode =
      seasonIndex === seasons.length - 1 &&
      curEp === seasons[seasonIndex].episode_count;
    //
    if (dir === "left") {
      if (isFirstEpisode) return;
      // go back season's last ep
      if (curEp === 1) {
        seasonIndex -= 1;
        curEp = seasons[seasonIndex].episode_count;
      } else {
        curEp -= 1;
      }
    } else if (dir === "right") {
      if (isLastEpisode) return;
      // go to next season's first ep
      if (curEp === seasons[seasonIndex].episode_count) {
        seasonIndex += 1;
        curEp = 1;
      } else {
        curEp += 1;
      }
    }

    onUpdate(show.id, { curSeasonIndex: seasonIndex, curEpisode: curEp });
  };

  useEffect(() => {
    const handleLeave = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter") {
        const activeElement = document.activeElement;
        const isInTextarea = activeElement?.tagName === "TEXTAREA";
        const isInInput = activeElement?.tagName === "INPUT";
        const isInEditingMode = editingMode.season || editingMode.episode;
        if (!isInTextarea && !isInInput && !isInEditingMode) {
          handleAddShow();
        }
      }
    };
    //
    window.addEventListener("keydown", handleLeave);
    return () => window.removeEventListener("keydown", handleLeave);
  }, [onClose, editingMode, handleAddShow]);

  useEffect(() => {
    setInputValues({
      season: show.curSeasonIndex + 1,
      episode: show.curEpisode,
    });
  }, [show.curSeasonIndex, show.curEpisode]);

  if (!isOpen || !show) return null;

  return (
    <>
      <div className="lg:block hidden">
        <ShowDesktopDetails
          show={show}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingShow={!!addShow}
          onAddShow={handleAddShow}
          onAction={handleAction}
          editingMode={editingMode}
          inputValues={inputValues}
        />
      </div>
      <div className="block lg:hidden">
        <ShowMobileDetails
          show={show}
          onClose={onClose}
          localNote={localNote}
          isLoading={isLoading}
          addingShow={!!addShow}
          onAddShow={handleAddShow}
          onAction={handleAction}
        />
      </div>
    </>
  );
}
