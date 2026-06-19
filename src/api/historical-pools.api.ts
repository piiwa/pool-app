/**
 * Historical pool occupation loader.
 *
 * The source is a static phpMyAdmin JSON export bundled at build time.
 * Vite handles the `import` as JSON, so the parsing cost is paid at module
 * load and the rest of the app can treat it as in-memory data.
 *
 * We normalise once and freeze the result to make accidental mutation
 * impossible downstream.
 */

import rawDump from '../data/pooldatas.json';
import type {
  HistoricalOccupation,
  HistoricalOccupationRaw,
} from '../types/pool.types';

interface PhpMyAdminTableExport {
  type: 'table';
  name: string;
  database: string;
  data: HistoricalOccupationRaw[];
}

interface PhpMyAdminDump
  extends Array<{ type: string } | PhpMyAdminTableExport> {}

const extractTableRows = (dump: PhpMyAdminDump): HistoricalOccupationRaw[] => {
  const tableEntry = dump.find(
    (entry): entry is PhpMyAdminTableExport =>
      'type' in entry && entry.type === 'table',
  );
  return tableEntry?.data ?? [];
};

const normaliseRow = (row: HistoricalOccupationRaw): HistoricalOccupation => ({
  id: row.id,
  name: row.name,
  occupation: Number.parseInt(row.occupation, 10),
  timestamp: new Date(row.update_time.replace(' ', 'T')),
});

const HISTORICAL_OCCUPATIONS: readonly HistoricalOccupation[] = Object.freeze(
  extractTableRows(rawDump as PhpMyAdminDump).map(normaliseRow),
);

export const getHistoricalOccupations = (): readonly HistoricalOccupation[] =>
  HISTORICAL_OCCUPATIONS;

/** Unique pool names present in the historical dataset, alphabetically sorted. */
export const getHistoricalPoolNames = (): readonly string[] => {
  const names = new Set(HISTORICAL_OCCUPATIONS.map((row) => row.name));
  return [...names].sort((a, b) => a.localeCompare(b, 'fr'));
};
