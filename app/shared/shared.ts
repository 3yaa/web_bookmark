import { ReactNode } from "react";

export interface ColumnConfig<T> {
  label: string;
  sortKey: string;
  render: (item: T) => ReactNode;
}
