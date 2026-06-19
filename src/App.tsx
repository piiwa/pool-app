/**
 * `<App>` - top-level component.
 *
 * Owns:
 * - The MUI theme (light / dark) via `useColorMode`.
 * - The active section (`realtime` | `stats` | `predictive`).
 * - The composition of the three feature pages inside `<AppLayout>`.
 */

import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import { AppLayout, type AppSection } from './components/layout/app-layout';
import { useColorMode } from './hooks/use-color-mode';
import { buildTheme } from './theme/build-theme';
import { RealtimePage } from './features/realtime/realtime-page';
import { StatsPage } from './features/stats/stats-page';
import { PredictivePage } from './features/predictive/predictive-page';

const renderSection = (section: AppSection) => {
  switch (section) {
    case 'realtime':
      return <RealtimePage />;
    case 'stats':
      return <StatsPage />;
    case 'predictive':
      return <PredictivePage />;
  }
};

const App = () => {
  const { mode, toggle } = useColorMode();
  const [section, setSection] = useState<AppSection>('realtime');

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        title="Fréquentation des piscines de Strasbourg"
        colorMode={mode}
        onColorModeToggle={toggle}
        section={section}
        onSectionChange={setSection}
      >
        {renderSection(section)}
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;
