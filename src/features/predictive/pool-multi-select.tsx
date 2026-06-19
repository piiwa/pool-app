/**
 * `<PoolMultiSelect>` - multi-select picker used by the predictive tab.
 *
 * Renders the choices as MUI Chips inside the closed Select so the user
 * has immediate visual feedback (matches the brief screenshot).
 */

import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

export interface PoolMultiSelectProps {
  label: string;
  value: readonly string[];
  options: readonly string[];
  onChange: (next: string[]) => void;
}

export const PoolMultiSelect = ({
  label,
  value,
  options,
  onChange,
}: PoolMultiSelectProps) => {
  const handleChange = (event: SelectChangeEvent<readonly string[]>) => {
    const next = event.target.value;
    onChange(typeof next === 'string' ? next.split(',') : [...next]);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`pool-multi-${label}`}>{label}</InputLabel>
      <Select
        labelId={`pool-multi-${label}`}
        multiple
        value={value as string[]}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((name) => (
              <Chip key={name} label={name} size="small" />
            ))}
          </Box>
        )}
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
