/**
 * `useHistoricalData` - memoised access to the historical dataset.
 *
 * The dataset is bundled at build time, so we use `useMemo` to expose
 * derived values (unique pool names, per-pool indexes) without
 * recomputing on every render of a chart panel.
 */

import { useMemo } from 'react';
import {
  getHistoricalOccupations,
  getHistoricalPoolNames,
} from '../../api/historical-pools.api';
import type { HistoricalOccupation } from '../../types/pool.types';

interface UseHistoricalDataValue {
  /** Every record, frozen. */
  occupations: readonly HistoricalOccupation[];
  /** Unique pool names available in the dataset, alphabetically sorted. */
  poolNames: readonly string[];
}

export const useHistoricalData = (): UseHistoricalDataValue =>
  useMemo(
    () => ({
      occupations: getHistoricalOccupations(),
      poolNames: getHistoricalPoolNames(),
    }),
    [],
  );
