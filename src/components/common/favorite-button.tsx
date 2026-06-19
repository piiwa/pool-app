/**
 * `<FavoriteButton>` - toggle heart icon used on every pool card.
 *
 * Kept generic on purpose: the parent owns the favourite state and
 * passes the boolean down. Visual signal:
 * - Filled red heart when active
 * - Outlined heart when inactive
 */

import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export interface FavoriteButtonProps {
  isFavorite: boolean;
  /** Used to compose the aria-label so screen readers know which pool. */
  itemName: string;
  onToggle: () => void;
}

export const FavoriteButton = ({
  isFavorite,
  itemName,
  onToggle,
}: FavoriteButtonProps) => {
  const label = isFavorite
    ? `Retirer ${itemName} des favoris`
    : `Ajouter ${itemName} aux favoris`;

  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        onClick={onToggle}
        aria-label={label}
        sx={{
          color: isFavorite ? 'error.main' : 'text.disabled',
        }}
      >
        {isFavorite ? (
          <FavoriteIcon fontSize="small" />
        ) : (
          <FavoriteBorderIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};
