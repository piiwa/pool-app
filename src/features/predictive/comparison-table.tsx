/**
 * `<ComparisonTable>` - sortable summary table for the predictive analysis.
 *
 * Highlights the best (lowest average) row with a trophy icon and a
 * `success.light` background tint, matching the brief screenshot.
 */

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { PoolOccupationStats } from '../../types/pool.types';

export interface ComparisonTableProps {
  /** Already ranked: the first row is the winner. */
  ranking: readonly PoolOccupationStats[];
}

export const ComparisonTable = ({ ranking }: ComparisonTableProps) => {
  const winner = ranking[0];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Piscine</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Moy. occupation
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Min
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Max
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Échantillons
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ranking.map((row) => {
            const isWinner = winner !== undefined && row.name === winner.name;
            return (
              <TableRow
                key={row.name}
                sx={{
                  bgcolor: isWinner ? 'success.light' : 'transparent',
                  '& td': isWinner ? { fontWeight: 600 } : undefined,
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isWinner && (
                      <EmojiEventsIcon
                        fontSize="small"
                        sx={{ color: 'success.dark' }}
                      />
                    )}
                    {row.name}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {row.samples > 0 ? row.averageOccupation : '-'}
                </TableCell>
                <TableCell align="right">
                  {row.samples > 0 ? row.minOccupation : '-'}
                </TableCell>
                <TableCell align="right">
                  {row.samples > 0 ? row.maxOccupation : '-'}
                </TableCell>
                <TableCell align="right">{row.samples}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
