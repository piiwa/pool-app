/**
 * Tests for `sortRealtimePools`.
 *
 * The sort is the load-bearing piece of Objectif 1, so it gets a small
 * table-driven test that covers the three priorities of the spec:
 * favourites first, then open pools by ascending occupation, then closed
 * pools, then a name tie-breaker.
 */

import { describe, expect, it } from 'vitest';
import type { RealtimePool } from '../types/pool.types';
import { sortRealtimePools } from './sort.utils';

const makePool = (override: Partial<RealtimePool>): RealtimePool => ({
  id: 'sigid',
  name: 'Pool',
  isOpen: true,
  status: 'GREEN',
  occupation: 10,
  schedule: [],
  updateDate: new Date('2026-06-19T15:00:00'),
  isFavorite: false,
  ...override,
});

describe('sortRealtimePools', () => {
  it('puts the favourite first even when it is the most crowded', () => {
    const favCrowded = makePool({
      id: 'fav',
      name: 'Wacken',
      occupation: 700,
      isFavorite: true,
    });
    const openQuiet = makePool({
      id: 'quiet',
      name: 'Ostwald',
      occupation: 5,
    });

    const result = sortRealtimePools([openQuiet, favCrowded]);

    expect(result.map((p) => p.id)).toEqual(['fav', 'quiet']);
  });

  it('puts open pools before closed pools when no favourites exist', () => {
    const closed = makePool({
      id: 'closed',
      name: 'Hardt',
      isOpen: false,
      occupation: undefined,
    });
    const open = makePool({ id: 'open', name: 'Robertsau', occupation: 40 });

    expect(sortRealtimePools([closed, open]).map((p) => p.id)).toEqual([
      'open',
      'closed',
    ]);
  });

  it('orders open pools by ascending occupation', () => {
    const a = makePool({ id: 'a', name: 'A', occupation: 100 });
    const b = makePool({ id: 'b', name: 'B', occupation: 30 });
    const c = makePool({ id: 'c', name: 'C', occupation: 60 });

    expect(sortRealtimePools([a, b, c]).map((p) => p.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('falls back to the name when occupation ties', () => {
    const z = makePool({ id: 'z', name: 'Zebra', occupation: 50 });
    const a = makePool({ id: 'a', name: 'Antelope', occupation: 50 });

    expect(sortRealtimePools([z, a]).map((p) => p.id)).toEqual(['a', 'z']);
  });

  it('does not mutate the input array', () => {
    const input = [
      makePool({ id: 'a', occupation: 40 }),
      makePool({ id: 'b', occupation: 10 }),
    ];
    const before = input.map((p) => p.id);

    sortRealtimePools(input);

    expect(input.map((p) => p.id)).toEqual(before);
  });
});
