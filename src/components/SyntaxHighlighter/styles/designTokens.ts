import { Platform } from 'react-native';

/**
 * Design token system for consistent styling across the SyntaxHighlighter component.
 * Following a token-based approach for scalability and maintainability.
 */

export const DesignTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  typography: {
    fontSizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
    },
    fontFamilies: {
      mono: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'Courier New',
      }),
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },

  colors: {
    overlays: {
      highlight: 'rgba(255, 255, 255, 0.1)',
      selection: 'rgba(100, 150, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.05)',
    },
  },

  borders: {
    radius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
    widths: {
      thin: 1,
      medium: 2,
      thick: 4,
    },
  },
} as const;

export type SpacingToken = keyof typeof DesignTokens.spacing;
export type FontSizeToken = keyof typeof DesignTokens.typography.fontSizes;
export type LineHeightToken = keyof typeof DesignTokens.typography.lineHeights;
export type BorderRadiusToken = keyof typeof DesignTokens.borders.radius;
