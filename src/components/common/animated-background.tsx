/**
 * `<AnimatedBackground>` - subtle pure-CSS parallax water layers behind
 * the whole app.
 *
 * No external library. Three SVG wave layers stacked at different
 * opacities and translated horizontally over different durations create
 * a calm parallax effect. The waves are inline as data-URIs so the
 * bundle does not balloon with extra image requests.
 *
 * The path is designed so y(x=0) === y(x=width) AND the slope on each
 * side is symmetric, which means the wave tiles seamlessly when the
 * layer is set to repeat-x. No visible seam, no broken curve.
 *
 * Performance: animation runs on `transform: translate3d` only (GPU
 * accelerated). `pointer-events: none` keeps the layer out of the hit
 * tree. `prefers-reduced-motion` users get a static gradient.
 */

import { Box, GlobalStyles, useTheme } from '@mui/material';

/**
 * Single-period wave centered on y=160, amplitude ~50. Built from two
 * cubic beziers that meet at (720, 160) with symmetric control points,
 * so the slope is continuous across the seam when tiled.
 */
const WAVE_PATH =
  'M0,160 C240,110 480,110 720,160 C960,210 1200,210 1440,160 L1440,320 L0,320 Z';

const buildSvgDataUri = (color: string, opacity: number): string => {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'>" +
    `<path fill='${color}' fill-opacity='${opacity}' d='${WAVE_PATH}'/>` +
    '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

interface WaveLayer {
  color: string;
  opacity: number;
  durationSeconds: number;
  bottomOffset: string;
  height: number;
  scale: number;
}

export const AnimatedBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const deep = isDark ? '#7AB0E0' : '#0E2A4E';
  const accent = isDark ? '#E8D5B5' : '#B58B3F';
  const baseGradient = isDark
    ? 'linear-gradient(180deg, #0A1428 0%, #11203A 60%, #142A4E 100%)'
    : 'linear-gradient(180deg, #FBF5E9 0%, #F4ECDF 60%, #EFE3CF 100%)';

  const layers: WaveLayer[] = [
    {
      color: deep,
      opacity: isDark ? 0.14 : 0.06,
      durationSeconds: 42,
      bottomOffset: '-20%',
      height: 320,
      scale: 1.35,
    },
    {
      color: accent,
      opacity: isDark ? 0.09 : 0.05,
      durationSeconds: 30,
      bottomOffset: '-12%',
      height: 280,
      scale: 1.18,
    },
    {
      color: deep,
      opacity: isDark ? 0.18 : 0.08,
      durationSeconds: 20,
      bottomOffset: '-4%',
      height: 240,
      scale: 1,
    },
  ];

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes waveDrift': {
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
        {layers.map((layer, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              left: 0,
              bottom: layer.bottomOffset,
              width: '200%',
              height: { xs: layer.height * 0.7, md: layer.height },
              backgroundImage: buildSvgDataUri(layer.color, layer.opacity),
              backgroundRepeat: 'repeat-x',
              backgroundSize: '50% 100%',
              transformOrigin: 'bottom left',
              animation: `waveDrift ${layer.durationSeconds}s linear infinite`,
              willChange: 'transform',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                transform: `scale(${layer.scale})`,
              },
            }}
          />
        ))}
      </Box>
    </>
  );
};
