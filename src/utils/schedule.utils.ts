/**
 * Schedule and time-until calculations used by the realtime cards.
 */

import type { DayScheduleSlot } from '../types/pool.types';

/** Minutes elapsed since midnight, local time. */
const minutesSinceMidnight = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

const slotOpenMinutes = (slot: DayScheduleSlot): number =>
  slot.openingHour * 60 + slot.openingMinute;

const slotCloseMinutes = (slot: DayScheduleSlot): number =>
  slot.closingHour * 60 + slot.closingMinute;

const pad = (n: number): string => n.toString().padStart(2, '0');

/** Format a slot as `HH:MM - HH:MM`. */
export const formatScheduleSlot = (slot: DayScheduleSlot): string =>
  `${pad(slot.openingHour)}:${pad(slot.openingMinute)} - ` +
  `${pad(slot.closingHour)}:${pad(slot.closingMinute)}`;

/** Format a list of slots joined by ` / ` - used for split-shift schedules. */
export const formatScheduleSlots = (slots: DayScheduleSlot[]): string => {
  if (slots.length === 0) return 'Horaires non communiqués';
  return slots.map(formatScheduleSlot).join(' / ');
};

interface TimeUntilState {
  /** True when the pool is open NOW, given the current slot list. */
  isOpenNow: boolean;
  /**
   * Localised label describing the next status change. Examples:
   * - `19h30 fermeture`
   * - `07h00 ouverture`
   * - `07h00 ouverture (demain)`
   */
  label: string;
}

/**
 * Compute the label shown in the chip at the bottom of every card.
 *
 * Spec wording:
 * - Afficher le temps restant jusqu'à la fermeture ou jusqu'à l'ouverture.
 *
 * Implementation choice: we show the next status change as a human readable
 * label (HHhMM + verb) rather than a countdown - countdowns drift across
 * unmount/remount cycles and the spec target screenshot shows a clock label.
 */
export const computeTimeUntilStatusChange = (
  slots: DayScheduleSlot[],
  now: Date = new Date(),
): TimeUntilState => {
  if (slots.length === 0) {
    return { isOpenNow: false, label: 'Horaires inconnus' };
  }

  const nowMinutes = minutesSinceMidnight(now);

  // Normalise to ascending slot order so we can walk them once.
  const sortedSlots = [...slots].sort(
    (a, b) => slotOpenMinutes(a) - slotOpenMinutes(b),
  );

  // 1. Are we currently inside a slot?
  const currentSlot = sortedSlots.find(
    (slot) =>
      nowMinutes >= slotOpenMinutes(slot) && nowMinutes < slotCloseMinutes(slot),
  );

  if (currentSlot) {
    return {
      isOpenNow: true,
      label: `${pad(currentSlot.closingHour)}h${pad(currentSlot.closingMinute)} fermeture`,
    };
  }

  // 2. Otherwise pick the next slot that starts later today.
  const nextSlot = sortedSlots.find(
    (slot) => slotOpenMinutes(slot) > nowMinutes,
  );

  if (nextSlot) {
    return {
      isOpenNow: false,
      label: `${pad(nextSlot.openingHour)}h${pad(nextSlot.openingMinute)} ouverture`,
    };
  }

  // 3. We are after the last slot of the day: point to tomorrow's first slot.
  const firstSlot = sortedSlots[0];
  return {
    isOpenNow: false,
    label: `${pad(firstSlot.openingHour)}h${pad(firstSlot.openingMinute)} ouverture (demain)`,
  };
};
