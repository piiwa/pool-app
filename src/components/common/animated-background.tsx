/**
 * `<AnimatedBackground>` - subtle pure-CSS parallax water layers behind
 * the whole app.
 *
 * No external library. Three SVG wave layers stacked at different
 * opacities and translated horizontally over different durations create
 * a calm parallax effect. The waves are inline as data-URIs so the
 * bundle does not balloon with extra image requests.
 *
 * Performance:
 * - Animation runs on `transform: translateX` only (GPU accelerated).
 * - `pointer-events: none` keeps the layer out of the hit tree.
 * - `prefers-reduced-motion` users get a static gradient, no motion.
 */

import { Box, GlobalStyles, useTheme } from '@mui/material';

const WAVE_PATH =
  'M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,160C672,139,768,117,864,128C960,139,1056,181,1152,176C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';

const buildSvgDataUri = (color: string, opacity: number): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'><path fill='${color}' fill-opacity='${opacity}' d='${WAVE_PATH}'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

export const AnimatedBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const deep = isDark ? '#7AB0E0' : '#0E2A4E';
  const accent = isDark ? '#E8D5B5' : '#B58B3F';
  const baseGradient = isDark
    ? 'linear-gradient(180deg, #0A1428 0%, #11203A 60%, #142A4E 100%)'
    : 'linear-gradient(180deg, #FBF5E9 0%, #F4ECDF 60%, #EFE3CF 100%)';

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes waveDriftSlow': {
            from: { transform: 'translate3d(0, 0, 0)' },
            to: { transform: 'translate3d(-50%, 0, 0)' },
          },
          '@keyframes waveDriftFast': {
            from: { transform: 'translate3d(0, 0, 0)' },
            to: { transform: 'translate3d(-50%, 0, 0)' },
          },
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: baseGradient,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Three parallax wave layers stacked toward the viewer. */}
        {[
          {
            color: deep,
            opacity: isDark ? 0.18 : 0.08,
            duration: 38,
            bottom: '-30%',
            scale: 1.4,
          },
          {
            color: accent,
            opacity: isDark ? 0.1 : 0.07,
            duration: 26,
            bottom: '-18%',
            scale: 1.2,
          },
          {
            color: deep,
            opacity: isDark ? 0.22 : 0.1,
            duration: 18,
            bottom: '-8%',
            scale: 1,
          },
        ].map((layer, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              left: 0,
              bottom: layer.bottom,
              width: '200%',
              height: { xs: 220, md: 320 },
              backgroundImage: buildSvgDataUri(layer.color, layer.opacity),
              backgroundRepeat: 'repeat-x',
              backgroundSize: '50% 100%',
              transform: `scale(${layer.scale})`,
              transformOrigin: 'bottom left',
              animation: `${idx % 2 === 0 ? 'waveDriftSlow' : 'waveDriftFast'} ${layer.duration}s linear infinite`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />
        ))}
      </Box>
    </>
  );
};
