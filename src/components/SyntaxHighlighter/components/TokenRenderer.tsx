import { memo } from 'react';
import { Text } from 'react-native';
import type { Token } from '../../../NativeLibprisma';
import type { PrismTheme } from '../../../themes';
import { getTokenColor } from '../../../utils';

interface TokenRendererProps {
  token: Token;
  theme: PrismTheme;
  fontFamily?: string;
  fontSize?: number;
}

/**
 * Recursively renders a token and its nested content.
 * Memoized to prevent unnecessary re-renders.
 */
export const TokenRenderer = memo<TokenRendererProps>(
  ({ token, theme, fontFamily, fontSize }) => {
    const color = getTokenColor(token, theme);

    if (typeof token.content === 'string') {
      return (
        <Text
          style={{
            color,
            fontFamily,
            fontSize,
          }}
        >
          {token.content}
        </Text>
      );
    }

    // Recursively render nested tokens
    return (
      <>
        {token.content.map((nestedToken, index) => (
          <TokenRenderer
            key={index}
            token={nestedToken}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
          />
        ))}
      </>
    );
  }
);

TokenRenderer.displayName = 'TokenRenderer';
