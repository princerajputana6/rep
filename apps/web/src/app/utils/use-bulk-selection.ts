import { useState, useCallback } from 'react';

export interface UseBulkSelectionReturn<T extends string | number> {
  selectedIds: Set<T>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  toggleItem: (id: T) => void;
  toggleAll: (ids: T[]) => void;
  clearSelection: () => void;
  isSelected: (id: T) => boolean;
  selectedCount: number;
}

export function useBulkSelection<T extends string | number>(
  allIds: T[] = []
): UseBulkSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const toggleItem = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (ids: T[]) => {
      setSelectedIds((prev) => {
        const allSelected = ids.every((id) => prev.has(id));
        if (allSelected) {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        }
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: T) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  return {
    selectedIds,
    isAllSelected,
    isSomeSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    selectedCount: selectedIds.size,
  };
}
