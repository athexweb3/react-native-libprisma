import type { PrismTheme } from '../../../themes';

/**
 * Theme utility functions for creating and merging themes.
 */

/**
 * Creates a new theme by merging a base theme with overrides.
 *
 * @param base - Base theme to start from
 * @param overrides - Partial theme to override base values
 * @returns Merged theme
 */
export function createTheme(
  base: PrismTheme,
  overrides?: Partial<PrismTheme>
): PrismTheme {
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    colors: {
      ...base.colors,
      ...overrides.colors,
    },
  };
}

/**
 * Merges two themes, with theme2 taking precedence.
 *
 * @param theme1 - First theme
 * @param theme2 - Second theme (higher priority)
 * @returns Merged theme
 */
export function mergeThemes(
  theme1: PrismTheme,
  theme2: Partial<PrismTheme>
): PrismTheme {
  return createTheme(theme1, theme2);
}

/**
 * Inverts a theme's background and foreground colors.
 * Useful for creating light/dark mode variants.
 *
 * @param theme - Theme to invert
 * @returns Inverted theme
 */
export function invertTheme(theme: PrismTheme): PrismTheme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      background: theme.colors.foreground,
      foreground: theme.colors.background,
    },
  };
}
