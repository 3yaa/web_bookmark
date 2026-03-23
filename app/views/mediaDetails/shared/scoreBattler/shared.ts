import { BaseMediaProps } from "@/types/media";

export const actions = ["better", "worse", "settle"] as const;

export interface ScoreBattlerUIProps<T extends BaseMediaProps> {
  selectedItem: T;
  itemFacing: T;
  curScore: number;
  onClose: () => void;
  onPick: (choice: "better" | "worse" | "settle") => void;
  mediaType?: string;
}
