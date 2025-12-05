import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { Token } from '../../../NativeLibprisma';
import type { PrismTheme } from '../../../themes';
import { LineRenderer } from '../components/LineRenderer';

interface SimpleRendererProps {
  lines: Token[][];
  theme: PrismTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Simple renderer for small files (<50 lines).
 * Renders all lines at once without virtualization.
 */
export const SimpleRenderer = memo<SimpleRendererProps>(
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

SimpleRenderer.displayName = 'SimpleRenderer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
