import { BaseMediaProps } from "@/types/media";

export const actions = ["better", "worse", "same"] as const;

export interface ScoreBattlerUIProps<T extends BaseMediaProps> {
  selectedItem: T;
  itemFacing: T;
  mediaType?: string;
  onPick: (choice: "better" | "worse" | "same") => void;
}
