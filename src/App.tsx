/**
 * `<App>` - top-level component.
 *
 * Owns the MUI theme, the active tab and the composition of the three
 * feature pages inside `<AppLayout>`. The animated water background is
 * mounted once here so it persists across tab switches.
 *
 * Stats and predictive pages are code-split via `React.lazy` so a user
 * who lands on the realtime tab does NOT download the Recharts bundle
 * nor the 2.9 MB of historical data.
 */

import { CssBaseline, ThemeProvider } from '@mui/material';
import { Suspense, lazy, useMemo, useState } from 'react';
import { AnimatedBackground } from './components/common/animated-background';
import { SectionFeedback } from './components/common/section-feedback';
import { AppLayout, type AppSection } from './components/layout/app-layout';
import { useColorMode } from './hooks/use-color-mode';
import { buildTheme } from './theme/build-theme';
import { RealtimePage } from './features/realtime/realtime-page';

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
      <AnimatedBackground />
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
