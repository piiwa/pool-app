/**
 * `<StatusChip>` - the small chip at the bottom of every pool card that
 * announces the next status change ("19h00 fermeture" or
 * "07h00 ouverture (demain)").
 *
 * Why a dedicated component:
 * - The spec calls for "le temps restant jusqu'à la fermeture ou
 *   jusqu'à l'ouverture", and both states need a visually distinct chip.
 * - Centralising the icon + color logic here prevents copy/paste drift
 *   if the design system ever adds a new state (e.g. "MAINTENANCE").
 */

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Chip } from '@mui/material';

export interface StatusChipProps {
  label: string;
  isOpenNow: boolean;
}

export const StatusChip = ({ label, isOpenNow }: StatusChipProps) => (
  <Chip
    icon={<AccessTimeIcon />}
    label={label}
    size="small"
    color={isOpenNow ? 'success' : 'primary'}
    variant="outlined"
    sx={{ fontWeight: 600 }}
  />
);
