import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type GradientPalette = 'brand' | 'ocean' | 'sunset' | 'forest';

interface ThemeContextValue {
  mode: ThemeMode;
  gradient: GradientPalette;
  setMode: (m: ThemeMode) => void;
  setGradient: (g: GradientPalette) => void;
  gradientClasses: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const GRADIENT_MAP: Record<GradientPalette, string> = {
  brand: 'from-violet-600 via-fuchsia-600 to-rose-600',
  ocean: 'from-sky-500 via-indigo-500 to-purple-600',
  sunset: 'from-rose-500 via-fuchsia-500 to-indigo-500',
  forest: 'from-emerald-500 via-teal-500 to-cyan-500',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [gradient, setGradient] = useState<GradientPalette>('brand');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.body.className = mode === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  }, [mode]);

  const gradientClasses = useMemo(() => GRADIENT_MAP[gradient], [gradient]);

  const value = useMemo(() => ({ mode, gradient, setMode, setGradient, gradientClasses }), [mode, gradient, gradientClasses]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}