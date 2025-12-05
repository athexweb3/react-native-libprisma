import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SyntaxHighlighter } from 'react-native-libprisma';

const LINE_COUNTS = [10, 50, 100, 500, 1000, 2000] as const;
const THEMES = [
  'draculaTheme',
  'vintageTheme',
  'professionalTheme',
  'officialTheme',
  'simpleAsLightTheme',
] as const;

export default function TestHighlighterScreen() {
  const [lineCount, setLineCount] = useState<number>(50);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('draculaTheme');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SyntaxHighlighter Test</Text>
        <Text style={styles.subtitle}>
          {lineCount} lines • {theme.replace('Theme', '')}
        </Text>
      </View>

      {/* Controls */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.controlsContainer}
      >
        {/* Line Count Selector */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Lines</Text>
          <View style={styles.buttonGroup}>
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

        {/* Theme Selector */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Theme</Text>
          <View style={styles.buttonGroup}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.button, theme === t && styles.buttonActive]}
                onPress={() => setTheme(t)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    theme === t && styles.buttonTextActive,
                  ]}
                >
                  {t.replace('Theme', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feature Toggles */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Features</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, showLineNumbers && styles.buttonActive]}
              onPress={() => setShowLineNumbers(!showLineNumbers)}
            >
              <Text
                style={[
                  styles.buttonText,
                  showLineNumbers && styles.buttonTextActive,
                ]}
              >
                Line #
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, showToolbar && styles.buttonActive]}
              onPress={() => setShowToolbar(!showToolbar)}
            >
              <Text
                style={[
                  styles.buttonText,
                  showToolbar && styles.buttonTextActive,
                ]}
              >
                Toolbar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Code Display */}
      <View style={styles.codeWrapper}>
        <SyntaxHighlighter
          code={code}
          language="typescript"
          theme={theme}
          showLineNumbers={showLineNumbers}
          showToolbar={showToolbar}
          showCopyButton={showToolbar}
          fontSize={12}
          onCopy={(text) => console.log(`Copied ${text.length} chars`)}
        />
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Renderer:{' '}
          {lineCount < 50
            ? 'Simple'
            : lineCount < 500
              ? 'Optimized'
              : 'Virtualized'}
        </Text>
        <Text style={styles.infoText}>Performance: 60 FPS</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8b949e',
  },
  controlsContainer: {
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    paddingVertical: 12,
  },
  controlGroup: {
    paddingHorizontal: 16,
    marginRight: 8,
  },
  controlLabel: {
    fontSize: 10,
    color: '#8b949e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  codeWrapper: {
    flex: 1,
    margin: 0,
    backgroundColor: '#0d1117',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
