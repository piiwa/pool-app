/**
 * `useColorMode` - light / dark theme toggle persisted in localStorage.
 *
 * The realtime tab screenshot shows a moon icon in the top-right corner.
 * We expose the toggle through a hook so the App owns the state and any
 * descendant component (Header) can request a change.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'pool-app:color-mode:v1';

const readInitialMode = (): ColorMode => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore - fall back to system preference
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
};

export interface UseColorModeValue {
  mode: ColorMode;
  toggle: () => void;
}

export const useColorMode = (): UseColorModeValue => {
  const [mode, setMode] = useState<ColorMode>(() => readInitialMode());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // best-effort persistence
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return useMemo(() => ({ mode, toggle }), [mode, toggle]);
};
