/**
 * Design System Theme Configuration
 * 
 * Centralized theme tokens for consistent spacing, typography, and breakpoints
 * across the entire application. All components should use these tokens instead
 * of hardcoded values.
 */

// Spacing Scale (based on Tailwind's 4px base unit)
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '2.5rem',  // 40px
  '4xl': '3rem',    // 48px
  '5xl': '4rem',    // 64px
  '6xl': '5rem',    // 80px
} as const;

// Breakpoints (mobile-first approach)
export const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), "Tajawal", system-ui, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Border Radius Scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// Shadow Scale
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  soft: '0 24px 48px -32px hsl(var(--shadow-soft))',
} as const;

// Container Sizes
export const containerSizes = {
  sm: '640px',   // Small forms
  md: '768px',   // Medium content
  lg: '1024px',  // Large content
  xl: '1280px',  // Extra large content
  full: '100%',  // Full width
} as const;

// Layout Variants
export const layoutVariants = {
  default: 'bg-background',
  'gradient-dark': 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  'gradient-sanadgpt':
    'bg-gradient-to-b from-[#f1f4fb] via-[#f7f9fe] to-[#ffffff] text-[#102a5a]',
  'solid-light': 'bg-background',
  none: '',
} as const;

// Utility Functions
export const getSpacing = (size: keyof typeof spacing) => spacing[size];
export const getBreakpoint = (size: keyof typeof breakpoints) => breakpoints[size];
export const getContainerSize = (size: keyof typeof containerSizes) => containerSizes[size];

// Responsive Helper
export const responsive = {
  mobile: '0px',
  tablet: breakpoints.md,
  desktop: breakpoints.lg,
  wide: breakpoints.xl,
} as const;

// Touch Target Minimum Size (for mobile accessibility)
export const touchTarget = '44px';

// Export all theme tokens
export const theme = {
  spacing,
  breakpoints,
  typography,
  borderRadius,
  shadows,
  containerSizes,
  layoutVariants,
  responsive,
  touchTarget,
} as const;

export default theme;
