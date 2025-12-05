import type { Token } from '../../../NativeLibprisma';

/**
 * Splits an array of tokens into lines based on newline characters.
 * Handles nested token structures recursively.
 *
 * @param tokens - Array of tokens from tokenize()
 * @returns Array of token arrays, one per line
 */
export function splitTokensIntoLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [];
  let currentLine: Token[] = [];

  const processToken = (token: Token) => {
    if (typeof token.content === 'string') {
      const parts = token.content.split('\n');

      parts.forEach((part, index) => {
        if (index > 0) {
          // Push current line and start new one on newline
          lines.push(currentLine);
          currentLine = [];
        }

        if (part) {
          // Add non-empty content to current line
          currentLine.push({ ...token, content: part });
        }
      });
    } else {
      // Recursively process nested tokens
      token.content.forEach(processToken);
    }
  };

  tokens.forEach(processToken);

  // Push final line if it has content
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
