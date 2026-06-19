/**
 * `<SectionFeedback>` - wrapper around the common loading / error / empty
 * states. Lets every section use the same visual language without
 * duplicating MUI boilerplate.
 */

import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface SectionFeedbackProps {
  state: 'loading' | 'error' | 'empty' | 'ready';
  errorMessage?: string;
  emptyMessage?: string;
  children?: ReactNode;
}

export const SectionFeedback = ({
  state,
  errorMessage,
  emptyMessage,
  children,
}: SectionFeedbackProps) => {
  if (state === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (state === 'error') {
    return (
      <Alert severity="error">
        {errorMessage ?? 'Une erreur est survenue lors du chargement.'}
      </Alert>
    );
  }

  if (state === 'empty') {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
        <Typography color="text.secondary">
          {emptyMessage ?? 'Aucune donnée disponible pour cette sélection.'}
        </Typography>
      </Stack>
    );
  }

  return <>{children}</>;
};
