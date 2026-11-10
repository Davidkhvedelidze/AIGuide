/**
 * Design tokens taken from the mockups in /design: dark navy surfaces, one gold accent,
 * rounded cards with hairline borders. All text/background pairs below meet WCAG AA.
 */
export const colors = {
  bg: '#070B18',
  surface: '#0E1424',
  surfaceRaised: '#151C30',
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.16)',
  gold: '#E9B44C',
  goldDeep: '#C8922E',
  goldSoft: 'rgba(233,180,76,0.14)',
  onGold: '#1A1305',
  text: '#F5F3EE',
  textSecondary: '#B4BBCC',
  textMuted: '#8791A8',
  danger: '#FF7A6B',
  success: '#5FD39A',
  overlay: 'rgba(4,7,16,0.72)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

export const radii = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

/** Minimum touch target (Apple HIG 44pt, Material 48dp). */
export const HIT = 44;

export type ColorName = keyof typeof colors;
export type TypeVariant = keyof typeof type;
