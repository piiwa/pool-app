/**
 * `<AppLayout>` - outer shell shared by every tab.
 *
 * Responsibilities:
 * - Provide horizontal page padding via `<Container>`.
 * - Mount the `<PageHeader>` once so the title and the dark-mode toggle
 *   stay anchored.
 * - Render the tab navigation that drives the section switch.
 *
 * Stays presentational: tab selection state is lifted to `<App>`.
 */

import { Box, Container, Stack, Tab, Tabs } from '@mui/material';
import type { ReactNode, SyntheticEvent } from 'react';
import { PageHeader } from './page-header';
import type { ColorMode } from '../../hooks/use-color-mode';

export type AppSection = 'realtime' | 'stats' | 'predictive';

export interface AppLayoutProps {
  title: string;
  colorMode: ColorMode;
  onColorModeToggle: () => void;
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  children: ReactNode;
}

const SECTION_LABELS: Record<AppSection, string> = {
  realtime: 'Temps réel',
  stats: 'Statistiques',
  predictive: 'Choix prédictif',
};

const SECTION_ORDER: AppSection[] = ['realtime', 'stats', 'predictive'];

export const AppLayout = ({
  title,
  colorMode,
  onColorModeToggle,
  section,
  onSectionChange,
  children,
}: AppLayoutProps) => {
  const handleChange = (_: SyntheticEvent, value: AppSection) => {
    onSectionChange(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <PageHeader
          title={title}
          colorMode={colorMode}
          onColorModeToggle={onColorModeToggle}
        />

        <Tabs
          value={section}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {SECTION_ORDER.map((id) => (
            <Tab
              key={id}
              value={id}
              label={SECTION_LABELS[id].toUpperCase()}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Tabs>

        <Box>{children}</Box>
      </Stack>
    </Container>
  );
};
