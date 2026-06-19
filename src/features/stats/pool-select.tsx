/**
 * `<PoolSelect>` - single-select picker shared by the statistics tab.
 *
 * Generic and reusable: it takes the list of options from props so that
 * the predictive tab can re-use the same control with its own dataset
 * (multi-select variant is in `<PoolMultiSelect>`).
 */

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

export interface PoolSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
}

export const PoolSelect = ({
  label,
  value,
  options,
  onChange,
}: PoolSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 240 }}>
      <InputLabel id={`pool-select-${label}`}>{label}</InputLabel>
      <Select
        labelId={`pool-select-${label}`}
        value={value}
        label={label}
        onChange={handleChange}
      >
        {options.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
