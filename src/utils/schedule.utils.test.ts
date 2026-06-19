/**
 * Tests for `computeTimeUntilStatusChange`.
 *
 * This pure function powers the chip at the bottom of every realtime
 * card. Its branches are non-obvious (current slot vs upcoming slot vs
 * tomorrow's slot) so a small table-driven test prevents regressions.
 */

import { describe, expect, it } from 'vitest';
import type { DayScheduleSlot } from '../types/pool.types';
import { computeTimeUntilStatusChange } from './schedule.utils';

const slot = (
  openingHour: number,
  openingMinute: number,
  closingHour: number,
  closingMinute: number,
): DayScheduleSlot => ({
  openingHour,
  openingMinute,
  closingHour,
  closingMinute,
});

const at = (hour: number, minute: number): Date => {
  const d = new Date(2026, 5, 19, hour, minute, 0); // 2026-06-19
  return d;
};

describe('computeTimeUntilStatusChange', () => {
  it('returns an unknown state when no schedule is provided', () => {
    expect(computeTimeUntilStatusChange([], at(12, 0))).toEqual({
      isOpenNow: false,
      label: 'Horaires inconnus',
    });
  });

  it('returns the closing time when we are inside the current slot', () => {
    const schedule = [slot(8, 0, 19, 0)];
    expect(computeTimeUntilStatusChange(schedule, at(12, 30))).toEqual({
      isOpenNow: true,
      label: '19h00 fermeture',
    });
  });

  it('returns the next opening time when we are before the first slot', () => {
    const schedule = [slot(13, 45, 19, 0)];
    expect(computeTimeUntilStatusChange(schedule, at(10, 0))).toEqual({
      isOpenNow: false,
      label: '13h45 ouverture',
    });
  });

  it('returns tomorrow when we are after the last slot of the day', () => {
    const schedule = [slot(7, 0, 14, 0)];
    expect(computeTimeUntilStatusChange(schedule, at(20, 0))).toEqual({
      isOpenNow: false,
      label: '07h00 ouverture (demain)',
    });
  });

  it('handles split-shift schedules (lunch break)', () => {
    const schedule = [slot(12, 0, 14, 0), slot(16, 0, 18, 30)];

    // Inside the morning slot.
    expect(computeTimeUntilStatusChange(schedule, at(13, 0))).toEqual({
      isOpenNow: true,
      label: '14h00 fermeture',
    });
    // In the lunch break.
    expect(computeTimeUntilStatusChange(schedule, at(15, 0))).toEqual({
      isOpenNow: false,
      label: '16h00 ouverture',
    });
    // Inside the afternoon slot.
    expect(computeTimeUntilStatusChange(schedule, at(17, 0))).toEqual({
      isOpenNow: true,
      label: '18h30 fermeture',
    });
  });
});
