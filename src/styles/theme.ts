/**
 * Theme constants for JS usage.
 * Mirror the CSS custom properties for cases where
 * you need theme values in JavaScript (e.g., Framer Motion).
 */
export const theme = {
  colors: {
    bgPrimary: '#0a0a1a',
    bgSecondary: '#1a1a2e',
    accentTeal: '#00d4aa',
    accentAmber: '#f59e0b',
    accentRed: '#ef4444',
    accentBlue: '#3b82f6',
    accentPurple: '#a855f7',
    accentGreen: '#22c55e',
    textPrimary: 'rgba(255, 255, 255, 0.95)',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textTertiary: 'rgba(255, 255, 255, 0.35)',
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  touchMin: 48,
  touchKidMin: 64,
} as const;
