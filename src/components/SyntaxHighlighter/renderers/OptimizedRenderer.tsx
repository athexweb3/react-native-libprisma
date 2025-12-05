import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { Token } from '../../../NativeLibprisma';
import type { PrismTheme } from '../../../themes';
import { LineRenderer } from '../components/LineRenderer';

interface OptimizedRendererProps {
  lines: Token[][];
  theme: PrismTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Optimized renderer for medium files (50-500 lines).
 * Uses memoization to prevent re-renders.
 */
export const OptimizedRenderer = memo<OptimizedRendererProps>(
  ({ lines, theme, fontFamily, fontSize, lineHeight }) => {
    return (
      <View style={styles.container}>
        {lines.map((lineTokens, index) => (
          <LineRenderer
            key={index}
            tokens={lineTokens}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineHeight={lineHeight}
          />
        ))}
      </View>
    );
  }
);

OptimizedRenderer.displayName = 'OptimizedRenderer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
