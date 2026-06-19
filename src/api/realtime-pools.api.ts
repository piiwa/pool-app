/**
 * Real-time pool API client (opendatasoft v1).
 *
 * Single-purpose module: fetch + normalise. Component layer should never
 * touch the raw API shape - types are normalised here.
 *
 * The favourite flag is NOT folded in here on purpose: keeping it out
 * lets the realtime page re-sort instantly when the user toggles a
 * favourite, without re-fetching.
 */

import type {
  DayScheduleSlot,
  OpendatasoftResponse,
  RealtimePool,
  RealtimePoolFields,
} from '../types/pool.types';

const REALTIME_POOLS_ENDPOINT =
  'https://data.opendatasoft.com/api/records/1.0/search/' +
  '?dataset=frequentation-en-temps-reel-des-piscines%40eurometrostrasbourg' +
  '&q=&facet=name&facet=realtimestatus&facet=isopen' +
  '&rows=50';

/**
 * Parse the `dayschedule` JSON-serialised string into a typed array.
 * Returns an empty array when the field is missing or malformed: a closed
 * pool sometimes has no schedule and that should not crash the UI.
 */
const parseSchedule = (raw: string | undefined): DayScheduleSlot[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Parse the API's `YYYY-MM-DD HH:mm:ss` format into a Date. */
const parseUpdateDate = (raw: string): Date => {
  // Treat the value as local time. The API documents UTC timestamps but in
  // practice the realtime endpoint exposes Paris-local values. We keep
  // a single Date instance and let the UI format with the user's locale.
  return new Date(raw.replace(' ', 'T'));
};

/**
 * Fetch the real-time pool list and normalise the records.
 *
 * @param signal optional `AbortSignal` for cancellation (we always wire one
 *               from React effects to avoid memory leaks).
 */
export const fetchRealtimePools = async (
  signal?: AbortSignal,
): Promise<RealtimePool[]> => {
  const response = await fetch(REALTIME_POOLS_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pools: ${response.status} ${response.statusText}`,
    );
  }

  const data =
    (await response.json()) as OpendatasoftResponse<RealtimePoolFields>;

  return data.records.map((record) => ({
    id: record.fields.sigid,
    name: record.fields.name,
    isOpen: record.fields.isopen === 1,
    status: record.fields.realtimestatus,
    occupation: record.fields.occupation,
    schedule: parseSchedule(record.fields.dayschedule),
    updateDate: parseUpdateDate(record.fields.updatedate),
    isFavorite: false,
  }));
};
