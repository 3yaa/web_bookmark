import { BaseMediaProps } from "@/types/media";
import { BookProps } from "@/types/book";

export const actions = ["better", "worse", "same"] as const;

export const coverFor = <T extends BaseMediaProps>(
	item: T | null,
): string | null =>
	item?.posterUrl ||
	(item as unknown as BookProps | null)?.cover?.url ||
	null;

export interface ScoreBattlerUIProps<T extends BaseMediaProps> {
  selectedItem: T;
  itemFacing: T;
  mediaType?: string;
  onPick: (choice: "better" | "worse" | "same") => void;
}
