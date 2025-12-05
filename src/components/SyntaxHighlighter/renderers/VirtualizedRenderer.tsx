import { memo, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { Token } from '../../../NativeLibprisma';
import type { PrismTheme } from '../../../themes';
import { LineRenderer } from '../components/LineRenderer';
import { calculateLineHeight } from '../utils/getOptimalRenderMode';

interface VirtualizedRendererProps {
  lines: Token[][];
  theme: PrismTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Virtualized renderer using FlatList for medium-large files (500-2000 lines).
 * Only renders visible lines for better performance.
 */
export const VirtualizedRenderer = memo<VirtualizedRendererProps>(
  ({ lines, theme, fontFamily, fontSize = 14, lineHeight = 1.5 }) => {
    const itemHeight = calculateLineHeight(fontSize, lineHeight);

    const renderItem = useCallback(
      ({ item }: { item: Token[] }) => (
        <LineRenderer
          tokens={item}
          theme={theme}
          fontFamily={fontFamily}
          fontSize={fontSize}
          lineHeight={lineHeight}
        />
      ),
      [theme, fontFamily, fontSize, lineHeight]
    );

    const keyExtractor = useCallback(
      (_: Token[], index: number) => `line-${index}`,
      []
    );

    const getItemLayout = useCallback(
      (_data: Readonly<ArrayLike<Token[]>> | undefined, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
      [itemHeight]
    );

    return (
      <FlatList
        data={lines}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={20}
        style={styles.list}
      />
    );
  }
);

VirtualizedRenderer.displayName = 'VirtualizedRenderer';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
