import { useMemo } from 'react';
import { View, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { tokenize, themes, type Language, type ThemeName } from '../../index';
import type { PrismTheme } from '../../themes';
import { splitTokensIntoLines } from './utils/splitTokensIntoLines';
import { getOptimalRenderMode } from './utils/getOptimalRenderMode';
import { SimpleRenderer } from './renderers/SimpleRenderer';
import { OptimizedRenderer } from './renderers/OptimizedRenderer';
import { VirtualizedRenderer } from './renderers/VirtualizedRenderer';
import { DesignTokens } from './styles/designTokens';
import { Toolbar } from './components/Toolbar';
import { LineNumbers } from './components/LineNumbers';

export interface SyntaxHighlighterProps {
  /* Core */
  code: string;
  language: Language;

  /* Theme & Styling */
  theme?: ThemeName | PrismTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number | 'tight' | 'normal' | 'relaxed';
  containerStyle?: ViewStyle;
  padding?: number;

  /* Features */
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  lineNumberStyle?: TextStyle;
  lineNumberWidth?: number;
  highlightLines?: number[];

  /* Toolbar */
  showToolbar?: boolean;
  showCopyButton?: boolean;
  onCopy?: (text: string) => void;

  /* Performance */
  renderMode?: 'auto' | 'simple' | 'optimized' | 'virtualized';
}

/**
 * High-performance syntax highlighter component for React Native.
 *
 * @example
 * ```tsx
 * <SyntaxHighlighter
 *   code="const x = 42;"
 *   language="javascript"
 *   theme="dracula"
 *   showLineNumbers
 *   showCopyButton
 * />
 * ```
 */
export function SyntaxHighlighter({
  code,
  language,
  theme = 'draculaTheme',
  fontFamily = DesignTokens.typography.fontFamilies.mono,
  fontSize = DesignTokens.typography.fontSizes.md,
  lineHeight = 'normal',
  containerStyle,
  padding = DesignTokens.spacing.md,
  showLineNumbers = false,
  startingLineNumber = 1,
  lineNumberStyle,
  lineNumberWidth,
  // highlightLines = [], // TODO: Implement line highlighting
  showToolbar = false,
  showCopyButton = false,
  onCopy,
  renderMode = 'auto',
}: SyntaxHighlighterProps) {
  // Memoize tokenization (C++ call)
  const tokens = useMemo(() => tokenize(code, language), [code, language]);

  // Resolve theme
  const resolvedTheme: PrismTheme = useMemo(
    () => (typeof theme === 'string' ? themes[theme] : theme),
    [theme]
  );

  // Split into lines
  const lines = useMemo(() => splitTokensIntoLines(tokens), [tokens]);

  // Resolve line height
  const lineHeightValue =
    typeof lineHeight === 'number'
      ? lineHeight
      : DesignTokens.typography.lineHeights[lineHeight];

  // Auto-detect render mode
  const mode =
    renderMode === 'auto' ? getOptimalRenderMode(lines.length) : renderMode;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {showToolbar && (
        <Toolbar code={code} showCopyButton={showCopyButton} onCopy={onCopy} />
      )}
      <View
        style={[
          styles.container,
          {
            backgroundColor: resolvedTheme.colors.background,
            padding,
          },
        ]}
      >
        {showLineNumbers && (
          <LineNumbers
            count={lines.length}
            start={startingLineNumber}
            style={lineNumberStyle}
            width={lineNumberWidth}
            fontSize={fontSize}
            fontFamily={fontFamily}
            backgroundColor={resolvedTheme.colors.background}
          />
        )}
        <View style={styles.codeContainer}>
          {mode === 'simple' && (
            <SimpleRenderer
              lines={lines}
              theme={resolvedTheme}
              fontFamily={fontFamily}
              fontSize={fontSize}
              lineHeight={lineHeightValue}
            />
          )}
          {mode === 'optimized' && (
            <OptimizedRenderer
              lines={lines}
              theme={resolvedTheme}
              fontFamily={fontFamily}
              fontSize={fontSize}
              lineHeight={lineHeightValue}
            />
          )}
          {mode === 'virtualized' && (
            <VirtualizedRenderer
              lines={lines}
              theme={resolvedTheme}
              fontFamily={fontFamily}
              fontSize={fontSize}
              lineHeight={lineHeightValue}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  container: {
    flexDirection: 'row',
  },
  codeContainer: {
    flex: 1,
  },
});
