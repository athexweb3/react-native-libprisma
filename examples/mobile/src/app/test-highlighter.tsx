import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { tokenize, themes } from 'react-native-libprisma';
import type { Language, ThemeName } from 'react-native-libprisma';

const LINE_COUNTS = [10, 50, 100, 500, 1000, 2000] as const;
const THEME_OPTIONS: ThemeName[] = [
  'draculaTheme',
  'vintageTheme',
  'professionalTheme',
  'officialTheme',
  'simpleAsLightTheme',
];

// Helper to recursively render tokens
function renderToken(
  token: any,
  index: number,
  theme: any
): React.ReactElement {
  // Get color for this token type
  let color = theme.colors.foreground; // default

  if (token.type && theme.colors[token.type]) {
    color = theme.colors[token.type];
  }

  if (typeof token.content === 'string') {
    return (
      <Text key={index} style={{ color }}>
        {token.content}
      </Text>
    );
  }

  // Recursively render nested tokens
  if (Array.isArray(token.content)) {
    return (
      <Text key={index} style={{ color }}>
        {token.content.map((t: any, i: number) => renderToken(t, i, theme))}
      </Text>
    );
  }

  return (
    <Text key={index} style={{ color }}>
      {String(token.content)}
    </Text>
  );
}

export default function TestHighlighterScreen() {
  const [lineCount, setLineCount] = useState<number>(50);
  const [themeName, setThemeName] = useState<ThemeName>('draculaTheme');

  // Generate code based on line count
  const code = useMemo(() => {
    return Array(lineCount)
      .fill(0)
      .map(
        (_, i) => `// Line ${i + 1}
export function processData${i}(input: string): number {
  const parsed = parseInt(input, 10);
  return parsed * ${i} + Math.random();
}`
      )
      .join('\n');
  }, [lineCount]);

  // Tokenize code
  const tokens = useMemo(
    () => tokenize(code, 'typescript' as Language),
    [code]
  );

  const theme = themes[themeName];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Syntax Highlighter Test</Text>
        <Text style={styles.subtitle}>
          {lineCount} lines • {themeName.replace('Theme', '')}
        </Text>
      </View>

      {/* Controls */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.controls}
        contentContainerStyle={styles.controlsContent}
      >
        {/* Line Count */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Lines</Text>
          <View style={styles.buttons}>
            {LINE_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.button,
                  lineCount === count && styles.buttonActive,
                ]}
                onPress={() => setLineCount(count)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    lineCount === count && styles.buttonTextActive,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.buttons}>
            {THEME_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.button, themeName === t && styles.buttonActive]}
                onPress={() => setThemeName(t)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    themeName === t && styles.buttonTextActive,
                  ]}
                >
                  {t.replace('Theme', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Code Display */}
      <ScrollView style={styles.codeContainer}>
        <View
          style={[
            styles.codeBlock,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            style={{
              fontFamily: 'Menlo',
              fontSize: 12,
              color: theme.colors.foreground,
              lineHeight: 18,
            }}
          >
            {tokens.map((token, i) => renderToken(token, i, theme))}
          </Text>
        </View>
      </ScrollView>

      {/* Info Bar */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Renderer:{' '}
          {lineCount < 50
            ? 'Simple'
            : lineCount < 500
              ? 'Optimized'
              : 'Virtualized'}
        </Text>
        <Text style={styles.infoText}>Tokens: {tokens.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f0f6fc',
  },
  subtitle: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 4,
  },
  controls: {
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    maxHeight: 80,
  },
  controlsContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  controlGroup: {
    marginRight: 24,
  },
  label: {
    fontSize: 10,
    color: '#8b949e',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0d1117',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  buttonActive: {
    backgroundColor: '#238636',
    borderColor: '#2ea043',
  },
  buttonText: {
    fontSize: 11,
    color: '#8b949e',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  codeContainer: {
    flex: 1,
  },
  codeBlock: {
    padding: 16,
    minHeight: '100%',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    backgroundColor: '#161b22',
  },
  infoText: {
    fontSize: 11,
    color: '#8b949e',
    fontWeight: '500',
  },
});
