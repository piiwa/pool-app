/**
 * Status-driven design tokens - keeps the per-status colour /
 * accent / label mapping in a single place so cards, chips and
 * tooltips never drift.
 */

import type { Theme } from '@mui/material/styles';
import type { RealtimePool, RealtimeStatus } from '../types/pool.types';

export interface StatusDescriptor {
  /** Short label rendered next to the occupation count. */
  label: string;
  /** Theme-palette colour used for the card accent and the badge. */
  colorKey: 'success' | 'warning' | 'error' | 'grey';
  /** Resolved hex from the current theme - for borders, dots, accents. */
  resolveColor: (theme: Theme) => string;
}

const STATUS_DESCRIPTORS: Record<RealtimeStatus, StatusDescriptor> = {
  GREEN: {
    label: 'Faible affluence',
    colorKey: 'success',
    resolveColor: (theme) => theme.palette.success.main,
  },
  ORANGE: {
    label: 'Affluence modérée',
    colorKey: 'warning',
    resolveColor: (theme) => theme.palette.warning.main,
  },
  RED: {
    label: 'Forte affluence',
    colorKey: 'error',
    resolveColor: (theme) => theme.palette.error.main,
  },
  CLOSED: {
    label: 'Fermée',
    colorKey: 'grey',
    resolveColor: (theme) =>
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  },
};

export const describeStatus = (pool: RealtimePool): StatusDescriptor =>
  STATUS_DESCRIPTORS[pool.status];
