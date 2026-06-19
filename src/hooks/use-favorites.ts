/**
 * `useFavorites` - persisted set of favourite pool ids.
 *
 * Storage: localStorage under a versioned key so we can evolve the shape
 * without colliding with prior installs. We keep a `Set<string>` in memory
 * for O(1) lookups inside the sort + render path.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pool-app:favorites:v1';

const readFromStorage = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const writeToStorage = (ids: Set<string>): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage can fail in private browsing - we just degrade silently
    // and keep the in-memory state.
  }
};

export interface UseFavoritesValue {
  favoriteIds: ReadonlySet<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export const useFavorites = (): UseFavoritesValue => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() =>
    readFromStorage(),
  );

  useEffect(() => {
    writeToStorage(favoriteIds);
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { favoriteIds, isFavorite, toggleFavorite };
};
