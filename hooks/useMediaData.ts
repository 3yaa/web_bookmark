import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "./useAuthFetch";

interface MediaDataConfig<T> {
  endpoint: string;
  extraFieldsToUpdate?: string[];
  requiredFieldsToPost: (keyof T)[];
  statusOrder: Record<string, number>;
}

export function useMediaData<T extends { id: number; status: string }>({
  endpoint,
  statusOrder,
  extraFieldsToUpdate,
  requiredFieldsToPost,
}: MediaDataConfig<T>) {
  const { authFetch } = useAuthFetch();
  const [items, setItems] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // READ
  const load = useCallback(async () => {
    try {
      setIsProcessing(true);
      //
      const url = `/api/${endpoint}`;
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error--status: ${response.status}`);
      }
      //
      const resJson = await response.json();
      setItems(resJson.data || []);
    } catch (e) {
      console.error("Error loading " + endpoint, e);
      setItems([]);
    } finally {
      setIsProcessing(false);
    }
  }, [authFetch, endpoint]);

  // CREATE
  const add = useCallback(
    async (item: T) => {
      // req data
      if (requiredFieldsToPost.some((field) => !item[field])) return;
      //
      try {
        setIsProcessing(true);
        //
        const url = `/api/${endpoint}`;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
        //
        const resJson = await response.json();
        const newItem = resJson.data;
        setItems((prev) => {
          // find the first index of status group
          const firstIndexOfStatus = prev.findIndex(
            (m) => m.status === newItem.status,
          );
          // if no status group
          if (firstIndexOfStatus === -1) {
            return [newItem, ...prev];
          }
          // insert at the beginning of status group
          return [
            ...prev.slice(0, firstIndexOfStatus),
            newItem,
            ...prev.slice(firstIndexOfStatus),
          ];
        });
      } catch (e) {
        console.error("Error adding " + endpoint, e);
      } finally {
        setIsProcessing(false);
      }
    },
    [authFetch, endpoint, requiredFieldsToPost],
  );

  // UPDATE
  const update = useCallback(
    async (itemId: number, updates: Partial<T>) => {
      try {
        // only updates these
        const allowedFields = [
          "score",
          "status",
          "note",
          "dateCompleted",
          ...(extraFieldsToUpdate ?? []),
        ];

        const invalidFields = Object.keys(updates).filter(
          (field) => !allowedFields.includes(field),
        );

        if (invalidFields.length > 0) {
          console.warn("Invalid fields attempted:", invalidFields);
          return;
        }
        // check if status update
        const isStatusUpdate = "status" in updates;
        // update local immediately
        setItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item,
          );
          // if status changed re-sort
          if (isStatusUpdate) {
            // sort items by status (matching DB order)
            return updatedItems.sort((a, b) => {
              const orderA = statusOrder[a.status] ?? 999;
              const orderB = statusOrder[b.status] ?? 999;
              return orderA - orderB;
            });
          }
          return updatedItems;
        });

        // update db
        const url = `/api/${endpoint}/${itemId}`;
        const options = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error updating " + endpoint, e);
      }
    },
    [authFetch, endpoint, extraFieldsToUpdate, statusOrder],
  );

  // DELETE
  const remove = useCallback(
    async (itemId: number) => {
      try {
        setIsProcessing(true);
        // update locally
        setItems((prevItems) => {
          return prevItems.filter((item) => item.id !== itemId);
        });
        // update db
        const url = `/api/${endpoint}/${itemId}`;
        const options = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await authFetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error--status: ${response.status}`);
        }
      } catch (e) {
        console.error("Error deleting " + endpoint, e);
      } finally {
        setIsProcessing(false);
      }
    },
    [authFetch, endpoint],
  );

  //
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { items, add, update, remove, isProcessing };
}
