/**
 * Vitest configuration.
 *
 * Vitest reuses the Vite resolution / transform pipeline, so we just
 * declare the test environment + the matchers location. No global setup
 * is needed for these pure-function tests.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
