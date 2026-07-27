"use client";
import { DIFF_COLUMNS_GAME, GameProps } from "@/types/game";
import { useCallback, useEffect, useState } from "react";
import { gameStatusOptions } from "@/utils/dropDownDetails";
import { DesktopDetails } from "@/app/views/mediaDetails/DesktopDetails";
import { MobileDetails } from "@/app/views/mediaDetails/MobileDetails";
import { TIER_PHI_THRESHOLD, getSeedMu, Tier } from "@/lib/tierConfig";
import { useScoreNudge } from "@/hooks/useScoreNudge";
import { useGameSearch } from "@/hooks/external/useGameSearch";
import { mapIGDBDataToGame, mapIGDBDlcsDataToGame } from "./utils/gameMapping";

export type GameAction =
	| { type: "closeModal" }
	| { type: "delete" }
	| { type: "changeStatus"; payload: "Playing" | "Completed" | "Dropped" }
	| { type: "resetScore" }
	| { type: "nudgeScore"; payload: "up" | "down" }
	| { type: "setInitialTier"; payload: Tier }
	| { type: "changeNote"; payload: string }
	| { type: "saveNote" }
	| { type: "dlcNav"; payload: "next" | "prev" }
	| { type: "needYearField" }
	| { type: "refresh" }
	| { type: "confirmRefresh" }
	| { type: "cancelRefresh" }
	| { type: "changeCover"; payload: "next" | "prev" };

interface GameDetailsProps {
	game: GameProps;
	onClose: () => void;
	isLoading?: { isTrue: boolean; style: string; text: string };
	onUpdate: (
		gameId: number,
		updates?: Partial<GameProps>,
		takeAction?: boolean,
	) => void;
	addGame?: () => void;
	showDlc?: (igdbId: number, dlcIndex: number) => void;
	// reload metadata from source (poster/backdrop, studio, dlcs)
	onRefresh?: (metadata: Partial<GameProps>) => Promise<void>;
	//
	backdropUrls?: string[];
	backdropIndex?: number;
	updateBackdropIndex?: (newIndex: number) => void;
}

export function GameDetails({
	onClose,
	game,
	onUpdate,
	addGame,
	isLoading,
	showDlc,
	onRefresh,
	backdropUrls,
	backdropIndex,
	updateBackdropIndex,
}: GameDetailsProps) {
	const [localNote, setLocalNote] = useState(game.note || "");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { searchForGameById } = useGameSearch();
	// refresh preview state -- user picks a backdrop before saving
	const [isSelecting, setIsSelecting] = useState(false);
	const [refreshBackdrops, setRefreshBackdrops] = useState<string[]>([]);
	const [refreshBackdropIndex, setRefreshBackdropIndex] = useState(0);
	const [refreshMeta, setRefreshMeta] = useState<Partial<GameProps>>({});

	// manual +/- 0.1 score tweaks -- phi tightens once, on close
	const { nudge: nudgeScore, commit: commitScoreNudge } = useScoreNudge(
		game,
		onUpdate,
	);

	const handleAction = (action: GameAction) => {
		switch (action.type) {
			// =========modal actions=============
			case "closeModal":
				handleModalClose();
				break;
			case "delete":
				handleDelete();
				break;
			case "needYearField":
				handleNeedYear();
				break;
			// =========update actions=============
			case "changeStatus":
				handleStatusChange(action.payload);
				break;
			case "setInitialTier":
				onUpdate(game.id, {
					score: {
						mu: getSeedMu(action.payload),
						phi: TIER_PHI_THRESHOLD[action.payload],
					},
				});
				break;
			case "resetScore":
				onUpdate(game.id, { score: null });
				break;
			case "nudgeScore":
				nudgeScore(action.payload);
				break;
			case "changeNote":
				setLocalNote(action.payload);
				break;
			case "saveNote":
				handleSaveNote();
				break;
			case "changeCover":
				if (isSelecting) handleSelectBackdropChange(action.payload);
				else handleCoverChange(action.payload);
				break;
			// =========other actions=============
			case "dlcNav": // switches modal to DLC
				hanldeDlcOpen(action.payload);
				break;
			case "refresh":
				handleRefresh();
				break;
			case "confirmRefresh":
				handleConfirmRefresh();
				break;
			case "cancelRefresh":
				handleCancelRefresh();
				break;
		}
	};

	// cycle the previewed backdrop while in refresh selection mode
	const handleSelectBackdropChange = (dir: "next" | "prev") => {
		if (!refreshBackdrops.length) return;
		setRefreshBackdropIndex((i) =>
			dir === "next"
				? (i + 1) % refreshBackdrops.length
				: i === 0
					? refreshBackdrops.length - 1
					: i - 1,
		);
	};

	// reloaded by igdbId -- reloads dlcs and all dlc in list
	const handleRefresh = async () => {
		if (!onRefresh || !game.igdbId || isRefreshing || isSelecting) return;
		setIsRefreshing(true);
		try {
			const data = await searchForGameById(game.igdbId);
			if (!data) return;
			const meta: Partial<GameProps> = {};
			if (game.dlcIndex === 0) {
				const mapped = mapIGDBDataToGame(data);
				meta.posterUrl = mapped.posterUrl;
				meta.dlcs = mapped.dlcs;
			} else {
				const mapped = mapIGDBDlcsDataToGame(
					data,
					game.mainTitle || "",
				);
				meta.posterUrl = mapped.posterUrl;
				// reorder dlc based on reload
				const mainIgdbId = game.dlcs?.[0]?.id;
				if (mainIgdbId) {
					const mainData = await searchForGameById(mainIgdbId);
					if (mainData) {
						const newDlcs = mapIGDBDataToGame(mainData).dlcs;
						meta.dlcs = newDlcs;
						const idx =
							newDlcs?.findIndex((d) => d.id === game.igdbId) ??
							-1;
						if (idx >= 0) meta.dlcIndex = idx;
					}
				}
			}
			const backdrops =
				data.screenshot_urls?.map((ss) => ss.ss_url).filter(Boolean) ??
				[];
			setRefreshMeta(meta);
			setRefreshBackdrops(backdrops);
			setRefreshBackdropIndex(0);
			setIsSelecting(true);
		} finally {
			setIsRefreshing(false);
		}
	};

	// apply the previewed backdrop + metadata
	const handleConfirmRefresh = async () => {
		if (!onRefresh) return;
		const meta: Partial<GameProps> = { ...refreshMeta };
		if (refreshBackdrops.length) {
			meta.backdropUrl = refreshBackdrops[refreshBackdropIndex];
		}
		exitSelecting();
		await onRefresh(meta);
	};

	const handleCancelRefresh = () => {
		exitSelecting();
	};

	const exitSelecting = () => {
		setIsSelecting(false);
		setRefreshBackdrops([]);
		setRefreshBackdropIndex(0);
		setRefreshMeta({});
	};

	const handleStatusChange = (value: string) => {
		const newStatus = value as "Playing" | "Completed";
		const statusLoad: Partial<GameProps> = {
			status: newStatus,
		};
		if (newStatus === "Completed") {
			statusLoad.dateCompleted = new Date();
		} else if (game.dateCompleted) {
			statusLoad.dateCompleted = null;
		}
		onUpdate(game.id, statusLoad);
	};

	const hanldeDlcOpen = (dir: string) => {
		if (!showDlc) return;
		let targetIgdbId;
		let dlcIndex;
		if (game.dlcs) {
			if (dir === "next" && game.dlcIndex < game.dlcs.length) {
				dlcIndex = game.dlcIndex + 1;
				targetIgdbId = game.dlcs[dlcIndex].id;
			} else if (dir === "prev") {
				dlcIndex = game.dlcIndex - 1;
				targetIgdbId = game.dlcs[dlcIndex].id;
			}
		}
		//
		if (targetIgdbId && dlcIndex !== undefined) {
			showDlc(targetIgdbId, dlcIndex);
		}
	};

	const handleSaveNote = () => {
		if (localNote !== game.note) {
			onUpdate(game.id, { note: localNote });
		}
	};

	const handleDelete = () => {
		onClose();
		const shouldDelete = true;
		onUpdate(game.id, undefined, shouldDelete);
	};

	const handleModalClose = () => {
		// fold the deferred phi drop into the update this close flushes
		commitScoreNudge();
		// if (addGame) return;
		onClose();
	};

	const handleNeedYear = () => {
		const needYear = true;
		onUpdate(game.id, undefined, needYear);
	};

	const handleAddGame = useCallback(() => {
		if (!addGame) return;
		addGame();
	}, [addGame]);

	const handleCoverChange = (dir: string) => {
		if (
			!updateBackdropIndex ||
			backdropIndex === undefined ||
			!backdropUrls
		) {
			return;
		}
		//
		let newCoverIndex = backdropIndex;
		if (dir === "next") {
			newCoverIndex = (backdropIndex + 1) % backdropUrls.length;
		} else if (dir === "prev") {
			newCoverIndex =
				backdropIndex === 0
					? backdropUrls.length - 1
					: backdropIndex - 1;
		}
		updateBackdropIndex(newCoverIndex);
	};

	useEffect(() => {
		const handleLeave = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				const activeElement = document.activeElement;
				const isInTextarea = activeElement?.tagName === "TEXTAREA";
				const isInInput = activeElement?.tagName === "INPUT";
				if (!isInTextarea && !isInInput) {
					handleAddGame();
				}
			}
		};
		//
		window.addEventListener("keydown", handleLeave);
		return () => window.removeEventListener("keydown", handleLeave);
	}, [onClose, handleAddGame]);

	if (!game) return null;

	const displayLoading = isRefreshing
		? {
				isTrue: true,
				style: "h-8 w-8 border-emerald-400",
				text: "Reloading...",
			}
		: isLoading;

	//  apply refresh on preview
	const previewGame = isSelecting
		? {
				...game,
				...refreshMeta,
				posterUrl: refreshMeta.posterUrl ?? game.posterUrl,
			}
		: game;

	return (
		<>
			<div className="lg:block hidden">
				<DesktopDetails
					item={previewGame}
					localNote={localNote}
					statusOptions={gameStatusOptions}
					mediaType="game"
					isLoading={displayLoading}
					isAdding={!!addGame}
					onAdd={handleAddGame}
					onClose={handleModalClose}
					canRefresh={!!onRefresh}
					isSelecting={isSelecting}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_GAME}
					backdropUrls={isSelecting ? refreshBackdrops : backdropUrls}
					backdropIndex={
						isSelecting ? refreshBackdropIndex : backdropIndex
					}
				/>
			</div>
			<div className="block lg:hidden">
				<MobileDetails
					item={previewGame}
					localNote={localNote}
					statusOptions={gameStatusOptions}
					mediaType="game"
					isLoading={displayLoading}
					isAdding={!!addGame}
					onAdd={handleAddGame}
					onClose={handleModalClose}
					canRefresh={!!onRefresh}
					isSelecting={isSelecting}
					onAction={
						handleAction as (action: {
							type: string;
							payload?: unknown;
						}) => void
					}
					differentColumns={DIFF_COLUMNS_GAME}
				/>
			</div>
		</>
	);
}
