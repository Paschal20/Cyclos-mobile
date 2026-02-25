/**
 * Theme Provider Component
 * Provides theme context throughout the app
 * 
 * NOTE: For most use cases, import useTheme from src/hooks/useTheme instead.
 * This provider is for wrapping the app at the root level.
 * Both approaches read from the same zustand store.
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';

// Re-export theme colors from colors.ts
export { darkColors, lightColors, ThemeColors } from './colors';

interface ThemeContextType {
  colors: ReturnType<typeof getColors>;
  isDark: boolean;
}

function getColors(isDark: boolean) {
  return isDark ? {
    background: '#0f0f1a',
    surface: '#1a1a2e',
    primary: '#e94560',
    secondary: '#16213e',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#333333',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ef4444',
  } : {
    background: '#f5f5f5',
    surface: '#ffffff',
    primary: '#e94560',
    secondary: '#f0f0f0',
    text: '#1a1a2e',
    textSecondary: '#666666',
    border: '#dddddd',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#dc2626',
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const isDark = useAppStore((s) => s.isDark);
  const colors = getColors(isDark);

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Note: Use useTheme from src/hooks/useTheme instead
// This context is only needed if you specifically need context-based theming
