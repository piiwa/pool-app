/**
 * `<PageHeader>` - top bar with the application title and the dark-mode
 * toggle shown on every page (matches the moon icon in the brief
 * screenshots).
 *
 * Kept layout-agnostic: it does not own its own positioning, the parent
 * `<AppLayout>` decides where the header sits.
 */

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { ColorMode } from '../../hooks/use-color-mode';

export interface PageHeaderProps {
  title: string;
  colorMode: ColorMode;
  onColorModeToggle: () => void;
}

export const PageHeader = ({
  title,
  colorMode,
  onColorModeToggle,
}: PageHeaderProps) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={2}
  >
    <Typography variant="h4" component="h1">
      {title}
    </Typography>

    <Tooltip
      title={
        colorMode === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'
      }
    >
      <IconButton onClick={onColorModeToggle} aria-label="basculer le thème">
        {colorMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  </Stack>
);
