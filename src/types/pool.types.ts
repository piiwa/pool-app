/**
 * Domain types for the Strasbourg pool app.
 *
 * Two distinct data shapes here:
 * - Real-time data from opendatasoft API (Objectif 1)
 * - Historical occupancy from the local pooldatas.json export (Objectifs 2 + 3)
 *
 * We keep them split because they have different field names, different
 * types (occupation is `number` in the API but `string` in the historical
 * JSON), and different semantics. A normalised `Pool` model would force
 * lossy conversions.
 */

/** Schedule slot inside the `dayschedule` field of the realtime API. */
export interface DayScheduleSlot {
  openingHour: number;
  openingMinute: number;
  closingHour: number;
  closingMinute: number;
}

/** Real-time status returned by the opendatasoft API. */
export type RealtimeStatus = 'GREEN' | 'ORANGE' | 'RED' | 'CLOSED';

/** Real-time pool record from the opendatasoft API. */
export interface RealtimePoolFields {
  name: string;
  sigid: string;
  isopen: 0 | 1;
  realtimestatus: RealtimeStatus;
  /** Present only when the pool is open. */
  occupation?: number;
  /** JSON-serialised string of `DayScheduleSlot[]`. Always parse before use. */
  dayschedule?: string;
  /** Format: `YYYY-MM-DD HH:mm:ss`. */
  updatedate: string;
  types: string;
}

/** Wrapper returned by the opendatasoft v1 API. */
export interface OpendatasoftRecord<T> {
  datasetid: string;
  recordid: string;
  fields: T;
  record_timestamp: string;
}

export interface OpendatasoftResponse<T> {
  nhits: number;
  records: OpendatasoftRecord<T>[];
}

/** Normalised real-time pool ready for UI consumption. */
export interface RealtimePool {
  id: string;
  name: string;
  isOpen: boolean;
  status: RealtimeStatus;
  /** Undefined when the pool is closed. */
  occupation?: number;
  schedule: DayScheduleSlot[];
  updateDate: Date;
  isFavorite: boolean;
}

/**
 * Historical occupation record from `pooldatas.json`.
 * Note: `occupation` is stored as a string in the source export, we
 * parse it on ingestion.
 */
export interface HistoricalOccupationRaw {
  id: string;
  name: string;
  occupation: string;
  update_time: string;
  created_at: string;
}

export interface HistoricalOccupation {
  id: string;
  name: string;
  occupation: number;
  /** Native Date for sorting / date-fns operations. */
  timestamp: Date;
}

/** Aggregated stats used by Objectif 3 (predictive recommendation). */
export interface PoolOccupationStats {
  name: string;
  averageOccupation: number;
  minOccupation: number;
  maxOccupation: number;
  samples: number;
}

/** Weekday index used everywhere we group by day-of-week. 0 = Sunday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
