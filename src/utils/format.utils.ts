/**
 * UI formatters - string helpers shared across the realtime cards and
 * the statistic charts. Centralised here so the locale can be swapped
 * in one place if the app ever ships in multiple languages.
 */

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Format a Date as `DD/MM/YYYY HH:MM` - used in the "Mise à jour" label. */
export const formatUpdateDateTime = (date: Date): string =>
  `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;

/** Format a Date as `lundi 28 mai 2026` - used in the stat chart title. */
export const formatLongFrenchDate = (date: Date): string =>
  longDateFormatter.format(date);

/** Capitalise the first letter - useful for `Vendredi` style labels. */
export const capitalize = (input: string): string =>
  input.length === 0 ? input : input[0].toUpperCase() + input.slice(1);

/** Format a Date as the `YYYY-MM-DD` key we use for date-based grouping. */
export const formatDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
