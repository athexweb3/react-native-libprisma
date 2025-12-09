import type { Token } from '../types';
import type { PrismTheme } from './themes';

/**
 * Gets the color for a token based on its type and alias.
 * Falls back to the theme's foreground color if no specific color is found.
 *
 * @param token - The token to get color for
 * @param theme - The theme to use
 * @returns The hex color string
 *
 * @example
 * ```ts
 * const color = getTokenColor(token, themes.peaceOfEyeTheme);
 * ```
 */
export function getTokenColor(token: Token, theme: PrismTheme): string {
  const tokenType = token.alias || token.type;
  return theme.colors[tokenType] || theme.colors.foreground;
}

/**
 * Gets the style properties for a token including color and optional font weight.
 *
 * @param token - The token to get style for
 * @param theme - The theme to use
 * @param options - Optional styling options
 * @returns Style object suitable for React Native Text component
 *
 * @example
 * ```tsx
 * const style = getTokenStyle(token, theme, { boldKeywords: true });
 * <Text style={style}>{token.content}</Text>
 * ```
 */
export function getTokenStyle(
  token: Token,
  theme: PrismTheme,
  options?: {
    /**
     * Apply bold font weight to keywords and functions
     * @default false
     */
    boldKeywords?: boolean;
    /**
     * Apply italic font style to comments
     * @default false
     */
    italicComments?: boolean;
    /**
     * Custom font family
     */
    fontFamily?: string;
  }
): {
  color: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
} {
  const color = getTokenColor(token, theme);
  const tokenType = token.alias || token.type;

  const style: ReturnType<typeof getTokenStyle> = { color };

  if (options?.boldKeywords && ['keyword', 'function'].includes(tokenType)) {
    style.fontWeight = 'bold';
  }

  if (options?.italicComments && tokenType === 'comment') {
    style.fontStyle = 'italic';
  }

  if (options?.fontFamily) {
    style.fontFamily = options.fontFamily;
  }

  return style;
}

/**
 * Checks if a token has nested content (i.e., content is an array of tokens).
 *
 * @param token - The token to check
 * @returns True if the token has nested content
 *
 * @example
 * ```ts
 * if (isNestedToken(token)) {
 *   // Recursively render nested tokens
 * }
 * ```
 */
export function isNestedToken(
  token: Token
): token is Token & { content: Token[] } {
  return Array.isArray(token.content);
}

/**
 * Flattens a token tree into a flat array of tokens with string content only.
 * Useful for extracting plain text from tokenized code.
 *
 * @param tokens - Array of tokens to flatten
 * @returns Flat array of tokens with string content
 *
 * @example
 * ```ts
 * const flatTokens = flattenTokens(tokens);
 * const plainText = flatTokens.map(t => t.content).join('');
 * ```
 */
export function flattenTokens(
  tokens: Token[]
): Array<Token & { content: string }> {
  const result: Array<Token & { content: string }> = [];

  function flatten(token: Token) {
    if (typeof token.content === 'string') {
      result.push(token as Token & { content: string });
    } else {
      token.content.forEach(flatten);
    }
  }

  tokens.forEach(flatten);
  return result;
}

/**
 * Extracts plain text from tokenized code.
 *
 * @param tokens - Array of tokens
 * @returns Plain text string
 *
 * @example
 * ```ts
 * const plainText = getPlainText(tokens);
 * console.log(plainText); // "const x = 42;"
 * ```
 */
export function getPlainText(tokens: Token[]): string {
  return flattenTokens(tokens)
    .map((t) => t.content)
    .join('');
}

/**
 * Gets all unique token types from a token array.
 * Useful for understanding what token types are present in code.
 *
 * @param tokens - Array of tokens
 * @returns Array of unique token type strings
 *
 * @example
 * ```ts
 * const types = getTokenTypes(tokens);
 * console.log(types); // ['keyword', 'string', 'punctuation', ...]
 * ```
 */
export function getTokenTypes(tokens: Token[]): string[] {
  const types = new Set<string>();

  function collectTypes(token: Token) {
    types.add(token.type);
    if (token.alias) {
      types.add(token.alias);
    }

    if (Array.isArray(token.content)) {
      token.content.forEach(collectTypes);
    }
  }

  tokens.forEach(collectTypes);
  return Array.from(types);
}

/**
 * Counts the total number of tokens in a token tree.
 *
 * @param tokens - Array of tokens
 * @returns Total count of tokens including nested ones
 *
 * @example
 * ```ts
 * const count = countTokens(tokens);
 * console.log(`Total tokens: ${count}`);
 * ```
 */
export function countTokens(tokens: Token[]): number {
  let count = 0;

  function countToken(token: Token) {
    count++;
    if (Array.isArray(token.content)) {
      token.content.forEach(countToken);
    }
  }

  tokens.forEach(countToken);
  return count;
}
