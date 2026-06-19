/**
 * `<InfoRow>` - small horizontal label + value row used inside pool cards.
 *
 * Stays presentational: no business logic, fully driven by props so that
 * any new card layout can re-use it (e.g. statistics summary, history
 * list, predictive table cells).
 */

import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface InfoRowProps {
  /** Optional leading icon - renders to the left of the label. */
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  /**
   * Typography variant for the value. Defaults to `body2`.
   * Use `body1` for the prominent "Il y a actuellement X personnes" line.
   */
  emphasis?: 'body1' | 'body2';
}

export const InfoRow = ({
  icon,
  label,
  value,
  emphasis = 'body2',
}: InfoRowProps) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {icon}
    <Typography
      variant={emphasis}
      color="text.secondary"
      component="span"
      sx={{ fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Typography variant={emphasis} component="span" color="text.primary">
      {value}
    </Typography>
  </Stack>
);
