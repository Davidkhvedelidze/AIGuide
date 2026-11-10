export const spacing = {
  screenPadding: 20,
  touchTarget: 48,
} as const;

export const premiumTheme = {
  colors: {
    bg: '#06101A',
    bgSecondary: '#0B1724',
    cardGlass: 'rgba(15, 27, 42, 0.78)',
    tabBar: 'rgba(6, 16, 26, 0.86)',
    gold: '#D9A94E',
    goldLight: '#F2D08A',
    textPrimary: '#F7F3EA',
    textMuted: '#AEB8C5',
    cyan: '#62B6FF',
    success: '#38D996',
    border: 'rgba(255,255,255,0.08)',
    borderGlass: 'rgba(255,255,255,0.08)',
  },
  spacing: {
    screenPadding: spacing.screenPadding,
    cardPadding: 20,
    bottomTabHeight: 76,
    gap: 16,
  },
  radii: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 28,
    pill: 999,
  },
  shadows: {
    glass: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

export const colors = premiumTheme.colors;

export const copy = {
  appName: 'AI Tour Guide',
  noSecretsNotice: 'AI answers are requested through a secure backend. API keys are never stored in this app.',
} as const;
