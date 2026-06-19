/**
 * `useRealtimePools` - data hook for the realtime tab.
 *
 * Responsibilities:
 * - Fetch the opendatasoft endpoint, cancel on unmount.
 * - Expose a manual refresh function the page binds to a button.
 *
 * Important: the favourite flag is NOT injected here - toggling a
 * favourite must NOT trigger a re-fetch. The page composes the raw
 * pool list with the live favourite set in a `useMemo` so the re-sort
 * is instantaneous.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchRealtimePools } from '../../api/realtime-pools.api';
import type { RealtimePool } from '../../types/pool.types';

interface UseRealtimePoolsValue {
  pools: RealtimePool[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

export const useRealtimePools = (): UseRealtimePoolsValue => {
  const [pools, setPools] = useState<RealtimePool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    const isFirstLoad = pools.length === 0;
    if (isFirstLoad) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    fetchRealtimePools(controller.signal)
      .then((data) => {
        setPools(data);
        setIsLoading(false);
        setIsRefreshing(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Erreur réseau inattendue.';
        setError(message);
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => controller.abort();
    // We only want to re-run on explicit refresh requests, not on
    // unrelated re-renders. The pools.length read above is intentional -
    // the linter rule that complains is the one to ignore here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { pools, isLoading, isRefreshing, error, refresh };
};
