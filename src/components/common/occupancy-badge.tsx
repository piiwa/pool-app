/**
 * `<OccupancyBadge>` - premium pill that surfaces the live occupation
 * count on each pool card.
 *
 * Visual contract:
 * - Pill shape (radius 999) with a soft tinted surface driven by the
 *   status descriptor, lighter in light mode, deeper in dark mode.
 * - Left affordance: a round icon disc tinted with the descriptor
 *   color at low alpha so the number stays the hero of the badge.
 * - Right side: the count in a bold display weight and the word
 *   "personnes" as a small uppercase eyebrow underneath.
 * - Never wraps on two lines, scales gracefully from 5 to 700+.
 */

import GroupsIcon from '@mui/icons-material/Groups';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { StatusDescriptor } from '../../utils/status.utils';

export interface OccupancyBadgeProps {
  occupation: number;
  descriptor: StatusDescriptor;
}

export const OccupancyBadge = ({
  occupation,
  descriptor,
}: OccupancyBadgeProps) => (
  <Box
    sx={(theme) => {
      const accent = descriptor.resolveColor(theme);
      const surfaceAlpha = theme.palette.mode === 'light' ? 0.06 : 0.18;

      return {
        display: 'inline-flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 1.25,
        px: 2,
        py: 1.25,
        borderRadius: 999,
        bgcolor: alpha(accent, surfaceAlpha),
        border: `1px solid ${alpha(accent, 0.4)}`,
        whiteSpace: 'nowrap',
        transition: 'background-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      };
    }}
  >
    <Box
      sx={(theme) => {
        const accent = descriptor.resolveColor(theme);

        return {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: alpha(accent, 0.16),
          flexShrink: 0,
        };
      }}
    >
      <GroupsIcon
        sx={(theme) => ({
          color: descriptor.resolveColor(theme),
          fontSize: 20,
        })}
      />
    </Box>

    <Stack
      direction="column"
      sx={{ lineHeight: 1, minWidth: 0 }}
      spacing={0.25}
    >
      <Typography
        component="span"
        sx={(theme) => ({
          color: descriptor.resolveColor(theme),
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        {occupation}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1,
        }}
      >
        personnes
      </Typography>
    </Stack>
  </Box>
);
