// Studio Hub Elite - Luxury Hot Tones Theme
// Premium dark theme with warm accent colors

export const colors = {
  // Base - Deep blacks and grays
  background: {
    primary: '#0a0a0a',
    secondary: '#121212',
    tertiary: '#1a1a1a',
    card: '#1e1e1e',
    elevated: '#252525',
  },
  
  // Text - Hierarchy
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    tertiary: '#666666',
    muted: '#404040',
    inverse: '#0a0a0a',
  },
  
  // Hot Accent Colors - Luxury warm tones
  accent: {
    primary: '#DC2626',      // Rich red
    secondary: '#F59E0B',    // Warm gold/amber
    tertiary: '#F43F5E',     // Rose
    highlight: '#FCD34D',    // Light gold
    ember: '#B91C1C',        // Deep red
    flame: '#EF4444',        // Bright red
    sunset: '#FB923C',       // Orange
    rose: '#FB7185',         // Light rose
  },
  
  // Status Colors
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
  },
  
  // Borders
  border: {
    default: '#2a2a2a',
    subtle: '#1f1f1f',
    accent: 'rgba(220, 38, 38, 0.3)',
  },
  
  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Gradients
  gradient: {
    primary: ['#DC2626', '#B91C1C'],
    gold: ['#F59E0B', '#D97706'],
    fire: ['#EF4444', '#F59E0B'],
    sunset: ['#F43F5E', '#FB923C'],
    dark: ['#1a1a1a', '#0a0a0a'],
  },
  
  // Rarity colors for badges
  rarity: {
    common: '#a0a0a0',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
