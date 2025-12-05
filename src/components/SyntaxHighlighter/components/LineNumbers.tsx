import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { DesignTokens } from '../styles/designTokens';

interface LineNumbersProps {
  count: number;
  start?: number;
  style?: TextStyle;
  width?: number;
  padding?: number;
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * Renders line numbers for the syntax highlighter.
 * Memoized to prevent re-renders.
 */
export const LineNumbers = memo<LineNumbersProps>(
  ({
    count,
    start = 1,
    style,
    width = 40,
    padding = DesignTokens.spacing.sm,
    backgroundColor = '#1a1a1a',
    inactiveColor = '#444',
    fontSize = DesignTokens.typography.fontSizes.sm,
    fontFamily = DesignTokens.typography.fontFamilies.mono,
  }) => {
    const lines = Array.from({ length: count }, (_, i) => start + i);

    return (
      <View
        style={[
          styles.container,
          {
            width,
            backgroundColor,
            paddingHorizontal: padding,
          },
        ]}
      >
        {lines.map((lineNum) => (
          <Text
            key={lineNum}
            style={[
              styles.lineNumber,
              {
                color: inactiveColor,
                fontSize,
                fontFamily,
              },
              style,
            ]}
          >
            {lineNum}
          </Text>
        ))}
      </View>
    );
  }
);

LineNumbers.displayName = 'LineNumbers';

const styles = StyleSheet.create({
  container: {
    paddingTop: DesignTokens.spacing.sm,
    paddingBottom: DesignTokens.spacing.sm,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  lineNumber: {
    textAlign: 'right',
    opacity: 0.7,
  },
});
