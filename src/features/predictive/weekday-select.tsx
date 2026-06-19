/**
 * `<WeekdaySelect>` - picks the day-of-week for the predictive analysis.
 *
 * Decoupled from the time picker so each control has a single
 * responsibility. Re-usable should the app ever need a weekday filter
 * elsewhere.
 */

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import type { Weekday } from '../../types/pool.types';

const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export interface WeekdaySelectProps {
  label: string;
  value: Weekday;
  onChange: (next: Weekday) => void;
}

export const WeekdaySelect = ({
  label,
  value,
  onChange,
}: WeekdaySelectProps) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value) as Weekday);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id={`weekday-select-${label}`}>{label}</InputLabel>
      <Select
        labelId={`weekday-select-${label}`}
        value={value}
        label={label}
        onChange={handleChange}
      >
        {WEEKDAY_ORDER.map((day) => (
          <MenuItem key={day} value={day}>
            {WEEKDAY_LABELS[day]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
