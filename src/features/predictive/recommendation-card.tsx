/**
 * `<RecommendationCard>` - green callout that names the winning pool.
 *
 * Stays presentational; the parent computes the winner from the ranking
 * and passes the localised day/time for the subtitle.
 */

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Paper, Stack, Typography } from '@mui/material';

export interface RecommendationCardProps {
  winnerName: string;
  weekdayLabel: string;
  timeLabel: string;
}

export const RecommendationCard = ({
  winnerName,
  weekdayLabel,
  timeLabel,
}: RecommendationCardProps) => (
  <Paper
    elevation={0}
    sx={{
      px: 3,
      py: 2,
      bgcolor: 'success.main',
      color: 'success.contrastText',
      borderRadius: 2,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <EmojiEventsIcon fontSize="large" />
      <Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Recommandation : {winnerName}
        </Typography>
        <Typography variant="body2">
          Occupation moyenne la plus faible le {weekdayLabel} à {timeLabel}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);
