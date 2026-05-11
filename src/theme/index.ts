export const colors = {
  // Backgrounds
  bg: '#09090F',
  surface: '#0F0F18',
  card: '#16161F',
  cardAlt: '#1C1C28',
  border: '#252535',
  borderSubtle: '#1A1A28',

  // Accent / Brand
  accent: '#7C3AED',
  accentLight: '#A374F8',
  accentDark: '#5B21B6',
  accentGlow: 'rgba(124,58,237,0.25)',

  // Secondary accents
  pink: '#EC4899',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
  orange: '#F97316',

  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#44445A',

  // Overlays
  overlay: 'rgba(9,9,15,0.7)',
  overlayLight: 'rgba(22,22,31,0.85)',

  white: '#FFFFFF',
  transparent: 'transparent',
};

export const gradients = {
  accent: ['#7C3AED', '#A855F7'] as const,
  accentPink: ['#7C3AED', '#EC4899'] as const,
  dark: ['#09090F', '#16161F'] as const,
  cardGlow: ['rgba(124,58,237,0.4)', 'rgba(168,85,247,0.1)'] as const,
  nowPlaying: ['#0D0D18', '#1A0A2E', '#0D0D18'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,

  // Weights (as string literals for RN)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadow = {
  card: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
};
