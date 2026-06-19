/**
 * `<App>` - top-level component.
 *
 * Owns:
 * - The MUI theme (light / dark) via `useColorMode`.
 * - The active section (`realtime` | `stats` | `predictive`).
 * - The composition of the three feature pages inside `<AppLayout>`.
 *
 * Performance: stats and predictive pages are code-split with React.lazy
 * so a user who lands on the realtime tab does NOT download the Recharts
 * bundle nor the 2.9 MB of historical data. Bundle savings are listed in
 * AI_PROCESS.md section 7 (eco-responsible choices).
 */

import { CssBaseline, ThemeProvider } from '@mui/material';
import { Suspense, lazy, useMemo, useState } from 'react';
import { AppLayout, type AppSection } from './components/layout/app-layout';
import { SectionFeedback } from './components/common/section-feedback';
import { useColorMode } from './hooks/use-color-mode';
import { buildTheme } from './theme/build-theme';
import { RealtimePage } from './features/realtime/realtime-page';

// Heavy pages are split out: they pull Recharts (~120 KB gzip) and the
// historical dataset (~2.9 MB raw / ~190 KB gzip).
const StatsPage = lazy(() =>
  import('./features/stats/stats-page').then((m) => ({ default: m.StatsPage })),
);
const PredictivePage = lazy(() =>
  import('./features/predictive/predictive-page').then((m) => ({
    default: m.PredictivePage,
  })),
);

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
        <Suspense fallback={<SectionFeedback state="loading" />}>
          {renderSection(section)}
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;
