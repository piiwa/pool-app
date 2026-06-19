/**
 * Statistical aggregations used by Objectifs 2 (curves) and 3
 * (predictive recommendation).
 */

import type {
  HistoricalOccupation,
  PoolOccupationStats,
  Weekday,
} from '../types/pool.types';
import { formatDateKey } from './format.utils';

export interface HourlyOccupationPoint {
  /** Hour label `0..23` for the X axis ticks. */
  hour: number;
  /** Average occupation observed at that hour (may be `null` when no data). */
  occupation: number | null;
}

/**
 * Group records by hour-of-day, averaging occupation across all matching
 * rows. Returns a 24-slot array so the chart always has a complete X axis.
 */
const aggregateByHour = (
  records: readonly HistoricalOccupation[],
): HourlyOccupationPoint[] => {
  const buckets: { sum: number; count: number }[] = Array.from(
    { length: 24 },
    () => ({ sum: 0, count: 0 }),
  );

  for (const record of records) {
    const hour = record.timestamp.getHours();
    const bucket = buckets[hour];
    if (!bucket) continue;
    bucket.sum += record.occupation;
    bucket.count += 1;
  }

  return buckets.map((bucket, hour) => ({
    hour,
    occupation:
      bucket.count === 0 ? null : Math.round(bucket.sum / bucket.count),
  }));
};

/**
 * Return the daily curve for a single pool on a given calendar date.
 * The dataset stores ~10-minute samples, the chart smooths them to one
 * point per hour for readability.
 */
export const computeDailyCurve = (
  records: readonly HistoricalOccupation[],
  poolName: string,
  date: Date,
): HourlyOccupationPoint[] => {
  const dayKey = formatDateKey(date);
  const subset = records.filter(
    (row) => row.name === poolName && formatDateKey(row.timestamp) === dayKey,
  );
  return aggregateByHour(subset);
};

const isSameClockSlot = (
  recordHour: number,
  recordMinute: number,
  targetHour: number,
  targetMinute: number,
  toleranceMinutes: number,
): boolean => {
  const recordTotal = recordHour * 60 + recordMinute;
  const targetTotal = targetHour * 60 + targetMinute;
  return Math.abs(recordTotal - targetTotal) <= toleranceMinutes;
};

/**
 * Aggregate occupation statistics for a single pool at a target weekday
 * and time-of-day. Uses a +/- tolerance window so that a precise minute
 * (e.g. 12:15) still picks up the surrounding samples.
 */
export const computePoolStatsForSlot = (
  records: readonly HistoricalOccupation[],
  poolName: string,
  weekday: Weekday,
  hour: number,
  minute: number,
  toleranceMinutes = 30,
): PoolOccupationStats => {
  const matching = records.filter((row) => {
    if (row.name !== poolName) return false;
    if (row.timestamp.getDay() !== weekday) return false;
    return isSameClockSlot(
      row.timestamp.getHours(),
      row.timestamp.getMinutes(),
      hour,
      minute,
      toleranceMinutes,
    );
  });

  if (matching.length === 0) {
    return {
      name: poolName,
      averageOccupation: 0,
      minOccupation: 0,
      maxOccupation: 0,
      samples: 0,
    };
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;

  for (const row of matching) {
    sum += row.occupation;
    if (row.occupation < min) min = row.occupation;
    if (row.occupation > max) max = row.occupation;
  }

  return {
    name: poolName,
    averageOccupation: Math.round((sum / matching.length) * 10) / 10,
    minOccupation: min,
    maxOccupation: max,
    samples: matching.length,
  };
};

/** Convenience: stats for many pools at the same slot, sorted ascending. */
export const computeRanking = (
  records: readonly HistoricalOccupation[],
  poolNames: readonly string[],
  weekday: Weekday,
  hour: number,
  minute: number,
): PoolOccupationStats[] => {
  return poolNames
    .map((name) =>
      computePoolStatsForSlot(records, name, weekday, hour, minute),
    )
    .sort((a, b) => a.averageOccupation - b.averageOccupation);
};
