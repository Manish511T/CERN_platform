// Single source of truth for all design tokens
// Every color, spacing decision references this file

export const COLORS = {
  // Primary — medical blue (trust, calm, professional)
  primary: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Success — soft green (safe, resolved)
  success: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Danger — emergency red (SOS, alerts)
  danger: {
    50:  '#fff1f2',
    100: '#ffe4e6',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Warning — amber
  warning: {
    50:  '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Neutral — grays
  neutral: {
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
}

export const EMERGENCY_COLORS = {
  accident:   { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  cardiac:    { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  snake_bite: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  rabies:     { bg: '#ede9fe', text: '#4c1d95', dot: '#8b5cf6' },
  other:      { bg: '#e0f2fe', text: '#075985', dot: '#0ea5e9' },
}