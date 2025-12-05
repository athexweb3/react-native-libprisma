import { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { Token } from '../../../NativeLibprisma';
import type { PrismTheme } from '../../../themes';
import { TokenRenderer } from './TokenRenderer';

interface LineRendererProps {
  tokens: Token[];
  theme: PrismTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Renders a single line of code tokens.
 * Heavily memoized to prevent re-renders during scrolling.
 */
export const LineRenderer = memo<LineRendererProps>(
  ({ tokens, theme, fontFamily, fontSize, lineHeight }) => {
    return (
      <Text
        style={[
          styles.line,
          {
            fontFamily,
            fontSize,
            lineHeight: lineHeight ? fontSize! * lineHeight : undefined,
          },
        ]}
      >
        {tokens.map((token, index) => (
          <TokenRenderer
            key={index}
            token={token}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
          />
        ))}
      </Text>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.tokens === nextProps.tokens &&
      prevProps.theme === nextProps.theme &&
      prevProps.fontFamily === nextProps.fontFamily &&
      prevProps.fontSize === nextProps.fontSize &&
      prevProps.lineHeight === nextProps.lineHeight
    );
  }
);

LineRenderer.displayName = 'LineRenderer';

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
