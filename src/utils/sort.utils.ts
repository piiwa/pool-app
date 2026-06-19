/**
 * Sort the realtime pool list according to the spec:
 *
 * 1. Favourites first (favourite > non-favourite, irrespective of open/closed).
 *    > "Ce critère est prioritaire par rapport au critère de fréquentation
 *    >  minimum."
 * 2. Open pools before closed pools.
 * 3. Among open pools, the least crowded first (ascending occupation).
 * 4. Stable tie-breaker on name so the order does not flicker between
 *    refreshes.
 *
 * Implementation note: we never mutate the input list - the caller may
 * keep a reference to the raw API response.
 */

import type { RealtimePool } from '../types/pool.types';

const compareByFavorite = (a: RealtimePool, b: RealtimePool): number =>
  Number(b.isFavorite) - Number(a.isFavorite);

const compareByOpen = (a: RealtimePool, b: RealtimePool): number =>
  Number(b.isOpen) - Number(a.isOpen);

const compareByOccupation = (a: RealtimePool, b: RealtimePool): number => {
  // Closed pools have no occupation → compare only when both are open.
  if (!a.isOpen || !b.isOpen) return 0;
  const aOcc = a.occupation ?? Number.POSITIVE_INFINITY;
  const bOcc = b.occupation ?? Number.POSITIVE_INFINITY;
  return aOcc - bOcc;
};

const compareByName = (a: RealtimePool, b: RealtimePool): number =>
  a.name.localeCompare(b.name, 'fr');

export const sortRealtimePools = (
  pools: readonly RealtimePool[],
): RealtimePool[] => {
  return [...pools].sort((a, b) => {
    const byFav = compareByFavorite(a, b);
    if (byFav !== 0) return byFav;

    const byOpen = compareByOpen(a, b);
    if (byOpen !== 0) return byOpen;

    const byOcc = compareByOccupation(a, b);
    if (byOcc !== 0) return byOcc;

    return compareByName(a, b);
  });
};
