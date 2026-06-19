/**
 * `<PoolCardSkeleton>` - matches the dimensions of `<PoolCard>` so the
 * loading state of the realtime grid never causes a layout shift.
 *
 * Pure presentational, no props: every card on screen during loading
 * looks the same on purpose.
 */

import { Card, CardContent, Skeleton, Stack } from '@mui/material';

export const PoolCardSkeleton = () => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '4px solid',
      borderLeftColor: 'divider',
    }}
  >
    <CardContent
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
      <Skeleton variant="rectangular" width="50%" height={56} sx={{ borderRadius: 2 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rounded" width={140} height={28} />
      <Skeleton variant="text" width="70%" sx={{ mt: 'auto' }} />
    </CardContent>
  </Card>
);

/** Convenience: renders N skeletons inside the same grid the page uses. */
export const PoolCardSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <PoolCardSkeleton key={idx} />
    ))}
  </>
);
