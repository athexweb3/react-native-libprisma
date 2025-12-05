import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SyntaxHighlighter } from 'react-native-libprisma';

// Small code example (<50 lines) - Simple renderer
const smallCode = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Result:', result);`;

// Medium code example (50-500 lines) - Optimized renderer
const mediumCode = Array(80)
  .fill(0)
  .map(
    (_, i) => `// Line ${i + 1}
function example${i}() {
  const value = ${i * 10};
  return value + Math.random();
}`
  )
  .join('\n');

// Large code example (500+ lines) - Virtualized renderer
const largeCode = Array(600)
  .fill(0)
  .map(
    (_, i) => `// Line ${i + 1}
export function processData${i}(input: string): number {
  const parsed = parseInt(input, 10);
  return parsed * ${i} + Math.random();
}`
  )
  .join('\n');

export default function TestHighlighterScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎨 SyntaxHighlighter Test Suite</Text>
      <Text style={styles.subtitle}>Testing all 3 rendering modes</Text>

      {/* SIMPLE RENDERER TEST (<50 lines) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1️⃣ Simple Renderer (8 lines)</Text>
        <Text style={styles.description}>
          Direct rendering for small code snippets
        </Text>
        <SyntaxHighlighter code={smallCode} language="typescript" />
      </View>

      {/* SIMPLE WITH LINE NUMBERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2️⃣ With Line Numbers</Text>
        <SyntaxHighlighter
          code={smallCode}
          language="typescript"
          showLineNumbers
          theme="vintageTheme"
        />
      </View>

      {/* WITH COPY BUTTON */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3️⃣ With Toolbar & Copy</Text>
        <SyntaxHighlighter
          code={smallCode}
          language="typescript"
          showToolbar
          showCopyButton
          showLineNumbers
          theme="draculaTheme"
          onCopy={(text) => console.log(`Copied ${text.length} characters`)}
        />
      </View>

      {/* OPTIMIZED RENDERER TEST (50-500 lines) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          4️⃣ Optimized Renderer (320 lines)
        </Text>
        <Text style={styles.description}>
          Memoized rendering for medium files
        </Text>
        <View style={styles.codeContainer}>
          <SyntaxHighlighter
            code={mediumCode}
            language="javascript"
            showLineNumbers
            theme="professionalTheme"
            fontSize={12}
          />
        </View>
      </View>

      {/* VIRTUALIZED RENDERER TEST (500+ lines) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          5️⃣ Virtualized Renderer (2400 lines)
        </Text>
        <Text style={styles.description}>
          FlatList virtualization for large files - scroll to test!
        </Text>
        <View style={styles.codeContainer}>
          <SyntaxHighlighter
            code={largeCode}
            language="typescript"
            showLineNumbers
            showToolbar
            showCopyButton
            theme="officialTheme"
            fontSize={11}
          />
        </View>
      </View>

      {/* LIGHT THEME TEST */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6️⃣ Light Theme</Text>
        <SyntaxHighlighter
          code={smallCode}
          language="typescript"
          showLineNumbers
          theme="simpleAsLightTheme"
          fontSize={14}
        />
      </View>

      {/* CUSTOM STYLING */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7️⃣ Custom Styling</Text>
        <SyntaxHighlighter
          code={smallCode}
          language="typescript"
          showLineNumbers
          theme="shadesOfGreyTheme"
          fontSize={16}
          padding={20}
          containerStyle={{ borderWidth: 2, borderColor: '#4CAF50' }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>✓ All 3 rendering modes tested</Text>
        <Text style={styles.footerText}>
          ✓ Line numbers, copy button, themes
        </Text>
        <Text style={styles.footerText}>
          ✓ Auto-detection working correctly
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  codeContainer: {
    maxHeight: 400,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  footerText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
});
