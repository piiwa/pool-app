/**
 * `<RealtimePage>` - Objectif 1.
 *
 * Renders the responsive 2-column grid of pool cards and the refresh
 * button. The favourite flag is merged into the pool list inside a
 * `useMemo` so toggling a heart instantly re-runs the sort without
 * re-fetching the API.
 */

import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Stack } from '@mui/material';
import { useMemo } from 'react';
import { SectionFeedback } from '../../components/common/section-feedback';
import { useFavorites } from '../../hooks/use-favorites';
import { sortRealtimePools } from '../../utils/sort.utils';
import { PoolCard } from './pool-card';
import { useRealtimePools } from './use-realtime-pools';

export const RealtimePage = () => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { pools, isLoading, isRefreshing, error, refresh } = useRealtimePools();

  // Merge favourite state into the pool entities then sort. Memoised on
  // (pools, favouriteIds) so a heart click triggers an instant re-sort
  // - no network roundtrip, no loading state.
  const sortedPools = useMemo(() => {
    const withFavorites = pools.map((pool) => ({
      ...pool,
      isFavorite: favoriteIds.has(pool.id),
    }));
    return sortRealtimePools(withFavorites);
  }, [pools, favoriteIds]);

  if (isLoading) return <SectionFeedback state="loading" />;
  if (error) return <SectionFeedback state="error" errorMessage={error} />;
  if (sortedPools.length === 0) {
    return (
      <SectionFeedback
        state="empty"
        emptyMessage="Aucune piscine disponible pour le moment."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2, md: 2.5 },
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {sortedPools.map((pool) => (
          <PoolCard
            key={pool.id}
            pool={pool}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={isRefreshing}
          sx={{ px: 4, fontWeight: 600 }}
        >
          {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
        </Button>
      </Box>
    </Stack>
  );
};
