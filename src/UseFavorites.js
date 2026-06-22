import { useCallback, useMemo, useState } from "react";

const FAVORITES_KEY = "fd_favorites";

function loadFavoriteIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function persist(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

/**
 * Shared favorites state, used by Home.jsx (sidebar preview) and
 * SavedDrives.jsx (full list page) so both always agree on what's saved.
 *
 * Internally this keeps an ORDERED array of ids (oldest -> newest) instead
 * of just a Set, because a Set's iteration order isn't reliable enough to
 * answer "what did the person save most recently?" once items are removed
 * and re-added. The Set below is derived from that array purely for fast
 * `.has(id)` lookups inside <DriveCard />.
 */
export default function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteIds);

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleFav = useCallback((id) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id];
      persist(next);
      return next;
    });
  }, []);

  const lastAddedId = favoriteIds.length
    ? favoriteIds[favoriteIds.length - 1]
    : null;

  return { favoriteIds, favorites, toggleFav, lastAddedId };
}