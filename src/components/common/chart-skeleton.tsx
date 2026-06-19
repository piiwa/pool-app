/**
 * `<ChartSkeleton>` - placeholder for the Recharts loading state used by
 * the stats and predictive sections.
 */

import { Box, Skeleton, Stack } from '@mui/material';

export interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 360 }: ChartSkeletonProps) => (
  <Box sx={{ width: '100%' }}>
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Skeleton variant="text" width={120} height={28} />
      <Skeleton variant="text" width={80} height={28} />
    </Stack>
    <Skeleton variant="rounded" width="100%" height={height} />
  </Box>
);
