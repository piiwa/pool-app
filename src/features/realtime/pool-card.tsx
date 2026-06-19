/**
 * `<PoolCard>` - single pool tile rendered by the realtime grid.
 *
 * Visual contract:
 * - Outlined Card with a 4px status-driven accent stripe on the left
 *   edge so affluence is readable at a glance.
 * - A purely decorative radial gradient in the top-right corner picks
 *   up the same accent at low alpha for a subtle premium feel.
 * - Hover lift uses `translateY(-3px)` plus an elevated shadow on a
 *   220ms cubic-bezier easing (no scale, no repaint storms).
 * - Closed pools desaturate the accent and dim the content so the
 *   open / closed split is unmistakable without screaming.
 *
 * The component is presentational: it never owns favourite state, the
 * parent passes the boolean down and the callback up.
 */

import ScheduleIcon from '@mui/icons-material/Schedule';
import UpdateIcon from '@mui/icons-material/Update';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import { FavoriteButton } from '../../components/common/favorite-button';
import { InfoRow } from '../../components/common/info-row';
import { OccupancyBadge } from '../../components/common/occupancy-badge';
import { StatusChip } from '../../components/common/status-chip';
import type { RealtimePool } from '../../types/pool.types';
import { formatUpdateDateTime } from '../../utils/format.utils';
import {
  computeTimeUntilStatusChange,
  formatScheduleSlots,
} from '../../utils/schedule.utils';
import { describeStatus } from '../../utils/status.utils';

export interface PoolCardProps {
  pool: RealtimePool;
  onToggleFavorite: (poolId: string) => void;
}

export const PoolCard = ({ pool, onToggleFavorite }: PoolCardProps) => {
  const theme = useTheme();
  const descriptor = describeStatus(pool);
  const accentColor = descriptor.resolveColor(theme);

  // The "time until status change" label depends on the current Date.
  // Pinning it inside `useMemo` lets us recompute on every re-render
  // (which is what we want, the data is reactive to the wall clock)
  // without surprising downstream renders.
  const timeState = useMemo(
    () => computeTimeUntilStatusChange(pool.schedule),
    [pool.schedule],
  );

  const showOccupation = pool.isOpen && pool.occupation !== undefined;

  return (
    <Card
      variant="outlined"
      sx={(t) => ({
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `4px solid ${accentColor}`,
        transition:
          'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: t.shadows[6],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at top right, ${alpha(
            accentColor,
            t.palette.mode === 'light' ? 0.12 : 0.22,
          )} 0%, ${alpha(accentColor, 0)} 55%)`,
          zIndex: 0,
        },
      })}
    >
      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
          p: { xs: 2, sm: 2.5 },
          opacity: pool.isOpen ? 1 : 0.92,
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.2,
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pool.name}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{
                mt: 0.25,
                color: accentColor,
                fontWeight: 600,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              {descriptor.label}
            </Typography>
          </Box>
          <FavoriteButton
            isFavorite={pool.isFavorite}
            itemName={pool.name}
            onToggle={() => onToggleFavorite(pool.id)}
          />
        </Stack>

        {showOccupation && (
          <OccupancyBadge
            occupation={pool.occupation ?? 0}
            descriptor={descriptor}
          />
        )}

        <InfoRow
          icon={<ScheduleIcon fontSize="small" color="action" />}
          label="Horaires :"
          value={formatScheduleSlots(pool.schedule)}
        />

        <Box>
          <StatusChip label={timeState.label} isOpenNow={timeState.isOpenNow} />
        </Box>

        <Divider sx={{ mt: 'auto' }} />

        <InfoRow
          icon={<UpdateIcon fontSize="small" color="action" />}
          label="Mise à jour :"
          value={formatUpdateDateTime(pool.updateDate)}
        />
      </CardContent>
    </Card>
  );
};
